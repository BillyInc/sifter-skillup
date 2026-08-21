-- Allow source-backed domain/subgroup/role resources to be saved in My World.
-- Apply after migration_career_v2.sql. Resource identity is the canonical URL;
-- the label stores the source-backed resource title.
SET search_path TO skillup_dev, public;

ALTER TABLE skillup_dev.saved_items
  DROP CONSTRAINT IF EXISTS saved_items_entity_type_check;

ALTER TABLE skillup_dev.saved_items
  ADD CONSTRAINT saved_items_entity_type_check
  CHECK (entity_type IN (
    'programme', 'school', 'domain', 'subgroup', 'role', 'comparison',
    'opportunity', 'organisation', 'elite_pathway', 'resource'
  ));
