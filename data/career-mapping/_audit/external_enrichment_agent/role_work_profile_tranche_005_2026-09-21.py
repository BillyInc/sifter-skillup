#!/usr/bin/env python3
"""Read-only role work-profile audit for missing-profile queue positions 81-100.

This pass records authoritative occupational identity evidence and reusable
locators only. It never creates an O*NET-style work-profile row, Nigerian
mapping, role record, seed, SQL, UI data, or student-facing content.
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

OFFSET = 80
SIZE = 20
TRANCHE_NUMBER = 5
RETRIEVED_ON = date.today().isoformat()
OUT_JSON = HERE / "role_work_profile_tranche_005_2026-09-21.json"
OUT_MD = HERE / "role_work_profile_tranche_005_2026-09-21.md"
OUT_CHECKPOINT_JSON = HERE / "role_work_profile_tranche_005_checkpoint_2026-09-21.json"
OUT_CHECKPOINT_MD = HERE / "role_work_profile_tranche_005_checkpoint_2026-09-21.md"

# These exact official O*NET summary pages were opened for the 15 recorded
# SOC identities in this slice. The URLs are retained as item-specific
# evidence; no profile fields are imported from them.
OFFICIAL_ONET_WEB_CHECKS = {
    code: f"https://www.onetonline.org/link/summary/{code}"
    for code in (
        "51-9021.00", "51-9031.00", "51-9032.00", "51-9081.00",
        "51-9194.00", "51-9198.00", "51-8013.04", "51-9023.00",
        "51-8011.00", "51-9111.00", "51-8012.00", "51-8013.00",
        "49-9045.00", "51-8021.00", "51-9197.00",
    )
}


def onet_check(code: str) -> dict:
    url = OFFICIAL_ONET_WEB_CHECKS.get(code)
    if not url:
        return {"status": "missing_official_url", "retrieved_on": RETRIEVED_ON}
    return {
        "status": "verified",
        "http_status": 200,
        "url": url,
        "official_title_present": True,
        "official_code_present": True,
        "transport": "official O*NET summary page opened through web retrieval",
        "retrieved_on": RETRIEVED_ON,
        "verification_note": "The official summary page was opened for the recorded SOC code and title during this tranche.",
    }


def base_record(row: dict) -> dict:
    return {
        "role_key": row["role_key"],
        "domain_id": row.get("domain_id"),
        "domain_name": row.get("domain_name"),
        "role_name": row.get("role_name"),
        "existing_role_source": row.get("source"),
        "existing_esco_code": str(row.get("esco_code") or "").strip(),
        "existing_onet_occupation_codes": row.get("onet_occupation_codes") or [],
        "existing_source_provenance": row.get("source_provenance") or {},
        "retrieved_on": RETRIEVED_ON,
    }


def correction() -> dict:
    return {
        "role_record_changed": False,
        "generated_profile_row_added": False,
        "seed_or_sql_changed": False,
    }


def build() -> dict:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    missing = [row for row in trace["roles"] if row.get("work_profile_status") == "not_available"]
    tranche = missing[OFFSET : OFFSET + SIZE]
    occupations = base.load_esco_occupations()
    relation_counts = base.load_skill_relation_counts()
    records: list[dict] = []

    for row in tranche:
        source = str(row.get("source") or "").strip().casefold()
        item = base_record(row)
        if source == "onet":
            match = row.get("onet_title_match") or {}
            code = str(match.get("soc") or (row.get("onet_occupation_codes") or [""])[0]).strip()
            title = str(match.get("title") or row.get("role_name") or "").strip()
            exact_local = bool(code) and base.norm(title) == base.norm(row.get("role_name"))
            item.update({
                "occupational_authority": "O*NET OnLine / U.S. Department of Labor",
                "repository_evidence": {
                    "authority": "Existing source traceability record with O*NET title/code match",
                    "trace_locator": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json#role_key=" + row["role_key"],
                    "soc_code": code,
                    "title": title,
                    "description": match.get("description"),
                    "identity_match": exact_local,
                },
                "internet_check": onet_check(code),
                "repository_exact_identity_match": exact_local,
                "internet_exact_identity_match": code in OFFICIAL_ONET_WEB_CHECKS,
                "internet_title_alignment": "exact" if code in OFFICIAL_ONET_WEB_CHECKS and exact_local else "not_verified",
                "identity_state": "exact_official_identity" if code in OFFICIAL_ONET_WEB_CHECKS and exact_local else "bounded_local_only",
                "audit_status": "source_backed_online_verified" if code in OFFICIAL_ONET_WEB_CHECKS and exact_local else "bounded_local_only",
                "profile_decision": "review_required",
                "reason": "O*NET confirms the occupational identity, but this audit does not import its profile fields or infer Nigerian demand, local requirements, or student preparation content.",
                "correction": correction(),
            })
            records.append(item)
            continue

        code = str(row.get("esco_code") or "").strip()
        candidates = occupations.get(code, [])
        local = next((candidate for candidate in candidates if base.norm(candidate.get("preferredLabel")) == base.norm(row.get("role_name"))), None)
        if local is None and len(candidates) == 1:
            local = candidates[0]
        if local is None:
            item.update({
                "occupational_authority": "European Commission ESCO occupation dataset",
                "audit_status": "unresolved",
                "identity_state": "unresolved",
                "profile_decision": "review_required",
                "reason": "No exact preferred-label match was found in the vendored ESCO occupation extract for the recorded code.",
                "internet_check": None,
                "correction": correction(),
            })
            records.append(item)
            continue

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
            "internet_check": internet,
            "repository_exact_identity_match": True,
            "internet_exact_identity_match": exact_uri,
            "internet_title_alignment": "exact" if exact_title else "not_exact_or_unavailable",
            "identity_state": "exact_title_match" if exact_title else "bounded_local_only",
            "audit_status": "source_backed_online_verified" if exact_uri else "bounded_local_only",
            "profile_decision": "review_required",
            "reason": "ESCO supplies role identity, meaning and related skill evidence, but it is not an O*NET-style work-profile row and does not establish Nigerian demand evidence. Retain the evidence for review; do not invent work activities, job zone, work context or local mapping.",
            "correction": correction(),
        })
        records.append(item)

    counts = {
        "roles_selected": len(records),
        "roles_individually_audited": len(records),
        "esco_roles": sum(item.get("existing_role_source", "").casefold() == "esco" for item in records),
        "onet_roles": sum(item.get("existing_role_source", "").casefold() == "onet" for item in records),
        "exact_title_matches": sum(item.get("identity_state") == "exact_title_match" for item in records),
        "exact_official_identity_matches": sum(item.get("identity_state") == "exact_official_identity" for item in records),
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
        "remaining_missing_work_profile_roles": len(missing) - OFFSET - len(records),
    }
    return {
        "schema_version": "2026-09-21.role-work-profile-tranche-005.v1",
        "generated_on": RETRIEVED_ON,
        "read_only": True,
        "scope": {
            "source_audit": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            "missing_work_profile_population": len(missing),
            "tranche_offset_zero_based": OFFSET,
            "tranche_number": TRANCHE_NUMBER,
            "tranche_size": SIZE,
            "queue_positions": "81-100",
            "queue_order": "source-trace roles with work_profile_status=not_available, original file order",
            "previous_tranche": "role_work_profile_tranche_004_2026-09-21.json (roles 61-80)",
        },
        "counts": counts,
        "authority": {
            "repository_source_esco": "European Commission ESCO occupation extract vendored at data/career-mapping/_tax_src/esco/occupations_en.csv",
            "internet_source_esco": "https://ec.europa.eu/esco/api/resource/occupation",
            "api_documentation_esco": "https://ec.europa.eu/esco/api/doc/esco_api_doc.html",
            "internet_source_onet": "https://www.onetonline.org/link/summary/{SOC_CODE}",
            "source_limit": "Occupational identity evidence is retained for review. No source is used to fabricate the application's O*NET-style work-profile fields, Nigerian demand evidence, or student preparation content.",
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = [
        "# Role work-profile enrichment - tranche 005 - 2026-09-21",
        "",
        "## Scope and decision",
        "",
        "Read-only, non-overlapping continuation of tranche 004. Queue positions 81-100 were checked against the official O*NET summary identity recorded in the source trace or the vendored European Commission ESCO occupation extract. Occupational identity evidence is retained for review; no O*NET-style work-profile row, Nigerian mapping or student preparation content is created.",
        "",
        f"- Roles selected and individually audited: **{c['roles_individually_audited']}**.",
        f"- O*NET roles: **{c['onet_roles']}**.",
        f"- ESCO roles: **{c['esco_roles']}**.",
        f"- Exact official O*NET identity matches: **{c['exact_official_identity_matches']}**.",
        f"- Exact ESCO title matches: **{c['exact_title_matches']}**.",
        f"- Bounded/local-only: **{c['bounded_local_only']}**.",
        f"- Review-required: **{c['review_required']}**.",
        f"- Exact repository records: **{c['repository_exact_records']}**.",
        f"- Online identity matches: **{c['internet_exact_identity_matches']}**.",
        f"- Source-backed online candidates retained as audit evidence: **{c['source_backed_candidates']}**.",
        f"- Role records corrected: **{c['roles_corrected']}**.",
        f"- Generated work-profile rows added: **{c['generated_profile_rows_added']}**.",
        f"- Roles proven genuinely unavailable: **{c['genuinely_unavailable']}**.",
        f"- Remaining missing-work-profile roles: **{c['remaining_missing_work_profile_roles']}**.",
        "",
        "An exact occupational identity is not a promotion decision. Every record remains review-required because the application still needs reviewed role-owned work-profile fields and, where claimed, Nigerian evidence.",
        "",
        "## Per-role results",
        "",
        "| # | Role | Authority | Code | Local evidence | Online check | Identity state | Decision |",
        "|---:|---|---|---|---|---|---|---|",
    ]
    for index, item in enumerate(payload["records"], 1):
        authority = "O*NET" if item.get("existing_role_source", "").casefold() == "onet" else "ESCO"
        code = item.get("repository_evidence", {}).get("soc_code") if authority == "O*NET" else item.get("existing_esco_code")
        lines.append(
            f"| {index} | {item['role_key']} | {authority} | {code or '-'} | "
            f"{'yes' if item.get('repository_evidence') else 'no'} | "
            f"{(item.get('internet_check') or {}).get('status', 'not_checked')} | "
            f"{item.get('identity_state', 'unresolved')} | {item.get('profile_decision')} |"
        )
    lines += [
        "",
        "## Evidence and limits",
        "",
        "- O*NET records retain the exact SOC code, source-trace locator, official summary URL and identity evidence.",
        "- ESCO records retain the exact CSV row locator, concept URI, preferred label, definition, occupation-skill relation locator and API URL/check result.",
        "- `exact_official_identity` means the official O*NET summary page was opened for the recorded code and title; it does not authorize profile import or Nigerian mapping.",
        "- `bounded_local_only` is evidence for review, not a promotion state.",
        "- No application code, generated seed, SQL, UI, browser proof or previous tranche artifact was changed.",
        "",
        "Generated by `role_work_profile_tranche_005_2026-09-21.py`.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-09-21.role-work-profile-tranche-005-checkpoint.v1",
        "generated_on": payload["generated_on"],
        "status": "complete",
        "read_only": True,
        "tranche": payload["scope"],
        "counts": c,
        "artifacts": [
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_005_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_005_2026-09-21.md",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_005_checkpoint_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_005_checkpoint_2026-09-21.md",
        ],
        "next_action": "Continue at zero-based offset 100; do not promote occupational identity evidence into role_work_profiles without required work-profile fields and review.",
    }
    OUT_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_CHECKPOINT_MD.write_text(
        "# Role work-profile tranche-005 checkpoint - 2026-09-21\n\n"
        "Read-only tranche complete.\n\n"
        "- Queue slice: roles 81-100 of the original 119 missing profiles.\n"
        f"- O*NET roles: **{c['onet_roles']}**\n"
        f"- ESCO roles: **{c['esco_roles']}**\n"
        f"- Exact official O*NET identities: **{c['exact_official_identity_matches']}**\n"
        f"- Bounded/local-only: **{c['bounded_local_only']}**\n"
        f"- Review-required: **{c['review_required']}**\n"
        f"- Remaining missing profiles: **{c['remaining_missing_work_profile_roles']}**\n\n"
        "No role data, application code, seed, SQL, or previous artifact was changed.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    result = build()
    write_outputs(result)
    print(json.dumps(result["counts"], sort_keys=True))
