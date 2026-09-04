-- ============================================================
-- SIFTER LEVELUP — ELITE EVIDENCE GATE
-- Run after migration_career_v2.sql and migration_phase7_content.sql.
--
-- Existing elite_domain / elite_flag values are retained as historical
-- candidate signals. They are not publishable evidence. This migration adds
-- the review record and the domain-specific pathway edge needed to publish
-- only source-backed routes.
-- ============================================================

-- 1. Evidence decision for a domain, subgroup, role, or route.
CREATE TABLE IF NOT EXISTS skillup_dev.elite_evidence_reviews (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_level                 TEXT NOT NULL CHECK (entity_level IN ('domain','subgroup','role','route')),
    entity_id                    TEXT NOT NULL,
    domain_id                    UUID REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id                  UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE CASCADE,
    role_key                     TEXT,
    scope                        TEXT NOT NULL CHECK (scope IN ('nigeria','global','nigeria_to_global')),
    decision                     TEXT NOT NULL DEFAULT 'not_established'
                                 CHECK (decision IN ('not_established','provisional','published')),
    specialist_identity          BOOLEAN NOT NULL DEFAULT false,
    entry_barrier                BOOLEAN NOT NULL DEFAULT false,
    recognised_or_scarce_outcome BOOLEAN NOT NULL DEFAULT false,
    documented_route             BOOLEAN NOT NULL DEFAULT false,
    scope_specific_sources       BOOLEAN NOT NULL DEFAULT false,
    source_ids                   JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_explanation         TEXT NOT NULL DEFAULT '',
    limitations                  JSONB NOT NULL DEFAULT '[]'::jsonb,
    reviewed_by                  TEXT,
    reviewed_at                  TIMESTAMPTZ,
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_level, entity_id, scope)
);
CREATE INDEX IF NOT EXISTS idx_elite_reviews_entity
    ON skillup_dev.elite_evidence_reviews(entity_level, entity_id);
CREATE INDEX IF NOT EXISTS idx_elite_reviews_published
    ON skillup_dev.elite_evidence_reviews(entity_level, decision)
    WHERE decision = 'published';

-- 2. A route is attached to a specific domain-role occurrence. The same role
-- can therefore have different evidence, bridge steps, or destinations in
-- different domains without pretending that one generic pathway fits all.
CREATE TABLE IF NOT EXISTS skillup_dev.elite_route_edges (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_role_id        UUID NOT NULL REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE,
    domain_id             UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id           UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE SET NULL,
    role_key              TEXT NOT NULL,
    scope                 TEXT NOT NULL CHECK (scope IN ('nigeria','global','nigeria_to_global')),
    publication_status    TEXT NOT NULL DEFAULT 'not_established'
                          CHECK (publication_status IN ('not_established','provisional','published')),
    pathway_name          TEXT NOT NULL,
    why_this_route        TEXT NOT NULL DEFAULT '',
    starting_points       JSONB NOT NULL DEFAULT '[]'::jsonb,
    ordered_steps         JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_preparation  JSONB NOT NULL DEFAULT '[]'::jsonb,
    optional_preparation  JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_source_ids   JSONB NOT NULL DEFAULT '[]'::jsonb,
    limitations           JSONB NOT NULL DEFAULT '[]'::jsonb,
    bridge_plan_id        UUID REFERENCES skillup_dev.bridge_plans(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_role_id, scope)
);
CREATE INDEX IF NOT EXISTS idx_elite_route_edges_domain
    ON skillup_dev.elite_route_edges(domain_id, publication_status);
CREATE INDEX IF NOT EXISTS idx_elite_route_edges_role
    ON skillup_dev.elite_route_edges(role_key);

-- 3. Make the existing domain-level pathway table evidence-aware. Existing
-- rows, if any, remain inactive until their review is explicitly published.
ALTER TABLE skillup_dev.elite_pathways
    ADD COLUMN IF NOT EXISTS elite_scope TEXT;
ALTER TABLE skillup_dev.elite_pathways
    ADD COLUMN IF NOT EXISTS entity_level TEXT NOT NULL DEFAULT 'domain';
ALTER TABLE skillup_dev.elite_pathways
    ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'not_established';
ALTER TABLE skillup_dev.elite_pathways
    ADD COLUMN IF NOT EXISTS evidence_source_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE skillup_dev.elite_pathways
    ADD COLUMN IF NOT EXISTS evidence_explanation TEXT NOT NULL DEFAULT '';

-- A legacy row cannot become visible merely because active=true.
UPDATE skillup_dev.elite_pathways
SET publication_status = 'not_established'
WHERE publication_status IS NULL OR publication_status <> 'published';

-- 4. No direct browser access: reviews and pathway content are served by the
-- API service, which can apply the publication gate and guest restrictions.
ALTER TABLE skillup_dev.elite_evidence_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.elite_route_edges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE skillup_dev.elite_evidence_reviews FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.elite_route_edges FROM anon, authenticated;

-- ============================================================
-- END migration_elite_evidence_gate.sql
