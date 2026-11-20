"""Route-level tests for the optional O-level grades on the subject matcher.

Invariants: grades only ADD ``gradeCheck``; the matched candidate set and every
pre-existing field are identical with and without grades; a request without
grades is byte-identical to the GET response; a missing grade is "unknown".
"""

import asyncio
import json

from routes import student_pipeline_routes as spr
from tests.test_student_pipeline_match import _FakeSvc

OLEVEL = "English Language, Mathematics, Government, Economics, Literature in English"
SOURCE = (
    "Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. "
    "A pass in Mathematics is required."
)
CODES = [("English Language", "ENG"), ("Mathematics", "MATH"), ("Government", "GOV"), ("History", "HIS"),
         ("Economics", "ECON"), ("Literature in English", "LIT"), ("Geography", "GEO"), ("Biology", "BIO")]


def _tables(has_condition=False):
    items = [{"option_id": "o1", "requirement_role": "required", "group_key": None, "min_from_group": None,
              "distinct_group_key": None, "subject_catalog": {"name": "English Language", "code": "ENG"}}]
    for name, code in [("Government", "GOV"), ("History", "HIS")]:
        items.append({"option_id": "o1", "requirement_role": "one_of", "group_key": "gh", "min_from_group": 1,
                      "distinct_group_key": "five", "subject_catalog": {"name": name, "code": code}})
    for name, code in [("Mathematics", "MATH"), ("Economics", "ECON"), ("Literature in English", "LIT"),
                       ("Geography", "GEO"), ("Biology", "BIO")]:
        items.append({"option_id": "o1", "requirement_role": "one_of", "group_key": "other", "min_from_group": 3,
                      "distinct_group_key": "five", "subject_catalog": {"name": name, "code": code}})
    rule = {"passRequiredCodes": ["MATH"]}
    if has_condition:
        rule["hasCondition"] = True
    return {
        "programme_subject_options": [{"id": "o1", "jamb_programme_id": "jp1", "exam_type": "olevel",
                                       "requirement_id": "r1", "option_label": "5 credits", "min_required": 5,
                                       "source_text": SOURCE}],
        "programme_subject_option_items": items,
        "programme_subject_rule_records": [{"jamb_programme_id": "jp1", "requirement_id": "r1", "exam_type": "olevel",
                                            "rule_status": "matchable", "source_text": SOURCE, "rule_json": rule}],
        "subject_catalog": [{"id": f"s-{c.lower()}", "name": n, "code": c} for n, c in CODES],
        "v_jamb_programme_details": [{"jamb_programme_id": "jp1", "jamb_name": "Sociology"}],
    }


def _setup(monkeypatch, **kw):
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(_tables(**kw)))
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_a: items)


def _get():
    return asyncio.run(spr.programmes_by_subjects(subjects="", olevel_subjects=OLEVEL, exam_type="olevel")).data


def _post(grades="__omit__", **kw):
    body = {"olevel_subjects": OLEVEL, "exam_type": "olevel", **kw}
    if grades != "__omit__":
        body["olevel_grades"] = grades
    return asyncio.run(spr.programmes_by_subjects_with_grades(spr.SubjectMatchIn(**body))).data


def _row(payload):
    assert len(payload["data"]) == 1
    return payload["data"][0]


ALL_C6 = {"ENG": "C6", "MATH": "C6", "GOV": "B3", "ECON": "A1", "LIT": "C4"}


def test_post_without_grades_is_byte_identical_to_get(monkeypatch):
    _setup(monkeypatch)
    assert json.dumps(_post(), sort_keys=False) == json.dumps(_get(), sort_keys=False)
    assert "gradeCheck" not in _row(_get())
    # null / empty grades behave exactly like omitted grades
    assert json.dumps(_post(None)) == json.dumps(_get())
    assert json.dumps(_post({})) == json.dumps(_get())


def test_grades_add_only_gradecheck_and_keep_candidate_set(monkeypatch):
    _setup(monkeypatch)
    base = _row(_get())
    for grades in (ALL_C6, {"ENG": "F9", "MATH": "F9"}, {"ENG": "A1"}, {"BIO": "A1"}):
        graded = _row(_post(grades))
        assert graded["jambProgrammeId"] == base["jambProgrammeId"]
        added = {k: v for k, v in graded.items() if k not in base}
        assert set(added) <= {"gradeCheck"}
        for k, v in base.items():
            if k != "eligibilityStatus":
                assert graded[k] == v


def test_all_credits_is_met_but_status_never_upgrades(monkeypatch):
    _setup(monkeypatch)
    row = _row(_post(ALL_C6))
    assert row["gradeCheck"]["status"] == "met"
    assert row["gradeCheck"]["basis"] == "self_reported"
    assert row["eligibilityStatus"] == "olevel_grade_check_required"  # unchanged, not "eligible"
    assert "WAEC/NECO" in row["gradeCheck"]["bandsNote"]


def test_failed_grade_labels_row_not_hides_it(monkeypatch):
    _setup(monkeypatch)
    row = _row(_post({**ALL_C6, "ENG": "D7"}))
    assert row["gradeCheck"]["status"] == "not_met"
    assert row["eligibilityStatus"] == "olevel_grade_not_met"
    eng = next(c for c in row["gradeCheck"]["conditions"] if c.get("subject") == "English Language")
    assert eng["status"] == "not_met" and eng["entered"] == "D7"


def test_math_pass_only_e8_met_f9_not_met(monkeypatch):
    _setup(monkeypatch)
    for grade, expected in (("E8", "met"), ("F9", "not_met")):
        row = _row(_post({**ALL_C6, "MATH": grade}))
        cond = next(c for c in row["gradeCheck"]["conditions"] if c["kind"] == "pass_subject")
        assert cond["status"] == expected


def test_missing_grades_are_unknown_never_not_met(monkeypatch):
    _setup(monkeypatch)
    row = _row(_post({"ENG": "A1"}))
    assert row["gradeCheck"]["status"] == "unknown"
    assert "not_met" not in {c["status"] for c in row["gradeCheck"]["conditions"]}
    assert row["eligibilityStatus"] == "olevel_grade_check_required"


def test_source_condition_keeps_result_unknown(monkeypatch):
    _setup(monkeypatch, has_condition=True)
    row = _row(_post(ALL_C6))
    assert row["gradeCheck"]["status"] == "unknown"
    assert any(c["kind"] == "source_condition" and "Needs confirmation with JAMB/the institution" in c["note"]
               for c in row["gradeCheck"]["conditions"])


def test_grades_accepted_by_name_and_malformed_ignored(monkeypatch):
    _setup(monkeypatch)
    payload = _post({"english language": "c6", "MATH": "Z9", "GOV": 3, "ECON": "A1", "bogus": "A1"})
    assert payload["meta"]["gradeInput"]["applied"] == 3  # english (name, lowercase grade), ECON, bogus(name)
    assert set(payload["meta"]["gradeInput"]["ignored"]) == {"MATH", "GOV"}
    eng = next(c for c in _row(payload)["gradeCheck"]["conditions"] if c.get("subject") == "English Language")
    assert eng["status"] == "met" and eng["entered"] == "C6"


def test_all_grades_malformed_means_no_gradecheck_and_same_rows(monkeypatch):
    _setup(monkeypatch)
    payload = _post({"ENG": "Q", "MATH": ""})
    assert "gradeCheck" not in _row(payload)
    assert payload["meta"]["gradeInput"] == {"applied": 0, "ignored": ["ENG", "MATH"]}
    assert _row(payload)["jambProgrammeId"] == _row(_get())["jambProgrammeId"]


def test_candidate_set_identical_when_rule_fails_selection(monkeypatch):
    _setup(monkeypatch)
    sel = "English Language, Government, Economics, Literature in English, Geography"  # no Maths
    get = asyncio.run(spr.programmes_by_subjects(subjects="", olevel_subjects=sel, exam_type="olevel")).data
    post = asyncio.run(spr.programmes_by_subjects_with_grades(
        spr.SubjectMatchIn(olevel_subjects=sel, exam_type="olevel", olevel_grades={"ENG": "A1"}))).data
    assert get["data"] == [] and post["data"] == []


def test_grades_never_appear_in_get_signature():
    import inspect
    assert "olevel_grades" not in inspect.signature(spr.programmes_by_subjects).parameters


def test_university_rule_gradecheck_via_evaluator():
    option = {"exam_type": "olevel", "min_required": 4, "pass_required_codes": ["MATH"], "condition_text": None}
    items = [
        {"requirement_role": "required", "subject_catalog": {"name": "English Language", "code": "ENG"}},
        {"requirement_role": "required", "subject_catalog": {"name": "Mathematics", "code": "MATH"}},
        *[{"requirement_role": "one_of", "group_key": "g", "min_from_group": 3,
           "distinct_group_key": "d", "subject_catalog": {"name": n, "code": c}}
          for n, c in [("Economics", "ECON"), ("Government", "GOV"), ("Literature in English", "LIT"), ("Geography", "GEO")]],
    ]
    sel = {"english language", "mathematics", "economics", "government", "literature in english"}
    plain = spr._evaluate_school_subject_option(option, items, sel)
    graded = spr._evaluate_school_subject_option(
        option, items, sel,
        {"english language": "C6", "mathematics": "E8", "economics": "C6", "government": "C6", "literature in english": "D7"},
    )
    assert "gradeCheck" not in plain
    assert {k: v for k, v in graded.items() if k != "gradeCheck"} == plain  # selection result unchanged
    assert graded["gradeCheck"]["status"] == "not_met"  # only 2 of 3 group credits... LIT D7
