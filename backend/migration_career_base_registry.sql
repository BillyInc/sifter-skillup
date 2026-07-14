-- ============================================================
-- SIFTER — CAREER BASE REGISTRY
-- Schema: skillup_dev
-- Run AFTER supabase-schema.sql and BEFORE career/admission/provisioning.
--
-- Why this exists:
--   The old migration_career_intelligence.sql created schools/programmes but
--   also created obsolete taxonomy tables. The modern v2 career migration
--   assumes schools/programmes already exist. This small bootstrap creates
--   only the stable base registry tables that later migrations depend on.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS skillup_dev;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Institution registry: universities, polytechnics, secondary schools,
-- tutorial centres, etc. Later migrations add codes and provisioning fields.
CREATE TABLE IF NOT EXISTS skillup_dev.schools (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    institution_type TEXT,
    ibass_verified   BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_schools_name_trgm
    ON skillup_dev.schools USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_institution_type
    ON skillup_dev.schools(institution_type);

-- Canonical programme registry. JAMB-specific names are created later in
-- migration_career_pilot.sql and mapped back to this table.
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
CREATE INDEX IF NOT EXISTS idx_programmes_name_trgm
    ON skillup_dev.programmes USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programmes_institution_type
    ON skillup_dev.programmes(institution_type);

-- The main app schema should already create users. This guard keeps later
-- migrations from failing with a cryptic missing-users error if the base schema
-- was skipped.
DO $$
BEGIN
    IF to_regclass('skillup_dev.users') IS NULL THEN
        RAISE EXCEPTION
          'Missing skillup_dev.users. Run supabase-schema.sql before migration_career_base_registry.sql.';
    END IF;
END $$;

-- ============================================================
-- END migration_career_base_registry.sql
-- ============================================================
