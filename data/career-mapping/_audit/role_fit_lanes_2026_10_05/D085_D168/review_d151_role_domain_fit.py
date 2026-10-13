import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D151_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D151_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D151 role_key, parent scope and stored task descriptions.",
        "supports": "The specific recorded duties evaluated for each D151 mapping.",
        "limit": "This is the record under audit, not an independent verification of an occupation's complete scope.",
    },
    "ILO_ISCO_POLICE_AND_PRISON_GUARDS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 Volume I, unit groups 5412 Police Officers and 5413 Prison Guards, printed page 258: public-order/law-enforcement, identifying/pursuing/arresting suspected offenders, guarding and maintaining order among prisoners, and supporting rehabilitation programmes.",
        "supports": "Global task-family corroboration for police, detective and correctional-security work.",
        "limit": "ISCO is an international statistical classification, not a universal legal scope, rank structure or licensing rule.",
    },
    "UNODC_NELSON_MANDELA_RULES": {
        "publisher": "United Nations Office on Drugs and Crime (UNODC)",
        "url": "https://www.unodc.org/documents/justice-and-prison-reform/UNODC_Checklist_-_Nelson_Mandela_Rules.pdf",
        "locator": "Checklist on the Nelson Mandela Rules, section 7 'Prison staff', Rules 74 and 77: prison-administration personnel selection, competence and duties toward prisoners.",
        "supports": "The professional correctional-staff context and why custody/supervision tasks fit the corrections portion of the parent domain.",
        "limit": "An international prison-standard checklist; it does not prescribe one country's prison-service titles or all rehabilitation-worker duties.",
    },
    "INTERPOL_DIGITAL_FORENSICS": {
        "publisher": "INTERPOL",
        "url": "https://www.interpol.int/How-we-work/Innovation/Digital-forensics",
        "locator": "Digital Forensics: electronic evidence supports law-enforcement investigations; extraction, analysis and presentation of evidence can support prosecution.",
        "supports": "The criminal-investigation use case for digital evidence and forensic analysis.",
        "limit": "Digital forensics also serves cybersecurity, civil, corporate and other investigations; generic positions are conditional unless criminal/law-enforcement work is established.",
    },
    "ONET_CRIMINAL_JUSTICE_TEACHERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/25-1111.00",
        "locator": "Criminal Justice and Law Enforcement Teachers, Postsecondary (25-1111.00): teaching criminal justice, corrections and law-enforcement administration, including teaching/research combinations.",
        "supports": "The teaching/research fit of the combined criminal-justice and law-enforcement educator family.",
        "limit": "U.S. occupational profile; it corroborates this task family but does not define global faculty requirements.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "Correctional Officers and Jailers": (S, "Guards people in penal or rehabilitative institutions and may escort prisoners. Custody, secure supervision and rehabilitation are explicit parts of the parent scope and align with ILO's prison-guard task family.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS", "UNODC_NELSON_MANDELA_RULES"]),
    "Criminal Justice and Law Enforcement Teachers, Postsecondary": (S, "Teaches criminal justice, corrections and law-enforcement administration, directly educating and researching the fields named by the parent.", ["QUEUE_TASK_PROFILE", "ONET_CRIMINAL_JUSTICE_TEACHERS"]),
    "Digital Forensics Analysts": (C, "The record includes preservation/presentation of digital evidence for criminal and law-enforcement investigations, which fits. It also covers fraud, counterintelligence and cybersecurity mitigation; the specific assignment must be criminal-justice/law-enforcement work.", ["QUEUE_TASK_PROFILE", "INTERPOL_DIGITAL_FORENSICS"]),
    "Dispatchers, Except Police, Fire, and Ambulance": (U, "Schedules and dispatches general transport, freight, installation/service and repair crews. The record expressly excludes police/fire/ambulance dispatch and supplies no criminal-justice or corrections task.", ["QUEUE_TASK_PROFILE"]),
    "First-Line Supervisors of Correctional Officers": (S, "Directly supervises correctional officers and jailers, a core corrections-management responsibility in this parent.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS", "UNODC_NELSON_MANDELA_RULES"]),
    "Probation Officers and Correctional Treatment Specialists": (S, "Provides offender rehabilitation services in custody or on probation/parole and develops rehabilitation/treatment plans, directly matching the parent's offender-rehabilitation function.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "correctional services manager": (S, "Manages correctional-facility operations, staff, procedures and compliance, directly matching the parent’s prison/corrections administration scope.", ["QUEUE_TASK_PROFILE", "UNODC_NELSON_MANDELA_RULES"]),
    "criminal investigator": (S, "Examines crime scenes, safeguards and processes evidence, and documents investigative findings. These are direct offence-investigation and evidence-handling tasks named in the parent scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "criminal justice social worker": (S, "Works on crime prevention, criminal-case/prosecution support, offender reintegration and supervision, and victim support. The stated justice-system and rehabilitation context makes this a supported specialist social-work route in this domain.", ["QUEUE_TASK_PROFILE", "UNODC_NELSON_MANDELA_RULES"]),
    "criminologist": (S, "Studies social and psychological factors associated with criminal behaviour and advises on crime-related policy/organizations. This directly matches the parent’s stated criminology and study of why crime occurs.", ["QUEUE_TASK_PROFILE"]),
    "digital forensics expert": (C, "Recovers, preserves, analyses and presents digital evidence, which may support criminal investigations. The task description does not limit work to criminal justice rather than corporate, civil or cybersecurity cases; fit depends on the assignment.", ["QUEUE_TASK_PROFILE", "INTERPOL_DIGITAL_FORENSICS"]),
    "juvenile correctional officer": (S, "Provides security and supervision in juvenile correctional settings and supports rehabilitation programmes, directly matching corrections and offender rehabilitation in the parent scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS", "UNODC_NELSON_MANDELA_RULES"]),
    "police commissioner": (S, "Leads and oversees a police department's operations, administration, policy and procedures. The role is explicitly situated in a police service, a core criminal-justice institution in the parent scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "police detective": (S, "Gathers and compiles evidence, interviews relevant parties and coordinates investigative work to solve crimes, directly matching the parent's investigation-of-offences function.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "police inspector": (S, "Supervises a police division, personnel, assignments, compliance and records. This is operational supervision within a core criminal-justice institution.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "police officer": (S, "Uses investigation, patrol and enforcement to prevent crime, apprehend offenders and protect the public. Those tasks directly match the parent’s criminal-justice and police-service scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
    "police trainer": (S, "Trains police recruits and serving officers in law, regulations, community relations, firearms, first aid and operational practice. The role is specifically law-enforcement workforce training, not generic teaching.", ["QUEUE_TASK_PROFILE", "ONET_CRIMINAL_JUSTICE_TEACHERS"]),
    "prison instructor": (S, "Teaches people in custody rehabilitation/correctional behaviour and employability skills as part of their reintegration. The correctional setting and rehabilitation purpose place the work within this parent.", ["QUEUE_TASK_PROFILE", "UNODC_NELSON_MANDELA_RULES"]),
    "prison officer": (S, "Supervises inmates, maintains security/order and participates in rehabilitation programmes, directly matching prison operations in the parent description.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS", "UNODC_NELSON_MANDELA_RULES"]),
    "probation officer": (S, "Supervises offenders in the community after release or under non-custodial sentences and supports rehabilitation/reintegration, directly matching the parent's offender-rehabilitation scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_POLICE_AND_PRISON_GUARDS"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D151"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D151 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D151", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Evaluate recorded duties against crime/offence analysis and investigation, public policing, prison/correctional operations and offender rehabilitation. Digital forensics is conditional where the specific case domain is not established. Exclude generic transport dispatch. Titles and subgroup membership are not fit evidence.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "coverage_signal": {
            "lane_queue_mappings_for_D151": len(decisions),
            "interpretation": "This is the count of D151 existing links in the current exact review queue, not a complete active-role total or a coverage-sufficiency judgment. This lane adjudicates existing links and does not add occupations.",
            "zero_or_sparse_signal_in_this_review": "None established from the parent-fit queue alone.",
        },
        "notes": [
            "All 20 exact D151 queued mappings were assessed using their recorded tasks; titles and subgroup membership are not proof of fit.",
            "Digital-forensics occupations are conditional because the same methods can serve law enforcement, corporate, civil and cybersecurity contexts; only the criminal-justice/law-enforcement branch is confirmed in scope.",
            "Police and corrections classifications corroborate occupational task families but do not impose jurisdiction-specific authority, rank, qualification or legal powers.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [f"# D151 role-to-parent-domain fit review — {payload['audit_date']}", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Coverage signal (separate from fit)", "", f"D151 has **{len(decisions)} existing links in this lane's exact review queue**. This is not a complete active-role total or a coverage-sufficiency judgment; no zero/sparse conclusion is inferred from this fit queue.", "", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
