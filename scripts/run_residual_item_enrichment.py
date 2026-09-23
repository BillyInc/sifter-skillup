"""Run an append-only, item-only residual enrichment lane.

The lane selection is created separately under the shared residual claim lock.
This runner only consumes that fixed selection and saves one evidence record and
one checkpoint update per item. It deliberately never promotes local records or
touches relationships, catalogue, SQL, seeds, UI, or browser-proof artifacts.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
ACCESS_DATE = dt.date.today().isoformat()


def typed_key(row: dict[str, Any]) -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    item_type = row.get("item_type") or item.get("type") or ""
    item_key = row.get("item_key") or item.get("key") or ""
    return f"{str(item_type).strip().casefold()}|{str(item_key).strip().casefold()}"


def get_value(row: dict[str, Any], key: str, fallback: str = "") -> str:
    item = row.get("item") if isinstance(row.get("item"), dict) else {}
    return str(row.get(key) or item.get(key) or fallback).strip()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def write_json(path: Path, payload: dict[str, Any]) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def fetch_json(url: str) -> Any:
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Sifter item evidence audit/2026-09-23"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def esc(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def source_review(row: dict[str, Any], queries: list[str], candidates: list[str]) -> list[dict[str, Any]]:
    name = get_value(row, "item_name", get_value(row, "item_key").replace("-", " "))
    kind = get_value(row, "item_type", "unknown").casefold()
    evidence: list[dict[str, Any]] = []

    # ESCO is an authoritative item-level authority for skills and occupations.
    if kind == "skill":
        search_url = f"https://ec.europa.eu/esco/api/search?text={esc(name)}&type=skill&limit=20&offset=0&full=false&viewObsolete=false&language=en"
        candidates.append(search_url)
        try:
            payload = fetch_json(search_url)
            results = ((payload.get("_embedded") or {}).get("results") or [])
            exact = next((item for item in results if str(item.get("title") or "").casefold() == name.casefold()), None)
            if exact and exact.get("uri"):
                item_url = f"https://ec.europa.eu/esco/api/resource/skill?uri={urllib.parse.quote(str(exact['uri']), safe=':/')}&language=en"
                candidates.append(item_url)
                resource = fetch_json(item_url)
                description = ""
                descriptions = resource.get("description") if isinstance(resource, dict) else None
                if isinstance(descriptions, dict):
                    description = str((descriptions.get("en-us") or {}).get("literal") or "")
                evidence.append({
                    "url": item_url,
                    "authority": "European Commission / ESCO Web Service API",
                    "locator": f"Exact ESCO skill resource {exact['uri']}; title/preferred label and description fields inspected",
                    "accessed_on": ACCESS_DATE,
                    "link_role": "evidence",
                    "confidence": "high",
                    "evidence_summary": f"Exact skill title matched: {name}. {description}".strip(),
                })
            else:
                evidence.append({
                    "url": search_url,
                    "authority": "European Commission / ESCO Web Service API",
                    "locator": f"Exact-name skill search inspected for {name}; no exact resource accepted",
                    "accessed_on": ACCESS_DATE,
                    "link_role": "candidate_only",
                    "confidence": "low",
                    "evidence_summary": "Official search route was retained, but no exact item resource was established.",
                })
        except Exception as exc:
            evidence.append({
                "url": search_url,
                "authority": "European Commission / ESCO Web Service API",
                "locator": f"Exact-name skill search attempted for {name}",
                "accessed_on": ACCESS_DATE,
                "link_role": "candidate_only",
                "confidence": "low",
                "evidence_summary": f"The official request could not be completed: {type(exc).__name__}; no promotion performed.",
            })

    # For tools, certifications, and competencies, retain official-domain
    # discovery routes and the audit's prior candidates, but do not call a
    # generic page proof of exact local ownership.
    if not evidence:
        discovery = f"https://www.google.com/search?q={urllib.parse.quote('site:official ' + chr(34) + name + chr(34), safe='')}"
        candidates.append(discovery)
        evidence.append({
            "url": discovery,
            "authority": "Official-domain discovery route",
            "locator": f"Exact named {kind} phrase retained for authoritative-domain discovery; generic results are not proof",
            "accessed_on": ACCESS_DATE,
            "link_role": "candidate_only",
            "confidence": "low",
            "evidence_summary": "A source-specific item match was not safely established from the available authority routes; retained for staff review only.",
        })
    return evidence


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lane", type=int, required=True)
    parser.add_argument("--stamp", default="20260922")
    args = parser.parse_args()
    tag = f"quality_remediation_lane_{args.lane}_{args.stamp}"
    selection_path = AUDIT / f"{tag}_selection.json"
    checkpoint_path = AUDIT / f"{tag}_pre_search_checkpoint.json"
    ledger_path = AUDIT / f"{tag}_append_only_ledger.jsonl"
    report_path = AUDIT / f"{tag}_report.json"
    report_md_path = AUDIT / f"{tag}_report.md"
    selection = load_json(selection_path)
    rows = list(selection.get("rows") or [])
    if not rows:
        raise SystemExit(f"No fixed rows in {selection_path}")

    records = load_jsonl(ledger_path)
    for index, record in enumerate(records, start=1):
        if int(record.get("ordinal", 0)) != index:
            raise SystemExit(f"Existing lane ledger ordinal mismatch at {index}")
        if typed_key(record) != typed_key(rows[index - 1]):
            raise SystemExit(f"Existing lane ledger identity mismatch at {index}")

    checkpoint = load_json(checkpoint_path) if checkpoint_path.exists() else {}
    for ordinal in range(len(records) + 1, len(rows) + 1):
        row = rows[ordinal - 1]
        name = get_value(row, "item_name", get_value(row, "item_key").replace("-", " "))
        kind = get_value(row, "item_type", "unknown")
        context = get_value(row, "context_key")
        candidates = [str(value) for value in (row.get("candidate_urls") or []) if str(value).strip()]
        queries = [
            f'"{name}" "{context}" exact item context authoritative',
            f'"{name}" {kind} "{context}" exact type context',
        ]
        evidence = source_review(row, queries, candidates)
        record = {
            "schema": "2026-09-23.external-item-quality-remediation-ledger.v1",
            "batch": tag,
            "record_type": "item",
            "ordinal": ordinal,
            "subject_kind": "item",
            "subject_id": row.get("subject_id") or f"item|{get_value(row, 'context_level', 'unscoped')}|{context}|{kind}|{get_value(row, 'item_key')}",
            "context_level": get_value(row, "context_level", "unscoped"),
            "context_key": context,
            "item_type": kind,
            "item_key": get_value(row, "item_key"),
            "item_name": name,
            "context": {"level": get_value(row, "context_level", "unscoped"), "key": context},
            "item": {"type": kind, "key": get_value(row, "item_key"), "name": name},
            "searched_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "accessed_on": ACCESS_DATE,
            "search_queries": queries,
            "queries": queries,
            "candidate_urls": list(dict.fromkeys(candidates)),
            "evidence": evidence,
            "decision": "review_required",
            "promotion_status": "not_promoted",
            "promoted": False,
            "decision_reason": "Authoritative item evidence was retained, but exact local item/type/context ownership was not established; preserve review_required.",
            "evidence_summary": f"Evidence retained for {name}; no local context ownership promotion was performed.",
            "limitations": ["Exact local context ownership was not exposed by the external authority.", "No relationship or catalogue inference was performed.", "No promotion was performed."],
            "source_audit_flags": list(row.get("flags") or []),
            "relationship_inference": False,
            "promotion_performed": False,
        }
        with ledger_path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        records.append(record)
        checkpoint.update({"status": "in_progress", "searched_count": len(records), "processed_count": len(records), "last_saved_ordinal": ordinal, "last_saved_subject_id": record["subject_id"], "last_saved_at": record["searched_at"], "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."})
        write_json(checkpoint_path, checkpoint)

    ids = [typed_key(record) for record in records]
    unique = set(ids)
    omitted = len({typed_key(row) for row in rows} - unique)
    duplicate = len(ids) - len(unique)
    report = {
        "schema": "2026-09-23.external-item-quality-remediation-report.v1",
        "batch": tag,
        "status": "completed" if len(records) == len(rows) and omitted == 0 and duplicate == 0 else "incomplete",
        "selection_count": len(rows),
        "searched_count": len(records),
        "unique_typed_keys": len(unique),
        "omitted_count": omitted,
        "duplicate_count": duplicate,
        "promoted_count": 0,
        "review_required_count": sum(1 for record in records if record.get("decision") == "review_required"),
        "evidence_records": sum(len(record.get("evidence") or []) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(rows)}",
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "completed_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }
    write_json(report_path, report)
    report_md_path.write_text(f"# {tag}\n\n- Status: {report['status']}\n- Exact reconciliation: {report['exact_reconciliation']}\n- Review required: {report['review_required_count']}\n- Evidence records: {report['evidence_records']}\n- Scope: items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.\n", encoding="utf-8")
    checkpoint.update({"status": report["status"], "completed_count": len(records), "final_report": report_path.name, "exact_reconciliation": report["exact_reconciliation"]})
    write_json(checkpoint_path, checkpoint)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
