# ============================================
# Sifter LevelUp — Device Session Enforcement
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
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from auth import Auth
from config import settings
from database import db
from fcm_service import FCMService
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

        # Send FCM logout notification to old device
        if old_push:
            FCMService.send_device_logout_notification(old_push, device_name)

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
    _x_device_id: Optional[str] = Header(None, alias="X-Device-Id"),
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
