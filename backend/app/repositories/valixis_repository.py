from typing import List, Optional
from uuid import UUID
from app.models.models import Employee, Task

class ValixisRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        # In-memory fallback / cache matching live VALIXIS employees when DB session is uninitialized
        self._mock_employees: List[dict] = [
            {"id": "e6cb8913-904a-4a7d-b507-ba1470665dc5", "name": "Adithya", "email": "adithya@valixis.com", "role": "employee"},
            {"id": "39244951-87a5-44e6-801a-28cb3b1a0ed5", "name": "Hasitha", "email": "hasitha@valixis.com", "role": "employee"},
            {"id": "43e5d5fc-fc54-49bb-8faa-79018cf49349", "name": "Jyothsna", "email": "jyothsna@valixis.com", "role": "manager"},
            {"id": "8a18fff4-6236-4d54-a29a-eeb3c65dd646", "name": "Krishna", "email": "krishna@valixis.com", "role": "employee"},
            {"id": "9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee", "name": "Subhash", "email": "official.valixis@gmail.com", "role": "manager"},
            {"id": "a2b32605-343c-4ef4-9365-e219e8b21e20", "name": "Vaseem", "email": "vaseem@valixis.com", "role": "employee"},
            {"id": "5af2f8a8-a881-408a-8fdd-1fee384f1779", "name": "Vignesh", "email": "vignesh@valixis.com", "role": "employee"},
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

    def list_valixis_tasks(self) -> List[dict]:
        """List all tasks from VALIXIS Portal. Read-Only."""
        if self.db:
            tasks = self.db.query(Task).all()
            if tasks:
                return [
                    {
                        "id": str(t.id),
                        "title": t.title,
                        "description": t.description,
                        "priority": t.priority,
                        "deadline": t.deadline.isoformat() if t.deadline else None
                    }
                    for t in tasks
                ]
        return self._mock_tasks

    def search_existing_tasks(self, query_str: str) -> List[dict]:
        """Search existing VALIXIS tasks by title/description. Read-Only."""
        if not query_str:
            return []
        
        if self.db:
            tasks = self.db.query(Task).filter(Task.title.ilike(f"%{query_str}%")).all()
            return [{"id": str(t.id), "title": t.title, "description": t.description, "priority": t.priority} for t in tasks]
            
        return [t for t in self._mock_tasks if query_str.lower() in t["title"].lower()]
