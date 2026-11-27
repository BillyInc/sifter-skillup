"""Scheduled hard delete of self-deleted learner accounts.

``DELETE /api/users/me`` soft-deletes: the row is anonymised, flagged
``is_deleted`` and given ``deletion_cooldown_until`` (24 h). This job removes
such accounts for good once ``deletion_cooldown_until`` plus the retention
window has passed, after purging their content (see ``account_purge``).

Safety:
- Dry run unless ``ACCOUNT_HARD_DELETE_ENABLED`` is true; a dry run only counts.
- Only rows with ``is_deleted = true`` and an elapsed retention window. The
  window is never shorter than ``MIN_RETENTION_DAYS``: a configured 0 or a
  negative value would otherwise delete right after the 24 h cooldown.
- A school-provisioned shell that nobody has claimed (``claim_state`` =
  ``unclaimed``) is never touched here; it follows the school's own deletion
  gate. A provisioned learner who CLAIMED the account and then deleted it
  (``claim_state`` = ``claimed``, ``provisioning_school_id`` still set) is
  eligible on the same retention window as everyone else: the school can no
  longer delete a claimed account, so without this those learners, often
  minors, would never be purged. The filter runs in the database query, so
  unclaimed shells cannot fill the batch and starve every other account.
- Expired ``account_deletion_cooldowns`` rows are deleted on every run, also
  while the job is a dry run: an expired cooldown has no effect and holds only a
  hashed device id.
- At most ``ACCOUNT_HARD_DELETE_BATCH_SIZE`` accounts per run.
- One account failing never stops the run.
- The user row is deleted ONLY if every purge step succeeded. An ``error``,
  ``skipped`` or ``blocked`` outcome keeps the row for a later run.

Starvation: an account that keeps failing must not hold up newer ones.
- With the optional ``purge_attempts`` / ``last_purge_attempt_at`` columns
  (``migration_hard_delete_backoff_2026-11-21.sql``) a failure is recorded, rows
  that failed most recently go to the back of the queue, and a row that has
  failed ``MAX_PURGE_ATTEMPTS`` times is skipped and reported in the log.
- Without those columns (before the migration is applied) the batch is a
  rotating slice of a larger window chosen by the run date, so a block of
  permanently failing rows cannot occupy every run.

Logs counts only, never ids, emails or names.
"""
from datetime import datetime, timedelta, timezone

from account_purge import hard_delete_learner_content
from config import settings
from database import db
from logger import log
from privacy import purge_expired_cooldowns

_SCHEMA = "skillup_dev"
MIN_RETENTION_DAYS = 7
MAX_PURGE_ATTEMPTS = 20
_WINDOW_FACTOR = 10  # without backoff columns, rotate through up to batch x this many rows
_BLOCKING_OUTCOMES = ("error", "skipped", "blocked")


def _query(svc, cutoff_iso: str, *, db_filters: bool, backoff: bool):
    q = (
        svc.table("users")
        .select("id, provisioning_school_id, claim_state" + (", purge_attempts" if backoff else ""))
        .eq("is_deleted", True)
        .lt("deletion_cooldown_until", cutoff_iso)
    )
    if db_filters:
        q = q.or_("claim_state.is.null,claim_state.neq.unclaimed")
    if backoff:
        q = q.lt("purge_attempts", MAX_PURGE_ATTEMPTS).order("last_purge_attempt_at", nullsfirst=True)
    return q.order("deletion_cooldown_until")


def _guard(rows: list[dict]) -> list[dict]:
    # Re-check in code so a school-owned, unclaimed shell is never removed even
    # if a query filter is dropped on an older schema or a fake.
    return [r for r in rows if r.get("claim_state") != "unclaimed"]


def _eligible_batch(svc, cutoff_iso: str, limit: int, today: int) -> tuple[list[dict], bool]:
    """(rows to process, whether the backoff columns are in use)."""
    try:
        return _guard(_query(svc, cutoff_iso, db_filters=True, backoff=True).limit(limit).execute().data or []), True
    except Exception as exc:  # noqa: BLE001 - backoff columns not migrated yet, or an older client
        log.debug("Hard delete backoff columns unavailable", error=type(exc).__name__)
    window = None
    for db_filters in (True, False):
        try:
            window = _guard(
                _query(svc, cutoff_iso, db_filters=db_filters, backoff=False).limit(limit * _WINDOW_FACTOR).execute().data
                or []
            )
            break
        except Exception as exc:  # noqa: BLE001
            log.debug("Hard delete database filters unavailable", error=type(exc).__name__)
    if window is None:
        raise RuntimeError("hard delete eligibility query failed")
    if len(window) <= limit:
        return window, False
    chunks = -(-len(window) // limit)
    start = (today % chunks) * limit
    return window[start : start + limit], False


def _record_failure(svc, row: dict, now_iso: str) -> None:
    try:
        svc.table("users").update(
            {"purge_attempts": int(row.get("purge_attempts") or 0) + 1, "last_purge_attempt_at": now_iso}
        ).eq("id", row["id"]).eq("is_deleted", True).execute()
    except Exception as exc:  # noqa: BLE001 - columns not migrated yet
        log.debug("Hard delete failure not recorded", error=type(exc).__name__)


def _abandoned_count(svc) -> int:
    try:
        rows = (
            svc.table("users").select("id").eq("is_deleted", True).gte("purge_attempts", MAX_PURGE_ATTEMPTS).limit(1000).execute().data
            or []
        )
        return len(rows)
    except Exception:  # noqa: BLE001
        return 0


def hard_delete_expired_accounts(now: datetime | None = None) -> dict:
    enabled = bool(settings.ACCOUNT_HARD_DELETE_ENABLED)
    configured_days = int(settings.ACCOUNT_HARD_DELETE_RETENTION_DAYS)
    retention_days = max(MIN_RETENTION_DAYS, configured_days)
    if configured_days < MIN_RETENTION_DAYS:
        log.warning("Account hard delete retention raised to the minimum", minimum_days=MIN_RETENTION_DAYS)
    batch_size = max(1, int(settings.ACCOUNT_HARD_DELETE_BATCH_SIZE))
    now = now or datetime.now(timezone.utc)
    cutoff = (now - timedelta(days=retention_days)).isoformat()
    svc = db.get_service_client().schema(_SCHEMA)

    batch, backoff = _eligible_batch(svc, cutoff, batch_size, now.toordinal())
    result = {"dry_run": not enabled, "eligible": len(batch), "deleted": 0, "failed": 0, "blocked": {}, "abandoned": 0}
    # Independent of the flag: expired cooldowns are inert and hold a hashed device id.
    cooldowns_purged = purge_expired_cooldowns(svc, now.isoformat())
    if not enabled:
        log.info("Account hard delete dry run", cooldowns_purged=cooldowns_purged, **result)
        return result

    incomplete = 0
    for row in batch:
        try:
            outcome = hard_delete_learner_content(row["id"])
            if isinstance(outcome, dict) and any(v in _BLOCKING_OUTCOMES for v in outcome.values()):
                # Keep the user row: deleting it now would orphan whatever the
                # failed step did not remove, or the delete would be refused.
                incomplete += 1
                result["failed"] += 1
                for table, state in outcome.items():
                    if state == "blocked":
                        result["blocked"][table] = result["blocked"].get(table, 0) + 1
                _record_failure(svc, row, now.isoformat())
                continue
            svc.table("users").delete().eq("id", row["id"]).eq("is_deleted", True).execute()
            result["deleted"] += 1
        except Exception as exc:  # noqa: BLE001
            result["failed"] += 1
            _record_failure(svc, row, now.isoformat())
            log.warning("Account hard delete failed", error=type(exc).__name__)
    if backoff:
        abandoned = _abandoned_count(svc)
        result["abandoned"] = abandoned
        if abandoned:
            log.warning("Account hard delete has accounts that exhausted their attempts", count=abandoned)
    log.info("Account hard delete run", purge_incomplete=incomplete, cooldowns_purged=cooldowns_purged, **result)
    return result
