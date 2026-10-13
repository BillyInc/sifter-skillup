"""Apply the completed global role-to-domain reconciliation ledger.

The ledger adjudicates exact ``domain_id|role_name`` links.  It does not delete
occupation records.  Unsupported links are retained as source evidence and
excluded from student paths; explicit reclassifications create the target link
only when that exact target is not already present.

This is intentionally separate from the subgroup/specialization audit.  A
reclassified role is left with ``specialization_fit_review_status`` set to
``review_required`` until that later semantic pass is complete.
"""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LEDGER_DIR = AUDIT / "role_fit_lanes_2026_10_05" / "GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
OVERLAY_FILES = (ROOT / "emerging_role_overlays.json", ROOT / "thin_domain_role_overlays.json")
META = ROOT / "domain_meta.json"
REPORT = AUDIT / "role_domain_link_reconciliation_2026_10_06.json"
REPORT_MD = AUDIT / "role_domain_link_reconciliation_2026_10_06.md"

EXCLUSION_ACTIONS = {"remove_link_only", "preserve_exclude", "reclassify_exact"}
NO_CHANGE_ACTIONS = {"stale_source_absent_no_active_delta", "retain_supported"}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def action_for(decision: dict) -> str:
    return str(
        decision.get("action")
        or decision.get("recommendation")
        or decision.get("lane_recommendation")
        or ""
    )


def load_decisions() -> list[dict]:
    decisions: list[dict] = []
    for path in sorted(LEDGER_DIR.glob("batch_*_*.json")):
        if "recommendations" not in path.name and "carryforward" not in path.name:
            continue
        document = read_json(path)
        for decision in document.get("decisions") or []:
            row = dict(decision)
            row["_ledger_file"] = str(path.relative_to(ROOT))
            row["_action"] = action_for(row)
            decisions.append(row)
    by_key: dict[str, list[dict]] = {}
    for decision in decisions:
        key = str(decision.get("role_key") or "")
        if not key or "|" not in key:
            raise ValueError(f"Decision has no exact role key: {decision}")
        by_key.setdefault(key, []).append(decision)
    duplicate_keys = {key: rows for key, rows in by_key.items() if len(rows) != 1}
    if duplicate_keys:
        raise ValueError(f"Duplicate ledger decisions: {sorted(duplicate_keys)}")
    actions = {row["_action"] for row in decisions}
    unexpected = actions - EXCLUSION_ACTIONS - NO_CHANGE_ACTIONS
    if unexpected:
        raise ValueError(f"Unexpected ledger actions: {sorted(unexpected)}")
    return decisions


def source_rows(path: Path) -> tuple[object, list[dict]]:
    document = read_json(path)
    if isinstance(document, list):
        return document, document
    if isinstance(document, dict) and isinstance(document.get("roles"), list):
        return document, document["roles"]
    raise ValueError(f"Unsupported role source shape: {path}")


def role_key(row: dict) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def source_index() -> tuple[dict[str, list[tuple[Path, dict]]], dict[Path, tuple[object, list[dict]]]]:
    paths = (ROLE_LIBRARY,) + OVERLAY_FILES
    documents: dict[Path, tuple[object, list[dict]]] = {}
    locations: dict[str, list[tuple[Path, dict]]] = {}
    for path in paths:
        document, rows = source_rows(path)
        documents[path] = (document, rows)
        for row in rows:
            locations.setdefault(role_key(row), []).append((path, row))
    return locations, documents


def domain_names() -> dict[str, str]:
    document = read_json(META)
    result: dict[str, str] = {}
    for domain_id, value in document.items():
        if isinstance(value, dict):
            result[str(domain_id)] = str(value.get("domain_name") or value.get("name") or domain_id)
        else:
            result[str(domain_id)] = str(value)
    return result


def evidence_refs(decision: dict) -> list[str]:
    refs: list[str] = []
    for value in decision.get("evidence_refs") or []:
        if isinstance(value, str):
            refs.append(value)
        elif isinstance(value, dict) and value.get("url"):
            refs.append(str(value["url"]))
    return list(dict.fromkeys(refs))


def append_basis(old: object, new: str) -> str:
    previous = str(old or "").strip()
    if not previous or new in previous:
        return new if not previous else previous
    return f"{previous} {new}"


def next_role_number(rows_by_file: dict[Path, tuple[object, list[dict]]], domain_id: str) -> int:
    values = []
    for _document, rows in rows_by_file.values():
        for row in rows:
            if str(row.get("domain_id")) != domain_id:
                continue
            try:
                values.append(int(row.get("role_number")))
            except (TypeError, ValueError):
                continue
    return max(values, default=0) + 1


def exclusion_reason(decision: dict) -> str:
    action = decision["_action"]
    target = decision.get("alternative_exact_key")
    suffix = f" Proposed destination: {target}." if action == "reclassify_exact" and target else ""
    return (
        "Global role-to-domain reconciliation 2026-10-06: this exact parent-domain "
        f"link is not exposed as a student path ({action}).{suffix} The occupation/source "
        "record is retained for provenance; this does not adjudicate other parent links "
        "or role-to-specialization fit."
    )


def mark_excluded(row: dict, decision: dict) -> bool:
    refs = evidence_refs(decision)
    reason = exclusion_reason(decision)
    changed = False
    updates = {
        "student_path_status": "excluded",
        "student_path_exclusion_reason": append_basis(row.get("student_path_exclusion_reason"), reason),
        "domain_fit_review_status": "unsupported",
        "domain_fit_review_basis": append_basis(row.get("domain_fit_review_basis"), reason),
        "role_domain_reconciliation_status": decision["_action"],
        "role_domain_reconciliation_date": "2026-10-06",
        "role_domain_reconciliation_target": decision.get("alternative_exact_key"),
    }
    if refs:
        old_refs = row.get("domain_fit_review_source_refs")
        old_refs = old_refs if isinstance(old_refs, list) else []
        updates["domain_fit_review_source_refs"] = list(dict.fromkeys([*old_refs, *refs]))
    for key, value in updates.items():
        if row.get(key) != value:
            row[key] = value
            changed = True
    return changed


def make_reclassified_row(source: dict, decision: dict, names: dict[str, str], rows_by_file) -> dict:
    target = str(decision.get("alternative_exact_key") or "")
    target_domain, target_role = target.split("|", 1)
    row = copy.deepcopy(source)
    row["domain_id"] = target_domain
    row["domain_name"] = names.get(target_domain, target_domain)
    row["role_name"] = target_role
    row["role_number"] = next_role_number(rows_by_file, target_domain)
    row["student_path_status"] = "active"
    row.pop("student_path_exclusion_reason", None)
    row["domain_fit_review_status"] = "supported"
    refs = evidence_refs(decision)
    row["domain_fit_review_basis"] = (
        "Global role-to-domain reconciliation 2026-10-06: exact source task evidence "
        f"supports the reclassified parent domain {target_domain}. {decision.get('rationale') or ''}"
    ).strip()
    row["domain_fit_review_source_refs"] = refs or row.get("domain_fit_review_source_refs") or []
    row["role_domain_reconciliation_status"] = "reclassified_in"
    row["role_domain_reconciliation_date"] = "2026-10-06"
    row["role_domain_reconciliation_source_key"] = decision.get("role_key")
    row["role_domain_reconciliation_target"] = target
    row["specialization_fit_review_status"] = "review_required"
    row["specialization_fit_candidate"] = None
    row["specialization_fit_review_basis"] = (
        "Parent-domain reclassification is complete; role-to-subgroup/area-of-specialization "
        "fit remains pending the separate semantic subgroup audit."
    )
    row["specialization_fit_review_source_refs"] = []
    row["semantic_review_date"] = "2026-10-06"
    return row


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    decisions = load_decisions()
    locations, documents = source_index()
    names = domain_names()
    rows_by_file = documents
    changed_files: set[Path] = set()
    changes: list[dict] = []
    action_counts = Counter(row["_action"] for row in decisions)
    target_existing = 0
    target_added = 0
    target_missing = []

    for decision in decisions:
        action = decision["_action"]
        key = decision["role_key"]
        if action in NO_CHANGE_ACTIONS:
            changes.append({"role_key": key, "action": action, "status": "no_canonical_change"})
            continue
        current_locations = locations.get(key) or []
        if len(current_locations) != 1:
            raise ValueError(f"Expected one current source record for {key}, found {len(current_locations)}")
        source_path, source_row = current_locations[0]
        changed = mark_excluded(source_row, decision)
        if changed:
            changed_files.add(source_path)
        record = {
            "role_key": key,
            "action": action,
            "source_file": str(source_path.relative_to(ROOT)),
            "excluded_current_link": True,
            "source_row_changed": changed,
        }
        if action == "reclassify_exact":
            target = str(decision.get("alternative_exact_key") or "")
            if not target or "|" not in target:
                raise ValueError(f"Reclassification has no exact target: {key}")
            if locations.get(target):
                target_existing += 1
                record["target_status"] = "already_present"
                record["target_source_file"] = str(locations[target][0][0].relative_to(ROOT))
            else:
                target_domain = target.split("|", 1)[0]
                if target_domain not in names:
                    raise ValueError(f"Reclassification target has unknown domain: {target}")
                new_row = make_reclassified_row(source_row, decision, names, rows_by_file)
                document, rows = rows_by_file[source_path]
                rows.append(new_row)
                locations[target] = [(source_path, new_row)]
                changed_files.add(source_path)
                target_added += 1
                record["target_status"] = "added"
                record["target_source_file"] = str(source_path.relative_to(ROOT))
            record["target_key"] = target
        changes.append(record)

    if not args.dry_run:
        for path in sorted(changed_files):
            document, _rows = rows_by_file[path]
            write_json(path, document)

    report = {
        "schema_version": "2026-10-06.role-domain-link-reconciliation.v1",
        "dry_run": args.dry_run,
        "source_ledger": str(LEDGER_DIR.relative_to(ROOT)),
        "decision_count": len(decisions),
        "action_counts": dict(sorted(action_counts.items())),
        "excluded_current_links": sum(row["action"] in EXCLUSION_ACTIONS for row in changes),
        "reclassifications": action_counts.get("reclassify_exact", 0),
        "reclassification_targets_already_present": target_existing,
        "reclassification_targets_added": target_added,
        "reclassification_targets_missing": target_missing,
        "changed_files": [str(path.relative_to(ROOT)) for path in sorted(changed_files)],
        "changes": changes,
        "policy": "Unsupported exact parent links are excluded, not deleted. Explicit reclassifications add a target link only when the exact target is absent. Subgroup/specialization fit remains a separate audit.",
    }
    if not args.dry_run:
        write_json(REPORT, report)
        lines = [
            "# Role-to-domain link reconciliation — 2026-10-06",
            "",
            "This local apply step consumes the completed global exact-key review ledger. It changes student-path eligibility, not the underlying occupation identity or source evidence.",
            "",
            "## Result",
            "",
            f"- Ledger decisions: **{len(decisions):,}** exact role-domain keys.",
            f"- Current links excluded from student paths: **{report['excluded_current_links']:,}**.",
            f"- Explicit reclassifications: **{report['reclassifications']:,}**.",
            f"- Reclassification targets already present: **{target_existing:,}**.",
            f"- Reclassification target links added: **{target_added:,}**.",
            f"- Stale/no-active-delta records left unchanged: **{action_counts.get('stale_source_absent_no_active_delta', 0):,}**.",
            "",
            "The current parent-domain link is excluded only when the ledger says `remove_link_only`, `preserve_exclude`, or `reclassify_exact`. The occupation record remains available for provenance and other independently supported parent links. Newly added target links are marked `specialization_fit_review_status=review_required`; they must pass the separate role-to-subgroup/area-of-specialization audit before downstream subgroup display is treated as complete.",
            "",
            "No SQL or live deployment was performed.",
        ]
        REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "dry_run": args.dry_run,
        "decision_count": len(decisions),
        "action_counts": dict(sorted(action_counts.items())),
        "excluded_current_links": report["excluded_current_links"],
        "reclassification_targets_already_present": target_existing,
        "reclassification_targets_added": target_added,
        "changed_files": [str(path.relative_to(ROOT)) for path in sorted(changed_files)],
    }, indent=2))


if __name__ == "__main__":
    main()
