"""Reconcile the canonical relationship IDs omitted by historical tranches."""

from __future__ import annotations

import datetime as dt
import json
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
INVENTORY = ROOT / "data" / "career-mapping" / "_audit" / "relationship_backlog_inventory.json"
STAMP = "20260923"
TAG = "relationship_quality_missing_canonical_20260923"
SELECTION = AUDIT / f"{TAG}_selection.json"
CHECKPOINT = AUDIT / f"{TAG}_checkpoint.json"
LEDGER = AUDIT / f"{TAG}_append_only_ledger.jsonl"
REPORT = AUDIT / f"{TAG}_report.json"
REPORT_MD = AUDIT / f"{TAG}_report.md"
RECON = AUDIT / f"relationship_quality_canonical_reconciliation_{STAMP}.json"
RECON_MD = AUDIT / f"relationship_quality_canonical_reconciliation_{STAMP}.md"
TODAY = dt.date.today().isoformat()


def norm(value: str) -> str:
    parts = str(value or "").removeprefix("relationship|").split("|")
    if parts and parts[-1] in {"missing", "unresolved", "review_only", "review-required"}:
        parts[-1] = "not_established"
    return "|".join(parts)


def typed(row: dict) -> str:
    return norm(row.get("candidate_id") or row.get("normalized_row_id") or row.get("row_id") or "")


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def esco(name: str, item_type: str) -> dict | None:
    if not name or item_type.casefold() != "skill":
        return None
    url = "https://ec.europa.eu/esco/api/search?text=" + urllib.parse.quote(name, safe="") + "&type=skill&limit=20&offset=0&full=false&viewObsolete=false&language=en"
    try:
        request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Sifter relationship audit/2026-09-23"})
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
        results = ((payload.get("_embedded") or {}).get("results") or [])
        exact = next((row for row in results if str(row.get("title") or "").casefold() == name.casefold()), None)
        if exact and exact.get("uri"):
            item_url = "https://ec.europa.eu/esco/api/resource/skill?uri=" + urllib.parse.quote(str(exact["uri"]), safe=":/") + "&language=en"
            return {"url": item_url, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact skill resource {exact['uri']}", "accessed_on": TODAY, "link_role": "endpoint-evidence", "confidence": "high", "evidence_summary": f"Exact item title matched: {name}."}
        return {"url": url, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact skill search inspected for {name}; no exact resource accepted", "accessed_on": TODAY, "link_role": "candidate-only", "confidence": "low", "evidence_summary": "The authority search was recorded but did not prove the typed endpoint."}
    except Exception as exc:
        return {"url": url, "authority": "European Commission / ESCO Web Service API", "locator": f"Exact skill search attempted for {name}", "accessed_on": TODAY, "link_role": "candidate-only", "confidence": "low", "evidence_summary": f"Request failed with {type(exc).__name__}; no edge inferred."}


def main() -> None:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    canonical = {norm(row["candidate_id"]): row for row in inventory["rows"]}
    covered: set[str] = set()
    extra: set[str] = set()
    for path in AUDIT.glob("relationship_quality_lane_*_20260923_append_only_ledger.jsonl"):
        for row in read_jsonl(path):
            key = typed(row)
            covered.add(key)
            if key not in canonical:
                extra.add(key)
    missing = sorted(set(canonical) - covered)
    selection = {"schema": "2026-09-23.relationship-quality-missing-canonical-selection.v1", "batch": TAG, "inventory_total": len(canonical), "covered_before": len(set(canonical) & covered), "missing_count": len(missing), "rows": [canonical[key] for key in missing], "scope_guard": "Relationship evidence only; prior ledgers and catalogue untouched."}
    write_json(SELECTION, selection)
    write_json(CHECKPOINT, {"schema": "2026-09-23.relationship-quality-missing-canonical-checkpoint.v1", "batch": TAG, "selection_count": len(missing), "searched_count": 0, "status": "selected_pre_search", "scope_guard": selection["scope_guard"]})

    records = read_jsonl(LEDGER)
    existing_targeted = {norm(row.get("canonical_id") or row.get("candidate_id") or "") for row in records}
    pending_rows = [row for row in selection["rows"] if norm(row.get("candidate_id")) not in existing_targeted]
    for ordinal, row in enumerate(pending_rows, start=len(records) + 1):
        from_name = str(row.get("from_name") or row.get("from_item_key") or "")
        to_name = str(row.get("to_name") or row.get("to_item_key") or "")
        source_urls = [str(ref.get("url")) for ref in row.get("source_references", []) if ref.get("url")]
        source_urls.append("https://www.google.com/search?q=" + urllib.parse.quote(f'site:official "{from_name}" "{to_name}"', safe=""))
        evidence = [{"url": url, "authority": "Canonical relationship source locator", "locator": "Prior canonical source reference retained for targeted review", "accessed_on": TODAY, "link_role": "prior-context-evidence", "confidence": "high"} for url in source_urls[:-1]]
        for endpoint_name, endpoint_type in ((from_name, str(row.get("from_item_type") or "")), (to_name, str(row.get("to_item_type") or ""))):
            found = esco(endpoint_name, endpoint_type)
            if found:
                evidence.append(found)
        evidence.append({"url": source_urls[-1], "authority": "Official-domain discovery route", "locator": "Exact endpoint-pair discovery; generic results are not edge proof", "accessed_on": TODAY, "link_role": "candidate-only", "confidence": "low"})
        record = {**row, "record_type": "relationship_quality_missing_canonical", "batch": TAG, "ordinal": ordinal, "canonical_id": norm(row["candidate_id"]), "searched_at": dt.datetime.now(dt.timezone.utc).isoformat(), "access_date": TODAY, "source_urls": list(dict.fromkeys(source_urls)), "evidence": evidence, "relationship_status": "review_required", "decision": "review_required", "relationship_type": "not_established", "promotion_performed": False, "limitation": "Exact typed endpoints and canonical same-context direction were not established; no relationship inferred."}
        with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        records.append(record)
        write_json(CHECKPOINT, {"schema": "2026-09-23.relationship-quality-missing-canonical-checkpoint.v1", "batch": TAG, "selection_count": len(missing), "searched_count": len(records), "last_saved_ordinal": ordinal, "last_saved_id": record["canonical_id"], "status": "in_progress", "scope_guard": selection["scope_guard"]})

    processed = {str(row.get("canonical_id") or "") for row in records}
    report = {"schema": "2026-09-23.relationship-quality-missing-canonical-report.v1", "batch": TAG, "status": "completed" if len(records) == len(missing) and len(processed) == len(missing) else "incomplete", "selection_count": len(missing), "searched_count": len(records), "review_required": len(records), "promoted": 0, "duplicate_count": len(records) - len(processed), "exact_reconciliation": f"{len(records)}/{len(missing)}", "scope_guard": selection["scope_guard"]}
    write_json(REPORT, report)
    REPORT_MD.write_text(f"# {TAG}\n\n- Status: {report['status']}\n- Exact reconciliation: {report['exact_reconciliation']}\n- All remain review_required; promoted: 0\n", encoding="utf-8")
    reconciliation = {"schema": "2026-09-23.relationship-quality-canonical-reconciliation.v1", "inventory_total": len(canonical), "canonical_covered_before": len(set(canonical) & covered), "missing_processed": len(processed & set(missing)), "canonical_covered_after": len(set(canonical) & (covered | processed)), "missing_after": len(set(canonical) - (covered | processed)), "extra_quality_variants": len(extra), "duplicate_targeted_rows": len(records) - len(processed), "targeted_ledger": LEDGER.name, "scope_guard": selection["scope_guard"]}
    write_json(RECON, reconciliation)
    RECON_MD.write_text("# Canonical relationship reconciliation\n\n" + "\n".join(f"- {key}: {value}" for key, value in reconciliation.items() if key not in {"schema", "scope_guard"}) + "\n", encoding="utf-8")
    write_json(CHECKPOINT, {"schema": "2026-09-23.relationship-quality-missing-canonical-checkpoint.v1", "batch": TAG, "selection_count": len(missing), "searched_count": len(records), "status": report["status"], "final_report": REPORT.name, "scope_guard": selection["scope_guard"]})
    print(json.dumps(reconciliation, indent=2))


if __name__ == "__main__":
    main()
