"""Audit the local Sociology/D078 student-guidance source contract.

This is a read-only, local audit.  It intentionally validates URL shape and
source-recorded ownership only; it never fetches a URL and therefore never
claims that an external page is live.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT_DIR = HERE / "_audit"
ITEMS_PATH = HERE / "contextual_guidance_items.json.gz"
DOMAIN_AUDIT_PATH = HERE / "domain_skill_competency_certification_audit.json"
RESOURCE_MIGRATION = ROOT / "backend" / "migration_guidance_ownership_and_sociology_resources_2026-09-11.sql"
RESOURCE_PARTS = HERE / "learning_resource_population_parts"
CONTEXTUAL_SEED_PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
MANIFEST_PATH = HERE / "CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json"

D078 = "D078"
# Stable UUID from the canonical 2026-09-12 career seed.  The broad resource
# catalogue stores foreign keys, while the reviewed Sociology migration uses
# the human domain key in its provenance.
D078_UUID = "5175de27-0a67-58f0-a8f2-53315f5a6c81"

ALLOWED_RELATIONSHIP_TYPES = {
    "builds_on",
    "works_with",
    "complements",
    "alternative",
    "supports",
    "qualifies_for",
}


def load_gzip_json(path: Path):
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        return json.load(handle)


def valid_https(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value.strip())
    return parsed.scheme.lower() == "https" and bool(parsed.netloc)


def sql_unquote(value: str) -> str:
    return value.replace("''", "'")


def reviewed_resource_rows() -> list[dict]:
    """Extract the four reviewed resource VALUES blocks from the migration.

    The migration is the source of truth for the reviewed local contract.  A
    small parser keeps this audit independent of a live database and avoids
    treating the much larger imported resource catalogue as student-approved.
    """

    text = RESOURCE_MIGRATION.read_text(encoding="utf-8")
    block_re = re.compile(
        r"CROSS JOIN \(VALUES(?P<body>.*?)\) AS rows\(resource_type, target_name, provider, delivery, url, description\);",
        re.DOTALL,
    )
    tuple_re = re.compile(
        r"\(\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*\)",
        re.DOTALL,
    )
    scopes = ["programme", "domain", "subgroup", "role"]
    blocks = block_re.findall(text)
    if len(blocks) != len(scopes):
        raise RuntimeError(f"expected {len(scopes)} reviewed resource blocks, found {len(blocks)}")
    rows: list[dict] = []
    for scope, body in zip(scopes, blocks):
        for match in tuple_re.finditer(body):
            resource_type, target_name, provider, delivery, url, description = (
                sql_unquote(value) for value in match.groups()
            )
            rows.append(
                {
                    "ownership_scope": scope,
                    "review_status": "approved_guidance_v1",
                    "resource_type": resource_type,
                    "target_name": target_name,
                    "provider": provider,
                    "delivery": delivery,
                    "url": url,
                    "description": description,
                    "data_state": "source_backed",
                    "source_confidence": "high",
                }
            )
    return rows


def resource_types_for(item_type: str) -> set[str]:
    return {
        "skill": {"skill_learning", "skill_reference"},
        "tool": {"tool_learning"},
        "competency": {"competency_reference"},
        "certification": {"certification_exam", "professional_body"},
    }[item_type]


def item_resource_match(item: dict, resources: list[dict]) -> list[dict]:
    name = str(item.get("name") or "").strip().lower()
    allowed_types = resource_types_for(str(item.get("item_type") or ""))
    scope = item.get("context_level")
    matches: list[dict] = []
    for resource in resources:
        if resource["ownership_scope"] != scope:
            continue
        if resource["resource_type"] not in allowed_types or not valid_https(resource["url"]):
            continue
        target = resource["target_name"].strip().lower()
        if target == name or target.startswith(f"{name} ") or target.startswith(f"{name}:"):
            matches.append(resource)
    return matches


def broad_d078_resources() -> list[dict]:
    rows: list[dict] = []
    if not RESOURCE_PARTS.exists():
        return rows
    for path in sorted(RESOURCE_PARTS.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        for row in payload:
            if row.get("domain_id") == D078_UUID:
                rows.append(row)
    for path in sorted(RESOURCE_PARTS.glob("*.json.gz")):
        for row in load_gzip_json(path):
            if row.get("domain_id") == D078_UUID:
                rows.append(row)
    return rows


def transport_integrity_report(parts_dir: Path, manifest: dict) -> dict:
    """Verify compressed SQL parts against the generated checksum manifest."""

    manifest_parts = manifest.get("parts") or []
    expected_names = [Path(str(entry.get("file") or "")).name for entry in manifest_parts]
    name_counts = Counter(expected_names)
    duplicate_manifest_names = sorted(name for name, count in name_counts.items() if count > 1)
    expected_sequence = list(range(1, len(manifest_parts) + 1))
    manifest_numbers = [entry.get("part") for entry in manifest_parts]
    manifest_order_valid = manifest_numbers == expected_sequence and not duplicate_manifest_names

    actual_paths = sorted(parts_dir.glob("part-*.sql.gz"))
    actual_names = [path.name for path in actual_paths]
    expected_set = set(expected_names)
    actual_set = set(actual_names)
    missing_parts = sorted(expected_set - actual_set)
    unexpected_parts = sorted(actual_set - expected_set)
    entries_by_name = {
        Path(str(entry.get("file") or "")).name: entry for entry in manifest_parts
    }
    byte_mismatches: list[dict] = []
    sha256_mismatches: list[dict] = []
    invalid_gzip_parts: list[str] = []
    transaction_boundary_violations: list[dict] = []
    for path in actual_paths:
        entry = entries_by_name.get(path.name)
        if entry is None:
            continue
        actual_bytes = path.stat().st_size
        if entry.get("bytes") != actual_bytes:
            byte_mismatches.append({"part": path.name, "expected": entry.get("bytes"), "actual": actual_bytes})
        actual_sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
        if entry.get("sha256") != actual_sha256:
            sha256_mismatches.append({"part": path.name, "expected": entry.get("sha256"), "actual": actual_sha256})
        try:
            with gzip.open(path, "rt", encoding="utf-8") as handle:
                sql_text = handle.read()
        except (OSError, EOFError, UnicodeError):
            invalid_gzip_parts.append(path.name)
            continue
        begin_count = len(re.findall(r"(?m)^BEGIN;$", sql_text))
        commit_count = len(re.findall(r"(?m)^COMMIT;$", sql_text))
        if begin_count != 1 or commit_count != 1:
            transaction_boundary_violations.append({"part": path.name, "begin_count": begin_count, "commit_count": commit_count})
    actual_sequence = [
        int(match.group(1))
        for name in actual_names
        if (match := re.fullmatch(r"part-(\d+)\.sql\.gz", name))
    ]
    actual_numbering_valid = actual_sequence == expected_sequence
    integrity_ok = bool(
        manifest_order_valid
        and actual_names == expected_names
        and not missing_parts
        and not unexpected_parts
        and actual_numbering_valid
        and not byte_mismatches
        and not sha256_mismatches
        and not invalid_gzip_parts
        and not transaction_boundary_violations
    )
    return {
        "integrity_ok": integrity_ok,
        "expected_part_count": len(manifest_parts),
        "actual_part_count": len(actual_paths),
        "manifest_order_valid": manifest_order_valid,
        "actual_numbering_valid": actual_numbering_valid,
        "missing_parts": missing_parts,
        "unexpected_parts": unexpected_parts,
        "duplicate_manifest_names": duplicate_manifest_names,
        "byte_mismatches": byte_mismatches,
        "sha256_mismatches": sha256_mismatches,
        "invalid_gzip_parts": invalid_gzip_parts,
        "transaction_boundary_violations": transaction_boundary_violations,
    }


def contextual_seed_transport_audit() -> dict:
    """Check numbered SQL transport and manifest integrity locally."""

    signal_names = (
        "academic and research qualifications",
        "institutional research training and professional association membership where applicable",
    )
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    parts = sorted(CONTEXTUAL_SEED_PARTS.glob("part-*.sql.gz"))
    integrity = transport_integrity_report(CONTEXTUAL_SEED_PARTS, manifest)
    old_signal_hits = 0
    relationship_table_mentions = 0
    for path in parts:
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            text = handle.read()
        old_signal_hits += sum(text.count(name) for name in signal_names)
        relationship_table_mentions += text.count("career_item_relationships")
    return {
        "part_count": len(parts),
        "manifest_part_count": integrity["expected_part_count"],
        "integrity_ok": integrity["integrity_ok"],
        "integrity": integrity,
        "old_d078_generic_certification_signal_hits": old_signal_hits,
        "relationship_table_mentions": relationship_table_mentions,
        "note": "Compressed SQL was decompressed for local inspection only; it was not applied to Supabase.",
    }


def audit() -> dict:
    payload = load_gzip_json(ITEMS_PATH)
    all_items = payload.get("items") or []
    all_relationships = payload.get("relationships") or []
    items = [row for row in all_items if row.get("domain_key") == D078]
    relationships = [row for row in all_relationships if row.get("domain_key") == D078]
    resources = reviewed_resource_rows()

    item_by_identity = {
        (row.get("context_level"), row.get("context_key"), row.get("item_key")): row
        for row in items
    }
    item_states = Counter()
    item_link_states = Counter()
    item_source_url_counts = Counter()
    item_scope_type_gaps = Counter()
    invalid_item_source_urls: list[dict] = []
    item_rows: list[dict] = []

    for item in items:
        level = item.get("context_level")
        owner = item.get("guidance_owner")
        data_state = item.get("data_state")
        refs = item.get("source_references") or []
        locators = item.get("source_locators") or []
        source_urls = [ref.get("url") for ref in refs if isinstance(ref, dict) and ref.get("url")]
        valid_sources = [url for url in source_urls if valid_https(url)]
        invalid_sources = [url for url in source_urls if not valid_https(url)]
        if invalid_sources:
            invalid_item_source_urls.append({"item": item.get("name"), "urls": invalid_sources})
        if data_state == "source_backed" and owner == level:
            if item.get("item_type") == "certification":
                item_states["source_backed_owned_missing_certification_scope"] += 1
            else:
                item_states["source_backed_owned"] += 1
        elif owner in {"review_only", "audit_only", "role_aggregated"}:
            item_states[owner] += 1
        elif data_state in {"review_only", "audit_only", "not_established"}:
            item_states[data_state] += 1
        else:
            item_states["other_or_missing_approval"] += 1
        item_source_url_counts["with_source_reference"] += bool(valid_sources)
        item_source_url_counts["with_source_locator"] += bool(locators)
        item_source_url_counts["invalid_source_url"] += bool(invalid_sources)

        matches = item_resource_match(item, resources)
        if matches:
            item_link_states["matched_approved_resource"] += 1
        else:
            item_link_states["missing_item_specific_resource"] += 1

        if item.get("item_type") == "certification":
            # The contextual-item schema has no scope/type fields.  Keep this
            # explicit: issuer/source evidence is not a credential-scope claim.
            item_scope_type_gaps["missing_explicit_market_scope"] += 1
            item_scope_type_gaps["missing_explicit_credential_type"] += 1

        item_rows.append(
            {
                "context_level": level,
                "context_key": item.get("context_key"),
                "item_type": item.get("item_type"),
                "name": item.get("name"),
                "item_state": (
                    "source_backed_owned_missing_certification_scope"
                    if data_state == "source_backed" and owner == level and item.get("item_type") == "certification"
                    else "source_backed_owned"
                    if data_state == "source_backed" and owner == level
                    else "not_student_approved"
                ),
                "source_reference_count": len(valid_sources),
                "source_locator_count": len(locators),
                "link_state": "matched_approved_resource" if matches else "missing_item_specific_resource",
            }
        )

    # Make the absence of unsafe states explicit in the report instead of
    # relying on a missing Counter key to imply zero.
    for state in ("review_only", "audit_only", "role_aggregated", "not_established", "other_or_missing_approval"):
        item_states.setdefault(state, 0)
    for link_state in ("matched_approved_resource", "missing_item_specific_resource"):
        item_link_states.setdefault(link_state, 0)
    for gap in ("missing_explicit_market_scope", "missing_explicit_credential_type"):
        item_scope_type_gaps.setdefault(gap, 0)

    rel_status = Counter()
    rel_integrity = Counter()
    duplicate_relationships = Counter()
    relationship_rows: list[dict] = []
    for edge in relationships:
        rel_status[f"status:{edge.get('relationship_status')}"] += 1
        rel_status[f"data_state:{edge.get('data_state')}"] += 1
        rel_status[f"type:{edge.get('relationship_type')}"] += 1
        if edge.get("relationship_type") not in ALLOWED_RELATIONSHIP_TYPES:
            rel_integrity["invalid_relationship_type"] += 1
        if edge.get("guidance_owner") != edge.get("context_level"):
            rel_integrity["owner_mismatch"] += 1
        from_key = (edge.get("context_level"), edge.get("context_key"), edge.get("from_item_key"))
        to_key = (edge.get("context_level"), edge.get("context_key"), edge.get("to_item_key"))
        from_ok = from_key in item_by_identity
        to_ok = to_key in item_by_identity
        rel_integrity["from_resolved"] += from_ok
        rel_integrity["to_resolved"] += to_ok
        if not from_ok:
            rel_integrity["from_unresolved"] += 1
        if not to_ok:
            rel_integrity["to_unresolved"] += 1
        if edge.get("relationship_status") == "not_established":
            rel_integrity["not_established_edge"] += 1
        identity = (
            edge.get("context_level"),
            edge.get("context_key"),
            edge.get("from_item_key"),
            edge.get("to_item_key"),
            edge.get("relationship_type"),
        )
        duplicate_relationships[identity] += 1
        relationship_rows.append(
            {
                "from": edge.get("from_name"),
                "to": edge.get("to_name"),
                "type": edge.get("relationship_type"),
                "status": edge.get("relationship_status"),
                "from_resolved": from_ok,
                "to_resolved": to_ok,
            }
        )
    duplicate_count = sum(count - 1 for count in duplicate_relationships.values() if count > 1)
    rel_integrity["duplicate_edge_rows"] = duplicate_count

    broad = broad_d078_resources()
    broad_states = Counter(row.get("data_state") or "missing" for row in broad)
    broad_types = Counter(row.get("resource_type") or "missing" for row in broad)
    broad_levels = Counter(
        "role" if row.get("role_id") else "subgroup" if row.get("subgroup_id") else "domain"
        for row in broad
    )

    domain_audit = json.loads(DOMAIN_AUDIT_PATH.read_text(encoding="utf-8"))
    d078_audit = next(row for row in domain_audit.get("domains", []) if row.get("domain_id") == D078)
    cert_evidence = d078_audit.get("nigerian_certification_evidence") or {}
    programme_context_count = len(re.findall(r"^\s+\('(skill|competency)'", RESOURCE_MIGRATION.read_text(encoding="utf-8"), re.MULTILINE))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    transport = contextual_seed_transport_audit()
    approval_reasons = []
    if not transport["integrity_ok"]:
        approval_reasons.append("The compressed contextual SQL transport does not match its manifest checksums, ordering, or transaction boundaries.")
    if item_scope_type_gaps.get("missing_explicit_market_scope", 0):
        approval_reasons.append("D078 contextual certification items have no explicit market scope or credential type in the API-facing item schema.")
    if item_link_states.get("missing_item_specific_resource", 0):
        approval_reasons.append("Some source-backed student items have no approved item-specific resource match; the UI must retain the honest no-link state.")
    approval_reasons.extend([
        "Live Supabase application and browser verification were not performed.",
    ])

    result = {
        "schema": "2026-09-19.sociology-student-guidance-contract-audit.v1",
        "verified_at": "2026-09-19",
        "url_policy": "HTTPS syntax and source-record presence checked locally; URL reachability/live status was not tested.",
        "inputs": {
            "contextual_items": str(ITEMS_PATH.relative_to(ROOT)),
            "reviewed_resource_migration": str(RESOURCE_MIGRATION.relative_to(ROOT)),
            "domain_certification_audit": str(DOMAIN_AUDIT_PATH.relative_to(ROOT)),
            "contextual_manifest": str(MANIFEST_PATH.relative_to(ROOT)),
        },
        "manifest": {
            "row_count": manifest.get("row_count"),
            "relationship_count": manifest.get("relationship_count"),
        },
        "d078_contextual_items": {
            "total": len(items),
            "by_level": dict(Counter(row.get("context_level") for row in items)),
            "by_type": dict(Counter(row.get("item_type") for row in items)),
            "states": dict(item_states),
            "source_url_counts": dict(item_source_url_counts),
            "link_states": dict(item_link_states),
            "certification_scope_type_gaps": dict(item_scope_type_gaps),
            "certification_names_are_named_credentials": sum(
                row.get("name") not in set(cert_evidence.get("credential_signals") or [])
                for row in items
                if row.get("item_type") == "certification"
            ),
            "invalid_source_url_rows": invalid_item_source_urls,
            "certification_items": [
                row for row in item_rows if row["item_type"] == "certification"
            ],
        },
        "d078_relationships": {
            "total": len(relationships),
            "status_type_counts": dict(rel_status),
            "integrity": dict(rel_integrity),
            "student_visible_source_backed_edges": sum(
                1
                for edge in relationships
                if edge.get("relationship_status") == "source_backed"
                and edge.get("data_state") == "source_backed"
                and edge.get("guidance_owner") == edge.get("context_level")
                and (edge.get("context_level"), edge.get("context_key"), edge.get("from_item_key")) in item_by_identity
                and (edge.get("context_level"), edge.get("context_key"), edge.get("to_item_key")) in item_by_identity
            ),
        },
        "reviewed_resources_from_migration": {
            "total": len(resources),
            "by_scope": dict(Counter(row["ownership_scope"] for row in resources)),
            "by_type": dict(Counter(row["resource_type"] for row in resources)),
            "https_syntax_valid": sum(valid_https(row["url"]) for row in resources),
            "invalid_url_rows": [row["target_name"] for row in resources if not valid_https(row["url"])],
            "student_approval_predicate": "review_status=approved_guidance_v1, ownership_scope matches context level, data_state=source_backed",
        },
        "broad_catalogue_d078_not_approval": {
            "total": len(broad),
            "by_level": dict(broad_levels),
            "by_type": dict(broad_types),
            "by_data_state": dict(broad_states),
            "note": "Imported catalogue rows are reported for separation only; they are not counted as reviewed student links.",
        },
        "sociology_programme_contract": {
            "programme_context_items_in_reviewed_migration": programme_context_count,
            "programme_resources_in_reviewed_migration": sum(row["ownership_scope"] == "programme" for row in resources),
            "domain_certification_audit_current_domain_certifications": len(d078_audit.get("current_domain_certifications") or []),
            "nigerian_certification_evidence_state": cert_evidence.get("evidence_state"),
            "nigerian_certification_source_count": len(cert_evidence.get("sources") or []),
        },
        "contextual_seed_transport": transport,
        "item_rows": item_rows,
        "relationship_rows": relationship_rows,
        "approval_readiness": {
            "scaling_phase_authorized": True,
            "ready_for_live_exposure": False,
            "reasons": approval_reasons,
        },
    }
    return result


def markdown_report(result: dict) -> str:
    items = result["d078_contextual_items"]
    rels = result["d078_relationships"]
    reviewed = result["reviewed_resources_from_migration"]
    broad = result["broad_catalogue_d078_not_approval"]
    programme = result["sociology_programme_contract"]
    transport = result["contextual_seed_transport"]
    certification_count = items["by_type"].get("certification", 0)
    decision_gap = "certification scope/type metadata, " if certification_count else ""
    certification_note = (
        "These rows are therefore a documented gap for approval, not a claim of a universal Nigerian licence or student-facing certification recommendation."
        if certification_count
        else "No contextual certification rows are emitted; generic credential signals remain in the source audit and are not student-facing credentials."
    )
    lines = [
        "# Sociology/D078 Student Guidance Contract Audit (2026-09-19)",
        "",
        "This is a local source-contract audit. HTTPS URL syntax and recorded source fields were checked; URL reachability/live status was not tested.",
        "",
        "## Student-visible contextual items",
        "",
        f"- D078 contextual catalogue rows: **{items['total']}** ({items['by_level']}; types {items['by_type']}).",
        f"- Source-backed and correctly owned: **{items['states'].get('source_backed_owned', 0) + items['states'].get('source_backed_owned_missing_certification_scope', 0)}**; approval-ready after certification metadata: **{items['states'].get('source_backed_owned', 0)}**.",
        f"- Source-reference coverage: **{items['source_url_counts'].get('with_source_reference', 0)}**; source-locator coverage: **{items['source_url_counts'].get('with_source_locator', 0)}**.",
        f"- Approved item-specific resource matches: **{items['link_states'].get('matched_approved_resource', 0)}**; honest no-link states: **{items['link_states'].get('missing_item_specific_resource', 0)}**.",
        "- No-link means the source evidence remains available for audit, but no reviewed resource was attached to that exact item; it is not a claim that no useful resource exists.",
        "",
        "## Normalized relationships",
        "",
        f"- D078 relationship rows: **{rels['total']}**; student-visible source-backed resolved edges: **{rels['student_visible_source_backed_edges']}**.",
        f"- Status/type counts: `{rels['status_type_counts']}`.",
        f"- Integrity: `{rels['integrity']}`. Any review-only, audit-only, not-established or unresolved edge must stay out of student guidance.",
        "",
        "## Reviewed resource contract",
        "",
        f"- Reviewed migration rows: **{reviewed['total']}** by scope `{reviewed['by_scope']}` and type `{reviewed['by_type']}`.",
        f"- HTTPS syntax-valid reviewed URLs: **{reviewed['https_syntax_valid']}**; invalid rows: **{len(reviewed['invalid_url_rows'])}**.",
        f"- Imported broad D078 catalogue rows kept separate from approval: **{broad['total']}** ({broad['by_level']}; states `{broad['by_data_state']}`).",
        f"- Numbered contextual SQL transport parts checked: **{transport['part_count']}**; manifest integrity: **{transport['integrity_ok']}**; old generic D078 certification signal hits: **{transport['old_d078_generic_certification_signal_hits']}**.",
        "- Only the reviewed migration rows count as approved student resources in this audit; broad imported references are not promoted by name overlap.",
        "",
        "## Certification scope",
        "",
        f"- Contextual certification rows: **{items['by_type'].get('certification', 0)}**; named credentials: **{items.get('certification_names_are_named_credentials', 0)}**; explicit market-scope fields: **0**; explicit credential-type fields: **0**.",
        f"- Domain certification audit records no current domain certification rows and reports `{programme['nigerian_certification_evidence_state']}` across {programme['nigerian_certification_source_count']} Nigerian-context source records.",
        f"- {certification_note}",
        "",
        "## Sociology programme layer",
        "",
        f"- Reviewed migration programme context cards: **{programme['programme_context_items_in_reviewed_migration']}**; programme-owned reviewed resources: **{programme['programme_resources_in_reviewed_migration']}**.",
        "- The programme cards and resources are source-recorded; this audit does not claim that their external URLs are live.",
        "",
        "## Decision",
        "",
        f"**Scaling phase authorized locally; live exposure not approved.** The local contract is structurally auditable and fails closed for unresolved/review-only states, but {decision_gap}item-specific link coverage, live Supabase application, and browser verification remain open.",
        "",
        "Generated by `data/career-mapping/_audit_sociology_student_guidance_contract.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    result = audit()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / "sociology_student_guidance_contract_2026-09-19.json"
    md_path = OUT_DIR / "SOCIOLOGY_STUDENT_GUIDANCE_CONTRACT_AUDIT_2026-09-19.md"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(markdown_report(result), encoding="utf-8")
    print(json.dumps({
        "json": str(json_path),
        "markdown": str(md_path),
        "d078_items": result["d078_contextual_items"]["total"],
        "d078_relationships": result["d078_relationships"]["total"],
        "reviewed_resources": result["reviewed_resources_from_migration"]["total"],
        "scaling_phase_authorized": result["approval_readiness"]["scaling_phase_authorized"],
        "ready_for_live_exposure": result["approval_readiness"]["ready_for_live_exposure"],
    }, indent=2))


if __name__ == "__main__":
    main()
