#!/usr/bin/env python3
"""Build a documentation-only, cross-indexed register from existing JAMB audits.

Reads the current JAMB source rows and the 2026-10-12 completeness/scoped-source
ledgers. Writes only the machine-readable lookup register and its Markdown
checkpoint. It does not edit canonical sources, matcher code, SQL, or D078.
"""
from __future__ import annotations

import collections
import hashlib
import json
import re
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb"
AUDIT = ROOT / "_audit"
DAY = "2026-10-12"
INPUT = AUDIT / "jamb_data_completeness_ledger_2026_10_12.json"
SCOPED = AUDIT / "jamb_subject_scoped_resolution_2026_10_08.json"
CONTEXT = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
OUT_JSON = AUDIT / f"jamb_issue_lookup_register_{DAY.replace('-', '_')}.json"
OUT_MD = AUDIT / f"jamb_issue_lookup_register_{DAY.replace('-', '_')}.md"
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")
CODE_RE = re.compile(r"[A-Z0-9][A-Z0-9'&./ -]{1,24}$")
NOISE = {"LAW", "AND", "STUDIES", "SOCIAL SCIENCES", "UTME", "DIRECT ENTRY", "SUBJECTS"}


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def uid(*parts: str) -> str:
    return str(uuid.uuid5(NS, "|".join(parts)))


def clean_code(value) -> str | None:
    code = str(value or "").strip().upper().rstrip(".")
    if not code or code in NOISE or not CODE_RE.fullmatch(code):
        return None
    return code


def stable_issue_id(kind: str, *identity: str) -> str:
    raw = "|".join(str(part or "") for part in (kind, *identity))
    return "JAMB-" + hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16].upper()


def source_map():
    occurrences = collections.defaultdict(list)
    invalid_tokens = []
    paths = sorted(JAMB.glob("*_offerings.json"))
    for path in paths:
        doc = read(path)
        faculty = doc.get("faculty") or path.stem.removesuffix("_offerings")
        for row_number, row in enumerate(doc.get("programmes") or [], 1):
            name = str(row.get("jamb_name") or "").strip()
            if not name:
                continue
            codes = []
            for raw in row.get("institutions") or []:
                code = clean_code(raw)
                if code:
                    codes.append(code)
                elif str(raw or "").strip():
                    invalid_tokens.append({
                        "jamb_name": name,
                        "faculty": faculty,
                        "source_file": path.name,
                        "source_row": row_number,
                        "raw_token": str(raw),
                        "token_source_field": "institutions",
                    })
            waiver_codes = []
            waiver_notes = collections.defaultdict(list)
            for waiver in row.get("institution_waivers") or []:
                raw_codes = waiver.get("institutions") or ([waiver.get("institution")] if waiver.get("institution") else [])
                for raw in raw_codes:
                    code = clean_code(raw)
                    if code:
                        waiver_codes.append(code)
                        if waiver.get("note"):
                            waiver_notes[code].append(str(waiver["note"]))
                    elif str(raw or "").strip():
                        invalid_tokens.append({
                            "jamb_name": name,
                            "faculty": faculty,
                            "source_file": path.name,
                            "source_row": row_number,
                            "raw_token": str(raw),
                            "token_source_field": "institution_waivers",
                        })
            codes = list(dict.fromkeys([*codes, *waiver_codes]))
            occurrences[name].append({
                "faculty": faculty,
                "source_file": path.name,
                "source_row": row_number,
                "institution_codes": codes,
                "main_institution_codes": list(dict.fromkeys(clean_code(c) for c in row.get("institutions") or [] if clean_code(c))),
                "waiver_institution_codes": list(dict.fromkeys(waiver_codes)),
                "waiver_notes_by_code": dict(waiver_notes),
                "utme_subjects": row.get("utme_subjects"),
                "olevel_requirement": row.get("olevel_requirement"),
                "direct_entry": row.get("direct_entry"),
                "source_verification": row.get("source_verification") or {},
                "institution_waivers": row.get("institution_waivers") or [],
            })
    deduped_tokens = {}
    for row in invalid_tokens:
        key = (row["jamb_name"], row["faculty"], row["source_file"], row["source_row"], row["raw_token"], row["token_source_field"])
        deduped_tokens[key] = row
    return occurrences, list(deduped_tokens.values()), paths


def main() -> None:
    base = read(INPUT)
    scoped = read(SCOPED)
    context = read(CONTEXT)
    occurrences, invalid_tokens, source_files = source_map()

    exact_context = collections.defaultdict(list)
    for identity in context.get("identities", []):
        for offering in identity.get("source_offerings", []):
            key = (identity.get("jamb_name"), offering.get("source_file"), offering.get("source_faculty"))
            exact_context[key].append(offering)

    code_universe = sorted({code for records in occurrences.values() for row in records for code in row["institution_codes"]})
    school_records = {
        code: {"institution_id": uid("school", code), "institution_code": code, "canonical_seed_name": code}
        for code in code_universe
    }
    programme_records = {
        name: {"programme_id": uid("jamb", name), "jamb_name": name}
        for name in occurrences
    }
    programme_by_fold = {name.casefold(): name for name in programme_records}

    verified_by_occurrence = {}
    for name, records in occurrences.items():
        for row in records:
            inventory_rows = exact_context.get((name, row["source_file"], row["faculty"]), [])
            verified = bool(row["source_verification"].get("verified_against_pdf")) or any(
                item.get("offering_row_verified_against_pdf") and item.get("pdf_table_locator")
                for item in inventory_rows
            )
            verified_by_occurrence[(name, row["source_file"], row["source_row"])] = verified

    issues = []
    rows_by_programme = collections.defaultdict(list)
    rows_by_school = collections.defaultdict(list)
    rows_by_type = collections.defaultdict(list)

    def add_issue(issue: dict):
        issues.append(issue)
        for programme in issue.get("programmes", []):
            rows_by_programme[programme["programme_id"]].append(issue["issue_id"])
        for school in issue.get("institutions", []):
            if school.get("institution_id"):
                rows_by_school[school["institution_id"]].append(issue["issue_id"])
        rows_by_type[issue["issue_type"]].append(issue["issue_id"])

    # Current national fields: only blank/non-matchable are unresolved issues;
    # a successfully applied source-rule repair is retained as provenance, not
    # counted as a defect by itself.
    for row in base.get("rows", []):
        if row.get("row_type") != "national_requirement_layer":
            continue
        state = row.get("effective_status")
        if state not in {"blank", "present_but_needs_review"}:
            continue
        name = row["jamb_identity"]
        linked_codes = sorted({code for occ in occurrences.get(name, []) for code in occ["institution_codes"]})
        issue_type = "national_requirement_missing" if state == "blank" else "national_requirement_needs_structuring_review"
        status = "confirmed_local_data_gap" if state == "blank" else "review_required_not_proven_wrong"
        evidence = row.get("source_rule_evidence") or []
        primary = row.get("primary_source") or {}
        add_issue({
            "issue_id": stable_issue_id("national", name, row.get("exam_layer", "")),
            "issue_type": issue_type,
            "status": status,
            "scope": "national_programme_requirement",
            "programmes": [{**programme_records[name], "source_faculties": row.get("distinct_institution_scopes") or []}],
            "institutions": [{
                **school_records[code],
                "offering_id": uid("sp", code, name),
                "link_basis": "programme appears in the extracted institution roster; this is a lookup association, not proof that the national rule is identical to every school-specific rule",
                "exact_offering_cell_verified": any(
                    verified_by_occurrence.get((name, occ["source_file"], occ["source_row"]), False)
                    for occ in occurrences.get(name, []) if code in occ["institution_codes"]
                ),
            } for code in linked_codes],
            "affected_fields": [row.get("exam_layer")],
            "observed_value": row.get("effective_source_value"),
            "source_value_before_overlays": row.get("source_value_before_overlays"),
            "effective_status": state,
            "source_provenance": {
                "primary_source": primary,
                "source_rule_evidence": evidence,
                "repair_provenance": row.get("source_repair_provenance"),
            },
            "evidence_needed": (
                "Locate the exact programme row and requirement text in the current official JAMB brochure/source; record page/table/cell and access date, then determine whether the blank is genuinely not published or was lost in extraction/overlay."
                if state == "blank" else
                "Review the complete official requirement text and determine whether its alternatives, subject pools, quantities, and conditions can be represented without changing the source meaning."
            ),
            "institution_scope_warning": "Institution codes are linked because the programme occurs in their extracted offering roster. Check institution-specific exceptions before treating this as the institution's operative requirement.",
        })

    # Each parsed offering occurrence without exact awarder-cell verification.
    for row in base.get("rows", []):
        if row.get("row_type") != "institution_offering_occurrence":
            continue
        name = row["jamb_identity"]
        raw_codes = list(dict.fromkeys([*(row.get("institution_codes") or []), *(row.get("waiver_institution_codes") or [])]))
        linked = []
        unresolved_tokens = []
        for raw in raw_codes:
            code = clean_code(raw)
            if code and code in school_records:
                linked.append({
                    **school_records[code],
                    "offering_id": uid("sp", code, name),
                    "link_basis": "listed in the programme occurrence's main roster or waiver list; exact cell evidence remains unverified",
                    "exact_offering_cell_verified": False,
                })
            else:
                unresolved_tokens.append(str(raw))
        source_file = row.get("source_file") or ""
        source_row = int(row.get("source_row") or 0)
        source_occ = next((x for x in occurrences.get(name, []) if x["source_file"] == source_file and x["source_row"] == source_row), {})
        add_issue({
            "issue_id": stable_issue_id("offering", name, source_file, str(source_row)),
            "issue_type": "offering_occurrence_lacks_exact_official_cell_verification",
            "status": "review_required_not_proven_wrong",
            "scope": "faculty_source_occurrence_and_listed_institution_roster",
            "programmes": [{**programme_records[name], "source_faculties": [row.get("source_faculty")]}],
            "institutions": linked,
            "unresolved_institution_tokens": unresolved_tokens,
            "affected_fields": ["programme_identity", "awarding_institution_roster"],
            "observed_value": {"institution_codes": raw_codes, "faculty": row.get("source_faculty")},
            "source_provenance": {
                "source_file": source_file,
                "source_row": source_row,
                "source_faculty": row.get("source_faculty"),
                "source_url": row.get("source_url"),
                "source_locator": row.get("source_locator"),
                "access_date": row.get("access_date"),
                "prior_inventory_candidates": row.get("prior_inventory_candidates") or [],
            },
            "evidence_needed": "Verify the exact programme heading, complete awarding-institution cell/roster, and row boundaries against the official brochure PDF; record the exact page/table/row locator and date. Do not treat title similarity or a partial text line as confirmation.",
            "institution_scope_warning": "This occurrence may affect multiple listed institutions. Confirm each institution is actually inside the exact JAMB awarder cell before editing any one institution's offering.",
        })

    # Exact-source candidates that still could not be safely represented as
    # institution-scoped rules. Keep source text intact; no matcher edits.
    for row in scoped.get("residual_rows", []):
        input_name = str(row.get("jamb_programme") or "").strip()
        name = programme_by_fold.get(input_name.casefold(), input_name)
        programme = programme_records.get(name)
        linked_codes = []
        for raw in row.get("offering_institutions") or []:
            code = clean_code(raw)
            if code and code in school_records:
                linked_codes.append(code)
        add_issue({
            "issue_id": stable_issue_id("scoped", name, row.get("exam_type", ""), row.get("source_locator", ""), row.get("source_text", "")),
            "issue_type": "institution_scoped_requirement_source_resolution_residual",
            "status": "review_required_source_candidate_not_executable_or_not_exact",
            "scope": "institution_specific_requirement_candidate",
            "programmes": ([programme] if programme else [{"programme_id": uid("jamb", name), "jamb_name": name, "identity_match": "candidate name not found in current offering source"}]),
            "institutions": [{
                **school_records[code],
                "offering_id": uid("sp", code, name),
                "link_basis": "institution named in the scoped-source candidate row",
                "exact_offering_cell_verified": False,
            } for code in linked_codes],
            "affected_fields": [row.get("exam_type")],
            "observed_value": row.get("source_text"),
            "source_provenance": {
                "source_url": row.get("source_url"),
                "source_locator": row.get("source_locator"),
                "institution_scoped_source_notes": row.get("institution_scoped_source_notes") or [],
            },
            "residual_reason": row.get("residual_reason"),
            "evidence_needed": "Resolve the stated residual reason against the exact official JAMB institution/programme cell. Preserve national and school-specific scopes separately; only later, after the Sociology pass, decide whether to repair canonical data.",
        })

    # Extraction tokens rejected by the seed's current institution-code shape.
    # This is an explicitly suspected class, not an adjudicated false institution.
    for row in invalid_tokens:
        name = row["jamb_name"]
        programme = programme_records[name]
        add_issue({
            "issue_id": stable_issue_id("token", name, row["source_file"], str(row["source_row"]), row["raw_token"], row["token_source_field"]),
            "issue_type": "suspected_institution_roster_token_contamination",
            "status": "suspected_source_extraction_or_identity_issue",
            "scope": "source_occurrence_token",
            "programmes": [{**programme, "source_faculties": [row["faculty"]]}],
            "institutions": [{
                "institution_id": None,
                "institution_code": row["raw_token"],
                "canonical_seed_name": None,
                "identity_status": "unresolved_raw_token_not_a_canonical_seed_school_code",
                "link_basis": "raw extracted institution field only",
            }],
            "affected_fields": [row["token_source_field"]],
            "observed_value": row["raw_token"],
            "source_provenance": {"source_file": row["source_file"], "source_row": row["source_row"], "faculty": row["faculty"]},
            "evidence_needed": "Check the corresponding official PDF row/cell to determine whether this is a real institution alias, a continuation fragment, a subject/programme phrase captured as an institution, or another extraction defect. Do not assign a school UUID before identity is verified.",
        })

    # Build queryable indexes, de-duplicating issue IDs within each index.
    programmes_index = {}
    for name, record in programme_records.items():
        issue_ids = list(dict.fromkeys(rows_by_programme.get(record["programme_id"], [])))
        if issue_ids:
            programmes_index[record["programme_id"]] = {**record, "issue_ids": issue_ids, "issue_count": len(issue_ids)}
    institutions_index = {}
    for code, record in school_records.items():
        issue_ids = list(dict.fromkeys(rows_by_school.get(record["institution_id"], [])))
        if issue_ids:
            institutions_index[record["institution_id"]] = {
                **record,
                "issue_ids": issue_ids,
                "issue_count": len(issue_ids),
                "affected_programme_ids": list(dict.fromkeys(
                    p["programme_id"] for issue in issues if issue["issue_id"] in set(issue_ids) for p in issue.get("programmes", [])
                )),
            }

    issue_type_index = {
        name: {"issue_ids": list(dict.fromkeys(ids)), "record_count": len(set(ids))}
        for name, ids in sorted(rows_by_type.items())
    }
    issue_status_counts = collections.Counter(row["status"] for row in issues)
    issue_type_counts = collections.Counter(row["issue_type"] for row in issues)
    counts = base.get("derived_counts", {})
    occurrence_count = sum(len(records) for records in occurrences.values())
    output = {
        "schema": "2026-10-12.jamb-issue-lookup-register.v1",
        "generated_on": DAY,
        "purpose": "Documentation-only, searchable register of JAMB local data completeness, offering verification, and institution-scoped requirement evidence issues.",
        "repair_status": "documentation_only_repairs_deferred_until_after_D078_Sociology_guided_experience_pass",
        "source_boundary": "Local canonical source JSON and checked-in audit ledgers only. No external source verification or live Supabase inspection is claimed by this register.",
        "identity_policy": {
            "programme_id": "Deterministic UUIDv5 matching data/career-mapping/_gen_seed.py uid('jamb', jamb_name).",
            "institution_id": "Deterministic UUIDv5 matching data/career-mapping/_gen_seed.py uid('school', normalized_institution_code).",
            "offering_id": "Deterministic UUIDv5 matching data/career-mapping/_gen_seed.py uid('sp', normalized_institution_code, jamb_name).",
            "institution_display_name": "The canonical seed currently stores the normalized institution code as schools.name; this register preserves that exact name and does not invent a long-form name.",
        },
        "coverage": {
            "canonical_programmes": counts.get("canonical_jamb_identities"),
            "parsed_source_occurrences": counts.get("parsed_offering_occurrences"),
            "generated_institution_programme_pairs": counts.get("institution_programme_pairs"),
            "distinct_institution_codes_in_lookup": len(school_records),
            "source_files_scanned": [str(path.relative_to(ROOT.parent.parent)).replace("\\", "/") for path in source_files],
            "requirement_layers_audited": ["national UTME", "national O'Level", "national Direct Entry source text", "institution-specific exceptions/candidates"],
            "not_reviewed_as_clean": ["all 420 identities are included in the underlying completeness audit; no row omitted from issue queues is certified clean by this lookup register", "official PDF cell verification is incomplete for 175/443 source occurrences", "institution-specific requirement residuals remain explicit"],
        },
        "reconciliation_counts": {
            "source_completeness_ledger_rows": len(base.get("rows", [])),
            "source_completeness_ledger_types": dict(collections.Counter(x.get("row_type") for x in base.get("rows", []))),
            "national_requirement_blank_after_overlays": counts.get("national_requirement_blanks_after_effective_overlays", {}),
            "national_utme_olevel_parse_outcomes": counts.get("national_utme_olevel_parse_outcomes", {}),
            "offering_occurrences_exactly_verified": counts.get("parsed_offering_occurrences_with_exact_pdf_verification_metadata"),
            "offering_occurrences_without_exact_pdf_verification": counts.get("parsed_offering_occurrences_without_exact_pdf_verification_metadata"),
            "scoped_source_candidates": scoped.get("counts", {}),
            "register_issue_records": len(issues),
            "register_status_counts": dict(sorted(issue_status_counts.items())),
            "register_issue_type_counts": dict(sorted(issue_type_counts.items())),
        },
        "lookup_instructions": {
            "by_institution": "Search institutions_by_id by deterministic institution_id or institution_code, then follow issue_ids to issues. Each institution record also lists affected_programme_ids.",
            "by_programme": "Search programmes_by_id by deterministic programme_id or jamb_name, then follow issue_ids to issues.",
            "by_issue_type": "Search issue_types for the issue type, then follow issue_ids. Status distinguishes confirmed local blanks from review-needed source text and suspected identity/extraction issues.",
        },
        "programmes_by_id": programmes_index,
        "institutions_by_id": institutions_index,
        "issue_types": issue_type_index,
        "issues": issues,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# JAMB programme/institution issue lookup register — 2026-10-12", "",
        "> Documentation only. Do not repair or promote JAMB records during the D078 Sociology guided-experience pass. Fixes are deferred until that pass is complete.", "",
        "## Purpose and lookup", "",
        "This register puts the existing JAMB completeness findings, unverified offering occurrences, and institution-scoped source-resolution residuals behind one shared issue list. Use the JSON index to start from either an institution or a programme, then follow its issue IDs to every associated issue type and evidence note.", "",
        f"- **{len(programme_records)}** canonical programme identities; **{occurrence_count}** parsed programme/faculty source occurrences.",
        f"- **{counts.get('institution_programme_pairs', 0)}** generated institution–programme pairs; **{len(school_records)}** normalized institution codes in this lookup index.",
        f"- Existing completeness ledger: **{len(base.get('rows', []))}** rows (national requirement layers and offering-occurrence verification).",
        f"- Existing institution-scoped source-resolution queue: **{scoped.get('counts', {}).get('residual_rows', 0)}** residual candidates, kept separate from national requirements.",
        f"- Joined lookup register: **{len(issues)}** issue/evidence records; see status and issue-type counts below.", "",
        "## Current evidence counts", "",
        f"- National requirement blanks after existing overlays: **{sum(counts.get('national_requirement_blanks_after_effective_overlays', {}).values())}** across UTME, O'Level and Direct Entry source text.",
        f"- National UTME/O'Level text needing structuring review: **{counts.get('national_utme_olevel_parse_outcomes', {}).get('utme:present_but_needs_review', 0)} UTME** and **{counts.get('national_utme_olevel_parse_outcomes', {}).get('olevel:present_but_needs_review', 0)} O'Level** records. This means the current parser has not fully represented the text; it does not prove JAMB's wording is wrong.",
        f"- Offering occurrences without exact official PDF cell verification: **{counts.get('parsed_offering_occurrences_without_exact_pdf_verification_metadata', 0)}/{counts.get('parsed_offering_occurrences', 0)}**.",
        f"- Institution-scoped source candidates: **{scoped.get('counts', {}).get('input_rows', 0)}** total; **{scoped.get('counts', {}).get('scoped_exact_rows', 0)}** exact rows; **{scoped.get('counts', {}).get('residual_rows', 0)}** residuals.",
        f"- Extracted institution tokens rejected by the current seed's code shape: **{len(invalid_tokens)}** suspected token records. These are not automatically confirmed false schools; verify against the source cell.", "",
        "### Register records by status", "",
    ]
    for status, total in sorted(issue_status_counts.items()):
        lines.append(f"- `{status}`: **{total}**")
    lines += ["", "### Register records by issue type", ""]
    for issue_type, total in sorted(issue_type_counts.items()):
        lines.append(f"- `{issue_type}`: **{total}**")
    lines += [
        "", "## Important interpretation rules", "",
        "1. A blank effective national field is a confirmed gap in the local record, not proof that JAMB has no published requirement. Check the source before deciding the repair.",
        "2. ‘Needs structuring review’ means the requirement text exists but the current matcher/parser has not fully represented its conditions. Do not label it incorrect without source adjudication.",
        "3. A programme’s national requirement issue is linked to its listed institutions for lookup convenience only. The institution-specific rule may differ; inspect the local exception and official institution cell separately.",
        "4. A roster occurrence lacking exact PDF verification is unverified, not automatically a wrong offering. Confirm the exact programme title and full awarder cell before changing a school/programme pair.",
        "5. Scoped-source residuals are not promoted into national rules. Keep exam type and institution scope intact.",
        "6. Deterministic IDs match the current seed generator: programme `uid('jamb', jamb_name)`, institution `uid('school', normalized_code)`, and offering `uid('sp', normalized_code, jamb_name)`. The canonical institution display name is currently the code; no long-form name is guessed.",
        "", "## Coverage and limitations", "",
        "The register joins local offering source JSON, the generated completeness ledger, the current institution-scoped resolution residuals, and the exact-occurrence inventory. It is not an official JAMB source re-verification, not a live database audit, and not a matcher test. A missing issue row is not proof that the underlying record is correct: the audit's current occurrence verification remains incomplete, and the source-specific residuals remain open.",
        "", "## Reproduction", "",
        "```powershell",
        "python data/career-mapping/_audit/build_jamb_issue_lookup_register_2026_10_12.py",
        "```", "",
        "Machine-readable register: `data/career-mapping/_audit/jamb_issue_lookup_register_2026_10_12.json`.",
        "Inputs: `jamb_data_completeness_ledger_2026_10_12.json`, `jamb_subject_scoped_resolution_2026_10_08.json`, `jamb_offering_context_inventory_2026-09-25.json`, and the nine `jamb/*_offerings.json` files.", "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({
        "markdown": str(OUT_MD), "json": str(OUT_JSON),
        "programme_count": len(programme_records), "occurrence_count": occurrence_count,
        "institution_count": len(school_records), "issue_count": len(issues),
        "status_counts": dict(sorted(issue_status_counts.items())),
        "issue_type_counts": dict(sorted(issue_type_counts.items())),
        "programme_index_count": len(programmes_index), "institution_index_count": len(institutions_index),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
