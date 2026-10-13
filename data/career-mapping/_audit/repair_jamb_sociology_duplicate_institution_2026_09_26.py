"""Remove a confirmed duplicate institution token from the Sociology row."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "jamb" / "social_management_offerings.json"


def main() -> None:
    document = json.loads(PATH.read_text(encoding="utf-8"))
    row = next(item for item in document["programmes"] if item.get("jamb_name") == "Sociology")
    before = row["institutions"].count("UDU")
    if before != 2:
        raise SystemExit(f"expected exactly two UDU tokens before repair, found {before}")
    seen = False
    institutions = []
    for institution in row["institutions"]:
        if institution == "UDU":
            if seen:
                continue
            seen = True
        institutions.append(institution)
    row["institutions"] = institutions
    PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = ROOT / "_audit" / "jamb_sociology_duplicate_institution_repair_checkpoint_2026-09-26_001.md"
    checkpoint.write_text(
        """# Sociology duplicate institution repair checkpoint — 2026-09-26

The Social/Management Sciences Sociology row contained `UDU` twice in its
institution array. The second token was removed; one `UDU` association and the
existing JAMB source context were retained. This is a parser normalization, not
a university-programme availability decision.

Evidence: official JAMB Social Sciences brochure,
https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf,
source window `Social Management Science.txt:4909-5042`, accessed 2026-09-26.
""",
        encoding="utf-8",
    )
    print(json.dumps({"jamb_name": "Sociology", "before": before, "after": row["institutions"].count("UDU")}))


if __name__ == "__main__":
    main()
