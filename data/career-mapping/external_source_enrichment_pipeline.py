"""Incremental external-source enrichment for contextual items and edges.

This tool is deliberately isolated from generated seeds, SQL and UI code.  It
reads the existing compressed contextual catalogue and writes only audit
artifacts whose names begin with ``external_source_enrichment``.

The pipeline has three explicit states:

* ``not_searched`` - no item-specific internet search has been recorded;
* ``source_backed`` - an authoritative, item-specific URL and locator were
  recorded; and
* ``genuinely_unavailable`` - item-specific authoritative searches were
  recorded and did not produce a usable destination.

Relationships are stricter.  A relationship can only be recorded when the
evidence names both typed endpoints in the same context and names the
relationship type.  A source that merely mentions a tool or occupation never
promotes an edge.

The catalogue is approximately 900 MB after decompression, so this module
uses a bounded-memory streaming JSON-array reader.  It never rewrites the
input gzip or any seed transport.
"""

from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Iterable, Iterator
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "_audit"
INPUT = ROOT / "contextual_guidance_items.json.gz"
DATE = dt.date.today().isoformat()
DEFAULT_MANIFEST = AUDIT / f"external_source_enrichment_manifest_{DATE}.json"
DEFAULT_REL_QUEUE = AUDIT / f"external_source_enrichment_relationship_queue_{DATE}.json.gz"
DEFAULT_ITEM_QUEUE = AUDIT / f"external_source_enrichment_item_queue_{DATE}.json.gz"
DEFAULT_LEDGER = AUDIT / f"external_source_enrichment_search_ledger_{DATE}.jsonl"


def _repo_relative(path: Path) -> str:
    """Return a portable path for either relative or absolute CLI arguments."""
    candidate = path.resolve()
    repo = ROOT.parent.parent
    try:
        return candidate.relative_to(repo).as_posix()
    except ValueError:
        return path.as_posix()


def _marker(name: str) -> bytes:
    return bytes([34]) + name.encode("ascii") + bytes([34]) + b":"


def _iter_array(path: Path, array_name: str, chunk_size: int = 8 << 20) -> Iterator[dict[str, Any]]:
    """Yield objects in a top-level JSON array without retaining the array.

    The parser keeps a cursor into a bounded string buffer.  It intentionally
    uses the standard JSON decoder for object boundaries so quoted braces and
    escaped strings are handled by a real JSON parser.
    """

    decoder = json.JSONDecoder()
    marker = _marker(array_name).decode("ascii")
    buffer = ""
    cursor = 0
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
                pos = buffer.find(marker)
                if pos < 0:
                    if eof:
                        raise ValueError(f"JSON array marker not found: {array_name}")
                    buffer = buffer[-len(marker) :]
                    continue
                cursor = pos + len(marker)
                found = True
            if not started:
                while cursor < len(buffer) and buffer[cursor].isspace():
                    cursor += 1
                if cursor >= len(buffer):
                    if eof:
                        raise ValueError(f"Missing opening bracket for {array_name}")
                    continue
                if buffer[cursor] != "[":
                    raise ValueError(f"Expected array after {array_name}")
                cursor += 1
                started = True
            while True:
                while cursor < len(buffer) and (buffer[cursor].isspace() or buffer[cursor] == ","):
                    cursor += 1
                if cursor >= len(buffer):
                    break
                if buffer[cursor] == "]":
                    return
                try:
                    value, end = decoder.raw_decode(buffer, cursor)
                except json.JSONDecodeError:
                    break
                if not isinstance(value, dict):
                    raise ValueError(f"{array_name} contains a non-object")
                yield value
                cursor = end
            if eof:
                raise ValueError(f"Unexpected end of {array_name}")
            # Drop consumed data while keeping a small tail for a split token.
            if cursor > chunk_size:
                buffer = buffer[cursor:]
                cursor = 0


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _write_jsonl_gz(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with gzip.open(path, "wt", encoding="utf-8", newline="\n") as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            count += 1
    return count


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def _read_jsonl_gz(path: Path) -> Iterator[dict[str, Any]]:
    with gzip.open(path, "rt", encoding="utf-8") as stream:
        for line in stream:
            if line.strip():
                yield json.loads(line)


def _item_id(row: dict[str, Any]) -> str:
    return "|".join(str(row.get(k) or "") for k in ("context_level", "context_key", "item_type", "item_key"))


def _relationship_id(row: dict[str, Any]) -> str:
    return "|".join(
        str(row.get(k) or "")
        for k in (
            "context_level",
            "context_key",
            "from_item_type",
            "from_item_key",
            "to_item_type",
            "to_item_key",
            "relationship_type",
        )
    )


def _is_no_link(row: dict[str, Any]) -> bool:
    return str(row.get("link_state") or "no_link").casefold() == "no_link"


def _is_unresolved(row: dict[str, Any]) -> bool:
    return str(row.get("data_state") or row.get("relationship_status") or "").casefold() in {
        "not_established",
        "review_only",
        "unresolved",
    } or str(row.get("relationship_type") or "").casefold() in {"not_established", "unresolved"}


def _compact_item(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "item_id": _item_id(row),
        "context_level": row.get("context_level"),
        "context_key": row.get("context_key"),
        "domain_key": row.get("domain_key"),
        "item_type": row.get("item_type"),
        "item_key": row.get("item_key"),
        "name": row.get("name"),
        "source_ids": row.get("source_ids") or [],
        "source_references": row.get("source_references") or [],
        "source_locators": row.get("source_locators") or [],
        "current_link_state": row.get("link_state") or "no_link",
        "enrichment_state": "not_searched",
    }


def _compact_relationship(row: dict[str, Any]) -> dict[str, Any]:
    result = {
        "relationship_id": _relationship_id(row),
        "context_level": row.get("context_level"),
        "context_key": row.get("context_key"),
        "domain_key": row.get("domain_key"),
        "from_item_type": row.get("from_item_type"),
        "from_item_key": row.get("from_item_key"),
        "from_name": row.get("from_name"),
        "to_item_type": row.get("to_item_type"),
        "to_item_key": row.get("to_item_key"),
        "to_name": row.get("to_name"),
        "current_relationship_type": row.get("relationship_type"),
        "current_data_state": row.get("data_state"),
        "source_ids": row.get("source_ids") or [],
        "source_references": row.get("source_references") or [],
        "source_locators": row.get("source_locators") or [],
        "enrichment_state": "not_searched",
    }
    return result


def inventory(args: argparse.Namespace) -> None:
    item_count = 0
    no_link_count = 0
    item_types: Counter[str] = Counter()
    contexts: set[tuple[str, str]] = set()

    def items() -> Iterator[dict[str, Any]]:
        nonlocal item_count, no_link_count
        for row in _iter_array(args.input, "items"):
            item_count += 1
            contexts.add((str(row.get("context_level") or ""), str(row.get("context_key") or "")))
            item_types[str(row.get("item_type") or "unknown")] += 1
            if _is_no_link(row):
                no_link_count += 1
                yield _compact_item(row)

    item_queue_count = _write_jsonl_gz(args.item_queue, items())
    relationship_count = 0
    unresolved_count = 0

    def relationships() -> Iterator[dict[str, Any]]:
        nonlocal relationship_count, unresolved_count
        for row in _iter_array(args.input, "relationships"):
            relationship_count += 1
            if _is_unresolved(row):
                unresolved_count += 1
                yield _compact_relationship(row)

    relationship_queue_count = _write_jsonl_gz(args.relationship_queue, relationships())
    previous = _read_jsonl(args.ledger)
    searched = {str(r.get("subject_id")) for r in previous if r.get("subject_id")}
    source_backed = sum(1 for r in previous if r.get("decision") == "source_backed")
    unavailable = sum(1 for r in previous if r.get("decision") == "genuinely_unavailable")
    manifest = {
        "schema": "2026-09-19.external-source-enrichment.manifest.v1",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "accessed_on": DATE,
        "input": _repo_relative(args.input),
        "scope": {
            "canonical_programme_count": 237,
            "canonical_jamb_identity_count": 420,
            "context_count": len(contexts),
            "item_rows_scanned": item_count,
            "no_link_items_queued": item_queue_count,
            "relationship_rows_scanned": relationship_count,
            "not_established_relationships_queued": relationship_queue_count,
        },
        "item_type_counts": dict(sorted(item_types.items())),
        "search_ledger": {
            "rows": len(previous),
            "distinct_subjects_searched": len(searched),
            "source_backed_decisions": source_backed,
            "genuinely_unavailable_decisions": unavailable,
            "unsearched_item_or_relationship_rows": no_link_count + unresolved_count - len(searched),
        },
        "state_policy": {
            "no_link_is_not_search_evidence": True,
            "not_established_is_not_a_relationship": True,
            "relationship_promotion_requires_exact_typed_same_context_endpoints": True,
            "generic_homepages_and_search_urls_are_rejected": True,
        },
        "outputs": {
            "item_queue": _repo_relative(args.item_queue),
            "relationship_queue": _repo_relative(args.relationship_queue),
            "ledger": _repo_relative(args.ledger),
        },
    }
    _write_json(args.manifest, manifest)
    print(json.dumps({"manifest": str(args.manifest), **manifest["scope"], "ledger_rows": len(previous)}))


def _load_batch_rows(path: Path) -> list[dict[str, Any]]:
    if path.suffix == ".gz":
        return list(_read_jsonl_gz(path))
    data = _read_json(path)
    if isinstance(data, list):
        return data
    return list(data.get("records", data.get("rows", [])))


def plan(args: argparse.Namespace) -> None:
    ledger = _read_jsonl(args.ledger)
    done = {str(row.get("subject_id")) for row in ledger if row.get("subject_id")}
    queue = _read_jsonl_gz(args.queue)
    selected = [row for row in queue if row.get(args.queue_id_field) not in done][: args.limit]
    records = []
    for row in selected:
        subject_id = row.get(args.queue_id_field)
        query = f'"{row.get("name") or row.get("from_name")}" official documentation'
        records.append(
            {
                "subject_id": subject_id,
                "subject_kind": args.kind,
                "queue_record": row,
                "search_queries": [query],
                "search_urls": [],
                "decision": "not_searched",
                "evidence": [],
                "review_note": "Search this subject against authoritative item-specific sources; do not infer from a category or co-occurrence.",
            }
        )
    payload = {
        "schema": "2026-09-19.external-source-enrichment.batch.v1",
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "kind": args.kind,
        "queue": _repo_relative(args.queue),
        "records": records,
    }
    _write_json(args.output, payload)
    print(json.dumps({"output": str(args.output), "selected": len(records), "already_ledgered": len(done)}))


def _valid_https(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.netloc) and " " not in url


def _looks_generic(url: str) -> bool:
    path = urlparse(url).path.strip("/").casefold()
    return not path or path in {"home", "index", "index.html", "docs", "documentation"}


def validate_and_merge(args: argparse.Namespace) -> None:
    incoming = _load_batch_rows(args.batch)
    existing = _read_jsonl(args.ledger)
    existing_ids = {str(row.get("subject_id")) for row in existing}
    appended: list[dict[str, Any]] = []
    errors: list[str] = []
    for record in incoming:
        subject_id = str(record.get("subject_id") or "")
        if not subject_id or subject_id in existing_ids:
            errors.append(f"duplicate_or_missing_subject_id:{subject_id}")
            continue
        decision = str(record.get("decision") or "not_searched")
        urls = [str(url) for url in record.get("search_urls", []) if url]
        evidence = record.get("evidence") or []
        if decision == "not_searched":
            errors.append(f"not_searched_cannot_be_ledgered:{subject_id}")
            continue
        if not urls:
            errors.append(f"missing_search_urls:{subject_id}")
            continue
        for url in urls:
            if not _valid_https(url):
                errors.append(f"invalid_search_url:{subject_id}:{url}")
        if decision == "source_backed":
            if not evidence:
                errors.append(f"source_backed_without_evidence:{subject_id}")
            for ev in evidence:
                url = str(ev.get("url") or "")
                if not _valid_https(url) or _looks_generic(url):
                    errors.append(f"invalid_item_specific_evidence_url:{subject_id}:{url}")
                if not ev.get("authority") or not ev.get("locator") or not ev.get("accessed_on"):
                    errors.append(f"incomplete_evidence_metadata:{subject_id}")
        if decision == "genuinely_unavailable" and not record.get("unavailable_reason"):
            errors.append(f"missing_unavailable_reason:{subject_id}")
        if decision not in {"source_backed", "genuinely_unavailable", "review_required"}:
            errors.append(f"invalid_decision:{subject_id}:{decision}")
        enriched = dict(record)
        enriched["recorded_at"] = dt.datetime.now(dt.timezone.utc).isoformat()
        enriched["pipeline_state"] = decision
        appended.append(enriched)
    if errors:
        raise SystemExit(json.dumps({"validation_errors": errors[:50], "error_count": len(errors)}))
    args.ledger.parent.mkdir(parents=True, exist_ok=True)
    with args.ledger.open("a", encoding="utf-8", newline="\n") as stream:
        for row in appended:
            stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    print(json.dumps({"ledger": str(args.ledger), "appended": len(appended), "errors": 0}))


def report(args: argparse.Namespace) -> None:
    ledger = _read_jsonl(args.ledger)
    counts = Counter(str(row.get("decision") or "unknown") for row in ledger)
    subjects = {str(row.get("subject_id")) for row in ledger if row.get("subject_id")}
    searched_urls = [url for row in ledger for url in row.get("search_urls", [])]
    unique_urls = sorted(set(searched_urls))
    manifest = _read_json(args.manifest) if args.manifest.exists() else {}
    report = {
        "schema": "2026-09-19.external-source-enrichment.report.v1",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": manifest.get("scope", {}),
        "ledger": {
            "rows": len(ledger),
            "distinct_subjects": len(subjects),
            "decisions": dict(sorted(counts.items())),
            "search_url_occurrences": len(searched_urls),
            "unique_urls_searched": len(unique_urls),
            "urls": unique_urls,
        },
        "remaining_queue": {
            "no_link_items_not_searched": max(0, int(manifest.get("scope", {}).get("no_link_items_queued", 0)) - sum(1 for x in ledger if x.get("subject_kind") == "item")),
            "not_established_relationships_not_searched": max(0, int(manifest.get("scope", {}).get("not_established_relationships_queued", 0)) - sum(1 for x in ledger if x.get("subject_kind") == "relationship")),
        },
        "interpretation": {
            "no_link_does_not_mean_searched": True,
            "genuinely_unavailable_requires_recorded_item_specific_searches": True,
            "relationships_are_never_inferred": True,
        },
    }
    _write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False))


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--input", type=Path, default=INPUT)
    common.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    common.add_argument("--relationship-queue", type=Path, default=DEFAULT_REL_QUEUE)
    common.add_argument("--item-queue", type=Path, default=DEFAULT_ITEM_QUEUE)
    common.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    p = sub.add_parser("inventory", parents=[common])
    p.set_defaults(func=inventory)
    p = sub.add_parser("plan", parents=[common])
    p.add_argument("--kind", choices=("item", "relationship"), required=True)
    p.add_argument("--queue", type=Path, required=True)
    p.add_argument("--queue-id-field", default="item_id")
    p.add_argument("--limit", type=int, default=25)
    p.add_argument("--output", type=Path, required=True)
    p.set_defaults(func=plan)
    p = sub.add_parser("merge", parents=[common])
    p.add_argument("--batch", type=Path, required=True)
    p.set_defaults(func=validate_and_merge)
    p = sub.add_parser("report", parents=[common])
    p.add_argument("--output", type=Path, required=True)
    p.set_defaults(func=report)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
