-- Identity-specific external learning-resource evidence for the student-facing
-- JAMB programme registry. This is separate from CCMAS programme resources:
-- a JAMB identity may have no CCMAS anchor and must still retain its sources.
-- Additive and idempotent. Apply after migration_career_pilot.sql has created
-- skillup_dev.jamb_programmes and before the generated seed.

BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.jamb_programme_learning_resources (
    id                    UUID PRIMARY KEY,
    jamb_programme_id     UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    resource_type         TEXT NOT NULL CHECK (resource_type IN (
        'official_identity_context',
        'official_curriculum_source',
        'external_learning_reference'
    )),
    target_name           TEXT NOT NULL,
    provider              TEXT NOT NULL,
    region                TEXT NOT NULL CHECK (region IN ('nigeria', 'global', 'global_proxy')),
    access_type           TEXT NOT NULL CHECK (access_type IN ('free', 'paid', 'mixed', 'dynamic')),
    url                   TEXT NOT NULL CHECK (url ~ '^https://'),
    source_url            TEXT NOT NULL CHECK (source_url ~ '^https://'),
    authority             TEXT NOT NULL,
    resource_role         TEXT NOT NULL,
    source_status         TEXT NOT NULL DEFAULT 'confirmed',
    source_locator        TEXT NOT NULL,
    accessed_on           DATE NOT NULL,
    resource_classification TEXT NOT NULL CHECK (resource_classification IN (
        'available', 'review_required', 'genuinely_unavailable'
    )),
    decision              TEXT NOT NULL CHECK (decision IN (
        'resource_available', 'review_required', 'genuinely_unavailable'
    )),
    mapping_status         TEXT,
    student_exposure       TEXT NOT NULL,
    review_status          TEXT NOT NULL DEFAULT 'review_only'
        CHECK (review_status IN ('approved_guidance_v1', 'review_only', 'unverified')),
    source_provenance      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (jamb_programme_id, resource_role, url, source_locator)
);

CREATE INDEX IF NOT EXISTS idx_jamb_learning_resources_programme
    ON skillup_dev.jamb_programme_learning_resources(jamb_programme_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_jamb_learning_resources_review
    ON skillup_dev.jamb_programme_learning_resources(review_status, resource_classification);
CREATE INDEX IF NOT EXISTS idx_jamb_learning_resources_accessed
    ON skillup_dev.jamb_programme_learning_resources(accessed_on);

COMMENT ON TABLE skillup_dev.jamb_programme_learning_resources IS
    'Identity-specific source-backed JAMB learning resources; separate from optional CCMAS programme complements.';

COMMIT;
