-- ============================================================================
-- migration_security_hardening_2026-11-21.sql
-- PROPOSED, NOT APPLIED. Prepared for review; do not run until the owner approves.
-- Additive and idempotent: safe to re-run. No data is read, changed or deleted.
-- ============================================================================
--
-- Why
--   A static audit of every migration (backend/scripts/audit_db_security.py, which replays the
--   SQL in apply order) found, in schema skillup_dev:
--     * 10 SECURITY DEFINER functions that anon / authenticated can still execute
--       (migration_v2_atomic.sql, migration_v2_offline_idempotency.sql, migration_v2_offline_streak.sql).
--       Postgres grants EXECUTE to PUBLIC on creation and none of those files revokes it, so a
--       caller holding only the anon key could call increment_user_points / decrement_merch_credits
--       with arbitrary arguments (a negative amount adds credits).
--     * 69 tables with no ROW LEVEL SECURITY and no REVOKE for anon / authenticated.
--     * 30 more relations (tables that already have RLS, and views) with no REVOKE.
--   The repository contains no schema-wide GRANT, so whether anon can reach these today depends
--   on grants made in the Supabase dashboard, which a static scan cannot see. Revoking is safe
--   either way.
--
-- What it does
--   1. For each SECURITY DEFINER function listed: REVOKE ALL ... FROM PUBLIC, anon, authenticated and
--      GRANT EXECUTE ... TO service_role. Every caller in the repository uses the service-role
--      client (db.get_service_client().rpc(...)); there is no anon-key RPC caller.
--   2. For each table listed in part 2: ENABLE ROW LEVEL SECURITY (default deny) and
--      REVOKE ALL ... FROM anon, authenticated.
--   3. For the relations in part 3: REVOKE ALL ... FROM anon, authenticated.
--   Objects that do not exist in the target database are skipped (to_regclass / pg_proc checks).
--   The service role bypasses RLS, so the FastAPI backend is unaffected.
--
-- Deliberately NOT touched (reached with the anon key, so locking them would break a live path):
--   users: backend db.get_client() (main.py, routes/missing_routes.py) and src/lib/supabase.ts
--   level_scores: backend db.get_client() (main.py) and src/lib/supabase.ts
--   game_states: backend db.get_client() (main.py)
--   posts: backend db.get_client() (routes/missing_routes.py) and src/hooks/useCommunity.ts
--   post_likes: backend db.get_client() embed in the posts query (routes/missing_routes.py)
--   post_reactions: src/hooks/useCommunity.ts realtime subscription
--   notifications: src/hooks/useCommunity.ts realtime subscription
--   dm_messages: src/hooks/useCommunity.ts realtime subscription
--   guilds: src/lib/supabase.ts
--   guild_members: src/lib/supabase.ts
--   plus 34 tables that carry their own CREATE POLICY statements and are therefore
--   designed for direct access: active_sessions, badges, bookmarks, career_areas_of_specialization, career_context_items, career_item_path_targets, career_item_relationships, career_role_area_routes, challenges, content_cache, feed_items, feedback, friends, interview_sessions, merchandise_items, merchandise_orders, notification_prefs, oauth_states, onboarding_drafts, portfolio_accounts, portfolio_artifacts, portfolio_items, portfolio_pushes, post_comments, push_tokens, starknet_transactions, track_subscriptions, transactions, user_badges, user_last_position, user_mfa_settings, user_seen_scenarios, withdrawals, xp_events.
--
-- After applying, verify (all three queries should return no rows):
--   -- tables in the list without RLS
--   SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'skillup_dev' AND c.relkind = 'r' AND NOT c.relrowsecurity
--      AND c.relname = ANY (ARRAY[<part 2 names>]);
--   -- anon / authenticated can still execute a listed definer function
--   SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'skillup_dev' AND p.prosecdef
--      AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR has_function_privilege('authenticated', p.oid, 'EXECUTE'))
--      AND p.proname = ANY (ARRAY[<part 1 names>]);
--   -- anon can still read a listed table
--   SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname = 'skillup_dev' AND c.relkind IN ('r','v')
--      AND has_table_privilege('anon', c.oid, 'SELECT') AND c.relname = ANY (ARRAY[<part 2 and 3 names>]);
-- Then re-run: python backend/scripts/audit_db_security.py --strict
--
-- Rollback (this migration only removes access; nothing is deleted)
--   Re-grant what was revoked, for example:
--     GRANT EXECUTE ON FUNCTION skillup_dev.<name>(<args>) TO PUBLIC;
--     GRANT ALL ON TABLE skillup_dev.<name> TO anon, authenticated;
--     ALTER TABLE skillup_dev.<name> DISABLE ROW LEVEL SECURITY;
--   Only do this for a table the application is proven to read with the anon key.
-- ============================================================================

BEGIN;

-- Part 1. SECURITY DEFINER functions: only the service role may call them.
-- Postgres grants EXECUTE to PUBLIC on creation, which anon and authenticated inherit.
-- Matches by name in pg_proc so overloads are covered and absent functions are skipped.
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS sig
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'skillup_dev'
          AND p.prosecdef
          AND p.proname = ANY (ARRAY[
        'append_user_level_progress',
        'decrement_feed_counter',
        'decrement_merch_credits',
        'increment_feed_counter',
        'increment_user_points',
        'touch_user_streak',
        'touch_user_streak_v2',
        'try_award_offline_xp',
        'try_award_offline_xp_idem',
        'try_award_social_xp'
        ])
    LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
    END LOOP;
END
$$;

-- Part 2. Tables with no row-level security: enable it (default deny) and close direct
-- access. The backend uses the service-role client, which bypasses RLS.
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'account_deletion_cooldowns',
        'admission_snapshot_version',
        'analytics_events',
        'app_reviews',
        'bookmark_folders',
        'career_guidance_foundations',
        'career_learning_resources',
        'career_role_families',
        'career_role_family_aliases',
        'career_role_family_domains',
        'career_role_family_members',
        'challenge_participants',
        'computational_method_evidence',
        'computational_role_subgroup_links',
        'content_flags',
        'course_competitiveness',
        'daily_xp_caps',
        'domain_certifications',
        'domain_demand_metrics',
        'domain_overlap',
        'domain_role_work_profiles',
        'domain_roles',
        'domain_subgroups',
        'domain_tools',
        'domains',
        'enrichment_version',
        'feed_interactions',
        'friend_requests',
        'interview_questions',
        'jamb_programme_domain',
        'jamb_programme_learning_resources',
        'jamb_programme_requirement_sources',
        'jamb_programmes',
        'mapping_feedback',
        'national_jamb_floor',
        'opportunity_subscriptions',
        'poll_votes',
        'portfolio_attributions',
        'post_hashtags',
        'post_polls',
        'post_reports',
        'programme_abilities',
        'programme_curriculum_outcomes',
        'programme_domain',
        'programme_domain_evidence',
        'programme_mapping',
        'programme_role_score',
        'programme_school_cutoff',
        'programme_subject_requirements',
        'programme_subject_rule_records',
        'programme_theme_guidance',
        'programme_theme_relationships',
        'programmes',
        'project_members',
        'projects',
        'referrals',
        'role_demand_metrics',
        'saved_items',
        'school_aggregate_formula',
        'school_programme_requirement_exceptions',
        'school_programme_subject_option_items',
        'school_programme_subject_options',
        'school_programmes',
        'schools',
        'social_shares',
        'sync_log',
        'sync_meta',
        'user_feedback',
        'user_notes'
    ]
    LOOP
        IF to_regclass('skillup_dev.' || quote_ident(t)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE skillup_dev.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t);
        END IF;
    END LOOP;
END
$$;

-- Part 3. Relations that already have RLS (or are views) but never revoke direct access.
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'auth_email_codes',
        'claim_codes',
        'd078_role_item_contracts',
        'dm_threads',
        'entrepreneurship_domain_coverage',
        'entrepreneurship_entitlement_config',
        'entrepreneurship_evidence_registry',
        'entrepreneurship_institution_engagement',
        'entrepreneurship_role_evidence',
        'entrepreneurship_roles',
        'follow_requests',
        'follows',
        'guidance_report_paths',
        'post_user_reactions',
        'programme_subject_option_items',
        'programme_subject_options',
        'role_certifications',
        'search_aliases',
        'student_affiliations',
        'student_consent_requests',
        'student_consents',
        'student_entrepreneurship_preferences',
        'student_merge_candidates',
        'student_provision_drafts',
        'subject_catalog',
        'thread_participants',
        'user_blocks',
        'user_mutes',
        'user_progress',
        'v_cutoffs_by_jamb_programme'
    ]
    LOOP
        IF to_regclass('skillup_dev.' || quote_ident(t)) IS NOT NULL THEN
            EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t);
        END IF;
    END LOOP;
END
$$;

COMMIT;
