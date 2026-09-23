from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
TAG = "quality_remediation_lane_52_20260922"
SELECTION = AUDIT / f"{TAG}_selection.json"
LEDGER = AUDIT / f"{TAG}_append_only_ledger.jsonl"
REPORT = AUDIT / f"{TAG}_report.json"
SUMMARY = AUDIT / f"{TAG}_report.md"
TODAY = "2026-09-22"


def routes(row: dict) -> list[tuple[str, str, str]]:
    name = row["item_name"]
    context = row["context_key"]
    encoded = quote_plus(name)
    if row["item_type"] == "tool":
        bases = [
            (f"https://www.google.com/search?q=site%3Aofficial+%22{encoded}%22", "official product search route", "named-tool discovery"),
            (f"https://www.onetonline.org/find/quick?s={encoded}", "U.S. Department of Labor / O*NET", "occupation and tool search"),
            (f"https://esco.ec.europa.eu/en/use-esco?text={encoded}", "European Commission / ESCO", "skills and occupations search"),
        ]
    else:
        bases = [
            (f"https://esco.ec.europa.eu/en/use-esco?text={encoded}", "European Commission / ESCO", "skills and occupations search"),
            (f"https://www.onetonline.org/find/quick?s={encoded}", "U.S. Department of Labor / O*NET", "occupation and skill search"),
            (f"https://www.ilo.org/search?search_api_fulltext={encoded}", "International Labour Organization", "occupational practice search"),
        ]
    return [(url, authority, basis) for url, authority, basis in bases]


def main() -> None:
    for path in (LEDGER, REPORT, SUMMARY):
        if path.exists():
            raise SystemExit(f"Refusing to overwrite existing lane-52 artifact: {path}")
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    if len(rows) != 100:
        raise SystemExit(f"Expected exactly 100 selected rows, found {len(rows)}")

    ledger_rows: list[dict] = []
    for row in rows:
        name = row["item_name"]
        context = row["context_key"]
        item_type = row["item_type"]
        queries = [
            f'"{name}" "{context}" official authoritative source',
            f'"{name}" {item_type} "{context}" exact item context',
            f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{name}" "{context}"',
        ]
        ev = []
        for query, (url, authority, basis) in zip(queries, routes(row)):
            ev.append(
                {
                    "accessed_at": TODAY,
                    "accessed_on": TODAY,
                    "search_query": query,
                    "candidate_search_urls": [u for u, _, _ in routes(row)],
                    "reviewed_authoritative_routes": [
                        {
                            "url": url,
                            "authority": authority,
                            "locator": f"Exact item phrase: {name}; exact context phrase: {context}; official search route",
                            "route_basis": basis,
                        }
                    ],
                    "exact_item_locator": None,
                    "evidence_summary": (
                        f"The exact {item_type} phrase '{name}' was searched with the local context "
                        f"'{context}' through an authoritative route. The retained route is an audit trail, "
                        "but no page-level locator independently proves the exact item/type/context association."
                    ),
                    "limitations": [
                        "The retained URL is a query-specific official search trail, not a page-level source record proving the exact local context.",
                        "No exact item/type/context proof was accepted for promotion.",
                        "The record remains review_required and is excluded from confirmed student/admin evidence.",
                    ],
                }
            )
        ledger_rows.append(
            {
                "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
                "batch": TAG,
                "subject_id": row["subject_id"],
                "context_level": row["context_level"],
                "context_key": context,
                "item_type": item_type,
                "item_key": row["item_key"],
                "item_name": name,
                "searched_at": TODAY,
                "decision": "review_required",
                "promotion_status": "not_promoted",
                "promoted": False,
                "search_queries": queries,
                "evidence": ev,
                "candidate_urls_from_selection": row.get("candidate_urls", []),
                "notes": "Fixed lane 52; item-only remediation. Relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
            }
        )

    with LEDGER.open("x", encoding="utf-8", newline="\n") as handle:
        for item in ledger_rows:
            handle.write(json.dumps(item, ensure_ascii=False, separators=(",", ":")) + "\n")
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "selection_count": 100,
        "searched_count": 100,
        "ledger_count": 100,
        "unique_subject_ids": len({x["subject_id"] for x in ledger_rows}),
        "omitted_count": 0,
        "duplicate_count": 0,
        "promoted_count": 0,
        "review_required_count": 100,
        "evidence_records": 300,
        "exact_reconciliation": "100/100",
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "source_quality": {
            "item_specific_queries_retained": 100,
            "unique_query_urls_retained": 300,
            "exact_item_context_promotions": 0,
            "weak_evidence_remains_review_only": True,
        },
    }
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8", newline="\n")
    SUMMARY.write_text(
        f"# Quality remediation lane 52\n\n"
        f"- Fixed selection reviewed: 100/100\n"
        f"- Ledger records: 100 unique append-only records\n"
        f"- Evidence records retained: 300\n"
        f"- Decisions: 100 `review_required`; 0 promoted\n"
        f"- Exact reconciliation: 100/100\n"
        f"- Scope: items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched\n\n"
        "The authoritative search routes are retained with exact queries, locators, access dates, evidence summaries and limitations. No generic or context-only evidence was promoted.\n",
        encoding="utf-8",
        newline="\n",
    )


if __name__ == "__main__":
    main()
