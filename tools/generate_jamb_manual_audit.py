"""Generate the single, row-level manual JAMB brochure audit handoff."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLASSIFICATION = ROOT / "docs/manual-review/complete-subject-requirement-classification-2026-08-18.json"
SOURCE_AUDIT = ROOT / "docs/manual-review/brochure-subject-requirements-audit-2026-08-18.json"
SOURCE_RULES = ROOT / "data/career-mapping/_audit/jamb_brochure_source_rules_2026-08-19.json"
OUT = ROOT / "docs/manual-review/jamb-brochure-complete-manual-audit-2026-09-08.md"
LIVE_REVIEW = Path(r"C:\tmp\sifter_live_jamb_needs_review.json")


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def clean(value: object) -> str:
    if value is None:
        return "—"
    text = str(value).replace("\r", " ").replace("\n", " ").strip()
    return text or "—"


def bullet(value: object) -> str:
    return clean(value).replace("|", "\\|")


def source_locations(row: dict) -> list[str]:
    locations: list[str] = []
    for candidate in row.get("source_candidates") or []:
        source = candidate.get("source_file", "unknown PDF")
        page = candidate.get("page", "?")
        table_row = candidate.get("row", "?")
        course = clean(candidate.get("course_cell"))
        locations.append(f"{source}, PDF p.{page}, table row {table_row}; course cell: {course}")
    return locations


def main() -> None:
    classification = load(CLASSIFICATION)
    audit = load(SOURCE_AUDIT)
    source_rules = load(SOURCE_RULES)

    national = classification["nationalRequirements"]
    exceptions = classification["universityExceptions"]
    audit_by_key = {(row.get("jamb_name"), row.get("layer")): row for row in audit.get("rows", [])}
    unresolved = [row for row in source_rules.get("rows", []) if row.get("resolution") == "no_source_candidate"]
    live_review = json.loads(LIVE_REVIEW.read_text(encoding="utf-8")) if LIVE_REVIEW.exists() else []

    national_manual = [row for row in national if row.get("status") in {"needs_review", "empty"}]
    university_manual = [row for row in exceptions if row.get("status") == "needs_review"]
    national_manual.sort(key=lambda row: (str(row.get("jambName")), str(row.get("layer"))))
    university_manual.sort(key=lambda row: (str(row.get("jambName")), str(row.get("institution")), str(row.get("exceptionId"))))
    unresolved.sort(key=lambda row: (str(row.get("jamb_name")), str(row.get("layer"))))

    lines: list[str] = [
        "# Complete JAMB brochure manual audit",
        "",
        "Status date: 2026-09-08",
        "Scope: JAMB brochure requirements, subject rules, university offerings, and university-specific exceptions.",
        "",
        "This is the single manual-audit handoff. Every row still marked for source review or without a resolved source candidate is listed below. It does not ask for CCMAS, domain, subgroup, role, or labour-market work.",
        "",
        "## Read this first",
        "",
        "A programme name being found in the brochure is not the same as its admission rules being fully parsed. A row can have a valid programme identity and university offering while its UTME, O-level, Direct Entry, or university exception text is still incomplete or ambiguous.",
        "",
        "Only 'verified', 'inherited_shared', and 'variant_verified' source decisions may become executable subject-matching rules. 'source_blank', 'source_missing', 'source_conflict', 'extraction_gap', and 'needs_review' remain visible review states and must not create a positive eligibility match.",
        "",
        "Original source folder to inspect: C:\\Users\\USER\\Downloads\\jamb brochure.",
        "",
        "## Current inventory and live presentation state",
        "",
        "| Area | Current state | Meaning |",
        "|---|---:|---|",
        "| JAMB programme identities | 420 | National programme identities are present. |",
        "| University-programme offerings | 9,130 | Institution/programme pairs are present. |",
        "| National requirement rows | 1,260 | 420 programmes × UTME, O-level, and Direct Entry. |",
        "| National parsed | 247 live parse_status=parsed rows; the source classification snapshot marks 635 parsed layers | The live database and repository audit snapshot were generated at different stages; use the row-level lists below for manual work. |",
        "| National needs review | 172 live rows; 149 in the source classification snapshot | These must not be treated as fully structured until the source wording is confirmed. |",
        "| National unparsed | 1 live row | The row has no parsed rule status. |",
        "| University exception records | 3,877 live; 3,884 in the source classification snapshot | University-specific evidence is preserved separately from national rules. |",
        "| University exception needs review | 588 live; 657 in the source classification snapshot | These are the exact exception rows listed below. |",
        "| Structured university subject options | 2,030 | These are the current machine-readable local UTME/O-level option rules. |",
        "| Structured subject-option items | 12,210 | These are the subject members inside those options. |",
        "| Legacy offering UTME/O-level/DE columns | 0 non-null values in all 9,130 live offering rows | This is why the UI must use exception and structured-rule fallbacks; the source content is not absent from the database. |",
        "",
        "The current frontend fix makes university-specific requirements visible from the structured and exception records after a university is selected. It no longer hides them when saving a guidance checkpoint fails.",
        "",
        "## What is deliberately not a missing subject rule",
        "",
        f"- {classification['counts']['nationalByStatus'].get('direct_entry_route', 0)} national Direct Entry rows are qualification routes, not UTME/O-level subject-picker rules.",
        f"- {classification['counts']['exceptionsByStatus'].get('not_subject_rule', 0)} university records are preserved notes, Direct Entry clauses, or general conditions rather than executable subject rules.",
        f"- {classification['counts']['exceptionsByReason'].get('condition_only', 0)} exception records are conditions that need to remain attached to the university/programme context; they are not automatically national requirements.",
        "",
        "These rows should still be available in programme/university detail where relevant, but they must not be silently converted into a subject match.",
        "",
        "## Part 1 — National requirement layers requiring manual source review",
        "",
        f"Total rows listed: **{len(national_manual)}** ({Counter(row.get('status') for row in national_manual).get('needs_review', 0)} needs_review, {Counter(row.get('status') for row in national_manual).get('empty', 0)} empty). Review each layer separately: UTME, O-level, and Direct Entry.",
        "",
        "For every row, capture the exact requirement cell, continuation/shared heading, PDF page, table row, institution association, and one decision: exact_rule, shared_rule, partial_condition, cross_reference, source_blank, or needs_manual_interpretation.",
        "",
    ]

    for index, row in enumerate(national_manual, 1):
        key = (row.get("jambName"), row.get("layer"))
        audit_row = audit_by_key.get(key, {})
        locations = source_locations(audit_row)
        lines.extend([
            f"### N{index:03d}. {clean(row.get('jambName'))} — {clean(row.get('layer')).upper()}",
            "",
            f"- Current status: {clean(row.get('status'))}",
            f"- Review reason: {clean(row.get('reason'))}",
            f"- Source index: {clean(row.get('sourceJson'))}",
            f"- Current catalogue/source text: {bullet(row.get('text'))}",
            f"- Candidate brochure locations: {'; '.join(locations) if locations else 'No source candidate recorded by the local table audit.'}",
            "- Manual result: PENDING SOURCE REVIEW",
            "- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.",
            "",
        ])

    lines.extend([
        "### Current live database review rows",
        "",
        f"The live database currently reports {len(live_review)} national rows with parse_status=needs_review. The table below preserves their current programme name and raw three-layer values, including rows added or changed after the repository classification snapshot.",
        "",
        "| # | Programme | UTME source text | O-level source text | Direct Entry source text |",
        "|---:|---|---|---|---|",
    ])
    for index, row in enumerate(sorted(live_review, key=lambda item: str(item.get("jamb_name"))), 1):
        lines.append(
            f"| LIVE{index:03d} | {bullet(row.get('jamb_name'))} | {bullet(row.get('utme_subjects'))} | {bullet(row.get('olevel_requirement'))} | {bullet(row.get('direct_entry'))} |"
        )
    lines.extend([
        "",
        "The one current live database row with parse_status=unparsed is: International Studies and Diplomacy. Its UTME, O-level, and Direct Entry fields are all null. Confirm the original brochure row before adding any rule.",
        "",
    ])

    lines.extend([
        "## Part 2 — Layers with no resolved brochure source candidate",
        "",
        f"Total rows listed: **{len(unresolved)}**. These are not proven to be absent from the original PDFs; the local extraction did not produce a safe source candidate. Search the printed programme name, spelling variants, faculty block, and continuation headings in the original brochure before marking them source_missing.",
        "",
    ])
    for index, row in enumerate(unresolved, 1):
        lines.extend([
            f"### U{index:03d}. {clean(row.get('jamb_name'))} — {clean(row.get('layer')).upper()}",
            "",
            f"- Current catalogue text: {bullet(row.get('catalogue_text'))}",
            "- Local source status: source_row_not_found / no_source_candidate",
            "- Manual result: PENDING SOURCE SEARCH",
            "- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.",
            "",
        ])

    lines.extend([
        "## Part 3 — University-specific exception rows requiring review",
        "",
        f"Total rows listed: **{len(university_manual)}**. Search the original brochure using the JAMB programme name and institution together. Keep the result attached to that university/programme pair; do not promote it to a national rule unless the brochure explicitly defines it as shared.",
        "",
        "| # | JAMB programme | Institution | Review reason | Route/source label | Current text |",
        "|---:|---|---|---|---|---|",
    ])
    for index, row in enumerate(university_manual, 1):
        lines.append(
            f"| UEX{index:03d} | {bullet(row.get('jambName'))} | {bullet(row.get('institution'))} | {bullet(row.get('reason'))} | {bullet(row.get('rawRoute'))} / {bullet(row.get('sourceLabel'))} | {bullet(row.get('text'))} |"
        )
    lines.extend([
        "",
        "For every university exception above, add: original PDF filename, PDF page, table row, exact waiver/exception text, route (UTME, O-LEVEL, DIRECT ENTRY, or GENERAL NOTE), scope (full rule, partial condition, cross-reference, or source blank), and referenced programme if the text says ‘same as’ or ‘as in’.",
        "",
        "## Part 4 — Offering and university-requirement audit",
        "",
        "The institution/programme pairs are present, but the legacy offering columns are not populated in the current live database. This is not permission to guess or copy a neighbouring university rule.",
        "",
        "The current source-backed replacement layers are:",
        "",
        "- school_programme_requirement_exceptions: university-scoped brochure text, including parse status and source label.",
        "- school_programme_subject_options: structured UTME/O-level university rules.",
        "- school_programme_subject_option_items: the named subjects and group logic inside each structured option.",
        "- schools.address: the university address shown to disambiguate institutions.",
        "",
        "Manually audit an offering only when the institution/programme pair is missing, wrong, duplicated under the wrong identity, or has a source exception that cannot be attached to the pair. Do not re-enter every offering merely because the legacy text columns are blank.",
        "",
        "## Part 5 — How the incomplete states should behave in the product",
        "",
        "- parsed / verified source text: may participate in matching and may be shown as a requirement.",
        "- needs_review: may be shown in programme or university details with a clear ‘needs confirmation’ label; it must not create a positive subject match by itself.",
        "- empty / source_blank: show that no usable rule was supplied for that layer; do not invent a rule.",
        "- no_source_candidate: keep the programme/offering discoverable where the identity is valid, but exclude that layer from eligibility matching and show the missing-source state in details.",
        "- Direct Entry-only material: show only in a relevant Direct Entry route; never use it as a UTME subject.",
        "- University-specific material: show after a university is selected, under ‘This university’s requirements’, with its address, source/status, structured options, and exception notes.",
        "",
        "## Manual completion block",
        "",
        "Use this exact shape for each completed item:",
        "",
        "~~~text",
        "PROGRAMME:",
        "INSTITUTION:",
        "LAYER: UTME | O-LEVEL | DIRECT ENTRY | WAIVER",
        "SOURCE PDF:",
        "PDF PAGE:",
        "TABLE ROW:",
        "BROCHURE TEXT:",
        "DECISION: exact_rule | shared_rule | partial_condition | cross_reference | source_blank | source_missing | needs_manual_interpretation",
        "REFERENCE: programme named by the brochure, if any",
        "NOTE:",
        "~~~",
        "",
        "Do not use a guessed alternative, a neighbouring programme, or a university waiver as a national subject rule.",
        "",
    ])

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT} ({len(lines)} lines; {len(national_manual)} national rows; {len(unresolved)} unresolved source rows; {len(university_manual)} university exception rows)")


if __name__ == "__main__":
    main()
