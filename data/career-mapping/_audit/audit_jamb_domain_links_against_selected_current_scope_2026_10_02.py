"""Recompute JAMB-domain link candidates from the existing, reviewed course scope.

This deliberately does not invoke the keyword scope builder. It tests whether
each current JAMB course slice still supports its current links using the
refreshed CCMAS programme-domain evidence and the JAMB-scope evidence gates.
The output is an append-only candidate register; it does not edit canonical
mapping files.
"""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
CAREER = HERE.parent
ROOT = CAREER.parent
sys.path.insert(0, str(CAREER))
from _build_jamb_curriculum_scopes import (  # noqa: E402
    combine_component_domain_links,
    external_registry,
    norm,
    MANUAL_SCOPE_DOMAIN_LINKS,
    resolve_full_component_courses,
    source_registry,
    specific_anchor_families,
    supported_links,
    supported_external_links,
    anthropology_links,
)


SCOPE_PATH = HERE / "jamb_curriculum_scopes_2026-08-17.json"
INHERITANCE_PATH = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
PROGRAMME_DOMAINS_PATH = CAREER / "programme_domain_final.json"
DOMAIN_META_PATH = CAREER / "domain_meta.json"
ACTIVE_DOMAIN_MAP_PATH = CAREER / "jamb_domain_map.json"
EVIDENCE_PATH = HERE / "programme_domain_evidence_2026-10-02_dry_run.json"
OUT_JSON = HERE / f"jamb_domain_link_scope_recheck_{date.today().isoformat()}.json"
OUT_MD = HERE / f"jamb_domain_link_scope_recheck_{date.today().isoformat()}.md"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def key(link: dict[str, Any]) -> tuple[str, str]:
    return str(link.get("domain_id") or ""), str(link.get("match_type") or "")


def diagnose_link(link: dict[str, Any], groups: dict[str, list[dict[str, Any]]], evidence: dict[str, Any]) -> list[dict[str, Any]]:
    diagnostics = []
    tier = str(link.get("match_type") or "")
    for ref, courses in groups.items():
        record = evidence.get(f"{ref}::{link.get('domain_id')}")
        if not record:
            continue
        selected_ids = {
            norm(f"{course.get('code', '')}::{course.get('title', '')}")
            for course in courses if course.get("code") and course.get("title")
        }
        anchors = [
            anchor for anchor in (record.get("course_anchors") or [])
            if norm(str(anchor.get("course_identity") or "")) in selected_ids
        ]
        anchor_ids = {str(anchor.get("course_identity")) for anchor in anchors if anchor.get("course_identity")}
        repeated = {
            family: identities
            for family, identities in specific_anchor_families(anchors).items()
            if len(identities) >= 2
        }
        transferable = [
            item for item in (record.get("transferable_evidence") or [])
            if norm(str(item.get("course_identity") or "")) in selected_ids
        ]
        reasons = []
        if record.get("review_required"):
            reasons.append("parent_component_evidence_review_required")
        if not anchors:
            reasons.append("no_exact_selected_course_anchor")
        if tier in {"direct", "functional"}:
            if len(anchor_ids) < 2:
                reasons.append("fewer_than_two_distinct_selected_course_anchors")
            if not repeated:
                reasons.append("no_specific_anchor_family_repeated_across_courses")
        elif tier == "adjacent":
            if not transferable:
                reasons.append("no_selected_course_transferable_evidence")
            if not specific_anchor_families(anchors):
                reasons.append("no_specific_domain_anchor_cue")
        else:
            reasons.append("unknown_relationship_tier")
        diagnostics.append({
            "component_ref": ref,
            "course_anchor_count": len(anchor_ids),
            "specific_anchor_families": sorted(repeated),
            "transferable_evidence_count": len(transferable),
            "review_required": bool(record.get("review_required")),
            "failure_reasons": reasons,
        })
    if not diagnostics:
        return [{"failure_reasons": ["no_component_domain_evidence_record"]}]
    return diagnostics


def build() -> dict[str, Any]:
    scopes = {row["jamb_name"]: row for row in read(SCOPE_PATH)["rows"]}
    inheritance = {row["jamb_name"]: row for row in read(INHERITANCE_PATH)["rows"]}
    parent_links = read(PROGRAMME_DOMAINS_PATH)
    domain_meta = read(DOMAIN_META_PATH)
    evidence = read(EVIDENCE_PATH)
    programmes = source_registry()
    externals = external_registry()
    all_names = sorted(set(scopes) | set(inheritance), key=str.casefold)
    if len(all_names) != 420 or set(scopes) != set(inheritance):
        raise ValueError("Expected matching scope and inheritance rows for all 420 JAMB identities")

    rows: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    for name in all_names:
        scope = scopes[name]
        inherited = inheritance[name]
        scope_status = str(scope.get("scope_status") or "")
        inheritance_type = str(inherited.get("inheritance_type") or scope.get("inheritance_type") or "")
        current = list(scope.get("domain_links") or [])
        component_refs = list(scope.get("component_refs") or [])
        selected_courses = list(scope.get("selected_courses") or [])

        if "review_required" in scope_status and inheritance_type != "combined_ccmas_curriculum":
            counts["kept_held_scope"] += 1
            rows.append({"jamb_name": name, "status": "kept_held_scope", "reason": scope_status or inheritance_type, "current_links": current, "candidate_links": []})
            continue

        groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for course in selected_courses:
            ref = None
            source_file = course.get("source_ccmas_file")
            source_name = course.get("source_ccmas_programme")
            if source_file and source_name:
                package = next((item for item in component_refs if item.split("::", 1)[-1] == source_name), None)
                if package:
                    ref = package
            if ref:
                groups[ref].append(course)

        component_resolution = []
        if inheritance_type in {"single_ccmas_full_curriculum", "combined_ccmas_curriculum", "external_sources_required"}:
            groups.clear()
            for ref in component_refs:
                courses, resolution = resolve_full_component_courses(ref, programmes, externals)
                component_resolution.append(resolution)
                if courses:
                    groups[ref] = courses
            if component_resolution and any(item.get("status") != "resolved" for item in component_resolution):
                counts["declared_component_unresolved"] += 1
                rows.append({"jamb_name": name, "status": "declared_component_unresolved", "component_resolution": component_resolution, "current_links": current, "candidate_links": []})
                continue

        if not groups:
            counts["no_source_resolved_scope"] += 1
            rows.append({"jamb_name": name, "status": "no_source_resolved_scope", "current_links": current, "candidate_links": []})
            continue

        component_links = []
        if inheritance_type == "external_sources_required":
            # D_custom records are first-class curriculum sources too. Some
            # explicitly reuse CCMAS courses, while sport/anthropology use
            # separately cited curricula. Do not pass __custom__ refs through
            # the CCMAS evidence lookup (that silently drops their links).
            custom_entry = externals.get(name)
            if custom_entry is None:
                counts["external_source_record_missing"] += 1
                rows.append({"jamb_name": name, "status": "external_source_record_missing", "current_links": current, "candidate_links": []})
                continue
            _custom_file, custom = custom_entry
            external_components = []
            for ref, courses in groups.items():
                if ref.startswith("__custom__::"):
                    continue
                external_components.append((ref, supported_links(ref, courses, parent_links, evidence)))
            candidates = combine_component_domain_links(external_components)
            candidates.extend(supported_external_links(custom, parent_links, evidence, programmes))
            explicit = custom.get("external_domain_links") or []
            for link in explicit:
                if not link.get("domain_id") or not link.get("domain_name") or not link.get("source_url") or not link.get("evidence"):
                    counts["external_domain_link_missing_source_fields"] += 1
                    continue
                item = dict(link)
                canonical_domain = domain_meta.get(str(item["domain_id"])) or {}
                if canonical_domain.get("domain_name"):
                    item["domain_name"] = canonical_domain["domain_name"]
                item["source_kind"] = "external_curriculum"
                item["scope_anchor_gate"] = {
                    "relationship": item.get("match_type"),
                    "gate": "explicit_external_curriculum_url_and_evidence",
                }
                candidates.append(item)
            if name.casefold() == "anthropology":
                curriculum_urls = [
                    source.get("url") for source in custom.get("sources", [])
                    if source.get("url") and "journal" not in str(source.get("url")).casefold()
                ]
                for item in anthropology_links(custom):
                    canonical_domain = domain_meta.get(str(item["domain_id"])) or {}
                    if canonical_domain.get("domain_name"):
                        item["domain_name"] = canonical_domain["domain_name"]
                    item["source_kind"] = "external_curriculum"
                    item["source_url"] = curriculum_urls[0] if curriculum_urls else None
                    item["evidence"] = "The source-backed Anthropology curriculum contains the listed anthropology, society, culture and ethnographic course sequence."
                    item["scope_anchor_gate"] = {
                        "relationship": item.get("match_type"),
                        "gate": "external_curriculum_course_titles_and_source_url",
                    }
                    candidates.append(item)
            # An explicit external source record is the ceiling for a given
            # domain/tier; de-duplicate without conflating distinct tiers.
            deduped = {}
            for link in candidates:
                k = key(link)
                if k not in deduped or link.get("source_kind") == "external_curriculum":
                    deduped[k] = link
            candidates = list(deduped.values())
        else:
            for ref, courses in groups.items():
                candidates = supported_links(ref, courses, parent_links, evidence)
                component_links.append((ref, candidates))
            candidates = combine_component_domain_links(component_links)
        # An explicit programme-level source review is the semantic ceiling:
        # do not let generic course-keyword anchors add paths that the reviewed
        # override deliberately excluded (e.g. language options ≠ journalism,
        # media production or music-production requirements).
        if name in MANUAL_SCOPE_DOMAIN_LINKS:
            candidates = [dict(link) for link in MANUAL_SCOPE_DOMAIN_LINKS[name]]
        candidates = sorted(candidates, key=lambda link: (str(link.get("domain_id")), str(link.get("match_type"))))
        current_by_key = {key(link): link for link in current}
        candidate_by_key = {key(link): link for link in candidates}
        additions = [candidate_by_key[k] for k in sorted(candidate_by_key.keys() - current_by_key.keys())]
        removals = [
            {
                **current_by_key[k],
                "scope_gate_diagnostics": diagnose_link(current_by_key[k], groups, evidence),
            }
            for k in sorted(current_by_key.keys() - candidate_by_key.keys())
        ]
        for removal in removals:
            for diagnostic in removal.get("scope_gate_diagnostics", []):
                for reason in diagnostic.get("failure_reasons", []):
                    counts[f"removal_reason:{reason}"] += 1
        same = [candidate_by_key[k] for k in sorted(candidate_by_key.keys() & current_by_key.keys())]
        counts["source_resolved_scopes"] += 1
        counts["candidate_links"] += len(candidates)
        counts["current_links"] += len(current)
        counts["link_additions"] += len(additions)
        counts["link_removals"] += len(removals)
        counts["links_same_id_and_tier"] += len(same)
        counts["tier_or_anchor_conflicts"] += 0
        rows.append({
            "jamb_name": name,
            "status": "recomputed_from_existing_selected_courses",
            "inheritance_type": inheritance_type,
            "component_refs": component_refs,
            "selected_course_count": len(selected_courses),
            "current_link_count": len(current),
            "candidate_link_count": len(candidates),
            "additions": additions,
            "removals": removals,
            "same_domain_and_tier": same,
            "component_resolution": component_resolution,
        })

    active_domain_map = read(ACTIVE_DOMAIN_MAP_PATH)
    for row in rows:
        name = row["jamb_name"]
        active_links = list((active_domain_map.get(name) or {}).get("links") or [])
        candidate_links = list(row.get("same_domain_and_tier") or []) + list(row.get("additions") or [])
        active_by_key = {key(link): link for link in active_links}
        candidate_by_key = {key(link): link for link in candidate_links}
        active_additions = [candidate_by_key[k] for k in sorted(candidate_by_key.keys() - active_by_key.keys())]
        active_removals = [active_by_key[k] for k in sorted(active_by_key.keys() - candidate_by_key.keys())]
        row["active_map_link_count"] = len(active_links)
        row["active_map_additions"] = active_additions
        row["active_map_removals"] = active_removals
        counts["active_map_link_additions"] += len(active_additions)
        counts["active_map_link_removals"] += len(active_removals)
        counts["active_map_links_same_id_and_tier"] += len(active_by_key.keys() & candidate_by_key.keys())

    return {
        "schema": "2026-10-02.jamb-domain-selected-scope-recheck.v1",
        "generated_on": date.today().isoformat(),
        "status": "candidate_only_not_applied",
        "method": "Recompute from current selected course memberships (or the complete declared CCMAS package for single-component full-curriculum rows), using refreshed course-anchored evidence and the per-JAMB link gate. No keyword scope expansion is run.",
        "counts": dict(sorted(counts.items())),
        "rows": rows,
    }


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-json", type=Path, default=OUT_JSON)
    parser.add_argument("--out-md", type=Path, default=OUT_MD)
    args = parser.parse_args()
    report = build()
    args.out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = report["counts"]
    lines = [
        f"# JAMB domain links rechecked against existing selected scope — {report['generated_on']}",
        "",
        "Candidate-only deterministic recheck. It does not rerun broad keyword-based course selection or change canonical links.",
        "",
        "## Counts",
        "",
        *[f"- `{name}`: **{count}**" for name, count in c.items()],
        "",
        f"Full register: `{args.out_json.name}`.",
    ]
    args.out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(args.out_json), "markdown": str(args.out_md), "counts": c}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
