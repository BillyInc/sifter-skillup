"""Stream the contextual catalogue for source-enrichment triage.

The generated contextual catalogue is too large to load through a single
``json.load`` call on the development machine.  This utility reads only the
top-level arrays, deduplicates item names and relationship endpoints, and
writes an audit inventory.  It does not infer links, change link states, edit
generated transport, or apply SQL.
"""

from __future__ import annotations

import argparse
import gzip
import io
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterator


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
DEFAULT_OUTPUT = ROOT / "data" / "career-mapping" / "_audit" / "item_source_enrichment_inventory_2026-09-19.json"


def _iter_top_level_array(path: Path, field: str, chunk_size: int = 1024 * 1024) -> Iterator[dict[str, Any]]:
    """Yield objects from a top-level JSON array without materialising it."""

    marker = f'"{field}":['
    decoder = json.JSONDecoder()
    buffer = ""
    started = False
    finished = False
    with io.TextIOWrapper(gzip.open(path, "rb"), encoding="utf-8") as stream:
        while not finished:
            chunk = stream.read(chunk_size)
            if chunk:
                buffer += chunk
            elif not buffer:
                break

            if not started:
                position = buffer.find(marker)
                if position < 0:
                    if chunk:
                        buffer = buffer[-len(marker) :]
                        continue
                    raise ValueError(f"JSON array marker not found: {field}")
                buffer = buffer[position + len(marker) :]
                started = True

            while True:
                buffer = buffer.lstrip()
                if buffer.startswith("]"):
                    finished = True
                    buffer = buffer[1:]
                    break
                if buffer.startswith(","):
                    buffer = buffer[1:]
                    buffer = buffer.lstrip()
                    if not buffer:
                        break
                if not buffer:
                    break
                try:
                    value, consumed = decoder.raw_decode(buffer)
                except json.JSONDecodeError:
                    break
                if not isinstance(value, dict):
                    raise ValueError(f"Expected an object in {field}, got {type(value).__name__}")
                yield value
                buffer = buffer[consumed:]
                buffer = buffer.lstrip()
                if buffer.startswith(","):
                    buffer = buffer[1:]
                elif buffer.startswith("]"):
                    finished = True
                    buffer = buffer[1:]
                    break


def _item_key(row: dict[str, Any]) -> tuple[str, str]:
    return (str(row.get("item_type") or "unknown"), str(row.get("name") or "").strip().casefold())


def _endpoint_key(row: dict[str, Any]) -> tuple[str, str]:
    return (str(row.get("item_type") or "unknown"), str(row.get("name") or "").strip().casefold())


def build_inventory(path: Path) -> dict[str, Any]:
    item_counts = Counter()
    item_states = Counter()
    source_ids = Counter()
    contexts: dict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
    unique_items: dict[tuple[str, str], dict[str, Any]] = {}
    relationship_counts = Counter()
    relationship_states = Counter()
    endpoint_counts = Counter()
    unique_edges: dict[tuple[str, str, str, str, str, str], dict[str, Any]] = {}

    item_rows = 0
    for row in _iter_top_level_array(path, "items"):
        item_rows += 1
        key = _item_key(row)
        item_counts[key[0]] += 1
        item_states[str(row.get("link_state") or "missing")] += 1
        for source_id in row.get("source_ids") or []:
            source_ids[str(source_id)] += 1
        context = (str(row.get("context_level") or ""), str(row.get("context_key") or ""))
        contexts[context].add(key)
        unique_items.setdefault(
            key,
            {
                "itemType": key[0],
                "name": str(row.get("name") or ""),
                "itemKey": row.get("item_key"),
                "firstContext": {"level": context[0], "key": context[1]},
                "sourceIds": sorted(str(value) for value in (row.get("source_ids") or [])),
                "linkStatesSeen": [],
            },
        )
        state = str(row.get("link_state") or "missing")
        if state not in unique_items[key]["linkStatesSeen"]:
            unique_items[key]["linkStatesSeen"].append(state)

    relationship_rows = 0
    for row in _iter_top_level_array(path, "relationships"):
        relationship_rows += 1
        relationship_type = str(row.get("relationship_type") or "")
        data_state = str(row.get("data_state") or "")
        relationship_counts[relationship_type] += 1
        relationship_states[data_state or "missing"] += 1
        from_key = _endpoint_key({"item_type": row.get("from_item_type"), "name": row.get("from_name")})
        to_key = _endpoint_key({"item_type": row.get("to_item_type"), "name": row.get("to_name")})
        endpoint_counts[from_key] += 1
        endpoint_counts[to_key] += 1
        edge_key = (
            str(row.get("context_level") or ""),
            str(row.get("context_key") or ""),
            from_key[0],
            from_key[1],
            to_key[0],
            to_key[1],
        )
        unique_edges.setdefault(
            edge_key,
            {
                "contextLevel": edge_key[0],
                "contextKey": edge_key[1],
                "fromItemType": from_key[0],
                "fromName": row.get("from_name"),
                "toItemType": to_key[0],
                "toName": row.get("to_name"),
                "relationshipType": relationship_type,
                "dataState": data_state,
                "sourceIds": sorted(str(value) for value in (row.get("source_ids") or [])),
            },
        )

    return {
        "schema": "2026-09-19.item-source-enrichment-inventory.v1",
        "catalogue": str(path.relative_to(ROOT)).replace("\\", "/"),
        "policy": "Inventory only. Generic framework references are not item-specific links. No link may be promoted without an authoritative item-specific URL and locator.",
        "counts": {
            "itemRows": item_rows,
            "relationshipRows": relationship_rows,
            "uniqueItemNames": len(unique_items),
            "uniqueRelationshipEndpoints": len(endpoint_counts),
            "uniqueRelationshipEdges": len(unique_edges),
            "contexts": len(contexts),
        },
        "itemLinkStates": dict(sorted(item_states.items())),
        "itemTypes": dict(sorted(item_counts.items())),
        "relationshipTypes": dict(sorted(relationship_counts.items())),
        "relationshipDataStates": dict(sorted(relationship_states.items())),
        "sourceIds": dict(sorted(source_ids.items())),
        "uniqueItems": sorted(unique_items.values(), key=lambda row: (row["itemType"], row["name"].casefold())),
        "uniqueRelationshipEdges": sorted(unique_edges.values(), key=lambda row: (row["contextLevel"], row["contextKey"], row["fromName"] or "", row["toName"] or "")),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalogue", type=Path, default=CATALOGUE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    result = build_inventory(args.catalogue)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
