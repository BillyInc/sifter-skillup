"""Exact-key D123 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D123_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D123_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D123 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "ASRT_MEDICAL_IMAGING_PRACTICE_STANDARDS": {"publisher": "American Society of Radiologic Technologists (ASRT)", "url": "https://www.asrt.org/main/standards-and-regulations/professional-practice/practice-standards-online", "locator": "Practice standard definition and modality-specific scopes: radiography, CT, MRI, mammography, nuclear medicine, radiation therapy and sonography.", "supports": "These are recognized medical imaging/radiation therapy disciplines and distinguishes diagnostic imaging, nuclear medicine and therapeutic radiation work.", "limit": "Professional practice standard is US-based; used as occupational scope corroboration, not as a universal licensing rule."},
    "WHO_RADIATION_SAFETY_HEALTHCARE": {"publisher": "World Health Organization", "url": "https://www.who.int/initiatives/global-initiative-on-radiation-safety-in-health-care-settings/", "locator": "Global initiative scope covering diagnostic/interventional radiology, nuclear medicine and radiotherapy.", "supports": "Global context that radiology, nuclear medicine and radiotherapy are distinct health-care radiation/imaging applications.", "limit": "High-level radiation-safety scope, not a role-by-role occupational standard."},
    "NHS_CLINICAL_PERFUSION": {"publisher": "NHS Health Careers", "url": "https://www.healthcareers.nhs.uk/printpdf/248", "locator": "Clinical perfusion science role description: cardiac operating theatre, heart-lung equipment, temporary respiratory/circulatory support.", "supports": "Clinical perfusion is cardiopulmonary bypass/surgical support, distinct from radiography and medical imaging.", "limit": "UK occupational description; used to clarify the exact task boundary, not as global regulation."},
}

DECISIONS = {
    "CT technologist": ("supported", "Operates CT scanners to produce diagnostic cross-sectional images, directly within the domain's CT imaging scope."),
    "Diagnostic Medical Sonographers": ("supported", "Produces ultrasound recordings of internal organs for physician diagnosis; ultrasound imaging is explicitly within the parent scope."),
    "MRI technologist": ("supported", "Operates MRI scanners to obtain clinical diagnostic images, directly within the parent scope."),
    "Magnetic Resonance Imaging Technologists": ("supported", "Operates MRI scanners, manages patient safety and image quality, and enters scan data; these are direct medical-imaging tasks."),
    "clinical perfusion scientist": ("unsupported_for_domain", "Operates heart-lung equipment to maintain circulation/respiration during surgery. This is clinical perfusion/cardiac surgical support, not radiography, imaging or radiation treatment."),
    "diagnostic medical sonographer": ("supported", "Uses ultrasound equipment to image soft tissues, organs and vessels for diagnosis; direct fit to the domain's sonography scope."),
    "diagnostic radiographer": ("supported", "Performs diagnostic examinations using X-ray, MRI and ultrasound equipment; these modalities are expressly inside the parent scope."),
    "fluoroscopy technologist": ("supported", "Operates fluoroscopy for real-time X-ray imaging in diagnostic/interventional procedures; directly within radiography and imaging."),
    "mammographer": ("supported", "Performs breast imaging for screening and diagnosis; mammography is a medical-imaging discipline within the parent scope."),
    "nuclear medicine radiographer": ("supported", "Performs nuclear-medicine examinations and treatments using imaging equipment and radiopharmaceuticals; the parent includes imaging and treatment with radiation."),
    "nuclear medicine technologist": ("supported", "Prepares/administers radiopharmaceuticals and operates imaging equipment for diagnosis and treatment; direct nuclear-medicine work."),
    "radiation therapist": ("supported", "Delivers prescribed radiation treatment for cancer; the parent explicitly includes treating disease with radiation."),
    "radiographer": ("supported", "Operates radiographic equipment to produce diagnostic images for clinical assessment and treatment planning; direct fit."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D123"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D123 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE", "ASRT_MEDICAL_IMAGING_PRACTICE_STANDARDS", "WHO_RADIATION_SAFETY_HEALTHCARE"]
        if row["role_name"] == "clinical perfusion scientist":
            refs.append("NHS_CLINICAL_PERFUSION")
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D123", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each exact task description with the domain's stated diagnostic imaging, ultrasound, CT/MRI, radiography and radiation-treatment scope. ISCO/ESCO group, current placement, title similarity and frequency are not fit evidence. Supported means the task directly performs medical imaging or radiation treatment; unsupported means its stated primary task belongs to a distinct clinical service outside this parent.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 13 D123 exact role keys were matched with the lane queue and each original task description is retained.", "Perfusion is distinguished from medical imaging by its described cardiopulmonary-bypass task, not by subgroup or taxonomy placement.", "ASRT is a US professional practice standard and WHO provides high-level global scope context; neither is represented as a universal licensing rule.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D123 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
