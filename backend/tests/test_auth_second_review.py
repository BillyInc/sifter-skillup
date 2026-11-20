"""Second independent review of the authentication hardening PR.

Written before the fixes: each class fails on the previous code.
"""
import re
import secrets
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

import main  # noqa: F401  (imports every mounted route module so mock_db patches them)
import auth_rate_limit
from auth import Auth
from tests.test_auth_hardening import FakeService, _admin, _bearer, _install

REPO = Path(__file__).resolve().parents[2]


class _MfaLookupFails(FakeService):
    """Service whose user_mfa_settings read raises ``exc``."""

    def __init__(self, tables, exc):
        super().__init__(tables)
        self._exc = exc

    def table(self, name):
        q = super().table(name)
        if name == "user_mfa_settings":
            exc = self._exc

            def boom():
                raise exc

            q.execute = boom
        return q


def _install_failing_mfa(mock_db, tables, exc):
    svc = _MfaLookupFails(tables, exc)
    mock_db.get_service_client.return_value = svc
    mock_db.get_client.return_value = svc
    return svc


def _api_error(code, message):
    from postgrest.exceptions import APIError
    return APIError({"code": code, "message": message, "details": None, "hint": None})


@pytest.fixture(autouse=True)
def _fresh_limiters():
    auth_rate_limit.reset_all()
    yield
    auth_rate_limit.reset_all()


# --------------------------------------------------------------------------
# 1. require_admin must not fail open when the MFA lookup errors
# --------------------------------------------------------------------------
class TestRequireAdminFailsClosed:
    URL = "/api/institutions/me/team"

    def test_a_lookup_error_is_a_503_not_a_skipped_check(self, client, mock_db):
        _install_failing_mfa(mock_db, {"users": [_admin()]}, RuntimeError("connection reset by peer"))
        r = client.get(self.URL, headers=_bearer(mfa_verified=False))
        assert r.status_code == 503, r.text

    def test_a_missing_table_keeps_the_pre_migration_behaviour(self, client, mock_db):
        _install_failing_mfa(
            mock_db, {"users": [_admin()]},
            _api_error("42P01", 'relation "skillup_dev.user_mfa_settings" does not exist'),
        )
        r = client.get(self.URL, headers=_bearer(mfa_verified=False))
        assert r.status_code not in (428, 503), r.text

    def test_enabled_mfa_still_needs_a_verified_session(self, client, mock_db):
        _install(mock_db, {"users": [_admin()], "user_mfa_settings": [{"status": "enabled"}]})
        assert client.get(self.URL, headers=_bearer(mfa_verified=False)).status_code == 428

    def test_one_shared_status_lookup_serves_both_callers(self, mock_db):
        assert hasattr(Auth, "admin_mfa_status")
        _install(mock_db, {"user_mfa_settings": [{"status": "enabled"}]})
        assert Auth.admin_mfa_status("admin-1") == "enabled"
        _install_failing_mfa(mock_db, {}, RuntimeError("timeout"))
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as info:
            Auth.admin_mfa_status("admin-1")
        assert info.value.status_code == 503
        _install_failing_mfa(mock_db, {}, _api_error("PGRST205", "Could not find the table"))
        assert Auth.admin_mfa_status("admin-1") is None
        import inspect
        assert "Auth.admin_mfa_status" in inspect.getsource(main._admin_mfa_status)


# --------------------------------------------------------------------------
# 2. The JWT guard must not accept shipped or public placeholder secrets
# --------------------------------------------------------------------------
class TestJwtGuardRejectsPlaceholders:
    @pytest.mark.parametrize("secret", [
        "generate-a-strong-random-secret-min-32-chars",
        "ci-test-secret-must-be-at-least-32-characters-long",
        "min_32_char_secret_padded_out_to_forty_chars",
        "your-secret-key-goes-here-and-it-is-long-enough",
        "change-me-in-production-please-change-me-now",
        "this-is-an-example-secret-value-1234567890",
        "placeholder-placeholder-placeholder-placeholder",
        "a" * 40,
        "abababababababababababababababababababab",
    ])
    def test_placeholders_and_low_variety_secrets_are_refused(self, secret):
        import config
        with pytest.raises(RuntimeError):
            config.check_jwt_secret(secret, debug=False)

    def test_a_random_secret_is_accepted(self):
        import config
        config.check_jwt_secret(secrets.token_urlsafe(48), debug=False)

    def test_debug_may_still_use_a_weak_secret(self):
        import config
        config.check_jwt_secret("generate-a-strong-random-secret-min-32-chars", debug=True)

    def test_the_suite_and_ci_secrets_pass_the_guard(self):
        import config
        from tests import conftest  # noqa: F401
        import os
        config.check_jwt_secret(os.environ["JWT_SECRET"], debug=False)
        for wf in ("ci.yml", "deploy-backend.yml", "deploy-prod.yml"):
            text = (REPO / ".github" / "workflows" / wf).read_text(encoding="utf-8")
            assert "ci-test-secret" not in text, wf
            for value in re.findall(r"JWT_SECRET:\s*(\S+)", text):
                config.check_jwt_secret(value.strip("'\""), debug=False)

    def test_the_example_env_ships_no_usable_secret(self):
        text = (REPO / "backend" / ".env.example").read_text(encoding="utf-8")
        line = next(ln for ln in text.splitlines() if ln.startswith("JWT_SECRET"))
        assert line.strip() == "JWT_SECRET=", line
        assert "token_urlsafe(48)" in text

    def test_the_demo_setup_doc_shows_no_short_secret(self):
        text = (REPO / "DEMO_DAY_SETUP.md").read_text(encoding="utf-8")
        assert "min_32_char_secret" not in text
        assert "token_urlsafe(48)" in text


# --------------------------------------------------------------------------
# 3. Eviction must never reset a victim's counters; a full bucket fails closed
# --------------------------------------------------------------------------
class TestLimiterNeverEvictsActiveBlocks:
    def test_one_full_bucket_does_not_block_another(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=30)
        for i in range(30):
            lim.record("login_fail_pair", f"k{i}")
        assert lim.retry_after("email_code_pair", "someone@x.test|1.1.1.1") is None

    def test_a_locked_out_key_is_never_evicted(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=40)
        for _ in range(lim._limits["login_fail_pair"][1]):
            lim.record("login_fail_pair", "victim")
        assert lim.retry_after("login_fail_pair", "victim") is not None  # now blocked
        for i in range(500):
            lim.record("login_fail_pair", f"noise{i}")
        assert lim.retry_after("login_fail_pair", "victim") is not None


# --------------------------------------------------------------------------
# 4. A school behind one address must not be locked out by one abuser
# --------------------------------------------------------------------------
class TestAddressCeilingsFitSchools:
    def test_final_ceilings(self):
        L = auth_rate_limit.LIMITS
        assert L["login_fail_ip"] == (15 * 60, 200)
        assert L["email_code_ip"] == (60 * 60, 60)
        assert L["reset_request_ip"] == (60 * 60, 60)
        assert L["reset_confirm_fail_ip"] == (15 * 60, 100)

    def test_address_backoff_is_capped_at_fifteen_minutes(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0])
        window, maximum = lim._limits["login_fail_ip"]
        for _ in range(maximum):
            lim.record("login_fail_ip", "9.9.9.9")
        waits = []
        for _ in range(12):  # keep hammering through repeated lockouts
            wait = lim.retry_after("login_fail_ip", "9.9.9.9")
            assert wait is not None
            waits.append(wait)
            now[0] += wait + 1
            for _ in range(maximum):
                lim.record("login_fail_ip", "9.9.9.9")
        assert max(waits) <= 15 * 60, waits

    def test_account_backoff_keeps_its_longer_cap(self):
        assert auth_rate_limit.MAX_BACKOFF_SECONDS == 4 * 60 * 60
        assert auth_rate_limit.BACKOFF_CAPS["login_fail_ip"] == 15 * 60

    def test_a_class_signing_up_together_is_not_throttled(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
        monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 1, raising=False)
        _install(mock_db, {"users": []})
        with patch("main._issue_signup_code_quietly", new=AsyncMock(return_value=None)):
            codes = [client.post("/api/auth/email-code/request", headers={"X-Forwarded-For": "5.5.5.5"},
                                 json={"email": f"student{i}@school.test"}).status_code for i in range(40)]
        assert set(codes) == {200}, codes


# --------------------------------------------------------------------------
# 5. Login timing: unknown and known emails do the same bcrypt work
# --------------------------------------------------------------------------
class TestLoginTimingDoesNotRevealAccounts:
    def _login(self, client, email="ghost@x.test"):
        return client.post("/api/auth/login", json={"email": email, "password": "x"})

    def test_an_unknown_email_still_runs_one_password_check(self, client, mock_db):
        _install(mock_db, {"users": []})
        with patch("main.bcrypt.checkpw", return_value=False) as check:
            assert self._login(client).status_code == 401
        assert check.call_count == 1

    def test_an_account_without_a_password_still_runs_one_password_check(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="tg@x.test", password_hash=None)]})
        with patch("main.bcrypt.checkpw", return_value=False) as check:
            assert self._login(client, "tg@x.test").status_code == 401
        assert check.call_count == 1

    def test_a_known_account_runs_exactly_one_check_and_still_logs_in(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        assert client.post("/api/auth/login",
                           json={"email": "known@x.test", "password": "correct horse"}).status_code == 200


# --------------------------------------------------------------------------
# 6. The "account exists" notice goes out at most once a day per address
# --------------------------------------------------------------------------
class TestAccountExistsNoticeIsThrottled:
    @pytest.fixture(autouse=True)
    def _no_dev_codes(self, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)

    def test_one_notice_per_address_per_day_and_the_response_never_changes(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="owner@x.test")]})
        notice = AsyncMock(return_value=None)
        with patch("main._send_account_exists_notice", new=notice):
            bodies = [client.post("/api/auth/email-code/request", json={"email": "owner@x.test"})
                      for _ in range(3)]
        assert {r.status_code for r in bodies} == {200}
        assert len({r.text for r in bodies}) == 1
        assert notice.await_count == 1

    def test_a_different_address_still_gets_its_own_notice(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="owner@x.test")]})
        notice = AsyncMock(return_value=None)
        with patch("main._send_account_exists_notice", new=notice):
            client.post("/api/auth/email-code/request", json={"email": "owner@x.test"})
            client.post("/api/auth/email-code/request", json={"email": "owner@x.test"})
        assert notice.await_count == 1
        auth_rate_limit.reset_all()
        _install(mock_db, {"users": [_admin(email="other@x.test")]})
        with patch("main._send_account_exists_notice", new=notice):
            client.post("/api/auth/email-code/request", json={"email": "other@x.test"})
        assert notice.await_count == 2

    def test_the_notice_window_is_a_day(self):
        assert auth_rate_limit.LIMITS["account_exists_notice_email"] == (24 * 60 * 60, 1)
