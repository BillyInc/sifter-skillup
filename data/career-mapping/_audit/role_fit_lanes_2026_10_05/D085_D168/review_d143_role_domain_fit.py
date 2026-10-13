import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D143_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D143_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D143 role_key and recorded task for every mapping.", "supports": "The forensic, criminal-investigation, laboratory and cybersecurity tasks actually evaluated.", "limit": "The queue is the audited record, not independent proof of full occupational scope."},
    "FBI_FORENSIC_SCIENCE": {"publisher": "Federal Bureau of Investigation (FBI), Laboratory Division", "url": "https://www.fbi.gov/how-we-investigate/laboratory-division", "locator": "FBI Laboratory Division: forensic examination of evidence across disciplines, evidence collection/analysis/documentation supporting investigations; includes biological testing and other forensic sciences.", "supports": "Forensic laboratory and crime-evidence investigation tasks.", "limit": "U.S. agency practice is used as technical context, not a universal law-enforcement structure."},
    "NIST_DIGITAL_EVIDENCE": {"publisher": "National Institute of Standards and Technology (NIST)", "url": "https://www.nist.gov/itl/ssd/software-quality-group/computer-forensics-tool-testing-program-cftt/digital-evidence", "locator": "Digital Evidence Preservation: evidence integrity, acquisition and preservation for evidence handlers.", "supports": "Digital-forensic preservation and evidence-handling boundaries.", "limit": "Guidance on evidence preservation does not establish a role mapping by title."},
    "NIST_DFIR": {"publisher": "National Institute of Standards and Technology (NIST)", "url": "https://csrc.nist.gov/pubs/sp/800/86/final", "locator": "SP 800-86, Guide to Integrating Forensic Techniques into Incident Response; computer/network forensics and incident-investigation tasks.", "supports": "The overlap between cyber incident response and digital forensics when incident investigation/evidence analysis is part of the task.", "limit": "The guide is technical context, not legal advice or a law-enforcement forensic standard."},
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "ICT resilience manager": (C, "Plans cybersecurity resilience and disaster recovery. This can support response readiness, but the described duties do not establish forensic evidence recovery or criminal investigation.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "ICT security administrator": (C, "Protects information systems from unauthorized access and attack. It may support forensic/incident teams, but the task profile is preventive security rather than evidence examination or investigation.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "Life, Physical, and Social Science Technicians, All Other": (C, "The residual occupation may cover relevant laboratory support, but its generic task text does not identify forensic analysis, evidence handling or investigation.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "Physicians, All Other": (C, "A physician could work in forensic pathology or examine medical evidence, which the parent scope includes, but this residual role record does not identify a forensic specialty.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "bacteriology technician": (C, "Performs bacterial research/testing in a laboratory; such methods can be used in forensic casework, but this task profile does not state evidence or crime-scene work.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "biochemistry technician": (C, "Performs biochemical research/testing; forensic laboratories may use biochemical analysis, but this record does not establish case evidence examination.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "biology technician": (C, "Performs laboratory work on biological materials; relevant methods may support forensic evidence examination, but the profile does not specify forensic casework.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "biotechnical technician": (C, "Supports biotechnology research and testing; forensic applications are possible but are not described in this task profile.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "botanical technician": (C, "Tests plants and botanical properties; botanical evidence can be relevant to investigations, but this record describes general plant research rather than forensic analysis.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "chief ICT security officer": (C, "Sets and manages organizational security policy and controls; this may oversee incident response, but forensic evidence recovery or investigation is not specified.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "criminal investigator": (S, "Examines crime scenes and evidence, protects/records evidence and prepares investigative reports; direct criminal-investigation work.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "cyber incident responder": (S, "Investigates cyber incidents, identifies causes/actors and mitigates and restores systems; direct cyber response and incident investigation within the domain's stated scope.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "cybersecurity risk manager": (C, "Assesses and mitigates ICT security risks, but the described work is risk governance rather than forensic investigation or evidence recovery.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "digital forensics expert": (S, "Recovers, preserves, analyzes and presents facts from digital storage; this directly matches digital forensics and evidence examination.", ["QUEUE_TASK_PROFILE", "NIST_DIGITAL_EVIDENCE", "NIST_DFIR"]),
    "embedded systems security engineer": (U, "Designs protections for embedded/connected systems and safe operation; this is security engineering, not forensic evidence recovery, incident investigation or criminal investigation as described.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "ethical hacker": (U, "Performs authorized vulnerability assessment and penetration testing to identify weaknesses. The task is proactive security testing, not forensic evidence handling or investigation.", ["QUEUE_TASK_PROFILE", "NIST_DFIR"]),
    "knowledge engineer": (U, "Builds structured knowledge bases and AI systems; no forensic, evidence or criminal-investigation task is stated.", ["QUEUE_TASK_PROFILE"]),
    "police detective": (S, "Gathers and compiles evidence, interviews involved parties and uses investigative methods to solve crimes; direct criminal-investigation work.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "police inspector": (C, "Supervises a police division and compliance/administration. It may oversee investigative work, but this record does not identify a criminal-investigation assignment.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "scientific laboratory technician": (C, "Supports testing across several laboratory fields, explicitly including forensic science among possible assignments. The broad task does not establish a forensic-lab placement for this record.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "specialised doctor": (C, "A specialist physician could examine medical evidence in forensic pathology, but this generic specialist-doctor description covers many unrelated medical specialties.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
    "zoology technician": (C, "Supports animal-species research and testing; animal evidence can be examined in forensic work, but the recorded duties do not identify forensic casework.", ["QUEUE_TASK_PROFILE", "FBI_FORENSIC_SCIENCE"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D143"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 22 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D143 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D143", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare exact tasks with forensic science, digital evidence recovery/preservation, cyber incident investigation and criminal investigation. Direct evidence or investigation duties are supported. General laboratory, medical, police-supervision and security-governance roles are conditional where a forensic assignment is possible but not established in the task record. Security engineering/testing unrelated to investigation and knowledge engineering are outside this parent scope as described. Do not infer fit from a science or police label.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 22 exact D143 mappings were assessed by their stored tasks, not subgroup membership or occupational title alone.", "Forensic laboratory methods and digital evidence practices are corroborated by FBI/NIST sources; sources establish task boundaries, not this project's taxonomy or jurisdiction-specific evidentiary rules.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D143 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
