-- Sifter LevelUp career learning and professional-resource layer.
-- Run after migration_career_v2.sql and migration_source_backed_career_layers.sql.
-- This migration is schema-only. Do not treat it as a completed population or
-- apply a generated resource seed until the resource audit gate passes.

CREATE TABLE IF NOT EXISTS skillup_dev.career_learning_resources (
    id                UUID PRIMARY KEY,
    domain_id         UUID REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id       UUID REFERENCES skillup_dev.domain_subgroups(id) ON DELETE CASCADE,
    role_id           UUID REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE,
    resource_type     TEXT NOT NULL CHECK (resource_type IN (
        'programme_reading',
        'domain_overview',
        'role_reference',
        'skill_reference',
        'skill_learning',
        'competency_reference',
        'certification_exam',
        'professional_body',
        'tool_learning'
    )),
    target_name       TEXT NOT NULL,
    provider          TEXT NOT NULL,
    region            TEXT NOT NULL CHECK (region IN ('nigeria', 'global', 'global_proxy')),
    access_type       TEXT NOT NULL CHECK (access_type IN ('free', 'paid', 'mixed', 'dynamic')),
    delivery          TEXT,
    url               TEXT NOT NULL CHECK (url ~ '^https://'),
    price             NUMERIC(12,2),
    currency          TEXT CHECK (currency IN ('NGN', 'USD', 'GBP', 'EUR')),
    price_period      TEXT,
    price_as_of      DATE,
    price_source      TEXT,
    source_url        TEXT,
    description       TEXT,
    source_confidence TEXT NOT NULL DEFAULT 'medium',
    data_state        TEXT NOT NULL DEFAULT 'source_backed',
    source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        price IS NULL
        OR (price_source IS NOT NULL AND price_as_of IS NOT NULL)
    ),
    UNIQUE (domain_id, subgroup_id, role_id, resource_type, target_name, provider, url)
);

CREATE INDEX IF NOT EXISTS idx_career_resources_domain
    ON skillup_dev.career_learning_resources(domain_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_career_resources_subgroup
    ON skillup_dev.career_learning_resources(subgroup_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_career_resources_role
    ON skillup_dev.career_learning_resources(role_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_career_resources_target
    ON skillup_dev.career_learning_resources USING gin (to_tsvector('simple', target_name));

COMMENT ON TABLE skillup_dev.career_learning_resources IS
    'Source-backed links for domain, subgroup, role, skill, competency, tool and professional credential guidance.';
