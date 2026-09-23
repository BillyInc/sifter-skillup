#!/usr/bin/env python3
"""Audit-only ESCO -> O*NET exact-crosswalk enrichment for missing roles.

This pass is narrower than title matching: it uses only the locally vendored
ESCO Secretariat / U.S. Department of Labor crosswalk rows whose match type is
``exactMatch``. It extracts O*NET work-profile fields from the local O*NET 31.0
archive, preserves both source locators and access dates, and keeps every row
review-required. It never creates a canonical database row or a Nigerian
mapping.
"""

from __future__ import annotations

import csv
import json
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
MAPPING = REPO / "data" / "career-mapping"
TRACE = MAPPING / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
ESCO_OCCUPATIONS = MAPPING / "_tax_src" / "esco" / "occupations_en.csv"
CROSSWALK = MAPPING / "_tax_src" / "esco_onet_crosswalk.csv"
ARCHIVE = MAPPING / "_source_downloads" / "taxonomy" / "onet_31_0_database.zip"
ARCHIVE_URL = "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip"
ARCHIVE_SHA256 = "6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9"
ONET_DATABASE_URL = "https://www.onetcenter.org/database.html"
ONET_BASE = "https://www.onetonline.org/link/summary/"
ESCO_CLASSIFICATION_URL = "https://esco.ec.europa.eu/en/classification/occupation"
ACCESS_DATE = "2026-09-23"

OUT_JSON = HERE / "role_work_profile_enrichment_tranche_008_2026-09-23.json"
OUT_JSONL = HERE / "role_work_profile_enrichment_append_only_tranche_008_2026-09-23.jsonl"
OUT_MD = HERE / "role_work_profile_enrichment_tranche_008_2026-09-23.md"
CHECKPOINT_JSON = HERE / "role_work_profile_enrichment_tranche_008_checkpoint_2026-09-23.json"
CHECKPOINT_MD = HERE / "role_work_profile_enrichment_tranche_008_checkpoint_2026-09-23.md"


def load_builder():
    sys.path.insert(0, str(MAPPING))
    from _build_role_work_profiles import build_onet_indexes

    return build_onet_indexes


def missing_roles() -> list[dict]:
    payload = json.loads(TRACE.read_text(encoding="utf-8"))
    return [
        row
        for row in payload["roles"]
        if row.get("work_profile_status") == "not_available"
        and str(row.get("source") or "").casefold() == "esco"
    ]


def load_esco() -> dict[str, dict]:
    with ESCO_OCCUPATIONS.open(encoding="utf-8-sig", newline="") as stream:
        return {
            str(row["preferredLabel"]).casefold(): row
            for row in csv.DictReader(stream)
            if row.get("preferredLabel") and row.get("conceptUri")
        }


def load_exact_crosswalk() -> dict[str, list[dict]]:
    rows: dict[str, list[dict]] = {}
    with CROSSWALK.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.reader(stream)
        header = next((row for row in reader if row and row[0] == "O*NET Id"), None)
        if header is None:
            raise AssertionError("O*NET/ESCO crosswalk header not found")
        for row in reader:
            if len(row) < 7 or row[6] != "exactMatch":
                continue
            onet_code, onet_title, _, esco_uri, esco_title, _, match = row[:7]
            if not onet_code or not esco_uri:
                continue
            rows.setdefault(esco_uri, []).append(
                {
                    "onet_code": onet_code,
                    "onet_title": onet_title,
                    "esco_uri": esco_uri,
                    "esco_title": esco_title,
                    "match_type": match,
                    "crosswalk_locator": (
                        "data/career-mapping/_tax_src/esco_onet_crosswalk.csv"
                        f"#esco_uri={esco_uri}&match=exactMatch"
                    ),
                }
            )
    return rows


def record(row: dict, esco: dict, mapping: dict, profile: dict) -> dict:
    role_key = f"{row['domain_id']}|{row['role_name']}"
    code = mapping["onet_code"]
    return {
        "role_key": role_key,
        "domain_id": row["domain_id"],
        "domain_name": row["domain_name"],
        "role_name": row["role_name"],
        "existing_source": "esco",
        "resolution": "exact_esco_onet_crosswalk_profile_candidate",
        "review_state": "review_required",
        "canonical_work_profile_row_status": "absent_audit_only",
        "identity": {
            "authority": "ESCO Secretariat in collaboration with U.S. Department of Labor/Employment and Training Administration",
            "esco_uri": esco["conceptUri"],
            "esco_preferred_label": esco["preferredLabel"],
            "onet_code": code,
            "onet_title": profile["title"],
            "crosswalk_match_type": "exactMatch",
            "exact_role_title_match": str(esco["preferredLabel"]).casefold() == str(row["role_name"]).casefold(),
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
                "label": "ESCO occupation record",
                "url": str(esco["conceptUri"]).replace("http://", "https://", 1),
                "locator": f"data/career-mapping/_tax_src/esco/occupations_en.csv#conceptUri={esco['conceptUri']}",
                "accessed_on": ACCESS_DATE,
            },
            {
                "label": "ESCO–O*NET exact crosswalk",
                "url": ESCO_CLASSIFICATION_URL,
                "locator": mapping["crosswalk_locator"],
                "accessed_on": ACCESS_DATE,
            },
            {
                "label": "O*NET OnLine official occupation summary",
                "url": f"{ONET_BASE}{code}",
                "locator": f"O*NET-SOC Code={code}",
                "accessed_on": ACCESS_DATE,
            },
            {
                "label": "O*NET 31.0 database archive",
                "url": ARCHIVE_URL,
                "locator": f"db_31_0_text/Occupation Data.txt#O*NET-SOC Code={code}",
                "accessed_on": ACCESS_DATE,
                "archive_sha256": ARCHIVE_SHA256,
            },
        ],
        "limitations": [
            "The exact crosswalk establishes an occupational correspondence; it does not establish Nigerian demand or local licensing, education, wages, or hiring requirements.",
            "O*NET work-profile fields are a global/US occupational proxy and remain review-required.",
            "No candidate is promoted to a canonical role_work_profiles row by this audit-only pass.",
        ],
    }


def build() -> dict:
    roles = missing_roles()
    if len(roles) != 99:
        raise AssertionError(f"Expected 99 ESCO-only roles, found {len(roles)}")
    esco = load_esco()
    crosswalk = load_exact_crosswalk()
    with zipfile.ZipFile(ARCHIVE) as archive:
        onet = load_builder()(archive)
    records = []
    no_exact_crosswalk = []
    ambiguous = []
    for row in roles:
        label = str(row["role_name"])
        esco_row = esco.get(label.casefold())
        if not esco_row:
            no_exact_crosswalk.append({"role_key": f"{row['domain_id']}|{label}", "reason": "ESCO preferred label not found in local occupation extract"})
            continue
        matches = crosswalk.get(esco_row["conceptUri"], [])
        if len(matches) != 1:
            (ambiguous if matches else no_exact_crosswalk).append(
                {"role_key": f"{row['domain_id']}|{label}", "esco_uri": esco_row["conceptUri"], "match_count": len(matches), "reason": "exact crosswalk is ambiguous" if matches else "no exact ESCO–O*NET crosswalk row"}
            )
            continue
        mapping = matches[0]
        profile = onet.get(mapping["onet_code"])
        if not profile:
            no_exact_crosswalk.append({"role_key": f"{row['domain_id']}|{label}", "reason": "crosswalk O*NET code absent from local O*NET 31.0 archive", "onet_code": mapping["onet_code"]})
            continue
        records.append(record(row, esco_row, mapping, profile))
    records.sort(key=lambda item: item["role_key"])
    counts = {
        "baseline_missing_work_profile_rows": 119,
        "prior_exact_onet_candidates": 20,
        "esco_only_roles_in_scope": len(roles),
        "exact_crosswalk_profile_candidates": len(records),
        "candidate_rows_with_work_profile_fields": sum(bool(row["work_profile_fields"]["activities"]) and bool(row["work_profile_fields"]["work_activities"]) and bool(row["work_profile_fields"]["job_zones"]) for row in records),
        "ambiguous_exact_crosswalk_rows_retained_review_only": len(ambiguous),
        "no_exact_crosswalk_rows_retained_review_only": len(no_exact_crosswalk),
        "canonical_work_profile_rows_added": 0,
        "review_required_profile_candidates": len(records),
        "canonical_work_profile_rows_still_absent": 119,
        "roles_without_source_backed_profile_candidate_after_pass": 99 - len(records),
        "genuinely_unavailable": 0,
    }
    return {
        "schema_version": "2026-09-23.role-work-profile-enrichment.v2",
        "generated_on": ACCESS_DATE,
        "read_only": True,
        "append_only": True,
        "scope": {"source_audit": str(TRACE.relative_to(REPO)).replace("\\", "/"), "selection": "ESCO-only missing roles with one exactMatch row in the vendored official ESCO–O*NET crosswalk"},
        "authority": {"crosswalk": "ESCO Secretariat in collaboration with U.S. Department of Labor/Employment and Training Administration", "crosswalk_file": str(CROSSWALK.relative_to(REPO)).replace("\\", "/"), "onet_archive": str(ARCHIVE.relative_to(REPO)).replace("\\", "/"), "onet_archive_sha256": ARCHIVE_SHA256, "accessed_on": ACCESS_DATE},
        "counts": counts,
        "excluded_review_only": {"ambiguous_exact_crosswalk": ambiguous, "no_exact_crosswalk": no_exact_crosswalk},
        "records": records,
    }


def write(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JSONL.write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in payload["records"]) + "\n", encoding="utf-8")
    c = payload["counts"]
    OUT_MD.write_text("\n".join([
        "# Role work-profile enrichment tranche 008 — 2026-09-23", "",
        "Audit-only exact ESCO–O*NET crosswalk enrichment.", "",
        f"- ESCO-only roles in scope: **{c['esco_only_roles_in_scope']}**.",
        f"- Exact-crosswalk profile candidates: **{c['exact_crosswalk_profile_candidates']}**.",
        f"- Candidates with work-profile fields: **{c['candidate_rows_with_work_profile_fields']}**.",
        f"- Ambiguous exact-crosswalk rows retained review-only: **{c['ambiguous_exact_crosswalk_rows_retained_review_only']}**.",
        f"- No exact-crosswalk rows retained review-only: **{c['no_exact_crosswalk_rows_retained_review_only']}**.",
        f"- Canonical rows added: **{c['canonical_work_profile_rows_added']}**.",
        f"- Canonical rows still absent: **{c['canonical_work_profile_rows_still_absent']}**.",
        f"- Roles without a source-backed profile candidate after this pass: **{c['roles_without_source_backed_profile_candidate_after_pass']}**.",
        "- Genuinely unavailable: **0**.", "",
        "Only official local exactMatch crosswalk rows were used; no title-similarity mapping was used. All candidates remain review-required because the evidence is not Nigerian demand or local preparation evidence. No SQL, live DB, frontend, browser proof, or generated seed changed.", "",
    ]), encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-09-23.role-work-profile-tranche-008-checkpoint.v1", "generated_on": ACCESS_DATE, "status": "complete", "read_only": True, "append_only": True, "counts": c,
        "artifacts": [str(path.relative_to(REPO)).replace("\\", "/") for path in [OUT_JSON, OUT_JSONL, OUT_MD, CHECKPOINT_JSON, CHECKPOINT_MD, Path(__file__) ]],
        "next_action": "Independently review exact ESCO–O*NET candidates for Nigerian/local evidence; retain excluded ESCO-only roles as review-only and do not infer from ISCO major groups.",
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text("\n".join(["# Role work-profile tranche-008 checkpoint — 2026-09-23", "", f"- Exact-crosswalk profile candidates: **{c['exact_crosswalk_profile_candidates']}**", f"- Candidate rows with work-profile fields: **{c['candidate_rows_with_work_profile_fields']}**", f"- Ambiguous exact-crosswalk rows: **{c['ambiguous_exact_crosswalk_rows_retained_review_only']}**", f"- No exact-crosswalk rows: **{c['no_exact_crosswalk_rows_retained_review_only']}**", f"- Canonical rows added: **{c['canonical_work_profile_rows_added']}**", f"- Canonical rows still absent: **{c['canonical_work_profile_rows_still_absent']}**", f"- Roles without source-backed candidate after pass: **{c['roles_without_source_backed_profile_candidate_after_pass']}**", "- Genuinely unavailable: **0**", "", "All rows are audit-only and review-required; source URLs, locators, checksums and access dates are retained.", ""]), encoding="utf-8")


if __name__ == "__main__":
    payload = build()
    write(payload)
    print(json.dumps(payload["counts"], sort_keys=True))
