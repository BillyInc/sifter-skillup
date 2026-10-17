#!/usr/bin/env python3
"""Build the D078 role ledger plus its approved student-card projection."""

from __future__ import annotations

import gzip
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
GRAPH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
SQL_OUT = ROOT / "backend/seed_d078_role_item_contracts_2026-10-15.sql"
GZ_OUT = ROOT / "backend/seed_d078_role_item_contracts_2026-10-15.sql.gz"
SOURCE_REL = SOURCE.relative_to(ROOT).as_posix()
LANE_LEDGER = ROOT / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json"


def sql(value: Any) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def json_sql(value: Any) -> str:
    return f"{sql(json.dumps(value, ensure_ascii=False, separators=(',', ':')))}::jsonb"


def arr_sql(values: list[str]) -> str:
    return "ARRAY[" + ", ".join(sql(value) for value in values) + "]::text[]"


def role_owner_keys(record: dict[str, Any]) -> list[str]:
    owners = record.get("role_snapshot_reconciliation", {}).get("current_area_routed_role_owners") or []
    keys = [f"D078|{re.sub(r'\\s+', ' ', str(owner).strip()).casefold()}" for owner in owners if str(owner).strip()]
    return sorted(set(keys))


def student_display_gate(record: dict[str, Any], owners: list[str]) -> tuple[bool, str]:
    """Per-item card eligibility; does not grant database SELECT or release the graph."""
    if record.get("approval_status") != "approved" or record.get("student_visibility") != "approved":
        return False, "unapproved_item_disposition"
    if not owners:
        return False, "no_current_role_owner"
    link = record.get("learning_link") or {}
    review = record.get("learning_link_review") or {}
    if link.get("state") == "no_d078_learning_route" or review.get("status") == "no_supported_d078_learning_route":
        return False, "no_supported_d078_learning_route"
    if not str(link.get("url") or "").startswith("https://") or review.get("status") in {"unresolved", "rejected"}:
        return False, "learning_link_not_verified_for_student"
    return True, "approved_role_card_eligible"


def current_contract_payload(record: dict[str, Any], eligible: bool, visibility: str) -> dict[str, Any]:
    """Preserve prior audit flags as history, but publish the current gate result."""
    payload = dict(record)
    payload["historical_gate_values"] = {
        "student_display_approved": record.get("student_display_approved"),
        "student_visibility": record.get("student_visibility"),
        "role_task_relationship_verified": record.get("role_task_relationship_verified"),
    }
    payload["historical_gate_values_are_audit_only"] = True
    # The source ledger's legacy false flag predates the current item-level
    # disposition and is not an independent approval gate. Keep it only in
    # historical_gate_values so consumers cannot mistake it for current state.
    payload.pop("role_task_relationship_verified", None)
    payload["student_display_approved"] = eligible
    payload["student_visibility"] = visibility
    payload["student_display_eligibility_basis"] = {
        "approval_status": record.get("approval_status"),
        "current_routed_role_owner": bool(role_owner_keys(record)),
        "reviewed_https_learning_or_reference_link": bool(
            str((record.get("learning_link") or {}).get("url") or "").startswith("https://")
            and (record.get("learning_link_review") or {}).get("status")
                not in {"unresolved", "rejected", "no_supported_d078_learning_route"}
        ),
    }
    return payload


def records() -> list[tuple[dict[str, Any], list[str]]]:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    lane_data = json.loads(LANE_LEDGER.read_text(encoding="utf-8"))
    lanes_by_position = {
        int(record["queue_position"]): record
        for record in lane_data.get("records", [])
        if record.get("context_type") == "role_item" and record.get("queue_position") is not None
    }
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    canonical_role_keys = {
        f"D078|{re.sub(r'\s+', ' ', str(node.get('label') or '').strip()).casefold()}"
        for node in graph.get("nodes", [])
        if node.get("kind") == "role"
    }
    rows = source.get("role_item_reconciliation", {}).get("records") or []
    if len(rows) != 173:
        raise ValueError(f"Expected 173 role-item records; got {len(rows)}")
    if len({row.get("queue_position") for row in rows}) != 173:
        raise ValueError("Queue positions must be unique and complete")
    result = []
    for row in rows:
        lane = lanes_by_position.get(int(row["queue_position"]))
        if lane is None:
            raise ValueError(f"Missing requirement-lane disposition for role-item queue position {row.get('queue_position')}")
        row["requirement_lane"] = lane["requirement_lane"]
        row["requirement_condition"] = lane.get("condition")
        row["requirement_rationale"] = lane.get("rationale")
        row["requirement_evidence_gap"] = lane.get("evidence_gap")
        row["requirement_scope"] = {
            "lane": lane["requirement_lane"],
            "condition": lane.get("condition"),
            "rationale": lane.get("rationale"),
            "evidence_gap": lane.get("evidence_gap"),
            "scope_kind": "role_task_condition" if lane["requirement_lane"] == "conditional" else "role_task_usefulness",
            "skippable": lane["requirement_lane"] != "needed",
            "blocks_progression": False,
            "auto_add": False,
            "auto_order": False,
            "can_select_alongside_needed": lane["requirement_lane"] in {"conditional", "useful_optional"},
        }
        if not row.get("task_output"):
            raise ValueError(f"Missing task/output at queue position {row.get('queue_position')}")
        if not str(row.get("plain_language_meaning") or "").strip():
            raise ValueError(f"Missing plain-language definition at queue position {row.get('queue_position')}")
        link = row.get("learning_link") or {}
        if not row.get("learning_link_review"):
            raise ValueError(f"Missing learning-link review disposition at queue position {row.get('queue_position')}")
        if str(link.get("state") or "").startswith("candidate") or str(link.get("url_status") or "").startswith("candidate"):
            raise ValueError(f"Stale candidate-only learning-link state at queue position {row.get('queue_position')}")
        if not link.get("state") or not link.get("url_status"):
            raise ValueError(f"Learning-link state is incomplete at queue position {row.get('queue_position')}")
        disposition = row.get("approval_status")
        if disposition not in {"approved", "unapproved"}:
            raise ValueError(f"Unexpected master approval status at {row.get('queue_position')}: {disposition}")
        owners = role_owner_keys(row)
        unknown_owners = sorted(set(owners) - canonical_role_keys)
        if unknown_owners:
            raise ValueError(f"Unknown D078 role route at {row.get('queue_position')}: {unknown_owners}")
        if disposition == "unapproved" and not owners and row.get("role_snapshot_reconciliation", {}).get("unmapped_or_noncurrent_role_snapshots") is None:
            raise ValueError(f"Unrouted record lacks an explicit route disposition: {row.get('queue_position')}")
        result.append((row, owners))
    return result


def _role_context_cards() -> list[dict[str, Any]]:
    """Return the current approved D078 role cards for SQL materialisation.

    The role ledger is the adjudication record.  The student API reads the
    owned contextual catalogue instead, so this projection deliberately uses
    the same approved/current/linked runtime builder used by the role route.
    This prevents the SQL seed from inventing a second, weaker eligibility
    rule.
    """
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    from backend import d078_guided_content as guided  # noqa: PLC0415

    cards: list[dict[str, Any]] = []
    for rows in guided._d078_role_items_by_owner().values():
        cards.extend(rows)
    unique: dict[tuple[str, str, str], dict[str, Any]] = {}
    for card in cards:
        key = (
            str(card.get("contextLevel") or "role"),
            str(card.get("contextKey") or ""),
            f"{card.get('itemType') or ''}|{card.get('itemKey') or ''}",
        )
        if not key[1] or not key[2].strip("|"):
            continue
        unique[key] = card

    # Attach the exact role-task lane(s) from the reconciled ledger.  The
    # runtime card's requirementLevel is the learner-facing effect (useful or
    # optional); requirementScope retains the underlying conditional/use-case
    # disposition and its evidence for the API/UI.
    ledger = records()
    lane_by_owner_identity: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row, owners in ledger:
        if row.get("approval_status") != "approved":
            continue
        identity = guided._role_item_identity(row)
        for owner in owners:
            lane_by_owner_identity.setdefault((owner, identity), []).append(row)

    result: list[dict[str, Any]] = []
    for card in unique.values():
        owner = str(card.get("contextKey") or "")
        identity = str(card.get("itemKey") or "")
        lane_rows = lane_by_owner_identity.get((owner, identity), [])
        scopes = [dict(row.get("requirement_scope") or {}) for row in lane_rows]
        scope = scopes[0] if scopes else {}
        if scopes:
            # Preserve the most restrictive evidence-backed lane if a role
            # identity was merged from more than one role-item record.
            rank = {"needed": 0, "conditional": 1, "useful_optional": 2, "choose_one_alternative": 3, "unapproved": 4}
            scope = sorted(scopes, key=lambda value: rank.get(str(value.get("lane") or ""), 9))[0]
        scope.update({
            "context_level": "role",
            "context_key": owner,
            "student_eligible": True,
            "projection_source": "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json",
        })
        display_contract = {
            "programmeContext": card.get("programmeContext"),
            "domainContext": card.get("domainContext"),
            "areaContext": card.get("areaContext"),
            "roleContext": card.get("roleContext"),
            "learningStage": card.get("learningStage"),
            "sequenceBand": card.get("sequenceBand"),
            "sequenceKind": card.get("sequenceKind"),
            "sequenceOrder": card.get("sequenceOrder"),
            "selectionGroup": card.get("selectionGroup"),
            "coLearningGroup": card.get("coLearningGroup"),
            "displayWhyNext": card.get("displayWhyNext"),
            "blocksProgression": card.get("blocksProgression", False),
            "complements": card.get("complements") or [],
            "validAlternatives": card.get("validAlternatives") or [],
            "additionalLearningLinks": card.get("additionalLearningLinks") or [],
        }
        claim_evidence = dict(card.get("claimEvidence") or {})
        claim_evidence["studentDisplayContract"] = display_contract
        item = dict(card)
        item["requirementScope"] = scope
        item["claimEvidence"] = claim_evidence
        result.append(item)
    result.sort(key=lambda item: (str(item.get("contextKey") or ""), str(item.get("itemType") or ""), str(item.get("name") or "")))
    return result


def _role_card_priority(card: dict[str, Any]) -> str:
    level = str(card.get("requirementLevel") or "optional")
    return {"needed": "build_next", "useful": "useful_later", "optional": "optional"}.get(level, "optional")


def _role_card_values(cards: list[dict[str, Any]]) -> list[str]:
    columns = [
        "context_level", "context_key", "domain_key", "item_type", "item_key", "name",
        "plain_meaning", "contextual_use", "expected_output", "priority", "priority_reason",
        "prerequisites", "related_items", "source_ids", "source_references", "source_locators",
        "geographic_scope", "evidence_limitations", "evidence_type", "source_confidence", "data_state",
        "link_state", "link_url", "link_title", "link_source_reference", "link_accessed_at",
        "link_confidence", "link_evidence", "guidance_owner", "verified_at", "claim_review_state",
        "claim_evidence", "link_kind", "link_level", "link_language", "link_access", "theme_key",
        "theme_label", "use_case_key", "requirement_level", "requirement_reason", "requirement_scope",
    ]
    values: list[str] = []
    for card in cards:
        fields: list[str] = []
        for column in columns:
            camel = column.split("_")[0] + "".join(part.title() for part in column.split("_")[1:])
            value = card.get(camel)
            if column == "domain_key":
                value = card.get("domainId") or "D078"
            elif column == "priority":
                value = _role_card_priority(card)
            elif column == "priority_reason":
                value = card.get("priorityReason") or card.get("requirementReason") or "Role-owned learning option for a selected D078 task; it does not block progression."
            elif column == "requirement_scope":
                value = card.get("requirementScope") or {}
            elif column == "related_items":
                value = card.get("relatedItems") or []
            elif column == "source_ids":
                fields.append(arr_sql([str(item) for item in (card.get("sourceIds") or [])]))
                continue
            elif column == "source_references":
                value = card.get("sourceReferences") or []
            elif column == "source_locators":
                value = card.get("sourceLocators") or []
            elif column == "evidence_limitations":
                value = card.get("evidenceLimitations") or []
            elif column == "claim_evidence":
                value = card.get("claimEvidence") or {}
            elif column == "link_source_reference":
                value = card.get("linkSourceReference") or {}
            elif column == "link_evidence":
                value = card.get("linkEvidence") or {}
            if column == "link_accessed_at" or column == "verified_at":
                fields.append("NULL" if not value else f"{sql(value)}::date")
            elif column in {"prerequisites", "related_items", "source_references", "source_locators", "evidence_limitations", "claim_evidence", "link_source_reference", "link_evidence", "requirement_scope"}:
                fields.append(json_sql(value or [] if column in {"prerequisites", "related_items", "source_references", "source_locators", "evidence_limitations"} else value or {}))
            elif value is None:
                fields.append("NULL")
            else:
                fields.append(sql(value))
        values.append("(" + ", ".join(fields) + ")")
    return values


def build() -> str:
    rows = records()
    role_cards = _role_context_cards()
    approved_count = sum(row["approval_status"] == "approved" for row, _ in rows)
    unapproved_count = len(rows) - approved_count
    values = []
    student_eligible_count = 0
    for row, owners in rows:
        status = row["approval_status"]
        student_eligible, visibility = student_display_gate(row, owners)
        student_eligible_count += int(student_eligible)
        fields = [
            str(row["queue_position"]), sql("D078"), sql(row["pair_key"]), sql(row["label"]),
            sql(row["priority_snapshot"]), sql(status), sql(row["placement_decision"]), sql(row["final_layer"]),
            arr_sql(owners), sql("supported" if owners else "unresolved_or_excluded"), sql(row["task_output"]),
            "NULL" if row.get("plain_language_meaning") is None else sql(row["plain_language_meaning"]),
            "NULL" if row.get("programme_meaning") is None else sql(row["programme_meaning"]),
            "NULL" if row.get("domain_meaning") is None else sql(row["domain_meaning"]),
            "NULL" if row.get("area_meaning") is None else sql(row["area_meaning"]),
            "NULL" if row.get("role_application") is None else sql(row["role_application"]),
            json_sql(row.get("prerequisites") or []), json_sql(row.get("complements") or []),
            json_sql(row.get("valid_alternatives") or []), json_sql(row.get("limits_nonreplacement") or []),
            json_sql(row.get("evidence") or []), json_sql(row.get("nigeria_context") or {}),
            json_sql(row.get("learning_link") or {}), json_sql(row.get("learning_link_review") or {}),
            json_sql(row.get("source_locators") or []),
            json_sql(row.get("resolved_source_urls") or []), "TRUE" if student_eligible else "FALSE", sql(visibility),
            sql(row["requirement_lane"]), "NULL" if not row.get("requirement_condition") else sql(row["requirement_condition"]),
            "NULL" if not row.get("requirement_rationale") else sql(row["requirement_rationale"]),
            sql(SOURCE_REL), json_sql(current_contract_payload(row, student_eligible, visibility)),
        ]
        values.append("(" + ", ".join(fields) + ")")

    role_card_values = _role_card_values(role_cards)
    role_card_columns = "context_level, context_key, domain_key, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations, evidence_type, source_confidence, data_state, link_state, link_url, link_title, link_source_reference, link_accessed_at, link_confidence, link_evidence, guidance_owner, verified_at, claim_review_state, claim_evidence, link_kind, link_level, link_language, link_access, theme_key, theme_label, use_case_key, requirement_level, requirement_reason, requirement_scope"
    return f"""-- Generated from {SOURCE_REL}
-- Persists all {len(rows)} D078 role-item contracts ({approved_count} approved; {unapproved_count} unapproved).
-- {student_eligible_count} contract records pass the current item gate and project to {len(role_cards)} student-owned role cards (multiple role owners can produce multiple cards).
-- The contract ledger remains staff/backend-only under RLS; career_context_items is the student read surface.
-- Requires migration_d078_role_item_contracts_2026-10-15.sql followed by migration_d078_requirement_lanes_2026-10-17.sql.
-- Requires migration_contextual_career_items.sql and migration_career_context_claim_validation.sql before this seed's role-card projection.
BEGIN;

INSERT INTO skillup_dev.d078_role_item_contracts (
    queue_position, domain_key, pair_key, item_label, priority_snapshot,
    placement_status, placement_decision, final_layer, role_owner_keys,
    role_owner_status, task_output, plain_language_meaning, programme_meaning,
    domain_meaning, area_meaning, role_application, prerequisites, complements,
    valid_alternatives, limitations, evidence, nigeria_context, learning_link, learning_link_review,
    source_locators, resolved_source_urls, student_display_approved,
    student_visibility, requirement_lane, requirement_condition, requirement_rationale,
    source_artifact, contract_payload
)
VALUES
{',\n'.join(values)}
ON CONFLICT (queue_position) DO UPDATE SET
    domain_key = EXCLUDED.domain_key, pair_key = EXCLUDED.pair_key,
    item_label = EXCLUDED.item_label, priority_snapshot = EXCLUDED.priority_snapshot,
    placement_status = EXCLUDED.placement_status, placement_decision = EXCLUDED.placement_decision,
    final_layer = EXCLUDED.final_layer, role_owner_keys = EXCLUDED.role_owner_keys,
    role_owner_status = EXCLUDED.role_owner_status, task_output = EXCLUDED.task_output,
    plain_language_meaning = EXCLUDED.plain_language_meaning,
    programme_meaning = EXCLUDED.programme_meaning, domain_meaning = EXCLUDED.domain_meaning,
    area_meaning = EXCLUDED.area_meaning, role_application = EXCLUDED.role_application,
    prerequisites = EXCLUDED.prerequisites, complements = EXCLUDED.complements,
    valid_alternatives = EXCLUDED.valid_alternatives, limitations = EXCLUDED.limitations,
    evidence = EXCLUDED.evidence, nigeria_context = EXCLUDED.nigeria_context,
    learning_link = EXCLUDED.learning_link, learning_link_review = EXCLUDED.learning_link_review,
    source_locators = EXCLUDED.source_locators,
    resolved_source_urls = EXCLUDED.resolved_source_urls,
    student_display_approved = EXCLUDED.student_display_approved, student_visibility = EXCLUDED.student_visibility,
    requirement_lane = EXCLUDED.requirement_lane,
    requirement_condition = EXCLUDED.requirement_condition,
    requirement_rationale = EXCLUDED.requirement_rationale,
    source_artifact = EXCLUDED.source_artifact, contract_payload = EXCLUDED.contract_payload,
    updated_at = now();

-- Materialize only the approved/current/linked role-owned cards.  This is the
-- missing student-facing projection: the ledger above is not queried by the
-- student route.  The display contract in claim_evidence preserves the
-- programme/domain/area/role explanations, requirement lane, alternatives,
-- complements and additional checked learning links.
INSERT INTO skillup_dev.career_context_items ({role_card_columns})
VALUES
{',\n'.join(role_card_values)}
ON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET
    name = EXCLUDED.name, plain_meaning = EXCLUDED.plain_meaning,
    contextual_use = EXCLUDED.contextual_use, expected_output = EXCLUDED.expected_output,
    priority = EXCLUDED.priority, priority_reason = EXCLUDED.priority_reason,
    prerequisites = EXCLUDED.prerequisites, related_items = EXCLUDED.related_items,
    source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references,
    source_locators = EXCLUDED.source_locators, geographic_scope = EXCLUDED.geographic_scope,
    evidence_limitations = EXCLUDED.evidence_limitations, evidence_type = EXCLUDED.evidence_type,
    source_confidence = EXCLUDED.source_confidence, data_state = EXCLUDED.data_state,
    link_state = EXCLUDED.link_state, link_url = EXCLUDED.link_url, link_title = EXCLUDED.link_title,
    link_source_reference = EXCLUDED.link_source_reference, link_accessed_at = EXCLUDED.link_accessed_at,
    link_confidence = EXCLUDED.link_confidence, link_evidence = EXCLUDED.link_evidence,
    guidance_owner = EXCLUDED.guidance_owner, verified_at = EXCLUDED.verified_at,
    claim_review_state = EXCLUDED.claim_review_state, claim_evidence = EXCLUDED.claim_evidence,
    link_kind = EXCLUDED.link_kind, link_level = EXCLUDED.link_level,
    link_language = EXCLUDED.link_language, link_access = EXCLUDED.link_access,
    theme_key = EXCLUDED.theme_key, theme_label = EXCLUDED.theme_label,
    use_case_key = EXCLUDED.use_case_key, requirement_level = EXCLUDED.requirement_level,
    requirement_reason = EXCLUDED.requirement_reason, requirement_scope = EXCLUDED.requirement_scope;

COMMIT;
"""


def main() -> None:
    text = build()
    SQL_OUT.write_text(text, encoding="utf-8", newline="\n")
    # Deterministic gzip: stable header timestamp and compression level.
    with GZ_OUT.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as compressed:
            compressed.write(text.encode("utf-8"))
    rows = records()
    approved = sum(row["approval_status"] == "approved" for row, _ in rows)
    hidden = len(rows) - approved
    eligible = sum(student_display_gate(row, owners)[0] for row, owners in rows)
    route_count = sum(len(owners) for _, owners in rows)
    no_route = sum(not owners for _, owners in rows)
    role_cards = _role_context_cards()
    print(f"Wrote {SQL_OUT.relative_to(ROOT)} and {GZ_OUT.relative_to(ROOT)}")
    print(f"contracts={len(rows)} approved={approved} unapproved={hidden} display_eligible={eligible} role_routes={route_count} unrouted={no_route} role_context_cards={len(role_cards)}")
    print(f"sql_bytes={SQL_OUT.stat().st_size} gzip_bytes={GZ_OUT.stat().st_size}")


if __name__ == "__main__":
    main()
