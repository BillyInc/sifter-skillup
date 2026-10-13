"""Complete PST 311's truncated DPT summary and add item-level NUC provenance."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")
    rows = [
        c for c in packages[0]["courses"]
        if c.get("code") == "PST 311" and c.get("title") == "Introduction to Physiotherapy Profession"
    ]
    if len(rows) != 1:
        raise SystemExit(f"Expected one exact DPT PST 311 row; got {len(rows)}")
    row = rows[0]
    if not row.get("content_summary", "").endswith("Local Examination Observatio"):
        raise SystemExit("PST 311 summary preimage changed; refusing repair")
    if row.get("source_url") or row.get("source_locator"):
        raise SystemExit("PST 311 already has provenance; refusing to overwrite")

    row.update(
        content_summary=(
            "Introduction to physiotherapy's history, professional and clinical responsibilities, and "
            "preparation of patients and the care environment. Covers patient identification, history and "
            "examination by observation, palpation and movement; clinical record-keeping and vital signs; "
            "skin-sensation tests, reflexes, muscle bulk and strength, pain and joint-range measurement; "
            "and assessment of walking aids."
        ),
        source_url=URL,
        source_locator="PST 311 global table printed p. 587; detailed course block printed p. 606, lines 23585-23604",
        source_accessed_on="2026-09-28",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Completed the exact DPT PST 311 summary and added NUC source provenance.")


if __name__ == "__main__":
    main()
