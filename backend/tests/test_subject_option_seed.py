"""Regression tests for the brochure-to-national-subject seed boundary."""

import importlib.util
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data/career-mapping"))


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


parser = _load("subject_option_parser_test", ROOT / "data/career-mapping/_parse_subject_options.py")
auditor = _load("subject_option_seed_auditor_test", ROOT / "data/career-mapping/_audit_subject_option_seed.py")
rule_generator = _load(
    "subject_rule_generator_test", ROOT / "data/career-mapping/_gen_subject_rule_records.py"
)
scoped_audit = _load(
    "jamb_scoped_subject_audit_test",
    ROOT / "data/career-mapping/_audit/build_jamb_subject_scoped_resolution_2026_10_08.py",
)


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
    assert next(part for part in parts if part[0] == "one_of")[2] == [
        "AGR", "BIO", "FMATH", "GEO"
    ]


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


def test_unmatchable_exact_source_variant_is_not_mislabeled_source_missing():
    result = rule_generator.source_rule_with_variants(
        "",
        "olevel",
        variants=[
            "English Language, Geography and three other Arts/Social Science "
            "credits with at least a pass in Mathematics."
        ],
    )

    assert result["rule_status"] == "structured_source"
    assert result["rule_kind"] == "source_variants"
    assert result["rule_json"]["reason"] == "source_variants_present_but_not_matchable"
    assert result["rule_json"]["sourceVariants"][0]["raw"].startswith("English Language")


def test_exact_source_variant_does_not_promote_ambiguous_national_rule():
    result = rule_generator.source_rule_with_variants(
        "",
        "utme",
        variants=[
            {
                "text": "Mathematics, Physics and Chemistry",
                "status": "exact",
                "source": {
                    "source_file": "Sciences.pdf",
                    "pdf_page": 12,
                    "table_row": 4,
                    "course_cell": "MATHEMATICS ABU",
                },
            }
        ],
    )

    assert result["rule_status"] == "structured_source"
    variant = result["rule_json"]["sourceVariants"][0]
    assert variant["scope"] == "offering_variant"
    assert variant["sourceLocator"]["course_cell"] == "MATHEMATICS ABU"
    assert variant["sourceLocator"]["pdf_page"] == 12


def test_national_rule_stays_matchable_while_offering_variants_remain_provenance():
    result = rule_generator.source_rule_with_variants(
        "Mathematics, Physics and Chemistry",
        "utme",
        variants=[
            {
                "text": "Mathematics, Physics and Biology",
                "status": "exact",
                "source": {"source_file": "Sciences.pdf", "pdf_page": 12},
            }
        ],
    )

    assert result["rule_status"] == "matchable"
    assert result["rule_json"]["required"] == ["MATH", "PHY", "CHEM"]
    assert result["rule_json"]["sourceVariants"][0]["scope"] == "offering_variant"


def test_scoped_source_cell_does_not_match_short_name_inside_compound_or_option():
    known = {
        "Mathematics",
        "Industrial Mathematics",
        "Education and Integrated Science",
    }
    assert not scoped_audit._exact_course_identity(
        "Mathematics", "INDUSTRIAL MATHEMATICS: AAU AAUA", known
    )[0]
    assert not scoped_audit._exact_course_identity(
        "Mathematics",
        "EDUCATION AND INTEGRATED SCIENCE: AAUA (offers the course as Mathematics/Integrated Science)",
        known,
    )[0]
    sociology_cell = (
        "SOCIOLOGY COVENANT EVANGEL FED-KASHERE PLASU SALEM "
        "SOCIOLOGYANDANTHROPOLOGY FED-OTUOKE"
    )
    assert scoped_audit._institution_codes_for_identity(
        "Sociology",
        sociology_cell,
            {"Sociology", "Sociology and Anthropology"},
        {"COVENANT", "EVANGEL", "FED-KASHERE", "PLASU", "SALEM", "FED-OTUOKE"},
        {"COVENANT", "EVANGEL", "FED-KASHERE", "PLASU", "SALEM", "FED-OTUOKE"},
    ) == ["COVENANT", "EVANGEL", "FED-KASHERE", "PLASU", "SALEM"]


def test_no_text_and_no_source_variants_remains_source_missing():
    result = rule_generator.source_rule_with_variants("", "olevel", variants=[])

    assert result["rule_status"] == "source_missing"


def test_nonapproved_brochure_subjects_stay_in_olevel_not_utme_catalogue():
    source_mentioned_but_not_currently_approved = {
        "CIV", "AGR", "FMATH", "FSN", "GMT", "CLT", "DYEB", "HMG",
        "CAT", "TD", "ENVS", "IT", "CSC", "PHE",
    }
    assert source_mentioned_but_not_currently_approved.isdisjoint(parser.UTME_CODES)
    assert source_mentioned_but_not_currently_approved <= parser.OLEVEL_CODES
    assert parser.parse_utme("Further Mathematics") is None
    assert parser.parse_utme("Catering Craft Practice") is None
    assert parser.parse_utme("Computer Studies") is None
    assert parser.parse_utme("Physical and Health Education") is None
    assert parser.parse_olevel(
        "Five credit passes including Further Mathematics."
    ) is not None
    assert parser.parse_olevel(
        "Five credit passes including Catering Craft Practice."
    ) is not None
    # Named inclusions alone do not reveal the remaining credit pool. Keep
    # this source text review-only instead of treating the whole catalogue as
    # the unnamed remainder.
    assert parser.parse_olevel(
        "Five credit passes including Computer Studies and Physical and Health Education."
    ) is None
    assert parser.parse_olevel(
        "Five credit passes including Computer Studies and Physical and Health Education and any other three subjects."
    ) is not None


def test_currently_approved_utme_aliases_map_and_nonapproved_pool_stays_unmatchable():
    assert parser.parse_utme("Agriculture") == [("required", "AGRIC")]
    assert parser.parse_utme("Agricultural Science") == [("required", "AGRIC")]

    assert parser.parse_utme("Yoruba/Hausa/Igbo") == [
        ("one_of", 1, ["HAU", "IGB", "YOR"])
    ]
    assert parser.parse_utme("CRS/IRS") == [
        ("one_of", 1, ["CRS", "IRS"])
    ]
    combined = parser.parse_utme(
        "Mathematics, Physics, and one other subject from Food & Nutrition, "
        "Home Management, Clothing & Textile, Garment Making, "
        "Dyeing & Bleaching, and Catering Craft Practice"
    )
    # These brochure rows name subjects outside the current approved UTME
    # catalogue, so retain them for source review instead of exposing them as
    # selectable UTME options.
    assert parser.parse_utme("Home Management") is None
    assert combined is None


def test_generated_subject_option_sql_passes_prerequisite_and_completeness_audit():
    # This covers the executable seed, not just parser fixtures: it catches
    # missing catalogue rows, orphan programme/requirement IDs, incomplete
    # group capacity, and source names omitted from emitted items.
    auditor.main()
