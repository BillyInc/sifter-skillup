"""Record authoritative evidence for relationship-enrichment tranche 008.

The local rows have a named source item but null target endpoints and null
typed relation candidates.  This pass records exact occupation/tool and
first-party item evidence without inventing an endpoint or edge.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
SELECTION = OUT_DIR / "full_population_relationship_tranche_008_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_relationship_tranche_008_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_008_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_008_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_relationship_tranche_008_report_2026-09-21.json"
REPORT_MD = OUT_DIR / "full_population_relationship_tranche_008_report_2026-09-21.md"
ACCESS_DATE = "2026-09-21"
SEARCHED_AT = "2026-09-21T15:56:22+01:00"

ONET_DEMAND = "https://www.onetonline.org/link/demand/15-1299.07"
ONET_DETAILS = "https://www.onetonline.org/link/details/15-1299.07"


def source(
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


ONET_ROLE = source(
    ONET_DEMAND,
    "O*NET OnLine / U.S. Department of Labor partner data",
    "Employer-Based In Demand Software Skills table for 15-1299.07, lines 50-76; the table lists Go, Docker, JavaScript, Kubernetes, Microsoft Azure software, Git, MongoDB and C# for Blockchain Engineers from 2025 U.S. job-posting data.",
    "role_association",
    "O*NET establishes the exact Blockchain Engineers-to-named-software association. It does not provide a second local typed endpoint or an approved item-to-item relationship edge for these rows.",
)
ONET_CONTEXT = source(
    ONET_DETAILS,
    "O*NET OnLine / U.S. Department of Labor",
    "Blockchain Engineers profile 15-1299.07, lines 50-57 and 127-144; occupation description, tasks and software-development context.",
    "occupation_context",
    "O*NET supplies the occupation context and work activities, but the local relationship rows still have null target item identity and null candidate relationship type.",
)


ITEM_SOURCES: dict[str, tuple[list[str], list[str], list[dict[str, str]], str]] = {
    "c": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" "C#"', "site:learn.microsoft.com/en-us/dotnet/csharp C# official documentation"],
        ["O*NET OnLine", "Microsoft Learn"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://learn.microsoft.com/en-us/dotnet/csharp/", "Microsoft Learn", "C# Guide landing page; C# language and .NET documentation.", "item_documentation", "Microsoft identifies the named C# language and its official documentation surface, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists C# for 15-1299.07; Microsoft Learn independently identifies C#.",
    ),
    "docker": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" Docker', "site:docs.docker.com/get-started Docker official documentation"],
        ["O*NET OnLine", "Docker Docs"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://docs.docker.com/get-started/", "Docker", "Get Started documentation; Docker concepts, containers and introductory workflows.", "item_documentation", "Docker identifies the named container platform and its documented workflows, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists Docker for 15-1299.07; Docker documentation independently identifies the named platform.",
    ),
    "git": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" Git', "site:git-scm.com/doc Git official documentation"],
        ["O*NET OnLine", "Git project"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://git-scm.com/doc", "Git project", "Git documentation landing page; reference and book documentation for the distributed version-control system.", "item_documentation", "Git identifies the named version-control tool, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists Git for 15-1299.07; Git documentation independently identifies the named tool.",
    ),
    "go": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" Go', "site:go.dev/doc Go official documentation"],
        ["O*NET OnLine", "The Go Programming Language"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://go.dev/doc/", "The Go Programming Language", "Go documentation landing page; language, module, toolchain and learning documentation.", "item_documentation", "The Go project identifies the named language and official documentation, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists Go for 15-1299.07; Go documentation independently identifies the named language.",
    ),
    "javascript": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" JavaScript', "site:developer.mozilla.org/en-US/docs/Web/JavaScript JavaScript reference"],
        ["O*NET OnLine", "MDN Web Docs"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://developer.mozilla.org/en-US/docs/Web/JavaScript", "MDN Web Docs / Mozilla", "JavaScript guide and reference; language concepts, built-ins and web-platform usage.", "item_documentation", "MDN identifies the named JavaScript language, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists JavaScript for 15-1299.07; MDN independently identifies the named language.",
    ),
    "kubernetes": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" Kubernetes', "site:kubernetes.io/docs/home Kubernetes official documentation"],
        ["O*NET OnLine", "Kubernetes"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://kubernetes.io/docs/home/", "Kubernetes project", "Kubernetes Documentation home; container orchestration concepts, tasks, setup and reference.", "item_documentation", "Kubernetes documentation identifies the named platform, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists Kubernetes for 15-1299.07; Kubernetes documentation independently identifies the named platform.",
    ),
    "microsoft-azure-software": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" "Microsoft Azure software"', "site:learn.microsoft.com/en-us/azure Azure official documentation"],
        ["O*NET OnLine", "Microsoft Learn"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://learn.microsoft.com/en-us/azure/", "Microsoft Learn", "Azure documentation hub; Azure services, products, architecture and developer documentation.", "item_documentation", "Microsoft identifies the named Azure platform and documentation hub, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists Microsoft Azure software for 15-1299.07; Microsoft Learn independently identifies Azure.",
    ),
    "mongodb": (
        ['site:onetonline.org/link/demand/15-1299.07 "Blockchain Engineers" MongoDB', "site:mongodb.com/docs MongoDB official documentation"],
        ["O*NET OnLine", "MongoDB Documentation"],
        [
            ONET_ROLE,
            ONET_CONTEXT,
            source("https://www.mongodb.com/docs/", "MongoDB", "MongoDB Documentation home; database, Atlas, drivers, deployment and developer documentation.", "item_documentation", "MongoDB identifies the named database platform and documentation surface, but does not name a second local endpoint or exact edge for this row."),
        ],
        "O*NET lists MongoDB for 15-1299.07; MongoDB documentation independently identifies the named platform.",
    ),
}


def record(selected: dict[str, object]) -> dict[str, object]:
    key = str(selected["from_item_key"])
    if key not in ITEM_SOURCES:
        raise SystemExit(f"No evidence bundle for selected item key: {key}")
    queries, authorities, sources, locator = ITEM_SOURCES[key]
    urls = [item["url"] for item in sources]
    return {
        **selected,
        "candidate_relationship_type": None,
        "relationship_status": "review_required",
        "search_queries": queries,
        "searched_authorities": authorities,
        "source_urls": urls,
        "source_locator": locator,
        "evidence": sources,
        "evidence_text": "The authoritative occupation record establishes the exact Blockchain Engineers-to-named-tool association, while first-party documentation establishes the named tool identity. No source names both local typed endpoints and an exact approved item-to-item edge for the local context.",
        "decision": "review_required",
        "decision_reason": "The sources establish the role/tool association and the source item, but the local row has no target endpoint or typed relation. No source establishes both local typed endpoints with an exact approved relationship edge in this context.",
        "limitation": "The local row has null to_item_type, to_item_key, to_name and candidate_relationship_type. No endpoint or relationship type was inferred from occupation co-occurrence, software documentation, interoperability, taxonomy grouping or name similarity.",
        "access_date": ACCESS_DATE,
        "searched_at": SEARCHED_AT,
        "source_reference": "; ".join(urls),
    }


def main() -> None:
    if LEDGER.exists():
        raise SystemExit(f"Refusing to overwrite append-only ledger: {LEDGER}")
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    records = [record(item) for item in selection["relationships"]]
    selected_ids = [item["row_id"] for item in selection["relationships"]]
    record_ids = [item["row_id"] for item in records]
    if record_ids != selected_ids or len(record_ids) != len(set(record_ids)):
        raise SystemExit("Ledger IDs do not exactly match selection or contain duplicates")
    if any(item.get("to_item_type") or item.get("to_item_key") or item.get("to_name") for item in records):
        raise SystemExit("A target endpoint was populated; refusing to infer endpoints")
    if any(item.get("candidate_relationship_type") is not None for item in records):
        raise SystemExit("A candidate relationship type was populated without an exact source edge")

    LEDGER.write_text("".join(json.dumps(item, ensure_ascii=False) + "\n" for item in records), encoding="utf-8")
    report = {
        "schema": "2026-09-21.full-population-relationship-tranche-report.v1",
        "accessed_on": ACCESS_DATE,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "scope": "Eight non-overlapping unresolved non-D078 relationship rows selected after full_population_relationship_tranche_007 and all prior relationship-bearing ledgers.",
        "counts": {
            "selected_rows": len(records),
            "searched_rows": len(records),
            "linked_promoted": 0,
            "review_required": len(records),
            "genuinely_unavailable": 0,
            "selection_ids_missing_from_ledger": 0,
            "unexpected_ledger_ids": 0,
            "duplicate_ledger_ids": 0,
            "prior_tranche_overlap": 0,
            "d078_rows": 0,
        },
        "decision": "All eight rows remain review_required. O*NET establishes the exact Blockchain Engineers/software association and first-party documentation identifies each named tool, but no source names both local typed endpoints and an exact approved relationship edge. No endpoint or relation type was inferred.",
        "source_families": ["O*NET OnLine", "Microsoft Learn", "Docker Docs", "Git project", "The Go Programming Language", "MDN Web Docs", "Kubernetes", "MongoDB Documentation"],
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
    checkpoint = {
        "schema": "2026-09-21.full-population-relationship-tranche-checkpoint.v1",
        "accessed_on": ACCESS_DATE,
        "status": "searched",
        "blocked": False,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "scope": {
            "prior_relationship_search_records": 56,
            "prior_relationship_search_linked": 0,
            "prior_relationship_search_review_required": 56,
            "prior_relationship_search_genuinely_unavailable": 0,
            "current_tranche_rows_selected": len(records),
            "current_tranche_rows_searched": len(records),
            "current_tranche_linked": 0,
            "current_tranche_review_required": len(records),
            "current_tranche_genuinely_unavailable": 0,
            "current_tranche_remaining_selected_rows": 0,
            "cumulative_relationship_search_records": 56 + len(records),
            "cumulative_relationship_search_linked": 0,
            "cumulative_relationship_search_review_required": 56 + len(records),
        },
        "guardrails": report["guardrails"],
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 008\n\n"
        f"Date: {ACCESS_DATE}\n\n"
        "Eight fresh Blockchain Engineers tool rows were searched against O*NET and first-party documentation. "
        "All remain `review_required`: no source named both local typed endpoints and an exact approved item-to-item edge. "
        "No endpoint or relation type was inferred. The initial checkpoint was saved before selection; this searched checkpoint records completion.\n",
        encoding="utf-8",
    )
    REPORT_MD.write_text(
        "# Full-population relationship enrichment — tranche 008\n\n"
        f"Date: {ACCESS_DATE}  \nSelection: `{SELECTION.name}`  \nLedger: `{LEDGER.name}`\n\n"
        "## Result\n\n"
        "| Measure | Count |\n|---|---:|\n"
        f"| Selected rows | {len(records)} |\n| Searched rows | {len(records)} |\n"
        "| Linked/promoted | 0 |\n| Review required | 8 |\n| Genuinely unavailable | 0 |\n"
        "| Selection IDs missing from ledger | 0 |\n| Unexpected ledger IDs | 0 |\n"
        "| Duplicate ledger IDs | 0 |\n| Prior-tranche overlap | 0 |\n| D078 rows | 0 |\n\n"
        "## Evidence decision\n\n"
        "O*NET's current employer-based software-skills table confirms the exact Blockchain Engineers association for C#, Docker, Git, Go, JavaScript, Kubernetes, Microsoft Azure software and MongoDB. "
        "The corresponding first-party documentation confirms each named item. These sources do not resolve the local null target endpoint or establish an exact approved item-to-item relationship edge in the same context. "
        "All eight rows therefore remain `review_required`; URLs, locators, authorities, evidence summaries, queries, access date and limitations are retained in the JSONL ledger.\n\n"
        "## Guardrails\n\n"
        "- Selection was checked against all prior relationship-bearing search ledgers; overlap is zero.\n"
        "- No D078 rows were selected.\n"
        "- No target endpoint or candidate relationship type was populated.\n"
        "- No SQL, generated seed transport, catalogue, app code, UI or browser-proof file was changed.\n",
        encoding="utf-8",
    )
    print(json.dumps({"selected": len(records), "searched": len(records), "review_required": len(records), "promoted": 0}))


if __name__ == "__main__":
    main()
