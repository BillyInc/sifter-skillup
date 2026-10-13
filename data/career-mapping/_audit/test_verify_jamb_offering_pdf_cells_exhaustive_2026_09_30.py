from pathlib import Path
import importlib.util


SCRIPT = Path(__file__).with_name("verify_jamb_offering_pdf_cells_exhaustive_2026_09_30.py")
SPEC = importlib.util.spec_from_file_location("jamb_pdf_cells", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


def test_awarder_cell_continues_across_page_and_stops_at_next_programme():
    pages = [
        ["Civil Law", "ABU", "OOU", "COURSE/DEGREE AWARDING INSTITUTIONS"],
        ["UNIZIK", "AAU", "Chemistry", "BENIN"],
    ]
    heading = {"page_index": 0, "line_index": 0, "end_line": 0}
    cell, page_numbers, stop_reason = MODULE.extract_cell(pages, heading, {"abu", "oou", "unizik", "aau", "benin"})
    assert cell == ["ABU", "OOU", "UNIZIK", "AAU"]
    assert page_numbers == [1, 2]
    assert stop_reason == "unrecognized_column_line"


def test_course_and_faculty_labels_are_not_treated_as_universities():
    institutions = {"arts", "geography", "planning", "lagos", "benin"}
    assert not MODULE.looks_like_institution_line("ARTS", institutions)
    assert not MODULE.looks_like_institution_line("Geography and Planning", institutions)
    assert MODULE.looks_like_institution_line("LAGOS", institutions)


def test_wrapped_university_name_is_recognized_only_as_adjacent_lines():
    pages = [["Programme X", "FED-OYE", "EKITI", "Next Course"]]
    heading = {"page_index": 0, "line_index": 0, "end_line": 0}
    cell, _, _ = MODULE.extract_cell(pages, heading, {"fedoyeekiti"})
    assert cell == ["FED-OYE", "EKITI"]


def test_awarder_cell_stops_at_next_known_programme_heading():
    pages = [["Programme X", "ABU", "Programme Y", "OOU"]]
    heading = {"page_index": 0, "line_index": 0, "end_line": 0}
    cell, _, stop_reason = MODULE.extract_cell(pages, heading, {"abu", "oou"}, {(0, 2)})
    assert cell == ["ABU"]
    assert stop_reason == "next_programme_heading"


def test_known_institution_ending_in_and_is_not_treated_as_a_conjunction():
    assert MODULE.looks_like_institution_line("CHRISLAND", {"chrisland"})


def test_section_label_is_not_counted_as_an_institution_token():
    tokens = ["ABU", "LAW"]
    expected = [token for token in tokens if MODULE.norm(token) not in MODULE.NON_INSTITUTION_TERMS]
    excluded = [token for token in tokens if MODULE.norm(token) in MODULE.NON_INSTITUTION_TERMS]
    assert expected == ["ABU"]
    assert excluded == ["LAW"]


def test_previous_checkpoint_rows_are_retained_as_append_only_run_history():
    prior = {
        "generated_on": "2026-09-30",
        "mode": "apply",
        "target_count": 85,
        "verified_count": 5,
        "applied_count": 5,
        "rows": [{"occurrence_id": "verified-example", "status": "verified"}],
    }
    history = MODULE.preserved_run_history(prior)
    assert len(history) == 1
    assert history[0]["rows"] == prior["rows"]
    assert history[0]["applied_count"] == 5


def test_pdf_awarder_lines_map_only_to_unique_existing_jamb_institution_codes():
    aliases = {"abu": {"ABU"}, "fedoyekiti": {"FED-OYE EKITI"}, "unknown": {"A", "B"}}
    codes, unresolved, excluded = MODULE.map_pdf_institution_lines(["ABU", "FED-OYE", "EKITI", "UNKNOWN"], aliases)
    assert codes == ["ABU", "FED-OYE EKITI"]
    assert unresolved == ["UNKNOWN"]
    assert excluded == []


def test_exact_occurrence_aliases_resolve_global_alias_collision_and_skip_option_notes():
    aliases = {"fedlafia": {"FED-LAFIA", "FEDERAL UNIVERSITY LAFIA"}, "uyo": {"UYO"}}
    codes, unresolved, excluded = MODULE.map_pdf_institution_lines(
        ["FED-LAFIA", "With options in:", "(i) Soil Science", "UYO"],
        aliases,
        ["FED-LAFIA", "UYO"],
    )
    assert codes == ["FED-LAFIA", "UYO"]
    assert unresolved == []
    assert excluded == ["With options in:", "(i) Soil Science"]


def test_heading_match_does_not_accept_a_name_inside_a_longer_bold_title():
    lines = [["HISTORY AND", "INTERNATIONAL", "RELATIONS", "LAGOS", "INTERNATIONAL", "RELATIONS", "ABU"]]
    bold = {0: {0, 1, 2, 4, 5}}
    catalogue = [{"name": "History and International Relations"}, {"name": "International Relations"}]

    headings = MODULE.all_heading_positions(lines, catalogue, bold)

    assert [(h["name"], h["line_index"]) for h in headings] == [
        ("History and International Relations", 0),
        ("International Relations", 4),
    ]


def test_page_index_finds_title_with_line_wrapping_and_split_initial_glyph():
    assert MODULE.text_contains_title("SOCIAL SCIENCES\nI NTERNATIONAL\nRELATIONS\nABU", {"internationalrelations"})


def test_repeated_heading_can_be_disambiguated_only_by_one_exact_roster_match():
    cells = [
        {"institution_codes_from_pdf": ["ABU", "OOU"], "unresolved_pdf_institution_lines": [], "cell_stop_reason": "next_programme_heading"},
        {"institution_codes_from_pdf": ["UNN"], "unresolved_pdf_institution_lines": [], "cell_stop_reason": "next_programme_heading"},
    ]
    assert MODULE.classify_candidate_cells(cells, ["ABU", "OOU"]) == "verified_unique_full_parsed_institution_cell"
    assert MODULE.classify_candidate_cells(cells, ["ABU"]) == "ambiguous_multiple_full_cell_candidates"


def test_single_complete_cell_with_different_roster_is_flagged_for_source_reconciliation():
    cell = {"institution_codes_from_pdf": ["ABU"], "unresolved_pdf_institution_lines": [], "cell_stop_reason": "next_programme_heading"}
    assert MODULE.classify_candidate_cells([cell], ["ABU", "OOU"]) == "verified_unique_pdf_cell_roster_reconciled"
