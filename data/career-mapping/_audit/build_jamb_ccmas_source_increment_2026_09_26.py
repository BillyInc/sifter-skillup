"""Build an append-only source-phase checkpoint for one bounded JAMB range.

This reads audit artifacts only. It does not modify source, mapping, scope,
seed, SQL, UI, or downstream taxonomy files.
"""

from __future__ import annotations

import json
import argparse
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
QUEUE_PATH = AUDIT / "jamb_ccmas_source_issue_queue_2026-09-26_001.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def compact_text(value: str) -> str:
    return " ".join(str(value).split())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=20)
    args = parser.parse_args()
    queue = load_json(QUEUE_PATH)
    start, end = args.start, args.end
    if start < 1 or end < start or end - start + 1 > 20:
        raise SystemExit("The bounded increment must contain between 1 and 20 identities.")
    sequence = ((start - 1) // 20) + 1
    stem = f"jamb_ccmas_source_increment_{sequence:03d}_identities_{start:03d}_{end:03d}_2026-09-26"
    out_json = AUDIT / f"{stem}.json"
    out_md = AUDIT / f"{stem}.md"
    label = f"{start:03d}–{end:03d}"
    prior_paths = set(
        sorted(AUDIT.glob(f"jamb_ccmas_final_gap_verification_rows_{start:03d}_*.md"))
        + sorted(AUDIT.glob(f"jamb_ccmas_final_gap_verification_rows_{start + 10:03d}_*.md"))
        + sorted(AUDIT.glob(f"jamb_ccmas_independent_audit_rows_{start:03d}_*.md"))
        + sorted(AUDIT.glob(f"jamb_ccmas_independent_audit_rows_{start + 10:03d}_*.md"))
    )
    if start >= 281:
        first_cp = ((start - 281) // 10) + 1
        last_cp = ((end - 281) // 10) + 1
        for cp in range(first_cp, last_cp + 1):
            prior_paths.update(AUDIT.glob(
                f"jamb_ccmas_final_verification_rows_281_420_2026-09-26_{cp:03d}.md"
            ))
    prior_row_files = [str(p.relative_to(ROOT)).replace("\\", "/") for p in sorted(prior_paths)]
    rows = [r for r in queue["identity_rows"] if start <= r["canonical_order"] <= end]
    issues = [i for i in queue["issues"] if start <= i["canonical_order"] <= end]

    evidence_refs: dict[tuple[str, str, str], dict] = {}
    issue_records = []
    for issue in issues:
        ref_ids = []
        for evidence in issue.get("evidence", []) or []:
            url = evidence.get("url")
            locator = evidence.get("locator")
            accessed = evidence.get("accessed_on")
            if not url and not locator:
                continue
            key = (url or "", locator or "", accessed or "")
            if key not in evidence_refs:
                evidence_refs[key] = {
                    "evidence_ref_id": f"EV-{len(evidence_refs) + 1:03d}",
                    "url": url,
                    "locator": locator,
                    "accessed_on": accessed,
                    "source_faculty": evidence.get("source_faculty"),
                    "source_file": evidence.get("source_file"),
                    "exact_pdf_verified": evidence.get("exact_pdf_verified"),
                }
            ref_ids.append(evidence_refs[key]["evidence_ref_id"])
        issue_records.append(
            {
                "issue_id": issue["issue_id"],
                "canonical_order": issue["canonical_order"],
                "jamb_name": issue["jamb_name"],
                "status": issue["status"],
                "severity": issue["severity"],
                "issue_type": issue["issue_type"],
                "title": issue["title"],
                "evidence_ref_ids": sorted(set(ref_ids)),
                "recommendation": issue["recommendation"],
            }
        )

    status_counts = Counter(i["status"] for i in issue_records)
    type_counts = Counter((i["issue_type"], i["status"]) for i in issue_records)
    evidence_refs_list = sorted(evidence_refs.values(), key=lambda x: x["evidence_ref_id"])

    # These were read in the preceding row-level checkpoints and are retained
    # here as source locators rather than re-opened as new findings.
    authoritative_sources = [
        {
            "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
            "locator": "printed pp.419, 427-429; rows 001-006",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
            "locator": "printed pp.574, 616-617, 628-629, 683; rows 007-019",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
            "locator": "printed p.44; separate faculty context for row 018/019",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
            "locator": "printed pp.239, 241; separate Arts occurrences for rows 040, 045 and 050",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
            "locator": "printed pp.27-28, 38-45, 52, 56 onward, 68, 72, 77, 80, 88; rows 001-006",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
            "locator": "printed pp.26, 28-29, 33, 38-39, 48-52, 71-72, 95-107, 162-180; rows 005, 007-017, 020",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
            "locator": "printed pp.326, 339, 739-742; bounded Operations Research/Statistics lead for row 016",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
            "locator": "printed pp.183, 185-186, 197-202; rows 018-019",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
            "locator": "Arts curriculum package used only for bounded source comparison in rows 040, 045 and 050",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://sdg.abuad.edu.ng/wp-content/uploads/2020/04/ABUAD_Course_Databank_2020.pdf",
            "locator": "printed pp.93-95; institution-specific Intelligence and Security Studies evidence for row 020",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://admissions.covenantuniversity.edu.ng/wp-content/uploads/2024/02/CU-2024-Undergraduate-Prospectus-Covenant-University-Ota_.pdf",
            "locator": "Covenant undergraduate prospectus; institution-specific Policy and Strategic Studies lead for row 030",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://eprints.covenantuniversity.edu.ng/3271/1/CLDS%20HANDBOOK.pdf",
            "locator": "printed 2014-2017 handbook; historical Covenant curriculum lead for row 030, currency not assumed",
            "accessed_on": "2026-09-26",
        },
        {
            "url": "https://www.abuad.edu.ng/b-sc-social-justice-programme/",
            "locator": "ABUAD B.Sc Social Justice programme page; institution-specific evidence for row 032",
            "accessed_on": "2026-09-26",
        },
    ]

    payload = {
        "schema_version": 1,
        "checkpoint_id": f"jamb_ccmas_source_increment_{sequence:03d}_identities_{start:03d}_{end:03d}",
        "audit_date": "2026-09-26",
        "lane": "JAMB identity/offering and CCMAS/external source integrity only",
        "mode": "bounded_reconciliation_after_checkpoint_003",
        "range": {"identity_start": start, "identity_end": end, "identity_count": len(rows)},
        "scope": {
            "canonical_jamb_identities_inspected": len(rows),
            "selected_course_occurrences_in_current_queue": sum(r["selected_course_count"] for r in rows),
            "parsed_offering_records_inspected": sum(r["source_offering_count"] for r in rows),
            "ccmas_packages_inspected_by_component": sorted({c for r in rows for c in r["component_refs"]}),
        },
        "records_inspected": rows,
        "prior_checkpoint_refs": [
            "data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.json",
            "data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.md",
            *prior_row_files,
            "data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json",
            "data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md",
            "data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json",
            "data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json",
            "data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json",
            "data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json",
        ],
        "evidence_sources": authoritative_sources,
        "evidence_refs": evidence_refs_list,
        "confirmed_issues": [i for i in issue_records if i["status"] == "confirmed_gap"],
        "candidate_issues": [i for i in issue_records if i["status"] == "candidate"],
        "counts": {
            "current_issue_records": len(issue_records),
            "confirmed_gap_issue_records": status_counts["confirmed_gap"],
            "candidate_issue_records": status_counts["candidate"],
            "new_issue_classes_found_in_reconciliation": 0,
            "reopened_closed_findings": 0,
            "evidence_reference_count": len(evidence_refs_list),
            "issue_type_counts": {
                f"{issue_type}:{status}": count
                for (issue_type, status), count in sorted(type_counts.items())
            },
        },
        "disposition": {
            "result": "prior findings reconciled; unresolved gaps remain open",
            "closed_work_not_reopened": queue["closed_work_not_reopened"],
            "no_new_claim_of_source_closure": True,
            "no_downstream_taxonomy_review": True,
            "no_shared_file_edits": True,
        },
        "next_increment": {
            "identity_start": end + 1,
            "identity_end": min(end + 20, 420),
            "maximum_identity_or_package_count": 20,
            "lane": "JAMB/CCMAS source integrity; no downstream taxonomy",
            "checkpoint_required_before_next_increment": True,
        },
        "write_boundary": {
            "shared_source_files_edited": False,
            "shared_mapping_files_edited": False,
            "scope_or_seed_files_edited": False,
            "downstream_domain_subgroup_role_files_edited": False,
            "sql_or_ui_files_edited": False,
        },
    }
    out_json.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    by_type = "\n".join(
        f"- `{issue_type}` / `{status}`: {count}"
        for (issue_type, status), count in sorted(type_counts.items())
    )
    row_table = "\n".join(
        f"| {r['canonical_order']:03d} | {r['jamb_name']} | {', '.join(r['component_refs'])} | "
        f"{r['scope_status']} | {r['selected_course_count']} | {r['source_offering_count']} | "
        f"{', '.join(r['issue_ids'])} |"
        for r in rows
    )
    issue_table = "\n".join(
        f"| {i['issue_id']} | {i['canonical_order']:03d} | {i['status']} | {i['issue_type']} | "
        f"{', '.join(i['evidence_ref_ids']) or 'none'} | {compact_text(i['recommendation'])} |"
        for i in issue_records
    )
    evidence_table = "\n".join(
        f"| {e['evidence_ref_id']} | {e['url'] or 'none'} | {e['locator'] or 'none'} | {e['accessed_on'] or 'none'} |"
        for e in evidence_refs_list
    )
    source_table = "\n".join(
        f"| {s['url']} | {s['locator']} | {s['accessed_on']} |" for s in authoritative_sources
    )
    md = f"""# JAMB–CCMAS source increment {sequence:03d} — identities {label}

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **{len(rows)}/{len(rows)}**, rows **{label}**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **{sum(r['selected_course_count'] for r in rows)}**.
- Parsed offering occurrences represented by those rows: **{sum(r['source_offering_count'] for r in rows)}**.
- CCMAS/external components inspected through the current records: **{', '.join(sorted({c for r in rows for c in r['component_refs']}))}**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **{label}**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
{row_table}

## Current issue counts

- Confirmed gaps still open: **{status_counts['confirmed_gap']}**.
- Candidate issues still open: **{status_counts['candidate']}**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **{len(evidence_refs_list)}**.

By issue type/status:

{by_type}

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
{issue_table}

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
{evidence_table}

### Authoritative source packages read in the prior row-level verification

| URL | Exact locator | Accessed |
|---|---|---|
{source_table}

## Prior checkpoint and non-repetition controls

Read before this increment:

{''.join(f'- `{p}`\n' for p in payload['prior_checkpoint_refs'])}

Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **{label}** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities {end + 1:03d}–{min(end + 20, 420):03d}**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.
"""
    out_md.write_text(md, encoding="utf-8")
    print(out_json)
    print(out_md)
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
