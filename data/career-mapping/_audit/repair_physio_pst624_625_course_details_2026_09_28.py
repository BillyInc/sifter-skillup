"""Repair confirmed PST 624/625 extraction gaps from the official NUC CCMAS."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
ACCESS_DATE = "2026-09-28"


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")
    rows = {}
    for course in packages[0]["courses"]:
        if course.get("code") in {"PST 624", "PST 625"}:
            if course["code"] in rows:
                raise SystemExit(f"Duplicate {course['code']}; refusing repair")
            rows[course["code"]] = course
    if set(rows) != {"PST 624", "PST 625"}:
        raise SystemExit("Missing or duplicate target course rows")
    if not rows["PST 624"]["content_summary"].endswith("Com"):
        raise SystemExit("PST 624 preimage changed; refusing repair")
    if not rows["PST 625"]["content_summary"].endswith("Specif"):
        raise SystemExit("PST 625 preimage changed; refusing repair")

    rows["PST 624"].update(
        content_summary=(
            "Study disability concepts and causes, community and community-based rehabilitation, and "
            "reintegration after disability. Examine psychosocial effects such as discrimination, isolation "
            "and mental health; family finances and care settings; participation in schooling, transport, work, "
            "sports and public facilities; and disability policy, advocacy, legislation and conventions in "
            "Nigeria and internationally."
        ),
        source_conflict_note=(
            "The global table lists LH 15, while the detailed course block lists LH 30. The stored value follows "
            "the detailed course block; retain the source-internal conflict for adjudication. The source uses an "
            "outdated term for intellectual disability, which is not repeated in the student-facing summary."
        ),
        source_url=URL,
        source_locator="PST 624 global table printed p. 589; detailed course block printed p. 629, lines 24489-24508",
        source_accessed_on=ACCESS_DATE,
    )
    rows["PST 625"].update(
        content_summary=(
            "Study skin structure and function; common infections, burns, wounds and dermatological disorders; "
            "circulation and lymphatic conditions; wound, burn, scar, vascular and lymphatic interventions; "
            "specific skin conditions and complications; skin procedures and prognostic tests; and the role of "
            "physiotherapy in dermatological care."
        ),
        source_conflict_note=(
            "The global table lists LH 15, while the detailed course block lists LH 30. The stored value follows "
            "the detailed course block; retain the source-internal conflict for adjudication. The global-table "
            "capitalization 'Skin care' differs from detailed/local 'Skin Care' only typographically."
        ),
        source_url=URL,
        source_locator="PST 625 global table printed p. 589; detailed course block printed p. 629, lines 24509-24529",
        source_accessed_on=ACCESS_DATE,
    )

    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired PST 624/625 truncated content and provenance; documented source-hour conflicts.")


if __name__ == "__main__":
    main()
