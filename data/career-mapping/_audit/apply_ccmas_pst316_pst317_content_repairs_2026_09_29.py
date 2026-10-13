"""Repair confirmed Physiotherapy CCMAS extraction defects for PST 316/317."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
REPAIRS = {
    "PST 316": {
        "expected_title": "Massage",
        "expected_summary_prefix": "Historical development, and definitions of Massage Manipulations.",
        "clean_outcome": "discuss Inductions and contra-indications for massage manipulations",
        "content_summary": (
            "Massage history, definitions, preparation and basic requirements; dosage factors, classifications "
            "and techniques, with practical work on the upper and lower limbs, neck, back and face; friction, "
            "vibration and shaking; massage for ulcers, scars, oedema, Bell's palsy, post-mastectomy and soft-tissue "
            "injuries, and cardiac massage; sports, older-adult, infant and respiratory-care applications; bandage "
            "types, support and oedema control; massage effects and indications and contraindications."
        ),
        "locator": "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 587 and PST 316 detailed block printed pp. 608-609; title, 300 level, 2 units, C status, LH 15, PH 45 and seven outcomes verified.",
    },
    "PST 317": {
        "expected_title": "Exercise Therapy I Introduction to Body Movements",
        "expected_summary_prefix": "Mechanics principles: Force, Tension, Mechanics of position",
        "content_summary": (
            "Mechanics of force, tension, gravity, support base, equilibrium, fixation and stabilisation; axes and "
            "planes, scalar and vector quantities, levers, pulleys, pendulums and elasticity; body levers, movement "
            "and posture, muscle contraction/work/strength, group action, movement patterns, timing, rhythm and "
            "nervous control; exercise-therapy aims, techniques and starting positions; localized and general "
            "breathing exercises, chest expansion and vital-capacity measurement; approaches to patient problems "
            "and assessment of patient conditions."
        ),
        "locator": "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 587 and PST 317 detailed block printed p. 609; title wording differs only by a colon after 'I'; 300 level, 2 units, C status, LH 30, no practical hours and all six outcomes verified.",
    },
}


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    updates: list[tuple[int, int, str]] = []
    decoder = json.JSONDecoder()

    for code, expected in REPAIRS.items():
        marker = f'"code": "{code}"'
        if text.count(marker) != 1:
            raise RuntimeError(f"Expected exactly one {code} occurrence; refusing ambiguous edit")
        marker_at = text.index(marker)
        start = text.rfind("{", 0, marker_at)
        if start < 0:
            raise RuntimeError(f"Could not locate {code} course object")
        old, end = decoder.raw_decode(text[start:])
        if old.get("code") != code or old.get("title") != expected["expected_title"]:
            raise RuntimeError(f"{code}: course identity/title changed; refusing repair")
        summary = old.get("content_summary", "")
        if not (len(summary) == 400 and summary.startswith(expected["expected_summary_prefix"])):
            if summary != expected["content_summary"]:
                raise RuntimeError(f"{code}: audited truncated summary changed; inspect before editing")

        updated = dict(old)
        updated["content_summary"] = expected["content_summary"]
        if code == "PST 316":
            outcomes = list(old.get("skills_learned", []))
            if len(outcomes) != 7:
                raise RuntimeError("PST 316 outcome count changed; refusing outcome repair")
            contaminated = outcomes[-1]
            if contaminated == expected["clean_outcome"]:
                pass
            elif contaminated.endswith("Allied Health Sciences  609                New"):
                outcomes[-1] = expected["clean_outcome"]
            else:
                raise RuntimeError("PST 316 final outcome differs from the verified footer-contamination case")
            updated["skills_learned"] = outcomes
        updated.update(
            {
                "source_url": SOURCE_URL,
                "source_locator": expected["locator"],
                "source_accessed_on": "2026-09-29",
            }
        )
        indent_start = text.rfind("\n", 0, start) + 1
        indent = text[indent_start:start]
        rendered = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
        replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
        updates.append((start, start + end, replacement))

    for start, end, replacement in sorted(updates, reverse=True):
        text = text[:start] + replacement + text[end:]
    parsed = json.loads(text)
    physiotherapy = next(row for row in parsed["programmes"] if row["name"] == "Physiotherapy")
    courses = {row["code"]: row for row in physiotherapy["courses"]}
    for code, expected in REPAIRS.items():
        row = courses[code]
        assert row["content_summary"] == expected["content_summary"]
        assert row["source_url"] == SOURCE_URL
        assert row["source_locator"] == expected["locator"]
        assert row["source_accessed_on"] == "2026-09-29"
    assert len(courses["PST 316"]["skills_learned"]) == 7
    assert courses["PST 316"]["skills_learned"][-1] == REPAIRS["PST 316"]["clean_outcome"]
    assert len(courses["PST 317"]["skills_learned"]) == 6
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired Physiotherapy PST 316/317 summary truncation and PST 316 page-footer contamination.")


if __name__ == "__main__":
    main()
