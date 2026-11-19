-- PROPOSED, NOT APPLIED. Do not execute from tooling; the owner applies this
-- manually in the Supabase SQL Editor (or psql) after review.
--
-- Optional student-chosen "Name to show". Additive and idempotent: nullable,
-- no default, no backfill, no uniqueness (names are not identifiers).
-- `username` is untouched and keeps its existing (legacy) values.
-- The API reads/writes this column defensively, so the backend works both
-- before and after this migration is applied.

BEGIN;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS display_name TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_display_name_length_chk'
      AND conrelid = 'skillup_dev.users'::regclass
  ) THEN
    ALTER TABLE skillup_dev.users
      ADD CONSTRAINT users_display_name_length_chk
      CHECK (display_name IS NULL OR char_length(display_name) BETWEEN 2 AND 30);
  END IF;
END $$;

COMMENT ON COLUMN skillup_dev.users.display_name IS
  'Optional name the user chose to be shown in the app; not a legal name. NULL = fall back to first name.';

COMMIT;
