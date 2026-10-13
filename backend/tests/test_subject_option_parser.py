"""Regression tests for brochure qualifier and open-slot semantics."""

import sys
import json
import re
from pathlib import Path


PARSER_DIR = Path(__file__).parents[2] / "data" / "career-mapping"
if str(PARSER_DIR) not in sys.path:
    sys.path.insert(0, str(PARSER_DIR))

import _parse_subject_options as parser
from _parse_local_subject_exceptions import parse_local_exception
from _jamb_source_rules import apply_brochure_subject_overrides
from _gen_subject_rule_records import resolve_contextual_rules


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


def test_utme_catalogue_matches_current_jamb_approved_subject_set():
    assert len(parser.UTME_CODES) == 23
    assert parser.UTME_CODES == {
        "ENG", "AGRIC", "ARA", "ART", "BIO", "CHEM", "CRS", "COMM",
        "ECON", "FRE", "GEO", "GOV", "HAU", "HEC", "HIS", "IGB",
        "IRS", "LIT", "MATH", "MUS", "PHY", "ACC", "YOR",
    }
    assert {"FMATH", "CIV", "CAT", "TD", "IT", "CSC", "PHE"}.isdisjoint(parser.UTME_CODES)
    assert {"FMATH", "CIV", "CAT", "TD", "IT"}.issubset(parser.OLEVEL_CODES)


def test_subject_seed_exam_memberships_match_parser_catalogues():
    seed = Path(__file__).parents[1] / "seed_subject_catalog.sql"
    memberships = {"utme": set(), "olevel": set()}
    for line in seed.read_text(encoding="utf-8-sig").splitlines():
        match = re.match(r"\('([^']+)'", line.strip())
        if not match:
            continue
        code = match.group(1)
        if "ARRAY['utme'" in line:
            memberships["utme"].add(code)
        if "'olevel'" in line:
            memberships["olevel"].add(code)

    assert memberships["utme"] == parser.UTME_CODES
    assert memberships["olevel"] == parser.OLEVEL_CODES
    assert len(memberships["olevel"]) == 82


def test_utme_agricultural_science_brochure_alias_maps_to_current_agriculture_label():
    assert parser.parse_utme(
        "Mathematics, Physics and Agricultural Science."
    ) == [("required", "MATH"), ("required", "PHY"), ("required", "AGRIC")]
    olevel = parser.parse_olevel(
        "Five credit passes including Agricultural Science."
    )
    assert olevel[1][0] == ("required", "AGR")


def test_utme_subject_pool_category_unions_are_explicit_not_stream_guesses():
    social_or_commercial = parser.category_codes(
        "Social Science or Commercial subjects", parser.UTME_CODES
    )
    assert set(social_or_commercial) == {"ECON", "GOV", "GEO", "COMM", "ACC"}

    science_or_social = parser.category_codes(
        "Sciences or Social Sciences", parser.UTME_CODES
    )
    assert {"PHY", "CHEM", "BIO", "ECON", "GOV", "GEO", "COMM"} <= set(science_or_social)


def test_unverified_botany_and_zoology_are_not_invented_as_utme_subject_aliases():
    assert parser.resolve_token("Botany", parser.UTME_CODES) is None
    assert parser.resolve_token("Zoology", parser.UTME_CODES) is None
    assert parser.parse_utme("Chemistry, Biology and Zoology") is None
    assert parser.parse_utme(
        "Chemistry and any two of Biology, Botany, Physics, Mathematics"
    ) is None


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


def test_olevel_plural_any_other_subjects_uses_credit_minimum_for_slot_count():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes including English Language, Mathematics "
        "and any other subjects."
    )

    assert parsed is not None
    minimum, parts = parsed
    assert minimum == 5
    assert parts[:2] == [("required", "ENG"), ("required", "MATH")]
    assert parts[2][0:2] == ("one_of", 3)
    assert "ENG" not in parts[2][2]
    assert "MATH" not in parts[2][2]
    assert parser.olevel_parts_are_matchable(
        "Five (5) SSC credit passes including English Language, Mathematics "
        "and any other subjects.",
        parsed,
    )


def test_olevel_numbered_category_group_remains_scoped_and_exact():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes including English Language, Mathematics "
        "and any three (3) Science subjects."
    )

    assert parsed is not None
    assert parsed[0] == 5
    group = parsed[1][-1]
    assert group[0:2] == ("one_of", 3)
    assert set(group[2]) == set(parser.SCIENCE) - {"ENG", "MATH"}


def test_olevel_glued_any_other_arts_subject_is_recovered_without_widening_scope():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes to include Igbo, English Language "
        "and anyotherArtssubject."
    )

    assert parsed is not None
    assert parsed[0] == 5
    assert parsed[1][:2] == [("required", "IGB"), ("required", "ENG")]
    assert parsed[1][2][0:2] == ("one_of", 1)
    assert set(parsed[1][2][2]) == set(parser.ARTS) - {"IGB", "ENG"}


def test_olevel_glued_conjunction_before_any_other_is_recovered_from_ibass_cell():
    source = (
        "Five (5) SSC credit passes in English Language, Biology, Chemistry, "
        "Mathematics andanyothersubject."
    )

    parsed = parser.parse_olevel(source)

    assert parsed is not None
    assert parsed[0] == 5
    assert {part[1] for part in parsed[1] if part[0] == "required"} == {
        "ENG", "BIO", "CHEM", "MATH"
    }
    assert any(part[0:2] == ("one_of", 1) for part in parsed[1])
    assert parser.olevel_parts_are_matchable(source, parsed)


def test_science_or_social_science_is_a_union_category_not_all_subjects():
    category = parser.category_codes("Science/Social Science", parser.UTME_CODES)

    expected = set(parser.SCIENCE + parser.SOCIAL) & parser.UTME_CODES
    expected.add("AGRIC")  # Current UTME label for brochure Agricultural Science.
    assert set(category) == expected
    assert len(category) < len(parser.UTME_CODES)


def test_olevel_any_n_science_or_social_science_keeps_the_source_scope():
    parsed = parser.parse_olevel(
        "Five (5) SSC credit passes in English Language, Mathematics, "
        "Chemistry and any two (2) Science/Social Science subjects."
    )

    assert parsed is not None
    assert parsed[0] == 5
    group = parsed[1][-1]
    assert group[0:2] == ("one_of", 2)
    assert set(group[2]) == set(parser.SCIENCE + parser.SOCIAL) - {
        "ENG", "MATH", "CHEM"
    }
    assert parser.olevel_parts_are_matchable(
        "Five (5) SSC credit passes including English Language, Mathematics, "
        "Chemistry and any two (2) Science/Social Science subjects.",
        parsed,
    )


def test_two_utme_groups_keep_category_and_named_alternatives_distinct():
    parsed = parser.parse_utme(
        "Any two (2) subjects from Arts, Social Sciences and one of "
        "History, Government and Geography."
    )

    assert parsed is not None
    assert parsed[0][0:2] == ("one_of", 2)
    assert set(parsed[0][2]) == set(parser.ARTS + parser.SOCIAL)
    assert parsed[1][0:2] == ("one_of", 1)
    assert set(parsed[1][2]) == {"HIS", "GOV", "GEO"}


def test_unknown_generic_religious_studies_label_is_not_conflated_with_crs_or_irs():
    assert parser.resolve_token("Religious Studies", parser.UTME_CODES) is None


def test_distinct_exam_subjects_resolve_to_distinct_catalogue_codes():
    # Separate source-listed subjects must not be silently counted as a
    # neighbouring subject merely because they share a broad discipline.
    supported = {
        "Home Management": "HMG", "Health Education": "HED",
        "Physical Education": "PE", "Data Processing": "DPR",
        "Book Keeping": "BOOKKEEP", "Bookkeeping": "BOOKKEEP",
        "Textile": "TXT", "Nutrition": "NUTR", "Agriculture": "AGRIC",
        "Dyeing & Bleaching": "DYEB", "Clothing and Textile": "CLT",
    }
    for name, code in supported.items():
        assert parser.resolve_token(name, parser.OLEVEL_CODES) == [code], name
    for name in (
        "ICT",
        "Computer Science",
        "Zoology",
        "Botany",
        "Agriculture/Science",
        "Creative Arts",
    ):
        assert parser.resolve_token(name, parser.OLEVEL_CODES) is None, name


def test_jamb_source_aliases_preserve_observed_labels_and_reject_unverified_merges():
    assert parser.resolve_token("Additional/Further Mathematics", parser.OLEVEL_CODES) == ["FMATH"]
    assert parser.resolve_token("Agriculture Science", parser.OLEVEL_CODES) == ["AGR"]
    assert parser.resolve_token("Dyeing & Bleaching", parser.OLEVEL_CODES) == ["DYEB"]
    assert parser.resolve_token("Catering Craft Practice", parser.OLEVEL_CODES) == ["CAT"]
    assert parser.resolve_token(
        "Ladies Garment Construction and Finishing", parser.OLEVEL_CODES
    ) == ["LADY_GARM"]
    assert parser.resolve_token("Dress Making", parser.OLEVEL_CODES) is None
    assert parser.resolve_token("Motor Vehicle Mechanics", parser.OLEVEL_CODES) is None


def test_brochure_pdf_token_joins_are_repaired_narrowly():
    assert parser.parse_utme("Catering CraftPractice") is None
    assert parser.parse_olevel(
        "Five credit passes including Catering CraftPractice."
    )[1][0] == ("required", "CAT")
    normalized = parser.preclean(
        "Five (5) SSC credit passes in English Language, Mathematics, "
        "Chemistry, Biology, and ladiesgarment construction andfinishing."
    )
    assert "ladies garment construction and finishing" in normalized.lower()
    assert parser.resolve_token(
        "Ladies Garment Construction and Finishing", parser.OLEVEL_CODES
    ) == ["LADY_GARM"]


def test_blank_olevel_cells_use_explicit_source_rules_without_leaking_exceptions():
    overrides_path = PARSER_DIR / "jamb" / "brochure_subject_overrides.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8"))
    programmes = {
        name: {"institutions": [], "olevel_requirement": None}
        for name in (
            "German",
            "Marine Science and Technology",
            "Data Science",
            "Plant Breeding and Seed Technology",
            "Technology Education",
            "Robotics (Artificial Intelligence)",
        )
    }

    apply_brochure_subject_overrides(programmes, overrides)

    assert "French" in programmes["German"]["olevel_requirement"]
    assert "FUTA" in [
        waiver["institution"]
        for waiver in programmes["Marine Science and Technology"]["institution_waivers"]
    ]
    assert programmes["Marine Science and Technology"]["olevel_requirement"] is None
    assert "WIGWE" in [
        waiver["institution"]
        for waiver in programmes["Data Science"]["institution_waivers"]
    ]
    assert programmes["Data Science"]["olevel_requirement"] == (
        "Five (5) SSC credit passes to include English Language, Mathematics "
        "and at least three (3) subjects from Physics, Statistics, Chemistry, "
        "Further Mathematics, Economics and Geography."
    )
    assert "NDU" in [
        waiver["institution"]
        for waiver in programmes["Plant Breeding and Seed Technology"]["institution_waivers"]
    ]
    assert programmes["Plant Breeding and Seed Technology"]["olevel_requirement"] is None
    assert "ILORIN" in [
        waiver["institution"]
        for waiver in programmes["Technology Education"]["institution_waivers"]
    ]
    assert programmes["Technology Education"]["olevel_requirement"] is None
    assert "WIGWE" in [
        waiver["institution"]
        for waiver in programmes["Robotics (Artificial Intelligence)"]["institution_waivers"]
    ]
    assert programmes["Robotics (Artificial Intelligence)"]["olevel_requirement"] is None


def test_human_biology_utme_relevant_pool_uses_its_explicit_official_subject_list():
    overrides_path = PARSER_DIR / "jamb" / "brochure_subject_overrides.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8"))
    programmes = {
        "HUMAN BIOLOGY": {
            "institutions": ["ABUAD"],
            "utme_subjects": "three (3) relevant Science subject. Biology, Chemistry and Physics or Mathematics.",
        }
    }

    apply_brochure_subject_overrides(programmes, overrides)
    parsed = parser.parse_utme(programmes["HUMAN BIOLOGY"]["utme_subjects"])

    assert parsed == [
        ("required", "BIO"),
        ("required", "CHEM"),
        ("one_of", 1, ["MATH", "PHY"]),
    ]


def test_mixed_school_subject_evidence_is_split_by_exam_layer():
    overrides_path = PARSER_DIR / "jamb" / "brochure_subject_overrides.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8"))

    for programme_name, institution, expected_types in (
        ("Marine Science and Technology", "FUTA", {"olevel", "utme"}),
        ("Information and Media Technology", "MINNA", {"olevel", "utme"}),
    ):
        entries = [
            row
            for row in overrides[programme_name]["add_institution_waivers"]
            if row["institution"] == institution
        ]
        parsed = [parse_local_exception(row["note"]) for row in entries]

        assert len(entries) == 2
        assert {row["exam_type"] for row in parsed} == expected_types
        assert all(row["status"] == "parsed" for row in parsed)

    futa_olevel = next(
        parse_local_exception(row["note"])
        for row in overrides["Marine Science and Technology"]["add_institution_waivers"]
        if row["institution"] == "FUTA" and "O'Level" in row["note"]
    )
    assert futa_olevel["rule_scope"] == "full"
    assert futa_olevel["min_required"] == 5

    kasu_olevel = next(
        parse_local_exception(row["note"])
        for row in overrides["Building Technology"]["add_institution_waivers"]
        if row["institution"] == "KASU" and "O'Level" in row["note"]
    )
    assert kasu_olevel["status"] == "parsed"
    assert kasu_olevel["rule_scope"] == "full"
    assert kasu_olevel["min_required"] == 5
    assert {"ENG", "MATH", "PHY", "CHEM"} <= {
        part[1] for part in kasu_olevel["parts"] if part[0] == "required"
    }
    alternatives = next(part for part in kasu_olevel["parts"] if part[0] == "one_of")
    assert alternatives[1] == 1
    assert {
        "ART", "GEO", "WWK", "BIO", "ECON", "TD", "FMATH", "BLD",
        "BRICK", "CONC", "WALL_FIN", "JOIN", "CARP", "DEC_PAINT",
        "LINING", "SIGN_DES", "WALL_HANG", "COLOR_GLAZE", "CERAM",
        "GRAPH_DES", "GRAPH_PRINT", "ELEC",
    } <= set(alternatives[2])


def test_named_subject_labels_do_not_expand_to_their_parent_category():
    assert parser.category_codes("Fine Art", parser.OLEVEL_CODES) is None
    assert parser.category_codes("Science subjects", parser.OLEVEL_CODES)


def test_relevant_suitable_and_appropriate_are_not_inferred_from_the_other_exam_layer():
    for qualifier in ("relevant", "suitable", "appropriate"):
        text = (
            "Five (5) SSC credit passes in English Language, Arabic and "
            f"three (3) other {qualifier} subjects."
        )
        assert parser.parse_olevel(text) is None
        assert parser.parse_olevel(text, context_codes={"ARA", "ART", "GOV"}) is None
        assert parser.parse_utme(
            f"English Language, Arabic and three other {qualifier} subjects"
        ) is None


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


def test_fixed_credit_minimum_with_named_inclusions_allows_unspecified_remainder():
    text = (
        "Five (5) SSC credits to include English Language, Mathematics, "
        "Physics and Chemistry"
    )
    parsed = parser.parse_olevel(text)

    assert parsed is not None
    assert parsed[0] == 5
    assert parsed[1][:4] == [
        ("required", "ENG"),
        ("required", "MATH"),
        ("required", "PHY"),
        ("required", "CHEM"),
    ]
    assert parsed[1][4][0:2] == ("one_of", 1)
    assert set(parsed[1][4][2]) == set(parser.OLEVEL_CODES) - {"ENG", "MATH", "PHY", "CHEM"}
    assert parser.olevel_parts_are_matchable(text, parsed)


def test_including_with_multiple_unstated_credits_stays_nonmatchable():
    text = (
        "Five (5) SSC credit passes including English Language, Mathematics "
        "and Economics."
    )
    parsed = parser.parse_olevel(text)

    assert parsed is not None
    assert parsed[0] == 5
    assert parsed[1][:3] == [
        ("required", "ENG"),
        ("required", "MATH"),
        ("required", "ECON"),
    ]
    assert parsed[1][3][0:2] == ("one_of", 2)
    assert set(parsed[1][3][2]) == set(parser.OLEVEL_CODES) - {"ENG", "MATH", "ECON"}
    assert not parser.olevel_parts_are_matchable(text, parsed)


def test_category_qualified_subject_choice_resolves_only_the_listed_options():
    text = (
        "Five (5) SSC credit passes in English Language, Physics, Chemistry, "
        "Mathematics and any other Science subject from Further Mathematics "
        "and Biology or Agricultural Science."
    )
    parsed = parser.parse_olevel(text)

    assert parsed == (
        5,
        [
            ("required", "ENG"),
            ("required", "PHY"),
            ("required", "CHEM"),
            ("required", "MATH"),
            ("one_of", 1, ["AGR", "BIO", "FMATH"]),
        ],
    )
    assert parser.olevel_parts_are_matchable(text, parsed)


def test_olevel_override_json_has_no_duplicate_keys():
    overrides_path = PARSER_DIR / "jamb" / "brochure_subject_overrides.json"

    def unique_keys(pairs):
        result = {}
        for key, value in pairs:
            assert key not in result, f"duplicate override key: {key}"
            result[key] = value
        return result

    json.loads(
        overrides_path.read_text(encoding="utf-8"),
        object_pairs_hook=unique_keys,
    )


def test_explicit_olevel_as_in_reference_resolves_to_named_programme():
    programmes = {
        "Political Science": {
            "olevel_requirement": (
                "Five (5) SSC credit passes in English Language, Mathematics, "
                "Physics, Chemistry and Biology"
            ),
            "utme_subjects": "",
        },
        "Political Science and Diplomacy": {
            "olevel_requirement": "as in Political Science",
            "utme_subjects": "",
        },
    }

    rules = resolve_contextual_rules(programmes)

    assert rules["Political Science and Diplomacy"]["olevel"] == rules[
        "Political Science"
    ]["olevel"]


def test_relevant_olevel_pool_is_not_inferred_from_programme_utme_pool():
    programmes = {
        "Arabic": {
            "olevel_requirement": (
                "Five (5) SSC credit passes in English Language, Arabic and "
                "three (3) other relevant subjects."
            ),
            "utme_subjects": "Arabic and two other Arts or Social Science subjects",
        }
    }

    rules = resolve_contextual_rules(programmes)

    assert rules["Arabic"]["utme"] is not None
    assert rules["Arabic"]["olevel"] is None


def test_olevel_at_least_count_from_named_list_is_executable_but_pass_is_not():
    text = (
        "Five (5) SSC credit passes to include English Language, Mathematics "
        "and at least three (3) subjects from Physics, Statistics, Chemistry, "
        "Further Mathematics, Economics and Geography."
    )
    parsed = parser.parse_olevel(text)

    assert parsed == (
        5,
        [
            ("required", "ENG"),
            ("required", "MATH"),
            ("one_of", 3, ["CHEM", "ECON", "FMATH", "GEO", "PHY", "STAT"]),
        ],
    )
    assert parser.olevel_parts_are_matchable(text, parsed)
    assert parser.parse_olevel(
        "Five credits including English and Mathematics and at least a pass in Physics"
    ) is None
