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

-- ============================================================
-- SIFTER SKILL_UP — Missing Tables (added in synthesis pass)
-- Run after existing schema
-- ============================================================

-- USER LAST POSITION (resume from exact lesson/simulator)
CREATE TABLE IF NOT EXISTS sifter_dev.user_last_position (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    track_name TEXT,
    level TEXT,
    lab_id TEXT NOT NULL,
    lab_title TEXT,
    lesson_id TEXT NOT NULL,
    lesson_title TEXT,
    lesson_index INT DEFAULT 0,
    lab_index INT DEFAULT 0,
    simulator_state JSONB,
    saved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_last_position_user ON sifter_dev.user_last_position(user_id);

-- CONTENT FLAGS (lesson/question/simulation flagging)
CREATE TABLE IF NOT EXISTS sifter_dev.content_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sifter_dev.users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL,  -- 'lesson' | 'question' | 'simulation' | 'track'
    content_id TEXT NOT NULL,
    track_id TEXT,
    reason TEXT NOT NULL,        -- 'incorrect' | 'outdated' | 'offensive' | 'other'
    detail TEXT,
    status TEXT DEFAULT 'open',  -- 'open' | 'reviewed' | 'resolved' | 'dismissed'
    reviewer_id UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_flags_content ON sifter_dev.content_flags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON sifter_dev.content_flags(status);

-- APP REVIEWS (in-app rating + NPS)
CREATE TABLE IF NOT EXISTS sifter_dev.app_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sifter_dev.users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    context TEXT,                -- 'level_complete' | 'streak_milestone' | 'prompted'
    redirected_to_store BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add review tracking columns to users
ALTER TABLE sifter_dev.users
    ADD COLUMN IF NOT EXISTS has_reviewed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_rating INT;

-- PUSH TOKENS (Expo / APNs / FCM device tokens)
CREATE TABLE IF NOT EXISTS sifter_dev.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT DEFAULT 'expo',  -- 'expo' | 'apns' | 'fcm'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON sifter_dev.push_tokens(user_id);

-- NOTIFICATION PREFERENCES (per-user channel and timing settings)
CREATE TABLE IF NOT EXISTS sifter_dev.notification_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    push BOOLEAN DEFAULT TRUE,
    sms BOOLEAN DEFAULT FALSE,
    email BOOLEAN DEFAULT FALSE,
    hour_local INT DEFAULT 20 CHECK (hour_local BETWEEN 0 AND 23),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- GUILD POSTS (community feed)
CREATE TABLE IF NOT EXISTS sifter_dev.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    guild_id UUID REFERENCES sifter_dev.guilds(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    field TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_guild ON sifter_dev.posts(guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON sifter_dev.posts(user_id);

-- POST LIKES
CREATE TABLE IF NOT EXISTS sifter_dev.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON sifter_dev.post_likes(post_id);

-- GUILD PROJECTS (collaborative learning challenges)
CREATE TABLE IF NOT EXISTS sifter_dev.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES sifter_dev.guilds(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES sifter_dev.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    field TEXT,
    status TEXT DEFAULT 'open',   -- 'open' | 'in_progress' | 'complete' | 'archived'
    max_members INT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_guild ON sifter_dev.projects(guild_id);

-- PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS sifter_dev.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES sifter_dev.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON sifter_dev.project_members(project_id);

-- RLS policies for new tables (mirrors existing pattern)
ALTER TABLE sifter_dev.user_last_position ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_position" ON sifter_dev.user_last_position
    FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_own_tokens" ON sifter_dev.push_tokens
    FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_own_notif_prefs" ON sifter_dev.notification_prefs
    FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "posts_readable_by_all" ON sifter_dev.posts
    FOR SELECT USING (true);
CREATE POLICY "posts_writable_by_owner" ON sifter_dev.posts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "likes_by_owner" ON sifter_dev.post_likes
    FOR ALL USING (auth.uid()::text = user_id::text);

-- ── Social Platform Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sifter_dev.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON sifter_dev.post_comments(post_id, created_at DESC);

-- Add quotes + comments count to posts
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS quote_count INT DEFAULT 0;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES sifter_dev.posts(id) ON DELETE SET NULL;

-- Bookmarks
CREATE TABLE IF NOT EXISTS sifter_dev.bookmark_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📁',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sifter_dev.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    folder_id TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON sifter_dev.bookmarks(user_id, folder_id);

-- Friends
CREATE TABLE IF NOT EXISTS sifter_dev.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',  -- pending | accepted | declined
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, target_id)
);

CREATE TABLE IF NOT EXISTS sifter_dev.friends (
    user_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, friend_id)
);
CREATE INDEX IF NOT EXISTS idx_friends_user ON sifter_dev.friends(user_id);

-- Helper RPCs for atomic counters
CREATE OR REPLACE FUNCTION sifter_dev.increment_post_comments(post_id UUID)
RETURNS VOID AS $$ UPDATE sifter_dev.posts SET comment_count = comment_count + 1 WHERE id = post_id; $$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION sifter_dev.increment_post_quotes(post_id UUID)
RETURNS VOID AS $$ UPDATE sifter_dev.posts SET quote_count = quote_count + 1 WHERE id = post_id; $$ LANGUAGE SQL;

-- RLS
ALTER TABLE sifter_dev.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_readable_all" ON sifter_dev.post_comments FOR SELECT USING (true);
CREATE POLICY "comments_writable_owner" ON sifter_dev.post_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "bookmarks_owner" ON sifter_dev.bookmarks FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "friends_owner" ON sifter_dev.friends FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================================
-- COMMUNITY V2 — Social platform tables
-- Run in Supabase SQL editor after initial schema
-- ============================================================

-- POST REACTIONS (replaces post_likes — supports 6 reaction types)
CREATE TABLE IF NOT EXISTS sifter_dev.post_reactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,  -- '❤️' | '🔥' | '💡' | '🏆' | '😂' | '👀'
    count         INTEGER NOT NULL DEFAULT 0,
    UNIQUE(post_id, reaction_type)
);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON sifter_dev.post_reactions(post_id);

-- PER-USER REACTIONS (for "did I react to this?" and toggle logic)
CREATE TABLE IF NOT EXISTS sifter_dev.post_user_reactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- POLLS
CREATE TABLE IF NOT EXISTS sifter_dev.post_polls (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    options     JSONB NOT NULL DEFAULT '[]',  -- [{id, text, votes}]
    total_votes INTEGER NOT NULL DEFAULT 0,
    ends_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id)
);

CREATE TABLE IF NOT EXISTS sifter_dev.poll_votes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    UUID NOT NULL REFERENCES sifter_dev.post_polls(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL,
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    option_id  TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- HASHTAGS (denormalised for fast trending queries)
CREATE TABLE IF NOT EXISTS sifter_dev.post_hashtags (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    tag        TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_tag        ON sifter_dev.post_hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_created_at ON sifter_dev.post_hashtags(created_at DESC);

-- POST REPORTS (moderation queue)
CREATE TABLE IF NOT EXISTS sifter_dev.post_reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES sifter_dev.posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    reason      TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'resolved' | 'dismissed'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FOLLOWS (replaces friends — asymmetric follow model like Twitter/Instagram)
CREATE TABLE IF NOT EXISTS sifter_dev.follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON sifter_dev.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON sifter_dev.follows(following_id);

-- FOLLOW REQUESTS (for private accounts)
CREATE TABLE IF NOT EXISTS sifter_dev.follow_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    target_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approve' | 'reject'
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, target_id)
);

-- BLOCKS
CREATE TABLE IF NOT EXISTS sifter_dev.user_blocks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    target_id  UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_id)
);

-- MUTES
CREATE TABLE IF NOT EXISTS sifter_dev.user_mutes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    target_id  UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_id)
);

-- PRIVATE ACCOUNT FLAG — add to users table
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- DIRECT MESSAGES
CREATE TABLE IF NOT EXISTS sifter_dev.dm_threads (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dm_threads_updated ON sifter_dev.dm_threads(updated_at DESC);

CREATE TABLE IF NOT EXISTS sifter_dev.thread_participants (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES sifter_dev.dm_threads(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    UNIQUE(thread_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON sifter_dev.thread_participants(user_id);

CREATE TABLE IF NOT EXISTS sifter_dev.dm_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id  UUID NOT NULL REFERENCES sifter_dev.dm_threads(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON sifter_dev.dm_messages(thread_id, created_at DESC);

-- NOTIFICATIONS — extend existing table with extra_data and reaction support
ALTER TABLE sifter_dev.notifications ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES sifter_dev.users(id);
ALTER TABLE sifter_dev.notifications ADD COLUMN IF NOT EXISTS extra_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE sifter_dev.notifications ADD COLUMN IF NOT EXISTS post_snippet TEXT;
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON sifter_dev.notifications(recipient_id, created_at DESC);

-- SCENARIO UNIQUENESS — tracks which boss/aggregate scenarios each user has seen
CREATE TABLE IF NOT EXISTS sifter_dev.user_seen_scenarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    lab_id      TEXT,
    seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, scenario_id)
);
CREATE INDEX IF NOT EXISTS idx_seen_scenarios_user ON sifter_dev.user_seen_scenarios(user_id);

-- POSTS — add missing columns for new features
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS mentions TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS quote_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';
ALTER TABLE sifter_dev.posts ADD COLUMN IF NOT EXISTS track_context TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_created_at    ON sifter_dev.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id       ON sifter_dev.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags      ON sifter_dev.posts USING GIN(hashtags);

-- PORTFOLIO ARTIFACTS (for portfolio push from boss battles)
CREATE TABLE IF NOT EXISTS sifter_dev.portfolio_artifacts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    track_id     TEXT NOT NULL,
    track_name   TEXT NOT NULL,
    lab_id       TEXT NOT NULL,
    lab_title    TEXT NOT NULL,
    level        TEXT NOT NULL,  -- 'junior' | 'intermediate' | 'senior'
    skill        TEXT NOT NULL,
    framework    TEXT,
    badge_earned TEXT NOT NULL,
    user_work    TEXT NOT NULL,   -- actual user submission (not a template)
    score        INTEGER NOT NULL,
    total        INTEGER NOT NULL,
    overall_feedback TEXT,
    platforms_pushed TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artifacts_user ON sifter_dev.portfolio_artifacts(user_id);

-- ── RLS Policies ──────────────────────────────────────────────────────────────
-- Enable Row Level Security on all new tables

ALTER TABLE sifter_dev.post_user_reactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.follows              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.follow_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.user_blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.user_mutes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.dm_threads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.thread_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.dm_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.user_seen_scenarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.portfolio_artifacts  ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own DMs
CREATE POLICY dm_participant_read  ON sifter_dev.dm_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM sifter_dev.thread_participants WHERE thread_id = dm_messages.thread_id AND user_id = auth.uid())
);
CREATE POLICY dm_participant_insert ON sifter_dev.dm_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can only read/write their own seen scenarios
CREATE POLICY seen_scenarios_own ON sifter_dev.user_seen_scenarios FOR ALL USING (user_id = auth.uid());

-- Users can only see their own portfolio artifacts
CREATE POLICY artifacts_own ON sifter_dev.portfolio_artifacts FOR ALL USING (user_id = auth.uid());

-- ── Helper functions ──────────────────────────────────────────────────────────

-- Trending hashtags function
CREATE OR REPLACE FUNCTION sifter_dev.get_trending_hashtags(hours_back INT DEFAULT 48, limit_n INT DEFAULT 12)
RETURNS TABLE(tag TEXT, "postCount" BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT ph.tag, COUNT(*) AS cnt
    FROM sifter_dev.post_hashtags ph
    WHERE ph.created_at > NOW() - (hours_back || ' hours')::INTERVAL
    GROUP BY ph.tag
    ORDER BY cnt DESC
    LIMIT limit_n;
END;
$$ LANGUAGE plpgsql;

-- Increment reaction count
CREATE OR REPLACE FUNCTION sifter_dev.increment_reaction(p_post_id UUID, p_reaction TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO sifter_dev.post_reactions(post_id, reaction_type, count)
    VALUES (p_post_id, p_reaction, 1)
    ON CONFLICT (post_id, reaction_type)
    DO UPDATE SET count = sifter_dev.post_reactions.count + 1;
END;
$$ LANGUAGE plpgsql;

-- Decrement reaction count
CREATE OR REPLACE FUNCTION sifter_dev.decrement_reaction(p_post_id UUID, p_reaction TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE sifter_dev.post_reactions
    SET count = GREATEST(count - 1, 0)
    WHERE post_id = p_post_id AND reaction_type = p_reaction;
END;
$$ LANGUAGE plpgsql;

-- Replace reaction (remove old, add new)
CREATE OR REPLACE FUNCTION sifter_dev.replace_reaction(p_post_id UUID, p_old TEXT, p_new TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE sifter_dev.post_reactions SET count = GREATEST(count - 1, 0) WHERE post_id = p_post_id AND reaction_type = p_old;
    INSERT INTO sifter_dev.post_reactions(post_id, reaction_type, count) VALUES (p_post_id, p_new, 1)
    ON CONFLICT (post_id, reaction_type) DO UPDATE SET count = sifter_dev.post_reactions.count + 1;
END;
$$ LANGUAGE plpgsql;

-- Increment poll vote
CREATE OR REPLACE FUNCTION sifter_dev.increment_poll_vote(p_poll_id UUID, p_option_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE sifter_dev.post_polls
    SET total_votes = total_votes + 1,
        options = (
            SELECT jsonb_agg(
                CASE WHEN (elem->>'id') = p_option_id
                THEN jsonb_set(elem, '{votes}', to_jsonb((elem->>'votes')::int + 1))
                ELSE elem END
            )
            FROM jsonb_array_elements(options) AS elem
        )
    WHERE id = p_poll_id;
END;
$$ LANGUAGE plpgsql;

-- Supabase Realtime — enable for community tables
ALTER PUBLICATION supabase_realtime ADD TABLE sifter_dev.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE sifter_dev.post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE sifter_dev.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sifter_dev.dm_messages;
