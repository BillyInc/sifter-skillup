"""Sync the stale French JAMB bridge row to its corrected CCMAS anchor."""

from __future__ import annotations

import json
from json import JSONDecoder
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ACTIVE = ROOT / "jamb_domain_map.json"
DERIVED = ROOT / "_audit" / "jamb_domain_map_ccmas_derived_2026-08-17.json"
KEY = '"French"'


def main() -> None:
    active_text = ACTIVE.read_text(encoding="utf-8")
    corrected = json.loads(DERIVED.read_text(encoding="utf-8"))["French"]
    key_start = active_text.find(KEY)
    if key_start < 0:
        raise SystemExit("French key is missing from the active map")
    colon = active_text.find(":", key_start + len(KEY))
    value_start = colon + 1
    while active_text[value_start].isspace():
        value_start += 1
    _, value_end = JSONDecoder().raw_decode(active_text[value_start:])
    replacement = json.dumps(corrected, ensure_ascii=False, indent=2).replace("\n", "\n  ")
    ACTIVE.write_text(
        active_text[:value_start] + replacement + active_text[value_start + value_end :],
        encoding="utf-8",
    )
    checkpoint = ROOT / "_audit" / "french_active_map_ccmas_anchor_checkpoint_2026-09-26_001.md"
    checkpoint.write_text(
        """# French active-map CCMAS-anchor checkpoint — 2026-09-26

The active `French` JAMB row previously exposed two links from a 59-row
custom external curriculum. The corrected canonical row is anchored to
`Arts::Modern European Languages B.A (French)`, selects 40 Arts CCMAS
courses, remains `review_required`, and exposes zero confirmed links until the
full French scope review is approved. This is a derived-map synchronization;
it does not approve the curriculum or perform a downstream domain audit.

Source of truth: `_audit/jamb_domain_map_ccmas_derived_2026-08-17.json`,
generated from the corrected French CCMAS scope.
""",
        encoding="utf-8",
    )
    print(json.dumps({"updated": "French", "links": len(corrected["links"]), "status": corrected["mapping_status"]}))


if __name__ == "__main__":
    main()
