"""
Tests for starknet_routes.py.
"""
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

import starknet_routes
from auth import Auth
from main import app


SAMPLE_USER = {
    "id": "user-stark-1",
    "username": "StarkTester",
    "auth_provider": "guest",
    "starknet_auth": False,
}


@pytest.fixture
def auth_client():
    async def fake_user():
        return SAMPLE_USER

    app.dependency_overrides[Auth.get_current_user] = fake_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────
# /auth/email
# ─────────────────────────────────────────────────────────────

class TestStarknetAuthEmail:
    def test_no_privy_app_id_503_in_prod(self, auth_client, monkeypatch):
        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_ID", "", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "DEBUG", False, raising=False)

        r = auth_client.post(
            "/api/starknet/auth/email",
            json={"email": "alice@example.com", "privy_token": "x" * 20},
        )
        assert r.status_code == 503

    def test_debug_fallback(self, auth_client, monkeypatch, mock_db):
        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_ID", "fake-app-id", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "DEBUG", True, raising=False)

        async def fake_verify(token):
            return "0xfaceb00cfaceb00cfaceb00cfaceb00cfaceb00c"

        monkeypatch.setattr(starknet_routes, "_verify_privy_token", fake_verify)

        sc = mock_db.get_service_client.return_value
        sc.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        sc.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={**SAMPLE_USER, "starknet_auth": True, "starknet_address": "0xfaceb00c"}
        )

        r = auth_client.post(
            "/api/starknet/auth/email",
            json={"email": "alice@example.com", "privy_token": "x" * 20},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


# ─────────────────────────────────────────────────────────────
# RPC method allowlist
# ─────────────────────────────────────────────────────────────

class TestRPCAllowlist:
    def test_allowlisted_method_accepted(self, auth_client, monkeypatch):
        # Patch httpx.AsyncClient inside starknet_routes so no real HTTP call
        class FakeAsyncClient:
            def __init__(self, *a, **kw):
                pass
            async def __aenter__(self):
                return self
            async def __aexit__(self, *a):
                return False
            async def post(self, url, json=None, headers=None):
                resp = MagicMock()
                resp.status_code = 200
                resp.json.return_value = {"result": {"ok": True}}
                return resp

        monkeypatch.setattr(starknet_routes.httpx, "AsyncClient", FakeAsyncClient)

        r = auth_client.post(
            "/api/starknet/rpc",
            json={"network": "sepolia", "method": "starknet_call", "params": []},
        )
        assert r.status_code == 200, r.text

    def test_non_allowlisted_method_rejected(self, auth_client):
        r = auth_client.post(
            "/api/starknet/rpc",
            json={"network": "sepolia", "method": "starknet_evil", "params": []},
        )
        assert r.status_code == 422  # Pydantic validator rejects


# ─────────────────────────────────────────────────────────────
# log transaction
# ─────────────────────────────────────────────────────────────

class TestLogTransaction:
    def test_invalid_hash_rejected(self, auth_client):
        r = auth_client.post(
            "/api/starknet/transactions",
            json={
                "hash": "not-a-hash",
                "network": "sepolia",
                "type": "swap",
            },
        )
        # min_length=10 will accept "not-a-hash" (10 chars), so the
        # regex inside the route returns 400. Either is a "rejected" outcome.
        assert r.status_code in (400, 422)

    def test_valid_transaction_logged(self, auth_client, mock_db):
        sc = mock_db.get_service_client.return_value
        sc.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{"id": "tx-1"}]
        )
        r = auth_client.post(
            "/api/starknet/transactions",
            json={
                "hash": "0xabc123def4567890",
                "network": "sepolia",
                "type": "swap",
                "lessonId": "l1",
                "labId": "lab1",
                "amount": "100",
                "token": "ETH",
            },
        )
        assert r.status_code == 200, r.text
        assert r.json()["data"]["logged"] is True
        # Insert was called on starknet_transactions
        called_tables = [c.args[0] for c in sc.table.call_args_list]
        assert "starknet_transactions" in called_tables
