"""Select a disjoint relationship-only enrichment tranche.

The selector reads the intact contextual SQL transport and writes only audit
selection/checkpoint artifacts.  It prioritizes unresolved rows whose target
name is retained in the candidate key, because those rows permit a real
two-endpoint search without inventing a target identity.
"""

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
]
OUT = OUT_DIR / "full_population_relationship_tranche_003_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_003_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_003_checkpoint_2026-09-21.md"

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


def row_id(level: str, context: str, from_type: str, from_key: str, to_key: str) -> str:
    return f"relationship|{level}|{context}|{from_type}|{from_key}|{to_key or 'missing'}"


def prior_ids() -> set[str]:
    result: set[str] = set()
    for ledger in LEDGERS:
        if not ledger.exists():
            continue
        for line in ledger.read_text(encoding="utf-8").splitlines():
            if line.strip():
                result.add(json.loads(line)["row_id"])
    return result


def main() -> None:
    excluded = prior_ids()
    candidates: list[dict[str, str | None]] = []
    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        _, separator, relationship_sql = text.partition(
            "INSERT INTO skillup_dev.career_item_relationships"
        )
        if not separator:
            continue
        for match in REL_PREFIX.finditer(relationship_sql):
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
            candidate_id = row_id(level, context, from_type, from_key, to_key)
            if candidate_id in excluded:
                continue
            # Prefer rows retaining the target display name and a typed
            # candidate relation in the unresolved target key.
            target_known = bool(to_name and to_key.startswith("unresolved-"))
            if not target_known:
                continue
            relation_match = re.match(r"unresolved-(works_with|builds_on)-(.+)$", to_key)
            candidate_relation = relation_match.group(1) if relation_match else None
            candidates.append(
                {
                    "record_type": "relationship",
                    "row_id": candidate_id,
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
                    "candidate_relationship_type": candidate_relation,
                    "relationship_status": status,
                    "transport_part": part.name,
                }
            )

    # Stable transport order and no duplicate candidate identity.
    selected: list[dict[str, str | None]] = []
    seen: set[str] = set()
    for candidate in candidates:
        if candidate["row_id"] in seen:
            continue
        selected.append(candidate)
        seen.add(candidate["row_id"])

    selection = {
        "schema": "2026-09-21.full-population-relationship-tranche-selection.v1",
        "accessed_on": "2026-09-21",
        "excluded_context_prefix": "D078",
        "disjoint_from": [ledger.name for ledger in LEDGERS],
        "selection_basis": "unresolved relationship rows retaining a target name and candidate typed relation in the unresolved target key",
        "policy": {
            "relationship_endpoints_must_not_be_inferred": True,
            "candidate_relationship_type_is_not_established_until_source_proven": True,
            "no_link_or_genuinely_unavailable_requires_actual_search": True,
        },
        "relationships": selected,
        "counts": {
            "selected_rows": len(selected),
            "prior_ids_excluded": len(excluded),
            "unresolved_non_d078_candidates_seen": len(candidates),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema": "2026-09-21.full-population-relationship-tranche-checkpoint.v1",
        "accessed_on": "2026-09-21",
        "status": "selected_before_search",
        "selection": str(OUT.relative_to(ROOT)).replace("\\", "/"),
        "scope": selection["counts"],
        "checkpoint_counts": {
            "rows_selected": len(selected),
            "rows_searched": 0,
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "remaining_selected_rows": len(selected),
        },
        "guardrails": {
            "d078_rows": 0,
            "prior_tranche_overlap": 0,
            "sql_touched": False,
            "generated_seed_transport_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
        },
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 003 checkpoint\n\n"
        "Selection is saved before web searching so the work is resumable.\n\n"
        f"- Selected unresolved relationship rows: **{len(selected)}**\n"
        "- Target names are retained by the local candidate key, but target item types remain unresolved.\n"
        "- Excluded: D078 and every row ID recorded in tranches 001 and 002.\n"
        "- Search status: not started at selection checkpoint.\n"
        "- SQL, generated seed transport, UI and browser-proof files: untouched.\n",
        encoding="utf-8",
    )
    print(json.dumps(selection["counts"], indent=2))
    for candidate in selected:
        print(candidate["row_id"], candidate["candidate_relationship_type"])


if __name__ == "__main__":
    main()
