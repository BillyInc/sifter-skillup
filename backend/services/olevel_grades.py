"""Pure O-level grade checking for the subject matcher.

Grades are *self-reported* and are only ever used to ADD a ``gradeCheck`` to a
result that subject-name matching has already produced. Nothing in this module
filters, reorders or creates candidates, and it never reads or writes storage.

Grade bands (documented, configurable constants)
------------------------------------------------
The rule data does not state a grade scale. The product owner approved the
standard WAEC/NECO O-level bands as the default:

* credit = A1, B2, B3, C4, C5, C6
* pass   = credit grades plus D7, E8
* F9 is a fail

Change ``OLEVEL_CREDIT_GRADES`` / ``OLEVEL_PASS_GRADES`` (or pass other sets to
``grade_check``) to reconfigure; no other code embeds a grade string.

Per-condition status is ``met`` / ``not_met`` / ``unknown``. A missing grade is
always ``unknown`` and is never treated as pass or fail. A condition whose
shortfall is a *subject-selection* gap (not a grade) is ``unknown`` here: that
gap is already reported by the selection matcher. UTME scores are not captured
and no UTME threshold exists in the data; nothing here invents one.
"""

from __future__ import annotations

from typing import Any, Iterable, Mapping, Optional

OLEVEL_GRADE_SCALE: tuple[str, ...] = (
    "A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9",
)
OLEVEL_CREDIT_GRADES: frozenset[str] = frozenset(OLEVEL_GRADE_SCALE[:6])  # A1-C6
OLEVEL_PASS_GRADES: frozenset[str] = frozenset(OLEVEL_GRADE_SCALE[:8])  # A1-E8
MAX_GRADE_ENTRIES = 12

BANDS_NOTE = (
    "Grades are checked against the standard WAEC/NECO bands "
    "(credit A1-C6, pass A1-E8). The institution's own rule still applies, "
    "and the grades are the ones you entered."
)
NEEDS_CONFIRMATION = "Needs confirmation with JAMB/the institution."
UTME_SCORE_NOTE = (
    "Programme cut-off marks are not published in this app. "
    "Needs confirmation with JAMB/the institution."
)

MET, NOT_MET, UNKNOWN = "met", "not_met", "unknown"


def normalize_grade(value: Any) -> Optional[str]:
    """Return a canonical grade (e.g. ``"c4"`` -> ``"C4"``) or None if invalid."""
    if not isinstance(value, str):
        return None
    grade = value.strip().upper()
    return grade if grade in OLEVEL_GRADE_SCALE else None


def _max_distinct(groups: list[tuple[int, set[str]]], pool: set[str]) -> int:
    """Max distinct-subject assignment across groups (bipartite matching)."""
    slots: list[set[str]] = []
    for minimum, members in groups:
        slots.extend([members & pool] * max(0, int(minimum)))
    matched: dict[str, int] = {}

    def augment(index: int, seen: set[str]) -> bool:
        for subject in slots[index]:
            if subject in seen:
                continue
            seen.add(subject)
            previous = matched.get(subject)
            if previous is None or augment(previous, seen):
                matched[subject] = index
                return True
        return False

    return sum(1 for index in range(len(slots)) if augment(index, set()))


def _cond(kind: str, status: str, required: str, note: str, **extra: Any) -> dict:
    out = {"kind": kind, "required": required, "status": status, "note": note}
    out.update({k: v for k, v in extra.items() if v is not None})
    return out


def grade_check(
    *,
    required: Iterable[Mapping[str, str]] = (),
    pass_required: Iterable[Mapping[str, str]] = (),
    groups: Iterable[Mapping[str, Any]] = (),
    credit_minimum: int = 0,
    selected_norm: Iterable[str] = (),
    grades_by_norm: Mapping[str, str],
    has_source_condition: bool = False,
    credit_grades: frozenset[str] = OLEVEL_CREDIT_GRADES,
    pass_grades: frozenset[str] = OLEVEL_PASS_GRADES,
) -> dict:
    """Evaluate one O-level rule against self-reported grades.

    ``required`` / ``pass_required``: ``[{"name", "norm"}]`` (credit-level and
    pass-only subjects). ``groups``: ``[{"names": [{"name","norm"}], "minimum":
    int, "distinct": optional key}]`` (one-of groups; groups sharing a
    ``distinct`` key cannot reuse a subject). ``credit_minimum``: required
    number of credits (0 = none). ``selected_norm``: the student's selected
    O-level subjects. ``grades_by_norm``: normalized subject name -> grade.
    """
    selected = {s for s in selected_norm if s}
    grades = {k: v for k, v in grades_by_norm.items() if v in OLEVEL_GRADE_SCALE}
    credit_set = {s for s in selected if grades.get(s) in credit_grades}
    ungraded = {s for s in selected if s not in grades}
    conditions: list[dict] = []

    def subject_condition(kind: str, row: Mapping[str, str], allowed: frozenset[str]) -> None:
        name, norm = row.get("name") or "", row.get("norm") or ""
        band = "credit" if allowed is credit_grades else "pass"
        floor = "C6" if band == "credit" else "E8"
        grade = grades.get(norm)
        required_text = f"{'Credit' if band == 'credit' else 'Pass'} in {name}"
        if norm not in selected or grade is None:
            conditions.append(_cond(
                kind, UNKNOWN, required_text,
                f"Add your grade for {name} to check this requirement."
                if norm in selected else
                f"{name} is not among your selected subjects; add it and its grade to check this requirement.",
                subject=name,
            ))
        elif grade in allowed:
            conditions.append(_cond(
                kind, MET, required_text,
                f"Your {name} grade ({grade}) meets the {band} requirement.",
                subject=name, entered=grade,
            ))
        else:
            conditions.append(_cond(
                kind, NOT_MET, required_text,
                f"Your {name} grade ({grade}) is below a {band} ({floor}). "
                f"This programme asks for a {band} in {name}.",
                subject=name, entered=grade,
            ))

    for row in required:
        subject_condition("credit_subject", row, credit_grades)
    for row in pass_required:
        subject_condition("pass_subject", row, pass_grades)

    # One-of groups. A group whose *selection* cannot reach the minimum is a
    # subject gap, not a grade result -> unknown.
    independent: list[tuple[Mapping[str, Any], set[str], int]] = []
    distinct: dict[str, list[tuple[Mapping[str, Any], set[str], int]]] = {}
    for group in groups:
        members = {n["norm"] for n in group.get("names", []) if n.get("norm")}
        minimum = max(1, int(group.get("minimum") or 1))
        scope = group.get("distinct")
        bucket = distinct.setdefault(str(scope), []) if scope else independent
        bucket.append((group, members, minimum))

    def group_condition(label: str, needed: int, selected_cap: int, credit_cap: int, possible_cap: int) -> None:
        required_text = f"{needed} credit{'s' if needed != 1 else ''} from: {label}"
        if selected_cap < needed:
            conditions.append(_cond(
                "credit_group", UNKNOWN, required_text,
                "Your selected subjects do not yet cover this group; grades cannot be checked for it.",
            ))
        elif credit_cap >= needed:
            conditions.append(_cond("credit_group", MET, required_text,
                                    "Your entered grades meet this group's credit requirement."))
        elif possible_cap >= needed:
            conditions.append(_cond("credit_group", UNKNOWN, required_text,
                                    "Add the missing grades to check this requirement."))
        else:
            conditions.append(_cond("credit_group", NOT_MET, required_text,
                                    "Too few of your entered grades in this group reach a credit (C6)."))

    for group, members, minimum in independent:
        label = ", ".join(n["name"] for n in group.get("names", []) if n.get("name"))
        group_condition(
            label, minimum,
            len(members & selected),
            len(members & credit_set),
            len(members & (credit_set | ungraded)),
        )
    for scope_groups in distinct.values():
        specs = [(m, members) for _g, members, m in scope_groups]
        needed = sum(m for m, _members in specs)
        label = ", ".join(
            n["name"] for g, _members, _m in scope_groups for n in g.get("names", []) if n.get("name")
        )
        group_condition(
            label, needed,
            _max_distinct(specs, selected),
            _max_distinct(specs, credit_set),
            _max_distinct(specs, credit_set | ungraded),
        )

    if credit_minimum and credit_minimum > 0:
        credits, open_slots = len(credit_set), len(ungraded)
        text = f"{credit_minimum} credits in total"
        if len(selected) < credit_minimum:
            conditions.append(_cond(
                "credit_total", UNKNOWN, text,
                "You have selected fewer subjects than this programme needs; grades cannot settle it.",
                entered=credits,
            ))
        elif credits >= credit_minimum:
            conditions.append(_cond("credit_total", MET, text,
                                    f"You entered {credits} credit-level grades.", entered=credits))
        elif credits + open_slots >= credit_minimum:
            conditions.append(_cond(
                "credit_total", UNKNOWN, text,
                f"You entered {credits} credit-level grades; add grades for your other subjects to check this.",
                entered=credits,
            ))
        else:
            conditions.append(_cond(
                "credit_total", NOT_MET, text,
                f"Only {credits} of your entered grades reach a credit (C6); {credit_minimum} are asked for.",
                entered=credits,
            ))

    if has_source_condition:
        conditions.append(_cond(
            "source_condition", UNKNOWN, "Additional published condition", NEEDS_CONFIRMATION,
        ))

    statuses = {c["status"] for c in conditions}
    overall = NOT_MET if NOT_MET in statuses else UNKNOWN if (UNKNOWN in statuses or not conditions) else MET
    return {
        "status": overall,
        "conditions": conditions,
        "basis": "self_reported",
        "bandsNote": BANDS_NOTE,
        "utmeScoreNote": UTME_SCORE_NOTE,
    }
