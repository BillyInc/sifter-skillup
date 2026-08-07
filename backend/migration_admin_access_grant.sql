-- ============================================================
-- Sifter LevelUp — Persist the owner-code admin grant
--
-- WHY THIS EXISTS
-- ---------------
-- This closes a privilege escalation that the endpoint gating in this same
-- branch would otherwise have left decorative.
--
-- The intended design is documented in the code: an owner-issued access code is
-- "required before entering admin mode". POST /api/institutions/access-code/validate
-- HMAC-compares the submitted code against settings.EDUCATOR_ACCESS_CODES — and
-- then stores NOTHING. It returns {accepted: true, accessTier: "owner_code"} and
-- the frontend keeps that flag in local state. The server has no memory of it.
--
-- Meanwhile POST /api/institutions/verify accepts ANY authenticated user, takes
-- a free-text organisation name, and writes users.account_type = 'educator' or
-- 'institution_admin' immediately. Auth.require_admin checks only account_type.
--
-- So the owner-code gate was client-side only: a student could skip
-- /access-code/validate entirely, POST /verify with any organisation name, and
-- become an "educator" in one request — passing require_admin on every
-- institution endpoint, including the eight this branch just gated.
--
-- Persisting the grant makes the check the server already performs actually
-- count for something.
--
-- CONSEQUENCE FOR EXISTING USERS: nobody has this column set, so every current
-- admin must re-enter their owner code once. That is deliberate — the
-- alternative is grandfathering in account_type values that were never gated by
-- anything, which is the hole itself.
-- ============================================================
BEGIN;

ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS admin_access_granted_at TIMESTAMPTZ;

COMMENT ON COLUMN skillup_dev.users.admin_access_granted_at IS
    'When this user passed the owner-issued admin access code. NULL means they '
    'never did: POST /api/institutions/verify refuses to grant an admin '
    'account_type without it. Not proof of organisation verification, which is '
    'tracked separately on schools.verification_status.';

COMMIT;
