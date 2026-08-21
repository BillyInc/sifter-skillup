"""Apply the reviewed CCMAS programme→domain recommendations.

This is intentionally guarded: it verifies the recommendation manifest against
the current authoritative mapping before changing anything.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
RECOMMENDATIONS_PATH = ROOT / "_audit" / "programme_domain_mapping_recommendations_2026-08-17.json"
AUDIT_REF = "programme_domain_mapping_audit_2026-08-17"


# Ambiguous recommendations were resolved conservatively: remove unsupported
# relationships; retain a Functional relationship only where the curriculum
# supplies a substantive, named bridge without making the target profession
# the programme identity.
DECISIONS: dict[tuple[str, str], str] = {
    ("Administration and Management::Business Administration", "D045"): "functional",
    ("Administration and Management::Business Administration", "D081"): "remove",
    ("Administration and Management::Business Administration", "D028"): "direct",
    ("Administration and Management::Business Administration", "D033"): "adjacent",
    ("Administration and Management::Business Administration", "D012"): "remove",
    ("Administration and Management::Transport Management", "D115"): "remove",
    ("Administration and Management::Public Administration", "D081"): "remove",
    ("Communication and Media Studies::PUBLIC RELATIONS — P12, P13, P14", "D045"): "remove",
    ("Allied Health Sciences::Health Care Administration and Hospital Management", "D045"): "functional",
    ("Allied Health Sciences::Public Health", "D045"): "functional",
    ("Medicine and Dentistry::Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "D165"): "remove",
    ("Allied Health Sciences::Complementary and Alternative Medicine", "D023"): "remove",
    ("Allied Health Sciences::Pharmacology", "D025"): "functional",
    ("Sciences::Biochemistry", "D122"): "functional",
    ("Sciences::Medical Physics", "D122"): "remove",
    ("Sciences::Microbiology", "D122"): "functional",
    ("Sciences::Science Laboratory Technology", "D122"): "functional",
    ("Education::Biology", "D142"): "remove",
    ("Education::Mathematics", "D127"): "remove",
    ("Allied Health Sciences::Environmental Health Science", "D020"): "functional",
    ("Allied Health Sciences::Medical Laboratory Science", "D138"): "remove",
    ("Sciences::Industrial Chemistry", "D050"): "remove",
    ("Sciences::Industrial Mathematics", "D050"): "remove",
    ("Sciences::Physics", "D016"): "functional",
    ("Sciences::Physics with Electronics", "D094"): "functional",
    ("Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING", "D093"): "remove",
    ("Engineering::MECHANICAL ENGINEERING", "D146"): "functional",
    ("Environmental Sciences::Building", "D021"): "functional",
    ("Education::Home Economics", "D063"): "remove",
    ("Social Sciences::Political Science", "D063"): "functional",
    ("Engineering::CHEMICAL ENGINEERING", "D110"): "functional",
    ("Arts::Archaeology", "D053"): "remove",
    ("Arts::Chinese Studies", "D053"): "remove",
    ("Arts::Christian Theology", "D153"): "remove",
    ("Arts::Linguistics", "D068"): "remove",
    ("Sciences::Science Laboratory Technology", "D104"): "remove",
    ("Arts::English Language and Literature", "D168"): "remove",
    ("Sciences::Statistics", "D166"): "remove",
    ("Sciences::Microbiology", "D066"): "remove",
    ("Administration and Management::Entrepreneurship", "D009"): "remove",
}


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    recommendations = json.loads(RECOMMENDATIONS_PATH.read_text(encoding="utf-8"))
    manifest = {
        (item["programme"], item["domain_id"]): item["current"]
        for item in recommendations["actions"]
    }
    if set(manifest) != set(DECISIONS):
        missing = sorted(set(manifest) - set(DECISIONS))
        extra = sorted(set(DECISIONS) - set(manifest))
        raise SystemExit(f"Decision coverage mismatch; missing={missing}; extra={extra}")

    removed = 0
    changed = 0
    for key, current_type in manifest.items():
        programme, domain_id = key
        if programme not in mapping:
            raise SystemExit(f"Programme missing from authoritative mapping: {programme}")
        links = mapping[programme]["links"]
        matches = [link for link in links if link["domain_id"] == domain_id]
        actual = matches[0]["match_type"] if matches else "missing"
        if actual != current_type:
            raise SystemExit(
                f"Current mapping changed since audit for {programme} → {domain_id}: "
                f"expected {current_type}, found {actual}"
            )

    for (programme, domain_id), decision in DECISIONS.items():
        links = mapping[programme]["links"]
        if decision == "remove":
            mapping[programme]["links"] = [link for link in links if link["domain_id"] != domain_id]
            removed += 1
            continue
        for link in links:
            if link["domain_id"] == domain_id:
                link["match_type"] = decision
                link["src"] = "audit_2026-08-17"
                link["audit_ref"] = AUDIT_REF
                link["evidence_status"] = "curriculum_reviewed"
                changed += 1
                break

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Applied {removed} removals and {changed} tier corrections.")


if __name__ == "__main__":
    main()
