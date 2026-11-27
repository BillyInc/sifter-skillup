-- PROPOSED, NOT APPLIED. Do not execute from tooling; the owner applies this
-- manually in the Supabase SQL Editor (or psql) after review.
--
-- Follow-up (not done here): follows, follow_requests, user_blocks, dm_threads
-- and thread_participants rely on RLS-on-with-no-policy and could get the same
-- REVOKE ALL as defence in depth in a later change.
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
--   3. Restores SELECT only for roles that held it before the REVOKE (captured
--      first), and only if a SELECT (or ALL) policy exists, so read access that
--      was there is not lost. It never adds SELECT to a role that had none
--      (anon cannot match dm_participant_read, which uses auth.uid()).
--   4. Grants service_role full access (the backend writes through it).
--
-- Prerequisite: the roles anon, authenticated and service_role must exist
-- (they do on Supabase). If one is missing the REVOKE/GRANT raises and the
-- whole transaction rolls back, so nothing is half-applied (fail closed).
--
-- Note: has_table_privilege() also counts a privilege inherited from PUBLIC, so
-- a PUBLIC SELECT grant makes anon/authenticated look like SELECT holders; they
-- then get an explicit SELECT re-grant here (REVOKE ... FROM anon, authenticated
-- does not remove a PUBLIC grant). Re-running supabase-schema.sql re-grants
-- SELECT to authenticated unconditionally; row access is still gated by RLS.
--
-- Idempotent and non-destructive: no rows, tables or other policies are
-- changed or dropped. supabase-schema.sql carries the equivalent REVOKE and no
-- longer creates the insert policy, so re-running the base schema after this
-- migration does not bring the bypass back.

BEGIN;

DROP POLICY IF EXISTS dm_participant_insert ON skillup_dev.dm_messages;

DO $$
DECLARE
    had_select text[] := ARRAY[]::text[];
    r text;
BEGIN
    -- Remember which client roles already held SELECT before the REVOKE.
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF has_table_privilege(r, 'skillup_dev.dm_messages', 'SELECT') THEN
            had_select := had_select || r;
        END IF;
    END LOOP;

    REVOKE ALL ON skillup_dev.dm_messages FROM anon, authenticated;

    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'skillup_dev'
          AND tablename = 'dm_messages'
          AND cmd IN ('SELECT', 'ALL')
    ) THEN
        FOREACH r IN ARRAY had_select LOOP
            EXECUTE format('GRANT SELECT ON skillup_dev.dm_messages TO %I', r);
        END LOOP;
    END IF;
END
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON skillup_dev.dm_messages TO service_role;

COMMIT;
