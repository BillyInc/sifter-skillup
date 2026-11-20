"""Profile photo handling: validation, re-encoding and private storage.

Uploaded photos are never trusted: the type is decided from the file's magic
bytes, the image is fully decoded, EXIF/metadata is discarded by re-encoding,
and only a 512x512 WebP is stored in the PRIVATE ``avatars`` bucket. The bucket
is never public; the owner receives short-lived signed URLs resolved at read
time. ``users.avatar_url`` stores ``upload:<key>`` (never a URL).
"""
from __future__ import annotations

import io
import re
import threading
import time
import uuid
from collections import defaultdict, deque
from typing import Optional, Protocol

from PIL import Image, ImageOps, UnidentifiedImageError

AVATAR_BUCKET = "avatars"
PRESET_PREFIX = "preset:"
UPLOAD_PREFIX = "upload:"
MAX_UPLOAD_BYTES = 2 * 1024 * 1024
MIN_DIMENSION = 128
MAX_DIMENSION = 4096
OUTPUT_SIZE = 512
SIGNED_URL_TTL_SECONDS = 3600

_PRESET_ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
_UUID = r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
_KEY = re.compile(rf"^(?P<owner>[A-Za-z0-9_-]{{1,64}})/{_UUID}\.webp$")


class AvatarError(ValueError):
    """A user-correctable problem; the message is safe to show to the user."""


class AvatarStorage(Protocol):
    def upload(self, key: str, data: bytes, content_type: str) -> None: ...
    def delete(self, keys: list[str]) -> None: ...
    def list_keys(self, user_id: str) -> list[str]: ...
    def signed_url(self, key: str, expires_in: int) -> Optional[str]: ...


class SupabaseAvatarStorage:
    """Thin adapter over supabase-py storage using the service-role client."""

    def _bucket(self):
        from database import db  # late import keeps this module testable alone
        return db.get_service_client().storage.from_(AVATAR_BUCKET)

    def upload(self, key: str, data: bytes, content_type: str) -> None:
        self._bucket().upload(key, data, {"content-type": content_type, "upsert": "false"})

    def delete(self, keys: list[str]) -> None:
        if keys:
            self._bucket().remove(keys)

    def list_keys(self, user_id: str) -> list[str]:
        items = self._bucket().list(user_id) or []
        return [f"{user_id}/{i['name']}" for i in items if i.get("name")]

    def signed_url(self, key: str, expires_in: int) -> Optional[str]:
        res = self._bucket().create_signed_url(key, expires_in)
        if isinstance(res, dict):
            return res.get("signedURL") or res.get("signedUrl")
        return None


class InMemoryAvatarStorage:
    """Test double with the same interface."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}
        self.content_types: dict[str, str] = {}

    def upload(self, key: str, data: bytes, content_type: str) -> None:
        self.objects[key] = data
        self.content_types[key] = content_type

    def delete(self, keys: list[str]) -> None:
        for k in keys:
            self.objects.pop(k, None)

    def list_keys(self, user_id: str) -> list[str]:
        return [k for k in self.objects if k.startswith(f"{user_id}/")]

    def signed_url(self, key: str, expires_in: int) -> Optional[str]:
        return f"https://storage.test/sign/{key}?token=t&exp={expires_in}" if key in self.objects else None


_storage: Optional[AvatarStorage] = None


def get_storage() -> AvatarStorage:
    global _storage
    if _storage is None:
        _storage = SupabaseAvatarStorage()
    return _storage


def set_storage(storage: Optional[AvatarStorage]) -> None:
    """Override (tests) or reset (None) the storage backend."""
    global _storage
    _storage = storage


# --- avatar_url value rules -------------------------------------------------

def upload_key_owner(key: str) -> Optional[str]:
    m = _KEY.match(key or "")
    return m.group("owner") if m else None


def is_uploaded(value: Optional[str]) -> bool:
    return isinstance(value, str) and value.startswith(UPLOAD_PREFIX)


def uploaded_key(value: Optional[str]) -> Optional[str]:
    return value[len(UPLOAD_PREFIX):] if is_uploaded(value) else None


def validate_avatar_url(value: Optional[str], user_id: str) -> Optional[str]:
    """Accept None, ``preset:<id>`` or ``upload:<key>`` owned by ``user_id``."""
    if value is None or value == "":
        return None
    if not isinstance(value, str):
        raise AvatarError("That avatar is not valid.")
    if value.startswith(PRESET_PREFIX):
        if _PRESET_ID.match(value[len(PRESET_PREFIX):]):
            return value
        raise AvatarError("That avatar is not valid.")
    if value.startswith(UPLOAD_PREFIX):
        if upload_key_owner(value[len(UPLOAD_PREFIX):]) == str(user_id):
            return value
        raise AvatarError("That photo does not belong to your account.")
    raise AvatarError("That avatar is not valid.")


def public_avatar_url(value):
    """Value safe to show to other users: uploaded photos are owner-only."""
    return None if is_uploaded(value) else value


def scrub_embedded_avatars(rows, key: str = "users"):
    """Hide uploaded-photo references in joined rows destined for other users."""
    out = []
    for row in rows or []:
        nested = row.get(key) if isinstance(row, dict) else None
        if isinstance(nested, dict) and is_uploaded(nested.get("avatar_url")):
            row = {**row, key: {**nested, "avatar_url": None}}
        out.append(row)
    return out


def avatar_display_url(avatar_url: Optional[str], user_id: str) -> Optional[str]:
    """Short-lived signed URL for the owner's own uploaded photo, else None."""
    key = uploaded_key(avatar_url)
    if not key or upload_key_owner(key) != str(user_id):
        return None
    try:
        return get_storage().signed_url(key, SIGNED_URL_TTL_SECONDS)
    except Exception:
        return None  # a storage outage must never break /api/users/me


# --- image validation / processing ------------------------------------------

def sniff_image_type(data: bytes) -> Optional[str]:
    if data[:3] == b"\xff\xd8\xff":
        return "JPEG"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "PNG"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "WEBP"
    return None


def process_avatar_image(data: bytes) -> bytes:
    """Validate an upload and return a clean 512x512 WebP (no metadata)."""
    if not data:
        raise AvatarError("That file is empty. Choose a JPEG, PNG or WebP photo.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise AvatarError("That photo is larger than 2 MB. Choose a smaller one.")
    kind = sniff_image_type(data)
    if kind is None:
        raise AvatarError("Use a JPEG, PNG or WebP photo.")
    try:
        img = Image.open(io.BytesIO(data))
        if img.format != kind:
            raise AvatarError("Use a JPEG, PNG or WebP photo.")
        width, height = img.size  # header only; checked before pixel decode
        if width < MIN_DIMENSION or height < MIN_DIMENSION:
            raise AvatarError("That photo is too small. Use one at least 128 x 128 pixels.")
        if width > MAX_DIMENSION or height > MAX_DIMENSION:
            raise AvatarError("That photo is too large. Use one no bigger than 4096 x 4096 pixels.")
        img.load()  # raises on truncated/corrupt data
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "LA", "P"):
            rgba = img.convert("RGBA")
            flat = Image.new("RGB", rgba.size, (255, 255, 255))
            flat.paste(rgba, mask=rgba.split()[3])
            img = flat
        else:
            img = img.convert("RGB")
        img = ImageOps.fit(img, (OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        img.save(out, format="WEBP", quality=85)  # new image: no EXIF/ICC carried over
        return out.getvalue()
    except AvatarError:
        raise
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        raise AvatarError("We could not read that photo. Try another JPEG, PNG or WebP file.")


def new_object_key(user_id: str) -> str:
    return f"{user_id}/{uuid.uuid4()}.webp"


# --- Upload rate limit -------------------------------------------------------
# Per-user sliding windows over successful uploads only. In-memory, so each
# worker process keeps its own counts (the effective ceiling is per worker).
UPLOAD_LIMITS = ((3600, 5, "hour"), (86400, 20, "day"))


class UploadRateLimiter:
    def __init__(self, limits=UPLOAD_LIMITS, clock=time.time) -> None:
        self._limits = limits
        self._clock = clock
        self._events = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, user_id: str) -> Optional[int]:
        """Seconds until the user may upload again, or None if allowed now."""
        now = self._clock()
        with self._lock:
            events = self._events[user_id]
            horizon = max(w for w, _, _ in self._limits)
            while events and events[0] <= now - horizon:
                events.popleft()
            wait = 0
            for window, maximum, _ in self._limits:
                recent = [t for t in events if t > now - window]
                if len(recent) >= maximum:
                    wait = max(wait, int(recent[len(recent) - maximum] + window - now) + 1)
            return wait or None

    def record(self, user_id: str) -> None:
        with self._lock:
            self._events[user_id].append(self._clock())

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


upload_limiter = UploadRateLimiter()
