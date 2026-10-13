"""Build exact-key D083 Travel and Tourism role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D083_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D083_role_domain_fit_review_2026_10_05.md"
BLS_TRAVEL = "https://www.bls.gov/ooh/Sales/Travel-agents.htm"
BLS_INFO = "https://www.bls.gov/ooh/office-and-administrative-support/information-clerks.htm"
BLS_CONCIERGE = "https://www.bls.gov/ooh/personal-care-and-service/concierges.htm"
ICAO_CABIN = "https://www.icao.int/cabin-crew-competency-based-training-and-assessment"
UN_TOURISM = "https://www.unwto.org/glossary-tourism-terms"

DECISIONS = {
    "cabin crew manager": ("supported", "The task supervises cabin-crew passenger service and applies onboard aviation safety rules, directly matching air-travel passenger service."),
    "chief conductor": ("supported", "The task supervises passenger-train onboard operations and passenger safety, directly matching rail passenger travel services."),
    "environmental education officer": ("conditional", "The task spans conservation talks, educational resources and guided nature walks. Only the visitor/tourism-guiding part maps to this domain; environmental education alone belongs elsewhere.", "Retain under Travel and Tourism only for actual guided visitor/nature-tour services; school/business conservation outreach without a tourism or visitor-service assignment is not enough."),
    "flight attendant": ("supported", "The task provides passenger service and safety/comfort during flights; ICAO confirms cabin crew have defined passenger-safety and emergency responsibilities."),
    "ground steward/ground stewardess": ("supported", "The task checks in rail passengers, assists boarding and handles ticket/refund service, directly matching passenger travel support."),
    "host/hostess": ("supported", "The task welcomes and informs visitors at airports, stations, hotels and events and may serve passengers in transport, matching visitor/traveller-facing service."),
    "park guide": ("supported", "The task guides park visitors and interprets natural/cultural attractions, directly matching guided tourism and visitor services."),
    "passenger fare controller": ("supported", "The task checks passenger tickets/fares and answers transport-rule, station and timetable questions, directly supporting passenger travel."),
    "railway passenger service agent": ("supported", "The task answers station customers, provides train information and mobility assistance, and supports safe passenger travel."),
    "railway sales agent": ("supported", "The task sells/reserves rail tickets, handles refunds and answers passenger travel questions, directly matching travel sales and service."),
    "ship steward/ship stewardess": ("supported", "The task serves passengers aboard a vessel, including hospitality and safety information, directly matching passenger travel service."),
    "steward/stewardess": ("supported", "The task provides food/beverage and passenger service across land, sea and air travel, directly matching the domain."),
    "ticket sales agent": ("supported", "The task advises customers, sells travel tickets and matches reservations to travellers' needs, directly matching travel sales/service."),
    "tour operator representative": ("supported", "The task assists tourists at destinations, provides practical information and sells excursions on behalf of an operator, directly matching tour services."),
    "tour organiser": ("supported", "The task plans and manages tourist itineraries and gives practical information to travellers, directly matching tour organisation."),
    "tourist guide": ("supported", "The task accompanies visitors at destinations and interprets cultural/natural heritage, directly matching guided tourism."),
    "tourist information officer": ("supported", "The task advises travellers on attractions, events, transport and accommodation, directly matching visitor information services."),
    "train attendant": ("supported", "The task serves and assists passengers aboard trains, directly matching rail passenger travel services."),
    "train conductor": ("supported", "The task assists passengers boarding/alighting, answers journey questions and checks fares, directly matching passenger travel operations."),
    "travel agent": ("supported", "The task designs/markets travel itineraries and visitor programmes, directly matching travel planning and sales."),
    "travel consultant": ("supported", "The task advises travellers, makes reservations and sells travel services, directly matching travel consultation and booking."),
    "zoo educator": ("supported", "The task interprets zoo/aquarium collections, species and conservation for visitors, directly supporting attraction-based visitor experiences."),
}


def _urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    q = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in q["role_mappings"] if r["domain_id"] == "D083"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    choices = {n.casefold(): (n, *v) for n, v in DECISIONS.items()}
    if len(rows) != 22 or len(by_name) != 22 or set(by_name) != set(choices):
        raise SystemExit(f"D083 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    sources = [BLS_TRAVEL, BLS_INFO, BLS_CONCIERGE, ICAO_CABIN, UN_TOURISM]
    decisions = []
    for folded, (name, status, basis, *_extra) in choices.items():
        row = by_name[folded]
        refs = _urls(row["task_source_refs"])
        refs.extend(sources)
        condition = ("Retain only for actual guided visitor/nature-tour services; non-tourism environmental education outreach alone is not enough."
                     if status == "conditional" else None)
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"],
                          "domain_fit_status": status, "task_evidence": row["role_task_text"],
                          "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "BLS is a US occupational reference; ICAO supplies international aviation standards context; UN Tourism is an intergovernmental tourism source. These sources corroborate task/domain boundaries but do not establish Nigerian demand, local licence requirements or universal entry requirements. Parent-domain fit only.",
                          "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "retain_only_with_task_scope_condition"})
    c = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D083", "domain_name": "Travel and Tourism",
            "scope": "D083 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Compared each role's supplied duties with planning/selling travel, passenger support aboard air/rail/sea services, visitor information, tour organisation/guiding and attraction services. The environmental-education role is conditional because only its guided visitor/nature-walk assignment fits tourism; general environmental outreach is outside this parent scope. Occupation title or transport proximity alone is not used as evidence.",
            "scope_sources": sources,
            "counts": {"reviewed_role_mappings": len(decisions), **{s: c.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": c.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D083 — Travel and Tourism: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/22 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", *[f"| {s.title()} | {c[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"BLS [travel-agent duties]({BLS_TRAVEL}) cover trip planning, packages, excursions, bookings and destination advice. Its [information-clerk profile]({BLS_INFO}) includes passenger reservations, ticketing and itinerary questions; [concierge duties]({BLS_CONCIERGE}) corroborate visitor support. [ICAO cabin-crew training guidance]({ICAO_CABIN}) grounds the passenger safety/service assignment, and [UN Tourism's glossary]({UN_TOURISM}) provides tourism terminology. These sources support role boundaries, not local labour demand or licensure.",
                  "", "Environmental education officer is conditional only for guided visitor/nature-tour duties; education/outreach without a tourism or visitor-service assignment does not establish fit.",
                  "", f"- Exact queue coverage: {c['reviewed_role_mappings']}/22; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
