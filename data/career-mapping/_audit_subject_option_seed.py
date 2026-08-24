#!/usr/bin/env python3
"""Audit the generated national subject-option SQL before it is run.

This is deliberately independent of Supabase. It verifies the executable seed
itself: every option has items, every group has one consistent minimum, and the
declared UTME/O-level minimum is fully represented by the emitted rows. A
partial option is never allowed to reach the subject matcher.
"""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

import importlib.util


PARSER_PATH = Path(__file__).resolve().parent / "_parse_subject_options.py"
_parser_spec = importlib.util.spec_from_file_location("subject_option_parser", PARSER_PATH)
if _parser_spec is None or _parser_spec.loader is None:  # pragma: no cover - local tool guard
    raise RuntimeError(f"Could not load parser: {PARSER_PATH}")
_parser = importlib.util.module_from_spec(_parser_spec)
_parser_spec.loader.exec_module(_parser)


ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / "backend" / "seed_subject_options.sql"
CAREER_SEED = ROOT / "backend" / "seed_career_pilot.sql"
CATALOG_SEED = ROOT / "backend" / "seed_subject_catalog.sql"
RULE_SEED = ROOT / "backend" / "seed_subject_rule_records.sql"
OPTION_RE = re.compile(
    r"SELECT '([^']+)', '([^']+)', '([^']+)', '(utme|olevel)', '[^']*', (\d+), "
    r"'((?:''|[^'])*)', 'https://"
)
REQUIRED_RE = re.compile(
    r"SELECT '[^']+', '([^']+)', sc\.id, 'required'"
)
GROUP_RE = re.compile(
    r"SELECT '[^']+', '([^']+)', sc\.id, 'one_of', '([^']+)', (\d+),"
)
CODE_RE = re.compile(r"FROM subject_catalog sc WHERE sc\.code = '([^']+)'\s+"
                     r"AND EXISTS \(SELECT 1 FROM programme_subject_options WHERE id = '([^']+)'")


def source_codes(text: str, exam_type: str) -> set[str]:
    """Return explicitly named subject codes in an emitted source sentence."""
    normalized = re.sub(r"[^a-z0-9]+", " ", text.replace("''", "'").lower())
    allowed = _parser.UTME_CODES if exam_type == "utme" else _parser.OLEVEL_CODES
    matches: list[tuple[str, str]] = []
    for name, code in sorted(_parser.SUBJECT_CODES.items(), key=lambda item: len(item[0]), reverse=True):
        if code not in allowed:
            continue
        pattern = r"(?<![a-z0-9])" + re.escape(name).replace(r"\ ", r"\s+") + r"(?![a-z0-9])"
        if re.search(pattern, normalized):
            matches.append((name, code))
    # Do not interpret the word "English" inside the canonical subject
    # "Literature in English" as a second required subject. Keep the longest
    # catalogue alias for each occurrence, mirroring the runtime guard.
    return {
        code
        for name, code in matches
        if not any(
            other_name != name
            and name in other_name
            and len(other_name) > len(name)
            for other_name, _other_code in matches
        )
    }


def section_ids(sql: str, heading: str, next_heading: str) -> set[str]:
    """Read row IDs from one generated seed section, not from other tables."""
    start = sql.find(heading)
    end = sql.find(next_heading, start + len(heading))
    if start < 0 or end < 0:
        return set()
    section = sql[start:end]
    return set(re.findall(r"\('([^']+)',", section))


def main() -> None:
    career_sql = CAREER_SEED.read_text(encoding="utf-8")
    catalog_sql = CATALOG_SEED.read_text(encoding="utf-8")
    rule_sql = RULE_SEED.read_text(encoding="utf-8")
    jamb_ids = section_ids(
        career_sql,
        "-- jamb_programmes:",
        "-- programme_mapping:",
    )
    requirement_ids = section_ids(
        career_sql,
        "-- programme_subject_requirements:",
        "-- jamb_programme_requirement_sources:",
    )
    catalog_codes = set(re.findall(r"\('([A-Z][A-Z0-9_]*)',\s*'", catalog_sql))
    if not jamb_ids or not requirement_ids or not catalog_codes:
        raise SystemExit("Subject-option SQL audit could not read the prerequisite seed identities")
    options: dict[str, tuple[str, int, str, str]] = {}
    typed_rules: dict[tuple[str, str], tuple[str, str, str, str]] = {}
    required: defaultdict[str, int] = defaultdict(int)
    groups: defaultdict[str, dict[str, int]] = defaultdict(dict)
    subject_codes: defaultdict[str, set[str]] = defaultdict(set)
    for line in SEED.read_text(encoding="utf-8").splitlines():
        option = OPTION_RE.search(line)
        if option:
            option_id, _jamb_id, _requirement_id, exam_type, minimum, source_text = option.groups()
            options[option_id] = (exam_type, int(minimum), source_text, line)
            continue
        item = REQUIRED_RE.search(line)
        group = None
        if item:
            required[item.group(1)] += 1
        else:
            group = GROUP_RE.search(line)
        if group and not item:
            option_id, group_key, minimum = group.groups()
            prior = groups[option_id].get(group_key)
            value = int(minimum)
            if prior is not None and prior != value:
                raise SystemExit(
                    f"inconsistent minimum for {option_id}/{group_key}: {prior} != {value}"
                )
            groups[option_id][group_key] = value

        code = CODE_RE.search(line)
        if code:
            subject_codes[code.group(2)].add(code.group(1))

    for line in rule_sql.splitlines():
        typed = re.search(
            r"INSERT INTO programme_subject_rule_records .*?SELECT '([^']+)', "
            r"'([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)',",
            line,
        )
        if typed:
            _record_id, programme_id, requirement_id, exam_type, status, kind = typed.groups()
            source_match = re.search(r"::jsonb, '((?:''|[^'])*)', 'https://", line)
            typed_rules[(programme_id, exam_type)] = (
                requirement_id,
                status,
                kind,
                (source_match.group(1) if source_match else "").replace("''", "'"),
            )

    errors: list[str] = []
    for option_id, (exam_type, minimum, source_text, _line) in options.items():
        item_count = required[option_id] + sum(groups[option_id].values())
        if item_count == 0:
            errors.append(f"{option_id} ({exam_type}) has no option items")
        if item_count < minimum:
            errors.append(
                f"{option_id} ({exam_type}) declares {minimum} but represents {item_count}"
            )
        missing_named = source_codes(source_text, exam_type) - subject_codes[option_id]
        if missing_named:
            errors.append(
                f"{option_id} ({exam_type}) source names {sorted(missing_named)} "
                "but emitted items do not represent them"
            )

    option_programme_ids = set()
    option_requirement_ids = set()
    missing_typed_rules: list[str] = []
    invalid_typed_status: list[str] = []
    for line in SEED.read_text(encoding="utf-8").splitlines():
        option = OPTION_RE.search(line)
        if option:
            option_programme_ids.add(option.group(2))
            option_requirement_ids.add(option.group(3))
            typed = typed_rules.get((option.group(2), option.group(4)))
            if typed is None:
                missing_typed_rules.append(f"{option.group(2)} ({option.group(4)})")
            else:
                requirement_id, status, _kind, typed_source = typed
                if requirement_id != option.group(3):
                    errors.append(
                        f"option {option.group(1)} requirement ID disagrees with typed rule record"
                    )
                option_source = re.sub(
                    r"\s+\[resolved:\s*as in [^\]]+\]\s*$",
                    "",
                    option.group(6).replace("''", "'"),
                    flags=re.I,
                )
                if re.sub(r"\s+", " ", option_source).strip() != re.sub(
                    r"\s+", " ", typed_source
                ).strip():
                    errors.append(
                        f"option {option.group(1)} source text disagrees with typed rule record"
                    )
                if status not in {"matchable", "cross_reference"}:
                    invalid_typed_status.append(
                        f"{option.group(2)} ({option.group(4)}): {status}"
                    )
    missing_programmes = sorted(option_programme_ids - jamb_ids)
    missing_requirements = sorted(option_requirement_ids - requirement_ids)
    if missing_programmes:
        errors.append(
            "options reference jamb programme IDs absent from seed_career_pilot.sql: "
            + ", ".join(missing_programmes[:8])
        )
    if missing_requirements:
        errors.append(
            "options reference requirement IDs absent from seed_career_pilot.sql: "
            + ", ".join(missing_requirements[:8])
        )
    if missing_typed_rules:
        errors.append(
            "options have no corresponding typed subject rule record: "
            + ", ".join(missing_typed_rules[:8])
        )
    if invalid_typed_status:
        errors.append(
            "options correspond to non-matchable typed rule records: "
            + ", ".join(invalid_typed_status[:8])
        )
    missing_catalog_codes = sorted(
        set().union(*subject_codes.values()) - catalog_codes
        if subject_codes
        else set()
    )
    if missing_catalog_codes:
        errors.append(
            "option items reference subject codes absent from seed_subject_catalog.sql: "
            + ", ".join(missing_catalog_codes[:8])
        )

    referenced = set(required) | set(groups)
    for option_id in sorted(referenced - set(options)):
        errors.append(f"items reference missing option {option_id}")

    if errors:
        raise SystemExit("Subject-option SQL audit failed:\n- " + "\n- ".join(errors))

    print(
        f"Subject-option SQL audit passed: {len(options)} options, "
        f"{sum(required.values()) + sum(sum(v.values()) for v in groups.values())} "
        "represented subject slots/groups."
    )


if __name__ == "__main__":
    main()
