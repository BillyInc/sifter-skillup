-- Add FCM token column to active_sessions for push notifications
-- Migration: Add FCM Token Support to Device Sessions
--
-- Note: The actual table is "active_sessions" (created in migration_v2.sql).
-- This migration adds dedicated FCM token support separate from the generic push_token.
--
-- Rationale:
-- - FCM (Firebase Cloud Messaging) is the primary push service
-- - Keeping fcm_token separate allows for multi-push-service support in the future
-- - Device registration and token refresh are handled by device_sessions.py

ALTER TABLE skillup_dev.active_sessions
ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT NULL;

COMMENT ON COLUMN skillup_dev.active_sessions.fcm_token IS 'Firebase Cloud Messaging device token for push notifications. Registered during device setup and refreshed when expired.';
