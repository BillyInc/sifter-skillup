"""Reconcile the Insurance + Actuarial scope's stale JAMB source note."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCOPE = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"


def main() -> None:
    payload = json.loads(SCOPE.read_text(encoding="utf-8"))
    rows = [r for r in payload["rows"] if r.get("jamb_name") == "Insurance and Actuarial Science"]
    if len(rows) != 1:
        raise SystemExit(f"Expected one canonical scope row; found {len(rows)}")
    row = rows[0]
    context = row.get("source_context", {})
    evidence = next(
        (item for item in row.get("scope_evidence", []) if item.get("authority") == "Joint Admissions and Matriculation Board"),
        None,
    )
    if "not yet direct-PDF verified" not in context.get("jamb_locator", ""):
        raise SystemExit("Unexpected scope-context preimage; refusing update")
    if not evidence or "not certified exact-cell evidence" not in evidence.get("supports", ""):
        raise SystemExit("Expected stale JAMB scope evidence not found; refusing update")
    if row.get("scope_status") != "combined_scope_review_required":
        raise SystemExit("Unexpected scope status; refusing to alter review state")

    context["jamb_locator"] = (
        "Official JAMB Degree Administration brochure, extracted PDF text "
        "data/career-mapping/_jamb_txt/Administration.txt lines 1630-1634 after the printed-p.76 page break: "
        "exact INSURANCE AND ACTUARIAL SCIENCE heading and complete following awarding-institutions cell."
    )
    context.pop("institution_codes_parsed_not_verified", None)
    context["institution_codes_source_confirmed"] = ["BAZE", "IMSU", "WESLEYUNI"]
    context["verification_method"] = (
        "The title and complete awarder cell were checked in the text extraction of the official JAMB PDF "
        "and match the canonical JAMB offering row."
    )
    row["scope_reason"] = (
        "Both substantive title facets now have their complete distinct NUC CCMAS course packages represented "
        "as an auditable reference union: Insurance and Actuarial Science. This avoids the prior Actuarial-only "
        "or Insurance-only omission. The JAMB Administration source cell identifies BAZE, IMSU and WESLEYUNI, "
        "but it does not establish each institution's implementation of the national 70% CCMAS core plus its "
        "30% institutional portion or prove a literal full-union timetable at each provider. No domain link is "
        "inherited; reassess all course/outcome-to-domain and descendant paths before promotion."
    )
    evidence["locator"] = (
        "Official Degree Administration brochure text extraction, data/career-mapping/_jamb_txt/Administration.txt "
        "lines 1630-1634 after the printed-p.76 page break: exact title followed by BAZE, IMSU and WESLEYUNI "
        "as the complete awarder cell."
    )
    evidence["supports"] = (
        "Canonical JAMB title, Administration faculty/source context, and the complete awarder cell "
        "BAZE/IMSU/WESLEYUNI. It does not establish institution-specific 30% curriculum implementation."
    )

    SCOPE.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Reconciled the stale JAMB source-context claim; combined scope review state remains unchanged.")


if __name__ == "__main__":
    main()
