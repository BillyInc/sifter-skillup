#!/usr/bin/env python3
"""Read-only row-level completeness audit for canonical JAMB source data.

The audit derives the same effective national requirement fields used by
_gen_seed.py, but writes only the audit JSON/Markdown artifacts. It never
generates or edits SQL, matcher code, offering JSON, or live data.
"""

from __future__ import annotations

import collections
import copy
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
sys.path.insert(0, str(ROOT))

from _jamb_source_rules import (  # noqa: E402
    FIELD_BY_LAYER,
    apply_enrich_requirement_overlays,
    apply_source_rules_to_programmes,
    contaminated_national_text,
)
import _parse_subject_options as parser  # noqa: E402


DAY = "2026-10-12"
FIELD_TO_LAYER = {value: key for key, value in FIELD_BY_LAYER.items()}
OFFERING_FILES = sorted((ROOT / "jamb").glob("*_offerings.json"))
SOURCE_RULES = AUDIT / "jamb_brochure_source_rules_2026-08-19.json"
OVERRIDES = ROOT / "jamb" / "brochure_subject_overrides.json"
SCOPED = AUDIT / "jamb_subject_scoped_resolution_2026_10_08.json"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
OUT_JSON = AUDIT / f"jamb_data_completeness_ledger_{DAY.replace('-', '_')}.json"
OUT_MD = AUDIT / f"jamb_data_completeness_checkpoint_{DAY.replace('-', '_')}.md"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def generated_seed_counts() -> dict[str, int]:
    """Run the canonical generator into a disposable temp path and read counts."""
    with tempfile.TemporaryDirectory(prefix="jamb-completeness-") as temp_dir:
        temp_sql = Path(temp_dir) / "seed_career_pilot.sql"
        env = os.environ.copy()
        env["CAREER_PILOT_SEED_OUTPUT_PATH"] = str(temp_sql)
        result = subprocess.run(
            [sys.executable, str(ROOT / "_gen_seed.py")],
            cwd=ROOT,
            env=env,
            check=True,
            capture_output=True,
            text=True,
        )
        patterns = {
            "canonical_programmes": r"jamb_programmes:\s+(\d+)",
            "programme_mapping_rows": r"programme_mapping:\s+(\d+)",
            "national_requirement_rows": r"programme_subject_requirements:\s*(\d+)",
            "brochure_requirement_source_variant_rows": r"brochure source variants:\s+(\d+)",
            "institution_programme_pairs": r"school_programmes \(offerings\):\s+(\d+)",
            "institution_exception_rows": r"university requirement exceptions:\s+(\d+)",
            "structured_institution_option_rows": r"parsed university subject options:\s+(\d+)",
            "structured_institution_option_item_rows": r"parsed university subject items:\s+(\d+)",
        }
        counts = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, result.stdout)
            if not match:
                raise RuntimeError(f"Canonical generator output missing count: {key}\n{result.stdout}")
            counts[key] = int(match.group(1))
        return counts


def main() -> None:
    occurrences: list[dict] = []
    effective: dict[str, dict] = {}
    occurrence_faculties: dict[str, set[str]] = collections.defaultdict(set)
    source_records_by_id: dict[str, list[dict]] = collections.defaultdict(list)
    for path in OFFERING_FILES:
        doc = read(path)
        for index, row in enumerate(doc.get("programmes") or [], start=1):
            row = copy.deepcopy(row)
            name = row.get("jamb_name")
            if not name:
                continue
            faculty = doc.get("faculty") or path.stem.removesuffix("_offerings")
            occurrence_faculties[name].add(faculty)
            row["_source_file"] = path.name
            row["_source_row"] = index
            row["_faculty"] = faculty
            occurrences.append(row)
            source_records_by_id[name].append(row)
            if name not in effective:
                effective[name] = {
                    "jamb_name": name,
                    **{key: copy.deepcopy(row.get(key)) for key in FIELD_TO_LAYER.values()},
                    "_primary_source": {
                        "source_file": path.name,
                        "row": index,
                        "source_verification": row.get("source_verification"),
                    },
                }

    names = set(effective)
    for path in sorted((ROOT / "jamb" / "enrich").glob("*.json")):
        if path.name.startswith("_"):
            continue
        row = read(path)
        if row.get("jamb_name") in names:
            row["_source_file"] = f"enrich/{path.name}"
            source_records_by_id[row["jamb_name"]].append(row)
    enrich_rows = [row for rows in source_records_by_id.values() for row in rows if str(row.get("_source_file", "")).startswith("enrich/")]
    enrich_stats = apply_enrich_requirement_overlays(effective, enrich_rows)

    override_doc = read(OVERRIDES)
    override_stats = {"applied": 0}
    for name, override in override_doc.items():
        if name not in effective:
            continue
        target = effective[name]
        changed = False
        for field in FIELD_TO_LAYER.values():
            if field in override and override[field] is not None:
                target[field] = override[field]
                changed = True
        for field in override.get("clear_fields", []):
            if field in FIELD_TO_LAYER.values():
                target[field] = None
                changed = True
        if changed:
            override_stats["applied"] += 1

    source_rule_stats = apply_source_rules_to_programmes(effective, SOURCE_RULES)

    # The context inventory has exact occurrence identities and source-PDF
    # verification metadata; use it only as a prior artifact and join by exact
    # programme + source faculty + source-file occurrence.
    inventory = read(INVENTORY)
    verification = {}
    for identity in inventory.get("identities", []):
        for item in identity.get("source_offerings", []):
            key = (identity.get("jamb_name"), item.get("source_file"), item.get("source_faculty"))
            verification.setdefault(key, []).append(item)

    # Canonical scope and integrity audit for the institution pairs.
    all_codes: set[str] = set()
    pair_keys: list[tuple[str, str, str]] = []
    no_institution_rows = 0
    repeated_codes = 0
    for row in occurrences:
        tokens = list(row.get("institutions") or [])
        if not tokens:
            no_institution_rows += 1
        if len(tokens) != len(set(tokens)):
            repeated_codes += 1
        codes = list(tokens)
        for waiver in row.get("institution_waivers") or []:
            codes.extend(waiver.get("institutions") or ([waiver.get("institution")] if waiver.get("institution") else []))
        for code in codes:
            normalized = str(code or "").strip().upper()
            if normalized:
                all_codes.add(normalized)
                pair_keys.append((normalized, str(row["jamb_name"]), str(row["_source_file"])))
    duplicate_pairs = len(pair_keys) - len({(code, name) for code, name, _ in pair_keys})

    ledger: list[dict] = []
    baseline_counts = collections.Counter()
    effective_counts = collections.Counter()
    issue_counts = collections.Counter()
    parse_counts = collections.Counter()
    for name in sorted(effective, key=str.casefold):
        primary = next(row for row in occurrences if row.get("jamb_name") == name)
        national = effective[name]
        for layer, field in FIELD_BY_LAYER.items():
            raw_value = primary.get(field)
            value = national.get(field)
            is_blank_before = not (str(raw_value or "").strip())
            is_blank_after = not (str(value or "").strip())
            if is_blank_before:
                baseline_counts[f"national_{layer}_blank"] += 1
            if is_blank_after:
                effective_counts[f"national_{layer}_blank"] += 1
                issue_counts[f"national_{layer}_blank"] += 1
            contaminated = contaminated_national_text(layer, value)
            if contaminated:
                issue_counts["national_field_contains_scoped_or_mixed_text"] += 1
            parse_result = None
            if value:
                parse_result = parser.parse_utme(str(value)) if layer == "utme" else (
                    parser.parse_olevel(str(value)) if layer == "olevel" else None
                )
            if layer == "utme":
                matchable = bool(parse_result)
            elif layer == "olevel":
                matchable = bool(parse_result and parser.olevel_parts_are_matchable(str(value), parse_result))
            else:
                matchable = None
            if layer in {"utme", "olevel"}:
                state = "blank" if is_blank_after else ("matchable" if matchable else "present_but_needs_review")
                parse_counts[f"{layer}:{state}"] += 1
                if state == "present_but_needs_review":
                    issue_counts[f"{layer}_text_not_fully_matchable"] += 1
            else:
                state = "blank" if is_blank_after else "present_source_text_not_current_matcher_layer"
                if is_blank_after:
                    parse_counts[f"direct_entry:blank"] += 1
            provenance = national.get("_source_rule_repairs", {}).get(field)
            if provenance:
                source_rule = next((r for r in read(SOURCE_RULES).get("rows", []) if r.get("jamb_name") == name and r.get("layer") == layer), {})
                variants = source_rule.get("source_variants") or []
                exact = [v for v in variants if (v.get("source_variant") or {}).get("status") in {"exact", "inherited_shared"}]
                source_locator = []
                for variant in exact:
                    src = (variant.get("source_variant") or {}).get("source") or (variant.get("source_variant") or {}).get("inherited_from") or {}
                    source_locator.append({
                        "url": src.get("source_url") or src.get("official_source_url"),
                        "file": src.get("source_file"),
                        "pdf_page": src.get("pdf_page"),
                        "table_row": src.get("table_row"),
                        "course_cell": src.get("course_cell"),
                        "access_date": src.get("access_date") or src.get("verification_date"),
                    })
            else:
                source_locator = []
            record = {
                "row_type": "national_requirement_layer",
                "jamb_identity": name,
                "exam_layer": layer,
                "source_value_before_overlays": raw_value,
                "effective_source_value": value,
                "effective_status": state,
                "source_repair_provenance": provenance,
                "primary_source": primary.get("source_verification") or {
                    "source_file": primary["_source_file"], "source_row": primary["_source_row"],
                },
                "source_rule_evidence": source_locator,
                "distinct_institution_scopes": sorted(occurrence_faculties.get(name, [])),
                "candidate_institution_exceptions_are_not_national": True,
            }
            if is_blank_after or state == "present_but_needs_review" or contaminated or provenance:
                ledger.append(record)

    # Every parsed occurrence remains a separate row; no institution list is
    # treated as verified solely because an equivalent programme name exists.
    verified_occurrence_count = 0
    verification_states = collections.Counter()
    for row in occurrences:
        key = (row["jamb_name"], row["_source_file"], row["_faculty"])
        inv_rows = verification.get(key, [])
        verified = bool(row.get("source_verification", {}).get("verified_against_pdf")) or any(
            x.get("offering_row_verified_against_pdf") and x.get("pdf_table_locator") for x in inv_rows
        )
        if verified:
            verified_occurrence_count += 1
            verification_states["verified"] += 1
        else:
            verification_states["unverified_or_incomplete_locator"] += 1
            ledger.append({
                "row_type": "institution_offering_occurrence",
                "jamb_identity": row["jamb_name"],
                "source_file": row["_source_file"],
                "source_row": row["_source_row"],
                "source_faculty": row["_faculty"],
                "institution_codes": row.get("institutions") or [],
                "waiver_institution_codes": sorted({
                    str(code) for waiver in row.get("institution_waivers") or []
                    for code in (waiver.get("institutions") or ([waiver.get("institution")] if waiver.get("institution") else []))
                }),
                "source_url": (row.get("source_verification") or {}).get("official_source_url"),
                "source_locator": (row.get("source_verification") or {}).get("pdf_table_locator"),
                "access_date": (row.get("source_verification") or {}).get("verification_date"),
                "gap_class": "offering_occurrence_not_exactly_verified_to_official_pdf_cell",
                "prior_inventory_candidates": [
                    {k: x.get(k) for k in ("pdf_table_locator", "offering_row_verified_against_pdf", "verification_state", "source_file", "source_faculty") if x.get(k) is not None}
                    for x in inv_rows
                ],
            })

    source_rules = read(SOURCE_RULES)
    resolution_counts = collections.Counter(row.get("resolution") for row in source_rules.get("rows", []))
    variant_counts = collections.Counter(
        (variant.get("source_variant") or {}).get("status")
        for row in source_rules.get("rows", []) for variant in row.get("source_variants", [])
    )
    scoped = read(SCOPED)
    generated_counts = generated_seed_counts()
    output = {
        "schema": "2026-10-12.jamb-data-completeness-ledger.v1",
        "generated_on": DAY,
        "source_boundary": "Local canonical sources and generated local seed only; not live Supabase proof. National and institution-specific evidence are separate.",
        "source_artifacts": [
            *[str(path.relative_to(ROOT.parent.parent)).replace("\\", "/") for path in OFFERING_FILES],
            "data/career-mapping/jamb/enrich/*.json",
            "data/career-mapping/jamb/brochure_subject_overrides.json",
            "data/career-mapping/_audit/jamb_brochure_source_rules_2026-08-19.json",
            "data/career-mapping/_audit/jamb_subject_scoped_resolution_2026_10_08.json",
            "data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json",
        ],
        "derived_counts": {
            "canonical_jamb_identities": len(effective),
            "parsed_offering_occurrences": len(occurrences),
            "distinct_institution_codes_in_offering_and_waiver_sources": len(all_codes),
            "parsed_institution_tokens_in_main_lists": sum(len(row.get("institutions") or []) for row in occurrences),
            **generated_counts,
            "parsed_offering_occurrences_with_exact_pdf_verification_metadata": verified_occurrence_count,
            "parsed_offering_occurrences_without_exact_pdf_verification_metadata": len(occurrences) - verified_occurrence_count,
            "national_requirement_blanks_before_effective_overlays": dict(sorted(baseline_counts.items())),
            "national_requirement_blanks_after_effective_overlays": dict(sorted(effective_counts.items())),
            "national_utme_olevel_parse_outcomes": dict(sorted(parse_counts.items())),
            "source_rule_variant_statuses": dict(sorted(variant_counts.items())),
            "source_rule_resolution_statuses": dict(sorted(resolution_counts.items())),
            "scoped_source_resolution": scoped.get("counts", {}),
            "offering_integrity": {
                "empty_main_institution_lists": no_institution_rows,
                "duplicate_codes_within_occurrence": repeated_codes,
                "duplicate_institution_programme_pairs_across_occurrences": duplicate_pairs,
                "distinct_programme_faculty_contexts": sum(len(faculties) for faculties in occurrence_faculties.values()),
                "identities_with_multiple_faculty_contexts": sum(len(faculties) > 1 for faculties in occurrence_faculties.values()),
            },
        },
        "before_after_issue_counts": {
            "national_blank_fields": {
                "before": dict(sorted(baseline_counts.items())),
                "after": dict(sorted(effective_counts.items())),
            },
            "effective_issue_classes": dict(sorted(issue_counts.items())),
            "offering_exact_cell_verification": {
                "before_current_source_inventory": {"unverified_or_incomplete_locator": len(occurrences) - verified_occurrence_count},
                "after_this_audit": {"still_unverified_or_incomplete_locator": len(occurrences) - verified_occurrence_count},
            },
        },
        "unresolved_policy": [
            "A national blank remains unresolved even if one or more institution-specific exceptions provide an equivalent field.",
            "A present but unparseable national UTME/O'Level sentence remains review-only; it is not counted as a complete structured requirement.",
            "An offering occurrence without a unique official awarder-cell and complete institution roster locator remains unresolved; title similarity alone is insufficient.",
            "Direct Entry source text is retained in the canonical source seed but is outside the current UTME/O'Level matcher rule layer.",
        ],
        "rows": ledger,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = output["derived_counts"]
    lines = [
        "# JAMB canonical data completeness checkpoint — 2026-10-12", "",
        "## Current generated scope", "",
        f"- Canonical JAMB identities: **{counts['canonical_jamb_identities']}**.",
        f"- Parsed offering occurrences across nine faculty source files: **{counts['parsed_offering_occurrences']}**.",
        f"- Generated school–programme pairs: **{counts['institution_programme_pairs']}**; national requirement rows: **{counts['national_requirement_rows']}**.",
        f"- Preserved brochure requirement variants: **{counts['brochure_requirement_source_variant_rows']}**.",
        f"- Institution-specific exception rows/options/items: **{counts['institution_exception_rows']} / {counts['structured_institution_option_rows']} / {counts['structured_institution_option_item_rows']}**.",
        f"- Parsed occurrences with exact PDF verification metadata: **{verified_occurrence_count}/{len(occurrences)}**; unresolved occurrence rows are in the machine ledger.",
        "",
        "## Rule completeness and scope", "",
        "The effective national fields are derived in generator order: first canonical offering occurrence, unambiguous `jamb/enrich` overlay, explicit `brochure_subject_overrides.json`, then safe unique `jamb_brochure_source_rules`. The row ledger keeps national UTME/O'Level/Direct Entry layers separate from school-scoped exception rows. Blank national fields stay gaps even where a school exception exists. Present-but-unparseable text stays a review gap.",
        "",
        f"Source-rule repairs applied by the current generator: **{source_rule_stats.get('applied', 0)}**; enrichment applied/conflicted: **{enrich_stats.get('applied', 0)} / {enrich_stats.get('conflicts', 0)}**; explicit override records applied: **{override_stats['applied']}**.",
        f"Exact institution-scoped source resolution artifact: **{scoped.get('counts', {}).get('scoped_exact_rows', 0)}** exact rows, **{scoped.get('counts', {}).get('residual_rows', 0)}** residual rows. This evidence is not promoted into national rules.",
        "",
        "## Offerings integrity gates", "",
        f"Empty main institution lists: **{no_institution_rows}**; duplicate codes within an occurrence: **{repeated_codes}**; duplicate institution–programme pairs across source occurrences: **{duplicate_pairs}**.",
        "Cross-file duplicate identities are retained as separate faculty/source contexts. Unverified institution rosters are not counted complete based on a matching programme title. The auditor checks exact identity joins and duplicate pair risk; it does not claim that an institution offers a programme without a matching official source cell.",
        "",
        "## Unresolved queue", "",
        f"The machine-readable ledger has **{len(ledger)}** row-level gap/evidence records. It includes every blank national layer, every non-matchable UTME/O'Level national text layer, every source-rule-repaired national layer, and each offering occurrence without exact PDF cell verification metadata. Exact URLs, file/page/table locators and access dates are retained wherever present in the checked-in sources.",
        "",
        "## Reproduction", "",
        "```powershell",
        "python data/career-mapping/_audit/audit_jamb_data_completeness_2026_10_12.py",
        "# The audit invokes _gen_seed.py with CAREER_PILOT_SEED_OUTPUT_PATH pointed at a temporary file.",
        "```", "",
        "This is a local source/generated-artifact audit. It does not apply SQL, promote student-facing rules, or establish live deployment state.", "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({
        "json": str(OUT_JSON), "markdown": str(OUT_MD), "ledger_rows": len(ledger),
        "counts": counts,
        "issue_classes": dict(sorted(issue_counts.items())),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
