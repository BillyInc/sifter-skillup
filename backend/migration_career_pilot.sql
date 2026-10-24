-- ============================================================
-- SIFTER LEVELUP — CAREER MAPPING PILOT (Law + Social Sciences)
-- Schema: skillup_dev
-- Run AFTER migration_career_base_registry.sql and
-- migration_subject_catalog.sql.
-- Do not run migration_career_intelligence.sql; it is superseded.
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
-- JAMB-nuance skills profile: union of the primary + any secondary (blended) CCMAS
-- programmes this JAMB admission name spans. Powers the eventual university-vs-market gap.
ALTER TABLE skillup_dev.jamb_programmes ADD COLUMN IF NOT EXISTS skills_technical     JSONB;
ALTER TABLE skillup_dev.jamb_programmes ADD COLUMN IF NOT EXISTS skills_transferable  JSONB;
ALTER TABLE skillup_dev.jamb_programmes ADD COLUMN IF NOT EXISTS skills_components    JSONB;
ALTER TABLE skillup_dev.jamb_programmes ADD COLUMN IF NOT EXISTS is_blend             BOOLEAN DEFAULT FALSE;

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

-- Raw university-specific requirement/waiver evidence.  These notes are not
-- national JAMB rules and must not be silently folded into the CCMAS or career
-- mapping.  A row remains `needs_review` until its wording has been converted
-- into a structured university-scoped subject rule.
CREATE TABLE IF NOT EXISTS skillup_dev.school_programme_requirement_exceptions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_programme_id   UUID NOT NULL REFERENCES skillup_dev.school_programmes(id) ON DELETE CASCADE,
    school_id             UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    jamb_programme_id     UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    exam_type             TEXT NOT NULL CHECK (exam_type IN ('utme', 'olevel', 'direct_entry', 'general')),
    requirement_text      TEXT NOT NULL,
    source_file           TEXT,
    source_label          TEXT,
    parse_status          TEXT NOT NULL DEFAULT 'needs_review'
                          CHECK (parse_status IN ('parsed', 'needs_review', 'not_subject_rule')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_programme_id, exam_type, requirement_text)
);
CREATE INDEX IF NOT EXISTS idx_school_programme_exceptions_pair
    ON skillup_dev.school_programme_requirement_exceptions(school_id, jamb_programme_id);
CREATE INDEX IF NOT EXISTS idx_school_programme_exceptions_status
    ON skillup_dev.school_programme_requirement_exceptions(parse_status);

-- Structured university-scoped subject rules.  These are children of the raw
-- evidence row above, never replacements for the national JAMB rule.  A
-- partial rule records an exact local condition without claiming that it is a
-- complete UTME combination.
CREATE TABLE IF NOT EXISTS skillup_dev.school_programme_subject_options (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_id        UUID NOT NULL REFERENCES skillup_dev.school_programme_requirement_exceptions(id) ON DELETE CASCADE,
    school_programme_id UUID NOT NULL REFERENCES skillup_dev.school_programmes(id) ON DELETE CASCADE,
    school_id           UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    jamb_programme_id   UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    exam_type           TEXT NOT NULL CHECK (exam_type IN ('utme', 'olevel')),
    rule_scope          TEXT NOT NULL CHECK (rule_scope IN ('full', 'partial')),
    option_label        TEXT,
    min_required        SMALLINT NOT NULL DEFAULT 0,
    source_text         TEXT NOT NULL,
    condition_text      TEXT,
      pass_required_codes JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(pass_required_codes) = 'array'),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- A cross-reference can inherit one UTME rule and one O-level rule from the
-- referenced programme.  Keep the exception itself singular, but allow one
-- structured option per exam layer.
ALTER TABLE skillup_dev.school_programme_subject_options
    DROP CONSTRAINT IF EXISTS school_programme_subject_options_exception_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_school_programme_subject_options_exception_exam
    ON skillup_dev.school_programme_subject_options(exception_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_school_programme_subject_options_pair
    ON skillup_dev.school_programme_subject_options(school_id, jamb_programme_id, exam_type);

CREATE TABLE IF NOT EXISTS skillup_dev.school_programme_subject_option_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id           UUID NOT NULL REFERENCES skillup_dev.school_programme_subject_options(id) ON DELETE CASCADE,
    subject_id          UUID NOT NULL REFERENCES skillup_dev.subject_catalog(id) ON DELETE CASCADE,
    requirement_role    TEXT NOT NULL DEFAULT 'required'
                        CHECK (requirement_role IN ('required', 'one_of')),
    group_key           TEXT,
    min_from_group      SMALLINT,
    distinct_group_key  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(option_id, subject_id, requirement_role, group_key)
);
CREATE INDEX IF NOT EXISTS idx_school_programme_subject_option_items_option
    ON skillup_dev.school_programme_subject_option_items(option_id);

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

-- Source-level brochure variants. A JAMB name can appear in more than one
-- brochure/faculty block or have a requirement inherited from a preceding
-- programme row. Keep each source row separately; the canonical requirement
-- above is populated only when the source rule is unambiguous.
CREATE TABLE IF NOT EXISTS skillup_dev.jamb_programme_requirement_sources (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_programme_id     UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    layer                 TEXT NOT NULL CHECK (layer IN ('utme', 'olevel', 'direct_entry')),
    source_file           TEXT NOT NULL,
    pdf_page              INTEGER,
    table_row             INTEGER,
    source_status         TEXT NOT NULL CHECK (source_status IN ('exact', 'inherited_shared', 'source_blank', 'source_row_not_found')),
    resolution            TEXT NOT NULL,
    requirement_text      TEXT,
    course_cell           TEXT,
    waiver_cell           TEXT,
    inherited_from        JSONB,
    continuation_sources  JSONB,
    source_label          TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(jamb_programme_id, layer, source_file, pdf_page, table_row)
);
CREATE INDEX IF NOT EXISTS idx_jamb_requirement_sources_pair
    ON skillup_dev.jamb_programme_requirement_sources(jamb_programme_id, layer);
CREATE INDEX IF NOT EXISTS idx_jamb_requirement_sources_file_location
    ON skillup_dev.jamb_programme_requirement_sources(source_file, pdf_page, table_row);
