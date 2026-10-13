"""Restore three source-confirmed truncated Railway Engineering summaries."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
ACCESS_DATE = "2026-09-29"
UPDATES = {
    "GST 111": {
        "summary": (
            "Covers English sound patterns, phonetics and phonology; word classes, word formation, sentence structure and "
            "grammar; reading and comprehension; logical and critical reasoning; ethical and copyright issues; writing "
            "from planning through editing, including summaries, essays, letters, CVs, reports and notes; writing "
            "mechanics; ICT for language learning; effective communication; and public speaking."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, GST 111, printed pp. 1124-1125 (course contents); seven outcomes checked.",
        "suffix": "3RsQ",
        "outcomes": 7,
        "meta": (100, 2, "C", 15, 45),
    },
    "GST 112": {
        "summary": (
            "Covers Nigerian history, culture and art before 1800; ethnic and linguistic groups; colonial rule and "
            "political development; trade, apprenticeship and economic self-reliance; nation-building challenges and "
            "the Civil War; law, the judiciary and rights; norms, citizenship and civic responsibilities; indigenous "
            "languages and social challenges; national re-orientation programmes; and current socio-political and "
            "cultural developments."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, GST 112, printed p. 1125 (course contents); eight outcomes checked.",
        "suffix": "struggle fo",
        "outcomes": 8,
        "meta": (100, 2, "C", 30, None),
    },
    "GET 101": {
        "summary": (
            "Introduces the history and philosophy of science, engineering and technology; engineering roles and "
            "professional bodies; professional ethics and engineering literacy; sustainable-development goals, "
            "innovation, infrastructure and nation-building; safety and risk analysis; technical, soft and digital "
            "engineering competencies; and seminars or invited lectures from engineering professional associations."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, common GET 101 course block, printed pp. 45-46 (outcomes and contents); course identity also appears in the Railway Engineering 100-level table; five outcomes checked.",
        "suffix": "Safety",
        "outcomes": 5,
        "meta": (100, 1, "C", 15, None),
    },
}


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    programme_marker = '"name": "RAILWAY ENGINEERING"'
    if text.count(programme_marker) != 1:
        raise RuntimeError("Expected one Railway Engineering package; refusing ambiguous repair")
    for code, spec in UPDATES.items():
        programme_at = text.index(programme_marker)
        programme_start = text.rfind("{", 0, programme_at)
        _, programme_length = json.JSONDecoder().raw_decode(text[programme_start:])
        programme_end = programme_start + programme_length
        marker = f'"code": "{code}"'
        if text[programme_start:programme_end].count(marker) != 1:
            raise RuntimeError(f"Expected one Railway CCMAS {code} row; refusing ambiguous repair")
        at = text.index(marker, programme_start, programme_end)
        start = text.rfind("{", 0, at)
        old, end = json.JSONDecoder().raw_decode(text[start:])
        if old.get("code") != code:
            raise RuntimeError(f"{code} identity mismatch")
        if (old.get("level"), old.get("units"), old.get("status"), old.get("lh"), old.get("ph")) != spec["meta"]:
            raise RuntimeError(f"{code} metadata differs from audited baseline")
        if len(old.get("skills_learned", [])) != spec["outcomes"]:
            raise RuntimeError(f"{code} outcome count differs from audited baseline")
        if not old.get("content_summary", "").endswith(spec["suffix"]):
            raise RuntimeError(f"{code} summary no longer matches audited truncation; inspect before repair")

        updated = dict(old)
        updated.update(
            {
                "content_summary": spec["summary"],
                "source_url": SOURCE_URL,
                "source_locator": spec["locator"],
                "source_accessed_on": ACCESS_DATE,
            }
        )
        indent_start = text.rfind("\n", 0, start) + 1
        indent = text[indent_start:start]
        lines = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
        replacement = lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])
        text = text[:start] + replacement + text[start + end :]

    parsed = json.loads(text)
    railway = next(row for row in parsed["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for code, spec in UPDATES.items():
        course = next(row for row in railway["courses"] if row.get("code") == code)
        if course["content_summary"] != spec["summary"] or course["source_url"] != SOURCE_URL:
            raise RuntimeError(f"Post-repair validation failed for {code}")
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired Railway GST 111, GST 112 and GET 101 summaries/provenance; preserved metadata and outcomes.")


if __name__ == "__main__":
    main()
