# ============================================
# Sifter Skill_Up — Background Workers
# ============================================
from celery import Celery
from celery.schedules import crontab
from config import settings
from database import db
from datetime import datetime, date, timedelta

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
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    db.get_service_client().table("daily_quests").delete().lt("date", yesterday).execute()
    return {"status": "success"}

@celery.task
def update_guild_ranks():
    guilds = db.get_service_client().table("guilds").select("id").order("total_points", desc=True).execute()
    for idx, guild in enumerate(guilds.data or [], start=1):
        db.get_service_client().table("guilds").update({"rank": idx}).eq("id", guild["id"]).execute()
    return {"status": "success"}

@celery.task
def cleanup_notifications():
    cutoff = (datetime.now() - timedelta(days=30)).isoformat()
    db.get_service_client().table("notifications").delete().lt("created_at", cutoff).execute()
    return {"status": "success"}

@celery.task
def process_withdrawals():
    pending = db.get_service_client().table("withdrawals").select("*").eq("status", "pending").execute()
    for w in (pending.data or []):
        db.get_service_client().table("withdrawals").update({
            "status": "completed", "completed_at": datetime.now().isoformat()
        }).eq("id", w["id"]).execute()
    return {"status": "success", "processed": len(pending.data or [])}
