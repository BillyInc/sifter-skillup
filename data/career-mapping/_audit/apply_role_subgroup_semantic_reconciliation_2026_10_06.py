"""Apply only deterministic role-to-subgroup route corrections.

The semantic reconciliation register is deliberately conservative.  This
applier handles only its two explicit, mechanically testable dispositions:

* ``wrong subgroup``: the task evidence score selects another visible
  subgroup by the register's strict margin rule; and
* ``direct-domain-role``: the task evidence supports the parent domain while
  no visible subgroup scope is supported.

The role's ISCO code is preserved.  A separate routing field is used by the
seed generator, and the register is retained as the audit provenance.  All
conditional, supported, missing-layer, gated, and sparse-role proposals stay
review-only.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REGISTER = AUDIT / "role_to_subgroup_semantic_reconciliation_2026_10_06_010.json"
STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
THIN_OVERLAYS = ROOT / "thin_domain_role_overlays.json"
EMERGING_OVERLAYS = ROOT / "emerging_role_overlays.json"
REPORT = AUDIT / "role_subgroup_semantic_reconciliation_apply_2026_10_06.json"
REPORT_MD = AUDIT / "ROLE_SUBGROUP_SEMANTIC_RECONCILIATION_APPLY_2026_10_06.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def rows_from(path: Path) -> list[dict]:
    data = load(path)
    if isinstance(data, list):
        return data
    rows = data.get("roles") if isinstance(data, dict) else None
    return rows if isinstance(rows, list) else []


def write_rows(path: Path, rows: list[dict]) -> None:
    data = load(path)
    if isinstance(data, list):
        path.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        return
    data["roles"] = rows
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def role_key(row: dict) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def subgroup_map() -> dict[str, dict[str, dict]]:
    structure = load(STRUCTURE)
    return {
        domain_id: {
            str(row.get("isco_submajor")): row
            for row in (domain.get("subgroups") or [])
        }
        for domain_id, domain in structure.items()
    }


def main() -> None:
    register = load(REGISTER)
    entries = register.get("entries") or []
    structure = subgroup_map()
    source_rows = {
        str(ROLE_LIBRARY): rows_from(ROLE_LIBRARY),
        str(THIN_OVERLAYS): rows_from(THIN_OVERLAYS),
        str(EMERGING_OVERLAYS): rows_from(EMERGING_OVERLAYS),
    }
    locations: dict[str, list[tuple[Path, dict]]] = {}
    for path_text, rows in source_rows.items():
        for row in rows:
            locations.setdefault(role_key(row), []).append((Path(path_text), row))

    changes = []
    skipped = []
    target_counts = Counter()
    for entry in entries:
        classification = entry.get("classification")
        if classification not in {"wrong subgroup", "direct-domain-role"}:
            continue
        key = str(entry.get("role_key"))
        matches = locations.get(key) or []
        if len(matches) != 1:
            skipped.append({"role_key": key, "reason": "role_source_match_not_unique", "match_count": len(matches)})
            continue
        domain_id = str(entry.get("domain_id"))
        comparison = entry.get("comparison") or {}
        best = comparison.get("best_subgroup") or {}
        target_code = str(best.get("isco_submajor") or "")
        target = structure.get(domain_id, {}).get(target_code)
        if classification == "wrong subgroup":
            current_code = str(entry.get("subgroup_code") or "")
            current_score = int((comparison.get("current_subgroup") or {}).get("score") or 0)
            best_score = int(best.get("score") or 0)
            if not re.fullmatch(r"\d{2}", target_code) or not target or str(target.get("data_state") or "").casefold() in {"excluded", "review_only", "audit_only"}:
                skipped.append({"role_key": key, "reason": "target_subgroup_not_active", "target_code": target_code})
                continue
            if not (current_score <= 1 and best_score >= 4 and best_score - current_score >= 2 and target_code != current_code):
                skipped.append({"role_key": key, "reason": "strict_margin_rule_failed", "target_code": target_code})
                continue
            fit_status = "semantic_reassigned"
            field_value = target_code
            action = "reassign_subgroup_route"
        else:
            fit_status = "direct_domain_role"
            field_value = None
            action = "remove_subgroup_route"

        path, row = matches[0]
        before = {
            "subgroup_fit_status": row.get("subgroup_fit_status"),
            "subgroup_override_isco_submajor": row.get("subgroup_override_isco_submajor"),
            "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
        }
        row["subgroup_fit_status"] = fit_status
        if field_value is None:
            row.pop("subgroup_override_isco_submajor", None)
        else:
            row["subgroup_override_isco_submajor"] = field_value
        row["subgroup_fit_review_basis"] = str(entry.get("classification_reason") or "")
        row["subgroup_fit_review_source_register"] = str(REGISTER.relative_to(ROOT))
        row["subgroup_fit_semantic_signoff"] = False
        changes.append({
            "role_key": key,
            "source_file": str(path.relative_to(ROOT)),
            "action": action,
            "classification": classification,
            "target_subgroup_code": field_value,
            "target_subgroup_label": str(target.get("label") or "") if target else None,
            "before": before,
        })
        target_counts[action] += 1

    changed_paths = {item["source_file"] for item in changes}
    for path_text, rows in source_rows.items():
        if str(Path(path_text).relative_to(ROOT)) in changed_paths:
            write_rows(Path(path_text), rows)

    report = {
        "schema_version": "2026-10-06.role-subgroup-semantic-apply.v1",
        "source_register": str(REGISTER.relative_to(ROOT)),
        "policy": "Only strict wrong-subgroup margin decisions and explicit direct-domain-role dispositions were applied; all other classifications remain review-only.",
        "action_counts": dict(sorted(target_counts.items())),
        "change_count": len(changes),
        "skipped_count": len(skipped),
        "changes": changes,
        "skipped": skipped,
        "changed_files": sorted(changed_paths),
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Role→subgroup semantic reconciliation apply checkpoint — 2026-10-06",
        "",
        "Applied only strict, evidence-backed route dispositions from the semantic register. The ISCO identity remains unchanged; routing is stored separately.",
        "",
        f"- Changes applied: **{len(changes)}**.",
        f"- Skipped: **{len(skipped)}**.",
        f"- Action counts: `{json.dumps(dict(sorted(target_counts.items())), sort_keys=True)}`.",
        "- Conditional, supported, missing-layer, sparse-role and gated cases remain review-only.",
        "- Semantic sign-off remains false; this is a deterministic route correction, not academic approval.",
        "",
        f"Register: `{REGISTER.relative_to(ROOT)}`.",
        f"Machine-readable apply report: `{REPORT.relative_to(ROOT)}`.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"change_count": len(changes), "skipped_count": len(skipped), "action_counts": dict(target_counts), "changed_files": sorted(changed_paths)}, indent=2))


if __name__ == "__main__":
    main()
