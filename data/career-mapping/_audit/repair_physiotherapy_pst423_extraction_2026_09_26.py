"""Remove verified page-header spill from Physiotherapy PST 423."""

from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
CONTENT = (
    "Seminar presentation on health care issues, including international health definitions and "
    "classifications (ICF, formerly ICDH); determinants of health and health promotion; the Nigerian "
    "health environment and policies; individual and population health statistics; health care for "
    "selected populations, including women, children and older adults; ethical issues in clinical and "
    "physiotherapy practice; public and private financing of health services and the National Health "
    "Insurance Scheme; classification of common cancers in Nigeria; HIV/AIDS; and euthanasia."
)


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")
    rows = [c for c in packages[0]["courses"] if c.get("code") == "PST 423"]
    if len(rows) != 1:
        raise SystemExit(f"Expected one PST 423; got {len(rows)}")
    row = rows[0]
    if not str(row.get("content_summary", "")).startswith("Allied Health Sciences  619"):
        raise SystemExit("PST 423 no longer has the audited header spill; refusing edit")
    row.update(
        units=1,
        status="C",
        lh=0,
        ph=45,
        content_summary=CONTENT,
        source_url=URL,
        source_locator="Physiotherapy PST 423 course structure printed p. 588; contents printed p. 619",
        source_accessed_on="2026-09-26",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Removed PST 423 page-header spill; retained seminar content and sourced course load.")


if __name__ == "__main__":
    main()
