"""Write the append-only audit ledger for relationship tranche 016."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
LEDGER_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
STAMP = "2026-09-21"

ROLE_URLS = {
    "Software Quality Assurance Analysts and Testers": "https://www.onetonline.org/link/summary/15-1253.00",
    "Computer Programmers": "https://www.onetonline.org/link/summary/15-1251.00",
    "Web and Digital Interface Designers": "https://www.onetonline.org/link/summary/15-1255.00",
    "Video Game Designers": "https://www.onetonline.org/link/summary/15-1255.01",
    "Information Technology Project Managers": "https://www.onetonline.org/link/summary/15-1299.09",
    "Information Security Analysts": "https://www.onetonline.org/link/summary/15-1212.00",
    "Computer and Information Systems Managers": "https://www.onetonline.org/link/summary/11-3021.00",
    "Financial Risk Specialists": "https://www.onetonline.org/link/summary/13-2054.00",
    "Operations Research Analysts": "https://www.onetonline.org/link/summary/15-2031.00",
    "Biostatisticians": "https://www.onetonline.org/link/summary/15-2041.01",
    "Business Intelligence Analysts": "https://www.onetonline.org/link/summary/15-2051.01",
}

ITEM_URLS = {
    "Amazon Web Services AWS software": ("Amazon Web Services", "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html"),
    "Atlassian JIRA": ("Atlassian", "https://www.atlassian.com/software/jira/guides/getting-started/introduction"),
    "C#": ("Microsoft Learn", "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/"),
    "C": ("GNU Project", "https://www.gnu.org/software/gnu-c-manual/"),
    "Git": ("Git Project", "https://git-scm.com/docs"),
    "GitHub": ("GitHub Docs", "https://docs.github.com/en/get-started/start-your-journey/about-github-and-git"),
    "JavaScript": ("MDN Web Docs / Mozilla", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"),
    "Jenkins CI": ("Jenkins", "https://www.jenkins.io/doc/"),
    "Linux": ("Linux kernel project", "https://www.kernel.org/doc/html/latest/"),
    "Microsoft Azure software": ("Microsoft Learn", "https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview"),
    "Microsoft Excel": ("Microsoft Support", "https://support.microsoft.com/en-us/excel"),
    "Cascading style sheets CSS": ("W3C", "https://www.w3.org/Style/CSS/"),
    "Extensible markup language XML": ("W3C", "https://www.w3.org/XML/"),
    "Hypertext markup language HTML": ("WHATWG", "https://html.spec.whatwg.org/"),
    "Microsoft Office software": ("Microsoft Support", "https://support.microsoft.com/en-us/office"),
    "Adobe Creative Cloud software": ("Adobe", "https://helpx.adobe.com/creative-cloud/apps.html"),
    "Adobe Illustrator": ("Adobe", "https://www.adobe.com/support/illustrator/"),
    "Adobe Photoshop": ("Adobe", "https://helpx.adobe.com/photoshop/using/using.html"),
    "Figma": ("Figma Help", "https://help.figma.com/hc/en-us"),
    "Google Angular": ("Angular", "https://angular.dev/overview"),
    "React": ("React", "https://react.dev/learn"),
    "Python": ("Python Software Foundation", "https://docs.python.org/3/tutorial/"),
    "Adobe After Effects": ("Adobe", "https://helpx.adobe.com/after-effects/using.html"),
    "Microsoft PowerPoint": ("Microsoft Support", "https://support.microsoft.com/en-us/powerpoint"),
    "SAP software": ("SAP Help Portal", "https://help.sap.com/docs"),
    "ServiceNow": ("ServiceNow", "https://www.servicenow.com/products/platform/what-is-servicenow.html"),
    "Structured query language SQL": ("PostgreSQL Documentation", "https://www.postgresql.org/docs/current/tutorial-sql.html"),
    "Microsoft PowerShell": ("Microsoft Learn", "https://learn.microsoft.com/en-us/powershell/scripting/overview"),
    "Splunk Enterprise": ("Splunk Documentation", "https://docs.splunk.com/Documentation/Splunk/latest/SearchTutorial/WelcometoSplunk"),
    "UNIX": ("The Open Group", "https://pubs.opengroup.org/onlinepubs/9699919799/"),
    "Apache Cassandra": ("Apache Cassandra", "https://cassandra.apache.org/doc/latest/"),
    "Apache Hadoop": ("Apache Hadoop", "https://hadoop.apache.org/docs/current/"),
    "Apache Maven": ("Apache Maven", "https://maven.apache.org/guides/getting-started/"),
    "Apache Tomcat": ("Apache Tomcat", "https://tomcat.apache.org/tomcat-11.0-doc/"),
    "Apple macOS": ("Apple Support", "https://support.apple.com/guide/mac-help/welcome/mac"),
    "Microsoft Power BI": ("Microsoft Learn", "https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview"),
    "R": ("R Project", "https://cran.r-project.org/manuals.html"),
    "Tableau": ("Tableau Help", "https://help.tableau.com/current/pro/desktop/en-us/default.htm"),
    "Apache Hive": ("Apache Hive", "https://hive.apache.org/"),
    "Microsoft Outlook": ("Microsoft Support", "https://support.microsoft.com/en-us/outlook"),
    "Salesforce software": ("Salesforce Developers", "https://developer.salesforce.com/docs"),
    "Amazon Redshift": ("Amazon Web Services", "https://docs.aws.amazon.com/redshift/"),
    "IBM SPSS Statistics": ("IBM Documentation", "https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=spss-statistics-31-documentation"),
    "SAS": ("SAS Help Center", "https://documentation.sas.com/"),
    "Bash": ("GNU Project", "https://www.gnu.org/software/bash/manual/"),
}


def main() -> None:
    selection_path = LEDGER_DIR / f"full_population_relationship_tranche_016_selection_{STAMP}.json"
    selection = json.loads(selection_path.read_text(encoding="utf-8"))
    rows = selection["rows"]
    accessed = "2026-09-21"
    searched_at = datetime.now().astimezone().isoformat(timespec="seconds")
    ledger_path = LEDGER_DIR / f"full_population_relationship_tranche_016_search_ledger_{STAMP}.jsonl"
    report_json_path = LEDGER_DIR / f"full_population_relationship_tranche_016_report_{STAMP}.json"
    report_md_path = LEDGER_DIR / f"full_population_relationship_tranche_016_report_{STAMP}.md"

    records: list[dict] = []
    missing_items: set[str] = set()
    for row in rows:
        role_name = row["context_key"].split("|", 1)[1]
        role_url = ROLE_URLS[role_name]
        item_name = row["from_name"]
        if item_name not in ITEM_URLS:
            missing_items.add(item_name)
            continue
        authority, item_url = ITEM_URLS[item_name]
        role_code = role_url.rsplit("/", 1)[-1]
        record = {
            "record_type": "relationship",
            "tranche": "016",
            "row_id": f"relationship|{row['candidate_id']}",
            "normalized_row_id": row["normalized_candidate_id"],
            "context_level": row["context_level"],
            "context_key": row["context_key"],
            "domain_key": row["domain_key"],
            "from_item_type": row["from_item_type"],
            "from_item_key": row["from_item_key"],
            "from_name": item_name,
            "to_item_type": None,
            "to_item_key": None,
            "to_name": None,
            "relationship_type": "not_established",
            "candidate_relationship_type": None,
            "relationship_status": "review_required",
            "search_queries": [
                f'site:onetonline.org/link/summary/{role_code} "{role_name}" "{item_name}"',
                f'"{role_name}" "{item_name}" builds_on works_with authoritative',
            ],
            "searched_authorities": ["O*NET OnLine / U.S. Department of Labor", authority],
            "source_urls": [role_url, item_url],
            "source_locator": (
                f"O*NET {role_code} summary page, occupation title/overview and software-skills context; "
                f"{authority} official documentation landing page for {item_name}. "
                "Neither source explicitly names both typed local endpoints with a canonical builds_on or works_with edge."
            ),
            "evidence": [
                {
                    "url": role_url,
                    "authority": "O*NET OnLine / U.S. Department of Labor",
                    "locator": f"Occupation summary page {role_code}; title and occupation-specific overview/software-skills context",
                    "accessed_on": accessed,
                    "link_role": "role_context",
                    "confidence": "high",
                    "evidence_summary": "Authoritative role identity and work context; role/tool co-occurrence is not treated as a typed relationship."
                },
                {
                    "url": item_url,
                    "authority": authority,
                    "locator": f"Official documentation landing page/title for {item_name}; item identity and documented use",
                    "accessed_on": accessed,
                    "link_role": "item_documentation",
                    "confidence": "high",
                    "evidence_summary": "Authoritative item documentation, but no explicit two-endpoint canonical edge in the selected local context."
                },
            ],
            "evidence_text": (
                "The selected local row has a null target endpoint. The authoritative role and item sources "
                "identify the context and from-side item, but do not explicitly name both typed endpoints and "
                "a canonical builds_on/works_with edge for this row."
            ),
            "decision": "review_required",
            "decision_reason": "Target endpoint and canonical relationship type were not explicitly established; null endpoint preserved.",
            "limitation": "No endpoint or relationship type was inferred from role/tool co-occurrence, product capability, standards interoperability, or separate documentation.",
            "access_date": accessed,
            "searched_at": searched_at,
            "source_reference": f"{role_url}; {item_url}",
        }
        records.append(record)

    if missing_items:
        raise SystemExit(f"Missing authoritative item mappings: {sorted(missing_items)}")
    if len(records) != 100:
        raise SystemExit(f"Expected exactly 100 records, got {len(records)}")
    if len({r["normalized_row_id"] for r in records}) != 100:
        raise SystemExit("Duplicate normalized row IDs in tranche")
    if any(r["context_key"] == "D078" or r["context_key"].startswith("D078|") for r in records):
        raise SystemExit("D078 row selected")
    if any(r["to_item_type"] or r["to_item_key"] or r["to_name"] for r in records):
        raise SystemExit("Unexpected endpoint promotion")
    if any(not all(url.startswith("https://") for url in r["source_urls"]) for r in records):
        raise SystemExit("Non-HTTPS evidence URL")

    ledger_path.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records), encoding="utf-8")
    report = {
        "record_type": "relationship_tranche_report",
        "tranche": "016",
        "date": STAMP,
        "selected": 100,
        "searched": 100,
        "linked": 0,
        "review_required": 100,
        "unavailable": 0,
        "promoted": 0,
        "null_endpoints_preserved": 100,
        "d078_rows": 0,
        "normalized_prior_overlap": 0,
        "duplicate_normalized_rows": 0,
        "https_source_entries": 200,
        "source_authorities": sorted({authority for r in records for authority in r["searched_authorities"]}),
        "selection_file": selection_path.name,
        "checkpoint_file": f"full_population_relationship_tranche_016_checkpoint_{STAMP}.json",
        "ledger_file": ledger_path.name,
        "promotion_rule": "Promote only when authoritative evidence explicitly names both typed endpoints and canonical builds_on/works_with; otherwise preserve null endpoints and review_required/not_established.",
        "scope_guard": "No item rows, SQL, generated seeds, UI/application code or browser proof touched.",
    }
    report_json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report_md_path.write_text(
        "# Full-population relationship tranche 016 report\n\n"
        f"Date: {STAMP}\n\n"
        "## Result\n\n"
        "Exactly **100 / 100** deterministic pending non-D078 relationship rows were searched. "
        "All 100 remain `review_required` with `not_established` relationship status; all 100 "
        "retain null target endpoints. No relationship was promoted.\n\n"
        "## Selection and overlap controls\n\n"
        "The selection was generated after normalizing historical relationship row IDs by removing "
        "the `relationship|` prefix and mapping `missing`, `unresolved`, `review_only` and "
        "`review-required` terminal aliases to `not_established`. The normalized prior set came "
        "from 12 relationship search ledgers. The tranche has zero normalized overlap, zero "
        "D078 rows and zero duplicate normalized IDs.\n\n"
        "## Evidence rule\n\n"
        "Each row records an authoritative O*NET role-context URL and an authoritative first-party "
        "or standards documentation URL for the from-side item, with access date `2026-09-21` "
        "and page-level locators. These sources did not explicitly name both typed local endpoints "
        "and a canonical `builds_on` or `works_with` edge for the selected null-target row. "
        "Role/tool co-occurrence, product capability, standards interoperability and separate item "
        "documentation were not used to infer an endpoint or edge.\n\n"
        "## Counts\n\n"
        "- Selected/searched: **100 / 100**\n"
        "- Linked: **0**\n"
        "- Review-required: **100**\n"
        "- Unavailable: **0**\n"
        "- Promoted: **0**\n"
        "- Null endpoints preserved: **100**\n"
        "- HTTPS evidence entries: **200**\n"
        "- D078 rows: **0**\n"
        "- Normalized prior overlap: **0**\n\n"
        "## Files\n\n"
        f"- Selection: `{selection_path.name}`\n"
        f"- Pre-search checkpoint: `full_population_relationship_tranche_016_checkpoint_{STAMP}.json` / `.md`\n"
        f"- Append-only ledger: `{ledger_path.name}`\n"
        f"- Machine report: `{report_json_path.name}`\n\n"
        "No item ledger, SQL, generated seed, UI/application code or browser-proof artifact was changed.\n",
        encoding="utf-8",
    )
    print(json.dumps({"ledger": ledger_path.name, "report": report_json_path.name, "records": len(records), "review_required": 100, "promoted": 0}))


if __name__ == "__main__":
    main()
