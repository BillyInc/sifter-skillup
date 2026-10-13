"""Apply completed exact-key role-agent review decisions.

The agent queues are evidence ledgers, not permission to infer routes from a
title, ISCO/ESCO membership, or existing subgroup membership. This pass:

* applies only the conditional-lane parent-domain decisions to matching current
  role rows;
* applies supported role -> area-of-specialization routes only when the agent
  recorded a concrete canonical area key and the parent-domain gate is
  supported;
* records review-required and parent-blocked decisions explicitly; and
* never edits the domain/area taxonomy or creates a stale role.

The canonical role files are intentionally written only with ``--apply``.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
STRUCTURE = ROOT / "domain_structure.json"
CONDITIONAL_FILES = (
    AUDIT / "role_review_agents" / "conditional_batch_001_005" / "conditional_batch_001_005_decisions.json",
    AUDIT / "role_review_agents" / "conditional_batch_006_010" / "conditional_batches_006_011_final_checkpoint.json",
)
AREA_FILES = (
    (AUDIT / "role_review_agents" / "area_batch_001_005" / "area_batch_001_005_results.json", "groups"),
    (AUDIT / "role_review_agents" / "area_batch_006_010" / "area_batch_006_010_results.json", "records"),
    (AUDIT / "role_review_agents" / "area_batch_011_033" / "area_batch_011_033_results.json", "records"),
)
REPORT = AUDIT / "ROLE_AGENT_REVIEW_DECISION_APPLY_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_AGENT_REVIEW_DECISION_APPLY_2026_10_07.md"
RUN_DATE = "2026-10-07"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows_in(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("roles"), list):
        return payload["roles"]
    raise ValueError("Unsupported canonical role source shape")


def clean(value: Any) -> str:
    return str(value or "").strip()


def normalized_role_key(raw: Any) -> str:
    """Normalize an exact queue key without doing semantic title matching."""
    text = clean(raw)
    if "|" not in text:
        return text.casefold()
    domain, role = text.split("|", 1)
    domain = re.sub(r"[^a-z0-9]+", " ", domain.casefold()).strip()
    role = re.sub(r"[^a-z0-9]+", " ", role.casefold()).strip()
    return f"{domain}|{role}"


def key(row: dict[str, Any]) -> str:
    # The queue generator stores role titles in normalized lowercase while
    # canonical sources preserve display capitalization. This is still an
    # exact domain + role identity match; punctuation/case normalization is
    # not semantic title matching and never creates a new role.
    return normalized_role_key(f"{row.get('domain_id')}|{row.get('role_name')}")


def refs(value: Any) -> list[str]:
    result: list[str] = []
    values = value if isinstance(value, list) else [value]
    for item in values:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
        elif isinstance(item, dict):
            url = item.get("url")
            if url:
                result.append(str(url).strip())
    return list(dict.fromkeys(result))


def append_refs(old: Any, new: list[str]) -> list[str]:
    return list(dict.fromkeys(refs(old) + refs(new)))


def append_basis(old: Any, new: str) -> str:
    old_text = clean(old)
    new_text = clean(new)
    if not new_text:
        return old_text
    if not old_text:
        return new_text
    if new_text in old_text:
        return old_text
    return f"{old_text} {new_text}"


def load_current() -> tuple[dict[Path, Any], dict[str, list[tuple[Path, dict[str, Any]]]]]:
    containers: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in ROLE_FILES:
        payload = read_json(path)
        containers[path] = payload
        for row in rows_in(payload):
            locations.setdefault(key(row), []).append((path, row))
    return containers, locations


def load_conditional() -> dict[str, dict[str, Any]]:
    decisions: dict[str, dict[str, Any]] = {}
    for path in CONDITIONAL_FILES:
        payload = read_json(path)
        rows = payload.get("decisions") if isinstance(payload, dict) else None
        if not isinstance(rows, list):
            raise ValueError(f"Conditional ledger has no decisions: {path}")
        for row in rows:
            role_key = normalized_role_key(row.get("role_key"))
            if not role_key:
                continue
            if role_key in decisions:
                raise ValueError(f"Duplicate conditional decision: {role_key}")
            decisions[role_key] = row
    return decisions


def load_area() -> dict[str, dict[str, Any]]:
    decisions: dict[str, dict[str, Any]] = {}
    for path, mode in AREA_FILES:
        payload = read_json(path)
        if mode == "groups":
            rows: list[dict[str, Any]] = []
            for group in payload.get("groups") or []:
                rows.extend(x for x in group.get("members") or [] if isinstance(x, dict))
        else:
            rows = [x for x in payload.get("records") or [] if isinstance(x, dict)]
        for row in rows:
            role_key = normalized_role_key(row.get("role_key"))
            if not role_key:
                continue
            if role_key in decisions:
                raise ValueError(f"Duplicate area decision: {role_key}")
            decisions[role_key] = row
    return decisions


def parent_decision(row: dict[str, Any]) -> str:
    value = clean(row.get("disposition")).casefold()
    if value == "review_required":
        return "conditional"
    if value in {"supported", "unsupported"}:
        return value
    raise ValueError(f"Unknown parent decision {value!r} for {row.get('role_key')}")


def area_parts(row: dict[str, Any]) -> tuple[str, str, str, list[str]]:
    area = row.get("area_route") or row.get("area_fit") or {}
    status = clean(area.get("disposition") or area.get("status"))
    area_key = clean(area.get("selected_area_key") or area.get("area_key"))
    area_label = clean(area.get("selected_area_label") or area.get("label"))
    source_refs = refs(area.get("source_refs"))
    source_refs += refs(row.get("task_source_refs"))
    parent = row.get("parent_fit") or row.get("parent_domain_fit") or {}
    source_refs += refs(parent.get("source_refs"))
    return status, area_key, area_label, list(dict.fromkeys(source_refs))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    structure = read_json(STRUCTURE)
    area_keys = {
        area.get("area_id")
        for domain in structure.values()
        if isinstance(domain, dict)
        for area in domain.get("areas_of_specialization") or []
        if area.get("area_id")
    }
    containers, locations = load_current()
    conditional = load_conditional()
    area = load_area()
    parent_counts = Counter(parent_decision(x) for x in conditional.values())
    area_counts = Counter(area_parts(x)[0] for x in area.values())

    changes: list[dict[str, Any]] = []
    stale_parent: list[str] = []
    parent_mismatches: list[dict[str, Any]] = []
    parent_applied = Counter()
    parent_held = Counter()

    # Parent-domain decisions are applied first because the area gate depends
    # on the resulting exact role-domain status.
    for role_key, decision in sorted(conditional.items()):
        matches = locations.get(role_key) or []
        if not matches:
            stale_parent.append(role_key)
            continue
        status = parent_decision(decision)
        for path, row in matches:
            current = clean(row.get("domain_fit_review_status"))
            if current not in {"conditional", status}:
                parent_mismatches.append({"role_key": role_key, "current": current, "decision": status})
                continue
            if status == "conditional":
                parent_held["review_required"] += 1
                continue
            before = {
                "domain_fit_review_status": row.get("domain_fit_review_status"),
                "student_path_status": row.get("student_path_status"),
                "student_path_exclusion_reason": row.get("student_path_exclusion_reason"),
            }
            if args.apply and current == "conditional":
                row["domain_fit_review_status"] = status
                row["domain_fit_review_basis"] = append_basis(
                    row.get("domain_fit_review_basis"),
                    f"Role-agent exact-key review 2026-10-07: {clean(decision.get('rule_rationale') or decision.get('role_task_evidence'))}",
                )
                row["domain_fit_review_source_refs"] = append_refs(
                    row.get("domain_fit_review_source_refs"),
                    refs(decision.get("existing_source_refs")),
                )
                row["role_domain_lane_review_date"] = RUN_DATE
                row["role_domain_lane_review_status"] = f"reviewed_{status}"
                row["role_domain_lane_review_sources"] = append_refs(
                    row.get("role_domain_lane_review_sources"),
                    ["_audit/role_review_agents/conditional_role_domain_exact_key_ledgers"],
                )
                if status == "unsupported":
                    row["student_path_status"] = "excluded"
                    row["student_path_exclusion_reason"] = append_basis(
                        row.get("student_path_exclusion_reason"),
                        "Exact role-to-parent-domain path unsupported by the role-agent task review; occupation retained for provenance.",
                    )
            after = {
                "domain_fit_review_status": row.get("domain_fit_review_status"),
                "student_path_status": row.get("student_path_status"),
                "student_path_exclusion_reason": row.get("student_path_exclusion_reason"),
            }
            if before != after:
                parent_applied[status] += 1
                changes.append({"role_key": role_key, "source_file": str(path.relative_to(ROOT)), "layer": "parent_domain", "status": status, "before": before, "after": after})

    area_applied = Counter()
    area_held = Counter()
    stale_area: list[str] = []
    area_conflicts: list[dict[str, Any]] = []
    for role_key, decision in sorted(area.items()):
        matches = locations.get(role_key) or []
        if not matches:
            stale_area.append(role_key)
            continue
        status, area_key, area_label, source_refs = area_parts(decision)
        if status in {"supported", "supported_area_candidate"} and area_key not in area_keys:
            raise ValueError(f"Agent selected unknown canonical area {area_key!r} for {role_key}")
        parent_status = clean(matches[0][1].get("domain_fit_review_status"))
        for path, row in matches:
            before = {
                "specialization_fit_review_status": row.get("specialization_fit_review_status"),
                "specialization_fit_status": row.get("specialization_fit_status"),
                "specialization_fit_area_key": row.get("specialization_fit_area_key"),
                "specialization_fit_domain_gate": row.get("specialization_fit_domain_gate"),
            }
            if status in {"supported", "supported_area_candidate"} and parent_status == "supported":
                if row.get("specialization_fit_status") == "supported" and clean(row.get("specialization_fit_area_key")) not in {"", area_key}:
                    area_conflicts.append({"role_key": role_key, "existing": row.get("specialization_fit_area_key"), "agent": area_key})
                    continue
                if args.apply:
                    row["specialization_fit_review_status"] = "supported"
                    row["specialization_fit_status"] = "supported"
                    row["specialization_fit_area_key"] = area_key
                    row["specialization_fit_candidate"] = area_label
                    row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
                    row["specialization_fit_review_basis"] = append_basis(
                        row.get("specialization_fit_review_basis"),
                        f"Role-agent exact-key area review 2026-10-07: {clean((decision.get('area_route') or decision.get('area_fit') or {}).get('reason') or (decision.get('area_route') or decision.get('area_fit') or {}).get('rationale'))}",
                    )
                    row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), source_refs)
                    row["specialization_fit_review_date"] = RUN_DATE
                after = {
                    "specialization_fit_review_status": row.get("specialization_fit_review_status"),
                    "specialization_fit_status": row.get("specialization_fit_status"),
                    "specialization_fit_area_key": row.get("specialization_fit_area_key"),
                    "specialization_fit_domain_gate": row.get("specialization_fit_domain_gate"),
                }
                if before != after:
                    area_applied["supported"] += 1
                    changes.append({"role_key": role_key, "source_file": str(path.relative_to(ROOT)), "layer": "area_of_specialization", "status": "supported", "before": before, "after": after})
            elif status in {"unsupported", "not_applicable"} or parent_status == "unsupported":
                if args.apply:
                    row["specialization_fit_review_status"] = "not_applicable"
                    row["specialization_fit_domain_gate"] = "parent_domain_fit_unsupported"
                    row.pop("specialization_fit_area_key", None)
                    row.pop("specialization_fit_candidate", None)
                    row["specialization_fit_review_basis"] = append_basis(
                        row.get("specialization_fit_review_basis"),
                        "No area route: the exact parent-domain path is unsupported or the agent marked the role not applicable.",
                    )
                    row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), source_refs)
                    row["specialization_fit_review_date"] = RUN_DATE
                after = {
                    "specialization_fit_review_status": row.get("specialization_fit_review_status"),
                    "specialization_fit_status": row.get("specialization_fit_status"),
                    "specialization_fit_area_key": row.get("specialization_fit_area_key"),
                    "specialization_fit_domain_gate": row.get("specialization_fit_domain_gate"),
                }
                if before != after:
                    area_applied["not_applicable"] += 1
                    changes.append({"role_key": role_key, "source_file": str(path.relative_to(ROOT)), "layer": "area_of_specialization", "status": "not_applicable", "before": before, "after": after})
            else:
                # A review hold is a completed audit disposition, not a fit
                # promotion. Keep the exact uncertainty visible in canonical
                # metadata so it cannot be mistaken for an unreviewed row.
                gate = "parent_domain_fit_supported" if parent_status == "supported" else "parent_domain_fit_unresolved"
                if args.apply:
                    row["specialization_fit_review_status"] = "review_required"
                    row["specialization_fit_domain_gate"] = gate
                    row["specialization_fit_review_basis"] = append_basis(
                        row.get("specialization_fit_review_basis"),
                        f"Role-agent exact-key area review 2026-10-07 remains review-required: {clean((decision.get('area_route') or decision.get('area_fit') or {}).get('reason') or (decision.get('area_route') or decision.get('area_fit') or {}).get('rationale'))}",
                    )
                    row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), source_refs)
                    row["specialization_fit_review_date"] = RUN_DATE
                after = {
                    "specialization_fit_review_status": row.get("specialization_fit_review_status"),
                    "specialization_fit_status": row.get("specialization_fit_status"),
                    "specialization_fit_area_key": row.get("specialization_fit_area_key"),
                    "specialization_fit_domain_gate": row.get("specialization_fit_domain_gate"),
                }
                if before != after:
                    area_held[status or "review_required"] += 1
                    changes.append({"role_key": role_key, "source_file": str(path.relative_to(ROOT)), "layer": "area_of_specialization", "status": "review_required", "before": before, "after": after})

    # Normalize legacy direct-domain routes. A role that is explicitly on a
    # domain -> role path must not retain a stale supported area candidate
    # without a canonical area key. This is a narrow cleanup of an existing
    # exact route, not a new semantic inference.
    for role_key, matches in sorted(locations.items()):
        for path, row in matches:
            if clean(row.get("specialization_fit_status")) != "supported":
                continue
            if clean(row.get("specialization_fit_area_key")):
                continue
            if clean(row.get("subgroup_fit_status")) != "direct_domain_role":
                continue
            before = {
                "specialization_fit_status": row.get("specialization_fit_status"),
                "specialization_fit_candidate": row.get("specialization_fit_candidate"),
                "specialization_fit_review_status": row.get("specialization_fit_review_status"),
            }
            if args.apply:
                row["specialization_fit_status"] = "direct_domain_role"
                row["specialization_fit_review_status"] = "not_applicable"
                row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
                row["specialization_fit_review_basis"] = append_basis(
                    row.get("specialization_fit_review_basis"),
                    "Direct domain-to-role route: this domain has no applicable canonical area route for the role; the stale area candidate was removed.",
                )
                row.pop("specialization_fit_candidate", None)
                row.pop("specialization_fit_area_key", None)
                row["specialization_fit_review_date"] = RUN_DATE
            after = {
                "specialization_fit_status": row.get("specialization_fit_status"),
                "specialization_fit_candidate": row.get("specialization_fit_candidate"),
                "specialization_fit_review_status": row.get("specialization_fit_review_status"),
            }
            if before != after:
                changes.append({
                    "role_key": role_key,
                    "source_file": str(path.relative_to(ROOT)),
                    "layer": "direct_domain_role_cleanup",
                    "status": "direct_domain_role",
                    "before": before,
                    "after": after,
                })

    report = {
        "schema_version": "2026-10-07.role-agent-review-decision-apply.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "scope": "Exact current role keys from the completed conditional parent-domain and role-area agent queues.",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "inputs": {
            "conditional_files": [str(x.relative_to(ROOT)) for x in CONDITIONAL_FILES],
            "area_files": [str(x.relative_to(ROOT)) for x, _ in AREA_FILES],
        },
        "counts": {
            "conditional_decisions": len(conditional),
            "conditional_decision_statuses": dict(parent_counts),
            "area_decisions": len(area),
            "area_decision_statuses": dict(area_counts),
            "parent_applied": dict(parent_applied),
            "parent_review_held": dict(parent_held),
            "area_applied": dict(area_applied),
            "area_review_held": dict(area_held),
            "stale_parent_decisions": len(stale_parent),
            "stale_area_decisions": len(stale_area),
            "parent_mismatches": len(parent_mismatches),
            "area_conflicts": len(area_conflicts),
            "canonical_change_count": len(changes) if args.apply else 0,
            "dry_run_candidate_change_count": len(changes) if not args.apply else None,
        },
        "stale_parent_decisions": stale_parent,
        "stale_area_decisions": stale_area,
        "parent_mismatches": parent_mismatches,
        "area_conflicts": area_conflicts,
        "changes": changes,
        "guards": {
            "exact_role_key_only": True,
            "unknown_area_keys_rejected": True,
            "isco_or_esco_used_as_fit_proof": False,
            "subgroup_membership_used_as_fit_proof": False,
            "review_required_promoted": False,
            "parent_gate_required_for_supported_area": True,
            "stale_roles_created": False,
            "domain_or_area_taxonomy_edited": False,
            "student_visible_route_fabricated": False,
        },
    }
    write_json(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Role-agent review decision apply — 2026-10-07",
            "",
            f"Mode: **{report['mode']}**.",
            "",
            "This pass matches agent decisions by exact `domain_id|role_name`. It does not infer a role route from title, ISCO/ESCO membership or existing subgroup membership.",
            "",
            f"- Conditional parent decisions loaded: **{len(conditional)}**",
            f"- Area-review decisions loaded: **{len(area)}**",
            f"- Canonical changes: **{len(changes) if args.apply else 0}**",
            f"- Parent mismatches/stale decisions: **{len(parent_mismatches) + len(stale_parent)}**",
            f"- Area conflicts/stale decisions: **{len(area_conflicts) + len(stale_area)}**",
            "",
            "Review-required rows remain explicit. Only exact source-backed supported area routes with a supported parent-domain gate are promoted.",
            "",
            f"Machine-readable report: `{REPORT.relative_to(ROOT).as_posix()}`",
            "",
        ]) + "\n",
        encoding="utf-8",
    )
    if args.apply:
        for path, payload in containers.items():
            write_json(path, payload)
    print(json.dumps({"mode": report["mode"], "counts": report["counts"], "report": str(REPORT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
