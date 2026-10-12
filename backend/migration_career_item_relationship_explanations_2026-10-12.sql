-- Add an explicit learner-facing rationale to typed item relationships.
-- Existing rows remain unchanged and are not automatically promoted. The API
-- omits source-backed edges without a non-empty explanation until reviewed
-- explanation data is authored and evidence-checked.

ALTER TABLE skillup_dev.career_item_relationships
    ADD COLUMN IF NOT EXISTS learner_explanation TEXT;

COMMENT ON COLUMN skillup_dev.career_item_relationships.learner_explanation IS
    'Reviewed plain-language explanation of why this specific relationship applies in context; not a substitute for source references or evidence limitations.';
