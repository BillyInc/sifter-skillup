"""Audit the complete contextual resource and relationship backlog.

This is a local, read-only audit of the scaled catalogue.  It scans every
typed contextual item and every normalized relationship, then projects the
result onto all active programme-domain routes and the 420 canonical JAMB
identities.  It never infers a relationship, turns a source reference into a
learning link, fetches URLs, edits transport, applies SQL, or approves a row
for students.
"""

from __future__ import annotations

import json
import gzip
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

AUDIT = HERE / "_audit"
CATALOGUE = HERE / "contextual_guidance_items.json.gz"
PROGRAMME_MAP = HERE / "programme_domain_final.json"
SOURCE_BATCH = AUDIT / "source_enrichment_batch_broad_2026-09-19.json"
OUT_JSON = AUDIT / "RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json"
OUT_MD = AUDIT / "RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.md"

ITEM_LINK_STATES = {"linked", "no_link", "review_required"}
ACTIVE_RELATIONSHIPS = {"builds_on", "works_with"}
ACTIVE_MATCH_TYPES = {"direct", "functional", "adjacent"}


def _load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _iter_catalogue_array(name: str):
    """Yield one validated top-level catalogue array.

    The old incremental decoder could mistake the final document-closing
    bytes for an incomplete relationship object on the large gzip transport.
    This audit is explicitly a full-population audit, so load the validated
    JSON document once and iterate its requested array exactly.
    """
    with gzip.open(CATALOGUE, "rt", encoding="utf-8") as stream:
        payload = json.load(stream)
    rows = payload.get(name)
    if not isinstance(rows, list):
        raise ValueError(f"Catalogue {name!r} value is not an array")
    yield from rows


def _domain_key(row: dict[str, Any]) -> str:
    return str(row.get("domain_key") or row.get("context_key") or "").split("|", 1)[0]


def _context_id(level: str, key: str) -> str:
    return f"{level}|{key}"


def _link_state(row: dict[str, Any]) -> str:
    state = str(row.get("link_state") or "").strip().casefold()
    if state in ITEM_LINK_STATES:
        return state
    return "missing" if "link_state" not in row else "invalid"


def _relationship_state(row: dict[str, Any]) -> str:
    data_state = str(row.get("data_state") or "").strip().casefold()
    relationship = str(row.get("relationship_type") or "").strip().casefold()
    if relationship in ACTIVE_RELATIONSHIPS and data_state == "source_backed":
        return "source_backed"
    if data_state in {"not_established", "review_required", "review_only", "audit_only", "unverified"}:
        return data_state
    if relationship not in ACTIVE_RELATIONSHIPS:
        return "not_established"
    return "invalid"


def _new_context() -> dict[str, Any]:
    return {
        "itemRows": 0,
        "itemStates": Counter(),
        "itemTypes": Counter(),
        "relationshipRows": 0,
        "relationshipStates": Counter(),
        "relationshipFromTypes": Counter(),
        "sourceBackedRows": 0,
        "unresolvedRows": 0,
    }


def _serial_contexts(contexts: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for identity in sorted(contexts):
        level, key = identity.split("|", 1)
        value = contexts[identity]
        result.append(
            {
                "contextLevel": level,
                "contextKey": key,
                "domainKey": key.split("|", 1)[0],
                "itemRows": value["itemRows"],
                "itemStates": dict(sorted(value["itemStates"].items())),
                "itemTypes": dict(sorted(value["itemTypes"].items())),
                "relationshipRows": value["relationshipRows"],
                "relationshipStates": dict(sorted(value["relationshipStates"].items())),
                "relationshipFromTypes": dict(sorted(value["relationshipFromTypes"].items())),
                "sourceBackedRelationshipRows": value["sourceBackedRows"],
                "unresolvedRelationshipRows": value["unresolvedRows"],
            }
        )
    return result


def _active_domains() -> dict[str, list[str]]:
    payload = _load(PROGRAMME_MAP)
    result: dict[str, list[str]] = {}
    for programme_key, row in payload.items():
        result[programme_key] = sorted(
            {
                str(link.get("domain_id"))
                for link in row.get("links") or []
                if link.get("domain_id")
                and str(link.get("match_type") or "").casefold() in ACTIVE_MATCH_TYPES
            }
        )
    return result


def _programme_projection(
    contexts: dict[str, dict[str, Any]],
    active_domains: dict[str, list[str]],
) -> list[dict[str, Any]]:
    rows = []
    for programme_key in sorted(active_domains):
        domains = active_domains[programme_key]
        items = Counter()
        item_types = Counter()
        relationships = Counter()
        relationship_from_types = Counter()
        context_ids: set[str] = set()
        for identity, context in contexts.items():
            domain_key = context.get("domainKey") or identity.split("|", 1)[1].split("|", 1)[0]
            if domain_key in domains:
                context_ids.add(identity)
                items.update(context["itemStates"])
                item_types.update(context["itemTypes"])
                relationships.update(context["relationshipStates"])
                relationship_from_types.update(context["relationshipFromTypes"])
        unresolved = sum(
            count for state, count in relationships.items() if state != "source_backed"
        )
        rows.append(
            {
                "programmeKey": programme_key,
                "activeDomainIds": domains,
                "activeDomainCount": len(domains),
                "downstreamContextCount": len(context_ids),
                "inheritedItemRows": sum(items.values()),
                "inheritedItemLinkStates": dict(sorted(items.items())),
                "inheritedItemTypes": dict(sorted(item_types.items())),
                "inheritedRelationshipRows": sum(relationships.values()),
                "relationshipStates": dict(sorted(relationships.items())),
                "relationshipFromTypes": dict(sorted(relationship_from_types.items())),
                "unresolvedRelationshipRows": unresolved,
                "studentExposure": "fail_closed_until_live_contract_and_review",
            }
        )
    return rows


def _source_summary(source_batch: dict[str, Any]) -> dict[str, Any]:
    refs: dict[str, dict[str, Any]] = {}
    for name, source in (source_batch.get("authoritative_source_catalog") or {}).items():
        if isinstance(source, dict) and source.get("url"):
            refs[source["url"]] = {"key": name, **source}
    candidate_decisions = Counter()
    candidate_kinds = Counter()
    for checkpoint in source_batch.get("carried_forward_external_checkpoints") or []:
        for record in checkpoint.get("records") or []:
            candidate_decisions[str(record.get("decision") or "unlabelled")] += 1
            candidate = record.get("candidate") or {}
            candidate_kinds[str(candidate.get("kind") or "unlabelled")] += 1
    return {
        "authoritativeSources": sorted(refs.values(), key=lambda row: row["url"]),
        "carriedForwardCandidateDecisions": dict(sorted(candidate_decisions.items())),
        "carriedForwardCandidateKinds": dict(sorted(candidate_kinds.items())),
        "policy": "Only authoritative, item-specific evidence may promote a row. Existing source references remain evidence locators; they are not automatically student links or relationship proof.",
    }


def build_report() -> dict[str, Any]:
    contexts: dict[str, dict[str, Any]] = defaultdict(_new_context)
    item_totals = Counter()
    item_types = Counter()
    relationship_totals = Counter()
    relationship_types = Counter()
    relationship_from_types = Counter()
    source_ids = Counter()
    duplicate_items: set[tuple[str, str, str, str]] = set()
    seen_items: set[tuple[str, str, str, str]] = set()
    for row in _iter_catalogue_array("items"):
        level = str(row.get("context_level") or "")
        context_key = str(row.get("context_key") or "")
        identity = (level, context_key, str(row.get("item_type") or ""), str(row.get("item_key") or ""))
        if identity in seen_items:
            duplicate_items.add(identity)
        seen_items.add(identity)
        context = contexts[_context_id(level, context_key)]
        state = _link_state(row)
        context["domainKey"] = _domain_key(row)
        context["itemRows"] += 1
        context["itemStates"][state] += 1
        context["itemTypes"][str(row.get("item_type") or "unknown")] += 1
        item_totals[state] += 1
        item_types[str(row.get("item_type") or "unknown")] += 1
        for source_id in row.get("source_ids") or []:
            source_ids[str(source_id)] += 1
    for row in _iter_catalogue_array("relationships"):
        level = str(row.get("context_level") or "")
        context_key = str(row.get("context_key") or "")
        context = contexts[_context_id(level, context_key)]
        context["domainKey"] = _domain_key(row)
        state = _relationship_state(row)
        from_type = str(row.get("from_item_type") or "unknown")
        context["relationshipRows"] += 1
        context["relationshipStates"][state] += 1
        context["relationshipFromTypes"][from_type] += 1
        if state == "source_backed":
            context["sourceBackedRows"] += 1
        else:
            context["unresolvedRows"] += 1
        relationship_totals[state] += 1
        relationship_types[str(row.get("relationship_type") or "unknown")] += 1
        relationship_from_types[from_type] += 1
        for source_id in row.get("source_ids") or []:
            source_ids[str(source_id)] += 1

    active_domains = _active_domains()
    source_batch = _load(SOURCE_BATCH)
    programmes = _programme_projection(contexts, active_domains)
    jamb_rows = []
    for row in source_batch.get("jamb_identities") or []:
        jamb_rows.append(
            {
                "jambName": row.get("jamb_name"),
                "coverageCategory": row.get("coverage_category"),
                "mappingStatus": row.get("mapping_status"),
                "curriculumScope": row.get("curriculum_scope"),
                "currentDomainLinkCount": row.get("current_domain_link_count", 0),
                "externalEnrichment": row.get("external_enrichment"),
                "sourceReferences": row.get("source_references"),
                "studentExposure": "fail_closed_until_curriculum_resource_and_edge_review",
            }
        )
    return {
        "schemaVersion": "2026-09-19.relationship-resource-backlog.v1",
        "auditName": "full_relationship_resource_backlog",
        "scope": {
            "canonicalProgrammeCount": len(programmes),
            "canonicalJambIdentityCount": len(jamb_rows),
            "contextCount": len(contexts),
            "relationshipRowsScanned": sum(relationship_totals.values()),
            "itemRowsScanned": sum(item_totals.values()),
        },
        "inputs": {
            "catalogue": str(CATALOGUE.relative_to(HERE.parent)).replace("\\", "/"),
            "programmeDomainMap": str(PROGRAMME_MAP.relative_to(HERE.parent)).replace("\\", "/"),
            "sourceEnrichmentBatch": str(SOURCE_BATCH.relative_to(HERE.parent)).replace("\\", "/"),
        },
        "itemBacklog": {
            "stateCounts": dict(sorted(item_totals.items())),
            "itemTypes": dict(sorted(item_types.items())),
            "duplicateTypedItemRows": len(duplicate_items),
        },
        "relationshipBacklog": {
            "stateCounts": dict(sorted(relationship_totals.items())),
            "relationshipTypes": dict(sorted(relationship_types.items())),
            "fromItemTypes": dict(sorted(relationship_from_types.items())),
            "unresolvedRows": sum(count for state, count in relationship_totals.items() if state != "source_backed"),
        },
        "sourceEvidence": {
            **_source_summary(source_batch),
            "sourceIdCounts": dict(source_ids.most_common()),
        },
        "contexts": _serial_contexts(contexts),
        "programmes": programmes,
        "jambIdentities": jamb_rows,
        "decision": {
            "allRowsScanned": True,
            "studentExposureApproved": False,
            "sqlApplied": False,
            "browserProof": False,
            "reason": "Source-backed edges and linked item destinations remain distinguishable from unresolved relationships and explicit no-link/review-required states. No unresolved record is promoted by this audit.",
        },
    }


def render_markdown(report: dict[str, Any]) -> str:
    item = report["itemBacklog"]
    rel = report["relationshipBacklog"]
    scope = report["scope"]
    lines = [
        "# Full relationship/resource backlog audit — 2026-09-19",
        "",
        "Read-only full-population audit of the checked-in contextual catalogue, active programme-domain routes, and the broad 420-JAMB source ledger. It does not fetch URLs, apply SQL, edit gzip transport, or promote a relationship.",
        "",
        "## Scope",
        "",
        f"- Programmes scanned: **{scope['canonicalProgrammeCount']}**; JAMB identities scanned: **{scope['canonicalJambIdentityCount']}**.",
        f"- Typed contextual items scanned: **{scope['itemRowsScanned']}** across **{scope['contextCount']}** contexts.",
        f"- Normalized relationships scanned: **{scope['relationshipRowsScanned']}**.",
        "- The machine-readable report contains every context, every programme projection, and every JAMB identity; the compact markdown is a summary.",
        "",
        "## Item/resource states",
        "",
        "| State | Rows | Meaning |",
        "| --- | ---: | --- |",
        f"| `linked` | {item['stateCounts'].get('linked', 0)} | Item-specific HTTPS destination with retained source evidence. |",
        f"| `no_link` | {item['stateCounts'].get('no_link', 0)} | No reviewed item-specific destination; the reason remains on the row. |",
        f"| `review_required` | {item['stateCounts'].get('review_required', 0)} | Candidate/evidence exists but is not student-approved. |",
        f"| `missing/invalid` | {item['stateCounts'].get('missing', 0) + item['stateCounts'].get('invalid', 0)} | Contract defect requiring generator review. |",
        "",
        "## Relationship states",
        "",
        "| State | Rows | Meaning |",
        "| --- | ---: | --- |",
    ]
    for state, count in sorted(rel["stateCounts"].items()):
        meaning = "source-backed same-context edge" if state == "source_backed" else "retained audit/review state; not a student relationship"
        lines.append(f"| `{state}` | {count} | {meaning}. |")
    lines += [
        "",
        "## Full-population safeguards",
        "",
        f"- Duplicate typed item rows: **{item['duplicateTypedItemRows']}**.",
        f"- Unresolved/non-source-backed relationship rows: **{rel['unresolvedRows']}**.",
        f"- Active programme-domain projections: **{scope['canonicalProgrammeCount']} programmes**; JAMB downstream projections: **{scope['canonicalJambIdentityCount']} identities**.",
        "- `not_established`, `review_required`, and `no_link` remain visible in the admin/audit contract and are excluded from student approval.",
        "- Source references are retained as evidence locators; they do not become learning links or relationship proof by name similarity/co-occurrence.",
        "",
        "## External-source boundary",
        "",
        "The report carries forward only authoritative sources already justified in the broad ledger. Candidate sources remain review-required until an item-specific target and relationship are independently established.",
        "",
        "| Source | URL |",
        "| --- | --- |",
    ]
    for source in report["sourceEvidence"]["authoritativeSources"]:
        lines.append(f"| {source.get('authority', source.get('key'))} | {source['url']} |")
    lines += [
        "",
        "## Deployment boundary",
        "",
        "SQL application, live payload verification, URL reachability, and browser proof remain deferred. This report is local contract evidence only.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({
        "json": str(OUT_JSON),
        "markdown": str(OUT_MD),
        "scope": report["scope"],
        "itemStates": report["itemBacklog"]["stateCounts"],
        "relationshipStates": report["relationshipBacklog"]["stateCounts"],
    }, indent=2))


if __name__ == "__main__":
    main()
