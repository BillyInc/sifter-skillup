# ============================================
# Sifter Skill_Up — Token Encryption Utilities
# ============================================
import os

from cryptography.fernet import Fernet, InvalidToken

from config import settings

_fernet = Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_token(token: str) -> str:
    """Encrypt a plaintext token string and return a URL-safe base64 encoded string."""
    if not token:
        return ""
    return _fernet.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    """Decrypt an encrypted token string back to plaintext."""
    if not encrypted:
        return ""
    try:
        return _fernet.decrypt(encrypted.encode()).decode()
    except (InvalidToken, Exception):
        return ""
