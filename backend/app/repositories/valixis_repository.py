import os
from typing import List, Optional
from uuid import UUID
from app.models.models import Employee, Task
from app.core.database import SessionLocal

class ValixisRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        # Read-Only reference mapping for VALIXIS Portal employees
        self._mock_employees: List[dict] = [
            {"id": "e6cb8913-904a-4a7d-b507-ba1470665dc5", "name": "Adithya", "email": "adithya@valixis.com", "role": "employee", "department": "Engineering"},
            {"id": "39244951-87a5-44e6-801a-28cb3b1a0ed5", "name": "Hasitha", "email": "hasitha@valixis.com", "role": "employee", "department": "Engineering"},
            {"id": "43e5d5fc-fc54-49bb-8faa-79018cf49349", "name": "Jyothsna", "email": "jyothsna@valixis.com", "role": "manager", "department": "Design"},
            {"id": "8a18fff4-6236-4d54-a29a-eeb3c65dd646", "name": "Krishna", "email": "krishna@valixis.com", "role": "employee", "department": "Engineering"},
            {"id": "9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee", "name": "Subhash", "email": "official.valixis@gmail.com", "role": "manager", "department": "Executive"},
            {"id": "a2b32605-343c-4ef4-9365-e219e8b21e20", "name": "Vaseem", "email": "vaseem@valixis.com", "role": "employee", "department": "QA"},
            {"id": "5af2f8a8-a881-408a-8fdd-1fee384f1779", "name": "Vignesh", "email": "vignesh@valixis.com", "role": "employee", "department": "Engineering"},
            {"id": "11111111-1111-1111-1111-111111111111", "name": "Rahul", "email": "rahul@valixis.com", "role": "manager", "department": "Product"},
            {"id": "55555555-5555-5555-5555-555555555555", "name": "Priya", "email": "priya@valixis.com", "role": "employee", "department": "QA"}
        ]
        self._mock_tasks: List[dict] = [
            {
                "id": "b3abaad6-0000-4000-8000-000000000001",
                "title": "Background Health Connect and Periodic Step Sync Engine",
                "description": "Background service for periodic health step metrics synchronization.",
                "priority": "Critical",
                "owner": "Adithya",
                "deadline": "2026-09-03T23:59:59Z"
            },
            {
                "id": "7f0d7f4f-0000-4000-8000-000000000002",
                "title": "AdMob Native Advanced Ads Feed Integration",
                "description": "Native advanced ad units insertion into feed streams.",
                "priority": "High",
                "owner": "Vaseem",
                "deadline": "2026-09-03T23:59:59Z"
            },
            {
                "id": "33a040d0-0000-4000-8000-000000000003",
                "title": "Accessibility (A11y) and Minimum Touch Target Audit",
                "description": "Audit and compliance for minimum touch target sizes across screens.",
                "priority": "Medium",
                "owner": "Krishna",
                "deadline": "2026-09-03T23:59:59Z"
            },
            {
                "id": "74b1b0ba-0000-4000-8000-000000000004",
                "title": "SQLite Local Storage and Multi-Month Trend Analytics Database",
                "description": "Offline local storage schema for multi-month trend metrics.",
                "priority": "Critical",
                "owner": "Adithya",
                "deadline": "2026-09-04T23:59:59Z"
            },
            {
                "id": "b63c218a-0000-4000-8000-000000000005",
                "title": "Interactive Hydration and Sleep Goal Reminder Engine",
                "description": "Interactive local notifications for hydration and sleep tracking.",
                "priority": "High",
                "owner": "Vaseem",
                "deadline": "2026-09-04T23:59:59Z"
            },
            {
                "id": "cf4e96e3-0000-4000-8000-000000000006",
                "title": "Performance Profiling and Memory Leak Optimization",
                "description": "Profile heap memory allocation and fix listener leaks.",
                "priority": "Medium",
                "owner": "Krishna",
                "deadline": "2026-09-04T23:59:59Z"
            },
            {
                "id": "b4eeffc0-0000-4000-8000-000000000007",
                "title": "Exportable Progress and Streak Milestone Story Cards",
                "description": "Render shareable milestone achievement cards.",
                "priority": "High",
                "owner": "Vaseem",
                "deadline": "2026-09-05T23:59:59Z"
            },
            {
                "id": "0a56f3a4-0000-4000-8000-000000000008",
                "title": "Cloud Backup and Sync Protocol (Firebase / Supabase)",
                "description": "Secure sync protocol for cloud database synchronization.",
                "priority": "Critical",
                "owner": "Adithya",
                "deadline": "2026-09-05T23:59:59Z"
            },
            {
                "id": "138ea956-0000-4000-8000-000000000009",
                "title": "UI Micro-Interactions and Haptic Feedback Polish",
                "description": "Add tactile haptic feedback for user actions.",
                "priority": "Medium",
                "owner": "Krishna",
                "deadline": "2026-09-05T23:59:59Z"
            },
            {
                "id": "084c3eeb-0000-4000-8000-000000000010",
                "title": "VIGNESH - SEP 2ND",
                "description": "VALIXIS Portal submission task for Vignesh.",
                "priority": "High",
                "owner": "Vignesh",
                "deadline": "2026-09-02T00:00:00Z"
            }
        ]

    def _get_db(self):
        if self.db is not None:
            return self.db, False
        if SessionLocal is not None:
            try:
                session = SessionLocal()
                return session, True
            except Exception:
                return None, False
        return None, False

    def get_employee_by_name(self, name: str) -> Optional[dict]:
        """Find employee profile by name in public.employees (Read-Only)."""
        if not name or name.strip().lower() in ["unassigned", "not specified", "unknown"]:
            return None
        
        name_clean = name.strip().lower()
        db, is_local = self._get_db()
        if db:
            try:
                emp = db.query(Employee).filter(Employee.name.ilike(f"%{name_clean}%")).first()
                if emp:
                    return {
                        "id": str(emp.id),
                        "name": emp.name,
                        "email": emp.email,
                        "role": emp.role,
                        "department": emp.department
                    }
            except Exception:
                pass
            finally:
                if is_local:
                    db.close()

        if os.getenv("STRICT_PRODUCTION_DB", "false").lower() == "true":
            logger.error("Database connection unavailable in strict production mode. Refusing fallback for employee lookup.")
            return None

        # Fallback for offline test environments
        for emp in self._mock_employees:
            if name_clean in emp["name"].lower():
                return emp
        return None

    def get_employee_by_id(self, employee_id: UUID) -> Optional[dict]:
        """Retrieve employee profile by UUID from public.employees (Read-Only)."""
        emp_str = str(employee_id)
        db, is_local = self._get_db()
        if db:
            try:
                emp = db.query(Employee).filter(Employee.id == employee_id).first()
                if emp:
                    return {
                        "id": str(emp.id),
                        "name": emp.name,
                        "email": emp.email,
                        "role": emp.role,
                        "department": emp.department
                    }
            except Exception:
                pass
            finally:
                if is_local:
                    db.close()

        if os.getenv("STRICT_PRODUCTION_DB", "false").lower() == "true":
            logger.error("Database connection unavailable in strict production mode. Refusing fallback for employee ID lookup.")
            return None

        for emp in self._mock_employees:
            if emp["id"] == emp_str:
                return emp
        return None

    def list_all_employees(self) -> List[dict]:
        """List all registered employees from public.employees (Read-Only)."""
        db, is_local = self._get_db()
        if db:
            try:
                employees = db.query(Employee).all()
                if employees:
                    return [
                        {
                            "id": str(e.id),
                            "name": e.name,
                            "email": e.email,
                            "role": e.role,
                            "department": e.department
                        }
                        for e in employees
                    ]
            except Exception as e:
                logger.warning(f"Error querying employees from database: {e}")
            finally:
                if is_local:
                    db.close()

        if os.getenv("STRICT_PRODUCTION_DB", "false").lower() == "true":
            logger.error("Database connection unavailable in strict production mode. Refusing silent fallback to mock employees.")
            return []

        return self._mock_employees

    def list_valixis_tasks(self) -> List[dict]:
        """List all existing tasks from public.tasks (Read-Only)."""
        db, is_local = self._get_db()
        if db:
            try:
                tasks = db.query(Task).all()
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
            except Exception as e:
                logger.warning(f"Error querying tasks from database: {e}")
            finally:
                if is_local:
                    db.close()

        if os.getenv("STRICT_PRODUCTION_DB", "false").lower() == "true":
            logger.error("Database connection unavailable in strict production mode. Refusing silent fallback to mock tasks.")
            return []

        return self._mock_tasks

    def search_existing_tasks(self, query_str: str) -> List[dict]:
        """Search existing VALIXIS tasks by title/description (Read-Only)."""
        if not query_str:
            return []
        
        db, is_local = self._get_db()
        if db:
            try:
                tasks = db.query(Task).filter(Task.title.ilike(f"%{query_str}%")).all()
                if tasks:
                    return [
                        {
                            "id": str(t.id),
                            "title": t.title,
                            "description": t.description,
                            "priority": t.priority
                        }
                        for t in tasks
                    ]
            except Exception:
                pass
            finally:
                if is_local:
                    db.close()

        return [t for t in self._mock_tasks if query_str.lower() in t["title"].lower()]
