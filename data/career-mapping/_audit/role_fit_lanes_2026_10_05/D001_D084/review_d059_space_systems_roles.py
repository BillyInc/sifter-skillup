"""Build exact-key D059 Space Technology and Satellite Systems fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D059_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D059_role_domain_fit_review_2026_10_05.md"
ESA_OPS = "https://www.esa.int/About_Us/Careers_at_ESA/Operations_Engineering"
NASA_SEIT = "https://www.nasa.gov/ames-engineering/spaceflight-division/seit/"
ONET_AVIONICS = "https://www.onetonline.org/link/details/49-2091.00"

SUPPORTED = {
    "Aerospace Engineering and Operations Technologists and Technicians": "The task explicitly operates equipment used to launch, track, position, and evaluate air and space vehicles; the space-vehicle duties directly fit the domain.",
    "astronaut": "The task explicitly operates spacecraft for missions beyond ordinary commercial flight, including research and satellite-related work.",
    "Avionics Technicians": "The O*NET task profile expressly includes avionics systems in aircraft or space vehicles, establishing a space-vehicle task route.",
    "satellite engineer": "The task explicitly develops, tests, manufactures, and controls satellite systems and programmes.",
}
CONDITIONAL = {
    "aerospace engineer": "The task spans aircraft and spacecraft engineering. Include in D059 only when the actual assignment concerns spacecraft/astronautical systems rather than aeronautical work.",
    "aerospace engineering drafter": "The task spans aircraft and spacecraft design drawings. Include in D059 only for spacecraft/satellite design assignments.",
    "aerospace engineering technician": "The task spans aircraft and spacecraft test equipment. Include in D059 only where the actual assignment is spacecraft/satellite engineering or operations.",
    "Aerospace Engineers": "The O*NET task profile spans aircraft, missiles, and spacecraft. The D059 mapping is valid only for the space-system portion of that occupation.",
    "avionics technician": "The task spans aircraft and spacecraft avionics. Include in D059 only for spacecraft/space-vehicle systems assignments.",
    "telecommunications engineer": "The task describes general telecom network and radio/broadcast systems. Include in D059 only where the role specifically engineers satellite/spacecraft communications or ground links.",
}
UNSUPPORTED = {
    "avionics inspector": "The supplied task covers inspection of aircraft avionics and maintenance conformity; it does not identify space-vehicle or satellite systems work.",
}


def source_urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        urls.append(url)
    return list(dict.fromkeys(urls))


def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D059"]
    by_name = {r["role_name"]: r for r in rows}
    expected = set(SUPPORTED) | set(CONDITIONAL) | set(UNSUPPORTED)
    if len(rows) != 11 or len(by_name) != 11 or set(by_name) != expected:
        raise SystemExit(f"D059 exact queue changed: {len(rows)} rows; keys={sorted(by_name)}")
    decisions = []
    for name, row in sorted(by_name.items()):
        if name in SUPPORTED:
            status, basis, condition = "supported", SUPPORTED[name], None
            action = "retain_parent_domain_link_candidate"
        elif name in CONDITIONAL:
            status, basis, condition = "conditional", CONDITIONAL[name], CONDITIONAL[name]
            action = "do_not_present_as_confirmed_D059_role_without_space_specific_assignment"
        else:
            status, basis, condition = "unsupported", UNSUPPORTED[name], None
            action = "remove_D059_parent_domain_link_candidate_after_cross_lane_reconciliation"
        refs = source_urls(row["task_source_refs"])
        refs.extend([ESA_OPS, NASA_SEIT])
        if "Avionics" in name or "avionics" in name:
            refs.append(ONET_AVIONICS)
        decisions.append({
            "role_key": row["role_key"], "role_name": name,
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESA and NASA sources establish space-mission engineering/operations functions; O*NET corroborates the stated avionics/space-vehicle task profile where cited. General aerospace/telecommunications occupations may span non-space work, so conditional assignments are not confirmed paths. These sources do not establish local demand or qualifications.",
            "recommended_action": action,
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    payload = {
        "schema_version": 1, "domain_id": "D059",
        "domain_name": "Space Technology and Satellite Systems",
        "scope": "D059 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all 11 exact D059 queue keys. Compared each supplied ESCO/O*NET role-task profile with spacecraft/satellite design, test, operations, and mission systems in the domain scope. ESA Operations Engineering, NASA Systems Engineering/Integration/Test, and O*NET avionics evidence anchored the space-specific task boundary. ISCO/subgroup, title similarity, and general aerospace relevance were not treated as sufficient.",
        "scope_sources": [ESA_OPS, NASA_SEIT, ONET_AVIONICS],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": 0, "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Four mappings have explicit space/spacecraft task evidence; six mixed or broad occupations require a space-specific assignment; aircraft-only avionics inspection is unsupported by current tasks. Do not modify shared canonical data until cross-lane reconciliation.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D059 — Space Technology and Satellite Systems: role-to-parent fit", "",
        "**Slice:** 11/11 exact mappings reviewed against role tasks and parent-domain scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.", "",
        "| Disposition | Count |", "|---|---:|", f"| Supported | {counts['supported']} |", f"| Conditional | {counts['conditional']} |", f"| Unsupported | {counts['unsupported']} |", "| Unresolved fit decisions | 0 |", "",
        "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in decisions)
    lines.extend(["", "## Evidence and limits", "",
        f"[ESA Operations Engineering]({ESA_OPS}) describes the space-mission operations engineering job family, including mission operations and ground infrastructure. [NASA Systems Engineering, Integration & Testing]({NASA_SEIT}) describes engineering work supporting spacecraft and nanosatellites. [O*NET Avionics Technicians]({ONET_AVIONICS}) explicitly includes space vehicles in its occupation task description.",
        "", "Aerospace and telecom occupations often span non-space work. Their D059 links remain conditional until the actual role assignment is tied to spacecraft, satellite, or mission-system tasks. An aircraft-only task is not made space-related by ISCO or subgroup placement.", "", "- Exact queue-key coverage: 11/11; 4 supported, 6 conditional, 1 unsupported.", "- Every disposition includes task text, rationale, source URLs and limits.", "- No shared canonical or specialization data changed."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
