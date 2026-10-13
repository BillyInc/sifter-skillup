"""Exact-key D122 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D122_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D122_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D122 role_key and task description for every decision.", "supports": "Recorded clinical specimen testing, diagnosis, and the distinct nonclinical laboratory tasks.", "limit": "Local task profiles are not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation identifiers retained where available.", "supports": "Standardized occupational concepts and task profiles.", "limit": "Classification membership alone is not proof of fit."},
    "ILO_ISCO08_MEDICAL_LABS": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 medical/pathology laboratory technician and health-professional task definitions, including analyses of body fluids, tissues and specimens supporting diagnosis and treatment.", "supports": "International occupational boundary for clinical diagnostic laboratory work.", "limit": "The exact role tasks are compared with D122's medical diagnostic testing scope; job title or group alone does not determine fit."},
}

DECISIONS = {
    "Health Technologists and Technicians, All Other": ("unresolved", "The task text only says that the role covers health technologists/technicians not listed elsewhere. It gives no specific laboratory duties or patient-specimen work to compare."),
    "Medical and Clinical Laboratory Technicians": ("supported", "Performs routine medical laboratory tests used to diagnose, treat and prevent disease; direct fit."),
    "asphalt laboratory technician": ("unsupported_for_domain", "Tests asphalt and construction raw materials for product quality; this is materials/civil-engineering laboratory work, not clinical diagnostics."),
    "audiology technician": ("unsupported_for_domain", "Services/fits hearing aids and hearing protection; this is audiology-device service, not laboratory analysis of patient samples."),
    "clinical chemistry technologist": ("supported", "Runs and interprets clinical chemistry analyses on patient specimens; direct diagnostic laboratory work."),
    "cytotechnologist": ("supported", "Microscopically examines cell samples for abnormalities indicating disease; direct clinical cytology diagnostics."),
    "footwear quality control laboratory technician": ("unsupported_for_domain", "Laboratory-tests footwear, materials and components against product standards; industrial footwear quality work, not medical diagnostics."),
    "histotechnologist": ("supported", "Prepares and stains tissue sections for pathologic microscopic examination; direct diagnostic histotechnology."),
    "leather goods quality control laboratory technician": ("unsupported_for_domain", "Tests leather goods/materials against product quality standards; this is manufacturing QA, not clinical laboratory work."),
    "leather laboratory technician": ("unsupported_for_domain", "Performs chemical/physical testing of leather, process chemicals and environmental discharges; industrial/environmental analysis, not patient diagnosis."),
    "medical laboratory assistant": ("supported", "Performs basic pre-analytical and laboratory procedures under biomedical-scientist supervision; direct clinical laboratory support."),
    "medical laboratory manager": ("supported", "Manages daily medical laboratory operations, staff and work schedules; direct leadership within the clinical diagnostic laboratory domain."),
    "medical laboratory technician": ("supported", "Performs routine testing of blood, urine and other body fluids under technologist supervision; direct clinical diagnostics."),
    "medical laboratory technologist": ("supported", "Performs complex biological-specimen analyses used to diagnose and monitor disease; direct clinical laboratory work."),
    "medical laboratory technology vocational teacher": ("conditional", "Teaches medical laboratory technology. The subject is directly within the domain, but the task is vocational education rather than clinical testing; include only if domain roles include specialist educators."),
    "microbiology laboratory technician": ("supported", "Cultures/identifies microorganisms to diagnose infections and support treatment decisions; direct clinical microbiology."),
    "molecular diagnostic technologist": ("supported", "Uses molecular assays such as PCR/sequencing on patient specimens to detect disease markers; direct diagnostic laboratory work."),
    "phlebotomist": ("supported", "Collects patient blood for diagnostic testing, transfusion or donation; direct pre-analytical clinical-laboratory pathway."),
    "prosthetist-orthotist": ("unsupported_for_domain", "Designs and fits prostheses/orthoses for patients; this is rehabilitation/device practice, not diagnostic laboratory testing."),
    "scientific laboratory technician": ("conditional", "Supports laboratory research, analysis and testing for life-science professionals. Clinical specimen/diagnostic work is possible but not established by the general task profile."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D122"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D122 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"] if fit == "unresolved" else ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_MEDICAL_LABS"]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D122", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks with clinical testing and interpretation of patient specimens to diagnose, treat, prevent and monitor disease. ISCO/ESCO group, subgroup, title similarity and frequency are not fit evidence. Conditional marks training/research profiles whose tasks may be relevant but do not specify clinical testing; unresolved means task text is too generic to assess.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 20 D122 exact role keys were matched with the queue, retaining the task descriptions for reproducibility.", "Industrial laboratory QA (asphalt, footwear, leather) is distinguished from clinical diagnostic testing; not all laboratory work belongs to medical laboratory technology.", "The generic 'all other health technologists' row stays unresolved until actual duties are known; no clinical laboratory work is inferred from the category title.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D122 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
