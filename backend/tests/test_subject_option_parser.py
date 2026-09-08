"""Regression tests for brochure qualifier and open-slot semantics."""

import sys
from pathlib import Path


PARSER_DIR = Path(__file__).parents[2] / "data" / "career-mapping"
if str(PARSER_DIR) not in sys.path:
    sys.path.insert(0, str(PARSER_DIR))

import _parse_subject_options as parser


def test_any_other_subject_is_an_open_slot_after_an_arts_requirement():
    parts = parser.parse_utme(
        "Two (2) Arts subjects including CRS and any other subject."
    )

    assert parts[0] == ("required", "CRS")
    assert ("one_of", 1, "distinct_1") == (
        parts[1][0],
        parts[1][1],
        parts[1][3],
    )
    assert ("one_of", 1, "distinct_1") == (
        parts[2][0],
        parts[2][1],
        parts[2][3],
    )
    assert "PHY" in parts[2][2]


def test_olevel_any_other_subject_includes_trade_and_vocational_catalogue():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes in English Language, Mathematics, "
        "Physics, Chemistry and any other subject."
    )

    assert parsed is not None
    choices = parsed[1][-1][2]
    assert "AUTO" in choices
    assert "CAT" in choices
    assert "WWK" in choices
    assert "ENG" not in choices
    assert "MATH" not in choices
    assert "PHY" not in choices
    assert "CHEM" not in choices


def test_relevant_suitable_and_appropriate_need_context():
    context = {
        "ARA", "ART", "COMM", "CRS", "ECON", "FRE", "GEO", "GOV",
        "HAU", "HIS", "IRS", "LIT", "MUS", "YOR",
    }
    for qualifier in ("relevant", "suitable", "appropriate"):
        text = (
            "Five (5) SSC credit passes in English Language, Arabic and "
            f"three (3) other {qualifier} subjects."
        )
        parsed = parser.parse_olevel(text, context_codes=context)
        assert parsed is not None
        assert parsed[0] == 5
        assert parsed[1][0:2] == [("required", "ENG"), ("required", "ARA")]
        assert set(parsed[1][2][2]) == context - {"ARA"}


def test_unresolved_qualifier_does_not_become_catalogue_wide():
    for qualifier in ("relevant", "suitable", "appropriate"):
        assert parser.parse_utme(
            f"English Language, Mathematics and one other {qualifier} subject"
        ) is None


def test_explicit_qualifier_scope_is_matchable():
    parsed = parser.parse_utme(
        "English Language, Mathematics and one other suitable subject "
        "from Government, History or Geography"
    )
    assert parsed == [
        ("required", "ENG"),
        ("required", "MATH"),
        ("one_of", 1, ["GEO", "GOV", "HIS"]),
    ]
