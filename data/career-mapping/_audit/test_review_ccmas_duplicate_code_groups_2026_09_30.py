from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("review_ccmas_duplicate_code_groups_2026_09_30.py")
SPEC = importlib.util.spec_from_file_location("ccmas_duplicate_review", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_duplicate_course_record_patch_is_guarded_and_repeatable() -> None:
    course = {
        "code": "IRM 202",
        "title": "Information System Analysis, Design, Eval",
        "units": 2,
        "status": "C",
        "lh": 30,
        "ph": None,
        "content_summary": "old copied summary",
        "skills_learned": ["old copied outcome"],
    }
    repair = {
        **MODULE.IRM401_REPAIR,
        "expected_preimage_hash": MODULE.course_preimage(course),
        "fields_to_set": {
            "code": MODULE.IRM401_REPAIR["new_code"],
            "title": MODULE.IRM401_REPAIR["new_title"],
            "content_summary": MODULE.IRM401_REPAIR["source_content"],
            "skills_learned": MODULE.IRM401_REPAIR["source_outcomes"],
        },
    }
    doc = {"programmes": [{"name": repair["programme"], "courses": [course]}]}
    assert MODULE.apply_prepared_repair(doc, repair) is True
    assert MODULE.apply_prepared_repair(doc, repair) is False
    assert course["code"] == "IRM 401"
    assert course["title"] == "Information System Analysis, Design, and Evaluation"
    assert course["units"] == 2 and course["lh"] == 30  # retain detail/table conflict
    assert course["skills_learned"] == MODULE.IRM401_REPAIR["source_outcomes"]


def test_patch_refuses_a_row_changed_by_parallel_reconciliation() -> None:
    course = {
        "code": "IRM 202",
        "title": "Information System Analysis, Design, Eval",
        "units": 2,
        "status": "C",
        "lh": 30,
        "ph": None,
        "content_summary": "updated by reconciliation",
        "skills_learned": ["updated outcome"],
    }
    repair = {
        **MODULE.IRM401_REPAIR,
        "expected_preimage_hash": "stale-preimage",
        "fields_to_set": {"code": "IRM 401"},
    }
    doc = {"programmes": [{"name": repair["programme"], "courses": [course]}]}
    try:
        MODULE.apply_prepared_repair(doc, repair)
    except RuntimeError as error:
        assert "changed since checkpoint" in str(error)
    else:
        raise AssertionError("stale repair unexpectedly applied")
    assert course["code"] == "IRM 202"


def test_guarded_duplicate_removal_preserves_required_source_rows() -> None:
    wrong = {
        "code": "GET 399",
        "title": "SIWES I: Students Work 4 C 12 Weeks Experience Scheme",
        "units": None,
        "status": None,
        "lh": None,
        "ph": None,
        "content_summary": "copied SIWES II detail",
        "skills_learned": ["copied outcome"],
    }
    get299 = {"code": "GET 299", "title": "SIWES I: Students Work 3 C 9 Weeks Experience Scheme"}
    get399 = {"code": "GET 399", "title": "SIWES II: Students Work 4 C 12 Weeks Experience Scheme"}
    repair = {
        **MODULE.GET399_FALSE_DUPLICATE,
        "expected_preimage_hash": MODULE.course_preimage(wrong),
        "required_sibling_records": ["GET 299 SIWES I", "GET 399 SIWES II"],
    }
    doc = {"programmes": [{"name": repair["programme"], "courses": [wrong, get299, get399]}]}
    assert MODULE.apply_prepared_repair(doc, repair) is True
    assert doc["programmes"][0]["courses"] == [get299, get399]
    assert MODULE.apply_prepared_repair(doc, repair) is False


def test_horticulture_practical_row_is_rekeyed_and_unsupported_detail_cleared() -> None:
    course = {
        "code": "HLM 303",
        "title": "Farm Mechanization and Workshop Practices (Practical)",
        "units": 1,
        "status": "C",
        "lh": None,
        "ph": 45,
        "content_summary": "wrongly attached HLM303 practical text",
        "skills_learned": ["wrongly attached outcome"],
    }
    repair = {
        **MODULE.HLM309_REPAIR,
        "expected_preimage_hash": MODULE.course_preimage(course),
    }
    doc = {"programmes": [{"name": repair["programme"], "courses": [course]}]}
    assert MODULE.apply_prepared_repair(doc, repair) is True
    assert course["code"] == "HLM 309"
    assert course["title"] == "Farm Mechanization & Workshop Practices"
    assert course["units"] == 1 and course["ph"] == 45
    assert course["content_summary"] == "" and course["skills_learned"] == []
    assert MODULE.apply_prepared_repair(doc, repair) is False


def test_three_saved_and_one_new_repeated_outcome_targets_are_classified() -> None:
    assert len(MODULE.REPEATED_OUTCOME_DISPOSITIONS) == 4
    assert MODULE.REPEATED_OUTCOME_DISPOSITIONS[("allied_health.json", "Dental Therapy", "DTH 521")]["classification"] == "source_authored_repetition_preserve"
    assert MODULE.REPEATED_OUTCOME_DISPOSITIONS[("basic_medical.json", "Human Anatomy", "ANA 341")]["classification"] == "source_authored_repetition_preserve"
    assert MODULE.REPEATED_OUTCOME_DISPOSITIONS[("education.json", "Music", "EDU 403")]["classification"] == "source_published_numbering_anomaly_preserve_pending_authoritative_erratum"
    assert MODULE.REPEATED_OUTCOME_DISPOSITIONS[("arts.json", "Folklore Studies", "FLS 202")]["classification"] == "newly_detected_source_authored_repetition_preserve"


def test_latest_residual_checkpoint_allows_resolved_groups_to_drop() -> None:
    saved = {
        "current_duplicate_code_groups": [
            {"key": "arts.json::Music::MUS 101"},
            {"key": "sciences.json::Physics::PHY 102"},
        ]
    }
    current = [{"source_file": "sciences.json", "programme": "Physics", "code": "PHY 102"}]
    MODULE.validate_groups_have_saved_preimages(current, saved, "checkpoint_009.json")


def test_latest_residual_checkpoint_rejects_new_uncheckpointed_group() -> None:
    saved = {"current_duplicate_code_groups": [{"key": "arts.json::Music::MUS 101"}]}
    current = [{"source_file": "sciences.json", "programme": "Physics", "code": "PHY 102"}]
    try:
        MODULE.validate_groups_have_saved_preimages(current, saved, "checkpoint_009.json")
    except RuntimeError as error:
        assert "lack saved preimages" in str(error)
    else:
        raise AssertionError("new duplicate group passed without a saved preimage")


def test_duplicate_identity_review_requires_detail_evidence_per_member() -> None:
    members = [
        {"source_detail_occurrences": [{"pdf_page_start": 12}]},
        {"source_detail_occurrences": [{"pdf_page_start": 30}]},
    ]
    assert MODULE.group_context_classification(members) == (
        "all_member_titles_have_source_detail_blocks; preserve_distinct_source_occurrences_pending_context"
    )
    members[1]["source_detail_occurrences"] = []
    assert MODULE.group_context_classification(members) == (
        "source_table_match_without_detail_block_for_each_title; preserve_pending_offering_context"
    )
