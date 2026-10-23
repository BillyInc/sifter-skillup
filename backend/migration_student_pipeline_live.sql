-- ============================================================
-- SIFTER — STUDENT PIPELINE LIVE SCHEMA
-- Schema: skillup_dev
-- Run AFTER:
--   1. migration_career_pilot.sql
--   2. migration_career_v2.sql
--   3. migration_admission_intelligence.sql
--   4. migration_provisioning.sql
--
-- Purpose:
--   Makes the SS/JAMB → programme → school/cutoff → domain → subgroup → role
--   pipeline persistent and queryable. Existing migrations already contain the
--   taxonomy, JAMB programme registry, school offerings, and admission cutoffs.
--   This migration adds the missing user-starting-point and subject-eligibility
--   layer needed to route real students through that data.
--
-- Product decisions encoded here:
--   * stream = self-declared guidance hint, never an eligibility gate.
--   * eligibility is based on selected subjects + structured requirements.
--   * grades/documents are not stored here.
--   * expert evaluator is a capability/role, not a main account type.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 1. Capability roles ─────────────────────────────────────
-- `users.account_type` remains the primary surface selector:
-- student | educator | institution_admin.
-- This table grants additional capabilities, e.g. expert evaluator, without
-- forcing a user to stop being a student/educator.
CREATE TABLE IF NOT EXISTS skillup_dev.user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (
                  role IN ('expert_evaluator', 'data_admin', 'school_counsellor')
                ),
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'suspended', 'revoked')),
    granted_by  UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    granted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON skillup_dev.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_status ON skillup_dev.user_roles(role, status);

CREATE TABLE IF NOT EXISTS skillup_dev.expert_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    display_name        TEXT,
    expertise_domains   TEXT[] NOT NULL DEFAULT '{}', -- domain_key list or broad labels
    credentials         JSONB NOT NULL DEFAULT '[]'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    trust_weight        NUMERIC(4,2) NOT NULL DEFAULT 1.50,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Subject catalog ──────────────────────────────────────
-- Canonical subjects used by UTME/O'level matching. Seed this once from the
-- public WAEC/NECO/JAMB subject list. `stream_tags` are UX hints only.
CREATE TABLE IF NOT EXISTS skillup_dev.subject_catalog (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         TEXT NOT NULL UNIQUE, -- e.g. ENG, MATH, PHY, ECON
    name         TEXT NOT NULL UNIQUE,
    aliases      TEXT[] NOT NULL DEFAULT '{}',
    exam_types   TEXT[] NOT NULL DEFAULT '{}', -- utme, olevel
    category     TEXT, -- science | commercial | art | general | language | technical
    stream_tags  TEXT[] NOT NULL DEFAULT '{}', -- science | commercial | art | technical
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subject_catalog_name_trgm
    ON skillup_dev.subject_catalog USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_subject_catalog_aliases
    ON skillup_dev.subject_catalog USING gin (aliases);

-- ── 3. Student starting point ───────────────────────────────
-- Server-side version of src/types/onboarding.ts. Keep the raw JSON for forward
-- compatibility, but normalize the fields needed for routing and analytics.
CREATE TABLE IF NOT EXISTS skillup_dev.student_starting_points (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    user_type                   TEXT NOT NULL CHECK (
                                  user_type IN (
                                    'senior_secondary',
                                    'ss3_secondary',
                                    'jamb',
                                    'student',
                                    'skilled_worker',
                                    'professional',
                                    'graduate'
                                  )
                                ),
    ss_door                     TEXT CHECK (ss_door IN ('know_where', 'know_what', 'unsure')),
    ss_class                    TEXT CHECK (ss_class IN ('ss1', 'ss2', 'ss3')),
    stream                      TEXT CHECK (stream IN ('science', 'art', 'commercial')),
    explore_intent              TEXT[] NOT NULL DEFAULT '{}',
    jamb_score_band             TEXT,
    preferred_institution_type  TEXT,
    preferred_school_id         UUID REFERENCES skillup_dev.schools(id) ON DELETE SET NULL,
    preferred_school_name       TEXT,
    intended_jamb_programme_id  UUID REFERENCES skillup_dev.jamb_programmes(id) ON DELETE SET NULL,
    intended_programme_id       UUID REFERENCES skillup_dev.programmes(id) ON DELETE SET NULL,
    intended_programme_name     TEXT,
    prior_field_domain_key      TEXT,
    work_regions                TEXT[] NOT NULL DEFAULT '{}',
    work_types                  TEXT[] NOT NULL DEFAULT '{}',
    notification_prefs          JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_profile                 JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_starting_points_user_type
    ON skillup_dev.student_starting_points(user_type);
CREATE INDEX IF NOT EXISTS idx_starting_points_door_stream
    ON skillup_dev.student_starting_points(ss_door, stream);
CREATE INDEX IF NOT EXISTS idx_starting_points_intended_jamb
    ON skillup_dev.student_starting_points(intended_jamb_programme_id)
    WHERE intended_jamb_programme_id IS NOT NULL;

-- Student-selected subjects. No grades are stored. A student can mark the same
-- subject for multiple purposes: strongest, enjoyed, UTME candidate, O'level.
CREATE TABLE IF NOT EXISTS skillup_dev.student_subject_choices (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    starting_point_id      UUID NOT NULL REFERENCES skillup_dev.student_starting_points(id) ON DELETE CASCADE,
    user_id                UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    subject_id             UUID REFERENCES skillup_dev.subject_catalog(id) ON DELETE SET NULL,
    subject_name_snapshot  TEXT NOT NULL,
    choice_type            TEXT NOT NULL CHECK (
                            choice_type IN ('strongest', 'enjoyed', 'utme', 'olevel', 'preferred')
                          ),
    rank                   SMALLINT,
    self_reported          BOOLEAN NOT NULL DEFAULT true,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(starting_point_id, subject_name_snapshot, choice_type)
);
CREATE INDEX IF NOT EXISTS idx_student_subject_choices_user
    ON skillup_dev.student_subject_choices(user_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_choices_starting
    ON skillup_dev.student_subject_choices(starting_point_id);

-- ── 4. Structured programme subject requirements ────────────
-- Existing `programme_subject_requirements` stores official text. This layer
-- stores parsed options so "unsure" students can be matched.
ALTER TABLE skillup_dev.programme_subject_requirements
    ADD COLUMN IF NOT EXISTS parse_status TEXT NOT NULL DEFAULT 'unparsed'
    CHECK (parse_status IN ('unparsed', 'parsed', 'needs_review'));
ALTER TABLE skillup_dev.programme_subject_requirements
    ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS skillup_dev.programme_subject_options (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_programme_id  UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    requirement_id     UUID REFERENCES skillup_dev.programme_subject_requirements(id) ON DELETE SET NULL,
    exam_type          TEXT NOT NULL CHECK (exam_type IN ('utme', 'olevel')),
    option_label       TEXT, -- e.g. "UTME combo A", "Five credits"
    min_required       SMALLINT NOT NULL DEFAULT 0,
    source_text        TEXT,
    source_url         TEXT,
    verified_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subject_options_jamb
    ON skillup_dev.programme_subject_options(jamb_programme_id, exam_type);

CREATE TABLE IF NOT EXISTS skillup_dev.programme_subject_option_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id       UUID NOT NULL REFERENCES skillup_dev.programme_subject_options(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES skillup_dev.subject_catalog(id) ON DELETE CASCADE,
    requirement_role TEXT NOT NULL DEFAULT 'required'
                     CHECK (requirement_role IN ('required', 'one_of', 'recommended')),
    group_key       TEXT, -- one_of group, e.g. "science_elective"
    min_from_group  SMALLINT,
    distinct_group_key TEXT, -- groups in this scope must use different subjects
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(option_id, subject_id, requirement_role, group_key)
);
ALTER TABLE skillup_dev.programme_subject_option_items
    ADD COLUMN IF NOT EXISTS distinct_group_key TEXT;
CREATE INDEX IF NOT EXISTS idx_subject_option_items_option
    ON skillup_dev.programme_subject_option_items(option_id);
CREATE INDEX IF NOT EXISTS idx_subject_option_items_subject
    ON skillup_dev.programme_subject_option_items(subject_id);

-- ── 5. Admission/cutoff bridge by JAMB programme ────────────
-- Published school admissions usually use JAMB programme names. Existing
-- cutoffs point at canonical programmes; keep that, but add an optional JAMB
-- programme FK so the "know what/not where" path can list schools reliably.
ALTER TABLE skillup_dev.programme_school_cutoff
    ADD COLUMN IF NOT EXISTS jamb_programme_id UUID REFERENCES skillup_dev.jamb_programmes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_psc_jamb_programme_year
    ON skillup_dev.programme_school_cutoff(jamb_programme_id, year)
    WHERE jamb_programme_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_psc_school_jamb_year_form
    ON skillup_dev.programme_school_cutoff(school_id, jamb_programme_id, year, form)
    WHERE jamb_programme_id IS NOT NULL;

-- Optional aliases for disambiguation search. Use for student phrases that do
-- not exactly match JAMB or canonical programme names.
CREATE TABLE IF NOT EXISTS skillup_dev.search_aliases (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type  TEXT NOT NULL CHECK (
                  entity_type IN ('jamb_programme', 'programme', 'school', 'domain', 'role')
                ),
    entity_id    TEXT NOT NULL,
    alias        TEXT NOT NULL,
    source       TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, alias)
);
CREATE INDEX IF NOT EXISTS idx_search_aliases_alias_trgm
    ON skillup_dev.search_aliases USING gin (alias gin_trgm_ops);

-- ── 6. Student pathway choices ──────────────────────────────
-- Records the current selected path and later changes. This supports:
--   * know_where: school + JAMB/programme selected immediately
--   * know_what: programme first, school later
--   * unsure: subjects → programme shortlist → school → domain → role
--   * career change: from prior domain → target domain/role
CREATE TABLE IF NOT EXISTS skillup_dev.student_pathway_choices (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    starting_point_id      UUID REFERENCES skillup_dev.student_starting_points(id) ON DELETE SET NULL,
    stage                  TEXT NOT NULL CHECK (
                            stage IN ('programme', 'school', 'domain', 'subgroup', 'role', 'career_change')
                          ),
    school_id              UUID REFERENCES skillup_dev.schools(id) ON DELETE SET NULL,
    jamb_programme_id      UUID REFERENCES skillup_dev.jamb_programmes(id) ON DELETE SET NULL,
    programme_id           UUID REFERENCES skillup_dev.programmes(id) ON DELETE SET NULL,
    domain_key             TEXT,
    subgroup_id            UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE SET NULL,
    role_key               TEXT,
    source                 TEXT NOT NULL DEFAULT 'student'
                          CHECK (source IN ('student', 'onboarding', 'educator', 'system')),
    status                 TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'replaced', 'dismissed')),
    evidence               JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pathway_choices_user_active
    ON skillup_dev.student_pathway_choices(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pathway_choices_jamb
    ON skillup_dev.student_pathway_choices(jamb_programme_id)
    WHERE jamb_programme_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pathway_choices_domain_role
    ON skillup_dev.student_pathway_choices(domain_key, role_key)
    WHERE domain_key IS NOT NULL;

-- ── 7. Read views for live routes ───────────────────────────
--
-- Two of these definitions drifted behind later migrations and, applied
-- verbatim to a database that already had them, failed with
-- `42P16: cannot drop columns from view`. Postgres refusing is the only
-- reason the drift never silently reverted anything. They are reconciled
-- below so this file is safe to replay on a fresh OR an existing database,
-- in any order relative to the two migrations named:
--
--   v_jamb_programme_details      + skills_technical / skills_transferable /
--                                 skills_components, from
--                                 migration_jamb_skills_view.sql.
--                                 CREATE OR REPLACE may only APPEND columns,
--                                 so they must stay at the END of the list.
--   v_cutoffs_by_jamb_programme   - postutme_cutoff, from
--                                 migration_remove_postutme_from_cutoff_view.sql.
--
-- If you change either view, change it in BOTH files or the drift returns.

CREATE OR REPLACE VIEW skillup_dev.v_jamb_programme_details AS
SELECT
    jp.id AS jamb_programme_id,
    jp.jamb_name,
    jp.jamb_faculty,
    jp.degree_type,
    jp.is_blend,
    pm.programme_id,
    p.name AS canonical_programme_name,
    p.display_name,
    p.institution_type,
    p.discipline,
    pm.mapping_type,
    pm.mapping_note,
    pm.confidence,
    -- Appended, not inserted next to is_blend: reordering a view column is
    -- rejected with "cannot change name of view column".
    jp.skills_technical,
    jp.skills_transferable,
    jp.skills_components,
    p.qualification,
    p.duration_years
FROM skillup_dev.jamb_programmes jp
LEFT JOIN skillup_dev.programme_mapping pm ON pm.jamb_programme_id = jp.id
LEFT JOIN skillup_dev.programmes p ON p.id = pm.programme_id;
ALTER VIEW skillup_dev.v_jamb_programme_details SET (security_invoker = true);

CREATE OR REPLACE VIEW skillup_dev.v_school_jamb_programmes AS
SELECT
    sp.id AS school_programme_id,
    sp.school_id,
    s.name AS school_name,
    s.institution_type,
    sp.jamb_programme_id,
    jp.jamb_name,
    pm.programme_id,
    p.name AS canonical_programme_name,
    sp.utme_subjects,
    sp.olevel_requirement,
    sp.direct_entry,
    sp.remarks
FROM skillup_dev.school_programmes sp
JOIN skillup_dev.schools s ON s.id = sp.school_id
JOIN skillup_dev.jamb_programmes jp ON jp.id = sp.jamb_programme_id
LEFT JOIN skillup_dev.programme_mapping pm ON pm.jamb_programme_id = jp.id
LEFT JOIN skillup_dev.programmes p ON p.id = pm.programme_id;
ALTER VIEW skillup_dev.v_school_jamb_programmes SET (security_invoker = true);

CREATE OR REPLACE VIEW skillup_dev.v_jamb_programme_domain_paths AS
SELECT
    jp.id AS jamb_programme_id,
    jp.jamb_name,
    d.domain_key,
    d.name AS domain_name,
    d.cluster,
    jpd.match_type,
    d.elite_domain
FROM skillup_dev.jamb_programmes jp
JOIN skillup_dev.jamb_programme_domain jpd
  ON lower(jpd.jamb_name) = lower(jp.jamb_name)
JOIN skillup_dev.domains d ON d.id = jpd.domain_id;
ALTER VIEW skillup_dev.v_jamb_programme_domain_paths SET (security_invoker = true);

-- Dropped and recreated rather than CREATE OR REPLACE: a database that ran an
-- OLDER copy of this file has the view WITH postutme_cutoff, and replacing it
-- would be a column drop, which Postgres rejects (42P16). This mirrors what
-- migration_remove_postutme_from_cutoff_view.sql does, for the same reason.
-- Nothing depends on this view, so the drop is safe.
DROP VIEW IF EXISTS skillup_dev.v_cutoffs_by_jamb_programme;
CREATE VIEW skillup_dev.v_cutoffs_by_jamb_programme AS
SELECT
    psc.id,
    COALESCE(psc.jamb_programme_id, pm.jamb_programme_id) AS jamb_programme_id,
    jp.jamb_name,
    psc.programme_id,
    p.name AS canonical_programme_name,
    psc.school_id,
    s.name AS school_name,
    s.institution_type,
    psc.year,
    psc.aggregate_cutoff,
    psc.jamb_cutoff,
    -- postutme_cutoff intentionally omitted (UI-suppressed: not displayed).
    -- The base-table column stays for data preservation, but the API reads
    -- this view with select("*"), so omitting it here is what guarantees it
    -- can never reach a payload.
    psc.form,
    psc.source_url,
    psc.verified_at,
    psc.created_at
FROM skillup_dev.programme_school_cutoff psc
LEFT JOIN skillup_dev.programme_mapping pm ON pm.programme_id = psc.programme_id
LEFT JOIN skillup_dev.jamb_programmes jp ON jp.id = COALESCE(psc.jamb_programme_id, pm.jamb_programme_id)
LEFT JOIN skillup_dev.programmes p ON p.id = psc.programme_id
JOIN skillup_dev.schools s ON s.id = psc.school_id;
ALTER VIEW skillup_dev.v_cutoffs_by_jamb_programme SET (security_invoker = true);

-- ── 8. RLS stance ───────────────────────────────────────────
-- The current app talks to Supabase through FastAPI using the service-role
-- client. Enable RLS so direct anon/auth access is denied unless explicit
-- policies are added later.
ALTER TABLE skillup_dev.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.subject_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_starting_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_subject_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.programme_subject_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.programme_subject_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.search_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_pathway_choices ENABLE ROW LEVEL SECURITY;

-- Direct Supabase access is intentionally closed for the student pipeline.
-- FastAPI uses the service-role client and performs application-level auth.
-- If the app later moves selected reads directly to Supabase, add explicit
-- policies then; do not rely on table grants for sensitive student state.
REVOKE ALL ON TABLE skillup_dev.user_roles FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.expert_profiles FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.student_starting_points FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.student_subject_choices FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.student_pathway_choices FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.v_jamb_programme_details FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.v_school_jamb_programmes FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.v_jamb_programme_domain_paths FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.v_cutoffs_by_jamb_programme FROM anon, authenticated;

-- ============================================================
-- END migration_student_pipeline_live.sql
-- ============================================================
