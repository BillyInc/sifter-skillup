"""Atomically select the lane 103 residual item batch."""

from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = AUDIT_DIR / "item_ledger_quality_audit_2026-09-22.json"
LOCK = ROOT / ".residual_quality_remediation_claim.lock"
BATCH = "quality_remediation_lane_103_20260922"
SELECTION = AUDIT_DIR / f"{BATCH}_selection.json"
CHECKPOINT = AUDIT_DIR / f"{BATCH}_pre_search_checkpoint.json"


def typed(row: dict[str, Any]) -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    item_type = row.get("item_type") or item.get("type") or ""
    item_key = row.get("item_key") or item.get("key") or ""
    return f"{str(item_type).strip().casefold()}|{str(item_key).strip().casefold()}"


def add_rows(payload: Any, keys: set[str]) -> None:
    if not isinstance(payload, dict):
        return
    for field in ("rows", "items", "records"):
        values = payload.get(field)
        if isinstance(values, list):
            for row in values:
                if isinstance(row, dict):
                    key = typed(row)
                    if key != "|":
                        keys.add(key)


def collect_exclusions() -> tuple[set[str], list[str], list[str]]:
    processed: set[str] = set()
    ledger_files: list[str] = []
    selection_files: list[str] = []

    for path in sorted(AUDIT_DIR.glob("*_append_only_ledger.jsonl")):
        ledger_files.append(path.name)
        with path.open(encoding="utf-8-sig") as handle:
            for line in handle:
                if line.strip():
                    try:
                        row = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if isinstance(row, dict):
                        key = typed(row)
                        if key != "|":
                            processed.add(key)

    for lane in range(97, 103):
        path = AUDIT_DIR / f"quality_remediation_lane_{lane}_20260922_selection.json"
        if not path.exists():
            continue
        selection_files.append(path.name)
        add_rows(json.loads(path.read_text(encoding="utf-8")), processed)

    return processed, ledger_files, selection_files


def atomic_json(path: Path, payload: dict[str, Any]) -> None:
    temp = path.with_name(path.name + f".tmp.{os.getpid()}")
    with temp.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temp, path)


def main() -> None:
    if SELECTION.exists() or CHECKPOINT.exists():
        raise SystemExit("lane 103 selection/checkpoint already exists; refusing to overwrite")

    fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    try:
        os.write(fd, f"pid={os.getpid()} batch={BATCH}\n".encode("ascii"))
        os.close(fd)
        fd = -1

        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        excluded, ledger_files, selection_files = collect_exclusions()
        selected: list[dict[str, Any]] = []
        selected_keys: set[str] = set()
        for candidate in audit.get("remediation_queue", []):
            if not isinstance(candidate, dict):
                continue
            key = typed(candidate)
            if key == "|" or key in excluded or key in selected_keys:
                continue
            row = dict(candidate)
            if not row.get("subject_id"):
                row["subject_id"] = (
                    f"item|{row.get('context_level') or 'unscoped'}|"
                    f"{row.get('context_key') or ''}|{row.get('item_type') or ''}|"
                    f"{row.get('item_key') or ''}"
                )
            selected.append(row)
            selected_keys.add(key)
            if len(selected) == 100:
                break

        source_hash = hashlib.sha256(AUDIT.read_bytes()).hexdigest()
        selection = {
            "schema": "2026-09-22.external-item-quality-remediation-selection.v3",
            "batch": BATCH,
            "selected_at": datetime.now(timezone.utc).isoformat(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "source_sha256": source_hash,
            "selection_method": "atomic shared .residual_quality_remediation_claim.lock; distinct casefold(item_type)|casefold(item_key); exclude all processed append-only records and lane97-102 selections",
            "claim_lock": LOCK.relative_to(ROOT).as_posix(),
            "processed_append_only_ledger_files": ledger_files,
            "lane97_102_selection_files_read": selection_files,
            "prior_excluded_typed_items": len(excluded),
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
        }
        atomic_json(SELECTION, selection)
        atomic_json(CHECKPOINT, checkpoint)
        print(json.dumps({"batch": BATCH, "selected": len(selected), "shortfall": selection["shortfall"], "excluded": len(excluded), "selection": str(SELECTION), "checkpoint": str(CHECKPOINT)}))
    finally:
        if fd != -1:
            os.close(fd)
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
