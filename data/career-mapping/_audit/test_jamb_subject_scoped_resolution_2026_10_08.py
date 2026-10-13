from __future__ import annotations

import sys
import json
from pathlib import Path
import pytest


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))

import build_jamb_subject_scoped_resolution_2026_10_08 as audit  # noqa: E402


@pytest.fixture(autouse=True)
def clear_source_page_caches():
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    audit._official_page_lookup.cache_clear()
    yield
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    audit._official_page_lookup.cache_clear()


def test_exact_official_note_requires_programme_and_institution_on_same_page(monkeypatch):
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    monkeypatch.setattr(
        audit,
        "_official_text_pages",
        lambda: ({
            "source_file": "Sciences.pdf",
            "pdf_page": 27,
            "text": (
                "BIOLOGY  AAUA  requires five (5) O Level credit passes "
                "to include English Language, Biology, Chemistry, Mathematics and Physics."
            ),
            "normalized_text": audit._normalize_evidence_text(
                "BIOLOGY  AAUA  requires five (5) O Level credit passes "
                "to include English Language, Biology, Chemistry, Mathematics and Physics."
            ),
        },),
    )
    monkeypatch.setattr(
        audit, "_source_page_index", lambda: {("BIOLOGY", "AAUA"): (("Sciences.pdf", 27),)}
    )

    note = (
        "requires five (5) 'O' Level credit passes to include English Language, "
        "Biology, Chemistry, Mathematics and Physics."
    )
    locators = audit._exact_note_page_locators("BIOLOGY", note, "AAUA", frozenset({"BIOLOGY"}))

    assert len(locators) == 1
    assert locators[0]["pdf_page"] == 27
    assert locators[0]["source_url"].endswith("brochure-degree-sciences.pdf")


def test_exact_official_note_does_not_link_when_institution_is_absent(monkeypatch):
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    page_text = (
        "BIOLOGY  requires five (5) O Level credit passes to include English Language, "
        "Biology, Chemistry, Mathematics and Physics."
    )
    monkeypatch.setattr(
        audit,
        "_official_text_pages",
        lambda: ({
            "source_file": "Sciences.pdf",
            "pdf_page": 27,
            "text": page_text,
            "normalized_text": audit._normalize_evidence_text(page_text),
        },),
    )
    monkeypatch.setattr(
        audit, "_source_page_index", lambda: {("BIOLOGY", "AAUA"): (("Sciences.pdf", 27),)}
    )

    note = (
        "requires five (5) 'O' Level credit passes to include English Language, "
        "Biology, Chemistry, Mathematics and Physics."
    )
    assert audit._exact_note_page_locators("BIOLOGY", note, "AAUA", frozenset({"BIOLOGY"})) == []


def test_official_brochure_text_filename_maps_to_current_ibass_pdf_url():
    assert audit._official_pdf_url("Engineering _ Environmental _ Technology.pdf") == (
        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"
    )


def test_short_waiver_credit_clause_cannot_replace_national_five_credit_total():
    assert audit._declared_olevel_credit_total(
        "Five (5) SSC credit passes to include English Language and any relevant subjects."
    ) == 5
    assert audit._declared_olevel_credit_total(
        "Two (2) 'O' Level credit passes only in Social Sciences subjects."
    ) == 2


def test_exact_waiver_candidate_keeps_offering_scope_and_source_locator(monkeypatch, tmp_path):
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    note = (
        "AAUA requires five (5) 'O' Level credit passes to include English Language, "
        "Biology, Chemistry, Mathematics and Physics."
    )
    page_text = f"BIOLOGY AAUA {note}"
    monkeypatch.setattr(
        audit,
        "_official_text_pages",
        lambda: ({
            "source_file": "Sciences.pdf",
            "pdf_page": 86,
            "text": page_text,
            "normalized_text": audit._normalize_evidence_text(page_text),
        },),
    )
    monkeypatch.setattr(
        audit, "_source_page_index", lambda: {("BIOLOGY", "AAUA"): (("Sciences.pdf", 86),)}
    )
    jamb_dir = tmp_path / "jamb"
    jamb_dir.mkdir()
    (jamb_dir / "fixture_offerings.json").write_text(
        json.dumps({
            "programmes": [{
                "jamb_name": "BIOLOGY",
                "institution_waivers": [{"institutions": ["AAUA"], "note": note}],
            }]
        }),
        encoding="utf-8",
    )
    monkeypatch.setattr(audit, "CAREER", tmp_path)

    candidates = audit._exact_scoped_waiver_candidates(
        [{
            "jamb_programme": "BIOLOGY",
            "exam_type": "olevel",
            "source_text": "Five (5) SSC credit passes with relevant subjects.",
        }],
        {"BIOLOGY"},
    )

    candidate = candidates[("BIOLOGY", "olevel")][0]
    assert candidate["institution_codes"] == ["AAUA"]
    assert candidate["national_promotion"] is False
    assert candidate["parsed_rule"]["minimumRequired"] == 5
    assert candidate["source_locator"]["pdf_page"] == 86


def test_two_credit_waiver_is_not_promoted_over_five_credit_national_rule(monkeypatch, tmp_path):
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    note = "CUAB accepts two (2) 'O' Level credit passes only in Social Sciences subjects."
    page_text = f"CRIMINOLOGY AND SECURITY STUDIES CUAB {note}"
    monkeypatch.setattr(
        audit,
        "_official_text_pages",
        lambda: ({
            "source_file": "Social Management Science.pdf",
            "pdf_page": 42,
            "text": page_text,
            "normalized_text": audit._normalize_evidence_text(page_text),
        },),
    )
    monkeypatch.setattr(
        audit,
        "_source_page_index",
        lambda: {("Criminology and Security Studies", "CUAB"): (("Social Management Science.pdf", 42),)},
    )
    jamb_dir = tmp_path / "jamb"
    jamb_dir.mkdir()
    (jamb_dir / "fixture_offerings.json").write_text(
        json.dumps({
            "programmes": [{
                "jamb_name": "Criminology and Security Studies",
                "institution_waivers": [{"institutions": ["CUAB"], "note": note}],
            }]
        }),
        encoding="utf-8",
    )
    monkeypatch.setattr(audit, "CAREER", tmp_path)

    candidates = audit._exact_scoped_waiver_candidates(
        [{
            "jamb_programme": "Criminology and Security Studies",
            "exam_type": "olevel",
            "source_text": "Five (5) SSC credit passes at one sitting.",
        }],
        {"Criminology and Security Studies"},
    )

    assert candidates == {}


def test_exact_olevel_waiver_with_utme_heading_is_not_misclassified(monkeypatch, tmp_path):
    audit._exact_note_page_locators.cache_clear()
    audit._source_page_index.cache_clear()
    note = (
        "UTME (i) COVENANT requires five (5) 'O' Level credit passes in English Language, "
        "Mathematics, Economics, Government or History and one Science Subject"
    )
    page_text = f"POLICY AND STRATEGIC STUDIES COVENANT {note}"
    monkeypatch.setattr(
        audit,
        "_official_text_pages",
        lambda: ({
            "source_file": "Social Management Science.pdf",
            "pdf_page": 87,
            "text": page_text,
            "normalized_text": audit._normalize_evidence_text(page_text),
        },),
    )
    monkeypatch.setattr(
        audit,
        "_source_page_index",
        lambda: {("Policy and Strategic Studies", "COVENANT"): (("Social Management Science.pdf", 87),)},
    )
    jamb_dir = tmp_path / "jamb"
    jamb_dir.mkdir()
    (jamb_dir / "fixture_offerings.json").write_text(
        json.dumps({
            "programmes": [{
                "jamb_name": "Policy and Strategic Studies",
                "institution_waivers": [{"institutions": ["COVENANT"], "note": note}],
            }]
        }),
        encoding="utf-8",
    )
    monkeypatch.setattr(audit, "CAREER", tmp_path)

    candidates = audit._exact_scoped_waiver_candidates(
        [{
            "jamb_programme": "Policy and Strategic Studies",
            "exam_type": "olevel",
            "source_text": "Five (5) SSC credit passes to include English Language.",
        }],
        {"Policy and Strategic Studies"},
    )

    candidate = candidates[("Policy and Strategic Studies", "olevel")][0]
    assert candidate["institution_codes"] == ["COVENANT"]
    assert candidate["parsed_rule"]["minimumRequired"] == 5


def test_exact_waiver_cell_link_can_supply_source_locator_without_fuzzy_page_match(
    monkeypatch, tmp_path
):
    jamb_dir = tmp_path / "jamb"
    jamb_dir.mkdir()
    (jamb_dir / "fixture_offerings.json").write_text(
        json.dumps({"programmes": []}), encoding="utf-8"
    )
    monkeypatch.setattr(audit, "CAREER", tmp_path)
    note = (
        "UTME (i) COVENANT requires five (5) 'O' Level credit passes in English Language, "
        "Mathematics, Economics, Government or History and one Science Subject"
    )
    linked_evidence = [{
        "jamb_programme": "Policy and Strategic Studies",
        "exam_type": "olevel",
        "institution_code": "COVENANT",
        "raw_note": note,
        "source_link_status": "exact_requirement_text_and_institution_scope",
        "source_rule_scope_from_note": "full",
        "source_url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
        "source_accessed_date": "2026-10-08",
        "source_locators": [{
            "source_file": "Social Management Science.pdf",
            "pdf_page": 73,
            "table_row": 2,
            "source_url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
        }],
    }]

    candidates = audit._exact_scoped_waiver_candidates(
        [{
            "jamb_programme": "Policy and Strategic Studies",
            "exam_type": "olevel",
            "source_text": "Five (5) SSC credit passes to include English Language Government and a pass in Mathematics O Level.",
        }],
        {"Policy and Strategic Studies"},
        linked_evidence,
    )

    candidate = candidates[("Policy and Strategic Studies", "olevel")][0]
    assert candidate["institution_codes"] == ["COVENANT"]
    assert candidate["source_locator"]["pdf_page"] == 73
    assert candidate["parsed_rule"]["parts"][-1][0] == "one_of"


def test_distinct_institution_rules_are_not_misclassified_as_conflicts():
    candidates = [
        {"institution_codes": ["AAU", "ABU"], "parsed_rule": {"min": 5}},
        {"institution_codes": ["UNN"], "parsed_rule": {"min": 6}},
    ]

    status = audit._scope_conflicting_institutions(candidates)

    assert status == "scoped_exact"
    assert all("conflicting_institution_codes" not in item for item in candidates)


def test_only_overlapping_institutions_are_marked_conflicting():
    candidates = [
        {"institution_codes": ["AAU", "ABU"], "parsed_rule": {"min": 5}},
        {"institution_codes": ["ABU", "UNN"], "parsed_rule": {"min": 6}},
    ]

    status = audit._scope_conflicting_institutions(candidates)

    assert status == "scoped_conflict"
    assert candidates[0]["conflicting_institution_codes"] == ["ABU"]
    assert candidates[1]["conflicting_institution_codes"] == ["ABU"]


def test_exact_ibass_cell_can_use_bounded_local_parser_fallback():
    row = {
        "jamb_programme": "French",
        "exam_type": "olevel",
        "source_text": "Five (5) SSC credit passes.",
        "offering_institutions": ["ABU"],
    }
    source_row = {"source_url": "https://ibass.jamb.gov.ng/brochure.pdf"}
    variant = {
        "source_variant": {
            "status": "exact",
            "text": "Five (5) SSC credit passes including French and English Language plus one other Arts subject.",
            "source": {
                "source_file": "Arts & Humanities.pdf",
                "pdf_page": 46,
                "table_row": 19,
                "course_cell": "FRENCH ABU",
            },
        }
    }

    candidate, reason = audit._safe_exact_variant(
        row, source_row, variant, {"French"}, {"ABU"}
    )

    assert reason is None
    assert candidate["parser_basis"] == "strict_full_local_exception_fallback"
    assert candidate["institution_codes"] == ["ABU"]
    assert candidate["parsed_rule"]["creditMinimum"] == 5
    assert [part[0] for part in candidate["parsed_rule"]["parts"]] == [
        "required", "required", "one_of"
    ]


def test_exact_ibass_cell_represents_unqualified_including_remainder_as_open_pool():
    row = {
        "jamb_programme": "Library Science",
        "exam_type": "olevel",
        "source_text": "Five (5) SSC credit passes.",
        "offering_institutions": ["ABU"],
    }
    variant = {
        "source_variant": {
            "status": "exact",
            "text": "Five (5) SSC credit passes including English Language and Mathematics.",
            "source": {
                "source_file": "Sciences.pdf",
                "pdf_page": 99,
                "table_row": 19,
                "course_cell": "LIBRARY SCIENCE ABU",
            },
        }
    }

    candidate, reason = audit._safe_exact_variant(
        row, {"source_url": "https://ibass.jamb.gov.ng/brochure.pdf"},
        variant, {"Library Science"}, {"ABU"}
    )

    assert reason is None
    assert candidate["institution_codes"] == ["ABU"]
    assert candidate["parsed_rule"]["creditMinimum"] == 5
    assert candidate["parsed_rule"]["parts"][-1][0] == "one_of"
    assert len(candidate["parsed_rule"]["parts"][-1][2]) >= 20


def test_exact_ibass_cell_does_not_open_relevant_including_remainder():
    row = {
        "jamb_programme": "Library Science",
        "exam_type": "olevel",
        "source_text": "Five (5) SSC credit passes.",
        "offering_institutions": ["ABU"],
    }
    variant = {
        "source_variant": {
            "status": "exact",
            "text": "Five (5) SSC credit passes including English Language and three other relevant subjects.",
            "source": {
                "source_file": "Sciences.pdf",
                "pdf_page": 99,
                "table_row": 19,
                "course_cell": "LIBRARY SCIENCE ABU",
            },
        }
    }

    candidate, reason = audit._safe_exact_variant(
        row, {"source_url": "https://ibass.jamb.gov.ng/brochure.pdf"},
        variant, {"Library Science"}, {"ABU"}
    )

    assert candidate is None
    assert reason in {
        "exact_cell_not_executable",
        "exact_cell_rule_not_fully_executable",
    }
