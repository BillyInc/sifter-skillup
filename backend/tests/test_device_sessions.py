"""
Tests for device_sessions.py and session_middleware.py.
"""
import asyncio
import importlib
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import device_sessions
import session_middleware
from auth import Auth
from main import app


SAMPLE_USER = {
    "id": "user-dev-1",
    "username": "DevTester",
    "auth_provider": "guest",
    "points": 0,
}


@pytest.fixture
def auth_client(monkeypatch):
    """Client with Auth.get_current_user overridden to return SAMPLE_USER."""
    async def fake_user():
        return SAMPLE_USER

    app.dependency_overrides[Auth.get_current_user] = fake_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────
# device_sessions.py
# ─────────────────────────────────────────────────────────────

class TestRegisterDevice:
    def test_register_device_creates_session(self, auth_client, mock_db, monkeypatch):
        # Force enforcement on for this test
        monkeypatch.setattr(device_sessions.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)

        sc = mock_db.get_service_client.return_value
        # _get_existing_session → empty
        sc.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        # _create_session insert
        sc.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{"id": "sess-1", "user_id": SAMPLE_USER["id"], "device_id": "devA"}]
        )

        resp = auth_client.post(
            "/api/devices/register",
            json={
                "device_id": "devA",
                "device_name": "Pixel 8",
                "platform": "android",
                "app_version": "1.0.0",
                "push_token": "tok-A",
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["data"]["registered"] is True
        # Inserted into active_sessions
        insert_calls = [c.args[0] for c in sc.table.return_value.insert.call_args_list]
        assert any("device_id" in args for args in insert_calls)

    def test_second_device_revokes_first(self, auth_client, mock_db, monkeypatch):
        monkeypatch.setattr(device_sessions.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)

        push_mock = AsyncMock()
        monkeypatch.setattr(device_sessions, "_send_logout_push", push_mock)

        # _get_existing_session returns an existing session on a different device
        existing_session = {
            "id": "sess-old",
            "device_id": "devA",
            "push_token": "tok-A",
            "user_id": SAMPLE_USER["id"],
            "is_active": True,
        }
        sc = mock_db.get_service_client.return_value
        sc.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[existing_session]
        )
        sc.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        sc.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{"id": "sess-new", "device_id": "devB"}]
        )

        resp = auth_client.post(
            "/api/devices/register",
            json={
                "device_id": "devB",
                "device_name": "iPhone 15",
                "platform": "ios",
                "app_version": "1.0.0",
                "push_token": "tok-B",
            },
        )
        assert resp.status_code == 200, resp.text
        push_mock.assert_called_once()
        args, _ = push_mock.call_args
        assert args[0] == "tok-A"  # old push token


class TestValidateDeviceHeader:
    def test_validate_device_no_row_returns_false(self, mock_db, monkeypatch):
        monkeypatch.setattr(device_sessions.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        sc = mock_db.get_service_client.return_value
        sc.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        assert device_sessions.validate_device_header("user-x", "devA") is False


# ─────────────────────────────────────────────────────────────
# session_middleware.py
# ─────────────────────────────────────────────────────────────

class TestSessionMiddleware:
    def test_middleware_missing_x_device_id_rejects(self, mock_db, monkeypatch):
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        # Need a valid bearer token whose `sub` decodes successfully so the
        # middleware actually reaches the device-id check.
        token = Auth.create_jwt("user-dev-1")
        with TestClient(app) as c:
            r = c.get("/api/devices/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 401
        body = r.json()
        assert body.get("error") == "device_required"

    def test_middleware_skip_paths_pass_through(self, mock_db, monkeypatch):
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        with TestClient(app) as c:
            # /docs is in skip prefixes
            r = c.get("/docs")
            assert r.status_code in (200, 404)  # exists in dev, otherwise 404 - either is "not 401"
            assert r.status_code != 401
            # /health is also skipped
            r2 = c.get("/health")
            assert r2.status_code == 200

    def test_middleware_drain_no_longer_skipped(self):
        # /api/sync/drain must NOT be in the middleware skip list
        for prefix in session_middleware._SKIP_PREFIXES:
            assert not "/api/sync/drain".startswith(prefix), \
                f"/api/sync/drain unexpectedly skipped by prefix {prefix!r}"


# ─────────────────────────────────────────────────────────────
# get_my_session strips push_token
# ─────────────────────────────────────────────────────────────

class TestGetMySession:
    def test_get_my_session_strips_push_token(self, auth_client, mock_db):
        sc = mock_db.get_service_client.return_value
        sc.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "id": "sess-1",
                "user_id": SAMPLE_USER["id"],
                "device_id": "devA",
                "push_token": "SECRET-TOKEN",
            }]
        )
        r = auth_client.get("/api/devices/me")
        assert r.status_code == 200, r.text
        data = r.json()["data"]
        assert "push_token" not in data
        assert data["device_id"] == "devA"


# ─────────────────────────────────────────────────────────────
# Force-logout HMAC
# ─────────────────────────────────────────────────────────────

class TestForceLogoutPayload:
    def test_force_logout_payload_has_hmac(self, monkeypatch):
        captured = {}

        class FakeAsyncClient:
            def __init__(self, *a, **kw):
                pass
            async def __aenter__(self):
                return self
            async def __aexit__(self, *a):
                return False
            async def post(self, url, headers=None, json=None):
                captured["url"] = url
                captured["json"] = json
                resp = MagicMock()
                resp.status_code = 200
                return resp

        monkeypatch.setattr(device_sessions.httpx, "AsyncClient", FakeAsyncClient)
        # Force "legacy" path so we don't need google-auth
        monkeypatch.setattr(device_sessions.settings, "FCM_SERVICE_ACCOUNT_PATH", "", raising=False)
        monkeypatch.setattr(device_sessions.settings, "FCM_PROJECT_ID", "", raising=False)
        monkeypatch.setattr(device_sessions.settings, "FCM_SERVER_KEY", "fake-key", raising=False)

        asyncio.get_event_loop().run_until_complete(
            device_sessions._send_logout_push(
                push_token="device-fcm-token",
                new_device_name="iPhone 15",
                user_id="user-1",
                old_device_id="devA",
            )
        )
        payload = captured.get("json") or {}
        # Legacy shape: {"to":..., "data": {...}}
        data = payload.get("data") or {}
        assert data.get("hmac"), "HMAC field missing from FCM data payload"
        assert data["type"] == "FORCE_LOGOUT"
