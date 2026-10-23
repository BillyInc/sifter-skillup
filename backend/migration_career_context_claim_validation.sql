-- Claim-level review and learning-link contract for the guided experience.
-- Apply after migration_contextual_career_items.sql. This is additive and
-- deliberately leaves every existing item unapproved until reviewed.
BEGIN;

ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_item_type_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_item_type_check
    CHECK (item_type IN (
        'skill', 'competency', 'tool', 'certification',
        'method', 'knowledge', 'resource'
    ));

ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS claim_review_state TEXT NOT NULL DEFAULT 'review_required',
    ADD COLUMN IF NOT EXISTS claim_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS link_kind TEXT,
    ADD COLUMN IF NOT EXISTS link_level TEXT,
    ADD COLUMN IF NOT EXISTS link_language TEXT,
    ADD COLUMN IF NOT EXISTS link_access TEXT,
    ADD COLUMN IF NOT EXISTS link_duration TEXT;

ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_claim_review_state_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_claim_review_state_check
    CHECK (claim_review_state IN ('approved', 'review_required', 'excluded'));

-- Existing rows have not passed claim-by-claim, checkpoint-specific review.
-- Do not infer approval from source_backed, ownership, or a populated link.
UPDATE skillup_dev.career_context_items
SET claim_review_state = 'review_required',
    claim_evidence = COALESCE(claim_evidence, '{}'::jsonb)
WHERE claim_review_state IS NULL;

CREATE INDEX IF NOT EXISTS idx_career_context_items_student_gate
    ON skillup_dev.career_context_items(
        context_level, context_key, claim_review_state, link_state
    );

COMMIT;
