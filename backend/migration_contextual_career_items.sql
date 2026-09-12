-- Source-backed student explanations for programme, domain, subgroup, role
-- skills, tools, competencies and certifications.
-- certifications at domain, subgroup and role level.
-- Run after migration_career_v2.sql, migration_source_backed_career_layers.sql,
-- migration_role_tools.sql and migration_role_detail_enrichment.sql.
-- The companion generator emits rows only when a claim-specific public source
-- URL exists; it does not turn an unsupported item into a guessed explanation.

CREATE TABLE IF NOT EXISTS skillup_dev.career_context_items (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_level         TEXT NOT NULL CHECK (context_level IN ('programme', 'domain', 'subgroup', 'role')),
    context_key           TEXT NOT NULL,
    domain_key            TEXT NOT NULL,
    item_type             TEXT NOT NULL CHECK (item_type IN ('skill', 'competency', 'tool', 'certification')),
    item_key              TEXT NOT NULL,
    name                  TEXT NOT NULL,
    plain_meaning         TEXT NOT NULL,
    contextual_use        TEXT NOT NULL,
    expected_output       TEXT,
    priority              TEXT NOT NULL CHECK (priority IN ('start_here', 'build_next', 'useful_later', 'optional')),
    priority_reason       TEXT NOT NULL,
    prerequisites         JSONB NOT NULL DEFAULT '[]'::jsonb,
    related_items         JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_ids            TEXT[] NOT NULL DEFAULT '{}',
    source_references     JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_locators       JSONB NOT NULL DEFAULT '[]'::jsonb,
    geographic_scope      TEXT NOT NULL CHECK (geographic_scope IN ('nigeria', 'global', 'nigeria_to_global')),
    evidence_limitations  JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_type         TEXT NOT NULL DEFAULT 'source_supported_synthesis',
    source_confidence     TEXT NOT NULL DEFAULT 'high' CHECK (source_confidence IN ('high', 'medium', 'low')),
    data_state             TEXT NOT NULL DEFAULT 'source_backed' CHECK (data_state = 'source_backed'),
    verified_at            DATE NOT NULL,
    UNIQUE (context_level, context_key, item_type, item_key)
);

CREATE INDEX IF NOT EXISTS idx_career_context_items_context
    ON skillup_dev.career_context_items(context_level, context_key, priority);
CREATE INDEX IF NOT EXISTS idx_career_context_items_domain
    ON skillup_dev.career_context_items(domain_key, context_level);
CREATE INDEX IF NOT EXISTS idx_career_context_items_type
    ON skillup_dev.career_context_items(item_type, item_key);

-- The table was introduced before programme-level context was added. Keep the
-- migration safe for an already-created table as well as a fresh database.
ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_context_level_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_context_level_check
    CHECK (context_level IN ('programme', 'domain', 'subgroup', 'role'));

ALTER TABLE skillup_dev.career_context_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_context_items_public_read ON skillup_dev.career_context_items;
CREATE POLICY career_context_items_public_read
    ON skillup_dev.career_context_items FOR SELECT
    USING (true);
