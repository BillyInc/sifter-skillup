-- ============================================================
-- SIFTER LEVELUP — USER FEEDBACK (Phase 12)
-- Schema: skillup_dev
-- Additive migration: creates the user_feedback table that backs
-- the in-app ReviewModal + the admin Feedback Inbox.
-- All columns nullable except the surrogate id / created_at.
-- Idempotent: safe to re-run (IF NOT EXISTS everywhere).
-- ============================================================

-- ── 1. TABLE: user_feedback ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.user_feedback (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,                       -- author (nullable: guest / anonymous feedback allowed)
    type        TEXT,                       -- 'review' | 'bug' | 'suggestion' | 'mapping' | ...
    message     TEXT,                       -- free-text body
    entity_type TEXT,                       -- optional target kind ('programme'|'domain'|'role'|'app'...)
    entity_id   TEXT,                       -- optional target id (stringly-typed: mixes uuids + slugs)
    rating      SMALLINT,                   -- optional 1..5 star rating (from ReviewModal)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. INDEXES for the inbox query patterns ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at
    ON skillup_dev.user_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id
    ON skillup_dev.user_feedback (user_id);

-- ============================================================
-- END migration_user_feedback.sql
-- ============================================================
