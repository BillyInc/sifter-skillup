# ============================================================
# Sifter LevelUp — Content Routes
# /api/content/{track_id}/version  GET  — version check
# /api/content/{track_id}          GET  — full content download
# /api/content/manifest            GET  — all track versions
#
# Called by offlineStorage.ts downloadTrackContent() to:
# 1. Check if local version is stale
# 2. Download full track blob if update needed
# ============================================================
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/content", tags=["content"])

# Current content version — bump this when lesson content changes
# In production this would come from a DB table or config
CONTENT_VERSIONS: dict = {
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


@router.get("/manifest", response_model=ResponseModel)
async def content_manifest(
    current_user: dict = Depends(Auth.get_current_user),
):
    """Return version numbers for all tracks. Client uses this to decide what to download."""
    return ResponseModel(data={
        "versions":    CONTENT_VERSIONS,
        "server_time": datetime.utcnow().isoformat(),
    })


@router.get("/{track_id}/version", response_model=ResponseModel)
async def content_version(
    track_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Return the current server version for a track."""
    version = CONTENT_VERSIONS.get(track_id, 1)
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
    version = CONTENT_VERSIONS.get(track_id)
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
        "downloaded_at": datetime.utcnow().isoformat(),
        # Actual lessons live in the app bundle — this is metadata only
        "content_type": "metadata",
        "note": "Lesson content is bundled in the app. This provides version metadata for offline manifest.",
    })
