"""Fourth review: edge limits are an operator step, the per-email mail ceilings never
answer 429 (so an attacker cannot keep a victim's real reset from being sent), the
app warns when it cannot see client addresses, and bcrypt has its own capacity."""
import asyncio
import logging
import threading
import time
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

import main  # noqa: F401  (imports every mounted route module so mock_db patches them)
import auth_rate_limit
from auth import Auth
from tests.test_auth_hardening import _install

REPO = Path(__file__).resolve().parents[2]


@pytest.fixture(autouse=True)
def _fresh_limiters():
    auth_rate_limit.reset_all()
    auth_rate_limit._warned_no_client_ip = False
    yield
    auth_rate_limit.reset_all()
    auth_rate_limit._warned_no_client_ip = False


@pytest.fixture
def trust_proxy(monkeypatch):
    from config import settings
    monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
    monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 1, raising=False)


# --------------------------------------------------------------------------
# 1. The edge step is gone from the deploy workflows; the doc replaces it
# --------------------------------------------------------------------------
class TestEdgeLimitsAreAnOperatorStep:
    @pytest.mark.parametrize("wf", ["deploy-backend.yml", "deploy-prod.yml"])
    def test_the_deploy_workflows_do_not_edit_nginx_for_auth_limits(self, wf):
        text = (REPO / ".github" / "workflows" / wf).read_text(encoding="utf-8")
        assert "levelup_auth" not in text
        assert "limit_req" not in text
        assert "Edge rate limit" not in text

    def test_the_prod_workflow_never_routes_auth_to_the_dev_port(self):
        text = (REPO / ".github" / "workflows" / "deploy-prod.yml").read_text(encoding="utf-8")
        assert "location /api/auth/" not in text

    def test_the_ops_doc_exists_and_does_not_hardcode_a_port(self):
        doc = (REPO / "docs" / "ops" / "nginx-auth-rate-limit.md").read_text(encoding="utf-8")
        for needle in ("limit_req_zone", "limit_req zone=auth burst=100 nodelay", "limit_req_status 429",
                       "location /api/auth/", "set_real_ip_from", "real_ip_header", "nginx -t",
                       "primary protection", "best-effort"):
            assert needle in doc, needle
        assert "proxy_pass" in doc and "copy" in doc.lower()
        # the doc must tell the operator to copy proxy_pass from location /, not give a fixed port
        assert "never hardcode" in doc.lower()

    def test_the_env_example_links_the_doc(self):
        env = (REPO / "backend" / ".env.example").read_text(encoding="utf-8")
        assert "docs/ops/nginx-auth-rate-limit.md" in env


# --------------------------------------------------------------------------
# 2. Per-email mail ceilings never answer 429
# --------------------------------------------------------------------------
class TestPerEmailMailCeilingNeverThrows:
    def test_reset_requests_past_the_ceiling_still_answer_200_and_send_nothing_more(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        issue = AsyncMock(return_value="123456")
        with patch("main._issue_email_code", new=issue):
            codes = [client.post("/api/auth/password-reset/request", json={"email": "victim@x.test"}).status_code
                     for _ in range(25)]
        assert set(codes) == {200}, [c for c in codes if c != 200]
        limit = auth_rate_limit.LIMITS["reset_request_email"][1]
        assert issue.await_count == limit, (issue.await_count, limit)

    def test_the_answer_is_identical_before_and_after_the_ceiling(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            first = client.post("/api/auth/password-reset/request", json={"email": "victim@x.test"}).json()
            for _ in range(20):
                last = client.post("/api/auth/password-reset/request", json={"email": "victim@x.test"}).json()
        assert first == last

    def test_a_different_address_is_never_blocked_by_an_attackers_flood(self, client, mock_db, monkeypatch, trust_proxy):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        with patch("main._issue_email_code", new=AsyncMock(return_value="123456")):
            attacker = [client.post("/api/auth/password-reset/request", headers={"X-Forwarded-For": "6.6.6.6"},
                                    json={"email": "victim@x.test"}).status_code for _ in range(15)]
            victim = client.post("/api/auth/password-reset/request", headers={"X-Forwarded-For": "8.8.4.4"},
                                 json={"email": "victim@x.test"})
        assert 429 in attacker, "the attacker's own (email, address) pair is still limited"
        assert victim.status_code == 200

    def test_signup_code_requests_past_the_ceiling_answer_200_and_send_nothing_more(self, client, mock_db, monkeypatch):
        from config import settings
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False, raising=False)
        _install(mock_db, {"users": []})
        issue = AsyncMock(return_value=None)
        with patch("main._issue_signup_code_quietly", new=issue):
            codes = [client.post("/api/auth/email-code/request", json={"email": "victim@x.test"}).status_code
                     for _ in range(25)]
        assert set(codes) == {200}
        assert issue.await_count == auth_rate_limit.LIMITS["email_code_email"][1]


# --------------------------------------------------------------------------
# 3. A loud, one-time warning when the app cannot see client addresses
# --------------------------------------------------------------------------
class TestProxyWarning:
    def _request(self, host="127.0.0.1"):
        return SimpleNamespace(client=SimpleNamespace(host=host), headers={})

    def test_warns_once_when_only_private_peers_are_seen_in_production(self, monkeypatch, caplog):
        from config import settings
        monkeypatch.setattr(settings, "DEBUG", False, raising=False)
        monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", False, raising=False)
        with caplog.at_level(logging.WARNING):
            assert auth_rate_limit.client_ip(self._request()) is None
            assert auth_rate_limit.client_ip(self._request("10.0.0.5")) is None
        hits = [r for r in caplog.records if "TRUST_PROXY_HEADERS" in r.getMessage()]
        assert len(hits) == 1
        assert "inactive" in hits[0].getMessage()

    def test_no_warning_in_debug_or_when_proxy_headers_are_trusted(self, monkeypatch, caplog):
        from config import settings
        with caplog.at_level(logging.WARNING):
            monkeypatch.setattr(settings, "DEBUG", True, raising=False)
            monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", False, raising=False)
            auth_rate_limit.client_ip(self._request())
            monkeypatch.setattr(settings, "DEBUG", False, raising=False)
            monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True, raising=False)
            auth_rate_limit.client_ip(self._request())
        assert not [r for r in caplog.records if "TRUST_PROXY_HEADERS" in r.getMessage()]

    def test_a_public_peer_never_warns(self, monkeypatch, caplog):
        from config import settings
        monkeypatch.setattr(settings, "DEBUG", False, raising=False)
        monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", False, raising=False)
        with caplog.at_level(logging.WARNING):
            assert auth_rate_limit.client_ip(self._request("8.8.8.8")) == "8.8.8.8"
        assert not [r for r in caplog.records if "TRUST_PROXY_HEADERS" in r.getMessage()]


# --------------------------------------------------------------------------
# 4. bcrypt has its own capacity limiter
# --------------------------------------------------------------------------
class TestBcryptCapacity:
    def test_capacity_is_cpu_count_with_a_floor_of_two(self, monkeypatch):
        monkeypatch.setattr("auth.os.cpu_count", lambda: 1)
        assert Auth.bcrypt_capacity() == 2
        monkeypatch.setattr("auth.os.cpu_count", lambda: None)
        assert Auth.bcrypt_capacity() == 2
        monkeypatch.setattr("auth.os.cpu_count", lambda: 8)
        assert Auth.bcrypt_capacity() == 8

    def test_a_hundred_concurrent_checks_never_exceed_the_capacity(self, monkeypatch):
        capacity = Auth.bcrypt_capacity()
        state = {"now": 0, "max": 0}
        lock = threading.Lock()

        def slow_checkpw(password, hashed):
            with lock:
                state["now"] += 1
                state["max"] = max(state["max"], state["now"])
            time.sleep(0.01)
            with lock:
                state["now"] -= 1
            return True

        monkeypatch.setattr("auth.bcrypt.checkpw", slow_checkpw)

        async def run():
            return await asyncio.gather(*[Auth.verify_password("pw", "$2b$12$" + "a" * 53) for _ in range(100)])

        results = asyncio.run(run())
        assert all(results)
        assert 1 <= state["max"] <= capacity, (state["max"], capacity)

    def test_the_limiter_works_across_separate_event_loops(self):
        async def one():
            hashed = await Auth.hash_password("correct horse")
            return await Auth.verify_password("correct horse", hashed)

        assert asyncio.run(one()) is True
        assert asyncio.run(one()) is True
