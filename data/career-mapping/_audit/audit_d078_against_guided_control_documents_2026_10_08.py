"""Audit the D078 implementation against every controlling guided-experience artifact."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SPEC = ROOT / "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md"
PLAN = ROOT / "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md"
OVERVIEW = ROOT / "docs/manual-review/D078_DOMAIN_OVERVIEW_AND_LEARNING_PATH_REVIEW_2026_10_08.md"
DEEP_MD = ROOT / "docs/manual-review/D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md"
RECON_MD = ROOT / "docs/manual-review/D078_LEARNING_PATH_RECONCILIATION_2026_10_08.md"
INVENTORY = ROOT / "data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json"
DEEP_JSON = ROOT / "data/career-mapping/_audit/d078_skills_methods_deep_search_checkpoint_2026_10_08.json"
RECON_JSON = ROOT / "data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json"
CONTRACT_JSON = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
DOMAIN_GUIDANCE = ROOT / "data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json"
SCREEN = ROOT / "src/screens/careerIntelligence/DomainDetailScreen.tsx"
FOUNDATION = ROOT / "src/components/careerIntelligence/FoundationSkillsBlock.tsx"
TOOLS = ROOT / "src/components/careerIntelligence/ToolGroupsBlock.tsx"
CERTS = ROOT / "src/components/careerIntelligence/CertPlacementList.tsx"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_guided_control_document_audit_2026_10_08.json"
OUT_MD = ROOT / "docs/manual-review/D078_GUIDED_CONTROL_DOCUMENT_AUDIT_2026_10_08.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def load(path: Path) -> dict[str, Any]:
    return json.loads(read(path))


def marker_check(text: str, markers: list[str]) -> dict[str, Any]:
    missing = [marker for marker in markers if marker not in text]
    return {"required": len(markers), "present": len(markers) - len(missing), "missing": missing, "passed": not missing}


def main() -> None:
    spec = read(SPEC)
    plan = read(PLAN)
    overview = read(OVERVIEW)
    deep_md = read(DEEP_MD)
    recon_md = read(RECON_MD)
    inventory = load(INVENTORY)
    deep = load(DEEP_JSON)
    reconciliation = load(RECON_JSON)
    contract = load(CONTRACT_JSON)
    guidance = load(DOMAIN_GUIDANCE)

    spec_check = marker_check(spec, [
        "### 1. Programme and curriculum", "### 2. Programme-to-domain choice", "### 3. Domain overview and foundation",
        "### 4. Area of specialization / practice", "### 5. Role", "### Claim-level evidence at every display checkpoint",
        "### Catalogue-wide, context-specific enrichment search", "## Selection and downstream/report behavior",
    ])
    plan_check = marker_check(plan, [
        "1. **Programme overview:**", "2. **Pre-domain entry:**", "3. **Domain overview:**",
        "domain learning path", "inventory", "source-to-theme/outcome/resource audit", "selection",
        "complete end-to-end rendered approval of the preceding layer", "one integrated verification",
    ])
    overview_check = marker_check(overview, [
        "### What the domain studies", "### Global context", "### Nigerian context", "### Entry expectations", "### Opportunities and constraints",
        "Proposed domain learning path", "Candidate inventory and disposition", "Evidence and instructional-link register",
    ])
    deep_check = marker_check(deep_md, ["Deep-search totals", "Decision table", "Findings and corrections", "Source register", "student display"])
    reconciliation_check = marker_check(recon_md, ["Foundation additions", "Conditional and specialist routes", "Named tools and computational options", "Visibility and implementation gate"])

    contract_records = contract.get("existing_inventory", []) + contract.get("foundation_and_route_additions", []) + contract.get("route_alternatives", []) + contract.get("deep_search_options", [])
    contract_item_ids = {str(row.get("id")) for row in contract_records if row.get("id")}
    nigerian_examples = contract.get("nigerian_context_examples", [])
    nigerian_context_check = {
        "example_count": len(nigerian_examples),
        "examples_with_https_source": sum(str(row.get("url", "")).startswith("https://") for row in nigerian_examples),
        "examples_with_locator": sum(bool(row.get("locator")) for row in nigerian_examples),
        "examples_with_limits": sum(bool(row.get("limitations")) for row in nigerian_examples),
        "unresolved_domain_item_targets": sorted({target for row in nigerian_examples for target in row.get("related_domain_item_ids", []) if target not in contract_item_ids}),
        "all_examples_explicitly_nigerian": all("Nigeri" in str(row.get("title", "")) or "Nigeria" in str(row.get("publisher", "")) or "Nigeria" in str(row.get("url", "")) or "NBS" in str(row.get("publisher", "")) for row in nigerian_examples),
    }
    nigerian_context_check["passed"] = (
        nigerian_context_check["example_count"] >= 1
        and nigerian_context_check["examples_with_https_source"] == nigerian_context_check["example_count"]
        and nigerian_context_check["examples_with_locator"] == nigerian_context_check["example_count"]
        and nigerian_context_check["examples_with_limits"] == nigerian_context_check["example_count"]
        and not nigerian_context_check["unresolved_domain_item_targets"]
        and nigerian_context_check["all_examples_explicitly_nigerian"]
    )
    contract_check = {
        "record_count": len(contract_records),
        "missing_meaning": sum(not row.get("meaning") for row in contract_records),
        "missing_output": sum(not row.get("output") for row in contract_records),
        "missing_evidence": sum(not row.get("evidence") for row in contract_records),
        "missing_relationships": sum(not row.get("relationships") for row in contract_records),
        "missing_limits": sum(not row.get("limits") for row in contract_records),
        "missing_learning_links": sum(not row.get("learning_links") for row in contract_records),
        "missing_item_definition_sources": sum(not row.get("item_definition_sources") for row in contract_records),
        "missing_checkpoint_fit_sources": sum(not row.get("checkpoint_fit_sources") for row in contract_records),
        "missing_explanatory_sources": sum(not row.get("explanatory_sources") for row in contract_records),
        "records_without_verified_task_specific_free_learning_resource": sum(row.get("link_role_audit", {}).get("free_task_specific_learning_resource") != "verified" for row in contract_records),
        "records_with_unadjudicated_claims": sum(row.get("claim_evidence_status") != "verified_for_checkpoint" for row in contract_records),
        "records_with_pending_area_or_role_context": sum("pending" in str(row.get("checkpoint_context", {})) for row in contract_records),
        "records_without_active_research_disposition": sum(row.get("research_disposition") not in {
            "in_progress", "supported", "unsupported", "not_established", "excluded",
        } for row in contract_records),
        "unsupported_without_exhaustive_search": sum(
            row.get("research_disposition") in {"unsupported", "not_established", "excluded"}
            and row.get("exhaustive_search_status") != "complete"
            for row in contract_records
        ),
        "confirmed_for_display_with_open_claim_gate": sum(
            row.get("student_display_status") == "confirmed"
            and row.get("claim_evidence_status") != "verified_for_checkpoint"
            for row in contract_records
        ),
    }
    contract_check["passed"] = not any(contract_check[key] for key in (
        "missing_meaning", "missing_output", "missing_evidence", "missing_relationships", "missing_limits",
        "missing_learning_links", "missing_item_definition_sources", "missing_checkpoint_fit_sources",
        "missing_explanatory_sources", "records_without_verified_task_specific_free_learning_resource",
        "records_with_unadjudicated_claims", "records_with_pending_area_or_role_context",
        "records_without_active_research_disposition", "unsupported_without_exhaustive_search",
        "confirmed_for_display_with_open_claim_gate",
    ))
    source_role_gap_queue = []
    for row in contract_records:
        link_audit = row.get("link_role_audit", {})
        missing = []
        for field, label in (
            ("item_definition_sources", "authoritative item/task source"),
            ("checkpoint_fit_sources", "checkpoint-fit evidence"),
            ("explanatory_sources", "independent plain-language explanation"),
        ):
            if not row.get(field):
                missing.append(label)
        if link_audit.get("free_task_specific_learning_resource") != "verified":
            missing.append("verified free task-specific learning resource")
        if row.get("claim_evidence_status") != "verified_for_checkpoint":
            missing.append("claim and exact-locator review")
        context = row.get("checkpoint_context", {})
        if "pending" in str(context):
            missing.append("area/role task-context reconciliation")
        if missing:
            source_role_gap_queue.append({"item_id": row.get("id"), "label": row.get("label"), "missing": missing})

    ui_sources = {"screen": read(SCREEN), "foundation_component": read(FOUNDATION), "tool_component": read(TOOLS), "certification_component": read(CERTS)}
    ui_check = {
        "screen_has_foundation_selection_calls": len(re.findall(r"<FoundationSkillsBlock[\s\S]*?learningFocus", ui_sources["screen"])) >= 2,
        "screen_has_contextual_item_selection_calls": len(re.findall(r"<ContextualItemList[\s\S]*?learningFocus", ui_sources["screen"])) >= 2,
        "screen_has_tool_selection_calls": len(re.findall(r"<ToolGroupsBlock[\s\S]*?learningFocus", ui_sources["screen"])) >= 2,
        "screen_has_certification_selection_calls": len(re.findall(r"<CertPlacementList[\s\S]*?learningFocus", ui_sources["screen"])) >= 2,
        "foundation_renders_learning_focus_button": "GuidanceReportButton" in ui_sources["foundation_component"] and 'kind: "learningFocus"' in ui_sources["foundation_component"],
        "tool_renders_learning_focus_button": "GuidanceReportButton" in ui_sources["tool_component"] and 'kind: "learningFocus"' in ui_sources["tool_component"],
        "certification_renders_learning_focus_button": "GuidanceReportButton" in ui_sources["certification_component"] and 'kind: "learningFocus"' in ui_sources["certification_component"],
    }
    ui_check["passed"] = all(ui_check.values())

    overview_data = inventory.get("overview_and_context", {})
    domain_overview_gate = {
        "narration_present": bool(overview_data.get("learner_narration_candidate")),
        "global_sources_present": bool(overview_data.get("source_backing")),
        "nigeria_narration_present": bool(overview_data.get("nigeria_context_candidate")),
        "nigeria_sources_present": bool(overview_data.get("nigeria_evidence")),
        "entry_expectations_explicitly_limited": str(overview_data.get("entry_expectations", "")).startswith("No universal"),
        "opportunity_claims_limited": str(overview_data.get("opportunities_constraints", "")).startswith("No broad"),
        "orientation_gate_is_not_passed_until_review": "Not passed" in str(overview_data.get("orientation_gate", "")),
    }
    # The controlling documents require this gate to remain closed until the
    # programme and pre-domain layers are accepted.  A true value here is
    # therefore the correct audit state, not a failure condition.
    domain_overview_gate["passed"] = all(domain_overview_gate.values())

    result = {
        "schema_version": "2026-10-08.d078.guided-control-document-audit.v1",
        "reviewed_on": "2026-10-09",
        "domain_id": "D078",
        "status": "local_audit_not_student_approval",
        "controlling_documents": {
            "specification": {"path": str(SPEC.relative_to(ROOT)), **spec_check},
            "implementation_plan": {"path": str(PLAN.relative_to(ROOT)), **plan_check},
            "domain_overview_learning_path_review": {"path": str(OVERVIEW.relative_to(ROOT)), **overview_check},
            "deep_search_checkpoint": {"path": str(DEEP_MD.relative_to(ROOT)), "json_items": len(deep.get("items", [])), **deep_check},
            "merged_learning_path_reconciliation": {"path": str(RECON_MD.relative_to(ROOT)), "json_existing": len(reconciliation.get("existing_inventory", [])), "json_new": len(reconciliation.get("new_concept_additions", [])), "json_routes": len(reconciliation.get("route_extensions_or_alternatives", [])), **reconciliation_check},
        },
        "domain_overview_gate": domain_overview_gate,
        "domain_learning_contract": {"path": str(CONTRACT_JSON.relative_to(ROOT)), "counts": contract.get("counts"), "source_role_gap_queue": source_role_gap_queue, "nigerian_context_check": nigerian_context_check, **contract_check},
        "selection_layer": ui_check,
        "existing_guidance_state": {"approved_item": guidance.get("item", {}).get("item_key"), "approved_item_claim_state": guidance.get("item", {}).get("claim_review_state"), "path_targets": len(guidance.get("path_targets", []))},
        "decision": {"contract_package_is_complete_for_review": contract_check["passed"], "selection_layer_is_wired": ui_check["passed"], "domain_learning_is_student_ready": False, "reason": "The package builder preserves gaps rather than inventing claims or substituting evidence links for instruction. All item claims, checkpoint links, explanatory sources, task-specific free resources, and downstream area/role contexts must be resolved or explicitly documented as unresolvable after exhaustive search; orientation and claim/link approval gates also remain open."},
    }
    OUT_JSON.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D078 guided control-document audit — 2026-10-08", "", "**Status:** Local audit only; no student approval, canonical promotion or live SQL.", "",
        "This audit compares the local domain implementation against the guided-experience specification, implementation plan, D078 overview/learning-path review, deep-search checkpoint and merged reconciliation. It also checks the selection controls that make domain items selectable without treating selection as mastery.", "",
        "## Results", "",
        f"- Guided contract package: **{'PASS' if contract_check['passed'] else 'FAIL'}** ({contract_check['record_count']} generated candidate records checked).",
        f"- Selection layer: **{'PASS' if ui_check['passed'] else 'FAIL'}** (foundation skills, contextual skills/competencies, tools and certifications checked across the domain screen).",
        f"- Domain overview gate: **{'PASS' if domain_overview_gate['passed'] else 'NOT PASSED'}**. The D078 source material is present and bounded, but the review explicitly keeps this gate closed until the programme and pre-domain entry layers are accepted.",
        f"- Deep-search checkpoint: **{len(deep.get('items', []))}** named options retained as route candidates, not domain-wide requirements.",
        f"- Merged reconciliation: **{len(reconciliation.get('existing_inventory', []))}** existing records, **{len(reconciliation.get('new_concept_additions', []))}** new concepts and **{len(reconciliation.get('route_extensions_or_alternatives', []))}** route alternatives.",
        f"- Nigerian domain-learning context: **{'PASS' if nigerian_context_check['passed'] else 'FAIL'}** ({nigerian_context_check['example_count']} bounded examples, each with a source, locator, limitations, and resolvable domain-item links).",
        f"- Source-role gap queue: **{len(source_role_gap_queue)} of {len(contract_records)}** items still need one or more distinct source roles, claim/locator review, or downstream task-context reconciliation.",
        "",
        "## Interpretation", "",
        "This is not a passing content audit. The current contract includes audit slots for source roles and checkpoint context, but these remain open until sources are individually checked. Missing evidence, relationships, limits, task-specific learning links, and area/role uses must be filled from a relevant source after the full search, or left explicitly in progress; none may be filled with plausible defaults. A candidate must not be called unsupported or excluded before an exhaustive, documented search. Student guidance remains unconfirmed until the claim, checkpoint and learning-link gates pass.",
        "",
        "## Machine-readable record", "",
        f"`{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"audit": str(OUT_JSON), "report": str(OUT_MD), "decision": result["decision"]}, indent=2))


if __name__ == "__main__":
    main()
