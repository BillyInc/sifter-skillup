#!/usr/bin/env python3
"""Deterministically inventory unresolved contextual relationships.

This is a read-only audit.  It deliberately does not infer endpoint matches or
promote a relationship.  Item inventory still uses incremental decoding; the
relationship inventory uses the validated top-level JSON document so that the
complete array (including its final closing bytes) is audited exactly.
"""

from __future__ import annotations

import argparse
import gzip
import json
from pathlib import Path
from typing import Any, Iterator


DEFAULT_INPUT = Path(__file__).with_name("contextual_guidance_items.json.gz")
DEFAULT_OUTPUT = Path(__file__).with_name("_audit") / "relationship_backlog_inventory.json"
REPO_ROOT = Path(__file__).resolve().parents[2]


def _repo_relative(path: Path) -> str:
    """Keep generated audit manifests portable across checkout locations."""
    try:
        return path.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def _iter_array(path: Path, marker: bytes, *, chunk_size: int = 1 << 20) -> Iterator[dict[str, Any]]:
    """Yield objects from one top-level JSON array without loading the document."""

    decoder = json.JSONDecoder()
    buffer = ""
    found = False
    started = False
    eof = False

    with gzip.open(path, "rb") as stream:
        while True:
            data = stream.read(chunk_size)
            if data:
                buffer += data.decode("utf-8")
            else:
                eof = True

            if not found:
                marker_text = marker.decode("ascii")
                marker_pos = buffer.find(marker_text)
                if marker_pos < 0:
                    if eof:
                        raise ValueError(f"JSON marker not found: {marker!r}")
                    # Keep enough tail for a marker split across chunks.
                    buffer = buffer[-len(marker_text) :]
                    continue
                buffer = buffer[marker_pos + len(marker_text) :]
                found = True

            if not started:
                buffer = buffer.lstrip()
                if not buffer:
                    if eof:
                        raise ValueError("Relationship array has no opening bracket")
                    continue
                if buffer[0] != "[":
                    raise ValueError(f"Expected array after {marker!r}")
                buffer = buffer[1:]
                started = True

            while True:
                buffer = buffer.lstrip()
                if not buffer:
                    break
                if buffer[0] == "]":
                    return
                try:
                    value, end = decoder.raw_decode(buffer)
                except json.JSONDecodeError:
                    break
                if not isinstance(value, dict):
                    raise ValueError("Relationship array contains a non-object value")
                yield value
                buffer = buffer[end:]
                buffer = buffer.lstrip()
                if buffer.startswith(","):
                    buffer = buffer[1:]
                elif buffer.startswith("]"):
                    return
                elif buffer:
                    raise ValueError("Malformed relationship array separator")

            if eof:
                # A valid JSON document can leave the final top-level closing
                # bytes in the decoder tail after the last object is yielded.
                # The generated gzip is validated separately by the generator;
                # an empty tail here means the array was fully consumed.
                if not buffer.strip():
                    return
                raise ValueError("Unexpected end of relationship array")


def _is_unresolved(row: dict[str, Any]) -> bool:
    state = str(row.get("data_state") or row.get("status") or "").strip().lower()
    relationship = str(row.get("relationship_type") or row.get("relationship") or "").strip().lower()
    return state in {"not_established", "review_only", "unresolved"} or relationship in {
        "not_established",
        "unresolved",
    }


def _sort_key(row: dict[str, Any]) -> tuple[str, ...]:
    return tuple(str(row.get(key) or "").casefold() for key in (
        "context_level",
        "context_key",
        "from_item_key",
        "from_name",
        "to_item_key",
        "to_name",
        "relationship_type",
        "data_state",
    ))


def _context_matches(row: dict[str, Any], context_prefix: str | None) -> bool:
    return not context_prefix or str(row.get("context_key") or "").startswith(context_prefix)


def _relationship_candidate_id(row: dict[str, Any]) -> str:
    fields = (
        row.get("context_level"), row.get("context_key"), row.get("from_item_type"),
        row.get("from_item_key"), row.get("to_item_type") or "", row.get("to_item_key") or "",
        row.get("relationship_type") or row.get("relationship") or "",
    )
    return "|".join(str(value or "") for value in fields)


def _with_endpoint_evidence(row: dict[str, Any]) -> dict[str, Any]:
    """Expose endpoint identity/evidence without changing the source row."""
    result = dict(row)
    result["candidate_id"] = _relationship_candidate_id(row)
    result["from_endpoint"] = {
        "context_level": row.get("context_level"),
        "context_key": row.get("context_key"),
        "item_type": row.get("from_item_type"),
        "item_key": row.get("from_item_key"),
        "name": row.get("from_name"),
        "source_ids": row.get("source_ids") or [],
        "source_references": row.get("source_references") or [],
        "source_locators": row.get("source_locators") or [],
    }
    result["to_endpoint"] = {
        "context_level": row.get("context_level"),
        "context_key": row.get("context_key"),
        "item_type": row.get("to_item_type"),
        "item_key": row.get("to_item_key"),
        "name": row.get("to_name"),
        "source_ids": row.get("to_source_ids") or [],
        "source_references": row.get("to_source_references") or [],
        "source_locators": row.get("to_source_locators") or [],
    }
    return result


def _select(rows: list[dict[str, Any]], limit: int | None, offset: int) -> list[dict[str, Any]]:
    rows.sort(key=_sort_key)
    selected = rows[offset:] if limit is None else rows[offset : offset + limit]
    return selected


def inventory_relationships(
    path: Path,
    limit: int | None = None,
    offset: int = 0,
    context_prefix: str | None = None,
) -> dict[str, Any]:
    # The generator validates this document as a complete JSON object.  Loading
    # that object here avoids a false EOF on the custom array decoder when the
    # final relationship object and the document's closing bytes share a chunk.
    with gzip.open(path, "rt", encoding="utf-8") as stream:
        payload = json.load(stream)
    relationship_rows = payload.get("relationships", [])
    if not isinstance(relationship_rows, list):
        raise ValueError("The catalogue relationships value is not an array")
    rows = [
        _with_endpoint_evidence(row)
        for row in relationship_rows
        if isinstance(row, dict)
        if _is_unresolved(row) and _context_matches(row, context_prefix)
    ]
    selected = _select(rows, limit, offset)
    return {
        "schema_version": "2026-09-19.relationship-backlog.v2",
        "kind": "relationships",
        "input": _repo_relative(path),
        "selection": {"offset": offset, "limit": limit, "context_prefix": context_prefix, "order": [
            "context_level", "context_key", "from_item_key", "from_name",
            "to_item_key", "to_name", "relationship_type", "data_state",
        ]},
        "total_unresolved": len(rows),
        "selected_count": len(selected),
        "rows": selected,
    }


def inventory_items(
    path: Path,
    limit: int | None = None,
    offset: int = 0,
    context_prefix: str | None = None,
    item_types: set[str] | None = None,
) -> dict[str, Any]:
    rows = [
        row for row in _iter_array(path, b'"items":')
        if _context_matches(row, context_prefix)
        and (not item_types or str(row.get("item_type") or "") in item_types)
    ]
    rows.sort(key=lambda row: (
        str(row.get("context_level") or "").casefold(),
        str(row.get("context_key") or "").casefold(),
        str(row.get("item_type") or "").casefold(),
        str(row.get("item_key") or "").casefold(),
    ))
    selected = rows[offset:] if limit is None else rows[offset : offset + limit]
    return {
        "schema_version": "2026-09-19.source-backed-item-inventory.v1",
        "kind": "items",
        "input": _repo_relative(path),
        "selection": {
            "offset": offset,
            "limit": limit,
            "context_prefix": context_prefix,
            "item_types": sorted(item_types or []),
            "order": ["context_level", "context_key", "item_type", "item_key"],
        },
        "total_items": len(rows),
        "selected_count": len(selected),
        "rows": selected,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--kind", choices=("relationships", "items"), default="relationships")
    parser.add_argument("--context-prefix", default=None)
    parser.add_argument("--item-type", action="append", default=[])
    args = parser.parse_args()
    if args.offset < 0 or args.limit is not None and args.limit < 0:
        parser.error("offset and limit must be non-negative")
    if args.kind == "items":
        result = inventory_items(args.input, args.limit, args.offset, args.context_prefix, set(args.item_type))
    else:
        result = inventory_relationships(args.input, args.limit, args.offset, args.context_prefix)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "total": result.get("total_unresolved", result.get("total_items")),
        "selected_count": result["selected_count"],
        "output": args.output.as_posix(),
    }))


if __name__ == "__main__":
    main()
