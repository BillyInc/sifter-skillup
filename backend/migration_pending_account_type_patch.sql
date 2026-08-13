-- Sifter LevelUp - pending account type patch
--
-- Run this on an existing Supabase project after the signup/onboarding patch.
-- It allows newly created email accounts to remain unselected until the
-- AccountTypeGate writes the final student/educator/institution_admin choice.

BEGIN;

ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS account_type_selected_at TIMESTAMPTZ;

ALTER TABLE skillup_dev.users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE skillup_dev.users
    ADD CONSTRAINT users_account_type_check
    CHECK (account_type IN ('pending', 'student', 'educator', 'institution_admin'));

ALTER TABLE skillup_dev.users
    ALTER COLUMN account_type SET DEFAULT 'pending';

-- Completed legacy users without a meaningful persona remain pending. Do not
-- convert them to student: the app uses this state to reopen Who's joining?.

-- Existing incomplete email accounts go back to the account-type gate.
UPDATE skillup_dev.users
SET account_type = 'pending',
    onboarding_completed = false
WHERE auth_provider <> 'guest'
  AND onboarding_completed = false;

COMMIT;
