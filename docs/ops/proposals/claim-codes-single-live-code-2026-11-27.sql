-- ============================================================================
-- PROPOSED, NOT APPLIED, NEEDS MAINTAINER APPROVAL
--
-- Claim codes: at most ONE live code per student, enforced by the database.
--
-- NOT a migration: it is not in backend/, not registered in
-- backend/migrate/manifest.toml, and must NOT be run by the migration runner.
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction block, so step (c)
-- is run on its own (psql, or one statement at a time in the SQL Editor).
-- Apply manually, after approval, steps in order: (a) -> (b) -> (c).
-- ============================================================================
--
-- Relation to the existing schema (backend/migration_provisioning.sql, "7.
-- claim_codes"):
--
--   skillup_dev.claim_codes(id, code, student_id, school_id, expires_at,
--                           redeemed_at, revoked_at, created_at)
--
--   uq_claim_codes_live  UNIQUE (code) WHERE redeemed_at IS NULL AND revoked_at IS NULL
--   idx_claim_codes_student  (student_id)            -- plain, non-unique
--
-- uq_claim_codes_live does NOT cover this. It keeps two live codes from having
-- the same TEXT, so redemption lookups by code are unambiguous. It says nothing
-- about how many live codes one STUDENT has: two regenerates generate two
-- different strings, both pass that index, and both stay live. The only
-- per-student guard today is application code in
-- backend/routes/provisioning_routes.py (regenerate_code ->
-- _retire_superseded_codes), which is insert-first-then-revoke across several
-- separate statements with no lock. The race exists because:
--   1. Two admins (or retries) each INSERT their own code, then each READ the
--      student's live codes, then each REVOKE what they read. Each read can miss
--      the other's insert, and each revoke can land on a row the other just
--      decided to keep. No ordering of separate statements is safe without a
--      lock or a constraint.
--   2. The tie-break is (created_at, id), but created_at comes from the
--      application clock, so skew between processes makes the two racers
--      disagree on the winner. Interleavings exist where both revoke the other
--      (zero live) or both keep their own (two live).
--   3. App-level mitigations (re-read after revoke, reopen-if-none-live, never
--      revoke the last live code) shrink the window but cannot close it: a
--      revoke can still land between another racer's read and its write.
-- A partial unique index makes the second live code impossible: the losing
-- INSERT fails (23505) instead of silently coexisting.
--
-- ----------------------------------------------------------------------------
-- (a) PREFLIGHT, read-only. Students that currently violate the proposed index.
--     The index build in (c) FAILS while any rows come back; run (b) first.
-- ----------------------------------------------------------------------------
SELECT student_id,
       COUNT(*)                                   AS live_codes,
       array_agg(id ORDER BY created_at DESC, id DESC) AS code_ids,
       MAX(created_at)                            AS newest_created_at
FROM skillup_dev.claim_codes
WHERE redeemed_at IS NULL AND revoked_at IS NULL
GROUP BY student_id
HAVING COUNT(*) > 1
ORDER BY live_codes DESC, newest_created_at DESC;

-- ----------------------------------------------------------------------------
-- (b) ONE-TIME CLEANUP SUGGESTION (commented out, NOT executed).
--     Keep the newest live code per student (created_at, then id), revoke the
--     rest. Review the preflight output and take a backup first. Revoked codes
--     cannot be reopened by the app if their card was already printed; confirm
--     with the schools if any of these students has a printed card in hand.
-- ----------------------------------------------------------------------------
-- BEGIN;
-- UPDATE skillup_dev.claim_codes c
--    SET revoked_at = now()
--   FROM (
--     SELECT id,
--            row_number() OVER (PARTITION BY student_id
--                               ORDER BY created_at DESC, id DESC) AS rn
--       FROM skillup_dev.claim_codes
--      WHERE redeemed_at IS NULL AND revoked_at IS NULL
--   ) ranked
--  WHERE c.id = ranked.id
--    AND ranked.rn > 1
--    AND c.redeemed_at IS NULL
--    AND c.revoked_at IS NULL;
-- -- re-run (a): it must return zero rows before COMMIT.
-- COMMIT;

-- ----------------------------------------------------------------------------
-- (c) THE INDEX. Run OUTSIDE a transaction, after (a) returns zero rows.
--     CONCURRENTLY avoids blocking writes; if it fails midway it leaves an
--     INVALID index that must be dropped (DROP INDEX CONCURRENTLY IF EXISTS
--     skillup_dev.uq_claim_codes_one_live_per_student) before retrying.
--     A redeemed code (redeemed_at set) leaves the predicate, so a stamped claim
--     and a freshly issued code for the same student would be allowed by the
--     index; the application's redeem-in-progress check still covers that case.
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_claim_codes_one_live_per_student
    ON skillup_dev.claim_codes (student_id)
    WHERE redeemed_at IS NULL AND revoked_at IS NULL;

-- After the index exists, the application must treat a unique violation (23505)
-- on the claim_codes INSERT as "lost the race" -> 409 "reissued at the same
-- time", and the insert-first-then-revoke order in regenerate_code must change
-- (revoke-then-insert, ideally via the RPC below), because with the index the
-- new code can no longer be inserted while the old one is still live.

-- ----------------------------------------------------------------------------
-- (d) RPC SKETCH (design only, commented out). Revoke-then-insert in ONE
--     transaction, serialised per student, with the stamp/claim checks.
-- ----------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION skillup_dev.regenerate_claim_code(
--     p_student_id uuid,
--     p_school_id  uuid,
--     p_new_code   text,
--     p_expires_at timestamptz,
--     p_stamp_ttl  interval DEFAULT interval '2 minutes'
-- ) RETURNS uuid
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = skillup_dev, pg_temp
-- AS $$
-- DECLARE
--     v_state text;
--     v_new   uuid := gen_random_uuid();
-- BEGIN
--     -- Serialise all regenerates (and the redeem stamp) for this student.
--     SELECT claim_state INTO v_state
--       FROM users WHERE id = p_student_id AND provisioning_school_id = p_school_id
--       FOR UPDATE;
--     IF NOT FOUND THEN
--         RAISE EXCEPTION 'student_not_found' USING ERRCODE = 'P0002';
--     END IF;
--     IF v_state IS DISTINCT FROM 'unclaimed' THEN
--         RAISE EXCEPTION 'already_claimed' USING ERRCODE = 'P0001';
--     END IF;
--     -- A fresh redeem stamp means a claim is mid-flight: refuse, as the app does.
--     IF EXISTS (SELECT 1 FROM claim_codes
--                 WHERE student_id = p_student_id
--                   AND redeemed_at IS NOT NULL AND revoked_at IS NULL
--                   AND redeemed_at > now() - p_stamp_ttl) THEN
--         RAISE EXCEPTION 'claim_in_progress' USING ERRCODE = 'P0001';
--     END IF;
--     -- Revoke every live code (stale redeem stamps too), then insert the new one.
--     UPDATE claim_codes SET revoked_at = now()
--      WHERE student_id = p_student_id AND revoked_at IS NULL
--        AND (redeemed_at IS NULL OR redeemed_at <= now() - p_stamp_ttl);
--     INSERT INTO claim_codes (id, code, student_id, school_id, expires_at, created_at)
--     VALUES (v_new, p_new_code, p_student_id, p_school_id, p_expires_at, now());
--     RETURN v_new;
-- END;
-- $$;
-- REVOKE ALL ON FUNCTION skillup_dev.regenerate_claim_code(uuid, uuid, text, timestamptz, interval)
--     FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION skillup_dev.regenerate_claim_code(uuid, uuid, text, timestamptz, interval)
--     TO service_role;
--
-- Notes for the follow-up (also not applied):
--   * The redeem path should take the same users-row lock (or use the same RPC
--     family) when it stamps redeemed_at, so a stamp and a regenerate cannot
--     interleave at all; that closes finding "reopen beside an in-progress claim"
--     at the database level instead of via a TTL check.
--   * created_at is now() inside the transaction, so (created_at, id) ordering
--     no longer depends on application clocks.
--   * The app would call this via the service client's rpc(); a unique violation
--     or the named exceptions map to the existing 409/404 responses.
