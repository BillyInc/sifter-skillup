-- Theme/use-case labels, path-specific requirement status, and explicit
-- downstream destinations for programme/domain/specialization/role learning.
-- Apply after migration_contextual_career_items.sql. This is additive; it does
-- not infer requirements or specialization membership from existing rows.

ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS theme_key TEXT,
    ADD COLUMN IF NOT EXISTS theme_label TEXT,
    ADD COLUMN IF NOT EXISTS use_case_key TEXT,
    ADD COLUMN IF NOT EXISTS requirement_level TEXT,
    ADD COLUMN IF NOT EXISTS requirement_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'career_context_items_requirement_level_check'
          AND conrelid = 'skillup_dev.career_context_items'::regclass
    ) THEN
        ALTER TABLE skillup_dev.career_context_items
            ADD CONSTRAINT career_context_items_requirement_level_check
            CHECK (requirement_level IS NULL OR requirement_level IN ('needed', 'useful', 'optional'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_career_context_items_theme
    ON skillup_dev.career_context_items(context_level, context_key, theme_key, use_case_key);

CREATE TABLE IF NOT EXISTS skillup_dev.career_item_path_targets (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_level         TEXT NOT NULL CHECK (context_level IN ('programme', 'domain', 'subgroup', 'role')),
    context_key           TEXT NOT NULL,
    domain_key            TEXT NOT NULL,
    from_item_type        TEXT NOT NULL CHECK (from_item_type IN ('skill', 'competency', 'tool', 'certification')),
    from_item_key         TEXT NOT NULL,
    target_level          TEXT NOT NULL CHECK (target_level IN ('subgroup', 'role')),
    target_key            TEXT NOT NULL,
    target_label          TEXT NOT NULL,
    use_case_key          TEXT NOT NULL DEFAULT '',
    requirement_level     TEXT NOT NULL CHECK (requirement_level IN ('needed', 'useful', 'optional')),
    path_reason           TEXT NOT NULL,
    relationship_status   TEXT NOT NULL DEFAULT 'review_required'
        CHECK (relationship_status IN ('source_backed', 'review_required', 'not_established')),
    data_state            TEXT NOT NULL DEFAULT 'review_required'
        CHECK (data_state IN ('source_backed', 'review_required', 'not_established')),
    guidance_owner        TEXT NOT NULL DEFAULT 'review_only'
        CHECK (guidance_owner IN ('programme', 'domain', 'subgroup', 'role', 'review_only', 'audit_only')),
    source_ids            TEXT[] NOT NULL DEFAULT '{}',
    source_references     JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_limitations  JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_confidence     TEXT NOT NULL DEFAULT 'low'
        CHECK (source_confidence IN ('high', 'medium', 'low')),
    verified_at           DATE NOT NULL,
    CHECK (length(trim(context_key)) > 0),
    CHECK (length(trim(from_item_key)) > 0),
    CHECK (length(trim(target_key)) > 0),
    CHECK (relationship_status <> 'source_backed' OR data_state = 'source_backed'),
    CHECK (
        relationship_status <> 'source_backed'
        OR (cardinality(source_ids) > 0 AND jsonb_array_length(source_references) > 0)
    ),
    UNIQUE (context_level, context_key, from_item_type, from_item_key, target_level, target_key, use_case_key)
);

CREATE INDEX IF NOT EXISTS idx_career_item_path_targets_source
    ON skillup_dev.career_item_path_targets(context_level, context_key, from_item_type, from_item_key);
CREATE INDEX IF NOT EXISTS idx_career_item_path_targets_destination
    ON skillup_dev.career_item_path_targets(domain_key, target_level, target_key);

ALTER TABLE skillup_dev.career_item_path_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_item_path_targets_public_read ON skillup_dev.career_item_path_targets;
CREATE POLICY career_item_path_targets_public_read
    ON skillup_dev.career_item_path_targets FOR SELECT
    USING (true);

COMMENT ON TABLE skillup_dev.career_item_path_targets IS
    'Evidence-backed, item-specific applicability links from a learning item to an area-of-specialization or role path. A link means the item supports that path; it does not guarantee employment.';
COMMENT ON COLUMN skillup_dev.career_context_items.requirement_level IS
    'Path-specific necessity claim (needed/useful/optional), distinct from pedagogical priority/order. NULL means not classified and must not be rendered as a confirmed requirement.';
