from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "LoopKeeper Backend API",
        "ai_pipeline": "ready"
    }
