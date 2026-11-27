"""Privacy helpers for account deletion.

A deleted learner may be a minor. After deletion we keep only what is needed
to enforce the 24 h sign-up cooldown, and only as keyed hashes:

- ``privacy_hash`` is HMAC-SHA256 under a server secret, so a leaked database
  row cannot be reversed or tested against a list of emails or device ids
  without the secret. Hashes carry the ``h1:`` prefix so they are never
  confused with legacy raw values.
- Rows written before this change still hold raw values. The cooldown check
  therefore matches either form until those rows expire (and
  ``purge_expired_cooldowns`` deletes expired rows altogether).

Set ``ACCOUNT_DELETION_HASH_SECRET`` in production. It falls back to
``JWT_SECRET`` so existing deployments keep working. When neither is a real
secret in a production process, an ERROR is logged at import and on first use
(deleting an account is never blocked by it). Hash values are never logged.

This module reduces what is kept about a deleted learner. It is not a claim of
complete erasure: see ``account_purge`` for what the hard delete removes.
"""
import hashlib
import hmac
import re
from datetime import datetime, timezone

from config import settings
from logger import log

PREFIX = "h1:"
_DEFAULT_SECRET = "change-me-in-production"
_warned = False


_MIN_SECRET_LENGTH = 16


def check_deletion_secret(debug: bool, hash_secret: str, jwt_secret: str):
    """A message when production would hash with a guessable key, else None.

    Only a missing hash secret combined with a default or short JWT secret
    (the fallback) is a problem. A configured hash secret, or a strong JWT
    secret to fall back on, is fine. Development (DEBUG) is never reported.
    """
    if debug:
        return None
    if (hash_secret or "").strip():
        return None
    jwt_secret = jwt_secret or ""
    if jwt_secret == _DEFAULT_SECRET or len(jwt_secret) < _MIN_SECRET_LENGTH * 2:
        return (
            "ACCOUNT_DELETION_HASH_SECRET is not set and JWT_SECRET is a default or short value: "
            "deletion-cooldown hashes can be guessed. Set ACCOUNT_DELETION_HASH_SECRET to a random "
            "value of at least 32 characters."
        )
    return None


def _secret() -> bytes:
    global _warned
    configured = (getattr(settings, "ACCOUNT_DELETION_HASH_SECRET", "") or "").strip()
    secret = configured or str(getattr(settings, "JWT_SECRET", "") or "")
    if not _warned:
        problem = check_deletion_secret(
            bool(getattr(settings, "DEBUG", False)), configured, str(getattr(settings, "JWT_SECRET", "") or "")
        )
        if problem:
            _warned = True
            log.error(problem)
        elif not configured:
            _warned = True
            log.warning("ACCOUNT_DELETION_HASH_SECRET is not set; deletion hashes use the JWT secret")
    return secret.encode("utf-8")


def privacy_hash(value: object, purpose: str) -> str:
    """Keyed, purpose-separated hash of ``value`` (emails are case-folded)."""
    text = str(value or "").strip()
    if purpose == "email":
        text = text.lower()
    mac = hmac.new(_secret(), f"{purpose}\x00{text}".encode("utf-8"), hashlib.sha256)
    return PREFIX + mac.hexdigest()


_DEVICE_ID_OK = re.compile(r"^[A-Za-z0-9_:\-]{1,128}$")


def normalize_device_id(value: object) -> str:
    """A bounded, filter-safe form of a client-supplied device id.

    A well-formed id (letters, digits, ``-``, ``_``, ``:``, up to 128
    characters) is kept as is. Anything else, such as an oversized header or
    one with commas or quotes, becomes a keyed hash, so the cooldown still
    applies to that exact value while nothing unbounded or unescaped is stored
    or placed in a query filter. Empty input stays empty.
    """
    raw = str(value or "").strip()
    if not raw:
        return ""
    if _DEVICE_ID_OK.match(raw):
        return raw
    return privacy_hash(raw, "device-raw")


def lookup_values(value: object, purpose: str) -> list[str]:
    """Values to match in a cooldown lookup: the hash, plus the raw legacy form.

    The raw form is included only when it is a well-formed value, so a hostile
    header can never inject commas or quotes into a PostgREST ``in`` filter.
    """
    raw = str(value or "").strip()
    if not raw:
        return []
    if purpose == "device":
        raw = normalize_device_id(raw)
        values = [privacy_hash(raw, purpose)]
        if _DEVICE_ID_OK.match(raw) and not raw.startswith(PREFIX):
            values.append(raw)
        return values
    return [privacy_hash(raw, purpose), raw]


def cooldown_row(user_id: str, device_id: str, deleted_at: str, available_at: str) -> dict:
    """The cooldown row to store: a hashed device id, and no email in any form.

    Nothing reads the email back (the cooldown is enforced per device), so it
    is not stored, not even as a hash.
    """
    return {
        "user_id": user_id,
        "device_id": privacy_hash(normalize_device_id(device_id) or "unknown", "device"),
        "email": None,
        "deleted_at": deleted_at,
        "available_at": available_at,
    }


def deletion_user_fields(user_id: str, device_id: str, deleted_at: str, available_at: str) -> dict:
    """Soft-delete update for the users row: clear every personal field.

    Only nullable personal columns are listed. NOT NULL columns (provenance,
    account_type, ...) and the markers the hard-delete guard reads
    (claim_state, provisioning_school_id) are deliberately left alone.
    ``privy_did`` (a sign-in identifier) and ``guardian_consent_at`` (a
    school-provisioned minor's consent timestamp) are personal data and are
    cleared; both are nullable. Columns
    that an older schema lacks are dropped by the caller's compatibility
    retry, so listing them here is safe. ``settings`` is reset to an empty
    object, which also withdraws analytics consent stored there.
    """
    device = normalize_device_id(device_id)
    return {
        "is_deleted": True,
        "deleted_at": deleted_at,
        "deletion_cooldown_until": available_at,
        "deleted_device_id": privacy_hash(device, "device") if device else None,
        "email": f"deleted-{user_id}@deleted.invalid",
        "password_hash": None,
        "onboarding_completed": False,
        "avatar_url": None,
        "username": "Deleted learner",
        "display_name": None,
        "first_name": None,
        "middle_name": None,
        "last_name": None,
        "date_of_birth": None,
        "phone": None,
        # Unique personal identifiers and linked accounts.
        "telegram_id": None,
        "wallet_address": None,
        "starknet_address": None,
        "starknet_wallet_id": None,
        "starknet_email": None,
        "starknet_public_key": None,
        "github_token": None,
        "github_username": None,
        "github_avatar": None,
        "privy_did": None,
        "guardian_consent_at": None,
        # Where the learner was and what they chose.
        "last_seen_device_id": None,
        "last_post_auth_path": None,
        "chosen_direction": None,
        "student_class": None,
        "stream": None,
        "settings": {},
    }


def device_cooldown_active(service, device_id: str, now_iso: str) -> bool:
    """True while this device is inside a deletion cooldown (hashed or legacy row)."""
    variants = lookup_values(device_id, "device")
    if not variants:
        return False
    try:
        rows = (
            service.table("account_deletion_cooldowns")
            .select("available_at")
            .in_("device_id", variants)
            .gt("available_at", now_iso)
            .order("available_at", desc=True)
            .limit(1).execute().data or []
        )
    except Exception as exc:
        # The cooldown table comes from the lifecycle migration. A
        # pre-migration database must still enforce the cooldown saved on the
        # deleted user row itself.
        log.warning("Signup cooldown lookup skipped", error=str(exc))
        rows = []
        try:
            rows = (
                service.table("users")
                .select("deletion_cooldown_until")
                .in_("deleted_device_id", variants)
                .gt("deletion_cooldown_until", now_iso)
                .limit(1).execute().data or []
            )
        except Exception as fallback_exc:
            # Very old schemas may have neither surface; stay non-fatal.
            log.warning("Signup user-row cooldown lookup skipped", error=str(fallback_exc))
    return bool(rows)


def purge_expired_cooldowns(service, now_iso: str) -> int:
    """Delete cooldown rows whose window has passed; returns how many. Best effort."""
    try:
        res = service.table("account_deletion_cooldowns").delete().lt("available_at", now_iso).execute()
        return len(res.data or [])
    except Exception as exc:  # noqa: BLE001
        log.warning("Cooldown purge skipped", error=type(exc).__name__)
        return 0


def _update_dropping_missing_columns(table, values: dict) -> None:
    """``table.update(values)``, retried without a column an older schema lacks."""
    pending = dict(values)
    for _ in range(len(pending) + 1):
        try:
            table(pending)
            return
        except Exception as exc:  # noqa: BLE001
            match = re.search(r"(?:'([^']+)' column|column '([^']+)')", str(exc))
            missing = next((v for v in (match.groups() if match else ()) if v), None)
            if not missing or missing not in pending:
                raise
            pending.pop(missing, None)


def scrub_deleted_sessions(service, user_id: str) -> None:
    """On soft delete: deactivate and scrub device sessions, drop the push token.

    ``active_sessions`` keeps a device id, a device name and push tokens. The
    id becomes a keyed hash (still distinct per device), the name a fixed
    label and both tokens are cleared. The ``push_tokens`` row is deleted so a
    deleted account stops receiving pushes. Best effort: a table or column an
    older schema lacks is skipped, and nothing here can fail the deletion.
    """
    revoked_at = datetime.now(timezone.utc).isoformat()
    try:
        rows = (
            service.table("active_sessions").select("id, device_id").eq("user_id", user_id).execute().data or []
        )
        for row in rows:
            _update_dropping_missing_columns(
                lambda values, rid=row["id"]: service.table("active_sessions").update(values).eq("id", rid).execute(),
                {
                    "device_id": privacy_hash(row.get("device_id") or "unknown", "device"),
                    "device_name": "Deleted device",
                    "push_token": None,
                    "fcm_token": None,
                    "is_active": False,
                    "revoked_at": revoked_at,
                },
            )
    except Exception as exc:  # noqa: BLE001
        log.warning("Session scrub skipped during deletion", error=type(exc).__name__)
    try:
        service.table("push_tokens").delete().eq("user_id", user_id).execute()
    except Exception as exc:  # noqa: BLE001
        log.warning("Push token removal skipped during deletion", error=type(exc).__name__)


_startup_problem = check_deletion_secret(
    bool(getattr(settings, "DEBUG", False)),
    str(getattr(settings, "ACCOUNT_DELETION_HASH_SECRET", "") or ""),
    str(getattr(settings, "JWT_SECRET", "") or ""),
)
if _startup_problem:
    log.error(_startup_problem)
