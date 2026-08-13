"""Small shared cache for public admission/reference lookups.

Redis is used when it is available so identical searches can be reused by
different workers and users. A short-lived process cache keeps the API useful
when Redis is not running locally. Cached values are read-only reference data;
they are never used for authentication or user-specific records.
"""
from __future__ import annotations

import json
import time
from typing import Any, Optional

from config import settings
from logger import log

try:
    from redis import Redis
except ImportError:  # pragma: no cover - dependency is present in deployments
    Redis = None  # type: ignore[assignment,misc]


SEARCH_TTL_SECONDS = 7 * 24 * 60 * 60
REFERENCE_TTL_SECONDS = 24 * 60 * 60

_memory: dict[str, tuple[float, Any]] = {}
_redis: Any = None
_redis_disabled_until = 0.0


def _client() -> Any:
    global _redis, _redis_disabled_until
    if Redis is None or time.monotonic() < _redis_disabled_until:
        return None
    if _redis is None:
        try:
            _redis = Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=0.15,
                socket_timeout=0.15,
            )
        except Exception:
            _redis_disabled_until = time.monotonic() + 60
            return None
    return _redis


def get_json(key: str) -> Optional[Any]:
    """Return a non-expired JSON value, or ``None`` on a cache miss."""
    client = _client()
    if client is not None:
        try:
            raw = client.get(key)
            if raw:
                return json.loads(raw)
        except Exception as exc:  # noqa: BLE001
            log.debug("reference cache read skipped", key=key, error=str(exc))

    entry = _memory.get(key)
    if entry and entry[0] > time.monotonic():
        return entry[1]
    if entry:
        _memory.pop(key, None)
    return None


def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    """Store a JSON-safe value in Redis and the local fallback cache."""
    expires_at = time.monotonic() + ttl_seconds
    _memory[key] = (expires_at, value)
    client = _client()
    if client is not None:
        try:
            client.setex(key, ttl_seconds, json.dumps(value, separators=(",", ":")))
        except Exception as exc:  # noqa: BLE001
            log.debug("reference cache write skipped", key=key, error=str(exc))


def clear_prefix(prefix: str) -> None:
    """Invalidate reference lookups affected by a registry/data change."""
    for key in list(_memory):
        if key.startswith(prefix):
            _memory.pop(key, None)
    client = _client()
    if client is not None:
        try:
            keys = list(client.scan_iter(match=f"{prefix}*", count=200))
            if keys:
                client.delete(*keys)
        except Exception as exc:  # noqa: BLE001
            log.debug("reference cache invalidation skipped", prefix=prefix, error=str(exc))
