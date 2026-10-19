-- Allows an explicitly approved relationship on an Area of Specialization
-- route to point back to a visible inherited domain item. Apply after
-- migration_career_item_relationships_2026-09-17.sql and its sequence-policy
-- and explanation extensions.

BEGIN;

ALTER TABLE skillup_dev.career_item_relationships
    ADD COLUMN IF NOT EXISTS to_context_level TEXT,
    ADD COLUMN IF NOT EXISTS to_context_key TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'career_item_relationships_to_context_level_check'
          AND conrelid = 'skillup_dev.career_item_relationships'::regclass
    ) THEN
        ALTER TABLE skillup_dev.career_item_relationships
            ADD CONSTRAINT career_item_relationships_to_context_level_check
            CHECK (to_context_level IS NULL OR to_context_level IN ('programme', 'domain', 'subgroup', 'role'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'career_item_relationships_target_context_pair_check'
          AND conrelid = 'skillup_dev.career_item_relationships'::regclass
    ) THEN
        ALTER TABLE skillup_dev.career_item_relationships
            ADD CONSTRAINT career_item_relationships_target_context_pair_check
            CHECK ((to_context_level IS NULL AND to_context_key IS NULL)
                OR (to_context_level IS NOT NULL AND length(btrim(coalesce(to_context_key, ''))) > 0));
    END IF;
END $$;

COMMENT ON COLUMN skillup_dev.career_item_relationships.to_context_level IS
    'Optional target item owner context when a reviewed relationship crosses from a selected area/role route to inherited learning. Same-context edges may leave this null.';
COMMENT ON COLUMN skillup_dev.career_item_relationships.to_context_key IS
    'Context key that owns the relationship target; cross-context targets are exposed only when the target itself passes its normal student content gate.';

COMMIT;
