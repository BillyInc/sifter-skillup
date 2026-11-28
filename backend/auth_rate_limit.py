"""In-memory sliding-window limits for authentication endpoints.

This is a best-effort, per-worker safeguard, NOT the primary rate limit. The edge
(nginx limit_req on /api/auth/, see the deploy workflows) is the primary limit.
With N workers the effective ceiling here is up to N times the configured number.

Design, and the trade-offs it makes on purpose
- Availability beats strictness. This layer never answers 429 because a table is
  full, never has a global bucket, and never hard-locks an account when the real
  client address is unknown (any of those would let one client deny service to
  everybody). Each of those cases fails OPEN; the edge limit and bcrypt cost are
  the backstop.
- Guessable steps are keyed on (account, client address) while the real address
  is known: an attacker's failures lock out (account, attacker address) only.
  A per-address ceiling (sized for schools) covers one address across accounts.
- Only failures are counted for sign-in and code guessing; a correct password
  clears that client's own counter. Mail-sending steps are keyed on (email,
  address) with a larger per-email ceiling, so mail bombing one victim stops
  without ever blocking sign-in.
- Memory is bounded. Activity counters are capped per bucket (MAX_KEYS); when a
  bucket is full the OLDEST counter is evicted (one warning a minute is logged).
  Active blocks live in a separate, separately bounded store (MAX_BLOCKS, oldest
  dropped first), so a flood of junk keys can never evict a block. A full sweep
  every minute drops everything expired, so one old entry cannot stall cleanup.
- Per-address limits apply only when the real client address is known (see
  client_ip); otherwise every request would share one "address".
"""
from __future__ import annotations

import hashlib
import ipaddress
import logging
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
    # mail-sending steps (requests)
    "email_code_pair": (60 * 60, 3),
    "email_code_email": (60 * 60, 10),
    "email_code_ip": (60 * 60, 60),
    "reset_request_pair": (60 * 60, 3),
    "reset_request_email": (60 * 60, 10),
    "reset_request_ip": (60 * 60, 60),
    # "you already have an account" notices: one per address per day
    "account_exists_notice_email": (24 * 60 * 60, 1),
    # code guessing: the code space is small, so this stays tight per email
    "reset_confirm_fail_email": (15 * 60, 5),
    "reset_confirm_fail_ip": (15 * 60, 100),
    # account creation (successes), per address; generous, skipped without an address.
    # Guest sign-in is the main entry point and a whole school shares one NAT address,
    # so it is sized for several classes an hour (edge limit: 30r/m, burst 100).
    "guest_create_ip": (60 * 60, 600),
    "wallet_create_ip": (60 * 60, 60),
    # admin MFA
    "mfa_request_user": (60 * 60, 6),
    "mfa_verify_fail_user": (15 * 60, 8),
    "mfa_defer_fail_user": (15 * 60, 5),
}

MAX_KEYS = 50_000                # activity counters per bucket
MAX_BLOCKS = 100_000             # active blocks, all buckets
MAX_KEY_LENGTH = 128
MAX_BACKOFF_SECONDS = 4 * 60 * 60
# Address buckets are shared by everyone behind one address (a school), so a
# lockout there must clear quickly.
BACKOFF_CAPS: dict[str, int] = {
    "login_fail_ip": 15 * 60,
    "email_code_ip": 15 * 60,
    "reset_request_ip": 15 * 60,
    "reset_confirm_fail_ip": 15 * 60,
    "guest_create_ip": 15 * 60,
    "wallet_create_ip": 15 * 60,
}
STRIKE_DECAY_SECONDS = 24 * 60 * 60
SWEEP_INTERVAL_SECONDS = 60
WARN_INTERVAL_SECONDS = 60

log = logging.getLogger(__name__)


class _Block:
    __slots__ = ("until", "strikes", "last_strike")

    def __init__(self, until: float, strikes: int, last_strike: float) -> None:
        self.until = until
        self.strikes = strikes
        self.last_strike = last_strike


class SlidingWindowLimiter:
    """Sliding windows with back-off. Fails open under memory pressure."""

    def __init__(self, limits: dict[str, tuple[int, int]] = LIMITS,
                 clock: Callable[[], float] = time.time, max_keys: int = MAX_KEYS,
                 max_blocks: int = MAX_BLOCKS) -> None:
        self._limits = limits
        self._clock = clock
        self._max_keys = max_keys
        self._max_blocks = max_blocks
        self._tables: dict[str, "OrderedDict[str, deque]"] = {}
        self._blocks: "OrderedDict[tuple[str, str], _Block]" = OrderedDict()
        self._lock = threading.Lock()
        self._last_sweep: Optional[float] = None
        self._last_warn: Optional[float] = None

    # -- introspection -----------------------------------------------------
    def key_count(self) -> int:
        with self._lock:
            return sum(len(t) for t in self._tables.values()) + len(self._blocks)

    def bucket_key_count(self, bucket: str) -> int:
        with self._lock:
            return len(self._tables.get(bucket, ()))

    def block_count(self) -> int:
        with self._lock:
            return len(self._blocks)

    # -- internals (lock held) ---------------------------------------------
    def _maybe_sweep(self, now: float) -> None:
        if self._last_sweep is not None and now - self._last_sweep < SWEEP_INTERVAL_SECONDS:
            return
        self._last_sweep = now
        for bucket, table in self._tables.items():
            window = self._limits[bucket][0]
            for key in [k for k, ev in table.items() if not ev or ev[-1] <= now - window]:
                del table[key]
        for bk in [k for k, b in self._blocks.items()
                   if b.until <= now and now - b.last_strike > STRIKE_DECAY_SECONDS]:
            del self._blocks[bk]

    def _warn_evicting(self, bucket: str, now: float) -> None:
        if self._last_warn is None or now - self._last_warn >= WARN_INTERVAL_SECONDS:
            self._last_warn = now
            log.warning("auth rate limiter: bucket %s is full; evicting the oldest counters "
                        "(possible key flood). The edge rate limit is the backstop.", bucket)

    # -- public --------------------------------------------------------------
    def retry_after(self, bucket: str, key: str) -> Optional[int]:
        """Seconds until the next event is allowed, or None. Never refuses for capacity."""
        window, maximum = self._limits[bucket]
        now = self._clock()
        with self._lock:
            self._maybe_sweep(now)
            block = self._blocks.get((bucket, key))
            if block is not None and block.until > now:
                return max(1, int(math.ceil(block.until - now)))
            table = self._tables.get(bucket)
            events = table.get(key) if table is not None else None
            if events is None:
                return None
            while events and events[0] <= now - window:
                events.popleft()
            if not events:
                del table[key]
                return None
            if len(events) < maximum:
                return None
            strikes = 1
            if block is not None and now - block.last_strike <= STRIKE_DECAY_SECONDS:
                strikes = block.strikes + 1
            sliding = max(1.0, events[len(events) - maximum] + window - now)
            cap = float(BACKOFF_CAPS.get(bucket, MAX_BACKOFF_SECONDS))
            wait = min(sliding * (2 ** (strikes - 1)), cap)
            del table[key]  # the block now carries the state
            self._blocks.pop((bucket, key), None)
            self._blocks[(bucket, key)] = _Block(now + wait, strikes, now)
            while len(self._blocks) > self._max_blocks:
                self._blocks.popitem(last=False)
            return max(1, int(math.ceil(wait)))

    def record(self, bucket: str, key: str) -> None:
        now = self._clock()
        with self._lock:
            self._maybe_sweep(now)
            table = self._tables.setdefault(bucket, OrderedDict())
            events = table.get(key)
            if events is None:
                if len(table) >= self._max_keys:
                    table.popitem(last=False)  # evict the oldest counter, never refuse
                    self._warn_evicting(bucket, now)
                events = deque()
                table[key] = events
            else:
                table.move_to_end(key)
            events.append(now)

    def clear(self, bucket: str, key: str) -> None:
        with self._lock:
            table = self._tables.get(bucket)
            if table is not None:
                table.pop(key, None)
            self._blocks.pop((bucket, key), None)

    def reset(self) -> None:
        with self._lock:
            self._tables.clear()
            self._blocks.clear()
            self._last_sweep = None
            self._last_warn = None


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


# A single request from a private address (VPN, intranet, a health probe on the
# LAN) must not condemn the whole process, so the warning needs a run of
# unresolvable requests with no successfully resolved public client in between,
# and it repeats at most once per cooldown instead of latching for the process
# life. Deliberately not exposed on /health: it would tell an unauthenticated
# caller when per-address limits are off.
_BLIND_WINDOW_SECONDS = 300.0
_BLIND_THRESHOLD = 5
_BLIND_REWARN_SECONDS = 3600.0
_blind_hits: list = []
_last_resolved_at: Optional[float] = None
_last_blind_warning_at: Optional[float] = None
_warned_loopback_forwarded = False


def _reset_warning_state() -> None:
    global _last_resolved_at, _last_blind_warning_at, _warned_loopback_forwarded
    _blind_hits.clear()
    _last_resolved_at = None
    _last_blind_warning_at = None
    _warned_loopback_forwarded = False


def _is_loopback(host: str) -> bool:
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _note_resolved() -> None:
    global _last_resolved_at
    _last_resolved_at = time.monotonic()


def _warn_loopback_forwarded(peer: str, headers) -> None:
    """One ERROR when a loopback peer carries X-Forwarded-For with trust off.

    That is the signature of the most common misconfiguration: a local proxy
    (nginx on the same host) forwards real client addresses but the app is not
    told to read them, so every request looks like one loopback client.
    """
    global _warned_loopback_forwarded
    if _warned_loopback_forwarded or settings.DEBUG or settings.TRUST_PROXY_HEADERS:
        return
    if not _is_loopback(peer) or not headers or not headers.get("x-forwarded-for"):
        return
    _warned_loopback_forwarded = True
    log.error(
        "auth rate limits: requests arrive from a loopback peer with X-Forwarded-For set "
        "while TRUST_PROXY_HEADERS is off, so per-address limits are inactive (claim-code "
        "address bucket, guest and wallet creation limits). Set TRUST_PROXY_HEADERS=true "
        "and TRUSTED_PROXY_HOPS to the number of proxies in front of the app; see "
        "docs/ops/nginx-auth-rate-limit.md (Deployment requirement for address limits)."
    )


def _warn_no_client_ip(peer: str) -> None:
    """Warn (rate limited) that per-address limits look inactive.

    Address limits (claim-code address bucket, guest and wallet creation) all
    fail open without a usable client address. A warning is logged only after
    several such requests inside a window with no resolvable public client in
    that window, and at most once per cooldown.
    """
    global _last_blind_warning_at
    if settings.DEBUG:
        return
    now = time.monotonic()
    _blind_hits.append(now)
    del _blind_hits[: max(0, len(_blind_hits) - 100)]
    recent = [t for t in _blind_hits if now - t <= _BLIND_WINDOW_SECONDS]
    _blind_hits[:] = recent
    if len(recent) < _BLIND_THRESHOLD:
        return
    if _last_resolved_at is not None and now - _last_resolved_at <= _BLIND_WINDOW_SECONDS:
        return
    if _last_blind_warning_at is not None and now - _last_blind_warning_at < _BLIND_REWARN_SECONDS:
        return
    if settings.TRUST_PROXY_HEADERS:
        # A trusted proxy was configured but the entry it should have appended is
        # missing or not a public address: the hop count is wrong, or the app is
        # being reached without the proxy.
        if _is_loopback(peer):
            return
        reason = (
            "TRUST_PROXY_HEADERS is on but X-Forwarded-For has no public client address at "
            f"TRUSTED_PROXY_HOPS={max(1, int(getattr(settings, 'TRUSTED_PROXY_HOPS', 1) or 1))} "
            "(wrong hop count, or requests are reaching the app without the proxy)"
        )
    else:
        reason = "only private/loopback peers are visible and TRUST_PROXY_HEADERS is off"
    _last_blind_warning_at = now
    log.warning(
        "auth rate limits: %s, so per-address limits are inactive (claim-code address "
        "bucket, guest and wallet creation limits). Behind exactly one trusted proxy set "
        "TRUST_PROXY_HEADERS=true and TRUSTED_PROXY_HOPS=1, and never expose the app "
        "port directly; see docs/ops/nginx-auth-rate-limit.md (Deployment requirement "
        "for address limits).", reason,
    )


def client_ip(request: Request) -> Optional[str]:
    """The real client address, or None when it cannot be trusted.

    With TRUST_PROXY_HEADERS on, the entry that our own proxy appended is used:
    TRUSTED_PROXY_HOPS places from the RIGHT of X-Forwarded-For (default 1).
    The leftmost entries are supplied by the client and are never used. Without
    it, only a public peer address counts (loopback/private peers mean a proxy
    sits in front of us and every request would look like one client).

    Deployment requirement: both settings must describe exactly the proxies in
    front of the app, and the app port must not be reachable except through
    them. Otherwise the limits are off (unset/wrong) or X-Forwarded-For can be
    spoofed to mint a fresh address key per request.
    """
    peer = request.client.host if request.client else ""
    if settings.TRUST_PROXY_HEADERS:
        hops = max(1, int(getattr(settings, "TRUSTED_PROXY_HOPS", 1) or 1))
        raw = request.headers.get("x-forwarded-for", "")
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        if len(parts) >= hops:
            candidate = parts[-hops]
            if _is_public(candidate):
                _note_resolved()
                return _normalise(candidate)
            _warn_no_client_ip(peer)
            return None
    if _is_public(peer):
        _note_resolved()
        return _normalise(peer)
    _warn_loopback_forwarded(peer, getattr(request, "headers", None))
    _warn_no_client_ip(peer)
    return None


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
    """Sign-in limits need a known client address; without one there is no
    account-wide lockout (it would let anyone lock the owner out). The edge limit
    and bcrypt cost still apply."""
    if not ip:
        return []
    email = _key(email)
    return [("login_fail_pair", f"{email}|{ip}"), ("login_fail_ip", ip)]


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
        if bucket == "login_fail_pair":
            clear(bucket, key)


def request_gate(prefix: str, email: str, ip: Optional[str]) -> bool:
    """Gate for mail-sending endpoints. Returns True when mail may be sent.

    The (email, address) pair and the address buckets answer 429 as usual. The
    per-email ceiling never raises: past it we return False so the caller skips
    sending and gives the same 200 answer, so a flood cannot keep a victim's own
    request failing.
    """
    if ip:
        for bucket, key in ((f"{prefix}_pair", f"{_key(email)}|{ip}"), (f"{prefix}_ip", ip)):
            enforce(bucket, key)
            record(bucket, key)
    return allow_once(f"{prefix}_email", _key(email))
