#!/usr/bin/env python3
"""Audit-only tranche 011 for the remaining role work-profile queue.

This pass resumes after tranche 010 and selects at most 20 remaining missing
roles with one exact O*NET 31.0 Job Titles identity. It records matched
official O*NET fields as review-only evidence. It is checkpoint-first and
append-only: it does not edit canonical role rows, seeds, SQL, UI, live data,
browser proof, item enrichment, or relationship enrichment.
"""

from __future__ import annotations

import importlib.util
import json
import sys
import zipfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
BASE_PATH = HERE / "role_work_profile_enrichment_tranche_010_2026-09-23.py"
ACCESS_DATE = "2026-09-23"
TRANCHE_SIZE = 20

SELECTION_JSON = HERE / "role_work_profile_enrichment_tranche_011_2026-09-23_selection.json"
PRE_CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_011_pre_search_checkpoint_2026-09-23.json"
OUT_JSON = HERE / "role_work_profile_enrichment_tranche_011_2026-09-23.json"
OUT_JSONL = HERE / "role_work_profile_enrichment_append_only_tranche_011_2026-09-23.jsonl"
OUT_MD = HERE / "role_work_profile_enrichment_tranche_011_2026-09-23.md"
CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_011_checkpoint_2026-09-23.json"
CHECKPOINT_MD = HERE / "role_work_profile_enrichment_tranche_011_checkpoint_2026-09-23.md"


def load_base():
    spec = importlib.util.spec_from_file_location("role_profile_tranche_010", BASE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load saved tranche-010 script: {BASE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.TRANCHE_SIZE = TRANCHE_SIZE
    return module


BASE = load_base()


def prior_role_keys() -> set[str]:
    """Read every prior completed/selected tranche, including tranche 010."""
    keys: set[str] = set()
    for path in HERE.glob("role_work_profile_enrichment_tranche_*.json"):
        if "checkpoint" in path.name or "selection" in path.name or "_011_" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        keys.update(str(row.get("role_key")) for row in payload.get("records", []) if row.get("role_key"))
    for path in HERE.glob("role_work_profile_enrichment_tranche_*_selection.json"):
        if "_011_" in path.name:
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        keys.update(str(row.get("role_key")) for row in payload.get("selected", []) if row.get("role_key"))
    return keys


def remaining_missing_roles() -> list[dict]:
    payload = json.loads(BASE.TRACE.read_text(encoding="utf-8"))
    prior = prior_role_keys()
    return [
        row
        for row in payload["roles"]
        if row.get("work_profile_status") == "not_available"
        and str(row.get("source") or "").casefold() == "esco"
        and BASE.role_key(row) not in prior
    ]


def select_roles() -> tuple[list[dict], list[dict]]:
    with zipfile.ZipFile(BASE.ARCHIVE) as archive:
        title_index = BASE.load_exact_job_titles(archive)
    selected: list[dict] = []
    excluded: list[dict] = []
    for row in remaining_missing_roles():
        codes = sorted(title_index.get(BASE.norm(row["role_name"]), set()))
        if len(codes) == 1 and len(selected) < TRANCHE_SIZE:
            code = codes[0]
            selected.append(
                {
                    "role_key": BASE.role_key(row),
                    "domain_id": row["domain_id"],
                    "domain_name": row.get("domain_name"),
                    "role_name": row["role_name"],
                    "existing_source": row.get("source"),
                    "esco_code": row.get("esco_code"),
                    "onet_code": code,
                    "identity_source": "db_31_0_text/Job Titles.txt",
                    "identity_locator": f"db_31_0_text/Job Titles.txt#O*NET-SOC Code={code}&Title={row['role_name']}",
                }
            )
        else:
            excluded.append(
                {
                    "role_key": BASE.role_key(row),
                    "role_name": row["role_name"],
                    "codes": codes,
                    "reason": "no exact O*NET Job Titles label" if not codes else "ambiguous O*NET Job Titles label",
                }
            )
    selected.sort(key=lambda row: row["role_key"])
    return selected, excluded


def write_selection_checkpoint() -> None:
    selected, excluded = select_roles()
    counts = {
        "remaining_missing_roles_before_selection": len(remaining_missing_roles()),
        "selected_roles": len(selected),
        "excluded_without_unique_identity": len(excluded),
        "profile_rows_searched": 0,
    }
    selection = {
        "schema_version": "2026-09-23.role-work-profile-tranche-011-selection.v1",
        "generated_on": ACCESS_DATE,
        "status": "selected",
        "read_only": True,
        "append_only": True,
        "scope": "remaining missing role work profiles only; item enrichment and relationship enrichment excluded",
        "selection_rule": "first up to 20 remaining ESCO-source roles with exactly one exact label in the official O*NET 31.0 Job Titles extract",
        "counts": counts,
        "authority": {
            "identity_source": "O*NET 31.0 Job Titles.txt",
            "archive": str(BASE.ARCHIVE.relative_to(REPO)).replace("\\", "/"),
            "archive_sha256": BASE.ARCHIVE_SHA256,
            "accessed_on": ACCESS_DATE,
        },
        "selected": selected,
        "excluded_sample": excluded,
    }
    SELECTION_JSON.write_text(json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    PRE_CHECKPOINT_JSON.write_text(
        json.dumps(
            {
                "schema_version": "2026-09-23.role-work-profile-tranche-011-pre-search.v1",
                "generated_on": ACCESS_DATE,
                "status": "pre_search_checkpoint",
                "read_only": True,
                "append_only": True,
                "counts": counts,
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
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, sort_keys=True))


def build() -> dict:
    selected, excluded = select_roles()
    if not PRE_CHECKPOINT_JSON.exists() or not SELECTION_JSON.exists():
        raise AssertionError("Run the checkpoint-first selection stage before profile extraction")
    saved = json.loads(SELECTION_JSON.read_text(encoding="utf-8"))
    if [r["role_key"] for r in saved["selected"]] != [r["role_key"] for r in selected]:
        raise AssertionError("Selection changed after the pre-search checkpoint")
    with zipfile.ZipFile(BASE.ARCHIVE) as archive:
        onet = BASE.load_onet_builder()(archive)
    records: list[dict] = []
    incomplete: list[dict] = []
    for row in selected:
        profile = onet.get(row["onet_code"])
        if not profile:
            raise AssertionError(f"O*NET code absent from archive: {row['onet_code']}")
        record = BASE.build_record(row, profile)
        if not all(record["work_profile_fields"][field] for field in ("activities", "work_activities", "job_zones")):
            incomplete.append(
                {
                    "role_key": row["role_key"],
                    "role_name": row["role_name"],
                    "onet_code": row["onet_code"],
                    "reason": "Exact O*NET identity exists, but the local archive profile lacks a required work-profile field.",
                    "profile_decision": "do_not_promote",
                }
            )
        else:
            records.append(record)
    records.sort(key=lambda item: item["role_key"])
    counts = {
        "baseline_missing_work_profile_rows": 119,
        "prior_tranche_010_candidates": 9,
        "remaining_missing_roles_before_selection": len(remaining_missing_roles()),
        "roles_selected": len(selected),
        "exact_onet_job_title_identity_matches": len(selected),
        "candidate_rows_with_work_profile_fields": len(records),
        "incomplete_authoritative_profiles_retained_review_only": len(incomplete),
        "canonical_work_profile_rows_added": 0,
        "review_required_profile_candidates": len(records),
        "canonical_work_profile_rows_still_absent": 119,
        "roles_without_source_backed_profile_candidate_after_pass": len(remaining_missing_roles()) - len(records),
        "genuinely_unavailable": 0,
    }
    return {
        "schema_version": "2026-09-23.role-work-profile-enrichment.v4",
        "generated_on": ACCESS_DATE,
        "read_only": True,
        "append_only": True,
        "scope": "Remaining missing role work-profile evidence only; item enrichment and relationship enrichment excluded.",
        "authority": {
            "onet_identity_and_profile": "O*NET 31.0 Database / U.S. Department of Labor",
            "archive": str(BASE.ARCHIVE.relative_to(REPO)).replace("\\", "/"),
            "archive_url": BASE.ARCHIVE_URL,
            "archive_sha256": BASE.ARCHIVE_SHA256,
            "accessed_on": ACCESS_DATE,
            "limitation": "Global/US occupational evidence only; not Nigerian demand or local preparation evidence.",
        },
        "counts": counts,
        "excluded_review_only": {"no_unique_identity": excluded, "incomplete_authoritative_profile": incomplete},
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JSONL.write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in payload["records"]) + "\n", encoding="utf-8")
    counts = payload["counts"]
    OUT_MD.write_text(
        "\n".join(
            [
                "# Role work-profile enrichment tranche 011 — 2026-09-23",
                "",
                "Audit-only exact O*NET Job Titles identity/profile enrichment for the remaining missing-role queue.",
                "",
                f"- Remaining missing roles before selection: **{counts['remaining_missing_roles_before_selection']}**.",
                f"- Exact unique O*NET Job Titles identities selected: **{counts['exact_onet_job_title_identity_matches']}**.",
                f"- Candidates with authoritative work-profile fields: **{counts['candidate_rows_with_work_profile_fields']}**.",
                f"- Review-required candidates: **{counts['review_required_profile_candidates']}**.",
                f"- Canonical rows added: **{counts['canonical_work_profile_rows_added']}**.",
                f"- Canonical rows still absent: **{counts['canonical_work_profile_rows_still_absent']}**.",
                f"- Roles without a source-backed profile candidate after this pass: **{counts['roles_without_source_backed_profile_candidate_after_pass']}**.",
                "- Genuinely unavailable: **0**.",
                "",
                "Only exact unique O*NET Job Titles identities and matched official O*NET occupation fields were used. Ambiguous and unmatched labels were excluded. Candidates remain review-required because the evidence is global/US occupational evidence, not Nigerian demand or local preparation evidence. No canonical, SQL, seed, frontend, live-DB, browser, item-enrichment or relationship-enrichment change was made.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    artifacts = [SELECTION_JSON, PRE_CHECKPOINT_JSON, OUT_JSON, OUT_JSONL, OUT_MD, CHECKPOINT_JSON, CHECKPOINT_MD, Path(__file__)]
    checkpoint = {
        "schema_version": "2026-09-23.role-work-profile-tranche-011-checkpoint.v1",
        "generated_on": ACCESS_DATE,
        "status": "complete",
        "read_only": True,
        "append_only": True,
        "counts": counts,
        "artifacts": [str(path.relative_to(REPO)).replace("\\", "/") for path in artifacts],
        "next_action": "Retain tranche-011 candidates review-required; continue only with the remaining missing role work-profile queue.",
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "\n".join(
            [
                "# Role work-profile tranche 011 checkpoint — 2026-09-23",
                "",
                f"- Remaining missing roles before selection: **{counts['remaining_missing_roles_before_selection']}**",
                f"- Exact unique O*NET identities: **{counts['exact_onet_job_title_identity_matches']}**",
                f"- Candidate rows with profile fields: **{counts['candidate_rows_with_work_profile_fields']}**",
                f"- Canonical rows added: **{counts['canonical_work_profile_rows_added']}**",
                f"- Canonical rows still absent: **{counts['canonical_work_profile_rows_still_absent']}**",
                f"- Roles without source-backed profile candidate after pass: **{counts['roles_without_source_backed_profile_candidate_after_pass']}**",
                "- Genuinely unavailable: **0**",
                "",
                "All rows are audit-only and review-required. Exact source URLs, locators, archive checksum and access dates are retained. No item or relationship enrichment was reopened.",
                "",
            ]
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selection":
        write_selection_checkpoint()
    else:
        result = build()
        write_outputs(result)
        print(json.dumps(result["counts"], sort_keys=True))
