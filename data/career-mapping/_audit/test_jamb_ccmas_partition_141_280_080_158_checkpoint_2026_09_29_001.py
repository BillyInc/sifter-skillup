"""Guard the first source-review tranche for JAMB rows 141-280 / CCMAS 80-158."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_001.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_001.md"


def test_checkpoint_covers_only_assigned_disjoint_partition() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    partition = checkpoint["partition"]
    assert partition["jamb_canonical_rows"] == [141, 280]
    assert partition["ccmas_package_indices"] == [80, 158]
    assert partition["shared_ledger_edits"] is False
    assert partition["downstream_domain_subgroup_role_review"] is False


def test_deterministic_indices_and_package_080_source_locator_are_pinned() -> None:
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    reconciliation = checkpoint["reconciliation"]
    jamb = [
        row for row in report["jamb_identities"]
        if 141 <= row["canonical_order"] <= 280
    ]
    occurrences = [occ for row in jamb for occ in row["source_occurrences"]]
    packages = [
        package for package in report["ccmas_packages"]
        if 80 <= package["package_index"] <= 158
    ]
    german = next(package for package in packages if package["package_index"] == 80)

    assert len(jamb) == reconciliation["jamb_identity_count"] == 140
    assert len(occurrences) == reconciliation["jamb_occurrence_count"] == 141
    assert len({occ["occurrence_id"] for occ in occurrences}) == 141
    assert len(packages) == reconciliation["ccmas_package_count"] == 79
    assert sum(package["course_count"] for package in packages) == 3144
    assert german["source_file"] == "arts.json"
    assert german["programme"] == "Modern European Languages B.A (German)"
    tranche = reconciliation["ccmas_completed_tranche"]
    assert tranche["local_course_rows"] == german["course_count"] == 42
    assert tranche["source_url"].startswith("https://www.nuc.edu.ng/")
    assert tranche["printed_locators"] == ["pp. 467-468, Global Course Structure"]
    assert tranche["course_content_and_learning_outcome_review"].startswith("partial")


def test_findings_and_resume_cursor_are_incremental_and_source_bounded() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    tranche = checkpoint["reconciliation"]["ccmas_completed_tranche"]
    findings = tranche["field_findings"]
    assert any(item["local_record"].endswith("::GER 407") for item in findings)
    assert any(item["local_record"].endswith("::GER 401") for item in findings)
    assert any(item["disposition"] == "source_conflict" for item in findings)
    assert all(item["disposition"] in {
        "confirmed_match", "confirmed_defect", "source_conflict", "candidate", "unresolved"
    } for item in findings)
    assert tranche["accessed_on"] == "2026-09-29"
    assert checkpoint["reconciliation"]["next_cursor"]["ccmas_package_index"] == 80
    assert checkpoint["reconciliation"]["next_cursor"]["jamb_canonical_row"] == 141
    markdown = MARKDOWN.read_text(encoding="utf-8")
    assert "0/79 packages complete" in markdown
    assert "No curriculum data was changed." in markdown
