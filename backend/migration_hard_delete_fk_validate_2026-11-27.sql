-- PROPOSED, NOT APPLIED.
-- Validates the foreign keys that migration_hard_delete_fk_2026-11-27.sql adds
-- as NOT VALID (notifications.actor_id and guilds.owner_id, both to users).
--
-- Why a separate file: VALIDATE CONSTRAINT scans the whole table. Run in its
-- own transaction after the first migration has committed, it holds only a
-- SHARE UPDATE EXCLUSIVE lock, so reads and writes on notifications, guilds and
-- users continue. Doing it in the first migration would scan while the
-- ACCESS EXCLUSIVE lock from DROP CONSTRAINT was still held until COMMIT.
--
-- Apply after migration_hard_delete_fk_2026-11-27.sql, any time. The
-- application works with or without it: a NOT VALID key already enforces new
-- writes and ON DELETE SET NULL.
--
-- Idempotent and non-destructive: validates only constraints that exist, are
-- foreign keys from those two columns to users, and are not yet validated
-- (convalidated = false). No rows are changed. A second run, a missing table or
-- column, or a constraint already validated does nothing. If existing rows
-- violate a constraint the statement fails and the transaction rolls back; fix
-- the orphaned rows and re-run.
--
-- Lock timeout: the transaction sets lock_timeout = 5s so it fails fast rather
-- than queueing behind a conflicting lock. A "lock timeout" error means nothing
-- changed: retry at a quiet time. No statement_timeout is set, because
-- VALIDATE CONSTRAINT legitimately scans the table and a cancel would only
-- waste the scan.
--
-- Verify after applying (expects convalidated = true for both rows):
--   SELECT c.conrelid::regclass AS tbl, a.attname AS col, c.confdeltype, c.convalidated
--     FROM pg_constraint c
--     JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
--    WHERE c.contype = 'f'
--      AND c.confrelid = 'skillup_dev.users'::regclass
--      AND ((c.conrelid = 'skillup_dev.notifications'::regclass AND a.attname = 'actor_id')
--        OR (c.conrelid = 'skillup_dev.guilds'::regclass        AND a.attname = 'owner_id'));

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
    FOR fk IN
      SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
       WHERE c.contype = 'f'
         AND c.conrelid = ('skillup_dev.' || target.tbl)::regclass
         AND c.confrelid = 'skillup_dev.users'::regclass
         AND array_length(c.conkey, 1) = 1
         AND a.attname = target.col
         AND NOT c.convalidated
    LOOP
      EXECUTE format('ALTER TABLE skillup_dev.%I VALIDATE CONSTRAINT %I', target.tbl, fk.conname);
    END LOOP;
  END LOOP;
END
$$;

COMMIT;
