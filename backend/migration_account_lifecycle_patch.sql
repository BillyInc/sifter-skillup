-- Additive account lifecycle patch.
-- Run after the existing auth, device-session and provisioning migrations.
BEGIN;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_cooldown_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_active_email
  ON skillup_dev.users(email)
  WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS skillup_dev.account_deletion_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  email TEXT,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_cooldowns_device
  ON skillup_dev.account_deletion_cooldowns(device_id, available_at DESC);

COMMIT;
