-- Additive patch for typed admin-created learner accounts.
ALTER TABLE skillup_dev.student_provision_drafts
  ADD COLUMN IF NOT EXISTS student_type TEXT;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS provisioned_user_type TEXT;

CREATE INDEX IF NOT EXISTS idx_users_provisioned_user_type
  ON skillup_dev.users(provisioned_user_type)
  WHERE provisioned_user_type IS NOT NULL;
