"""Apply a guarded, row-206-only JAMB/CCMAS mapping correction."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
AUDIT = CAREER / "_audit"
NAME = "Industrial Chemistry and Chemical Entrepreneurship"
FILES = {
    "programme_mapping": CAREER / "programme_mapping.json",
    "scopes": AUDIT / "jamb_curriculum_scopes_2026-08-17.json",
    "canonical": AUDIT / "jamb_domain_map_ccmas_derived_2026-08-17.json",
    "active": CAREER / "jamb_domain_map.json",
}
SNAPSHOT = AUDIT / "row_206_industrial_chemistry_before_2026-09-25.json"
OFFICIAL_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_record(path: Path, marker: str, updated: dict, *, mapping_list: bool = False) -> None:
    """Replace one JSON object in-place while preserving all other source bytes."""
    text = path.read_text(encoding="utf-8")
    if mapping_list:
        needle = f'"jamb_name": {json.dumps(marker, ensure_ascii=False)}'
        at = text.index(needle)
        start = text.rfind("{", 0, at)
        if start < 0:
            raise RuntimeError(f"Could not locate row object start in {path}")
        line_start = text.rfind("\n", 0, start) + 1
        indent = text[line_start:start]
    else:
        needle = f'{json.dumps(marker, ensure_ascii=False)}: {{'
        at = text.index(needle)
        start = text.index("{", at + len(needle) - 1)
        line_start = text.rfind("\n", 0, at) + 1
        indent = text[line_start:at]

    decoder = json.JSONDecoder()
    _, end_relative = decoder.raw_decode(text[start:])
    end = start + end_relative
    rendered = json.dumps(updated, ensure_ascii=False, indent=2)
    rendered_lines = rendered.splitlines()
    replacement = rendered_lines[0] + "\n" + "\n".join(indent + line for line in rendered_lines[1:])
    path.write_text(text[:start] + replacement + text[end:], encoding="utf-8")


def main() -> None:
    before = {key: read(path) for key, path in FILES.items()}
    mapping_rows = before["programme_mapping"]["mappings"]
    if len(mapping_rows) < 206 or mapping_rows[205].get("jamb_name") != NAME:
        raise RuntimeError("Row 206 identity/order changed; refusing to apply correction")
    old_map = mapping_rows[205]
    if old_map.get("ccmas_code") != "ENP":
        raise RuntimeError(f"Expected row 206's known wrong ENP assignment; found {old_map.get('ccmas_code')!r}")
    if SNAPSHOT.exists():
        raise RuntimeError(f"Before-snapshot already exists: {SNAPSHOT}")

    scope_rows = before["scopes"]["rows"]
    old_scope = scope_rows[205]
    if old_scope.get("jamb_name") != NAME or old_scope.get("component_refs") != ["Administration and Management::Entrepreneurship"]:
        raise RuntimeError("Row 206 scope does not match the audited ENP-only baseline")
    if NAME not in before["canonical"] or NAME not in before["active"]:
        raise RuntimeError("Row 206 canonical/active map entries are missing")

    ccmas = read(CAREER / "ccmas" / "sciences.json")
    programmes = [p for p in ccmas["programmes"] if p.get("code") == "ICH" and p.get("name") == "Industrial Chemistry"]
    if len(programmes) != 1:
        raise RuntimeError("Expected exactly one CCMAS Sciences::Industrial Chemistry package")
    courses = [
        {
            "code": course["code"],
            "title": course["title"],
            "scope_match_terms": ["industrial chemistry"],
            "source_ccmas_file": "sciences.json",
            "source_ccmas_programme": "Industrial Chemistry",
            "source_url": OFFICIAL_URL,
            "source_locator": "NUC Sciences CCMAS 2023, Industrial Chemistry programme and course structure, printed pp. 296–299",
        }
        for course in programmes[0].get("courses", [])
    ]
    if any(course["code"] == "ICH 422" for course in courses):
        raise RuntimeError("ICH 422 extraction state changed; remove the explicit source-gap guard")
    courses.append(
        {
            "code": "ICH 422",
            "title": "Entrepreneurship for Industrial Chemistry",
            "scope_match_terms": ["entrepreneurship", "industrial chemistry"],
            "source_ccmas_file": "NUC Sciences CCMAS 2023 PDF",
            "source_ccmas_programme": "Industrial Chemistry",
            "source_url": OFFICIAL_URL,
            "source_locator": "printed p. 298 course structure; outcome text not yet reconciled into the local extraction",
        }
    )
    if len(courses) != 43 or len({course["code"] for course in courses}) != 43:
        raise RuntimeError(f"Unexpected Industrial Chemistry course set: {len(courses)} records")

    updated_mapping = dict(old_map)
    updated_mapping.update(
        {
            "ccmas_code": "ICH",
            "ccmas_discipline": "Sciences",
            "ccmas_name": "Industrial Chemistry",
            "mapping_note": "exact CCMAS Industrial Chemistry component; entrepreneurship is included in ICH course structure",
        }
    )

    updated_scope = dict(old_scope)
    updated_scope.update(
        {
            "inheritance_type": "partial_curriculum_scope",
            "component_refs": ["Sciences::Industrial Chemistry"],
            "scope_status": "partial_scope_review_required",
            "scope_reason": "Component corrected to the exact CCMAS Industrial Chemistry programme. Hold student paths until the parsed JAMB offering context, local course extraction (including ICH 422), and each domain relationship are reconciled.",
            "scope_approval": "review_required",
            "scope_selection_method": "authoritative_ccmas_component_with_source_locators",
            "selected_courses": courses,
            "domain_links": [],
        }
    )

    selected_codes = [course["code"] for course in courses]
    updated_map_entry = {
        "links": [],
        "inheritance_type": "partial_curriculum_scope",
        "mapping_status": "review_required",
        "status_reason": "Industrial Chemistry CCMAS component corrected; exact offering scope, local ICH 422 extraction, and domain links remain under review",
        "ccmas_components": ["Sciences::Industrial Chemistry"],
        "curriculum_scope": {
            "status": "partial_scope_review_required",
            "source": "NUC Sciences CCMAS 2023",
            "note": updated_scope["scope_reason"],
            "approval": "review_required",
            "selected_course_count": len(courses),
            "selected_course_codes": selected_codes,
        },
        "source": "jamb_ccmas_inheritance_canonical_2026-08-17.json",
    }

    snapshot = {
        "recorded_at": "2026-09-25",
        "row": 206,
        "jamb_name": NAME,
        "files": {
            "programme_mapping": old_map,
            "scope": old_scope,
            "canonical": before["canonical"][NAME],
            "active": before["active"][NAME],
        },
    }
    write(SNAPSHOT, snapshot)

    replace_record(FILES["programme_mapping"], NAME, updated_mapping, mapping_list=True)
    replace_record(FILES["scopes"], NAME, updated_scope, mapping_list=True)
    replace_record(FILES["canonical"], NAME, updated_map_entry)
    replace_record(FILES["active"], NAME, updated_map_entry)

    after = {key: read(path) for key, path in FILES.items()}
    assert after["programme_mapping"]["mappings"][205]["ccmas_code"] == "ICH"
    assert after["scopes"]["rows"][205]["component_refs"] == ["Sciences::Industrial Chemistry"]
    assert len(after["scopes"]["rows"][205]["selected_courses"]) == 43
    for key in ("canonical", "active"):
        entry = after[key][NAME]
        assert entry["ccmas_components"] == ["Sciences::Industrial Chemistry"]
        assert entry["mapping_status"] == "review_required"
        assert entry["links"] == []
        assert entry["curriculum_scope"]["selected_course_count"] == 43
    print("Updated only JAMB row 206 across programme mapping, curriculum scope, canonical map, and active map.")
    print(f"Preserved pre-change row snapshot: {SNAPSHOT.relative_to(ROOT)}")
    print("Scope retains 43 CCMAS course records (42 parsed + ICH 422 from official PDF); active links remain fail-closed.")


if __name__ == "__main__":
    main()
