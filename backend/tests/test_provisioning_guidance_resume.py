from routes.provisioning_routes import (
    RosterStudent,
    _guidance_context_is_allowed,
    _guidance_path_snapshot,
    _guidance_visibility_is_allowed,
)
from routes.student_pipeline_routes import _path_snapshot
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
    assert "Data notes" in report
    assert "Unselected domain" not in report
