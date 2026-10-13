"""Select the next disjoint full-population relationship search tranche."""

from __future__ import annotations

import gzip
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
LEDGERS = [
    OUT_DIR / "full_population_tranche_001_search_ledger_2026-09-21.jsonl",
    OUT_DIR / "full_population_tranche_002_search_ledger_2026-09-21.jsonl",
    OUT_DIR / "full_population_relationship_tranche_003_search_ledger_2026-09-21.jsonl",
    OUT_DIR / "full_population_relationship_tranche_004_search_ledger_2026-09-21.jsonl",
]
OUT = OUT_DIR / "full_population_relationship_tranche_005_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_005_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_005_checkpoint_2026-09-21.md"
LIMIT = 8

REL_PREFIX = re.compile(
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


def prior_ids() -> set[str]:
    result: set[str] = set()
    for ledger in LEDGERS:
        if ledger.exists():
            result.update(
                json.loads(line)["row_id"]
                for line in ledger.read_text(encoding="utf-8").splitlines()
                if line.strip()
            )
    return result


def main() -> None:
    excluded = prior_ids()
    candidates: list[dict[str, str | None]] = []
    seen: set[str] = set()
    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        separator = "INSERT INTO skillup_dev.career_item_relationships"
        if separator not in text:
            continue
        for match in REL_PREFIX.finditer(text.split(separator, 1)[1]):
            values = [clean(value) for value in match.groups()]
            (
                level,
                context,
                domain,
                from_type,
                from_key,
                from_name,
                to_type,
                to_key,
                to_name,
                relationship_type,
                status,
            ) = values
            if context == "D078" or context.startswith("D078|"):
                continue
            if status not in {"not_established", "review_required", "unresolved", "review_only"}:
                continue
            row_id = f"relationship|{level}|{context}|{from_type}|{from_key}|{to_key or 'missing'}"
            if row_id in excluded or row_id in seen:
                continue
            candidates.append(
                {
                    "record_type": "relationship",
                    "row_id": row_id,
                    "context_level": level,
                    "context_key": context,
                    "domain_key": domain,
                    "from_item_type": from_type,
                    "from_item_key": from_key,
                    "from_name": from_name,
                    "to_item_type": to_type or None,
                    "to_item_key": to_key,
                    "to_name": to_name,
                    "relationship_type": relationship_type,
                    "candidate_relationship_type": None,
                    "relationship_status": status,
                    "transport_part": part.name,
                }
            )
            seen.add(row_id)
            if len(candidates) >= LIMIT:
                break
        if len(candidates) >= LIMIT:
            break

    selection = {
        "schema": "2026-09-21.full-population-relationship-tranche-selection.v1",
        "accessed_on": "2026-09-21",
        "excluded_context_prefix": "D078",
        "disjoint_from": [ledger.name for ledger in LEDGERS],
        "selection_basis": "unresolved relationship rows in deterministic transport order after target fields were confirmed null; target and typed relation remain unresolved until authoritative evidence names both endpoints",
        "policy": {
            "relationship_endpoints_must_not_be_inferred": True,
            "candidate_relationship_type_is_not_established_until_source_proven": True,
            "no_link_or_genuinely_unavailable_requires_actual_search": True,
        },
        "relationships": candidates,
        "counts": {
            "selected_rows": len(candidates),
            "prior_ids_excluded": len(excluded),
            "unresolved_non_d078_candidates_seen_before_limit": len(candidates),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema": "2026-09-21.full-population-relationship-tranche-checkpoint.v1",
        "accessed_on": "2026-09-21",
        "status": "selected_before_search",
        "selection": str(OUT.relative_to(ROOT)).replace("\\", "/"),
        "scope": {
            "prior_relationship_search_records": 20,
            "prior_relationship_search_linked": 0,
            "prior_relationship_search_review_required": 20,
            "prior_relationship_search_genuinely_unavailable": 0,
            "current_tranche_rows_selected": len(candidates),
            "current_tranche_rows_searched": 0,
            "current_tranche_linked": 0,
            "current_tranche_review_required": 0,
            "current_tranche_genuinely_unavailable": 0,
            "current_tranche_remaining_selected_rows": len(candidates),
        },
        "guardrails": {
            "d078_rows": 0,
            "prior_tranche_overlap": 0,
            "sql_touched": False,
            "generated_seed_transport_touched": False,
            "catalogue_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
        },
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 005 checkpoint\n\n"
        "Selection is saved before web searching so the work is resumable.\n\n"
        f"- Prior relationship search records: **20**.\n"
        f"- Current tranche selected rows: **{len(candidates)}**.\n"
        "- Current tranche searched rows: **0**.\n"
        "- Current tranche results: **0 linked**, **0 review_required**, **0 genuinely_unavailable**.\n"
        "- D078 rows selected: **0**; prior-tranche overlap: **0**.\n"
        "- SQL, generated seed transport, catalogue, UI and browser-proof files: **untouched**.\n",
        encoding="utf-8",
    )
    print(json.dumps(selection["counts"], indent=2))
    for candidate in candidates:
        print(candidate["row_id"], candidate["candidate_relationship_type"])


if __name__ == "__main__":
    main()
