"""Run tranche 019 with software-development and UI-specific evidence routing."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("tranche018_search_impl", HERE / "full_population_tranche_018_search.py")
assert spec and spec.loader
wrapper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = wrapper
spec.loader.exec_module(wrapper)
impl = wrapper.module
base_source_for = wrapper.source_for

impl.TRANCHE = "019"
impl.SELECTION = HERE / "full_population_tranche_019_selection_2026-09-21.json"
impl.CHECKPOINT = HERE / "full_population_tranche_019_checkpoint_2026-09-21.json"
impl.LEDGER = HERE / "full_population_tranche_019_search_ledger_2026-09-21.jsonl"
impl.REPORT_JSON = HERE / "full_population_tranche_019_report_2026-09-21.json"
impl.REPORT_MD = HERE / "full_population_tranche_019_report_2026-09-21.md"


def source_for(item_type: str, key: str, name: str):
    k = key.casefold()
    exact = {
        "kdevelop": ("KDevelop", "https://kdevelop.org/", "Official KDevelop project page"),
        "ruby-computer-programming": ("Ruby Core Team", "https://www.ruby-lang.org/en/", "Official Ruby language site"),
        "sas-language": ("SAS", "https://www.sas.com/en_us/software/viya.html", "SAS Viya software page"),
        "apache-kafka": ("Apache Software Foundation", "https://kafka.apache.org/", "Apache Kafka project page"),
        "cascading-style-sheets-css": ("MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/CSS", "CSS reference"),
        "docker": ("Docker", "https://www.docker.com/products/docker-desktop/", "Docker Desktop product page"),
        "go": ("Go Project", "https://go.dev/", "Official Go language site"),
        "erlang": ("Erlang/OTP", "https://www.erlang.org/", "Official Erlang site"),
        "haskell": ("Haskell", "https://www.haskell.org/", "Official Haskell site"),
        "ibm-terraform": ("HashiCorp", "https://developer.hashicorp.com/terraform", "Terraform documentation"),
        "kubernetes": ("Cloud Native Computing Foundation", "https://kubernetes.io/", "Kubernetes project page"),
        "graphics-editor-software": ("Adobe", "https://www.adobe.com/products/photoshop.html", "Adobe Photoshop product page"),
        "web-services": ("World Wide Web Consortium", "https://www.w3.org/standards/webofservices", "Web services standards"),
    }
    if k in exact:
        authority, url, locator = exact[k]
        return k, url, authority, locator, "linked", "The authoritative vendor/project page verifies the named software or language identity; no role requirement was inferred."
    if k in {"software-design-methodologies", "software-architecture-models", "system-design", "align-software-with-system-architectures", "systems-development-life-cycle", "object-oriented-modelling", "use-software-design-patterns", "software-design", "create-software-design"}:
        return "software_architecture", "https://www.sei.cmu.edu/our-work/software-architecture/", "Software Engineering Institute", "Software architecture practice", "review_required", "SEI provides authoritative software-architecture context, but the exact normalized local skill was not established as a standalone outcome."
    if k in {"data-models", "database-quality-standards"}:
        return "data", "https://www.postgresql.org/docs/current/ddl.html", "PostgreSQL Global Development Group", "Data-definition and data-model documentation", "review_required", "The official database documentation supports data-structure context, but not the exact local role requirement."
    if k in {"ict-system-user-requirements", "identify-customer-requirements", "business-requirements-techniques", "analyse-business-processes", "business-process-modelling"}:
        return "requirements", "https://www.iso.org/standard/72018.html", "ISO/IEC/IEEE", "Systems and software engineering requirements engineering", "review_required", "The requirements-engineering standard supports the capability family, but not the exact normalized local skill as a standalone requirement."
    if k in {"software-metrics"}:
        return "metrics", "https://www.sei.cmu.edu/our-work/software-measurement/", "Software Engineering Institute", "Software measurement", "review_required", "SEI supports software-measurement context, but not the exact local role requirement."
    if k in {"computer-programming", "integrated-development-environment-software", "ict-debugging-tools", "utilise-computer-aided-software-engineering-tools", "tools-for-software-configuration-management", "develop-software-prototype", "develop-automated-migration-methods", "migrate-existing-data", "mobile-operating-systems", "use-an-application-specific-interface"}:
        return "software_practice", "https://www.iso.org/standard/72018.html", "ISO/IEC/IEEE", "Software engineering and requirements practice", "review_required", "The standards source supports software-engineering practice broadly, but the exact normalized local skill remains review_required."
    if k in {"agile-project-management", "incremental-development"}:
        return "agile", "https://www.atlassian.com/agile", "Atlassian", "Agile guide", "review_required", "The source supports agile practice, but not the exact local role requirement."
    if k in {"translate-requirements-into-visual-design", "application-usability", "human-computer-interaction"}:
        return "ux", "https://www.nngroup.com/articles/definition-user-experience/", "Nielsen Norman Group", "User-experience definition", "review_required", "The source supports UX/HCI context, but not the exact normalized local skill."
    return base_source_for(item_type, key, name)


impl.source_for = source_for
if __name__ == "__main__":
    impl.main()
