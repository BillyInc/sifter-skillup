-- Source-backed provenance for domains, subgroups, roles and tools.
-- Run after migration_career_v2.sql and migration_role_tools.sql.
-- Additive patch: existing rows remain readable while the regenerated seed is
-- applied. The fields deliberately distinguish source-backed, partial and
-- unsourced records instead of presenting gaps as complete data.

ALTER TABLE skillup_dev.domains
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'partial',
    ADD COLUMN IF NOT EXISTS foundation_skill_sources JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.domain_subgroups
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'partial',
    ADD COLUMN IF NOT EXISTS skill_sources JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.domain_roles
    ADD COLUMN IF NOT EXISTS esco_occupation_uris TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'unsourced',
    ADD COLUMN IF NOT EXISTS source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS element_name TEXT,
    ADD COLUMN IF NOT EXISTS element_id TEXT,
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'unsourced',
    ADD COLUMN IF NOT EXISTS source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_domain_tools_element_name
    ON skillup_dev.domain_tools(element_name);
CREATE INDEX IF NOT EXISTS idx_domain_tools_source_state
    ON skillup_dev.domain_tools(source_confidence, data_state);
