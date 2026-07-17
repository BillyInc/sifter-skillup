-- ============================================================
-- SIFTER LEVELUP — ROLE-LEVEL TOOLS (L3T)
-- Schema: skillup_dev
-- Run AFTER migration_career_v2.sql, BEFORE the regenerated seed_career_v2.sql
--
-- Extends domain_tools to carry role-scoped tools (the most specific layer
-- of the 6-layer skills/tools framework). Sourced from O*NET Technology
-- Skills via the role→SOC title crosswalk; roles without a SOC match keep
-- no rows here and the UI falls back to their subgroup's tools (labelled
-- "inherited" client-side).
-- ============================================================

ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE;

-- widen the scope check: 'domain' | 'subgroup' | 'role'
ALTER TABLE skillup_dev.domain_tools
    DROP CONSTRAINT IF EXISTS domain_tools_scope_check;
ALTER TABLE skillup_dev.domain_tools
    ADD CONSTRAINT domain_tools_scope_check CHECK (scope IN ('domain','subgroup','role'));

-- role-scoped rows must reference a role; other scopes must not
ALTER TABLE skillup_dev.domain_tools
    DROP CONSTRAINT IF EXISTS domain_tools_role_scope_check;
ALTER TABLE skillup_dev.domain_tools
    ADD CONSTRAINT domain_tools_role_scope_check CHECK (
        (scope = 'role' AND role_id IS NOT NULL)
        OR (scope <> 'role' AND role_id IS NULL)
    );

CREATE INDEX IF NOT EXISTS idx_domain_tools_role ON skillup_dev.domain_tools(role_id)
    WHERE role_id IS NOT NULL;
