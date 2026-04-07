# ============================================
# Sifter Skill_Up — Offline Sync Engine
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
import traceback
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import (
    OfflineSyncRequest, OfflineSyncResponse,
    QueuePriority, ResponseModel, SyncItemResult, SyncStatus,
)
from config import settings

# Postgrest API errors map to "conflict" (data layer rejected the op)
try:
    from postgrest.exceptions import APIError as _PgAPIError  # type: ignore
except Exception:  # pragma: no cover
    class _PgAPIError(Exception):  # fallback so isinstance works
        pass

router = APIRouter(prefix="/api/sync", tags=["offline-sync"])

# Maximum age of queue items we accept (72 hours)
MAX_ITEM_AGE_HOURS = 72
# Max items per drain call
MAX_BATCH_SIZE = 500
# Per-item XP cap (defends against malicious / corrupt clients)
MAX_XP_PER_ITEM = 500
# Per-batch XP cap (server-side daily safety net mirrors RPC default)
MAX_XP_PER_BATCH = 5000
# Reject the entire batch if device clock skew exceeds this many seconds
MAX_CLOCK_SKEW_SECONDS = 24 * 3600
# Priority sort order
_PRIORITY_ORDER = {
    QueuePriority.CRITICAL: 0,
    QueuePriority.HIGH: 1,
    QueuePriority.NORMAL: 2,
}


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
    db.get_service_client().table("sync_log").insert({
        "id":         str(uuid.uuid4()),
        "item_id":    item_id,
        "user_id":    user_id,
        "endpoint":   endpoint,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    }).execute()


# ─────────────────────────────────────────────────────────────
# Per-endpoint handlers
# Maps endpoint string → function that applies the action to DB
# ─────────────────────────────────────────────────────────────

async def _handle_complete_level(
    body: Dict[str, Any],
    user: dict,
    background_tasks: BackgroundTasks,
) -> dict:
    """Apply a level completion from the offline queue."""
    user_id = user["id"]

    # ── Validate level_id is a positive integer ─────────
    try:
        level_id = int(body["level_id"])
    except (KeyError, TypeError, ValueError) as e:
        raise ValueError(f"invalid level_id: {e}")
    if level_id <= 0:
        raise ValueError(f"level_id must be positive, got {level_id}")

    score      = int(body.get("score", 0))
    is_perfect = bool(body.get("is_perfect", False))
    track      = body.get("track", "crypto")

    completed = user.get("completed_levels", [])
    perfect   = user.get("perfect_levels", [])

    is_new = str(level_id) not in completed
    xp = settings.LEVEL_COMPLETE_XP if is_new else 50
    if is_perfect and str(level_id) not in perfect:
        xp += settings.PERFECT_LEVEL_BONUS

    # Cap XP per item — prevents corrupt/malicious queue payloads
    if xp > MAX_XP_PER_ITEM:
        xp = MAX_XP_PER_ITEM

    if is_new:
        completed.append(str(level_id))
    if is_perfect and str(level_id) not in perfect:
        perfect.append(str(level_id))

    # ── Atomic point increment via RPC (no read-modify-write) ──
    rpc_result = db.get_service_client().rpc(
        "increment_user_points",
        {"p_user_id": user_id, "p_delta": xp},
    ).execute()
    new_points = rpc_result.data if rpc_result.data is not None else (user.get("points", 0) + xp)

    fresh = db.get_service_client().table("users").select("current_level") \
        .eq("id", user_id).single().execute().data
    next_level = max(
        (fresh or {}).get("current_level", user.get("current_level", 1)),
        level_id + 1,
    )

    db.get_service_client().table("users").update({
        "completed_levels": completed,
        "perfect_levels":   perfect,
        "current_level":    next_level,
        "active_track":     track,
    }).eq("id", user_id).execute()

    db.get_service_client().table("level_scores").upsert({
        "user_id":  user_id,
        "level":    level_id,
        "score":    score,
        "stars":    3 if is_perfect else (2 if score > 150 else 1),
    }).execute()

    db.get_service_client().table("transactions").insert({
        "user_id":      user_id,
        "type":         "earn",
        "amount":       xp,
        "balance_after": new_points,
        "description":  f"[OFFLINE] Level {level_id} ({track})",
    }).execute()

    # Trigger badge checks (matches the online complete-level path)
    try:
        from phase5_routes import _check_badge_triggers
        background_tasks.add_task(
            _check_badge_triggers,
            user_id,
            "level_complete",
            {"level_id": level_id, "track": track, "is_perfect": is_perfect},
        )
    except Exception as e:
        log.warning("Could not schedule badge trigger check", error=str(e))

    return {"xp_earned": xp, "new_points": new_points, "next_level": next_level}


async def _handle_save_last_position(body: Dict[str, Any], user: dict) -> dict:
    """Save the user's resume position."""
    db.get_service_client().table("users").update({
        "last_position": body,
    }).eq("id", user["id"]).execute()
    return {"saved": True}


async def _handle_streak_check(body: Dict[str, Any], user: dict) -> dict:
    """
    Apply a streak check using the SERVER date (the client `date`
    field is intentionally ignored — devices lie / drift / replay).
    """
    user_id = user["id"]

    rpc = db.get_service_client().rpc(
        "touch_user_streak", {"p_user_id": user_id}
    ).execute()
    row = (rpc.data[0] if isinstance(rpc.data, list) and rpc.data else rpc.data) or {}
    streak = int(row.get("streak", user.get("streak", 1)))

    bonus = 0
    if 1 <= streak <= len(settings.STREAK_BONUS):
        bonus = settings.STREAK_BONUS[streak - 1]

    if bonus > 0:
        bonus_capped = min(bonus, MAX_XP_PER_ITEM)
        granted = db.get_service_client().rpc(
            "try_award_offline_xp",
            {"p_user_id": user_id, "p_request": bonus_capped, "p_max": MAX_XP_PER_BATCH},
        ).execute()
        bonus = int(granted.data or 0)

    return {"streak": streak, "bonus_earned": bonus}


async def _handle_analytics_event(body: Dict[str, Any], user: dict) -> dict:
    db.get_service_client().table("analytics_events").insert({
        "user_id":    user["id"],
        "event_type": body.get("event_type", "unknown"),
        "event_data": body.get("event_data", {}),
        "session_id": body.get("session_id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return {"tracked": True}


async def _handle_xp_event(body: Dict[str, Any], user: dict) -> dict:
    """
    Generic XP award (badges, share bonuses, etc.).

    Per-item cap: MAX_XP_PER_ITEM. The actual grant is performed by
    `try_award_offline_xp`, which enforces a daily cap server-side.
    A return of 0 means the user is at their cap → REJECTED upstream.
    """
    user_id = user["id"]
    xp_request = int(body.get("xp_amount", 0))
    if xp_request <= 0:
        return {"awarded": 0}

    # Cap per-item BEFORE asking the RPC
    xp_request = min(xp_request, MAX_XP_PER_ITEM)

    granted_resp = db.get_service_client().rpc(
        "try_award_offline_xp",
        {"p_user_id": user_id, "p_request": xp_request, "p_max": MAX_XP_PER_BATCH},
    ).execute()
    granted = int(granted_resp.data or 0)

    if granted == 0:
        # Daily cap hit — caller marks REJECTED
        return {"awarded": 0, "capped": True}

    db.get_service_client().table("xp_events").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "event_type": body.get("event_type", "offline_xp"),
        "xp_amount":  granted,
        "source_id":  body.get("source_id"),
        "metadata":   body.get("metadata", {}),
        "created_at": datetime.now(timezone.utc).isoformat(),
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

    # Detect clock skew (timezone-aware)
    server_time = datetime.now(timezone.utc)
    try:
        client_time = datetime.fromisoformat(payload.client_time.replace("Z", "+00:00"))
        if client_time.tzinfo is None:
            client_time = client_time.replace(tzinfo=timezone.utc)
        skew_seconds = int(abs((server_time - client_time).total_seconds()))
    except Exception:
        skew_seconds = 0

    # Hard reject batches with clock skew > 24h — almost certainly a malicious
    # / corrupt device. Returning REJECTED for every item lets the client purge
    # its local queue rather than retry forever.
    if skew_seconds > MAX_CLOCK_SKEW_SECONDS:
        log.warning(
            "Batch rejected: clock skew exceeds limit",
            user_id=user_id, skew_seconds=skew_seconds, limit=MAX_CLOCK_SKEW_SECONDS,
        )
        rejected_results = [
            SyncItemResult(
                id=i.id, status=SyncStatus.REJECTED,
                error=f"Clock skew {skew_seconds}s exceeds {MAX_CLOCK_SKEW_SECONDS}s limit",
            )
            for i in payload.items
        ]
        return OfflineSyncResponse(
            results=rejected_results,
            server_time=server_time.isoformat(),
            clock_skew_seconds=skew_seconds,
        )

    if skew_seconds > 3600:
        log.warning("Large clock skew detected", user_id=user_id, skew_seconds=skew_seconds)

    # Sort by priority then by created_at (chronological within each tier)
    sorted_items = sorted(
        payload.items,
        key=lambda i: (_PRIORITY_ORDER.get(i.priority, 99), i.created_at)
    )

    results: list[SyncItemResult] = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_ITEM_AGE_HOURS)

    # ── Per-batch XP cap pre-pass ──────────────────────
    # Walk items in priority/chrono order and mark anything that would push
    # the requested XP total over MAX_XP_PER_BATCH as REJECTED up-front.
    # This protects the user before we even hit the per-grant RPC.
    over_cap_ids: set[str] = set()
    running_xp = 0
    for it in sorted_items:
        if it.endpoint not in ("/api/game/complete-level", "/api/game/xp-event"):
            continue
        try:
            requested = int(it.body.get("xp_amount", 0)) if it.endpoint == "/api/game/xp-event" \
                else min(
                    settings.LEVEL_COMPLETE_XP + settings.PERFECT_LEVEL_BONUS,
                    MAX_XP_PER_ITEM,
                )
        except Exception:
            requested = 0
        requested = max(0, min(requested, MAX_XP_PER_ITEM))
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

        # ── Age check ───────────────────────────────────────
        try:
            item_ts = datetime.fromisoformat(item.created_at.replace("Z", "+00:00"))
            # Normalize naive timestamps to UTC so comparison with `cutoff`
            # (which IS tz-aware) doesn't raise TypeError silently.
            if item_ts.tzinfo is None:
                item_ts = item_ts.replace(tzinfo=timezone.utc)
            if item_ts < cutoff:
                results.append(SyncItemResult(
                    id=item.id, status=SyncStatus.REJECTED,
                    error=f"Item too old (>{MAX_ITEM_AGE_HOURS}h) — discarded",
                ))
                continue
        except (ValueError, TypeError) as exc:
            log.warning("offline_sync.age_check.unparseable_timestamp",
                        item_id=item.id, created_at=item.created_at, error=str(exc))
            # Fall through and try to apply

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
            if item.endpoint == "/api/game/complete-level":
                response = await handler(item.body, current_user, background_tasks)
            else:
                response = await handler(item.body, current_user)

            # If the XP RPC reported it was capped, treat as REJECTED so the
            # client drops it instead of retrying forever.
            if (
                item.endpoint == "/api/game/xp-event"
                and isinstance(response, dict)
                and response.get("awarded", 0) == 0
                and response.get("capped")
            ):
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

        except (KeyError, ValueError, TypeError, _PgAPIError) as e:
            # Data-shape / DB constraint problem — client should reconcile.
            log.warning(
                "Offline item conflict",
                item_id=item.id, endpoint=item.endpoint, error=str(e),
            )
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.CONFLICT, error=str(e),
            ))
        except Exception as e:
            # Anything else is an internal failure — drop it (REJECTED) and log
            # the full stack so we can fix the bug server-side.
            log.error(
                "Offline item failed",
                item_id=item.id, endpoint=item.endpoint, error=str(e),
                stack=traceback.format_exc(),
            )
            results.append(SyncItemResult(
                id=item.id, status=SyncStatus.REJECTED, error=str(e),
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
        "server_time": datetime.now(timezone.utc).isoformat(),
        "ok":          True,
    })
