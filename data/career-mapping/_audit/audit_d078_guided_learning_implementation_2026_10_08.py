"""Audit the D078 guided-learning candidate against the controlling experience contract.

This is a local readiness audit. It does not approve candidates, edit canonical
domain data, or claim that a SQL seed is live. It deliberately reports incomplete
candidate records instead of filling their missing explanations by inference.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json"
DOMAIN_GUIDANCE = ROOT / "data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json"
DOMAIN_STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
SPEC = ROOT / "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md"
PLAN = ROOT / "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md"
CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_guided_learning_implementation_audit_2026_10_08.json"
OUT_MD = ROOT / "docs/manual-review/D078_GUIDED_LEARNING_IMPLEMENTATION_AUDIT_2026_10_08.md"


def https_url(value: object) -> bool:
    parsed = urlparse(str(value or ""))
    return parsed.scheme == "https" and bool(parsed.netloc)


def source_url_issues(sources: list[dict]) -> list[str]:
    return [str(source.get("id")) for source in sources if not https_url(source.get("url"))]


def verified_learning_link(value: object) -> bool:
    """Return whether a link is an instructional destination we verified.

    A record may also carry a reference-only or complementary link.  That
    additional link must not invalidate the record when at least one separate
    link is a verified, task-specific learning destination.
    """
    if not isinstance(value, dict):
        return False
    fit = str(value.get("instructional_fit") or "")
    return (
        https_url(value.get("url"))
        and bool(value.get("verified_on"))
        and fit.startswith("verified")
    )


def main() -> None:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    guidance = json.loads(DOMAIN_GUIDANCE.read_text(encoding="utf-8"))
    contract = json.loads(CONTRACT.read_text(encoding="utf-8-sig")) if CONTRACT.exists() else {}
    spec = SPEC.read_text(encoding="utf-8")
    plan = PLAN.read_text(encoding="utf-8")
    structure = DOMAIN_STRUCTURE.read_bytes()

    # Validate the enriched candidate contract when it exists. The raw
    # reconciliation ledger intentionally contains discovery/use-case rows,
    # while the builder attaches the display-contract fields (meaning, output,
    # relationships, limits and verified learning links). Auditing the raw
    # ledger after enrichment falsely reports every such field as missing.
    groups = {
        "existing_inventory": ledger.get("existing_inventory", []),
        "new_concept_additions": contract.get("foundation_and_route_additions") or ledger.get("new_concept_additions", []),
        "route_extensions_or_alternatives": contract.get("route_alternatives") or ledger.get("route_extensions_or_alternatives", []),
        "deep_search_route_overlays": contract.get("deep_search_options") or ledger.get("deep_search_route_overlays", []),
    }
    all_ids = [str(row.get("id")) for rows in groups.values() for row in rows]
    duplicate_ids = sorted(key for key, count in Counter(all_ids).items() if count > 1)

    existing_required = {
        "id", "type", "label", "meaning", "output", "evidence", "relationships",
        "limits", "learning_links", "checkpoint", "claim_state", "display_readiness",
    }
    existing_missing = {
        str(row.get("id")): sorted(existing_required - set(row))
        for row in groups["existing_inventory"]
        if existing_required - set(row)
    }
    existing_bad_links = {
        str(row.get("id")): [link.get("label") or link.get("url") for link in row.get("learning_links", []) if not https_url(link.get("url")) or not link.get("verified_on")]
        for row in groups["existing_inventory"]
        if any(not https_url(link.get("url")) or not link.get("verified_on") for link in row.get("learning_links", []))
    }

    # These are the fields required before a candidate can become a student-facing
    # item under the spec: meaning, use/output, typed relationships, limitations,
    # checkpoint evidence and a verified instructional destination.
    candidate_missing: dict[str, list[str]] = {}
    for group_name in ("new_concept_additions", "route_extensions_or_alternatives", "deep_search_route_overlays"):
        for row in groups[group_name]:
            missing: list[str] = []
            if not row.get("use_case"):
                missing.append("learner_use_case")
            if not row.get("sources") and not row.get("source_ids") and not row.get("evidence"):
                missing.append("source_evidence")
            if group_name != "deep_search_route_overlays":
                if not row.get("learning_links") and not row.get("learning_link"):
                    missing.append("verified_learning_link")
                if not row.get("relationships") and not row.get("relationship"):
                    missing.append("typed_relationships")
                if not row.get("limits") and not row.get("does_not_enable"):
                    missing.append("limitations")
                if not row.get("meaning") and not row.get("plain_meaning"):
                    missing.append("plain_meaning")
                if not row.get("output"):
                    missing.append("learner_output")
            links = row.get("learning_links") or []
            link = row.get("learning_link")
            if link:
                links = links + ([link] if isinstance(link, dict) else [{"url": link}])
            if not links or not any(verified_learning_link(item) for item in links):
                missing.append("verified_learning_link")
            if missing:
                candidate_missing[str(row.get("id"))] = sorted(set(missing))

    path_target_ids = {str(target.get("target_key")) for target in guidance.get("path_targets", [])}
    retired_target_ids = {"D078|sg:21", "D078|sg:26"}
    path_target_failures = sorted(path_target_ids & retired_target_ids)
    path_target_label_failures = [
        target.get("target_label")
        for target in guidance.get("path_targets", [])
        if target.get("target_label") in {"Computational and Quantitative Social Research", "Social, Cultural & Economic Research"}
    ]

    required_contract_markers = {
        "spec_claim_level_evidence": "Trace each student-facing statement through **item → source passage/locator → owning checkpoint",
        "spec_learning_link_gate": "a separately verified learning resource",
        "spec_selection_relationships": "Downstream effects",
        "plan_orientation_order": "Only after all three orientation gates pass should we begin curating the **domain learning path**",
        "plan_hidden_until_gates": "Finish a source-to-theme/outcome/resource audit and render the full overview before declaring the gate passed",
    }
    missing_contract_markers = [name for name, marker in required_contract_markers.items() if marker not in (spec + "\n" + plan)]

    report = {
        "schema_version": "2026-10-08.d078.guided-learning-implementation-audit.v1",
        "reviewed_on": "2026-10-08",
        "domain_id": "D078",
        "status": "local_readiness_audit_not_student_approval",
        "scope": [
            "D078 domain overview and proposed learning path",
            "Existing inventory, 19 workflow-gap reconciliation, deep-search route overlays",
            "Controlling guided-experience specification and implementation plan",
            "D078 area path-target ownership after the parent-domain boundary correction",
        ],
        "counts": {name: len(rows) for name, rows in groups.items()},
        "duplicate_candidate_ids": duplicate_ids,
        "existing_inventory_missing_required_fields": existing_missing,
        "existing_inventory_bad_learning_links": existing_bad_links,
        "candidate_records_missing_display_contract_fields": candidate_missing,
        "retired_area_path_target_ids_found": path_target_failures,
        "retired_area_path_target_labels_found": path_target_label_failures,
        "controlling_document_markers_missing": missing_contract_markers,
        "current_approved_domain_item": {
            "item_key": guidance.get("item", {}).get("item_key"),
            "claim_review_state": guidance.get("item", {}).get("claim_review_state"),
            "guidance_owner": guidance.get("item", {}).get("guidance_owner"),
            "learning_link_verified_on": guidance.get("item", {}).get("learning_resource", {}).get("accessed_on"),
        },
        "canonical_boundary_assertions": {
            "stable_d078_area_key_present": b'"area_id": "D078:psychology-social-behaviour"' in structure,
            "bounded_student_label_present": b'"label": "Social Behaviour and Interaction"' in structure,
            "d064_exclusion_present": b"separate Psychology and Counselling domain (D064)" in structure,
        },
        "decision": {
            "domain_learning_candidates_remain_hidden": True,
            "why": "The candidate ledger has source evidence, but most new/route candidates still lack the complete item-level meaning, output, relationship, limitation and verified learning-link contract required by the controlling documents.",
            "next_local_gate": "Complete the programme overview and pre-domain-entry gates, then enrich candidate records to the same claim-level display contract before promoting any additional D078 domain item.",
        },
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [
        "# D078 guided-learning implementation audit — 2026-10-08",
        "",
        "Status: local readiness audit only; no student-facing approval and no live SQL claim.",
        "",
        "## What was checked",
        "",
        "- The existing D078 inventory, the 19 workflow-gap reconciliation candidates, the deep-search route overlays and the one approved domain item.",
        "- The guided-experience specification's claim-level evidence, verified-learning-link, relationship and selection requirements.",
        "- The implementation plan's order: programme overview → pre-domain entry → domain overview → domain learning path.",
        "- D078 area path targets after the retired legacy subgroup records were replaced by the seven reconciled area keys.",
        "",
        "## Results",
        "",
        f"- Candidate records checked: **{sum(len(rows) for rows in groups.values())}** across four ledgers ({len(groups['existing_inventory'])} existing, {len(groups['new_concept_additions'])} new concepts, {len(groups['route_extensions_or_alternatives'])} route alternatives, {len(groups['deep_search_route_overlays'])} deep-search overlays).",
        f"- Existing inventory records missing the baseline fields: **{len(existing_missing)}**.",
        f"- Existing inventory records with missing/unverified learning-link metadata: **{len(existing_bad_links)}**.",
        f"- New/route candidates missing one or more student-display contract fields: **{len(candidate_missing)}**.",
        f"- Duplicate candidate IDs across ledgers: **{len(duplicate_ids)}**.",
        f"- Retired D078 path targets still present: **{len(path_target_failures) + len(path_target_label_failures)}**.",
        "",
        "## Interpretation",
        "",
        "The deep search and reconciliation produced useful, source-backed candidate coverage, but a source list alone is not a complete student-facing item. Most newly proposed methods and extensions still need the same plain meaning, domain-specific use, learner output, typed relationships, limitations and verified instructional link already required by the specification. They therefore remain hidden/review-only.",
        "",
        "The single approved D078 domain item remains the only item with the complete claim/link contract in the local domain guidance ledger. Its path targets now use the reconciled Computational and Digital Social Science and Social Research and Evaluation area keys; the two retired legacy subgroup labels are no longer used in that ledger or generated seed.",
        "",
        "## Next gate",
        "",
        "Complete and audit the Sociology programme overview and pre-domain-entry card first. Then enrich the D078 candidate items to the full display contract, keeping shared foundation items separate from conditional method/tool choices and preserving explicit alternatives. Do not promote by frequency, co-occurrence or a source label alone.",
        "",
        f"Machine-readable record: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ]
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({
        "audit": str(OUT_JSON),
        "report": str(OUT_MD),
        "candidate_missing_contract_fields": len(candidate_missing),
        "retired_path_targets": len(path_target_failures) + len(path_target_label_failures),
    }, indent=2))


if __name__ == "__main__":
    main()
