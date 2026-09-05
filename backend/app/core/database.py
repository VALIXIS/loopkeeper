import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("app.core.database")

# Database engine initialization
engine = None
SessionLocal = None

db_url = settings.DATABASE_URL
if db_url:
    # Ensure correct postgresql driver prefix
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 10} if "postgresql" in db_url else {}
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("SQLAlchemy Database engine initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to database at {db_url}: {e}. Local fallback active.")

def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a database session per API request."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
