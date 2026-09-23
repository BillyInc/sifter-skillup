"""Audit the bounded student role-learning contract against raw role evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from _role_learning_core import MAX_STUDENT_ESSENTIAL, MAX_STUDENT_OPTIONAL, skill_values, student_skill_lists


HERE = Path(__file__).resolve().parents[1]
OUT_JSON = HERE / "_audit" / "role_learning_core_audit_2026-09-21.json"
OUT_MD = HERE / "_audit" / "ROLE_LEARNING_CORE_AUDIT_2026-09-21.md"


def load_roles() -> list[dict]:
    paths = [
        HERE / "role_library_v3_cleaned.json",
        HERE / "emerging_role_overlays.json",
        HERE / "thin_domain_role_overlays.json",
    ]
    merged: dict[str, dict] = {}
    for path in paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        values = data if isinstance(data, list) else data.get("roles") or []
        for role in values:
            key = f"{role.get('domain_id')}|{role.get('role_name')}"
            if key.strip("|"):
                merged.setdefault(key, role)
    return list(merged.values())


def main() -> None:
    roles = load_roles()
    raw_over_cap: list[dict] = []
    explicit: list[str] = []
    rows: list[dict] = []
    for role in roles:
        raw_essential = skill_values(role.get("essential_skills"))
        raw_optional = skill_values(role.get("optional_skills"))
        selected_essential, selected_optional = student_skill_lists(role)
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        if isinstance(role.get("student_skill_selection"), dict) and (
            role["student_skill_selection"].get("essential") or role["student_skill_selection"].get("optional")
        ):
            explicit.append(key)
        if len(raw_essential) > MAX_STUDENT_ESSENTIAL or len(raw_optional) > MAX_STUDENT_OPTIONAL:
            raw_over_cap.append({
                "roleKey": key,
                "rawEssential": len(raw_essential),
                "rawOptional": len(raw_optional),
                "studentEssential": len(selected_essential),
                "studentOptional": len(selected_optional),
            })
        rows.append({
            "roleKey": key,
            "studentEssential": selected_essential,
            "studentOptional": selected_optional,
            "rawEssentialCount": len(raw_essential),
            "rawOptionalCount": len(raw_optional),
        })
    payload = {
        "schemaVersion": "2026-09-21.role-learning-core-audit.v1",
        "roles": len(roles),
        "maxStudentEssential": MAX_STUDENT_ESSENTIAL,
        "maxStudentOptional": MAX_STUDENT_OPTIONAL,
        "rolesWithRawValuesOverCap": len(raw_over_cap),
        "explicitlyReviewedRoles": len(explicit),
        "explicitlyReviewedRoleKeys": explicit,
        "allStudentRowsWithinCaps": all(
            len(row["studentEssential"]) <= MAX_STUDENT_ESSENTIAL and len(row["studentOptional"]) <= MAX_STUDENT_OPTIONAL
            for row in rows
        ),
        "rawOverCapSample": sorted(raw_over_cap, key=lambda row: (-row["rawEssential"], -row["rawOptional"], row["roleKey"]))[:100],
        "businessStudiesTeacherRows": [
            row for row in rows if "business studies and economics teacher secondary school" in row["roleKey"]
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(
        "\n".join([
            "# Role learning-core audit",
            "",
            "Generated: 2026-09-21",
            "",
            f"- Canonical merged roles audited: **{payload['roles']}**",
            f"- Student cap: **{MAX_STUDENT_ESSENTIAL} essential / {MAX_STUDENT_OPTIONAL} optional**",
            f"- Roles with raw source arrays over the student cap: **{payload['rolesWithRawValuesOverCap']}**",
            f"- Explicitly reviewed role selections: **{payload['explicitlyReviewedRoles']}**",
            f"- All student rows within caps: **{payload['allStudentRowsWithinCaps']}**",
            "",
            "Raw occupational arrays remain source/admin evidence. The student contract uses the bounded ordered learning path and does not claim that every source task is a skill the learner must acquire.",
            "",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({key: payload[key] for key in ("roles", "rolesWithRawValuesOverCap", "explicitlyReviewedRoles", "allStudentRowsWithinCaps")}, indent=2))


if __name__ == "__main__":
    main()
