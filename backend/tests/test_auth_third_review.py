"""Third independent review of the authentication hardening PR.

Written before the fixes: each class fails on the previous code.

Design under test: the in-process limiter is a best-effort, per-worker safeguard.
Availability beats strictness: it never answers 429 because a table is full, it has
no global buckets, and it never hard-locks an account when the real client address
is unknown. The edge (nginx) is the primary rate limit.
"""
import threading
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
import yaml
from fastapi import HTTPException

import main  # noqa: F401  (imports every mounted route module so mock_db patches them)
import auth_rate_limit
from auth import Auth
from tests.test_auth_hardening import FakeService, _admin, _bearer, _install

REPO = Path(__file__).resolve().parents[2]


@pytest.fixture(autouse=True)
def _fresh_limiters():
    auth_rate_limit.reset_all()
    yield
    auth_rate_limit.reset_all()


@pytest.fixture
def trust_proxy(monkeypatch):
    from config import settings
    monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
    monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 1, raising=False)


def _api_error(code, message):
    from postgrest.exceptions import APIError
    return APIError({"code": code, "message": message, "details": None, "hint": None})


# --------------------------------------------------------------------------
# A. No global buckets; nothing answers 429 because a table is full
# --------------------------------------------------------------------------
class TestNoGlobalBucketsAndNoCapacityRefusals:
    def test_there_are_no_global_or_address_less_buckets(self):
        bad = [b for b in auth_rate_limit.LIMITS if "global" in b or "noip" in b]
        assert bad == [], bad
        assert not hasattr(auth_rate_limit, "CAPACITY_RETRY_SECONDS")

    def test_without_an_address_only_the_per_email_request_bucket_applies(self):
        for prefix in ("email_code", "reset_request"):
            assert auth_rate_limit.request_buckets(prefix, "a@x.test", None) == [(f"{prefix}_email", "a@x.test")]

    def test_without_an_address_there_is_no_login_lockout_bucket(self):
        assert auth_rate_limit.login_buckets("a@x.test", None) == []

    def test_a_full_bucket_still_accepts_new_keys(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=50)
        for i in range(50):
            lim.record("email_code_pair", f"k{i}")
        assert lim.retry_after("email_code_pair", "brand-new") is None
        lim.record("email_code_pair", "brand-new")
        assert lim.bucket_key_count("email_code_pair") <= 50

    def test_a_flood_of_junk_keys_never_blocks_a_new_user(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=1000)
        for i in range(20_000):
            lim.record("login_fail_pair", f"junk{i}@x.test|8.8.8.8")
        assert lim.retry_after("login_fail_pair", "newcomer@x.test|1.1.1.1") is None
        assert lim.bucket_key_count("login_fail_pair") <= 1000

    def test_distinct_emails_through_the_endpoint_are_never_throttled(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        with patch("main._issue_signup_code_quietly", new=AsyncMock(return_value=None)):
            codes = [client.post("/api/auth/email-code/request", json={"email": f"user{i}@x.test"}).status_code
                     for i in range(120)]
        assert set(codes) == {200}, [c for c in codes if c != 200][:5]

    def test_the_per_email_mail_limit_still_stops_mail_bombing(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        with patch("main._issue_signup_code_quietly", new=AsyncMock(return_value=None)):
            first = [client.post("/api/auth/email-code/request", json={"email": "victim@x.test"}).status_code
                     for _ in range(15)]
            other = client.post("/api/auth/email-code/request", json={"email": "someone-else@x.test"}).status_code
        assert first[0] == 200 and 429 in first, first
        assert other == 200


class TestActiveBlocksSurviveAndAreBounded:
    def _block(self, lim, bucket, key):
        for _ in range(lim._limits[bucket][1]):
            lim.record(bucket, key)
        assert lim.retry_after(bucket, key) is not None

    def test_a_blocked_key_is_never_evicted_by_a_flood(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=40)
        self._block(lim, "login_fail_pair", "victim|1.1.1.1")
        for i in range(2000):
            lim.record("login_fail_pair", f"noise{i}|2.2.2.2")
        assert lim.retry_after("login_fail_pair", "victim|1.1.1.1") is not None

    def test_blocks_are_bounded_and_the_oldest_is_dropped_first(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=1000, max_blocks=3)
        now = [0.0]
        lim._clock = lambda: now[0]
        for i in range(5):
            self._block(lim, "login_fail_pair", f"k{i}|1.1.1.1")
            now[0] += 1
        assert lim.block_count() <= 3
        assert lim.retry_after("login_fail_pair", "k4|1.1.1.1") is not None
        assert lim.retry_after("login_fail_pair", "k0|1.1.1.1") is None

    def test_a_block_ends_when_its_time_is_up(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0])
        self._block(lim, "login_fail_pair", "k|1.1.1.1")
        wait = lim.retry_after("login_fail_pair", "k|1.1.1.1")
        now[0] += wait + 1
        assert lim.retry_after("login_fail_pair", "k|1.1.1.1") is None or \
            lim.retry_after("login_fail_pair", "k|1.1.1.1") >= 1  # may re-block from retained events, never raise


class TestSweepCollectsEverythingExpired:
    def test_one_old_struck_entry_does_not_stall_collection_of_the_rest(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0], max_keys=5)
        # A struck entry inserted first (blocked, then its block ends: strikes keep it "live" for 24 h).
        for _ in range(lim._limits["login_fail_pair"][1]):
            lim.record("login_fail_pair", "old|1.1.1.1")
        assert lim.retry_after("login_fail_pair", "old|1.1.1.1") is not None
        for i in range(4):
            lim.record("email_code_pair", f"junk{i}")
        now[0] += 3 * 60 * 60  # every window and the block have passed; strikes have not decayed
        lim.retry_after("email_code_pair", "late")  # any call after the sweep interval triggers a sweep
        assert lim.bucket_key_count("email_code_pair") == 0, "expired junk survived behind a struck entry"
        assert lim.key_count() <= 1

    def test_the_sweep_runs_on_its_own_after_the_interval(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0], max_keys=10_000)
        for i in range(500):
            lim.record("email_code_pair", f"k{i}")
        now[0] += 2 * 60 * 60
        lim.record("email_code_pair", "fresh")
        assert lim.key_count() == 1


class TestCapacityWarningIsRateLimited:
    def test_at_most_one_warning_a_minute(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0], max_keys=10)
        with patch.object(auth_rate_limit.log, "warning") as warn:
            for i in range(1000):
                lim.record("email_code_pair", f"k{i}")
        assert 1 <= warn.call_count <= 1


# --------------------------------------------------------------------------
# B. No account-wide hard lockout when the client address is unknown
# --------------------------------------------------------------------------
class TestUnknownAddressNeverLocksAnAccount:
    def test_a_hundred_wrong_guesses_never_produce_a_429(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        codes = [client.post("/api/auth/login", json={"email": "victim@x.test", "password": "guess"}).status_code
                 for _ in range(100)]
        assert set(codes) == {401}, set(codes)

    def test_the_owners_correct_password_still_works_after_an_attack(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        for _ in range(100):
            client.post("/api/auth/login", json={"email": "victim@x.test", "password": "guess"})
        ok = client.post("/api/auth/login", json={"email": "victim@x.test", "password": "correct horse"})
        assert ok.status_code == 200, ok.text

    def test_with_a_known_address_the_pair_is_still_limited(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        h = {"X-Forwarded-For": "6.6.6.6"}
        codes = [client.post("/api/auth/login", headers=h, json={"email": "victim@x.test", "password": "guess"}).status_code
                 for _ in range(12)]
        assert 429 in codes
        ok = client.post("/api/auth/login", headers={"X-Forwarded-For": "7.7.7.7"},
                         json={"email": "victim@x.test", "password": "correct horse"})
        assert ok.status_code == 200


# --------------------------------------------------------------------------
# F. A missing COLUMN must not read as a missing table (MFA fails open otherwise)
# --------------------------------------------------------------------------
class _MfaLookupFails(FakeService):
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


class TestMissingTableDetectionIsStructured:
    @pytest.mark.parametrize("exc", [
        _api_error("42703", 'column "status" does not exist'),
        _api_error("PGRST204", "Could not find the 'status' column of 'user_mfa_settings' in the schema cache"),
        RuntimeError("relation does not exist"),
        RuntimeError("could not find the table (PGRST205)"),
        RuntimeError("connection reset by peer"),
    ])
    def test_only_structured_codes_count_as_a_missing_table(self, mock_db, exc):
        _install_failing_mfa(mock_db, {}, exc)
        with pytest.raises(HTTPException) as info:
            Auth.admin_mfa_status("admin-1")
        assert info.value.status_code == 503

    @pytest.mark.parametrize("code,message", [
        ("42P01", 'relation "skillup_dev.user_mfa_settings" does not exist'),
        ("PGRST205", "Could not find the table 'skillup_dev.user_mfa_settings' in the schema cache"),
    ])
    def test_a_genuinely_missing_table_reads_as_not_configured(self, mock_db, code, message):
        _install_failing_mfa(mock_db, {}, _api_error(code, message))
        assert Auth.admin_mfa_status("admin-1") is None

    def test_a_column_error_makes_every_admin_route_a_503_not_a_skipped_check(self, client, mock_db):
        _install_failing_mfa(mock_db, {"users": [_admin()]}, _api_error("42703", 'column "status" does not exist'))
        r = client.get("/api/institutions/me/team", headers=_bearer(mfa_verified=False))
        assert r.status_code == 503, r.text

    def test_the_mfa_status_endpoint_does_not_swallow_errors(self, client, mock_db):
        _install_failing_mfa(mock_db, {"users": [_admin()]}, _api_error("42703", 'column "status" does not exist'))
        assert client.get("/api/auth/mfa", headers=_bearer(mfa_verified=False)).status_code == 503

    def test_the_mfa_status_endpoint_keeps_the_pre_migration_answer(self, client, mock_db):
        _install_failing_mfa(mock_db, {"users": [_admin()]}, _api_error("42P01", "relation does not exist"))
        r = client.get("/api/auth/mfa", headers=_bearer(mfa_verified=False))
        assert r.status_code == 200 and r.json()["data"]["status"] == "recommended"


# --------------------------------------------------------------------------
# G. bcrypt runs off the event loop; long passwords are never a 500
# --------------------------------------------------------------------------
class TestPasswordHashingIsOffTheEventLoop:
    def test_login_runs_the_password_check_in_a_worker_thread(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        seen = {}
        real_enforce_all = auth_rate_limit.enforce_all

        def spy_enforce_all(buckets):
            seen["loop"] = threading.get_ident()  # called synchronously on the event-loop thread
            return real_enforce_all(buckets)

        def spy_checkpw(password, hashed):
            seen["bcrypt"] = threading.get_ident()
            return True

        with patch("main.auth_rate_limit.enforce_all", new=spy_enforce_all), \
                patch("main.bcrypt.checkpw", new=spy_checkpw):
            assert client.post("/api/auth/login", json={"email": "known@x.test", "password": "pw"}).status_code == 200
        assert seen["bcrypt"] != seen["loop"], "bcrypt blocked the event loop"

    def test_a_password_over_72_bytes_is_a_401_not_a_500_and_counts_as_a_failure(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        h = {"X-Forwarded-For": "6.6.6.6"}
        codes = [client.post("/api/auth/login", headers=h,
                             json={"email": "known@x.test", "password": "p" * 100}).status_code for _ in range(12)]
        assert codes[0] == 401 and 500 not in codes, codes
        assert 429 in codes, "long-password attempts must be counted as failures"

    def test_hashing_a_password_over_72_bytes_is_a_400(self):
        import asyncio
        with pytest.raises(HTTPException) as info:
            asyncio.run(Auth.hash_password("p" * 100))
        assert info.value.status_code == 400

    def test_the_helpers_hash_and_verify_normal_passwords(self):
        import asyncio
        hashed = asyncio.run(Auth.hash_password("correct horse"))
        assert asyncio.run(Auth.verify_password("correct horse", hashed)) is True
        assert asyncio.run(Auth.verify_password("wrong", hashed)) is False
        assert asyncio.run(Auth.verify_password("p" * 100, hashed)) is False

    def test_password_reset_with_a_long_password_is_a_400(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", True, raising=False)
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        r = client.post("/api/auth/password-reset/confirm",
                        json={"email": "known@x.test", "code": "000000", "password": "p" * 100})
        assert r.status_code == 400, r.text

    def test_no_blocking_bcrypt_call_is_left_in_an_async_handler(self):
        src = (REPO / "backend" / "main.py").read_text(encoding="utf-8")
        import re
        offenders = [m.group(0) for m in re.finditer(r"\n[^\n#]*\bbcrypt\.(checkpw|hashpw)\([^\n]*", src)
                     if "_DUMMY_PASSWORD_HASH =" not in m.group(0)]
        assert offenders == [], offenders


# --------------------------------------------------------------------------
# E. Edge rate limits: the primary protection
# --------------------------------------------------------------------------
class TestEdgeRateLimitsAreDeployed:
    @pytest.mark.parametrize("wf,port", [("deploy-backend.yml", "8000"), ("deploy-prod.yml", "8001")])
    def test_the_api_server_block_rate_limits_the_auth_routes(self, wf, port):
        path = REPO / ".github" / "workflows" / wf
        text = path.read_text(encoding="utf-8")
        yaml.safe_load(text)  # still valid YAML
        assert "limit_req_zone $binary_remote_addr zone=levelup_auth" in text
        assert "limit_req zone=levelup_auth" in text
        assert "limit_req_status 429" in text
        assert "location /api/auth/" in text
        assert f"proxy_pass http://127.0.0.1:{port}" in text

    @pytest.mark.parametrize("wf", ["deploy-backend.yml", "deploy-prod.yml"])
    def test_the_change_is_idempotent_and_rolls_back_on_an_invalid_config(self, wf):
        text = (REPO / ".github" / "workflows" / wf).read_text(encoding="utf-8")
        assert "grep -q 'location /api/auth/'" in text or 'grep -q "location /api/auth/"' in text
        assert ".bak-auth-limits" in text
        block = text[text.index("levelup_auth"):]
        assert "nginx -t" in block
        # the zone is defined once, in a shared http-level drop-in, never inside the site
        assert "/etc/nginx/conf.d/levelup-auth-limits.conf" in text
        # the status override must stay local to our location (shared box)
        assert "limit_req_status 429;\n" in text

    def test_the_deploy_triggers_are_untouched(self):
        fe = (REPO / ".github" / "workflows" / "deploy-frontend.yml").read_text(encoding="utf-8")
        assert "PAUSED" in fe
