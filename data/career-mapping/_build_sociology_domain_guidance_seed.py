#!/usr/bin/env python3
"""Generate the reviewed D078 domain-guidance patch from its evidence ledger."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
LEDGER = HERE / "_audit" / "sociology_domain_guidance_2026_10_08.json"
OUTPUT = HERE.parent.parent / "backend" / "seed_sociology_domain_guidance_2026-10-08.sql"


def sql(value: object) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def json_sql(value: object) -> str:
    return f"{sql(json.dumps(value, ensure_ascii=False, separators=(',', ':')))}::jsonb"


def source_map(ledger: dict) -> dict[str, dict]:
    return {source["id"]: source for source in ledger["item"]["source_references"]}


def validate(ledger: dict) -> None:
    item = ledger["item"]
    if (ledger.get("domain_key"), ledger.get("context_level"), ledger.get("context_key")) != ("D078", "domain", "D078"):
        raise ValueError("Unexpected domain identity")
    if (item.get("item_type"), item.get("item_key"), item.get("guidance_owner")) != ("skill", "research-design", "domain"):
        raise ValueError("Unexpected item identity/owner")
    if item.get("claim_review_state") != "approved" or item.get("data_state") != "source_backed":
        raise ValueError("The domain claim must be explicitly approved and source-backed")
    sources = source_map(ledger)
    claims = item.get("claim_evidence", {}).get("claims", {})
    required = {"item_identity", "checkpoint_fit", "plain_meaning", "contextual_use", "expected_output"}
    if not required.issubset(claims):
        raise ValueError("Missing item claim evidence")
    for claim_key in required:
        claim = claims[claim_key]
        if not claim.get("source_references") or not claim.get("source_locators"):
            raise ValueError(f"Claim has no source references/locators: {claim_key}")
        for locator_ref in claim["source_locators"]:
            source_id, separator, locator_key = locator_ref.partition(":")
            if not separator or source_id not in sources or locator_key not in sources[source_id].get("locators", {}):
                raise ValueError(f"Unresolved claim locator: {locator_ref}")
    resource = item.get("learning_resource") or {}
    parsed = urlparse(str(resource.get("url") or ""))
    link_source = sources.get(resource.get("source_id"))
    if parsed.scheme != "https" or not parsed.netloc or not link_source or resource.get("url") != link_source.get("url"):
        raise ValueError("Learning destination must match a catalogued HTTPS source")
    if not item.get("limitations") or not ledger.get("path_targets"):
        raise ValueError("The claim and downstream routes require explicit scope limits")
    for target in ledger["path_targets"]:
        for locator_ref in target.get("source_references", []):
            source_id, separator, locator_key = locator_ref.partition(":")
            if not separator or source_id not in sources or locator_key not in sources[source_id].get("locators", {}):
                raise ValueError(f"Unresolved path-target locator: {locator_ref}")


def generate() -> str:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    validate(ledger)
    item = ledger["item"]
    resource = item["learning_resource"]
    sources = source_map(ledger)
    link_source = sources[resource["source_id"]]
    link_reference = {
        "id": link_source["id"], "title": link_source["title"],
        "url": link_source["url"], "authority": link_source["publisher"],
        "locator": resource["evidence_locator"], "evidence": "Learning resource for research methodology and method choice.",
        "accessedAt": resource["accessed_on"],
    }
    evidence_source_refs = [
        {"id": s["id"], "title": s["title"], "url": s["url"], "authority": s["publisher"],
         "locator": s["locators"], "evidenceType": s["evidenceType"], "region": s["region"]}
        for s in item["source_references"]
    ]
    source_ids = [s["id"] for s in item["source_references"]]
    link_evidence = {
        "status": "context_item_specific_external_verified",
        "sources": [link_reference], "reviewedAt": resource["accessed_on"],
        "confidence": "high",
        "limitation": "This link teaches methodology; it does not establish a required curriculum or job credential.",
    }
    claims = item["claim_evidence"]["claims"]
    for claim in claims.values():
        claim["source_references"] = [
            {"id": ref, "title": sources[ref]["title"], "url": sources[ref]["url"]}
            for ref in claim["source_references"]
        ]
        claim["source_locators"] = [
            {"sourceId": ref.split(":", 1)[0], "locatorKey": ref.split(":", 1)[1],
             "locator": sources[ref.split(":", 1)[0]]["locators"][ref.split(":", 1)[1]]}
            for ref in claim["source_locators"]
        ]

    assignments = [
        ("name", item["name"]),
        ("plain_meaning", item["plain_meaning"]),
        ("contextual_use", item["contextual_use"]),
        ("expected_output", item["expected_output"]),
    ]
    updates = ",\n    ".join(f"{key} = {sql(value)}" for key, value in assignments)
    update_sql = f"""DO $$
DECLARE changed_rows INTEGER;
BEGIN
    UPDATE skillup_dev.career_context_items
    SET {updates},
        theme_key = {sql(item['theme_key'])}, theme_label = {sql(item['theme_label'])},
        use_case_key = {sql(item['use_case_key'])}, requirement_level = {sql(item['requirement_level'])}, requirement_reason = {sql(item['requirement_reason'])},
        priority = {sql(item['priority'])}, priority_reason = {sql(item['priority_reason'])},
        prerequisites = '[]'::jsonb, related_items = '[]'::jsonb,
        source_ids = ARRAY[{', '.join(sql(value) for value in source_ids)}]::text[],
        source_references = {json_sql(evidence_source_refs)},
        source_locators = {json_sql(item['source_references'])},
        geographic_scope = {sql(item['geographic_scope'])},
        evidence_limitations = {json_sql(item['limitations'])},
        evidence_type = {sql(item['evidence_type'])}, source_confidence = {sql(item['source_confidence'])},
        data_state = 'source_backed', claim_review_state = 'approved', claim_evidence = {json_sql({'claims': claims})},
        link_state = 'linked', link_url = {sql(resource['url'])}, link_title = {sql(resource['label'])},
        link_source_reference = {json_sql(link_reference)}, link_accessed_at = {sql(resource['accessed_on'])}::date,
        link_confidence = 'high', link_evidence = {json_sql(link_evidence)}, no_link_reason = NULL,
        guidance_owner = 'domain', verified_at = {sql(item['verified_on'])}::date,
        link_kind = {sql(resource['kind'])}, link_level = {sql(resource['level'])},
        link_language = 'English', link_access = {sql(resource['access'])}, link_duration = NULL
    WHERE context_level = 'domain' AND context_key = 'D078' AND domain_key = 'D078'
      AND item_type = 'skill' AND item_key = 'research-design';
    GET DIAGNOSTICS changed_rows = ROW_COUNT;
    IF changed_rows <> 1 THEN
        RAISE EXCEPTION 'Expected exactly one existing D078 research-design row to update; updated %', changed_rows;
    END IF;
END $$;
"""

    target_rows = []
    for target in ledger["path_targets"]:
        source_ids_for_target = sorted({ref.split(":", 1)[0] for ref in target["source_references"]})
        source_refs_for_target = []
        for ref in target["source_references"]:
            source_id, locator_key = ref.split(":", 1)
            source = sources[source_id]
            source_refs_for_target.append({
                "id": source_id, "title": source["title"], "url": source["url"],
                "authority": source["publisher"], "locator": source["locators"][locator_key],
            })
        target_rows.append("(" + ", ".join([
            sql(target["target_level"]), sql(target["target_key"]), sql(target["target_label"]),
            sql(target["use_case_key"]), sql(target["requirement_level"]), sql(target["path_reason"]),
            "ARRAY[" + ", ".join(sql(v) for v in source_ids_for_target) + "]::text[]",
            json_sql(source_refs_for_target), json_sql(target["limitations"]),
        ]) + ")")
    targets_sql = """INSERT INTO skillup_dev.career_item_path_targets (
    context_level, context_key, domain_key, from_item_type, from_item_key,
    target_level, target_key, target_label, use_case_key, requirement_level,
    path_reason, relationship_status, data_state, guidance_owner, source_ids,
    source_references, evidence_limitations, source_confidence, verified_at
)
SELECT 'domain', 'D078', 'D078', 'skill', 'research-design', v.target_level,
       v.target_key, v.target_label, v.use_case_key, v.requirement_level,
       v.path_reason, 'source_backed', 'source_backed', 'domain', v.source_ids,
       v.source_references, v.evidence_limitations, 'high', '2026-10-08'::date
FROM (VALUES
""" + ",\n".join(target_rows) + """
) AS v(target_level, target_key, target_label, use_case_key, requirement_level,
       path_reason, source_ids, source_references, evidence_limitations)
ON CONFLICT (context_level, context_key, from_item_type, from_item_key, target_level, target_key, use_case_key)
DO UPDATE SET target_label = EXCLUDED.target_label, requirement_level = EXCLUDED.requirement_level,
    path_reason = EXCLUDED.path_reason, relationship_status = EXCLUDED.relationship_status,
    data_state = EXCLUDED.data_state, guidance_owner = EXCLUDED.guidance_owner,
    source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references,
    evidence_limitations = EXCLUDED.evidence_limitations, source_confidence = EXCLUDED.source_confidence,
    verified_at = EXCLUDED.verified_at;
"""
    return (
        "-- Generated from data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json.\n"
        "-- Updates one existing D078 domain item; adds only two supported area path links.\n"
        "BEGIN;\n\n" + update_sql + "\n" + targets_sql + "\nCOMMIT;\n"
    )


if __name__ == "__main__":
    OUTPUT.write_text(generate(), encoding="utf-8")
    print(f"Wrote {OUTPUT}")
