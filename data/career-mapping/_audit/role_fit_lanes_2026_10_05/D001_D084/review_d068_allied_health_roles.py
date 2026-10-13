"""Build exact-key D068 allied-health role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D068_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D068_role_domain_fit_review_2026_10_05.md"
WHO_WORKFORCE = "https://www.who.int/teams/noncommunicable-diseases/sensory-functions-disability-and-rehabilitation/rehabilitation/workforce"
WHO_RCF = "https://www.who.int/publications/b/54312"
ASHA_SLP = "https://www.asha.org/Students/Speech-Language-Pathologists/"
ASHA_DYSPHAGIA = "https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/"

DECISIONS = {
    "advanced physiotherapist": ("supported", "Advanced clinical physiotherapy is a defined specialization within physiotherapy and patient rehabilitation; the task states specialized clinical practice, education, research or professional leadership.", None),
    "anaesthetic technician": ("supported", "The task prepares and supports anaesthesia and peri-operative patient care, a diagnostic/treatment-support role in the domain's allied-health setting.", None),
    "anatomical pathology technician": ("supported", "The task supports pathology and post-mortem diagnostic work, specimen handling and records under medical supervision; it directly supports clinical diagnosis.", None),
    "animal assisted therapist": ("conditional", "The task applies an animal-assisted intervention plan to cognitive, motor or social-emotional disability. Include only as a defined, appropriately governed rehabilitation/therapy intervention, not as an independently validated clinical credential.", "a documented rehabilitation or therapeutic plan with qualified clinical oversight and outcome/safety controls"),
    "art therapist": ("supported", "The task uses a structured artistic therapeutic process to address psychological/emotional difficulties and facilitate patient self-understanding, directly fitting therapeutic care.", None),
    "audiologist": ("supported", "The task assesses, diagnoses and treats hearing/vestibular disorders and supports sensory rehabilitation; WHO identifies audiologists in the rehabilitation workforce.", None),
    "biomedical scientist": ("supported", "The task performs and validates laboratory analyses used in medical examination, monitoring, treatment and research, directly supporting diagnosis and care.", None),
    "biomedical scientist advanced": ("supported", "The task conducts advanced translational biomedical laboratory research, teaches the profession and consults clinically, fitting diagnostic/research support in allied health.", None),
    "chiropractic assistant": ("conditional", "The task provides routine patient-care and administrative support under a chiropractor. It fits only as delegated clinical support within an authorized healthcare service, not as independent diagnosis or treatment.", "defined delegated support duties under the relevant practitioner and local regulation"),
    "chiropractor": ("supported", "The task diagnoses, treats and seeks to prevent neuromusculoskeletal disorders; it is a direct health-treatment role, although professional status and scope vary by jurisdiction.", None),
    "cytotechnologist": ("supported", "The task examines human-cell samples for abnormalities, cancer and infectious agents under supervision, directly supporting laboratory diagnosis.", None),
    "dance therapist": ("supported", "The task uses dance/movement interventions in a therapeutic setting for mental, physical and emotional health needs, directly matching rehabilitation/therapy.", None),
    "diagnostic radiographer": ("supported", "The task performs diagnostic imaging using X-ray, MRI and ultrasound technologies, directly matching diagnostic support in the domain.", None),
    "dietetic technician": ("supported", "The task supports patient nutrition programmes and reviews under dietitian supervision as part of a treatment plan, directly supporting allied healthcare.", None),
    "dietitian": ("supported", "The task assesses nutritional needs and provides evidence-based advice to maintain or restore health, directly matching treatment and recovery support.", None),
    "kinesiologist": ("conditional", "The task studies and applies human movement science to improve motion. This fits when assigned to clinical rehabilitation or health services; performance/sport research alone is not necessarily allied healthcare.", "a patient rehabilitation, functional assessment or health-service assignment"),
    "massage therapist": ("conditional", "The task provides therapeutic massage for well-being, but the task text does not establish clinical rehabilitation or regulated health-service practice.", "a defined therapeutic rehabilitation assignment within locally authorized scope and referral safeguards"),
    "medical physics expert": ("supported", "The task applies radiation physics, dosimetry and radiation protection to medical exposure and diagnostic/reference equipment, directly supporting safe diagnosis and treatment.", None),
    "music therapist": ("supported", "The task uses music-based therapeutic interventions for behavioural/health conditions and to maintain or restore health, directly fitting therapy services.", None),
    "nuclear medicine radiographer": ("supported", "The task performs nuclear-medicine examinations and treatment using imaging techniques and radiopharmaceuticals, directly supporting diagnosis/treatment.", None),
    "occupational therapist": ("supported", "The task rehabilitates people with disease, physical or mental limitations to regain daily functioning; WHO identifies occupational therapists in the rehabilitation workforce.", None),
    "occupational therapy assistant": ("supported", "The task supports people to engage in daily occupations under occupational therapy frameworks; WHO identifies occupational therapy as a rehabilitation profession.", None),
    "optometrist": ("supported", "The task examines eyes, identifies visual disorders, prescribes/fits lenses and refers patients, directly providing vision-health services.", None),
    "orthoptist": ("supported", "The task diagnoses and treats binocular vision, amblyopia, strabismus and eye-movement disorders, directly supporting ophthalmic rehabilitation.", None),
    "osteopath": ("conditional", "The task treats musculoskeletal disorders using manipulation and manual techniques. Include only as an authorized, evidence-governed clinical service; scope and recognition differ across jurisdictions.", "a locally authorized healthcare/rehabilitation assignment, without implying universal recognition or efficacy"),
    "physiotherapist": ("supported", "The task develops, maintains and restores movement and function through evidence-based practice and treatment/prevention, directly matching rehabilitation; WHO identifies physiotherapists in its rehabilitation workforce.", None),
    "physiotherapy assistant": ("supported", "The task carries out defined physiotherapy procedures and equipment/data support under the delegating professional, directly supporting rehabilitation delivery.", None),
    "podiatrist": ("supported", "The task assesses, diagnoses and treats foot/lower-limb conditions and injuries, directly providing clinical care and rehabilitation.", None),
    "podiatry assistant": ("supported", "The task supports diagnosis/treatment of foot disorders and patient foot-care education under the podiatrist, directly supporting mobility and care.", None),
    "prosthetic-orthotics technician": ("supported", "The task designs, fabricates, fits and repairs assistive braces and medical appliances; WHO identifies prosthetists/orthotists in the rehabilitation workforce.", None),
    "radiographer": ("supported", "The task uses medical imaging, radiotherapy and nuclear-medicine technologies to examine, treat and care for patients, directly matching diagnostic/treatment support.", None),
    "recreational therapist": ("supported", "The task uses therapeutic recreation interventions to maintain or restore health and function for people with behavioural/health conditions, directly matching therapy services.", None),
    "respiratory therapy technician": ("supported", "The task operates respiratory equipment to assess/support treatment of breathing disorders in clinical settings, directly supporting diagnosis and treatment.", None),
    "shiatsu practitioner": ("conditional", "The task describes a traditional/energy-based modality and claims health-maintenance/treatment effects, but does not establish clinical evidence or recognized allied-health scope.", "a locally authorized, evidence-governed adjunctive service within a defined rehabilitation plan; do not present claimed mechanisms as established medicine"),
    "sophrologist": ("conditional", "The task offers stress-reduction exercises on a doctor's order but does not establish a recognized rehabilitation profession, efficacy or regulated scope.", "a defined, supervised adjunct to a rehabilitation/health plan, without implying independent clinical practice or established efficacy"),
    "specialist biomedical scientist": ("supported", "The task leads a specialist diagnostic/research laboratory function and acts as a clinical diagnostic partner for patient illnesses, directly supporting diagnosis and treatment.", None),
    "specialist chiropractor": ("conditional", "The task is advanced clinical practice within chiropractic. It is related to health treatment, but the profession's recognition and scope vary internationally and locally.", "a locally authorized clinical assignment with explicit scope; no assumption of universal regulation or efficacy"),
    "speech and language therapist": ("supported", "The task assesses, diagnoses, treats and prevents communication and swallowing disorders. WHO identifies speech/language therapists in rehabilitation; ASHA confirms the task boundary.", None),
}


def _urls(refs: list[str]) -> list[str]:
    out = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            out.append(url)
    return list(dict.fromkeys(out))


def build() -> dict:
    q = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in q["role_mappings"] if r["domain_id"] == "D068"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 38 or len(by_name) != 38 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D068 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([WHO_WORKFORCE, WHO_RCF, ASHA_SLP, ASHA_DYSPHAGIA])
        action = "retain_parent_domain_link_candidate" if status == "supported" else "do_not_present_as_confirmed_D068_role_without_assignment_evidence"
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "domain_fit_status": status,
                          "task_evidence": row["role_task_text"], "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "WHO identifies core rehabilitation professions and defines workforce scope but does not enumerate every allied-health occupation. ESCO/O*NET task profiles may reflect occupational concepts from particular jurisdictions. ASHA is a US professional body. Conditional modalities are not endorsed as effective or universally regulated; each disposition is task-fit only and makes no licensing, local demand or student eligibility claim.",
                          "recommended_action": action})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D068", "domain_name": "Allied Health and Rehabilitation Therapies",
            "scope": "D068 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 38 exact D068 mappings against the parent scope of diagnostic/treatment support and rehabilitation alongside other healthcare professionals. WHO's rehabilitation workforce and competency framework establish the core cross-professional boundary. Task-specific ESCO/O*NET evidence is retained per row; broad wellness, complementary modalities and movement science are conditional unless tied to authorized clinical rehabilitation. This is not a regulatory or clinical-efficacy review.",
            "scope_sources": [WHO_WORKFORCE, WHO_RCF, ASHA_SLP, ASHA_DYSPHAGIA],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. Conditional entries require the exact clinical assignment and local scope/authorization noted; no canonical changes or alternative assignments are made."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D068 — Allied Health and Rehabilitation Therapies: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/38 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d['conditional_scope'] else "") + " |" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[WHO's rehabilitation workforce overview]({WHO_WORKFORCE}) names audiologists, occupational therapists, physiotherapists, prosthetists/orthotists and speech/language therapists among rehabilitation occupations. The [WHO Rehabilitation Competency Framework]({WHO_RCF}) supplies a cross-professional competency reference. [ASHA's SLP overview]({ASHA_SLP}) and [dysphagia practice portal]({ASHA_DYSPHAGIA}) corroborate communication/swallowing task scope.",
                  "", "Conditional is not confirmed: massage, complementary/manual modalities, generic movement-science work and broad adjunctive therapies require the assignment and scope conditions stated. This fit review does not validate a treatment or credential.",
                  f"", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/38; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
