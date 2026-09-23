"""Build a resumable, relationship-only reconciliation of the canonical queue.

This pass consumes the canonical relationship backlog and existing append-only
relationship ledgers. It does not fetch new sources, infer endpoints, promote
edges, or touch catalogue, seed, SQL, UI, or student-facing data.

The output ledger is append-only and one-record-per-canonical-ID. Each record
retains inventory source references plus any URLs, locators, queries, and
evidence entries found in earlier relationship ledgers. A checkpoint is saved
after every appended record so the pass can resume safely.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
AGENT = AUDIT / "external_enrichment_agent"
INVENTORY = AUDIT / "relationship_backlog_inventory.json"
TAG = "relationship_quality_scaling_lane_20260923"
SELECTION = AGENT / f"{TAG}_selection.json"
CHECKPOINT = AGENT / f"{TAG}_checkpoint.json"
LEDGER = AGENT / f"{TAG}_append_only_ledger.jsonl"
REPORT = AGENT / f"{TAG}_report.json"
REPORT_MD = AGENT / f"{TAG}_report.md"

FINAL_DECISION = "review_required"
FINAL_STATE = "remain_unestablished"
SCOPE_GUARD = "Relationship evidence only; no item, catalogue, SQL, seed, UI, or student-data writes."


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def norm_id(value: object) -> str:
    """Normalize historical relationship ID spellings to inventory shape."""

    value = str(value or "")
    if value.startswith("relationship|"):
        value = value[len("relationship|") :]

    # Old tranches encoded a null target as |None|None or ended in |missing.
    value = re.sub(r"\|None\|None$", "|||not_established", value)
    for alias in ("missing", "unresolved", "review_only", "review-required"):
        if value.endswith(f"|{alias}"):
            value = f"{value[: -len(alias) - 1]}|||not_established"
            break

    # A small historical subset encoded an unresolved candidate in the target
    # key and omitted the empty target-type field.
    for alias in ("unresolved-works_with-c", "unresolved-builds_on-c"):
        if value.endswith(f"|{alias}"):
            value = f"{value[: -len(alias) - 1]}||{alias}|not_established"
            break
    return value


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def historical_ledger_paths() -> list[Path]:
    patterns = (
        "relationship_quality_lane_*_20260923_append_only_ledger.jsonl",
        "relationship_quality_missing_canonical_20260923_append_only_ledger.jsonl",
        "full_population_relationship_tranche_*_search_ledger_*.jsonl",
    )
    paths: set[Path] = set()
    for pattern in patterns:
        paths.update(AGENT.glob(pattern))
    return sorted(paths, key=lambda path: path.name)


def source_url(value: object) -> str:
    return str(value or "").strip()


def is_candidate_only_url(url: str) -> bool:
    lowered = url.casefold()
    return any(
        token in lowered
        for token in (
            "google.com/search",
            "bing.com/search",
            "search?",
        )
    )


def is_generic_context_url(url: str) -> bool:
    lowered = url.casefold().rstrip("/")
    return (
        "esco.ec.europa.eu/en/use-esco" in lowered
        or lowered in {"https://www.onetcenter.org/database.html", "https://www.onetcenter.org"}
    )


def evidence_is_item_specific(entry: dict[str, Any]) -> bool:
    """Conservatively identify retained item-specific candidate evidence.

    Context/taxonomy landing pages and search routes are intentionally excluded.
    This is an evidence-retention metric, not a promotion test.
    """

    url = source_url(entry.get("url"))
    if not url.startswith("https://") or is_candidate_only_url(url) or is_generic_context_url(url):
        return False
    if str(entry.get("link_role") or "").casefold() in {
        "candidate-only",
        "prior-context-evidence",
        "relationship-context evidence",
    }:
        return False
    return bool(str(entry.get("locator") or "").strip())


def add_unique(items: list[Any], seen: set[str], value: Any, key: str) -> None:
    marker = key or json.dumps(value, ensure_ascii=False, sort_keys=True)
    if marker not in seen:
        seen.add(marker)
        items.append(value)


def build_history(inventory_ids: set[str]) -> tuple[dict[str, list[dict[str, Any]]], dict[str, Any]]:
    by_id: dict[str, list[dict[str, Any]]] = defaultdict(list)
    total_rows = 0
    files: list[str] = []
    extras: set[str] = set()
    for path in historical_ledger_paths():
        files.append(path.name)
        for row in read_jsonl(path):
            total_rows += 1
            candidate = row.get("canonical_id") or row.get("normalized_row_id") or row.get("candidate_id") or row.get("row_id")
            canonical = norm_id(candidate)
            if canonical in inventory_ids:
                by_id[canonical].append({"file": path.name, "row": row})
            elif canonical:
                extras.add(canonical)
    return by_id, {
        "historical_ledger_files": files,
        "historical_ledger_rows": total_rows,
        "historical_unique_canonical_ids": len(set(by_id)),
        "historical_extra_ids": len(extras),
    }


def merge_record(inventory_row: dict[str, Any], history: list[dict[str, Any]], ordinal: int) -> dict[str, Any]:
    canonical_id = norm_id(inventory_row["candidate_id"])
    source_references: list[dict[str, Any]] = []
    source_reference_keys: set[str] = set()
    retained_evidence: list[dict[str, Any]] = []
    retained_evidence_keys: set[str] = set()
    retained_urls: list[str] = []
    retained_url_keys: set[str] = set()
    retained_locators: list[Any] = []
    retained_locator_keys: set[str] = set()
    search_queries: list[str] = []
    search_query_keys: set[str] = set()
    input_files: list[str] = []
    input_file_keys: set[str] = set()
    historical_decisions: Counter[str] = Counter()

    for reference in inventory_row.get("source_references") or []:
        if not isinstance(reference, dict):
            continue
        url = source_url(reference.get("url"))
        marker = json.dumps(reference, ensure_ascii=False, sort_keys=True)
        add_unique(source_references, source_reference_keys, reference, marker)
        if url:
            add_unique(retained_urls, retained_url_keys, url, url)
        for locator in reference.get("sourceLocators") or []:
            marker = json.dumps(locator, ensure_ascii=False, sort_keys=True)
            add_unique(retained_locators, retained_locator_keys, locator, marker)

    for item in history:
        filename = item["file"]
        row = item["row"]
        add_unique(input_files, input_file_keys, filename, filename)
        decision = str(row.get("decision") or row.get("relationship_status") or "")
        if decision:
            historical_decisions[decision] += 1
        for query in row.get("search_queries") or row.get("queries") or []:
            query = str(query).strip()
            add_unique(search_queries, search_query_keys, query, query)
        for url_value in row.get("source_urls") or []:
            url = source_url(url_value)
            if url:
                add_unique(retained_urls, retained_url_keys, url, url)
        raw_locator = row.get("source_locator") or row.get("source_locators")
        if raw_locator:
            marker = json.dumps(raw_locator, ensure_ascii=False, sort_keys=True) if not isinstance(raw_locator, str) else raw_locator
            add_unique(retained_locators, retained_locator_keys, raw_locator, marker)
        evidence = row.get("evidence") or []
        if isinstance(evidence, dict):
            evidence = [evidence]
        if isinstance(evidence, list):
            for entry in evidence:
                if not isinstance(entry, dict):
                    continue
                retained = dict(entry)
                retained["retained_from_ledger"] = filename
                url = source_url(retained.get("url"))
                marker = json.dumps({key: value for key, value in retained.items() if key != "retained_from_ledger"}, ensure_ascii=False, sort_keys=True)
                add_unique(retained_evidence, retained_evidence_keys, retained, marker)
                if url:
                    add_unique(retained_urls, retained_url_keys, url, url)

    to_name = inventory_row.get("to_name") or inventory_row.get("to_item_key")
    has_untyped_candidate = bool(to_name or inventory_row.get("to_item_key")) and not inventory_row.get("to_item_type")
    candidate_status = "endpoint_candidate_only" if has_untyped_candidate else "unresolved_target_endpoint"
    item_specific = [entry for entry in retained_evidence if evidence_is_item_specific(entry)]
    promotable = False

    return {
        "record_type": "relationship_quality_scaling_review",
        "batch": TAG,
        "ordinal": ordinal,
        "canonical_id": canonical_id,
        "context": {
            "level": inventory_row.get("context_level"),
            "key": inventory_row.get("context_key"),
        },
        "from": {
            "type": inventory_row.get("from_item_type"),
            "key": inventory_row.get("from_item_key"),
            "name": inventory_row.get("from_name"),
        },
        "to": {
            "type": inventory_row.get("to_item_type"),
            "key": inventory_row.get("to_item_key"),
            "name": inventory_row.get("to_name"),
        },
        "candidate_relationship_type": inventory_row.get("relationship_type"),
        "candidate_status": candidate_status,
        "search_attempted": bool(history),
        "search_queries": search_queries,
        "historical_decisions": dict(sorted(historical_decisions.items())),
        "source_ledger_files": input_files,
        "retained_source_references": source_references,
        "retained_evidence": retained_evidence,
        "retained_urls": retained_urls,
        "retained_locators": retained_locators,
        "evidence_counts": {
            "inventory_context_source_references": len(source_references),
            "retained_evidence_entries": len(retained_evidence),
            "item_specific_candidate_evidence_entries": len(item_specific),
            "retained_urls": len(retained_urls),
            "retained_locators": len(retained_locators),
        },
        "decision": FINAL_DECISION,
        "final_state": FINAL_STATE,
        "promotable": promotable,
        "promotion_performed": False,
        "decision_reason": (
            "The canonical inventory has no typed target endpoint and no exact same-context edge proof. "
            "Retained source material may support review or candidate discovery, but does not promote builds_on or works_with."
        ),
        "limitation": (
            "No relationship was inferred from role/tool co-occurrence, taxonomy association, product documentation, "
            "separate endpoint definitions, or unresolved target names."
        ),
        "access_date": "2026-09-23",
        "scope_guard": SCOPE_GUARD,
    }


def load_existing_records() -> tuple[dict[str, dict[str, Any]], int]:
    records: dict[str, dict[str, Any]] = {}
    duplicate_rows = 0
    for row in read_jsonl(LEDGER):
        canonical = norm_id(row.get("canonical_id") or row.get("normalized_row_id") or row.get("candidate_id"))
        if not canonical:
            continue
        if canonical in records:
            duplicate_rows += 1
        records[canonical] = row
    return records, duplicate_rows


def ledger_sha256() -> str:
    digest = hashlib.sha256()
    with LEDGER.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def save_checkpoint(
    *,
    status: str,
    total: int,
    saved: int,
    last_record: dict[str, Any] | None = None,
    duplicate_rows: int = 0,
    history_summary: dict[str, Any] | None = None,
) -> None:
    checkpoint = {
        "schema": "2026-09-23.relationship-quality-scaling-checkpoint.v1",
        "batch": TAG,
        "status": status,
        "selection_count": total,
        "saved_count": saved,
        "remaining_count": total - saved,
        "last_saved_ordinal": last_record.get("ordinal") if last_record else None,
        "last_saved_id": last_record.get("canonical_id") if last_record else None,
        "last_record_sha256": hashlib.sha256(
            json.dumps(last_record, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
        ).hexdigest()
        if last_record
        else None,
        "duplicate_rows_in_resume_ledger": duplicate_rows,
        "updated_at": now_iso(),
        "scope_guard": SCOPE_GUARD,
    }
    if history_summary:
        checkpoint["history_summary"] = history_summary
    write_json(CHECKPOINT, checkpoint)


def render_markdown(report: dict[str, Any]) -> str:
    counts = report["counts"]
    history = report["historical_reconciliation"]
    evidence = report["evidence_retention"]
    lines = [
        f"# {TAG}",
        "",
        "Relationship evidence only. This scaling-lane report reconciles the canonical backlog against existing append-only relationship ledgers.",
        "No relationship, catalogue, SQL, seed, UI, or student-facing data was changed.",
        "",
        "## Exact reconciliation",
        "",
        f"- Canonical inventory rows: **{counts['canonical_inventory_rows']}**",
        f"- Canonical IDs saved in scaling ledger: **{counts['canonical_records_saved']}**",
        f"- Canonical IDs missing after save: **{counts['canonical_missing_after']}**",
        f"- Duplicate rows in scaling ledger: **{counts['scaling_ledger_duplicate_rows']}**",
        f"- Promotable: **{counts['promotable']}**",
        f"- Remain unestablished: **{counts['remain_unestablished']}**",
        f"- Review required: **{counts['review_required']}**",
        "",
        "## Candidate disposition",
        "",
        f"- Endpoint-name candidates without typed target endpoints: **{counts['endpoint_candidate_only']}**",
        f"- Rows with no target endpoint: **{counts['unresolved_target_endpoint']}**",
        "- No candidate was promoted. All retained candidates remain audit/review-only.",
        "",
        "## Retained source evidence",
        "",
        f"- Records with retained inventory context references: **{evidence['records_with_inventory_context_references']}**",
        f"- Records with retained item-specific candidate evidence: **{evidence['records_with_item_specific_candidate_evidence']}**",
        f"- Retained evidence entries: **{evidence['retained_evidence_entries']}**",
        f"- Retained URLs: **{evidence['retained_urls']}**",
        f"- Retained locators: **{evidence['retained_locators']}**",
        "",
        "Item-specific candidate evidence is a conservative retention metric: search routes and generic ESCO/O*NET landing pages are excluded. It is not an approval or promotion signal.",
        "",
        "## Historical ledger reconciliation",
        "",
        f"- Existing 2026-09-23 quality-lane canonical coverage before this pass: **{history['quality_lane_canonical_covered_before']} / {counts['canonical_inventory_rows']}**",
        f"- Missing canonical IDs processed by the targeted ledger: **{history['targeted_missing_canonical_processed']}**",
        f"- Existing targeted-ledger rows, including its one overlap: **{history['targeted_ledger_rows']}**",
        f"- Historical ledger rows read: **{history['historical_ledger_rows']}**",
        f"- Historical IDs outside the canonical inventory: **{history['historical_extra_ids']}**",
        "",
        "## Artifacts",
        "",
        f"- Append-only detail ledger: `{Path(report['ledger_file']).name}`",
        f"- Per-record selection: `{Path(report['selection_file']).name}`",
        f"- Checkpoint: `{Path(report['checkpoint_file']).name}`",
        f"- JSON report with per-ID retained URLs/locators: `{Path(report['report_file']).name}`",
        "",
        "The final state is deliberately not student data: `review_required` / `remain_unestablished` with `promotable: false` for every canonical ID.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    inventory = read_json(INVENTORY)
    inventory_rows = inventory.get("rows") or []
    inventory_by_id = {norm_id(row["candidate_id"]): row for row in inventory_rows}
    if len(inventory_by_id) != len(inventory_rows):
        raise RuntimeError("Canonical inventory contains duplicate normalized IDs")
    inventory_ids = set(inventory_by_id)

    history_by_id, history_summary = build_history(inventory_ids)
    quality_lane_ids = set()
    quality_lane_rows = 0
    targeted_rows = 0
    targeted_canonical_ids: set[str] = set()
    for path in sorted(AGENT.glob("relationship_quality_lane_*_20260923_append_only_ledger.jsonl")):
        for row in read_jsonl(path):
            quality_lane_rows += 1
            quality_lane_ids.add(norm_id(row.get("canonical_id") or row.get("normalized_row_id") or row.get("row_id")))
    targeted_path = AGENT / "relationship_quality_missing_canonical_20260923_append_only_ledger.jsonl"
    for row in read_jsonl(targeted_path):
        targeted_rows += 1
        targeted_canonical_ids.add(norm_id(row.get("canonical_id") or row.get("candidate_id") or row.get("row_id")))
    history_summary.update(
        {
            "quality_lane_rows": quality_lane_rows,
            "quality_lane_canonical_covered_before": len(quality_lane_ids & inventory_ids),
            "targeted_ledger_rows": targeted_rows,
            "targeted_missing_canonical_processed": len(targeted_canonical_ids & (inventory_ids - quality_lane_ids)),
        }
    )

    selection = {
        "schema": "2026-09-23.relationship-quality-scaling-selection.v1",
        "batch": TAG,
        "inventory_total": len(inventory_rows),
        "selection_count": len(inventory_rows),
        "order": inventory.get("selection", {}).get("order"),
        "rows": [
            {
                "canonical_id": canonical,
                "context_level": row.get("context_level"),
                "context_key": row.get("context_key"),
                "from_item_type": row.get("from_item_type"),
                "from_item_key": row.get("from_item_key"),
                "to_item_type": row.get("to_item_type"),
                "to_item_key": row.get("to_item_key"),
                "to_name": row.get("to_name"),
            }
            for canonical, row in sorted(inventory_by_id.items())
        ],
        "scope_guard": SCOPE_GUARD,
    }
    if not SELECTION.exists():
        write_json(SELECTION, selection)

    existing, duplicate_rows = load_existing_records()
    save_checkpoint(
        status="in_progress" if len(existing) < len(inventory_rows) else "resuming_complete",
        total=len(inventory_rows),
        saved=len(existing),
        duplicate_rows=duplicate_rows,
        history_summary=history_summary,
    )

    ordinal = len(existing)
    for canonical_id in sorted(inventory_by_id):
        if canonical_id in existing:
            continue
        ordinal += 1
        record = merge_record(inventory_by_id[canonical_id], history_by_id.get(canonical_id, []), ordinal)
        payload = json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n"
        with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        existing[canonical_id] = record
        save_checkpoint(
            status="in_progress",
            total=len(inventory_rows),
            saved=len(existing),
            last_record=record,
            duplicate_rows=duplicate_rows,
            history_summary=history_summary,
        )

    if set(existing) != inventory_ids:
        raise RuntimeError(f"Scaling ledger reconciliation failed: {len(existing)} / {len(inventory_ids)}")

    records = [existing[key] for key in sorted(existing)]
    item_specific_records = sum(bool(row["evidence_counts"]["item_specific_candidate_evidence_entries"]) for row in records)
    retained_evidence_entries = sum(row["evidence_counts"]["retained_evidence_entries"] for row in records)
    retained_urls = sum(row["evidence_counts"]["retained_urls"] for row in records)
    retained_locators = sum(row["evidence_counts"]["retained_locators"] for row in records)
    endpoint_candidates = sum(row["candidate_status"] == "endpoint_candidate_only" for row in records)
    unresolved_targets = sum(row["candidate_status"] == "unresolved_target_endpoint" for row in records)
    report = {
        "schema": "2026-09-23.relationship-quality-scaling-report.v1",
        "batch": TAG,
        "status": "completed",
        "scope_guard": SCOPE_GUARD,
        "counts": {
            "canonical_inventory_rows": len(inventory_rows),
            "canonical_records_saved": len(records),
            "canonical_missing_after": len(inventory_ids - set(existing)),
            "scaling_ledger_duplicate_rows": duplicate_rows,
            "promotable": 0,
            "remain_unestablished": len(records),
            "review_required": len(records),
            "endpoint_candidate_only": endpoint_candidates,
            "unresolved_target_endpoint": unresolved_targets,
        },
        "evidence_retention": {
            "records_with_inventory_context_references": sum(bool(row["retained_source_references"]) for row in records),
            "records_with_item_specific_candidate_evidence": item_specific_records,
            "retained_evidence_entries": retained_evidence_entries,
            "retained_urls": retained_urls,
            "retained_locators": retained_locators,
            "metric_note": "Item-specific candidate evidence excludes search routes and generic ESCO/O*NET landing pages; it is not promotion proof.",
        },
        "historical_reconciliation": history_summary,
        "promotion_gate": {
            "promoted": False,
            "required": "Both typed endpoints, same context, exact relationship type, authoritative URL, locator, and access date.",
            "reason": "All 2,305 canonical unresolved rows lack a typed target endpoint in the canonical inventory.",
        },
        "ledger_sha256": ledger_sha256(),
        "ledger_file": LEDGER.name,
        "selection_file": SELECTION.name,
        "checkpoint_file": CHECKPOINT.name,
        "report_file": REPORT.name,
        "record_summaries": [
            {
                "canonical_id": row["canonical_id"],
                "context": row["context"],
                "from": row["from"],
                "to": row["to"],
                "candidate_status": row["candidate_status"],
                "decision": row["decision"],
                "final_state": row["final_state"],
                "promotable": row["promotable"],
                "retained_urls": row["retained_urls"],
                "retained_locators": row["retained_locators"],
            }
            for row in records
        ],
    }
    write_json(REPORT, report)
    REPORT_MD.write_text(render_markdown(report), encoding="utf-8")
    save_checkpoint(
        status="completed",
        total=len(inventory_rows),
        saved=len(records),
        last_record=records[-1] if records else None,
        duplicate_rows=duplicate_rows,
        history_summary=history_summary,
    )
    print(json.dumps({"status": report["status"], "counts": report["counts"], "ledger_sha256": report["ledger_sha256"]}, indent=2))


if __name__ == "__main__":
    main()
