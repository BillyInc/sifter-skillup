"""Recover tranche 075 after a concurrent selection-file overwrite.

The original 075 ledger contains 56 valid rows from an earlier selection,
while the final 075 selection contains a different 100-row claim. Preserve
both claims by giving the final selection a distinct recovery suffix.
"""

from __future__ import annotations

import copy
import json
import os
from pathlib import Path


HERE = Path(__file__).resolve().parent
SOURCE_TRANCHE = os.environ.get("RECOVER_SOURCE_TRANCHE", "075")
TARGET = os.environ.get("RECOVER_TARGET", "075b")
SOURCE_SELECTION = HERE / f"full_population_tranche_{SOURCE_TRANCHE}_selection_2026-09-21.json"
SOURCE_CHECKPOINT = HERE / f"full_population_tranche_{SOURCE_TRANCHE}_checkpoint_2026-09-21.json"
SOURCE_LEDGER = HERE / f"full_population_tranche_{SOURCE_TRANCHE}_search_ledger_2026-09-21.jsonl"
TARGET_SELECTION = HERE / f"full_population_tranche_{TARGET}_selection_2026-09-21.json"
TARGET_CHECKPOINT = HERE / f"full_population_tranche_{TARGET}_checkpoint_2026-09-21.json"
TARGET_CHECKPOINT_MD = HERE / f"full_population_tranche_{TARGET}_checkpoint_2026-09-21.md"


def main() -> None:
    orphan_rows = sum(1 for line in SOURCE_LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()) if SOURCE_LEDGER.exists() else 0
    selection = copy.deepcopy(json.loads(SOURCE_SELECTION.read_text(encoding="utf-8")))
    selection["tranche"] = TARGET
    selection["recovery_reason"] = (
        f"The numeric {SOURCE_TRANCHE} ledger contains {orphan_rows} valid rows from an overwritten prior "
        "selection; this recovery selection preserves the final 100-row claim."
    )
    selection["disjoint_from"] = sorted(
        set(selection.get("disjoint_from", []))
        | {SOURCE_LEDGER.name}
    )
    selection["counts"]["recovery_orphan_rows_preserved"] = orphan_rows
    selection["items"] = list(selection["items"])
    TARGET_SELECTION.write_text(
        json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    checkpoint = copy.deepcopy(json.loads(SOURCE_CHECKPOINT.read_text(encoding="utf-8")))
    checkpoint["tranche"] = TARGET
    checkpoint["selection"] = str(TARGET_SELECTION.relative_to(HERE.parents[3])).replace("\\", "/")
    checkpoint["status"] = "selected_search_not_started"
    checkpoint["recovery_reason"] = selection["recovery_reason"]
    checkpoint["progress"] = {
        "selected_rows": len(selection["items"]),
        "searched_rows": 0,
        "unique_typed_items_searched": selection["counts"]["unique_typed_items"],
        "linked": 0,
        "review_required": 0,
        "genuinely_unavailable": 0,
        "remaining_selected_rows": len(selection["items"]),
    }
    checkpoint["searched_ids"] = []
    checkpoint["missing_selection_ids"] = [row["row_id"] for row in selection["items"]]
    checkpoint["search_started"] = False
    checkpoint["changed_files"] = [
        str(TARGET_SELECTION.relative_to(HERE.parents[3])).replace("\\", "/"),
        str(TARGET_CHECKPOINT.relative_to(HERE.parents[3])).replace("\\", "/"),
        str(TARGET_CHECKPOINT_MD.relative_to(HERE.parents[3])).replace("\\", "/"),
    ]
    TARGET_CHECKPOINT.write_text(
        json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    TARGET_CHECKPOINT_MD.write_text(
        f"# Full-population item-enrichment tranche {TARGET} checkpoint\n\n"
        f"- Recovery scope: **100** rows from the final numeric-{SOURCE_TRANCHE} selection.\n"
        f"- The {orphan_rows} valid rows already present in the numeric-{SOURCE_TRANCHE} ledger are preserved.\n"
        f"- Unique typed items to search once: **{selection['counts']['unique_typed_items']}**.\n"
        "- Status: selection and pre-search checkpoint saved; external search not started.\n"
        "- Relationships, catalogue, seed transport, SQL, UI and browser proof are untouched.\n",
        encoding="utf-8",
    )
    print(json.dumps({"target": TARGET, "selected_rows": len(selection["items"]), "preserved_orphan_rows": orphan_rows}))


if __name__ == "__main__":
    main()
