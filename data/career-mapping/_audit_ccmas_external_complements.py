"""Attach Nigerian curriculum evidence to CCMAS/JAMB links that remain under review.

This is deliberately an evidence audit, not a promotion or SQL-generation
script. A full CCMAS programme can be resolved while one of its programme ->
domain links still has too few specific course anchors. The primary evidence
for those rows must be Nigerian curriculum content: the extracted CCMAS
course title, code, learning outcomes, and content summary. Global domain
sources may explain the target domain, but they cannot replace Nigerian
programme evidence. A genuinely non-CCMAS JAMB programme must instead have
an explicit Nigerian external curriculum scope with course/outcome evidence
before its links can be exposed.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
AUDIT = HERE / "_audit"
CANONICAL = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
JAMB_DOMAINS = HERE / "jamb_domain_map.json"
PROGRAMME_EVIDENCE = AUDIT / "programme_domain_evidence_2026-08-17.json"
DOMAIN_TRACE = AUDIT / "domain_source_traceability_2026-08-31.json"
DOMAIN_NAMING = AUDIT / "domain_naming_provenance_2026-08-31.json"
DOMAIN_LAYERS = HERE / "domain_skill_competency_certification_audit.json"
NIGERIAN_ENRICHMENT = HERE / "nigerian_fresh_web_enrichment_2026-08-26.json"
CCMAS_DIR = HERE / "ccmas"
REGISTRY = HERE / "domain_role_source_registry.json"
OUT_JSON = AUDIT / "ccmas_external_domain_complements_2026-09-01.json"
OUT_MD = AUDIT / "CCMAS_EXTERNAL_DOMAIN_COMPLEMENTS_2026-09-01.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def basename(path: str | None) -> str | None:
    return Path(path).name if path else None


def source_record_map() -> dict[str, dict]:
    """Combine the local source catalogs without treating a registry as proof."""
    result: dict[str, dict] = {}
    result.update({
        "sifter_domain_definition_library_v2": {
            "source_id": "sifter_domain_definition_library_v2",
            "name": "Sifter Professional Domain Definition Library v2",
        },
        "isic_rev5_local_workbook": {
            "source_id": "isic_rev5_local_workbook",
            "name": "ISIC Rev.5 local workbook",
            "url": "https://unstats.un.org/unsd/classifications/Econ/ISIC.cshtml",
        },
        "isco08_local_workbook": {
            "source_id": "isco08_local_workbook",
            "name": "ILO ISCO-08 local workbook",
            "url": "https://isco.ilo.org/en/isco-08/",
        },
        "esco_v121_local_archive": {
            "source_id": "esco_v121_local_archive",
            "name": "ESCO v1.2.1 local archive",
            "url": "https://esco.ec.europa.eu/en/use-esco",
        },
    })
    registry = load(REGISTRY)
    for source_id, record in (registry.get("source_catalog") or {}).items():
        result[source_id] = {"source_id": source_id, **record}
    layers = load(DOMAIN_LAYERS)
    for row in layers.get("domains", []):
        for source in row.get("global_sources") or []:
            if source.get("source_id"):
                result[source["source_id"]] = dict(source)
        for source_id in row.get("nigerian_overlay_evidence", {}).get("source_ids", []) or []:
            result.setdefault("__missing__", {})
    # The Nigerian audit was built in several dated supplements.  Read every
    # top-level catalog with a `sources` array so a source ID is not reported
    # as missing merely because it lives in an earlier supplement.
    catalog_paths = sorted(HERE.glob("nigerian*.json")) + sorted(HERE.glob("global*.json"))
    catalog_paths += sorted((HERE / "enrichment").glob("*.json"))
    for path in catalog_paths:
        try:
            enrichment = load(path)
        except (OSError, json.JSONDecodeError):
            continue
        for source in enrichment.get("sources", []) if isinstance(enrichment, dict) else []:
            if not isinstance(source, dict):
                continue
            source_id = source.get("id") or source.get("source_id")
            if source_id:
                result[source_id] = {
                    "source_id": source_id,
                    "name": source.get("name"),
                    "region": source.get("region"),
                    "evidence_type": source.get("evidence_type"),
                    "url": source.get("url") or (source.get("urls") or [None])[0],
                    "urls": source.get("urls"),
                    "availability": source.get("availability"),
                    "scope": source.get("scope"),
                    "limitations": source.get("limitations"),
                }
    return result


def load_ccmas_programmes() -> dict[str, dict]:
    """Index the Nigerian CCMAS programme extracts by their resolved component."""
    result: dict[str, dict] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        source = load(path)
        discipline = source.get("discipline")
        if not discipline:
            continue
        for programme in source.get("programmes", []) or []:
            name = programme.get("name")
            if not name:
                continue
            result[f"{discipline}::{name}"] = {
                "discipline": discipline,
                "source_file": path.name,
                "programme": programme,
            }
    return result


def curriculum_evidence(
    component_ref: str | None,
    evidence: dict,
    ccmas_by_ref: dict[str, dict],
) -> dict:
    """Return exact Nigerian curriculum material behind the detected anchors.

    The programme-domain evidence file intentionally stores only compact anchor
    records. This function joins those records back to the CCMAS extract so the
    audit preserves the actual Nigerian course/outcome evidence rather than
    implying that a global domain URL proved programme fit.
    """
    component = ccmas_by_ref.get(component_ref or "") or {}
    programme = component.get("programme") or {}
    course_by_identity = {}
    course_by_code = {}
    for course in programme.get("courses", []) or []:
        code = str(course.get("code") or "").strip()
        title = str(course.get("title") or "").strip()
        identity = f"{code}::{title}" if code and title else ""
        if identity:
            course_by_identity[identity] = course
        if code:
            course_by_code.setdefault(code, course)

    matched_courses = []
    for anchor in evidence.get("course_anchors", []) or []:
        identity = anchor.get("course_identity") or ""
        course = course_by_identity.get(identity) or course_by_code.get(str(anchor.get("code") or ""))
        if not course:
            matched_courses.append({
                "code": anchor.get("code"),
                "title": anchor.get("title"),
                "matched_anchors": anchor.get("matched_anchors") or [],
                "record_match": False,
            })
            continue
        matched_courses.append({
            "level": course.get("level"),
            "code": course.get("code"),
            "title": course.get("title"),
            "units": course.get("units"),
            "matched_anchors": anchor.get("matched_anchors") or [],
            "learning_outcomes": [
                item for item in (course.get("skills_learned") or [])
                if isinstance(item, str) and item.strip()
            ][:8],
            "content_summary": str(course.get("content_summary") or "")[:900] or None,
            "source_state": course.get("source_state"),
            "source_reference": course.get("source_reference"),
            "record_match": True,
        })

    quality = evidence.get("course_anchor_quality")
    if matched_courses and quality == "strong":
        status = "nigerian_ccmas_sufficient_for_link_gate"
        next_step = "The link has the required Nigerian CCMAS course anchors; the enclosing JAMB row may still remain under review because another candidate link is insufficient."
    elif matched_courses:
        status = "nigerian_ccmas_present_but_insufficient_for_gate"
        next_step = "Add or verify Nigerian CCMAS, professional-body, or Nigerian-university course/outcome evidence before promoting this link; global domain evidence cannot fill this gap."
    else:
        status = "nigerian_ccmas_anchor_missing"
        next_step = "Find exact Nigerian curriculum course/outcome evidence or retain the link as unresolved; do not infer it from global occupational sources."

    return {
        "source_kind": "Nigerian CCMAS curriculum extract",
        "discipline": component.get("discipline"),
        "programme_name": programme.get("name"),
        "ccmas_code": programme.get("code"),
        "source_file": f"ccmas/{component.get('source_file')}" if component.get("source_file") else None,
        "course_anchor_quality": quality,
        "course_anchor_count": evidence.get("course_anchor_count", 0),
        "matched_course_count": len(matched_courses),
        "matched_courses": matched_courses,
        "evidence_status": status,
        "required_next_step": next_step,
    }


def domain_external_refs(
    domain_id: str,
    trace_by_id: dict[str, dict],
    naming_by_id: dict[str, dict],
    layer_by_id: dict[str, dict],
    records: dict[str, dict],
) -> list[dict]:
    """Return source references that explain the domain, not the programme fit."""
    refs: list[dict] = []
    seen: set[tuple[str, str | None]] = set()

    def add(ref: dict):
        source_id = str(ref.get("source_id") or "")
        url = ref.get("source_url") or ref.get("url")
        key = (source_id, tuple(url) if isinstance(url, list) else url)
        if not source_id and not url:
            return
        if key in seen:
            return
        seen.add(key)
        refs.append(ref)

    trace = trace_by_id.get(domain_id) or {}
    for ref in trace.get("source_record_refs", []) or []:
        source_id = ref.get("source_id")
        record = records.get(source_id) or {}
        add({
            "source_id": source_id,
            "source_name": record.get("name") or ref.get("source_name"),
            "source_url": ref.get("source_url") or record.get("url"),
            "source_urls": ref.get("source_urls") or record.get("urls"),
            "source_file": basename(ref.get("source_file")),
            "locator": ref.get("locator"),
            "claim_supported": ref.get("claim") or "domain identity or occupational anchor",
            "evidence_status": "local_source_record",
            "limitation": ref.get("limitation") or "Supports domain identity; does not prove programme fit.",
        })

    layer = layer_by_id.get(domain_id) or {}
    for source in layer.get("global_sources", []) or []:
        source_id = source.get("source_id")
        record = records.get(source_id) or source
        add({
            "source_id": source_id,
            "source_name": record.get("name"),
            "source_url": record.get("url"),
            "source_urls": record.get("urls"),
            "claim_supported": record.get("evidence_type") or "global domain/occupational context",
            "evidence_status": "local_source_record" if source_id in records else "unregistered_reference",
            "limitation": record.get("limitations") or "Global or proxy evidence; not a Nigerian demand claim and not programme-fit evidence.",
        })
    for source_id in layer.get("nigerian_overlay_evidence", {}).get("source_ids", []) or []:
        record = records.get(source_id) or {}
        add({
            "source_id": source_id,
            "source_name": record.get("name"),
            "source_url": record.get("url"),
            "source_urls": record.get("urls"),
            "claim_supported": record.get("evidence_type") or "Nigerian context or local source signal",
            "evidence_status": "local_source_record" if source_id in records else "unregistered_reference",
            "limitation": record.get("limitations") or "Nigerian context is not automatically Nigerian demand and does not prove programme fit.",
        })

    naming = naming_by_id.get(domain_id) or {}
    for term in naming.get("source_term_matches", [])[:8]:
        add({
            "source_id": f"term:{term.get('source')}:{term.get('reference')}",
            "source_name": term.get("source"),
            "source_url": None,
            "locator": term.get("reference"),
            "claim_supported": f"source vocabulary term: {term.get('term')}",
            "evidence_status": "source_term_match",
            "limitation": "Vocabulary support for the domain label; not evidence of curriculum fit.",
        })
    return refs


def main() -> None:
    canonical = load(CANONICAL)
    jamb_domains = load(JAMB_DOMAINS)
    programme_evidence = load(PROGRAMME_EVIDENCE)
    trace = load(DOMAIN_TRACE)
    naming = load(DOMAIN_NAMING)
    layers = load(DOMAIN_LAYERS)
    records = source_record_map()
    ccmas_by_ref = load_ccmas_programmes()

    trace_by_id = {row.get("domain_id"): row for row in trace.get("domains", [])}
    naming_by_id = {row.get("domain_id"): row for row in naming.get("domains", [])}
    layer_by_id = {row.get("domain_id"): row for row in layers.get("domains", [])}

    affected_rows: list[dict] = []
    unique_pairs: dict[tuple[str, str], dict] = {}
    for row in canonical.get("rows", []):
        if row.get("mapping_status") != "review_required":
            continue
        refs = row.get("component_refs") or []
        component_ref = refs[0] if len(refs) == 1 else None
        current = jamb_domains.get(row.get("jamb_name"), {})
        candidate_links = row.get("candidate_ccmas_domain_links") or current.get("links") or []
        links: list[dict] = []
        for link in candidate_links:
            domain_id = link.get("domain_id")
            if not domain_id:
                continue
            evidence = programme_evidence.get(f"{component_ref}::{domain_id}", {}) if component_ref else {}
            ext = domain_external_refs(domain_id, trace_by_id, naming_by_id, layer_by_id, records)
            item = {
                "jamb_name": row.get("jamb_name"),
                "mapping_type": row.get("mapping_type"),
                "inheritance_type": row.get("inheritance_type"),
                "component_ref": component_ref,
                "domain_id": domain_id,
                "domain_name": link.get("domain_name"),
                "match_type": link.get("match_type"),
                "ccmas_evidence": {
                    "record_found": bool(evidence),
                    "course_anchor_quality": evidence.get("course_anchor_quality"),
                    "course_anchor_count": evidence.get("course_anchor_count", 0),
                    "course_anchor_titles": [a.get("title") for a in evidence.get("course_anchors", []) if a.get("title")],
                    "review_required": bool(evidence.get("review_required")),
                    "source_review_required": bool(evidence.get("source_review_required")),
                },
                "nigerian_curriculum_evidence": curriculum_evidence(
                    component_ref, evidence, ccmas_by_ref
                ),
                "external_domain_evidence": ext,
                "external_complement_status": (
                    "attached_with_url"
                    if any(ref.get("source_url") or ref.get("source_urls") for ref in ext)
                    else ("attached_without_url" if ext else "source_record_missing")
                ),
                "promotion_disposition": "retain_review_required",
                "limitation": (
                    "External sources corroborate what this domain is and how its occupational boundary is understood. "
                    "They do not replace the missing or insufficient CCMAS course/outcome anchors. "
                    "Promote only after the programme evidence meets the Direct/Functional/Adjacent gate, "
                    "or after an explicit external programme curriculum with exact course/outcome evidence is reviewed."
                ),
            }
            links.append(item)
            pair_key = (component_ref or f"__missing__::{row.get('jamb_name')}", domain_id)
            unique_pairs.setdefault(pair_key, item)
        affected_rows.append({
            "jamb_name": row.get("jamb_name"),
            "mapping_type": row.get("mapping_type"),
            "component_ref": component_ref,
            "curriculum_scope": row.get("curriculum_scope"),
            "status_before": row.get("mapping_status"),
            "status_reason_before": row.get("status_reason"),
            "links": links,
        })

    external_ready = [
        row for row in canonical.get("rows", [])
        if row.get("inheritance_type") == "external_sources_required"
    ]
    status_counts = Counter(
        link.get("external_complement_status")
        for row in affected_rows
        for link in row.get("links", [])
    )
    out = {
        "schema_version": "2026-09-01.ccmas-external-domain-complements.v1",
        "purpose": "Audit under-review CCMAS/JAMB programme-to-domain links with exact Nigerian curriculum evidence without silently promoting them.",
        "source_boundary": {
            "full_ccmas_under_review": "The resolved Nigerian CCMAS programme is the primary programme-fit evidence. Exact course titles, codes, learning outcomes, and content summaries are joined into each link record. External sources explain the target domain but cannot substitute for insufficient Nigerian course/outcome anchors.",
            "no_ccmas_programme": "A D_custom row must have an explicit external curriculum scope with source URL/page and course/outcome evidence before it is ready_external.",
            "promotion_rule": "Direct and Functional require at least two specific CCMAS course/objective anchors; Adjacent requires one specific conceptual prerequisite plus transferable evidence.",
            "nigerian_evidence_rule": "Only Nigerian CCMAS, professional-body, or Nigerian-university curriculum evidence can fill a programme-fit gap. Global ISIC/ISCO/ESCO/O*NET/WEF evidence remains domain-context evidence.",
        },
        "summary": {
            "under_review_jamb_rows": len(affected_rows),
            "under_review_unique_component_domain_pairs": len(unique_pairs),
            "under_review_domain_links": sum(len(row.get("links", [])) for row in affected_rows),
            "external_complement_status_counts": dict(status_counts),
            "genuinely_non_ccmas_rows": len(external_ready),
            "genuinely_non_ccmas_ready_external_rows": sum(row.get("mapping_status") == "ready_external" for row in external_ready),
            "genuinely_non_ccmas_not_ready_rows": sum(row.get("mapping_status") != "ready_external" for row in external_ready),
            "nigerian_curriculum_evidence_status_counts": dict(Counter(
                link.get("nigerian_curriculum_evidence", {}).get("evidence_status")
                for row in affected_rows
                for link in row.get("links", [])
            )),
            "nigerian_curriculum_course_records_joined": sum(
                link.get("nigerian_curriculum_evidence", {}).get("matched_course_count", 0)
                for row in affected_rows
                for link in row.get("links", [])
            ),
        },
        "inputs": [
            str(CANONICAL.relative_to(HERE.parent)),
            str(JAMB_DOMAINS.relative_to(HERE.parent)),
            str(PROGRAMME_EVIDENCE.relative_to(HERE.parent)),
            str(DOMAIN_TRACE.relative_to(HERE.parent)),
            str(DOMAIN_NAMING.relative_to(HERE.parent)),
            str(DOMAIN_LAYERS.relative_to(HERE.parent)),
            str(NIGERIAN_ENRICHMENT.relative_to(HERE.parent)),
            str(REGISTRY.relative_to(HERE.parent)),
        ],
        "rows": affected_rows,
    }
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# CCMAS/JAMB external domain complements — 2026-09-01",
        "",
        "This artifact supplements, but does not promote, the CCMAS/JAMB links that remain under review.",
        "",
        "## Finding",
        "",
        f"- **{len(affected_rows)} JAMB rows** remain `review_required` in the canonical inheritance audit.",
        f"- They contain **{len(unique_pairs)} unique CCMAS-component/domain pairs** and **{sum(len(row.get('links', [])) for row in affected_rows)} domain-link occurrences**.",
        f"- External domain/occupational references with a URL were attached to **{status_counts.get('attached_with_url', 0)}** occurrences; **{status_counts.get('attached_without_url', 0)}** have a source reference without a URL; **{status_counts.get('source_record_missing', 0)}** lack a source record.",
        f"- The linked Nigerian CCMAS extracts provide **{out['summary']['nigerian_curriculum_course_records_joined']} exact course records** across the affected occurrences. Their status is recorded per link as sufficient, present-but-insufficient, or missing.",
        f"- The **{len(external_ready)} genuinely non-CCMAS rows** are a separate category; **{sum(row.get('mapping_status') == 'ready_external' for row in external_ready)}** already have an explicit reviewed external curriculum scope.",
        "",
        "The 86 rows are therefore not accurately described as ‘no CCMAS curriculum’. They have a resolved full CCMAS parent, but their domain-link evidence is not yet strong enough for certification. External domain sources make the target domain explainable and auditable; they do not turn one weak course anchor into two.",
        "",
        "## Required treatment",
        "",
        "1. Treat `nigerian_curriculum_evidence` as the programme-fit evidence shown to reviewers.",
        "2. Keep the mapping `review_required` until every exposed candidate link satisfies the active gate or is explicitly removed from the candidate set after review.",
        "3. For a genuinely non-CCMAS programme, use an external Nigerian curriculum source with exact course/outcome text, URL or page, and a reviewed scope; do not inherit a neighbouring CCMAS programme wholesale.",
        "4. Do not use global domain references to certify a Nigerian programme-to-domain link.",
        "5. Do not regenerate or apply SQL from this artifact. It is an evidence handoff for the final frozen generation step.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_ccmas_external_complements.py",
        "```",
        "",
        "## Affected JAMB rows",
        "",
        "| JAMB name | CCMAS component | Link occurrences | External refs attached | Status remains |",
        "|---|---|---:|---:|---|",
    ]
    for row in affected_rows:
        links = row.get("links", [])
        attached = sum(link.get("external_complement_status") == "attached_with_url" for link in links)
        lines.append(
            f"| {row.get('jamb_name')} | {row.get('component_ref') or 'not uniquely resolved'} | {len(links)} | {attached} | `retain_review_required` |"
        )
    lines += [
        "",
        "## Interpretation boundary",
        "",
        "A domain source answers ‘what is this professional world and what work belongs inside it?’ A CCMAS source answers ‘what does this programme teach?’ The programme-to-domain decision requires both sides and must retain the specific course/outcome anchors that connect them.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
