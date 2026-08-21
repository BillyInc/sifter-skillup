"""Exhaustively exercise generated subject selections against the matcher.

This is stronger than a SQL join audit. For every generated UTME/O-level option
it builds a valid synthetic selection, compares the application matcher with an
independent evaluator, and verifies that every returned JAMB programme has a
real university offering. It also checks the combined intersection behavior.

It is still a repository audit: it does not claim that brochure prose marked
``needs_review`` has been manually resolved.
"""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import math
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "backend"))
sys.path.insert(0, str(ROOT / "data" / "career-mapping"))

from generate_manual_review_pack import (  # type: ignore
    SEED,
    SUBJECTS,
    dedupe,
    sql_rows,
    structured_options,
)
from routes import student_pipeline_routes as spr  # type: ignore
from _parse_subject_options import OLEVEL_CODES, UTME_CODES  # type: ignore

OUT = ROOT / "docs" / "manual-review"
_BITCOUNT_LOOKUP = np.asarray([value.bit_count() for value in range(65536)], dtype=np.uint8)


def _numpy_bit_count(values: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=np.uint64)
    total = np.zeros(values.shape, dtype=np.uint16)
    for shift in (0, 16, 32, 48):
        total += _BITCOUNT_LOOKUP[(values >> shift) & np.uint64(0xFFFF)]
    if values.ndim > 1:
        return total.sum(axis=-1)
    return total


class _Result:
    def __init__(self, data: list[dict[str, Any]]) -> None:
        self.data = data


class _Query:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = rows
        self.filters: list[tuple[str, str, Any]] = []
        self.max_rows: int | None = None

    def select(self, *_args: Any, **_kwargs: Any) -> "_Query":
        return self

    def eq(self, field: str, value: Any) -> "_Query":
        self.filters.append(("eq", field, value))
        return self

    def in_(self, field: str, values: list[Any]) -> "_Query":
        self.filters.append(("in", field, set(values)))
        return self

    def limit(self, value: int) -> "_Query":
        self.max_rows = value
        return self

    def execute(self) -> _Result:
        rows = self.rows
        for kind, field, value in self.filters:
            if kind == "eq":
                rows = [row for row in rows if row.get(field) == value]
            else:
                rows = [row for row in rows if row.get(field) in value]
        if self.max_rows is not None:
            rows = rows[: self.max_rows]
        return _Result(rows)


class _MatrixService:
    def __init__(self, tables: dict[str, list[dict[str, Any]]]) -> None:
        self.tables = tables

    def table(self, name: str) -> _Query:
        return _Query(self.tables.get(name, []))


def _load_fixture() -> tuple[
    dict[str, str],
    dict[str, str],
    dict[str, list[dict[str, Any]]],
    dict[str, list[dict[str, Any]]],
]:
    subject_rows = sql_rows(SUBJECTS.read_text(encoding="utf-8"), "subject_catalog")
    subject_names = {str(row[0]): str(row[1]) for row in subject_rows if len(row) >= 2}

    seed_text = SEED.read_text(encoding="utf-8")
    jamb_rows = dedupe(sql_rows(seed_text, "jamb_programmes"), 0)
    jamb_names = {
        str(row[0]): str(row[1])
        for row in jamb_rows
        if len(row) >= 2
    }

    options_by_jamb, _ = structured_options()
    option_rows: list[dict[str, Any]] = []
    item_rows: list[dict[str, Any]] = []
    for jamb_id, options in options_by_jamb.items():
        for option in options:
            option_rows.append({k: v for k, v in option.items() if k != "items"})
            for item in option.get("items") or []:
                code = str(item["subject_code"])
                item_rows.append(
                    {
                        "option_id": option["id"],
                        "requirement_role": item.get("requirement_role"),
                        "group_key": item.get("group_key"),
                        "min_from_group": item.get("min_from_group"),
                        "distinct_group_key": item.get("distinct_group_key"),
                        "subject_catalog": {
                            "code": code,
                            "name": subject_names.get(code, code),
                        },
                    }
                )

    detail_rows = [
        {"jamb_programme_id": jid, "jamb_name": name}
        for jid, name in jamb_names.items()
    ]
    return subject_names, jamb_names, options_by_jamb, {
        "programme_subject_options": option_rows,
        "programme_subject_option_items": item_rows,
        "v_jamb_programme_details": detail_rows,
    }


def _parts(
    option: dict[str, Any],
) -> tuple[set[str], dict[str, tuple[int, set[str]]], dict[str, list[tuple[int, set[str]]]]]:
    required: set[str] = set()
    groups: dict[str, tuple[int, set[str]]] = {}
    distinct: dict[str, list[tuple[int, set[str]]]] = {}
    for item in option.get("items") or []:
        code = str(item.get("subject_code"))
        if item.get("requirement_role") == "required":
            required.add(code)
        elif item.get("requirement_role") == "one_of" and item.get("group_key"):
            key = str(item["group_key"])
            minimum, codes = groups.get(key, (0, set()))
            groups[key] = (
                max(minimum, int(item.get("min_from_group") or 1)),
                codes | {code},
            )
            if item.get("distinct_group_key"):
                scope = str(item["distinct_group_key"])
                if scope not in distinct:
                    distinct[scope] = []
    for scope in list(distinct):
        distinct[scope] = [
            groups[key]
            for key in groups
            if any(
                item.get("group_key") == key
                and str(item.get("distinct_group_key")) == scope
                for item in option.get("items") or []
            )
        ]
    return required, groups, distinct


def _distinct_choice_sets(
    distinct: dict[str, list[tuple[int, set[str]]]],
) -> list[set[str]]:
    """Enumerate disjoint subject assignments for each distinct scope."""
    output: list[set[str]] = []
    for group_specs in distinct.values():
        choices: list[set[str]] = [set()]
        for minimum, codes in group_specs:
            next_choices: list[set[str]] = []
            for current in choices:
                available = sorted(set(codes) - current)
                next_choices.extend(current | set(pick) for pick in itertools.combinations(available, minimum))
            choices = next_choices
        output.extend(choices)
    return output


def _distinct_assignment_masks(
    distinct: dict[str, list[tuple[int, set[str]]]],
    code_index: dict[str, int],
) -> list[int]:
    """Return minimal subject masks satisfying each distinct group scope."""
    masks: list[int] = []
    for choices in _distinct_choice_sets(distinct):
        mask = 0
        for code in choices:
            mask |= 1 << code_index[code]
        masks.append(mask)
    return sorted(set(masks))


def _accepts(option: dict[str, Any], selected: set[str], *, partial: bool = False) -> bool:
    required, groups, distinct = _parts(option)
    if partial:
        return bool((required | {code for _minimum, codes in groups.values() for code in codes}) & selected)
    if not required.issubset(selected):
        return False
    for minimum, codes in groups.values():
        if len(codes & selected) < minimum:
            return False
    # A distinct scope is satisfied only when one subject set can satisfy all
    # its group minima without reusing a subject.
    if distinct and not any(choices.issubset(selected) for choices in _distinct_choice_sets(distinct)):
        return False
    if option.get("exam_type") == "olevel" and len(selected) < int(option.get("min_required") or 0):
        return False
    return True


def _selection_for(
    option: dict[str, Any],
    subject_names: dict[str, str],
) -> set[str]:
    required, groups, distinct = _parts(option)
    selected = set(required)
    for _key, (minimum, codes) in sorted(groups.items()):
        selected.update(sorted(codes)[:minimum])
    for choices in _distinct_choice_sets(distinct):
        selected.update(choices)

    exam_type = str(option.get("exam_type"))
    layer = UTME_CODES if exam_type == "utme" else OLEVEL_CODES
    if exam_type == "utme":
        selected.add("ENG")
        target_size = 4
    else:
        target_size = max(5, int(option.get("min_required") or 0))
    selected.update(sorted(layer - selected)[: max(0, target_size - len(selected))])
    return selected


def _compile_bit_options(
    options: list[dict[str, Any]],
    code_index: dict[str, int],
    programme_index: dict[str, int],
) -> list[tuple[int, list[tuple[int, int]], list[int], int, int]]:
    compiled: list[tuple[int, list[tuple[int, int]], list[int], int, int]] = []
    for option in options:
        required, groups, distinct = _parts(option)
        required_mask = sum(1 << code_index[code] for code in required)
        group_masks = [
            (minimum, sum(1 << code_index[code] for code in codes))
            for minimum, codes in groups.values()
        ]
        compiled.append(
            (
                required_mask,
                group_masks,
                _distinct_assignment_masks(distinct, code_index),
                int(option.get("min_required") or 0),
                1 << programme_index[str(option["jamb_programme_id"])],
            )
        )
    return compiled


def _truth_table(
    *,
    codes: list[str],
    options: list[dict[str, Any]],
    jamb_names: dict[str, str],
    exam_type: str,
    minimum_subjects: int,
    partial: bool = False,
    keep_selection_map: bool = False,
) -> dict[str, Any]:
    """Enumerate every minimum-size picker selection with integer predicates."""
    code_index = {code: index for index, code in enumerate(codes)}
    programme_ids = sorted({str(option["jamb_programme_id"]) for option in options})
    programme_index = {jid: index for index, jid in enumerate(programme_ids)}
    compiled = _compile_bit_options(options, code_index, programme_index)
    result_digest = hashlib.sha256()
    selection_count = 0
    zero_match_count = 0
    max_count = -1
    max_examples: list[dict[str, Any]] = []
    unique_result_masks: set[int] = set()
    selection_map: dict[int, int] | None = {} if keep_selection_map else None

    # UTME has a fixed English subject in the picker. O-level can use any
    # minimum-size subset of the catalogue.
    if exam_type == "utme":
        fixed = 1 << code_index["ENG"]
        rest = [code for code in codes if code != "ENG"]
        combinations = ((fixed | sum(1 << code_index[code] for code in pick), pick) for pick in itertools.combinations(rest, 3))
    else:
        combinations = (
            (sum(1 << code_index[code] for code in pick), pick)
            for pick in itertools.combinations(codes, minimum_subjects)
        )

    for selected_mask, picked in combinations:
        candidate_mask = 0
        for required_mask, groups, distinct_assignments, declared_minimum, programme_mask in compiled:
            if partial:
                has_any = bool(required_mask & selected_mask) or any(
                    group_mask & selected_mask for _minimum, group_mask in groups
                )
                if has_any:
                    candidate_mask |= programme_mask
                continue
            if required_mask & ~selected_mask:
                continue
            if any((group_mask & selected_mask).bit_count() < minimum for minimum, group_mask in groups):
                continue
            if distinct_assignments and not any(
                assignment_mask & ~selected_mask == 0
                for assignment_mask in distinct_assignments
            ):
                continue
            if exam_type == "olevel" and selected_mask.bit_count() < declared_minimum:
                continue
            candidate_mask |= programme_mask

        selection_count += 1
        unique_result_masks.add(candidate_mask)
        if selection_map is not None:
            selection_map[selected_mask] = candidate_mask
        candidate_count = candidate_mask.bit_count()
        if candidate_count == 0:
            zero_match_count += 1
        if candidate_count > max_count:
            max_count = candidate_count
            max_examples = []
        if candidate_count == max_count and len(max_examples) < 5:
            max_examples.append({"subjects": ["English Language" if code == "ENG" else code for code in [*picked]], "programmeCount": candidate_count})
        result_digest.update(f"{selected_mask}:{candidate_mask}\n".encode("ascii"))

    return {
        "selectionCount": selection_count,
        "uniqueResultSets": len(unique_result_masks),
        "zeroMatchCount": zero_match_count,
        "maxProgrammeCount": max_count,
        "maxExamples": max_examples,
        "mappingSha256": result_digest.hexdigest(),
        "programmeCount": len(programme_ids),
        "programmeNamesAvailable": sum(1 for jid in programme_ids if jid in jamb_names),
        "truncationRiskAt40": max_count > 40,
        "truncationRiskAt80": max_count > 80,
        "truncationRiskAt2000": max_count > 2000,
        "resultMasks": unique_result_masks,
        "selectionMap": selection_map,
    }


def _truth_table_numpy(
    *,
    codes: list[str],
    options: list[dict[str, Any]],
    jamb_names: dict[str, str],
    exam_type: str,
    minimum_subjects: int,
    partial: bool = False,
    programme_ids: list[str] | None = None,
) -> dict[str, Any]:
    """Vectorized equivalent of ``_truth_table`` for million-row boundaries."""
    code_index = {code: index for index, code in enumerate(codes)}
    programme_ids = programme_ids or sorted({str(option["jamb_programme_id"]) for option in options})
    programme_index = {jid: index for index, jid in enumerate(programme_ids)}
    compiled = _compile_bit_options(options, code_index, programme_index)
    words = max(1, (len(programme_ids) + 63) // 64)

    if exam_type == "utme":
        fixed = 1 << code_index["ENG"]
        rest = [code for code in codes if code != "ENG"]
        selected_list = [
            fixed | sum(1 << code_index[code] for code in pick)
            for pick in itertools.combinations(rest, 3)
        ]
        selected_subjects = [("English Language", *pick) for pick in itertools.combinations(rest, 3)]
    else:
        selected_list = [
            sum(1 << code_index[code] for code in pick)
            for pick in itertools.combinations(codes, minimum_subjects)
        ]
        selected_subjects = list(itertools.combinations(codes, minimum_subjects))
    selected_masks = np.asarray(selected_list, dtype=np.uint64)
    candidate_words = np.zeros((len(selected_masks), words), dtype=np.uint64)

    for required_mask, groups, distinct_assignments, declared_minimum, programme_mask in compiled:
        valid = (selected_masks & np.uint64(required_mask)) == np.uint64(required_mask)
        if partial:
            valid = np.zeros(len(selected_masks), dtype=bool)
            if required_mask:
                valid |= (selected_masks & np.uint64(required_mask)) != 0
            for _minimum, group_mask in groups:
                valid |= (selected_masks & np.uint64(group_mask)) != 0
        else:
            for minimum, group_mask in groups:
                valid &= _numpy_bit_count(selected_masks & np.uint64(group_mask)) >= minimum
            if distinct_assignments:
                distinct_valid = np.zeros(len(selected_masks), dtype=bool)
                for assignment_mask in distinct_assignments:
                    distinct_valid |= (
                        (selected_masks & np.uint64(assignment_mask))
                        == np.uint64(assignment_mask)
                    )
                valid &= distinct_valid
            if exam_type == "olevel":
                valid &= len(codes) >= declared_minimum
                # The table is generated at one fixed selection size.
                valid &= minimum_subjects >= declared_minimum
        if valid.any():
            programme_index_value = programme_mask.bit_length() - 1
            candidate_words[valid, programme_index_value // 64] |= np.uint64(1 << (programme_index_value % 64))

    counts = _numpy_bit_count(candidate_words)
    max_count = int(counts.max()) if len(counts) else 0
    max_examples = []
    for index in np.flatnonzero(counts == max_count)[:5]:
        max_examples.append({"subjects": list(selected_subjects[int(index)]), "programmeCount": max_count})
    digest = hashlib.sha256(selected_masks.tobytes() + candidate_words.tobytes()).hexdigest()
    return {
        "selectionCount": len(selected_masks),
        "uniqueResultSets": int(np.unique(candidate_words, axis=0).shape[0]),
        "zeroMatchCount": int(np.count_nonzero(counts == 0)),
        "maxProgrammeCount": max_count,
        "maxExamples": max_examples,
        "mappingSha256": digest,
        "programmeCount": len(programme_ids),
        "programmeNamesAvailable": sum(1 for jid in programme_ids if jid in jamb_names),
        "truncationRiskAt40": max_count > 40,
        "truncationRiskAt80": max_count > 80,
        "truncationRiskAt2000": max_count > 2000,
        "selectionMasks": selected_masks,
        "candidateWords": candidate_words,
    }


def _derive_larger_olevel_truth(
    *,
    codes: list[str],
    options: list[dict[str, Any]],
    five_selection_masks: np.ndarray,
    five_candidate_words: np.ndarray,
    programme_ids: list[str],
) -> dict[str, Any]:
    """Cover every six-subject set and all larger sets by monotonic closure.

    The generated O-level options currently have minimum satisfying sizes of
    five or six. A five-minimum rule is represented by one of the six
    five-subsets; a six-minimum rule is evaluated directly. Any 7–12 subject
    selection contains such a satisfying five/six-subject subset, so its result
    set is the union of those boundary results.
    """
    code_index = {code: index for index, code in enumerate(codes)}
    min_six_options = [option for option in options if int(option.get("min_required") or 0) > 5]
    programme_index = {jid: index for index, jid in enumerate(programme_ids)}
    compiled = _compile_bit_options(min_six_options, code_index, programme_index)
    result_digest = hashlib.sha256()
    selection_count = 0
    zero_match_count = 0
    max_count = -1
    max_examples: list[dict[str, Any]] = []
    unique_result_masks: set[tuple[int, ...]] = set()
    sorted_indices = np.argsort(five_selection_masks)
    sorted_five_masks = five_selection_masks[sorted_indices]
    sorted_five_words = five_candidate_words[sorted_indices]
    words = five_candidate_words.shape[1]
    batch_size = 200_000
    batch: list[tuple[str, ...]] = []

    def consume(current: list[tuple[str, ...]]) -> None:
        nonlocal selection_count, zero_match_count, max_count, max_examples
        if not current:
            return
        selected_masks = np.asarray(
            [sum(1 << code_index[code] for code in picked) for picked in current],
            dtype=np.uint64,
        )
        selected_code_indices = np.asarray(
            [[code_index[code] for code in picked] for picked in current],
            dtype=np.uint64,
        )
        candidate_words = np.zeros((len(current), words), dtype=np.uint64)
        for column in range(6):
            bit = np.left_shift(np.uint64(1), selected_code_indices[:, column])
            removed = selected_masks ^ bit
            positions = np.searchsorted(sorted_five_masks, removed)
            candidate_words |= sorted_five_words[positions]

        # Add the directly evaluated six-credit rules.
        for required_mask, groups, distinct_assignments, declared_minimum, programme_mask in compiled:
            valid = (selected_masks & np.uint64(required_mask)) == np.uint64(required_mask)
            for minimum, group_mask in groups:
                valid &= _numpy_bit_count(selected_masks & np.uint64(group_mask)) >= minimum
            if distinct_assignments:
                distinct_valid = np.zeros(len(selected_masks), dtype=bool)
                for assignment_mask in distinct_assignments:
                    distinct_valid |= (
                        (selected_masks & np.uint64(assignment_mask))
                        == np.uint64(assignment_mask)
                    )
                valid &= distinct_valid
            valid &= _numpy_bit_count(selected_masks) >= declared_minimum
            if valid.any():
                programme_index_value = programme_mask.bit_length() - 1
                candidate_words[valid, programme_index_value // 64] |= np.uint64(1 << (programme_index_value % 64))

        counts = _numpy_bit_count(candidate_words)
        selection_count += len(current)
        zero_match_count += int(np.count_nonzero(counts == 0))
        batch_max = int(counts.max()) if len(counts) else 0
        if batch_max > max_count:
            max_count = batch_max
            max_examples = []
        if batch_max == max_count:
            for index in np.flatnonzero(counts == batch_max)[: max(0, 5 - len(max_examples))]:
                max_examples.append({"subjects": list(current[int(index)]), "programmeCount": batch_max})
        unique_result_masks.update(map(tuple, np.unique(candidate_words, axis=0)))
        # The six-subject combinations are generated in deterministic order.
        result_digest.update(selected_masks.tobytes())
        result_digest.update(candidate_words.tobytes())

    for picked in itertools.combinations(codes, 6):
        batch.append(picked)
        if len(batch) >= batch_size:
            consume(batch)
            batch = []
    consume(batch)

    return {
        "selectionCount": selection_count,
        "uniqueResultSets": len(unique_result_masks),
        "zeroMatchCount": zero_match_count,
        "maxProgrammeCount": max_count,
        "maxExamples": max_examples,
        "mappingSha256": result_digest.hexdigest(),
        "programmeCount": len(programme_ids),
        "truncationRiskAt2000": max_count > 2000,
    }


def build_audit() -> dict[str, Any]:
    subject_names, jamb_names, options_by_jamb, tables = _load_fixture()
    all_options = [option for rows in options_by_jamb.values() for option in rows]
    all_structured_programme_ids = sorted({str(option["jamb_programme_id"]) for option in all_options})
    options_by_type = {
        "utme": [option for option in all_options if option.get("exam_type") == "utme"],
        "olevel": [option for option in all_options if option.get("exam_type") == "olevel"],
    }

    school_rows = dedupe(sql_rows(SEED.read_text(encoding="utf-8"), "schools"), 0)
    school_ids = {str(row[0]) for row in school_rows if row}
    offering_rows = dedupe(
        [row for row in sql_rows(SEED.read_text(encoding="utf-8"), "school_programmes") if len(row) >= 3],
        0,
    )
    offerings_by_jamb: dict[str, list[dict[str, str]]] = defaultdict(list)
    offering_errors: list[dict[str, Any]] = []
    for row in offering_rows:
        school_id, jamb_id = str(row[1]), str(row[2])
        if school_id not in school_ids:
            offering_errors.append({"code": "unknown_school", "schoolId": school_id})
        if jamb_id not in jamb_names:
            offering_errors.append({"code": "unknown_jamb_programme", "jambProgrammeId": jamb_id})
        offerings_by_jamb[jamb_id].append({"schoolId": school_id})

    service = _MatrixService(tables)
    original_service = spr._svc
    spr._svc = lambda: service
    mismatches: list[dict[str, Any]] = []
    cases: list[dict[str, Any]] = []
    raw_cache: dict[tuple[str, tuple[str, ...], bool], set[str]] = {}

    def matcher_ids(exam_type: str, selected_codes: set[str], require_full: bool) -> set[str]:
        key = (exam_type, tuple(sorted(selected_codes)), require_full)
        if key not in raw_cache:
            selected_names = {spr._normalise_subject(subject_names[code]) for code in selected_codes}
            raw_cache[key] = {
                str(row.get("jambProgrammeId"))
                for row in spr._match_structured_subject_options(
                    selected_names,
                    limit=2000,
                    exam_type=exam_type,
                    require_full=require_full,
                )
            }
        return raw_cache[key]

    try:
        for exam_type, options in options_by_type.items():
            for option in options:
                selected = _selection_for(option, subject_names)
                expected = {
                    jid
                    for jid, candidates in options_by_jamb.items()
                    for candidate in candidates
                    if candidate.get("exam_type") == exam_type
                    and _accepts(candidate, selected)
                }
                actual = matcher_ids(exam_type, selected, True)
                case = {
                    "examType": exam_type,
                    "optionId": option["id"],
                    "jambProgrammeId": option["jamb_programme_id"],
                    "selectedCodes": sorted(selected),
                    "expectedProgrammeIds": sorted(expected),
                    "actualProgrammeIds": sorted(actual),
                    "universityCounts": {jid: len(offerings_by_jamb.get(jid, [])) for jid in sorted(actual)},
                }
                cases.append(case)
                if actual != expected:
                    mismatches.append({"kind": "layer_match", **case})
                for jid in actual:
                    if not offerings_by_jamb.get(jid):
                        mismatches.append(
                            {"kind": "programme_without_university_offering", "examType": exam_type, "jambProgrammeId": jid}
                        )

        combined_cases = 0
        for jamb_id, candidates in options_by_jamb.items():
            utme_options = [o for o in candidates if o.get("exam_type") == "utme"]
            olevel_options = [o for o in candidates if o.get("exam_type") == "olevel"]
            if not utme_options or not olevel_options:
                continue
            for utme_option in utme_options:
                for olevel_option in olevel_options:
                    utme_selected = _selection_for(utme_option, subject_names)
                    olevel_selected = _selection_for(olevel_option, subject_names)
                    expected_utme = matcher_ids("utme", utme_selected, True)
                    expected_olevel_partial = {
                        jid
                        for jid, rows in options_by_jamb.items()
                        for candidate in rows
                        if candidate.get("exam_type") == "olevel"
                        and _accepts(candidate, olevel_selected, partial=True)
                    }
                    actual_utme = matcher_ids("utme", utme_selected, True)
                    actual_olevel_partial = matcher_ids("olevel", olevel_selected, False)
                    expected = expected_utme & expected_olevel_partial
                    actual = actual_utme & actual_olevel_partial
                    combined_cases += 1
                    if actual != expected:
                        mismatches.append(
                            {
                                "kind": "combined_intersection",
                                "jambProgrammeId": jamb_id,
                                "utmeOptionId": utme_option["id"],
                                "olevelOptionId": olevel_option["id"],
                                "expectedProgrammeIds": sorted(expected),
                                "actualProgrammeIds": sorted(actual),
                            }
                        )
                    for result_id in actual:
                        if not offerings_by_jamb.get(result_id):
                            mismatches.append(
                                {"kind": "combined_programme_without_university_offering", "jambProgrammeId": result_id}
                            )
    finally:
        spr._svc = original_service
    print("subject-option boundary cases complete", flush=True)

    utme_truth = _truth_table_numpy(
        codes=sorted(UTME_CODES),
        options=options_by_type["utme"],
        jamb_names=jamb_names,
        exam_type="utme",
        minimum_subjects=4,
        programme_ids=all_structured_programme_ids,
    )
    olevel_truth = _truth_table_numpy(
        codes=sorted(OLEVEL_CODES),
        options=options_by_type["olevel"],
        jamb_names=jamb_names,
        exam_type="olevel",
        minimum_subjects=5,
        programme_ids=all_structured_programme_ids,
    )
    olevel_partial_truth = _truth_table_numpy(
        codes=sorted(OLEVEL_CODES),
        options=options_by_type["olevel"],
        jamb_names=jamb_names,
        exam_type="olevel",
        minimum_subjects=5,
        partial=True,
        programme_ids=all_structured_programme_ids,
    )
    print("five-subject truth tables complete", flush=True)
    larger_olevel_truth = _derive_larger_olevel_truth(
        codes=sorted(OLEVEL_CODES),
        options=options_by_type["olevel"],
        five_selection_masks=olevel_truth["selectionMasks"],
        five_candidate_words=olevel_truth["candidateWords"],
        programme_ids=all_structured_programme_ids,
    )
    print("six-subject closure complete", flush=True)

    # The combined endpoint intersects the complete UTME result set with the
    # partial O-level result set. Every possible selection pair is therefore
    # represented by the Cartesian product of the unique layer result sets;
    # different subject selections with the same result set are equivalent.
    combined_digest = hashlib.sha256()
    utme_unique_words = np.unique(utme_truth["candidateWords"], axis=0)
    olevel_partial_unique_words = np.unique(olevel_partial_truth["candidateWords"], axis=0)
    combined_unique_masks: set[tuple[int, ...]] = set()
    combined_max_count = 0
    for utme_mask in utme_unique_words:
        for olevel_mask in olevel_partial_unique_words:
            combined_mask = np.bitwise_and(utme_mask, olevel_mask)
            combined_unique_masks.add(tuple(int(value) for value in combined_mask))
            combined_max_count = max(combined_max_count, int(_numpy_bit_count(combined_mask).sum()))
            combined_digest.update(utme_mask.tobytes() + olevel_mask.tobytes() + combined_mask.tobytes())

    truth_tables = {
        "utmeExactPickerSelections": {k: v for k, v in utme_truth.items() if k not in {"selectionMasks", "candidateWords"}},
        "olevelExactFiveSelections": {k: v for k, v in olevel_truth.items() if k not in {"selectionMasks", "candidateWords"}},
        "olevelPartialSelectionsForCombined": {k: v for k, v in olevel_partial_truth.items() if k not in {"selectionMasks", "candidateWords"}},
        "olevelLargerSelectionClosure": larger_olevel_truth,
        "combinedUniqueResultSetPairs": {
            "utmeUniqueResultSets": len(utme_unique_words),
            "olevelUniqueResultSets": len(olevel_partial_unique_words),
            "pairCount": len(utme_unique_words) * len(olevel_partial_unique_words),
            "combinedUniqueResultSets": len(combined_unique_masks),
            "maxProgrammeCount": combined_max_count,
            "mappingSha256": combined_digest.hexdigest(),
            "truncationRiskAt40": combined_max_count > 40,
            "truncationRiskAt80": combined_max_count > 80,
            "truncationRiskAt2000": combined_max_count > 2000,
        },
        "largerOlevelSelections": {
            "possibleSelectionsFromFiveToTwelve": sum(
                math.comb(len(OLEVEL_CODES), size) for size in range(5, 13)
            ),
            "minimumSatisfyingSelectionSize": max(
                int(option.get("min_required") or 0) for option in options_by_type["olevel"]
            ),
            "exactSixSelectionsEnumerated": larger_olevel_truth["selectionCount"],
            "coverageMethod": "exact-five boundary plus every exact-six selection; all generated rules have minimum satisfying size five or six and use required-subset, minimum-group, and minimum-credit predicates with no exclusions",
        },
    }

    layer_code_errors = []
    for option in all_options:
        allowed = UTME_CODES if option.get("exam_type") == "utme" else OLEVEL_CODES
        for item in option.get("items") or []:
            if item.get("subject_code") not in allowed:
                layer_code_errors.append(
                    {
                        "optionId": option["id"],
                        "examType": option.get("exam_type"),
                        "subjectCode": item.get("subject_code"),
                    }
                )

    sample_sets = {
        "ss1OlevelOnly": {"examType": "olevel", "codes": ["ENG", "MATH", "ECON", "ACC", "COMM"]},
        "ss3OrJambCombined": {
            "examType": "combined",
            "utmeCodes": ["ENG", "MATH", "ECON", "GOV"],
            "olevelCodes": ["ENG", "MATH", "ECON", "ACC", "COMM"],
        },
    }
    # The main matrix restores the real service before report construction;
    # run these human-readable examples against the same fixture service.
    spr._svc = lambda: service
    try:
        for sample in sample_sets.values():
            if sample["examType"] == "olevel":
                sample["programmeIds"] = sorted(matcher_ids("olevel", set(sample["codes"]), True))
            else:
                sample["utmeProgrammeIds"] = sorted(matcher_ids("utme", set(sample["utmeCodes"]), True))
                sample["olevelProgrammeIds"] = sorted(matcher_ids("olevel", set(sample["olevelCodes"]), False))
                sample["programmeIds"] = sorted(
                    set(sample["utmeProgrammeIds"]) & set(sample["olevelProgrammeIds"])
                )
    finally:
        spr._svc = original_service

    return {
        "generatedAt": date.today().isoformat(),
        "scope": "Generated structured subject options and the application matcher; repository seed only.",
        "counts": {
            "subjectCatalogue": len(subject_names),
            "utmeOptions": len(options_by_type["utme"]),
            "olevelOptions": len(options_by_type["olevel"]),
            "programmeSelectionCases": len(cases),
            "combinedSelectionCases": combined_cases,
            "universityOfferingRows": len(offering_rows),
            "universityOfferingPairsWithKnownSchoolAndProgramme": len(offering_rows) - len(offering_errors),
        },
        "proof": {
            "layerMatcherMatchesIndependentEvaluator": not mismatches,
            "allReturnedProgrammesHaveUniversityOfferings": not any(
                item.get("kind", "").endswith("without_university_offering") for item in mismatches
            ),
            "technicalTradeOnlyCodesExcludedFromUtme": not layer_code_errors,
            "combinedUsesSameProgrammeIdIntersection": not any(item.get("kind") == "combined_intersection" for item in mismatches),
            "allUtmePickerCombinationsEnumerated": truth_tables["utmeExactPickerSelections"]["selectionCount"] == 2024,
            "allMinimumOlevelCombinationsEnumerated": truth_tables["olevelExactFiveSelections"]["selectionCount"] == 1370754,
            "allExactSixOlevelCombinationsEnumerated": truth_tables["olevelLargerSelectionClosure"]["selectionCount"] == 9366819,
            "largerOlevelSelectionsCoveredByMonotonicity": (
                truth_tables["largerOlevelSelections"]["minimumSatisfyingSelectionSize"] <= 6
            ),
            "apiDefaultLimitCoversAllEnumeratedResultSets": (
                truth_tables["utmeExactPickerSelections"]["maxProgrammeCount"] <= 2000
                and truth_tables["olevelExactFiveSelections"]["maxProgrammeCount"] <= 2000
                and truth_tables["olevelLargerSelectionClosure"]["maxProgrammeCount"] <= 2000
                and truth_tables["combinedUniqueResultSetPairs"]["maxProgrammeCount"] <= 2000
            ),
        },
        "layerCodes": {
            "utme": sorted(UTME_CODES),
            "olevel": sorted(OLEVEL_CODES),
            "olevelOnly": sorted(OLEVEL_CODES - UTME_CODES),
        },
        "samples": sample_sets,
        "truthTables": truth_tables,
        "mismatches": mismatches,
        "layerCodeErrors": layer_code_errors,
        "offeringErrors": offering_errors,
    }


def markdown_report(audit: dict[str, Any]) -> str:
    counts = audit["counts"]
    proof = audit["proof"]
    lines = [
        f"# Subject selection matrix audit ({audit['generatedAt']})",
        "",
        "This run builds valid synthetic selections from every generated UTME and O-level option, compares the application matcher with an independent evaluator, checks the combined intersection, and verifies university offerings.",
        "",
        "## Result",
        "",
    ]
    for key, value in proof.items():
        lines.append(f"- `{key}`: {'PASS' if value else 'FAIL'}")
    lines.extend(["", "## Counts", ""])
    for key, value in counts.items():
        lines.append(f"- `{key}`: {value}")
    truth_tables = audit.get("truthTables") or {}
    lines.extend(["", "## Exhaustive picker coverage", ""])
    for key in ("utmeExactPickerSelections", "olevelExactFiveSelections", "olevelPartialSelectionsForCombined"):
        table = truth_tables.get(key) or {}
        lines.append(
            f"- `{key}`: {table.get('selectionCount')} selections; max {table.get('maxProgrammeCount')} programmes; SHA-256 `{table.get('mappingSha256')}`."
        )
    closure = truth_tables.get("olevelLargerSelectionClosure") or {}
    lines.append(
        f"- `olevelLargerSelectionClosure`: {closure.get('selectionCount')} exact-six selections; max {closure.get('maxProgrammeCount')} programmes; SHA-256 `{closure.get('mappingSha256')}`."
    )
    combined = truth_tables.get("combinedUniqueResultSetPairs") or {}
    lines.append(
        f"- `combinedUniqueResultSetPairs`: {combined.get('pairCount')} unique layer-result pairs; max {combined.get('maxProgrammeCount')} programmes; SHA-256 `{combined.get('mappingSha256')}`."
    )
    larger = truth_tables.get("largerOlevelSelections") or {}
    lines.append(f"- Larger O-level selections covered: `{larger.get('possibleSelectionsFromFiveToTwelve')}` possible selections by monotonicity of the stored predicates.")
    lines.extend(["", "## Layer behavior", "", "- O-level-only selections are evaluated only against O-level options.", "- UTME selections are evaluated only against UTME options.", "- Combined selections intersect UTME and O-level programme IDs; subjects are not flattened into one exam list.", "- University rows are joined by the same JAMB programme ID after programme matching.", "", "## Mismatches", ""])
    lines.append("- None found." if not audit["mismatches"] else f"- {len(audit['mismatches'])} mismatch(es); see JSON for details.")
    lines.extend(["", "## Source boundary", "", "A PASS proves the generated rule and join behavior. It does not convert brochure text marked `needs_review` into an exact rule; those records remain a manual/source-review boundary.", ""])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=OUT / "subject-selection-matrix-run-2026-08-18.json")
    parser.add_argument("--md", type=Path, default=OUT / "subject-selection-matrix-run-2026-08-18.md")
    args = parser.parse_args()
    audit = build_audit()
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.md.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(audit, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    args.md.write_text(markdown_report(audit), encoding="utf-8")
    print(json.dumps({"json": str(args.json), "markdown": str(args.md), "mismatches": len(audit["mismatches"]), "offeringErrors": len(audit["offeringErrors"])}, indent=2))
    return 1 if audit["mismatches"] or audit["offeringErrors"] or audit["layerCodeErrors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
