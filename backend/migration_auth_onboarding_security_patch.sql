-- Sifter LevelUp - auth, onboarding resume, and admin security patch
-- Run after:
--   supabase-schema.sql
--   backend/migration_v2.sql
--   backend/migration_auth_profile.sql
--   backend/migration_career_v2.sql
--   backend/migration_admission_intelligence.sql
--   backend/migration_student_pipeline_live.sql
--   backend/migration_provisioning.sql

BEGIN;

ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS account_type_selected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS onboarding_checkpoint TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_post_auth_path TEXT,
    ADD COLUMN IF NOT EXISTS last_seen_device_id TEXT,
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{"notifications":true,"sound":true,"haptics":true}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_users_email_verified
    ON skillup_dev.users(email_verified_at)
    WHERE email_verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_onboarding_checkpoint
    ON skillup_dev.users(onboarding_checkpoint)
    WHERE onboarding_completed = false;

-- Durable email-code storage for signup verification and admin MFA challenges.
-- Store only hashes in production code; never persist raw codes.
CREATE TABLE IF NOT EXISTS skillup_dev.auth_email_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    user_id UUID REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('signup_email', 'admin_mfa')),
    code_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (email = lower(email))
);

CREATE INDEX IF NOT EXISTS idx_auth_email_codes_lookup
    ON skillup_dev.auth_email_codes(email, purpose, consumed_at, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_email_codes_user
    ON skillup_dev.auth_email_codes(user_id, purpose, consumed_at, expires_at DESC)
    WHERE user_id IS NOT NULL;

-- Server-side onboarding draft so incomplete users can resume on another device.
CREATE TABLE IF NOT EXISTS skillup_dev.onboarding_drafts (
    user_id UUID PRIMARY KEY REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    mode TEXT CHECK (mode IN ('student', 'educator')),
    choice TEXT,
    step INTEGER NOT NULL DEFAULT 0,
    checkpoint TEXT,
    student_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    educator_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    admission_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_checkpoint
    ON skillup_dev.onboarding_drafts(checkpoint, updated_at DESC);

-- Admin MFA state. The first implementation may prompt/defer in settings,
-- but this table is the durable contract for real enforcement.
CREATE TABLE IF NOT EXISTS skillup_dev.user_mfa_settings (
    user_id UUID PRIMARY KEY REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'recommended'
        CHECK (status IN ('recommended', 'deferred', 'pending_setup', 'enabled', 'disabled')),
    method TEXT NOT NULL DEFAULT 'email_otp'
        CHECK (method IN ('email_otp', 'totp')),
    secret_hash TEXT,
    recovery_codes_hash JSONB NOT NULL DEFAULT '[]'::jsonb,
    deferred_until TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_status
    ON skillup_dev.user_mfa_settings(status);

ALTER TABLE skillup_dev.auth_email_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.onboarding_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.user_mfa_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_own_onboarding_draft ON skillup_dev.onboarding_drafts;
CREATE POLICY users_own_onboarding_draft
    ON skillup_dev.onboarding_drafts
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS users_own_mfa_settings ON skillup_dev.user_mfa_settings;
CREATE POLICY users_own_mfa_settings
    ON skillup_dev.user_mfa_settings
    FOR SELECT
    USING (auth.uid() = user_id);

COMMIT;
