"""Restore selected-scope outcomes cleared by an unsafe empty propagation.

The first ambiguous-detail application correctly guarded source-package edits,
but its selected-snapshot propagation treated an empty source outcome as a
replacement value.  Empty source evidence must never erase a populated
selected snapshot.  This one-time repair uses the append-only applied report's
preimages and restores only those exact non-empty values.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
APPLIED = AUDIT / "ccmas_ambiguous_detail_reconciliation_2026-09-29_applied.json"
REPORT = AUDIT / "ambiguous_detail_empty_propagation_guard_2026-09-29.json"


def norm_code(value: object) -> str:
    return " ".join(str(value or "").upper().split())


def main() -> None:
    scopes = json.loads(SCOPES.read_text(encoding="utf-8"))
    applied = json.loads(APPLIED.read_text(encoding="utf-8"))
    restored = []
    for change in applied.get("scope_changes", []):
        row = next((item for item in scopes["rows"] if item.get("jamb_name") == change.get("jamb_name")), None)
        if row is None:
            continue
        for selected in row.get("selected_courses", []):
            source_key = f"{selected.get('source_ccmas_file')}::{selected.get('source_ccmas_programme')}"
            if source_key != change.get("source_key") or norm_code(selected.get("code")) != norm_code(change.get("course_code")):
                continue
            for field_change in change.get("fields", []):
                if field_change.get("field") not in {"learning_outcomes", "content_summary"}:
                    continue
                before = field_change.get("before")
                after = field_change.get("after")
                if before and not after and not selected.get(field_change["field"]):
                    selected[field_change["field"]] = copy.deepcopy(before)
                    restored.append({
                        "jamb_name": row.get("jamb_name"),
                        "source_key": source_key,
                        "course_code": norm_code(selected.get("code")),
                        "field": field_change["field"],
                        "restored_count": len(before) if isinstance(before, list) else 1,
                    })
    SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report = {
        "schema": "2026-09-29.ambiguous-detail-empty-propagation-guard.v1",
        "source_report": str(APPLIED.relative_to(ROOT)),
        "restored": restored,
        "count": len(restored),
        "rule": "empty source content/outcomes never erase a populated selected JAMB snapshot",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"restored": len(restored), "report": str(REPORT)}, indent=2))


if __name__ == "__main__":
    main()
