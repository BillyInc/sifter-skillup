"""Persist two confirmed Sciences brochure source-context corrections."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "jamb" / "sciences_offerings.json"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
DATE = "2026-09-26"


def main() -> None:
    document = json.loads(PATH.read_text(encoding="utf-8"))
    rows = {row["jamb_name"]: row for row in document["programmes"]}
    environmental = rows["Environmental Science and Technology"]
    media = rows["INFORMATION AND MEDIA TECHNOLOGY"]

    environmental.update(
        {
            "source_original_title": "ENVRIONMENTAL SCIENCE AND TECHNOLOGY",
            "source_aliases": ["ENVRIONMENTAL SCIENCE AND TECHNOLOGY"],
            "source_locator": "Sciences.txt:5491-5505 (source typo in brochure cell)",
            "source_url": URL,
            "source_accessed_on": DATE,
            "source_context_status": "source_text_confirmed",
        }
    )
    media.update(
        {
            "source_original_title": "INFORMATION AND MEDIA TECHNOLOGY",
            "source_locator": "Sciences.txt:9441-9479 (title crosses extracted page break)",
            "source_url": URL,
            "source_accessed_on": DATE,
            "source_context_status": "source_text_confirmed",
        }
    )
    PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = ROOT / "_audit" / "jamb_sciences_source_alias_repair_checkpoint_2026-09-26_001.md"
    checkpoint.write_text(
        """# Sciences JAMB source-context repair checkpoint — 2026-09-26

Two source-audit false negatives were confirmed in the official JAMB Sciences
brochure and recorded without changing the canonical display identities:

- `Environmental Science and Technology` retains `WESLEYUNI` and now records
  the source-original typo `ENVRIONMENTAL SCIENCE AND TECHNOLOGY` plus its exact
  extracted source window.
- `INFORMATION AND MEDIA TECHNOLOGY` retains `MINNA` and now records the
  page-break source window that joins `INFORMATION AND` to `MEDIA TECHNOLOGY`.

Source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf,
accessed 2026-09-26. No curriculum, domain, subgroup, role, or availability
decision was inferred from these source-context repairs.
""",
        encoding="utf-8",
    )
    print(json.dumps({"updated": [environmental["jamb_name"], media["jamb_name"]]}))


if __name__ == "__main__":
    main()
