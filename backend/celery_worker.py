# ============================================
# Sifter LevelUp — Background Workers
# Extended: Airtable sync, feed ingestion,
#           session cleanup, streak resets
# ============================================
import asyncio
from celery import Celery
from celery.schedules import crontab
from config import settings
from database import db
from datetime import datetime, date, timedelta, timezone
from logger import log

celery = Celery(
    "sifter_skillup",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery.conf.update(
    task_serializer="json", accept_content=["json"],
    result_serializer="json", timezone="UTC", enable_utc=True,
    beat_schedule={
        # Existing
        "reset-daily-quests":    {"task": "celery_worker.reset_daily_quests",    "schedule": crontab(hour=0, minute=0)},
        "update-guild-ranks":    {"task": "celery_worker.update_guild_ranks",    "schedule": crontab(hour=1, minute=0)},
        "cleanup-notifications": {"task": "celery_worker.cleanup_notifications", "schedule": crontab(hour=2, minute=0, day_of_week="monday")},
        "process-withdrawals":   {"task": "celery_worker.process_withdrawals",   "schedule": crontab(hour="*/4", minute=0)},
        # New
        "sync-airtable":         {"task": "celery_worker.sync_airtable",         "schedule": crontab(minute=f"*/{settings.AIRTABLE_SYNC_INTERVAL_MINUTES}")},
        "cleanup-expired-sessions": {"task": "celery_worker.cleanup_expired_sessions", "schedule": crontab(hour=3, minute=30)},
        "ingest-track-feeds":    {"task": "celery_worker.ingest_track_feeds",    "schedule": crontab(hour="*/2", minute=15)},
        "expire-old-sync-log":   {"task": "celery_worker.expire_old_sync_log",   "schedule": crontab(hour=4, minute=0, day_of_week="sunday")},
    }
)


# ─────────────────────────────────────────────────────────────
# Existing tasks (unchanged)
# ─────────────────────────────────────────────────────────────

@celery.task
def reset_daily_quests():
    try:
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        result = db.get_service_client().table("daily_quests").delete().lt("date", yesterday).execute()
        log.info("Daily quests reset", deleted=len(result.data or []))
        return {"status": "success", "deleted": len(result.data or [])}
    except Exception as e:
        log.error("Daily quests reset failed", error=e)
        raise


@celery.task
def update_guild_ranks():
    try:
        guilds = db.get_service_client().table("guilds").select("id").order("total_points", desc=True).execute()
        for idx, guild in enumerate(guilds.data or [], start=1):
            db.get_service_client().table("guilds").update({"rank": idx}).eq("id", guild["id"]).execute()
        log.info("Guild ranks updated", count=len(guilds.data or []))
        return {"status": "success", "updated": len(guilds.data or [])}
    except Exception as e:
        log.error("Guild ranks update failed", error=e)
        raise


@celery.task
def cleanup_notifications():
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        result = db.get_service_client().table("notifications").delete().lt("created_at", cutoff).execute()
        log.info("Old notifications cleaned", deleted=len(result.data or []))
        return {"status": "success", "deleted": len(result.data or [])}
    except Exception as e:
        log.error("Notification cleanup failed", error=e)
        raise


@celery.task
def process_withdrawals():
    try:
        pending = db.get_service_client().table("withdrawals").select("*").eq("status", "pending").execute()
        processed = 0
        for w in (pending.data or []):
            db.get_service_client().table("withdrawals").update({
                "status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", w["id"]).execute()
            processed += 1
        log.info("Withdrawals processed", count=processed)
        return {"status": "success", "processed": processed}
    except Exception as e:
        log.error("Withdrawal processing failed", error=e)
        raise


# ─────────────────────────────────────────────────────────────
# New tasks
# ─────────────────────────────────────────────────────────────

@celery.task
def sync_airtable():
    """Pull content metadata from Airtable into Supabase content_cache."""
    try:
        from airtable_sync import run_airtable_sync
        # Run the async function in a fresh event loop
        results = asyncio.run(run_airtable_sync())
        total = sum(r.records_synced for r in results)
        errors = [r.table for r in results if r.error]
        log.info("Airtable sync complete", total_records=total, errors=errors)
        return {"status": "success", "records_synced": total, "errors": errors}
    except Exception as e:
        log.error("Airtable sync task failed", error=str(e))
        raise


@celery.task
def cleanup_expired_sessions():
    """
    Remove device sessions that haven't been seen in DEVICE_SESSION_TTL_MINUTES.
    Keeps the active_sessions table lean.
    """
    try:
        cutoff = (
            datetime.now(timezone.utc) - timedelta(minutes=settings.DEVICE_SESSION_TTL_MINUTES)
        ).isoformat()
        result = db.get_service_client() \
            .table("active_sessions") \
            .delete() \
            .lt("last_seen", cutoff) \
            .execute()
        deleted = len(result.data or [])
        log.info("Expired device sessions cleaned", deleted=deleted)
        return {"status": "success", "deleted": deleted}
    except Exception as e:
        log.error("Session cleanup failed", error=str(e))
        raise


@celery.task
def ingest_track_feeds():
    """
    Fetch RSS/API sources for each active track and upsert into feed_items.
    Uses a very lightweight RSS fetch — full config in trackFeedConfig.ts.
    """
    import feedparser

    TRACK_RSS = {
        "crypto":        ["https://decrypt.co/feed", "https://thedefiant.io/feed"],
        "starknet-defi-navigator": ["https://starknet.io/rss.xml"],
        "defi-research-analyst":   ["https://defillama.com/feed"],
        "supply-chain":  ["https://supplychaindigital.com/rss"],
    }

    total = 0
    for track_id, rss_urls in TRACK_RSS.items():
        items = []
        for url in rss_urls:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:10]:
                    items.append({
                        "title":        entry.get("title", ""),
                        "url":          entry.get("link", ""),
                        "summary":      entry.get("summary", "")[:500],
                        "source":       feed.feed.get("title", url),
                        "published_at": entry.get("published", datetime.now(timezone.utc).isoformat()),
                    })
            except Exception as e:
                log.warning("RSS fetch failed", url=url, error=str(e))

        if items:
            from feed_routes import ingest_feed_for_track
            saved = asyncio.run(ingest_feed_for_track(track_id, items))
            total += saved

    log.info("Feed ingestion complete", total_items=total)
    return {"status": "success", "items_ingested": total}


@celery.task
def expire_old_sync_log():
    """
    Purge sync_log entries older than 30 days.
    The sync_log is used for idempotency — entries beyond 30 days
    are beyond the MAX_ITEM_AGE_HOURS window so can be safely removed.
    """
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        result = db.get_service_client() \
            .table("sync_log") \
            .delete() \
            .lt("applied_at", cutoff) \
            .execute()
        deleted = len(result.data or [])
        log.info("Old sync log entries purged", deleted=deleted)
        return {"status": "success", "deleted": deleted}
    except Exception as e:
        log.error("Sync log cleanup failed", error=str(e))
        raise
