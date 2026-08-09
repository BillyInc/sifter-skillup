"""CORS allowlist regression tests.

The deployed API answered curl perfectly while the browser app could not reach
it at all: `ALLOWED_ORIGINS` contained only localhost, Telegram and
`WEB_DASHBOARD_URL` (still pointing at the decommissioned Netlify site), so a
preflight from https://dev.levelup.com.ng got a bare 400 with no
`access-control-allow-origin`. Every API call from the browser failed; the
first one the app makes is auth, so it presented as "auth isn't working".

curl does not enforce CORS, which is exactly why every manual check passed.
These tests assert the thing a browser actually requires.
"""
import main  # noqa: F401  — ensures all routers/middleware are mounted
from fastapi.testclient import TestClient

from config import settings
from main import app

client = TestClient(app)

# The origins the app is actually served from.
DEPLOYED_ORIGINS = [
    "https://levelup.com.ng",
    "https://www.levelup.com.ng",
    "https://dev.levelup.com.ng",
]


class TestDeployedOriginsAllowed:
    def test_every_deployed_origin_is_in_the_allowlist(self):
        missing = [o for o in DEPLOYED_ORIGINS if o not in settings.ALLOWED_ORIGINS]
        assert not missing, (
            f"deployed origins missing from ALLOWED_ORIGINS: {missing}. "
            "The browser app cannot call the API without these."
        )

    def test_preflight_succeeds_and_echoes_the_origin(self):
        """A preflight must return 2xx AND the allow-origin header.

        Both halves matter: the observed failure was a 400, but a 200 without
        `access-control-allow-origin` is equally fatal — the browser blocks the
        response either way.
        """
        for origin in DEPLOYED_ORIGINS:
            res = client.options(
                "/api/auth/guest",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "content-type",
                },
            )
            assert res.status_code < 400, (
                f"preflight from {origin} returned {res.status_code}"
            )
            assert res.headers.get("access-control-allow-origin") == origin, (
                f"no access-control-allow-origin echoed back to {origin}"
            )

    def test_actual_request_carries_the_allow_origin_header(self):
        """Non-preflight responses must carry the header too.

        Uses /health deliberately. Under conftest's autouse DB mock, a route
        that touches the database returns a MagicMock that cannot be
        serialised; the resulting unhandled exception bypasses CORSMiddleware,
        so the assertion would fail for a reason that has nothing to do with
        CORS. /health needs no DB, so this isolates the header behaviour.
        """
        res = client.get(
            "/health", headers={"Origin": "https://dev.levelup.com.ng"}
        )
        assert res.status_code == 200
        assert (
            res.headers.get("access-control-allow-origin")
            == "https://dev.levelup.com.ng"
        )

    def test_unknown_origin_is_still_rejected(self):
        """The fix must not have widened this to a wildcard."""
        res = client.options(
            "/api/auth/guest",
            headers={
                "Origin": "https://evil.example.com",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert res.headers.get("access-control-allow-origin") != "https://evil.example.com"
        assert res.headers.get("access-control-allow-origin") != "*"
