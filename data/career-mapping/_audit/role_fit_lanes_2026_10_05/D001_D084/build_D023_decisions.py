"""Materialize exact-key D023 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D023_role_domain_fit_2026_10_05.json"

# Judgments are based on each exact role's task text, not its occupational family.
RULINGS = {
    "Allergists and Immunologists": ("supported", "Diagnosing, treating and preventing allergic and immune-system disease is directly within medical care."),
    "Anesthesiologists": ("supported", "Administering anaesthesia and perioperative pain management is a direct physician function."),
    "Athletic Trainers": ("conditional", "Injury evaluation, emergency care and rehabilitation fit when delivered as clinical musculoskeletal care; athletic-performance support alone is not general medical practice."),
    "Audiologists": ("supported", "Assessing and treating hearing disorders is direct clinical diagnosis and treatment."),
    "audiology technician": ("conditional", "Fitting and servicing hearing devices supports clinical audiology; device retail/manufacture without patient-care work is not sufficient."),
    "Cardiologists": ("supported", "Diagnosing, treating and preventing cardiovascular disease is direct specialist medical practice."),
    "Chiropractors": ("unsupported", "The stated spinal manipulation practice is a distinct therapeutic profession and does not establish a physician-medicine task under this domain's stated scope."),
    "clinical informatics manager": ("conditional", "Clinical information-system operations and practice-improvement research fit when grounded in medical workflows and patient-care quality; generic IT management does not."),
    "clinical perfusion scientist": ("supported", "Operating heart-lung equipment and monitoring circulation during surgery directly supports medical treatment."),
    "Cytogenetic Technologists": ("conditional", "Chromosome analysis supports diagnosis and treatment of inherited or acquired disease when performed in clinical diagnostic services; research-only work is adjacent."),
    "Cytotechnologists": ("supported", "Examining cells to detect cancer and other pathological conditions directly supports medical diagnosis."),
    "Dermatologists": ("supported", "Diagnosing and treating skin, hair and nail disease is direct specialist medical practice."),
    "doctors": ("conditional", "The profile describes supervised procedural and point-of-care support to physicians, rather than independent diagnosis; it belongs as a clinical-support route."),
    "Emergency Medical Technicians": ("conditional", "Emergency assessment, stabilisation and transport directly support urgent medical care, but are not physician diagnosis or continuing treatment."),
    "Emergency Medicine Physicians": ("supported", "Immediate assessment, stabilisation and treatment of acute illness or injury are direct medical practice."),
    "Family Medicine Physicians": ("supported", "Diagnosis, treatment and prevention across the lifespan are direct general medical practice."),
    "General Internal Medicine Physicians": ("supported", "Nonsurgical diagnosis and treatment of diseases and injuries are direct medical practice."),
    "general practitioner": ("supported", "The task profile explicitly covers health promotion, diagnosis and treatment across patient groups."),
    "Genetic Counselors": ("conditional", "Assessing inherited-disease risk and advising families supports medical diagnosis and care; counseling alone is not physician practice."),
    "healthcare institution manager": ("conditional", "Managing hospitals and other care institutions supports delivery of medical services; general institutional administration is not itself clinical medicine."),
    "Histology Technicians": ("conditional", "Preparing tissue slides for pathologist examination supports medical diagnosis; preparation without clinical diagnostic context is adjacent laboratory work."),
    "Histotechnologists": ("conditional", "Evaluating laboratory procedures and preparing diagnostic tissue specimens support medical diagnosis when tied to clinical pathology services."),
    "Hospitalists": ("supported", "Coordinating and providing inpatient diagnosis and treatment is direct hospital-based medical practice."),
    "Medical and Clinical Laboratory Technologists": ("supported", "Complex laboratory testing for diagnosis, treatment and disease prevention directly supports clinical medicine."),
    "Medical Appliance Technicians": ("conditional", "Constructing and maintaining supportive devices fits medical care when prescribed and adapted for patients; general device production alone is not enough."),
    "medical laboratory assistant": ("conditional", "Specimen handling and analyser preparation support clinical diagnosis under biomedical supervision, but are not independent medical practice."),
    "Midwives": ("supported", "Prenatal care and childbirth assistance are direct maternal medical-care activities."),
    "Neurologists": ("supported", "Diagnosing and treating disorders of the nervous system is direct specialist medical practice."),
    "Nurse Practitioners": ("supported", "The profile includes clinical diagnosis, treatment and prevention within a healthcare team."),
    "Obstetricians and Gynecologists": ("supported", "Diagnosis, prevention and treatment of pregnancy-related and reproductive-system conditions are direct medical practice."),
    "Ophthalmic Laboratory Technicians": ("unsupported", "The task profile is lens cutting, polishing and assembly; it establishes optical manufacturing, not diagnosis or treatment of patients."),
    "Ophthalmologists, Except Pediatric": ("supported", "Diagnosing and surgically treating eye disease is direct specialist medical practice."),
    "Oral and Maxillofacial Surgeons": ("supported", "Diagnosing and operating on diseases, injuries and defects of oral/maxillofacial tissues is direct surgical medical care."),
    "Orthopedic Surgeons, Except Pediatric": ("supported", "Diagnosing and surgically treating musculoskeletal disease is direct specialist medical practice."),
    "Orthotists and Prosthetists": ("conditional", "Designing and fitting patient-specific braces and prostheses supports clinical rehabilitation; fabrication without patient assessment is only a technical service."),
    "Pediatric Surgeons": ("supported", "Surgical diagnosis and treatment of fetal, infant and child conditions is direct medical practice."),
    "Pediatricians, General": ("supported", "Diagnosing, treating and preventing childhood disease and injury is direct medical practice."),
    "Physical Medicine and Rehabilitation Physicians": ("supported", "Diagnosing and treating conditions through rehabilitation is direct physician practice."),
    "Physicians, Pathologists": ("supported", "Diagnosing disease through tissue, organ and fluid examination is direct medical practice."),
    "Preventive Medicine Physicians": ("supported", "Applying medical knowledge to prevent disease, injury, disability and death is direct medical practice."),
    "prosthetist-orthotist": ("conditional", "Patient assessment and custom design/fitting of orthoses or prostheses support clinical rehabilitation; production without patient-care duties is insufficient."),
    "Psychiatrists": ("supported", "Diagnosing, treating and preventing mental disorders is direct specialist medical practice."),
    "radiation therapist": ("supported", "Planning and accurately delivering prescribed radiotherapy with patient care directly supports cancer treatment."),
    "Radiologists": ("supported", "Diagnosing disease through medical imaging and performing image-guided treatment are direct medical functions."),
    "specialised doctor": ("supported", "The profile explicitly describes specialist physicians preventing, diagnosing and treating disease."),
    "Sports Medicine Physicians": ("supported", "Diagnosing, treating and preventing activity-related injuries is direct medical practice."),
    "Surgeons, All Other": ("unresolved", "The residual category supplies no specialty-specific task beyond 'all surgeons not listed separately'; the exact clinical scope cannot be independently checked from this record."),
    "Surgical Assistants": ("conditional", "Assisting surgeons during operations supports medical treatment under supervision, but the profile does not establish independent diagnosis or treatment."),
    "Urologists": ("supported", "Diagnosing, treating and preventing genitourinary and renal-gland disorders is direct specialist medical practice."),
}

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"):
        return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"):
        return ref[4:].split("@", 1)[0]
    return None

def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in queue["role_mappings"] if row["domain_id"] == "D023"]
    if len(rows) != 49 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D023 exact role queue changed; re-adjudicate before generation")

    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        if row["role_evidence_state"] == "unsourced" and not refs:
            refs = ["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        if not refs:
            raise SystemExit(f"Missing source reference for {row['role_key']}")
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs,
            "source_limit": "Exact-key ESCO/O*NET task payload is representative occupational evidence; O*NET is US-contextual. A conditional fit requires the stated clinical, diagnostic, treatment or patient-support context. Trend labels do not establish tasks. This is not a licensing determination.",
        })

    counts = Counter(item["domain_fit_status"] for item in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D023",
        "domain_name": rows[0]["domain_name"],
        "scope": "D023 only; exact-role task fit to the parent-domain description. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare each role's stated tasks with medical diagnosis, prevention and treatment of illness, plus clinical laboratory, technical and operational work explicitly supporting patient care. Supported means direct medical practice or direct clinical diagnosis/treatment support; conditional means fit depends on the clinical/patient-care setting stated in the role rationale; unsupported means the cited tasks establish a distinct non-clinical or non-physician practice; unresolved is reserved for a residual title lacking enough task detail. No inference from title, ISCO/ESCO family or subgroup membership.",
        "source_limit_policy": "ESCO/O*NET occupation profiles are representative and jurisdictionally situated, not universal licensing rules. O*NET is US-based. Clinical governance and permitted scope vary by country and employer.",
        "counts": {"reviewed_role_mappings": len(decisions), **{key: counts.get(key, 0) for key in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
