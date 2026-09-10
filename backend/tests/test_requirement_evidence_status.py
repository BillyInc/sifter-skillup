"""Tests for the student-facing programme/offering evidence contract."""

from routes import student_pipeline_routes as spr


def test_national_parsed_requirement_is_complete():
    assert spr._requirement_status("parsed", "English, Mathematics", "Five credits") == "complete"


def test_unparsed_requirement_is_browseable_but_review_only():
    assert spr._requirement_status("unparsed", "English, Mathematics", "Five credits") == "review_only"


def test_missing_requirement_is_not_presented_as_eligibility():
    assert spr._requirement_status("unparsed", None, None) == "review_only"
    assert spr._requirement_status(None, None, None) == "source_missing"


def test_institution_text_without_structured_rule_is_review_only():
    status, notice = spr._offering_requirement_status(
        utme="English and three other subjects",
        olevel="Five credits",
        exceptions=[],
        local_options=[],
    )
    assert status == "review_only"
    assert "structured" in notice


def test_institution_full_rule_can_be_complete():
    status, _notice = spr._offering_requirement_status(
        utme=None,
        olevel=None,
        exceptions=[],
        local_options=[{"rule_scope": "full"}],
    )
    assert status == "complete"
