"""Process the first five grouped role -> area/direct-route residual batches.

This is a bounded review artifact generator.  It does not edit canonical role
files, domain structure, area-source reconciliation, or the conditional lane.
It records a supported disposition only when the stored role-task evidence has
an auditable, distinctive match to one current area boundary and the parent
domain is independently supported in the queue.  Title text and ISCO/ESCO or
existing area membership are never used as fit evidence.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "GROUPED_ROLE_REVIEW_QUEUES_2026_10_07" / "role_area_direct_route_residual"
OUT = ROOT / "data" / "career-mapping" / "_audit" / "role_review_agents" / "area_batch_001_005"
BATCH_NUMBERS = tuple(range(1, 6))

# These are generic words which cannot distinguish neighbouring areas.  They
# remain available in the raw task text, but do not contribute to a supported
# area decision.
STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "for", "with", "by", "from",
    "as", "is", "are", "be", "this", "that", "their", "its", "on", "at", "into",
    "across", "through", "within", "role", "work", "working", "general", "provide",
    "provides", "supports", "source", "current", "domain", "area", "operations",
    "operation", "services", "service", "system", "systems", "management", "manager",
    "specialist", "technician", "professional", "task", "tasks", "use", "used", "using",
    "may", "can", "will", "should", "including", "other", "such", "also", "ensure",
}
GENERIC = {
    "management", "operations", "services", "production", "development", "engineering",
    "design", "analysis", "research", "practice", "care", "health", "safety", "business",
    "financial", "processing", "planning", "technology", "technical", "program", "programmes",
    "support", "quality", "information", "data", "customer", "sales", "manufacturing",
    "construction", "education", "learning", "social", "policy", "public", "work", "system",
    "systems", "service", "services", "operation", "operations", "process", "processes",
}


# These are explicit task-level adjudications for ambiguous lexical cases in
# the assigned batches.  Each rationale refers to the stored task text, not
# the role title.  The selected key must also exist in that row's candidate
# area list; otherwise the guard leaves the row review_required.
EXPLICIT_AREA_DECISIONS: dict[str, tuple[str, str, tuple[str, ...]]] = {
    "D033|clothing development manager": (
        "D033:product-strategy-and-portfolio-direction",
        "The stored task defines product concepts against target consumers and marketing strategy and leads seasonal product development. That is product strategy and portfolio direction.",
        ("product", "concepts", "strategy"),
    ),
    "D048|fish production operator": (
        "D048:food-processing-preservation-and-packaging",
        "The stored task supervises fish-product manufacturing and applies breading, frying and freezing processes. Those are food-processing and preservation operations, not food-science research.",
        ("fish", "manufacturing", "breading", "frying", "freezing"),
    ),
    "D064|mental health counselors": (
        "D064:counselling-psychology-and-psychotherapy",
        "The stored task counsels individuals and groups on mental health, addiction, family and stress issues. The direct practice is counselling/psychotherapy; health promotion is context, not the primary area.",
        ("counsel", "mental", "family", "stress"),
    ),
    "D066|animal embryo transfer technician": (
        "D066:livestock-poultry-and-aquatic-animal-health-and-production",
        "The stored task supports embryo transfer under veterinary supervision. Embryo transfer is an animal-reproduction and production-system function; it is not laboratory-animal research or wildlife medicine.",
        ("embryo", "transfer", "veterinary"),
    ),
    "D085|call centre agent": (
        "D085:retail-sales-and-customer-experience",
        "The stored task handles customer calls to promote goods/services, obtain sales and arrange sales visits. The documented work is customer-facing sales, not store or merchandising operations.",
        ("customer", "calls", "promote", "sales"),
    ),
    "D098|optical instrument assembler": (
        "D098:precision-instruments-and-optical-devices",
        "The stored task assembles lenses and optical instruments and processes optical glass. The task is precision optical-device manufacture, not general machining or watchmaking.",
        ("optical", "lenses", "instruments", "glass"),
    ),
    "D134|marine engineer": (
        "D134:marine-engineering-and-ship-systems",
        "The stored task designs, builds, maintains and repairs vessel machinery, engines, pumps, ventilation and generators. These are onboard marine-engineering systems; hull-form design is not the primary task.",
        ("marine", "engines", "pumps", "generator", "vessel"),
    ),
    "D135|nuclear reactor operator": (
        "D135:nuclear-energy-systems-and-reactor-engineering",
        "The stored task directly controls nuclear reactors from plant control panels and manages reactor reactivity and operating changes. That is nuclear-energy reactor operations.",
        ("nuclear", "reactors", "control", "reactivity"),
    ),
    "D141|quantum applications engineer": (
        "D141:quantum-algorithms-and-software",
        "The stored task translates chemistry, logistics and finance problems into quantum-computing use cases and implements quantum solutions. It is application, algorithm and software work, not hardware fabrication or sensing.",
        ("quantum", "computing", "use", "cases", "implements"),
    ),
    "D141|quantum sensing specialist": (
        "D141:quantum-sensing-and-metrology",
        "The stored task applies quantum effects to develop ultra-precise measurement instruments for navigation, imaging and metrology. This directly matches quantum sensing and metrology.",
        ("quantum", "measurement", "instruments", "metrology"),
    ),
    "D139|game environment artist": (
        "D139:game-art-animation-and-visual-development",
        "The stored task creates game-ready environments, props and world assets for visual identity, readability and immersion. Those are game-art and visual-development tasks.",
        ("game", "environments", "props", "visual", "assets"),
    ),
    "D017|automotive engineer": (
        "D017:mechanical-design-and-applied-mechanics",
        "The stored task designs vehicles and mechanical parts, oversees their manufacture and resolves engineering problems. The primary fit is mechanical design and applied mechanics; manufacturing oversight is a related activity.",
        ("vehicles", "mechanical", "parts", "design"),
    ),
    "D018|water engineer": (
        "D018:water-resources-engineering",
        "The stored task develops clean-water, water-treatment and flood-damage methods and designs water infrastructure. That is water-resources engineering.",
        ("water", "treatment", "flood", "infrastructure"),
    ),
    "D026|environmental health officer": (
        "D026:environmental-occupational-and-food-health-protection",
        "The stored task inspects and enforces food-safety, housing, sanitation and environmental-hazard regulations affecting public health. This is environmental and public-health protection.",
        ("food", "sanitation", "environmental", "hazards"),
    ),
    "D022|mine ventilation engineer": (
        "D022:mine-operations-safety-and-closure",
        "The stored task designs and manages underground mine ventilation, fresh-air supply and removal of noxious gases in coordination with mine safety. This is mine operations and safety.",
        ("mine", "ventilation", "underground", "safety", "gases"),
    ),
    "D023|obstetricians and gynecologists": (
        "D023:maternal-and-reproductive-medicine",
        "The stored task provides care for pregnancy and childbirth and treats diseases of the female reproductive system. This directly matches maternal and reproductive medicine.",
        ("pregnancy", "childbirth", "reproductive"),
    ),
    "D023|preventive medicine physicians": (
        "D023:preventive-and-occupational-medicine",
        "The stored task applies preventive medicine and public-health knowledge to reduce disease, injury and disability risk for groups and individuals. This is preventive medicine.",
        ("preventive", "public", "prevention", "risk"),
    ),
    "D070|artistic director": (
        "D070:live-performance-production-and-technical-theatre",
        "The stored task sets artistic direction for a performance organisation or production and guides its creative work. That is live-performance production leadership.",
        ("artistic", "direction", "performance", "production"),
    ),
    "D070|live performance producer": (
        "D070:live-performance-production-and-technical-theatre",
        "The stored task organises people, resources, schedules and delivery for a live performance. That is live-performance production.",
        ("live", "performance", "resources", "schedule"),
    ),
    "D120|aquaculture husbandry technician": (
        "D120:aquaculture-production-and-systems",
        "The stored task manages aquatic-organism production, feeding and stock management. These are aquaculture production and husbandry systems.",
        ("aquaculture", "aquatic", "feeding", "stock"),
    ),
    "D022|exploration geologist": (
        "D022:geoscience-and-mineral-resource-exploration",
        "The stored task prospects for mineral deposits, evaluates their economic viability and manages exploration programmes. That is mineral-resource exploration geoscience.",
        ("mineral", "deposits", "exploration", "prospect"),
    ),
    "D021|landscape architect": (
        "D021:landscape-architecture-and-public-realm-design",
        "The stored task plans and designs gardens and natural spaces and determines their spatial distribution. That directly matches landscape architecture and public-realm design.",
        ("landscape", "gardens", "natural", "spaces", "design"),
    ),
    "D093|building electrician": (
        "D093:building-and-commercial-electrical-installation",
        "The stored task installs and maintains electrical cables and infrastructure in buildings and controls fire hazards. That is building and commercial electrical installation.",
        ("building", "electricity", "cables", "install"),
    ),
    "D100|heating and ventilation service installer": (
        "D100:refrigeration-air-conditioning-and-ventilation",
        "The stored task installs and maintains heating, refrigeration, ducts, vents and controlled-air systems. That is refrigeration, air-conditioning and ventilation practice.",
        ("heating", "refrigeration", "ducts", "vents"),
    ),
    "D122|molecular diagnostic technologist": (
        "D122:molecular-diagnostics-and-medical-genetics",
        "The stored task performs molecular assays, PCR and DNA sequencing to detect genetic and infectious-disease markers. That directly matches molecular diagnostics and medical genetics.",
        ("molecular", "PCR", "DNA", "genetic"),
    ),
    "D090|animal shelter worker": (
        "D090:companion-animal-care-boarding-and-shelter-services",
        "The stored task provides routine animal care in a shelter, receives lost or injured animals, cleans cages and supports adoption. That is companion-animal shelter care.",
        ("animal", "shelter", "adoption", "cages"),
    ),
    "D112|wash deinking operator": (
        "D112:pulp-and-paper-manufacture",
        "The stored task washes recycled paper, removes printing inks and produces pulp slurry. These are pulp-and-paper manufacturing operations.",
        ("paper", "pulp", "deinking", "inks"),
    ),
    "D004|cybersecurity risk manager": (
        "D004:cybersecurity-governance-risk-and-assurance",
        "The stored task identifies, assesses, estimates and mitigates cybersecurity risks in ICT infrastructure and reports the risk controls. That is cybersecurity governance, risk and assurance.",
        ("cybersecurity", "risk", "mitigate", "ICT"),
    ),
    "D128|community development officer": (
        "D128:community-and-social-development",
        "The stored task assesses local-community needs, develops improvement plans, manages resources and communicates with communities. That directly matches community and social development.",
        ("community", "needs", "development", "resources"),
    ),
    "D117|rolling stock engine inspector": (
        "D117:rolling-stock-and-rail-vehicle-systems",
        "The stored task inspects locomotive engines before and after overhaul and casualty events and checks compliance with rail standards. That is rolling-stock and rail-vehicle systems work.",
        ("rolling", "locomotive", "engines", "rail"),
    ),
    "D138|medical device engineering technician": (
        "D138:medical-devices-and-clinical-engineering",
        "The stored task designs, develops, produces and maintains medical-technical equipment such as pacemakers, MRI and X-ray devices. This directly matches medical devices and clinical engineering.",
        ("medical", "devices", "pacemakers", "MRI", "X-ray"),
    ),
}

# These roles have genuine parent-domain evidence, but their stored tasks do
# not identify one of the current neighbouring areas strongly enough.  Keep
# them review_required rather than turning a broad duty into a specific route.
EXPLICIT_AREA_REVIEW_KEYS = {
    "D011|financial trader",                 # trading is not automatically quantitative/systematic
    "D023|hospitalists",                     # inpatient work is broader than critical care
    "D024|licensed practical and licensed vocational nurses",  # broad nursing remit
    "D111|sewing machine operator",          # current area is explicitly a boundary candidate
    "D150|minister of religion",             # ministry is broader than institutional chaplaincy
}


# This is a clear parent-domain mismatch in the assigned queue.  The task is
# clinical nuclear medicine/radiopharmacy, while the current D135 areas are
# nuclear-energy, fuel-cycle and non-medical radiation practice.  It is not
# silently remapped to an area.
EXPLICIT_PARENT_REJECTIONS: dict[str, tuple[str, str, tuple[str, ...]]] = {
    "D135|nuclear medicine technologists": (
        "unsupported",
        "The stored task is clinical nuclear medicine: administering radioisotopes to patients, tracer studies, radiopharmaceutical dosing and blood-volume studies. That does not fit the current D135 nuclear-energy/fuel-cycle/radiation-protection domain scope; do not use the shared word nuclear as proof.",
        ("patients", "radioisotopes", "radiologist", "clinical", "tracer"),
    ),
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: Any) -> str:
    return " ".join(re.findall(r"[a-z0-9+#]+", str(value or "").casefold()))


def tokens(value: Any) -> set[str]:
    return {w for w in re.findall(r"[a-z][a-z0-9+#]+", norm(value)) if len(w) >= 4 and w not in STOPWORDS}


def meaningful(value: Any) -> set[str]:
    return tokens(value) - GENERIC


def source_urls(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, dict):
            item = item.get("url") or item.get("source_url") or ""
        item = str(item or "")
        if item.startswith(("http://", "https://")) and item not in result:
            result.append(item)
    return result


def score_candidate(task: str, candidate: dict[str, Any]) -> dict[str, Any]:
    task_tokens = tokens(task)
    task_meaningful = meaningful(task)
    label_tokens = tokens(candidate.get("label"))
    boundary_tokens = tokens(candidate.get("boundary"))
    label_meaningful = meaningful(candidate.get("label"))
    boundary_meaningful = meaningful(candidate.get("boundary"))
    label_hits = task_tokens & label_tokens
    boundary_hits = task_tokens & boundary_tokens
    meaningful_label_hits = task_meaningful & label_meaningful
    meaningful_boundary_hits = task_meaningful & boundary_meaningful
    score = (
        2 * len(label_hits)
        + len(boundary_hits)
        + 2 * len(meaningful_label_hits)
        + len(meaningful_boundary_hits)
    )
    return {
        "area_key": str(candidate.get("area_key") or ""),
        "label": candidate.get("label"),
        "score": score,
        "label_hits": sorted(label_hits),
        "boundary_hits": sorted(boundary_hits),
        "meaningful_label_hits": sorted(meaningful_label_hits),
        "meaningful_boundary_hits": sorted(meaningful_boundary_hits),
        "area_source_refs": source_urls(candidate.get("source_refs")),
    }


def evaluate_member(member: dict[str, Any]) -> dict[str, Any]:
    role_key = str(member.get("role_key") or "")
    task = str(member.get("role_task_evidence") or "").strip()
    task_refs = source_urls(member.get("task_source_refs"))
    parent_refs = source_urls(member.get("parent_domain_evidence"))
    parent_status = str(member.get("parent_status") or "review_required")
    candidate_scores = sorted((score_candidate(task, c) for c in member.get("candidate_areas") or []), key=lambda x: (-x["score"], x["area_key"]))
    parent_disposition = "review_required"
    parent_reason = "The parent-domain status is not independently supported in the current queue; preserve review_required and do not infer from title or area membership."
    if parent_status == "supported" and task and (task_refs or parent_refs):
        parent_disposition = "supported"
        parent_reason = "The queue records an independently source-backed supported parent-domain disposition, and this row retains the exact role-task evidence and source references."
    elif parent_status == "conditional":
        parent_reason = "The parent-domain evidence is conditional; the role may fit only under the stated work-setting constraint, so the area route remains review_required."

    if role_key in EXPLICIT_PARENT_REJECTIONS:
        status, rationale, terms = EXPLICIT_PARENT_REJECTIONS[role_key]
        return {
            "role_key": role_key,
            "domain_id": member.get("domain_id"),
            "domain_name": member.get("domain_name"),
            "role_title": member.get("role_title"),
            "parent_domain_fit": {"status": status, "rationale": rationale, "evidence_terms": list(terms), "source_refs": task_refs + parent_refs},
            "area_fit": {"status": "not_applicable", "area_key": None, "rationale": "No area route is assigned because the role does not fit the current parent domain.", "source_refs": []},
            "disposition": "unsupported",
            "route_kind": None,
            "evidence_policy": {"title_used": False, "isco_or_esco_membership_used": False, "existing_area_membership_used": False},
            "candidate_scores": candidate_scores[:5],
        }

    area_status = "review_required"
    area_key = None
    area_rationale = "No unique task-to-area fit is established; candidate ranking is retained as review evidence only."
    evidence_terms: list[str] = []
    explicit = EXPLICIT_AREA_DECISIONS.get(role_key)
    if parent_disposition == "supported" and explicit and role_key not in EXPLICIT_AREA_REVIEW_KEYS:
        selected, rationale, terms = explicit
        available = {str(c.get("area_key")) for c in member.get("candidate_areas") or []}
        selected_label = next((str(c.get("label") or "") for c in member.get("candidate_areas") or [] if str(c.get("area_key") or "") == selected), "")
        if selected in available and "parent-boundary-candidate" not in selected_label.casefold() and all(norm(term) in norm(task) for term in terms if len(norm(term)) > 3):
            selected_refs = next((source_urls(c.get("source_refs")) for c in member.get("candidate_areas") or [] if str(c.get("area_key") or "") == selected), [])
            area_status, area_key, area_rationale, evidence_terms = "supported", selected, rationale, list(terms)
            explicit_area_refs = selected_refs
    if parent_disposition == "supported" and area_status != "supported" and candidate_scores:
        top = candidate_scores[0]
        runner = candidate_scores[1] if len(candidate_scores) > 1 else None
        margin = top["score"] - (runner["score"] if runner else 0)
        # A candidate is supported only with task evidence on both the label and
        # its independently sourced boundary, a clear margin, and source refs.
        if (
            role_key not in EXPLICIT_AREA_REVIEW_KEYS
            and
            top["score"] >= 9
            and margin >= 2
            and top["meaningful_label_hits"]
            and top["meaningful_boundary_hits"]
            and top["area_source_refs"]
            and "parent-boundary-candidate" not in str(top["label"] or "").casefold()
        ):
            area_status, area_key = "supported", top["area_key"]
            evidence_terms = top["meaningful_label_hits"] + top["meaningful_boundary_hits"]
            selected = next((c for c in member.get("candidate_areas") or [] if str(c.get("area_key") or "") == area_key), {})
            label = str(selected.get("label") or area_key)
            boundary = str(selected.get("boundary") or "")
            task_hits = ", ".join(evidence_terms)
            area_rationale = (
                f"The stored role-task text explicitly covers {task_hits}, which matches the scope of {label}: "
                f"{boundary} The selected candidate has a clear margin over the other listed same-domain areas. "
            "The fit is based on role tasks and the area boundary, not title, ISCO/ESCO or existing membership."
            )
    if area_status != "supported":
        if parent_disposition != "supported":
            area_rationale = "Parent-domain fit is unresolved, conditional or unsupported; area fit cannot be promoted until the independent parent-domain gate is resolved."
        elif not candidate_scores:
            area_rationale = "No current area candidate is available for this role; retain review_required rather than inventing an area or direct route."
        elif candidate_scores[0]["score"] < 9:
            area_rationale = "Task text does not contain enough distinctive, source-backed area-boundary evidence for a defensible route."
        elif len(candidate_scores) > 1 and candidate_scores[0]["score"] - candidate_scores[1]["score"] < 2:
            area_rationale = "Multiple current areas remain plausible; the top lexical overlap is not a fit verdict."

    overall = "supported" if parent_disposition == "supported" and area_status == "supported" else "review_required"
    area_ref_map = {str(c.get("area_key")): source_urls(c.get("source_refs")) for c in member.get("candidate_areas") or []}
    if "explicit_area_refs" in locals() and area_key:
        area_ref_map[area_key] = explicit_area_refs
    return {
        "role_key": role_key,
        "domain_id": member.get("domain_id"),
        "domain_name": member.get("domain_name"),
        "role_title": member.get("role_title"),
        "parent_domain_fit": {"status": parent_disposition, "queue_status": parent_status, "rationale": parent_reason, "source_refs": task_refs + parent_refs},
        "area_fit": {"status": area_status, "area_key": area_key, "rationale": area_rationale, "evidence_terms": evidence_terms, "source_refs": area_ref_map.get(area_key, []) if area_key else []},
        "disposition": overall,
        "route_kind": "area" if area_status == "supported" else None,
        "candidate_scores": candidate_scores[:5],
        "task_evidence": task,
        "task_source_refs": task_refs,
        "candidate_area_keys": [str(c.get("area_key") or "") for c in member.get("candidate_areas") or []],
        "evidence_policy": {"title_used": False, "isco_or_esco_membership_used": False, "existing_area_membership_used": False},
    }


def main() -> None:
    batches = []
    input_hashes = {}
    for number in BATCH_NUMBERS:
        path = QUEUE / f"batch-{number:03d}.json"
        raw = path.read_bytes()
        input_hashes[path.name] = hashlib.sha256(raw).hexdigest()
        payload = json.loads(raw.decode("utf-8-sig"))
        if payload.get("lane") != "role_area_direct_route_residual":
            raise SystemExit(f"Unexpected lane in {path.name}: {payload.get('lane')}")
        batches.append(payload)

    groups = [group for batch in batches for group in batch.get("groups") or []]
    results = []
    for group in groups:
        members = [evaluate_member(member) for member in group.get("members") or []]
        dispositions = Counter(result["disposition"] for result in members)
        group_disposition = "supported" if dispositions == Counter({"supported": len(members)}) else "review_required"
        results.append({
            "group_id": group.get("group_id"),
            "member_count": len(members),
            "group_disposition": group_disposition,
            "members": members,
        })

    member_results = [member for group in results for member in group["members"]]
    counts = {
        "input_groups": len(groups),
        "input_role_rows": len(member_results),
        "supported_role_rows": sum(x["disposition"] == "supported" for x in member_results),
        "unsupported_role_rows": sum(x["disposition"] == "unsupported" for x in member_results),
        "review_required_role_rows": sum(x["disposition"] == "review_required" for x in member_results),
        "supported_groups": sum(x["group_disposition"] == "supported" for x in results),
        "review_required_groups": sum(x["group_disposition"] == "review_required" for x in results),
        "parent_supported": sum(x["parent_domain_fit"]["status"] == "supported" for x in member_results),
        "parent_review_required": sum(x["parent_domain_fit"]["status"] == "review_required" for x in member_results),
        "parent_unsupported": sum(x["parent_domain_fit"]["status"] == "unsupported" for x in member_results),
        "area_supported": sum(x["area_fit"]["status"] == "supported" for x in member_results),
        "area_review_required": sum(x["area_fit"]["status"] == "review_required" for x in member_results),
        "area_not_applicable": sum(x["area_fit"]["status"] == "not_applicable" for x in member_results),
    }
    payload = {
        "schema_version": "2026-10-07.role-review-agent-area-batch.v1",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "role_area_direct_route_residual batch-001 through batch-005 only",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "policy": {
            "parent_domain_fit_is_independent_of_area_fit": True,
            "isco_or_esco_membership_used_as_fit_evidence": False,
            "title_alone_used_as_fit_evidence": False,
            "existing_area_membership_used_as_fit_evidence": False,
            "unresolved_cases_preserved": True,
            "canonical_files_edited": False,
            "conditional_lane_read_or_edited": False,
            "area_source_reconciliation_read_or_edited": False,
        },
        "counts": counts,
        "input_batches": [f"batch-{n:03d}.json" for n in BATCH_NUMBERS],
        "input_sha256": input_hashes,
        "groups": results,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "area_batch_001_005_results.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Role-area/direct-route review checkpoint: batches 001–005",
        "",
        f"Generated: {payload['created_at_utc']}",
        "",
        "## Scope",
        "",
        "Processed only `role_area_direct_route_residual/batch-001.json` through `batch-005.json`. The conditional lane, area-source reconciliation files and canonical role files were not edited.",
        "",
        "## Results",
        "",
        f"- Case groups processed: **{counts['input_groups']}**.",
        f"- Role rows processed: **{counts['input_role_rows']}**.",
        f"- Supported role-area-and-parent routes: **{counts['supported_role_rows']}**.",
        f"- Explicitly unsupported parent-domain cases: **{counts['unsupported_role_rows']}**.",
        f"- Preserved `review_required`: **{counts['review_required_role_rows']}**.",
        f"- Independent parent-domain supported: **{counts['parent_supported']}**; review-required: **{counts['parent_review_required']}**; unsupported: **{counts['parent_unsupported']}**.",
        f"- Area supported: **{counts['area_supported']}**; area review-required: **{counts['area_review_required']}**; not applicable: **{counts['area_not_applicable']}**.",
        "",
        "## Decision rule",
        "",
        "A supported route requires source-linked role-task text, an independently supported parent-domain fit, a current same-domain area boundary, and a distinctive task-to-boundary match with a clear candidate margin. Candidate rankings and shared words are not treated as proof. Unresolved or conditional parent fits remain review-required.",
        "",
        "## Important limitation",
        "",
        "This result is an audit/disposition artifact, not a canonical seed or live deployment. It records the evidence-backed decisions for the assigned batches so they can be reconciled and applied through the guarded canonical route applicator later.",
        "",
        "Machine-readable result: `area_batch_001_005_results.json`.",
    ]
    (OUT / "area_batch_001_005_checkpoint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"counts": counts, "output": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
