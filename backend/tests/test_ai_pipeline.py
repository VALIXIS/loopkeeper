import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from app.ai.extraction import SLMProvider, FallbackLLMProvider
from app.ai.confidence import ConfidenceEvaluator
from app.ai.fallback import FallbackHandler
from app.ai.embeddings import DeterministicEmbeddingProvider
from app.ai.matching import TaskMatchingEngine
from app.ai.pipeline import AIPipelineOrchestrator
from app.services.state_engine import StateEngine
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.ai_repository import AIRepository
from app.repositories.valixis_repository import ValixisRepository
from app.schemas.ai import ExtractedActionItem

# 1. Action extraction schema validation
def test_action_extraction_schema_validation():
    slm = SLMProvider()
    res = slm.extract_action_items("TODO: Fix login bug assigned to Alice by Friday.")
    assert res.action_items is not None
    assert len(res.action_items) > 0
    item = res.action_items[0]
    assert isinstance(item, ExtractedActionItem)
    assert item.title != ""
    assert item.status == "pending"

# 2. Missing owner handling
def test_missing_owner_default():
    slm = SLMProvider()
    res = slm.extract_action_items("Action Item: Review database indexes.")
    assert len(res.action_items) > 0
    assert res.action_items[0].owner_name == "Unassigned"

# 3. Missing deadline handling
def test_missing_deadline_default():
    slm = SLMProvider()
    res = slm.extract_action_items("TODO: Write API docs assigned to Bob.")
    assert len(res.action_items) > 0
    assert res.action_items[0].deadline == "Not specified"

# 4. Semantic task matching
def test_semantic_task_matching():
    matching_engine = TaskMatchingEngine()
    item = ExtractedActionItem(
        title="Refactor auth service",
        description="Refactor auth service for OAuth2",
        owner_name="Alice Johnson",
        status="pending"
    )
    embedding = matching_engine.embedding_provider.generate_embedding(item.title)
    
    existing = [{
        "id": uuid4(),
        "title": "Refactor auth service",
        "owner_name": "Alice Johnson",
        "embedding": embedding
    }]
    
    decision = matching_engine.match_action_item(item, embedding, existing_action_items=existing)
    assert decision.decision == "matched"
    assert decision.matched_action_item_id == existing[0]["id"]

# 5. Same task with different wording
def test_same_task_different_wording():
    matching_engine = TaskMatchingEngine()
    item = ExtractedActionItem(
        title="Fix authentication login bug",
        description="Fix authentication login bug in backend",
        owner_name="Alice Johnson"
    )

    # Similar task with slightly different wording
    emb1 = matching_engine.embedding_provider.generate_embedding("Fix authentication login bug")
    existing_item = {
        "id": uuid4(),
        "title": "Fix authentication login bug",
        "owner_name": "Alice Johnson",
        "embedding": emb1
    }
    
    emb2 = matching_engine.embedding_provider.generate_embedding("Fix login authentication issue")
    decision = matching_engine.match_action_item(item, emb2, existing_action_items=[existing_item])
    assert decision.decision in ["matched", "uncertain"]

# 6. New task detection
def test_new_task_detection():
    matching_engine = TaskMatchingEngine()
    item = ExtractedActionItem(
        title="Deploy Kubernetes cluster",
        description="Deploy new k8s cluster",
        owner_name="Charlie"
    )
    emb = matching_engine.embedding_provider.generate_embedding("Deploy Kubernetes cluster")
    
    existing = [{
        "id": uuid4(),
        "title": "Clean up temporary S3 files",
        "owner_name": "Bob",
        "embedding": matching_engine.embedding_provider.generate_embedding("Clean up temporary S3 files")
    }]
    
    decision = matching_engine.match_action_item(item, emb, existing_action_items=existing)
    assert decision.decision == "new"

# 7. Repeated postponement
def test_repeated_postponement():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    m_id = uuid4()
    item = repo.create_action_item(meeting_id=m_id, title="Database migration")
    
    # First postponement
    d1 = datetime.utcnow() + timedelta(days=2)
    engine.change_deadline(item["id"], m_id, d1)
    assert not engine.is_repeatedly_postponed(item["id"])
    
    # Second postponement
    d2 = datetime.utcnow() + timedelta(days=5)
    engine.change_deadline(item["id"], m_id, d2)
    assert engine.is_repeatedly_postponed(item["id"])

# 8. State transitions
def test_state_transitions():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    m_id = uuid4()
    item = repo.create_action_item(meeting_id=m_id, title="Implement unit tests")
    
    assert item["status"] == "pending"
    
    # Transition to done
    updated = engine.transition_state(item["id"], m_id, "done")
    assert updated["status"] == "done"
    
    history = repo.get_history(item["id"])
    events = [h["event_type"] for h in history]
    assert "completed" in events

# 9. SLM failure -> fallback
def test_slm_failure_triggers_fallback():
    failing_slm = SLMProvider(force_failure=True)
    fallback_llm = FallbackLLMProvider()
    handler = FallbackHandler(slm_provider=failing_slm, fallback_provider=fallback_llm)
    
    res = handler.process("TODO: Deploy application to staging assigned to Bob.")
    assert res.fallback_used is True
    assert res.provider_used == "fallback_llm"

# 10. AI run logging
def test_ai_run_logging():
    ai_repo = AIRepository()
    record = ai_repo.log_ai_run(
        meeting_id=uuid4(),
        model_name="loopkeeper-slm-v1",
        provider="slm",
        success=True,
        confidence=0.88,
        latency_ms=120
    )
    assert record["id"] is not None
    assert record["model_name"] == "loopkeeper-slm-v1"
    assert len(ai_repo.list_ai_runs()) == 1

# 11. VALIXIS read-only access boundary
def test_valixis_read_only_boundary():
    valixis_repo = ValixisRepository()
    emp = valixis_repo.get_employee_by_name("Adithya")
    assert emp is not None
    assert "id" in emp
    assert "name" in emp
    
    # Verify write methods do NOT exist on ValixisRepository
    assert not hasattr(valixis_repo, "create_employee")
    assert not hasattr(valixis_repo, "delete_task")

# 12. Regression test: Owner extraction with preambles and verb guards
def test_owner_extraction_preambles_and_verb_guards():
    slm = SLMProvider()
    
    # Preamble clause: "Regarding analytics, Rohan will finish..."
    res1 = slm.extract_action_items("Regarding the analytics module, Rohan will finish the API integration by Friday.")
    assert len(res1.action_items) > 0
    assert res1.action_items[0].owner_name == "Rohan"
    
    # Verb guard: "for migrating the database" should NOT extract "migrating" as owner
    res2 = slm.extract_action_items("Action Item for migrating the database by next Monday.")
    assert len(res2.action_items) > 0
    assert res2.action_items[0].owner_name == "Unassigned"

    # Proper name with 'for': "Action item for Alice by next Monday."
    res3 = slm.extract_action_items("Action item for Alice by next Monday.")
    assert len(res3.action_items) > 0
    assert res3.action_items[0].owner_name == "Alice"

# 13. Regression test: Deadline extraction before phrases and leading 'to ' cleaning
def test_deadline_extraction_before_and_leading_to():
    slm = SLMProvider()
    
    # Before phrase
    res1 = slm.extract_action_items("TODO: Fix login bug assigned to Bob before the end of the week.")
    assert len(res1.action_items) > 0
    assert "the end of the week" in res1.action_items[0].deadline or "before" in res1.action_items[0].deadline or "end of the week" in res1.action_items[0].deadline

    # Leading 'to ' string cleaning
    res2 = slm.extract_action_items("Pushing to next Tuesday for database migration assigned to Charlie.")
    assert len(res2.action_items) > 0
    assert res2.action_items[0].deadline == "next Tuesday"

# 14. Heuristic embedding provider fallback labeling
def test_heuristic_embedding_provider_labeling():
    from app.ai.embeddings import HeuristicDenseEmbeddingProvider, SemanticDenseEmbeddingProvider
    provider = HeuristicDenseEmbeddingProvider()
    assert provider.dimension == 1536
    vec = provider.generate_embedding("database pool timeout")
    assert len(vec) == 1536
    assert SemanticDenseEmbeddingProvider is HeuristicDenseEmbeddingProvider

# 15. Pipeline deadline tracking: Later deadline triggers postponement
def test_pipeline_deadline_later_triggers_postponement():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    orchestrator = AIPipelineOrchestrator(action_item_repo=repo, state_engine=engine)
    m_id = uuid4()
    
    m1_date = datetime.utcnow()
    initial_deadline = m1_date + timedelta(days=2)
    item = repo.create_action_item(
        meeting_id=m_id,
        title="Refactor API endpoints",
        deadline=initial_deadline
    )
    
    t_text = "Refactor API endpoints assigned to Alice. Move to Friday."
    processed = orchestrator.process_transcript(m_id, t_text)
    
    assert len(processed) > 0
    updated_item = repo.get_action_item(item["id"])
    assert updated_item["deadline"] > initial_deadline
    
    history = repo.get_history(item["id"])
    event_types = [h["event_type"] for h in history]
    assert "postponed" in event_types

# 16. Pipeline deadline tracking: Same deadline logs updated (no postponement)
def test_pipeline_same_deadline_no_postponement():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    orchestrator = AIPipelineOrchestrator(action_item_repo=repo, state_engine=engine)
    m_id = uuid4()
    
    m1_date = datetime(2026, 9, 7, 10, 0)
    initial_deadline = datetime(2026, 9, 11, 17, 0)
    item = repo.create_action_item(
        meeting_id=m_id,
        title="Write integration tests",
        deadline=initial_deadline
    )
    
    orchestrator.meeting_repo.create_meeting(title="Sync", meeting_date=m1_date)
    m_record = orchestrator.meeting_repo.list_meetings()[-1]
    
    t_text = "Write integration tests assigned to Bob by Friday."
    orchestrator.process_transcript(m_record["id"], t_text)
    
    history = repo.get_history(item["id"])
    event_types = [h["event_type"] for h in history]
    assert "postponed" not in event_types

# 17. Pipeline deadline tracking: Earlier deadline logs deadline_changed (not postponed)
def test_pipeline_earlier_deadline_changed_event():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    orchestrator = AIPipelineOrchestrator(action_item_repo=repo, state_engine=engine)
    m_id = uuid4()
    
    m1_date = datetime(2026, 9, 7, 10, 0)
    initial_deadline = datetime(2026, 9, 14, 17, 0)
    item = repo.create_action_item(
        meeting_id=m_id,
        title="Deploy container cluster",
        deadline=initial_deadline
    )
    
    m2 = orchestrator.meeting_repo.create_meeting(title="Emergency Sync", meeting_date=m1_date)
    t_text = "Deploy container cluster assigned to Charlie. Move to Wednesday."
    orchestrator.process_transcript(m2["id"], t_text)
    
    updated_item = repo.get_action_item(item["id"])
    assert updated_item["deadline"] < initial_deadline
    
    history = repo.get_history(item["id"])
    event_types = [h["event_type"] for h in history]
    assert "deadline_changed" in event_types
    assert "postponed" not in event_types

# 18. Pipeline deadline tracking: Unparseable deadline keeps existing deadline
def test_pipeline_unparseable_deadline_safe():
    repo = ActionItemRepository()
    engine = StateEngine(action_item_repo=repo)
    orchestrator = AIPipelineOrchestrator(action_item_repo=repo, state_engine=engine)
    m_id = uuid4()
    
    initial_deadline = datetime.utcnow() + timedelta(days=3)
    item = repo.create_action_item(
        meeting_id=m_id,
        title="Optimize SQL queries",
        deadline=initial_deadline
    )
    
    t_text = "Optimize SQL queries assigned to Dave."
    orchestrator.process_transcript(m_id, t_text)
    
    updated_item = repo.get_action_item(item["id"])
    assert updated_item["deadline"] == initial_deadline

# 19. Pipeline deadline tracking: normalize_deadline utility unit tests
def test_normalize_deadline_utility():
    from app.ai.pipeline import normalize_deadline
    ref = datetime(2026, 9, 7, 10, 0, 0)
    
    assert normalize_deadline("2026-09-15T12:00:00") == datetime(2026, 9, 15, 12, 0, 0)
    assert normalize_deadline("Not specified") is None
    assert normalize_deadline("unknown") is None
    assert normalize_deadline("") is None
    assert normalize_deadline(None) is None
    assert normalize_deadline("tomorrow", reference_date=ref) == datetime(2026, 9, 8, 17, 0, 0)
    assert normalize_deadline("Friday", reference_date=ref) == datetime(2026, 9, 11, 17, 0, 0)

