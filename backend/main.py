# ============================================
# Sifter Skill_Up — FastAPI Backend
# Supports: Telegram Mini App, Base App, Web Dashboard
# ============================================
import uuid
import bcrypt
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

# ─────────────────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    print("Shutdown.")

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def auth_telegram(body: dict):
    """Authenticate via Telegram WebApp initData."""
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
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/base-wallet", response_model=ResponseModel)
async def auth_base_wallet(body: dict):
    """Authenticate via Base wallet signature."""
    wallet_address = body.get("walletAddress", "").lower()
    signature = body.get("signature", "")
    message = body.get("message", "Sign in to Sifter Skill_Up")

    if not Auth.verify_base_wallet(wallet_address, signature, message):
        raise HTTPException(status_code=401, detail="Invalid wallet signature")

    existing = db.get_service_client().table("users").select("*").eq("wallet_address", wallet_address).execute()
    if existing.data:
        user = existing.data[0]
    else:
        user = _create_user(wallet_address=wallet_address, username=f"0x{wallet_address[2:6]}…{wallet_address[-4:]}", auth_provider="base")

    token = Auth.create_jwt(user["id"])
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/guest", response_model=ResponseModel)
async def auth_guest():
    """Create a guest account."""
    uid = uuid.uuid4().hex[:8]
    user = _create_user(username=f"Guest_{uid}", auth_provider="guest")
    token = Auth.create_jwt(user["id"])
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/signup", response_model=ResponseModel)
async def auth_signup(body: dict):
    """Sign up with email and password."""
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
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/login", response_model=ResponseModel)
async def auth_login(body: dict):
    """Sign in with email and password."""
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
    # Don't send password_hash to client
    user.pop("password_hash", None)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/users/onboarding-complete", response_model=ResponseModel)
async def complete_onboarding(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """Mark onboarding as complete and optionally set active track."""
    updates = {"onboarding_completed": True}
    if body.get("active_track"):
        updates["active_track"] = body["active_track"]
    result = db.get_service_client().table("users").update(updates).eq("id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0])


def _create_user(telegram_id=None, wallet_address=None, username="Learner", avatar_url=None, auth_provider="guest", email=None, password_hash=None) -> dict:
    payload = {
        "id": str(uuid.uuid4()),
        "telegram_id": telegram_id,
        "wallet_address": wallet_address,
        "email": email,
        "password_hash": password_hash,
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

# ─────────────────────────────────────────────────────────────
# GAME / PROGRESS ROUTES
# ─────────────────────────────────────────────────────────────

@app.post("/api/game/complete-level", response_model=ResponseModel)
async def complete_level(
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

    return ResponseModel(data={
        "xp_earned": xp,
        "new_points": new_points,
        "next_level": next_level,
        "python_chapters_completed": python_chapters,
        "quant_unlocked": len(python_chapters) >= settings.QUANT_DEV_PYTHON_GATE_CHAPTERS,
    })


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)

# ─────────────────────────────────────────────────────────────
# GITHUB OAUTH + PORTFOLIO PUSH
# ─────────────────────────────────────────────────────────────

import base64, secrets, urllib.parse, httpx

GITHUB_STATES: dict = {}  # state -> user_id (in prod use Redis)

@app.get("/api/github/auth-url", response_model=ResponseModel)
async def github_auth_url(current_user: dict = Depends(Auth.get_current_user)):
    """Return the GitHub OAuth URL for the user to visit."""
    state = secrets.token_urlsafe(16)
    GITHUB_STATES[state] = current_user["id"]
    client_id = settings.GITHUB_CLIENT_ID
    scope = "repo,read:user"
    redirect = urllib.parse.quote(settings.GITHUB_REDIRECT_URI, safe="")
    url = f"https://github.com/login/oauth/authorize?client_id={client_id}&scope={scope}&state={state}&redirect_uri={settings.GITHUB_REDIRECT_URI}"
    return ResponseModel(data={"url": url, "state": state})


@app.get("/api/github/callback")
async def github_callback(code: str, state: str):
    """GitHub redirects here. Exchange code for token, save to user."""
    user_id = GITHUB_STATES.pop(state, None)
    if not user_id:
        raise HTTPException(400, "Invalid or expired state")

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
        "github_token": access_token,
        "github_username": gh_user.get("login"),
        "github_avatar": gh_user.get("avatar_url"),
    }).eq("id", user_id).execute()

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
async def push_portfolio(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """
    Create or update a GitHub repo with the user's quant portfolio.
    body: { repo_name, description, files: [{path, content}] }
    """
    token = current_user.get("github_token")
    if not token:
        raise HTTPException(400, "GitHub not connected")

    gh_user = current_user.get("github_username")
    repo_name = body.get("repo_name", "sifter-quant-portfolio").strip()
    description = body.get("description", "Quant finance portfolio built on Sifter Skill_Up")
    files: list = body.get("files", [])

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

    return ResponseModel(data={
        "repo_url": repo_url,
        "files_pushed": pushed,
        "message": f"Portfolio live at {repo_url}",
    })


@app.post("/api/github/create-repo", response_model=ResponseModel)
async def create_repo(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    """Create a blank repo (used in the GitHub learn module)."""
    token = current_user.get("github_token")
    if not token:
        raise HTTPException(400, "GitHub not connected")

    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.github.com/user/repos",
            headers=headers,
            json={
                "name": body.get("name", "my-first-repo"),
                "description": body.get("description", ""),
                "private": body.get("private", False),
                "auto_init": True,
            },
        )
    if res.status_code not in (200, 201):
        raise HTTPException(400, f"GitHub error: {res.json().get('message', res.text)}")
    data = res.json()
    return ResponseModel(data={"url": data["html_url"], "name": data["name"], "clone_url": data["clone_url"]})


@app.get("/api/github/repos", response_model=ResponseModel)
async def list_repos(current_user: dict = Depends(Auth.get_current_user)):
    """List user's GitHub repos."""
    token = current_user.get("github_token")
    if not token:
        raise HTTPException(400, "GitHub not connected")
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

# ─────────────────────────────────────────────────────────────
# Additional Routers (missing_routes.py)
# Covers: last-position, flags, reviews, analytics/share,
#         portfolio/social-blast, notifications, posts, projects
# ─────────────────────────────────────────────────────────────
from missing_routes import (
    position_router,
    flags_router,
    reviews_router,
    analytics_extra_router,
    social_blast_router,
    notifications_router,
    community_router,
)
app.include_router(position_router)
app.include_router(flags_router)
app.include_router(reviews_router)
app.include_router(analytics_extra_router)
app.include_router(social_blast_router)
app.include_router(notifications_router)
app.include_router(community_router)

from missing_routes import social_router
app.include_router(social_router)

# ─────────────────────────────────────────────────────────────
# Community V2 — Full social platform routes
# Feed, reactions, polls, follows, privacy, blocks, DMs, search
# ─────────────────────────────────────────────────────────────
from community_routes import community_v2_router, ai_router, scenarios_router
app.include_router(community_v2_router)
app.include_router(ai_router)
app.include_router(scenarios_router)
