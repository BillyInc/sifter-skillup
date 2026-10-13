"""Build a disjoint, global-only reconciliation of the 23 specialization gaps.

This reads existing review artifacts and emits audit/recommendation records only.
It does not edit canonical taxonomy, domain, subgroup, or role data.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
OUT = Path(__file__).resolve().parent
REGISTER_PATH = AUDIT / "domain_specialization_review_2026_10_03.json"
LANE = AUDIT / "specialization_lanes_2026_10_05"
GENERAL = LANE / "D057_D168"
D098_ADJUDICATION = GENERAL / "D098_three_vs_four_area_adjudication_001.json"
SUPPLEMENT = GENERAL / "D099_D112_source_gap_supplement_002.json"

PROVISIONAL_IDS = ["D057", "D058", "D060", "D062", "D063", "D064", "D065", "D066"]
TARGET_IDS = ["D001", "D002", *PROVISIONAL_IDS, "D092", *[f"D{i:03d}" for i in range(93, 113)]]
NIGERIA_MARKERS = re.compile(r"nigeria|nigerian|nihotour|nbte|nuc\b|core curriculum minimum|jamb", re.I)
GLOBAL_PUBLISHERS = re.compile(
    r"worldskills|international organization for standardization|\biso\b|"
    r"international labour organization|\bilo\b|united nations|\bun\b|"
    r"food and agriculture organization|\bfao\b|ieee|acm|dama|cigre|"
    r"international institute of welding|\biiw\b|unctad|tappi|"
    r"international council|international federation|international union",
    re.I,
)
COUNTRY_OR_INSTITUTIONAL = re.compile(
    r"university|college|national institute|government of|department of|"
    r"skills england|ase\b|nist\b|dgt india|india|united kingdom|\buk\b|"
    r"united states|\busa\b|australia|japan|china|canada|european",
    re.I,
)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def classify_scope(source: dict) -> str:
    explicit = str(source.get("geographic_scope", "")).strip().lower()
    text = " ".join(str(source.get(k, "")) for k in ("publisher", "source_type", "title", "url", "claim_limit", "limitation"))
    if explicit and any(x in explicit for x in ("global", "international", "multi-region", "worldwide")):
        return "global_or_international_source"
    if GLOBAL_PUBLISHERS.search(text):
        return "global_or_international_source"
    if COUNTRY_OR_INSTITUTIONAL.search(text):
        return "country_or_institution_specific_corroboration"
    return "geographic_scope_not_established"


def source_record(url: str, source_id: str | None, registry: dict[str, dict]) -> dict:
    source = registry.get(source_id or "") or registry.get(url) or {}
    parsed = urlparse(url)
    return {
        "source_id": source_id,
        "publisher": source.get("publisher", "not captured in shared evidence register"),
        "source_type": source.get("source_type", "not captured in shared evidence register"),
        "title": source.get("title", "title not captured in shared evidence register"),
        "url": url,
        "host": parsed.netloc,
        "locator": source.get("locator", "review artifact locator retained where available"),
        "claim_supported": source.get("claim_supported", source.get("supports", "See originating review artifact; no new claim inferred by this reconciler.")),
        "claim_limit": source.get("claim_limit", source.get("limitation", source.get("limit", "The originating review must be consulted for the claim boundary."))),
        "geographic_scope_disposition": classify_scope(source or {"url": url}),
    }


def shared_review(review: dict, registry_by_id: dict[str, dict], registry_by_url: dict[str, dict]) -> tuple[dict, list[dict]]:
    areas = []
    all_sources: dict[str, dict] = {}
    for item in review.get("specializations", []):
        urls = item.get("sources", [])
        ids = item.get("source_ids", [])
        cites = []
        for index, url in enumerate(urls):
            sid = ids[index] if index < len(ids) else None
            source = source_record(url, sid, registry_by_id | registry_by_url)
            cites.append(source)
            all_sources[url] = source
        areas.append({
            "label": item.get("label"),
            "plain_language_scope": item.get("description"),
            "source_support_claim": item.get("source_support"),
            "evidence": cites,
        })
    result = {
        "recommendation": review.get("decision"),
        "candidate_area_count": review.get("specialization_count", len(areas)),
        "candidate_areas": areas,
        "criteria_disposition": review.get("criteria_disposition", {}),
        "alternatives_considered": review.get("alternatives_considered", []),
        "residual_uncertainties": review.get("uncertainties", []),
        "review_status": review.get("review_status"),
        "external_academic_signoff_status": review.get("external_academic_signoff_status", "not_obtained"),
    }
    return result, list(all_sources.values())


def lane_review(domain_id: str) -> tuple[dict, list[dict]]:
    path = GENERAL / f"{domain_id}_specialization_candidate_review_2026_10_05.json"
    raw = read_json(path)
    cites = [source_record(e.get("url", ""), e.get("source_id"), {}) for e in raw.get("evidence", [])]
    areas = raw.get("candidate_areas", [])
    supplement = read_json(SUPPLEMENT)
    supplement_domain = next((x for x in supplement.get("domains", []) if x.get("domain_id") == domain_id), None)
    supplemental_sources = []
    if supplement_domain:
        for e in supplement_domain.get("evidence", []):
            supplemental_sources.append({
                "source_id": e.get("source_id"),
                "publisher": e.get("publisher"),
                "source_type": e.get("source_type", "not stated"),
                "title": e.get("title", "title not stated"),
                "url": e.get("url", ""),
                "host": urlparse(e.get("url", "")).netloc,
                "locator": e.get("locator", ""),
                "claim_supported": e.get("supports", ""),
                "claim_limit": e.get("limit", ""),
                "geographic_scope_disposition": classify_scope(e),
            })
    uncertainties = raw.get("remaining_review", [])
    if isinstance(uncertainties, str):
        uncertainties = [uncertainties]
    result = {
        "recommendation": raw.get("decision"),
        "candidate_area_count": len(areas),
        "candidate_areas": areas,
        "boundary_and_exclusion_rules": raw.get("boundary_and_exclusion_rules", []),
        "residual_uncertainties": uncertainties,
        "review_status": raw.get("review_status"),
        "explicit_non_decisions": raw.get("explicit_non_decisions", []),
        "source_triage_excerpt": raw.get("source_triage_excerpt"),
        "evidence": cites,
        "supplemental_evidence": supplemental_sources,
    }
    return result, cites + supplemental_sources


def d098_review(registry_by_id: dict[str, dict], registry_by_url: dict[str, dict]) -> tuple[dict, list[dict]]:
    adjudication = read_json(D098_ADJUDICATION)
    sources = []
    areas = []
    proposed = read_json(GENERAL / "d098_shared_projection_reconciliation_001.json").get("proposed_review_projection", {})
    for area in proposed.get("specializations", []):
        citations = []
        ids = area.get("source_ids", [])
        for index, url in enumerate(area.get("sources", [])):
            sid = ids[index] if index < len(ids) else None
            cited = source_record(url, sid, registry_by_id | registry_by_url)
            citations.append(cited)
            sources.append(cited)
        areas.append({"label": area.get("label"), "plain_language_scope": area.get("description"), "source_support_claim": area.get("source_support"), "evidence": citations})
    result = {
        "recommendation": adjudication.get("count_disposition"),
        "candidate_area_count": len(adjudication.get("recommended_internal_candidate_set", [])),
        "candidate_areas": adjudication.get("recommended_internal_candidate_set", []),
        "review_status": "reconciled_recommendation_pending_shared_register_and_canonical_adoption",
        "residual_uncertainties": adjudication.get("limitations", []),
        "conflict_reconciliation": {
            "shared_register_candidate_count": adjudication.get("conflict", {}).get("shared_register_set") and 3,
            "adjudicated_candidate_count": len(adjudication.get("recommended_internal_candidate_set", [])),
            "decision": adjudication.get("count_disposition"),
            "canonical_write": adjudication.get("canonical_write", False),
        },
        "alternatives_considered": [],
    }
    return result, sources


def provisional_lane_review(domain_id: str) -> tuple[dict, list[dict]]:
    """Normalize the eight explicitly provisional D057-D091 reviews without redoing them."""
    raw = read_json(LANE / "D057_D091" / f"{domain_id}_specialization_review.json")
    decision = raw.get("decision", {})
    areas = raw.get("candidate_specializations", raw.get("specializations", []))
    source_records = []
    for source in raw.get("source_register", []):
        url = source.get("url", "")
        source_records.append({
            "source_id": source.get("source_id"),
            "publisher": source.get("publisher", "not stated"),
            "source_type": source.get("source_type", "not stated"),
            "title": source.get("title", "not stated"),
            "url": url,
            "host": urlparse(url).netloc,
            "locator": source.get("locator", "not stated"),
            "claim_supported": source.get("supports", source.get("claim_supported", "")),
            "claim_limit": source.get("claim_limit", source.get("does_not_support", "")),
            "geographic_scope_disposition": classify_scope(source),
        })
    result = {
        "recommendation": decision.get("disposition", decision.get("recommendation", "")),
        "candidate_area_count": decision.get("count", len(areas)),
        "candidate_area_count_status": decision.get("count_status", "not specified"),
        "candidate_areas": areas,
        "parent_scope_disposition": decision.get("parent_domain_fit", decision.get("parent_scope_disposition", "not explicitly captured")),
        "criteria_disposition": raw.get("criteria_disposition", {}),
        "alternatives_considered": raw.get("alternatives_and_boundaries", raw.get("alternatives_considered", [])),
        "residual_uncertainties": raw.get("limitations", raw.get("uncertainties", [])),
        "review_status": raw.get("review_status"),
        "external_academic_signoff_status": raw.get("external_academic_signoff_status", "not_obtained"),
    }
    return result, source_records


def make_domain(domain_id: str, register: dict, source_by_id: dict[str, dict], source_by_url: dict[str, dict]) -> dict:
    if domain_id == "D098":
        decision, sources = d098_review(source_by_id, source_by_url)
        origin = [
            str(GENERAL / "D098_three_vs_four_area_adjudication_001.json"),
            str(GENERAL / "d098_shared_projection_reconciliation_001.json"),
            str(GENERAL / "D098_specialization_review.json"),
        ]
    elif domain_id in PROVISIONAL_IDS:
        decision, sources = provisional_lane_review(domain_id)
        origin = [str(LANE / "D057_D091" / f"{domain_id}_specialization_review.json")]
    elif domain_id in {"D001", "D002", "D092", "D093", "D094", "D095", "D096", "D097"}:
        raw = next(x for x in register["domain_reviews"] if x["domain_id"] == domain_id)
        decision, sources = shared_review(raw, source_by_id, source_by_url)
        origin = [str(REGISTER_PATH)]
    else:
        decision, sources = lane_review(domain_id)
        origin = [str(GENERAL / f"{domain_id}_specialization_candidate_review_2026_10_05.json"), str(SUPPLEMENT)]

    if domain_id in PROVISIONAL_IDS:
        source_urls = [s.get("url", "") for s in sources]
    elif domain_id in {"D001", "D002", "D092", "D093", "D094", "D095", "D096", "D097"}:
        source_urls = [u for item in decision["candidate_areas"] for u in [x["url"] for x in item.get("evidence", [])]]
    else:
        source_urls = [x.get("url", "") for x in sources]
    source_urls = list(dict.fromkeys(u for u in source_urls if u))
    global_count = sum(1 for x in sources if x.get("geographic_scope_disposition") == "global_or_international_source")
    # Detect Nigerian-published/located sources only. Do not mistake a generic
    # claim-limit sentence about later Nigerian review for Nigeria evidence.
    local_references = [
        x for x in sources
        if re.search(r"nigeria|nigerian|nihotour|nbte|nuc\b", " ".join(
            str(x.get(k, "")) for k in ("publisher", "title", "url", "host")
        ), re.I)
    ]
    domain_name = next(
        (x.get("domain_name") for x in register.get("domain_reviews", []) if x.get("domain_id") == domain_id),
        None,
    )
    if domain_id in PROVISIONAL_IDS:
        domain_name = read_json(LANE / "D057_D091" / f"{domain_id}_specialization_review.json").get("domain_name") or domain_name
    if not domain_name:
        lane_path = GENERAL / f"{domain_id}_specialization_candidate_review_2026_10_05.json"
        if lane_path.exists():
            domain_name = read_json(lane_path).get("domain_name")
    if domain_id == "D098":
        domain_name = "Precision Engineering and Toolmaking"
    return {
        "schema_version": "2026-10-06.global-specialization-reconciliation.v1",
        "domain_id": domain_id,
        "domain_name": domain_name,
        "review_scope": "GLOBAL only; no Nigeria-specific search, inference, or taxonomy applied",
        "originating_artifacts": origin,
        "recommendation": decision,
        "evidence_reconciliation": {
            "unique_source_urls": len(source_urls),
            "source_records": sources,
            "global_or_international_source_records": global_count,
            "geography_not_established_or_country_institution_specific_count": len(sources) - global_count,
            "nigeria_specific_source_or_claim_found": bool(local_references),
            "nigeria_references": local_references,
            "source_limitation": "Geographic classification is a screening aid, not proof that a source applies universally. Country/institution-specific sources are comparative corroboration only; they do not independently establish a global taxonomy or local licensing/demand.",
        },
        "final_reconciliation_disposition": "existing_evidence_reused_and_reconciled; recommendation remains internal and noncanonical",
        "role_assignments": "none; role-to-domain fit and role-to-specialization assignment are outside this lane",
        "canonical_write": False,
        "source_limitations": decision.get("residual_uncertainties", []),
    }


def render_markdown(record: dict) -> str:
    evidence = record["evidence_reconciliation"]
    recommendation = record["recommendation"]
    lines = [
        f"# {record['domain_id']} — {record['domain_name']}",
        "",
        "Global specialization recommendation reconciliation (2026-10-06). This is an internal recommendation, not canonical taxonomy or external academic sign-off.",
        "",
        f"- **Candidate areas:** {recommendation.get('candidate_area_count', len(recommendation.get('candidate_areas', [])))}",
        f"- **Evidence URLs:** {evidence['unique_source_urls']} unique; {evidence['global_or_international_source_records']} source records screened as global/international",
        f"- **Canonical changes / role assignments:** none / none",
        "- **Geographic scope:** global phase only; Nigerian-specific evidence intentionally deferred",
        "",
        "## Recommendation",
        "",
        str(recommendation.get("recommendation", "")),
        "",
        "## Candidate areas and boundaries",
        "",
    ]
    areas = recommendation.get("candidate_areas", [])
    for area in areas:
        if isinstance(area, str):
            lines.append(f"- {area}")
            continue
        label = area.get("label", area.get("name", "Unnamed candidate"))
        scope = area.get("plain_language_scope", area.get("description", area.get("boundary", "")))
        lines.append(f"- **{label}.** {scope}")
        support = area.get("source_support_claim")
        if support:
            lines.append(f"  - Source claim: {support}")
    lines += ["", "## Source evidence and limits", ""]
    for source in evidence["source_records"]:
        lines.append(f"- [{source.get('publisher')} — {source.get('title')}]({source.get('url')}) — {source.get('locator')} **Supports:** {source.get('claim_supported')} **Limit:** {source.get('claim_limit')} **Scope screen:** {source.get('geographic_scope_disposition')}.")
    lines += ["", "## Open limits / reconciliation notes", ""]
    residuals = recommendation.get("residual_uncertainties", []) or []
    if isinstance(residuals, str):
        residuals = [residuals]
    lines += [f"- {x}" for x in residuals] if residuals else ["- No additional unresolved boundary was recorded in the source artifact; the recommendation still requires local reconciliation and is not an academic-body approval."]
    conflict = recommendation.get("conflict_reconciliation")
    if conflict:
        lines += ["", f"D098 reconciliation: the existing shared register has {conflict['shared_register_candidate_count']} areas; later adjudication recommends {conflict['adjudicated_candidate_count']}. Retain the adjudicated four-area set as the lane recommendation, and reconcile the shared projection before any canonical application."]
    lines += ["", "## Audit boundary", "", "No roles were assigned to these areas. Current subgroup counts, ISCO grouping, role frequency and computational keyword hits were not used to determine candidate count. Nigeria-specific context is explicitly out of scope in this global phase.", ""]
    return "\n".join(lines)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    register = read_json(REGISTER_PATH)
    source_by_id = {x["source_id"]: x for x in register.get("evidence_register", []) if x.get("source_id")}
    source_by_url = {x["url"]: x for x in register.get("evidence_register", []) if x.get("url")}
    records = []
    for domain_id in TARGET_IDS:
        record = make_domain(domain_id, register, source_by_id, source_by_url)
        records.append(record)
        write_json(OUT / f"{domain_id}_global_specialization_reconciliation.json", record)
        (OUT / f"{domain_id}_global_specialization_reconciliation.md").write_text(render_markdown(record), encoding="utf-8")

    counts = {
        "expected_domain_ids": len(TARGET_IDS),
        "examined_domain_ids": len(records),
        "missing_domain_ids": [x for x in TARGET_IDS if x not in {r["domain_id"] for r in records}],
        "per_domain_artifacts_written": len(records),
        "recommendations_reused_or_reconciled": len(records),
        "canonical_files_changed": 0,
        "role_assignments_made": 0,
        "nigeria_specific_research_performed": False,
        "total_unique_source_urls": len({s["url"] for r in records for s in r["evidence_reconciliation"]["source_records"] if s.get("url")}),
        "domains_with_missing_candidate_evidence": [r["domain_id"] for r in records if not r["evidence_reconciliation"]["source_records"]],
        "domains_with_nigeria_specific_material": [r["domain_id"] for r in records if r["evidence_reconciliation"]["nigeria_specific_source_or_claim_found"]],
        "d098_shared_register_conflict": "four-area adjudication versus three-area original shared-register proposal; recommendation only, reconcile before canonical application",
    }
    write_json(OUT / "global_specialization_reconciliation_2026_10_06.json", {"schema_version": "2026-10-06.global-specialization-reconciliation-summary.v1", "counts": counts, "domain_ids": TARGET_IDS})
    md = [
        "# Global specialization reconciliation — D001–D002, provisional D057–D066, D092–D112",
        "",
        "Date: 2026-10-06. This disjoint lane reuses and checks current source-backed artifacts; it does not silently recreate completed review work.",
        "",
        "## Scope and counts",
        "",
        f"- Expected/examined: **{counts['expected_domain_ids']}/{counts['examined_domain_ids']} domain IDs**.",
        f"- Per-domain reconciliation artifacts: **{counts['per_domain_artifacts_written']} JSON + {counts['per_domain_artifacts_written']} Markdown**.",
        f"- Unique source URLs carried into the reconciliations: **{counts['total_unique_source_urls']}**.",
        f"- Missing candidate-evidence domains: **{len(counts['domains_with_missing_candidate_evidence'])}** ({', '.join(counts['domains_with_missing_candidate_evidence']) or 'none'}).",
        f"- Nigerian-specific research: **not performed**, as explicitly required.",
        "- Canonical taxonomy edits / role assignments: **0 / 0**.",
        "",
        "## Interpretation",
        "",
        "The 23 requested IDs outside the provisional D057–D066 slice already had review recommendations in the shared register and/or the D099–D112 lane. The eight carried-forward provisional D057–D066 records are normalized from their lane reviews without repeating completed source research. This reconciliation does not claim recommendations are canonical or academically approved. Country- and institution-specific international examples are corroboration only, not global requirements.",
        "",
        "The eight explicitly open/provisional D057–D091 IDs are D057, D058, D060, D062, D063, D064, D065 and D066. Their parent/count/coverage limits and source records are retained in their per-domain outputs.",
        "",
        "D098 is the explicit conflict: the original shared register says three candidate areas, while the later sourced adjudication recommends four (precision production; precision instruments/optics; dimensional metrology; horology). The four-area version is recorded as the latest lane recommendation, but it remains to be reconciled into the shared register and is not a canonical change.",
        "",
        "## Domain dispositions (31 IDs)",
        "",
        "| ID | Domain | Candidate areas | Existing review disposition |",
        "|---|---|---:|---|",
    ]
    for r in records:
        rec = r["recommendation"]
        areas = rec.get("candidate_area_count", len(rec.get("candidate_areas", [])))
        md.append(f"| {r['domain_id']} | {r['domain_name']} | {areas} | {rec.get('review_status', 'reconciled recommendation; review status retained in artifact')} |")
    md += ["", "## Source limitations", "", "- This is a source-grounded internal taxonomy review, not endorsement, accreditation, or sign-off by an academic body.", "- WorldSkills and international professional/standards sources establish recognizable practice boundaries, not a universally mandated subgroup count.", "- Foreign national standards and institutional curricula can corroborate a practice but cannot establish Nigerian licensing, curriculum requirements, or workforce demand; those belong to a later separately labeled Nigeria pass.", "- Candidate count is based on distinct learning/practice scope and source-backed boundaries, never current subgroup count, ISCO buckets, role frequency, or keyword hits.", "- Role-to-domain and role-to-specialization fit remains separate; no roles were attached here.", "", "## Reproduction", "", "`python data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/build_global_specialization_reconciliation_2026_10_06.py`", ""]
    (OUT / "GLOBAL_SPECIALIZATION_RECONCILIATION_2026_10_06.md").write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    main()
