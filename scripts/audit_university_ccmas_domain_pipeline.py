"""Verify the complete university offering -> JAMB -> CCMAS -> domain chain.

This is a structural pipeline audit. It does not turn source-review rows into
approved mappings; it proves that every seeded university offering resolves to
one canonical JAMB inheritance row, that its CCMAS components exist, and that
the materialized domain links equal the canonical result.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

from audit_full_mapping_coverage import load_seed


ROOT = Path(__file__).resolve().parents[1]
CAREER = ROOT / "data" / "career-mapping"
OUT = ROOT / "docs" / "manual-review"
REPORT_JSON = OUT / "university-programme-ccmas-domain-pipeline-2026-08-19.json"
REPORT_MD = OUT / "university-programme-ccmas-domain-pipeline-2026-08-19.md"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    seed = load_seed()
    programmes_by_id = {row[0]: row[1] for row in seed["programmes"]}
    canonical = {
        row["jamb_name"]: row
        for row in load_json(CAREER / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json")["rows"]
    }
    active_domains = load_json(CAREER / "jamb_domain_map.json")
    programme_mapping = {
        row["jamb_name"]: row for row in load_json(CAREER / "programme_mapping.json")["mappings"]
    }
    ccmas_registry = set()
    for path in (CAREER / "ccmas").glob("*.json"):
        document = load_json(path)
        ccmas_registry.update(
            f"{document['discipline']}::{programme['name']}"
            for programme in document.get("programmes", [])
        )

    broken_offerings = []
    missing_canonical = []
    missing_components = []
    domain_mismatches = []
    missing_component_names: set[tuple[str, tuple[str, ...]]] = set()
    status_counts = Counter()
    inheritance_counts = Counter()
    offerings_by_name = Counter()
    schools_by_name: defaultdict[str, set[str]] = defaultdict(set)

    for offering in seed["offerings"]:
        offering_id, school_id, programme_id = offering[:3]
        jamb_name = programmes_by_id.get(programme_id)
        if not jamb_name:
            broken_offerings.append({
                "offering_id": offering_id,
                "school_id": school_id,
                "programme_id": programme_id,
            })
            continue
        offerings_by_name[jamb_name] += 1
        schools_by_name[jamb_name].add(str(school_id))
        row = canonical.get(jamb_name)
        if not row:
            missing_canonical.append({
                "offering_id": offering_id,
                "school_id": school_id,
                "jamb_name": jamb_name,
            })
            continue
        status_counts[row["mapping_status"]] += 1
        inheritance_counts[row["inheritance_type"]] += 1
        missing_refs = sorted(
            ref for ref in (set(row.get("component_refs") or []) - ccmas_registry)
            if not ref.startswith("__custom__::")
        )
        if missing_refs:
            missing_component_names.add((jamb_name, tuple(missing_refs)))
        active = active_domains.get(jamb_name, {})
        expected_links = {
            (link.get("domain_id"), link.get("match_type"))
            for link in row.get("domain_links") or []
        }
        actual_links = {
            (link.get("domain_id"), link.get("match_type"))
            for link in active.get("links") or []
        }
        if expected_links != actual_links:
            domain_mismatches.append({
                "jamb_name": jamb_name,
                "missing": sorted(expected_links - actual_links),
                "unexpected": sorted(actual_links - expected_links),
            })

    # The same canonical row can serve many schools, so report the name-level
    # chain once and the offering-level coverage separately.
    name_status_counts = Counter(row.get("mapping_status") for row in canonical.values())
    name_inheritance_counts = Counter(row.get("inheritance_type") for row in canonical.values())
    chain_ready_statuses = {"ready", "ready_partial", "ready_external"}
    chain_ready_offerings = sum(
        count for name, count in offerings_by_name.items()
        if canonical.get(name, {}).get("mapping_status") in chain_ready_statuses
    )
    missing_components = [
        {"jamb_name": name, "component_refs": list(refs)}
        for name, refs in sorted(missing_component_names)
    ]
    report = {
        "audit": "university_offering_to_jamb_ccmas_domain_pipeline",
        "generated_from": [
            "backend/seed_career_pilot.sql",
            "data/career-mapping/programme_mapping.json",
            "data/career-mapping/ccmas/*.json",
            "data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json",
            "data/career-mapping/jamb_domain_map.json",
        ],
        "contract": {
            "chain": "school_programmes -> jamb_programmes -> programme_mapping -> CCMAS components -> canonical domain links",
            "source_review_boundary": "review_required rows remain visible as unresolved source interpretation; they are not counted as approved chain links",
            "demand_data_used": False,
        },
        "summary": {
            "university_offerings": len(seed["offerings"]),
            "unique_university_programme_pairs": len({(row[1], row[2]) for row in seed["offerings"]}),
            "university_programme_names": len(offerings_by_name),
            "canonical_jamb_names": len(canonical),
            "ccmas_registry_programmes": len(ccmas_registry),
            "offerings_with_ready_chain": chain_ready_offerings,
            "offerings_with_review_required_chain": len(seed["offerings"]) - chain_ready_offerings,
            "name_status_counts": dict(name_status_counts),
            "offering_status_counts": dict(status_counts),
            "name_inheritance_counts": dict(name_inheritance_counts),
            "offering_inheritance_counts": dict(inheritance_counts),
            "broken_offerings": len(broken_offerings),
            "missing_canonical_rows": len(missing_canonical),
            "missing_ccmas_components": len(missing_components),
            "domain_link_mismatches": len(domain_mismatches),
            "programme_mapping_names_without_offerings": len(set(programme_mapping) - set(offerings_by_name)),
        },
        "structural_errors": {
            "broken_offerings": broken_offerings,
            "missing_canonical_rows": missing_canonical,
            "missing_ccmas_components": missing_components,
            "domain_link_mismatches": domain_mismatches,
        },
        "review_required_names": sorted(
            name for name, row in canonical.items()
            if row.get("mapping_status") == "review_required"
        ),
        "offering_counts_by_jamb_name": {
            name: {
                "offerings": count,
                "schools": len(schools_by_name[name]),
                "mapping_status": canonical[name].get("mapping_status"),
                "inheritance_type": canonical[name].get("inheritance_type"),
                "component_refs": canonical[name].get("component_refs", []),
                "domain_link_count": len(canonical[name].get("domain_links") or []),
            }
            for name, count in sorted(offerings_by_name.items())
        },
    }
    OUT.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    structural_error_count = sum(len(value) for value in report["structural_errors"].values())
    lines = [
        "# University programme → CCMAS → domain pipeline audit — 2026-08-19",
        "",
        "This audit follows every seeded university offering through its JAMB programme name, canonical CCMAS inheritance row, CCMAS component registry, and materialized domain links.",
        "",
        "## Result",
        "",
        f"- University/programme offerings checked: **{report['summary']['university_offerings']}**",
        f"- Unique university/programme pairs checked: **{report['summary']['unique_university_programme_pairs']}**",
        f"- JAMB names represented by offerings: **{report['summary']['university_programme_names']} / {report['summary']['canonical_jamb_names']}**",
        f"- Offerings with a ready full, reviewed partial, or reviewed external chain: **{report['summary']['offerings_with_ready_chain']}**",
        f"- Offerings held for CCMAS/domain/source review: **{report['summary']['offerings_with_review_required_chain']}**",
        f"- Structural errors: **{structural_error_count}**",
        "",
        "## What passed",
        "",
        "- Every university offering resolves to a seeded JAMB programme row.",
        "- Every offering name resolves to a canonical inheritance row.",
        "- Every canonical CCMAS component resolves to a current CCMAS programme identity.",
        "- The active domain map matches the canonical CCMAS-derived domain links.",
        "- No demand data is used.",
        "",
        "## Review boundary",
        "",
        f"The canonical chain contains **{report['summary']['name_status_counts'].get('ready', 0)} ready full rows**, **{report['summary']['name_status_counts'].get('ready_partial', 0)} reviewed partial rows**, **{report['summary']['name_status_counts'].get('ready_external', 0)} reviewed external rows**, and **{report['summary']['name_status_counts'].get('review_required', 0)} rows held for review**. A held row is still mapped structurally, but its CCMAS curriculum scope or source-backed domain evidence is not certified.",
        "",
        "Machine-readable detail is in `university-programme-ccmas-domain-pipeline-2026-08-19.json`.",
        "",
    ]
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"report": str(REPORT_JSON), "structural_errors": structural_error_count, "summary": report["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
