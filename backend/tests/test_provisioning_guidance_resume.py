from routes.provisioning_routes import RosterStudent, _guidance_path_snapshot


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
