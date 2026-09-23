"""Audit CCMAS course/outcome coverage and its upstream JAMB inheritance.

This is an audit-only artifact. It does not promote scorer candidates into the
active map. It answers two separate questions:

1. Does a CCMAS programme's course outline and learning outcomes satisfy the
   current direct/functional/adjacent evidence gate for a domain?
2. Does each JAMB identity inherit only the CCMAS curriculum scope assigned to
   that identity, including faculty/track-specific and granular variants?

The second question is intentionally upstream: a correct CCMAS link is still
wrong for a JAMB name if the name inherits the wrong CCMAS discipline or an
unapproved full curriculum instead of a reviewed slice.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

import _audit_ccmas_jamb_inheritance as inheritance  # noqa: E402
import _build_programme_domain_evidence as evidence  # noqa: E402


SCORES = ROOT / "programme_domain_scores.json"
FINAL = ROOT / "programme_domain_final.json"
PROGRAMME_MAPPING = ROOT / "programme_mapping.json"
JAMB_MAP = ROOT / "jamb_domain_map.json"
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
INHERITANCE_AUDIT = ROOT / "_audit" / "ccmas_jamb_inheritance_audit_2026-08-17.json"
CANONICAL_INHERITANCE = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
REVIEWED_LINKS = ROOT / "_audit" / "ccmas_nigerian_reviewed_links_2026-09-01.json"
OFFERING_GLOB = ROOT / "jamb"
SOURCE_RULES = ROOT / "_audit" / "jamb_brochure_source_rules_2026-08-19.json"
JAMB_NAME_ALIASES = ROOT / "jamb_name_aliases.json"
SEED_SQL = ROOT.parent.parent / "backend" / "seed_career_pilot.sql"
REPORT_JSON = ROOT / "_audit" / "course_and_jamb_mapping_audit_2026-09-11.json"
REPORT_MD = ROOT / "_audit" / "course_and_jamb_mapping_audit_2026-09-11.md"

GENERIC_ANCHORS = {
    "analysis", "apply", "computer", "computing", "data", "development",
    "economics", "finance", "information", "management", "market",
    "mathematics", "method", "methods", "policy", "research", "science",
    "scientific", "statistics", "technology", "theory", "work",
}

SOCIOLOGY_TARGETS = {
    "Data Science": "top-level domain; exposes data analyst/statistician roles",
    "Quantitative Finance": "top-level domain; finance-specific quantitative curriculum required",
    "Human Resources": "top-level domain; people/talent/HR curriculum required",
    "Marketing, Brand": "top-level domain; marketing/brand/consumer curriculum required",
    "Product Management": "top-level domain; product strategy/requirements/delivery curriculum required",
    "Supply Chain Management": "top-level domain; logistics/procurement/operations curriculum required",
}

# These terms occur in entrepreneurship, engineering, computing, marketing and
# many other CCMAS curricula. They are not, by themselves, evidence of the
# Product Management domain. D033 needs an explicit product-management
# concept; otherwise a word such as ``product`` also matches ``production`` and
# turns generic innovation coursework into a false domain connection.
D033_GENERIC_OVERLAP = {
    "product",
    "production",
    "venture",
    "innovation",
    "e-commerce",
    "value proposition",
    "business model",
    "project management",
    "strategic planning",
}

D033_SPECIFIC_ANCHORS = {
    "product management",
    "product strategy",
    "product roadmap",
    "product lifecycle",
    "product life cycle",
    "product requirements",
    "product requirement",
    "product owner",
    "product manager",
    "product portfolio",
    "release planning",
    "requirements engineering",
    "user research",
    "customer discovery",
    "user requirements",
    "market requirements",
    "prioritise product",
    "prioritize product",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def load_programmes() -> dict[str, dict]:
    output = {}
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = load(path)
        for programme in document.get("programmes") or []:
            key = f"{document['discipline']}::{programme['name']}"
            output[key] = programme
    return output


def anchors_for(domain_id: str, meta: dict, structure: dict) -> list[str]:
    domain = meta.get(domain_id) or {}
    domain_structure = structure.get(domain_id) or {}
    values = list(evidence.EXTRA_ANCHORS.get(domain_id) or [])
    values.extend([
        domain.get("domain_name", ""),
        *[item.get("skill", "") for item in (domain_structure.get("foundation_skills") or [])[:20]],
    ])
    return sorted(
        {
            evidence.as_text(item).lower().strip()
            for item in values
            if evidence.as_text(item) and len(evidence.as_text(item)) > 2
        },
        key=lambda item: (-len(item), item),
    )


def course_evidence(programme: dict, domain_id: str, meta: dict, structure: dict) -> dict:
    anchors = anchors_for(domain_id, meta, structure)
    matched_courses = []
    source_flagged = []
    for course in programme.get("courses") or []:
        title = evidence.as_text(course.get("title", ""))
        mapping_title = evidence.as_text(course.get("mapping_title", ""))
        outcome_text = " ".join(evidence.as_text(item) for item in course.get("skills_learned") or [])
        content = evidence.as_text(course.get("content_summary", ""))
        haystack = " ".join([title, mapping_title, content, outcome_text]).lower()
        matched = sorted({anchor for anchor in anchors if anchor in haystack})
        if not matched:
            continue
        row = {
            "code": course.get("code"),
            "title": title,
            "matched_anchors": matched[:16],
            "outcome_count": len(course.get("skills_learned") or []),
            "has_content_summary": bool(content),
        }
        if evidence.course_source_review_required(
            programme.get("discipline", ""), programme.get("name", ""), course
        ):
            row["source_state"] = course.get("source_state")
            row["source_flags"] = list(course.get("flags") or [])
            source_flagged.append(row)
        matched_courses.append(row)

    distinct = sorted({anchor for row in matched_courses for anchor in row["matched_anchors"]})
    non_generic = [anchor for anchor in distinct if anchor not in GENERIC_ANCHORS]
    if domain_id == "D033":
        # Product Management is especially vulnerable to substring and
        # entrepreneurship overlap. Only explicit product-management concepts
        # count as domain-specific evidence for this domain.
        non_generic = [
            anchor for anchor in distinct
            if anchor in D033_SPECIFIC_ANCHORS
            and anchor not in D033_GENERIC_OVERLAP
        ]
    transferable = evidence.transferable_evidence(programme)
    return {
        "matched_course_count": len(matched_courses),
        "distinct_anchor_count": len(distinct),
        "domain_specific_anchor_count": len(non_generic),
        "distinct_anchors": distinct[:40],
        "matched_courses": matched_courses[:20],
        "source_flagged_course_count": len(source_flagged),
        "transferable_evidence_count": len(transferable),
        "transferable_evidence": transferable[:12],
    }


def gate(match_type: str, course: dict, programme_source_review: bool) -> tuple[str, str]:
    if programme_source_review or course["source_flagged_course_count"]:
        return "hold_source_review", "programme or matched course has an unresolved source state"
    if match_type in {"direct", "functional"}:
        if course["matched_course_count"] >= 2:
            if course["domain_specific_anchor_count"] >= 1:
                return "passes_course_outcome_gate", "at least two course/outcome anchors including a domain-specific anchor"
            return "passes_count_but_needs_semantic_review", "two courses matched only generic anchors"
        return "fails_course_outcome_gate", "direct/functional requires at least two course/outcome anchors"
    if course["matched_course_count"] >= 1 and course["transferable_evidence_count"] >= 1:
        if course["domain_specific_anchor_count"] >= 1:
            return "passes_adjacent_gate", "one course/outcome anchor plus transferable evidence and a domain-specific anchor"
        return "passes_count_but_needs_semantic_review", "adjacent evidence relies on generic anchors"
    return "fails_adjacent_gate", "adjacent requires one course/outcome anchor plus transferable evidence"


def downstream_paths(domain_id: str, meta: dict, structure: dict, roles: list[dict]) -> dict:
    domain = meta.get(domain_id) or {}
    subgroups = structure.get(domain_id, {}).get("subgroups") or []
    role_rows = [
        {
            "role": row.get("role_name"),
            "isco_group": row.get("isco_group"),
            "subgroup": next(
                (item.get("label") for item in subgroups if str(item.get("isco_submajor")) == str(row.get("isco_group", ""))[:2]),
                None,
            ),
        }
        for row in roles
        if str(row.get("domain_id")) == domain_id
    ]
    return {
        "domain_name": domain.get("domain_name"),
        "subgroups": [
            {"isco_submajor": item.get("isco_submajor"), "label": item.get("label"), "description": item.get("description")}
            for item in subgroups
        ],
        "matching_roles": [item for item in role_rows if item.get("role") in {"data analyst", "statistician", "sociologist", "quantitative analyst"}],
    }


def upstream_audit(mapping_rows: list[dict], jamb_map: dict) -> dict:
    by_norm = defaultdict(list)
    for row in mapping_rows:
        by_norm[norm(row.get("jamb_name"))].append(row)
    collisions = []
    for key, rows in sorted(by_norm.items()):
        identities = sorted({
            (row.get("jamb_name"), row.get("jamb_faculty"), row.get("ccmas_discipline"), row.get("ccmas_name"), row.get("ccmas_code"))
            for row in rows
        })
        if len(identities) > 1:
            collisions.append({"normalized_name": key, "identities": identities})

    rows = []
    for row in mapping_rows:
        name = row.get("jamb_name")
        current = jamb_map.get(name) or {}
        rows.append({
            "jamb_name": name,
            "jamb_faculty": row.get("jamb_faculty"),
            "mapping_type": row.get("mapping_type"),
            "ccmas_component": "::".join(filter(None, [row.get("ccmas_discipline"), row.get("ccmas_name") or row.get("ccmas_code")])),
            "mapping_note": row.get("mapping_note"),
            "active_domain_status": current.get("mapping_status"),
            "active_inheritance_type": current.get("inheritance_type"),
            "active_component_refs": current.get("ccmas_components") or [],
            "has_identity_collision": len(by_norm[norm(name)]) > 1,
        })
    return {
        "mapping_rows": len(mapping_rows),
        "normalized_identity_collisions": len(collisions),
        "collisions": collisions,
        "rows": rows,
    }


def offering_source_audit(
    mapping_rows: list[dict],
    jamb_map: dict,
    canonical_rows: list[dict],
) -> dict:
    """Audit and resolve brochure offering contexts before treating a JAMB name as one identity.

    The brochure can repeat a display name in different faculty blocks.  That
    does not automatically mean there are two programmes, but it does mean the
    institution set and requirement text must not be silently discarded.  A
    title/case/faculty collision such as LIS is therefore retained as an
    upstream review row even when both contexts resolve to the same CCMAS
    component.  Once the source variants are present, the context is resolved
    structurally: one display identity may own several institutions, while
    different exact JAMB identities retain separate downstream maps.
    """
    mapping_by_name = {row.get("jamb_name"): row for row in mapping_rows}
    canonical_by_name = {row.get("jamb_name"): row for row in canonical_rows}
    source_rules = load(SOURCE_RULES) if SOURCE_RULES.exists() else {"rows": []}
    source_by_name: dict[str, list[dict]] = defaultdict(list)
    for source_row in source_rules.get("rows") or []:
        source_by_name[source_row.get("jamb_name")].append(source_row)
    aliases = load(JAMB_NAME_ALIASES) if JAMB_NAME_ALIASES.exists() else {}
    grouped: dict[str, list[dict]] = defaultdict(list)
    exact_groups: dict[str, list[dict]] = defaultdict(list)
    missing_mapping_names = []
    offering_rows = 0
    for path in sorted(OFFERING_GLOB.glob("*_offerings.json")):
        document = load(path)
        source_faculty = document.get("faculty")
        for programme in document.get("programmes") or []:
            name = programme.get("jamb_name")
            if not name:
                continue
            offering_rows += 1
            institutions = sorted(set(programme.get("institutions") or []))
            row = {
                "jamb_name": name,
                "source_faculty": source_faculty,
                "source_file": path.name,
                "institution_count": len(institutions),
                "institutions": institutions,
                "utme_subjects": programme.get("utme_subjects"),
                "olevel_requirement": programme.get("olevel_requirement"),
                "direct_entry": programme.get("direct_entry"),
                "institution_waiver_count": len(programme.get("institution_waivers") or []),
            }
            key = norm(name)
            grouped[key].append(row)
            exact_groups[name].append(row)
            if name not in mapping_by_name:
                missing_mapping_names.append({"jamb_name": name, "source_file": path.name})

    collisions = []
    for normalized_name, rows in sorted(grouped.items()):
        exact_names = sorted({row["jamb_name"] for row in rows})
        faculties = sorted({row["source_faculty"] for row in rows if row.get("source_faculty")})
        files = sorted({row["source_file"] for row in rows})
        mapping_identities = sorted({
            tuple(
                item.get(field)
                for field in ("jamb_name", "jamb_faculty", "mapping_type", "ccmas_discipline", "ccmas_name", "ccmas_code")
            )
            for name in exact_names
            for item in ([mapping_by_name[name]] if name in mapping_by_name else [])
        })
        component_refs = sorted({
            ref
            for name in exact_names
            for ref in (canonical_by_name.get(name, {}).get("component_refs") or [])
        })
        requirement_fingerprints = sorted({
            json.dumps(
                [row.get("utme_subjects"), row.get("olevel_requirement"), row.get("direct_entry")],
                ensure_ascii=False,
                sort_keys=True,
            )
            for row in rows
        })
        same_exact_name_multi_faculty = any(
            len({row["source_faculty"] for row in exact_groups[name] if row.get("source_faculty")}) > 1
            for name in exact_names
        )
        identity_collision = len(mapping_identities) > 1 or len(component_refs) > 1
        same_component = len(component_refs) == 1
        # Only collision groups belong in this section. A single ordinary
        # offering with no source candidate is still captured by the global
        # requirement-review inventory below, but it is not a repeated-name
        # context collision.
        if not identity_collision and not same_exact_name_multi_faculty and len(exact_names) <= 1:
            continue
        source_coverage = {}
        for exact_name in exact_names:
            source_rows = source_by_name.get(exact_name, [])
            source_coverage[exact_name] = {
                "review_layers": len(source_rows),
                "source_variant_count": sum(int(row.get("source_variant_count") or 0) for row in source_rows),
                "resolution_counts": dict(Counter(row.get("resolution") for row in source_rows)),
                "catalogue_state_counts": dict(Counter(row.get("catalogue_state") for row in source_rows)),
                "no_source_candidate_layers": [
                    row.get("layer") for row in source_rows
                    if row.get("resolution") == "no_source_candidate"
                ],
                "source_blank_variant_count": sum(
                    1
                    for row in source_rows
                    for variant in row.get("source_variants") or []
                    if (variant.get("source_variant") or {}).get("status") == "source_blank"
                ),
            }
        no_source_layers = sorted({
            layer
            for coverage in source_coverage.values()
            for layer in coverage["no_source_candidate_layers"]
        })
        source_variant_count = sum(item["source_variant_count"] for item in source_coverage.values())
        alias_resolved = len(exact_names) > 1 and same_component and any(
            aliases.get(name) in exact_names for name in exact_names
        )
        if no_source_layers:
            status = "needs_manual_source_review"
            resolution_reason = (
                "The offering identity is mapped, but the brochure source-rule audit has "
                f"no source candidate for: {', '.join(no_source_layers)}."
            )
        elif len(exact_names) > 1 and same_component:
            status = "resolved_same_ccmas_identity_context"
            resolution_reason = (
                "Exact/case variants resolve to one CCMAS component; institution and "
                "requirement variants are retained."
                + (" The declared name alias is applied." if alias_resolved else "")
            )
        elif len(exact_names) > 1 and not same_component:
            status = "resolved_as_separate_exact_jamb_identities"
            resolution_reason = (
                "Normalized names are not merged because their exact JAMB names resolve "
                "to different CCMAS identities/tracks; each keeps its own downstream map."
            )
        elif len(component_refs) > 1:
            status = "resolved_combined_ccmas_components"
            resolution_reason = (
                "The exact JAMB name intentionally inherits multiple CCMAS components; "
                "the combined curriculum scope is retained."
            )
        elif same_exact_name_multi_faculty:
            status = "resolved_same_ccmas_identity_context"
            resolution_reason = (
                "The same exact JAMB name appears in multiple brochure faculty blocks, "
                "but resolves to one CCMAS component; source variants are retained."
            )
        else:
            continue
        collisions.append({
            "normalized_name": normalized_name,
            "exact_names": exact_names,
            "source_faculties": faculties,
            "source_files": files,
            "mapping_identities": mapping_identities,
            "resolved_ccmas_component_refs": component_refs,
            "distinct_requirement_variants": len(requirement_fingerprints),
            "institution_count_total": len({institution for row in rows for institution in row["institutions"]}),
            "status": status,
            "resolution_reason": resolution_reason,
            "source_variant_count": source_variant_count,
            "source_coverage": source_coverage,
            "rows": rows,
        })

    canonical_component_mismatches = []
    status_upgrade_rows = []
    reviewed_map_mismatches = []
    current_names = set(jamb_map)
    canonical_names = set(canonical_by_name)
    for name in sorted(canonical_names | current_names):
        canonical = canonical_by_name.get(name) or {}
        current = jamb_map.get(name) or {}
        expected_components = sorted(canonical.get("component_refs") or [])
        current_components = sorted(current.get("ccmas_components") or [])
        if expected_components != current_components:
            canonical_component_mismatches.append({
                "jamb_name": name,
                "expected_component_refs": expected_components,
                "stored_component_refs": current_components,
            })
        if canonical.get("mapping_status") == "review_required" and current.get("mapping_status") in {"ready", "ready_reviewed", "ready_partial", "ready_external"}:
            status_upgrade_rows.append({
                "jamb_name": name,
                "canonical_status_before_review_overlay": canonical.get("mapping_status"),
                "current_status": current.get("mapping_status"),
                "current_link_count": len(current.get("links") or []),
            })

    reviewed_document = load(REVIEWED_LINKS) if REVIEWED_LINKS.exists() else {"rows": []}
    reviewed_rows = {row.get("jamb_name"): row for row in reviewed_document.get("rows") or []}
    for name, row in reviewed_rows.items():
        expected = sorted({
            (link.get("domain_id"), link.get("reviewed_match_type"))
            for link in row.get("links") or []
            if link.get("publish_in_reviewed_map")
        })
        stored = sorted({
            (link.get("domain_id"), link.get("match_type"))
            for link in (jamb_map.get(name, {}).get("links") or [])
        })
        if expected != stored:
            reviewed_map_mismatches.append({
                "jamb_name": name,
                "expected_reviewed_links": expected,
                "stored_links": stored,
            })

    return {
        "contract": "A JAMB identity is not considered safe merely because its display name appears in a brochure. Every identity must resolve to the intended CCMAS component(s), and repeated name/faculty contexts must retain their institution and requirement scope.",
        "offering_source_files": len(list(OFFERING_GLOB.glob("*_offerings.json"))),
        "offering_rows_checked": offering_rows,
        "unique_normalized_names": len(grouped),
        "normalized_offering_collisions": len(collisions),
        "resolved_context_counts": dict(Counter(row["status"] for row in collisions)),
        "unresolved_contexts": [
            {
                "normalized_name": row["normalized_name"],
                "exact_names": row["exact_names"],
                "missing_source_layers": sorted({
                    layer
                    for coverage in row["source_coverage"].values()
                    for layer in coverage["no_source_candidate_layers"]
                }),
            }
            for row in collisions
            if row["status"] == "needs_manual_source_review"
        ],
        "collisions": collisions,
        "offering_names_missing_from_programme_mapping": sorted(
            missing_mapping_names,
            key=lambda item: (item.get("jamb_name", ""), item.get("source_file", "")),
        ),
        "canonical_names_missing_from_active_jamb_map": sorted(canonical_names - current_names),
        "active_jamb_names_missing_from_canonical_artifact": sorted(current_names - canonical_names),
        "canonical_component_mismatches": canonical_component_mismatches,
        "canonical_review_rows_upgraded_by_current_reviewed_map": status_upgrade_rows,
        "reviewed_link_materialization": {
            "reviewed_rows": len(reviewed_rows),
            "active_ready_reviewed_rows": sum(1 for row in jamb_map.values() if row.get("mapping_status") == "ready_reviewed"),
            "reviewed_map_mismatches": reviewed_map_mismatches,
        },
        "identity_counts": {
            "programme_mapping_rows": len(mapping_rows),
            "canonical_rows": len(canonical_rows),
            "active_jamb_map_rows": len(jamb_map),
        },
    }


def data_review_inventory(candidate_rows: list[dict], offering_context: dict) -> dict:
    """Return every remaining data-review category, with row-level evidence."""
    source_rules = load(SOURCE_RULES) if SOURCE_RULES.exists() else {"rows": []}
    source_rows = source_rules.get("rows") or []
    by_layer = {}
    for layer in ("utme", "olevel", "direct_entry"):
        rows = [row for row in source_rows if row.get("layer") == layer]
        by_layer[layer] = {
            "review_layers": len(rows),
            "catalogue_state_counts": dict(Counter(row.get("catalogue_state") for row in rows)),
            "resolution_counts": dict(Counter(row.get("resolution") for row in rows)),
            "needs_review_rows": [
                {
                    "jamb_name": row.get("jamb_name"),
                    "catalogue_text": row.get("catalogue_text"),
                    "source_status_before_inheritance": row.get("source_status_before_inheritance"),
                    "resolution": row.get("resolution"),
                }
                for row in rows
                if row.get("catalogue_state") == "needs_review"
            ],
            "no_source_candidate_rows": [
                {
                    "jamb_name": row.get("jamb_name"),
                    "catalogue_text": row.get("catalogue_text"),
                    "source_status_before_inheritance": row.get("source_status_before_inheritance"),
                }
                for row in rows
                if row.get("resolution") == "no_source_candidate"
            ],
        }
    source_blank_variants = [
        {
            "jamb_name": row.get("jamb_name"),
            "layer": row.get("layer"),
            "source": (variant.get("source_variant") or {}).get("source"),
        }
        for row in source_rows
        for variant in row.get("source_variants") or []
        if (variant.get("source_variant") or {}).get("status") == "source_blank"
    ]
    seed_inventory = {}
    if SEED_SQL.exists():
        seed_text = SEED_SQL.read_text(encoding="utf-8")
        exception_start = seed_text.find("-- school_programme_requirement_exceptions:")
        option_start = seed_text.find("-- school_programme_subject_options:", exception_start)
        exception_block = seed_text[exception_start:option_start] if exception_start >= 0 and option_start > exception_start else ""
        status_counts = Counter(re.findall(
            r"', '(parsed|needs_review|not_subject_rule)'\),?$",
            exception_block,
            flags=re.MULTILINE,
        ))
        option_match = re.search(r"-- school_programme_subject_options: (\d+) rows", seed_text)
        offering_match = re.search(r"-- school_programmes: (\d+) rows", seed_text)
        source_match = re.search(r"-- jamb_programme_requirement_sources: (\d+) rows", seed_text)
        seed_inventory = {
            "school_programmes_rows": int(offering_match.group(1)) if offering_match else None,
            "school_programme_requirement_columns_emitted": bool(re.search(
                r"INSERT INTO school_programmes \(id, school_id, jamb_programme_id, utme_subjects, olevel_requirement, direct_entry, remarks\)",
                seed_text,
            )),
            "source_variant_rows": int(source_match.group(1)) if source_match else None,
            "structured_university_subject_options": int(option_match.group(1)) if option_match else None,
            "university_exception_status_counts": dict(status_counts),
        }
    return {
        "source_rule_layers": len(source_rows),
        "source_rule_variants": int(source_rules.get("counts", {}).get("source_variants") or 0),
        "by_layer": by_layer,
        "source_blank_variants": source_blank_variants,
        "generated_seed": seed_inventory,
        "offering_contexts": {
            "total": offering_context.get("normalized_offering_collisions", 0),
            "resolved": offering_context.get("resolved_context_counts", {}),
            "still_needing_manual_source_review": offering_context.get("unresolved_contexts", []),
        },
        "domain_mapping_review": {
            "active_links_failing_numeric_gate": sum(
                1 for row in candidate_rows
                if row["current_mapping"] and row["gate_status"] in {"fails_course_outcome_gate", "fails_adjacent_gate"}
            ),
            "active_links_needing_semantic_review": sum(
                1 for row in candidate_rows
                if row["current_mapping"] and row["gate_status"] == "passes_count_but_needs_semantic_review"
            ),
            "unverified_links": sum(1 for row in candidate_rows if row["unverified_mapping"]),
            "omitted_candidates_requiring_review": sum(
                1 for row in candidate_rows if row["disposition"] == "omitted_candidate_review"
            ),
        },
        "interpretation": {
            "catalogue_state_needs_review": "Requirement text exists but its subject structure still needs source/manual confirmation.",
            "empty_catalogue_state": "No catalogue rule was available for that layer; do not invent a subject rule.",
            "no_source_candidate": "The parsed requirement may exist, but no matching brochure source row was found; keep it source-review-only.",
            "source_blank_variant": "A brochure context was found but its relevant cell was blank; do not use it as an eligibility rule.",
            "domain_mapping_review": "These are separate from JAMB requirements: they concern CCMAS course/outcome evidence for domain links.",
        },
    }


def main() -> None:
    programmes = load_programmes()
    scored = load(SCORES)
    final = load(FINAL)
    meta = load(DOMAIN_META)
    structure = load(DOMAIN_STRUCTURE)
    roles_document = load(ROLE_LIBRARY)
    roles = roles_document if isinstance(roles_document, list) else list(roles_document.values())
    mapping_rows = load(PROGRAMME_MAPPING).get("mappings") or []
    jamb_map = load(JAMB_MAP)
    canonical_document = load(CANONICAL_INHERITANCE)
    canonical_rows = canonical_document.get("rows") or []

    candidate_rows = []
    summary = Counter()
    omitted_by_domain = Counter()
    all_programme_keys = sorted(set(programmes) | set(scored) | set(final))
    for programme_key in all_programme_keys:
        score_row = scored.get(programme_key) or {}
        programme = programmes.get(programme_key)
        if not programme:
            continue
        programme["discipline"] = programme_key.split("::", 1)[0]
        active_links = {
            link.get("domain_id"): link
            for link in (final.get(programme_key, {}).get("links") or [])
            if link.get("domain_id")
        }
        unverified_links = {
            link.get("domain_id"): link
            for link in (final.get(programme_key, {}).get("unverified_links") or [])
            if link.get("domain_id")
        }
        candidate_by_domain = {}
        for candidate in score_row.get("links") or []:
            if candidate.get("domain_id"):
                candidate_by_domain[candidate["domain_id"]] = {
                    **candidate,
                    "candidate_origin": "scored_candidate",
                }
        for domain_id, link in active_links.items():
            candidate_by_domain.setdefault(domain_id, {
                **link,
                "candidate_origin": "active_mapping_only",
            })
        for domain_id, link in unverified_links.items():
            candidate_by_domain.setdefault(domain_id, {
                **link,
                "candidate_origin": "unverified_mapping_only",
            })
        programme_source_review = evidence.programme_source_review_required(
            programme.get("discipline", ""), programme.get("name", ""), programme
        )
        for candidate in candidate_by_domain.values():
            domain_id = candidate.get("domain_id")
            course = course_evidence(programme, domain_id, meta, structure)
            gate_status, gate_reason = gate(candidate.get("match_type"), course, programme_source_review)
            is_current = domain_id in active_links
            is_unverified = domain_id in unverified_links
            disposition = "active_mapping" if is_current else (
                "unverified_mapping" if is_unverified else (
                    "omitted_candidate_review" if gate_status in {"passes_course_outcome_gate", "passes_adjacent_gate", "passes_count_but_needs_semantic_review"} else "omitted_candidate_not_gate_ready"
                )
            )
            summary[("active" if is_current else ("unverified" if is_unverified else "omitted"), gate_status)] += 1
            if not is_current and not is_unverified:
                omitted_by_domain[domain_id] += 1
            candidate_rows.append({
                "programme_key": programme_key,
                "programme": programme.get("name"),
                "discipline": programme.get("discipline"),
                "domain_id": domain_id,
                "domain_name": candidate.get("domain_name"),
                "scorer_match_type": candidate.get("match_type"),
                "score": candidate.get("score"),
                "current_mapping": is_current,
                "unverified_mapping": is_unverified,
                "candidate_origin": candidate.get("candidate_origin"),
                "disposition": disposition,
                "gate_status": gate_status,
                "gate_reason": gate_reason,
                "course_evidence": course,
            })

    sociology = [
        row for row in candidate_rows
        if row["programme_key"] == "Social Sciences::Sociology"
        and row["domain_name"] in set(SOCIOLOGY_TARGETS) | {"Social Sciences"}
    ]
    sociology_current_ids = {row["domain_id"] for row in sociology if row["current_mapping"]}
    sociology_target_review = []
    for domain_name, reason in SOCIOLOGY_TARGETS.items():
        matches = [row for row in sociology if row["domain_name"] == domain_name]
        sociology_target_review.append({
            "domain_name": domain_name,
            "reason": reason,
            "scored_candidate": bool(matches),
            "current_mapping": bool(matches and matches[0]["current_mapping"]),
            "candidate": matches[0] if matches else None,
        })

    offering_context = offering_source_audit(mapping_rows, jamb_map, canonical_rows)
    review_inventory = data_review_inventory(candidate_rows, offering_context)
    report = {
        "schema_version": 1,
        "contract": {
            "direct_functional": "at least two course/outcome anchors; semantic domain fit still required",
            "adjacent": "at least one course/outcome anchor plus transferable evidence; generic overlap is not sufficient",
            "upstream": "JAMB names inherit only their resolved CCMAS component(s) and reviewed partial/combined scope",
            "university_specific_variants": "same-looking names are retained as separate identities when faculty, discipline, or CCMAS component differs",
        },
        "summary": {
            "ccmas_programmes_checked": len(programmes),
            "candidate_rows_checked": len(candidate_rows),
            "scored_candidate_rows_checked": sum(1 for row in candidate_rows if row["candidate_origin"] == "scored_candidate"),
            "active_mapping_rows_checked": sum(1 for row in candidate_rows if row["current_mapping"]),
            "unverified_mapping_rows_checked": sum(1 for row in candidate_rows if row["unverified_mapping"]),
            "omitted_candidates": sum(1 for row in candidate_rows if not row["current_mapping"] and not row["unverified_mapping"]),
            "omitted_candidates_requiring_review": sum(1 for row in candidate_rows if row["disposition"] == "omitted_candidate_review"),
            "omitted_candidates_not_gate_ready": sum(1 for row in candidate_rows if row["disposition"] == "omitted_candidate_not_gate_ready"),
            "active_links_failing_numeric_gate": sum(
                1 for row in candidate_rows
                if row["current_mapping"] and row["gate_status"] in {"fails_course_outcome_gate", "fails_adjacent_gate"}
            ),
            "active_links_needing_semantic_review": sum(
                1 for row in candidate_rows
                if row["current_mapping"] and row["gate_status"] == "passes_count_but_needs_semantic_review"
            ),
            "gate_summary": {f"{scope}:{status}": count for (scope, status), count in summary.items()},
            "omitted_by_domain": dict(omitted_by_domain),
        },
        "sociology": {
            "current_domain_candidates": sociology,
            "requested_target_review": sociology_target_review,
            "downstream_paths": {
                "D078": downstream_paths("D078", meta, structure, roles),
                "D009": downstream_paths("D009", meta, structure, roles),
                "D011": downstream_paths("D011", meta, structure, roles),
            },
        },
        "upstream_jamb_to_ccmas": upstream_audit(mapping_rows, jamb_map),
        "offering_source_context": offering_context,
        "data_review_inventory": review_inventory,
        "candidate_rows": candidate_rows,
    }
    REPORT_JSON.parent.mkdir(exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")

    review_rows = [row for row in candidate_rows if row["disposition"] == "omitted_candidate_review"]
    review_rows.sort(key=lambda row: (-(row.get("score") or 0), row["programme_key"], row["domain_name"] or ""))
    collisions = report["upstream_jamb_to_ccmas"]["collisions"]
    lines = [
        "# Course and JAMB mapping audit — 2026-09-11",
        "",
        "This audit checks CCMAS course outlines and learning outcomes against the current domain matching gates, then follows each JAMB identity upstream to its resolved CCMAS component and reviewed curriculum scope.",
        "",
        "## Summary",
        "",
        f"- CCMAS programmes checked: **{len(programmes)}**",
        f"- Candidate rows checked: **{len(candidate_rows)}** (scored candidates: **{report['summary']['scored_candidate_rows_checked']}**)",
        f"- Active mapping rows checked: **{report['summary']['active_mapping_rows_checked']}**",
        f"- Active links failing the numeric course/outcome gate: **{report['summary']['active_links_failing_numeric_gate']}**",
        f"- Active links needing semantic review after the numeric gate: **{report['summary']['active_links_needing_semantic_review']}**",
        f"- Omitted candidates: **{report['summary']['omitted_candidates']}**",
        f"- Omitted candidates that pass the numerical gate and need semantic review: **{report['summary']['omitted_candidates_requiring_review']}**",
        f"- Normalized JAMB identity collisions: **{len(collisions)}**",
        f"- Brochure offering rows checked: **{report['offering_source_context']['offering_rows_checked']}**",
        f"- Repeated normalized offering identities audited: **{report['offering_source_context']['normalized_offering_collisions']}**",
        f"- Offering contexts resolved structurally: **{sum(v for k, v in report['offering_source_context']['resolved_context_counts'].items() if k != 'needs_manual_source_review')}**",
        f"- Offering contexts still requiring manual source review: **{len(report['offering_source_context']['unresolved_contexts'])}**",
        f"- JAMB→CCMAS component mismatches: **{len(report['offering_source_context']['canonical_component_mismatches'])}**",
        f"- Reviewed-link materialization mismatches: **{len(report['offering_source_context']['reviewed_link_materialization']['reviewed_map_mismatches'])}**",
        "",
        "A candidate passing the numerical gate is not automatically promoted: the course/outcome content must actually teach the destination domain. Generic matches such as a single occurrence of `statistics`, `computer`, `market`, or `product` remain review candidates.",
        "",
        "## Sociology",
        "",
        "Sociology is an exact JAMB→CCMAS Sociology inheritance. Its current top-level domain map includes Social Sciences and Data Science. Computational Social Science is a subgroup inside Social Sciences; data analyst and statistician are downstream roles in Data Science; Applied Statistics & Computational Modelling is a Data Science subgroup.",
        "",
        "Requested target review:",
        "",
    ]
    for row in sociology_target_review:
        candidate = row.get("candidate")
        if not candidate:
            lines.append(f"- **{row['domain_name']}** — no scored candidate in the current CCMAS scorer; {row['reason']}.")
            continue
        evidence_row = candidate["course_evidence"]
        lines.append(
            f"- **{row['domain_name']}** — {'already active' if row['current_mapping'] else 'omitted candidate'}; gate `{candidate['gate_status']}`; matched courses: {evidence_row['matched_course_count']}; anchors: {', '.join(evidence_row['distinct_anchors'][:8]) or 'none'}."
        )
    lines.extend([
        "",
        "## Upstream JAMB identity collisions",
        "",
        "These are not automatically errors. They are mandatory review rows because the same normalized display name resolves to different faculty/discipline/CCMAS identities and must not share a domain map blindly.",
        "",
    ])
    for collision in collisions[:100]:
        lines.append(f"- `{collision['normalized_name']}`: " + "; ".join(" / ".join(str(item) for item in identity) for identity in collision["identities"]))
    lines.extend([
        "",
        "## Brochure offering-context resolution",
        "",
        "A repeated brochure name is not automatically a data error. Same-component repeats are consolidated to one display identity while preserving institution and requirement contexts. Different exact JAMB identities are kept separate when their CCMAS track differs. Composite JAMB names retain their combined CCMAS components.",
        "",
    ])
    for collision in report["offering_source_context"]["collisions"]:
        lines.append(
            f"- `{collision['normalized_name']}` — **{collision['status']}**; names: {', '.join(collision['exact_names'])}; source faculties: {', '.join(collision['source_faculties'])}; CCMAS components: {', '.join(collision['resolved_ccmas_component_refs']) or 'unresolved'}; requirement variants: {collision['distinct_requirement_variants']}; institutions: {collision['institution_count_total']}; {collision['resolution_reason']}"
        )
    lines.extend([
        "",
        "LIS is resolved as two exact identities, not merged: `LIBRARY SCIENCE`/`LIBRARY AND INFORMATION SCIENCE` in the Social/Management track and title-case Education variants in the Education track. The JSON artifact retains every repeated name/faculty/source context, including institution lists and requirement fields, so university-specific offerings cannot silently inherit a different CCMAS track.",
        "",
        "The only offering-context groups still requiring manual source review are listed below. They are not promoted as source-complete merely because a JAMB-to-CCMAS mapping exists:",
        "",
    ])
    for row in report["offering_source_context"]["unresolved_contexts"]:
        lines.append(f"- `{row['normalized_name']}` — {', '.join(row['exact_names'])}; missing source layers: {', '.join(row['missing_source_layers'])}.")
    inventory = report["data_review_inventory"]
    lines.extend([
        "",
        "## Remaining data-review inventory",
        "",
        "These categories are intentionally not hidden behind a generic `ready` label:",
        "",
        f"- Requirement layers: **{inventory['source_rule_layers']}** across UTME, O-level and Direct Entry; source variants preserved: **{inventory['source_rule_variants']}**.",
        f"- UTME layers needing requirement-structure review: **{len(inventory['by_layer']['utme']['needs_review_rows'])}**; no-source-candidate layers: **{len(inventory['by_layer']['utme']['no_source_candidate_rows'])}**.",
        f"- O-level layers needing requirement-structure review: **{len(inventory['by_layer']['olevel']['needs_review_rows'])}**; empty layers: **{inventory['by_layer']['olevel']['catalogue_state_counts'].get('empty', 0)}**; no-source-candidate layers: **{len(inventory['by_layer']['olevel']['no_source_candidate_rows'])}**.",
        f"- Direct Entry layers with no catalogue rule: **{inventory['by_layer']['direct_entry']['catalogue_state_counts'].get('empty', 0)}**; no-source-candidate layers: **{len(inventory['by_layer']['direct_entry']['no_source_candidate_rows'])}**.",
        f"- Source-blank variants: **{len(inventory['source_blank_variants'])}**.",
        f"- University-specific exception rows in the generated seed: **{sum(inventory['generated_seed'].get('university_exception_status_counts', {}).values())}**; structured subject options: **{inventory['generated_seed'].get('structured_university_subject_options')}**; exception statuses: `{inventory['generated_seed'].get('university_exception_status_counts')}`.",
        f"- Generated offering seed check: **{inventory['generated_seed'].get('school_programmes_rows')}** rows and university UTME/O-level/Direct Entry columns emitted: **{inventory['generated_seed'].get('school_programme_requirement_columns_emitted')}**.",
        f"- Active programme-domain links failing the evidence gate: **{inventory['domain_mapping_review']['active_links_failing_numeric_gate']}**; active links needing semantic review: **{inventory['domain_mapping_review']['active_links_needing_semantic_review']}**.",
        f"- Unverified programme-domain links retained outside active guidance: **{inventory['domain_mapping_review']['unverified_links']}**.",
        "",
        "Requirement review rows and no-source rows remain eligible for manual completion only; they must not be turned into inferred subject rules. Domain-link review is a separate CCMAS curriculum audit and does not mean the JAMB identity itself is broken.",
        "",
        "## Upstream consistency",
        "",
        f"- Canonical JAMB rows missing from the active JAMB map: **{len(report['offering_source_context']['canonical_names_missing_from_active_jamb_map'])}**.",
        f"- Active JAMB rows missing from the canonical inheritance artifact: **{len(report['offering_source_context']['active_jamb_names_missing_from_canonical_artifact'])}**.",
        f"- JAMB→CCMAS component mismatches: **{len(report['offering_source_context']['canonical_component_mismatches'])}**.",
        f"- Canonical review rows upgraded by the current reviewed-link layer: **{len(report['offering_source_context']['canonical_review_rows_upgraded_by_current_reviewed_map'])}**; these are review-backed upgrades, not silent full-curriculum inheritance.",
        f"- Reviewed-link rows compared with the active JAMB map: **{report['offering_source_context']['reviewed_link_materialization']['reviewed_rows']}**; materialization mismatches: **{len(report['offering_source_context']['reviewed_link_materialization']['reviewed_map_mismatches'])}**.",
    ])
    lines.extend([
        "",
        "## Highest-priority omitted candidates",
        "",
        "These are review candidates only; they require semantic confirmation before promotion.",
        "",
    ])
    for row in review_rows[:100]:
        lines.append(
            f"- `{row['programme_key']}` → **{row['domain_name']}** ({row['domain_id']}), score {row.get('score')}; {row['gate_status']}; anchors: {', '.join(row['course_evidence']['distinct_anchors'][:6]) or 'none'}."
        )
    lines.extend([
        "",
        "The JSON artifact contains every programme/domain candidate, course-level matches, gate result, Sociology target review, downstream subgroup/role paths, and all upstream JAMB identity collisions.",
    ])
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "summary": report["summary"],
        "sociology_targets": [
            {"domain": row["domain_name"], "current": row["current_mapping"], "gate": (row.get("candidate") or {}).get("gate_status")}
            for row in sociology_target_review
        ],
        "jamb_normalized_collisions": len(collisions),
        "resolved_offering_contexts": report["offering_source_context"]["resolved_context_counts"],
        "manual_source_review_contexts": len(report["offering_source_context"]["unresolved_contexts"]),
        "requirement_review_layers": {
            layer: len(value["needs_review_rows"])
            for layer, value in report["data_review_inventory"]["by_layer"].items()
        },
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
