"""Extract the canonical eight residual review-required contextual item rows.

This is a read-only selector for the targeted residual lane.  It never rewrites
the contextual catalogue and never infers a new link state.
"""

from __future__ import annotations

import gzip
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
OUT = HERE / "targeted_residual_item_lane_20260923_selection.json"


def main() -> None:
    with gzip.open(CATALOGUE, "rt", encoding="utf-8") as stream:
        payload = json.load(stream)
    rows = [row for row in payload["items"] if row.get("link_state") == "review_required"]
    if len(rows) != 8:
        raise SystemExit(f"expected exactly 8 canonical residual rows, found {len(rows)}")
    rows.sort(key=lambda row: (
        str(row.get("context_level") or ""),
        str(row.get("context_key") or ""),
        str(row.get("item_type") or ""),
        str(row.get("item_key") or ""),
    ))
    selection = {
        "schema": "2026-09-23.targeted-residual-item-selection.v1",
        "source": "data/career-mapping/contextual_guidance_items.json.gz",
        "source_link_state": "review_required",
        "count": len(rows),
        "rows": rows,
    }
    OUT.write_text(json.dumps(selection, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "count": len(rows), "rows": [
        {key: row.get(key) for key in ("context_level", "context_key", "item_type", "item_key", "item_name")}
        for row in rows
    ]}, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
