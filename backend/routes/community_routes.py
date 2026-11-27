# ============================================================
# Sifter LevelUp — Community Routes
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
#   POST   /api/dms/send                — send DM (existing thread or mutual follow; not guests)
#   POST   /api/dms/read                — mark thread read
#   POST   /api/ai/score                — AI simulator scoring proxy (key never in client)
#   GET    /api/notifications           — get notifications for current user
#   POST   /api/notifications/read-all  — mark all read
#   GET    /api/users/seen-scenarios    — scenario IDs this user has seen (uniqueness)
#   POST   /api/users/seen-scenarios    — record seen scenario ID
# ============================================================

import uuid
import json
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import Auth
from database import db
from auth import _error_code
from avatar_storage import UploadRateLimiter, public_avatar_url, scrub_embedded_avatars
from models import ResponseModel
from public_name import public_name, publicize_user_row, run_with_public_name_columns

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
    action: Literal['approve', 'reject']

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

# --- Social-action throttles --------------------------------------------------
# Per-user, in memory (per worker process), bounded by UploadRateLimiter's key
# cap. They stop a single account from hammering the follow/block endpoints or
# pinging a target repeatedly; they are not a substitute for the notification
# de-duplication below, which holds across workers.
_follow_limiter = UploadRateLimiter(limits=((60, 30, "minute"), (3600, 200, "hour")))
_follow_request_limiter = UploadRateLimiter(limits=((3600, 20, "hour"), (86400, 50, "day")))
_respond_limiter = UploadRateLimiter(limits=((60, 60, "minute"), (3600, 300, "hour")))
# Block is a safety action and the offline queue replays queued blocks in a
# burst, so its limits are far higher than follow's: a replayed batch must not
# be dropped. The limiter stays only as a backstop against a runaway client.
_block_limiter = UploadRateLimiter(limits=((60, 120, "minute"), (3600, 600, "hour")))

# A rejected follow request stays rejected for this long: the requester cannot
# reopen it, and the target is not notified again, until the cooldown passes.
FOLLOW_REQUEST_COOLDOWN = timedelta(days=7)


def _throttle(limiter: UploadRateLimiter, user_id: str) -> None:
    """429 when the caller is over the limit; otherwise count this attempt."""
    wait = limiter.check(user_id)
    if wait:
        raise HTTPException(429, "Too many requests. Try again shortly.", headers={"Retry-After": str(wait)})
    limiter.record(user_id)


def _is_guest(current_user: dict) -> bool:
    return current_user.get("auth_provider") == "guest"


def _parse_ts(value) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _decision_time(row: dict) -> Optional[datetime]:
    """When a follow request was decided.

    follow_requests has no decided_at/updated_at column. The respond endpoint
    therefore stamps created_at with the decision time when it rejects, and this
    reads whichever of the three columns is present (a dedicated column is the
    cleaner fix and needs a separate, approved migration).
    """
    for col in ("decided_at", "updated_at", "created_at"):
        ts = _parse_ts(row.get(col))
        if ts:
            return ts
    return None

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

    # Build query. The author's public-name columns are spliced in (and retried
    # without display_name if that column is not migrated yet).
    def _build_feed_query(name_cols: str):
        q = (
            db.get_service_client()
            .table("posts")
            .select(
                "*, "
                f"users!user_id(id, {name_cols}, avatar_url, active_track, is_private), "
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
            cutoff = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
            q = q.gte("created_at", cutoff)
            if track:
                q = q.eq("track_context", track)

        return q

    result = run_with_public_name_columns(lambda c: _build_feed_query(c).execute())
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
            "name": public_name(author_row),
            "avatar": public_avatar_url(author_row.get("avatar_url")) or "⚡",
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
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
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

    result = run_with_public_name_columns(lambda c: (
        db.get_service_client()
        .table("posts")
        .select(f"*, users!user_id(id, {c}, avatar_url, active_track, is_private)")
        .ilike("content", f"%{safe_q}%")
        .eq("is_deleted", False)
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    ))

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
        extra = run_with_public_name_columns(lambda c: (
            db.get_service_client()
            .table("posts")
            .select(f"*, users!user_id(id, {c}, avatar_url, active_track, is_private)")
            .in_("id", list(hashtag_post_ids - existing_ids))
            .eq("is_deleted", False)
            .execute()
        ))
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
            "created_at": datetime.now(timezone.utc).isoformat(),
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
    if ends_at and datetime.fromisoformat(ends_at.replace("Z", "+00:00")) < datetime.now(timezone.utc):
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
        "created_at": datetime.now(timezone.utc).isoformat(),
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
        "created_at": datetime.now(timezone.utc).isoformat(),
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
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(data={"isPrivate": body.isPrivate})


# ─────────────────────────────────────────────────────────────
# FOLLOW / UNFOLLOW
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/users/follow", response_model=ResponseModel)
async def follow_user(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    """Follow a public account. Use /follow-request for private accounts."""
    user_id = _norm_id(current_user["id"])
    target_id = _norm_id(body.targetId)
    _throttle(_follow_limiter, user_id)
    if target_id == user_id:
        raise HTTPException(400, "Cannot follow yourself")
    # Guests can follow nobody (they could otherwise ping any account). Same
    # refusal as a missing target so it reveals nothing.
    if _is_guest(current_user):
        raise HTTPException(404, "User not found")

    # The only follow row this endpoint ever creates is caller -> target. A
    # private account can only be followed through an approved request.
    # Missing, deleted and blocked (either direction) targets all get the same
    # 404 so the endpoint does not reveal which it was. The private-account 403
    # stays distinct on purpose: it tells the caller to use /follow-request.
    target = _active_user(target_id)
    if target is None or _blocked_either_way(user_id, target_id):
        raise HTTPException(404, "User not found")
    if target.get("is_private"):
        raise HTTPException(403, "This account is private. Send a follow request instead.")

    existing = db.get_service_client().table("follows").select("id").eq("follower_id", user_id).eq("following_id", target_id).execute()
    if existing.data:
        return ResponseModel(data={"status": "already_following"})

    # UNIQUE(follower_id, following_id): two concurrent follows must not 500.
    # Notify only when this call really created the row.
    created = db.get_service_client().table("follows").upsert({
        "id": str(uuid.uuid4()),
        "follower_id": user_id,
        "following_id": target_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="follower_id,following_id", ignore_duplicates=True).execute()
    if not created.data:
        return ResponseModel(data={"status": "already_following"})

    _create_notification(target_id, user_id, "follow")
    return ResponseModel(data={"status": "following"})


@community_v2_router.post("/api/users/follow-request", response_model=ResponseModel)
async def request_follow(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    """Send a follow request to a private account."""
    user_id = _norm_id(current_user["id"])
    target_id = _norm_id(body.targetId)
    _throttle(_follow_request_limiter, user_id)
    if target_id == user_id:
        raise HTTPException(400, "Cannot follow yourself")
    # Guests cannot ping accounts; same refusal as a missing target.
    if _is_guest(current_user):
        raise HTTPException(404, "User not found")
    # Same 404 as /follow for a missing, deleted or blocked (either way) target.
    if _active_user(target_id) is None or _blocked_either_way(user_id, target_id):
        raise HTTPException(404, "User not found")
    svc = db.get_service_client()
    now_dt = datetime.now(timezone.utc)
    now = now_dt.isoformat()
    existing = svc.table("follow_requests").select("*").eq("requester_id", user_id).eq("target_id", target_id).execute()
    if existing.data:
        row = existing.data[0]
        if row["status"] == "pending":
            return ResponseModel(data={"status": "pending"})
        already = svc.table("follows").select("id").eq("follower_id", user_id).eq("following_id", target_id).limit(1).execute()
        if already.data:
            return ResponseModel(data={"status": row["status"]})
        if row["status"] != "approve":
            # Fail closed: any decided status other than 'approve' counts as a
            # rejection (legacy rows from the old respond endpoint stored
            # free-text actions such as 'rejected'). A rejection holds for the cooldown: return it as is, without
            # reopening the request or notifying the target. A timestamp that
            # cannot be read is treated as recent (fail closed).
            decided = _decision_time(row)
            if decided is None or now_dt - decided < FOLLOW_REQUEST_COOLDOWN:
                return ResponseModel(data={"status": "reject"})
        # A decided request (approved then unfollowed, or a rejection past its
        # cooldown) must not lock the pair out forever: reopen it as pending.
        svc.table("follow_requests").update({"status": "pending", "created_at": now}).eq("id", row["id"]).execute()
    else:
        # UNIQUE(requester_id, target_id): a concurrent duplicate must not 500.
        svc.table("follow_requests").upsert({
            "id": str(uuid.uuid4()),
            "requester_id": user_id,
            "target_id": target_id,
            "status": "pending",
            "created_at": now,
        }, on_conflict="requester_id,target_id", ignore_duplicates=True).execute()

    # At most one notification per (requester, target) within the cooldown, even
    # when the request is cancelled (unfollow) and sent again. The check is not
    # atomic across workers; the per-user limiter bounds the residual race.
    if not _follow_request_recently_notified(user_id, target_id, now_dt):
        _create_notification(target_id, user_id, "follow_request")
    return ResponseModel(data={"status": "pending"})


def _follow_request_recently_notified(requester_id: str, target_id: str, now: datetime) -> bool:
    """True when this requester already pinged this target inside the cooldown.

    Fails closed: if the history cannot be read, no notification is sent.
    """
    try:
        cutoff = (now - FOLLOW_REQUEST_COOLDOWN).isoformat()
        res = (
            db.get_service_client().table("notifications").select("id")
            .eq("recipient_id", target_id).eq("actor_id", requester_id).eq("type", "follow_request")
            .gte("created_at", cutoff).limit(1).execute()
        )
        return bool(res.data)
    except Exception:
        return True


@community_v2_router.get("/api/users/follow-requests", response_model=ResponseModel)
async def get_follow_requests(current_user: dict = Depends(Auth.get_current_user)):
    result = run_with_public_name_columns(lambda c: (
        db.get_service_client()
        .table("follow_requests")
        .select(f"*, users!requester_id(id, {c}, avatar_url, active_track)")
        .eq("target_id", current_user["id"])
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    ))
    rows = []
    for r in (result.data or []):
        r = dict(r)
        if isinstance(r.get("users"), dict):
            r["users"] = publicize_user_row(r["users"])
        rows.append(r)
    return ResponseModel(data=scrub_embedded_avatars(rows))


@community_v2_router.post("/api/users/follow-request/respond", response_model=ResponseModel)
async def respond_follow_request(body: FollowRequestRespond, current_user: dict = Depends(Auth.get_current_user)):
    user_id = _norm_id(current_user["id"])
    requester_id = _norm_id(body.requesterId)
    _throttle(_respond_limiter, user_id)
    svc = db.get_service_client()
    no_request = HTTPException(404, "No pending follow request from this user.")

    # A malformed, unknown or deleted requester gets the same answer as a
    # missing request (and a bad id never reaches a uuid cast in the database).
    if not _is_uuid(requester_id) or _active_user(requester_id) is None:
        raise no_request

    # Same refusal as a missing request when either side has blocked the other.
    if _blocked_either_way(user_id, requester_id):
        raise no_request

    # A follow can only be created from a request the requester really made to
    # the caller and that is still pending. Without this a caller could mint a
    # follow row for any user, which also satisfies the mutual-follow DM rule.
    pending = (
        svc.table("follow_requests").select("id")
        .eq("requester_id", requester_id).eq("target_id", user_id).eq("status", "pending")
        .limit(1).execute()
    )
    if not pending.data:
        raise no_request

    # Stored values follow the schema comment: 'approve' | 'reject'. The update
    # is conditional on status='pending', so of two concurrent decisions only
    # one wins; the loser sees no row updated and creates nothing. A rejection
    # also stamps created_at with the decision time (there is no decided_at
    # column) so the re-request cooldown runs from the decision.
    changes = {"status": body.action}
    if body.action == "reject":
        changes["created_at"] = datetime.now(timezone.utc).isoformat()
    won = svc.table("follow_requests").update(changes).eq("id", pending.data[0]["id"]).eq("status", "pending").execute()
    if not won.data:
        raise no_request

    if body.action == "approve":
        # UNIQUE(follower_id, following_id): an upsert that ignores duplicates
        # keeps two concurrent approvals from failing with a unique violation.
        svc.table("follows").upsert({
            "id": str(uuid.uuid4()),
            "follower_id": requester_id,
            "following_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="follower_id,following_id", ignore_duplicates=True).execute()
        _create_notification(requester_id, user_id, "follow")

    return ResponseModel(data={"status": body.action})


@community_v2_router.post("/api/users/unfollow", response_model=ResponseModel)
async def unfollow_user(body: FollowAction, current_user: dict = Depends(Auth.get_current_user)):
    user_id = _norm_id(current_user["id"])
    target_id = _norm_id(body.targetId)
    if not _is_uuid(target_id):
        raise HTTPException(404, "User not found")
    svc = db.get_service_client()
    svc.table("follows").delete().eq("follower_id", user_id).eq("following_id", target_id).execute()
    # Cancel only the caller's own PENDING request. A decided row stays: a
    # rejection must keep holding its cooldown (unfollowing must not wipe it),
    # and an approved-then-unfollowed row is reopened by /follow-request.
    svc.table("follow_requests").delete().eq("requester_id", user_id).eq("target_id", target_id).eq("status", "pending").execute()
    return ResponseModel(data={"status": "unfollowed"})


# ─────────────────────────────────────────────────────────────
# BLOCK / MUTE
# ─────────────────────────────────────────────────────────────

@community_v2_router.post("/api/users/block", response_model=ResponseModel)
async def block_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    user_id = _norm_id(current_user["id"])
    target_id = _norm_id(body.targetId)
    _throttle(_block_limiter, user_id)
    # Blocking yourself gets the same refusal as an unknown target.
    if target_id == user_id or not _is_uuid(target_id) or _active_user(target_id) is None:
        raise HTTPException(404, "User not found")
    svc = db.get_service_client()
    # UNIQUE(user_id, target_id): a repeated block (e.g. an offline-queue replay)
    # is a no-op rather than a unique-violation 500.
    svc.table("user_blocks").upsert({
        "id": str(uuid.uuid4()), "user_id": user_id, "target_id": target_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="user_id,target_id", ignore_duplicates=True).execute()
    # Also remove any follow relationship and any pending or approved follow
    # request, in both directions. Rejected rows (and any legacy non-standard
    # status, which is read as a rejection) are KEPT in both directions: they
    # carry the re-request cooldown, so block then unblock must not reset it.
    # Plain eq()/in_() filters keep the id out of a PostgREST filter string.
    for a, b in ((user_id, target_id), (target_id, user_id)):
        svc.table("follows").delete().eq("follower_id", a).eq("following_id", b).execute()
        svc.table("follow_requests").delete().eq("requester_id", a).eq("target_id", b).in_("status", ["pending", "approve"]).execute()
    return ResponseModel(data={"blocked": True})


@community_v2_router.post("/api/users/unblock", response_model=ResponseModel)
async def unblock_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_blocks").delete().eq("user_id", current_user["id"]).eq("target_id", body.targetId).execute()
    return ResponseModel(data={"blocked": False})


@community_v2_router.post("/api/users/mute", response_model=ResponseModel)
async def mute_user(body: BlockAction, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("user_mutes").upsert({
        "id": str(uuid.uuid4()), "user_id": current_user["id"], "target_id": body.targetId,
        "created_at": datetime.now(timezone.utc).isoformat(),
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
    result = run_with_public_name_columns(lambda c: (
        db.get_service_client()
        .table("dm_threads")
        .select(
            "id, created_at, updated_at, "
            "dm_messages(content, created_at, sender_id, is_read, id),"
            f"thread_participants!inner(user_id, users!user_id(id, {c}, avatar_url))"
        )
        .eq("thread_participants.user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    ))

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
                "name": public_name(other),
                "avatar": public_avatar_url(other.get("avatar_url")) or "⚡" if other else "⚡",
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

    messages = run_with_public_name_columns(lambda c: (
        db.get_service_client()
        .table("dm_messages")
        .select(f"*, users!sender_id(id, {c}, avatar_url)")
        .eq("thread_id", thread_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    ))
    shaped_messages = []
    for m in (messages.data or []):
        m = dict(m)
        if isinstance(m.get("users"), dict):
            m["users"] = publicize_user_row(m["users"])
        shaped_messages.append(m)

    # Mark as read
    db.get_service_client().table("dm_messages").update({"is_read": True}).eq("thread_id", thread_id).neq("sender_id", user_id).execute()

    return ResponseModel(data={"messages": scrub_embedded_avatars(shaped_messages)})


@community_v2_router.post("/api/dms/send", response_model=ResponseModel)
async def send_dm(body: DMSend, current_user: dict = Depends(Auth.get_current_user)):
    """
    Send a DM. Only the sender can initiate.
    Creates thread if one doesn't exist between these two users.
    """
    # Normalise before comparing so an upper-case or padded UUID cannot slip
    # past the self-message check or the follow/block lookups.
    sender_id = _norm_id(current_user["id"])
    recipient_id = _norm_id(body.recipientId)
    content = (body.content or "").strip()

    if sender_id == recipient_id:
        raise HTTPException(400, "Cannot message yourself")
    if not content:
        raise HTTPException(400, "Message cannot be empty")

    # One error for every refusal (blocked, no relationship, guest, unknown or
    # deleted id) so the response never reveals whether a target exists or why
    # it refused.
    refused = HTTPException(403, "You can't message this user.")

    svc = db.get_service_client()

    # The recipient must exist and not be deleted, before any thread is made.
    if _active_user(recipient_id) is None:
        raise refused

    # Blocks apply in both directions, to new and existing threads alike.
    blocked = svc.table("user_blocks").select("id").eq("user_id", recipient_id).eq("target_id", sender_id).execute()
    if blocked.data:
        raise refused
    blocked_by_sender = svc.table("user_blocks").select("id").eq("user_id", sender_id).eq("target_id", recipient_id).execute()
    if blocked_by_sender.data:
        raise refused

    # The mutual follow is re-checked on EVERY send, not only when a thread is
    # created: an existing thread is no longer an exemption. If either side
    # unfollows, the thread is frozen until the follow is mutual again; a
    # thread between mutual followers keeps working.
    if not _mutual_follow(sender_id, recipient_id):
        raise refused

    # Find or create thread (a two-person thread only). A failed lookup fails
    # the send: it must never be read as "no thread" and create a duplicate.
    try:
        existing_thread = _find_dm_thread(sender_id, recipient_id)
    except Exception:
        raise HTTPException(503, "Temporarily unavailable. Please try again.")
    if existing_thread:
        thread_id = existing_thread
    else:
        # Guest accounts cannot start conversations.
        if current_user.get("auth_provider") == "guest":
            raise refused
        thread_id = str(uuid.uuid4())
        try:
            db.get_service_client().table("dm_threads").insert({
                "id": thread_id, "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
            db.get_service_client().table("thread_participants").insert([
                {"id": str(uuid.uuid4()), "thread_id": thread_id, "user_id": sender_id},
                {"id": str(uuid.uuid4()), "thread_id": thread_id, "user_id": recipient_id},
            ]).execute()
            # A->B and B->A can both create a first thread at the same moment.
            # Re-check and keep the older one (a unique constraint on the user
            # pair would be the real fix; the schema has none, so this narrows
            # the race but cannot close it).
            winner = _find_dm_thread(sender_id, recipient_id)
        except Exception:
            _delete_dm_thread(thread_id)
            raise HTTPException(503, "Temporarily unavailable. Please try again.")
        if winner and winner != thread_id:
            # _delete_dm_thread refuses to delete a thread that already has
            # messages; the winner is then still the deterministic choice.
            _delete_dm_thread(thread_id)
            thread_id = winner

    # Insert message
    msg_id = str(uuid.uuid4())
    message = {
        "id": msg_id,
        "thread_id": thread_id,
        "sender_id": sender_id,
        "content": content[:2000],
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.get_service_client().table("dm_messages").insert(message).execute()
    db.get_service_client().table("dm_threads").update({"updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", thread_id).execute()

    return ResponseModel(data={"messageId": msg_id, "threadId": thread_id})


def _norm_id(value) -> str:
    """Canonical form of a user id for comparisons (trimmed, lower-case)."""
    return str(value or "").strip().lower()


def _blocked_either_way(user_a: str, user_b: str) -> bool:
    """True when a user_blocks row exists between the two users in either direction."""
    svc = db.get_service_client()
    for blocker, target in ((user_a, user_b), (user_b, user_a)):
        res = svc.table("user_blocks").select("id").eq("user_id", blocker).eq("target_id", target).limit(1).execute()
        if res.data:
            return True
    return False


def _is_uuid(value) -> bool:
    """True only for the canonical hyphenated form (so {..}/urn:/unhyphenated
    spellings cannot dodge the self-check or the id comparisons)."""
    text = str(value or "").strip().lower()
    try:
        return str(uuid.UUID(text)) == text
    except (ValueError, AttributeError, TypeError):
        return False


# PostgREST/Postgres codes for an absent column (undefined_column / schema cache).
_MISSING_COLUMN_CODES = {"42703", "PGRST204"}


def _active_user(user_id: str) -> Optional[dict]:
    """The users row for a non-deleted account, else None.

    None means "no such active user": an empty/malformed id, a missing row, or a
    deleted account. A database failure is NOT that answer: it raises 503, so an
    outage never reads as "user not found" (or, for DMs, as a refusal). A
    database without users.is_deleted yet is read as not deleted, as
    Auth.get_current_user does.
    """
    if not user_id or not _is_uuid(user_id):
        return None
    table = db.get_service_client().table("users")
    try:
        try:
            res = table.select("id, is_private").eq("id", user_id).eq("is_deleted", False).limit(1).execute()
        except Exception as exc:
            if _error_code(exc) not in _MISSING_COLUMN_CODES:
                raise
            res = db.get_service_client().table("users").select("id, is_private").eq("id", user_id).limit(1).execute()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "Temporarily unavailable. Please try again.")
    return res.data[0] if res.data else None


def _mutual_follow(user_a: str, user_b: str) -> bool:
    """True when each user follows the other (the recipient has opted in)."""
    try:
        svc = db.get_service_client()
        a_to_b = svc.table("follows").select("id").eq("follower_id", user_a).eq("following_id", user_b).limit(1).execute()
        if not a_to_b.data:
            return False
        b_to_a = svc.table("follows").select("id").eq("follower_id", user_b).eq("following_id", user_a).limit(1).execute()
        return bool(b_to_a.data)
    except Exception:
        return False


def _find_dm_thread(user_a: str, user_b: str) -> Optional[str]:
    """The DM thread between exactly two users, never a group.

    With duplicates, the oldest thread that already has messages wins (so a
    thread holding messages is never orphaned), else the oldest thread.

    Raises on a database error: the caller must not read a failed lookup as
    "no thread" and create a duplicate.
    """
    svc = db.get_service_client()
    a_threads = svc.table("thread_participants").select("thread_id").eq("user_id", user_a).execute()
    b_threads = svc.table("thread_participants").select("thread_id").eq("user_id", user_b).execute()
    a_ids = {r["thread_id"] for r in (a_threads.data or [])}
    b_ids = {r["thread_id"] for r in (b_threads.data or [])}
    matches = []
    for thread_id in sorted(a_ids & b_ids):
        members = svc.table("thread_participants").select("user_id").eq("thread_id", thread_id).execute()
        if {r["user_id"] for r in (members.data or [])} == {user_a, user_b} and len(members.data) == 2:
            matches.append(thread_id)
    if len(matches) <= 1:
        return matches[0] if matches else None
    # Two threads for the same pair (a simultaneous first send): the older wins,
    # ties broken by id, so both racing requests converge on the same thread.
    created = {}
    with_messages = []
    for thread_id in matches:
        row = svc.table("dm_threads").select("created_at").eq("id", thread_id).limit(1).execute()
        created[thread_id] = (row.data[0].get("created_at") or "") if row.data else ""
        if _dm_thread_has_messages(thread_id):
            with_messages.append(thread_id)
    pool = with_messages or matches
    return min(pool, key=lambda t: (created[t], t))


def _dm_thread_has_messages(thread_id: str) -> bool:
    """True when the thread holds a message. Raises on a database error."""
    res = db.get_service_client().table("dm_messages").select("id").eq("thread_id", thread_id).limit(1).execute()
    return bool(res.data)


def _delete_dm_thread(thread_id: str) -> bool:
    """Best-effort removal of a thread this request created and then lost.

    dm_messages.thread_id is ON DELETE CASCADE, so a thread that holds any
    message is never deleted (a concurrent request may have sent into it). If
    that cannot be checked, the thread is kept. Returns True if it was deleted.
    """
    try:
        svc = db.get_service_client()
        if _dm_thread_has_messages(thread_id):
            return False
        svc.table("thread_participants").delete().eq("thread_id", thread_id).execute()
        svc.table("dm_threads").delete().eq("id", thread_id).execute()
        return True
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────

@community_v2_router.get("/api/notifications", response_model=ResponseModel)
async def get_notifications(
    limit: int = Query(50, le=100),
    current_user: dict = Depends(Auth.get_current_user),
):
    result = run_with_public_name_columns(lambda c: (
        db.get_service_client()
        .table("notifications")
        .select(f"*, users!actor_id(id, {c}, avatar_url)")
        .eq("recipient_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    ))
    notifications = []
    for n in (result.data or []):
        actor = n.get("users") or {}
        extra = n.get("extra_data") or {}
        notifications.append({
            "id": n["id"],
            "type": n["type"],
            "actor": {"id": actor.get("id", ""), "name": public_name(actor) if actor else "", "avatar": public_avatar_url(actor.get("avatar_url")) or "⚡"},
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        pass  # Notification failure should never break the main action


# ─────────────────────────────────────────────────────────────
# AI SCORING PROXY — Anthropic API key lives only here, never in client
# ─────────────────────────────────────────────────────────────

SCORE_SYSTEM = """You are a professional skills evaluator for Sifter LevelUp. Be direct, specific, and demanding.

Respond ONLY with valid JSON. No preamble, no markdown. Exactly this shape:
{"criteriaResults":[{"criterion":"exact text copied verbatim","passed":true,"feedback":"one specific sentence"}],"overallFeedback":"2-3 direct, actionable sentences.","score":4,"total":6,"xpEarned":100}

Rules: Each criterion is binary. Vague answers do not pass. xpEarned = round((score/total)*150/10)*10, cap 150."""

ai_router = APIRouter(tags=["ai"])

@ai_router.post("/api/ai/score", response_model=ResponseModel)
async def score_simulator(body: AIScoreRequest, current_user: dict = Depends(Auth.get_current_user)):
    """
    Deterministic simulator scoring — zero AI API dependency.
    Replaces the previous Anthropic API call with the platform's own
    scoring engine anchored to Starknet industry-standard criteria.
    """
    from deterministic_score import score_response

    user_response = (body.userResponse or "")[:3000]
    criteria      = [c[:300] for c in (body.criteria or [])[:20]]

    result = score_response(
        user_response=user_response,
        criteria=criteria,
    )
    return ResponseModel(data=result)


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
        "seen_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return ResponseModel(data={"recorded": True})
