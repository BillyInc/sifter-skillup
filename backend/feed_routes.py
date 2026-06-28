# ============================================
# Sifter LevelUp — Track Feed Routes
# Per-track curated content feed
# News, research, protocol updates, job posts
# relevant to the track the user is on.
# ============================================
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import Auth
from config import settings
from database import db
from logger import log
from models import FeedItemReact, FeedItemSubscribe, ResponseModel
from twitter_service import TwitterService

router = APIRouter(prefix="/api/feed", tags=["feed"])

# Pagination defaults / caps
_DEFAULT_LIMIT = 20
_MAX_LIMIT = 100

# Reactions that map to atomic counter columns on `feed_items`.
_REACTION_COLUMNS = {
    "like":     "like_count",
    "bookmark": "bookmark_count",
    "share":    "share_count",
}


# ─────────────────────────────────────────────────────────────
# Subscribe / unsubscribe
# ─────────────────────────────────────────────────────────────

@router.post("/subscribe", response_model=ResponseModel)
async def subscribe_to_feed(
    body: FeedItemSubscribe,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Set which tracks the user wants in their feed."""
    db.get_service_client().table("track_subscriptions").upsert({
        "user_id":     current_user["id"],
        "track_ids":   body.tracks,
        "field_ids":   [],
        "updated_at":  datetime.now(timezone.utc).isoformat(),
    }).execute()
    return ResponseModel(data={"subscribed": True, "tracks": body.tracks})


@router.get("/subscriptions", response_model=ResponseModel)
async def get_subscriptions(current_user: dict = Depends(Auth.get_current_user)):
    result = db.get_service_client().table("track_subscriptions") \
        .select("*").eq("user_id", current_user["id"]).execute()
    return ResponseModel(data=result.data[0] if result.data else {"track_ids": [], "field_ids": []})


# ─────────────────────────────────────────────────────────────
# Feed items
# ─────────────────────────────────────────────────────────────

@router.get("", response_model=ResponseModel)
async def get_feed(
    track_id: Optional[str] = None,
    limit: int = _DEFAULT_LIMIT,
    offset: int = 0,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Return personalised feed for the current user.
    Filters by track_id if provided, otherwise uses subscriptions.
    Combines database feed items with Twitter feed if available.
    """
    # Clamp pagination
    limit = max(1, min(limit, _MAX_LIMIT))
    offset = max(0, offset)

    user_id = current_user["id"]

    if not track_id:
        subs = db.get_service_client().table("track_subscriptions") \
            .select("track_ids").eq("user_id", user_id).execute()
        track_ids = subs.data[0]["track_ids"] if subs.data else [current_user.get("active_track", "crypto")]
    else:
        track_ids = [track_id]

    # Fetch database feed items
    result = db.get_service_client().table("feed_items") \
        .select("*") \
        .in_("track_id", track_ids) \
        .eq("is_published", True) \
        .execute()

    feed_items = result.data if result.data else []

    # Fetch Twitter feed items if track_id is provided and Twitter API is configured
    if track_id and settings.TWITTER_API_BEARER_TOKEN:
        try:
            twitter_items = await TwitterService.fetch_feed_for_track(track_id)
            feed_items.extend(twitter_items)
        except Exception as e:
            log.error(f"Failed to fetch Twitter feed for {track_id}: {e}")
            # Gracefully degrade — return database items only

    # Sort by published_at or created_at descending (most recent first)
    feed_items = sorted(
        feed_items,
        key=lambda x: x.get("published_at") or x.get("created_at", ""),
        reverse=True
    )

    # Apply pagination after combining all sources
    paginated_items = feed_items[offset : offset + limit]

    return ResponseModel(data=paginated_items)


@router.get("/{item_id}", response_model=ResponseModel)
async def get_feed_item(
    item_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    result = db.get_service_client().table("feed_items") \
        .select("*") \
        .eq("id", item_id) \
        .eq("is_published", True) \
        .execute()
    if not result.data:
        raise HTTPException(404, "Feed item not found")
    return ResponseModel(data=result.data[0])


@router.post("/react", response_model=ResponseModel)
async def react_to_feed_item(
    body: FeedItemReact,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Like, bookmark, or share a feed item — atomic counter increment.

    De-dupes via the UNIQUE(user_id, item_id, reaction) constraint on
    `feed_interactions`: if the row already exists we treat it as a no-op
    so users can't double-count by spamming the endpoint.
    """
    col = _REACTION_COLUMNS.get(body.reaction)
    if not col:
        raise HTTPException(400, f"Unknown reaction: {body.reaction}")

    # Try to record the interaction first. If the user has already reacted
    # with this reaction, the unique constraint blocks the insert and we skip
    # the counter bump entirely.
    existing = db.get_service_client().table("feed_interactions") \
        .select("id") \
        .eq("user_id", current_user["id"]) \
        .eq("item_id", body.item_id) \
        .eq("reaction", body.reaction) \
        .execute()

    if existing.data:
        return ResponseModel(data={
            "reaction": body.reaction,
            "item_id":  body.item_id,
            "deduped":  True,
        })

    db.get_service_client().table("feed_interactions").insert({
        "user_id":    current_user["id"],
        "item_id":    body.item_id,
        "reaction":   body.reaction,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Atomic counter bump via RPC — no read-modify-write race
    db.get_service_client().rpc(
        "increment_feed_counter",
        {"p_item_id": body.item_id, "p_column": col},
    ).execute()

    return ResponseModel(data={"reaction": body.reaction, "item_id": body.item_id})


@router.post("/unreact", response_model=ResponseModel)
async def unreact_to_feed_item(
    body: FeedItemReact,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove a like/bookmark — atomic counter decrement (floored at 0)."""
    col = _REACTION_COLUMNS.get(body.reaction)
    if not col:
        raise HTTPException(400, f"Unknown reaction: {body.reaction}")
    if body.reaction == "share":
        raise HTTPException(400, "Shares cannot be retracted")

    deleted = db.get_service_client().table("feed_interactions") \
        .delete() \
        .eq("user_id", current_user["id"]) \
        .eq("item_id", body.item_id) \
        .eq("reaction", body.reaction) \
        .execute()

    if not deleted.data:
        return ResponseModel(data={"removed": False, "noop": True})

    db.get_service_client().rpc(
        "decrement_feed_counter",
        {"p_item_id": body.item_id, "p_column": col},
    ).execute()

    return ResponseModel(data={"removed": True, "reaction": body.reaction})


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
            "published_at":  item.get("published_at", datetime.now(timezone.utc).isoformat()),
            "is_published":  True,
            "like_count":    0,
            "bookmark_count": 0,
            "share_count":   0,
        }).execute()
        saved += 1

    log.info("Feed items ingested", track_id=track_id, count=saved)
    return saved
