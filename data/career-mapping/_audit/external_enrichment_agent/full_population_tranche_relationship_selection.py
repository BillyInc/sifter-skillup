"""Read-only selector for unresolved relationship rows outside D078."""

from __future__ import annotations

import gzip
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
PREFIX = re.compile(
    r"\((?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),"
)


def clean(value: str | None) -> str:
    return (value or "").replace("''", "'")


def prior_relationship_ids() -> set[str]:
    """Normalize both historical relationship row-id shapes before selecting."""
    seen: set[str] = set()
    for path in LEDGER_DIR.glob("*_relationship*_search_ledger_*.jsonl"):
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            row_id = str(record.get("row_id") or record.get("candidate_id") or "")
            if row_id.startswith("relationship|"):
                row_id = row_id[len("relationship|"):]
            if row_id:
                seen.add(row_id)
                # Historical ledgers used `missing`/`unresolved` for the same
                # null-target catalogue state that is now keyed as
                # `not_established`. Treat those aliases as the same identity
                # so a later tranche cannot re-search an already reviewed row.
                for alias in ("missing", "unresolved", "review_only"):
                    suffix = f"|{alias}"
                    if row_id.endswith(suffix):
                        seen.add(f"{row_id[:-len(suffix)]}|not_established")
    return seen


def main() -> None:
    rows = []
    seen = prior_relationship_ids()
    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        if "INSERT INTO skillup_dev.career_item_relationships" not in text:
            continue
        relationship_sql = text.split("INSERT INTO skillup_dev.career_item_relationships", 1)[1]
        for match in PREFIX.finditer(relationship_sql):
            values = [clean(value) for value in match.groups()]
            context_level, context_key, domain_key, from_type, from_key, from_name, to_type, to_key, to_name, relationship_type, status = values
            if not (status in {"not_established", "review_required", "unresolved", "review_only"}):
                continue
            if context_key == "D078" or context_key.startswith("D078|"):
                continue
            candidate_id = "|".join(
                [
                    context_level,
                    context_key,
                    from_type,
                    from_key,
                    to_type,
                    to_key,
                    relationship_type,
                ]
            )
            if candidate_id in seen:
                continue
            rows.append({
                "candidate_id": candidate_id,
                "part": part.name,
                "context_level": context_level,
                "context_key": context_key,
                "domain_key": domain_key,
                "from_item_type": from_type,
                "from_item_key": from_key,
                "from_name": from_name,
                "to_item_type": to_type,
                "to_item_key": to_key,
                "to_name": to_name,
                "relationship_type": relationship_type,
                "relationship_status": status,
            })
            if len(rows) >= 30:
                print(rows)
                return
    print(rows)


if __name__ == "__main__":
    main()
