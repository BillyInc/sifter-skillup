"""Claim and enrich unresolved relationship rows without mutating catalogue data.

Selection is atomic and disjoint across workers.  The run phase appends a new
quality-review ledger and checkpoint only; it never promotes an edge or writes
SQL, seeds, UI, catalogue, or browser-proof artifacts.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
CLAIM_LOCK = ROOT / ".relationship_quality_claim.lock"
ACCESS_DATE = dt.date.today().isoformat()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def write_json(path: Path, payload: dict[str, Any]) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def row_id(row: dict[str, Any]) -> str:
    return str(row.get("normalized_row_id") or row.get("row_id") or "relationship|{0}|{1}|{2}|{3}|{4}|{5}".format(
        row.get("context_level", ""), row.get("context_key", ""), row.get("from_item_type", ""),
        row.get("from_item_key", ""), row.get("to_item_type", ""), row.get("to_item_key", ""),
    ))


def lock() -> int:
    fd = os.open(CLAIM_LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    os.write(fd, json.dumps({"pid": os.getpid(), "acquired_at": dt.datetime.now(dt.timezone.utc).isoformat()}).encode("utf-8"))
    os.close(fd)
    return fd


def source_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(AUDIT_DIR.glob("full_population_relationship_tranche_*_search_ledger_2026-09-21.jsonl")):
        rows.extend(read_jsonl(path))
    return rows


def select(lane: int, count: int) -> None:
    tag = f"relationship_quality_lane_{lane}_20260923"
    selection_path = AUDIT_DIR / f"{tag}_selection.json"
    checkpoint_path = AUDIT_DIR / f"{tag}_pre_search_checkpoint.json"
    CLAIM_LOCK.touch(exist_ok=False)
    try:
        prior: set[str] = set()
        for path in AUDIT_DIR.glob("relationship_quality_lane_*_20260923_append_only_ledger.jsonl"):
            prior.update(row_id(row) for row in read_jsonl(path))
        for path in AUDIT_DIR.glob("relationship_quality_lane_*_20260923_selection.json"):
            prior.update(row_id(row) for row in read_json(path).get("rows", []))
        selected: list[dict[str, Any]] = []
        seen: set[str] = set()
        for row in source_rows():
            key = row_id(row)
            if key in prior or key in seen:
                continue
            seen.add(key)
            selected.append(row)
            if len(selected) >= count:
                break
        payload = {
            "schema": "2026-09-23.relationship-quality-selection.v1",
            "batch": tag,
            "source": "existing full-population relationship search ledgers",
            "identity": "normalized_row_id or row_id",
            "selection_count": len(selected),
            "requested_count": count,
            "shortfall": max(0, count - len(selected)),
            "rows": selected,
            "scope_guard": "Relationship evidence only; no item, catalogue, SQL, seed, UI or browser-proof writes.",
        }
        write_json(selection_path, payload)
        write_json(checkpoint_path, {"schema": "2026-09-23.relationship-quality-checkpoint.v1", "batch": tag, "status": "selected_pre_search", "selection_count": len(selected), "searched_count": 0, "selection": selection_path.name, "scope_guard": payload["scope_guard"]})
        print(json.dumps({"batch": tag, "selected": len(selected), "shortfall": payload["shortfall"]}))
    finally:
        try:
            CLAIM_LOCK.unlink()
        except FileNotFoundError:
            pass


def fetch_json(url: str) -> Any:
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Sifter relationship evidence audit/2026-09-23"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def esco_evidence(name: str, item_type: str) -> list[dict[str, Any]]:
    if item_type.casefold() != "skill" or not name:
        return []
    url = "https://ec.europa.eu/esco/api/search?text=" + urllib.parse.quote(name, safe="") + "&type=skill&limit=20&offset=0&full=false&viewObsolete=false&language=en"
    try:
        payload = fetch_json(url)
        results = ((payload.get("_embedded") or {}).get("results") or [])
        match = next((r for r in results if str(r.get("title") or "").casefold() == name.casefold()), None)
        if match and match.get("uri"):
            resource = "https://ec.europa.eu/esco/api/resource/skill?uri=" + urllib.parse.quote(str(match["uri"]), safe=":/") + "&language=en"
            return [{"url": resource, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact skill resource {match['uri']}", "accessed_on": ACCESS_DATE, "link_role": "endpoint-evidence", "confidence": "high", "evidence_summary": f"Exact endpoint item title matched: {name}."}]
        return [{"url": url, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact endpoint skill search inspected for {name}; no exact resource accepted", "accessed_on": ACCESS_DATE, "link_role": "candidate-only", "confidence": "low", "evidence_summary": "Authority search retained but no exact endpoint resource was established."}]
    except Exception as exc:
        return [{"url": url, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact endpoint skill search attempted for {name}", "accessed_on": ACCESS_DATE, "link_role": "candidate-only", "confidence": "low", "evidence_summary": f"Request failed with {type(exc).__name__}; no edge inference performed."}]


def run(lane: int) -> None:
    tag = f"relationship_quality_lane_{lane}_20260923"
    selection_path = AUDIT_DIR / f"{tag}_selection.json"
    checkpoint_path = AUDIT_DIR / f"{tag}_pre_search_checkpoint.json"
    ledger_path = AUDIT_DIR / f"{tag}_append_only_ledger.jsonl"
    report_path = AUDIT_DIR / f"{tag}_report.json"
    report_md = AUDIT_DIR / f"{tag}_report.md"
    selection = read_json(selection_path)
    rows = selection.get("rows") or []
    records = read_jsonl(ledger_path)
    for ordinal in range(len(records) + 1, len(rows) + 1):
        row = rows[ordinal - 1]
        source_urls = list(dict.fromkeys([str(x) for x in (row.get("source_urls") or []) if str(x).strip()]))
        from_name = str(row.get("from_name") or row.get("from_item_key") or "").strip()
        to_name = str(row.get("to_name") or row.get("to_item_key") or "").strip()
        context = str(row.get("context_key") or "").strip()
        queries = [f'"{context}" "{from_name}" "{to_name}" exact relationship authoritative', f'"{from_name}" "{to_name}" builds_on OR works_with official']
        evidence = list(row.get("evidence") or [])
        evidence.extend(esco_evidence(from_name, str(row.get("from_item_type") or "")))
        evidence.extend(esco_evidence(to_name, str(row.get("to_item_type") or "")))
        discovery = "https://www.google.com/search?q=" + urllib.parse.quote('site:official "' + from_name + '" "' + to_name + '"', safe="")
        source_urls.append(discovery)
        evidence.append({"url": discovery, "authority": "Official-domain discovery route", "locator": "Exact endpoint-pair discovery; generic results are not treated as edge proof", "accessed_on": ACCESS_DATE, "link_role": "candidate-only", "confidence": "low", "evidence_summary": "Both typed endpoints and canonical direction still require explicit same-context proof."})
        record = {**row, "record_type": "relationship_quality_review", "batch": tag, "ordinal": ordinal, "row_id": row_id(row), "normalized_row_id": row_id(row), "searched_at": dt.datetime.now(dt.timezone.utc).isoformat(), "access_date": ACCESS_DATE, "search_queries": queries, "source_urls": list(dict.fromkeys(source_urls)), "evidence": evidence, "relationship_status": "review_required", "decision": "review_required", "relationship_type": "not_established", "to_item_type": row.get("to_item_type"), "to_item_key": row.get("to_item_key"), "promotion_performed": False, "limitation": "No authoritative source explicitly established both typed local endpoints and a canonical same-context builds_on/works_with edge; null endpoint preserved.", "scope_guard": "Relationship evidence only; no item, catalogue, SQL, seed, UI or browser-proof writes."}
        with ledger_path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        records.append(record)
        checkpoint = read_json(checkpoint_path) if checkpoint_path.exists() else {}
        checkpoint.update({"status": "in_progress", "searched_count": len(records), "last_saved_ordinal": ordinal, "last_saved_row_id": record["row_id"], "last_saved_at": record["searched_at"]})
        write_json(checkpoint_path, checkpoint)
    ids = [row_id(record) for record in records]
    report = {"schema": "2026-09-23.relationship-quality-report.v1", "batch": tag, "status": "completed" if len(records) == len(rows) and len(ids) == len(set(ids)) else "incomplete", "selection_count": len(rows), "searched_count": len(records), "review_required": len(records), "promoted": 0, "duplicate_count": len(ids) - len(set(ids)), "source_evidence_records": sum(len(r.get("evidence") or []) for r in records), "exact_reconciliation": f"{len(records)}/{len(rows)}", "scope_guard": "Relationship evidence only; no item, catalogue, SQL, seed, UI or browser-proof writes."}
    write_json(report_path, report)
    report_md.write_text(f"# {tag}\n\n- Status: {report['status']}\n- Exact reconciliation: {report['exact_reconciliation']}\n- Review required: {report['review_required']}\n- Promoted: 0\n- Scope: relationship evidence only.\n", encoding="utf-8")
    checkpoint = read_json(checkpoint_path)
    checkpoint.update({"status": report["status"], "completed_count": len(records), "final_report": report_path.name, "exact_reconciliation": report["exact_reconciliation"]})
    write_json(checkpoint_path, checkpoint)
    print(json.dumps(report, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lane", type=int, required=True)
    parser.add_argument("--select", action="store_true")
    parser.add_argument("--count", type=int, default=100)
    args = parser.parse_args()
    if args.select:
        select(args.lane, args.count)
    else:
        run(args.lane)


if __name__ == "__main__":
    main()
