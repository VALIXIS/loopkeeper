from typing import List
from fastapi import APIRouter, HTTPException
from app.repositories.valixis_repository import ValixisRepository

router = APIRouter(prefix="/employees", tags=["Employees (VALIXIS Portal)"])

@router.get("", response_model=List[dict])
def list_employees():
    """List all active employees from VALIXIS Portal. Read-Only."""
    repo = ValixisRepository()
    return repo.list_all_employees()

@router.get("/{employee_id}", response_model=dict)
def get_employee(employee_id: str):
    """Get employee details by ID from VALIXIS Portal. Read-Only."""
    repo = ValixisRepository()
    emp = repo.get_employee_by_name(employee_id)
    if not emp:
        # Try lookup by string representation
        for e in repo.list_all_employees():
            if str(e.get("id")) == str(employee_id):
                return e
        raise HTTPException(status_code=404, detail="Employee not found in VALIXIS Portal")
    return emp
