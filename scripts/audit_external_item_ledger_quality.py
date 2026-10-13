"""Audit external item-search ledgers for evidence quality before promotion.

This is read-only with respect to the catalogue and deployment artifacts.  It
summarises the append-only agent ledgers and emits a remediation queue for
records whose evidence is too broadly reused, incomplete, or insufficiently
searched to be treated as confirmed.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
OUT_JSON = LEDGER_DIR / "item_ledger_quality_audit_2026-09-22.json"
OUT_MD = LEDGER_DIR / "item_ledger_quality_audit_2026-09-22.md"


def urls_for(record: dict[str, Any]) -> list[str]:
    values = record.get("candidate_urls") or record.get("source_urls") or []
    if isinstance(values, str):
        values = [values]
    return sorted({str(value).strip() for value in values if str(value).strip()})


def typed_key(record: dict[str, Any]) -> str:
    item_type = str(record.get("item_type") or "unknown").strip().casefold()
    item_key = str(record.get("item_key") or record.get("item_name") or "").strip().casefold()
    return f"{item_type}|{item_key}"


def valid_https(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.netloc)


def main() -> None:
    records: list[dict[str, Any]] = []
    remediation_records: list[dict[str, Any]] = []
    files = 0
    for path in sorted(LEDGER_DIR.glob("*_search_ledger_2026-09-21.jsonl")):
        if "relationship" in path.name:
            continue
        files += 1
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            if record.get("record_type") == "item":
                records.append(record)

    remediation_paths = sorted(set(LEDGER_DIR.glob("*2026-09-22*.jsonl")) | set(LEDGER_DIR.glob("*20260922*.jsonl")))
    for path in remediation_paths:
        if "relationship" in path.name or "search_ledger_2026-09-21" in path.name:
            continue
        if "remediation" not in path.name and "lane3" not in path.name:
            continue
        # Lanes 13-16 were observed appending to reused filenames concurrently.
        # Preserve those artifacts for forensic review, but never count them as
        # valid remediation evidence until manually reconciled.
        if any(token in path.name for token in ("lane13", "lane14", "lane15", "lane16")):
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not record.get("item_type") or not record.get("item_key"):
                nested = record.get("item") if isinstance(record.get("item"), dict) else {}
                record = {
                    **record,
                    "item_type": record.get("item_type") or nested.get("type"),
                    "item_key": record.get("item_key") or nested.get("key"),
                    "item_name": record.get("item_name") or nested.get("name"),
                }
            if record.get("item_type") and record.get("item_key"):
                remediation_records.append(record)

    # Lane 21 deliberately used a JSON ledger rather than JSONL; accept it
    # only because its completion report supplies the exact 100↔100 parity.
    lane21_ledger = LEDGER_DIR / "quality_remediation_lane_21_20260922_ledger.json"
    if lane21_ledger.exists():
        payload = json.loads(lane21_ledger.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            remediation_records.extend(row for row in payload if isinstance(row, dict))
        elif isinstance(payload, dict):
            rows = payload.get("records") or payload.get("rows") or payload.get("ledger") or []
            remediation_records.extend(row for row in rows if isinstance(row, dict))

    url_to_typed: dict[str, set[str]] = defaultdict(set)
    for record in records:
        for url in urls_for(record):
            url_to_typed[url].add(typed_key(record))

    decisions = Counter(str(record.get("decision") or "unlabelled") for record in records)
    remediation: list[dict[str, Any]] = []
    missing_field_counts: Counter[str] = Counter()
    reasons = Counter()
    typed_keys: set[str] = set()

    for record in records:
        key = typed_key(record)
        typed_keys.add(key)
        urls = urls_for(record)
        flags: list[str] = []
        required = ("subject_id", "item_type", "item_key", "item_name", "searched_at", "accessed_on", "decision")
        for field in required:
            if not record.get(field):
                flags.append(f"missing_{field}")
                missing_field_counts[field] += 1
        if len(urls) < 2:
            flags.append("fewer_than_two_candidate_urls")
        if any(not valid_https(url) for url in urls):
            flags.append("invalid_https_candidate_url")
        evidence = record.get("evidence") or []
        if not evidence:
            flags.append("missing_evidence_block")
        for evidence_row in evidence:
            if not isinstance(evidence_row, dict):
                flags.append("malformed_evidence_block")
                continue
            if not valid_https(str(evidence_row.get("url") or "")):
                flags.append("invalid_https_evidence_url")
            for field in ("authority", "locator", "accessed_on"):
                if not evidence_row.get(field):
                    flags.append(f"missing_evidence_{field}")
        broad_urls = [url for url in urls if len(url_to_typed[url]) >= 20]
        if broad_urls:
            flags.append("source_reused_across_20_or_more_typed_items")
            for url in broad_urls:
                reasons[url] += 1
        if flags:
            for flag in set(flags):
                reasons[flag] += 1
            remediation.append(
                {
                    "subject_id": record.get("subject_id"),
                    "context_level": record.get("context_level"),
                    "context_key": record.get("context_key"),
                    "item_type": record.get("item_type"),
                    "item_key": record.get("item_key"),
                    "item_name": record.get("item_name"),
                    "decision": record.get("decision"),
                    "flags": sorted(set(flags)),
                    "candidate_urls": urls,
                }
            )

    reused = [
        {"url": url, "distinct_typed_items": len(keys)}
        for url, keys in sorted(url_to_typed.items(), key=lambda pair: (-len(pair[1]), pair[0]))
        if len(keys) >= 20
    ]
    payload = {
        "schema": "2026-09-22.external-item-ledger-quality-audit.v1",
        "generated": str(date.today()),
        "scope": {
            "ledger_files": files,
            "item_ledger_records": len(records),
            "distinct_typed_items": len(typed_keys),
        },
        "decisions": dict(decisions),
        "remediation_pass": {
            "ledger_records": len(remediation_records),
            "distinct_typed_items": len({typed_key(record) for record in remediation_records}),
            "decisions": dict(Counter(str(record.get("decision") or "unlabelled") for record in remediation_records)),
            "promoted": sum(1 for record in remediation_records if record.get("promoted") is True),
        },
        "quality": {
            "remediation_records": len(remediation),
            "missing_field_counts": dict(missing_field_counts),
            "reused_source_urls_at_or_above_20_items": len(reused),
            "reused_source_urls": reused[:100],
            "top_flag_counts": reasons.most_common(40),
        },
        "remediation_queue": remediation,
        "policy": {
            "linked_is_not_promoted_by_this_audit": True,
            "review_required_remains_internal_only": True,
            "source_reuse_is_a_follow_up_signal_not_proof_of_item_specific_evidence": True,
            "sql_catalogue_ui_and_browser_proof_touched": False,
        },
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# External item-ledger quality audit",
        "",
        f"Generated: {payload['generated']}",
        "",
        f"- Ledger files: **{files}**",
        f"- Item ledger records: **{len(records):,}**",
        f"- Distinct typed items: **{len(typed_keys):,}**",
        f"- Decisions: `{dict(decisions)}`",
        f"- Remediation records: **{len(remediation):,}**",
        f"- Reused URLs affecting at least 20 typed items: **{len(reused):,}**",
        "",
        "A remediation record is not a promotion or deletion instruction. It requires a fresh item-specific source review; broad, reused, or incomplete evidence remains review-only.",
        "",
        "SQL, catalogue rows, generated seeds, UI code, and browser proof were not changed.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": payload["scope"], "quality": payload["quality"]}, indent=2))


if __name__ == "__main__":
    main()
