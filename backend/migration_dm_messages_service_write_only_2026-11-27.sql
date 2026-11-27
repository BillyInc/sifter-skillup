-- PROPOSED, NOT APPLIED. Do not execute from tooling; the owner applies this
-- manually in the Supabase SQL Editor (or psql) after review.
--
-- Make skillup_dev.dm_messages writable only by the backend (service_role).
-- The old policy dm_participant_insert only checked sender_id = auth.uid(), so
-- any signed-in user holding a thread id could POST straight to PostgREST and
-- bypass the API's mutual-follow, block and frozen-thread checks. Nothing in
-- src/ or web/ inserts into dm_messages (the app only subscribes to realtime
-- INSERT events and sends through /api/dms/send), so dropping client write
-- access changes no app behaviour.
--
-- Additive in effect and idempotent: SELECT policies and grants (needed by the
-- realtime subscription and message reads) are untouched; no rows are changed.

BEGIN;

DROP POLICY IF EXISTS dm_participant_insert ON skillup_dev.dm_messages;

REVOKE INSERT, UPDATE, DELETE ON skillup_dev.dm_messages FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON skillup_dev.dm_messages TO service_role;

COMMIT;
