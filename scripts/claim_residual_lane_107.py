"""Atomically claim the lane 107 residual item batch."""

from __future__ import annotations

import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = AUDIT_DIR / "item_ledger_quality_audit_2026-09-22.json"
LOCK = ROOT / ".residual_quality_remediation_claim.lock"
BATCH = "quality_remediation_lane_107_20260922"
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


def atomic_json(path: Path, payload: dict[str, Any]) -> None:
    temporary = path.with_name(path.name + f".tmp.{os.getpid()}")
    with temporary.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def acquire_lock() -> None:
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
            if time.time() - started > 120:
                raise TimeoutError(f"timed out waiting for residual claim lock: {LOCK}")
            time.sleep(0.2)


def collect_exclusions() -> tuple[set[str], set[str], dict[str, Any]]:
    processed: set[str] = set()
    disjoint: set[str] = set()
    ledger_files: list[str] = []
    disjoint_ledger_files: list[str] = []
    selection_files: list[str] = []
    ledger_rows = 0
    disjoint_ledger_rows = 0

    for path in sorted(AUDIT_DIR.glob("quality_remediation_lane_*_20260922_append_only_ledger.jsonl")):
        ledger_files.append(path.name)
        lane_token = path.name.split("quality_remediation_lane_", 1)[1].split("_20260922", 1)[0]
        is_disjoint_lane = lane_token.isdigit() and 97 <= int(lane_token) <= 106
        if is_disjoint_lane:
            disjoint_ledger_files.append(path.name)
        with path.open(encoding="utf-8-sig") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(row, dict):
                    continue
                key = typed(row)
                if key == "|":
                    continue
                processed.add(key)
                ledger_rows += 1
                if is_disjoint_lane:
                    disjoint.add(key)
                    disjoint_ledger_rows += 1

    for lane in range(97, 107):
        path = AUDIT_DIR / f"quality_remediation_lane_{lane}_20260922_selection.json"
        if not path.exists():
            continue
        selection_files.append(path.name)
        payload = json.loads(path.read_text(encoding="utf-8"))
        for row in rows_from_payload(payload):
            key = typed(row)
            if key != "|":
                disjoint.add(key)

    return processed, disjoint, {
        "processed_append_only_ledger_files": ledger_files,
        "processed_append_only_ledger_rows": ledger_rows,
        "processed_distinct_typed_items": len(processed),
        "lane_97_106_disjoint_append_only_ledger_files": disjoint_ledger_files,
        "lane_97_106_disjoint_append_only_ledger_rows": disjoint_ledger_rows,
        "lane_97_106_selection_files_read": selection_files,
        "lane_97_106_selection_typed_items_read": len(disjoint),
    }


def main() -> None:
    if SELECTION.exists() or CHECKPOINT.exists():
        raise FileExistsError("lane 107 selection/checkpoint already exists; refusing to overwrite")

    acquire_lock()
    try:
        audit_bytes = AUDIT.read_bytes()
        audit = json.loads(audit_bytes)
        processed, disjoint, details = collect_exclusions()
        selected: list[dict[str, Any]] = []
        selected_keys: set[str] = set()
        for candidate in audit.get("remediation_queue", []):
            if not isinstance(candidate, dict):
                continue
            key = typed(candidate)
            if key == "|" or key in processed or key in disjoint or key in selected_keys:
                continue
            row = dict(candidate)
            row["subject_id"] = row.get("subject_id") or (
                f"item|{row.get('context_level') or 'unscoped'}|"
                f"{row.get('context_key') or ''}|{row.get('item_type') or ''}|"
                f"{row.get('item_key') or ''}"
            )
            selected.append(row)
            selected_keys.add(key)
            if len(selected) == 100:
                break

        source_hash = hashlib.sha256(audit_bytes).hexdigest()
        selection = {
            "schema": "2026-09-22.external-item-quality-remediation-selection.v3",
            "batch": BATCH,
            "selected_at": datetime.now(timezone.utc).isoformat(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "source_sha256": source_hash,
            "selection_method": (
                "atomic repo-root .residual_quality_remediation_claim.lock; source-order selection of distinct "
                "casefold(item_type)|casefold(item_key) keys; all append-only ledger keys are processed; "
                "lane97-106 selections and append-only ledgers are disjoint reservations"
            ),
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
            "lane_97_to_106_disjointness_checked_under_lock": True,
        }
        atomic_json(SELECTION, selection)
        atomic_json(CHECKPOINT, checkpoint)
        print(json.dumps({"batch": BATCH, "selected": len(selected), "shortfall": selection["shortfall"], "selection": str(SELECTION), "checkpoint": str(CHECKPOINT)}, ensure_ascii=False))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
