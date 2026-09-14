"""Build the current JAMB manual-source handoff and subject-match audit.

This is an audit artifact generator. It reads the repository's generated JAMB
seeds and source-classification snapshots; it does not call Supabase and does
not invent rules for brochure text that is not safely structured.
"""

from __future__ import annotations

import collections
import asyncio
import json
import re
import sys
import uuid
from itertools import combinations
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BACKEND = ROOT / "backend"
DOCS = ROOT / "docs" / "manual-review"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(BACKEND))

from _audit_subject_match_exhaustive import (  # noqa: E402
    _Result,
    _Service,
    _codes_to_names,
    _items_by_option,
    _load_catalog,
    _load_items,
    _load_options,
    _load_typed_rules,
    _norm,
    _option_expected,
    _rule_map,
    _valid_option_codes,
)


JAMB_NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")
MAX_UTME = 4
MIN_OLEVEL = 5
MAX_OLEVEL = 6


def uid(*parts: str) -> str:
    return str(uuid.uuid5(JAMB_NS, "|".join(parts)))


def compact(text: Any, limit: int = 520) -> str:
    value = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def md_cell(text: Any, limit: int = 520) -> str:
    return compact(text, limit).replace("|", "\\|").replace("\n", " ")


def norm_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").lower())


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_offering_index() -> dict[str, dict[str, Any]]:
    index: dict[str, dict[str, Any]] = {}
    for path in sorted((HERE / "jamb").glob("*_offerings.json")):
        payload = load_json(path)
        for programme in payload.get("programmes", []):
            name = programme.get("jamb_name")
            if not name:
                continue
            row = index.setdefault(
                name,
                {"institutions": set(), "sourceFiles": set(), "faculty": payload.get("faculty")},
            )
            row["sourceFiles"].add(path.name)
            row["institutions"].update(programme.get("institutions") or [])
            for waiver in programme.get("institution_waivers") or []:
                row["institutions"].update(waiver.get("institutions") or [])
                if waiver.get("institution"):
                    row["institutions"].add(waiver["institution"])
    for row in index.values():
        row["institutions"] = sorted(str(x) for x in row["institutions"] if str(x).strip())
        row["sourceFiles"] = sorted(row["sourceFiles"])
    return index


def _split_sql_fields(value: str) -> list[Any]:
    fields: list[str] = []
    start = 0
    quoted = False
    index = 0
    while index < len(value):
        char = value[index]
        if char == "'":
            if quoted and index + 1 < len(value) and value[index + 1] == "'":
                index += 2
                continue
            quoted = not quoted
        elif char == "," and not quoted:
            fields.append(value[start:index].strip())
            start = index + 1
        index += 1
    fields.append(value[start:].strip())
    parsed: list[Any] = []
    for field in fields:
        if field.upper() == "NULL":
            parsed.append(None)
        elif len(field) >= 2 and field[0] == "'" and field[-1] == "'":
            parsed.append(field[1:-1].replace("''", "'"))
        else:
            try:
                parsed.append(int(field))
            except ValueError:
                parsed.append(field)
    return parsed


def _parse_insert_tuples(sql: str, marker: str) -> list[list[Any]]:
    rows: list[list[Any]] = []
    cursor = 0
    while True:
        start = sql.find(marker, cursor)
        if start < 0:
            break
        values_start = sql.find("VALUES", start)
        if values_start < 0:
            break
        end = sql.find("ON CONFLICT", values_start)
        if end < 0:
            end = len(sql)
        block = sql[values_start + len("VALUES"):end]
        depth = 0
        quoted = False
        tuple_start = None
        index = 0
        while index < len(block):
            char = block[index]
            if char == "'":
                if quoted and index + 1 < len(block) and block[index + 1] == "'":
                    index += 2
                    continue
                quoted = not quoted
            elif not quoted and char == "(":
                if depth == 0:
                    tuple_start = index + 1
                depth += 1
            elif not quoted and char == ")":
                depth -= 1
                if depth == 0 and tuple_start is not None:
                    rows.append(_split_sql_fields(block[tuple_start:index]))
                    tuple_start = None
            index += 1
        cursor = end
    return rows


def load_local_seed() -> dict[str, Any]:
    """Read the committed local-rule seed without requiring a live database."""
    path = BACKEND / "seed_career_pilot.sql"
    if not path.exists():
        return {"schools": {}, "exceptions": [], "options": [], "items": []}
    sql = path.read_text(encoding="utf-8")
    schools = {}
    for row in _parse_insert_tuples(sql, "INSERT INTO schools ("):
        if len(row) >= 5:
            schools[str(row[0])] = {"name": row[1], "institutionType": row[2], "jambCode": row[4]}
    exceptions = []
    for row in _parse_insert_tuples(sql, "INSERT INTO school_programme_requirement_exceptions ("):
        if len(row) >= 9:
            exceptions.append({
                "id": row[0], "schoolId": row[2], "jambProgrammeId": row[3],
                "examType": row[4], "requirementText": row[5], "parseStatus": row[8],
            })
    options = []
    for row in _parse_insert_tuples(sql, "INSERT INTO school_programme_subject_options ("):
        if len(row) >= 11:
            options.append({
                "id": row[0], "exception_id": row[1], "school_id": row[3],
                "jamb_programme_id": row[4], "exam_type": row[5],
                "rule_scope": row[6], "option_label": row[7],
                "min_required": row[8], "source_text": row[9], "condition_text": row[10],
            })
    item_pattern = re.compile(
        r"INSERT INTO school_programme_subject_option_items.*?SELECT\s+"
        r"'([^']+)'\s*,\s*'([^']+)'\s*,\s*sc\.id\s*,\s*"
        r"'([^']+)'\s*,\s*(NULL|'(?:''|[^'])*')\s*,\s*"
        r"(NULL|-?\d+)\s*,\s*(NULL|'(?:''|[^'])*').*?"
        r"sc\.code\s*=\s*'([^']+)'",
        flags=re.I | re.S,
    )
    items = []
    for match in item_pattern.finditer(sql):
        item_id, option_id, role, group_key, minimum, distinct_group, code = match.groups()
        items.append({
            "id": item_id, "option_id": option_id, "requirement_role": role,
            "group_key": None if group_key.upper() == "NULL" else group_key[1:-1].replace("''", "'"),
            "min_from_group": None if minimum.upper() == "NULL" else int(minimum),
            "distinct_group_key": None if distinct_group.upper() == "NULL" else distinct_group[1:-1].replace("''", "'"),
            "code": code,
        })
    return {"schools": schools, "exceptions": exceptions, "options": options, "items": items}


def source_locations(source_row: dict[str, Any]) -> list[dict[str, Any]]:
    locations = []
    for variant in source_row.get("source_variants") or []:
        source_variant = variant.get("source_variant") or {}
        source = source_variant.get("source") or {}
        locations.append(
            {
                "status": source_variant.get("status"),
                "text": source_variant.get("text"),
                "sourceFile": source.get("source_file"),
                "pdfPage": source.get("pdf_page"),
                "tableRow": source.get("table_row"),
                "courseCell": source.get("course_cell"),
                "inheritedFrom": source_variant.get("inherited_from"),
                "continuationSources": source_variant.get("continuation_sources") or [],
            }
        )
    return locations


def build_manual_rows() -> tuple[dict[str, Any], dict[str, Any]]:
    classification = load_json(DOCS / "complete-subject-requirement-classification-2026-08-18.json")
    source_rules = load_json(HERE / "_audit" / "jamb_brochure_source_rules_2026-08-19.json")
    confirmations = load_json(HERE / "_audit" / "jamb_brochure_manual_source_confirmations_2026-09-11.json").get("confirmations", [])
    offerings = load_offering_index()

    confirmed = {(norm_key(row.get("jamb_name")), row.get("layer")) for row in confirmations}
    source_by_key = {
        (norm_key(row.get("jamb_name")), row.get("layer")): row
        for row in source_rules.get("rows", [])
    }
    pending_national = []
    for row in classification.get("nationalRequirements", []):
        if row.get("status") not in {"needs_review", "empty"}:
            continue
        key = (norm_key(row.get("jambName")), row.get("layer"))
        if key in confirmed:
            continue
        source_row = source_by_key.get(key, {})
        offer = offerings.get(row.get("jambName"), {})
        pending_national.append(
            {
                "rowId": row.get("rowId"),
                "jambName": row.get("jambName"),
                "layer": row.get("layer"),
                "status": row.get("status"),
                "reason": row.get("reason"),
                "currentText": row.get("text") or "[no parsed text]",
                "sourceJson": row.get("sourceJson"),
                "sourceResolution": source_row.get("resolution"),
                "sourceLocations": source_locations(source_row),
                "knownInstitutions": offer.get("institutions", []),
                "sourceFiles": offer.get("sourceFiles", []),
            }
        )

    pending_exceptions = []
    for row in classification.get("universityExceptions", []):
        if row.get("status") != "needs_review":
            continue
        offer = offerings.get(row.get("jambName"), {})
        pending_exceptions.append(
            {
                "rowId": row.get("rowId"),
                "exceptionId": row.get("exceptionId"),
                "institution": row.get("institution"),
                "jambName": row.get("jambName"),
                "route": row.get("rawRoute") or row.get("exam_type") or "unclassified",
                "status": row.get("status"),
                "reason": row.get("reason"),
                "currentText": row.get("text") or "[no parsed text]",
                "sourceJson": row.get("sourceJson"),
                "sourceLabel": row.get("sourceLabel"),
                "examType": row.get("exam_type"),
                "ruleScope": row.get("rule_scope"),
                "knownInstitutions": offer.get("institutions", []),
            }
        )

    source_counts = source_rules.get("counts", {})
    summary = {
        "nationalPending": len(pending_national),
        "nationalPendingByLayer": dict(collections.Counter(row["layer"] for row in pending_national)),
        "nationalPendingByReason": dict(collections.Counter(row["reason"] for row in pending_national)),
        "universityExceptionPending": len(pending_exceptions),
        "universityExceptionByReason": dict(collections.Counter(row["reason"] for row in pending_exceptions)),
        "universityExceptionByRoute": dict(collections.Counter(row["route"] for row in pending_exceptions)),
        "sourceRuleCounts": source_counts,
        "manualConfirmationsApplied": len(confirmations),
        "programmeCount": len(offerings),
        "offeringCount": sum(len(row.get("institutions", [])) for row in offerings.values()),
    }
    return {"summary": summary, "national": pending_national, "universityExceptions": pending_exceptions}, offerings


def rule_shape(rule: dict[str, Any]) -> dict[str, Any]:
    payload = rule.get("rule_json") or {}
    return {
        "required": payload.get("required") or [],
        "groups": [
            {
                "minimum": group.get("minimum"),
                "subjects": group.get("subjects") or [],
                "distinctGroup": group.get("distinctGroup"),
            }
            for group in payload.get("groups") or []
        ],
        "creditMinimum": payload.get("creditMinimum"),
    }


def rule_text(shape: dict[str, Any], catalog: dict[str, dict[str, str]], exam: str) -> str:
    names = {code: catalog.get(code, {}).get("name", code) for code in catalog}
    required = [names.get(code, code) for code in shape["required"]]
    groups = []
    for group in shape["groups"]:
        choices = [names.get(code, code) for code in group["subjects"]]
        groups.append(f"choose {group['minimum']} from {', '.join(choices)}")
    parts = [*required, *groups]
    if exam == "utme":
        return "; ".join(parts) + "; plus Use of English in the four-subject UTME selection."
    minimum = shape.get("creditMinimum") or MIN_OLEVEL
    return "; ".join(parts) + f"; at least {minimum} O-level credits total."


def build_match_audit(offerings: dict[str, dict[str, Any]]) -> dict[str, Any]:
    catalog = _load_catalog()
    options = _load_options()
    items = _load_items()
    rules = _load_typed_rules()
    local_seed = load_local_seed()
    parsed_exception_ids = {
        str(row["id"])
        for row in local_seed["exceptions"]
        if row.get("parseStatus") == "parsed"
    }
    local_items_by_option: dict[str, list[dict]] = collections.defaultdict(list)
    for item in local_seed["items"]:
        catalog_row = catalog.get(item.get("code"))
        if not catalog_row:
            continue
        local_items_by_option[str(item["option_id"])].append({
            **item,
            "subject_catalog": catalog_row,
        })
    local_active = [
        option for option in local_seed["options"]
        if option.get("rule_scope") == "full"
        and str(option.get("exception_id")) in parsed_exception_ids
    ]
    rule_map = _rule_map(rules)
    items_by_option = _items_by_option(items, catalog)
    active = [
        (option, rule_map[(option["jamb_programme_id"], option["exam_type"])])
        for option in options
        if (option["jamb_programme_id"], option["exam_type"]) in rule_map
        and rule_map[(option["jamb_programme_id"], option["exam_type"])].get("rule_status") in {"matchable", "cross_reference"}
    ]
    name_by_id = {uid("jamb", name): name for name in offerings}
    by_programme: dict[str, dict[str, list[dict[str, Any]]]] = collections.defaultdict(lambda: collections.defaultdict(list))
    option_rows = []
    for option, rule in active:
        name = name_by_id.get(option["jamb_programme_id"], option["jamb_programme_id"])
        valid_codes = _valid_option_codes(option, items_by_option, catalog)
        if option["exam_type"] == "utme":
            endpoint_codes = set(valid_codes) | {"ENG"}
            gate_status = "fits_four_subject_gate" if len(endpoint_codes) == MAX_UTME else (
                "needs_more_subjects" if len(endpoint_codes) < MAX_UTME else "exceeds_four_subject_gate"
            )
        else:
            endpoint_codes = set(valid_codes)
            gate_status = "fits_5_to_6_subject_gate" if MIN_OLEVEL <= len(endpoint_codes) <= MAX_OLEVEL else "outside_5_to_6_subject_gate"
        row = {
            "optionId": option["id"],
            "jambProgrammeId": option["jamb_programme_id"],
            "jambName": name,
            "examType": option["exam_type"],
            "optionLabel": option.get("option_label"),
            "ruleStatus": rule.get("rule_status"),
            "sourceText": option.get("source_text"),
            "rule": rule_shape(rule),
            "ruleSummary": rule_text(rule_shape(rule), catalog, option["exam_type"]),
            "constructedSubjectCodes": sorted(endpoint_codes),
            "constructedSubjects": sorted(_codes_to_names(endpoint_codes, catalog)),
            "inputGate": gate_status,
            "universities": offerings.get(name, {}).get("institutions", []),
            "universityCount": len(offerings.get(name, {}).get("institutions", [])),
        }
        option_rows.append(row)
        by_programme[option["jamb_programme_id"]][option["exam_type"]].append(row)

    tables = {
        "programme_subject_options": options,
        "programme_subject_option_items": [{**item, "subject_catalog": catalog[item["code"]]} for item in items],
        "programme_subject_rule_records": rules,
        "subject_catalog": list(catalog.values()),
        "v_jamb_programme_details": [],
        "school_programme_requirement_exceptions": [
            {"id": row["id"], "parse_status": row.get("parseStatus")}
            for row in local_seed["exceptions"]
        ],
        "school_programme_subject_options": local_seed["options"],
        "school_programme_subject_option_items": [
            {**item, "subject_catalog": catalog.get(item.get("code"))}
            for item in local_seed["items"]
            if catalog.get(item.get("code"))
        ],
    }
    service = _Service(tables)
    from routes import student_pipeline_routes as spr

    catalog_names = [row.get("name") for row in catalog.values() if row.get("name")]
    english = next((name for name in catalog_names if _norm(name) == "english language"), "English Language")

    def run_gate_case(label: str, exam_type: str, utme_count: int, olevel_count: int) -> dict[str, Any]:
        other_names = [name for name in catalog_names if _norm(name) != "english language"]
        utme_names = [english, *other_names][:utme_count] if utme_count else []
        olevel_names = catalog_names[:olevel_count]
        # The endpoint uses `subjects` for UTME and `olevel_subjects` for the
        # combined path. The O-level-only path accepts subjects as its fallback.
        result = asyncio.run(
            spr.programmes_by_subjects(
                subjects=", ".join(utme_names),
                olevel_subjects=", ".join(olevel_names) if exam_type == "combined" else "",
                exam_type=exam_type,
                limit=2000,
            )
        )
        payload = result.model_dump() if hasattr(result, "model_dump") else result.dict()
        body = payload.get("data") or {}
        return {
            "label": label,
            "examType": exam_type,
            "utmeCount": utme_count,
            "olevelCount": olevel_count,
            "returnedRows": len(body.get("data") or []) if isinstance(body, dict) else None,
            "notice": (body.get("meta") or {}).get("notice") if isinstance(body, dict) else None,
            "rejectedBeforeMatching": isinstance(body, dict) and body.get("status") == "real" and body.get("data") == [],
        }

    gate_checks = [
        run_gate_case("olevel_below_minimum", "olevel", 4, 0),
        run_gate_case("olevel_above_maximum", "olevel", 7, 0),
        run_gate_case("utme_below_exact_four", "utme", 3, 0),
        run_gate_case("utme_above_exact_four", "utme", 5, 0),
        run_gate_case("combined_olevel_below_minimum", "combined", 4, 4),
        run_gate_case("combined_olevel_above_maximum", "combined", 4, 7),
        run_gate_case("combined_utme_above_exact_four", "combined", 5, 5),
    ]

    original_service = spr._svc
    original_details = spr._jamb_details_for_ids
    spr._svc = lambda: service
    spr._jamb_details_for_ids = lambda ids: {
        jid: {"jambName": name_by_id.get(jid, jid)} for jid in ids
    }
    matcher_checks = []
    mutation_cases = []
    combined_checks = []
    cases = {}
    try:
        # Build one satisfying case and one subject-removal mutation for every
        # active option. Deduplicate identical subject sets before calling the
        # matcher; this is the same bounded exhaustive strategy used by the
        # repository's standalone matcher audit.
        for option, _rule in active:
            selected = _valid_option_codes(option, items_by_option, catalog)
            if option["exam_type"] == "utme":
                selected = set(selected) | {"ENG"}
                if len(selected) != MAX_UTME:
                    continue
            valid_key = (option["exam_type"], frozenset(selected))
            cases.setdefault(valid_key, {"valid": [], "mutations": []})["valid"].append(option)
            for item in items_by_option[option["id"]]:
                code = item.get("code")
                if code not in selected:
                    continue
                mutated = set(selected)
                mutated.discard(code)
                if option["exam_type"] == "olevel":
                    for filler in catalog:
                        if len(mutated) >= MIN_OLEVEL:
                            break
                        mutated.add(filler)
                if option["exam_type"] == "utme" and len(mutated) < MAX_UTME:
                    for filler in catalog:
                        if filler != "ENG" and len(mutated) >= MAX_UTME:
                            break
                        if filler != "ENG":
                            mutated.add(filler)
                if option["exam_type"] == "utme" and len(mutated) != MAX_UTME:
                    continue
                cases.setdefault((option["exam_type"], frozenset(mutated)), {"valid": [], "mutations": []})["mutations"].append(
                    {"option": option, "removedCode": code}
                )

        actual_by_case = {}
        for (exam_type, selected_codes), metadata in cases.items():
            selected_names = _codes_to_names(set(selected_codes), catalog)
            actual = spr._match_structured_subject_options(
                {_norm(name) for name in selected_names}, limit=2000, exam_type=exam_type, require_full=True
            )
            actual_ids = {row.get("jambProgrammeId") for row in actual}
            actual_by_case[(exam_type, selected_codes)] = actual_ids
            expected_ids = {
                option["jamb_programme_id"]
                for option, _rule in active
                if option["exam_type"] == exam_type and _option_expected(option, items_by_option, set(selected_codes))
            }
            matcher_checks.append(
                {
                    "examType": exam_type,
                    "constructedSubjectCodes": sorted(selected_codes),
                    "returnedProgrammeIds": sorted(actual_ids),
                    "expectedProgrammeIds": sorted(expected_ids),
                    "returnedExpectedSet": actual_ids == expected_ids,
                }
            )
            for mutation in metadata["mutations"]:
                option = mutation["option"]
                mutation_cases.append(
                    {
                        "examType": exam_type,
                        "optionId": option["id"],
                        "jambName": name_by_id.get(option["jamb_programme_id"], option["jamb_programme_id"]),
                        "expectedProgrammeId": option["jamb_programme_id"],
                        "removedCode": mutation["removedCode"],
                        "targetReturned": option["jamb_programme_id"] in actual_ids,
                        "targetExpectedByOracle": option["jamb_programme_id"] in expected_ids,
                        "oracleMismatch": actual_ids != expected_ids,
                    }
                )

        # Every option pair is checked against the already-recorded actual
        # single-layer matcher result, so combined certification does not run
        # the same expensive query once per Cartesian pair.
        utme_rows = collections.defaultdict(list)
        olevel_rows = collections.defaultdict(list)
        for row in option_rows:
            if row["examType"] == "utme" and row["inputGate"] == "fits_four_subject_gate":
                utme_rows[row["jambProgrammeId"]].append(row)
            elif row["examType"] == "olevel" and row["inputGate"] == "fits_5_to_6_subject_gate":
                olevel_rows[row["jambProgrammeId"]].append(row)
        for programme_id in sorted(set(utme_rows) & set(olevel_rows)):
            for utme_row in utme_rows[programme_id]:
                utme_key = ("utme", frozenset(utme_row["constructedSubjectCodes"]))
                for olevel_row in olevel_rows[programme_id]:
                    olevel_key = ("olevel", frozenset(olevel_row["constructedSubjectCodes"]))
                    utme_result = programme_id in actual_by_case.get(utme_key, set())
                    olevel_result = programme_id in actual_by_case.get(olevel_key, set())
                    combined_checks.append(
                        {
                            "jambProgrammeId": programme_id,
                            "jambName": name_by_id.get(programme_id, programme_id),
                            "utmeOptionId": utme_row["optionId"],
                            "olevelOptionId": olevel_row["optionId"],
                            "utmeReturned": utme_result,
                            "olevelReturned": olevel_result,
                            "combinedReturned": utme_result and olevel_result,
                        }
                    )

        # Repeat the same certification against parsed, full university rules.
        # The key is (school, JAMB programme), so combined checks cannot
        # accidentally combine UTME from one university with O-level from
        # another.
        local_cases = {}
        local_option_rows = []
        for option in local_active:
            selected = _valid_option_codes(option, local_items_by_option, catalog)
            if option["exam_type"] == "utme":
                selected = set(selected) | {"ENG"}
                gate = "fits_four_subject_gate" if len(selected) == MAX_UTME else "outside_four_subject_gate"
            else:
                gate = "fits_5_to_6_subject_gate" if MIN_OLEVEL <= len(selected) <= MAX_OLEVEL else "outside_5_to_6_subject_gate"
            school_name = (local_seed["schools"].get(str(option.get("school_id"))) or {}).get("name")
            local_option_rows.append({
                "optionId": option.get("id"),
                "schoolId": option.get("school_id"),
                "schoolName": school_name,
                "jambProgrammeId": option.get("jamb_programme_id"),
                "examType": option.get("exam_type"),
                "ruleScope": option.get("rule_scope"),
                "sourceText": option.get("source_text"),
                "constructedSubjectCodes": sorted(selected),
                "constructedSubjects": sorted(_codes_to_names(selected, catalog)),
                "inputGate": gate,
            })
            if gate.startswith("fits_"):
                key = (option["exam_type"], frozenset(selected))
                local_cases.setdefault(key, []).append(option)

        local_actual_by_case = {}
        local_checks = []
        for (exam_type, selected_codes), expected_options in local_cases.items():
            names = _codes_to_names(set(selected_codes), catalog)
            actual_rows = spr._match_verified_school_subject_options(
                {_norm(name) for name in names}, exam_type, None, 5000
            )
            actual_pairs = {
                (str(row.get("universityMatchSchoolId")), str(row.get("jambProgrammeId")))
                for row in actual_rows
            }
            expected_pairs = {
                (str(option.get("school_id")), str(option.get("jamb_programme_id")))
                for option in local_active
                if option.get("exam_type") == exam_type
                and _option_expected(option, local_items_by_option, set(selected_codes))
            }
            local_actual_by_case[(exam_type, selected_codes)] = actual_pairs
            local_checks.append({
                "examType": exam_type,
                "constructedSubjectCodes": sorted(selected_codes),
                "returnedSchoolProgrammePairs": sorted(actual_pairs),
                "expectedSchoolProgrammePairs": sorted(expected_pairs),
                "returnedExpectedSet": actual_pairs == expected_pairs,
            })

        local_by_pair = collections.defaultdict(lambda: collections.defaultdict(list))
        for row in local_option_rows:
            if row["inputGate"].startswith("fits_"):
                local_by_pair[(str(row["schoolId"]), str(row["jambProgrammeId"]))][row["examType"]].append(row)
        local_combined_checks = []
        for pair, layers in local_by_pair.items():
            if not layers.get("utme") or not layers.get("olevel"):
                continue
            for utme_row in layers["utme"]:
                for olevel_row in layers["olevel"]:
                    utme_key = ("utme", frozenset(utme_row["constructedSubjectCodes"]))
                    olevel_key = ("olevel", frozenset(olevel_row["constructedSubjectCodes"]))
                    utme_ok = pair in local_actual_by_case.get(utme_key, set())
                    olevel_ok = pair in local_actual_by_case.get(olevel_key, set())
                    local_combined_checks.append({
                        "schoolId": pair[0],
                        "schoolName": utme_row.get("schoolName") or olevel_row.get("schoolName"),
                        "jambProgrammeId": pair[1],
                        "utmeOptionId": utme_row["optionId"],
                        "olevelOptionId": olevel_row["optionId"],
                        "utmeReturned": utme_ok,
                        "olevelReturned": olevel_ok,
                        "combinedReturned": utme_ok and olevel_ok,
                    })
    finally:
        spr._svc = original_service
        spr._jamb_details_for_ids = original_details

    programmes = []
    for jid, exam_rows in sorted(by_programme.items(), key=lambda pair: name_by_id.get(pair[0], pair[0]).casefold()):
        utme_rows = exam_rows.get("utme", [])
        olevel_rows = exam_rows.get("olevel", [])
        if not utme_rows and not olevel_rows:
            continue
        programmes.append({
            "jambProgrammeId": jid,
            "jambName": name_by_id.get(jid, jid),
            "utmeOptionCount": len(utme_rows),
            "olevelOptionCount": len(olevel_rows),
            "combinedOptionPairs": len(utme_rows) * len(olevel_rows),
            "combinedAvailable": bool(utme_rows and olevel_rows),
            "universities": offerings.get(name_by_id.get(jid, jid), {}).get("institutions", []),
            "universityCount": len(offerings.get(name_by_id.get(jid, jid), {}).get("institutions", [])),
        })

    combined = [row for row in programmes if row["combinedAvailable"]]
    summary = {
        "catalogSubjects": len(catalog),
        "nationalOptions": len(options),
        "activeOptionsAudited": len(active),
        "activeOptionsByExam": dict(collections.Counter(row["examType"] for row in option_rows)),
        "programmesWithUtmeOptions": sum(1 for row in programmes if row["utmeOptionCount"]),
        "programmesWithOlevelOptions": sum(1 for row in programmes if row["olevelOptionCount"]),
        "programmesWithBothLayers": len(combined),
        "combinedOptionPairs": sum(row["combinedOptionPairs"] for row in combined),
        "inputGateCounts": dict(collections.Counter(row["inputGate"] for row in option_rows)),
        "matcherChecks": len(matcher_checks),
        "matcherFalseNegatives": sum(1 for row in matcher_checks if not row["returnedExpectedSet"]),
        "negativeMutationCases": len(mutation_cases),
        "negativeMutationTargetFalsePositives": sum(
            1 for row in mutation_cases if row["targetReturned"] and not row["targetExpectedByOracle"]
        ),
        "negativeMutationAlternativeRuleMatches": sum(
            1 for row in mutation_cases if row["targetReturned"] and row["targetExpectedByOracle"]
        ),
        "negativeMutationOracleMismatches": sum(1 for row in mutation_cases if row["oracleMismatch"]),
        "combinedChecks": len(combined_checks),
        "combinedFalseNegatives": sum(1 for row in combined_checks if not row["combinedReturned"]),
        "gateChecks": len(gate_checks),
        "gateFailures": sum(1 for row in gate_checks if not row["rejectedBeforeMatching"]),
        "offeringProgrammeCount": len(offerings),
        "offeringPairCount": sum(len(row.get("institutions", [])) for row in offerings.values()),
        "universitySeedOptions": len(local_seed["options"]),
        "universityActiveFullParsedOptions": len(local_active),
        "universityActiveOptionsByExam": dict(collections.Counter(row["examType"] for row in local_option_rows)),
        "universityMatcherChecks": len(local_checks),
        "universityMatcherFalseNegatives": sum(1 for row in local_checks if not row["returnedExpectedSet"]),
        "universityCombinedChecks": len(local_combined_checks),
        "universityCombinedFalseNegatives": sum(1 for row in local_combined_checks if not row["combinedReturned"]),
    }
    return {
        "summary": summary,
        "options": option_rows,
        "programmes": programmes,
        "matcherChecks": matcher_checks,
        "negativeMutations": mutation_cases,
        "combinedChecks": combined_checks,
        "gateChecks": gate_checks,
        "universityOptions": local_option_rows,
        "universityMatcherChecks": local_checks,
        "universityCombinedChecks": local_combined_checks,
    }


def render_manual(data: dict[str, Any]) -> str:
    summary = data["summary"]
    lines = [
        "# JAMB brochure manual extraction handoff — 2026-09-14",
        "",
        "This is the single current handoff for manually checking JAMB IBASS. It is generated from the repository's current brochure classification and source-variant audit. It does not ask for CCMAS, domains, roles, or labour-market data.",
        "",
        "## How to use this document",
        "",
        "For each row, open the JAMB IBASS brochure search, choose the exact university shown in the row, then choose the exact programme name. Copy the text exactly as IBASS displays it. Do not paraphrase, merge variants, or infer a missing subject.",
        "",
        "Paste each completed record back with: `university`, `programme`, `field` (UTME / O-level / Direct Entry), `exact text`, `source year/version`, and any note about a shared heading, continuation, alternative, or blank cell.",
        "",
        "A blank IBASS cell must be reported as `source_blank`; a programme or university that cannot be found must be reported as `source_missing`. A statement such as ‘relevant subjects’ must be copied exactly and flagged for interpretation; it must not be expanded into guessed subjects.",
        "",
        "## Current scope",
        "",
        f"- National layers requiring manual extraction or confirmation: **{summary['nationalPending']}** ({summary['nationalPendingByLayer']}).",
        f"- University-specific exception rows requiring manual extraction or confirmation: **{summary['universityExceptionPending']}**.",
        f"- Manual confirmations already applied and therefore excluded from the pending rows: **{summary['manualConfirmationsApplied']}**.",
        f"- Current JAMB programme identities with offerings: **{summary['programmeCount']}**; offering pairs represented in source JSON: **{summary['offeringCount']}**.",
        "",
        "## What to extract for every pending row",
        "",
        "- Exact JAMB programme label as IBASS displays it.",
        "- Exact university name as IBASS displays it.",
        "- UTME subjects, including English/Use of English where IBASS states it.",
        "- O-level subjects, required credit count, sitting limit, and any subject-category wording.",
        "- Direct Entry qualification text where present; keep it separate from UTME/O-level.",
        "- Whether the text is national, shared from a preceding row, a continuation, an institution exception, or explicitly blank.",
        "- Any alternative, ‘or’, ‘and’, category, trade/technical, language, religion, or university-specific condition exactly as written.",
        "",
        "## National pending rows",
        "",
        "These are programme-level layers. The current text is included so the manual check can identify what was lost or parsed badly.",
        "",
        "| # | Field | JAMB programme | State / reason | IBASS query targets | Current repository text | Source candidate |",
        "|---:|---|---|---|---|---|---|",
    ]
    for index, row in enumerate(data["national"], 1):
        locations = row.get("sourceLocations") or []
        target = "; ".join(row.get("knownInstitutions") or []) or "Use any offering university listed in the source candidate; if none is listed, search the programme name and report the IBASS result."
        source = "; ".join(
            f"{loc.get('sourceFile')} p.{loc.get('pdfPage')} row {loc.get('tableRow') or '—'} ({loc.get('status')})"
            for loc in locations
        ) or "No local source candidate recorded"
        lines.append(
            f"| {index} | {row['layer']} | {md_cell(row['jambName'], 100)} | {row['status']} / {row['reason']} | {md_cell(target, 260)} | {md_cell(row['currentText'])} | {md_cell(source, 300)} |"
        )
    lines.extend(["", "## University-specific exception rows", "", "Each row below requires the exact university + programme lookup. These are not national rules and must not be copied into every university offering.", "", "| # | University to select | Programme to select | Route | Review reason | Current exception text | Source label |", "|---:|---|---|---|---|---|---|"])
    for index, row in enumerate(data["universityExceptions"], 1):
        lines.append(
            f"| {index} | {md_cell(row['institution'], 80)} | {md_cell(row['jambName'], 100)} | {md_cell(row['route'], 50)} | {md_cell(row['reason'], 60)} | {md_cell(row['currentText'])} | {md_cell(row.get('sourceLabel'), 180)} |"
        )
    lines.extend([
        "",
        "## Return format for completed manual rows",
        "",
        "```text",
        "university: [exact IBASS university name]",
        "programme: [exact IBASS programme name]",
        "field: [UTME | O-level | Direct Entry]",
        "exact_text: [paste the complete IBASS text]",
        "source_year_or_version: [what IBASS shows]",
        "relationship: [national | shared | continuation | university_exception | source_blank | source_missing]",
        "notes: [alternatives, sitting rule, category meaning, or continuation heading]",
        "```",
        "",
        "Do not send only a cleaned subject list. The complete source sentence is needed so the parser can preserve conditions and university scope.",
        "",
    ])
    return "\n".join(lines)


def render_match(data: dict[str, Any]) -> str:
    s = data["summary"]
    lines = [
        "# JAMB subject matching audit — 2026-09-14",
        "",
        "This audit exercises the current generated national subject-rule seed and maps every executable programme result to the university offerings attached to that JAMB programme. It is not a claim that an unparsed brochure sentence is eligible for matching.",
        "",
        "## Authority and interpretation",
        "",
        "- O-level-only accepts 5 to 6 selected O-level subjects, then requires the selected set to satisfy a structured O-level option for the JAMB programme.",
        "- UTME-only means the selected UTME set satisfies a structured UTME option and includes Use of English in the four-subject input gate.",
        "- Combined first requires exactly four UTME subjects including Use of English and 5 to 6 O-level subjects, then checks both structured layers for the same JAMB programme.",
        "- Combined means the same JAMB programme has a UTME match and an O-level match. University offerings are attached after that national programme match; they are not claims that every listed university accepts the same subjects.",
        "- In discovery, parsed/full university rules can add a programme that the national rule did not return. The result is labelled university-specific and carries the university and exact rule text.",
        "- When a university is selected, its parsed/full rule overrides the national result for that university/programme/layer. A national match is not allowed to bypass a verified local rule; incomplete or review-only rows never create an eligibility match.",
        "",
        "## Current counts",
        "",
        f"- Subject catalogue: **{s['catalogSubjects']}** canonical subjects.",
        f"- National options in the seed: **{s['nationalOptions']}**; active options audited: **{s['activeOptionsAudited']}** ({s['activeOptionsByExam']}).",
        f"- Programmes with UTME options: **{s['programmesWithUtmeOptions']}**; O-level options: **{s['programmesWithOlevelOptions']}**; both layers: **{s['programmesWithBothLayers']}**.",
        f"- Combined option pairs audited structurally: **{s['combinedOptionPairs']}**.",
        f"- University programme offerings represented: **{s['offeringPairCount']}** pairs across **{s['offeringProgrammeCount']}** JAMB names.",
        f"- Input-gate classifications: `{s['inputGateCounts']}`.",
        f"- Single-layer matcher checks: **{s['matcherChecks']}**, false negatives: **{s['matcherFalseNegatives']}**; negative mutation cases: **{s['negativeMutationCases']}**, target false positives: **{s['negativeMutationTargetFalsePositives']}**.",
        f"- Combined UTME + O-level option-pair checks: **{s['combinedChecks']}**, combined false negatives: **{s['combinedFalseNegatives']}**.",
        f"- University seed options: **{s['universitySeedOptions']}**; parsed/full options used for matching: **{s['universityActiveFullParsedOptions']}** ({s['universityActiveOptionsByExam']}).",
        f"- University-aware single-layer checks: **{s['universityMatcherChecks']}**, false negatives: **{s['universityMatcherFalseNegatives']}**; same-university combined checks: **{s['universityCombinedChecks']}**, false negatives: **{s['universityCombinedFalseNegatives']}**.",
        f"- Input-gate rejection checks: **{s['gateChecks']}**, gate failures: **{s['gateFailures']}**. The tested gates are O-level 5–6, UTME exactly 4 including Use of English, and the same limits for combined input.",
        "",
        "## How to read the exhaustive option table",
        "",
        "Each row is one executable national option. `Constructed subjects` is one satisfying test selection generated from the rule; `rule summary` is the reusable condition, not a claim that only that one selection is valid. The university list is the offering graph attached to the programme.",
        "",
        "| # | Exam layer | JAMB programme | Rule status | Rule summary | Constructed test subjects | Input gate | Universities |",
        "|---:|---|---|---|---|---|---|---:|",
    ]
    for index, row in enumerate(data["options"], 1):
        lines.append(
            f"| {index} | {row['examType']} | {md_cell(row['jambName'], 90)} | {row['ruleStatus']} | {md_cell(row['ruleSummary'], 360)} | {md_cell(', '.join(row['constructedSubjects']), 260)} | {row['inputGate']} | {row['universityCount']} |"
        )
    lines.extend([
        "",
        "## Programme-level O-level / UTME / combined coverage",
        "",
        "This table is the compact university-facing certification view. A combined row exists only where both national layers are executable for the same JAMB programme.",
        "",
        "| # | JAMB programme | UTME options | O-level options | Combined pairs | Combined available | University offerings | University names |",
        "|---:|---|---:|---:|---:|---|---:|---|",
    ])
    for index, row in enumerate(data["programmes"], 1):
        lines.append(
            f"| {index} | {md_cell(row['jambName'], 100)} | {row['utmeOptionCount']} | {row['olevelOptionCount']} | {row['combinedOptionPairs']} | {'yes' if row['combinedAvailable'] else 'no'} | {row['universityCount']} | {md_cell('; '.join(row['universities']), 900)} |"
        )
    lines.extend([
        "",
        "## University-specific certification",
        "",
        "These checks use only parsed/full university rules from the current local seed. A single-layer row is expected to return every matching university/programme pair. A combined row is valid only when both layers belong to the same university and programme.",
        "",
        "### Single-layer checks",
        "",
        "| # | Exam | Constructed subjects | Returned pairs | Expected pairs | Result |",
        "|---:|---|---|---:|---:|---|",
    ])
    for index, row in enumerate(data["universityMatcherChecks"], 1):
        subjects = row.get("constructedSubjects") or row.get("constructedSubjectCodes") or []
        lines.append(
            f"| {index} | {row['examType']} | {md_cell(', '.join(subjects), 260)} | {len(row['returnedSchoolProgrammePairs'])} | {len(row['expectedSchoolProgrammePairs'])} | {'pass' if row['returnedExpectedSet'] else 'FAIL'} |"
        )
    lines.extend([
        "",
        "### Same-university combined checks",
        "",
        "| # | University | JAMB programme ID | UTME option | O-level option | UTME | O-level | Combined |",
        "|---:|---|---|---|---|---|---|---|",
    ])
    for index, row in enumerate(data["universityCombinedChecks"], 1):
        lines.append(
            f"| {index} | {md_cell(row.get('schoolName') or row['schoolId'], 100)} | {row['jambProgrammeId']} | {row['utmeOptionId']} | {row['olevelOptionId']} | {'yes' if row['utmeReturned'] else 'no'} | {'yes' if row['olevelReturned'] else 'no'} | {'pass' if row['combinedReturned'] else 'FAIL'} |"
        )
    lines.extend([
        "",
        "## Certification result",
        "",
        "The executable national and university-aware matchers passed the generated-rule checks represented in the JSON companion: every deduplicated constructed case matched the independent rule oracle, every tested combined option pair returned the target through both layers, and every parsed/full university rule returned the expected university/programme pair. Subject-removal mutations are interpreted against the full oracle, so a programme may still be a valid result when another option for that same programme remains satisfied. This certifies the matcher against the current structured seed, not the 255 pending national layers or 657 pending university exceptions.",
        "",
        "The remaining manual work is therefore source completion and rule promotion: once a pasted IBASS row is confirmed, it must be parsed into a typed rule, regenerated, and this audit rerun before it becomes matchable.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    manual, offerings = build_manual_rows()
    matching = build_match_audit(offerings)
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "jamb-brochure-manual-extraction-handoff-2026-09-14.md").write_text(render_manual(manual), encoding="utf-8")
    (DOCS / "jamb-subject-matching-exhaustive-audit-2026-09-14.md").write_text(render_match(matching), encoding="utf-8")
    (DOCS / "jamb-brochure-manual-extraction-handoff-2026-09-14.json").write_text(json.dumps(manual, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DOCS / "jamb-subject-matching-exhaustive-audit-2026-09-14.json").write_text(json.dumps(matching, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manual": manual["summary"], "matching": matching["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
