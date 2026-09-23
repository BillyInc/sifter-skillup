"""Build the complete, explicit external-search queue.

This queue is intentionally separate from the generated student seed.  It
records what still needs an item-specific authoritative search and carries
the existing source locators forward without treating them as verified links.
It includes every unique contextual item and every unresolved relationship.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from external_source_catalog_inventory import _iter_top_level_array


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
RELATIONSHIP_QUEUE = ROOT / "data" / "career-mapping" / "_audit" / "relationship_backlog_inventory.json"
OUTPUT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json"
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"


def _item_id(row: dict[str, Any]) -> tuple[str, str]:
    return (str(row.get("item_type") or "unknown"), str(row.get("name") or "").strip().casefold())


def _record_sources(record: dict[str, Any]) -> list[dict[str, Any]]:
    """Normalize the two search-ledger source shapes into queue evidence."""
    sources = [source for source in (record.get("searched_sources") or []) if isinstance(source, dict)]
    if not sources:
        evidence_rows = record.get("evidence") or []
        if isinstance(evidence_rows, dict):
            evidence_rows = [evidence_rows]
        sources = [
            {
                "source_key": evidence.get("source_key") or record.get("source_reference"),
                "title": evidence.get("title") or evidence.get("authority"),
                "url": evidence.get("url"),
                "authority": evidence.get("authority") or evidence.get("title"),
                "locator": evidence.get("locator"),
                "exact_evidence": evidence.get("exact_evidence") or evidence.get("evidence_summary"),
                "accessed_on": evidence.get("accessed_on") or record.get("accessed_on"),
            }
            for evidence in evidence_rows
            if isinstance(evidence, dict)
        ]
    if not sources:
        urls = record.get("source_urls") or record.get("candidate_urls") or []
        if isinstance(urls, str):
            urls = [urls]
        authorities = record.get("searched_authorities") or ["External source"]
        sources = [
            {
                "source_key": record.get("source_reference"),
                "title": authorities[0] if authorities else "External source",
                "url": url,
                "authority": authorities[0] if authorities else "External source",
                "locator": record.get("source_locator"),
                "exact_evidence": record.get("evidence"),
                "accessed_on": record.get("access_date"),
            }
            for url in urls
        ]
    if not sources and str(record.get("source_url") or "").startswith("https://"):
        authorities = record.get("searched_authorities") or ["External source"]
        sources = [{
            "source_key": record.get("source_reference"),
            "title": authorities[0],
            "url": record.get("source_url"),
            "authority": authorities[0],
            "locator": record.get("source_locator"),
            "exact_evidence": record.get("evidence"),
            "accessed_on": record.get("access_date"),
        }]
    return [source for source in sources if str(source.get("url") or "").startswith("https://")]


def _record_candidate_id(record: dict[str, Any]) -> str:
    """Build the same identity used by relationship_backlog_inventory.py."""
    def normalize(candidate_id: str) -> str:
        value = candidate_id.strip()
        if value.startswith("relationship|"):
            value = value[len("relationship|"):]
        aliases = {"missing", "unresolved", "review_only", "review-required"}
        parts = value.split("|")
        if parts and parts[-1] in aliases:
            parts[-1] = "not_established"
        return "|".join(parts)

    if record.get("candidate_id"):
        return normalize(str(record["candidate_id"]))
    if not (
        record.get("record_type") == "relationship"
        or record.get("from_item_type")
        or record.get("from_item_key")
        or record.get("relationship_type")
    ):
        return ""
    fields = (
        record.get("context_level"),
        record.get("context_key"),
        record.get("from_item_type"),
        record.get("from_item_key"),
        record.get("to_item_type") or "",
        record.get("to_item_key") or "",
        record.get("relationship_type") or record.get("relationship") or "",
    )
    if not any(value for value in fields):
        return ""
    return normalize("|".join(str(value or "") for value in fields))


def _load_external_ledgers() -> tuple[
    dict[tuple[str, str], list[dict]],
    dict[tuple[str, str], list[dict]],
    dict[str, list[dict]],
]:
    """Load row-level search evidence without treating it as a seed mutation."""
    item_records: dict[tuple[str, str], list[dict]] = defaultdict(list)
    item_records_by_key: dict[tuple[str, str], list[dict]] = defaultdict(list)
    relationship_records: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(LEDGER_DIR.glob("*_search_ledger_*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            decision = str(record.get("decision") or "").strip()
            sources = _record_sources(record)
            if decision not in {"linked", "review_required", "genuinely_unavailable"} or not sources:
                continue
            item_name = record.get("name") or record.get("item_name")
            if record.get("item_type") and item_name:
                item_records[(str(record["item_type"]).casefold(), str(item_name).strip().casefold())].append(record)
            item_type = str(record.get("item_type") or "").strip().casefold()
            item_key = str(record.get("item_key") or "").strip().casefold()
            if item_type and item_key:
                # Some continuous-lane ledgers intentionally carry only the
                # canonical typed key.  Reconcile those rows without relying
                # on a display name that may be absent or translated.
                item_records_by_key[(item_type, item_key)].append(record)
            candidate_id = _record_candidate_id(record).strip()
            if candidate_id:
                relationship_records[candidate_id].append(record)
    return item_records, item_records_by_key, relationship_records


def _search_status(records: list[dict]) -> str:
    decisions = {str(record.get("decision") or "").strip() for record in records}
    if "linked" in decisions:
        return "linked_external_verified"
    if "review_required" in decisions:
        return "review_required_external_search"
    if "genuinely_unavailable" in decisions:
        return "genuinely_unavailable_after_search"
    return "pending_external_search"


def _search_evidence(records: list[dict]) -> list[dict]:
    return [
        {
            "decision": record.get("decision"),
            "contextLevel": record.get("context_level"),
            "contextKey": record.get("context_key"),
            "accessedOn": record.get("accessed_on") or record.get("searched_at"),
            "limitation": record.get("limitation"),
            "sources": _record_sources(record),
        }
        for record in records
    ]


def build(path: Path, relationship_path: Path) -> dict[str, Any]:
    item_search_records, item_search_records_by_key, relationship_search_records = _load_external_ledgers()
    items: dict[tuple[str, str], dict[str, Any]] = {}
    contextual_item_rows = 0
    for row in _iter_top_level_array(path, "items"):
        contextual_item_rows += 1
        identity = _item_id(row)
        record = items.setdefault(
            identity,
            {
                "itemType": identity[0],
                "name": str(row.get("name") or ""),
                "itemKeys": set(),
                "contexts": set(),
                "sourceIds": set(),
                "sourceReferences": {},
                "existingLinkStates": set(),
                "searchStatus": "pending_external_search",
            },
        )
        if row.get("item_key"):
            record["itemKeys"].add(str(row["item_key"]))
        record["contexts"].add((str(row.get("context_level") or ""), str(row.get("context_key") or "")))
        record["sourceIds"].update(str(value) for value in (row.get("source_ids") or []))
        record["existingLinkStates"].add(str(row.get("link_state") or "missing"))
        for ref in row.get("source_references") or []:
            if not isinstance(ref, dict) or not ref.get("url"):
                continue
            key = str(ref["url"])
            record["sourceReferences"].setdefault(
                key,
                {
                    "title": ref.get("title"),
                    "url": key,
                    "authority": ref.get("authority") or ref.get("title"),
                    "evidenceType": ref.get("evidenceType"),
                    "sourceLocators": ref.get("sourceLocators") or [],
                },
            )
    for identity, record in items.items():
        searches_by_id: dict[str, dict[str, Any]] = {}
        for search in item_search_records.get(identity, []):
            searches_by_id[str(search.get("row_id") or search.get("subject_id") or id(search))] = search
        for item_key in record["itemKeys"]:
            for search in item_search_records_by_key.get((identity[0], str(item_key).casefold()), []):
                searches_by_id[str(search.get("row_id") or search.get("subject_id") or id(search))] = search
        searches = list(searches_by_id.values())
        record["searchStatus"] = _search_status(searches)
        record["externalSearchEvidence"] = _search_evidence(searches)
        record["searchedRecordCount"] = len(searches)

    relationship_rows = json.loads(relationship_path.read_text(encoding="utf-8")).get("rows", [])
    relationships = []
    for row in relationship_rows:
        candidate_id = str(row.get("candidate_id") or "")
        searches = relationship_search_records.get(candidate_id, [])
        relationships.append(
            {
                "candidateId": row.get("candidate_id"),
                "contextLevel": row.get("context_level"),
                "contextKey": row.get("context_key"),
                "from": {
                    "itemType": row.get("from_item_type"),
                    "itemKey": row.get("from_item_key"),
                    "name": row.get("from_name"),
                },
                "to": {
                    "itemType": row.get("to_item_type"),
                    "itemKey": row.get("to_item_key"),
                    "name": row.get("to_name"),
                },
                "relationshipType": row.get("relationship_type"),
                "currentState": row.get("data_state") or row.get("relationship_status"),
                "sourceIds": row.get("source_ids") or [],
                "sourceReferences": row.get("source_references") or [],
                "sourceLocators": row.get("source_locators") or [],
                "searchStatus": _search_status(searches),
                "externalSearchEvidence": _search_evidence(searches),
                "promotionRule": "Do not promote unless an authoritative source names both endpoints or establishes the typed relationship at this context.",
            }
        )

    serial_items = []
    for record in items.values():
        serial_items.append(
            {
                **record,
                "itemKeys": sorted(record["itemKeys"]),
                "contexts": [
                    {"level": level, "key": key}
                    for level, key in sorted(record["contexts"])
                ],
                "sourceIds": sorted(record["sourceIds"]),
                "sourceReferences": sorted(record["sourceReferences"].values(), key=lambda value: value["url"]),
                "existingLinkStates": sorted(record["existingLinkStates"]),
            }
        )
    serial_items.sort(key=lambda value: (value["itemType"], value["name"].casefold()))
    return {
        "schema": "2026-09-20.external-enrichment-queue.v1",
        "generatedAt": date.today().isoformat(),
        "scope": {
            "contextualItemRows": contextual_item_rows,
            "uniqueItems": len(serial_items),
            "unresolvedRelationships": len(relationships),
            "canonicalProgrammes": 237,
            "canonicalJambIdentities": 420,
        },
        "policy": "Generic framework and domain references are retained as evidence leads, not treated as item-specific links. Every pending row must receive an authoritative item-specific URL and locator, an explicit review_required decision with searched sources, or a documented genuinely_unavailable decision. Search-ledger evidence is tracked separately until reviewed into the generated catalogue.",
        "searchLedger": {
            "files": [path.name for path in sorted(LEDGER_DIR.glob("*_search_ledger_*.jsonl"))],
            "searchedItemRecords": sum(len(records) for records in item_search_records.values()),
            "searchedRelationshipRecords": sum(len(records) for records in relationship_search_records.values()),
        },
        "items": serial_items,
        "relationships": relationships,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalogue", type=Path, default=CATALOGUE)
    parser.add_argument("--relationships", type=Path, default=RELATIONSHIP_QUEUE)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    result = build(args.catalogue, args.relationships)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result["scope"], sort_keys=True))


if __name__ == "__main__":
    main()
