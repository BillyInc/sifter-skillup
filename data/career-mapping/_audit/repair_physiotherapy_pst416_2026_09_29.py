"""Repair only the source-confirmed PST 416 summary and provenance fields."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Covers applied microbiology and epidemiology for infection prevention; risk assessment in acute, long-term and "
    "community care; use of current literature to formulate or adapt prevention approaches; strategies that protect "
    "therapists and support safe, quality care; standard precautions and infection-control plans; clean, disinfected "
    "and sterilised healthcare environments; handwashing and physiotherapy-specific disinfection; and participation "
    "in operational and strategic infection-prevention initiatives."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy PST 416: global course structure printed p. 588; "
    "detailed heading, outcomes and contents printed p. 617. The global-table extraction (1 C 15) conflicts with "
    "the detailed heading (1 Unit C: LH 30); contact hours remain unresolved pending visual source adjudication."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 416"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 416 row; refusing ambiguous repair")
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if old.get("code") != "PST 416" or old.get("title") != "Physiotherapy in Infectious Diseases Control and Prevention":
        raise RuntimeError("PST 416 identity/title differs from the audited source")
    if (old.get("level"), old.get("units"), old.get("status")) != (400, 1, "C"):
        raise RuntimeError("PST 416 structural identity changed; refusing repair")
    if len(old.get("skills_learned", [])) != 6:
        raise RuntimeError("PST 416 outcome count changed; refusing repair")
    if old.get("lh") is not None or old.get("ph") is not None:
        raise RuntimeError("PST 416 unresolved hour fields changed; refusing to overwrite them")
    if not old.get("content_summary", "").endswith("healthca"):
        raise RuntimeError("PST 416 summary no longer matches audited truncation; inspect before repair")

    updated = dict(old)
    updated.update(
        {
            "content_summary": SUMMARY,
            "source_url": SOURCE_URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
        }
    )
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    encoded = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
    replacement = encoded[0] + "\n" + "\n".join(indent + line for line in encoded[1:])
    text = text[:start] + replacement + text[start + end :]
    parsed = json.loads(text)
    course = next(row for programme in parsed["programmes"] if programme["name"] == "Physiotherapy" for row in programme["courses"] if row.get("code") == "PST 416")
    if course["content_summary"] != SUMMARY or course["source_url"] != SOURCE_URL:
        raise RuntimeError("PST 416 post-repair validation failed")
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired PST 416 summary/provenance; preserved six outcomes and unresolved contact hours.")


if __name__ == "__main__":
    main()
