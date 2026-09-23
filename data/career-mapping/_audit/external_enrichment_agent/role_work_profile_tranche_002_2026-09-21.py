#!/usr/bin/env python3
"""Read-only tranche 002 audit for roles without work-profile rows.

This intentionally reuses Dalton's transport and ESCO parsing helpers while
selecting the next disjoint slice of the same sorted missing-profile queue.
It writes only tranche-002 audit artifacts and never changes application data,
generated seeds, SQL, or UI files.
"""

from __future__ import annotations

import json
import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
_prior_spec = importlib.util.spec_from_file_location(
    "role_work_profile_tranche_2026_09_21",
    HERE / "role_work_profile_tranche_2026-09-21.py",
)
if _prior_spec is None or _prior_spec.loader is None:
    raise RuntimeError("Could not load Dalton's tranche-001 helper")
prior = importlib.util.module_from_spec(_prior_spec)
_prior_spec.loader.exec_module(prior)


OFFSET = 20
SIZE = 20
OUT_JSON = HERE / "role_work_profile_tranche_002_2026-09-21.json"
OUT_MD = HERE / "role_work_profile_tranche_002_2026-09-21.md"
OUT_CHECKPOINT_JSON = HERE / "role_work_profile_tranche_002_checkpoint_2026-09-21.json"
OUT_CHECKPOINT_MD = HERE / "role_work_profile_tranche_002_checkpoint_2026-09-21.md"


def build() -> dict:
    trace = json.loads(prior.TRACE.read_text(encoding="utf-8"))
    missing = [row for row in trace["roles"] if row.get("work_profile_status") == "not_available"]
    tranche = missing[OFFSET : OFFSET + SIZE]
    occupations = prior.load_esco_occupations()
    relation_counts = prior.load_skill_relation_counts()
    records: list[dict] = []

    for row in tranche:
        code = str(row.get("esco_code") or "").strip()
        candidates = occupations.get(code, [])
        local = next(
            (item for item in candidates if prior.norm(item.get("preferredLabel")) == prior.norm(row.get("role_name"))),
            None,
        )
        if local is None and len(candidates) == 1:
            local = candidates[0]
        if local is None:
            records.append(
                {
                    "role_key": row["role_key"],
                    "domain_id": row.get("domain_id"),
                    "domain_name": row.get("domain_name"),
                    "role_name": row.get("role_name"),
                    "existing_role_source": row.get("source"),
                    "existing_esco_code": code,
                    "existing_source_provenance": row.get("source_provenance") or {},
                    "audit_status": "unresolved",
                    "profile_decision": "review_required",
                    "reason": "No exact preferred-label match was found in the vendored ESCO occupation extract for the recorded code.",
                    "internet_check": None,
                    "retrieved_on": prior.RETRIEVED_ON,
                }
            )
            continue

        uri = str(local.get("conceptUri") or "").strip()
        internet = prior.fetch_api(uri) if uri else {"status": "unresolved", "retrieved_on": prior.RETRIEVED_ON}
        api_title = prior.text_from_api(internet.get("title"))
        exact_uri = internet.get("status") == "verified" and str(internet.get("uri") or "").strip() == uri
        exact_title = exact_uri and prior.norm(api_title) == prior.norm(row.get("role_name"))
        online_status = "exact_title_match" if exact_title else (
            "bounded_local_only" if local else "unresolved"
        )
        records.append(
            {
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
                    "occupation_skill_relation_count": relation_counts.get(uri, 0),
                    "skill_relation_locator": "data/career-mapping/_tax_src/esco/occupationSkillRelations_en.csv#occupationUri=" + uri,
                },
                "internet_check": internet,
                "internet_exact_identity_match": exact_uri,
                "internet_title_alignment": "exact" if exact_title else "not_exact",
                "identity_state": online_status,
                "audit_status": "source_backed_online_verified" if exact_uri else "bounded_local_only",
                "profile_decision": "review_required",
                "reason": "ESCO supplies role identity, meaning and related skills, but not the existing O*NET-style work-profile fields. Retain the evidence for review; do not invent work activities, work context, job zone, or Nigerian demand evidence.",
                "correction": {
                    "role_record_changed": False,
                    "generated_profile_row_added": False,
                    "seed_or_sql_changed": False,
                },
                "retrieved_on": prior.RETRIEVED_ON,
            }
        )

    counts = {
        "roles_selected": len(records),
        "roles_individually_audited": len(records),
        "exact_title_matches": sum(item.get("identity_state") == "exact_title_match" for item in records),
        "bounded_local_only": sum(item.get("identity_state") == "bounded_local_only" for item in records),
        "review_required": sum(item.get("profile_decision") == "review_required" for item in records),
        "unresolved": sum(item.get("identity_state") == "unresolved" for item in records),
        "repository_exact_records": sum("repository_evidence" in item for item in records),
        "internet_exact_identity_matches": sum(item.get("internet_exact_identity_match") is True for item in records),
        "source_backed_candidates": sum(item.get("audit_status") == "source_backed_online_verified" for item in records),
        "roles_corrected": 0,
        "generated_profile_rows_added": 0,
        "genuinely_unavailable": 0,
        "remaining_missing_work_profile_roles": len(missing) - OFFSET - len(records),
    }
    return {
        "schema_version": "2026-09-21.role-work-profile-tranche-002.v1",
        "generated_on": prior.RETRIEVED_ON,
        "read_only": True,
        "scope": {
            "source_audit": "data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json",
            "missing_work_profile_population": len(missing),
            "tranche_offset_zero_based": OFFSET,
            "tranche_number": 2,
            "tranche_size": SIZE,
            "queue_order": "source-trace roles with work_profile_status=not_available, original file order",
            "previous_tranche": "role_work_profile_tranche_2026-09-21.json (roles 1-20)",
        },
        "counts": counts,
        "authority": {
            "repository_source": "European Commission ESCO occupation extract vendored at data/career-mapping/_tax_src/esco/occupations_en.csv",
            "internet_source": "https://ec.europa.eu/esco/api/resource/occupation",
            "api_documentation": "https://ec.europa.eu/esco/api/doc/esco_api_doc.html",
            "source_limit": "ESCO is occupation/skill identity evidence only; it does not supply the O*NET-style work-profile fields used by the existing profile table or Nigerian demand evidence.",
        },
        "records": records,
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = [
        "# Role work-profile enrichment — tranche 002 — 2026-09-21",
        "",
        "## Scope and decision",
        "",
        "Read-only, non-overlapping continuation of Dalton's tranche 001. The next 20 roles in the canonical missing-work-profile queue were checked against the vendored European Commission ESCO occupation record and its exact concept URI through the public ESCO API. No O*NET-style work-profile row is created from ESCO evidence.",
        "",
        f"- Roles selected and individually audited: **{c['roles_individually_audited']}**.",
        f"- Exact title-match: **{c['exact_title_matches']}**.",
        f"- Bounded/local-only: **{c['bounded_local_only']}**.",
        f"- Review-required: **{c['review_required']}**.",
        f"- Unresolved: **{c['unresolved']}**.",
        f"- Exact repository occupation records: **{c['repository_exact_records']}**.",
        f"- Exact online identity matches: **{c['internet_exact_identity_matches']}**.",
        f"- Source-backed candidates retained as audit evidence: **{c['source_backed_candidates']}**.",
        f"- Role records corrected: **{c['roles_corrected']}**.",
        f"- Generated work-profile rows added: **{c['generated_profile_rows_added']}**.",
        f"- Roles proven genuinely unavailable: **{c['genuinely_unavailable']}**.",
        f"- Remaining missing-work-profile roles after this tranche: **{c['remaining_missing_work_profile_roles']}**.",
        "",
        "The identity-state counts and the review-required count are separate dimensions: an exact external identity can still require review because ESCO is not a sufficient substitute for the application's work-profile contract.",
        "",
        "## Per-role results",
        "",
        "| # | Role | ESCO code | Repository | Online identity | Title | Decision |",
        "|---:|---|---|---|---|---|---|",
    ]
    for i, item in enumerate(payload["records"], 1):
        lines.append(
            f"| {i} | {item['role_key']} | {item.get('existing_esco_code') or '—'} | "
            f"{'yes' if item.get('repository_evidence') else 'no'} | "
            f"{(item.get('internet_check') or {}).get('status', 'not_checked')} | "
            f"{item.get('identity_state', 'unresolved')} | {item.get('profile_decision')} |"
        )
    lines.extend([
        "",
        "## Evidence and limits",
        "",
        "- Every repository match retains the exact ESCO CSV row locator, concept URI, occupation-skill relation locator and exact API URL in the JSON ledger.",
        "- `exact_title_match` means the API returned HTTP 200 with the same concept URI and a preferred title matching the role title after normalization.",
        "- `bounded_local_only` is reserved for a repository-backed identity without a confirmed exact online identity; it is not a promotion state.",
        "- `review_required` is the decision for every row in this tranche because no ESCO record alone establishes the existing O*NET-style work-profile fields or Nigerian demand evidence.",
        "- No application code, generated seed, SQL, UI, browser proof, or prior tranche artifact was changed.",
        "",
        "Generated by `role_work_profile_tranche_002_2026-09-21.py`.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-09-21.role-work-profile-tranche-002-checkpoint.v1",
        "generated_on": payload["generated_on"],
        "status": "complete",
        "read_only": True,
        "tranche": payload["scope"],
        "counts": c,
        "artifacts": [
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_002_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_002_2026-09-21.md",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_002_checkpoint_2026-09-21.json",
            "data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_002_checkpoint_2026-09-21.md",
        ],
        "next_action": "Continue at zero-based offset 40; do not promote ESCO-only evidence into role_work_profiles without the required work-profile fields and review.",
    }
    OUT_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_CHECKPOINT_MD.write_text(
        "# Role work-profile tranche-002 checkpoint — 2026-09-21\n\n"
        "Read-only tranche complete.\n\n"
        f"- Queue slice: roles 21–40 of the original 119 missing profiles.\n"
        f"- Exact title-match: **{c['exact_title_matches']}**\n"
        f"- Bounded/local-only: **{c['bounded_local_only']}**\n"
        f"- Review-required: **{c['review_required']}**\n"
        f"- Unresolved: **{c['unresolved']}**\n"
        f"- Remaining missing profiles: **{c['remaining_missing_work_profile_roles']}**\n\n"
        "No role data, application code, seed, SQL, or previous artifact was changed.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    write_outputs(build())
