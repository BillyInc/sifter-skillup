"""Claim, enrich, and reconcile residual typed item keys for lane 99.

This lane is deliberately item-only.  It uses the residual shared claim lock,
counts existing append-only ledgers as processed, and treats lane 97/98/99
selection files as disjointness claims for this residual run.  It never edits
older artifacts or any catalogue/relationship/SQL/seed/UI/browser-proof data.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = AUDIT_DIR / "item_ledger_quality_audit_2026-09-22.json"
# Shared across all residual lanes; intentionally at repo root so lane97/98
# selectors cannot claim concurrently through separate audit-directory locks.
LOCK = ROOT / ".residual_quality_remediation_claim.lock"
BATCH = "quality_remediation_lane_99_20260922"
SELECTION = AUDIT_DIR / f"{BATCH}_selection.json"
CHECKPOINT = AUDIT_DIR / f"{BATCH}_pre_search_checkpoint.json"
LEDGER = AUDIT_DIR / f"{BATCH}_append_only_ledger.jsonl"
REPORT = AUDIT_DIR / f"{BATCH}_final_report.json"
REPORT_MD = AUDIT_DIR / f"{BATCH}_final_report.md"


def typed(row: dict[str, Any]) -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    return f"{row.get('item_type') or item.get('type') or ''}|{row.get('item_key') or item.get('key') or ''}".casefold()


def subject_id(row: dict[str, Any]) -> str:
    if row.get("subject_id"):
        return str(row["subject_id"])
    level = row.get("context_level") or "unscoped"
    key = row.get("context_key") or ""
    return f"item|{level}|{key}|{row.get('item_type') or ''}|{row.get('item_key') or ''}"


def rows_from_payload(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    rows: list[dict[str, Any]] = []
    for key in ("rows", "items", "records"):
        values = payload.get(key)
        if isinstance(values, list):
            rows.extend(value for value in values if isinstance(value, dict))
    return rows


def collect_residual_claims() -> tuple[set[str], set[str], dict[str, Any]]:
    """Return processed typed keys and lane97/98/99 disjointness keys."""
    processed: set[str] = set()
    disjoint: set[str] = set()
    ledger_rows = 0
    ledger_files: list[str] = []
    selection_files: list[str] = []

    for path in sorted(AUDIT_DIR.glob("quality_remediation_lane_*_20260922_append_only_ledger.jsonl")):
        ledger_files.append(path.name)
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if isinstance(row, dict):
                    key = typed(row)
                    if key != "|":
                        processed.add(key)
                    ledger_rows += 1
                    if "_lane_97_" in path.name or "_lane_98_" in path.name or "_lane_99_" in path.name:
                        if key != "|":
                            disjoint.add(key)

    for lane in (97, 98, 99):
        for path in sorted(AUDIT_DIR.glob(f"quality_remediation_lane_{lane}_20260922_selection.json")):
            selection_files.append(path.name)
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            for row in rows_from_payload(payload):
                key = typed(row)
                if key != "|":
                    disjoint.add(key)

    # Legacy selection-only claims are intentionally not added to processed.
    details = {
        "existing_append_only_ledger_files": ledger_files,
        "existing_append_only_ledger_rows": ledger_rows,
        "existing_processed_distinct_typed_items": len(processed),
        "lane_97_98_99_selection_files_read": selection_files,
        "lane_97_98_99_selection_typed_items_read": len(disjoint),
    }
    return processed, disjoint, details


def acquire_lock(timeout: float = 120.0) -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            try:
                os.write(fd, f"pid={os.getpid()} batch={BATCH}\n".encode("ascii"))
            finally:
                os.close(fd)
            return
        except FileExistsError:
            try:
                stale = time.time() - LOCK.stat().st_mtime > 900
            except FileNotFoundError:
                continue
            if stale:
                raise TimeoutError(f"stale residual claim lock present: {LOCK}")
            if time.time() - started > timeout:
                raise TimeoutError(f"timed out waiting for residual claim lock: {LOCK}")
            time.sleep(0.2)


def atomic_json(path: Path, payload: dict[str, Any]) -> None:
    tmp = path.with_name(path.name + f".tmp.{os.getpid()}")
    with tmp.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(tmp, path)


def select(count: int) -> dict[str, Any]:
    if SELECTION.exists() or CHECKPOINT.exists():
        raise FileExistsError("lane 99 selection/checkpoint already exists; refusing to overwrite")
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    processed, disjoint, claim_details = collect_residual_claims()
    selected: list[dict[str, Any]] = []
    selected_typed: set[str] = set()
    for candidate in audit.get("remediation_queue", []):
        row = dict(candidate)
        key = typed(row)
        if key == "|" or key in processed or key in disjoint or key in selected_typed:
            continue
        row["subject_id"] = row.get("subject_id") or subject_id(row)
        selected.append(row)
        selected_typed.add(key)
        if len(selected) == count:
            break

    source_hash = hashlib.sha256(AUDIT.read_bytes()).hexdigest()
    selection = {
        "schema": "2026-09-22.external-item-quality-remediation-selection.v3",
        "batch": BATCH,
        "selected_at": datetime.now(timezone.utc).isoformat(),
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "source_sha256": source_hash,
        "selection_method": (
            "atomic shared .residual_quality_remediation_claim.lock; source-order selection of distinct "
            "casefold(item_type)|casefold(item_key) keys; existing append-only ledgers are processed; "
            "lane97/98/99 selections and ledgers are disjointness claims; legacy selection-only claims are not processed"
        ),
        "claim_lock": LOCK.relative_to(ROOT).as_posix(),
        **claim_details,
        "selection_count": len(selected),
        "requested_count": count,
        "shortfall": max(0, count - len(selected)),
        "distinct_typed_keys": [typed(row) for row in selected],
        "rows": selected,
        "policy": {
            "identity": "casefold(item_type)|casefold(item_key)",
            "review_required_preserved_unless_exact_item_type_context_ownership_proven": True,
            "no_relationship_inference": True,
            "no_promotion": True,
            "items_only": True,
        },
    }
    checkpoint = {
        "schema": "2026-09-22.external-item-quality-remediation-checkpoint.v3",
        "batch": BATCH,
        "status": "selected_pre_search",
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "selection_count": len(selected),
        "searched_count": 0,
        "processed_count": 0,
        "promotion_performed": False,
        "exact_identity": "casefold(item_type)|casefold(item_key)",
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "lane97_lane98_disjointness_checked_under_lock": True,
    }
    atomic_json(SELECTION, selection)
    atomic_json(CHECKPOINT, checkpoint)
    return selection


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=100)
    args = parser.parse_args()
    if args.count <= 0:
        raise SystemExit("--count must be positive")
    acquire_lock()
    try:
        selection = select(args.count)
        print(json.dumps({"batch": BATCH, "selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "selected": selection["selection_count"], "shortfall": selection["shortfall"]}))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
