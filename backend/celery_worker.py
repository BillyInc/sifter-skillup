# ============================================
# Sifter Skill_Up — Background Workers
# ============================================
from celery import Celery
from celery.schedules import crontab
from config import settings
from database import db
from datetime import datetime, date, timedelta
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
        "reset-daily-quests":    {"task": "celery_worker.reset_daily_quests",    "schedule": crontab(hour=0, minute=0)},
        "update-guild-ranks":    {"task": "celery_worker.update_guild_ranks",    "schedule": crontab(hour=1, minute=0)},
        "cleanup-notifications": {"task": "celery_worker.cleanup_notifications", "schedule": crontab(hour=2, minute=0, day_of_week="monday")},
        "process-withdrawals":   {"task": "celery_worker.process_withdrawals",   "schedule": crontab(hour="*/4", minute=0)},
    }
)

@celery.task
def reset_daily_quests():
    """Reset daily quests by removing old ones"""
    try:
        start_time = datetime.now()
        log.info("Daily quests reset task started")

        yesterday = (date.today() - timedelta(days=1)).isoformat()
        result = db.get_service_client().table("daily_quests").delete().lt("date", yesterday).execute()

        duration = (datetime.now() - start_time).total_seconds()
        log.info("Daily quests reset completed", duration=f"{duration:.2f}s", deleted_count=len(result.data or []))

        return {"status": "success", "deleted": len(result.data or []), "duration": duration}
    except Exception as e:
        log.error("Daily quests reset failed", error=e)
        raise

@celery.task
def update_guild_ranks():
    """Update guild ranks based on total points"""
    try:
        start_time = datetime.now()
        log.info("Guild ranks update task started")

        guilds = db.get_service_client().table("guilds").select("id").order("total_points", desc=True).execute()
        updated = 0
        for idx, guild in enumerate(guilds.data or [], start=1):
            db.get_service_client().table("guilds").update({"rank": idx}).eq("id", guild["id"]).execute()
            updated += 1

        duration = (datetime.now() - start_time).total_seconds()
        log.info("Guild ranks update completed", duration=f"{duration:.2f}s", guilds_updated=updated)

        return {"status": "success", "guilds_updated": updated, "duration": duration}
    except Exception as e:
        log.error("Guild ranks update failed", error=e)
        raise

@celery.task
def cleanup_notifications():
    """Clean up old notifications older than 30 days"""
    try:
        start_time = datetime.now()
        log.info("Notifications cleanup task started")

        cutoff = (datetime.now() - timedelta(days=30)).isoformat()
        result = db.get_service_client().table("notifications").delete().lt("created_at", cutoff).execute()

        duration = (datetime.now() - start_time).total_seconds()
        log.info("Notifications cleanup completed", duration=f"{duration:.2f}s", deleted_count=len(result.data or []))

        return {"status": "success", "deleted": len(result.data or []), "duration": duration}
    except Exception as e:
        log.error("Notifications cleanup failed", error=e)
        raise

@celery.task
def process_withdrawals():
    """Process pending withdrawal requests"""
    try:
        start_time = datetime.now()
        log.info("Withdrawal processing task started")

        pending = db.get_service_client().table("withdrawals").select("*").eq("status", "pending").execute()
        processed = 0

        for w in (pending.data or []):
            db.get_service_client().table("withdrawals").update({
                "status": "completed", "completed_at": datetime.now().isoformat()
            }).eq("id", w["id"]).execute()
            processed += 1
            log.info("Withdrawal processed", withdrawal_id=w["id"], user_id=w["user_id"], amount=w.get("points_used", 0))

        duration = (datetime.now() - start_time).total_seconds()
        log.info("Withdrawal processing completed", duration=f"{duration:.2f}s", processed=processed)

        return {"status": "success", "processed": processed, "duration": duration}
    except Exception as e:
        log.error("Withdrawal processing failed", error=e)
        raise
