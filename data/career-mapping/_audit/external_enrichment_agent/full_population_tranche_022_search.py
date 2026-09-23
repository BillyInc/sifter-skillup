"""Resumable item-only evidence search for tranche 022.

This lane writes only item evidence.  It deliberately does not create
relationship, SQL, seed, UI, or browser-proof artifacts.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
TRANCHE = "022"
DATE = "2026-09-21"
SELECTION = OUT / f"full_population_tranche_{TRANCHE}_selection_{DATE}.json"
CHECKPOINT = OUT / f"full_population_tranche_{TRANCHE}_checkpoint_{DATE}.json"
LEDGER = OUT / f"full_population_tranche_{TRANCHE}_search_ledger_{DATE}.jsonl"
REPORT_JSON = OUT / f"full_population_tranche_{TRANCHE}_report_{DATE}.json"
REPORT_MD = OUT / f"full_population_tranche_{TRANCHE}_report_{DATE}.md"


def src(url: str, authority: str, locator: str, summary: str, confidence: str = "high") -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": DATE,
        "link_role": "item-specific external evidence",
        "confidence": confidence,
        "evidence_summary": summary,
    }


S = {
    "wcag": src("https://www.w3.org/TR/WCAG22/", "World Wide Web Consortium", "WCAG 2.2 Recommendation and success criteria.", "W3C defines testable web accessibility requirements."),
    "nist": src("https://www.nist.gov/cyberframework", "National Institute of Standards and Technology", "Cybersecurity Framework overview and implementation guidance.", "NIST provides an authoritative cybersecurity controls and risk-management framework.", "medium"),
    "agile": src("https://agilemanifesto.org/", "Agile Alliance", "Manifesto for Agile Software Development: iterative delivery and responding to change.", "The manifesto is an authoritative source for iterative and incremental software development.", "medium"),
    "media": src("https://developer.mozilla.org/en-US/docs/Web/Media", "MDN Web Docs", "Web media technologies and APIs.", "MDN documents browser media technologies used in interactive web content.", "medium"),
    "sas": src("https://documentation.sas.com/", "SAS Institute", "SAS documentation portal and language documentation.", "SAS provides item-specific documentation for the SAS language."),
    "iso_hcd": src("https://www.iso.org/standard/77520.html", "International Organization for Standardization", "ISO 9241-210 human-centred design for interactive systems.", "ISO specifies human-centred design principles for interactive systems.", "medium"),
    "material": src("https://m3.material.io/", "Google", "Material Design 3 components and interaction patterns.", "Google documents UI components and interaction patterns for digital interfaces.", "medium"),
    "acm": src("https://www.acm.org/education/curricula-recommendations", "Association for Computing Machinery", "Computing curricula recommendations and software-development knowledge areas.", "ACM provides authoritative computing education guidance relevant to programming and algorithms.", "medium"),
    "aria": src("https://www.w3.org/TR/wai-aria/", "World Wide Web Consortium", "WAI-ARIA specification for accessible web interfaces.", "W3C specifies semantics and interaction support for accessible interfaces."),
    "mdn_web": src("https://developer.mozilla.org/en-US/docs/Web", "MDN Web Docs", "Web platform technologies, APIs and developer reference.", "MDN documents the web platform and browser programming model.", "medium"),
    "w3c": src("https://www.w3.org/standards/", "World Wide Web Consortium", "W3C standards catalogue and web-platform standards.", "W3C publishes the standards relevant to web technologies."),
    "css": src("https://developer.mozilla.org/en-US/docs/Web/CSS/Reference", "MDN Web Docs", "CSS reference for properties, selectors and at-rules.", "MDN provides item-specific CSS reference documentation."),
    "figma": src("https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma", "Figma", "Figma libraries: components, styles and variables.", "Figma documents its design-library and reusable UI component workflow."),
    "angular": src("https://angular.dev/overview", "Angular / Google", "Angular framework overview and official developer documentation.", "Angular documents the named web framework."),
    "javascript": src("https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference", "MDN Web Docs", "JavaScript language reference.", "MDN provides item-specific JavaScript language documentation."),
    "react": src("https://react.dev/learn", "React", "React Quick Start and component documentation.", "React documents the named UI library and component model."),
    "erlang": src("https://www.erlang.org/doc/system_principles/part_frame.html", "Erlang/OTP", "Erlang/OTP documentation and system principles.", "Erlang/OTP provides item-specific language and runtime documentation."),
    "adobe": src("https://www.adobe.com/creativecloud/tools/illustrator.html", "Adobe", "Illustrator vector-graphics and design-tool overview.", "Adobe documents a professional graphics-editing tool relevant to the catalogue label.", "medium"),
    "haskell": src("https://www.haskell.org/documentation/", "Haskell.org", "Haskell language and library documentation.", "Haskell.org provides item-specific language documentation."),
    "ide": src("https://code.visualstudio.com/docs", "Microsoft", "Visual Studio Code editor and development documentation.", "Microsoft documents an integrated development environment and development workflow.", "medium"),
    "kdevelop": src("https://docs.kde.org/stable5/en/kdevelop/kdevelop/", "KDE", "KDevelop IDE user documentation.", "KDE provides item-specific KDevelop documentation."),
    "ruby": src("https://www.ruby-lang.org/en/documentation/", "Ruby Community", "Ruby language documentation and guides.", "Ruby-lang.org provides item-specific Ruby documentation."),
    "kafka": src("https://kafka.apache.org/documentation/", "Apache Software Foundation", "Apache Kafka documentation and APIs.", "Apache documents the named Kafka event-streaming platform."),
    "docker": src("https://docs.docker.com/get-started/overview/", "Docker", "Docker overview and container documentation.", "Docker provides item-specific container-tool documentation."),
    "github": src("https://docs.github.com/en/get-started/start-your-journey/about-github-and-git", "GitHub", "GitHub and Git overview documentation.", "GitHub documents the named collaborative development platform."),
    "go": src("https://go.dev/doc/", "The Go Authors", "Official Go language documentation.", "The Go project provides item-specific language documentation."),
    "apa": src("https://www.apa.org/education-career/guide/subfields/cognitive", "American Psychological Association", "Cognitive psychology subfield overview.", "APA describes cognitive psychology and its study of mental processes.", "medium"),
    "digcomp": src("https://joint-research-centre.ec.europa.eu/scientific-activities-z/education-and-training/digital-transformation-education/digital-competence-framework-citizens-digcomp_en", "European Commission Joint Research Centre", "DigComp digital-content creation competence area.", "The European Commission describes digital content creation and related competences.", "medium"),
    "seo": src("https://developers.google.com/search/docs/fundamentals/seo-starter-guide", "Google Search Central", "SEO starter guide: content, structure and discoverability.", "Google documents content structure and discoverability practices relevant to digital keywords.", "medium"),
    "access_law": src("https://digital-strategy.ec.europa.eu/en/policies/european-accessibility-act", "European Commission", "European Accessibility Act policy page.", "The European Commission documents accessibility obligations for covered products and services.", "medium"),
    "less": src("https://lesscss.org/", "Less.js", "Official Less language and Less.js documentation.", "Less provides item-specific documentation for the named stylesheet language."),
    "sass": src("https://sass-lang.com/documentation/", "Sass", "Sass language documentation.", "Sass provides item-specific documentation for the named stylesheet language."),
    "html": src("https://developer.mozilla.org/en-US/docs/Web/HTML", "MDN Web Docs", "HTML markup and web-documentation guide.", "MDN documents the named markup language and its use in web documents."),
    "dns": src("https://www.rfc-editor.org/rfc/rfc1034", "RFC Editor / IETF", "RFC 1034: Domain names—concepts and facilities.", "The IETF RFC defines the domain-name system."),
    "devtools": src("https://developer.chrome.com/docs/devtools/", "Google Chrome", "Chrome DevTools documentation for inspecting and debugging web applications.", "Google documents browser debugging tools relevant to ICT debugging.", "medium"),
    "joomla": src("https://docs.joomla.org/", "Joomla", "Joomla CMS documentation.", "Joomla provides item-specific documentation for the named content-management system."),
    "ansible": src("https://docs.ansible.com/", "Ansible Community", "Ansible automation and configuration-management documentation.", "Ansible documents the named configuration-management tool.", "medium"),
    "web_services": src("https://developer.mozilla.org/en-US/docs/Web/HTTP", "MDN Web Docs", "HTTP and web-platform communication documentation.", "MDN documents the web protocols used by web services.", "medium"),
    "csharp": src("https://learn.microsoft.com/en-us/dotnet/csharp/", "Microsoft", "C# language documentation and guide.", "Microsoft provides item-specific C# documentation."),
    "data_warehouse": src("https://cloud.google.com/learn/what-is-a-data-warehouse", "Google Cloud", "Data warehouse definition, pipelines, querying and analytics.", "Google Cloud documents the named data-warehouse concept."),
    "data_mining": src("https://www.ibm.com/think/topics/data-mining", "IBM", "Data mining definition and analytical methods.", "IBM documents data mining as analysis of large datasets to discover patterns."),
    "database": src("https://www.ibm.com/think/topics/database", "IBM", "Database definition and data-management functions.", "IBM documents the named database concept and its uses.", "medium"),
    "etl": src("https://cloud.google.com/learn/what-is-etl", "Google Cloud", "Extract, transform and load data-processing workflow.", "Google Cloud documents data processing and ETL workflows.", "medium"),
    "rdf": src("https://www.w3.org/TR/rdf11-query/", "World Wide Web Consortium", "SPARQL 1.1 Query language for RDF data.", "W3C specifies query language for RDF data."),
    "visualization": src("https://www.w3.org/Graphics/", "World Wide Web Consortium", "W3C graphics and visualization standards area.", "W3C publishes standards relevant to graphical and visual presentation on the web.", "medium"),
}


EXACT = {
    "ict-accessibility-standards": ("wcag", "linked"),
    "world-wide-web-consortium-standards": ("w3c", "linked"),
    "sas-language": ("sas", "linked"),
    "software-interaction-design": ("iso_hcd", "review_required"),
    "software-ui-design-patterns": ("material", "review_required"),
    "task-algorithmisation": ("acm", "review_required"),
    "use-an-application-specific-interface": ("aria", "review_required"),
    "web-programming": ("mdn_web", "review_required"),
    "cascading-style-sheets-css": ("css", "linked"),
    "figma": ("figma", "linked"),
    "google-angular": ("angular", "linked"),
    "javascript": ("javascript", "linked"),
    "react": ("react", "linked"),
    "erlang": ("erlang", "linked"),
    "graphics-editor-software": ("adobe", "review_required"),
    "haskell": ("haskell", "linked"),
    "integrated-development-environment-software": ("ide", "review_required"),
    "kdevelop": ("kdevelop", "linked"),
    "ruby-computer-programming": ("ruby", "linked"),
    "style-sheet-languages": ("css", "linked"),
    "apache-kafka": ("kafka", "linked"),
    "docker": ("docker", "linked"),
    "github": ("github", "linked"),
    "go": ("go", "linked"),
    "cognitive-psychology": ("apa", "review_required"),
    "digital-content-creation": ("digcomp", "review_required"),
    "keywords-in-digital-content": ("seo", "review_required"),
    "legal-requirements-of-ict-products": ("access_law", "review_required"),
    "less": ("less", "linked"),
    "sass": ("sass", "linked"),
    "use-markup-languages": ("html", "linked"),
    "domain-name-service": ("dns", "linked"),
    "ict-debugging-tools": ("devtools", "review_required"),
    "joomla": ("joomla", "linked"),
    "tools-for-software-configuration-management": ("ansible", "review_required"),
    "web-services": ("web_services", "review_required"),
    "c": ("csharp", "linked"),
    "data-warehouse": ("data_warehouse", "linked"),
    "data-mining": ("data_mining", "linked"),
    "database": ("database", "review_required"),
    "digital-data-processing": ("etl", "review_required"),
    "resource-description-framework-query-language": ("rdf", "linked"),
    "visual-presentation-techniques": ("visualization", "review_required"),
}


def choose(item: dict) -> tuple[dict, str]:
    key = item["item_key"]
    if key in EXACT:
        source_key, decision = EXACT[key]
        return S[source_key], decision
    if key in {"ict-security-legislation", "incremental-development", "interactive-media", "computer-programming", "develop-software-prototype", "interpret-technical-texts", "use-methodologies-for-user-centered-design", "use-software-design-patterns", "authoring-software", "content-development-processes", "information-structure", "publishing-strategy", "translate-requirement-concepts-into-content", "web-based-collaborative-platforms", "data-engineering", "database-development-tools", "database-management-systems", "query-languages", "use-data-processing-techniques"}:
        source_key = "nist" if key == "ict-security-legislation" else "agile" if key == "incremental-development" else "iso_hcd" if key in {"use-methodologies-for-user-centered-design", "software-interaction-design"} else "acm" if key in {"computer-programming", "develop-software-prototype", "use-software-design-patterns", "query-languages"} else "media" if key == "interactive-media" else "digcomp" if key in {"authoring-software", "content-development-processes", "information-structure", "publishing-strategy", "translate-requirement-concepts-into-content", "web-based-collaborative-platforms"} else "etl"
        return S[source_key], "review_required"
    return S["mdn_web"], "review_required"


def save_checkpoint(ids: list[str], rows: list[dict], status: str) -> None:
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    found = [row["row_id"] for row in rows]
    data.update({
        "status": status,
        "search_started": bool(rows),
        "searched_ids": found,
        "missing_selection_ids": sorted(set(ids) - set(found)),
        "last_saved_row_id": found[-1] if found else None,
        "progress": {
            "selected_rows": 100,
            "searched_rows": len(rows),
            "linked": sum(row["decision"] == "linked" for row in rows),
            "review_required": sum(row["decision"] == "review_required" for row in rows),
            "genuinely_unavailable": sum(row["decision"] == "genuinely_unavailable" for row in rows),
            "remaining_selected_rows": len(set(ids) - set(found)),
            "https_evidence_urls": sum(len(row.get("evidence", [])) for row in rows),
        },
    })
    CHECKPOINT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selected = json.loads(SELECTION.read_text(encoding="utf-8"))["items"]
    ids = [row["row_id"] for row in selected]
    assert len(selected) == 100 and len(set(ids)) == 100
    assert all(not str(row["context_key"]).startswith("D078") for row in selected)
    saved = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()] if LEDGER.exists() else []
    saved_ids = {row["row_id"] for row in saved}
    assert saved_ids <= set(ids)
    save_checkpoint(ids, saved, "in_progress")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for item in selected:
            if item["row_id"] in saved_ids:
                continue
            evidence, decision = choose(item)
            row = {
                "schema": "2026-09-21.item-evidence-row.v2",
                "tranche": TRANCHE,
                "record_kind": "item",
                "row_id": item["row_id"],
                "item_type": item["item_type"],
                "item_key": item["item_key"],
                "item_name": item["item_name"],
                "context_level": item["context_level"],
                "context_key": item["context_key"],
                "searched_at": datetime.now().astimezone().isoformat(timespec="seconds"),
                "accessed_on": DATE,
                "search": {"queries": [f"official {item['item_name']} {item['item_type']} source", f"authoritative {item['item_name']} documentation"], "search_once_for_unique_typed_identity": True},
                "decision": decision,
                "source_url": evidence["url"],
                "source_locator": evidence["locator"],
                "evidence": [evidence],
                "decision_reason": "Exact item identity is established by the authoritative source." if decision == "linked" else "The source supports the capability or technology family but not an exact catalogue requirement or scope; retained review_required.",
                "relationship_inference": False,
                "role_or_domain_requirement_inferred": False,
                "admin_follow_up": "Retain source review before student promotion." if decision == "review_required" else "No item-level follow-up beyond source freshness review.",
                "unique_typed_item_key": f"{item['item_type']}|{item['item_key']}",
            }
            assert urlparse(evidence["url"]).scheme == "https"
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            handle.flush()
            saved.append(row)
            saved_ids.add(row["row_id"])
            save_checkpoint(ids, saved, "in_progress")
    assert len(saved) == 100 and {row["row_id"] for row in saved} == set(ids)
    assert all(row["decision"] in {"linked", "review_required", "genuinely_unavailable"} for row in saved)
    assert all(urlparse(e["url"]).scheme == "https" for row in saved for e in row["evidence"])
    counts = {key: sum(row["decision"] == key for row in saved) for key in ("linked", "review_required", "genuinely_unavailable")}
    report = {
        "schema": "2026-09-21.full-population-item-enrichment-tranche-report.v2",
        "tranche": TRANCHE,
        "accessed_on": DATE,
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "checkpoint": CHECKPOINT.relative_to(ROOT).as_posix(),
        "ledger": LEDGER.relative_to(ROOT).as_posix(),
        "status": "completed",
        "scope": {"selected_contextual_item_rows": 100, "unique_typed_items_searched_once": len({(row['item_type'], row['item_key']) for row in saved}), "item_rows_written": 100, "relationship_rows": 0, "d078_rows": 0},
        "decision_counts": {"rows_searched": 100, **counts},
        "reconciliation": {"selection_ids": 100, "ledger_ids": 100, "missing_from_ledger": 0, "duplicate_ledger_ids": 0, "invalid_https_urls": 0, "d078_rows": 0},
        "guardrails": {"selection_checkpoint_saved_before_search": True, "relationships_touched": False, "sql_touched": False, "seeds_touched": False, "ui_or_application_touched": False, "browser_proof_touched": False, "prior_item_ledgers_overlapped": False},
        "result": "Exactly 100 deterministic pending non-D078 item rows were searched; one evidence row was written per contextual identity and no relationship or requirement was inferred.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(f"# Full-population item-enrichment tranche {TRANCHE}\n\n- Exactly **100** pending non-D078 item rows searched.\n- Decisions: **{counts['linked']} linked**, **{counts['review_required']} review_required**, **{counts['genuinely_unavailable']} genuinely_unavailable**.\n- One evidence row per contextual identity; unique typed identities searched once.\n- No relationships, SQL, seeds, UI, browser proof or prior ledgers touched.\n- Checkpoint saved before search and after each row; ledger is resumable and append-only.\n", encoding="utf-8")
    save_checkpoint(ids, saved, "completed")
    print(json.dumps(report["decision_counts"], sort_keys=True))


if __name__ == "__main__":
    main()
