"""Apply the source-confirmed ACC 305 local repair.

The programme-level CCMAS PDF citation remains the display source. Detailed
printed-page evidence is retained in the lane checkpoint, not duplicated on
every student-facing course row.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "administration_management.json"

EXPECTED_OLD_SKILLS = [
    "understand the nature and objectives of public sector accounting",
    "understand federal government financial regulations",
    "prepare revenue and expenditure accounts of government",
    "understand the concept of auditing in the public sector; and",
    "understand public sector financial reforms in Nigeria",
]
NEW_SKILLS = [
    "explain Nigeria's tax administration structure",
    "apply tax rules to calculate liabilities for individuals and partnerships",
    "discuss tax assessments, appeals, collection and return-filing procedures",
]


def main() -> None:
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    matches = [
        course
        for programme in data["programmes"]
        if programme.get("name") == "Accounting"
        for course in programme.get("courses", [])
        if course.get("code") == "ACC 305"
    ]
    if len(matches) != 1:
        raise SystemExit(f"Expected exactly one Accounting ACC 305 row, found {len(matches)}")
    course = matches[0]
    if course.get("title") != "Taxation I" or course.get("units") != 3 or course.get("status") != "C":
        raise SystemExit("ACC 305 identity guard failed")
    if course.get("lh") != 45 or course.get("ph") is not None:
        raise SystemExit("ACC 305 workload guard failed; refusing to overwrite unexpected data")
    if course.get("skills_learned") != EXPECTED_OLD_SKILLS:
        raise SystemExit("ACC 305 skills guard failed; refusing to overwrite unexpected data")
    course["lh"] = 30
    course["ph"] = 45
    course["skills_learned"] = NEW_SKILLS
    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Repaired {TARGET} :: Accounting / ACC 305")


if __name__ == "__main__":
    main()
