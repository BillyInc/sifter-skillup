"""Apply high-confidence tier corrections found after the first mapping audit."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "programme_domain_mapping_sweep_2026-08-17"


def find_key(mapping: dict, fragment: str) -> str:
    matches = [key for key in mapping if fragment in key]
    if len(matches) != 1:
        raise SystemExit(f"Expected one programme key containing {fragment!r}; found {matches}")
    return matches[0]


def decisions(mapping: dict) -> dict[tuple[str, str], str]:
    pr = find_key(mapping, "PUBLIC RELATIONS")
    development_communication = find_key(mapping, "DEVELOPMENT COMMUNICATION STUDIES")
    information_media = find_key(mapping, "INFORMATION AND MEDIA STUDIES")
    return {
        ("Administration and Management::Accounting", "D157"): "functional",
        ("Administration and Management::Accounting", "D158"): "functional",
        ("Administration and Management::Finance / Banking and Finance", "D011"): "functional",
        ("Administration and Management::Securities and Investments Management", "D011"): "functional",
        ("Administration and Management::Petroleum Information Management", "D054"): "functional",
        ("Agricultural Science::Family and Consumer Sciences", "D048"): "functional",
        ("Agricultural Science::Family and Consumer Sciences", "D092"): "functional",
        ("Agricultural Science::Family and Consumer Sciences", "D075"): "functional",
        ("Agricultural Science::Forest Resources and Wildlife Management", "D041"): "functional",
        ("Agricultural Science::Soil Science", "D041"): "functional",
        ("Agricultural Science::Water Resources Management and Agro-Meteorology", "D041"): "functional",
        ("Allied Health Sciences::Physiotherapy", "D154"): "functional",
        ("Allied Health Sciences::Health Information Management", "D073"): "remove",
        ("Allied Health Sciences::Occupational Therapy", "D074"): "remove",
        ("Allied Health Sciences::Environmental Health Science", "D074"): "functional",
        ("Arts::Arabic", "D039"): "functional",
        ("Arts::Chinese Studies", "D039"): "functional",
        ("Arts::Efik", "D039"): "functional",
        ("Arts::English Language and Literature", "D039"): "functional",
        ("Arts::Hausa", "D039"): "functional",
        ("Arts::History/History and Diplomatic Studies", "D039"): "functional",
        ("Arts::Ibibio", "D039"): "functional",
        ("Arts::Igbo", "D039"): "functional",
        ("Arts::Islamic Studies", "D039"): "functional",
        ("Arts::Linguistics", "D039"): "functional",
        ("Arts::Modern European Languages B.A", "D039"): "functional",
        ("Arts::Modern European Languages (Russian)", "D039"): "functional",
        ("Arts::Philosophy", "D039"): "functional",
        ("Arts::African Languages and Literature Yoruba", "D039"): "functional",
        ("Arts::Classics", "D152"): "functional",
        ("Arts::Folklore Studies", "D152"): "functional",
        ("Arts::Music", "D153"): "functional",
        (development_communication, "D046"): "remove",
        (information_media, "D073"): "remove",
        (pr, "D030"): "functional",
        ("Computing::Computer Science", "D009"): "functional",
        ("Computing::Information and Communication Technology", "D001"): "functional",
        ("Computing::Information and Communication Technology", "D008"): "functional",
        ("Computing::Information Systems", "D009"): "functional",
        ("Computing::Information Systems", "D010"): "functional",
        ("Computing::Information Technology", "D004"): "functional",
        ("Computing::Software Engineering", "D012"): "functional",
        ("Computing::Software Engineering", "D140"): "functional",
        ("Computing::Software Engineering", "D006"): "functional",
        ("Education::Agricultural Education", "D047"): "functional",
        ("Education::Biology", "D041"): "functional",
        ("Education::Chemistry", "D041"): "functional",
        ("Education::Environmental Education", "D020"): "functional",
        ("Education::Guidance and Counselling", "D029"): "remove",
        ("Education::Home Economics", "D128"): "remove",
        ("Education::Language Arts and Communication", "D078"): "functional",
        ("Education::Language Arts and Communication", "D070"): "remove",
        ("Education::Music", "D153"): "functional",
        ("Education::Physics", "D016"): "functional",
        ("Education::Political Science", "D063"): "functional",
        ("Education::Political Science", "D078"): "functional",
        ("Education::Primary Education", "D127"): "functional",
        ("Education::Special Needs Education", "D127"): "functional",
        ("Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING", "D047"): "functional",
        ("Engineering::ELECTRICAL ENGINEERING", "D146"): "functional",
        ("Engineering::ELECTRONIC ENGINEERING", "D006"): "functional",
        ("Engineering::SYSTEMS ENGINEERING", "D050"): "functional",
        ("Engineering::SYSTEMS ENGINEERING", "D140"): "functional",
        ("Engineering::METALLURGICAL ENGINEERING", "D155"): "functional",
        ("Engineering::TELECOMMUNICATIONS ENGINEERING", "D016"): "functional",
        ("Engineering::WATER RESOURCES ENGINEERING", "D018"): "functional",
        ("Environmental Sciences::Building", "D146"): "remove",
        ("Environmental Sciences::Fine and Applied Arts", "D044"): "functional",
        ("Environmental Sciences::Urban and Regional Planning", "D021"): "functional",
        ("Sciences::Biology", "D142"): "functional",
        ("Sciences::Biology", "D041"): "functional",
        ("Sciences::Biotechnology", "D142"): "functional",
        ("Sciences::Biotechnology", "D027"): "functional",
        ("Sciences::Botany", "D041"): "functional",
        ("Sciences::Chemistry", "D041"): "functional",
        ("Sciences::Environmental Management and Toxicology", "D041"): "functional",
        ("Sciences::Forensic Science", "D151"): "functional",
        ("Sciences::Geology", "D022"): "functional",
        ("Sciences::Industrial Chemistry", "D055"): "functional",
        ("Sciences::Industrial Physics", "D050"): "functional",
        ("Sciences::Industrial Physics", "D016"): "functional",
        ("Sciences::Mathematics", "D014"): "functional",
        ("Sciences::Mathematics", "D009"): "functional",
        ("Sciences::Medical Physics", "D123"): "functional",
        ("Sciences::Medicinal Chemistry", "D025"): "functional",
        ("Sciences::Science Laboratory Technology", "D041"): "functional",
        ("Sciences::Statistics", "D009"): "functional",
        ("Sciences::Zoology", "D041"): "functional",
        ("Social Sciences::Criminology and Security Studies", "D143"): "functional",
        ("Social Sciences::Demography and Social Statistics", "D009"): "functional",
        ("Social Sciences::Demography and Social Statistics", "D041"): "functional",
        ("Social Sciences::Development Studies", "D046"): "functional",
        ("Social Sciences::Peace Studies and Conflict Resolution", "D161"): "functional",
        ("Social Sciences::Political Science", "D149"): "functional",
        ("Social Sciences::Political Science", "D078"): "functional",
        ("Social Sciences::Social Work", "D064"): "functional",
        ("Social Sciences::Social Work", "D046"): "direct",
        ("Social Sciences::Sociology", "D046"): "functional",
    }


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    plan = decisions(mapping)
    removed = changed = 0
    for (programme, domain_id), expected in plan.items():
        links = mapping.get(programme, {}).get("links", [])
        matches = [link for link in links if link["domain_id"] == domain_id]
        actual = matches[0]["match_type"] if matches else "missing"
        if actual != "direct" and not (programme == "Social Sciences::Social Work" and domain_id == "D046" and actual == "functional"):
            raise SystemExit(f"Expected current Direct link for {programme} → {domain_id}; found {actual}")
    for (programme, domain_id), decision in plan.items():
        links = mapping[programme]["links"]
        if decision == "remove":
            mapping[programme]["links"] = [link for link in links if link["domain_id"] != domain_id]
            removed += 1
            continue
        for link in links:
            if link["domain_id"] == domain_id:
                link["match_type"] = decision
                link["src"] = "audit_sweep_2026-08-17"
                link["audit_ref"] = AUDIT_REF
                link["evidence_status"] = "curriculum_reviewed_high_confidence"
                changed += 1
                break
    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Applied {removed} removals and {changed} high-confidence tier corrections.")


if __name__ == "__main__":
    main()
