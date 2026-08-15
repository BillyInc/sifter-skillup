-- Private institution verification proof submissions.
-- Apply after the institution/school registry migrations.

ALTER TABLE skillup_dev.schools
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_method TEXT,
  ADD COLUMN IF NOT EXISTS verification_proof_submitted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS skillup_dev.institution_verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  verification_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_institution_verification_submissions_school
  ON skillup_dev.institution_verification_submissions(school_id, submitted_at DESC);

ALTER TABLE skillup_dev.institution_verification_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE skillup_dev.institution_verification_submissions FROM anon, authenticated;

-- The API uses the service role to write/read this private bucket. Nothing is
-- public and no client-side Supabase storage key is exposed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-proofs', 'verification-proofs', false)
ON CONFLICT (id) DO NOTHING;
