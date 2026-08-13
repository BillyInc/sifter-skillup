-- Sifter LevelUp - consolidated additive patch for the current goal
--
-- Apply in Supabase SQL Editor as the service/database owner. This patch is
-- intentionally additive and idempotent: it does not drop tables or delete
-- existing rows. It covers the columns/tables required by the current auth,
-- onboarding, school-code, affiliation, provisioning and account-lifecycle
-- code paths.

BEGIN;

CREATE SCHEMA IF NOT EXISTS skillup_dev;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Auth/signup compatibility. The live error reported by the app was that
-- users.date_of_birth was missing from PostgREST's schema cache.
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
  ADD COLUMN IF NOT EXISTS account_type_selected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_checkpoint TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_post_auth_path TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_device_id TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_cooldown_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_device_id TEXT,
  ADD COLUMN IF NOT EXISTS provenance TEXT NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS provisioning_school_id UUID,
  ADD COLUMN IF NOT EXISTS claim_state TEXT,
  ADD COLUMN IF NOT EXISTS student_class TEXT,
  ADD COLUMN IF NOT EXISTS stream TEXT,
  ADD COLUMN IF NOT EXISTS provisioned_user_type TEXT,
  ADD COLUMN IF NOT EXISTS chosen_direction JSONB,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS guardian_consent_at TIMESTAMPTZ;

-- Preserve the distinction between an intentional student choice and an old
-- completed account that inherited the historical student default.
ALTER TABLE skillup_dev.users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE skillup_dev.users
  ADD CONSTRAINT users_account_type_check
  CHECK (account_type IN ('pending', 'student', 'educator', 'institution_admin'));
ALTER TABLE skillup_dev.users ALTER COLUMN account_type SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_users_email_active_goal
  ON skillup_dev.users(email) WHERE email IS NOT NULL AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_provisioning_school
  ON skillup_dev.users(provisioning_school_id)
  WHERE provisioning_school_id IS NOT NULL;

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
CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_checkpoint_goal
  ON skillup_dev.onboarding_drafts(checkpoint, updated_at DESC);

-- School identity. Address is required by the admin API for new/updated
-- workspace claims; it remains nullable here so existing registry rows can be
-- backfilled safely instead of breaking this migration.
ALTER TABLE skillup_dev.schools
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS provider_session_only BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_school_code_goal
  ON skillup_dev.schools(school_code)
  WHERE school_code IS NOT NULL AND school_code <> '';
CREATE INDEX IF NOT EXISTS idx_schools_name_address_goal
  ON skillup_dev.schools(institution_type, lower(name), lower(address));

-- Give existing registry rows a stable readable code. The UUID suffix keeps
-- same-name/same-initial schools distinct and makes later referral links
-- deterministic without exposing the full database id.
UPDATE skillup_dev.schools
SET school_code = COALESCE(
  NULLIF(UPPER(LEFT(REGEXP_REPLACE(LOWER(COALESCE(name, '')), '[^a-z0-9]+', '', 'g'), 12)), ''),
  'SCHOOL'
) || '-' || UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 8))
WHERE school_code IS NULL OR school_code = '';

-- Student affiliation is aggregate attribution only; individual visibility is
-- still controlled separately by student_consents.
CREATE TABLE IF NOT EXISTS skillup_dev.student_affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'school_code',
  self_reported BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, school_id)
);
CREATE INDEX IF NOT EXISTS idx_affiliations_school_goal
  ON skillup_dev.student_affiliations(school_id);

CREATE TABLE IF NOT EXISTS skillup_dev.student_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'progress',
  granted_by TEXT NOT NULL DEFAULT 'self',
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, school_id, scope)
);

CREATE TABLE IF NOT EXISTS skillup_dev.student_provision_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  full_name TEXT,
  student_class TEXT,
  stream TEXT,
  needs_review BOOLEAN NOT NULL DEFAULT true,
  guardian_consent BOOLEAN NOT NULL DEFAULT false,
  guardian_name TEXT,
  student_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_user_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_drafts_school_goal
  ON skillup_dev.student_provision_drafts(school_id, status);
ALTER TABLE skillup_dev.student_provision_drafts
  ADD COLUMN IF NOT EXISTS student_type TEXT,
  ADD COLUMN IF NOT EXISTS generated_user_id UUID;

CREATE TABLE IF NOT EXISTS skillup_dev.claim_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_claim_codes_live_goal
  ON skillup_dev.claim_codes(code)
  WHERE redeemed_at IS NULL AND revoked_at IS NULL;

-- Account deletion recovery record used by the lifecycle endpoint.
CREATE TABLE IF NOT EXISTS skillup_dev.account_deletion_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  email TEXT,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;

-- After applying, refresh PostgREST's schema cache if your Supabase project
-- does not refresh automatically:
-- NOTIFY pgrst, 'reload schema';
