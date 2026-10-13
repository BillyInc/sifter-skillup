"""Reconcile only JAMB mapping row 420; hold paths pending offering split."""
from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data/career-mapping"
AUDIT = CAREER / "_audit"
NAME = "Transport Planning and Management"
SNAPSHOT = AUDIT / "jamb_row420_transport_before_reconciliation_2026-09-25.json"
FILES = {
    "mapping": CAREER / "programme_mapping.json",
    "scope": AUDIT / "jamb_curriculum_scopes_2026-08-17.json",
    "canonical": AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json",
    "derived": AUDIT / "jamb_domain_map_ccmas_derived_2026-08-17.json",
    "active": CAREER / "jamb_domain_map.json",
}
REASON = (
    "The prior Hospitality and Tourism Management component and its tourism-led "
    "course slice are unrelated to the named Transport Planning and Management "
    "curriculum and are removed from confirmed student paths. NUC Administration "
    "and Management CCMAS has a distinct B.Sc. Transport Management programme; "
    "the selected TPM-coded courses provide a named-facet candidate scope. JAMB "
    "also has an Education-faculty TASUED offering and a distinct Social Sciences "
    "brochure context with the same display name. TASUED distinguishes its B.Sc. "
    "and B.Sc. (Ed.) variants. The single name-keyed row cannot yet represent "
    "those award/context differences or the Education-specific curriculum. Keep "
    "the Transport Management scope and previous links audit-only; keep all "
    "student domain paths closed until offering variants and any Education "
    "component are reconciled from item-specific sources."
)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_snapshot(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get_array_row(doc, array_key: str) -> dict:
    matches = [x for x in doc[array_key] if isinstance(x, dict) and x.get("jamb_name") == NAME]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one {array_key} record for {NAME}; found {len(matches)}")
    return matches[0]


def replace_array_row(path: Path, array_key: str, row: dict) -> None:
    text = path.read_text(encoding="utf-8")
    needle = f'"jamb_name": {json.dumps(NAME, ensure_ascii=False)}'
    at = text.index(needle)
    start = text.rfind("{", 0, at)
    _, length = json.JSONDecoder().raw_decode(text[start:])
    end = start + length
    line_start = text.rfind("\n", 0, start) + 1
    indent = text[line_start:start]
    rendered = json.dumps(row, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
    text = text[:start] + replacement + text[end:]
    # Ensure we targeted the intended array occurrence and retained valid JSON.
    parsed = json.loads(text)
    if len([x for x in parsed[array_key] if x.get("jamb_name") == NAME]) != 1:
        raise RuntimeError(f"Row replacement validation failed in {path}")
    path.write_text(text, encoding="utf-8")


def replace_object_member(path: Path, row: dict) -> None:
    text = path.read_text(encoding="utf-8")
    needle = f'"{NAME}": {{'
    key_at = text.index(needle)
    start = key_at + len(f'"{NAME}": ')
    _, length = json.JSONDecoder().raw_decode(text[start:])
    end = start + length
    line_start = text.rfind("\n", 0, key_at) + 1
    indent = text[line_start:key_at]
    rendered = json.dumps(row, ensure_ascii=False, indent=2).splitlines()
    replacement = rendered[0] + "\n" + "\n".join(indent + "  " + line for line in rendered[1:])
    text = text[:start] + replacement + text[end:]
    parsed = json.loads(text)
    if NAME not in parsed:
        raise RuntimeError(f"Map replacement validation failed in {path}")
    path.write_text(text, encoding="utf-8")


# Recovery from the first interrupted run: it appended the two literal
# characters backslash+n after each JSON document. Remove only that exact suffix.
for path in FILES.values():
    raw = path.read_bytes()
    if raw.endswith(b"\\n"):
        path.write_bytes(raw[:-2])

docs = {key: load(path) for key, path in FILES.items()}
mapping = get_array_row(docs["mapping"], "mappings")
scope = get_array_row(docs["scope"], "rows")
canonical = get_array_row(docs["canonical"], "rows")
derived = docs["derived"].get(NAME)
active = docs["active"].get(NAME)
if not all(isinstance(x, dict) for x in (derived, active)):
    raise RuntimeError("Missing row 420 in derived or active map")
if SNAPSHOT.exists():
    before = load(SNAPSHOT)
    if before.get("row_number") != 420 or before.get("jamb_name") != NAME:
        raise RuntimeError("Existing row-420 snapshot does not match this task")
    old_links = copy.deepcopy(before["artifacts_before"]["canonical"].get("domain_links", []))
else:
    if mapping.get("ccmas_name") != "Hospitality and Tourism Management":
        raise RuntimeError("Row 420 source mapping changed from the audited HTM baseline")
    if scope.get("scope_status") != "partial_scope_reviewed" or len(scope.get("selected_courses", [])) != 27:
        raise RuntimeError("Row 420 scope changed from the audited 27-course HTM baseline")
    if active.get("mapping_status") != "ready_partial" or not active.get("links"):
        raise RuntimeError("Row 420 active map no longer matches the audited baseline")
    old_links = copy.deepcopy(canonical.get("domain_links", []))
    save_snapshot(SNAPSHOT, {
        "recorded_at": "2026-09-25",
        "row_number": 420,
        "jamb_name": NAME,
        "source_contexts": [
            "JAMB Education brochure; TASUED offering, locally parsed under Education",
            "JAMB Social Sciences brochure; distinct same-name context, awarders not reconciled in this row",
        ],
        "artifacts_before": {
            "mapping": copy.deepcopy(mapping),
            "scope": copy.deepcopy(scope),
            "canonical": copy.deepcopy(canonical),
            "derived": copy.deepcopy(derived),
            "active": copy.deepcopy(active),
        },
    })

ccmas = load(CAREER / "ccmas/administration_management.json")
programme = next(x for x in ccmas["programmes"] if x.get("code") == "TPM" and x.get("name") == "Transport Management")
courses = []
for course in programme["courses"]:
    code = course.get("code", "")
    title = course.get("title", "")
    if not code.startswith("TPM ") or title.strip().lower() in {"fundamentals of tourism"}:
        continue
    courses.append({
        "code": code,
        "title": title,
        "scope_match_terms": ["transport_planning_management"],
        "source_ccmas_file": "administration_management.json",
        "source_ccmas_programme": "Transport Management",
    })
if len(courses) < 30 or len({x["code"] for x in courses}) != len(courses):
    raise RuntimeError(f"Unexpected CCMAS Transport Management candidate course set: {len(courses)}")
course_codes = [x["code"] for x in courses]

mapping.update({
    "jamb_faculty": None,
    "mapping_type": "B_granular",
    "ccmas_code": "TPM",
    "ccmas_discipline": "Administration and Management",
    "ccmas_name": "Transport Management",
    "mapping_note": REASON,
    "ccmas_component_refs": ["Administration and Management::Transport Management"],
})
scope.update({
    "mapping_type": "B_granular",
    "inheritance_type": "partial_curriculum_scope",
    "component_refs": ["Administration and Management::Transport Management"],
    "scope_status": "partial_scope_review_required",
    "scope_reason": REASON,
    "scope_approval": "review_required",
    "scope_selection_method": "manual_named_facet_course_outcome_review",
    "selected_courses": courses,
    "domain_links": [],
    "candidate_domain_links": old_links,
    "candidate_domain_links_status": "audit_only_from_superseded_Hospitality_and_Tourism_scope; not confirmed for Transport Planning and Management",
    "external_source_refs": [
        {"title": "JAMB Education degree brochure", "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf", "locator": "printed p. 200; Transport Planning and Management (TPM)"},
        {"title": "JAMB Social Sciences degree brochure", "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf", "locator": "printed p. 575; same-name programme in separate faculty context"},
        {"title": "TASUED undergraduate admission", "url": "https://tasued.edu.ng/undergraduate-admission/", "locator": "College of Social and Management Sciences lists B.Sc. (Ed.) Transport Planning and Management"},
        {"title": "TASUED Geography and Environmental Management course list", "url": "https://tasued.edu.ng/geography-and-environmental-management-2/", "locator": "TPM-coded course list; includes transport planning, traffic, logistics and teaching methodology"},
        {"title": "NUC Administration and Management CCMAS", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf", "locator": "printed pp. 581–612; B.Sc. Transport Management, courses and outcomes"},
    ],
})

canonical.update({
    "mapping_type": "B_granular",
    "inheritance_type": "partial_curriculum_scope",
    "primary_component": {
        "discipline": "Administration and Management",
        "name": "Transport Management",
        "code": "TPM",
        "role": "primary",
        "resolution_method": "exact_named_ccmas_programme_and_course_outcomes",
    },
    "supporting_components": [],
    "component_refs": ["Administration and Management::Transport Management"],
    "curriculum_scope": {
        "status": "partial_scope_review_required",
        "source": "NUC Administration and Management CCMAS 2023; TASUED offering evidence used to identify variant boundary",
        "note": REASON,
        "approval": "review_required",
        "selected_course_count": len(courses),
        "selected_course_codes": course_codes,
    },
    "component_domain_evidence": [{
        "component_ref": "Administration and Management::Transport Management",
        "role": "primary",
        "domain_link_count": 0,
        "reviewed_domain_link_count": 0,
        "source_review_link_count": 0,
        "has_reviewed_domain_evidence": False,
    }],
    "domain_links": [],
    "candidate_ccmas_domain_links": old_links,
    "candidate_ccmas_domain_links_status": "audit_only_from_superseded_Hospitality_and_Tourism_scope; not confirmed for Transport Planning and Management",
    "current_jamb_domain_link_count": 0,
    "mapping_status": "review_required",
    "status_reason": REASON,
})

for row in (derived, active):
    row.update({
        "links": [],
        "inheritance_type": "partial_curriculum_scope",
        "mapping_status": "review_required",
        "status_reason": REASON,
        "ccmas_components": ["Administration and Management::Transport Management"],
        "curriculum_scope": copy.deepcopy(canonical["curriculum_scope"]),
        "candidate_domain_links": copy.deepcopy(old_links),
        "candidate_domain_links_status": "audit_only_from_superseded_Hospitality_and_Tourism_scope; not confirmed for Transport Planning and Management",
        "source": "row-420 fail-closed scope reconciliation 2026-09-25; see append-only checkpoint",
    })

replace_array_row(FILES["mapping"], "mappings", mapping)
replace_array_row(FILES["scope"], "rows", scope)
replace_array_row(FILES["canonical"], "rows", canonical)
replace_object_member(FILES["derived"], derived)
replace_object_member(FILES["active"], active)

# Verify target parity and that surrounding catalogue records were not altered.
after = {key: load(path) for key, path in FILES.items()}
assert get_array_row(after["mapping"], "mappings")["ccmas_name"] == "Transport Management"
assert get_array_row(after["scope"], "rows")["scope_status"] == "partial_scope_review_required"
assert get_array_row(after["scope"], "rows")["selected_courses"] == courses
assert get_array_row(after["canonical"], "rows")["curriculum_scope"]["selected_course_codes"] == course_codes
assert get_array_row(after["canonical"], "rows")["mapping_status"] == "review_required"
assert get_array_row(after["canonical"], "rows")["domain_links"] == []
for key in ("derived", "active"):
    assert after[key][NAME]["links"] == []
    assert after[key][NAME]["mapping_status"] == "review_required"
    assert after[key][NAME]["curriculum_scope"]["selected_course_codes"] == course_codes
    assert after[key].get("Transport Management") == docs[key].get("Transport Management")
print(f"PASS row 420: exact Transport Management CCMAS anchor, {len(courses)} named-facet candidate courses, six old links audit-only, zero confirmed student paths.")
print(f"Before-state: {SNAPSHOT.relative_to(ROOT)}")
