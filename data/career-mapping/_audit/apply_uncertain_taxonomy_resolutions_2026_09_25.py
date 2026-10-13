#!/usr/bin/env python3
"""Apply evidence-backed fixes for the 2026-09-25 uncertain label audit."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, value, *, indent: int) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8")


meta_path = ROOT / "data/career-mapping/domain_meta.json"
structure_path = ROOT / "data/career-mapping/domain_structure.json"
cleaned_roles_path = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
source_roles_path = ROOT / "data/career-mapping/role_library_v3.json"

meta = load(meta_path)
structure = load(structure_path)
cleaned_roles = load(cleaned_roles_path)
source_roles = load(source_roles_path)

domain_fixes = {
    "D086": {
        "domain_name": "Gaming, Betting and Lottery Operations",
        "cluster": "Retail, Sales & Commerce",
        "clusters": ["Retail, Sales & Commerce"],
    },
    "D087": {"domain_name": "Hairdressing, Barbering & Hair Technology"},
    "D088": {"domain_name": "Beauty Therapy, Aesthetics & Spa Services"},
    "D100": {
        "domain_name": "Plumbing, Pipefitting & HVAC Technology",
    },
    "D101": {
        "domain_name": "Painting, Decorating & Surface Treatment",
    },
    "D133": {
        "domain_name": "Luxury & Bespoke Specialist Interiors",
        "description": "Design, make, fit and restore bespoke interiors for aircraft, ships and vehicles. This specialist field concerns transport interiors, not luxury fashion or craft production generally.",
    },
    "D167": {
        "description": "Design and build augmented-, virtual- and mixed-reality experiences and the systems that support them. Depending on the role, work may involve 3D software, interaction design, spatial computing, headsets, sensors or haptics.",
    },
    "D168": {
        "description": "Explore work across competitive gaming and online content: playing, coaching, analysing, organising events, producing broadcasts, creating journalism or media, and managing communities or partnerships. These are related career pathways, not one standardized occupation.",
    },
}

for domain_id, fields in domain_fixes.items():
    if domain_id not in meta:
        raise KeyError(f"Missing domain metadata: {domain_id}")
    meta[domain_id].update(fields)

subgroup_fixes = {
    ("D107", "31"): ("Footwear & Leather Production, Technical, Quality and Supervisory Roles", "This group includes footwear and leather production technicians, product developers, quality staff and production supervisors."),
    ("D111", "72"): ("Textile Machinery Maintenance and Repair", "Maintain and repair the machinery used in textile production."),
    ("D111", "75"): ("Textile Product Inspection", "Inspect textile products and assess whether they meet specified quality requirements."),
    ("D111", "81"): ("Textile, Apparel and Laundry Machine Operations", "Operate machinery used to process textiles and apparel, and to perform laundry operations."),
    ("D129", "01"): ("Commissioned Armed Forces Officers", "Lead, plan and command armed-forces units in commissioned officer roles."),
    ("D129", "02"): ("Non-commissioned Armed Forces Officers", "Lead and supervise personnel in non-commissioned armed-forces roles."),
    ("D129", "03"): ("Armed Forces Occupations, Other Ranks", "Carry out operational, combat and technical work in armed-forces roles outside commissioned and non-commissioned officer groups."),
}

for (domain_id, code), (label, description) in subgroup_fixes.items():
    domain = structure.get(domain_id)
    if not domain:
        raise KeyError(f"Missing domain structure: {domain_id}")
    subgroup = next((row for row in domain.get("subgroups", []) if str(row.get("isco_submajor")) == code), None)
    # D129's codes are corrected on the role records below; its old numeric keys
    # are intentionally replaced by the generator, not silently retained here.
    if subgroup:
        subgroup["label"] = label
        subgroup["description"] = description
        if domain_id == "D129":
            subgroup["raw_isco_label"] = {
                "01": "Commissioned armed forces officers",
                "02": "Non-commissioned armed forces officers",
                "03": "Armed forces occupations, other ranks",
            }[code]
            subgroup.setdefault("source_provenance", {})["source_url"] = "https://isco.ilo.org/en/isco-08/"

# Remove the stale forensic subgroup and the three invalid military groups.
# The canonical generator will rebuild D129 under the corrected string keys.
structure["D143"]["subgroups"] = [
    row for row in structure["D143"].get("subgroups", [])
    if str(row.get("isco_submajor")) != "21"
]
structure["D129"]["subgroups"] = [
    row for row in structure["D129"].get("subgroups", [])
    if str(row.get("isco_submajor")) not in {"11", "21", "31"}
]

# These four records have no evidence of forensic specialization. Three are
# already present under D041 (Physics and Astronomy); the residual life-science
# record is not a student-specific occupation. Remove only their D143 paths.
bad_forensic_names = {
    "life scientists, all other",
    "astronomer",
    "cosmologist",
    "physicist",
}
before = len(cleaned_roles)
cleaned_roles = [
    row for row in cleaned_roles
    if not (row.get("domain_id") == "D143" and row.get("role_name", "").casefold() in bad_forensic_names)
]
removed = before - len(cleaned_roles)
if removed not in {0, 4}:
    raise ValueError(f"Expected an idempotent removal of zero or four unsupported D143 associations, removed {removed}")

# ISCO unit-group codes are identifiers, not quantities. Preserve the four
# characters for the three Major Group 0 groups so their leading zero survives.
military_codes = {
    "fleet commander": "0110",
    "navy officer": "0110",
    "artillery officer": "0110",
    "army captain": "0110",
    "lieutenant": "0110",
    "colonel": "0110",
    "brigadier": "0110",
    "armed forces officer": "0110",
    "army general": "0110",
    "squadron leader": "0110",
    "army major": "0110",
    "air force officer": "0110",
    "special forces officer": "0210",
    "army corporal": "0210",
    "warfare specialist": "0210",
    "sergeant": "0210",
    "intelligence communications interceptor": "0310",
    "military engineer": "0310",
    "infantry soldier": "0310",
    "air force pilot": "0310",
    "bomb disposal technician": "0310",
}
for collection_name, rows in (("cleaned", cleaned_roles), ("source", source_roles)):
    seen = set()
    for row in rows:
        if row.get("domain_id") == "D129" and row.get("role_name", "").casefold() in military_codes:
            name = row["role_name"].casefold()
            row["isco_group"] = military_codes[name]
            seen.add(name)
    if seen != set(military_codes):
        raise ValueError(f"{collection_name} military role set mismatch: missing {sorted(set(military_codes) - seen)}")

save(meta_path, meta, indent=2)
save(structure_path, structure, indent=1)
save(cleaned_roles_path, cleaned_roles, indent=2)
save(source_roles_path, source_roles, indent=2)

print(f"Resolved domain labels/definitions: {len(domain_fixes)}")
print(f"Resolved subgroup labels/codes: {len(subgroup_fixes)}")
print(f"Removed unsupported D143 associations only: {removed}")
print(f"Preserved leading-zero ISCO unit codes on {len(military_codes)} roles")
