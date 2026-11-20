"""Hard-delete purge of a learner's saved items and notes.

Account deletion in this app is a soft delete (anonymise, 24 h cooldown), and
saved items / notes are deliberately KEPT through it. They are removed only
when the account is hard deleted: call ``hard_delete_learner_content`` from the
step that actually removes the user row (or from a future job that hard deletes
soft-deleted accounts). Never call it from the soft-delete path.

Best effort per table: a table missing from an older schema is skipped, any
other error is logged and the remaining tables are still attempted. Rows
belonging to other users are never touched.
"""
from database import db
from logger import log

_SCHEMA = "skillup_dev"
# Collections go first so membership rows never outlive the saved items they
# reference (collection_items also cascades from saved_items in the schema).
_LEARNER_CONTENT_TABLES = ("collections", "saved_items", "user_notes")


def _is_missing_table(exc: Exception) -> bool:
    text = f"{type(exc).__name__} {exc} {getattr(exc, 'code', '')}".lower()
    return any(m in text for m in ("pgrst205", "pgrst204", "42p01", "does not exist", "could not find the table"))


def hard_delete_learner_content(user_id: str) -> dict:
    """Delete the user's collections, saved items and notes. Returns per-table outcome."""
    outcome: dict = {}
    try:
        svc = db.get_service_client().schema(_SCHEMA)
    except Exception as exc:  # noqa: BLE001
        log.warning("Learner content purge skipped", error=str(exc))
        return {t: "skipped" for t in _LEARNER_CONTENT_TABLES}
    for table in _LEARNER_CONTENT_TABLES:
        try:
            if table == "collections":
                rows = svc.table("collections").select("id").eq("user_id", user_id).execute().data or []
                ids = [r["id"] for r in rows]
                if ids:
                    svc.table("collection_items").delete().in_("collection_id", ids).execute()
            svc.table(table).delete().eq("user_id", user_id).execute()
            outcome[table] = "deleted"
        except Exception as exc:  # noqa: BLE001
            if _is_missing_table(exc):
                outcome[table] = "missing_table"
            else:
                outcome[table] = "error"
                log.warning("Learner content purge failed", table=table, error=str(exc))
    return outcome
