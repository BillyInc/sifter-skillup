"""Signup email verification: Redis-backed codes and Resend delivery.

Three defects motivated this, all confirmed against the live dev API:

  1. Nothing was ever sent. `_deliver_email_code` only called log.info, yet the
     endpoint answered `{"sent": true}`. In production, where the dev-code
     bypass is off, no signup could ever complete.
  2. `devCode` was returned in the response body and `000000` verified ANY
     address -- a full authentication bypass if the flag were ever set outside
     development.
  3. Codes lived in a per-process dict while the API runs `uvicorn --workers 2`,
     so a code issued by one worker was invisible to the other. Verification
     failed roughly half the time with a misleading "Request a verification
     code first."

(3) is the one a single-process test suite would happily miss, so the first
test below drives two independent store instances over one shared Redis.
"""

import asyncio
import time

import pytest
from fastapi import HTTPException

import email_codes
import email_delivery
from config import settings


class FakeRedis:
    """Minimal async stand-in for the hash commands email_codes uses.

    Shared between "workers" in the multi-worker test, which is the entire
    point: a per-process dict cannot be shared this way.
    """

    def __init__(self):
        self.hashes: dict[str, dict[str, str]] = {}
        self.expiries: dict[str, int] = {}

    async def delete(self, key):
        self.hashes.pop(key, None)
        self.expiries.pop(key, None)

    async def hset(self, key, field=None, value=None, mapping=None):
        if mapping is not None:
            values = mapping
        elif field is not None:
            values = {field: value}
        else:
            values = {}
        self.hashes.setdefault(key, {}).update({k: str(v) for k, v in values.items()})

    async def hgetall(self, key):
        return dict(self.hashes.get(key, {}))

    async def expire(self, key, seconds):
        self.expiries[key] = seconds

    async def hincrby(self, key, field, amount):
        record = self.hashes.setdefault(key, {})
        record[field] = str(int(record.get(field, "0")) + amount)
        return int(record[field])


@pytest.fixture
def redis(monkeypatch):
    fake = FakeRedis()
    monkeypatch.setattr(email_codes, "get_client", lambda: fake)
    return fake


def run(coro):
    return asyncio.get_event_loop_policy().new_event_loop().run_until_complete(coro)


def _config_with_unset(monkeypatch, *unset_keys: str):
    """Load an INDEPENDENT copy of config.py with `unset_keys` absent.

    Observing a config default is harder than it looks, and the two obvious
    approaches are both wrong:

      * `monkeypatch.delenv` alone does nothing, because config.py calls
        `load_dotenv()` at module scope and a local .env repopulates the value.
      * patching `config.load_dotenv` and calling `importlib.reload` does not
        work either: reload re-executes the module source, which re-runs
        `from dotenv import load_dotenv` and rebinds the name straight over the
        patch. The earlier version of this test did exactly that, so it read
        whatever the developer's .env happened to contain and passed or failed
        on ambient state rather than on the default. It went green while
        backend/.env carried `EMAIL_FROM=` (empty), which is the opposite of
        what it claims to assert.

    So intercept `os.getenv` instead -- it is the only thing config.py reads,
    58 times, and it is immune to dotenv -- and exec the source as a NEW module
    object that is never registered in sys.modules. Nothing rebinds
    `config.settings`, so unlike reload this cannot leak into other tests that
    monkeypatch settings (see the note in test_dev_codes_cannot_be_enabled...).
    """
    import importlib.util
    import os
    import pathlib

    real_getenv = os.getenv

    def fake_getenv(key, default=None):
        # Behave exactly as if the variable were never set anywhere.
        return default if key in unset_keys else real_getenv(key, default)

    monkeypatch.setattr(os, "getenv", fake_getenv)

    source = pathlib.Path(__file__).resolve().parent.parent / "config.py"
    spec = importlib.util.spec_from_file_location("_config_isolated", source)
    assert spec is not None and spec.loader is not None, f"cannot load {source}"
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class TestCodesSurviveAcrossWorkers:
    def test_code_stored_by_one_worker_verifies_on_another(self, redis):
        """The regression that made verification fail ~50% of the time.

        Both calls go through the same Redis, standing in for two uvicorn
        workers. With the old module-level dict the second call saw nothing and
        returned MISSING.
        """

        async def scenario():
            await email_codes.store_code("a@example.com", "123456")
            # A different worker handling the verify request:
            return await email_codes.verify_code("a@example.com", "123456")

        assert run(scenario()) == email_codes.OK

    def test_unknown_email_reports_missing(self, redis):
        assert run(email_codes.verify_code("nobody@example.com", "123456")) == email_codes.MISSING


class TestCodeLifecycle:
    def test_wrong_code_is_invalid_and_counts_an_attempt(self, redis):
        async def scenario():
            await email_codes.store_code("b@example.com", "111111")
            first = await email_codes.verify_code("b@example.com", "999999")
            record = await redis.hgetall(email_codes._key("b@example.com", email_codes.PURPOSE_SIGNUP))
            return first, record["attempts"]

        outcome, attempts = run(scenario())
        assert outcome == email_codes.INVALID
        assert attempts == "1"

    def test_attempts_are_capped(self, redis):
        async def scenario():
            await email_codes.store_code("c@example.com", "111111")
            for _ in range(settings.EMAIL_CODE_MAX_ATTEMPTS):
                await email_codes.verify_code("c@example.com", "000001")
            # Even the CORRECT code is refused once the cap is hit.
            return await email_codes.verify_code("c@example.com", "111111")

        assert run(scenario()) == email_codes.TOO_MANY_ATTEMPTS

    def test_expired_code_reports_expired_not_missing(self, redis):
        """Expiry is tracked explicitly, so it stays distinguishable from a
        code that was never requested -- Redis TTL alone would conflate them."""

        async def scenario():
            await email_codes.store_code("d@example.com", "111111")
            key = email_codes._key("d@example.com", email_codes.PURPOSE_SIGNUP)
            await redis.hset(key, mapping={"expires_at": str(time.time() - 1)})
            return await email_codes.verify_code("d@example.com", "111111")

        assert run(scenario()) == email_codes.EXPIRED

    def test_successful_code_is_single_use(self, redis):
        async def scenario():
            await email_codes.store_code("e@example.com", "222222")
            first = await email_codes.verify_code("e@example.com", "222222")
            second = await email_codes.verify_code("e@example.com", "222222")
            return first, second

        first, second = run(scenario())
        assert first == email_codes.OK
        assert second == email_codes.MISSING

    def test_requesting_a_new_code_invalidates_the_old_one(self, redis):
        async def scenario():
            await email_codes.store_code("f@example.com", "111111")
            await email_codes.verify_code("f@example.com", "999999")  # burn an attempt
            await email_codes.store_code("f@example.com", "222222")
            old = await email_codes.verify_code("f@example.com", "111111")
            fresh = await email_codes.verify_code("f@example.com", "222222")
            return old, fresh

        old, fresh = run(scenario())
        assert old == email_codes.INVALID
        assert fresh == email_codes.OK


class TestPurposeIsolation:
    """A signup code must not be usable as a password reset code.

    The password-reset flow added in #93/#94 kept its codes in a second
    module-level dict. Sharing one Redis namespace instead would be worse than
    either: a code mailed to prove ownership of a NEW address would also
    satisfy a reset for an EXISTING account.
    """

    def test_signup_code_does_not_satisfy_a_password_reset(self, redis):
        async def scenario():
            await email_codes.store_code(
                "h@example.com", "123456", purpose=email_codes.PURPOSE_SIGNUP
            )
            return await email_codes.verify_code(
                "h@example.com", "123456", purpose=email_codes.PURPOSE_PASSWORD_RESET
            )

        assert run(scenario()) == email_codes.MISSING

    def test_reset_code_does_not_satisfy_a_signup(self, redis):
        async def scenario():
            await email_codes.store_code(
                "i@example.com", "123456", purpose=email_codes.PURPOSE_PASSWORD_RESET
            )
            return await email_codes.verify_code(
                "i@example.com", "123456", purpose=email_codes.PURPOSE_SIGNUP
            )

        assert run(scenario()) == email_codes.MISSING

    def test_both_purposes_can_be_outstanding_at_once(self, redis):
        async def scenario():
            await email_codes.store_code(
                "j@example.com", "111111", purpose=email_codes.PURPOSE_SIGNUP
            )
            await email_codes.store_code(
                "j@example.com", "222222", purpose=email_codes.PURPOSE_PASSWORD_RESET
            )
            signup = await email_codes.verify_code(
                "j@example.com", "111111", purpose=email_codes.PURPOSE_SIGNUP
            )
            reset = await email_codes.verify_code(
                "j@example.com", "222222", purpose=email_codes.PURPOSE_PASSWORD_RESET
            )
            return signup, reset

        assert run(scenario()) == (email_codes.OK, email_codes.OK)


class TestPasswordResetRequiresARealCode:
    """Without dev codes, a reset must not proceed on a never-requested code.

    The previous implementation did `record = record or {"attempts": 0}` when
    the submitted code was "000000", so with the flag on, ANY account's
    password could be reset without a code ever being issued. The flag is now
    DEBUG-only, but the reset path must still refuse an unknown code outright.
    """

    def test_unknown_reset_code_is_refused(self, redis):
        assert (
            run(
                email_codes.verify_code(
                    "k@example.com", "000000", purpose=email_codes.PURPOSE_PASSWORD_RESET
                )
            )
            == email_codes.MISSING
        )


class TestDelivery:
    def test_missing_api_key_is_fatal_when_dev_codes_are_off(self, monkeypatch):
        """Production must fail loudly rather than pretend it sent something."""
        monkeypatch.setattr(settings, "RESEND_API_KEY", "")
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", False)
        with pytest.raises(email_delivery.EmailDeliveryError):
            run(email_delivery.send_verification_code("x@example.com", "123456"))

    def test_missing_api_key_is_tolerated_in_development(self, monkeypatch):
        monkeypatch.setattr(settings, "RESEND_API_KEY", "")
        monkeypatch.setattr(settings, "EMAIL_VERIFICATION_DEV_CODES", True)
        run(email_delivery.send_verification_code("x@example.com", "123456"))

    def test_sends_the_expected_resend_payload(self, monkeypatch):
        monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
        monkeypatch.setattr(settings, "EMAIL_FROM", "LevelUp <noreply@hello.levelup.com.ng>")
        captured = {}

        async def fake_post(payload):
            captured.update(payload)

        monkeypatch.setattr(email_delivery, "_post", fake_post)
        run(email_delivery.send_verification_code("x@example.com", "654321"))

        assert captured["from"] == "LevelUp <noreply@hello.levelup.com.ng>"
        assert captured["to"] == ["x@example.com"]
        assert "654321" in captured["html"]
        # Text part sent alongside HTML: some clients render text only, and
        # having both improves deliverability.
        assert "654321" in captured["text"]

    def test_default_sender_uses_the_verified_domain(self, monkeypatch):
        """The EMAIL_FROM fallback must sit on a domain verified in Resend.

        Resend rejects any send whose From: is on an unverified domain, so a
        wrong default fails closed -- and only in production, as a signup 502,
        because every local .env sets EMAIL_FROM explicitly and masks it. The
        default previously pointed at the bare root levelup.com.ng, which is
        deliberately NOT verified: the root MX is reserved for a mailbox
        provider and its SPF belongs to WhoGoHost. Only the subdomain
        hello.levelup.com.ng is verified (see DEPLOY-SETUP.md).

        Reloading the module is the point of this test -- the class body calls
        os.getenv at import time, so the default cannot be observed any other
        way.
        """
        default_sender = _config_with_unset(monkeypatch, "EMAIL_FROM").Settings.EMAIL_FROM

        assert default_sender.endswith("@hello.levelup.com.ng>"), (
            f"EMAIL_FROM default is {default_sender!r}; it must be on the "
            "verified sending subdomain hello.levelup.com.ng"
        )

    def test_provider_rejection_raises(self, monkeypatch):
        monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")

        class FakeResponse:
            status_code = 403
            text = '{"message":"The levelup.com.ng domain is not verified"}'

        class FakeClient:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *a):
                return False

            async def post(self, *a, **k):
                return FakeResponse()

        monkeypatch.setattr(email_delivery.httpx, "AsyncClient", lambda **k: FakeClient())
        with pytest.raises(email_delivery.EmailDeliveryError) as exc:
            run(email_delivery.send_verification_code("x@example.com", "654321"))
        # The reason must survive: the status alone does not distinguish an
        # unverified domain from a malformed payload.
        assert "not verified" in str(exc.value)


class TestDevCodeExposure:
    def test_dev_codes_cannot_be_enabled_without_debug(self, monkeypatch):
        """Setting EMAIL_VERIFICATION_DEV_CODES=true on a prod box must be inert.

        The flag returns the code to the caller and accepts "000000" for any
        address, so an env var alone must not be able to switch it on.

        Loaded in a subprocess rather than via importlib.reload: reloading
        config rebinds config.settings while every already-imported module
        keeps the old object, which silently breaks unrelated tests that
        monkeypatch settings.
        """
        import os
        import subprocess
        import sys

        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        result = subprocess.run(
            [
                sys.executable,
                "-c",
                "from config import settings;"
                "print(settings.DEBUG, settings.EMAIL_VERIFICATION_DEV_CODES)",
            ],
            capture_output=True,
            text=True,
            cwd=backend_dir,
            env={**os.environ, "DEBUG": "false", "EMAIL_VERIFICATION_DEV_CODES": "true"},
        )
        assert result.returncode == 0, result.stderr
        assert result.stdout.strip() == "False False"

    def test_bypass_code_is_refused_when_dev_codes_are_off(self, redis, monkeypatch):
        import main

        # EMAIL_CODE_STORAGE decides which store _require_valid_email_code
        # consults, and it defaults to "redis" only while DEBUG is on. Left
        # unpinned this test silently followed whatever the developer's .env
        # said and broke the moment a local .env set EMAIL_CODE_STORAGE=database
        # -- it would then query Supabase instead of the `redis` fixture. The
        # database path has its own coverage; this one is about the bypass.
        monkeypatch.setattr(main.settings, "EMAIL_CODE_STORAGE", "redis")
        monkeypatch.setattr(main.settings, "EMAIL_VERIFICATION_DEV_CODES", False)
        with pytest.raises(HTTPException) as exc:
            run(main._require_valid_email_code("g@example.com", "000000"))
        assert exc.value.status_code == 400
        # Falls through to the real check, which finds no stored code.
        assert exc.value.detail == "Request a verification code first."

    def test_bypass_code_still_works_in_development(self, redis, monkeypatch):
        import main

        monkeypatch.setattr(main.settings, "EMAIL_VERIFICATION_DEV_CODES", True)
        run(main._require_valid_email_code("g@example.com", "000000"))
