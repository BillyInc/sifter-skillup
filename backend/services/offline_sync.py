# ============================================
# Sifter LevelUp — Offline Sync Engine
#
# PRIORITY #1 — this is the core of offline-first.
#
# The client accumulates a local queue (in AsyncStorage / WatermelonDB)
# while offline. Any time the app detects connectivity it POSTs the
# entire queue to POST /api/sync/drain.
#
# This endpoint:
#   1. Sorts items by priority (critical → high → normal)
#   2. Applies each item by routing it to the real handler
#   3. Deduplicates (same item_id → skip if already applied)
#   4. Detects clock skew between device and server
#   5. Returns per-item results so the client knows what to drop
#   6. Never partially fails: each item is independent
#
# Client behaviour:
#   - On success: remove item from local queue
#   - On conflict: keep item, prompt user if needed
#   - On rejected: drop item, log for analytics
#
# Security:
#   - Endpoint requires valid JWT (same as all other routes)
#   - device_id must match active session
#   - Max 500 items per drain call (prevents abuse)
#   - Items older than 72 hours are rejected with status=rejected
# ============================================
import uuid
from datetime import date as date_type, datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

from auth import Auth
from database import db
from logger import log
from models import (
    OfflineSyncRequest, OfflineSyncResponse,
    QueuePriority, ResponseModel, SyncItemResult, SyncStatus,
)
from config import settings

router = APIRouter(prefix="/api/sync", tags=["offline-sync"])

# Maximum age of queue items we accept (72 hours)
MAX_ITEM_AGE_HOURS = 72
# Max items per drain call
MAX_BATCH_SIZE = 500
# Per-item XP cap (defends against malicious / corrupt clients)
MAX_XP_PER_ITEM = 500
# Per-batch XP cap (server-side safety net; mirrors the RPC's daily default)
MAX_XP_PER_BATCH = 5000
# Reject the entire batch if device clock skew exceeds this many seconds
MAX_CLOCK_SKEW_SECONDS = 24 * 3600
# Priority sort order
_PRIORITY_ORDER = {
    QueuePriority.CRITICAL: 0,
    QueuePriority.HIGH: 1,
    QueuePriority.NORMAL: 2,
}


# Endpoints that can move a user's points, and therefore have to be counted
# against MAX_XP_PER_BATCH before anything is applied.
#
# /api/users/streak is deliberately NOT here. Its bonus is keyed per streak-day,
# so N queued streak items pay at most once no matter how many arrive; counting
# each one at its worst case (up to MAX_XP_PER_ITEM) would reserve budget that
# can never actually be spent and would reject legitimate items behind it. It
# stays bounded by the RPC's own daily cap instead.
_XP_BEARING_ENDPOINTS = ("/api/game/complete-level", "/api/game/xp-event")


def _requested_xp(item: Any) -> int:
    """
    Upper bound on the XP one queued item could move, for the per-batch pre-pass.

    Deliberately pessimistic for complete-level (assumes a perfect first run,
    which dominates the replay reward), and clamped to MAX_XP_PER_ITEM so a
    client cannot inflate the running total by claiming a huge xp_amount.
    """
    if item.endpoint == "/api/game/xp-event":
        try:
            requested = int(item.body.get("xp_amount", 0))
        except (AttributeError, TypeError, ValueError):
            requested = 0
    else:
        requested = settings.LEVEL_COMPLETE_XP + settings.PERFECT_LEVEL_BONUS
    return max(0, min(requested, MAX_XP_PER_ITEM))


class ItemRejected(Exception):
    """
    Raised by a handler when the item is permanently unacceptable (bad input),
    as opposed to a transient failure.

    The drain loop turns this into status=REJECTED so the client DROPS the item,
    instead of the CONFLICT a bare Exception produces (which the client retries
    forever). Used for the same fail-closed cases the batch-level guards already
    cover: timestamps we cannot parse or cannot trust.
    """


# ─────────────────────────────────────────────────────────────
# Idempotency store (Supabase-backed)
# ─────────────────────────────────────────────────────────────

def _already_applied(item_id: str, user_id: str) -> bool:
    """Check if this item_id was already processed for this user."""
    result = db.get_service_client() \
        .table("sync_log") \
        .select("id") \
        .eq("item_id", item_id) \
        .eq("user_id", user_id) \
        .execute()
    return bool(result.data)


def _mark_applied(item_id: str, user_id: str, endpoint: str):
    """
    Record the transport-level marker for a queue item.

    NOTE: for XP-bearing endpoints the authoritative ledger row is written
    INSIDE the grant transaction by `try_award_offline_xp_idem` (see
    migration_v2_offline_idempotency.sql). This call may therefore be a no-op
    duplicate, so it must tolerate the UNIQUE(item_id, user_id) conflict rather
    than raise — a raise here would flip a successfully-applied item to
    CONFLICT and invite the very retry we are trying to make safe.
    """
    db.get_service_client().table("sync_log").upsert(
        {
            "item_id":    item_id,
            "user_id":    user_id,
            "endpoint":   endpoint,
            "applied_at": _utcnow().isoformat(),
        },
        on_conflict="item_id,user_id",
        ignore_duplicates=True,
    ).execute()


# ─────────────────────────────────────────────────────────────
# Time helpers
# ─────────────────────────────────────────────────────────────
# Everything in this module is timezone-AWARE UTC. The previous code mixed
# naive `datetime.utcnow()` with `parsed.replace(tzinfo=None)`, which does not
# convert — it DISCARDS the offset. A device in UTC+1 sending a perfectly
# correct timestamp was therefore read as one hour of clock skew, and its queue
# items were aged as if captured an hour later than they were. Harmless in the
# middle of the 72h window, wrong at both edges, and it scales with the
# offset — UTC+14 clients lost 14h of their window.

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _parse_iso_utc(raw: str) -> datetime:
    """
    Parse an ISO-8601 timestamp to aware UTC.

    A trailing 'Z' is normalised for Python < 3.11. A timestamp with no offset
    is ASSUMED to be UTC — clients have always sent UTC, and assuming is the
    only non-arbitrary choice; the alternative (reject) would break every
    existing client. Raises ValueError on anything unparseable, and callers
    fail closed on that.
    """
    parsed = datetime.fromisoformat(str(raw).strip().replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


# ─────────────────────────────────────────────────────────────
# Server-derived idempotency keys
# ─────────────────────────────────────────────────────────────
# `OfflineQueueItem.id` is client-generated, so it is only a transport hint:
# a malicious or buggy client can mint a fresh UUID and replay a real event.
# For endpoints that represent a non-repeatable domain fact (completing level
# N) we derive a deterministic server-side key instead, so replays collapse
# onto the same sync_log row no matter what id the client sends.
_SYNC_KEY_NAMESPACE = uuid.UUID("2f5c1b3e-9a47-5d6f-8c21-7e0b4a9d3f18")


def _natural_key(user_id: str, endpoint: str, *parts: Any) -> str:
    """Deterministic uuid5 over (user, endpoint, domain identifiers)."""
    seed = "|".join([str(user_id), str(endpoint), *[str(p) for p in parts]])
    return str(uuid.uuid5(_SYNC_KEY_NAMESPACE, seed))


def _award_xp_idempotent(
    user_id: str, ledger_key: str, endpoint: str, xp_request: int
) -> Dict[str, Any]:
    """
    Grant XP exactly once, atomically with the daily cap AND the sync_log
    ledger row (single DB transaction inside the RPC).

    Returns a normalised dict: granted / already_applied / capped / new_points.
    """
    xp_request = max(0, min(int(xp_request), MAX_XP_PER_ITEM))

    resp = db.get_service_client().rpc(
        "try_award_offline_xp_idem",
        {
            "p_user_id":  user_id,
            "p_item_id":  ledger_key,
            "p_endpoint": endpoint,
            "p_request":  xp_request,
            "p_max":      MAX_XP_PER_BATCH,
        },
    ).execute()

    data = resp.data
    if isinstance(data, list):
        data = data[0] if data else None
    if not isinstance(data, dict):
        # Defensive: an RPC that returns a bare integer (or nothing) is treated
        # as "granted that many, not a duplicate" so we never silently drop XP.
        granted = int(data or 0)
        data = {"granted": granted, "already_applied": False, "capped": granted == 0}

    return {
        "granted":         int(data.get("granted") or 0),
        "already_applied": bool(data.get("already_applied")),
        "capped":          bool(data.get("capped")),
        "new_points":      data.get("new_points"),
    }


# ─────────────────────────────────────────────────────────────
# Per-endpoint handlers
# Maps endpoint string → function that applies the action to DB
# ─────────────────────────────────────────────────────────────

async def _handle_complete_level(body: Dict[str, Any], user: dict, ctx: Dict[str, Any]) -> dict:
    """
    Apply a level completion from the offline queue.

    XP is granted through the same capped + idempotent RPC as every other
    offline XP path, keyed on a SERVER-derived natural key rather than the
    client's queue-item id. Consequences:

      * First completion pays LEVEL_COMPLETE_XP exactly once, ever.
      * Replaying an already-paid level still pays LEVEL_REPLAY_XP, but on a
        THIRD key family that includes the server's current date, so it is
        earnable at most once per level per day. Previously a replay paid a
        flat 50 on every submission with a fresh client UUID, uncapped — that
        frequency, not the reward itself, was the exploit.
      * The grant respects MAX_XP_PER_ITEM, MAX_XP_PER_BATCH and the daily cap
        (previously complete-level bypassed all three).
      * Base completion and the perfect-run bonus use SEPARATE keys, so a
        player who later replays the same level perfectly still receives the
        bonus exactly once — without re-earning the base XP.
    """
    user_id    = user["id"]
    level_id   = int(body["level_id"])
    score      = int(body.get("score", 0))
    is_perfect = bool(body.get("is_perfect", False))
    track      = body.get("track", "crypto")
    endpoint   = ctx.get("endpoint", "/api/game/complete-level")

    # ── XP: capped + exactly-once, keyed on the domain fact ──
    completion = _award_xp_idempotent(
        user_id,
        _natural_key(user_id, endpoint, "level-complete", level_id),
        endpoint,
        settings.LEVEL_COMPLETE_XP,
    )
    xp = completion["granted"]
    new_points = completion.get("new_points")
    replayed = completion["already_applied"]
    capped = completion["capped"]

    if replayed and settings.LEVEL_REPLAY_XP > 0:
        # Already paid for the completion itself — this is a replay. The date
        # comes from the SERVER (never body/created_at), so a client cannot
        # mint extra replay days by lying about when it played.
        #
        # This date is the API server's UTC date; the daily cap inside the RPC
        # rolls on Postgres CURRENT_DATE. They agree only because the database
        # is UTC (verified on billy). If that ever changes, the replay window
        # and the cap window drift apart by the offset — not exploitable (both
        # are server-side and both roll once per day), but the boundaries would
        # no longer line up.
        replay = _award_xp_idempotent(
            user_id,
            _natural_key(
                user_id, endpoint, "level-replay", level_id, _utcnow().date().isoformat()
            ),
            endpoint,
            settings.LEVEL_REPLAY_XP,
        )
        xp += replay["granted"]
        if replay.get("new_points") is not None:
            new_points = replay["new_points"]
        # A second replay on the same day is a no-op, not a cap hit: reporting
        # `capped` would make the drain loop REJECT an otherwise valid item.
        capped = replay["capped"] and not replay["already_applied"]

    if is_perfect:
        bonus = _award_xp_idempotent(
            user_id,
            _natural_key(user_id, endpoint, "level-perfect", level_id),
            endpoint,
            settings.PERFECT_LEVEL_BONUS,
        )
        xp += bonus["granted"]
        if bonus.get("new_points") is not None:
            new_points = bonus["new_points"]
        replayed = replayed and bonus["already_applied"]
        capped = capped and bonus["capped"]

    # ── Progress arrays: atomic append, never a whole-array overwrite ──
    # Reading the arrays off the request-scoped `user` snapshot and writing
    # them back wholesale lost levels when two drains overlapped.
    next_level = level_id + 1
    progress = db.get_service_client().rpc(
        "append_user_level_progress",
        {
            "p_user_id":    user_id,
            "p_level":      str(level_id),
            "p_perfect":    is_perfect,
            "p_next_level": next_level,
            "p_track":      track,
        },
    ).execute().data
    if isinstance(progress, list):
        progress = progress[0] if progress else None
    if isinstance(progress, dict):
        new_points = progress.get("new_points", new_points)
        next_level = progress.get("current_level", next_level)

    if new_points is None:
        new_points = user.get("points", 0) + xp

    db.get_service_client().table("level_scores").upsert({
        "user_id":  user_id,
        "level":    level_id,
        "score":    score,
        "stars":    3 if is_perfect else (2 if score > 150 else 1),
    }).execute()

    # Only write a transaction row when XP actually moved — a same-day repeat
    # replay pays nothing and must not manufacture a fake earn record.
    if xp > 0:
        label = "Level {} replay".format(level_id) if replayed else "Level {}".format(level_id)
        db.get_service_client().table("transactions").insert({
            "user_id":      user_id,
            "type":         "earn",
            "amount":       xp,
            "balance_after": new_points,
            "description":  f"[OFFLINE] {label} ({track})",
        }).execute()

    return {
        "xp_earned":  xp,
        "new_points": new_points,
        "next_level": next_level,
        # Extra, additive fields — existing clients ignore them.
        "already_applied": replayed,
        "capped":          bool(capped and xp == 0),
    }


# Only these keys are persisted from a last-position payload. The handler used
# to write the raw request body straight into users.last_position, so a client
# could park an arbitrarily large, arbitrarily shaped blob on its own row —
# unbounded storage on a column nothing validates.
_LAST_POSITION_FIELDS = ("track", "level_id", "chapter_id", "step", "scroll_offset")
_LAST_POSITION_MAX_STR = 128


async def _handle_save_last_position(body: Dict[str, Any], user: dict, ctx: Dict[str, Any]) -> dict:
    """Save the user's resume position (whitelisted scalar fields only)."""
    position: Dict[str, Any] = {}
    for field in _LAST_POSITION_FIELDS:
        value = body.get(field)
        if value is None:
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float, str)):
            raise ItemRejected(f"Invalid last_position.{field}: expected a scalar")
        if isinstance(value, str) and len(value) > _LAST_POSITION_MAX_STR:
            raise ItemRejected(f"Invalid last_position.{field}: exceeds {_LAST_POSITION_MAX_STR} chars")
        position[field] = value

    if not position:
        # Nothing recognisable survived the whitelist. Writing {} here would
        # ERASE a perfectly good stored resume point — a client posting an
        # unrecognised shape (an old build, a renamed field) would silently
        # destroy the user's progress marker. Ignoring it is the safe outcome;
        # the item is still APPLIED so the client drops it rather than retrying.
        return {"saved": False, "reason": "no recognised last_position fields"}

    db.get_service_client().table("users").update({
        "last_position": position,
    }).eq("id", user["id"]).execute()
    return {"saved": True}


def _validate_client_date(raw: Any) -> None:
    """
    Sanity-check a client-supplied capture date. It NEVER feeds the streak
    calculation (see _handle_streak_check) — this only rejects obviously bogus
    payloads early, using the same freshness window the drain loop enforces on
    created_at.

    Fails CLOSED, matching the created_at / client_time convention: an
    unparseable date is rejected, not silently coerced to "today".
    """
    if raw is None:
        return
    try:
        captured = date_type.fromisoformat(str(raw))
    except (TypeError, ValueError):
        raise ItemRejected("Invalid date: expected an ISO-8601 date (YYYY-MM-DD)")

    today = _utcnow().date()
    if captured > today:
        raise ItemRejected(f"Invalid date: {captured.isoformat()} is in the future")
    if (today - captured) > timedelta(hours=MAX_ITEM_AGE_HOURS):
        raise ItemRejected(
            f"Invalid date: {captured.isoformat()} is older than {MAX_ITEM_AGE_HOURS}h"
        )


async def _handle_streak_check(body: Dict[str, Any], user: dict, ctx: Dict[str, Any]) -> dict:
    """
    Advance the user's daily streak and pay the streak bonus.

    Three separate holes are closed here:

      * The date is now derived SERVER-side, inside the RPC (CURRENT_DATE).
        Previously `body["date"]` drove the whole calculation, so a client could
        fabricate a qualifying one-day gap and inflate its streak arbitrarily,
        or hold `last_played` back and keep re-earning. A client date is still
        accepted for legitimate offline capture, but it is only validated
        (not-future, within the 72h freshness window) and then DISCARDED.

      * The bonus is paid only when the streak actually ADVANCES — i.e. when
        the RPC moved `last_played` to a new day. The old code recomputed
        `STREAK_BONUS[streak - 1]` from the current streak value, so replaying
        a same-day check (diff == 0, streak unchanged) paid the full bonus
        again, unbounded with a fresh client item id each time.

      * The payment goes through `try_award_offline_xp_idem` on a SERVER-derived
        natural key (user + endpoint + streak day), so it is capped by
        MAX_XP_PER_ITEM / the daily cap and is earnable at most once per
        streak-day even if the advance and the grant race or retry.

    The streak advance itself is a single atomic server-side statement, not the
    old select-points → add → update read-modify-write, which both bypassed the
    XP caps and lost concurrent point updates.
    """
    user_id  = user["id"]
    endpoint = ctx.get("endpoint", "/api/users/streak")

    _validate_client_date(body.get("date"))

    rpc = db.get_service_client().rpc(
        "touch_user_streak_v2", {"p_user_id": user_id}
    ).execute()
    row = rpc.data
    if isinstance(row, list):
        row = row[0] if row else None
    if not isinstance(row, dict):
        # Fail closed: without a trustworthy server answer we neither know the
        # streak nor whether it advanced, so we must not pay anything.
        raise RuntimeError("touch_user_streak_v2 returned no row")

    streak     = int(row.get("streak") or user.get("streak", 1))
    advanced   = bool(row.get("advanced", False))
    streak_day = str(row.get("last_played") or _utcnow().date().isoformat())

    bonus  = 0
    capped = False
    if advanced and 1 <= streak <= len(settings.STREAK_BONUS):
        award = _award_xp_idempotent(
            user_id,
            _natural_key(user_id, endpoint, "streak-bonus", streak_day),
            endpoint,
            settings.STREAK_BONUS[streak - 1],
        )
        bonus  = award["granted"]
        capped = award["capped"]

    return {
        # Response contract preserved — the mobile client reads both keys.
        "streak":       streak,
        "bonus_earned": bonus,
        # Additive fields; existing clients ignore them.
        "advanced":     advanced,
        "capped":       bool(capped and bonus == 0),
    }


async def _handle_analytics_event(body: Dict[str, Any], user: dict, ctx: Dict[str, Any]) -> dict:
    settings = user.get("settings")
    acceptance = settings.get("legalAcceptance") if isinstance(settings, dict) else None
    if not (isinstance(acceptance, dict) and acceptance.get("analyticsConsent") is True):
        return {"tracked": False, "reason": "analytics_opt_out"}
    db.get_service_client().table("analytics_events").insert({
        "user_id":    user["id"],
        "event_type": body.get("event_type", "unknown"),
        "event_data": body.get("event_data", {}),
        "session_id": body.get("session_id"),
        "created_at": _utcnow().isoformat(),
    }).execute()
    return {"tracked": True}


async def _handle_xp_event(body: Dict[str, Any], user: dict, ctx: Dict[str, Any]) -> dict:
    """
    Generic XP award (badges, share bonuses, etc.).

    Per-item cap: MAX_XP_PER_ITEM. The grant is performed by the
    `try_award_offline_xp_idem` RPC, which in ONE transaction claims the
    sync_log ledger row, checks the daily cap and increments points. Because
    the ledger row commits with the grant, a retry after any failure later in
    this function (e.g. the xp_events insert below) is recognised as a
    duplicate and pays nothing — the old two-statement version re-granted.
    """
    user_id = user["id"]
    try:
        xp_request = int(body.get("xp_amount", 0))
    except (TypeError, ValueError):
        xp_request = 0
    if xp_request <= 0:
        return {"awarded": 0}

    # For generic XP events the client's queue-item id IS the natural key:
    # there is no server-side domain fact to derive one from. It is passed
    # straight into the RPC so the dedup happens in-transaction.
    result = _award_xp_idempotent(
        user_id, ctx["item_id"], ctx.get("endpoint", "/api/game/xp-event"), xp_request
    )
    granted = result["granted"]

    if result["already_applied"]:
        # Someone (a concurrent drain, or our own pre-failure attempt) already
        # paid for this exact item. Report success so the client drops it.
        return {"awarded": 0, "already_applied": True}

    if granted == 0:
        # Daily cap hit — caller marks REJECTED so the client stops retrying.
        return {"awarded": 0, "capped": True}

    db.get_service_client().table("xp_events").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "event_type": body.get("event_type", "offline_xp"),
        "xp_amount":  granted,
        "source_id":  body.get("source_id"),
        "metadata":   body.get("metadata", {}),
        "created_at": _utcnow().isoformat(),
    }).execute()

    return {"awarded": granted}


# Map endpoint strings → handlers
_ENDPOINT_MAP = {
    "/api/game/complete-level":      _handle_complete_level,
    "/api/users/last-position":      _handle_save_last_position,
    "/api/users/streak":             _handle_streak_check,
    "/api/analytics/event":          _handle_analytics_event,
    "/api/game/xp-event":            _handle_xp_event,
}


# ─────────────────────────────────────────────────────────────
# Main drain endpoint
# ─────────────────────────────────────────────────────────────

@router.post("/drain", response_model=OfflineSyncResponse)
async def drain_offline_queue(
    payload: OfflineSyncRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Receive and apply the client's offline action queue.
    Called automatically by the client on any connectivity signal.
    Safe to call multiple times (idempotent per item_id).
    """
    user_id = current_user["id"]

    # Validate batch size
    if len(payload.items) > MAX_BATCH_SIZE:
        raise HTTPException(400, f"Batch too large: max {MAX_BATCH_SIZE} items")

    # Detect clock skew
    server_time = _utcnow()
    try:
        client_time = _parse_iso_utc(payload.client_time)
        skew_seconds = int(abs((server_time - client_time).total_seconds()))
    except Exception:
        # Fail CLOSED. Previously this swallowed the error and set skew to 0,
        # which meant a client sending garbage in `client_time` sailed past the
        # clock-skew guard entirely. 400 leaves the client's queue intact (no
        # data loss) while refusing to apply anything until it sends a real
        # timestamp.
        log.warning(
            "Batch rejected: unparseable client_time",
            user_id=user_id, client_time=payload.client_time,
        )
        raise HTTPException(400, "Invalid client_time: expected an ISO-8601 timestamp")

    # Hard-reject batches whose clock skew exceeds the limit — almost certainly a
    # malicious / corrupt device. Returning REJECTED for every item lets the
    # client purge its local queue instead of retrying forever.
    if skew_seconds > MAX_CLOCK_SKEW_SECONDS:
        log.warning(
            "Batch rejected: clock skew exceeds limit",
            user_id=user_id, skew_seconds=skew_seconds, limit=MAX_CLOCK_SKEW_SECONDS,
        )
        return OfflineSyncResponse(
            results=[
                SyncItemResult(
                    id=i.id, status=SyncStatus.REJECTED,
                    error=f"Clock skew {skew_seconds}s exceeds {MAX_CLOCK_SKEW_SECONDS}s limit",
                )
                for i in payload.items
            ],
            server_time=server_time.isoformat(),
            clock_skew_seconds=skew_seconds,
        )

    if skew_seconds > 3600:
        log.warning("Large clock skew detected", user_id=user_id, skew_seconds=skew_seconds)

    results: list[SyncItemResult] = []
    cutoff = _utcnow() - timedelta(hours=MAX_ITEM_AGE_HOURS)

    # ── Freshness pass ───────────────────────────────────────
    # Parse and age-check FIRST, before anything else looks at the batch. This
    # used to run inside the apply loop, i.e. AFTER the XP pre-pass, so stale
    # and unparseable items still consumed per-batch XP budget on their way to
    # being discarded — and could push a legitimate item over the cap and get
    # it rejected. Parsing here also gives the sort a real datetime key: the
    # old sort compared `created_at` as a STRING, so '...T09:00:00+01:00' and
    # '...T09:00:00Z' ordered by text rather than by instant.
    fresh: list[tuple[Any, datetime]] = []
    for item in payload.items:
        try:
            item_ts = _parse_iso_utc(item.created_at)
        except (TypeError, ValueError):
            # Fail CLOSED. Applying an item whose age we cannot establish
            # defeats the 72h freshness rule — a client could stamp garbage and
            # replay arbitrarily old queue entries.
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED,
                error="Unparseable created_at — expected an ISO-8601 timestamp",
            ))
            continue
        if item_ts < cutoff:
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED,
                error=f"Item too old (>{MAX_ITEM_AGE_HOURS}h) — discarded"
            ))
            continue
        fresh.append((item, item_ts))

    # Sort by priority then by capture instant (chronological within each tier)
    fresh.sort(key=lambda pair: (_PRIORITY_ORDER.get(pair[0].priority, 99), pair[1]))
    sorted_items = [item for item, _ in fresh]

    # ── Per-batch XP cap pre-pass ────────────────────────────
    # Walk the surviving items in priority/chrono order and mark anything that
    # would push the requested XP total over MAX_XP_PER_BATCH as REJECTED
    # up-front — protects the user before we even hit the per-grant RPC.
    over_cap_ids: set[str] = set()
    running_xp = 0
    for it in sorted_items:
        if it.endpoint not in _XP_BEARING_ENDPOINTS:
            continue
        requested = _requested_xp(it)
        if running_xp + requested > MAX_XP_PER_BATCH:
            over_cap_ids.add(it.id)
        else:
            running_xp += requested

    for item in sorted_items:
        if item.id in over_cap_ids:
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED,
                error=f"Per-batch XP cap exceeded ({MAX_XP_PER_BATCH})",
            ))
            continue

        # ── Idempotency ─────────────────────────────────────
        if _already_applied(item.id, user_id):
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.APPLIED,
                response={"note": "already_applied"}
            ))
            continue

        # ── Route to handler ─────────────────────────────────
        handler = _ENDPOINT_MAP.get(item.endpoint)
        if not handler:
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED,
                error=f"Unknown endpoint: {item.endpoint}"
            ))
            continue

        # ── Apply ────────────────────────────────────────────
        try:
            response = await handler(
                item.body, current_user,
                {"item_id": item.id, "endpoint": item.endpoint, "device_id": item.device_id},
            )

            # If the XP RPC reported it was capped, treat as REJECTED so the
            # client drops it instead of retrying forever. Applies to every
            # XP-bearing endpoint now, not just /api/game/xp-event — the
            # complete-level path used to bypass the cap entirely.
            if isinstance(response, dict) and response.get("capped"):
                results.append(SyncItemResult(
                    id=item.id, status=SyncStatus.REJECTED,
                    error="Daily XP cap reached",
                ))
                continue

            _mark_applied(item.id, user_id, item.endpoint)
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.APPLIED, response=response
            ))
            log.debug("Offline item applied", item_id=item.id, endpoint=item.endpoint)
        except ItemRejected as e:
            # Permanently bad input (e.g. an untrustworthy date). REJECTED, not
            # CONFLICT, so the client drops it instead of retrying forever.
            log.warning(
                "Offline item rejected", item_id=item.id, endpoint=item.endpoint, error=str(e)
            )
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED, error=str(e)
            ))
        except Exception as e:
            log.error("Offline item failed", item_id=item.id, endpoint=item.endpoint, error=str(e))
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.CONFLICT,
                error=str(e)
            ))

    log.info(
        "Offline queue drained",
        user_id=user_id,
        total=len(sorted_items),
        applied=sum(1 for r in results if r.status == SyncStatus.APPLIED),
        conflicts=sum(1 for r in results if r.status == SyncStatus.CONFLICT),
        rejected=sum(1 for r in results if r.status == SyncStatus.REJECTED),
        clock_skew_seconds=skew_seconds,
    )

    return OfflineSyncResponse(
        results=results,
        server_time=server_time.isoformat(),
        clock_skew_seconds=skew_seconds,
    )


@router.get("/status", response_model=ResponseModel)
async def sync_status(current_user: dict = Depends(Auth.get_current_user)):
    """
    Quick endpoint clients can ping on reconnect to verify
    auth token is still valid before draining queue.
    Returns server timestamp for clock sync.
    """
    return ResponseModel(data={
        "user_id":     current_user["id"],
        "server_time": _utcnow().isoformat(),
        "ok":          True,
    })
