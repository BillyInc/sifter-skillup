-- Clean Sociology curriculum contract.
--
-- Apply after migration_career_base_registry.sql and migration_career_pilot.sql
-- (the programmes table must exist), and before any guidance seed that reads
-- programme curriculum outcomes. This is additive and does not alter or delete
-- the legacy skills_profile JSONB fields.

BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.programme_curriculum_outcomes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id        UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    outcome_id          TEXT NOT NULL,
    course_code         TEXT NOT NULL,
    course_title        TEXT NOT NULL,
    course_level        INTEGER,
    display_group       TEXT NOT NULL DEFAULT 'sociology_programme',
    outcome_index       INTEGER NOT NULL,
    source_text         TEXT NOT NULL,
    student_text        TEXT NOT NULL,
    source_locator      JSONB NOT NULL DEFAULT '{}'::jsonb,
    student_display     BOOLEAN NOT NULL DEFAULT TRUE,
    data_state          TEXT NOT NULL DEFAULT 'source_backed',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, outcome_id),
    CHECK (data_state IN ('source_backed', 'review_only', 'excluded'))
    ,CHECK (display_group IN ('sociology_programme', 'supporting_social_sciences', 'shared_university'))
);

ALTER TABLE skillup_dev.programme_curriculum_outcomes
    ADD COLUMN IF NOT EXISTS display_group TEXT NOT NULL DEFAULT 'sociology_programme';

ALTER TABLE skillup_dev.programme_curriculum_outcomes
    DROP CONSTRAINT IF EXISTS programme_curriculum_outcomes_display_group_check;

ALTER TABLE skillup_dev.programme_curriculum_outcomes
    ADD CONSTRAINT programme_curriculum_outcomes_display_group_check
    CHECK (display_group IN ('sociology_programme', 'supporting_social_sciences', 'shared_university'));

CREATE INDEX IF NOT EXISTS idx_programme_curriculum_outcomes_programme
    ON skillup_dev.programme_curriculum_outcomes(programme_id, course_level, course_code, outcome_index);

CREATE TABLE IF NOT EXISTS skillup_dev.programme_abilities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id        UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    ability_id          TEXT NOT NULL,
    display_title       TEXT NOT NULL DEFAULT 'Use what you learn',
    source_text         TEXT NOT NULL,
    student_text        TEXT NOT NULL,
    source_locator      JSONB NOT NULL DEFAULT '{}'::jsonb,
    student_display     BOOLEAN NOT NULL DEFAULT TRUE,
    data_state          TEXT NOT NULL DEFAULT 'source_backed',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, ability_id),
    CHECK (data_state IN ('source_backed', 'review_only', 'excluded'))
);

ALTER TABLE skillup_dev.programme_abilities
    ADD COLUMN IF NOT EXISTS display_title TEXT NOT NULL DEFAULT 'Use what you learn';

CREATE INDEX IF NOT EXISTS idx_programme_abilities_programme
    ON skillup_dev.programme_abilities(programme_id, ability_id);

COMMENT ON TABLE skillup_dev.programme_curriculum_outcomes IS
    'Course-scoped CCMAS outcomes. Student text is derived from the same source wording after appended audit annotations are removed.';
COMMENT ON TABLE skillup_dev.programme_abilities IS
    'Explicit programme-level employability/ways-of-working records. They are separate from course outcomes and never become domain foundations.';

COMMIT;
