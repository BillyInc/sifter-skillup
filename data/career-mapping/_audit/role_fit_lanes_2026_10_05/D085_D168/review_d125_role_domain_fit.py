"""Exact-key D125 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D125_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D125_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D125 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "ILO_ISCO08_MEDICAL_SECRETARIES": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Group 3344, Medical Secretaries: appointment scheduling, communication, medical chart/document preparation and review, patient forms, medical files, billing and office coordination; includes medical office assistants, practice managers and transcriptionists. Also distinguishes medical-office receptionists (4226) and records technicians (3252).", "supports": "International task family for medical-office administration and documentation.", "limit": "ISCO is a classification and corroborating task reference, not evidence from group membership alone; decisions compare the exact queued task with D125 scope."},
    "WHO_MEDICAL_RECORDS_MANUAL": {"publisher": "World Health Organization", "url": "https://iris.who.int/bitstream/handle/10665/208125/1/9290610050_rev_eng.pdf", "locator": "Medical Records Manual: organization, maintenance, confidentiality and release of medical records.", "supports": "Health-record administration is a specialized healthcare function with confidentiality and patient-record duties.", "limit": "Manual is older and explicitly aimed at developing-country contexts; used only for general records-management context, not current legal requirements."},
}

DECISIONS = {
    "Medical Records Specialists": ("supported", "Compiles, codes, processes and maintains clinical records under health-system requirements, matching D125's accurate/confidential health-record administration."),
    "Receptionists and Information Clerks": ("unsupported_for_domain", "The task is general public/customer information and directions for an unspecified establishment; it does not establish a medical, clinic, hospital or veterinary setting."),
    "front line medical receptionist": ("supported", "Greets/checks in patients, collects patient notes and schedules appointments at a medical facility, directly matching D125."),
    "medical administrative assistant": ("supported", "Provides office correspondence, appointment scheduling and patient-query support to health professionals, directly matching medical secretarial administration."),
    "medical practice manager": ("supported", "Manages day-to-day medical-practice operations, staff and business processes; the parent explicitly includes practice managers."),
    "medical records clerk": ("supported", "Organizes, updates, archives and transfers patient records, directly matching the parent’s health-record duties."),
    "medical records manager": ("supported", "Manages and secures patient-record services, supervises records staff and implements department policies; direct medical-office records administration."),
    "medical transcriptionist": ("supported", "Converts dictated clinical information into formatted, edited medical records; transcription is explicitly included in the parent scope."),
    "receptionist": ("conditional", "The task describes general reception, not healthcare reception. It fits only where this specific role is assigned to a clinic, hospital or veterinary practice; that context is absent from the task evidence."),
    "veterinary receptionist": ("supported", "Provides reception and administrative support in a veterinary practice, a setting expressly included in D125; animal-product sales are ancillary, not the basis for the fit."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D125"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D125 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"]
        if fit != "unresolved":
            refs.append("ILO_ISCO08_MEDICAL_SECRETARIES")
            if "record" in row["role_name"].lower() or "transcription" in row["role_name"].lower():
                refs.append("WHO_MEDICAL_RECORDS_MANUAL")
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D125", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare the exact task with medical-office appointment/reception work, clinical documentation/transcription, patient records and practice administration in the stated hospital, clinic or veterinary context. ISCO classifications corroborate occupational task descriptions but never determine fit by group membership. Conditional means the task could fit only in a healthcare setting not specified by the role record.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D125 role keys were checked against the queue and task text is retained verbatim.", "Healthcare records and transcription are supported because the actual duties handle patient records/clinical dictation, not because they share a broad clerical code.", "Generic receptionist is conditional because its task lacks the healthcare setting; general reception/information work is unsupported for this parent.", "Veterinary receptionist is supported because the task names a veterinary practice and D125 expressly includes that setting.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D125 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
