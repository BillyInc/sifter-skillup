"""Select and checkpoint the next disjoint full-population item batch."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
TRANCHE = "011"
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.md"


def row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def prior_ids() -> set[str]:
    found: set[str] = set()
    for path in sorted(OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json")):
        if "relationship" in path.name or path.name == SELECTION.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        found.update(str(item["row_id"]) for item in payload.get("items", []) if item.get("row_id"))
    return found


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows: list[dict] = []
    for item in queue.get("items", []):
        if str(item.get("searchStatus") or "") != "pending_external_search":
            continue
        item_type = str(item.get("itemType") or "")
        item_keys = [str(value) for value in item.get("itemKeys", []) if value]
        for context in item.get("contexts", []):
            level = str(context.get("level") or "")
            context_key = str(context.get("key") or "")
            if context_key.startswith("D078"):
                continue
            for item_key in item_keys:
                current_id = row_id(level, context_key, item_type, item_key)
                rows.append({
                    "record_type": "item",
                    "row_id": current_id,
                    "subject_id": current_id,
                    "context_level": level,
                    "context_key": context_key,
                    "domain_key": context_key if level == "domain" else None,
                    "item_type": item_type,
                    "item_key": item_key,
                    "item_name": str(item.get("name") or ""),
                })
    rows.sort(key=lambda item: item["row_id"])
    excluded = prior_ids()
    remaining = [item for item in rows if item["row_id"] not in excluded]
    selected = remaining[:16]
    counts = {
        "canonical_contextual_identities_excluding_d078": len(rows),
        "prior_ids_excluded": len(excluded),
        "remaining_after_exclusion": len(remaining),
        "selected_rows": len(selected),
        "item_rows": len(selected),
        "d078_rows": 0,
    }
    payload = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "selection_order": "stable row_id ascending after excluding D078 and all prior item tranches",
        "source_queue": str(QUEUE.relative_to(ROOT)).replace("\\", "/"),
        "excluded_context_prefix": "D078",
        "disjoint_from": sorted(path.name for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")),
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
        "tranche": TRANCHE,
        "status": "selected_search_not_started",
        "blocked": False,
        "blocker": None,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "source_queue": str(QUEUE.relative_to(ROOT)).replace("\\", "/"),
        "counts": counts,
        "progress": {"selected_rows": len(selected), "searched_rows": 0, "linked": 0, "review_required": 0, "genuinely_unavailable": 0},
        "selection_ids": [item["row_id"] for item in selected],
        "searched_ids": [],
        "missing_selection_ids": [item["row_id"] for item in selected],
        "changed_files": [str(SELECTION.relative_to(ROOT)).replace("\\", "/"), str(CHECKPOINT.relative_to(ROOT)).replace("\\", "/"), str(CHECKPOINT_MD.relative_to(ROOT)).replace("\\", "/")],
        "search_started": False,
        "guardrails": {"catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False},
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        f"# Full-population item-enrichment tranche {TRANCHE} checkpoint\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Scope: **{len(selected)}** non-overlapping pending item identities; D078 excluded.\n"
        "- Status: selection saved; external search not started.\n"
        "- No catalogue, generated seed, SQL, UI, app, or browser-proof files were changed.\n"
        "- Search rule: retain item-specific HTTPS sources, exact locators, evidence and access dates; uncertain or retired results remain `review_required`.\n"
        "- Blocker report: **not blocked**.\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, sort_keys=True))
    for item in selected:
        print(item["row_id"], "::", item["item_name"])


if __name__ == "__main__":
    main()
