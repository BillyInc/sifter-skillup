"""Student-facing role-skill selection.

The source occupation records remain authoritative audit evidence, but their
essential/optional arrays can contain dozens of tasks, duties, procedures and
incidental activities.  The student contract needs a bounded learning path:
core skills first, then a small optional extension.  Role-specific reviewed
selections may be supplied in ``student_skill_selection``; all other roles use
the source order with conservative caps until an item-specific review creates a
better selection.
"""

from __future__ import annotations

from collections.abc import Iterable


MAX_STUDENT_ESSENTIAL = 12
MAX_STUDENT_OPTIONAL = 5


def skill_values(value: object) -> list[str]:
    if isinstance(value, str):
        return [part.strip() for part in value.split("|") if part.strip()]
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                result.append(item.strip())
            elif isinstance(item, dict):
                for key in ("skill", "name", "label", "term"):
                    if isinstance(item.get(key), str) and item[key].strip():
                        result.append(item[key].strip())
                        break
        return result
    return []


def _dedupe(values: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        key = value.casefold()
        if not value or key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def student_skill_lists(role: dict) -> tuple[list[str], list[str]]:
    """Return the bounded, ordered learning path for a role.

    Raw source arrays are not modified.  An explicit reviewed selection wins;
    otherwise the source's essential/optional ordering is retained and capped.
    This keeps the student view usable while making the audit state explicit.
    """
    selection = role.get("student_skill_selection")
    if isinstance(selection, dict):
        explicit_essential = _dedupe(skill_values(selection.get("essential")))
        explicit_optional = _dedupe(skill_values(selection.get("optional")))
        if explicit_essential or explicit_optional:
            return (
                explicit_essential[:MAX_STUDENT_ESSENTIAL],
                [item for item in explicit_optional if item.casefold() not in {x.casefold() for x in explicit_essential}][:MAX_STUDENT_OPTIONAL],
            )

    essential = _dedupe(skill_values(role.get("essential_skills")))
    optional = _dedupe(skill_values(role.get("optional_skills")))
    essential = essential[:MAX_STUDENT_ESSENTIAL]
    essential_keys = {item.casefold() for item in essential}
    optional = [item for item in optional if item.casefold() not in essential_keys][:MAX_STUDENT_OPTIONAL]
    return essential, optional


def selection_metadata(role: dict) -> dict[str, object]:
    selection = role.get("student_skill_selection")
    essential, optional = student_skill_lists(role)
    return {
        "version": selection.get("version") if isinstance(selection, dict) else "2026-09-20.role-learning-core.v1",
        "policy": selection.get("policy") if isinstance(selection, dict) else "Source essential/optional order retained with bounded student caps; raw source evidence remains audit-only.",
        "maxEssential": MAX_STUDENT_ESSENTIAL,
        "maxOptional": MAX_STUDENT_OPTIONAL,
        "explicitReview": bool(isinstance(selection, dict) and (selection.get("essential") or selection.get("optional"))),
        "selectedEssential": essential,
        "selectedOptional": optional,
    }
