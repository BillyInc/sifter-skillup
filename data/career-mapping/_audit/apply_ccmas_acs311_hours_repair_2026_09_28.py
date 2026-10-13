"""Apply the table-backed ACS 311 load fix while preserving its detailed locator."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "administration_management.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "ACS 311"'
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    old, old_end = json.JSONDecoder().raw_decode(text[start:])
    if old.get("title") != "Entrepreneurship in Actuarial Profession":
        raise RuntimeError("ACS 311 title changed; refusing guarded repair")
    if (old.get("units"), old.get("status"), old.get("lh"), old.get("ph")) != (2, "C", 30, None):
        raise RuntimeError("ACS 311 course load changed; refusing guarded repair")

    updated = dict(old)
    updated.update(
        {
            "lh": 15,
            "ph": 45,
            "source_locator": (
                "NUC Administration and Management CCMAS, Actuarial Science global course structure, printed p. 55 "
                "(2 units, C, LH 15, PH 45); detailed course content/outcomes printed pp. 70–71; "
                "global-structure values verified 2026-09-28"
            ),
            "source_url": SOURCE_URL,
            "source_accessed_on": "2026-09-28",
        }
    )
    rendered = json.dumps(updated, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
    TARGET.write_text(text[:start] + replacement + text[start + old_end :], encoding="utf-8")

    check = json.loads(TARGET.read_text(encoding="utf-8"))
    row = next(
        course
        for programme in check["programmes"]
        if programme["name"] == "Actuarial Science"
        for course in programme["courses"]
        if course["code"] == "ACS 311"
    )
    assert (row["units"], row["status"], row["lh"], row["ph"]) == (2, "C", 15, 45)
    assert "printed p. 55" in row["source_locator"]
    assert "printed pp. 70–71" in row["source_locator"]
    print("Repaired ACS 311 hours from the NUC global table; preserved the detailed-block locator.")


if __name__ == "__main__":
    main()
