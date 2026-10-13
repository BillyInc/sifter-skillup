"""Guarded application of the independently reviewed D001 role decisions.

Dry-run is the default. This edits only the 37 exact D001 role objects in the
canonical role library, and only after exact key/description/status checks.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
DECISIONS = HERE / "D001_role_fit_decisions.json"
INVENTORY = ROOT / "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}
SPECIALIZATION_CONDITIONAL = {
    "D001|cloud architect",
    "D001|cloud engineer",
    "D001|Computer Systems Engineers/Architects",
    "D001|ICT quality assurance manager",
    "D001|ICT system tester",
    "D001|user interface designer",
    "D001|Web and Digital Interface Designers",
}
WEF_TASK_GAP = {"D001|Software and Applications Developers", "D001|Full Stack Engineers"}
WEF_REPORT = "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"


def key(row: dict) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the guarded D001-only changes")
    args = parser.parse_args()

    decision_doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    source_text = ROLE_LIBRARY.read_text(encoding="utf-8")
    canonical = json.loads(source_text)
    decisions = decision_doc["decisions"]
    decision_by_key = {row["role_key"]: row for row in decisions}
    inventory_by_key = {row["role_key"]: row for row in inventory["role_mappings"] if row.get("domain_id") == "D001"}
    canonical_d001 = [row for row in canonical if row.get("domain_id") == "D001"]
    canonical_by_key = {key(row): row for row in canonical_d001}

    assert len(decisions) == len(decision_by_key) == 37, "D001 decision set must contain 37 unique rows"
    assert set(decision_by_key) == set(inventory_by_key) == set(canonical_by_key), "D001 key set drift; refusing writes"
    assert all(row.get("domain_fit_status") in ALLOWED for row in decisions), "invalid domain fit status"

    def expected_specialization_status(role_key: str, decision: dict) -> str:
        if role_key in WEF_TASK_GAP or decision["domain_fit_status"] == "unresolved":
            return "unresolved"
        if decision["domain_fit_status"] == "unsupported":
            return "not_applicable"
        if decision["domain_fit_status"] == "conditional" or role_key in SPECIALIZATION_CONDITIONAL:
            return "conditional"
        return "supported"
    for role_key, decision in decision_by_key.items():
        inv = inventory_by_key[role_key]
        role = canonical_by_key[role_key]
        assert role.get("description") == inv.get("role_description"), f"canonical description drift: {role_key}"
        assert inv.get("esco_occupation_uris") or inv.get("onet_occupation_codes") or inv.get("identity_source") == "wef", f"no source identity to cite: {role_key}"
        # Allow a safe rerun only when existing values exactly equal this decision.
        expected = decision["domain_fit_status"]
        previous = role.get("domain_fit_review_status")
        assert not previous or previous == expected, f"existing conflicting review status for {role_key}: {previous} != {expected}"
        expected_spec = expected_specialization_status(role_key, decision)
        old_spec = role.get("specialization_fit_review_status")
        assert not old_spec or old_spec == expected_spec, f"existing conflicting specialization status for {role_key}: {old_spec} != {expected_spec}"
        if expected == "unsupported":
            assert role.get("student_path_status") in (None, "active", "excluded"), f"unexpected path state: {role_key}"

    updated = []
    for role in canonical:
        role_key = key(role)
        decision = decision_by_key.get(role_key)
        if not decision:
            continue
        inv = inventory_by_key[role_key]
        source_refs = list(inv.get("esco_occupation_uris") or [])
        source_refs.extend(
            f"https://www.onetonline.org/link/summary/{code}"
            for code in (inv.get("onet_occupation_codes") or [])
        )
        if inv.get("identity_source") == "wef":
            source_refs.append(WEF_REPORT)
        source_refs = list(dict.fromkeys(source_refs))
        specialization_fit_status = expected_specialization_status(role_key, decision)
        specialization_candidate = (
            "Software Development & Systems Engineering (candidate; subgroup remains excluded pending taxonomy review)"
            if specialization_fit_status != "not_applicable" else None
        )
        role["domain_fit_review_status"] = decision["domain_fit_status"]
        role["domain_fit_review_basis"] = decision["basis"]
        role["domain_fit_review_source_refs"] = source_refs
        role["specialization_fit_review_status"] = specialization_fit_status
        role["specialization_fit_candidate"] = specialization_candidate
        role["specialization_fit_review_basis"] = (
            "Compared role tasks independently with the candidate specialization boundary (build, test and maintain software systems and applications); subgroup membership is not evidence. "
            + decision["basis"]
        )
        role["specialization_fit_review_source_refs"] = source_refs
        role["semantic_review_date"] = decision_doc["generated_at"]
        if decision["domain_fit_status"] == "unsupported":
            role["student_path_status"] = "excluded"
            role["student_path_exclusion_reason"] = (
                "D001 role-task review found this occupation's evidenced tasks outside the Software Engineering parent scope. "
                "The occupation record is retained; only its D001 student path is excluded. " + decision["basis"]
            )
        updated.append(role_key)

    print(json.dumps({
        "mode": "apply" if args.apply else "dry_run",
        "d001_rows": len(canonical_d001),
        "review_rows": len(updated),
        "unsupported_paths_to_exclude": sorted(
            row["role_key"] for row in decisions if row["domain_fit_status"] == "unsupported"
        ),
        "domain_fit_statuses": {status: sum(row["domain_fit_status"] == status for row in decisions) for status in sorted(ALLOWED)},
        "specialization_fit_statuses": {
            status: sum(
                ("unresolved" if row["domain_fit_status"] == "unresolved" else
                 "not_applicable" if row["domain_fit_status"] == "unsupported" else
                 "conditional" if row["domain_fit_status"] == "conditional" or row["role_key"] in SPECIALIZATION_CONDITIONAL else
                 "supported") == status
                for row in decisions
            )
            for status in sorted(ALLOWED | {"not_applicable"})
        },
        "changed_role_keys": updated,
    }, ensure_ascii=False, indent=2))

    if not args.apply:
        return

    if all(canonical_by_key[role_key].get("domain_fit_review_status") == decision_by_key[role_key]["domain_fit_status"]
           and canonical_by_key[role_key].get("specialization_fit_review_status") == expected_specialization_status(role_key, decision_by_key[role_key])
           for role_key in decision_by_key):
        print("Canonical D001 data already matches the guarded decision set; no rewrite needed.")
        return

    # Re-encode only the exact D001 objects, preserving every other byte in the
    # already-dirty shared catalogue file.
    decoder = json.JSONDecoder()
    spans: list[tuple[int, int, dict]] = []
    cursor = source_text.find("[") + 1
    while cursor < len(source_text):
        while cursor < len(source_text) and source_text[cursor] in " \t\r\n,":
            cursor += 1
        if cursor >= len(source_text) or source_text[cursor] == "]":
            break
        obj, end = decoder.raw_decode(source_text, cursor)
        if obj.get("domain_id") == "D001":
            spans.append((cursor, end, canonical_by_key[key(obj)]))
        cursor = end
    assert len(spans) == 37, f"expected 37 textual D001 objects, found {len(spans)}"
    for start, end, obj in reversed(spans):
        # The leading indentation belongs to the object's original whitespace.
        encoded = json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=True)
        encoded = "\n".join("  " + line for line in encoded.splitlines())
        source_text = source_text[:start] + encoded + source_text[end:]
    ROLE_LIBRARY.write_text(source_text, encoding="utf-8", newline="")
    print(f"Applied guarded review metadata to {len(updated)} D001 role records only.")


if __name__ == "__main__":
    main()
