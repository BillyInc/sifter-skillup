"""Regression checks for the audit-only Physiotherapy CCMAS source checkpoint."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
CHECKPOINT = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_001.md"
INCREMENT_002 = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_002.md"
INCREMENT_006 = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_006.md"
INCREMENT_005 = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_005.md"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"

FOREIGN_CONTEXT_ROWS = {
    ("PST 201", "Rehabilitation Physics/Biophysics"),
    ("PST 202", "Introduction to Medical Rehabilitation"),
    ("PST 311", "Programming for Rehabilitation"),
    ("PST 313", "Introductory Pathology"),
    ("PST 201", "Rehabilitative Physics"),
    ("PST 202", "Introduction to Medical Rehabilitation"),
    ("PST 311", "Programming for Rehabilitation Professionals"),
    ("PST 313", "Pathology for Rehabilitation Professionals"),
    ("PST 411", "Research Methods in Medical Rehabilitation"),
}


def test_physio_package_count_and_foreign_context_rows_are_explicitly_audited() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    assert len(packages) == 1
    courses = packages[0]["courses"]
    assert len(courses) == 57
    assert sum((row["code"], row["title"]) in FOREIGN_CONTEXT_ROWS for row in courses) == 9
    assert len(courses) - 9 == 48


def test_checkpoint_preserves_audit_only_scope_and_open_detail_pass() -> None:
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert URL in text
    assert "source comparison in progress" in text
    assert "48 Physiotherapy-owned PST course rows" in text
    assert "nine local rows" in text
    assert "PST 511" in text and "PST 522" in text
    assert "No edits to `allied_health.json` or downstream mappings" in text
    assert "Do not count the package complete" in text


def test_reused_codes_are_not_treated_as_shared_course_outcome_authority() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    courses = package["courses"]
    grouped: dict[str, list[dict]] = {}
    for course in courses:
        grouped.setdefault(course["code"], []).append(course)
    assert [len(c.get("skills_learned", [])) for c in grouped["PST 311"]] == [5, 5, 11]
    assert [len(c.get("skills_learned", [])) for c in grouped["PST 313"]] == [6, 7, 6]
    assert [len(c.get("skills_learned", [])) for c in grouped["PST 411"]] == [7, 12]
    extractor = (ROOT / "_extract_skills.py").read_text(encoding="utf-8")
    assert "skills_by_code.setdefault(cur, [])" in extractor
    assert "norm(c[\"code\"])" in extractor


def test_increment_002_records_bounded_source_comparison_without_closing_package() -> None:
    text = INCREMENT_002.read_text(encoding="utf-8")
    assert URL in text
    assert "PST 511" in text and "PST 522" in text and "PST 516" in text
    assert "source-internal title conflict" in text
    assert "do **not** establish a full course-detail comparison" in text
    assert "No university curriculum was needed or used" in text


def test_confirmed_increment_002_course_detail_omissions_are_repaired_with_provenance() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {course["code"]: course for course in package["courses"] if course["code"] in {"PST 511", "PST 516", "PST 522"}}
    assert set(rows) == {"PST 511", "PST 516", "PST 522"}
    assert len(rows["PST 511"]["skills_learned"]) == 2
    assert "community reintegration" in rows["PST 511"]["content_summary"]
    assert len(rows["PST 522"]["skills_learned"]) == 5
    assert "critical appraisal" in rows["PST 522"]["content_summary"]
    assert "occupational-health physiotherapy" in rows["PST 516"]["content_summary"]
    assert "source-internal conflict" in rows["PST 516"]["source_conflict_note"]
    for row in rows.values():
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"


def test_confirmed_increment_003_course_detail_defects_are_repaired_and_conflicts_preserved() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {
        course["code"]: course
        for course in package["courses"]
        if course["code"] in {"PST 523", "PST 524", "PST 525", "PST 526"}
    }
    assert set(rows) == {"PST 523", "PST 524", "PST 525", "PST 526"}
    assert rows["PST 523"]["lh"] == 30
    assert len(rows["PST 523"]["skills_learned"]) == 4
    assert "Allied Health Sciences" not in " ".join(rows["PST 523"]["skills_learned"])
    assert "community-based and primary health-care services are organized" in rows["PST 523"]["skills_learned"][2]
    assert "malformed" in rows["PST 523"]["source_outcome_note"]
    assert rows["PST 524"]["content_summary"].endswith("cardiorespiratory disorders.")
    assert rows["PST 525"]["ph"] == 90
    assert len(rows["PST 525"]["skills_learned"]) == 4
    assert "Allied Health Sciences" not in " ".join(rows["PST 525"]["skills_learned"])
    assert "advice to caregivers" in rows["PST 525"]["content_summary"]
    assert rows["PST 526"]["ph"] is None
    assert len(rows["PST 526"]["skills_learned"]) == 5
    assert "600 Level" not in " ".join(rows["PST 526"]["skills_learned"])
    assert "PH 45" in rows["PST 526"]["source_conflict_note"]
    for row in rows.values():
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"


def test_confirmed_increment_004_course_detail_defects_are_repaired_and_provenanced() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {
        course["code"]: course
        for course in package["courses"]
        if course["code"] in {"PST 601", "PST 611", "PST 612", "PST 613"}
    }
    assert set(rows) == {"PST 601", "PST 611", "PST 612", "PST 613"}
    assert rows["PST 601"]["ph"] == 135
    assert rows["PST 601"]["content_summary"].endswith("externally moderated.")
    assert rows["PST 611"]["title"] == "Cardio-Respiratory Physiotherapy"
    assert "source_conflict_note" in rows["PST 611"]
    assert rows["PST 612"]["units"] == 2 and rows["PST 612"]["ph"] == 90
    assert rows["PST 612"]["lh"] is None
    assert rows["PST 613"]["title"] == "Principles of Management and Administration for Physiotherapy"
    assert rows["PST 613"]["units"] == 2 and rows["PST 613"]["lh"] == 30
    for row in rows.values():
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"


def test_increment_006_audits_only_final_600_level_blocks_and_records_all_findings() -> None:
    text = INCREMENT_006.read_text(encoding="utf-8")
    assert URL in text
    assert "PST 624 and PST 625" in text
    assert "17 of 48" in text and "31 remain unchecked" in text
    assert "15 global vs 30 detailed" in text
    assert "truncated content summary" in text
    assert "missing item-level source provenance" in text
    assert "No row-level source URL" in text
    assert "No CCMAS source data, JAMB mapping, downstream links, or seeds were edited" in text
    assert "no PST 626" in text


def test_increment_006_observations_match_and_local_repairs_add_provenance() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {row["code"]: row for row in package["courses"] if row["code"] in {"PST 624", "PST 625"}}
    assert set(rows) == {"PST 624", "PST 625"}
    assert all(row["units"] == 1 and row["status"] == "C" for row in rows.values())
    assert rows["PST 624"]["lh"] == rows["PST 625"]["lh"] == 30
    assert rows["PST 624"]["ph"] is rows["PST 625"]["ph"] is None
    assert len(rows["PST 624"]["skills_learned"]) == 3
    assert len(rows["PST 625"]["skills_learned"]) == 4
    assert rows["PST 624"]["content_summary"].endswith("Nigeria and internationally.")
    assert rows["PST 625"]["content_summary"].endswith("physiotherapy in dermatological care.")
    for row in rows.values():
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"


def test_increment_006_confirmed_content_and_provenance_gaps_are_repaired() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {c["code"]: c for c in package["courses"] if c["code"] in {"PST 624", "PST 625"}}
    assert set(rows) == {"PST 624", "PST 625"}
    assert rows["PST 624"]["content_summary"].endswith("Nigeria and internationally.")
    assert "outdated term" in rows["PST 624"]["source_conflict_note"]
    assert rows["PST 625"]["content_summary"].endswith("physiotherapy in dermatological care.")
    for row in rows.values():
        assert "source-internal conflict" in row["source_conflict_note"]
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"


def test_increment_005_findings_are_repaired_without_erasing_source_conflicts() -> None:
    text = INCREMENT_005.read_text(encoding="utf-8")
    assert "PST 614" in text and "PST 621" in text and "PST 622" in text and "PST 623" in text
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    rows = {c["code"]: c for c in package["courses"] if c["code"] in {"PST 614", "PST 621", "PST 622", "PST 623"}}
    assert set(rows) == {"PST 614", "PST 621", "PST 622", "PST 623"}
    assert rows["PST 614"]["content_summary"].endswith("palliative-care organisations.")
    assert "source_conflict_note" in rows["PST 621"]
    assert "acute flaccid paralysis" in rows["PST 621"]["content_summary"]
    assert rows["PST 622"]["ph"] == 90
    assert len(rows["PST 622"]["skills_learned"]) == 4
    assert "source_conflict_note" in rows["PST 622"]
    assert "Allied Health Sciences" not in rows["PST 623"]["skills_learned"][-1]
    assert rows["PST 623"]["ph"] is None
    assert "source_conflict_note" in rows["PST 623"]
    for row in rows.values():
        assert row["source_url"] == URL
        assert row["source_locator"]
        assert row["source_accessed_on"] == "2026-09-28"
