"""Select and checkpoint the next 100 disjoint item-only enrichment rows."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
SELECTION = OUT_DIR / "full_population_tranche_016_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_tranche_016_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_016_checkpoint_2026-09-21.md"
TRANCHE = "016"


def make_row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def prior_ids() -> set[str]:
    found: set[str] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json"):
        if "relationship" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        found.update(str(row["row_id"]) for row in payload.get("items", []) if row.get("row_id"))
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
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
                row_id = make_row_id(level, context_key, item_type, item_key)
                rows.append(
                    {
                        "record_type": "item",
                        "row_id": row_id,
                        "subject_id": row_id,
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
    pending = build_rows(queue)
    excluded = prior_ids()
    remaining = [row for row in pending if row["row_id"] not in excluded]
    selected = remaining[:100]
    assert len(selected) == 100, len(selected)
    assert len({row["row_id"] for row in selected}) == 100
    assert all(not row["context_key"].startswith("D078") for row in selected)
    assert all(row["item_type"] != "relationship" for row in selected)

    disjoint_from = sorted(
        path.name
        for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")
        if "relationship" not in path.name
    )
    counts = {
        "pending_contextual_rows_excluding_d078": len(pending),
        "prior_ids_excluded": len(excluded),
        "remaining_after_exclusion": len(remaining),
        "selected_rows": len(selected),
        "item_rows": len(selected),
        "unique_typed_items": len({(r["item_type"], r["item_key"]) for r in selected}),
        "unique_item_names": len({(r["item_type"], r["item_name"].casefold()) for r in selected}),
        "d078_rows": 0,
    }
    rel = lambda path: path.relative_to(ROOT).as_posix()
    payload = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v2",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "selection_order": "stable row_id ascending after excluding D078 and all prior item ledgers/selections",
        "source_queue": rel(QUEUE),
        "excluded_context_prefix": "D078",
        "disjoint_from": disjoint_from,
        "policy": {
            "exact_selected_contextual_rows": 100,
            "search_once_per_unique_typed_item": True,
            "fan_evidence_to_selected_contextual_rows": True,
            "source_links_are_not_promoted_without_item_specific_evidence": True,
            "retired_or_uncertain_sources_remain_review_required": True,
            "genuinely_unavailable_requires_search_attempt": True,
            "no_role_or_domain_requirement_inference": True,
        },
        "items": selected,
        "counts": counts,
    }
    SELECTION.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v2",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "status": "selected_search_not_started",
        "blocked": False,
        "blocker": None,
        "selection": rel(SELECTION),
        "source_queue": rel(QUEUE),
        "counts": counts,
        "progress": {
            "selected_rows": 100,
            "searched_rows": 0,
            "unique_typed_items": counts["unique_typed_items"],
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "remaining_selected_rows": 100,
        },
        "selection_ids": [row["row_id"] for row in selected],
        "searched_ids": [],
        "missing_selection_ids": [row["row_id"] for row in selected],
        "changed_files": [rel(SELECTION), rel(CHECKPOINT), rel(CHECKPOINT_MD)],
        "search_started": False,
        "guardrails": {
            "catalogue_touched": False,
            "generated_seed_transport_touched": False,
            "relationships_touched": False,
            "sql_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
            "prior_ledgers_modified": False,
        },
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 016 checkpoint\n\n"
        f"- Scope: **100** deterministic pending non-D078 item rows; **{counts['unique_typed_items']}** unique typed items.\n"
        f"- Selection: `{rel(SELECTION)}`\n"
        "- Status: selection and pre-search checkpoint saved; external search not started.\n"
        "- Search policy: search once per unique typed item and fan the decision/evidence to every selected contextual row.\n"
        "- Search evidence must retain authoritative item-specific HTTPS URLs, access dates and locators.\n"
        "- No relationship, catalogue, generated seed, SQL, UI, app, or browser-proof files were changed.\n"
        "- Prior item ledgers were re-read for disjointness; no selected row overlaps them.\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, sort_keys=True))
    for row in selected:
        print(row["row_id"], "::", row["item_name"])


if __name__ == "__main__":
    main()
