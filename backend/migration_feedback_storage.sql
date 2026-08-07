-- ============================================================
-- Sifter LevelUp — Feedback storage (spec PART 6A)
--
-- WHY THIS EXISTS
-- ---------------
-- routes/feedback_routes.py reads and writes `skillup_dev.user_feedback`.
-- That table DOES NOT EXIST. The schema has an unrelated `skillup_dev.feedback`
-- (id, user_id, type, message, level, created_at) which nothing writes to and
-- which lacks entity_type / entity_id / rating entirely.
--
-- The insert therefore failed on every single submission. A broad `except` in
-- create_feedback swallowed the error and returned
--   {"success": false, "message": "Could not save your feedback right now."}
-- so the whole of PART 6A — student feedback, admin feedback, the outbound
-- reporting model — has been dead on arrival, quietly.
--
-- This creates the table the code has always expected, plus the
-- `student_category` CHECK from §6A.5 (enforced at the DB level, deliberately
-- not just an application whitelist like the loose `type` column).
--
-- The legacy `skillup_dev.feedback` table is left untouched: it holds 0 rows
-- and no code path references it, so dropping it is a separate decision that
-- does not need to ride along with a bug fix.
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.user_feedback (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ON DELETE SET NULL, not CASCADE: feedback is evidence for the Sifter
    -- team. A user deleting their account should not silently erase the bug
    -- report that account filed.
    user_id     UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    type        TEXT NOT NULL,
    message     TEXT,
    entity_type TEXT,
    entity_id   TEXT,
    rating      INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    -- §6A.5. Required for student submissions (enforced in the route, which
    -- knows the submitter's account_type); optional for admin/educator ones,
    -- which carry their own structure via the mapping-flag form (§6A.2).
    student_category TEXT CHECK (student_category IS NULL OR student_category IN (
        'mapping_wrong', 'data_outdated', 'bug', 'confusing',
        'missing_info', 'feature_request', 'praise', 'other'
    )),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The inbox reads newest-first, unfiltered or filtered by type (§6A.4).
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at
    ON skillup_dev.user_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type_created_at
    ON skillup_dev.user_feedback (type, created_at DESC);
-- Aggregating "what are students actually reporting on" is the whole reason
-- student_category is required (§6A.3).
CREATE INDEX IF NOT EXISTS idx_user_feedback_student_category
    ON skillup_dev.user_feedback (student_category, created_at DESC)
    WHERE student_category IS NOT NULL;

COMMIT;
