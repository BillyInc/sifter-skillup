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

Three FKs have no cascade (or, on an older database, no SET NULL), so each is
resolved here BEFORE the user row is deleted. The order is FK-safe and every
step is idempotent, so a retry after a partial failure just continues:

- ``notifications.actor_id`` (created without ON DELETE on some databases;
  ``migration_hard_delete_fk_2026-11-27.sql`` makes it SET NULL): the
  notifications this user triggered in other people's feeds are deleted, since
  they carry the user's action and snippet. Works the same before and after
  that migration.
- ``guilds.owner_id`` (no ON DELETE action): a guild with no other member is
  removed (the existing rule); a guild with other members is transferred to its
  longest-standing remaining member (``joined_at``, then user id) so it stays
  usable and the delete is not blocked.
- ``institution_verification_submissions.submitted_by`` (ON DELETE RESTRICT):
  the proof file in the private ``verification-proofs`` bucket is removed
  first, then the submission rows. If the file cannot be removed the rows are
  kept (``error``) so the object path is not lost and a later run retries.

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
_VERIFICATION_BUCKET = "verification-proofs"
_GUARDED = ("notifications", "guilds", "institution_verification_submissions")


def _is_missing_table(exc: Exception, table: str) -> bool:
    """True only when the error says THIS table is absent.

    PGRST204 (a missing column) and "does not exist" are ambiguous on their
    own, so they count only when the message names the table being purged;
    anything else is a real error and keeps the user row.
    """
    text = f"{type(exc).__name__} {exc} {getattr(exc, 'code', '')}".lower()
    names_table = table.lower() in text
    if "pgrst205" in text or "could not find the table" in text:
        return names_table
    return names_table and any(m in text for m in ("pgrst204", "42p01", "does not exist"))


def _purge_actor_notifications(svc, user_id: str) -> str:
    """Delete notifications this user triggered for others (``actor_id``)."""
    try:
        rows = svc.table("notifications").select("id").eq("actor_id", user_id).limit(1).execute().data or []
        if not rows:
            return "clear"
        svc.table("notifications").delete().eq("actor_id", user_id).execute()
        return "deleted"
    except Exception as exc:  # noqa: BLE001
        text = f"{exc} {getattr(exc, 'code', '')}".lower()
        # A schema without the actor_id column has nothing referencing the user.
        if "actor_id" in text and any(m in text for m in ("pgrst204", "42703", "does not exist")):
            return "clear"
        raise


def _purge_owned_guilds(svc, user_id: str) -> str:
    """Delete guilds only this user belongs to; hand the others to a member."""
    guilds = svc.table("guilds").select("id").eq("owner_id", user_id).execute().data or []
    outcome = "clear"
    for guild in guilds:
        members = svc.table("guild_members").select("user_id, joined_at").eq("guild_id", guild["id"]).execute().data or []
        others = [m for m in members if m.get("user_id") and m.get("user_id") != user_id]
        if not others:
            svc.table("guild_members").delete().eq("guild_id", guild["id"]).execute()
            svc.table("guilds").delete().eq("id", guild["id"]).execute()
            outcome = "deleted"
            continue
        heir = min(others, key=lambda m: (str(m.get("joined_at") or "9999"), str(m["user_id"])))
        svc.table("guilds").update({"owner_id": heir["user_id"]}).eq("id", guild["id"]).eq("owner_id", user_id).execute()
        if outcome == "clear":
            outcome = "transferred"
    return outcome


def _purge_verification_submissions(svc, user_id: str) -> str:
    """Remove this user's verification proof files, then their submission rows."""
    rows = (
        svc.table("institution_verification_submissions").select("id, storage_path").eq("submitted_by", user_id).execute().data
        or []
    )
    if not rows:
        return "clear"
    paths = [r["storage_path"] for r in rows if r.get("storage_path")]
    if paths:
        # Raises on a storage failure, which keeps the rows (and the paths) for the next run.
        db.get_service_client().storage.from_(_VERIFICATION_BUCKET).remove(paths)
    svc.table("institution_verification_submissions").delete().eq("submitted_by", user_id).execute()
    return "deleted"


def hard_delete_learner_content(user_id: str) -> dict:
    """Delete the user's content and report per table.

    Outcomes: ``deleted``, ``clear`` (nothing to remove), ``missing_table``,
    ``error``, ``transferred`` (guild handed to another member), ``blocked``
    (the user row cannot be deleted yet) or ``skipped``
    (no database client). The caller must delete the user row only when no
    outcome is ``error``, ``blocked`` or ``skipped``.
    """
    outcome: dict = {}
    try:
        svc = db.get_service_client().schema(_SCHEMA)
    except Exception as exc:  # noqa: BLE001
        log.warning("Learner content purge skipped", error=type(exc).__name__)
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
            if _is_missing_table(exc, table):
                outcome[table] = "missing_table"
            else:
                outcome[table] = "error"
                log.warning("Learner content purge failed", table=table, error=type(exc).__name__)
    for table, check in (
        ("notifications", _purge_actor_notifications),
        ("guilds", _purge_owned_guilds),
        ("institution_verification_submissions", _purge_verification_submissions),
    ):
        try:
            outcome[table] = check(svc, user_id)
        except Exception as exc:  # noqa: BLE001
            if _is_missing_table(exc, table):
                outcome[table] = "missing_table"
            else:
                outcome[table] = "error"
                log.warning("Learner content purge check failed", table=table, error=type(exc).__name__)
    return outcome
