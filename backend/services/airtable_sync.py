# ============================================
# Sifter LevelUp — Airtable → Supabase CMS Sync
#
# Airtable is the content editor's home.
# Supabase is the app's source of truth.
# This file is the bridge.
#
# Runs as a Celery periodic task (every 30 min by default).
# Can also be triggered manually via POST /api/admin/sync/airtable
#
# What it syncs:
#   - Track descriptions + metadata
#   - Lab configs (estimated hours, prerequisites)
#   - Field descriptions (for FieldsScreen)
#   - Lesson metadata (topic, mechanic, difficulty)
#
# The actual lesson content (questions, explanations) lives in
# TypeScript files and is bundled with the app.
# Airtable only manages descriptive/editorial metadata.
# ============================================
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Body, Depends, HTTPException

from auth import Auth
from config import settings
from database import db
from logger import log
from models import AirtableSyncStatus, ResponseModel

router = APIRouter(prefix="/api/admin/sync", tags=["airtable-sync"])

AIRTABLE_BASE = "https://api.airtable.com/v0"


# ─────────────────────────────────────────────────────────────
# Airtable client
# ─────────────────────────────────────────────────────────────

async def _fetch_airtable_table(table_name: str) -> List[Dict[str, Any]]:
    """Fetch all records from an Airtable table (handles pagination)."""
    if not settings.AIRTABLE_API_KEY or not settings.AIRTABLE_BASE_ID:
        raise ValueError("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set")

    headers = {
        "Authorization": f"Bearer {settings.AIRTABLE_API_KEY}",
        "Content-Type":  "application/json",
    }
    url     = f"{AIRTABLE_BASE}/{settings.AIRTABLE_BASE_ID}/{table_name}"
    records = []
    offset  = None

    MAX_PAGES = 100
    pages = 0

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            pages += 1
            if pages > MAX_PAGES:
                raise RuntimeError(
                    f"Airtable {table_name} pagination exceeded MAX_PAGES={MAX_PAGES}"
                )

            params = {"offset": offset} if offset else {}
            resp   = await client.get(url, headers=headers, params=params)

            if resp.status_code != 200:
                # Log full upstream body for ops, but never expose it to callers.
                log.error(
                    "Airtable fetch failed",
                    table=table_name,
                    status=resp.status_code,
                    body=resp.text[:1000],
                )
                raise RuntimeError(
                    f"Airtable upstream error: HTTP {resp.status_code}"
                )

            data    = resp.json()
            records.extend(data.get("records", []))
            offset  = data.get("offset")
            if not offset:
                break

    return records


# ─────────────────────────────────────────────────────────────
# Per-table sync handlers
# ─────────────────────────────────────────────────────────────

async def _sync_tracks(records: List[dict]) -> int:
    """Sync track metadata from Airtable to content_cache.tracks."""
    synced = 0
    for rec in records:
        f = rec.get("fields", {})
        if not f.get("track_id"):
            continue
        db.get_service_client().table("content_cache").upsert({
            "id":          rec["id"],
            "content_type": "track",
            "content_key":  f["track_id"],
            "data": {
                "track_id":      f.get("track_id"),
                "name":          f.get("name"),
                "tagline":       f.get("tagline"),
                "description":   f.get("description"),
                "field_id":      f.get("field_id"),
                "estimated_hours": f.get("estimated_hours"),
                "difficulty":    f.get("difficulty"),
                "status":        f.get("status", "coming_soon"),
                "color":         f.get("color"),
                "icon":          f.get("icon"),
            },
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        synced += 1
    return synced


async def _sync_labs(records: List[dict]) -> int:
    """Sync lab configs from Airtable."""
    synced = 0
    for rec in records:
        f = rec.get("fields", {})
        if not f.get("lab_id"):
            continue
        db.get_service_client().table("content_cache").upsert({
            "id":           rec["id"],
            "content_type": "lab",
            "content_key":  f["lab_id"],
            "data": {
                "lab_id":          f.get("lab_id"),
                "track_id":        f.get("track_id"),
                "lab_number":      f.get("lab_number"),
                "title":           f.get("title"),
                "description":     f.get("description"),
                "estimated_hours": f.get("estimated_hours"),
                "level":           f.get("level"),   # junior/intermediate/senior
                "prerequisites":   f.get("prerequisites", []),
                "portfolio_push":  f.get("portfolio_push", False),
            },
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        synced += 1
    return synced


async def _sync_lesson_metadata(records: List[dict]) -> int:
    """Sync lesson descriptive metadata (not content — that's in TS files)."""
    synced = 0
    for rec in records:
        f = rec.get("fields", {})
        if not f.get("lesson_id"):
            continue
        db.get_service_client().table("content_cache").upsert({
            "id":           rec["id"],
            "content_type": "lesson_meta",
            "content_key":  f["lesson_id"],
            "data": {
                "lesson_id":  f.get("lesson_id"),
                "lab_id":     f.get("lab_id"),
                "title":      f.get("title"),
                "topic":      f.get("topic"),
                "mechanic":   f.get("mechanic"),
                "difficulty": f.get("difficulty"),
                "xp_value":   f.get("xp_value", 100),
                "is_boss":    f.get("is_boss", False),
            },
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        synced += 1
    return synced


async def _sync_field_descriptions(records: List[dict]) -> int:
    """Sync field descriptions and requirements from Airtable."""
    synced = 0
    for rec in records:
        f = rec.get("fields", {})
        if not f.get("field_id"):
            continue
        db.get_service_client().table("content_cache").upsert({
            "id":           rec["id"],
            "content_type": "field",
            "content_key":  f["field_id"],
            "data": {
                "field_id":         f.get("field_id"),
                "name":             f.get("name"),
                "world_name":       f.get("world_name"),
                "world_description": f.get("world_description"),
                "requirements":     f.get("requirements", []),
                "tagline":          f.get("tagline"),
            },
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        synced += 1
    return synced


# Table → handler map
_TABLE_HANDLERS = {
    "Tracks":          _sync_tracks,
    "Labs":            _sync_labs,
    "LessonMetadata":  _sync_lesson_metadata,
    "FieldDescriptions": _sync_field_descriptions,
}


# ─────────────────────────────────────────────────────────────
# Main sync function (called by Celery and API endpoint)
# ─────────────────────────────────────────────────────────────

async def run_airtable_sync(tables: Optional[List[str]] = None) -> List[AirtableSyncStatus]:
    """
    Sync all configured tables from Airtable → Supabase.
    Returns per-table status.
    """
    tables_to_sync = tables or settings.AIRTABLE_TABLES
    results = []

    for table in tables_to_sync:
        start = datetime.now(timezone.utc)
        try:
            records = await _fetch_airtable_table(table)
            handler = _TABLE_HANDLERS.get(table)

            if not handler:
                log.warning("No handler for Airtable table", table=table)
                results.append(AirtableSyncStatus(
                    table=table, records_synced=0,
                    synced_at=start.isoformat(),
                    error=f"No handler configured for table '{table}'"
                ))
                continue

            count = await handler(records)
            duration = (datetime.now(timezone.utc) - start).total_seconds()
            log.info("Airtable table synced", table=table, records=count, duration_s=f"{duration:.1f}")
            results.append(AirtableSyncStatus(
                table=table, records_synced=count,
                synced_at=datetime.now(timezone.utc).isoformat()
            ))

        except Exception as e:
            log.error("Airtable table sync failed", table=table, error=str(e))
            results.append(AirtableSyncStatus(
                table=table, records_synced=0,
                synced_at=start.isoformat(), error=str(e)
            ))

    # Record last sync time
    db.get_service_client().table("sync_meta").upsert({
        "key":        "airtable_last_sync",
        "value":      datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return results


# ─────────────────────────────────────────────────────────────
# Admin API endpoint (manual trigger)
# ─────────────────────────────────────────────────────────────

@router.post("/airtable", response_model=ResponseModel)
async def trigger_airtable_sync(
    body: Optional[dict] = Body(default=None),
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Manually trigger an Airtable sync.
    Only admins (is_admin=True) can call this.
    """
    if not current_user.get("is_admin"):
        raise HTTPException(403, "Admin access required")

    tables = (body or {}).get("tables")  # None = sync all
    results = await run_airtable_sync(tables)

    return ResponseModel(data={
        "synced": [r.dict() for r in results],
        "total_tables": len(results),
        "total_records": sum(r.records_synced for r in results),
    })


@router.get("/airtable/status", response_model=ResponseModel)
async def airtable_sync_status(current_user: dict = Depends(Auth.get_current_user)):
    """Return when the last Airtable sync ran."""
    result = db.get_service_client().table("sync_meta") \
        .select("value").eq("key", "airtable_last_sync").execute()
    last_sync = result.data[0]["value"] if result.data else None
    return ResponseModel(data={
        "last_sync": last_sync,
        "tables_configured": settings.AIRTABLE_TABLES,
        "sync_interval_minutes": settings.AIRTABLE_SYNC_INTERVAL_MINUTES,
    })
