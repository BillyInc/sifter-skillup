-- ============================================================
-- SIFTER LEVELUP — MAPPING FEEDBACK SCHEMA
-- Schema: skillup_dev
-- ============================================================

CREATE TABLE IF NOT EXISTS skillup_dev.mapping_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    edge_type TEXT NOT NULL CHECK (edge_type IN ('domain_role', 'domain_skill', 'domain_cert', 'domain_tool', 'programme_domain')),
    source_id TEXT NOT NULL,      -- e.g. "D001" or "programme_id"
    target_id TEXT NOT NULL,      -- e.g. "Software Engineer" or "domain_id"
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('confirm', 'flag')),
    notes TEXT,
    trust_weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mapping_feedback_edge ON skillup_dev.mapping_feedback(edge_type, source_id);
