"""Run tranche 020 with database, accessibility and ICT-operations evidence."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("tranche019_search_impl", HERE / "full_population_tranche_019_search.py")
assert spec and spec.loader
wrapper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = wrapper
spec.loader.exec_module(wrapper)
impl = wrapper.impl
base_source_for = wrapper.source_for
impl.TRANCHE = "020"
impl.SELECTION = HERE / "full_population_tranche_020_selection_2026-09-21.json"
impl.CHECKPOINT = HERE / "full_population_tranche_020_checkpoint_2026-09-21.json"
impl.LEDGER = HERE / "full_population_tranche_020_search_ledger_2026-09-21.jsonl"
impl.REPORT_JSON = HERE / "full_population_tranche_020_report_2026-09-21.json"
impl.REPORT_MD = HERE / "full_population_tranche_020_report_2026-09-21.md"


def source_for(item_type: str, key: str, name: str):
    k = key.casefold()
    exact = {
        "apache-maven": ("Apache Maven", "https://maven.apache.org/", "Apache Maven project page"),
        "chef-tools-for-software-configuration-management": ("Chef", "https://www.chef.io/products/chef-infra", "Chef Infra product page"),
        "octopus-deploy": ("Octopus Deploy", "https://octopus.com/", "Octopus Deploy product page"),
        "amazon-dynamodb": ("Amazon Web Services", "https://aws.amazon.com/dynamodb/", "Amazon DynamoDB product page"),
        "tableau": ("Salesforce Tableau", "https://www.tableau.com/products", "Tableau products"),
        "apache-spark": ("Apache Software Foundation", "https://spark.apache.org/", "Apache Spark project page"),
        "oracle-java": ("Oracle", "https://www.oracle.com/java/", "Oracle Java product page"),
        "resource-description-framework-query-language": ("World Wide Web Consortium", "https://www.w3.org/TR/sparql12-query/", "SPARQL query language"),
        "world-wide-web-consortium-standards": ("World Wide Web Consortium", "https://www.w3.org/standards/", "W3C standards"),
        "ict-accessibility-standards": ("World Wide Web Consortium", "https://www.w3.org/WAI/standards-guidelines/wcag/", "Web Content Accessibility Guidelines"),
    }
    if k in exact:
        authority, url, locator = exact[k]
        return k, url, authority, locator, "linked", "The authoritative project or standards page verifies the named item identity; no role requirement was inferred."
    if k == "screen-reader":
        return "screen-reader", "https://www.w3.org/WAI/perspective-videos/speech/", "World Wide Web Consortium", "WAI speech and screen-reader accessibility perspective", "review_required", "W3C supports screen-reader accessibility context, but not the exact local role requirement."
    if any(x in k for x in ("security-policy", "network-security", "system-security", "recovery-techniques", "problem-management", "usage-risks", "impact-evaluation")):
        return "security", "https://www.nist.gov/cyberframework", "National Institute of Standards and Technology", "Cybersecurity Framework", "review_required", "NIST supports ICT security, risk and recovery context, but not the exact normalized local skill label."
    if any(x in k for x in ("data", "database", "rdf", "query", "information-structure", "data-storage", "data-mining", "information-extraction")):
        return "data", "https://www.iso.org/standard/72018.html", "ISO/IEC/IEEE", "Software and systems requirements/data practice context", "review_required", "The standards source supports the data/software capability family, but not the exact normalized local skill label."
    if any(x in k for x in ("business-process", "business-strategy", "business-analysis", "cost-benefit", "consulting", "technology-strategy", "ict-solutions", "customer-requirements", "change-management")):
        return "requirements", "https://www.iso.org/standard/72018.html", "ISO/IEC/IEEE", "Requirements-engineering standard", "review_required", "The standard supports requirements and systems-analysis context, but no role requirement was inferred."
    if any(x in k for x in ("deploy", "release", "configuration", "administer", "manage-changes", "project-configuration", "scripting")):
        return "devops", "https://www.cisa.gov/resources-tools/resources/software-supply-chain-security-guidance", "Cybersecurity and Infrastructure Security Agency", "Software supply-chain and deployment security guidance", "review_required", "The source supports ICT deployment/configuration practice, but not the exact normalized local item label."
    if k in {"digital-communication-and-collaboration", "manage-business-knowledge", "keep-up-with-the-latest-information-systems-solutions"}:
        return "knowledge", "https://www.iso.org/standard/27001.html", "International Organization for Standardization", "Information-security and information-management standard", "review_required", "The source supports information-management context, but not the exact normalized local skill label."
    return base_source_for(item_type, key, name)


impl.source_for = source_for
if __name__ == "__main__":
    impl.main()
