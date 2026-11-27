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
- ``guilds.owner_id`` (no ON DELETE action): a guild with no other real
  member is removed; one with other members is transferred to an eligible heir
  so it stays usable and the delete is not blocked. The app's real membership
  is ``users.guild_id`` (checked against code-side guilds); the ``guilds`` /
  ``guild_members`` tables are not maintained by the app, so a guild is
  deleted only when NEITHER source shows another live member. An heir is a
  member who is not deleted and not an unclaimed school shell; role ``admin``
  is preferred, then the longest-standing member (``joined_at``, then id). The
  guild is reported ``transferred`` only if the update matched a row.
- ``institution_verification_submissions.submitted_by`` (ON DELETE RESTRICT):
  the proof file in the private ``verification-proofs`` bucket is removed
  first, then the submission rows. A path is removed only if it has the
  server-built shape ``<school_id>/<user_id>/...``; any other path is skipped
  and reported as ``error`` (rows kept). If a file cannot be removed the rows
  are kept (``error``) so the object path is not lost and a later run retries.
  Approved and pending submissions are deleted together with the submitter.
- ``student_provision_drafts`` (``generated_user_id`` SET NULL) and
  ``student_merge_candidates`` (``provisioned_student_id`` /
  ``real_student_id`` SET NULL) are school-side copies of a provisioned
  learner's identity (name, guardian, class, snapshots). Claimed provisioned
  learners, often minors, can reach this purge, so those rows are deleted too.

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
_GUARDED = (
    "notifications",
    "guilds",
    "institution_verification_submissions",
    "student_provision_drafts",
    "student_merge_candidates",
)
_MEMBER_PAGE = 1000  # PostgREST caps a select at 1000 rows; the limit is explicit
_IN_CHUNK = 100  # keeps ``in.(...)`` URLs short


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


def _missing_column(exc: Exception, column: str) -> bool:
    text = f"{exc} {getattr(exc, 'code', '')}".lower()
    return column in text and any(m in text for m in ("pgrst204", "42703", "does not exist"))


def _eligible_ids(svc, ids: list[str]) -> set[str]:
    """Ids that may inherit a guild: a live user who is not an unclaimed shell."""
    ok: set[str] = set()
    for i in range(0, len(ids), _IN_CHUNK):
        rows = (
            svc.table("users").select("id, is_deleted, claim_state").in_("id", ids[i : i + _IN_CHUNK]).execute().data
            or []
        )
        ok |= {r["id"] for r in rows if not r.get("is_deleted") and r.get("claim_state") != "unclaimed"}
    return ok


def _live_guild_users(svc, guild_id: str, user_id: str) -> list[str]:
    """Live users whose ``users.guild_id`` is this guild (the app's real membership)."""
    try:
        rows = (
            svc.table("users")
            .select("id, is_deleted, claim_state")
            .eq("guild_id", guild_id)
            .neq("id", user_id)
            .limit(_MEMBER_PAGE)
            .execute()
            .data
            or []
        )
    except Exception as exc:  # noqa: BLE001
        if _missing_column(exc, "guild_id"):
            return []
        raise
    return [r["id"] for r in rows if not r.get("is_deleted") and r.get("claim_state") != "unclaimed"]


def _purge_owned_guilds(svc, user_id: str) -> str:
    """Delete guilds with no other live member; hand the others to an heir."""
    guilds = svc.table("guilds").select("id").eq("owner_id", user_id).execute().data or []
    outcome = "clear"
    for guild in guilds:
        gid = guild["id"]
        members = (
            svc.table("guild_members")
            .select("user_id, role, joined_at")
            .eq("guild_id", gid)
            .order("joined_at")
            .limit(_MEMBER_PAGE)
            .execute()
            .data
            or []
        )
        others = [m for m in members if m.get("user_id") and m["user_id"] != user_id]
        live = _eligible_ids(svc, [m["user_id"] for m in others])
        candidates = [m for m in others if m["user_id"] in live]
        # Live members recorded only on users.guild_id also keep the guild alive.
        extra = [u for u in _live_guild_users(svc, gid, user_id) if u not in live]
        candidates += [{"user_id": u, "role": None, "joined_at": None} for u in extra]
        if not candidates:
            svc.table("guild_members").delete().eq("guild_id", gid).execute()
            svc.table("guilds").delete().eq("id", gid).execute()
            outcome = "deleted"
            continue
        heir = min(
            candidates,
            key=lambda m: (
                0 if m.get("role") == "admin" else 1,
                str(m.get("joined_at") or "9999"),
                str(m["user_id"]),
            ),
        )
        moved = svc.table("guilds").update({"owner_id": heir["user_id"]}).eq("id", gid).eq("owner_id", user_id).execute().data
        if moved and outcome == "clear":
            outcome = "transferred"
    return outcome


def _purge_verification_submissions(svc, user_id: str) -> str:
    """Remove this user's verification proof files, then their submission rows.

    Approved and pending submissions are deleted with the submitter (the
    school's own record of the decision is not kept per learner).
    """
    rows = (
        svc.table("institution_verification_submissions")
        .select("id, school_id, storage_path")
        .eq("submitted_by", user_id)
        .execute()
        .data
        or []
    )
    if not rows:
        return "clear"
    paths, bad = [], False
    for r in rows:
        path = r.get("storage_path")
        if not path:
            continue
        # Defence in depth: the server builds '<school_id>/<user_id>/<file>'. Never
        # remove a path outside that shape, whatever the row says.
        if r.get("school_id") and path.startswith(f"{r['school_id']}/{user_id}/"):
            paths.append(path)
        else:
            bad = True
            log.warning("Verification proof path skipped: unexpected shape")
    if paths:
        # Raises on a storage failure, which keeps the rows (and the paths) for the next run.
        db.get_service_client().storage.from_(_VERIFICATION_BUCKET).remove(paths)
    if bad:
        return "error"  # rows kept so the odd path is reviewed, never silently dropped
    svc.table("institution_verification_submissions").delete().eq("submitted_by", user_id).execute()
    return "deleted"


def _delete_rows_referencing(svc, table: str, columns: tuple[str, ...], user_id: str) -> str:
    """Delete rows of ``table`` whose user-reference ``columns`` equal the user.

    A missing column means nothing there references the user; a missing table
    propagates so the caller reports ``missing_table``.
    """
    removed = False
    for col in columns:
        try:
            if svc.table(table).select("id").eq(col, user_id).limit(1).execute().data:
                svc.table(table).delete().eq(col, user_id).execute()
                removed = True
        except Exception as exc:  # noqa: BLE001
            if _missing_column(exc, col):
                continue
            raise
    return "deleted" if removed else "clear"


def _purge_provision_drafts(svc, user_id: str) -> str:
    """Drafts keep full_name, guardian_name, class and stream of a generated learner."""
    return _delete_rows_referencing(svc, "student_provision_drafts", ("generated_user_id",), user_id)


def _purge_merge_candidates(svc, user_id: str) -> str:
    """Merge candidates keep identity snapshots and evidence for either side."""
    return _delete_rows_referencing(
        svc, "student_merge_candidates", ("provisioned_student_id", "real_student_id"), user_id
    )


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
        ("student_provision_drafts", _purge_provision_drafts),
        ("student_merge_candidates", _purge_merge_candidates),
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
