"""Complete PST 521's truncated content and add its CCMAS source locator."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Physiotherapy in geriatrics covers theories of ageing and its physiological and anatomical effects; evaluating "
    "and managing common conditions in older adults, including diabetes, hypertension and hypertensive heart disease, "
    "musculoskeletal disorders and other debilitating conditions. It considers the ageing world population and "
    "challenges for physiotherapists in Nigeria, including changing traditional family support, home versus "
    "institutional care, and multidisciplinary approaches to geriatric care."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 500-level global course table printed p. 589 "
    "(2 C, LH 30, PH dash) and PST 521 detailed block printed p. 623, lines 24251-24264 "
    "(four outcomes and course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 521"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 521 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Physiotherapy in Geriatrics", 500, 2, "C"
    ):
        raise RuntimeError("PST 521 identity changed; refusing repair")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL:
            raise RuntimeError("PST 521 appears repaired but URL differs")
        return
    if len(old.get("content_summary", "")) != 400 or (old.get("lh"), old.get("ph")) != (30, None):
        raise RuntimeError("PST 521 no longer matches audited content/load")
    if len(old.get("skills_learned", [])) != 4:
        raise RuntimeError("PST 521 outcome count changed; refusing repair")
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
        if course.get("code") == "PST 521"
    )
    assert row["content_summary"] == SUMMARY and len(row["skills_learned"]) == 4
    assert row["lh"] == 30 and row["ph"] is None and row["source_url"] == URL
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Completed PST 521 truncated summary and item-level source provenance.")


if __name__ == "__main__":
    main()
