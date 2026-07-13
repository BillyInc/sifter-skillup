-- ============================================================
-- SIFTER LEVELUP — CAREER INTELLIGENCE SCHEMA
-- Schema: skillup_dev
-- Run AFTER existing supabase-schema.sql + migration_v2.sql
-- Mirrors the frontend contract in src/types/career.ts
-- SCHEMA ONLY — zero data rows
-- ============================================================

-- ── 1. SCHOOLS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.schools (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    institution_type TEXT,
    ibass_verified   BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. PROGRAMMES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.programmes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    display_name     TEXT,
    institution_type TEXT,
    discipline       TEXT,
    qualification    TEXT,
    duration_years   NUMERIC,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_programmes_institution_type ON skillup_dev.programmes(institution_type);

-- ── 3. DOMAINS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.domains (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    cluster     TEXT,
    description TEXT,
    elite_flag      BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_domains_cluster ON skillup_dev.domains(cluster);

-- ── 4. PROGRAMME → DOMAIN (Step 1 link) ──────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.programme_domain (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id    UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    domain_id       UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    match_type      TEXT CHECK (match_type IN ('direct', 'functional', 'adjacent')),
    in_demand_score NUMERIC,
    elite_flag      BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(programme_id, domain_id)
);
CREATE INDEX IF NOT EXISTS idx_programme_domain_programme ON skillup_dev.programme_domain(programme_id);
CREATE INDEX IF NOT EXISTS idx_programme_domain_domain    ON skillup_dev.programme_domain(domain_id);

-- ── 5. DOMAIN ROLES (Step 2 role scoring) ────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.domain_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id       UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    role_id         TEXT,
    role_name       TEXT NOT NULL,
    also_known_as   TEXT[] NOT NULL DEFAULT '{}',
    match           TEXT CHECK (match IN ('match', 'adjacent')),
    coverage_ratio  NUMERIC,
    in_demand_score NUMERIC,
    elite_flag      BOOLEAN NOT NULL DEFAULT false,
    esco_code       TEXT,
    isco_group      TEXT,
    description     TEXT,
    career_ladder   TEXT[] NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_domain_roles_domain ON skillup_dev.domain_roles(domain_id);

-- ── 6. DOMAIN BRIDGE SKILLS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.domain_bridge_skills (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id  UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category   TEXT,
    covered    BOOLEAN
);

-- ── 7. ROLE BRIDGE SKILLS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.role_bridge_skills (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id  UUID,
    role_id    TEXT,
    skill_name TEXT NOT NULL,
    category   TEXT,
    covered    BOOLEAN
);

-- ── 8. ADJACENT PREREQUISITES ────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.adjacent_prerequisites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id  UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category   TEXT
);

-- ── 9. ORGANISATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.organisations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    sector         TEXT,
    country        TEXT,
    nigeria_office BOOLEAN NOT NULL DEFAULT false,
    likelihood     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. OPPORTUNITIES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    organisation_id     UUID REFERENCES skillup_dev.organisations(id) ON DELETE CASCADE,
    type                TEXT CHECK (type IN ('internship', 'graduate_trainee', 'entry_level', 'fellowship', 'contract')),
    scope               TEXT CHECK (scope IN ('local', 'global', 'remote')),
    work_mode           TEXT,
    domain_ids          UUID[] NOT NULL DEFAULT '{}',
    role_ids            UUID[] NOT NULL DEFAULT '{}',
    country             TEXT,
    salary_ngn_min      NUMERIC,
    salary_ngn_max      NUMERIC,
    application_window   TEXT,
    application_deadline TEXT,
    careers_url         TEXT,
    visa_route          TEXT,
    likelihood          TEXT,
    data_sources        TEXT[] NOT NULL DEFAULT '{}',
    data_verified_date  DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. OPPORTUNITY INSTITUTION ELIGIBILITY (6-type) ─────────
CREATE TABLE IF NOT EXISTS skillup_dev.opportunity_institution_eligibility (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id   UUID NOT NULL REFERENCES skillup_dev.opportunities(id) ON DELETE CASCADE,
    institution_type TEXT CHECK (institution_type IN ('university', 'college_of_education', 'polytechnic', 'monotechnic', 'college_of_health', 'technical_college'))
);
CREATE INDEX IF NOT EXISTS idx_opp_eligibility_opportunity ON skillup_dev.opportunity_institution_eligibility(opportunity_id);

-- ── 12. SAVED ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.saved_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('programme', 'domain', 'role', 'opportunity', 'organisation', 'elite_pathway')),
    entity_id   TEXT NOT NULL,
    label       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON skillup_dev.saved_items(user_id);

-- ── 13. USER NOTES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.user_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    entity_type TEXT,
    entity_id   TEXT,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON skillup_dev.user_notes(user_id);

-- ── 14. OPPORTUNITY SUBSCRIPTIONS ────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.opportunity_subscriptions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    target     TEXT CHECK (target IN ('opportunity', 'organisation', 'application_window')),
    target_id  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opp_subscriptions_user ON skillup_dev.opportunity_subscriptions(user_id);

-- ── 15. DOMAIN DEMAND METRICS (Phase 7) ────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.domain_demand_metrics (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id          UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    rank_lens          TEXT NOT NULL CHECK (rank_lens IN ('global', 'ng_local', 'ng_remote')),
    month              DATE NOT NULL,  -- First day of the month
    postings_count     INTEGER,
    postings_yoy       NUMERIC(5, 2),  -- Year-over-year percentage change
    remote_pct         NUMERIC(5, 2),  -- Percentage of remote postings
    entry_salary_local_ngn  NUMERIC(10, 2),  -- Entry-level salary in Nigerian Naira
    entry_salary_remote_usd NUMERIC(10, 2),  -- Entry-level salary in USD (remote)
    top_employers      TEXT[] DEFAULT '{}',
    top_certs          TEXT[] DEFAULT '{}',
    value_score        NUMERIC(5, 2),  -- Value score (0-100)
    volume_score       NUMERIC(5, 2),  -- Volume score (0-100)
    plain_label        TEXT,           -- Plain English label (e.g., "High growth, moderate competition")
    redistributable    BOOLEAN NOT NULL DEFAULT true,  -- License-safe for redistribution
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_id, rank_lens, month)
);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_domain ON skillup_dev.domain_demand_metrics(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_month ON skillup_dev.domain_demand_metrics(month);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_lens ON skillup_dev.domain_demand_metrics(rank_lens);

-- Index for fast lookup of latest month per domain/lens
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_latest ON skillup_dev.domain_demand_metrics 
(domain_id, rank_lens, month DESC);

-- ── 16. ROLE DEMAND METRICS (Phase 7) ────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.role_demand_metrics (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id            TEXT NOT NULL,
    role_name          TEXT NOT NULL,
    domain_id          UUID REFERENCES skillup_dev.domains(id) ON DELETE SET NULL,
    rank_lens          TEXT NOT NULL CHECK (rank_lens IN ('global', 'ng_local', 'ng_remote')),
    month              DATE NOT NULL,  -- First day of the month
    postings_count     INTEGER,
    postings_yoy       NUMERIC(5, 2),  -- Year-over-year percentage change
    remote_pct         NUMERIC(5, 2),  -- Percentage of remote postings
    salary_min         NUMERIC(10, 2),  -- Minimum salary (local NGN or remote USD based on lens)
    salary_max         NUMERIC(10, 2),  -- Maximum salary (local NGN or remote USD based on lens)
    top_employers      TEXT[] DEFAULT '{}',
    top_certs          TEXT[] DEFAULT '{}',
    trend_pct          NUMERIC(5, 2),  -- Trend percentage (could be MoM or YoY based on configuration)
    redistributable    BOOLEAN NOT NULL DEFAULT true,  -- License-safe for redistribution
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, rank_lens, month)
);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_role ON skillup_dev.role_demand_metrics(role_id);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_month ON skillup_dev.role_demand_metrics(month);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_lens ON skillup_dev.role_demand_metrics(rank_lens);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_latest ON skillup_dev.role_demand_metrics 
(role_id, rank_lens, month DESC);
