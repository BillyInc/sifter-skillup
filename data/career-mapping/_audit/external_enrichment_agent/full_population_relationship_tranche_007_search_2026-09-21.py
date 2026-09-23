"""Write the evidence ledger and closure report for relationship tranche 007.

This is an evidence-only pass.  The source rows have null target endpoints, so
the script deliberately retains every row as review_required unless an
authoritative source names both typed endpoints and the exact approved edge.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
SELECTION = OUT_DIR / "full_population_relationship_tranche_007_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_relationship_tranche_007_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_relationship_tranche_007_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_relationship_tranche_007_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_relationship_tranche_007_report_2026-09-21.json"
REPORT_MD = OUT_DIR / "full_population_relationship_tranche_007_report_2026-09-21.md"
SEARCHED_AT = "2026-09-21T15:24:24+01:00"
ACCESS_DATE = "2026-09-21"

ONET_VIDEO_GAME = "https://www.onetonline.org/link/hot_tech/15-1255.01"
ONET_VIDEO_GAME_DETAILS = "https://www.onetonline.org/link/details/15-1255.01"
ONET_BLOCKCHAIN = "https://www.onetonline.org/link/hot_tech/15-1299.07"
ONET_BLOCKCHAIN_DETAILS = "https://www.onetonline.org/link/details/15-1299.07"


def evidence(url: str, authority: str, locator: str, role: str, summary: str) -> dict[str, str]:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": ACCESS_DATE,
        "link_role": role,
        "confidence": "high",
        "evidence_summary": summary,
    }


def row(
    selected: dict[str, str | None],
    *,
    queries: list[str],
    authorities: list[str],
    sources: list[dict[str, str]],
    locator: str,
    evidence_text: str,
) -> dict[str, object]:
    urls = [source["url"] for source in sources]
    return {
        **selected,
        "candidate_relationship_type": None,
        "relationship_status": "review_required",
        "search_queries": queries,
        "searched_authorities": authorities,
        "source_urls": urls,
        "source_locator": locator,
        "evidence": sources,
        "evidence_text": evidence_text,
        "decision": "review_required",
        "decision_reason": "The authoritative sources establish the named role/tool association and identify the source item, but the local relationship row has no target endpoint or typed relation. No source names both local typed endpoints with an exact approved relationship edge in this context.",
        "limitation": "The local row has null to_item_type, to_item_key, to_name and candidate_relationship_type. No endpoint or relationship type was inferred from occupation co-occurrence, software taxonomy, product documentation, interoperability, or name similarity.",
        "access_date": ACCESS_DATE,
        "searched_at": SEARCHED_AT,
        "source_reference": "; ".join(urls),
    }


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    if LEDGER.exists():
        raise SystemExit(f"Refusing to overwrite append-only ledger: {LEDGER}")
    selected_by_key = {item["row_id"]: item for item in selection["relationships"]}

    onet_video = evidence(
        ONET_VIDEO_GAME,
        "O*NET OnLine / U.S. Department of Labor partner data",
        "Hot Technologies table for 15-1255.01; the table lists the named software skills for Video Game Designers, including Python, Adobe products, Atlassian JIRA, XML and Git.",
        "role_association",
        "O*NET links the exact Video Game Designers occupation to the named software skill in employer-posting data; this establishes role/tool co-occurrence, not a second typed endpoint or an approved relationship edge.",
    )
    onet_video_details = evidence(
        ONET_VIDEO_GAME_DETAILS,
        "O*NET OnLine / U.S. Department of Labor",
        "Software Skills table for 15-1255.01; the profile describes Video Game Designers and lists software-skill categories and tasks.",
        "occupation_context",
        "O*NET provides the occupation context, tasks and software-skill classification but does not provide a target item for any of these local rows.",
    )
    onet_blockchain = evidence(
        ONET_BLOCKCHAIN,
        "O*NET OnLine / U.S. Department of Labor partner data",
        "Hot Technologies table for 15-1299.07; Amazon Web Services AWS software is listed for Blockchain Engineers in employer-posting data.",
        "role_association",
        "O*NET links the exact Blockchain Engineers occupation to Amazon Web Services AWS software; the row remains role/tool co-occurrence rather than a typed tool-to-target edge.",
    )
    onet_blockchain_details = evidence(
        ONET_BLOCKCHAIN_DETAILS,
        "O*NET OnLine / U.S. Department of Labor",
        "Software Skills table for 15-1299.07; the profile describes Blockchain Engineers and lists AWS software among cloud/data software categories.",
        "occupation_context",
        "O*NET provides the occupation and software classification but does not name a second local endpoint or an exact approved relationship type.",
    )

    source_by_key: dict[str, tuple[list[str], list[str], list[dict[str, str]], str, str]] = {
        "python": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" Python',
                "site:docs.python.org Python official documentation",
            ],
            ["O*NET OnLine", "Python Software Foundation"],
            [
                onet_video,
                evidence(
                    "https://docs.python.org/3/",
                    "Python Software Foundation",
                    "Python 3.14.7 documentation landing page; official language, library and extension documentation.",
                    "item_identity",
                    "The Python documentation identifies the named language/tool, but it does not name Video Game Designers or a second local target endpoint.",
                ),
            ],
            "O*NET Hot Technologies table lists Python for 15-1255.01; the Python documentation identifies Python independently.",
            "The searched pages establish Python and its Video Game Designer association separately; none supplies both local typed endpoints and an exact relationship edge.",
        ),
        "adobe-after-effects": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" "Adobe After Effects"',
                "site:helpx.adobe.com/after-effects Adobe After Effects official workflow",
            ],
            ["O*NET OnLine", "Adobe After Effects Help"],
            [
                onet_video,
                evidence(
                    "https://helpx.adobe.com/after-effects/desktop/get-started/understand-after-effects-workflow/workflows.html",
                    "Adobe",
                    "After Effects Workflows; import, organize, animate, composite, preview, render and export workflow.",
                    "item_documentation",
                    "Adobe identifies After Effects and its workflow, but does not name the local Video Game Designers context or a second typed endpoint for this row.",
                ),
                evidence(
                    "https://helpx.adobe.com/after-effects/desktop/get-started/after-effects-faq/faq.html",
                    "Adobe",
                    "After Effects FAQ; product identity and cross-product workflow information.",
                    "item_identity",
                    "Adobe identifies After Effects and its Creative Cloud relationship, but this is not an exact local relationship edge.",
                ),
            ],
            "O*NET Hot Technologies table lists Adobe After Effects for 15-1255.01; Adobe's workflow documentation describes the named product.",
            "The sources establish the named product and occupation/tool association, but not both local typed endpoints and an exact approved edge.",
        ),
        "adobe-creative-cloud-software": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" "Adobe Creative Cloud software"',
                "site:developer.adobe.com/creative-cloud Adobe Creative Cloud official developer platform",
            ],
            ["O*NET OnLine", "Adobe Creative Cloud Developer Platform"],
            [
                onet_video,
                evidence(
                    "https://developer.adobe.com/creative-cloud",
                    "Adobe",
                    "Creative Cloud Developer Platform; APIs, SDKs, plugins and integrations for Creative Cloud applications and services.",
                    "item_documentation",
                    "Adobe identifies Creative Cloud and its integrations, but it does not name the local Video Game Designers context or a second local endpoint for this row.",
                ),
            ],
            "O*NET Hot Technologies table lists Adobe Creative Cloud software for 15-1255.01; Adobe's developer platform identifies the product family and integration surface.",
            "The sources establish the product family and role/tool co-occurrence, but no exact source-target typed edge exists for the local row.",
        ),
        "adobe-illustrator": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" "Adobe Illustrator"',
                "site:helpx.adobe.com/illustrator/user-guide.html Adobe Illustrator official help",
            ],
            ["O*NET OnLine", "Adobe Illustrator Help"],
            [
                onet_video,
                evidence(
                    "https://helpx.adobe.com/illustrator/user-guide.html",
                    "Adobe",
                    "Illustrator Desktop Help; drawing, vector artwork, files, paths, objects, typography, color and workflow documentation.",
                    "item_documentation",
                    "Adobe identifies Illustrator and its documented capabilities, but does not name the local Video Game Designers context or a second typed endpoint for this row.",
                ),
            ],
            "O*NET Hot Technologies table lists Adobe Illustrator for 15-1255.01; Adobe Illustrator Help identifies the named product.",
            "The sources establish the product and role/tool association, but not both local typed endpoints and an exact approved edge.",
        ),
        "atlassian-jira": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" "Atlassian JIRA"',
                "site:confluence.atlassian.com/jirasoftware Jira Software official documentation",
            ],
            ["O*NET OnLine", "Atlassian Documentation"],
            [
                onet_video,
                evidence(
                    "https://confluence.atlassian.com/jirasoftware",
                    "Atlassian",
                    "Jira Software Documentation; planning, tracking and release workflows for software teams.",
                    "item_documentation",
                    "Atlassian identifies Jira Software and its workflow-management use, but does not name the local Video Game Designers context or a second typed endpoint for this row.",
                ),
            ],
            "O*NET Hot Technologies table lists Atlassian JIRA for 15-1255.01; Atlassian documentation identifies Jira Software and its workflow purpose.",
            "The sources establish Jira and role/tool co-occurrence, but generic workflow documentation cannot supply a missing target endpoint or exact approved edge.",
        ),
        "extensible-markup-language-xml": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" XML',
                "site:w3.org/TR/REC-xml XML W3C Recommendation",
            ],
            ["O*NET OnLine", "World Wide Web Consortium"],
            [
                onet_video,
                evidence(
                    "https://www.w3.org/TR/REC-xml",
                    "World Wide Web Consortium",
                    "Extensible Markup Language (XML) 1.0 (Fifth Edition), W3C Recommendation; syntax, interoperability and processing specification.",
                    "item_identity",
                    "W3C identifies XML as a formal recommendation, but does not name the local Video Game Designers context or a second typed endpoint for this row.",
                ),
            ],
            "O*NET Hot Technologies table lists XML for 15-1255.01 with not-available posting frequency; the W3C Recommendation identifies XML independently.",
            "The sources establish XML and the occupational record, but do not establish both local typed endpoints or an exact relationship edge.",
        ),
        "git": (
            [
                'site:onetonline.org/link/hot_tech/15-1255.01 "Video Game Designers" Git',
                "site:git-scm.com/docs Git official documentation",
            ],
            ["O*NET OnLine", "Git project documentation"],
            [
                onet_video,
                evidence(
                    "https://git-scm.com/docs/git",
                    "Git project",
                    "Git documentation; distributed version-control system, repository, command and workflow references.",
                    "item_documentation",
                    "Git documentation identifies the named tool, but does not name the local Video Game Designers context or a second typed endpoint for this row.",
                ),
            ],
            "O*NET Hot Technologies table lists Git for 15-1255.01; Git's official documentation identifies the version-control tool.",
            "The sources establish Git and its role/tool association, but not both local typed endpoints and an exact approved edge.",
        ),
        "amazon-web-services-aws-software": (
            [
                'site:onetonline.org/link/hot_tech/15-1299.07 "Blockchain Engineers" "Amazon Web Services AWS software"',
                'site:docs.aws.amazon.com "Amazon Managed Blockchain" developer guide',
            ],
            ["O*NET OnLine", "Amazon Web Services Documentation"],
            [
                onet_blockchain,
                onet_blockchain_details,
                evidence(
                    "https://docs.aws.amazon.com/managed-blockchain/",
                    "Amazon Web Services",
                    "Amazon Managed Blockchain Documentation; AMB Access, Ethereum, Hyperledger Fabric, Bitcoin, Polygon and Query developer guides.",
                    "item_documentation",
                    "AWS identifies its managed blockchain service and developer surfaces, but does not name the local Blockchain Engineers context as a typed endpoint or a second local target for this row.",
                ),
                evidence(
                    "https://docs.aws.amazon.com/managed-blockchain/latest/ethereum-dev/ethereum-concepts.html",
                    "Amazon Web Services",
                    "AMB Access Ethereum key concepts; nodes, APIs, decentralized applications and blockchain infrastructure.",
                    "workflow_evidence",
                    "AWS documents blockchain infrastructure and application interaction, but this is not an exact source-target relationship for the local row.",
                ),
            ],
            "O*NET Hot Technologies and Software Skills tables identify AWS software for 15-1299.07 Blockchain Engineers; AWS documentation identifies Amazon Managed Blockchain and its developer workflows.",
            "The sources establish AWS and its blockchain use, but the local target endpoint and exact relationship type remain null; no edge was inferred.",
        ),
    }

    records: list[dict[str, object]] = []
    for selected in selection["relationships"]:
        item_key = selected["from_item_key"]
        if item_key not in source_by_key:
            raise SystemExit(f"No evidence bundle for selected item key: {item_key}")
        queries, authorities, sources, locator, evidence_text = source_by_key[item_key]
        records.append(
            row(
                selected,
                queries=queries,
                authorities=authorities,
                sources=sources,
                locator=locator,
                evidence_text=evidence_text,
            )
        )

    ids = [record["row_id"] for record in records]
    if len(ids) != len(set(ids)) or set(ids) != set(selected_by_key):
        raise SystemExit("Ledger IDs do not exactly match the saved selection")
    if any(record["to_item_type"] or record["to_item_key"] or record["to_name"] for record in records):
        raise SystemExit("A target endpoint was populated; this evidence-only tranche must not infer endpoints")
    if any(record["candidate_relationship_type"] is not None for record in records):
        raise SystemExit("A candidate relationship type was populated without an exact source edge")

    LEDGER.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records), encoding="utf-8")
    report = {
        "schema": "2026-09-21.full-population-relationship-tranche-report.v1",
        "accessed_on": ACCESS_DATE,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "scope": "Eight non-overlapping unresolved non-D078 relationship rows selected after full_population_relationship_tranche_006.",
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
        "decision": "All eight rows remain review_required. The searches found authoritative occupation/tool associations and first-party item documentation, but no exact source that names both local typed endpoints and the approved relationship edge. No endpoint or relation type was inferred.",
        "source_families": ["O*NET OnLine", "Python Software Foundation", "Adobe", "Atlassian", "W3C", "Git project", "Amazon Web Services"],
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
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "scope": {
            "prior_relationship_search_records": 48,
            "prior_relationship_search_linked": 0,
            "prior_relationship_search_review_required": 48,
            "prior_relationship_search_genuinely_unavailable": 0,
            "current_tranche_rows_selected": len(records),
            "current_tranche_rows_searched": len(records),
            "current_tranche_linked": 0,
            "current_tranche_review_required": len(records),
            "current_tranche_genuinely_unavailable": 0,
            "current_tranche_remaining_selected_rows": 0,
            "cumulative_relationship_search_records": 48 + len(records),
            "cumulative_relationship_search_linked": 0,
            "cumulative_relationship_search_review_required": 48 + len(records),
        },
        "guardrails": report["guardrails"],
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population relationship enrichment — tranche 007\n\n"
        f"Date: {ACCESS_DATE}  \n"
        "Scope: eight non-overlapping unresolved non-D078 relationship rows selected after tranche 006.\n\n"
        "## Result\n\n"
        "| Measure | Count |\n"
        "|---|---:|\n"
        f"| Selected rows | {len(records)} |\n"
        f"| Searched rows | {len(records)} |\n"
        "| Linked/promoted | 0 |\n"
        f"| Review required | {len(records)} |\n"
        "| Genuinely unavailable | 0 |\n"
        "| Selection IDs missing from ledger | 0 |\n"
        "| Unexpected ledger IDs | 0 |\n"
        "| Duplicate ledger IDs | 0 |\n"
        "| Prior-tranche overlap | 0 |\n"
        "| D078 rows | 0 |\n\n"
        "## Evidence decision\n\n"
        "O*NET was searched for the exact Video Game Designers and Blockchain Engineers occupation/tool associations. First-party Python, Adobe, Atlassian, W3C, Git and AWS documentation was searched for item identity and workflow evidence. The sources do not resolve the local null target endpoint or state an exact approved relationship edge in the same local context.\n\n"
        "All eight rows therefore remain `review_required`. Their target type, target key, target name and candidate relationship type remain null. No endpoint or relation was inferred from occupation co-occurrence, taxonomy grouping, product documentation, interoperability or name similarity. URLs, authorities, locators, access dates and limitations are retained in the JSONL ledger.\n\n"
        "## Guardrails\n\n"
        "- The saved selection was the authoritative scope; no rows were added.\n"
        "- All prior item and relationship ledger IDs were excluded; the current eight have zero overlap.\n"
        "- No D078 rows were selected.\n"
        "- No relationship was promoted and no student-facing state was altered.\n"
        "- No SQL, generated seed transport, catalogue, app code, UI or browser-proof file was changed.\n",
        encoding="utf-8",
    )
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()
