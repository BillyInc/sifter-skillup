# ============================================
# Sifter Skill_Up — Track Feed Routes
# Per-track curated content feed
# News, research, protocol updates, job posts
# relevant to the track the user is on.
# ============================================
import uuid
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import FeedItemReact, FeedSubscribe, ResponseModel

router = APIRouter(prefix="/api/feed", tags=["feed"])

# Feed source domains per track (lightweight — full config in src/lib/trackFeedConfig.ts)
_TRACK_SOURCES = {
    "crypto":                   ["defillama.com", "decrypt.co", "theblock.co"],
    "starknet-defi-navigator":  ["starknet.io", "voyager.online", "ekubo.org"],
    "defi-research-analyst":    ["defillama.com", "messari.io", "delphi.digital"],
    "quant-trading":            ["quantnews.com", "risk.net", "jot.pm"],
    "supply-chain":             ["supplychaindigital.com", "logisticsmanagement.com"],
}


# ─────────────────────────────────────────────────────────────
# Subscribe / unsubscribe
# ─────────────────────────────────────────────────────────────

@router.post("/subscribe", response_model=ResponseModel)
async def subscribe_to_feed(
    body: FeedSubscribe,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Set which track/field feeds the user wants to see."""
    db.get_service_client().table("track_subscriptions").upsert({
        "user_id":     current_user["id"],
        "track_ids":   body.track_ids,
        "field_ids":   body.field_ids,
        "updated_at":  datetime.utcnow().isoformat(),
    }).execute()
    return ResponseModel(data={"subscribed": True})


@router.get("/subscriptions", response_model=ResponseModel)
async def get_subscriptions(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("track_subscriptions") \
        .select("*").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0] if result.data else {"track_ids": [], "field_ids": []})


# ─────────────────────────────────────────────────────────────
# Feed items
# ─────────────────────────────────────────────────────────────

@router.get("/", response_model=ResponseModel)
async def get_feed(
    track_id: Optional[str] = None,
    limit: int = 30,
    offset: int = 0,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Return personalised feed for the current user.
    Filters by track_id if provided, otherwise uses subscriptions.
    """
    user_id = current_user["id"]

    if not track_id:
        subs = db.get_service_client().table("track_subscriptions") \
            .select("track_ids").eq("user_id", user_id).execute()
        track_ids = subs.data[0]["track_ids"] if subs.data else [current_user.get("active_track", "crypto")]
    else:
        track_ids = [track_id]

    result = db.get_service_client().table("feed_items") \
        .select("*") \
        .in_("track_id", track_ids) \
        .eq("is_published", True) \
        .order("published_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    return ResponseModel(data=result.data)


@router.get("/{item_id}", response_model=ResponseModel)
async def get_feed_item(
    item_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    result = db.get_service_client().table("feed_items") \
        .select("*").eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(404, "Feed item not found")
    return ResponseModel(data=result.data[0])


@router.post("/react", response_model=ResponseModel)
async def react_to_feed_item(
    body: FeedItemReact,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Like, bookmark, or share a feed item."""
    col_map = {
        "like":     "like_count",
        "bookmark": "bookmark_count",
        "share":    "share_count",
    }
    col = col_map.get(body.reaction)
    if not col:
        raise HTTPException(400, f"Unknown reaction: {body.reaction}")

    # Get current count
    item = db.get_service_client().table("feed_items") \
        .select(col).eq("id", body.item_id).execute()
    if not item.data:
        raise HTTPException(404, "Item not found")

    current_count = item.data[0].get(col, 0) or 0
    db.get_service_client().table("feed_items") \
        .update({col: current_count + 1}) \
        .eq("id", body.item_id).execute()

    # Track user interaction
    db.get_service_client().table("feed_interactions").upsert({
        "user_id":    current_user["id"],
        "item_id":    body.item_id,
        "reaction":   body.reaction,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    return ResponseModel(data={"reaction": body.reaction, "item_id": body.item_id})


# ─────────────────────────────────────────────────────────────
# Internal: ingest feed items (called by Celery)
# ─────────────────────────────────────────────────────────────

async def ingest_feed_for_track(track_id: str, items: list) -> int:
    """
    Upsert a list of feed items for a track.
    `items` must have: title, url, summary, source, published_at
    """
    saved = 0
    for item in items:
        url = item.get("url", "")
        if not url:
            continue
        db.get_service_client().table("feed_items").upsert({
            "id":            str(uuid.uuid5(uuid.NAMESPACE_URL, url)),
            "track_id":      track_id,
            "title":         item.get("title", ""),
            "summary":       item.get("summary", ""),
            "url":           url,
            "source":        item.get("source", ""),
            "image_url":     item.get("image_url"),
            "published_at":  item.get("published_at", datetime.utcnow().isoformat()),
            "is_published":  True,
            "like_count":    0,
            "bookmark_count": 0,
            "share_count":   0,
        }).execute()
        saved += 1

    log.info("Feed items ingested", track_id=track_id, count=saved)
    return saved
