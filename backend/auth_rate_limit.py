"""Small in-memory sliding-window limits for authentication endpoints.

Per worker process: with N workers the effective ceiling is up to N times the
configured number. That still stops online guessing and mail flooding; a shared
store (Redis) is the upgrade if a hard global cap is needed.

Design notes
- Failures are counted for login, password-reset confirmation and similar
  guessable steps; requests are counted for steps that send mail.
- Per-IP limits are applied only when the real client address is known
  (see client_ip). Behind a proxy that does not forward the address, every
  request would share one "IP" and one abuser would lock everybody out.
"""
from __future__ import annotations

import ipaddress
import threading
import time
from collections import defaultdict, deque
from typing import Callable, Optional

from fastapi import HTTPException, Request

from config import settings

# bucket -> (window seconds, maximum events in the window)
LIMITS: dict[str, tuple[int, int]] = {
    "login_fail_email": (15 * 60, 8),
    "login_fail_ip": (15 * 60, 40),
    "email_code_email": (60 * 60, 3),
    "email_code_ip": (60 * 60, 15),
    "reset_request_email": (60 * 60, 3),
    "reset_request_ip": (60 * 60, 15),
    "reset_confirm_fail_email": (15 * 60, 5),
    "reset_confirm_fail_ip": (15 * 60, 30),
    "mfa_request_user": (60 * 60, 6),
    "mfa_defer_fail_user": (15 * 60, 5),
}


class SlidingWindowLimiter:
    def __init__(self, limits: dict[str, tuple[int, int]] = LIMITS,
                 clock: Callable[[], float] = time.time) -> None:
        self._limits = limits
        self._clock = clock
        self._events: dict[tuple[str, str], deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def retry_after(self, bucket: str, key: str) -> Optional[int]:
        """Seconds until the next event is allowed, or None if allowed now."""
        window, maximum = self._limits[bucket]
        now = self._clock()
        with self._lock:
            events = self._events[(bucket, key)]
            while events and events[0] <= now - window:
                events.popleft()
            if len(events) >= maximum:
                return max(1, int(events[len(events) - maximum] + window - now) + 1)
        return None

    def record(self, bucket: str, key: str) -> None:
        with self._lock:
            self._events[(bucket, key)].append(self._clock())

    def clear(self, bucket: str, key: str) -> None:
        with self._lock:
            self._events.pop((bucket, key), None)

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


limiter = SlidingWindowLimiter()


def reset_all() -> None:
    limiter.reset()


def _is_public(host: str) -> bool:
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False
    return not (ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_unspecified)


def client_ip(request: Request) -> Optional[str]:
    """The real client address, or None when it cannot be trusted.

    Returns None for loopback/private peers (a proxy in front of us) unless
    TRUST_PROXY_HEADERS is on and X-Forwarded-For names a public address.
    """
    peer = request.client.host if request.client else ""
    if settings.TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for", "")
        first = forwarded.split(",")[0].strip() if forwarded else ""
        if first and _is_public(first):
            return first
    return peer if _is_public(peer) else None


def _key(value: str) -> str:
    return (value or "").strip().lower()[:254]


def enforce(bucket: str, key: str) -> None:
    """Raise 429 with Retry-After if ``key`` has used up ``bucket``."""
    if not settings.AUTH_RATE_LIMIT_ENABLED or not key:
        return
    wait = limiter.retry_after(bucket, _key(key))
    if wait is not None:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(wait)},
        )


def record(bucket: str, key: str) -> None:
    if settings.AUTH_RATE_LIMIT_ENABLED and key:
        limiter.record(bucket, _key(key))


def clear(bucket: str, key: str) -> None:
    if key:
        limiter.clear(bucket, _key(key))
