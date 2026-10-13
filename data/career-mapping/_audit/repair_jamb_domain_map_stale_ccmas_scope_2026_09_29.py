"""Synchronize stale JAMB-domain CCMAS scope fields from the canonical ledger.

This repairs only derived JAMB -> CCMAS fields that are already represented in
the canonical inheritance ledger. Domain links, match types and review holds
are deliberately untouched; they belong to the downstream correction gate.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAP_PATH = ROOT / "jamb_domain_map.json"
CANONICAL_PATH = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"


def main() -> None:
    domain_map = json.loads(MAP_PATH.read_text(encoding="utf-8"))
    canonical = json.loads(CANONICAL_PATH.read_text(encoding="utf-8"))
    canonical_by_name = {row["jamb_name"]: row for row in canonical["rows"]}
    if len(domain_map) != 420 or len(canonical_by_name) != 420:
        raise SystemExit(f"Expected 420 rows in both ledgers; got {len(domain_map)} and {len(canonical_by_name)}")

    changed = []
    for jamb_name, row in domain_map.items():
        source = canonical_by_name.get(jamb_name)
        if source is None:
            raise SystemExit(f"Missing canonical row for {jamb_name}")
        expected_components = source.get("component_refs", [])
        expected_scope = source.get("curriculum_scope", {})
        before = {
            "ccmas_components": row.get("ccmas_components"),
            "inheritance_type": row.get("inheritance_type"),
            "curriculum_scope": row.get("curriculum_scope"),
        }
        row["ccmas_components"] = list(expected_components)
        row["inheritance_type"] = source.get("inheritance_type")
        row["curriculum_scope"] = json.loads(json.dumps(expected_scope, ensure_ascii=False))
        after = {
            "ccmas_components": row.get("ccmas_components"),
            "inheritance_type": row.get("inheritance_type"),
            "curriculum_scope": row.get("curriculum_scope"),
        }
        if before != after:
            changed.append(jamb_name)

    MAP_PATH.write_text(json.dumps(domain_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"updated_rows": len(changed), "rows_unchanged": 420 - len(changed), "domain_links_untouched": True, "names": changed}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
