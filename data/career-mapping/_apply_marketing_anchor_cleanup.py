"""Tighten Marketing/Brand mappings that lack marketing curriculum."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "programme_domain_marketing_anchor_cleanup_2026-08-17"


REMOVE = {
    "Administration and Management::Accounting",
    "Administration and Management::Actuarial Science",
    "Administration and Management::Information Resource Management",
    "Administration and Management::Insurance",
    "Administration and Management::Local Government and Development Studies",
    "Administration and Management::Office and Information Management",
    "Administration and Management::Procurement Management",
    "Administration and Management::Project Management",
    "Administration and Management::Public Administration",
    "Administration and Management::Taxation",
    "Administration and Management::Transport Management",
    "Agricultural Science::B.Sc./B.Tech Food Science and Technology",
    "Arts::Chinese Studies",
    "Arts::Classics",
    "Arts::Efik",
    "Arts::English Language and Literature",
    "Arts::Folklore Studies",
    "Arts::Ibibio",
    "Arts::Modern European Languages B.A",
    "Social Sciences::Demography and Social Statistics",
    "Social Sciences::Development Studies",
    "Social Sciences::International Relations",
    "Social Sciences::Peace Studies and Conflict Resolution",
    "Social Sciences::Political Science",
    "Social Sciences::Politics, Philosophy and Economics (PPE)",
    "Social Sciences::Psychology",
    "Social Sciences::Social Standards",
    "Social Sciences::Sociology",
    "Education::Geography",
    "Education::Home Economics",
    "Education::Political Science",
}

ADJACENT = {
    "Administration and Management::Business Administration",
    "Arts::Theatre Arts",
    "Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14",
    "Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14",
    "Education::Creative Arts Education",
}


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    decisions = {(programme, "D030"): "remove" for programme in REMOVE}
    decisions.update({(programme, "D030"): "adjacent" for programme in ADJACENT})
    for programme, domain_id in decisions:
        links = mapping.get(programme, {}).get("links", [])
        matches = [link for link in links if link["domain_id"] == domain_id]
        if len(matches) != 1 or matches[0]["match_type"] not in {"functional", "adjacent"}:
            actual = matches[0]["match_type"] if matches else "missing"
            raise SystemExit(f"Unexpected current Marketing mapping for {programme}: {actual}")
    removed = changed = 0
    for (programme, domain_id), decision in decisions.items():
        links = mapping[programme]["links"]
        if decision == "remove":
            mapping[programme]["links"] = [link for link in links if link["domain_id"] != domain_id]
            removed += 1
        else:
            for link in links:
                if link["domain_id"] == domain_id:
                    link["match_type"] = decision
                    link["src"] = "audit_marketing_2026-08-17"
                    link["audit_ref"] = AUDIT_REF
                    link["evidence_status"] = "curriculum_reviewed_high_confidence"
                    changed += 1
                    break
    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Applied {removed} Marketing removals and {changed} Adjacent demotions.")


if __name__ == "__main__":
    main()
