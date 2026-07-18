# ============================================
# Sifter LevelUp — Phase 5 Routes
# XP Events · Badges · Challenges · Merch
# ============================================
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from auth import Auth
from config import settings
from database import db
from logger import log
from models import (
    BadgeAward, ChallengeJoin, ChallengeSubmit,
    ResponseModel, XPEvent,
)

router = APIRouter(prefix="/api/v2", tags=["phase5"])

# Max XP a single client-submitted event may award (anti-abuse). Larger awards
# (badges, challenges) are computed server-side from DB values, not the client.
MAX_XP_PER_EVENT = 1000
# Max rows returnable from a history query in one page.
MAX_HISTORY_LIMIT = 100


# ─────────────────────────────────────────────────────────────
# XP EVENTS
# ─────────────────────────────────────────────────────────────

@router.post("/xp/event", response_model=ResponseModel)
async def record_xp_event(
    event: XPEvent,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Record any XP-earning event: share, badge, portfolio push, etc.
    Also applied offline via /api/sync/drain.
    """
    user_id = current_user["id"]

    # Reject non-positive or abusively large client-supplied awards.
    if event.xp_amount <= 0 or event.xp_amount > MAX_XP_PER_EVENT:
        raise HTTPException(422, f"xp_amount must be between 1 and {MAX_XP_PER_EVENT}")

    # Atomic increment via RPC — avoids the read-then-write race entirely.
    new_points = db.get_service_client().rpc(
        "increment_user_points",
        {"p_user_id": user_id, "p_delta": event.xp_amount},
    ).execute().data

    db.get_service_client().table("xp_events").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "event_type": event.event_type,
        "xp_amount":  event.xp_amount,
        "source_id":  event.source_id,
        "metadata":   event.metadata,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    background_tasks.add_task(_check_badge_triggers, user_id, event.event_type, event.metadata)

    return ResponseModel(data={
        "xp_earned": event.xp_amount,
        "new_points": new_points,
    })


@router.get("/xp/history", response_model=ResponseModel)
async def xp_history(
    limit: int = Query(50, ge=1, le=MAX_HISTORY_LIMIT),
    current_user: dict = Depends(Auth.get_current_user),
):
    result = db.get_service_client().table("xp_events") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()
    return ResponseModel(data=result.data)


# ─────────────────────────────────────────────────────────────
# BADGES
# ─────────────────────────────────────────────────────────────

@router.get("/badges", response_model=ResponseModel)
async def list_all_badges():
    """Return the full badge catalogue."""
    result = db.get_service_client().table("badges").select("*").order("sort_order").execute()
    return ResponseModel(data=result.data)


@router.get("/badges/me", response_model=ResponseModel)
async def my_badges(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("user_badges") \
        .select("*, badge:badges(*)") \
        .eq("user_id", current_user["id"]) \
        .order("earned_at", desc=True) \
        .execute()
    return ResponseModel(data=result.data)


async def award_badge(user_id: str, badge_id: str, reason: str = None):
    """Internal helper — award a badge if not already awarded."""
    existing = db.get_service_client().table("user_badges") \
        .select("id").eq("user_id", user_id).eq("badge_id", badge_id).execute()
    if existing.data:
        return  # Already awarded

    db.get_service_client().table("user_badges").insert({
        "id":        str(uuid.uuid4()),
        "user_id":   user_id,
        "badge_id":  badge_id,
        "reason":    reason,
        "earned_at": datetime.utcnow().isoformat(),
    }).execute()

    # XP bonus for badge
    badge = db.get_service_client().table("badges").select("xp_reward") \
        .eq("id", badge_id).execute()
    if badge.data and badge.data[0].get("xp_reward"):
        xp = badge.data[0]["xp_reward"]
        fresh = db.get_service_client().table("users").select("points") \
            .eq("id", user_id).single().execute().data
        new_pts = (fresh["points"] if fresh else 0) + xp
        db.get_service_client().table("users") \
            .update({"points": new_pts}).eq("id", user_id).execute()

    log.info("Badge awarded", user_id=user_id, badge_id=badge_id)


async def _check_badge_triggers(user_id: str, event_type: str, metadata: dict):
    """Background: check if any event_type triggers a badge."""
    triggers = {
        "first_share":       "social_sharer",
        "portfolio_push":    "portfolio_builder",
        "starknet_tx":       "onchain_citizen",
        "streak_7":          "week_warrior",
        "streak_30":         "month_master",
        "boss_complete":     "boss_slayer",
        "lab_complete":      "lab_grad",
        "track_complete":    "track_certified",
    }
    badge_id = triggers.get(event_type)
    if badge_id:
        await award_badge(user_id, badge_id, reason=event_type)


# ─────────────────────────────────────────────────────────────
# CHALLENGES
# ─────────────────────────────────────────────────────────────

@router.get("/challenges", response_model=ResponseModel)
async def list_challenges(
    status: Optional[str] = "active",
    current_user: dict = Depends(Auth.get_current_user),
):
    q = db.get_service_client().table("challenges").select("*")
    if status:
        q = q.eq("status", status)
    result = q.order("ends_at").execute()
    return ResponseModel(data=result.data)


@router.post("/challenges/join", response_model=ResponseModel)
async def join_challenge(
    body: ChallengeJoin,
    current_user: dict = Depends(Auth.get_current_user),
):
    # Check challenge exists and is active
    challenge = db.get_service_client().table("challenges") \
        .select("*").eq("id", body.challenge_id).eq("status", "active").execute()
    if not challenge.data:
        raise HTTPException(404, "Challenge not found or no longer active")

    # Check not already joined
    existing = db.get_service_client().table("challenge_participants") \
        .select("id").eq("challenge_id", body.challenge_id) \
        .eq("user_id", current_user["id"]).execute()
    if existing.data:
        raise HTTPException(409, "Already joined this challenge")

    db.get_service_client().table("challenge_participants").insert({
        "id":           str(uuid.uuid4()),
        "challenge_id": body.challenge_id,
        "user_id":      current_user["id"],
        "joined_at":    datetime.utcnow().isoformat(),
        "status":       "in_progress",
    }).execute()

    return ResponseModel(data={"joined": True, "challenge_id": body.challenge_id})


@router.post("/challenges/submit", response_model=ResponseModel)
async def submit_challenge(
    body: ChallengeSubmit,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    participant = db.get_service_client().table("challenge_participants") \
        .select("*").eq("challenge_id", body.challenge_id) \
        .eq("user_id", current_user["id"]).execute()
    if not participant.data:
        raise HTTPException(403, "Not a participant in this challenge")

    db.get_service_client().table("challenge_participants") \
        .update({
            "status":       "submitted",
            "submission":   body.submission,
            "submitted_at": datetime.utcnow().isoformat(),
        }) \
        .eq("id", participant.data[0]["id"]).execute()

    background_tasks.add_task(_award_challenge_xp, current_user["id"], body.challenge_id)
    return ResponseModel(data={"submitted": True})


async def _award_challenge_xp(user_id: str, challenge_id: str):
    challenge = db.get_service_client().table("challenges") \
        .select("xp_reward").eq("id", challenge_id).execute()
    if challenge.data and challenge.data[0].get("xp_reward"):
        xp = challenge.data[0]["xp_reward"]
        fresh = db.get_service_client().table("users").select("points") \
            .eq("id", user_id).single().execute().data
        new_pts = (fresh["points"] if fresh else 0) + xp
        db.get_service_client().table("users") \
            .update({"points": new_pts}).eq("id", user_id).execute()


# ─────────────────────────────────────────────────────────────
# MERCHANDISE
# ─────────────────────────────────────────────────────────────

@router.get("/merch", response_model=ResponseModel)
async def list_merch():
    result = db.get_service_client().table("merchandise_items") \
        .select("*").eq("available", True).order("sort_order").execute()
    return ResponseModel(data=result.data)


@router.post("/merch/redeem", response_model=ResponseModel)
async def redeem_merch(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
):
    item_id = body.get("item_id")
    if not item_id:
        raise HTTPException(400, "item_id required")

    item = db.get_service_client().table("merchandise_items") \
        .select("*").eq("id", item_id).eq("available", True).execute()
    if not item.data:
        raise HTTPException(404, "Item not found or unavailable")

    item = item.data[0]
    cost = item["credit_cost"]

    # Atomic check-and-decrement: the RPC only deducts when the user has enough
    # (WHERE merch_credits >= p_amount) and returns the remaining balance, or
    # NULL if insufficient. Avoids the read-then-write race and TOCTOU spend.
    new_credits = db.get_service_client().rpc(
        "decrement_merch_credits",
        {"p_user_id": current_user["id"], "p_amount": cost},
    ).execute().data

    if new_credits is None:
        raise HTTPException(400, f"Insufficient credits: need {cost}")

    order = db.get_service_client().table("merchandise_orders").insert({
        "id":           str(uuid.uuid4()),
        "user_id":      current_user["id"],
        "item_id":      item_id,
        "credits_used": cost,
        "status":       "pending",
        "shipping_info": body.get("shipping_address") or body.get("shipping_info"),
        "created_at":   datetime.utcnow().isoformat(),
    }).execute()

    return ResponseModel(data={
        "order_id":       order.data[0]["id"],
        "credits_spent":  cost,
        "credits_remaining": new_credits,
    })
