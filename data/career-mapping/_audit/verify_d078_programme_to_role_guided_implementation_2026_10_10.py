"""Verify the integrated D078 programme-to-role implementation boundary.

This is a route/implementation gate, not a role-fit audit.  It checks that the
closed domain/area content contract and the completed role-item handoff are
represented in one hidden graph, then checks that the live guided-plan surface
contains the required tray, relationship, snapshot and My World integration
hooks.  It intentionally does not promote data or alter canonical records.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
INTEGRATION_PATH = AUDIT / "D078_ROLE_ITEM_RECONCILIATION_INTEGRATION_2026_10_10.json"
AUDIT_PATH = AUDIT / "D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.json"
OUT_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_GUIDED_IMPLEMENTATION_VERIFICATION_2026_10_10.json"
REPORT_PATH = ROOT / "docs" / "manual-review" / "D078_PROGRAMME_TO_ROLE_GUIDED_IMPLEMENTATION_VERIFICATION_2026_10_10.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def static_contract_checks() -> dict[str, bool]:
    guided = (ROOT / "src" / "screens" / "careerIntelligence" / "GuidedFieldSelectionScreen.tsx").read_text(encoding="utf-8")
    tray = (ROOT / "src" / "components" / "careerIntelligence" / "GuidedLearningTray.tsx").read_text(encoding="utf-8")
    world = (ROOT / "src" / "screens" / "MyWorldScreen.tsx").read_text(encoding="utf-8")
    plan = (ROOT / "src" / "lib" / "guidedLearningPlan.ts").read_text(encoding="utf-8")
    adapter = (ROOT / "src" / "lib" / "guidedLearningPlanAdapter.ts").read_text(encoding="utf-8")
    report = (ROOT / "backend" / "services" / "report_gen.py").read_text(encoding="utf-8")
    return {
        "live_guided_screen_mounts_tray": "<GuidedLearningTray" in guided,
        "live_guided_screen_persists_plan_snapshot": "createLearningPlanReportSnapshot" in guided and "learningPlanSnapshot" in guided,
        "tray_supports_multiple_modes": all(token in tray for token in ('"icon"', '"compact"', '"mid"', '"full"')),
        "tray_supports_drop_motion": "Animated.spring" in tray or "Animated.timing" in tray,
        "tray_supports_relationship_comparison": "AlternativeComparisonSheet" in tray and "onSelectAlternative" in tray,
        "tray_supports_route_warning": "multiple routes" in tray.lower(),
        "tray_exposes_granular_item_selection": "Choose learning focus" in tray and "Add to this route" in tray and "onSelectCandidate" in tray,
        "tray_explains_all_learning_item_types": "LearningItemDetails" in tray and "What you can produce" in tray and "Limits:" in tray,
        "tray_exposes_task_specific_learning_link": "Open learning resource" in tray and "Linking.openURL" in tray,
        "plan_supports_prerequisite_sequence": "sequenceLearningPlanIds" in plan and "missing_prerequisite" in plan,
        "hard_dependencies_require_reviewed_source_backed_builds_on": (
            "function reviewedPrerequisites(" in adapter
            and 'relation.relationshipStatus !== "source_backed"' in adapter
            and 'relation.relationshipType !== "builds_on"' in adapter
            and "item.prerequisites ?? []" not in adapter
        ),
        "plan_supports_route_scoped_stacks": "buildLearningPlanStackSet" in plan and "multiple_routes" in plan,
        "snapshot_retains_item_context": all(token in plan for token in ("itemType", "expectedOutput", "prerequisiteNames", "relationships", "limitations")),
        "report_renders_saved_item_context": all(token in report for token in ("What you can produce", "How it connects", "Limits:", "Open learning resource")),
        "guided_screen_wires_granular_item_selection": "onSelectCandidate={selectLearningFocus}" in guided and "addToLearningPlan" in guided,
        # Assert the actual My World workflow, not obsolete copy/component names.
        # The current screen loads the durable guidance path, renders saved
        # snapshots, allows snapshot selection/editing, and offers HTML print,
        # DOCX download and privacy-safe sharing through a share sheet.
        "my_world_reads_and_reopens_saved_plan": all(token in world for token in (
            "careerData.getGuidancePath()",
            "learningPlanSnapshots",
            "learningPlanSnapshot",
            "setSelectedSnapshotId",
            "editLearningPlan",
            "snapshot_id=${encodeURIComponent(activeSnapshotId)}",
        )),
        "my_world_supports_print_download_and_share": all(token in world for token in (
            "PdfExportButton",
            "LearningPlanShareSheet",
            "openStudentDocument",
            "/api/student/report.html",
            "/api/student/report.docx",
            "shareTextSummary",
        )),
    }


def main() -> None:
    graph = load(GRAPH_PATH)
    integration = load(INTEGRATION_PATH)
    route_audit = load(AUDIT_PATH)
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    role_items = [node for node in nodes if node.get("kind") == "role_item_candidate"]
    domain_items = [node for node in nodes if node.get("kind") == "domain_learning_item"]
    areas = [node for node in nodes if node.get("kind") == "area_of_specialization"]
    role_edges = [edge for edge in edges if edge.get("relationship") == "reconciled_role_item_to_role"]

    prerequisite_edges = [
        edge for edge in edges
        if edge.get("relationship") in {"prerequisite_for", "requires", "builds_on"}
    ]
    adjacency: dict[str, list[str]] = defaultdict(list)
    for edge in prerequisite_edges:
        adjacency[str(edge.get("source"))].append(str(edge.get("target")))
    state: dict[str, int] = {}
    cycle_nodes: set[str] = set()

    def visit(node_id: str, trail: list[str]) -> None:
        marker = state.get(node_id, 0)
        if marker == 2:
            return
        if marker == 1:
            cycle_nodes.update(trail[trail.index(node_id):] if node_id in trail else trail)
            return
        state[node_id] = 1
        for target in adjacency.get(node_id, []):
            visit(target, [*trail, node_id])
        state[node_id] = 2

    for node_id in set(adjacency):
        visit(node_id, [])

    labels = {str(node.get("label", "")) for node in nodes}
    retired_labels = {
        "Social, Cultural & Economic Research",
        "Computational and Quantitative Social Research",
    }
    role_positions = sorted(int(node["queue_position"]) for node in role_items)
    integration_counts = integration.get("counts", {})
    checks = {
        "graph_status_is_integrated_hidden_sequence_approved_state": (
            str(graph.get("status", "")).startswith("hidden_")
            and graph.get("learning_path_design", {}).get("sequence_approved") is True
        ),
        "graph_is_not_final_or_student_visible": graph.get("final_graph_ready") is False and graph.get("student_visible") is False,
        "53_domain_items_present": len(domain_items) == 53,
        "seven_current_areas_present": len(areas) == 7,
        "173_role_item_candidates_present": len(role_items) == 173 and role_positions == list(range(1, 174)),
        "all_role_item_candidates_hidden": all(node.get("student_visible") is False for node in role_items),
        "all_173_have_reconciliation_contract": sum(bool(node.get("role_item_reconciliation")) for node in role_items) == 173,
        # The integration is intentionally idempotent.  On the first run two
        # nodes were added; subsequent reruns should report zero newly added
        # nodes.  Verify the stable invariant instead of a historical run
        # count.
        "agent_handoff_counts_match": (
            integration_counts.get("input_records") == 173
            and integration_counts.get("existing_graph_nodes_integrated", 0)
            + integration_counts.get("hidden_nodes_added", 0) == 173
        ),
        "no_role_fit_reopened": integration.get("guardrails", {}).get("role_fit_reopened") is False,
        "no_canonical_promotion": integration.get("guardrails", {}).get("canonical_changes") is False,
        "no_retired_area_labels_emitted": not (labels & retired_labels),
        "prerequisite_graph_is_acyclic": not cycle_nodes,
        "all_role_edges_hidden": all(edge.get("student_visible") is False for edge in role_edges),
        "full_route_audit_records_integration": route_audit.get("counts", {}).get("role_item_handoff_integrated") is True,
        **static_contract_checks(),
    }
    result = {
        "schema_version": "2026-10-12.d078.programme-to-role-guided-implementation-verification.v2",
        "status": "verified_hidden_route_static_contracts_pass_rendered_gate_pending" if all(checks.values()) else "verification_gaps_present",
        "scope": "programme_to_domain_to_area_to_role implementation; role-fit and subject matcher excluded",
        "counts": {
            "graph_nodes": len(nodes),
            "graph_edges": len(edges),
            "domain_items": len(domain_items),
            "areas": len(areas),
            "role_item_candidates": len(role_items),
            "reconciled_role_edges": len(role_edges),
            "prerequisite_edges": len(prerequisite_edges),
            "cycle_nodes": sorted(cycle_nodes),
        },
        "checks": checks,
        "verification_evidence": {
            "web_build": "passed in prior local verification; not a rendered-route proof",
            "frontend_http": "passed: local Vite root returned HTTP 200; browser DOM not inspected",
            "backend_health": "passed: local API /health returned HTTP 200",
            "sociology_route_smoke": "passed: fixture-driven route contract from programme preview through role",
            "report_smoke": "passed: fixture-driven review lock/unlock and relock after selection changes",
            "learning_plan_persistence_smoke": "passed: fixture-driven independent stacks, removal, saved order, prerequisite-safe snapshot/reopen",
            "backend_d078_tests": "passed: 7 tests across guided content and areas",
            "graph_unit_tests": "passed: 13 tests in prior local verification",
            "targeted_jest": "passed in prior local verification: guided plan and adapter, 2 suites / 21 tests",
            "dev_undergraduate_account": "not authenticated: configured Supabase hostname DNS lookup failed before account lookup; no account or report was created",
            "pdf_artifacts": "not generated: no authenticated account-backed report was available",
            "authenticated_d078_guided_route_rendered": False,
            "rendered_route_limitation": "Computer-use browser bridge failed to initialize; Playwright/Puppeteer/PDF renderers are unavailable. Dev-account login also cannot reach configured Supabase because DNS resolution fails. Fixture smoke tests do not prove a rendered or account-backed route.",
            "jest_component_suite": "not_run: jest-expo preset is unavailable in this checkout",
        },
        "integration_counts": integration_counts,
        "guardrails": {
            "student_visible": False,
            "canonical_changes": False,
            "role_fit_reopened": False,
            "subject_matcher_modified": False,
        },
        "next_step": "Restore configured dev-database DNS/connectivity and use the existing undergraduate test account for rendered route/report verification; do not restart role-fit adjudication or the subject matcher.",
    }
    OUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    failed = [name for name, passed in checks.items() if not passed]
    lines = [
        "# D078 programme-to-role guided implementation verification - 2026-10-12",
        "",
        f"**Status:** `{result['status']}`.",
        "",
        "This is an implementation-boundary verification, not a role-fit audit. It checks the hidden graph, the completed role-item handoff, route sequencing invariants and the guided-plan/My World code hooks. Passing static checks and smoke tests is not rendered proof of the authenticated D078 route.",
        "",
        f"- Graph: **{len(nodes)} nodes / {len(edges)} edges**.",
        f"- Domain items: **{len(domain_items)}**; current areas: **{len(areas)}**; role-item candidates: **{len(role_items)}**.",
        f"- Reconciled hidden role edges: **{len(role_edges)}**; prerequisite cycles: **{len(cycle_nodes)}**.",
        f"- Student-visible records: **0**; canonical changes: **0**; role-fit reopened: **no**; subject matcher changed: **no**.",
        "",
        "## Verified implementation surfaces",
        "",
    ]
    for name, passed in checks.items():
        lines.append(f"- {'PASS' if passed else 'FAIL'} - {name.replace('_', ' ')}")
    if failed:
        lines.extend(["", "Failed checks:", *[f"- `{name}`" for name in failed]])
    lines.extend([
        "",
        "## Current verification evidence",
        "",
        "- Vite frontend root: HTTP 200; API `/health`: HTTP 200. These are server-readiness checks, not browser-render proof.",
        "- Sociology route smoke: passed (fixture-driven programme preview -> university context -> domain -> area -> role contract).",
        "- Report smoke: passed (fixture-driven Review lock/unlock and relock after selection changes).",
        "- Learning-plan persistence smoke: passed (fixture-driven independent stacks, removals, saved order and prerequisite-safe snapshot/reopen).",
        "- D078 backend guided-content/area tests: 7 passed; graph unit tests: 13 passed in prior local verification.",
        "- Authenticated D078 guided screen: **not rendered/verified**. Browser bridge initialization failed, no browser automation/PDF renderer is installed, and dev-account login could not resolve the configured Supabase hostname. No account or report was created.",
        "- Jest component suite: not run because the `jest-expo` preset is unavailable in this checkout.",
        "",
        "",
        "The graph remains hidden because sequence approval, claim-level evidence, rendered UI verification and explicit student-facing promotion are separate release decisions. Local fixture tests are not an account-backed acceptance test.",
        "",
        "Next: restore dev-database connectivity, then use the existing undergraduate test account to complete D078 guided-route, save/reopen and report verification without reopening role-fit adjudication or the subject matcher.",
    ])
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"status": result["status"], "failed_checks": failed, "counts": result["counts"]}, indent=2))


if __name__ == "__main__":
    main()
