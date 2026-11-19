"""Exhaustive unit tests for the pure O-level grade check (no DB, no HTTP)."""

import pytest

from services import olevel_grades as og
from services.olevel_grades import grade_check, normalize_grade

SCALE = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]
CREDIT = {"A1", "B2", "B3", "C4", "C5", "C6"}
PASS = CREDIT | {"D7", "E8"}


def s(name):
    return {"name": name, "norm": name.lower()}


def status_of(result, kind=None):
    rows = [c for c in result["conditions"] if kind in (None, c["kind"])]
    return [c["status"] for c in rows]


def test_scale_constants_are_the_documented_bands():
    assert list(og.OLEVEL_GRADE_SCALE) == SCALE
    assert og.OLEVEL_CREDIT_GRADES == CREDIT
    assert og.OLEVEL_PASS_GRADES == PASS


@pytest.mark.parametrize("grade", SCALE)
def test_credit_subject_every_grade(grade):
    r = grade_check(
        required=[s("Mathematics")],
        selected_norm={"mathematics"},
        grades_by_norm={"mathematics": grade},
    )
    expected = "met" if grade in CREDIT else "not_met"
    assert status_of(r, "credit_subject") == [expected]
    assert r["status"] == expected
    assert r["conditions"][0]["entered"] == grade


@pytest.mark.parametrize("grade", SCALE)
def test_pass_only_mathematics_every_grade(grade):
    r = grade_check(
        pass_required=[s("Mathematics")],
        selected_norm={"mathematics"},
        grades_by_norm={"mathematics": grade},
    )
    expected = "met" if grade in PASS else "not_met"
    assert status_of(r, "pass_subject") == [expected]
    assert r["status"] == expected


def test_d7_and_e8_pass_but_not_credit_f9_fails_both():
    for g, credit, passed in [("D7", "not_met", "met"), ("E8", "not_met", "met"), ("F9", "not_met", "not_met")]:
        assert grade_check(required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": g})["status"] == credit
        assert grade_check(pass_required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": g})["status"] == passed


def test_missing_grade_is_unknown_never_not_met():
    for kw in ({"required": [s("English")]}, {"pass_required": [s("English")]}):
        r = grade_check(selected_norm={"english"}, grades_by_norm={}, **kw)
        assert r["status"] == "unknown"
        assert "Add your grade for English" in r["conditions"][0]["note"]


def test_unselected_subject_is_unknown_even_with_a_grade_for_it():
    r = grade_check(required=[s("Physics")], selected_norm={"english"}, grades_by_norm={"physics": "F9"})
    assert r["status"] == "unknown"


def test_invalid_grade_values_are_treated_as_missing():
    r = grade_check(required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": "Z0"})
    assert r["status"] == "unknown"


@pytest.mark.parametrize("raw,expected", [("a1", "A1"), (" c6 ", "C6"), ("F9", "F9"), ("G1", None), ("A", None), ("", None), (None, None), (7, None), ("B1", None)])
def test_normalize_grade(raw, expected):
    assert normalize_grade(raw) == expected


def _total(credits, ungraded=0, fails=0, minimum=5, extra_unselected=0):
    names = [f"s{i}" for i in range(credits + ungraded + fails + extra_unselected)]
    selected = set(names[: credits + ungraded + fails])
    grades = {}
    for n in names[:credits]:
        grades[n] = "C6"
    for n in names[credits + ungraded : credits + ungraded + fails]:
        grades[n] = "F9"
    return grade_check(credit_minimum=minimum, selected_norm=selected, grades_by_norm=grades)


@pytest.mark.parametrize(
    "credits,ungraded,fails,expected",
    [
        (5, 0, 0, "met"),
        (6, 0, 0, "met"),
        (5, 1, 0, "met"),
        (4, 1, 0, "unknown"),  # 4 credits + 1 ungraded could still reach 5
        (4, 0, 1, "not_met"),  # 4 credits + 1 F9
        (3, 2, 0, "unknown"),
        (3, 1, 1, "not_met"),
        (0, 5, 0, "unknown"),
        (0, 0, 5, "not_met"),
        (4, 2, 0, "unknown"),
    ],
)
def test_credit_total_boundaries(credits, ungraded, fails, expected):
    assert _total(credits, ungraded, fails)["status"] == expected


def test_credit_total_fewer_subjects_than_minimum_is_selection_gap_unknown():
    r = _total(credits=3, minimum=5)
    assert r["status"] == "unknown"  # 3 selected < 5: not a grade failure


def test_d7_e8_do_not_count_toward_credit_total():
    sel = {f"s{i}" for i in range(5)}
    grades = {"s0": "C6", "s1": "C6", "s2": "C6", "s3": "C6", "s4": "E8"}
    assert grade_check(credit_minimum=5, selected_norm=sel, grades_by_norm=grades)["status"] == "not_met"
    grades["s4"] = "C6"
    assert grade_check(credit_minimum=5, selected_norm=sel, grades_by_norm=grades)["status"] == "met"


def test_pass_only_math_with_credit_total_five():
    sel = {"english", "mathematics", "a", "b", "c"}
    grades = {"english": "A1", "a": "B2", "b": "C4", "c": "C6", "mathematics": "E8"}
    r = grade_check(
        required=[s("English")], pass_required=[s("Mathematics")],
        credit_minimum=5, selected_norm=sel, grades_by_norm=grades,
    )
    assert status_of(r, "pass_subject") == ["met"]
    assert status_of(r, "credit_total") == ["not_met"]  # math E8 is not a credit
    assert r["status"] == "not_met"


def test_group_credit_met_unknown_not_met():
    g = [{"names": [s("A"), s("B"), s("C")], "minimum": 2}]
    sel = {"a", "b", "c"}
    assert grade_check(groups=g, selected_norm=sel, grades_by_norm={"a": "C6", "b": "B3"})["status"] == "met"
    assert grade_check(groups=g, selected_norm=sel, grades_by_norm={"a": "C6"})["status"] == "unknown"  # b, c ungraded
    assert grade_check(groups=g, selected_norm=sel, grades_by_norm={"a": "C6", "b": "D7", "c": "F9"})["status"] == "not_met"
    # selection itself short of the minimum -> unknown, not a grade failure
    assert grade_check(groups=g, selected_norm={"a"}, grades_by_norm={"a": "F9"})["status"] == "unknown"


def test_distinct_groups_cannot_reuse_a_subject():
    g = [
        {"names": [s("A"), s("B")], "minimum": 1, "distinct": "k"},
        {"names": [s("A")], "minimum": 1, "distinct": "k"},
    ]
    sel = {"a", "b"}
    assert grade_check(groups=g, selected_norm=sel, grades_by_norm={"a": "C6", "b": "C6"})["status"] == "met"
    assert grade_check(groups=g, selected_norm=sel, grades_by_norm={"a": "C6", "b": "F9"})["status"] == "not_met"
    assert grade_check(groups=g, selected_norm={"a"}, grades_by_norm={"a": "C6"})["status"] == "unknown"


def test_source_condition_always_unknown_and_never_met():
    r = grade_check(
        required=[s("English")], selected_norm={"english"},
        grades_by_norm={"english": "A1"}, has_source_condition=True,
    )
    assert status_of(r, "source_condition") == ["unknown"]
    assert r["status"] == "unknown"
    assert "Needs confirmation with JAMB/the institution" in r["conditions"][-1]["note"]
    # a real failure still wins over unknown
    r = grade_check(required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": "F9"}, has_source_condition=True)
    assert r["status"] == "not_met"


def test_overall_precedence_and_no_conditions():
    r = grade_check(required=[s("A"), s("B"), s("C")], selected_norm={"a", "b", "c"}, grades_by_norm={"a": "A1", "b": "F9"})
    assert r["status"] == "not_met"
    assert grade_check(selected_norm={"a"}, grades_by_norm={"a": "A1"})["status"] == "unknown"


def test_envelope_text_and_no_admission_claims():
    r = grade_check(required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": "C6"})
    assert r["basis"] == "self_reported"
    assert "WAEC/NECO" in r["bandsNote"] and "institution's own rule still applies" in r["bandsNote"]
    assert "Needs confirmation with JAMB/the institution" in r["utmeScoreNote"]
    text = repr(r).lower()
    assert "admitted" not in text and "qualified" not in text and "%" not in text


def test_configurable_bands():
    r = grade_check(
        required=[s("English")], selected_norm={"english"}, grades_by_norm={"english": "D7"},
        credit_grades=frozenset(SCALE[:7]),
    )
    assert r["status"] == "met"


def test_function_does_not_mutate_inputs():
    grades = {"english": "C6"}
    sel = {"english"}
    grade_check(required=[s("English")], selected_norm=sel, grades_by_norm=grades)
    assert grades == {"english": "C6"} and sel == {"english"}
