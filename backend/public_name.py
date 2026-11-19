"""The name other users may see for a person.

`users.username` is built from the legal first + middle + last name at sign-up
(or from the email local part), so it must never be shown to other people.
`public_name` is what every payload that exposes ANOTHER user's identity uses:

1. `display_name`, the optional name the user chose (not unique), else
2. the FIRST NAME only, else
3. the neutral "Learner".

It never returns the username, the full legal name or any part of an email.
The owner still sees their own name through their own profile payload.

The helper is defensive: it accepts rows with or without the `display_name`
column (the migration may not be applied yet) and with missing/None values.
"""
import re
from typing import Any, Callable, Iterable, Mapping, Optional

NEUTRAL_PUBLIC_NAME = "Learner"
# Columns a query must select to compute the public name for a row.
PUBLIC_NAME_COLUMNS = "display_name, first_name"
PUBLIC_NAME_COLUMNS_FALLBACK = "first_name"

_PLACEHOLDERS = {"student", "guest", "user", "learner"}


def _clean(value: Any) -> str:
    return re.sub(r"\s+", " ", value).strip() if isinstance(value, str) else ""


def _usable(value: str) -> bool:
    # Reject empties, generic placeholders and anything that looks like contact details.
    return bool(value) and value.lower() not in _PLACEHOLDERS and "@" not in value


def public_name(user_row: Optional[Mapping[str, Any]]) -> str:
    """Return the name safe to show to other users for this user row."""
    if not user_row:
        return NEUTRAL_PUBLIC_NAME
    chosen = _clean(user_row.get("display_name"))
    if _usable(chosen):
        return chosen
    first = _clean(user_row.get("first_name")).split(" ")[0]
    if _usable(first):
        return first
    return NEUTRAL_PUBLIC_NAME


def is_missing_name_column_error(exc: BaseException) -> bool:
    """True when a query failed only because `display_name` is not migrated yet."""
    return "display_name" in str(exc)


def run_with_public_name_columns(build: Callable[[str], Any]) -> Any:
    """Execute `build(columns)` with the public-name columns, retrying without
    `display_name` when the column does not exist yet.

    `build` receives the comma-separated column fragment to splice into the
    select and must return an executed result (call `.execute()` itself).
    """
    try:
        return build(PUBLIC_NAME_COLUMNS)
    except Exception as exc:  # pragma: no cover - exercised via tests with a fake DB
        if not is_missing_name_column_error(exc):
            raise
        return build(PUBLIC_NAME_COLUMNS_FALLBACK)


def public_names_for_ids(client: Any, user_ids: Iterable[str]) -> dict:
    """Map user id -> public name with one query. Returns {} on any failure so
    callers can fall back to the neutral name rather than leaking `username`."""
    ids = sorted({str(i) for i in user_ids if i})
    if not ids:
        return {}
    try:
        res = run_with_public_name_columns(
            lambda cols: client.table("users").select(f"id, {cols}").in_("id", ids).execute()
        )
    except Exception:
        return {}
    return {row["id"]: public_name(row) for row in (res.data or []) if row.get("id")}


def publicize_user_row(row: Mapping[str, Any], legacy_key: Optional[str] = "username") -> dict:
    """Copy of `row` safe for other users: adds `public_name`, drops the raw
    name columns and, when `legacy_key` is set, overwrites that display-only
    field (old clients render it) with the public name instead of the legal one."""
    out = {k: v for k, v in row.items() if k not in ("display_name", "first_name")}
    name = public_name(row)
    out["public_name"] = name
    if legacy_key:
        out[legacy_key] = name
    return out
