"""Hard-delete purge of a learner's content.

Account deletion in this app is a soft delete (anonymise, 24 h cooldown), and
saved items / notes are deliberately KEPT through it. They are removed only
when the account is hard deleted: call ``hard_delete_learner_content`` from the
step that actually removes the user row (the scheduled job, or the school's
unclaimed-student delete). Never call it from the soft-delete path.

What this removes explicitly, and why:

- ``collections``, ``saved_items``, ``user_notes``: the learner's own content.
- ``user_feedback``, ``feedback``, ``mapping_feedback``, ``app_reviews``,
  ``analytics_events``: their foreign key to ``users`` is ON DELETE SET NULL,
  so deleting the user row would leave the free text behind, only unlinked.

Two checks protect against a delete that can never succeed:

- ``guilds.owner_id`` has no ON DELETE action, so a user who owns a guild
  cannot be deleted. A guild with no other member is removed; a guild that
  still has members is reported as ``blocked`` (who should own it is a product
  decision, so nothing is transferred here).
- ``institution_verification_submissions.submitted_by`` has no ON DELETE
  action either; any such row is reported as ``blocked``.

Every other table that references ``users`` does so with ON DELETE CASCADE
(sessions, device tokens, memberships, affiliations, claim codes, referrals,
notifications, messages, learning-interest events and selections, grade sets,
and so on) and is removed with the user row. ``content_flags`` (moderation
reports, SET NULL) is kept on purpose. This is a reduction of what is kept
about a deleted learner, not a claim of complete erasure.

Best effort per table: a table missing from an older schema is reported as
``missing_table``, any other error is logged and the remaining tables are still
attempted. Rows belonging to other users are never touched.
"""
from database import db
from logger import log

_SCHEMA = "skillup_dev"
# Collections go first so membership rows never outlive the saved items they
# reference (collection_items also cascades from saved_items in the schema).
_LEARNER_CONTENT_TABLES = ("collections", "saved_items", "user_notes")
# Learner-written text or events whose link to the user is SET NULL on delete.
_UNLINKED_ON_DELETE_TABLES = (
    "user_feedback",
    "feedback",
    "mapping_feedback",
    "app_reviews",
    "analytics_events",
)
_GUARDED = ("guilds", "institution_verification_submissions")


def _is_missing_table(exc: Exception) -> bool:
    text = f"{type(exc).__name__} {exc} {getattr(exc, 'code', '')}".lower()
    return any(m in text for m in ("pgrst205", "pgrst204", "42p01", "does not exist", "could not find the table"))


def _purge_owned_guilds(svc, user_id: str) -> str:
    """Remove guilds only this user belongs to; 'blocked' if others still do."""
    guilds = svc.table("guilds").select("id").eq("owner_id", user_id).execute().data or []
    outcome = "clear"
    for guild in guilds:
        members = svc.table("guild_members").select("user_id").eq("guild_id", guild["id"]).execute().data or []
        if any(m.get("user_id") != user_id for m in members):
            return "blocked"
        svc.table("guild_members").delete().eq("guild_id", guild["id"]).execute()
        svc.table("guilds").delete().eq("id", guild["id"]).execute()
        outcome = "deleted"
    return outcome


def _verification_submissions(svc, user_id: str) -> str:
    rows = (
        svc.table("institution_verification_submissions").select("id").eq("submitted_by", user_id).limit(1).execute().data
        or []
    )
    return "blocked" if rows else "clear"


def hard_delete_learner_content(user_id: str) -> dict:
    """Delete the user's content and report per table.

    Outcomes: ``deleted``, ``clear`` (nothing to remove), ``missing_table``,
    ``error``, ``blocked`` (the user row cannot be deleted yet) or ``skipped``
    (no database client). The caller must delete the user row only when no
    outcome is ``error``, ``blocked`` or ``skipped``.
    """
    outcome: dict = {}
    try:
        svc = db.get_service_client().schema(_SCHEMA)
    except Exception as exc:  # noqa: BLE001
        log.warning("Learner content purge skipped", error=str(exc))
        return {t: "skipped" for t in _LEARNER_CONTENT_TABLES + _UNLINKED_ON_DELETE_TABLES + _GUARDED}
    for table in _LEARNER_CONTENT_TABLES + _UNLINKED_ON_DELETE_TABLES:
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
    for table, check in (("guilds", _purge_owned_guilds), ("institution_verification_submissions", _verification_submissions)):
        try:
            outcome[table] = check(svc, user_id)
        except Exception as exc:  # noqa: BLE001
            if _is_missing_table(exc):
                outcome[table] = "missing_table"
            else:
                outcome[table] = "error"
                log.warning("Learner content purge check failed", table=table, error=str(exc))
    return outcome
