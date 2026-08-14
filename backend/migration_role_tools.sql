-- Sifter LevelUp role-owned tools.
-- Run after migration_career_v2.sql and before role tool seed data.
-- Domain and subgroup tools remain separate rows. Role rows must reference the
-- specific domain_roles record; they are never silently inherited by a role.

ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE;

ALTER TABLE skillup_dev.domain_tools
    DROP CONSTRAINT IF EXISTS domain_tools_scope_check;
ALTER TABLE skillup_dev.domain_tools
    ADD CONSTRAINT domain_tools_scope_check
    CHECK (scope IN ('domain', 'subgroup', 'role'));

ALTER TABLE skillup_dev.domain_tools
    DROP CONSTRAINT IF EXISTS domain_tools_role_scope_check;
ALTER TABLE skillup_dev.domain_tools
    ADD CONSTRAINT domain_tools_role_scope_check CHECK (
        (scope = 'role' AND role_id IS NOT NULL)
        OR (scope <> 'role' AND role_id IS NULL)
    );

CREATE INDEX IF NOT EXISTS idx_domain_tools_role
    ON skillup_dev.domain_tools(role_id)
    WHERE role_id IS NOT NULL;
