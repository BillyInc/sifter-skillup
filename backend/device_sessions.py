# ============================================
# Sifter Skill_Up — Device Session Enforcement
#
# Rule: one active device per user.
# Second login on a different device:
#   1. Old device receives push notification ("signed out on new device")
#   2. Old session invalidated in DB
#   3. New session registered, JWT issued
#
# Device ID is generated once on first install (expo-device or
# expo-crypto UUID), stored in expo-secure-store, never changes.
# ============================================
import hashlib
import hmac
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException

from auth import Auth
from config import settings
from database import db
from logger import log
from models import DeviceRegister, PushTokenUpdate, ResponseModel

router = APIRouter(prefix="/api/devices", tags=["devices"])


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sanitize_session(session: Optional[dict]) -> Optional[dict]:
    """Strip sensitive fields (push_token) from a session dict before returning."""
    if not session:
        return session
    safe = dict(session)
    safe.pop("push_token", None)
    return safe


def _force_logout_hmac(user_id: str, device_id: str, timestamp: str) -> str:
    """HMAC-SHA256 of (user_id|device_id|timestamp) signed with JWT_SECRET."""
    msg = f"{user_id}|{device_id}|{timestamp}".encode("utf-8")
    key = (settings.JWT_SECRET or "").encode("utf-8")
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


# ─────────────────────────────────────────────────────────────
# FCM helpers
# ─────────────────────────────────────────────────────────────

def _get_fcm_v1_access_token() -> Optional[str]:
    """
    Mint an OAuth2 access token for FCM HTTP v1 from a service-account JSON file.
    Returns None if google-auth isn't installed or the file isn't readable.
    """
    try:
        from google.oauth2 import service_account  # type: ignore
        from google.auth.transport.requests import Request as GAuthRequest  # type: ignore
    except ImportError:
        log.warning("google-auth not installed; cannot use FCM HTTP v1")
        return None

    try:
        creds = service_account.Credentials.from_service_account_file(
            settings.FCM_SERVICE_ACCOUNT_PATH,
            scopes=["https://www.googleapis.com/auth/firebase.messaging"],
        )
        creds.refresh(GAuthRequest())
        return creds.token
    except Exception as e:
        log.error("Failed to mint FCM v1 access token", error=str(e))
        return None


async def _send_logout_push(
    push_token: str,
    new_device_name: str,
    user_id: str,
    old_device_id: str,
):
    """Send FCM push to the old device telling it to clear local session."""
    if not push_token:
        return

    timestamp = _now_iso()
    sig = _force_logout_hmac(user_id, old_device_id, timestamp)

    data_payload = {
        "type":        "FORCE_LOGOUT",
        "reason":      "new_device_login",
        "new_device":  new_device_name,
        "timestamp":   timestamp,
        "user_id":     user_id,
        "device_id":   old_device_id,
        "hmac":        sig,
        "message":     f"Your account was accessed on '{new_device_name}'. You've been signed out here.",
    }

    use_v1 = bool(settings.FCM_SERVICE_ACCOUNT_PATH and settings.FCM_PROJECT_ID)
    use_legacy = (not use_v1) and bool(settings.FCM_SERVER_KEY)

    if not (use_v1 or use_legacy):
        log.debug("No FCM credentials configured; skipping logout push")
        return

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            if use_v1:
                token = _get_fcm_v1_access_token()
                if not token:
                    log.warning("FCM v1 token unavailable; not sending push")
                    return
                url = (
                    f"https://fcm.googleapis.com/v1/projects/"
                    f"{settings.FCM_PROJECT_ID}/messages:send"
                )
                payload = {
                    "message": {
                        "token": push_token,
                        "data":  data_payload,
                        "android": {"priority": "high"},
                    }
                }
                await client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type":  "application/json",
                    },
                    json=payload,
                )
            else:
                # Legacy fallback
                await client.post(
                    "https://fcm.googleapis.com/fcm/send",
                    headers={
                        "Authorization": f"key={settings.FCM_SERVER_KEY}",
                        "Content-Type":  "application/json",
                    },
                    json={
                        "to":       push_token,
                        "priority": "high",
                        "data":     data_payload,
                    },
                )
        log.info("Logout push sent", push_token=push_token[:10] + "…")
    except Exception as e:
        log.warning("Logout push failed (non-fatal)", error=str(e))


# ─────────────────────────────────────────────────────────────
# DB helpers
# ─────────────────────────────────────────────────────────────

def _get_existing_session(user_id: str) -> Optional[dict]:
    result = db.get_service_client() \
        .table("active_sessions") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("is_active", True) \
        .execute()
    return result.data[0] if result.data else None


def _revoke_session(session_id: str):
    db.get_service_client() \
        .table("active_sessions") \
        .update({"is_active": False, "revoked_at": _now_iso()}) \
        .eq("id", session_id) \
        .execute()


def _create_session(user_id: str, device_id: str, device_name: str,
                    platform: str, app_version: str, push_token: Optional[str]) -> dict:
    payload = {
        "id":           str(uuid.uuid4()),
        "user_id":      user_id,
        "device_id":    device_id,
        "device_name":  device_name or "Unknown device",
        "platform":     platform or "unknown",
        "app_version":  app_version or "unknown",
        "push_token":   push_token,
        "is_active":    True,
        "created_at":   _now_iso(),
        "last_seen":    _now_iso(),
    }
    result = db.get_service_client().table("active_sessions").insert(payload).execute()
    return result.data[0]


# ─────────────────────────────────────────────────────────────
# Public function — called from auth endpoints after JWT issue
# ─────────────────────────────────────────────────────────────

async def register_device_for_user(
    user_id: str,
    device_id: str,
    device_name: str = "Unknown device",
    platform: str = "unknown",
    app_version: str = "unknown",
    push_token: Optional[str] = None,
):
    """
    Call this every time a user successfully authenticates.
    If the user already has an active session on a DIFFERENT device,
    revoke it and push a logout notification to the old device.
    If same device: just refresh last_seen.
    """
    if not settings.SINGLE_DEVICE_ENFORCEMENT:
        return

    existing = _get_existing_session(user_id)

    if existing:
        if existing["device_id"] == device_id:
            # Same device — just refresh last_seen
            db.get_service_client() \
                .table("active_sessions") \
                .update({
                    "last_seen":   _now_iso(),
                    "push_token":  push_token or existing.get("push_token"),
                    "app_version": app_version,
                }) \
                .eq("id", existing["id"]) \
                .execute()
            log.info("Device session refreshed", user_id=user_id, device_id=device_id[:8])
            return

        # Different device — revoke old, notify, create new
        old_push = existing.get("push_token")
        old_device_id = existing["device_id"]
        log.warning(
            "Second device login detected — revoking old session",
            user_id=user_id,
            old_device=old_device_id[:8],
            new_device=device_id[:8],
        )
        _revoke_session(existing["id"])
        await _send_logout_push(old_push, device_name, user_id, old_device_id)

    _create_session(user_id, device_id, device_name, platform, app_version, push_token)
    log.info("New device session created", user_id=user_id, device_id=device_id[:8])


# ─────────────────────────────────────────────────────────────
# Per-request validation (called by session_middleware)
# ─────────────────────────────────────────────────────────────

def validate_device_header(user_id: str, device_id: str) -> bool:
    """
    Returns True if this device_id matches the current active session.
    Returns False (caller should 401) otherwise.
    """
    if not settings.SINGLE_DEVICE_ENFORCEMENT or not device_id:
        return True

    existing = _get_existing_session(user_id)
    if not existing:
        # No session row at all — close the bypass and reject.
        log.warning("Device validation: no active session for user", user_id=user_id)
        return False

    if existing["device_id"] != device_id:
        log.warning(
            "Device mismatch on request",
            user_id=user_id,
            expected=existing["device_id"][:8],
            got=device_id[:8],
        )
        return False

    # Refresh last_seen opportunistically
    db.get_service_client() \
        .table("active_sessions") \
        .update({"last_seen": _now_iso()}) \
        .eq("id", existing["id"]) \
        .execute()
    return True


# ─────────────────────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────────────────────

@router.post("/register", response_model=ResponseModel)
async def register_device(
    body: DeviceRegister,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Explicit device registration — call once on first app open after auth.
    Subsequent heartbeats happen automatically via session middleware.
    """
    await register_device_for_user(
        user_id=current_user["id"],
        device_id=body.device_id,
        device_name=body.device_name or "Unknown device",
        platform=body.platform or "unknown",
        app_version=body.app_version or "unknown",
        push_token=body.push_token,
    )
    return ResponseModel(data={"registered": True, "device_id": body.device_id})


@router.get("/me", response_model=ResponseModel)
async def get_my_session(current_user: dict = Depends(Auth.get_current_user)):
    """Return current active session info for the authenticated user."""
    session = _get_existing_session(current_user["id"])
    return ResponseModel(data=_sanitize_session(session))


@router.post("/revoke", response_model=ResponseModel)
async def revoke_all_sessions(current_user: dict = Depends(Auth.get_current_user)):
    """Sign out from all devices (explicit user action)."""
    db.get_service_client() \
        .table("active_sessions") \
        .update({"is_active": False, "revoked_at": _now_iso()}) \
        .eq("user_id", current_user["id"]) \
        .execute()
    log.info("All sessions revoked by user", user_id=current_user["id"])
    return ResponseModel(data={"revoked": True})


@router.put("/push-token", response_model=ResponseModel)
async def update_push_token(
    body: PushTokenUpdate,
    current_user: dict = Depends(Auth.get_current_user),
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id"),
):
    """Update the FCM push token for the current device (tokens rotate)."""
    token = (body.push_token or body.token or "").strip()
    if not token:
        raise HTTPException(400, "push_token required")

    session = _get_existing_session(current_user["id"])
    if session:
        db.get_service_client() \
            .table("active_sessions") \
            .update({"push_token": token}) \
            .eq("id", session["id"]) \
            .execute()
    return ResponseModel(data={"updated": True})
