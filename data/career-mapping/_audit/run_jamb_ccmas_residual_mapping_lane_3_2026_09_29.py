"""Run the residual semantic JAMB -> CCMAS mapping lane.

This is deliberately narrower than the course-detail queue.  It consumes the
current deterministic reconciliation and classifies only mapping exceptions:
combined/partial component coverage, domain-score-catalogue disagreements,
unselected domain anchors, held mappings, missing CCMAS rows, and custom
external components.  It never edits a canonical mapping or seed.

The output is append-only: every invocation chooses the next available
increment and writes a new JSON/Markdown checkpoint.
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
CAREER = ROOT
RECON = AUDIT / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
DOMAIN_MAP = CAREER / "jamb_domain_map.json"
SCORES = CAREER / "programme_domain_scores.json"
OUT_PREFIX = "jamb_ccmas_residual_mapping_lane_3_2026-09-29_increment_"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def next_increment() -> int:
    values = []
    for path in AUDIT.glob(f"{OUT_PREFIX}[0-9][0-9][0-9].json"):
        match = re.search(r"increment_(\d{3})\.json$", path.name)
        if match:
            values.append(int(match.group(1)))
    return max(values, default=0) + 1


def selected_titles(scope: dict[str, Any] | None) -> set[str]:
    return {
        norm(row.get("title"))
        for row in (scope or {}).get("selected_courses", [])
        if row.get("title")
    }


def issue_rows(report: dict[str, Any], kind: str) -> list[dict[str, Any]]:
    rows = []
    for row in report["rows"]:
        for issue in row.get("issues", []):
            if issue.get("kind") == kind:
                rows.append({"jamb_name": row["jamb_name"], "row": row, "details": issue.get("details", {})})
    return rows


def evidence(path: str, urls: list[str], locator: str, supports: str) -> dict[str, Any]:
    return {
        "checkpoint": path,
        "source_urls": urls,
        "locator": locator,
        "supports": supports,
    }


def named_case_evidence() -> list[dict[str, Any]]:
    """Encode previously completed source checks without changing their data."""
    return [
        {
            "jamb_name": "Accounting and Finance",
            "finding": "Both Accounting and Finance/Banking and Finance are present in the current national reference scope; the old FIN-only interpretation is no longer the current component set.",
            "disposition": "source_supported_current_combined_scope_but_domain_publication_still_held",
            "components": [
                "Administration and Management::Accounting",
                "Administration and Management::Finance / Banking and Finance",
            ],
            "evidence": [
                evidence(
                    "data/career-mapping/_audit/jamb_accounting_finance_source_context_reconciliation_2026-09-25.md",
                    [
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
                    ],
                    "JAMB Administration printed p. 48 (BCU); JAMB Social Sciences printed p. 576 (FEDOTUOKE); NUC Administration and Management CCMAS component sections",
                    "distinct source-faculty contexts and the separate CCMAS Accounting and Finance curricula",
                )
            ],
            "canonical_edit_applied": False,
        },
        {
            "jamb_name": "Insurance and Actuarial Science",
            "finding": "The current scope contains all 32 Insurance rows and all 35 Actuarial Science rows, matched against the correct component facets. A separate Social Sciences standalone Actuarial Science occurrence is still missing from the offering ledger.",
            "disposition": "source_supported_components; offering_inventory_defect_unresolved",
            "components": [
                "Administration and Management::Insurance",
                "Administration and Management::Actuarial Science",
            ],
            "evidence": [
                evidence(
                    "data/career-mapping/_audit/insurance_actuarial_ccmas_crosswalk_audit_2026-09-28_001.md",
                    [
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
                    ],
                    "NUC printed pp. 54-73 and 307-328; JAMB Administration Administration.txt:1630-1634",
                    "complete separate Insurance and Actuarial course inventories and field-level course evidence",
                ),
                evidence(
                    "data/career-mapping/_audit/insurance_actuarial_offering_context_audit_2026-09-28_002.md",
                    ["https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"],
                    "JAMB Social Sciences printed p. 580; Social Management Science.txt:283-296",
                    "a distinct standalone Social Sciences Actuarial Science source occurrence that must not be collapsed into the combined Administration title",
                ),
            ],
            "canonical_edit_applied": False,
        },
        {
            "jamb_name": "COMPUTER SCIENCE WITH ECONOMICS",
            "finding": "The current component set includes Computer Science and Economics and active links are withheld. The Computer Science first ten course rows have been source-checked, but the Economics component and the exact JAMB offering context are not yet fully adjudicated.",
            "disposition": "partial_source_support; economics_component_and_offering_context_unresolved",
            "components": ["Computing::Computer Science", "Social Sciences::Economics"],
            "evidence": [
                evidence(
                    "data/career-mapping/_audit/computer_science_economics_cs_courses_001_010_reconciliation_2026_09_29.md",
                    [
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
                    ],
                    "Computing CCMAS course rows GST 111 through COS 101; Economics component remains outside that ten-row check",
                    "Computer Science detail repairs and the existence of a separate Economics CCMAS component, not a complete combined scope",
                ),
                evidence(
                    "data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/coordinator-correction-computer-science-economics-accounting-finance-2026-09-25.md",
                    [
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
                    ],
                    "JAMB Sciences printed p. 452 and Engineering/Environmental/Technology printed p. 336",
                    "distinct similar JAMB titles that must not be merged without offering-context evidence",
                ),
            ],
            "canonical_edit_applied": False,
        },
        {
            "jamb_name": "Political Science / International Law and Diplomacy",
            "finding": "The exact Babcock Social/Management Sciences offering is supported by JAMB, Babcock, and the Political Science/International Relations CCMAS components. The seven-course bounded scope is evidence for the named subject facets, not a full Law/LL.B curriculum; active links remain withheld.",
            "disposition": "source_supported_bounded_components; scope_and_downstream_review_unresolved",
            "components": ["Social Sciences::Political Science", "Social Sciences::International Relations"],
            "evidence": [
                evidence(
                    "data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/row034-political-science-international-law-diplomacy-evidence-checkpoint-2026-09-25.md",
                    [
                        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
                        "https://legacy.babcock.edu.ng/assets/docs/academics/bulletin.pdf",
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
                    ],
                    "JAMB Social Sciences printed p. 574; Babcock bulletin printed pp. 37-42; POL/IRS course and outcome anchors",
                    "both named facets and the boundary excluding a full Law::Law professional-practice curriculum",
                )
            ],
            "canonical_edit_applied": False,
        },
        {
            "jamb_name": "COMPUTER SCIENCE AND MATHEMATICS",
            "finding": "The current scope explicitly includes both Computer Science and Mathematics, with 77 selected reference courses and no unrepresented named facet. D001/D003 have selected course anchors; their absence as exact pairs in the component score catalogue is a provenance disagreement, not evidence that Mathematics was omitted.",
            "disposition": "source_supported_combined_components; score_catalogue_pair_reconciliation_unresolved",
            "components": ["Computing::Computer Science", "Sciences::Mathematics"],
            "evidence": [
                evidence(
                    "data/career-mapping/_audit/jamb_cs_math_combined_scope_checkpoint_2026-09-26_001.md",
                    [
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
                        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
                    ],
                    "both JAMB Sciences identity rows; current scope count 77; selected Computer Science and Mathematics course facets",
                    "the combined curriculum union and zero unrepresented named facets",
                )
            ],
            "canonical_edit_applied": False,
        },
    ]


def main() -> None:
    reconciliation = load(RECON)
    scopes = {row["jamb_name"]: row for row in load(SCOPES)["rows"]}
    domain_map = load(DOMAIN_MAP)
    score_catalogue = load(SCORES)

    domain_catalogue_rows = issue_rows(reconciliation, "domain_link_not_present_in_component_score_catalogue")
    unselected_rows = issue_rows(reconciliation, "domain_link_references_unselected_course")
    held_rows = issue_rows(reconciliation, "mapping_explicitly_held_for_review")
    missing_rows = issue_rows(reconciliation, "selected_course_not_found_in_current_ccmas")
    external_rows = issue_rows(reconciliation, "external_component_requires_source_check")

    unselected_keys = {
        (row["jamb_name"], row["details"].get("domain_id")) for row in unselected_rows
    }
    catalogue_classes: Counter[str] = Counter()
    catalogue_examples: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in domain_catalogue_rows:
        jamb_name = item["jamb_name"]
        details = item["details"]
        link = next(
            (
                row
                for row in domain_map.get(jamb_name, {}).get("links", [])
                if row.get("domain_id") == details.get("domain_id")
                and row.get("match_type") == details.get("match_type")
            ),
            {},
        )
        titles = link.get("scope_course_titles") or []
        selected = selected_titles(scopes.get(jamb_name))
        if (jamb_name, details.get("domain_id")) in unselected_keys:
            classification = "confirmed_unselected_anchor_repair"
        elif not titles:
            classification = "unresolved_no_scope_anchor"
        elif all(norm(title) in selected for title in titles):
            classification = "source_anchored_candidate_catalogue_pair_review"
        else:
            classification = "unresolved_scope_anchor_membership"
        catalogue_classes[classification] += 1
        if len(catalogue_examples[classification]) < 12:
            catalogue_examples[classification].append(
                {
                    "jamb_name": jamb_name,
                    "domain_id": details.get("domain_id"),
                    "match_type": details.get("match_type"),
                    "components": details.get("components", []),
                    "scope_course_titles": titles,
                }
            )

    held_classes: Counter[str] = Counter()
    held_examples: dict[str, list[dict[str, Any]]] = defaultdict(list)
    held_layer_counts: Counter[str] = Counter()
    for item in held_rows:
        row = item["row"]
        details = item["details"]
        scope_review = str(details.get("scope_status") or "").endswith("review_required")
        mapping_review = details.get("mapping_status") == "review_required"
        if scope_review and mapping_review:
            held_layer_counts["both_jamb_ccmas_and_downstream"] += 1
        elif scope_review:
            held_layer_counts["jamb_ccmas_scope_only"] += 1
        elif mapping_review:
            held_layer_counts["downstream_mapping_only"] += 1
        if details.get("mapping_status") == "ready_partial" and row.get("selected_course_count", 0) > 0:
            classification = "component_scope_present_but_publication_hold_needs_downstream_verification"
        elif (
            row.get("selected_course_count", 0) == 0
            and details.get("scope_status") == "full"
            and row.get("mapping_type") in {"A_exact", "C_reclassified"}
        ):
            classification = "full_ccmas_inheritance_without_explicit_jamb_scope_rows"
        elif row.get("selected_course_count", 0) == 0:
            classification = "held_empty_scope_needs_component_scope_review"
        else:
            classification = "held_source_adjudication_required"
        held_classes[classification] += 1
        if len(held_examples[classification]) < 20:
            held_examples[classification].append(
                {
                    "jamb_name": item["jamb_name"],
                    "mapping_type": row.get("mapping_type"),
                    "components": row.get("ccmas_components", []),
                    "selected_course_count": row.get("selected_course_count"),
                    "scope_status": details.get("scope_status"),
                    "mapping_status": details.get("mapping_status"),
                }
            )

    missing_by_name: Counter[str] = Counter(item["jamb_name"] for item in missing_rows)
    external_by_name: dict[str, dict[str, Any]] = {}
    for item in external_rows:
        row = item["row"]
        external_by_name[item["jamb_name"]] = {
            "jamb_name": item["jamb_name"],
            "components": row.get("ccmas_components", []),
            "selected_course_not_found_count": missing_by_name.get(item["jamb_name"], 0),
            "disposition": "unresolved_external_curriculum_evidence_required",
            "reason": "A custom/external component is named, but the current reconciliation has no authoritative external curriculum record sufficient to establish its selected courses and outcomes.",
        }

    named = named_case_evidence()
    out_index = next_increment()
    stem = f"{OUT_PREFIX}{out_index:03d}"
    out_json = AUDIT / f"{stem}.json"
    out_md = AUDIT / f"{stem}.md"

    counts = {
        "domain_catalogue_mismatch_total": len(domain_catalogue_rows),
        "domain_catalogue_source_anchored_candidate": catalogue_classes["source_anchored_candidate_catalogue_pair_review"],
        "domain_catalogue_confirmed_unselected_anchor_repair": catalogue_classes["confirmed_unselected_anchor_repair"],
        "domain_catalogue_unresolved_no_scope_anchor": catalogue_classes["unresolved_no_scope_anchor"],
        "domain_catalogue_unresolved_scope_anchor_membership": catalogue_classes["unresolved_scope_anchor_membership"],
        "unselected_domain_link_occurrences": len(unselected_rows),
        "held_mapping_occurrences": len(held_rows),
        "held_component_scope_present_but_held": held_classes["component_scope_present_but_publication_hold_needs_downstream_verification"],
        "held_full_ccmas_inheritance_without_explicit_scope": held_classes["full_ccmas_inheritance_without_explicit_jamb_scope_rows"],
        "held_empty_scope": held_classes["held_empty_scope_needs_component_scope_review"],
        "held_other_source_review": held_classes["held_source_adjudication_required"],
        "held_jamb_ccmas_scope_review": held_layer_counts["jamb_ccmas_scope_only"] + held_layer_counts["both_jamb_ccmas_and_downstream"],
        "held_downstream_mapping_only": held_layer_counts["downstream_mapping_only"],
        "held_both_jamb_ccmas_and_downstream": held_layer_counts["both_jamb_ccmas_and_downstream"],
        "selected_course_not_found_occurrences": len(missing_rows),
        "external_component_occurrences": len(external_rows),
        "external_component_distinct_names": len(external_by_name),
    }

    report = {
        "schema": "2026-09-29.jamb-ccmas-residual-mapping-lane-3.v1",
        "generated_on": date.today().isoformat(),
        "status": "semantic_residual_lane_complete_for_current_local_evidence_source_adjudication_open",
        "append_only_increment": out_index,
        "canonical_mappings_edited": False,
        "scope": {
            "input_reconciliation": str(RECON.relative_to(ROOT.parent)),
            "jamb_names_in_reconciliation": len(reconciliation["rows"]),
            "course_detail_rows_inspected": 0,
            "course_detail_rows_explicitly_excluded": 2442,
            "focus": [
                "combined_or_partial_component_coverage",
                "domain links absent from component score catalogue",
                "domain links referencing unselected courses",
                "held mappings",
                "selected courses not found in current CCMAS",
                "external/custom components",
            ],
        },
        "counts": counts,
        "catalogue_mismatch_classification": {
            "counts": dict(catalogue_classes),
            "examples": dict(catalogue_examples),
            "interpretation": {
                "source_anchored_candidate_catalogue_pair_review": "The JAMB-specific link has course-title anchors that are present in its selected scope. This supports retaining it as a candidate, but does not prove the direct/functional/adjacent label or permit automatic promotion.",
                "confirmed_unselected_anchor_repair": "The link names at least one course title outside the selected scope. Its anchor set must be corrected or the link withheld; no canonical edit was made here.",
                "unresolved_no_scope_anchor": "There is no item-specific course anchor in the current link, so the catalogue mismatch cannot be resolved from this local evidence.",
            },
        },
        "held_mapping_classification": {
            "counts": dict(held_classes),
            "layer_counts": dict(held_layer_counts),
            "examples": dict(held_examples),
            "interpretation": "A ready_partial status with selected courses means component evidence exists, not that downstream links are approved. An exact or reclassified identity with full CCMAS inheritance does not need duplicated selected-course rows. Other empty held scopes require a bounded component-scope review; neither state is changed by this lane.",
        },
        "source_supported_named_cases": named,
        "external_component_cases": list(sorted(external_by_name.values(), key=lambda row: row["jamb_name"].casefold())),
        "selected_course_not_found_by_jamb_name": dict(sorted(missing_by_name.items(), key=lambda item: item[0].casefold())),
        "unselected_domain_link_cases": [
            {"jamb_name": item["jamb_name"], "details": item["details"]}
            for item in unselected_rows
        ],
        "unresolved_rules": [
            "Do not infer a combined curriculum from a title alone.",
            "Do not remove a JAMB-specific domain link merely because its exact pair is absent from a component score catalogue when selected course anchors exist; review the link's course evidence and match type first.",
            "Do not promote a source-anchored candidate to the student view until the direct/functional/adjacent label and downstream descendants are verified.",
            "A custom/external component remains unresolved until an authoritative curriculum source supplies enough course/outcome evidence; JAMB title presence alone is insufficient.",
            "This checkpoint is audit-only and does not edit canonical mappings, seeds, SQL, or downstream records.",
        ],
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"# Residual JAMB–CCMAS semantic mapping lane 3 — increment {out_index:03d}",
        "",
        "Audit-only checkpoint. Canonical mappings were not edited. The 2,442 course-detail records were excluded; this lane classifies only semantic mapping exceptions from the current reconciliation.",
        "",
        "## Scope and counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += [
        "",
        "## Deterministic interpretation",
        "",
        f"- **{catalogue_classes['source_anchored_candidate_catalogue_pair_review']}** catalogue-pair mismatches have selected course-title anchors. They are candidate links requiring semantic label review, not automatic deletions.",
        f"- **{catalogue_classes['confirmed_unselected_anchor_repair']}** catalogue-pair mismatches also reference unselected course titles. These are confirmed anchor-repair candidates.",
        f"- **{catalogue_classes['unresolved_no_scope_anchor']}** have no current item-specific course anchor and remain unresolved.",
        "",
        "## Named combined/partial cases",
        "",
    ]
    for item in named:
        lines += [f"### {item['jamb_name']}", "", f"- **Disposition:** `{item['disposition']}`", f"- {item['finding']}", f"- **Components:** {', '.join(item['components'])}", "- **Evidence:**"]
        for ev in item["evidence"]:
            lines.append(f"  - `{ev['checkpoint']}` — {ev['locator']}; supports {ev['supports']}. URLs: {', '.join(ev['source_urls'])}")
        lines.append("")
    lines += [
        "## External and missing-course cases",
        "",
        "The six custom/external names remain unresolved. Their JAMB identities may be present, but the current local reconciliation does not contain authoritative external curriculum evidence sufficient to establish selected courses and outcomes. They must not be marked unavailable solely because a CCMAS anchor is absent.",
        "",
        "## Boundary",
        "",
        "This checkpoint separates source-supported current component coverage from unresolved semantic or provenance work. It is not a canonical fix, seed regeneration, SQL deployment, or student-view approval.",
        "",
    ]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
