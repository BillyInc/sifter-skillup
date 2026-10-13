"""Apply the exact-source repair for Materials Engineering MSE 301."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
OUTCOMES = [
    "distinguish between mineral and ore deposits",
    "describe the principles of mineral concentration",
    "acquire competence to upgrade raw ore minerals for industrial applications",
    "design flowsheets to process ore minerals",
    "use NIAFlow software to design ore-mineral processing",
    "carry out mathematical analysis of an ore slurry",
]
CONTENT = (
    "Ore mineralogy and chemical analysis; mineral identification using reflected-light and thin-section microscopy "
    "and scanning electron microscopy (QEMSCAN); isomorphism and polymorphism; metalliferous ores and industrial "
    "mineralogy; screen-distribution analysis and sampling; comminution and ore classification; mineral-concentration "
    "methods including gravity, heavy-medium, froth-flotation, magnetic and electrostatic separation; beneficiation "
    "of coal; dewatering and tailings disposal; design, testing and evaluation of beneficiation flowsheets; pilot-plant "
    "beneficiation; raw-material preparation for metal extraction and selection of extraction routes."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "MSE 301"'
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    old, old_end = json.JSONDecoder().raw_decode(text[start:])
    if old.get("title") != "Mineral Processing Engineering I":
        raise RuntimeError("MSE 301 title changed; refusing guarded repair")
    old_outcomes = old.get("skills_learned") or []
    if not any("oceanic crust" in str(item) for item in old_outcomes):
        raise RuntimeError("Expected the known unrelated oceanography outcome set")
    if old.get("content_summary"):
        raise RuntimeError("Expected MSE 301 content_summary to be empty/missing")

    updated = dict(old)
    updated.update(
        {
            "source_url": SOURCE_URL,
            "source_locator": (
                "NUC Engineering and Technology CCMAS 2023, MSE 301 detailed learning outcomes and course contents, "
                "printed pp. 878-879; verified 2026-09-28"
            ),
            "skills_learned": OUTCOMES,
            "content_summary": CONTENT,
        }
    )
    rendered = json.dumps(updated, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
    TARGET.write_text(text[:start] + replacement + text[start + old_end :], encoding="utf-8")

    check = json.loads(TARGET.read_text(encoding="utf-8"))
    programme = next(row for row in check["programmes"] if row["name"] == "MATERIALS ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "MSE 301")
    assert course["skills_learned"] == OUTCOMES
    assert course["content_summary"] == CONTENT
    assert course["source_url"] == SOURCE_URL
    print("Repaired CCMAS Materials Engineering MSE 301 from the official NUC course block.")


if __name__ == "__main__":
    main()
