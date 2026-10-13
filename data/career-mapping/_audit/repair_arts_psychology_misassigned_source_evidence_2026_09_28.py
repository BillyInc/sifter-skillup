"""Remove a false Arts Psychology verification that points to Creative Arts."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "jamb" / "arts_hum_offerings.json"


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    rows = [row for row in payload["programmes"] if row.get("jamb_name") == "Psychology"]
    if len(rows) != 1:
        raise SystemExit(f"Expected exactly one Arts Psychology row; found {len(rows)}")
    row = rows[0]
    proof = row.get("source_verification", {})
    if proof.get("status") != "verified" or "CREATIVE ARTS" not in proof.get("locator", ""):
        raise SystemExit("Unexpected Psychology evidence preimage; refusing repair")
    row["source_verification"] = {
        "verified_against_pdf": False,
        "status": "evidence_hold",
        "local_extracted_window": "arts_hum.txt:psychology occurrence requires exact body-cell recheck",
        "hold_reason": (
            "Previous verification metadata pointed to the separate CREATIVE ARTS body cell and its awarders, "
            "not to an exact Psychology source cell. Keep the occurrence unverified until its own authoritative "
            "title and complete institution cell are established."
        ),
    }
    SOURCE.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Corrected the Arts Psychology evidence state; its institution array was not changed.")


if __name__ == "__main__":
    main()
