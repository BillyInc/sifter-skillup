-- PROPOSED, NOT APPLIED. Do not execute from tooling; the owner applies this
-- manually in the Supabase SQL Editor (or psql) after review.
--
-- Defence in depth: make skillup_dev.dm_messages writable only by the backend
-- (service_role).
--
-- Background. The base schema created the policy dm_participant_insert, which
-- only checked sender_id = auth.uid(). A signed-in user could therefore, in
-- principle, POST straight to PostgREST and skip the API's mutual-follow, block
-- and frozen-thread checks. Assessed reachability is low:
--   * The app talks to Supabase with the anon key and has no Supabase Auth
--     session, so auth.uid() is NULL for its requests and that policy never
--     matched; the bypass was probably not reachable from the app.
--   * dm_participant_read subqueries thread_participants, which has row level
--     security enabled and no policy, so the subquery already returns nothing
--     to client roles and the read policy matches no rows for them.
--   * The only client subscription (src/hooks/useCommunity.ts) uses the schema
--     name sifter_dev and a recipient_id column that does not exist, so it is
--     already non-functional. No src/ or web/ code inserts into dm_messages;
--     messages are sent through /api/dms/send.
-- This migration removes the remaining client write path so it cannot become
-- reachable later (for example if the app starts using Supabase Auth).
--
-- What it does:
--   1. Drops the dm_participant_insert policy.
--   2. Revokes ALL privileges on dm_messages from anon and authenticated. ALL
--      covers INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER (not just
--      the row-level writes), so none of them can be exercised by a client role.
--   3. Re-grants SELECT to those roles only if a SELECT (or ALL) policy exists
--      on the table, so read access that a policy intends to allow is not lost.
--   4. Grants service_role full access (the backend writes through it).
--
-- Idempotent and non-destructive: no rows, tables or other policies are
-- changed or dropped. supabase-schema.sql carries the equivalent REVOKE and no
-- longer creates the insert policy, so re-running the base schema after this
-- migration does not bring the bypass back.

BEGIN;

DROP POLICY IF EXISTS dm_participant_insert ON skillup_dev.dm_messages;

REVOKE ALL ON skillup_dev.dm_messages FROM anon, authenticated;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'skillup_dev'
          AND tablename = 'dm_messages'
          AND cmd IN ('SELECT', 'ALL')
    ) THEN
        GRANT SELECT ON skillup_dev.dm_messages TO anon, authenticated;
    END IF;
END
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON skillup_dev.dm_messages TO service_role;

COMMIT;
