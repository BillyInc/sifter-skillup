"""Atomically claim a clean quality-remediation batch.

This selector is intentionally separate from the reviewers.  It creates the
selection and pre-search checkpoint under one shared lock so parallel agents
cannot append to one another's files.  It never writes catalogue, SQL, seed,
UI, browser-proof, ledger, or promotion data.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = AUDIT_DIR / "item_ledger_quality_audit_2026-09-22.json"
LOCK = AUDIT_DIR / ".quality_remediation_claim.lock"


def identity(row: dict[str, Any]) -> str:
    value = row.get("subject_id") or row.get("identity") or row.get("row_id")
    if value:
        return str(value)
    return "item|{0}|{1}|{2}|{3}".format(
        row.get("context_level") or "unscoped",
        row.get("context_key") or "",
        row.get("item_type") or "",
        row.get("item_key") or "",
    )


def typed(row: dict[str, Any]) -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    return "{0}|{1}".format(
        row.get("item_type") or item.get("type") or "",
        row.get("item_key") or item.get("key") or "",
    ).casefold()


def add_row(row: Any, claimed_ids: set[str], claimed_typed: set[str]) -> None:
    if not isinstance(row, dict):
        return
    claimed_ids.add(identity(row))
    key = typed(row)
    if key != "|":
        claimed_typed.add(key)


def collect_claims() -> tuple[set[str], set[str]]:
    ids: set[str] = set()
    typed_ids: set[str] = set()
    def valid_remediation_artifact(name: str) -> bool:
        if any(token in name for token in ("lane13", "lane14", "lane15", "lane16", "lane17", "lane18", "lane19", "lane20")):
            return False
        return any(token in name for token in ("remediation", "lane3_", "lane_4_", "lane_5_", "lane6_", "lane7_", "lane8_", "lane9_", "lane10_", "lane11_", "lane12_"))
    for path in sorted(AUDIT_DIR.glob("*_selection*.json")):
        if not valid_remediation_artifact(path.name):
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        claim = payload.get("claim") if isinstance(payload, dict) else None
        for value in (claim or {}).get("subject_ids", []) if isinstance(claim, dict) else []:
            ids.add(str(value))
        for key in ("items", "records", "rows"):
            for row in payload.get(key, []) if isinstance(payload, dict) else []:
                add_row(row, ids, typed_ids)
    for path in sorted(AUDIT_DIR.glob("*_claims_2026-09-22.jsonl")):
        if not valid_remediation_artifact(path.name):
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except OSError:
            continue
        for line in lines:
            try:
                add_row(json.loads(line), ids, typed_ids)
            except json.JSONDecodeError:
                continue
    return ids, typed_ids


def acquire() -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"pid={os.getpid()}\n".encode("ascii"))
            os.close(fd)
            return
        except FileExistsError:
            if time.time() - LOCK.stat().st_mtime > 900:
                LOCK.unlink()
                continue
            if time.time() - started > 120:
                raise TimeoutError("timed out waiting for quality-remediation claim lock")
            time.sleep(0.2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lane", required=True, help="unique lane label, for example 17")
    parser.add_argument("--count", type=int, default=100)
    args = parser.parse_args()
    if args.count <= 0:
        raise SystemExit("--count must be positive")

    acquire()
    try:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        claimed_ids, claimed_typed = collect_claims()
        selected: list[dict[str, Any]] = []
        seen_ids: set[str] = set()
        seen_typed: set[str] = set()
        for candidate in audit.get("remediation_queue", []):
            row = dict(candidate)
            row["subject_id"] = row.get("subject_id") or identity(row)
            row_id = identity(row)
            row_typed = typed(row)
            if row_id in claimed_ids or row_id in seen_ids:
                continue
            if row_typed in claimed_typed or row_typed in seen_typed or row_typed == "|":
                continue
            selected.append(row)
            seen_ids.add(row_id)
            seen_typed.add(row_typed)
            if len(selected) >= args.count:
                break

        tag = f"quality_remediation_lane_{args.lane}_20260922"
        selection_path = AUDIT_DIR / f"{tag}_selection.json"
        checkpoint_path = AUDIT_DIR / f"{tag}_pre_search_checkpoint.json"
        source_hash = hashlib.sha256(AUDIT.read_bytes()).hexdigest()
        selection = {
            "schema": "2026-09-22.external-item-quality-remediation-selection.v2",
            "batch": tag,
            "selected_at": date.today().isoformat(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "source_sha256": source_hash,
            "selection_method": "atomic shared lock; exclude all prior valid claims by contextual and typed identity",
            "prior_claimed_contextual_ids": len(claimed_ids),
            "prior_claimed_typed_items": len(claimed_typed),
            "selection_count": len(selected),
            "requested_count": args.count,
            "shortfall": max(0, args.count - len(selected)),
            "rows": selected,
            "policy": {
                "review_required_preserved_unless_exact_item_evidence_established": True,
                "no_relationship_inference": True,
                "no_promotion": True,
            },
        }
        checkpoint = {
            "schema": "2026-09-22.external-item-quality-remediation-checkpoint.v2",
            "batch": tag,
            "status": "selected_pre_search",
            "selection": selection_path.relative_to(ROOT).as_posix(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "selection_count": len(selected),
            "searched_count": 0,
            "promotion_performed": False,
            "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        }
        selection_path.write_text(json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"batch": tag, "selection": str(selection_path), "checkpoint": str(checkpoint_path), "selected": len(selected), "shortfall": selection["shortfall"]}))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
