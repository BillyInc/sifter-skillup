-- READ-ONLY, not applied. SELECT statements only: nothing here changes or
-- deletes any row. Run manually in the Supabase SQL Editor / psql and review.
--
-- Why: the old /api/users/follow-request/respond endpoint (git history, before
-- the follow-request lifecycle fix) did two things with no ownership check:
--   * UPDATE follow_requests SET status = <free text> WHERE requester_id =
--     <body.requesterId> AND target_id = <caller>  (matching nothing is fine)
--   * if action == 'approve': INSERT follows (follower_id = body.requesterId,
--     following_id = <caller>), whether or not any request existed.
-- So an attacker (the caller) could name ANY user as requesterId and create a
-- follows row where the VICTIM follows the ATTACKER. If the attacker then
-- follows the victim, the pair is mutual and satisfies the rule used by
-- /api/dms/send. Rows created by current code always have a matching 'approve'
-- request (requester = follower, target = following).
--
-- Forged row shape: follower_id = victim, following_id = attacker, with no
-- follow_request row sent by the victim to the attacker (requester = victim,
-- target = attacker). A request in the opposite direction (attacker -> victim,
-- approved by the victim) may exist and does NOT clear the row.
--
-- LIMITS, stated plainly: a private account may legitimately follow someone
-- without any follow_request row (follow_requests only exist for following a
-- private account, and a private account that follows a public user uses
-- /follow). So every row below is a REVIEW CANDIDATE, not proof of forgery.
-- Also, these queries can only look at PRIVATE victims. A forged row whose
-- victim is a PUBLIC account is indistinguishable from a normal follow of a
-- public account (public follows have no request row), so this audit cannot
-- identify forged rows against public victims at all.

-- 1. Review candidates: follows whose follower is a private account and where
--    no SAME-direction follow_request row (requester = follower, target =
--    following, any status) exists. The reverse direction is deliberately NOT
--    excluded: an attacker A forges follows(V -> A) and then asks to follow V
--    (V approves), so follow_requests(A -> V, approve) exists, yet the
--    forged V -> A row is the one that enables the DM. A forged row never has
--    a request sent by the victim.
--    Expected result shapes (fixtures):
--      forged V->A, no requests at all                    -> returned
--      forged V->A + approved request A->V (reverse)       -> returned
--      legitimate V->A + approved request V->A (same dir)  -> NOT returned
SELECT f.id            AS follow_id,
       f.follower_id   AS private_follower_id,
       f.following_id,
       f.created_at
FROM skillup_dev.follows f
JOIN skillup_dev.users v ON v.id = f.follower_id AND v.is_private = true
WHERE NOT EXISTS (
    SELECT 1 FROM skillup_dev.follow_requests r
    WHERE r.requester_id = f.follower_id AND r.target_id = f.following_id
)
ORDER BY f.created_at;

-- 2. Subset of query 1 that matters most for DMs: the other party also follows
--    the private account back, so the pair is mutual and can open a DM.
--    Same exclusion rule as query 1 (same-direction request only).
--    Expected: the forged V->A + approved A->V pair is returned (via the
--    V->A row; the A->V row is not a candidate because A is not private).
SELECT f.id            AS follow_id,
       f.follower_id   AS private_follower_id,
       f.following_id,
       f.created_at
FROM skillup_dev.follows f
JOIN skillup_dev.users v ON v.id = f.follower_id AND v.is_private = true
JOIN skillup_dev.follows back
  ON back.follower_id = f.following_id AND back.following_id = f.follower_id
WHERE NOT EXISTS (
    SELECT 1 FROM skillup_dev.follow_requests r
    WHERE r.requester_id = f.follower_id AND r.target_id = f.following_id
)
ORDER BY f.created_at;

-- 3. Legacy free-text request statuses (anything other than the schema's
--    'pending' | 'approve' | 'reject'). The app reads these as rejections.
SELECT status, count(*) FROM skillup_dev.follow_requests
WHERE status NOT IN ('pending', 'approve', 'reject')
GROUP BY status;

-- Remediation is a maintainer decision after reviewing the results; this file
-- deliberately contains no DELETE or UPDATE.
