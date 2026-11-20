-- Opt-in, pseudonymous learning-interest signals for platform and school
-- planning. Operational saved plans remain in guidance_report_paths; this is
-- a purpose-limited event ledger, not a student-history or roster API. State
-- filters use the learner's school affiliation, not the university being explored.

BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.learning_interest_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_order BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
    event_id UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('selection_added', 'selection_removed')),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'programme', 'institution', 'domain', 'area', 'role', 'method', 'research_design',
        'skill', 'competency', 'knowledge', 'method_item', 'tool',
        'certification', 'other_learning_item'
    )),
    entity_id TEXT NOT NULL CHECK (length(entity_id) BETWEEN 1 AND 240),
    entity_label TEXT NOT NULL CHECK (length(entity_label) BETWEEN 1 AND 180),
    learner_stage TEXT CHECK (learner_stage IS NULL OR length(learner_stage) <= 40),
    affiliation_school_ids UUID[] NOT NULL DEFAULT '{}',
    affiliation_states TEXT[] NOT NULL DEFAULT '{}',
    programme_id TEXT CHECK (programme_id IS NULL OR length(programme_id) <= 180),
    institution_id TEXT CHECK (institution_id IS NULL OR length(institution_id) <= 180),
    domain_id TEXT CHECK (domain_id IS NULL OR length(domain_id) <= 100),
    area_id TEXT CHECK (area_id IS NULL OR length(area_id) <= 180),
    role_id TEXT CHECK (role_id IS NULL OR length(role_id) <= 180),
    method_ids TEXT[] NOT NULL DEFAULT '{}',
    design_ids TEXT[] NOT NULL DEFAULT '{}',
    route_key TEXT NOT NULL CHECK (length(route_key) <= 520),
    route_label TEXT NOT NULL DEFAULT '' CHECK (length(route_label) <= 420),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_interest_user_route_item_time
    ON skillup_dev.learning_interest_events(user_id, route_key, entity_type, entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_interest_time_context
    ON skillup_dev.learning_interest_events(occurred_at DESC, domain_id, learner_stage, entity_type);
CREATE INDEX IF NOT EXISTS idx_learning_interest_affiliation_states
    ON skillup_dev.learning_interest_events USING GIN (affiliation_states);
CREATE INDEX IF NOT EXISTS idx_learning_interest_affiliation_schools
    ON skillup_dev.learning_interest_events USING GIN (affiliation_school_ids);

CREATE OR REPLACE FUNCTION skillup_dev.snapshot_learning_interest_affiliation_states()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
BEGIN
    SELECT COALESCE(array_agg(DISTINCT a.school_id), '{}')
      INTO NEW.affiliation_school_ids
    FROM skillup_dev.student_affiliations a
    WHERE a.student_id = NEW.user_id;

    SELECT COALESCE(array_agg(DISTINCT upper(trim(s.state))), '{}')
      INTO NEW.affiliation_states
    FROM skillup_dev.student_affiliations a
    JOIN skillup_dev.schools s ON s.id = a.school_id
    WHERE a.student_id = NEW.user_id
      AND NULLIF(trim(COALESCE(s.state, '')), '') IS NOT NULL;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION skillup_dev.snapshot_learning_interest_affiliation_states() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_learning_interest_affiliation_state_snapshot
    ON skillup_dev.learning_interest_events;
CREATE TRIGGER trg_learning_interest_affiliation_state_snapshot
    BEFORE INSERT ON skillup_dev.learning_interest_events
    FOR EACH ROW EXECUTE FUNCTION skillup_dev.snapshot_learning_interest_affiliation_states();

ALTER TABLE skillup_dev.learning_interest_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON skillup_dev.learning_interest_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON skillup_dev.learning_interest_events TO service_role;

-- The backend enforces audience authorization before calling this function.
-- It returns exact aggregates to authorised dashboards; no small-cell
-- suppression is applied by design.
DROP FUNCTION IF EXISTS skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
DROP FUNCTION IF EXISTS skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
DROP FUNCTION IF EXISTS skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
DROP FUNCTION IF EXISTS skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
DROP FUNCTION IF EXISTS skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);

CREATE OR REPLACE FUNCTION skillup_dev.get_learning_interest_analytics(
    p_since TIMESTAMPTZ,
    p_until TIMESTAMPTZ,
    p_school_id UUID DEFAULT NULL,
    p_affiliation_school_id UUID DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_domain_id TEXT DEFAULT NULL,
    p_area_id TEXT DEFAULT NULL,
    p_programme_id TEXT DEFAULT NULL,
    p_institution_id TEXT DEFAULT NULL,
    p_role_id TEXT DEFAULT NULL,
    p_method_id TEXT DEFAULT NULL,
    p_design_id TEXT DEFAULT NULL,
    p_learner_stage TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_item_type TEXT DEFAULT NULL,
    p_item_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
WITH cohort AS (
    SELECT e.*
    FROM skillup_dev.learning_interest_events e
    WHERE (p_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_school_id])
      AND (p_affiliation_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_affiliation_school_id])
), filtered AS (
    SELECT c.* FROM cohort c
    WHERE occurred_at >= p_since AND occurred_at < p_until
      AND (p_entity_type IS NULL OR entity_type = p_entity_type)
      AND (p_domain_id IS NULL OR domain_id = p_domain_id)
      AND (p_area_id IS NULL OR area_id = p_area_id)
      AND (p_programme_id IS NULL OR programme_id = p_programme_id)
      AND (p_institution_id IS NULL OR institution_id = p_institution_id)
      AND (p_role_id IS NULL OR role_id = p_role_id)
      AND (p_method_id IS NULL OR p_method_id = ANY(method_ids))
      AND (p_design_id IS NULL OR p_design_id = ANY(design_ids))
      AND (p_learner_stage IS NULL OR learner_stage = p_learner_stage)
      AND (p_state IS NULL OR c.affiliation_states @> ARRAY[upper(trim(p_state))])
      AND (p_item_id IS NULL OR (entity_id = p_item_id AND (p_item_type IS NULL OR entity_type = p_item_type)))
), previous_filtered AS (
    SELECT c.* FROM cohort c
    WHERE occurred_at >= p_since - (p_until - p_since) AND occurred_at < p_since
      AND (p_entity_type IS NULL OR entity_type = p_entity_type)
      AND (p_domain_id IS NULL OR domain_id = p_domain_id)
      AND (p_area_id IS NULL OR area_id = p_area_id)
      AND (p_programme_id IS NULL OR programme_id = p_programme_id)
      AND (p_institution_id IS NULL OR institution_id = p_institution_id)
      AND (p_role_id IS NULL OR role_id = p_role_id)
      AND (p_method_id IS NULL OR p_method_id = ANY(method_ids))
      AND (p_design_id IS NULL OR p_design_id = ANY(design_ids))
      AND (p_learner_stage IS NULL OR learner_stage = p_learner_stage)
      AND (p_state IS NULL OR c.affiliation_states @> ARRAY[upper(trim(p_state))])
      AND (p_item_id IS NULL OR (entity_id = p_item_id AND (p_item_type IS NULL OR entity_type = p_item_type)))
), top_rows AS (
    SELECT entity_type, entity_id,
           (array_agg(entity_label ORDER BY event_order DESC))[1] AS entity_label,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals,
           count(DISTINCT route_key)::INTEGER AS selected_contexts,
           (array_agg(route_label ORDER BY event_order DESC)
             FILTER (WHERE route_label <> ''))[1] AS latest_context
    FROM filtered
    GROUP BY entity_type, entity_id
    ORDER BY learners DESC, entity_label
    LIMIT 100
), top_routes AS (
    SELECT route_key,
           (array_agg(route_label ORDER BY event_order DESC))[1] AS route_label,
           count(DISTINCT user_id)::INTEGER AS learners,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions
    FROM filtered
    WHERE event_type = 'selection_added' AND route_label <> ''
    GROUP BY route_key
    ORDER BY learners DESC, additions DESC, route_label
    LIMIT 50
), route_totals AS (
    SELECT count(*)::INTEGER AS combinations
    FROM (
        SELECT route_key
        FROM filtered
        WHERE event_type = 'selection_added' AND route_label <> ''
        GROUP BY route_key
    ) distinct_routes
), daily AS (
    SELECT (occurred_at AT TIME ZONE 'UTC')::DATE AS day,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions_raw,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals_raw,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners_raw
    FROM filtered
    GROUP BY 1
    ORDER BY 1
), safe_daily AS (
    SELECT series.day::DATE AS day,
           COALESCE(daily.additions_raw, 0)::INTEGER AS additions,
           COALESCE(daily.removals_raw, 0)::INTEGER AS removals,
           COALESCE(daily.learners_raw, 0)::INTEGER AS learners
    FROM generate_series(
        (p_since AT TIME ZONE 'UTC')::DATE,
        ((p_until - INTERVAL '1 microsecond') AT TIME ZONE 'UTC')::DATE,
        INTERVAL '1 day'
    ) AS series(day)
    LEFT JOIN daily ON daily.day = series.day::DATE
), totals AS (
    SELECT count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS learners_removed,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals
    FROM filtered
), previous_totals AS (
    SELECT count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS learners_removed,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals
    FROM previous_filtered
)
SELECT jsonb_build_object(
    'scope', CASE WHEN p_school_id IS NULL THEN 'platform' ELSE 'school' END,
    'updated_at', now(),
    'learners_who_added', totals.learners,
    'learners_who_removed', totals.learners_removed,
    'selection_additions', totals.additions,
    'selection_removals', totals.removals,
    'route_combinations_total', route_totals.combinations,
    'previous_period', jsonb_build_object(
        'since', p_since - (p_until - p_since),
        'until', p_since,
        'learners_who_added', previous_totals.learners,
        'learners_who_removed', previous_totals.learners_removed,
        'selection_additions', previous_totals.additions,
        'selection_removals', previous_totals.removals
    ),
    'top_selections', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM top_rows t), '[]'::JSONB),
    'top_routes', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM top_routes r), '[]'::JSONB),
    'daily_activity', COALESCE((SELECT jsonb_agg(to_jsonb(d)) FROM safe_daily d), '[]'::JSONB)
)
FROM totals CROSS JOIN previous_totals CROSS JOIN route_totals;
$$;

REVOKE ALL ON FUNCTION skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION skillup_dev.get_learning_interest_filter_options(
    p_since TIMESTAMPTZ,
    p_until TIMESTAMPTZ,
    p_school_id UUID,
    p_query TEXT,
    p_filter_type TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
WITH scoped AS (
    SELECT e.*
    FROM skillup_dev.learning_interest_events e
    WHERE e.occurred_at >= p_since AND e.occurred_at < p_until
      AND (p_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_school_id])
), options_source AS (
    SELECT entity_type AS filter_type, entity_id AS filter_id,
           entity_label AS filter_label, user_id, event_order
    FROM scoped
    UNION ALL
    SELECT 'learner_stage', learner_stage, learner_stage, user_id, event_order
    FROM scoped WHERE NULLIF(trim(COALESCE(learner_stage, '')), '') IS NOT NULL
    UNION ALL
    SELECT 'state', state_code, state_code, user_id, event_order
    FROM scoped CROSS JOIN LATERAL unnest(affiliation_states) AS state_code
    UNION ALL
    SELECT 'affiliation_school', s.id::TEXT,
           COALESCE(NULLIF(trim(s.official_name), ''), s.name),
           scoped.user_id, scoped.event_order
    FROM scoped
    CROSS JOIN LATERAL unnest(scoped.affiliation_school_ids) AS affiliation(school_id)
    JOIN skillup_dev.schools s ON s.id = affiliation.school_id
), labeled_options AS (
    SELECT filter_type, filter_id,
           (array_agg(filter_label ORDER BY event_order DESC))[1] AS filter_label,
           count(DISTINCT user_id)::INTEGER AS learners
    FROM options_source
    GROUP BY filter_type, filter_id
), ranked AS (
    SELECT filter_type, filter_id, filter_label, learners
    FROM labeled_options
    WHERE (p_filter_type IS NULL OR filter_type = p_filter_type)
      AND lower(filter_label) LIKE '%' || lower(trim(p_query)) || '%'
    ORDER BY learners DESC, filter_label, filter_type
    LIMIT 100
)
SELECT jsonb_build_object(
    'options', COALESCE((SELECT jsonb_agg(to_jsonb(ranked)) FROM ranked), '[]'::JSONB)
);
$$;

REVOKE ALL ON FUNCTION skillup_dev.get_learning_interest_filter_options(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION skillup_dev.get_learning_interest_filter_options(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT
) TO service_role;

-- Keep raw event-to-account links only as long as the dashboard can query
-- them: the API window is capped at 365 days, with a 30-day operational buffer.
CREATE OR REPLACE FUNCTION skillup_dev.purge_expired_learning_interest_events()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
DECLARE
    deleted_rows BIGINT;
BEGIN
    DELETE FROM skillup_dev.learning_interest_events
    WHERE occurred_at < NOW() - INTERVAL '395 days';
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    RETURN deleted_rows;
END;
$$;

REVOKE ALL ON FUNCTION skillup_dev.purge_expired_learning_interest_events() FROM PUBLIC, anon, authenticated;

-- Supabase Cron must be enabled before applying this migration. Fail closed:
-- do not deploy linked analytics events without an automatic retention job.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
        RAISE EXCEPTION 'Enable Supabase Cron (pg_cron) before applying learning-interest analytics';
    END IF;
    EXECUTE 'SELECT cron.schedule($1, $2, $3)'
       USING 'levelup-learning-interest-retention',
             '15 3 * * *',
             'SELECT skillup_dev.purge_expired_learning_interest_events()';
END;
$$;

COMMIT;
