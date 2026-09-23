"""Select the next disjoint full-population item-enrichment tranche.

This reads the canonical external-enrichment queue, expands its contextual
identities, excludes D078 and every prior item tranche, and writes only the
selection/checkpoint artifacts. It never mutates the catalogue, seed, SQL, or
application code.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
SELECTION = OUT_DIR / "full_population_tranche_006_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_tranche_006_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_006_checkpoint_2026-09-21.md"


def _row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def _prior_ids() -> set[str]:
    prior: set[str] = set()
    for path in sorted(OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json")):
        if "relationship" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        for row in payload.get("items", []):
            if row.get("row_id"):
                prior.add(str(row["row_id"]))
    return prior


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows: list[dict] = []
    for item in queue.get("items", []):
        item_type = str(item.get("itemType") or "")
        item_keys = [str(value) for value in item.get("itemKeys", []) if value]
        for context in item.get("contexts", []):
            level = str(context.get("level") or "")
            context_key = str(context.get("key") or "")
            if context_key.startswith("D078"):
                continue
            for item_key in item_keys:
                row_id = _row_id(level, context_key, item_type, item_key)
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
    rows.sort(key=lambda row: row["row_id"])
    prior = _prior_ids()
    remaining = [row for row in rows if row["row_id"] not in prior]
    selected = remaining[:32]

    payload = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
        "accessed_on": date.today().isoformat(),
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
        "counts": {
            "canonical_contextual_identities_excluding_d078": len(rows),
            "prior_ids_excluded": len(prior),
            "remaining_after_exclusion": len(remaining),
            "selected_rows": len(selected),
            "item_rows": len(selected),
            "d078_rows": 0,
        },
    }
    SELECTION.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": "006",
        "accessed_on": date.today().isoformat(),
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str((OUT_DIR / "full_population_tranche_006_search_ledger_2026-09-21.jsonl").relative_to(ROOT)).replace("\\", "/"),
        "report": str((OUT_DIR / "full_population_tranche_006_report_2026-09-21.md").relative_to(ROOT)).replace("\\", "/"),
        "status": "selected_search_not_started",
        "search_policy": "Search each selected item against an authoritative item-specific source. Preserve exact URL, locator, evidence and access date. Use review_required for uncertainty or retirement; never promote a generic source or inferred match.",
        "counts": payload["counts"],
        "selection_ids": [row["row_id"] for row in selected],
        "searched_ids": [],
        "missing_selection_ids": [row["row_id"] for row in selected],
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 006 checkpoint\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Scope: **{len(selected)}** non-overlapping item identities after tranches 001-005; D078 excluded.\n"
        "- Status: selection saved; external search not started.\n"
        "- No catalogue, generated seed, SQL, UI, or app files were changed.\n"
        "- Search rule: retain item-specific HTTPS sources, exact locators, evidence and access dates; uncertain or retired results remain `review_required`.\n",
        encoding="utf-8",
    )
    print(json.dumps(payload["counts"], sort_keys=True))
    for row in selected:
        print(row["row_id"], "::", row["item_name"])


if __name__ == "__main__":
    main()
