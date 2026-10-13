"""Retain the lock-claimed 020 rows under a unique name after a filename collision."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
SOURCE = OUT / "full_population_tranche_020_selection_2026-09-21.json"
SELECTION = OUT / "full_population_tranche_020b_selection_2026-09-21.json"
CHECKPOINT = OUT / "full_population_tranche_020b_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT / "full_population_tranche_020b_checkpoint_2026-09-21.md"


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    ids = [row["row_id"] for row in payload["items"]]
    ledgers = []
    ledger_ids = set()
    for path in OUT.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        ledgers.append(path.name)
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                value = json.loads(line).get("row_id")
                if value:
                    ledger_ids.add(str(value))
    assert len(ids) == 100 and len(set(ids)) == 100
    assert not set(ids) & ledger_ids
    rel = lambda path: path.relative_to(ROOT).as_posix()
    counts = dict(payload["counts"])
    counts["claimed_ledger_ids_checked"] = len(ledger_ids)
    selection = dict(payload)
    selection.update({"tranche": "020b", "source_selection": rel(SOURCE), "selection": rel(SELECTION), "counts": counts, "disjoint_from": sorted(ledgers)})
    SELECTION.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {"schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v2", "accessed_on": date.today().isoformat(), "tranche": "020b", "status": "selected_search_not_started", "blocked": False, "blocker": None, "selection": rel(SELECTION), "source_queue": payload["source_queue"], "counts": counts, "progress": {"selected_rows": 100, "searched_rows": 0, "unique_typed_items": counts["unique_typed_items"], "linked": 0, "review_required": 0, "genuinely_unavailable": 0, "remaining_selected_rows": 100}, "selection_ids": ids, "searched_ids": [], "missing_selection_ids": ids, "changed_files": [rel(SELECTION), rel(CHECKPOINT), rel(CHECKPOINT_MD)], "search_started": False, "guardrails": {"relationships_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "prior_ledgers_modified": False}}
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(f"# Full-population item-enrichment tranche 020b checkpoint\n\n- Scope: **100** lock-claimed pending non-D078 item rows; **{counts['unique_typed_items']}** unique typed items.\n- Existing 020 ledger was preserved; overlap with this selection is zero.\n- Search has not started.\n", encoding="utf-8")
    print(json.dumps(counts, sort_keys=True))


if __name__ == "__main__":
    main()
