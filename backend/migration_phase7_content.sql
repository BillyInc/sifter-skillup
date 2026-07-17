-- ============================================================
-- SIFTER LEVELUP — PHASE 7 CONTENT TABLES
-- Elite pathways · bridge plans · opportunities · scholarships ·
-- application windows
-- Schema: skillup_dev.  Idempotent. Run AFTER migration_career_v2.sql.
--
-- Tables ship EMPTY: the routes return coming_soon envelopes until real
-- content rows are added (owner rule: live data only, no mock rows).
-- ============================================================

-- ── 1. Bridge plans (Model 5 — the honest 6-layer engine) ────
CREATE TABLE IF NOT EXISTS skillup_dev.bridge_plans (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_label         TEXT NOT NULL,     -- starting point
    to_label           TEXT NOT NULL,     -- destination
    -- ordered BridgeLayer[]: [{key,title,body,items[]}] with keys from the
    -- fixed spine: global_standard | nigerian_qualification_map |
    -- bridge_inventory | timeline_cost | employer_entry | ownership_path
    layers             JSONB NOT NULL DEFAULT '[]',
    covered_user_types TEXT[] NOT NULL DEFAULT '{}',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Elite pathways (the 17 elite domains) ─────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.elite_pathways (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id          UUID REFERENCES skillup_dev.domains(id) ON DELETE SET NULL,
    name               TEXT NOT NULL,
    cluster            TEXT,              -- "Finance" | "Tech" | "Law" | ...
    firms              TEXT[] NOT NULL DEFAULT '{}',
    compensation_label TEXT,
    selectivity_label  TEXT,
    nigerian_advantage BOOLEAN NOT NULL DEFAULT false,
    description        TEXT,
    formation          JSONB NOT NULL DEFAULT '[]',  -- EliteStage[]
    pinnacle           JSONB NOT NULL DEFAULT '[]',  -- EliteStage[]
    bridge_plan_id     UUID REFERENCES skillup_dev.bridge_plans(id) ON DELETE SET NULL,
    active             BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_elite_pathways_domain ON skillup_dev.elite_pathways(domain_id);

-- ── 3. Organisations (employers/sponsors behind opportunities) ─
CREATE TABLE IF NOT EXISTS skillup_dev.organisations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL UNIQUE,
    sector         TEXT,
    country        TEXT,
    nigeria_office BOOLEAN NOT NULL DEFAULT false,
    likelihood     TEXT CHECK (likelihood IN ('high', 'medium', 'low')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Opportunities ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.opportunities (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    organisation_id   UUID REFERENCES skillup_dev.organisations(id) ON DELETE SET NULL,
    opp_type          TEXT NOT NULL CHECK (opp_type IN
                        ('internship','graduate_trainee','entry_level','fellowship','contract')),
    scope             TEXT NOT NULL CHECK (scope IN ('local','global','remote')),
    work_mode         TEXT CHECK (work_mode IN ('onsite','hybrid','remote','field','shift')),
    eligible_institution_types TEXT[] NOT NULL DEFAULT '{}',
    domain_keys       TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {D001,D015}
    role_keys         TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {"D001|software developer"}
    country           TEXT,
    region            TEXT,                          -- filter grouping (nigeria|uk|remote|...)
    salary_ngn_min    NUMERIC(12,2),
    salary_ngn_max    NUMERIC(12,2),
    application_window TEXT,
    application_deadline DATE,
    careers_url       TEXT,
    visa_route        TEXT,
    likelihood        TEXT CHECK (likelihood IN ('high','medium','low')),
    description       TEXT,
    skills            TEXT[] NOT NULL DEFAULT '{}',
    certifications    TEXT[] NOT NULL DEFAULT '{}',
    active            BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON skillup_dev.opportunities(active);
CREATE INDEX IF NOT EXISTS idx_opportunities_domains ON skillup_dev.opportunities USING gin (domain_keys);
CREATE INDEX IF NOT EXISTS idx_opportunities_scope ON skillup_dev.opportunities(scope, opp_type);

-- ── 5. Scholarships ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.scholarships (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    funded       TEXT CHECK (funded IN ('full','partial')),
    level_label  TEXT,                    -- Undergrad / Postgrad / PhD ...
    destination  TEXT,
    disciplines  TEXT[] NOT NULL DEFAULT '{}',
    opens_label  TEXT,
    url          TEXT,
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. Application windows ───────────────────────────────────
-- Status (open/opening_soon/closing_soon/closed) is DERIVED at read time from
-- opens_at/closes_at so rows never go stale.
CREATE TABLE IF NOT EXISTS skillup_dev.application_windows (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    organisation_name TEXT,
    opportunity_id    UUID REFERENCES skillup_dev.opportunities(id) ON DELETE CASCADE,
    opens_at          DATE,
    closes_at         DATE,
    when_label        TEXT,               -- human label if dates are approximate
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_application_windows_dates
    ON skillup_dev.application_windows(opens_at, closes_at);

-- ── RLS: closed to direct client access (FastAPI service role only) ─
ALTER TABLE skillup_dev.bridge_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.elite_pathways      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.organisations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.opportunities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.scholarships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.application_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE skillup_dev.bridge_plans        FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.elite_pathways      FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.organisations       FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.opportunities       FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.scholarships        FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.application_windows FROM anon, authenticated;

-- ============================================================
-- END migration_phase7_content.sql
-- ============================================================
