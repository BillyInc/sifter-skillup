"""Read-only full-population downstream audit.

This file is intentionally independent of the older audit inventories.  It
reads the checked-in local contracts and writes only the two sibling
``full_population_agent_*`` report files.  It never applies SQL, calls the
browser, edits generated seed parts, or changes an existing audit artifact.
"""

from __future__ import annotations

import gzip
import json
import re
from collections import Counter, defaultdict
from datetime import date
from json import JSONDecodeError, JSONDecoder
from pathlib import Path
from typing import Any, Iterable, Iterator
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit"
OUT_JSON = AUDIT_DIR / "full_population_agent_audit_2026-09-20.json"
OUT_MD = AUDIT_DIR / "full_population_agent_audit_2026-09-20.md"


def read_json(relative: str) -> Any:
    with (ROOT / relative).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().casefold())


def rel_url(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("url") or value.get("href") or value.get("id")
    return str(value or "").strip()


def valid_https(value: Any) -> bool:
    url = rel_url(value)
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.netloc)


def is_onet_url(value: Any) -> bool:
    host = urlparse(rel_url(value)).netloc.casefold()
    return "onetonline.org" in host or "onetcenter.org" in host


def iter_json_array_field(relative: str, field: str) -> Iterator[dict[str, Any]]:
    """Stream one top-level JSON array without materialising the catalogue."""

    path = ROOT / relative
    opener = gzip.open if path.suffix == ".gz" else open
    marker = f'"{field}"'
    decoder = JSONDecoder()
    chunk_size = 1024 * 1024

    with opener(path, "rt", encoding="utf-8") as handle:
        buffer = ""
        marker_offset = -1
        while marker_offset < 0:
            chunk = handle.read(chunk_size)
            if not chunk:
                raise ValueError(f"top-level array {field!r} not found in {relative}")
            buffer += chunk
            marker_offset = buffer.find(marker)
            if marker_offset < 0:
                # The relationships array follows the very large items array;
                # discard already-scanned text so the search stays bounded.
                buffer = buffer[-(len(marker) - 1) :]

        marker_start = marker_offset + len(marker)
        while "[" not in buffer[marker_start:]:
            chunk = handle.read(chunk_size)
            if not chunk:
                raise ValueError(f"array start for {field!r} not found")
            buffer += chunk
        buffer = buffer[marker_start + buffer[marker_start:].index("[") + 1 :]

        while True:
            buffer = buffer.lstrip()
            if buffer.startswith("]"):
                return
            if buffer.startswith(","):
                buffer = buffer[1:]
                continue
            try:
                value, end = decoder.raw_decode(buffer)
            except JSONDecodeError:
                chunk = handle.read(chunk_size)
                if not chunk:
                    raise ValueError(f"truncated array {field!r} in {relative}")
                buffer += chunk
                continue
            if not isinstance(value, dict):
                raise ValueError(f"array {field!r} contains a non-object row")
            yield value
            buffer = buffer[end:]


def count_state(rows: Iterable[dict[str, Any]], *keys: str) -> Counter[str]:
    result: Counter[str] = Counter()
    for row in rows:
        value = ""
        for key in keys:
            value = row.get(key) or ""
            if value:
                break
        result[str(value or "missing")] += 1
    return result


def audit_contextual_catalogue(manifest: dict[str, Any]) -> dict[str, Any]:
    item_count = 0
    relationship_count = 0
    relationship_states: Counter[str] = Counter()
    relationship_types: Counter[str] = Counter()
    relationship_unresolved = 0
    first_relationship_keys: set[str] = set()
    item_levels: Counter[str] = Counter()
    item_types: Counter[str] = Counter()
    item_states: Counter[str] = Counter()
    item_links: Counter[str] = Counter()
    item_seen: set[tuple[str, str, str, str]] = set()
    duplicate_items: list[dict[str, Any]] = []
    missing_source_refs = 0
    missing_locators = 0
    invalid_link_urls = 0
    onet_link_urls = 0
    onet_source_urls = 0
    ownership_mismatches = 0
    first_item_keys: set[str] = set()
    d078_tool_rows: list[dict[str, Any]] = []
    level_contexts: Counter[tuple[str, str]] = Counter()

    for row in iter_json_array_field("data/career-mapping/contextual_guidance_items.json.gz", "items"):
        item_count += 1
        level = str(row.get("context_level") or "missing")
        context_key = str(row.get("context_key") or "")
        item_type = str(row.get("item_type") or "missing")
        item_key = str(row.get("item_key") or row.get("name") or "")
        item_levels[level] += 1
        item_types[item_type] += 1
        level_contexts[(level, context_key)] += 1
        first_item_keys.update(row.keys())

        data_state = str(row.get("data_state") or "missing")
        link_state = str(row.get("link_state") or "missing")
        item_states[data_state] += 1
        item_links[link_state] += 1
        identity = (level, context_key, item_type, norm(item_key))
        if identity in item_seen and len(duplicate_items) < 100:
            duplicate_items.append({
                "context_level": level,
                "context_key": context_key,
                "item_type": item_type,
                "item_key": item_key,
            })
        item_seen.add(identity)

        refs = row.get("source_references")
        if not isinstance(refs, list) or not refs:
            missing_source_refs += 1
        locators = row.get("source_locators") or row.get("source_locator")
        if not locators:
            missing_locators += 1

        link_url = row.get("link_url") or row.get("resource_url")
        if link_url:
            if not valid_https(link_url):
                invalid_link_urls += 1
            if is_onet_url(link_url):
                onet_link_urls += 1
        for ref in refs if isinstance(refs, list) else []:
            if is_onet_url(ref):
                onet_source_urls += 1

        owner = str(row.get("guidance_owner") or "")
        expected_owner = {"programme": "programme", "domain": "domain", "subgroup": "subgroup", "role": "role"}.get(level)
        if expected_owner and owner and owner != expected_owner:
            ownership_mismatches += 1

        if context_key.startswith("D078") and item_type == "tool":
            d078_tool_rows.append({
                "context_level": level,
                "context_key": context_key,
                "name": row.get("name"),
                "guidance_owner": owner,
                "data_state": data_state,
                "link_state": link_state,
            })

    for row in iter_json_array_field("data/career-mapping/contextual_guidance_items.json.gz", "relationships"):
        relationship_count += 1
        first_relationship_keys.update(row.keys())
        state = str(row.get("relationship_state") or row.get("status") or row.get("data_state") or "missing")
        relationship_states[state] += 1
        relationship_types[str(row.get("relationship_type") or row.get("type") or "missing")] += 1
        if state in {"not_established", "unresolved", "review_required"}:
            relationship_unresolved += 1

    expected_items = int(manifest.get("row_count") or 0)
    expected_relationships = int(manifest.get("relationship_count") or 0)
    return {
        "manifest": {"items": expected_items, "relationships": expected_relationships},
        "observed": {"items": item_count, "relationships": relationship_count},
        "counts_match_manifest": item_count == expected_items and relationship_count == expected_relationships,
        "items_by_context_level": dict(item_levels),
        "items_by_type": dict(item_types),
        "items_by_data_state": dict(item_states),
        "items_by_link_state": dict(item_links),
        "duplicate_typed_item_rows_sample": duplicate_items,
        "duplicate_typed_item_row_count_at_least": len(duplicate_items),
        "missing_source_reference_rows": missing_source_refs,
        "missing_source_locator_rows": missing_locators,
        "invalid_item_link_url_rows": invalid_link_urls,
        "onet_item_link_url_rows": onet_link_urls,
        "onet_source_reference_occurrences": onet_source_urls,
        "ownership_mismatch_rows": ownership_mismatches,
        "item_field_names_sample": sorted(first_item_keys),
        "relationships_by_state": dict(relationship_states),
        "relationships_by_type": dict(relationship_types),
        "relationship_unresolved_or_review_rows": relationship_unresolved,
        "relationship_field_names_sample": sorted(first_relationship_keys),
        "d078_tool_rows": d078_tool_rows,
    }


GENERIC_TOOL_PATTERNS = (
    "software", "browser", "office suite", "spreadsheet", "word processing",
    "presentation software", "electronic mail", "social networking",
    "web browser", "internet browser", "project management software",
)


def audit_domain_tools() -> dict[str, Any]:
    domain_tools = read_json("data/career-mapping/domain_tools.json")
    domain_rows: list[dict[str, Any]] = []
    subgroup_rows: list[dict[str, Any]] = []
    generic_rows: list[dict[str, Any]] = []
    duplicate_rows: list[dict[str, Any]] = []
    cross_level_rows: list[dict[str, Any]] = []

    for domain_id, payload in domain_tools.items():
        if domain_id == "_meta" or not isinstance(payload, dict):
            continue
        domain_names: Counter[str] = Counter()
        domain_entries: list[dict[str, Any]] = []
        for group in ("distinctive_tools", "common_tools"):
            for row in payload.get(group, []) or []:
                if not isinstance(row, dict):
                    continue
                name = str(row.get("tool") or "").strip()
                n = norm(name)
                entry = {"domain_id": domain_id, "scope": "domain", "group": group, "tool": name, "element_name": row.get("element_name"), "source": row.get("source"), "data_state": row.get("data_state")}
                domain_rows.append(entry)
                domain_entries.append(entry)
                domain_names[n] += 1
                if any(pattern in n for pattern in GENERIC_TOOL_PATTERNS):
                    generic_rows.append(entry)
        for name, frequency in domain_names.items():
            if name and frequency > 1:
                duplicate_rows.append({"scope": "domain", "domain_id": domain_id, "tool": name, "occurrences": frequency})

        subgroup_tools = payload.get("subgroup_tools") or {}
        for subgroup_id, subgroup_payload in subgroup_tools.items():
            if not isinstance(subgroup_payload, dict):
                continue
            subgroup_names: Counter[str] = Counter()
            subgroup_entries: list[dict[str, Any]] = []
            for group in ("distinctive", "common"):
                for row in subgroup_payload.get(group, []) or []:
                    if not isinstance(row, dict):
                        continue
                    name = str(row.get("tool") or "").strip()
                    n = norm(name)
                    entry = {"domain_id": domain_id, "subgroup_id": str(subgroup_id), "scope": "subgroup", "group": group, "tool": name, "element_name": row.get("element_name"), "source": row.get("source"), "data_state": row.get("data_state")}
                    subgroup_rows.append(entry)
                    subgroup_entries.append(entry)
                    subgroup_names[n] += 1
                    if any(pattern in n for pattern in GENERIC_TOOL_PATTERNS):
                        generic_rows.append(entry)
            for name, frequency in subgroup_names.items():
                if name and frequency > 1:
                    duplicate_rows.append({"scope": "subgroup", "domain_id": domain_id, "subgroup_id": str(subgroup_id), "tool": name, "occurrences": frequency})
            domain_names_set = {norm(row["tool"]) for row in domain_entries if row["tool"]}
            for row in subgroup_entries:
                if norm(row["tool"]) in domain_names_set:
                    cross_level_rows.append({"domain_id": domain_id, "subgroup_id": str(subgroup_id), "tool": row["tool"], "reason": "same normalized tool appears in domain and subgroup aggregate"})

    d078_generic = [row for row in generic_rows if row["domain_id"] == "D078"]
    d078_office = [row for row in domain_rows + subgroup_rows if row["domain_id"] == "D078" and norm(row["tool"]) == "microsoft office software"]
    return {
        "domain_tool_row_count": len(domain_rows),
        "subgroup_tool_row_count": len(subgroup_rows),
        "generic_or_category_like_row_count": len(generic_rows),
        "generic_category_rows_sample": generic_rows[:200],
        "duplicate_same_scope_rows": duplicate_rows[:500],
        "duplicate_same_scope_row_count": len(duplicate_rows),
        "domain_subgroup_duplicate_rows_sample": cross_level_rows[:500],
        "domain_subgroup_duplicate_row_count": len(cross_level_rows),
        "d078_generic_category_rows": d078_generic,
        "d078_microsoft_office_rows": d078_office,
        "policy_finding": "domain_tools is a role-derived aggregate source layer; generic/category-like rows are not student approvals until explicit ownership and item review exists.",
    }


def audit_curriculum_and_mappings() -> tuple[dict[str, Any], dict[str, Any], list[dict[str, Any]]]:
    scaling = read_json("data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json")
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    mapping_quarantine = read_json("data/career-mapping/_audit/programme_domain_unverified_link_audit_2026-08-19.json")
    generic_contract = read_json("data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json")
    sociology = read_json("data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json")
    by_key = {row["programmeKey"]: row for row in scaling.get("programmes", [])}
    broad_by_key = {row["programme_key"]: row for row in broad.get("canonical_programmes", [])}
    generic_by_key = {f"{row.get('discipline')}::{row.get('programme')}": row for row in generic_contract.get("programmes", [])}
    sociology_key = "Social Sciences::Sociology"

    programme_rows: list[dict[str, Any]] = []
    missing_curriculum: list[str] = []
    mapping_issues: list[dict[str, Any]] = []
    relationship_counts: Counter[str] = Counter()
    for key, broad_row in sorted(broad_by_key.items()):
        scaling_row = by_key.get(key, {})
        curriculum = scaling_row.get("curriculum") or {}
        is_sociology = key == sociology_key or broad_row.get("programme") == "Sociology"
        contract = sociology if is_sociology else generic_by_key.get(key)
        if contract is None:
            missing_curriculum.append(key)
        mapping = broad_row.get("active_domain_mapping") or {}
        links = mapping.get("links") or []
        link_types = Counter(str(row.get("match_type") or "missing") for row in links)
        relationship_counts.update(link_types)
        bad_links = [row for row in links if not row.get("domain_id") or not row.get("domain_name") or row.get("match_type") not in {"direct", "functional", "adjacent"}]
        if bad_links:
            mapping_issues.append({"programme_key": key, "issue": "invalid_active_mapping_rows", "rows": bad_links})
        programme_rows.append({
            "programme_key": key,
            "discipline": broad_row.get("discipline"),
            "programme": broad_row.get("programme"),
            "curriculum_kind": "sociology" if is_sociology else "generic",
            "curriculum_state": curriculum.get("kind") or (contract and "contract_present") or "missing",
            "course_count": curriculum.get("courseCount") or (contract.get("courseCount") if isinstance(contract, dict) else None),
            "outcome_count": curriculum.get("studentOutcomeCount") or (contract.get("studentOutcomeCount") if isinstance(contract, dict) else None),
            "legacy_profile_rows": curriculum.get("legacyProfileRows", 0),
            "active_domain_link_count": len(links),
            "relationship_types": dict(link_types),
            "unverified_domain_link_count": len(mapping.get("unverified_links") or []),
            "resource_review_state": (broad_row.get("resource_review") or {}).get("state"),
            "relationship_review_state": (broad_row.get("relationship_review") or {}).get("state"),
            "admin_review_state": (broad_row.get("admin_review") or {}).get("state"),
            "unresolved_relationship_count": (broad_row.get("relationship_review") or {}).get("unresolved_or_not_established_count", 0),
        })

    curriculum_findings = {
        "canonical_programme_count": len(broad_by_key),
        "generic_contract_programme_count": len(generic_by_key),
        "sociology_contract_present": sociology_key in broad_by_key,
        "programmes_missing_curriculum_contract": missing_curriculum,
        "programmes_with_legacy_profile_rows": sum(1 for row in programme_rows if row["legacy_profile_rows"]),
        "total_legacy_profile_rows": sum(row["legacy_profile_rows"] for row in programme_rows),
        "curriculum_state_counts": dict(Counter(row["curriculum_state"] for row in programme_rows)),
        "total_student_outcome_rows": sum(row["outcome_count"] or 0 for row in programme_rows),
    }
    mapping_findings = {
        "active_mapping_programme_count": sum(1 for row in programme_rows if row["active_domain_link_count"]),
        "programmes_without_active_mapping": [row["programme_key"] for row in programme_rows if not row["active_domain_link_count"]],
        "active_domain_link_count": sum(row["active_domain_link_count"] for row in programme_rows),
        "active_relationship_type_counts": dict(relationship_counts),
        "programmes_with_unverified_links": sum(1 for row in programme_rows if row["unverified_domain_link_count"]),
        "quarantined_unverified_mapping_rows": (mapping_quarantine.get("counts") or {}).get("quarantined_links", 0),
        "quarantined_mapping_decisions": (mapping_quarantine.get("counts") or {}).get("decisions", {}),
        "invalid_active_mapping_rows": mapping_issues,
        "programme_rows": programme_rows,
    }
    return curriculum_findings, mapping_findings, programme_rows


def audit_continuity(programme_rows: list[dict[str, Any]]) -> dict[str, Any]:
    structure = read_json("data/career-mapping/domain_structure.json")
    trace = read_json("data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json")
    domains = {key for key in structure if key != "_meta"}
    subgroups_by_domain: Counter[str] = Counter(row.get("domain_id") for row in trace.get("subgroups", []) if row.get("domain_id"))
    roles_by_domain: Counter[str] = Counter(row.get("domain_id") for row in trace.get("roles", []) if row.get("domain_id"))
    all_broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    missing_domain_registry: list[dict[str, Any]] = []
    no_subgroup_or_role: list[dict[str, Any]] = []
    domain_link_count = 0
    downstream_domain_counts: Counter[str] = Counter()
    for broad_row in all_broad.get("canonical_programmes", []):
        key = broad_row.get("programme_key")
        mapping = broad_row.get("active_domain_mapping") or {}
        for link in mapping.get("links") or []:
            domain_id = str(link.get("domain_id") or "")
            domain_link_count += 1
            downstream_domain_counts[domain_id] += 1
            if domain_id not in domains:
                missing_domain_registry.append({"programme_key": key, "domain_id": domain_id, "domain_name": link.get("domain_name")})
            elif not subgroups_by_domain[domain_id] or not roles_by_domain[domain_id]:
                no_subgroup_or_role.append({"programme_key": key, "domain_id": domain_id, "subgroup_count": subgroups_by_domain[domain_id], "role_count": roles_by_domain[domain_id]})
    return {
        "domain_registry_count": len(domains),
        "trace_subgroup_count": len(trace.get("subgroups", [])),
        "trace_role_count": len(trace.get("roles", [])),
        "active_domain_links_checked": domain_link_count,
        "active_links_missing_domain_registry": missing_domain_registry,
        "active_links_with_no_subgroup_or_role": no_subgroup_or_role,
        "reachable_domain_counts_top20": downstream_domain_counts.most_common(20),
        "domains_with_subgroups": sum(1 for domain in domains if subgroups_by_domain[domain]),
        "domains_with_roles": sum(1 for domain in domains if roles_by_domain[domain]),
        "role_records_without_work_profile": trace.get("counts", {}).get("roles_without_work_profile_row"),
        "roles_without_any_recorded_anchor": trace.get("counts", {}).get("roles_without_any_recorded_anchor"),
        "source_traceability_counts": trace.get("counts", {}),
    }


def audit_jamb_and_admin() -> dict[str, Any]:
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    matrix = read_json("data/career-mapping/_audit/jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json")
    admin = read_json("data/career-mapping/_audit/admin_downstream_acceptance_2026-09-19.json")
    mappings = read_json("data/career-mapping/programme_mapping.json").get("mappings", [])
    jamb_rows = broad.get("jamb_identities", [])
    states = Counter(str(row.get("mapping_status") or "missing") for row in jamb_rows)
    categories = Counter(str(row.get("coverage_category") or "missing") for row in jamb_rows)
    missing_components = [row.get("jamb_name") for row in jamb_rows if not row.get("component_refs")]
    missing_sources = [row.get("jamb_name") for row in jamb_rows if not row.get("source_references")]
    review_resource = Counter((row.get("resource_review") or {}).get("state", "missing") for row in broad.get("canonical_programmes", []))
    review_relationship = Counter((row.get("relationship_review") or {}).get("state", "missing") for row in broad.get("canonical_programmes", []))
    admin_states = Counter((row.get("admin_review") or {}).get("state", "missing") for row in broad.get("canonical_programmes", []))
    return {
        "jamb_identity_count": len(jamb_rows),
        "programme_mapping_row_count": len(mappings),
        "jamb_mapping_status_counts": dict(states),
        "jamb_coverage_category_counts": dict(categories),
        "jamb_rows_without_component_refs": missing_components,
        "jamb_rows_without_source_references": missing_sources,
        "matrix_totals": matrix.get("totals", {}),
        "matrix_category_rows": {row.get("category"): row.get("rows") for row in matrix.get("categories", [])},
        "programme_resource_review_states": dict(review_resource),
        "programme_relationship_review_states": dict(review_relationship),
        "programme_admin_review_states": dict(admin_states),
        "admin_review_queue": admin.get("reviewQueue", {}),
        "admin_decision": admin.get("decision", {}),
        "admin_unmapped_programmes": admin.get("unmappedProgrammes", []),
        "admin_population_identity": admin.get("populationIdentity", {}),
    }


def render_markdown(report: dict[str, Any]) -> str:
    pop = report["population"]
    cur = report["curriculum"]
    mapping = report["mappings"]
    continuity = report["continuity"]
    tools = report["tools"]
    catalogue = report["contextual_catalogue"]
    jamb = report["jamb_and_admin"]
    lines = [
        "# Full-population downstream agent audit",
        "",
        f"Generated: {report['generated_on']}",
        "Scope: 237 canonical programmes, 420 JAMB identities, local curriculum/mapping/downstream contracts.",
        "Mode: read-only local audit; no SQL, browser, UI or existing inventory was changed.",
        "",
        "## Executive result",
        "",
        f"- Population identity: **{pop['programme_count']} programmes / {pop['jamb_identity_count']} JAMB identities**.",
        f"- Curriculum contract: **{cur['generic_contract_programme_count']} generic + Sociology**, with **{cur['programmes_missing_curriculum_contract'].__len__()} missing contracts**.",
        f"- Active programme→domain links: **{mapping['active_domain_link_count']}** across **{mapping['active_mapping_programme_count']} programmes**; unmapped programmes: **{len(mapping['programmes_without_active_mapping'])}**.",
        f"- Contextual transport: **{catalogue['observed']['items']} items / {catalogue['observed']['relationships']} relationships**; manifest match: **{catalogue['counts_match_manifest']}**.",
        f"- Admin state: **{sum(jamb['programme_admin_review_states'].values())} programme queues**, with review states retained; browser/SQL remain outside this audit.",
        "",
        "## Curriculum and programme mapping",
        "",
        f"- Student outcome rows counted from the per-programme scaling records: **{cur['total_student_outcome_rows']}**.",
        f"- Programmes with legacy profile rows retained as audit evidence: **{cur['programmes_with_legacy_profile_rows']}** ({cur['total_legacy_profile_rows']} rows).",
        f"- Active relationship types: `{json.dumps(mapping['active_relationship_type_counts'], sort_keys=True)}`.",
        f"- Programmes with unverified domain links: **{mapping['programmes_with_unverified_links']}**.",
        f"- Quarantined/unverified mapping rows retained outside active guidance: **{mapping['quarantined_unverified_mapping_rows']}** (`{json.dumps(mapping['quarantined_mapping_decisions'], sort_keys=True)}`).",
        f"- Invalid active mapping rows: **{len(mapping['invalid_active_mapping_rows'])} programme-level findings**.",
        "",
        "## Domain → subgroup → role continuity",
        "",
        f"- Domain registry: **{continuity['domain_registry_count']}**; traceability rows: **{continuity['trace_subgroup_count']} subgroups / {continuity['trace_role_count']} roles**.",
        f"- Active links checked for downstream continuity: **{continuity['active_domain_links_checked']}**.",
        f"- Links missing a domain registry record: **{len(continuity['active_links_missing_domain_registry'])}**.",
        f"- Links whose domain has no traced subgroup or role: **{len(continuity['active_links_with_no_subgroup_or_role'])}**.",
        f"- Roles without work-profile rows: **{continuity['role_records_without_work_profile']}**; without any recorded anchor: **{continuity['roles_without_any_recorded_anchor']}**.",
        "",
        "## Tool/category duplication",
        "",
        f"- Aggregate domain tool rows: **{tools['domain_tool_row_count']}**; subgroup aggregate rows: **{tools['subgroup_tool_row_count']}**.",
        f"- Generic/category-like rows: **{tools['generic_or_category_like_row_count']}**.",
        f"- Same-scope duplicate rows: **{tools['duplicate_same_scope_row_count']}**; domain↔subgroup repeated rows: **{tools['domain_subgroup_duplicate_row_count']}**.",
        f"- D078 `Microsoft Office software` aggregate rows: **{len(tools['d078_microsoft_office_rows'])}**.",
        "- These are source-layer findings, not a claim that every row is currently student-visible; they require ownership/category review before promotion.",
        "",
        "## Source, link and relationship states",
        "",
        f"- Contextual items by data state: `{json.dumps(catalogue['items_by_data_state'], sort_keys=True)}`.",
        f"- Contextual items by link state: `{json.dumps(catalogue['items_by_link_state'], sort_keys=True)}`.",
        f"- Missing source-reference rows: **{catalogue['missing_source_reference_rows']}**; missing locator rows: **{catalogue['missing_source_locator_rows']}**.",
        f"- Invalid item-link URLs: **{catalogue['invalid_item_link_url_rows']}**; O*NET item-link URLs: **{catalogue['onet_item_link_url_rows']}**; O*NET source-reference occurrences: **{catalogue['onet_source_reference_occurrences']}**.",
        f"- Relationships by state: `{json.dumps(catalogue['relationships_by_state'], sort_keys=True)}`; by type: `{json.dumps(catalogue['relationships_by_type'], sort_keys=True)}`.",
        f"- Relationship rows unresolved/review-required by the raw catalogue fields: **{catalogue['relationship_unresolved_or_review_rows']}**.",
        f"- Duplicate typed contextual items (sample cap 100): **at least {catalogue['duplicate_typed_item_row_count_at_least']}**.",
        f"- Ownership mismatches: **{catalogue['ownership_mismatch_rows']}**.",
        "- A source reference is not automatically an item-specific learning link. `not_established` relationships remain staff/audit evidence until an item-specific source establishes the edge.",
        "",
        "## JAMB identity and admin queue",
        "",
        f"- JAMB mapping rows: **{jamb['jamb_identity_count']}** identities and **{jamb['programme_mapping_row_count']}** mapping rows.",
        f"- Coverage categories: `{json.dumps(jamb['jamb_coverage_category_counts'], sort_keys=True)}`.",
        f"- JAMB identities without component references: **{len(jamb['jamb_rows_without_component_refs'])}**; without source references: **{len(jamb['jamb_rows_without_source_references'])}**.",
        f"- Programme resource review states: `{json.dumps(jamb['programme_resource_review_states'], sort_keys=True)}`.",
        f"- Programme relationship review states: `{json.dumps(jamb['programme_relationship_review_states'], sort_keys=True)}`.",
        f"- Programme admin review states: `{json.dumps(jamb['programme_admin_review_states'], sort_keys=True)}`.",
        f"- Existing admin queue summary: `{json.dumps(jamb['admin_review_queue'], sort_keys=True)}`.",
        "",
        "## Exact open findings",
        "",
        "1. The aggregate `domain_tools` layer contains generic software/category rows and repeated domain/subgroup tools; D078 includes `Microsoft Office software`. These rows are not accepted as student-facing guidance by this audit.",
        "2. The contextual catalogue is structurally source/state complete according to its local manifest, but O*NET references are present in provenance. Student payload/UI exclusion of legacy O*NET links still requires a separate route/payload proof.",
        "3. The source-enrichment contracts intentionally retain programme-level `review_required` resource and `not_established` relationship states. They are backlog states, not evidence that exhaustive item-specific internet verification has been completed.",
        "4. Roles without work-profile rows remain an admin/source-review continuity gap even when a role anchor exists.",
        "",
        "## Boundary",
        "",
        "This audit does not fetch URLs, apply SQL, run browser proof, alter UI/API/SQL, or overwrite any prior inventory. It reports the checked-in local state only; live deployment and URL reachability remain unproven.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    manifest = read_json("data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json")
    scaling = read_json("data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json")
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    curriculum, mappings, programme_rows = audit_curriculum_and_mappings()
    report = {
        "schema_version": "2026-09-20.full-population-agent-audit.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "population": {
            "programme_count": len(broad.get("canonical_programmes", [])),
            "jamb_identity_count": len(broad.get("jamb_identities", [])),
            "scaling_contract_programme_count": len(scaling.get("programmes", [])),
            "programme_keys_unique": len({row.get("programme_key") for row in broad.get("canonical_programmes", [])}) == len(broad.get("canonical_programmes", [])),
            "jamb_names_unique": len({row.get("jamb_name") for row in broad.get("jamb_identities", [])}) == len(broad.get("jamb_identities", [])),
        },
        "curriculum": curriculum,
        "mappings": mappings,
        "continuity": audit_continuity(programme_rows),
        "tools": audit_domain_tools(),
        "contextual_catalogue": audit_contextual_catalogue(manifest),
        "jamb_and_admin": audit_jamb_and_admin(),
        "inputs": {
            "handoff": "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "mockup_audit": "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "top_down_plan": "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "product_spec": "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "local_contracts": [
                "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
                "data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json",
                "data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json",
                "data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json",
                "data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json",
                "data/career-mapping/contextual_guidance_items.json.gz",
                "data/career-mapping/domain_tools.json",
                "data/career-mapping/domain_structure.json",
                "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            ],
        },
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({
        "json": str(OUT_JSON.relative_to(ROOT)),
        "markdown": str(OUT_MD.relative_to(ROOT)),
        "programmes": report["population"]["programme_count"],
        "jamb_identities": report["population"]["jamb_identity_count"],
        "items": report["contextual_catalogue"]["observed"]["items"],
        "relationships": report["contextual_catalogue"]["observed"]["relationships"],
    }, indent=2))


if __name__ == "__main__":
    main()
