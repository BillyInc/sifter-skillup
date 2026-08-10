-- Entrepreneurship / Opportunity Map foundation.
-- No claim-bearing seed data belongs here. Importers must attach evidence rows;
-- unsupported fields render as "not yet evidenced" in the product.

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_evidence_registry (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name         TEXT NOT NULL,
    source_url          TEXT,
    source_type         TEXT NOT NULL DEFAULT 'reference',
    geography           TEXT NOT NULL DEFAULT 'both',
    evidence_status     TEXT NOT NULL DEFAULT 'not_yet_evidenced'
                        CHECK (evidence_status IN ('verified', 'inferred', 'not_yet_evidenced')),
    last_reviewed       DATE,
    reviewer_note       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_domain_coverage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id           TEXT NOT NULL,
    domain_name         TEXT NOT NULL,
    rank                SMALLINT,
    approved_core       BOOLEAN NOT NULL DEFAULT false,
    evidence_status     TEXT NOT NULL DEFAULT 'not_yet_evidenced'
                        CHECK (evidence_status IN ('verified', 'inferred', 'not_yet_evidenced')),
    sources             TEXT[] NOT NULL DEFAULT '{}',
    evidence_note       TEXT,
    last_reviewed       DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_id)
);

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_roles (
    id                    TEXT PRIMARY KEY,
    title                 TEXT NOT NULL,
    role_type             TEXT NOT NULL CHECK (role_type IN ('documented', 'emerging')),
    summary               TEXT,
    domain_ids            TEXT[] NOT NULL DEFAULT '{}',
    venture_modes         TEXT[] NOT NULL DEFAULT '{}',
    opportunity_lenses    TEXT[] NOT NULL DEFAULT '{}',
    entry_modes           TEXT[] NOT NULL DEFAULT '{}',
    capability_layers     TEXT[] NOT NULL DEFAULT '{}',
    partner_requirements  TEXT[] NOT NULL DEFAULT '{}',
    regulation_notes      TEXT[] NOT NULL DEFAULT '{}',
    nigeria_context       TEXT,
    global_context        TEXT,
    evidence_status       TEXT NOT NULL DEFAULT 'not_yet_evidenced'
                          CHECK (evidence_status IN ('verified', 'inferred', 'not_yet_evidenced')),
    sources               TEXT[] NOT NULL DEFAULT '{}',
    evidence_note         TEXT,
    last_reviewed         DATE,
    approved              BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_role_evidence (
    role_id       TEXT NOT NULL REFERENCES skillup_dev.entrepreneurship_roles(id) ON DELETE CASCADE,
    evidence_id   UUID NOT NULL REFERENCES skillup_dev.entrepreneurship_evidence_registry(id) ON DELETE CASCADE,
    claim_field   TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, evidence_id, claim_field)
);

CREATE TABLE IF NOT EXISTS skillup_dev.student_entrepreneurship_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    entry_mode      TEXT,
    domain_id       TEXT,
    venture_modes   TEXT[] NOT NULL DEFAULT '{}',
    lenses          TEXT[] NOT NULL DEFAULT '{}',
    saved_role_ids  TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_entitlement_config (
    id                 TEXT PRIMARY KEY,
    label              TEXT NOT NULL,
    can_save           BOOLEAN NOT NULL DEFAULT false,
    can_compare        BOOLEAN NOT NULL DEFAULT false,
    can_export         BOOLEAN NOT NULL DEFAULT false,
    can_view_full_map  BOOLEAN NOT NULL DEFAULT false,
    price_minor        INTEGER,
    currency           TEXT NOT NULL DEFAULT 'NGN',
    license_days       INTEGER,
    active             BOOLEAN NOT NULL DEFAULT true,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skillup_dev.entrepreneurship_institution_engagement (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id    UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    domain_id         TEXT,
    domain_name       TEXT,
    role_type         TEXT,
    engagement_count  INTEGER NOT NULL DEFAULT 0,
    window_start      DATE,
    window_end        DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE skillup_dev.entrepreneurship_evidence_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.entrepreneurship_domain_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.entrepreneurship_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.entrepreneurship_role_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_entrepreneurship_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.entrepreneurship_entitlement_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.entrepreneurship_institution_engagement ENABLE ROW LEVEL SECURITY;
