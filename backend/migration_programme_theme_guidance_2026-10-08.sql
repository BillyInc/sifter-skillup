-- Fixed, source-reviewed explanations attached to a programme curriculum theme.
-- These are not supplemental learner choices and are separate from contextual
-- career items owned by a domain, area of specialization, or role.
-- Apply after migration_sociology_curriculum_contract_2026-09-17.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.programme_theme_guidance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    theme_key TEXT NOT NULL,
    item_key TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 100,
    item_type TEXT NOT NULL CHECK (item_type IN ('knowledge', 'method', 'competency')),
    title TEXT NOT NULL,
    plain_meaning TEXT NOT NULL,
    everyday_example TEXT NOT NULL,
    contextual_use TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    curriculum_anchors JSONB NOT NULL DEFAULT '[]'::jsonb,
    claim_review_state TEXT NOT NULL DEFAULT 'review_required'
        CHECK (claim_review_state IN ('approved', 'review_required', 'excluded')),
    claim_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    claim_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_label TEXT NOT NULL,
    learning_url TEXT NOT NULL,
    learning_resource_type TEXT NOT NULL,
    learning_source_reference JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_level TEXT,
    learning_duration TEXT,
    learning_access TEXT,
    learning_verified_on DATE,
    selection_state TEXT NOT NULL DEFAULT 'fixed_programme_guidance_not_selectable'
        CHECK (selection_state = 'fixed_programme_guidance_not_selectable'),
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_display BOOLEAN NOT NULL DEFAULT FALSE,
    data_state TEXT NOT NULL DEFAULT 'review_only'
        CHECK (data_state IN ('source_backed', 'review_only', 'excluded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, theme_key, item_key)
);

CREATE INDEX IF NOT EXISTS idx_programme_theme_guidance_student_gate
    ON skillup_dev.programme_theme_guidance
       (programme_id, theme_key, student_display, claim_review_state, data_state);

CREATE TABLE IF NOT EXISTS skillup_dev.programme_theme_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id UUID NOT NULL REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,
    theme_key TEXT NOT NULL,
    relationship_key TEXT NOT NULL,
    from_item_type TEXT NOT NULL,
    from_item_key TEXT NOT NULL,
    from_title TEXT NOT NULL,
    to_item_type TEXT NOT NULL,
    to_item_key TEXT NOT NULL,
    to_title TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    learner_explanation TEXT NOT NULL,
    claim_review_state TEXT NOT NULL DEFAULT 'review_required'
        CHECK (claim_review_state IN ('approved', 'review_required', 'excluded')),
    relationship_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    claim_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_label TEXT NOT NULL,
    learning_url TEXT NOT NULL,
    learning_resource_type TEXT NOT NULL,
    learning_source_reference JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_verified_on DATE,
    selection_state TEXT NOT NULL DEFAULT 'fixed_programme_guidance_not_selectable'
        CHECK (selection_state = 'fixed_programme_guidance_not_selectable'),
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_display BOOLEAN NOT NULL DEFAULT FALSE,
    data_state TEXT NOT NULL DEFAULT 'review_only'
        CHECK (data_state IN ('source_backed', 'review_only', 'excluded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (programme_id, theme_key, relationship_key)
);

CREATE INDEX IF NOT EXISTS idx_programme_theme_relationships_student_gate
    ON skillup_dev.programme_theme_relationships
       (programme_id, theme_key, student_display, claim_review_state, data_state);

ALTER TABLE skillup_dev.programme_theme_guidance
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 100;

COMMENT ON TABLE skillup_dev.programme_theme_guidance IS
    'Fixed programme-owned curriculum explanations with claim evidence and learning resources; never a supplemental selection list.';
COMMENT ON TABLE skillup_dev.programme_theme_relationships IS
    'Fixed programme-owned, directional learning relationships with evidence and learning support; never a supplemental selection list.';

COMMIT;
