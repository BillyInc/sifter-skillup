-- Durable, account-scoped selections for the full guidance-to-report journey.
-- This stores selected source IDs and display snapshots, not a copied catalogue.

CREATE TABLE IF NOT EXISTS skillup_dev.guidance_report_paths (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id         UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    created_by         UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    source             TEXT NOT NULL DEFAULT 'self'
        CHECK (source IN ('self', 'onboarding', 'explore', 'admin_guidance')),
    path               JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_guidance_report_paths_created_by
    ON skillup_dev.guidance_report_paths(created_by);

ALTER TABLE skillup_dev.guidance_report_paths ENABLE ROW LEVEL SECURITY;
