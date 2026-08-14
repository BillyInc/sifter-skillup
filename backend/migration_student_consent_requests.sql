-- Student-controlled school follow-up invitations.
--
-- A claimed account is retained so it can be used later, but a school cannot
-- identify or follow up with it until the student grants a scope. Requests are
-- invitations only: they do not grant access and never expose recipient IDs to
-- the requesting school.

CREATE TABLE IF NOT EXISTS skillup_dev.student_consent_requests (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    uuid NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    school_id     uuid NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    scope         text NOT NULL DEFAULT 'progress'
                  CHECK (scope IN ('progress', 'contact', 'full')),
    requested_by  uuid REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    message       text,
    status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
    created_at    timestamptz NOT NULL DEFAULT now(),
    responded_at  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_student_consent_requests_pending
    ON skillup_dev.student_consent_requests(student_id, school_id, scope)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_student_consent_requests_student
    ON skillup_dev.student_consent_requests(student_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_consent_requests_school
    ON skillup_dev.student_consent_requests(school_id, status, created_at DESC);

ALTER TABLE skillup_dev.student_consent_requests ENABLE ROW LEVEL SECURITY;
