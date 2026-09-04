"""Close the eight legacy or invalid occupational-code anchors.

The original domain-definition library labelled these values as ISCO-08, but
the source audit shows that some are legacy ISCO-88 values and some are not
valid four-digit unit groups in either ILO structure.  This file records the
source-backed disposition without silently changing the historical library.
"""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
AUDIT = HERE / "_audit"
TRACE = AUDIT / "domain_source_traceability_2026-08-31.json"
OUT_JSON = AUDIT / "isco_domain_code_source_closure_2026-09-04.json"
OUT_MD = AUDIT / "ISCO_DOMAIN_CODE_SOURCE_CLOSURE_2026-09-04.md"

ILO_VOLUME = "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf"
ILO_ISCO08 = "https://isco.ilo.org/en/isco-08/"
ILO_ISCO88 = "https://webapps.ilo.org/public/french/bureau/stat/isco/isco88/"


DECISIONS = {
    "2121": {
        "source_version": "ISCO-88",
        "source_title": "Mathematicians and Related Professionals",
        "canonical_code": "2120",
        "canonical_title": "Mathematicians, Actuaries and Statisticians",
        "status": "closed_legacy_code_mapped",
        "action": "Replace the legacy anchor with ISCO-08 2120 in the canonical occupational evidence layer.",
        "reason": "The ILO correspondence table maps ISCO-88 2121 to ISCO-08 2120. The old value is therefore not an unexplained guess; it is a legacy code with an official correspondence.",
    },
    "2213": {
        "source_version": "ISCO-88",
        "source_title": "Agronomists and Related Professionals",
        "canonical_code": "2132",
        "canonical_title": "Farming, Forestry and Fisheries Advisers",
        "status": "closed_cross_domain_anchor_removed",
        "action": "Remove 2213 from Medicine. Retain its source meaning for Agriculture only where the role/domain evidence independently supports that placement.",
        "reason": "The ILO correspondence table maps ISCO-88 2213 to ISCO-08 2132. Its source meaning is agricultural, so mapping it into Medicine would be a semantic error.",
    },
    "2214": {
        "source_version": "none",
        "source_title": None,
        "canonical_code": None,
        "canonical_title": None,
        "status": "closed_invalid_code_removed",
        "action": "Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.",
        "reason": "The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2214. The supplied ISCO-88 structure also does not establish this value.",
    },
    "2215": {
        "source_version": "none",
        "source_title": None,
        "canonical_code": None,
        "canonical_title": None,
        "status": "closed_invalid_code_removed",
        "action": "Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.",
        "reason": "The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2215. The supplied ISCO-88 structure also does not establish this value.",
    },
    "2216": {
        "source_version": "none",
        "source_title": None,
        "canonical_code": None,
        "canonical_title": None,
        "status": "closed_invalid_code_removed",
        "action": "Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.",
        "reason": "The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2216. The supplied ISCO-88 structure also does not establish this value.",
    },
    "2311": {
        "source_version": "none",
        "source_title": None,
        "canonical_code": None,
        "canonical_title": None,
        "status": "closed_invalid_code_removed",
        "action": "Remove from the canonical occupational anchor list; retain 2310 for University and Higher Education Teachers.",
        "reason": "The ILO ISCO-08 structure defines 2310 University and Higher Education Teachers, not 2311. The source library already contains the valid 2310 anchor.",
    },
    "2321": {
        "source_version": "none",
        "source_title": None,
        "canonical_code": None,
        "canonical_title": None,
        "status": "closed_invalid_code_removed",
        "action": "Remove from the canonical occupational anchor list; retain 2320 for Vocational Education Teachers.",
        "reason": "The ILO ISCO-08 structure defines 2320 Vocational Education Teachers, not 2321. The source library already contains the valid 2320 anchor.",
    },
    "3330": {
        "source_version": "ISCO-88",
        "source_title": "Special Education Teaching Associate Professionals",
        "canonical_code": "2352",
        "canonical_title": "Special Needs Teachers",
        "status": "closed_legacy_code_mapped",
        "action": "Remove 3330 from the general Vocational domain anchor list. Use ISCO-08 2352 only where a separately evidenced special-needs-teaching role is present; do not treat it as a general vocational-training code.",
        "reason": "The ILO correspondence table maps ISCO-88 3330 to ISCO-08 2352. The correspondence is partial and the current affected record is a general Vocational domain, so replacing it there would broaden the source meaning incorrectly.",
    },
}


def main() -> None:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    affected: dict[str, list[dict]] = {}
    for row in trace["domains"]:
        for code in row.get("definition_library_isco_unit_groups", []):
            if code in DECISIONS:
                affected.setdefault(code, []).append(
                    {"domain_id": row["domain_id"], "domain_name": row["current_domain_name"]}
                )

    records = []
    for code, decision in DECISIONS.items():
        records.append(
            {
                "raw_library_code": code,
                "affected_domains": affected.get(code, []),
                **decision,
                "evidence_urls": [ILO_VOLUME, ILO_ISCO08, ILO_ISCO88],
                "evidence_note": "The official ILO correspondence table is used where a legacy ISCO-88 meaning exists. Absence from the official unit-group structure is treated as a closed invalid-code finding, not as permission to invent a replacement.",
            }
        )

    out = {
        "schema_version": "2026-09-04.isco-domain-code-source-closure.v1",
        "purpose": "Source-backed closure of all eight raw occupational-code values recorded in the domain-definition library.",
        "canonical_rule": "Only valid ISCO-08 unit groups remain canonical. Legacy ISCO-88 values may be retained only with an official ILO correspondence and a semantic check. Invalid values are removed from canonical anchors and preserved in this audit.",
        "sources": {
            "ilo_isco08_volume_and_correspondence": ILO_VOLUME,
            "ilo_isco08_structure": ILO_ISCO08,
            "ilo_isco88_structure": ILO_ISCO88,
        },
        "summary": {
            "raw_codes_closed": len(records),
            "legacy_codes_mapped": sum(r["status"] == "closed_legacy_code_mapped" for r in records),
            "cross_domain_anchors_removed": sum(r["status"] == "closed_cross_domain_anchor_removed" for r in records),
            "invalid_codes_removed": sum(r["status"] == "closed_invalid_code_removed" for r in records),
            "records_left_pending": 0,
        },
        "records": records,
    }
    AUDIT.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# ISCO domain-code source closure — 4 September 2026",
        "",
        "This audit closes every one of the eight raw occupational-code values that had been left as an unresolved ISCO-08 check. The source review found that some values were legacy International Standard Classification of Occupations 1988 codes, while others were not valid four-digit unit groups in the official International Standard Classification of Occupations 2008 structure.",
        "",
        "## Result",
        "",
        f"- Raw values reviewed and closed: **{out['summary']['raw_codes_closed']}**.",
        f"- Legacy values mapped by the official correspondence table: **{out['summary']['legacy_codes_mapped']}**.",
        f"- Cross-domain value removed rather than misassigned: **{out['summary']['cross_domain_anchors_removed']}**.",
        f"- Invalid values removed from canonical anchors: **{out['summary']['invalid_codes_removed']}**.",
        "- Records left pending: **0**.",
        "",
        "## Source method",
        "",
        "The official International Labour Organization correspondence table was checked first for a legacy 1988 meaning and a 2008 destination. The destination was then checked against the official 2008 structure and against the meaning of the domain that contained the raw value. A valid code was not inserted merely because it shared the same first three digits. Where no defensible source meaning existed, the value was removed from the canonical anchor list and retained here as a historical data-quality finding.",
        "",
        "## Closed decisions",
        "",
        "| Raw value | Source meaning | Canonical outcome | Affected domain(s) |",
        "|---|---|---|---|",
    ]
    for row in records:
        source = f"{row['source_version']}: {row['source_title']}" if row["source_title"] else "No official unit-group meaning found"
        outcome = f"{row['canonical_code']} — {row['canonical_title']}" if row["canonical_code"] else "Removed from canonical anchors"
        domains = ", ".join(f"{d['domain_id']} {d['domain_name']}" for d in row["affected_domains"]) or "None in current trace"
        lines.append(f"| `{row['raw_library_code']}` | {source} | {outcome} | {domains} |")
        lines.append("")
        lines.append(f"**{row['raw_library_code']} — decision:** {row['reason']} {row['action']}")
        lines.append("")
    lines += [
        "## Source links",
        "",
        f"- [International Labour Organization ISCO-08 Volume 1 and correspondence table]({ILO_VOLUME})",
        f"- [International Labour Organization ISCO-08 structure]({ILO_ISCO08})",
        f"- [International Labour Organization ISCO-88 structure and definitions]({ILO_ISCO88})",
        "",
        "This closure does not change domain names, subgroup names, roles, or skills. It corrects the occupational-source anchors so that later provenance, curriculum mapping, and SQL generation cannot treat a legacy or invalid code as a current ISCO-08 code.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
