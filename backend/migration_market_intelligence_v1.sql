-- ============================================================
-- SIFTER LEVELUP — MARKET INTELLIGENCE v1
-- Schema: skillup_dev
-- Run AFTER migration_career_v2.sql
--
-- Purpose:
--   Adds the source/provenance and volume x value fields needed for the
--   LevelUp market-intelligence model:
--   global vs Nigerian-local vs Nigerian-remote, posting windows, value bands,
--   high-value/low-volume roles, and source/license discipline.
-- ============================================================

CREATE TABLE IF NOT EXISTS skillup_dev.domain_source_registry (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id            UUID REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_key           TEXT NOT NULL,
    source_category      TEXT NOT NULL CHECK (
                            source_category IN (
                              'taxonomy',
                              'professional_body',
                              'labour_market',
                              'certification_body',
                              'nigerian_regulator',
                              'curriculum',
                              'manual_review'
                            )
                          ),
    source_name          TEXT NOT NULL,
    source_url           TEXT,
    local_file           TEXT,
    licence_class        TEXT NOT NULL DEFAULT 'unknown'
                          CHECK (licence_class IN (
                            'redistributable',
                            'reference_only',
                            'restricted',
                            'paid',
                            'unknown'
                          )),
    coverage_confidence  TEXT NOT NULL DEFAULT 'pending'
                          CHECK (coverage_confidence IN ('high', 'medium', 'low', 'pending')),
    update_cadence       TEXT,
    nigeria_notes        TEXT,
    missing_role_notes   TEXT,
    last_checked_at      TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_key, source_category, source_name)
);
CREATE INDEX IF NOT EXISTS idx_domain_source_registry_domain
    ON skillup_dev.domain_source_registry(domain_key);
CREATE INDEX IF NOT EXISTS idx_domain_source_registry_licence
    ON skillup_dev.domain_source_registry(licence_class);

CREATE TABLE IF NOT EXISTS skillup_dev.market_metric_sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_scope    TEXT NOT NULL CHECK (metric_scope IN ('domain', 'subgroup', 'role', 'tool', 'certification')),
    entity_id       TEXT NOT NULL,
    rank_lens       TEXT CHECK (rank_lens IN ('global', 'ng_local', 'ng_remote')),
    source_name     TEXT NOT NULL,
    source_url      TEXT,
    licence_class   TEXT NOT NULL DEFAULT 'unknown'
                    CHECK (licence_class IN (
                      'redistributable',
                      'reference_only',
                      'restricted',
                      'paid',
                      'unknown'
                    )),
    method          TEXT, -- rss_poll | api_count | manual_snapshot | aggregate_rollup | salary_anchor
    confidence      TEXT NOT NULL DEFAULT 'pending'
                    CHECK (confidence IN ('high', 'medium', 'low', 'pending')),
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_payload  JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(metric_scope, entity_id, rank_lens, source_name, collected_at)
);
CREATE INDEX IF NOT EXISTS idx_market_metric_sources_entity
    ON skillup_dev.market_metric_sources(metric_scope, entity_id);
CREATE INDEX IF NOT EXISTS idx_market_metric_sources_lens
    ON skillup_dev.market_metric_sources(rank_lens);

ALTER TABLE skillup_dev.domain_demand_metrics
    ADD COLUMN IF NOT EXISTS postings_12m INTEGER,
    ADD COLUMN IF NOT EXISTS postings_24m INTEGER,
    ADD COLUMN IF NOT EXISTS postings_36m INTEGER,
    ADD COLUMN IF NOT EXISTS employer_count INTEGER,
    ADD COLUMN IF NOT EXISTS employer_concentration NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS value_band TEXT
        CHECK (value_band IN ('high', 'medium', 'low', 'unknown')),
    ADD COLUMN IF NOT EXISTS demand_band TEXT
        CHECK (demand_band IN ('high', 'medium', 'low', 'unknown')),
    ADD COLUMN IF NOT EXISTS quadrant TEXT
        CHECK (quadrant IN (
          'high_demand_high_value',
          'high_demand_lower_value',
          'low_demand_high_value',
          'low_demand_low_value',
          'emerging_high_growth',
          'insufficient_data'
        )),
    ADD COLUMN IF NOT EXISTS interpretation TEXT,
    ADD COLUMN IF NOT EXISTS source_confidence TEXT
        CHECK (source_confidence IN ('high', 'medium', 'low', 'pending'));

ALTER TABLE skillup_dev.role_demand_metrics
    ADD COLUMN IF NOT EXISTS postings_12m INTEGER,
    ADD COLUMN IF NOT EXISTS postings_24m INTEGER,
    ADD COLUMN IF NOT EXISTS postings_36m INTEGER,
    ADD COLUMN IF NOT EXISTS employer_count INTEGER,
    ADD COLUMN IF NOT EXISTS employer_concentration NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS value_band TEXT
        CHECK (value_band IN ('high', 'medium', 'low', 'unknown')),
    ADD COLUMN IF NOT EXISTS demand_band TEXT
        CHECK (demand_band IN ('high', 'medium', 'low', 'unknown')),
    ADD COLUMN IF NOT EXISTS quadrant TEXT
        CHECK (quadrant IN (
          'high_demand_high_value',
          'high_demand_lower_value',
          'low_demand_high_value',
          'low_demand_low_value',
          'emerging_high_growth',
          'insufficient_data'
        )),
    ADD COLUMN IF NOT EXISTS interpretation TEXT,
    ADD COLUMN IF NOT EXISTS source_confidence TEXT
        CHECK (source_confidence IN ('high', 'medium', 'low', 'pending'));

ALTER TABLE skillup_dev.domain_source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.market_metric_sources ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE skillup_dev.domain_source_registry FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.market_metric_sources FROM anon, authenticated;

-- ============================================================
-- END migration_market_intelligence_v1.sql
-- ============================================================
