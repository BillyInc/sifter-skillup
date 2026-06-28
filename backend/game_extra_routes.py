# ============================================================
# Sifter LevelUp — Game Extra Routes
# Fixes endpoint mismatch: frontend calls /api/game/last-position
# but missing_routes.py registered on /api/users/last-position
#
# Also adds:
#   GET  /api/users/progress  — full progress for new-device restore
#   POST /api/users/active-field — set active field + color
# ============================================================
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import (
    ActiveFieldUpdate,
    LastPositionUpdate,
    NavigatorLabComplete,
    PushTokenUpdate,
    ResponseModel,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _increment_points(user_id: str, delta: int) -> Optional[int]:
    res = db.get_service_client().rpc(
        "increment_user_points",
        {"p_user_id": user_id, "p_delta": delta},
    ).execute()
    return res.data


# ── /api/game/last-position (matches what api.ts actually calls) ──
game_extra_router = APIRouter(prefix="/api/game", tags=["game-extra"])

@game_extra_router.post("/last-position", response_model=ResponseModel)
async def save_last_position_game(
    body: LastPositionUpdate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Save resume position. Called by useResume.savePosition()."""
    db.get_service_client().table("users").update({
        "last_position": body.position,
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(data={"saved": True})


@game_extra_router.delete("/last-position", response_model=ResponseModel)
async def clear_last_position_game(current_user: dict = Depends(Auth.get_current_user)):
    """Clear resume position when user completes a track or starts fresh."""
    db.get_service_client().table("users").update({
        "last_position": None,
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(data={"cleared": True})


@game_extra_router.get("/last-position", response_model=ResponseModel)
async def get_last_position_game(current_user: dict = Depends(Auth.get_current_user)):
    """Get resume position for the current user."""
    return ResponseModel(data=current_user.get("last_position"))


# ── /api/users/progress — full progress restore for new device ──
users_extra_router = APIRouter(prefix="/api/users", tags=["users-extra"])

@users_extra_router.get("/progress", response_model=ResponseModel)
async def get_full_progress(current_user: dict = Depends(Auth.get_current_user)):
    """
    Return full progress snapshot for offline restore on new device.
    Called by offlineStorage.onLoginSync().
    """
    return ResponseModel(data={
        "userId":            current_user["id"],
        "completedLevels":   current_user.get("completed_levels", []),
        "currentTrack":      current_user.get("active_track", "crypto"),
        "currentTrackName":  current_user.get("current_track_name", ""),
        "lastPosition":      current_user.get("last_position"),
        "xp":                current_user.get("points", 0),
        "streak":            current_user.get("streak", 0),
        "lastActiveDate":    current_user.get("last_played", ""),
        "achievements":      current_user.get("achievements", []),
        "guildId":           current_user.get("guild_id"),
        "settings":          current_user.get("settings", {}),
        "updatedAt":         current_user.get("last_login", _now_iso()),
        "xpStage":           current_user.get("xp_stage", 1),
        "activeFieldId":     current_user.get("active_field_id"),
        "starknetAddress":   current_user.get("starknet_address"),
        "starknetAuth":      current_user.get("starknet_auth", False),
    })


@users_extra_router.post("/active-field", response_model=ResponseModel)
async def set_active_field(
    body: ActiveFieldUpdate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Set the user's active field and field color. Drives HomeScreen artwork."""
    # Pydantic model already validates field_id against `^[a-z0-9_-]+$`
    updates = {"active_field_id": body.field_id}
    if body.field_color:
        updates["active_field_color"] = body.field_color

    db.get_service_client().table("users").update(updates) \
        .eq("id", current_user["id"]).execute()

    return ResponseModel(data={"updated": True, **updates})


@users_extra_router.post("/push-token", response_model=ResponseModel)
async def register_push_token(
    body: PushTokenUpdate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Register/update push notification token. Called on app open."""
    token = body.token
    if not token:
        raise HTTPException(400, "token required")

    # Upsert into push_tokens table
    db.get_service_client().table("push_tokens").upsert({
        "user_id":    current_user["id"],
        "token":      token,
        "platform":   "unknown",
        "updated_at": _now_iso(),
    }).execute()

    # Also update device session push_token if exists
    from device_sessions import _get_existing_session
    session = _get_existing_session(current_user["id"])
    if session:
        db.get_service_client().table("active_sessions").update({
            "push_token": token,
        }).eq("id", session["id"]).execute()

    return ResponseModel(data={"registered": True})


# ── Lab boss completion (DeFi Navigator) ─────────────────────────────────────
# Called when user completes a navigator lab boss.
# Registers a special level ID (3001-3011) so locking logic can check it.

@game_extra_router.post("/navigator-lab-complete", response_model=ResponseModel)
async def navigator_lab_complete(
    body: NavigatorLabComplete,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Record completion of a DeFi Navigator lab.
    lab_number: 1-11 (validated by Pydantic)
    Awards XP and registers boss level ID 3000 + lab_number.
    """
    lab_number = body.lab_number
    boss_level_id = 3000 + lab_number
    user_id = current_user["id"]

    # Add boss level to completed
    completed = current_user.get("completed_levels", []) or []
    if str(boss_level_id) not in completed:
        completed.append(str(boss_level_id))

    # XP scale: junior labs = 200, intermediate = 300, senior = 500, final boss = 1000
    xp_map = {1:200,2:200,3:200,4:200,5:200, 6:300,7:300,8:300,9:300, 10:500,11:1000}
    xp = xp_map.get(lab_number, 200)

    # Atomic XP grant (no read-modify-write race)
    new_pts = _increment_points(user_id, xp)

    # Persist completed_levels separately (last-write-wins is fine here for arrays)
    db.get_service_client().table("users").update({
        "completed_levels": completed,
    }).eq("id", user_id).execute()

    # Record XP event
    db.get_service_client().table("xp_events").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "event_type": "lab_complete",
        "xp_amount": xp,
        "source_id": f"navigator-lab-{lab_number}",
        "metadata": {"lab_number": lab_number, "track": "starknet-defi-navigator"},
        "created_at": _now_iso(),
    }).execute()

    log.info("Navigator lab completed", user_id=user_id, lab=lab_number, xp=xp)

    return ResponseModel(data={
        "lab_number": lab_number,
        "boss_level_id": boss_level_id,
        "xp_awarded": xp,
        "new_points": new_pts,
        "completed_labs": [int(l) - 3000 for l in completed if l.isdigit() and 3001 <= int(l) <= 3011],
    })
