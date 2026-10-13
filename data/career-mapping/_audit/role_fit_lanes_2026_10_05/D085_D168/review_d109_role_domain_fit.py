"""Exact-key D109 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D109_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D109_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D109 role_key and task description for each decision.", "supports": "Recorded metal forming, casting, finishing, grinding and wire processing tasks.", "limit": "A local task record is not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs retained on each queued role record.", "supports": "Standardized occupation concepts and associated task descriptions.", "limit": "Classification hierarchy alone does not establish fit to this custom domain."},
    "ILO_ISCO08_METAL_PROCESSING": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 manufacturing/plant-operator task definitions for metal processing and finishing, including casting, rolling, drawing, coating and electroplating operations.", "supports": "Global occupational context for metal processing and surface-finishing tasks.", "limit": "Classification context only. Each disposition is based on the exact recorded task compared with D109's domain scope, not its ISCO code."},
}

DECISIONS = {
    "abrasive blasting operator": ("conditional", "Abrasive-blasts metal parts but also masonry materials such as brick, stone and concrete; the profile spans the domain and unrelated materials."),
    "anodising machine operator": ("supported", "Anodises metal workpieces, usually aluminium, to create a durable corrosion-resistant oxide layer; direct metal surface processing."),
    "casting machine operator": ("supported", "Controls molten ferrous/non-ferrous metal and moulds to cast metal products; direct foundry production."),
    "coating machine operator": ("supported", "Applies protective/decorative metallic or non-metallic coatings to metal products; direct metal finishing."),
    "cylindrical grinder operator": ("supported", "Precision-grinds metal workpieces to remove material and finish cylindrical surfaces; direct metal processing."),
    "deburring machine operator": ("supported", "Removes burrs and sharp edges from metal workpieces using deburring machinery; direct metal finishing."),
    "dip tank operator": ("supported", "Coats workpieces by dipping them into paint, preservative or molten zinc; direct surface treatment of industrial parts, including metal galvanizing."),
    "electroplating machine operator": ("supported", "Uses electric current to deposit a metal layer on workpiece surfaces; direct metal finishing and coating."),
    "enameller": ("supported", "Applies vitreous enamel to metal objects for decoration/protection; direct metal surface finishing."),
    "extrusion machine operator": ("conditional", "Heats/melts raw materials and forces them through a die, but the task profile covers multiple material types; only metal extrusion is within this parent domain."),
    "filing machine operator": ("conditional", "Files and smooths metal, wood or plastic surfaces; direct when metal is processed, but the profile spans non-metal work too."),
    "metal annealer": ("supported", "Heat-treats and slowly cools metal to change its workability, monitoring the material against process specifications; direct metal processing."),
    "metal drawing machine operator": ("supported", "Draws ferrous/non-ferrous metal through dies to form wire, bars, tubes and profiles; direct metal forming."),
    "metal rolling mill operator": ("supported", "Rolls and controls metal workpieces to reduce thickness and achieve uniform shape; direct metal forming."),
    "rustproofer": ("supported", "Applies protective coatings to iron/steel workpieces to prevent or delay corrosion; direct metal surface treatment."),
    "spring maker": ("supported", "Uses equipment to manufacture metal springs in multiple forms; direct metal component production."),
    "surface grinding machine operator": ("supported", "Grinds metal workpieces to remove small amounts of material and produce a finished surface; direct metal processing."),
    "tumbling machine operator": ("supported", "Tumbles metal workpieces with abrasive media to remove excess material/burrs and improve surface appearance; direct metal finishing."),
    "wire weaving machine operator": ("supported", "Weaves drawable metal wire into wire cloth; direct manufacture from processed metal wire."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D109"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D109 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_METAL_PROCESSING"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D109", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role task with metal shaping/forming, foundry work and metal surface processing. ISCO/ESCO grouping, current subgroup, title similarity and frequency are not fit evidence. Conditional marks tasks explicitly spanning metal and other materials; unsupported is reserved for work outside the defined domain.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES,
        "notes": ["All D109 decision keys were checked for exact equality with the queued role names before generation.", "ILO classification supplies broad task context; the actual duties stated in each exact role profile determine fit.", "Abrasive blasting, extrusion and filing remain conditional because each profile expressly includes non-metal materials.", "No specialization assignment, visibility decision or canonical taxonomy/mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D109 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        lines.append(f"| `{item['role_key']}` | {item['task_evidence'].replace('|', '\\|').replace(chr(10), ' ')} | {item['domain_fit']} | {item['rationale'].replace('|', '\\|')} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
