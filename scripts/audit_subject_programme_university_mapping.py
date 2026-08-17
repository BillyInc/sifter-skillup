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


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "manual-review"


def build_audit() -> dict[str, Any]:
    seed_text = SEED.read_text(encoding="utf-8")
    subject_rows = sql_rows(SUBJECTS.read_text(encoding="utf-8"), "subject_catalog")
    subject_codes = {str(row[0]) for row in subject_rows if len(row) >= 2}
    subject_names = {str(row[0]): str(row[1]) for row in subject_rows if len(row) >= 2}

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
        {"id": str(row[0]), "school_id": str(row[1]), "jamb_programme_id": str(row[2])}
        for row in offering_rows
    ]
    offerings_by_jamb: dict[str, list[dict[str, str]]] = defaultdict(list)
    for offering in offerings:
        offerings_by_jamb[offering["jamb_programme_id"]].append(offering)

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
    import re

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
        "O-level matching answers whether the selected O-level subjects satisfy a structured O-level option. UTME matching answers whether the selected UTME subjects satisfy a structured UTME option. Combined matching requires both layers for the same JAMB programme ID. None of those checks proves a university-specific admission decision; the selected university's offering and current published requirements remain the final confirmation surface.",
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
