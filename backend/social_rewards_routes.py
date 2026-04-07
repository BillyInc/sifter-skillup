# ============================================
# Sifter Skill_Up — Social Rewards Routes
# Share tracking · Portfolio attribution
# Social blast · Referral bonuses
# ============================================
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import Auth
from database import db
from logger import log
from models import (
    PortfolioAttribution,
    ReferralApply,
    ResponseModel,
    SocialBlast,
    SocialShare,
)

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

# Max share XP per user per day (anti-farm) — enforced atomically server-side
_MAX_SHARE_XP_DAILY = 300


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _try_award_social(user_id: str, request: int) -> int:
    """Atomic, daily-capped social XP grant. Returns actual XP granted."""
    res = db.get_service_client().rpc(
        "try_award_social_xp",
        {
            "p_user_id": user_id,
            "p_request": request,
            "p_max":     _MAX_SHARE_XP_DAILY,
        },
    ).execute()
    return int(res.data or 0)


def _increment_points(user_id: str, delta: int) -> Optional[int]:
    res = db.get_service_client().rpc(
        "increment_user_points",
        {"p_user_id": user_id, "p_delta": delta},
    ).execute()
    return res.data


# ─────────────────────────────────────────────────────────────
# Share tracking
# ─────────────────────────────────────────────────────────────

@router.post("/share", response_model=ResponseModel)
async def record_share(
    body: SocialShare,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Record a share event and award XP.
    Called by the app after the user taps share and the OS share sheet fires.
    """
    user_id = current_user["id"]
    xp_rate = _SHARE_XP.get(body.platform.lower(), _SHARE_XP["default"])

    # Atomic daily-capped grant — single round-trip, no race
    xp_to_award = _try_award_social(user_id, xp_rate)

    share_id = str(uuid.uuid4())
    db.get_service_client().table("social_shares").insert({
        "id":           share_id,
        "user_id":      user_id,
        "platform":     body.platform,
        "content_type": body.content_type,
        "content_id":   body.content_id,
        "url":          body.url,
        "xp_awarded":   xp_to_award,
        "created_at":   _now_iso(),
    }).execute()

    if xp_to_award > 0:
        db.get_service_client().table("xp_events").insert({
            "id":         str(uuid.uuid4()),
            "user_id":    user_id,
            "event_type": "social_share",
            "xp_amount":  xp_to_award,
            "source_id":  share_id,
            "created_at": _now_iso(),
        }).execute()
        log.info("Share XP applied", user_id=user_id, xp=xp_to_award)

    return ResponseModel(data={
        "share_id":   share_id,
        "xp_awarded": xp_to_award,
        "capped":     xp_to_award < xp_rate,
    })


@router.get("/shares/me", response_model=ResponseModel)
async def my_shares(
    limit: int = Query(20, ge=1, le=100),
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
    body: PortfolioAttribution,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Call after a successful portfolio push to any platform.
    Awards XP, records the attribution event, unlocks badge.
    """
    user_id  = current_user["id"]
    platform = body.platform
    url      = body.url
    track_id = current_user.get("active_track", "unknown")

    db.get_service_client().table("portfolio_attributions").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "platform":   platform,
        "url":        url,
        "track_id":   track_id,
        "created_at": _now_iso(),
    }).execute()

    # Award 200 XP for first push to each platform
    existing = db.get_service_client().table("portfolio_attributions") \
        .select("id").eq("user_id", user_id).eq("platform", platform) \
        .execute()
    first_push = len(existing.data) == 1  # the one we just inserted

    xp = 200 if first_push else 50
    new_pts = _increment_points(user_id, xp)
    log.info("Portfolio attribution XP applied", user_id=user_id, platform=platform, xp=xp)

    return ResponseModel(data={
        "attribution_recorded": True,
        "platform":   platform,
        "xp_awarded": xp,
        "first_push": first_push,
        "new_points": new_pts,
    })


# ─────────────────────────────────────────────────────────────
# Social blast — post artifact to multiple platforms at once
# ─────────────────────────────────────────────────────────────

@router.post("/blast", response_model=ResponseModel)
async def social_blast(
    body: SocialBlast,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Share a portfolio artifact or achievement to multiple platforms.
    The client handles the actual OAuth posting; this records it server-side.
    """
    user_id = current_user["id"]

    # Compute requested XP (sum across platforms) — RPC enforces daily cap atomically
    requested = sum(
        _SHARE_XP.get(p.lower(), _SHARE_XP["default"]) for p in body.platforms
    )
    granted = _try_award_social(user_id, requested)

    # Insert one share row per platform; xp_awarded distributed proportionally
    per_platform_xp = (granted // len(body.platforms)) if body.platforms else 0
    leftover = granted - per_platform_xp * len(body.platforms)

    for idx, platform in enumerate(body.platforms):
        share_xp = per_platform_xp + (leftover if idx == 0 else 0)
        db.get_service_client().table("social_shares").insert({
            "id":           str(uuid.uuid4()),
            "user_id":      user_id,
            "platform":     platform,
            "content_type": body.content_type,
            "content_id":   body.content_id,
            "xp_awarded":   share_xp,
            "created_at":   _now_iso(),
        }).execute()

    if granted > 0:
        db.get_service_client().table("xp_events").insert({
            "id":         str(uuid.uuid4()),
            "user_id":    user_id,
            "event_type": "social_blast",
            "xp_amount":  granted,
            "source_id":  f"blast-{body.content_id}",
            "created_at": _now_iso(),
        }).execute()

    return ResponseModel(data={
        "platforms_blasted": body.platforms,
        "xp_awarded":        granted,
        "capped":             granted < requested,
    })


# ─────────────────────────────────────────────────────────────
# Referral
# ─────────────────────────────────────────────────────────────

@router.post("/referral/apply", response_model=ResponseModel)
async def apply_referral(
    body: ReferralApply,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Apply a referral code. Awards XP to both referrer and referee."""
    # Normalize to lowercase — DB stores referral codes lowercase (UUID-style)
    code = body.code.strip().lower()
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
        "id":          str(uuid.uuid4()),
        "referrer_id": referrer_user["id"],
        "referee_id":  current_user["id"],
        "code":        code,
        "created_at":  _now_iso(),
    }).execute()

    # Award XP to both — atomic via RPC
    REFERRER_XP = 500
    REFEREE_XP  = 250

    _increment_points(referrer_user["id"], REFERRER_XP)
    _increment_points(current_user["id"], REFEREE_XP)

    return ResponseModel(data={
        "referral_applied": True,
        "xp_awarded":  REFEREE_XP,
        "referrer_xp": REFERRER_XP,
    })
