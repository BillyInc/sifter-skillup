"""Strip server-only columns from a user row before it leaves the API."""
from __future__ import annotations

from typing import Any

# Columns that must never reach a client. `_mfa_verified` is injected by
# Auth.get_current_user and is internal.
SECRET_USER_KEYS = frozenset({"password_hash", "token_version", "_mfa_verified"})


def sanitize_user_row(user: dict | None) -> dict:
    """Return a copy of ``user`` without secrets (the input is not mutated)."""
    return {k: v for k, v in (user or {}).items() if k not in SECRET_USER_KEYS}


def strip_secrets(value: Any) -> Any:
    """Recursively drop secret keys from any JSON-like value.

    Used as a last line of defence on every response envelope, so a route that
    forgets to call sanitize_user_row still cannot leak a password hash.
    """
    if isinstance(value, dict):
        return {k: strip_secrets(v) for k, v in value.items() if k not in SECRET_USER_KEYS}
    if isinstance(value, (list, tuple)):
        return [strip_secrets(v) for v in value]
    return value
