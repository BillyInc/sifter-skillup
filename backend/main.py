# ============================================
# Sifter LevelUp — FastAPI Backend v2
# All routers registered, all middleware wired
# ============================================
import uuid, bcrypt, base64, secrets, urllib.parse, httpx
from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import db
from models import *
from auth import Auth
from logger import log
from middleware.session_middleware import DeviceSessionMiddleware

# ─────────────────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    log.info("Application shutdown")

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

# ── Middleware (order matters: CORS first, then device check) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(DeviceSessionMiddleware)

# ── Request logging ────────────────────────────────────────────
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = datetime.now()
    try:
        response = await call_next(request)
        duration = (datetime.now() - start_time).total_seconds() * 1000
        log.info("Request completed",
                 endpoint=request.url.path, method=request.method,
                 duration=f"{duration:.2f}ms", status=response.status_code)
        return response
    except Exception as e:
        duration = (datetime.now() - start_time).total_seconds() * 1000
        log.error("Request failed", error=e, endpoint=request.url.path,
                  method=request.method, duration=f"{duration:.2f}ms")
        raise


# ─────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION, "timestamp": datetime.now().isoformat()}


# ─────────────────────────────────────────────────────────────
# AUTH ROUTES (unchanged from original)
# ─────────────────────────────────────────────────────────────

@app.post("/api/auth/telegram", response_model=ResponseModel)
async def auth_telegram(body: dict, request: Request):
    init_data = body.get("initData", "")
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
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/base-wallet", response_model=ResponseModel)
async def auth_base_wallet(body: dict, request: Request):
    wallet_address = body.get("walletAddress", "").lower()
    signature = body.get("signature", "")
    message = body.get("message", "Sign in to Sifter LevelUp")
    if not Auth.verify_base_wallet(wallet_address, signature, message):
        raise HTTPException(status_code=401, detail="Invalid wallet signature")
    existing = db.get_service_client().table("users").select("*").eq("wallet_address", wallet_address).execute()
    if existing.data:
        user = existing.data[0]
    else:
        user = _create_user(wallet_address=wallet_address, username=f"0x{wallet_address[2:6]}…{wallet_address[-4:]}", auth_provider="base")
    token = Auth.create_jwt(user["id"])
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/guest", response_model=ResponseModel)
async def auth_guest(request: Request):
    uid = uuid.uuid4().hex[:8]
    user = _create_user(username=f"Guest_{uid}", auth_provider="guest")
    token = Auth.create_jwt(user["id"])
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/signup", response_model=ResponseModel)
async def auth_signup(body: dict, request: Request):
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    username = body.get("username") or email.split("@")[0]
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = db.get_service_client().table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = _create_user(username=username, auth_provider="email", email=email, password_hash=password_hash)
    token = Auth.create_jwt(user["id"])
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/login", response_model=ResponseModel)
async def auth_login(body: dict, request: Request):
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    result = db.get_service_client().table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not user.get("password_hash") or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    db.get_service_client().table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()
    token = Auth.create_jwt(user["id"])
    user.pop("password_hash", None)
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/users/onboarding-complete", response_model=ResponseModel)
async def complete_onboarding(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    updates = {"onboarding_completed": True}
    if body.get("active_track"):
        updates["active_track"] = body["active_track"]
        updates["current_track_id"] = body["active_track"]
    if body.get("active_field_id"):
        updates["active_field_id"] = body["active_field_id"]
    result = db.get_service_client().table("users").update(updates).eq("id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0])


# ── Shared helper ──────────────────────────────────────────────

async def _post_auth_device_register(user_id: str, body: dict, request: Request):
    """Register/refresh device session after any successful auth."""
    from middleware.device_sessions import register_device_for_user
    device_id   = body.get("device_id") or request.headers.get("X-Device-Id", "")
    device_name = body.get("device_name") or request.headers.get("X-Device-Name", "Unknown")
    platform    = body.get("platform")   or request.headers.get("X-Platform", "unknown")
    app_version = body.get("app_version") or request.headers.get("X-App-Version", "unknown")
    push_token  = body.get("push_token")
    if device_id:
        await register_device_for_user(user_id, device_id, device_name, platform, app_version, push_token)


def _create_user(telegram_id=None, wallet_address=None, username="Learner",
                 avatar_url=None, auth_provider="guest", email=None, password_hash=None) -> dict:
    payload = {
        "id": str(uuid.uuid4()), "telegram_id": telegram_id,
        "wallet_address": wallet_address, "email": email, "password_hash": password_hash,
        "username": username, "avatar_url": avatar_url, "auth_provider": auth_provider,
        "account_type": "student",
        "points": settings.WELCOME_BONUS, "streak": 1,
        "last_played": date.today().isoformat(), "current_level": 1,
        "completed_levels": [], "perfect_levels": [], "python_chapters_completed": [],
        "active_track": "crypto", "boosters": {"hammer": 3, "lightning": 2, "shuffle": 5},
        "achievements": [], "settings": {"notifications": True, "sound": True, "haptics": True},
        "created_at": datetime.now().isoformat(), "last_login": datetime.now().isoformat(),
    }
    result = db.get_service_client().table("users").insert(payload).execute()
    return result.data[0]


# ─────────────────────────────────────────────────────────────
# USER ROUTES
# ─────────────────────────────────────────────────────────────

@app.get("/api/users/me", response_model=ResponseModel)
async def get_me(current_user: dict = Depends(Auth.get_current_user)):
    rank_result = db.get_client().rpc("get_user_rank", {"user_id": current_user["id"]}).execute()
    current_user["rank"] = rank_result.data if rank_result.data else None
    current_user.pop("password_hash", None)
    # Backward-compatible: legacy rows predate account_type — default to student.
    current_user.setdefault("account_type", "student")
    return ResponseModel(data=current_user)


@app.put("/api/users/me", response_model=ResponseModel)
async def update_me(updates: UserUpdate, current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_client().table("users").update(
        updates.dict(exclude_unset=True)
    ).eq("id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0])


@app.post("/api/users/streak", response_model=ResponseModel)
async def check_streak(current_user: dict = Depends(Auth.get_current_user)):
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
        "streak": new_streak, "last_played": today,
        "points": current_user["points"] + bonus,
    }).eq("id", current_user["id"]).execute()
    return ResponseModel(data={"streak": new_streak, "bonus_earned": bonus})


# ─────────────────────────────────────────────────────────────
# GAME / PROGRESS (unchanged from original)
# ─────────────────────────────────────────────────────────────

@app.post("/api/game/complete-level", response_model=ResponseModel)
async def complete_level(level_data: LevelComplete, background_tasks: BackgroundTasks, current_user: dict = Depends(Auth.get_current_user)):
    user_id = current_user["id"]
    level_id = level_data.level_id
    completed = current_user.get("completed_levels", [])
    perfect = current_user.get("perfect_levels", [])
    is_new = str(level_id) not in completed
    xp = settings.LEVEL_COMPLETE_XP if is_new else 50
    if level_data.is_perfect and str(level_id) not in perfect:
        xp += settings.PERFECT_LEVEL_BONUS
    if is_new: completed.append(str(level_id))
    if level_data.is_perfect and str(level_id) not in perfect: perfect.append(str(level_id))
    python_chapters = current_user.get("python_chapters_completed", [])
    if level_data.track == TrackType.PYTHON:
        chapter = _get_python_chapter(level_id)
        if chapter and str(chapter) not in python_chapters:
            if _chapter_fully_complete(chapter, completed):
                python_chapters.append(str(chapter))
    new_points = current_user["points"] + xp
    next_level = max(current_user["current_level"], level_id + 1)
    db.get_client().table("users").update({
        "points": new_points, "completed_levels": completed, "perfect_levels": perfect,
        "current_level": next_level, "python_chapters_completed": python_chapters,
        "active_track": level_data.track,
    }).eq("id", user_id).execute()
    db.get_client().table("level_scores").upsert({
        "user_id": user_id, "level": level_id, "score": level_data.score,
        "stars": 3 if level_data.is_perfect else (2 if level_data.score > 150 else 1),
    }).execute()
    db.get_service_client().table("transactions").insert({
        "user_id": user_id, "type": "earn", "amount": xp, "balance_after": new_points,
        "description": f"Completed level {level_id} ({level_data.track})",
    }).execute()
    background_tasks.add_task(_check_achievements, user_id, completed, current_user.get("streak", 1))
    return ResponseModel(data={"xp_earned": xp, "new_points": new_points, "next_level": next_level, "python_chapters_completed": python_chapters, "quant_unlocked": len(python_chapters) >= settings.QUANT_DEV_PYTHON_GATE_CHAPTERS})


@app.get("/api/game/state", response_model=ResponseModel)
async def get_game_state(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_client().table("game_states").select("state").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0]["state"] if result.data else {})


@app.post("/api/game/state", response_model=ResponseModel)
async def save_game_state(game_state: GameState, current_user: dict = Depends(Auth.get_current_user)):
    existing = db.get_client().table("game_states").select("id").eq("user_id", current_user["id"]).execute()
    if existing.data:
        db.get_client().table("game_states").update({"state": game_state.state, "updated_at": datetime.now().isoformat()}).eq("user_id", current_user["id"]).execute()
    else:
        db.get_client().table("game_states").insert({"user_id": current_user["id"], "state": game_state.state}).execute()
    return ResponseModel(success=True)


@app.get("/api/game/quant-gate", response_model=ResponseModel)
async def quant_gate_status(current_user: dict = Depends(Auth.get_current_user)):
    completed_chapters = current_user.get("python_chapters_completed", [])
    dev_unlocked = len(completed_chapters) >= settings.QUANT_DEV_PYTHON_GATE_CHAPTERS
    return ResponseModel(data={"quant_trader_unlocked": True, "quant_researcher_unlocked": True, "quant_developer_unlocked": dev_unlocked, "python_chapters_completed": len(completed_chapters), "python_chapters_required_for_dev": settings.QUANT_DEV_PYTHON_GATE_CHAPTERS, "chapters_done": completed_chapters})


# ── Leaderboard / Guilds / Withdrawals / Feedback / Analytics (unchanged) ──────
# (copy these blocks from original main.py unchanged — omitted here for brevity)


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def _get_python_chapter(level_id: int) -> Optional[int]:
    if 2001 <= level_id <= 2080: return ((level_id - 2001) // 10) + 1
    return None

def _chapter_fully_complete(chapter: int, completed: list) -> bool:
    start = 2001 + (chapter - 1) * 10
    return all(str(lid) in completed for lid in range(start, start + 10))

async def _check_achievements(user_id: str, completed: list, streak: int):
    count = len(completed)
    milestones = {1: "first_level", 15: "island_1", 30: "island_2", 45: "island_3", 60: "island_4"}
    user = db.get_client().table("users").select("achievements").eq("id", user_id).single().execute()
    if not user.data: return
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
        db.get_client().table("users").update({"achievements": list(current | set(new_ach))}).eq("id", user_id).execute()


# ─────────────────────────────────────────────────────────────
# INCLUDE ALL ROUTERS
# ─────────────────────────────────────────────────────────────

# ── Original routers ──────────────────────────────────────────
from routes.portfolio_routes import portfolio_router
app.include_router(portfolio_router)

from routes.missing_routes import (
    position_router, flags_router, reviews_router,
    analytics_extra_router, social_blast_router,
    notifications_router, community_router, social_router,
)
app.include_router(position_router)
app.include_router(flags_router)
app.include_router(reviews_router)
app.include_router(analytics_extra_router)
app.include_router(social_blast_router)
app.include_router(notifications_router)
app.include_router(community_router)
app.include_router(social_router)

from routes.community_routes import community_v2_router, ai_router, scenarios_router
app.include_router(community_v2_router)
app.include_router(ai_router)
app.include_router(scenarios_router)

# ── New routers ───────────────────────────────────────────────
from services.offline_sync import router as offline_router
app.include_router(offline_router)

from middleware.device_sessions import router as device_router
app.include_router(device_router)

from routes.starknet_routes import router as starknet_router
app.include_router(starknet_router)

from routes.guild_routes import guild_router
app.include_router(guild_router)

from routes.boss_routes import boss_router
app.include_router(boss_router)

from services.airtable_sync import router as airtable_router
app.include_router(airtable_router)

from routes.phase5_routes import router as phase5_router
app.include_router(phase5_router)

from routes.feed_routes import router as feed_router
app.include_router(feed_router)

from routes.social_rewards_routes import router as social_rewards_router
app.include_router(social_rewards_router)


from routes.interview_routes import router as interview_router
app.include_router(interview_router)

from routes.content_routes import router as content_router
app.include_router(content_router)

from routes.game_extra_routes import game_extra_router, users_extra_router
app.include_router(game_extra_router)
app.include_router(users_extra_router)

from routes.career_routes import router as career_router
app.include_router(career_router)

from routes.institutions_routes import router as institutions_router
app.include_router(institutions_router)

from routes.provisioning_routes import router as provisioning_router
app.include_router(provisioning_router)

from routes.admission_routes import router as admission_router
app.include_router(admission_router)

from routes.student_pipeline_routes import router as student_pipeline_router
app.include_router(student_pipeline_router)

from routes.feedback_routes import router as feedback_router
app.include_router(feedback_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
