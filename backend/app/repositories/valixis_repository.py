from typing import List, Optional
from uuid import UUID
from app.models.models import Employee, Task

class ValixisRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        # In-memory fallback / cache for mock testing when DB is not connected
        self._mock_employees: List[dict] = [
            {"id": "11111111-1111-1111-1111-111111111111", "name": "Alice Johnson", "email": "alice@valixis.com", "role": "employee"},
            {"id": "22222222-2222-2222-2222-222222222222", "name": "Bob Smith", "email": "bob@valixis.com", "role": "employee"},
            {"id": "33333333-3333-3333-3333-333333333333", "name": "Charlie Davis", "email": "charlie@valixis.com", "role": "manager"},
        ]
        self._mock_tasks: List[dict] = []

    def get_employee_by_name(self, name: str) -> Optional[dict]:
        """Find employee by name (case-insensitive substring match). Read-Only."""
        if not name or name.strip().lower() in ["unassigned", "not specified"]:
            return None
        
        name_clean = name.strip().lower()
        
        if self.db:
            emp = self.db.query(Employee).filter(Employee.name.ilike(f"%{name_clean}%")).first()
            if emp:
                return {"id": str(emp.id), "name": emp.name, "email": emp.email, "role": emp.role}
        
        # Fallback to in-memory store
        for emp in self._mock_employees:
            if name_clean in emp["name"].lower():
                return emp
        return None

    def get_employee_by_id(self, employee_id: UUID) -> Optional[dict]:
        """Retrieve employee profile by UUID. Read-Only."""
        emp_str = str(employee_id)
        if self.db:
            emp = self.db.query(Employee).filter(Employee.id == employee_id).first()
            if emp:
                return {"id": str(emp.id), "name": emp.name, "email": emp.email, "role": emp.role}
        
        for emp in self._mock_employees:
            if emp["id"] == emp_str:
                return emp
        return None

    def list_all_employees(self) -> List[dict]:
        """List all registered employees. Read-Only."""
        if self.db:
            employees = self.db.query(Employee).all()
            if employees:
                return [{"id": str(e.id), "name": e.name, "email": e.email, "role": e.role} for e in employees]
        return self._mock_employees

    def search_existing_tasks(self, query_str: str) -> List[dict]:
        """Search existing VALIXIS tasks by title/description. Read-Only."""
        if not query_str:
            return []
        
        if self.db:
            tasks = self.db.query(Task).filter(Task.title.ilike(f"%{query_str}%")).all()
            return [{"id": str(t.id), "title": t.title, "description": t.description, "priority": t.priority} for t in tasks]
            
        return [t for t in self._mock_tasks if query_str.lower() in t["title"].lower()]
