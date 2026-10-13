"""Repair PST 312 footer contamination, truncated summary, and missing NUC provenance."""

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
    rows = [c for c in packages[0]["courses"] if c.get("code") == "PST 312" and c.get("title") == "Exercise Physiology"]
    if len(rows) != 1:
        raise SystemExit(f"Expected one exact DPT PST 312 row; got {len(rows)}")
    row = rows[0]
    if not row["skills_learned"][-1].endswith("Allied Health Sciences        607                  New"):
        raise SystemExit("PST 312 outcome preimage changed; refusing repair")
    if not row.get("content_summary", "").endswith("chronic exerc"):
        raise SystemExit("PST 312 summary preimage changed; refusing repair")
    if row.get("source_url") or row.get("source_locator"):
        raise SystemExit("PST 312 already has provenance; refusing to overwrite")

    row["skills_learned"][-1] = "have a good knowledge of effects of exercise on body organs"
    row["content_summary"] = (
        "Study exercise physiology and its role in health and therapeutic exercise: skeletal-muscle structure "
        "and function; energy systems and body fuels; the common pathway of metabolism; physiological "
        "adjustments of body systems to exercise; responses to a single exercise session; adaptations to "
        "regular exercise; and effects on body composition."
    )
    row.update(
        source_url=URL,
        source_locator=(
            "PST 312 global DPT table printed p. 587, lines 22850-22850; detailed course block printed pp. 606-607, "
            "lines 23605-23619"
        ),
        source_accessed_on="2026-09-28",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired PST 312 footer contamination and truncated summary; added NUC provenance.")


if __name__ == "__main__":
    main()
