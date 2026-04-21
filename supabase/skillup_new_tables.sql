-- ============================================================
-- skillup_new_tables.sql
-- Sifter SkillUp — New tables for Starknet track scoring
-- Schema: skillup_dev
--
-- Run in Supabase SQL Editor
-- Depends on: existing skillup_dev.users table
-- ============================================================

-- ─── Boss Sessions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skillup_dev.boss_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  lab_id            TEXT        NOT NULL,
  track_id          TEXT        NOT NULL,
  phase             INTEGER     NOT NULL CHECK (phase IN (1, 2)),
  -- Phase 1 fields
  tasks             JSONB,      -- array of {index, text, original_index}
  hints_enabled     BOOLEAN     DEFAULT TRUE,
  -- Phase 2 fields
  scenario          TEXT,
  scoring_criteria  JSONB,      -- string[]
  -- Common
  answers           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  pass_threshold    FLOAT       NOT NULL DEFAULT 0.7,
  attempt_number    INTEGER     DEFAULT 1,
  status            TEXT        NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_passed    BOOLEAN,
  xp_earned         INTEGER,
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_boss_sessions_user
  ON skillup_dev.boss_sessions(user_id, lab_id, phase);

CREATE INDEX IF NOT EXISTS idx_boss_sessions_status
  ON skillup_dev.boss_sessions(user_id, status);

-- ─── Interview Questions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skillup_dev.interview_questions (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id         TEXT     NOT NULL,
  level            TEXT     NOT NULL CHECK (level IN ('junior', 'intermediate', 'senior')),
  question         TEXT     NOT NULL,
  type             TEXT     DEFAULT 'open'
                   CHECK (type IN ('calculation', 'explanation', 'code', 'technical', 'analysis',
                                   'judgment', 'risk-assessment', 'strategy', 'portfolio',
                                   'comparison', 'architecture', 'security', 'process',
                                   'research', 'evaluation', 'investment', 'open')),
  scoring_criteria JSONB,   -- string[]
  difficulty       INTEGER  DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  tags             TEXT[],
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_track_level
  ON skillup_dev.interview_questions(track_id, level);

CREATE INDEX IF NOT EXISTS idx_interview_questions_difficulty
  ON skillup_dev.interview_questions(track_id, level, difficulty);

CREATE INDEX IF NOT EXISTS idx_interview_questions_tags
  ON skillup_dev.interview_questions USING GIN(tags);

-- ─── Interview Sessions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skillup_dev.interview_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  track_id        TEXT        NOT NULL,
  level           TEXT        NOT NULL,
  questions       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  answers         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  status          TEXT        NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_passed  BOOLEAN,
  questions_passed INTEGER,
  xp_earned       INTEGER     DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user
  ON skillup_dev.interview_sessions(user_id, track_id, level);

-- ─── Aggregate Simulation Completion ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skillup_dev.agg_sim_completions (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  lab_id        TEXT    NOT NULL,
  sim_index     INTEGER NOT NULL,
  passed        BOOLEAN NOT NULL,
  score         INTEGER,
  total         INTEGER,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lab_id, sim_index)
);

CREATE INDEX IF NOT EXISTS idx_agg_sim_user_lab
  ON skillup_dev.agg_sim_completions(user_id, lab_id);

-- ─── Progress tracking augmentation ──────────────────────────────────────────
-- Add columns to users table if not present (safe to run multiple times)

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS starknet_track_progress JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS boss_completions         JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS phase2_unlocked          JSONB DEFAULT '{}'::jsonb;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE skillup_dev.boss_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.agg_sim_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY IF NOT EXISTS boss_sessions_user_policy
  ON skillup_dev.boss_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS interview_sessions_user_policy
  ON skillup_dev.interview_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS agg_sim_user_policy
  ON skillup_dev.agg_sim_completions FOR ALL
  USING (user_id = auth.uid());

-- Interview questions are readable by all authenticated users
ALTER TABLE skillup_dev.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS interview_questions_read_policy
  ON skillup_dev.interview_questions FOR SELECT
  TO authenticated USING (true);

-- ─── Verification queries ─────────────────────────────────────────────────────
-- Run after migration:

-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'skillup_dev'
-- ORDER BY table_name;

-- SELECT track_id, level, COUNT(*) as questions
-- FROM skillup_dev.interview_questions
-- GROUP BY track_id, level
-- ORDER BY track_id, level;
