import os
from typing import List, Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:
            pass

class Settings(BaseSettings):
    PROJECT_NAME: str = "LoopKeeper API"
    API_V1_STR: str = "/api/v1"
    
    # Supabase / Database settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://qbvlzhjnqrwsoyvpomyt.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

    # AI Pipeline & SLM settings
    SLM_MODEL_NAME: str = "loopkeeper-slm-v1"
    SLM_MODEL_VERSION: str = "1.0.0"
    SLM_PROVIDER: str = "slm"
    FALLBACK_PROVIDER: str = "fallback_llm"
    CONFIDENCE_THRESHOLD: float = 0.75
    FALLBACK_ENABLED: bool = True
    MAX_INPUT_LENGTH: int = 8192

    # Embedding Model settings
    EMBEDDING_MODEL_NAME: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Google Drive / Meet Integration Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/integrations/google-drive/callback")
    GOOGLE_DRIVE_SCOPES: List[str] = ["https://www.googleapis.com/auth/drive.readonly"]
    GOOGLE_DRIVE_FOLDER_ID: Optional[str] = os.getenv("GOOGLE_DRIVE_FOLDER_ID", None)

settings = Settings()
