"""Build the evidence-backed D048 Food Science role/domain review slice.

Decisions are curated per exact role key; this script only joins the current
deterministic queue, tasks, and source locators and validates coverage.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D048_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D048_role_domain_fit_review_2026_10_05.md"

SUPPORTED = {
    "baker", "baking operator", "beverage filtration technician",
    "blanching operator", "blender operator", "blending plant operator",
    "brew house operator", "butcher", "cacao bean roaster",
    "cacao beans cleaner", "candy machine operator", "carbonation operator",
    "cellar operator", "centrifuge operator", "chilling operator",
    "chocolatier", "clarifier", "cocoa press operator", "coffee roaster",
    "coffee taster", "distillery miller", "dryer attendant",
    "extract mixer tester", "fish canning operator", "fish production operator",
    "fish trimmer", "food analyst", "food biotechnologist",
    "fruit-press operator", "halal butcher", "honey extractor",
    "kettle tender", "malt kiln operator", "meat preparations operator",
    "pasta maker", "sauce production operator", "slaughterer",
    "starch converting operator", "sugar refinery operator",
}
CONDITIONAL = {"biochemist", "bioinformatics scientist", "geneticist"}
UNSUPPORTED = {"aquaculture biologist"}

def rationale(name: str, status: str) -> tuple[str, str, str]:
    if status == "supported":
        if name in {"food analyst", "food biotechnologist"}:
            return (
                "food_science_testing_or_safety",
                "The described work directly tests food properties or studies food preservation, spoilage, pathogens, and food-safety compliance; those are specific food-science functions.",
                "The task statement directly names food or food products. IFT's discipline definition and O*NET's food-scientist task profile bound the field; neither source establishes local licensing.",
            )
        if name in {"baker", "butcher", "chocolatier", "coffee taster", "halal butcher", "pasta maker", "slaughterer"}:
            return (
                "food_preparation_or_product_craft",
                "The role's stated duties prepare, transform, evaluate, or process food for consumption, matching the stored domain scope's explicit food-product and meat-cutting remit.",
                "ESCO supplies the exact mapped task definition. IFT defines food science around food nature, deterioration, processing, and improvement; the current domain scope explicitly includes product craft. This supports domain fit, not a claim that every craft role is a scientist.",
            )
        return (
            "food_or_beverage_processing",
            "The exact task description operates or controls a process that transforms, preserves, tests, or packages food, food ingredients, or beverages, directly matching the stored D048 scope.",
            "ESCO supplies the exact mapped task definition. IFT's discipline scope includes food processing; O*NET's food-science/processing profiles corroborate the food-processing boundary where cited. These references do not establish local licensing or market demand.",
        )
    if status == "conditional":
        return (
            "generic_life_science_requires_food_assignment",
            "The mapped task definition is a general life-science occupation and does not itself establish food research, food processing, food safety, or nutrition work. Retain only when the specific position is demonstrably assigned to food-science work; do not present this generic role as a confirmed D048 path by default.",
            "ESCO/O*NET describe the occupation broadly. IFT's food-science definition identifies the relevant food-specific application but does not make generic biochemistry, bioinformatics, or genetics automatically food science.",
        )
    return (
        "upstream_aquaculture_not_food_science",
        "The mapped task is aquaculture biology and production: aquatic organisms, their environment, and farm-production outcomes. It does not describe food composition, food transformation, food safety, or food-product research; the current D048 link is therefore unsupported by the task evidence.",
        "ESCO supplies the exact aquaculture task definition. IFT's discipline definition centers on food nature, deterioration, processing, and improvement. This disposition removes support for this D048 link only and does not assign an alternative domain.",
    )

def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in worklist["role_mappings"] if r["domain_id"] == "D048"]
    by_name = {r["role_name"]: r for r in rows}
    if len(rows) != 43 or len(by_name) != len(rows):
        raise SystemExit(f"D048 queue changed: expected 43 unique rows, got {len(rows)}")
    declared = SUPPORTED | CONDITIONAL | UNSUPPORTED
    if declared != set(by_name):
        raise SystemExit(
            f"Decision keys differ: missing={sorted(set(by_name)-declared)}; "
            f"unexpected={sorted(declared-set(by_name))}"
        )
    decisions = []
    for name in sorted(by_name):
        row = by_name[name]
        status = "supported" if name in SUPPORTED else "conditional" if name in CONDITIONAL else "unsupported"
        category, basis, limits = rationale(name, status)
        refs = []
        for ref in row["task_source_refs"]:
            source, value = ref.split(":", 1)
            locator = value.split("@", 1)[0]
            if source == "ONET" and not locator.startswith(("http://", "https://")):
                locator = f"https://www.onetonline.org/link/summary/{locator}"
            refs.append(locator)
        if not row.get("role_task_text") or not refs:
            raise SystemExit(f"Missing task or source locator: {row['role_key']}")
        decisions.append({
            "role_key": row["role_key"],
            "role_name": name,
            "domain_fit_status": status,
            "decision_category": category,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs + [
                "https://www.ift.org/food-technology-magazine/ift-and-the-food-science-profession",
                "https://www.onetonline.org/link/summary/19-1012.00",
            ],
            "source_limit": limits,
            "recommended_action": (
                "retain_current_D048_link" if status == "supported" else
                "retain_only_as_conditional_context_not_confirmed_student_path" if status == "conditional" else
                "remove_current_D048_link_after_lane_reconciliation; do_not_infer_destination"
            ),
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    payload = {
        "schema_version": 1,
        "domain_id": "D048",
        "domain_name": "Food Science",
        "scope": "D048 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Adjudicated all exact D048 role keys from the generated lane worklist. Compared each role's stored ESCO task definition and linked official task references against the parent scope and global food-science boundary. ISCO/subgroup membership, title similarity, and cross-domain frequency were not used as fit evidence. Conditional means the generic occupation is not confirmed as a D048 student path unless the food-specific assignment is established.",
        "scope_sources": [
            "https://www.ift.org/food-technology-magazine/ift-and-the-food-science-profession",
            "https://www.onetonline.org/link/summary/19-1012.00",
            "https://www.onetonline.org/link/summary/19-4013.00",
        ],
        "source_limit_policy": "ESCO links identify the exact occupation task record in the checked-in source ledger; O*NET is US task corroboration, not universal qualification evidence. IFT provides an international professional body's discipline definition. No source here establishes local licensing, demand, or an alternative domain assignment.",
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
        "canonical_changes": 0,
        "canonical_correction_ready": False,
        "correction_note": "A D048 exclusion is evidence-supported for aquaculture biologist, but is not applied while the other role-review lane is active. Reconcile cross-lane findings, then remove only the D048 link; do not infer an alternative domain. Three generic life-science mappings are conditional and should not be shown as confirmed D048 student paths without food-specific role evidence.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D048 — Food Science: role-to-parent fit",
        "",
        f"**Slice:** {len(decisions)}/{len(rows)} exact D048 mappings reviewed. No subgroup or role-to-specialization decisions; canonical role/domain data unchanged.",
        "",
        "| Disposition | Count |", "|---|---:|",
    ]
    lines += [f"| {s.title()} | {counts.get(s, 0)} |" for s in ("supported", "conditional", "unsupported", "unresolved")]
    lines += ["", "## Decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines += [f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in decisions]
    lines += [
        "", "## Evidence boundary", "",
        "Each row retains its exact task text and role-specific ESCO/O*NET locators. The international [Institute of Food Technologists definition](https://www.ift.org/food-technology-magazine/ift-and-the-food-science-profession) centers food science on food properties, deterioration, processing, and improvement; [O*NET Food Scientists and Technologists](https://www.onetonline.org/link/summary/19-1012.00) corroborates analysis, safety, quality, and processing tasks. Operational food-production roles are included because the stored D048 scope expressly covers production processes; their inclusion does not relabel them as scientists.",
        "", "Conditional roles are generic life-science occupations, not confirmed student paths absent a food-specific assignment. The aquaculture-biologist task is upstream aquaculture production rather than a food-science task; its D048 link is unsupported. No alternative domain is inferred.",
        "", "## Validation and next step", "",
        f"- Exact queue coverage: {len(decisions)}/{len(rows)}.",
        f"- Status arithmetic: {counts.get('supported',0)} supported + {counts.get('conditional',0)} conditional + {counts.get('unsupported',0)} unsupported + {counts.get('unresolved',0)} unresolved = {len(decisions)}.",
        "- Each decision carries exact task text, rationale, source references, and limitations.",
        "- Suggested correction is recorded, not applied to canonical JSON; reconcile the D048 row against the other role lane before canonical editing.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))

if __name__ == "__main__":
    main()
