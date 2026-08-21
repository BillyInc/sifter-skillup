"""Remove two high-confidence generic-token mapping clusters."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "programme_domain_cluster_audit_2026-08-17"


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    decisions: dict[tuple[str, str], str] = {}

    # Digital Health requires health records, coding, informatics, databases,
    # or health-information-system development. General clinical training is
    # not evidence for this domain.
    digital_health_remove = [
        "Allied Health Sciences::Pharmacology",
        "Allied Health Sciences::Physiotherapy",
        "Allied Health Sciences::Audiology",
        "Allied Health Sciences::Nursing Sciences",
        "Allied Health Sciences::Complementary and Alternative Medicine",
        "Allied Health Sciences::Dental Therapy",
        "Allied Health Sciences::Medical Laboratory Science",
        "Allied Health Sciences::Human Nutrition and Dietetics",
        "Allied Health Sciences::Occupational Therapy",
        "Allied Health Sciences::Prosthetics and Orthotics",
        "Allied Health Sciences::Radiography",
        "Allied Health Sciences::Speech-Language Therapy",
        "Medicine and Dentistry::Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)",
        "Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD)",
        "Pharmacy and Pharmaceutical Sciences::Bachelor of Pharmacy",
        "Pharmacy and Pharmaceutical Sciences::Doctor of Pharmacy",
        "Sciences::Medical Physics",
    ]
    for programme in digital_health_remove:
        decisions[(programme, "D057")] = "remove"
    decisions[("Allied Health Sciences::Health Information Management", "D057")] = "direct"

    # Early Childhood is not a generic child-facing or teaching-adjacent tag.
    # Retain the dedicated Early Childhood programme and the two defensible
    # education bridges; remove unrelated subject, health, arts, and social
    # programmes.
    early_childhood_remove = [
        "Agricultural Science::Family and Consumer Sciences",
        "Allied Health Sciences::Physiotherapy",
        "Allied Health Sciences::Audiology",
        "Allied Health Sciences::Nursing Sciences",
        "Allied Health Sciences::Dental Therapy",
        "Allied Health Sciences::Environmental Health Science",
        "Allied Health Sciences::Human Nutrition and Dietetics",
        "Allied Health Sciences::Occupational Therapy",
        "Allied Health Sciences::Public Health",
        "Allied Health Sciences::Optometry",
        "Allied Health Sciences::Speech-Language Therapy",
        "Arts::Folklore Studies",
        "Arts::Religious Studies",
        "Arts::Theatre Arts",
        "Education::Biology",
        "Education::Chemistry",
        "Education::Computer Science",
        "Education::Geography",
        "Education::Home Economics",
        "Education::Library and Information Science",
        "Education::Physics",
        "Education::Political Science",
        "Social Sciences::Social Standards",
        "Social Sciences::Social Work",
        "Social Sciences::Sociology",
    ]
    for programme in early_childhood_remove:
        decisions[(programme, "D127")] = "remove"

    expected_current = {
        "remove": {"functional", "adjacent"},
        "direct": {"functional"},
    }
    removed = changed = 0
    for (programme, domain_id), decision in decisions.items():
        links = mapping.get(programme, {}).get("links", [])
        matches = [link for link in links if link["domain_id"] == domain_id]
        if len(matches) != 1 or matches[0]["match_type"] not in expected_current[decision]:
            actual = matches[0]["match_type"] if matches else "missing"
            raise SystemExit(f"Unexpected current state for {programme} → {domain_id}: {actual}")

    for (programme, domain_id), decision in decisions.items():
        links = mapping[programme]["links"]
        if decision == "remove":
            mapping[programme]["links"] = [link for link in links if link["domain_id"] != domain_id]
            removed += 1
        else:
            for link in links:
                if link["domain_id"] == domain_id:
                    link["match_type"] = decision
                    link["src"] = "audit_cluster_2026-08-17"
                    link["audit_ref"] = AUDIT_REF
                    link["evidence_status"] = "curriculum_reviewed_high_confidence"
                    changed += 1
                    break

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Applied {removed} cluster removals and {changed} tier promotions.")


if __name__ == "__main__":
    main()
