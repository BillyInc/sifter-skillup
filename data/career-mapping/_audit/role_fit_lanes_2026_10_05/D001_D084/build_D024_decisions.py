"""Materialize exact-key D024 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D024_role_domain_fit_2026_10_05.json"

SUPPORTED = {
    "Acute Care Nurses", "advanced nurse practitioner", "Advanced Practice Psychiatric Nurses",
    "Clinical Nurse Specialists", "Critical Care Nurses", "healthcare assistant", "Home Health Aides",
    "Licensed Practical and Licensed Vocational Nurses", "maternity support worker", "midwife",
    "Nurse Anesthetists", "nurse assistant", "Nurse Midwives", "nurse responsible for general care",
    "Nursing Assistants", "paramedic in emergency responses", "Registered Nurses", "respiratory therapy technician",
    "specialist nurse",
}
UNRESOLVED = {"Nursing Professionals"}
CONDITIONAL = {
    "anaesthetic technician", "clinical coder", "community health worker", "covid tester", "dietetic technician",
    "emergency ambulance driver", "first aid instructor", "Medical Assistants", "medical records clerk",
    "medical records manager", "Orderlies", "Patient Representatives", "Personal Care Aides", "Phlebotomists",
    "picture archiving and communication systems administrator", "Psychiatric Aides", "temperature screener",
    "waiting list coordinator",
}

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"): return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@", 1)[0]
    return None

def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in queue["role_mappings"] if row["domain_id"] == "D024"]
    names = {row["role_name"] for row in rows}
    if len(rows) != 38 or names != SUPPORTED | CONDITIONAL | UNRESOLVED:
        raise SystemExit("D024 exact role queue changed or ruling inventory incomplete; re-adjudicate")
    decisions = []
    for row in rows:
        name, task = row["role_name"], row["role_task_text"]
        if name in SUPPORTED:
            status = "supported"
            basis = f"The cited task is hands-on nursing, midwifery, emergency patient care, or direct clinical support explicitly within the parent domain's patient-care scope: {task[:240]}"
        elif name in CONDITIONAL:
            status = "conditional"
            basis = f"The role supports nursing/health services but is not uniformly nursing practice; fit is limited to the clinical patient-care, maternity, emergency-response, or health-service context stated in its task, not generic administration, instruction or personal service: {task[:240]}"
        else:
            status = "unresolved"
            basis = "This WEF trend-only entry has no role-task description. A growth label cannot establish nursing duties or parent-domain fit."
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        if row["role_evidence_state"] == "unsourced" and not refs:
            refs = ["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        if not refs: raise SystemExit(f"Missing source reference for {row['role_key']}")
        decisions.append({"role_key": row["role_key"], "domain_fit_status": status, "task_evidence": task,
            "basis": basis, "source_refs": refs,
            "source_limit": "Exact-key ESCO/O*NET task payload is representative occupational evidence; O*NET is US-contextual. Conditional cases require the clinical or patient-service context described. WEF trend data does not establish tasks. This is not a country-specific licensing determination."})
    counts = Counter(item["domain_fit_status"] for item in decisions)
    artifact = {"schema_version": 1, "domain_id": "D024", "domain_name": rows[0]["domain_name"],
        "scope": "D024 only; task-based fit to parent Nursing domain. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact role tasks to the domain's stated patient care, nursing, midwifery, emergency response and clinical support scope. Supported requires direct patient-care/nursing work; conditional denotes a role whose fit depends on the specified clinical/service assignment; trend-only entries without task evidence remain unresolved. No inference from title, ISCO/ESCO family or subgroup membership.",
        "source_limit_policy": "ESCO/O*NET task descriptions are representative and jurisdictionally situated, not universal licensing rules. O*NET is US-based; role scopes and regulation vary by jurisdiction.",
        "counts": {"reviewed_role_mappings": len(decisions), **{key: counts.get(key, 0) for key in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions}
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))

if __name__ == "__main__": main()
