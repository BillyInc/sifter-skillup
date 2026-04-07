-- ============================================================
-- Sifter Skill_Up — Atomic helpers + RLS cleanup + admin column
-- Run AFTER migration_v2.sql
-- Wrapped in a transaction so partial failure leaves no orphans.
-- ============================================================
BEGIN;

-- Atomic XP/points increment with optional cap
CREATE OR REPLACE FUNCTION skillup_dev.increment_user_points(
    p_user_id UUID,
    p_delta   INTEGER
) RETURNS INTEGER AS $$
    UPDATE skillup_dev.users
       SET points = points + p_delta
     WHERE id = p_user_id
    RETURNING points;
$$ LANGUAGE SQL VOLATILE SECURITY DEFINER;

-- Atomic merch credit decrement (returns NULL if insufficient)
CREATE OR REPLACE FUNCTION skillup_dev.decrement_merch_credits(
    p_user_id UUID,
    p_amount  INTEGER
) RETURNS INTEGER AS $$
    UPDATE skillup_dev.users
       SET merch_credits = merch_credits - p_amount
     WHERE id = p_user_id
       AND merch_credits >= p_amount
    RETURNING merch_credits;
$$ LANGUAGE SQL VOLATILE SECURITY DEFINER;

-- Atomic feed counter increment
CREATE OR REPLACE FUNCTION skillup_dev.increment_feed_counter(
    p_item_id UUID,
    p_column  TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_column NOT IN ('like_count', 'bookmark_count', 'share_count') THEN
        RAISE EXCEPTION 'invalid column: %', p_column;
    END IF;
    EXECUTE format(
        'UPDATE skillup_dev.feed_items SET %I = %I + 1 WHERE id = $1',
        p_column, p_column
    ) USING p_item_id;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION skillup_dev.decrement_feed_counter(
    p_item_id UUID,
    p_column  TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_column NOT IN ('like_count', 'bookmark_count', 'share_count') THEN
        RAISE EXCEPTION 'invalid column: %', p_column;
    END IF;
    EXECUTE format(
        'UPDATE skillup_dev.feed_items SET %I = GREATEST(%I - 1, 0) WHERE id = $1',
        p_column, p_column
    ) USING p_item_id;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Atomic streak update with server-side date enforcement
CREATE OR REPLACE FUNCTION skillup_dev.touch_user_streak(
    p_user_id UUID
) RETURNS TABLE(streak INTEGER, last_played DATE) AS $$
DECLARE
    v_today  DATE := CURRENT_DATE;
    v_streak INTEGER;
    v_last   DATE;
BEGIN
    SELECT u.streak, u.last_played INTO v_streak, v_last
      FROM skillup_dev.users u
     WHERE u.id = p_user_id
       FOR UPDATE;

    IF v_last = v_today THEN
        NULL;
    ELSIF v_last = v_today - INTERVAL '1 day' THEN
        v_streak := v_streak + 1;
    ELSE
        v_streak := 1;
    END IF;

    UPDATE skillup_dev.users
       SET streak = v_streak,
           last_played = v_today
     WHERE id = p_user_id;

    RETURN QUERY SELECT v_streak, v_today;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Add is_admin column for proper admin gating (replaces is_verified misuse)
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON skillup_dev.users(is_admin) WHERE is_admin = true;

-- Daily XP cap tracking for offline drain abuse prevention
CREATE TABLE IF NOT EXISTS skillup_dev.daily_xp_caps (
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    cap_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_offline  INTEGER NOT NULL DEFAULT 0,
    xp_social   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(user_id, cap_date)
);

-- Atomic offline-XP cap check + grant
CREATE OR REPLACE FUNCTION skillup_dev.try_award_offline_xp(
    p_user_id UUID,
    p_request INTEGER,
    p_max     INTEGER DEFAULT 5000
) RETURNS INTEGER AS $$
DECLARE
    v_current INTEGER;
    v_grant   INTEGER;
BEGIN
    IF p_request <= 0 THEN
        RETURN 0;
    END IF;

    INSERT INTO skillup_dev.daily_xp_caps(user_id, cap_date, xp_offline)
        VALUES(p_user_id, CURRENT_DATE, 0)
        ON CONFLICT(user_id, cap_date) DO NOTHING;

    SELECT xp_offline INTO v_current
      FROM skillup_dev.daily_xp_caps
     WHERE user_id = p_user_id AND cap_date = CURRENT_DATE
       FOR UPDATE;

    v_grant := LEAST(p_request, GREATEST(p_max - v_current, 0));

    IF v_grant > 0 THEN
        UPDATE skillup_dev.daily_xp_caps
           SET xp_offline = v_current + v_grant
         WHERE user_id = p_user_id AND cap_date = CURRENT_DATE;

        UPDATE skillup_dev.users
           SET points = points + v_grant
         WHERE id = p_user_id;
    END IF;

    RETURN v_grant;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION skillup_dev.try_award_social_xp(
    p_user_id UUID,
    p_request INTEGER,
    p_max     INTEGER DEFAULT 300
) RETURNS INTEGER AS $$
DECLARE
    v_current INTEGER;
    v_grant   INTEGER;
BEGIN
    IF p_request <= 0 THEN
        RETURN 0;
    END IF;

    INSERT INTO skillup_dev.daily_xp_caps(user_id, cap_date, xp_social)
        VALUES(p_user_id, CURRENT_DATE, 0)
        ON CONFLICT(user_id, cap_date) DO NOTHING;

    SELECT xp_social INTO v_current
      FROM skillup_dev.daily_xp_caps
     WHERE user_id = p_user_id AND cap_date = CURRENT_DATE
       FOR UPDATE;

    v_grant := LEAST(p_request, GREATEST(p_max - v_current, 0));

    IF v_grant > 0 THEN
        UPDATE skillup_dev.daily_xp_caps
           SET xp_social = v_current + v_grant
         WHERE user_id = p_user_id AND cap_date = CURRENT_DATE;

        UPDATE skillup_dev.users
           SET points = points + v_grant
         WHERE id = p_user_id;
    END IF;

    RETURN v_grant;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Drop the broken RLS policies that referenced auth.uid()
-- (which never matches custom HS256 JWT sub)
DROP POLICY IF EXISTS users_own_sessions    ON skillup_dev.active_sessions;
DROP POLICY IF EXISTS users_own_xp          ON skillup_dev.xp_events;
DROP POLICY IF EXISTS users_own_badges      ON skillup_dev.user_badges;
DROP POLICY IF EXISTS users_own_subs        ON skillup_dev.track_subscriptions;
DROP POLICY IF EXISTS users_own_orders      ON skillup_dev.merchandise_orders;
DROP POLICY IF EXISTS users_own_starknet_tx ON skillup_dev.starknet_transactions;
DROP POLICY IF EXISTS users_own_prefs       ON skillup_dev.notification_prefs;
DROP POLICY IF EXISTS users_own_interviews  ON skillup_dev.interview_sessions;
DROP POLICY IF EXISTS users_own_push_tokens ON skillup_dev.push_tokens;

-- Disable RLS on backend-only tables (service role bypasses RLS, so the policies
-- created the illusion of defense-in-depth without delivering it).
ALTER TABLE skillup_dev.active_sessions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.sync_log              DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.xp_events             DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.user_badges           DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.feed_interactions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.track_subscriptions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.challenge_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.social_shares         DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.portfolio_attributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.merchandise_orders    DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.starknet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.notification_prefs    DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.referrals             DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.interview_sessions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.push_tokens           DISABLE ROW LEVEL SECURITY;

COMMIT;
