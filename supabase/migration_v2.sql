-- ============================================================
-- SIFTER SKILL_UP — COMPLETE MIGRATION v2
-- Run AFTER existing supabase-schema.sql
-- Adds ALL tables needed across the full upgrade
-- Includes: interview sessions, push tokens, content cache,
--           sync log, device sessions, XP events, badges,
--           feed, challenges, social, portfolio attributions,
--           starknet txs, merch, notifications, referrals
-- ============================================================

-- ── 1. EXTEND USERS TABLE ────────────────────────────────────
ALTER TABLE sifter_dev.users
  ADD COLUMN IF NOT EXISTS email                TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash        TEXT,
  ADD COLUMN IF NOT EXISTS starknet_address     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS starknet_auth        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS starknet_email       TEXT,
  ADD COLUMN IF NOT EXISTS github_token         TEXT,
  ADD COLUMN IF NOT EXISTS github_username      TEXT,
  ADD COLUMN IF NOT EXISTS github_avatar        TEXT,
  ADD COLUMN IF NOT EXISTS active_field_id      TEXT,
  ADD COLUMN IF NOT EXISTS active_field_color   TEXT,
  ADD COLUMN IF NOT EXISTS current_track_id     TEXT,
  ADD COLUMN IF NOT EXISTS current_track_name   TEXT,
  ADD COLUMN IF NOT EXISTS xp_stage             INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS merch_credits        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code        TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  ADD COLUMN IF NOT EXISTS last_position        JSONB,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_starknet ON sifter_dev.users(starknet_address);
CREATE INDEX IF NOT EXISTS idx_users_email    ON sifter_dev.users(email);

-- ── 2. DEVICE SESSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.active_sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    device_id    TEXT NOT NULL,
    device_name  TEXT NOT NULL DEFAULT 'Unknown device',
    platform     TEXT NOT NULL DEFAULT 'unknown',
    app_version  TEXT,
    push_token   TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sifter_dev.active_sessions(user_id, is_active);

-- ── 3. PUSH TOKENS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.push_tokens (
    user_id    UUID PRIMARY KEY REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    token      TEXT NOT NULL,
    platform   TEXT NOT NULL DEFAULT 'unknown',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. OFFLINE SYNC LOG ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.sync_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id     TEXT NOT NULL,
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    endpoint    TEXT NOT NULL,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_sync_log_user ON sifter_dev.sync_log(user_id, applied_at);

-- ── 5. XP EVENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.xp_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL,
    xp_amount   INTEGER NOT NULL DEFAULT 0,
    source_id   TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON sifter_dev.xp_events(user_id, created_at DESC);

-- ── 6. BADGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.badges (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    icon        TEXT NOT NULL,
    xp_reward   INTEGER NOT NULL DEFAULT 0,
    rarity      TEXT NOT NULL DEFAULT 'common',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sifter_dev.badges (id, name, description, icon, xp_reward, rarity, sort_order) VALUES
  ('first_level',       'First Step',           'Complete your very first lesson',                   '🎯', 50,   'common',    1),
  ('week_warrior',      'Week Warrior',          'Maintain a 7-day streak',                           '🔥', 200,  'rare',      2),
  ('month_master',      'Month Master',          'Maintain a 30-day streak',                          '🌟', 500,  'epic',      3),
  ('boss_slayer',       'Boss Slayer',           'Defeat a boss level',                               '⚔️', 150, 'rare',      4),
  ('lab_grad',          'Lab Graduate',          'Complete a full lab',                               '🎓', 200,  'common',    5),
  ('track_certified',   'Track Certified',       'Complete an entire track',                          '🏆', 1000, 'legendary', 6),
  ('social_sharer',     'Social Sharer',         'Share your first achievement',                      '📢', 75,   'common',    7),
  ('portfolio_builder', 'Portfolio Builder',     'Push your first portfolio artifact',                '💼', 200,  'rare',      8),
  ('onchain_citizen',   'On-Chain Citizen',      'Execute your first Starknet transaction',           '⚡', 250,  'rare',      9),
  ('island_1',          'Bitcoin Bay Explorer',  'Complete Island 1',                                 '₿',  100,  'common',   10),
  ('github_portfolio',  'GitHub Deployer',       'Push portfolio to GitHub',                          '🐙', 200,  'rare',     11),
  ('starknet_grad',     'Starknet Graduate',     'Complete the Starknet World island',                '⚡', 500,  'epic',     12),
  ('defi_navigator',    'DeFi Navigator',        'Complete the DeFi Navigator certification',         '🧭', 1000, 'legendary',13)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS sifter_dev.user_badges (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    badge_id   TEXT NOT NULL REFERENCES sifter_dev.badges(id),
    reason     TEXT,
    earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON sifter_dev.user_badges(user_id);

-- ── 7. CONTENT CACHE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.content_cache (
    id            TEXT PRIMARY KEY,
    content_type  TEXT NOT NULL,
    content_key   TEXT NOT NULL,
    data          JSONB NOT NULL DEFAULT '{}',
    synced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_cache_type_key ON sifter_dev.content_cache(content_type, content_key);

CREATE TABLE IF NOT EXISTS sifter_dev.sync_meta (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. FEED ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.feed_items (
    id              UUID PRIMARY KEY,
    track_id        TEXT NOT NULL,
    title           TEXT NOT NULL,
    summary         TEXT,
    url             TEXT NOT NULL UNIQUE,
    source          TEXT,
    image_url       TEXT,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_published    BOOLEAN NOT NULL DEFAULT true,
    like_count      INTEGER NOT NULL DEFAULT 0,
    bookmark_count  INTEGER NOT NULL DEFAULT 0,
    share_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feed_items_track ON sifter_dev.feed_items(track_id, published_at DESC);

CREATE TABLE IF NOT EXISTS sifter_dev.feed_interactions (
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    item_id    UUID NOT NULL,
    reaction   TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, item_id, reaction)
);

CREATE TABLE IF NOT EXISTS sifter_dev.track_subscriptions (
    user_id    UUID PRIMARY KEY REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    track_ids  TEXT[] NOT NULL DEFAULT '{}',
    field_ids  TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. CHALLENGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.challenges (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT NOT NULL,
    description    TEXT,
    track_id       TEXT,
    challenge_type TEXT NOT NULL DEFAULT 'skill',
    xp_reward      INTEGER NOT NULL DEFAULT 500,
    status         TEXT NOT NULL DEFAULT 'active',
    starts_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON sifter_dev.challenges(status, ends_at);

CREATE TABLE IF NOT EXISTS sifter_dev.challenge_participants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id  UUID NOT NULL REFERENCES sifter_dev.challenges(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'in_progress',
    submission    JSONB,
    joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at  TIMESTAMPTZ,
    UNIQUE(challenge_id, user_id)
);

-- ── 10. SOCIAL SHARES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.social_shares (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    platform     TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_id   TEXT NOT NULL,
    url          TEXT,
    xp_awarded   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON sifter_dev.social_shares(user_id, created_at DESC);

-- ── 11. PORTFOLIO ATTRIBUTIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.portfolio_attributions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    platform    TEXT NOT NULL,
    url         TEXT,
    track_id    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. STARKNET TRANSACTIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.starknet_transactions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    tx_hash      TEXT NOT NULL,
    network      TEXT NOT NULL DEFAULT 'sepolia',
    tx_type      TEXT NOT NULL,
    lesson_id    TEXT,
    lab_id       TEXT,
    amount       TEXT,
    token        TEXT,
    explorer_url TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_starknet_tx_user ON sifter_dev.starknet_transactions(user_id, created_at DESC);

-- ── 13. MERCHANDISE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.merchandise_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    description  TEXT,
    image_url    TEXT,
    credit_cost  INTEGER NOT NULL,
    available    BOOLEAN NOT NULL DEFAULT true,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sifter_dev.merchandise_orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    item_id       UUID NOT NULL REFERENCES sifter_dev.merchandise_items(id),
    credits_used  INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    shipping_info JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 14. NOTIFICATION PREFERENCES ──────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.notification_prefs (
    user_id          UUID PRIMARY KEY REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    streak_reminders BOOLEAN NOT NULL DEFAULT true,
    badge_alerts     BOOLEAN NOT NULL DEFAULT true,
    guild_activity   BOOLEAN NOT NULL DEFAULT true,
    feed_updates     BOOLEAN NOT NULL DEFAULT false,
    marketing        BOOLEAN NOT NULL DEFAULT false,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 15. REFERRALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.referrals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id  UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    referee_id   UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    code         TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referee_id)
);

-- ── 16. INTERVIEW SESSIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS sifter_dev.interview_sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    track_id     TEXT NOT NULL,
    level        TEXT NOT NULL,
    questions    JSONB NOT NULL DEFAULT '[]',
    answers      JSONB NOT NULL DEFAULT '[]',
    status       TEXT NOT NULL DEFAULT 'in_progress',
    score        INTEGER,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_interview_user ON sifter_dev.interview_sessions(user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS sifter_dev.interview_questions (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id  TEXT NOT NULL,
    level     TEXT NOT NULL,
    question  TEXT NOT NULL,
    type      TEXT NOT NULL DEFAULT 'open',
    tags      TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_q_track ON sifter_dev.interview_questions(track_id, level);

-- ── HELPER FUNCTIONS ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION sifter_dev.get_user_rank(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*) + 1
  FROM sifter_dev.users
  WHERE points > (SELECT points FROM sifter_dev.users WHERE id = user_id)
$$ LANGUAGE sql STABLE;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE sifter_dev.active_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.sync_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.xp_events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.user_badges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.feed_interactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.track_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.social_shares         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.portfolio_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.merchandise_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.starknet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.notification_prefs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.referrals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.interview_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.push_tokens           ENABLE ROW LEVEL SECURITY;

-- User-scoped read policies
CREATE POLICY "users_own_sessions"    ON sifter_dev.active_sessions       FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_xp"          ON sifter_dev.xp_events             FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_badges"      ON sifter_dev.user_badges           FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_subs"        ON sifter_dev.track_subscriptions   FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_orders"      ON sifter_dev.merchandise_orders    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_starknet_tx" ON sifter_dev.starknet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_prefs"       ON sifter_dev.notification_prefs    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_interviews"  ON sifter_dev.interview_sessions    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_push_tokens" ON sifter_dev.push_tokens           FOR SELECT USING (auth.uid() = user_id);

-- Public read policies
CREATE POLICY "public_read_badges"     ON sifter_dev.badges               FOR SELECT USING (true);
CREATE POLICY "public_read_challenges" ON sifter_dev.challenges           FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_feed"       ON sifter_dev.feed_items           FOR SELECT USING (is_published = true);
CREATE POLICY "public_read_merch"      ON sifter_dev.merchandise_items    FOR SELECT USING (available = true);
CREATE POLICY "public_read_content"    ON sifter_dev.content_cache        FOR SELECT USING (true);
