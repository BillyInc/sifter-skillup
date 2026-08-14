-- Role-owned enrichment. Domain and subgroup tools/certifications must not be
-- copied into a role section: each role gets its own source-backed records.
--
-- Role tools already have a canonical home in domain_tools.role_id with
-- scope='role' (see migration_role_tools.sql). Do not create a second
-- role-tools table here. Role certifications are separate because the
-- existing domain_certifications table only supports domain/subgroup rows and
-- role_hint rows, not ownership by a specific domain_roles record.

CREATE TABLE IF NOT EXISTS skillup_dev.role_certifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_key    TEXT NOT NULL REFERENCES skillup_dev.domain_roles(role_key) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    body        TEXT,
    region      TEXT CHECK (region IN ('global', 'nigeria')),
    level       TEXT CHECK (level IN ('foundation', 'professional', 'advanced')),
    gate_reason TEXT,
    source      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_key, name)
);

CREATE INDEX IF NOT EXISTS idx_role_certs_role
    ON skillup_dev.role_certifications(role_key);

ALTER TABLE skillup_dev.role_certifications ENABLE ROW LEVEL SECURITY;
