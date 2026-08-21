"""Remove high-fanout links with no named curriculum anchor for the target domain."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "programme_domain_anchor_cleanup_2026-08-17"


ANCHORS = {
    # Social research is not inferred from a generic people/culture sentence.
    "D078": [
        "sociology", "sociological", "social science", "social research",
        "social structure", "social change", "social policy", "social statistics",
        "demography", "criminology", "archaeology", "anthropology", "population studies",
        "political science", "political analysis", "society",
    ],
    "D149": [
        "international relations", "diplomacy", "foreign affairs", "embassy",
        "geopolit", "international law", "foreign policy", "treaty",
    ],
    "D128": [
        "social work", "social welfare", "youth", "vulnerable", "community development",
        "child protection", "family support", "social services",
    ],
    "D039": [
        "teaching", "lesson", "curriculum", "instruction", "assessment", "pedagogy",
        "teacher education", "school management", "educational management",
    ],
    "D058": [
        "educational technology", "e-learning", "elearning", "instructional design",
        "learning management", "digital pedagogy", "edtech",
    ],
    "D029": [
        "human resources", "recruitment", "personnel", "labour", "employee", "talent",
        "employment", "staff training", "workforce",
    ],
    "D041": [
        "research methodology", "laboratory", "field study", "scientific research",
        "experimental", "research project", "scientific method",
    ],
    "D026": [
        "public health", "epidemiology", "community health", "health policy", "health systems",
        "disease prevention", "primary health care",
    ],
    "D010": [
        "business intelligence", "business analytics", "dashboard", "decision support",
        "database", "information systems", "data analysis",
    ],
    "D046": [
        "social work", "social welfare", "community support", "vulnerable", "counselling",
        "youth", "family support", "care work",
    ],
    "D011": [
        "quantitative finance", "financial markets", "securities", "portfolio", "stochastic",
        "risk modelling", "investment analysis", "actuarial", "derivatives",
    ],
}


def as_text(programme: dict) -> str:
    parts = [
        programme.get("name", ""),
        programme.get("discipline", ""),
        *programme.get("objectives", []),
        *programme.get("employability_skills", []),
        *programme.get("skills_21st_century", []),
        *programme.get("technical_skills", []),
    ]
    for course in programme.get("courses", []):
        parts.extend(
            [
                course.get("title", ""),
                course.get("content_summary", ""),
                *course.get("skills_learned", []),
            ]
        )
    return " ".join(value for value in parts if isinstance(value, str)).lower()


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    programmes = {}
    for file in (ROOT / "ccmas").glob("*.json"):
        source = json.loads(file.read_text(encoding="utf-8"))
        for programme in source.get("programmes", []):
            programmes[f"{source['discipline']}::{programme['name']}"] = programme

    removals: list[tuple[str, str]] = []
    for programme_key, value in mapping.items():
        text = as_text(programmes[programme_key])
        for link in value.get("links", []):
            domain_id = link["domain_id"]
            anchors = ANCHORS.get(domain_id)
            if anchors and not any(anchor in text for anchor in anchors):
                removals.append((programme_key, domain_id))

    removed = 0
    for programme_key, domain_id in removals:
        links = mapping[programme_key]["links"]
        mapping[programme_key]["links"] = [link for link in links if link["domain_id"] != domain_id]
        removed += 1

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Removed {removed} links with no named target-domain curriculum anchor.")
    for programme_key, domain_id in removals:
        print(f"{programme_key} -> {domain_id}")


if __name__ == "__main__":
    main()
