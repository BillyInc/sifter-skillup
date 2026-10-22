-- Additive reading and market-scope contract for source-backed guidance.
-- Run after migration_career_resources_v1.sql and before any resource seed
-- containing programme_reading rows.

BEGIN;

ALTER TABLE skillup_dev.career_learning_resources
    DROP CONSTRAINT IF EXISTS career_learning_resources_resource_type_check;

ALTER TABLE skillup_dev.career_learning_resources
    ADD CONSTRAINT career_learning_resources_resource_type_check CHECK (resource_type IN (
        'programme_reading',
        'domain_overview',
        'role_reference',
        'skill_reference',
        'skill_learning',
        'competency_reference',
        'certification_exam',
        'professional_body',
        'tool_learning'
    ));

ALTER TABLE skillup_dev.domain_certifications
    ADD COLUMN IF NOT EXISTS market_scope TEXT
        CHECK (market_scope IN ('nigeria', 'global', 'nigeria_and_global', 'not_established'));

COMMENT ON COLUMN skillup_dev.career_learning_resources.resource_type IS
    'programme_reading is a lawful programme text/reference; it must not be presented as a free course unless access_type and description say so.';

COMMENT ON COLUMN skillup_dev.domain_certifications.market_scope IS
    'Evidence scope for the credential. Global or Nigerian placement must not be inferred as local-and-global usefulness without both source layers.';

COMMIT;
