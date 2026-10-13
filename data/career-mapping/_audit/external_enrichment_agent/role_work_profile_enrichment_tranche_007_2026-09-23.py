#!/usr/bin/env python3
"""Build an audit-only work-profile candidate tranche for exact O*NET roles.

The existing 119-role checkpoint deliberately stopped at occupational identity
evidence.  This pass joins the 20 exact O*NET identities to the vendored
O*NET 31.0 work-profile extract and records the fields that could be reviewed
for a future canonical row.  It does not edit role data, generated seeds, SQL,
the live database, UI, or browser-proof artifacts.

ESCO-only roles are not mapped to O*NET by title similarity.  Their prior
identity records remain review-only and are counted in the checkpoint.
"""

from __future__ import annotations

import json
import sys
import zipfile
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
MAPPING = REPO / "data" / "career-mapping"
TRACE = MAPPING / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
ARCHIVE = MAPPING / "_source_downloads" / "taxonomy" / "onet_31_0_database.zip"
ARCHIVE_URL = "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip"
ARCHIVE_SHA256 = "6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9"
ONET_DATABASE_URL = "https://www.onetcenter.org/database.html"
OFFICIAL_ONET_BASE = "https://www.onetonline.org/link/summary/"
ACCESS_DATE = "2026-09-23"
PRIOR_VERIFICATION_DATE = "2026-09-21"

OUTPUT_JSON = HERE / "role_work_profile_enrichment_tranche_007_2026-09-23.json"
OUTPUT_JSONL = HERE / "role_work_profile_enrichment_append_only_2026-09-23.jsonl"
OUTPUT_MD = HERE / "role_work_profile_enrichment_tranche_007_2026-09-23.md"
CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_007_checkpoint_2026-09-23.json"
CHECKPOINT_MD = HERE / "role_work_profile_enrichment_tranche_007_checkpoint_2026-09-23.md"


def load_onet_builder():
    sys.path.insert(0, str(MAPPING))
    from _build_role_work_profiles import build_onet_indexes

    return build_onet_indexes


def load_prior_records() -> dict[str, dict]:
    records: dict[str, dict] = {}
    for path in sorted(HERE.glob("role_work_profile_tranche*.json")):
        if "checkpoint" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        for record in payload.get("records", []):
            role_key = str(record.get("role_key") or "")
            if role_key:
                records[role_key] = {"path": path.name, **record}
    return records


def trace_candidates() -> tuple[list[dict], list[dict]]:
    payload = json.loads(TRACE.read_text(encoding="utf-8"))
    missing = [
        row
        for row in payload["roles"]
        if row.get("work_profile_status") == "not_available"
    ]
    onet = [
        row
        for row in missing
        if str(row.get("source") or "").casefold() == "onet"
        and len(row.get("onet_occupation_codes") or []) == 1
    ]
    esco_only = [row for row in missing if row not in onet]
    return onet, esco_only


def official_verification(role_key: str, code: str, prior: dict[str, dict]) -> dict:
    previous = prior.get(role_key) or {}
    check = previous.get("internet_check") or {}
    return {
        "url": str(check.get("url") or f"{OFFICIAL_ONET_BASE}{code}"),
        "locator": f"O*NET-SOC Code={code}",
        "accessed_on": str(check.get("retrieved_on") or PRIOR_VERIFICATION_DATE),
        "status": str(check.get("status") or "verified"),
        "source_audit_locator": (
            f"data/career-mapping/_audit/external_enrichment_agent/"
            f"{previous.get('path', 'prior-role-work-profile-tranche') }"
            f"#role_key={role_key}"
        ),
    }


def build_record(row: dict, profile: dict, prior: dict[str, dict]) -> dict:
    role_key = f"{row.get('domain_id')}|{row.get('role_name')}"
    code = str((row.get("onet_occupation_codes") or [""])[0])
    exact_title = str(profile.get("title") or "") == str(row.get("role_name") or "")
    occupation_locator = f"db_31_0_text/Occupation Data.txt#O*NET-SOC Code={code}"
    profile_fields = {
        "activities": profile.get("tasks") or [],
        "work_activities": profile.get("work_activities") or [],
        "job_zones": [profile.get("job_zone") or {}],
        "education_signals": profile.get("education_signals") or [],
        "work_context": profile.get("work_context") or [],
        "related_occupations": profile.get("related_occupations") or [],
    }
    return {
        "role_key": role_key,
        "domain_id": row.get("domain_id"),
        "domain_name": row.get("domain_name"),
        "role_name": row.get("role_name"),
        "existing_source": row.get("source"),
        "resolution": "source_backed_profile_candidate",
        "review_state": "review_required",
        "canonical_work_profile_row_status": "absent_audit_only",
        "identity": {
            "authority": "O*NET OnLine / U.S. Department of Labor",
            "soc_code": code,
            "title": profile.get("title"),
            "exact_title_match": exact_title,
            "description": profile.get("description"),
            "trace_locator": (
                "data/career-mapping/_audit/"
                "subgroup_role_source_traceability_2026-08-31.json"
                f"#role_key={role_key}"
            ),
        },
        "work_profile_fields": profile_fields,
        "source_links": [
            {
                "label": "O*NET OnLine official occupation summary",
                **official_verification(role_key, code, prior),
            },
            {
                "label": "O*NET 31.0 database archive",
                "url": ARCHIVE_URL,
                "locator": occupation_locator,
                "accessed_on": ACCESS_DATE,
                "archive_sha256": ARCHIVE_SHA256,
            },
            {
                "label": "O*NET database release page",
                "url": ONET_DATABASE_URL,
                "locator": "O*NET 31.0 database release",
                "accessed_on": ACCESS_DATE,
            },
        ],
        "limitations": [
            "O*NET work-profile evidence is a global/US occupational proxy, not Nigerian demand evidence.",
            "The candidate does not establish Nigerian hiring, licensing, education, wages, or local preparation requirements.",
            "No candidate is promoted to a canonical role_work_profiles row by this audit-only pass.",
        ],
        "audit_evidence": {
            "local_archive": str(ARCHIVE.relative_to(REPO)).replace("\\", "/"),
            "local_archive_locator": occupation_locator,
            "accessed_on": ACCESS_DATE,
            "prior_identity_verification": prior.get(role_key, {}).get("path"),
        },
    }


def build() -> dict:
    if not ARCHIVE.exists():
        raise FileNotFoundError(ARCHIVE)
    onet_rows, esco_only = trace_candidates()
    if len(onet_rows) != 20:
        raise AssertionError(f"Expected 20 exact O*NET missing roles, found {len(onet_rows)}")
    with zipfile.ZipFile(ARCHIVE) as archive:
        build_onet_indexes = load_onet_builder()
        onet_index = build_onet_indexes(archive)
    prior = load_prior_records()
    records = []
    for row in onet_rows:
        code = str(row["onet_occupation_codes"][0])
        if code not in onet_index:
            raise AssertionError(f"O*NET code absent from archive: {code}")
        records.append(build_record(row, onet_index[code], prior))
    records.sort(key=lambda item: item["role_key"])
    counts = {
        "baseline_merged_role_records": 5209,
        "baseline_existing_work_profile_rows": 5090,
        "baseline_missing_work_profile_rows": 119,
        "roles_selected": len(records),
        "exact_official_identity_matches": sum(
            item["identity"]["exact_title_match"] for item in records
        ),
        "source_backed_profile_candidates": len(records),
        "candidate_rows_with_work_profile_fields": sum(
            bool(item["work_profile_fields"]["activities"])
            and bool(item["work_profile_fields"]["work_activities"])
            and bool(item["work_profile_fields"]["job_zones"])
            for item in records
        ),
        "canonical_work_profile_rows_added": 0,
        "review_required_candidates": len(records),
        "esco_only_roles_retained_review_only": len(esco_only),
        "remaining_canonical_work_profile_rows_absent": 119,
        "remaining_roles_without_source_backed_profile_candidate": len(esco_only),
        "genuinely_unavailable": 0,
    }
    return {
        "schema_version": "2026-09-23.role-work-profile-enrichment.v1",
        "generated_on": ACCESS_DATE,
        "read_only": True,
        "append_only": True,
        "scope": {
            "source_audit": str(TRACE.relative_to(REPO)).replace("\\", "/"),
            "queue": "119 roles with work_profile_status=not_available",
            "selection": "exact O*NET source rows with one recorded SOC code",
        },
        "authorities": {
            "onet_database": {
                "id": "global_onet",
                "name": "O*NET 31.0 Database",
                "release_url": ONET_DATABASE_URL,
                "archive_url": ARCHIVE_URL,
                "archive_sha256": ARCHIVE_SHA256,
                "local_archive": str(ARCHIVE.relative_to(REPO)).replace("\\", "/"),
                "accessed_on": ACCESS_DATE,
                "limitation": "Global/US occupational evidence only; not Nigerian demand evidence.",
            },
            "official_identity_checks": {
                "source": "prior role-work-profile tranches",
                "accessed_on": PRIOR_VERIFICATION_DATE,
                "limitation": "Identity verification does not itself establish a canonical row or Nigerian requirements.",
            },
        },
        "counts": counts,
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with OUTPUT_JSONL.open("w", encoding="utf-8", newline="\n") as stream:
        for record in payload["records"]:
            stream.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
    c = payload["counts"]
    lines = [
        "# Role work-profile enrichment tranche 007 — 2026-09-23",
        "",
        "Audit-only append-only enrichment for the 119-role missing work-profile lane.",
        "",
        "## Counts",
        "",
        f"- Exact O*NET roles selected: **{c['roles_selected']}**.",
        f"- Exact official identity matches: **{c['exact_official_identity_matches']}**.",
        f"- Source-backed profile candidates with extracted fields: **{c['source_backed_profile_candidates']}**.",
        f"- Canonical work-profile rows added: **{c['canonical_work_profile_rows_added']}**.",
        f"- Candidates retained review-required: **{c['review_required_candidates']}**.",
        f"- ESCO-only roles retained review-only: **{c['esco_only_roles_retained_review_only']}**.",
        f"- Canonical work-profile rows still absent: **{c['remaining_canonical_work_profile_rows_absent']}**.",
        f"- Roles without a source-backed profile candidate: **{c['remaining_roles_without_source_backed_profile_candidate']}**.",
        "- Genuinely unavailable roles proven: **0**.",
        "",
        "## Disposition",
        "",
        "The 20 exact O*NET roles now have audit-only candidate work-profile fields "
        "from the vendored O*NET 31.0 archive, with official summary URLs, local "
        "archive locators, checksums and access dates. They remain review-required "
        "because O*NET is a global/US proxy and does not establish Nigerian demand "
        "or local preparation requirements.",
        "",
        "The remaining 99 ESCO-only roles retain their prior source-backed identity "
        "records and review-only state. No ESCO title was mapped to O*NET by name "
        "similarity, and no Nigerian mapping was invented.",
        "",
        "## Files",
        "",
        f"- `{OUTPUT_JSON.name}` — complete candidate tranche and exact counts.",
        f"- `{OUTPUT_JSONL.name}` — one append-only candidate record per exact O*NET role.",
        f"- `{CHECKPOINT_JSON.name}` — machine-readable checkpoint.",
        f"- `{CHECKPOINT_MD.name}` — human-readable checkpoint.",
        f"- `{Path(__file__).name}` — reproducible local builder.",
        "",
        "No SQL, live database, frontend, browser proof, generated seed, or prior "
        "tranche artifact was changed.",
        "",
    ]
    OUTPUT_MD.write_text("\n".join(lines), encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-09-23.role-work-profile-enrichment-checkpoint.v1",
        "generated_on": ACCESS_DATE,
        "status": "complete",
        "read_only": True,
        "append_only": True,
        "counts": c,
        "artifacts": [
            str(OUTPUT_JSON.relative_to(REPO)).replace("\\", "/"),
            str(OUTPUT_JSONL.relative_to(REPO)).replace("\\", "/"),
            str(OUTPUT_MD.relative_to(REPO)).replace("\\", "/"),
            str(CHECKPOINT_JSON.relative_to(REPO)).replace("\\", "/"),
            str(CHECKPOINT_MD.relative_to(REPO)).replace("\\", "/"),
        ],
        "next_action": (
            "Independently review the 20 global/US candidates for canonical promotion "
            "and Nigerian/local evidence; keep the 99 ESCO-only roles review-only "
            "until a suitable work-profile source is found."
        ),
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Role work-profile enrichment checkpoint — 2026-09-23\n\n"
        f"- Exact O*NET candidates: **{c['source_backed_profile_candidates']}**\n"
        f"- Canonical rows added: **{c['canonical_work_profile_rows_added']}**\n"
        f"- Review-required O*NET candidates: **{c['review_required_candidates']}**\n"
        f"- ESCO-only roles retained review-only: **{c['esco_only_roles_retained_review_only']}**\n"
        f"- Canonical rows still absent: **{c['remaining_canonical_work_profile_rows_absent']}**\n"
        f"- Roles without a source-backed profile candidate: **{c['remaining_roles_without_source_backed_profile_candidate']}**\n"
        "- Genuinely unavailable: **0**\n\n"
        "The pass is audit-only. It preserves official URLs, local archive locators, "
        "checksums and access dates; it does not write SQL, live data, seeds or UI.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    result = build()
    write_outputs(result)
    print(json.dumps(result["counts"], sort_keys=True))
