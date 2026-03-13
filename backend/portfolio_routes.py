# ============================================================
# Sifter Skill_Up — Portfolio Hub Backend Routes
# Append this to main.py (or import as router)
#
# Handles:
#   - Connected portfolio accounts (CRUD)
#   - OAuth flows for LinkedIn, GitHub, Twitter, Behance, Dribbble etc.
#   - Auto-create accounts on platforms that expose APIs
#   - Push portfolio items to platforms (with Sifter attribution)
#   - Generate submission packages (PDF + files) for manual-upload platforms
# ============================================================

import base64
import hashlib
import hmac
import httpx
import json
import os
import secrets
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────────────────────

class ConnectAccountRequest(BaseModel):
    platformId: str
    username: str
    profileUrl: Optional[str] = None

class CreateAccountRequest(BaseModel):
    platformId: str
    username: str
    email: str
    password: Optional[str] = None
    displayName: Optional[str] = None
    sourcedFrom: str = "Sifter Skill_Up"

class PortfolioItemCreate(BaseModel):
    title: str
    description: str
    fieldId: str
    type: str  # project | writeup | code | design | video | certificate
    tags: List[str] = []
    fileUrl: Optional[str] = None

class PushItemRequest(BaseModel):
    itemId: str
    platformIds: List[str]
    caption: str
    sourceAttribution: str = "Sifter Skill_Up · sifter.app"

class GeneratePackageRequest(BaseModel):
    itemId: str
    platformId: str

# ─────────────────────────────────────────────────────────────
# Platform OAuth config
# Maps platform ID → OAuth/API details
# Keys stored in environment / config
# ─────────────────────────────────────────────────────────────

PLATFORM_OAUTH_CONFIG = {
    "linkedin": {
        "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "client_id_env": "LINKEDIN_CLIENT_ID",
        "client_secret_env": "LINKEDIN_CLIENT_SECRET",
        "scope": "openid profile email w_member_social",
        "post_api": "https://api.linkedin.com/v2/ugcPosts",
        "profile_url_template": "https://www.linkedin.com/in/{username}",
    },
    "github": {
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "client_id_env": "GITHUB_CLIENT_ID",
        "client_secret_env": "GITHUB_CLIENT_SECRET",
        "scope": "read:user user:email public_repo",
        "profile_url_template": "https://github.com/{username}",
    },
    "twitter": {
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "client_id_env": "TWITTER_CLIENT_ID",
        "client_secret_env": "TWITTER_CLIENT_SECRET",
        "scope": "tweet.read tweet.write users.read",
        "post_api": "https://api.twitter.com/2/tweets",
        "profile_url_template": "https://twitter.com/{username}",
    },
    "medium": {
        "auth_url": "https://medium.com/m/oauth/authorize",
        "token_url": "https://api.medium.com/v1/tokens",
        "client_id_env": "MEDIUM_CLIENT_ID",
        "client_secret_env": "MEDIUM_CLIENT_SECRET",
        "scope": "basicProfile listPublications publishPost",
        "post_api": "https://api.medium.com/v1/users/{user_id}/posts",
        "profile_url_template": "https://medium.com/@{username}",
    },
    "reddit": {
        "auth_url": "https://www.reddit.com/api/v1/authorize",
        "token_url": "https://www.reddit.com/api/v1/access_token",
        "client_id_env": "REDDIT_CLIENT_ID",
        "client_secret_env": "REDDIT_CLIENT_SECRET",
        "scope": "identity submit",
        "profile_url_template": "https://reddit.com/u/{username}",
    },
    "kaggle": {
        # API key based - no OAuth
        "auth_type": "api_key",
        "profile_url_template": "https://www.kaggle.com/{username}",
    },
    "behance": {
        "auth_url": "https://www.behance.net/v2/oauth/authenticate",
        "token_url": "https://www.behance.net/v2/oauth/token",
        "client_id_env": "BEHANCE_CLIENT_ID",
        "client_secret_env": "BEHANCE_CLIENT_SECRET",
        "scope": "project-read project-write",
        "profile_url_template": "https://www.behance.net/{username}",
    },
    "dribbble": {
        "auth_url": "https://dribbble.com/oauth/authorize",
        "token_url": "https://dribbble.com/oauth/token",
        "client_id_env": "DRIBBBLE_CLIENT_ID",
        "client_secret_env": "DRIBBBLE_CLIENT_SECRET",
        "scope": "public write upload",
        "profile_url_template": "https://dribbble.com/{username}",
    },
    "instagram": {
        # Requires Meta Business API — only available for Business/Creator accounts
        "auth_url": "https://api.instagram.com/oauth/authorize",
        "token_url": "https://api.instagram.com/oauth/access_token",
        "client_id_env": "INSTAGRAM_CLIENT_ID",
        "client_secret_env": "INSTAGRAM_CLIENT_SECRET",
        "scope": "instagram_basic instagram_content_publish",
        "profile_url_template": "https://instagram.com/{username}",
    },
    "youtube": {
        "auth_url": "https://accounts.google.com/o/oauth2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "client_id_env": "GOOGLE_CLIENT_ID",
        "client_secret_env": "GOOGLE_CLIENT_SECRET",
        "scope": "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
        "profile_url_template": "https://youtube.com/@{username}",
    },
    "huggingface": {
        # Token based
        "auth_type": "token",
        "profile_url_template": "https://huggingface.co/{username}",
    },
    "vimeo": {
        "auth_url": "https://api.vimeo.com/oauth/authorize",
        "token_url": "https://api.vimeo.com/oauth/access_token",
        "client_id_env": "VIMEO_CLIENT_ID",
        "client_secret_env": "VIMEO_CLIENT_SECRET",
        "scope": "public private upload",
        "profile_url_template": "https://vimeo.com/{username}",
    },
    "facebook": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "client_id_env": "FACEBOOK_APP_ID",
        "client_secret_env": "FACEBOOK_APP_SECRET",
        "scope": "pages_manage_posts pages_read_engagement public_profile",
        "profile_url_template": "https://facebook.com/{username}",
    },
}

# Platforms with no API — generate package instead
MANUAL_PLATFORMS = {"upwork", "freelancer", "fiverr", "artstation",
                    "researchgate", "reliefweb", "grabcad", "arxiv",
                    "pubmed", "ssrn", "quantconnect", "hackthebox",
                    "tryhackme", "tableau_public", "contently", "jdsupra"}

# ─────────────────────────────────────────────────────────────
# Router
# ─────────────────────────────────────────────────────────────

portfolio_router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

# ─────────────────────────────────────────────────────────────
# Connected Accounts
# ─────────────────────────────────────────────────────────────

@portfolio_router.get("/accounts")
async def get_connected_accounts(current_user: dict = Depends(Auth.get_current_user)):
    """Return all connected portfolio platform accounts for the user."""
    result = db.get_service_client().table("portfolio_accounts") \
        .select("platform_id, username, profile_url, connected_at, token_expiry") \
        .eq("user_id", current_user["id"]) \
        .execute()
    return ResponseModel(data=result.data or [])


@portfolio_router.post("/accounts/link")
async def link_account(body: ConnectAccountRequest, current_user: dict = Depends(Auth.get_current_user)):
    """Store a manually-entered portfolio account link (no OAuth)."""
    data = {
        "user_id": current_user["id"],
        "platform_id": body.platformId,
        "username": body.username,
        "profile_url": body.profileUrl or "",
        "connected_at": datetime.now().isoformat(),
        "auth_method": "manual",
    }
    existing = db.get_service_client().table("portfolio_accounts") \
        .select("id").eq("user_id", current_user["id"]).eq("platform_id", body.platformId).execute()

    if existing.data:
        db.get_service_client().table("portfolio_accounts") \
            .update(data).eq("user_id", current_user["id"]).eq("platform_id", body.platformId).execute()
    else:
        db.get_service_client().table("portfolio_accounts").insert(data).execute()

    return ResponseModel(data={"account": data})


@portfolio_router.delete("/accounts/{platform_id}")
async def disconnect_account(platform_id: str, current_user: dict = Depends(Auth.get_current_user)):
    """Disconnect a portfolio platform account."""
    db.get_service_client().table("portfolio_accounts") \
        .delete().eq("user_id", current_user["id"]).eq("platform_id", platform_id).execute()
    return ResponseModel(message=f"Disconnected {platform_id}")


# ─────────────────────────────────────────────────────────────
# OAuth Flows
# ─────────────────────────────────────────────────────────────

@portfolio_router.get("/oauth/{platform_id}/url")
async def get_oauth_url(platform_id: str, current_user: dict = Depends(Auth.get_current_user)):
    """Generate the OAuth authorisation URL for a given platform."""
    config = PLATFORM_OAUTH_CONFIG.get(platform_id)
    if not config or config.get("auth_type") in ("api_key", "token"):
        raise HTTPException(400, f"Platform {platform_id} does not support OAuth")

    client_id = os.getenv(config["client_id_env"], "")
    if not client_id:
        raise HTTPException(500, f"OAuth not configured for {platform_id}")

    # PKCE state tied to user ID so the callback can identify the user
    state = secrets.token_urlsafe(24)
    # Store state → user_id mapping briefly in DB
    db.get_service_client().table("oauth_states").insert({
        "state": state,
        "user_id": current_user["id"],
        "platform_id": platform_id,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat(),
    }).execute()

    redirect_uri = f"{os.getenv('API_BASE_URL', 'https://api.sifter.app')}/api/portfolio/oauth/{platform_id}/callback"
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": config["scope"],
        "response_type": "code",
        "state": state,
    }
    url = config["auth_url"] + "?" + urllib.parse.urlencode(params)
    return ResponseModel(data={"url": url})


@portfolio_router.get("/oauth/{platform_id}/callback")
async def oauth_callback(platform_id: str, request: Request, background_tasks: BackgroundTasks):
    """Handle OAuth callback, exchange code for token, store account."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        return RedirectResponse(url="sifter://portfolio/error?msg=oauth_failed")

    # Validate state
    state_row = db.get_service_client().table("oauth_states") \
        .select("*").eq("state", state).eq("platform_id", platform_id).execute()
    if not state_row.data:
        return RedirectResponse(url="sifter://portfolio/error?msg=invalid_state")

    user_id = state_row.data[0]["user_id"]
    # Clean up state
    db.get_service_client().table("oauth_states").delete().eq("state", state).execute()

    config = PLATFORM_OAUTH_CONFIG[platform_id]
    redirect_uri = f"{os.getenv('API_BASE_URL', 'https://api.sifter.app')}/api/portfolio/oauth/{platform_id}/callback"

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(config["token_url"], data={
            "code": code,
            "client_id": os.getenv(config["client_id_env"], ""),
            "client_secret": os.getenv(config["client_secret_env"], ""),
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }, headers={"Accept": "application/json"})
        token_data = token_resp.json()

    access_token = token_data.get("access_token", "")
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 3600)

    # Fetch the user's profile on this platform
    username, profile_url = await _fetch_platform_profile(platform_id, access_token, config)

    account_data = {
        "user_id": user_id,
        "platform_id": platform_id,
        "username": username,
        "profile_url": profile_url,
        "access_token": access_token,          # In production: encrypt this
        "refresh_token": refresh_token,
        "token_expiry": (datetime.now() + timedelta(seconds=expires_in)).isoformat(),
        "connected_at": datetime.now().isoformat(),
        "auth_method": "oauth",
    }

    existing = db.get_service_client().table("portfolio_accounts") \
        .select("id").eq("user_id", user_id).eq("platform_id", platform_id).execute()
    if existing.data:
        db.get_service_client().table("portfolio_accounts") \
            .update(account_data).eq("user_id", user_id).eq("platform_id", platform_id).execute()
    else:
        db.get_service_client().table("portfolio_accounts").insert(account_data).execute()

    return RedirectResponse(url=f"sifter://portfolio/connected?platform={platform_id}&username={username}")


async def _fetch_platform_profile(platform_id: str, access_token: str, config: dict):
    """Fetch username and profile URL from a platform after OAuth."""
    async with httpx.AsyncClient() as client:
        if platform_id == "linkedin":
            r = await client.get("https://api.linkedin.com/v2/userinfo",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("sub", "")
            profile_url = f"https://linkedin.com/in/{username}"

        elif platform_id == "github":
            r = await client.get("https://api.github.com/user",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("login", "")
            profile_url = data.get("html_url", f"https://github.com/{username}")

        elif platform_id == "twitter":
            r = await client.get("https://api.twitter.com/2/users/me",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json().get("data", {})
            username = data.get("username", "")
            profile_url = f"https://twitter.com/{username}"

        elif platform_id == "medium":
            r = await client.get("https://api.medium.com/v1/me",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json().get("data", {})
            username = data.get("username", "")
            profile_url = data.get("url", f"https://medium.com/@{username}")

        elif platform_id == "instagram":
            r = await client.get("https://graph.instagram.com/me?fields=id,username",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("username", "")
            profile_url = f"https://instagram.com/{username}"

        elif platform_id == "youtube":
            r = await client.get(
                "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                headers={"Authorization": f"Bearer {access_token}"})
            items = r.json().get("items", [{}])
            snippet = items[0].get("snippet", {}) if items else {}
            username = snippet.get("customUrl", "").lstrip("@")
            profile_url = f"https://youtube.com/@{username}"

        elif platform_id == "behance":
            r = await client.get("https://api.behance.net/v2/users/me",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json().get("user", {})
            username = data.get("username", "")
            profile_url = data.get("url", f"https://behance.net/{username}")

        elif platform_id == "dribbble":
            r = await client.get("https://api.dribbble.com/v2/user",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("login", "")
            profile_url = data.get("html_url", f"https://dribbble.com/{username}")

        elif platform_id == "vimeo":
            r = await client.get("https://api.vimeo.com/me",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("link", "").split("/")[-1]
            profile_url = data.get("link", "")

        elif platform_id == "reddit":
            r = await client.get("https://oauth.reddit.com/api/v1/me",
                                  headers={"Authorization": f"Bearer {access_token}",
                                           "User-Agent": "SifterSkillUp/1.0"})
            data = r.json()
            username = data.get("name", "")
            profile_url = f"https://reddit.com/u/{username}"

        elif platform_id == "facebook":
            r = await client.get("https://graph.facebook.com/me?fields=id,name",
                                  headers={"Authorization": f"Bearer {access_token}"})
            data = r.json()
            username = data.get("id", "")
            profile_url = f"https://facebook.com/{username}"

        else:
            username = ""
            profile_url = ""

    return username, profile_url


# ─────────────────────────────────────────────────────────────
# Auto-create account on behalf of user
# ─────────────────────────────────────────────────────────────

@portfolio_router.post("/accounts/create")
async def create_platform_account(
    body: CreateAccountRequest,
    current_user: dict = Depends(Auth.get_current_user)
):
    """
    Auto-create a portfolio account on a supported platform on behalf of the user.
    The profile bio is pre-populated with Sifter Skill_Up attribution.
    """
    platform_id = body.platformId

    # Build profile bio using user's Sifter data
    sifter_user = db.get_service_client().table("users").select("*") \
        .eq("id", current_user["id"]).single().execute()
    user_data = sifter_user.data or {}
    completed = len(user_data.get("completed_levels") or [])
    track = user_data.get("active_track", "crypto").replace("-", " ").title()

    bio = (
        f"{body.displayName or body.username} | Learning {track} on Sifter Skill_Up. "
        f"{completed} levels completed. Portfolio sourced from sifter.app"
    )

    result = await _create_account_on_platform(platform_id, body, bio)
    if not result["success"]:
        raise HTTPException(400, result.get("error", "Account creation failed"))

    # Store the linked account
    account_data = {
        "user_id": current_user["id"],
        "platform_id": platform_id,
        "username": body.username,
        "profile_url": result.get("profileUrl", ""),
        "connected_at": datetime.now().isoformat(),
        "auth_method": "auto_created",
        "access_token": result.get("access_token", ""),
    }
    existing = db.get_service_client().table("portfolio_accounts") \
        .select("id").eq("user_id", current_user["id"]).eq("platform_id", platform_id).execute()
    if existing.data:
        db.get_service_client().table("portfolio_accounts") \
            .update(account_data).eq("user_id", current_user["id"]).eq("platform_id", platform_id).execute()
    else:
        db.get_service_client().table("portfolio_accounts").insert(account_data).execute()

    return ResponseModel(data={"account": account_data})


async def _create_account_on_platform(platform_id: str, body: CreateAccountRequest, bio: str) -> dict:
    """
    Attempt to create an account programmatically on the platform.
    Most platforms don't expose account creation APIs — for those we return
    a deep link to the signup page with pre-filled query params.
    """
    # GitHub — create via GitHub API (requires pre-existing OAuth token from Sifter's app account)
    # In practice, GitHub does not support creating user accounts via API.
    # We deep-link to signup with email pre-filled instead.
    deep_link_platforms = {
        "github": f"https://github.com/signup?email={urllib.parse.quote(body.email)}&username={urllib.parse.quote(body.username)}",
        "linkedin": f"https://www.linkedin.com/signup?email={urllib.parse.quote(body.email)}&firstName={urllib.parse.quote(body.displayName or body.username)}",
        "kaggle": f"https://www.kaggle.com/account/login?phase=startSignInTab&returnUrl=%2F",
        "reddit": f"https://www.reddit.com/register?username={urllib.parse.quote(body.username)}&email={urllib.parse.quote(body.email)}",
        "medium": f"https://medium.com/signup?email={urllib.parse.quote(body.email)}",
        "behance": f"https://www.behance.net/signup",
        "dribbble": f"https://dribbble.com/signup",
        "twitter": f"https://twitter.com/i/flow/signup",
        "instagram": f"https://www.instagram.com/accounts/emailsignup/",
        "youtube": f"https://accounts.google.com/signup",
        "vimeo": f"https://vimeo.com/join",
        "upwork": f"https://www.upwork.com/signup/?email={urllib.parse.quote(body.email)}",
        "freelancer": f"https://www.freelancer.com/signup",
        "fiverr": f"https://www.fiverr.com/join",
    }
    if platform_id in deep_link_platforms:
        return {
            "success": True,
            "method": "deep_link",
            "signupUrl": deep_link_platforms[platform_id],
            "bio": bio,
            "profileUrl": "",
        }

    # Hugging Face — supports token-based account creation via CLI/API
    if platform_id == "huggingface":
        async with httpx.AsyncClient() as client:
            r = await client.post("https://huggingface.co/api/join", json={
                "username": body.username,
                "email": body.email,
                "password": body.password,
            })
            if r.status_code in (200, 201):
                return {
                    "success": True,
                    "profileUrl": f"https://huggingface.co/{body.username}",
                }
            return {"success": False, "error": r.text}

    # Default fallback — deep link to the platform homepage
    return {
        "success": True,
        "method": "deep_link",
        "signupUrl": f"https://{PLATFORM_OAUTH_CONFIG.get(platform_id, {}).get('profile_url_template', '').split('/')[2] or platform_id}.com/signup",
        "bio": bio,
        "profileUrl": "",
    }


# ─────────────────────────────────────────────────────────────
# Portfolio Items
# ─────────────────────────────────────────────────────────────

@portfolio_router.get("/items")
async def get_portfolio_items(current_user: dict = Depends(Auth.get_current_user)):
    """Return all portfolio items for the user."""
    items = db.get_service_client().table("portfolio_items") \
        .select("*, portfolio_pushes(platform_id, post_url, pushed_at)") \
        .eq("user_id", current_user["id"]) \
        .order("created_at", desc=True) \
        .execute()

    # Reshape pushes
    shaped = []
    for item in (items.data or []):
        pushes = item.pop("portfolio_pushes", []) or []
        item["pushedTo"] = [{"platformId": p["platform_id"], "postUrl": p["post_url"], "pushedAt": p["pushed_at"]} for p in pushes]
        shaped.append(item)

    return ResponseModel(data=shaped)


@portfolio_router.post("/items")
async def add_portfolio_item(body: PortfolioItemCreate, current_user: dict = Depends(Auth.get_current_user)):
    """Add a new portfolio item."""
    import uuid
    item = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "title": body.title,
        "description": body.description,
        "field_id": body.fieldId,
        "type": body.type,
        "tags": body.tags,
        "file_url": body.fileUrl,
        "created_at": datetime.now().isoformat(),
    }
    db.get_service_client().table("portfolio_items").insert(item).execute()
    item["pushedTo"] = []
    return ResponseModel(data={"item": item})


@portfolio_router.delete("/items/{item_id}")
async def delete_portfolio_item(item_id: str, current_user: dict = Depends(Auth.get_current_user)):
    """Delete a portfolio item."""
    db.get_service_client().table("portfolio_items") \
        .delete().eq("id", item_id).eq("user_id", current_user["id"]).execute()
    return ResponseModel(message="Item deleted")


# ─────────────────────────────────────────────────────────────
# Push to Platforms
# ─────────────────────────────────────────────────────────────

@portfolio_router.post("/items/push")
async def push_portfolio_item(
    body: PushItemRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user)
):
    """
    Push a portfolio item to one or more platforms.
    Uses stored OAuth access tokens to post on the user's behalf.
    Sifter Skill_Up is always included in the attribution.
    """
    # Fetch the item
    item_row = db.get_service_client().table("portfolio_items") \
        .select("*").eq("id", body.itemId).eq("user_id", current_user["id"]).single().execute()
    if not item_row.data:
        raise HTTPException(404, "Portfolio item not found")
    item = item_row.data

    # Fetch connected accounts
    accounts = db.get_service_client().table("portfolio_accounts") \
        .select("*").eq("user_id", current_user["id"]) \
        .in_("platform_id", body.platformIds).execute()
    accounts_map = {a["platform_id"]: a for a in (accounts.data or [])}

    results = []
    errors = []

    for platform_id in body.platformIds:
        account = accounts_map.get(platform_id)
        if not account:
            errors.append({"platformId": platform_id, "error": "Account not connected"})
            continue

        caption_with_attribution = (
            f"{body.caption}\n\n"
            f"—\n"
            f"📚 Trained on {body.sourceAttribution}\n"
            f"🔗 {account.get('profile_url', '')}"
        )

        try:
            post_url = await _post_to_platform(
                platform_id=platform_id,
                access_token=account.get("access_token", ""),
                item=item,
                caption=caption_with_attribution,
                username=account.get("username", ""),
            )
            # Record the push
            db.get_service_client().table("portfolio_pushes").insert({
                "item_id": body.itemId,
                "user_id": current_user["id"],
                "platform_id": platform_id,
                "post_url": post_url,
                "pushed_at": datetime.now().isoformat(),
            }).execute()
            results.append({"platformId": platform_id, "postUrl": post_url})
        except Exception as e:
            errors.append({"platformId": platform_id, "error": str(e)})

    return ResponseModel(data=results, message=f"Pushed to {len(results)} platform(s). {len(errors)} error(s).")


async def _post_to_platform(platform_id: str, access_token: str, item: dict, caption: str, username: str) -> str:
    """Post content to a specific platform. Returns the URL of the created post."""

    async with httpx.AsyncClient(timeout=30) as client:

        if platform_id == "linkedin":
            # LinkedIn UGC Post
            # First get the author URN
            me_r = await client.get("https://api.linkedin.com/v2/userinfo",
                                     headers={"Authorization": f"Bearer {access_token}"})
            person_id = me_r.json().get("sub", "")
            payload = {
                "author": f"urn:li:person:{person_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": caption},
                        "shareMediaCategory": "NONE",
                    }
                },
                "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
            }
            r = await client.post("https://api.linkedin.com/v2/ugcPosts",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}",
                                                          "Content-Type": "application/json"})
            post_id = r.headers.get("x-restli-id", "")
            return f"https://www.linkedin.com/feed/update/{post_id}"

        elif platform_id == "github":
            # Create a GitHub Gist with the portfolio item
            payload = {
                "description": f"{item['title']} — {caption[:200]}",
                "public": True,
                "files": {
                    f"{item['title'].replace(' ', '_')}.md": {
                        "content": f"# {item['title']}\n\n{item['description']}\n\n---\n\n{caption}"
                    }
                }
            }
            r = await client.post("https://api.github.com/gists",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}",
                                                          "Accept": "application/vnd.github+json"})
            return r.json().get("html_url", f"https://gist.github.com/{username}")

        elif platform_id == "twitter":
            r = await client.post("https://api.twitter.com/2/tweets",
                                   json={"text": caption[:280]},
                                   headers={"Authorization": f"Bearer {access_token}",
                                            "Content-Type": "application/json"})
            tweet_id = r.json().get("data", {}).get("id", "")
            return f"https://twitter.com/{username}/status/{tweet_id}"

        elif platform_id == "medium":
            # Get user ID first
            me_r = await client.get("https://api.medium.com/v1/me",
                                     headers={"Authorization": f"Bearer {access_token}"})
            user_id = me_r.json().get("data", {}).get("id", "")
            payload = {
                "title": item["title"],
                "contentFormat": "markdown",
                "content": f"# {item['title']}\n\n{item['description']}\n\n---\n\n{caption}",
                "publishStatus": "public",
                "tags": item.get("tags", [])[:5],
            }
            r = await client.post(f"https://api.medium.com/v1/users/{user_id}/posts",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}",
                                                          "Content-Type": "application/json"})
            return r.json().get("data", {}).get("url", f"https://medium.com/@{username}")

        elif platform_id == "reddit":
            # Submit a text post to r/learnprogramming or relevant subreddit
            # Subreddit chosen based on field
            subreddit_map = {
                "crypto": "CryptoCurrency", "ai-ml": "MachineLearning",
                "software-engineering": "learnprogramming", "data-science": "datascience",
                "cybersecurity": "cybersecurity", "quant": "quant",
            }
            subreddit = subreddit_map.get(item.get("field_id", ""), "learnprogramming")
            r = await client.post("https://oauth.reddit.com/api/submit",
                                   data={
                                       "sr": subreddit,
                                       "kind": "self",
                                       "title": item["title"],
                                       "text": f"{item['description']}\n\n---\n\n{caption}",
                                   },
                                   headers={"Authorization": f"Bearer {access_token}",
                                            "User-Agent": "SifterSkillUp/1.0"})
            post_data = r.json().get("json", {}).get("data", {})
            return post_data.get("url", f"https://reddit.com/u/{username}")

        elif platform_id == "behance":
            # Create a project — requires cover image, simplified here
            payload = {
                "name": item["title"],
                "description": caption,
                "tags": ",".join(item.get("tags", [])[:5]),
                "published_on": int(datetime.now().timestamp()),
            }
            r = await client.post("https://api.behance.net/v2/projects",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}"})
            proj = r.json().get("project", {})
            return proj.get("url", f"https://behance.net/{username}")

        elif platform_id == "dribbble":
            payload = {
                "title": item["title"],
                "description": caption,
                "tags": item.get("tags", [])[:13],
            }
            r = await client.post("https://api.dribbble.com/v2/shots",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}"})
            shot = r.json()
            return shot.get("html_url", f"https://dribbble.com/{username}")

        elif platform_id == "vimeo":
            # Create a video entry (no actual file upload here — just metadata)
            payload = {"name": item["title"], "description": caption, "privacy": {"view": "anybody"}}
            r = await client.post("https://api.vimeo.com/me/videos",
                                   json=payload, headers={"Authorization": f"Bearer {access_token}",
                                                          "Content-Type": "application/json"})
            link = r.json().get("link", f"https://vimeo.com/{username}")
            return link

        elif platform_id == "youtube":
            # YouTube upload requires a separate resumable upload flow
            # This posts the metadata; actual video bytes are sent separately
            snippet = {
                "title": item["title"],
                "description": caption,
                "tags": item.get("tags", []),
                "categoryId": "27",  # Education
            }
            r = await client.post(
                "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
                json={"snippet": snippet, "status": {"privacyStatus": "public"}},
                headers={"Authorization": f"Bearer {access_token}",
                         "Content-Type": "application/json"})
            vid_id = r.json().get("id", "")
            return f"https://youtube.com/watch?v={vid_id}"

        elif platform_id == "facebook":
            # Post to user's page feed
            me_r = await client.get("https://graph.facebook.com/me/accounts",
                                     headers={"Authorization": f"Bearer {access_token}"})
            pages = me_r.json().get("data", [])
            page = pages[0] if pages else {}
            page_id = page.get("id", "me")
            page_token = page.get("access_token", access_token)
            r = await client.post(f"https://graph.facebook.com/{page_id}/feed",
                                   json={"message": caption},
                                   headers={"Authorization": f"Bearer {page_token}"})
            post_id = r.json().get("id", "")
            return f"https://facebook.com/{post_id}"

        else:
            raise ValueError(f"No posting implementation for {platform_id}")


# ─────────────────────────────────────────────────────────────
# Submission Package Generator (for manual-upload platforms)
# ─────────────────────────────────────────────────────────────

@portfolio_router.post("/items/package")
async def generate_submission_package(
    body: GeneratePackageRequest,
    current_user: dict = Depends(Auth.get_current_user)
):
    """
    Generate a formatted PDF submission package for platforms that don't have
    posting APIs (Upwork, Fiverr, Freelancer, arXiv, ResearchGate, etc.).
    The package includes a Sifter-branded cover sheet + the work content.
    Returns a signed download URL.
    """
    item_row = db.get_service_client().table("portfolio_items") \
        .select("*").eq("id", body.itemId).eq("user_id", current_user["id"]).single().execute()
    if not item_row.data:
        raise HTTPException(404, "Item not found")
    item = item_row.data

    user_row = db.get_service_client().table("users").select("*") \
        .eq("id", current_user["id"]).single().execute()
    user = user_row.data or {}

    account_row = db.get_service_client().table("portfolio_accounts") \
        .select("*").eq("user_id", current_user["id"]).eq("platform_id", body.platformId).execute()
    account = account_row.data[0] if account_row.data else {}

    # Platform-specific submission instructions
    platform_instructions = {
        "upwork": "Upload this PDF as your portfolio sample. Set the project title and description from the cover sheet. Mention Sifter Skill_Up in your profile overview.",
        "fiverr": "Add this as a portfolio item in Gig Extras. Use the title and description from the cover sheet verbatim.",
        "freelancer": "Upload to your portfolio under the relevant skill category. Reference Sifter Skill_Up in your bio.",
        "artstation": "Create a new project. Upload images/video, copy the description and tags from the cover sheet.",
        "researchgate": "Upload as a preprint or project. Copy abstract and keywords from the cover sheet.",
        "arxiv": "Submit as a preprint in the relevant subject area. Use the abstract and keywords provided.",
        "kaggle": "Create a new public notebook or dataset. Copy the title, description, and tags.",
        "tableau_public": "Publish your workbook publicly. Use the title and description from the cover sheet.",
        "hackthebox": "Submit as a writeup. Copy the technical breakdown from the cover sheet.",
        "tryhackme": "Post in the community forum as a writeup. Reference your profile completion percentage.",
        "quantconnect": "Create a strategy named exactly as shown. Copy the description and parameter notes.",
        "grabcad": "Upload your CAD files. Use the project title and description from the cover sheet.",
        "reliefweb": "Apply to relevant roles. The cover sheet includes a formatted CV summary and project references.",
        "ssrn": "Submit as a working paper. Use the abstract and keywords provided.",
        "contently": "Add as a writing sample. Copy the headline and summary.",
        "jdsupra": "Publish as a legal update or article. Copy the summary and tags.",
    }

    instructions = platform_instructions.get(body.platformId,
        f"Upload this content to your {body.platformId} profile. Reference Sifter Skill_Up as your learning platform.")

    package_content = _build_package_content(item, user, account, body.platformId, instructions)

    # In production: generate actual PDF, upload to storage, return signed URL
    # For now: return the package as structured data the app renders into a shareable PDF
    return ResponseModel(data={
        "itemTitle": item["title"],
        "platformId": body.platformId,
        "instructions": instructions,
        "package": package_content,
        # In production: "downloadUrl": signed_url_from_supabase_storage
        "downloadUrl": None,  # TODO: wire up PDF generation + storage
    })


def _build_package_content(item: dict, user: dict, account: dict, platform_id: str, instructions: str) -> dict:
    completed = len(user.get("completed_levels") or [])
    track = (user.get("active_track") or "crypto").replace("-", " ").title()

    return {
        "coverSheet": {
            "title": item["title"],
            "author": user.get("username", ""),
            "platform_username": account.get("username", ""),
            "date": datetime.now().strftime("%B %Y"),
            "learning_source": "Sifter Skill_Up — sifter.app",
            "learning_summary": f"{completed} levels completed in {track}",
            "tagline": "This portfolio item was produced as part of structured career training on Sifter Skill_Up, a skills platform covering Crypto, Quant Finance, Cybersecurity, AI/ML, and 24 other professional fields.",
        },
        "workContent": {
            "title": item["title"],
            "description": item["description"],
            "type": item["type"],
            "field": item.get("field_id", ""),
            "tags": item.get("tags", []),
            "fileUrl": item.get("file_url"),
            "createdAt": item.get("created_at", ""),
        },
        "submissionInstructions": instructions,
        "attribution": {
            "text": f"Produced as part of learning on Sifter Skill_Up (sifter.app). Field: {item.get('field_id', '').replace('-', ' ').title()}.",
            "hashtags": ["#SifterSkillUp", f"#{item.get('field_id','').replace('-','')}"],
        },
    }


# ─────────────────────────────────────────────────────────────
# Register the router in main.py
# Add this line at the bottom of main.py:
#   app.include_router(portfolio_router)
# ─────────────────────────────────────────────────────────────
