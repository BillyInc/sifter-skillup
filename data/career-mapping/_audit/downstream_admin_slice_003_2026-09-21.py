"""Read-only downstream/admin slice 003 audit.

This wrapper reuses the validated slice-002 audit logic while reserving a new,
non-overlapping programme set. It writes only slice-003 checkpoint/report
artifacts under this audit directory; it never changes app, catalogue, seed,
SQL, UI or browser-proof files.
"""

from __future__ import annotations

import importlib.util
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
PREFIX = "downstream_admin_slice_003_2026-09-21"


def load_slice_logic():
    source = AUDIT / "downstream_admin_slice_002_2026-09-21.py"
    spec = importlib.util.spec_from_file_location("downstream_admin_slice_002", source)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load audit logic from {source}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.PREFIX = PREFIX
    module.CHECKPOINT_JSON = AUDIT / f"{PREFIX}_checkpoint.json"
    module.CHECKPOINT_MD = AUDIT / f"{PREFIX}_checkpoint.md"
    module.REPORT_JSON = AUDIT / f"{PREFIX}_report.json"
    module.REPORT_MD = AUDIT / f"{PREFIX}_report.md"
    return module


def prior_keys(module: Any) -> set[str]:
    keys: set[str] = set()
    prior_admin = module.read_json(
        "data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.json"
    )
    keys.update(
        str(key)
        for key in (prior_admin.get("tranche_definition") or {}).get("programme_keys", [])
    )
    for path in AUDIT.glob("downstream_admin_slice_*_checkpoint.json"):
        if path.name == f"{PREFIX}_checkpoint.json":
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        keys.update(
            str(key)
            for key in ((payload.get("selection") or {}).get("programme_keys") or [])
        )
    return keys


def write_checkpoint(module: Any) -> dict[str, Any]:
    broad = module.read_json(
        "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json"
    )
    excluded = prior_keys(module)
    canonical = sorted(
        broad.get("canonical_programmes", []),
        key=lambda row: str(row.get("programme_key") or "").casefold(),
    )
    candidates = [
        row
        for row in canonical
        if str(row.get("programme_key") or "") not in excluded
    ]
    selected = candidates[:20]
    if len(selected) != 20:
        raise RuntimeError(f"non-overlapping selection has only {len(selected)} rows")
    selected_keys = [str(row["programme_key"]) for row in selected]
    payload = {
        "schema_version": "2026-09-21.downstream-admin-slice-checkpoint.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "status": "selection_saved_before_audit",
        "selection": {
            "policy": "next 20 canonical programme keys after excluding every prior downstream/admin slice",
            "programme_count": len(selected_keys),
            "programme_keys": selected_keys,
            # Retain the slice-002 field names because the shared report logic
            # reads them when building its aggregate scope object.
            "overlap_with_prior_admin_tranche": [],
            "overlap_with_existing_local_slices": [],
            "overlap_with_prior_slices": sorted(set(selected_keys).intersection(excluded)),
        },
        "scope_reference": {
            "canonical_programmes": len(canonical),
            "canonical_jamb_identities": int(
                (broad.get("scope") or {}).get("jamb_identity_count") or 0
            ),
        },
        "audit_contract": {
            "student_admin_language_separation": "static contract markers plus per-programme queue state",
            "category_ownership": "context ownership/state counters and student/admin boundary markers",
            "bounded_role_learning": "role-learning caps and route-level role coverage",
            "source_link_review_states": "per-programme provenance/link/review queue states",
            "relationships": "active programme-domain types plus unresolved/not-established queues",
            "provenance": "source reference/locator and ownership counters",
            "fail_closed_student_exposure": "review-only/not-established states remain non-approved",
        },
        "inputs_read": [
            "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
            "data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.json",
            "data/career-mapping/_audit/downstream_admin_slice_002_2026-09-21_checkpoint.json",
        ],
        "excluded_prior_programmes": len(excluded),
        "search_started": False,
        "product_files_changed": False,
        "sql_or_browser_proof": False,
    }
    module.CHECKPOINT_JSON.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    lines = [
        "# Downstream/admin slice 003 checkpoint",
        "",
        f"Generated: {payload['generated_on']}",
        "Status: **selection saved before audit/search**.",
        "",
        "This is a read-only checkpoint. No app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.",
        "",
        "## Selection",
        "",
        f"- Programmes reserved: **{len(selected_keys)}**.",
        "- Selection is the next lexical block after excluding all prior downstream/admin slices.",
        "- Overlap with prior slices: **0**.",
        "",
        "## Reserved programme keys",
        "",
    ]
    lines.extend(f"- `{key}`" for key in selected_keys)
    lines.extend(
        [
            "",
            "## Next audit pass",
            "",
            "Inspect curriculum continuity, active relationship types, ownership/category boundaries, bounded role-learning skills, source/link/review states, provenance, relationship queues and fail-closed student exposure. Admin rendering remains a local static/contract check; browser and live SQL proof are not claimed.",
            "",
        ]
    )
    module.CHECKPOINT_MD.write_text("\n".join(lines), encoding="utf-8")
    return payload


def main() -> None:
    module = load_slice_logic()
    checkpoint = write_checkpoint(module)
    report = module.audit()
    # The shared logic's prose heading is historical; keep the new artifact's
    # identity unambiguous without altering the reusable audit implementation.
    report_text = module.REPORT_MD.read_text(encoding="utf-8")
    report_text = report_text.replace("slice 002", "slice 003")
    module.REPORT_MD.write_text(report_text, encoding="utf-8")
    print(
        json.dumps(
            {
                "checkpoint": str(module.CHECKPOINT_JSON.relative_to(ROOT)),
                "report": str(module.REPORT_JSON.relative_to(ROOT)),
                "programmes": report["scope"]["programmes"],
                "failures": len(report["failures"]),
                "overlap": checkpoint["selection"]["overlap_with_prior_slices"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
