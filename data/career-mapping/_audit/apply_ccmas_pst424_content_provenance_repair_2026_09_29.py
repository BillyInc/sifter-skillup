"""Repair PST 424's truncated source summary without resolving its hour conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Sports and recreational physiotherapy covers injuries among athletes and recreational participants, including "
    "soccer, basketball and weight lifting; knee ligament and meniscal injuries, patellar-tendon rupture, "
    "acromioclavicular osteolysis, golfer's elbow, Achilles-tendon rupture and rotator-cuff tears. Topics also "
    "include gender issues and injuries in female athletes, surgical intervention, ergogenic aids, the "
    "physiotherapist's role in sport, physical management and recovery testing/training, return-to-play criteria "
    "after surgery, performance measures, sport-specific rehabilitation, injury prevention, health education, "
    "athlete fitness, motor skills and anthropometric evaluation."
)
CONFLICT = (
    "NUC source-internal workload conflict: the Physiotherapy global course table (printed p. 588) gives LH dash "
    "and PH 45, while the PST 424 detailed heading (printed p. 619) states LH 30 and does not state PH. Existing "
    "local lh=30/ph=null is retained pending source-owner clarification; do not treat either value as adjudicated."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 400-level global course table printed p. 588 "
    "(LH dash, PH 45) and PST 424 detailed block printed p. 619 (LH 30 in heading; five learning outcomes and "
    "course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 424"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 424 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Sports and Recreational Physiotherapy", 400, 2, "C"
    ):
        raise RuntimeError("PST 424 identity changed; refusing repair")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL or old.get("source_conflict_note") != CONFLICT:
            raise RuntimeError("PST 424 summary exists but provenance/conflict annotation differs")
        return
    if len(old.get("content_summary", "")) != 400:
        raise RuntimeError("PST 424 no longer matches the audited 400-character truncation")
    if (old.get("lh"), old.get("ph")) != (30, None):
        raise RuntimeError("PST 424 hour values changed; re-audit the discrepancy before editing")
    if len(old.get("skills_learned", [])) != 5:
        raise RuntimeError("PST 424 outcomes changed; refusing to proceed")

    updated = dict(old)
    updated.update(
        {
            "content_summary": SUMMARY,
            "source_url": URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
            "source_conflict_note": CONFLICT,
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
        if course.get("code") == "PST 424"
    )
    assert (row["lh"], row["ph"]) == (30, None)
    assert row["content_summary"] == SUMMARY and len(row["skills_learned"]) == 5
    assert "global course table" in row["source_conflict_note"] and "detailed heading" in row["source_conflict_note"]
    assert row["source_url"] == URL and row["source_accessed_on"] == "2026-09-29"
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Completed PST 424 truncated summary and provenance; left conflicting LH/PH values unchanged and flagged.")


if __name__ == "__main__":
    main()
