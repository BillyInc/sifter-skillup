"""Claim pending typed item identities left behind by interrupted item lanes.

This recovery selector uses the same shared lock as the normal item selector,
but distinguishes successful ledgers from stale selection-only claims. It
claims only queue entries still marked pending and emits the normal selection
and pre-search checkpoint artifacts consumed by the item search runner.
"""

from __future__ import annotations

import json
import os
import time
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
TRANCHE = os.environ.get("ITEM_TRANCHE", "recovery_pending")
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / f"full_population_trANCHE_{TRANCHE}_checkpoint_2026-09-21.md".replace("trANCHE", "tranche")
LOCK = OUT_DIR / ".item_selection.lock"
STALE_SECONDS = 900


def row_id(level: str, context_key: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context_key}|{item_type}|{item_key}"


def acquire_lock() -> None:
    started = time.time()
    while True:
        try:
            descriptor = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(descriptor, f"pid={os.getpid()}\n".encode("ascii"))
            os.close(descriptor)
            return
        except FileExistsError:
            try:
                if time.time() - LOCK.stat().st_mtime > STALE_SECONDS:
                    LOCK.unlink()
                    continue
            except FileNotFoundError:
                continue
            if time.time() - started > 120:
                raise TimeoutError("timed out waiting for the shared item-selection lock")
            time.sleep(0.2)


def item_ledgers() -> list[Path]:
    return sorted(
        path
        for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl")
        if "relationship" not in path.name
    )


def successful_typed_items() -> set[tuple[str, str]]:
    found: set[tuple[str, str]] = set()
    for path in item_ledgers():
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            item_type = str(row.get("item_type") or "").casefold()
            item_key = str(row.get("item_key") or "").casefold()
            if item_type and item_key:
                found.add((item_type, item_key))
    return found


def active_claimed_typed_items() -> set[tuple[str, str]]:
    now = time.time()
    found: set[tuple[str, str]] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_selection_2026-09-21.json"):
        checkpoint = path.with_name(path.name.replace("_selection_", "_checkpoint_"))
        try:
            age = now - max(path.stat().st_mtime, checkpoint.stat().st_mtime)
            status = json.loads(checkpoint.read_text(encoding="utf-8")).get("status")
        except (FileNotFoundError, json.JSONDecodeError):
            continue
        if age > STALE_SECONDS or status not in {"selected_search_not_started", "in_progress"}:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        for row in payload.get("items", []):
            item_type = str(row.get("item_type") or "").casefold()
            item_key = str(row.get("item_key") or "").casefold()
            if item_type and item_key:
                found.add((item_type, item_key))
    return found


def pending_candidates(queue: dict, excluded: set[tuple[str, str]], include_d078: bool) -> list[dict]:
    candidates: list[dict] = []
    for item in queue.get("items", []):
        if item.get("searchStatus") != "pending_external_search":
            continue
        item_type = str(item.get("itemType") or "")
        if not item_type:
            continue
        contexts = sorted(
            (context for context in item.get("contexts", []) if include_d078 or not str(context.get("key") or "").startswith("D078")),
            key=lambda context: (str(context.get("level") or ""), str(context.get("key") or "")),
        )
        if not contexts:
            continue
        context = contexts[0]
        level = str(context.get("level") or "")
        context_key = str(context.get("key") or "")
        for item_key in sorted(str(value) for value in item.get("itemKeys", []) if value):
            typed = (item_type.casefold(), item_key.casefold())
            if typed in excluded:
                continue
            current_id = row_id(level, context_key, item_type, item_key)
            candidates.append(
                {
                    "record_type": "item",
                    "row_id": current_id,
                    "subject_id": current_id,
                    "context_level": level,
                    "context_key": context_key,
                    "domain_key": context_key if level == "domain" else None,
                    "item_type": item_type,
                    "item_key": item_key,
                    "item_name": str(item.get("name") or item_key),
                }
            )
    return sorted(candidates, key=lambda row: row["row_id"])


def main() -> None:
    acquire_lock()
    try:
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        successful = successful_typed_items()
        active = active_claimed_typed_items()
        include_d078 = os.environ.get("INCLUDE_D078_FINAL") == "1"
        candidates = pending_candidates(queue, successful | active, include_d078)
        allow_final = os.environ.get("ALLOW_FINAL_ITEM_REMAINDER") == "1"
        selected = candidates[:100]
        assert selected and (len(selected) == 100 or allow_final), f"expected 100 rows, found {len(selected)}"
        ids = [row["row_id"] for row in selected]
        assert len(ids) == len(set(ids))
        counts = {
            "pending_queue_items": sum(item.get("searchStatus") == "pending_external_search" for item in queue.get("items", [])),
            "successful_typed_items_excluded": len(successful),
            "active_typed_items_excluded": len(active),
            "eligible_pending_typed_rows": len(candidates),
            "selected_rows": len(selected),
            "item_rows": len(selected),
            "unique_typed_items": len({(row["item_type"], row["item_key"]) for row in selected}),
            "unique_item_names": len({row["item_name"].casefold() for row in selected}),
            "d078_rows": sum(str(row["context_key"]).startswith("D078") for row in selected),
        }
        queue_rel = QUEUE.relative_to(ROOT).as_posix()
        selection_rel = SELECTION.relative_to(ROOT).as_posix()
        checkpoint_rel = CHECKPOINT.relative_to(ROOT).as_posix()
        checkpoint_md_rel = CHECKPOINT_MD.relative_to(ROOT).as_posix()
        selection = {
            "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
            "accessed_on": date.today().isoformat(),
            "tranche": TRANCHE,
            "selection_order": "stable pending queue order after excluding successful typed items, active claims and D078",
            "source_queue": queue_rel,
            "excluded_context_prefix": None if include_d078 else "D078",
            "disjoint_from": [path.name for path in item_ledgers()],
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
            "progress": {"selected_rows": len(selected), "searched_rows": 0, "unique_typed_items": counts["unique_typed_items"], "linked": 0, "review_required": 0, "genuinely_unavailable": 0, "remaining_selected_rows": len(selected)},
            "selection_ids": ids,
            "searched_ids": [],
            "missing_selection_ids": ids,
            "changed_files": [selection_rel, checkpoint_rel, checkpoint_md_rel],
            "search_started": False,
            "guardrails": {"relationship_ledgers_touched": False, "catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False, "prior_ledgers_modified": False},
        }
        CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        CHECKPOINT_MD.write_text(
            f"# Pending-item recovery tranche {TRANCHE} checkpoint\n\n"
            f"- Scope: **{len(selected)}** pending typed item rows; D078 {'included as the final explicit remainder' if include_d078 else 'excluded'}.\n"
            f"- Unique typed items to search once: **{counts['unique_typed_items']}**.\n"
            "- Stale selection-only claims were recoverable; successful ledgers and active claims were excluded.\n"
            "- Status: selection and pre-search checkpoint saved; external search not started.\n"
            "- Relationships, catalogue, generated seed, SQL, UI and browser proof are untouched.\n",
            encoding="utf-8",
        )
        print(json.dumps(counts, sort_keys=True))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
