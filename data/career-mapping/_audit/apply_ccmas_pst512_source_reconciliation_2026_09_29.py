"""Repair PST 512 confirmed PH/title/content/provenance fields."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
TITLE = "Physiotherapy Clinical Rotation in Neurology-II"
SUMMARY = (
    "Clinical rotation in neurological physiotherapy for head and spinal-cord injuries and other conditions requiring "
    "neurosurgery. Students take histories, perform physical examinations and specific assessments, exercise clinical "
    "judgment, treat and evaluate patients with head injuries, spinal-cord injuries and cases following excision of "
    "intracranial tumours, among other conditions. Students practise communicating management information, treatment "
    "goals and care plans to these patients."
)
NOTE = (
    "NUC title notation variation for the same PST 512: the global course table (printed p. 589) names the course "
    "Physiotherapy Clinical Rotation in Neurology-II; the detailed course heading (printed p. 621) omits the suffix II. "
    "The global title is used for the course row; this variation is retained for audit, not treated as a separate course."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 500-level global table printed p. 589 "
    "(2 C, LH dash, PH 90) and PST 512 detailed block printed p. 621 (four outcomes and course contents). "
    "Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 512"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 512 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("level"), old.get("units"), old.get("status")) != (500, 2, "C"):
        raise RuntimeError("PST 512 identity/load changed; refusing repair")
    if old.get("title") == TITLE and old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL or old.get("source_conflict_note") != NOTE:
            raise RuntimeError("PST 512 appears repaired but provenance/title note differs")
        return
    if old.get("title") != "Physiotherapy Clinical Rotation In Neurology" or len(old.get("content_summary", "")) != 400:
        raise RuntimeError("PST 512 differs from audited pre-repair title/content")
    if (old.get("lh"), old.get("ph")) != (None, None) or len(old.get("skills_learned", [])) != 4:
        raise RuntimeError("PST 512 load/outcomes differ from audited state")
    updated = dict(old)
    updated.update(
        {
            "title": TITLE,
            "ph": 90,
            "content_summary": SUMMARY,
            "source_url": URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
            "source_conflict_note": NOTE,
        }
    )
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    lines = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
    replacement = lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])
    rewritten = text[:start] + replacement + text[start + end :]
    parsed = json.loads(rewritten)
    row = next(
        course
        for programme in parsed["programmes"]
        if programme["name"] == "Physiotherapy"
        for course in programme["courses"]
        if course.get("code") == "PST 512"
    )
    assert row["title"] == TITLE and row["ph"] == 90 and row["lh"] is None
    assert row["content_summary"] == SUMMARY and len(row["skills_learned"]) == 4
    assert row["source_conflict_note"] == NOTE and row["source_url"] == URL
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Reconciled PST 512 title, PH, truncated content and provenance; recorded source title variation.")


if __name__ == "__main__":
    main()
