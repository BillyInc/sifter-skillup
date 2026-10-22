-- Relationship semantics are not enough to impose learner order.
-- Existing rows remain advisory and unapproved; only an explicitly reviewed
-- hard_prerequisite row may block/order a learner's selected plan.

ALTER TABLE skillup_dev.career_item_relationships
    ADD COLUMN IF NOT EXISTS sequence_approved BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sequence_policy TEXT NOT NULL DEFAULT 'advisory'
        CHECK (sequence_policy IN ('hard_prerequisite', 'conditional_prerequisite', 'workflow', 'advisory', 'none')),
    ADD COLUMN IF NOT EXISTS sequence_condition TEXT,
    ADD COLUMN IF NOT EXISTS sequence_scope JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN skillup_dev.career_item_relationships.sequence_approved IS
    'Explicit review gate for using this relationship in learner ordering; defaults false and is independent of source_backed relationship evidence.';
COMMENT ON COLUMN skillup_dev.career_item_relationships.sequence_policy IS
    'How this relationship affects learning order: hard prerequisite, conditional prerequisite, workflow note, advisory connection, or no ordering.';
COMMENT ON COLUMN skillup_dev.career_item_relationships.sequence_condition IS
    'Plain-language route/task condition for a conditional prerequisite or workflow; never inferred from relationship type.';
COMMENT ON COLUMN skillup_dev.career_item_relationships.sequence_scope IS
    'Optional JSON route scope with programmeIds/domainIds/areaIds/roleIds; an out-of-scope relationship cannot constrain the selected route.';
