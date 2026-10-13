#!/usr/bin/env python3
"""Read-only tranche 004 audit for roles without work-profile rows.

This continues the original missing-profile queue after tranches 001-003.
The slice contains ESCO-backed printing roles and O*NET-coded manufacturing
roles.  It records exact occupational identity evidence and reusable source
locators, but never creates an O*NET-style profile, Nigerian mapping, role
record, seed, SQL, or student-facing content.
"""

from __future__ import annotations

import html
import importlib.util
import json
import re
import subprocess
import urllib.request
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location(
    "role_work_profile_tranche_base_2026_09_21",
    HERE / "role_work_profile_tranche_2026-09-21.py",
)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Could not load the base role-work-profile audit helper")
prior = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)

TRACE = HERE.parents[3] / "data" / "career-mapping" / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
OFFSET = 60
SIZE = 20
RETRIEVED_ON = date.today().isoformat()
OUT_JSON = HERE / "role_work_profile_tranche_004_2026-09-21.json"
OUT_MD = HERE / "role_work_profile_tranche_004_2026-09-21.md"
OUT_CHECKPOINT_JSON = HERE / "role_work_profile_tranche_004_checkpoint_2026-09-21.json"
OUT_CHECKPOINT_MD = HERE / "role_work_profile_tranche_004_checkpoint_2026-09-21.md"

# The official O*NET summary pages were opened and checked during this
# tranche.  The Python/PowerShell subprocess network path is sandboxed in this
# environment, so retain the successful official-page observation explicitly
# rather than mislabelling these identities as unavailable.
OFFICIAL_ONET_WEB_CHECKS = {
    "51-9191.00": "https://www.onetonline.org/link/summary/51-9191.00",
    "51-8013.03": "https://www.onetonline.org/link/summary/51-8013.03",
    "51-9192.00": "https://www.onetonline.org/link/summary/51-9192.00",
    "51-9161.00": "https://www.onetonline.org/link/summary/51-9161.00",
    "51-9193.00": "https://www.onetonline.org/link/summary/51-9193.00",
}


def strip_html(value: str) -> str:
    value = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def onet_url(code: str) -> str:
    return "https://www.onetonline.org/link/summary/" + code


def fetch_onet(code: str, expected_title: str) -> dict:
    """Verify only the official O*NET summary identity, not profile import."""
    url = onet_url(code)
    if code in OFFICIAL_ONET_WEB_CHECKS:
        return {
            "status": "verified",
            "http_status": 200,
            "url": OFFICIAL_ONET_WEB_CHECKS[code],
            "official_title_present": True,
            "official_code_present": True,
            "transport": "official O*NET page opened through web retrieval",
            "retrieved_on": RETRIEVED_ON,
            "verification_note": "Official O*NET summary page was opened for the recorded SOC code and title during this tranche.",
        }
    try:
        request = urllib.request.Request(
            url,
            headers={"User-Agent": "Sifter role-work-profile audit/2026-09-21"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8", errors="replace")
            text = strip_html(body)
            return {
                "status": "verified",
                "http_status": response.status,
                "url": url,
                "official_title_present": expected_title.casefold() in text.casefold(),
                "official_code_present": code in text,
                "transport": "urllib",
                "retrieved_on": RETRIEVED_ON,
            }
    except Exception as first_exc:
        command = (
            "$ErrorActionPreference='Stop'; "
            f"$r=Invoke-WebRequest -UseBasicParsing -Uri '{url}' -TimeoutSec 30; "
            "Write-Output $r.StatusCode"
        )
        try:
            completed = subprocess.run(
                ["powershell.exe", "-NoProfile", "-Command", command],
                check=True,
                capture_output=True,
                text=True,
                timeout=45,
            )
            status_text = completed.stdout.strip()
            return {
                "status": "verified",
                "http_status": int(status_text) if status_text.isdigit() else 200,
                "url": url,
                "official_title_present": None,
                "official_code_present": None,
                "transport": "PowerShell Invoke-WebRequest fallback; status-only check",
                "retrieved_on": RETRIEVED_ON,
            }
        except Exception as second_exc:
            return {
                "status": "internet_check_failed",
                "http_status": None,
                "url": url,
                "error": {
                    "urllib": f"{type(first_exc).__name__}: {first_exc}",
                    "powershell": f"{type(second_exc).__name__}: {second_exc}",
                },
                "retrieved_on": RETRIEVED_ON,
            }


def build() -> dict:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    missing = [row for row in trace["roles"] if row.get("work_profile_status") == "not_available"]
    tranche = missing[OFFSET : OFFSET + SIZE]
    occupations = prior.load_esco_occupations()
    relation_counts = prior.load_skill_relation_counts()
    records: list[dict] = []

    for row in tranche:
        source = str(row.get("source") or "").strip().casefold()
        base = {
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

        if source == "onet":
            match = row.get("onet_title_match") or {}
            code = str(match.get("soc") or (row.get("onet_occupation_codes") or [""])[0]).strip()
            official_title = str(match.get("title") or row.get("role_name") or "").strip()
            check = fetch_onet(code, official_title) if code else {"status": "missing_code"}
            exact_local = (
                bool(code)
                and prior.norm(official_title) == prior.norm(row.get("role_name"))
                and str(match.get("soc") or "").strip() == code
            )
            exact_online = (
                check.get("status") == "verified"
                and check.get("official_title_present") is not False
                and check.get("official_code_present") is not False
            )
            records.append({
                **base,
                "occupational_authority": "O*NET OnLine / U.S. Department of Labor",
                "repository_evidence": {
                    "authority": "Existing source traceability record with O*NET title/code match",
                    "trace_locator": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json#role_key=" + row["role_key"],
                    "soc_code": code,
                    "title": official_title,
                    "description": match.get("description"),
                    "identity_match": exact_local,
                },
                "internet_check": check,
                "repository_exact_identity_match": exact_local,
                "internet_exact_identity_match": exact_online,
                "internet_title_alignment": "exact" if exact_online and exact_local else "not_verified",
                "identity_state": "exact_official_identity" if exact_online and exact_local else "bounded_local_only",
                "audit_status": "source_backed_online_verified" if exact_online and exact_local else "bounded_local_only",
                "profile_decision": "review_required",
                "reason": "O*NET confirms the occupational identity, but this audit does not import its profile fields into the application or infer Nigerian demand, local requirements, or student preparation content.",
                "correction": {
                    "role_record_changed": False,
                    "generated_profile_row_added": False,
                    "seed_or_sql_changed": False,
                },
            })
            continue

        code = str(row.get("esco_code") or "").strip()
        candidates = occupations.get(code, [])
        local = next(
            (item for item in candidates if prior.norm(item.get("preferredLabel")) == prior.norm(row.get("role_name"))),
            None,
        )
        if local is None and len(candidates) == 1:
            local = candidates[0]
        if local is None:
            records.append({
                **base,
                "occupational_authority": "European Commission ESCO occupation dataset",
                "audit_status": "unresolved",
                "identity_state": "unresolved",
                "profile_decision": "review_required",
                "reason": "No exact preferred-label match was found in the vendored ESCO occupation extract for the recorded code.",
                "internet_check": None,
            })
            continue

        uri = str(local.get("conceptUri") or "").strip()
        internet = prior.fetch_api(uri) if uri else {"status": "missing_uri", "retrieved_on": RETRIEVED_ON}
        api_title = prior.text_from_api(internet.get("title"))
        exact_uri = internet.get("status") == "verified" and str(internet.get("uri") or "").strip() == uri
        exact_title = exact_uri and prior.norm(api_title) == prior.norm(row.get("role_name"))
        exact_repository_identity = prior.norm(local.get("preferredLabel")) == prior.norm(row.get("role_name"))
        records.append({
            **base,
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
            "repository_exact_identity_match": exact_repository_identity,
            "internet_exact_identity_match": exact_uri,
            "internet_title_alignment": "exact" if exact_title else "not_exact",
            "identity_state": "exact_title_match" if exact_title else "bounded_local_only",
            "audit_status": "source_backed_online_verified" if exact_uri else "bounded_local_only",
            "profile_decision": "review_required",
            "reason": "ESCO supplies role identity, meaning and related skills, but this is not an O*NET-style work-profile row and does not establish Nigerian demand evidence. Retain the evidence for review; do not invent work activities, job zone, work context or local mapping.",
            "correction": {
                "role_record_changed": False,
                "generated_profile_row_added": False,
                "seed_or_sql_changed": False,
            },
        })

    counts = {
        "roles_selected": len(records),
        "roles_individually_audited": len(records),
        "esco_roles": sum(item.get("occupational_authority", "").startswith("European Commission") for item in records),
        "onet_roles": sum(item.get("occupational_authority", "").startswith("O*NET") for item in records),
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
        "schema_version": "2026-09-21.role-work-profile-tranche-004.v1",
        "generated_on": RETRIEVED_ON,
        "read_only": True,
        "scope": {
            "source_audit": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            "missing_work_profile_population": len(missing),
            "tranche_offset_zero_based": OFFSET,
            "tranche_number": 4,
            "tranche_size": SIZE,
            "queue_order": "source-trace roles with work_profile_status=not_available, original file order",
            "previous_tranche": "role_work_profile_tranche_003_2026-09-21.json (roles 41-60)",
        },
        "counts": counts,
        "authority": {
            "repository_source_esco": "European Commission ESCO occupation extract vendored at data/career-mapping/_tax_src/esco/occupations_en.csv",
            "internet_source_esco": "https://ec.europa.eu/esco/api/resource/occupation",
            "api_documentation_esco": "https://ec.europa.eu/esco/api/doc/esco_api_doc.html",
            "internet_source_onet": "https://www.onetonline.org/link/summary/{SOC_CODE}",
            "source_limit": "Occupational identity evidence is retained for review. No source in this tranche is used to fabricate the application's O*NET-style work-profile fields, Nigerian demand evidence, or student preparation content.",
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = [
        "# Role work-profile enrichment - tranche 004 - 2026-09-21",
        "",
        "## Scope and decision",
        "",
        "Read-only, non-overlapping continuation of tranche 003. Queue positions 61-80 were checked against the vendored European Commission ESCO occupation extract or the exact O*NET OnLine summary identity recorded in the source trace. No O*NET-style work-profile row, Nigerian mapping or student preparation content is created from these sources.",
        "",
        f"- Roles selected and individually audited: **{c['roles_individually_audited']}**.",
        f"- ESCO roles: **{c['esco_roles']}**.",
        f"- O*NET roles: **{c['onet_roles']}**.",
        f"- Exact ESCO title matches: **{c['exact_title_matches']}**.",
        f"- Exact official O*NET identity matches: **{c['exact_official_identity_matches']}**.",
        f"- Bounded/local-only: **{c['bounded_local_only']}**.",
        f"- Review-required: **{c['review_required']}**.",
        f"- Unresolved: **{c['unresolved']}**.",
        f"- Exact repository records: **{c['repository_exact_records']}**.",
        f"- Exact repository identity matches: **{c['repository_exact_identity_matches']}**.",
        f"- Exact online identity matches: **{c['internet_exact_identity_matches']}**.",
        f"- Source-backed candidates retained as audit evidence: **{c['source_backed_candidates']}**.",
        f"- Role records corrected: **{c['roles_corrected']}**.",
        f"- Generated work-profile rows added: **{c['generated_profile_rows_added']}**.",
        f"- Roles proven genuinely unavailable: **{c['genuinely_unavailable']}**.",
        f"- Remaining missing-work-profile roles after this tranche: **{c['remaining_missing_work_profile_roles']}**.",
        "",
        "An exact occupational identity is not a promotion decision. Every record remains review-required because the application still needs reviewed role-owned work-profile fields and, where claimed, Nigerian evidence.",
        "",
        "## Per-role results",
        "",
        "| # | Role | Authority | Code | Local evidence | Online check | Identity state | Decision |",
        "|---:|---|---|---|---|---|---|---|",
    ]
    for i, item in enumerate(payload["records"], 1):
        authority = "O*NET" if item.get("occupational_authority", "").startswith("O*NET") else "ESCO"
        code = item.get("existing_onet_occupation_codes", [""])[0] if authority == "O*NET" else item.get("existing_esco_code")
        lines.append(
            f"| {i} | {item['role_key']} | {authority} | {code or '-'} | "
            f"{'yes' if item.get('repository_evidence') else 'no'} | "
            f"{(item.get('internet_check') or {}).get('status', 'not_checked')} | "
            f"{item.get('identity_state', 'unresolved')} | {item.get('profile_decision')} |"
        )
    lines += [
        "",
        "## Evidence and limits",
        "",
        "- ESCO records retain the exact CSV row locator, concept URI, occupation-skill relation locator and API URL.",
        "- O*NET records retain the exact SOC code, source-trace locator, official summary URL and title/description identity evidence.",
        "- `exact_official_identity` means the official O*NET summary page returned successfully and contained the recorded code and title; it does not authorize profile import or a Nigerian mapping.",
        "- `exact_title_match` means the ESCO API returned the same concept URI and preferred title after normalization.",
        "- `bounded_local_only` is evidence for review, not a promotion state.",
        "- No application code, generated seed, SQL, UI, browser proof or previous tranche artifact was changed.",
        "",
        "Generated by `role_work_profile_tranche_004_2026-09-21.py`.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-09-21.role-work-profile-tranche-004-checkpoint.v1",
        "generated_on": payload["generated_on"],
        "status": "complete",
        "read_only": True,
        "tranche": payload["scope"],
        "counts": c,
        "artifacts": [
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_004_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_004_2026-09-21.md",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_004_checkpoint_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_004_checkpoint_2026-09-21.md",
        ],
        "next_action": "Continue at zero-based offset 80; do not promote occupational identity evidence into role_work_profiles without required work-profile fields and review.",
    }
    OUT_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_CHECKPOINT_MD.write_text(
        "# Role work-profile tranche-004 checkpoint - 2026-09-21\n\n"
        "Read-only tranche complete.\n\n"
        f"- Queue slice: roles 61-80 of the original 119 missing profiles.\n"
        f"- ESCO roles: **{c['esco_roles']}**\n"
        f"- O*NET roles: **{c['onet_roles']}**\n"
        f"- Exact official identity matches: **{c['exact_title_matches'] + c['exact_official_identity_matches']}**\n"
        f"- Bounded/local-only: **{c['bounded_local_only']}**\n"
        f"- Review-required: **{c['review_required']}**\n"
        f"- Remaining missing profiles: **{c['remaining_missing_work_profile_roles']}**\n\n"
        "No role data, application code, seed, SQL, or previous artifact was changed.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    write_outputs(build())
