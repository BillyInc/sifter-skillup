"""Validate the disjoint D057-D112 Nigerian-context evidence ledger."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
LANE = Path(__file__).resolve().parent
WORKLIST = (
    ROOT
    / "data/career-mapping/_audit/specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06/STEP2_NIGERIAN_CONTEXT_2026_10_06"
    / "D057_D112_nigerian_context_worklist_2026_10_06.json"
)
LEDGER = LANE / "D057_D112_nigerian_context_evidence_2026_10_06.json"


def test_full_lane_coverage_and_required_fields() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    records = ledger["records"]
    expected = {
        (domain["domain_id"], area["label"])
        for domain in worklist["domains"]
        for area in domain.get("approved_global_specialization_areas", [])
    }
    actual = {(row["domain_id"], row["global_area_label"]) for row in records}
    required = {
        "domain_id", "domain_name", "global_area_label", "disposition",
        "exact_nigerian_claim", "source_publisher", "source_title", "exact_url",
        "locator", "access_date", "what_it_supports", "limits",
        "global_area_label_preserved", "scope", "confidence",
    }
    assert actual == expected
    assert len(records) == 210
    assert {int(row["domain_id"][1:]) for row in records} == set(range(57, 113))
    assert all(required <= set(row) for row in records)
    assert all(row["exact_url"].startswith("http") for row in records)
    assert all(row["global_area_label_preserved"] is True for row in records)
    assert ledger["canonical_taxonomy_changed"] is False
    assert ledger["roles_audited_or_changed"] is False


def test_dispositions_are_bounded() -> None:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    allowed = {
        "nigeria_specific_overlay_supported",
        "global_area_applies_no_material_local_difference_found",
        "no_primary_nigerian_evidence_found_after_search",
        "unresolved_source_or_scope_conflict",
    }
    assert {row["disposition"] for row in ledger["records"]} <= allowed
