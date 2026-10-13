import copy
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
NAME = "Plant Science and Microbiology"
ROW_INDEX = 219
SNAPSHOT = AUDIT / "row_220_plant_science_microbiology_before_2026-09-25.json"

FILES = {
    "mapping": ROOT / "data/career-mapping/programme_mapping.json",
    "scope": AUDIT / "jamb_curriculum_scopes_2026-08-17.json",
    "canonical": AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json",
    "derived": AUDIT / "jamb_domain_map_ccmas_derived_2026-08-17.json",
    "active": ROOT / "data/career-mapping/jamb_domain_map.json",
}

BOTANY_CODES = [
    "BOT 102", "BOT 202", "BOT 203", "BOT 301", "BOT 302",
    "BOT 303", "BOT 304", "BOT 306", "BOT 312", "BOT 409",
]


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, data):
    indent = 1 if path.name in {
        "programme_mapping.json",
        "jamb_curriculum_scopes_2026-08-17.json",
    } else 2
    path.write_text(json.dumps(data, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8")


def mapping_row(doc):
    return doc["mappings"][ROW_INDEX]


def scope_row(doc):
    return doc["rows"][ROW_INDEX]


def canonical_row(doc):
    return doc["rows"][ROW_INDEX]


def map_row(doc):
    return doc[NAME]


docs = {key: read(path) for key, path in FILES.items()}
assert mapping_row(docs["mapping"])["jamb_name"] == NAME
assert scope_row(docs["scope"])["jamb_name"] == NAME
assert canonical_row(docs["canonical"])["jamb_name"] == NAME
assert NAME in docs["derived"] and NAME in docs["active"]
assert len(canonical_row(docs["canonical"]).get("domain_links", [])) == 6
assert scope_row(docs["scope"]).get("scope_status") == "partial_scope_reviewed"

snapshot = {
    "row_number": ROW_INDEX + 1,
    "jamb_name": NAME,
    "artifacts": {
        key: copy.deepcopy(
            mapping_row(doc) if key == "mapping" else
            scope_row(doc) if key == "scope" else
            canonical_row(doc) if key == "canonical" else
            map_row(doc)
        )
        for key, doc in docs.items()
    },
}
if SNAPSHOT.exists():
    prior_snapshot = read(SNAPSHOT)
    assert prior_snapshot["row_number"] == ROW_INDEX + 1 and prior_snapshot["jamb_name"] == NAME
else:
    write(SNAPSHOT, snapshot)

ccmas = read(ROOT / "data/career-mapping/ccmas/sciences.json")
programmes = {p["name"]: p for p in ccmas["programmes"]}
botany = programmes["Botany"]
microbiology = programmes["Microbiology"]
botany_courses = {c["code"]: c for c in botany["courses"]}
micro_courses = {c["code"]: c for c in microbiology["courses"]}
assert all(code in botany_courses and botany_courses[code].get("skills_learned") for code in BOTANY_CODES)

mapping = mapping_row(docs["mapping"])
mapping["ccmas_supporting_components"] = [
    {"ccmas_code": "BOT", "ccmas_discipline": "Sciences", "ccmas_name": "Botany", "basis": "named Plant Science facet; bounded plant-specific CCMAS courses"}
]
mapping["ccmas_component_refs"] = ["Sciences::Microbiology", "Sciences::Botany"]
mapping["mapping_note"] = "Primary CCMAS Microbiology plus supporting Botany component for the named Plant Science facet; bounded Botany courses only, not a full-component union. Exact JAMB awarder-row verification remains open."

scope = scope_row(docs["scope"])
scope["component_refs"] = ["Sciences::Microbiology", "Sciences::Botany"]
scope["scope_status"] = "partial_scope_review_required"
scope["scope_reason"] = "The exact JAMB identity names both Plant Science and Microbiology. NUC CCMAS contains distinct Botany and Microbiology curricula; selected Botany courses cover the named plant-science facet without importing the full Botany component. Keep held pending primary JAMB awarder-row verification and downstream link review."
scope["scope_approval"] = "review_required"
scope["scope_selection_method"] = "manual_named_facet_course_outcome_review"
selected = scope["selected_courses"]
selected_codes = {row["code"] for row in selected}
for code in BOTANY_CODES:
    if code in selected_codes:
        continue
    course = botany_courses[code]
    selected.append({
        "code": code,
        "title": course["title"],
        "scope_match_terms": ["plant_science"],
        "source_ccmas_file": "sciences.json",
        "source_ccmas_programme": "Botany",
    })
scope["domain_links"] = []
scope["candidate_domain_links"] = copy.deepcopy(canonical_row(docs["canonical"])["domain_links"])
scope["candidate_domain_links_status"] = "audit_only_from_superseded_Microbiology_only_scope; not confirmed for combined Plant Science and Microbiology"

canonical = canonical_row(docs["canonical"])
canonical["supporting_components"] = [{
    "discipline": "Sciences", "name": "Botany", "code": "BOT", "role": "supporting",
    "resolution_method": "named_plant_science_facet_bounded_ccmas_course_outcomes",
}]
canonical["component_refs"] = ["Sciences::Microbiology", "Sciences::Botany"]
codes = sorted((
    {row["code"] for row in scope["selected_courses"]}
), key=lambda value: (int(value.split()[1]), value.split()[0]))
canonical["curriculum_scope"] = {
    "status": "partial_scope_review_required",
    "source": "NUC Sciences CCMAS 2023",
    "note": "Primary Microbiology scope plus a bounded Botany course slice for the named Plant Science facet; the full Botany component was not unioned. Exact JAMB awarder-row verification and domain-link review remain open.",
    "approval": "review_required",
    "selected_course_count": len(codes),
    "selected_course_codes": codes,
}
canonical["component_domain_evidence"] = [
    {"component_ref": ref, "role": role, "domain_link_count": 0,
     "reviewed_domain_link_count": 0, "source_review_link_count": 0,
     "has_reviewed_domain_evidence": False}
    for ref, role in [("Sciences::Microbiology", "primary"), ("Sciences::Botany", "supporting")]
]
old_links = copy.deepcopy(canonical["domain_links"])
canonical["domain_links"] = []
canonical["candidate_ccmas_domain_links"] = old_links
canonical["candidate_ccmas_domain_links_status"] = "audit_only_from_superseded_Microbiology_only_scope; not confirmed for combined Plant Science and Microbiology"
canonical["current_jamb_domain_link_count"] = 0
canonical["mapping_status"] = "review_required"
canonical["status_reason"] = "Named-facet curriculum scope corrected using bounded Botany CCMAS outcomes; exact JAMB awarder-row verification and all downstream links remain unreviewed."

for key in ("derived", "active"):
    row = map_row(docs[key])
    row["candidate_domain_links"] = copy.deepcopy(old_links)
    row["candidate_domain_links_status"] = "audit_only_from_superseded_Microbiology_only_scope; not confirmed for combined Plant Science and Microbiology"
    row["links"] = []
    row["mapping_status"] = "review_required"
    row["status_reason"] = canonical["status_reason"]
    row["ccmas_components"] = ["Sciences::Microbiology", "Sciences::Botany"]
    row["curriculum_scope"] = copy.deepcopy(canonical["curriculum_scope"])

for key, path in FILES.items():
    write(path, docs[key])

# Re-read and enforce row-level parity plus unchanged non-target rows.
after = {key: read(path) for key, path in FILES.items()}
assert mapping_row(after["mapping"])["ccmas_component_refs"] == canonical["component_refs"]
assert scope_row(after["scope"])["component_refs"] == canonical["component_refs"]
assert canonical_row(after["canonical"])["component_refs"] == canonical["component_refs"]
assert canonical_row(after["canonical"])["curriculum_scope"]["selected_course_codes"] == codes
assert len(codes) == len(set(codes)) == canonical["curriculum_scope"]["selected_course_count"]
assert not canonical_row(after["canonical"])["domain_links"]
assert len(canonical_row(after["canonical"])["candidate_ccmas_domain_links"]) == 6
assert canonical_row(after["canonical"])["mapping_status"] == "review_required"
for key in ("derived", "active"):
    assert not map_row(after[key])["links"]
    assert map_row(after[key])["curriculum_scope"]["selected_course_codes"] == codes
    assert map_row(after[key])["mapping_status"] == "review_required"
assert scope_row(after["scope"])["scope_approval"] == "review_required"
print(f"PASS: row 220 updated across five artifacts; {len(codes)} scoped courses, 10 bounded Botany courses, zero active links, 6 audit-only candidates; before-snapshot: {SNAPSHOT}")
