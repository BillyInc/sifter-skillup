-- ============================================================
-- Down migration for migration_v2.sql + migration_v2_atomic.sql
-- DESTRUCTIVE — drops all v2 tables and the new user columns.
-- Wrapped in a transaction.
-- ============================================================
BEGIN;

-- Atomic helpers
DROP FUNCTION IF EXISTS skillup_dev.try_award_social_xp(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS skillup_dev.try_award_offline_xp(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS skillup_dev.touch_user_streak(UUID);
DROP FUNCTION IF EXISTS skillup_dev.decrement_feed_counter(UUID, TEXT);
DROP FUNCTION IF EXISTS skillup_dev.increment_feed_counter(UUID, TEXT);
DROP FUNCTION IF EXISTS skillup_dev.decrement_merch_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS skillup_dev.increment_user_points(UUID, INTEGER);

-- Daily caps table
DROP TABLE IF EXISTS skillup_dev.daily_xp_caps;

-- v2 tables (reverse dependency order)
DROP TABLE IF EXISTS skillup_dev.interview_questions;
DROP TABLE IF EXISTS skillup_dev.interview_sessions;
DROP TABLE IF EXISTS skillup_dev.referrals;
DROP TABLE IF EXISTS skillup_dev.merchandise_orders;
DROP TABLE IF EXISTS skillup_dev.merchandise_items;
DROP TABLE IF EXISTS skillup_dev.starknet_transactions;
DROP TABLE IF EXISTS skillup_dev.portfolio_attributions;
DROP TABLE IF EXISTS skillup_dev.social_shares;
DROP TABLE IF EXISTS skillup_dev.challenge_participants;
DROP TABLE IF EXISTS skillup_dev.challenges;
DROP TABLE IF EXISTS skillup_dev.track_subscriptions;
DROP TABLE IF EXISTS skillup_dev.feed_interactions;
DROP TABLE IF EXISTS skillup_dev.feed_items;
DROP TABLE IF EXISTS skillup_dev.sync_meta;
DROP TABLE IF EXISTS skillup_dev.content_cache;
DROP TABLE IF EXISTS skillup_dev.user_badges;
DROP TABLE IF EXISTS skillup_dev.badges;
DROP TABLE IF EXISTS skillup_dev.xp_events;
DROP TABLE IF EXISTS skillup_dev.sync_log;
DROP TABLE IF EXISTS skillup_dev.active_sessions;

-- v2 columns added to users
ALTER TABLE skillup_dev.users
    DROP COLUMN IF EXISTS is_admin,
    DROP COLUMN IF EXISTS onboarding_completed,
    DROP COLUMN IF EXISTS last_position,
    DROP COLUMN IF EXISTS referral_code,
    DROP COLUMN IF EXISTS merch_credits,
    DROP COLUMN IF EXISTS xp_stage,
    DROP COLUMN IF EXISTS current_track_name,
    DROP COLUMN IF EXISTS current_track_id,
    DROP COLUMN IF EXISTS active_field_color,
    DROP COLUMN IF EXISTS active_field_id,
    DROP COLUMN IF EXISTS starknet_email,
    DROP COLUMN IF EXISTS starknet_auth,
    DROP COLUMN IF EXISTS starknet_address,
    DROP COLUMN IF EXISTS password_hash,
    DROP COLUMN IF EXISTS email;

COMMIT;
