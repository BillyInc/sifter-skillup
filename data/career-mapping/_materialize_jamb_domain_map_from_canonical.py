"""Materialize the reviewed CCMAS-derived JAMB domain map.

The output intentionally contains no domain links for granular rows whose
curriculum slice has not been evidenced, and no CCMAS links for external rows.
It is a replacement candidate for the legacy jamb_domain_map.json; the legacy
file is not read as an input for the corrected links.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).parent
CANONICAL = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
OUTPUT = ROOT / "_audit" / "jamb_domain_map_ccmas_derived_2026-08-17.json"
ACTIVE = ROOT / "jamb_domain_map.json"
LEGACY = ROOT / "_audit" / "jamb_domain_map_legacy_2026-08-17.json"


def main() -> None:
    document = json.loads(CANONICAL.read_text(encoding="utf-8"))
    output = {}
    for row in document["rows"]:
        output[row["jamb_name"]] = {
            "links": row["domain_links"],
            "inheritance_type": row["inheritance_type"],
            "mapping_status": row["mapping_status"],
            "status_reason": row["status_reason"],
            "ccmas_components": row["component_refs"],
            "curriculum_scope": row["curriculum_scope"],
            "source": "jamb_ccmas_inheritance_canonical_2026-08-17.json",
        }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    replaced = False
    if "--replace" in sys.argv:
        if not LEGACY.exists():
            LEGACY.write_text(ACTIVE.read_text(encoding="utf-8"), encoding="utf-8")
        ACTIVE.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        replaced = True
    ready = sum(1 for row in output.values() if row["mapping_status"] == "ready")
    review = sum(1 for row in output.values() if row["mapping_status"] == "review_required")
    external = sum(1 for row in output.values() if row["mapping_status"] == "external_review_required")
    links = sum(len(row["links"]) for row in output.values())
    print(json.dumps({
        "output": str(OUTPUT),
        "active_replaced": replaced,
        "legacy_backup": str(LEGACY) if replaced else None,
        "rows": len(output),
        "ready": ready,
        "review_required": review,
        "external_review_required": external,
        "domain_links": links,
    }, indent=2))


if __name__ == "__main__":
    main()
