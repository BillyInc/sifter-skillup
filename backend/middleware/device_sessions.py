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
import uuid
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse

from auth import Auth
from config import settings
from database import db
from logger import log
from models import DeviceRegister, ResponseModel

router = APIRouter(prefix="/api/devices", tags=["devices"])


# ─────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────

async def _send_logout_push(push_token: str, new_device_name: str):
    """Send FCM push to the old device telling it to clear local session."""
    if not push_token or not settings.FCM_SERVER_KEY:
        return
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                "https://fcm.googleapis.com/fcm/send",
                headers={
                    "Authorization": f"key={settings.FCM_SERVER_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "to": push_token,
                    "priority": "high",
                    "data": {
                        "type": "FORCE_LOGOUT",
                        "reason": "new_device_login",
                        "new_device": new_device_name,
                        "message": f"Your account was accessed on '{new_device_name}'. You've been signed out here.",
                    },
                },
            )
        log.info("Logout push sent", push_token=push_token[:10] + "…")
    except Exception as e:
        log.warning("Logout push failed (non-fatal)", error=str(e))


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
        .update({"is_active": False, "revoked_at": datetime.utcnow().isoformat()}) \
        .eq("id", session_id) \
        .execute()


def _create_session(user_id: str, device_id: str, device_name: str,
                    platform: str, app_version: str, push_token: str) -> dict:
    payload = {
        "id":           str(uuid.uuid4()),
        "user_id":      user_id,
        "device_id":    device_id,
        "device_name":  device_name or "Unknown device",
        "platform":     platform or "unknown",
        "app_version":  app_version or "unknown",
        "push_token":   push_token,
        "is_active":    True,
        "created_at":   datetime.utcnow().isoformat(),
        "last_seen":    datetime.utcnow().isoformat(),
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
    push_token: str = None,
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
                    "last_seen":   datetime.utcnow().isoformat(),
                    "push_token":  push_token or existing.get("push_token"),
                    "app_version": app_version,
                }) \
                .eq("id", existing["id"]) \
                .execute()
            log.info("Device session refreshed", user_id=user_id, device_id=device_id[:8])
            return

        # Different device — revoke old, notify, create new
        old_push = existing.get("push_token")
        old_name = existing.get("device_name", "previous device")
        log.warning(
            "Second device login detected — revoking old session",
            user_id=user_id,
            old_device=existing["device_id"][:8],
            new_device=device_id[:8],
        )
        _revoke_session(existing["id"])
        await _send_logout_push(old_push, device_name)

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
        return True   # No session yet — let auth flow create one

    if existing["device_id"] != device_id:
        log.warning(
            "Device mismatch on request",
            user_id=user_id,
            expected=existing["device_id"][:8],
            got=device_id[:8],
        )
        return False

    # Refresh last_seen opportunistically (non-blocking in prod: use background task)
    db.get_service_client() \
        .table("active_sessions") \
        .update({"last_seen": datetime.utcnow().isoformat()}) \
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
    if not session:
        return ResponseModel(data=None)
    # Sanitise before returning
    session.pop("push_token", None)
    return ResponseModel(data=session)


@router.post("/revoke", response_model=ResponseModel)
async def revoke_all_sessions(current_user: dict = Depends(Auth.get_current_user)):
    """Sign out from all devices (explicit user action)."""
    db.get_service_client() \
        .table("active_sessions") \
        .update({"is_active": False, "revoked_at": datetime.utcnow().isoformat()}) \
        .eq("user_id", current_user["id"]) \
        .execute()
    log.info("All sessions revoked by user", user_id=current_user["id"])
    return ResponseModel(data={"revoked": True})


@router.put("/push-token", response_model=ResponseModel)
async def update_push_token(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id"),
):
    """Update the FCM push token for the current device (tokens rotate)."""
    token = body.get("push_token", "")
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
