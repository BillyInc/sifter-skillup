"""Exact-key D115 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D115_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D115_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D115 task description and role_key for every mapping.", "supports": "Actual driving/transport work compared with the domain's road movement of people and goods scope.", "limit": "The queue is not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs retained where available in the queue.", "supports": "Standardized occupation concepts and task descriptions.", "limit": "Classification group/title alone does not establish domain fit."},
    "ILO_ISCO08_ROAD_TRANSPORT": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Groups 8322 (car, taxi and van drivers), 8331 (bus/tram drivers), 8332 (heavy truck drivers), and related road/mobile-transport task definitions.", "supports": "International task context for road passenger and freight driving.", "limit": "Classification context only; each disposition is based on the queued tasks versus the explicit D115 scope."},
}

DECISIONS = {
    "Ambulance Drivers and Attendants, Except Emergency Medical Technicians": ("supported", "Drives/assists with an ambulance transporting patients by road. The service purpose is medical, but the task directly operates road transport."),
    "Bus Drivers, Transit and Intercity": ("supported", "Drives buses/coaches on routes, charters and private passenger services; direct road passenger transport."),
    "Car, Van and Motorcycle Drivers": ("unresolved", "The record is a WEF trend/title entry without occupational tasks; the specific road-driving duties cannot be verified from this row."),
    "Driver/Sales Workers": ("supported", "Drives established routes and sells/delivers goods; direct road delivery plus sales."),
    "Heavy Truck and Bus Drivers": ("unresolved", "The record is a WEF trend/title entry without occupational tasks; no specific road-driving duties are provided for fit assessment."),
    "Heavy and Tractor-Trailer Truck Drivers": ("supported", "Operates heavy trucks/tractor-trailers and may unload freight; direct road freight transport."),
    "Light Truck or Delivery Services Drivers": ("unresolved", "The record is a WEF trend/title entry without occupational tasks; no specific delivery-driving duties are provided."),
    "Shuttle Drivers and Chauffeurs": ("supported", "Drives scheduled passenger services, including chauffeur and non-emergency patient transport; direct road passenger transport."),
    "aircraft fuel system operator": ("unsupported_for_domain", "Maintains aircraft fuel systems and refuels planes. This is aviation ground-support work, not road transport."),
    "armoured car driver": ("supported", "Drives an armoured vehicle transporting valuables between locations; direct road freight/security transport."),
    "bus driver": ("supported", "Operates buses/coaches, serves passengers and takes fares; direct road passenger transport."),
    "car and van delivery driver": ("supported", "Delivers goods/packages by car or van and handles loading/unloading and schedule; direct road delivery."),
    "cargo vehicle driver": ("supported", "Drives trucks/vans and may load/unload cargo; direct road freight movement."),
    "concrete pump operator": ("conditional", "Drives a concrete truck to sites and operates a pump to place concrete. The road-haul portion fits; the main specialty includes construction-site pumping, outside ordinary transport."),
    "dangerous goods driver": ("supported", "Transports hazardous goods, fuel and bulk liquids by road; direct road freight transport with specialized cargo handling."),
    "fire service vehicle operator": ("supported", "Drives/operates emergency fire-service road vehicles as part of response operations; direct specialized road-vehicle operation."),
    "hearse driver": ("supported", "Operates a specialized road vehicle transporting deceased persons between locations; direct road passenger/cargo service context."),
    "live animal transporter": ("supported", "Plans and transports live animals by road while monitoring welfare and journey preparation; direct specialized road freight transport."),
    "motorcycle delivery person": ("supported", "Uses a motorcycle to deliver time-sensitive packets, meals, medicines and documents; direct road delivery."),
    "moving truck driver": ("supported", "Drives trucks carrying household goods, machinery and other belongings and helps load them; direct road freight/moving service."),
    "parking valet": ("unsupported_for_domain", "Moves customer vehicles to parking spaces and assists with parking-service tasks; this is vehicle-parking service, not transport of passengers or goods by road."),
    "patient transport services driver": ("supported", "Drives vulnerable/disabled patients to and from care facilities; direct road passenger transport, with a health-service context."),
    "private chauffeur": ("supported", "Drives employers safely to destinations and plans routes; direct private passenger road transport."),
    "refuse vehicle driver": ("supported", "Drives specialized vehicles on collection routes to pick up and transport refuse; direct road collection/transport operation."),
    "taxi driver": ("supported", "Operates a licensed passenger vehicle, transports customers, takes fares and maintains the vehicle; direct road passenger transport."),
    "tow truck driver": ("supported", "Uses tow vehicles to transport disabled/damaged or impounded vehicles; direct specialized road transport and recovery."),
    "tram driver": ("unsupported_for_domain", "Operates a rail-guided tram and serves passengers. This is rail/transit operation, not road vehicle driving as defined by the parent."),
    "trolley bus driver": ("supported", "Operates a road-running trolley/guided bus and carries passengers; direct road passenger transport."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D115"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D115 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"] if fit == "unresolved" else ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_ROAD_TRANSPORT"]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D115", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each exact task with moving people/goods by road and operating road transport. ISCO/ESCO placement, subgroup, title similarity and frequency are not fit evidence. Conditional marks mixed road-transport and construction equipment operation; unsupported means aviation, parking or rail work outside the road-transport parent; unresolved means trend/title-only data without task duties.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 28 D115 role keys were reconciled against the queue exactly before generation.", "The three WEF Future of Jobs trend-only records remain unresolved because they contain no occupational tasks; no role duties were inferred from their titles.", "Road ambulance, patient, emergency and animal transport tasks fit by their actual road-driving duties; their service context does not negate transport fit.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D115 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
