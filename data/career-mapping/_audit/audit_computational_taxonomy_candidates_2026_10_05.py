#!/usr/bin/env python3
"""Discover computational-method candidates across the full 168-domain catalogue.

This is a high-recall lexical inventory, not an automatic taxonomy decision.
Every hit is kept with its source field and text so later review can distinguish
core computational practice from occasional use of a digital tool.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
sys.path.insert(0, str(ROOT))
from _role_tools_loader import load_role_tools  # noqa: E402


PATTERNS = {
    "explicit_computational": r"\bcomputational\b|\bcomputing\b",
    "statistics_and_quantitative": r"\bstatistic(?:al|s)?\b|\bquantitative\b|\beconometric(?:s)?\b|\bbiometric(?:s|ian)?\b",
    "mathematical_modelling": r"\bmathematical?\s+model(?:ling|ing)?\b|\bmathematical\s+modelling\b|\bnumerical\s+(?:analysis|methods?|simulation)\b",
    "simulation_and_system_modelling": r"\bsimulation\b|\bsystem dynamics\b|\bdigital twin\b|\bagent[- ]based\s+(?:model(?:ling|ing)|simulation)\b",
    "algorithm_and_optimization": r"\balgorithm(?:ic|s)?\b|\boptimis(?:ation|e)\b|\boptimiz(?:ation|e)\b|\boperations research\b",
    "data_science_and_machine_learning": r"\bdata science\b|\bdata mining\b|\bmachine learning\b|\bdeep learning\b|\bartificial intelligence\b|\bneural network\b",
    "geospatial_and_remote_sensing": r"\bgeospatial\b|\bgeographic information system(?:s)?\b|\bgis\b|\bremote sensing\b|\bspatial analys(?:is|es)\b",
    "computational_biology_and_chemistry": r"\bbioinformatics\b|\bcomputational biology\b|\bcomputational chemistry\b|\bgenomic data analys(?:is|is)\b",
    "computational_social_methods": r"\bsocial network analys(?:is|es)\b|\bcomputational social science\b|\bdigital humanities\b|\btext as data\b|\bcorpus analys(?:is|es)\b|\bcausal inference\b",
    "programming_and_scientific_computing": r"\bprogramming\b|\bcoding\b|\bscientific computing\b|\bstatistical software\b|\bdata analytics\b",
}
COMPILED = {name: re.compile(pattern, re.I) for name, pattern in PATTERNS.items()}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    if isinstance(value, dict):
        return " ".join(f"{k} {norm(v)}" for k, v in value.items())
    if isinstance(value, list):
        return " ".join(norm(v) for v in value)
    return ""


def main() -> None:
    meta = read_json(ROOT / "domain_meta.json")
    structure = read_json(ROOT / "domain_structure.json")
    role_library = read_json(ROOT / "role_library_v3_cleaned.json")
    role_overlays = (read_json(ROOT / "emerging_role_overlays.json").get("roles") or [])
    layers = read_json(ROOT / "emerging_group_layers.json")
    manifest = read_json(ROOT / "computational_layer_manifest.json")
    method_evidence = read_json(ROOT / "computational_method_evidence.json")
    role_tools = load_role_tools()

    # Mirror the last-write-wins catalogue merge. Excluded mappings are kept out
    # of student-facing discovery but noted in aggregate for reproducibility.
    role_by_key = {}
    for role in role_library + role_overlays:
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        role_by_key[key] = role
    all_roles = [
        role for role in role_by_key.values()
        if str(role.get("student_path_status") or "active").casefold() != "excluded"
    ]
    roles_by_domain: dict[str, list] = {}
    for role in all_roles:
        roles_by_domain.setdefault(role.get("domain_id"), []).append(role)

    declared_groups = {
        (str(row.get("domain_id")), str(row.get("isco_submajor")))
        for row in manifest.get("groups") or []
    }
    inherited = {
        ("D001", "25"), ("D002", "25"), ("D003", "25"), ("D004", "12"),
        ("D004", "25"), ("D005", "25"), ("D005", "35"), ("D006", "21"),
        ("D006", "25"), ("D009", "21"), ("D010", "21"), ("D011", "21"),
        ("D012", "25"), ("D012", "33"), ("D014", "21"), ("D041", "21"),
        ("D056", "25"), ("D063", "26"), ("D078", "21"), ("D078", "26"),
        ("D140", "21"), ("D140", "31"), ("D141", "21"), ("D141", "24"),
        ("D141", "25"), ("D141", "31"), ("D142", "21"), ("D144", "21"),
        ("D145", "21"), ("D167", "21"), ("D167", "24"), ("D167", "25"),
        ("D167", "35"),
    }
    known_layers = declared_groups | inherited
    known_domains = {domain_id for domain_id, _ in known_layers}

    domain_rows = []
    candidate_counts = Counter()
    for domain_id, metadata in meta.items():
        hits = []

        def scan(source_type: str, source_key: str, value) -> None:
            text = norm(value)
            if not text:
                return
            categories = [name for name, regex in COMPILED.items() if regex.search(text)]
            if categories:
                hits.append({
                    "source_type": source_type,
                    "source_key": source_key,
                    "categories": categories,
                    "text": text[:1400],
                })
                candidate_counts.update(categories)

        scan("domain", "domain_name", metadata.get("domain_name"))
        scan("domain", "description", metadata.get("description"))

        domain_structure = structure.get(domain_id) or {}
        for subgroup in domain_structure.get("subgroups") or []:
            scan("subgroup", f"{subgroup.get('isco_submajor')}:{subgroup.get('label')}", {
                "label": subgroup.get("label"),
                "description": subgroup.get("description"),
                "skills": subgroup.get("cluster_skills"),
            })
        emerging = layers.get("domains") or {}
        if domain_id in emerging:
            scan("domain_layer", "emerging_group_layers.domains", {
                "skills": emerging[domain_id].get("skills"),
            })
        for subgroup in layers.get("subgroups") or []:
            if subgroup.get("domain_id") == domain_id:
                scan("emerging_subgroup", str(subgroup.get("isco_submajor")), {
                    "label": subgroup.get("label"),
                    "description": subgroup.get("description"),
                    "skills": subgroup.get("skills"),
                })

        for role in roles_by_domain.get(domain_id, []):
            role_name = role.get("role_name") or ""
            key = f"{domain_id}|{role_name}"
            scan("role_tasks", role_name, {
                "description": role.get("description"),
                "skills": role.get("essential_skills"),
                "tasks": role.get("tasks"),
            })
            evidence = role_tools.get(key) or {}
            esco = evidence.get("esco") or {}
            onet = evidence.get("onet") or {}
            scan("role_occupational_competencies", role_name, {
                "esco_essential_skills": esco.get("essential_skills"),
                "esco_optional_skills": esco.get("optional_skills"),
                "onet_essential_skills": onet.get("essential_skills"),
            })

        group_keys = sorted(group for group in known_layers if group[0] == domain_id)
        domain_rows.append({
            "domain_id": domain_id,
            "domain_name": metadata.get("domain_name"),
            "declared_computational_layer": domain_id in known_domains,
            "declared_method_groups": [group for _, group in group_keys],
            "active_role_count": len(roles_by_domain.get(domain_id, [])),
            "lexical_candidate": bool(hits),
            "candidate_categories": sorted({category for hit in hits for category in hit["categories"]}),
            "hit_count": len(hits),
            "hits": hits,
        })

    unrepresented = [row for row in domain_rows if row["lexical_candidate"] and not row["declared_computational_layer"]]
    report = {
        "schema_version": 1,
        "generated_by": "audit_computational_taxonomy_candidates_2026_10_05.py",
        "interpretation": "High-recall text discovery only. A hit is not proof that the domain is computational, that a new specialization is warranted, or that a role/link is correct. No rows are promoted or modified.",
        "pattern_categories": PATTERNS,
        "inputs": {
            "domain_count": len(meta),
            "active_merged_role_count": len(all_roles),
            "declared_method_evidence_rows": len(method_evidence.get("methods") or []),
            "manifest_group_count": len(manifest.get("groups") or []),
            "inherited_group_count": len(inherited),
        },
        "summary": {
            "catalogue_domains": len(domain_rows),
            "domains_with_lexical_hits": sum(row["lexical_candidate"] for row in domain_rows),
            "domains_with_declared_computational_layers": len(known_domains),
            "unrepresented_lexical_candidate_domains": len(unrepresented),
            "candidate_hits_total": sum(row["hit_count"] for row in domain_rows),
            "candidate_hits_by_category": dict(sorted(candidate_counts.items())),
        },
        "unrepresented_lexical_candidate_domains": [
            {key: value for key, value in row.items() if key != "hits"} | {"hits": row["hits"]}
            for row in unrepresented
        ],
        "domains": sorted(domain_rows, key=lambda row: row["domain_id"]),
    }
    json_path = AUDIT / "computational_taxonomy_candidates_2026_10_05.json"
    md_path = AUDIT / "COMPUTATIONAL_TAXONOMY_CANDIDATES_2026-10-05.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Catalogue-wide computational taxonomy candidate scan",
        "",
        "> This is a high-recall lexical discovery pass, not a decision that a hit defines a computational specialization. Each candidate must be checked against role tasks, domain scope and authoritative external sources. No canonical data is changed.",
        "",
        "## Counts",
        "",
        f"- Domains scanned: **{report['summary']['catalogue_domains']}**",
        f"- Domains with keyword/method hits: **{report['summary']['domains_with_lexical_hits']}**",
        f"- Domains already in the declared computational-layer set: **{report['summary']['domains_with_declared_computational_layers']}**",
        f"- Lexical candidate domains absent from that declared set: **{report['summary']['unrepresented_lexical_candidate_domains']}**",
        f"- Individual source-field hits: **{report['summary']['candidate_hits_total']}**",
        "",
        "## Unrepresented candidate domains (review queue)",
        "",
    ]
    for row in unrepresented:
        lines.append(f"### {row['domain_id']} — {row['domain_name']}")
        lines.append("")
        lines.append(f"Candidate signals: {', '.join(row['candidate_categories'])}; {row['hit_count']} source-field hits.")
        for hit in row["hits"][:12]:
            snippet = re.sub(r"\s+", " ", hit["text"])
            lines.append(f"- `{hit['source_type']}` `{hit['source_key']}` ({', '.join(hit['categories'])}): {snippet}")
        lines.append("")
    lines.extend(["## Category counts", ""])
    for key, count in report["summary"]["candidate_hits_by_category"].items():
        lines.append(f"- `{key}`: {count}")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
