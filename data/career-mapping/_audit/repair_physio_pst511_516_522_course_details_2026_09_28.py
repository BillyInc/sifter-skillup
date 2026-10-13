"""Restore three Physiotherapy course details against the official NUC CCMAS."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
ACCESS_DATE = "2026-09-28"

REPAIRS = {
    "PST 511": {
        "expected_title": "Neurological Physiotherapy II",
        "expected_outcomes": [
            "describe the aetiology, pathological basis and clinical features of neurological conditions"
        ],
        "outcomes": [
            "describe the aetiology, pathological basis and clinical features of neurological conditions listed in the course content;",
            "outline treatment plans for the neurological conditions listed in the course content.",
        ],
        "content_summary": (
            "Assess and manage spinal lesions (including paraplegia, quadriplegia and tabes dorsalis), "
            "neuropathies (including multiple sclerosis, Guillain–Barré syndrome and syringomyelia), "
            "neuromuscular-junction and metabolic neuropathies, cranial-nerve injuries and motor-neuron "
            "disorders; cover neurological complications of infectious diseases, assistive devices in "
            "neurological rehabilitation, and community reintegration."
        ),
        "source_locator": "PST 511 detailed course block, printed p. 620, lines 24158-24170",
    },
    "PST 516": {
        "expected_title": "Ergonomics and Workplace Physiotherapy",
        "expected_outcomes": None,
        "content_summary": (
            "Define ergonomics and analyse simple and complex work systems, including human-machine "
            "components and the work environment. Apply body mechanics and posture concepts; consider "
            "fatigue, discomfort and musculoskeletal problems in sitting and standing; measure workstation "
            "anthropometry; consider office-chair and equipment design; and explain workplace adaptations, "
            "ergonomic advice and occupational-health physiotherapy."
        ),
        "source_locator": (
            "PST 516 detailed course block, printed pp. 622-623, lines 24234-24250; "
            "the global course table on p. 589 uses the variant title "
            "'Ergonomics and Occupational Health Physiotherapy'"
        ),
        "source_conflict_note": (
            "NUC's global table and detailed course block use different PST 516 titles. "
            "The stored title follows the detailed block; preserve this source-internal conflict for review."
        ),
    },
    "PST 522": {
        "expected_title": "Research Proposal Seminar",
        "expected_outcomes": [],
        "outcomes": [
            "identify a research problem;",
            "review literature relevant to the research problem;",
            "identify the objectives and significance of the research;",
            "describe the design, sampling method and methods of investigating an identified research problem; and",
            "prepare a write-up and presentation slides for the seminar topic at a departmental seminar.",
        ],
        "content_summary": (
            "Present a supervisor-guided research plan at a departmental seminar for critical appraisal. "
            "The work builds on research methods and biostatistics and includes problem identification, "
            "literature review, objectives and significance, research design and sampling, investigation "
            "methods, a written proposal and presentation slides."
        ),
        "source_locator": "PST 522 course description and learning outcomes, printed p. 623, lines 24265-24278",
    },
}


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")

    courses = packages[0]["courses"]
    for code, repair in REPAIRS.items():
        rows = [row for row in courses if row.get("code") == code]
        if len(rows) != 1:
            raise SystemExit(f"Expected one {code} course row; got {len(rows)}")
        row = rows[0]
        if row.get("title") != repair["expected_title"]:
            raise SystemExit(f"{code}: unexpected title; refusing repair")
        expected_outcomes = repair.get("expected_outcomes")
        if expected_outcomes is not None and row.get("skills_learned") != expected_outcomes:
            raise SystemExit(f"{code}: unexpected outcomes; refusing repair")
        row["skills_learned"] = repair.get("outcomes", row.get("skills_learned", []))
        row["content_summary"] = repair["content_summary"]
        row["source_url"] = URL
        row["source_locator"] = repair["source_locator"]
        row["source_accessed_on"] = ACCESS_DATE
        if repair.get("source_conflict_note"):
            row["source_conflict_note"] = repair["source_conflict_note"]

    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired PST 511, PST 516, and PST 522 details from official NUC CCMAS evidence.")


if __name__ == "__main__":
    main()
