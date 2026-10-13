"""Exact-queue D133 role-to-parent-domain fit review generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D133_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D133_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D133 role_key and task description for each decision.", "supports": "The specific occupation tasks compared with transport-interior scope.", "limit": "Stored task text is not an independent classification authority."},
    "ESCO_TASK_PROFILE": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation_main", "locator": "Each role decision retains its exact ESCO occupation URI, where available.", "supports": "Role-specific task profiles for the occupations in this lane.", "limit": "ESCO describes occupation tasks; its hierarchy is not treated as proof of D133 fit."},
    "EASA_AIRCRAFT_INTERIORS": {"publisher": "European Union Aviation Safety Agency (EASA)", "url": "https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-initial-airworthiness-and", "locator": "Easy Access Rules for Initial Airworthiness: cabin interior layout, seats, panels, galleys, wardrobes and other cabin installations are treated as aircraft design/change areas with safety implications.", "supports": "Aircraft-interior components are a distinct transport-engineering context, not ordinary room furnishing alone.", "limit": "Regulatory design-change rules do not define occupational titles or establish fit for unrelated furniture/craft roles."},
    "IMO_SHIP_ACCOMMODATION": {"publisher": "International Maritime Organization (IMO)", "url": "https://wwwcdn.imo.org/localresources/en/OurWork/HumanElement/Documents/MSC.1-Circ.1598.pdf", "locator": "MSC.1/Circ.1598, fatigue and ship design: ship accommodation-space layout and the living, sleeping and working environment are considered in vessel design.", "supports": "Ship interiors/accommodation are a transport-vessel design context.", "limit": "The circular addresses ship design and fatigue, not the fit of any specific craft occupation."},
}

# Conditional entries are possible transport-interior work whose stored task
# does not establish an aircraft, ship, or vehicle application.
DECISIONS = {
    "aircraft interior technician": ("supported", "Manufactures, assembles and repairs aircraft cabin components such as seats, carpeting, panels and lighting; direct transport-interior work."),
    "antique furniture reproducer": ("unsupported_for_domain", "Reproduces antique furniture to original specifications; the task is furniture craft and does not identify transport interiors."),
    "cabinet maker": ("conditional", "Builds cabinets and furniture, which may be fitted as transport-interior components, but the recorded task does not identify aircraft, ships or vehicles."),
    "clothing fashion designer": ("unsupported_for_domain", "Designs clothing collections and fashion concepts, not transport interiors."),
    "cooper": ("unsupported_for_domain", "Makes wooden barrels and related products; no transport-interior function is described."),
    "costume designer": ("unsupported_for_domain", "Designs costumes for performances, film and television rather than vehicle or vessel interiors."),
    "costume maker": ("unsupported_for_domain", "Constructs and maintains performance/film costumes; no transport-interior task is described."),
    "dressmaker": ("unsupported_for_domain", "Makes and alters bespoke garments, not transport interiors."),
    "fashion designer": ("unsupported_for_domain", "Designs clothing and fashion ranges; luxury fashion is outside the explicit transport-interior parent scope."),
    "filigree maker": ("unsupported_for_domain", "Creates decorative precious-metal jewellery; this is jewellery craft, not transport-interior design or fitting."),
    "furniture designer": ("conditional", "Designs furniture products; this could extend to bespoke transport-interior furniture, but the task record does not identify a transport setting."),
    "furniture finisher": ("conditional", "Finishes wood furniture and applies coatings; transport panels or furnishings could use related work, but this task is not tied to a vehicle or vessel."),
    "furniture restorer": ("conditional", "Restores old furniture, which could include historic transport interiors, but the task record describes furniture restoration generally and does not establish that application."),
    "furniture upholsterer": ("conditional", "Upholsters furniture and seating; related skills can apply to transport seating, but this record is limited to furniture and does not state aircraft, ship or vehicle work."),
    "goldsmith": ("unsupported_for_domain", "Designs, makes, repairs and appraises jewellery; outside transport-interior scope."),
    "interior designer": ("conditional", "Designs and renovates interior spaces. Transport cabins can be interiors, but the task profile identifies general internal spaces rather than aircraft, ships or vehicles."),
    "interior planner": ("conditional", "Plans commercial and private interiors; no transport cabin or vehicle-interior setting is stated."),
    "jeweller": ("unsupported_for_domain", "Fabricates and repairs jewellery articles; unrelated to transport interiors."),
    "jewellery designer": ("unsupported_for_domain", "Designs jewellery and decorative pieces rather than transport interiors."),
    "jewellery engraver": ("unsupported_for_domain", "Engraves jewellery articles; no transport-interior work is established."),
    "jewellery mounter": ("unsupported_for_domain", "Builds settings/frameworks for jewellery stones, outside transport-interior scope."),
    "jewellery polisher": ("unsupported_for_domain", "Cleans and polishes jewellery for customers or sale; not transport-interior finishing."),
    "jewellery repairer": ("unsupported_for_domain", "Repairs and resizes jewellery; unrelated to transport interiors."),
    "marine upholsterer": ("supported", "Manufactures, assembles and repairs interior components for boats; direct vessel-interior work."),
    "merchandiser": ("unsupported_for_domain", "Positions goods for sale; not transport-interior design, manufacture, fitting or restoration."),
    "milliner": ("unsupported_for_domain", "Designs and makes hats/headwear, not transport interiors."),
    "precious stone cutter": ("unsupported_for_domain", "Cuts gemstones and fabricates jewellery; outside transport-interior scope."),
    "precious stone setter": ("unsupported_for_domain", "Sets gemstones into jewellery; unrelated to transport interiors."),
    "silversmith": ("unsupported_for_domain", "Designs and makes silver jewellery and related items; no transport-interior task is described."),
    "tailor": ("unsupported_for_domain", "Makes and alters bespoke clothing and headwear, not transport interiors."),
    "upholsterer": ("supported", "The task explicitly upholsters objects including vehicle parts and installs, repairs or replaces their soft coverings; vehicle-interior work is direct evidence."),
    "visual merchandiser": ("unsupported_for_domain", "Promotes goods through retail presentation; not transport-interior work."),
    "wig and hairpiece maker": ("unsupported_for_domain", "Makes hair prostheses for performance use; unrelated to transport interiors."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D133"]
    names = [row["role_name"] for row in rows]
    if len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D133 exact role-name mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_TASK_PROFILE", "EASA_AIRCRAFT_INTERIORS", "IMO_SHIP_ACCOMMODATION"]})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D133", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare tasks only with bespoke design, manufacture, fitting and restoration of interiors for aircraft, ships and vehicles. Explicit aircraft/boat/vehicle-interior tasks are supported. General furniture/interior work is conditional only when the same task could plausibly be performed on transport interiors but the record does not establish that context. Fashion, performance costume, jewellery, retail merchandising and other unrelated craft tasks are unsupported. No title, subgroup, frequency or specialization determines fit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["Every D133 queue key was matched exactly and each recorded task was compared with transport-interior scope.", "EASA and IMO sources substantiate aircraft cabin and ship accommodation as transport-interior contexts; they do not justify adding general fashion or furniture occupations to this domain.", "Conditional items are not confirmed student-facing role paths; they require transport-interior context in the underlying role record.", "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D133 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines += ["", "## Sources and limitations", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
