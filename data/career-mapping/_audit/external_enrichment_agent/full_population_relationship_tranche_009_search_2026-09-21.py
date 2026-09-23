"""Record exact-source evidence for relationship tranche 009.

The selected rows have missing target endpoints and missing typed edges. The
search records role-to-tool evidence and first-party item identity only; it
never invents a target endpoint or relationship type.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
SELECTION = OUT_DIR / "full_population_relationship_tranche_009_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_relationship_tranche_009_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_009_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_009_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_relationship_tranche_009_report_2026-09-21.json"
REPORT_MD = OUT_DIR / "full_population_relationship_tranche_009_report_2026-09-21.md"
ACCESS_DATE = "2026-09-21"
SEARCHED_AT = "2026-09-21T16:20:00+01:00"


def evidence(
    url: str,
    authority: str,
    locator: str,
    link_role: str,
    summary: str,
) -> dict[str, str]:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": ACCESS_DATE,
        "link_role": link_role,
        "confidence": "high",
        "evidence_summary": summary,
    }


ONET_BLOCKCHAIN = evidence(
    "https://www.onetonline.org/link/demand/15-1299.07",
    "O*NET OnLine / U.S. Department of Labor partner data",
    "Employer-Based In Demand Software Skills table for 15-1299.07, current page; Node.js is listed for Blockchain Engineers at 13% of linked 2025 U.S. postings.",
    "role_association",
    "O*NET establishes the Blockchain Engineers-to-Node.js role/software association, but the local row has no second typed endpoint or approved item-to-item edge.",
)
ONET_PROGRAMMER = evidence(
    "https://www.onetonline.org/link/demand/15-1251.00",
    "O*NET OnLine / U.S. Department of Labor partner data",
    "Employer-Based In Demand Software Skills table for 15-1251.00, current page; Git is listed for Computer Programmers at 6% of linked 2025 U.S. postings.",
    "role_association",
    "O*NET establishes the Computer Programmers-to-Git role/software association, but the local row has no second typed endpoint or approved item-to-item edge.",
)
ONET_SYSTEMS = evidence(
    "https://www.onetonline.org/link/demand/15-1299.08",
    "O*NET OnLine / U.S. Department of Labor partner data",
    "Employer-Based In Demand Software Skills table for 15-1299.08, current page; Amazon Web Services AWS CloudFormation is listed at 6% and Amazon Web Services AWS software at 31% of linked 2025 U.S. postings.",
    "role_association",
    "O*NET establishes the Computer Systems Engineers/Architects-to-AWS software associations, but the local rows have no second typed endpoints or approved item-to-item edges.",
)

ITEMS: dict[str, dict[str, object]] = {
    "node-js": {
        "queries": [
            'site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" "Node.js"',
            "site:nodejs.org/learn Node.js official learning documentation",
        ],
        "authorities": ["O*NET OnLine", "Node.js project"],
        "sources": [
            ONET_BLOCKCHAIN,
            evidence(
                "https://nodejs.org/learn",
                "Node.js project",
                "Node.js Learn documentation landing page; official learning and runtime documentation.",
                "item_documentation",
                "The Node.js project identifies the named software item and its official documentation, but does not name a second local endpoint or exact edge for this row.",
            ),
        ],
        "locator": "O*NET lists Node.js for 15-1299.07; Node.js Learn independently identifies the named software item.",
    },
    "git": {
        "queries": [
            'site:onetonline.org/link/demand/15-1251.00 "Computer Programmers" Git',
            "site:git-scm.com/doc Git official documentation",
        ],
        "authorities": ["O*NET OnLine", "Git project"],
        "sources": [
            ONET_PROGRAMMER,
            evidence(
                "https://git-scm.com/doc",
                "Git project",
                "Git documentation landing page; official distributed version-control documentation.",
                "item_documentation",
                "The Git project identifies the named software item and its documentation, but does not name a second local endpoint or exact edge for this row.",
            ),
        ],
        "locator": "O*NET lists Git for 15-1251.00; Git documentation independently identifies the named software item.",
    },
    "amazon-web-services-aws-cloudformation": {
        "queries": [
            'site:onetonline.org/link/demand/15-1299.08 "Computer Systems Engineers/Architects" "AWS CloudFormation"',
            "site:docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html CloudFormation official documentation",
        ],
        "authorities": ["O*NET OnLine", "AWS Documentation"],
        "sources": [
            ONET_SYSTEMS,
            evidence(
                "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html",
                "AWS Documentation",
                "What is AWS CloudFormation? official User Guide landing page; CloudFormation resource and infrastructure-management documentation.",
                "item_documentation",
                "AWS identifies the named CloudFormation service and its official documentation, but does not name a second local endpoint or exact edge for this row.",
            ),
        ],
        "locator": "O*NET lists AWS CloudFormation for 15-1299.08; AWS Documentation independently identifies the named service.",
    },
    "amazon-web-services-aws-software": {
        "queries": [
            'site:onetonline.org/link/demand/15-1299.08 "Computer Systems Engineers/Architects" "Amazon Web Services AWS software"',
            "site:aws.amazon.com/what-is-aws AWS official overview",
        ],
        "authorities": ["O*NET OnLine", "Amazon Web Services"],
        "sources": [
            ONET_SYSTEMS,
            evidence(
                "https://aws.amazon.com/what-is-aws/",
                "Amazon Web Services",
                "What is AWS? official overview; AWS cloud platform and service documentation entry point.",
                "item_documentation",
                "AWS identifies the named cloud platform, but does not name a second local endpoint or exact edge for this row.",
            ),
        ],
        "locator": "O*NET lists Amazon Web Services AWS software for 15-1299.08; AWS independently identifies the named platform.",
    },
}


def main() -> None:
    if LEDGER.exists() or REPORT.exists() or REPORT_MD.exists():
        raise SystemExit("Refusing to overwrite existing tranche-009 ledger/report")
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    selected = selection["relationships"]
    expected = {
        "node-js",
        "git",
        "amazon-web-services-aws-cloudformation",
        "amazon-web-services-aws-software",
    }
    actual = {str(row.get("from_item_key")) for row in selected}
    if actual != expected or len(selected) != 4:
        raise SystemExit(f"Unexpected selection keys: {sorted(actual)}")

    records = []
    for row in selected:
        key = str(row["from_item_key"])
        item = ITEMS[key]
        sources = item["sources"]
        records.append(
            {
                **row,
                "candidate_relationship_type": None,
                "relationship_status": "review_required",
                "search_queries": item["queries"],
                "searched_authorities": item["authorities"],
                "source_urls": [source["url"] for source in sources],
                "source_locator": item["locator"],
                "evidence": sources,
                "evidence_text": "The authoritative O*NET occupation table establishes the exact role-to-named-tool association, while first-party documentation establishes the named item. No source names both local typed relationship endpoints and an exact approved item-to-item edge for this context.",
                "decision": "review_required",
                "decision_reason": "The sources establish the role/tool association and source item identity, but the local row has no target endpoint or typed relation. No source establishes both local typed endpoints with an exact approved relationship edge in this context.",
                "limitation": "The local row has null to_item_type, to_item_key, to_name and candidate_relationship_type. No endpoint or relationship type was inferred from occupation co-occurrence, software documentation, interoperability, taxonomy grouping or name similarity.",
                "access_date": ACCESS_DATE,
                "searched_at": SEARCHED_AT,
                "source_reference": "; ".join(source["url"] for source in sources),
            }
        )

    ids = [record["row_id"] for record in records]
    if ids != [row["row_id"] for row in selected] or len(ids) != len(set(ids)):
        raise SystemExit("Ledger IDs do not exactly match selection or contain duplicates")
    if any(record.get(key) for record in records for key in ("to_item_type", "to_item_key", "to_name")):
        raise SystemExit("A target endpoint was populated; refusing to infer endpoints")
    if any(record.get("candidate_relationship_type") is not None for record in records):
        raise SystemExit("A candidate relationship type was populated without exact source evidence")

    LEDGER.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records), encoding="utf-8")
    report = {
        "schema": "2026-09-21.full-population-relationship-tranche-report.v1",
        "accessed_on": ACCESS_DATE,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "scope": "Four non-overlapping unresolved non-D078 relationship rows reserved by tranche-009 selection before external search.",
        "counts": {
            "selected_rows": 4,
            "searched_rows": 4,
            "linked_promoted": 0,
            "review_required": 4,
            "genuinely_unavailable": 0,
            "selection_ids_missing_from_ledger": 0,
            "unexpected_ledger_ids": 0,
            "duplicate_ledger_ids": 0,
            "prior_tranche_overlap": 0,
            "d078_rows": 0,
        },
        "decision": "All four rows remain review_required. O*NET establishes the exact role/software associations and first-party sources identify the named software items, but no source names both local typed endpoints and an exact approved item-to-item relationship edge. No endpoint or relation type was inferred.",
        "source_families": ["O*NET OnLine", "Node.js project", "Git project", "AWS Documentation", "Amazon Web Services"],
        "guardrails": {
            "sql_touched": False,
            "generated_seed_transport_touched": False,
            "catalogue_touched": False,
            "app_code_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
        },
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update(
        {
            "status": "searched",
            "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
            "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
            "scope": {
                **checkpoint["scope"],
                "current_tranche_rows_searched": 4,
                "current_tranche_review_required": 4,
                "current_tranche_remaining_selected_rows": 0,
                "cumulative_relationship_search_records": checkpoint["scope"]["prior_relationship_search_records"] + 4,
                "cumulative_relationship_search_linked": 0,
                "cumulative_relationship_search_review_required": checkpoint["scope"]["prior_relationship_search_records"] + 4,
            },
        }
    )
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 009 checkpoint\n\n"
        f"Date: {ACCESS_DATE}\n\n"
        "Four selected role/tool rows were searched after the selection checkpoint was saved. "
        "All four remain `review_required`; exact role/tool associations and first-party item documentation were found, but no source named both local typed endpoints and an exact approved item-to-item edge. No endpoint or relation type was inferred.\n\n"
        "Guardrails: no SQL, catalogue, seed transport, app code, UI or browser-proof files were changed.\n",
        encoding="utf-8",
    )
    REPORT_MD.write_text(
        "# Full-population relationship enrichment — tranche 009 report\n\n"
        f"Date: {ACCESS_DATE}  \nSelection: `{SELECTION.name}`  \nLedger: `{LEDGER.name}`\n\n"
        "## Result\n\n"
        "| Measure | Count |\n|---|---:|\n| Selected rows | 4 |\n| Searched rows | 4 |\n| Linked/promoted | 0 |\n| Review required | 4 |\n| Genuinely unavailable | 0 |\n| Prior-tranche overlap | 0 |\n| D078 rows | 0 |\n\n"
        "## Evidence decision\n\n"
        "O*NET provides exact role-to-software associations for Node.js/Blockchain Engineers, Git/Computer Programmers, and the two AWS entries/Computer Systems Engineers/Architects. Node.js, Git and AWS first-party documentation identifies the named source item. The local rows still have null target endpoints and null candidate relationship types. The sources do not establish both local endpoints with an exact approved edge, so all four remain `review_required`.\n\n"
        "## Guardrails\n\n"
        "- The selection checkpoint was saved before search.\n"
        "- Selection IDs match the four ledger records exactly; overlap is zero.\n"
        "- No target endpoint or candidate relationship type was populated.\n"
        "- No SQL, generated seed transport, catalogue, app code, UI or browser-proof file was changed.\n",
        encoding="utf-8",
    )
    print(json.dumps({"selected": 4, "searched": 4, "review_required": 4, "promoted": 0}))


if __name__ == "__main__":
    main()
