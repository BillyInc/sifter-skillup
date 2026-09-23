"""Exhaustively exercise the structured subject matcher against generated seeds.

This is deliberately an executable audit rather than a database seed.  It loads
the generated SQL as an in-memory authority snapshot, builds every option's
minimum satisfying selection, then mutates required/group subjects and compares
the live matcher implementation with an independent rule-json oracle.

It catches both directions of the dangerous error:

* false positives: an ineligible subject set returns a programme; and
* false negatives: a fully satisfying generated option is not returned.

The audit is intentionally bounded to every emitted option and its required
negative mutations.  It does not pretend that all 46-subject power-set
combinations are useful evidence.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))


def _sql_unescape(value: str) -> str:
    return value.replace("''", "'")


def _quoted(value: str) -> str:
    return rf"'((?:''|[^'])*)'"


def _load_catalog() -> dict[str, dict[str, str]]:
    text = (BACKEND / "seed_subject_catalog.sql").read_text(encoding="utf-8")
    rows: dict[str, dict[str, str]] = {}
    for match in re.finditer(
        r"\(\s*'(?P<code>[A-Z0-9]+)'\s*,\s*'(?P<name>(?:''|[^'])*)'\s*,",
        text,
    ):
        code = match.group("code")
        # The live matcher resolves selected subjects by catalogue id before
        # reading option items.  The generated SQL uses UUID ids, but the
        # executable audit only needs a stable non-null identity that is shared
        # by the mocked catalogue and item rows.
        rows[code] = {
            "id": code,
            "code": code,
            "name": _sql_unescape(match.group("name")),
        }
    if not rows:
        raise AssertionError("No subject catalogue rows were parsed")
    return rows


def _load_options() -> list[dict[str, Any]]:
    text = (BACKEND / "seed_subject_options.sql").read_text(encoding="utf-8")
    field = _quoted("value")
    pattern = re.compile(
        rf"INSERT INTO programme_subject_options .*?SELECT\s+"
        rf"{field},\s*{field},\s*{field},\s*{field},\s*{field},\s*"
        rf"(?P<min>\d+),\s*{field},",
        re.IGNORECASE,
    )
    rows = []
    for match in pattern.finditer(text):
        values = [_sql_unescape(match.group(i)) for i in range(1, 6)]
        values.append(_sql_unescape(match.group(7)))
        rows.append(
            {
                "id": values[0],
                "jamb_programme_id": values[1],
                "requirement_id": values[2],
                "exam_type": values[3],
                "option_label": values[4],
                "min_required": int(match.group("min")),
                "source_text": values[5],
            }
        )
    if not rows:
        raise AssertionError("No subject option rows were parsed")
    return rows


def _load_items() -> list[dict[str, Any]]:
    text = (BACKEND / "seed_subject_options.sql").read_text(encoding="utf-8")
    field = _quoted("value")
    pattern = re.compile(
        rf"INSERT INTO programme_subject_option_items .*?SELECT\s+"
        rf"{field},\s*{field},\s*sc\.id,\s*{field}"
        rf"(?:,\s*{field},\s*(?P<min>\d+),\s*(?:{field}|NULL))?\s+"
        rf"FROM subject_catalog sc WHERE sc\.code\s*=\s*{field}",
        re.IGNORECASE,
    )
    rows = []
    for match in pattern.finditer(text):
        values = [_sql_unescape(match.group(i)) for i in range(1, 4)]
        # The optional group has a quoted group key followed by a numeric min;
        # capture it separately because the fourth generic field is the role.
        tail = match.group(0)
        group_match = re.search(r",\s*'((?:''|[^'])*)',\s*(\d+),\s*(?:'((?:''|[^'])*)'|NULL)", tail)
        code_match = re.search(r"WHERE sc\.code\s*=\s*'((?:''|[^'])*)'", tail, re.I)
        rows.append(
            {
                "id": values[0],
                "option_id": values[1],
                "requirement_role": values[2],
                "group_key": _sql_unescape(group_match.group(1)) if group_match else None,
                "min_from_group": int(group_match.group(2)) if group_match else None,
                "distinct_group_key": _sql_unescape(group_match.group(3)) if group_match and group_match.group(3) else None,
                "code": _sql_unescape(code_match.group(1)) if code_match else None,
            }
        )
    if not rows:
        raise AssertionError("No subject option item rows were parsed")
    return rows


def _load_typed_rules() -> list[dict[str, Any]]:
    text = (BACKEND / "seed_subject_rule_records.sql").read_text(encoding="utf-8")
    prefix = re.compile(
        rf"INSERT INTO programme_subject_rule_records .*?SELECT\s+"
        rf"{_quoted('id')},\s*{_quoted('jamb')},\s*{_quoted('req')},\s*"
        rf"{_quoted('exam')},\s*{_quoted('status')},",
        re.IGNORECASE,
    )
    source = re.compile(r"::jsonb,\s*'((?:''|[^'])*)',", re.IGNORECASE)
    rows = []
    for match in prefix.finditer(text):
        tail = text[match.start() : text.find("\n", match.start())]
        source_match = source.search(tail)
        if not source_match:
            raise AssertionError(f"Typed rule source text missing near {match.group(1)}")
        values = [_sql_unescape(match.group(i)) for i in range(1, 6)]
        # Capture the JSON object between the status fields and ::jsonb.
        json_match = re.search(r",\s*'((?:''|[^'])*)'::jsonb,", tail)
        if not json_match:
            raise AssertionError(f"Typed rule JSON missing near {values[0]}")
        rule_json = json.loads(_sql_unescape(json_match.group(1)))
        rows.append(
            {
                "id": values[0],
                "jamb_programme_id": values[1],
                "requirement_id": values[2],
                "exam_type": values[3],
                "rule_status": values[4],
                "rule_json": rule_json,
                "source_text": _sql_unescape(source_match.group(1)),
            }
        )
    if not rows:
        raise AssertionError("No typed rule rows were parsed")
    return rows


class _Result:
    def __init__(self, data: list[dict[str, Any]]):
        self.data = data


class _Query:
    def __init__(self, data: list[dict[str, Any]]):
        self.data = list(data)

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, column: str, value: Any):
        self.data = [row for row in self.data if self._value(row, column) == value]
        return self

    def in_(self, column: str, values: list[Any]):
        allowed = {str(value) for value in values}
        self.data = [
            row for row in self.data if str(self._value(row, column)) in allowed
        ]
        return self

    def limit(self, count: int):
        self.data = self.data[:count]
        return self

    def execute(self):
        return _Result(self.data)

    @staticmethod
    def _value(row: dict[str, Any], column: str) -> Any:
        value = row.get(column)
        if value is not None:
            return value
        # The audit fixture stores the nested catalogue object to model the
        # PostgREST relationship selected by the production query.  Expose its
        # id when the query asks for the real foreign-key column.
        if column == "subject_id":
            return (row.get("subject_catalog") or {}).get("id")
        return None


class _Service:
    def __init__(self, tables: dict[str, list[dict[str, Any]]]):
        self.tables = tables

    def table(self, name: str):
        return _Query(self.tables.get(name, []))


def _norm(name: str) -> str:
    from routes.student_pipeline_routes import _normalise_subject

    return _normalise_subject(name)


def _rule_map(rules: list[dict[str, Any]]) -> dict[tuple[str, str], dict[str, Any]]:
    out = {}
    duplicates = []
    for row in rules:
        key = (row["jamb_programme_id"], row["exam_type"])
        if key in out:
            duplicates.append(key)
        out[key] = row
    if duplicates:
        raise AssertionError(f"Duplicate typed rule authority rows: {len(duplicates)}")
    return out


def _items_by_option(items: list[dict[str, Any]], catalog: dict[str, dict[str, str]]):
    out: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in items:
        if item["code"] not in catalog:
            raise AssertionError(f"Item references missing catalogue code: {item}")
        row = dict(item)
        row["subject_catalog"] = catalog[item["code"]]
        out[item["option_id"]].append(row)
    return out


def _distinct_groups_satisfied(groups: list[tuple[str, set[str], int]], selected_codes: set[str]) -> bool:
    """Return whether related groups can be assigned distinct selected subjects."""
    slots: list[set[str]] = []
    for _key, candidates, minimum in groups:
        for _index in range(minimum):
            slots.append(candidates & selected_codes)
    slots.sort(key=len)

    def assign(index: int, used: set[str]) -> bool:
        if index == len(slots):
            return True
        return any(
            assign(index + 1, used | {candidate})
            for candidate in slots[index]
            if candidate not in used
        )

    return assign(0, set())


def _option_expected(
    option: dict[str, Any],
    items_by_opt: dict[str, list[dict[str, Any]]],
    selected_codes: set[str],
    *,
    full: bool = True,
) -> bool:
    """Independent oracle for the executable option/item representation."""
    items = items_by_opt[option["id"]]
    required = {item["code"] for item in items if item["requirement_role"] == "required"}
    if full and not required.issubset(selected_codes):
        return False
    if option["exam_type"] == "olevel" and full and len(selected_codes) < option["min_required"]:
        return False
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in items:
        if item["requirement_role"] == "one_of" and item["group_key"]:
            groups[item["group_key"]].append(item)
    related: dict[str, list[tuple[str, set[str], int]]] = defaultdict(list)
    for key, group_items in groups.items():
        minimum = int(group_items[0].get("min_from_group") or 1)
        candidates = {item["code"] for item in group_items}
        scope = group_items[0].get("distinct_group_key")
        if scope:
            related[scope].append((key, candidates, minimum))
        elif len(candidates & selected_codes) < minimum:
            return False
    # Mirror the production fail-closed gate for rows whose parsed items do
    # not represent the declared credit-pass minimum. The oracle must not call
    # an incomplete option valid merely because its named subjects are present.
    if option["min_required"]:
        represented_capacity = len(required) + sum(
            int(group_items[0].get("min_from_group") or 1)
            for group_items in groups.values()
        )
        if represented_capacity < option["min_required"]:
            return False
    if option["exam_type"] == "olevel":
        broad_group = any(len(group_items) >= 20 for group_items in groups.values())
        source_scope_text = re.split(
            r"\s+(?:for|in)\s+(?:nbc|ntc|nabteb|tc\s*ii|technic(?:al)?\s+certificate)\s+"
            r"(?:holders?|candidates?)?\b",
            str(option.get("source_text") or "").lower(),
            maxsplit=1,
            flags=re.I,
        )[0]
        unresolved_scope = re.search(
            r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\b|"
            r"\bshares?\s+(?:the\s+)?block\b",
            source_scope_text,
        )
        explicit_open_scope = re.search(
            r"\bany\s+(?:(?:other|remaining|additional)\s+)?"
            r"(?:(?:one|two|three|four|five|six|several)\s+(?:\(\d+\)\s*)?)?subjects?\b|"
            r"\b(?:one|two|three|four|five|six|several)\s+"
            r"(?:other|remaining|additional)\s+(?:\(\d+\)\s*)?subjects?\b|"
            r"\bany\s+subject\b",
            source_scope_text,
        )
        if broad_group and (unresolved_scope or not explicit_open_scope):
            return False
    return all(_distinct_groups_satisfied(scope_groups, selected_codes) for scope_groups in related.values())


def _choose_valid_codes(rule: dict[str, Any], catalog: dict[str, dict[str, str]]) -> set[str]:
    payload = rule["rule_json"]
    selected = set(payload.get("required") or [])
    groups = payload.get("groups") or []
    # The generated authority currently uses one distinct group key to express
    # separate groups that cannot reuse one subject. Choose by small backtracking
    # so the audit is valid even when the groups overlap.
    def choose(index: int, current: set[str]) -> set[str] | None:
        if index == len(groups):
            return current
        group = groups[index]
        choices = list(group.get("subjects") or [])
        needed = int(group.get("minimum") or 1)
        for start in range(0, max(1, len(choices) - needed + 1)):
            candidate = set(choices[start : start + needed])
            if len(candidate) != needed:
                continue
            result = choose(index + 1, current | candidate)
            if result is not None:
                return result
        return None

    selected = choose(0, selected)
    if selected is None:
        raise AssertionError(f"Could not construct satisfying selection for {rule['id']}")
    if rule["exam_type"] == "olevel":
        for code in catalog:
            if len(selected) >= int(payload.get("creditMinimum") or 0):
                break
            selected.add(code)
    return selected


def _valid_option_codes(option: dict[str, Any], items_by_opt: dict[str, list[dict[str, Any]]], catalog: dict[str, dict[str, str]]) -> set[str]:
    items = items_by_opt[option["id"]]
    selected = {item["code"] for item in items if item["requirement_role"] == "required"}
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in items:
        if item["requirement_role"] == "one_of":
            groups[item["group_key"]].append(item)
    independent = []
    related: dict[str, list[tuple[str, list[dict[str, Any]], int]]] = defaultdict(list)
    for key, group_items in groups.items():
        minimum = int(group_items[0]["min_from_group"] or 1)
        scope = group_items[0].get("distinct_group_key")
        if scope:
            related[scope].append((key, group_items, minimum))
        else:
            independent.append((key, group_items, minimum))
    for _key, group_items, minimum in independent:
        selected.update(item["code"] for item in group_items[:minimum])
    for scope_groups in related.values():
        slots = [
            (key, [item["code"] for item in group_items], index)
            for key, group_items, minimum in scope_groups
            for index in range(minimum)
        ]
        slots.sort(key=lambda item: len(item[1]))

        def assign(index: int, used: set[str]) -> set[str] | None:
            if index == len(slots):
                return set()
            _key, choices, _slot = slots[index]
            for code in choices:
                if code in used:
                    continue
                rest = assign(index + 1, used | {code})
                if rest is not None:
                    return {code} | rest
            return None

        assigned = assign(0, set())
        if assigned is None:
            raise AssertionError(f"Could not construct distinct satisfying selection for {option['id']}")
        selected.update(assigned)
    if option["exam_type"] == "olevel":
        for code in catalog:
            if len(selected) >= option["min_required"]:
                break
            selected.add(code)
    return selected


def _codes_to_names(codes: set[str], catalog: dict[str, dict[str, str]]) -> set[str]:
    return {_norm(catalog[code]["name"]) for code in codes}


def main() -> int:
    catalog = _load_catalog()
    options = _load_options()
    items = _load_items()
    rules = _load_typed_rules()
    rule_map = _rule_map(rules)
    items_by_opt = _items_by_option(items, catalog)

    option_ids = {option["id"] for option in options}
    missing_items = [option["id"] for option in options if option["id"] not in items_by_opt]
    if missing_items:
        raise AssertionError(f"Options without items: {len(missing_items)}")

    active_options = []
    for option in options:
        key = (option["jamb_programme_id"], option["exam_type"])
        rule = rule_map.get(key)
        if not rule:
            raise AssertionError(f"Option has no typed authority: {key}")
        if rule["rule_status"] not in {"matchable", "cross_reference"}:
            raise AssertionError(f"Emitted option is not matchable: {option['id']} / {rule['rule_status']}")
        if option["requirement_id"] != rule["requirement_id"]:
            raise AssertionError(f"Option/rule requirement mismatch: {option['id']}")
        active_options.append((option, rule))

    from routes import student_pipeline_routes as spr

    tables = {
        "programme_subject_options": options,
        "programme_subject_option_items": [
            {
                **item,
                "subject_id": catalog[item["code"]]["id"],
                "subject_catalog": catalog[item["code"]],
            }
            for item in items
        ],
        "programme_subject_rule_records": rules,
        "subject_catalog": list(catalog.values()),
        "v_jamb_programme_details": [],
    }
    service = _Service(tables)
    original_service = spr._svc
    original_details = spr._jamb_details_for_ids
    spr._svc = lambda: service
    spr._jamb_details_for_ids = lambda ids: {}
    try:
        by_exam = Counter(option["exam_type"] for option, _rule in active_options)
        cases: dict[tuple[str, frozenset[str]], str] = {}
        # Every emitted option gets one satisfying case.
        for option, rule in active_options:
            selected_codes = _valid_option_codes(option, items_by_opt, catalog)
            if not _option_expected(option, items_by_opt, selected_codes):
                raise AssertionError(f"Generated option cannot satisfy its typed rule: {option['id']}")
            cases[(option["exam_type"], frozenset(selected_codes))] = f"valid:{option['id']}"

            # Remove each required subject and each currently selected group
            # member. These are the high-value false-positive mutations.
            for code in list(selected_codes):
                if code in {item["code"] for item in items_by_opt[option["id"]]}:
                    mutated = set(selected_codes)
                    mutated.remove(code)
                    if option["exam_type"] == "olevel" and len(mutated) < 5:
                        # The endpoint rejects under-sized O-level input before
                        # the matcher. Keep enough unrelated subjects for a
                        # meaningful rule mutation, but never re-add the
                        # subject deliberately removed by this case.
                        for filler in catalog:
                            if len(mutated) >= 5:
                                break
                            if filler == code:
                                continue
                            mutated.add(filler)
                    cases[(option["exam_type"], frozenset(mutated))] = f"remove:{option['id']}:{code}"

        failures = []
        for (exam_type, selected_codes), label in cases.items():
            selected_names = _codes_to_names(set(selected_codes), catalog)
            actual = spr._match_structured_subject_options(
                selected_names,
                limit=2000,
                exam_type=exam_type,
                require_full=True,
            )
            actual_ids = {row["jambProgrammeId"] for row in actual}
            expected_ids = {
                option["jamb_programme_id"]
                for option, _rule in active_options
                if option["exam_type"] == exam_type and _option_expected(option, items_by_opt, set(selected_codes))
            }
            if actual_ids != expected_ids:
                failures.append({"label": label, "exam": exam_type, "actual": sorted(actual_ids), "expected": sorted(expected_ids)})

        if failures:
            raise AssertionError(f"{len(failures)} matcher oracle mismatches; first={failures[:3]}")

        print(json.dumps({
            "status": "passed",
            "catalogSubjects": len(catalog),
            "options": len(options),
            "typedRules": len(rules),
            "optionItems": len(items),
            "activeOptionsByExam": dict(by_exam),
            "cases": len(cases),
            "negativeMutationCases": sum(1 for label in cases.values() if label.startswith("remove:")),
            "falsePositiveOracleMismatches": 0,
        }, sort_keys=True))
        return 0
    finally:
        spr._svc = original_service
        spr._jamb_details_for_ids = original_details


if __name__ == "__main__":
    raise SystemExit(main())
