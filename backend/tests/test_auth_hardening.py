"""Authentication hardening: MFA downgrade, brute force, enumeration, secrets.

Each class pins one finding from the security audit. They were written first and
fail on the previous code.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import bcrypt
import pytest

import auth_rate_limit
from auth import Auth


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=4)).decode()


def _result(data):
    r = MagicMock()
    r.data = data
    return r


class FakeService:
    """Table-aware stand-in for the Supabase service client."""

    def __init__(self, tables: dict):
        self.tables = tables
        self.updates = []   # (table, payload)
        self.upserts = []   # (table, payload)

    def table(self, name):
        svc = self
        data = self.tables.get(name, [])

        class Q:
            def __init__(self):
                self._mode = "select"
                self._payload = None

            def select(self, *a, **k):
                return self

            def eq(self, *a, **k):
                return self

            def neq(self, *a, **k):
                return self

            def gt(self, *a, **k):
                return self

            def order(self, *a, **k):
                return self

            def limit(self, *a, **k):
                return self

            def single(self):
                self._mode = "single"
                return self

            def update(self, payload):
                svc.updates.append((name, dict(payload)))
                self._mode = "update"
                return self

            def upsert(self, payload, **k):
                svc.upserts.append((name, dict(payload)))
                self._mode = "upsert"
                return self

            def insert(self, payload, **k):
                self._mode = "insert"
                return self

            def delete(self):
                self._mode = "delete"
                return self

            def execute(self):
                if self._mode == "single":
                    return _result(data[0] if data else None)
                return _result(list(data))

        return Q()


def _install(mock_db, tables):
    svc = FakeService(tables)
    mock_db.get_service_client.return_value = svc
    mock_db.get_client.return_value = svc
    return svc


def _admin(**over):
    row = {
        "id": "admin-1",
        "email": "admin@school.test",
        "account_type": "institution_admin",
        "password_hash": _hash("correct horse"),
        "is_deleted": False,
        "token_version": 0,
    }
    row.update(over)
    return row


def _bearer(user_id="admin-1", mfa_verified=False, tv=0):
    token = Auth.create_jwt(user_id, mfa_verified=mfa_verified, token_version=tv)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def _fresh_limiters():
    auth_rate_limit.reset_all()
    yield
    auth_rate_limit.reset_all()


# --------------------------------------------------------------------------
# 1. MFA downgrade
# --------------------------------------------------------------------------
class TestMfaCannotBeDowngradedByTheSessionItProtects:
    def test_deferring_enabled_mfa_requires_a_verified_session(self, client, mock_db):
        svc = _install(mock_db, {
            "users": [_admin()],
            "user_mfa_settings": [{"status": "enabled"}],
        })
        r = client.post("/api/auth/mfa/defer", headers=_bearer(mfa_verified=False),
                        json={"password": "correct horse"})
        assert r.status_code == 428, r.text
        assert not [u for t, u in svc.upserts if t == "user_mfa_settings"], \
            "status was changed by a session that never proved MFA"

    def test_requesting_a_code_does_not_downgrade_enabled_mfa(self, client, mock_db):
        svc = _install(mock_db, {
            "users": [_admin()],
            "user_mfa_settings": [{"status": "enabled"}],
        })
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            r = client.post("/api/auth/mfa/request", headers=_bearer(), json={})
        assert r.status_code == 200, r.text
        statuses = [u.get("status") for t, u in svc.upserts if t == "user_mfa_settings"]
        assert "pending_setup" not in statuses

    def test_first_time_setup_still_works(self, client, mock_db):
        svc = _install(mock_db, {"users": [_admin()], "user_mfa_settings": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            r = client.post("/api/auth/mfa/request", headers=_bearer(), json={})
        assert r.status_code == 200, r.text
        statuses = [u.get("status") for t, u in svc.upserts if t == "user_mfa_settings"]
        assert statuses == ["pending_setup"]

    def test_deferral_needs_the_password(self, client, mock_db):
        _install(mock_db, {"users": [_admin()], "user_mfa_settings": []})
        r = client.post("/api/auth/mfa/defer", headers=_bearer(), json={})
        assert r.status_code == 403, r.text
        r = client.post("/api/auth/mfa/defer", headers=_bearer(), json={"password": "wrong"})
        assert r.status_code == 403, r.text

    def test_deferral_with_the_password_works(self, client, mock_db):
        svc = _install(mock_db, {"users": [_admin()], "user_mfa_settings": []})
        r = client.post("/api/auth/mfa/defer", headers=_bearer(),
                        json={"password": "correct horse"})
        assert r.status_code == 200, r.text
        assert [u["status"] for t, u in svc.upserts if t == "user_mfa_settings"] == ["deferred"]


# --------------------------------------------------------------------------
# 2. Brute force
# --------------------------------------------------------------------------
class TestLoginIsRateLimited:
    def test_repeated_failures_lock_the_account_out_temporarily(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="a@b.test")]})
        codes = [
            client.post("/api/auth/login", json={"email": "a@b.test", "password": "nope"}).status_code
            for _ in range(35)   # unknown client address: the account ceiling is 30 failures
        ]
        assert codes[0] == 401
        assert 429 in codes, codes
        locked = client.post("/api/auth/login", json={"email": "a@b.test", "password": "correct horse"})
        assert locked.status_code == 429
        assert int(locked.headers["Retry-After"]) > 0

    def test_a_good_login_is_not_counted(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="a@b.test")]})
        for _ in range(15):
            r = client.post("/api/auth/login", json={"email": "a@b.test", "password": "correct horse"})
            assert r.status_code == 200, r.text

    def test_login_response_never_carries_secrets(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="a@b.test")]})
        body = client.post("/api/auth/login", json={"email": "a@b.test", "password": "correct horse"}).json()
        user = body["data"]["user"]
        assert "password_hash" not in user and "token_version" not in user


class TestEmailCodeRequests:
    def test_registered_and_unknown_addresses_look_the_same(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        issue = AsyncMock(return_value="123456")
        with patch("main._issue_email_code", new=issue):
            known = client.post("/api/auth/email-code/request", json={"email": "known@x.test"})
            auth_rate_limit.reset_all()
            _install(mock_db, {"users": []})
            unknown = client.post("/api/auth/email-code/request", json={"email": "new@x.test"})
        assert known.status_code == unknown.status_code == 200
        assert set(known.json()["data"]) - {"devCode"} == set(unknown.json()["data"]) - {"devCode"}

    def test_a_registered_address_is_not_emailed_a_signup_code(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        issue = AsyncMock(return_value="123456")
        with patch("main._issue_email_code", new=issue):
            client.post("/api/auth/email-code/request", json={"email": "known@x.test"})
        issue.assert_not_called()

    def test_email_bombing_one_address_is_limited(self, client, mock_db):
        _install(mock_db, {"users": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            codes = [
                client.post("/api/auth/email-code/request", json={"email": "v@x.test"}).status_code
                for _ in range(14)   # per-email ceiling is 10 an hour
            ]
        assert codes[0] == 200
        assert 429 in codes, codes

    def test_password_reset_requests_are_limited(self, client, mock_db):
        _install(mock_db, {"users": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            codes = [
                client.post("/api/auth/password-reset/request", json={"email": "v@x.test"}).status_code
                for _ in range(14)   # per-email ceiling is 10 an hour
            ]
        assert 429 in codes, codes

    def test_wrong_reset_codes_are_limited(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="v@x.test")]})
        import email_codes
        with patch("main.email_codes.verify_code", new=AsyncMock(return_value=email_codes.INVALID)):
            codes = [
                client.post("/api/auth/password-reset/confirm",
                            json={"email": "v@x.test", "code": "111111", "password": "newpass1"}).status_code
                for _ in range(10)
            ]
        assert codes[0] == 400
        assert 429 in codes, codes


# --------------------------------------------------------------------------
# 3. Dev codes need an explicit opt-in
# --------------------------------------------------------------------------
class TestDevCodes:
    def test_debug_alone_does_not_enable_dev_codes(self):
        import config
        assert config.dev_codes_enabled(debug=True, allow_insecure=False, flag=True) is False
        assert config.dev_codes_enabled(debug=False, allow_insecure=True, flag=True) is False
        assert config.dev_codes_enabled(debug=True, allow_insecure=True, flag=True) is True
        assert config.dev_codes_enabled(debug=True, allow_insecure=True, flag=False) is False

    def test_000000_is_rejected_when_dev_codes_are_off(self, client, mock_db, monkeypatch):
        from config import settings
        import email_codes
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": [_admin(email="v@x.test")]})
        with patch("main.email_codes.verify_code", new=AsyncMock(return_value=email_codes.INVALID)):
            r = client.post("/api/auth/password-reset/confirm",
                            json={"email": "v@x.test", "code": "000000", "password": "newpass1"})
        assert r.status_code == 400


# --------------------------------------------------------------------------
# 4. Signing secret
# --------------------------------------------------------------------------
class TestJwtSecretGuard:
    def test_production_refuses_the_default_or_a_short_secret(self):
        import config
        with pytest.raises(RuntimeError):
            config.check_jwt_secret("change-me-in-production", debug=False)
        with pytest.raises(RuntimeError):
            config.check_jwt_secret("short-secret", debug=False)

    def test_a_strong_secret_is_accepted(self):
        import config
        import secrets
        config.check_jwt_secret(secrets.token_urlsafe(48), debug=False)

    def test_debug_may_keep_a_weak_secret(self):
        import config
        config.check_jwt_secret("change-me-in-production", debug=True)


# --------------------------------------------------------------------------
# 5. Token revocation
# --------------------------------------------------------------------------
class TestPasswordResetRevokesOldTokens:
    def test_reset_bumps_the_token_version_and_signs_out_devices(self, client, mock_db):
        import email_codes
        svc = _install(mock_db, {
            "users": [_admin(email="v@x.test", token_version=2)],
            "active_sessions": [],
        })
        with patch("main.email_codes.verify_code", new=AsyncMock(return_value=email_codes.OK)):
            r = client.post("/api/auth/password-reset/confirm",
                            json={"email": "v@x.test", "code": "123456", "password": "brand-new-pass"})
        assert r.status_code == 200, r.text
        user_updates = [u for t, u in svc.updates if t == "users"]
        assert any(u.get("token_version") == 3 and "password_hash" in u for u in user_updates), user_updates
        assert any(t == "active_sessions" for t, _ in svc.updates)

    def test_an_old_token_stops_working_after_the_bump(self, client, mock_db):
        _install(mock_db, {"users": [_admin(token_version=1)]})
        r = client.get("/api/users/me", headers=_bearer(tv=0))
        assert r.status_code == 401

    def test_a_current_token_works(self, client, mock_db):
        _install(mock_db, {"users": [_admin(token_version=1)]})
        r = client.get("/api/users/me", headers=_bearer(tv=1))
        assert r.status_code == 200, r.text

    def test_tokens_issued_before_the_feature_still_work(self, client, mock_db):
        row = _admin()
        row.pop("token_version")  # column not migrated yet
        _install(mock_db, {"users": [row]})
        old = Auth.create_jwt("admin-1")
        r = client.get("/api/users/me", headers={"Authorization": f"Bearer {old}"})
        assert r.status_code == 200, r.text

    def test_reset_works_before_the_column_exists(self, client, mock_db):
        import email_codes
        row = _admin(email="v@x.test")
        row.pop("token_version")
        svc = _install(mock_db, {"users": [row], "active_sessions": []})
        with patch("main.email_codes.verify_code", new=AsyncMock(return_value=email_codes.OK)):
            r = client.post("/api/auth/password-reset/confirm",
                            json={"email": "v@x.test", "code": "123456", "password": "brand-new-pass"})
        assert r.status_code == 200, r.text
        assert any("password_hash" in u for t, u in svc.updates if t == "users")


# --------------------------------------------------------------------------
# 6. Secrets never leave in a user row
# --------------------------------------------------------------------------
class TestUserRowsAreSanitised:
    def test_sanitize_strips_secrets_without_mutating_the_input(self):
        from user_sanitize import sanitize_user_row
        row = {"id": "u", "email": "e", "password_hash": "x", "token_version": 3, "_mfa_verified": True}
        out = sanitize_user_row(row)
        assert out == {"id": "u", "email": "e"}
        assert "password_hash" in row

    def test_response_model_is_a_safety_net_for_nested_rows(self):
        from models import ResponseModel
        data = ResponseModel(data={"user": {"id": "u", "password_hash": "x"}, "rows": [{"password_hash": "y", "id": 1}]}).model_dump()["data"]
        assert "password_hash" not in data["user"]
        assert "password_hash" not in data["rows"][0]

    def test_onboarding_complete_does_not_return_the_hash(self, client, mock_db):
        _install(mock_db, {"users": [_admin(account_type="student")]})
        r = client.post("/api/users/onboarding-complete", headers=_bearer(), json={"account_type": "student"})
        assert r.status_code == 200, r.text
        user = r.json()["data"]
        assert "password_hash" not in user and "token_version" not in user

    def test_guest_and_telegram_style_responses_are_clean(self, client, mock_db):
        _install(mock_db, {"users": [_admin()]})
        with patch("main.Auth.verify_telegram_init_data", return_value={"id": 7, "username": "t"}):
            r = client.post("/api/auth/telegram", json={"initData": "x"})
        assert r.status_code == 200, r.text
        assert "password_hash" not in r.json()["data"]["user"]
