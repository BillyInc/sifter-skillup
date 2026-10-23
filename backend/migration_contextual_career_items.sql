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
    -- Item-specific learning/resource evidence is separate from the source
    -- references that explain why the item appears in this context.
    link_state             TEXT NOT NULL DEFAULT 'review_required'
        CHECK (link_state IN ('linked', 'no_link', 'review_required')),
    link_url               TEXT,
    link_title             TEXT,
    link_source_reference  JSONB NOT NULL DEFAULT '{}'::jsonb,
    link_accessed_at       DATE,
    link_confidence        TEXT NOT NULL DEFAULT 'low' CHECK (link_confidence IN ('high', 'medium', 'low')),
    link_evidence          JSONB NOT NULL DEFAULT '{}'::jsonb,
    no_link_reason         TEXT,
    -- Ownership is separate from context_level so imported legacy rows can be
    -- retained for audit without becoming student guidance by accident.
    guidance_owner        TEXT NOT NULL DEFAULT 'review_only'
        CHECK (guidance_owner IN ('programme', 'domain', 'subgroup', 'role', 'role_aggregated', 'review_only', 'audit_only')),
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

ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS guidance_owner TEXT NOT NULL DEFAULT 'review_only';
ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS link_state TEXT NOT NULL DEFAULT 'review_required';
ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_link_state_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_link_state_check
    CHECK (link_state IN ('linked', 'no_link', 'review_required'));
ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS link_url TEXT,
    ADD COLUMN IF NOT EXISTS link_title TEXT,
    ADD COLUMN IF NOT EXISTS link_source_reference JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS link_accessed_at DATE,
    ADD COLUMN IF NOT EXISTS link_confidence TEXT NOT NULL DEFAULT 'low',
    ADD COLUMN IF NOT EXISTS link_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS no_link_reason TEXT;
ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_link_confidence_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_link_confidence_check
    CHECK (link_confidence IN ('high', 'medium', 'low'));
ALTER TABLE skillup_dev.career_context_items
    DROP CONSTRAINT IF EXISTS career_context_items_guidance_owner_check;
ALTER TABLE skillup_dev.career_context_items
    ADD CONSTRAINT career_context_items_guidance_owner_check
    CHECK (guidance_owner IN ('programme', 'domain', 'subgroup', 'role', 'role_aggregated', 'review_only', 'audit_only'));

-- Rows created by older seeds have no ownership proof. Keep them available for
-- staff inspection, but fail closed for student guidance until re-seeded with
-- an explicit owner.
UPDATE skillup_dev.career_context_items
SET guidance_owner = 'review_only'
WHERE guidance_owner IS NULL;

ALTER TABLE skillup_dev.career_context_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_context_items_public_read ON skillup_dev.career_context_items;
CREATE POLICY career_context_items_public_read
    ON skillup_dev.career_context_items FOR SELECT
    USING (true);
