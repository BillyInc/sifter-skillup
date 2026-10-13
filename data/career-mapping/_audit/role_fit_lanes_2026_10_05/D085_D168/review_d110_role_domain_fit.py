"""Exact-key D110 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D110_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D110_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D110 role_key and recorded role_description for each decision.", "supports": "The named plant process, materials, machinery and product tasks assessed against the parent domain scope.", "limit": "Local task text is not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URI retained on each queued role record.", "supports": "Standardized occupational concepts and task-profile context.", "limit": "ESCO membership or hierarchy is not used as proof of fit to the custom domain."},
    "ILO_ISCO08_PLANT_OPERATIONS": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 unit-group descriptions for chemical/plant and rubber/plastics processing operations, including process monitoring, mixing, moulding and industrial machinery.", "supports": "International occupational context for process-plant and materials-processing tasks.", "limit": "Classification context only; fit depends on the exact role task and D110's stated chemical, rubber and plastics plant-operation scope."},
}

# Exact queued role name -> status and explanation tied to its task description.
DECISIONS = {
    "V-belt builder": ("supported", "Builds rubber transmission belts from calendered rubber, adhesives and compression steps; direct rubber-product manufacture."),
    "V-belt coverer": ("supported", "Covers belts with rubberised fabric using production machinery; direct rubber-product manufacture."),
    "V-belt finisher": ("supported", "Finishes and measures V-belts and stamps product identification; direct rubber-product finishing."),
    "anaerobic digestion plant operator": ("unsupported_for_domain", "Runs biological digestion of organic waste to produce biogas. The described work is bioenergy/waste processing, not chemical, rubber or plastics plant operations."),
    "belt builder": ("supported", "Builds transmission/conveyor belts from rubberised fabric plies and bonds them with production machinery; direct rubber manufacture."),
    "blow moulding machine operator": ("supported", "Controls heat, air pressure and plastic feed to mould plastic products; direct plastics processing."),
    "cake press operator": ("supported", "Presses and heats plastic chips into plastic sheets; direct plastics processing."),
    "capsule filling machine operator": ("conditional", "Fills gelatin capsules with medicinal preparations. This is a pharmaceutical production operation using chemical preparations, but the task is medicine-specific rather than general chemical/rubber/plastics plant work."),
    "chemical mixer": ("supported", "Mixes raw materials in tanks/blenders to manufacture chemical products to batch specifications; direct chemical plant processing."),
    "coagulation operator": ("supported", "Coagulates synthetic rubber latex and prepares rubber crumb slurry for finishing; direct rubber processing."),
    "coking furnace operator": ("conditional", "Controls coal carbonization in an industrial oven to produce coke. This is a thermal industrial process, but the described feedstock/product lie outside the domain's stated chemical, rubber and plastics scope."),
    "compression moulding machine operator": ("supported", "Uses heat and pressure to mould prepared plastic compounds into products; direct plastics processing."),
    "cosmetics production machine operator": ("supported", "Sets up, cleans and operates machinery manufacturing cosmetic products; direct process-manufacturing work in the chemical products sector."),
    "distillation operator": ("supported", "Controls oil distillation to separate intermediate products/impurities by process conditions; direct chemical/petrochemical process-plant operation."),
    "fermenter operator": ("conditional", "Runs fermentation equipment producing pharmaceutical ingredients and also cosmetics/personal-care products. It is industrial process manufacturing, but the profile spans pharmaceutical/bioprocess contexts beyond the stated core domain."),
    "fertiliser mixer": ("supported", "Mixes chemical ingredients into fertiliser to a controlled product specification; direct chemical manufacturing."),
    "fiberglass laminator": ("supported", "Cuts and lays resin-saturated glass-fibre composites and bonds moulded products such as hulls/decks; direct composite/polymer manufacturing."),
    "fibreglass machine operator": ("supported", "Controls resin and glass-fibre spray machinery to form composite products; direct polymer/composite processing."),
    "filament winding operator": ("supported", "Winds resin-coated glass/carbon fibre around moulds to manufacture composite pipes and hollow products; direct composite processing."),
    "foam rubber mixer": ("supported", "Mixes latex/rubber materials and forms foam-rubber cushions or mattresses; direct rubber-product manufacturing."),
    "gauger": ("unsupported_for_domain", "Tests oil during processing and regulates pumping/flow into pipelines for dispatch. The task is measurement and transfer/logistics, not operation of chemical, rubber or plastics production equipment."),
    "granulator machine operator": ("conditional", "Mixes and granulates powdered ingredients for compression into medicinal tablets. This is pharmaceutical formulation/manufacturing, adjacent to chemical processing but medicine-specific."),
    "injection moulding operator": ("supported", "Controls temperature, pressure and plastic feed in injection moulding and removes finished parts; direct plastics processing."),
    "insulating tube winder": ("supported", "Operates machinery to wind and cut insulating tubes; direct manufacture of polymer/rubber-like industrial products where the material is in domain scope."),
    "lacquer maker": ("supported", "Mixes synthetic paints/lacquers to a formula using production equipment; direct chemical product manufacturing."),
    "lime kiln operator": ("supported", "Controls kiln operation and feed/temperature conditions to convert limestone into lime; direct inorganic chemical/material process production."),
    "nitrator operator": ("conditional", "Controls chemical nitration equipment and explosive-product storage. The task is chemical plant processing, but explosive manufacture is a distinct high-hazard speciality not expressly within the domain scope."),
    "nitroglycerin neutraliser": ("conditional", "Neutralises residual acids in explosives-process tanks; a specialized chemical-process task outside the domain's ordinary stated chemical products and requiring a distinct explosives context."),
    "nitroglycerin separator operator": ("conditional", "Controls temperature and flow to separate nitroglycerin from spent acids. It is a specialized explosives chemical process, not a general chemical/rubber/plastics plant task."),
    "nonwoven filament machine operator": ("conditional", "Performs chemical nonwoven processing. The description gives no material or process detail to establish whether this is chemical/polymer plant operation or textile production."),
    "optical disc moulding machine operator": ("supported", "Melts polycarbonate and injects it into moulds to make optical discs; direct plastics processing."),
    "paint mixer": ("supported", "Mixes paints, lacquers and solvents to specified formulas; direct chemical product manufacturing."),
    "perfume production machine operator": ("supported", "Operates and maintains machinery used to manufacture perfumes; direct chemical product processing."),
    "pesticide mixer": ("supported", "Mixes chemical ingredients into pesticide products to formula; direct chemical manufacturing."),
    "pill maker operator": ("conditional", "Operates machinery that forms pills and controls material feed/temperature. This is pharmaceutical manufacturing, adjacent to chemical processing but product-specific."),
    "plastic furniture machine operator": ("supported", "Runs plastic-processing machinery to manufacture and inspect plastic furniture parts; direct plastics processing."),
    "plastic heat treatment equipment operator": ("supported", "Uses furnaces or flame treatment to alter plastic-product properties; direct plastics process operation."),
    "plastic rolling machine operator": ("supported", "Processes plastic into rolls or sheets and checks raw/finished material against specifications; direct plastics manufacturing."),
    "plodder operator": ("supported", "Compresses milled soap into shaped bars to specification; direct soap/chemical product manufacturing."),
    "pultrusion machine operator": ("supported", "Pulls fibre-reinforced resin through a die to make continuous composite profiles; direct polymer/composite processing."),
    "pyrotechnics drying room attendant": ("conditional", "Controls drying and storage conditions for pyrotechnic materials. This is a hazardous chemical-material operation but outside ordinary chemical, rubber and plastics product plants as scoped."),
    "record press operator": ("supported", "Presses vinyl into a grooved record using a mould/master; direct polymer product forming."),
    "rubber cutting machine tender": ("supported", "Cuts rubber stock into slabs and handles anti-stick treatment; direct rubber-material processing."),
    "rubber dipping machine operator": ("supported", "Dips forms in liquid latex to manufacture rubber goods and checks the product/process; direct rubber processing."),
    "rubber products machine operator": ("supported", "Kneads, blends, calendars, moulds, extrudes and cures natural/synthetic rubber products; core rubber plant operation."),
    "sectional belt mould assembler": ("supported", "Assembles and presses rubber belts into moulds to form V-belts; direct rubber-product production."),
    "soap chipper": ("supported", "Operates machinery to convert soap bars into soap chips and transfers/stores the product; direct soap processing."),
    "soap drier operator": ("supported", "Controls drying equipment to produce soap flakes and monitors/tests the product; direct soap plant operation."),
    "soap maker": ("supported", "Operates equipment and mixers to produce soap to a specified formula; direct chemical product manufacturing."),
    "soap tower operator": ("supported", "Controls tower process conditions and feed flows to produce soap powder; direct soap plant operation."),
    "tracer powder blender": ("conditional", "Blends chemical powders to produce igniters/tracer materials. The task is chemical mixing, but the explosive/pyrotechnic product is a distinct high-hazard speciality outside the domain's ordinary stated scope."),
    "tyre builder": ("supported", "Builds pneumatic tyres from rubber components using machinery and hand tools; direct rubber-product manufacturing."),
    "tyre vulcaniser": ("unsupported_for_domain", "Repairs tears and holes in existing tyres. This is repair/service work, not chemical, rubber or plastics plant operations or primary rubber manufacture."),
    "vacuum forming machine operator": ("supported", "Heats plastic sheets and vacuum-forms them over moulds into products; direct plastics processing."),
    "varnish maker": ("supported", "Melts, mixes and cooks chemical ingredients to manufacture varnish to specification; direct chemical product manufacturing."),
    "wax bleacher": ("conditional", "Uses filter presses and tanks to bleach wax for candle production. This is a process-plant operation, but candle/wax processing is not explicit in the domain scope and needs confirmation that this domain includes it."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D110"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D110 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_PLANT_OPERATIONS"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D110", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare exact tasks with plant operations converting chemical, rubber and plastic materials into products. ISCO/ESCO hierarchy, subgroup membership, title similarity and frequency are not fit proof. Conditional marks adjacent/specialized processes where the actual tasks fit process work but their material/product context is outside or broader than the stated domain; unsupported marks tasks in another industrial area or service function.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES,
        "notes": ["All exact D110 role names were matched against the queue before report generation; each decision preserves the recorded task text and ESCO URI.", "The parent scope is narrower than all industrial processing: jobs involving plastics, rubber, soap and chemical products were supported; pharma, explosives, coking, wax and mixed textile tasks were kept conditional where scope remains debatable.", "Plant operators are not inferred to fit from their occupational classification; exact task descriptions determine each disposition.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D110 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        why = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {why} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
