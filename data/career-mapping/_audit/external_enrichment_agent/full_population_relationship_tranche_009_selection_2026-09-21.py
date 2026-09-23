"""Select the next small, disjoint relationship-enrichment tranche.

This is a read-only selection pass. It saves the selection checkpoint before
any external search is performed and never fills missing endpoints or edge
types.
"""

from __future__ import annotations

import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
OUTPUT = OUT_DIR / "full_population_relationship_tranche_009_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_009_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_009_checkpoint_2026-09-21.md"
ACCESS_DATE = "2026-09-21"
LIMIT = 4


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
    for path in (OUTPUT, CHECKPOINT, CHECKPOINT_MD):
        if path.exists():
            raise SystemExit(f"Refusing to overwrite existing tranche-009 file: {path}")

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
        and str(row.get("data_state") or "").casefold()
        in {"not_established", "review_only", "unresolved"}
        and not str(row.get("context_key") or "").startswith("D078")
        and signature(row) not in prior_signatures
    ]
    unresolved.sort(key=sort_key)
    selected = unresolved[:LIMIT]
    relationships = [
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
        for row in selected
    ]

    output = {
        "schema": "2026-09-21.full-population-relationship-tranche-selection.v1",
        "accessed_on": ACCESS_DATE,
        "excluded_context_prefix": "D078",
        "disjoint_from": [path.name for path in prior_files],
        "selection_basis": "next unresolved non-D078 relationship rows in deterministic catalogue order after all prior relationship ledgers were excluded",
        "policy": {
            "relationship_endpoints_must_not_be_inferred": True,
            "candidate_relationship_type_is_not_established_until_source_proven": True,
            "selection_checkpoint_precedes_external_search": True,
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

    checkpoint = {
        "schema": "2026-09-21.full-population-relationship-tranche-checkpoint.v1",
        "accessed_on": ACCESS_DATE,
        "status": "selection_saved_search_not_started",
        "blocked": False,
        "selection": str(OUTPUT.relative_to(ROOT)).replace("\\", "/"),
        "scope": {
            "prior_relationship_search_records": len(prior_signatures),
            "current_tranche_rows_selected": len(relationships),
            "current_tranche_rows_searched": 0,
            "current_tranche_linked": 0,
            "current_tranche_review_required": 0,
            "current_tranche_genuinely_unavailable": 0,
            "current_tranche_remaining_selected_rows": len(relationships),
            "catalogue_unresolved_non_d078_before_selection": len(unresolved),
            "catalogue_unresolved_non_d078_after_selection": len(unresolved) - len(relationships),
        },
        "guardrails": {
            "sql_touched": False,
            "generated_seed_transport_touched": False,
            "catalogue_touched": False,
            "app_code_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
        },
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 009 selection checkpoint\n\n"
        f"Date: {ACCESS_DATE}\n\n"
        f"Selection saved for **{len(relationships)}** non-overlapping unresolved relationship rows. "
        "External search has not started. Endpoints and typed relationship candidates remain null until exact authoritative source evidence is found.\n\n"
        "Guardrails: no SQL, catalogue, seed transport, app code, UI or browser-proof files were changed.\n",
        encoding="utf-8",
    )
    print(json.dumps({"selected": len(relationships), "pending_after_selection": len(unresolved) - len(relationships), "checkpoint": CHECKPOINT.as_posix()}))


if __name__ == "__main__":
    main()
