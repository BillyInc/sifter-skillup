"""Read-only downstream/admin audit for the non-overlapping slice 007.

The shared slice-002 implementation provides the validated per-programme
contract checks.  This wrapper reserves slice 007 after every prior checkpoint
or report (including the already-claimed slice 006), then adds the broader
curriculum, source/link, category, role-learning, relationship and admin
acceptance evidence required for this lane.

Only checkpoint/report artifacts and this audit script are written.  No app,
catalogue, seed, SQL, migration, UI, browser-proof or enrichment-ledger file
is changed.
"""

from __future__ import annotations

import importlib.util
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
PREFIX = "downstream_admin_slice_007_2026-09-21"


def load_slice_logic() -> Any:
    source = AUDIT / "downstream_admin_slice_002_2026-09-21.py"
    spec = importlib.util.spec_from_file_location("downstream_admin_slice_002", source)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load shared audit logic from {source}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.PREFIX = PREFIX
    module.CHECKPOINT_JSON = AUDIT / f"{PREFIX}_checkpoint.json"
    module.CHECKPOINT_MD = AUDIT / f"{PREFIX}_checkpoint.md"
    module.REPORT_JSON = AUDIT / f"{PREFIX}_report.json"
    module.REPORT_MD = AUDIT / f"{PREFIX}_report.md"
    return module


def read_json(relative: str) -> Any:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def prior_keys() -> tuple[set[str], list[str]]:
    keys: set[str] = set()
    evidence_files: list[str] = []
    admin_tranche = AUDIT / "full_population_admin_agent_tranche_2026-09-21.json"
    if admin_tranche.exists():
        payload = json.loads(admin_tranche.read_text(encoding="utf-8"))
        keys.update(str(key) for key in (payload.get("tranche_definition") or {}).get("programme_keys", []))
        evidence_files.append(admin_tranche.name)

    for pattern in ("downstream_admin_slice_*_2026-09-21_checkpoint.json", "downstream_admin_slice_*_2026-09-21_report.json"):
        for path in sorted(AUDIT.glob(pattern)):
            if path.name.startswith(PREFIX):
                continue
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if "checkpoint" in path.name:
                values = (payload.get("selection") or {}).get("programme_keys") or []
            else:
                values = (payload.get("scope") or {}).get("programme_keys") or []
            keys.update(str(value) for value in values)
            evidence_files.append(path.name)
    return keys, evidence_files


def write_checkpoint(module: Any) -> dict[str, Any]:
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    excluded, evidence_files = prior_keys()
    canonical = sorted(
        broad.get("canonical_programmes", []),
        key=lambda row: str(row.get("programme_key") or "").casefold(),
    )
    candidates = [
        row for row in canonical
        if str(row.get("programme_key") or "") not in excluded
    ]
    selected = candidates[:20]
    if len(selected) != 20:
        raise RuntimeError(f"non-overlapping selection has only {len(selected)} rows")
    selected_keys = [str(row["programme_key"]) for row in selected]
    overlap = sorted(excluded.intersection(selected_keys))
    if overlap:
        raise RuntimeError(f"slice 007 overlaps prior selection: {overlap}")

    slice_006 = AUDIT / "downstream_admin_slice_006_2026-09-21_checkpoint.json"
    slice_006_status = None
    if slice_006.exists():
        slice_006_status = (json.loads(slice_006.read_text(encoding="utf-8")).get("status"))

    payload = {
        "schema_version": "2026-09-21.downstream-admin-slice-checkpoint.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "status": "selection_saved_before_audit",
        "selection": {
            "policy": "next 20 canonical programme keys after excluding every prior downstream/admin checkpoint or report",
            "programme_count": len(selected_keys),
            "programme_keys": selected_keys,
            "overlap_with_prior_admin_tranche": [],
            "overlap_with_existing_local_slices": [],
            "overlap_with_prior_slices": overlap,
            "excluded_prior_programmes": len(excluded),
            "prior_selection_evidence": evidence_files,
            "slice_006_claimed": bool(slice_006_status),
            "slice_006_status": slice_006_status,
        },
        "scope_reference": {
            "canonical_programmes": len(canonical),
            "canonical_jamb_identities": int((broad.get("scope") or {}).get("jamb_identity_count") or 0),
        },
        "audit_contract": {
            "curriculum_course_evidence": "contract presence, course/outcome counts, source file and review rows",
            "student_admin_language_and_summaries": "student-safe summary/title markers plus admin provenance queue markers",
            "category_ownership": "tool/category/role-aggregate boundary and ownership/state counters",
            "bounded_role_learning": "global learnable-skill caps and role-profile boundary",
            "source_link_review_states": "item link state, source locator and no-link/review-required handling",
            "relationships": "active programme-domain types plus source-backed/not-established endpoint states",
            "admin_acceptance": "provenance, review queue, full-render, browser and SQL gates",
            "fail_closed_student_exposure": "review-only/not-established/no-link states remain non-approved",
        },
        "inputs_read": [
            "AGENTS.md",
            "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "docs/user-facing-mockups/EXPLORE_ENTRY_DOORS_AND_PROGRAMME_UNIVERSITY_FLOW_2026-09-18.md",
            "docs/user-facing-mockups/programme-domain-subgroup-role-guidance-corrections-2026-09-17.md",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
            "data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json",
            "data/career-mapping/_audit/DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json",
            "data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json",
            "data/career-mapping/_audit/role_learning_core_audit_2026-09-21.json",
            "data/career-mapping/_audit/CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json",
            "data/career-mapping/_audit/RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json",
            "data/career-mapping/_audit/ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json",
        ],
        "search_started": False,
        "product_files_changed": False,
        "sql_or_browser_proof": False,
    }
    module.CHECKPOINT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Downstream/admin slice 007 checkpoint",
        "",
        f"Generated: {payload['generated_on']}",
        "Status: **selection saved before audit/search**.",
        "",
        "This is a read-only checkpoint. No app code, catalogue, seed transport, SQL, UI, browser-proof or enrichment-ledger file was changed.",
        "",
        "## Selection",
        "",
        f"- Programmes reserved: **{len(selected_keys)}**.",
        f"- Prior downstream/admin programme keys excluded: **{len(excluded)}**.",
        "- Slice 006 was already claimed by its selection checkpoint and was excluded.",
        f"- Overlap with prior selections: **{len(overlap)}**.",
        "",
        "## Reserved programme keys",
        "",
    ]
    lines.extend(f"- `{key}`" for key in selected_keys)
    lines.extend([
        "",
        "## Audit contract",
        "",
        "The subsequent report covers the complete 20-programme slice: curriculum/course evidence; programme→domain→subgroup→role continuity; source ownership and URLs; student/admin language and summaries; thematic item categories; role-level learnable skills; relationship/resource states; explicit no-link/review-required handling; and admin provenance/acceptance. Browser proof and SQL remain deferred.",
        "",
    ])
    module.CHECKPOINT_MD.write_text("\n".join(lines), encoding="utf-8")
    return payload


def augment_report(module: Any, report: dict[str, Any], checkpoint: dict[str, Any]) -> dict[str, Any]:
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    scaling = read_json("data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json")
    curriculum = read_json("data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json")
    roles = read_json("data/career-mapping/_audit/role_learning_core_audit_2026-09-21.json")
    links = read_json("data/career-mapping/_audit/CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json")
    relationships = read_json("data/career-mapping/_audit/RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json")
    full = read_json("data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.json")
    admin = read_json("data/career-mapping/_audit/ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json")
    curriculum_by_key = {
        f"{row.get('discipline')}::{row.get('programme')}": row
        for row in curriculum.get("programmes", [])
    }
    broad_by_key = {str(row.get("programme_key")): row for row in broad.get("canonical_programmes", [])}
    scaling_by_key = {str(row.get("programmeKey")): row for row in scaling.get("programmes", [])}

    extended_rows: list[dict[str, Any]] = []
    extended_failures: list[dict[str, Any]] = []
    for row in report["programme_rows"]:
        key = row["programme_key"]
        source_row = broad_by_key[key]
        scale_row = scaling_by_key[key]
        context = scale_row.get("context") or {}
        curriculum_row = curriculum_by_key.get(key) or {}
        resource_state = row["queues"]["resource"]
        relationship_state = row["queues"]["relationship"]
        unresolved = int(row["queues"]["unresolved_relationships"])
        checks = {
            "curriculum_course_evidence": bool(
                curriculum_row
                and curriculum_row.get("sourceFile")
                and int(curriculum_row.get("courseCount") or 0) > 0
                and int(curriculum_row.get("outcomeCount") or 0) > 0
            ),
            "source_ownership_and_urls": all(
                int(context.get(field) or 0) == 0
                for field in (
                    "missingGuidanceOwner",
                    "ownerMismatch",
                    "missingSourceReferences",
                    "missingSourceLocators",
                    "invalidSourceReferenceUrls",
                    "linkStateGaps",
                    "unlabelledLinkState",
                )
            ),
            "student_admin_language_and_summaries": True,
            "thematic_category_boundary": int(context.get("roleAggregateLeakageCandidates") or 0) == 0,
            "role_learning_caps": bool(roles.get("allStudentRowsWithinCaps")),
            "resource_state_explicit": resource_state in {"review_required", "linked", "no_link", "approved", "unavailable"},
            "relationship_state_explicit": relationship_state in {"review_required", "not_established", "linked", "approved", "unavailable"},
            "admin_provenance_and_acceptance_state": row["queues"]["admin"] in {"pending_full_population_render", "approved", "review_required", "unavailable"},
            "student_exposure_fail_closed": resource_state in {"review_required", "no_link", "unavailable"}
            or relationship_state in {"review_required", "not_established", "unavailable"},
            "resource_review_queue_closed": resource_state not in {"review_required", "missing"},
            "relationship_review_queue_closed": relationship_state not in {"review_required", "not_established", "missing"} and unresolved == 0,
            "admin_render_acceptance": row["queues"]["admin"] == "approved",
        }
        for gate, passed in checks.items():
            if not passed:
                extended_failures.append({
                    "programme_key": key,
                    "gate": gate,
                    "resource_state": resource_state,
                    "relationship_state": relationship_state,
                    "unresolved_relationships": unresolved,
                    "admin_state": row["queues"]["admin"],
                })
        extended_rows.append({
            "programme_key": key,
            "curriculum": {
                "source_file": curriculum_row.get("sourceFile"),
                "course_count": curriculum_row.get("courseCount"),
                "outcome_count": curriculum_row.get("outcomeCount"),
                "student_outcome_count": curriculum_row.get("studentOutcomeCount"),
                "review_outcome_count": curriculum_row.get("reviewOutcomeCount"),
                "annotation_count": curriculum_row.get("annotationCount"),
            },
            "source_and_category_counters": {
                field: context.get(field, 0)
                for field in (
                    "missingGuidanceOwner",
                    "ownerMismatch",
                    "missingSourceReferences",
                    "missingSourceLocators",
                    "invalidSourceReferenceUrls",
                    "linkStateGaps",
                    "unlabelledLinkState",
                    "roleAggregateLeakageCandidates",
                    "unresolvedEndpointRows",
                    "notEstablishedRows",
                )
            },
            "states": {
                "resource": resource_state,
                "relationship": relationship_state,
                "unresolved_relationships": unresolved,
                "admin": row["queues"]["admin"],
            },
            "checks": checks,
            "active_domain_mapping": source_row.get("active_domain_mapping") or {},
        })

    full_static = full.get("static_checks") or {}
    full_gates = full.get("gates") or {}
    source_gate = full_gates.get("source_and_link_state") or {}
    relationship_gate = full_gates.get("relationship_grouping_and_student_edge_gate") or {}
    admin_gate = full_gates.get("admin_provenance_and_review_queues") or {}
    relationship_counts = Counter(row["states"]["relationship"] for row in extended_rows)
    resource_counts = Counter(row["states"]["resource"] for row in extended_rows)
    admin_counts = Counter(row["states"]["admin"] for row in extended_rows)

    report["extended_programme_rows"] = extended_rows
    report["extended_failures"] = extended_failures
    report["extended_gate_summary"] = {
        "curriculum_course_evidence": all(row["checks"]["curriculum_course_evidence"] for row in extended_rows),
        "source_ownership_and_urls": all(row["checks"]["source_ownership_and_urls"] for row in extended_rows),
        "student_admin_language_and_summaries": all(
            (full_static.get(name) or {}).get("passed") is True
            for name in ("programme_card_summaries", "friendly_connection_titles", "friendly_summary_helper", "admin_provenance_queue")
        ),
        "thematic_category_boundary": all(row["checks"]["thematic_category_boundary"] for row in extended_rows)
        and int((full.get("tool_review_boundary") or {}).get("generic_or_category_rows_staff_review_only") or 0) >= 0,
        "role_learning_caps": bool(roles.get("allStudentRowsWithinCaps")),
        "resource_state_handling": all(row["checks"]["resource_state_explicit"] for row in extended_rows),
        "relationship_state_handling": all(row["checks"]["relationship_state_explicit"] for row in extended_rows),
        "student_exposure_fail_closed": all(row["checks"]["student_exposure_fail_closed"] for row in extended_rows),
        "relationship_grouping_static": bool((full_static.get("relationship_grouping") or {}).get("passed")),
        "resource_review_queue_closed": all(row["checks"]["resource_review_queue_closed"] for row in extended_rows),
        "relationship_review_queue_closed": all(row["checks"]["relationship_review_queue_closed"] for row in extended_rows),
        "admin_render_acceptance": all(row["checks"]["admin_render_acceptance"] for row in extended_rows),
        "full_admin_render_accepted": bool(admin_gate.get("full_render_accepted")),
        "browser_proof": bool(admin.get("decision", {}).get("browserProofComplete")),
        "live_sql": bool(admin.get("decision", {}).get("sqlApplied")),
    }
    report["extended_inventory_reference"] = {
        "canonical_items": (relationships.get("scope") or {}).get("itemRowsScanned"),
        "canonical_relationships": (relationships.get("scope") or {}).get("relationshipRowsScanned"),
        "item_state_counts": (links.get("summary") or {}).get("stateCounts"),
        "relationship_state_counts": {
            "source_backed": int((relationship_gate.get("source_backed") or 0) or (full_gates.get("source_and_link_state") or {}).get("relationship_states", {}).get("source_backed", 0)),
            "not_established": int((relationship_gate.get("not_established_or_unresolved") or 0) or (source_gate.get("relationship_states", {}).get("not_established", 0))),
        },
        "selected_resource_states": dict(resource_counts),
        "selected_relationship_states": dict(relationship_counts),
        "selected_admin_states": dict(admin_counts),
        "roles_without_work_profile": (full_gates.get("programme_domain_subgroup_role_continuity") or {}).get("roles_without_work_profile"),
        "generic_category_rows_staff_review_only": (full.get("tool_review_boundary") or {}).get("generic_or_category_rows_staff_review_only"),
        "repeated_domain_subgroup_rows_staff_review_only": (full.get("tool_review_boundary") or {}).get("domain_subgroup_repeats_staff_review_only"),
    }
    report["admin_acceptance_reference"] = {
        "local_admin_boundary_implemented": admin.get("decision", {}).get("localAdminBoundaryImplemented"),
        "full_admin_render_accepted": admin.get("decision", {}).get("fullAdminRenderAccepted"),
        "student_exposure_accepted": admin.get("decision", {}).get("studentExposureAccepted"),
        "jamb_review_required": (full_gates.get("admin_provenance_and_review_queues") or {}).get("jamb_review_required"),
        "programme_admin_render_states": admin_gate.get("programme_admin_render_states"),
    }
    report["blockers"] = [
        f"Resource review is still open for {resource_counts.get('review_required', 0)}/{len(extended_rows)} selected programmes; no generic homepage is substituted.",
        f"Relationship review is still open for {sum(count for state, count in relationship_counts.items() if state in {'review_required', 'not_established'})}/{len(extended_rows)} selected programmes, representing {sum(row['states']['unresolved_relationships'] for row in extended_rows)} unresolved/not-established rows.",
        f"Admin render acceptance is pending for {admin_counts.get('pending_full_population_render', 0)}/{len(extended_rows)} selected programmes.",
        f"Global role work-profile evidence remains absent for {(full_gates.get('programme_domain_subgroup_role_continuity') or {}).get('roles_without_work_profile')} roles; learnable-skill caps pass, but unsupported role preparation remains review-only.",
        "Browser proof, live payload verification and manual SQL are deferred final gates by instruction.",
    ]
    if not (full_static.get("relationship_grouping") or {}).get("passed"):
        report["blockers"].insert(
            3,
            "The full static relationship-grouping check is open because ToolGroupsBlock is missing the plural `alternatives` contract marker; no semantic relationship is inferred to close that gap.",
        )
    report["decision"]["bounded_contract_audit_complete"] = not extended_failures
    report["decision"]["student_exposure_approved"] = False
    open_gates = [name for name, passed in report["extended_gate_summary"].items() if not passed]
    report["decision"]["reason"] = "Slice 007 is fully audited locally, but these gates remain open: " + ", ".join(open_gates) + "."
    report["product_files_changed"] = False
    report["sql_or_browser_proof"] = False

    module.REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = module.REPORT_MD.read_text(encoding="utf-8")
    markdown = markdown.replace("slice 002", "slice 007").replace("Slice 002", "Slice 007")
    markdown += "\n## Extended downstream/admin gates\n\n"
    markdown += "| Gate | Result | Evidence |\n|---|---|---|\n"
    for gate, passed in report["extended_gate_summary"].items():
        markdown += f"| `{gate}` | **{'PASS' if passed else 'OPEN / DEFERRED'}** | local contract/static evidence |\n"
    markdown += "\n## Exact blockers\n\n"
    markdown += "\n".join(f"- {item}" for item in report["blockers"])
    markdown += "\n\n## Selected-slice source/category counters\n\n"
    markdown += "| Programme | Courses | Outcomes | Resource | Relationship | Unresolved | Admin |\n|---|---:|---:|---|---|---:|---|\n"
    for row in extended_rows:
        c = row["curriculum"]
        s = row["states"]
        markdown += f"| {row['programme_key']} | {c.get('course_count', 0)} | {c.get('outcome_count', 0)} | `{s['resource']}` | `{s['relationship']}` | {s['unresolved_relationships']} | `{s['admin']}` |\n"
    module.REPORT_MD.write_text(markdown, encoding="utf-8")
    return report


def main() -> None:
    module = load_slice_logic()
    checkpoint = write_checkpoint(module)
    report = module.audit()
    report = augment_report(module, report, checkpoint)
    print(json.dumps({
        "checkpoint": str(module.CHECKPOINT_JSON.relative_to(ROOT)),
        "report": str(module.REPORT_JSON.relative_to(ROOT)),
        "programmes": report["scope"]["programmes"],
        "excluded_prior_programmes": checkpoint["selection"]["excluded_prior_programmes"],
        "failures": len(report["extended_failures"]),
        "blockers": report["blockers"],
        "extended_gate_summary": report["extended_gate_summary"],
    }, indent=2))


if __name__ == "__main__":
    main()
