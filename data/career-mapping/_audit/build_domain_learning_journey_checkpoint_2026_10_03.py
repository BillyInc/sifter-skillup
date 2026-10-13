"""Build a read-only evidence-coverage checkpoint for domain learning paths."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
OUT_JSON = CAREER / "_audit" / "domain_learning_journey_evidence_checkpoint_2026-10-03.json"
OUT_MD = CAREER / "_audit" / "DOMAIN_LEARNING_JOURNEY_EVIDENCE_CHECKPOINT_2026-10-03.md"
sys.path.insert(0, str(CAREER))

import _build_contextual_guidance_items as builder  # noqa: E402


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def run() -> dict:
    meta = load_json(CAREER / "domain_meta.json")
    provenance = load_json(CAREER / "domain_skill_provenance.json")
    audit = load_json(CAREER / "domain_skill_competency_certification_audit.json")
    tools = load_json(CAREER / "domain_tools.json")
    generated = builder.build()
    domain_items = [row for row in generated if row["context_level"] == "domain"]
    item_by_domain: dict[str, list[dict]] = {}
    for row in domain_items:
        item_by_domain.setdefault(row["context_key"], []).append(row)
    audit_by_id = {row.get("domain_id"): row for row in audit.get("domains", [])}

    domains = []
    for domain_id, record in sorted(meta.items()):
        if record.get("excluded"):
            continue
        foundations = (provenance.get(domain_id) or {}).get("foundation_skills") or {}
        counts = Counter(
            clean_owner(item)
            for item in foundations.values()
            if isinstance(item, dict)
        )
        candidates = audit_by_id.get(domain_id) or {}
        domain_tools = tools.get(domain_id) or {}
        tool_rows = [
            item
            for key in ("distinctive_tools", "common_tools")
            for item in (domain_tools.get(key) or [])
            if isinstance(item, dict)
        ]
        visible = item_by_domain.get(domain_id) or []
        domains.append({
            "domain_id": domain_id,
            "domain_name": record.get("domain_name"),
            "domain_foundation_records": counts["domain"],
            "role_aggregated_foundation_records": counts["role_aggregated"],
            "generated_student_items": len(visible),
            "generated_categories": dict(Counter(item["item_type"] for item in visible)),
            "generated_learning_links": sum(item["link_state"] == "linked" for item in visible),
            "generated_items_without_learning_link": sum(item["link_state"] != "linked" for item in visible),
            "named_credential_candidates_not_yet_reviewed": len(candidates.get("current_domain_certifications") or []),
            "domain_tool_candidates_role_aggregated_or_unverified": len(tool_rows),
            "source_ids": sorted({
                source
                for item in foundations.values()
                if isinstance(item, dict) and item.get("ownership") == "domain"
                for source in (item.get("sources") or [])
            }),
        })

    domain_owner_total = sum(row["domain_foundation_records"] for row in domains)
    role_aggregate_total = sum(row["role_aggregated_foundation_records"] for row in domains)
    generated_total = sum(row["generated_student_items"] for row in domains)
    generated_linked = sum(row["generated_learning_links"] for row in domains)
    credential_candidates = sum(row["named_credential_candidates_not_yet_reviewed"] for row in domains)
    tool_candidates = sum(row["domain_tool_candidates_role_aggregated_or_unverified"] for row in domains)
    return {
        "as_of": "2026-10-03",
        "scope": "All active domain-owned student learning-path records; taxonomy files are read-only inputs.",
        "active_domain_count": len(domains),
        "summary": {
            "approved_domain_owned_foundation_records_in_source_ledger": domain_owner_total,
            "role_aggregated_foundation_records_not_eligible_as_domain_requirements": role_aggregate_total,
            "domain_student_items_emitted_by_current_builder": generated_total,
            "emitted_items_with_item_learning_link": generated_linked,
            "named_credential_candidates_without_item_specific_review": credential_candidates,
            "domain_tool_candidates_requiring_ownership_and_use_case_review": tool_candidates,
            "active_domains_with_no_generated_domain_owned_items": sum(not row["generated_student_items"] for row in domains),
        },
        "method": [
            "Counts are deterministic local scans of the checked-in evidence and current builder output.",
            "A source-backed skill-taxonomy reference is not counted as a student learning link.",
            "Role-frequency tools are counted as candidates only; they are not validated as domain-owned requirements.",
            "Credential names remain candidates unless an exact domain-plus-credential source record is reviewed and linked.",
        ],
        "domains": domains,
    }


def clean_owner(item: dict) -> str:
    value = str(item.get("ownership") or "unclassified")
    return value if value in {"domain", "role_aggregated"} else "unclassified"


def render(report: dict) -> str:
    summary = report["summary"]
    lines = [
        "# Domain learning-journey evidence checkpoint — 2026-10-03",
        "",
        "This is a progress checkpoint, not a sign-off. The existing catalogue is treated as unverified input. It does not audit subgroup/role taxonomy fit, and it does not regenerate seeds or apply SQL.",
        "",
        f"- Active domains scanned: **{report['active_domain_count']}**",
        f"- Explicit domain-owned foundation records currently approved in the source ledger: **{summary['approved_domain_owned_foundation_records_in_source_ledger']}**",
        f"- Role-aggregated foundation records excluded from domain requirements: **{summary['role_aggregated_foundation_records_not_eligible_as_domain_requirements']:,}**",
        f"- Domain student items emitted by the corrected builder: **{summary['domain_student_items_emitted_by_current_builder']}**",
        f"- Of those, item-specific learning links: **{summary['emitted_items_with_item_learning_link']}**",
        f"- Active domains with no generated domain-owned items: **{summary['active_domains_with_no_generated_domain_owned_items']}**",
        f"- Unreviewed named credential candidates: **{summary['named_credential_candidates_without_item_specific_review']}**",
        f"- Domain tool candidates still needing ownership/use-case review: **{summary['domain_tool_candidates_requiring_ownership_and_use_case_review']}**",
        "",
        "## Work completed in this tranche",
        "",
        "- Removed the builder’s arbitrary ‘first three skills + first three competencies’ domain promotion and list-order prerequisite edges.",
        "- Domain-owned foundation candidates now require an approved, source-backed domain ownership record and a resolvable source reference.",
        "- Domain foundations are not presented as a ranked sequence until a source supports the order or relationship.",
        "- Domain credential candidates now require an exact domain-and-credential source review before student-context emission; a broad domain source is insufficient.",
        "- Added tests for ownership, source references, credential evidence, and fabricated ordering.",
        "",
        "## Still required for the intended learner journey",
        "",
        "This tranche does **not** yet provide the requested complete journey. The source search and structured enrichment must establish, for every active domain and downstream path: the learning stages, why each item matters, the category (skill / competency / tool / certification), whether it is needed or useful/optional, which items work together or build on others, and an authoritative item-specific learning source. The current 136 approved foundation rows span only a subset of domains, and 135 currently have no item-specific learning link. No default priority, popularity count, skill name, or legacy category is proof of a student requirement.",
        "",
        "The exact per-domain coverage queue is in the accompanying JSON. This should be enriched by domain in source-backed batches, then joined to each JAMB programme through its verified CCMAS/external scope. Do not promote the current item list as complete or actionable until that reconciliation and display audit passes.",
        "",
        "## Authoritative source checks started",
        "",
        "- Computer-science curriculum structure: ACM/IEEE-CS/AAAI CS2023 identifies knowledge areas and core/recommended topics; it is curriculum guidance, not a universal job checklist: https://csed.acm.org/ and https://csed.acm.org/knowledge-areas/.",
        "- Quantitative-finance learning example: CFA Institute’s official Practical Skills Modules describe Python fundamentals, financial modeling, Python/data science/AI, and portfolio construction, with stated prerequisites and practical outputs: https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules and https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules/python-data-science-and-ai.",
        "- Automated-driving example: SAE J3016 defines driving-automation levels as a system taxonomy; it does not prescribe a student sequence: https://www.sae.org/standards/content/j3016_201609/.",
        "- Standards boundary: ISO 26262 is a functional-safety standard, not a personal certification: https://www.iso.org/standard/68384.html.",
        "- Platform boundary: NVIDIA describes TensorRT as NVIDIA/CUDA-based inference tooling; it is an optional platform route, not a universal autonomy prerequisite: https://developer.nvidia.com/tensorrt.",
        "- Simulation/project context: CARLA documents simulated driving scenarios, sensors, traffic, and Python/C++ APIs: https://carla.readthedocs.io/en/latest/start_introduction/ and https://carla.readthedocs.io/en/latest/adv_agents/.",
        "- These sources validate examples and the evidence method; they do not close the all-domain external-source audit.",
        "",
        "## Per-domain deterministic coverage",
        "",
        "| Domain | Approved domain foundations | Role-aggregated foundations excluded | Generated items | Learning links | Credential candidates | Tool candidates |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for domain in report["domains"]:
        lines.append(
            f"| {domain['domain_id']} {domain['domain_name']} | {domain['domain_foundation_records']} | {domain['role_aggregated_foundation_records']} | {domain['generated_student_items']} | {domain['generated_learning_links']} | {domain['named_credential_candidates_not_yet_reviewed']} | {domain['domain_tool_candidates_role_aggregated_or_unverified']} |"
        )
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    result = run()
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render(result), encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
