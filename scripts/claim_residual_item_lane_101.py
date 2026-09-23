from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = AUDIT_DIR / "item_ledger_quality_audit_2026-09-22.json"
LOCK = ROOT / ".residual_quality_remediation_claim.lock"
BATCH = "quality_remediation_lane_101_20260922"
SELECTION = AUDIT_DIR / f"{BATCH}_selection.json"
CHECKPOINT = AUDIT_DIR / f"{BATCH}_pre_search_checkpoint.json"


def typed(row: dict[str, Any]) -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    item_type = row.get("item_type") or item.get("type") or ""
    item_key = row.get("item_key") or item.get("key") or ""
    return f"{str(item_type).strip().casefold()}|{str(item_key).strip().casefold()}"


def rows_from_payload(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    rows: list[dict[str, Any]] = []
    for field in ("rows", "items", "records"):
        values = payload.get(field)
        if isinstance(values, list):
            rows.extend(value for value in values if isinstance(value, dict))
    return rows


def collect_claimed() -> tuple[set[str], dict[str, Any]]:
    processed: set[str] = set()
    disjoint: set[str] = set()
    ledger_files: list[str] = []
    selection_files: list[str] = []
    ledger_rows = 0

    for path in sorted(AUDIT_DIR.glob("quality_remediation_lane_*_20260922_append_only_ledger.jsonl")):
        ledger_files.append(path.name)
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(row, dict):
                continue
            key = typed(row)
            if key != "|":
                processed.add(key)
            ledger_rows += 1

    for lane in (97, 98, 99, 100):
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

    return processed | disjoint, {
        "existing_processed_ledger_files": ledger_files,
        "existing_processed_ledger_rows": ledger_rows,
        "existing_processed_distinct_typed_items": len(processed),
        "lane_97_98_99_100_selection_files_read": selection_files,
        "lane_97_98_99_100_selection_typed_items_read": len(disjoint),
    }


def acquire() -> None:
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
            if time.time() - started > 120:
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


def main() -> None:
    if SELECTION.exists() or CHECKPOINT.exists():
        raise FileExistsError(f"lane 101 selection/checkpoint already exists: {SELECTION}")
    acquire()
    try:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        claimed, details = collect_claimed()
        selected: list[dict[str, Any]] = []
        selected_keys: set[str] = set()
        for candidate in audit.get("remediation_queue", []):
            row = dict(candidate)
            key = typed(row)
            if key == "|" or key in claimed or key in selected_keys:
                continue
            row["subject_id"] = row.get("subject_id") or (
                f"item|{row.get('context_level') or 'unscoped'}|{row.get('context_key') or ''}|"
                f"{row.get('item_type') or ''}|{row.get('item_key') or ''}"
            )
            selected.append(row)
            selected_keys.add(key)
            if len(selected) == 100:
                break

        source_hash = hashlib.sha256(AUDIT.read_bytes()).hexdigest()
        selection = {
            "schema": "2026-09-22.external-item-quality-remediation-selection.v3",
            "batch": BATCH,
            "selected_at": dt.datetime.now(dt.timezone.utc).isoformat(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "source_sha256": source_hash,
            "selection_method": "atomic repo-root .residual_quality_remediation_claim.lock; source-order selection of distinct casefold(item_type)|casefold(item_key) keys; exclude all processed ledger keys and lane 97-100 selections",
            "claim_lock": LOCK.relative_to(ROOT).as_posix(),
            **details,
            "selection_count": len(selected),
            "requested_count": 100,
            "shortfall": max(0, 100 - len(selected)),
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
            "lane97_lane98_lane99_lane100_disjointness_checked_under_lock": True,
        }
        atomic_json(SELECTION, selection)
        atomic_json(CHECKPOINT, checkpoint)
        print(json.dumps({"batch": BATCH, "selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "selected": len(selected), "shortfall": selection["shortfall"]}, ensure_ascii=False))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
