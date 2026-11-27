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
  is ``users.guild_id``; ``guild_members`` is not maintained by the app. An
  heir must have ``users.guild_id`` equal to the guild, be not deleted and not
  an unclaimed school shell; a NULL ``guild_id`` or a stale ``guild_members``
  row never qualifies. ``guild_members`` only breaks ties (role ``admin``,
  then the longest-standing ``joined_at``, then id). The
  guild is reported ``transferred`` only if the update matched a row.
- ``institution_verification_submissions.submitted_by`` (ON DELETE RESTRICT):
  the proof file in the private ``verification-proofs`` bucket is removed
  first, then the submission rows. A path is removed only if it has the
  server-built shape ``<school_id>/<user_id>/...``; any other path is skipped
  and reported as ``error`` (rows kept). If a file cannot be removed the rows
  are kept (``error``) so the object path is not lost and a later run retries.
  Approved and pending submissions are deleted together with the submitter:
  the evidence is intentionally dropped with the submitter, and the school's
  ``verification_status`` is NOT changed by this purge (a product decision for
  the maintainer; see the open question on the PR).
- ``student_provision_drafts`` (``generated_user_id`` SET NULL) and
  ``student_merge_candidates`` (``provisioned_student_id`` /
  ``real_student_id`` SET NULL) are school-side copies of a provisioned
  learner's identity (name, guardian, class, snapshots). Claimed provisioned
  learners, often minors, can reach this purge. Draft rows are scrubbed, not
  deleted (generate reads ``status``); pending merge candidates are deleted,
  confirmed/dismissed ones keep the admins' decision with the personal
  snapshots blanked. See each function for the reasoning.

Profile photos are removed from the private ``avatars`` bucket here as well
(soft delete removes them best effort and swallows failures, so this step
re-lists ``<user_id>/`` and deletes whatever is left). A storage that is not
configured, or a bucket that does not exist, counts as clear; any other
failure is ``error`` and keeps the user row for the next run. Verification
proofs are likewise removed from the ``<school_id>/<user_id>/`` prefixes of
every school the user submitted to, belongs to or is affiliated with, so an
object whose row was never written (the upload succeeded, the insert and the
cleanup both failed) is not left behind.

Known remaining gaps (text that stays, unlinked, after the user row is gone;
NOT a claim of complete erasure):

- ``projects.creator_id``: the project title and description.
- ``student_consent_requests.requested_by``: the request message.
- ``guild_challenges.initiator_id``: the challenge text.
- ``content_flags``: moderation reports, kept on purpose.

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
    "avatars",
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


_MAX_GUILD_PAGES = 100  # 100 000 members; beyond this the guild is kept and retried, never deleted


def _live_guild_users(svc, guild_id: str, user_id: str) -> list[str] | None:
    """Every live user whose ``users.guild_id`` is this guild (the app's real membership).

    Pages through ``users`` (PostgREST caps one response at 1000 rows) and
    collects the eligible ids from ALL pages before returning, so the caller
    ranks the complete candidate set: an eligible admin on a later page can
    still inherit. An empty list means no eligible member exists at all.
    ``None`` means the schema has no ``users.guild_id`` column. If the page cap
    is reached before the last page the set is incomplete, so this raises and
    the guild (and the user row) are kept for the next run.
    """
    live: list[str] = []
    for page in range(_MAX_GUILD_PAGES):
        lo = page * _MEMBER_PAGE
        try:
            rows = (
                svc.table("users")
                .select("id, is_deleted, claim_state")
                .eq("guild_id", guild_id)
                .neq("id", user_id)
                .order("id")
                .range(lo, lo + _MEMBER_PAGE - 1)
                .execute()
                .data
                or []
            )
        except Exception as exc:  # noqa: BLE001
            if _missing_column(exc, "guild_id"):
                return None
            raise
        live += [r["id"] for r in rows if not r.get("is_deleted") and r.get("claim_state") != "unclaimed"]
        if len(rows) < _MEMBER_PAGE:
            return live
    # The cap was reached with more rows possibly left: do not rank a partial set.
    raise RuntimeError("guild membership scan limit reached")


def _guild_member_rows(svc, guild_id: str, user_ids: list[str] | None = None) -> list[dict]:
    """Role and join date from ``guild_members``; an unmaintained, tiebreak-only source.

    A missing ``guild_members`` table is an empty list. (``_is_missing_table``
    cannot be reused by the caller: it looks for the table being purged,
    ``guilds``, in the message and ``guild_members`` does not match it.)
    """
    rows: list[dict] = []
    chunks = [None] if user_ids is None else [user_ids[i : i + _IN_CHUNK] for i in range(0, len(user_ids), _IN_CHUNK)]
    for chunk in chunks:
        try:
            q = svc.table("guild_members").select("user_id, role, joined_at").eq("guild_id", guild_id)
            if chunk is not None:
                q = q.in_("user_id", chunk)
            rows += q.order("joined_at").limit(_MEMBER_PAGE).execute().data or []
        except Exception as exc:  # noqa: BLE001
            if _is_missing_table(exc, "guild_members"):
                return []
            raise
    return rows


def _delete_guild_member_rows(svc, guild_id: str) -> None:
    try:
        svc.table("guild_members").delete().eq("guild_id", guild_id).execute()
    except Exception as exc:  # noqa: BLE001
        if not _is_missing_table(exc, "guild_members"):
            raise


def _purge_owned_guilds(svc, user_id: str) -> str:
    """Delete guilds with no other live member; hand the others to an heir.

    ``users.guild_id`` is the real membership, so an heir must be a live,
    claimed user whose ``users.guild_id`` equals this guild. A user with a
    NULL ``guild_id`` is in no guild and is not eligible either; a stale
    ``guild_members`` row (the user has since moved or left) never qualifies.
    ``guild_members`` only breaks ties between real members (admin role first,
    then the earliest ``joined_at``, then id). If a database has no
    ``users.guild_id`` column at all, ``guild_members`` is the only source and
    its rows are checked for liveness only.

    The outcome is ``deleted``, ``transferred``, ``deleted_and_transferred``
    when the user owned both kinds, or ``clear``. ``users.guild_role`` is not
    touched: the app only ever writes ``member`` (and NULL on leaving), it has
    no owner/admin value, and ``guilds.owner_id`` is what records ownership.
    """
    guilds: list[dict] = []
    for page in range(_MAX_GUILD_PAGES):
        lo = page * _MEMBER_PAGE
        chunk = (
            svc.table("guilds").select("id").eq("owner_id", user_id).order("id").range(lo, lo + _MEMBER_PAGE - 1).execute().data
            or []
        )
        guilds += chunk
        if len(chunk) < _MEMBER_PAGE:
            break
    else:
        raise RuntimeError("owned guild scan limit reached")  # not all read: keep the user row
    deleted = transferred = False
    for guild in guilds:
        gid = guild["id"]
        real = _live_guild_users(svc, gid, user_id)
        if real is None:  # no users.guild_id column: the legacy table is all there is
            rows = [m for m in _guild_member_rows(svc, gid) if m.get("user_id") and m["user_id"] != user_id]
            live = _eligible_ids(svc, [m["user_id"] for m in rows])
            real = [m["user_id"] for m in rows if m["user_id"] in live]
        if not real:
            _delete_guild_member_rows(svc, gid)
            svc.table("guilds").delete().eq("id", gid).execute()
            deleted = True
            continue
        meta = {m["user_id"]: m for m in _guild_member_rows(svc, gid, real) if m.get("user_id")}

        def rank(uid: str, meta=meta):
            m = meta.get(uid) or {}
            return (0 if m.get("role") == "admin" else 1, str(m.get("joined_at") or "9999"), str(uid))

        heir = min(real, key=rank)
        moved = svc.table("guilds").update({"owner_id": heir}).eq("id", gid).eq("owner_id", user_id).execute().data
        if moved:
            transferred = True
    if deleted and transferred:
        return "deleted_and_transferred"
    return "transferred" if transferred else "deleted" if deleted else "clear"


def _paged(query_factory, label: str) -> list[dict]:
    """Read every page of a select; raise if the page cap leaves rows unread."""
    out: list[dict] = []
    for page in range(_MAX_GUILD_PAGES):
        lo = page * _MEMBER_PAGE
        chunk = query_factory().order("id").range(lo, lo + _MEMBER_PAGE - 1).execute().data or []
        out += chunk
        if len(chunk) < _MEMBER_PAGE:
            return out
    raise RuntimeError(f"{label} scan limit reached")


# Roles that can POST /verification-proof while their seat is active. Mirrors
# ``routes.institutions_routes._ADMIN_ROLES`` (a test keeps the two in step); a
# pending (``invited``) seat can also submit, whatever its role.
_PROOF_SUBMIT_ROLES = frozenset({"owner", "institution_admin", "admin"})
_PENDING_SEAT = "invited"


def _valid_id(value) -> bool:
    """A non-empty id that is safe to use as one storage path segment."""
    return (
        isinstance(value, str)
        and bool(value.strip())
        and value == value.strip()
        and "/" not in value
        and "\\" not in value
        and ".." not in value
    )


def _proof_school_ids_for_user(svc, user_id: str) -> set[str]:
    """Schools where this user could have uploaded a verification proof.

    ``submit_verification_proof`` accepts a pending claimant or an admin-role
    member, so only ``institution_members`` rows with such a role (any seat
    status: a revoked admin may have uploaded earlier) or a pending seat count.
    ``student_affiliations`` never can upload and is not read, so a learner
    whose school merely affiliated them has no storage dependency.
    """
    table = "institution_members"
    cols = "id, school_id, role, seat_status"
    try:
        rows = _paged(lambda: svc.table(table).select(cols).eq("user_id", user_id), table)
    except Exception as exc:  # noqa: BLE001
        if _is_missing_table(exc, table):
            return set()
        if not _missing_column(exc, "seat_status"):
            raise
        cols = "id, school_id, role"  # a schema without seat_status
        rows = _paged(lambda: svc.table(table).select(cols).eq("user_id", user_id), table)
    return {
        r["school_id"]
        for r in rows
        if r.get("school_id") and (r.get("role") in _PROOF_SUBMIT_ROLES or r.get("seat_status") == _PENDING_SEAT)
    }


def _safe_object_path(path: str) -> bool:
    """A storage path with no traversal, empty segment or backslash."""
    return ".." not in path and "//" not in path and "\\" not in path


def _is_bucket_missing(exc: Exception) -> bool:
    """The bucket itself is absent, so it holds nothing (variants across versions)."""
    text = f"{type(exc).__name__} {exc} {getattr(exc, 'status', '')} {getattr(exc, 'code', '')}".lower()
    return any(
        m in text
        for m in ("bucket not found", "bucket does not exist", "no such bucket", "not found", "not_found", "does not exist", "404")
    )


_MAX_PREFIX_DEPTH = 3  # folders below the ``<school>/<user>`` prefix that are followed


def _is_folder(entry: dict) -> bool:
    """Supabase ``list()`` returns sub-folders as entries whose ``id`` is null."""
    return "id" in entry and entry["id"] is None


def _list_prefix(storage, prefix: str, _depth: int = 0) -> list[str]:
    """Object paths under ``prefix`` (no trailing slash), all pages.

    Folder entries are followed to ``_MAX_PREFIX_DEPTH`` levels and never
    returned as objects (removing a folder key is a no-op). Deeper nesting
    raises, so the caller fails closed instead of leaving files behind.
    """
    if not prefix or not all(_valid_id(seg) for seg in prefix.split("/")):
        raise ValueError("invalid storage prefix")
    found: list[str] = []
    for page in range(_MAX_GUILD_PAGES):
        try:
            items = storage.list(prefix, {"limit": _MEMBER_PAGE, "offset": page * _MEMBER_PAGE}) or []
        except Exception as exc:  # noqa: BLE001
            if _is_bucket_missing(exc):
                return found
            raise
        for i in items:
            name = i.get("name")
            if not name:
                continue
            if _is_folder(i):
                if _depth >= _MAX_PREFIX_DEPTH:
                    raise RuntimeError("proof prefix nesting limit reached")
                found += _list_prefix(storage, f"{prefix}/{name}", _depth + 1)
            else:
                found.append(f"{prefix}/{name}")
        if len(items) < _MEMBER_PAGE:
            return found
    raise RuntimeError("proof prefix scan limit reached")


def _purge_verification_submissions(svc, user_id: str) -> str:
    """Remove this user's verification proof files, then their submission rows.

    Approved and pending submissions are deleted with the submitter. This is
    intentional: the evidence is dropped together with the person who submitted
    it, and the school's ``verification_status`` is left unchanged. Whether an
    approved school should keep its evidence (or be re-verified) is a product
    decision awaiting the maintainer, not something this purge decides.

    Besides the paths recorded on rows, the ``<school_id>/<user_id>/`` prefix
    of every school the user submitted to, or holds a seat that can submit
    proof at (see ``_proof_school_ids_for_user``), is listed and emptied: an
    upload whose insert failed, and whose own cleanup also failed, leaves an
    object with no row. A listing failure for such a school blocks (the row is
    kept); schools where the user could not have uploaded are never listed.
    """
    if not _valid_id(user_id):
        raise ValueError("invalid user id")
    table = "institution_verification_submissions"
    rows = _paged(lambda: svc.table(table).select("id, school_id, storage_path").eq("submitted_by", user_id), table)
    school_ids = _proof_school_ids_for_user(svc, user_id) | {r["school_id"] for r in rows if r.get("school_id")}
    if not rows and not school_ids:
        return "clear"
    storage = db.get_service_client().storage.from_(_VERIFICATION_BUCKET)
    removable: list[str] = []  # row ids whose file is gone (or that never had one)
    paths: dict[str, list[str]] = {}  # conforming storage path -> row ids (empty: orphan object)
    failed = False
    for r in rows:
        path = r.get("storage_path")
        if not path:
            removable.append(r["id"])
        # Defence in depth: the server builds '<school_id>/<user_id>/<file>'. Never
        # remove a path outside that shape, whatever the row says.
        elif r.get("school_id") and path.startswith(f"{r['school_id']}/{user_id}/") and _safe_object_path(path):
            paths.setdefault(path, []).append(r["id"])
        else:
            failed = True  # row kept so the odd path is reviewed, never silently dropped
            log.warning("Verification proof path skipped: unexpected shape")
    for sid in sorted(school_ids):
        if not _valid_id(sid):
            log.warning("Verification proof listing skipped: unexpected school id shape")
            continue
        prefix = f"{sid}/{user_id}"
        try:
            listed = _list_prefix(storage, prefix)
        except Exception as exc:  # noqa: BLE001
            log.warning("Verification proof listing failed", error=type(exc).__name__)
            failed = True
            continue
        for path in listed:
            if _safe_object_path(path):
                paths.setdefault(path, [])
            else:
                failed = True
                log.warning("Verification proof path skipped: unexpected shape")
    items = list(paths)
    for i in range(0, len(items), _IN_CHUNK):
        batch = items[i : i + _IN_CHUNK]
        try:
            storage.remove(batch)
            done = batch
        except Exception as exc:  # noqa: BLE001
            # Isolate the failing file so only its row is kept for the next run.
            log.warning("Verification proof removal failed", error=type(exc).__name__)
            done = []
            for path in batch:
                try:
                    storage.remove([path])
                    done.append(path)
                except Exception:  # noqa: BLE001
                    failed = True
        for path in done:
            removable += paths[path]
    # Only rows whose file was removed are deleted; the rest stay for a retry.
    for i in range(0, len(removable), _IN_CHUNK):
        svc.table(table).delete().in_("id", removable[i : i + _IN_CHUNK]).execute()
    if failed:
        return "error"
    return "deleted" if (rows or items) else "clear"


def _purge_avatars(svc, user_id: str) -> str:
    """Remove any profile photo still in the private ``avatars`` bucket.

    Soft delete removes ``<user_id>/*.webp`` best effort and swallows failures,
    so a failed removal would otherwise leave the photo forever. ``get_storage``
    never raises (it builds a lazy adapter), so a misconfigured client surfaces
    from ``list_keys`` and is an ``error``; only an absent bucket is ``clear``.
    A list or remove failure raises (-> ``error``), keeping the user row.
    Folder entries are skipped by ``list_keys`` (a key that cannot be removed).
    If a re-listing returns exactly the keys just deleted, the delete is not
    taking effect: the key names are logged and the outcome is ``error``.
    """
    import avatar_storage

    if not _valid_id(user_id):
        raise ValueError("invalid user id")
    storage = avatar_storage.get_storage()
    removed = False
    previous: list[str] | None = None
    for _ in range(20):  # a listing returns one page; re-list until empty
        try:
            keys = [k for k in storage.list_keys(user_id) if k.startswith(f"{user_id}/") and _safe_object_path(k)]
        except Exception as exc:  # noqa: BLE001
            if _is_bucket_missing(exc):
                return "deleted" if removed else "clear"
            raise
        if not keys:
            return "deleted" if removed else "clear"
        if sorted(keys) == previous:
            log.warning("Avatar purge made no progress", keys=sorted(keys)[:20], count=len(keys))
            return "error"
        storage.delete(keys)
        removed = True
        previous = sorted(keys)
    log.warning("Avatar purge did not converge", keys=previous[:20] if previous else [])
    return "error"


_DRAFT_PII_SCRUB = {
    "full_name": None,
    "guardian_name": None,
    "student_class": None,
    "stream": None,
    "guardian_consent": False,  # NOT NULL; the tick belonged to the removed identity
    "generated_user_id": None,  # the FK would null it on delete anyway
}


def _purge_provision_drafts(svc, user_id: str) -> str:
    """Scrub, do not delete, the school's draft rows for a generated learner.

    A draft with ``status = 'generated'`` is what ``generate`` checks to skip a
    row that already minted an account (``status != 'draft'``), so deleting it
    would turn a stale or retried generate call into a 404 for the whole batch
    instead of a skip. The row therefore stays as a bare tombstone and every
    personal field (name, guardian, class, stream, consent tick, the link to
    the user) is cleared. Nothing in the roster list or import counts reads
    generated drafts: the review grid lists ``status = 'draft'`` only.
    """
    try:
        rows = (
            svc.table("student_provision_drafts").select("id").eq("generated_user_id", user_id).limit(1).execute().data
        )
        if not rows:
            return "clear"
        svc.table("student_provision_drafts").update(_DRAFT_PII_SCRUB).eq("generated_user_id", user_id).execute()
        return "scrubbed"
    except Exception as exc:  # noqa: BLE001
        if _missing_column(exc, "generated_user_id"):
            return "clear"
        raise


_MERGE_SCRUB = {
    "provisioned_snapshot": {},
    "real_snapshot": {},
    "evidence": {},
    # NOT NULL, and for phone/email/name matches it embeds the identifier itself.
    "match_key": "scrubbed",
}


def _purge_merge_candidates(svc, user_id: str) -> str:
    """Remove a deleted learner's identity from merge candidates.

    ``pending`` rows are proposals nobody has decided; they are deleted.
    ``confirmed`` and ``dismissed`` rows are the school admins' audit trail
    (who decided, when, with what status) and the counterpart's record, so they
    are kept: both identity snapshots, the evidence and the ``match_key`` (which
    can hold a phone, email or name) are blanked, and the deleted user's id
    column is set to NULL. Both id columns are nullable and the only unique key
    is ``(school_id, provisioned_student_id, real_student_id)``, in which NULLs
    do not collide, so nulling is allowed; the FK would null it on delete too.
    The counterpart's id column is left as it is.
    """
    acted = False
    for col in ("provisioned_student_id", "real_student_id"):
        try:
            if svc.table("student_merge_candidates").select("id").eq(col, user_id).limit(1).execute().data:
                svc.table("student_merge_candidates").delete().eq(col, user_id).eq("status", "pending").execute()
                svc.table("student_merge_candidates").update({**_MERGE_SCRUB, col: None}).eq(col, user_id).neq(
                    "status", "pending"
                ).execute()
                acted = True
        except Exception as exc:  # noqa: BLE001
            if _missing_column(exc, col):
                continue
            raise
    return "scrubbed" if acted else "clear"


def hard_delete_learner_content(user_id: str) -> dict:
    """Delete the user's content and report per table.

    Outcomes: ``deleted``, ``clear`` (nothing to remove), ``missing_table``,
    ``error``, ``transferred`` (guild handed to another member; or
    ``deleted_and_transferred`` when both happened), ``blocked``
    (the user row cannot be deleted yet) or ``skipped``
    (no database client). The caller must delete the user row only when no
    outcome is ``error``, ``blocked`` or ``skipped``.
    """
    outcome: dict = {}
    if not _valid_id(user_id):
        # An empty id would turn a storage prefix into the bucket root. Refuse
        # before any database or storage call; the row is kept (error blocks).
        log.warning("Learner content purge refused: invalid user id")
        return {t: "error" for t in _LEARNER_CONTENT_TABLES + _UNLINKED_ON_DELETE_TABLES + _GUARDED}
    try:
        svc = db.get_service_client().schema(_SCHEMA)
    except Exception as exc:  # noqa: BLE001
        log.warning("Learner content purge skipped", error=type(exc).__name__)
        return {t: "skipped" for t in _LEARNER_CONTENT_TABLES + _UNLINKED_ON_DELETE_TABLES + _GUARDED}
    for table in _LEARNER_CONTENT_TABLES + _UNLINKED_ON_DELETE_TABLES:
        try:
            if table == "collections":
                # Page the select (PostgREST caps it at 1000) and chunk the
                # delete so the ``in.(...)`` URL stays short; fail closed if
                # the page cap leaves collections unread.
                rows = _paged(lambda: svc.table("collections").select("id").eq("user_id", user_id), "collections")
                ids = [r["id"] for r in rows]
                for i in range(0, len(ids), _IN_CHUNK):
                    svc.table("collection_items").delete().in_("collection_id", ids[i : i + _IN_CHUNK]).execute()
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
        ("avatars", _purge_avatars),
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
