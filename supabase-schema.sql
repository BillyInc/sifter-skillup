-- ============================================================
-- SIFTER SKILL_UP — SUPABASE SCHEMA
-- Schema: sifter_dev
-- Run this in your Supabase SQL editor
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS sifter_dev.users (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id               BIGINT UNIQUE,
    wallet_address            TEXT UNIQUE,
    username                  TEXT,
    avatar_url                TEXT,
    auth_provider             TEXT NOT NULL DEFAULT 'guest',
    points                    INTEGER NOT NULL DEFAULT 1000,
    streak                    INTEGER NOT NULL DEFAULT 1,
    last_played               DATE NOT NULL DEFAULT CURRENT_DATE,
    current_level             INTEGER NOT NULL DEFAULT 1,
    completed_levels          TEXT[] NOT NULL DEFAULT '{}',
    perfect_levels            TEXT[] NOT NULL DEFAULT '{}',
    python_chapters_completed TEXT[] NOT NULL DEFAULT '{}',
    active_track              TEXT NOT NULL DEFAULT 'crypto',
    boosters                  JSONB NOT NULL DEFAULT '{"hammer":3,"lightning":2,"shuffle":5}',
    achievements              TEXT[] NOT NULL DEFAULT '{}',
    guild_id                  UUID,
    guild_role                TEXT DEFAULT 'member',
    is_verified               BOOLEAN NOT NULL DEFAULT false,
    settings                  JSONB NOT NULL DEFAULT '{"notifications":true,"sound":true,"haptics":true}',
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_points      ON sifter_dev.users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON sifter_dev.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet      ON sifter_dev.users(wallet_address);

-- GAME STATES
CREATE TABLE IF NOT EXISTS sifter_dev.game_states (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    state      JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- LEVEL SCORES
CREATE TABLE IF NOT EXISTS sifter_dev.level_scores (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    level        INTEGER NOT NULL,
    score        INTEGER NOT NULL,
    stars        INTEGER NOT NULL DEFAULT 1,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, level)
);
CREATE INDEX IF NOT EXISTS idx_level_scores_level ON sifter_dev.level_scores(level);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS sifter_dev.transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    type          TEXT NOT NULL,
    amount        INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WITHDRAWALS
CREATE TABLE IF NOT EXISTS sifter_dev.withdrawals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    points_used  INTEGER NOT NULL,
    method       TEXT NOT NULL,
    destination  TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GUILDS
CREATE TABLE IF NOT EXISTS sifter_dev.guilds (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL UNIQUE,
    description      TEXT,
    icon             TEXT,
    owner_id         UUID REFERENCES sifter_dev.users(id),
    is_private       BOOLEAN NOT NULL DEFAULT false,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    min_level        INTEGER NOT NULL DEFAULT 1,
    member_count     INTEGER NOT NULL DEFAULT 1,
    total_points     BIGINT NOT NULL DEFAULT 0,
    rank             INTEGER,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sifter_dev.guild_members (
    guild_id            UUID NOT NULL REFERENCES sifter_dev.guilds(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    role                TEXT NOT NULL DEFAULT 'member',
    points_contributed  INTEGER NOT NULL DEFAULT 0,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (guild_id, user_id)
);

-- FEEDBACK
CREATE TABLE IF NOT EXISTS sifter_dev.feedback (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES sifter_dev.users(id) ON DELETE SET NULL,
    type       TEXT NOT NULL,
    message    TEXT,
    level      INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANALYTICS
CREATE TABLE IF NOT EXISTS sifter_dev.analytics_events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES sifter_dev.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS sifter_dev.notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT,
    read       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VIEWS
CREATE OR REPLACE VIEW sifter_dev.user_progress AS
SELECT id, username, current_level, points, streak,
       array_length(completed_levels, 1) AS levels_completed,
       array_length(python_chapters_completed, 1) AS python_chapters,
       active_track, created_at
FROM sifter_dev.users ORDER BY points DESC;

-- RANK FUNCTION
CREATE OR REPLACE FUNCTION sifter_dev.get_user_rank(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER + 1
    FROM sifter_dev.users
    WHERE points > (SELECT points FROM sifter_dev.users WHERE id = user_id);
$$ LANGUAGE SQL STABLE;

-- Add GitHub columns to users table
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_token     TEXT;
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_username  TEXT;
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_avatar    TEXT;

-- ROW LEVEL SECURITY
ALTER TABLE sifter_dev.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.game_states     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.level_scores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.withdrawals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.notifications   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own"       ON sifter_dev.users       FOR ALL USING (auth.uid() = id);
CREATE POLICY "game_states_own" ON sifter_dev.game_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "scores_own"      ON sifter_dev.level_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tx_own"          ON sifter_dev.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "withdrawals_own" ON sifter_dev.withdrawals  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notif_own"       ON sifter_dev.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "feedback_insert" ON sifter_dev.feedback FOR INSERT WITH CHECK (true);
