"""Exact-key D111 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D111_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D111_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D111 role_key and task description for each decision.", "supports": "The recorded textile and garment production duties compared with this parent-domain scope.", "limit": "The queue is not an independent authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs from the queued records.", "supports": "Standardized occupation concepts and task context.", "limit": "Occupation hierarchy is not used to infer domain fit."},
    "ILO_ISCO08_TEXTILE": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Groups 8151–8154 and  textile/garment task descriptions: fibre preparation, spinning/winding, weaving/knitting, sewing, bleaching/dyeing and fabric cleaning.", "supports": "International task context for the textile production chain and distinction between manufacturing and laundry services.", "limit": "Classification is corroboration only. Exact recorded tasks are compared with D111's defined textile/garment manufacturing scope."},
}

DECISIONS = {
    "braiding machine operator": ("supported", "Monitors braiding machinery, process conditions and fabric quality; direct textile production."),
    "braiding textile technician": ("supported", "Sets up textile braiding processes; direct production-process preparation."),
    "canvas goods assembler": ("conditional", "Assembles tents, bags and similar products from woven canvas/leather. The work uses textile materials but is product assembly rather than yarn/fabric or clothing manufacture as defined in the parent scope."),
    "clothing alteration machinist": ("supported", "Alters/customizes finished garments and checks the work against customer requirements; garment production and modification task."),
    "clothing sample machinist": ("supported", "Makes first garment samples and evaluates construction for bulk production, pressing and quality; direct garment manufacturing."),
    "cotton gin operator": ("conditional", "Separates cotton fibre from seed and bales it for textile use. This is upstream fibre preparation that feeds textile manufacturing, but occurs before spinning/fabric production."),
    "embroidery machine operator": ("supported", "Operates machinery to embroider and decorate wearing apparel; direct garment/textile production."),
    "finishing textile technician": ("supported", "Sets up textile finishing processes that improve textile appearance or usefulness; direct textile manufacturing."),
    "knitting machine operator": ("supported", "Processes yarn into knitted products with knitting machinery, including clothing and other textile products; direct textile production."),
    "knitting machine supervisor": ("supported", "Supervises knitting machines and monitors production conditions and fabric quality; direct textile operations."),
    "knitting textile technician": ("supported", "Sets up weft/warp knitting processes, including CAD patterning and lab coordination; direct textile manufacturing process work."),
    "laundry ironer": ("unsupported_for_domain", "Presses and reshapes garments/linen in a laundry setting. This is garment-care service, not textile or garment manufacturing."),
    "laundry worker": ("unsupported_for_domain", "Washes and dry-cleans clothing, linens and carpets in laundry businesses; textile-care services are outside manufacturing."),
    "laundry workers supervisor": ("unsupported_for_domain", "Supervises laundry/dry-cleaning staff and service schedules, not textile or garment manufacturing."),
    "man-made fiber spinner": ("supported", "Performs fibre/filament processing to produce man-made textile fibres; direct upstream textile manufacturing."),
    "mattress making machine operator": ("conditional", "Cuts and attaches padding and coverings to make mattresses. Textile materials are involved, but the described output is a mattress rather than textile fabric or garment production."),
    "nonwoven staple machine operator": ("supported", "Performs physical processing of staple fibres into nonwoven textile products; direct textile manufacturing."),
    "nonwoven textile technician": ("supported", "Sets up nonwoven textile processes; direct textile manufacturing process work."),
    "printing textile technician": ("supported", "Sets up textile printing processes; direct textile finishing/decorating production."),
    "protective clothing apparel manufacturer": ("supported", "Manufactures textile protective garments designed for specified hazards; direct technical apparel production."),
    "sewing machine operator": ("supported", "Joins, assembles, reinforces, repairs and alters wearing apparel in an industrial production chain; direct garment manufacturing."),
    "spinning machine operator": ("supported", "Prepares fibre and operates machines to spin, twist, wind and reel yarn; core textile manufacturing."),
    "spinning textile operator": ("supported", "Sets up spinning processes; direct yarn production."),
    "textile chemical quality technician": ("supported", "Runs chemical tests on textile materials/products and supports colouration and finishing; direct textile quality/process work."),
    "textile dyeing technician": ("supported", "Sets up textile dyeing processes; direct textile manufacturing."),
    "textile dyer": ("supported", "Prepares dye baths/formulas and dyes yarn and textiles to samples; direct textile coloration."),
    "textile finishing machine operator": ("supported", "Operates and monitors textile finishing machinery; direct textile production."),
    "textile machine operator": ("supported", "Supervises textile machines and monitors production quality/productivity; direct textile manufacturing."),
    "textile machinery technician": ("supported", "Maintains and repairs machinery used in textile weaving, dyeing and finishing; direct technical support to textile production."),
    "textile operations manager": ("conditional", "Schedules textile orders and deliveries to maintain production flow. It is linked to textile operations, but the task statement is broad and does not specify production-floor responsibilities."),
    "textile pattern making machine operator": ("supported", "Creates textile patterns/designs with machinery and checks material/product quality; direct textile production and decoration."),
    "textile printer": ("supported", "Performs textile printing; direct textile manufacturing/finishing."),
    "textile process controller": ("supported", "Controls technical aspects of textile design, production, quality and cost using CAM/CIM; direct textile process operations."),
    "textile quality inspector": ("supported", "Checks manufactured textile products against specifications; direct textile production quality control."),
    "textile quality manager": ("supported", "Manages textile production quality systems and inspects lines/products; direct textile quality management."),
    "textile quality technician": ("supported", "Tests textile materials/products and interprets results against standards; direct textile quality work."),
    "tufting operator": ("supported", "Operates and monitors textile tufting machines and fabric quality; direct textile manufacturing."),
    "twisting machine operator": ("supported", "Twists fibres/yarn into stronger or specified yarn using textile machinery; direct yarn production."),
    "weaving machine operator": ("supported", "Processes yarn into woven clothing, home and technical textiles and maintains weaving machinery; direct textile production."),
    "weaving machine supervisor": ("supported", "Supervises automated weaving and checks fabric quality/conditions across product types; direct textile operations."),
    "weaving textile technician": ("supported", "Sets up weaving processes; direct fabric production."),
    "winding machine operator": ("conditional", "Winds yarn/thread onto reels and spools but also handles strings, cords and ropes. Textile yarn work is in scope; broader non-textile winding is not established as the exclusive context."),
    "yarn spinner": ("supported", "Converts fibres into yarn; core textile manufacturing."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D111"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D111 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_TEXTILE"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D111", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact task with fibre-to-yarn, textile/fabric processing and garment manufacturing scope. ISCO/ESCO hierarchy, subgroup, role title and frequency are not fit evidence. Conditional identifies upstream fibre supply, product assembly/service adjacency or an underspecified broad task; unsupported identifies laundry garment-care rather than manufacturing.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES,
        "notes": ["All 43 D111 role keys were required to match the queue exactly before report generation; the checked-in task text is preserved per row.", "ILO definitions distinguish textile manufacturing groups (8151–8154) from laundry-machine work (8157), supporting the boundary while leaving the role-level decision task-based.", "Canvas goods, mattress assembly, cotton ginning, broad winding and order scheduling remain conditional because their described scope exceeds or precedes the parent's explicit fibre/textile/garment manufacturing activities.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D111 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
