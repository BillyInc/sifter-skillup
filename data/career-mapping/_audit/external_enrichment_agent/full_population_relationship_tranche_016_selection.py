"""Select the next deterministic relationship tranche without touching seeds."""

from __future__ import annotations

import gzip
import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
STAMP = "2026-09-21"
MAX_ROWS = 100

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


def normalize_row_id(value: object) -> str:
    row_id = str(value or "").strip()
    if row_id.startswith("relationship|"):
        row_id = row_id[len("relationship|") :]
    # Historical ledgers used these terminal labels for the same null-target
    # catalogue identity that is now represented by not_established.
    for alias in ("missing", "unresolved", "review_only", "review-required"):
        suffix = f"|{alias}"
        if row_id.endswith(suffix):
            row_id = f"{row_id[:-len(suffix)]}|not_established"
            break
    return row_id


def historical_ids() -> tuple[set[str], list[str]]:
    seen: set[str] = set()
    files: list[str] = []
    for path in sorted(LEDGER_DIR.glob("*_relationship*_search_ledger_*.jsonl")):
        files.append(path.name)
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            raw = record.get("row_id") or record.get("candidate_id")
            if raw:
                seen.add(normalize_row_id(raw))
    return seen, files


def candidates() -> tuple[list[dict[str, str]], set[str], list[str]]:
    seen, files = historical_ids()
    rows: list[dict[str, str]] = []
    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        if "INSERT INTO skillup_dev.career_item_relationships" not in text:
            continue
        relationship_sql = text.split(
            "INSERT INTO skillup_dev.career_item_relationships", 1
        )[1]
        for match in PREFIX.finditer(relationship_sql):
            values = [clean(value) for value in match.groups()]
            (
                context_level,
                context_key,
                domain_key,
                from_type,
                from_key,
                from_name,
                to_type,
                to_key,
                to_name,
                relationship_type,
                status,
            ) = values
            if status not in {"not_established", "review_required", "unresolved", "review_only"}:
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
            normalized = normalize_row_id(candidate_id)
            if normalized in seen:
                continue
            rows.append(
                {
                    "candidate_id": candidate_id,
                    "normalized_candidate_id": normalized,
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
                }
            )
            if len(rows) == MAX_ROWS:
                return rows, seen, files
    return rows, seen, files


def main() -> None:
    rows, seen, files = candidates()
    selection = {
        "record_type": "relationship_selection",
        "tranche": "016",
        "date": STAMP,
        "scope": "next deterministic pending unresolved relationship rows",
        "filters": {
            "exclude_context_keys": ["D078", "D078|*"],
            "allowed_source_statuses": [
                "not_established",
                "review_required",
                "unresolved",
                "review_only",
            ],
            "max_rows": MAX_ROWS,
        },
        "normalization": {
            "prefix_removed": "relationship|",
            "terminal_aliases_to_not_established": [
                "missing",
                "unresolved",
                "review_only",
                "review-required",
            ],
            "historical_ledger_files": files,
            "historical_normalized_id_count": len(seen),
        },
        "selection_count": len(rows),
        "overlap_count_after_normalization": 0,
        "rows": rows,
    }
    selection_path = LEDGER_DIR / f"full_population_relationship_tranche_016_selection_{STAMP}.json"
    checkpoint_json = LEDGER_DIR / f"full_population_relationship_tranche_016_checkpoint_{STAMP}.json"
    checkpoint_md = LEDGER_DIR / f"full_population_relationship_tranche_016_checkpoint_{STAMP}.md"
    selection_path.write_text(json.dumps(selection, indent=2) + "\n", encoding="utf-8")
    checkpoint = {
        "record_type": "relationship_pre_search_checkpoint",
        "tranche": "016",
        "date": STAMP,
        "selection_file": selection_path.name,
        "selected_count": len(rows),
        "searched_count": 0,
        "linked_count": 0,
        "review_required_count": 0,
        "unavailable_count": 0,
        "promoted_count": 0,
        "overlap_count_after_normalization": 0,
        "d078_rows": 0,
        "endpoint_policy": "retain null endpoints unless both typed endpoints and canonical builds_on/works_with are explicitly sourced",
        "write_policy": "append-only relationship artifacts; no item rows, SQL, seeds, UI or browser proof",
        "historical_normalized_id_count": len(seen),
        "historical_ledger_files": files,
    }
    checkpoint_json.write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")
    checkpoint_md.write_text(
        "# Full-population relationship tranche 016 pre-search checkpoint\n\n"
        f"Date: {STAMP}\n\n"
        f"Selected exactly **{len(rows)}** next deterministic pending non-D078 relationship rows.\n\n"
        "Before any search, historical relationship ledger row IDs were normalized by "
        "removing the `relationship|` prefix and mapping historical null-target aliases "
        "(`missing`, `unresolved`, `review_only`, `review-required`) to `not_established`. "
        f"The normalized prior set contained **{len(seen)}** IDs; selected overlap is **0** and D078 rows are **0**.\n\n"
        "Search policy: retain null endpoints. Promote a row only when authoritative "
        "HTTPS evidence explicitly names both typed endpoints and a canonical "
        "`builds_on` or `works_with` edge. Otherwise record `review_required` with "
        "`not_established` and preserve the null target.\n\n"
        "This checkpoint was written before searching. Only relationship selection, "
        "checkpoint, ledger and report artifacts belong to this tranche; item ledgers, "
        "SQL, seeds, UI and browser proof are out of scope.\n",
        encoding="utf-8",
    )
    print(json.dumps({"selection": selection_path.name, "checkpoint": checkpoint_json.name, "rows": len(rows), "prior_ids": len(seen), "prior_files": len(files)}))


if __name__ == "__main__":
    main()
