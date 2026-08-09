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
        "fetch-labour-market-demand": {"task": "celery_worker.fetch_labour_market_demand", "schedule": crontab(hour="*/6", minute=30)},
        "compute-elite-composite": {"task": "celery_worker.compute_elite_composite", "schedule": crontab(hour=5, minute=0)},
        # Phase 8 — Annual admission snapshot version (placeholder)
        "compile-admission-snapshot": {"task": "celery_worker.compile_admission_snapshot", "schedule": crontab(month_of_year=1, day_of_month=15, hour=10, minute=0)},
        # Phase 9 — Enrichment freshness check (weekly)
        "check-enrichment-freshness": {"task": "celery_worker.check_enrichment_freshness", "schedule": crontab(day_of_week="monday", hour=6, minute=0)},
        # Provisioning Phase 6 — duplicate shell reconciliation candidates
        "reconcile-student-merge-candidates": {"task": "celery_worker.reconcile_student_merge_candidates", "schedule": crontab(hour="*/6", minute=10)},
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
def fetch_labour_market_demand():
    """Labour-market demand ingestion hook (Phase 7b pipeline).

    The actual RSS / salary / posting fetchers are data-fetching jobs and remain
    out of scope here (see [[market-intelligence-layer]] for the verified-source
    stack). This task is the deterministic SEAT the beat scheduler fills: when
    the ingestion module is present it is imported and invoked; otherwise we
    record an honest no-op so the schedule is never a silent dead letter.
    """
    try:
        from importlib import import_module
        try:
            ingest = import_module("demand_ingest")  # add when sources are wired
        except ModuleNotFoundError:
            log.info("fetch_labour_market_demand: no ingestion module yet (no-op).")
            return {"status": "success", "detail": "ingestion_module_absent"}
        fn = getattr(ingest, "run_demand_ingest", None)
        if not fn:
            return {"status": "success", "detail": "ingestion_entrypoint_absent"}
        result = fn()  # writes domain_demand_metrics / role_demand_metrics
        log.info("fetch_labour_market_demand: ingestion ran", result=result)
        return {"status": "success", "detail": "ingested", "result": result}
    except Exception as e:
        log.error("fetch_labour_market_demand failed", error=str(e))
        raise


def _barrier_score(row: dict) -> float:
    """Barrier dimension (0..1): high for senior + high-ISCO-skill roles.
    Inputs come from the taxonomy (ISCO skill_level if stored, else ISCO group
    prefix, else tier); never from a live fetch."""
    tier = (row.get("tier") or "").lower()
    isco = (row.get("isco_group") or "")
    first = isco[:1]
    skill_level = row.get("skill_level")  # optional stored ISCO skill_level
    if skill_level is not None:
        try:
            base = min(float(skill_level) / 4.0, 1.0)
        except (TypeError, ValueError):
            base = 0.5
    elif first.isdigit():
        # ISCO-08 major groups 1-3 (managers/professional/technician) skew higher.
        base = max(0.55, (1.0 - (int(first) - 1) * 0.12)) if first in {"1", "2", "3"} else 0.4
    else:
        base = 0.5
    if tier == "senior":
        base = min(1.0, base + 0.15)
    elif tier == "mid":
        base = min(1.0, base + 0.05)
    return round(base, 4)


def _compensation_score(svc, domain_id, role_name):
    """Compensation proxy (0..1) from whatever demand rows exist; 0 when none.
    Anchored on the highest populated salary across the three lenses (role rows
    first, domain rows as a fallback)."""
    try:
        res = svc.schema("skillup_dev").table("role_demand_metrics").select(
            "salary_min,salary_max,rank_lens"
        ).eq("role_name", role_name).order("month", desc=True).limit(15).execute()
        if not res.data:
            dres = svc.schema("skillup_dev").table("domain_demand_metrics").select(
                "entry_salary_local_ngn,entry_salary_remote_usd,rank_lens"
            ).eq("domain_id", domain_id).order("month", desc=True).limit(10).execute()
            res = dres
        best = 0.0
        for r in (res.data or []):
            s = r.get("salary_max") or r.get("salary_min")
            if s is None:
                continue
            # Normalise: NGN local ranked against a senior ceiling, remote USD
            # against a global tech ceiling. Either way, absence => 0.
            if r.get("rank_lens") == "ng_remote":
                best = max(best, min(float(s) / 200000.0, 1.0))
            else:
                best = max(best, min(float(s) / 4000000.0, 1.0))
        return round(best, 4)
    except Exception:
        return 0.0


def _scarcity_score(svc, domain_id, postings):
    """Scarcity (0..1): postings vs the count of qualifying programmes (proxy
    for qualified supply). Many postings fed by few programmes = scarce/elite.
    No postings => unknown (0.0)."""
    if not postings:
        return 0.0
    try:
        pd = svc.schema("skillup_dev").table("programme_domain").select(
            "programme_id", count="exact"
        ).eq("domain_id", domain_id).execute()
        feeder = pd.count if hasattr(pd, "count") and pd.count is not None else len(pd.data or [])
        docs = max(feeder, 1)
        return round(min(postings / (docs * 8.0), 1.0), 4)
    except Exception:
        return 0.0


def _prestige_score(svc, role_name, elite_status):
    """Prestige proxy (0..1): an authored 'verified' status OR an aggregate count
    of confirmed mapping_feedback rows (validated by experts). Never trusts a
    hand list."""
    if elite_status == "verified":
        return 0.8
    try:
        fb = svc.schema("skillup_dev").table("mapping_feedback").select(
            "id", count="exact"
        ).eq("edge_type", "domain_role").eq("target_id", role_name).eq(
            "feedback_type", "confirm"
        ).execute()
        confirms = fb.count if hasattr(fb, "count") and fb.count is not None else len(fb.data or [])
        return round(min(confirms / 5.0, 1.0) * 0.6, 4)
    except Exception:
        return 0.0


@celery.task
def compute_elite_composite():
    """Phase 7f — elite composite (barrier + compensation + scarcity + prestige).

    DATA-DERIVED, never hand-listed. The four dimensions are assembled from
    in-DB signals already present (taxonomy barrier via ISCO/tier; compensation
    + scarcity via the populated demand tables; prestige via expert confirms).
    When a dimension has no data it scores 0 and the composite simply stays
    below threshold — the role is not flagged elite.
    """
    W_BARRIER, W_COMP, W_SCARCITY, W_PRESTIGE = 0.35, 0.25, 0.25, 0.15
    THRESH = 0.62  # composite >= THRESH => elite
    try:
        svc = db.get_service_client()
        schema = svc.schema("skillup_dev")
        roles = schema.table("domain_roles").select(
            "role_key, role_name, domain_id, tier, isco_group, elite_status"
        ).execute()
        if not (roles.data or []):
            log.info("compute_elite_composite: no roles; nothing to score.")
            return {"status": "success", "scored": 0}

        # latest NG-local postings per domain for the scarcity numerator
        domain_postings: dict = {}
        try:
            dm = schema.table("domain_demand_metrics").select(
                "domain_id, postings_count"
            ).eq("rank_lens", "ng_local").order("month", desc=True).limit(500).execute()
            for r in (dm.data or []):
                did = r.get("domain_id")
                domain_postings[did] = max(domain_postings.get(did, 0), int(r.get("postings_count") or 0))
        except Exception as e:
            log.warning("compute_elite_composite: demand read skipped", error=str(e))

        scored = flagged = 0
        for r in roles.data:
            role_name = r["role_name"]
            domain_id = r.get("domain_id")
            b = _barrier_score(r)
            c = _compensation_score(svc, domain_id, role_name)
            s = _scarcity_score(svc, domain_id, domain_postings.get(domain_id, 0))
            p = _prestige_score(svc, role_name, r.get("elite_status"))
            composite = round(b * W_BARRIER + c * W_COMP + s * W_SCARCITY + p * W_PRESTIGE, 4)
            elite = composite >= THRESH
            schema.table("domain_roles").update({
                "elite_flag": elite,
                "elite_status": "verified" if elite else (r.get("elite_status") or "deferred")
            }).eq("role_key", r["role_key"]).execute()
            scored += 1
            flagged += int(elite)

        # Domain elite flag = the domain has >=1 elite-coded role AND those
        # elites are at least a quarter of its roles (structural, not one misfit).
        try:
            domains = schema.table("domains").select("id").execute()
            for d in (domains.data or []):
                did = d["id"]
                dom_roles = schema.table("domain_roles").select("elite_flag").eq("domain_id", did).execute()
                rows = dom_roles.data or []
                any_elite = any(r.get("elite_flag") for r in rows)
                ratio = sum(1 for r in rows if r.get("elite_flag")) / max(len(rows), 1)
                schema.table("domains").update({
                    "elite_domain": bool(any_elite and ratio >= 0.25)
                }).eq("id", did).execute()
        except Exception as e:
            log.warning("compute_elite_composite: domain flag pass skipped", error=str(e))

        log.info("compute_elite_composite complete", scored=scored, elite_roles=flagged)
        return {"status": "success", "scored": scored, "elite_roles": flagged}
    except Exception as e:
        log.error("compute_elite_composite failed", error=str(e))
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


@celery.task
def reconcile_student_merge_candidates():
    """Create admin-confirmable duplicate-account candidates for provisioned students."""
    try:
        from services.provisioning_reconcile import reconcile_all_schools

        result = reconcile_all_schools()
        log.info("Student merge candidate reconciliation complete", **result)
        return {"status": "success", **result}
    except Exception as e:
        log.error("Student merge candidate reconciliation failed", error=str(e))
        raise


# ── Phase 8: Admission Intelligence ───────────────────────────

@celery.task
def compile_admission_snapshot():
    """
    Annual no-op task that creates the AdmissionSnapshotVersion row.
    Actual data import is a MANUAL admin process (CSV/SQL upload) because
    sources are heterogeneous (PDFs, school portals, news) and not API-accessible.
    This task just ensures the version row exists and logs a reminder.
    """
    from datetime import date
    year = date.today().year
    label = f"{year}/{year+1} Cycle — compiled Jan {year}"
    svc = db.get_service_client().schema("skillup_dev")
    
    # Deactivate previous
    svc.table("admission_snapshot_version").update({"is_active": False}).eq("is_active", True).execute()
    
    # Insert new
    res = svc.table("admission_snapshot_version").insert({
        "label": label,
        "year": year,
        "compiler": "scheduled_task_placeholder",
        "notes": "Awaiting manual data import. Run: psql -f admission_import_<year>.sql",
        "is_active": True
    }).execute()
    
    log.info("Admission snapshot version created", year=year, id=res.data[0]["id"] if res.data else None)
    return {"status": "success", "year": year, "snapshot_id": res.data[0]["id"] if res.data else None}


# ── Phase 9: Enrichment & Refresh ─────────────────────────────

@celery.task
def check_enrichment_freshness():
    """
    Weekly no-op that logs the age of each enrichment seed.
    Alerts (logs WARNING) if any seed hasn't been refreshed within its SLA:
      - tools_demand: 30 days (monthly demand cycle)
      - certs_prices: 90 days (quarterly)
      - skills_uris: 180 days (ESCO updates)
      - roles_currency: 180 days (WEF/O*NET/Lightcast cycles)
      - admission: 365 days (annual cycle)
    """
    from datetime import datetime, timedelta, timezone
    SLA_DAYS = {
        "tools": 30,
        "certs": 90,
        "skills": 180,
        "admission": 365,
    }
    
    svc = db.get_service_client().schema("skillup_dev")
    for seed, sla in SLA_DAYS.items():
        res = svc.table("enrichment_version").select("applied_at") \
            .eq("seed_name", seed) \
            .order("applied_at", desc=True) \
            .limit(1).execute()
        if not res.data:
            log.warning("enrichment_freshness: never_run", seed=seed)
            continue
        last = datetime.fromisoformat(res.data[0]["applied_at"].replace("Z", "+00:00"))
        age = (datetime.now(timezone.utc) - last).days
        if age > sla:
            log.warning("enrichment_freshness: STALE", seed=seed, age_days=age, sla_days=sla)
        else:
            log.info("enrichment_freshness: ok", seed=seed, age_days=age)
    
    return {"status": "success"}
