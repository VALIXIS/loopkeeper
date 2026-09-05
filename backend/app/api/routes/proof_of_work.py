import json
from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Request, Header, HTTPException, status, Depends
from app.core.config import settings
from app.services.proof_of_work_service import ProofOfWorkService

router = APIRouter(prefix="", tags=["Proof of Work Integrations"])

proof_of_work_service = ProofOfWorkService()

@router.post("/integrations/github/webhook")
async def github_webhook_receiver(
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None)
):
    body_bytes = await request.body()

    # Signature verification
    secret = settings.GITHUB_WEBHOOK_SECRET
    if secret and secret.strip():
        is_valid = ProofOfWorkService.verify_github_signature(
            payload_bytes=body_bytes,
            signature_header=x_hub_signature_256,
            secret=secret
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid GitHub webhook signature"
            )

    # Validate GitHub Event type header
    if x_github_event != "pull_request":
        return {
            "received": True,
            "processed": False,
            "reason": f"Ignored event '{x_github_event}'. Only 'pull_request' events are processed."
        }

    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    return proof_of_work_service.process_github_pr_opened(payload)


@router.get("/proof-of-work/{action_item_id}")
def get_proof_of_work_for_action_item(action_item_id: UUID):
    records = proof_of_work_service.proof_of_work_repo.get_by_action_item_id(action_item_id)
    return records
