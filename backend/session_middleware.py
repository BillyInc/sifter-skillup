# ============================================
# Sifter Skill_Up — Session Middleware
#
# Validates X-Device-Id header on every
# authenticated request. If the device_id
# doesn't match the active session, 401 with
# a clear message so the client can clear
# local state and force re-login.
#
# Skipped routes (no auth needed):
#   /health, /api/auth/*, /api/github/callback
# ============================================
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse
from jwt import PyJWTError
from starlette.middleware.base import BaseHTTPMiddleware

from auth import Auth
from config import settings
from device_sessions import validate_device_header
from logger import log

# Routes that bypass device validation entirely.
# NOTE: /api/sync/drain was previously here but is a high-value mutation
# route, so it now goes through full device enforcement.
_SKIP_PREFIXES = (
    "/health",
    "/docs",
    "/openapi",
    "/api/auth/",
    "/api/github/callback",
)


def _should_skip(path: str) -> bool:
    return any(path.startswith(p) for p in _SKIP_PREFIXES)


def _extract_user_id_from_bearer(request: Request) -> Optional[str]:
    """
    Lightweight JWT decode to get user_id without hitting the DB.
    Full JWT validation still happens in Auth.get_current_user —
    this is just for correlation with the device table.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = Auth.decode_jwt(token)
        return payload.get("sub")
    except PyJWTError:
        return None
    except Exception:
        return None


class DeviceSessionMiddleware(BaseHTTPMiddleware):
    """
    Lightweight middleware — only does device_id cross-check.
    Skips unauthenticated routes. Skips if SINGLE_DEVICE_ENFORCEMENT=false.
    """

    async def dispatch(self, request: Request, call_next):
        if not settings.SINGLE_DEVICE_ENFORCEMENT:
            return await call_next(request)

        path = request.url.path
        if _should_skip(path):
            return await call_next(request)

        # Only check authenticated requests
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return await call_next(request)

        user_id = _extract_user_id_from_bearer(request)
        if not user_id:
            return await call_next(request)

        # Cache for downstream handlers (rate limiters, etc.)
        request.state.user_id = user_id

        device_id = request.headers.get("X-Device-Id", "").strip()

        if not device_id:
            log.warning(
                "Missing X-Device-Id on authenticated request",
                user_id=user_id,
                path=path,
            )
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "error":   "device_required",
                    "message": "X-Device-Id header is required for this request.",
                },
            )

        if not validate_device_header(user_id, device_id):
            log.warning(
                "Device validation failed — rejecting request",
                user_id=user_id,
                device_id=device_id[:8],
                path=path,
            )
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "error": "device_mismatch",
                    "message": (
                        "This account is active on another device. "
                        "Please open the app on your registered device, "
                        "or sign in again to transfer the session here."
                    ),
                },
            )

        request.state.device_id = device_id
        return await call_next(request)
