#!/usr/bin/env python3
"""Build the source-backed programme/domain/subgroup/role context catalogue.

This catalogue is deliberately narrower than the raw taxonomy tables:

* domain rows come from domain-owned Nigerian/global evidence only;
* subgroup rows come from explicitly named subgroup records;
* role rows come from the role record and its named tool evidence;
* generic O*NET element categories are excluded as student tool names.

The output is partitioned because the complete role catalogue is too large for
one practical Supabase SQL paste.  The SQL is idempotent and can be run after
``migration_contextual_career_items.sql`` and
``migration_career_context_claim_validation.sql``.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import quote_plus

from _role_overlay_loader import load_overlay_roles
from _role_learning_core import student_skill_lists


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "backend" / "seed_career_context_items_v1_parts"
MAX_SQL_BYTES = 6_000_000
VERIFIED_AT = "2026-09-12"
LINK_REVIEWED_AT = "2026-09-19"
ITEM_KEYS: set[tuple[str, str, str, str]] = set()

# These are a deliberately bounded, reviewed sample of item-specific links.
# The URLs are official documentation destinations, not the broad occupation
# or domain sources already carried in ``source_references``.  Every other
# item remains ``no_link`` unless a future source review supplies an explicit
# candidate; name similarity must never manufacture a destination.
VERIFIED_ITEM_LINKS: dict[tuple[str, str], dict[str, object]] = {
    ("tool", "python"): {
        "title": "Python documentation",
        "url": "https://docs.python.org/3/",
        "source_id": "official_python_documentation",
        "authority": "Python Software Foundation",
        "locator": {"kind": "official_documentation", "section": "Python documentation"},
    },
    ("tool", "r"): {
        "title": "The R Manuals",
        "url": "https://cran.r-project.org/manuals.html",
        "source_id": "official_r_manuals",
        "authority": "R Core Team / CRAN",
        "locator": {"kind": "official_documentation", "section": "The R Manuals"},
    },
    ("tool", "microsoft-power-bi"): {
        "title": "Power BI get started documentation",
        "url": "https://learn.microsoft.com/en-us/power-bi/fundamentals/",
        "source_id": "official_power_bi_documentation",
        "authority": "Microsoft Learn",
        "locator": {"kind": "official_documentation", "section": "Power BI fundamentals"},
    },
    ("tool", "esri-arcgis-software"): {
        "title": "Introduction to ArcGIS Pro",
        "url": "https://pro.arcgis.com/en/pro-app/latest/get-started/get-started.htm",
        "source_id": "official_arcgis_pro_documentation",
        "authority": "Esri",
        "locator": {"kind": "official_documentation", "section": "Introduction to ArcGIS Pro"},
    },
    ("tool", "ibm-spss-statistics"): {
        "title": "IBM SPSS Statistics documentation",
        "url": "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=spss-statistics-32-documentation",
        "source_id": "official_ibm_spss_documentation",
        "authority": "IBM",
        "locator": {"kind": "official_documentation", "section": "Getting Started; descriptive statistics, hypothesis testing, predictive analytics, data management and visualisation"},
    },
    ("tool", "microsoft-excel"): {
        "title": "Excel help and learning",
        "url": "https://support.microsoft.com/en-us/excel/",
        "source_id": "official_microsoft_excel_help",
        "authority": "Microsoft Support",
        "locator": {"kind": "official_documentation", "section": "Get started; import and analyse; formulas and functions; PivotTables"},
    },
    ("tool", "structured-query-language-sql"): {
        "title": "Microsoft SQL documentation",
        "url": "https://learn.microsoft.com/sql/",
        "source_id": "official_microsoft_sql_documentation",
        "authority": "Microsoft Learn",
        "locator": {"kind": "official_documentation", "section": "Getting started; connect and query; write Transact-SQL"},
    },
    ("tool", "tableau"): {
        "title": "Get Started with Tableau Desktop",
        "url": "https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm",
        "source_id": "official_tableau_get_started",
        "authority": "Tableau",
        "locator": {"kind": "official_documentation", "section": "Connect to data; create visualisations; present and share findings"},
    },
    ("competency", "formulate-research-questions"): {
        "title": "Where to Begin: Writing Your Research Question",
        "url": "https://owl.purdue.edu/owl/research_and_citation/conducting_research/research_overview/index.html",
        "source_id": "official_purdue_research_question_guidance",
        "authority": "Purdue Online Writing Lab",
        "locator": {"kind": "official_learning_guidance", "section": "Writing Your Research Question; Asking Productive Questions"},
    },
    ("competency", "evaluate-evidence"): {
        "title": "Evidence Synthesis: Start Here",
        "url": "https://www.nihlibrary.nih.gov/services/evidence-synthesis/start-here",
        "source_id": "official_nih_evidence_synthesis_guidance",
        "authority": "National Institutes of Health Library",
        "locator": {"kind": "official_learning_guidance", "section": "Assess the Need; Refine the Question; Select the Review Type"},
    },
}

# Context-scoped external search results are intentionally separate from the
# small global registry above.  A source can support an item in one domain or
# subgroup without being a safe destination for every same-named item in the
# catalogue.  Only records explicitly marked ``linked`` or ``review_required``
# are loaded; the ledger never turns an unsearched item into a claim.
EXTERNAL_CONTEXT_LEDGER_DIR = HERE / "_audit" / "external_enrichment_agent"
EXTERNAL_CONTEXT_LINKS: dict[tuple[str, str, str, str], dict[str, object]] = {}

LINK_STATES = {"linked", "no_link", "review_required"}

GENERIC_TOOL_NAMES = {
    "analytical or scientific software",
    "statistical software",
    "spreadsheet software",
    "office suite software",
    "development environment software",
    "database management system software",
    "database user interface and query software",
    "business intelligence and data analysis software",
    "object or component oriented development software",
    "enterprise application integration software",
    "content workflow software",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_context_search_ledger() -> None:
    ledger_paths = sorted(EXTERNAL_CONTEXT_LEDGER_DIR.glob("*_search_ledger_*.jsonl"))
    for ledger_path in ledger_paths:
        for line in ledger_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            decision = clean(record.get("decision"))
            if decision not in {"linked", "review_required"}:
                continue
            level = clean(record.get("context_level"))
            context_key = clean(record.get("context_key"))
            kind = clean(record.get("item_type"))
            name = clean(record.get("name"))
            if not level or not context_key or not kind or not name:
                continue
            sources = [source for source in (record.get("searched_sources") or []) if isinstance(source, dict)]
            if not sources and clean(record.get("source_url")):
                sources = [{
                    "source_key": clean(record.get("source_reference")),
                    "title": clean((record.get("searched_authorities") or ["External source"])[0]),
                    "url": clean(record.get("source_url")),
                    "authority": clean((record.get("searched_authorities") or ["External source"])[0]),
                    "locator": clean(record.get("source_locator")),
                    "exact_evidence": clean(record.get("evidence")),
                    "accessed_on": clean(record.get("access_date")),
                }]
            sources = [source for source in sources if clean(source.get("url")).startswith("https://")]
            if not sources:
                continue
            EXTERNAL_CONTEXT_LINKS[(level, context_key, kind, slug(name))] = {
                "decision": decision,
                "sources": sources,
                "limitation": clean(record.get("limitation")),
                "accessedAt": clean(record.get("accessed_on") or record.get("searched_at"))[:10],
            }


def external_context_link(level: str, context_key: str, kind: str, name: str) -> dict[str, object] | None:
    return EXTERNAL_CONTEXT_LINKS.get((level, context_key, kind, slug(clean(name))))


def clean(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.casefold() in {"none", "null", "nan"} else text


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
    return value or "item"


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_json(value: object) -> str:
    return sql(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def sql_text_array(values: list[str]) -> str:
    if not values:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ",".join(sql(value) for value in values) + "]::text[]"


def source_ref(source_id: str, title: str, url: str, region: str, evidence_type: str) -> dict:
    return {
        "id": source_id,
        "title": title,
        "url": url,
        "region": region,
        "evidenceType": evidence_type,
    }


def unique_sources(sources: list[dict]) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for item in sources:
        url = clean(item.get("url"))
        if not url.startswith("https://") or url in seen:
            continue
        seen.add(url)
        out.append(item)
    return out


def refs_for_domain(row: dict) -> tuple[list[str], list[dict], list[dict]]:
    ids: list[str] = []
    refs: list[dict] = []
    locators: list[dict] = []
    for body in row.get("nigerian_bodies") or []:
        if not isinstance(body, dict):
            continue
        source_id = clean(body.get("id") or body.get("source_id"))
        if source_id:
            ids.append(source_id)
        for url in body.get("urls") or [body.get("url")]:
            if clean(url):
                refs.append(source_ref(source_id or clean(url), clean(body.get("name") or source_id or "Nigerian source"), clean(url), "nigeria", "nigerian_domain_context"))
    cert = row.get("nigerian_certification_evidence") or {}
    for item in cert.get("sources") or []:
        if not isinstance(item, dict):
            continue
        source_id = clean(item.get("id") or item.get("name"))
        if source_id:
            ids.append(source_id)
        if clean(item.get("url")):
            refs.append(source_ref(source_id, clean(item.get("name") or source_id), clean(item["url"]), "nigeria", "nigerian_certification_context"))
    for source in row.get("global_sources") or []:
        if not isinstance(source, dict):
            continue
        source_id = clean(source.get("source_id") or source.get("id"))
        if source_id:
            ids.append(source_id)
        if clean(source.get("url")):
            refs.append(source_ref(source_id or clean(source["url"]), clean(source.get("name") or source_id or "Global source"), clean(source["url"]), "global", clean(source.get("evidence_type") or "global_context")))
    return list(dict.fromkeys(ids)), unique_sources(refs), locators


def role_refs(role: dict) -> tuple[list[str], list[dict]]:
    ids = ["global_esco"]
    refs = [source_ref("global_esco", "ESCO occupations and skills", "https://esco.ec.europa.eu/en/use-esco?text=" + quote_plus(clean(role.get("role_name"))), "global", "occupation_taxonomy")]
    tool_source = role.get("source")
    if tool_source == "onet":
        ids.append("global_onet")
        refs.append(source_ref("global_onet", "O*NET Database", "https://www.onetcenter.org/database.html", "global", "occupation_taxonomy"))
    context = role.get("nigerian_context") or {}
    for summary in context.get("source_summaries") or []:
        if not isinstance(summary, dict):
            continue
        source_id = clean(summary.get("id") or summary.get("name"))
        if source_id:
            ids.append(source_id)
        for url in summary.get("urls") or []:
            if clean(url):
                refs.append(source_ref(source_id or clean(url), clean(summary.get("name") or source_id), clean(url), "nigeria", clean(summary.get("evidence_type") or "nigerian_role_context")))
    return list(dict.fromkeys(ids)), unique_sources(refs)


def scope_for(refs: list[dict]) -> str:
    regions = {clean(ref.get("region")) for ref in refs}
    if "nigeria" in regions and "global" in regions:
        return "nigeria_to_global"
    return "nigeria" if "nigeria" in regions else "global"


def _normalise_link_candidates(candidates: list[dict] | None) -> list[dict]:
    """Keep only explicit HTTPS candidates while preserving their provenance."""
    normalised: list[dict] = []
    for candidate in candidates or []:
        if not isinstance(candidate, dict):
            continue
        url = clean(candidate.get("url"))
        if not url.startswith("https://"):
            continue
        normalised.append({
            "sourceId": clean(candidate.get("sourceId") or candidate.get("source_id")),
            "title": clean(candidate.get("title")),
            "url": url,
            "locator": candidate.get("locator") if isinstance(candidate.get("locator"), dict) else {},
            "accessedAt": clean(candidate.get("accessedAt") or candidate.get("accessed_at")),
        })
    return _unique_json_values(normalised)


def item_link_contract(
    kind: str,
    name: str,
    candidates: list[dict] | None = None,
    context_link: dict[str, object] | None = None,
) -> dict:
    """Return the explicit item-level link state.

    ``source_references`` describe evidence for an item and are not treated as
    learning links.  A link is ``linked`` only when it is in the bounded
    reviewed registry with an authoritative destination.  A supplied but not
    reviewed candidate is retained for staff review and becomes
    ``review_required``; with no candidate, the honest state is ``no_link``.
    """
    if context_link:
        searched_sources = [source for source in (context_link.get("sources") or []) if isinstance(source, dict)]
        source_references = [{
            "id": clean(source.get("source_key") or source.get("url")),
            "title": clean(source.get("title") or source.get("source_key") or "External source"),
            "url": clean(source.get("url")),
            "authority": clean(source.get("authority")),
            "locator": source.get("locator") if isinstance(source.get("locator"), (dict, list)) else clean(source.get("locator")),
            "evidence": clean(source.get("exact_evidence")),
            "accessedAt": clean(source.get("accessed_on") or context_link.get("accessedAt")),
        } for source in searched_sources if clean(source.get("url")).startswith("https://")]
        if source_references:
            decision = clean(context_link.get("decision"))
            if decision == "linked":
                primary = source_references[0]
                return {
                    "link_state": "linked",
                    "link_url": primary["url"],
                    "link_title": primary["title"],
                    "link_source_reference": primary,
                    "link_accessed_at": clean(context_link.get("accessedAt")) or None,
                    "link_confidence": "medium",
                    "link_evidence": {
                        "status": "context_item_specific_external_verified",
                        "sources": source_references,
                        "reviewedAt": clean(context_link.get("accessedAt")) or LINK_REVIEWED_AT,
                        "confidence": "medium",
                        "limitation": clean(context_link.get("limitation")) or None,
                    },
                    "no_link_reason": None,
                }
            if decision == "review_required":
                limitation = clean(context_link.get("limitation")) or "The searched source does not yet support the full item claim."
                return {
                    "link_state": "review_required",
                    "link_url": None,
                    "link_title": None,
                    "link_source_reference": {"candidates": source_references},
                    "link_accessed_at": None,
                    "link_confidence": "low",
                    "link_evidence": {
                        "status": "context_candidate_review_required",
                        "sources": source_references,
                        "reviewedAt": clean(context_link.get("accessedAt")) or LINK_REVIEWED_AT,
                        "confidence": "low",
                        "limitation": limitation,
                    },
                    "no_link_reason": limitation,
                }

    key = (kind, slug(clean(name)))
    reviewed = VERIFIED_ITEM_LINKS.get(key)
    if reviewed:
        source_reference = {
            "id": reviewed["source_id"],
            "title": reviewed["title"],
            "url": reviewed["url"],
            "authority": reviewed["authority"],
            "locator": reviewed["locator"],
            "accessedAt": LINK_REVIEWED_AT,
        }
        return {
            "link_state": "linked",
            "link_url": reviewed["url"],
            "link_title": reviewed["title"],
            "link_source_reference": source_reference,
            "link_accessed_at": LINK_REVIEWED_AT,
            "link_confidence": "high",
            "link_evidence": {
                "status": "item_specific_verified",
                "sources": [source_reference],
                "reviewedAt": LINK_REVIEWED_AT,
                "confidence": "high",
            },
            "no_link_reason": None,
        }

    retained_candidates = _normalise_link_candidates(candidates)
    if retained_candidates:
        return {
            "link_state": "review_required",
            "link_url": None,
            "link_title": None,
            "link_source_reference": {"candidates": retained_candidates},
            "link_accessed_at": None,
            "link_confidence": "low",
            "link_evidence": {
                "status": "candidate_review_required",
                "sources": retained_candidates,
                "reviewedAt": LINK_REVIEWED_AT,
                "confidence": "low",
            },
            "no_link_reason": "A candidate source link is retained, but it has not passed item-specific authority and destination review.",
        }

    return {
        "link_state": "no_link",
        "link_url": None,
        "link_title": None,
        "link_source_reference": {},
        "link_accessed_at": None,
        "link_confidence": "low",
        "link_evidence": {
            "status": "no_item_specific_source_verified",
            "sources": [],
            "reviewedAt": LINK_REVIEWED_AT,
            "confidence": "low",
        },
        "no_link_reason": "No reviewed item-specific learning, documentation or official-information link is recorded for this item.",
    }


def add(rows: list[dict], *, level: str, key: str, domain: str, kind: str, name: str,
        meaning: str, use: str, output: str, priority: str, reason: str,
        prerequisites: list[str], related: list[str], source_ids: list[str],
        refs: list[dict], locators: list[dict], limitations: list[str], confidence: str = "high",
        relationships: list[dict] | None = None,
        link_candidates: list[dict] | None = None,
        context_link: dict[str, object] | None = None) -> None:
    name = clean(name)
    if not name or not refs:
        return
    item_key = slug(name)
    identity = (level, key, kind, item_key)
    if identity in ITEM_KEYS:
        return
    ITEM_KEYS.add(identity)
    link = item_link_contract(kind, name, link_candidates, context_link)
    link_reference = link["link_source_reference"]
    if link["link_state"] == "linked":
        source_id = clean(link_reference.get("id"))
        if source_id:
            source_ids = list(dict.fromkeys([*source_ids, source_id]))
        refs = unique_sources([*refs, source_ref(
            source_id,
            clean(link_reference.get("title")),
            clean(link_reference.get("url")),
            "global",
            "item_specific_documentation",
        )])
    rows.append({
        "context_level": level,
        "context_key": key,
        "domain_key": domain,
        "item_type": kind,
        "item_key": item_key,
        "name": name,
        "plain_meaning": meaning,
        "contextual_use": use,
        "expected_output": output,
        "priority": priority,
        "priority_reason": reason,
        "prerequisites": prerequisites,
        "related_items": related,
        # Relationships are separate claims and require their own evidence.
        # Keep the legacy arrays for compatibility, but never derive graph
        # edges from item-list order or co-occurrence.
        "relationships": relationships or [],
        "source_ids": list(dict.fromkeys(source_ids)),
        "source_references": unique_sources(refs),
        "source_locators": locators,
        "geographic_scope": scope_for(refs),
        "evidence_limitations": limitations,
        "evidence_type": "source_supported_synthesis",
        "source_confidence": confidence,
        "data_state": "source_backed",
        "guidance_owner": level,
        # Presence/provenance does not certify every learner-facing claim.
        # Approval requires an explicit checkpoint-scoped evidence ledger.
        "claim_review_state": "review_required",
        "claim_evidence": {},
        "verified_at": VERIFIED_AT,
        "link_kind": None,
        "link_level": None,
        "link_language": None,
        "link_access": None,
        "link_duration": None,
        **link,
    })


def item_meaning(kind: str, name: str) -> str:
    lower = name[:1].lower() + name[1:]
    if kind == "tool":
        return f"{name} is a named tool in the source record. It is one possible way to {lower} work; it is not the only tool you can use."
    if kind == "certification":
        return f"{name} is a qualification, training or professional pathway named in the source evidence. It is not automatically required for every route."
    return f"This capability is recorded as part of the source-backed preparation for {lower}."


def build() -> list[dict]:
    ITEM_KEYS.clear()
    EXTERNAL_CONTEXT_LINKS.clear()
    load_context_search_ledger()
    audit = load(HERE / "domain_skill_competency_certification_audit.json")
    provenance = load(HERE / "domain_skill_provenance.json")
    source_catalog = load(HERE / "domain_role_source_registry.json").get("source_catalog") or {}
    structure = load(HERE / "domain_structure.json")
    # The canonical role layer is the cleaned library plus the source-backed
    # emerging/thin-domain overlays.  Keep the first occurrence of a role key
    # so the context seed and the reconciled taxonomy cannot drift apart.
    roles_by_key: dict[str, dict] = {}
    for role in load(HERE / "role_library_v3_cleaned.json") + load_overlay_roles():
        key = f"{clean(role.get('domain_id'))}|{clean(role.get('role_name'))}"
        if key.strip("|"):
            roles_by_key.setdefault(key, role)
    roles = list(roles_by_key.values())
    domain_ids = {clean(row.get("domain_id")) for row in audit.get("domains", [])}
    audit_by_id = {clean(row.get("domain_id")): row for row in audit.get("domains", [])}
    rows: list[dict] = []

    # Domain-owned content. The raw role-prevalence foundation is intentionally
    # not read here.
    for domain_id in sorted(domain_ids):
        row = audit_by_id.get(domain_id) or {}
        if not domain_id:
            continue
        domain_name = clean(row.get("domain_name"))
        ids, refs, _ = refs_for_domain(row)
        # The broad web-evidence arrays are search findings, not a vetted
        # student curriculum. In the old builder the first three entries from
        # each array became an arbitrary "start here" sequence, with edges
        # inferred from list order. Use only the explicit domain-owned,
        # approved foundation records from the provenance ledger instead.
        foundation_map = (provenance.get(domain_id) or {}).get("foundation_skills") or {}
        ids: list[str] = []
        domain_foundations: list[tuple[str, dict, list[dict]]] = []
        for item in foundation_map.values():
            if not isinstance(item, dict):
                continue
            if item.get("ownership") != "domain" or item.get("student_visibility") != "approved":
                continue
            if item.get("data_state") != "source_backed" or item.get("source_confidence") not in {"high", "medium"}:
                continue
            item_sources = [clean(value) for value in item.get("sources") or [] if clean(value)]
            item_refs: list[dict] = []
            for source_id in item_sources:
                catalog_key = source_id if source_id in source_catalog else {
                    "esco": "global_esco",
                    "onet": "global_onet",
                }.get(source_id, source_id)
                source = source_catalog.get(catalog_key) or {}
                source_urls = source.get("urls") or ([source.get("url")] if source.get("url") else [])
                for url in source_urls:
                    if clean(url).startswith("https://"):
                        item_refs.append(source_ref(
                            source_id,
                            clean(source.get("name") or catalog_key),
                            clean(url),
                            clean(source.get("region") or "global"),
                            clean(source.get("evidence_type") or "domain_skill_evidence"),
                        ))
            item_refs = unique_sources(item_refs)
            if not item_refs:
                continue
            item_name = clean(item.get("label"))
            if not item_name:
                continue
            ids.extend(item_sources)
            domain_foundations.append((item_name, item, item_refs))
        ids = list(dict.fromkeys(ids))
        # A named credential in the broad domain audit is only a candidate:
        # it is not enough to establish the issuer, current status, eligibility,
        # relevance to this domain, or whether it is optional. Promote it only
        # after an exact domain+credential source review has marked it linked.
        certifications = [clean(value) for value in (row.get("current_domain_certifications") or []) if clean(value)]
        for name, foundation_record, item_refs in domain_foundations:
            add(rows, level="domain", key=domain_id, domain=domain_id, kind="skill", name=name,
                meaning=f"{name} is identified as a shared foundation for {domain_name}; the examples and depth depend on the area you choose.",
                use=f"Build familiarity with {name} before specialising in {domain_name}; use the focused-area and role pages to find its concrete application.",
                output=f"A small, field-relevant work sample showing how you apply {name}.",
                priority="start_here",
                 reason="This source-backed item is owned by the domain. It is an entry foundation, not a ranking against the other foundations.",
                 prerequisites=[], related=[], source_ids=foundation_record.get("sources") or [], refs=item_refs,
                 locators=[{"domainId": domain_id, "evidenceKind": "domain_foundation_skill", "owner": "domain", "provenanceKey": clean(foundation_record.get("label"))}],
                 context_link=external_context_link("domain", domain_id, "skill", name),
                 confidence=clean(foundation_record.get("source_confidence") or "medium"),
                 limitations=["The source supports the domain foundation label; no prerequisite order or item-specific learning link is established here.", "This is not evidence that every connected role or employer requires the item."])
        for name in list(dict.fromkeys(certifications))[:4]:
            credential_evidence = external_context_link("domain", domain_id, "certification", name)
            if not credential_evidence or credential_evidence.get("decision") != "linked":
                continue
            credential_sources = [source for source in (credential_evidence.get("sources") or []) if isinstance(source, dict)]
            credential_refs = unique_sources([
                source_ref(
                    clean(source.get("source_key") or source.get("url")),
                    clean(source.get("title") or name),
                    clean(source.get("url")),
                    "global",
                    "credential_specific_evidence",
                )
                for source in credential_sources
            ])
            if not credential_refs:
                continue
            add(rows, level="domain", key=domain_id, domain=domain_id, kind="certification", name=name,
                meaning=item_meaning("certification", name),
                use="Use this as a pointer to understand the qualification or professional context. Check the Nigerian issuer or regulator first when your intended work is local, then compare any global pathway.",
                output="A qualification, training record or bounded professional membership where the issuer confirms eligibility.",
                 priority="useful_later", reason="Credentials come after the academic and domain foundation and only matter for routes that use them.",
                 prerequisites=[], related=[], source_ids=[clean(source.get("source_key")) for source in credential_sources if clean(source.get("source_key"))], refs=credential_refs,
                 locators=[{"domainId": domain_id, "evidenceKind": "credential_specific_evidence", "owner": "domain", "accessedAt": clean(credential_evidence.get("accessedAt"))}],
                 context_link=credential_evidence,
                 limitations=["No domain row by itself proves that every Nigerian employer or role requires this credential."])
        # Explicit subgroup records, not a re-labelled role-frequency list.
        for subgroup in (structure.get(domain_id) or {}).get("subgroups") or []:
            subgroup_id = clean(subgroup.get("isco_submajor"))
            subgroup_key = f"{domain_id}|sg:{subgroup_id}"
            source_ids = list(dict.fromkeys((subgroup.get("source_provenance") or {}).get("sources") or ids))
            subgroup_refs = refs
            skills = [clean(value) for value in subgroup.get("cluster_skills") or [] if clean(value)]
            for name in dict.fromkeys(skills):
                add(rows, level="subgroup", key=subgroup_key, domain=domain_id, kind="skill", name=name,
                    meaning=item_meaning("skill", name),
                    use=f"This is an area-specific capability in {clean(subgroup.get('label'))}; it adds focus to the shared {clean(row.get('domain_name'))} foundation.",
                    output="An area-specific analysis, method, dataset, report or other work product.",
                    priority="build_next",
                     reason="This is an area-specific option that extends the domain foundation; list position does not establish a learning order, and learners need not select every item.",
                     prerequisites=[], related=[], source_ids=source_ids, refs=subgroup_refs,
                     locators=[{"domainId": domain_id, "subgroup": clean(subgroup.get("label")), "iscoSubmajor": subgroup_id, "owner": "subgroup"}],
                     context_link=external_context_link("subgroup", subgroup_key, "skill", name),
                     limitations=["This subgroup record describes an area of work; it is not a requirement to learn every listed capability."])

    # Role-owned skills and named tools. This is the only layer that consumes
    # role-library skill strings and role-tool parts.
    role_tools: dict[str, list[dict]] = {}
    for path in sorted((HERE / "role_tools_parts_gz").glob("*.json.gz")):
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            role_tools.update(json.load(handle))
    for role in roles:
        domain_id = clean(role.get("domain_id"))
        role_name = clean(role.get("role_name"))
        if not domain_id or domain_id not in domain_ids or not role_name:
            continue
        role_key = f"{domain_id}|{role_name}"
        ids, refs = role_refs(role)
        essential, optional = student_skill_lists(role)
        all_skills = list(dict.fromkeys(essential + optional))
        for name in all_skills:
            is_essential = name in essential
            add(rows, level="role", key=role_key, domain=domain_id, kind="skill", name=name,
                meaning=item_meaning("skill", name),
                use=f"In the {role_name} role, this supports the work described by the role record and is used alongside the other skills shown here.",
                output="A role-related analysis, decision, report, dataset, presentation or other work product.",
                priority="build_next" if is_essential else "optional",
                reason="The role source classifies this as essential; that does not establish a sequence or mean the learner already has it." if is_essential else "The role source classifies this as optional; list position does not establish a learning order.",
                prerequisites=[], related=[], source_ids=ids, refs=refs,
                locators=[{"roleKey": role_key, "evidenceKind": "essential_skill" if is_essential else "optional_skill", "owner": "role"}],
                limitations=["Role evidence describes the occupation; it does not prove competence, employment demand, salary or automatic licensing."])
        tool_row = role_tools.get(role_key) or {}
        for tool in tool_row.get("tools") or []:
            name = clean(tool.get("tool"))
            if not name or name.casefold() in GENERIC_TOOL_NAMES:
                continue
            tool_ids = list(dict.fromkeys(ids + (["global_onet"] if clean(tool.get("source")) == "onet" else [])))
            tool_refs = list(refs)
            if clean(tool.get("source")) == "onet":
                tool_refs.append(source_ref("global_onet", "O*NET Database", "https://www.onetcenter.org/database.html", "global", "tool_evidence"))
            add(rows, level="role", key=role_key, domain=domain_id, kind="tool", name=name,
                meaning=item_meaning("tool", name),
                use=f"For {role_name}, this is one option for carrying out the related work. It can be combined with the other tools and methods shown on the role page; it is not a required stack.",
                output="A tool-supported analysis, record, model, visualisation, query or report.",
                priority="useful_later", reason="Tools follow the role foundation and should be chosen for the task, access and local context.",
                prerequisites=[], related=[], source_ids=tool_ids, refs=tool_refs,
                locators=[{"roleKey": role_key, "elementId": clean(tool.get("element_id")), "elementName": clean(tool.get("element_name")), "owner": "role"}],
                limitations=["The source names this tool as role evidence; it does not make the tool the only or universally required option."])
    return rows


def row_sql(row: dict) -> str:
    return "(" + ", ".join([
        sql(row["context_level"]), sql(row["context_key"]), sql(row["domain_key"]), sql(row["item_type"]),
        sql(row["item_key"]), sql(row["name"]), sql(row["plain_meaning"]), sql(row["contextual_use"]),
        sql(row["expected_output"]), sql(row["priority"]), sql(row["priority_reason"]), sql_json(row["prerequisites"]),
        sql_json(row["related_items"]), sql_text_array(row["source_ids"]), sql_json(row["source_references"]),
        sql_json(row["source_locators"]), sql(row["geographic_scope"]), sql_json(row["evidence_limitations"]),
        sql(row["evidence_type"]), sql(row["source_confidence"]), sql(row["data_state"]),
        sql(row["link_state"]), sql(row["link_url"]), sql(row["link_title"]),
        sql_json(row["link_source_reference"]), sql(row["link_accessed_at"]), sql(row["link_confidence"]),
        sql_json(row["link_evidence"]), sql(row["no_link_reason"]), sql(row["guidance_owner"]),
        sql(row["claim_review_state"]), sql_json(row["claim_evidence"]),
        sql(row["link_kind"]), sql(row["link_level"]), sql(row["link_language"]),
        sql(row["link_access"]), sql(row["link_duration"]), sql(row["verified_at"]),
    ]) + ")"


def _unique_json_values(values: list[object]) -> list[object]:
    """Deduplicate JSON-compatible evidence without changing its order."""
    out: list[object] = []
    seen: set[str] = set()
    for value in values:
        marker = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        if marker in seen:
            continue
        seen.add(marker)
        out.append(value)
    return out


def _relationship_source_evidence(*rows: dict, extra_limitations: list[str] | None = None) -> dict:
    """Carry endpoint provenance onto an edge without making a new claim.

    Relationship rows are stored in a table that predates ``source_locators``.
    Keep the locators in the JSONB source-reference objects as well as on the
    in-memory edge so the transport does not discard them before the additive
    schema can be extended.  A locator remains explicitly an endpoint/context
    locator; it is not presented as independent proof of the relationship.
    """
    source_ids: list[str] = []
    references: list[dict] = []
    locators: list[object] = []
    limitations: list[str] = []
    for row in rows:
        source_ids.extend(str(value).strip() for value in (row.get("source_ids") or row.get("sourceIds") or []) if str(value).strip())
        raw_references = row.get("source_references") or row.get("sourceReferences") or []
        if isinstance(raw_references, list):
            references.extend(value for value in raw_references if isinstance(value, dict))
        raw_locators = row.get("source_locators") or row.get("sourceLocators") or []
        if isinstance(raw_locators, list):
            locators.extend(raw_locators)
        if isinstance(raw_references, list):
            for reference in raw_references:
                if not isinstance(reference, dict):
                    continue
                source_ids.extend(
                    str(value).strip()
                    for value in ([reference.get("id")] + (reference.get("sourceIds") or []))
                    if str(value).strip()
                )
                for key in ("locators", "sourceLocators"):
                    if isinstance(reference.get(key), list):
                        locators.extend(reference[key])
                if isinstance(reference.get("evidenceLimitations"), list):
                    limitations.extend(str(value).strip() for value in reference["evidenceLimitations"] if str(value).strip())
        raw_limitations = row.get("evidence_limitations") or row.get("evidenceLimitations") or []
        if isinstance(raw_limitations, list):
            limitations.extend(str(value).strip() for value in raw_limitations if str(value).strip())
    limitations.extend(str(value).strip() for value in (extra_limitations or []) if str(value).strip())

    merged: list[dict] = []
    reference_indexes: dict[tuple[str, str], int] = {}
    for reference in references:
        copy = dict(reference)
        explicit_ids = [str(copy.get("id")).strip()] if str(copy.get("id") or "").strip() else []
        explicit_ids.extend(str(value).strip() for value in (copy.get("sourceIds") or []) if str(value).strip())
        if explicit_ids:
            copy["sourceIds"] = list(dict.fromkeys(explicit_ids))
        url = clean(copy.get("url"))
        key = ("url", url) if url else ("", json.dumps(copy, ensure_ascii=False, sort_keys=True))
        existing_index = reference_indexes.get(key)
        if existing_index is None:
            merged.append(copy)
            reference_indexes[key] = len(merged) - 1
            continue
        existing = merged[existing_index]
        for field in ("sourceIds", "locators", "sourceLocators", "evidenceLimitations"):
            combined = [*(existing.get(field) or []), *(copy.get(field) or [])]
            if combined:
                existing[field] = _unique_json_values(combined)
    locators = _unique_json_values(locators)
    if locators:
        for reference in merged:
            reference["sourceLocators"] = _unique_json_values([*(reference.get("sourceLocators") or []), *locators])
    return {
        "source_ids": list(dict.fromkeys(source_ids)),
        "source_references": merged,
        "source_locators": locators,
        "evidence_limitations": list(dict.fromkeys(limitations)),
    }


def _lower_confidence(*rows: dict) -> str:
    order = {"low": 0, "medium": 1, "high": 2}
    values = [str(row.get("source_confidence") or "high") for row in rows]
    return min(values, key=lambda value: order.get(value, 0))


def relationship_rows(rows: list[dict]) -> list[dict]:
    """Emit honest relationship-coverage rows; never infer edges from lists.

    The current source builder has no dedicated relationship evidence ledger.
    Skill order, co-occurrence and endpoint citations therefore cannot support
    ``builds_on`` or ``works_with`` claims. Keep an explicit not-established
    row for every typed item until a relationship record supplies its own
    source, locator and exact supporting passage.
    """
    edges: list[dict] = []
    for row in rows:
        edges.append({
            "context_level": row["context_level"],
            "context_key": row["context_key"],
            "domain_key": row["domain_key"],
            "from_item_type": row["item_type"],
            "from_item_key": row["item_key"],
            "from_name": row["name"],
            "to_item_type": None,
            "to_item_key": None,
            "to_name": None,
            "relationship_type": "not_established",
            "relationship_status": "not_established",
            "source_ids": [],
            "source_references": [],
            "evidence_limitations": [
                "No item-to-item relationship has its own source-backed evidence record. Item co-occurrence, list position, and endpoint citations do not prove a prerequisite, complement, alternative, or use relationship."
            ],
            "source_confidence": "low",
            "data_state": "not_established",
            "guidance_owner": row["guidance_owner"],
            "verified_at": row["verified_at"],
        })
    return edges


def relationship_sql(edge: dict) -> str:
    return "(" + ", ".join([
        sql(edge["context_level"]), sql(edge["context_key"]), sql(edge["domain_key"]),
        sql(edge["from_item_type"]), sql(edge["from_item_key"]), sql(edge["from_name"]),
        sql(edge["to_item_type"]), sql(edge["to_item_key"]), sql(edge["to_name"]),
        sql(edge["relationship_type"]), sql(edge["relationship_status"]), sql_text_array(edge["source_ids"]),
        sql_json(edge["source_references"]), sql_json(edge["evidence_limitations"]), sql(edge["source_confidence"]),
        sql(edge["data_state"]), sql(edge["guidance_owner"]), sql(edge["verified_at"]),
    ]) + ")"


def render_sql(rows: list[dict], edges: list[dict], part: int) -> str:
    columns = "(context_level, context_key, domain_key, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations, evidence_type, source_confidence, data_state, link_state, link_url, link_title, link_source_reference, link_accessed_at, link_confidence, link_evidence, no_link_reason, guidance_owner, claim_review_state, claim_evidence, link_kind, link_level, link_language, link_access, link_duration, verified_at)"
    lines = [
        "-- Generated source-backed contextual guidance rows.",
        f"-- Part {part}; run after backend/migration_contextual_career_items.sql, backend/migration_career_context_claim_validation.sql, and backend/migration_career_item_relationships_2026-09-17.sql.",
        "BEGIN;",
        "INSERT INTO skillup_dev.career_context_items",
        f"    {columns}",
        "VALUES",
    ]
    lines.append(",\n".join(row_sql(row) for row in rows))
    lines += [
        "ON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET",
        "    domain_key = EXCLUDED.domain_key, name = EXCLUDED.name, plain_meaning = EXCLUDED.plain_meaning,",
        "    contextual_use = EXCLUDED.contextual_use, expected_output = EXCLUDED.expected_output, priority = EXCLUDED.priority,",
        "    priority_reason = EXCLUDED.priority_reason, prerequisites = EXCLUDED.prerequisites, related_items = EXCLUDED.related_items,",
        "    source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references, source_locators = EXCLUDED.source_locators,",
        "    geographic_scope = EXCLUDED.geographic_scope, evidence_limitations = EXCLUDED.evidence_limitations,",
        "    evidence_type = EXCLUDED.evidence_type, source_confidence = EXCLUDED.source_confidence, data_state = EXCLUDED.data_state,",
        "    link_state = EXCLUDED.link_state, link_url = EXCLUDED.link_url, link_title = EXCLUDED.link_title,",
        "    link_source_reference = EXCLUDED.link_source_reference, link_accessed_at = EXCLUDED.link_accessed_at,",
        "    link_confidence = EXCLUDED.link_confidence, link_evidence = EXCLUDED.link_evidence, no_link_reason = EXCLUDED.no_link_reason,",
        "    claim_review_state = EXCLUDED.claim_review_state, claim_evidence = EXCLUDED.claim_evidence,",
        "    link_kind = EXCLUDED.link_kind, link_level = EXCLUDED.link_level, link_language = EXCLUDED.link_language,",
        "    link_access = EXCLUDED.link_access, link_duration = EXCLUDED.link_duration,",
        "    verified_at = EXCLUDED.verified_at;",
    ]
    if edges:
        edge_columns = "(context_level, context_key, domain_key, from_item_type, from_item_key, from_name, to_item_type, to_item_key, to_name, relationship_type, relationship_status, source_ids, source_references, evidence_limitations, source_confidence, data_state, guidance_owner, verified_at)"
        lines += [
            "INSERT INTO skillup_dev.career_item_relationships",
            f"    {edge_columns}",
            "VALUES",
            ",\n".join(relationship_sql(edge) for edge in edges),
            "ON CONFLICT DO NOTHING;",
        ]
    lines += ["COMMIT;", ""]
    return "\n".join(lines)


def main() -> None:
    rows = build()
    edges = relationship_rows(rows)
    OUT.mkdir(parents=True, exist_ok=True)
    for old in list(OUT.glob("part-*.sql")) + list(OUT.glob("part-*.sql.gz")):
        old.unlink()
    parts: list[dict] = []
    current: list[dict] = []
    current_bytes = 0
    part_number = 1
    edges_by_context: dict[tuple[str, str], list[dict]] = {}
    for edge in edges:
        edges_by_context.setdefault((edge["context_level"], edge["context_key"]), []).append(edge)
    for row in rows:
        candidate = row_sql(row) + ",\n"
        size = len(candidate.encode("utf-8"))
        if current and current_bytes + size > MAX_SQL_BYTES:
            current_edges = [edge for row in current for edge in edges_by_context.get((row["context_level"], row["context_key"]), []) if edge["from_item_key"] == row["item_key"] and edge["from_item_type"] == row["item_type"]]
            content = render_sql(current, current_edges, part_number)
            path = OUT / f"part-{part_number:03d}.sql.gz"
            with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
                handle.write(content)
            parts.append({"file": path.relative_to(ROOT).as_posix(), "part": part_number, "row_count": len(current), "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
            part_number += 1
            current = []
            current_bytes = 0
        current.append(row)
        current_bytes += size
    if current:
        current_edges = [edge for row in current for edge in edges_by_context.get((row["context_level"], row["context_key"]), []) if edge["from_item_key"] == row["item_key"] and edge["from_item_type"] == row["item_type"]]
        content = render_sql(current, current_edges, part_number)
        path = OUT / f"part-{part_number:03d}.sql.gz"
        with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
            handle.write(content)
        parts.append({"file": path.relative_to(ROOT).as_posix(), "part": part_number, "row_count": len(current), "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

    with gzip.open(HERE / "contextual_guidance_items.json.gz", "wt", encoding="utf-8") as handle:
        json.dump({"items": rows, "relationships": edges}, handle, ensure_ascii=False, separators=(",", ":"))
    counts = Counter((row["context_level"], row["item_type"]) for row in rows)
    domains = {row["context_key"] for row in rows if row["context_level"] == "domain"}
    subgroups = {row["context_key"] for row in rows if row["context_level"] == "subgroup"}
    roles = {row["context_key"] for row in rows if row["context_level"] == "role"}
    manifest = {
        "schema_version": "2026-09-12.contextual-guidance.v1",
        "verified_at": VERIFIED_AT,
        "purpose": "Student-facing explanations whose ownership stays at programme, domain, subgroup or role level.",
        "row_count": len(rows),
        "relationship_count": len(edges),
        "covered_domains": len(domains),
        "covered_subgroups": len(subgroups),
        "covered_roles": len(roles),
        "counts": {f"{level}:{kind}": count for (level, kind), count in sorted(counts.items())},
        "generic_tool_names_excluded": sorted(GENERIC_TOOL_NAMES),
        "parts": parts,
        "source_rule": "Domain rows never use role prevalence; role-derived evidence appears only at subgroup/role level.",
        "relationship_rule": "Only same-context prerequisite and related-item names that resolve to another typed item become source-backed edges; every contextual tool/certification without an established edge receives an explicit not_established coverage row.",
    }
    (HERE / "CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    audit = [
        "# Contextual guidance item audit",
        "",
        f"Generated: {VERIFIED_AT}",
        "",
        f"- Rows: **{len(rows)}**",
        f"- Domains with domain-owned rows: **{len(domains)}**",
        f"- Subgroups with explicit subgroup rows: **{len(subgroups)}**",
        f"- Roles with role-owned rows: **{len(roles)}**",
        f"- SQL parts: **{len(parts)}** compressed `.sql.gz` files; each raw SQL transaction is kept below {MAX_SQL_BYTES:,} bytes before compression.",
        "",
        "## Ownership checks",
        "",
        "- Domain rows are sourced from named domain/Nigerian/global evidence only.",
        "- The role-prevalence foundation list is not consumed by this generator.",
        "- Generic O*NET software categories are excluded from student-facing tool rows.",
        "- Role skills and tools remain on role pages; they are not copied into domain rows.",
        "- A row is emitted only when at least one HTTPS source reference is available.",
        "",
        "## Coverage counts",
        "",
    ]
    audit.extend(f"- `{key}`: {value}" for key, value in manifest["counts"].items())
    (HERE / "CONTEXTUAL_GUIDANCE_ITEMS_AUDIT_2026-09-12.md").write_text("\n".join(audit) + "\n", encoding="utf-8")
    print(json.dumps({k: manifest[k] for k in ("row_count", "covered_domains", "covered_subgroups", "covered_roles", "counts")}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
