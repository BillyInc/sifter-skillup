"""Build source evidence candidates for current domain names.

This is a provenance audit, not a taxonomy rewrite. It tests whether a
practitioner-facing label is an exact source term or a defensible umbrella over
the domain's industry and occupational anchors. It never promotes a label or
changes downstream data automatically.
"""

from __future__ import annotations

import json
import re
import zipfile
from collections import Counter
from pathlib import Path

from _audit_domain_source_traceability import (
    ESCO_ZIP,
    ISCO_XLSX,
    META,
    OUT_DIR,
    ROLE_LIBRARY,
    docx_paragraphs,
    parse_domain_details,
    source_codes,
)


STRUCTURE = META.parent / "domain_structure.json"
ESCO_JSON = META.parent / "taxonomies" / "esco_occupations.json"
CROSSWALK = OUT_DIR / "isic_domain_crosswalk_2026-08-31.json"
DOMAIN_EVIDENCE = META.parent / "domain_skill_competency_certification_audit.json"
NIGERIAN_EVIDENCE = META.parent / "nigerian_fresh_web_enrichment_2026-08-26.json"
SOURCE_REGISTRY = META.parent / "domain_role_source_registry.json"

STOP = {
    "and", "the", "of", "for", "to", "in", "with", "&", "science",
    "engineering", "management", "technology", "systems", "services",
    "practice", "design", "analysis", "research", "production",
}


def norm(value: str) -> str:
    value = str(value or "").strip()
    if value.lower() in {"nan", "none", "null"}:
        return ""
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def tokens(value: str) -> set[str]:
    return {item for item in re.findall(r"[a-z][a-z0-9]+", norm(value)) if len(item) > 3 and item not in STOP}


def stems(value: str) -> set[str]:
    result = set()
    for item in tokens(value):
        for suffix in ("ies", "ers", "ing", "ed", "es", "s"):
            if item.endswith(suffix) and len(item) - len(suffix) >= 4:
                item = item[: -len(suffix)]
                break
        result.add(item)
    return result


def evidence_matches(label: str, terms: list[dict], limit: int = 20) -> list[dict]:
    label_norm = norm(label)
    label_tokens = tokens(label)
    scored = []
    for term in terms:
        text = term.get("term", "")
        text_norm = norm(text)
        overlap = label_tokens & tokens(text)
        if not overlap:
            overlap = stems(label) & stems(text)
        exact = bool(label_norm and (label_norm == text_norm or label_norm in text_norm or text_norm in label_norm))
        if exact or overlap:
            scored.append((1 if exact else 0, len(overlap), term))
    scored.sort(key=lambda item: (-item[0], -item[1], item[2].get("term", "")))
    return [item[2] for item in scored[:limit]]


def main() -> None:
    meta = json.loads(META.read_text(encoding="utf-8"))
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    trace = json.loads((OUT_DIR / "domain_source_traceability_2026-08-31.json").read_text(encoding="utf-8"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8"))
    domain_evidence = json.loads(DOMAIN_EVIDENCE.read_text(encoding="utf-8"))
    nigerian_evidence = json.loads(NIGERIAN_EVIDENCE.read_text(encoding="utf-8"))
    registry = json.loads(SOURCE_REGISTRY.read_text(encoding="utf-8"))
    source_records = {row.get("id"): row for row in nigerian_evidence.get("sources", [])}
    source_records.update(registry.get("source_catalog", {}))
    details = parse_domain_details(docx_paragraphs(Path.home() / "Downloads" / "sifter_domain_definition_library_v2 (1).docx"))
    isco_codes, isco_titles = source_codes(ISCO_XLSX, 1, 2)
    esco = json.loads(ESCO_JSON.read_text(encoding="utf-8"))
    role_library = json.loads(ROLE_LIBRARY.read_text(encoding="utf-8"))
    esco_by_group: dict[str, list[dict]] = {}
    for uri, row in esco.items():
        item = dict(row)
        item["uri"] = uri
        esco_by_group.setdefault(str(row.get("isco_group") or ""), []).append(item)

    crosswalk_by_domain = {row["domain_id"]: row for row in crosswalk["domains"]}
    trace_by_domain = {row["domain_id"]: row for row in trace["domains"]}
    evidence_by_domain = {row["domain_id"]: row for row in domain_evidence.get("domains", [])}
    output = []
    for domain_id in sorted(meta, key=lambda value: int(value[1:])):
        current = meta[domain_id]
        detail = details.get(domain_id, {})
        trace_row = trace_by_domain.get(domain_id, {})
        crosswalk_row = crosswalk_by_domain.get(domain_id, {})
        source_terms: list[dict] = []
        for item in crosswalk_row.get("crosswalks", []):
            for candidate in item.get("rev5_candidates", []):
                source_terms.append({"term": candidate.get("title"), "source": "ISIC Rev.5", "reference": candidate.get("code")})
        for code in detail.get("isco_unit_groups", []):
            if code in isco_titles:
                source_terms.append({"term": isco_titles[code], "source": "ISCO-08", "reference": code})
            for role in esco_by_group.get(code, []):
                source_terms.append({"term": role.get("label", ""), "source": "ESCO", "reference": role.get("uri")})
                for alias in role.get("alt_labels", [])[:8]:
                    source_terms.append({"term": alias, "source": "ESCO alternative label", "reference": role.get("uri")})
        for role in role_library:
            if role.get("domain_id") != domain_id:
                continue
            reference = ":".join(str(value) for value in (role.get("isco_group"), role.get("esco_code")) if value)
            source_terms.append({"term": role.get("role_name", ""), "source": f"role library ({role.get('source') or 'source-backed'})", "reference": reference})
            if role.get("also_known_as"):
                source_terms.append({"term": role["also_known_as"], "source": "role library alias", "reference": reference})
        source_terms = [term for term in source_terms if norm(term.get("term", ""))]
        matches = evidence_matches(current.get("domain_name", ""), source_terms)
        exact = any(norm(item["term"]) == norm(current.get("domain_name", "")) for item in matches)
        domain_evidence_row = evidence_by_domain.get(domain_id, {})
        contextual_source_ids = set()
        for source in domain_evidence_row.get("global_sources", []) or []:
            if source.get("source_id"):
                contextual_source_ids.add(source["source_id"])
        contextual_source_ids.update(
            domain_evidence_row.get("nigerian_overlay_evidence", {}).get("source_ids", []) or []
        )
        contextual_sources = []
        for source_id in sorted(contextual_source_ids):
            record = source_records.get(source_id)
            if record:
                contextual_sources.append({
                    "source_id": source_id,
                    "name": record.get("name"),
                    "url": record.get("url"),
                    "urls": record.get("urls"),
                    "region": record.get("region"),
                    "evidence_type": record.get("evidence_type"),
                    "role": "contextual support; not a literal source-name match",
                })
            else:
                contextual_sources.append({
                    "source_id": source_id,
                    "name": None,
                    "url": None,
                    "urls": None,
                    "region": None,
                    "evidence_type": None,
                    "role": "registered source reference; source record not available in this extract",
                })
        # The source-trace audit is the authority for identity classification.
        # A literal source-term match is not required for the 166 original
        # records: the supplied library identity, cluster, ISIC anchors, ISCO
        # anchors, and linked ESCO role set can support a practitioner-facing
        # umbrella label. Later additions remain explicitly curated.
        identity_status = trace_row.get("identity_status")
        if identity_status:
            naming_status = identity_status
            review_state = "source_identity_reconciled"
        elif exact:
            naming_status = "exact_source_terminology"
            review_state = "source_identity_reconciled"
        elif matches or contextual_sources:
            naming_status = "source_supported_umbrella"
            review_state = "source_identity_reconciled"
        else:
            naming_status = "curated_addition"
            review_state = "curated_identity_recorded"
        output.append({
            "domain_id": domain_id,
            "current_domain_name": current.get("domain_name"),
            "source_library_name": trace_row.get("source_library_name"),
            "naming_status": naming_status,
            "review_state": review_state,
            "identity_decision": trace_row.get("identity_decision"),
            "boundary_criteria": trace_row.get("boundary_criteria") or [
                "shared work outputs and day-to-day practice",
                "shared learning foundation and entry routes",
                "coherent industry and occupational source anchors",
            ],
            "domain_definition": current.get("description"),
            "industry_context": detail.get("industry_context"),
            "raw_isic_values": detail.get("isic_divisions", []),
            "canonical_isic_candidates": sorted({
                item.get("code")
                for crosswalk_item in crosswalk_row.get("crosswalks", [])
                for item in crosswalk_item.get("rev5_candidates", [])
                if item.get("code")
            }),
            "isco_unit_groups": detail.get("isco_unit_groups", []),
            "source_term_matches": matches,
            "contextual_source_records": contextual_sources,
            "boundary_review_questions": [
                "Which source terms describe the common work output shared by this domain?",
                "Why is this boundary separate from neighbouring domains with overlapping sources?",
                "Does the current practitioner-facing label accurately cover the linked occupational anchors?",
            ],
            "downstream_policy": "Preserve current domain ID and downstream subgroup/role ownership unless an explicit reviewed identity decision says the boundary changed.",
        })

    counts = Counter(row["naming_status"] for row in output)
    out = {
        "schema_version": "2026-08-31.domain-naming-provenance.v1",
        "purpose": "Record the reconciled identity class for every current domain: exact source terminology, source-supported practitioner-facing umbrella, or curated later addition, without rewriting the taxonomy.",
        "source_layers": ["ISIC Rev.5", "ISCO-08", "ESCO", "O*NET/global proxy", "WEF", "specialist frameworks", "Nigerian evidence"],
        "source_limit": "The source-trace identity decision uses the supplied domain-library record, cluster, industry anchors, occupational anchors, and linked role set. A source-term match alone is not treated as proof of a boundary.",
        "summary": {"domain_count": len(output), "naming_status_counts": dict(counts)},
        "domains": output,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "domain_naming_provenance_2026-08-31.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Domain naming provenance audit — 2026-08-31",
        "",
        "This audit records the reconciled identity class for each current domain using the source-library identity, ISIC Rev.5 industry context, ISCO-08 occupational function, ESCO roles, and relevant specialist/global/Nigerian context records. It is not an automatic rename operation.",
        "",
        f"- Domains evaluated: **{len(output)}**.",
        f"- Exact source terminology: **{counts.get('exact_source_terminology', 0)}**.",
        f"- Source-supported umbrella: **{counts.get('source_supported_umbrella', 0)}**.",
        f"- Curated later additions: **{counts.get('curated_addition', 0)}**.",
        "",
        "A source-supported umbrella means the original source-library identity and its industry/occupational anchors support the practitioner-facing label; it does not mean that ISIC, ISCO, or ESCO literally used the Sifter label. Curated additions are explicitly outside the original 166-domain library.",
        "",
        "| ID | Current label | Status | Review state | Supporting source terms |",
        "|---|---|---|---|---|",
    ]
    for row in output:
        terms = "; ".join(f"{item['term']} ({item['source']})" for item in row["source_term_matches"][:4]) or "—"
        lines.append(f"| `{row['domain_id']}` | {row['current_domain_name']} | `{row['naming_status']}` | `{row['review_state']}` | {terms} |")
    lines += [
        "",
        "## Boundary decision recorded",
        "",
        "For each domain, retain the source terms, explain the shared work output and learning boundary, and use the recorded identity class. Do not claim that an umbrella or curated label came verbatim from ISIC/ISCO/ESCO.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_domain_naming_provenance.py",
        "```",
    ]
    (OUT_DIR / "DOMAIN_NAMING_PROVENANCE_AUDIT_2026-08-31.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
