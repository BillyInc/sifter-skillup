-- ============================================================
-- SIFTER LEVELUP — CAREER TAXONOMY v2 (post-sweep)
-- Schema: skillup_dev
-- Run AFTER migration_career_base_registry.sql,
-- migration_subject_catalog.sql and migration_career_pilot.sql.
-- ------------------------------------------------------------
-- Replaces the PRE-SWEEP taxonomy tables from
-- migration_career_intelligence.sql (which held ZERO rows and
-- could not represent sub-groups, tools, the gateway/subgroup/
-- role certification split, or ready/bridge/stretch readiness).
--
-- STAGING ONLY: use this when the taxonomy tables are empty or an explicitly
-- approved taxonomy rebuild is intended. All
-- user-owned tables (saved_items, user_notes,
-- opportunity_subscriptions) and the programmes / jamb_programmes
-- / school_programmes bridge are PRESERVED.
-- Idempotent: DROP ... IF EXISTS + CREATE ... IF NOT EXISTS.
-- ============================================================

-- ── 0. Extensions (trigram search for disambiguation) ────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 1. Drop the empty pre-sweep taxonomy tables ──────────────
-- (children first; these carried no data). programme_domain is
-- recreated below. User tables are intentionally NOT dropped.
DROP TABLE IF EXISTS skillup_dev.role_bridge_skills   CASCADE;
DROP TABLE IF EXISTS skillup_dev.domain_bridge_skills CASCADE;
DROP TABLE IF EXISTS skillup_dev.adjacent_prerequisites CASCADE;
DROP TABLE IF EXISTS skillup_dev.domain_roles         CASCADE;
DROP TABLE IF EXISTS skillup_dev.programme_domain      CASCADE;
DROP TABLE IF EXISTS skillup_dev.domains               CASCADE;

-- ── 2. DOMAINS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.domains (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_key        TEXT NOT NULL UNIQUE,          -- D001 …
    name              TEXT NOT NULL,
    cluster           TEXT,
    clusters          TEXT[] NOT NULL DEFAULT '{}',
    description       TEXT,
    institution_type  TEXT[] NOT NULL DEFAULT '{}',  -- university/polytechnic/…
    elite_domain      BOOLEAN NOT NULL DEFAULT false,
    excluded          BOOLEAN NOT NULL DEFAULT false, -- D086 gambling
    role_count        INTEGER NOT NULL DEFAULT 0,
    foundation_skills JSONB NOT NULL DEFAULT '[]',    -- L1 ≥50%-of-roles skills
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_domains_cluster ON skillup_dev.domains(cluster);
CREATE INDEX IF NOT EXISTS idx_domains_name_trgm ON skillup_dev.domains USING gin (name gin_trgm_ops);

-- ── 3. DOMAIN SUB-GROUPS (friendly clusters between domain & roles) ─
CREATE TABLE IF NOT EXISTS skillup_dev.domain_subgroups (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id      UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    isco_submajor  TEXT NOT NULL,
    label          TEXT NOT NULL,                    -- student-friendly name
    description    TEXT,
    raw_isco_label TEXT,                             -- provenance
    role_count     INTEGER NOT NULL DEFAULT 0,
    cluster_skills JSONB NOT NULL DEFAULT '[]',      -- L2 delta skills
    UNIQUE(domain_id, isco_submajor)
);
CREATE INDEX IF NOT EXISTS idx_domain_subgroups_domain ON skillup_dev.domain_subgroups(domain_id);

-- ── 4. DOMAIN ROLES (a role may appear in several domains) ───
CREATE TABLE IF NOT EXISTS skillup_dev.domain_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id       UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id     UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE SET NULL,
    role_key        TEXT NOT NULL,                   -- domain_key|role_name
    role_name       TEXT NOT NULL,
    description     TEXT,
    also_known_as   TEXT[] NOT NULL DEFAULT '{}',
    tier            TEXT CHECK (tier IN ('entry','mid','senior')),
    isco_group      TEXT,
    esco_code       TEXT,
    elite_status    TEXT NOT NULL DEFAULT 'deferred',
    essential_skills JSONB NOT NULL DEFAULT '[]',
    optional_skills  JSONB NOT NULL DEFAULT '[]',
    UNIQUE(role_key)
);
CREATE INDEX IF NOT EXISTS idx_domain_roles_domain ON skillup_dev.domain_roles(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_roles_name_trgm ON skillup_dev.domain_roles USING gin (role_name gin_trgm_ops);

-- ── 5. DOMAIN TOOLS (distinctive vs common, domain- or sub-group-scoped) ─
CREATE TABLE IF NOT EXISTS skillup_dev.domain_tools (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id    UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id  UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE CASCADE,
    scope        TEXT NOT NULL CHECK (scope IN ('domain','subgroup')),
    tool_name    TEXT NOT NULL,
    tool_group   TEXT NOT NULL CHECK (tool_group IN ('distinctive','common')),
    role_freq    INTEGER,
    score        NUMERIC,
    hot          BOOLEAN NOT NULL DEFAULT false,
    in_demand    BOOLEAN NOT NULL DEFAULT false,
    source       TEXT                                -- onet | curated_creative
);
CREATE INDEX IF NOT EXISTS idx_domain_tools_domain ON skillup_dev.domain_tools(domain_id);

-- ── 6. DOMAIN CERTIFICATIONS (gateway/subgroup/role_hint split) ─
CREATE TABLE IF NOT EXISTS skillup_dev.domain_certifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id   UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE SET NULL,
    placement   TEXT NOT NULL CHECK (placement IN ('gateway','subgroup','role_hint')),
    name        TEXT NOT NULL,
    body        TEXT,
    region      TEXT CHECK (region IN ('global','nigeria')),
    level       TEXT,                                -- foundation|professional|advanced
    gate_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_domain_certs_domain ON skillup_dev.domain_certifications(domain_id);

-- ── 7. PROGRAMME → DOMAIN (recreated) ────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.programme_domain (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id    UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    domain_id       UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    match_type      TEXT CHECK (match_type IN ('direct','functional','adjacent')),
    UNIQUE(programme_id, domain_id)
);
CREATE INDEX IF NOT EXISTS idx_programme_domain_programme ON skillup_dev.programme_domain(programme_id);
CREATE INDEX IF NOT EXISTS idx_programme_domain_domain    ON skillup_dev.programme_domain(domain_id);

-- ── 8. PROGRAMME → DOMAIN → ROLE READINESS ───────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.programme_role_score (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id   UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    domain_id      UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    role_key       TEXT NOT NULL,
    role_name      TEXT NOT NULL,
    label          TEXT NOT NULL CHECK (label IN ('ready','bridge','stretch')),
    coverage       NUMERIC,
    tier           TEXT,
    subgroup_label TEXT,
    bridge_skills  JSONB NOT NULL DEFAULT '[]',
    UNIQUE(programme_id, domain_id, role_key)
);
CREATE INDEX IF NOT EXISTS idx_prole_score_programme ON skillup_dev.programme_role_score(programme_id);
CREATE INDEX IF NOT EXISTS idx_prole_score_prog_domain ON skillup_dev.programme_role_score(programme_id, domain_id);

-- ── 9. JAMB NAME → DOMAIN (materialized student entry) ───────
CREATE TABLE IF NOT EXISTS skillup_dev.jamb_programme_domain (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_name   TEXT NOT NULL,
    domain_id   UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    match_type  TEXT CHECK (match_type IN ('direct','functional','adjacent')),
    UNIQUE(jamb_name, domain_id)
);
CREATE INDEX IF NOT EXISTS idx_jamb_domain_name ON skillup_dev.jamb_programme_domain(jamb_name);
CREATE INDEX IF NOT EXISTS idx_jamb_domain_name_trgm ON skillup_dev.jamb_programme_domain USING gin (jamb_name gin_trgm_ops);

-- ── 10. DOMAIN OVERLAP (career-changer pivot matrix) ─────────
CREATE TABLE IF NOT EXISTS skillup_dev.domain_overlap (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id_a    UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_id_b    UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    overlap_score  NUMERIC NOT NULL,
    shared_skills  JSONB NOT NULL DEFAULT '[]',
    UNIQUE(domain_id_a, domain_id_b)
);
CREATE INDEX IF NOT EXISTS idx_domain_overlap_a ON skillup_dev.domain_overlap(domain_id_a, overlap_score DESC);

-- ── 11. USERS: optional prior-field seed (career-changer background) ─
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS prior_field_domain_key TEXT;

-- ── 11b. USER-OWNED CAREER TABLES ───────────────────────────
-- Older installs created these in migration_career_intelligence.sql. Fresh
-- installs now skip that obsolete taxonomy migration, so create the stable
-- user-owned tables here before extending them below.
CREATE TABLE IF NOT EXISTS skillup_dev.saved_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('programme', 'school', 'domain', 'subgroup', 'role', 'comparison', 'opportunity', 'organisation', 'elite_pathway')),
    entity_id   TEXT NOT NULL,
    label       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'saved_items_entity_type_check'
          AND conrelid = 'skillup_dev.saved_items'::regclass
    ) THEN
        ALTER TABLE skillup_dev.saved_items
            DROP CONSTRAINT saved_items_entity_type_check;
    END IF;
    ALTER TABLE skillup_dev.saved_items
        ADD CONSTRAINT saved_items_entity_type_check
        CHECK (entity_type IN ('programme', 'school', 'domain', 'subgroup', 'role', 'comparison', 'opportunity', 'organisation', 'elite_pathway'));
END $$;
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON skillup_dev.saved_items(user_id);

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

CREATE TABLE IF NOT EXISTS skillup_dev.opportunity_subscriptions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    target     TEXT CHECK (target IN ('opportunity', 'organisation', 'application_window')),
    target_id  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opp_subscriptions_user ON skillup_dev.opportunity_subscriptions(user_id);

-- ── 12. USER_NOTES: My World category-sort + denormalised entity label ─
ALTER TABLE skillup_dev.user_notes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE skillup_dev.user_notes ADD COLUMN IF NOT EXISTS entity_label TEXT;

-- ── 12b. PROGRAMME_DOMAIN: in-demand signal + elite flag on the link ──
ALTER TABLE skillup_dev.programme_domain
    ADD COLUMN IF NOT EXISTS in_demand_score NUMERIC;
ALTER TABLE skillup_dev.programme_domain
    ADD COLUMN IF NOT EXISTS elite_flag BOOLEAN NOT NULL DEFAULT false;

-- ── 13b. DOMAIN_ROLES — real elite flag for the data-derived composite ----
--    (elite_status stays as the deferred string; elite_flag is the
--     boolean the composite writes once Phase 7f runs.)
ALTER TABLE skillup_dev.domain_roles
    ADD COLUMN IF NOT EXISTS elite_flag BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_domain_roles_elite ON skillup_dev.domain_roles(elite_flag) WHERE elite_flag = true;

-- ── 13c. MAPPING FEEDBACK (Phase 6.7 expert-review + per-edge flag) --------
--    One row per assertion confirm/flag. node/edge key + source/target id.
CREATE TABLE IF NOT EXISTS skillup_dev.mapping_feedback (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    edge_type     TEXT NOT NULL,                       -- domain_role|programme_domain|skill|cert|tool|readiness
    source_id     TEXT NOT NULL,                       -- the node the assertion hangs off
    target_id     TEXT NOT NULL,                       -- the asserted target
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('confirm','flag','suggest')),
    notes         TEXT,
    trust_weight  NUMERIC(4,2) NOT NULL DEFAULT 1.0,  -- expert reviewers > 1
    expert_verified BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_mapping_feedback_edge ON skillup_dev.mapping_feedback(edge_type, source_id, target_id);
CREATE INDEX IF NOT EXISTS idx_mapping_feedback_target ON skillup_dev.mapping_feedback(feedback_type, resolved_at);

-- ── 13d. ENRICHMENT VERSION stamp (Phase 9 provenance row) ---------------
CREATE TABLE IF NOT EXISTS skillup_dev.enrichment_version (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applied_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_commit_hash TEXT,
    seed_name          TEXT NOT NULL,                  -- tools|certs|skills|admission
    rows_upserted      INTEGER NOT NULL DEFAULT 0
);

-- ── 13d-bis. INSTITUTION MEMBERSHIP (admin/educator → their school) ------
--    Links an educator/institution_admin user to the school(s) they represent,
--    so the admin dashboard can scope to "this school" and enforce the
--    admin-only peer-coverage rule. A user may belong to more than one school;
--    `role` records how they're attached. Additive; references the existing
--    schools table (from the pilot migration).
CREATE TABLE IF NOT EXISTS skillup_dev.institution_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    school_id   UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'educator'
                CHECK (role IN ('educator', 'institution_admin')),
    verified    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);
CREATE INDEX IF NOT EXISTS idx_institution_members_user ON skillup_dev.institution_members(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_members_school ON skillup_dev.institution_members(school_id);


-- ── 13e. DEMAND METRICS (Phase 7) — created here so they survive the taxonomy
--    DROP … CASCADE at the top of this migration (they FK domains(id)). Seeded
--    empty; the monthly demand cron (Phase 7 / Phase 2 of the build) writes rows.
--    Moved from the superseded migration_career_intelligence.sql so the single
--    runbook (migration_career_v2 → seeds) creates the whole career schema.
CREATE TABLE IF NOT EXISTS skillup_dev.domain_demand_metrics (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id          UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    rank_lens          TEXT NOT NULL CHECK (rank_lens IN ('global', 'ng_local', 'ng_remote')),
    month              DATE NOT NULL,                  -- first day of the month
    postings_count     INTEGER,
    postings_yoy       NUMERIC(5, 2),
    remote_pct         NUMERIC(5, 2),
    entry_salary_local_ngn  NUMERIC(10, 2),
    entry_salary_remote_usd NUMERIC(10, 2),
    top_employers      TEXT[] DEFAULT '{}',
    top_certs          TEXT[] DEFAULT '{}',
    value_score        NUMERIC(5, 2),
    volume_score       NUMERIC(5, 2),
    plain_label        TEXT,
    redistributable    BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_id, rank_lens, month)
);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_domain ON skillup_dev.domain_demand_metrics(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_month ON skillup_dev.domain_demand_metrics(month);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_lens ON skillup_dev.domain_demand_metrics(rank_lens);
CREATE INDEX IF NOT EXISTS idx_domain_demand_metrics_latest ON skillup_dev.domain_demand_metrics(domain_id, rank_lens, month DESC);

CREATE TABLE IF NOT EXISTS skillup_dev.role_demand_metrics (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id            TEXT NOT NULL,                  -- role_key (roles live in a JSONB/seed, not a PK table)
    role_name          TEXT NOT NULL,
    domain_id          UUID REFERENCES skillup_dev.domains(id) ON DELETE SET NULL,
    rank_lens          TEXT NOT NULL CHECK (rank_lens IN ('global', 'ng_local', 'ng_remote')),
    month              DATE NOT NULL,
    postings_count     INTEGER,
    postings_yoy       NUMERIC(5, 2),
    remote_pct         NUMERIC(5, 2),
    salary_min         NUMERIC(10, 2),
    salary_max         NUMERIC(10, 2),
    top_employers      TEXT[] DEFAULT '{}',
    top_certs          TEXT[] DEFAULT '{}',
    trend_pct          NUMERIC(5, 2),
    redistributable    BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, rank_lens, month)
);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_role ON skillup_dev.role_demand_metrics(role_id);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_month ON skillup_dev.role_demand_metrics(month);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_lens ON skillup_dev.role_demand_metrics(rank_lens);
CREATE INDEX IF NOT EXISTS idx_role_demand_metrics_latest ON skillup_dev.role_demand_metrics(role_id, rank_lens, month DESC);

-- ============================================================
-- END migration_career_v2.sql
-- ============================================================
