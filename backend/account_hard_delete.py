"""Scheduled hard delete of self-deleted learner accounts.

``DELETE /api/users/me`` soft-deletes: the row is anonymised, flagged
``is_deleted`` and given ``deletion_cooldown_until`` (24 h). This job removes
such accounts for good once ``deletion_cooldown_until`` plus the retention
window has passed, after purging their saved items, notes and collections.

Safety:
- Dry run unless ``ACCOUNT_HARD_DELETE_ENABLED`` is true; a dry run only counts.
- Only rows with ``is_deleted = true`` and an elapsed retention window.
- Rows that belong to a school's provisioning flow (``provisioning_school_id``
  or ``claim_state`` set) are never touched; those follow the school's own
  deletion gate.
- At most ``ACCOUNT_HARD_DELETE_BATCH_SIZE`` accounts per run, oldest first.
- One account failing never stops the run; the next run retries it.
- Logs counts only, never ids, emails or names.
"""
from datetime import datetime, timedelta, timezone

from account_purge import hard_delete_learner_content
from config import settings
from database import db
from logger import log

_SCHEMA = "skillup_dev"


def _eligible_batch(svc, cutoff_iso: str, limit: int) -> list[dict]:
    rows = (
        svc.table("users")
        .select("id, provisioning_school_id, claim_state")
        .eq("is_deleted", True)
        .lt("deletion_cooldown_until", cutoff_iso)
        .order("deletion_cooldown_until")
        .limit(limit)
        .execute()
        .data
        or []
    )
    # Re-check in code so a provisioned/claimed record is never removed even if
    # the query filter is changed or the columns are missing from a fake.
    return [r for r in rows if not r.get("provisioning_school_id") and not r.get("claim_state")]


def hard_delete_expired_accounts(now: datetime | None = None) -> dict:
    enabled = bool(settings.ACCOUNT_HARD_DELETE_ENABLED)
    retention_days = max(0, int(settings.ACCOUNT_HARD_DELETE_RETENTION_DAYS))
    batch_size = max(1, int(settings.ACCOUNT_HARD_DELETE_BATCH_SIZE))
    now = now or datetime.now(timezone.utc)
    cutoff = (now - timedelta(days=retention_days)).isoformat()
    svc = db.get_service_client().schema(_SCHEMA)

    batch = _eligible_batch(svc, cutoff, batch_size)
    result = {"dry_run": not enabled, "eligible": len(batch), "deleted": 0, "failed": 0}
    if not enabled:
        log.info("Account hard delete dry run", **result)
        return result

    for row in batch:
        try:
            hard_delete_learner_content(row["id"])
            svc.table("users").delete().eq("id", row["id"]).eq("is_deleted", True).execute()
            result["deleted"] += 1
        except Exception as exc:  # noqa: BLE001
            result["failed"] += 1
            log.warning("Account hard delete failed", error=type(exc).__name__)
    log.info("Account hard delete run", **result)
    return result
