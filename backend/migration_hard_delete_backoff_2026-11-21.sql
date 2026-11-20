-- PROPOSED, NOT APPLIED.
-- Hard-delete backoff columns for the scheduled account hard delete
-- (account_hard_delete.py).
--
-- Why: an account whose content purge keeps failing (or is blocked, for example
-- by a guild it owns) is retried first on every run, oldest first. With a batch
-- cap, enough permanently failing rows would stop every newer account from
-- being deleted. These two columns let the job record a failure, move that
-- account to the back of the queue, and give up after a bounded number of
-- attempts (it then logs a count and leaves the row for a person to look at).
--
-- Additive and idempotent. The code works WITHOUT these columns: it detects
-- their absence and falls back to a rotating slice of the queue chosen by the
-- run date. Apply any time; nothing depends on the order.
--
-- Verify after applying:
--   SELECT count(*) FROM skillup_dev.users WHERE purge_attempts IS NULL;  -- 0
--   \d skillup_dev.users   -- shows purge_attempts, last_purge_attempt_at
-- Roll back (only if needed):
--   ALTER TABLE skillup_dev.users DROP COLUMN IF EXISTS last_purge_attempt_at;
--   ALTER TABLE skillup_dev.users DROP COLUMN IF EXISTS purge_attempts;

BEGIN;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS purge_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS last_purge_attempt_at TIMESTAMPTZ;

-- The queue the job reads: soft-deleted accounts, least recently attempted first.
CREATE INDEX IF NOT EXISTS idx_users_hard_delete_queue
  ON skillup_dev.users (last_purge_attempt_at NULLS FIRST, deletion_cooldown_until)
  WHERE is_deleted;

COMMIT;
