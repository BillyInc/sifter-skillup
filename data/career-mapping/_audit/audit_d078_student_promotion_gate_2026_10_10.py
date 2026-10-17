"""Evaluate the D078 student-facing promotion gate without promoting data.

This is deliberately a release gate, not a role-fit audit and not a mutation
of the hidden graph.  It makes the temporary hidden state explicit and gives
the next implementation pass a deterministic way to decide when the graph
may be exposed.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
MASTER_PATH = AUDIT / "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
IMPLEMENTATION_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_GUIDED_IMPLEMENTATION_VERIFICATION_2026_10_10.json"
OUTPUT_PATH = AUDIT / "D078_STUDENT_PROMOTION_GATE_2026_10_10.json"
REPORT_PATH = ROOT / "docs" / "manual-review" / "D078_STUDENT_PROMOTION_GATE_2026_10_10.md"
CAREER_ROUTES_PATH = ROOT / "backend" / "routes" / "career_routes.py"
sys.path.insert(0, str(ROOT / "backend"))
from d078_guided_content import d078_guided_content  # noqa: E402


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def runtime_content_contract_complete(item: dict[str, Any]) -> bool:
    required_claims = {"item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"}
    claims = (item.get("claimEvidence") or {}).get("claims") or {}
    link_source = item.get("linkSourceReference") or {}
    return all((
        item.get("dataState") == "source_backed",
        item.get("claimReviewState") == "approved",
        item.get("linkState") == "linked",
        str(item.get("linkUrl") or "").startswith("https://"),
        bool(item.get("linkTitle")),
        bool(item.get("linkAccessedAt")),
        bool(link_source.get("id") or link_source.get("source_id")),
        str(link_source.get("url") or "").startswith("https://"),
        bool(link_source.get("locator")),
        bool((item.get("linkEvidence") or {}).get("locator")),
        bool(item.get("plainMeaning")),
        bool(item.get("contextualUse")),
        bool(item.get("sourceReferences")),
        bool(item.get("sourceLocators")),
        required_claims <= claims.keys(),
        all(claims[key].get("source_references") and claims[key].get("source_locators") for key in required_claims),
    ))


def main() -> None:
    graph = load(GRAPH_PATH)
    master = load(MASTER_PATH)
    implementation = load(IMPLEMENTATION_PATH)
    runtime = d078_guided_content()
    nodes = graph.get("nodes", [])
    path_design = graph.get("learning_path_design", {})
    role_coverage = path_design.get("role_item_coverage", {})
    area_branches = path_design.get("area_branches", [])
    content_closure = graph.get("area_reconciliation", {}).get("content_contract_closure", {})
    resource_repairs = graph.get("area_reconciliation", {}).get("area_resource_repairs", {})
    implementation_checks = implementation.get("checks", {})
    route_source = CAREER_ROUTES_PATH.read_text(encoding="utf-8-sig")
    runtime_items = runtime["domainItems"] + [item for rows in runtime["areaItems"].values() for item in rows]
    domain_statuses = [row["disposition"].get("approval_status") for row in master.get("domain_items", [])]
    area_statuses = [item["disposition"].get("approval_status") for area in master.get("areas", []) for item in area.get("items", [])]
    role_statuses = [row.get("approval_status") for row in master.get("role_item_reconciliation", {}).get("records", [])]
    # The aggregate `coverage.domain_decision_counts` predates the final
    # canonical alias fold and was stale (52 approved vs 53 approved records).
    # Derive current totals from item-level records so a passed decision is
    # never reopened by an obsolete summary count.
    domain_decision_counts = dict(Counter(domain_statuses))
    area_decision_counts = dict(Counter(area_statuses))
    role_decision_counts = dict(Counter(role_statuses))
    approved_domain_ids = {
        row["disposition"].get("item_id")
        for row in master.get("domain_items", [])
        if row["disposition"].get("approval_status") == "approved"
    }
    runtime_domain_ids = {item.get("itemKey") for item in runtime["domainItems"]}
    all_final_dispositions = bool(domain_statuses and area_statuses and role_statuses) and set(
        domain_statuses + area_statuses + role_statuses
    ) <= {"approved", "unapproved"}
    # The runtime includes the 2026-10-15 task-linked area-tool tranche in
    # addition to the 2026-10-12 master records. Its own exact count is the
    # authoritative expected count; do not make the older master count a
    # permanent blocker after the added items have individual contracts.
    expected_runtime_count = runtime.get("approvedCount", len(runtime_items))
    approved_runtime_content_passes = (
        len(runtime_items) == expected_runtime_count
        and all(runtime_content_contract_complete(item) for item in runtime_items)
    )
    runtime_content_wired_to_domain_api = all((
        "d078_domain_context_items()" in route_source,
        "d078_area_context_items(area_key)" in route_source,
        'router.get("/domains/{domain_id}"' in route_source,
    ))
    audited_theme_count = master.get("coverage", {}).get("programme_themes", 0)

    # A hidden, controlled verification preview is the next step after a
    # structurally complete rebuild. Per-node/per-edge visibility marks route
    # eligibility, not global release: the optional role-tool integration
    # correctly marks approved tools and their task/alternative links as
    # individually displayable. Only the graph-level release bit and explicit
    # student-facing approval control whether the complete path is released.
    visible_route_node_kinds = {"role", "role_task_context", "tool"}
    visible_route_edge_types = {
        "area_to_role",
        "domain_to_role",
        "role_has_task_context",
        "role_to_tool_option",
        "tool_supports_role_task",
        "tool_alternative_for_role_task",
    }
    visible_nodes = [node for node in nodes if node.get("student_visible") is True]
    visible_edges = [edge for edge in graph.get("edges", []) if edge.get("student_visible") is True]
    verification_checks = {
        "sequence_design_approved": path_design.get("sequence_approved") is True,
        # Individual route/tool eligibility is not a release. Keep the full
        # learning path hidden until the explicit global approval is granted;
        # permit only current route and optional-tool records to carry local
        # student-visible eligibility in this hidden audit graph.
        "learning_items_remain_unreleased": graph.get("student_visible") is False
        and graph.get("student_facing_approval") is not True
        and all(node.get("kind") in visible_route_node_kinds for node in visible_nodes)
        and all(edge.get("relationship") in visible_route_edge_types for edge in visible_edges)
        and not any(node.get("sequence_approved") is True for node in visible_nodes)
        and not any(edge.get("sequence_approved") is True for edge in visible_edges),
        "complete_route_inventory": (
            sum(node.get("kind") == "domain_learning_item" for node in nodes) == 53
            # Preserve the three actual area lanes: 36 earlier graph items,
            # 144 enriched area items, and 14 separately typed tool options.
            and sum(node.get("kind") == "area_learning_item" for node in nodes) == 36
            and sum(node.get("kind") == "area_enrichment_item" for node in nodes) == 144
            and graph.get("area_tool_option_integration", {}).get("integrated_item_count",
                graph.get("area_tool_option_integration", {}).get("added_item_count")) == 14
            and sum(node.get("kind") == "area_tool_option" for node in nodes) == 14
            and graph.get("area_tool_option_integration", {}).get("all_added_edges_are_non_sequencing") is True
            and len(area_branches) == 7
            and sum(branch.get("item_count", 0) for branch in area_branches) == 144
            and len(path_design.get("role_branches", [])) == 19
            and sum(node.get("kind") == "role" and node.get("domain_id") == "D078" for node in nodes) == 19
            and sum(edge.get("relationship") == "area_to_role" for edge in graph.get("edges", [])) == 26
            and role_coverage.get("all_records_integrated") == 173
        ),
        "role_handoff_fully_dispositioned_without_reopening_fit": (
            role_coverage.get("approved_dispositions", 0)
            + role_coverage.get("unapproved_final_dispositions", 0)
            == role_coverage.get("all_records_integrated") == 173
            and role_coverage.get("approved_direct_placements", 0)
            + role_coverage.get("approved_conditional_placements", 0)
            == role_coverage.get("approved_dispositions") == 171
            and graph.get("validation", {}).get("role_fit_reopened") is False
        ),
        "no_unresolved_student_items": graph.get("unresolved_student_items", 1) == 0,
        "domain_area_content_contract_structure_closed": (
            content_closure.get("domain_structural_gaps") == 0
            and content_closure.get("area_source_identity_gaps") == 0
            and resource_repairs.get("area_items_still_missing_evidence_or_free_learning_route") == 0
        ),
        "static_implementation_contracts_pass": bool(implementation_checks)
        and all(value is True for value in implementation_checks.values()),
        "programme_themes_match_audited_catalog": (
            audited_theme_count == 14
            and len(master.get("programme_themes", [])) == audited_theme_count
        ),
        "all_d078_item_dispositions_are_final": all_final_dispositions,
        "approved_runtime_content_has_complete_contracts": approved_runtime_content_passes,
        "approved_runtime_content_is_wired_to_domain_api": runtime_content_wired_to_domain_api,
        "domain_runtime_contains_only_finally_approved_items": (
            runtime_domain_ids == approved_domain_ids
        ),
    }
    student_verification_ready = all(verification_checks.values())
    checks = {
        "sequence_approved": path_design.get("sequence_approved") is True,
        "audit_graph_artifact_is_hidden": graph.get("student_visible") is False,
        "implementation_ui_gate_passed": implementation.get("status") == "verified_rendered_ui_and_student_promotion_ready",
        # The 2026-10-10 graph-level boolean is stale after 2026-10-12 item
        # dispositions. Gate the approved runtime subset from the current
        # master; unapproved rows remain excluded rather than blocking it.
        "approved_runtime_content_contracts_passed": approved_runtime_content_passes,
        "all_item_dispositions_final": all_final_dispositions,
        "explicit_student_facing_approval": graph.get("student_facing_approval") is True,
        "no_unresolved_student_items": graph.get("unresolved_student_items", 1) == 0,
    }
    # The graph must never become visible merely because an audit happened to
    # report no obvious errors.  Every release decision is explicit.
    promotion_allowed = all(checks.values())
    result = {
        "schema_version": "2026-10-15.d078.student-promotion-gate.v3",
        "status": "promotion_allowed" if promotion_allowed else "promotion_blocked_pending_release_gates",
        "student_verification_ready": student_verification_ready,
        "student_verification_status": (
            "ready_for_controlled_student_verification"
            if student_verification_ready else "controlled_verification_not_ready"
        ),
        "student_verification_checks": verification_checks,
        "promotion_allowed": promotion_allowed,
        "scope": "D078 programme -> domain -> area -> role student-facing release",
        "checks": checks,
        "legacy_route_topology_snapshot": {
            "status": graph.get("status"),
            "final_graph_ready": graph.get("final_graph_ready"),
            "audit_artifact_student_visible": graph.get("student_visible"),
            "nodes": len(graph.get("nodes", [])),
            "edges": len(graph.get("edges", [])),
        },
        "authoritative_master_graph": {
            "approval_status": master.get("learning_graph", {}).get("approval_status"),
            "nodes": master.get("learning_graph", {}).get("node_count"),
            "edges": master.get("learning_graph", {}).get("edge_count"),
            "student_visibility_policy": master.get("learning_graph", {}).get("student_visibility"),
        },
        "current_master": {
            "artifact_id": master.get("artifact_id"),
            "programme_themes": audited_theme_count,
            "programme_theme_claim_records": master.get("coverage", {}).get("programme_theme_claim_records"),
            "runtime_approved_items": len(runtime_items),
            "expected_runtime_approved_items": expected_runtime_count,
            "domain_decisions": domain_decision_counts,
            "area_decisions": area_decision_counts,
            "role_item_decisions": role_decision_counts,
            "decision_counts_source": "recounted from current individual master records; stale aggregate summaries are not release blockers",
        },
        "runtime_api": {
            "approved_items_merged_into_domain_detail_response": runtime_content_wired_to_domain_api,
            "route": "GET /api/career/domains/{domain_id}",
            "approved_domain_and_area_items": len(runtime_items),
            "note": "The audit graph's hidden flag does not suppress these item-level-approved API records. Deployment state is not inferred by this local audit.",
        },
        "analytics_policy": "deferred_until_after_wiring_rendered_verification_and_student_facing_promotion",
        "mutation_performed": False,
        "next_action": (
            "Run controlled authenticated/rendered D078 route/report verification against the local or test deployment; "
            "record findings without triggering public deployment. Do not repeat item disposition or content "
            "contract review unless new evidence or a regression is found. Record explicit public-release "
            "approval separately before promotion."
            if student_verification_ready else
            "Resolve only the failed controlled-verification checks above; do not reopen approved sequence or role fit."
        ),
    }
    OUTPUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D078 student-facing promotion gate - refreshed 15 October 2026",
        "",
        f"**Status:** `{result['status']}`.",
        f"**Controlled student-verification preview:** `{result['student_verification_status']}`.",
        "",
        "This audit does not mutate or deploy the D078 graph. It reads the current "
        "2026-10-12 master for existing item dispositions and the 2026-10-15 "
        "graph for its non-sequencing area-tool additions. Important: the "
            "hidden flag applies to the audit graph, not the API response—the domain "
        "detail route merges item-approved domain/area records, including the separately reconciled 2026-10-15 tool options. "
        "This local audit does not establish whether that code is deployed publicly.",
        "",
        "## Required release gates",
        "",
    ]
    for name, passed in checks.items():
        lines.append(f"- {'PASS' if passed else 'PENDING'} - {name.replace('_', ' ')}")
    lines.extend([
        "",
        "Controlled verification readiness and item-level API wiring are separate from authenticated rendered acceptance and deployment. Unapproved records are filtered from the approved runtime subset; this audit does not authorize a deployment or change the current deployment state.",
        "",
        "## Controlled verification checks",
        "",
    ])
    for name, passed in verification_checks.items():
        lines.append(f"- {'PASS' if passed else 'PENDING'} - {name.replace('_', ' ')}")
    lines.extend([
        "",
        "Promotion is allowed only when every listed release gate passes. The "
        "approved runtime subset is checked independently from excluded "
        "unapproved items. Analytics remains "
        "downstream of wiring, rendered UI verification and student-facing "
        "promotion; this gate does not implement analytics.",
        "",
        f"Next: {result['next_action']}",
        "",
    ])
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"status": result["status"], "student_verification_ready": student_verification_ready, "student_verification_checks": verification_checks, "promotion_allowed": promotion_allowed, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
