-- ============================================================
-- GUILD SYSTEM TABLES
-- Run after skillup_new_tables.sql
-- ============================================================

-- Guild messages (guild chat)
CREATE TABLE IF NOT EXISTS guild_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id     TEXT NOT NULL,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  username     TEXT NOT NULL DEFAULT 'Student',
  content      TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guild_messages_guild_id ON guild_messages(guild_id, created_at DESC);

-- Guild challenges (coordinated boss attempts)
CREATE TABLE IF NOT EXISTS guild_challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id        TEXT NOT NULL,
  initiator_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  boss_level_id   INT NOT NULL,
  track_id        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guild_challenges_guild ON guild_challenges(guild_id, created_at DESC);

-- XP events (for leaderboards and rewards)
CREATE TABLE IF NOT EXISTS xp_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,
  xp_amount    INT NOT NULL DEFAULT 0,
  source_id    TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id, created_at DESC);

-- User seen scenarios (prevents duplicate simulator scenarios)
CREATE TABLE IF NOT EXISTS user_seen_scenarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  lab_id      TEXT,
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);

-- Interview questions bank (deterministic scoring anchor)
-- Seeded by interview_questions_seed_v2.sql
CREATE TABLE IF NOT EXISTS interview_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id        TEXT NOT NULL,
  level           INT NOT NULL DEFAULT 1,
  question        TEXT NOT NULL,
  correct_answer  TEXT NOT NULL,
  scoring_criteria JSONB NOT NULL DEFAULT '[]',
  difficulty      TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_q_track ON interview_questions(track_id, level);

-- Starknet transactions (explorer-verifiable portfolio evidence)
CREATE TABLE IF NOT EXISTS starknet_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash      TEXT NOT NULL,
  network      TEXT NOT NULL DEFAULT 'sepolia',
  tx_type      TEXT NOT NULL,
  lab_id       TEXT,
  track_id     TEXT,
  simulator_id TEXT,
  explorer_url TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_starknet_tx_user ON starknet_transactions(user_id, created_at DESC);

-- Portfolio attributions (GitHub/LinkedIn push after boss)
CREATE TABLE IF NOT EXISTS portfolio_attributions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  platform_url TEXT,
  post_url     TEXT,
  boss_level   INT,
  track_id     TEXT,
  lab_id       TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_attributions(user_id, created_at DESC);

-- RLS policies
ALTER TABLE guild_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_challenges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seen_scenarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE starknet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_attributions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (backend uses service key)
-- Anon/authenticated users can read their own data
CREATE POLICY "Users read own xp_events"
  ON xp_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users read own starknet_transactions"
  ON starknet_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Guild members read guild messages"
  ON guild_messages FOR SELECT USING (true);

CREATE POLICY "Users read own portfolio"
  ON portfolio_attributions FOR SELECT USING (auth.uid() = user_id);

-- Add starknet columns to users table if not present
ALTER TABLE users ADD COLUMN IF NOT EXISTS starknet_address  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS starknet_auth     BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS starknet_email    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guild_id          TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guild_role        TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_stage          INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS merch_credits     INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_field_id   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_field_color TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_track_id  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_track_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_id         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_played       TIMESTAMPTZ;
