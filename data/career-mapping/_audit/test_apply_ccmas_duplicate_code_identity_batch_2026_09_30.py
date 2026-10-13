from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("apply_ccmas_duplicate_code_identity_batch_2026_09_30.py")
SPEC = importlib.util.spec_from_file_location("ccmas_duplicate_identity_batch", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_faa_digital_art_rekey_preserves_summary_and_outcomes() -> None:
    correction = MODULE.CORRECTIONS[0]
    record = {
        "code": "FAA 231",
        "title": "Introduction to Digital Art and Design",
        "units": None,
        "status": "C",
        "lh": None,
        "ph": None,
        "content_summary": "newly PDF-repaired summary",
        "skills_learned": ["newly PDF-repaired outcome"],
    }
    sibling = {"code": "FAA 231", "title": "Introduction to Two-Dimensional Art and Design"}
    document = {"programmes": [{"name": correction["programme"], "courses": [record, sibling]}]}

    assert MODULE.apply_correction(document, correction) == "applied"
    assert record["code"] == "FAA 241"
    assert (record["units"], record["status"], record["lh"], record["ph"]) == (2, "C", None, 90)
    assert record["content_summary"] == "newly PDF-repaired summary"
    assert record["skills_learned"] == ["newly PDF-repaired outcome"]
    assert sibling["code"] == "FAA 231"
    assert MODULE.apply_correction(document, correction) == "already_applied"


def test_slt_communication_course_rekey_preserves_student_detail() -> None:
    correction = MODULE.CORRECTIONS[1]
    record = {
        "code": "SLT 513",
        "title": "Communication Skills and Ethics",
        "content_summary": "current repaired summary",
        "skills_learned": ["current repaired outcome"],
    }
    sibling = {"code": "SLT 513", "title": "Autism Spectrum Disorders"}
    document = {"programmes": [{"name": correction["programme"], "courses": [record, sibling]}]}

    assert MODULE.apply_correction(document, correction) == "applied"
    assert record["code"] == "PST 513"
    assert record["content_summary"] == "current repaired summary"
    assert record["skills_learned"] == ["current repaired outcome"]
    assert sibling["code"] == "SLT 513"


def test_guard_rejects_unexpected_duplicate_or_missing_target() -> None:
    correction = MODULE.CORRECTIONS[0]
    duplicate = {"code": "FAA 231", "title": correction["title"]}
    document = {"programmes": [{"name": correction["programme"], "courses": [duplicate, dict(duplicate)]}]}
    try:
        MODULE.apply_correction(document, correction)
    except RuntimeError as error:
        assert "Current-row guard failed" in str(error)
    else:
        raise AssertionError("ambiguous target was accepted")
