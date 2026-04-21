# ============================================================
# Sifter Skill_Up — Content Routes
# /api/content/{track_id}/version  GET  — version check
# /api/content/{track_id}          GET  — full content download
# /api/content/manifest            GET  — all track versions
#
# Called by offlineStorage.ts downloadTrackContent() to:
# 1. Check if local version is stale
# 2. Download full track blob if update needed
# ============================================================
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/content", tags=["content"])

# Fallback hardcoded versions if the sync_meta table is empty / unreachable.
_FALLBACK_CONTENT_VERSIONS: Dict[str, int] = {
    "crypto":                    3,
    "starknet-islands":          2,
    "starknet-defi-navigator":   1,
    "defi-research-analyst":     1,
    "supply-chain":              2,
    "quant-trading":             2,
    "quant-research":            2,
    "quant-developer":           2,
    "python":                    1,
}

# Module-level cache: avoid hammering the DB on every request.
_VERSION_CACHE: Dict[str, Any] = {"value": None, "expires_at": None}
_CACHE_TTL = timedelta(seconds=60)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now_utc().isoformat()


def _load_versions_from_db() -> Optional[Dict[str, int]]:
    """Read content versions from skillup_dev.sync_meta table."""
    try:
        result = db.get_service_client() \
            .table("sync_meta") \
            .select("key,value") \
            .like("key", "content_version_%") \
            .execute()
    except Exception as exc:
        log.warning("sync_meta query failed", error=str(exc))
        return None

    if not result.data:
        return None

    versions: Dict[str, int] = {}
    for row in result.data:
        key = row.get("key", "")
        if not key.startswith("content_version_"):
            continue
        track_id = key[len("content_version_"):]
        try:
            versions[track_id] = int(row.get("value"))
        except (TypeError, ValueError):
            continue
    return versions or None


def _get_content_versions() -> Dict[str, int]:
    """Cached read of content versions, falling back to hardcoded dict."""
    now = _now_utc()
    cached_value = _VERSION_CACHE.get("value")
    expires_at = _VERSION_CACHE.get("expires_at")
    if cached_value is not None and expires_at is not None and now < expires_at:
        return cached_value

    versions = _load_versions_from_db()
    if versions is None:
        log.warning("content_versions: sync_meta empty/unavailable, using fallback")
        versions = dict(_FALLBACK_CONTENT_VERSIONS)

    _VERSION_CACHE["value"] = versions
    _VERSION_CACHE["expires_at"] = now + _CACHE_TTL
    return versions


@router.get("/manifest", response_model=ResponseModel)
async def content_manifest(
    _current_user: dict = Depends(Auth.get_current_user),
):
    """Return version numbers for all tracks. Client uses this to decide what to download."""
    return ResponseModel(data={
        "versions":    _get_content_versions(),
        "server_time": _now_iso(),
    })


@router.get("/{track_id}/version", response_model=ResponseModel)
async def content_version(
    track_id: str,
    _current_user: dict = Depends(Auth.get_current_user),
):
    """Return the current server version for a track."""
    version = _get_content_versions().get(track_id, 1)
    return ResponseModel(data={
        "track_id": track_id,
        "version":  version,
    })


@router.get("/{track_id}", response_model=ResponseModel)
async def get_track_content(
    track_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Return full downloadable content blob for a track.

    NOTE: In production this endpoint serves pre-built JSON blobs from
    object storage (S3/R2/Cloudflare). The lesson content is bundled at
    build time from the TypeScript source files, serialised to JSON, and
    stored as a blob per track.

    For now returns metadata only — actual lesson content is bundled
    in the app's TypeScript files and loaded client-side. This endpoint
    is used to signal content version and metadata for offline manifest.
    """
    versions = _get_content_versions()
    version = versions.get(track_id)
    if version is None:
        raise HTTPException(404, f"Track '{track_id}' not found")

    # Try to fetch from content_cache (Airtable-synced metadata)
    cached = db.get_service_client() \
        .table("content_cache") \
        .select("data") \
        .eq("content_type", "track") \
        .eq("content_key", track_id) \
        .execute()

    metadata = cached.data[0]["data"] if cached.data else {
        "track_id": track_id,
        "name":     track_id.replace("-", " ").title(),
        "version":  version,
    }

    log.info("Content download", user_id=current_user["id"], track_id=track_id, version=version)

    return ResponseModel(data={
        **metadata,
        "version":     version,
        "downloaded_at": _now_iso(),
        # Actual lessons live in the app bundle — this is metadata only
        "content_type": "metadata",
        "note": "Lesson content is bundled in the app. This provides version metadata for offline manifest.",
    })
