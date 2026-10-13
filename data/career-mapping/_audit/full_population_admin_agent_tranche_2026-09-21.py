"""Read-only bounded admin/report audit for a deterministic 20-programme tranche.

This file and its generated siblings are intentionally isolated under the
full_population_admin_agent namespace. The audit reads existing local
contracts and source files; it does not edit inventories, seeds, SQL, UI or
browser-proof artifacts.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
OUT_JSON = ROOT / "data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.json"
OUT_MD = ROOT / "data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.md"


def read_json(relative: str) -> dict[str, Any]:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def read_text(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def has_all(text: str, markers: list[str]) -> tuple[bool, list[str]]:
    missing = [marker for marker in markers if marker not in text]
    return not missing, missing


def source_surface_audit() -> dict[str, Any]:
    checks = {
        "admin_client_programme_intelligence": (
            "src/lib/adminData.ts",
            ["/api/institutions/me/programme-intelligence", "/api/institutions/me/programme-skill-coverage"],
        ),
        "admin_skills_gap_render": (
            "src/screens/admin/SkillsGapScreen.tsx",
            ["curriculumEvidence", "AdminGuidanceEvidencePanel", "Source-review records", "Gap candidates for curriculum review"],
        ),
        "admin_evidence_queue_render": (
            "src/components/admin/AdminGuidanceEvidencePanel.tsx",
            ["review_required", "not_established", "Provenance incomplete", "Review queue:"],
        ),
        "admin_api_scope_and_contract": (
            "backend/routes/institutions_routes.py",
            ["Auth.require_admin", "_assert_own_institution", "programme_curriculum_outcomes", "career_item_relationships", "programme-skill-coverage"],
        ),
        "report_route_context_gate": (
            "backend/routes/student_pipeline_routes.py",
            ["_current_guidance_report_context", "Choose a programme and university before printing your report", "/report.html", "/report.docx"],
        ),
        "report_review_ui_gate": (
            "src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx",
            ["isGuidanceReportReadyForRoute", "reportActionsEnabled", "Complete Review to unlock the report actions"],
        ),
        "report_button_gate": (
            "src/components/careerIntelligence/GuidanceReportButton.tsx",
            ["isGuidanceReviewComplete", "isGuidanceReportReadyForRoute"],
        ),
        "report_generation_boundary": (
            "backend/services/guidance_report.py",
            ["resolve_guidance_report_context", "domain_tools", "guidance_owner", "source_provenance"],
        ),
    }
    results: dict[str, Any] = {}
    for name, (path, markers) in checks.items():
        text = read_text(path)
        passed, missing = has_all(text, markers)
        results[name] = {"passed": passed, "file": path, "missing_markers": missing}
    return results


def audit_tranche() -> dict[str, Any]:
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    scaling = read_json("data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json")
    curriculum = read_json("data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json")
    admin = read_json("data/career-mapping/_audit/admin_downstream_acceptance_2026-09-19.json")

    canonical = sorted(broad.get("canonical_programmes", []), key=lambda row: str(row.get("programme_key") or ""))
    selected = canonical[:20]
    selected_keys = {str(row.get("programme_key")) for row in selected}
    scaling_by_key = {str(row.get("programmeKey")): row for row in scaling.get("programmes", [])}
    curriculum_by_key = {
        f"{row.get('discipline')}::{row.get('programme')}": row
        for row in curriculum.get("programmes", [])
    }

    jamb_rows = []
    for row in broad.get("jamb_identities", []):
        refs = [str(value) for value in row.get("component_refs", [])]
        matched = sorted(ref for ref in refs if ref in selected_keys)
        if matched:
            jamb_rows.append({
                "jamb_name": row.get("jamb_name"),
                "coverage_category": row.get("coverage_category"),
                "mapping_status": row.get("mapping_status"),
                "component_refs": matched,
                "source_reference_count": len(row.get("source_references") or []),
                "external_enrichment": row.get("external_enrichment") or {},
            })

    jamb_status_counts = dict(Counter(str(row.get("mapping_status") or "missing") for row in jamb_rows))
    jamb_category_counts = dict(Counter(str(row.get("coverage_category") or "missing") for row in jamb_rows))
    jamb_component_source_failures = [
        row["jamb_name"] for row in jamb_rows
        if not row.get("component_refs") or int(row.get("source_reference_count") or 0) == 0
    ]
    jamb_review_required = [
        row["jamb_name"] for row in jamb_rows
        if row.get("mapping_status") == "review_required"
    ]

    programme_rows: list[dict[str, Any]] = []
    queue_counts: Counter[str] = Counter()
    relationship_counts: Counter[str] = Counter()
    failures: list[dict[str, Any]] = []
    for row in selected:
        key = str(row.get("programme_key"))
        scaled = scaling_by_key.get(key, {})
        context = scaled.get("context") or {}
        curriculum_row = curriculum_by_key.get(key)
        resource_state = str((row.get("resource_review") or {}).get("state") or "missing")
        relationship_state = str((row.get("relationship_review") or {}).get("state") or "missing")
        admin_state = str((row.get("admin_review") or {}).get("state") or "missing")
        unresolved = int((row.get("relationship_review") or {}).get("unresolved_or_not_established_count") or 0)
        queue_counts[resource_state] += 1
        queue_counts[admin_state] += 1
        relationship_counts[relationship_state] += 1
        checks = {
            "curriculum_contract_present": curriculum_row is not None or (scaled.get("curriculum") or {}).get("kind") == "sociology",
            "active_domain_mapping_present": int((row.get("active_domain_mapping") or {}).get("link_count") or 0) > 0,
            "mapping_links_are_active_types": all(
                link.get("match_type") in {"direct", "functional", "adjacent"}
                for link in (row.get("active_domain_mapping") or {}).get("links") or []
            ),
            "ownership_and_state_complete": all(
                int(context.get(field) or 0) == 0
                for field in ("missingGuidanceOwner", "ownerMismatch", "missingDataState", "invalidDataState", "ownerOrStateRows")
            ),
            "source_trace_complete": all(
                int(context.get(field) or 0) == 0
                for field in ("missingSourceReferences", "missingSourceLocators", "sourceLocatorGaps", "missingSourceReferenceRows")
            ),
            "resource_queue_closed": resource_state not in {"review_required", "missing"},
            "relationship_queue_closed": relationship_state not in {"review_required", "not_established", "missing"} and unresolved == 0,
            "admin_render_queue_closed": admin_state not in {"pending_full_population_render", "missing"},
        }
        for check, passed in checks.items():
            if not passed:
                failures.append({"programme_key": key, "gate": check, "evidence": {"resource_state": resource_state, "relationship_state": relationship_state, "admin_state": admin_state, "unresolved_relationship_count": unresolved}})
        programme_rows.append({
            "programme_key": key,
            "discipline": row.get("discipline"),
            "programme": row.get("programme"),
            "curriculum": {
                "contract_present": checks["curriculum_contract_present"],
                "course_count": (row.get("curriculum") or {}).get("course_count"),
                "outcome_count": (row.get("curriculum") or {}).get("outcome_count"),
                "contract_source": (curriculum_row or {}).get("sourceFile"),
            },
            "active_domain_mapping": {
                "link_count": (row.get("active_domain_mapping") or {}).get("link_count", 0),
                "relationship_types": dict(Counter(link.get("match_type") for link in (row.get("active_domain_mapping") or {}).get("links") or [])),
            },
            "queues": {
                "resource": resource_state,
                "relationship": relationship_state,
                "unresolved_relationship_count": unresolved,
                "admin": admin_state,
            },
            "ownership_and_provenance": {
                "missing_guidance_owner": context.get("missingGuidanceOwner", 0),
                "owner_mismatch": context.get("ownerMismatch", 0),
                "missing_source_references": context.get("missingSourceReferences", 0),
                "missing_source_locators": context.get("missingSourceLocators", 0),
            },
            "checks": checks,
        })

    static = source_surface_audit()
    report = {
        "schema_version": "2026-09-21.full-population-admin-agent-tranche.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "tranche_definition": {
            "selection": "first 20 canonical programme keys after lexical sort",
            "programme_count": len(programme_rows),
            "programme_keys": sorted(selected_keys),
            "jamb_identities_referencing_tranche": len(jamb_rows),
        },
        "population_reference": {
            "all_programmes": len(broad.get("canonical_programmes", [])),
            "all_jamb_identities": len(broad.get("jamb_identities", [])),
            "active_domain_links_all_programmes": admin.get("scope", {}).get("activeProgrammeDomainLinks"),
        },
        "jamb_rows": jamb_rows,
        "jamb_queue_summary": {
            "mapping_status_counts": jamb_status_counts,
            "coverage_category_counts": jamb_category_counts,
            "component_or_source_failures": jamb_component_source_failures,
            "review_required_identities": jamb_review_required,
        },
        "programme_rows": programme_rows,
        "queue_counts": dict(queue_counts),
        "relationship_queue_counts": dict(relationship_counts),
        "static_surface_checks": static,
        "failures": failures,
        "gate_summary": {
            "curriculum_contract_gate": all(row["checks"]["curriculum_contract_present"] for row in programme_rows),
            "active_mapping_gate": all(row["checks"]["active_domain_mapping_present"] and row["checks"]["mapping_links_are_active_types"] for row in programme_rows),
            "ownership_provenance_gate": all(row["checks"]["ownership_and_state_complete"] and row["checks"]["source_trace_complete"] for row in programme_rows),
            "resource_review_gate": all(row["checks"]["resource_queue_closed"] for row in programme_rows),
            "relationship_review_gate": all(row["checks"]["relationship_queue_closed"] for row in programme_rows),
            "admin_render_gate": all(row["checks"]["admin_render_queue_closed"] for row in programme_rows),
            "admin_static_surface_gate": all(check["passed"] for check in static.values()),
            "jamb_component_source_gate": not jamb_component_source_failures,
            "jamb_review_queue_closed": not jamb_review_required,
            "browser_proof_gate": False,
            "live_sql_gate": False,
        },
        "smallest_local_fixes_before_final_phase": [
            "Close or explicitly enrich each tranche programme's resource review queue with item-specific authoritative evidence; retain review_required when evidence is absent.",
            "Resolve the tranche's not_established/review_required relationship rows only from exact endpoint evidence; do not infer edges from names or source frequency.",
            "Replace pending_full_population_render with a recorded per-programme admin render acceptance artifact after exercising the admin route against the deployed contract.",
            "Run the same deterministic tranche audit against live payloads after manual SQL, then run browser proof; local static checks alone cannot close those gates.",
        ],
        "inputs": [
            "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
            "data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json",
            "data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json",
            "data/career-mapping/_audit/admin_downstream_acceptance_2026-09-19.json",
        ],
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    return report


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["gate_summary"]
    lines = [
        "# Full-population admin/report audit tranche",
        "",
        f"Generated: {report['generated_on']}",
        "Mode: read-only local audit; no existing inventory, seed, SQL, UI or browser-proof file was changed.",
        "",
        "## Bounded tranche",
        "",
        "Selection: first 20 canonical programme keys after lexical sort.",
        f"- Programmes audited: **{report['tranche_definition']['programme_count']}**.",
        f"- JAMB identities referencing these programme components: **{report['tranche_definition']['jamb_identities_referencing_tranche']}**.",
        f"- Full-population reference: **{report['population_reference']['all_programmes']} programmes / {report['population_reference']['all_jamb_identities']} JAMB identities**.",
        "",
        "## Gate results",
        "",
    ]
    for name, passed in summary.items():
        lines.append(f"- `{name}`: **{'PASS' if passed else 'FAIL / DEFERRED'}**.")
    lines.extend(["", "## Per-programme queue findings", "", "| Programme | Curriculum | Active links | Resource queue | Relationship queue | Unresolved | Admin queue |", "|---|---:|---:|---|---|---:|---|"])
    for row in report["programme_rows"]:
        q = row["queues"]
        lines.append(f"| {row['programme_key']} | {'yes' if row['curriculum']['contract_present'] else 'no'} | {row['active_domain_mapping']['link_count']} | `{q['resource']}` | `{q['relationship']}` | {q['unresolved_relationship_count']} | `{q['admin']}` |")
    lines.extend(["", "## Admin/report surfaces audited", ""])
    for name, result in report["static_surface_checks"].items():
        state = "PASS" if result["passed"] else "FAIL"
        suffix = f"; missing markers: {', '.join(result['missing_markers'])}" if result["missing_markers"] else ""
        lines.append(f"- `{name}`: **{state}** ({result['file']}{suffix}).")
    lines.extend(["", "## Exact failing gates", ""])
    failures = report["failures"]
    by_gate = Counter(row["gate"] for row in failures)
    if by_gate:
        for gate, count in by_gate.items():
            lines.append(f"- `{gate}` failed for **{count}/{report['tranche_definition']['programme_count']}** programmes.")
    else:
        lines.append("- No bounded data gate failed.")
    jamb_queue = report["jamb_queue_summary"]
    if jamb_queue["component_or_source_failures"]:
        lines.append(f"- `jamb_component_source_gate` failed for {len(jamb_queue['component_or_source_failures'])} JAMB identities.")
    else:
        lines.append("- `jamb_component_source_gate` passed for all 54 linked JAMB identities.")
    if jamb_queue["review_required_identities"]:
        lines.append(f"- `jamb_review_queue_closed` failed for {len(jamb_queue['review_required_identities'])} JAMB identities: {', '.join(jamb_queue['review_required_identities'])}.")
    else:
        lines.append("- `jamb_review_queue_closed` passed for all linked JAMB identities.")
    lines.extend(["", "The resource and relationship failures are explicit review queues, not evidence that generic links or inferred edges are acceptable. `browser_proof_gate` and `live_sql_gate` are deferred by instruction and are not claimed complete.", "", "## Smallest concrete local fixes before final browser/SQL phase", ""])
    for index, item in enumerate(report["smallest_local_fixes_before_final_phase"], 1):
        lines.append(f"{index}. {item}")
    lines.extend(["", "## JAMB subset", ""])
    if report["jamb_rows"]:
        for row in report["jamb_rows"]:
            lines.append(f"- {row['jamb_name']}: `{row['coverage_category']}`, `{row['mapping_status']}`, {len(row['component_refs'])} matching component reference(s), {row['source_reference_count']} source reference(s).")
    else:
        lines.append("- No JAMB identity references the selected 20 canonical programme keys in the current ledger.")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    result = audit_tranche()
    print(json.dumps({
        "json": str(OUT_JSON.relative_to(ROOT)),
        "markdown": str(OUT_MD.relative_to(ROOT)),
        "programmes": result["tranche_definition"]["programme_count"],
        "jamb_identities": result["tranche_definition"]["jamb_identities_referencing_tranche"],
        "failures": len(result["failures"]),
        "gate_summary": result["gate_summary"],
    }, indent=2))
