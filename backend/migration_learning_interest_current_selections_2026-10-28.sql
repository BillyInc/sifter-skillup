-- Add a consent-gated current-selection snapshot beside the retained,
-- time-bounded activity ledger. This is an additive migration after
-- migration_learning_interest_analytics_2026-10-26.sql.
BEGIN;

ALTER TABLE skillup_dev.learning_interest_events
    ADD COLUMN IF NOT EXISTS selection_scope_key TEXT;

-- Creating a separate D078 route copies the learner's current choices into a
-- second route. Keep that distinct from a new add action in activity metrics,
-- while still materializing the copied choices in the active snapshot.
ALTER TABLE skillup_dev.learning_interest_events
    DROP CONSTRAINT IF EXISTS learning_interest_events_event_type_check;
ALTER TABLE skillup_dev.learning_interest_events
    ADD CONSTRAINT learning_interest_events_event_type_check
    CHECK (event_type IN ('selection_added', 'selection_removed', 'selection_copied'));

CREATE TABLE IF NOT EXISTS skillup_dev.learning_interest_active_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    selection_scope_key TEXT NOT NULL CHECK (length(selection_scope_key) = 64),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'programme', 'institution', 'domain', 'area', 'role', 'method', 'research_design',
        'skill', 'competency', 'knowledge', 'method_item', 'tool',
        'certification', 'other_learning_item'
    )),
    entity_id TEXT NOT NULL CHECK (length(entity_id) BETWEEN 1 AND 240),
    entity_label TEXT NOT NULL CHECK (length(entity_label) BETWEEN 1 AND 180),
    learner_stage TEXT,
    affiliation_school_ids UUID[] NOT NULL DEFAULT '{}',
    affiliation_states TEXT[] NOT NULL DEFAULT '{}',
    programme_id TEXT,
    institution_id TEXT,
    domain_id TEXT,
    area_id TEXT,
    role_id TEXT,
    method_ids TEXT[] NOT NULL DEFAULT '{}',
    design_ids TEXT[] NOT NULL DEFAULT '{}',
    route_key TEXT NOT NULL,
    route_label TEXT NOT NULL DEFAULT '',
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, selection_scope_key, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_interest_active_entity
    ON skillup_dev.learning_interest_active_selections(entity_type, entity_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_interest_active_context
    ON skillup_dev.learning_interest_active_selections(domain_id, learner_stage, entity_type);
CREATE INDEX IF NOT EXISTS idx_learning_interest_active_affiliation_schools
    ON skillup_dev.learning_interest_active_selections USING GIN (affiliation_school_ids);
CREATE INDEX IF NOT EXISTS idx_learning_interest_active_affiliation_states
    ON skillup_dev.learning_interest_active_selections USING GIN (affiliation_states);

-- Do not retain a current-intent record whose user has stale/withdrawn consent
-- merely because that user has not logged in to trigger the user-update hook.
DELETE FROM skillup_dev.learning_interest_active_selections a
WHERE NOT EXISTS (
    SELECT 1 FROM skillup_dev.users u
    WHERE u.id = a.user_id
      AND u.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
      AND COALESCE(u.is_deleted, FALSE) = FALSE
);

ALTER TABLE skillup_dev.learning_interest_active_selections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON skillup_dev.learning_interest_active_selections FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION skillup_dev.sync_learning_interest_active_selection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
BEGIN
    IF NEW.selection_scope_key IS NULL OR length(NEW.selection_scope_key) <> 64 THEN
        -- Keep legacy app instances able to append activity while the client
        -- rollout is in progress; only scoped events participate in snapshots.
        RETURN NEW;
    END IF;

    IF NEW.event_type IN ('selection_added', 'selection_copied') THEN
        INSERT INTO skillup_dev.learning_interest_active_selections (
            user_id, selection_scope_key, entity_type, entity_id, entity_label,
            learner_stage, affiliation_school_ids, affiliation_states,
            programme_id, institution_id, domain_id, area_id, role_id,
            method_ids, design_ids, route_key, route_label, selected_at, updated_at
        ) VALUES (
            NEW.user_id, NEW.selection_scope_key, NEW.entity_type, NEW.entity_id, NEW.entity_label,
            NEW.learner_stage, NEW.affiliation_school_ids, NEW.affiliation_states,
            NEW.programme_id, NEW.institution_id, NEW.domain_id, NEW.area_id, NEW.role_id,
            NEW.method_ids, NEW.design_ids, NEW.route_key, NEW.route_label, NEW.occurred_at, NOW()
        )
        ON CONFLICT (user_id, selection_scope_key, entity_type, entity_id)
        DO UPDATE SET
            entity_label = EXCLUDED.entity_label,
            learner_stage = EXCLUDED.learner_stage,
            affiliation_school_ids = EXCLUDED.affiliation_school_ids,
            affiliation_states = EXCLUDED.affiliation_states,
            programme_id = EXCLUDED.programme_id,
            institution_id = EXCLUDED.institution_id,
            domain_id = EXCLUDED.domain_id,
            area_id = EXCLUDED.area_id,
            role_id = EXCLUDED.role_id,
            method_ids = EXCLUDED.method_ids,
            design_ids = EXCLUDED.design_ids,
            route_key = EXCLUDED.route_key,
            route_label = EXCLUDED.route_label,
            selected_at = EXCLUDED.selected_at,
            updated_at = NOW();
    ELSE
        DELETE FROM skillup_dev.learning_interest_active_selections
        WHERE user_id = NEW.user_id
          AND selection_scope_key = NEW.selection_scope_key
          AND entity_type = NEW.entity_type
          AND entity_id = NEW.entity_id;
    END IF;

    -- Refresh route metadata on every remaining selection in this route scope
    -- so active route aggregates reflect the latest choice state. Preserve the
    -- learner stage and affiliated-school/state values captured when each
    -- individual choice was made; a later edit must not rewrite attribution.
    UPDATE skillup_dev.learning_interest_active_selections
    SET programme_id = NEW.programme_id,
        institution_id = NEW.institution_id,
        domain_id = NEW.domain_id,
        area_id = NEW.area_id,
        role_id = NEW.role_id,
        method_ids = NEW.method_ids,
        design_ids = NEW.design_ids,
        route_key = NEW.route_key,
        route_label = NEW.route_label,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND selection_scope_key = NEW.selection_scope_key;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION skillup_dev.sync_learning_interest_active_selection() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_learning_interest_active_selection ON skillup_dev.learning_interest_events;
CREATE TRIGGER trg_learning_interest_active_selection
    AFTER INSERT ON skillup_dev.learning_interest_events
    FOR EACH ROW EXECUTE FUNCTION skillup_dev.sync_learning_interest_active_selection();

-- The current snapshot is valid only under the current, affirmative consent.
-- A stale-consent transition or withdrawal clears active intent; an account
-- that freshly opts in starts a new snapshot from subsequent explicit choices.
CREATE OR REPLACE FUNCTION skillup_dev.clear_learning_interest_snapshot_on_consent_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
DECLARE
    old_current_consent BOOLEAN;
    new_current_consent BOOLEAN;
BEGIN
    old_current_consent := COALESCE((
        OLD.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
        AND OLD.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
        AND OLD.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
    ), FALSE);
    new_current_consent := COALESCE((
        NEW.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
        AND NEW.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
        AND NEW.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
    ), FALSE);

    IF NOT old_current_consent OR NOT new_current_consent OR COALESCE(NEW.is_deleted, FALSE) THEN
        DELETE FROM skillup_dev.learning_interest_active_selections WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION skillup_dev.clear_learning_interest_snapshot_on_consent_change() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_clear_learning_interest_snapshot_on_consent_change ON skillup_dev.users;
CREATE TRIGGER trg_clear_learning_interest_snapshot_on_consent_change
    AFTER UPDATE OF settings, is_deleted ON skillup_dev.users
    FOR EACH ROW
    WHEN (OLD.settings IS DISTINCT FROM NEW.settings OR OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
    EXECUTE FUNCTION skillup_dev.clear_learning_interest_snapshot_on_consent_change();

-- The existing #20 Cron job already calls this function daily. Extend its
-- cleanup to stale consent snapshots without adding a second scheduled job.
CREATE OR REPLACE FUNCTION skillup_dev.purge_expired_learning_interest_events()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = skillup_dev, pg_temp
AS $$
DECLARE
    deleted_events BIGINT;
    deleted_snapshots BIGINT;
BEGIN
    DELETE FROM skillup_dev.learning_interest_events
    WHERE occurred_at < NOW() - INTERVAL '395 days';
    GET DIAGNOSTICS deleted_events = ROW_COUNT;

    DELETE FROM skillup_dev.learning_interest_active_selections a
    WHERE NOT EXISTS (
        SELECT 1 FROM skillup_dev.users u
        WHERE u.id = a.user_id
          AND u.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
          AND u.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
          AND u.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
          AND COALESCE(u.is_deleted, FALSE) = FALSE
    );
    GET DIAGNOSTICS deleted_snapshots = ROW_COUNT;
    RETURN deleted_events + deleted_snapshots;
END;
$$;

REVOKE ALL ON FUNCTION skillup_dev.purge_expired_learning_interest_events() FROM PUBLIC, anon, authenticated;

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
WITH event_cohort AS (
    SELECT e.* FROM skillup_dev.learning_interest_events e
    WHERE (p_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_school_id])
      AND (p_affiliation_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_affiliation_school_id])
), filtered AS (
    SELECT c.* FROM event_cohort c
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
      AND (p_state IS NULL OR affiliation_states @> ARRAY[upper(trim(p_state))])
      AND (p_item_id IS NULL OR
           (p_item_type = 'route_pattern' AND route_key = p_item_id) OR
           (p_item_type IS DISTINCT FROM 'route_pattern' AND entity_id = p_item_id
             AND (p_item_type IS NULL OR entity_type = p_item_type)))
), previous_filtered AS (
    SELECT c.* FROM event_cohort c
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
      AND (p_state IS NULL OR affiliation_states @> ARRAY[upper(trim(p_state))])
      AND (p_item_id IS NULL OR
           (p_item_type = 'route_pattern' AND route_key = p_item_id) OR
           (p_item_type IS DISTINCT FROM 'route_pattern' AND entity_id = p_item_id
             AND (p_item_type IS NULL OR entity_type = p_item_type)))
), current_cohort AS (
    SELECT a.* FROM skillup_dev.learning_interest_active_selections a
    JOIN skillup_dev.users u ON u.id = a.user_id
    WHERE u.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
      AND COALESCE(u.is_deleted, FALSE) = FALSE
      AND (p_school_id IS NULL OR a.affiliation_school_ids @> ARRAY[p_school_id])
      AND (p_affiliation_school_id IS NULL OR a.affiliation_school_ids @> ARRAY[p_affiliation_school_id])
), current_filtered AS (
    SELECT c.* FROM current_cohort c
    WHERE (p_entity_type IS NULL OR entity_type = p_entity_type)
      AND (p_domain_id IS NULL OR domain_id = p_domain_id)
      AND (p_area_id IS NULL OR area_id = p_area_id)
      AND (p_programme_id IS NULL OR programme_id = p_programme_id)
      AND (p_institution_id IS NULL OR institution_id = p_institution_id)
      AND (p_role_id IS NULL OR role_id = p_role_id)
      AND (p_method_id IS NULL OR p_method_id = ANY(method_ids))
      AND (p_design_id IS NULL OR p_design_id = ANY(design_ids))
      AND (p_learner_stage IS NULL OR learner_stage = p_learner_stage)
      AND (p_state IS NULL OR affiliation_states @> ARRAY[upper(trim(p_state))])
      AND (p_item_id IS NULL OR
           (p_item_type = 'route_pattern' AND route_key = p_item_id) OR
           (p_item_type IS DISTINCT FROM 'route_pattern' AND entity_id = p_item_id
             AND (p_item_type IS NULL OR entity_type = p_item_type)))
), event_rows AS (
    SELECT entity_type, entity_id,
           (array_agg(entity_label ORDER BY event_order DESC))[1] AS event_label,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals,
           count(DISTINCT route_key) FILTER (WHERE event_type = 'selection_added')::INTEGER AS selected_contexts,
           (array_agg(route_label ORDER BY event_order DESC) FILTER (WHERE route_label <> ''))[1] AS event_context
    FROM filtered GROUP BY entity_type, entity_id
), current_rows AS (
    SELECT entity_type, entity_id,
           (array_agg(entity_label ORDER BY updated_at DESC))[1] AS current_label,
           count(DISTINCT user_id)::INTEGER AS currently_selected_learners,
           count(DISTINCT selection_scope_key)::INTEGER AS current_contexts,
           (array_agg(route_label ORDER BY updated_at DESC) FILTER (WHERE route_label <> ''))[1] AS current_context
    FROM current_filtered GROUP BY entity_type, entity_id
), item_keys AS (
    SELECT entity_type, entity_id FROM event_rows
    UNION SELECT entity_type, entity_id FROM current_rows
), top_rows AS (
    SELECT k.entity_type, k.entity_id,
           COALESCE(cr.current_label, er.event_label) AS entity_label,
           COALESCE(cr.currently_selected_learners, 0)::INTEGER AS currently_selected_learners,
           COALESCE(cr.current_contexts, 0)::INTEGER AS current_contexts,
           COALESCE(er.learners, 0)::INTEGER AS learners,
           COALESCE(er.additions, 0)::INTEGER AS additions,
           COALESCE(er.removals, 0)::INTEGER AS removals,
           COALESCE(er.selected_contexts, 0)::INTEGER AS selected_contexts,
           COALESCE(cr.current_context, er.event_context) AS latest_context
    FROM item_keys k
    LEFT JOIN event_rows er USING (entity_type, entity_id)
    LEFT JOIN current_rows cr USING (entity_type, entity_id)
    ORDER BY COALESCE(cr.currently_selected_learners, 0) DESC,
             COALESCE(er.learners, 0) DESC, entity_label
    LIMIT 100
), top_routes AS (
    SELECT route_key, (array_agg(route_label ORDER BY event_order DESC))[1] AS route_label,
           count(DISTINCT user_id)::INTEGER AS learners,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions
    FROM filtered WHERE event_type = 'selection_added' AND route_label <> ''
    GROUP BY route_key ORDER BY learners DESC, additions DESC, route_label LIMIT 50
), route_totals AS (
    SELECT count(*)::INTEGER AS combinations FROM (
        SELECT route_key FROM filtered WHERE event_type = 'selection_added' AND route_label <> '' GROUP BY route_key
    ) distinct_routes
), current_route_totals AS (
    SELECT count(DISTINCT selection_scope_key)::INTEGER AS combinations,
           count(DISTINCT route_key) FILTER (WHERE route_label <> '')::INTEGER AS route_patterns
    FROM current_filtered
), top_current_routes AS (
    SELECT route_key,
           (array_agg(route_label ORDER BY updated_at DESC))[1] AS route_label,
           count(DISTINCT user_id)::INTEGER AS currently_selected_learners,
           count(DISTINCT selection_scope_key)::INTEGER AS selection_contexts
    FROM current_filtered
    WHERE route_label <> ''
    GROUP BY route_key
    ORDER BY currently_selected_learners DESC, selection_contexts DESC, route_label
    LIMIT 50
), daily AS (
    SELECT (occurred_at AT TIME ZONE 'UTC')::DATE AS day,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions_raw,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals_raw,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners_raw
    FROM filtered GROUP BY 1
), safe_daily AS (
    SELECT series.day::DATE AS day, COALESCE(daily.additions_raw, 0)::INTEGER AS additions,
           COALESCE(daily.removals_raw, 0)::INTEGER AS removals,
           COALESCE(daily.learners_raw, 0)::INTEGER AS learners
    FROM generate_series((p_since AT TIME ZONE 'UTC')::DATE,
        ((p_until - INTERVAL '1 microsecond') AT TIME ZONE 'UTC')::DATE, INTERVAL '1 day') AS series(day)
    LEFT JOIN daily ON daily.day = series.day::DATE
), totals AS (
    SELECT count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_added')::INTEGER AS learners,
           count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS learners_removed,
           count(*) FILTER (WHERE event_type = 'selection_added')::INTEGER AS additions,
           count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals
    FROM filtered
), current_totals AS (
    SELECT count(DISTINCT user_id)::INTEGER AS learners FROM current_filtered
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
    'activity_window', jsonb_build_object('since', p_since, 'until', p_until),
    'learners_who_added', totals.learners,
    'learners_who_removed', totals.learners_removed,
    'currently_selected_learners', current_totals.learners,
    'currently_selected_contexts', current_route_totals.combinations,
    'currently_selected_route_patterns', current_route_totals.route_patterns,
    'selection_additions', totals.additions,
    'selection_removals', totals.removals,
    'route_combinations_total', route_totals.combinations,
    'previous_period', jsonb_build_object(
        'since', p_since - (p_until - p_since), 'until', p_since,
        'learners_who_added', previous_totals.learners,
        'learners_who_removed', previous_totals.learners_removed,
        'selection_additions', previous_totals.additions,
        'selection_removals', previous_totals.removals
    ),
    'top_selections', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM top_rows t), '[]'::JSONB),
    'top_current_routes', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM top_current_routes r), '[]'::JSONB),
    'top_routes', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM top_routes r), '[]'::JSONB),
    'daily_activity', COALESCE((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.day) FROM safe_daily d), '[]'::JSONB)
)
FROM totals CROSS JOIN current_totals CROSS JOIN previous_totals CROSS JOIN route_totals CROSS JOIN current_route_totals;
$$;

REVOKE ALL ON FUNCTION skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION skillup_dev.get_learning_interest_analytics(
    TIMESTAMPTZ, TIMESTAMPTZ, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION skillup_dev.get_learning_interest_filter_options(
    p_since TIMESTAMPTZ, p_until TIMESTAMPTZ, p_school_id UUID,
    p_query TEXT, p_filter_type TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = skillup_dev, pg_temp
AS $$
WITH scoped_events AS (
    SELECT e.* FROM skillup_dev.learning_interest_events e
    WHERE e.occurred_at >= p_since AND e.occurred_at < p_until
      AND (p_school_id IS NULL OR e.affiliation_school_ids @> ARRAY[p_school_id])
), scoped_current AS (
    SELECT a.* FROM skillup_dev.learning_interest_active_selections a
    JOIN skillup_dev.users u ON u.id = a.user_id
    WHERE u.settings #>> '{legalAcceptance,termsVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,privacyVersion}' = '2026-10-29.1'
      AND u.settings #>> '{legalAcceptance,analyticsConsent}' = 'true'
      AND COALESCE(u.is_deleted, FALSE) = FALSE
      AND (p_school_id IS NULL OR a.affiliation_school_ids @> ARRAY[p_school_id])
), options_source AS (
    SELECT entity_type AS filter_type, entity_id AS filter_id, entity_label AS filter_label, user_id, occurred_at AS sort_at FROM scoped_events
    UNION ALL SELECT 'route_pattern', route_key, route_label, user_id, occurred_at FROM scoped_events
        WHERE NULLIF(trim(COALESCE(route_label, '')), '') IS NOT NULL
    UNION ALL SELECT 'learner_stage', learner_stage, learner_stage, user_id, occurred_at FROM scoped_events
        WHERE NULLIF(trim(COALESCE(learner_stage, '')), '') IS NOT NULL
    UNION ALL SELECT 'state', state_code, state_code, user_id, occurred_at FROM scoped_events
        CROSS JOIN LATERAL unnest(affiliation_states) AS state_code
    UNION ALL SELECT 'affiliation_school', s.id::TEXT, COALESCE(NULLIF(trim(s.official_name), ''), s.name), scoped_events.user_id, scoped_events.occurred_at
        FROM scoped_events CROSS JOIN LATERAL unnest(scoped_events.affiliation_school_ids) AS affiliation(school_id)
        JOIN skillup_dev.schools s ON s.id = affiliation.school_id
    UNION ALL SELECT entity_type, entity_id, entity_label, user_id, updated_at FROM scoped_current
    UNION ALL SELECT 'route_pattern', route_key, route_label, user_id, updated_at FROM scoped_current
        WHERE NULLIF(trim(COALESCE(route_label, '')), '') IS NOT NULL
    UNION ALL SELECT 'learner_stage', learner_stage, learner_stage, user_id, updated_at FROM scoped_current
        WHERE NULLIF(trim(COALESCE(learner_stage, '')), '') IS NOT NULL
    UNION ALL SELECT 'state', state_code, state_code, user_id, updated_at FROM scoped_current
        CROSS JOIN LATERAL unnest(affiliation_states) AS state_code
    UNION ALL SELECT 'affiliation_school', s.id::TEXT, COALESCE(NULLIF(trim(s.official_name), ''), s.name), scoped_current.user_id, scoped_current.updated_at
        FROM scoped_current CROSS JOIN LATERAL unnest(scoped_current.affiliation_school_ids) AS affiliation(school_id)
        JOIN skillup_dev.schools s ON s.id = affiliation.school_id
), labeled_options AS (
    SELECT filter_type, filter_id, (array_agg(filter_label ORDER BY sort_at DESC))[1] AS filter_label,
           count(DISTINCT user_id)::INTEGER AS learners
    FROM options_source GROUP BY filter_type, filter_id
), ranked AS (
    SELECT filter_type, filter_id, filter_label, learners FROM labeled_options
    WHERE (p_filter_type IS NULL OR filter_type = p_filter_type)
      AND lower(filter_label) LIKE '%' || lower(trim(p_query)) || '%'
    ORDER BY learners DESC, filter_label, filter_type LIMIT 100
)
SELECT jsonb_build_object('options', COALESCE((SELECT jsonb_agg(to_jsonb(ranked)) FROM ranked), '[]'::JSONB));
$$;

REVOKE ALL ON FUNCTION skillup_dev.get_learning_interest_filter_options(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION skillup_dev.get_learning_interest_filter_options(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, TEXT) TO service_role;

COMMIT;
