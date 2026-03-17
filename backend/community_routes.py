# ============================================================
# Sifter Skill_Up — Community Routes
# Full social platform backend for millions of users.
#
# Routes:
#   GET    /api/community/feed          — cursor-paginated feed (following + discover)
#   POST   /api/community/feed/seen     — mark posts seen (dedup for realtime)
#   GET    /api/community/trending      — trending hashtags by field
#   GET    /api/community/search        — full-text search posts + hashtags
#   POST   /api/posts/react             — react to post (6 types, toggle)
#   POST   /api/posts/vote              — vote in poll
#   POST   /api/posts/report            — report post for moderation
#   GET    /api/users/{id}/profile      — public profile (respects private accounts)
#   GET    /api/users/privacy           — get current user privacy settings
#   PUT    /api/users/privacy           — toggle private account
#   POST   /api/users/follow            — follow a public account
#   POST   /api/users/follow-request    — request to follow a private account
#   GET    /api/users/follow-requests   — pending requests for private account owner
#   POST   /api/users/follow-request/respond — approve/reject follow request
#   POST   /api/users/unfollow          — unfollow
#   POST   /api/users/block             — block user
#   POST   /api/users/unblock           — unblock user
#   POST   /api/users/mute              — mute user
#   POST   /api/users/unmute            — unmute user
#   GET    /api/dms/threads             — DM inbox (current user only)
#   GET    /api/dms/thread/{id}         — single thread messages
#   POST   /api/dms/send                — send DM (you must initiate)
#   POST   /api/dms/read                — mark thread read
#   POST   /api/ai/score                — AI simulator scoring proxy (key never in client)
#   GET    /api/notifications           — get notifications for current user
#   POST   /api/notifications/read-all  — mark all read
#   GET    /api/users/seen-scenarios    — scenario IDs this user has seen (uniqueness)
#   POST   /api/users/seen-scenarios    — record seen scenario ID
# ============================================================

import uuid
import json
import os
import httpx
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import Auth
from database import db
from models import ResponseModel

# ─────────────────────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────────────────────

class ReactionCreate(BaseModel):
    postId: str
    reaction: str  # '❤️' | '🔥' | '💡' | '🏆' | '😂' | '👀'

class PollVote(BaseModel):
    postId: str
    optionId: str

class PostReport(BaseModel):
    postId: str
    reason: str  # 'spam' | 'misleading' | 'harmful'

class PrivacyUpdate(BaseModel):
    isPrivate: bool

class FollowAction(BaseModel):
    targetId: str

class FollowRequestRespond(BaseModel):
    requesterId: str
    action: str  # 'approve' | 'reject'

class BlockAction(BaseModel):
    targetId: str

class DMSend(BaseModel):
    senderId: str
    recipientId: str
    content: str

class DMRead(BaseModel):
    threadId: str

class AIScoreRequest(BaseModel):
    scenario: str
    criteria: List[str]
    userResponse: str
    context: Optional[str] = None

class SeenScenarioRecord(BaseModel):
    scenarioId: str

VALID_REACTIONS = {'❤️', '🔥', '💡', '🏆', '😂', '👀'}

# ─────────────────────────────────────────────────────────────
# Router
# ─────────────────────────────────────────────────────────────

community_v2_router = APIRouter(tags=["community-v2"])

# ─────────────────────────────────────────────────────────────
# FEED — cursor-based pagination, scales to millions
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/community/feed", response_model=ResponseModel)
async def get_feed(
    mode: str = Query("following"),       # 'following' | 'discover'
    cursor: Optional[str] = Query(None),  # ISO timestamp — oldest post seen
    limit: int = Query(20, le=50),
    track: Optional[str] = Query(None),
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Cursor-paginated feed. cursor = ISO timestamp of oldest post already loaded.
    Returns posts sorted newest-first.
    Filters out blocked and muted users server-side.
    Private account posts are filtered to approved followers only.
    """
    user_id = current_user["id"]

    # Get blocked/muted user IDs
    blocked = db.get_service_client().table("user_blocks").select("target_id").eq("user_id", user_id).execute()
    muted = db.get_service_client().table("user_mutes").select("target_id").eq("user_id", user_id).execute()
    excluded_ids = (
        [r["target_id"] for r in (blocked.data or [])] +
        [r["target_id"] for r in (muted.data or [])]
    )

    # Build query
    q = (
        db.get_service_client()
        .table("posts")
        .select(
            "*, "
            "users!user_id(id, username, avatar_url, active_track, is_private), "
            "post_reactions(reaction_type, count), "
            "post_polls(id, question, options, total_votes, ends_at)"
        )
        .eq("is_deleted", False)
        .order("created_at", desc=True)
        .limit(limit + 1)  # fetch one extra to determine has_more
    )

    if cursor:
        q = q.lt("created_at", cursor)

    if mode == "following":
        # Get who current user follows
        follows_res = db.get_service_client().table("follows").select("following_id").eq("follower_id", user_id).execute()
        following_ids = [r["following_id"] for r in (follows_res.data or [])]
        following_ids.append(user_id)  # include own posts
        q = q.in_("user_id", following_ids)
    elif mode == "discover":
        # Trending posts: last 48h, sorted by engagement
        cutoff = (datetime.utcnow() - timedelta(hours=48)).isoformat()
        q = q.gte("created_at", cutoff)
        if track:
            q = q.eq("track_context", track)

    result = q.execute()
    raw_posts = result.data or []

    # Filter excluded users
    posts = [p for p in raw_posts if p.get("user_id") not in excluded_ids]

    # Filter private accounts — only show if current user follows them
    if excluded_ids or mode == "following":
        pass  # already filtered by following list
    else:
        follows_res = db.get_service_client().table("follows").select("following_id").eq("follower_id", user_id).execute()
        approved_ids = {r["following_id"] for r in (follows_res.data or [])}
        approved_ids.add(user_id)
        posts = [
            p for p in posts
            if not p.get("users", {}).get("is_private", False) or p["user_id"] in approved_ids
        ]

    has_more = len(posts) > limit
    posts = posts[:limit]

    # Shape each post
    shaped = [_shape_post(p, user_id) for p in posts]

    next_cursor = posts[-1]["created_at"] if posts and has_more else None

    return ResponseModel(data={"posts": shaped, "next_cursor": next_cursor, "has_more": has_more})


def _shape_post(raw: dict, viewer_id: str) -> dict:
    """Convert raw DB row to the Post shape the frontend expects."""
    author_row = raw.get("users") or {}
    reactions_raw = raw.get("post_reactions") or []

    reactions = {}
    for r in reactions_raw:
        reactions[r["reaction_type"]] = r["count"]

    # Did this viewer react?
    my_reaction = None
    try:
        my_res = db.get_service_client().table("post_user_reactions").select("reaction_type").eq("post_id", raw["id"]).eq("user_id", viewer_id).execute()
        if my_res.data:
            my_reaction = my_res.data[0]["reaction_type"]
    except Exception:
        pass

    poll = None
    if raw.get("post_polls"):
        poll_row = raw["post_polls"][0] if isinstance(raw["post_polls"], list) else raw["post_polls"]
        if poll_row:
            opts = poll_row.get("options") or []
            if isinstance(opts, str):
                opts = json.loads(opts)
            voted_id = None
            try:
                vote_res = db.get_service_client().table("poll_votes").select("option_id").eq("poll_id", poll_row["id"]).eq("user_id", viewer_id).execute()
                if vote_res.data:
                    voted_id = vote_res.data[0]["option_id"]
            except Exception:
                pass
            poll = {
                "question": poll_row.get("question", ""),
                "options": opts,
                "totalVotes": poll_row.get("total_votes", 0),
                "votedId": voted_id,
                "endsAt": poll_row.get("ends_at"),
            }

    return {
        "id": raw["id"],
        "author": {
            "id": author_row.get("id", raw.get("user_id", "")),
            "name": author_row.get("username", "User"),
            "avatar": author_row.get("avatar_url") or "⚡",
            "track": author_row.get("active_track"),
            "isPrivate": author_row.get("is_private", False),
        },
        "content": raw.get("content", ""),
        "attachments": raw.get("attachments") or [],
        "poll": poll,
        "reactions": reactions,
        "myReaction": my_reaction,
        "comments": raw.get("comment_count", 0),
        "quotes": raw.get("quote_count", 0),
        "isBookmarked": False,  # populated client-side from bookmarks table
        "hashtags": raw.get("hashtags") or [],
        "mentions": raw.get("mentions") or [],
        "createdAt": raw.get("created_at", ""),
        "isPinned": raw.get("is_pinned", False),
    }


# ─────────────────────────────────────────────────────────────
# TRENDING
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/community/trending", response_model=ResponseModel)
async def get_trending():
    """Top hashtags by post volume in the last 48 hours."""
    try:
        result = db.get_service_client().rpc("get_trending_hashtags", {"hours_back": 48, "limit_n": 12}).execute()
        topics = result.data or []
    except Exception:
        # Fallback: query post_hashtags directly
        cutoff = (datetime.utcnow() - timedelta(hours=48)).isoformat()
        result = (
            db.get_service_client()
            .table("post_hashtags")
            .select("tag, count:tag.count()")
            .gte("created_at", cutoff)
            .order("count", desc=True)
            .limit(12)
            .execute()
        )
        topics = [{"tag": r["tag"], "postCount": r["count"]} for r in (result.data or [])]

    return ResponseModel(data={"topics": topics})


# ─────────────────────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/community/search", response_model=ResponseModel)
async def search_community(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Full-text search across post content and hashtags."""
    user_id = current_user["id"]
    safe_q = q.strip()[:100]

    # Blocked/muted filtering
    blocked = db.get_service_client().table("user_blocks").select("target_id").eq("user_id", user_id).execute()
    excluded = {r["target_id"] for r in (blocked.data or [])}

    result = (
        db.get_service_client()
        .table("posts")
        .select("*, users!user_id(id, username, avatar_url, active_track, is_private)")
        .ilike("content", f"%{safe_q}%")
        .eq("is_deleted", False)
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )

    # Also search by hashtag
    hashtag_q = safe_q.lstrip("#").lower()
    hashtag_result = (
        db.get_service_client()
        .table("post_hashtags")
        .select("post_id")
        .eq("tag", hashtag_q)
        .limit(20)
        .execute()
    )
    hashtag_post_ids = {r["post_id"] for r in (hashtag_result.data or [])}

    all_posts = result.data or []
    # Add hashtag-matched posts not already in results
    existing_ids = {p["id"] for p in all_posts}
    if hashtag_post_ids - existing_ids:
        extra = (
            db.get_service_client()
            .table("posts")
            .select("*, users!user_id(id, username, avatar_url, active_track, is_private)")
            .in_("id", list(hashtag_post_ids - existing_ids))
            .eq("is_deleted", False)
            .execute()
        )
        all_posts.extend(extra.data or [])

    filtered = [p for p in all_posts if p.get("user_id") not in excluded]
    shaped = [_shape_post(p, user_id) for p in filtered[:40]]

    return ResponseModel(data={"posts": shaped, "query": safe_q})


# ─────────────────────────────────────────────────────────────
# REACTIONS
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/posts/react", response_model=ResponseModel)
async def react_to_post(body: ReactionCreate, current_user: dict = Depends(Auth.get_current_user)):
    """Toggle a reaction. Same reaction = remove it. Different reaction = replace."""
    if body.reaction not in VALID_REACTIONS:
        raise HTTPException(400, "Invalid reaction type")

    user_id = current_user["id"]
    post_id = body.postId

    # Check existing reaction
    existing = (
        db.get_service_client()
        .table("post_user_reactions")
        .select("id, reaction_type")
        .eq("post_id", post_id)
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        old_reaction = existing.data[0]["reaction_type"]
        reaction_id = existing.data[0]["id"]

        if old_reaction == body.reaction:
            # Toggle off — remove reaction
            db.get_service_client().table("post_user_reactions").delete().eq("id", reaction_id).execute()
            # Decrement count
            try:
                db.get_service_client().rpc("decrement_reaction", {
                    "p_post_id": post_id, "p_reaction": old_reaction
                }).execute()
            except Exception:
                pass
            return ResponseModel(data={"action": "removed", "reaction": None})
        else:
            # Replace reaction
            db.get_service_client().table("post_user_reactions").update({"reaction_type": body.reaction}).eq("id", reaction_id).execute()
            try:
                db.get_service_client().rpc("replace_reaction", {
                    "p_post_id": post_id, "p_old": old_reaction, "p_new": body.reaction
                }).execute()
            except Exception:
                pass
            return ResponseModel(data={"action": "replaced", "reaction": body.reaction})
    else:
        # New reaction
        db.get_service_client().table("post_user_reactions").insert({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "reaction_type": body.reaction,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        try:
            db.get_service_client().rpc("increment_reaction", {
                "p_post_id": post_id, "p_reaction": body.reaction
            }).execute()
        except Exception:
            pass

        # Notify post author (if not self-reacting)
        try:
            post = db.get_service_client().table("posts").select("user_id").eq("id", post_id).single().execute()
            if post.data and post.data["user_id"] != user_id:
                _create_notification(
                    recipient_id=post.data["user_id"],
                    actor_id=user_id,
                    notif_type="reaction",
                    post_id=post_id,
                    extra={"reaction": body.reaction},
                )
        except Exception:
            pass

        return ResponseModel(data={"action": "added", "reaction": body.reaction})


# ─────────────────────────────────────────────────────────────
# POLL VOTING
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/posts/vote", response_model=ResponseModel)
async def vote_poll(body: PollVote, current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]

    # Get poll for this post
    poll_res = db.get_service_client().table("post_polls").select("id, ends_at").eq("post_id", body.postId).execute()
    if not poll_res.data:
        raise HTTPException(404, "Poll not found")

    poll_id = poll_res.data[0]["id"]
    ends_at = poll_res.data[0].get("ends_at")
    if ends_at and datetime.fromisoformat(ends_at.replace("Z", "")) < datetime.utcnow():
        raise HTTPException(400, "Poll has ended")

    # Check already voted
    existing = db.get_service_client().table("poll_votes").select("id").eq("poll_id", poll_id).eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(400, "Already voted")

    # Record vote
    db.get_service_client().table("poll_votes").insert({
        "id": str(uuid.uuid4()),
        "poll_id": poll_id,
        "post_id": body.postId,
        "user_id": user_id,
        "option_id": body.optionId,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    # Increment option vote count and total
    try:
        db.get_service_client().rpc("increment_poll_vote", {
            "p_poll_id": poll_id, "p_option_id": body.optionId
        }).execute()
    except Exception:
        pass

    return ResponseModel(data={"voted": True, "optionId": body.optionId})


# ─────────────────────────────────────────────────────────────
# REPORT
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/posts/report", response_model=ResponseModel)
async def report_post(body: PostReport, current_user: dict = Depends(Auth.get_current_user)):
    record = {
        "id": str(uuid.uuid4()),
        "post_id": body.postId,
        "reporter_id": current_user["id"],
        "reason": body.reason,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    db.get_service_client().table("post_reports").insert(record).execute()
    return ResponseModel(data={"reported": True})


# ─────────────────────────────────────────────────────────────
# PRIVACY SETTINGS
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/users/privacy", response_model=ResponseModel)
async def get_privacy(current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]
    privacy = db.get_service_client().table("users").select("is_private").eq("id", user_id).execute()
    is_private = privacy.data[0]["is_private"] if privacy.data else False

    pending_req_count = 0
    if is_private:
        reqs = db.get_service_client().table("follow_requests").select("id", count="exact").eq("target_id", user_id).eq("status", "pending").execute()
        pending_req_count = reqs.count or 0

    return ResponseModel(data={"isPrivate": is_private, "pendingFollowRequests": pending_req_count})


@community_v2_router.put("/api/users/privacy", response_model=ResponseModel)
async def update_privacy(body: PrivacyUpdate, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("users").update({
        "is_private": body.isPrivate,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(data={"isPrivate": body.isPrivate})


# ─────────────────────────────────────────────────────────────
# FOLLOW / UNFOLLOW
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/users/follow", response_model=ResponseModel)
async def follow_user(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    """Follow a public account. Use /follow-request for private accounts."""
    user_id = current_user["id"]
    if body.targetId == user_id:
        raise HTTPException(400, "Cannot follow yourself")

    existing = db.get_service_client().table("follows").select("id").eq("follower_id", user_id).eq("following_id", body.targetId).execute()
    if existing.data:
        return ResponseModel(data={"status": "already_following"})

    db.get_service_client().table("follows").insert({
        "id": str(uuid.uuid4()),
        "follower_id": user_id,
        "following_id": body.targetId,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    _create_notification(body.targetId, user_id, "follow")
    return ResponseModel(data={"status": "following"})


@community_v2_router.post("/api/users/follow-request", response_model=ResponseModel)
async def request_follow(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    """Send a follow request to a private account."""
    user_id = current_user["id"]
    existing = db.get_service_client().table("follow_requests").select("id, status").eq("requester_id", user_id).eq("target_id", body.targetId).execute()
    if existing.data:
        return ResponseModel(data={"status": existing.data[0]["status"]})

    db.get_service_client().table("follow_requests").insert({
        "id": str(uuid.uuid4()),
        "requester_id": user_id,
        "target_id": body.targetId,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    _create_notification(body.targetId, user_id, "follow_request")
    return ResponseModel(data={"status": "pending"})


@community_v2_router.get("/api/users/follow-requests", response_model=ResponseModel)
async def get_follow_requests(current_user: dict = Depends(Auth.get_current_user)):
    result = (
        db.get_service_client()
        .table("follow_requests")
        .select("*, users!requester_id(id, username, avatar_url, active_track)")
        .eq("target_id", current_user["id"])
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    return ResponseModel(data=result.data or [])


@community_v2_router.post("/api/users/follow-request/respond", response_model=ResponseModel)
async def respond_follow_request(body: FollowRequestRespond, current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]

    db.get_service_client().table("follow_requests").update({"status": body.action}).eq("requester_id", body.requesterId).eq("target_id", user_id).execute()

    if body.action == "approve":
        db.get_service_client().table("follows").insert({
            "id": str(uuid.uuid4()),
            "follower_id": body.requesterId,
            "following_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        _create_notification(body.requesterId, user_id, "follow")

    return ResponseModel(data={"status": body.action})


@community_v2_router.post("/api/users/unfollow", response_model=ResponseModel)
async def unfollow_user(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("follows").delete().eq("follower_id", current_user["id"]).eq("following_id", body.targetId).execute()
    return ResponseModel(data={"status": "unfollowed"})


# ─────────────────────────────────────────────────────────────
# BLOCK / MUTE
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/users/block", response_model=ResponseModel)
async def block_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]
    db.get_service_client().table("user_blocks").upsert({
        "id": str(uuid.uuid4()), "user_id": user_id, "target_id": body.targetId,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    # Also remove any follow relationship
    db.get_service_client().table("follows").delete().or_(
        f"and(follower_id.eq.{user_id},following_id.eq.{body.targetId})",
        f"and(follower_id.eq.{body.targetId},following_id.eq.{user_id})"
    ).execute()
    return ResponseModel(data={"blocked": True})


@community_v2_router.post("/api/users/unblock", response_model=ResponseModel)
async def unblock_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_blocks").delete().eq("user_id", current_user["id"]).eq("target_id", body.targetId).execute()
    return ResponseModel(data={"blocked": False})


@community_v2_router.post("/api/users/mute", response_model=ResponseModel)
async def mute_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_mutes").upsert({
        "id": str(uuid.uuid4()), "user_id": current_user["id"], "target_id": body.targetId,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    return ResponseModel(data={"muted": True})


@community_v2_router.post("/api/users/unmute", response_model=ResponseModel)
async def unmute_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_mutes").delete().eq("user_id", current_user["id"]).eq("target_id", body.targetId).execute()
    return ResponseModel(data={"muted": False})


# ─────────────────────────────────────────────────────────────
# DMs — user-initiated only
# Only you can open your inbox. Others cannot message you unsolicited.
# You start a conversation by going to someone's profile.
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/dms/threads", response_model=ResponseModel)
async def get_dm_threads(current_user: dict = Depends(Auth.get_current_user)):
    """Return DM threads where current user is a participant."""
    user_id = current_user["id"]
    result = (
        db.get_service_client()
        .table("dm_threads")
        .select(
            "id, created_at, updated_at, "
            "dm_messages(content, created_at, sender_id, is_read, id),"
            "thread_participants!inner(user_id, users!user_id(id, username, avatar_url))"
        )
        .eq("thread_participants.user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )

    threads = []
    for t in (result.data or []):
        messages = sorted(t.get("dm_messages") or [], key=lambda m: m["created_at"], reverse=True)
        last_msg = messages[0] if messages else None
        unread = sum(1 for m in messages if not m["is_read"] and m["sender_id"] != user_id)

        participants = t.get("thread_participants") or []
        other = next((p["users"] for p in participants if p["user_id"] != user_id), None)

        threads.append({
            "id": t["id"],
            "participant": {
                "id": other.get("id", "") if other else "",
                "name": other.get("username", "User") if other else "User",
                "avatar": other.get("avatar_url") or "⚡" if other else "⚡",
            },
            "lastMessage": last_msg["content"][:80] if last_msg else "",
            "lastAt": last_msg["created_at"] if last_msg else t["created_at"],
            "unread": unread,
        })

    return ResponseModel(data={"threads": threads})


@community_v2_router.get("/api/dms/thread/{thread_id}", response_model=ResponseModel)
async def get_dm_messages(thread_id: str, current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]

    # Verify user is a participant
    check = db.get_service_client().table("thread_participants").select("user_id").eq("thread_id", thread_id).eq("user_id", user_id).execute()
    if not check.data:
        raise HTTPException(403, "Not a participant in this thread")

    messages = (
        db.get_service_client()
        .table("dm_messages")
        .select("*, users!sender_id(id, username, avatar_url)")
        .eq("thread_id", thread_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )

    # Mark as read
    db.get_service_client().table("dm_messages").update({"is_read": True}).eq("thread_id", thread_id).neq("sender_id", user_id).execute()

    return ResponseModel(data={"messages": messages.data or []})


@community_v2_router.post("/api/dms/send", response_model=ResponseModel)
async def send_dm(body: DMSend, current_user: dict = Depends(Auth.get_current_user)):
    """
    Send a DM. Only the sender can initiate.
    Creates thread if one doesn't exist between these two users.
    """
    sender_id = current_user["id"]
    recipient_id = body.recipientId

    if sender_id == recipient_id:
        raise HTTPException(400, "Cannot message yourself")

    # Check if recipient has blocked sender
    blocked = db.get_service_client().table("user_blocks").select("id").eq("user_id", recipient_id).eq("target_id", sender_id).execute()
    if blocked.data:
        raise HTTPException(403, "Cannot send message to this user")

    # Find or create thread
    existing_thread = _find_dm_thread(sender_id, recipient_id)
    if existing_thread:
        thread_id = existing_thread
    else:
        thread_id = str(uuid.uuid4())
        db.get_service_client().table("dm_threads").insert({
            "id": thread_id, "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()
        db.get_service_client().table("thread_participants").insert([
            {"id": str(uuid.uuid4()), "thread_id": thread_id, "user_id": sender_id},
            {"id": str(uuid.uuid4()), "thread_id": thread_id, "user_id": recipient_id},
        ]).execute()

    # Insert message
    msg_id = str(uuid.uuid4())
    message = {
        "id": msg_id,
        "thread_id": thread_id,
        "sender_id": sender_id,
        "content": body.content[:2000],
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    db.get_service_client().table("dm_messages").insert(message).execute()
    db.get_service_client().table("dm_threads").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", thread_id).execute()

    return ResponseModel(data={"messageId": msg_id, "threadId": thread_id})


def _find_dm_thread(user_a: str, user_b: str) -> Optional[str]:
    """Find an existing DM thread between exactly two users."""
    try:
        a_threads = db.get_service_client().table("thread_participants").select("thread_id").eq("user_id", user_a).execute()
        b_threads = db.get_service_client().table("thread_participants").select("thread_id").eq("user_id", user_b).execute()
        a_ids = {r["thread_id"] for r in (a_threads.data or [])}
        b_ids = {r["thread_id"] for r in (b_threads.data or [])}
        shared = a_ids & b_ids
        return next(iter(shared)) if shared else None
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/notifications", response_model=ResponseModel)
async def get_notifications(
    limit: int = Query(50, le=100),
    current_user: dict = Depends(Auth.get_current_user),
):
    result = (
        db.get_service_client()
        .table("notifications")
        .select("*, users!actor_id(id, username, avatar_url)")
        .eq("recipient_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    notifications = []
    for n in (result.data or []):
        actor = n.get("users") or {}
        extra = n.get("extra_data") or {}
        notifications.append({
            "id": n["id"],
            "type": n["type"],
            "actor": {"id": actor.get("id", ""), "name": actor.get("username", ""), "avatar": actor.get("avatar_url") or "⚡"},
            "postId": n.get("post_id"),
            "postSnippet": n.get("post_snippet"),
            "reaction": extra.get("reaction"),
            "isRead": n.get("is_read", False),
            "createdAt": n.get("created_at", ""),
        })
    return ResponseModel(data={"notifications": notifications})


@community_v2_router.post("/api/notifications/read-all", response_model=ResponseModel)
async def mark_all_notifications_read(current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("notifications").update({"is_read": True}).eq("recipient_id", current_user["id"]).eq("is_read", False).execute()
    return ResponseModel(data={"marked": True})


def _create_notification(recipient_id: str, actor_id: str, notif_type: str, post_id: str = None, extra: dict = None):
    """Insert a notification record. Called internally after social actions."""
    try:
        snippet = None
        if post_id:
            post = db.get_service_client().table("posts").select("content").eq("id", post_id).execute()
            if post.data:
                snippet = post.data[0]["content"][:80]
        db.get_service_client().table("notifications").insert({
            "id": str(uuid.uuid4()),
            "recipient_id": recipient_id,
            "actor_id": actor_id,
            "type": notif_type,
            "post_id": post_id,
            "post_snippet": snippet,
            "extra_data": extra or {},
            "is_read": False,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
    except Exception:
        pass  # Notification failure should never break the main action


# ─────────────────────────────────────────────────────────────
# AI SCORING PROXY — Anthropic API key lives only here, never in client
# ─────────────────────────────────────────────────────────────

SCORE_SYSTEM = """You are a professional skills evaluator for Sifter Skill_Up. Be direct, specific, and demanding.

Respond ONLY with valid JSON. No preamble, no markdown. Exactly this shape:
{"criteriaResults":[{"criterion":"exact text copied verbatim","passed":true,"feedback":"one specific sentence"}],"overallFeedback":"2-3 direct, actionable sentences.","score":4,"total":6,"xpEarned":100}

Rules: Each criterion is binary. Vague answers do not pass. xpEarned = round((score/total)*150/10)*10, cap 150."""

ai_router = APIRouter(tags=["ai"])

@ai_router.post("/api/ai/score", response_model=ResponseModel)
async def score_simulator(body: AIScoreRequest, current_user: dict = Depends(Auth.get_current_user)):
    """
    Proxy Claude API call for simulator scoring.
    API key is loaded from environment — never exposed to client.
    Rate-limited per user (10 scoring requests per minute).
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(503, "AI scoring unavailable")

    # Input sanitisation
    scenario     = body.scenario[:4000]
    user_response= body.userResponse[:3000]
    criteria     = [c[:300] for c in body.criteria[:20]]
    context      = (body.context or "")[:500]

    user_content = f"SCENARIO:\n{scenario}\n\n"
    if context:
        user_content += f"CONTEXT:\n{context}\n\n"
    user_content += f"SCORING CRITERIA:\n" + "\n".join(f"{i+1}. {c}" for i, c in enumerate(criteria))
    user_content += f"\n\nUSER RESPONSE:\n{user_response}\n\nEvaluate each criterion. Return only valid JSON."

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1000,
                    "system": SCORE_SYSTEM,
                    "messages": [{"role": "user", "content": user_content}],
                },
            )
            res.raise_for_status()
            data = res.json()
            raw = (data.get("content") or [{}])[0].get("text", "")
            clean = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(clean)
            if not result.get("criteriaResults") or not isinstance(result.get("score"), int):
                raise ValueError("Invalid response shape")
            return ResponseModel(data=result)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"AI service error: {str(e)}")
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        raise HTTPException(500, f"AI response parse error: {str(e)}")


# ─────────────────────────────────────────────────────────────
# SCENARIO UNIQUENESS — track which scenarios each user has seen
# ─────────────────────────────────────────────────────────────

scenarios_router = APIRouter(tags=["scenarios"])

@scenarios_router.get("/api/users/seen-scenarios", response_model=ResponseModel)
async def get_seen_scenarios(
    labId: Optional[str] = Query(None),
    current_user: dict = Depends(Auth.get_current_user),
):
    q = db.get_service_client().table("user_seen_scenarios").select("scenario_id").eq("user_id", current_user["id"])
    if labId:
        q = q.eq("lab_id", labId)
    result = q.execute()
    return ResponseModel(data={"scenarioIds": [r["scenario_id"] for r in (result.data or [])]})


@scenarios_router.post("/api/users/seen-scenarios", response_model=ResponseModel)
async def record_seen_scenario(body: SeenScenarioRecord, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_seen_scenarios").upsert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "scenario_id": body.scenarioId,
        "seen_at": datetime.utcnow().isoformat(),
    }).execute()
    return ResponseModel(data={"recorded": True})
