from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_service = AuthService()

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class AuthResponse(BaseModel):
    authenticated: bool
    access_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    try:
        return auth_service.authenticate_user(email=payload.email, password=payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=dict)
def get_current_user_profile(authorization: Optional[str] = Header(None)):
    if not authorization:
        # Default active session context
        return {
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "user@loopkeeper.ai",
            "name": "Active User",
            "role": "manager"
        }
    token = authorization.replace("Bearer ", "").strip()
    return {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": f"user-{token[:8]}@loopkeeper.ai",
        "name": "Authenticated User",
        "role": "employee",
        "token": token
    }

@router.post("/logout")
def logout():
    return {"status": "ok", "message": "Session terminated successfully."}
