"""Reconcile the append-only external-enrichment lanes without changing data.

The original quality audit predates the residual lanes.  This report joins the
current item and relationship append-only ledgers to their canonical queues so
progress is measured from the latest saved records, not from the stale audit
summary.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
OUT_JSON = AUDIT / "CURRENT_EXTERNAL_ENRICHMENT_RECONCILIATION_2026-09-23.json"
OUT_MD = AUDIT / "CURRENT_EXTERNAL_ENRICHMENT_RECONCILIATION_2026-09-23.md"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8-sig").splitlines()
        if line.strip()
    ]


def item_key(row: dict[str, Any]) -> str:
    nested = row.get("item") if isinstance(row.get("item"), dict) else {}
    return "|".join(
        str(row.get(field) or nested.get(field) or "").strip().casefold()
        for field in ("item_type", "item_key")
    )


def relationship_key(row: dict[str, Any]) -> str:
    return "|".join(
        str(row.get(field) or "").strip().casefold()
        for field in (
            "context_level",
            "context_key",
            "from_item_type",
            "from_item_key",
            "to_item_type",
            "to_item_key",
            "relationship_type",
        )
    )


def main() -> None:
    item_audit = read_json(AUDIT / "item_ledger_quality_audit_2026-09-22.json")
    item_queue = {item_key(row) for row in item_audit["remediation_queue"]}
    item_rows = [
        row
        for path in sorted(AUDIT.glob("quality_remediation_lane*20260922_append_only_ledger.jsonl"))
        for row in read_jsonl(path)
    ]
    item_processed = {item_key(row) for row in item_rows}

    relationship_inventory = read_json(Path(ROOT / "data/career-mapping/_audit/relationship_backlog_inventory.json"))
    relationship_queue = {relationship_key(row) for row in relationship_inventory["rows"]}
    relationship_rows = [
        row
        for path in sorted(AUDIT.glob("relationship_quality_lane_*_append_only_ledger.jsonl"))
        for row in read_jsonl(path)
    ]
    targeted_path = AUDIT / "relationship_quality_missing_canonical_20260923_append_only_ledger.jsonl"
    if targeted_path.exists():
        relationship_rows.extend(read_jsonl(targeted_path))
    relationship_processed = {relationship_key(row) for row in relationship_rows}

    payload = {
        "schema": "2026-09-23.current-external-enrichment-reconciliation.v1",
        "item_population": {
            "distinct_typed_items": int(item_audit["scope"]["distinct_typed_items"]),
            "flagged_remediation_keys": len(item_queue),
            "append_only_rows": len(item_rows),
            "processed_flagged_keys": len(item_processed & item_queue),
            "remaining_flagged_keys": len(item_queue - item_processed),
            "decision_counts": dict(Counter(str(row.get("decision") or "unknown") for row in item_rows)),
        },
        "relationship_population": {
            "canonical_unresolved_ids": len(relationship_queue),
            "append_only_rows": len(relationship_rows),
            "covered_canonical_ids": len(relationship_processed & relationship_queue),
            "remaining_canonical_ids": len(relationship_queue - relationship_processed),
            "decision_counts": dict(Counter(str(row.get("decision") or row.get("relationship_status") or "unknown") for row in relationship_rows)),
        },
        "policy": {
            "append_only": True,
            "no_catalogue_or_sql_writes": True,
            "unresolved_relationships_not_promoted": True,
        },
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(
        "# Current external-enrichment reconciliation — 2026-09-23\n\n"
        f"- Full distinct item population: **{payload['item_population']['distinct_typed_items']:,}**.\n"
        f"- Flagged remediation keys: **{payload['item_population']['flagged_remediation_keys']:,}**; remaining: **{payload['item_population']['remaining_flagged_keys']:,}**.\n"
        f"- Canonical unresolved relationship IDs: **{payload['relationship_population']['canonical_unresolved_ids']:,}**; remaining uncovered: **{payload['relationship_population']['remaining_canonical_ids']:,}**.\n\n"
        "These are append-only evidence/review ledgers. They do not prove live SQL deployment and do not promote unresolved relationships to student guidance.\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
