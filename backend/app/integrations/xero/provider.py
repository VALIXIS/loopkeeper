import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID

from app.integrations.xero.auth import XeroAuthHandler
from app.integrations.xero.client import XeroClient
from app.repositories.integration_repository import IntegrationRepository

logger = logging.getLogger("app.integrations.xero.provider")

class XeroProvider:
    def __init__(self, integration_repo: Optional[IntegrationRepository] = None):
        self.auth_handler = XeroAuthHandler()
        self.integration_repo = integration_repo or IntegrationRepository()

    @property
    def provider_id(self) -> str:
        return "xero"

    @property
    def provider_name(self) -> str:
        return "Xero Accounting & Financial Execution"

    def is_connected(self, user_id: Optional[UUID] = None) -> bool:
        record = self.integration_repo.get_integration("xero", user_id=user_id)
        if record and record.get("is_connected"):
            return True
        return False

    def get_status(self, user_id: Optional[UUID] = None) -> Dict[str, Any]:
        record = self.integration_repo.get_integration("xero", user_id=user_id)
        configured = self.auth_handler.is_configured()
        
        connected = bool(record and record.get("is_connected"))
        status_code = record.get("status") if record else ("connected" if connected else "not_connected")

        status_msg = "Connected to Xero Accounting Cloud REST API." if connected else (
            "READY FOR EXTERNAL OAUTH VERIFICATION. Please configure XERO_CLIENT_ID and XERO_CLIENT_SECRET in environment variables."
            if not configured else "Not connected. Complete OAuth flow to connect Xero organisation."
        )

        return {
            "provider": self.provider_id,
            "provider_name": self.provider_name,
            "status": status_code,
            "is_connected": connected,
            "account_email": record.get("account_email") if record else None,
            "account_name": record.get("account_name") if record else None,
            "config_status": "configured" if configured else "unconfigured",
            "redirect_uri": self.auth_handler.redirect_uri,
            "scopes": self.auth_handler.scopes,
            "last_synced_at": record.get("last_synced_at").isoformat() if record and record.get("last_synced_at") else None,
            "status_message": status_msg
        }

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        return self.auth_handler.get_authorization_url(state=state)

    def handle_oauth_callback(
        self,
        code: str,
        state: Optional[str] = None,
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        tokens = self.auth_handler.exchange_code_for_tokens(code)
        access_token = tokens.get("access_token", "")
        refresh_token = tokens.get("refresh_token")

        tenant_name = "VALIXIS Organisation"
        tenant_id = None

        if access_token:
            client = XeroClient(access_token=access_token)
            connections = client.list_connections()
            if connections:
                tenant_id = connections[0].get("tenantId")
                tenant_name = connections[0].get("tenantName", tenant_name)

        saved = self.integration_repo.save_integration(
            provider="xero",
            status="connected",
            is_connected=True,
            account_email="accounting@valixis.com",
            account_name=tenant_name,
            access_token=access_token,
            refresh_token=refresh_token,
            config={"tenant_id": tenant_id, "tenant_name": tenant_name},
            user_id=user_id
        )

        return {
            "status": "connected",
            "provider": self.provider_id,
            "account_name": tenant_name,
            "connected_at": datetime.utcnow().isoformat()
        }

    def disconnect(self, user_id: Optional[UUID] = None) -> bool:
        return self.integration_repo.disconnect_integration("xero", user_id=user_id)

    def get_financial_summary(self, user_id: Optional[UUID] = None) -> Dict[str, Any]:
        record = self.integration_repo.get_integration("xero", user_id=user_id)
        if not record or not record.get("is_connected"):
            return {
                "provider": "xero",
                "is_connected": False,
                "status_message": "Xero is not connected. Connect Xero to view real financial execution evidence."
            }

        access_token = record.get("access_token")
        config = record.get("config") or {}
        tenant_id = config.get("tenant_id")
        org_name = config.get("tenant_name") or record.get("account_name", "VALIXIS Enterprise")

        client = XeroClient(access_token=access_token)
        raw_invoices = client.get_invoices(tenant_id) if tenant_id else []

        # Process real invoice data or structured real-model representation
        recent_invoices = []
        outstanding_count = 0
        overdue_count = 0
        total_outstanding_amount = 0.0

        for inv in raw_invoices:
            amount_due = float(inv.get("AmountDue", 0.0))
            status = inv.get("Status", "DRAFT")
            contact = inv.get("Contact", {}).get("Name", "Client")
            inv_number = inv.get("InvoiceNumber", f"INV-{inv.get('InvoiceID', '')[:6]}")
            due_date = inv.get("DueDateString")

            if amount_due > 0:
                outstanding_count += 1
                total_outstanding_amount += amount_due
                if status == "AUTHORISED" and inv.get("IsSubscribedToInvoice"):
                    overdue_count += 1

            recent_invoices.append({
                "invoice_id": inv.get("InvoiceID"),
                "invoice_number": inv_number,
                "contact_name": contact,
                "total": float(inv.get("Total", 0.0)),
                "amount_due": amount_due,
                "status": status,
                "due_date": due_date
            })

        return {
            "provider": "xero",
            "is_connected": True,
            "organisation_name": org_name,
            "tenant_id": tenant_id,
            "total_outstanding_invoices": outstanding_count,
            "total_outstanding_amount": round(total_outstanding_amount, 2),
            "overdue_invoices_count": overdue_count,
            "recent_invoices": recent_invoices[:10],
            "last_synced_at": record.get("last_synced_at").isoformat() if record.get("last_synced_at") else datetime.utcnow().isoformat()
        }

