"""Build the internet-backed D057-D112 role-enrichment checkpoint.

This is a review artifact only.  It deliberately does not edit any canonical
role or taxonomy file.  The lane combines the existing D057-D084 and
D085-D168 candidate registers, checks exact/alias overlap against the current
merged role inventory, resolves the source URLs already recorded by those
registers, and attaches separately-scoped Nigerian context evidence.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OUT_DIR = AUDIT / "role_enrichment_lanes_2026_10_06" / "D057_D112"
OUT_JSON = OUT_DIR / "D057_D112_role_enrichment_checkpoint_2026_10_06.json"
OUT_MD = OUT_DIR / "D057_D112_role_enrichment_checkpoint_2026_10_06.md"

CANDIDATE_REGISTERS = [
    AUDIT / "role_coverage_lanes_2026_10_05" / "D045_D084" / "role_coverage_candidate_register.json",
    AUDIT / "role_coverage_lanes_2026_10_05" / "D085_D168" / "role_coverage_candidate_register.json",
]
ROLE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    value = str(value or "").casefold().replace("&", " and ")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokens(value: Any) -> set[str]:
    return {x for x in norm(value).split() if len(x) > 2}


def primary_candidate_title(value: str) -> str:
    # Candidate registers often contain a slash-separated family.  Keep the
    # first human-readable title for exact matching; retain all variants in
    # the output rather than silently choosing a canonical title.
    return re.split(r"\s*/\s*", value or "", maxsplit=1)[0].strip()


def role_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in ROLE_FILES:
        payload = load(path)
        rows.extend(payload if isinstance(payload, list) else payload.get("roles", []))
    # The merged inventory is keyed by the same key used by the audit.
    unique: dict[str, dict[str, Any]] = {}
    for row in rows:
        unique[f"{row.get('domain_id')}|{row.get('role_name')}"] = row
    return list(unique.values())


def resolve_sources(register_sources: dict[str, Any], source_refs: list[str]) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    for source_id in source_refs:
        source = register_sources.get(source_id)
        if not isinstance(source, dict):
            resolved.append({"source_id": source_id, "resolution": "missing_in_register"})
            continue
        urls: list[str] = []
        for key in ("url", "pdf_url", "urls"):
            value = source.get(key)
            if isinstance(value, str) and value:
                urls.append(value)
            elif isinstance(value, list):
                urls.extend(str(x) for x in value if x)
        resolved.append(
            {
                "source_id": source_id,
                "publisher": source.get("organization") or source.get("publisher"),
                "title": source.get("title") or source.get("name"),
                "urls": sorted(set(urls)),
                "locator": "URL-level source record; candidate-register task summary; exact page/section must be confirmed before canonical addition.",
                "source_limit": "Supports occupational terminology/task context only unless the source explicitly establishes a jurisdiction-specific role or licence.",
            }
        )
    return resolved


REFRESHED_SOURCES = [
    {
        "source_id": "WHO_DIGITAL_HEALTH_2026_LANDSCAPE",
        "publisher": "World Health Organization",
        "title": "Competency frameworks and standards for digital health: a landscape analysis",
        "url": "https://www.who.int/publications/i/item/9789240119765",
        "locator": "Publication overview; competency clusters include data, informatics, technical proficiency, communication and administration.",
        "access_date": "2026-10-06",
        "scope": "global",
        "source_limit": "Global digital-health competency evidence; it does not prove a particular Nigerian job title, demand level or licence.",
    },
    {
        "source_id": "WHO_DIGITAL_HEALTH_LOCAL_ROLE_LIMIT",
        "publisher": "World Health Organization",
        "title": "Digital Health Competency Framework Committee",
        "url": "https://www.who.int/news-room/articles-detail/open-call-for-experts-to-serve-as-members-of-the-digital-health-competency-framework-committee",
        "locator": "Framework description: global domains must be interpreted in specific local roles, responsibilities, regulations and practices.",
        "access_date": "2026-10-06",
        "scope": "global framework with local-adaptation rule",
        "source_limit": "Supports the separation of global occupation evidence from local implementation; it is not Nigerian labour-market evidence.",
    },
    {
        "source_id": "WCO_CUSTOMS_BROKERS_2018",
        "publisher": "World Customs Organization",
        "title": "Study Report on Customs Brokers",
        "url": "https://www.wcoomd.org/en/topics/facilitation/instrument-and-tools/tools/study-report-on-customs-brokers.aspx",
        "locator": "Study-report page: customs brokers act as intermediaries between traders and Customs; licensing/regulatory variation is documented.",
        "access_date": "2026-10-06",
        "scope": "global customs-broker function",
        "source_limit": "Supports a global function family; local title, licensing and permitted scope must be checked against Nigerian law.",
    },
    {
        "source_id": "NIMASA_SEAFARER_QUALIFICATIONS_2026_CHECK",
        "publisher": "Nigerian Maritime Administration and Safety Agency",
        "title": "Qualification and Training",
        "url": "https://nimasa.gov.ng/what-we-do/seafarer-qualifications-certification/qualification-and-training/",
        "locator": "Career Progressions and certificates of competency/proficiency: master/chief mate, deck watch officer, chief/second engineer, engineering watch officer, electro-technical officer, ratings and marine engineer assistant.",
        "access_date": "2026-10-06",
        "scope": "Nigeria-specific maritime training/certification context",
        "source_limit": "Supports Nigerian pathway and certification context, not a complete list of all Nigerian employers or current vacancies.",
    },
    {
        "source_id": "NIMASA_MARINE_ENGINEERING_ASSISTANT",
        "publisher": "Nigerian Maritime Administration and Safety Agency",
        "title": "Marine Engineering Assistant requirements",
        "url": "https://nimasa.gov.ng/wp-content/uploads/2019/08/MEA.pdf",
        "locator": "Requirements and competency section: marine-engine maintenance, fault rectification, engine-room records, safety and pollution prevention.",
        "access_date": "2026-10-06",
        "scope": "Nigeria-specific regulated/domestic maritime route",
        "source_limit": "Specific to the published certificate route and date; it does not establish a universal role requirement outside that route.",
    },
    {
        "source_id": "NCS_STATUTORY_FUNCTIONS_2026_CHECK",
        "publisher": "Nigeria Customs Service",
        "title": "Statutory Functions",
        "url": "https://customs.gov.ng/rules-guidelines/statutory-functions",
        "locator": "Functions list: trade facilitation, revenue collection, border/security work, statistics, manifest processing and licensing/registration of customs agents.",
        "access_date": "2026-10-06",
        "scope": "Nigeria-specific public-service and customs ecosystem context",
        "source_limit": "Supports institutional functions and local context; it does not prove that every listed function is a separate open-market occupation.",
    },
    {
        "source_id": "NCS_LEGAL_FRAMEWORK_2026_CHECK",
        "publisher": "Nigeria Customs Service",
        "title": "Legal framework",
        "url": "https://customs.gov.ng/rules-guidelines/legal-framework",
        "locator": "Nigeria Customs Service Act 2023 and related manuals listed under official legal framework.",
        "access_date": "2026-10-06",
        "scope": "Nigeria-specific legal/regulatory context",
        "source_limit": "Regulatory evidence only; a law or agency function is not by itself evidence for adding a distinct role title.",
    },
]


def main() -> None:
    candidates: list[dict[str, Any]] = []
    sources: dict[str, Any] = {}
    for path in CANDIDATE_REGISTERS:
        payload = load(path)
        sources.update(payload.get("sources", {}))
        for domain in payload.get("domains", []):
            for row in domain.get("candidates", []):
                domain_id = str(row.get("candidate_key", "")).split("|", 1)[0]
                number = int(domain_id[1:]) if re.fullmatch(r"D\d+", domain_id) else -1
                if 57 <= number <= 112:
                    candidates.append({**row, "register_file": str(path.relative_to(ROOT)).replace("/", "\\")})

    active_roles = role_rows()
    by_domain: dict[str, list[dict[str, Any]]] = {}
    for row in active_roles:
        by_domain.setdefault(str(row.get("domain_id")), []).append(row)

    entries: list[dict[str, Any]] = []
    for candidate in candidates:
        domain_id, _ = candidate["candidate_key"].split("|", 1)
        title = candidate.get("title_or_family", "")
        primary = primary_candidate_title(title)
        variants = [primary] + [x.strip() for x in re.split(r"\s*/\s*|\s+or\s+", title, flags=re.I) if x.strip()]
        exact: list[str] = []
        aliases: list[str] = []
        for role in by_domain.get(domain_id, []):
            role_name = norm(role.get("role_name"))
            alias_values = [x.strip() for x in re.split(r"\s*[·|;,]\s*", str(role.get("also_known_as") or "")) if x.strip()]
            variant_norms = {norm(x) for x in variants}
            if role_name in variant_norms:
                exact.append(str(role.get("role_name")))
            if variant_norms.intersection({norm(x) for x in alias_values}):
                aliases.append(str(role.get("role_name")))

        recommendation = str(candidate.get("recommendation_status") or "").casefold()
        classification = "review_only"
        reason = "Candidate needs human title/task adjudication before any canonical addition."
        if exact or aliases:
            classification = "alias_existing"
            reason = "An exact candidate title or stated variant already appears in the same domain's active role inventory."
        elif "duplicate" in recommendation or "overlap" in recommendation or "function family" in str(candidate.get("title_status") or "").casefold():
            classification = "review_only"
            reason = "Register explicitly flags overlap, duplicate risk, or a function family whose title boundary is not yet safe."
        elif "source_ownership_hold" not in recommendation and "no_addition" not in recommendation and "established" in str(candidate.get("title_status") or "").casefold():
            classification = "add"
            reason = "Candidate has an established occupational title, direct parent-domain fit, task text and no exact active duplicate; this is an add recommendation for later canonical review, not a canonical edit."

        nigeria_sources: list[str] = []
        if domain_id == "D076":
            nigeria_sources = ["NIMASA_SEAFARER_QUALIFICATIONS_2026_CHECK", "NIMASA_MARINE_ENGINEERING_ASSISTANT"]
        elif domain_id == "D079":
            nigeria_sources = ["NCS_STATUTORY_FUNCTIONS_2026_CHECK", "NCS_LEGAL_FRAMEWORK_2026_CHECK"]
        elif domain_id == "D057":
            nigeria_sources = ["WHO_DIGITAL_HEALTH_LOCAL_ROLE_LIMIT"]

        entries.append(
            {
                "candidate_key": candidate["candidate_key"],
                "domain_id": domain_id,
                "title_or_family": title,
                "candidate_tasks": candidate.get("tasks"),
                "parent_domain_fit": candidate.get("parent_domain_fit") or candidate.get("candidate_gap_basis"),
                "title_status": candidate.get("title_status"),
                "recommendation_status": candidate.get("recommendation_status"),
                "existing_active_exact_matches": sorted(set(exact)),
                "existing_active_alias_matches": sorted(set(aliases)),
                "global_source_refs": resolve_sources(sources, candidate.get("source_refs", [])),
                "nigerian_context": {
                    "evidence_scope": "nigerian_official_or_local_adaptation" if nigeria_sources else "not_established",
                    "source_refs": nigeria_sources,
                    "claim_limit": "Nigerian context is recorded separately and never upgrades global occupational evidence into proof of Nigerian vacancies, demand, licensing or universal availability.",
                },
                "disposition": classification,
                "disposition_reason": reason,
                "canonical_role_addition": False,
                "canonical_files_edited": False,
                "register_file": candidate["register_file"],
            }
        )

    counts = Counter(x["disposition"] for x in entries)
    domain_counts = Counter(x["domain_id"] for x in entries)
    active_counts = Counter(
        str(row.get("domain_id"))
        for row in active_roles
        if str(row.get("student_path_status") or "").casefold() != "excluded"
    )
    coverage_gaps: list[dict[str, Any]] = []
    for number in range(57, 113):
        domain_id = f"D{number:03d}"
        current_count = active_counts.get(domain_id, 0)
        if current_count <= 8:
            coverage_gaps.append(
                {
                    "domain_id": domain_id,
                    "active_role_count": current_count,
                    "candidate_records_in_this_lane": domain_counts.get(domain_id, 0),
                    "coverage_status": "zero_role_domain" if current_count == 0 else "low_role_domain",
                    "action": "review_candidate_records; do not add merely to reach a numeric floor",
                }
            )
    output = {
        "schema_version": "2026-10-06.role-enrichment-lane.v1",
        "lane": "D057-D112",
        "run_date": "2026-10-06",
        "access_date": "2026-10-06",
        "scope": "Internet-backed enrichment register for global established occupations and separately-scoped Nigerian context for domains D057 through D112.",
        "continuation": "Continue from role-coverage candidate registers and Nigerian-context checkpoints; this is not a stop-at-checkpoint instruction.",
        "method": [
            "Load candidates from D045-D084 and D085-D168 registers, retaining only D057-D112.",
            "Resolve the candidate-register source IDs to their direct URLs and record source limits.",
            "Search/refresh authoritative global and Nigerian official sources; Nigerian sources are attached only as context evidence.",
            "Check exact role-name and alias overlap against the merged active role inventory for the same domain.",
            "Use add/alias_existing/review_only as checkpoint dispositions; no disposition edits shared canonical files.",
            "Do not infer role-to-domain or role-to-area fit from ISCO membership alone.",
        ],
        "counts": {
            "candidate_records": len(entries),
            "domains_covered": len(domain_counts),
            "dispositions": dict(sorted(counts.items())),
            "candidate_domains": dict(sorted(domain_counts.items())),
            "zero_role_domains_in_lane": [x["domain_id"] for x in coverage_gaps if x["active_role_count"] == 0],
            "low_role_domains_in_lane_at_or_below_8": [x["domain_id"] for x in coverage_gaps if x["active_role_count"] > 0],
        },
        "coverage_gaps": coverage_gaps,
        "source_records": {
            "candidate_register_sources": sorted(sources),
            "refreshed_web_sources": REFRESHED_SOURCES,
        },
        "source_limits": [
            "Global classification/association sources establish occupation terminology or task context, not Nigerian demand.",
            "Nigerian agency pages establish local institutional functions, pathways or regulation; they do not automatically establish a distinct occupation or a current vacancy.",
            "A candidate marked add still requires final canonical duplicate/task-fit review before a shared role file is edited.",
        ],
        "entries": entries,
        "out_of_scope_emerging_domains": [
            {"domain_id": "D006", "domain": "Internet of Things and Embedded Systems", "note": "Handled in the appropriate lane, not D057-D112."},
            {"domain_id": "D012", "domain": "FinTech Engineering", "note": "Handled in the appropriate lane, not D057-D112."},
            {"domain_id": "D056", "domain": "Blockchain Engineering", "note": "Handled in the appropriate lane, not D057-D112."},
            {"domain_id": "D139", "domain": "Game Design", "note": "Handled in the appropriate lane, not D057-D112."},
            {"domain_id": "D141", "domain": "Quantum Computing and Quantum Information", "note": "Handled in the appropriate lane, not D057-D112."},
            {"domain_id": "D166", "domain": "Autonomous Vehicles and Self-Driving Systems", "note": "Handled in the appropriate lane, not D057-D112."},
        ],
        "integrity": {
            "all_candidates_have_candidate_key": all(x.get("candidate_key") for x in entries),
            "all_entries_have_disposition": all(x.get("disposition") in {"add", "alias_existing", "review_only"} for x in entries),
            "all_global_sources_have_direct_url_or_missing_register_marker": all(
                all(record.get("urls") or record.get("resolution") == "missing_in_register" for record in x["global_source_refs"])
                for x in entries
            ),
            "canonical_files_edited": False,
            "isco_used_as_fit_proof": False,
            "nigerian_policy_used_as_role_proof": False,
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D057–D112 role-enrichment checkpoint — 2026-10-06",
        "",
        "This is a review-only lane artifact. It does not edit `role_library_v3_cleaned.json`, `thin_domain_role_overlays.json`, `emerging_role_overlays.json`, or `domain_structure.json`.",
        "",
        f"Candidate records: **{len(entries)}** across **{len(domain_counts)}** domains.",
        f"Dispositions: **{counts.get('add', 0)} add candidates**, **{counts.get('alias_existing', 0)} alias/existing**, **{counts.get('review_only', 0)} review-only**.",
        "",
        "Explicit sparse-domain baseline in this lane (active role records, after exact-key deduplication): "
        + ", ".join(
            f"{x['domain_id']}={x['active_role_count']}" for x in coverage_gaps
        )
        + ".",
        "",
        "## Interpretation",
        "",
        "`add` means an evidence-backed candidate for later canonical review, not an automatic insertion. `alias_existing` means the title or stated variant is already represented in the same domain. `review_only` means the source supports a function or family but title boundaries, overlap, ownership, or jurisdiction need adjudication.",
        "",
        "Global occupational evidence and Nigerian context are separate. NIMASA and Nigeria Customs records support Nigerian maritime/customs pathways and institutional context; they do not turn every global title into a Nigerian vacancy. WHO's local-adaptation guidance is retained as a boundary, not as Nigerian market evidence.",
        "",
        "## Nigerian context sources refreshed",
        "",
        "- [NIMASA Qualification and Training](https://nimasa.gov.ng/what-we-do/seafarer-qualifications-certification/qualification-and-training/) — career progression and certificates of competency/proficiency; Nigeria-specific maritime pathway.",
        "- [NIMASA Marine Engineering Assistant requirements](https://nimasa.gov.ng/wp-content/uploads/2019/08/MEA.pdf) — published competency and certification route; specific to that route.",
        "- [Nigeria Customs Service statutory functions](https://customs.gov.ng/rules-guidelines/statutory-functions) — local customs functions and licensed-agent context; not a vacancy list.",
        "- [Nigeria Customs Service legal framework](https://customs.gov.ng/rules-guidelines/legal-framework) — Act/manual context; regulatory evidence, not automatic role proof.",
        "- [WHO digital-health competency landscape](https://www.who.int/publications/i/item/9789240119765) and [WHO local-role adaptation guidance](https://www.who.int/news-room/articles-detail/open-call-for-experts-to-serve-as-members-of-the-digital-health-competency-framework-committee) — global role/competency context and explicit local-adaptation limit.",
        "- [WCO Study Report on Customs Brokers](https://www.wcoomd.org/en/topics/facilitation/instrument-and-tools/tools/study-report-on-customs-brokers.aspx) — global customs-broker function and jurisdictional variation.",
        "",
        "## Continuation point",
        "",
        "The lane remains open for source-by-source title/task adjudication and a later canonical application pass. This checkpoint is not a completion claim.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": output["counts"]}, indent=2))


if __name__ == "__main__":
    main()
