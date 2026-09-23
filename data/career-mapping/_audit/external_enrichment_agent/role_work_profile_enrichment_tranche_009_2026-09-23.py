#!/usr/bin/env python3
"""Build tranche 009 for the missing role work-profile queue.

This is an audit-only, checkpoint-first pass.  It selects at most 20 remaining
ESCO-sourced roles whose role label has exactly one O*NET 31.0 SOC code in the
official ``Job Titles.txt`` extract, then extracts the matched O*NET occupation
profile from the same official archive.  Exact title identity is not treated as
Nigerian demand, local licensing, local education, or a canonical mapping.

The script writes only append-only audit artifacts beside this file.  It never
edits role data, SQL, generated seeds, the frontend, the live database, or
browser-proof artifacts.
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
MAPPING = REPO / "data" / "career-mapping"
TRACE = MAPPING / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
ARCHIVE = MAPPING / "_source_downloads" / "taxonomy" / "onet_31_0_database.zip"
ARCHIVE_URL = "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip"
ARCHIVE_SHA256 = "6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9"
ONET_DATABASE_URL = "https://www.onetcenter.org/database.html"
ONET_BASE = "https://www.onetonline.org/link/summary/"
ACCESS_DATE = "2026-09-23"
TRANCHE_SIZE = 20

SELECTION_JSON = HERE / "role_work_profile_enrichment_tranche_009_2026-09-23_selection.json"
PRE_CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_009_pre_search_checkpoint_2026-09-23.json"
OUT_JSON = HERE / "role_work_profile_enrichment_tranche_009_2026-09-23.json"
OUT_JSONL = HERE / "role_work_profile_enrichment_append_only_tranche_009_2026-09-23.jsonl"
OUT_MD = HERE / "role_work_profile_enrichment_tranche_009_2026-09-23.md"
CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_009_checkpoint_2026-09-23.json"
CHECKPOINT_MD = HERE / "role_work_profile_enrichment_tranche_009_checkpoint_2026-09-23.md"


def norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").casefold()).strip()


def load_builder():
    sys.path.insert(0, str(MAPPING))
    from _build_role_work_profiles import build_onet_indexes

    return build_onet_indexes


def prior_role_keys() -> set[str]:
    keys: set[str] = set()
    for path in HERE.glob("role_work_profile_enrichment_tranche_*.json"):
        if "checkpoint" in path.name or "selection" in path.name or "_009_" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        keys.update(str(row.get("role_key")) for row in payload.get("records", []) if row.get("role_key"))
    return keys


def remaining_missing_roles() -> list[dict]:
    payload = json.loads(TRACE.read_text(encoding="utf-8"))
    prior = prior_role_keys()
    return [
        row
        for row in payload["roles"]
        if row.get("work_profile_status") == "not_available"
        and str(row.get("source") or "").casefold() == "esco"
        and f"{row.get('domain_id')}|{row.get('role_name')}" not in prior
    ]


def load_exact_job_titles(archive: zipfile.ZipFile) -> dict[str, set[str]]:
    result: dict[str, set[str]] = {}
    text = archive.read("db_31_0_text/Job Titles.txt").decode("utf-8-sig")
    for line in text.splitlines():
        columns = line.split("\t")
        if len(columns) < 2 or not columns[0] or not columns[1]:
            continue
        result.setdefault(norm(columns[1]), set()).add(columns[0])
    return result


def select_roles() -> tuple[list[dict], list[dict], dict[str, set[str]]]:
    with zipfile.ZipFile(ARCHIVE) as archive:
        title_index = load_exact_job_titles(archive)
    remaining = remaining_missing_roles()
    selected: list[dict] = []
    excluded: list[dict] = []
    for row in remaining:
        role_key = f"{row['domain_id']}|{row['role_name']}"
        codes = sorted(title_index.get(norm(row["role_name"]), set()))
        if len(codes) == 1 and len(selected) < TRANCHE_SIZE:
            selected.append(
                {
                    "role_key": role_key,
                    "domain_id": row["domain_id"],
                    "domain_name": row.get("domain_name"),
                    "role_name": row["role_name"],
                    "existing_source": row.get("source"),
                    "esco_code": row.get("esco_code"),
                    "onet_code": codes[0],
                    "identity_source": "db_31_0_text/Job Titles.txt",
                    "identity_locator": f"db_31_0_text/Job Titles.txt#O*NET-SOC Code={codes[0]}&Title={row['role_name']}",
                }
            )
        else:
            reason = "no exact O*NET Job Titles label" if not codes else "ambiguous O*NET Job Titles label"
            excluded.append({"role_key": role_key, "role_name": row["role_name"], "codes": codes, "reason": reason})
    selected.sort(key=lambda row: row["role_key"])
    return selected, excluded, title_index


def save_pre_search_checkpoint(selected: list[dict], remaining_count: int, excluded: list[dict]) -> None:
    selection = {
        "schema_version": "2026-09-23.role-work-profile-tranche-009-selection.v1",
        "generated_on": ACCESS_DATE,
        "status": "selected",
        "read_only": True,
        "append_only": True,
        "scope": "remaining missing role work profiles only; item and relationship enrichment excluded",
        "selection_rule": "first up to 20 remaining ESCO-source roles with exactly one exact label in the official O*NET 31.0 Job Titles extract",
        "counts": {
            "remaining_missing_roles_before_selection": remaining_count,
            "selected_roles": len(selected),
            "excluded_without_unique_identity": len(excluded),
            "profile_rows_searched": 0,
        },
        "authority": {
            "identity_source": "O*NET 31.0 Job Titles.txt",
            "archive": str(ARCHIVE.relative_to(REPO)).replace("\\", "/"),
            "archive_sha256": ARCHIVE_SHA256,
            "accessed_on": ACCESS_DATE,
        },
        "selected": selected,
        "excluded_sample": excluded,
    }
    SELECTION_JSON.write_text(json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-09-23.role-work-profile-tranche-009-pre-search.v1",
        "generated_on": ACCESS_DATE,
        "status": "pre_search_checkpoint",
        "read_only": True,
        "append_only": True,
        "counts": selection["counts"],
        "selection": str(SELECTION_JSON.relative_to(REPO)).replace("\\", "/"),
        "scope_guard": "Role work-profile evidence only; no item, relationship, SQL, seed, frontend, live DB or browser-proof writes.",
        "policy": {
            "exact_identity_required": True,
            "profile_must_come_from_matched_authoritative_occupational_record": True,
            "ambiguous_title_codes_excluded": True,
            "nigerian_demand_or_preparation_inference": False,
            "canonical_rows_added": 0,
        },
        "next_action": "Extract O*NET profile fields only for the saved selected role keys and append review-required audit records.",
    }
    PRE_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_record(row: dict, profile: dict) -> dict:
    code = row["onet_code"]
    occupation_locator = f"db_31_0_text/Occupation Data.txt#O*NET-SOC Code={code}"
    return {
        "role_key": row["role_key"],
        "domain_id": row["domain_id"],
        "domain_name": row["domain_name"],
        "role_name": row["role_name"],
        "existing_source": row["existing_source"],
        "resolution": "exact_onet_job_title_profile_candidate",
        "review_state": "review_required",
        "canonical_work_profile_row_status": "absent_audit_only",
        "identity": {
            "authority": "O*NET OnLine / U.S. Department of Labor",
            "onet_code": code,
            "onet_title": profile["title"],
            "exact_job_titles_identity_match": True,
            "exact_profile_title_match": norm(profile["title"]) == norm(row["role_name"]),
            "identity_cross_reference": "O*NET 31.0 Job Titles.txt",
        },
        "work_profile_fields": {
            "activities": profile.get("tasks") or [],
            "work_activities": profile.get("work_activities") or [],
            "job_zones": [profile.get("job_zone") or {}],
            "education_signals": profile.get("education_signals") or [],
            "work_context": profile.get("work_context") or [],
            "related_occupations": profile.get("related_occupations") or [],
        },
        "source_links": [
            {
                "label": "O*NET 31.0 exact job-title identity record",
                "url": ARCHIVE_URL,
                "locator": row["identity_locator"],
                "accessed_on": ACCESS_DATE,
                "archive_sha256": ARCHIVE_SHA256,
            },
            {
                "label": "O*NET OnLine official occupation summary",
                "url": f"{ONET_BASE}{code}",
                "locator": f"O*NET-SOC Code={code}",
                "accessed_on": ACCESS_DATE,
            },
            {
                "label": "O*NET 31.0 occupation profile archive",
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
            "The exact O*NET title identity establishes an occupational cross-reference; it does not establish Nigerian demand or local licensing, education, wages, or hiring requirements.",
            "O*NET work-profile fields are global/US occupational evidence and remain review-required.",
            "No candidate is promoted to a canonical role_work_profiles row by this audit-only pass.",
        ],
    }


def build() -> dict:
    selected, excluded, _ = select_roles()
    if not PRE_CHECKPOINT_JSON.exists() or not SELECTION_JSON.exists():
        raise AssertionError("Run the checkpoint-first selection stage before profile extraction")
    saved_selection = json.loads(SELECTION_JSON.read_text(encoding="utf-8"))
    if [row["role_key"] for row in saved_selection["selected"]] != [row["role_key"] for row in selected]:
        raise AssertionError("Selection changed after the pre-search checkpoint")
    with zipfile.ZipFile(ARCHIVE) as archive:
        onet = load_builder()(archive)
    records = []
    incomplete_profiles = []
    for row in selected:
        profile = onet.get(row["onet_code"])
        if not profile:
            raise AssertionError(f"O*NET code absent from archive: {row['onet_code']}")
        record = build_record(row, profile)
        if not all(record["work_profile_fields"][field] for field in ("activities", "work_activities", "job_zones")):
            incomplete_profiles.append(
                {
                    "role_key": row["role_key"],
                    "role_name": row["role_name"],
                    "onet_code": row["onet_code"],
                    "reason": "Exact O*NET identity exists, but the local archive profile lacks one or more required work-profile fields.",
                    "profile_decision": "do_not_promote",
                }
            )
            continue
        records.append(record)
    records.sort(key=lambda item: item["role_key"])
    counts = {
        "baseline_missing_work_profile_rows": 119,
        "prior_exact_onet_candidates": 20,
        "prior_exact_esco_onet_profile_candidates": 17,
        "remaining_missing_roles_before_selection": len(remaining_missing_roles()),
        "roles_selected": len(selected),
        "exact_onet_job_title_identity_matches": len(selected),
        "candidate_rows_with_work_profile_fields": len(records),
        "incomplete_authoritative_profiles_retained_review_only": len(incomplete_profiles),
        "canonical_work_profile_rows_added": 0,
        "review_required_profile_candidates": len(records),
        "canonical_work_profile_rows_still_absent": 119,
        "roles_without_source_backed_profile_candidate_after_pass": len(remaining_missing_roles()) - len(records),
        "genuinely_unavailable": 0,
    }
    return {
        "schema_version": "2026-09-23.role-work-profile-enrichment.v3",
        "generated_on": ACCESS_DATE,
        "read_only": True,
        "append_only": True,
        "scope": {
            "source_audit": str(TRACE.relative_to(REPO)).replace("\\", "/"),
            "queue": "remaining missing role work profiles after tranches 007 and 008",
            "selection": "exact unique O*NET 31.0 Job Titles label; no title similarity, ISCO inference, or Nigerian mapping",
        },
        "authority": {
            "onet_identity_and_profile": "O*NET 31.0 Database / U.S. Department of Labor",
            "archive": str(ARCHIVE.relative_to(REPO)).replace("\\", "/"),
            "archive_url": ARCHIVE_URL,
            "archive_sha256": ARCHIVE_SHA256,
            "accessed_on": ACCESS_DATE,
            "limitation": "Global/US occupational evidence only; not Nigerian demand or local preparation evidence.",
        },
        "counts": counts,
        "excluded_review_only": {
            "no_unique_identity": excluded,
            "incomplete_authoritative_profile": incomplete_profiles,
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JSONL.write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in payload["records"]) + "\n", encoding="utf-8")
    c = payload["counts"]
    OUT_MD.write_text(
        "\n".join(
            [
                "# Role work-profile enrichment tranche 009 — 2026-09-23",
                "",
                "Audit-only exact O*NET Job Titles identity/profile enrichment for the missing-role queue.",
                "",
                f"- Remaining missing roles before selection: **{c['remaining_missing_roles_before_selection']}**.",
                f"- Exact unique O*NET Job Titles identities selected: **{c['exact_onet_job_title_identity_matches']}**.",
                f"- Candidates with authoritative work-profile fields: **{c['candidate_rows_with_work_profile_fields']}**.",
                f"- Review-required candidates: **{c['review_required_profile_candidates']}**.",
                f"- Canonical rows added: **{c['canonical_work_profile_rows_added']}**.",
                f"- Canonical rows still absent: **{c['canonical_work_profile_rows_still_absent']}**.",
                f"- Roles without a source-backed profile candidate after this pass: **{c['roles_without_source_backed_profile_candidate_after_pass']}**.",
                "- Genuinely unavailable: **0**.",
                "",
                "The O*NET 31.0 Job Titles extract was used only where a role label resolved to one SOC code. Profile fields were extracted from that matched O*NET occupation record. Ambiguous and unmatched labels were excluded. No Nigerian demand, local preparation, licensing, wage, student-readiness, SQL, seed, frontend, live-DB, or browser claim is made.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    checkpoint = {
        "schema_version": "2026-09-23.role-work-profile-tranche-009-checkpoint.v1",
        "generated_on": ACCESS_DATE,
        "status": "complete",
        "read_only": True,
        "append_only": True,
        "counts": c,
        "artifacts": [
            str(path.relative_to(REPO)).replace("\\", "/")
            for path in [SELECTION_JSON, PRE_CHECKPOINT_JSON, OUT_JSON, OUT_JSONL, OUT_MD, CHECKPOINT_JSON, CHECKPOINT_MD, Path(__file__)]
        ],
        "next_action": "Retain all tranche-009 candidates review-required until independent Nigerian/local evidence is available; continue only with the remaining missing role work-profile queue.",
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "\n".join(
            [
                "# Role work-profile tranche 009 checkpoint — 2026-09-23",
                "",
                f"- Remaining missing roles before selection: **{c['remaining_missing_roles_before_selection']}**",
                f"- Exact unique O*NET identities: **{c['exact_onet_job_title_identity_matches']}**",
                f"- Candidate rows with profile fields: **{c['candidate_rows_with_work_profile_fields']}**",
                f"- Canonical rows added: **{c['canonical_work_profile_rows_added']}**",
                f"- Canonical rows still absent: **{c['canonical_work_profile_rows_still_absent']}**",
                f"- Roles without source-backed profile candidate after pass: **{c['roles_without_source_backed_profile_candidate_after_pass']}**",
                "- Genuinely unavailable: **0**",
                "",
                "All rows are audit-only and review-required. The source archive, exact title locator, occupation locator, checksum, URLs and access dates are retained. No item or relationship enrichment was reopened.",
                "",
            ]
        ),
        encoding="utf-8",
    )


def checkpoint_first_selection() -> None:
    selected, excluded, _ = select_roles()
    save_pre_search_checkpoint(selected, len(remaining_missing_roles()), excluded)
    print(json.dumps({"selected": len(selected), "remaining": len(remaining_missing_roles()), "excluded": len(excluded)}, sort_keys=True))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selection":
        checkpoint_first_selection()
    else:
        result = build()
        write_outputs(result)
        print(json.dumps(result["counts"], sort_keys=True))
