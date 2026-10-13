"""Repair PST 514 extraction spill/truncated content and attach source provenance."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
OLD_OUTCOME = "select and apply appropriate statistical tests for testing hypotheses Allied Health Sciences     622                                             New"
NEW_OUTCOME = "select and apply appropriate statistical tests for testing hypotheses"
SUMMARY = (
    "Statistics for physiotherapy research: variables, measurement scales, sampling and data collection; reducing, "
    "summarising and presenting data; probability and the normal distribution; and hypothesis tests for significant "
    "differences, correlation and regression. Covers parametric and non-parametric tests and factors for choosing "
    "tests, with source examples listed as Student-t, Mann-Witney U, ANOA, MANOVA and Regression Analysis. The "
    "CCMAS spells “Mann-Witney” and “ANOA”; these source forms are retained pending editorial verification."
)
NOTE = (
    "NUC detailed contents printed pp. 621-622 spell the test names 'Mann-Witney U' and 'ANOA'. These may be source "
    "text/editorial anomalies; exact intended forms have not been independently adjudicated, so the source spellings "
    "are retained and must not be treated as normalized labels."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 500-level global table printed p. 589 "
    "(2 C, LH 30, PH dash) and PST 514 detailed course block printed pp. 621-622, lines 24202-24214 "
    "(three outcomes and course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 514"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 514 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Biostatistics", 500, 2, "C"
    ):
        raise RuntimeError("PST 514 identity changed; refusing repair")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL or old.get("source_conflict_note") != NOTE:
            raise RuntimeError("PST 514 summary exists but provenance/note differs")
        return
    if len(old.get("content_summary", "")) != 400 or (old.get("lh"), old.get("ph")) != (30, None):
        raise RuntimeError("PST 514 no longer matches audited content/load state")
    outcomes = list(old.get("skills_learned", []))
    if len(outcomes) != 3 or outcomes[2] != OLD_OUTCOME:
        raise RuntimeError("PST 514 outcome/footer differs from audited extraction")
    outcomes[2] = NEW_OUTCOME
    updated = dict(old)
    updated.update(
        {
            "skills_learned": outcomes,
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
        if course.get("code") == "PST 514"
    )
    assert row["skills_learned"][2] == NEW_OUTCOME and row["content_summary"] == SUMMARY
    assert row["source_url"] == URL and row["source_conflict_note"] == NOTE
    assert row["lh"] == 30 and row["ph"] is None
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Repaired PST 514 footer/truncation/provenance; preserved source spellings with an editorial note.")


if __name__ == "__main__":
    main()
