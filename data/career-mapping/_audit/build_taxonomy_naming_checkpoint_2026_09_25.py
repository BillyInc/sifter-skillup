"""Snapshot taxonomy labels and record the conservative 2026-09-25 naming pass."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = ROOT / "domain_meta.json"
STRUCTURE = ROOT / "domain_structure.json"
ROLES = ROOT / "role_library_v3_cleaned.json"
OUT_JSON = ROOT / "_audit" / "taxonomy_naming_checkpoint_2026-09-25.json"
OUT_MD = ROOT / "_audit" / "taxonomy_naming_checkpoint_2026-09-25.md"

CHANGES = {
    "D011": ("Quantitative Finance", "Quantitative Finance and Financial Engineering"),
    "D007": ("UI/UX Design", "User Interface and User Experience Design"),
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


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def flags(label: str) -> list[str]:
    reasons = []
    if any(mark in label for mark in ("/", "&", ",", "—", "�")):
        reasons.append("compound_or_special_punctuation")
    if "�" in label or label.count("(") != label.count(")"):
        reasons.append("encoding_or_unbalanced_punctuation")
    if re.search(r"\b(?:nan|unknown|miscellaneous|not elsewhere classified)\b", label, re.I):
        reasons.append("placeholder_or_source_classification");
    if re.search(r"\b(?:stewardess|waitress|actress|postwoman|groundswoman|hostess|mistress|masseuse)\b", label, re.I):
        reasons.append("gendered_or_slash_stacked_legacy_title")
    if label != label[:1].upper() + label[1:]:
        reasons.append("lowercase_initial")
    return reasons


def main() -> None:
    meta = read(META)
    structure = read(STRUCTURE)
    roles = read(ROLES)

    changed = []
    for domain_id, (old, new) in CHANGES.items():
        actual = meta[domain_id]["domain_name"]
        if actual not in (old, new):
            raise SystemExit(f"Unexpected current label for {domain_id}: {actual!r}")
        changed.append({"domain_id": domain_id, "from": old, "to": new,
                        "basis": "The existing domain description explicitly defines the full phrase; stable ID, boundary, ownership and links are unchanged."})

    candidates = {"domains": [], "subgroups": [], "roles": []}
    all_labels = {"domains": [], "subgroups": [], "roles": []}
    for domain_id, row in meta.items():
        label = row.get("domain_name", "")
        rec = {"id": domain_id, "label": label, "flags": flags(label)}
        all_labels["domains"].append(rec)
        if rec["flags"]:
            candidates["domains"].append(rec)
    for domain_id, row in structure.items():
        for index, subgroup in enumerate(row.get("subgroups", [])):
            label = str(subgroup.get("label", ""))
            rec = {"id": f"{domain_id}:subgroup:{index}", "domain_id": domain_id,
                   "label": label, "isco_submajor": subgroup.get("isco_submajor"),
                   "raw_isco_label": subgroup.get("raw_isco_label"), "flags": flags(label)}
            all_labels["subgroups"].append(rec)
            if rec["flags"] or (rec["raw_isco_label"] and rec["raw_isco_label"] != "Source-backed occupational grouping"):
                if rec["raw_isco_label"] and rec["raw_isco_label"] != "Source-backed occupational grouping":
                    rec["flags"].append("inherited_isco_class_needs_student_display_review")
                candidates["subgroups"].append(rec)
    for index, role in enumerate(roles):
        label = str(role.get("role_name", ""))
        rec = {"id": f"{role.get('domain_id', 'unknown')}:role:{role.get('role_number', index)}",
               "domain_id": role.get("domain_id"), "label": label,
               "source": role.get("source"), "isco_group": role.get("isco_group"),
               "esco_code": role.get("esco_code"), "flags": flags(label)}
        all_labels["roles"].append(rec)
        if rec["flags"]:
            candidates["roles"].append(rec)

    payload = {
        "schema_version": "2026-09-25.taxonomy-naming-checkpoint.v1",
        "scope": "Complete current domain, subgroup and cleaned canonical-role label inventories; this is a naming audit, not a taxonomy-boundary or mapping audit.",
        "counts": {key: len(value) for key, value in all_labels.items()},
        "changed_domain_labels": changed,
        "changed_subgroup_labels": [
            {
                "domain_id": "D151", "isco_submajor": "25", "from": "ISCO-08 group 25",
                "to": "Information and Communications Technology Professionals",
                "basis": "Exact source title for the canonical ISCO-08 code 25; role assignments were not changed.",
            },
            {
                "domain_id": "D100", "isco_submajor": "71", "from": "Building and Related Trades Workers",
                "to": "Building and Related Trades Workers (Excluding Electricians)",
                "basis": "Restores the official ISCO-08 scope qualifier; role assignments were not changed.",
            },
            {
                "domain_id": "D101", "isco_submajor": "71", "from": "Building and Related Trades Workers",
                "to": "Building and Related Trades Workers (Excluding Electricians)",
                "basis": "Restores the official ISCO-08 scope qualifier; role assignments were not changed.",
            },
        ],
        "changed_role_display_labels": [
            {
                "domain_id": role["domain_id"],
                "canonical_role_key_name": role["role_name"],
                "student_display_name": role["student_display_name"],
                "esco_code": role.get("esco_code"),
                "basis": role.get("description"),
                "identity_preserved": True,
            }
            for role in roles if role.get("student_display_name")
        ],
        "unresolved_candidate_counts": {key: len(value) for key, value in candidates.items()},
        "unresolved_candidates": candidates,
        "all_current_labels": all_labels,
        "limitations": [
            "Punctuation and source-classification flags are triage signals, not proof that a label is wrong.",
            "Inherited ISCO subgroup labels may indicate a grouping/mapping issue, not just a wording issue; do not rename them until membership and source meaning are reviewed.",
            "Canonical role_name values remain stable role-key inputs. Nineteen source-described legacy gendered titles have separate student_display_name values; other source-style labels remain review candidates.",
            "Technical acronyms were expanded only where the existing domain description states their meaning and domain scope.",
        ],
        "regeneration": "This naming checkpoint predates final seed regeneration; the append-only execution checkpoint records the generated local SQL and compressed-part manifest after regeneration. No SQL was applied.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Taxonomy naming checkpoint — 2026-09-25",
        "",
        "Append-only, conservative naming pass. Stable IDs and all ownership, relationships, descriptions and technical meaning are preserved. This does not alter JAMB mappings, endpoints, SQL or the database.",
        "",
        f"Inventory: {len(all_labels['domains'])} domains; {len(all_labels['subgroups'])} subgroup labels; {len(all_labels['roles'])} canonical role labels.",
        "",
        "## Safe domain display-name changes",
        "",
        "| ID | Before | After |",
        "|---|---|---|",
    ]
    lines.extend(f"| {item['domain_id']} | {item['from']} | {item['to']} |" for item in changed)
    lines += [
        "",
        "These are grounded in each domain's existing `domain_meta.json` description. The particularly unclear labels called out by the user are now **Marketing and Brand Management** and **Banking and Credit Services**. `D146` encoding and `D115` unmatched-parenthesis defects are also corrected.",
        "",
        "Three subgroup labels were corrected against official ISCO-08 titles/scope: D151/code 25 placeholder, and D100/D101 code 71 missing the qualifier excluding electricians. Codes, role membership and edges were not changed; D151's generic description remains an unresolved content issue.",
        "",
        "## Source-backed student role display labels",
        "",
        "Nineteen legacy gendered/slash titles now have plain student-facing display names grounded in the existing role descriptions. Canonical `role_name` stays unchanged as the role-key input, preserving role UUIDs and edges.",
        "",
        "| Domain | Canonical source title | Student display name |",
        "|---|---|---|",
    ]
    lines.extend(
        f"| {role['domain_id']} | {role['role_name']} | {role['student_display_name']} |"
        for role in roles if role.get("student_display_name")
    )
    lines += [
        "",
        "## Unresolved inventory",
        "",
        "The companion JSON is the exhaustive label-level inventory, with IDs/source pointers and triage flags for every domain, subgroup and role. Counts below are candidate labels, not confirmed defects:",
        "",
        f"- Domains: {len(candidates['domains'])} flagged; unflagged names were not otherwise rewritten.",
        f"- Subgroups: {len(candidates['subgroups'])} flagged. Imported ISCO class titles are retained as unresolved where they may be standing in for a subgroup; changing a label without first validating its role membership could conceal a structural mismatch.",
        "Example to clarify the risk: Robotics Engineering (`D140`) currently has subgroup labels such as `Teaching professionals` and `Assemblers`. A prettier label alone would not tell us whether the actual roles under those headings belong there; we must inspect those memberships before renaming or restructuring them.",
        f"- Roles: {len(candidates['roles'])} flagged by conservative triage. Nineteen supported student display labels are listed in the source-backed role section; other punctuation/source-title flags are not treated as defects without evidence.",
        "",
        "## Source layer and regeneration",
        "",
        "`domain_meta.json`, `domain_structure.json` and `role_library_v3_cleaned.json` are the source inputs. This checkpoint is an interim naming snapshot; see the append-only execution update for the verified local seed/transport status. No SQL was applied.",
        "",
        "The unresolved label inventory is intentionally retained in `taxonomy_naming_checkpoint_2026-09-25.json`; punctuation heuristics are triage only and do not establish a defect. Seed regeneration status is superseded by the append-only execution checkpoint.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_MD.relative_to(ROOT)} and {OUT_JSON.relative_to(ROOT)}")
    print("Counts:", payload["counts"])
    print("Unresolved candidates:", payload["unresolved_candidate_counts"])


if __name__ == "__main__":
    main()
