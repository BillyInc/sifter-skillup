-- Source-grounded programme → domain evidence.
-- Additive only. Run after migration_career_v2.sql (or after the current
-- programme_domain table exists) and before its generated evidence seed.
CREATE TABLE IF NOT EXISTS skillup_dev.programme_domain_evidence (
    id                         UUID PRIMARY KEY,
    programme_id               UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    domain_id                  UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    programme_key              TEXT NOT NULL,
    domain_key                 TEXT NOT NULL,
    match_type                 TEXT NOT NULL CHECK (match_type IN ('direct', 'functional', 'adjacent')),
    mapping_source             TEXT,
    course_anchor_quality      TEXT,
    course_anchor_count        INTEGER NOT NULL DEFAULT 0 CHECK (course_anchor_count >= 0),
    course_anchors             JSONB NOT NULL DEFAULT '[]'::jsonb,
    transferable_evidence_count INTEGER NOT NULL DEFAULT 0 CHECK (transferable_evidence_count >= 0),
    transferable_evidence      JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_review_required     BOOLEAN NOT NULL DEFAULT FALSE,
    review_required            BOOLEAN NOT NULL DEFAULT FALSE,
    source_provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, domain_id)
);

CREATE INDEX IF NOT EXISTS idx_programme_domain_evidence_programme
    ON skillup_dev.programme_domain_evidence(programme_id);
CREATE INDEX IF NOT EXISTS idx_programme_domain_evidence_domain
    ON skillup_dev.programme_domain_evidence(domain_id);
