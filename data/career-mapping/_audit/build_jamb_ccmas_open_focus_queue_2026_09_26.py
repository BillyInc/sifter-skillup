"""Build an append-only, report-aware queue for the unresolved source phase."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OUT_JSON = AUDIT / "jamb_ccmas_open_focus_queue_2026-09-26_002.json"
OUT_MD = AUDIT / "jamb_ccmas_open_focus_queue_2026-09-26_002.md"


def load() -> tuple[list[dict], list[dict]]:
    inventory = json.loads((AUDIT / "jamb_anomaly_inventory_2026-09-26.json").read_text(encoding="utf-8"))
    scopes = json.loads((AUDIT / "jamb_curriculum_scopes_2026-08-17.json").read_text(encoding="utf-8"))["rows"]
    return inventory["rows"], scopes


def is_focus(row: dict) -> bool:
    return (
        row.get("scope_status", "").startswith("external")
        or not row.get("component_refs")
        or any(str(ref).startswith("__custom__::") for ref in row.get("component_refs", []))
        or "partial" in row.get("scope_status", "")
        or bool(row.get("unrepresented_facets"))
    )


def report_index() -> list[tuple[Path, str]]:
    indexed: list[tuple[Path, str]] = []
    for path in AUDIT.rglob("*.md"):
        if path.name in {OUT_MD.name}:
            continue
        try:
            indexed.append((path, path.read_text(encoding="utf-8", errors="replace")))
        except OSError:
            continue
    return indexed


def prior_reports(order: int, name: str, indexed: list[tuple[Path, str]]) -> list[str]:
    # Match exact identity text or a row marker. Do not use the result as proof
    # of closure; it only prevents rediscovering an existing checkpoint.
    row_pat = re.compile(rf"(?<!\d)0*{order}(?!\d)")
    result: list[str] = []
    for path, text in indexed:
        if name in text or row_pat.search(text):
            result.append(path.relative_to(AUDIT.parent.parent.parent).as_posix())
    return sorted(set(result))[:12]


def next_actions(row: dict, scope: dict) -> list[str]:
    actions: list[str] = []
    if "offering_cell_not_pdf_verified" in row.get("evidence_gaps", []):
        actions.append("verify exact JAMB offering cell and preserve occurrence context")
    if row.get("selected_course_citations_missing", 0):
        actions.append("attach item-specific course URL, locator and access date")
    if "selected_ccmas_content_missing_or_placeholder" in row.get("evidence_gaps", []):
        actions.append("compare selected course content against the authoritative CCMAS source")
    if "selected_ccmas_outcomes_missing" in row.get("evidence_gaps", []):
        actions.append("recover or confirm course learning outcomes; do not invent them")
    if "selected_ccmas_units_missing" in row.get("evidence_gaps", []):
        actions.append("carry source units/status/contact hours where the source provides them")
    if row.get("unrepresented_facets"):
        actions.append("resolve each named facet with a CCMAS component or provider-specific external source")
    if row.get("selected_course_count", 0) == 0:
        actions.append("do not infer a union from component names; obtain row-specific scope evidence")
    if any(str(ref).startswith("__custom__::") for ref in row.get("component_refs", [])) or not row.get("component_refs"):
        actions.append("validate custom/external curriculum item by item and preserve provider limits")
    if not actions:
        actions.append("read prior checkpoint, then perform source-level reconciliation before closure")
    return actions


def main() -> None:
    inventory, scopes = load()
    scopes_by_name = {row["jamb_name"]: row for row in scopes}
    indexed = report_index()
    rows: list[dict] = []
    for row in inventory:
        if not is_focus(row):
            continue
        scope = scopes_by_name[row["jamb_name"]]
        reports = prior_reports(row["canonical_order"], row["jamb_name"], indexed)
        rows.append(
            {
                "canonical_order": row["canonical_order"],
                "jamb_name": row["jamb_name"],
                "scope_status": row["scope_status"],
                "mapping_type": scope.get("mapping_type"),
                "component_refs": row.get("component_refs", []),
                "selected_course_count": row.get("selected_course_count", 0),
                "selected_ccmas_course_count": row.get("selected_ccmas_course_count", 0),
                "selected_course_citations_missing": row.get("selected_course_citations_missing", 0),
                "flags": row.get("flags", []),
                "evidence_gaps": row.get("evidence_gaps", []),
                "unrepresented_facets": row.get("unrepresented_facets", []),
                "prior_checkpoint_refs": reports,
                "prior_checkpoint_found": bool(reports),
                "closure_state": "open_source_adjudication",
                "next_actions": next_actions(row, scope),
            }
        )
    rows.sort(key=lambda row: row["canonical_order"])
    counts = Counter(row["scope_status"] for row in rows)
    report = {
        "schema_version": 1,
        "audit_date": "2026-09-26",
        "status": "open_source_adjudication_queue",
        "purpose": "Report-aware queue for every JAMB identity in the external/custom/unanchored/partial/unrepresented source-phase lane.",
        "counts": {
            "focused_identities": len(rows),
            "prior_checkpoint_found": sum(row["prior_checkpoint_found"] for row in rows),
            "prior_checkpoint_not_found": sum(not row["prior_checkpoint_found"] for row in rows),
            "scope_status": dict(sorted(counts.items())),
            "rows_with_offering_verification_gap": sum("offering_cell_not_pdf_verified" in row["evidence_gaps"] for row in rows),
            "rows_with_course_citation_gap": sum(row["selected_course_citations_missing"] > 0 for row in rows),
            "rows_with_unrepresented_facets": sum(bool(row["unrepresented_facets"]) for row in rows),
            "zero_course_rows": sum(row["selected_course_count"] == 0 for row in rows),
        },
        "closure_contract": "A prior checkpoint reference is not closure. A row closes only after exact offering context, component/course fidelity, item-level source metadata, and a justified student-facing status are all verified.",
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB–CCMAS/external open focus queue — 2026-09-26 (002)",
        "",
        "Status: **open source adjudication queue**. This is an append-only audit artifact; it does not promote rows or edit source, scope, seed, SQL, UI, domain, subgroup, role, or main-register files.",
        "",
        "## Coverage",
        "",
    ]
    for key, value in report["counts"].items():
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "Every row below remains open even when prior reports exist; the prior paths are included only to prevent repeating closed or already documented conclusions.",
        "",
        "## Queue",
        "",
        "| # | JAMB identity | Scope | Components | Courses | Missing citations | Prior report | Immediate evidence work |",
        "|---:|---|---|---|---:|---:|---|---|",
    ]
    for row in rows:
        components = "; ".join(row["component_refs"]) or "—"
        prior = "yes" if row["prior_checkpoint_found"] else "no"
        action = "; ".join(row["next_actions"][:2])
        lines.append(
            f"| {row['canonical_order']} | {row['jamb_name']} | {row['scope_status']} | {components} | {row['selected_course_count']} | {row['selected_course_citations_missing']} | {prior} | {action} |"
        )
    lines += [
        "",
        "## Required completion rule",
        "",
        report["closure_contract"],
        "",
        "Downstream domain/subgroup/role auditing remains deferred until this source-phase queue is closed.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"output_json": str(OUT_JSON), "output_md": str(OUT_MD), "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
