#!/usr/bin/env python3
"""Generate the reviewed, programme-owned Sociology theme-guidance seed."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
LEDGER = HERE / "_audit" / "sociology_programme_theme_claims_2026_10_08.json"
OUTPUT = HERE.parent.parent / "backend" / "seed_sociology_programme_theme_guidance_2026-10-08.sql"
EVIDENCE_KEYS = ("item_identity", "checkpoint_fit", "plain_meaning", "contextual_use", "expected_output")


def sql(value: object) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def json_sql(value: object) -> str:
    return f"{sql(json.dumps(value, ensure_ascii=False, separators=(',', ':')))}::jsonb"


def collect_sources(claim: dict, source_catalog: dict) -> list[dict]:
    refs = []
    for key in EVIDENCE_KEYS:
        refs.extend(claim.get("evidence", {}).get(key, []))
    found: dict[str, dict] = {}
    for reference in refs:
        source_id, separator, locator_key = reference.partition(":")
        source = source_catalog.get(source_id)
        if not separator or not source or locator_key not in source.get("locators", {}):
            raise ValueError(f"Unresolved claim source locator: {reference}")
        record = found.setdefault(source_id, {
            "id": source_id,
            "title": source["title"],
            "publisher": source["publisher"],
            "url": source["url"],
            "jurisdiction": source["jurisdiction"],
            "locators": {},
        })
        record["locators"][locator_key] = source["locators"][locator_key]
    for record in found.values():
        parsed = urlparse(record["url"])
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"Evidence source must use HTTPS: {record['id']}")
    return list(found.values())


def generate() -> str:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    sources = ledger.get("sources") or {}
    programme = ledger.get("programme")
    theme_key = ledger.get("theme_key")
    if programme != "Sociology" or theme_key != "research":
        raise ValueError("Unexpected pilot identity; refusing to generate a mismatched seed")
    rows = []
    for position, claim in enumerate(ledger.get("claims") or [], start=1):
        resource = claim.get("learning_resource") or {}
        learning_source = sources.get(resource.get("source_id")) or {}
        parsed = urlparse(str(resource.get("url") or ""))
        if claim.get("claim_review_state") != "approved":
            raise ValueError(f"Claim is not approved: {claim.get('item_key')}")
        if claim.get("selection_state") != "fixed_programme_guidance_not_selectable":
            raise ValueError(f"Curriculum claim must not become selectable: {claim.get('item_key')}")
        if resource.get("url") != learning_source.get("url") or parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"Invalid learning destination: {claim.get('item_key')}")
        evidence = claim.get("evidence") or {}
        missing = [key for key in EVIDENCE_KEYS if not evidence.get(key)]
        if missing:
            raise ValueError(f"Claim has missing evidence ({', '.join(missing)}): {claim.get('item_key')}")
        rows.append({
            "display_order": position * 10,
            "item_key": claim["item_key"],
            "item_type": claim["item_type"],
            "title": claim["title"],
            "plain_meaning": claim["plain_meaning"],
            "everyday_example": claim["everyday_example"],
            "contextual_use": claim["contextual_use"],
            "expected_output": claim["expected_output"],
            "curriculum_anchors": claim["curriculum_anchors"],
            "claim_review_state": claim["claim_review_state"],
            "claim_evidence": {key: evidence[key] for key in EVIDENCE_KEYS},
            "claim_sources": collect_sources(claim, sources),
            "learning_label": resource["label"],
            "learning_url": resource["url"],
            "learning_resource_type": resource["resource_type"],
            "learning_source_reference": {
                "id": resource["source_id"],
                "title": learning_source["title"],
                "publisher": learning_source["publisher"],
                "url": learning_source["url"],
                "jurisdiction": learning_source["jurisdiction"],
                "locator": learning_source.get("locators", {}),
                "resource_facts": learning_source.get("resource_facts", {}),
            },
            "learning_level": learning_source.get("resource_facts", {}).get("level"),
            "learning_duration": learning_source.get("resource_facts", {}).get("estimated_duration"),
            "learning_access": learning_source.get("resource_facts", {}).get("access"),
            "learning_verified_on": resource["verified_on"],
            "limitations": claim["limitations"],
        })

    relationship_rows = []
    known_claims = {claim["item_key"] for claim in ledger.get("claims") or []}
    for relationship in ledger.get("relationships") or []:
        resource = relationship.get("learning_resource") or {}
        learning_source = sources.get(resource.get("source_id")) or {}
        parsed = urlparse(str(resource.get("url") or ""))
        if relationship.get("claim_review_state") != "approved":
            raise ValueError(f"Relationship is not approved: {relationship.get('relationship_key')}")
        if relationship.get("selection_state", "fixed_programme_guidance_not_selectable") != "fixed_programme_guidance_not_selectable":
            raise ValueError(f"Relationship must remain fixed guidance: {relationship.get('relationship_key')}")
        source_refs = relationship.get("evidence") or []
        if not source_refs or not relationship.get("limitations"):
            raise ValueError(f"Relationship requires evidence and limitations: {relationship.get('relationship_key')}")
        for reference in source_refs:
            source_id, separator, locator_key = str(reference).partition(":")
            if not separator or source_id not in sources or locator_key not in (sources[source_id].get("locators") or {}):
                raise ValueError(f"Unresolved relationship source locator: {reference}")
        from_item = relationship.get("from") or {}
        to_item = relationship.get("to") or {}
        if to_item.get("item_key") not in known_claims:
            raise ValueError(f"Relationship target is not in the reviewed theme claims: {relationship.get('relationship_key')}")
        if resource.get("url") != learning_source.get("url") or parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"Invalid relationship learning destination: {relationship.get('relationship_key')}")
        relationship_rows.append({
            "relationship_key": relationship["relationship_key"],
            "from": from_item,
            "to": to_item,
            "relationship_type": relationship["relationship_type"],
            "learner_explanation": relationship["learner_explanation"],
            "relationship_evidence": source_refs,
            "claim_sources": collect_sources({"evidence": {"checkpoint_fit": source_refs}}, sources),
            "learning_label": resource["label"],
            "learning_url": resource["url"],
            "learning_resource_type": resource["resource_type"],
            "learning_source_reference": {
                "id": resource["source_id"], "title": learning_source["title"],
                "publisher": learning_source["publisher"], "url": learning_source["url"],
                "jurisdiction": learning_source["jurisdiction"],
                "locator": learning_source.get("locators", {}),
            },
            "learning_verified_on": resource["verified_on"],
            "limitations": relationship["limitations"],
        })

    values = []
    for row in rows:
        values.append("(" + ", ".join([
            sql(row["item_key"]),
            sql(row["item_type"]),
            sql(row["title"]),
            sql(row["plain_meaning"]),
            str(row["display_order"]),
            sql(row["everyday_example"]),
            sql(row["contextual_use"]),
            sql(row["expected_output"]),
            json_sql(row["curriculum_anchors"]),
            sql(row["claim_review_state"]),
            json_sql({"claims": row["claim_evidence"]}),
            json_sql(row["claim_sources"]),
            sql(row["learning_label"]),
            sql(row["learning_url"]),
            sql(row["learning_resource_type"]),
            json_sql(row["learning_source_reference"]),
            sql(row["learning_level"]),
            sql(row["learning_duration"]),
            sql(row["learning_access"]),
            sql(row["learning_verified_on"]),
            json_sql(row["limitations"]),
        ]) + ")")

    insert = """INSERT INTO skillup_dev.programme_theme_guidance (
    programme_id, theme_key, item_key, item_type, title, plain_meaning,
    display_order,
    everyday_example, contextual_use, expected_output, curriculum_anchors,
    claim_review_state, claim_evidence, claim_sources, learning_label,
    learning_url, learning_resource_type, learning_source_reference,
    learning_level, learning_duration, learning_access, learning_verified_on,
    selection_state, limitations, student_display, data_state
)
SELECT p.id, 'research', v.item_key, v.item_type, v.title,
       v.plain_meaning, v.display_order, v.everyday_example, v.contextual_use, v.expected_output,
       v.curriculum_anchors, v.claim_review_state, v.claim_evidence, v.claim_sources,
       v.learning_label, v.learning_url, v.learning_resource_type,
       v.learning_source_reference, v.learning_level, v.learning_duration,
       v.learning_access, v.learning_verified_on::date,
       'fixed_programme_guidance_not_selectable', v.limitations, TRUE, 'source_backed'
FROM skillup_dev.programmes p
CROSS JOIN (VALUES
""" + ",\n".join(values) + """
) AS v(item_key, item_type, title, plain_meaning, display_order, everyday_example,
       contextual_use, expected_output, curriculum_anchors, claim_review_state,
       claim_evidence, claim_sources, learning_label, learning_url,
       learning_resource_type, learning_source_reference, learning_level,
       learning_duration, learning_access, learning_verified_on, limitations)
WHERE lower(p.name) = lower('Sociology')
ON CONFLICT (programme_id, theme_key, item_key) DO UPDATE SET
    item_type = EXCLUDED.item_type, title = EXCLUDED.title,
    display_order = EXCLUDED.display_order,
    plain_meaning = EXCLUDED.plain_meaning, everyday_example = EXCLUDED.everyday_example,
    contextual_use = EXCLUDED.contextual_use, expected_output = EXCLUDED.expected_output,
    curriculum_anchors = EXCLUDED.curriculum_anchors,
    claim_review_state = EXCLUDED.claim_review_state, claim_evidence = EXCLUDED.claim_evidence,
    claim_sources = EXCLUDED.claim_sources, learning_label = EXCLUDED.learning_label,
    learning_url = EXCLUDED.learning_url, learning_resource_type = EXCLUDED.learning_resource_type,
    learning_source_reference = EXCLUDED.learning_source_reference,
    learning_level = EXCLUDED.learning_level, learning_duration = EXCLUDED.learning_duration,
    learning_access = EXCLUDED.learning_access, learning_verified_on = EXCLUDED.learning_verified_on,
    selection_state = EXCLUDED.selection_state, limitations = EXCLUDED.limitations,
    student_display = EXCLUDED.student_display, data_state = EXCLUDED.data_state,
    updated_at = NOW();
"""
    if len(relationship_rows) != 1:
        raise ValueError(f"Expected one reviewed Sociology theme relationship, found {len(relationship_rows)}")
    relationship_values = []
    for row in relationship_rows:
        relationship_values.append("(" + ", ".join([
            sql(row["relationship_key"]),
            sql(row["from"]["item_type"]), sql(row["from"]["item_key"]), sql(row["from"]["title"]),
            sql(row["to"]["item_type"]), sql(row["to"]["item_key"]), sql(row["to"]["title"]),
            sql(row["relationship_type"]), sql(row["learner_explanation"]),
            sql("approved"), json_sql(row["relationship_evidence"]), json_sql(row["claim_sources"]),
            sql(row["learning_label"]), sql(row["learning_url"]), sql(row["learning_resource_type"]),
            json_sql(row["learning_source_reference"]), sql(row["learning_verified_on"]),
            json_sql(row["limitations"]),
        ]) + ")")

    relationship_insert = """INSERT INTO skillup_dev.programme_theme_relationships (
    programme_id, theme_key, relationship_key, from_item_type, from_item_key, from_title,
    to_item_type, to_item_key, to_title, relationship_type, learner_explanation,
    claim_review_state, relationship_evidence, claim_sources, learning_label, learning_url,
    learning_resource_type, learning_source_reference, learning_verified_on,
    selection_state, limitations, student_display, data_state
)
SELECT p.id, 'research', v.relationship_key, v.from_item_type, v.from_item_key, v.from_title,
       v.to_item_type, v.to_item_key, v.to_title, v.relationship_type, v.learner_explanation,
       v.claim_review_state, v.relationship_evidence, v.claim_sources, v.learning_label,
       v.learning_url, v.learning_resource_type, v.learning_source_reference,
       v.learning_verified_on::date, 'fixed_programme_guidance_not_selectable',
       v.limitations, TRUE, 'source_backed'
FROM skillup_dev.programmes p
CROSS JOIN (VALUES
""" + ",\n".join(relationship_values) + """
) AS v(relationship_key, from_item_type, from_item_key, from_title,
       to_item_type, to_item_key, to_title, relationship_type, learner_explanation,
       claim_review_state, relationship_evidence, claim_sources, learning_label, learning_url,
       learning_resource_type, learning_source_reference, learning_verified_on, limitations)
WHERE lower(p.name) = lower('Sociology')
ON CONFLICT (programme_id, theme_key, relationship_key) DO UPDATE SET
    from_item_type = EXCLUDED.from_item_type, from_item_key = EXCLUDED.from_item_key,
    from_title = EXCLUDED.from_title, to_item_type = EXCLUDED.to_item_type,
    to_item_key = EXCLUDED.to_item_key, to_title = EXCLUDED.to_title,
    relationship_type = EXCLUDED.relationship_type,
    learner_explanation = EXCLUDED.learner_explanation,
    claim_review_state = EXCLUDED.claim_review_state,
    relationship_evidence = EXCLUDED.relationship_evidence, claim_sources = EXCLUDED.claim_sources,
    learning_label = EXCLUDED.learning_label, learning_url = EXCLUDED.learning_url,
    learning_resource_type = EXCLUDED.learning_resource_type,
    learning_source_reference = EXCLUDED.learning_source_reference,
    learning_verified_on = EXCLUDED.learning_verified_on,
    limitations = EXCLUDED.limitations, student_display = EXCLUDED.student_display,
    data_state = EXCLUDED.data_state, updated_at = NOW();
"""
    if len(rows) != 3:
        raise ValueError(f"Expected 3 reviewed Sociology theme claims, found {len(rows)}")
    return "-- Generated from data/career-mapping/_audit/sociology_programme_theme_claims_2026_10_08.json.\n-- Fixed programme-owned guidance and evidence-backed relationships; not supplemental selection items.\nBEGIN;\n\n" + insert + "\n" + relationship_insert + "\nCOMMIT;\n"


if __name__ == "__main__":
    OUTPUT.write_text(generate(), encoding="utf-8")
    print(f"Wrote {OUTPUT}")
