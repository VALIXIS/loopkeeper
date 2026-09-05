from typing import List, Optional
from uuid import UUID
from app.repositories.valixis_repository import ValixisRepository

class ValixisService:
    def __init__(self, valixis_repo: Optional[ValixisRepository] = None):
        self.repo = valixis_repo or ValixisRepository()

    def find_employee_by_name(self, name: str) -> Optional[dict]:
        return self.repo.get_employee_by_name(name)

    def resolve_employee_id(self, employee_id: UUID) -> Optional[dict]:
        return self.repo.get_employee_by_id(employee_id)

    def list_employees(self) -> List[dict]:
        return self.repo.list_all_employees()

    def search_tasks(self, query: str) -> List[dict]:
        return self.repo.search_existing_tasks(query)
