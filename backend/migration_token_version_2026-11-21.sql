-- PROPOSED, NOT APPLIED. Do not execute from tooling; the owner applies this
-- manually in the Supabase SQL Editor (or psql) after review.
--
-- Session revocation counter. A password reset adds 1 to users.token_version;
-- every session token carries the version it was issued under (the "tv" claim)
-- and is rejected once the counter has moved on. Additive and idempotent:
-- NOT NULL DEFAULT 0, so existing rows and already-issued tokens (which read as
-- version 0) keep working until the first reset. The API reads the column
-- defensively, so the backend works both before and after this is applied; until
-- it is applied a reset still signs out the user's registered devices.

BEGIN;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN skillup_dev.users.token_version IS
  'Bumped on password reset; session tokens older than this are rejected. Never returned by the API.';

COMMIT;
