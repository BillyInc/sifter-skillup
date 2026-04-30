"""
Tests for starknet_routes.py.
"""
import asyncio
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from fastapi import BackgroundTasks

import starknet_routes
from auth import Auth
from main import app
from models import StarknetAuthRequest


SAMPLE_USER = {
    "id": "user-stark-1",
    "username": "StarkTester",
    "auth_provider": "guest",
    "starknet_auth": False,
}


class _FakeExecuteResult:
    def __init__(self, data):
        self.data = data


class _FakeQuery:
    def __init__(self, service, table_name, action):
        self.service = service
        self.table_name = table_name
        self.action = action
        self.payload = None
        self.filters = {}

    def select(self, *_args, **_kwargs):
        self.action = "select"
        return self

    def eq(self, key, value):
        self.filters[key] = value
        return self

    def limit(self, _value):
        return self

    def single(self):
        return self

    def insert(self, payload):
        self.action = "insert"
        self.payload = payload
        return self

    def update(self, payload):
        self.action = "update"
        self.payload = payload
        return self

    def execute(self):
        return self.service.execute(self.table_name, self.action, self.payload, self.filters)


class _FakeService:
    def __init__(self, users, duplicate_insert=False):
        self.users = users
        self.duplicate_insert = duplicate_insert

    def table(self, table_name):
        return _FakeQuery(self, table_name, "select")

    def execute(self, table_name, action, payload, filters):
        if table_name != "users":
            return _FakeExecuteResult([])

        if action == "select":
            rows = [
                row for row in self.users
                if all(row.get(key) == value for key, value in filters.items())
            ]
            if "id" in filters and rows:
                return _FakeExecuteResult(rows[0])
            return _FakeExecuteResult(rows)

        if action == "insert":
            if self.duplicate_insert:
                raise Exception("duplicate key value violates unique constraint users_email_key")
            inserted = dict(payload)
            self.users.append(inserted)
            return _FakeExecuteResult([inserted])

        if action == "update":
            for row in self.users:
                if all(row.get(key) == value for key, value in filters.items()):
                    row.update(payload)
            return _FakeExecuteResult([])

        raise AssertionError(f"Unexpected action: {action}")


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

    def test_duplicate_insert_falls_back_to_existing_user(self, monkeypatch):
        users = [{
            "id": "existing-user",
            "email": "alice@example.com",
            "username": "alice",
            "auth_provider": "email",
            "starknet_auth": False,
        }]
        service = _FakeService(users, duplicate_insert=True)

        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_ID", "app", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_SECRET", "secret", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "WELCOME_BONUS", 100, raising=False)
        monkeypatch.setattr(starknet_routes.db, "get_service_client", lambda: service)
        monkeypatch.setattr(starknet_routes, "_verify_privy_token", lambda _token: {"sub": "did:privy:new"})
        monkeypatch.setattr(starknet_routes, "get_user_email", lambda _did: _async_result("alice@example.com"))
        monkeypatch.setattr(
            starknet_routes,
            "_ensure_privy_starknet_wallet",
            lambda _did: _async_result(({
                "address": "0xabc",
                "id": "wallet-1",
                "public_key": "pub-1",
            }, True)),
        )
        monkeypatch.setattr(starknet_routes.Auth, "create_jwt", lambda user_id: f"jwt-{user_id}")

        result = asyncio.run(starknet_routes.starknet_auth_email(
            StarknetAuthRequest(email="alice@example.com", privy_token="x" * 20),
            BackgroundTasks(),
            None,
        ))

        assert result.success is True
        assert result.data["user"]["id"] == "existing-user"
        assert users[0]["starknet_wallet_id"] == "wallet-1"
        assert users[0]["privy_did"] == "did:privy:new"

    def test_incomplete_did_link_is_relinked(self, monkeypatch):
        users = [{
            "id": "existing-user",
            "email": "alice@example.com",
            "username": "alice",
            "auth_provider": "guest",
            "starknet_auth": False,
            "privy_did": "did:privy:old",
        }]
        service = _FakeService(users)

        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_ID", "app", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_SECRET", "secret", raising=False)
        monkeypatch.setattr(starknet_routes.db, "get_service_client", lambda: service)
        monkeypatch.setattr(starknet_routes, "_verify_privy_token", lambda _token: {"sub": "did:privy:new"})
        monkeypatch.setattr(starknet_routes, "get_user_email", lambda _did: _async_result("alice@example.com"))
        monkeypatch.setattr(
            starknet_routes,
            "_ensure_privy_starknet_wallet",
            lambda _did: _async_result(({
                "address": "0xdef",
                "id": "wallet-2",
                "public_key": "pub-2",
            }, False)),
        )
        monkeypatch.setattr(starknet_routes.Auth, "create_jwt", lambda user_id: f"jwt-{user_id}")

        result = asyncio.run(starknet_routes.starknet_auth_email(
            StarknetAuthRequest(email="alice@example.com", privy_token="x" * 20),
            BackgroundTasks(),
            None,
        ))

        assert result.success is True
        assert users[0]["privy_did"] == "did:privy:new"
        assert users[0]["starknet_wallet_id"] == "wallet-2"

    def test_active_did_conflict_still_raises_409(self, monkeypatch):
        users = [{
            "id": "existing-user",
            "email": "alice@example.com",
            "username": "alice",
            "auth_provider": "privy_starknet",
            "starknet_auth": True,
            "starknet_address": "0xabc",
            "starknet_wallet_id": "wallet-live",
            "privy_did": "did:privy:old",
        }]
        service = _FakeService(users)

        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_ID", "app", raising=False)
        monkeypatch.setattr(starknet_routes.settings, "PRIVY_APP_SECRET", "secret", raising=False)
        monkeypatch.setattr(starknet_routes.db, "get_service_client", lambda: service)
        monkeypatch.setattr(starknet_routes, "_verify_privy_token", lambda _token: {"sub": "did:privy:new"})
        monkeypatch.setattr(starknet_routes, "get_user_email", lambda _did: _async_result("alice@example.com"))
        monkeypatch.setattr(
            starknet_routes,
            "_ensure_privy_starknet_wallet",
            lambda _did: _async_result(({
                "address": "0xabc",
                "id": "wallet-live",
                "public_key": "pub-live",
            }, False)),
        )

        with pytest.raises(starknet_routes.HTTPException) as exc_info:
            asyncio.run(starknet_routes.starknet_auth_email(
                StarknetAuthRequest(email="alice@example.com", privy_token="x" * 20),
                BackgroundTasks(),
                None,
            ))

        assert exc_info.value.status_code == 409


async def _async_result(value):
    return value


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
