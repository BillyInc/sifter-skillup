#!/usr/bin/env python3
"""Generate an idempotent SQL seed for the locally approved D078 items.

The runtime disposition ledger is the source of truth for this first scoped
promotion tranche. This seed does not promote the whole graph, change role fit,
or mark unrelated inventory rows as student-visible.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
OUTPUT = BACKEND / "seed_d078_guided_content_2026-10-12.sql"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from d078_guided_content import d078_guided_content  # noqa: E402


ALLOWED_TYPES = {"skill", "competency", "tool", "certification", "method", "knowledge", "resource"}
PRIORITY = {"needed": "start_here", "useful": "build_next", "optional": "useful_later"}


def sql(value: Any) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def nullable_sql(value: Any) -> str:
    return "NULL" if value is None else sql(value)


def json_sql(value: Any) -> str:
    return f"{sql(json.dumps(value if value is not None else {}, ensure_ascii=False, separators=(',', ':')))}::jsonb"


def records() -> list[dict[str, Any]]:
    content = d078_guided_content()
    rows = list(content["domainItems"])
    rows.extend(item for items in content["areaItems"].values() for item in items)
    if len(rows) != content.get("approvedCount"):
        raise ValueError("D078 runtime count does not match the explicit disposition ledger")
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


def build() -> str:
    rows = records()
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
        ]) + ")")

    domain_count = sum(row["contextLevel"] == "domain" for row in rows)
    area_count = len(rows) - domain_count
    return f"""-- Generated from the D078 item dispositions and source reconciliation.
-- Current scoped tranche: {domain_count} domain items + {area_count} area items = {len(rows)} rows.
-- Local SQL artifact only. It does not apply itself or publish the full graph.
-- Requires migration_contextual_career_items.sql, migration_career_context_claim_validation.sql,
-- and migration_career_context_path_targets.sql, plus the canonical D078 taxonomy.
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
    theme_key, theme_label, use_case_key, requirement_level, requirement_reason
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
    requirement_reason = EXCLUDED.requirement_reason;

COMMIT;
"""


if __name__ == "__main__":
    sql_text = build()
    OUTPUT.write_text(sql_text, encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(records())} approved scoped D078 items)")
