"""Review weak-evidence Direct/Adjacent links without weakening exact matches."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "weak_tier_review_2026-08-17"


def key(discipline: str, programme: str, domain_id: str) -> tuple[str, str]:
    return (f"{discipline}::{programme}", domain_id)


# These links have no named curriculum bridge to the target domain and are
# generic employability or title-word associations. They should not surface as
# an adjacent route.
REMOVE = {
    key("Administration and Management", "Business Information Technology", "D003"),
    key("Allied Health Sciences", "Complementary and Alternative Medicine", "D125"),
    key("Arts", "Classics", "D130"),
    key("Arts", "Classics", "D073"),
    key("Arts", "Efik", "D042"),
    key("Arts", "Ibibio", "D042"),
    key("Arts", "Ibibio", "D152"),
    key("Arts", "Igbo", "D130"),
    key("Arts", "Modern European Languages (Russian)", "D073"),
    key("Arts", "Philosophy", "D045"),
    key("Arts", "Philosophy", "D150"),
    key("Arts", "Theatre Arts", "D044"),
    key("Communication and Media Studies", "BROADCASTING — P12, P13, P14", "D071"),
    key("Communication and Media Studies", "DEVELOPMENT COMMUNICATION STUDIES — P12, P13, P14", "D047"),
    key("Communication and Media Studies", "FILM & MULTIMEDIA — P12, P13, P14", "D153"),
    key("Education", "Political Science", "D161"),
    key("Engineering", "FOOD ENGINEERING", "D110"),
    key("Engineering", "FOOD SCIENCE AND TECHNOLOGY", "D110"),
    key("Engineering", "MATERIALS AND METALLURGICAL ENGINEERING", "D055"),
    key("Engineering", "MINING ENGINEERING", "D109"),
    key("Engineering", "WATER RESOURCES ENGINEERING", "D047"),
    key("Engineering", "WATER RESOURCES ENGINEERING", "D052"),
    key("Sciences", "Brewing Science and Technology", "D047"),
    key("Sciences", "Environmental Management and Toxicology", "D047"),
    key("Sciences", "Industrial Chemistry", "D048"),
    key("Sciences", "Maritime Science", "D034"),
    key("Social Sciences", "Development Studies", "D047"),
    key("Social Sciences", "Political Science", "D161"),
    key("Social Sciences", "Social Standards", "D124"),
    key("Social Sciences", "Social Work", "D124"),
}


# These links describe a plausible transfer into the target field, but the
# source programme is not itself the target profession. Functional is the
# correct tier when extra specialist preparation is required.
DEMOTE = {
    key("Engineering", "COMPUTER ENGINEERING", "D004"),
    key("Allied Health Sciences", "Complementary and Alternative Medicine", "D165"),
    key("Allied Health Sciences", "Human Nutrition and Dietetics", "D165"),
    key("Basic Medical Sciences", "Human Anatomy", "D023"),
    key("Basic Medical Sciences", "Physiology", "D023"),
    key("Engineering", "FOOD SCIENCE AND TECHNOLOGY", "D055"),
    key("Engineering", "INFORMATION AND COMMUNICATION ENGINEERING", "D004"),
    key("Engineering", "MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING", "D055"),
    key("Engineering", "MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING", "D110"),
    key("Engineering", "MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING", "D097"),
    key("Engineering", "METALLURGICAL ENGINEERING", "D055"),
    key("Engineering", "NATURAL GAS ENGINEERING", "D110"),
    key("Engineering", "PETROCHEMICAL ENGINEERING", "D020"),
    key("Engineering", "PETROLEUM AND GAS ENGINEERING", "D055"),
    key("Engineering", "PETROLEUM ENGINEERING", "D055"),
    key("Engineering", "TELECOMMUNICATIONS ENGINEERING", "D004"),
    key("Environmental Sciences", "Industrial Design", "D007"),
    key("Sciences", "Brewing Science and Technology", "D110"),
    key("Sciences", "Industrial Chemistry", "D048"),
    key("Sciences", "Marine Science", "D076"),
    key("Social Sciences", "Political Science", "D161"),
}


def main() -> None:
    mapping = json.loads(PATH.read_text(encoding="utf-8"))
    removed = []
    demoted = []
    seen = set()
    for programme_key, record in mapping.items():
        kept = []
        for link in record.get("links", []):
            pair = (programme_key, link.get("domain_id"))
            if pair in REMOVE:
                removed.append(pair)
                continue
            if pair in DEMOTE and link.get("match_type") != "functional":
                old = link.get("match_type")
                link["match_type"] = "functional"
                link["audit_ref"] = AUDIT_REF
                link["evidence_status"] = "manual_semantic_review"
                link["src"] = AUDIT_REF
                demoted.append((pair, old, "functional"))
            kept.append(link)
        record["links"] = kept
        for link in kept:
            seen.add((programme_key, link.get("domain_id")))

    unexpected_remaining = sorted(REMOVE & seen)
    if unexpected_remaining:
        raise SystemExit(f"Expected removable links still present: {unexpected_remaining}")
    PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Removed {len(removed)} weak adjacent links.")
    print(f"Demoted {len(demoted)} weak direct/adjacent links to functional.")
    print("Removed:", ", ".join(f"{p}::{d}" for p, d in removed))
    print("Demoted:", ", ".join(f"{p}::{d} ({old}->functional)" for (p, d), old, _ in demoted))


if __name__ == "__main__":
    main()
