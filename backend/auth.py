# ============================================
# Sifter Skill_Up — Authentication
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
            result = db.get_service_client().table("users").select("*").eq("id", user_id).single().execute()
            if not result.data:
                raise HTTPException(status_code=401, detail="User not found")
            return result.data
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
