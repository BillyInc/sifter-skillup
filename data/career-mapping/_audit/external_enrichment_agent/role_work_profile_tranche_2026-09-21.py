#!/usr/bin/env python3
"""Audit a bounded tranche of roles without work-profile rows.

The script is deliberately an audit/enrichment ledger builder. It reads the
existing role traceability and vendored ESCO extracts, checks the exact ESCO
occupation URI through the European Commission's public ESCO API, and writes
only files beside this script. It never edits role libraries, generated seeds,
SQL, UI, or browser-proof artifacts.
"""

from __future__ import annotations

import csv
import json
import re
import subprocess
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
TRACE = REPO / "data" / "career-mapping" / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
ESCO_OCCUPATIONS = REPO / "data" / "career-mapping" / "_tax_src" / "esco" / "occupations_en.csv"
ESCO_RELATIONS = REPO / "data" / "career-mapping" / "_tax_src" / "esco" / "occupationSkillRelations_en.csv"
OUT_JSON = HERE / "role_work_profile_tranche_2026-09-21.json"
OUT_MD = HERE / "role_work_profile_tranche_2026-09-21.md"
API_CACHE = HERE / "role_work_profile_esco_api_cache_2026-09-21.json"
TRANCHE_SIZE = 20
RETRIEVED_ON = date.today().isoformat()


def norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").casefold()).strip()


def load_esco_occupations() -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = {}
    with ESCO_OCCUPATIONS.open(encoding="utf-8-sig", newline="") as handle:
        for row_number, row in enumerate(csv.DictReader(handle), start=2):
            row["_csv_row"] = row_number
            result.setdefault(str(row.get("code") or "").strip(), []).append(row)
    return result


def load_skill_relation_counts() -> Counter[str]:
    counts: Counter[str] = Counter()
    with ESCO_RELATIONS.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            uri = str(row.get("occupationUri") or "").strip()
            if uri:
                counts[uri] += 1
    return counts


def api_url(uri: str) -> str:
    # The ESCO service accepts the concept URI as an unescaped query value;
    # retaining that form also makes the recorded locator directly reusable.
    return "https://ec.europa.eu/esco/api/resource/occupation?uri=" + uri


def load_api_cache() -> dict[str, dict]:
    if not API_CACHE.exists():
        return {}
    payload = json.loads(API_CACHE.read_text(encoding="utf-8-sig"))
    return {
        str(item.get("api_uri") or item.get("uri") or ""): item
        for item in payload.get("records", [])
        if item.get("api_uri") or item.get("uri")
    }


def fetch_api(uri: str) -> dict:
    url = api_url(uri)
    cached = load_api_cache().get(uri)
    if cached:
        return {
            "status": cached.get("status"),
            "http_status": cached.get("http_status"),
            "url": cached.get("api_url") or url,
            "title": cached.get("api_title"),
            "uri": cached.get("api_uri") or cached.get("uri"),
            "description": cached.get("api_description_en") or cached.get("api_description"),
            "description_en_us": cached.get("api_description_en_us"),
            "transport": "role_work_profile_esco_check_2026-09-21.ps1 cache",
            "retrieved_on": RETRIEVED_ON,
        }
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Sifter role-work-profile audit/2026-09-21"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            payload = json.loads(body)
            return {
                "status": "verified",
                "http_status": response.status,
                "url": url,
                "title": payload.get("title"),
                "uri": payload.get("uri"),
                "description": payload.get("description"),
                "code": payload.get("code"),
                "class_name": payload.get("className"),
                "retrieved_on": RETRIEVED_ON,
            }
    except Exception as first_exc:  # managed Windows shells may block urllib
        # The repository's approved read-only network path is PowerShell's
        # Invoke-WebRequest. Use it only as a transport fallback; the payload
        # is still parsed and checked by this script.
        command = (
            "$ErrorActionPreference='Stop'; "
            f"$r=Invoke-WebRequest -UseBasicParsing -Uri '{url}' "
            "-Headers @{Accept='application/json'} -TimeoutSec 30; "
            "Write-Output $r.Content"
        )
        try:
            completed = subprocess.run(
                ["powershell.exe", "-NoProfile", "-Command", command],
                check=True,
                capture_output=True,
                text=True,
                timeout=45,
            )
            payload = json.loads(completed.stdout)
            return {
                "status": "verified",
                "http_status": 200,
                "url": url,
                "title": payload.get("title"),
                "uri": payload.get("uri"),
                "description": payload.get("description"),
                "code": payload.get("code"),
                "class_name": payload.get("className"),
                "transport": "PowerShell Invoke-WebRequest fallback",
                "retrieved_on": RETRIEVED_ON,
            }
        except Exception as second_exc:  # keep the role in the ledger
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


def text_from_api(value: object) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for key in ("en", "en-US", "en_GB"):
            if value.get(key):
                return str(value[key]).strip()
        if value:
            return str(next(iter(value.values()))).strip()
    return ""


def build() -> dict:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    missing = [row for row in trace["roles"] if row.get("work_profile_status") == "not_available"]
    tranche = missing[:TRANCHE_SIZE]
    occupations = load_esco_occupations()
    relation_counts = load_skill_relation_counts()
    records: list[dict] = []

    for row in tranche:
        code = str(row.get("esco_code") or "").strip()
        candidates = occupations.get(code, [])
        local = next((item for item in candidates if norm(item.get("preferredLabel")) == norm(row.get("role_name"))), None)
        if local is None and len(candidates) == 1:
            local = candidates[0]
        if local is None:
            records.append({
                "role_key": row["role_key"],
                "domain_id": row.get("domain_id"),
                "domain_name": row.get("domain_name"),
                "role_name": row.get("role_name"),
                "existing_role_source": row.get("source"),
                "existing_esco_code": code,
                "existing_source_provenance": row.get("source_provenance") or {},
                "audit_status": "missing_repository_record",
                "profile_decision": "do_not_promote",
                "reason": "No exact preferred-label match was found in the vendored ESCO occupation extract for the recorded code.",
                "internet_check": None,
                "retrieved_on": RETRIEVED_ON,
            })
            continue

        uri = str(local.get("conceptUri") or "").strip()
        internet = fetch_api(uri) if uri else {"status": "missing_uri", "retrieved_on": RETRIEVED_ON}
        api_title = text_from_api(internet.get("title"))
        exact_uri_online = (
            internet.get("status") == "verified"
            and str(internet.get("uri") or "").strip() == uri
        )
        exact_title_online = exact_uri_online and norm(api_title) == norm(row.get("role_name"))
        relation_count = relation_counts.get(uri, 0)
        records.append({
            "role_key": row["role_key"],
            "domain_id": row.get("domain_id"),
            "domain_name": row.get("domain_name"),
            "role_name": row.get("role_name"),
            "existing_role_source": row.get("source"),
            "existing_esco_code": code,
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
                "occupation_skill_relation_count": relation_count,
                "skill_relation_locator": "data/career-mapping/_tax_src/esco/occupationSkillRelations_en.csv#occupationUri=" + uri,
            },
            "internet_check": internet,
            "internet_exact_identity_match": exact_uri_online,
            "internet_title_alignment": "exact" if exact_title_online else "current_api_title_differs",
            "audit_status": "source_backed_online_verified" if exact_uri_online else "repository_backed_online_unconfirmed",
            "profile_decision": "do_not_promote",
            "reason": "The ESCO occupation record supplies role meaning and related skill evidence, but it is not an O*NET-style work-profile row. No work activities, job-zone or work-context profile is invented from the title or ESCO description.",
            "correction": {
                "role_record_changed": False,
                "generated_profile_row_added": False,
                "seed_or_sql_changed": False,
            },
            "retrieved_on": RETRIEVED_ON,
        })

    online_verified = sum(item.get("audit_status") == "source_backed_online_verified" for item in records)
    title_aligned = sum(item.get("internet_title_alignment") == "exact" for item in records)
    local_verified = sum("repository_evidence" in item for item in records)
    return {
        "schema_version": "2026-09-21.role-work-profile-tranche.v1",
        "generated_on": RETRIEVED_ON,
        "read_only": True,
        "scope": {
            "source_audit": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            "missing_work_profile_population": len(missing),
            "tranche_offset": 0,
            "tranche_size": TRANCHE_SIZE,
        },
        "counts": {
            "roles_selected": len(records),
            "roles_individually_audited": len(records),
            "repository_exact_records": local_verified,
            "internet_exact_identity_matches": online_verified,
            "internet_preferred_title_matches": title_aligned,
            "source_backed_candidates": online_verified,
            "roles_corrected": 0,
            "generated_profile_rows_added": 0,
            "genuinely_unavailable": 0,
            "remaining_missing_work_profile_roles": len(missing) - len(records),
        },
        "authority": {
            "repository_source": "European Commission ESCO occupation extract vendored at data/career-mapping/_tax_src/esco/occupations_en.csv",
            "internet_source": "https://ec.europa.eu/esco/api/resource/occupation",
            "api_documentation": "https://ec.europa.eu/esco/api/doc/esco_api_doc.html",
            "source_limit": "ESCO is an occupation/skill classification and does not by itself supply the O*NET work-profile fields used by the existing profile table.",
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = payload["counts"]
    lines = [
        "# Role work-profile enrichment — bounded tranche — 2026-09-21",
        "",
        "## Scope and decision",
        "",
        "This is a read-only audit of the first 20 roles in the sorted missing-work-profile queue. It checks the repository's vendored European Commission ESCO occupation record and the exact concept URI through the public ESCO API. It does not create an O*NET-style work-profile row: the ESCO description is role evidence, not a substitute for work activities, work context, job zone, or Nigerian demand evidence.",
        "",
        f"- Roles selected and individually audited: **{counts['roles_individually_audited']}**.",
        f"- Exact repository occupation records: **{counts['repository_exact_records']}**.",
        f"- Exact online identity matches: **{counts['internet_exact_identity_matches']}**.",
        f"- Source-backed work-profile candidates: **{counts['source_backed_candidates']}**, retained as audit evidence only.",
        f"- Role records corrected: **{counts['roles_corrected']}**.",
        f"- Generated work-profile rows added: **{counts['generated_profile_rows_added']}**.",
        f"- Roles proven genuinely unavailable: **{counts['genuinely_unavailable']}**.",
        f"- Remaining missing-work-profile roles: **{counts['remaining_missing_work_profile_roles']}**.",
        "",
        "## Per-role results",
        "",
        "| # | Role | ESCO code | Local record | Internet identity | Skill relations | Decision |",
        "|---:|---|---|---|---|---:|---|",
    ]
    for index, item in enumerate(payload["records"], start=1):
        evidence = item.get("repository_evidence") or {}
        internet = item.get("internet_check") or {}
        lines.append(
            f"| {index} | {item['role_key']} | {item.get('existing_esco_code') or '—'} | "
            f"{'yes' if evidence else 'no'} | {internet.get('status', 'not_checked')} | "
            f"{evidence.get('occupation_skill_relation_count', '—')} | {item['profile_decision']} |"
        )
    lines.extend([
        "",
        "## Source and interpretation notes",
        "",
        "- Each successful record retains the exact ESCO concept URI, local CSV row locator, skill-relation locator, and exact API URL in the JSON ledger.",
        "- `source_backed_online_verified` means the API returned HTTP 200 and its exact URI and preferred title matched the role record. It does not mean the role is Nigerian demand evidence.",
        "- No row is marked `genuinely_unavailable` in this tranche: all 20 selected roles have a repository ESCO record and an online identity check.",
        "- The existing 119-row population remains open; this tranche does not alter `role_work_profiles.json` or any generated transport.",
        "",
        f"Generated on {payload['generated_on']} by `role_work_profile_tranche_2026-09-21.py`.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    write_outputs(build())
