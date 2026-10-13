"""Complete PST 515's truncated content and attach official-source provenance."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Joint mobilisation and manipulation: physiological and accessory motion; joint shapes, sliding and rolling; "
    "indications, goals, limitations and contraindications; mobilisation procedures and specific techniques; and "
    "manual traction for the cervical and lumbar spine. Safety before mobilisation includes Vertebra-Basilar "
    "Insufficiency (VBI), its anatomy, tests and signs. Spinal mobilisation/manipulation approaches named in the "
    "CCMAS include Cyriax, Mennel, Kaltenborn, Maitland, Nwuga and McKenzie techniques."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 500-level global table printed p. 589 "
    "(2 C, LH 30, PH dash) and PST 515 detailed course block printed p. 622, lines 24215-24233 "
    "(five outcomes and course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 515"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected one PST 515 row; refusing ambiguous edit")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Spinal and Peripheral Joint Manipulation", 500, 2, "C"
    ):
        raise RuntimeError("PST 515 identity changed; refusing edit")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL:
            raise RuntimeError("PST 515 appears repaired but source URL differs")
        return
    if len(old.get("content_summary", "")) != 400 or (old.get("lh"), old.get("ph")) != (30, None):
        raise RuntimeError("PST 515 no longer matches audited truncation/load")
    if len(old.get("skills_learned", [])) != 5:
        raise RuntimeError("PST 515 outcome count changed; refusing repair")
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
        if course.get("code") == "PST 515"
    )
    assert row["content_summary"] == SUMMARY and len(row["skills_learned"]) == 5
    assert row["lh"] == 30 and row["ph"] is None and row["source_url"] == URL
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Completed PST 515 content summary and item-level source provenance.")


if __name__ == "__main__":
    main()
