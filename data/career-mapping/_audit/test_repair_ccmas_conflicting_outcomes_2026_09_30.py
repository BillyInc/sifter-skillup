from repair_ccmas_conflicting_outcomes_2026_09_30 import (
    classify_row,
    parse_outcomes,
    title_is_bounded_match,
)


def test_parse_outcomes_requires_numbered_items():
    assert parse_outcomes("At the end: 1. identify terms; 2. apply methods.") == [
        "identify terms",
        "apply methods.",
    ]
    assert parse_outcomes("Course content only") == []


def test_title_guard_rejects_parser_spill():
    assert title_is_bounded_match("Field School II", "Field School II (14 days)")
    assert not title_is_bounded_match(
        "Customary Law",
        ". Law Reform. Codification and adaptation of Customary Law; PPL 501 Company Law I",
    )


def test_classification_requires_one_bounded_outcome_candidate():
    row = {"title": "Research Methods"}
    candidate = {
        "course": {"course_code": "RES 401"},
        "candidate": {
            "course_code": "RES 401",
            "title_candidate": "Research Methods",
            "outcomes_text": "1. identify methods.",
        },
        "course_code_exact": True,
        "title_strong": True,
    }
    proposal = {
        "programme_context_state": "programme_page_range_match",
        "ranked_candidates": [candidate],
    }
    classification, selected, _ = classify_row(row, proposal)
    assert classification == "repairable_unique_candidate"
    assert selected == candidate


def test_empty_bounded_source_block_is_not_filled():
    row = {"title": "Research Project"}
    candidate = {
        "candidate": {
            "course_code": "RES 499",
            "title_candidate": "Research Project",
            "outcomes_text": None,
        },
        "course_code_exact": True,
    }
    proposal = {
        "programme_context_state": "programme_page_range_match",
        "ranked_candidates": [candidate],
    }
    classification, selected, _ = classify_row(row, proposal)
    assert classification == "source_authored_absence"
    assert selected is None
