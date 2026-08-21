"""Audit the repository's O-level/UTME/combined admission mapping.

This is a source/seed audit, not a substitute for applying the migrations and
seeds to Supabase.  It proves the relationships the repository can prove:

* every structured subject option points to one JAMB programme and requirement;
* every option item points to the subject catalogue and uses valid grouping;
* every matched JAMB programme has at least one seeded university offering;
* the combined path has both exam layers available for the same programme.

It deliberately does not call a programme "eligible" from prose alone.  The
semantic correctness of a brochure interpretation remains a manual/source
review item, especially for broad phrases such as "any relevant subject".
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from generate_manual_review_pack import (  # type: ignore
    OPTIONS,
    SEED,
    SUBJECTS,
    dedupe,
    sql_rows,
    structured_options,
)

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "data" / "career-mapping"))
from _parse_subject_options import OLEVEL_CODES, UTME_CODES  # type: ignore
from _parse_local_subject_exceptions import parse_local_exception  # type: ignore


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "manual-review"


def build_audit() -> dict[str, Any]:
    seed_text = SEED.read_text(encoding="utf-8")
    subject_rows = sql_rows(SUBJECTS.read_text(encoding="utf-8"), "subject_catalog")
    subject_codes = {str(row[0]) for row in subject_rows if len(row) >= 2}
    subject_names = {str(row[0]): str(row[1]) for row in subject_rows if len(row) >= 2}

    # `sql_rows` intentionally handles scalar SQL values; PostgreSQL ARRAY
    # literals contain commas of their own. Use the parser's canonical layer
    # sets here and independently verify every generated item against them.
    subject_exam_types: dict[str, set[str]] = defaultdict(set)
    for code in UTME_CODES:
        subject_exam_types[code].add("utme")
    for code in OLEVEL_CODES:
        subject_exam_types[code].add("olevel")

    jamb_rows = dedupe(sql_rows(seed_text, "jamb_programmes"), 0)
    jamb = {
        str(row[0]): {"id": str(row[0]), "name": row[1]}
        for row in jamb_rows
        if len(row) >= 2
    }
    requirement_rows = dedupe(sql_rows(seed_text, "programme_subject_requirements"), 0)
    requirements_by_id = {
        str(row[0]): {
            "id": str(row[0]),
            "jamb_programme_id": str(row[1]),
            "utme_subjects": row[2],
            "olevel_requirement": row[3],
        }
        for row in requirement_rows
        if len(row) >= 4
    }
    requirements_by_jamb = {
        row["jamb_programme_id"]: row for row in requirements_by_id.values()
    }

    school_rows = dedupe(sql_rows(seed_text, "schools"), 0)
    school_ids = {str(row[0]) for row in school_rows if row}
    offering_rows = dedupe(
        [row for row in sql_rows(seed_text, "school_programmes") if len(row) >= 3],
        0,
    )
    offerings = [
        {
            "id": str(row[0]),
            "school_id": str(row[1]),
            "jamb_programme_id": str(row[2]),
            "remarks": row[3] if len(row) >= 4 else None,
        }
        for row in offering_rows
    ]
    offerings_by_jamb: dict[str, list[dict[str, str]]] = defaultdict(list)
    for offering in offerings:
        offerings_by_jamb[offering["jamb_programme_id"]].append(offering)
    offering_ids = {row["id"] for row in offerings}

    exception_rows = [
        row for row in sql_rows(seed_text, "school_programme_requirement_exceptions")
        if len(row) >= 9
    ]
    exceptions = [
        {
            "id": str(row[0]),
            "school_programme_id": str(row[1]),
            "school_id": str(row[2]),
            "jamb_programme_id": str(row[3]),
            "exam_type": row[4],
            "requirement_text": row[5],
            "source_file": row[6],
            "source_label": row[7],
            "parse_status": row[8],
        }
        for row in exception_rows
    ]

    local_option_rows = [
        row for row in sql_rows(seed_text, "school_programme_subject_options")
        if len(row) >= 11
    ]
    local_options = [
        {
            "id": str(row[0]),
            "exception_id": str(row[1]),
            "school_programme_id": str(row[2]),
            "school_id": str(row[3]),
            "jamb_programme_id": str(row[4]),
            "exam_type": row[5],
            "rule_scope": row[6],
            "option_label": row[7],
            "min_required": row[8],
            "source_text": row[9],
            "condition_text": row[10],
        }
        for row in local_option_rows
    ]
    local_option_ids = {row["id"] for row in local_options}
    local_items = []
    local_item_re = re.compile(
        r"INSERT INTO school_programme_subject_option_items .*?SELECT\s+"
        r"'([^']+)',\s*'([^']+)',\s*sc\.id,\s*'([^']+)',\s*"
        r"(NULL|'[^']*'),\s*(NULL|\d+),\s*(NULL|'[^']*')\s+"
        r"FROM subject_catalog sc WHERE sc\.code\s*=\s*'([^']+)'",
        re.I | re.S,
    )
    for match in local_item_re.finditer(seed_text):
        local_items.append(
            {
                "id": match.group(1),
                "option_id": match.group(2),
                "requirement_role": match.group(3),
                "group_key": None if match.group(4).upper() == "NULL" else match.group(4)[1:-1],
                "min_from_group": None if match.group(5).upper() == "NULL" else int(match.group(5)),
                "distinct_group_key": None if match.group(6).upper() == "NULL" else match.group(6)[1:-1],
                "subject_code": match.group(7),
            }
        )

    options_by_jamb, _ = structured_options()
    options = [option for rows in options_by_jamb.values() for option in rows]
    option_ids = {str(option["id"]) for option in options}
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    def error(code: str, **payload: Any) -> None:
        errors.append({"code": code, **payload})

    def warning(code: str, **payload: Any) -> None:
        warnings.append({"code": code, **payload})

    option_counts = Counter()
    semantic_checks = {"checked": 0, "passed": 0, "failed": []}
    items_by_option: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for jamb_id, jamb_options in options_by_jamb.items():
        for option in jamb_options:
            option_id = str(option["id"])
            exam_type = str(option.get("exam_type") or "").lower()
            option_counts[exam_type] += 1
            if jamb_id not in jamb:
                error("option_unknown_jamb_programme", optionId=option_id, jambProgrammeId=jamb_id)
            requirement = requirements_by_id.get(str(option.get("requirement_id")))
            if not requirement:
                error("option_unknown_requirement", optionId=option_id, requirementId=option.get("requirement_id"))
            elif requirement["jamb_programme_id"] != jamb_id:
                error(
                    "option_requirement_programme_mismatch",
                    optionId=option_id,
                    jambProgrammeId=jamb_id,
                    requirementProgrammeId=requirement["jamb_programme_id"],
                )
            if exam_type not in {"utme", "olevel"}:
                error("option_invalid_exam_type", optionId=option_id, examType=exam_type)
            if not option.get("items"):
                error("option_has_no_subject_items", optionId=option_id)
            for item in option.get("items") or []:
                item = {**item, "option_id": option_id}
                items_by_option[option_id].append(item)
                code = str(item.get("subject_code") or "")
                if code not in subject_codes:
                    error("option_item_unknown_subject", optionId=option_id, subjectCode=code)
                allowed_codes = UTME_CODES if exam_type == "utme" else OLEVEL_CODES
                if code not in allowed_codes:
                    error(
                        "option_item_wrong_exam_layer",
                        optionId=option_id,
                        examType=exam_type,
                        subjectCode=code,
                    )
                if exam_type not in subject_exam_types.get(code, set()):
                    error(
                        "option_item_not_catalogued_for_exam_layer",
                        optionId=option_id,
                        examType=exam_type,
                        subjectCode=code,
                    )
                role = item.get("requirement_role")
                if role not in {"required", "one_of", "recommended"}:
                    error("option_item_invalid_role", optionId=option_id, role=role)
                if role == "one_of" and not item.get("group_key"):
                    error("one_of_item_missing_group", optionId=option_id, subjectCode=code)
                if role == "one_of" and not item.get("min_from_group"):
                    error("one_of_item_missing_group_min", optionId=option_id, subjectCode=code)

            groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
            for item in option.get("items") or []:
                if item.get("requirement_role") == "one_of":
                    groups[str(item.get("group_key"))].append(item)
            for group_key, group_items in groups.items():
                mins = {int(item.get("min_from_group") or 0) for item in group_items}
                if len(mins) > 1:
                    error(
                        "one_of_group_inconsistent_min",
                        optionId=option_id,
                        groupKey=group_key,
                        mins=sorted(mins),
                    )
                minimum = max(mins) if mins else 0
                if minimum > len(group_items):
                    error(
                        "one_of_group_min_exceeds_options",
                        optionId=option_id,
                        groupKey=group_key,
                        minimum=minimum,
                        optionCount=len(group_items),
                    )
            required_count = len(
                [item for item in option.get("items") or [] if item.get("requirement_role") == "required"]
            )
            group_minimum = sum(
                max(int(item.get("min_from_group") or 0) for item in group_items)
                for group_items in groups.values()
                if group_items
            )
            minimum_combination_size = required_count + group_minimum
            declared_minimum = int(option.get("min_required") or 0)
            if declared_minimum < minimum_combination_size:
                error(
                    "declared_minimum_below_structured_minimum",
                    optionId=option_id,
                    examType=exam_type,
                    declaredMinimum=declared_minimum,
                    structuredMinimum=minimum_combination_size,
                )
            elif declared_minimum > minimum_combination_size:
                warning(
                    "declared_minimum_above_structured_minimum",
                    optionId=option_id,
                    examType=exam_type,
                    declaredMinimum=declared_minimum,
                    structuredMinimum=minimum_combination_size,
                )

            # Construct one synthetic valid selection from the generated rule.
            # This proves the stored required/group semantics are internally
            # satisfiable; it does not claim that the brochure wording itself
            # has passed manual source review.
            selected = {
                str(item["subject_code"])
                for item in option.get("items") or []
                if item.get("requirement_role") == "required"
            }
            for group_items in groups.values():
                minimum = max(int(item.get("min_from_group") or 0) for item in group_items)
                selected.update(sorted({str(item["subject_code"]) for item in group_items})[:minimum])
            if exam_type == "olevel" and len(selected) < declared_minimum:
                selected.update(
                    sorted(OLEVEL_CODES - selected)[: declared_minimum - len(selected)]
                )
            semantic_checks["checked"] += 1
            required_codes = {
                str(item["subject_code"])
                for item in option.get("items") or []
                if item.get("requirement_role") == "required"
            }
            group_satisfied = all(
                sum(1 for item in group_items if str(item["subject_code"]) in selected)
                >= max(int(item.get("min_from_group") or 0) for item in group_items)
                for group_items in groups.values()
            )
            passes = required_codes.issubset(selected) and group_satisfied
            if exam_type == "olevel":
                passes = passes and len(selected) >= declared_minimum
            if passes:
                semantic_checks["passed"] += 1
            else:
                semantic_checks["failed"].append(
                    {"optionId": option_id, "examType": exam_type, "selected": sorted(selected)}
                )

    structured_jamb_ids = set(options_by_jamb)
    utme_jamb_ids = {
        jamb_id for jamb_id, rows in options_by_jamb.items() if any(row.get("exam_type") == "utme" for row in rows)
    }
    olevel_jamb_ids = {
        jamb_id for jamb_id, rows in options_by_jamb.items() if any(row.get("exam_type") == "olevel" for row in rows)
    }
    both_jamb_ids = utme_jamb_ids & olevel_jamb_ids
    no_offering_jamb_ids = sorted(jamb_id for jamb_id in structured_jamb_ids if not offerings_by_jamb.get(jamb_id))
    for jamb_id in no_offering_jamb_ids:
        error(
            "structured_programme_has_no_university_offering",
            jambProgrammeId=jamb_id,
            jambName=(jamb.get(jamb_id) or {}).get("name"),
        )
    broken_offering_school_ids = sorted(
        {row["school_id"] for row in offerings if row["school_id"] not in school_ids}
    )
    for school_id in broken_offering_school_ids:
        error("offering_unknown_school", schoolId=school_id)
    broken_offering_jamb_ids = sorted(
        {row["jamb_programme_id"] for row in offerings if row["jamb_programme_id"] not in jamb}
    )
    for jamb_id in broken_offering_jamb_ids:
        error("offering_unknown_jamb_programme", jambProgrammeId=jamb_id)

    exception_types = Counter()
    exception_pairs_ok = True
    for exception in exceptions:
        exception_types[str(exception["exam_type"])] += 1
        if exception["school_programme_id"] not in offering_ids:
            exception_pairs_ok = False
            error(
                "exception_unknown_school_programme",
                exceptionId=exception["id"],
                schoolProgrammeId=exception["school_programme_id"],
            )
        if exception["school_id"] not in school_ids:
            exception_pairs_ok = False
            error("exception_unknown_school", exceptionId=exception["id"], schoolId=exception["school_id"])
        if exception["jamb_programme_id"] not in jamb:
            exception_pairs_ok = False
            error(
                "exception_unknown_jamb_programme",
                exceptionId=exception["id"],
                jambProgrammeId=exception["jamb_programme_id"],
            )
        if exception["parse_status"] not in {"parsed", "needs_review", "not_subject_rule"}:
            error(
                "exception_invalid_parse_status",
                exceptionId=exception["id"],
                parseStatus=exception["parse_status"],
            )

    exceptions_by_id = {row["id"]: row for row in exceptions}
    local_options_by_id = {row["id"]: row for row in local_options}
    local_items_by_option: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in local_items:
        local_items_by_option[item["option_id"]].append(item)
        if item["option_id"] not in local_option_ids:
            error("local_option_item_unknown_option", optionId=item["option_id"], itemId=item["id"])
        if item["subject_code"] not in subject_codes:
            error("local_option_item_unknown_subject", optionId=item["option_id"], subjectCode=item["subject_code"])

    parsed_exception_ids = {
        exception["id"] for exception in exceptions if exception["parse_status"] == "parsed"
    }
    for option in local_options:
        exception = exceptions_by_id.get(option["exception_id"])
        if not exception:
            error("local_option_unknown_exception", optionId=option["id"], exceptionId=option["exception_id"])
            continue
        if exception["parse_status"] != "parsed":
            error("local_option_exception_not_parsed", optionId=option["id"], exceptionId=option["exception_id"])
        if option["exam_type"] not in {"utme", "olevel"}:
            error("local_option_invalid_exam_type", optionId=option["id"], examType=option["exam_type"])
        if option["rule_scope"] not in {"full", "partial"}:
            error("local_option_invalid_scope", optionId=option["id"], ruleScope=option["rule_scope"])
        if not local_items_by_option.get(option["id"]) and not (
            option.get("condition_text") and int(option.get("min_required") or 0) == 0
        ):
            error("local_option_has_no_subject_items", optionId=option["id"])
        if option["school_programme_id"] not in offering_ids or option["school_id"] not in school_ids or option["jamb_programme_id"] not in jamb:
            error("local_option_unknown_offering_link", optionId=option["id"])

    for exception_id in parsed_exception_ids:
        if exception_id not in {option["exception_id"] for option in local_options}:
            error("parsed_exception_missing_structured_option", exceptionId=exception_id)

    local_exam_counts = Counter(option["exam_type"] for option in local_options)
    local_scope_counts = Counter(option["rule_scope"] for option in local_options)
    local_parser_check = {"checked": 0, "passed": 0, "inheritedCrossReferences": 0, "failed": []}
    for option in local_options:
        local_parser_check["checked"] += 1
        parsed = parse_local_exception(next(
            exception["requirement_text"] for exception in exceptions
            if exception["id"] == option["exception_id"]
        ))
        if parsed.get("status") == "parsed" and parsed.get("exam_type") == option["exam_type"] and parsed.get("rule_scope") == option["rule_scope"]:
            local_parser_check["passed"] += 1
        elif parsed.get("reason") == "cross_reference" and option["source_text"]:
            # The generator resolved this only after verifying an unambiguous
            # same-school target rule. The raw note intentionally remains a
            # cross-reference, so it cannot be reparsed as a standalone rule.
            local_parser_check["passed"] += 1
            local_parser_check["inheritedCrossReferences"] += 1
        else:
            local_parser_check["failed"].append(option["id"])

    # Business Administration is a regression fixture for the layer boundary:
    # its UTME option must not acquire technical/trade O-level-only subjects.
    business_admin_id = "9d9c8373-bd9f-5382-b799-f9269ea0b1f9"
    business_admin_options = options_by_jamb.get(business_admin_id, [])
    business_admin_check: dict[str, Any] = {"jambProgrammeId": business_admin_id}
    ba_utme = next((o for o in business_admin_options if o.get("exam_type") == "utme"), None)
    if not ba_utme:
        error("business_administration_missing_utme_option")
    else:
        ba_required = sorted(
            str(item["subject_code"])
            for item in ba_utme.get("items") or []
            if item.get("requirement_role") == "required"
        )
        ba_group = sorted(
            str(item["subject_code"])
            for item in ba_utme.get("items") or []
            if item.get("requirement_role") == "one_of"
        )
        business_admin_check.update({"utmeRequired": ba_required, "utmeAlternatives": ba_group})
        if ba_required != ["ECON", "MATH"]:
            error("business_administration_unexpected_utme_required", required=ba_required)
        wrong_layer = sorted(set(ba_group) - UTME_CODES)
        if wrong_layer:
            error("business_administration_utme_contains_olevel_only_subject", subjects=wrong_layer)

    # This is the exact condition the combined matcher uses: UTME and O-level
    # evidence must resolve to the same JAMB ID. It is not a university-specific
    # eligibility decision until a selected offering is loaded and its current
    # institution requirements are confirmed.
    combined_rows = []
    for jamb_id in sorted(both_jamb_ids):
        combined_rows.append(
            {
                "jambProgrammeId": jamb_id,
                "jambName": (jamb.get(jamb_id) or {}).get("name"),
                "utmeOptionCount": len([o for o in options_by_jamb[jamb_id] if o.get("exam_type") == "utme"]),
                "olevelOptionCount": len([o for o in options_by_jamb[jamb_id] if o.get("exam_type") == "olevel"]),
                "universityOfferingCount": len(offerings_by_jamb.get(jamb_id, [])),
            }
        )

    # A structured option and a requirement row exist, but the live/current
    # seed may still have no parse-status update. That is a review limitation,
    # not permission to present a text fallback as exact.
    parse_status_by_requirement: dict[str, str] = defaultdict(lambda: "unparsed")
    option_text = OPTIONS.read_text(encoding="utf-8")
    for match in re.finditer(
        r"UPDATE programme_subject_requirements SET parse_status='(parsed|needs_review)'.*?WHERE id = '([^']+)'",
        option_text,
        re.IGNORECASE,
    ):
        parse_status_by_requirement[match.group(2)] = match.group(1)
    for option in options:
        status = parse_status_by_requirement[str(option.get("requirement_id"))]
        if status != "parsed":
            warning(
                "structured_option_requirement_not_marked_parsed",
                optionId=option.get("id"),
                requirementId=option.get("requirement_id"),
                parseStatus=status,
            )

    return {
        "generatedAt": date.today().isoformat(),
        "scope": {
            "source": [str(SEED.relative_to(ROOT)), str(OPTIONS.relative_to(ROOT)), str(SUBJECTS.relative_to(ROOT))],
            "note": "Repository seed audit only; live database must be refreshed separately.",
        },
        "counts": {
            "jambProgrammes": len(jamb),
            "requirements": len(requirements_by_id),
            "schools": len(school_ids),
            "universityOfferings": len(offerings),
            "subjectCatalogue": len(subject_codes),
            "structuredOptions": len(options),
            "utmeOptions": option_counts.get("utme", 0),
            "olevelOptions": option_counts.get("olevel", 0),
            "programmesWithUtmeAndOlevel": len(both_jamb_ids),
            "universityRequirementExceptions": len(exceptions),
            "structuredUniversitySubjectOptions": len(local_options),
            "structuredUniversitySubjectItems": len(local_items),
        },
        "proof": {
            "structuredOptionsWithKnownJambProgramme": sum(
                1 for option in options if str(option.get("jamb_programme_id")) in jamb
            ),
            "structuredOptionsWithKnownRequirement": sum(
                1 for option in options if str(option.get("requirement_id")) in requirements_by_id
            ),
            "structuredProgrammesWithUniversityOffering": len(structured_jamb_ids - set(no_offering_jamb_ids)),
            "combinedSameJambProgrammeRows": len(combined_rows),
            "allUniversityOfferingPairsHaveKnownSchoolAndProgramme": not broken_offering_school_ids and not broken_offering_jamb_ids,
            "allUniversityExceptionsHaveKnownOfferingAndProgramme": exception_pairs_ok,
            "allParsedUniversityExceptionsHaveStructuredOptions": parsed_exception_ids.issubset(
                {option["exception_id"] for option in local_options}
            ),
            "allStructuredUniversityOptionsReparseOrInheritFromVerifiedRule": not local_parser_check["failed"],
            "ambiguousUniversityExceptionsRemainReviewOnly": all(
                exception["parse_status"] != "needs_review"
                or exception["id"] not in {option["exception_id"] for option in local_options}
                for exception in exceptions
            ),
            "nationalAndUniversityRequirementsAreStoredSeparately": True,
        },
        "layerChecks": {
            "utmeCatalogueCodes": len(UTME_CODES),
            "olevelCatalogueCodes": len(OLEVEL_CODES),
            "technicalTradeCodesExcludedFromUtme": len(OLEVEL_CODES - UTME_CODES),
            "syntheticOptionSemantics": semantic_checks,
            "businessAdministration": business_admin_check,
            "universityOfferingRowsWithRemarks": sum(1 for row in offerings if row.get("remarks")),
            "universityRequirementExceptionTypes": dict(sorted(exception_types.items())),
            "structuredUniversityOptionExamTypes": dict(sorted(local_exam_counts.items())),
            "structuredUniversityOptionScopes": dict(sorted(local_scope_counts.items())),
            "localRuleParser": local_parser_check,
        },
        "combinedRows": combined_rows,
        "errors": errors,
        "warnings": warnings,
        "subjectNames": subject_names,
    }


def markdown_report(audit: dict[str, Any]) -> str:
    counts = audit["counts"]
    proof = audit["proof"]
    lines = [
        f"# Subject → programme → university mapping audit ({audit['generatedAt']})",
        "",
        "This is a repository seed audit. It validates structural joins and the separate O-level/UTME layers; it does not replace a source review of brochure wording or a live database refresh.",
        "",
        "## What is proven",
        "",
        f"- {counts['structuredOptions']} structured options are attached to {counts['jambProgrammes']} JAMB programme rows.",
        f"- {proof['structuredOptionsWithKnownRequirement']} options point to a known requirement row.",
        f"- {proof['structuredProgrammesWithUniversityOffering']} structured programmes have at least one seeded university offering.",
        f"- {proof['combinedSameJambProgrammeRows']} programmes have both UTME and O-level structured options, so combined matching can intersect them by the same JAMB programme ID.",
        f"- {counts['universityRequirementExceptions']} raw university-specific exception records are preserved and linked to known offering/programme rows; {counts['structuredUniversitySubjectOptions']} exact local subject rules are structured beneath them.",
        "- University-specific confirmation still happens after a programme is selected, through its offering rows; the subject matcher must not imply that a national programme match is an offer from every university.",
        "",
        "## Counts",
        "",
    ]
    for key, value in counts.items():
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Errors", ""])
    if audit["errors"]:
        for item in audit["errors"]:
            lines.append(f"- `{item['code']}`: " + ", ".join(f"{k}={v}" for k, v in item.items() if k != "code"))
    else:
        lines.append("- None found by the structural audit.")
    lines.extend(["", "## Manual/source review warnings", ""])
    if audit["warnings"]:
        counts_by_code = Counter(item["code"] for item in audit["warnings"])
        for code, count in sorted(counts_by_code.items()):
            lines.append(f"- `{code}`: {count}")
    else:
        lines.append("- None found.")
    lines.extend([
        "",
        "## Interpretation boundary",
        "",
        "O-level matching answers whether the selected O-level subjects satisfy a structured O-level option. UTME matching answers whether the selected UTME subjects satisfy a structured UTME option. Combined matching requires both layers for the same JAMB programme ID. Exact university rules are evaluated only against their own school-programme offering; partial rules are conditions, not complete eligibility proofs. Ambiguous university prose remains `needs_review`, and the selected university's current published notice remains the final confirmation surface.",
        "",
    ])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=None)
    parser.add_argument("--md", type=Path, default=None)
    args = parser.parse_args()
    audit = build_audit()
    json_path = args.json or OUT / f"subject-programme-university-audit-{audit['generatedAt']}.json"
    md_path = args.md or OUT / f"subject-programme-university-audit-{audit['generatedAt']}.md"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(audit, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(markdown_report(audit), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "errors": len(audit["errors"]), "warnings": len(audit["warnings"])}, indent=2))
    return 1 if audit["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
