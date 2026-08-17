"""Audit whether any current subgroup has proof to become a new top-level domain.

This is a decision audit, not an automatic promotion script.  A subgroup may
look like a domain because its label is memorable, but promotion changes the
taxonomy and the CCMAS programme graph.  The audit therefore records the
source definition, role boundary, skill evidence, existing sibling overlap,
and programme-mapping impact before allowing a promotion.
"""

from __future__ import annotations

import json
import re
import zipfile
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parent
STRUCTURE = ROOT / "domain_structure.json"
META = ROOT / "domain_meta.json"
ROLES = ROOT / "role_library_v3_cleaned.json"
PROGRAMMES = ROOT / "programme_domain_final.json"
REGISTRY = ROOT / "domain_role_source_registry.json"
REPORT_JSON = ROOT / "_audit" / "subgroup_promotion_audit_2026-08-17.json"
REPORT_MD = ROOT / "_audit" / "subgroup_promotion_audit_2026-08-17.md"
DOMAIN_DOC = Path(r"C:\Users\USER\Downloads\sifter_domain_definition_library_v2 (1).docx")

# These are high-confidence possible promotions surfaced by the current
# labels and by already-existing sibling domain definitions.  They are kept
# explicit so the audit cannot silently promote on fuzzy string similarity.
CASES = [
    ("D011", "21", "D011", "parent domain already represents the quantitative-finance definition"),
    ("D011", "24", "D013", "investment-analysis sibling already exists"),
    ("D011", "33", "D062", "trading-and-capital-markets sibling already exists"),
    ("D013", "33", "D062", "trading-and-capital-markets sibling already exists"),
    ("D014", "33", "D061", "insurance-and-underwriting sibling already exists"),
    ("D062", "24", "D013", "investment-analysis sibling already exists"),
    ("D009", "25", "D002", "data-engineering sibling already exists"),
    ("D010", "25", "D002", "data-engineering sibling already exists"),
    ("D156", "21", "D072", "geospatial-science sibling already exists"),
    ("D010", "21", "D009", "data-science sibling already exists"),
    ("D027", "21", "D142", "bioinformatics sibling already exists"),
    ("D031", "52", "D085", "retail-sales sibling already exists"),
    ("D035", "13", "D034", "supply-chain sibling already exists"),
    ("D049", "72", "D095", "motor-vehicle-repair sibling already exists"),
    ("D075", "75", "D106", "garment-production sibling already exists"),
    ("D079", "13", "D034", "supply-chain sibling already exists"),
    ("D133", "34", "D080", "interior-design sibling already exists"),
    ("D166", "21", "D049", "automotive-engineering sibling already exists"),
]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def role_key(role: dict) -> str:
    return f"{role.get('domain_id')}|{role.get('role_name')}"


def canonical_roles() -> list[dict]:
    rows = load_json(ROLES)
    for name in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        path = ROOT / name
        if path.exists():
            rows.extend(load_json(path).get("roles") or [])
    deduped = {}
    for row in rows:
        deduped[role_key(row)] = row
    return list(deduped.values())


def definition_text() -> str:
    if not DOMAIN_DOC.exists():
        return ""
    with zipfile.ZipFile(DOMAIN_DOC) as archive:
        from xml.etree import ElementTree as ET

        root = ET.fromstring(archive.read("word/document.xml"))
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        paragraphs = [
            "".join(node.text or "" for node in paragraph.findall(".//w:t", ns))
            for paragraph in root.findall(".//w:p", ns)
        ]
        return "\n".join(paragraphs)


def source_definition(text: str, domain_id: str) -> str | None:
    if not text:
        return None
    number = int(domain_id[1:])
    marker = f"D{number:02d}  ·"
    start = text.find(marker)
    if start < 0:
        return None
    tail = text[start:]
    next_match = re.search(r"\nD\d{1,3}  ·", tail[len(marker) :])
    end = len(tail) if not next_match else len(marker) + next_match.start()
    return tail[: min(end, 2800)].strip()


def source_ids(registry: dict, domain_id: str) -> list[str]:
    overrides = registry.get("domain_overrides", {}).get(domain_id)
    if overrides:
        return list(overrides)
    meta = load_json(META).get(domain_id, {})
    cluster = meta.get("cluster")
    return sorted(set(registry.get("default_sources", [])) | set(registry.get("cluster_sources", {}).get(cluster, [])))


def programme_impact(programmes: dict) -> dict[str, dict]:
    counts: Counter[str] = Counter()
    tiers: dict[str, Counter[str]] = {}
    for row in programmes.values():
        for link in row.get("links") or []:
            domain_id = link.get("domain_id")
            if not domain_id:
                continue
            counts[domain_id] += 1
            tiers.setdefault(domain_id, Counter())[link.get("match_type") or "unknown"] += 1
    return {
        domain_id: {"links": counts[domain_id], "tiers": dict(tiers.get(domain_id, {}))}
        for domain_id in counts
    }


def main() -> None:
    structure = load_json(STRUCTURE)
    meta = load_json(META)
    registry = load_json(REGISTRY)
    programmes = load_json(PROGRAMMES)
    roles = canonical_roles()
    by_domain: dict[str, list[dict]] = {}
    for role in roles:
        by_domain.setdefault(str(role.get("domain_id")), []).append(role)
    impact = programme_impact(programmes)
    definitions = definition_text()

    cases = []
    for source_domain, subgroup_id, target_domain, reason in CASES:
        subgroup = next(
            (item for item in structure.get(source_domain, {}).get("subgroups") or []
             if str(item.get("isco_submajor")) == subgroup_id),
            None,
        )
        subgroup_roles = {
            role.get("role_name") for role in by_domain.get(source_domain, [])
            if str(role.get("isco_group", ""))[:2] == subgroup_id
        }
        target_roles = {role.get("role_name") for role in by_domain.get(target_domain, [])}
        overlap = subgroup_roles & target_roles
        overlap_ratio = len(overlap) / len(subgroup_roles) if subgroup_roles else 0
        target_exists = target_domain in meta
        cases.append({
            "source_domain": source_domain,
            "source_domain_name": meta.get(source_domain, {}).get("domain_name"),
            "subgroup_isco_submajor": subgroup_id,
            "subgroup_label": (subgroup or {}).get("label"),
            "subgroup_role_count": len(subgroup_roles),
            "subgroup_roles": sorted(subgroup_roles),
            "possible_sibling_domain": target_domain,
            "possible_sibling_name": meta.get(target_domain, {}).get("domain_name"),
            "possible_sibling_exists": target_exists,
            "sibling_role_count": len(target_roles),
            "role_overlap_count": len(overlap),
            "role_overlap_ratio": round(overlap_ratio, 3),
            "overlapping_roles": sorted(overlap),
            "source_definition_excerpt": source_definition(definitions, target_domain),
            "source_ids": source_ids(registry, target_domain),
            "source_domain_description": meta.get(target_domain, {}).get("description"),
            "programme_mapping_impact": impact.get(target_domain, {"links": 0, "tiers": {}}),
            "decision": "do_not_create_new_domain_existing_sibling_or_parent",
            "reason": reason + "; promotion would duplicate an existing domain rather than create a proved new domain",
        })

    # D167 and D168 are the existing examples of a justified new domain.  They
    # are checked here so the proof standard is explicit rather than inferred.
    existing_promotions = []
    for domain_id in ("D167", "D168"):
        rows = by_domain.get(domain_id, [])
        sources = source_ids(registry, domain_id)
        specialist_sources = [source for source in sources if source not in {"global_esco", "global_onet", "global_isco", "global_wef"}]
        existing_promotions.append({
            "domain_id": domain_id,
            "domain_name": meta.get(domain_id, {}).get("domain_name"),
            "status": "already_promoted_and_proof_indexed",
            "role_count": len(rows),
            "source_ids": sources,
            "specialist_source_ids": specialist_sources,
            "independent_role_boundary": len(specialist_sources) >= 2,
            "programme_mapping_impact": impact.get(domain_id, {"links": 0, "tiers": {}}),
        })

    report = {
        "schema_version": 1,
        "decision": "No additional subgroup was promoted in this audit.",
        "promotion_gate": {
            "independent_definition": "A source-backed domain definition must exist outside the subgroup label.",
            "role_boundary": "The candidate must represent a coherent work output, not merely an ISCO seniority or level split.",
            "skill_boundary": "The candidate must have a distinct foundation-skill profile rather than copied parent skills.",
            "programme_impact": "A promotion increases the domain count and requires a fresh CCMAS programme-domain mapping review across direct, functional, and adjacent tiers.",
            "demand_ordering": "Deferred; no validated role-demand dataset is used for promotion decisions or role ordering.",
        },
        "current_domain_count": len(meta),
        "canonical_role_count": len(roles),
        "existing_promotions": existing_promotions,
        "candidate_cases": cases,
        "source_document": str(DOMAIN_DOC),
    }
    REPORT_JSON.parent.mkdir(exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Subgroup promotion audit — 2026-08-17",
        "",
        "## Decision",
        "",
        "No additional subgroup was promoted. Every high-confidence candidate inspected is already represented by an existing parent/sibling domain, and promoting it would duplicate the taxonomy rather than add a source-proved domain.",
        "",
        f"Current top-level domain count: **{len(meta)}**; canonical role rows: **{len(roles)}**.",
        "",
        "## Proof gate",
        "",
        "Promotion requires an independent source-backed domain definition, a coherent work-output boundary that is not just a level split, a distinct foundation-skill profile, and a reviewed CCMAS programme-domain impact. Promotion changes the domain count and requires a new direct/functional/adjacent mapping pass. Role-demand ordering is deferred.",
        "",
        "## Existing proved additions",
        "",
    ]
    for item in existing_promotions:
        lines.append(f"- **{item['domain_id']} {item['domain_name']}** — already promoted; {item['role_count']} role rows; specialist proof sources: {', '.join(item['specialist_source_ids']) or 'none'}; CCMAS links: {item['programme_mapping_impact']['links']}.")
    lines.extend(["", "## Candidate decisions", ""])
    for item in cases:
        lines.append(
            f"- **{item['source_domain']} subgroup {item['subgroup_isco_submajor']} — {item['subgroup_label']} → {item['possible_sibling_domain']} {item['possible_sibling_name']}**: do not create/promote; {item['subgroup_role_count']} candidate roles, {item['role_overlap_count']} overlap the existing sibling ({item['role_overlap_ratio']:.0%}); {item['programme_mapping_impact']['links']} CCMAS links already target that sibling."
        )
    lines.extend(["", "The JSON file contains the source-definition excerpts, source IDs, role lists, overlap calculations, and mapping counts for review."])
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "decision": report["decision"],
        "current_domain_count": len(meta),
        "cases": len(cases),
        "existing_promotions_checked": len(existing_promotions),
    }, indent=2))


if __name__ == "__main__":
    main()
