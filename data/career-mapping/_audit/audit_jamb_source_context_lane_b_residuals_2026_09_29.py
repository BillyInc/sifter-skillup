#!/usr/bin/env python3
"""Write an append-only Lane B checkpoint for JAMB source-context residuals.

This is deliberately a consumer of the latest deterministic discovery artifact.
It does not reread or repair canonical JAMB/CCMAS data and it does not inspect
downstream domain, subgroup, or role links.  The output preserves every
deterministic residual occurrence plus the source-context collision summaries
needed for the next authoritative source-cell pass.
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
OFFERING_INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
SOURCE_CONFIRMATIONS = AUDIT / "jamb_offering_context_source_confirmations_2026-09-25.json"
MAPPING = ROOT / "data" / "career-mapping" / "programme_mapping.json"
JAMB_DIR = ROOT / "data" / "career-mapping" / "jamb"

SOURCE_URLS = {
    "Administration": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "Agriculture": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "Arts and Humanities": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Education": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "Engineering/Environmental/Technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Law": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    "Medical/Pharmaceutical/Health": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf",
    "Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "Social/Management Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}

LOCAL_EXTRACTS = {
    "Administration.pdf": "data/career-mapping/_jamb_txt/Administration.txt",
    "agriculture.txt": "data/career-mapping/_jamb_txt/agriculture.txt",
    "arts_hum.txt": "data/career-mapping/_jamb_txt/arts_hum.txt",
    "education.txt": "data/career-mapping/_jamb_txt/education.txt",
    "engineering.txt": "data/career-mapping/_jamb_txt/engineering.txt",
    "Law.pdf": "data/career-mapping/_jamb_txt/Law.txt",
    "medical.txt": "data/career-mapping/_jamb_txt/medical.txt",
    "Sciences.pdf": "data/career-mapping/_jamb_txt/Sciences.txt",
    "Social Management Science.pdf": "data/career-mapping/_jamb_txt/Social Management Science.txt",
}

FACULTY_EXTRACTS = {
    "Administration": "data/career-mapping/_jamb_txt/Administration.txt",
    "Agriculture": "data/career-mapping/_jamb_txt/agriculture.txt",
    "Arts and Humanities": "data/career-mapping/_jamb_txt/arts_hum.txt",
    "Education": "data/career-mapping/_jamb_txt/education.txt",
    "Engineering/Environmental/Technology": "data/career-mapping/_jamb_txt/engineering.txt",
    "Law": "data/career-mapping/_jamb_txt/Law.txt",
    "Medical/Pharmaceutical/Health": "data/career-mapping/_jamb_txt/medical.txt",
    "Sciences": "data/career-mapping/_jamb_txt/Sciences.txt",
    "Social/Management Sciences": "data/career-mapping/_jamb_txt/Social Management Science.txt",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def unique_sorted(values: list[str]) -> list[str]:
    return sorted({str(value) for value in values if value is not None}, key=str.casefold)


def context_key(row: dict[str, Any]) -> str:
    raw = "\0".join(
        str(row.get(field) or "")
        for field in ("source_file", "parsed_file", "ordinal", "jamb_name")
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def flatten_occurrences(discovery: dict[str, Any]) -> list[dict[str, Any]]:
    occurrences: list[dict[str, Any]] = []
    for identity in discovery["jamb_identities"]:
        for occurrence in identity.get("source_occurrences") or []:
            row = dict(occurrence)
            row["canonical_jamb_name"] = identity["jamb_name"]
            row["canonical_join"] = True
            row["context_id"] = occurrence.get("occurrence_id") or context_key(row)
            occurrences.append(row)
    for occurrence in discovery.get("orphan_source_occurrences") or []:
        row = dict(occurrence)
        row["canonical_jamb_name"] = None
        row["canonical_join"] = False
        row["context_id"] = occurrence.get("occurrence_id") or context_key(row)
        occurrences.append(row)
    return occurrences


def occurrence_match_key(row: dict[str, Any]) -> tuple[str, str, int | None, str]:
    return (
        str(row.get("source_file") or ""),
        str(row.get("parsed_file") or ""),
        row.get("ordinal") if row.get("ordinal") is not None else row.get("parsed_row_ordinal"),
        str(row.get("jamb_name") or row.get("source_jamb_name") or ""),
    )


def load_current_raw_offerings() -> list[dict[str, Any]]:
    """Read current raw offering metadata without changing the ledger."""
    rows: list[dict[str, Any]] = []
    for path in sorted(JAMB_DIR.glob("*_offerings.json")):
        document = read_json(path)
        for ordinal, programme in enumerate(document.get("programmes") or [], start=1):
            verification = programme.get("source_verification") or {}
            rows.append(
                {
                    "jamb_name": programme.get("jamb_name"),
                    "source_jamb_name": programme.get("source_jamb_name") or programme.get("jamb_name"),
                    "source_faculty": document.get("faculty"),
                    "source_file": document.get("source") or path.name,
                    "parsed_file": path.name,
                    "ordinal": ordinal,
                    "institutions": programme.get("institutions") or [],
                    "verified_against_pdf": bool(verification.get("verified_against_pdf")),
                    "pdf_table_locator": verification.get("pdf_table_locator"),
                    "official_source_url": verification.get("official_source_url"),
                    "verification_date": verification.get("verification_date"),
                    "verification_note": verification.get("note"),
                    "institution_codes_verified_from_pdf": verification.get("verified_institution_codes") or [],
                }
            )
    return rows


def enrich_from_current_raw(row: dict[str, Any], raw_by_key: dict[tuple[str, str, int | None, str], dict[str, Any]]) -> dict[str, Any]:
    raw = raw_by_key.get(occurrence_match_key(row))
    if not raw:
        return dict(row)
    merged = dict(raw)
    merged.update({key: value for key, value in row.items() if value is not None})
    return merged


def verification_class(row: dict[str, Any]) -> str:
    verified = bool(row.get("verified_against_pdf"))
    locator = bool(row.get("pdf_table_locator"))
    url = bool(row.get("official_source_url"))
    verified_date = bool(row.get("verification_date"))
    if verified and locator and url and verified_date:
        return "complete_pdf_metadata"
    if verified and not (locator and url and verified_date):
        return "verified_flag_without_complete_metadata"
    if not verified and locator and url and verified_date:
        return "explicitly_unverified_with_locator"
    return "unverified_without_complete_metadata"


def source_evidence(row: dict[str, Any]) -> dict[str, Any]:
    source_file = str(row.get("source_file") or "")
    faculty = str(row.get("source_faculty") or "")
    return {
        "official_source_url": row.get("official_source_url") or SOURCE_URLS.get(faculty),
        "source_faculty": faculty or None,
        "source_file": source_file or None,
        "local_extract": LOCAL_EXTRACTS.get(source_file),
        "pdf_table_locator": row.get("pdf_table_locator"),
        "verification_date": row.get("verification_date"),
        "institution_codes_verified_from_pdf": row.get("institution_codes_verified_from_pdf") or [],
        "verification_note": row.get("verification_note"),
        "access_date_for_lane": "2026-09-29",
    }


def context_summary(row: dict[str, Any]) -> dict[str, Any]:
    resolved_context_id = row.get("context_id") or row.get("occurrence_id") or context_key(row)
    return {
        "context_id": resolved_context_id,
        "canonical_jamb_name": row.get("canonical_jamb_name"),
        "source_jamb_name": row.get("source_jamb_name") or row.get("jamb_name"),
        "source_faculty": row.get("source_faculty"),
        "source_file": row.get("source_file"),
        "parsed_file": row.get("parsed_file"),
        "ordinal": row.get("ordinal"),
        "institutions": row.get("institutions") or row.get("institution_tokens_as_parsed") or [],
        "verified_against_pdf": bool(row.get("verified_against_pdf") or row.get("offering_row_verified_against_pdf")),
        "verification_class": verification_class(row),
        "evidence": source_evidence(row),
    }


def current_identity_contexts(discovery: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    return {identity["jamb_name"]: list(identity.get("source_occurrences") or []) for identity in discovery["jamb_identities"]}


def build_faculty_context_collisions(
    discovery: dict[str, Any], mapping_rows: dict[str, dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    multi_faculty: list[dict[str, Any]] = []
    mapping_absent: list[dict[str, Any]] = []
    institution_overlap: list[dict[str, Any]] = []

    for identity in discovery["jamb_identities"]:
        name = identity["jamb_name"]
        contexts = list(identity.get("source_occurrences") or [])
        faculties = unique_sorted([str(row.get("source_faculty") or "") for row in contexts])
        mapping_faculty = mapping_rows.get(name, {}).get("jamb_faculty")
        if mapping_faculty and faculties and mapping_faculty not in faculties:
            mapping_absent.append(
                {
                    "jamb_name": name,
                    "mapping_faculty": mapping_faculty,
                    "source_faculties": faculties,
                    "occurrence_count": len(contexts),
                    "recommendation": "verify whether the canonical faculty is a normalization or a source-context mismatch; do not rewrite automatically",
                }
            )
        if len(faculties) <= 1:
            continue

        multi_faculty.append(
            {
                "jamb_name": name,
                "mapping_faculty": mapping_faculty,
                "source_faculties": faculties,
                "occurrence_count": len(contexts),
                "contexts": [context_summary({**row, "canonical_jamb_name": name, "context_id": row.get("occurrence_id") or context_key(row)}) for row in contexts],
            }
        )
        for left_index, left in enumerate(contexts):
            for right in contexts[left_index + 1 :]:
                if left.get("source_faculty") == right.get("source_faculty"):
                    continue
                left_institutions = unique_sorted([str(value) for value in left.get("institutions") or []])
                right_institutions = unique_sorted([str(value) for value in right.get("institutions") or []])
                overlap = sorted(set(left_institutions).intersection(right_institutions), key=str.casefold)
                if overlap:
                    institution_overlap.append(
                        {
                            "jamb_name": name,
                            "left_faculty": left.get("source_faculty"),
                            "right_faculty": right.get("source_faculty"),
                            "overlapping_institution_codes": overlap,
                            "left_context_id": left.get("occurrence_id") or context_key({**left, "jamb_name": name}),
                            "right_context_id": right.get("occurrence_id") or context_key({**right, "jamb_name": name}),
                            "recommendation": "retain institution/faculty occurrences separately and verify each exact brochure cell before assigning curriculum scope",
                        }
                    )
    return multi_faculty, mapping_absent, institution_overlap


def next_output_index() -> int:
    prefix = "jamb_source_context_lane_b_residual_checkpoint_2026-09-29_"
    existing = []
    for path in AUDIT.glob(prefix + "*.json"):
        try:
            existing.append(int(path.stem.rsplit("_", 1)[-1]))
        except ValueError:
            continue
    return max(existing, default=0) + 1


def render_markdown(document: dict[str, Any], json_name: str) -> str:
    counts = document["counts"]
    buckets = document["verification_buckets"]
    lines = [
        "# Lane B — JAMB source-context deterministic residual checkpoint",
        "",
        "**Generated:** 2026-09-29 (Africa/Lagos)",
        "**Mode:** deterministic residual audit only; no canonical data edited",
        "**Scope:** JAMB offering identity/source-context reconciliation only",
        "",
        "This checkpoint consumes the latest `jamb_ccmas_deterministic_discovery_2026-09-28.json`. It does not reopen closed CCMAS course-detail repairs, audit downstream domain/subgroup/role links, or infer source truth from a review label.",
        "",
        f"Complete row-level residuals and evidence locators are in [`{json_name}`]({json_name}).",
        "",
        "## Exact current baseline",
        "",
        "| Measure | Count |",
        "|---|---:|",
        f"| Canonical JAMB identities | {counts['canonical_identities']} |",
        f"| Current parsed offering rows | {counts['current_parsed_offering_occurrences']} |",
        f"| Canonical-linked parsed rows | {counts['canonical_linked_offering_occurrences']} |",
        f"| Orphan source rows | {counts['orphan_source_occurrences']} |",
        f"| CCMAS packages (read-through baseline only) | {counts['ccmas_packages']} |",
        "",
        "## Requested deterministic residuals",
        "",
        "| Residual | Count | Disposition |",
        "|---|---:|---|",
        f"| Missing explicit PDF flag or locator | **{counts['missing_explicit_pdf_flag_or_locator']}** | Open evidence queue; no automatic promotion |",
        f"| Current occurrences without a stable prior-inventory ID | **{counts['unstable_current_occurrences']}** | Reconcile by source file + ordinal + exact title before assigning an ID |",
        f"| Orphan source occurrence | **{counts['orphan_source_occurrences']}** | Preserve source spelling; reconcile to canonical identity only with explicit alias evidence |",
        f"| Older-inventory-only occurrence | **{counts['older_inventory_only_occurrences']}** | Reconcile as inventory drift; do not count as a new current row |",
        f"| Institution-roster drift records | **{counts['institution_roster_drift']}** | Verify exact awarder cells; do not replace arrays wholesale |",
        "",
        "### Missing PDF metadata breakdown",
        "",
        "| Current row state | Count |",
        "|---|---:|",
        f"| Unverified with no row-level metadata | {buckets['unverified_without_complete_metadata']} |",
        f"| Explicitly unverified but carrying URL/locator/date | {buckets['explicitly_unverified_with_locator']} |",
        f"| Verified flag present but URL/locator/date incomplete | {buckets['verified_flag_without_complete_metadata']} |",
        f"| Complete flag + URL + locator + date (not in residual) | {buckets['complete_pdf_metadata']} |",
        "",
        "The 290 rows are preserved individually in JSON, with source faculty, source file, row ordinal, institution tokens, current verification state, official brochure URL, local extract, locator, date, and note. The 30 explicitly-unverified rows must not be treated as verified merely because a locator exists; the 8 inconsistent verified rows need metadata reconciliation.",
        "",
        "## Identity and inventory drift",
        "",
        f"The three unstable current rows are: **{', '.join(item['source_jamb_name'] for item in document['residuals']['unstable_current_occurrences'])}**. They are current source rows absent from the older stable-occurrence signature; they are not new canonical identities.",
        "",
        f"The orphan is **{document['residuals']['orphan_source_occurrences'][0]['source_jamb_name']}**, from the Social/Management Sciences brochure. Its local source evidence is retained, but it differs from the canonical spelling **Sociology and Anthroplogy**. This is one source-name reconciliation cluster, not permission to merge standalone Anthropology.",
        "",
        "The older-inventory-only record is the separately retained Administration confirmation for `PUBLIC ADMINISTRATION AND LOCAL GOVERNMENT` (UNN), printed p. 86, verified 2026-09-25. It is not silently added to the current parsed ledger.",
        "",
        "### Roster drift",
        "",
        "All 32 drift records are included in JSON. The table below is the complete name-level index; prior/current institution arrays and added/removed tokens remain in JSON.",
        "",
        "| JAMB identity | Faculty | Prior count | Current count |",
        "|---|---|---:|---:|",
    ]
    for row in document["residuals"]["institution_roster_drift"]:
        lines.append(
            f"| {row['jamb_name']} | {row['source_faculty']} | {len(row['prior_institutions'])} | {len(row['current_institutions'])} |"
        )

    lines.extend(
        [
            "",
            "## Source-context collisions",
            "",
            f"- **{counts['casefold_canonical_collisions']}** casefold collision groups: "
            + "; ".join(
                f"{', '.join(group['canonical_spellings'])} ({group['normalized_name']})"
                for group in document["collisions"]["casefold_canonical_collisions"]
            )
            + ". These remain separate identities until an explicit identity decision is made.",
            f"- **{counts['multi_faculty_identity_contexts']}** identities have more than one parsed source faculty. Their complete context rows are in JSON; no same-name display merge was performed.",
            f"- **{counts['same_name_institution_faculty_overlap_identities']}** identities have the same institution code in more than one faculty context. The overlapping pairs are listed in JSON and require exact-cell verification.",
            f"- **{counts['mapping_faculty_absent_from_current_contexts']}** identities have a canonical mapping-faculty label absent from the currently parsed source-faculty set. This is a triage signal, not a confirmed faculty error.",
            "",
            "## Evidence used",
            "",
            "The deterministic artifact and prior offering inventory were reused without rerunning closed course-detail checks. Every source row points to the matching official JAMB/IBASS brochure URL and local extracted-text file where available. The Lane B access date is 2026-09-29; pre-existing row verification dates are preserved rather than overwritten.",
            "",
        ]
    )
    for source in document["evidence_sources"]:
        lines.append(f"- **{source['source_faculty']}** — [{source['official_source_url']}]({source['official_source_url']}); local extract `{source['local_extract']}`.")

    lines.extend(
        [
            "",
            "## Deterministic repair recommendations",
            "",
            "1. Verify the 252 rows with no row-level evidence against the exact JAMB brochure cell, then add the official URL, printed/page or extracted locator, access date, verified flag, and institution-code evidence in a later authorized repair.",
            "2. Reconcile the 30 explicitly-unverified rows and 8 metadata-inconsistent verified rows. A locator alone is not verification; do not promote either class automatically.",
            "3. Assign stable occurrence IDs only after the three current-only rows are matched by exact source file, ordinal, title, faculty, and awarder cell. Keep the orphan spelling as an alias/provenance value rather than collapsing it into a display-name match.",
            "4. Resolve the 32 roster differences from exact cells. Preserve source contexts and avoid wholesale replacement of institution arrays because prior parser output contains wrapped/header tokens.",
            "5. Keep all multi-faculty, casefold, and same-institution overlap contexts separate. Any curriculum or CCMAS decision must be made per source faculty/institution occurrence, not per display name.",
            "",
            "## Change boundary",
            "",
            "Only this append-only checkpoint script and its checkpoint artifacts are produced. No canonical JAMB/CCMAS data, offering ledger, domain map, seed, SQL, downstream link, or role data was edited.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    discovery = read_json(DISCOVERY)
    mapping_document = read_json(MAPPING)
    mapping_rows = {row["jamb_name"]: row for row in mapping_document["mappings"]}
    offering_inventory = read_json(OFFERING_INVENTORY)
    source_confirmations = read_json(SOURCE_CONFIRMATIONS)

    occurrences = flatten_occurrences(discovery)
    raw_occurrences = load_current_raw_offerings()
    raw_by_key = {occurrence_match_key(row): row for row in raw_occurrences}
    if len(occurrences) != discovery["counts"]["jamb_all_parsed_offering_occurrences"]:
        raise AssertionError("latest discovery occurrence count does not match its flattened rows")
    if len(raw_occurrences) != len(occurrences):
        raise AssertionError("current raw offering ledgers and latest discovery disagree on total rows")
    if len(mapping_rows) != discovery["counts"]["jamb_canonical_identities"]:
        raise AssertionError("canonical identity count changed unexpectedly")

    residual_occurrences = [
        context_summary(enrich_from_current_raw(row, raw_by_key))
        for row in occurrences
        if not (bool(row.get("verified_against_pdf")) and bool(row.get("pdf_table_locator")))
    ]
    buckets = Counter(verification_class(row) for row in raw_occurrences)
    expected_buckets = {
        "complete_pdf_metadata": 153,
        "explicitly_unverified_with_locator": 30,
        "verified_flag_without_complete_metadata": 8,
        "unverified_without_complete_metadata": 252,
    }
    if dict(buckets) != expected_buckets:
        raise AssertionError(f"current offering verification buckets changed: {dict(buckets)}")
    if len(residual_occurrences) != discovery["counts"]["jamb_occurrences_without_explicit_pdf_flag_or_locator"]:
        raise AssertionError("residual missing-PDF count does not match latest discovery")

    unstable = [
        context_summary(enrich_from_current_raw(row, raw_by_key))
        for row in discovery.get("jamb_current_only_occurrences") or []
    ]
    orphan = [
        context_summary(enrich_from_current_raw(row, raw_by_key))
        for row in discovery.get("orphan_source_occurrences") or []
    ]
    older_only = [
        {
            "occurrence_id": row.get("occurrence_id"),
            "source_jamb_name": row.get("source_jamb_name"),
            "source_faculty": row.get("source_faculty"),
            "source_file": row.get("source_file"),
            "institution_codes_verified_from_pdf": row.get("institution_codes_verified_from_pdf") or [],
            "verified_against_pdf": bool(row.get("offering_row_verified_against_pdf")),
            "evidence": {
                "official_source_url": row.get("official_source_url"),
                "pdf_table_locator": row.get("pdf_table_locator"),
                "verification_date": row.get("verification_date"),
                "verification_note": row.get("verification_note"),
                "verification_record": row.get("verification_record"),
                "access_date_for_lane": "2026-09-29",
            },
        }
        for row in discovery.get("jamb_older_inventory_only_occurrences") or []
    ]
    roster_drift = []
    for row in discovery.get("jamb_institution_roster_differences_vs_inventory") or []:
        prior = unique_sorted(row.get("prior_institutions") or [])
        current = unique_sorted(row.get("current_institutions") or [])
        roster_drift.append(
            {
                **row,
                "prior_institutions": prior,
                "current_institutions": current,
                "added_in_current": sorted(set(current) - set(prior), key=str.casefold),
                "removed_from_current": sorted(set(prior) - set(current), key=str.casefold),
                "recommendation": "verify the exact JAMB awarder cell before changing the current occurrence",
            }
        )

    multi_faculty, mapping_absent, institution_overlap = build_faculty_context_collisions(discovery, mapping_rows)
    document = {
        "schema_version": "2026-09-29.jamb-source-context-lane-b-residuals.v1",
        "generated_on": "2026-09-29",
        "lane": "B",
        "status": "deterministic_residual_checkpoint",
        "write_mode": "append_only",
        "scope": "JAMB offering identity/source-context reconciliation only",
        "excluded": [
            "closed CCMAS course-detail repairs",
            "downstream domain/subgroup/role links",
            "canonical JAMB/CCMAS/seed/SQL edits",
            "semantic source adjudication beyond the existing evidence fields",
        ],
        "counts": {
            "canonical_identities": discovery["counts"]["jamb_canonical_identities"],
            "current_parsed_offering_occurrences": len(occurrences),
            "canonical_linked_offering_occurrences": len(occurrences) - len(orphan),
            "orphan_source_occurrences": len(orphan),
            "ccmas_packages": discovery["counts"]["ccmas_programme_packages"],
            "missing_explicit_pdf_flag_or_locator": len(residual_occurrences),
            "unstable_current_occurrences": len(unstable),
            "older_inventory_only_occurrences": len(older_only),
            "institution_roster_drift": len(roster_drift),
            "casefold_canonical_collisions": len(discovery.get("casefold_name_collisions") or []),
            "multi_faculty_identity_contexts": len(multi_faculty),
            "same_name_institution_faculty_overlap_identities": len({row["jamb_name"] for row in institution_overlap}),
            "same_name_institution_faculty_overlap_pairs": len(institution_overlap),
            "mapping_faculty_absent_from_current_contexts": len(mapping_absent),
            "exact_canonical_source_name_gaps": len(discovery["known_inventory_reconciliation"].get("current_canonical_names_without_exact_source_spelling") or []),
            "exact_source_canonical_name_gaps": len(discovery["known_inventory_reconciliation"].get("current_parsed_source_names_without_canonical_identity") or []),
        },
        "verification_buckets": dict(buckets),
        "inputs": {
            "latest_deterministic_discovery": str(DISCOVERY.relative_to(ROOT)),
            "latest_deterministic_discovery_sha256": sha256(DISCOVERY),
            "prior_offering_context_inventory": str(OFFERING_INVENTORY.relative_to(ROOT)),
            "prior_offering_context_inventory_sha256": sha256(OFFERING_INVENTORY),
            "manual_source_confirmations": str(SOURCE_CONFIRMATIONS.relative_to(ROOT)),
            "manual_source_confirmations_sha256": sha256(SOURCE_CONFIRMATIONS),
            "canonical_mapping": str(MAPPING.relative_to(ROOT)),
            "canonical_mapping_sha256": sha256(MAPPING),
        },
        "residuals": {
            "missing_explicit_pdf_flag_or_locator": residual_occurrences,
            "unstable_current_occurrences": unstable,
            "orphan_source_occurrences": orphan,
            "older_inventory_only_occurrences": older_only,
            "institution_roster_drift": roster_drift,
        },
        "collisions": {
            "casefold_canonical_collisions": discovery.get("casefold_name_collisions") or [],
            "multi_faculty_identity_contexts": multi_faculty,
            "same_name_institution_faculty_overlap": institution_overlap,
            "mapping_faculty_absent_from_current_contexts": mapping_absent,
        },
        "identity_gap_reconciliation": discovery["known_inventory_reconciliation"],
        "manual_source_confirmations_reused": source_confirmations.get("occurrences") or [],
        "evidence_sources": [
            {
                "source_faculty": faculty,
                "official_source_url": url,
                "local_extract": FACULTY_EXTRACTS.get(faculty),
                "access_date_for_lane": "2026-09-29",
            }
            for faculty, url in SOURCE_URLS.items()
        ],
        "deterministic_repair_recommendations": [
            "Verify the 252 rows with no row-level evidence against their exact official JAMB brochure cells; add URL, locator, date, flag, and verified institution codes only in a later authorized repair.",
            "Keep the 30 explicitly-unverified rows unpromoted even though they carry a locator; reconcile the 8 verified-flag rows with incomplete metadata before treating them as source-complete.",
            "Assign stable occurrence IDs to the three current-only rows only after exact source-file, ordinal, title, faculty, and awarder-cell matching.",
            "Preserve the orphan source spelling and the canonical spelling as separate provenance values until an explicit alias/identity decision is recorded.",
            "Verify all 32 roster drifts against exact awarder cells; never replace a current institution array solely because it differs from the older parser inventory.",
            "Keep casefold duplicates, multi-faculty contexts, and same-institution overlaps separate by occurrence ID and source faculty; do not collapse by display name.",
            "Treat mapping-faculty-absent signals as triage only until the official source heading and exact awarder cell establish whether the difference is normalization or a real context mismatch.",
        ],
    }

    index = next_output_index()
    json_path = AUDIT / f"jamb_source_context_lane_b_residual_checkpoint_2026-09-29_{index:03d}.json"
    md_path = AUDIT / f"jamb_source_context_lane_b_residual_checkpoint_2026-09-29_{index:03d}.md"
    json_path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(document, json_path.name), encoding="utf-8")
    print(json.dumps({"json": str(json_path.relative_to(ROOT)), "markdown": str(md_path.relative_to(ROOT)), "counts": document["counts"]}, indent=2))


if __name__ == "__main__":
    main()
