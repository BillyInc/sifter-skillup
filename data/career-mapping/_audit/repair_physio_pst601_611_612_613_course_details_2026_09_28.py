"""Restore four Physiotherapy course fields confirmed against NUC CCMAS."""

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
        if course.get("code") in {"PST 601", "PST 611", "PST 612", "PST 613"}:
            if course["code"] in rows:
                raise SystemExit(f"Duplicate {course['code']}; refusing repair")
            rows[course["code"]] = course
    if set(rows) != {"PST 601", "PST 611", "PST 612", "PST 613"}:
        raise SystemExit("Missing or duplicate target course rows")
    if rows["PST 601"]["ph"] is not None or not rows["PST 601"]["content_summary"].endswith("dissertat"):
        raise SystemExit("PST 601 preimage changed; refusing repair")
    if not rows["PST 611"]["content_summary"].endswith("respi"):
        raise SystemExit("PST 611 preimage changed; refusing repair")
    if rows["PST 612"]["units"] is not None or rows["PST 612"]["ph"] is not None:
        raise SystemExit("PST 612 preimage changed; refusing repair")
    if not rows["PST 613"]["title"].endswith("(2 Units") or rows["PST 613"]["units"] is not None:
        raise SystemExit("PST 613 preimage changed; refusing repair")

    rows["PST 601"].update(
        ph=135,
        skills_learned=[
            "under supervision, identify a research problem in physiotherapy;",
            "plan a research study;",
            "execute a data-gathering plan, analyse the data and interpret the results;",
            "report the investigation findings in a dissertation.",
        ],
        content_summary=(
            "Conduct a supervised physiotherapy research project: identify a problem, design and plan the "
            "study, gather and store data, analyse and interpret results, and submit the findings as a "
            "dissertation to the department. The dissertation examination is externally moderated."
        ),
        source_url=URL,
        source_locator="PST 601 global table printed p. 589; detailed course block printed p. 625, lines 24350-24363",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 611"].update(
        content_summary=(
            "Assess respiratory function using symptom history, auscultation, spirometry, chest examination, "
            "radiographs and blood-gas analysis. Apply respiratory physiotherapy techniques, airway clearance, "
            "non-invasive ventilation and basic life support; manage conditions such as COPD, asthma, "
            "bronchiectasis, pulmonary oedema, tuberculosis and post-surgical cases; and cover rehabilitation, "
            "health promotion, smoking cessation, lifestyle changes and paediatric respiratory care."
        ),
        source_conflict_note=(
            "The global table title is 'Cardiorespiratory Physiotherapy'; the detailed block title is "
            "'Cardio-Respiratory Physiotherapy'. The stored title follows the detailed block."
        ),
        source_url=URL,
        source_locator="PST 611 global table and detailed block printed p. 626, lines 24364-24384",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 612"].update(
        units=2,
        ph=90,
        content_summary=(
            "Clinical rotation in cardiopulmonary and intensive care physiotherapy. Assess neurological, "
            "cardiovascular, respiratory, renal, blood, gastrointestinal and musculoskeletal systems; work "
            "with ventilation, intubation and weaning; manage critical conditions and ICU complications; "
            "provide acute post-operative care, support early mobilisation, and follow intensive- and acute-care safety measures."
        ),
        source_url=URL,
        source_locator="PST 612 global table printed p. 589; detailed course block printed pp. 626-627, lines 24385-24407",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 613"].update(
        title="Principles of Management and Administration for Physiotherapy",
        units=2,
        lh=30,
        content_summary=(
            "Study management of physiotherapy services: organisational structure, personnel, communication, "
            "change, finance and legal responsibilities; Nigerian health policy and service delivery; "
            "negotiation and conflict resolution; operations and facilities planning; healthcare ethics and "
            "marketing; and establishing and running a private physiotherapy practice."
        ),
        source_url=URL,
        source_locator="PST 613 global table and detailed course block printed p. 627, lines 24408-24429",
        source_accessed_on=ACCESS_DATE,
    )

    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired PST 601, 611, 612 and 613 fields confirmed by the official NUC CCMAS.")


if __name__ == "__main__":
    main()
