-- Subject catalog bootstrap for the JAMB/UTME/O-level data pipeline.
--
-- This is intentionally a separate additive migration. The career pilot
-- schema creates school_programme_subject_option_items, which references this
-- table, so the catalog must exist before migration_career_pilot.sql runs on a
-- fresh Supabase database. migration_student_pipeline_live.sql also contains
-- the same IF NOT EXISTS definition for compatibility with older deployments.

CREATE SCHEMA IF NOT EXISTS skillup_dev;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS skillup_dev.subject_catalog (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL UNIQUE,
    aliases      TEXT[] NOT NULL DEFAULT '{}',
    exam_types   TEXT[] NOT NULL DEFAULT '{}',
    category     TEXT,
    stream_tags  TEXT[] NOT NULL DEFAULT '{}',
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_catalog_name_trgm
    ON skillup_dev.subject_catalog USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_subject_catalog_aliases
    ON skillup_dev.subject_catalog USING gin (aliases);
