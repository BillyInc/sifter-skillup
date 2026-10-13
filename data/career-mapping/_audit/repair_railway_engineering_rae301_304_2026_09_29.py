"""Reconcile the final four Railway Engineering rows to their NUC source."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
ACCESS_DATE = "2026-09-29"
UPDATES = {
    "RAE 301": {
        "summary": (
            "Introduces transport and railway development; railway construction procedures and standards; rail lines and "
            "track; cars, locomotives and electric multiple units; passenger and freight capacity; bridges, tunnels, "
            "stations and equipment; and high-speed and magnetic-levitation railways."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, RAE 301, printed p. 1143; two outcomes and full course contents. Schedule entry: printed p. 1123.",
        "suffix": "Nigerian railwa",
        "outcomes": 6,
        "meta": (300, 2, "C", 30, None),
        "official_outcomes": 2,
    },
    "RAE 302": {
        "summary": (
            "Covers soil as a foundation and construction material; soil formation, classification, and physical and "
            "mechanical properties; soil and water weight-volume relationships; stress and shear strength; compaction; "
            "seepage and consolidation; earth pressure; settlement; and bearing capacity of shallow and deep foundations."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, RAE 302, printed p. 1144; four outcomes and course content. Schedule entry: printed p. 1123.",
        "suffix": "bearing capacity",
        "outcomes": 4,
        "meta": (300, 3, "C", 45, None),
        "official_outcomes": 4,
    },
    "RAE 303": {
        "summary": (
            "Covers railway station organization and operations; train reception, dispatch and shunting; freight-car "
            "pickup, marshalling and train-formation plans; station technical systems, equipment, work planning, "
            "scheduling and performance analysis; railway traffic organization; train timetables and operating charts; "
            "capacity, speed and service planning; and locomotive and electric-multiple-unit use. The schedule lists "
            "45 practical hours, while the detailed course heading specifies 30 lecture hours only."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, RAE 303, printed pp. 1144-1146; three outcomes and Parts 1-3 course contents. Schedule entry: printed p. 1123 (LH 30, PH 45); detailed heading p. 1144 (LH 30, PH unspecified).",
        "suffix": "shuntin",
        "outcomes": 3,
        "meta": (300, 2, "C", 30, 45),
        "official_outcomes": 3,
    },
    "RAE 304": {
        "summary": (
            "Covers the structure and design of railway track, including rails, fastenings, sleepers, ballast, formation "
            "and subsoil; how track withstands train and environmental forces while protecting the foundation and "
            "supporting safe, comfortable and economical operation; switches and crossings; overhead-line "
            "electrification; slab track; and track maintenance. The schedule lists 15 lecture and 45 practical hours, "
            "while the detailed course heading specifies 30 lecture hours only."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Railway Engineering, RAE 304, printed p. 1145; seven outcomes and course contents. Schedule entry: printed p. 1123 (LH 15, PH 45); detailed heading p. 1145 (LH 30, PH unspecified).",
        "suffix": "th",
        "outcomes": 7,
        "meta": (300, 2, "C", 15, 45),
        "official_outcomes": 7,
    },
}


def encode(value: dict, indent: str) -> str:
    lines = json.dumps(value, ensure_ascii=False, indent=1).splitlines()
    return lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    programme_marker = '"name": "RAILWAY ENGINEERING"'
    if text.count(programme_marker) != 1:
        raise RuntimeError("Expected exactly one Railway Engineering package; refusing ambiguous repair")
    programme_at = text.index(programme_marker)
    programme_start = text.rfind("{", 0, programme_at)
    _, programme_length = json.JSONDecoder().raw_decode(text[programme_start:])
    programme_end = programme_start + programme_length

    replacements: list[tuple[int, int, str]] = []
    for code, spec in UPDATES.items():
        marker = f'"code": "{code}"'
        if text[programme_start:programme_end].count(marker) != 1:
            raise RuntimeError(f"Expected one Railway {code} row; refusing ambiguous repair")
        at = text.index(marker, programme_start, programme_end)
        start = text.rfind("{", 0, at)
        old, length = json.JSONDecoder().raw_decode(text[start:])
        if old.get("code") != code:
            raise RuntimeError(f"{code} identity mismatch")
        meta = (old.get("level"), old.get("units"), old.get("status"), old.get("lh"), old.get("ph"))
        if meta != spec["meta"]:
            raise RuntimeError(f"{code} metadata differs from audited baseline: {meta}")
        outcomes = old.get("skills_learned", [])
        if len(outcomes) != spec["outcomes"] or not old.get("content_summary", "").endswith(spec["suffix"]):
            raise RuntimeError(f"{code} no longer matches the audited baseline; inspect before repair")
        if code == "RAE 301" and not outcomes[0].startswith("relate the basic concepts and principles"):
            raise RuntimeError("RAE 301 source-confirmed first outcome changed")

        updated = dict(old)
        if len(outcomes) != spec["official_outcomes"]:
            updated["skills_learned"] = outcomes[: spec["official_outcomes"]]
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
        replacements.append((start, start + length, encode(updated, indent)))

    for start, end, replacement in sorted(replacements, reverse=True):
        text = text[:start] + replacement + text[end:]

    parsed = json.loads(text)
    railway = next(row for row in parsed["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for code, spec in UPDATES.items():
        course = next(row for row in railway["courses"] if row.get("code") == code)
        if len(course["skills_learned"]) != spec["official_outcomes"] or course["source_url"] != SOURCE_URL:
            raise RuntimeError(f"Post-repair validation failed for {code}")
    TARGET.write_text(text, encoding="utf-8")
    print("Reconciled Railway RAE 301-304 content, RAE 301 cross-course outcomes, and item-level provenance.")


if __name__ == "__main__":
    main()
