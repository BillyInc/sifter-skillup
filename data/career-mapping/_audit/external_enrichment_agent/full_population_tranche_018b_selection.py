"""Claim the already checkpointed 018 rows under a collision-free tranche name."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
SOURCE_SELECTION = OUT / "full_population_tranche_018_selection_2026-09-21.json"
SELECTION = OUT / "full_population_tranche_018b_selection_2026-09-21.json"
CHECKPOINT = OUT / "full_population_tranche_018b_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT / "full_population_tranche_018b_checkpoint_2026-09-21.md"


def ledger_ids() -> set[str]:
    found: set[str] = set()
    for path in OUT.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                value = json.loads(line).get("row_id")
                if value:
                    found.add(str(value))
    return found


def main() -> None:
    original = json.loads(SOURCE_SELECTION.read_text(encoding="utf-8"))
    items = original["items"]
    ids = [row["row_id"] for row in items]
    assert len(items) == 100 and len(set(ids)) == 100
    assert not any(str(row["context_key"]).startswith("D078") for row in items)
    assert not set(ids) & ledger_ids(), "018 rows overlap an existing ledger"
    rel = lambda path: path.relative_to(ROOT).as_posix()
    counts = dict(original["counts"])
    counts["claimed_ledger_ids_checked"] = len(ledger_ids())
    selection = dict(original)
    selection.update(
        {
            "tranche": "018b",
            "selection_order": "the already checkpointed tranche-018 rows, retained under a unique collision-free artifact name",
            "selection": rel(SELECTION),
            "source_selection": rel(SOURCE_SELECTION),
            "counts": counts,
            "disjoint_from": sorted(path.name for path in OUT.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")),
        }
    )
    SELECTION.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v2",
        "accessed_on": date.today().isoformat(),
        "tranche": "018b",
        "status": "selected_search_not_started",
        "blocked": False,
        "blocker": None,
        "selection": rel(SELECTION),
        "source_queue": original["source_queue"],
        "counts": counts,
        "progress": {"selected_rows": 100, "searched_rows": 0, "unique_typed_items": counts["unique_typed_items"], "linked": 0, "review_required": 0, "genuinely_unavailable": 0, "remaining_selected_rows": 100},
        "selection_ids": ids,
        "searched_ids": [],
        "missing_selection_ids": ids,
        "changed_files": [rel(SELECTION), rel(CHECKPOINT), rel(CHECKPOINT_MD)],
        "search_started": False,
        "guardrails": {"relationships_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "prior_ledgers_modified": False},
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 018b checkpoint\n\n"
        "- This is the collision-free artifact name for the already selected 018 rows; the pre-existing 018 ledger was preserved and not touched.\n"
        f"- Scope: **100** deterministic pending non-D078 item rows; **{counts['unique_typed_items']}** unique typed items.\n"
        "- Status: pre-search checkpoint saved; external search not started.\n"
        "- Existing ledger overlap was checked and is zero.\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, sort_keys=True))


if __name__ == "__main__":
    main()
