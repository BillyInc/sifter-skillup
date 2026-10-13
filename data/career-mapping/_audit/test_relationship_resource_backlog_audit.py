"""Acceptance checks for the complete relationship/resource backlog ledger."""

from __future__ import annotations

import json
from pathlib import Path


REPORT = Path(__file__).with_name("RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json")


def _load() -> dict:
    return json.loads(REPORT.read_text(encoding="utf-8"))


def test_report_scans_full_programme_jamb_and_context_boundaries() -> None:
    report = _load()
    assert report["schemaVersion"] == "2026-09-19.relationship-resource-backlog.v1"
    assert report["scope"] == {
        "canonicalProgrammeCount": 237,
        "canonicalJambIdentityCount": 420,
        "contextCount": 5668,
        "relationshipRowsScanned": 408163,
        "itemRowsScanned": 121377,
    }
    assert len(report["programmes"]) == 237
    assert len(report["jambIdentities"]) == 420
    assert len(report["contexts"]) == 5668


def test_report_preserves_explicit_resource_and_relationship_states() -> None:
    report = _load()
    assert report["itemBacklog"]["stateCounts"] == {
        "linked": 5253,
        "no_link": 116116,
        "review_required": 8,
    }
    assert report["relationshipBacklog"]["stateCounts"] == {
        "not_established": 2305,
        "source_backed": 405858,
    }
    assert report["relationshipBacklog"]["unresolvedRows"] == 2305
    assert report["decision"]["studentExposureApproved"] is False
    assert report["decision"]["sqlApplied"] is False
    assert report["decision"]["browserProof"] is False


def test_every_context_and_projection_has_a_fail_closed_student_boundary() -> None:
    report = _load()
    assert all(row["studentExposure"] for row in report["programmes"])
    assert all(row["studentExposure"] for row in report["jambIdentities"])
    for row in report["contexts"]:
        assert row["contextLevel"] in {"domain", "subgroup", "role"}
        assert row["contextKey"]
        assert row["itemRows"] >= 0
        assert row["relationshipRows"] >= 0
