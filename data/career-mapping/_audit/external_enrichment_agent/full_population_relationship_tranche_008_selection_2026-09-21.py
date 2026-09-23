"""Select the next disjoint relationship-enrichment tranche.

This is a read-only selection pass over the validated catalogue.  It never
fills endpoints or relation types and refuses to overwrite an existing
tranche-008 selection.
"""

from __future__ import annotations

import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
OUTPUT = OUT_DIR / "full_population_relationship_tranche_008_selection_2026-09-21.json"
ACCESS_DATE = "2026-09-21"
LIMIT = 8


def signature(row: dict[str, object]) -> str:
    return "|".join(
        str(row.get(key) or "")
        for key in (
            "context_level",
            "context_key",
            "from_item_type",
            "from_item_key",
            "to_item_type",
            "to_item_key",
            "relationship_type",
        )
    )


def sort_key(row: dict[str, object]) -> tuple[str, ...]:
    return tuple(
        str(row.get(key) or "").casefold()
        for key in (
            "context_level",
            "context_key",
            "from_item_key",
            "from_name",
            "to_item_key",
            "to_name",
            "relationship_type",
            "data_state",
        )
    )


def row_id(row: dict[str, object]) -> str:
    return "|".join(
        [
            "relationship",
            str(row.get("context_level") or ""),
            str(row.get("context_key") or ""),
            str(row.get("from_item_type") or ""),
            str(row.get("from_item_key") or ""),
            str(row.get("to_item_type") or ""),
            str(row.get("to_item_key") or ""),
            str(row.get("relationship_type") or "missing"),
        ]
    )


def main() -> None:
    if OUTPUT.exists():
        raise SystemExit(f"Refusing to overwrite existing selection: {OUTPUT}")

    prior_files = sorted(
        OUT_DIR.glob("full_population_relationship_tranche_*_search_ledger_2026-09-21.jsonl")
    )
    prior_signatures: set[str] = set()
    for path in prior_files:
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                prior_signatures.add(signature(json.loads(line)))

    with gzip.open(CATALOGUE, "rt", encoding="utf-8") as stream:
        payload = json.load(stream)
    unresolved = [
        row
        for row in payload.get("relationships", [])
        if isinstance(row, dict)
        and (
            str(row.get("data_state") or "").casefold()
            in {"not_established", "review_only", "unresolved"}
            or str(row.get("relationship_type") or "").casefold()
            in {"not_established", "unresolved"}
        )
        and not str(row.get("context_key") or "").startswith("D078")
        and signature(row) not in prior_signatures
    ]
    unresolved.sort(key=sort_key)
    selected = unresolved[:LIMIT]

    relationships: list[dict[str, object]] = []
    for row in selected:
        relationships.append(
            {
                "record_type": "relationship",
                "row_id": row_id(row),
                "context_level": row.get("context_level"),
                "context_key": row.get("context_key"),
                "domain_key": row.get("domain_key"),
                "from_item_type": row.get("from_item_type"),
                "from_item_key": row.get("from_item_key"),
                "from_name": row.get("from_name"),
                "to_item_type": row.get("to_item_type"),
                "to_item_key": row.get("to_item_key"),
                "to_name": row.get("to_name"),
                "relationship_type": row.get("relationship_type") or "not_established",
                "candidate_relationship_type": None,
                "relationship_status": row.get("data_state") or "not_established",
                "transport_part": row.get("transport_part"),
            }
        )

    output = {
        "schema": "2026-09-21.full-population-relationship-tranche-selection.v1",
        "accessed_on": ACCESS_DATE,
        "excluded_context_prefix": "D078",
        "disjoint_from": [path.name for path in prior_files],
        "selection_basis": "unresolved relationship rows in deterministic transport order after all prior relationship ledgers were excluded; target and typed relation remain unresolved until authoritative evidence names both endpoints",
        "policy": {
            "relationship_endpoints_must_not_be_inferred": True,
            "candidate_relationship_type_is_not_established_until_source_proven": True,
            "no_link_or_genuinely_unavailable_requires_actual_search": True,
        },
        "counts": {
            "catalogue_unresolved_non_d078": len(unresolved),
            "prior_relationship_ledger_files": len(prior_files),
            "prior_relationship_signatures": len(prior_signatures),
            "selected_rows": len(relationships),
        },
        "relationships": relationships,
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"selected": len(relationships), "pending_after_selection": len(unresolved) - len(relationships), "output": OUTPUT.as_posix()}))


if __name__ == "__main__":
    main()
