-- Sifter LevelUp - apply-now auth/signup/onboarding patch
--
-- Purpose:
--   Patch an existing Supabase project without recreating base tables.
--   This covers the full current signup path:
--     1. users columns inserted by backend/main.py::_create_user
--     2. active_sessions used immediately after signup/login/guest auth
--     3. email verification storage contract
--     4. onboarding resume/checkpoint storage
--     5. admin MFA storage
--
-- Safe to run more than once. This does not drop existing data.

BEGIN;

CREATE SCHEMA IF NOT EXISTS skillup_dev;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Required by current email/password signup and legacy user payload.
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS telegram_id BIGINT,
    ADD COLUMN IF NOT EXISTS wallet_address TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS username TEXT,
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS middle_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'guest',
    ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS onboarding_checkpoint TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_post_auth_path TEXT,
    ADD COLUMN IF NOT EXISTS last_seen_device_id TEXT,
    ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 1000,
    ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_played DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS current_level INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS completed_levels TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS perfect_levels TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS python_chapters_completed TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS active_track TEXT NOT NULL DEFAULT 'crypto',
    ADD COLUMN IF NOT EXISTS active_field_id TEXT,
    ADD COLUMN IF NOT EXISTS active_field_color TEXT,
    ADD COLUMN IF NOT EXISTS current_track_id TEXT,
    ADD COLUMN IF NOT EXISTS current_track_name TEXT,
    ADD COLUMN IF NOT EXISTS last_position JSONB,
    ADD COLUMN IF NOT EXISTS boosters JSONB NOT NULL DEFAULT '{"hammer":3,"lightning":2,"shuffle":5}'::jsonb,
    ADD COLUMN IF NOT EXISTS achievements TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{"notifications":true,"sound":true,"haptics":true}'::jsonb,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE skillup_dev.users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE skillup_dev.users
    ADD CONSTRAINT users_account_type_check
    CHECK (account_type IN ('pending', 'student', 'educator', 'institution_admin'));

ALTER TABLE skillup_dev.users
    ALTER COLUMN account_type SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email
    ON skillup_dev.users(email)
    WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_telegram_id
    ON skillup_dev.users(telegram_id)
    WHERE telegram_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_wallet_address
    ON skillup_dev.users(wallet_address)
    WHERE wallet_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_onboarding_checkpoint
    ON skillup_dev.users(onboarding_checkpoint)
    WHERE onboarding_completed = false;

-- Required immediately after auth success when single-device enforcement is on.
CREATE TABLE IF NOT EXISTS skillup_dev.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL DEFAULT 'Unknown device',
    platform TEXT NOT NULL DEFAULT 'unknown',
    app_version TEXT,
    push_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_active
    ON skillup_dev.active_sessions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_sessions_device_active
    ON skillup_dev.active_sessions(device_id, is_active);

-- Durable email-code storage for the production implementation. The current
-- dev path may still use in-memory codes, but this is the DB contract.
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

-- Admin 2FA/MFA durable state.
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

ALTER TABLE skillup_dev.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.auth_email_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.onboarding_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.user_mfa_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_own_sessions ON skillup_dev.active_sessions;
CREATE POLICY users_own_sessions
    ON skillup_dev.active_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

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
