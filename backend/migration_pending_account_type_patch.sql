-- Sifter LevelUp - pending account type patch
--
-- Run this on an existing Supabase project after the signup/onboarding patch.
-- It allows newly created email accounts to remain unselected until the
-- AccountTypeGate writes the final student/educator/institution_admin choice.

BEGIN;

ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE skillup_dev.users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE skillup_dev.users
    ADD CONSTRAINT users_account_type_check
    CHECK (account_type IN ('pending', 'student', 'educator', 'institution_admin'));

ALTER TABLE skillup_dev.users
    ALTER COLUMN account_type SET DEFAULT 'pending';

-- Existing completed legacy users without a meaningful account type stay student.
UPDATE skillup_dev.users
SET account_type = 'student'
WHERE onboarding_completed = true
  AND (account_type IS NULL OR account_type = 'pending');

-- Existing incomplete email accounts go back to the account-type gate.
UPDATE skillup_dev.users
SET account_type = 'pending',
    onboarding_completed = false
WHERE auth_provider <> 'guest'
  AND onboarding_completed = false;

COMMIT;
