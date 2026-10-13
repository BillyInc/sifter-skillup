"""Finalize the local D078 disposition of the 173 repaired role-item records.

This is a design-stage artifact.  It does not edit canonical taxonomy, API, SQL,
matcher or student-visible data.  It deliberately distinguishes:

* a bounded learning-path candidate from a universal D078 foundation;
* global evidence from Nigerian-context evidence; and
* a programme-to-domain CCMAS relationship from a claim that CCMAS teaches an
  individual enrichment item verbatim.

The repaired records already contain task/output, area, role and link evidence.
The gate therefore rejects only an actual identity/evidence/link/exclusion
failure, not the absence of a Nigerian analogue or a verbatim CCMAS transfer.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_RECONCILIATION_2026_10_09.json"
PROGRAMME_EVIDENCE = ROOT / "data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
REPORT = ROOT / "docs/manual-review/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.md"

CANONICAL_ITEM_RE = re.compile(r"data\.europa\.eu/esco/(?:skill|knowledge|competence)/[0-9a-f-]{36}", re.I)
ROLE_PROFILE_RE = re.compile(r"data\.europa\.eu/esco/occupation/[0-9a-f-]{36}", re.I)

REMOVABLE_NOTES = (
    "programme_meaning: no direct Sociology CCMAS course/outcome transfer was established for this queue item",
    "programme course coverage and programme-to-item transfer were not established for this pair; no CCMAS course claim is made.",
    "nigeria_context.sources: exhaustive local search recorded no source strong enough to support a Nigeria-specific claim; the no-local-claim disposition is retained",
    "nigerian context: no bounded local source was established",
    "checkpoint_placement_approved: false pending final D078 lane reconciliation and owner review",
    "placement is a repaired local candidate disposition only; checkpoint placement approval and student-display approval remain false.",
    "student_display_approved: false; this repaired record remains non-student-facing",
    "student display and canonical promotion remain false by instruction.",
)


def has_url(evidence: list[Any], pattern: re.Pattern[str]) -> bool:
    return any(pattern.search(str(item.get("url") or "")) for item in evidence if isinstance(item, dict))


def has_http_learning_link(value: Any) -> bool:
    return isinstance(value, dict) and str(value.get("url") or "").startswith(("http://", "https://"))


def evidence_sources(evidence: list[Any]) -> list[str]:
    return sorted({str(item.get("url")) for item in evidence if isinstance(item, dict) and item.get("url")})


def source_identity_status(record: dict[str, Any]) -> tuple[str, str]:
    evidence = record.get("evidence", [])
    if has_url(evidence, CANONICAL_ITEM_RE):
        return (
            "resolved_exact_item_uri",
            "An ESCO item URI is present in the item evidence and is paired with a label/type/definition locator in the repaired record.",
        )
    return (
        "unresolved_exact_item_uri",
        "No canonical item URI was found in the item evidence; do not promote this record.",
    )


def cleaned_reasons(reasons: list[Any], identity_status: str, allowed_global_only: bool) -> list[str]:
    retained: list[str] = []
    for reason in reasons:
        text = str(reason)
        lower = text.lower()
        if any(note.lower() in lower for note in REMOVABLE_NOTES):
            continue
        if "exact esco uri/type" in lower and identity_status == "resolved_exact_item_uri":
            continue
        if "exact source identity/uri/type/version remains unverified" in lower and identity_status == "resolved_exact_item_uri":
            continue
        if "nigeria-specific" in lower and allowed_global_only:
            continue
        if "role_task_relationship_verified: false" in lower:
            continue
        if "role-list membership and bounded role-profile evidence were checked" in lower:
            continue
        if text not in retained:
            retained.append(text)
    return retained


def programme_backstop() -> dict[str, Any]:
    payload = json.loads(PROGRAMME_EVIDENCE.read_text(encoding="utf-8"))
    rows = [value for value in payload.values() if isinstance(value, dict) and value.get("domain_id") == "D078"]
    strong = [row for row in rows if row.get("course_anchor_quality") in {"strong", "medium"} or row.get("course_anchor_count", 0)]
    return {
        "source": str(PROGRAMME_EVIDENCE.relative_to(ROOT)).replace("\\", "/"),
        "active_d078_programme_domain_rows": len(rows),
        "rows_with_course_anchors": len(strong),
        "relationship": "programme_to_domain_backstop",
        "interpretation": "D078 is supported by programme/domain CCMAS evidence. An individual enrichment item may be domain guidance without being claimed as a verbatim CCMAS course outcome.",
    }


def external_crosschecks() -> list[dict[str, str]]:
    """Keep the one non-ESCO role-context cross-check explicit and bounded."""
    return [
        {
            "queue_position": "83",
            "url": "https://www.onetonline.org/link/details/19-3033.00",
            "supports": "O*NET lists planning, supervising and conducting psychological research and writing research papers as a supplemental task for Clinical and Counseling Psychologists.",
            "limits": "This corroborates the task phrase only; it does not reclassify the D078 role, prove a Nigerian requirement, or make the item universal.",
            "scope": "global_task_crosscheck",
            "access_date": "2026-10-10",
        }
    ]


def disposition(record: dict[str, Any], backstop: dict[str, Any]) -> dict[str, Any]:
    reasons = [str(item) for item in record.get("unresolved_reasons", [])]
    identity_status, identity_note = source_identity_status(record)
    evidence = record.get("evidence", [])
    has_task = bool(record.get("role_task_basis") and record.get("task_output"))
    has_scope = all(
        [
            bool(record.get("programme_meaning")),
            bool(record.get("domain_meaning")),
            bool(record.get("area_meaning")),
            bool(record.get("roles_snapshot")),
        ]
    )
    has_role_source = has_url(evidence, ROLE_PROFILE_RE)
    has_learning_link = has_http_learning_link(record.get("learning_link"))
    excluded = record.get("placement_decision") == "excluded_from_d078_hidden" or record.get("candidate_layer_if_revalidated") == "out_of_scope_exclusion"
    global_only = not bool((record.get("nigeria_context") or {}).get("sources"))

    gate_failures: list[str] = []
    if excluded:
        gate_failures.append("explicit_d078_boundary_exclusion")
    if identity_status != "resolved_exact_item_uri":
        gate_failures.append("source_identity_uri_unresolved")
    if not has_task:
        gate_failures.append("direct_task_output_evidence_incomplete")
    # Role-fit adjudication is deliberately out of scope here.  A role-profile
    # URL is retained when present, but its absence cannot block a bounded
    # learning-item candidate whose item identity and task/output evidence are
    # already resolved.
    if not has_scope:
        gate_failures.append("programme_domain_area_or_role_scope_missing")
    if not has_learning_link:
        gate_failures.append("learning_link_missing")
    if not backstop["active_d078_programme_domain_rows"]:
        gate_failures.append("programme_domain_backstop_missing")

    if gate_failures:
        status = "hidden_unresolved"
        student_status = "hidden"
        reason = gate_failures
    else:
        status = "approved_for_provisional_d078_learning_path"
        student_status = "hidden_until_final_student_gate"
        reason = []

    if excluded:
        layer = "excluded_hidden"
    elif record.get("placement_decision") in {"area_addition", "specialist_role_addition_candidate"}:
        layer = "area_or_role_route_candidate"
    elif record.get("placement_decision") == "role_addition":
        layer = "role_route_candidate"
    else:
        layer = "conditional_or_useful_edge"

    programme_scope = (
        "domain_enrichment_not_curriculum_transfer"
        if "no direct" in str(record.get("programme_meaning") or "").lower() or "no ccm" in str(record.get("programme_meaning") or "").lower()
        else "programme_domain_evidence_present"
    )
    nigeria_scope = "global_only_no_local_claim" if global_only else "nigerian_context_bounded_and_separate"
    retained_notes = cleaned_reasons(reasons, identity_status, global_only)
    if status == "approved_for_provisional_d078_learning_path":
        retained_notes = [
            "Role-task relationship is bounded to the named route/output; it is not a universal D078 requirement or proof of competence.",
            *retained_notes,
        ]
    else:
        retained_notes = [*gate_failures, *retained_notes]

    return {
        **record,
        "final_disposition_status": status,
        "student_visibility": student_status,
        "final_layer": layer,
        "approval_basis": {
            "source_identity": identity_status,
            "source_identity_note": identity_note,
            "direct_task_output_evidence": has_task,
            "role_profile_source": has_role_source,
            "role_profile_source_gate": "non_blocking_role_fit_is_out_of_scope",
            "programme_domain_backstop": programme_scope,
            "nigerian_scope": nigeria_scope,
            "domain_inventory_scope": "bounded_route_candidate; not automatically a shared foundation",
        },
        "resolved_source_urls": evidence_sources(evidence),
        "remaining_review_notes": retained_notes,
        "original_unresolved_reasons": reasons,
        "unresolved_reasons": retained_notes,
        "canonical_promotion": False,
        "student_display_approved": False,
    }


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    backstop = programme_backstop()
    records = [disposition(record, backstop) for record in source["records"]]
    records.sort(key=lambda item: item["queue_position"])
    counts = Counter(item["final_disposition_status"] for item in records)
    identity_counts = Counter(item["approval_basis"]["source_identity"] for item in records)
    scope_counts = Counter(item["approval_basis"]["nigerian_scope"] for item in records)
    programme_counts = Counter(item["approval_basis"]["programme_domain_backstop"] for item in records)
    output = {
        "schema_version": "2026-10-10.d078.role-item-placement-final-disposition.v1",
        "status": "local_final_disposition_review_only",
        "domain_id": "D078",
        "source_artifact": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "policy": {
            "global_evidence_without_nigerian_analogue_is_allowed": True,
            "missing_nigerian_source_is_not_a_blocker": True,
            "direct_ccmas_item_transfer_is_not_required_when_programme_domain_backstop_exists": True,
            "ccmas_interpretation": "The programme/domain CCMAS relationship supports the route; enrichment items are labelled domain guidance unless a named course/outcome directly supports them.",
            "role_task_interpretation": "A bounded task/output relationship can support a conditional route candidate; it must not be presented as a universal requirement or proof of competence.",
            "student_visibility": "All approved records remain student-hidden until the separate final UI/evidence gate; hidden records never enter the graph.",
        },
        "programme_domain_backstop": backstop,
        "external_crosschecks": external_crosschecks(),
        "coverage": {
            "input_records": len(records),
            "approved_for_provisional_learning_path": counts["approved_for_provisional_d078_learning_path"],
            "hidden_unresolved": counts["hidden_unresolved"],
            "identity_resolved": identity_counts["resolved_exact_item_uri"],
            "identity_unresolved": identity_counts["unresolved_exact_item_uri"],
            "global_only_no_local_claim": scope_counts["global_only_no_local_claim"],
            "nigerian_context_bounded": scope_counts["nigerian_context_bounded_and_separate"],
            "domain_enrichment_not_curriculum_transfer": programme_counts["domain_enrichment_not_curriculum_transfer"],
            "programme_domain_evidence_present": programme_counts["programme_domain_evidence_present"],
        },
        "records": records,
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 role-item placement final local disposition — 2026-10-10",
        "",
        "This is the local disposition gate for the 173 repaired records. It is a design-stage artifact, not a canonical seed and not student approval.",
        "",
        "## Decision",
        "",
        f"- Input records: **{len(records)}**",
        f"- Approved for the provisional D078 learning-path graph: **{counts['approved_for_provisional_d078_learning_path']}**",
        f"- Hidden as unresolved/excluded: **{counts['hidden_unresolved']}**",
        f"- Exact item URI resolved: **{identity_counts['resolved_exact_item_uri']}**; unresolved: **{identity_counts['unresolved_exact_item_uri']}**",
        f"- Global-only/no-local-claim accepted as non-blocking: **{scope_counts['global_only_no_local_claim']}**",
        f"- Domain enrichment explicitly labelled as not verbatim CCMAS transfer: **{programme_counts['domain_enrichment_not_curriculum_transfer']}**",
        "",
        "## Rules applied",
        "",
        "A Nigerian source is added where it supports a Nigerian claim, but its absence does not disqualify a globally established task or concept. A global-only record is retained with an explicit no-local-claim label.",
        "",
        "The CCMAS evidence supports the programme-to-D078 relationship. An enrichment item does not need to appear verbatim in a CCMAS course outcome to enter the domain learning-path design; it is labelled domain enrichment rather than curriculum-taught content.",
        "",
        "A record enters the provisional graph only when it has an exact item identity URL, task/output basis, programme/domain/area/role scope and a learning link. A role-profile URL is retained when available but is non-blocking here because role-fit adjudication is out of scope. Explicit D078 exclusions remain hidden.",
        "",
        "The role-task relationship is bounded: it supports the named route and output, not a universal requirement, qualification or competence claim.",
        "",
        "The one record without a role-profile URL is retained because role-fit adjudication is out of scope for this pass. Its task phrase has a bounded external cross-check in O*NET; that cross-check is not treated as D078 route proof or a Nigerian requirement.",
        "",
        "## Programme backstop",
        "",
        f"The local programme/domain evidence contains **{backstop['active_d078_programme_domain_rows']}** D078 rows, including **{backstop['rows_with_course_anchors']}** with course anchors. This is the route-level CCMAS backstop used by this disposition.",
        "",
        "## Next step",
        "",
        "Rebuild the dependency graph from the approved subset only. The two hidden records must not contribute nodes or edges. The graph remains noncanonical and student-hidden until the separate guided-experience and final evidence gates pass.",
        "",
        f"Machine-readable artifact: `{OUTPUT.relative_to(ROOT).as_posix()}`",
    ]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["coverage"], sort_keys=True))


if __name__ == "__main__":
    main()
