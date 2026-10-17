#!/usr/bin/env python3
"""Generate an idempotent SQL seed for the locally approved D078 items.

The runtime disposition ledger is the source of truth for this first scoped
promotion tranche. This seed does not promote the whole graph, change role fit,
or mark unrelated inventory rows as student-visible.
"""

from __future__ import annotations

import json
import gzip
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
OUTPUT = BACKEND / "seed_d078_guided_content_2026-10-12.sql"
GZIP_OUTPUT = BACKEND / "seed_d078_guided_content_2026-10-12.sql.gz"
LANE_DISPOSITION = ROOT / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from d078_guided_content import d078_guided_content  # noqa: E402


ALLOWED_TYPES = {"skill", "competency", "tool", "certification", "method", "knowledge", "resource"}
PRIORITY = {"needed": "start_here", "useful": "build_next", "optional": "useful_later"}

AREA_LANE_ALIASES = {
    "D078-A04-tool-nvivo-tagging": [
        "D078-A04-TOOL-NVIVO", "D078-A04-TOOL-TAGUETTE",
    ],
    "D078-A04-tools-quantitative-alternatives": [
        "D078-A04-TOOL-R", "D078-A04-TOOL-PYTHON",
        "D078-A04-TOOL-SPSS", "D078-A04-TOOL-STATA",
    ],
}

DOMAIN_FOUNDATION_ORDER = {
    "d078-research-question-design": 1,
    "d078-evaluate-evidence-and-limits": 2,
    "d078-communicate-evidence": 3,
}


def sql(value: Any) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def nullable_sql(value: Any) -> str:
    return "NULL" if value is None else sql(value)


def json_sql(value: Any) -> str:
    return f"{sql(json.dumps(value if value is not None else {}, ensure_ascii=False, separators=(',', ':')))}::jsonb"


def _requirement_scope(record: dict[str, Any] | None, row: dict[str, Any], *, supplemental: bool = False) -> dict[str, Any]:
    """Keep the reviewed lane and its condition distinct from a global level.

    The three D078 shared research foundations are needed only on a selected
    route that conducts or interprets social research. Their base domain card
    therefore remains useful until the selected route satisfies that scope.
    """
    if record is None:
        lane = "useful_optional" if row.get("requirementLevel") == "useful" else "conditional"
        scope: dict[str, Any] = {
            "lane": lane,
            "lane_source": "current_explicit_runtime_item_contract",
            "condition": row.get("requirementReason") or None,
            "supplemental_to_2026_10_17_disposition": supplemental,
        }
    else:
        lane = str(record.get("requirement_lane") or "")
        item_key = str(row.get("itemKey") or "").casefold()
        if item_key in DOMAIN_FOUNDATION_ORDER:
            lane = "needed"
        scope = {
            "lane": lane,
            "lane_source": "D078_LEARNING_PATH_RECOMMENDATION_2026_10_17",
            "condition": record.get("condition"),
            "rationale": record.get("rationale"),
            "evidence_gap": record.get("evidence_gap"),
            "source_decision": record.get("source_decision"),
        }
    scope.update({
        "context_level": row.get("contextLevel"),
        "context_key": row.get("contextKey"),
        "source_owner": row.get("guidanceOwner"),
        "skippable": lane != "needed",
        "blocks_progression": False,
        "auto_add": False,
        "auto_order": False,
        "can_select_alongside_needed": lane in {"conditional", "useful_optional", "choose_one_alternative"},
    })
    item_key = str(row.get("itemKey") or "").casefold()
    if item_key in DOMAIN_FOUNDATION_ORDER:
        scope.update({
            "base_requirement_level": "needed",
            "scope_kind": "shared_domain_foundation",
            "condition": "Complete after programme selection before domain, area or role learning can continue in D078.",
            "recommended_teaching_order": DOMAIN_FOUNDATION_ORDER[item_key],
            "ordering_semantics": "compulsory_foundation_spine",
            "skippable": False,
            "blocks_progression": True,
            "auto_order": True,
            "can_select_alongside_needed": False,
        })
    elif lane == "conditional":
        scope.update({
            "effective_requirement_level": "useful",
            "scope_kind": "task_condition",
            "skippable": True,
            "blocks_progression": False,
        })
    elif lane == "choose_one_alternative":
        scope.update({
            "effective_requirement_level": "optional",
            "scope_kind": "optional_choice_set",
            "choice_group": row.get("useCaseKey") or row.get("itemKey"),
            "alternatives_are_cumulative": False,
            "skippable": True,
            "blocks_progression": False,
        })
    elif lane == "unapproved":
        scope.update({"student_eligible": False, "visibility_reason": record.get("evidence_gap") if record else "unapproved_lane"})
    else:
        scope.update({
            "effective_requirement_level": row.get("requirementLevel"),
            "scope_kind": "useful_edge" if lane == "useful_optional" else "current_runtime_option",
            "skippable": True,
            "blocks_progression": False,
        })
    return scope


def apply_requirement_scopes(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Join reviewed dispositions without lossy label matching or duplication."""
    disposition = json.loads(LANE_DISPOSITION.read_text(encoding="utf-8"))
    review_rows = disposition.get("records") or []
    by_identity = {
        (r.get("context_type"), str(r.get("context_key") or ""), str(r.get("item_id") or "").casefold()): r
        for r in review_rows if r.get("context_type") in {"domain", "area"}
    }
    by_item = {
        str(r.get("item_id") or "").casefold(): r
        for r in review_rows if r.get("context_type") == "domain"
    }
    area_exact = {
        (str(r.get("context_key") or "").casefold(), str(r.get("item_id") or "").casefold()): r
        for r in review_rows if r.get("context_type") == "area"
    }
    area_alias_targets: dict[tuple[str, str], dict[str, Any]] = {}
    area_consolidations: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for record in review_rows:
        if record.get("context_type") != "area":
            continue
        old_key = str(record.get("item_id") or "").casefold()
        area_key = str(record.get("context_key") or "").casefold()
        for target in AREA_LANE_ALIASES.get(record.get("item_id"), []):
            area_alias_targets[(area_key, target.casefold())] = record
        consolidated = record.get("consolidated_into")
        if consolidated:
            area_consolidations.setdefault((area_key, str(consolidated).casefold()), []).append(record)

    accounted_review: set[tuple[str, str, str]] = set()
    enriched: list[dict[str, Any]] = []
    for original in rows:
        row = dict(original)
        context_level = row.get("contextLevel")
        context_key = row.get("contextKey")
        item_key = str(row.get("itemKey") or "")
        item_fold = item_key.casefold()
        if context_level == "domain":
            record = by_identity.get(("domain", context_key, item_fold))
            # The domain orientation concept was added by a separate, reviewed
            # context contract after the 501-row disposition snapshot.
            supplemental = record is None and item_fold == "d078-society-and-social-world-knowledge"
            if record is None and not supplemental:
                raise ValueError(f"D078 domain item lacks a lane disposition: {item_key}")
            if record:
                accounted_review.add(("domain", str(record.get("context_key")), str(record.get("item_id"))))
                if record.get("requirement_lane") == "unapproved":
                    continue
        elif context_level == "subgroup":
            area_identity = (str(context_key or "").casefold(), item_fold)
            record = area_exact.get(area_identity) or area_alias_targets.get(area_identity)
            supplemental = record is None
            if record:
                accounted_review.add(("area", str(record.get("context_key")), str(record.get("item_id"))))
            if record and record.get("requirement_lane") == "unapproved":
                continue
        else:
            raise ValueError(f"Unexpected D078 seed context level: {context_level}")

        scope = _requirement_scope(record, row, supplemental=supplemental)
        if context_level == "subgroup":
            lineage = area_consolidations.get((str(context_key or "").casefold(), item_fold), [])
            if lineage:
                scope["consolidated_decision_ids"] = [r.get("item_id") for r in lineage]
                scope["consolidation_note"] = "Prior area records were explicitly consolidated into this canonical item; they do not create duplicate cards."
                accounted_review.update(("area", str(r.get("context_key")), str(r.get("item_id"))) for r in lineage)
        row["requirementScope"] = scope
        enriched.append(row)

    # Every domain row in the reviewed ledger must either join the runtime
    # contract or remain an explicitly unapproved/held record.
    missing_domain = [r for r in review_rows if r.get("context_type") == "domain" and
        ("domain", str(r.get("context_key")), str(r.get("item_id"))) not in accounted_review and
        r.get("requirement_lane") != "unapproved"]
    if missing_domain:
        raise ValueError("Unmatched dispositioned D078 domain items: " + ", ".join(str(r.get("item_id")) for r in missing_domain))
    missing_area = [r for r in review_rows if r.get("context_type") == "area" and
        ("area", str(r.get("context_key")), str(r.get("item_id"))) not in accounted_review and
        r.get("requirement_lane") != "unapproved"]
    if missing_area:
        raise ValueError("Unmatched dispositioned D078 area items: " + ", ".join(str(r.get("item_id")) for r in missing_area))

    # The two historical area-tool decisions intentionally fan out to current
    # individual choices. Verify those are represented by current rows.
    for old_id, targets in AREA_LANE_ALIASES.items():
        record = next((r for r in review_rows if r.get("context_type") == "area" and r.get("item_id") == old_id), None)
        if not record:
            continue
        context = str(record.get("context_key") or "").casefold()
        found = {str(r.get("itemKey") or "").casefold() for r in enriched if str(r.get("contextKey") or "").casefold() == context}
        absent = [target for target in targets if target.casefold() not in found]
        if absent:
            raise ValueError(f"Area tool disposition alias {old_id} has unresolved targets: {absent}")
    return enriched


def records() -> list[dict[str, Any]]:
    content = d078_guided_content()
    rows = list(content["domainItems"])
    rows.extend(item for items in content["areaItems"].values() for item in items)
    if len(rows) != content.get("approvedCount"):
        raise ValueError("D078 runtime count does not match the explicit disposition ledger")
    rows = apply_requirement_scopes(rows)
    seen: set[tuple[str, str, str]] = set()
    for row in rows:
        identity = (row["contextLevel"], row["contextKey"], row["itemType"], row["itemKey"])
        if identity in seen:
            raise ValueError(f"Duplicate D078 context item: {identity}")
        seen.add(identity)
        if row["itemType"] not in ALLOWED_TYPES:
            raise ValueError(f"Unsupported item type: {row['itemType']}")
        if row["guidanceOwner"] != row["contextLevel"]:
            raise ValueError(f"Owner/context mismatch for {row['itemKey']}")
        if row["claimReviewState"] != "approved" or row["dataState"] != "source_backed":
            raise ValueError(f"Unapproved item reached SQL generation: {row['itemKey']}")
        if row["linkState"] != "linked" or not str(row.get("linkUrl", "")).startswith("https://"):
            raise ValueError(f"Missing verified HTTPS learning link: {row['itemKey']}")
        if not row.get("name") or not row.get("plainMeaning") or not row.get("contextualUse"):
            raise ValueError(f"Missing required explanation field: {row['itemKey']}")
        if not row.get("sourceReferences") or not row.get("sourceLocators"):
            raise ValueError(f"Missing claim source or locator: {row['itemKey']}")
        claims = (row.get("claimEvidence") or {}).get("claims") or {}
        for claim in ("item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"):
            detail = claims.get(claim) or {}
            if not detail.get("source_references") or not detail.get("source_locators"):
                raise ValueError(f"Missing {claim} evidence: {row['itemKey']}")
        expected_claim = claims.get("expected_output")
        if row.get("expectedOutput") and (not expected_claim or not expected_claim.get("source_references") or not expected_claim.get("source_locators")):
            raise ValueError(f"Expected output lacks evidence: {row['itemKey']}")
        if row.get("expectedOutput") is None and not row.get("evidenceLimitations"):
            raise ValueError(f"Unestablished output must be explained: {row['itemKey']}")
        if row.get("contextLevel") not in {"domain", "subgroup"} or row.get("domainId") != "D078":
            raise ValueError(f"Unexpected D078 checkpoint: {row['itemKey']}")
        if row.get("requirementLevel") not in PRIORITY:
            raise ValueError(f"Unmapped requirement level: {row['itemKey']}")
    return rows


def sequence_relationships(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Collect only the explicitly approved, source-backed sequence edges."""
    by_identity = {
        (row["itemType"], row["itemKey"]): row
        for row in rows
    }
    result: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str, str, str]] = set()
    for row in rows:
        for edge in row.get("relationships") or []:
            if not isinstance(edge, dict) or edge.get("sequencePolicy") != "conditional_prerequisite":
                continue
            if edge.get("sequenceApproved") is not True or edge.get("relationshipStatus") != "source_backed":
                raise ValueError(f"Unapproved conditional sequence relationship on {row['itemKey']}")
            from_type = str(edge.get("fromItemType") or row["itemType"])
            from_key = str(edge.get("fromItemKey") or row["itemKey"])
            to_type = str(edge.get("toItemType") or "")
            to_key = str(edge.get("toItemKey") or "")
            source_row = by_identity.get((from_type, from_key))
            target_row = by_identity.get((to_type, to_key))
            if source_row is None or target_row is None:
                raise ValueError(f"Sequence edge endpoint is absent from D078 student content: {from_key} -> {to_key}")
            scope = edge.get("sequenceScope") or {}
            if source_row["contextLevel"] != "subgroup" or scope.get("domainIds") != ["D078"] or source_row["contextKey"] not in (scope.get("areaIds") or []):
                raise ValueError(f"Sequence edge has invalid D078 area scope: {from_key} -> {to_key}")
            identity = (source_row["contextKey"], from_type, from_key, to_type, to_key)
            if identity in seen:
                continue
            seen.add(identity)
            refs = [ref for ref in edge.get("sourceReferences") or [] if str(ref.get("url") or "").startswith("https://")]
            if not refs or not str(edge.get("learnerExplanation") or "").strip() or not str(edge.get("sequenceCondition") or "").strip():
                raise ValueError(f"Conditional sequence edge lacks evidence or learner explanation: {from_key} -> {to_key}")
            result.append({
                "context_level": source_row["contextLevel"],
                "context_key": source_row["contextKey"],
                "domain_key": "D078",
                "from_item_type": from_type,
                "from_item_key": from_key,
                "from_name": source_row["name"],
                "to_context_level": target_row["contextLevel"],
                "to_context_key": target_row["contextKey"],
                "to_item_type": to_type,
                "to_item_key": to_key,
                "to_name": edge.get("toName") or target_row["name"],
                "relationship_type": "builds_on",
                "learner_explanation": edge["learnerExplanation"],
                "sequence_approved": True,
                "sequence_policy": "conditional_prerequisite",
                "sequence_condition": edge["sequenceCondition"],
                "sequence_scope": scope,
                "source_ids": list(dict.fromkeys(str(ref.get("id")) for ref in refs if ref.get("id"))),
                "source_references": refs,
                "evidence_limitations": edge.get("evidenceLimitations") or [],
                "guidance_owner": source_row["guidanceOwner"],
                "verified_at": source_row.get("verifiedAt") or "2026-10-17",
            })
    return result


def build() -> str:
    rows = records()
    sequence_edges = sequence_relationships(rows)
    if len(sequence_edges) != 3:
        raise ValueError(f"Expected the three reviewed conditional D078 sequence edges; got {len(sequence_edges)}")
    values = []
    for row in rows:
        priority = PRIORITY[row["requirementLevel"]]
        priority_reason = row.get("requirementReason") or row.get("priorityReason") or "Scoped learning option; not a universal requirement."
        values.append("(" + ", ".join([
            sql(row["contextLevel"]), sql(row["contextKey"]), sql("D078"),
            sql(row["itemType"]), sql(row["itemKey"]), sql(row["name"]),
            sql(row["plainMeaning"]), sql(row["contextualUse"]), nullable_sql(row.get("expectedOutput")),
            sql(priority), sql(priority_reason), json_sql(row.get("prerequisites", [])),
            json_sql(row.get("relatedItems", [])),
            "ARRAY[" + ", ".join(sql(value) for value in row.get("sourceIds", [])) + "]::text[]",
            json_sql(row.get("sourceReferences", [])), json_sql(row.get("sourceLocators", [])),
            sql(row.get("geographicScope") if row.get("geographicScope") in {"nigeria", "global", "nigeria_to_global"} else "global"),
            json_sql(row.get("evidenceLimitations", [])), sql(row.get("evidenceType") or "source_supported_synthesis"),
            sql(row.get("sourceConfidence") or "medium"), sql(row.get("dataState") or "source_backed"),
            sql(row.get("linkState")), sql(row.get("linkUrl")), sql(row.get("linkTitle")),
            json_sql(row.get("linkSourceReference", {})), nullable_sql(row.get("linkAccessedAt")),
            sql(row.get("linkConfidence") or "medium"), json_sql(row.get("linkEvidence", {})),
            nullable_sql(None), sql(row.get("guidanceOwner")), sql(row.get("verifiedAt") or "2026-10-12"),
            sql(row.get("claimReviewState")), json_sql(row.get("claimEvidence", {})),
            nullable_sql(row.get("linkKind")), nullable_sql(row.get("linkLevel")), sql(row.get("linkLanguage")),
            nullable_sql(row.get("linkAccess")), nullable_sql(row.get("linkDuration")), nullable_sql(row.get("themeKey")),
            nullable_sql(row.get("themeLabel")), nullable_sql(row.get("useCaseKey")),
            nullable_sql(row.get("requirementLevel")), nullable_sql(row.get("requirementReason")),
            json_sql(row.get("requirementScope", {})),
        ]) + ")")

    domain_count = sum(row["contextLevel"] == "domain" for row in rows)
    area_count = len(rows) - domain_count
    sql_text = f"""-- Generated from the D078 item dispositions and source reconciliation.
-- Current scoped tranche: {domain_count} domain items + {area_count} area items = {len(rows)} rows.
-- Also persists {len(sequence_edges)} reviewed route-scoped conditional sequence relationships.
-- Local SQL artifact only. It does not apply itself or publish the full graph.
-- Requires migration_contextual_career_items.sql, migration_career_context_claim_validation.sql,
-- migration_career_context_path_targets.sql, migration_career_item_relationships_2026-09-17.sql,
-- migration_career_item_relationship_explanations_2026-10-12.sql,
-- migration_career_item_sequence_policy_2026-10-12.sql,
-- migration_career_item_relationship_target_context_2026-10-17.sql,
-- migration_d078_requirement_lanes_2026-10-17.sql, and the canonical D078 taxonomy.
BEGIN;

INSERT INTO skillup_dev.career_context_items (
    context_level, context_key, domain_key, item_type, item_key, name,
    plain_meaning, contextual_use, expected_output, priority, priority_reason,
    prerequisites, related_items, source_ids, source_references, source_locators,
    geographic_scope, evidence_limitations, evidence_type, source_confidence,
    data_state, link_state, link_url, link_title, link_source_reference,
    link_accessed_at, link_confidence, link_evidence, no_link_reason,
    guidance_owner, verified_at, claim_review_state, claim_evidence,
    link_kind, link_level, link_language, link_access, link_duration,
    theme_key, theme_label, use_case_key, requirement_level, requirement_reason,
    requirement_scope
)
VALUES
""" + ",\n".join(values) + """
ON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET
    domain_key = EXCLUDED.domain_key,
    name = EXCLUDED.name,
    plain_meaning = EXCLUDED.plain_meaning,
    contextual_use = EXCLUDED.contextual_use,
    expected_output = EXCLUDED.expected_output,
    priority = EXCLUDED.priority,
    priority_reason = EXCLUDED.priority_reason,
    prerequisites = EXCLUDED.prerequisites,
    related_items = EXCLUDED.related_items,
    source_ids = EXCLUDED.source_ids,
    source_references = EXCLUDED.source_references,
    source_locators = EXCLUDED.source_locators,
    geographic_scope = EXCLUDED.geographic_scope,
    evidence_limitations = EXCLUDED.evidence_limitations,
    evidence_type = EXCLUDED.evidence_type,
    source_confidence = EXCLUDED.source_confidence,
    data_state = EXCLUDED.data_state,
    link_state = EXCLUDED.link_state,
    link_url = EXCLUDED.link_url,
    link_title = EXCLUDED.link_title,
    link_source_reference = EXCLUDED.link_source_reference,
    link_accessed_at = EXCLUDED.link_accessed_at,
    link_confidence = EXCLUDED.link_confidence,
    link_evidence = EXCLUDED.link_evidence,
    no_link_reason = EXCLUDED.no_link_reason,
    guidance_owner = EXCLUDED.guidance_owner,
    verified_at = EXCLUDED.verified_at,
    claim_review_state = EXCLUDED.claim_review_state,
    claim_evidence = EXCLUDED.claim_evidence,
    link_kind = EXCLUDED.link_kind,
    link_level = EXCLUDED.link_level,
    link_language = EXCLUDED.link_language,
    link_access = EXCLUDED.link_access,
    link_duration = EXCLUDED.link_duration,
    theme_key = EXCLUDED.theme_key,
    theme_label = EXCLUDED.theme_label,
    use_case_key = EXCLUDED.use_case_key,
    requirement_level = EXCLUDED.requirement_level,
    requirement_reason = EXCLUDED.requirement_reason,
    requirement_scope = EXCLUDED.requirement_scope;

COMMIT;
"""
    if sequence_edges:
        edge_values = []
        for edge in sequence_edges:
            edge_values.append("(" + ", ".join([
                sql(edge["context_level"]), sql(edge["context_key"]), sql(edge["domain_key"]),
                sql(edge["from_item_type"]), sql(edge["from_item_key"]), sql(edge["from_name"]),
                sql(edge["to_context_level"]), sql(edge["to_context_key"]),
                sql(edge["to_item_type"]), sql(edge["to_item_key"]), sql(edge["to_name"]),
                sql(edge["relationship_type"]), sql("source_backed"),
                "ARRAY[" + ", ".join(sql(value) for value in edge["source_ids"]) + "]::text[]",
                json_sql(edge["source_references"]), json_sql(edge["evidence_limitations"]),
                sql("high"), sql("source_backed"), sql("source_backed"), sql(edge["guidance_owner"]),
                sql(edge["verified_at"]), sql(edge["learner_explanation"]), "TRUE",
                sql(edge["sequence_policy"]), sql(edge["sequence_condition"]), json_sql(edge["sequence_scope"]),
            ]) + ")")
        sql_text += f"""

-- The three reviewed conditional dependencies are route-scoped, non-auto-adding
-- sequence edges. They do not make the associated item globally compulsory.
BEGIN;
INSERT INTO skillup_dev.career_item_relationships (
    context_level, context_key, domain_key, from_item_type, from_item_key, from_name,
    to_context_level, to_context_key, to_item_type, to_item_key, to_name,
    relationship_type, relationship_status, source_ids, source_references,
    evidence_limitations, source_confidence, data_state, guidance_owner, verified_at,
    learner_explanation, sequence_approved, sequence_policy, sequence_condition, sequence_scope
)
VALUES
{',\n'.join(edge_values)}
ON CONFLICT (context_level, context_key, from_item_type, from_item_key,
             relationship_type, COALESCE(to_item_type, ''), COALESCE(to_item_key, ''))
DO UPDATE SET
    domain_key = EXCLUDED.domain_key, from_name = EXCLUDED.from_name,
    to_context_level = EXCLUDED.to_context_level, to_context_key = EXCLUDED.to_context_key,
    to_name = EXCLUDED.to_name, relationship_status = EXCLUDED.relationship_status,
    source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references,
    evidence_limitations = EXCLUDED.evidence_limitations, source_confidence = EXCLUDED.source_confidence,
    data_state = EXCLUDED.data_state, guidance_owner = EXCLUDED.guidance_owner,
    verified_at = EXCLUDED.verified_at, learner_explanation = EXCLUDED.learner_explanation,
    sequence_approved = EXCLUDED.sequence_approved, sequence_policy = EXCLUDED.sequence_policy,
    sequence_condition = EXCLUDED.sequence_condition, sequence_scope = EXCLUDED.sequence_scope;
COMMIT;
"""
    return sql_text


if __name__ == "__main__":
    sql_text = build()
    OUTPUT.write_text(sql_text, encoding="utf-8", newline="\n")
    with GZIP_OUTPUT.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as zipped:
            zipped.write(sql_text.encode("utf-8"))
    print(f"Wrote {OUTPUT} and {GZIP_OUTPUT} ({len(records())} approved scoped D078 items; {len(sequence_relationships(records()))} sequence edges)")
