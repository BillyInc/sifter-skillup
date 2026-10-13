from routes.provisioning_routes import (
    RosterStudent,
    _guidance_context_is_allowed,
    _guidance_path_snapshot,
    _guidance_visibility_is_allowed,
)
from routes.student_pipeline_routes import _delete_learning_plan_snapshot, _merge_guidance_snapshot_history, _path_snapshot, _path_with_selected_learning_snapshot
from services.report_gen import ReportContext, build_report_html


def test_admin_resume_checkpoint_is_kept_with_report_context_fields():
    snapshot = _guidance_path_snapshot({
        "academicContext": {"class": "ss1", "stream": "science"},
        "resume": {"status": "in_progress", "stage": "programmes", "mode": "subjects"},
        "programme": {"name": "Business Administration"},
        "not_allowed": "discard me",
    })

    assert snapshot["resume"]["stage"] == "programmes"
    assert snapshot["academicContext"]["class"] == "ss1"
    assert "not_allowed" not in snapshot


def test_roster_student_exposes_student_type_for_contextual_resume():
    row = RosterStudent(
        user_id="student-1",
        full_name="Ada Student",
        provenance="provisioned",
        claim_state="unclaimed",
        visible=True,
        has_consent=False,
        student_type="ss1",
    )

    assert row.student_type == "ss1"


def test_admin_guidance_context_is_scoped_by_organisation():
    assert _guidance_context_is_allowed("secondary_school", "ss2", "SS2", "science")
    assert not _guidance_context_is_allowed("secondary_school", "jamb", "JAMB", "science")
    assert not _guidance_context_is_allowed("secondary_school", "ss2", "SS2", None)
    assert _guidance_context_is_allowed("tutorial_centre", "jamb", None, None)
    assert _guidance_context_is_allowed("university", "undergraduate", None, None)
    assert not _guidance_context_is_allowed("university", "ss3", "SS3", None)


def test_admin_guidance_visibility_requires_provisioning_or_active_consent():
    assert _guidance_visibility_is_allowed("provisioned", "unclaimed", "school-1", "school-1", False)
    assert not _guidance_visibility_is_allowed("provisioned", "claimed", "school-1", "school-1", False)
    assert not _guidance_visibility_is_allowed("self", None, None, "school-1", False)
    assert _guidance_visibility_is_allowed("self", None, None, "school-1", True)


def test_student_resume_checkpoint_survives_path_snapshot_without_arbitrary_payload():
    snapshot = _path_snapshot({
        "programme": {"name": "Business Administration"},
        "resume": {"stage": "roles", "status": "in_progress", "mode": "guided", "token": "discard me"},
        "not_allowed": "discard me",
    })

    assert snapshot["resume"] == {"stage": "roles", "status": "in_progress", "mode": "guided"}
    assert "not_allowed" not in snapshot


def test_completed_learning_plan_versions_are_bounded_and_deduplicated():
    history = [
        {"snapshotId": "v1", "createdAt": "2026-10-10T10:00:00Z", "stacks": []},
        {"snapshotId": "v2", "createdAt": "2026-10-11T10:00:00Z", "stacks": []},
        {"snapshotId": "v1", "createdAt": "2026-10-12T10:00:00Z", "stacks": [{"selectedIds": ["newer-v1"]}]},
        {"snapshotId": "invalid", "createdAt": "2026-10-12T10:00:00Z"},
    ]
    saved = _path_snapshot({"learningPlanSnapshots": history})

    assert [entry["snapshotId"] for entry in saved["learningPlanSnapshots"]] == ["v2", "v1"]
    assert saved["learningPlanSnapshots"][-1]["stacks"][0]["selectedIds"] == ["newer-v1"]


def test_completed_learning_plan_history_keeps_only_the_newest_twenty():
    saved = _path_snapshot({
        "learningPlanSnapshots": [
            {"snapshotId": f"v{index}", "stacks": []}
            for index in range(25)
        ]
    })

    assert len(saved["learningPlanSnapshots"]) == 20
    assert saved["learningPlanSnapshots"][0]["snapshotId"] == "v5"
    assert saved["learningPlanSnapshots"][-1]["snapshotId"] == "v24"


def test_general_path_save_merge_cannot_rewrite_or_drop_completed_snapshots():
    existing = {"learningPlanSnapshots": [
        {"snapshotId": "v1", "stacks": [{"selectedIds": ["original"]}]},
        {"snapshotId": "v2", "stacks": [{"selectedIds": ["second"]}]},
    ]}
    incoming = {"learningPlanSnapshots": [
        {"snapshotId": "v1", "stacks": [{"selectedIds": ["tampered"]}]},
        {"snapshotId": "v3", "stacks": [{"selectedIds": ["third"]}]},
    ], "programme": {"id": "programme-1"}}

    merged = _merge_guidance_snapshot_history(existing, incoming)

    assert [entry["snapshotId"] for entry in merged["learningPlanSnapshots"]] == ["v1", "v2", "v3"]
    assert merged["learningPlanSnapshots"][0]["stacks"][0]["selectedIds"] == ["original"]
    assert merged["programme"] == {"id": "programme-1"}


def test_explicit_snapshot_delete_is_owner_path_scoped_and_not_resurrected_by_stale_save():
    path = {
        "learningPlanSnapshot": {"snapshotId": "v1", "stacks": []},
        "learningPlanSnapshots": [
            {"snapshotId": "v1", "stacks": []},
            {"snapshotId": "v2", "stacks": []},
        ],
    }
    deleted = _delete_learning_plan_snapshot(path, "v1")
    stale_client_save = {
        **path,
        "deletedLearningPlanSnapshotIds": deleted["deletedLearningPlanSnapshotIds"],
    }
    merged = _merge_guidance_snapshot_history(deleted, stale_client_save)

    assert [entry["snapshotId"] for entry in merged["learningPlanSnapshots"]] == ["v2"]
    assert "learningPlanSnapshot" not in merged


def test_report_snapshot_selection_restores_its_saved_route_context():
    path = {
        "programme": {"name": "Current programme"},
        "learningPlanSnapshot": {"snapshotId": "latest-draft", "stacks": []},
        "learningPlanSnapshots": [{
            "snapshotId": "completed-1",
            "stacks": [{"selectedIds": ["domain:D078:method:research-design"]}],
            "reportPathContext": {
                "programme": {"name": "Sociology"},
                "university": {"name": "Example University"},
                "domains": [{"id": "D078", "name": "Social Sciences & Behavioural Research"}],
            },
        }],
    }

    selected = _path_with_selected_learning_snapshot(path, "completed-1")
    assert selected["learningPlanSnapshot"]["snapshotId"] == "completed-1"
    assert selected["programme"]["name"] == "Sociology"
    assert selected["university"]["name"] == "Example University"
    assert selected["domains"][0]["id"] == "D078"
    assert path["learningPlanSnapshot"]["snapshotId"] == "latest-draft"


def test_report_snapshot_selection_fails_closed_for_missing_or_other_user_snapshot_id():
    from fastapi import HTTPException
    import pytest

    with pytest.raises(HTTPException) as exc:
        _path_with_selected_learning_snapshot({"learningPlanSnapshots": []}, "not-owned-here")
    assert exc.value.status_code == 404


def test_layered_learning_focus_and_snapshot_survive_student_and_admin_boundaries():
    payload = {
        "programme": {"name": "Sociology"},
        "learningFocus": [{
            "id": "domain:D078:method:research-design",
            "name": "Research design",
            "contextLevel": "domain",
            "contextKey": "D078",
            "itemType": "method",
            "itemKey": "research-design",
        }],
        "learningPlanSnapshot": {
            "snapshotId": "guided-test",
            "stacks": [{"route": {"domainId": "D078"}, "selectedIds": ["domain:D078:method:research-design"]}],
            "routeWarnings": [],
        },
        "learningPlanSnapshots": [{
            "snapshotId": "guided-test",
            "stacks": [{"selectedIds": ["domain:D078:method:research-design"]}],
        }],
        "learningPlanRemovedIds": ["domain:D078:tool:old-tool", 42],
        "learningPlanRemovedIdsByRoute": {
            "sociology/D078/research/*": ["domain:D078:tool:old-tool", 42],
            42: ["discard route key"],
        },
        "learningPlanOrderByRoute": {
            "sociology/D078/research/*": ["domain:D078:method:research-design", 42],
            42: ["discard route key"],
        },
    }

    student_snapshot = _path_snapshot(payload)
    admin_snapshot = _guidance_path_snapshot(payload)
    assert student_snapshot["learningFocus"][0]["name"] == "Research design"
    assert admin_snapshot["learningPlanSnapshot"]["snapshotId"] == "guided-test"
    assert student_snapshot["learningPlanSnapshots"][0]["snapshotId"] == "guided-test"
    assert admin_snapshot["learningPlanSnapshots"][0]["snapshotId"] == "guided-test"
    assert student_snapshot["learningPlanRemovedIds"] == ["domain:D078:tool:old-tool"]
    assert admin_snapshot["learningPlanRemovedIds"] == ["domain:D078:tool:old-tool"]
    assert student_snapshot["learningPlanRemovedIdsByRoute"] == {
        "sociology/D078/research/*": ["domain:D078:tool:old-tool"]
    }
    assert admin_snapshot["learningPlanRemovedIdsByRoute"] == student_snapshot["learningPlanRemovedIdsByRoute"]
    assert student_snapshot["learningPlanOrderByRoute"] == {
        "sociology/D078/research/*": ["domain:D078:method:research-design"]
    }
    assert admin_snapshot["learningPlanOrderByRoute"] == student_snapshot["learningPlanOrderByRoute"]


def test_guidance_report_renders_route_keyed_learning_plan_without_mastery_claim():
    report = build_report_html(ReportContext(
        student_name="Ada Student",
        full_path={
            "programme": {"name": "Sociology"},
            "university": {"name": "Example University"},
            "learningFocus": [{
                "name": "Research design",
                "contextLevel": "domain",
                "contextKey": "D078",
                "itemType": "method",
                "itemKey": "research-design",
            }],
            "learningPlanSnapshot": {
                "routeWarnings": [{"message": "You selected more than one route."}],
                "stacks": [{
                    "route": {"domainId": "D078"},
                    "selectedIds": ["domain:D078:method:research-design"],
                    "removedIds": ["domain:D078:tool:old-tool"],
                    "itemSummaries": [{
                        "id": "domain:D078:method:research-design",
                        "name": "Research design",
                        "layer": "domain",
                        "itemType": "method",
                        "themeLabel": "Plan and investigate",
                        "useCaseKey": "research_design",
                        "requirementLevel": "needed",
                        "explanation": "Plan a clear question and method.",
                        "plainMeaning": "A structured way to plan an investigation.",
                        "contextualUse": "Use it to plan a Sociology research project.",
                        "expectedOutput": "A research plan with a clear question.",
                        "prerequisites": ["Research question"],
                        "relationships": [{
                            "type": "builds_on",
                            "targetId": "domain:D078:knowledge:research-question",
                            "targetName": "Research question",
                            "status": "source_backed",
                            "explanation": "A clear question comes first.",
                            "sourceReferences": [{
                                "title": "Research design source",
                                "url": "https://example.test/source",
                            }],
                        }],
                        "limitations": ["It does not prove that the findings are correct."],
                        "linkUrl": "https://example.test/research-design",
                    }],
                }],
            },
        },
    ))

    assert "Focused learning plan" in report
    assert "Research design" in report
    assert "Plan a clear question and method." in report
    assert "Type:</strong> method" in report
    assert "Theme:</strong> Plan and investigate" in report
    assert "Use case:</strong> research design" in report
    assert "What you can produce:</strong> A research plan with a clear question." in report
    assert "How it connects:" in report
    assert "Research question: A clear question comes first." in report
    assert "domain:D078:knowledge:research-question" not in report
    assert "Evidence: Research design source" in report
    assert "https://example.test/source" in report
    assert "Limits:</strong> It does not prove that the findings are correct." in report
    assert "Open learning resource" in report
    assert "not included in this route focus" in report
    assert "You selected more than one route." in report
    assert "not a test result, mastery claim" in report


def test_guidance_report_keeps_alternatives_and_multi_route_stacks_separate():
    report = build_report_html(ReportContext(
        student_name="Ada Student",
        full_path={
            "programme": {"id": "sociology", "name": "Sociology"},
            "domains": [{"id": "D078", "name": "Social Sciences"}],
            "subgroups": [{"id": "area-economics", "name": "Economics and Applied Economic Analysis"}],
            "roles": [{"roleKey": "economist", "name": "Economist"}],
            "learningPlanSnapshot": {
                "stacks": [
                    {
                        "route": {"programmeId": "sociology", "domainId": "D078", "areaId": "area-economics"},
                        "selectedIds": ["area:area-economics:tool:r"],
                        "itemSummaries": [
                            {"id": "area:area-economics:tool:r", "name": "R", "layer": "subgroup", "itemType": "tool"},
                            {"id": "area:area-economics:tool:stata", "name": "Stata", "layer": "subgroup", "itemType": "tool"},
                        ],
                    },
                    {
                        "route": {"programmeId": "sociology", "domainId": "D078", "areaId": "area-economics", "roleId": "economist"},
                        "selectedIds": ["role:economist:method:forecasting"],
                        "itemSummaries": [{
                            "id": "role:economist:method:forecasting",
                            "name": "Economic forecasting",
                            "layer": "role",
                            "itemType": "method",
                        }],
                    },
                ],
                "routeWarnings": [{"message": "You selected more than one route."}],
            },
        },
    ))

    assert "Sociology → Social Sciences → Economics and Applied Economic Analysis" in report
    assert "Sociology → Social Sciences → Economics and Applied Economic Analysis → Economist" in report
    assert report.count("Selected route") == 0
    assert "<strong>Step 1 · Area of specialization:</strong> R" in report
    assert "<strong>Step 1 · Role:</strong> Economic forecasting" in report
    assert "Stata" not in report
    assert "You selected more than one route." in report


def test_guidance_report_lists_unselected_alternatives_without_treating_them_as_selected():
    report = build_report_html(ReportContext(
        student_name="Ada Student",
        full_path={
            "programme": {"name": "Sociology"},
            "learningPlanSnapshot": {
                "stacks": [{
                    "route": {"programmeId": "sociology", "domainId": "D078", "areaId": "research"},
                    "selectedIds": ["area:research:tool:python"],
                    "itemSummaries": [{
                        "id": "area:research:tool:python",
                        "name": "Python",
                        "layer": "area",
                        "itemType": "tool",
                    }],
                    "alternativeSummaries": [{
                        "group": "analysis-language",
                        "selectedId": "area:research:tool:python",
                        "options": [{
                            "id": "area:research:tool:r",
                            "name": "R",
                            "layer": "area",
                            "itemType": "tool",
                            "plainMeaning": "A language and environment used for statistical computing.",
                            "contextualUse": "Use it to analyse social research data in this route.",
                            "expectedOutput": "A reproducible analysis and visual summary.",
                            "limitations": ["It does not choose a sound research design for you."],
                            "linkUrl": "https://example.test/r-learning",
                        }],
                    }],
                }],
            },
        },
    ))

    assert "Alternatives not selected" in report
    assert "Other options compared with Python" in report
    assert "R" in report
    assert "not selected" in report
    assert "A language and environment used for statistical computing." in report
    assert "Use it to analyse social research data in this route." in report
    assert "A reproducible analysis and visual summary." in report
    assert "It does not choose a sound research design for you." in report
    assert "https://example.test/r-learning" in report
    assert report.count("<strong>Step 1 · Area:</strong> Python") == 1


def test_guidance_report_keeps_selected_path_and_explains_focus_order():
    report = build_report_html(ReportContext(
        student_name="Ada Student",
        full_path={
            "academicContext": {"userType": "student"},
            "programme": {"name": "Computer Science"},
            "university": {"name": "Example University"},
            "domains": [{
                "name": "Computing",
                "intent": "primary",
                "skills": ["Problem solving"],
                "subgroups": [{"name": "Software", "skills": ["Testing"]}],
                "roles": [{"name": "Developer", "skills": {"essential": ["Programming"]}}],
            }],
        },
    ))

    assert "You already have partial preparation from your programme and primary domain." in report
    assert "Portable domain foundation" in report
    assert "Software" in report
    assert "Developer" in report
    assert "What you selected" in report
    assert "Subject check status" in report
    assert "Subject matching was not used for this programme search." in report
    assert "Data notes" in report
    assert "Unselected domain" not in report
