"""Select the next disjoint full-population enrichment tranche.

This is a read-only selector over the intact contextual SQL transport.  It
does not modify generated seeds or application data.  The resulting selection
is deliberately saved beside the tranche-002 ledger/checkpoint so the next
pass can be reproduced after an interruption.
"""

from __future__ import annotations

import collections
import gzip
import json
import re
import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
DEFAULT_TRANCHE = 2
DATE = "2026-09-21"

ITEM_PREFIX = re.compile(
    r"\((?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)',|NULL,)"
)
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
    r"(?:'((?:''|[^'])*)',|NULL,)"
)


def clean(value: str | None) -> str:
    return (value or "").replace("''", "'")


def item_row_id(level: str, context: str, item_type: str, item_key: str) -> str:
    return f"item|{level}|{context}|{item_type}|{item_key}"


def relationship_row_id(
    level: str, context: str, from_type: str, from_key: str, to_key: str
) -> str:
    return f"relationship|{level}|{context}|{from_type}|{from_key}|{to_key or 'missing'}"


def load_prior_ids(ledger_paths: list[Path]) -> tuple[set[str], set[tuple[str, str]]]:
    ids: set[str] = set()
    item_identities: set[tuple[str, str]] = set()
    for ledger_path in ledger_paths:
        if not ledger_path.exists():
            continue
        for raw in ledger_path.read_text(encoding="utf-8").splitlines():
            record = json.loads(raw)
            ids.add(record["row_id"])
            if record.get("record_type") == "item":
                item_identities.add(
                    (record["item_type"], record["item_name"].casefold())
                )
    return ids, item_identities


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tranche", type=int, default=DEFAULT_TRANCHE)
    parser.add_argument("--prior-ledger", action="append", default=[])
    args = parser.parse_args()
    tranche = args.tranche
    prior_ledgers = [
        OUT_DIR / f"full_population_tranche_{number:03d}_search_ledger_{DATE}.jsonl"
        for number in range(1, tranche)
    ]
    prior_ledgers.extend(Path(path) for path in args.prior_ledger)
    # Preserve order while allowing an explicit path to overlap a default.
    prior_ledgers = list(dict.fromkeys(prior_ledgers))
    out = OUT_DIR / f"full_population_tranche_{tranche:03d}_selection_{DATE}.json"
    checkpoint = OUT_DIR / f"full_population_tranche_{tranche:03d}_checkpoint_{DATE}.json"
    checkpoint_md = OUT_DIR / f"full_population_tranche_{tranche:03d}_checkpoint_{DATE}.md"
    prior_ids, prior_item_identities = load_prior_ids(prior_ledgers)
    item_counts: collections.Counter[tuple[str, str]] = collections.Counter()
    item_examples: dict[tuple[str, str], dict[str, str]] = {}
    unresolved: list[dict[str, str]] = []

    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        item_sql, _, relationship_sql = text.partition(
            "INSERT INTO skillup_dev.career_item_relationships"
        )
        for match in ITEM_PREFIX.finditer(item_sql):
            level, context, domain, item_type, item_key, name = (
                clean(value) for value in match.groups()
            )
            if context == "D078" or context.startswith("D078|"):
                continue
            row_id = item_row_id(level, context, item_type, item_key)
            identity = (item_type, name.casefold())
            if row_id in prior_ids:
                continue
            item_counts[identity] += 1
            item_examples.setdefault(
                identity,
                {
                    "record_type": "item",
                    "row_id": row_id,
                    "context_level": level,
                    "context_key": context,
                    "domain_key": domain,
                    "item_type": item_type,
                    "item_key": item_key,
                    "item_name": name,
                },
            )
        if not relationship_sql:
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
            row_id = relationship_row_id(level, context, from_type, from_key, to_key)
            if row_id in prior_ids:
                continue
            unresolved.append(
                {
                    "record_type": "relationship",
                    "row_id": row_id,
                    "context_level": level,
                    "context_key": context,
                    "domain_key": domain,
                    "from_item_type": from_type,
                    "from_item_key": from_key,
                    "from_name": from_name,
                    "to_item_type": to_type,
                    "to_item_key": to_key,
                    "to_name": to_name,
                    "relationship_type": relationship_type,
                    "relationship_status": status,
                    "transport_part": part.name,
                }
            )

    ranked_items = []
    for identity, frequency in item_counts.most_common():
        if identity in prior_item_identities:
            continue
        row = dict(item_examples[identity])
        row["frequency_in_non_d078_catalogue"] = frequency
        ranked_items.append(row)
        if len(ranked_items) == 28:
            break

    selected_relationships = []
    seen_relationship_ids: set[str] = set()
    for row in unresolved:
        if row["row_id"] in seen_relationship_ids:
            continue
        selected_relationships.append(row)
        seen_relationship_ids.add(row["row_id"])
        if len(selected_relationships) == 4:
            break

    selection = {
        "schema": "2026-09-21.full-population-enrichment-tranche-selection.v1",
        "accessed_on": "2026-09-21",
        "excluded_context_prefix": "D078",
        "disjoint_from": ["full_population_tranche_001_search_ledger_2026-09-21.jsonl"],
        "policy": {
            "item_rows_are_unique_contextual_rows": True,
            "relationship_endpoints_must_not_be_inferred": True,
            "no_link_requires_an_actual_search": True,
        },
        "items": ranked_items,
        "relationships": selected_relationships,
        "counts": {
            "selected_rows": len(ranked_items) + len(selected_relationships),
            "item_rows": len(ranked_items),
            "relationship_rows": len(selected_relationships),
            "prior_ids_excluded": len(prior_ids),
            "non_d078_unresolved_candidates_seen": len(unresolved),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    selection["disjoint_from"] = [path.name for path in prior_ledgers if path.exists()]
    out.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint_record = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v2",
        "accessed_on": DATE,
        "status": "selected_before_search",
        "selection": str(out.relative_to(ROOT)).replace("\\", "/"),
        "scope": selection["counts"],
        "checkpoint_counts": {
            "rows_selected": selection["counts"]["selected_rows"],
            "rows_searched": 0,
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "no_link": 0,
            "remaining_selected_rows": selection["counts"]["selected_rows"],
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
    checkpoint.write_text(json.dumps(checkpoint_record, indent=2) + "\n", encoding="utf-8")
    checkpoint_md.write_text(
        f"# Full-population external enrichment — tranche {tranche:03d} checkpoint\n\n"
        "Selection is saved before web searching so the work is resumable.\n\n"
        f"- Selected rows: **{selection['counts']['selected_rows']}**\n"
        f"- Item rows: **{selection['counts']['item_rows']}**\n"
        f"- Unresolved relationship rows: **{selection['counts']['relationship_rows']}**\n"
        f"- Excluded: D078 and every row ID recorded in {len([p for p in prior_ledgers if p.exists()])} prior ledger(s).\n"
        "- Search status: not started at selection checkpoint.\n"
        "- SQL, generated seed transport, UI and browser-proof files: untouched.\n",
        encoding="utf-8",
    )
    print(json.dumps(selection["counts"], indent=2))
    for row in ranked_items:
        print("ITEM", row["frequency_in_non_d078_catalogue"], row["context_key"], row["item_name"])
    for row in selected_relationships:
        print("REL", row["context_key"], row["from_name"], "-> missing target")


if __name__ == "__main__":
    main()
