"""Reconcile four audited DPT Physiotherapy course rows to NUC CCMAS 2023."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
ACCESS_DATE = "2026-09-29"
UPDATES = {
    "PST 412": {
        "title": "Musculoskeletal Injuries and Rehabilitation",
        "summary": (
            "Covers musculoskeletal and skeletal disorders, bone infection and mineralisation, muscular and congenital "
            "foot/hand disorders, and spinal conditions including disc lesions, stenosis, spondylolisthesis and "
            "ankylosing spondylitis. It also addresses scoliosis, kyphosis, myofascial pain, fibromyalgia, connective-"
            "tissue disorders, joint replacements, post-operative precautions, soft-tissue injury care and fracture "
            "management."
        ),
        "locator": "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy PST 412, printed p. 615; global structure printed p. 588. Six outcomes checked.",
    },
    "PST 413": {
        "title": "Physiotherapy Clinical Rotation in Orthopaedics and Traumatology",
        "summary": (
            "Clinical rotation in orthopaedic and trauma care: history taking, physical examination, condition-specific "
            "assessment, clinical judgement, treatment and evaluation. Topics include fractures, dislocations, "
            "osteoarthritis, rheumatoid arthritis, back and neck pain, spinal stenosis, chronic and acute soft-tissue "
            "injuries, communication of care goals, fracture management, and skin protection and repair."
        ),
        "locator": (
            "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 588 (table title: "
            "Physiotherapy Clinical Rotation in Orthopaedics and Traumatology) and detailed course block printed pp. "
            "615-616 (detail title: Physiotherapy Clinical Rotations in Orthopaedic and Traumatology)."
        ),
    },
    "PST 414": {
        "title": "Health Management and Outcome Assessments",
        "summary": (
            "Covers health measurement and health statistics; physiotherapy measurement and clinical decision-making; "
            "selecting and integrating outcome measures into practice; clinical measuring instruments; vital signs, "
            "pain, disability, functional performance and anthropometry; physical-fitness, lung- and motor-function "
            "tests; psychometric properties and clinically important change; and quality of life, life satisfaction, "
            "mental status, daily activities and stress."
        ),
        "locator": "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy PST 414, printed p. 616; global structure printed p. 588. Four outcomes checked.",
        "source_anomaly_note": "The official NUC PST 414 outcome 4 says 'patents' in context where 'patients' may have been intended. The local outcome preserves the official source wording; do not silently correct it without an authoritative erratum.",
    },
    "PST 415": {
        "title": "Physiotherapy in Pain Management",
        "summary": (
            "Introduces pain as a fifth vital sign and examines its physical, pathological, emotional, social, "
            "psychological, financial and spiritual effects; pain philosophy, mechanisms and modulation theories; "
            "pain assessment with unidimensional and multidimensional scales; physiotherapy pain-management methods, "
            "including pharmacologic and non-pharmacologic treatment; and the physiotherapist's holistic role."
        ),
        "locator": "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy PST 415, printed p. 616; global structure printed p. 588. Six outcomes checked.",
        "source_anomaly_note": "The official NUC content says 'Pain as a fifth vital signs'; this student-oriented summary paraphrases the concept without reproducing the source grammar error. The source wording remains in the audit record.",
    },
}


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    for code, spec in UPDATES.items():
        marker = f'"code": "{code}"'
        if text.count(marker) != 1:
            raise RuntimeError(f"Expected one {code} row; refusing ambiguous repair")
        at = text.index(marker)
        start = text.rfind("{", 0, at)
        old, end = json.JSONDecoder().raw_decode(text[start:])
        if old.get("code") != code:
            raise RuntimeError(f"{code} identity mismatch")
        updated = dict(old)
        if code == "PST 412":
            outcomes = list(old.get("skills_learned", []))
            if len(outcomes) != 6:
                raise RuntimeError("PST 412 outcome count changed")
            if "Allied Health Sciences" in outcomes[4]:
                suffix = " Allied Health Sciences  615                           New"
                if not outcomes[4].endswith(suffix):
                    raise RuntimeError("PST 412 footer differs from audited source spill")
                outcomes[4] = outcomes[4][: -len(suffix)]
            elif not outcomes[4].endswith("conditions; and"):
                raise RuntimeError("PST 412 outcome differs from both audited states")
            updated["skills_learned"] = outcomes
            if updated.get("units") != 2 or updated.get("lh") != 30 or updated.get("ph") is not None:
                raise RuntimeError("PST 412 structure differs from source-audited values")
        elif code == "PST 413":
            if old.get("units") is None and old.get("ph") is None:
                updated["units"] = 2
                updated["ph"] = 90
            elif (old.get("units"), old.get("ph")) != (2, 90):
                raise RuntimeError("PST 413 units/PH differ from audited baseline and source")
            if old.get("lh") is not None:
                raise RuntimeError("PST 413 LH should remain null for source dash")
        elif code == "PST 414":
            if (old.get("units"), old.get("status"), old.get("lh"), old.get("ph")) != (2, "C", 30, None):
                raise RuntimeError("PST 414 structural values differ from the audited NUC table")
            if len(old.get("skills_learned", [])) != 4 or "patents" not in old["skills_learned"][3]:
                raise RuntimeError("PST 414 source anomaly changed; refusing outcome modification")
            updated["source_anomaly_note"] = spec["source_anomaly_note"]
        elif code == "PST 415":
            if (old.get("units"), old.get("status"), old.get("lh"), old.get("ph")) != (2, "C", 30, None):
                raise RuntimeError("PST 415 structural values differ from the audited NUC table")
            if len(old.get("skills_learned", [])) != 6:
                raise RuntimeError("PST 415 outcomes changed; refusing modification")
            updated["source_anomaly_note"] = spec["source_anomaly_note"]

        if code == "PST 413":
            updated["source_title_variation_note"] = (
                "The NUC global course table and detailed block use slightly different title forms; the stored title follows the global table, while the detailed form is retained in source_locator."
            )
        updated.update(
            {
                "title": spec["title"],
                "content_summary": spec["summary"],
                "source_url": SOURCE_URL,
                "source_locator": spec["locator"],
                "source_accessed_on": ACCESS_DATE,
            }
        )
        indent_start = text.rfind("\n", 0, start) + 1
        indent = text[indent_start:start]
        encoded = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
        replacement = encoded[0] + "\n" + "\n".join(indent + line for line in encoded[1:])
        text = text[:start] + replacement + text[start + end :]

    parsed = json.loads(text)
    physio = next(row for row in parsed["programmes"] if row["name"] == "Physiotherapy")
    for code, spec in UPDATES.items():
        course = next(row for row in physio["courses"] if row["code"] == code)
        if course["content_summary"] != spec["summary"] or course["source_url"] != SOURCE_URL:
            raise RuntimeError(f"Post-repair validation failed for {code}")
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired PST 412-415 content/provenance; preserved source wording anomalies and title variation explicitly.")


if __name__ == "__main__":
    main()
