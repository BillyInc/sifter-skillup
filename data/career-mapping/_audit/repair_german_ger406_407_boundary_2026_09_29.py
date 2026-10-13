"""Separate the NUC GER 407 block from the corrupted local GER 406 row."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "arts.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf"
ACCESS_DATE = "2026-09-29"
GER406_SUMMARY = "Exposure of students to some selected texts from the 18th century to the present day."
GER407_SUMMARY = "An independent essay on a topic in literature, language or civilisation approved by the department."
GER406_LOCATOR = "NUC Arts CCMAS 2023, Modern European Languages B.A (German), GER 406, printed p. 488; course outcomes and content."
GER407_LOCATOR = "NUC Arts CCMAS 2023, Modern European Languages B.A (German), GER 407 Long Essay, printed pp. 488-489; 6 Units C, PH 270; three outcomes and independent-essay content."


def encode(value: dict, indent: str) -> str:
    lines = json.dumps(value, ensure_ascii=False, indent=1).splitlines()
    return lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    if text.count('"code": "GER 406"') != 1:
        raise RuntimeError("Expected one GER 406 record; refusing ambiguous repair")
    if '"code": "GER 407"' in text:
        raise RuntimeError("GER 407 already exists; inspect current state instead of duplicating")

    marker = '"code": "GER 406"'
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    old, end = json.JSONDecoder().raw_decode(text[start:])
    outcomes = old.get("skills_learned", [])
    if len(outcomes) != 8 or not outcomes[6].startswith("apply the rules of grammar, vocabulary"):
        raise RuntimeError("GER 406 outcome shape differs from the audited cross-course spill")
    if "Arts 488" not in outcomes[7] or "GER 407" not in old.get("content_summary", ""):
        raise RuntimeError("GER 406 spill baseline differs from source-audit checkpoint")
    if (old.get("level"), old.get("units"), old.get("status"), old.get("lh")) != (400, 2, "C", 30):
        raise RuntimeError("GER 406 metadata differs from source; refusing repair")

    updated406 = dict(old)
    updated406["skills_learned"] = outcomes[:6]
    updated406.update(
        {
            "content_summary": GER406_SUMMARY,
            "source_url": SOURCE_URL,
            "source_locator": GER406_LOCATOR,
            "source_accessed_on": ACCESS_DATE,
        }
    )

    ger407 = {
        "level": 400,
        "code": "GER 407",
        "title": "Long Essay",
        "units": 6,
        "status": "C",
        "lh": None,
        "ph": 270,
        "skills_learned": [
            "apply the rules of grammar, vocabulary and skills of writing in working on some specific topic;",
            "Display the knowledge of comprehension and facility in reading, discussing and understanding of nation, international and global, social and economic issues;",
            "translate, interpret and evaluate texts written in German and be able to translate them into English or any other language.",
        ],
        "content_summary": GER407_SUMMARY,
        "source_anomaly_note": "The NUC source's second outcome uses the phrase 'nation, international and global'; retained as published rather than silently rewritten.",
        "source_url": SOURCE_URL,
        "source_locator": GER407_LOCATOR,
        "source_accessed_on": ACCESS_DATE,
    }

    row_indent_start = text.rfind("\n", 0, start) + 1
    indent = text[row_indent_start:start]
    encoded406 = encode(updated406, indent)
    encoded407 = encode(ger407, indent)
    old_chunk = text[start : start + end]
    replacement = encoded406 + ",\n" + indent + encoded407
    text = text[:start] + replacement + text[start + end :]

    parsed = json.loads(text)
    programme = next(row for row in parsed["programmes"] if row["name"] == "Modern European Languages B.A (German)")
    rows = [row for row in programme["courses"] if row.get("code") in {"GER 406", "GER 407"}]
    if len(rows) != 2:
        raise RuntimeError("Post-repair GER 406/407 row count is not two")
    row406 = next(row for row in rows if row["code"] == "GER 406")
    row407 = next(row for row in rows if row["code"] == "GER 407")
    if len(row406["skills_learned"]) != 6 or row406["content_summary"] != GER406_SUMMARY:
        raise RuntimeError("GER 406 post-repair validation failed")
    if len(row407["skills_learned"]) != 3 or row407["ph"] != 270 or row407["content_summary"] != GER407_SUMMARY:
        raise RuntimeError("GER 407 post-repair validation failed")
    TARGET.write_text(text, encoding="utf-8")
    print("Separated GER 407 from GER 406; restored source-backed course row and item provenance.")


if __name__ == "__main__":
    main()
