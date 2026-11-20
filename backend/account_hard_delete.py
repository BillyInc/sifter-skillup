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
- The user row is deleted ONLY if every content purge step succeeded; a failed or
  skipped step leaves the account for the next run (retries are bounded by the
  daily schedule and the batch cap) instead of orphaning its saved items.
- Expired deletion-cooldown rows (which hold hashed email and device id) are
  removed each run once enabled.
- Logs counts only, never ids, emails or names.
"""
from datetime import datetime, timedelta, timezone

from account_purge import hard_delete_learner_content
from config import settings
from database import db
from logger import log
from privacy import purge_expired_cooldowns

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

    incomplete = 0
    for row in batch:
        try:
            outcome = hard_delete_learner_content(row["id"])
            if isinstance(outcome, dict) and any(v in ("error", "skipped") for v in outcome.values()):
                # Keep the user row: deleting it now would orphan whatever the
                # failed step did not remove. The next run tries again.
                incomplete += 1
                result["failed"] += 1
                continue
            svc.table("users").delete().eq("id", row["id"]).eq("is_deleted", True).execute()
            result["deleted"] += 1
        except Exception as exc:  # noqa: BLE001
            result["failed"] += 1
            log.warning("Account hard delete failed", error=type(exc).__name__)
    cooldowns_purged = purge_expired_cooldowns(svc, now.isoformat())
    log.info("Account hard delete run", purge_incomplete=incomplete, cooldowns_purged=cooldowns_purged, **result)
    return result
