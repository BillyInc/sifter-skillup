"""Repair four source-confirmed Physiotherapy course extraction defects."""

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
    courses = packages[0]["courses"]
    rows = {}
    for code in ("PST 523", "PST 524", "PST 525", "PST 526"):
        matches = [row for row in courses if row.get("code") == code]
        if len(matches) != 1:
            raise SystemExit(f"Expected one {code}; got {len(matches)}")
        rows[code] = matches[0]

    p523, p524, p525, p526 = (rows[c] for c in ("PST 523", "PST 524", "PST 525", "PST 526"))
    if p523["lh"] is not None or "Allied Health Sciences" not in p523["skills_learned"][-1]:
        raise SystemExit("PST 523 preimage changed; refusing repair")
    if not p524["content_summary"].endswith("Neuro developmenta"):
        raise SystemExit("PST 524 preimage changed; refusing repair")
    if p525["ph"] is not None or "Allied Health Sciences" not in p525["skills_learned"][-1]:
        raise SystemExit("PST 525 preimage changed; refusing repair")
    if p526["ph"] is not None or not p526["skills_learned"][-1].endswith("600 Level"):
        raise SystemExit("PST 526 preimage changed; refusing repair")

    p523.update(
        lh=30,
        skills_learned=[
            "discuss the differences between community-based and hospital-based physiotherapy services;",
            "explain the philosophy of primary health care;",
            "describe how community-based and primary health-care services are organized;",
            "discuss physiotherapy services in Nigeria.",
        ],
        content_summary=(
            "Health education, contact, screening and health talks; establishing community physiotherapy "
            "clinics in villages and towns; itinerant and domiciliary services; community-based rehabilitation; "
            "and primary health-care principles and physiotherapy services in Nigeria."
        ),
        source_outcome_note=(
            "The third NUC outcome is malformed in the source text ('discuss the states of community based "
            "and primary;'). It is rendered as an organized-services learning outcome, supported by the "
            "course's clinic, domiciliary-service, CBR and PHC contents."
        ),
        source_conflict_note=(
            "The global course table title is 'Community Based Physiotherapy and Primary Health Care'; "
            "the detailed course block title is 'Community-Based Physiotherapy & Primary Care Physiotherapy'. "
            "The stored title follows the detailed block."
        ),
        source_url=URL,
        source_locator="PST 523 global table printed p. 589; detailed block printed pp. 623-624, lines 24279-24292",
        source_accessed_on=ACCESS_DATE,
    )

    p524.update(
        content_summary=(
            "Study movement development during the first five years, motor-control theories and reflexes; "
            "assessment and physiotherapy management of cerebral palsy, spina bifida, Down syndrome, autism, "
            "acute flaccid paralysis, Guillain-Barré syndrome, brachial-plexus injury and muscular dystrophy; "
            "and childhood orthopaedic and cardiorespiratory disorders."
        ),
        source_conflict_note=(
            "The global course table uses 'Paediatric Physiotherapy'; the detailed course block uses "
            "'Paediatrics Physiotherapy'. The stored title follows the detailed block."
        ),
        source_url=URL,
        source_locator="PST 524 global table printed p. 589; detailed block printed p. 624, lines 24293-24316",
        source_accessed_on=ACCESS_DATE,
    )

    p525.update(
        ph=90,
        skills_learned=[
            "demonstrate skills in history taking and physical examination in paediatric disorders;",
            "analyse clinical data, set goals and identify treatment outcomes for paediatric conditions;",
            "communicate management plans with parents and carers; and",
            "manage paediatric conditions commonly seen in physiotherapy clinics.",
        ],
        content_summary=(
            "Clinical rotation covering history taking, physical examination, disability measurement, clinical "
            "judgment and management for children with cerebral palsy, brachial-plexus injuries, spina bifida, "
            "acute flaccid paralysis, post-immobilisation stiffness, muscular dystrophy and Down syndrome. "
            "Students practise communicating treatment goals, plans, home exercises and advice to caregivers."
        ),
        source_url=URL,
        source_locator="PST 525 global table printed p. 589; detailed block printed pp. 624-625, lines 24317-24331",
        source_accessed_on=ACCESS_DATE,
    )

    p526.update(
        skills_learned=[
            "demonstrate history taking, physical examination and relevant assessment for paediatric patients and patients with head or spinal-cord injuries and other neurosurgical conditions;",
            "use clinical reasoning and judgment to manage common paediatric conditions treated by physiotherapy;",
            "use clinical reasoning and decision-making when managing head and spinal-cord injuries and other neurosurgical conditions;",
            "communicate management plans and relevant information to patients; and",
            "manage, evaluate and reassess patients with head and spinal-cord injuries and other neurosurgical conditions.",
        ],
        content_summary=(
            "Externally moderated clinical examination of neurological, neurosurgical and paediatric "
            "physiotherapy skills, including assessment, clinical reasoning, management, communication, "
            "evaluation and reassessment. The detailed course block describes a 45-hour practical, while "
            "the global course table shows dashes for both lecture and practical hours; the hours conflict "
            "is retained rather than silently resolved."
        ),
        source_conflict_note=(
            "PST 526 global structure (printed p. 589) has dashes for LH/PH; its detailed block (printed p. 625) "
            "states PH 45. Stored PH remains null pending source-conflict policy; do not infer a resolved load."
        ),
        source_url=URL,
        source_locator="PST 526 global table printed p. 589; detailed block printed p. 625, lines 24332-24348",
        source_accessed_on=ACCESS_DATE,
    )

    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired PST 523-526 extraction defects; preserved source conflicts explicitly.")


if __name__ == "__main__":
    main()
