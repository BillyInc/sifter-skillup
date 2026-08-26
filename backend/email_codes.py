"""Signup verification-code store, backed by Redis.

Codes previously lived in a module-level dict in main.py. The API runs under
`uvicorn --workers 2` (systemd/levelup-backend.service), so a code issued by
one worker was invisible to the other: whether a verification succeeded came
down to which process happened to serve the second request, and the failure
surfaced as the misleading "Request a verification code first." The dict was
also wiped by every restart and deploy, silently invalidating codes already in
users' inboxes.

Redis is already a hard dependency (it is the Celery broker), so codes live
there and every worker sees the same state.

Expiry is tracked with an explicit `expires_at` field rather than by Redis TTL
alone, so an expired code can be reported as "expired" instead of being
indistinguishable from one that was never requested. The Redis TTL is set
longer than the code lifetime purely as a garbage-collection backstop.
"""

import time
from typing import Optional

import redis.asyncio as aioredis

from config import settings

KEY_PREFIX = "levelup:email_code:"

# Signup verification and password reset must never share a record: a code
# issued for one would otherwise satisfy the other, letting a signup code reset
# an existing account's password.
PURPOSE_SIGNUP = "signup"
PURPOSE_PASSWORD_RESET = "password_reset"
PURPOSE_ADMIN_MFA = "admin_mfa"

# Grace beyond the code's own lifetime, so the record still exists to be
# reported as expired rather than vanishing into "never requested".
_TTL_GRACE_SECONDS = 300

# Verification outcomes. The caller maps these to HTTP responses; keeping them
# as values rather than raising means the store has no HTTP dependency.
OK = "ok"
MISSING = "missing"
EXPIRED = "expired"
TOO_MANY_ATTEMPTS = "too_many_attempts"
INVALID = "invalid"

_client: Optional[aioredis.Redis] = None


def get_client() -> aioredis.Redis:
    global _client
    if _client is None:
        _client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _client


def reset_client() -> None:
    """Drop the cached client. Used by tests."""
    global _client
    _client = None


def _key(email: str, purpose: str) -> str:
    return f"{KEY_PREFIX}{purpose}:{email}"


async def store_code(
    email: str,
    code: str,
    purpose: str = PURPOSE_SIGNUP,
    ttl_minutes: Optional[int] = None,
) -> None:
    ttl = ttl_minutes if ttl_minutes is not None else settings.EMAIL_CODE_TTL_MINUTES
    expires_at = time.time() + ttl * 60
    client = get_client()
    key = _key(email, purpose)
    # Overwrites any previous code for this address: requesting a new code
    # must invalidate the old one and reset the attempt counter.
    await client.delete(key)
    # Write fields separately for compatibility with the Redis 3.x Windows
    # build used by local development. Redis 4+ accepts the multi-field
    # ``HSET key mapping=...`` form, but Redis 3.x rejects it with
    # "wrong number of arguments for 'hset' command" and turns signup into a
    # misleading browser CORS/Failed to fetch error.
    await client.hset(key, "code", code)
    await client.hset(key, "attempts", "0")
    await client.hset(key, "expires_at", str(expires_at))
    await client.expire(key, int(ttl * 60) + _TTL_GRACE_SECONDS)


async def verify_code(
    email: str, submitted: str, purpose: str = PURPOSE_SIGNUP
) -> str:
    """Check a submitted code, consuming it on success. Returns one of the
    module-level outcome constants."""
    client = get_client()
    key = _key(email, purpose)
    record = await client.hgetall(key)

    if not record:
        return MISSING

    try:
        expires_at = float(record.get("expires_at", "0"))
    except (TypeError, ValueError):
        expires_at = 0.0
    if time.time() > expires_at:
        await client.delete(key)
        return EXPIRED

    try:
        attempts = int(record.get("attempts", "0"))
    except (TypeError, ValueError):
        attempts = 0
    if attempts >= settings.EMAIL_CODE_MAX_ATTEMPTS:
        await client.delete(key)
        return TOO_MANY_ATTEMPTS

    stored = str(record.get("code", ""))
    # Compared in constant time: a timing side channel would otherwise leak the
    # code one character at a time, and only 10^6 values exist.
    if not _constant_time_equals(stored, submitted):
        # HINCRBY rather than a read-modify-write, so two concurrent guesses
        # cannot both observe the same count and overshoot the attempt cap.
        await client.hincrby(key, "attempts", 1)
        return INVALID

    # Single-use: a verified code must not be replayable.
    await client.delete(key)
    return OK


def _constant_time_equals(a: str, b: str) -> bool:
    import hmac

    return hmac.compare_digest(a, b)
