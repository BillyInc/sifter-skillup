"""Remove specialised-domain links lacking a named CCMAS course anchor."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "programme_domain_course_anchor_cleanup_2026-08-17"


COURSE_ANCHORS = {
    "D078": ["sociology", "social science", "social research", "social statistics", "demography", "criminology", "archaeology", "anthropology", "political science", "social policy", "social structure", "social change"],
    "D063": ["economics", "microeconomics", "macroeconomics", "economic", "market", "finance", "policy", "statistics"],
    "D149": ["international", "diplomacy", "foreign", "embassy", "geopolit", "treaty"],
    "D128": ["social work", "social welfare", "youth", "vulnerable", "community", "child protection", "family support", "social service"],
    "D058": ["educational technology", "e-learning", "elearning", "instructional", "learning management", "digital pedagogy"],
    "D029": ["human resource", "recruitment", "personnel", "labour", "employee", "talent", "employment", "workforce"],
    "D010": ["business intelligence", "business analytics", "dashboard", "decision support", "database", "information system", "data analysis"],
    "D011": ["quantitative finance", "financial market", "securities", "portfolio", "stochastic", "risk", "investment", "actuarial", "derivative"],
    "D046": ["social work", "social welfare", "community support", "vulnerable", "counselling", "youth", "family support", "care work"],
}

# These have a defensible quantitative bridge despite lacking a finance course
# title; keep the intentionally Adjacent Statistics → Quantitative Finance edge.
KEEP = {
    ("Sciences::Statistics", "D011"),
}


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    programmes = {}
    for file in (ROOT / "ccmas").glob("*.json"):
        source = json.loads(file.read_text(encoding="utf-8"))
        for programme in source.get("programmes", []):
            programmes[f"{source['discipline']}::{programme['name']}"] = programme

    removals: list[tuple[str, str]] = []
    for programme_key, value in mapping.items():
        titles = [str(course.get("title", "")).lower() for course in programmes[programme_key].get("courses", [])]
        for link in value.get("links", []):
            domain_id = link["domain_id"]
            anchors = COURSE_ANCHORS.get(domain_id)
            if not anchors or (programme_key, domain_id) in KEEP:
                continue
            if not any(anchor in title for anchor in anchors for title in titles):
                removals.append((programme_key, domain_id))

    for programme_key, domain_id in removals:
        mapping[programme_key]["links"] = [
            link for link in mapping[programme_key]["links"] if link["domain_id"] != domain_id
        ]

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Removed {len(removals)} specialised links without a named CCMAS course anchor.")
    for programme_key, domain_id in removals:
        print(f"{programme_key} -> {domain_id}")


if __name__ == "__main__":
    main()
