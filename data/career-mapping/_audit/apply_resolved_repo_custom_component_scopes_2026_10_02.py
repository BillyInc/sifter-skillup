"""Apply only fully resolved declared combined/custom component scopes.

The broader scope-builder output remains a candidate. This targeted applicator
copies only identities with declared combined CCMAS curricula or custom
components and verifies every declared component resolves to its exact CCMAS
package or repository enrichment bundle with programme-level source evidence.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CAREER = HERE.parent
CANONICAL = HERE / "jamb_curriculum_scopes_2026-08-17.json"
CANDIDATE = HERE / "jamb_curriculum_scopes_2026-10-02_combined_full_dry_run.json"
MANUAL_OVERRIDES = HERE / "jamb_ccmas_manual_scope_overrides_2026-09-25.json"
def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def has_component_evidence(row: dict, ref: str) -> bool:
    context_components = (row.get("source_context") or {}).get("components") or []
    resolved = next((item for item in context_components if item.get("component_ref") == ref), None)
    if resolved and resolved.get("status") == "resolved" and resolved.get("source_evidence"):
        return True
    # Manually curated mixed scopes store the combined programme, CCMAS and
    # external curriculum citations in scope_evidence instead.
    name = ref.split("::", 1)[-1].casefold()
    return any(
        item.get("url") and item.get("locator") and item.get("accessed_on") and item.get("supports")
        and (name in str(item.get("title", "")).casefold()
             or name in str(item.get("supports", "")).casefold()
             or name in str(item.get("locator", "")).casefold())
        for item in row.get("scope_evidence") or []
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write verified custom-component rows into canonical scopes")
    args = parser.parse_args()
    current = read(CANONICAL)
    candidate = read(CANDIDATE)
    manual = read(MANUAL_OVERRIDES)
    current_by_name = {row["jamb_name"]: row for row in current["rows"]}
    candidate_by_name = {row["jamb_name"]: row for row in candidate["rows"]}
    full_component_names = {
        row["jamb_name"] for row in manual.get("overrides", [])
        if row.get("scope_status") == "full_scope_review_required"
        and any(item.get("all_source_courses") for item in row.get("component_courses", []))
    }
    targets = {
        name for name, row in current_by_name.items()
        if row.get("inheritance_type") == "combined_ccmas_curriculum"
        or any(str(ref).startswith("__custom__::") for ref in row.get("component_refs", []))
    } | full_component_names
    if not targets.issubset(candidate_by_name):
        raise SystemExit(f"Candidate is missing expected names: {sorted(targets - set(candidate_by_name))}")

    replacements = {}
    for name in sorted(targets):
        row = candidate_by_name[name]
        refs = [ref for ref in row.get("component_refs", []) if str(ref).startswith("__custom__::")]
        if not row.get("selected_courses"):
            raise SystemExit(f"{name}: declared component or selected curriculum is empty")
        if row.get("scope_status") not in {"full", "external_scope_evidenced", "combined_scope_reviewed"}:
            raise SystemExit(f"{name}: candidate is not resolved/reviewed ({row.get('scope_status')})")
        if row.get("inheritance_type") == "combined_ccmas_curriculum" or name in full_component_names:
            components = (row.get("source_context") or {}).get("components") or []
            if not components or any(item.get("status") != "resolved" for item in components):
                raise SystemExit(f"{name}: not all declared combined curricula resolve")
        for ref in refs:
            if not has_component_evidence(row, ref):
                raise SystemExit(f"{name}: programme-level source evidence missing for {ref}")
            if not any(course.get("source_external_file") for course in row["selected_courses"]):
                raise SystemExit(f"{name}: selected rows do not identify the external bundle for {ref}")
        replacements[name] = row

    summary = [{
        "jamb_name": name,
        "old_courses": len(current_by_name[name].get("selected_courses") or []),
        "new_courses": len(replacements[name]["selected_courses"]),
        "old_status": current_by_name[name].get("scope_status"),
        "new_status": replacements[name].get("scope_status"),
        "custom_components": [ref for ref in replacements[name].get("component_refs", []) if str(ref).startswith("__custom__::")],
    } for name in sorted(replacements)]
    if args.apply:
        for name, row in replacements.items():
            current_by_name[name].clear()
            current_by_name[name].update(row)
        CANONICAL.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": "apply" if args.apply else "dry_run", "canonical": str(CANONICAL), "rows": summary}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
