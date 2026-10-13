"""Restore pre-existing confirmed JAMB locators after metadata hydration.

The local-text hydration pass only owns rows whose locator was absent.  Rows
that already carried a bounded official-brochure locator must retain their
previous ``source_text_confirmed`` state even if they lacked the optional
verification overlay.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB_DIR = ROOT / "jamb"
NEW_LOCATOR_PREFIX = "_jamb_txt/"


def main() -> None:
    restored: list[dict] = []
    for path in sorted(JAMB_DIR.glob("*_offerings.json")):
        document = json.loads(path.read_text(encoding="utf-8-sig"))
        dirty = False
        for ordinal, row in enumerate(document.get("programmes", []), 1):
            locator = str(row.get("source_locator") or "")
            if row.get("source_context_status") != "source_text_located" or not locator or locator.startswith(NEW_LOCATOR_PREFIX):
                continue
            # These locators predate the hydration pass and identify bounded
            # official brochure sections or exact programme/awarder cells.
            row["source_context_status"] = "source_text_confirmed"
            verification = row.get("source_verification") or {}
            verification["verified_against_pdf"] = True
            verification["pdf_table_locator"] = locator
            verification["official_source_url"] = row.get("source_url") or verification.get("official_source_url")
            verification["verification_date"] = row.get("source_accessed_on") or verification.get("verification_date")
            verification["verification_method"] = verification.get("verification_method") or "bounded_official_brochure_locator_preserved"
            row["source_verification"] = verification
            restored.append({"parsed_file": path.name, "ordinal": ordinal, "jamb_name": row.get("jamb_name"), "locator": locator})
            dirty = True
        if dirty:
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"restored_rows": len(restored), "rows": restored}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
