import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D141_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D141_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D141 role_key and task descriptions for all 19 mappings.", "supports": "The recorded tasks compared with D141's stated quantum-computing/technology scope.", "limit": "The queue is the audited record, not independent proof that each title is an established occupational standard."},
    "NATIONAL_QUANTUM_INITIATIVE": {"publisher": "National Quantum Initiative (U.S. interagency programme)", "url": "https://www.quantum.gov/national-quantum-initiative/", "locator": "Quantum information science and technology scope: computing, networking and sensing; quantum technologies use matter's quantum properties for computers, sensors and networks.", "supports": "The technical breadth and adjacent application areas explicitly stated in the D141 scope.", "limit": "A U.S. national programme is used for technical scope corroboration, not as a universal occupational taxonomy or country-neutral regulator."},
    "NQI_WORKFORCE_PLAN": {"publisher": "National Quantum Initiative", "url": "https://www.quantum.gov/wp-content/uploads/2022/02/QIST-Natl-Workforce-Plan.pdf", "locator": "QIST workforce plan; workforce development across computing, simulation, sensing, timing and networking.", "supports": "The existence of cross-disciplinary technical and enabling workforce needs in quantum science/technology.", "limit": "The plan is a U.S. workforce strategy, not proof of standardized titles for each queue role."},
    "DOE_QIST_SCOPE": {"publisher": "U.S. Department of Energy", "url": "https://www.energy.gov/documents/science-technology-st-risk-matrix-2026", "locator": "Quantum information science and technology areas include hardware, error correction/algorithms/simulation, sensing/clocks/metrology and communication.", "supports": "The technical subareas represented in the D141 role descriptions.", "limit": "Government R&D scope is not a labor-market frequency estimate or job-title standard."},
    "NIST_QUANTUM_CRYPTOGRAPHY": {"publisher": "U.S. National Institute of Standards and Technology (NIST)", "url": "https://www.nist.gov/cybersecurity-and-privacy/what-quantum-cryptography", "locator": "Distinguishes quantum cryptography, including quantum key distribution, from post-quantum cryptography based on classical algorithms.", "supports": "Correct classification of quantum-key-distribution/quantum-secure communication tasks as quantum technology, not ordinary PQC implementation.", "limit": "Explains technical distinctions; does not establish that every role title is standardized."},
}

DECISIONS = {
    "quantum algorithm developer": "Develops quantum algorithms, hybrid methods and error mitigation; direct quantum-computing software work.",
    "quantum applications engineer": "Translates application problems into quantum-computing use cases and implementations; direct applied quantum-computing work.",
    "quantum cryptography engineer": "Designs quantum key distribution and quantum-secure communication protocols; fits the quantum-information/communication scope. Do not confuse this with classical post-quantum cryptography.",
    "quantum error correction specialist": "Develops quantum error-correction codes and fault-tolerant protocols; direct reliability work for quantum computation.",
    "quantum hardware engineer": "Designs and characterizes qubits, control systems and cryogenic infrastructure; direct quantum-computing hardware work.",
    "quantum machine learning specialist": "Combines quantum methods with machine learning to develop quantum-enhanced algorithms; direct quantum-computing application work.",
    "quantum policy and standards specialist": "Develops policy and technical standards specifically for the quantum-technology sector; a sector-enabling role within the domain, though not a hands-on engineering role.",
    "quantum sensing specialist": "Applies quantum effects to precision sensors for navigation, imaging and metrology; included because D141's source scope explicitly includes quantum sensors/devices and the wider QIST technical context includes sensing.",
    "quantum simulation scientist": "Uses quantum computers/simulators to model physical, chemical and biological systems; direct quantum simulation and applications.",
    "quantum software engineer": "Builds quantum software, circuits, SDKs and hybrid applications; direct quantum-computing software.",
    "quantum systems architect": "Designs integrated quantum-classical systems from the quantum core through application layers; direct systems-level quantum engineering.",
    "quantum technician": "Operates, maintains and calibrates quantum-technology laboratory equipment; direct technical support for quantum systems.",
    "quantum technology business analyst": "Translates quantum capabilities into use cases, market requirements and implementation decisions; directly supports adoption of quantum technology.",
    "quantum technology core innovator": "Creates new methods, products or research directions explicitly in quantum technology; direct field innovation, though the title is broad and its occupational standardization is not evaluated here.",
    "quantum technology engineering professional": "Designs, integrates, tests and operates quantum-technology systems; direct engineering work in the field.",
    "quantum technology hardware and software specialist": "Develops/supports both hardware and software components of quantum systems; direct cross-stack technical work.",
    "quantum technology practitioner": "Applies quantum technology concepts and tools in a technical/applied setting; direct field practice, although the title is broad and not assessed here for standardization.",
    "quantum technology product strategist": "Sets product direction, partnerships and responsible adoption for quantum products/services; sector-specific product work within the domain, not a claim of hands-on technical qualification.",
    "quantum technology training specialist": "Designs and delivers learning for technical and non-technical quantum-technology users; directly supports capability-building in the domain, not a claim that training alone is engineering practice.",
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D141"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 19 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D141 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": "supported", "rationale": DECISIONS[row["role_name"]], "source_refs": ["QUEUE_TASK_PROFILE", "NATIONAL_QUANTUM_INITIATIVE", "NQI_WORKFORCE_PLAN", "DOE_QIST_SCOPE"] + (["NIST_QUANTUM_CRYPTOGRAPHY"] if row["role_name"] == "quantum cryptography engineer" else [])})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D141", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role task to D141's recorded scope, which explicitly includes quantum software, algorithms, hardware, sensors/devices and applications. The cited QIST authorities corroborate the breadth across computing, simulation, sensing, networking/communication and hardware. Sector-enabling roles are counted as domain-related when their task is explicitly quantum-specific, but this fit audit does not claim that broad titles are standardized occupations or that every such role is hands-on engineering.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 19 exact D141 role keys and task descriptions were checked. Because each record describes quantum-specific work or a quantum-sector enabling function and the parent scope includes computing, hardware, sensors/devices and software, all fit the domain at the broad domain level.", "This is a fit audit, not occupational-title validation. Titles such as core innovator and practitioner are broad and should not be presented as globally standardized titles without a separate role-title evidence review.", "Quantum cryptography/QKD is distinguished from post-quantum cryptography; no claim is made that they are interchangeable.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D141 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
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
