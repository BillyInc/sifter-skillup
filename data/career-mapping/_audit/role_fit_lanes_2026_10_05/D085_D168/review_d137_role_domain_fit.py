import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D137_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D137_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D137 role_key and stored task descriptions for the nine mappings.",
        "supports": "The actual recorded duties being compared to the medical-physics/radiation-therapy parent scope.",
        "limit": "Stored role text is the audited claim, not independent corroboration of occupational scope.",
    },
    "IAEA_SSG46_RADIOTHERAPY_PHYSICS": {
        "publisher": "International Atomic Energy Agency (IAEA)",
        "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Chunks/m_60b8e698-4f59-4c24-809a-dfb819ac5050/c_78757eae-3d98-4ec4-8e35-ec24c3ff0dd9__9_0.Html",
        "locator": "SSG-46 paras 5.208–5.212; calibration, dosimetry and quality assurance for radiation-therapy equipment; para 5.209 assigns calibration responsibility to a medical physicist.",
        "supports": "Medical physicists' direct connection to radiotherapy calibration, dosimetry and equipment QA.",
        "limit": "Safety guidance describes responsibilities, not a universal job taxonomy or national credential rule.",
    },
    "IAEA_MEDICAL_RADIATION_ROLES": {
        "publisher": "International Atomic Energy Agency (IAEA)",
        "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Chunks/m_60b8e698-4f59-4c24-809a-dfb819ac5050/c_4616a381-7a46-4b09-a811-5e170b311e9e__1_0.Html",
        "locator": "SSG-46 general recommendations, roles and responsibilities; medical-radiation-technology specialties include diagnostic radiology, radiation therapy and nuclear medicine.",
        "supports": "The parent domain's clinical imaging, nuclear medicine and radiotherapy scope.",
        "limit": "The guidance recognizes specialty areas; it does not prove every generic role is employed in every specialty or facility.",
    },
    "IAEA_NUCLEAR_MEDICINE_TECHNOLOGIST": {
        "publisher": "International Atomic Energy Agency (IAEA)",
        "url": "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1198_web.pdf",
        "locator": "Nuclear Medicine, section 2.2.2, role of the nuclear medicine technologist; includes radiopharmaceutical preparation, dose calibration, patient preparation, image acquisition and instrument QC.",
        "supports": "The D137 nuclear-medicine technologist's recorded isotope preparation, measurement and diagnostic/tracer-study duties.",
        "limit": "The publication notes that task breadth varies by country, training and local legislation.",
    },
    "IAEA_RADIATION_PROTECTION_OFFICER": {
        "publisher": "International Atomic Energy Agency (IAEA)",
        "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Chunks/m_7a123624-a9ed-40b7-842f-6fd2f3dc37a0/c_effa3774-ff96-484d-9240-9871f047c044__1_0.Html",
        "locator": "IAEA RS-G-1.4, categories of persons to be trained; radiation-protection-officer responsibilities in medical facilities, including diagnostic radiology, radiotherapy and nuclear medicine.",
        "supports": "Medical-facility radiation protection can be part of this domain when the role is assigned to that clinical context.",
        "limit": "The D137 queue text emphasizes nuclear plants/facilities; therefore these general radiation-protection roles are conditional absent a medical-facility assignment.",
    },
}

DECISIONS = {
    "Nuclear Medicine Technologists": (
        "supported",
        "The recorded work prepares, measures and administers radioisotopes for diagnostic, therapeutic and tracer studies. IAEA describes nuclear-medicine technologists performing radiopharmaceutical preparation, dose calibration, patient preparation and image acquisition.",
        ["QUEUE_TASK_PROFILE", "IAEA_MEDICAL_RADIATION_ROLES", "IAEA_NUCLEAR_MEDICINE_TECHNOLOGIST"],
    ),
    "Radiation Therapists": (
        "supported",
        "The recorded duties deliver prescribed radiotherapy, prepare treatment and protection equipment, and may support dosimetry and tumor localization; these are direct radiation-therapy tasks.",
        ["QUEUE_TASK_PROFILE", "IAEA_MEDICAL_RADIATION_ROLES", "IAEA_SSG46_RADIOTHERAPY_PHYSICS"],
    ),
    "clinical perfusion scientist": (
        "unsupported_for_domain",
        "The task is extracorporeal circulation and heart-lung support during surgery. It is a clinical perfusion function, not medical radiation physics, diagnostic nuclear medicine or radiotherapy.",
        ["QUEUE_TASK_PROFILE", "IAEA_MEDICAL_RADIATION_ROLES"],
    ),
    "medical physics expert": (
        "supported",
        "The recorded work explicitly concerns radiation physics in medical exposure, patient dosimetry, radiation protection, equipment selection and QA. IAEA assigns radiation-therapy calibration responsibility to medical physicists and describes their medical-radiation remit.",
        ["QUEUE_TASK_PROFILE", "IAEA_SSG46_RADIOTHERAPY_PHYSICS", "IAEA_MEDICAL_RADIATION_ROLES"],
    ),
    "metrologist": (
        "unsupported_for_domain",
        "The recorded task is general measurement science and method development; it does not specify medical physics, radiation dosimetry or medical-radiological equipment.",
        ["QUEUE_TASK_PROFILE", "IAEA_SSG46_RADIOTHERAPY_PHYSICS"],
    ),
    "nuclear medicine radiographer": (
        "supported",
        "The recorded duties plan and perform nuclear-medicine examinations using radiopharmaceuticals and imaging equipment, directly matching the domain's nuclear-medicine/medical-imaging scope.",
        ["QUEUE_TASK_PROFILE", "IAEA_MEDICAL_RADIATION_ROLES", "IAEA_NUCLEAR_MEDICINE_TECHNOLOGIST"],
    ),
    "radiation protection officer": (
        "conditional",
        "Radiation protection belongs in this domain when the officer is assigned to a medical radiology, radiotherapy or nuclear-medicine facility. The queue description instead emphasizes nuclear plants and facilities, so the medical-context link is not established for this particular record.",
        ["QUEUE_TASK_PROFILE", "IAEA_RADIATION_PROTECTION_OFFICER"],
    ),
    "radiation protection technician": (
        "conditional",
        "Monitoring radiation and controlling contamination can support medical radiation safety, but the recorded profile is facility-general and emphasizes nuclear plants. Count as a fit only when assigned to a medical-radiation facility; the current description does not establish that assignment.",
        ["QUEUE_TASK_PROFILE", "IAEA_RADIATION_PROTECTION_OFFICER"],
    ),
    "radiation therapist": (
        "supported",
        "The recorded task is accurate delivery of prescribed radiotherapy to cancer patients and associated treatment preparation and care; this is the core clinical scope of radiation therapy.",
        ["QUEUE_TASK_PROFILE", "IAEA_MEDICAL_RADIATION_ROLES", "IAEA_SSG46_RADIOTHERAPY_PHYSICS"],
    ),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D137"]
    queued_names = [row["role_name"] for row in rows]
    if len(rows) != 9 or len(queued_names) != len(set(queued_names)) or set(queued_names) != set(DECISIONS):
        raise SystemExit(f"D137 exact queue mismatch: queued={sorted(queued_names)} decided={sorted(DECISIONS)}")

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
        "domain_id": "D137",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role's recorded work with medical physics, diagnostic/nuclear medicine radiation work, and therapeutic radiation. A role is supported only when its described tasks directly sit in that scope; broad radiation-protection roles are conditional unless a medical-facility assignment is stated. A familiar title, ISCO subgroup, or proximity to healthcare is not evidence of fit.",
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
            "All nine exact D137 queue mappings were evaluated from their task descriptions; role title and subgroup membership do not establish domain fit.",
            "IAEA materials provide international technical context for medical physics, radiotherapy, nuclear medicine and medical-facility radiation protection; country-specific authorization and scope-of-practice rules are not inferred.",
            "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D137 role-to-parent-domain fit review — 2026-10-05", "",
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
