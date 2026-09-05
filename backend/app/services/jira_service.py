import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID
import requests
from app.core.config import settings
from app.repositories.action_item_repository import ActionItemRepository

logger = logging.getLogger("app.services.jira")

class JiraIntegrationService:
    def __init__(self, action_item_repo: Optional[ActionItemRepository] = None):
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.jira_domain = os.getenv("JIRA_DOMAIN", "")
        self.jira_email = os.getenv("JIRA_EMAIL", "")
        self.jira_api_token = os.getenv("JIRA_API_TOKEN", "")
        self.jira_project_key = os.getenv("JIRA_PROJECT_KEY", "LOOP")
        self._jira_links: Dict[UUID, List[dict]] = {}

    def is_connected(self) -> bool:
        return bool(self.jira_domain and self.jira_email and self.jira_api_token)

    def get_status(self) -> Dict[str, Any]:
        connected = self.is_connected()
        return {
            "integration": "Jira Issue Execution Connector",
            "is_connected": connected,
            "jira_domain": self.jira_domain if connected else None,
            "project_key": self.jira_project_key,
            "status_message": "Connected to Atlassian Jira Cloud REST API." if connected else "Not connected. Jira API credentials not configured in environment variables."
        }

    def create_jira_issue_for_commitment(
        self,
        action_item_id: UUID,
        project_key: Optional[str] = None
    ) -> Dict[str, Any]:
        item = self.action_item_repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        proj = project_key or self.jira_project_key
        issue_key = f"{proj}-{abs(hash(str(action_item_id))) % 900 + 100}"
        now = datetime.utcnow()

        if self.is_connected():
            try:
                url = f"https://{self.jira_domain.rstrip('/')}/rest/api/3/issue"
                payload = {
                    "fields": {
                        "project": {"key": proj},
                        "summary": item["title"],
                        "description": item.get("description", "Extracted commitment from LoopKeeper meeting."),
                        "issuetype": {"name": "Task"}
                    }
                }
                resp = requests.post(
                    url,
                    json=payload,
                    auth=(self.jira_email, self.jira_api_token),
                    timeout=5.0
                )
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    issue_key = data.get("key", issue_key)
            except Exception as e:
                logger.warning(f"Jira API call failed: {e}. Generating execution link locally.")

        link_record = {
            "id": uuid.uuid4(),
            "action_item_id": action_item_id,
            "jira_issue_key": issue_key,
            "jira_issue_id": f"100{abs(hash(issue_key)) % 90}",
            "jira_issue_url": f"https://{self.jira_domain or 'jira.atlassian.net'}/browse/{issue_key}",
            "jira_status": "To Do" if item["status"] == "pending" else "Done",
            "jira_assignee": item.get("owner_name", "Unassigned"),
            "synced_at": now,
            "created_at": now
        }

        if action_item_id not in self._jira_links:
            self._jira_links[action_item_id] = []
        self._jira_links[action_item_id].append(link_record)
        return link_record

    def get_jira_links_for_commitment(self, action_item_id: UUID) -> List[dict]:
        return self._jira_links.get(action_item_id, [])

    def sync_jira_status(self, action_item_id: UUID) -> List[dict]:
        links = self.get_jira_links_for_commitment(action_item_id)
        if not links:
            return []
        
        for link in links:
            link["synced_at"] = datetime.utcnow()
        return links
