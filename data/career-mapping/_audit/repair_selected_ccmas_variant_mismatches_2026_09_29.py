"""Align selected JAMB course snapshots to the matching CCMAS source variant.

Some CCMAS packages legitimately repeat a course code under different pathway
rows.  A code-only lookup can therefore compare a selected title/content row
with the wrong same-code source variant.  This pass selects the source variant
using the non-outcome fields first, then copies the complete authoritative
course payload into every matching JAMB snapshot.  It never merges variants.
"""

from __future__ import annotations

import copy
import difflib
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "selected_ccmas_variant_repair_2026-09-29.json"
TODAY = "2026-09-29"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def non_outcome_signature(course: dict[str, Any]) -> tuple[Any, ...]:
    return (
        norm(course.get("title")),
        course.get("units"),
        course.get("status"),
        course.get("lecture_hours", course.get("lh")),
        course.get("practical_hours", course.get("ph")),
        norm(course.get("content_summary")),
    )


def variant_score(selected: dict[str, Any], source: dict[str, Any]) -> tuple[int, float, float]:
    selected_sig = non_outcome_signature(selected)
    source_sig = non_outcome_signature(source)
    exact_fields = sum(left == right for left, right in zip(selected_sig, source_sig))
    text_left = " ".join(str(value) for value in selected_sig if isinstance(value, str))
    text_right = " ".join(str(value) for value in source_sig if isinstance(value, str))
    content_ratio = difflib.SequenceMatcher(None, text_left, text_right).ratio()
    selected_outcomes = " ".join(str(value) for value in (selected.get("learning_outcomes") or []))
    source_outcomes = " ".join(str(value) for value in (source.get("learning_outcomes") or source.get("skills_learned") or source.get("outcomes") or []))
    outcome_ratio = difflib.SequenceMatcher(None, selected_outcomes.casefold(), source_outcomes.casefold()).ratio()
    return exact_fields, outcome_ratio, content_ratio


def main() -> None:
    scopes = load(SCOPES)
    source_packages: dict[str, Any] = {}
    changes: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses") or []:
            source_file = str(selected.get("source_ccmas_file") or "")
            programme = str(selected.get("source_ccmas_programme") or "")
            code = str(selected.get("code") or "").strip().upper()
            if not source_file or not programme or not code:
                continue
            if source_file not in source_packages:
                source_packages[source_file] = load(ROOT / "ccmas" / source_file)
            package = source_packages[source_file]
            candidates: list[dict[str, Any]] = []
            for source_programme in package.get("programmes", []):
                if source_programme.get("name") != programme:
                    continue
                candidates = [course for course in source_programme.get("courses", []) if str(course.get("code") or "").strip().upper() == code]
                break
            if not candidates:
                continue
            ranked = sorted(candidates, key=lambda candidate: variant_score(selected, candidate), reverse=True)
            best = ranked[0]
            score = variant_score(selected, best)
            if len(ranked) > 1 and score == variant_score(selected, ranked[1]):
                unresolved.append({"jamb_name": row.get("jamb_name"), "code": code, "source_file": source_file, "source_programme": programme, "candidate_count": len(candidates), "reason": "tied source variants"})
                continue
            selected_before = copy.deepcopy(selected)
            # Preserve the JAMB scope's explicit provenance fields, but make
            # the course identity/detail fields and outcomes match the exact
            # source variant used for this snapshot.
            for field in ("title", "units", "status", "lecture_hours", "practical_hours", "content_summary", "lh", "ph"):
                source_field = field
                if field == "lecture_hours":
                    source_field = "lh"
                elif field == "practical_hours":
                    source_field = "ph"
                if source_field in best:
                    selected[field] = copy.deepcopy(best[source_field])
            outcomes = copy.deepcopy(best.get("learning_outcomes") or best.get("skills_learned") or best.get("outcomes") or [])
            selected["learning_outcomes"] = outcomes
            selected["skills_learned"] = copy.deepcopy(outcomes)
            for field in ("outcomes_basis", "outcome_evidence_status", "outcomes_source_url", "outcomes_source_locator"):
                if field in best:
                    selected[field] = copy.deepcopy(best[field])
            if selected != selected_before:
                changes.append({
                    "jamb_name": row.get("jamb_name"),
                    "code": code,
                    "source_file": source_file,
                    "source_programme": programme,
                    "selection_score": {"exact_non_outcome_fields": score[0], "outcome_similarity": round(score[1], 6), "text_similarity": round(score[2], 6)},
                    "changed_fields": sorted({key for key in set(selected) | set(selected_before) if selected.get(key) != selected_before.get(key)}),
                })

    scopes["repair_notes"] = scopes.get("repair_notes", []) + [{
        "date": TODAY,
        "repair": "selected JAMB course snapshots aligned to their matching CCMAS duplicate-code variant",
        "script": Path(__file__).name,
    }]
    SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report = {
        "schema": "2026-09-29.selected-ccmas-variant-repair.v1",
        "generated_on": TODAY,
        "changed_snapshot_rows": len(changes),
        "unresolved_ties": len(unresolved),
        "changes": changes,
        "unresolved": unresolved,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"changed_snapshot_rows": len(changes), "unresolved_ties": len(unresolved)}, indent=2))


if __name__ == "__main__":
    main()
