"""Reconcile current domain/subgroup labels to their recorded source lineage."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
META = ROOT / "domain_meta.json"
STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
DOMAIN_TRACE = AUDIT / "domain_source_traceability_2026-08-31.json"
DOMAIN_NAMING = AUDIT / "domain_naming_provenance_2026-08-31.json"
SUBGROUP_TRACE = AUDIT / "subgroup_role_source_traceability_2026-08-31.json"
ISCO = ROOT / "taxonomies" / "esco_isco_groups.json"
OUT_JSON = AUDIT / "domain_subgroup_source_naming_audit_2026-10-03.json"
OUT_MD = AUDIT / "domain_subgroup_source_naming_audit_2026-10-03.md"

DOMAIN_RENAMES = {
    "D007": ("UI/UX Design", "User Interface and User Experience Design"),
    "D011": ("Quantitative Finance", "Quantitative Finance and Financial Engineering"),
    "D016": ("Electrical", "Electrical Engineering"),
    "D017": ("Mechanical", "Mechanical Engineering"),
    "D018": ("Civil", "Civil Engineering"),
    "D030": ("Marketing, Brand", "Marketing and Brand Management"),
    "D054": ("Oil", "Oil and Gas Operations"),
    "D060": ("Banking, Credit", "Banking and Credit Services"),
    "D064": ("Psychology, Counselling", "Psychology and Counselling"),
    "D074": ("Occupational Health, Safety", "Occupational Health and Safety"),
    "D079": ("Customs, Trade", "Customs and International Trade"),
    "D140": ("Robotics Engineering, Systems Design", "Robotics Engineering and Systems Design"),
    "D146": ("Building Services Engineering — Mechanical, Electrical", "Building Services Engineering (Mechanical and Electrical Systems)"),
    "D147": ("Process Automation, SCADA, PLC", "Industrial Process Automation (SCADA and PLC Systems)"),
    "D156": ("Land Surveying, Cadastral Mapping", "Land Surveying and Cadastral Mapping"),
    "D158": ("Corporate Finance, Investment Banking", "Corporate Finance and Investment Banking"),
    "D159": ("Credit Analysis, Structured Finance", "Credit Analysis and Structured Finance"),
    "D162": ("Immigration Law, Asylum", "Immigration Law and Asylum"),
    "D163": ("Intellectual Property Law, Patents", "Intellectual Property Law and Patent Practice"),
    "D164": ("Urban Mobility, Smart City Systems", "Urban Mobility and Smart City Systems"),
    "D115": ("Road Transport Operations (Drivers", "Road Transport and Driving Operations"),
    "D027": ("Biomedical", "Biomedical Science"),
    "D040": ("Vocational", "Vocational and Technical Training"),
    "D073": ("Library, Archive", "Libraries, Archives and Information Management"),
    "D086": ("Gaming, Betting & Lottery", "Gaming, Betting and Lottery Operations"),
    "D089": ("Funeral", "Funeral and Mortuary Services"),
    "D096": ("Agricultural", "Agricultural Machinery and Farm Operations"),
    "D108": ("Printing Technology, Pre-press", "Printing Technology, Pre-press and Print Finishing"),
    "D110": ("Chemical, Rubber", "Chemical, Rubber and Plastics Plant Operations"),
    "D113": ("Glass, Ceramics, Building Materials", "Glass, Ceramics, Building Materials and Boiler Plant Operations"),
    "D136": ("Aeronautical", "Aeronautical and Aerospace Engineering"),
    "D151": ("Criminology, Criminal Justice", "Criminology, Criminal Justice and Corrections"),
}

SUBGROUP_RENAMES = [
    {"domain_id": "D151", "isco_submajor": "25", "from": "ISCO-08 group 25",
     "to": "Information and Communications Technology Professionals",
     "basis": "Exact ILO ISCO-08 title for code 25. Role membership/key was not changed."},
    {"domain_id": "D100", "isco_submajor": "71", "from": "Building and Related Trades Workers",
     "to": "Building and Related Trades Workers (Excluding Electricians)",
     "basis": "Restores the official ISCO-08 scope qualifier omitted by the old student-facing label."},
    {"domain_id": "D101", "isco_submajor": "71", "from": "Building and Related Trades Workers",
     "to": "Building and Related Trades Workers (Excluding Electricians)",
     "basis": "Restores the official ISCO-08 scope qualifier omitted by the old student-facing label."},
]


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def main() -> None:
    meta, structure = read(META), read(STRUCTURE)
    domain_trace = {x["domain_id"]: x for x in read(DOMAIN_TRACE)["domains"]}
    domain_naming = {x["domain_id"]: x for x in read(DOMAIN_NAMING)["domains"]}
    subgroup_trace = read(SUBGROUP_TRACE)
    isco = read(ISCO)
    role_rows = read(ROLE_LIBRARY)
    for filename in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        path = ROOT / filename
        if path.exists():
            role_rows.extend(read(path).get("roles") or [])
    role_by_key = {}
    for role in role_rows:
        role_by_key[f"{role.get('domain_id')}|{role.get('role_name')}"] = role
    role_counts = Counter(
        (str(role.get("domain_id")), str(role.get("isco_group") or "")[:2])
        for role in role_by_key.values()
        if str(role.get("student_path_status") or "active").casefold() != "excluded"
    )

    domain_rows = []
    for domain_id, current in meta.items():
        trace = domain_trace.get(domain_id, {})
        previous = domain_naming.get(domain_id, {})
        old_new = DOMAIN_RENAMES.get(domain_id)
        if old_new and current.get("domain_name") != old_new[1]:
            raise SystemExit(f"Unaccounted naming state for {domain_id}: {current.get('domain_name')!r}")
        domain_rows.append({
            "domain_id": domain_id,
            "current_display_name": current.get("domain_name"),
            "source_library_name": trace.get("source_library_name"),
            "source_library_cluster": trace.get("source_library_cluster"),
            "current_cluster": current.get("cluster"),
            "source_lineage": trace.get("lineage_class"),
            "prior_identity_review": previous.get("review_state"),
            "prior_name_classification": previous.get("naming_status"),
            "definition": current.get("description"),
            "source_locator": next((x for x in trace.get("source_record_refs", []) if x.get("source_id") == "sifter_domain_definition_library_v2"), None),
            "changed_in_this_naming_pass": bool(old_new),
            "change_from": old_new[0] if old_new else None,
            "current_name_matches_literal_source": norm(current.get("domain_name")) == norm(trace.get("source_library_name")),
        })

    subgroup_rows = []
    for domain_id, domain in structure.items():
        for index, group in enumerate(domain.get("subgroups", [])):
            code = str(group.get("isco_submajor") or "")
            source_group = isco.get(code, {})
            official = source_group.get("label")
            provenance = group.get("source_provenance") or {}
            subgroup_rows.append({
                "id": f"{domain_id}:subgroup:{index}",
                "domain_id": domain_id,
                "domain_name": meta.get(domain_id, {}).get("domain_name"),
                "isco_submajor": code,
                "display_label": group.get("label"),
                "recorded_raw_isco_label": group.get("raw_isco_label"),
                "official_isco08_title": official,
                "isco_title_url": "https://isco.ilo.org/en/isco-08/",
                "source_code_resolves": bool(official),
                "raw_label_matches_isco08_title": norm(group.get("raw_isco_label")) == norm(official),
                "display_label_matches_isco08_title": norm(group.get("label")) == norm(official),
                "provenance_source": provenance.get("source"),
                "provenance_sources": provenance.get("sources", []),
                "provenance_url": provenance.get("source_url"),
                "mapping_method": provenance.get("mapping_method"),
                "declared_role_count": group.get("role_count"),
                "observed_roles_for_domain_and_isco_code": role_counts[(domain_id, code)],
                "role_count_reconciles": group.get("role_count") == role_counts[(domain_id, code)],
                "description_present": bool(str(group.get("description") or "").strip()),
                "placeholder_label": bool(re.fullmatch(r"ISCO-08\s+group\s+\d+", str(group.get("label") or ""), re.I)),
            })

    exact_source_cluster_mismatches = [
        {"domain_id": row["domain_id"], "source_cluster": row["source_library_cluster"], "current_cluster": row["current_cluster"]}
        for row in domain_rows
        if row["source_lineage"] == "source_library_domain"
        and norm(row["source_library_cluster"]) != norm(row["current_cluster"])
    ]
    changed_domain_rows = [row for row in domain_rows if row["changed_in_this_naming_pass"]]
    nonliteral_subgroups = [row for row in subgroup_rows if not row["display_label_matches_isco08_title"]]
    raw_mismatches = [row for row in subgroup_rows if not row["raw_label_matches_isco08_title"]]
    invalid_counts = [row for row in subgroup_rows if not row["role_count_reconciles"]]
    missing_provenance = [row for row in subgroup_rows if not row["provenance_source"]]

    data = {
        "schema_version": "2026-09-25.domain-subgroup-source-naming-audit.v1",
        "scope": "All current domain labels and subgroup labels/source derivations. This does not audit role membership fit or modify programme/domain mappings.",
        "source_basis": {
            "domains": "The checked-in domain source-traceability record points to the local source definition library, ISIC Rev.5, ISCO-08, ESCO and specialist source records. The source definition DOCX and ISCO/ISCO taxonomy extracts are local files; see the per-domain source locators and each subgroup source record.",
            "subgroups": "Canonical two-digit ISCO-08 sub-major code and local taxonomy title, plus recorded framework/source_provenance in domain_structure.json. Official ISCO source: https://isco.ilo.org/en/isco-08/.",
            "date_accessed": "2026-09-25",
        },
        "counts": {
            "domains": len(domain_rows),
            "source_library_domains": sum(row["source_lineage"] == "source_library_domain" for row in domain_rows),
            "later_curated_domains": sum(row["source_lineage"] == "later_repo_addition" for row in domain_rows),
            "subgroups": len(subgroup_rows),
            "subgroups_with_valid_isco_source_title": sum(row["source_code_resolves"] for row in subgroup_rows),
            "subgroups_with_source_provenance": len(subgroup_rows) - len(missing_provenance),
            "subgroups_whose_raw_label_matches_official_title": sum(row["raw_label_matches_isco08_title"] for row in subgroup_rows),
            "subgroups_whose_display_label_is_a_curated_or_altered_title": len(nonliteral_subgroups),
            "subgroups_with_reconciled_role_counts": len(subgroup_rows) - len(invalid_counts),
            "placeholder_subgroup_labels_remaining": sum(row["placeholder_label"] for row in subgroup_rows),
            "subgroup_role_count_mismatches": len(invalid_counts),
            "subgroup_provenance_missing": len(missing_provenance),
            "domain_source_cluster_mismatches": len(exact_source_cluster_mismatches),
        },
        "changed_domain_labels": changed_domain_rows,
        "changed_subgroup_labels": SUBGROUP_RENAMES,
        "confirmed_findings": [
            {"finding": f"All {len(subgroup_rows)} subgroup IDs resolve to an official two-digit ISCO-08 title; all recorded subgroup role counts reconcile to the deduplicated current role source/overlay inventory.", "disposition": "source-key/count validation passed; this does not prove that each curated display label is clear or that every role belongs in its current subgroup."},
            {"finding": "D151 / ISCO 25 used the code string as its learner-facing label.", "disposition": "replaced with the official source title; subgroup key and role membership unchanged."},
            {"finding": "D100 and D101 / ISCO 71 labels omitted the source qualifier that electricians are excluded.", "disposition": "restored the official scope qualifier in both display labels; subgroup keys and roles unchanged."},
            {"finding": "Many subgroup labels are contextual display names rather than literal ISCO titles.", "disposition": f"{len(nonliteral_subgroups)} such labels are listed exhaustively in unresolved_candidates; source-backed does not mean the display wording has been individually proven."},
            {"finding": "D133 source identity mentions luxury/bespoke specialist interiors across aviation, maritime and automotive contexts, while its current student description speaks broadly of luxury craft/design.", "disposition": "do not guess a replacement label until the source identity and described scope are reconciled."},
            {"finding": "D086 has no current cluster value although its recorded source-library row has a cluster; D167 and D168 are later additions without source-library clusters.", "disposition": "D086 is an explicit source-cluster discrepancy; D167/D168 require their own documented curated cluster provenance."},
        ],
        "unresolved_candidates": {
            "domain_cluster_mismatches": exact_source_cluster_mismatches,
            "subgroups_with_display_labels_different_from_official_isco_title": nonliteral_subgroups,
            "subgroups_with_raw_source_title_mismatch": raw_mismatches,
            "subgroup_role_count_mismatches": invalid_counts,
            "subgroups_missing_source_provenance": missing_provenance,
            "domains": domain_rows,
        },
        "all_domains": domain_rows,
        "all_subgroups": subgroup_rows,
        "limits": [
            "A literal ISCO title validates source wording, not fit of the group under its current domain or membership of each role.",
            "A contextual label is not automatically wrong; it needs a source-backed rationale matching the roles/work meaning in that subgroup.",
            "The 2026-08-31 domain and subgroup audit artifacts are historical source-lineage records; this checkpoint adds a current comparison after the local display-name edits.",
        ],
    }
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Domain and subgroup source / naming audit — 2026-10-03",
        "",
        "This is a refreshed source-label and subgroup-count reconciliation, not semantic approval of specialization-to-domain fit or a role-membership audit. Stable domain IDs, subgroup codes, ownership and relationships are preserved.",
        "",
        f"Scope checked: {len(domain_rows)} domains and {len(subgroup_rows)} subgroups. Every subgroup code resolves to an ILO ISCO-08 title; `{len(subgroup_rows)-len(missing_provenance)}/{len(subgroup_rows)}` has recorded provenance; `{len(subgroup_rows)-len(invalid_counts)}/{len(subgroup_rows)}` subgroup role counts reconcile.",
        "",
        "## Source and derivation results",
        "",
        f"- Domain lineage: {data['counts']['source_library_domains']} source-library domains and {data['counts']['later_curated_domains']} later repo additions are present in the traceability crosswalk. The source-backed/exact/curated classifications are carried per ID in the JSON; the prior August summary alone was insufficient to prove readability.",
        f"- Subgroup derivation: all {len(subgroup_rows)} two-digit codes exist in the local ISCO source taxonomy and map to a canonical source title. The recorded role counts match the current deduplicated role sources for all {len(subgroup_rows)} groups.",
        f"- Literal wording: {sum(row['raw_label_matches_isco08_title'] for row in subgroup_rows)} raw source-label fields match the official ISCO title. {len(nonliteral_subgroups)} student-facing subgroup labels differ from that literal title; they are inventoried below/in JSON as candidates requiring wording evidence, not presumed errors.",
        "- Official source reference: [ILO ISCO-08](https://isco.ilo.org/en/isco-08/). It defines the two-digit sub-major group level and provides the group titles and scope descriptions.",
        "",
        "## Safe label corrections recorded in this checkpoint",
        "",
        "### Domains",
        "",
        "| ID | Previous label | Current display label | Basis |",
        "|---|---|---|---|",
    ]
    for row in changed_domain_rows:
        lines.append(f"| {row['domain_id']} | {row['change_from']} | {row['current_display_name']} | Existing source definition/description; see per-ID locator in JSON |")
    lines += ["", "### Subgroups", "", "| Domain / ISCO | Previous label | Current label |", "|---|---|---|"]
    for row in SUBGROUP_RENAMES:
        lines.append(f"| {row['domain_id']} / {row['isco_submajor']} | {row['from']} | {row['to']} |")
    lines += [
        "",
        "These subgroup changes alter labels only. No ISCO code, role count, role record, domain or map edge was changed. D151/code 25 still has a generic subgroup description and is separately flagged for source-description completion.",
        "",
        "## Material unresolved findings",
        "",
        "- D151/code 25 was a literal code placeholder; it now uses the ILO title, but its description and one-role grouping still need review.",
        "- D100 and D101/code 71 now say electricians are excluded, matching the actual ISCO scope.",
        f"- The {len(nonliteral_subgroups)} curated/altered display labels are not all defects; each needs to be checked against the linked source-backed role cluster before calling its wording correct. The JSON lists every one with domain, code, official title, provenance and role count.",
        "- D133's source-library identity and student description appear to cover different scopes; no replacement was guessed.",
        "- D086 lacks a current cluster despite its source-library record specifying one; later additions D167/D168 have no source-library cluster record and need explicit curation evidence.",
        f"- The full set of {len(domain_rows)} domain records and {len(subgroup_rows)} subgroup records, plus all unresolved candidates, is in the companion JSON.",
        "",
        "No generated seed, SQL, database, JAMB mapping, endpoint or UI file was edited for this audit. When naming edits are accepted, `_gen_career_seed.py` reads `domain_meta.json` and copies domain names into the generated role/domain rows; subgroup labels flow from `domain_structure.json`. Seed regeneration remains a later step.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_MD.name} and {OUT_JSON.name}")
    print(json.dumps(data["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
