-- ============================================================
-- SIFTER LEVELUP — CAREER MAPPING PILOT (Law + Social Sciences)
-- Schema: skillup_dev
-- Run AFTER migration_career_intelligence.sql
-- ADDITIVE ONLY: extends schools/programmes; adds the JAMB↔CCMAS
-- bridge tables. Does NOT touch programme_domain (domain phase).
-- Idempotent: IF NOT EXISTS + ADD COLUMN IF NOT EXISTS.
-- ============================================================

-- ── schools: add the JAMB/IBASS institution code (UNILAG, ABU, …) ──
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS jamb_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_jamb_code
    ON skillup_dev.schools(jamb_code) WHERE jamb_code IS NOT NULL;

-- ── programmes: CCMAS provenance (canonical registry) ──────────
ALTER TABLE skillup_dev.programmes ADD COLUMN IF NOT EXISTS ccmas_discipline      TEXT;
ALTER TABLE skillup_dev.programmes ADD COLUMN IF NOT EXISTS ccmas_programme_code  TEXT;
ALTER TABLE skillup_dev.programmes ADD COLUMN IF NOT EXISTS mapping_source        TEXT
    CHECK (mapping_source IN ('ccmas', 'custom'));

-- ── JAMB programmes (one row per distinct JAMB name-variation) ──
CREATE TABLE IF NOT EXISTS skillup_dev.jamb_programmes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_name   TEXT NOT NULL,
    jamb_faculty TEXT,
    degree_type TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_jamb_programmes_name
    ON skillup_dev.jamb_programmes(jamb_name);

-- ── JAMB → CCMAS bridge (the editorial heart; A/B/C/D) ─────────
CREATE TABLE IF NOT EXISTS skillup_dev.programme_mapping (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_programme_id  UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    programme_id       UUID REFERENCES skillup_dev.programmes(id) ON DELETE SET NULL,
    mapping_type       TEXT CHECK (mapping_type IN ('A_exact', 'B_granular', 'C_reclassified', 'D_custom')),
    mapping_note       TEXT,
    confidence         TEXT,
    UNIQUE(jamb_programme_id)
);
CREATE INDEX IF NOT EXISTS idx_programme_mapping_programme ON skillup_dev.programme_mapping(programme_id);

-- ── School × JAMB-programme offering (per-institution reality) ─
CREATE TABLE IF NOT EXISTS skillup_dev.school_programmes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id          UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    jamb_programme_id  UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    utme_subjects          TEXT,
    olevel_requirement     TEXT,
    direct_entry           TEXT,
    remarks                TEXT,
    UNIQUE(school_id, jamb_programme_id)
);
CREATE INDEX IF NOT EXISTS idx_school_programmes_school    ON skillup_dev.school_programmes(school_id);
CREATE INDEX IF NOT EXISTS idx_school_programmes_programme ON skillup_dev.school_programmes(jamb_programme_id);

-- ── Programme subject requirements (canonical, per JAMB programme) ─
CREATE TABLE IF NOT EXISTS skillup_dev.programme_subject_requirements (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_programme_id  UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    utme_subjects          TEXT,
    olevel_requirement     TEXT,
    direct_entry           TEXT,
    UNIQUE(jamb_programme_id)
);
CREATE INDEX IF NOT EXISTS idx_prog_subject_req_programme ON skillup_dev.programme_subject_requirements(jamb_programme_id);
