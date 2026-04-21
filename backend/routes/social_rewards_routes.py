# ============================================
# Sifter Skill_Up — Social Rewards Routes
# Share tracking · Portfolio attribution
# Social blast · Referral bonuses
# ============================================
import uuid
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel, SocialShare

router = APIRouter(prefix="/api/social", tags=["social-rewards"])

# XP awarded per share event
_SHARE_XP = {
    "twitter":  75,
    "linkedin": 100,
    "github":   50,
    "instagram": 50,
    "tiktok":   75,
    "default":  50,
}

# Max share XP per user per day (anti-farm)
_MAX_SHARE_XP_DAILY = 300


# ─────────────────────────────────────────────────────────────
# Share tracking
# ─────────────────────────────────────────────────────────────

@router.post("/share", response_model=ResponseModel)
async def record_share(
    body: SocialShare,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Record a share event and award XP.
    Called by the app after the user taps share and the OS share sheet fires.
    """
    user_id = current_user["id"]
    today   = datetime.utcnow().date().isoformat()

    # Check daily share XP cap
    today_shares = db.get_service_client().table("social_shares") \
        .select("xp_awarded") \
        .eq("user_id", user_id) \
        .gte("created_at", f"{today}T00:00:00") \
        .execute()

    today_xp = sum(s.get("xp_awarded", 0) for s in (today_shares.data or []))
    xp_rate  = _SHARE_XP.get(body.platform.lower(), _SHARE_XP["default"])
    xp_to_award = min(xp_rate, max(0, _MAX_SHARE_XP_DAILY - today_xp))

    share_id = str(uuid.uuid4())
    db.get_service_client().table("social_shares").insert({
        "id":           share_id,
        "user_id":      user_id,
        "platform":     body.platform,
        "content_type": body.content_type,
        "content_id":   body.content_id,
        "url":          body.url,
        "xp_awarded":   xp_to_award,
        "created_at":   datetime.utcnow().isoformat(),
    }).execute()

    if xp_to_award > 0:
        background_tasks.add_task(_apply_share_xp, user_id, xp_to_award, share_id)

    return ResponseModel(data={
        "share_id":    share_id,
        "xp_awarded":  xp_to_award,
        "capped":      xp_to_award < xp_rate,
    })


async def _apply_share_xp(user_id: str, xp: int, share_id: str):
    fresh = db.get_service_client().table("users").select("points") \
        .eq("id", user_id).single().execute().data
    if not fresh:
        return
    new_pts = fresh["points"] + xp
    db.get_service_client().table("users") \
        .update({"points": new_pts}).eq("id", user_id).execute()

    db.get_service_client().table("xp_events").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "event_type": "social_share",
        "xp_amount":  xp,
        "source_id":  share_id,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    log.info("Share XP applied", user_id=user_id, xp=xp)


@router.get("/shares/me", response_model=ResponseModel)
async def my_shares(
    limit: int = 20,
    current_user: dict = Depends(Auth.get_current_user),
):
    result = db.get_service_client().table("social_shares") \
        .select("*").eq("user_id", current_user["id"]) \
        .order("created_at", desc=True).limit(limit).execute()
    return ResponseModel(data=result.data)


# ─────────────────────────────────────────────────────────────
# Portfolio attribution
# Records that a portfolio push happened and adds the
# "Built on Sifter Skill_Up" attribution badge to the user.
# ─────────────────────────────────────────────────────────────

@router.post("/portfolio/attribution", response_model=ResponseModel)
async def record_portfolio_attribution(
    body: dict,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Call after a successful portfolio push to any platform.
    Awards XP, records the attribution event, unlocks badge.
    """
    user_id  = current_user["id"]
    platform = body.get("platform", "github")
    url      = body.get("url", "")
    track_id = body.get("track_id", current_user.get("active_track", "unknown"))

    db.get_service_client().table("portfolio_attributions").insert({
        "id":          str(uuid.uuid4()),
        "user_id":     user_id,
        "platform":    platform,
        "url":         url,
        "track_id":    track_id,
        "created_at":  datetime.utcnow().isoformat(),
    }).execute()

    # Award 200 XP for first push to each platform
    existing = db.get_service_client().table("portfolio_attributions") \
        .select("id").eq("user_id", user_id).eq("platform", platform) \
        .execute()
    first_push = len(existing.data) == 1  # the one we just inserted

    xp = 200 if first_push else 50
    background_tasks.add_task(_apply_attribution_xp, user_id, xp, platform)

    return ResponseModel(data={
        "attribution_recorded": True,
        "platform": platform,
        "xp_awarded": xp,
        "first_push": first_push,
    })


async def _apply_attribution_xp(user_id: str, xp: int, platform: str):
    fresh = db.get_service_client().table("users").select("points") \
        .eq("id", user_id).single().execute().data
    if not fresh:
        return
    new_pts = fresh["points"] + xp
    db.get_service_client().table("users") \
        .update({"points": new_pts}).eq("id", user_id).execute()
    log.info("Portfolio attribution XP applied", user_id=user_id, platform=platform, xp=xp)


# ─────────────────────────────────────────────────────────────
# Social blast — post artifact to multiple platforms at once
# ─────────────────────────────────────────────────────────────

@router.post("/blast", response_model=ResponseModel)
async def social_blast(
    body: dict,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Share a portfolio artifact or achievement to multiple platforms.
    The client handles the actual OAuth posting; this records it server-side.
    """
    platforms  = body.get("platforms", [])
    content    = body.get("content", "")
    content_id = body.get("content_id", "")
    content_type = body.get("content_type", "achievement")

    if not platforms:
        raise HTTPException(400, "At least one platform required")

    total_xp = 0
    for platform in platforms:
        xp_per = _SHARE_XP.get(platform.lower(), _SHARE_XP["default"])
        db.get_service_client().table("social_shares").insert({
            "id":           str(uuid.uuid4()),
            "user_id":      current_user["id"],
            "platform":     platform,
            "content_type": content_type,
            "content_id":   content_id,
            "xp_awarded":   xp_per,
            "created_at":   datetime.utcnow().isoformat(),
        }).execute()
        total_xp += xp_per

    # Cap total blast XP at 200
    total_xp = min(total_xp, 200)
    background_tasks.add_task(
        _apply_share_xp, current_user["id"], total_xp, f"blast-{content_id}"
    )

    return ResponseModel(data={
        "platforms_blasted": platforms,
        "xp_awarded":        total_xp,
    })


# ─────────────────────────────────────────────────────────────
# Referral
# ─────────────────────────────────────────────────────────────

@router.post("/referral/apply", response_model=ResponseModel)
async def apply_referral(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Apply a referral code. Awards XP to both referrer and referee."""
    code = (body.get("code") or "").strip().upper()
    if not code:
        raise HTTPException(400, "Referral code required")

    # Find the referrer
    referrer = db.get_service_client().table("users") \
        .select("id, points, referral_code").eq("referral_code", code).execute()
    if not referrer.data:
        raise HTTPException(404, "Referral code not found")

    referrer_user = referrer.data[0]
    if referrer_user["id"] == current_user["id"]:
        raise HTTPException(400, "Cannot use your own referral code")

    # Check not already applied
    existing = db.get_service_client().table("referrals") \
        .select("id").eq("referee_id", current_user["id"]).execute()
    if existing.data:
        raise HTTPException(409, "Referral already applied")

    # Record referral
    db.get_service_client().table("referrals").insert({
        "id":           str(uuid.uuid4()),
        "referrer_id":  referrer_user["id"],
        "referee_id":   current_user["id"],
        "code":         code,
        "created_at":   datetime.utcnow().isoformat(),
    }).execute()

    # Award XP to both
    REFERRER_XP = 500
    REFEREE_XP  = 250

    for uid, xp in [(referrer_user["id"], REFERRER_XP), (current_user["id"], REFEREE_XP)]:
        fresh = db.get_service_client().table("users").select("points") \
            .eq("id", uid).single().execute().data
        if fresh:
            db.get_service_client().table("users") \
                .update({"points": fresh["points"] + xp}).eq("id", uid).execute()

    return ResponseModel(data={
        "referral_applied": True,
        "xp_awarded": REFEREE_XP,
        "referrer_xp": REFERRER_XP,
    })
