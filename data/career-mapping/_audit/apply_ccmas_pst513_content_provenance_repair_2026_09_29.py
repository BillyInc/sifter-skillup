"""Complete PST 513's truncated CCMAS content and attach item provenance."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Research methods in physiotherapy: identify research problems; search and review peripheral and core literature "
    "using electronic search engines; understand meta-analysis and use research literature to guide practice. Cover "
    "research designs and sampling, independent and dependent variables, data collection, storage, analysis and "
    "presentation, referencing styles, and manuscript preparation for dissertations and journal publication."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 500-level global table printed p. 589 "
    "(2 C, LH 30, PH dash) and PST 513 detailed block printed p. 621, lines 24188-24201 "
    "(four outcomes and course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 513"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 513 row; refusing ambiguous edit")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Research Methods", 500, 2, "C"
    ):
        raise RuntimeError("PST 513 identity changed; refusing edit")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL:
            raise RuntimeError("PST 513 appears repaired but URL differs")
        return
    if len(old.get("content_summary", "")) != 400 or (old.get("lh"), old.get("ph")) != (30, None):
        raise RuntimeError("PST 513 no longer matches audited pre-repair content/load")
    if len(old.get("skills_learned", [])) != 4:
        raise RuntimeError("PST 513 outcome count changed; refusing edit")
    updated = dict(old)
    updated.update(
        {
            "content_summary": SUMMARY,
            "source_url": URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
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
        if course.get("code") == "PST 513"
    )
    assert row["content_summary"] == SUMMARY and len(row["skills_learned"]) == 4
    assert row["source_url"] == URL and row["lh"] == 30 and row["ph"] is None
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Completed PST 513 summary and item-level provenance; preserved matching load and outcomes.")


if __name__ == "__main__":
    main()
