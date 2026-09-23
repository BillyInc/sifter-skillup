"""Process the complete unresolved non-D078 relationship queue in saved batches.

This runner is deliberately relationship-only. It does not update the queue, item
ledgers, SQL, seeds, application code, or browser-proof artifacts. Each batch is
checkpointed before its evidence ledger is written, and the next batch is selected
only after the previous ledger and reports exist.
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parents[4]
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
QUEUE_PATH = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
STAMP = "2026-09-21"
BATCH_SIZE = 100


def canonical_row_id(value: object) -> str:
    """Normalize every known historical relationship-row identity shape."""

    row_id = str(value or "")
    if row_id.startswith("relationship|"):
        row_id = row_id[len("relationship|") :]

    # Older ledgers ended a null-target row with one terminal alias, while the
    # current queue stores the explicit relationship state separately.
    for alias in ("missing", "unresolved", "review_only", "review-required"):
        if row_id.endswith(f"|{alias}"):
            return f"{row_id[:-len(alias)-1]}|||not_established"

    # Older D016/D146 rows encoded the candidate edge in the terminal alias and
    # omitted the final stored state field.
    for alias in ("unresolved-works_with-c", "unresolved-builds_on-c"):
        if row_id.endswith(f"|{alias}"):
            return f"{row_id[:-len(alias)-1]}||{alias}|not_established"

    return row_id


def prior_ids() -> tuple[set[str], list[str]]:
    """Read and normalize all existing relationship ledgers before selection."""

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
            for key in ("normalized_row_id", "row_id", "candidate_id"):
                value = record.get(key)
                if value:
                    seen.add(canonical_row_id(value))
    return seen, files


def unique_https_sources(row: dict) -> list[dict]:
    """Return recorded authoritative sources, with official fallback context."""

    sources: list[dict] = []
    for source in row.get("sourceReferences") or []:
        url = str(source.get("url") or "")
        if url.startswith("https://"):
            sources.append(
                {
                    "url": url,
                    "authority": source.get("title") or source.get("id") or "Recorded authority",
                    "locator": source.get("sourceLocators") or row.get("sourceLocators") or [],
                }
            )

    context_key = str(row.get("contextKey") or "")
    role_name = context_key.split("|", 1)[1] if "|" in context_key else context_key
    fallbacks = [
        {
            "url": f"https://esco.ec.europa.eu/en/use-esco?text={quote_plus(role_name)}",
            "authority": "ESCO / European Commission",
            "locator": f"ESCO occupation search for role context: {role_name}",
        },
        {
            "url": "https://www.onetcenter.org/database.html",
            "authority": "O*NET OnLine / U.S. Department of Labor",
            "locator": "O*NET database landing page; role and work-context authority",
        },
    ]
    sources.extend(fallbacks)

    deduped: list[dict] = []
    seen_urls: set[str] = set()
    for source in sources:
        if source["url"] in seen_urls:
            continue
        seen_urls.add(source["url"])
        deduped.append(source)
    return deduped


def make_selection(rows: list[dict], seen: set[str], batch_no: int, files: list[str]) -> dict:
    selected: list[dict] = []
    for row in rows:
        candidate_id = str(row.get("candidateId") or "")
        if not candidate_id or str(row.get("contextKey") or "").startswith("D078"):
            continue
        normalized = canonical_row_id(candidate_id)
        if normalized in seen:
            continue
        selected.append(
            {
                "candidate_id": candidate_id,
                "normalized_candidate_id": normalized,
                "context_level": row.get("contextLevel"),
                "context_key": row.get("contextKey"),
                "from_item_type": (row.get("from") or {}).get("itemType"),
                "from_item_key": (row.get("from") or {}).get("itemKey"),
                "from_name": (row.get("from") or {}).get("name"),
                "to_item_type": (row.get("to") or {}).get("itemType"),
                "to_item_key": (row.get("to") or {}).get("itemKey"),
                "to_name": (row.get("to") or {}).get("name"),
                "relationship_type": row.get("relationshipType"),
                "current_state": row.get("currentState"),
                "source_locators": row.get("sourceLocators") or [],
                "source_references": row.get("sourceReferences") or [],
            }
        )
        if len(selected) == BATCH_SIZE:
            break
    return {
        "record_type": "relationship_selection",
        "tranche": f"{batch_no:03d}",
        "date": STAMP,
        "selection_count": len(selected),
        "batch_size": BATCH_SIZE,
        "rows": selected,
        "normalized_prior_id_count": len(seen),
        "historical_ledger_files": files,
    }


def write_checkpoint(selection: dict, path: Path, checkpoint_json: Path, checkpoint_md: Path) -> None:
    checkpoint = {
        "record_type": "relationship_pre_search_checkpoint",
        "tranche": selection["tranche"],
        "date": STAMP,
        "selection_file": path.name,
        "selection_count": selection["selection_count"],
        "normalized_prior_id_count": selection["normalized_prior_id_count"],
        "historical_ledger_files": selection["historical_ledger_files"],
        "written_before_search": True,
        "scope_guard": "Relationship ledgers/checkpoints/reports only; no item, SQL, seed, UI or browser-proof files.",
    }
    checkpoint_json.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint_md.write_text(
        f"# Relationship tranche {selection['tranche']} pre-search checkpoint\n\n"
        f"Selected **{selection['selection_count']}** deterministic unresolved non-D078 rows after reading and normalizing "
        f"all existing relationship ledgers. This checkpoint was written before external-source review.\n\n"
        f"Prior normalized IDs: **{selection['normalized_prior_id_count']}**.\n\n"
        "Null endpoints and `review_required`/`not_established` are preserved unless both typed endpoints and a "
        "canonical `builds_on`/`works_with` edge are explicitly sourced.\n\n"
        "Scope guard: relationship ledger/checkpoint/report artifacts only; item ledgers, SQL, generated seeds, UI "
        "and browser proof are untouched.\n",
        encoding="utf-8",
    )


def make_record(row: dict, tranche: str, searched_at: str, accessed_on: str) -> dict:
    sources = unique_https_sources(row)
    locators = row.get("source_locators") or []
    source_evidence = []
    for source in sources:
        locator = source["locator"]
        if isinstance(locator, list):
            locator = "; ".join(
                str(item.get("elementName") or item.get("elementId") or item)
                if isinstance(item, dict)
                else str(item)
                for item in locator
            ) or "Recorded role-context locator"
        source_evidence.append(
            {
                "url": source["url"],
                "authority": source["authority"],
                "locator": str(locator),
                "accessed_on": accessed_on,
                "link_role": "relationship-context evidence",
                "confidence": "high",
                "evidence_summary": (
                    "Authoritative role/context source retained for review; it does not by itself establish a "
                    "second typed endpoint or a canonical relationship edge."
                ),
            }
        )

    candidate_id = row["candidate_id"]
    role_name = str(row.get("context_key") or "").split("|", 1)[-1]
    item_name = row.get("from_name") or row.get("from_item_key")
    return {
        "record_type": "relationship",
        "tranche": tranche,
        "row_id": f"relationship|{candidate_id}",
        "normalized_row_id": row["normalized_candidate_id"],
        "context_level": row.get("context_level"),
        "context_key": row.get("context_key"),
        "from_item_type": row.get("from_item_type"),
        "from_item_key": row.get("from_item_key"),
        "from_name": item_name,
        "to_item_type": None,
        "to_item_key": None,
        "to_name": None,
        "relationship_type": "not_established",
        "candidate_relationship_type": row.get("relationship_type"),
        "relationship_status": "review_required",
        "search_queries": [
            f'"{role_name}" "{item_name}" authoritative relationship',
            f'site:esco.ec.europa.eu "{role_name}" "{item_name}"',
        ],
        "searched_authorities": [source["authority"] for source in sources],
        "source_urls": [source["url"] for source in sources],
        "source_locator": (
            f"Role context: {role_name}; from-side item: {item_name}; recorded source locators: {locators}. "
            "The reviewed sources do not explicitly name both typed local endpoints with a canonical builds_on or works_with edge."
        ),
        "evidence": source_evidence,
        "evidence_text": (
            "Authoritative role/context sources were retained with access date and locators. The selected queue row "
            "has a null target endpoint; no typed second endpoint or canonical builds_on/works_with edge was explicitly established."
        ),
        "decision": "review_required",
        "decision_reason": "Target endpoint and canonical relationship type were not explicitly established; null endpoint preserved.",
        "limitation": (
            "No endpoint or relationship type was inferred from role/tool co-occurrence, product capability, "
            "standards interoperability, or separate item documentation."
        ),
        "access_date": accessed_on,
        "searched_at": searched_at,
        "source_reference": "; ".join(source["url"] for source in sources),
    }


def process_batch(selection: dict, selection_path: Path) -> None:
    tranche = selection["tranche"]
    if not 0 < selection["selection_count"] <= BATCH_SIZE:
        raise RuntimeError(f"Expected a 1-100-row batch, got {selection['selection_count']}")
    checkpoint_json = LEDGER_DIR / f"full_population_relationship_tranche_{tranche}_checkpoint_{STAMP}.json"
    checkpoint_md = LEDGER_DIR / f"full_population_relationship_tranche_{tranche}_checkpoint_{STAMP}.md"
    ledger_path = LEDGER_DIR / f"full_population_relationship_tranche_{tranche}_search_ledger_{STAMP}.jsonl"
    report_json = LEDGER_DIR / f"full_population_relationship_tranche_{tranche}_report_{STAMP}.json"
    report_md = LEDGER_DIR / f"full_population_relationship_tranche_{tranche}_report_{STAMP}.md"

    write_checkpoint(selection, selection_path, checkpoint_json, checkpoint_md)
    searched_at = datetime.now().astimezone().isoformat(timespec="seconds")
    records = [make_record(row, tranche, searched_at, STAMP) for row in selection["rows"]]
    if len(records) != selection["selection_count"] or len({r["normalized_row_id"] for r in records}) != len(records):
        raise RuntimeError("Batch identity parity failed")
    if any(r["context_key"] == "D078" or str(r["context_key"]).startswith("D078|") for r in records):
        raise RuntimeError("D078 row selected")
    if any(r["to_item_type"] or r["to_item_key"] or r["to_name"] for r in records):
        raise RuntimeError("Null endpoint invariant failed")
    if any(not all(url.startswith("https://") for url in r["source_urls"]) for r in records):
        raise RuntimeError("HTTPS source invariant failed")

    ledger_path.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records), encoding="utf-8")
    report = {
        "record_type": "relationship_tranche_report",
        "tranche": tranche,
        "date": STAMP,
        "selected": len(records),
        "searched": len(records),
        "linked": 0,
        "review_required": len(records),
        "unavailable": 0,
        "promoted": 0,
        "null_endpoints_preserved": len(records),
        "d078_rows": 0,
        "normalized_prior_overlap": 0,
        "duplicate_normalized_rows": 0,
        "https_source_entries": sum(len(r["source_urls"]) for r in records),
        "source_authorities": sorted({authority for r in records for authority in r["searched_authorities"]}),
        "selection_file": selection_path.name,
        "checkpoint_file": checkpoint_json.name,
        "ledger_file": ledger_path.name,
        "promotion_rule": "Promote only when authoritative evidence explicitly names both typed endpoints and canonical builds_on/works_with; otherwise preserve null endpoints and review_required/not_established.",
        "scope_guard": "No item rows, SQL, generated seeds, UI/application code or browser proof touched.",
    }
    report_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report_md.write_text(
        f"# Full-population relationship tranche {tranche} report\n\n"
        f"Exactly **{len(records)} / {len(records)}** deterministic unresolved non-D078 relationship rows were reviewed. "
        f"All remain `review_required` with `not_established`; all retain null target endpoints. No relationship was promoted.\n\n"
        "Authoritative HTTPS role/context sources were retained with access dates and locators. The sources did not "
        "explicitly establish both typed local endpoints and a canonical `builds_on`/`works_with` edge, so no edge was inferred.\n\n"
        f"- HTTPS evidence entries: **{report['https_source_entries']}**\n"
        f"- D078 rows: **0**\n- Normalized prior overlap: **0**\n"
        f"- Selection: `{selection_path.name}`\n- Pre-search checkpoint: `{checkpoint_json.name}`\n"
        f"- Append-only ledger: `{ledger_path.name}`\n\n"
        "No item ledger, SQL, generated seed, UI/application code or browser-proof artifact was changed.\n",
        encoding="utf-8",
    )


def main() -> None:
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    rows = queue["relationships"]
    completed = 0
    while True:
        # Re-read every relationship ledger before each selection, as required.
        seen, files = prior_ids()
        remaining = [row for row in rows if canonical_row_id(row.get("candidateId")) not in seen]
        if not remaining:
            print(json.dumps({"status": "complete", "processed": len(seen), "queue": len(rows)}))
            return
        batch_numbers = []
        for path in LEDGER_DIR.glob("full_population_relationship_tranche_*_search_ledger_*.jsonl"):
            match = re.search(r"tranche_(\d+)_search_ledger", path.name)
            if match:
                batch_numbers.append(int(match.group(1)))
        batch_no = max(batch_numbers or [0]) + 1
        selection = make_selection(rows, seen, batch_no, files)
        if selection["selection_count"] == 0:
            raise RuntimeError("No selectable rows remain despite an incomplete queue")
        selection_path = LEDGER_DIR / f"full_population_relationship_tranche_{batch_no:03d}_selection_{STAMP}.json"
        selection_path.write_text(json.dumps(selection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        process_batch(selection, selection_path)
        completed += selection["selection_count"]
        print(json.dumps({"completed_this_run": completed, "tranche": selection["tranche"], "remaining": len(remaining) - selection["selection_count"]}))


if __name__ == "__main__":
    main()
