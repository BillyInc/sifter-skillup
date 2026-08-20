-- Structured representation for every JAMB requirement layer.
--
-- programme_subject_options remains the matchable subject-combination index.
-- This table preserves the complete rule surface as typed JSON so conditions,
-- cross-references, direct-entry text, source variants, and source-blank
-- layers are machine-addressable without pretending they are universal picker
-- combinations.

CREATE TABLE IF NOT EXISTS skillup_dev.programme_subject_rule_records (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jamb_programme_id  UUID NOT NULL REFERENCES skillup_dev.jamb_programmes(id) ON DELETE CASCADE,
    requirement_id     UUID REFERENCES skillup_dev.programme_subject_requirements(id) ON DELETE CASCADE,
    exam_type          TEXT NOT NULL CHECK (exam_type IN ('utme', 'olevel', 'direct_entry')),
    rule_status        TEXT NOT NULL CHECK (rule_status IN (
        'matchable',
        'structured_source',
        'cross_reference',
        'direct_entry',
        'source_missing'
    )),
    rule_kind          TEXT NOT NULL,
    rule_json          JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_text        TEXT,
    source_url         TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (jamb_programme_id, exam_type)
);

CREATE INDEX IF NOT EXISTS idx_subject_rule_records_programme
    ON skillup_dev.programme_subject_rule_records(jamb_programme_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_subject_rule_records_status
    ON skillup_dev.programme_subject_rule_records(rule_status);
