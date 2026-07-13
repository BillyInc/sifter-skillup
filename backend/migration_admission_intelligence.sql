-- ============================================================
-- SIFTER LEVELUP — ADMISSION INTELLIGENCE (Phase 8)
-- Schema: skillup_dev
-- Run AFTER migration_career_v2.sql
-- Annual Dec/Jan snapshot. Lagging proxy — always label the year.
-- Scope: SS → University (UTME / Direct Entry) ONLY
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

-- ============================================================
-- END migration_admission_intelligence.sql
-- ============================================================