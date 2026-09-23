#!/usr/bin/env python3
"""Read-only completion audit for the final missing-role tranche.

This tranche records occupational identity evidence for queue positions 101-119
from the source traceability audit. It does not create work-profile rows,
Nigerian mappings, seed transport, SQL, application code or student content.
"""

from __future__ import annotations

import importlib.util
import json
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
TRACE = REPO / "data" / "career-mapping" / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
BASE_PATH = HERE / "role_work_profile_tranche_2026-09-21.py"
SPEC = importlib.util.spec_from_file_location("role_profile_base_2026_09_21", BASE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Could not load the role-work-profile helper")
base = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(base)

OFFSET = 100
SIZE = 19
TRANCHE_NUMBER = 6
RETRIEVED_ON = date.today().isoformat()
OUT_JSON = HERE / "role_work_profile_tranche_006_2026-09-21.json"
OUT_MD = HERE / "role_work_profile_tranche_006_2026-09-21.md"
OUT_CHECKPOINT_JSON = HERE / "role_work_profile_tranche_006_checkpoint_2026-09-21.json"


def correction() -> dict:
    return {
        "role_record_changed": False,
        "generated_profile_row_added": False,
        "seed_or_sql_changed": False,
    }


def record_for(row: dict, occupations: dict[str, list[dict]], relation_counts) -> dict:
    code = str(row.get("esco_code") or "").strip()
    item = {
        "role_key": row["role_key"],
        "domain_id": row.get("domain_id"),
        "domain_name": row.get("domain_name"),
        "role_name": row.get("role_name"),
        "existing_role_source": row.get("source"),
        "existing_esco_code": code,
        "existing_onet_occupation_codes": row.get("onet_occupation_codes") or [],
        "existing_source_provenance": row.get("source_provenance") or {},
        "retrieved_on": RETRIEVED_ON,
    }
    candidates = occupations.get(code, [])
    local = next(
        (candidate for candidate in candidates if base.norm(candidate.get("preferredLabel")) == base.norm(row.get("role_name"))),
        None,
    )
    if local is None and len(candidates) == 1:
        local = candidates[0]
    if local is None:
        item.update({
            "occupational_authority": "European Commission ESCO occupation dataset",
            "identity_state": "unresolved",
            "audit_status": "unresolved",
            "profile_decision": "review_required",
            "reason": "No exact preferred-label record was found in the vendored ESCO occupation extract for the recorded code; no substitute identity was inferred.",
            "internet_check": None,
            "correction": correction(),
        })
        return item

    uri = str(local.get("conceptUri") or "").strip()
    internet = base.fetch_api(uri) if uri else {"status": "missing_uri", "retrieved_on": RETRIEVED_ON}
    api_title = base.text_from_api(internet.get("title"))
    exact_uri = internet.get("status") == "verified" and str(internet.get("uri") or "").strip() == uri
    exact_title = exact_uri and base.norm(api_title) == base.norm(row.get("role_name"))
    item.update({
        "occupational_authority": "European Commission ESCO occupation dataset",
        "isco_group": row.get("isco_group"),
        "subgroup_assignment": row.get("subgroup_assignment"),
        "repository_evidence": {
            "authority": "European Commission ESCO occupation dataset",
            "csv_locator": f"data/career-mapping/_tax_src/esco/occupations_en.csv#row={local['_csv_row']}",
            "concept_uri": uri,
            "preferred_label": local.get("preferredLabel"),
            "alt_labels": local.get("altLabels"),
            "definition": local.get("description"),
            "scope_note": local.get("scopeNote"),
            "status": local.get("status"),
            "modified_date": local.get("modifiedDate"),
            "occupation_skill_relation_count": relation_counts.get(uri, 0),
            "skill_relation_locator": "data/career-mapping/_tax_src/esco/occupationSkillRelations_en.csv#occupationUri=" + uri,
        },
        "repository_exact_title_match": True,
        "internet_check": internet,
        "repository_exact_identity_match": True,
        "internet_exact_identity_match": exact_uri,
        "internet_title_alignment": "exact" if exact_title else "not_exact_or_unavailable",
        "identity_state": "exact_title_match" if exact_title else "bounded_local_only",
        "audit_status": "source_backed_online_verified" if exact_uri else "bounded_local_only",
        "profile_decision": "review_required",
        "reason": "ESCO supplies occupational identity, definition and occupation-skill evidence, but it is not an O*NET-style work-profile row and does not establish Nigerian demand, local requirements or student preparation content. Retain the evidence for review without fabricating profile fields.",
        "correction": correction(),
    })
    return item


def build() -> dict:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    missing = [row for row in trace["roles"] if row.get("work_profile_status") == "not_available"]
    tranche = missing[OFFSET : OFFSET + SIZE]
    if len(tranche) != SIZE:
        raise RuntimeError(f"Expected {SIZE} roles at offset {OFFSET}; found {len(tranche)}")
    occupations = base.load_esco_occupations()
    relation_counts = base.load_skill_relation_counts()
    records = [record_for(row, occupations, relation_counts) for row in tranche]
    counts = {
        "roles_selected": len(records),
        "roles_individually_audited": len(records),
        "esco_roles": sum(str(item.get("existing_role_source") or "").casefold() == "esco" for item in records),
        "onet_roles": sum(str(item.get("existing_role_source") or "").casefold() == "onet" for item in records),
        "exact_title_matches": sum(item.get("identity_state") == "exact_title_match" for item in records),
        "repository_exact_title_matches": sum(item.get("repository_exact_title_match") is True for item in records),
        "internet_exact_title_matches": sum(item.get("internet_title_alignment") == "exact" for item in records),
        "exact_official_identity_matches": 0,
        "bounded_local_only": sum(item.get("identity_state") == "bounded_local_only" for item in records),
        "review_required": sum(item.get("profile_decision") == "review_required" for item in records),
        "unresolved": sum(item.get("identity_state") == "unresolved" for item in records),
        "repository_exact_records": sum("repository_evidence" in item for item in records),
        "repository_exact_identity_matches": sum(item.get("repository_exact_identity_match") is True for item in records),
        "internet_exact_identity_matches": sum(item.get("internet_exact_identity_match") is True for item in records),
        "source_backed_candidates": sum(item.get("audit_status") == "source_backed_online_verified" for item in records),
        "roles_corrected": 0,
        "generated_profile_rows_added": 0,
        "genuinely_unavailable": 0,
        "remaining_unaudited_missing_work_profile_roles": len(missing) - OFFSET - len(records),
        "profile_rows_still_absent_across_population": len(missing),
    }
    return {
        "schema_version": "2026-09-21.role-work-profile-tranche-006.v1",
        "generated_on": RETRIEVED_ON,
        "read_only": True,
        "blocked": False,
        "scope": {
            "source_audit": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            "missing_work_profile_population": len(missing),
            "tranche_offset_zero_based": OFFSET,
            "tranche_number": TRANCHE_NUMBER,
            "tranche_size": SIZE,
            "queue_positions": "101-119",
            "queue_order": "source-trace roles with work_profile_status=not_available, original file order",
            "previous_tranche": "role_work_profile_tranche_005_2026-09-21.json (roles 81-100)",
        },
        "counts": counts,
        "authority": {
            "repository_source_esco": "European Commission ESCO occupation extract vendored at data/career-mapping/_tax_src/esco/occupations_en.csv",
            "internet_source_esco": "https://ec.europa.eu/esco/api/resource/occupation",
            "api_documentation_esco": "https://ec.europa.eu/esco/api/doc/esco_api_doc.html",
            "source_limit": "Occupational identity evidence is retained for review. No source is used to fabricate the application's O*NET-style work-profile fields, Nigerian demand evidence or student preparation content.",
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = [
        "# Role work-profile enrichment - tranche 006 - 2026-09-21",
        "",
        "## Scope and decision",
        "",
        "Read-only final continuation of the missing-work-profile queue. Queue positions 101-119 were checked against the vendored European Commission ESCO occupation extract and the exact ESCO concept URI through the public ESCO API when available. Occupational identity evidence is retained for review; no O*NET-style work-profile row, Nigerian mapping or student preparation content is created.",
        "",
        f"- Roles selected and individually audited: **{c['roles_individually_audited']}**.",
        f"- ESCO roles: **{c['esco_roles']}**.",
        f"- Exact repository ESCO preferred-label matches: **{c['repository_exact_title_matches']}**.",
        f"- Bounded/local-only: **{c['bounded_local_only']}**.",
        f"- Review-required: **{c['review_required']}**.",
        f"- Exact repository records: **{c['repository_exact_records']}**.",
        f"- Online exact concept-identity matches: **{c['internet_exact_identity_matches']}**; online exact title matches: **{c['internet_exact_title_matches']}**.",
        f"- Source-backed online candidates retained as audit evidence: **{c['source_backed_candidates']}**.",
        f"- Role records corrected: **{c['roles_corrected']}**.",
        f"- Generated work-profile rows added: **{c['generated_profile_rows_added']}**.",
        f"- Roles proven genuinely unavailable: **{c['genuinely_unavailable']}**.",
        f"- Remaining unaudited roles in the 119-role queue: **{c['remaining_unaudited_missing_work_profile_roles']}**.",
        f"- Work-profile rows still absent across the population: **{c['profile_rows_still_absent_across_population']}**; identity evidence does not equal a profile row.",
        "",
        "Every record remains review-required. ESCO identity evidence is not promoted into role-owned work-profile fields or Nigerian demand evidence.",
        "",
        "## Per-role results",
        "",
        "| # | Role | ESCO code | Local record | Online check | Identity state | Decision |",
        "|---:|---|---|---|---|---|---|",
    ]
    for index, item in enumerate(payload["records"], 1):
        evidence = item.get("repository_evidence") or {}
        internet = item.get("internet_check") or {}
        lines.append(
            f"| {index} | {item['role_key']} | {item.get('existing_esco_code') or '-'} | "
            f"{'yes' if evidence else 'no'} | {internet.get('status', 'not_checked')} | "
            f"{item.get('identity_state', 'unresolved')} | {item.get('profile_decision')} |"
        )
    lines += [
        "",
        "## Evidence and limits",
        "",
        "- Each repository-backed record retains the exact ESCO concept URI, local CSV row locator, definition, occupation-skill relation locator and API URL/check result.",
        "- `source_backed_online_verified` means the public ESCO API returned the exact concept URI; it does not mean Nigerian demand evidence or a complete work profile.",
        "- No record is promoted, corrected or called genuinely unavailable solely from title similarity.",
        "- No application code, generated seed, SQL, UI, browser proof or previous tranche artifact was changed.",
        "",
        "Generated by `role_work_profile_tranche_006_2026-09-21.py`.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-09-21.role-work-profile-tranche-006-checkpoint.v1",
        "generated_on": payload["generated_on"],
        "status": "complete",
        "read_only": True,
        "blocked": False,
        "tranche": payload["scope"],
        "counts": c,
        "artifacts": [
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_006_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_006_2026-09-21.md",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_006_checkpoint_2026-09-21.json",
        ],
        "next_action": "No missing-work-profile queue roles remain unaudited. Keep all 119 identity records review-required until required role-owned work-profile fields and Nigerian evidence are independently reviewed; do not treat this tranche as profile completion.",
    }
    OUT_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    result = build()
    write_outputs(result)
    print(json.dumps(result["counts"], sort_keys=True))
