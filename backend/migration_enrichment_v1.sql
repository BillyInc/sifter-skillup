-- ============================================================
-- SIFTER LEVELUP — ENRICHMENT & REFRESH FIELDS (Phase 9)
-- Schema: skillup_dev
-- All columns are ADDITIVE, NULLABLE, with defaults.
-- Scope: University programmes only (Phase 8 scope)
-- Run AFTER migration_career_v2.sql AND migration_admission_intelligence.sql
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
-- Add a companion JSONB for URIs (keyed by skill name).
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

-- ============================================================
-- END migration_enrichment_v1.sql
-- ============================================================