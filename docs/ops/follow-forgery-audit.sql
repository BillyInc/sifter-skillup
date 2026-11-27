-- READ-ONLY, not applied. SELECT statements only: nothing here changes or
-- deletes any row. Run manually in the Supabase SQL Editor / psql and review.
--
-- Why: before the follow-request lifecycle fix, the old respond endpoint could
-- be driven to create follow rows the private account never approved (for
-- example follower = the private account, following = the attacker). Such a
-- row can still satisfy the mutual-follow rule used by /api/dms/send. Rows
-- created through the current code always have a matching 'approve' request.
--
-- A follows row (X follows T) onto a PRIVATE account T is legitimate only if
-- T approved X's request. This lists private targets that have a follows row
-- without a matching 'approve' follow_requests row.

-- 1. Follows onto private accounts with no matching approved request.
SELECT f.id            AS follow_id,
       f.follower_id,
       f.following_id  AS private_target_id,
       f.created_at
FROM skillup_dev.follows f
JOIN skillup_dev.users t ON t.id = f.following_id AND t.is_private = true
WHERE NOT EXISTS (
    SELECT 1 FROM skillup_dev.follow_requests r
    WHERE r.requester_id = f.follower_id
      AND r.target_id    = f.following_id
      AND r.status       = 'approve'
)
ORDER BY f.created_at;

-- 2. Subset that matters most for DMs: the unmatched follow is half of a mutual
--    pair (the private account also follows that user), so it can open a DM.
SELECT f.id AS follow_id, f.follower_id, f.following_id AS private_target_id, f.created_at
FROM skillup_dev.follows f
JOIN skillup_dev.users t ON t.id = f.following_id AND t.is_private = true
JOIN skillup_dev.follows back
  ON back.follower_id = f.following_id AND back.following_id = f.follower_id
WHERE NOT EXISTS (
    SELECT 1 FROM skillup_dev.follow_requests r
    WHERE r.requester_id = f.follower_id
      AND r.target_id    = f.following_id
      AND r.status       = 'approve'
)
ORDER BY f.created_at;

-- 3. Legacy free-text request statuses (anything other than the schema's
--    'pending' | 'approve' | 'reject'). The app reads these as rejections.
SELECT status, count(*) FROM skillup_dev.follow_requests
WHERE status NOT IN ('pending', 'approve', 'reject')
GROUP BY status;

-- Remediation is a maintainer decision after reviewing the results; this file
-- deliberately contains no DELETE or UPDATE.
