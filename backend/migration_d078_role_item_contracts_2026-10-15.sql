-- Dedicated persistence for the 173 D078 role-item contracts.
-- The ledger is staff/backend-only, while the companion role-item seed also
-- projects the currently approved rows into career_context_items, which is the
-- student-facing read surface. This migration is additive.
-- Apply after the canonical D078 taxonomy and contextual-item schema exist.

BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.d078_role_item_contracts (
    queue_position          INTEGER PRIMARY KEY,
    domain_key              TEXT NOT NULL CHECK (domain_key = 'D078'),
    pair_key                TEXT NOT NULL,
    item_label              TEXT NOT NULL,
    priority_snapshot       TEXT NOT NULL CHECK (priority_snapshot IN ('essential', 'optional')),
    placement_status        TEXT NOT NULL CHECK (placement_status IN ('approved', 'unapproved')),
    placement_decision      TEXT NOT NULL,
    final_layer             TEXT NOT NULL,
    role_owner_keys         TEXT[] NOT NULL DEFAULT '{}',
    role_owner_status       TEXT NOT NULL CHECK (role_owner_status IN ('supported', 'unresolved_or_excluded')),
    task_output             TEXT NOT NULL,
    plain_language_meaning  TEXT NOT NULL CHECK (length(btrim(plain_language_meaning)) > 0),
    programme_meaning       TEXT,
    domain_meaning          TEXT,
    area_meaning            TEXT,
    role_application        TEXT,
    prerequisites           JSONB NOT NULL DEFAULT '[]'::jsonb,
    complements             JSONB NOT NULL DEFAULT '[]'::jsonb,
    valid_alternatives      JSONB NOT NULL DEFAULT '[]'::jsonb,
    limitations             JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence                JSONB NOT NULL DEFAULT '[]'::jsonb,
    nigeria_context         JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_link           JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_link_review    JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_locators         JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolved_source_urls    JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_display_approved BOOLEAN NOT NULL DEFAULT FALSE,
    student_visibility      TEXT NOT NULL DEFAULT 'hidden_until_final_student_gate',
    source_artifact         TEXT NOT NULL,
    contract_payload        JSONB NOT NULL,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ((role_owner_status = 'supported' AND cardinality(role_owner_keys) > 0)
        OR (role_owner_status = 'unresolved_or_excluded' AND cardinality(role_owner_keys) = 0))
);

CREATE INDEX IF NOT EXISTS idx_d078_role_item_contract_role_owners
    ON skillup_dev.d078_role_item_contracts USING GIN (role_owner_keys);
CREATE INDEX IF NOT EXISTS idx_d078_role_item_contract_disposition
    ON skillup_dev.d078_role_item_contracts (placement_status, final_layer);

ALTER TABLE skillup_dev.d078_role_item_contracts ENABLE ROW LEVEL SECURITY;
-- Deliberately no anon/authenticated SELECT policy. Backend service-role jobs
-- can read the contract ledger; student routes read only the separately gated
-- career_context_items projection created by seed_d078_role_item_contracts.

COMMENT ON TABLE skillup_dev.d078_role_item_contracts IS
    'Full D078 role-item placement contracts, including approved/unapproved disposition, route owners, task/output, prerequisites, complements, alternatives, limitations and source/link evidence. The table is staff/backend-only; row-level eligibility is not direct student access.';

COMMENT ON COLUMN skillup_dev.d078_role_item_contracts.student_display_approved IS
    'Per-item eligibility for the role-card projection, based on current approval, routed role owner, and verified accessible HTTPS learning/reference link. This does not grant table SELECT or approve the whole graph; eligible rows are materialized separately in career_context_items by the companion seed.';

COMMIT;
