"""Repair the confirmed MTE 415 row spill while preserving the NUC status conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
OUTCOMES = [
    "be acquainted with practical engineering principles in materials and metallurgical processing and selection",
    "explain basic engineering issues in utilization and conservation",
    "undertake specific practicals relating to handling materials and metals",
]


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "MTE 415"'
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    old, old_end = json.JSONDecoder().raw_decode(text[start:])
    if not str(old.get("title", "")).startswith("Metallurgical Engineering Lab."):
        raise RuntimeError("MTE 415 title changed; refusing guarded repair")
    if not any("Laboratory manuals" in str(item) for item in old.get("skills_learned", [])):
        raise RuntimeError("Expected the known appended laboratory note in outcomes")
    if "GET 499" not in old["title"] or old.get("status") != "C":
        raise RuntimeError("Expected the known adjacent-row spill and programme-table status C")

    updated = dict(old)
    updated.update(
        {
            "title": "Metallurgical Engineering Laboratory II",
            "source_url": SOURCE_URL,
            "source_locator": (
                "NUC Engineering and Technology CCMAS 2023, MTE 415 programme table printed p. 815 (status C) "
                "and detailed outcomes printed p. 841 (status E); source-internal status conflict retained; "
                "verified 2026-09-28"
            ),
            "source_accessed_on": "2026-09-28",
            "skills_learned": OUTCOMES,
        }
    )
    rendered = json.dumps(updated, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
    TARGET.write_text(text[:start] + replacement + text[start + old_end :], encoding="utf-8")

    check = json.loads(TARGET.read_text(encoding="utf-8"))
    programme = next(row for row in check["programmes"] if row["name"] == "METALLURGICAL ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "MTE 415")
    assert course["title"] == "Metallurgical Engineering Laboratory II"
    assert course["status"] == "C"  # Programme table; detailed block says E.
    assert course["skills_learned"] == OUTCOMES
    print("Repaired MTE 415 title/outcome spill; preserved the NUC C-versus-E status conflict.")


if __name__ == "__main__":
    main()
