"""
Tests for middleware/device_sessions.py and middleware/session_middleware.py
(the modules main.py actually serves).
"""
import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

import middleware.device_sessions as device_sessions
import middleware.session_middleware as session_middleware
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
        from unittest.mock import patch
        monkeypatch.setattr(device_sessions.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)

        # The live middleware.device_sessions notifies the old device via the
        # module-level `_send_logout_push(old_push_token, new_device_name)` coroutine
        # (the old FCMService.send_device_logout_notification path was refactored out).
        with patch('middleware.device_sessions._send_logout_push') as fcm_mock:
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
            # Verify FCMService was called with the old push token and new device name
            fcm_mock.assert_called_once()
            args, _ = fcm_mock.call_args
            assert args[0] == "tok-A"  # old push token
            assert args[1] == "iPhone 15"  # new device name


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
        # /api/sync/drain must NOT be in the SERVED middleware's skip list
        assert session_middleware.__name__ == "middleware.session_middleware"
        assert not session_middleware._should_skip("/api/sync/drain")
        for prefix in session_middleware._SKIP_PREFIXES:
            assert not "/api/sync/drain".startswith(prefix), \
                f"/api/sync/drain unexpectedly skipped by prefix {prefix!r}"

    def test_drain_without_device_id_is_rejected(self, mock_db, monkeypatch):
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        token = Auth.create_jwt("user-dev-1")
        with TestClient(app) as c:
            r = c.post("/api/sync/drain", json={}, headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 401
        assert r.json().get("error") == "device_required"

    def test_drain_with_unregistered_device_is_rejected(self, mock_db, monkeypatch):
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        monkeypatch.setattr(session_middleware, "validate_device_header", lambda user_id, device_id: False)
        token = Auth.create_jwt("user-dev-1")
        with TestClient(app) as c:
            r = c.post(
                "/api/sync/drain",
                json={},
                headers={"Authorization": f"Bearer {token}", "X-Device-Id": "not-registered"},
            )
        assert r.status_code == 401
        body = r.json()
        assert body.get("error") == "device_mismatch"
        # No internal detail (user id, device id, stack) in the response.
        assert "user-dev-1" not in r.text and "not-registered" not in r.text

    def test_drain_with_registered_device_reaches_the_route(self, mock_db, monkeypatch):
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        monkeypatch.setattr(session_middleware, "validate_device_header", lambda user_id, device_id: True)
        token = Auth.create_jwt("user-dev-1")
        with TestClient(app) as c:
            r = c.post(
                "/api/sync/drain",
                json={},
                headers={"Authorization": f"Bearer {token}", "X-Device-Id": "devA"},
            )
        # Whatever the route answers, it was not stopped by the device check.
        assert r.json().get("error") not in ("device_required", "device_mismatch")

    def test_middleware_caches_user_and_device_on_request_state(self, monkeypatch):
        from fastapi import Request
        from fastapi.responses import JSONResponse

        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", True, raising=False)
        monkeypatch.setattr(session_middleware, "validate_device_header", lambda user_id, device_id: True)
        token = Auth.create_jwt("user-dev-1")
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/sync/drain",
            "query_string": b"",
            "headers": [
                (b"authorization", f"Bearer {token}".encode()),
                (b"x-device-id", b"devA"),
            ],
        }
        seen = {}

        async def call_next(req):
            seen["user_id"] = req.state.user_id
            seen["device_id"] = req.state.device_id
            return JSONResponse({"ok": True})

        mw = session_middleware.DeviceSessionMiddleware(app=None)
        resp = asyncio.run(mw.dispatch(Request(scope), call_next))
        assert resp.status_code == 200
        assert seen == {"user_id": "user-dev-1", "device_id": "devA"}

    def test_user_id_extraction_uses_auth_decode_jwt_and_requires_exp_and_sub(self):
        import time

        import jwt as pyjwt
        from fastapi import Request

        def req_with(token):
            return Request({
                "type": "http", "method": "GET", "path": "/x", "query_string": b"",
                "headers": [(b"authorization", f"Bearer {token}".encode())],
            })

        settings = session_middleware.settings
        good = Auth.create_jwt("user-dev-1")
        assert session_middleware._extract_user_id_from_bearer(req_with(good)) == "user-dev-1"

        no_exp = pyjwt.encode({"sub": "user-dev-1"}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        assert session_middleware._extract_user_id_from_bearer(req_with(no_exp)) is None

        no_sub = pyjwt.encode(
            {"exp": int(time.time()) + 600}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
        )
        assert session_middleware._extract_user_id_from_bearer(req_with(no_sub)) is None

        expired = pyjwt.encode(
            {"sub": "user-dev-1", "exp": int(time.time()) - 60},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )
        assert session_middleware._extract_user_id_from_bearer(req_with(expired)) is None
        assert session_middleware._extract_user_id_from_bearer(req_with("garbage")) is None

    def test_user_id_extraction_never_raises_on_unexpected_errors(self, monkeypatch):
        from fastapi import Request

        def boom(token):
            raise RuntimeError("secret internals")

        monkeypatch.setattr(session_middleware.Auth, "decode_jwt", staticmethod(boom))
        req = Request({
            "type": "http", "method": "GET", "path": "/x", "query_string": b"",
            "headers": [(b"authorization", b"Bearer abc")],
        })
        assert session_middleware._extract_user_id_from_bearer(req) is None


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


class TestGuestAuthRegistersDevice:
    """Guest auth must create a device session like every other auth route.

    It was the only one of the five that skipped _post_auth_device_register.
    With SINGLE_DEVICE_ENFORCEMENT on, that left guests with no active_sessions
    row, so validate_device_header rejected every subsequent authenticated
    request with device_mismatch — and guest is how the web app browses, so
    nothing worked past sign-in.
    """

    @staticmethod
    def _stub_user(monkeypatch):
        """conftest's autouse DB mock makes _create_user return a MagicMock,
        which cannot be JSON-serialised — the response would fail to encode for
        reasons unrelated to what these tests assert."""
        import main as main_mod
        monkeypatch.setattr(
            main_mod, "_create_user",
            lambda **kw: {"id": "guest-1", "username": "Guest_x",
                          "auth_provider": "guest", "points": 0},
        )
        monkeypatch.setattr(Auth, "create_jwt", lambda uid: "test.jwt.token")

    def test_guest_auth_registers_the_device(self, monkeypatch):
        self._stub_user(monkeypatch)
        registered = {}

        async def fake_register(user_id, device_id, device_name, platform,
                                app_version, push_token):
            registered.update(
                user_id=user_id, device_id=device_id, platform=platform
            )

        import middleware.device_sessions as md
        monkeypatch.setattr(md, "register_device_for_user", fake_register)

        with TestClient(app) as c:
            res = c.post(
                "/api/auth/guest",
                json={},
                headers={"X-Device-Id": "web_test_device", "X-Platform": "web"},
            )

        assert res.status_code == 200, res.text
        assert registered.get("device_id") == "web_test_device", (
            "guest auth did not register the device — every authenticated "
            "request after this will 401 with device_mismatch"
        )
        assert registered.get("platform") == "web"

    def test_guest_auth_survives_an_empty_body(self, monkeypatch):
        """The route reads request.json() for a body device_id; a client that
        sends no body at all must still authenticate."""
        self._stub_user(monkeypatch)

        async def fake_register(*a, **k):
            return None

        import middleware.device_sessions as md
        monkeypatch.setattr(md, "register_device_for_user", fake_register)

        with TestClient(app) as c:
            res = c.post("/api/auth/guest", headers={"X-Device-Id": "d1"})
        assert res.status_code == 200, res.text

