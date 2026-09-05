import hashlib
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.services.auth_service import AuthService

security_scheme = HTTPBearer(auto_error=False)
auth_service = AuthService()

def hash_input(text: str) -> str:
    """Generate SHA-256 hash for raw transcript input tracking."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def sanitize_input(text: str) -> str:
    """Sanitize transcript input before sending to AI processing."""
    if not text:
        return ""
    return text.strip()

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    """FastAPI dependency for authenticating Bearer tokens on protected endpoints."""
    auth_mode = getattr(settings, "AUTH_MODE", "production").lower()
    
    if not credentials:
        if auth_mode == "offline_dev":
            return {
                "id": "11111111-1111-1111-1111-111111111111",
                "email": "dev@loopkeeper.ai",
                "name": "Offline Dev User",
                "role": "manager",
                "auth_mode": "offline_dev"
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer authorization token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    user = auth_service.validate_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authorization token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user
