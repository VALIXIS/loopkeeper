import logging
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger("app.integrations.xero.client")

class XeroClient:
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token

    def _get_headers(self, tenant_id: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        if tenant_id:
            headers["Xero-tenant-id"] = tenant_id
        return headers

    def list_connections(self) -> List[Dict[str, Any]]:
        """Fetch connected Xero tenants/organisations via https://api.xero.com/connections."""
        if not self.access_token:
            return []
        try:
            url = "https://api.xero.com/connections"
            resp = requests.get(url, headers=self._get_headers(), timeout=5.0)
            if resp.status_code == 200:
                return resp.json()
            logger.warning(f"Failed to fetch Xero connections: HTTP {resp.status_code}")
        except Exception as e:
            logger.error(f"Error fetching Xero connections: {e}")
        return []

    def get_organisations(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Fetch organisation details for tenant."""
        if not self.access_token or not tenant_id:
            return []
        try:
            url = "https://api.xero.com/api.xro/2.0/Organisation"
            resp = requests.get(url, headers=self._get_headers(tenant_id), timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("Organisations", [])
        except Exception as e:
            logger.error(f"Error fetching Xero organisation for tenant {tenant_id}: {e}")
        return []

    def get_invoices(self, tenant_id: str, statuses: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch invoices for financial tracking."""
        if not self.access_token or not tenant_id:
            return []
        try:
            url = "https://api.xero.com/api.xro/2.0/Invoices"
            params = {}
            if statuses:
                params["Statuses"] = ",".join(statuses)
            resp = requests.get(url, headers=self._get_headers(tenant_id), params=params, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("Invoices", [])
        except Exception as e:
            logger.error(f"Error fetching Xero invoices for tenant {tenant_id}: {e}")
        return []
