-- Signup profile fields for the pre-auth flow.
-- `username` remains as a legacy display/search field for existing features;
-- the auth form no longer asks users to invent a username.
ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;
