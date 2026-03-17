# ============================================================
# Sifter Skill_Up — Missing Route Groups
# Covers all endpoints called by the frontend that were absent
# from main.py. Import and include each router in main.py.
#
# Endpoints added:
#   POST   /api/users/last-position       — resume position save
#   DELETE /api/users/last-position       — clear on completion
#   POST   /api/flags                     — content flagging
#   POST   /api/reviews                   — app store review capture
#   POST   /api/analytics/share           — share event tracking
#   POST   /api/portfolio/social-blast    — post artifact to all socials
#   POST   /api/notifications/token       — register push token
#   PUT    /api/notifications/prefs       — update notification preferences
#   POST   /api/notifications/trigger     — trigger notification (server)
#   GET    /api/posts                     — guild feed posts
#   POST   /api/posts                     — submit guild post
#   POST   /api/posts/like                — toggle post like
#   POST   /api/projects/join             — join a guild project
# ============================================================

import uuid
from datetime import datetime
from typing import Optional, List

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import Auth
from database import db
from models import ResponseModel

# ─────────────────────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────────────────────

class LastPositionSave(BaseModel):
    trackId: str
    trackName: str
    level: str                        # 'junior' | 'intermediate' | 'senior' (legacy field, kept for compat)
    labId: str
    labTitle: str
    lessonId: str
    lessonTitle: str
    lessonIndex: int
    labIndex: int
    simulatorState: Optional[dict] = None
    savedAt: str

class FlagCreate(BaseModel):
    contentType: str                  # 'lesson' | 'question' | 'simulation' | 'track'
    contentId: str                    # lesson id / question id etc.
    trackId: Optional[str] = None
    reason: str                       # 'incorrect' | 'outdated' | 'offensive' | 'other'
    detail: Optional[str] = None

class ReviewCreate(BaseModel):
    rating: int                       # 1–5
    review: Optional[str] = None
    context: str                      # 'level_complete' | 'streak_milestone' | 'prompted'
    redirectedToStore: bool = False

class ShareEventCreate(BaseModel):
    type: str                         # 'level_complete' | 'portfolio_artifact'
    trackId: str
    levelId: Optional[str] = None
    artifactName: Optional[str] = None

class SocialBlastCreate(BaseModel):
    artifactName: str
    portfolioUrl: str
    verificationUrl: Optional[str] = None
    message: str

class PushTokenRegister(BaseModel):
    token: str
    platform: str = "expo"            # 'expo' | 'apns' | 'fcm'

class NotificationPrefsUpdate(BaseModel):
    push: bool = True
    sms: bool = False
    email: bool = False
    hourLocal: int = 20               # preferred hour for reminders (local time)

class NotificationTrigger(BaseModel):
    userId: str
    type: str   # streak_reminder | streak_urgent | level_complete | boss_approaching | portfolio_earned | weekly_progress | monthly_leaderboard
    trackId: str
    userName: str
    data: Optional[dict] = None
    channels: Optional[List[str]] = None  # ['push', 'sms', 'email']

class PostCreate(BaseModel):
    content: str
    field: str = "general"

class PostLike(BaseModel):
    postId: str

class ProjectJoin(BaseModel):
    projectId: str

# ─────────────────────────────────────────────────────────────
# Router: User position (resume)
# ─────────────────────────────────────────────────────────────

position_router = APIRouter(prefix="/api/users", tags=["users"])

@position_router.post("/last-position", response_model=ResponseModel)
async def save_last_position(
    body: LastPositionSave,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Persist the user's exact position in the curriculum so the app
    can resume from exactly the right lesson/simulator on next open.
    Upserted (one row per user).
    """
    payload = {
        "user_id": current_user["id"],
        "track_id": body.trackId,
        "track_name": body.trackName,
        "level": body.level,
        "lab_id": body.labId,
        "lab_title": body.labTitle,
        "lesson_id": body.lessonId,
        "lesson_title": body.lessonTitle,
        "lesson_index": body.lessonIndex,
        "lab_index": body.labIndex,
        "simulator_state": body.simulatorState,
        "saved_at": body.savedAt,
        "updated_at": datetime.now().isoformat(),
    }
    existing = (
        db.get_service_client()
        .table("user_last_position")
        .select("id")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if existing.data:
        db.get_service_client().table("user_last_position").update(payload).eq(
            "user_id", current_user["id"]
        ).execute()
    else:
        db.get_service_client().table("user_last_position").insert(payload).execute()

    return ResponseModel(success=True)


@position_router.delete("/last-position", response_model=ResponseModel)
async def clear_last_position(current_user: dict = Depends(Auth.get_current_user)):
    """
    Clear saved position when the user deliberately completes a track
    or resets their progress. Prevents stale resume on next open.
    """
    db.get_service_client().table("user_last_position").delete().eq(
        "user_id", current_user["id"]
    ).execute()
    return ResponseModel(success=True)


@position_router.get("/last-position", response_model=ResponseModel)
async def get_last_position(current_user: dict = Depends(Auth.get_current_user)):
    """Return the user's saved resume position, or null if none."""
    result = (
        db.get_service_client()
        .table("user_last_position")
        .select("*")
        .eq("user_id", current_user["id"])
        .execute()
    )
    return ResponseModel(data=result.data[0] if result.data else None)


# ─────────────────────────────────────────────────────────────
# Router: Content flags
# ─────────────────────────────────────────────────────────────

flags_router = APIRouter(prefix="/api", tags=["flags"])

@flags_router.post("/flags", response_model=ResponseModel)
async def flag_content(
    body: FlagCreate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Flag a lesson, question, simulation, or track for review.
    Flags are reviewed by the content team and feed directly into
    the curriculum improvement pipeline.
    """
    result = db.get_service_client().table("content_flags").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "content_type": body.contentType,
        "content_id": body.contentId,
        "track_id": body.trackId,
        "reason": body.reason,
        "detail": body.detail,
        "status": "open",
        "created_at": datetime.now().isoformat(),
    }).execute()
    return ResponseModel(data=result.data[0] if result.data else {})


# ─────────────────────────────────────────────────────────────
# Router: App reviews
# ─────────────────────────────────────────────────────────────

reviews_router = APIRouter(prefix="/api", tags=["reviews"])

@reviews_router.post("/reviews", response_model=ResponseModel)
async def submit_review(
    body: ReviewCreate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Capture in-app rating and optional review text.
    Users who rate 4–5 and are redirected to the store are not
    prompted again. Stored for NPS tracking and app store optimisation.
    """
    result = db.get_service_client().table("app_reviews").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "rating": body.rating,
        "review": body.review,
        "context": body.context,
        "redirected_to_store": body.redirectedToStore,
        "created_at": datetime.now().isoformat(),
    }).execute()

    # Mark user as reviewed so they're not prompted again
    db.get_client().table("users").update({
        "has_reviewed": True,
        "review_rating": body.rating,
    }).eq("id", current_user["id"]).execute()

    return ResponseModel(data=result.data[0] if result.data else {})


# ─────────────────────────────────────────────────────────────
# Router: Analytics (share events)
# ─────────────────────────────────────────────────────────────

analytics_extra_router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@analytics_extra_router.post("/share", response_model=ResponseModel)
async def track_share_event(
    body: ShareEventCreate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Log a social share event triggered by level completion or
    portfolio artifact earned. Used for virality coefficient tracking
    and social ROI analysis.
    """
    db.get_service_client().table("analytics_events").insert({
        "user_id": current_user["id"],
        "event_type": "share",
        "event_data": {
            "share_type": body.type,
            "track_id": body.trackId,
            "level_id": body.levelId,
            "artifact_name": body.artifactName,
        },
        "session_id": None,
        "created_at": datetime.now().isoformat(),
    }).execute()
    return ResponseModel(success=True)


# ─────────────────────────────────────────────────────────────
# Router: Portfolio social blast
# ─────────────────────────────────────────────────────────────

social_blast_router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

@social_blast_router.post("/social-blast", response_model=ResponseModel)
async def social_blast(
    body: SocialBlastCreate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    When a user earns a portfolio artifact, automatically post the
    portfolio link to ALL connected social platforms simultaneously.
    Uses stored OAuth tokens from portfolio_accounts.
    Unlike /api/portfolio/items/push (which pushes a specific item),
    this broadcasts a lightweight link post across every connected channel.
    """
    # Fetch all connected accounts with OAuth tokens
    accounts = (
        db.get_service_client()
        .table("portfolio_accounts")
        .select("platform_id, access_token, username")
        .eq("user_id", current_user["id"])
        .not_.is_("access_token", "null")
        .execute()
    )

    results = []
    errors = []

    caption = (
        f"{body.message}\n\n"
        f"— Verified by Sifter Skill_Up · sifter.app\n"
        f"Portfolio: {body.portfolioUrl}"
    )

    async with httpx.AsyncClient(timeout=20) as client:
        for account in (accounts.data or []):
            platform_id = account["platform_id"]
            token = account.get("access_token", "")
            username = account.get("username", "")

            try:
                post_url = await _blast_to_platform(
                    client, platform_id, token, username,
                    caption, body.portfolioUrl
                )
                results.append({"platformId": platform_id, "postUrl": post_url})
                # Log the push
                db.get_service_client().table("analytics_events").insert({
                    "user_id": current_user["id"],
                    "event_type": "social_blast",
                    "event_data": {
                        "platform": platform_id,
                        "artifact": body.artifactName,
                        "portfolio_url": body.portfolioUrl,
                    },
                    "created_at": datetime.now().isoformat(),
                }).execute()
            except Exception as e:
                errors.append({"platformId": platform_id, "error": str(e)})

    return ResponseModel(
        data={"posted": results, "errors": errors},
        message=f"Blasted to {len(results)} platform(s).",
    )


async def _blast_to_platform(
    client: httpx.AsyncClient,
    platform_id: str,
    token: str,
    username: str,
    caption: str,
    portfolio_url: str,
) -> str:
    """Lightweight link post to each platform — no file upload, text only."""
    if platform_id == "twitter":
        r = await client.post(
            "https://api.twitter.com/2/tweets",
            json={"text": caption[:280]},
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        tweet_id = r.json().get("data", {}).get("id", "")
        return f"https://twitter.com/{username}/status/{tweet_id}"

    elif platform_id == "linkedin":
        me_r = await client.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {token}"},
        )
        person_id = me_r.json().get("sub", "")
        payload = {
            "author": f"urn:li:person:{person_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": caption},
                    "shareMediaCategory": "ARTICLE",
                    "media": [{"status": "READY", "originalUrl": portfolio_url}],
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        r = await client.post(
            "https://api.linkedin.com/v2/ugcPosts",
            json=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        post_id = r.headers.get("x-restli-id", "")
        return f"https://www.linkedin.com/feed/update/{post_id}"

    elif platform_id == "reddit":
        r = await client.post(
            "https://oauth.reddit.com/api/submit",
            data={
                "sr": "SifterSkillUp",
                "kind": "link",
                "title": caption[:300],
                "url": portfolio_url,
            },
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "SifterSkillUp/1.0",
            },
        )
        url = r.json().get("json", {}).get("data", {}).get("url", portfolio_url)
        return url

    elif platform_id == "github":
        # Create a Gist as a lightweight post
        r = await client.post(
            "https://api.github.com/gists",
            json={
                "description": caption[:250],
                "public": True,
                "files": {
                    "portfolio_update.md": {
                        "content": f"# Portfolio Update\n\n{caption}\n\n[View Portfolio]({portfolio_url})"
                    }
                },
            },
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
        )
        return r.json().get("html_url", f"https://gist.github.com/{username}")

    else:
        # Medium, Facebook, Behance, etc — return portfolio URL as fallback
        return portfolio_url


# ─────────────────────────────────────────────────────────────
# Router: Notifications
# ─────────────────────────────────────────────────────────────

notifications_router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@notifications_router.post("/token", response_model=ResponseModel)
async def register_push_token(
    body: PushTokenRegister,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Register an Expo/APNs/FCM push token for this user's device.
    Upserted so re-installs and token refreshes are handled cleanly.
    Used by the notification engine for streak reminders, boss battles,
    leaderboard updates, etc.
    """
    existing = (
        db.get_service_client()
        .table("push_tokens")
        .select("id")
        .eq("user_id", current_user["id"])
        .eq("token", body.token)
        .execute()
    )
    payload = {
        "user_id": current_user["id"],
        "token": body.token,
        "platform": body.platform,
        "updated_at": datetime.now().isoformat(),
    }
    if existing.data:
        db.get_service_client().table("push_tokens").update(payload).eq(
            "user_id", current_user["id"]
        ).eq("token", body.token).execute()
    else:
        payload["id"] = str(uuid.uuid4())
        payload["created_at"] = datetime.now().isoformat()
        db.get_service_client().table("push_tokens").insert(payload).execute()

    return ResponseModel(success=True)


@notifications_router.put("/prefs", response_model=ResponseModel)
async def update_notification_prefs(
    body: NotificationPrefsUpdate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Update the user's notification channel preferences and preferred
    reminder hour. Controls which channels the notification engine uses
    when scheduling streak reminders and milestone alerts.
    """
    prefs = {
        "push": body.push,
        "sms": body.sms,
        "email": body.email,
        "hour_local": body.hourLocal,
        "updated_at": datetime.now().isoformat(),
    }
    existing = (
        db.get_service_client()
        .table("notification_prefs")
        .select("id")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if existing.data:
        db.get_service_client().table("notification_prefs").update(prefs).eq(
            "user_id", current_user["id"]
        ).execute()
    else:
        prefs["id"] = str(uuid.uuid4())
        prefs["user_id"] = current_user["id"]
        prefs["created_at"] = datetime.now().isoformat()
        db.get_service_client().table("notification_prefs").insert(prefs).execute()

    # Also mirror into user.settings for fast reads
    settings_update = current_user.get("settings", {})
    settings_update.update({
        "notifications": body.push,
        "notification_hour": body.hourLocal,
    })
    db.get_client().table("users").update({"settings": settings_update}).eq(
        "id", current_user["id"]
    ).execute()

    return ResponseModel(success=True)


@notifications_router.post("/trigger", response_model=ResponseModel)
async def trigger_notification(
    body: NotificationTrigger,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Trigger a server-side notification dispatch for a given user and
    notification type. The backend resolves the user's registered push
    tokens and preferred channels, then fires via Expo Push API.

    Notification types:
      streak_reminder    — daily reminder at preferred hour
      streak_urgent      — streak about to expire (< 2h left)
      level_complete     — completion milestone crossed
      boss_approaching   — user is 1 level away from a boss
      portfolio_earned   — portfolio artifact awarded
      weekly_progress    — Sunday weekly summary
      monthly_leaderboard — monthly rank update
    """
    # Fetch target user's push tokens
    tokens_result = (
        db.get_service_client()
        .table("push_tokens")
        .select("token, platform")
        .eq("user_id", body.userId)
        .execute()
    )

    # Fetch notification prefs
    prefs_result = (
        db.get_service_client()
        .table("notification_prefs")
        .select("*")
        .eq("user_id", body.userId)
        .execute()
    )
    prefs = prefs_result.data[0] if prefs_result.data else {"push": True, "sms": False, "email": False}

    channels = body.channels or ["push"]
    sent = []

    # Push notifications via Expo Push API
    if "push" in channels and prefs.get("push") and tokens_result.data:
        notification_messages = {
            "streak_reminder": {
                "title": f"⚡ Keep your streak alive, {body.userName}!",
                "body": f"You're on a roll in {body.trackId}. 5 minutes today keeps the streak going.",
            },
            "streak_urgent": {
                "title": f"🔥 Streak expiring soon!",
                "body": f"Your streak expires in under 2 hours. One quick level keeps it alive.",
            },
            "level_complete": {
                "title": "🏆 Level complete!",
                "body": f"Great work on {body.data.get('levelName', 'your latest level')} in {body.trackId}.",
            },
            "boss_approaching": {
                "title": "⚔️ Boss battle approaching",
                "body": f"You're one level away from the boss in {body.trackId}. Ready?",
            },
            "portfolio_earned": {
                "title": "📊 Portfolio artifact earned!",
                "body": f"Your {body.data.get('artifactName', 'portfolio item')} is ready. Push it to your profiles.",
            },
            "weekly_progress": {
                "title": "📈 Your weekly progress",
                "body": f"{body.data.get('levelsCompleted', 0)} levels done this week. {body.data.get('message', 'Keep going!')}",
            },
            "monthly_leaderboard": {
                "title": "🏅 Monthly leaderboard update",
                "body": f"You're ranked #{body.data.get('rank', '?')} this month in {body.trackId}.",
            },
        }

        msg = notification_messages.get(body.type, {
            "title": "Sifter Skill_Up",
            "body": "You have a new notification.",
        })

        expo_messages = [
            {
                "to": t["token"],
                "title": msg["title"],
                "body": msg["body"],
                "data": {"type": body.type, "trackId": body.trackId, **(body.data or {})},
                "sound": "default",
                "badge": 1,
            }
            for t in tokens_result.data
            if t["token"].startswith("ExponentPushToken") or t["platform"] == "expo"
        ]

        if expo_messages:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    r = await client.post(
                        "https://exp.host/--/api/v2/push/send",
                        json=expo_messages,
                        headers={"Content-Type": "application/json"},
                    )
                    sent.append({"channel": "push", "count": len(expo_messages), "status": r.status_code})
            except Exception as e:
                sent.append({"channel": "push", "error": str(e)})

    # Log notification dispatch
    db.get_service_client().table("notifications").insert({
        "id": str(uuid.uuid4()),
        "user_id": body.userId,
        "type": body.type,
        "title": f"{body.type} notification",
        "body": str(body.data or {}),
        "channels": channels,
        "sent_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
    }).execute()

    return ResponseModel(data={"sent": sent, "channels": channels})


# ─────────────────────────────────────────────────────────────
# Router: Guild posts & projects
# ─────────────────────────────────────────────────────────────

community_router = APIRouter(prefix="/api", tags=["community"])

@community_router.get("/posts", response_model=ResponseModel)
async def get_posts(
    guild_id: Optional[str] = None,
    field: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Fetch guild community feed posts. Filterable by guild or field.
    If no guild_id is provided, returns posts from the user's guild.
    """
    user_guild_id = guild_id or current_user.get("guild_id")

    q = (
        db.get_client()
        .table("posts")
        .select("*, users(username, avatar_url), post_likes(user_id)")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if user_guild_id:
        q = q.eq("guild_id", user_guild_id)
    if field:
        q = q.eq("field", field)

    result = q.execute()

    # Shape the response — attach isLiked per current user
    shaped = []
    user_id = current_user["id"]
    for post in (result.data or []):
        likes_list = post.pop("post_likes", []) or []
        author_data = post.pop("users", {}) or {}
        post["author"] = author_data.get("username", "Unknown")
        post["avatarUrl"] = author_data.get("avatar_url")
        post["isLiked"] = any(lk["user_id"] == user_id for lk in likes_list)
        post["likes"] = len(likes_list)
        shaped.append(post)

    return ResponseModel(data=shaped)


@community_router.post("/posts", response_model=ResponseModel)
async def create_post(
    body: PostCreate,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Submit a post to the guild community feed.
    Posts are tied to the user's current guild. Non-guild members
    post to the general feed (guild_id = null).
    """
    post = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "guild_id": current_user.get("guild_id"),
        "content": body.content[:2000],   # cap content length
        "field": body.field,
        "created_at": datetime.now().isoformat(),
    }
    result = db.get_service_client().table("posts").insert(post).execute()

    # Attach author info for immediate display
    post_out = result.data[0] if result.data else post
    post_out["author"] = current_user.get("username", "You")
    post_out["avatarUrl"] = current_user.get("avatar_url")
    post_out["isLiked"] = False
    post_out["likes"] = 0
    post_out["replies"] = 0

    return ResponseModel(data=post_out)


@community_router.post("/posts/like", response_model=ResponseModel)
async def toggle_post_like(
    body: PostLike,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Toggle a like on a guild post. Idempotent — calling twice unlikes.
    Returns the new like count and liked state.
    """
    user_id = current_user["id"]
    existing = (
        db.get_service_client()
        .table("post_likes")
        .select("id")
        .eq("post_id", body.postId)
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        # Unlike
        db.get_service_client().table("post_likes").delete().eq(
            "post_id", body.postId
        ).eq("user_id", user_id).execute()
        liked = False
    else:
        # Like
        db.get_service_client().table("post_likes").insert({
            "id": str(uuid.uuid4()),
            "post_id": body.postId,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
        }).execute()
        liked = True

    # Get updated count
    count_result = (
        db.get_service_client()
        .table("post_likes")
        .select("id", count="exact")
        .eq("post_id", body.postId)
        .execute()
    )
    likes = count_result.count if hasattr(count_result, "count") else 0

    return ResponseModel(data={"liked": liked, "likes": likes})


@community_router.post("/projects/join", response_model=ResponseModel)
async def join_project(
    body: ProjectJoin,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Join a guild project. Projects are collaborative learning challenges
    posted by guild leaders. Members can signal intent to participate.
    """
    user_id = current_user["id"]

    # Check project exists
    project = (
        db.get_service_client()
        .table("projects")
        .select("id, guild_id, title, max_members")
        .eq("id", body.projectId)
        .execute()
    )
    if not project.data:
        raise HTTPException(404, "Project not found")

    proj = project.data[0]

    # Check user's guild matches
    if proj.get("guild_id") and proj["guild_id"] != current_user.get("guild_id"):
        raise HTTPException(403, "You must be a member of this guild to join the project")

    # Check not already joined
    already = (
        db.get_service_client()
        .table("project_members")
        .select("id")
        .eq("project_id", body.projectId)
        .eq("user_id", user_id)
        .execute()
    )
    if already.data:
        return ResponseModel(data={"alreadyJoined": True})

    # Check capacity
    if proj.get("max_members"):
        member_count = (
            db.get_service_client()
            .table("project_members")
            .select("id", count="exact")
            .eq("project_id", body.projectId)
            .execute()
        )
        current_count = member_count.count if hasattr(member_count, "count") else 0
        if current_count >= proj["max_members"]:
            raise HTTPException(400, "Project is full")

    db.get_service_client().table("project_members").insert({
        "id": str(uuid.uuid4()),
        "project_id": body.projectId,
        "user_id": user_id,
        "joined_at": datetime.now().isoformat(),
    }).execute()

    return ResponseModel(data={"joined": True, "projectTitle": proj.get("title")})


# ─────────────────────────────────────────────────────────────
# Router: Comments, Quotes, Bookmarks, Friends
# ─────────────────────────────────────────────────────────────

from pydantic import BaseModel as PBM
from typing import Optional as Opt, List as Lst

class CommentCreate(PBM):
    postId: str
    content: str

class BookmarkCreate(PBM):
    postId: str
    folderId: str = 'default'

class BookmarkFolderCreate(PBM):
    name: str
    icon: str = '📁'

class FriendRequest(PBM):
    targetId: str

class FriendAccept(PBM):
    requesterId: str

social_router = APIRouter(prefix="/api", tags=["social"])

@social_router.post("/posts/comment", response_model=ResponseModel)
async def add_comment(body: CommentCreate, current_user: dict = Depends(Auth.get_current_user)):
    comment = {
        "id": str(uuid.uuid4()),
        "post_id": body.postId,
        "user_id": current_user["id"],
        "content": body.content[:1000],
        "created_at": datetime.now().isoformat(),
    }
    result = db.get_service_client().table("post_comments").insert(comment).execute()
    # Increment comment count
    db.get_service_client().rpc("increment_post_comments", {"post_id": body.postId}).execute()
    return ResponseModel(data=result.data[0] if result.data else comment)


@social_router.post("/posts/quote", response_model=ResponseModel)
async def quote_post(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """Create a new post that quotes an existing one."""
    content = body.get("content", "")
    quoted_post_id = body.get("quotedPostId")
    if not content.strip():
        raise HTTPException(400, "Content required")
    post = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "guild_id": current_user.get("guild_id"),
        "content": content[:2000],
        "quoted_post_id": quoted_post_id,
        "field": body.get("field", "general"),
        "created_at": datetime.now().isoformat(),
    }
    result = db.get_service_client().table("posts").insert(post).execute()
    if quoted_post_id:
        db.get_service_client().rpc("increment_post_quotes", {"post_id": quoted_post_id}).execute()
    return ResponseModel(data=result.data[0] if result.data else post)


@social_router.post("/bookmarks", response_model=ResponseModel)
async def bookmark_post(body: BookmarkCreate, current_user: dict = Depends(Auth.get_current_user)):
    existing = db.get_service_client().table("bookmarks").select("id").eq("user_id", current_user["id"]).eq("post_id", body.postId).execute()
    if existing.data:
        # Toggle off
        db.get_service_client().table("bookmarks").delete().eq("user_id", current_user["id"]).eq("post_id", body.postId).execute()
        return ResponseModel(data={"bookmarked": False})
    bm = {"id": str(uuid.uuid4()), "user_id": current_user["id"], "post_id": body.postId, "folder_id": body.folderId, "created_at": datetime.now().isoformat()}
    db.get_service_client().table("bookmarks").insert(bm).execute()
    return ResponseModel(data={"bookmarked": True})


@social_router.get("/bookmarks", response_model=ResponseModel)
async def get_bookmarks(folder_id: Opt[str] = None, current_user: dict = Depends(Auth.get_current_user)):
    q = db.get_service_client().table("bookmarks").select("*, posts(*)").eq("user_id", current_user["id"])
    if folder_id:
        q = q.eq("folder_id", folder_id)
    result = q.order("created_at", desc=True).execute()
    return ResponseModel(data=result.data or [])


@social_router.get("/bookmark-folders", response_model=ResponseModel)
async def get_bookmark_folders(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("bookmark_folders").select("*").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data or [])


@social_router.post("/bookmark-folders", response_model=ResponseModel)
async def create_bookmark_folder(body: BookmarkFolderCreate, current_user: dict = Depends(Auth.get_current_user)):
    folder = {"id": str(uuid.uuid4()), "user_id": current_user["id"], "name": body.name, "icon": body.icon, "created_at": datetime.now().isoformat()}
    result = db.get_service_client().table("bookmark_folders").insert(folder).execute()
    return ResponseModel(data=result.data[0] if result.data else folder)


@social_router.post("/friends/request", response_model=ResponseModel)
async def send_friend_request(body: FriendRequest, current_user: dict = Depends(Auth.get_current_user)):
    existing = db.get_service_client().table("friend_requests").select("id").eq("requester_id", current_user["id"]).eq("target_id", body.targetId).execute()
    if existing.data:
        return ResponseModel(data={"status": "already_sent"})
    req = {"id": str(uuid.uuid4()), "requester_id": current_user["id"], "target_id": body.targetId, "status": "pending", "created_at": datetime.now().isoformat()}
    db.get_service_client().table("friend_requests").insert(req).execute()
    return ResponseModel(data={"status": "sent"})


@social_router.post("/friends/accept", response_model=ResponseModel)
async def accept_friend_request(body: FriendAccept, current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("friend_requests").update({"status": "accepted"}).eq("requester_id", body.requesterId).eq("target_id", current_user["id"]).execute()
    # Create bilateral friendship
    for a, b in [(current_user["id"], body.requesterId), (body.requesterId, current_user["id"])]:
        db.get_service_client().table("friends").upsert({"user_id": a, "friend_id": b, "created_at": datetime.now().isoformat()}).execute()
    return ResponseModel(data={"status": "accepted"})


@social_router.get("/friends/suggestions", response_model=ResponseModel)
async def friend_suggestions(current_user: dict = Depends(Auth.get_current_user)):
    """Suggest friends by shared track, guild, or proximity."""
    # Users on same track
    user_track = current_user.get("active_track", "")
    suggestions = []
    if user_track:
        result = db.get_service_client().table("users").select("id, username, avatar_url, active_track").eq("active_track", user_track).neq("id", current_user["id"]).limit(10).execute()
        suggestions = result.data or []
    return ResponseModel(data=suggestions)


@social_router.get("/friends", response_model=ResponseModel)
async def get_friends(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("friends").select("*, users!friend_id(id, username, avatar_url, active_track)").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data or [])
