"""In-memory sliding-window limits for authentication endpoints.

Per worker process: with N workers the effective ceiling is up to N times the
configured number. That still stops online guessing and mail flooding; a shared
store (Redis) is the upgrade if a hard global cap is needed.

Design, and the trade-offs it makes on purpose
- A lockout is also a denial of service: whoever can trigger it can lock the
  owner out. So guessable steps are keyed on (account, client address) whenever
  the real address is known. An attacker's failures from address A lock out
  (account, A) only; the owner signing in from address B is untouched. A very
  high per-account ceiling remains as a last resort against a botnet.
- When the real address is NOT known (behind a proxy that does not forward it)
  the only key is the account. That key gets a higher threshold than the
  pair key, so a few typos never lock anyone out, plus exponential back-off so
  sustained guessing slows down rather than hard-blocking an honest owner for
  the same fixed time every time.
- Only failures are counted for sign-in and code guessing; a correct password
  clears the account's own counter.
- Mail-sending steps (signup and reset codes) are keyed on (email, address),
  with a larger per-email ceiling. Residual risk: a distributed attacker who
  uses many addresses can still use up one email's hourly allowance and delay
  that person's code request. That is the price of stopping mail bombing, and
  it never blocks sign-in.
- Every check answers identically for registered and unknown accounts; limits
  are applied before any database lookup.
- Memory is bounded: checks never create state, empty windows are dropped,
  keys are length-capped, and the table is capped at MAX_KEYS with
  least-recently-active eviction (a key that is currently locked out is
  evicted last).
- Per-address limits are applied only when the real client address is known
  (see client_ip). Behind a proxy that does not forward it, every request
  would share one "address" and one abuser would lock everybody out.
"""
from __future__ import annotations

import hashlib
import ipaddress
import math
import threading
import time
from collections import OrderedDict, deque
from typing import Callable, Optional

from fastapi import HTTPException, Request

from config import settings

# bucket -> (window seconds, maximum events in the window)
LIMITS: dict[str, tuple[int, int]] = {
    # sign-in guessing (failures only)
    "login_fail_pair": (15 * 60, 8),            # (email, address)
    "login_fail_ip": (15 * 60, 40),             # address, across accounts
    "login_fail_email_noip": (15 * 60, 30),     # email, when the address is unknown
    "login_fail_email_global": (60 * 60, 400),  # email, last resort against a botnet
    # mail-sending steps (requests)
    "email_code_pair": (60 * 60, 3),
    "email_code_email": (60 * 60, 10),
    "email_code_ip": (60 * 60, 15),
    "reset_request_pair": (60 * 60, 3),
    "reset_request_email": (60 * 60, 10),
    "reset_request_ip": (60 * 60, 15),
    # code guessing: the code space is small, so this stays tight per email
    "reset_confirm_fail_email": (15 * 60, 5),
    "reset_confirm_fail_ip": (15 * 60, 30),
    # admin MFA
    "mfa_request_user": (60 * 60, 6),
    "mfa_verify_fail_user": (15 * 60, 8),
    "mfa_defer_fail_user": (15 * 60, 5),
}

MAX_KEYS = 50_000
MAX_KEY_LENGTH = 128
MAX_BACKOFF_SECONDS = 4 * 60 * 60
STRIKE_DECAY_SECONDS = 24 * 60 * 60
_SWEEP_PER_RECORD = 5


class _Entry:
    __slots__ = ("events", "blocked_until", "strikes", "last_strike")

    def __init__(self) -> None:
        self.events: deque = deque()
        self.blocked_until = 0.0
        self.strikes = 0
        self.last_strike = 0.0


class SlidingWindowLimiter:
    def __init__(self, limits: dict[str, tuple[int, int]] = LIMITS,
                 clock: Callable[[], float] = time.time, max_keys: int = MAX_KEYS) -> None:
        self._limits = limits
        self._clock = clock
        self._max_keys = max_keys
        self._state: "OrderedDict[tuple[str, str], _Entry]" = OrderedDict()
        self._lock = threading.Lock()

    # -- introspection -----------------------------------------------------
    def key_count(self) -> int:
        with self._lock:
            return len(self._state)

    # -- internals (lock held) ---------------------------------------------
    def _prune(self, entry: _Entry, now: float, window: int) -> None:
        events = entry.events
        while events and events[0] <= now - window:
            events.popleft()

    def _expired(self, entry: _Entry, now: float, window: int) -> bool:
        self._prune(entry, now, window)
        if entry.events or entry.blocked_until > now:
            return False
        return entry.strikes == 0 or now - entry.last_strike > STRIKE_DECAY_SECONDS

    def _window_of(self, bucket: str) -> int:
        return self._limits[bucket][0]

    def _sweep_front(self, now: float) -> None:
        for _ in range(_SWEEP_PER_RECORD):
            if not self._state:
                return
            k = next(iter(self._state))
            if self._expired(self._state[k], now, self._window_of(k[0])):
                del self._state[k]
            else:
                return

    def _evict_over_cap(self, now: float) -> None:
        while len(self._state) > self._max_keys:
            victim = None
            for k, entry in self._state.items():  # least recently active first
                if entry.blocked_until <= now:
                    victim = k
                    break
            if victim is None:
                victim = next(iter(self._state))
            del self._state[victim]

    # -- public --------------------------------------------------------------
    def retry_after(self, bucket: str, key: str) -> Optional[int]:
        """Seconds until the next event is allowed, or None if allowed now.

        Never creates state for a key that has not recorded an event.
        """
        window, maximum = self._limits[bucket]
        now = self._clock()
        k = (bucket, key)
        with self._lock:
            entry = self._state.get(k)
            if entry is None:
                return None
            if self._expired(entry, now, window):
                del self._state[k]
                return None
            if entry.blocked_until > now:
                return max(1, int(math.ceil(entry.blocked_until - now)))
            if len(entry.events) >= maximum:
                if now - entry.last_strike > STRIKE_DECAY_SECONDS:
                    entry.strikes = 0
                entry.strikes += 1
                entry.last_strike = now
                sliding = max(1.0, entry.events[len(entry.events) - maximum] + window - now)
                wait = min(sliding * (2 ** (entry.strikes - 1)), float(MAX_BACKOFF_SECONDS))
                entry.blocked_until = now + wait
                return max(1, int(math.ceil(wait)))
        return None

    def record(self, bucket: str, key: str) -> None:
        now = self._clock()
        k = (bucket, key)
        with self._lock:
            entry = self._state.get(k)
            if entry is None:
                entry = _Entry()
                self._state[k] = entry
            else:
                self._state.move_to_end(k)
            entry.events.append(now)
            self._sweep_front(now)
            self._evict_over_cap(now)

    def clear(self, bucket: str, key: str) -> None:
        with self._lock:
            self._state.pop((bucket, key), None)

    def reset(self) -> None:
        with self._lock:
            self._state.clear()


limiter = SlidingWindowLimiter()


def reset_all() -> None:
    limiter.reset()


# -- client address ---------------------------------------------------------
def _is_public(host: str) -> bool:
    try:
        return ipaddress.ip_address(host).is_global
    except ValueError:
        return False


def _normalise(host: str) -> str:
    """One key per client: IPv4 as is, IPv6 collapsed to its /64."""
    ip = ipaddress.ip_address(host)
    if ip.version == 6:
        return f"{ipaddress.ip_network(f'{host}/64', strict=False).network_address}/64"
    return str(ip)


def client_ip(request: Request) -> Optional[str]:
    """The real client address, or None when it cannot be trusted.

    With TRUST_PROXY_HEADERS on, the entry that our own proxy appended is used:
    TRUSTED_PROXY_HOPS places from the RIGHT of X-Forwarded-For (default 1).
    The leftmost entries are supplied by the client and are never used. Without
    it, only a public peer address counts (loopback/private peers mean a proxy
    sits in front of us and every request would look like one client).
    """
    peer = request.client.host if request.client else ""
    if settings.TRUST_PROXY_HEADERS:
        hops = max(1, int(getattr(settings, "TRUSTED_PROXY_HOPS", 1) or 1))
        raw = request.headers.get("x-forwarded-for", "")
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        if len(parts) >= hops:
            candidate = parts[-hops]
            if _is_public(candidate):
                return _normalise(candidate)
            return None
    return _normalise(peer) if _is_public(peer) else None


def _key(value: str) -> str:
    text = (value or "").strip().lower()
    if len(text) > MAX_KEY_LENGTH:
        return "h:" + hashlib.sha256(text.encode("utf-8")).hexdigest()
    return text


# -- raising helpers ---------------------------------------------------------
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


# -- bucket sets ---------------------------------------------------------------
def login_buckets(email: str, ip: Optional[str]) -> list[tuple[str, str]]:
    email = _key(email)
    if ip:
        return [("login_fail_pair", f"{email}|{ip}"), ("login_fail_ip", ip),
                ("login_fail_email_global", email)]
    return [("login_fail_email_noip", email), ("login_fail_email_global", email)]


def request_buckets(prefix: str, email: str, ip: Optional[str]) -> list[tuple[str, str]]:
    email = _key(email)
    if ip:
        return [(f"{prefix}_pair", f"{email}|{ip}"), (f"{prefix}_email", email), (f"{prefix}_ip", ip)]
    return [(f"{prefix}_email", email)]


def enforce_all(buckets: list[tuple[str, str]]) -> None:
    for bucket, key in buckets:
        enforce(bucket, key)


def record_all(buckets: list[tuple[str, str]]) -> None:
    for bucket, key in buckets:
        record(bucket, key)


def clear_login(email: str, ip: Optional[str]) -> None:
    """A correct password clears this client's own counter only."""
    for bucket, key in login_buckets(email, ip):
        if bucket in ("login_fail_pair", "login_fail_email_noip"):
            clear(bucket, key)
