"""Audit the current downstream residual queues without editing canonical data.

Focus:
* domain links whose stored course-title anchors are not selected by the current
  JAMB scope (the current 488 occurrence queue); and
* mappings held only at the downstream publication layer (the current 120
  occurrence queue).

The audit is deterministic and occurrence-preserving.  It does not read or
modify generated seeds, role naming, JAMB/CCMAS source records, or downstream
canonical mappings.  It writes a new append-only evidence/recommendation
checkpoint.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
RECON = max(
    AUDIT.glob("jamb_ccmas_domain_mapping_reconciliation_*.json"),
    key=lambda path: path.stat().st_mtime,
)
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
OUT_JSON = AUDIT / f"downstream_unselected_course_held_mappings_audit_{__import__('datetime').date.today().isoformat()}_001.json"
OUT_MD = AUDIT / f"downstream_unselected_course_held_mappings_audit_{__import__('datetime').date.today().isoformat()}_001.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: Any) -> str:
    text = str(value or "").casefold()
    text = text.replace("â€“", "-").replace("â€”", "-")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def compact(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", norm(value))


def title_match(anchor: str, selected: str) -> str:
    """Classify a stale anchor without inventing a new course relationship."""
    a = norm(anchor)
    s = norm(selected)
    if not a or not s:
        return "no_match"
    if a == s:
        return "exact_selected_title"
    if compact(a) == compact(s):
        return "punctuation_or_spacing_variant"
    # Some old anchors were cut at a table-column boundary, e.g. ``...(3``.
    # Require a meaningful prefix and do not treat arbitrary short text as a
    # match.
    if len(a) >= 24 and (s.startswith(a) or a.startswith(s)):
        return "truncated_or_extended_selected_title"
    a_tokens = a.split()
    s_tokens = s.split()
    common = sum(token in s_tokens for token in a_tokens if len(token) > 3)
    if len(a_tokens) >= 4 and common / max(1, len(a_tokens)) >= 0.9:
        return "token_normalization_variant"
    return "no_match"


def selected_courses(scope: dict[str, Any]) -> list[dict[str, Any]]:
    return [item for item in scope.get("selected_courses", []) if item.get("title")]


def source_summary(scope: dict[str, Any]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str]] = set()
    result: list[dict[str, Any]] = []
    for course in selected_courses(scope):
        key = (
            str(course.get("source_ccmas_file") or ""),
            str(course.get("source_ccmas_programme") or ""),
            str(course.get("code") or ""),
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(
            {
                "source_file": key[0],
                "source_programme": key[1],
                "code": key[2],
                "title": course.get("title"),
                "source_url": course.get("source_url"),
                "source_locator": course.get("source_locator"),
                "source_accessed_on": course.get("source_accessed_on"),
            }
        )
    return result


def issue_rows(reconciliation: dict[str, Any], kind: str) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for row in reconciliation.get("rows", []):
        for issue in row.get("issues", []):
            if issue.get("kind") == kind:
                result.append({"row": row, "issue": issue, "jamb_name": row.get("jamb_name")})
    return result


def next_append_only_name() -> tuple[Path, Path, int]:
    prefix = f"downstream_unselected_course_held_mappings_audit_{__import__('datetime').date.today().isoformat()}_"
    versions = []
    for path in AUDIT.glob(f"{prefix}[0-9][0-9][0-9].json"):
        match = re.search(r"_(\d{3})\.json$", path.name)
        if match:
            versions.append(int(match.group(1)))
    version = max(versions, default=0) + 1
    return (
        AUDIT / f"{prefix}{version:03d}.json",
        AUDIT / f"{prefix}{version:03d}.md",
        version,
    )


def main() -> None:
    recon = load(RECON)
    scope_rows = {row["jamb_name"]: row for row in load(SCOPES).get("rows", [])}
    unselected = issue_rows(recon, "domain_link_references_unselected_course")
    held = issue_rows(recon, "mapping_explicitly_held_for_review")

    unselected_cases: list[dict[str, Any]] = []
    unselected_class: Counter[str] = Counter()
    for item in unselected:
        row = item["row"]
        details = item["issue"].get("details") or {}
        scope = scope_rows.get(item["jamb_name"], {})
        courses = selected_courses(scope)
        selected_titles = [course.get("title") for course in courses]
        anchors = details.get("titles") or details.get("scope_course_titles") or []
        anchor_results = []
        for anchor in anchors:
            matches = [
                {"title": title, "match": title_match(anchor, title)}
                for title in selected_titles
                if title_match(anchor, title) != "no_match"
            ]
            classification = matches[0]["match"] if matches else "genuinely_unselected_anchor"
            anchor_results.append(
                {
                    "stored_anchor": anchor,
                    "classification": classification,
                    "selected_matches": matches[:5],
                }
            )
            unselected_class[classification] += 1
        if not anchors:
            unselected_class["missing_anchor_payload"] += 1
        if any(result["classification"] == "genuinely_unselected_anchor" for result in anchor_results) or not anchors:
            recommendation = "Remove or replace only the unselected course anchor after confirming the exact course evidence; keep the domain link held until its evidence set is selected and justified."
            disposition = "open_unselected_anchor_repair"
        elif any(result["classification"] != "exact_selected_title" for result in anchor_results):
            recommendation = "Normalize the stored anchor to the exact selected course title/code after a source-preserving preimage check; do not change the domain match type in this lane."
            disposition = "deterministic_anchor_normalization_candidate"
        else:
            recommendation = "Reconcile the duplicated issue against the current link snapshot; no course deletion is justified from this record alone."
            disposition = "duplicate_or_stale_issue_requires_recheck"
        unselected_cases.append(
            {
                "jamb_name": item["jamb_name"],
                "domain_id": details.get("domain_id"),
                "match_type": details.get("match_type"),
                "components": details.get("components") or row.get("ccmas_components", []),
                "selected_course_count": len(courses),
                "selected_course_sources": source_summary(scope),
                "stored_anchor_titles": anchors,
                "anchor_results": anchor_results,
                "disposition": disposition,
                "recommendation": recommendation,
                "canonical_edit_applied": False,
            }
        )

    held_cases: list[dict[str, Any]] = []
    held_class: Counter[str] = Counter()
    for item in held:
        row = item["row"]
        details = item["issue"].get("details") or {}
        scope = scope_rows.get(item["jamb_name"], {})
        scope_status = str(details.get("scope_status") or "")
        mapping_status = str(details.get("mapping_status") or "")
        jamb_scope_hold = scope_status.endswith("review_required")
        downstream_only = mapping_status == "review_required" and not jamb_scope_hold
        if not downstream_only:
            classification = "not_downstream_only_overlap_or_state_changed"
        elif row.get("selected_course_count", 0) > 0:
            classification = "downstream_hold_with_selected_course_evidence"
        elif row.get("mapping_type") in {"A_exact", "C_reclassified"} and scope_status == "full":
            classification = "downstream_hold_on_full_ccmas_inheritance_without_explicit_scope_rows"
        else:
            classification = "downstream_hold_other_source_review"
        held_class[classification] += 1
        if classification == "downstream_hold_with_selected_course_evidence":
            recommendation = "Reassess the domain link labels and anchors against the selected course evidence; promote only after the downstream semantic gate passes."
        elif classification == "downstream_hold_on_full_ccmas_inheritance_without_explicit_scope_rows":
            recommendation = "Keep the full CCMAS inheritance as the source basis, but create/validate explicit JAMB scope evidence before publishing downstream links; do not invent course anchors."
        elif classification == "downstream_hold_other_source_review":
            recommendation = "Keep held and document the missing downstream evidence or semantic decision; no automatic promotion is justified."
        else:
            recommendation = "Reconcile layer ownership first; this row is not a downstream-only hold under the current state."
        held_cases.append(
            {
                "jamb_name": item["jamb_name"],
                "mapping_type": row.get("mapping_type"),
                "components": row.get("ccmas_components", []),
                "selected_course_count": row.get("selected_course_count", 0),
                "scope_status": scope_status,
                "mapping_status": mapping_status,
                "scope_evidence_status": row.get("scope_evidence_status"),
                "selected_course_sources": source_summary(scope),
                "classification": classification,
                "recommendation": recommendation,
                "canonical_edit_applied": False,
            }
        )

    out_json, out_md, version = next_append_only_name()
    counts = {
        "reconciliation_jamb_names": len(recon.get("rows", [])),
        "unselected_domain_link_occurrences": len(unselected_cases),
        "unselected_domain_link_unique_jamb_domain_pairs": len({(x["jamb_name"], x["domain_id"]) for x in unselected_cases}),
        "unselected_anchor_entries": sum(len(x["stored_anchor_titles"]) for x in unselected_cases),
        "held_mapping_occurrences": len(held_cases),
        "held_downstream_only_occurrences": sum(x["classification"].startswith("downstream_hold_") for x in held_cases),
        "held_overlap_or_state_changed_occurrences": sum(x["classification"] == "not_downstream_only_overlap_or_state_changed" for x in held_cases),
        "open_unselected_anchor_repair_cases": sum(x["disposition"] == "open_unselected_anchor_repair" for x in unselected_cases),
        "deterministic_anchor_normalization_candidates": sum(x["disposition"] == "deterministic_anchor_normalization_candidate" for x in unselected_cases),
        "genuinely_unselected_anchor_entries": unselected_class["genuinely_unselected_anchor"],
        "missing_anchor_payload_entries": unselected_class["missing_anchor_payload"],
    }
    validation = {
        "reconciliation_scope_is_all_420_jamb_names": {
            "expected": 420,
            "actual": counts["reconciliation_jamb_names"],
            "passed": counts["reconciliation_jamb_names"] == 420,
        },
        "unselected_queue_count_matches_current_residual": {
            "expected": 488,
            "actual": counts["unselected_domain_link_occurrences"],
            "passed": counts["unselected_domain_link_occurrences"] == 488,
        },
        "held_queue_count_matches_current_residual": {
            "expected": 120,
            "actual": counts["held_mapping_occurrences"],
            "passed": counts["held_mapping_occurrences"] == 120,
        },
        "all_held_rows_are_downstream_only": {
            "expected": counts["held_mapping_occurrences"],
            "actual": counts["held_downstream_only_occurrences"],
            "passed": counts["held_downstream_only_occurrences"] == counts["held_mapping_occurrences"],
        },
        "all_occurrences_have_case_records": {
            "unselected": len(unselected_cases),
            "held": len(held_cases),
            "passed": len(unselected_cases) == counts["unselected_domain_link_occurrences"] and len(held_cases) == counts["held_mapping_occurrences"],
        },
        "unselected_pairs_are_occurrence_unique": {
            "expected_unique_pairs": counts["unselected_domain_link_occurrences"],
            "actual_unique_pairs": counts["unselected_domain_link_unique_jamb_domain_pairs"],
            "passed": counts["unselected_domain_link_unique_jamb_domain_pairs"] == counts["unselected_domain_link_occurrences"],
        },
        "no_canonical_edits_requested": {
            "unselected_all_false": all(not item["canonical_edit_applied"] for item in unselected_cases),
            "held_all_false": all(not item["canonical_edit_applied"] for item in held_cases),
            "passed": all(not item["canonical_edit_applied"] for item in unselected_cases + held_cases),
        },
    }
    validation["all_passed"] = all(item.get("passed") for item in validation.values())
    report = {
        "schema": "2026-09-29.downstream-unselected-course-held-mappings-audit.v1",
        "generated_on": date.today().isoformat(),
        "append_only_increment": version,
        "status": "audit_complete_for_current_local_residual_queues",
        "scope": {
            "input_reconciliation": str(RECON.relative_to(ROOT.parent)),
            "selected_scope_ledger": str(SCOPES.relative_to(ROOT.parent)),
            "downstream_only": True,
            "jamb_ccmas_source_repairs_reopened": False,
            "generated_seeds_modified": False,
            "role_naming_modified": False,
        },
        "counts": counts,
        "validation": validation,
        "unselected_anchor_classification": dict(sorted(unselected_class.items())),
        "held_classification": dict(sorted(held_class.items())),
        "unselected_domain_link_cases": unselected_cases,
        "held_mapping_cases": held_cases,
        "recommendation_contract": [
            "Use the exact current selected course scope as the membership authority for course anchors.",
            "Normalize only clear title truncation/punctuation variants after a source-preserving preimage check.",
            "For genuinely unselected anchors, withhold or replace the anchor; do not silently promote the domain link.",
            "Keep downstream-only holds until their domain evidence/match-type decision is documented; a held row is not a student-confirmed link.",
            "No canonical mappings, generated seeds, SQL, role names, JAMB/CCMAS source records, or downstream records were edited.",
        ],
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        f"# Downstream unselected-course and held-mapping audit — 2026-09-29 ({version:03d})",
        "",
        "Audit-only, append-only reconciliation against the current selected JAMB course scopes. JAMB↔CCMAS source repairs, generated seeds, and role naming were not reopened or changed.",
        "",
        "## Exact counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += ["", "## Unselected-anchor classifications", ""]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(unselected_class.items()))
    lines += ["", "## Held-mapping classifications", ""]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(held_class.items()))
    lines += [
        "",
        "## Validation",
        "",
        f"- **All invariants passed:** `{validation['all_passed']}`",
        f"- 420-name scope coverage: `{validation['reconciliation_scope_is_all_420_jamb_names']['passed']}`",
        f"- 488 unselected queue reconciled: `{validation['unselected_queue_count_matches_current_residual']['passed']}`",
        f"- 120 held queue reconciled: `{validation['held_queue_count_matches_current_residual']['passed']}`",
        f"- All holds downstream-only: `{validation['all_held_rows_are_downstream_only']['passed']}`",
        f"- No canonical edit flags: `{validation['no_canonical_edits_requested']['passed']}`",
        "",
        "The machine-readable JSON contains every occurrence, its selected-course source summary, the stored anchor titles, deterministic comparison result, and repair recommendation.",
        "",
        "## Boundary",
        "",
        "No canonical edit was applied. This checkpoint does not approve student-facing downstream links or regenerate a seed.",
    ]
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "counts": counts, "unselected_classes": dict(unselected_class), "held_classes": dict(held_class)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
