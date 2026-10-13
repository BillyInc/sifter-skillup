"""Build exact-key D069 aviation role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D069_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D069_role_domain_fit_review_2026_10_05.md"
ICAO_SARPS = "https://www.icao.int/safety/airnavigation/pages/standard-and-recommended-practices-(sarps).aspx"
FAA_PILOTS = "https://www.faa.gov/pilots"
FAA_AIR_TRAFFIC = "https://www.faa.gov/air_traffic"
EASA_AIRWORTHINESS = "https://www.easa.europa.eu/en/domains/aircraft-products/airworthiness"

DECISIONS = {
    "aeronautical information service officer": ("supported", "The task maintains verified operational aeronautical information that supports safe and efficient aircraft operations, matching aviation information services.", None),
    "aeronautical information specialist": ("supported", "The task manages aeronautical information and products such as charts and assesses operational changes affecting flight information, directly supporting aviation operations.", None),
    "air traffic controller": ("supported", "The task directs aircraft movement and provides pilots with operational instructions for safe take-off, landing and en-route movement; this is core air-traffic control.", None),
    "air traffic safety technician": ("supported", "The task installs, operates and maintains air-traffic control/navigation safety systems at airports and aboard aircraft, directly supporting aviation safety systems.", None),
    "aircraft de-icer installer": ("conditional", "The task installs and maintains anti-icing systems on aircraft and spacecraft. The aircraft portion fits aviation; spacecraft installation does not.", "the mapped assignment is aircraft anti-icing/de-icing systems, not spacecraft systems"),
    "aircraft engine specialist": ("supported", "The task diagnoses aircraft/helicopter engine operability, evaluates components and advises maintenance, directly supporting aircraft airworthiness and operation.", None),
    "aircraft gas turbine engine overhaul technician": ("supported", "The task overhauls, inspects, repairs and reassembles aircraft gas-turbine engines, directly supporting aviation maintenance.", None),
    "aircraft maintenance coordinator": ("supported", "The task plans and coordinates aircraft maintenance in airport hangars/workshops, directly matching aviation operations and maintenance.", None),
    "aircraft maintenance engineer": ("supported", "The task inspects, adjusts and repairs aircraft systems to ensure safe flight performance, directly matching aviation maintenance/airworthiness.", None),
    "aircraft maintenance technician": ("supported", "The task performs preventive maintenance and protocol-based inspection of aircraft, engines and components, directly matching aviation maintenance.", None),
    "aircraft pilot": ("supported", "The task controls and navigates aircraft and operates its mechanical/electrical systems while transporting passengers or cargo, directly matching aviation operations.", None),
    "airline transport pilot": ("supported", "The task operates large transport aircraft and holds responsibility for safe, efficient passenger/cargo flight, directly matching airline aviation.", None),
    "airport operations officer": ("supported", "The task monitors airport operational activity and safe aircraft take-offs/landings, directly matching the domain's airport and flight operations.", None),
    "astronaut": ("unsupported", "The task operates crewed spacecraft beyond ordinary commercial-flight altitude for space missions and research. Spaceflight is outside this aviation domain's aircraft/air-travel scope.", None),
    "aviation inspector": ("supported", "The task inspects aircraft maintenance, air-navigation aids, air-traffic control and aviation communications for regulatory compliance, directly matching aviation safety oversight.", None),
    "avionics inspector": ("supported", "The task inspects aircraft electrical/electronic instruments and systems and checks maintenance/modifications against performance and safety standards.", None),
    "cabin crew manager": ("supported", "The task manages cabin crew and onboard aviation safety requirements, directly matching passenger-service and safety functions in air travel.", None),
    "co-pilot": ("supported", "The task supports aircraft command by monitoring instruments, communications, traffic and flight procedures and can take control as required.", None),
    "commercial pilot": ("supported", "The task navigates commercial fixed-wing aircraft for passenger/cargo transport, directly matching aviation operations.", None),
    "drone pilot": ("supported", "The task remotely operates and navigates unmanned aircraft and onboard sensing equipment; this is aviation when performed within applicable unmanned-aircraft rules.", None),
    "flight attendant": ("supported", "The task provides passenger services and onboard safety during airline flights, directly matching the domain's cabin-crew scope.", None),
    "flight instructor": ("supported", "The task teaches and assesses safe aircraft operation and pilot competence for licensing/aircraft transitions, directly supporting aviation operations.", None),
    "flight operations officer": ("supported", "The task compiles dispatch, route, fuel, schedule and aircraft performance information to coordinate aircraft movements, directly supporting flight operations.", None),
    "helicopter pilot": ("supported", "The task plans and flies helicopters to transport passengers/cargo and performs preflight safety checks, directly matching aviation.", None),
    "private pilot": ("supported", "The task operates non-commercial aircraft for personal or private transport, directly matching aircraft operation, although commercial scope is distinct.", None),
    "second officer": ("supported", "The task monitors aircraft systems and performs pre/in/post-flight inspections and minor maintenance in coordination with pilots, directly supporting aviation operations.", None),
    "steward/stewardess": ("conditional", "The task provides food/beverage service across land, sea and air travel. Only the air-cabin assignment fits this aviation domain; other transport assignments do not.", "the mapped work is cabin service on aircraft, not general passenger service across transport modes"),
}


def _urls(refs: list[str]) -> list[str]:
    out = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            out.append(url)
    return list(dict.fromkeys(out))


def build() -> dict:
    q = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in q["role_mappings"] if r["domain_id"] == "D069"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 27 or len(by_name) != 27 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D069 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([ICAO_SARPS, FAA_PILOTS, FAA_AIR_TRAFFIC, EASA_AIRWORTHINESS])
        if name == "astronaut":
            refs.append("https://www.nasa.gov/humans-in-space/astronauts/")
        action = ("retain_parent_domain_link_candidate" if status == "supported" else
                  "candidate_parent_domain_exclusion_after_cross_lane_reconciliation" if status == "unsupported" else
                  "do_not_present_as_confirmed_D069_role_without_assignment_evidence")
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "domain_fit_status": status,
                          "task_evidence": row["role_task_text"], "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "ICAO standards and FAA/EASA materials establish aviation-system and safety context; FAA/EASA are jurisdictional regulators and do not establish global licensing. ESCO/O*NET task descriptions are occupation evidence, not local eligibility or demand. Astronaut duties are spacecraft operations, not aircraft operations. No canonical reassignment is inferred.",
                          "recommended_action": action})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D069", "domain_name": "Aviation and Aerospace Operations",
            "scope": "D069 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 27 exact mappings against the stored domain's aircraft operations, air-traffic safety, aircraft systems/maintenance and cabin crew scope. Aircraft-specific de-icing is separated from spacecraft work, generic passenger service is conditional on air-cabin duties, and astronaut spacecraft operations are excluded. ICAO, FAA, EASA and task-level occupation references corroborate role boundaries without determining local licensing or demand.",
            "scope_sources": [ICAO_SARPS, FAA_PILOTS, FAA_AIR_TRAFFIC, EASA_AIRWORTHINESS],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. Conditional rows require the exact aviation assignment stated; astronaut is a candidate D069 exclusion, not an inferred reassignment. Reconcile other lanes before canonical changes."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D069 — Aviation and Aerospace Operations: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/27 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d['conditional_scope'] else "") + " |" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[ICAO Standards and Recommended Practices]({ICAO_SARPS}) set international aviation-safety standards. [FAA pilot resources]({FAA_PILOTS}) and [air-traffic information]({FAA_AIR_TRAFFIC}) provide US-system examples; [EASA airworthiness]({EASA_AIRWORTHINESS}) describes aircraft-safety regulation. The [NASA astronaut overview](https://www.nasa.gov/humans-in-space/astronauts/) concerns human spaceflight, which is distinct from aircraft operations.", "",
                  "Conditional is not confirmed: mixed spacecraft/aircraft work and general passenger service count only on the aircraft-specific assignment. Spaceflight is not included by aviation adjacency.",
                  f"", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/27; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
