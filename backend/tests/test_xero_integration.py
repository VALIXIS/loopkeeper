import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.integrations.xero.provider import XeroProvider

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer valid-jwt-12345678"}

def test_xero_provider_status():
    provider = XeroProvider()
    status = provider.get_status()
    assert status["provider"] == "xero"
    assert "Xero" in status["provider_name"]
    assert "status" in status
    assert "status_message" in status

def test_xero_api_endpoints():
    # Status endpoint
    res_status = client.get("/api/v1/integrations/xero/status", headers=AUTH_HEADERS)
    assert res_status.status_code == 200
    assert res_status.json()["provider"] == "xero"

    # Connect endpoint
    res_connect = client.get("/api/v1/integrations/xero/connect", headers=AUTH_HEADERS)
    assert res_connect.status_code == 200
    data_connect = res_connect.json()
    assert data_connect["provider"] == "xero"
    assert "authorization_url" in data_connect

    # Summary endpoint
    res_summary = client.get("/api/v1/integrations/xero/summary", headers=AUTH_HEADERS)
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert summary["provider"] == "xero"
    assert "is_connected" in summary
    assert "status_message" in summary or "recent_invoices" in summary


