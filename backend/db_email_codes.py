"""Durable hashed email-code storage for production signup and MFA."""

import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional

from config import settings
from database import db

import email_codes


def _hash(code: str) -> str:
    return hmac.new(
        settings.JWT_SECRET.encode("utf-8"),
        str(code).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def store_code(
    email: str,
    code: str,
    purpose: str,
    ttl_minutes: Optional[int] = None,
    user_id: Optional[str] = None,
) -> None:
    if purpose == email_codes.PURPOSE_SIGNUP:
        purpose = "signup_email"
    elif purpose == email_codes.PURPOSE_ADMIN_MFA:
        purpose = "admin_mfa"
    else:
        raise ValueError("This code purpose is not supported by durable storage")

    service = db.get_service_client()
    now = _now()
    ttl = ttl_minutes if ttl_minutes is not None else settings.EMAIL_CODE_TTL_MINUTES
    # A new request invalidates every previous active challenge for this email.
    service.table("auth_email_codes").update({
        "consumed_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }).eq("email", email.lower()).eq("purpose", purpose).is_("consumed_at", "null").execute()
    service.table("auth_email_codes").insert({
        "email": email.lower(),
        "user_id": user_id,
        "purpose": purpose,
        "code_hash": _hash(code),
        "attempts": 0,
        "max_attempts": settings.EMAIL_CODE_MAX_ATTEMPTS,
        "expires_at": (now + timedelta(minutes=ttl)).isoformat(),
        "updated_at": now.isoformat(),
    }).execute()


async def verify_code(email: str, code: str, purpose: str) -> str:
    db_purpose = "signup_email" if purpose == email_codes.PURPOSE_SIGNUP else "admin_mfa"
    service = db.get_service_client()
    result = service.table("auth_email_codes").select(
        "id,code_hash,attempts,max_attempts,expires_at"
    ).eq("email", email.lower()).eq("purpose", db_purpose).is_(
        "consumed_at", "null"
    ).order("created_at", desc=True).limit(1).execute()
    row = (result.data or [None])[0]
    if not row:
        return email_codes.MISSING

    try:
        expires_at = datetime.fromisoformat(str(row.get("expires_at")).replace("Z", "+00:00"))
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        expires_at = datetime.min.replace(tzinfo=timezone.utc)
    if _now() > expires_at:
        return email_codes.EXPIRED

    attempts = int(row.get("attempts") or 0)
    max_attempts = int(row.get("max_attempts") or settings.EMAIL_CODE_MAX_ATTEMPTS)
    if attempts >= max_attempts:
        return email_codes.TOO_MANY_ATTEMPTS

    if not hmac.compare_digest(str(row.get("code_hash") or ""), _hash(code)):
        service.table("auth_email_codes").update({
            "attempts": attempts + 1,
            "updated_at": _now().isoformat(),
        }).eq("id", row["id"]).execute()
        return email_codes.INVALID

    service.table("auth_email_codes").update({
        "consumed_at": _now().isoformat(),
        "updated_at": _now().isoformat(),
    }).eq("id", row["id"]).execute()
    return email_codes.OK
