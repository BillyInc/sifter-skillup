import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "data" / "career-mapping"))

from _parse_local_subject_exceptions import parse_local_exception  # noqa: E402
from routes import student_pipeline_routes as spr  # noqa: E402


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, data):
        self.data = data

    def select(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def execute(self):
        return _Result(self.data)


class _Service:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return _Query(self.tables.get(name, []))


def test_exact_local_utme_rule_is_structured():
    result = parse_local_exception(
        "UTME SUBJECTS: LAGOS requires Mathematics, Economics and any one (1) subject from Science, Social Science or Arts."
    )
    assert result["status"] == "parsed"
    assert result["exam_type"] == "utme"
    assert result["rule_scope"] == "full"
    assert result["min_required"] == 3


def test_exact_local_olevel_rule_is_structured_even_when_marker_is_mislabeled():
    result = parse_local_exception(
        "UTME: PHC requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce."
    )
    assert result["status"] == "parsed"
    assert result["exam_type"] == "olevel"
    assert result["min_required"] == 5


def test_sitting_limit_is_preserved_as_a_condition():
    result = parse_local_exception(
        "UTME: BOWEN requires five (5)'O' Level credit passes to include English Language, Literature in English and three (3) other Arts subjects at not more than two (2) sittings."
    )
    assert result["status"] == "parsed"
    assert result["rule_scope"] == "partial"
    assert result["condition_text"] == "at not more than two (2) sittings"


def test_cross_reference_stays_review_only():
    result = parse_local_exception("UTME SUBJECTS: AUN same as in Finance.")
    assert result == {"status": "needs_review", "reason": "cross_reference"}


def test_waiver_and_sitting_condition_are_structured_without_full_eligibility_claim():
    waiver = parse_local_exception(
        "UTME: PLASU accepts Commerce or Principles of Accounts in lieu of Economics."
    )
    sitting = parse_local_exception(
        "UTME: DELSU requires five credits at not more than two sittings."
    )
    assert waiver["status"] == "parsed"
    assert waiver["rule_scope"] == "partial"
    assert waiver["condition_text"]
    assert sitting["status"] == "parsed"
    assert sitting["rule_scope"] == "partial"
    assert "sittings" in sitting["condition_text"]


def test_direct_entry_note_is_not_a_subject_rule():
    result = parse_local_exception("DIRECT ENTRY (i) ABU accepts ND at Credit level.")
    assert result == {"status": "not_subject_rule", "reason": "direct_entry"}


def test_condition_only_rule_cannot_pass_without_subject_items():
    result = spr._evaluate_school_subject_option(
        {"exam_type": "utme", "min_required": 0, "condition_text": "Mathematics is not compulsory"},
        [],
        {"mathematics"},
    )
    assert result["passes"] is False
    assert result["missingSubjects"]


def test_university_rule_is_evaluated_only_for_its_offering(monkeypatch):
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _Service(
            {
                "schools": [{"id": "s1", "address": "1 Main Road", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}],
                "school_programmes": [{"id": "sp1", "school_id": "s1", "jamb_programme_id": "jp1", "remarks": None}],
                "school_programme_requirement_exceptions": [{
                    "school_id": "s1", "jamb_programme_id": "jp1", "exam_type": "utme",
                    "requirement_text": "Mathematics, Economics and any one Social Science subject",
                    "source_file": "brochure", "source_label": "brochure:jp1:s1:0", "parse_status": "parsed",
                }],
                "school_programme_subject_options": [{
                    "id": "local1", "exception_id": "ex1", "school_programme_id": "sp1",
                    "school_id": "s1", "jamb_programme_id": "jp1", "exam_type": "utme",
                    "rule_scope": "full", "option_label": "University UTME rule", "min_required": 3,
                    "source_text": "Mathematics, Economics and any one Social Science subject",
                    "condition_text": None,
                }],
                "school_programme_subject_option_items": [
                    {"option_id": "local1", "requirement_role": "required", "group_key": None, "min_from_group": None, "distinct_group_key": None, "subject_catalog": {"name": "Mathematics"}},
                    {"option_id": "local1", "requirement_role": "required", "group_key": None, "min_from_group": None, "distinct_group_key": None, "subject_catalog": {"name": "Economics"}},
                    {"option_id": "local1", "requirement_role": "one_of", "group_key": "g1", "min_from_group": 1, "distinct_group_key": None, "subject_catalog": {"name": "Government"}},
                ],
            }
        ),
    )
    rows = spr._attach_school_details(
        [{"schoolId": "s1", "jambProgrammeId": "jp1"}],
        {"mathematics", "economics", "government"},
        set(),
    )
    assert rows[0]["universityEligibilityStatus"] == "eligible_local_rule"
    assert rows[0]["address"] == "1 Main Road"


def test_direct_entry_is_hidden_from_current_student_offering_payload(monkeypatch):
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _Service(
            {
                "schools": [],
                "school_programmes": [{
                    "id": "sp1",
                    "school_id": "s1",
                    "jamb_programme_id": "jp1",
                    "utme_subjects": "Mathematics, Physics and Chemistry",
                    "olevel_requirement": "Five credits",
                    "direct_entry": "Two A-Level passes",
                    "remarks": None,
                }],
                "school_programme_requirement_exceptions": [{
                    "school_id": "s1",
                    "jamb_programme_id": "jp1",
                    "exam_type": "direct_entry",
                    "requirement_text": "Two A-Level passes",
                    "source_file": "brochure",
                    "source_label": "brochure:jp1:s1:0",
                    "parse_status": "needs_review",
                }],
                "school_programme_subject_options": [{
                    "id": "direct1",
                    "school_id": "s1",
                    "jamb_programme_id": "jp1",
                    "exam_type": "direct_entry",
                    "rule_scope": "full",
                    "source_text": "Two A-Level passes",
                    "min_required": 2,
                }],
                "school_programme_subject_option_items": [],
            }
        ),
    )
    rows = spr._attach_school_details([{"schoolId": "s1", "jambProgrammeId": "jp1"}])
    assert "universityDirectEntry" not in rows[0]
    assert rows[0]["universityRequirementExceptions"] == []
    assert rows[0]["universityStructuredSubjectRules"] == []
