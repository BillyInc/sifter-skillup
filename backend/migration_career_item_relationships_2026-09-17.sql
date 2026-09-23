-- Normalized, source-backed relationships between contextual career items.
-- Run after migration_contextual_career_items.sql and before the contextual
-- guidance seed parts. This is additive and does not infer unsupported edges.

CREATE TABLE IF NOT EXISTS skillup_dev.career_item_relationships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_level       TEXT NOT NULL CHECK (context_level IN ('programme', 'domain', 'subgroup', 'role')),
    context_key         TEXT NOT NULL,
    domain_key          TEXT NOT NULL,
    from_item_type      TEXT NOT NULL CHECK (from_item_type IN ('skill', 'competency', 'tool', 'certification')),
    from_item_key       TEXT NOT NULL,
    from_name           TEXT NOT NULL,
    to_item_type        TEXT CHECK (to_item_type IS NULL OR to_item_type IN ('skill', 'competency', 'tool', 'certification')),
    to_item_key         TEXT,
    to_name             TEXT,
    relationship_type   TEXT NOT NULL CHECK (relationship_type IN ('builds_on', 'works_with', 'supports', 'alternative', 'complements', 'qualifies_for', 'not_established')),
    relationship_status TEXT NOT NULL DEFAULT 'source_backed'
        CHECK (relationship_status IN ('source_backed', 'review_required', 'not_established')),
    source_ids          TEXT[] NOT NULL DEFAULT '{}',
    source_references   JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_confidence   TEXT NOT NULL DEFAULT 'high'
        CHECK (source_confidence IN ('high', 'medium', 'low')),
    data_state          TEXT NOT NULL DEFAULT 'source_backed'
        CHECK (data_state IN ('source_backed', 'review_required', 'not_established')),
    guidance_owner      TEXT NOT NULL DEFAULT 'review_only'
        CHECK (guidance_owner IN ('programme', 'domain', 'subgroup', 'role', 'review_only', 'audit_only')),
    verified_at         DATE NOT NULL,
    CHECK (
        (relationship_type = 'not_established' AND relationship_status = 'not_established')
        OR (to_item_type IS NOT NULL AND to_item_key IS NOT NULL AND to_name IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_career_item_relationship_edge
    ON skillup_dev.career_item_relationships(
        context_level, context_key, from_item_type, from_item_key,
        relationship_type, COALESCE(to_item_type, ''), COALESCE(to_item_key, '')
    );
CREATE INDEX IF NOT EXISTS idx_career_item_relationship_from
    ON skillup_dev.career_item_relationships(context_level, context_key, from_item_type, from_item_key);
CREATE INDEX IF NOT EXISTS idx_career_item_relationship_to
    ON skillup_dev.career_item_relationships(context_level, context_key, to_item_type, to_item_key);

ALTER TABLE skillup_dev.career_item_relationships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_item_relationships_public_read ON skillup_dev.career_item_relationships;
CREATE POLICY career_item_relationships_public_read
    ON skillup_dev.career_item_relationships FOR SELECT
    USING (true);

COMMENT ON TABLE skillup_dev.career_item_relationships IS
    'Explicit relationships between programme/domain/subgroup/role skills, competencies, tools and credentials; not a guessed tool or certification dependency.';
