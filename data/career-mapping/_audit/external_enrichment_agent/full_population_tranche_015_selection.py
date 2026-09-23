"""Select and checkpoint the next disjoint item-only enrichment tranche."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
SELECTION = OUT_DIR / "full_population_tranche_015_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_tranche_015_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_015_checkpoint_2026-09-21.md"


def make_row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def prior_ids() -> set[str]:
    found: set[str] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        found.update(str(row["row_id"]) for row in payload.get("items", []) if row.get("row_id"))
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get("row_id"):
                found.add(str(row["row_id"]))
    return found


def build_rows(queue: dict) -> list[dict]:
    rows: list[dict] = []
    for item in queue.get("items", []):
        if item.get("searchStatus") not in {None, "pending_external_search"}:
            continue
        item_type = str(item.get("itemType") or "")
        item_keys = [str(value) for value in item.get("itemKeys", []) if value]
        for context in item.get("contexts", []):
            level = str(context.get("level") or "")
            context_key = str(context.get("key") or "")
            if context_key.startswith("D078"):
                continue
            for item_key in item_keys:
                current_id = make_row_id(level, context_key, item_type, item_key)
                rows.append(
                    {
                        "record_type": "item",
                        "row_id": current_id,
                        "subject_id": current_id,
                        "context_level": level,
                        "context_key": context_key,
                        "domain_key": context_key if level == "domain" else None,
                        "item_type": item_type,
                        "item_key": item_key,
                        "item_name": str(item.get("name") or ""),
                    }
                )
    return sorted(rows, key=lambda row: row["row_id"])


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    all_pending = build_rows(queue)
    excluded = prior_ids()
    remaining = [row for row in all_pending if row["row_id"] not in excluded]
    selected = remaining[:16]
    counts = {
        "pending_contextual_identities_excluding_d078": len(all_pending),
        "prior_ids_excluded": len(excluded),
        "remaining_after_exclusion": len(remaining),
        "selected_rows": len(selected),
        "item_rows": len(selected),
        "unique_item_names": len({row["item_name"].casefold() for row in selected}),
        "d078_rows": 0,
    }
    disjoint_from = sorted(
        path.name
        for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")
        if "relationship" not in path.name
    )
    selection_rel = SELECTION.relative_to(ROOT).as_posix()
    checkpoint_rel = CHECKPOINT.relative_to(ROOT).as_posix()
    checkpoint_md_rel = CHECKPOINT_MD.relative_to(ROOT).as_posix()
    queue_rel = QUEUE.relative_to(ROOT).as_posix()
    payload = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": "015",
        "selection_order": "stable row_id ascending after excluding D078 and all prior item ledgers/selections",
        "source_queue": queue_rel,
        "excluded_context_prefix": "D078",
        "disjoint_from": disjoint_from,
        "policy": {
            "item_rows_are_unique_contextual_identities": True,
            "source_links_are_not_promoted_without_item_specific_evidence": True,
            "no_link_requires_an_actual_search": True,
            "retired_or_uncertain_sources_remain_review_required": True,
        },
        "items": selected,
        "counts": counts,
    }
    SELECTION.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": "015",
        "status": "selected_search_not_started",
        "blocked": False,
        "blocker": None,
        "selection": selection_rel,
        "source_queue": queue_rel,
        "counts": counts,
        "progress": {
            "selected_rows": len(selected),
            "searched_rows": 0,
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "remaining_selected_rows": len(selected),
        },
        "selection_ids": [row["row_id"] for row in selected],
        "searched_ids": [],
        "missing_selection_ids": [row["row_id"] for row in selected],
        "changed_files": [selection_rel, checkpoint_rel, checkpoint_md_rel],
        "search_started": False,
        "guardrails": {
            "catalogue_touched": False,
            "generated_seed_transport_touched": False,
            "sql_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
            "prior_ledgers_modified": False,
        },
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 015 checkpoint\n\n"
        f"- Selection: `{selection_rel}`\n"
        f"- Scope: **{len(selected)}** deterministic, non-overlapping pending item identities; D078 excluded.\n"
        "- Status: selection and pre-search checkpoint saved; external search not started.\n"
        "- No relationships, catalogue, generated seed, SQL, UI, app, or browser-proof files were changed.\n"
        "- Search rule: retain item-specific HTTPS sources, exact locators, evidence and access dates; uncertain or retired results remain `review_required`.\n"
        "- Blocker report: **not blocked**.\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, sort_keys=True))
    for row in selected:
        print(row["row_id"], "::", row["item_name"])


if __name__ == "__main__":
    main()
