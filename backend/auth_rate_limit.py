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
- Memory is bounded WITHOUT ever evicting a live counter. Checks never create
  state, empty windows are dropped, keys are length-capped, and each bucket
  holds at most MAX_KEYS keys. Evicting an entry would reset it: an attacker who
  floods junk keys could wipe a victim's failure count and win a fresh guess
  budget. So when a bucket is full of live entries it FAILS CLOSED for NEW keys
  (429) and keeps every existing counter. A key whose window has passed frees
  its slot. The price is that a very large flood can briefly refuse new keys in
  that one bucket; it cannot touch other buckets or existing counters.
- When the real address is unknown, mail-sending steps also share one coarse
  global bucket per endpoint, so unlimited distinct emails cannot be used to
  create unlimited keys or unlimited mail.
- Address ceilings are sized for schools (many students behind one address):
  generous, with a short back-off cap. The per-account (email, address) and
  per-email limits stay tight.
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
    "login_fail_ip": (15 * 60, 200),            # address, across accounts (schools share one)
    "login_fail_email_noip": (15 * 60, 30),     # email, when the address is unknown
    "login_fail_email_global": (60 * 60, 400),  # email, last resort against a botnet
    # mail-sending steps (requests)
    "email_code_pair": (60 * 60, 3),
    "email_code_email": (60 * 60, 10),
    "email_code_ip": (60 * 60, 60),
    "email_code_global_noip": (60 * 60, 600),   # all requests, when the address is unknown
    "reset_request_pair": (60 * 60, 3),
    "reset_request_email": (60 * 60, 10),
    "reset_request_ip": (60 * 60, 60),
    "reset_request_global_noip": (60 * 60, 600),
    # "you already have an account" notices: one per address per day
    "account_exists_notice_email": (24 * 60 * 60, 1),
    # code guessing: the code space is small, so this stays tight per email
    "reset_confirm_fail_email": (15 * 60, 5),
    "reset_confirm_fail_ip": (15 * 60, 100),
    # admin MFA
    "mfa_request_user": (60 * 60, 6),
    "mfa_verify_fail_user": (15 * 60, 8),
    "mfa_defer_fail_user": (15 * 60, 5),
}

MAX_KEYS = 50_000                # per bucket
MAX_KEY_LENGTH = 128
MAX_BACKOFF_SECONDS = 4 * 60 * 60
# Address buckets are shared by everyone behind one address (a school), so a
# lockout there must clear quickly.
BACKOFF_CAPS: dict[str, int] = {
    "login_fail_ip": 15 * 60,
    "email_code_ip": 15 * 60,
    "reset_request_ip": 15 * 60,
    "reset_confirm_fail_ip": 15 * 60,
}
STRIKE_DECAY_SECONDS = 24 * 60 * 60
CAPACITY_RETRY_SECONDS = 60      # answer for a NEW key when its bucket is full


class _Entry:
    __slots__ = ("events", "blocked_until", "strikes", "last_strike")

    def __init__(self) -> None:
        self.events: deque = deque()
        self.blocked_until = 0.0
        self.strikes = 0
        self.last_strike = 0.0


class SlidingWindowLimiter:
    """Sliding windows with back-off, one ordered table per bucket.

    Each table is ordered by last activity, so expired entries sit at the front
    and are dropped in O(1). Live entries are never evicted (see module doc).
    """

    def __init__(self, limits: dict[str, tuple[int, int]] = LIMITS,
                 clock: Callable[[], float] = time.time, max_keys: int = MAX_KEYS) -> None:
        self._limits = limits
        self._clock = clock
        self._max_keys = max_keys
        self._tables: dict[str, "OrderedDict[str, _Entry]"] = {}
        self._lock = threading.Lock()

    # -- introspection -----------------------------------------------------
    def key_count(self) -> int:
        with self._lock:
            return sum(len(t) for t in self._tables.values())

    def bucket_key_count(self, bucket: str) -> int:
        with self._lock:
            return len(self._tables.get(bucket, ()))

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

    def _sweep_front(self, table: "OrderedDict[str, _Entry]", now: float, window: int) -> None:
        """Drop expired entries from the front (least recently active)."""
        while table:
            key = next(iter(table))
            if self._expired(table[key], now, window):
                del table[key]
            else:
                return

    def _full(self, table: "OrderedDict[str, _Entry]", now: float, window: int) -> bool:
        self._sweep_front(table, now, window)
        return len(table) >= self._max_keys

    # -- public --------------------------------------------------------------
    def retry_after(self, bucket: str, key: str) -> Optional[int]:
        """Seconds until the next event is allowed, or None if allowed now.

        Never creates state. A NEW key in a bucket that is full of live entries
        is refused (fail closed) instead of evicting somebody's counter.
        """
        window, maximum = self._limits[bucket]
        now = self._clock()
        with self._lock:
            table = self._tables.get(bucket)
            entry = table.get(key) if table is not None else None
            if entry is None:
                if table is not None and self._full(table, now, window):
                    return CAPACITY_RETRY_SECONDS
                return None
            if self._expired(entry, now, window):
                del table[key]
                return None
            if entry.blocked_until > now:
                return max(1, int(math.ceil(entry.blocked_until - now)))
            if len(entry.events) >= maximum:
                if now - entry.last_strike > STRIKE_DECAY_SECONDS:
                    entry.strikes = 0
                entry.strikes += 1
                entry.last_strike = now
                sliding = max(1.0, entry.events[len(entry.events) - maximum] + window - now)
                cap = float(BACKOFF_CAPS.get(bucket, MAX_BACKOFF_SECONDS))
                wait = min(sliding * (2 ** (entry.strikes - 1)), cap)
                entry.blocked_until = now + wait
                return max(1, int(math.ceil(wait)))
        return None

    def record(self, bucket: str, key: str) -> None:
        window = self._limits[bucket][0]
        now = self._clock()
        with self._lock:
            table = self._tables.setdefault(bucket, OrderedDict())
            entry = table.get(key)
            if entry is None:
                if self._full(table, now, window):
                    return  # fail closed: never evict a live counter to make room
                entry = _Entry()
                table[key] = entry
            else:
                table.move_to_end(key)
            entry.events.append(now)
            self._sweep_front(table, now, window)

    def clear(self, bucket: str, key: str) -> None:
        with self._lock:
            table = self._tables.get(bucket)
            if table is not None:
                table.pop(key, None)

    def reset(self) -> None:
        with self._lock:
            self._tables.clear()


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


def allow_once(bucket: str, key: str) -> bool:
    """True and counts the event if ``key`` still has allowance; never raises.

    For best-effort actions (a courtesy email) that should simply be skipped, not
    answered with a 429, when the allowance is used up.
    """
    if not settings.AUTH_RATE_LIMIT_ENABLED or not key:
        return True
    k = _key(key)
    if limiter.retry_after(bucket, k) is not None:
        return False
    limiter.record(bucket, k)
    return True


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
    # Address unknown: per email, plus one coarse bucket for the whole endpoint so
    # distinct emails cannot be used to mail or to create keys without limit.
    return [(f"{prefix}_email", email), (f"{prefix}_global_noip", "global")]


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
