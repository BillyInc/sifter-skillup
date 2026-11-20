import asyncio
from pathlib import Path
from unittest.mock import MagicMock
from uuid import UUID, uuid4

from fastapi import HTTPException

from routes import learning_analytics_routes as analytics


def test_analytics_migration_fills_quiet_days_in_a_utc_daily_series():
    migration = Path(__file__).parents[1] / "migration_learning_interest_analytics_2026-10-26.sql"
    sql = migration.read_text(encoding="utf-8")
    assert "(occurred_at AT TIME ZONE 'UTC')::DATE AS day" in sql
    assert "FROM generate_series(" in sql
    assert "COALESCE(daily.additions_raw, 0)::INTEGER AS additions" in sql
    assert "count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals_raw" in sql
    assert "COALESCE(daily.removals_raw, 0)::INTEGER AS removals" in sql
    assert "LEFT JOIN daily ON daily.day = series.day::DATE" in sql
    assert "count(DISTINCT user_id) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS learners_removed" in sql
    assert "'learners_who_removed', totals.learners_removed" in sql
    assert "'learners_who_removed', previous_totals.learners_removed" in sql
    assert "'route_combinations_total', route_totals.combinations" in sql
    assert "SELECT count(*)::INTEGER AS combinations" in sql
    assert "p_affiliation_school_id UUID DEFAULT NULL" in sql
    assert "e.affiliation_school_ids @> ARRAY[p_affiliation_school_id]" in sql
    assert "'affiliation_school'" in sql


def test_current_selection_migration_keeps_snapshot_separate_and_consent_gated():
    migration = Path(__file__).parents[1] / "migration_learning_interest_current_selections_2026-10-28.sql"
    sql = migration.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS skillup_dev.learning_interest_active_selections" in sql
    assert "UNIQUE (user_id, selection_scope_key, entity_type, entity_id)" in sql
    assert "AFTER INSERT ON skillup_dev.learning_interest_events" in sql
    assert "NEW.event_type IN ('selection_added', 'selection_copied')" in sql
    assert "DELETE FROM skillup_dev.learning_interest_active_selections" in sql
    assert "clear_learning_interest_snapshot_on_consent_change" in sql
    assert "AFTER UPDATE OF settings, is_deleted ON skillup_dev.users" in sql
    assert "COALESCE(u.is_deleted, FALSE) = FALSE" in sql
    assert "currently_selected_learners" in sql
    assert "count(*) FILTER (WHERE event_type = 'selection_removed')::INTEGER AS removals_raw" in sql
    assert "COALESCE(daily.removals_raw, 0)::INTEGER AS removals" in sql
    assert "top_current_routes AS (" in sql
    assert "'top_current_routes'" in sql
    assert "'activity_window', jsonb_build_object('since', p_since, 'until', p_until)" in sql
    assert "UPDATE skillup_dev.learning_interest_active_selections" in sql
    update_context = sql.split("UPDATE skillup_dev.learning_interest_active_selections", 1)[1].split("RETURN NEW;", 1)[0]
    assert "SET programme_id = NEW.programme_id" in update_context
    assert "SET learner_stage = NEW.learner_stage" not in update_context
    assert "affiliation_school_ids = NEW.affiliation_school_ids" not in update_context
    assert "current_filtered AS" in sql
    assert "JOIN skillup_dev.users u ON u.id = a.user_id" in sql
    assert "2026-10-29.1" in sql
    assert "2026-10-27.2" not in sql
    assert "CHECK (event_type IN ('selection_added', 'selection_removed', 'selection_copied'))" in sql
    assert "IF NEW.event_type IN ('selection_added', 'selection_copied') THEN" in sql
    assert "count(DISTINCT route_key) FILTER (WHERE event_type = 'selection_added')::INTEGER AS selected_contexts" in sql
    assert "p_item_type = 'route_pattern' AND route_key = p_item_id" in sql
    assert "SELECT 'route_pattern', route_key, route_label, user_id, occurred_at FROM scoped_events" in sql
    assert "SELECT 'route_pattern', route_key, route_label, user_id, updated_at FROM scoped_current" in sql


def test_current_selection_counts_are_not_limited_by_activity_date_window():
    migration = Path(__file__).parents[1] / "migration_learning_interest_current_selections_2026-10-28.sql"
    sql = migration.read_text(encoding="utf-8")
    activity = sql.split("), filtered AS (", 1)[1].split("), previous_filtered AS (", 1)[0]
    current = sql.split("), current_filtered AS (", 1)[1].split("), event_rows AS (", 1)[0]

    assert "occurred_at >= p_since AND occurred_at < p_until" in activity
    assert "occurred_at" not in current
    assert "p_since" not in current and "p_until" not in current


def test_analytics_aggregates_renamed_choices_by_stable_identity():
    migration = Path(__file__).parents[1] / "migration_learning_interest_analytics_2026-10-26.sql"
    sql = migration.read_text(encoding="utf-8")
    assert "(array_agg(entity_label ORDER BY event_order DESC))[1] AS entity_label" in sql
    assert "GROUP BY entity_type, entity_id" in sql
    assert "(array_agg(route_label ORDER BY event_order DESC))[1] AS route_label" in sql
    assert "GROUP BY route_key" in sql
    assert "labeled_options AS (" in sql
    assert "GROUP BY filter_type, filter_id" in sql


def test_selection_capture_drops_opted_out_users_without_writing(monkeypatch):
    service = MagicMock()
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    event = analytics.LearningInterestEvent(
        action="selection_added", entity_type="tool", entity_id="python",
        entity_label="Python",
    )
    result = asyncio.run(analytics.capture_learning_interest(
        event,
        {"id": "student-1", "settings": {"legalAcceptance": {"analyticsConsent": False}}},
    ))
    assert result.data == {"tracked": False, "reason": "analytics_opt_out"}
    service.schema.assert_not_called()


def test_learning_interest_requires_analytics_consent_under_current_legal_versions(monkeypatch):
    service = MagicMock()
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    event = analytics.LearningInterestEvent(
        action="selection_added", entity_type="programme", entity_id="sociology", entity_label="Sociology",
    )
    result = asyncio.run(analytics.capture_learning_interest(event, {
        "id": "student-old-consent",
        "settings": {"legalAcceptance": {
            "termsVersion": "2026-10-27.1", "privacyVersion": "2026-10-27.1", "analyticsConsent": True,
        }},
    }))
    assert result.data == {"tracked": False, "reason": "analytics_opt_out"}
    service.schema.assert_not_called()


def test_selection_capture_records_only_allowlisted_context_for_opted_in_user(monkeypatch):
    table = MagicMock()
    service = MagicMock()
    service.schema.return_value = service
    service.table.return_value = table
    table.upsert.return_value.execute.return_value.data = []
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    event = analytics.LearningInterestEvent(
        event_id=uuid4(), action="selection_added", entity_type="tool",
        entity_id="tool:python", entity_label="Python", programme_id="sociology",
        institution_id="unilag", domain_id="D078", area_id="sociology-area",
        role_id="sociologist", method_ids=["survey"], design_ids=["survey-interview"],
    )
    result = asyncio.run(analytics.capture_learning_interest(
        event,
        {"id": "student-1", "settings": {"legalAcceptance": {"termsVersion": "2026-10-29.1", "privacyVersion": "2026-10-29.1", "analyticsConsent": True}}},
    ))
    assert result.data == {"tracked": True}
    row = table.upsert.call_args.args[0]
    assert row["user_id"] == "student-1"
    assert row["entity_type"] == "tool"
    assert row["domain_id"] == "D078"
    assert row["area_id"] == "sociology-area"
    assert row["role_id"] == "sociologist"
    assert row["method_ids"] == ["survey"]
    assert row["design_ids"] == ["survey-interview"]
    assert len(row["selection_scope_key"]) == 64
    assert "email" not in row and "username" not in row
    assert table.upsert.call_args.kwargs["ignore_duplicates"] is True


def test_selection_scope_key_is_stable_for_matching_add_and_remove_context(monkeypatch):
    table = MagicMock()
    service = MagicMock()
    service.schema.return_value = service
    service.table.return_value = table
    table.upsert.return_value.execute.return_value.data = []
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    acceptance = {"termsVersion": "2026-10-29.1", "privacyVersion": "2026-10-29.1", "analyticsConsent": True}
    event_context = dict(
        entity_type="tool", entity_id="python", entity_label="Python",
        selection_scope_id="d078:route-2",
    )
    asyncio.run(analytics.capture_learning_interest(
        analytics.LearningInterestEvent(action="selection_added", **event_context),
        {"id": "student-1", "settings": {"legalAcceptance": acceptance}},
    ))
    added_key = table.upsert.call_args.args[0]["selection_scope_key"]
    asyncio.run(analytics.capture_learning_interest(
        analytics.LearningInterestEvent(action="selection_removed", **event_context),
        {"id": "student-1", "settings": {"legalAcceptance": acceptance}},
    ))
    removed_key = table.upsert.call_args.args[0]["selection_scope_key"]
    assert added_key == removed_key


def test_selection_copy_action_is_accepted_for_snapshot_materialization(monkeypatch):
    table = MagicMock()
    service = MagicMock()
    service.schema.return_value = service
    service.table.return_value = table
    table.upsert.return_value.execute.return_value.data = []
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    result = asyncio.run(analytics.capture_learning_interest(
        analytics.LearningInterestEvent(
            action="selection_copied", entity_type="research_design",
            entity_id="interview-observation", entity_label="Interview and observation",
            selection_scope_id="d078:route-2",
        ),
        {"id": "student-copy", "settings": {"legalAcceptance": {
            "termsVersion": "2026-10-29.1", "privacyVersion": "2026-10-29.1", "analyticsConsent": True,
        }}},
    ))
    assert result.data == {"tracked": True}
    assert table.upsert.call_args.args[0]["event_type"] == "selection_copied"


def test_programmes_domains_and_institutions_are_first_class_selection_events(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.table.return_value.upsert.return_value.execute.return_value.data = []
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    user = {"id": "student-2", "settings": {"legalAcceptance": {"termsVersion": "2026-10-29.1", "privacyVersion": "2026-10-29.1", "analyticsConsent": True}}}

    for entity_type, entity_id, label in (
        ("programme", "sociology", "Sociology"),
        ("institution", "unilag", "University of Lagos"),
        ("domain", "D078", "Social Sciences"),
    ):
        event = analytics.LearningInterestEvent(
            action="selection_added", entity_type=entity_type,
            entity_id=entity_id, entity_label=label,
            programme_id="sociology", institution_id="unilag", domain_id="D078",
        )
        result = asyncio.run(analytics.capture_learning_interest(event, user))
        assert result.data == {"tracked": True}
        assert service.table.return_value.upsert.call_args.args[0]["entity_type"] == entity_type


def test_capture_rejects_unknown_selection_type_before_database_write(monkeypatch):
    service = MagicMock()
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    event = analytics.LearningInterestEvent(
        action="selection_added", entity_type="page_view", entity_id="x", entity_label="x",
    )
    try:
        asyncio.run(analytics.capture_learning_interest(
            event,
        {"id": "student-1", "settings": {"legalAcceptance": {"termsVersion": "2026-10-29.1", "privacyVersion": "2026-10-29.1", "analyticsConsent": True}}},
        ))
    except HTTPException as exc:
        assert exc.status_code == 422
    else:
        raise AssertionError("unsupported event type should be rejected")
    service.schema.assert_not_called()


def test_aggregate_rpc_uses_authorized_scope_and_context_filters(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {"scope": "school"}
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    from datetime import datetime, timezone
    result = asyncio.run(analytics._aggregate(
        since=datetime(2026, 10, 1, tzinfo=timezone.utc),
        until=datetime(2026, 10, 20, tzinfo=timezone.utc),
        school_id="school-1", entity_type="tool", domain_id="D078",
        area_id="area-1", programme_id="sociology", institution_id="unilag",
        role_id="sociologist", method_id="survey", design_id="mixed-design",
        learner_stage="undergraduate", state="Lagos", item_type="tool", item_id="python",
    ))
    assert result == {"scope": "school"}
    params = service.rpc.call_args.args[1]
    assert params["p_school_id"] == "school-1"
    assert params["p_entity_type"] == "tool"
    assert params["p_method_id"] == "survey"
    assert params["p_design_id"] == "mixed-design"
    assert params["p_programme_id"] == "sociology"
    assert params["p_institution_id"] == "unilag"
    assert params["p_state"] == "Lagos"
    assert params["p_affiliation_school_id"] is None
    assert params["p_item_type"] == "tool"
    assert params["p_item_id"] == "python"


def test_aggregate_can_filter_platform_interest_by_affiliated_school(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {"scope": "platform"}
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    asyncio.run(analytics._aggregate(
        since=now, until=now, school_id=None, entity_type="tool", domain_id="D078",
        area_id=None, programme_id="sociology", institution_id=None, role_id=None,
        method_id=None, design_id=None, learner_stage="ss2", affiliation_school_id="school-uuid",
    ))
    params = service.rpc.call_args.args[1]
    assert params["p_school_id"] is None  # authorization scope remains platform-wide
    assert params["p_affiliation_school_id"] == "school-uuid"  # selected cohort facet


def test_school_dashboard_affiliation_filter_cannot_widen_verified_school_scope(monkeypatch):
    own_school = str(uuid4())
    other_school = uuid4()
    monkeypatch.setattr(analytics, "_verified_school_id", lambda _user_id, _requested=None: own_school)
    captured = {}

    async def capture_aggregate(**kwargs):
        captured.update(kwargs)
        return {"scope": "school"}

    monkeypatch.setattr(analytics, "_aggregate", capture_aggregate)
    result = asyncio.run(analytics.school_learning_interest(
        days=30, affiliation_school_id=other_school, current_user={"id": "school-admin"},
    ))
    assert result.data == {"scope": "school"}
    assert captured["school_id"] == own_school
    assert captured["affiliation_school_id"] == str(other_school)


def test_aggregate_does_not_apply_a_minimum_cell_suppression(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {"learners_who_added": 1, "learners_who_removed": 1}
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    result = asyncio.run(analytics._aggregate(
        since=now, until=now, school_id="small-school", entity_type=None,
        domain_id=None, area_id=None, programme_id=None, institution_id=None,
        role_id=None, method_id=None, design_id=None, learner_stage=None,
    ))
    assert result["learners_who_added"] == 1
    assert result["learners_who_removed"] == 1
    assert "p_min_cell" not in service.rpc.call_args.args[1]


def test_aggregate_rejects_unrecognized_entity_filter(monkeypatch):
    service = MagicMock()
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    try:
        asyncio.run(analytics._aggregate(
            since=now, until=now, school_id=None, entity_type="email",
            domain_id=None, area_id=None, programme_id=None, institution_id=None,
            role_id=None, method_id=None, design_id=None, learner_stage=None,
        ))
    except HTTPException as exc:
        assert exc.status_code == 422
    else:
        raise AssertionError("unrecognized dimension should be rejected")
    service.schema.assert_not_called()


def test_missing_analytics_schema_returns_actionable_service_unavailable(monkeypatch):
    class PostgrestError(Exception):
        code = "PGRST202"

    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.side_effect = PostgrestError("missing analytics RPC")
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    try:
        asyncio.run(analytics._aggregate(
            since=now, until=now, school_id=None, entity_type=None,
            domain_id=None, area_id=None, programme_id=None, institution_id=None,
            role_id=None, method_id=None, design_id=None, learner_stage=None,
        ))
    except HTTPException as exc:
        assert exc.status_code == 503
        assert "analytics setup" in exc.detail
    else:
        raise AssertionError("missing analytics function must be reported as setup pending")


def test_unrelated_analytics_provider_errors_are_not_relabelled_as_setup(monkeypatch):
    class PostgrestError(Exception):
        code = "42501"

    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.side_effect = PostgrestError("permission denied")
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)

    try:
        analytics._analytics_rpc("get_learning_interest_analytics", {})
    except PostgrestError:
        pass
    else:
        raise AssertionError("permission errors must not be misreported as missing setup")


def test_searchable_filter_options_use_authorized_scope_and_return_aggregate_labels(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {
        "options": [{"filter_type": "programme", "filter_id": "sociology-id",
                     "filter_label": "Sociology", "learners": 6}]
    }
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)

    result = asyncio.run(analytics.learning_interest_filter_options(
        q="  Soci  ", days=90, filter_type=None,
        current_user={"id": "staff-1", "is_internal_staff": True},
    ))

    assert result.data["options"][0]["filter_label"] == "Sociology"
    assert result.data["options"][0]["learners"] == 6
    params = service.rpc.call_args.args[1]
    assert params["p_school_id"] is None
    assert params["p_query"] == "Soci"
    assert params["p_filter_type"] is None


def test_affiliated_school_is_an_allowed_aggregate_filter_facet(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {
        "options": [{"filter_type": "affiliation_school", "filter_id": "school-uuid",
                     "filter_label": "University of Lagos", "learners": 4}]
    }
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)
    result = asyncio.run(analytics.learning_interest_filter_options(
        q="Lagos", days=30, filter_type="affiliation_school",
        current_user={"id": "staff-1", "is_internal_staff": True},
    ))
    assert result.data["options"][0]["filter_type"] == "affiliation_school"
    assert service.rpc.call_args.args[1]["p_filter_type"] == "affiliation_school"


def test_named_route_patterns_are_an_allowed_searchable_filter(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {
        "options": [{"filter_type": "route_pattern", "filter_id": "route-hash",
                     "filter_label": "Sociology → Social Sciences → Qualitative research", "learners": 4}]
    }
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)

    result = asyncio.run(analytics.learning_interest_filter_options(
        q="Qualitative", days=90, filter_type="route_pattern",
        current_user={"id": "staff-1", "is_internal_staff": True},
    ))

    assert result.data["options"][0]["filter_type"] == "route_pattern"
    assert result.data["options"][0]["filter_id"] == "route-hash"
    assert service.rpc.call_args.args[1]["p_filter_type"] == "route_pattern"


def test_searchable_filter_options_are_limited_to_verified_school_membership(monkeypatch):
    service = MagicMock()
    service.schema.return_value = service
    monkeypatch.setattr(analytics, "_verified_school_id", lambda _user_id, requested=None: requested or "school-7")
    service.rpc.return_value.execute.return_value.data = {"options": []}
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)

    async def allow_verified_admin(user):
        return user

    monkeypatch.setattr(analytics.Auth, "require_admin", staticmethod(allow_verified_admin))
    result = asyncio.run(analytics.learning_interest_filter_options(
        q="Python", days=30, filter_type="tool",
        current_user={"id": "school-admin", "is_internal_staff": False},
    ))

    assert result.data == {"options": []}
    assert service.rpc.call_args.args[1]["p_school_id"] == "school-7"
    assert service.rpc.call_args.args[1]["p_filter_type"] == "tool"


def test_multi_school_filter_search_uses_requested_verified_school_scope(monkeypatch):
    school_a = "00000000-0000-0000-0000-00000000000a"
    school_b = "00000000-0000-0000-0000-00000000000b"
    own_schools = [
        {"school_id": school_a, "school_name": "School A", "institution_type": "secondary_school"},
        {"school_id": school_b, "school_name": "School B", "institution_type": "university"},
    ]
    monkeypatch.setattr(analytics, "_verified_school_memberships", lambda _user_id: own_schools)

    async def allow_verified_admin(user):
        return user

    monkeypatch.setattr(analytics.Auth, "require_admin", staticmethod(allow_verified_admin))
    service = MagicMock()
    service.schema.return_value = service
    service.rpc.return_value.execute.return_value.data = {"options": []}
    monkeypatch.setattr(analytics.db, "get_service_client", lambda: service)

    result = asyncio.run(analytics.learning_interest_filter_options(
        q="Python", days=30, school_id=UUID(school_b),
        current_user={"id": "multi-school-admin", "is_internal_staff": False},
    ))

    assert result.data == {"options": []}
    assert service.rpc.call_args.args[1]["p_school_id"] == school_b


def test_multi_school_admin_must_choose_scope_and_cannot_request_an_unowned_school(monkeypatch):
    own_schools = [
        {"school_id": "school-a", "school_name": "School A", "institution_type": "secondary_school"},
        {"school_id": "school-b", "school_name": "School B", "institution_type": "university"},
    ]
    monkeypatch.setattr(analytics, "_verified_school_memberships", lambda _user_id: own_schools)

    try:
        analytics._verified_school_id("multi-admin")
    except HTTPException as exc:
        assert exc.status_code == 422
        assert "Choose an institution" in exc.detail
    else:
        raise AssertionError("multi-school administrators must select a scope")

    assert analytics._verified_school_id("multi-admin", "school-b") == "school-b"
    try:
        analytics._verified_school_id("multi-admin", "school-outside-membership")
    except HTTPException as exc:
        assert exc.status_code == 403
    else:
        raise AssertionError("a school outside verified membership must be rejected")


def test_school_options_expose_only_the_callers_verified_scopes(monkeypatch):
    own_schools = [{"school_id": "school-a", "school_name": "School A", "institution_type": "secondary_school"}]
    monkeypatch.setattr(analytics, "_verified_school_memberships", lambda _user_id: own_schools)

    async def allow_admin(user):
        return user

    monkeypatch.setattr(analytics.Auth, "require_admin", staticmethod(allow_admin))
    result = asyncio.run(analytics.learning_interest_school_options(current_user={"id": "school-admin"}))
    assert result.data == {"schools": own_schools}
