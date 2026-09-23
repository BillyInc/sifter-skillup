"""Select and checkpoint the next 100 disjoint item-only identities."""

from __future__ import annotations

import json
import os
import time
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
TRANCHE = os.environ.get("ITEM_TRANCHE", "017")
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.md"
SELECTION_LOCK = OUT_DIR / ".item_selection.lock"


def row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def claimed_ids() -> set[str]:
    claimed: set[str] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        claimed.update(str(row["row_id"]) for row in payload.get("items", []) if row.get("row_id"))
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                value = json.loads(line)
                if value.get("row_id"):
                    claimed.add(str(value["row_id"]))
    return claimed


def claimed_typed_items() -> set[tuple[str, str]]:
    """Return typed item identities claimed by any item-enrichment lane."""
    claimed: set[tuple[str, str]] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        for row in payload.get("items", []):
            item_type = str(row.get("item_type") or "").strip().casefold()
            item_key = str(row.get("item_key") or "").strip().casefold()
            if item_type and item_key:
                claimed.add((item_type, item_key))
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            value = json.loads(line)
            item_type = str(value.get("item_type") or "").strip().casefold()
            item_key = str(value.get("item_key") or "").strip().casefold()
            if item_type and item_key:
                claimed.add((item_type, item_key))
    return claimed


def pending_rows(queue: dict) -> list[dict]:
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
                current_id = row_id(level, context_key, item_type, item_key)
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


def acquire_selection_lock() -> None:
    """Serialize concurrent item-lane claims so three workers cannot overlap."""
    started = time.time()
    while True:
        try:
            descriptor = os.open(SELECTION_LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(descriptor, f"pid={os.getpid()}\n".encode("ascii"))
            os.close(descriptor)
            return
        except FileExistsError:
            try:
                if time.time() - SELECTION_LOCK.stat().st_mtime > 900:
                    SELECTION_LOCK.unlink()
                    continue
            except FileNotFoundError:
                continue
            if time.time() - started > 120:
                raise TimeoutError("timed out waiting for the shared item-selection lock")
            time.sleep(0.2)


def main() -> None:
    acquire_selection_lock()
    try:
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        claimed = claimed_ids()
        claimed_typed = claimed_typed_items()
        candidates = pending_rows(queue)
        remaining = [
            row
            for row in candidates
            if row["row_id"] not in claimed
            and (row["item_type"].casefold(), row["item_key"].casefold()) not in claimed_typed
        ]
        allow_final_remainder = os.environ.get("ALLOW_FINAL_ITEM_REMAINDER") == "1"
        selected = remaining[:100]
        assert selected and (len(selected) == 100 or allow_final_remainder), f"expected 100 rows, found {len(selected)}"
        ids = [row["row_id"] for row in selected]
        assert len(ids) == len(set(ids))
        assert all(not row["context_key"].startswith("D078") for row in selected)
        assert not set(ids) & claimed
        counts = {
        "pending_contextual_identities_excluding_d078": len(candidates),
        "claimed_ids_excluded": len(claimed),
        "claimed_typed_items_excluded": len(claimed_typed),
        "remaining_after_exclusion": len(remaining),
        "selected_rows": len(selected),
        "item_rows": len(selected),
        "unique_typed_items": len({(row["item_type"], row["item_key"]) for row in selected}),
        "unique_item_names": len({row["item_name"].casefold() for row in selected}),
        "d078_rows": 0,
        }
        queue_rel = QUEUE.relative_to(ROOT).as_posix()
        selection_rel = SELECTION.relative_to(ROOT).as_posix()
        checkpoint_rel = CHECKPOINT.relative_to(ROOT).as_posix()
        checkpoint_md_rel = CHECKPOINT_MD.relative_to(ROOT).as_posix()
        prior_ledgers = sorted(
        path.name
        for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")
        if "relationship" not in path.name
        )
        selection = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "selection_order": "stable row_id ascending after excluding D078, all claimed item selections/ledgers, and all claimed typed items",
        "source_queue": queue_rel,
        "excluded_context_prefix": "D078",
        "disjoint_from": prior_ledgers,
        "policy": {
            "item_rows_are_unique_contextual_identities": True,
            "search_once_per_unique_typed_item_and_fan_evidence": True,
            "typed_item_claims_are_disjoint_across_lanes": True,
            "source_links_are_not_promoted_without_item_specific_evidence": True,
            "no_link_requires_an_actual_search": True,
            "retired_or_uncertain_sources_remain_review_required": True,
        },
        "items": selected,
        "counts": counts,
        }
        SELECTION.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "status": "selected_search_not_started",
        "blocked": False,
        "blocker": None,
        "selection": selection_rel,
        "source_queue": queue_rel,
        "counts": counts,
        "progress": {
            "selected_rows": len(selected),
            "searched_rows": 0,
            "unique_typed_items": counts["unique_typed_items"],
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "remaining_selected_rows": len(selected),
        },
        "selection_ids": ids,
        "searched_ids": [],
        "missing_selection_ids": ids,
        "changed_files": [selection_rel, checkpoint_rel, checkpoint_md_rel],
        "search_started": False,
        "guardrails": {
            "relationship_ledgers_touched": False,
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
        f"# Full-population item-enrichment tranche {TRANCHE} checkpoint\n\n"
        f"- Selection: `{selection_rel}`\n"
        f"- Scope: **{len(selected)}** deterministic, disjoint, pending item identities; D078 excluded.\n"
        f"- Unique typed items to search once: **{counts['unique_typed_items']}**.\n"
        "- Status: selection and pre-search checkpoint saved; external search not started.\n"
        "- Search contract: retain item-specific HTTPS sources, exact locators, evidence and access dates; uncertain results remain `review_required`.\n"
        "- No relationships, catalogue, generated seed, SQL, UI, app, or browser-proof files were changed.\n"
        "- Blocker report: **not blocked**.\n",
        encoding="utf-8",
        )
        print(json.dumps(counts, sort_keys=True))
        for row in selected:
            print(row["row_id"], "::", row["item_name"])
    finally:
        try:
            SELECTION_LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
