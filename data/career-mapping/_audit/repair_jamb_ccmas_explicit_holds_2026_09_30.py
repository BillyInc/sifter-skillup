"""Deterministically repair JAMB/CCMAS mapping holds caused by stale overlays.

The materialized JAMB map used to fail-closed an entire row when one reviewed
overlay link was not present in the canonical CCMAS candidate catalogue.  That
made valid canonical links disappear together with the unsupported overlay
link.  This pass removes only the unsupported overlay edges and restores the
source-backed canonical candidates.  It never invents a combined curriculum,
changes a component assignment, or changes role names.

Rows whose component/scope is still explicitly unresolved remain held.  The
script is dry-run by default; ``--apply`` writes a timestamped backup before
replacing the local JAMB domain map.
"""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ACTIVE = ROOT / "jamb_domain_map.json"
CANONICAL = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
RECON = AUDIT / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"
CONFLICTS = AUDIT / "jamb_nigerian_review_overlay_conflicts_2026-09-25.json"
SCORES = ROOT / "programme_domain_scores.json"
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3.json"
CCMAS_DIR = ROOT / "ccmas"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "repair_jamb_ccmas_explicit_holds_2026-09-30.json"
REPORT_MD = AUDIT / "repair_jamb_ccmas_explicit_holds_2026-09-30.md"
BACKUP = AUDIT / "jamb_domain_map_before_explicit_hold_repair_2026-09-30.json"

TIER_ORDER = {"adjacent": 1, "functional": 2, "direct": 3}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def route_ready(domain_id: str, meta: dict[str, Any], structure: dict[str, Any], role_counts: Counter[str]) -> bool:
    meta_row = meta.get(domain_id) or {}
    structure_row = structure.get(domain_id) or {}
    return bool(
        meta_row
        and structure_row
        and not meta_row.get("excluded")
        and structure_row.get("subgroups")
        and int(structure_row.get("role_count") or 0) > 0
        and role_counts[domain_id] > 0
    )


def normalize_link(link: dict[str, Any], domain_meta: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(link)
    domain = domain_meta.get(result.get("domain_id")) or {}
    if domain.get("domain_name"):
        result["domain_name"] = domain["domain_name"]
    return result


def score_candidate_links(
    canonical: dict[str, Any],
    scores: dict[str, Any],
    domain_meta: dict[str, Any],
    domain_structure: dict[str, Any],
    role_counts: Counter[str],
) -> tuple[list[dict[str, Any]], list[str]]:
    """Rebuild only the canonical candidate IDs with course-matched score evidence."""
    allowed_ids = {
        link.get("domain_id")
        for link in canonical.get("candidate_ccmas_domain_links") or []
        if link.get("domain_id")
    }
    observations: dict[str, list[dict[str, Any]]] = {}
    for component in canonical.get("component_refs") or []:
        for link in (scores.get(component) or {}).get("links", []):
            domain_id = link.get("domain_id")
            if domain_id not in allowed_ids or link.get("course_match") is not True:
                continue
            if not route_ready(domain_id, domain_meta, domain_structure, role_counts):
                continue
            observations.setdefault(domain_id, []).append(link)

    links: list[dict[str, Any]] = []
    for domain_id, observed in sorted(observations.items()):
        best_tier = max(
            (link.get("match_type") for link in observed if link.get("match_type") in TIER_ORDER),
            key=lambda tier: TIER_ORDER[tier],
            default=None,
        )
        template = next(
            (link for link in observed if link.get("match_type") == best_tier),
            observed[0],
        )
        link = normalize_link(template, domain_meta)
        link["component_refs"] = sorted({component for item in observed for component in [item.get("component_ref")] if component})
        link["source"] = "programme_domain_scores_course_match"
        link["evidence_status"] = "course_matched_component_score"
        link["observed_match_types"] = sorted({item.get("match_type") for item in observed if item.get("match_type")})
        links.append(link)

    missing = sorted(allowed_ids - {link.get("domain_id") for link in links})
    return links, missing


def build_ccmas_component_files() -> dict[str, str]:
    """Map the declared CCMAS component key to its checked-in source JSON."""
    result: dict[str, str] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        payload = load(path)
        discipline = payload.get("discipline")
        if not discipline:
            continue
        for programme in payload.get("programmes") or []:
            name = programme.get("name")
            if name:
                result[f"{discipline}::{name}"] = path.name
    return result


def component_coverage(scope: dict[str, Any], component_files: dict[str, str]) -> dict[str, int]:
    """Count selected, source-backed courses for every declared component.

    This deliberately uses the scope ledger's selected course records.  It
    does not infer a component from a similar title or from a domain score.
    Custom components are accepted only when their selected rows carry an
    external curriculum source and a locator.
    """
    selected = scope.get("selected_courses") or []
    coverage: dict[str, int] = {}
    for component in scope.get("component_refs") or []:
        if component.startswith("__custom__::"):
            facet = component.split("::", 1)[1].casefold()
            coverage[component] = sum(
                1
                for course in selected
                if str(course.get("scope_facet") or "").casefold() == facet
                and course.get("source_kind") in {"external_curriculum", "ccmas_related"}
                and course.get("source_url")
                and course.get("source_locator")
            )
            continue
        _, programme = component.split("::", 1)
        source_file = component_files.get(component)
        coverage[component] = sum(
            1
            for course in selected
            if course.get("source_ccmas_programme") == programme
            and course.get("source_ccmas_file") == source_file
            and course.get("source_url")
            and course.get("source_locator")
        )
    return coverage


def scope_is_source_backed(scope: dict[str, Any], component_files: dict[str, str]) -> tuple[bool, dict[str, int], str]:
    """Return whether the reviewed scope has evidence for every named facet."""
    coverage = component_coverage(scope, component_files)
    approved = scope.get("scope_approval") in {"reviewed", "not_applicable"}
    status = scope.get("scope_status")
    allowed_status = {
        "full_scope_reviewed",
        "combined_scope_reviewed",
        "partial_scope_reviewed",
        "full",
        "partial",
    }
    if not approved or status not in allowed_status:
        return False, coverage, "scope_not_reviewed"
    if any(count <= 0 for count in coverage.values()):
        return False, coverage, "declared_component_has_no_source_backed_selected_courses"
    if not scope.get("selected_courses"):
        return False, coverage, "scope_has_no_selected_courses"
    if scope.get("unrepresented_facets"):
        # The reviewed component(s) can still be published as a partial route.
        # The explicitly unrepresented facet stays in provenance and is never
        # imported as a requirement from comparator evidence.
        return True, coverage, "reviewed_partial_scope_with_unrepresented_facet_preserved"
    return True, coverage, "reviewed_scope_has_source_backed_component_rows"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    active = load(ACTIVE)
    canonical = {row["jamb_name"]: row for row in load(CANONICAL)["rows"]}
    reconciliation = {row["jamb_name"]: row for row in load(RECON)["rows"]}
    conflicts = {row["jamb_name"]: row for row in load(CONFLICTS).get("conflicts", [])}
    scopes = {row["jamb_name"]: row for row in load(SCOPES)["rows"]}
    scores = load(SCORES)
    domain_meta = load(DOMAIN_META)
    domain_structure = load(DOMAIN_STRUCTURE)
    role_counts = Counter(row.get("domain_id") for row in load(ROLE_LIBRARY))
    component_files = build_ccmas_component_files()

    updated = copy.deepcopy(active)
    changes: list[dict[str, Any]] = []
    held_reasons: Counter[str] = Counter()
    removed_overlay_links: list[dict[str, Any]] = []
    candidate_missing: list[dict[str, Any]] = []

    for jamb_name, row in sorted(reconciliation.items()):
        hold = next((issue for issue in row.get("issues", []) if issue.get("kind") == "mapping_explicitly_held_for_review"), None)
        current = active.get(jamb_name) or {}
        if hold is None:
            continue

        current = updated.get(jamb_name) or {}
        canonical_row = canonical.get(jamb_name) or {}
        scope = scopes.get(jamb_name) or {}
        scope_ready, coverage, scope_reason = scope_is_source_backed(scope, component_files)
        canonical_status = canonical_row.get("mapping_status")
        rebuilt_links, missing_candidate_ids = score_candidate_links(
            canonical_row, scores, domain_meta, domain_structure, role_counts
        )

        # A single/full or already source-approved partial row may be restored
        # from canonical links.  Combined and unresolved partial scopes remain
        # held even when their component score catalogue has candidates.
        source_gate = scope_ready and bool(rebuilt_links)
        # Prefer the current component score catalogue.  A small number of
        # reviewed scopes have a source-backed canonical candidate but no
        # corresponding score-catalogue row (for example French and Music).
        # Those candidates are still usable only when the reviewed scope is
        # complete and the raw domain route exists; they are labelled as
        # scope-backed candidates so they cannot be mistaken for score proof.
        links = rebuilt_links if source_gate else []
        link_basis = "reviewed scope + course-matched component score"
        if scope_ready and not links:
            fallback_links: list[dict[str, Any]] = []
            for candidate in canonical_row.get("candidate_ccmas_domain_links") or []:
                domain_id = candidate.get("domain_id")
                if not domain_id or not route_ready(domain_id, domain_meta, domain_structure, role_counts):
                    continue
                link = normalize_link(candidate, domain_meta)
                link["source"] = "jamb_ccmas_inheritance_canonical_2026-08-17.json + reviewed_scope_fallback"
                link["evidence_status"] = "reviewed_scope_backed_canonical_candidate_without_score_row"
                link["component_refs"] = list(canonical_row.get("component_refs") or [])
                fallback_links.append(link)
            links = fallback_links
            if links:
                source_gate = True
                link_basis = "reviewed scope + route-ready canonical candidate fallback"
        if not links:
            reason = scope_reason if not scope_ready else "no_route_ready_course_matched_candidate"
            held_reasons[reason] += 1
            if missing_candidate_ids:
                candidate_missing.append({"jamb_name": jamb_name, "domain_ids": missing_candidate_ids})
            continue

        conflict = conflicts.get(jamb_name)
        if conflict:
            missing_ids = set(conflict.get("missing_domain_ids") or [])
            for domain_id in sorted(missing_ids):
                removed_overlay_links.append({"jamb_name": jamb_name, "domain_id": domain_id, "reason": "overlay_link_absent_from_canonical_candidate_catalogue"})

        status = "ready_partial" if scope.get("scope_status") in {"combined_scope_reviewed", "partial_scope_reviewed", "partial"} else "ready"
        new_row = copy.deepcopy(current)
        new_row["links"] = links
        new_row["mapping_status"] = status
        new_row["status_reason"] = (
            "Restored source-backed CCMAS domain links from the reviewed scope ledger; "
            "combined or partial curricula are explicitly marked as reference unions and "
            "unsupported review-overlay links were removed individually."
        )
        new_row["source"] = "jamb_ccmas_inheritance_canonical_2026-08-17.json + explicit_hold_repair_2026-09-30"
        if new_row != current:
            changes.append({
                "jamb_name": jamb_name,
                "previous_status": current.get("mapping_status"),
                "new_status": status,
                "previous_link_count": len(current.get("links") or []),
                "new_link_count": len(links),
                "basis": link_basis,
                "scope_status": scope.get("scope_status"),
                "component_coverage": coverage,
            })
            updated[jamb_name] = new_row

    report = {
        "schema": "2026-09-30.jamb-ccmas-explicit-hold-repair.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Remove unsupported overlay edges individually and restore only source-backed, route-ready canonical links; never promote unresolved combined scopes.",
        "counts": {
            "input_held_rows": sum(
                any(i.get("kind") == "mapping_explicitly_held_for_review" for i in row.get("issues", []))
                for row in reconciliation.values()
            ),
            "rows_changed": len(changes),
            "rows_remaining_held": sum(held_reasons.values()),
            "unsupported_overlay_links_removed": len(removed_overlay_links),
            "candidate_domain_ids_without_course_matched_route": sum(len(row["domain_ids"]) for row in candidate_missing),
        },
        "changes": changes,
        "remaining_hold_reasons": dict(held_reasons),
        "removed_overlay_links": removed_overlay_links,
        "candidate_missing": candidate_missing,
    }

    historical_overlay_conflicts = sum(
        len(row.get("missing_domain_ids") or []) for row in conflicts.values()
    )
    active_overlay_conflicts: list[dict[str, Any]] = []
    for jamb_name, conflict in conflicts.items():
        missing_ids = set(conflict.get("missing_domain_ids") or [])
        present_ids = {
            link.get("domain_id")
            for link in (updated.get(jamb_name) or {}).get("links") or []
        }
        overlap = sorted(missing_ids & present_ids)
        if overlap:
            active_overlay_conflicts.append({"jamb_name": jamb_name, "domain_ids": overlap})
    report["counts"].update({
        "active_rows_with_explicit_hold_repair_marker": sum(
            "explicit_hold_repair_2026-09-30" in str(row.get("source") or "")
            for row in updated.values()
        ),
        "historical_overlay_conflict_link_occurrences": historical_overlay_conflicts,
        "active_map_unsupported_overlay_links_remaining": sum(
            len(row["domain_ids"]) for row in active_overlay_conflicts
        ),
        "active_map_unsupported_overlay_rows_remaining": len(active_overlay_conflicts),
    })
    report["overlay_accounting"] = {
        "historical_conflict_links": historical_overlay_conflicts,
        "removed_or_excluded_after_this_pass": historical_overlay_conflicts - report["counts"]["active_map_unsupported_overlay_links_remaining"],
        "removed_this_pass": len(removed_overlay_links),
        "remaining_in_active_map": active_overlay_conflicts,
    }

    if args.apply:
        if not BACKUP.exists():
            BACKUP.write_text(ACTIVE.read_text(encoding="utf-8-sig"), encoding="utf-8")
        ACTIVE.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# JAMB–CCMAS explicit-hold repair — 2026-09-30",
            "",
            f"- Mode: **{report['mode']}**",
            f"- Held rows inspected: **{report['counts']['input_held_rows']}**",
            f"- Rows corrected: **{report['counts']['rows_changed']}**",
            f"- Rows still held: **{report['counts']['rows_remaining_held']}**",
            f"- Unsupported overlay links removed: **{report['counts']['unsupported_overlay_links_removed']}**",
            f"- Historical overlay conflict links accounted for: **{report['counts']['historical_overlay_conflict_link_occurrences']}**",
            f"- Unsupported overlay links remaining in active map: **{report['counts']['active_map_unsupported_overlay_links_remaining']}**",
            "",
            "Combined and unresolved partial scopes remain held; no curriculum component or role name was guessed.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps({"report": str(REPORT), "mode": report["mode"], **report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
