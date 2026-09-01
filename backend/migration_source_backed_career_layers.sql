-- Source-backed provenance for domains, subgroups, roles and tools.
-- Run after migration_career_v2.sql and migration_role_tools.sql.
-- Additive patch: existing rows remain readable while the regenerated seed is
-- applied. The fields deliberately distinguish source-backed, partial and
-- unsourced records instead of presenting gaps as complete data.

ALTER TABLE skillup_dev.domains
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'partial',
    ADD COLUMN IF NOT EXISTS foundation_skill_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS nigerian_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.domain_subgroups
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'partial',
    ADD COLUMN IF NOT EXISTS skill_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS nigerian_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS what_people_do TEXT,
    ADD COLUMN IF NOT EXISTS work_context JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS display_order INTEGER;

ALTER TABLE skillup_dev.domain_roles
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS esco_occupation_uris TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS source_confidence TEXT,
    ADD COLUMN IF NOT EXISTS data_state TEXT NOT NULL DEFAULT 'unsourced',
    ADD COLUMN IF NOT EXISTS onet_occupation_codes TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS onet_essential_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
     ADD COLUMN IF NOT EXISTS source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
     ADD COLUMN IF NOT EXISTS nigerian_context JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Learner-facing work evidence is kept separate from the role title and skill
-- checklist. It joins only to source occupation codes already attached to a
-- canonical role; missing matches remain explicit rather than inferred.
CREATE TABLE IF NOT EXISTS skillup_dev.domain_role_work_profiles (
    id                       UUID PRIMARY KEY,
    role_id                  UUID NOT NULL UNIQUE REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE,
    role_key                 TEXT NOT NULL UNIQUE,
    source_record_status     TEXT NOT NULL CHECK (source_record_status IN ('source_backed','source_role_only','not_available')),
    onet_occupation_codes    TEXT[] NOT NULL DEFAULT '{}',
    activities               JSONB NOT NULL DEFAULT '[]'::jsonb,
    work_activities          JSONB NOT NULL DEFAULT '[]'::jsonb,
    job_zones                JSONB NOT NULL DEFAULT '[]'::jsonb,
    education_signals        JSONB NOT NULL DEFAULT '[]'::jsonb,
    work_context             JSONB NOT NULL DEFAULT '[]'::jsonb,
    related_occupations      JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_links             JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_provenance        JSONB NOT NULL DEFAULT '{}'::jsonb,
    limitations              JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_state               TEXT NOT NULL DEFAULT 'source_backed'
);
ALTER TABLE skillup_dev.domain_role_work_profiles
    ADD COLUMN IF NOT EXISTS wef_signals JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_domain_role_work_profiles_status
    ON skillup_dev.domain_role_work_profiles(source_record_status, data_state);

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

-- Cross-domain role families. Existing domain_roles remain domain-scoped so
-- programme scoring and detail pages keep their current contracts. These
-- tables add canonical family/alias/domain relationships without duplicating
-- role-owned skills or tools.
CREATE TABLE IF NOT EXISTS skillup_dev.career_role_families (
    id                   UUID PRIMARY KEY,
    family_key           TEXT NOT NULL UNIQUE,
    canonical_name       TEXT NOT NULL,
    primary_domain_key   TEXT,
    aliases              TEXT[] NOT NULL DEFAULT '{}',
    source_confidence    TEXT NOT NULL DEFAULT 'unsourced',
    data_state            TEXT NOT NULL DEFAULT 'partial',
    source_provenance    JSONB NOT NULL DEFAULT '{}'::jsonb,
    nigerian_context     JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_career_role_families_name
    ON skillup_dev.career_role_families USING gin (to_tsvector('simple', canonical_name));

CREATE TABLE IF NOT EXISTS skillup_dev.career_role_family_domains (
    id                 UUID PRIMARY KEY,
    family_id          UUID NOT NULL REFERENCES skillup_dev.career_role_families(id) ON DELETE CASCADE,
    domain_id          UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_key         TEXT NOT NULL,
    relationship       TEXT NOT NULL CHECK (relationship IN ('primary','secondary','shared_taxonomy','associated')),
    source_provenance  JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(family_id, domain_id)
);
CREATE INDEX IF NOT EXISTS idx_career_role_family_domains_domain
    ON skillup_dev.career_role_family_domains(domain_id);

CREATE TABLE IF NOT EXISTS skillup_dev.career_role_family_aliases (
    id               UUID PRIMARY KEY,
    family_id        UUID NOT NULL REFERENCES skillup_dev.career_role_families(id) ON DELETE CASCADE,
    alias            TEXT NOT NULL,
    normalized_alias TEXT NOT NULL,
    UNIQUE(family_id, normalized_alias)
);
CREATE INDEX IF NOT EXISTS idx_career_role_family_aliases_search
    ON skillup_dev.career_role_family_aliases USING gin (normalized_alias gin_trgm_ops);

CREATE TABLE IF NOT EXISTS skillup_dev.career_role_family_members (
    id           UUID PRIMARY KEY,
    family_id    UUID NOT NULL REFERENCES skillup_dev.career_role_families(id) ON DELETE CASCADE,
    role_key     TEXT NOT NULL,
    domain_id    UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_key   TEXT NOT NULL,
    match_basis  TEXT NOT NULL,
    UNIQUE(family_id, role_key)
);
CREATE INDEX IF NOT EXISTS idx_career_role_family_members_role
    ON skillup_dev.career_role_family_members(role_key);

-- A role keeps one source-backed primary subgroup in domain_roles. Some roles
-- also have a documented quantitative/computational method relationship that
-- should be discoverable from another subgroup without duplicating the role's
-- skills or changing its occupational classification.
CREATE TABLE IF NOT EXISTS skillup_dev.computational_role_subgroup_links (
    id                 UUID PRIMARY KEY,
    role_id            UUID NOT NULL REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE,
    domain_id          UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id        UUID NOT NULL REFERENCES skillup_dev.domain_subgroups(id) ON DELETE CASCADE,
    role_key           TEXT NOT NULL,
    relationship       TEXT NOT NULL CHECK (relationship IN ('related','method')),
    evidence_skills    JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_provenance  JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(role_id, subgroup_id)
);
CREATE INDEX IF NOT EXISTS idx_computational_role_subgroup_links_role
    ON skillup_dev.computational_role_subgroup_links(role_id);
CREATE INDEX IF NOT EXISTS idx_computational_role_subgroup_links_subgroup
    ON skillup_dev.computational_role_subgroup_links(subgroup_id);

-- Source-backed methods are not learner competencies by default. The
-- classification preserves what the source actually says (for example,
-- ESCO classifies social network analysis and game theory as knowledge),
-- while competence_status prevents the UI from implying mastery.
CREATE TABLE IF NOT EXISTS skillup_dev.computational_method_evidence (
    id                 UUID PRIMARY KEY,
    domain_id          UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    subgroup_id        UUID NOT NULL REFERENCES skillup_dev.domain_subgroups(id) ON DELETE CASCADE,
    method_name        TEXT NOT NULL,
    classification     TEXT NOT NULL CHECK (classification IN ('knowledge','skill','competence','tool','unknown')),
    competence_status  TEXT NOT NULL DEFAULT 'not_demonstrated' CHECK (competence_status IN ('not_demonstrated','demonstrated','unknown')),
    esco_id            TEXT,
    description        TEXT,
    evidence_roles     JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_provenance  JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_state         TEXT NOT NULL DEFAULT 'source_backed',
    UNIQUE(subgroup_id, method_name)
);
CREATE INDEX IF NOT EXISTS idx_computational_method_evidence_subgroup
    ON skillup_dev.computational_method_evidence(subgroup_id);
CREATE INDEX IF NOT EXISTS idx_computational_method_evidence_name
    ON skillup_dev.computational_method_evidence(method_name);
