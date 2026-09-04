"""Historical ISCO crosswalk builder.

This builder is retained for audit history only. The eight-code question was
closed by the source-backed closure report dated 2026-09-04. Do not run this
historical builder as the current gate because it preserves the old
conservative dispositions.
"""

from __future__ import annotations

import json
from pathlib import Path

from _audit_domain_source_traceability import ISCO_XLSX, OUT_DIR, source_codes


ROOT = Path(__file__).resolve().parent
TRACE = ROOT / "_audit" / "domain_source_traceability_2026-08-31.json"


def disposition(code: str) -> dict:
    """Give each invalid code an explicit, non-silent source disposition.

    A parent or sibling is not promoted as an exact replacement unless the
    source meaning proves it.  These dispositions make that boundary explicit
    while retaining the original library value for later review.
    """
    if code == "2121":
        return {
            "canonical_anchor": None,
            "status": "invalid_code_candidate_only",
            "reason": "The supplied ISCO-08 workbook contains 2120, not 2121. 2120 is the only valid child of parent 212, but the source library gives no title or meaning proving that 2121 is a transcription of 2120.",
        }
    if code in {"2213", "2214", "2215", "2216"}:
        return {
            "canonical_anchor": None,
            "status": "invalid_code_parent_anchor_only",
            "reason": "The supplied ISCO-08 workbook contains 2211 and 2212 under parent 221, not 2213–2216. The valid parent is retained as the safe structural anchor; no specialist child is inferred.",
        }
    if code == "2311":
        return {
            "canonical_anchor": None,
            "status": "invalid_code_candidate_only",
            "reason": "The supplied ISCO-08 workbook contains 2310, not 2311. 2310 is a possible transcription candidate, but it is not promoted without source-meaning confirmation.",
        }
    if code == "2321":
        return {
            "canonical_anchor": None,
            "status": "invalid_code_candidate_only",
            "reason": "The supplied ISCO-08 workbook contains 2320, not 2321. 2320 is a possible transcription candidate, but it is not promoted without source-meaning confirmation.",
        }
    if code == "3330":
        return {
            "canonical_anchor": None,
            "status": "invalid_code_parent_anchor_only",
            "reason": "The supplied ISCO-08 workbook contains parent 333 and child groups 3331–3334/3339, not 3330. The generic parent is retained; no child is selected without role meaning.",
        }
    return {
        "canonical_anchor": None,
        "status": "invalid_code_review_required",
        "reason": "No exact code exists in the supplied ISCO-08 workbook; do not infer a replacement.",
    }


def main() -> None:
    print("This historical builder is superseded. Use _close_isco_domain_codes_2026-09-04.py.")
    return

    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    codes, titles = source_codes(ISCO_XLSX, 1, 2)
    missing = sorted({
        code
        for row in trace["domains"]
        for code in row.get("isco_codes_missing_from_local_workbook", [])
    })
    records = []
    for code in missing:
        parent = code[:3]
        sibling_codes = sorted(
            candidate for candidate in codes
            if len(candidate) == 4 and candidate.startswith(parent)
        )
        domains = [
            {"domain_id": row["domain_id"], "domain_name": row["current_domain_name"]}
            for row in trace["domains"]
            if code in row.get("definition_library_isco_unit_groups", [])
        ]
        record = {
            "raw_library_code": code,
            "status": "not_present_in_supplied_isco08_workbook",
            "valid_parent_code": parent if parent in codes else None,
            "valid_parent_title": titles.get(parent),
            "valid_unit_group_siblings": [
                {"code": sibling, "title": titles.get(sibling)} for sibling in sibling_codes
            ],
            "affected_domains": domains,
            "decision": "Preserve the raw library code; do not silently substitute a parent or sibling.",
        }
        record.update(disposition(code))
        records.append(record)
    out = {
        "schema_version": "2026-08-31.isco-domain-crosswalk.v1",
        "purpose": "Reconcile ISCO codes recorded in the domain-definition library against the supplied ISCO-08 hierarchy without silently rewriting the source values.",
        "source": "Local copy of ILO ISCO-08 EN Structure and definitions.xlsx",
        "official_reference": {
            "name": "ILO ISCO-08 official codelist and structure",
            "url": "https://isco.ilo.org/en/isco-08/codelist/",
            "volume_url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
            "finding": "The official ISCO-08 structure confirms the valid standard unit-group candidates recorded below; national adaptations or older classifications must not be promoted as standard ISCO-08 replacements.",
        },
        "summary": {"missing_code_count": len(records), "affected_domain_count": len({d['domain_id'] for r in records for d in r['affected_domains']})},
        "records": records,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "isco_domain_crosswalk_2026-08-31.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# ISCO domain-code reconciliation — 2026-08-31",
        "",
        "The domain-definition library contains eight four-digit values absent from the supplied ISCO-08 workbook. This report preserves those raw values, shows valid parent/sibling candidates, and records a non-silent disposition for each. It does not promote an inferred replacement.",
        "",
        f"- Missing raw codes: **{len(records)}**.",
        f"- Affected domains: **{out['summary']['affected_domain_count']}**.",
        "",
        "| Raw library code | Disposition | Valid parent | Valid sibling unit groups | Affected domains |",
        "|---|---|---|---|---|",
    ]
    for row in records:
        parent = f"{row['valid_parent_code']} — {row['valid_parent_title']}" if row["valid_parent_code"] else "—"
        siblings = ", ".join(f"{item['code']} — {item['title']}" for item in row["valid_unit_group_siblings"]) or "—"
        domains = ", ".join(f"{item['domain_id']} {item['domain_name']}" for item in row["affected_domains"])
        lines.append(f"| `{row['raw_library_code']}` | `{row['status']}`; {row['reason']} | {parent} | {siblings} | {domains} |")
    lines += [
        "",
        "## Decision boundary",
        "",
        "A missing four-digit code is a source/provenance defect, not proof that the associated domain is invalid. The parent and sibling groups identify where the intended occupation may sit in ISCO-08, but none is an exact replacement unless the original source meaning supports it. The raw value, disposition, and limitation must remain visible until that review occurs.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_build_isco_domain_crosswalk.py",
        "```",
    ]
    (OUT_DIR / "ISCO_DOMAIN_CROSSWALK_2026-08-31.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
