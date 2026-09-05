import uuid
import json
import hmac
import hashlib
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.proof_of_work_repository import ProofOfWorkRepository
from app.services.proof_of_work_service import ProofOfWorkService
from app.services.state_engine import StateEngine

client = TestClient(app)

@pytest.fixture
def clean_repos():
    action_item_repo = ActionItemRepository()
    proof_of_work_repo = ProofOfWorkRepository()
    # Reset in-memory dictionaries for test isolation
    action_item_repo._in_memory_items.clear()
    action_item_repo._in_memory_history.clear()
    proof_of_work_repo._in_memory_pow.clear()
    return action_item_repo, proof_of_work_repo


def test_explicit_lk104_pr_match(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    # Create active candidate action item with LK-104 in title
    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="[LK-104] Implement payment gateway endpoint",
        status="pending"
    )

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 402,
            "title": "feat: implement payment gateway endpoint (LK-104)",
            "body": "Fixes payment endpoint logic.",
            "html_url": "https://github.com/VALIXIS/LoopKeeper/pull/402",
            "user": {"login": "vignesh", "email": "vignesh@valixis.com"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)

    assert result["received"] is True
    assert result["matched"] is True
    assert result["action_item_id"] == str(item["id"])
    assert result["resolution_method"] == "explicit_key"
    assert result["similarity_score"] is None

    # Verify state transition to done
    updated_item = action_item_repo.get_action_item(item["id"])
    assert updated_item["status"] == "done"

    # Verify audit history
    history = action_item_repo.get_history(item["id"])
    completed_events = [h for h in history if h.get("event_type") == "completed"]
    assert len(completed_events) == 1

    # Verify proof-of-work evidence recorded
    pow_records = proof_of_work_repo.get_by_action_item_id(item["id"])
    assert len(pow_records) == 1
    assert pow_records[0]["pr_number"] == 402
    assert pow_records[0]["resolution_method"] == "explicit_key"


def test_semantic_match_above_threshold(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="Implement payment API timeout and retry handling",
        status="pending"
    )

    # Mock embedding provider to return controlled high similarity (1.0)
    mock_embedding_provider = MagicMock()
    mock_embedding_provider.generate_embedding.return_value = [0.5] * 1536

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo,
        embedding_provider=mock_embedding_provider
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 403,
            "title": "Fix payment gateway checkout timeout",
            "body": "Implements retries and timeout logic for checkout.",
            "html_url": "https://github.com/VALIXIS/LoopKeeper/pull/403",
            "user": {"login": "vignesh"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)

    assert result["received"] is True
    assert result["matched"] is True
    assert result["action_item_id"] == str(item["id"])
    assert result["resolution_method"] == "vector_similarity"
    assert result["similarity_score"] >= 0.80

    updated_item = action_item_repo.get_action_item(item["id"])
    assert updated_item["status"] == "done"


def test_semantic_match_below_threshold(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="Implement payment API timeout",
        status="pending"
    )

    # Mock embedding provider to return low similarity vector (orthogonal vectors)
    mock_embedding_provider = MagicMock()
    # First call for PR text, second call for candidate task
    mock_embedding_provider.generate_embedding.side_effect = [
        [1.0] + [0.0] * 1535,
        [0.0, 1.0] + [0.0] * 1534
    ]

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo,
        embedding_provider=mock_embedding_provider
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 404,
            "title": "Update README alignment CSS",
            "body": "Unrelated documentation change",
            "html_url": "https://github.com/VALIXIS/LoopKeeper/pull/404",
            "user": {"login": "dev"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)

    assert result["received"] is True
    assert result["matched"] is False

    # Action item must remain unchanged
    updated_item = action_item_repo.get_action_item(item["id"])
    assert updated_item["status"] == "pending"
    assert len(proof_of_work_repo.get_by_action_item_id(item["id"])) == 0


def test_invalid_github_signature():
    original_secret = settings.GITHUB_WEBHOOK_SECRET
    settings.GITHUB_WEBHOOK_SECRET = "test_secret_key"
    try:
        body = json.dumps({"action": "opened", "pull_request": {}}).encode("utf-8")
        headers = {
            "X-GitHub-Event": "pull_request",
            "X-Hub-Signature-256": "sha256=invalid_hex_signature"
        }
        response = client.post("/api/v1/integrations/github/webhook", content=body, headers=headers)
        assert response.status_code == 401
        assert "Invalid GitHub webhook signature" in response.json()["detail"]
    finally:
        settings.GITHUB_WEBHOOK_SECRET = original_secret


def test_duplicate_pr_opened_idempotency(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="[LK-105] Refactor database connection pool",
        status="pending"
    )

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 501,
            "title": "refactor: db pool optimization (LK-105)",
            "body": "Refactors pool settings",
            "html_url": "https://github.com/VALIXIS/LoopKeeper/pull/501",
            "user": {"login": "alice"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    # First webhook call
    res1 = pow_service.process_github_pr_opened(payload)
    assert res1["matched"] is True
    assert res1.get("already_processed") is not True

    # Duplicate second webhook call
    res2 = pow_service.process_github_pr_opened(payload)
    assert res2["matched"] is True
    assert res2["already_processed"] is True

    # Ensure only ONE history event and ONE proof-of-work record exist
    history = action_item_repo.get_history(item["id"])
    completed_events = [h for h in history if h.get("event_type") == "completed"]
    assert len(completed_events) == 1
    assert len(proof_of_work_repo.get_by_action_item_id(item["id"])) == 1


def test_already_completed_action_item(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="[LK-106] Already done task",
        status="done"
    )

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 601,
            "title": "feat: finish task (LK-106)",
            "body": "PR description",
            "user": {"login": "bob"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)
    # Task was already done, so active candidate query filters it out
    assert result["received"] is True
    assert result["matched"] is False


def test_unmatched_pr_acknowledgment(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 701,
            "title": "Documentation typo fix",
            "body": "Fix typo in comment",
            "user": {"login": "contributor"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)
    assert result["received"] is True
    assert result["matched"] is False


def test_only_pull_request_opened_triggers(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "synchronize",
        "pull_request": {"number": 801, "title": "Commit push to PR"}
    }

    result = pow_service.process_github_pr_opened(payload)
    assert result["received"] is True
    assert result["processed"] is False
    assert "Only 'opened' triggers auto-resolution" in result["reason"]


def test_pr_merged_or_closed_ignored(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    payload = {
        "action": "closed",
        "pull_request": {"number": 901, "title": "Merged PR", "merged": True}
    }

    result = pow_service.process_github_pr_opened(payload)
    assert result["received"] is True
    assert result["processed"] is False


def test_concurrent_duplicate_webhook_safety(clean_repos):
    action_item_repo, proof_of_work_repo = clean_repos
    meeting_id = uuid.uuid4()

    item = action_item_repo.create_action_item(
        meeting_id=meeting_id,
        title="[LK-107] Race condition safety task",
        status="pending"
    )

    pow_service = ProofOfWorkService(
        action_item_repo=action_item_repo,
        proof_of_work_repo=proof_of_work_repo
    )

    # Mock proof_of_work_repo.create_proof_of_work to return None as if DB unique constraint was hit
    proof_of_work_repo.create_proof_of_work = MagicMock(return_value=None)

    payload = {
        "action": "opened",
        "pull_request": {
            "number": 999,
            "title": "feat: race condition test (LK-107)",
            "body": "Body",
            "user": {"login": "test"}
        },
        "repository": {"full_name": "VALIXIS/LoopKeeper"}
    }

    result = pow_service.process_github_pr_opened(payload)
    assert result["received"] is True
    assert result["matched"] is True
    assert result["already_processed"] is True
