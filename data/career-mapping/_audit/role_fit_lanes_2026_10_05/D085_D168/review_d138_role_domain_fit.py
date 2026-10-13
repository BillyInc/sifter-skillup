import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D138_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D138_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D138 role_key and recorded task description for each mapping.",
        "supports": "The specific work claims assessed for fit with biomedical engineering and healthcare technology.",
        "limit": "The queue is the audited record, not independent proof of the occupation's full scope.",
    },
    "WHO_BIOMEDICAL_ENGINEERING": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/i/item/9789241565479",
        "locator": "Medical Device Technical Series, Human resources for medical devices: the role of biomedical engineers; lifecycle contributions from conception through use, including design, development, regulation, evaluation and training.",
        "supports": "Biomedical/clinical engineering roles connected to medical-device lifecycle and health-care technology.",
        "limit": "WHO notes that titles and role composition differ internationally and may include technicians and related fields.",
    },
    "WHO_HEALTH_TECHNOLOGY_MANAGEMENT": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://cdn.who.int/media/docs/default-source/medical-devices/health-technology-management/country-data-on-health-technology-management.pdf?sfvrsn=4c8eefbb_3",
        "locator": "Health technology management discussion: biomedical/clinical engineers apply engineering and physical/biological sciences to medical technology; technicians focus on medical-equipment maintenance.",
        "supports": "Medical-device engineering and technician task boundaries.",
        "limit": "The source describes health-technology systems and does not assign this project's role records to domains.",
    },
    "FDA_DEVICE_DEVELOPMENT": {
        "publisher": "U.S. Food and Drug Administration (FDA)",
        "url": "https://www.fda.gov/patients/device-development-process/step-1-device-discovery-and-concept",
        "locator": "Medical-device development process, discovery and concept; FDA describes device risk classes and the path from need/concept to testing and review.",
        "supports": "The product-design and development context for device-engineering/assembly work.",
        "limit": "FDA regulatory process is U.S.-specific; it is cited for device-development context, not universal law or licensing.",
    },
    "BMES_BIOMEDICAL_ENGINEERING": {
        "publisher": "Biomedical Engineering Society (BMES)",
        "url": "https://member.bmes.org/faqs-about-bme",
        "locator": "FAQ definitions and focus areas: biomedical engineers design/build healthcare devices and work with clinical staff on safe medical-equipment operation.",
        "supports": "The breadth of biomedical engineering, including medical devices, imaging equipment, prosthetics and hospital technology.",
        "limit": "Professional-society overview is broad and illustrative, not a role-specific occupational standard.",
    },
    "GOVUK_BIOMEDICAL_SCIENTIST": {
        "publisher": "UK National Careers Service / GOV.UK",
        "url": "https://nationalcareers.service.gov.uk/job-profiles/biomedical-scientist",
        "locator": "Biomedical scientist profile: tests patient samples to support diagnosis, treatment and prevention of disease in laboratories.",
        "supports": "Distinguishing clinical laboratory biomedical science from biomedical engineering/device design.",
        "limit": "UK role and registration details are jurisdiction-specific; only the task distinction is used here.",
    },
}

DECISIONS = {
    "Bioengineers and Biomedical Engineers": (
        "supported",
        "The exact duties include designing and evaluating health systems and products such as artificial organs, prostheses and instrumentation. These are expressly biomedical-engineering and healthcare-technology tasks, even though the role also covers agriculture and other biological applications.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "BMES_BIOMEDICAL_ENGINEERING"],
    ),
    "bioengineer": (
        "conditional",
        "The recorded profile spans natural-resource conservation, agriculture, food production and genetic modification, but its available text does not establish a medical-device or healthcare application. It belongs here only when the actual work is biomedical/healthcare engineering.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING"],
    ),
    "biomedical engineer": (
        "supported",
        "The task explicitly applies engineering and biological knowledge to medical treatments, medicines and healthcare solutions; the work is directly biomedical, not merely generic engineering.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "BMES_BIOMEDICAL_ENGINEERING"],
    ),
    "biomedical scientist": (
        "unsupported_for_domain",
        "The recorded duties are clinical laboratory analysis and diagnostic testing. That is biomedical/clinical laboratory science, not biomedical engineering, medical-device development or health-technology engineering as defined by this parent.",
        ["QUEUE_TASK_PROFILE", "GOVUK_BIOMEDICAL_SCIENTIST"],
    ),
    "biomedical scientist advanced": (
        "unsupported_for_domain",
        "The recorded focus is advanced translational biomedical laboratory research, education and consultancy. It does not specify engineering design, medical devices or healthcare-technology work.",
        ["QUEUE_TASK_PROFILE", "GOVUK_BIOMEDICAL_SCIENTIST"],
    ),
    "dependability engineer": (
        "conditional",
        "Reliability, availability and maintainability engineering could support medical devices or health technology, but the record describes production systems generically and does not name a healthcare product or setting.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING"],
    ),
    "medical device assembler": (
        "supported",
        "The recorded work manufactures devices used to prevent, diagnose or treat medical conditions, including pacemakers and imaging equipment; this is directly in the health-technology product lifecycle.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "FDA_DEVICE_DEVELOPMENT"],
    ),
    "medical device engineer": (
        "supported",
        "The record explicitly covers design and development of pacemakers, MRI and X-ray equipment plus manufacturing, testing and implementation; these are core biomedical-engineering tasks.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "FDA_DEVICE_DEVELOPMENT", "BMES_BIOMEDICAL_ENGINEERING"],
    ),
    "medical device engineering technician": (
        "supported",
        "The recorded work directly supports design, production, installation, inspection, repair and calibration of medical-technical equipment. WHO identifies medical-equipment maintenance as a healthcare-technology technician function.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "WHO_HEALTH_TECHNOLOGY_MANAGEMENT"],
    ),
    "medical laboratory assistant": (
        "unsupported_for_domain",
        "The task is pre-analytical specimen handling and basic laboratory procedures under biomedical-scientist supervision. It supports clinical diagnostics, not biomedical engineering or healthcare-device engineering.",
        ["QUEUE_TASK_PROFILE", "GOVUK_BIOMEDICAL_SCIENTIST"],
    ),
    "nanoengineer": (
        "conditional",
        "The profile includes biology, chemistry and materials-engineering applications, but spans many sectors and does not state medical nanotechnology, biomaterials or a healthcare product in this record.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING"],
    ),
    "prosthetic-orthotics technician": (
        "supported",
        "The recorded duties design, fabricate, fit and repair braces, joints, supports and other medical appliances; this is direct medical-device and assistive-technology work.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "BMES_BIOMEDICAL_ENGINEERING"],
    ),
    "research engineer": (
        "conditional",
        "The profile describes research and engineering for new products and processes generally. It fits this parent only when the research concerns biomedical engineering, medical devices or healthcare technology, which is not specified in the record.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING"],
    ),
    "robotics engineer": (
        "conditional",
        "Robotics can be used in biomedical devices and healthcare, but the recorded duties describe general robotics and machinery without a medical, biological or healthcare application.",
        ["QUEUE_TASK_PROFILE", "WHO_BIOMEDICAL_ENGINEERING", "BMES_BIOMEDICAL_ENGINEERING"],
    ),
    "specialist biomedical scientist": (
        "unsupported_for_domain",
        "The record is specialist diagnostic biomedical science, clinical research and laboratory diagnosis. No engineering design, medical-device or health-technology task is specified.",
        ["QUEUE_TASK_PROFILE", "GOVUK_BIOMEDICAL_SCIENTIST"],
    ),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D138"]
    queued_names = [row["role_name"] for row in rows]
    if len(rows) != 15 or len(queued_names) != len(set(queued_names)) or set(queued_names) != set(DECISIONS):
        raise SystemExit(f"D138 exact queue mismatch: queued={sorted(queued_names)} decided={sorted(DECISIONS)}")

    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, source_refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": source_refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D138",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role's recorded duties with biomedical engineering, medical-device design/manufacture/maintenance, prosthetics and healthcare technology. Support roles only where healthcare or biomedical work is explicit. Generic engineering roles are conditional where the record leaves the application open; clinical diagnostic laboratory roles are kept distinct from engineering.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": tally["supported"],
            "conditional": tally["conditional"],
            "unsupported_for_domain": tally["unsupported_for_domain"],
            "unresolved": tally["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "notes": [
            "All 15 exact D138 queue mappings were assessed by described tasks; subgroup membership and role title alone were not treated as evidence.",
            "WHO supplies the international healthcare-technology context; FDA supplies device-development context only, not universal law. GOV.UK is used only to distinguish clinical laboratory-science tasks from engineering; its registration rules are not generalized.",
            "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D138 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{tally['supported']}**",
        f"- Conditional: **{tally['conditional']}**",
        f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**",
        f"- Unresolved: **{tally['unresolved']}**", "",
        "| Exact role key | Recorded task evidence | Parent fit | Reason |",
        "|---|---|---|---|",
    ]
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
