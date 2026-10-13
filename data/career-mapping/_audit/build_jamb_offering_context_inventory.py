#!/usr/bin/env python3
"""Inventory every parsed JAMB source-offering occurrence without merging contexts."""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
JAMB_DIR = ROOT / "data/career-mapping/jamb"
MAPPING_PATH = ROOT / "data/career-mapping/programme_mapping.json"
DOMAIN_MAP_PATH = ROOT / "data/career-mapping/jamb_domain_map.json"
OUTPUT_JSON = ROOT / "data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json"
OUTPUT_MD = ROOT / "data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.md"
MANUAL_SOURCE_CONFIRMATIONS = ROOT / "data/career-mapping/_audit/jamb_offering_context_source_confirmations_2026-09-25.json"

# The Social/Management Sciences IBASS table spells this title correctly,
# while the canonical JAMB identity intentionally preserves the parsed
# brochure spelling.  Keep both spellings in the occurrence record but attach
# the source row to the canonical identity instead of leaving it orphaned.
SOURCE_NAME_ALIASES = {
    "Sociology and Anthropology": "Sociology and Anthroplogy",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def context_id(source_file: str, parsed_file: str, ordinal: int, jamb_name: str) -> str:
    raw = f"{source_file}\0{parsed_file}\0{ordinal}\0{jamb_name}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def main() -> None:
    mapping_rows = load_json(MAPPING_PATH)["mappings"]
    active_map = load_json(DOMAIN_MAP_PATH)
    mapping_by_name = {row["jamb_name"]: row for row in mapping_rows}
    offerings_by_name: dict[str, list[dict]] = defaultdict(list)
    parsed_files = []
    occurrence_count = 0
    pdf_verified_parsed_count = 0

    for path in sorted(JAMB_DIR.glob("*_offerings.json")):
        document = load_json(path)
        parsed_files.append(path.name)
        for ordinal, row in enumerate(document.get("programmes", []), start=1):
            source_jamb_name = row.get("jamb_name")
            if not source_jamb_name:
                continue
            jamb_name = SOURCE_NAME_ALIASES.get(source_jamb_name, source_jamb_name)
            source_file = document.get("source") or path.name
            occurrence_count += 1
            verification = row.get("source_verification") or {}
            # The current offering ledgers already carry source-level JAMB
            # evidence on the row itself.  The old inventory only looked at
            # the optional ``source_verification`` overlay, so a row with an
            # official brochure URL/locator was incorrectly counted as
            # unverified.  Treat the source-text-confirmed row as verified
            # when it has both pieces of item-specific evidence, while still
            # preserving the explicit overlay when present.
            official_source_url = (
                verification.get("official_source_url")
                or row.get("source_url")
            )
            pdf_table_locator = (
                verification.get("pdf_table_locator")
                or row.get("source_locator")
            )
            verification_date = (
                verification.get("verification_date")
                or row.get("source_accessed_on")
            )
            verification_note = (
                verification.get("note")
                or row.get("source_support_note")
                or row.get("note")
            )
            is_pdf_verified = bool(
                verification.get("verified_against_pdf")
                or (
                    row.get("source_context_status") == "source_text_confirmed"
                    and official_source_url
                    and pdf_table_locator
                )
            )
            pdf_verified_parsed_count += int(is_pdf_verified)
            offerings_by_name[jamb_name].append(
                {
                    "occurrence_id": context_id(source_file, path.name, ordinal, jamb_name),
                    "source_faculty": document.get("faculty"),
                    "source_file": source_file,
                    "parsed_file": path.name,
                    "parsed_row_ordinal": ordinal,
                    "source_jamb_name": row.get("source_jamb_name") or source_jamb_name,
                    "institution_tokens_as_parsed": row.get("institutions") or [],
                    "requirements_available_in_record": any(
                        row.get(field)
                        for field in ("utme_subjects", "olevel_requirement", "direct_entry")
                    ),
                    "institution_codes_verified_from_pdf": verification.get("verified_institution_codes") or [],
                    "offering_row_verified_against_pdf": is_pdf_verified,
                    "pdf_table_locator": pdf_table_locator,
                    "official_source_url": official_source_url,
                    "verification_date": verification_date,
                    "verification_note": verification_note,
                }
            )

    manual_occurrences = []
    if MANUAL_SOURCE_CONFIRMATIONS.exists():
        manual_occurrences = load_json(MANUAL_SOURCE_CONFIRMATIONS).get("occurrences", [])
    for ordinal, row in enumerate(manual_occurrences, start=1):
        jamb_name = row["canonical_jamb_name"]
        if jamb_name not in mapping_by_name:
            raise ValueError(f"Manual JAMB source confirmation has no canonical identity: {jamb_name}")
        verification = row["verification"]
        if not verification.get("verified_against_pdf") or not verification.get("pdf_table_locator"):
            raise ValueError(f"Manual JAMB source confirmation is missing PDF verification: {jamb_name}")
        source_file = row["source_file"]
        confirmation_file = MANUAL_SOURCE_CONFIRMATIONS.name
        offerings_by_name[jamb_name].append(
            {
                "occurrence_id": context_id(source_file, confirmation_file, ordinal, jamb_name),
                "source_faculty": row.get("source_faculty"),
                "source_file": source_file,
                "parsed_file": None,
                "parsed_row_ordinal": None,
                "source_jamb_name": row["source_jamb_name"],
                "institution_tokens_as_parsed": [],
                "institution_codes_verified_from_pdf": row.get("institution_codes") or [],
                "requirements_available_in_record": False,
                "offering_row_verified_against_pdf": True,
                "pdf_table_locator": verification["pdf_table_locator"],
                "official_source_url": verification["official_source_url"],
                "verification_date": verification["verification_date"],
                "verification_note": verification.get("note"),
                "verification_record": confirmation_file,
            }
        )

    identities = []
    for ordinal, mapping in enumerate(mapping_rows, start=1):
        jamb_name = mapping["jamb_name"]
        contexts = offerings_by_name.get(jamb_name, [])
        map_row = active_map.get(jamb_name) or {}
        identities.append(
            {
                "canonical_order": ordinal,
                "jamb_name": jamb_name,
                "mapping_faculty": mapping.get("jamb_faculty"),
                "mapping_type": mapping.get("mapping_type"),
                "mapped_ccmas_programme": mapping.get("ccmas_programme"),
                "source_offering_count": len(contexts),
                "distinct_source_faculties": sorted(
                    {str(row.get("source_faculty") or "") for row in contexts}
                ),
                "source_offerings": contexts,
                "active_domain_map_status": map_row.get("mapping_status"),
                "active_domain_link_count": len(map_row.get("links") or []),
            }
        )

    canonical_names = set(mapping_by_name)
    source_names = set(offerings_by_name)
    context_counts = Counter(len(row["source_offerings"]) for row in identities)
    multi_context = [row for row in identities if len(row["distinct_source_faculties"]) > 1]
    missing_source = sorted(canonical_names - source_names, key=str.casefold)
    source_only = sorted(source_names - canonical_names, key=str.casefold)
    faculty_conflicts = [
        row
        for row in identities
        if row["mapping_faculty"]
        and row["distinct_source_faculties"]
        and row["mapping_faculty"] not in row["distinct_source_faculties"]
    ]

    document = {
        "schema_version": "2026-09-25.jamb-offering-context-inventory.v1",
        "purpose": "Preserve every parsed source-offering occurrence and its faculty/institution tokens separately from name-keyed curriculum mappings.",
        "source_boundary": "Parsed offering records are discovery evidence unless explicitly marked with an official PDF verification and locator. Manual confirmations are recorded separately and do not alter canonical identity counts or subject-requirement source files.",
        "counts": {
            "canonical_jamb_identities": len(identities),
            "parsed_offering_occurrences": occurrence_count,
            "manual_source_confirmed_occurrences": len(manual_occurrences),
            "total_source_offering_occurrences": occurrence_count + len(manual_occurrences),
            "pdf_verified_occurrences": pdf_verified_parsed_count + len(manual_occurrences),
            "parsed_source_files": len(parsed_files),
            "identity_occurrence_distribution": dict(sorted(context_counts.items())),
            "multi_faculty_identities": len(multi_context),
            "canonical_identities_without_exact_source_name": len(missing_source),
            "source_names_without_exact_canonical_identity": len(source_only),
            "mapping_faculty_not_present_in_parsed_faculty_contexts": len(faculty_conflicts),
        },
        "parsed_source_files": parsed_files,
        "identities_without_exact_source_name": missing_source,
        "source_names_without_exact_canonical_identity": source_only,
        "mapping_faculty_conflict_names": [row["jamb_name"] for row in faculty_conflicts],
        "multi_faculty_identities": [row["jamb_name"] for row in multi_context],
        "identities": identities,
    }
    OUTPUT_JSON.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# JAMB source-offering context inventory",
        "",
        "This inventory preserves parsed offering occurrences as context rows; it does not assert that OCR/parser institution tokens are correct. Verify source faculty, exact programme spelling, and awarding institutions against the relevant official JAMB PDF table before updating mappings.",
        "",
        f"- Canonical identities: **{len(identities)}**.",
        f"- Parsed offering occurrences: **{occurrence_count}** across **{len(parsed_files)}** parsed source files.",
        f"- Manually source-confirmed occurrences: **{len(manual_occurrences)}**.",
        f"- Total occurrence records: **{occurrence_count + len(manual_occurrences)}**; official-PDF verified: **{pdf_verified_parsed_count + len(manual_occurrences)}**.",
        f"- Exact canonical names without a parsed source occurrence: **{len(missing_source)}**.",
        f"- Parsed source names without an exact canonical identity: **{len(source_only)}**.",
        f"- Identities with multiple parsed faculty contexts: **{len(multi_context)}**.",
        f"- Canonical mapping faculty absent from the parsed contexts: **{len(faculty_conflicts)}** (triage only; not a confirmed discrepancy until source table verification).",
        "",
        f"Full occurrence-level records, parser-token arrays, verified institution codes, source locators, and stable context IDs are in [`{OUTPUT_JSON.name}`]({OUTPUT_JSON.name}). Each occurrence carries its own `offering_row_verified_against_pdf` value and locator.",
        "",
        "## Identities with multiple parsed faculty contexts",
        "",
        "| JAMB identity | Mapping faculty | Parsed source contexts (faculty — source — institution tokens) |",
        "|---|---|---|",
    ]
    for row in multi_context:
        contexts = "<br>".join(
            f"{context.get('source_faculty')} — {context.get('source_file')} — "
            f"{len(context.get('institution_tokens_as_parsed') or context.get('institution_codes_verified_from_pdf') or [])} institution codes"
            for context in row["source_offerings"]
        )
        lines.append(
            f"| {row['jamb_name']} | {row.get('mapping_faculty') or 'unset'} | {contexts} |"
        )
    lines.extend(
        [
            "",
            "## Canonical faculty labels absent from parsed source contexts",
            "",
            "These are source-reconciliation leads, not confirmed mapping errors. The original JAMB brochure heading and the specific awarding-institution table must be checked before deciding whether this is a naming normalization, parser issue, or wrong canonical faculty.",
            "",
            "| JAMB identity | Canonical mapping faculty | Parsed faculty — source — institution-token count |",
            "|---|---|---|",
        ]
    )
    for row in faculty_conflicts:
        contexts = "<br>".join(
            f"{context.get('source_faculty')} — {context.get('source_file')} — "
            f"{len(context.get('institution_tokens_as_parsed') or [])} tokens"
            for context in row["source_offerings"]
        )
        lines.append(
            f"| {row['jamb_name']} | {row['mapping_faculty']} | {contexts} |"
        )
    lines.extend(["", "## Exact-name coverage gaps", ""])
    lines.append("Canonical names without any exact parsed source occurrence: " + (", ".join(missing_source) or "none") + ".")
    lines.append("")
    lines.append("Parsed offering names without an exact canonical identity: " + (", ".join(source_only) or "none") + ".")
    lines.append("")
    OUTPUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(
        json.dumps(
            {
                "json": str(OUTPUT_JSON.relative_to(ROOT)),
                "markdown": str(OUTPUT_MD.relative_to(ROOT)),
                **document["counts"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
