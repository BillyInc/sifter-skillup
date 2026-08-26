"""Regression tests for the brochure-to-national-subject seed boundary."""

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


parser = _load("subject_option_parser_test", ROOT / "data/career-mapping/_parse_subject_options.py")
auditor = _load("subject_option_seed_auditor_test", ROOT / "data/career-mapping/_audit_subject_option_seed.py")


def test_olevel_named_head_and_science_group_are_not_replaced_by_category_fallback():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes to include English Language, Physics, "
        "Chemistry and Mathematics and one (1) other Science."
    )

    assert parsed is not None
    minimum, parts = parsed
    assert minimum == 5
    assert {part[1] for part in parts if part[0] == "required"} == {
        "ENG",
        "PHY",
        "CHEM",
        "MATH",
    }
    assert next(part for part in parts if part[0] == "one_of")[2] == ["AGR", "BIO", "GEO"]


def test_olevel_trailing_brochure_note_does_not_drop_named_alternative():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes in English Language, Chemistry, Mathematics, "
        "Biology/Agric Science and one of Physics, Geography or Economics "
        "(shares requirements with Animal Science umbrella block)."
    )

    assert parsed is not None
    _minimum, parts = parsed
    assert "ECON" in next(part for part in parts if part[0] == "one_of" and "ECON" in part[2])[2]


def test_olevel_lower_pass_condition_is_review_only():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes to include English Language, Geography "
        "and any other three (3) subjects from Arts/Social Sciences with at "
        "least 'O' Level pass in Mathematics."
    )

    assert parsed is None


def test_generated_subject_option_sql_passes_prerequisite_and_completeness_audit():
    # This covers the executable seed, not just parser fixtures: it catches
    # missing catalogue rows, orphan programme/requirement IDs, incomplete
    # group capacity, and source names omitted from emitted items.
    auditor.main()
