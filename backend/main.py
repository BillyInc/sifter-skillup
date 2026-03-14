# ============================================
# Sifter Skill_Up — FastAPI Backend
# Supports: Telegram Mini App, Base App, Web Dashboard
# ============================================
import base64
import secrets
import traceback
import urllib.parse
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional

import httpx
import redis
import structlog
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from auth import Auth
from config import settings
from crypto_utils import encrypt_token, decrypt_token
from database import db
from models import (
    AnalyticsEvent,
    BaseWalletAuthRequest,
    CreateRepoRequest,
    FeedbackCreate,
    GameState,
    GuildCreate,
    LevelComplete,
    PushPortfolioRequest,
    ResponseModel,
    TelegramAuthRequest,
    TrackType,
    UserUpdate,
    WithdrawalRequest,
)

# ─────────────────────────────────────────────────────────────
# Structured logging
# ─────────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(0),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# ─────────────────────────────────────────────────────────────
# Redis client (for OAuth state)
# ─────────────────────────────────────────────────────────────
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=False)

# ─────────────────────────────────────────────────────────────
# Rate limiter
# ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ─────────────────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("app_startup", app_name=settings.APP_NAME, version=settings.APP_VERSION)
    yield
    logger.info("app_shutdown")

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

# Rate limiter setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# Global exception handler
# ─────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error for debugging
    logger.error("unhandled_exception", path=request.url.path, error=str(exc), traceback=traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )

# ─────────────────────────────────────────────────────────────
# Request ID middleware
# ─────────────────────────────────────────────────────────────
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# ─────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION, "timestamp": datetime.now().isoformat()}

# ─────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────

@app.post("/api/auth/telegram", response_model=ResponseModel)
@limiter.limit("5/minute")
async def auth_telegram(request: Request, body: TelegramAuthRequest):
    """Authenticate via Telegram WebApp initData."""
    init_data = body.initData
    tg_user = Auth.verify_telegram_init_data(init_data)

    telegram_id = str(tg_user.get("id"))
    username = tg_user.get("username") or tg_user.get("first_name", f"user_{telegram_id}")
    avatar_url = tg_user.get("photo_url")

    existing = db.get_service_client().table("users").select("*").eq("telegram_id", telegram_id).execute()

    if existing.data:
        user = existing.data[0]
        db.get_service_client().table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()
    else:
        user = _create_user(telegram_id=telegram_id, username=username, avatar_url=avatar_url, auth_provider="telegram")

    token = Auth.create_jwt(user["id"])
    logger.info("auth_telegram_success", user_id=user["id"], username=username)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/base-wallet", response_model=ResponseModel)
@limiter.limit("5/minute")
async def auth_base_wallet(request: Request, body: BaseWalletAuthRequest):
    """Authenticate via Base wallet signature."""
    wallet_address = body.walletAddress.lower()
    signature = body.signature
    message = body.message

    if not Auth.verify_base_wallet(wallet_address, signature, message):
        raise HTTPException(status_code=401, detail="Invalid wallet signature")

    existing = db.get_service_client().table("users").select("*").eq("wallet_address", wallet_address).execute()
    if existing.data:
        user = existing.data[0]
    else:
        user = _create_user(wallet_address=wallet_address, username=f"0x{wallet_address[2:6]}...{wallet_address[-4:]}", auth_provider="base")

    token = Auth.create_jwt(user["id"])
    logger.info("auth_base_wallet_success", user_id=user["id"])
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/guest", response_model=ResponseModel)
@limiter.limit("5/minute")
async def auth_guest(request: Request):
    """Create a guest account."""
    uid = uuid.uuid4().hex[:8]
    user = _create_user(username=f"Guest_{uid}", auth_provider="guest")
    token = Auth.create_jwt(user["id"])
    logger.info("auth_guest_success", user_id=user["id"])
    return ResponseModel(data={"token": token, "user": user})


def _create_user(telegram_id=None, wallet_address=None, username="Learner", avatar_url=None, auth_provider="guest") -> dict:
    payload = {
        "id": str(uuid.uuid4()),
        "telegram_id": telegram_id,
        "wallet_address": wallet_address,
        "username": username,
        "avatar_url": avatar_url,
        "auth_provider": auth_provider,
        "points": settings.WELCOME_BONUS,
        "streak": 1,
        "last_played": date.today().isoformat(),
        "current_level": 1,
        "completed_levels": [],
        "perfect_levels": [],
        "python_chapters_completed": [],
        "active_track": "crypto",
        "boosters": {"hammer": 3, "lightning": 2, "shuffle": 5},
        "achievements": [],
        "settings": {"notifications": True, "sound": True, "haptics": True},
        "created_at": datetime.now().isoformat(),
        "last_login": datetime.now().isoformat(),
    }
    result = db.get_service_client().table("users").insert(payload).execute()
    logger.info("user_created", user_id=payload["id"], auth_provider=auth_provider)
    return result.data[0]

# ─────────────────────────────────────────────────────────────
# USER ROUTES
# ─────────────────────────────────────────────────────────────

@app.get("/api/users/me", response_model=ResponseModel)
async def get_me(current_user: dict = Depends(Auth.get_current_user)):
    rank_result = db.get_client().rpc("get_user_rank", {"user_id": current_user["id"]}).execute()
    current_user["rank"] = rank_result.data if rank_result.data else None
    return ResponseModel(data=current_user)


@app.put("/api/users/me", response_model=ResponseModel)
async def update_me(updates: UserUpdate, current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_client().table("users").update(
        updates.dict(exclude_unset=True)
    ).eq("id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0])


@app.post("/api/users/streak", response_model=ResponseModel)
async def check_streak(current_user: dict = Depends(Auth.get_current_user)):
    """Call once per session to maintain streak."""
    today = date.today().isoformat()
    last = current_user.get("last_played", today)
    diff = (date.today() - date.fromisoformat(last)).days
    new_streak = current_user.get("streak", 1)

    if diff == 1:
        new_streak += 1
    elif diff > 1:
        new_streak = 1

    bonus = 0
    if new_streak <= len(settings.STREAK_BONUS):
        bonus = settings.STREAK_BONUS[new_streak - 1]

    db.get_client().table("users").update({
        "streak": new_streak,
        "last_played": today,
        "points": current_user["points"] + bonus,
    }).eq("id", current_user["id"]).execute()

    return ResponseModel(data={"streak": new_streak, "bonus_earned": bonus})


@app.post("/api/users/onboarding-complete", response_model=ResponseModel)
async def complete_onboarding(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """Mark user's onboarding as completed and save initial preferences."""
    updates = {"onboarding_completed": True}
    if body.get("active_track"):
        updates["active_track"] = body["active_track"]
    if body.get("recommended_tracks"):
        updates["recommended_tracks"] = body["recommended_tracks"]
    result = db.get_client().table("users").update(updates).eq("id", current_user["id"]).execute()
    logger.info("onboarding_completed", user_id=current_user["id"], track=body.get("active_track"))
    return ResponseModel(data=result.data[0])

# ─────────────────────────────────────────────────────────────
# GAME / PROGRESS ROUTES
# ─────────────────────────────────────────────────────────────

@app.post("/api/game/complete-level", response_model=ResponseModel)
@limiter.limit("30/minute")
async def complete_level(
    request: Request,
    level_data: LevelComplete,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user)
):
    user_id = current_user["id"]
    level_id = level_data.level_id
    completed = current_user.get("completed_levels", [])
    perfect = current_user.get("perfect_levels", [])

    is_new = str(level_id) not in completed
    xp = settings.LEVEL_COMPLETE_XP if is_new else 50
    if level_data.is_perfect and str(level_id) not in perfect:
        xp += settings.PERFECT_LEVEL_BONUS

    if is_new:
        completed.append(str(level_id))
    if level_data.is_perfect and str(level_id) not in perfect:
        perfect.append(str(level_id))

    # Track Python chapter completion for quant gate
    python_chapters = current_user.get("python_chapters_completed", [])
    if level_data.track == TrackType.PYTHON:
        chapter = _get_python_chapter(level_id)
        if chapter and str(chapter) not in python_chapters:
            if _chapter_fully_complete(chapter, completed):
                python_chapters.append(str(chapter))

    new_points = current_user["points"] + xp
    next_level = max(current_user["current_level"], level_id + 1)

    db.get_client().table("users").update({
        "points": new_points,
        "completed_levels": completed,
        "perfect_levels": perfect,
        "current_level": next_level,
        "python_chapters_completed": python_chapters,
        "active_track": level_data.track,
    }).eq("id", user_id).execute()

    db.get_client().table("level_scores").upsert({
        "user_id": user_id,
        "level": level_id,
        "score": level_data.score,
        "stars": 3 if level_data.is_perfect else (2 if level_data.score > 150 else 1),
    }).execute()

    db.get_service_client().table("transactions").insert({
        "user_id": user_id,
        "type": "earn",
        "amount": xp,
        "balance_after": new_points,
        "description": f"Completed level {level_id} ({level_data.track})",
    }).execute()

    background_tasks.add_task(_check_achievements, user_id, completed, current_user.get("streak", 1))

    logger.info("level_completed", user_id=user_id, level_id=level_id, xp=xp, track=level_data.track)

    return ResponseModel(data={
        "xp_earned": xp,
        "new_points": new_points,
        "next_level": next_level,
        "python_chapters_completed": python_chapters,
        "quant_unlocked": len(python_chapters) >= settings.QUANT_PYTHON_GATE_CHAPTERS,
    })


@app.get("/api/game/state", response_model=ResponseModel)
async def get_game_state(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_client().table("game_states").select("state").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0]["state"] if result.data else {})


@app.post("/api/game/state", response_model=ResponseModel)
@limiter.limit("30/minute")
async def save_game_state(request: Request, game_state: GameState, current_user: dict = Depends(Auth.get_current_user)):
    existing = db.get_client().table("game_states").select("id").eq("user_id", current_user["id"]).execute()
    if existing.data:
        db.get_client().table("game_states").update({"state": game_state.state, "updated_at": datetime.now().isoformat()}).eq("user_id", current_user["id"]).execute()
    else:
        db.get_client().table("game_states").insert({"user_id": current_user["id"], "state": game_state.state}).execute()
    return ResponseModel(success=True)


# ── Last Position (Resume) ──────────────────────────────────

@app.post("/api/game/last-position", response_model=ResponseModel)
async def save_last_position(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """Save user's last lesson position for cross-device resume."""
    position = body.get("position", {})
    existing = db.get_client().table("game_states").select("id, state").eq("user_id", current_user["id"]).execute()
    if existing.data:
        state = existing.data[0].get("state", {})
        state["last_position"] = position
        db.get_client().table("game_states").update({"state": state, "updated_at": datetime.now().isoformat()}).eq("user_id", current_user["id"]).execute()
    else:
        db.get_client().table("game_states").insert({"user_id": current_user["id"], "state": {"last_position": position}}).execute()
    return ResponseModel(success=True)


@app.delete("/api/game/last-position", response_model=ResponseModel)
async def clear_last_position(current_user: dict = Depends(Auth.get_current_user)):
    """Clear user's saved lesson position."""
    existing = db.get_client().table("game_states").select("id, state").eq("user_id", current_user["id"]).execute()
    if existing.data:
        state = existing.data[0].get("state", {})
        state.pop("last_position", None)
        db.get_client().table("game_states").update({"state": state, "updated_at": datetime.now().isoformat()}).eq("user_id", current_user["id"]).execute()
    return ResponseModel(success=True)

# ─────────────────────────────────────────────────────────────
# INTERVIEW MODE
# ─────────────────────────────────────────────────────────────

@app.post("/api/interview/start", response_model=ResponseModel)
async def interview_start(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    interview_id = str(uuid.uuid4())
    interview_data = {
        "id": interview_id,
        "user_id": current_user["id"],
        "track_id": body.get("track_id", ""),
        "level": body.get("level", "junior"),
        "status": "in_progress",
        "answers": [],
        "started_at": datetime.now().isoformat(),
    }
    db.get_service_client().table("interviews").insert(interview_data).execute()
    logger.info("interview_started", user_id=current_user["id"], track=body.get("track_id"), level=body.get("level"))
    return ResponseModel(data=interview_data)


@app.post("/api/interview/answer", response_model=ResponseModel)
async def interview_answer(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    interview_id = body.get("interview_id", "")
    result = db.get_service_client().table("interviews").select("*").eq("id", interview_id).eq("user_id", current_user["id"]).single().execute()
    if not result.data:
        raise HTTPException(404, "Interview not found")
    interview = result.data
    if interview["status"] != "in_progress":
        raise HTTPException(400, "Interview already completed")
    answers = interview.get("answers", [])
    answers.append({
        "question_index": body.get("question_index", len(answers)),
        "answer": body.get("answer", ""),
        "answered_at": datetime.now().isoformat(),
    })
    db.get_service_client().table("interviews").update({"answers": answers}).eq("id", interview_id).execute()
    return ResponseModel(data={"interview_id": interview_id, "answers_count": len(answers)})


@app.get("/api/interview/{interview_id}/result", response_model=ResponseModel)
async def interview_result(interview_id: str, current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("interviews").select("*").eq("id", interview_id).eq("user_id", current_user["id"]).single().execute()
    if not result.data:
        raise HTTPException(404, "Interview not found")
    return ResponseModel(data=result.data)


@app.get("/api/game/quant-gate", response_model=ResponseModel)
async def quant_gate_status(current_user: dict = Depends(Auth.get_current_user)):
    """
    Track unlock gates:
    - Quant Trader: always unlocked (starts from Lab 0 math, no Python prereq)
    - Quant Researcher: always unlocked (starts from stats/math)
    - Quant Developer: requires Python chapters 1-5 completed first
    """
    completed_chapters = current_user.get("python_chapters_completed", [])
    dev_unlocked = len(completed_chapters) >= settings.QUANT_DEV_PYTHON_GATE_CHAPTERS
    return ResponseModel(data={
        "quant_trader_unlocked": True,
        "quant_researcher_unlocked": True,
        "quant_developer_unlocked": dev_unlocked,
        "python_chapters_completed": len(completed_chapters),
        "python_chapters_required_for_dev": settings.QUANT_DEV_PYTHON_GATE_CHAPTERS,
        "chapters_done": completed_chapters,
    })

# ─────────────────────────────────────────────────────────────
# LEADERBOARD
# ─────────────────────────────────────────────────────────────

@app.get("/api/leaderboard/users", response_model=ResponseModel)
async def leaderboard_users(limit: int = 100, offset: int = 0):
    result = db.get_client().table("users").select(
        "id, username, points, streak, current_level, avatar_url"
    ).order("points", desc=True).range(offset, offset + limit - 1).execute()
    data = [{"rank": offset + i + 1, **u} for i, u in enumerate(result.data)]
    return ResponseModel(data=data)


@app.get("/api/leaderboard/guilds", response_model=ResponseModel)
async def leaderboard_guilds(limit: int = 50):
    result = db.get_client().table("guilds").select(
        "id, name, total_points, member_count"
    ).order("total_points", desc=True).limit(limit).execute()
    data = [{"rank": i + 1, **g} for i, g in enumerate(result.data)]
    return ResponseModel(data=data)

# ─────────────────────────────────────────────────────────────
# GUILDS
# ─────────────────────────────────────────────────────────────

@app.get("/api/guilds", response_model=ResponseModel)
async def list_guilds(search: Optional[str] = None, limit: int = 20):
    q = db.get_client().table("guilds").select("*")
    if search:
        q = q.ilike("name", f"%{search}%")
    result = q.order("total_points", desc=True).limit(limit).execute()
    return ResponseModel(data=result.data)


@app.post("/api/guilds", response_model=ResponseModel)
async def create_guild(guild: GuildCreate, current_user: dict = Depends(Auth.get_current_user)):
    if current_user.get("guild_id"):
        raise HTTPException(400, "Already in a guild")
    result = db.get_service_client().table("guilds").insert({
        "id": str(uuid.uuid4()),
        "name": guild.name,
        "description": guild.description,
        "icon": guild.icon,
        "is_private": guild.is_private,
        "requires_approval": guild.requires_approval,
        "min_level": guild.min_level,
        "owner_id": current_user["id"],
        "created_at": datetime.now().isoformat(),
    }).execute()
    gid = result.data[0]["id"]
    db.get_service_client().table("guild_members").insert({"guild_id": gid, "user_id": current_user["id"], "role": "leader"}).execute()
    db.get_client().table("users").update({"guild_id": gid, "guild_role": "leader"}).eq("id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0])


@app.post("/api/guilds/{guild_id}/join", response_model=ResponseModel)
async def join_guild(guild_id: str, current_user: dict = Depends(Auth.get_current_user)):
    if current_user.get("guild_id"):
        raise HTTPException(400, "Already in a guild")
    guild = db.get_client().table("guilds").select("*").eq("id", guild_id).execute()
    if not guild.data:
        raise HTTPException(404, "Guild not found")
    db.get_service_client().table("guild_members").insert({"guild_id": guild_id, "user_id": current_user["id"], "role": "member"}).execute()
    db.get_client().table("users").update({"guild_id": guild_id, "guild_role": "member"}).eq("id", current_user["id"]).execute()
    return ResponseModel(success=True)

# ─────────────────────────────────────────────────────────────
# WITHDRAWALS
# ─────────────────────────────────────────────────────────────

@app.post("/api/withdrawals", response_model=ResponseModel)
async def request_withdrawal(withdrawal: WithdrawalRequest, current_user: dict = Depends(Auth.get_current_user)):
    if withdrawal.points_used < settings.MIN_WITHDRAWAL:
        raise HTTPException(400, f"Minimum withdrawal is {settings.MIN_WITHDRAWAL} points")
    if current_user["points"] < withdrawal.points_used:
        raise HTTPException(400, "Insufficient points")

    month_start = date.today().replace(day=1).isoformat()
    monthly = db.get_client().table("withdrawals").select("points_used").eq("user_id", current_user["id"]).gte("created_at", month_start).execute()
    monthly_total = sum(w["points_used"] for w in monthly.data) if monthly.data else 0
    max_monthly = settings.MAX_WITHDRAWAL_VERIFIED if current_user.get("is_verified") else settings.MAX_WITHDRAWAL_MONTHLY
    if monthly_total + withdrawal.points_used > max_monthly:
        raise HTTPException(400, "Monthly withdrawal limit exceeded")

    new_points = current_user["points"] - withdrawal.points_used
    result = db.get_service_client().table("withdrawals").insert({
        "user_id": current_user["id"],
        "points_used": withdrawal.points_used,
        "method": withdrawal.method,
        "destination": withdrawal.destination,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }).execute()
    db.get_client().table("users").update({"points": new_points}).eq("id", current_user["id"]).execute()
    logger.info("withdrawal_requested", user_id=current_user["id"], points=withdrawal.points_used)
    return ResponseModel(data=result.data[0])


@app.get("/api/withdrawals", response_model=ResponseModel)
async def get_withdrawals(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_client().table("withdrawals").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return ResponseModel(data=result.data)

# ─────────────────────────────────────────────────────────────
# FEEDBACK
# ─────────────────────────────────────────────────────────────

@app.post("/api/feedback", response_model=ResponseModel)
async def submit_feedback(feedback: FeedbackCreate, current_user: Optional[dict] = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("feedback").insert({
        "user_id": current_user["id"] if current_user else None,
        "type": feedback.type,
        "message": feedback.message,
        "level": feedback.level_id,
        "created_at": datetime.now().isoformat(),
    }).execute()
    return ResponseModel(data=result.data[0])

# ─────────────────────────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────────────────────────

@app.post("/api/analytics/event", response_model=ResponseModel)
async def track_event(event: AnalyticsEvent, current_user: Optional[dict] = Depends(Auth.get_current_user)):
    db.get_service_client().table("analytics_events").insert({
        "user_id": current_user["id"] if current_user else None,
        "event_type": event.event_type,
        "event_data": event.event_data,
        "session_id": event.session_id,
        "created_at": datetime.now().isoformat(),
    }).execute()
    return ResponseModel(success=True)

# ─────────────────────────────────────────────────────────────
# PUSH NOTIFICATIONS
# ─────────────────────────────────────────────────────────────

@app.post("/api/users/push-token", response_model=ResponseModel)
async def save_push_token(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    push_token = body.get("token", "")
    if not push_token:
        raise HTTPException(400, "Push token is required")
    db.get_client().table("users").update({"push_token": push_token}).eq("id", current_user["id"]).execute()
    logger.info("push_token_saved", user_id=current_user["id"])
    return ResponseModel(success=True)

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _get_python_chapter(level_id: int) -> Optional[int]:
    """Map python level ID to chapter number. IDs 2001-2080, 10 per chapter."""
    if 2001 <= level_id <= 2080:
        return ((level_id - 2001) // 10) + 1
    return None

def _chapter_fully_complete(chapter: int, completed: list) -> bool:
    """Check all 10 levels in a python chapter are done."""
    start = 2001 + (chapter - 1) * 10
    return all(str(lid) in completed for lid in range(start, start + 10))

async def _check_achievements(user_id: str, completed: list, streak: int):
    """Background task: award achievements."""
    count = len(completed)
    milestones = {
        1: "first_level", 15: "island_1", 30: "island_2",
        45: "island_3", 60: "island_4", 75: "island_5",
        90: "island_6", 105: "island_7", 120: "island_8",
    }
    user = db.get_client().table("users").select("achievements").eq("id", user_id).single().execute()
    if not user.data:
        return
    current = set(user.data.get("achievements", []))
    new_ach = []
    for threshold, aid in milestones.items():
        if count >= threshold and aid not in current:
            new_ach.append(aid)
    streak_milestones = {7: "streak_7", 30: "streak_30", 100: "streak_100"}
    for s, aid in streak_milestones.items():
        if streak >= s and aid not in current:
            new_ach.append(aid)
    if new_ach:
        db.get_client().table("users").update(
            {"achievements": list(current | set(new_ach))}
        ).eq("id", user_id).execute()

# ─────────────────────────────────────────────────────────────
# GITHUB OAUTH + PORTFOLIO PUSH
# ─────────────────────────────────────────────────────────────

@app.get("/api/github/auth-url", response_model=ResponseModel)
async def github_auth_url(current_user: dict = Depends(Auth.get_current_user)):
    """Return the GitHub OAuth URL for the user to visit."""
    state = secrets.token_urlsafe(16)
    redis_client.setex(f"github_state:{state}", 600, current_user["id"])
    client_id = settings.GITHUB_CLIENT_ID
    scope = "repo,read:user"
    redirect = urllib.parse.quote(settings.GITHUB_REDIRECT_URI, safe="")
    url = f"https://github.com/login/oauth/authorize?client_id={client_id}&scope={scope}&state={state}&redirect_uri={settings.GITHUB_REDIRECT_URI}"
    return ResponseModel(data={"url": url, "state": state})


@app.get("/api/github/callback")
async def github_callback(code: str, state: str):
    """GitHub redirects here. Exchange code for token, save to user."""
    raw_user_id = redis_client.get(f"github_state:{state}")
    if not raw_user_id:
        raise HTTPException(400, "Invalid or expired state")
    user_id = raw_user_id.decode() if isinstance(raw_user_id, bytes) else raw_user_id
    redis_client.delete(f"github_state:{state}")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={"client_id": settings.GITHUB_CLIENT_ID,
                  "client_secret": settings.GITHUB_CLIENT_SECRET,
                  "code": code},
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(400, "GitHub auth failed")

    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}", "Accept": "application/json"},
        )
        gh_user = user_res.json()

    db.get_service_client().table("users").update({
        "github_token": encrypt_token(access_token),
        "github_username": gh_user.get("login"),
        "github_avatar": gh_user.get("avatar_url"),
    }).eq("id", user_id).execute()

    logger.info("github_connected", user_id=user_id, github_username=gh_user.get("login"))

    # Redirect back into the app via deep link
    return {"success": True, "github_username": gh_user.get("login")}


@app.get("/api/github/status", response_model=ResponseModel)
async def github_status(current_user: dict = Depends(Auth.get_current_user)):
    """Return whether this user has connected GitHub."""
    return ResponseModel(data={
        "connected": bool(current_user.get("github_token")),
        "username": current_user.get("github_username"),
        "avatar": current_user.get("github_avatar"),
    })


@app.post("/api/github/disconnect", response_model=ResponseModel)
async def github_disconnect(current_user: dict = Depends(Auth.get_current_user)):
    db.get_service_client().table("users").update({
        "github_token": None,
        "github_username": None,
        "github_avatar": None,
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(success=True)


@app.post("/api/github/push-portfolio", response_model=ResponseModel)
@limiter.limit("10/minute")
async def push_portfolio(request: Request, body: PushPortfolioRequest, current_user: dict = Depends(Auth.get_current_user)):
    """
    Create or update a GitHub repo with the user's quant portfolio.
    body: { repo_name, description, files: [{path, content}] }
    """
    encrypted_token = current_user.get("github_token")
    if not encrypted_token:
        raise HTTPException(400, "GitHub not connected")
    token = decrypt_token(encrypted_token)
    if not token:
        raise HTTPException(400, "GitHub token invalid or expired. Please reconnect.")

    gh_user = current_user.get("github_username")
    repo_name = body.repo_name.strip()
    description = body.description
    files = body.files

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient() as client:
        # Check if repo exists
        check = await client.get(f"https://api.github.com/repos/{gh_user}/{repo_name}", headers=headers)

        if check.status_code == 404:
            # Create repo
            create = await client.post(
                "https://api.github.com/user/repos",
                headers=headers,
                json={
                    "name": repo_name,
                    "description": description,
                    "private": False,
                    "auto_init": True,
                    "has_readme": True,
                },
            )
            if create.status_code not in (200, 201):
                raise HTTPException(400, f"Could not create repo: {create.text}")

        # Push each file
        pushed = []
        for file in files:
            path = file["path"]
            content = file["content"]
            encoded = base64.b64encode(content.encode()).decode()

            # Check if file exists to get SHA for update
            file_check = await client.get(
                f"https://api.github.com/repos/{gh_user}/{repo_name}/contents/{path}",
                headers=headers,
            )
            sha = file_check.json().get("sha") if file_check.status_code == 200 else None

            payload = {
                "message": f"Update {path} via Sifter Skill_Up",
                "content": encoded,
            }
            if sha:
                payload["sha"] = sha

            put = await client.put(
                f"https://api.github.com/repos/{gh_user}/{repo_name}/contents/{path}",
                headers=headers,
                json=payload,
            )
            if put.status_code in (200, 201):
                pushed.append(path)

    repo_url = f"https://github.com/{gh_user}/{repo_name}"

    # Award achievement
    achievements = current_user.get("achievements", [])
    if "github_portfolio" not in achievements:
        achievements.append("github_portfolio")
        db.get_client().table("users").update({
            "achievements": achievements,
            "points": current_user["points"] + 500,
        }).eq("id", current_user["id"]).execute()

    logger.info("portfolio_pushed", user_id=current_user["id"], repo=repo_name, files_pushed=len(pushed))

    return ResponseModel(data={
        "repo_url": repo_url,
        "files_pushed": pushed,
        "message": f"Portfolio live at {repo_url}",
    })


@app.post("/api/github/create-repo", response_model=ResponseModel)
@limiter.limit("10/minute")
async def create_repo(request: Request, body: CreateRepoRequest, current_user: dict = Depends(Auth.get_current_user)):
    """Create a blank repo (used in the GitHub learn module)."""
    encrypted_token = current_user.get("github_token")
    if not encrypted_token:
        raise HTTPException(400, "GitHub not connected")
    token = decrypt_token(encrypted_token)
    if not token:
        raise HTTPException(400, "GitHub token invalid or expired. Please reconnect.")

    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.github.com/user/repos",
            headers=headers,
            json={
                "name": body.name,
                "description": body.description,
                "private": body.private,
                "auto_init": True,
            },
        )
    if res.status_code not in (200, 201):
        raise HTTPException(400, f"GitHub error: {res.json().get('message', res.text)}")
    data = res.json()
    logger.info("repo_created", user_id=current_user["id"], repo=data["name"])
    return ResponseModel(data={"url": data["html_url"], "name": data["name"], "clone_url": data["clone_url"]})


@app.get("/api/github/repos", response_model=ResponseModel)
async def list_repos(current_user: dict = Depends(Auth.get_current_user)):
    """List user's GitHub repos."""
    encrypted_token = current_user.get("github_token")
    if not encrypted_token:
        raise HTTPException(400, "GitHub not connected")
    token = decrypt_token(encrypted_token)
    if not token:
        raise HTTPException(400, "GitHub token invalid or expired. Please reconnect.")

    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient() as client:
        res = await client.get("https://api.github.com/user/repos?sort=updated&per_page=20", headers=headers)
    repos = [{"name": r["name"], "url": r["html_url"], "description": r["description"],
               "stars": r["stargazers_count"], "updated": r["updated_at"]} for r in res.json()]
    return ResponseModel(data=repos)

# ─────────────────────────────────────────────────────────────
# Portfolio Hub Router
# ─────────────────────────────────────────────────────────────
from portfolio_routes import portfolio_router
app.include_router(portfolio_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
