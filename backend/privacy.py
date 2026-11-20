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
``JWT_SECRET`` so existing deployments keep working, and logs a warning.
Hash values are never logged.
"""
import hashlib
import hmac

from config import settings
from logger import log

PREFIX = "h1:"
_DEFAULT_SECRET = "change-me-in-production"
_warned = False


def _secret() -> bytes:
    global _warned
    configured = (getattr(settings, "ACCOUNT_DELETION_HASH_SECRET", "") or "").strip()
    secret = configured or str(getattr(settings, "JWT_SECRET", "") or "")
    if (not configured or secret == _DEFAULT_SECRET) and not _warned:
        _warned = True
        log.warning("ACCOUNT_DELETION_HASH_SECRET is not set; deletion hashes use a fallback secret")
    return secret.encode("utf-8")


def privacy_hash(value: object, purpose: str) -> str:
    """Keyed, purpose-separated hash of ``value`` (emails are case-folded)."""
    text = str(value or "").strip()
    if purpose == "email":
        text = text.lower()
    mac = hmac.new(_secret(), f"{purpose}\x00{text}".encode("utf-8"), hashlib.sha256)
    return PREFIX + mac.hexdigest()


def lookup_values(value: object, purpose: str) -> list[str]:
    """Values to match in a cooldown lookup: the hash, plus the raw legacy form."""
    raw = str(value or "").strip()
    if not raw:
        return []
    return [privacy_hash(raw, purpose), raw]


def cooldown_row(user_id: str, device_id: str, email: object, deleted_at: str, available_at: str) -> dict:
    """The cooldown row to store: hashes only, no raw email or device id."""
    return {
        "user_id": user_id,
        "device_id": privacy_hash(device_id or "unknown", "device"),
        "email": privacy_hash(email, "email") if email else None,
        "deleted_at": deleted_at,
        "available_at": available_at,
    }


def deletion_user_fields(user_id: str, device_id: str, deleted_at: str, available_at: str) -> dict:
    """Soft-delete update for the users row: clear every personal field.

    Optional columns that an older schema lacks are dropped by the caller's
    compatibility retry, so listing them here is safe.
    """
    return {
        "is_deleted": True,
        "deleted_at": deleted_at,
        "deletion_cooldown_until": available_at,
        "deleted_device_id": privacy_hash(device_id, "device") if device_id else None,
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
