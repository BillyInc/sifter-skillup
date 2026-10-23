-- career_item_relationships.from_item_type / to_item_type were constrained
-- to the original 4 item types (skill, competency, tool, certification) at
-- creation in migration_career_item_relationships_2026-09-17.sql. A later
-- migration widened career_context_items.item_type to 7 values, adding
-- method, knowledge and resource, but never carried that widening over to
-- this table. The result: any relationship row naming a method/knowledge/
-- resource item on either side has always been rejected outright by the
-- CHECK constraint -- not caught by ON CONFLICT, since that only applies to
-- unique-key collisions, not CHECK violations. Confirmed on dev
-- (xikcotwdgztaiksoylwg) on 22 October 2026: zero rows in
-- career_item_relationships used any of the three newer types, while 187
-- career_context_items rows already did. The dormant bug surfaced only once
-- seed_d078_guided_content_2026-10-12.sql.gz tried to insert 3 method/tool
-- relationship rows for the Economics area, after its own separate
-- duplicate-value defect (fixed in PR #199) was corrected.
-- Apply after migration_career_item_relationships_2026-09-17.sql.
BEGIN;

ALTER TABLE skillup_dev.career_item_relationships
    DROP CONSTRAINT IF EXISTS career_item_relationships_from_item_type_check;
ALTER TABLE skillup_dev.career_item_relationships
    ADD CONSTRAINT career_item_relationships_from_item_type_check
    CHECK (from_item_type = ANY (ARRAY[
        'skill','competency','tool','certification','method','knowledge','resource'
    ]::text[]));

ALTER TABLE skillup_dev.career_item_relationships
    DROP CONSTRAINT IF EXISTS career_item_relationships_to_item_type_check;
ALTER TABLE skillup_dev.career_item_relationships
    ADD CONSTRAINT career_item_relationships_to_item_type_check
    CHECK (to_item_type IS NULL OR to_item_type = ANY (ARRAY[
        'skill','competency','tool','certification','method','knowledge','resource'
    ]::text[]));

COMMENT ON CONSTRAINT career_item_relationships_from_item_type_check
    ON skillup_dev.career_item_relationships IS
    'Kept in sync with career_context_items_item_type_check -- widen both together.';
COMMENT ON CONSTRAINT career_item_relationships_to_item_type_check
    ON skillup_dev.career_item_relationships IS
    'Kept in sync with career_context_items_item_type_check -- widen both together.';

COMMIT;
