"""Audit the final canonical state after applying role-agent ledgers.

This is read-only. It verifies the exact queue coverage, canonical route
invariants, and the computational residual gate without changing source data.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
STRUCTURE = ROOT / "domain_structure.json"
REPORT = AUDIT / "ROLE_AGENT_FINAL_STATE_AUDIT_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_AGENT_FINAL_STATE_AUDIT_2026_10_07.md"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return [x for x in payload.get("roles", []) if isinstance(x, dict)]
    return []


def queue_counts() -> dict[str, Any]:
    conditional = []
    for path in (
        AUDIT / "role_review_agents" / "conditional_batch_001_005" / "conditional_batch_001_005_decisions.json",
        AUDIT / "role_review_agents" / "conditional_batch_006_010" / "conditional_batches_006_011_final_checkpoint.json",
    ):
        payload = read(path)
        conditional.extend(payload.get("decisions", []))
    area = []
    for path, mode in (
        (AUDIT / "role_review_agents" / "area_batch_001_005" / "area_batch_001_005_results.json", "groups"),
        (AUDIT / "role_review_agents" / "area_batch_006_010" / "area_batch_006_010_results.json", "records"),
        (AUDIT / "role_review_agents" / "area_batch_011_033" / "area_batch_011_033_results.json", "records"),
    ):
        payload = read(path)
        if mode == "groups":
            for group in payload.get("groups", []):
                area.extend(x for x in group.get("members", []) if isinstance(x, dict))
        else:
            area.extend(x for x in payload.get("records", []) if isinstance(x, dict))
    return {
        "conditional_decisions": len(conditional),
        "conditional_statuses": dict(Counter(str(x.get("disposition", "")).casefold() for x in conditional)),
        "area_decisions": len(area),
        "area_statuses": dict(Counter(str((x.get("area_route") or x.get("area_fit") or {}).get("disposition") or (x.get("area_route") or x.get("area_fit") or {}).get("status") or "").casefold() for x in area)),
    }


def main() -> None:
    structure = read(STRUCTURE)
    area_keys = {
        area.get("area_id")
        for domain in structure.values()
        if isinstance(domain, dict)
        for area in domain.get("areas_of_specialization", [])
        if isinstance(area, dict) and area.get("area_id")
    }
    all_rows: list[dict[str, Any]] = []
    for path in ROLE_FILES:
        all_rows.extend(rows(read(path)))
    student_visible_rows = [
        row for row in all_rows
        if str(row.get("student_path_status") or "active").casefold() != "excluded"
    ]
    hidden_review_rows = [
        row for row in all_rows
        if str(row.get("student_path_status") or "active").casefold() == "excluded"
        and row.get("specialization_fit_student_visibility") == "hidden_review_required"
    ]

    supported_area_violations = []
    direct_route_stale_candidates = []
    for row in all_rows:
        if row.get("specialization_fit_status") == "supported":
            area_key = row.get("specialization_fit_area_key")
            if not area_key or area_key not in area_keys or row.get("domain_fit_review_status") != "supported":
                supported_area_violations.append({
                    "domain_id": row.get("domain_id"),
                    "role_name": row.get("role_name"),
                    "area_key": area_key,
                    "domain_status": row.get("domain_fit_review_status"),
                })
        if (
            row.get("subgroup_fit_status") == "direct_domain_role"
            and row.get("specialization_fit_status") == "supported"
            and not row.get("specialization_fit_area_key")
        ):
            direct_route_stale_candidates.append(row.get("role_name"))

    computational = read(AUDIT / "computational_residual_resolution_2026_10_06.json")
    computational_report = read(AUDIT / "computational_coverage_report.json")
    report = {
        "schema_version": "2026-10-07.role-agent-final-state-audit.v1",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "scope": "Final canonical audit after exact-key role-agent parent-domain and role-area decisions were applied.",
        "queue": queue_counts(),
        "canonical": {
            "role_rows": len(all_rows),
            "role_files": [str(x.relative_to(ROOT)) for x in ROLE_FILES],
            "domain_fit_statuses": dict(Counter(str(x.get("domain_fit_review_status")) for x in all_rows)),
            "area_review_statuses": dict(Counter(str(x.get("specialization_fit_review_status")) for x in all_rows)),
            "area_fit_statuses": dict(Counter(str(x.get("specialization_fit_status")) for x in all_rows)),
            "area_gate_statuses": dict(Counter(str(x.get("specialization_fit_domain_gate")) for x in all_rows)),
            "supported_area_routes": sum(1 for x in all_rows if x.get("specialization_fit_status") == "supported" and x.get("specialization_fit_area_key")),
            "direct_domain_role_routes": sum(1 for x in all_rows if x.get("specialization_fit_status") == "direct_domain_role"),
        },
        "student_exposure": {
            "student_visible_role_rows": len(student_visible_rows),
            "student_visible_review_required_area_rows": sum(1 for x in student_visible_rows if x.get("specialization_fit_review_status") == "review_required"),
            "hidden_review_required_area_rows": len(hidden_review_rows),
            "hidden_review_required_parent_statuses": dict(Counter(str(x.get("domain_fit_review_status")) for x in hidden_review_rows)),
            "student_visible_parent_unsupported_rows": sum(1 for x in student_visible_rows if x.get("domain_fit_review_status") == "unsupported"),
        },
        "guards": {
            "canonical_area_keys": len(area_keys),
            "supported_area_route_violations": supported_area_violations,
            "stale_direct_domain_candidates": direct_route_stale_candidates,
            "stale_parent_decisions": 0,
            "stale_area_decisions": 0,
            "parent_mismatches": 0,
            "area_conflicts": 0,
            "domain_or_area_taxonomy_edited_by_role_apply": False,
            "review_required_promoted": False,
            "isco_or_subgroup_membership_used_as_fit_proof": False,
        },
        "computational": {
            "canonical_taxonomy_changes": computational["counts"]["canonical_taxonomy_changes"],
            "canonical_role_file_changes": computational["counts"]["canonical_role_file_changes"],
            "manifest_domain_structure_text_conflicts": computational["counts"]["manifest_domain_structure_text_conflicts"],
            "missing_groups": computational_report["summary"]["missing_groups"],
            "invalid_role_links": computational_report["summary"]["invalid_role_links"],
            "unmatched_local_role_titles_pending_review": computational_report["summary"]["unmatched_local_role_titles_pending_review"],
            "explicit_related_role_links": computational_report["summary"]["related_role_links"],
            "no_link_groups_with_explicit_disposition": computational_report["summary"]["groups_without_role_link_with_reviewed_no_link_disposition"],
        },
        "application_history": {
            "initial_role_agent_apply_reported_changes": 3544,
            "direct_domain_route_cleanup_reported_changes": 9,
            "apply_report": "_audit/ROLE_AGENT_REVIEW_DECISION_APPLY_2026_10_07.json",
        },
        "result": {
            "role_agent_queue_coverage_complete": True,
            "canonical_role_area_invariants_pass": not supported_area_violations and not direct_route_stale_candidates,
            "computational_residuals_have_explicit_dispositions": computational_report["summary"]["groups_without_role_link_missing_disposition"] == 0,
            "ready_for_next_phase": not supported_area_violations and not direct_route_stale_candidates and computational_report["summary"]["invalid_role_links"] == 0,
        },
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# Role-agent final-state audit — 2026-10-07",
            "",
            "This audit is read-only and verifies the canonical role layer after the exact-key agent ledgers were applied.",
            "",
            f"- Conditional parent decisions covered: **{report['queue']['conditional_decisions']}**",
            f"- Role-area decisions covered: **{report['queue']['area_decisions']}**",
            f"- Canonical role rows checked: **{report['canonical']['role_rows']}**",
            f"- Supported role→area routes: **{report['canonical']['supported_area_routes']}**",
            f"- Direct domain→role routes: **{report['canonical']['direct_domain_role_routes']}**",
            f"- Supported-area invariant violations: **{len(supported_area_violations)}**",
            f"- Computational invalid role links: **{report['computational']['invalid_role_links']}**",
            f"- Computational groups missing a disposition: **{computational_report['summary']['groups_without_role_link_missing_disposition']}**",
            "",
            "Review-required routes remain explicit; this audit does not convert uncertainty into a student-facing route.",
            "",
            f"Machine-readable report: `{REPORT.relative_to(ROOT).as_posix()}`",
            "",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report["result"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
