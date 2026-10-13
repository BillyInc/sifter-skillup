"""Remove course rows incorrectly assigned to the Nursing Sciences package."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
FOREIGN_ROWS = {
    ("NSC 201", "Foundations of Nursing"),
    ("NSC 314", "Clinical Nursing Procedure"),
}
RETAINED_ROWS = {
    ("NSC 201", "Foundations of Professional Nursing Practice I"),
    ("NSC 314", "Mental Health and Psychiatric Nursing I"),
}


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    nursing = [
        row
        for row in document["programmes"]
        if row.get("name") == "Nursing Sciences"
    ]
    if len(nursing) != 1:
        raise SystemExit(f"Expected one Nursing Sciences package, got {len(nursing)}")

    courses = nursing[0]["courses"]
    counts = {
        identity: sum(
            (course.get("code"), course.get("title")) == identity
            for course in courses
        )
        for identity in FOREIGN_ROWS | RETAINED_ROWS
    }
    if counts != {**{identity: 1 for identity in FOREIGN_ROWS | RETAINED_ROWS}}:
        raise SystemExit(f"Unexpected source identities/counts; refusing edit: {counts}")

    nursing[0]["courses"] = [
        course
        for course in courses
        if (course.get("code"), course.get("title")) not in FOREIGN_ROWS
    ]
    remaining = {
        (course.get("code"), course.get("title"))
        for course in nursing[0]["courses"]
        if course.get("code") in {"NSC 201", "NSC 314"}
    }
    if remaining != RETAINED_ROWS:
        raise SystemExit(f"Unexpected Nursing course identities after edit: {remaining}")

    SOURCE.write_text(
        json.dumps(document, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    print("Removed 2 cross-programme rows from Nursing Sciences; retained the 2 official Nursing course identities.")


if __name__ == "__main__":
    main()
