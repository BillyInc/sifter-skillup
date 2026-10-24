from routes.provisioning_routes import (
    RosterStudent,
    _guidance_context_is_allowed,
    _guidance_path_snapshot,
    _guidance_visibility_is_allowed,
)
from routes.student_pipeline_routes import _delete_learning_plan_snapshot, _merge_guidance_snapshot_history, _path_snapshot, _path_with_selected_learning_snapshot
from services.report_gen import ReportContext, build_report_docx, build_report_html


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


def test_d078_snapshot_without_generic_stacks_is_preserved_and_selected_for_resume():
    d078 = {
        "snapshotId": "d078-version-1",
        "stacks": [],
        "dataVersion": "guided-experience-d078-v1",
        "d078SelectionsByRoute": {"programme:social-sciences:sociology::D078": {
            "methodIds": ["domain-item:d078-interviews"],
            "combinationIds": ["combo:participatory-method-choice"],
            "componentMethodIds": {"combo:participatory-method-choice": ["domain-item:d078-interviews"]},
            "areaId": "D078:social-research-evaluation",
            "roleId": "role:D078:18:statistician",
            "addedItemIds": ["domain-item:d078-python"],
        }},
        "reportPathContext": {"programme": {"name": "Sociology"}},
    }
    saved = _path_snapshot({"learningPlanSnapshots": [d078]})
    assert saved["learningPlanSnapshots"][0]["stacks"] == []
    assert saved["learningPlanSnapshots"][0]["d078SelectionsByRoute"] == d078["d078SelectionsByRoute"]
    selected = _path_with_selected_learning_snapshot(saved, "d078-version-1")
    assert selected["learningPlanSnapshot"]["d078SelectionsByRoute"] == d078["d078SelectionsByRoute"]
    assert selected["programme"]["name"] == "Sociology"
    deleted = _delete_learning_plan_snapshot(saved, "d078-version-1")
    assert deleted["learningPlanSnapshots"] == []
    assert deleted["deletedLearningPlanSnapshotIds"] == ["d078-version-1"]


def test_deleting_one_d078_archive_version_preserves_the_other_version_routes():
    first = {
        "snapshotId": "d078-version-1",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1", "d078-route-2"],
        "d078SelectionsByRoute": {
            "sociology::D078": {"methodIds": ["domain-item:d078-interviews"], "areaId": "D078:sociology-social-anthropology"},
            "sociology::D078::d078-route-2": {"methodIds": ["domain-item:d078-spatial-social-analysis"], "areaId": "D078:computational-digital-social-science"},
        },
        "stacks": [],
    }
    second = {
        "snapshotId": "d078-version-2",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1"],
        "d078SelectionsByRoute": {
            "sociology::D078": {"methodIds": ["domain-item:d078-document-analysis"], "areaId": "D078:politics-governance-public-policy"},
        },
        "stacks": [],
    }
    path = {"learningPlanSnapshots": [first, second], "learningPlanSnapshot": second}

    deleted = _delete_learning_plan_snapshot(path, "d078-version-1")

    assert [entry["snapshotId"] for entry in deleted["learningPlanSnapshots"]] == ["d078-version-2"]
    assert deleted["learningPlanSnapshot"]["snapshotId"] == "d078-version-2"
    assert deleted["learningPlanSnapshot"]["d078SelectionsByRoute"] == second["d078SelectionsByRoute"]
    assert deleted["deletedLearningPlanSnapshotIds"] == ["d078-version-1"]


def test_d078_report_exports_saved_route_without_university_or_empty_content():
    snapshot = {
        "dataVersion": "guided-experience-d078-v1",
        "d078SelectionsByRoute": {"programme:social-sciences:sociology::D078": {
            "methodIds": ["domain-item:d078-interviews"],
            "combinationIds": ["combo:participatory-method-choice"],
            "componentMethodIds": {"combo:participatory-method-choice": ["domain-item:d078-interviews"]},
            "areaId": "D078:social-research-evaluation",
            "roleId": "role:D078:18:statistician",
            "addedItemIds": ["domain-item:d078-python"],
        }},
        "stacks": [],
    }
    ctx = ReportContext(student_name="Ada Student", full_path={
        "programme": {"name": "Sociology"},
        "learningPlanSnapshot": snapshot,
        "requirements": {"utmeSubjects": "Mathematics"},
    })
    html = build_report_html(ctx)
    assert "Sociology to Social Sciences &amp; Behavioural Research" in html
    assert "Interviews" in html
    assert "Choose evidence methods with participants" in html
    assert "Interviews" in html
    assert "Social Research and Evaluation" in html
    assert "Statistician" in html
    assert "How the selected methods contribute on this route" in html
    assert "Frame a researchable social question" in html  # inherited foundation, not a learner-added item
    assert "Python" in html
    assert "Admission requirements" not in html
    assert "University UTME subjects" not in html

    import io
    import zipfile
    with zipfile.ZipFile(io.BytesIO(build_report_docx(ctx))) as docx:
        document = docx.read("word/document.xml").decode("utf-8")
    assert "Saved D078 route" in document
    assert "Interviews" in document
    assert "Choose evidence methods with participants" in document
    assert "Interviews" in document
    assert "Frame a researchable social question" in document
    assert "Python" in document
    assert "Statistician" in document
    assert "How the selected methods contribute on this route" in document
    assert "Admission requirements" not in document
    assert "University-specific admission requirements are not included" in document


def test_d078_report_does_not_union_an_unselected_method_with_participatory_route():
    snapshot = {
        "dataVersion": "guided-experience-d078-v1",
        "d078SelectionsByRoute": {"programme:social-sciences:sociology::D078": {
            "methodIds": ["domain-item:d078-spatial-social-analysis"],
            "combinationIds": ["combo:participatory-method-choice"],
            "componentMethodIds": {"combo:participatory-method-choice": ["domain-item:d078-interviews"]},
            "areaId": "D078:social-research-evaluation",
            "roleId": "role:D078:18:statistician",
            "addedItemIds": ["domain-item:d078-spatial-social-analysis"],
        }},
    }
    ctx = ReportContext(student_name="Ada Student", full_path={
        "programme": {"name": "Sociology"},
        "learningPlanSnapshot": snapshot,
    })
    report = build_report_html(ctx)
    assert "Interviews" in report
    assert "Spatial analysis and mapping with suitable social data" not in report


def test_d078_report_export_filters_items_and_generic_paths_outside_selected_route():
    import io
    import zipfile

    snapshot = {
        "dataVersion": "guided-experience-d078-v1",
        "stacks": [{"selectedIds": ["unrelated:legacy:item"]}],
        "d078SelectionsByRoute": {"programme:social-sciences:sociology::D078": {
            "methodIds": ["domain-item:d078-interviews", "method:removed"],
            "combinationIds": ["combo:removed"],
            "componentMethodIds": {"combo:removed": ["domain-item:d078-survey-method"]},
            "areaId": "D078:computational-digital-social-science",
            "roleId": "role:D078:18:statistician",
            "addedItemIds": ["domain-item:d078-python", "not-a-current-node"],
        }},
    }
    ctx = ReportContext(student_name="Ada Student", full_path={
        "programme": {"name": "Sociology"},
        "domains": [{
            "name": "Hidden legacy domain",
            "skills": ["Hidden legacy item"],
            "subgroups": [{"name": "Hidden legacy area", "skills": ["Hidden area item"]}],
            "roles": [{"name": "Hidden legacy role", "skills": {"essential": ["Hidden role item"]}}],
        }],
        "learningPlanSnapshot": snapshot,
        "learningFocus": [{"name": "Hidden legacy focus item"}],
    })
    html = build_report_html(ctx)
    assert "Interviews" in html
    assert "Hidden legacy domain" not in html
    assert "Hidden legacy area" not in html
    assert "Hidden legacy role" not in html
    assert "Hidden legacy item" not in html
    assert "Python" not in html
    assert "Surveys and questionnaire design" not in html
    assert "Choose evidence methods with participants" not in html
    assert "Computational and Digital Social Science" not in html
    assert "Statistician" not in html
    assert "unrelated:legacy:item" not in html

    with zipfile.ZipFile(io.BytesIO(build_report_docx(ctx))) as docx:
        document = docx.read("word/document.xml").decode("utf-8")
    assert "Interviews" in document
    assert "Hidden legacy domain" not in document
    assert "Hidden legacy area" not in document
    assert "Hidden legacy role" not in document
    assert "Hidden legacy item" not in document
    assert "Python" not in document
    assert "Surveys and questionnaire design" not in document
    assert "Choose evidence methods with participants" not in document
    assert "Computational and Digital Social Science" not in document
    assert "Statistician" not in document
    assert "unrelated:legacy:item" not in document


def test_d078_report_keeps_field_only_and_area_routes_separate_in_html_and_docx():
    import io
    import zipfile

    snapshot = {
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1", "d078-route-2", "d078-route-3"],
        "d078ActiveStackId": "d078-route-3",
        "d078SelectionsByRoute": {
            "sociology::D078": {
                "methodIds": ["domain-item:d078-interviews"],
                "combinationIds": [],
                "componentMethodIds": {},
                "addedItemIds": [],
            },
            "sociology::D078::d078-route-2": {
                "methodIds": ["domain-item:d078-interviews"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:sociology-social-anthropology",
                "roleId": "role:D078:3:sociologist",
                "addedItemIds": ["area_enrichment_item:d078-soc-thematic-analysis"],
            },
            "sociology::D078::d078-route-3": {
                "methodIds": ["domain-item:d078-spatial-social-analysis"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:computational-digital-social-science",
                "addedItemIds": ["domain-item:d078-python"],
            },
        },
    }
    ctx = ReportContext(student_name="Ada Student", full_path={
        "programme": {"id": "sociology", "name": "Sociology"},
        "learningPlanSnapshot": snapshot,
        "domains": [{"name": "Legacy must not merge into routes", "skills": ["legacy-only"]}],
    })

    report = build_report_html(ctx)
    assert "Saved D078 route 1" in report
    assert "Saved D078 route 2" in report
    assert "Saved D078 route 3" in report
    assert "Stop point:</strong> Field only" in report
    assert "Stop point:</strong> Sociologist" in report
    assert "Stop point:</strong> Computational and Digital Social Science" in report
    assert "Interviews" in report
    assert "Spatial analysis" in report
    assert "Statistician" not in report
    assert "Sociologist" in report
    assert "Sociology and Social Anthropology" in report
    assert "Computational and Digital Social Science" in report
    assert "Thematic/framework analysis with an auditable codebook" in report
    assert "Python" in report
    assert "legacy-only" not in report

    with zipfile.ZipFile(io.BytesIO(build_report_docx(ctx))) as docx:
        document = docx.read("word/document.xml").decode("utf-8")
    assert "Saved D078 route 1" in document
    assert "Saved D078 route 2" in document
    assert "Saved D078 route 3" in document
    assert "Stop point: Field only" in document
    assert "Stop point: Sociologist" in document
    assert "Stop point: Computational and Digital Social Science" in document
    assert "Interviews" in document
    assert "Spatial analysis" in document
    assert "Statistician" not in document
    assert "Sociologist" in document
    assert "Sociology and Social Anthropology" in document
    assert "Computational and Digital Social Science" in document
    assert "Thematic/framework analysis with an auditable codebook" in document
    assert "Python" in document
    assert "legacy-only" not in document


def test_d078_report_export_uses_only_the_selected_archive_version():
    import io
    import zipfile

    first = {
        "snapshotId": "d078-interview-version",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1"],
        "d078ActiveStackId": "d078-route-1",
        "d078SelectionsByRoute": {
            "sociology::D078": {
                "methodIds": ["domain-item:d078-interviews"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:sociology-social-anthropology",
                "addedItemIds": ["area_enrichment_item:d078-soc-thematic-analysis"],
            },
        },
        "stacks": [],
    }
    second = {
        "snapshotId": "d078-spatial-version",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1"],
        "d078ActiveStackId": "d078-route-1",
        "d078SelectionsByRoute": {
            "sociology::D078": {
                "methodIds": ["domain-item:d078-spatial-social-analysis"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:computational-digital-social-science",
                "addedItemIds": ["domain-item:d078-python"],
            },
        },
        "stacks": [],
    }
    archive = {"learningPlanSnapshots": [first, second], "programme": {"id": "sociology", "name": "Sociology"}}

    selected_first = _path_with_selected_learning_snapshot(archive, "d078-interview-version")
    first_html = build_report_html(ReportContext(student_name="Ada Student", full_path=selected_first))
    assert "Interviews" in first_html
    assert "Thematic/framework analysis with an auditable codebook" in first_html
    assert "Spatial analysis" not in first_html
    assert "Python" not in first_html
    with zipfile.ZipFile(io.BytesIO(build_report_docx(ReportContext(student_name="Ada Student", full_path=selected_first)))) as docx:
        first_docx = docx.read("word/document.xml").decode("utf-8")
    assert "Interviews" in first_docx
    assert "Thematic/framework analysis with an auditable codebook" in first_docx
    assert "Spatial analysis" not in first_docx
    assert "Python" not in first_docx

    selected_second = _path_with_selected_learning_snapshot(archive, "d078-spatial-version")
    second_html = build_report_html(ReportContext(student_name="Ada Student", full_path=selected_second))
    assert "Spatial analysis" in second_html
    assert "Python" in second_html
    assert "Thematic/framework analysis with an auditable codebook" not in second_html
    with zipfile.ZipFile(io.BytesIO(build_report_docx(ReportContext(student_name="Ada Student", full_path=selected_second)))) as docx:
        second_docx = docx.read("word/document.xml").decode("utf-8")
    assert "Spatial analysis" in second_docx
    assert "Python" in second_docx
    assert "Thematic/framework analysis with an auditable codebook" not in second_docx


def test_d078_report_uses_the_programme_key_saved_with_the_snapshot():
    snapshot = {
        "dataVersion": "guided-experience-d078-v1",
        "d078SelectionsByRoute": {
            "programme-1::D078": {
                "methodIds": ["domain-item:d078-interviews"],
                "combinationIds": [],
                "componentMethodIds": {},
                "addedItemIds": [],
            },
            "programme-2::D078": {
                "methodIds": ["domain-item:d078-spatial-social-analysis"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:computational-digital-social-science",
                "addedItemIds": [],
            },
        },
    }
    report = build_report_html(ReportContext(student_name="Ada Student", full_path={
        "programme": {"id": "programme-2", "name": "Sociology"},
        "learningPlanSnapshot": snapshot,
    }))

    assert "Spatial analysis and mapping with suitable social data" in report
    assert "Computational and Digital Social Science" in report
    assert "Interviews" not in report


def test_d078_student_report_requires_attached_institution_and_includes_student_identity(monkeypatch):
    import io
    import zipfile
    import pytest
    from fastapi import HTTPException
    import routes.student_pipeline_routes as student_routes

    snapshot = {
        "snapshotId": "d078-report",
        "stacks": [],
        "dataVersion": "guided-experience-d078-v1",
        "d078SelectionsByRoute": {"programme:social-sciences:sociology::D078": {"methodIds": ["domain-item:d078-interviews"]}},
        "reportPathContext": {"programme": {"name": "Sociology"}},
    }

    class Query:
        def __init__(self, rows):
            self.rows = rows
        def select(self, *_args): return self
        def eq(self, *_args): return self
        def limit(self, *_args): return self
        def is_(self, *_args): return self
        def order(self, *_args, **_kwargs): return self
        @property
        def data(self): return self.rows
        def execute(self): return self

    class Service:
        def __init__(self, starting_point=None):
            self.starting_point = starting_point
        def table(self, name):
            if name == "guidance_report_paths":
                return Query([{"path": {"learningPlanSnapshots": [snapshot]}}])
            if name == "student_starting_points":
                return Query([self.starting_point] if self.starting_point else [])
            return Query([])

    monkeypatch.setattr(student_routes, "_users", lambda: Query([{"id": "student-1", "username": "Ada"}]))
    monkeypatch.setattr(student_routes, "_svc", lambda: Service())
    resolved_without_institution = student_routes.resolve_guidance_report_context(
        student_routes._svc(),
        {"id": "student-1", "username": "Ada"},
        {"path": student_routes._path_with_selected_learning_snapshot(
            {"learningPlanSnapshots": [snapshot]}, "d078-report"
        )},
    )
    assert resolved_without_institution["programme"]["name"] == "Sociology"
    assert not resolved_without_institution.get("university", {}).get("name")
    assert not resolved_without_institution.get("attachedInstitution")
    with pytest.raises(HTTPException) as missing_institution_error:
        student_routes._current_guidance_report_context({"id": "student-1"}, "d078-report")
    assert missing_institution_error.value.status_code == 409
    assert "Attach a named institution to your student profile" in missing_institution_error.value.detail

    missing_name_start = {
        "preferred_institution_type": "tutorial_centre",
        "preferred_school_name": "Bright Tutorial Centre",
    }
    monkeypatch.setattr(student_routes, "_svc", lambda: Service(missing_name_start))
    monkeypatch.setattr(student_routes, "_users", lambda: Query([{"id": "student-1", "username": None}]))
    with pytest.raises(HTTPException) as missing_name_error:
        student_routes._current_guidance_report_context({"id": "student-1"}, "d078-report")
    assert missing_name_error.value.status_code == 409
    assert "Add a student name or username" in missing_name_error.value.detail
    monkeypatch.setattr(student_routes, "_users", lambda: Query([{"id": "student-1", "username": "Ada"}]))

    institution_profiles = [
        (
            "tutorial_centre",
            "Bright Tutorial Centre",
            {"preferred_institution_type": "tutorial_centre", "preferred_school_id": "centre-1", "preferred_school_name": "Bright Tutorial Centre"},
        ),
        (
            "secondary_school",
            "Lagos Secondary School",
            {"raw_profile": {"secondarySchoolId": "school-1", "secondarySchoolName": "Lagos Secondary School"}},
        ),
        (
            "university",
            "Example University",
            {"preferred_institution_type": "university", "preferred_school_id": "university-1", "preferred_school_name": "Example University"},
        ),
    ]
    for institution_type, institution_name, starting_point in institution_profiles:
        monkeypatch.setattr(student_routes, "_svc", lambda starting_point=starting_point: Service(starting_point))
        context = student_routes._current_guidance_report_context({"id": "student-1"}, "d078-report")
        attached = context.full_path["attachedInstitution"]
        assert attached["institutionType"] == institution_type
        assert attached["name"] == institution_name
        if institution_type != "university":
            assert not context.full_path["university"].get("name")
        assert context.student_name == "Ada"
        assert context.student_identity_label == "Username"
        html = build_report_html(context)
        assert "Ada" in html
        assert "Username:" in html
        assert f"{attached['institutionTypeLabel']}: {institution_name}" in html
        if institution_type != "university":
            assert f"University: {institution_name}" not in html
        with zipfile.ZipFile(io.BytesIO(build_report_docx(context))) as docx:
            document = docx.read("word/document.xml").decode("utf-8")
        assert "Ada" in document
        assert "Username:" in document
        assert f"{attached['institutionTypeLabel']}: {institution_name}" in document
        if institution_type != "university":
            assert f"University: {institution_name}" not in document
        assert "Interviews" in html


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
