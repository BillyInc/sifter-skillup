"""Build exact-key D077 security/protective-services fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D077_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D077_role_domain_fit_review_2026_10_05.md"

BLS_PROTECTIVE = "https://www.bls.gov/ors/factsheet/protective-service-occupations.htm"
BLS_SECURITY = "https://www.bls.gov/ooh/protective-service/security-guards.htm"
BLS_SOC = "https://www.bls.gov/soc/2018/soc_2018_definitions.pdf"
IMO_SAR = "https://www.imo.org/en/ourwork/safety/pages/searchandrescue-default.aspx"
USFA = "https://www.usfa.fema.gov/"

DECISIONS = {
    "aircraft marshaller": ("unsupported", "The task marshals aircraft during parking and movement. It is an aircraft ground-operations function; the supplied task does not establish security, policing, emergency response or protective service work.", None),
    "airport security officer": ("supported", "The task screens passengers, identity and baggage to prevent prohibited or illegal activity and control secure-area access, directly matching protective security." , None),
    "animal welfare inspector": ("supported", "The task investigates cruelty/neglect, rescues animals at risk and coordinates protective intervention; this is an inspection/enforcement and protective-service function." , None),
    "armoured car guard": ("supported", "The task protects high-value property during secure transport and responds to robbery, directly matching protection of people/property." , None),
    "bodyguard": ("supported", "The task protects a person against threats, attack and harassment and responds to security incidents, directly matching personal protection." , None),
    "civil enforcement officer": ("supported", "The task enforces public parking/traffic rules, supports pedestrian safety and assists crime prevention, matching public-order enforcement." , None),
    "coastguard watch officer": ("supported", "The task patrols sea/coastal areas, prevents illegal activity and coordinates maritime search and rescue; IMO confirms organized maritime SAR as a protective public-safety function." , None),
    "criminal investigator": ("supported", "The task secures and examines crime scenes, preserves evidence and investigates offences, directly matching criminal investigation and public protection." , None),
    "crossing guard": ("supported", "The task controls pedestrian crossings and protects people near roads/railways; BLS includes crossing guards within protective-service occupations." , None),
    "crowd controller": ("supported", "The task controls access and monitors crowds to prevent and respond to safety/security incidents at events, directly matching protective event security." , None),
    "door supervisor": ("supported", "The task controls entry, assesses security risk and manages crowd/emergency incidents at public venues, directly matching private protective services." , None),
    "emergency response worker": ("supported", "The task responds to disaster and emergency scenes, protects/rescues affected people and limits further harm, matching the domain's emergency-response scope." , None),
    "firefighter": ("supported", "The task evacuates/rescues people and responds to fire and other hazardous emergencies, directly matching protective emergency services." , None),
    "game keeper": ("unsupported", "The supplied task manages habitat and wild-game populations. It does not establish policing, public-order protection, security or emergency response; wildlife/resource management alone is outside this domain." , None),
    "gate guard": ("supported", "The task controls access to property and detects/prevents unauthorized entry, theft and security incidents, directly matching protective property security." , None),
    "hospitality establishment security officer": ("supported", "The task implements facility security and protects people, belongings and premises, directly matching private security services." , None),
    "industrial firefighter": ("supported", "The task responds to industrial fires and hazardous-substance emergencies to protect crews and facilities, directly matching emergency protective services." , None),
    "juvenile correctional officer": ("supported", "The task maintains secure custody and safety in a juvenile correctional facility and supervises residents, directly matching correctional protective services." , None),
    "life guard": ("supported", "The task prevents and responds to emergencies to protect people in aquatic facilities; lifeguards are explicitly grouped within protective services by BLS." , None),
    "marine firefighter": ("supported", "The task controls vessel, dock and marine-facility fires and hazards, directly matching emergency response and protection of life/property." , None),
    "mine rescue officer": ("supported", "The task coordinates underground mine rescue in emergencies, directly matching emergency response and protection of life." , None),
    "police detective": ("supported", "The task gathers evidence and investigates crimes with police divisions, directly matching law enforcement and public protection." , None),
    "police inspector": ("supported", "The task supervises police personnel and ensures operational rule compliance, directly matching law-enforcement oversight." , None),
    "police officer": ("supported", "The task prevents/investigates crime, apprehends offenders and protects the public, directly matching the domain." , None),
    "prison officer": ("supported", "The task supervises people in custody, maintains facility security and participates in correctional programmes, directly matching correctional services." , None),
    "pump operator": ("supported", "The task operates fire pumps to deliver extinguishing agents during firefighting; BLS occupational definitions classify fire-engine pump operators in protective fire service." , None),
    "security alarm investigator": ("supported", "The task responds to alarm events, investigates disturbances and contacts law enforcement when trespass is detected, directly supporting property security." , None),
    "security consultant": ("supported", "The task assesses and mitigates threats such as theft, violence and espionage to protect organisations, people and property, directly matching security services." , None),
    "security guard": ("supported", "The task patrols and monitors sites, controls access and responds to threats to people and assets; BLS describes these as core security-guard duties." , None),
    "security guard supervisor": ("supported", "The task supervises protective guards, allocates patrols and develops security plans/drills, directly matching security-service leadership." , None),
    "street warden": ("supported", "The task patrols public spaces, supports community safety and works with police to address suspicious activity and public-order violations, directly matching the domain." , None),
}


def _source_urls(refs: list[str]) -> list[str]:
    urls: list[str] = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D077"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    choices = {n.casefold(): (n, *x) for n, x in DECISIONS.items()}
    if len(rows) != 31 or len(by_name) != 31 or set(by_name) != set(choices):
        raise SystemExit(f"D077 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    scope_sources = [BLS_PROTECTIVE, BLS_SECURITY, BLS_SOC, IMO_SAR, USFA]
    decisions = []
    for folded, (name, status, basis, condition) in choices.items():
        row = by_name[folded]
        refs = _source_urls(row["task_source_refs"])
        refs.extend(scope_sources)
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "BLS is a US occupational classification/reference and does not establish global or Nigerian demand or legal authority. IMO corroborates maritime search-and-rescue context; task-level evidence remains decisive. This is parent-domain fit only, not local licensing/eligibility or subgroup/specialization fit.",
            "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "remove_parent_domain_link_candidate",
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D077", "domain_name": "Security Services",
        "scope": "D077 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compared each exact task with protection of people, property and public order, including private security, law enforcement, corrections, firefighting, rescue and protective public-safety duties. Aircraft marshalling and wildlife habitat/game management were excluded because their supplied tasks do not establish security or protective-service work. BLS protective-service groupings provide a cross-check, not an automatic classification rule; IMO supports maritime SAR boundaries.",
        "scope_sources": scope_sources,
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D077 — Security Services: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/31 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|",
             *[f"| {s.title()} | {c[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"BLS's [protective-service occupation overview]({BLS_PROTECTIVE}) spans firefighting, law enforcement, animal control, private investigation, security, lifeguards, transportation screeners and crossing guards. Its [security-guard profile]({BLS_SECURITY}) describes property protection, access control, patrol, alarms and emergency response; [SOC definitions]({BLS_SOC}) include fire pump operators, marine firefighters and juvenile correctional officers. [IMO search-and-rescue guidance]({IMO_SAR}) supports the maritime rescue function. These are occupational boundary references, not universal demand or licensing evidence.",
                  "", "Aircraft marshaller and game keeper are excluded based on the supplied tasks: aircraft movement/parking and wildlife habitat/game-population management do not themselves establish security or protective services.",
                  "", f"- Exact queue coverage: {c['reviewed_role_mappings']}/31; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- No canonical taxonomy or specialization files were edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
