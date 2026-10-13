"""Build the D078 learning-path placement continuation for queue 137-173.

This is a local, review-only handoff.  It joins the authoritative read-only
source-research records for 137-144 with the source-backed enrichment records
for 145-173, while preserving conflicting records from the damaged recovery
artifact as orphans.  It never promotes student data and never edits canonical
taxonomy, UI/API/SQL, or subject-matcher files.
"""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
RECOVERY = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_087-173_RECOVERY_2026_10_09.json"
RESEARCH = ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-133-144.json"
MERGE = ROOT / "data/career-mapping/_audit/d078_final_enrichment_lane_merge_2026_10_09.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_CONTINUATION_137-173_2026_10_09.json"
MARKDOWN = ROOT / "docs/manual-review/D078_ROLE_ITEM_PLACEMENT_CONTINUATION_137-173_2026_10_09.md"

START = 137
END = 173
EXPECTED = list(range(START, END + 1))

CONTROL_DOCS = [
    "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md",
    "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md",
    "docs/manual-review/D078_GUIDED_EXPERIENCE_FLOW_AND_STATE_PLAN_2026_10_09.md",
    "docs/manual-review/D078_GUIDED_EXPERIENCE_GRANULAR_UX_AUDIT_AND_MOCKUP_2026_10_09.md",
    "docs/manual-review/D078_COMPLETE_LEARNING_PATH_NAVIGATION_AND_CORRECTNESS_CHECKPOINT_2026_10_09.md",
    "docs/manual-review/D078_EVIDENCE_RESOLUTION_BEFORE_LEARNING_PATH_2026_10_09.md",
    "docs/manual-review/D078_LEARNING_PATH_RECONCILIATION_2026_10_08.md",
]

DOMAIN_MEANING = (
    "D078 Social Sciences & Behavioural Research studies people, groups, "
    "institutions, social patterns and evidence about them. This record is "
    "limited to the named task and route; it is not a shared foundation or "
    "a promise of readiness."
)

PROGRAMME_MEANING = (
    "The Sociology programme is not being represented as teaching this item. "
    "It is additional, route-specific learning only if a later checkpoint "
    "approves the connection; no CCMAS course claim is made here."
)

DECISIONS = {
    137: "conditional_route",
    138: "area_of_specialization_addition",
    139: "conditional_route",
    140: "conditional_route",
    141: "conditional_route",
    142: "hidden_review_required",
    143: "hidden_review_required",
    144: "role_specific_addition",
    145: "role_specific_addition",
    146: "area_of_specialization_addition",
    147: "conditional_route",
    148: "hidden_review_required",
    149: "conditional_route",
    150: "conditional_route",
    151: "area_of_specialization_addition",
    152: "hidden_review_required",
    153: "hidden_review_required",
    154: "conditional_route",
    155: "conditional_route",
    156: "conditional_route",
    157: "role_specific_addition",
    158: "role_specific_addition",
    159: "conditional_route",
    160: "hidden_review_required",
    161: "role_specific_addition",
    162: "area_of_specialization_addition",
    163: "conditional_route",
    164: "conditional_route",
    165: "area_of_specialization_addition",
    166: "conditional_route",
    167: "conditional_route",
    168: "conditional_route",
    169: "area_of_specialization_addition",
    170: "area_of_specialization_addition",
    171: "conditional_route",
    172: "conditional_route",
    173: "area_of_specialization_addition",
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def nonempty_strings(values: Any) -> list[str]:
    result: list[str] = []
    for value in as_list(values):
        if isinstance(value, str) and value.strip():
            result.append(value.strip())
        elif value is not None and not isinstance(value, (dict, list)):
            result.append(str(value))
    return result


def strip_queue_prefix(pair_key: str) -> str:
    parts = pair_key.split("|", 1)
    return parts[1] if len(parts) == 2 and parts[0].strip().isdigit() else pair_key


def evidence_entry(source: str, value: Any, *, kind: str = "source-backed") -> dict[str, Any] | None:
    if value is None:
        return None
    if isinstance(value, list):
        return None
    if isinstance(value, str):
        return {"source": source, "supports": value, "limits": "Scope remains as stated in the source artifact.", "evidence_kind": kind}
    if isinstance(value, dict):
        entry = deepcopy(value)
        entry.setdefault("source", source)
        entry.setdefault("evidence_kind", kind)
        return entry
    return {"source": source, "supports": str(value), "evidence_kind": kind}


def evidence_list(value: Any, source: str) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for item in as_list(value):
        entry = evidence_entry(source, item)
        if entry:
            result.append(entry)
    return result


def area_meaning(area_context: Any) -> str:
    if isinstance(area_context, list) and area_context:
        labels = ", ".join(area_context)
    elif isinstance(area_context, str) and area_context.strip():
        labels = area_context
    else:
        labels = "No current D078 area route is established in the source record."
    return (
        f"Current area context: {labels}. This is a route snapshot, not an approval. "
        "The item is shown here only to document where a later area-specific review "
        "may be needed; it must not be treated as universal across the area."
    )


def learning_link(value: Any) -> dict[str, Any]:
    if isinstance(value, dict) and value.get("url"):
        return {
            "state": "candidate_review_only",
            "title": value.get("title"),
            "url": value.get("url"),
            "locator": value.get("locator"),
            "access_date": value.get("access_date", "2026-10-09"),
            "fit_limit": value.get("fit_limit") or value.get("fit") or value.get("limits"),
            "source_state": value.get("url_state") or value.get("status"),
        }
    if isinstance(value, dict) and value.get("state"):
        return deepcopy(value)
    return {
        "state": "none_verified",
        "url": None,
        "locator": None,
        "fit_limit": "No task-specific learning link was verified in the source pass; keep hidden.",
    }


def common_record(position: int, pair_key: str, priority: str, role: str | None, area_context: Any) -> dict[str, Any]:
    return {
        "queue_position": position,
        "pair_key": pair_key,
        "priority_snapshot": priority,
        "role": role,
        "area_context": deepcopy(area_context),
        "programme_meaning": PROGRAMME_MEANING,
        "domain_meaning": DOMAIN_MEANING,
        "area_meaning": area_meaning(area_context),
        "placement_decision": "hidden_review_required",
        "candidate_layer_if_revalidated": DECISIONS[position],
        "student_state": "hidden_review_required",
        "checkpoint_placement_approved": False,
        "role_task_relationship_verified": False,
        "student_display_approved": False,
        "approval": False,
    }


def normalize_research(source: dict[str, Any]) -> dict[str, Any]:
    position = int(source["queue_index"])
    pair_key = strip_queue_prefix(source["pair_key"])
    record = common_record(position, pair_key, source.get("priority", "unresolved"), source.get("role"), source.get("area_context"))
    meaning = source.get("meaning_task_output") or "No task/output meaning was established in the source record."
    record.update(
        {
            "item_type": source.get("identity", {}).get("type", "unresolved item type"),
            "exact_identity": deepcopy(source.get("identity", {})),
            "item_meaning": meaning,
            "task_output": meaning,
            "role_application": (
                f"{source.get('role') or 'No role'}: {meaning} This remains a source-research candidate, not an approved role requirement."
            ),
            "prerequisites": nonempty_strings(source.get("prerequisites")),
            "complements": nonempty_strings(source.get("relationships")),
            "valid_alternatives": nonempty_strings(source.get("relationships")),
            "limits_nonreplacement": nonempty_strings(source.get("limits")),
            "evidence": evidence_list(source.get("global_evidence"), "source research global evidence")
            + evidence_list(source.get("explanation"), "source research explanatory evidence")
            + evidence_list(source.get("nigeria"), "source research Nigerian context"),
            "nigeria_context": deepcopy(source.get("nigeria")) if source.get("nigeria") else {"claim": "No Nigerian claim established.", "sources": [], "limits": "Do not infer local requirements."},
            "learning_link": learning_link(source.get("free_learning")),
            "unresolved_reasons": nonempty_strings(source.get("gaps"))
            + ["Exact role-task ownership and checkpoint placement remain unresolved.", "Student approval remains false."],
            "source_record": source.get("role_uri"),
        }
    )
    return record


def normalize_merge(wrapper: dict[str, Any]) -> dict[str, Any]:
    position = int(wrapper["queue_index"])
    source = wrapper["record"]
    if source.get("label") == "logic" and source.get("disposition"):
        pair_key = source["pair_key"]
        record = common_record(position, pair_key, "essential", None, [])
        record.update(
            {
                "item_type": "excluded philosopher-linked item",
                "exact_identity": {"status": "excluded_before_D078_QA", "source_disposition": source.get("disposition")},
                "item_meaning": "No D078 learning meaning is asserted for this philosopher-linked record.",
                "task_output": "No D078 task or learner output is established; retain the exclusion rather than inventing a route.",
                "role_application": "No D078 role application is asserted.",
                "prerequisites": [],
                "complements": [],
                "valid_alternatives": [],
                "limits_nonreplacement": ["The source disposition excludes this philosopher-linked item from D078 routes."],
                "evidence": [{"source": "D078 final enrichment lane merge", "locator": "Queue position 160 exclusion disposition", "supports": source.get("disposition"), "evidence_kind": "local source-backed disposition"}],
                "nigeria_context": {"claim": "No Nigerian context is applicable because the item is excluded before D078 QA.", "sources": [], "limits": "Do not create a local route for an excluded item."},
                "learning_link": learning_link(None),
                "unresolved_reasons": ["Excluded before D078 QA.", "No task-specific learning link is applicable.", "Student approval remains false."],
                "source_record": "d078_final_enrichment_lane_merge_2026_10_09.json",
            }
        )
        return record

    pair_key = source.get("pair_key", "")
    role = source.get("source_role")
    area_context = source.get("area_context", [])
    priority = source.get("priority", "unresolved")
    record = common_record(position, pair_key, priority, role, area_context)
    context = source.get("context") or {}
    task = source.get("task_use_output") or "No D078 task/output is established in the source record; retain hidden review status."
    evidence = evidence_list(source.get("global_evidence"), "D078 enrichment global evidence")
    if source.get("exact_identity"):
        identity = source["exact_identity"]
        if identity.get("uri") or identity.get("definition"):
            evidence.append({"source": "ESCO exact concept record", "locator": identity.get("uri"), "supports": identity.get("definition"), "limits": identity.get("version_check"), "evidence_kind": "authoritative classification"})
    if source.get("nigeria_evidence"):
        evidence.extend(evidence_list(source.get("nigeria_evidence"), "D078 enrichment Nigerian context"))
    record.update(
        {
            "item_type": source.get("item_type"),
            "exact_identity": deepcopy(source.get("exact_identity")),
            "item_meaning": source.get("plain_professional_meaning") or "No plain-language meaning established.",
            "task_output": task,
            "role_application": f"{role or 'No role'}: {task}",
            "prerequisites": nonempty_strings(source.get("prerequisites")),
            "complements": nonempty_strings(source.get("complements")),
            "valid_alternatives": nonempty_strings(source.get("alternatives")),
            "limits_nonreplacement": nonempty_strings(source.get("limits")),
            "evidence": evidence,
            "nigeria_context": deepcopy(source.get("nigeria_evidence")) if source.get("nigeria_evidence") else {"claim": "No Nigerian claim established in the source pass.", "sources": [], "limits": "Do not infer local requirements."},
            "learning_link": learning_link(source.get("learning_resource")),
            "unresolved_reasons": [
                "Exact role-task ownership and checkpoint fit remain unresolved.",
                "The enrichment repair state is not student approval.",
                "Student approval remains false.",
            ],
            "source_record": {"domain": context.get("domain"), "role_context": context.get("role_context"), "checkpoint_fit": context.get("checkpoint_fit")},
        }
    )
    if source.get("repair"):
        record["repair_state"] = deepcopy(source["repair"])
    return record


def main() -> None:
    recovery = load(RECOVERY)
    research = load(RESEARCH)
    merge = load(MERGE)

    by_position: dict[int, dict[str, Any]] = {}
    for source in research.get("records", []):
        position = int(source["queue_index"])
        if START <= position <= 144:
            by_position[position] = normalize_research(source)
    for wrapper in merge.get("records", []):
        position = int(wrapper["queue_index"])
        if 145 <= position <= END:
            by_position[position] = normalize_merge(wrapper)

    # Preserve prior records but isolate any record whose pair differs from the
    # authoritative queue source for the same position.  Nothing is discarded.
    authoritative_pairs = {p: by_position[p]["pair_key"] for p in by_position}
    orphans: list[dict[str, Any]] = []
    for old in recovery.get("records", []):
        position = old.get("queue_position")
        if not isinstance(position, int) or not START <= position <= END:
            continue
        old_pair = old.get("pair_key") or old.get("pair")
        if old_pair != authoritative_pairs.get(position):
            orphan = deepcopy(old)
            orphan["orphan_reason"] = "Recovered record conflicts with the authoritative queue pair for this position; preserved without reassignment."
            orphan["student_display_approved"] = False
            orphans.append(orphan)

    positions = sorted(by_position)
    missing = sorted(set(EXPECTED) - set(positions))
    duplicates = sorted(p for p in positions if positions.count(p) > 1)
    if positions != EXPECTED or duplicates:
        raise RuntimeError(f"Exact queue validation failed: positions={positions}, missing={missing}, duplicates={duplicates}")

    payload = {
        "schema_version": "2026-10-09.d078.role-item-placement-continuation.v1",
        "status": "complete_for_assigned_positions_review_only",
        "domain_id": "D078",
        "lane": "137-173",
        "assigned_queue_start": START,
        "assigned_queue_end": END,
        "assigned_pair_count": len(EXPECTED),
        "completed_count": len(by_position),
        "missing_positions": missing,
        "checkpoint_scope": "Learning-path placement/evidence only. No role-fit audit, taxonomy, UI/API/SQL, subject matcher, or canonical edits.",
        "approval_policy": {"approval": False, "student_display_approved": False, "checkpoint_placement_approved": False, "role_task_relationship_verified": False, "state": "review_required_hidden"},
        "placement_categories": sorted(set(DECISIONS.values())),
        "source_inputs": [str(path.relative_to(ROOT)).replace("\\", "/") for path in [RECOVERY, RESEARCH, MERGE]] + CONTROL_DOCS,
        "records": [by_position[position] for position in EXPECTED],
        "orphan_records": orphans,
        "recovery_audit": {
            "prior_recovery_positions_considered": sorted({r.get("queue_position") for r in recovery.get("records", []) if isinstance(r.get("queue_position"), int) and START <= r.get("queue_position") <= END}),
            "prior_recovery_conflicts_isolated": len(orphans),
            "source_backed_records_created": len(by_position),
            "invented_records": 0,
            "exact_unique_positions_validated": positions,
            "missing_positions": missing,
        },
        "canonical_files_modified": False,
        "student_display_approved": False,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 learning-path placement continuation — positions 137–173",
        "",
        "**Status:** complete for the assigned queue as a local, review-only handoff. No record is approved for student display.",
        "",
        "This continuation is limited to placement/evidence. It does not reopen role-fit adjudication, change taxonomy, edit canonical data, modify UI/API/SQL, or touch the subject matcher.",
        "",
        "## Validation",
        "",
        f"- Exact assigned positions: **{START}–{END}**",
        f"- Unique source-backed records written: **{len(by_position)}**",
        f"- Missing positions: **{', '.join(map(str, missing)) or 'none'}**",
        f"- Conflicting recovery records isolated as orphans: **{len(orphans)}**",
        "- Invented records: **0**",
        "- Role-task relationships verified: **0**",
        "- Checkpoint placements approved: **0**",
        "- Student-display approvals: **0**",
        "",
        "The prior recovery artifact contained records whose pair keys did not match the authoritative queue order at these positions. They are preserved under `orphan_records`; they were not silently overwritten or reassigned.",
        "",
        "## Record contract",
        "",
        "Every record contains task/output scope, item meaning, programme meaning, D078 domain meaning, area context, role application, prerequisites, complements, alternatives, limits/non-replacement, source evidence, Nigerian context or an explicit no-claim state, a learning-link state, unresolved reasons, and false approval flags.",
        "",
        "Records remain `hidden_review_required`. A source URL, ESCO identity, role-list occurrence, candidate category, or learning link is not treated as checkpoint approval or competence evidence.",
        "",
        "## Source inputs",
        "",
    ]
    lines.extend(f"- `{path}`" for path in payload["source_inputs"])
    lines.extend([
        "",
        f"Machine-readable handoff: `{OUTPUT.relative_to(ROOT).as_posix()}`",
        "",
    ])
    MARKDOWN.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
