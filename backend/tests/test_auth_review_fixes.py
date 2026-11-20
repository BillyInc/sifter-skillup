"""Fixes from the independent review of the authentication hardening PR.

Written before the fixes: each class fails on the previous code.
"""
import asyncio
import logging
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import main  # noqa: F401  (imports every mounted route module so mock_db patches them)
import auth_rate_limit
from auth import Auth
from tests.test_auth_hardening import FakeService, _admin, _bearer, _install

ATTACKER_IP = "8.8.8.8"
VICTIM_IP = "1.1.1.1"
PROXY_IP = "10.0.0.5"


def _cred(token):
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _request(forwarded=None, peer=PROXY_IP):
    headers = {"x-forwarded-for": forwarded} if forwarded is not None else {}
    return SimpleNamespace(client=SimpleNamespace(host=peer), headers=headers)


@pytest.fixture
def trust_proxy(monkeypatch):
    from config import settings
    monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
    monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 1, raising=False)


def _xff(ip):
    return {"X-Forwarded-For": ip}


# --------------------------------------------------------------------------
# Blocker 1: a token issued before a password reset must die everywhere
# --------------------------------------------------------------------------
class TestRevokedTokensAreRejectedByEveryDecoder:
    def test_the_shared_helper_checks_version_and_deletion(self):
        user = _admin(token_version=2)
        assert Auth.token_matches_user({"sub": "admin-1", "tv": 2}, user) is True
        assert Auth.token_matches_user({"sub": "admin-1", "tv": 1}, user) is False
        assert Auth.token_matches_user({"sub": "admin-1"}, user) is False  # tv 0 vs 2
        assert Auth.token_matches_user({"sub": "admin-1", "tv": 2}, _admin(token_version=2, is_deleted=True)) is False
        assert Auth.token_matches_user({"sub": "someone-else", "tv": 2}, user) is False
        assert Auth.token_matches_user({"sub": "admin-1", "tv": "x"}, user) is False
        assert Auth.token_matches_user({"sub": "admin-1", "tv": 0}, None) is False

    def test_a_pre_migration_row_still_matches_a_plain_token(self):
        row = _admin()
        row.pop("token_version")
        assert Auth.token_matches_user({"sub": "admin-1"}, row) is True

    def test_starknet_optional_user_rejects_a_pre_reset_token(self, mock_db):
        _install(mock_db, {"users": [_admin(token_version=1)]})
        import routes.starknet_routes as sr
        stale = Auth.create_jwt("admin-1", token_version=0)
        fresh = Auth.create_jwt("admin-1", token_version=1)
        assert asyncio.run(sr._optional_current_user(_cred(stale))) is None
        assert asyncio.run(sr._optional_current_user(_cred(fresh)))["id"] == "admin-1"

    def test_starknet_sifter_token_rejects_a_pre_reset_token(self, mock_db):
        _install(mock_db, {"users": [_admin(token_version=1)]})
        import routes.starknet_routes as sr
        stale = Auth.create_jwt("admin-1", token_version=0)
        fresh = Auth.create_jwt("admin-1", token_version=1)
        assert sr._get_user_from_sifter_token(stale) is None
        assert sr._get_user_from_sifter_token(fresh)["id"] == "admin-1"

    def test_starknet_helpers_reject_a_deleted_account(self, mock_db):
        _install(mock_db, {"users": [_admin(is_deleted=True)]})
        import routes.starknet_routes as sr
        token = Auth.create_jwt("admin-1", token_version=0)
        assert asyncio.run(sr._optional_current_user(_cred(token))) is None
        assert sr._get_user_from_sifter_token(token) is None

    def test_get_current_user_uses_the_same_rule(self, client, mock_db):
        _install(mock_db, {"users": [_admin(token_version=1)]})
        assert client.get("/api/users/me", headers=_bearer(tv=0)).status_code == 401
        assert client.get("/api/users/me", headers=_bearer(tv=1)).status_code == 200


# --------------------------------------------------------------------------
# Blocker 2: an attacker must not be able to lock a victim out
# --------------------------------------------------------------------------
class TestLockoutCannotBeUsedAgainstAVictim:
    def _login(self, client, ip, password):
        return client.post("/api/auth/login", headers=_xff(ip),
                           json={"email": "victim@x.test", "password": password})

    def test_failures_from_one_address_do_not_block_the_owner_elsewhere(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        codes = [self._login(client, ATTACKER_IP, "guess").status_code for _ in range(12)]
        assert codes[0] == 401 and 429 in codes, codes
        ok = self._login(client, VICTIM_IP, "correct horse")
        assert ok.status_code == 200, ok.text

    def test_the_owner_still_logs_in_from_the_same_address_below_the_threshold(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        for _ in range(5):
            assert self._login(client, VICTIM_IP, "typo").status_code == 401
        assert self._login(client, VICTIM_IP, "correct horse").status_code == 200

    def test_without_a_known_address_the_account_threshold_is_higher(self, client, mock_db):
        # TestClient peers are not public addresses, so the real client is unknown.
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        codes = [client.post("/api/auth/login", json={"email": "victim@x.test", "password": "x"}).status_code
                 for _ in range(15)]
        assert 429 not in codes, "a handful of typos must not lock an account when the client is unknown"
        many = [client.post("/api/auth/login", json={"email": "victim@x.test", "password": "x"}).status_code
                for _ in range(40)]
        assert 429 in many, "unknown-address guessing still needs a ceiling"

    def test_a_failed_attempt_never_reveals_whether_the_email_exists(self, client, mock_db):
        _install(mock_db, {"users": []})
        known = [client.post("/api/auth/login", json={"email": "ghost@x.test", "password": "x"}).status_code
                 for _ in range(45)]
        _install(mock_db, {"users": [_admin(email="real@x.test")]})
        auth_rate_limit.reset_all()
        real = [client.post("/api/auth/login", json={"email": "real@x.test", "password": "x"}).status_code
                for _ in range(45)]
        assert known == real  # same status sequence for unknown and registered emails

    def test_code_requests_from_one_address_do_not_exhaust_the_owner(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            attacker = [client.post("/api/auth/password-reset/request", headers=_xff(ATTACKER_IP),
                                    json={"email": "victim@x.test"}).status_code for _ in range(6)]
            assert 429 in attacker, attacker
            owner = client.post("/api/auth/password-reset/request", headers=_xff(VICTIM_IP),
                                json={"email": "victim@x.test"})
        assert owner.status_code == 200, owner.text

    def test_request_limits_never_block_a_login(self, client, mock_db, trust_proxy):
        _install(mock_db, {"users": [_admin(email="victim@x.test")]})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            for _ in range(20):
                client.post("/api/auth/password-reset/request", headers=_xff(ATTACKER_IP),
                            json={"email": "victim@x.test"})
        assert self._login(client, VICTIM_IP, "correct horse").status_code == 200


class TestRetryAfterBacksOff:
    def test_each_repeated_lockout_lasts_longer(self):
        now = [1000.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0])
        bucket, key = "login_fail_pair", "v@x.test|8.8.8.8"
        maximum = lim._limits[bucket][1]

        def fill():
            for _ in range(maximum):
                lim.record(bucket, key)

        fill()
        first = lim.retry_after(bucket, key)
        assert first and first > 0
        now[0] += first + 1          # first lockout over
        fill()                        # guesses again
        second = lim.retry_after(bucket, key)
        assert second >= first * 2 - 2, (first, second)
        now[0] += second + 1
        fill()
        third = lim.retry_after(bucket, key)
        assert third >= second * 2 - 2 or third >= auth_rate_limit.MAX_BACKOFF_SECONDS - 1, (second, third)
        assert third <= auth_rate_limit.MAX_BACKOFF_SECONDS

    def test_the_lockout_is_visible_while_it_lasts(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0])
        for _ in range(lim._limits["login_fail_pair"][1]):
            lim.record("login_fail_pair", "k")
        wait = lim.retry_after("login_fail_pair", "k")
        now[0] += 5
        remaining = lim.retry_after("login_fail_pair", "k")
        assert remaining is not None and remaining <= wait - 4


# --------------------------------------------------------------------------
# Blocker 3: the limiter must not grow without bound
# --------------------------------------------------------------------------
class TestLimiterMemoryIsBounded:
    def test_checking_unknown_keys_creates_nothing(self):
        lim = auth_rate_limit.SlidingWindowLimiter()
        for i in range(100_000):
            assert lim.retry_after("login_fail_email_noip", f"user{i}@x.test") is None
        assert lim.key_count() == 0

    def test_recording_many_distinct_keys_is_capped(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=1000)
        for i in range(100_000):
            lim.record("login_fail_email_noip", f"user{i}@x.test")
        assert lim.key_count() <= 1000

    def test_empty_windows_are_dropped(self):
        now = [0.0]
        lim = auth_rate_limit.SlidingWindowLimiter(clock=lambda: now[0])
        lim.record("login_fail_email_noip", "a@x.test")
        now[0] += 10 * 60 * 60
        lim.retry_after("login_fail_email_noip", "a@x.test")
        assert lim.key_count() == 0

    def test_very_long_keys_are_bounded(self):
        assert len(auth_rate_limit._key("a" * 5000)) <= 130

    def test_a_locked_out_key_survives_a_flood_of_noise_keys(self):
        lim = auth_rate_limit.SlidingWindowLimiter(max_keys=50)
        for _ in range(lim._limits["login_fail_pair"][1]):
            lim.record("login_fail_pair", "victim")
        assert lim.retry_after("login_fail_pair", "victim") is not None  # now locked out
        for i in range(500):
            lim.record("login_fail_email_noip", f"noise{i}")
        # The cap is per bucket now: the noise bucket is bounded, and the
        # victim's counters in another bucket are untouched.
        assert lim.bucket_key_count("login_fail_email_noip") <= 50
        assert lim.retry_after("login_fail_pair", "victim") is not None, \
            "flooding distinct keys must not evict an active lockout"


# --------------------------------------------------------------------------
# Major 4: registered and unknown addresses must follow the same path
# --------------------------------------------------------------------------
class TestEmailCodeRequestHasNoOracle:
    @pytest.fixture(autouse=True)
    def _no_dev_codes(self, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)

    def test_a_delivery_failure_does_not_change_the_response(self, client, mock_db):
        _install(mock_db, {"users": []})
        boom = AsyncMock(side_effect=HTTPException(status_code=502, detail="mail down"))
        with patch("main._issue_email_code", new=boom):
            r = client.post("/api/auth/email-code/request", json={"email": "new@x.test"})
        assert r.status_code == 200 and r.json()["data"]["sent"] is True

    def test_registered_and_unknown_both_do_their_work_after_the_response(self, client, mock_db):
        issue = AsyncMock(return_value="123456")
        notice = AsyncMock(return_value=None)
        with patch("main._issue_email_code", new=issue), patch("main._send_account_exists_notice", new=notice):
            _install(mock_db, {"users": []})
            new = client.post("/api/auth/email-code/request", json={"email": "new@x.test"})
            auth_rate_limit.reset_all()
            _install(mock_db, {"users": [_admin(email="known@x.test")]})
            known = client.post("/api/auth/email-code/request", json={"email": "known@x.test"})
        assert new.status_code == known.status_code == 200
        assert new.json() == known.json()
        issue.assert_awaited_once()      # unknown address: code issued
        notice.assert_awaited_once()     # registered address: a notice, never a code

    def test_the_registered_notice_carries_no_code(self):
        import inspect
        assert "code" not in inspect.signature(main._send_account_exists_notice).parameters

    def test_a_failing_notice_is_swallowed(self, client, mock_db):
        _install(mock_db, {"users": [_admin(email="known@x.test")]})
        with patch("main._send_account_exists_notice", new=AsyncMock(side_effect=RuntimeError("smtp"))):
            r = client.post("/api/auth/email-code/request", json={"email": "known@x.test"})
        assert r.status_code == 200


# --------------------------------------------------------------------------
# Major 5: the client address comes from the trusted hop, not the header's left end
# --------------------------------------------------------------------------
class TestClientIp:
    def test_the_rightmost_hop_wins_so_a_spoofed_left_entry_is_ignored(self, trust_proxy):
        req = _request(forwarded=f"9.9.9.9, {ATTACKER_IP}")
        assert auth_rate_limit.client_ip(req) == ATTACKER_IP

    def test_two_trusted_hops_pick_the_second_from_the_right(self, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
        monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 2, raising=False)
        req = _request(forwarded=f"7.7.7.7, {ATTACKER_IP}, 10.1.1.1")
        assert auth_rate_limit.client_ip(req) == ATTACKER_IP

    def test_headers_are_ignored_unless_trusted(self, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", False, raising=False)
        assert auth_rate_limit.client_ip(_request(forwarded=ATTACKER_IP)) is None
        assert auth_rate_limit.client_ip(_request(forwarded=None, peer=ATTACKER_IP)) == ATTACKER_IP

    def test_private_or_missing_hops_are_not_trusted(self, trust_proxy):
        assert auth_rate_limit.client_ip(_request(forwarded="192.168.1.9")) is None
        assert auth_rate_limit.client_ip(_request(forwarded="")) is None

    def test_ipv6_clients_share_one_key_per_64(self, trust_proxy):
        a = auth_rate_limit.client_ip(_request(forwarded="2606:4700:4700:1:aaaa:bbbb:cccc:dddd"))
        b = auth_rate_limit.client_ip(_request(forwarded="2606:4700:4700:1:1111:2222:3333:4444"))
        c = auth_rate_limit.client_ip(_request(forwarded="2606:4700:4700:2:1111:2222:3333:4444"))
        assert a == b and a != c


# --------------------------------------------------------------------------
# Major 6 and 7: MFA status errors must fail closed; deferral without a body
# --------------------------------------------------------------------------
class _MfaLookupFails(FakeService):
    def table(self, name):
        if name == "user_mfa_settings":
            raise RuntimeError("database unavailable")
        return super().table(name)


class TestMfaFailsClosed:
    def _install_failing(self, mock_db):
        svc = _MfaLookupFails({"users": [_admin()]})
        mock_db.get_service_client.return_value = svc
        mock_db.get_client.return_value = svc
        return svc

    def test_request_returns_503_and_changes_nothing_when_the_lookup_fails(self, client, mock_db):
        svc = self._install_failing(mock_db)
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            r = client.post("/api/auth/mfa/request", headers=_bearer(), json={})
        assert r.status_code == 503, r.text
        assert not svc.upserts

    def test_defer_returns_503_and_changes_nothing_when_the_lookup_fails(self, client, mock_db):
        svc = self._install_failing(mock_db)
        r = client.post("/api/auth/mfa/defer", headers=_bearer(), json={"password": "correct horse"})
        assert r.status_code == 503, r.text
        assert not svc.upserts

    def test_defer_without_any_body_asks_for_the_password_not_422(self, client, mock_db):
        _install(mock_db, {"users": [_admin()], "user_mfa_settings": []})
        r = client.post("/api/auth/mfa/defer", headers=_bearer())
        assert r.status_code == 403, r.text
        assert "password" in r.text.lower()

    def test_an_admin_without_a_password_keeps_the_existing_behaviour(self, client, mock_db):
        svc = _install(mock_db, {"users": [_admin(password_hash=None)], "user_mfa_settings": []})
        r = client.post("/api/auth/mfa/defer", headers=_bearer(), json={})
        assert r.status_code == 200, r.text
        assert [u["status"] for t, u in svc.upserts if t == "user_mfa_settings"] == ["deferred"]


# --------------------------------------------------------------------------
# Major 8: the boot guard says what to fix and logs loudly
# --------------------------------------------------------------------------
class TestBootGuardMessage:
    def test_the_error_names_every_affected_process(self):
        import config
        with pytest.raises(RuntimeError) as err:
            config.check_jwt_secret("short", debug=False)
        text = str(err.value)
        for word in ("API", "Celery", "every process", "32"):
            assert word in text, word

    def test_the_failure_is_logged_at_critical_level(self, caplog):
        import config
        with caplog.at_level(logging.CRITICAL, logger="config"):
            with pytest.raises(RuntimeError):
                config.check_jwt_secret("short", debug=False)
        assert any(r.levelno == logging.CRITICAL for r in caplog.records)


# --------------------------------------------------------------------------
# Admin MFA code guessing is limited too
# --------------------------------------------------------------------------
class TestMfaVerifyIsLimited:
    def test_wrong_codes_are_limited_per_admin(self, client, mock_db):
        import email_codes
        _install(mock_db, {"users": [_admin()], "user_mfa_settings": []})
        # The storage backend is configurable; cover both verifiers.
        with patch("main.email_codes.verify_code", new=AsyncMock(return_value=email_codes.INVALID)), \
             patch("main.db_email_codes.verify_code", new=AsyncMock(return_value=email_codes.INVALID)):
            codes = [client.post("/api/auth/mfa/verify", headers=_bearer(), json={"code": "111111"}).status_code
                     for _ in range(12)]
        assert codes[0] == 400 and 429 in codes, codes
