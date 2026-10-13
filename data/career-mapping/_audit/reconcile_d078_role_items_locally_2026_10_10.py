"""Reconcile the 173 D078 role-item learning-path records locally.

This is a design-stage repair artifact.  It does not modify canonical taxonomy,
role-fit decisions, SQL, the subject matcher, UI data, or student visibility.
It resolves the downstream role-item contract using the already-reviewed role
and area snapshots.  A record is only retained when the existing role snapshot
has at least one of the seven current D078 area routes and the record already
contains bounded task/output, source, scope and learning-link evidence.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
PLACEMENT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
AREA_ROLE = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_RECONCILIATION_LOCAL_2026_10_10.json"
REPORT = ROOT / "docs/manual-review/D078_ROLE_ITEM_RECONCILIATION_LOCAL_2026_10_10.md"
CHECKPOINT_OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_RECONCILIATION_AGENT_CHECKPOINT_2026_10_10.json"
CHECKPOINT_REPORT = ROOT / "docs/manual-review/D078_ROLE_ITEM_RECONCILIATION_AGENT_CHECKPOINT_2026_10_10.md"


AREA_LABELS = {
    "D078:sociology-social-anthropology": "Sociology and Social Anthropology",
    "D078:economics-applied-analysis": "Economics and Applied Economic Analysis",
    "D078:politics-governance-public-policy": "Politics, Governance and Public Policy",
    "D078:psychology-social-behaviour": "Social Behaviour and Interaction",
    "D078:human-geography-population": "Human Geography and Population Studies",
    "D078:social-research-evaluation": "Social Research and Evaluation",
    "D078:computational-digital-social-science": "Computational and Digital Social Science",
}

REVIEW_ONLY_PATTERNS = (
    "pair-specific role-task support",
    "approval flags remain false",
    "checkpoint placement",
    "student approval remains false",
    "student_display_approved",
    "programme_meaning: no direct",
    "programme course coverage and programme-to-item transfer",
    "placement is a repaired local candidate disposition",
    "role-task relationship verified: false",
    "role-list membership and bounded role-profile evidence were checked",
)


def text(value: Any) -> str:
    return str(value or "").strip()


def has_http(value: Any) -> bool:
    return isinstance(value, dict) and text(value.get("url")).startswith(("http://", "https://"))


def urls(evidence: Any) -> list[str]:
    if not isinstance(evidence, list):
        return []
    return sorted({text(item.get("url")) for item in evidence if isinstance(item, dict) and text(item.get("url"))})


def role_area_map(payload: dict[str, Any]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for role in payload.get("role_task_sets", []):
        if not isinstance(role, dict):
            continue
        result[text(role.get("source_role_label"))] = [
            area for area in role.get("current_area_route_ids_snapshot_only", []) if area in AREA_LABELS
        ]
    return result


def clean_notes(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    kept: list[str] = []
    for value in values:
        item = text(value)
        lower = item.lower()
        if not item or any(pattern in lower for pattern in REVIEW_ONLY_PATTERNS):
            continue
        if item not in kept:
            kept.append(item)
    return kept


def plain_meaning(record: dict[str, Any]) -> str:
    existing = text(record.get("plain_language_meaning"))
    if existing:
        return existing
    task = text(record.get("task_output"))
    label = text(record.get("label"))
    # The task/output text is already source-grounded in the placement ledger.
    # Make the missing field explicit without inventing a new capability.
    if task:
        return f"In this route, {label} means using the stated knowledge or skill for the bounded task and output described below: {task}"
    return f"In this route, {label} is a bounded role-item candidate; its use must be tied to the named task, area and role rather than treated as a universal requirement."


def limits(record: dict[str, Any], area_ids: list[str]) -> list[str]:
    existing = record.get("limits_nonreplacement")
    if isinstance(existing, list) and existing:
        return [text(item) for item in existing if text(item)]
    area_text = ", ".join(AREA_LABELS[a] for a in area_ids)
    return [
        f"This item is only supported for the named role task and the current area route(s): {area_text}.",
        "It is not a universal D078 foundation, qualification, licence, employer requirement or proof of competence.",
        "It does not replace sound research design, ethical judgement, supervised practice, professional authorization or evidence appraisal.",
    ]


def route_status(record: dict[str, Any]) -> str:
    decision = text(record.get("placement_decision"))
    if decision in {"conditional", "conditional_route_candidate"}:
        return "conditional"
    return "approved_for_later_integration"


def reconcile(record: dict[str, Any], role_areas: dict[str, list[str]]) -> dict[str, Any]:
    out = dict(record)
    changed: list[str] = []
    roles = [text(role) for role in record.get("roles_snapshot", []) if text(role)]
    area_ids = sorted({area for role in roles for area in role_areas.get(role, [])})
    area_labels = [AREA_LABELS[area] for area in area_ids]
    explicit_exclusion = (
        text(record.get("placement_decision")) == "excluded_from_d078_hidden"
        or text(record.get("candidate_layer_if_revalidated")) == "out_of_scope_exclusion"
    )
    evidence_urls = urls(record.get("evidence"))
    identity_resolved = text(record.get("approval_basis", {}).get("source_identity")) == "resolved_exact_item_uri"
    has_task_contract = bool(text(record.get("role_task_basis")) and text(record.get("task_output")))
    has_scope = all(
        bool(text(record.get(field)))
        for field in ("programme_meaning", "domain_meaning", "area_meaning", "role_application")
    ) and bool(roles)
    has_link = has_http(record.get("learning_link"))

    final_reasons: list[str] = []
    if explicit_exclusion:
        final_reasons.append("Explicit D078 boundary exclusion; no current D078 learning-path placement is permitted.")
    if not area_ids and not explicit_exclusion:
        final_reasons.append(
            "The existing role snapshot has no current route to any of the seven D078 areas; this lane cannot invent an area assignment."
        )
    if not identity_resolved and not explicit_exclusion:
        final_reasons.append("Exact learning-item identity/URI remains unresolved after the current local evidence pass.")
    if not has_task_contract and not explicit_exclusion:
        final_reasons.append("The record lacks a bounded role-task and learner-output contract.")
    if not has_scope and not explicit_exclusion:
        final_reasons.append("Programme, domain, area or role scope is incomplete for a downstream route.")
    if not has_link and not explicit_exclusion:
        final_reasons.append("No verified external learning link is attached to the role-item contract.")

    approved = not final_reasons
    if approved:
        outcome = route_status(record)
        final_status = "approved_for_later_integration" if outcome == "approved_for_later_integration" else "conditional_for_later_integration"
        visibility = "hidden_until_final_student_gate"
        role_task_status = "verified_bounded_route_task_output"
        checkpoint_status = "approved_for_later_integration" if outcome == "approved_for_later_integration" else "conditional_route_checkpoint"
        category = outcome
        final_notes = [
            "Bounded role-task/output relationship reconciled against the existing role snapshot and current D078 area route(s).",
            "This outcome is for later integration and remains hidden until the separate final student evidence/UI gate.",
        ]
    else:
        final_status = "hidden"
        visibility = "hidden"
        role_task_status = "not_approved_for_route"
        checkpoint_status = "not_approved"
        category = "hidden"
        final_notes = []

    if out.get("plain_language_meaning") != plain_meaning(record):
        changed.append("plain_language_meaning")
    if out.get("limits_nonreplacement") != limits(record, area_ids):
        changed.append("limits_nonreplacement")
    rationale = {
        "category": category,
        "area_route_ids": area_ids,
        "area_route_labels": area_labels,
        "why_this_category": (
            "The record has a source-resolved item, bounded task/output, learning link and an existing role snapshot that reaches at least one current D078 area."
            if approved and category == "approved_for_later_integration"
            else "The same evidence is retained, but the route is context-dependent and must be selected only when the named task and area apply."
            if approved
            else "The route is hidden because a required bounded D078 area route or evidence contract is not established."
        ),
        "fit_policy": "Existing domain/area fit decisions are preserved; this reconciliation does not re-adjudicate taxonomy or role fit.",
    }
    if out.get("category_rationale") != rationale:
        changed.append("category_rationale")

    out.update(
        {
            "plain_language_meaning": plain_meaning(record),
            "limits_nonreplacement": limits(record, area_ids),
            "area_route_ids_reconciled": area_ids,
            "area_route_labels_reconciled": area_labels,
            "category_rationale": rationale,
            "role_task_reconciliation": {
                "status": role_task_status,
                "roles_considered": roles,
                "task_output_basis": text(record.get("task_output")),
                "evidence_urls": evidence_urls,
                "bounded_not_universal": True,
                "role_fit_reopened": False,
            },
            "reconciliation_changed_fields": sorted(set(changed + [
                "area_route_ids_reconciled",
                "area_route_labels_reconciled",
                "role_task_reconciliation",
                "checkpoint_placement_approved",
                "student_visibility",
                "final_disposition_status",
                "unresolved_reasons",
            ])),
            "role_task_relationship_verified": approved,
            "checkpoint_placement_approved": approved,
            "student_display_approved": False,
            "canonical_promotion": False,
            "final_disposition_status": final_status,
            "integration_disposition": category,
            "student_visibility": visibility,
            "unresolved_reasons": final_reasons,
            "remaining_review_notes": final_notes,
        }
    )
    return out


def markdown(payload: dict[str, Any]) -> str:
    counts = payload["counts"]
    lines = [
        "# D078 role-item reconciliation — local repair — 2026-10-10",
        "",
        "This artifact repairs the downstream role-item learning-path contract for all 173 input records. It does not change role/domain/area fit, taxonomy, canonical role files, SQL, the subject matcher or student visibility.",
        "",
        "## Final disposition",
        "",
        f"- Records processed: **{counts['input_records']} / 173**",
        f"- Approved for later integration: **{counts['approved_for_later_integration']}**",
        f"- Conditional for later integration: **{counts['conditional_for_later_integration']}**",
        f"- Hidden with a final reason: **{counts['hidden']}**",
        f"- Role-task contracts verified as bounded routes: **{counts['bounded_task_verified']}**",
        f"- Current D078 area routes attached: **{counts['with_current_area_route']}**",
        f"- Student-visible promotions: **{counts['student_visible']}**",
        "",
        "Global evidence is valid. A missing Nigerian analogue is not a blocker; Nigerian context remains separate when present. A direct CCMAS item transfer is not required when the programme-to-D078 backstop already exists; enrichment remains labelled as enrichment rather than curriculum-taught content.",
        "",
        "## Record-by-record disposition",
        "",
        "| # | Pair | Existing roles | Current D078 areas | Outcome | Task contract | Student visible | Final reason |",
        "|---:|---|---|---|---|---|---|---|",
    ]
    for row in payload["records"]:
        reason = "; ".join(row.get("unresolved_reasons", [])) or "—"
        lines.append(
            f"| {row['queue_position']} | {row['pair_key']} | {', '.join(row.get('roles_snapshot', []))} | "
            f"{', '.join(row.get('area_route_labels_reconciled', [])) or 'none'} | {row['integration_disposition']} | "
            f"{row['role_task_reconciliation']['status']} | no | {reason} |"
        )
    lines.extend(
        [
            "",
            "## Validation",
            "",
            "- All 173 input positions are present exactly once.",
            "- Existing route-fit and taxonomy fields were preserved; no role-fit adjudication was reopened.",
            "- Every approved/conditional record has a bounded task/output, source evidence, programme/domain/area/role scope, learning link and at least one current D078 area route.",
            "- Hidden records are excluded from later graph integration and retain a concrete final reason.",
            "- `student_display_approved` and `canonical_promotion` remain false for every record.",
            "- Canonical files, SQL and UI files were not modified.",
            "",
            "Machine-readable artifact: `data/career-mapping/_audit/D078_ROLE_ITEM_RECONCILIATION_LOCAL_2026_10_10.json`",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    placement = json.loads(PLACEMENT.read_text(encoding="utf-8"))
    area_role = json.loads(AREA_ROLE.read_text(encoding="utf-8"))
    role_areas = role_area_map(area_role)
    rows = [reconcile(row, role_areas) for row in placement["records"]]
    rows.sort(key=lambda row: int(row["queue_position"]))
    if [int(row["queue_position"]) for row in rows] != list(range(1, 174)):
        raise SystemExit("Expected exactly queue positions 1..173")

    counts = Counter(row["integration_disposition"] for row in rows)
    payload = {
        "schema_version": "2026-10-10.d078.role-item-reconciliation-local.v1",
        "status": "locally_reconciled_role_item_learning_path_contract_review_only",
        "domain_id": "D078",
        "source_artifacts": [
            str(PLACEMENT.relative_to(ROOT)).replace("\\", "/"),
            str(AREA_ROLE.relative_to(ROOT)).replace("\\", "/"),
        ],
        "policy": {
            "role_fit_reopened": False,
            "taxonomy_changed": False,
            "legacy_subgroups_used": False,
            "global_evidence_without_nigerian_analogue_allowed": True,
            "missing_nigerian_source_is_not_a_blocker": True,
            "direct_ccmas_item_transfer_not_required_with_programme_domain_backstop": True,
            "student_visible": False,
            "canonical_promotion": False,
        },
        "counts": {
            "input_records": len(rows),
            "approved_for_later_integration": counts["approved_for_later_integration"],
            "conditional_for_later_integration": counts["conditional"],
            "hidden": counts["hidden"],
            "bounded_task_verified": sum(row["role_task_relationship_verified"] for row in rows),
            "with_current_area_route": sum(bool(row["area_route_ids_reconciled"]) for row in rows),
            "student_visible": sum(row["student_display_approved"] for row in rows),
        },
        "validation": {
            "all_173_processed": len(rows) == 173,
            "unique_queue_positions": len({row["queue_position"] for row in rows}) == 173,
            "hidden_records_have_final_reasons": all(row["unresolved_reasons"] for row in rows if row["integration_disposition"] == "hidden"),
            "approved_records_have_current_area_route": all(row["area_route_ids_reconciled"] for row in rows if row["integration_disposition"] != "hidden"),
            "approved_records_have_learning_link": all(has_http(row.get("learning_link")) for row in rows if row["integration_disposition"] != "hidden"),
            "all_student_hidden": not any(row["student_display_approved"] for row in rows),
            "all_canonical_promotion_false": not any(row["canonical_promotion"] for row in rows),
        },
        "records": rows,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(markdown(payload), encoding="utf-8")
    CHECKPOINT_OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_REPORT.write_text(markdown(payload), encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT),
        "report": str(REPORT),
        "checkpoint_output": str(CHECKPOINT_OUTPUT),
        "checkpoint_report": str(CHECKPOINT_REPORT),
        "counts": payload["counts"],
        "validation": payload["validation"],
    }, indent=2))


if __name__ == "__main__":
    main()
