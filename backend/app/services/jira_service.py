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
            "status_message": "Connected to Atlassian Jira Cloud REST API." if connected else "Not connected. Jira API credentials not configured in environment variables or configuration portal."
        }

    def update_credentials(
        self,
        domain: str,
        email: str,
        api_token: str,
        project_key: Optional[str] = None
    ) -> Dict[str, Any]:
        self.jira_domain = domain.strip()
        self.jira_email = email.strip()
        self.jira_api_token = api_token.strip()
        if project_key:
            self.jira_project_key = project_key.strip().upper()
        return self.get_status()

    def test_connection(self) -> Dict[str, Any]:
        if not self.is_connected():
            return {
                "success": False,
                "message": "Jira API credentials incomplete. Please configure Domain, Email, and API Token."
            }
        try:
            url = f"https://{self.jira_domain.rstrip('/')}/rest/api/3/myself"
            resp = requests.get(url, auth=(self.jira_email, self.jira_api_token), timeout=5.0)
            if resp.status_code == 200:
                user_data = resp.json()
                return {
                    "success": True,
                    "account_id": user_data.get("accountId"),
                    "display_name": user_data.get("displayName"),
                    "email_address": user_data.get("emailAddress"),
                    "message": f"Successfully authenticated as {user_data.get('displayName', 'Jira User')}."
                }
            return {
                "success": False,
                "status_code": resp.status_code,
                "message": f"Jira API returned HTTP {resp.status_code}. Verify API token and account permissions."
            }
        except Exception as e:
            return {"success": False, "message": f"Connection test failed: {str(e)}"}

    def fetch_projects(self) -> List[Dict[str, Any]]:
        if not self.is_connected():
            return [{"key": self.jira_project_key, "name": f"Project ({self.jira_project_key})", "is_fallback": True}]
        try:
            url = f"https://{self.jira_domain.rstrip('/')}/rest/api/3/project"
            resp = requests.get(url, auth=(self.jira_email, self.jira_api_token), timeout=5.0)
            if resp.status_code == 200:
                projects = resp.json()
                return [{"key": p.get("key"), "name": p.get("name"), "id": p.get("id")} for p in projects]
        except Exception as e:
            logger.warning(f"Failed to fetch Jira projects: {e}")
        return [{"key": self.jira_project_key, "name": f"Project ({self.jira_project_key})", "is_fallback": True}]

    def link_commitment_to_issue(
        self,
        action_item_id: UUID,
        jira_issue_key: str,
        jira_status: Optional[str] = None
    ) -> Dict[str, Any]:
        item = self.action_item_repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        issue_key = jira_issue_key.strip().upper()
        raw_status = jira_status or ("To Do" if item.get("status") == "pending" else "Done")
        jira_assignee = item.get("owner_name", "Unassigned")

        live = self.fetch_live_jira_issue(issue_key)
        if live:
            raw_status = live.get("jira_status", raw_status)
            jira_assignee = live.get("assignee", jira_assignee)

        link_record = self.action_item_repo.save_jira_link(
            action_item_id=action_item_id,
            jira_issue_key=issue_key,
            jira_issue_id=f"100{abs(hash(issue_key)) % 90}",
            jira_issue_url=f"https://{self.jira_domain or 'jira.atlassian.net'}/browse/{issue_key}",
            jira_status=raw_status,
            jira_assignee=jira_assignee
        )
        link_record["normalized_status"] = self.normalize_jira_status(link_record.get("jira_status", raw_status))
        return link_record

    @staticmethod
    def normalize_jira_status(status_str: Optional[str]) -> str:
        """Normalize raw Jira issue status strings into standard LoopKeeper execution states."""
        if not status_str:
            return "unknown"
        s = status_str.strip().lower()
        if any(k in s for k in ["done", "closed", "resolved", "complete"]):
            return "done"
        if any(k in s for k in ["in progress", "in review", "in dev", "qa", "testing"]):
            return "in_progress"
        if any(k in s for k in ["to do", "todo", "open", "backlog", "new"]):
            return "todo"
        if any(k in s for k in ["blocked", "on hold", "waiting"]):
            return "blocked"
        return "unknown"

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
        raw_status = "To Do" if item.get("status") == "pending" else "Done"
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
                logger.warning(f"Jira API call failed: {e}. Generating local execution link.")

        link_record = self.action_item_repo.save_jira_link(
            action_item_id=action_item_id,
            jira_issue_key=issue_key,
            jira_issue_id=f"100{abs(hash(issue_key)) % 90}",
            jira_issue_url=f"https://{self.jira_domain or 'jira.atlassian.net'}/browse/{issue_key}",
            jira_status=raw_status,
            jira_assignee=item.get("owner_name", "Unassigned")
        )
        link_record["normalized_status"] = self.normalize_jira_status(link_record.get("jira_status", raw_status))
        return link_record

    def get_jira_links_for_commitment(self, action_item_id: UUID) -> List[dict]:
        links = self.action_item_repo.get_jira_links_for_action_item(action_item_id)
        for link in links:
            link["normalized_status"] = self.normalize_jira_status(link.get("jira_status"))
        return links

    def fetch_live_jira_issue(self, issue_key: str) -> Optional[Dict[str, Any]]:
        """Fetch live Jira issue details from Atlassian API if credentials exist."""
        if not self.is_connected():
            return None
        try:
            url = f"https://{self.jira_domain.rstrip('/')}/rest/api/3/issue/{issue_key}"
            resp = requests.get(
                url,
                auth=(self.jira_email, self.jira_api_token),
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json() or {}
                fields = data.get("fields") or {}
                status_obj = fields.get("status") or {}
                status_name = status_obj.get("name", "Unknown")
                assignee_obj = fields.get("assignee") or {}
                assignee_name = assignee_obj.get("displayName", "Unassigned")
                return {
                    "jira_issue_key": issue_key,
                    "jira_status": status_name,
                    "normalized_status": self.normalize_jira_status(status_name),
                    "assignee": assignee_name
                }
        except Exception as e:
            logger.warning(f"Failed to fetch live Jira issue {issue_key}: {e}")
        return None

    def sync_jira_status(self, action_item_id: UUID) -> List[dict]:
        links = self.get_jira_links_for_commitment(action_item_id)
        if not links:
            return []
        
        synced_links = []
        for link in links:
            live = self.fetch_live_jira_issue(link["jira_issue_key"])
            status = live["jira_status"] if live else link["jira_status"]
            updated = self.action_item_repo.save_jira_link(
                action_item_id=action_item_id,
                jira_issue_key=link["jira_issue_key"],
                jira_issue_id=link.get("jira_issue_id"),
                jira_issue_url=link.get("jira_issue_url"),
                jira_status=status,
                jira_assignee=link.get("jira_assignee")
            )
            updated["normalized_status"] = self.normalize_jira_status(updated.get("jira_status"))
            synced_links.append(updated)
        return synced_links
