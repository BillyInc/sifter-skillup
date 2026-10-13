"""Repair PST 320's confirmed missing practical hours and truncated contents."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Therapeutic-exercise principles and passive/active movements; isotonic and isokinetic regimens and chest "
    "physiotherapy; exercise progression, intensity, HRmax, perceived exertion, VO2max, frequency and duration; "
    "exercise for neuro-musculoskeletal conditions, abdominal surgery and fractures; posture correction, safe "
    "lifting and sitting/standing/walking posture; muscle strengthening, motor-unit role and equipment such as "
    "medicine balls, wobble boards and tilt tables; relaxation; and individual/group exercise-programme design "
    "and prescription."
)
LOCATOR = "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 587 and PST 320 detailed course block printed p. 610; 300 level, 2 units, C status, LH 15, PH 45 and all eight learning outcomes verified."


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 320"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected one PST 320 row; refusing ambiguous repair")
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status"), old.get("lh")) != (
        "Exercise Therapy II: Therapeutic Exercise Prescriptions", 300, 2, "C", 15
    ):
        raise RuntimeError("PST 320 identity/structure changed; refusing repair")
    if old.get("ph") is None and old.get("content_summary") == SUMMARY:
        if old.get("source_url") != SOURCE_URL or old.get("source_accessed_on") != "2026-09-29":
            raise RuntimeError("PST 320 content is already repaired but provenance differs")
        return
    if old.get("ph") is not None or len(old.get("content_summary", "")) != 400:
        raise RuntimeError("PST 320 no longer matches the audited pre-repair record")
    if len(old.get("skills_learned", [])) != 8:
        raise RuntimeError("PST 320 learning outcomes changed; refusing repair")

    updated = dict(old)
    updated.update(
        {
            "ph": 45,
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
    course = next(row for row in owner["courses"] if row["code"] == "PST 320")
    assert course["ph"] == 45 and course["content_summary"] == SUMMARY
    assert len(course["skills_learned"]) == 8
    assert course["source_url"] == SOURCE_URL and course["source_locator"] == LOCATOR
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired PST 320 practical hours, truncated content summary and item-level provenance.")


if __name__ == "__main__":
    main()
