"""Repair the confirmed PGE 101 table-cell spill; preserve the source hour conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PGE 101"'
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    old, old_end = json.JSONDecoder().raw_decode(text[start:])

    if old.get("title") != "Introduction to Petroleum and Gas Industry with Field Trip":
        raise RuntimeError("PGE 101 title changed; refusing guarded repair")
    if (old.get("lh"), old.get("ph"), old.get("units")) != (15, 45, 2):
        raise RuntimeError("PGE 101 metadata changed; refusing guarded repair")
    if not str(old.get("content_summary", "")).endswith("biogas technology. 200 Level"):
        raise RuntimeError("Expected the verified next-level heading spill; refusing content repair")

    updated = dict(old)
    updated.update(
        {
            "title": "Introduction to Petroleum and Gas Industry with Field Trip",
            "lh": 15,
            "ph": 45,
            "content_summary": (
                "Geophysical methods of petroleum exploration. Principles of petroleum geology. "
                "Drilling for oil and gas: Oil and gas reservoir; oil and gas production; oil and gas "
                "processing; oil and gas transportation. Unconventional Sources; shale gas, gas hydrates, "
                "coalbed methane, landfill and biogas technology."
            ),
            "source_url": SOURCE_URL,
            "source_locator": (
                "NUC Engineering and Technology CCMAS 2023, Petroleum and Gas Engineering programme table "
                "printed p. 1046 (table title includes 'with Field Trip'; 2 units, C, LH 15, PH 45); "
                "detailed PGE 101 block printed p. 1056 (detail heading omits 'with Field Trip', states LH 30); "
                "all six learning outcomes match; course-content summary corrected to remove the following "
                "'200 Level' heading spill. Source-internal title/hour variations retained for review; verified 2026-09-28"
            ),
            "source_accessed_on": "2026-09-28",
        }
    )
    rendered = json.dumps(updated, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
    TARGET.write_text(text[:start] + replacement + text[start + old_end :], encoding="utf-8")

    check = json.loads(TARGET.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in check["programmes"]
        if programme["name"] == "PETROLEUM AND GAS ENGINEERING"
        for row in programme["courses"]
        if row["code"] == "PGE 101"
    )
    assert course["title"] == "Introduction to Petroleum and Gas Industry with Field Trip"
    assert (course["lh"], course["ph"], course["status"]) == (15, 45, "C")
    assert course["content_summary"].endswith("landfill and biogas technology.")
    assert "200 Level" not in course["content_summary"]
    assert "all six learning outcomes match" in course["source_locator"]
    assert "states LH 30" in course["source_locator"]
    print("Repaired PGE 101 title/contact-hour extraction; retained the NUC LH 15 versus LH 30 conflict.")


if __name__ == "__main__":
    main()
