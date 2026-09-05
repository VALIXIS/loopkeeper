from typing import List
from fastapi import APIRouter, HTTPException
from app.repositories.valixis_repository import ValixisRepository

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[dict])
def list_users():
    repo = ValixisRepository()
    return repo.list_all_employees()

@router.get("/{user_id}", response_model=dict)
def get_user(user_id: str):
    repo = ValixisRepository()
    emp = repo.get_employee_by_name(user_id)
    if not emp:
        for e in repo.list_all_employees():
            if str(e.get("id")) == str(user_id):
                return e
        raise HTTPException(status_code=404, detail=f"User {user_id} not found.")
    return emp
