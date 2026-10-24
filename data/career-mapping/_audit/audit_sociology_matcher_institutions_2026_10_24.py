"""Audit Sociology O'level/UTME matching across its exact JAMB awarders.

This local audit regenerates the current career seed in memory through the
canonical generator, then verifies the generated source rows and applies the
same university-specific rule evaluator used by the student API. It does not
connect to or write to Supabase.
"""

from __future__ import annotations

import contextlib
import io
import json
import re
import runpy
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
BACKEND = ROOT / "backend"
sys.path.insert(0, str(CAREER))
sys.path.insert(0, str(BACKEND))

from _gen_subject_rule_records import (  # noqa: E402
    load_programmes,
    resolve_contextual_rules,
    source_rule_with_variants,
)
from _parse_subject_options import (  # noqa: E402
    SOURCE_RULES_PATH,
    parse_olevel,
    parse_utme,
    source_variant_texts,
)
from routes.student_pipeline_routes import (  # noqa: E402
    _evaluate_school_subject_option,
    _normalise_subject,
)


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _exact_sociology(path: Path) -> dict:
    document = _read_json(path)
    return next(
        row for row in document["programmes"]
        if row.get("jamb_name") == "Sociology"
    )


def _catalogue() -> dict[str, str]:
    text = (BACKEND / "seed_subject_catalog.sql").read_text(encoding="utf-8")
    return {
        match.group(1): match.group(2).replace("''", "'")
        for match in re.finditer(
            r"^\('([A-Z0-9_]+)'\s*,\s*'((?:''|[^'])*)'\s*,", text, re.M
        )
    }


def _candidate_for_option(option: tuple, item_rows: list[tuple], catalog: dict[str, str]):
    option_id = str(option[0])
    items = [row for row in item_rows if str(row[1]) == option_id]
    selected_codes = {str(row[2]) for row in items if row[3] == "required"}
    groups: dict[str, list[tuple]] = {}
    for row in items:
        if row[3] == "one_of" and row[4]:
            groups.setdefault(str(row[4]), []).append(row)
    for group in groups.values():
        selected_codes.update(row[2] for row in group[: int(group[0][5] or 1)])

    pass_codes = set(json.loads(option[11] or "[]"))
    selected_codes.update(pass_codes)
    for code in catalog:
        if len(selected_codes - pass_codes) >= int(option[8] or 0):
            break
        selected_codes.add(code)

    selected_names = {catalog[code] for code in selected_codes}
    normalized = {_normalise_subject(name) for name in selected_names}
    evaluator_items = [
        {
            "requirement_role": row[3],
            "group_key": row[4],
            "min_from_group": row[5],
            "distinct_group_key": row[6],
            "subject_catalog": {"code": row[2], "name": catalog[row[2]]},
        }
        for row in items
    ]
    result = _evaluate_school_subject_option(
        {
            "min_required": option[8],
            "exam_type": option[5],
            "pass_required_codes": list(pass_codes),
            "condition_text": option[10],
        },
        evaluator_items,
        normalized,
    )
    return selected_names, normalized, evaluator_items, result


def main() -> int:
    social = _exact_sociology(CAREER / "jamb" / "social_management_offerings.json")
    arts = _exact_sociology(CAREER / "jamb" / "arts_hum_offerings.json")
    social_codes = set(social["institutions"])
    arts_codes = set(arts["institutions"])
    all_codes = social_codes | arts_codes
    if len(social_codes) != 94 or len(arts_codes) != 5 or len(all_codes) != 98:
        raise AssertionError("The two exact Sociology brochure rosters no longer total 98 unique awarders")

    programmes = load_programmes()
    sociology = programmes["Sociology"]
    source_report = _read_json(Path(SOURCE_RULES_PATH))
    contextual = resolve_contextual_rules(programmes)["Sociology"]
    typed_rules = {
        layer: source_rule_with_variants(
            sociology.get("utme_subjects" if layer == "utme" else "olevel_requirement"),
            layer,
            contextual.get(layer),
            source_variant_texts(source_report, "Sociology", layer),
        )
        for layer in ("olevel", "utme")
    }
    if any(rule["rule_status"] != "matchable" for rule in typed_rules.values()):
        raise AssertionError({layer: rule["rule_status"] for layer, rule in typed_rules.items()})
    if typed_rules["olevel"]["rule_json"].get("passRequiredCodes") != ["MATH"]:
        raise AssertionError("National O'level Mathematics pass condition is not represented separately")
    if parse_olevel(sociology["olevel_requirement"]) is None:
        raise AssertionError("National Sociology O'level combination did not parse")
    utme_parts = parse_utme(sociology["utme_subjects"])
    if not utme_parts or sum(part[1] for part in utme_parts if part[0] == "one_of") != 3:
        raise AssertionError("National Sociology UTME rule must require three Arts/Social Science subjects")

    # Running the generator here materializes the exact rows that are written
    # to seed_career_pilot.sql; stdout is captured so only this audit is shown.
    with contextlib.redirect_stdout(io.StringIO()):
        generated = runpy.run_path(str(CAREER / "_gen_seed.py"))
    rows = generated["rows"]
    uid = generated["uid"]
    sociology_id = uid("jamb", "Sociology")
    offerings = [row for row in rows["school_programmes"] if row[2] == sociology_id]
    codes_by_school_id = {school_id: code for code, school_id in rows["schools"].items()}
    offering_codes = {codes_by_school_id[row[1]] for row in offerings}
    if offering_codes != all_codes:
        raise AssertionError(
            {
                "missing_offerings": sorted(all_codes - offering_codes),
                "unexpected_offerings": sorted(offering_codes - all_codes),
            }
        )

    options = [
        row for row in rows["school_programme_subject_options"]
        if row[4] == sociology_id and row[6] == "full"
    ]
    school_id_to_code = codes_by_school_id
    items = rows["school_programme_subject_option_items"]
    catalog = _catalogue()
    if not catalog or catalog.get("ENG") != "English Language" or catalog.get("MATH") != "Mathematics":
        raise AssertionError("Subject catalogue lacks expected English/Mathematics identities")

    # Exercise each full, university-specific Sociology rule with the smallest
    # concrete satisfying set the rule declares.
    local_results = []
    for option in options:
        _names, _normalized, _items, result = _candidate_for_option(option, items, catalog)
        if not result["passes"]:
            school_code = school_id_to_code.get(option[3], str(option[3]))
            raise AssertionError(f"University rule failed its own satisfying selection: {school_code}/{option[5]}: {result}")
        local_results.append({
            "institution": school_id_to_code.get(option[3], str(option[3])),
            "exam": option[5],
            "credit_minimum": option[8],
            "pass_required_codes": json.loads(option[11] or "[]"),
        })

    plas_u = [
        option for option in options
        if school_id_to_code.get(option[3]) == "PLASU"
        and option[5] == "olevel"
        and "MATH" in json.loads(option[11] or "[]")
    ]
    if len(plas_u) != 1:
        raise AssertionError("PLASU Sociology O'level pass-only Mathematics rule is missing or duplicated")
    plas_u = plas_u[0]
    _names, selected_norm, evaluator_items, plas_u_result = _candidate_for_option(plas_u, items, catalog)
    if not plas_u_result["gradeVerificationRequired"]:
        raise AssertionError("PLASU should ask the learner to verify the Mathematics grade")
    without_math = set(selected_norm) - {_normalise_subject(catalog["MATH"])}
    without_math_result = _evaluate_school_subject_option(
        {
            "min_required": plas_u[8],
            "exam_type": plas_u[5],
            "pass_required_codes": ["MATH"],
            "condition_text": plas_u[10],
        },
        evaluator_items,
        without_math,
    )
    if without_math_result["passes"]:
        raise AssertionError("PLASU must not match when Mathematics is absent")

    evidence = _read_json(CAREER / "_audit" / "programme_domain_evidence_2026-08-17.json")
    d078 = evidence.get("Social Sciences::Sociology::D078")
    if not d078 or d078.get("domain_id") != "D078" or d078.get("match_type") != "direct":
        raise AssertionError("The exact Sociology programme is not directly linked to D078 in the local reviewed evidence")

    report = {
        "audit_date": "2026-10-24",
        "status": "passed",
        "scope": "Local generated/source records only; no live Supabase claim.",
        "exact_sociology_rosters": {
            "social_sciences_brochure_count": len(social_codes),
            "arts_humanities_brochure_count": len(arts_codes),
            "overlap_count": len(social_codes & arts_codes),
            "unique_institution_count": len(all_codes),
            "institution_codes": sorted(all_codes),
            "generated_offering_count": len(offerings),
            "generated_offerings_equal_exact_rosters": offering_codes == all_codes,
            "excluded_cross_reference_only_institution": "IGBINEDION",
        },
        "national_matcher": {
            "olevel_status": typed_rules["olevel"]["rule_status"],
            "olevel_credit_minimum": typed_rules["olevel"]["rule_json"].get("creditMinimum"),
            "olevel_pass_only_codes": typed_rules["olevel"]["rule_json"].get("passRequiredCodes"),
            "utme_status": typed_rules["utme"]["rule_status"],
            "utme_three_subject_pool_codes": utme_parts[0][2],
            "local_option_rule_examples_checked": len(local_results),
            "local_option_rules": local_results,
        },
        "PLASU_grade_condition": {
            "mathematics_subject_is_required": True,
            "absence_is_rejected": not without_math_result["passes"],
            "grade_is_not_inferred_from_subject_selection": plas_u_result["gradeVerificationRequired"],
        },
        "programme_domain": {
            "programme_key": d078["programme_key"],
            "domain_id": d078["domain_id"],
            "match_type": d078["match_type"],
            "course_anchor_count": d078["course_anchor_count"],
        },
        "source_urls": [
            "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
            "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
            "https://eligibility.jamb.gov.ng/",
        ],
    }
    target = CAREER / "_audit" / "SOCIOLOGY_MATCHER_INSTITUTION_AUDIT_2026_10_24.json"
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": report["status"],
        "exact_institution_count": len(all_codes),
        "generated_offerings": len(offerings),
        "national_rule_statuses": {layer: rule["rule_status"] for layer, rule in typed_rules.items()},
        "utme_pool_count": len(utme_parts[0][2]),
        "university_specific_full_rules_checked": len(local_results),
        "PLASU_pass_rule": "subject required; grade confirmation remains explicit",
        "sociology_domain": "D078 direct",
        "report": str(target.relative_to(ROOT)),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
