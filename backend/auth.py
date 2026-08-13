# ============================================
# Sifter LevelUp — Authentication
# Handles: Telegram WebApp, Base wallet, email, guest
# ============================================
import hashlib
import hmac
import json
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from jwt import PyJWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings
from database import db

security = HTTPBearer(auto_error=False)

class Auth:

    # ── Telegram ────────────────────────────────────────────────
    @staticmethod
    def verify_telegram_init_data(init_data: str) -> dict:
        """Verify Telegram WebApp initData HMAC signature."""
        parsed = urllib.parse.parse_qs(init_data, keep_blank_values=True)
        received_hash = parsed.pop("hash", [None])[0]
        if not received_hash:
            raise HTTPException(status_code=400, detail="Missing hash in initData")

        data_check = "\n".join(
            f"{k}={v[0]}" for k, v in sorted(parsed.items())
        )
        secret_key = hmac.new(
            b"WebAppData",
            settings.TELEGRAM_BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        expected = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected, received_hash):
            raise HTTPException(status_code=401, detail="Invalid Telegram signature")

        user_raw = parsed.get("user", [None])[0]
        if not user_raw:
            raise HTTPException(status_code=400, detail="No user in initData")
        return json.loads(user_raw)

    # ── Base wallet ─────────────────────────────────────────────
    @staticmethod
    def verify_base_wallet(wallet_address: str, signature: str, message: str) -> bool:
        """
        Verify EIP-191 signed message from Base wallet.
        Returns True if valid. In production use eth_account.messages.
        """
        try:
            from eth_account import Account
            from eth_account.messages import encode_defunct
            msg = encode_defunct(text=message)
            recovered = Account.recover_message(msg, signature=signature)
            return recovered.lower() == wallet_address.lower()
        except Exception:
            return False

    # ── JWT ─────────────────────────────────────────────────────
    @staticmethod
    def create_jwt(user_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
        return jwt.encode(
            {"sub": user_id, "exp": expire},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def decode_jwt(token: str) -> dict:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["exp", "sub"]},
        )

    @staticmethod
    async def get_current_user(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    ) -> dict:
        if not credentials:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            payload = Auth.decode_jwt(credentials.credentials)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
            # Older development databases may not have the lifecycle column
            # yet. Read the user first and apply the optional soft-delete flag
            # in Python; the lifecycle migration still enforces it once run.
            result = db.get_service_client().table("users").select("*").eq("id", user_id).single().execute()
            if not result.data:
                raise HTTPException(status_code=401, detail="User not found")
            user = result.data
            if user.get("is_deleted") is True:
                raise HTTPException(status_code=401, detail="User not found")
            # Legacy rows can be onboarding-complete without ever selecting a
            # persona. Keep that state pending so the client can send only
            # those accounts back through the account-type gate.
            user.setdefault("account_type", "pending")
            return user
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    @staticmethod
    async def require_admin(
        # .__func__: unwrap the staticmethod so FastAPI sees the async function,
        # not the descriptor — otherwise the dependency injects an un-awaited
        # coroutine and every guarded endpoint 500s (same fix as below).
        current_user: dict = Depends(get_current_user.__func__),
    ) -> dict:
        """Guard for admin-only endpoints.

        Admin surfaces (feedback inbox, cross-school coverage/peer benchmark)
        are restricted to institution admins and educators. Students must not
        see other institutions' comparative data. `account_type` is set on the
        user row ('student' | 'educator' | 'institution_admin').
        """
        if current_user.get("account_type") not in ("institution_admin", "educator"):
            raise HTTPException(status_code=403, detail="Admin access required")
        return current_user

    @staticmethod
    async def require_internal_staff(
        # NOTE: .__func__ (not the bare name): in the class body
        # `get_current_user` is the staticmethod wrapper, which FastAPI
        # treats as a sync callable and injects an un-awaited coroutine
        # (crashes on Python 3.13 / FastAPI 0.111). Unwrapping restores
        # proper async resolution and keeps dependency_overrides keyed on
        # Auth.get_current_user working.
        current_user: dict = Depends(get_current_user.__func__),
    ) -> dict:
        """Guard for internal Sifter-team-only endpoints (spec §7.8/§6A.4/§6A.5).

        Stricter than require_admin: institution admins and educators do NOT
        qualify. Access requires the `is_internal_staff` boolean on the user's
        row in skillup_dev.users (default false — see
        migration_internal_staff.sql). Used for platform-wide tooling such as
        the feedback inbox, which must never leak cross-organisation data to
        institution-level admins.
        """
        if current_user.get("is_internal_staff") is not True:
            raise HTTPException(status_code=403, detail="Internal staff access required")
        return current_user
