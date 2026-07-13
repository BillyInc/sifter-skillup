# Phase 8 & 9 Implementation Plan
## Admission Intelligence (Phase 8) + Enrichment & Refresh Cycle (Phase 9)

**Goal:** Build the *infrastructure, database schema, API contracts, background jobs, and frontend types* for admission intelligence (annual Dec/Jan cycle) and the ongoing enrichment/refresh cycle. Data fetching/ingestion itself is handled separately (Phase 7 pipeline + manual annual compilation).

**Constraint:** Must NOT break or conflict with Phase 6 (UI upgrades, non-student entry, auditor review) or Phase 7 (demand metrics, elite composite, monthly cron).

## Scope (per user directive)

**Only: SS → University (UTME / Direct Entry)**

| Track | Included? |
|-------|-----------|
| University (UTME/DE) | ✅ Yes |
| NCE / College of Education | ❌ No |
| Polytechnic / NBTE | ❌ No |
| College of Health / Nursing | ❌ No |
| Monotechnic / Technical College | ❌ No |

> The schema uses `institution_type` on `schools` and `programmes` — Phase 8 seeds **only `university` rows**. Other types stay empty until a later phase.

---

## 1. Phase 8 — Admission Intelligence (Annual Dec/Jan Snapshot)

### 1.1 Database Schema (Additive Migration)

**File:** `backend/migration_admission_intelligence.sql` (runs AFTER `migration_career_v2.sql`)

```sql
-- ============================================================
-- SIFTER LEVELUP — ADMISSION INTELLIGENCE (Phase 8)
-- Schema: skillup_dev
-- Annual Dec/Jan snapshot. Lagging proxy — always label the year.
-- ============================================================

-- 1. National JAMB floor (singleton, one row per year)
CREATE TABLE IF NOT EXISTS skillup_dev.national_jamb_floor (
    year            SMALLINT PRIMARY KEY,          -- 2024, 2025, …
    floor_score     SMALLINT NOT NULL,             -- e.g., 150
    context_note    TEXT,                          -- "university floor; polytechnics may differ"
    source_url      TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Per-school × programme cut-offs (the heavy table, ~50-150 schools × ~10-50 programmes)
CREATE TABLE IF NOT EXISTS skillup_dev.programme_school_cutoff (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id           UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    programme_id        UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    year                SMALLINT NOT NULL,         -- 2025 = 2025/26 admission cycle
    aggregate_cutoff    SMALLINT,                  -- school's published aggregate (JAMB% + PostUTME% + O'level%)
    jamb_cutoff         SMALLINT,                  -- minimum JAMB score the school states
    postutme_cutoff     SMALLINT,                  -- minimum Post-UTME score if separate
    form                TEXT CHECK (form IN ('UTME','DE')), -- or both
    source_url          TEXT NOT NULL,             -- provenance (school portal, JAMB brochure, news)
    verified_at         TIMESTAMPTZ,               -- when a human/admin last verified
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, programme_id, year, form)
);
CREATE INDEX IF NOT EXISTS idx_psc_school_year ON skillup_dev.programme_school_cutoff(school_id, year);
CREATE INDEX IF NOT EXISTS idx_psc_programme_year ON skillup_dev.programme_school_cutoff(programme_id, year);
CREATE INDEX IF NOT EXISTS idx_psc_year ON skillup_dev.programme_school_cutoff(year);

-- 3. School aggregate formula (how each school combines JAMB + Post-UTME + O'level)
CREATE TABLE IF NOT EXISTS skillup_dev.school_aggregate_formula (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    year            SMALLINT NOT NULL,
    jamb_weight     NUMERIC(4,2) NOT NULL,         -- e.g., 0.50 (50%)
    postutme_weight NUMERIC(4,2) NOT NULL,         -- e.g., 0.30 (30%)
    olevel_weight   NUMERIC(4,2) NOT NULL,         -- e.g., 0.20 (20%)
    description     TEXT,                          -- human-readable formula notes
    source_url      TEXT,
    UNIQUE(school_id, year)
);
CREATE INDEX IF NOT EXISTS idx_saf_school_year ON skillup_dev.school_aggregate_formula(school_id, year);

-- 4. National broad-course competitiveness (faculty-level, not programme-level)
CREATE TABLE IF NOT EXISTS skillup_dev.course_competitiveness (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broad_course    TEXT NOT NULL,                 -- "Medicine", "Law", "Engineering", "Nursing", ...
    year            SMALLINT NOT NULL,
    applied         BIGINT,                        -- national applications (JAMB CAPS)
    admitted        BIGINT,                        -- national admissions
    ratio           NUMERIC(6,4),                  -- admitted/applied
    source          TEXT,                          -- "JAMB_annual_report_2023"
    note            TEXT,                          -- "approximate, faculty-level only"
    UNIQUE(broad_course, year)
);
CREATE INDEX IF NOT EXISTS idx_cc_year ON skillup_dev.course_competitiveness(year);

-- 5. Admission insight versioning (what snapshot the user is seeing)
CREATE TABLE IF NOT EXISTS skillup_dev.admission_snapshot_version (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label           TEXT NOT NULL,                 -- "2025/26 Cycle — compiled Jan 2025"
    year            SMALLINT NOT NULL,             -- 2025
    compiled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    compiler        TEXT,                          -- admin user id or "manual_import"
    notes           TEXT,                          -- coverage % etc.
    is_active       BOOLEAN NOT NULL DEFAULT false
);
-- Only one active at a time (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_snapshot ON skillup_dev.admission_snapshot_version(is_active) WHERE is_active = true;
```

**Key Design Decisions:**
- **Additive only** — no changes to existing `schools`, `programmes`, `domains`, `jamb_programme_domain`.
- **Year-grain** — every row carries `year` (SMALLINT). The active snapshot is determined by `admission_snapshot_version.is_active`.
- **Provenance required** — `source_url` on every row; `verified_at` for admin audit.
- **Lagging proxy** — always labelled with the year (e.g., "2025 indicative"). No promise of current-cycle accuracy.
- **Scope-limited** — programme-level cut-offs only where publicly available; broad-course competitiveness only at national/faculty level (no per-school per-programme applied-vs-admitted).

---

### 1.2 API Endpoints (Read-Only, Public)

**File:** `backend/routes/admission_routes.py` (new file, registered in `main.py`)

```python
# GET /api/admission/floor              → { year, floor_score, context_note, source_url, data_date }
# GET /api/admission/cutoffs            → ?school_id&programme_id&year → ProgrammeSchoolCutoff[]
# GET /api/admission/formula            → ?school_id&year → SchoolAggregateFormula
# GET /api/admission/competitiveness    → ?year&broad_course → CourseCompetitiveness[]
# GET /api/admission/snapshot           → AdmissionSnapshotVersion (active)
# GET /api/admission/snapshot/history   → AdmissionSnapshotVersion[] (all)
```

**Response envelope:** Uses `DataState<T>` from `career.ts` (`real` | `coming_soon` | `fallback`).
- `fallback` when the requested year's snapshot isn't compiled yet (shows previous year with disclaimer).
- `coming_soon` if no snapshot exists at all.

**Data-Source Disclaimer:** Every response includes `meta.sources[]` and `meta.dataDate` so the UI can render "Last compiled Jan 2025 — indicative only".

---

### 1.3 Frontend Types (Extend `src/types/career.ts`)

```typescript
// ── Admission Intelligence ──────────────────────────────────

export interface NationalJambFloor {
  year: number;
  floorScore: number;
  contextNote?: string;
  sourceUrl?: string;
  dataDate: string;
}

export interface ProgrammeSchoolCutoff {
  id: string;
  schoolId: string;
  schoolName: string;
  programmeId: string;
  programmeName: string;
  year: number;
  aggregateCutoff?: number;
  jambCutoff?: number;
  postUtmeCutoff?: number;
  form: "UTME" | "DE";
  sourceUrl: string;
  verifiedAt?: string;
  dataDate: string;
}

export interface SchoolAggregateFormula {
  id: string;
  schoolId: string;
  schoolName: string;
  year: number;
  jambWeight: number;       // 0.50 = 50%
  postUtmeWeight: number;
  olevelWeight: number;
  description?: string;
  sourceUrl?: string;
  dataDate: string;
}

export interface CourseCompetitiveness {
  id: string;
  broadCourse: string;
  year: number;
  applied?: number;
  admitted?: number;
  ratio?: number;           // admitted/applied
  source?: string;
  note?: string;
  dataDate: string;
}

export interface AdmissionSnapshotVersion {
  id: string;
  label: string;            // "2025/26 Cycle — compiled Jan 2025"
  year: number;
  compiledAt: string;
  compiler?: string;
  notes?: string;
  isActive: boolean;
}

// Filters
export interface CutoffFilter {
  schoolId?: string;
  programmeId?: string;
  year?: number;
  form?: "UTME" | "DE";
}

// Integration point: ProgrammeDetail already has domains.
// Admission data attaches at the programme level, so the student flow is:
// JAMB name → domains (Phase 2b) → programmes (existing) → cutoffs/formula (Phase 8)
```

---

### 1.4 Celery Beat Task (Annual Compilation Helper)

**File:** `backend/celery_worker.py` — add to `beat_schedule`:

```python
"compile-admission-snapshot": {
    "task": "celery_worker.compile_admission_snapshot",
    "schedule": crontab(month=1, day=15, hour=10, minute=0),  # Mid-January annually
},
```

**Task implementation** (deterministic, no external fetch — only creates the version row + logs):
```python
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
```

**Why no auto-fetch?** Verified in Phase 7 research: no free API publishes NG school×programme cut-offs. The annual import is a **human-compiled CSV/SQL** (50–150 schools × 10–50 programmes). The celery task only creates the version skeleton; admins run the actual import SQL.

---

### 1.5 Admin Import Tooling (CLI, Not API)

**File:** `backend/scripts/import_admission_<year>.py` (one per year, idempotent)

```python
#!/usr/bin/env python3
"""
Usage: python import_admission_2025.py admission_2025.csv
CSV columns: school_name, programme_name, year, aggregate_cutoff, jamb_cutoff, postutme_cutoff, form, source_url
"""
import csv, sys, uuid
from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

def resolve_school(name: str) -> str:
    # fuzzy match on schools table; create if missing (admin will verify)
    ...

def resolve_programme(name: str) -> str:
    # exact match on programmes.name; log if missing
    ...

def main(csv_path: str):
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            school_id = resolve_school(row["school_name"])
            programme_id = resolve_programme(row["programme_name"])
            if not school_id or not programme_id:
                print(f"SKIP unresolved: {row}")
                continue
            svc.table("programme_school_cutoff").upsert({
                "school_id": school_id,
                "programme_id": programme_id,
                "year": int(row["year"]),
                "aggregate_cutoff": int(row["aggregate_cutoff"]) if row["aggregate_cutoff"] else None,
                "jamb_cutoff": int(row["jamb_cutoff"]) if row["jamb_cutoff"] else None,
                "postutme_cutoff": int(row["postutme_cutoff"]) if row["postutme_cutoff"] else None,
                "form": row["form"],
                "source_url": row["source_url"],
            }, on_conflict="school_id,programme_id,year,form").execute()
    print("Import complete.")
```

**Same pattern for:** `school_aggregate_formula`, `course_competitiveness`, `national_jamb_floor`.

---

### 1.6 Integration with Existing Flow (Phase 6 Compatibility)

- **No changes to** `ProgrammeOverviewScreen`, `DomainDetailScreen`, `RoleCard`, `DomainChip`, `SkillsBridge`.
- **New screen:** `AdmissionInsightScreen` (reachable from `ProgrammeOverviewScreen` via "Admission" tab/section).
- **JAMB-name entry point:** `GET /api/career/jamb/{jamb_name}/domains` (already exists in Phase 6) → returns domains with `demandInsight`. Add a new field `admissionInsight` to `JambDomainLink`:
  ```typescript
  interface JambDomainLink {
    // ...existing
    admissionInsight?: {
      hasCutoffData: boolean;
      year: number;
      label: string;        // "2025 indicative — 240 aggregate typical"
    };
  }
  ```
- **SS3/JAMB-candidate gateway (Phase 6.4b):** Shows cut-off + formula prominently. **SS1/SS2 explorer gateway:** Shows admission data with lighter weight (smaller badge, "exploratory" label).

---

## 2. Phase 9 — Enrichment & Refresh Cycle (Ongoing)

### 2.1 Database Schema Additions (Additive Migration)

**File:** `backend/migration_enrichment_v1.sql` (runs AFTER `migration_career_v2.sql`)

```sql
-- ============================================================
-- SIFTER LEVELUP — ENRICHMENT & REFRESH FIELDS (Phase 9)
-- Schema: skillup_dev
-- All columns are ADDITIVE, NULLABLE, with defaults.
-- ============================================================

-- ── 1. CERTIFICATIONS: enrichment fields (Phase 4b) ─────────────────
ALTER TABLE skillup_dev.domain_certifications
    ADD COLUMN IF NOT EXISTS official_url       TEXT,
    ADD COLUMN IF NOT EXISTS seniority_tier     SMALLINT,        -- 1=entry, 2=mid, 3=senior (scoped to cert family)
    ADD COLUMN IF NOT EXISTS tier_type          TEXT CHECK (tier_type IN ('ladder','stages')),
    ADD COLUMN IF NOT EXISTS price              NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS currency           TEXT CHECK (currency IN ('USD','NGN','GBP','EUR')),
    ADD COLUMN IF NOT EXISTS price_as_of        DATE,
    ADD COLUMN IF NOT EXISTS price_source       TEXT;

-- ── 2. SKILLS: stable ESCO URI (Phase 4b) ───────────────────────────
-- Domains already have foundation_skills JSONB (skill + prevalence).
-- Add a companion JSONB for URIs (parallel array or keyed by skill).
ALTER TABLE skillup_dev.domains
    ADD COLUMN IF NOT EXISTS foundation_skill_uris JSONB NOT NULL DEFAULT '{}'; -- {"skill name": "https://data.europa.eu/esco/skill/..."}

-- Subgroup cluster_skills → add URIs
ALTER TABLE skillup_dev.domain_subgroups
    ADD COLUMN IF NOT EXISTS cluster_skill_uris JSONB NOT NULL DEFAULT '{}';

-- Role essential/optional skills already JSONB arrays of strings.
-- Add parallel URI columns (arrays of same length, nullable per element).
ALTER TABLE skillup_dev.domain_roles
    ADD COLUMN IF NOT EXISTS essential_skill_uris JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS optional_skill_uris  JSONB NOT NULL DEFAULT '[]';

-- ── 3. TOOLS: demand re-rank fields (Phase 7c) ──────────────────────
ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS demand_score       NUMERIC(6,4),      -- 0..1 from posting frequency (Adzuna/StackOverflow/GHIG)
    ADD COLUMN IF NOT EXISTS demand_source      TEXT,              -- 'adzuna' | 'stackoverflow' | 'github_innovation' | 'onet_hot'
    ADD COLUMN IF NOT EXISTS demand_as_of       DATE,
    ADD COLUMN IF NOT EXISTS tool_url           TEXT;              -- canonical docs/download URL

-- ── 4. ROLES: currency verification (Phase 9 L4) ────────────────────
ALTER TABLE skillup_dev.domain_roles
    ADD COLUMN IF NOT EXISTS currency_status    TEXT NOT NULL DEFAULT 'current' CHECK (currency_status IN ('current','legacy','emerging')),
    ADD COLUMN IF NOT EXISTS currency_verified_at DATE,
    ADD COLUMN IF NOT EXISTS currency_source    TEXT;              -- 'wef_foj_2025' | 'onet_emerging' | 'lightcast' | 'curated'

-- ── 5. ENRICHMENT VERSION (already in migration_career_v2.sql §13d) ─
-- skillup_dev.enrichment_version tracks every seed run:
--   source_commit_hash, seed_name (tools|certs|skills|admission), rows_upserted, applied_at
-- No new columns needed — already present.

-- ── 6. INDEXES for new query patterns ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_domain_certs_price ON skillup_dev.domain_certifications(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_domain_tools_demand ON skillup_dev.domain_tools(demand_score DESC) WHERE demand_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_domain_roles_currency ON skillup_dev.domain_roles(currency_status);
```

---

### 2.2 Seed / Enrichment Scripts (Idempotent, Re-runnable)

**Pattern:** Each enrichment domain has a standalone script in `data/career-mapping/_enrichment/` that:
1. Reads source data (local JSON/CSV, no live API calls)
2. Computes enrichments
3. Upserts into Supabase via service client (idempotent on PK/UK)
4. Writes a row to `enrichment_version`

**Structure:**
```
data/career-mapping/_enrichment/
├── certs_enrich.py          # official_url, tier, price, currency
├── skills_uris.py           # ESCO skill URIs for foundation/cluster/role skills
├── tools_demand_rerank.py   # demand_score from Adzuna/StackOverflow/GHIG (pre-fetched CSVs)
├── roles_currency.py        # currency_status from WEF/O*NET/Lightcast
└── run_all.py               # orchestrates in order, logs to enrichment_version
```

**Example — `certs_enrich.py`:**
```python
#!/usr/bin/env python3
"""
Enrich domain_certifications with:
  official_url, seniority_tier, tier_type, price, currency, price_as_of, price_source

Source: curated CSV (data/career-mapping/_enrichment/certs_enrichment_2025.csv)
Columns: domain_key, cert_name, cert_body, official_url, seniority_tier, tier_type, price, currency, price_as_of, price_source
"""
import csv, os, json, hashlib
from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

ENRICH_CSV = "data/career-mapping/_enrichment/certs_enrichment_2025.csv"

def main():
    if not os.path.exists(ENRICH_CSV):
        print(f"Missing {ENRICH_CSV}")
        return

    with open(ENRICH_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            # Resolve domain_id
            d = svc.table("domains").select("id").eq("domain_key", row["domain_key"]).limit(1).execute()
            if not d.data:
                print(f"Domain not found: {row['domain_key']}")
                continue
            domain_id = d.data[0]["id"]

            # Find cert row (domain_id + name + body)
            existing = svc.table("domain_certifications").select("id").eq("domain_id", domain_id).ilike("name", row["cert_name"]).eq("body", row["cert_body"]).execute()
            
            payload = {
                "domain_id": domain_id,
                "name": row["cert_name"],
                "body": row["cert_body"],
                "official_url": row["official_url"] or None,
                "seniority_tier": int(row["seniority_tier"]) if row["seniority_tier"] else None,
                "tier_type": row["tier_type"] or None,
                "price": float(row["price"]) if row["price"] else None,
                "currency": row["currency"] or None,
                "price_as_of": row["price_as_of"] or None,
                "price_source": row["price_source"] or None,
            }
            
            if existing.data:
                svc.table("domain_certifications").update(payload).eq("id", existing.data[0]["id"]).execute()
            else:
                svc.table("domain_certifications").insert(payload).execute()
            upserted += 1

    # Record enrichment version
    commit_hash = os.popen("git rev-parse --short HEAD").read().strip() or "unknown"
    svc.table("enrichment_version").insert({
        "source_commit_hash": commit_hash,
        "seed_name": "certs",
        "rows_upserted": upserted,
    }).execute()
    print(f"Certs enrichment complete: {upserted} rows")

if __name__ == "__main__":
    main()
```

**All enrichment scripts follow this pattern.** They are **NOT scheduled in Celery** — run manually/CI when source data updates (quarterly for prices, annually for currency, as-available for demand re-rank).

---

### 2.3 Celery Beat — Refresh Orchestration (Phase 7 + 9 Combined)

**File:** `backend/celery_worker.py` — update `beat_schedule`:

```python
beat_schedule={
    # ... existing ...
    
    # Phase 7 — Monthly demand ingest (runs when demand_ingest module exists)
    "fetch-labour-market-demand": {
        "task": "celery_worker.fetch_labour_market_demand",
        "schedule": crontab(hour="*/6", minute=30),
    },
    
    # Phase 7f — Elite composite (daily, after demand ingest)
    "compute-elite-composite": {
        "task": "celery_worker.compute_elite_composite",
        "schedule": crontab(hour=5, minute=0),
    },

    # Phase 8 — Annual admission snapshot version (placeholder)
    "compile-admission-snapshot": {
        "task": "celery_worker.compile_admission_snapshot",
        "schedule": crontab(month=1, day=15, hour=10, minute=0),
    },

    # Phase 9 — Enrichment freshness check (weekly, no-op if no new data)
    "check-enrichment-freshness": {
        "task": "celery_worker.check_enrichment_freshness",
        "schedule": crontab(day_of_week="monday", hour=6, minute=0),
    },
}
```

**New task — `check_enrichment_freshness`:**
```python
@celery.task
def check_enrichment_freshness():
    """
    Weekly no-op that logs the age of each enrichment seed.
    Alerts (logs WARNING) if any seed hasn't been refreshed within its SLA:
      - tools_demand: 30 days (monthly demand cycle)
      - certs_prices: 90 days (quarterly)
      - skills_uris: 180 days (ESCO updates)
      - roles_currency: 180 days (WEF/O*NET/Lightcast cycles)
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
```

---

### 2.4 Frontend Types — Enriched Fields (Extend `src/types/career.ts`)

```typescript
// ── Certifications (Phase 4b enrichment) ───────────────────────
export interface CertificationOut {
  name: string;
  body?: string;
  region?: "global" | "nigeria";
  level?: "foundation" | "professional" | "advanced";
  gateReason?: string;
  // Phase 9 additions:
  officialUrl?: string;          // deep link to register/verify
  seniorityTier?: number;        // 1=entry, 2=mid, 3=senior (scoped to family)
  tierType?: "ladder" | "stages"; // Cisco/AWS/PMI = ladder; CFA/ICAN = stages
  price?: number;
  currency?: "USD" | "NGN" | "GBP" | "EUR";
  priceAsOf?: string;            // ISO date
  priceSource?: string;
}

// ── Skills with URIs (Phase 4b) ───────────────────────────────
export interface FoundationSkill {
  skill: string;
  prevalence?: number;
  n?: number;
  uri?: string;                  // https://data.europa.eu/esco/skill/<UUID>
}

// Subgroup cluster skills parallel URI map (in domain_subgroups.cluster_skill_uris)
// Role essential/optional skills parallel URI arrays (in domain_roles.essential_skill_uris)

// ── Tools with demand re-rank (Phase 7c/9) ────────────────────
export interface ToolOut {
  tool: string;
  group: "distinctive" | "common";
  hot?: boolean;
  inDemand?: boolean;
  roleFreq?: number;
  source?: string;
  // Phase 9:
  demandScore?: number;          // 0..1 from posting frequency
  demandSource?: "adzuna" | "stackoverflow" | "github_innovation" | "onet_hot";
  demandAsOf?: string;
  toolUrl?: string;
}

// ── Role currency (Phase 9 L4) ───────────────────────────────
export interface RoleDetail {
  // ...existing
  currencyStatus?: "current" | "legacy" | "emerging";
  currencyVerifiedAt?: string;
  currencySource?: "wef_foj_2025" | "onet_emerging" | "lightcast" | "curated";
}
```

---

### 2.5 API Endpoints — Enriched Data Access (Read-Only)

**No new endpoints needed** — existing endpoints already return the enriched fields because they select `*` from the tables. The only change is the Pydantic models in `backend/models.py` need the new Optional fields added (see §2.4 types mirrored).

**Verification:** Run `npx tsc --noEmit` after updating `src/types/career.ts` and `backend/models.py` — both must stay in sync.

---

## 3. Conflict Avoidance Checklist (Phase 6 & 7)

| Area | Phase 6 / 7 State | Phase 8/9 Action | Conflict? |
|------|-------------------|------------------|-----------|
| `career_routes.py` | Has `/programmes`, `/domains`, `/roles`, `/jamb`, `/pivot`, `/search`, `/opportunities`, `/saved`, `/notes`, `/subscriptions`, `/feedback`, `/pivot/gap` | **Add** `admission_routes.py` (new file, new prefix `/api/admission`) | ✅ No |
| `migration_career_v2.sql` | Has domains, subgroups, roles, tools, certs, programme_domain, domain_roles, programme_role_score, jamb_programme_domain, domain_overlap, domain_demand_metrics, role_demand_metrics, mapping_feedback, enrichment_version | **Add** `migration_admission_intelligence.sql` + `migration_enrichment_v1.sql` (additive columns) | ✅ No |
| `celery_worker.py` | Has `fetch_labour_market_demand`, `compute_elite_composite` | **Add** `compile_admission_snapshot`, `check_enrichment_freshness` | ✅ No |
| `models.py` | Has `ProgrammeDetail`, `DomainDetail`, `RoleDetail`, `CertificationOut`, `ToolOut`, `FoundationSkill` | **Extend** models with new Optional fields (backward-compatible) | ✅ No |
| `src/types/career.ts` | Has all Phase 6/7 types | **Extend** interfaces with new Optional fields | ✅ No |
| `DomainDetail` demand | Already has `demandMetrics` (Phase 7) | Admission insight added to `JambDomainLink` only | ✅ No |
| `ProgrammeDetail` | Has `domains: DomainLinkOut[]` | Admission data linked via programme_id in `programme_school_cutoff` (separate query) | ✅ No |
| Frontend screens | `ProgrammeOverviewScreen` → domains → `DomainDetailScreen` → roles | New `AdmissionInsightScreen` reachable from `ProgrammeOverviewScreen` | ✅ No |
| SS3 vs SS1/2 gateway | Phase 6.4b: two distinct gateways | Admission data shown with different weight (heavy vs light) | ✅ No |
| Admin dashboard | Phase 7d: demand metrics, peer benchmark | Admission data is student-facing (public cut-offs); admin sees import status via `enrichment_version` | ✅ No |

---

## 4. Implementation Order (Dependencies Respected)

```
1. migration_admission_intelligence.sql      ← Run first (schema)
2. migration_enrichment_v1.sql               ← Run second (schema)
3. backend/models.py                         ← Add new Optional fields
4. src/types/career.ts                       ← Add new Optional fields (must match models)
5. backend/routes/admission_routes.py        ← New API endpoints
6. backend/main.py                           ← Register admission_routes
7. backend/celery_worker.py                  ← Add 2 new beat tasks + task fns
8. data/career-mapping/_enrichment/*.py      ← Enrichment seed scripts
9. backend/scripts/import_admission_<year>.py← Admin import tooling
10. Frontend: AdmissionInsightScreen.tsx     ← New screen (Phase 6.4b integration)
11. Frontend: Update ProgrammeOverviewScreen ← Add Admission tab/section
12. npx tsc --noEmit && uv run ruff check .  ← Verify
```

---

## 5. Data Flow Summary (Student Journey)

```
SS3/JAMB Candidate (Phase 6.4b heavy gateway)
    │
    ▼
JAMB name search → /api/career/jamb/{name}/domains
    │                    Returns: domains[] with demandInsight + admissionInsight
    ▼
Select domain → /api/career/domains/{domain_key}
    │                    Returns: domain detail (Phase 6) + demandMetrics (Phase 7)
    ▼
Select role → /api/career/roles/{role_key}
    │                    Returns: role detail + demandMetrics + currencyStatus (Phase 9)
    ▼
"Will I get in?" → /api/admission/cutoffs?programme_id=X&school_id=Y
    │                    Returns: cutoffs, formula, national floor, competitiveness
    ▼
AdmissionInsightScreen (new) — shows all above with "indicative" badges
```

**SS1/SS2 Explorer (Phase 6.4b light gateway):**
- Same flow but admission badges are smaller, labeled "exploratory — based on 2025 data"
- No cut-off prominence; focus on domain→role→skills exploration

---

## 6. What Is NOT in This Plan (Explicit Exclusions)

| Excluded | Reason |
|----------|--------|
| Live scraping of school portals for cut-offs | ToS blocks; no API; manual annual CSV is the only viable path |
| Per-school per-programme applied-vs-admitted | Data genuinely does not exist (JAMB only released 2015-19; NBS faculty-level 2017-18) |
| Automated certification price fetching | Prices buried in PDFs, often NGN-only; manual quarterly update is correct |
| Real-time demand API in user session | Phase 7 design: monthly cron writes to `domain_demand_metrics`; frontend reads table |
| Admission prediction/estimator | Would imply guarantee; product principle = "indicative only, no promises" |
| Phase 10 UX polish | Separate phase (after data/features live) |
| Phase 11 offline/resume | Separate phase (infra hardening) |
| Phase 12/13 analytics/legal | Separate phases (consent-gated) |

---

## 7. Verification Gates

| Gate | Command / Check |
|------|-----------------|
| Schema applies cleanly | `psql -f migration_admission_intelligence.sql` then `psql -f migration_enrichment_v1.sql` on staging |
| Types ↔ Models in sync | `npx tsc --noEmit` passes; `uv run python -c "from models import *; print('OK')"` |
| API returns DataState envelope | `curl /api/admission/snapshot` → `{status:"real"|"fallback"|"coming_soon", data:..., meta:{sources:[],dataDate}}` |
| Enrichment scripts idempotent | Run each twice; `enrichment_version` rows increment, no duplicate PK errors |
| Celery beat loads | `uv run celery -A celery_worker inspect registered` shows new tasks |
| No Phase 6/7 regression | Existing `/api/career/*` endpoints unchanged (run existing tests) |
| Frontend builds | `npx expo export` (or `eas build`) succeeds |

---

## 8. File Tree Summary (New / Modified)

```
backend/
├── migration_admission_intelligence.sql      # NEW (NEW)
├── migration_enrichment_v1.sql               # NEW
├── routes/
│   └── admission_routes.py                   # NEW
├── celery_worker.py                          # MODIFIED (2 new tasks + beat)
├── models.py                                 # MODIFIED (extended Pydantic models)
├── main.py                                   # MODIFIED (register admission_routes)
└── scripts/
    └── import_admission_<year>.py            # NEW (per-year)

data/career-mapping/_enrichment/
├── certs_enrich.py                           # NEW
├── skills_uris.py                            # NEW
├── tools_demand_rerank.py                    # NEW
├── roles_currency.py                         # NEW
├── run_all.py                                # NEW
└── certs_enrichment_2025.csv                 # NEW (source data)

src/
├── types/
│   └── career.ts                             # MODIFIED (extended interfaces)
└── screens/
    ├── AdmissionInsightScreen.tsx            # NEW
    └── ProgrammeOverviewScreen.tsx           # MODIFIED (admission tab)
```

---

**End of Plan.** This plan is **infrastructure-only** — it builds the pipes, contracts, and schedules. Actual data ingestion (admission CSV import, demand RSS/salary fetch, enrichment CSV refresh) remains a separate operational process as designed in Phase 7 and Phase 8 research.