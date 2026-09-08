# ============================================
# Sifter LevelUp - FastAPI Backend v2
# All routers registered, all middleware wired
# ============================================
import uuid, bcrypt, base64, secrets, urllib.parse, httpx
import re
from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import email_codes
import db_email_codes
import email_delivery
from config import settings
from database import db
from models import *
from auth import Auth
from logger import log
from middleware.session_middleware import DeviceSessionMiddleware

# App setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    log.info("Application shutdown")

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)


def _is_supabase_service_restriction(exc: Exception) -> bool:
    """Identify the provider response that otherwise gets misreported as CORS."""
    message = str(exc).lower()
    return (
        "exceed_egress_quota" in message
        or "service for this project is restricted" in message
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Return a CORS-compatible JSON error for failed upstream services.

    Starlette's CORS middleware cannot add headers after an exception escapes
    the application stack. Without this handler, a Supabase 402 appears in a
    browser as a misleading CORS/Failed-to-fetch error.
    """
    log.error(
        "Unhandled API exception",
        error=exc,
        endpoint=request.url.path,
        method=request.method,
    )
    # Exception responses can be generated outside the normal CORS response
    # path. Mirror the same allow-list here so the browser can read the useful
    # error instead of reducing it to a generic CORS failure.
    origin = request.headers.get("origin")
    cors_headers = {}
    if origin and origin in settings.ALLOWED_ORIGINS:
        cors_headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Vary": "Origin",
        }
    if _is_supabase_service_restriction(exc):
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "The connected data service is temporarily unavailable. "
                    "Please restore the Supabase project quota and try again."
                )
            },
            headers=cors_headers,
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "The server could not complete this request. Please try again."},
        headers=cors_headers,
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(DeviceSessionMiddleware)

# Server-owned document versions. Clients must accept these exact versions.
CURRENT_TERMS_VERSION = "2026-08-14"
CURRENT_PRIVACY_VERSION = "2026-08-14"

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


# Health
@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION, "timestamp": datetime.now().isoformat()}


def _normalise_email(value: str) -> str:
    return (value or "").strip().lower()


def _hydrate_account_type_selection(user: dict) -> dict:
    """Read the selection marker from the compatibility settings fallback."""
    if user.get("account_type_selected_at"):
        return user
    settings_value = user.get("settings")
    if isinstance(settings_value, dict) and settings_value.get("account_type_selected_at"):
        user["account_type_selected_at"] = settings_value["account_type_selected_at"]
    return user


def _is_dev_account_email(email: str) -> bool:
    return settings.DEBUG and email.startswith("levelup.dev+") and email.endswith(
        ("@student.test", "@educator.test")
    )


_CODE_FAILURE_DETAIL = {
    email_codes.MISSING: "Request a verification code first.",
    email_codes.EXPIRED: "Verification code expired. Request a new code.",
    email_codes.TOO_MANY_ATTEMPTS: "Too many attempts. Request a new code.",
    email_codes.INVALID: "Invalid verification code.",
}

_RESET_FAILURE_DETAIL = {
    email_codes.MISSING: "Request a new reset code first.",
    email_codes.EXPIRED: "Reset code expired. Request a new code.",
    email_codes.TOO_MANY_ATTEMPTS: "Too many attempts. Request a new code.",
    email_codes.INVALID: "Invalid reset code.",
}


def _validated_signup_legal_acceptance(body: dict) -> dict:
    """Require the current legal versions at the account-creation boundary.

    The UI presents the review/checkbox flow, but the API must enforce the
    same invariant because clients can call the endpoint without the UI.
    Analytics remains an explicit opt-in and is never inferred from omission.
    """
    terms_version = str(body.get("terms_version") or body.get("termsVersion") or "").strip()
    privacy_version = str(body.get("privacy_version") or body.get("privacyVersion") or "").strip()
    if not terms_version or not privacy_version:
        raise HTTPException(
            status_code=400,
            detail="Review and accept the current Terms and Privacy Policy before creating an account.",
        )
    if terms_version != CURRENT_TERMS_VERSION or privacy_version != CURRENT_PRIVACY_VERSION:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "The Terms and Privacy Policy have changed. Review the current versions before creating an account.",
                "terms_version": CURRENT_TERMS_VERSION,
                "privacy_version": CURRENT_PRIVACY_VERSION,
            },
        )
    return {
        "termsVersion": CURRENT_TERMS_VERSION,
        "privacyVersion": CURRENT_PRIVACY_VERSION,
        "acceptedAt": datetime.now().isoformat(),
        "analyticsConsent": body.get("analytics_consent", body.get("analyticsConsent", False)) is True,
    }


def _attach_legal_acceptance(service, user: dict, acceptance: dict) -> dict:
    """Persist signup acceptance without replacing unrelated settings."""
    settings_value = dict(user.get("settings") or {})
    settings_value["legalAcceptance"] = dict(acceptance)
    try:
        updated = _update_user_returning(service, user["id"], {"settings": settings_value})
        updated.pop("password_hash", None)
        return updated
    except Exception as exc:
        # Keep compatibility with older local schemas; the authenticated legal
        # gate will require the record to be written before account features
        # continue, while signup itself remains recoverable.
        log.warning("Could not persist signup legal acceptance", error=str(exc), user_id=user.get("id"))
        user["settings"] = settings_value
        return user


async def _issue_email_code(email: str, purpose: str) -> str:
    """Generate, store and send a code. Raises HTTPException if delivery fails."""
    code = f"{secrets.randbelow(1000000):06d}"

    # Stored BEFORE sending. The reverse order can deliver a code that was
    # never recorded and therefore can never be verified; a stored code that
    # was never delivered merely expires unused.
    if settings.EMAIL_CODE_STORAGE == "database" and purpose in (
        email_codes.PURPOSE_SIGNUP,
        email_codes.PURPOSE_ADMIN_MFA,
    ):
        await db_email_codes.store_code(email, code, purpose=purpose)
    else:
        await email_codes.store_code(email, code, purpose=purpose)

    if purpose == email_codes.PURPOSE_PASSWORD_RESET:
        send = email_delivery.send_password_reset_code
    elif purpose == email_codes.PURPOSE_ADMIN_MFA:
        send = email_delivery.send_admin_mfa_code
    else:
        send = email_delivery.send_verification_code
    try:
        await send(email, code)
    except email_delivery.EmailDeliveryError as exc:
        # Never answer sent:true for mail that was not accepted -- that was the
        # original defect and is indistinguishable from success in the UI.
        log.error("Email code delivery failed", email=email, purpose=purpose, error=str(exc))
        raise HTTPException(
            status_code=502,
            detail="Could not send the email. Please try again shortly.",
        )
    return code


async def _require_valid_email_code(email: str, code: str):
    submitted = str(code or "").strip()
    if settings.EMAIL_VERIFICATION_DEV_CODES and submitted == "000000":
        return

    if settings.EMAIL_CODE_STORAGE == "database":
        outcome = await db_email_codes.verify_code(
            email, submitted, purpose=email_codes.PURPOSE_SIGNUP
        )
    else:
        outcome = await email_codes.verify_code(
            email, submitted, purpose=email_codes.PURPOSE_SIGNUP
        )
    if outcome == email_codes.OK:
        # verify_code consumes the record, so the code cannot be replayed and
        # callers have nothing left to clean up.
        return

    raise HTTPException(status_code=400, detail=_CODE_FAILURE_DETAIL[outcome])


@app.post("/api/auth/email-code/request", response_model=ResponseModel)
async def request_email_code(body: dict):
    email = _normalise_email(body.get("email", ""))
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")

    existing = db.get_service_client().table("users").select("id,password_hash").eq("email", email).execute()
    if existing.data and existing.data[0].get("password_hash"):
        raise HTTPException(status_code=409, detail="Email already registered. Try Log in instead.")

    code = await _issue_email_code(email, email_codes.PURPOSE_SIGNUP)
    data = {"sent": True, "expiresInMinutes": settings.EMAIL_CODE_TTL_MINUTES}
    if settings.EMAIL_VERIFICATION_DEV_CODES:
        data["devCode"] = code
    return ResponseModel(data=data)


@app.post("/api/auth/password-reset/request", response_model=ResponseModel)
async def request_password_reset_code(body: dict):
    """Start a password reset without revealing whether an email exists."""
    email = _normalise_email(body.get("email", ""))
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")

    code = await _issue_email_code(email, email_codes.PURPOSE_PASSWORD_RESET)
    data = {"sent": True, "expiresInMinutes": settings.EMAIL_CODE_TTL_MINUTES}
    if settings.EMAIL_VERIFICATION_DEV_CODES:
        data["devCode"] = code
    return ResponseModel(data=data)


@app.post("/api/auth/password-reset/confirm", response_model=ResponseModel)
async def confirm_password_reset(body: dict):
    email = _normalise_email(body.get("email", ""))
    code = str(body.get("code") or "").strip()
    password = body.get("password") or ""
    if not email or "@" not in email or not code:
        raise HTTPException(status_code=400, detail="Email and reset code are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if not (settings.EMAIL_VERIFICATION_DEV_CODES and code == "000000"):
        outcome = await email_codes.verify_code(
            email, code, purpose=email_codes.PURPOSE_PASSWORD_RESET
        )
        if outcome != email_codes.OK:
            raise HTTPException(status_code=400, detail=_RESET_FAILURE_DETAIL[outcome])

    existing = db.get_service_client().table("users").select("id").eq("email", email).limit(1).execute()
    if existing.data:
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        db.get_service_client().table("users").update({"password_hash": password_hash}).eq("id", existing.data[0]["id"]).execute()
    return ResponseModel(data={"updated": True})


def _admin_user(current_user: dict) -> dict:
    if current_user.get("account_type") not in ("institution_admin", "educator"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@app.get("/api/auth/mfa", response_model=ResponseModel)
async def get_admin_mfa(current_user: dict = Depends(Auth.get_current_user)):
    _admin_user(current_user)
    try:
        rows = db.get_service_client().table("user_mfa_settings").select(
            "status,method,last_verified_at,deferred_until"
        ).eq("user_id", current_user["id"]).limit(1).execute().data or []
    except Exception:
        rows = []
    return ResponseModel(data=rows[0] if rows else {
        "status": "recommended", "method": "email_otp",
        "last_verified_at": None, "deferred_until": None,
    })


@app.post("/api/auth/mfa/request", response_model=ResponseModel)
async def request_admin_mfa(current_user: dict = Depends(Auth.get_current_user)):
    _admin_user(current_user)
    email = (current_user.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="An email address is required for admin MFA.")
    code = await _issue_email_code(email, email_codes.PURPOSE_ADMIN_MFA)
    try:
        db.get_service_client().table("user_mfa_settings").upsert({
            "user_id": current_user["id"], "status": "pending_setup",
            "method": "email_otp", "updated_at": datetime.now().isoformat(),
        }, on_conflict="user_id").execute()
    except Exception as exc:
        log.warning("Admin MFA state update skipped", error=str(exc), user_id=current_user["id"])
    data = {"sent": True, "expiresInMinutes": settings.EMAIL_CODE_TTL_MINUTES}
    if settings.EMAIL_VERIFICATION_DEV_CODES:
        data["devCode"] = code
    return ResponseModel(data=data)


@app.post("/api/auth/mfa/verify", response_model=ResponseModel)
async def verify_admin_mfa(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    _admin_user(current_user)
    code = str(body.get("code") or "").strip()
    if not code:
        raise HTTPException(status_code=400, detail="Admin MFA code is required.")
    if settings.EMAIL_VERIFICATION_DEV_CODES and code == "000000":
        outcome = email_codes.OK
    elif settings.EMAIL_CODE_STORAGE == "database":
        outcome = await db_email_codes.verify_code(
            (current_user.get("email") or "").strip().lower(), code,
            purpose=email_codes.PURPOSE_ADMIN_MFA,
        )
    else:
        outcome = await email_codes.verify_code(
            (current_user.get("email") or "").strip().lower(), code,
            purpose=email_codes.PURPOSE_ADMIN_MFA,
        )
    if outcome != email_codes.OK:
        raise HTTPException(status_code=400, detail="Invalid or expired admin MFA code.")
    try:
        db.get_service_client().table("user_mfa_settings").upsert({
            "user_id": current_user["id"], "status": "enabled", "method": "email_otp",
            "last_verified_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }, on_conflict="user_id").execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Admin MFA storage is not ready. Apply the security migration first.")
    token = Auth.create_jwt(current_user["id"], mfa_verified=True)
    return ResponseModel(data={"token": token, "status": "enabled"})


@app.post("/api/auth/mfa/defer", response_model=ResponseModel)
async def defer_admin_mfa(current_user: dict = Depends(Auth.get_current_user)):
    _admin_user(current_user)
    deferred_until = datetime.now() + timedelta(days=30)
    try:
        db.get_service_client().table("user_mfa_settings").upsert({
            "user_id": current_user["id"], "status": "deferred", "method": "email_otp",
            "deferred_until": deferred_until.isoformat(), "updated_at": datetime.now().isoformat(),
        }, on_conflict="user_id").execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Admin MFA storage is not ready. Apply the security migration first.")
    return ResponseModel(data={"status": "deferred", "deferredUntil": deferred_until.isoformat()})


def _onboarding_draft_out(row: dict) -> dict:
    """Convert the server draft columns to the client-owned draft shape."""
    return {
        "userId": row.get("user_id"),
        "mode": row.get("mode"),
        "choice": row.get("choice"),
        "step": row.get("step") or 0,
        "checkpoint": row.get("checkpoint"),
        "studentProfile": row.get("student_profile") or {},
        "educatorProfile": row.get("educator_profile") or {},
        "admissionContext": row.get("admission_context") or {},
        "updatedAt": row.get("updated_at"),
    }


def _draft_object(value, field: str) -> dict:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail=f"{field} must be an object.")
    # Drafts are UI state, not an arbitrary persistence endpoint. Keep nested
    # JSON values but reject an accidentally huge payload before it reaches DB.
    if len(str(value)) > 200_000:
        raise HTTPException(status_code=413, detail="Onboarding draft is too large.")
    return value


@app.get("/api/users/onboarding-draft", response_model=ResponseModel)
async def get_onboarding_draft(current_user: dict = Depends(Auth.get_current_user)):
    try:
        result = (
            db.get_service_client()
            .table("onboarding_drafts")
            .select("user_id,mode,choice,step,checkpoint,student_profile,educator_profile,admission_context,updated_at")
            .eq("user_id", current_user["id"])
            .limit(1)
            .execute()
        )
        row = (result.data or [None])[0]
        return ResponseModel(data=_onboarding_draft_out(row) if row else None)
    except Exception as exc:
        log.warning("Onboarding draft read unavailable", error=str(exc), user_id=current_user.get("id"))
        raise HTTPException(status_code=503, detail="Onboarding resume is temporarily unavailable.")


@app.put("/api/users/onboarding-draft", response_model=ResponseModel)
async def save_onboarding_draft(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
):
    mode = body.get("mode")
    if mode not in (None, "student", "educator"):
        raise HTTPException(status_code=400, detail="Onboarding draft mode is invalid.")
    try:
        step = int(body.get("step") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Onboarding draft step is invalid.")
    if step < 0 or step > 100:
        raise HTTPException(status_code=400, detail="Onboarding draft step is invalid.")
    choice = body.get("choice")
    if choice is not None and (not isinstance(choice, str) or len(choice) > 80):
        raise HTTPException(status_code=400, detail="Onboarding draft choice is invalid.")
    checkpoint = body.get("checkpoint")
    if checkpoint is not None and (not isinstance(checkpoint, str) or len(checkpoint) > 120):
        raise HTTPException(status_code=400, detail="Onboarding draft checkpoint is invalid.")

    payload = {
        "user_id": current_user["id"],
        "mode": mode,
        "choice": choice,
        "step": step,
        "checkpoint": checkpoint,
        "student_profile": _draft_object(body.get("studentProfile", body.get("student_profile")), "studentProfile"),
        "educator_profile": _draft_object(body.get("educatorProfile", body.get("educator_profile")), "educatorProfile"),
        "admission_context": _draft_object(body.get("admissionContext", body.get("admission_context")), "admissionContext"),
        "updated_at": datetime.now().isoformat(),
    }
    try:
        result = (
            db.get_service_client()
            .table("onboarding_drafts")
            .upsert(payload, on_conflict="user_id")
            .execute()
        )
        row = (result.data or [payload])[0]
        return ResponseModel(data=_onboarding_draft_out(row))
    except HTTPException:
        raise
    except Exception as exc:
        log.warning("Onboarding draft write unavailable", error=str(exc), user_id=current_user.get("id"))
        raise HTTPException(status_code=503, detail="Onboarding resume is temporarily unavailable.")


@app.delete("/api/users/onboarding-draft", response_model=ResponseModel)
async def delete_onboarding_draft(current_user: dict = Depends(Auth.get_current_user)):
    try:
        db.get_service_client().table("onboarding_drafts").delete().eq("user_id", current_user["id"]).execute()
        return ResponseModel(data={"deleted": True})
    except Exception as exc:
        log.warning("Onboarding draft delete unavailable", error=str(exc), user_id=current_user.get("id"))
        raise HTTPException(status_code=503, detail="Onboarding resume is temporarily unavailable.")


# AUTH ROUTES (unchanged from original)

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
        user = _create_user(wallet_address=wallet_address, username=f"0x{wallet_address[2:6]}...{wallet_address[-4:]}", auth_provider="base")
    token = Auth.create_jwt(user["id"])
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/guest", response_model=ResponseModel)
async def auth_guest(request: Request):
    uid = uuid.uuid4().hex[:8]
    user = _create_user(username=f"Guest_{uid}", auth_provider="guest")
    token = Auth.create_jwt(user["id"])
    # Guest was the only auth route that skipped device registration: telegram,
    # base-wallet, signup and login all call this. Without it no active_sessions
    # row exists, so validate_device_header rejects ("no session row at all")
    # and EVERY authenticated request afterwards 401s with device_mismatch.
    # Guest is the web app's main entry point, so browsing was dead end-to-end.
    body: dict = {}
    try:
        parsed = await request.json()
        if isinstance(parsed, dict):
            body = parsed
    except Exception:  # noqa: BLE001 - empty or non-JSON body is fine here
        pass
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/auth/signup", response_model=ResponseModel)
async def auth_signup(body: dict, request: Request):
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    email_code = (body.get("email_code") or body.get("emailCode") or "").strip()
    device_id = (body.get("device_id") or request.headers.get("X-Device-Id") or "").strip()
    first_name = (body.get("first_name") or "").strip()
    middle_name = (body.get("middle_name") or "").strip()
    last_name = (body.get("last_name") or "").strip()
    date_of_birth = (body.get("date_of_birth") or "").strip() or None
    username = " ".join(part for part in (first_name, middle_name, last_name) if part) or email.split("@")[0]
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    legal_acceptance = _validated_signup_legal_acceptance(body)
    await _require_valid_email_code(email, email_code)
    if device_id:
        try:
            cooldown = (
                db.get_service_client().table("account_deletion_cooldowns")
                .select("available_at")
                .eq("device_id", device_id)
                .gt("available_at", datetime.now().isoformat())
                .order("available_at", desc=True)
                .limit(1).execute().data or []
            )
        except Exception as exc:
            # The cooldown table is introduced by the lifecycle migration. A
            # pre-migration dev database must still enforce the cooldown saved
            # on the deleted user row itself.
            log.warning("Signup cooldown lookup skipped", error=str(exc))
            cooldown = []
            try:
                cooldown = (
                    db.get_service_client().table("users")
                    .select("deletion_cooldown_until")
                    .eq("deleted_device_id", device_id)
                    .gt("deletion_cooldown_until", datetime.now().isoformat())
                    .limit(1).execute().data or []
                )
            except Exception as fallback_exc:
                # Very old schemas may not have either lifecycle surface. The
                # migration remains the durable fix; keep this compatibility
                # path non-fatal for those databases.
                log.warning("Signup user-row cooldown lookup skipped", error=str(fallback_exc))
        if cooldown:
            raise HTTPException(status_code=429, detail="This device must wait before creating another account.")
    try:
        existing = db.get_service_client().table("users").select("*").eq("email", email).execute()
        existing.data = [row for row in (existing.data or []) if row.get("is_deleted") is not True]
        if existing.data:
            existing_user = existing.data[0]
            # Built-in development presets are reusable fixtures. Reset only
            # their known dev password so repeated preset clicks can sign in;
            # never apply this behavior to real accounts or production.
            if _is_dev_account_email(email) and existing_user.get("password_hash"):
                password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                user = _update_user_returning(db.get_service_client(), existing_user["id"], {
                    "password_hash": password_hash,
                    "last_login": datetime.now().isoformat(),
                })
                user = _attach_legal_acceptance(db.get_service_client(), user, legal_acceptance)
                user.pop("password_hash", None)
                token = Auth.create_jwt(user["id"])
                await _post_auth_device_register(user["id"], body, request)
                return ResponseModel(data={"token": token, "user": user})
            # A failed post-signup step can leave the user row without credentials.
            # Complete that partial row instead of making the user retry into a 409.
            if not existing_user.get("password_hash"):
                password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                user = _update_user_returning(db.get_service_client(), existing_user["id"], {
                    "username": username,
                    "first_name": first_name or None,
                    "middle_name": middle_name or None,
                    "last_name": last_name or None,
                    "date_of_birth": date_of_birth,
                    "password_hash": password_hash,
                    "auth_provider": "email",
                    "onboarding_completed": False,
                    "account_type": "pending",
                    "last_login": datetime.now().isoformat(),
                })
                user = _attach_legal_acceptance(db.get_service_client(), user, legal_acceptance)
                user["onboarding_completed"] = False
                token = Auth.create_jwt(user["id"])
                await _post_auth_device_register(user["id"], body, request)
                return ResponseModel(data={"token": token, "user": user})
            raise HTTPException(status_code=409, detail="Email already registered. Try Log in instead.")
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        user = _create_user(username=username, auth_provider="email", email=email, password_hash=password_hash,
                            first_name=first_name, middle_name=middle_name, last_name=last_name,
                            date_of_birth=date_of_birth)
        user = _attach_legal_acceptance(db.get_service_client(), user, legal_acceptance)
        user["onboarding_completed"] = False
        token = Auth.create_jwt(user["id"])
        await _post_auth_device_register(user["id"], body, request)
        return ResponseModel(data={"token": token, "user": user})
    except HTTPException:
        raise
    except Exception as exc:
        log.error(
            "Signup account creation failed",
            error=exc,
            email=email,
            has_first_name=bool(first_name),
            has_last_name=bool(last_name),
            has_date_of_birth=bool(date_of_birth),
        )
        raise HTTPException(
            status_code=500,
            detail=(
                f"We could not create your account right now. Please try again. ({exc})"
                if settings.DEBUG
                else "We could not create your account right now. Please try again."
            ),
        )


@app.post("/api/auth/login", response_model=ResponseModel)
async def auth_login(body: dict, request: Request):
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    result = db.get_service_client().table("users").select("*").eq("email", email).execute()
    result.data = [row for row in (result.data or []) if row.get("is_deleted") is not True]
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not user.get("password_hash") or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    db.get_service_client().table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()
    token = Auth.create_jwt(user["id"])
    _hydrate_account_type_selection(user)
    user.pop("password_hash", None)
    await _post_auth_device_register(user["id"], body, request)
    return ResponseModel(data={"token": token, "user": user})


@app.post("/api/users/onboarding-complete", response_model=ResponseModel)
async def complete_onboarding(body: dict, current_user: dict = Depends(Auth.get_current_user)):
    updates = {"onboarding_completed": True}
    requested_account_type = body.get("account_type")
    if requested_account_type:
        if requested_account_type == "student":
            updates["account_type"] = "student"
        elif requested_account_type in ("educator", "institution_admin"):
            if current_user.get("account_type") != requested_account_type:
                raise HTTPException(status_code=403, detail="Finish educator verification before completing admin onboarding.")
            updates["account_type"] = requested_account_type
        else:
            raise HTTPException(status_code=400, detail="Choose a valid account type.")
        updates["account_type_selected_at"] = datetime.now().isoformat()
    elif current_user.get("account_type") == "pending":
        # Do not silently turn an unselected legacy account into a student.
        # It must return to the account-type gate on the next route decision.
        pass
    if body.get("active_track"):
        updates["active_track"] = body["active_track"]
        updates["current_track_id"] = body["active_track"]
    if body.get("active_field_id"):
        updates["active_field_id"] = body["active_field_id"]
    svc = db.get_service_client()
    try:
        user = _update_user_returning(svc, current_user["id"], updates)
    except Exception as exc:
        # Older live projects may have the settings column but not the newer
        # selection marker yet. Persist the same fact in settings so the
        # account does not return to the gate after the user chooses a type.
        if "account_type_selected_at" not in str(exc):
            raise
        compatibility_settings = dict(current_user.get("settings") or {})
        compatibility_settings["account_type_selected_at"] = updates["account_type_selected_at"]
        fallback_updates = dict(updates)
        fallback_updates.pop("account_type_selected_at", None)
        fallback_updates["settings"] = compatibility_settings
        user = _update_user_returning(svc, current_user["id"], fallback_updates)
    if updates.get("account_type_selected_at"):
        user["account_type_selected_at"] = updates["account_type_selected_at"]
    return ResponseModel(data=user)



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


def _create_user(telegram_id=None, wallet_address=None, username="Student",
                 avatar_url=None, auth_provider="guest", email=None, password_hash=None,
                 first_name=None, middle_name=None, last_name=None, date_of_birth=None) -> dict:
    onboarding_completed = auth_provider == "guest"
    account_type = "student" if auth_provider == "guest" else "pending"
    payload = {
        "id": str(uuid.uuid4()), "telegram_id": telegram_id,
        "wallet_address": wallet_address, "email": email, "password_hash": password_hash,
        "username": username, "avatar_url": avatar_url, "auth_provider": auth_provider,
        "first_name": first_name, "middle_name": middle_name, "last_name": last_name,
        "date_of_birth": date_of_birth,
        "onboarding_completed": onboarding_completed,
        "is_deleted": False,
        "account_type": account_type,
        "points": settings.WELCOME_BONUS, "streak": 1,
        "last_played": date.today().isoformat(), "current_level": 1,
        "completed_levels": [], "perfect_levels": [], "python_chapters_completed": [],
        "active_track": "crypto", "boosters": {"hammer": 3, "lightning": 2, "shuffle": 5},
        "achievements": [], "settings": {"notifications": True, "sound": True, "haptics": True},
        "created_at": datetime.now().isoformat(), "last_login": datetime.now().isoformat(),
    }
    # Keep signup usable against older local schemas while migrations are
    # being applied. PostgREST names the missing column in PGRST204 errors;
    # remove only that optional field and retry. Required auth fields still
    # fail normally and are not silently fabricated.
    pending = dict(payload)
    for _ in range(8):
        try:
            result = db.get_service_client().table("users").insert(pending).execute()
            return result.data[0]
        except Exception as exc:
            match = re.search(r"'([^']+)' column", str(exc))
            missing = match.group(1) if match else None
            if not missing or missing not in pending or missing in {"id", "email", "password_hash", "username"}:
                raise
            pending.pop(missing, None)
    raise RuntimeError("Could not create user with the available schema")


def _soft_delete_user_compat(service, user_id: str, updates: dict) -> None:
    """Apply deletion fields across pre- and post-lifecycle schemas.

    The lifecycle migration is additive, but deletion must not become
    impossible while an older local/deployed schema is being upgraded. When
    PostgREST identifies a missing optional column, remove only that field and
    retry. Email anonymisation and password clearing remain required fields.
    """
    pending = dict(updates)
    required = {"email", "password_hash"}
    for _ in range(len(pending) + 1):
        try:
            service.table("users").update(pending).eq("id", user_id).execute()
            return
        except Exception as exc:
            match = re.search(r"(?:'([^']+)' column|column '([^']+)')", str(exc))
            missing = next((value for value in (match.groups() if match else ()) if value), None)
            if not missing or missing not in pending or missing in required:
                raise
            pending.pop(missing, None)
    raise RuntimeError("Could not apply compatible account deletion update")


def _update_user_returning(service, user_id: str, updates: dict) -> dict:
    """Update a user and read it back using the deployed PostgREST API.

    The installed Supabase client exposes ``execute`` on an update filter but
    does not expose ``select`` after that filter. Read-after-write keeps the
    response stable across local and deployed client versions.
    """
    service.table("users").update(dict(updates)).eq("id", user_id).execute()
    result = service.table("users").select("*").eq("id", user_id).limit(1).execute()
    return (result.data or [{}])[0]


# USER ROUTES

@app.get("/api/users/me", response_model=ResponseModel)
async def get_me(current_user: dict = Depends(Auth.get_current_user)):
    # Session restoration must not depend on the legacy game leaderboard RPC.
    # That function is absent or slow on some deployed databases, while rank
    # is unrelated to the identity/profile data needed to open the workspace.
    # Guild/leaderboard routes can resolve rank when those screens are opened.
    current_user["rank"] = None
    current_user.pop("password_hash", None)
    # Legacy accounts may have completed the old flow without a persona.
    # Keep them pending so the client routes them to user-type selection.
    current_user.setdefault("account_type", "pending")
    _hydrate_account_type_selection(current_user)
    return ResponseModel(data=current_user)


# Columns that gate authorisation or are otherwise server-managed.
# Never writable through the self-service profile update, regardless of
# what the UserUpdate model accepts (defense in depth against model drift).
_PRIVILEGED_USER_COLUMNS = frozenset({
    "id", "account_type", "is_internal_staff", "password_hash",
})


@app.put("/api/users/me", response_model=ResponseModel)
async def update_me(updates: UserUpdate, current_user: dict = Depends(Auth.get_current_user)):
    payload = {
        k: v for k, v in updates.model_dump(exclude_unset=True).items()
        if k not in _PRIVILEGED_USER_COLUMNS
    }
    if not payload:
        current_user.pop("password_hash", None)
        return ResponseModel(data=current_user)
    user = _update_user_returning(db.get_client(), current_user["id"], payload)
    user.update(payload)
    user.pop("password_hash", None)
    return ResponseModel(data=user)


@app.post("/api/users/legal-acceptance", response_model=ResponseModel)
async def record_legal_acceptance(
    acceptance: LegalAcceptanceInput,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Record current terms/privacy acceptance without replacing user settings."""
    if (
        acceptance.terms_version != CURRENT_TERMS_VERSION
        or acceptance.privacy_version != CURRENT_PRIVACY_VERSION
    ):
        raise HTTPException(
            status_code=409,
            detail={
                "message": "This legal document version is no longer current.",
                "terms_version": CURRENT_TERMS_VERSION,
                "privacy_version": CURRENT_PRIVACY_VERSION,
            },
        )
    recorded_at = datetime.now().isoformat()
    next_settings = dict(current_user.get("settings") or {})
    next_settings["legalAcceptance"] = {
        "termsVersion": acceptance.terms_version,
        "privacyVersion": acceptance.privacy_version,
        "acceptedAt": recorded_at,
        "analyticsConsent": acceptance.analytics_consent,
        "recordedAt": recorded_at,
    }
    user = _update_user_returning(
        db.get_client(), current_user["id"], {"settings": next_settings}
    )
    user.pop("password_hash", None)
    return ResponseModel(data={"accepted": True, "user": user})


@app.delete("/api/users/me", response_model=ResponseModel)
async def delete_me(
    request: Request,
    current_user: dict = Depends(Auth.get_current_user),
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id"),
):
    """Soft-delete the account, revoke its sessions and start the device cooldown."""
    device_id = (x_device_id or "").strip()
    deleted_at = datetime.now().isoformat()
    available_at = (datetime.now() + timedelta(hours=24)).isoformat()
    service = db.get_service_client()
    try:
        service.table("account_deletion_cooldowns").insert({
            "user_id": current_user["id"],
            "device_id": device_id or "unknown",
            "email": current_user.get("email"),
            "deleted_at": deleted_at,
            "available_at": available_at,
        }).execute()
    except Exception as exc:
        # Lifecycle migrations are additive. Account deletion must still work
        # against an older local schema; the cooldown is an extra safeguard,
        # not a reason to leave the account active.
        log.warning("Account deletion cooldown table unavailable", error=str(exc))
    deletion_updates = {
        "is_deleted": True,
        "deleted_at": deleted_at,
        "deletion_cooldown_until": available_at,
        "deleted_device_id": device_id or None,
        "email": f"deleted-{current_user['id']}@deleted.invalid",
        "password_hash": None,
        "onboarding_completed": False,
    }
    try:
        _soft_delete_user_compat(service, current_user["id"], deletion_updates)
    except Exception as exc:
        detail = (
            f"Account deletion could not update the account: {exc}"
            if settings.DEBUG
            else "Account deletion is temporarily unavailable."
        )
        log.error("Account deletion update failed", error=str(exc))
        raise HTTPException(status_code=500, detail=detail) from exc
    try:
        service.table("active_sessions").update({
            "is_active": False,
            "revoked_at": deleted_at,
        }).eq("user_id", current_user["id"]).execute()
    except Exception as exc:
        log.warning("Active session revocation skipped during deletion", error=str(exc))
    return ResponseModel(data={"deleted": True, "available_at": available_at})


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


# GAME / PROGRESS (unchanged from original)

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




# HELPERS
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


# INCLUDE ALL ROUTERS

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

from routes.entrepreneurship_routes import router as entrepreneurship_router
app.include_router(entrepreneurship_router)

from routes.feedback_routes import router as feedback_router
app.include_router(feedback_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
