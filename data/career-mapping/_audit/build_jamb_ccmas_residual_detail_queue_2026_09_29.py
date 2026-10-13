"""Materialize residual JAMB selected-course drift after original-PDF repairs."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CROSSWALK = AUDIT / "ccmas_original_document_crosswalk_2026-09-29.json"
OUT_JSON = AUDIT / "jamb_ccmas_residual_detail_queue_2026-09-29.json"
OUT_MD = AUDIT / "jamb_ccmas_residual_detail_queue_2026-09-29.md"


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def code_key(value: Any) -> str:
    return " ".join(str(value or "").upper().split())


def main() -> None:
    scopes = json.loads(SCOPES.read_text(encoding="utf-8"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8"))
    package_courses: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for row in crosswalk.get("course_rows", []):
        key = (row.get("source_file"), norm(row.get("programme")), code_key(row.get("course_code")))
        package_courses.setdefault(key, []).append(row)

    # Read canonical package values directly because the crosswalk intentionally
    # stores provenance and candidate state, not the full mutable course body.
    current: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        for programme in document.get("programmes", []):
            for course in programme.get("courses", []):
                key = (path.name, norm(programme.get("name")), code_key(course.get("code")))
                current.setdefault(key, []).append(course)

    field_pairs = {
        "title": "title",
        "units": "units",
        "status": "status",
        "lecture_hours": "lh",
        "practical_hours": "ph",
        "learning_outcomes": "skills_learned",
        "content_summary": "content_summary",
    }
    residuals: list[dict[str, Any]] = []
    for jamb_row in scopes.get("rows", []):
        jamb_name = jamb_row.get("jamb_name")
        for selected in jamb_row.get("selected_courses", []):
            source_file = selected.get("source_ccmas_file")
            programme = selected.get("source_ccmas_programme")
            code = code_key(selected.get("code"))
            key = (source_file, norm(programme), code)
            candidates = current.get(key, [])
            if len(candidates) != 1:
                continue
            source = candidates[0]
            fields: dict[str, dict[str, Any]] = {}
            for selected_field, source_field in field_pairs.items():
                before = selected.get(selected_field)
                after = source.get(source_field)
                if selected_field in {"learning_outcomes", "content_summary"} and not after:
                    continue
                same = norm(before) == norm(after) if selected_field in {"title", "status"} else before == after
                if not same:
                    fields[selected_field] = {"selected": before, "current_ccmas": after}
            if not fields:
                continue
            provenance = package_courses.get(key, [{}])
            provenance = provenance[0] if len(provenance) == 1 else {}
            residuals.append({
                "jamb_name": jamb_name,
                "source_file": source_file,
                "programme": programme,
                "course_code": code,
                "fields": fields,
                "source_candidate_state": provenance.get("source_candidate_state"),
                "source_candidate_count": provenance.get("source_candidate_count"),
                "source_page_candidates": provenance.get("source_page_candidates", []),
                "official_pdf": provenance.get("official_pdf"),
                "official_pdf_sha256": provenance.get("official_pdf_sha256"),
                "jamb_selected_occurrence_count": provenance.get("jamb_selected_occurrence_count"),
                "disposition": "targeted_source_review_or_guarded_sync",
            })

    field_counts = Counter(field for row in residuals for field in row["fields"])
    state_counts = Counter(row.get("source_candidate_state") for row in residuals)
    output = {
        "schema": "2026-09-29.jamb-ccmas-residual-detail-queue.v1",
        "generated_on": date.today().isoformat(),
        "status": "residual_selected_scope_drift_materialized",
        "scope": {
            "jamb_scope_rows": len(scopes.get("rows", [])),
            "residual_occurrences": len(residuals),
            "residual_unique_package_course_keys": len({(r["source_file"], r["programme"], r["course_code"]) for r in residuals}),
        },
        "field_counts": dict(sorted(field_counts.items())),
        "source_candidate_state_counts": dict(sorted((str(k), v) for k, v in state_counts.items())),
        "rules": [
            "This queue compares selected JAMB snapshots with the current local CCMAS course row only.",
            "It does not decide whether the CCMAS row itself is correct; the original PDF candidate state and page evidence are retained.",
            "Rows with ambiguous package course codes are excluded from this unique-key queue and remain in the duplicate/context queue.",
            "No component selection or downstream domain mapping is changed by this artifact.",
        ],
        "rows": residuals,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB↔CCMAS residual detail queue — 2026-09-29",
        "",
        "This is the exception-only queue after the original-PDF guarded repair pass.",
        "",
        f"- JAMB scope rows scanned: **{output['scope']['jamb_scope_rows']}**",
        f"- Residual selected-course occurrences: **{output['scope']['residual_occurrences']}**",
        f"- Residual unique package/course keys: **{output['scope']['residual_unique_package_course_keys']}**",
        "",
        "## Fields",
        "",
    ]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(field_counts.items()))
    lines += ["", "## Source candidate states", ""]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted((str(k), v) for k, v in state_counts.items()))
    lines += ["", "The full rows retain the original PDF path, checksum, page candidates and current source-candidate state.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": output["scope"], "field_counts": output["field_counts"], "source_candidate_state_counts": output["source_candidate_state_counts"]}, indent=2))


if __name__ == "__main__":
    main()
