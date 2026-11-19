-- ============================================================
-- SIFTER — STUDENT SUBJECT GRADE SETS
-- STATUS: PROPOSED, NOT APPLIED.
--   Prepared file only. Do not run in the Supabase SQL Editor or psql without
--   explicit owner approval. It is not yet part of any apply order.
-- Schema: skillup_dev
-- Run AFTER: backend/migration_student_pipeline_live.sql
--   (needs skillup_dev.users and skillup_dev.student_starting_points).
--
-- Purpose:
--   Student-entered O-level grades, self-reported and append-only. Each change
--   inserts a NEW version row; earlier rows are only marked superseded, never
--   updated in place or deleted. A separate table is used because
--   POST /starting-point deletes and re-inserts student_subject_choices on every
--   save, so a column there would be silently overwritten.
--
-- Contract:
--   * grades = { "<subject_catalog.code>": "A1".."F9" }; the API validates codes
--     and grade values before insert.
--   * No UTME score/cut-off columns: UTME scores are not captured.
--   * Idempotent: safe to re-run.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.student_subject_grade_sets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    starting_point_id UUID REFERENCES skillup_dev.student_starting_points(id) ON DELETE SET NULL,
    version           INTEGER NOT NULL CHECK (version >= 1),
    exam_body         TEXT NOT NULL CHECK (exam_body IN ('waec', 'neco', 'other')),
    grades            JSONB NOT NULL DEFAULT '{}'::jsonb
                      CHECK (jsonb_typeof(grades) = 'object'),
    self_reported     BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    superseded_at     TIMESTAMPTZ,
    UNIQUE (user_id, version)
);

CREATE INDEX IF NOT EXISTS idx_student_subject_grade_sets_user_current
    ON skillup_dev.student_subject_grade_sets (user_id, version DESC)
    WHERE superseded_at IS NULL;

-- Deny-by-default, matching student_subject_choices: no policies. Access is only
-- through the FastAPI service client, which must filter every read/write by the
-- authenticated user's id. Add a `user_id = auth.uid()` policy separately if
-- direct client access is ever wanted.
ALTER TABLE skillup_dev.student_subject_grade_sets ENABLE ROW LEVEL SECURITY;

COMMIT;
