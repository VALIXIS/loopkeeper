import sys
import os

# Ensure backend and repository root paths are in sys.path for seamless execution from any working directory
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
for path in [BACKEND_DIR, REPO_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for web and local dev environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check endpoint for quick ping
@app.get("/health", tags=["Health"])
def root_health():
    return {"status": "ok", "service": settings.PROJECT_NAME}

# Include all V1 API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
