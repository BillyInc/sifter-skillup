"""Add evidence-backed student labels without changing canonical role keys."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "role_library_v3_cleaned.json"

# Each title is retained as the canonical source/key. These separate display
# labels are grounded in the existing occupation descriptions and ESCO code.
DISPLAY_NAMES = {
    "steward/stewardess": "Travel Service Attendant",
    "actor/actress": "Actor",
    "prop master/prop mistress": "Props Master",
    "groundsman/groundswoman": "Groundskeeper",
    "head waiter/head waitress": "Food and Beverage Service Supervisor",
    "ship steward/ship stewardess": "Ship Passenger Service Attendant",
    "restaurant host/restaurant hostess": "Restaurant Host",
    "waiter/waitress": "Restaurant Server",
    "postman/postwoman": "Postal Delivery Worker",
    "ground steward/ground stewardess": "Rail Passenger Service Attendant",
    "host/hostess": "Visitor and Event Host",
    "masseur/masseuse": "Massage Practitioner",
}


def main() -> None:
    rows = json.loads(SOURCE.read_text(encoding="utf-8"))
    changed = []
    for row in rows:
        display_name = DISPLAY_NAMES.get(row.get("role_name"))
        if display_name and row.get("domain_id") in {
            "D069", "D042", "D047", "D053", "D081", "D083", "D088", "D092", "D118"
        }:
            if row.get("student_display_name") not in (None, display_name):
                raise SystemExit(f"Unexpected existing display name for {row['domain_id']}|{row['role_name']}")
            if row.get("student_display_name") != display_name:
                row["student_display_name"] = display_name
                changed.append((row["domain_id"], row["role_name"], display_name))
    expected = 19
    present = [row for row in rows if row.get("student_display_name") in DISPLAY_NAMES.values()]
    if len(present) != expected:
        raise SystemExit(f"Expected {expected} reviewed role display rows; found {len(present)}")
    SOURCE.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({"updated_records": len(changed), "student_display_records": len(present), "changes": changed}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
