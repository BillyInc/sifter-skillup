"""Repair confirmed PST 614/621/622/623 extraction defects from NUC CCMAS."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
ACCESS_DATE = "2026-09-28"


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")
    rows = {}
    for course in packages[0]["courses"]:
        if course.get("code") in {"PST 614", "PST 621", "PST 622", "PST 623"}:
            if course["code"] in rows:
                raise SystemExit(f"Duplicate {course['code']}; refusing repair")
            rows[course["code"]] = course
    if set(rows) != {"PST 614", "PST 621", "PST 622", "PST 623"}:
        raise SystemExit("Missing or duplicate target course rows")
    if not rows["PST 614"]["content_summary"].endswith("Phi"):
        raise SystemExit("PST 614 preimage changed; refusing repair")
    if not rows["PST 621"]["content_summary"].endswith("acute fla"):
        raise SystemExit("PST 621 preimage changed; refusing repair")
    if rows["PST 622"]["ph"] is not None or rows["PST 622"]["content_summary"] is not None:
        raise SystemExit("PST 622 preimage changed; refusing repair")
    if "Allied Health Sciences" not in rows["PST 623"]["skills_learned"][-1]:
        raise SystemExit("PST 623 preimage changed; refusing repair")

    rows["PST 614"].update(
        content_summary=(
            "Study physiotherapy in oncology and palliative care: terminal illness and symptom management; "
            "physical, psychosocial and condition-specific problems; pain control and palliation; the role "
            "of physiotherapy; communication, death and dying, spiritual support, bereavement, and "
            "palliative-care organisations."
        ),
        source_url=URL,
        source_locator="PST 614 global table printed p. 589; detailed course block printed p. 627, lines 24430-24445",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 621"].update(
        content_summary=(
            "Study wellness, health promotion and physical fitness in health and disease, including field and "
            "laboratory/clinical assessment. Plan fitness programmes for people with obesity, cardiorespiratory "
            "impairments, amputation, stroke, spinal-cord injury, acute flaccid paralysis, cerebral palsy, "
            "intellectual disability and autism; consider factors that affect engagement."
        ),
        source_conflict_note=(
            "The global table lists LH 20 and PH 45; the detailed course header lists LH 30 and no PH value. "
            "Stored hours follow the detailed header (LH 30, PH null); retain this source-internal conflict "
            "for adjudication rather than selecting the global values silently."
        ),
        source_url=URL,
        source_locator="PST 621 global table printed p. 589 and detailed course block printed p. 628, lines 24446-24461",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 622"].update(
        ph=90,
        skills_learned=[
            "carry out assessment on varieties of patients referred to physiotherapy",
            "make clinical judgments and decisions-making about patients requiring physiotherapy",
            "arrive at appropriate physical diagnosis for patients referred for physiotherapy",
            "use an evidence-based approach to execute appropriate treatments for patients referred to physiotherapy",
        ],
        content_summary=(
            "Clinical posting through musculoskeletal and trauma, paediatrics, women's health, neurology, "
            "cardiorespiratory and intensive care, and geriatrics units. Students spend two weeks in each unit "
            "at the teaching hospital; the course is examined as part of Clinical Practice III."
        ),
        source_conflict_note=(
            "The global table title is 'Summative Physiotherapy Clinical Practice'; the detailed block title is "
            "'Summative Physiotherapy Clinical Posting'. The stored title follows the detailed block."
        ),
        source_url=URL,
        source_locator="PST 622 global table printed p. 589; detailed course block printed p. 628, lines 24462-24476",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 623"].update(
        ph=None,
        skills_learned=[
            rows["PST 623"]["skills_learned"][0],
            "demonstrate skills in clinical reasoning and in making clinical judgments in managing a variety of clinical conditions managed by physiotherapy.",
        ],
        content_summary=(
            "Externally moderated clinical-skills examination covering history-taking, physical examination, "
            "assessment, clinical reasoning and judgment across physiotherapy conditions. The detailed block "
            "identifies PST 611, PST 612 and PST 622 as the covered course scope."
        ),
        source_conflict_note=(
            "The global table shows dashes for LH and PH; the detailed header lists PH 45. Stored PH remains "
            "null pending a consistent policy for this source-internal conflict. The detailed block's exam "
            "description supplies scope despite having no separate Course Contents heading."
        ),
        source_url=URL,
        source_locator="PST 623 global table printed p. 589; detailed course block printed p. 628, lines 24478-24488",
        source_accessed_on=ACCESS_DATE,
    )

    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired confirmed PST 614/621/622/623 extraction defects; source conflicts are retained explicitly.")


if __name__ == "__main__":
    main()
