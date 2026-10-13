"""Restore the source-confirmed title and full content of shared GET 204."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
EXPECTED_TITLE = "Students Workshop Practice"
OBSERVED_TITLES = {
    "Students Workshop Practice",
    "Students Workshop Experience",
    "Students Workshop Practice -GET 205 Fundamentals of Fluid 3 C 45 - Mechanics",
    "Workshop Practice",
    "Student Workshop Practice",
    "Students workshop experience",
    "Students\ufffd Workshop Practice",
}
OLD_SUMMARY = (
    "The course comprises general, mechanical and electrical components: supervised hands-on "
    "experience in safe usage of tools and machines for selected tasks; Use of measuring "
    "instruments (calipers, micrometers, gauges, sine bar, wood planners, saws, sanders, and "
    "pattern making). Machine shop: lathe work shaping, milling, grinding, reaming, metal "
    "spinning. Hand tools, gas and arc welding, cutting, bra"
)
NEW_SUMMARY = (
    "Guided workshop practice in safe use and care of tools, machines, and measuring instruments, "
    "including calipers, micrometers, gauges, saws, sanders, and pattern-making tools. Practical "
    "work covers lathe operations, shaping, milling, grinding, reaming, metal spinning, welding, "
    "cutting, brazing, soldering, foundry and casting practice, metrology, industrial safety, "
    "ergonomics, hot- and cold-metal forming, joining, heat treatment, material removal, machine "
    "tools, cutting forces, and CNC. It also covers identifying and maintaining electrical and "
    "electronic components, circuits and wiring, analogue and digital measurements, household and "
    "industrial energy measurement, and practical energy conservation."
)
SOURCE_LOCATOR = (
    "NUC Engineering and Technology CCMAS 2023, shared GET 204: Students Workshop Practice detailed "
    "course block, printed pp. 1173-1174; corrected title and summary match the full listed course "
    "through practical energy-conservation principles. The detailed block contains six learning "
    "outcomes. Programme-specific schedule metadata is preserved unchanged and requires its own "
    "table-level check where it differs from the detail block; verified 2026-09-29."
)


def _replace_course_objects(text: str) -> tuple[str, int]:
    decoder = json.JSONDecoder()
    marker = '"code": "GET 204"'
    cursor = 0
    replacements: list[tuple[int, int, str]] = []
    while True:
        at = text.find(marker, cursor)
        if at < 0:
            break
        start = text.rfind("{", 0, at)
        indent_start = text.rfind("\n", 0, start) + 1
        indent = text[indent_start:start]
        old, old_len = decoder.raw_decode(text[start:])
        if old.get("code") == "GET 204":
            old_title = old.get("title", "")
            if old_title not in OBSERVED_TITLES and old_title.encode("ascii", "ignore").decode("ascii") != EXPECTED_TITLE:
                raise RuntimeError(f"Unexpected GET 204 title {old_title!r}; refusing guarded repair")
            updated = dict(old)
            if old.get("content_summary") == OLD_SUMMARY:
                if any(key in old for key in ("source_url", "source_locator", "source_accessed_on")):
                    raise RuntimeError("GET 204 already has source fields; inspect before repairing")
                updated.update(
                    {
                        "title": EXPECTED_TITLE,
                        "content_summary": NEW_SUMMARY,
                        "source_url": SOURCE_URL,
                        "source_locator": SOURCE_LOCATOR,
                        "source_accessed_on": "2026-09-29",
                    }
                )
            elif (
                old.get("title") == EXPECTED_TITLE
                and old.get("content_summary") == NEW_SUMMARY
                and old.get("source_url") == SOURCE_URL
            ):
                updated["source_locator"] = SOURCE_LOCATOR
            else:
                raise RuntimeError("GET 204 no longer matches the expected source repair; refusing")
            rendered = json.dumps(updated, ensure_ascii=False, indent=2).splitlines()
            replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
            replacements.append((start, start + old_len, replacement))
        cursor = at + len(marker)

    if len(replacements) != 32:
        raise RuntimeError(f"Expected 32 identical shared GET 204 records; found {len(replacements)}")
    for start, end, replacement in reversed(replacements):
        text = text[:start] + replacement + text[end:]
    return text, len(replacements)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    updated, count = _replace_course_objects(text)
    TARGET.write_text(updated, encoding="utf-8")
    print(f"Repaired {count} shared GET 204 summaries with the NUC pp. 1173-1174 source locator.")


if __name__ == "__main__":
    main()
