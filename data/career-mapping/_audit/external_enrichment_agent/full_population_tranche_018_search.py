"""Run tranche 018 with ICT-specific evidence routing, reusing ledger guardrails."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("tranche017_search", HERE / "full_population_tranche_017_search.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

module.TRANCHE = "018"
module.SELECTION = HERE / "full_population_tranche_018_selection_2026-09-21.json"
module.CHECKPOINT = HERE / "full_population_tranche_018_checkpoint_2026-09-21.json"
module.LEDGER = HERE / "full_population_tranche_018_search_ledger_2026-09-21.jsonl"
module.REPORT_JSON = HERE / "full_population_tranche_018_report_2026-09-21.json"
module.REPORT_MD = HERE / "full_population_tranche_018_report_2026-09-21.md"


def source_for(item_type: str, key: str, name: str):
    k = key.casefold()
    if k == "atlassian-confluence":
        return "confluence", "https://www.atlassian.com/software/confluence", "Atlassian", "Confluence product page", "linked", "The vendor page names Confluence as the collaboration and knowledge-management product; this verifies the tool identity only."
    if k == "servicenow":
        return "servicenow", "https://www.servicenow.com/products/itsm.html", "ServiceNow", "IT Service Management product page", "linked", "The vendor page names ServiceNow ITSM; this verifies the tool identity only."
    if k in {"github", "jenkins-ci"}:
        url = "https://github.com/" if k == "github" else "https://www.jenkins.io/"
        authority = "GitHub" if k == "github" else "Jenkins"
        return k, url, authority, "Official product/project page", "linked", "The official project page verifies the named tool identity; no role requirement was inferred."
    if k in {"c", "javascript"}:
        url = "https://learn.microsoft.com/en-us/dotnet/csharp/" if k == "c" else "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
        authority = "Microsoft" if k == "c" else "MDN Web Docs"
        return k, url, authority, "Language reference", "linked", "The authoritative language reference verifies the named language/tool identity; no role requirement was inferred."
    if k == "mdx":
        return "mdx", "https://learn.microsoft.com/en-us/analysis-services/mdx/mdx-reference", "Microsoft", "MDX reference", "linked", "Microsoft documents MDX as a query language/reference identity; no role requirement was inferred."
    if k == "sparql":
        return "sparql", "https://www.w3.org/TR/sparql12-query/", "World Wide Web Consortium", "SPARQL 1.2 Query Language", "linked", "W3C documents the SPARQL query language; no role requirement was inferred."
    if k == "xquery":
        return "xquery", "https://www.w3.org/XML/Query/", "World Wide Web Consortium", "XML Query / XQuery", "linked", "W3C documents XML Query/XQuery; no role requirement was inferred."
    if any(x in k for x in ("test", "testing", "quality-assurance", "software-anomalies", "replicate-customer-software-issues", "report-test-findings")):
        return "testing", "https://www.istqb.org/certifications", "International Software Testing Qualifications Board", "Software-testing certification and glossary context", "review_required", "ISTQB is authoritative testing-practice context, but the page does not verify the exact normalized local skill label as a standalone outcome."
    if "agile" in k:
        return "agile", "https://www.atlassian.com/agile", "Atlassian", "Agile guide", "review_required", "The source supports agile practice, but not the exact local role requirement."
    if any(x in k for x in ("backup", "disaster-recovery")):
        return "backup", "https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final", "National Institute of Standards and Technology", "Contingency planning guide", "review_required", "NIST supports backup/contingency concepts, but the exact normalized skill remains review_required."
    if any(x in k for x in ("attack-vectors", "security-testing", "ict-security", "security-legislation")):
        return "security", "https://owasp.org/www-project-web-security-testing-guide/", "OWASP", "Web Security Testing Guide", "review_required", "OWASP supports application-security testing concepts, but no exact role requirement was inferred."
    if any(x in k for x in ("usability", "human-computer", "experience-map", "interaction", "behavioural", "behavioral", "cognitive", "emotional-patterns")):
        return "ux", "https://www.nngroup.com/articles/definition-user-experience/", "Nielsen Norman Group", "User-experience definition and methods", "review_required", "The source supports UX/usability research context, but not the exact normalized local skill label."
    if any(x in k for x in ("systems-theory", "systems-development", "middleware", "integrate-system", "application-specific-interface")):
        return "systems", "https://www.incose.org/communities/what-is-systems-engineering", "International Council on Systems Engineering", "What is systems engineering", "review_required", "INCOSE supports systems-engineering context, but the exact normalized ICT skill remains review_required."
    if "decision-support" in k:
        return "decision-support", "https://www.ibm.com/topics/decision-support-systems", "IBM", "Decision-support systems overview", "review_required", "IBM supports the named decision-support concept, but no role requirement was inferred."
    if any(x in k for x in ("database-quality", "quality-policy", "quality-control", "comply-with-legal", "internal-risk", "ict-process-quality")):
        return "quality", "https://www.iso.org/iso-9001-quality-management.html", "International Organization for Standardization", "ISO 9001 quality-management overview", "review_required", "ISO supports quality-management context, but not the exact normalized local skill label."
    if any(x in k for x in ("research-interview", "address-problems", "visual-presentation")):
        return "research", "https://www.nationalacademies.org/our-work/the-responsible-conduct-of-research", "National Academies of Sciences, Engineering, and Medicine", "Responsible research conduct", "review_required", "The source supports research/professional-practice context, but not the exact normalized ICT skill label."
    return "ict", "https://www.nist.gov/cyberframework", "National Institute of Standards and Technology", "Cybersecurity Framework", "review_required", "NIST provides ICT/cybersecurity context, but the exact normalized local item label was not established as a standalone outcome."


module.source_for = source_for

if __name__ == "__main__":
    module.main()
