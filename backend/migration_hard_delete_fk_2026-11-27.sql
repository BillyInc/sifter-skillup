-- PROPOSED, NOT APPLIED.
-- Foreign keys that stop the scheduled account hard delete (account_hard_delete.py).
--
-- Why: deleting a user row fails with a foreign-key violation when the user
-- triggered notifications (notifications.actor_id) or owns a guild
-- (guilds.owner_id). Both were created without an ON DELETE action on some
-- databases (supabase-schema.sql adds actor_id with ALTER ... ADD COLUMN IF NOT
-- EXISTS, which keeps an existing column's constraint). This makes both
-- ON DELETE SET NULL so the user row can always be removed.
--
-- institution_verification_submissions.submitted_by stays ON DELETE RESTRICT on
-- purpose: a database cascade would delete the row but leave the proof file in
-- the verification-proofs bucket. account_purge.py removes the file first, then
-- the rows.
--
-- The application code works WITHOUT this migration (account_purge.py deletes
-- the actor notifications and transfers or deletes owned guilds itself), and
-- also after it. Apply any time.
--
-- Idempotent and non-destructive: only constraints whose delete action is not
-- already SET NULL are replaced, in one transaction, with the same column and
-- target; no rows are changed. Skips a table or column that is absent.
--
-- Lock safety: the replacement constraints are added NOT VALID, so this
-- transaction does not scan notifications or guilds while it holds the lock
-- taken by DROP CONSTRAINT. A NOT VALID foreign key already enforces every new
-- write and already applies ON DELETE SET NULL; only the check of rows that
-- existed before is deferred. Run migration_hard_delete_fk_validate_2026-11-27.sql
-- afterwards, as its own transaction, to validate them (it takes only a
-- SHARE UPDATE EXCLUSIVE lock, so reads and writes continue).
--
-- Lock timeout: the transaction sets lock_timeout = 5s before the DDL, so it
-- fails fast instead of queueing behind a long transaction (an ACCESS
-- EXCLUSIVE request on notifications or guilds blocks every later read and
-- write while it waits). If it fails with "canceling statement due to lock
-- timeout", nothing was changed: retry at a quiet time. No statement_timeout
-- is set; the DDL does no table scan, and cancelling it midway gains nothing.
--
-- Verify after applying (expects confdeltype 'n' = SET NULL for both rows;
-- convalidated is false until the validate migration has run; a table or
-- column that is absent simply returns no row):
--   SELECT c.conrelid::regclass AS tbl, a.attname AS col, c.confdeltype, c.convalidated
--     FROM pg_constraint c
--     JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
--    WHERE c.contype = 'f'
--      AND c.confrelid = 'skillup_dev.users'::regclass
--      AND ((c.conrelid = 'skillup_dev.notifications'::regclass AND a.attname = 'actor_id')
--        OR (c.conrelid = 'skillup_dev.guilds'::regclass        AND a.attname = 'owner_id'));
-- Roll back (only if needed): re-create the constraints without ON DELETE SET NULL.

BEGIN;

SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  target RECORD;
  fk RECORD;
BEGIN
  FOR target IN
    SELECT * FROM (VALUES ('notifications', 'actor_id'), ('guilds', 'owner_id')) AS t(tbl, col)
  LOOP
    IF to_regclass('skillup_dev.' || target.tbl) IS NULL THEN
      CONTINUE;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'skillup_dev' AND table_name = target.tbl AND column_name = target.col
    ) THEN
      CONTINUE;
    END IF;
    FOR fk IN
      SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
       WHERE c.contype = 'f'
         AND c.conrelid = ('skillup_dev.' || target.tbl)::regclass
         AND c.confrelid = 'skillup_dev.users'::regclass
         AND array_length(c.conkey, 1) = 1
         AND a.attname = target.col
         AND c.confdeltype <> 'n'
    LOOP
      EXECUTE format('ALTER TABLE skillup_dev.%I DROP CONSTRAINT %I', target.tbl, fk.conname);
      EXECUTE format(
        'ALTER TABLE skillup_dev.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES skillup_dev.users(id) ON DELETE SET NULL NOT VALID',
        target.tbl, fk.conname, target.col
      );
    END LOOP;
  END LOOP;
END
$$;

COMMIT;
