"""Repair the sourced PST 321 fields while preserving the PST 318 conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
OUTCOME_4_BEFORE = "measure range of motion of peripheral and spinal joints Allied Health Sciences  611  New"
OUTCOME_4_AFTER = "measure range of motion of peripheral and spinal joints;"
SUMMARY = (
    "Practical demonstrations apply exercise selection and progression, range-of-motion measurement, motor-skill "
    "and gait analysis, crutch-gait training, massage manipulation, peripheral-joint mobilisation and spinal "
    "manipulation. The NUC description lists PST 316, PST 317, PST 318, PST 320 and PST 325; PST 318 is absent "
    "from the same programme's 300-level course table, so that source reference remains unresolved."
)
LOCATOR = "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 587 and PST 321 detailed block printed pp. 610-611; 300 level, 1 unit, C status and PH 45; no LH is shown. Ten outcomes were checked; outcome 4 footer removed. Source-internal PST 318 reference retained as unresolved because the code is absent from the same section's global table."


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 321"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 321 row; refusing ambiguous repair")
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Practical Exercise Therapy, Kinesiology & Cryotherapy", 300, 1, "C"
    ):
        raise RuntimeError("PST 321 course identity changed; refusing repair")
    if old.get("ph") == 45 and old.get("content_summary") == SUMMARY:
        if old.get("source_url") != SOURCE_URL or old.get("source_accessed_on") != "2026-09-29":
            raise RuntimeError("PST 321 appears repaired but provenance differs")
        return
    if old.get("ph") is not None or old.get("content_summary") is not None:
        raise RuntimeError("PST 321 differs from the audited pre-repair values")
    outcomes = list(old.get("skills_learned", []))
    if len(outcomes) != 10 or outcomes[3] != OUTCOME_4_BEFORE:
        raise RuntimeError("PST 321 outcomes changed; refusing footer repair")
    outcomes[3] = OUTCOME_4_AFTER

    updated = dict(old)
    updated.update(
        {
            "ph": 45,
            "skills_learned": outcomes,
            "content_summary": SUMMARY,
            "source_url": SOURCE_URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
        }
    )
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    lines = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
    replacement = lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])
    text = text[:start] + replacement + text[start + end:]
    parsed = json.loads(text)
    owner = next(row for row in parsed["programmes"] if row["name"] == "Physiotherapy")
    course = next(row for row in owner["courses"] if row["code"] == "PST 321")
    assert course["ph"] == 45 and len(course["skills_learned"]) == 10
    assert course["skills_learned"][3] == OUTCOME_4_AFTER
    assert "PST 318" in course["content_summary"] and "remains unresolved" in course["content_summary"]
    assert course["source_url"] == SOURCE_URL and course["source_locator"] == LOCATOR
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired PST 321 practical hours, summary, outcome footer and item-level provenance; retained PST 318 conflict.")


if __name__ == "__main__":
    main()
