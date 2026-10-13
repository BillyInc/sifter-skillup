"""Persist the current role -> corrected area-of-practice audit statuses.

This annotates, but does not silently promote, the two remaining audit classes
from the semantic register.  ``supported_candidate`` is deterministic
screening evidence, not final academic sign-off; conditional rows remain
review-required.  Route changes are handled only by the guarded reconciliation
applier.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REGISTER = AUDIT / "role_to_subgroup_semantic_reconciliation_2026_10_06_010.json"
SOURCE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
REPORT = AUDIT / "role_area_fit_audit_status_apply_2026_10_06.json"
REPORT_MD = AUDIT / "ROLE_AREA_FIT_AUDIT_STATUS_APPLY_2026_10_06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def container_rows(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    rows = payload.get("roles") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        raise ValueError(f"Expected roles list in {path}")
    return payload, rows


def key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def write(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    register = load(REGISTER)
    # The semantic reconciliation register stores its decision under
    # ``classification`` (supported/conditional), while the later audit
    # register uses the more explicit ``disposition`` names.  Accept both
    # representations so the status pass cannot silently produce zero rows
    # merely because it was pointed at the earlier checkpoint.
    decisions: dict[str, tuple[dict[str, Any], str]] = {}
    for row in register.get("entries", []):
        raw_disposition = row.get("disposition")
        classification = row.get("classification")
        if raw_disposition in {"supported_candidate", "conditional_insufficient_evidence"}:
            disposition = str(raw_disposition)
        elif classification == "supported":
            disposition = "supported_candidate"
        elif classification == "conditional":
            disposition = "conditional_insufficient_evidence"
        else:
            continue
        decisions[str(row.get("role_key"))] = (row, disposition)
    payloads: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in SOURCE_FILES:
        payload, rows = container_rows(path)
        payloads[path] = payload
        for row in rows:
            locations.setdefault(key(row), []).append((path, row))

    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for role_key, (decision, disposition) in decisions.items():
        matches = locations.get(role_key) or []
        if len(matches) != 1:
            skipped.append({"role_key": role_key, "reason": "source_match_not_unique", "match_count": len(matches)})
            continue
        path, row = matches[0]
        if str(row.get("student_path_status") or "").casefold() == "excluded":
            skipped.append({"role_key": role_key, "reason": "role_already_excluded_from_student_path"})
            continue
        status = (
            "supported_candidate"
            if disposition == "supported_candidate"
            else "conditional_review_required"
        )
        before = {
            "subgroup_fit_status": row.get("subgroup_fit_status"),
            "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
            "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
        }
        # Do not overwrite a prior deterministic route repair.
        if row.get("subgroup_fit_status") in {"semantic_reassigned", "direct_domain_role"}:
            skipped.append({"role_key": role_key, "reason": "deterministic_route_status_preserved"})
            continue
        row["subgroup_fit_status"] = status
        row["subgroup_fit_review_basis"] = str(decision.get("disposition_reason") or "")
        row["subgroup_fit_review_source_register"] = str(REGISTER.relative_to(ROOT)).replace("/", "\\")
        row["subgroup_fit_semantic_signoff"] = False
        row["subgroup_fit_parent_domain_gate"] = "active_parent_domain_path_not_explicitly_excluded"
        after = {
            "subgroup_fit_status": row.get("subgroup_fit_status"),
            "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
            "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
        }
        if before != after:
            changes.append({"role_key": role_key, "source_file": str(path.relative_to(ROOT)), "disposition": disposition, "before": before, "after": after})

    if args.apply:
        for path, payload in payloads.items():
            write(path, payload)

    report = {
        "schema_version": "2026-10-06.role-area-fit-audit-status.v1",
        "dry_run": not args.apply,
        "source_register": str(REGISTER.relative_to(ROOT)),
        "decision_count": len(decisions),
        "change_count": len(changes),
        "skipped_count": len(skipped),
        "action_counts": dict(Counter(row["disposition"] for row in changes)),
        "changes": changes,
        "skipped": skipped,
        "guards": {
            "isco_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_final_fit_proof": False,
            "parent_domain_gate_required": True,
            "conditional_rows_forced": False,
            "canonical_taxonomy_changed": False,
        },
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Role → area-of-practice audit status application — 2026-10-06",
            "",
            f"Mode: {'APPLIED' if args.apply else 'DRY RUN'}.",
            "",
            f"Decision rows: **{len(decisions)}**; metadata changes: **{len(changes)}**; skipped: **{len(skipped)}**.",
            "",
            "Supported candidates are screening evidence, not final academic sign-off. Conditional rows remain review-required. ISCO membership and existing subgroup membership were not used as proof.",
            "",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({k: report[k] for k in ("dry_run", "decision_count", "change_count", "skipped_count", "action_counts")}, indent=2))


if __name__ == "__main__":
    main()
