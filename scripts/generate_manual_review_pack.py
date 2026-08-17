"""Generate the 100-case admission and guidance manual-review pack.

The pack is intentionally generated from the repository's current data outputs.
It is a review fixture, not a replacement for the live database.  Every case
keeps the source IDs and requirement text needed to compare the platform with
the current seed and to spot missing or stale live rows.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "manual-review"
SEED = ROOT / "backend" / "seed_career_pilot.sql"
OPTIONS = ROOT / "backend" / "seed_subject_options.sql"
SUBJECTS = ROOT / "backend" / "seed_subject_catalog.sql"
CAREER = ROOT / "data" / "career-mapping"


def statement_body(text: str, start: int) -> str:
    """Return an SQL statement body, respecting quoted semicolons."""

    quoted = False
    i = start
    while i < len(text):
        char = text[i]
        if quoted:
            if char == "'":
                if i + 1 < len(text) and text[i + 1] == "'":
                    i += 2
                    continue
                quoted = False
        elif char == "'":
            quoted = True
        elif char == ";":
            return text[start:i]
        i += 1
    return text[start:]


def split_tuple(inner: str) -> list[str]:
    values: list[str] = []
    buffer: list[str] = []
    quoted = False
    depth = 0
    i = 0
    while i < len(inner):
        char = inner[i]
        if quoted:
            buffer.append(char)
            if char == "'":
                if i + 1 < len(inner) and inner[i + 1] == "'":
                    buffer.append(inner[i + 1])
                    i += 1
                else:
                    quoted = False
        elif char == "'":
            quoted = True
            buffer.append(char)
        elif char == "(":
            depth += 1
            buffer.append(char)
        elif char == ")":
            depth -= 1
            buffer.append(char)
        elif char == "," and depth == 0:
            values.append("".join(buffer).strip())
            buffer = []
        else:
            buffer.append(char)
        i += 1
    values.append("".join(buffer).strip())
    return values


def sql_value(raw: str) -> Any:
    value = raw.strip()
    value = re.sub(r"::jsonb\s*$", "", value, flags=re.IGNORECASE).strip()
    if value.upper() == "NULL":
        return None
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1].replace("''", "'")
    return value


def sql_rows(text: str, table: str) -> list[list[Any]]:
    pattern = re.compile(
        rf"INSERT INTO (?:skillup_dev\.)?{re.escape(table)}\s*\([^;]*?\)\s+VALUES",
        re.IGNORECASE | re.DOTALL,
    )
    rows: list[list[Any]] = []
    for match in pattern.finditer(text):
        body = statement_body(text, match.end())
        i = 0
        while i < len(body):
            if body[i] != "(":
                i += 1
                continue
            start = i
            i += 1
            depth = 1
            quoted = False
            while i < len(body) and depth:
                char = body[i]
                if quoted:
                    if char == "'":
                        if i + 1 < len(body) and body[i + 1] == "'":
                            i += 2
                            continue
                        quoted = False
                    i += 1
                    continue
                if char == "'":
                    quoted = True
                elif char == "(":
                    depth += 1
                elif char == ")":
                    depth -= 1
                i += 1
            if depth:
                break
            rows.append([sql_value(v) for v in split_tuple(body[start + 1 : i - 1])])
    return rows


def dedupe(rows: list[list[Any]], key_index: int) -> list[list[Any]]:
    seen: set[Any] = set()
    result: list[list[Any]] = []
    for row in rows:
        key = row[key_index]
        if key in seen:
            continue
        seen.add(key)
        result.append(row)
    return result


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def subject_catalog() -> dict[str, str]:
    rows = sql_rows(SUBJECTS.read_text(encoding="utf-8"), "subject_catalog")
    return {str(row[0]): str(row[1]) for row in rows if len(row) >= 2}


def structured_options() -> tuple[dict[str, list[dict[str, Any]]], dict[str, str]]:
    text = OPTIONS.read_text(encoding="utf-8")
    options: dict[str, list[dict[str, Any]]] = defaultdict(list)
    option_to_programme: dict[str, str] = {}
    option_pattern = re.compile(
        r"INSERT INTO programme_subject_options.*?SELECT\s+"
        r"'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*"
        r"'([^']*)',\s*(\d+),\s*'(.*)',\s*'(https?[^']*)'\s+WHERE",
        re.IGNORECASE,
    )
    for line in text.splitlines():
        match = option_pattern.search(line)
        if not match:
            continue
        option_id, jamb_id, requirement_id, exam_type, label, minimum, source_text, source_url = match.groups()
        option = {
            "id": option_id,
            "jamb_programme_id": jamb_id,
            "requirement_id": requirement_id,
            "exam_type": exam_type,
            "option_label": label,
            "min_required": int(minimum),
            "source_text": source_text.replace("''", "'"),
            "source_url": source_url,
            "items": [],
        }
        options[jamb_id].append(option)
        option_to_programme[option_id] = jamb_id

    item_pattern = re.compile(
        r"INSERT INTO programme_subject_option_items.*?SELECT\s+"
        r"'[^']+',\s*'([^']+)',\s*sc\.id,\s*'([^']+)'"
        r"(?:,\s*'([^']+)',\s*(\d+))?.*?WHERE sc\.code\s*=\s*'([^']+)'",
        re.IGNORECASE,
    )
    by_option = {option["id"]: option for values in options.values() for option in values}
    for line in text.splitlines():
        match = item_pattern.search(line)
        if not match:
            continue
        option_id, requirement_role, group_key, group_min, subject_code = match.groups()
        if option_id not in by_option:
            continue
        by_option[option_id]["items"].append(
            {
                "subject_code": subject_code,
                "requirement_role": requirement_role,
                "group_key": group_key,
                "min_from_group": int(group_min) if group_min else None,
            }
        )
    return dict(options), option_to_programme


def parse_data() -> dict[str, Any]:
    seed_text = SEED.read_text(encoding="utf-8")
    jamb_rows = dedupe(sql_rows(seed_text, "jamb_programmes"), 0)
    school_rows = dedupe(sql_rows(seed_text, "schools"), 0)
    offering_source_rows = [row for row in sql_rows(seed_text, "school_programmes") if len(row) >= 4]
    offering_rows = dedupe(offering_source_rows, 0)
    requirement_rows = dedupe(sql_rows(seed_text, "programme_subject_requirements"), 0)

    jamb = {
        row[0]: {
            "id": row[0],
            "jamb_name": row[1],
            "jamb_faculty": row[2],
            "degree_type": row[3],
            "skills_technical": json.loads(row[4]) if row[4] else [],
            "skills_transferable": json.loads(row[5]) if row[5] else [],
            "is_blend": bool(row[7]),
        }
        for row in jamb_rows
        if len(row) >= 8
    }
    schools = {
        row[0]: {"id": row[0], "name": row[1], "institution_type": row[2], "jamb_code": row[4]}
        for row in school_rows
        if len(row) >= 5
    }
    school_by_code = {row["jamb_code"]: row for row in schools.values() if row.get("jamb_code")}
    school_offerings = {
        (row[1], row[2]): {"id": row[0], "school_id": row[1], "jamb_programme_id": row[2], "remarks": row[3]}
        for row in offering_rows
        if len(row) >= 4
    }
    requirements = {
        row[1]: {
            "id": row[0],
            "jamb_programme_id": row[1],
            "utme_subjects": row[2],
            "olevel_requirement": row[3],
            "direct_entry": row[4],
        }
        for row in requirement_rows
        if len(row) >= 5
    }
    parse_status: dict[str, str] = defaultdict(lambda: "unparsed")
    for match in re.finditer(
        r"UPDATE programme_subject_requirements SET parse_status='(parsed|needs_review)'.*?WHERE id = '([^']+)'",
        OPTIONS.read_text(encoding="utf-8"),
        re.IGNORECASE,
    ):
        parse_status[match.group(2)] = match.group(1)

    mappings = load_json(CAREER / "jamb_domain_map.json")
    structure = load_json(CAREER / "domain_structure.json")
    roles = load_json(CAREER / "role_library_v3_cleaned.json")
    role_by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for role in roles:
        role_by_domain[str(role.get("domain_id"))].append(role)
    options, _ = structured_options()

    source_offerings: dict[str, dict[str, Any]] = {}
    for path in sorted((CAREER / "jamb").glob("*_offerings.json")):
        payload = load_json(path)
        if not isinstance(payload, dict) or not isinstance(payload.get("programmes"), list):
            continue
        for item in payload["programmes"]:
            name = item.get("jamb_name")
            if not name or name in source_offerings:
                continue
            source_offerings[name] = {
                **item,
                "faculty_source_file": path.name,
            }

    records: list[dict[str, Any]] = []
    for jamb_id, row in jamb.items():
        name = row["jamb_name"]
        requirement = requirements.get(jamb_id)
        source = source_offerings.get(name, {})
        links = list(mappings.get(name, {}).get("links") or [])
        if not requirement or not links:
            continue
        institutions = list(source.get("institutions") or [])
        selected_school = None
        selected_offering = None
        for code in institutions:
            school = school_by_code.get(code)
            if not school:
                continue
            offering = school_offerings.get((school["id"], jamb_id))
            if offering:
                selected_school = school
                selected_offering = offering
                break
        if not selected_school:
            for (school_id, offering_jamb_id), offering in school_offerings.items():
                if offering_jamb_id == jamb_id and school_id in schools:
                    selected_school = schools[school_id]
                    selected_offering = offering
                    break
        if not selected_school:
            continue

        def link_rank(link: dict[str, Any]) -> tuple[int, str]:
            return ({"direct": 0, "functional": 1, "adjacent": 2}.get(link.get("match_type"), 9), str(link.get("domain_name")))

        domain_links = sorted(links, key=link_rank)
        selected_domain = domain_links[0]
        domain_id = selected_domain.get("domain_id")
        domain_info = structure.get(domain_id) or {}
        subgroups = sorted(domain_info.get("subgroups") or [], key=lambda item: item.get("display_order", 999))
        selected_subgroup = subgroups[0] if subgroups else None
        domain_roles = role_by_domain.get(domain_id, [])
        selected_role = None
        if selected_subgroup:
            prefix = str(selected_subgroup.get("isco_submajor") or "")
            selected_role = next(
                (role for role in domain_roles if str(role.get("isco_group", "")).startswith(prefix)),
                None,
            )
        if not selected_role and domain_roles:
            selected_role = domain_roles[0]

        records.append(
            {
                "jamb": row,
                "requirement": requirement,
                "requirement_parse_status": parse_status[requirement["id"]],
                "source_offering": source,
                "selected_school": selected_school,
                "selected_offering": selected_offering,
                "structured_options": options.get(jamb_id, []),
                "domain_links": domain_links,
                "selected_domain": selected_domain,
                "selected_subgroup": selected_subgroup,
                "selected_role": selected_role,
            }
        )
    return {
        "records": records,
        "subject_names": subject_catalog(),
        "source_counts": {
            "jamb_registry_rows": len(jamb),
            "school_registry_rows": len(schools),
            "school_offering_seed_rows": len(offering_source_rows),
            "unique_school_offering_pairs": len(school_offerings),
            "requirement_rows": len(requirements),
            "records_eligible_for_cases": len(records),
        },
    }


def unique(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value and value not in seen:
            result.append(value)
            seen.add(value)
    return result


def option_subjects(record: dict[str, Any], subject_names: dict[str, str]) -> list[str]:
    options = [item for item in record["structured_options"] if item.get("exam_type") == "utme" and item.get("items")]
    if not options:
        return []
    option = options[0]
    selected: list[str] = []
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in option["items"]:
        name = subject_names.get(item["subject_code"], item["subject_code"])
        if item["requirement_role"] == "required":
            selected.append(name)
        elif item["requirement_role"] == "one_of" and item.get("group_key"):
            grouped[item["group_key"]].append({**item, "name": name})
    for items in grouped.values():
        minimum = int(items[0].get("min_from_group") or 1)
        selected.extend(item["name"] for item in items[:minimum])
    selected = unique(selected)
    selected.insert(0, "Use of English")
    fillers = ["Mathematics", "Economics", "Government", "Geography", "Biology", "Chemistry", "Physics", "Literature in English"]
    for filler in fillers:
        if len(selected) >= 4:
            break
        if filler not in selected:
            selected.append(filler)
    return selected


def olevel_subjects(record: dict[str, Any], subject_names: dict[str, str], *, gap: bool = False) -> list[str]:
    text = (record["requirement"].get("olevel_requirement") or "").lower()
    candidates = [
        "English Language", "Mathematics", "Literature in English", "Economics",
        "Government", "Geography", "Biology", "Chemistry", "Physics",
        "Agricultural Science", "Principles of Accounts", "Commerce", "History",
        "Christian Religious Studies", "Islamic Religious Studies",
    ]
    chosen = [name for name in candidates if name.lower() in text]
    if "english" in text and "English Language" not in chosen:
        chosen.insert(0, "English Language")
    chosen = unique(chosen)
    if gap and len(chosen) > 1:
        chosen = chosen[1:]
    fillers = [name for name in subject_names.values() if name not in chosen]
    for filler in fillers:
        if len(chosen) >= 5:
            break
        chosen.append(filler)
    return unique(chosen[:8])


def expected_subject_variant(record: dict[str, Any], subject_names: dict[str, str], exam_type: str, variant: str) -> dict[str, Any]:
    utme = option_subjects(record, subject_names)
    if not utme:
        utme = ["Use of English", "Mathematics", "Economics", "Government"]
    olevel = olevel_subjects(record, subject_names, gap=variant in {"olevel-gap", "invalid"})
    if variant == "utme-gap" and len(utme) > 2:
        utme = utme[:-1]
    if exam_type == "olevel":
        return {"utme": [], "olevel": olevel, "expected": "possible text match or no match; never label as fully eligible without a parsed O-level rule"}
    if exam_type == "utme":
        return {"utme": utme, "olevel": [], "expected": "UTME matching only; O-level must not be silently treated as checked"}
    if variant in {"utme-gap", "invalid"}:
        return {"utme": utme, "olevel": olevel_subjects(record, subject_names), "expected": "not a full UTME match; any fallback must be marked possible/text-based"}
    if variant == "olevel-gap":
        return {"utme": utme, "olevel": olevel, "expected": "UTME match with an O-level gap or unparsed O-level state; never fully eligible"}
    return {"utme": utme, "olevel": olevel, "expected": "UTME and O-level state must be shown separately; eligibility only when both rules are satisfied"}


def structured_option_summary(record: dict[str, Any], subject_names: dict[str, str]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for option in record["structured_options"]:
        result.append(
            {
                "id": option["id"],
                "exam_type": option["exam_type"],
                "label": option["option_label"],
                "min_required": option["min_required"],
                "source_text": option["source_text"],
                "source_url": option["source_url"],
                "items": [
                    {
                        "subject": subject_names.get(item["subject_code"], item["subject_code"]),
                        "subject_code": item["subject_code"],
                        "requirement_role": item["requirement_role"],
                        "group_key": item.get("group_key"),
                        "min_from_group": item.get("min_from_group"),
                    }
                    for item in option["items"]
                ],
            }
        )
    return result


def spread(records: list[dict[str, Any]], count: int, offset: int) -> list[dict[str, Any]]:
    by_faculty: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in sorted(records, key=lambda item: (item["jamb"].get("jamb_faculty") or "", item["jamb"].get("jamb_name") or "")):
        by_faculty[record["jamb"].get("jamb_faculty") or "Unknown"].append(record)
    buckets = list(by_faculty.values())
    chosen: list[dict[str, Any]] = []
    cursor = offset
    while len(chosen) < count:
        bucket = buckets[cursor % len(buckets)]
        chosen.append(bucket[(cursor // len(buckets)) % len(bucket)])
        cursor += 1
    return chosen


def case_for(record: dict[str, Any], number: int, flow: str, index: int, subject_names: dict[str, str]) -> dict[str, Any]:
    if flow == "undergraduate":
        variant = "school-route"
        exam_type = "not_applicable"
    elif flow in {"ss1", "ss2", "school_owner"}:
        exam_type = "olevel" if index % 3 else "combined"
        variant = "olevel-gap" if index % 7 == 0 else "valid"
    else:
        exam_type = "utme" if flow == "jamb" and index % 3 == 0 else "combined"
        variant = "utme-gap" if index % 6 == 0 else ("olevel-gap" if index % 5 == 0 else "valid")

    subjects = expected_subject_variant(record, subject_names, exam_type, variant) if exam_type != "not_applicable" else {"utme": [], "olevel": [], "expected": "subject picker is not the entry route; verify the selected university's offering and detail"}
    student_type = {"ss1": "SS1", "ss2": "SS2", "ss3": "SS3", "jamb": "JAMB", "undergraduate": "Undergraduate", "school_owner": "SS2"}[flow]
    stream = {"ss1": "Science", "ss2": "Commercial", "ss3": "Art", "school_owner": "Commercial"}.get(flow)
    school = record["selected_school"]
    selected_domain = record["selected_domain"]
    subgroup = record["selected_subgroup"]
    role = record["selected_role"]
    jamb = record["jamb"]
    requirement = record["requirement"]
    links = [
        {"domain_id": link.get("domain_id"), "domain_name": link.get("domain_name"), "match_type": link.get("match_type"), "source": link.get("source"), "evidence_status": link.get("evidence_status")}
        for link in record["domain_links"]
    ]
    selected_path = {
        "domain": {"id": selected_domain.get("domain_id"), "name": selected_domain.get("domain_name"), "match_type": selected_domain.get("match_type")},
        "subgroup": {"label": subgroup.get("label"), "isco_submajor": subgroup.get("isco_submajor")} if subgroup else None,
        "role": {"name": role.get("role_name"), "esco_code": role.get("esco_code")} if role else None,
    }
    checks = [
        "Search result uses the exact JAMB name and does not show a CCMAS discipline label.",
        "Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.",
        "The selected university appears because a school-offering row links this school ID to this JAMB programme ID.",
        "University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.",
        "The selected mapping type, subgroup and role match the current mapping and role registry IDs.",
        "The report contains the selected path only and cannot print before programme, university and path are saved.",
    ]
    if flow == "school_owner":
        checks.extend([
            "Manual entry creates a draft first, then a real account and claim code only after final generation.",
            "The school owner sees the student context and never receives private progress merely because the account was created.",
        ])
    return {
        "case_id": f"MR-{number:03d}",
        "flow": flow,
        "student_type": student_type,
        "stream": stream,
        "variant": variant,
        "exam_type": exam_type,
        "entry_route": {
            "account_gate": "student" if flow != "school_owner" else "educator_institution",
            "admission_mode": "school_programme" if flow == "undergraduate" else ("subjects" if exam_type != "not_applicable" else "school_programme"),
            "admin_guidance": flow == "school_owner",
        },
        "selected_subjects": subjects,
        "programme": {
            "jamb_programme_id": jamb["id"],
            "jamb_name": jamb["jamb_name"],
            "jamb_faculty": jamb["jamb_faculty"],
            "degree_type": jamb["degree_type"],
            "is_blend": jamb["is_blend"],
            "skills_technical_preview": jamb["skills_technical"][:3],
            "skills_transferable_preview": jamb["skills_transferable"][:3],
        },
        "requirements": {
            "utme_subjects": requirement.get("utme_subjects"),
            "olevel_requirement": requirement.get("olevel_requirement"),
            "direct_entry": requirement.get("direct_entry"),
            "parse_status": record["requirement_parse_status"],
            "structured_option_count": len(record["structured_options"]),
            "structured_options": structured_option_summary(record, subject_names),
        },
        "university": {
            "school_id": school["id"],
            "school_name": school["name"],
            "jamb_code": school.get("jamb_code"),
            "offering_id": record["selected_offering"]["id"],
            "address_expected": "live registry address only; the current seed row does not contain address/city/state",
        },
        "career_mapping": {
            "all_current_links": links,
            "selected_report_path": selected_path,
            "selection_rule": "The user/admin selects the branch; the report must not include unselected sibling domains, subgroups or roles.",
        },
        "report_expectations": {
            "must_include": ["student name or honest fallback", "class/stream when applicable", "programme", "university", "requirements", "selected domain/subgroup/role path"],
            "must_exclude": ["CCMAS discipline label", "demand or salary data", "unselected mapping branches", "private notes without consent", "direct entry for secondary-school display unless the route explicitly supports it"],
            "print_gate": "confirmed guidance path with programme and university",
        },
        "manual_checks": checks,
        "source_refs": {
            "seed_registry": "backend/seed_career_pilot.sql",
            "subject_options": "backend/seed_subject_options.sql",
            "subject_catalog": "backend/seed_subject_catalog.sql",
            "jamb_offering_source": f"data/career-mapping/jamb/{record['source_offering'].get('faculty_source_file', 'not-found')}",
            "jamb_domain_map": "data/career-mapping/jamb_domain_map.json",
            "domain_structure": "data/career-mapping/domain_structure.json",
            "role_registry": "data/career-mapping/role_library_v3_cleaned.json",
        },
    }


def render_markdown(cases: list[dict[str, Any]], source_counts: dict[str, int]) -> str:
    flow_counts = Counter(case["flow"] for case in cases)
    lines = [
        "# 100-case manual review pack: student, undergraduate and school-owner flows",
        "",
        "Generated from the current repository data on 2026-08-17. This is a manual",
        "verification pack, not proof that the live database is seeded correctly.",
        "Review every case in the running platform and record pass/fail against the",
        "exact IDs, source text and expected behavior below.",
        "",
        "## Coverage",
        "",
        "| Flow | Cases | What it exercises |",
        "|---|---:|---|",
        f"| SS1 student | {flow_counts['ss1']} | O-level discovery, stream context, programme and university detail |",
        f"| SS2 student | {flow_counts['ss2']} | O-level/combined guidance, programme choice and report path |",
        f"| SS3 student | {flow_counts['ss3']} | O-level + UTME gating before JAMB decisions |",
        f"| JAMB candidate | {flow_counts['jamb']} | UTME/combined subject search, programme and university selection |",
        f"| Undergraduate | {flow_counts['undergraduate']} | University-first course list and programme overview |",
        f"| Secondary-school owner | {flow_counts['school_owner']} | Manual student creation, guided admission path and print/share gate |",
        "",
        "## Current source counts used",
        "",
    ]
    for key, value in source_counts.items():
        lines.append(f"- `{key}`: **{value}**")
    lines.extend(
        [
            "",
            "## Review rules",
            "",
            "- A requirement row marked `needs_review` or `unparsed` must not be presented as a definitive eligibility decision.",
            "- A university address is expected only when the live institution row returns one. The current seed registry does not populate address fields.",
            "- The programme identity is the JAMB name. Do not accept a CCMAS discipline label in the student-facing card or report.",
            "- Domain links are the current JAMB mapping. The selected subgroup and role are resolved from the current domain structure and role registry; verify the branch manually.",
            "- A school-owner account creation is not consent. Verify the claim, consent, guidance-save and report-print gates separately.",
            "- 100 cases are a useful stratified pilot, but they are not full certification of 420 JAMB names, 3,342 JAMB-domain links or every university offering.",
            "",
        ]
    )
    for case in cases:
        p = case["programme"]
        r = case["requirements"]
        u = case["university"]
        s = case["selected_subjects"]
        path = case["career_mapping"]["selected_report_path"]
        structured_text = "; ".join(
            f"{option['exam_type']}: {option['source_text']}"
            for option in r["structured_options"]
        ) or "None; use the published text state"
        lines.extend(
            [
                f"## {case['case_id']} — {case['flow']} · {case['variant']}",
                "",
                f"- **Student context:** `{case['student_type']}`" + (f" / `{case['stream']}`" if case["stream"] else ""),
                f"- **Entry route:** `{case['entry_route']['account_gate']}` → `{case['entry_route']['admission_mode']}`" + (" → admin guidance" if case["entry_route"]["admin_guidance"] else ""),
                f"- **Exam matching mode:** `{case['exam_type']}`",
                f"- **UTME subjects to enter:** {', '.join(s['utme']) if s['utme'] else 'Not used on this route'}",
                f"- **O-level subjects to enter:** {', '.join(s['olevel']) if s['olevel'] else 'Not used on this route'}",
                f"- **Subject expectation:** {s['expected']}",
                f"- **JAMB programme:** `{p['jamb_name']}` (`{p['jamb_programme_id']}`)",
                f"- **Faculty / degree type:** {p['jamb_faculty']} / {p['degree_type']}",
                f"- **Skills preview:** technical — {', '.join(p['skills_technical_preview']) or 'Unavailable'}; transferable — {', '.join(p['skills_transferable_preview']) or 'Unavailable'}",
                f"- **UTME requirement text:** {r['utme_subjects'] or 'Unavailable'}",
                f"- **O-level requirement text:** {r['olevel_requirement'] or 'Unavailable'}",
                f"- **Requirement parse state:** `{r['parse_status']}`; structured options: `{r['structured_option_count']}`",
                f"- **Structured subject options:** {structured_text}",
                f"- **Selected university:** `{u['school_name']}` / `{u['jamb_code']}` (`{u['school_id']}`)",
                f"- **Offering row:** `{u['offering_id']}`; address expectation: {u['address_expected']}",
                f"- **Selected mapping path:** {path['domain']['name']} (`{path['domain']['match_type']}`) → "
                + (f"{path['subgroup']['label']} → " if path['subgroup'] else "no subgroup → ")
                + (path['role']['name'] if path['role'] else "no role returned"),
                "- **All current programme-domain links:** " + "; ".join(f"{link['domain_name']} [{link['match_type']}]" for link in case["career_mapping"]["all_current_links"]),
                "- **Manual checks:**",
            ]
        )
        lines.extend(f"  - [ ] {check}" for check in case["manual_checks"])
        lines.extend(
            [
                f"- **Report must include:** {', '.join(case['report_expectations']['must_include'])}",
                f"- **Report must exclude:** {', '.join(case['report_expectations']['must_exclude'])}",
                f"- **Source IDs:** JAMB `{p['jamb_programme_id']}`; school `{u['school_id']}`; offering `{u['offering_id']}`",
                "- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________",
                "",
            ]
        )
    return "\n".join(lines)


def main() -> None:
    data = parse_data()
    records = data["records"]
    if len(records) < 100:
        raise SystemExit(f"Only {len(records)} records are eligible; refusing to create a misleading 100-case pack.")
    flows = [("ss1", 15, 0), ("ss2", 15, 17), ("ss3", 15, 34), ("jamb", 20, 51), ("undergraduate", 15, 73), ("school_owner", 20, 88)]
    cases: list[dict[str, Any]] = []
    number = 1
    for flow, count, offset in flows:
        for index, record in enumerate(spread(records, count, offset)):
            cases.append(case_for(record, number, flow, index, data["subject_names"]))
            number += 1
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manual-review-100.json").write_text(json.dumps({"generated_from": data["source_counts"], "cases": cases}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "manual-review-100.md").write_text(render_markdown(cases, data["source_counts"]), encoding="utf-8")
    print(json.dumps({"cases": len(cases), "flows": dict(Counter(case["flow"] for case in cases)), **data["source_counts"]}, indent=2))


if __name__ == "__main__":
    main()
