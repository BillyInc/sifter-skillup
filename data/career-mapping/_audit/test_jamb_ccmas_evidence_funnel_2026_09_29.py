import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_jamb_ccmas_evidence_funnel_2026_09_29 as funnel  # noqa: E402


def test_exact_detail_group_can_reuse_only_detail_not_schedule():
    discovery = {
        "ccmas_course_rows": [
            {
                "record_id": "a",
                "source_file": "engineering.json",
                "discipline": "Engineering",
                "programme": "Civil Engineering",
                "course_ordinal": 1,
                "code": "CVE 101",
                "title": "Intro",
                "content_summary": "Same block",
                "learning_outcomes": ["Explain it"],
                "source_url": "u",
                "source_locator": "p. 1",
            },
            {
                "record_id": "b",
                "source_file": "engineering.json",
                "discipline": "Engineering",
                "programme": "Structural Engineering",
                "course_ordinal": 2,
                "code": "CVE 101",
                "title": "Intro",
                "content_summary": "Same block",
                "learning_outcomes": ["Explain it"],
                "source_url": "u",
                "source_locator": "p. 1",
            },
        ]
    }
    text = {
        "ccmas_packages": [
            {"source_file": "engineering.json", "programme": "Civil Engineering", "courses": [{"record_id": "a", "local_text_available": True, "title_code_cohit_pages": [1], "code_hit_count_in_local_extract": 1}]},
            {"source_file": "engineering.json", "programme": "Structural Engineering", "courses": [{"record_id": "b", "local_text_available": True, "title_code_cohit_pages": [1], "code_hit_count_in_local_extract": 1}]},
        ]
    }
    rows, groups, _ = funnel.build_ccmas_queue(discovery, text)
    assert len(groups) == 1
    assert all(row["source_review_reuse_allowed"] for row in rows)
    assert {row["group_id"] for row in rows} == {groups[0]["group_id"]}


def test_missing_extract_and_missing_metadata_are_exceptions():
    discovery = {
        "ccmas_course_rows": [{
            "record_id": "a", "source_file": "law.json", "programme": "Law", "code": "LAW 101", "title": "Foundations",
            "content_summary": "", "learning_outcomes": [], "source_url": None, "source_locator": None,
        }],
        "jamb_identities": [{"jamb_name": "Example Science", "source_occurrences": [{"occurrence_id": "j1", "jamb_name": "Example Science", "verified_against_pdf": False, "pdf_table_locator": None, "institutions": []}], "findings": ["x"]}],
    }
    text = {"ccmas_packages": [{"source_file": "law.json", "programme": "Law", "courses": [{"record_id": "a", "local_text_available": False, "title_code_cohit_pages": [], "code_hit_count_in_local_extract": 0}]}], "jamb_occurrences": [{"occurrence_id": "j1", "exact_title_candidate_hit_count": 0}]}
    rows, _, counts = funnel.build_ccmas_queue(discovery, text)
    jamb, jamb_counts = funnel.build_jamb_queue(discovery, text)
    assert rows[0]["source_review_state"] == "exception_queue"
    assert "local_extract_missing" in rows[0]["structural_reasons"]
    assert counts["reason:empty_outcomes"] == 1
    assert jamb[0]["source_review_state"] == "exception_queue"
    assert jamb_counts["reason:missing_explicit_pdf_metadata"] == 1
