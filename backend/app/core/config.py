import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        # Fallback lightweight settings class if pydantic BaseSettings is not installed
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

settings = Settings()
