from typing import List, Optional
from datetime import datetime
from collections import defaultdict
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.valixis_repository import ValixisRepository
from app.services.state_engine import StateEngine

class DashboardService:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        valixis_repo: Optional[ValixisRepository] = None,
        state_engine: Optional[StateEngine] = None
    ):
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.valixis_repo = valixis_repo or ValixisRepository()
        self.state_engine = state_engine or StateEngine(action_item_repo=self.action_item_repo)

    def get_dashboard_overview(self) -> dict:
        items = self.action_item_repo.list_action_items()
        now = datetime.utcnow()

        total_open_tasks = 0
        overdue_tasks = 0
        completed_tasks = 0
        repeatedly_postponed_tasks = 0

        member_open_counts = defaultdict(int)
        member_overdue_counts = defaultdict(int)

        upcoming_deadlines = []

        for item in items:
            status = item["status"]
            deadline = item.get("deadline")
            owner_id = item.get("owner_employee_id")

            # Check if overdue based on deadline
            is_overdue = (status == "pending" and deadline and deadline < now) or (status == "overdue")

            if status in ["pending", "overdue"]:
                total_open_tasks += 1
                if owner_id:
                    member_open_counts[owner_id] += 1
                if is_overdue:
                    overdue_tasks += 1
                    if owner_id:
                        member_overdue_counts[owner_id] += 1

            elif status == "done":
                completed_tasks += 1

            if self.state_engine.is_repeatedly_postponed(item["id"]):
                repeatedly_postponed_tasks += 1

            if status == "pending" and deadline and deadline >= now:
                upcoming_deadlines.append(item)

        # Sort upcoming deadlines by date
        upcoming_deadlines.sort(key=lambda x: x["deadline"])

        # Identify overloaded members (e.g. >= 3 open tasks or >= 1 overdue task)
        overloaded_members = []
        all_employees = self.valixis_repo.list_all_employees()
        emp_map = {e["id"]: e["name"] for e in all_employees}

        all_owner_ids = set(member_open_counts.keys()).union(set(member_overdue_counts.keys()))
        for emp_id in all_owner_ids:
            open_cnt = member_open_counts[emp_id]
            overdue_cnt = member_overdue_counts[emp_id]

            if open_cnt >= 3 or overdue_cnt >= 1:
                name = emp_map.get(str(emp_id), "Unknown Employee")
                overloaded_members.append({
                    "employee_id": emp_id,
                    "employee_name": name,
                    "open_task_count": open_cnt,
                    "overdue_task_count": overdue_cnt
                })

        return {
            "total_open_tasks": total_open_tasks,
            "overdue_tasks": overdue_tasks,
            "completed_tasks": completed_tasks,
            "repeatedly_postponed_tasks": repeatedly_postponed_tasks,
            "overloaded_members": overloaded_members,
            "upcoming_deadlines": upcoming_deadlines[:10]
        }
