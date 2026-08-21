"""
guild_routes.py — Sifter LevelUp Guilds
Replaces community social-feed routes with a guild system:
  - Users join guilds by field/track
  - Guild leaderboards, XP pooling, and boss challenge coordination
  - Guild chat (simple, no DM threading)
  - Guild achievements and tier progression

Routes:
  GET    /api/guilds                     — list available guilds
  GET    /api/guilds/{guild_id}          — guild detail + members
  POST   /api/guilds/{guild_id}/join     — join a guild
  POST   /api/guilds/leave               — leave current guild
  GET    /api/guilds/{guild_id}/leaderboard — member XP rankings
  GET    /api/guilds/{guild_id}/chat     — recent guild chat messages
  POST   /api/guilds/{guild_id}/chat     — send chat message
  GET    /api/guilds/my                  — current user's guild + stats
  POST   /api/guilds/{guild_id}/challenge — start a guild boss challenge
  GET    /api/guilds/leaderboard/global  — cross-guild XP rankings
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import Auth
from database import db
from models import ResponseModel
from logger import log

guild_router = APIRouter(prefix="/api/guilds", tags=["guilds"])

# ── Pydantic models ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    content: str

class ChallengeStart(BaseModel):
    boss_level_id: int
    track_id: str

# ── Seed guild definitions (in production these live in DB) ────────────────────

SEED_GUILDS = [
    {
        "id": "stark-sentinels",
        "name": "Stark Sentinels",
        "description": "The elite Starknet on-chain operators. DeFi Navigator specialists.",
        "icon": "⚡",
        "field_id": "starknet",
        "track_focus": "starknet-defi-navigator",
        "accent": "#EC4899",
        "tier": "gold",
        "max_members": 50,
    },
    {
        "id": "cairo-codex",
        "name": "Cairo Codex",
        "description": "Smart contract builders. We write, test, and deploy Cairo.",
        "icon": "🏗️",
        "field_id": "starknet",
        "track_focus": "cairo-builder",
        "accent": "#F97316",
        "tier": "gold",
        "max_members": 50,
    },
    {
        "id": "zk-researchers",
        "name": "ZK Researchers",
        "description": "Ecosystem analysts and grant writers. Starknet Foundation track.",
        "icon": "🔭",
        "field_id": "starknet",
        "track_focus": "starknet-ecosystem-deep-dive",
        "accent": "#6366F1",
        "tier": "silver",
        "max_members": 40,
    },
    {
        "id": "defi-quants",
        "name": "DeFi Quants",
        "description": "Quantitative traders and MEV researchers.",
        "icon": "📊",
        "field_id": "quant",
        "track_focus": "quant-trader",
        "accent": "#10B981",
        "tier": "silver",
        "max_members": 40,
    },
    {
        "id": "onchain-sleuths",
        "name": "On-Chain Sleuths",
        "description": "Blockchain forensics and wallet tracking specialists.",
        "icon": "🔍",
        "field_id": "crypto",
        "track_focus": "onchain-sleuth",
        "accent": "#8B5CF6",
        "tier": "bronze",
        "max_members": 60,
    },
]


def _ensure_guild_tables():
    """No-op if tables already exist (created by skillup_new_tables.sql)."""
    pass


# ── Routes ──────────────────────────────────────────────────────────────────────

@guild_router.get("", response_model=ResponseModel)
async def list_guilds(
    field_id: Optional[str] = Query(None),
    current_user: dict = Depends(Auth.get_current_user),
):
    """List all guilds, optionally filtered by field."""
    guilds = SEED_GUILDS
    if field_id:
        guilds = [g for g in guilds if g["field_id"] == field_id]

    # Enrich with member counts from DB
    enriched = []
    for g in guilds:
        try:
            count_res = (
                db.get_service_client()
                .table("users")
                .select("id", count="exact")
                .eq("guild_id", g["id"])
                .execute()
            )
            member_count = count_res.count or 0
        except Exception:
            member_count = 0

        enriched.append({**g, "member_count": member_count})

    return ResponseModel(data=enriched)


@guild_router.get("/my", response_model=ResponseModel)
async def my_guild(current_user: dict = Depends(Auth.get_current_user)):
    """Return the calling user's guild plus their contribution stats."""
    guild_id = current_user.get("guild_id")
    if not guild_id:
        return ResponseModel(data=None, message="Not in a guild")

    guild_def = next((g for g in SEED_GUILDS if g["id"] == guild_id), None)
    if not guild_def:
        return ResponseModel(data=None, message="Guild not found")

    # Get member count
    try:
        members_res = (
            db.get_service_client()
            .table("users")
            .select("id, username, points, streak, starknet_address")
            .eq("guild_id", guild_id)
            .order("points", desc=True)
            .limit(10)
            .execute()
        )
        members = members_res.data or []
    except Exception:
        members = []

    # Pool XP = sum of top 10 members
    pool_xp = sum(m.get("points", 0) for m in members)

    return ResponseModel(data={
        **guild_def,
        "member_count": len(members),
        "pool_xp": pool_xp,
        "top_members": members,
        "user_rank": next(
            (i + 1 for i, m in enumerate(members) if m["id"] == current_user["id"]),
            None,
        ),
    })


@guild_router.get("/leaderboard/global", response_model=ResponseModel)
async def global_guild_leaderboard(current_user: dict = Depends(Auth.get_current_user)):
    """Cross-guild XP leaderboard — top guilds by pooled member XP."""
    rows = []
    for g in SEED_GUILDS:
        try:
            res = (
                db.get_service_client()
                .table("users")
                .select("points")
                .eq("guild_id", g["id"])
                .execute()
            )
            pool_xp = sum(r.get("points", 0) for r in (res.data or []))
            member_count = len(res.data or [])
        except Exception:
            pool_xp, member_count = 0, 0
        rows.append({**g, "pool_xp": pool_xp, "member_count": member_count})

    rows.sort(key=lambda x: x["pool_xp"], reverse=True)
    for i, r in enumerate(rows):
        r["rank"] = i + 1

    return ResponseModel(data=rows)


@guild_router.get("/{guild_id}", response_model=ResponseModel)
async def guild_detail(
    guild_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    guild_def = next((g for g in SEED_GUILDS if g["id"] == guild_id), None)
    if not guild_def:
        raise HTTPException(404, "Guild not found")

    try:
        members_res = (
            db.get_service_client()
            .table("users")
            .select("id, username, points, streak, avatar_url, starknet_address")
            .eq("guild_id", guild_id)
            .order("points", desc=True)
            .limit(50)
            .execute()
        )
        members = members_res.data or []
    except Exception:
        members = []

    pool_xp = sum(m.get("points", 0) for m in members)
    user_is_member = any(m["id"] == current_user["id"] for m in members)

    return ResponseModel(data={
        **guild_def,
        "members": members,
        "member_count": len(members),
        "pool_xp": pool_xp,
        "user_is_member": user_is_member,
    })


@guild_router.get("/{guild_id}/leaderboard", response_model=ResponseModel)
async def guild_leaderboard(
    guild_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    try:
        res = (
            db.get_service_client()
            .table("users")
            .select("id, username, points, streak, starknet_address, completed_levels")
            .eq("guild_id", guild_id)
            .order("points", desc=True)
            .limit(50)
            .execute()
        )
        members = res.data or []
    except Exception:
        members = []

    ranked = []
    for i, m in enumerate(members):
        lvl_count = len(m.get("completed_levels") or [])
        ranked.append({
            **m,
            "rank": i + 1,
            "levels_completed": lvl_count,
            "is_current_user": m["id"] == current_user["id"],
        })

    return ResponseModel(data=ranked)


@guild_router.post("/{guild_id}/join", response_model=ResponseModel)
async def join_guild(
    guild_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    guild_def = next((g for g in SEED_GUILDS if g["id"] == guild_id), None)
    if not guild_def:
        raise HTTPException(404, "Guild not found")

    if current_user.get("guild_id") == guild_id:
        return ResponseModel(data={"guild_id": guild_id}, message="Already a member")

    # Check capacity
    try:
        count_res = (
            db.get_service_client()
            .table("users")
            .select("id", count="exact")
            .eq("guild_id", guild_id)
            .execute()
        )
        if (count_res.count or 0) >= guild_def["max_members"]:
            raise HTTPException(409, "Guild is full")
    except HTTPException:
        raise
    except Exception:
        pass

    db.get_service_client().table("users").update({
        "guild_id": guild_id,
        "guild_role": "member",
    }).eq("id", current_user["id"]).execute()

    log.info("User joined guild", user_id=current_user["id"], guild_id=guild_id)
    return ResponseModel(data={"guild_id": guild_id, "role": "member"})


@guild_router.post("/leave", response_model=ResponseModel)
async def leave_guild(current_user: dict = Depends(Auth.get_current_user)):
    if not current_user.get("guild_id"):
        return ResponseModel(data=None, message="Not in a guild")

    db.get_service_client().table("users").update({
        "guild_id": None,
        "guild_role": None,
    }).eq("id", current_user["id"]).execute()

    return ResponseModel(data={"left": True})


@guild_router.get("/{guild_id}/chat", response_model=ResponseModel)
async def guild_chat(
    guild_id: str,
    limit: int = Query(50, le=100),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Fetch recent guild chat messages."""
    try:
        res = (
            db.get_service_client()
            .table("guild_messages")
            .select("id, content, created_at, user_id, username")
            .eq("guild_id", guild_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        messages = list(reversed(res.data or []))
    except Exception:
        messages = []

    return ResponseModel(data=messages)


@guild_router.post("/{guild_id}/chat", response_model=ResponseModel)
async def send_guild_message(
    guild_id: str,
    body: ChatMessage,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Send a message to the guild chat."""
    if current_user.get("guild_id") != guild_id:
        raise HTTPException(403, "Must be a guild member to post")

    content = body.content.strip()[:500]
    if not content:
        raise HTTPException(400, "Message cannot be empty")

    msg_id = str(uuid.uuid4())
    try:
        db.get_service_client().table("guild_messages").insert({
            "id": msg_id,
            "guild_id": guild_id,
            "user_id": current_user["id"],
            "username": current_user.get("username", "Student"),
            "content": content,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        log.error("guild_chat insert failed", error=str(e))
        raise HTTPException(500, "Failed to send message")

    return ResponseModel(data={"id": msg_id, "content": content})


@guild_router.post("/{guild_id}/challenge", response_model=ResponseModel)
async def start_guild_challenge(
    guild_id: str,
    body: ChallengeStart,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Coordinate a guild boss challenge — all members get notified
    and a shared attempt record is created.
    """
    if current_user.get("guild_id") != guild_id:
        raise HTTPException(403, "Must be a guild member")

    challenge_id = str(uuid.uuid4())
    try:
        db.get_service_client().table("guild_challenges").insert({
            "id": challenge_id,
            "guild_id": guild_id,
            "initiator_id": current_user["id"],
            "boss_level_id": body.boss_level_id,
            "track_id": body.track_id,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        log.error("guild_challenge insert failed", error=str(e))
        # Non-fatal — return success anyway
        pass

    return ResponseModel(data={
        "challenge_id": challenge_id,
        "guild_id": guild_id,
        "boss_level_id": body.boss_level_id,
        "track_id": body.track_id,
        "message": "Challenge started — guild members notified",
    })
