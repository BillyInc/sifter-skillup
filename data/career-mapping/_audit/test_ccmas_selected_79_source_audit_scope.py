"""Keep the requested CCMAS source-audit scope complete and data-only."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "ccmas"
EXPECTED = {
    "allied_health.json": (19, 535),
    "architecture.json": (6, 142),
    "basic_medical.json": (2, 88),
    "computing.json": (7, 267),
    "medicine_dentistry.json": (2, 399),
    "pharmacy.json": (2, 189),
    "sciences.json": (26, 1094),
    "social_sciences.json": (14, 534),
    "veterinary.json": (1, 94),
}
EXPECTED_NAMES = {
    "allied_health.json": [
        "Pharmacology", "Physiotherapy", "Audiology", "Nursing Sciences",
        "Complementary and Alternative Medicine", "Dental Technology", "Dental Therapy",
        "Environmental Health Science", "Health Care Administration and Hospital Management",
        "Information Technology and Health Informatics", "Health Information Management",
        "Medical Laboratory Science", "Human Nutrition and Dietetics", "Occupational Therapy",
        "Public Health", "Optometry", "Prosthetics and Orthotics", "Radiography", "Speech-Language Therapy",
    ],
    "architecture.json": [
        "Architecture", "Architectural Technology", "Furniture Design",
        "Interior Architecture and Design", "Landscape Architecture", "Naval Architecture",
    ],
    "basic_medical.json": ["Human Anatomy", "Physiology"],
    "computing.json": [
        "Computer Science", "Cybersecurity", "Data Science", "Information and Communication Technology",
        "Information Systems", "Information Technology", "Software Engineering",
    ],
    "medicine_dentistry.json": [
        "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)",
        "Bachelor of Dental Surgery (BDS/BChD)",
    ],
    "pharmacy.json": ["Bachelor of Pharmacy", "Doctor of Pharmacy"],
    "sciences.json": [
        "Applied Geophysics", "Biochemistry", "Biology", "Biotechnology", "Botany",
        "Brewing Science and Technology", "Chemistry", "Environmental Management and Toxicology",
        "Forensic Science", "Geology", "Industrial Chemistry", "Industrial Mathematics",
        "Industrial Physics", "Marine Science", "Maritime Science", "Mathematics", "Medical Physics",
        "Medicinal Chemistry", "Meteorology", "Microbiology", "Petroleum Chemistry",
        "Physics with Electronics", "Physics", "Science Laboratory Technology", "Statistics", "Zoology",
    ],
    "social_sciences.json": [
        "Criminology and Security Studies", "Demography and Social Statistics", "Development Studies",
        "Economics", "International Relations", "Library and Information Science",
        "Peace Studies and Conflict Resolution", "Petroleum Economics and Policy Studies",
        "Political Science", "Politics, Philosophy and Economics (PPE)", "Psychology", "Social Standards",
        "Social Work", "Sociology",
    ],
    "veterinary.json": ["Veterinary Medicine"],
}
CHECKPOINT = ROOT / "_audit" / "ccmas_selected_79_source_audit_checkpoint_2026-09-28_001.md"


def test_exact_requested_packages_and_local_baseline_are_in_scope() -> None:
    assert sum(package_count for package_count, _ in EXPECTED.values()) == 79
    assert sum(course_count for _, course_count in EXPECTED.values()) == 3342
    for filename, (package_count, course_count) in EXPECTED.items():
        document = json.loads((SOURCE_DIR / filename).read_text(encoding="utf-8"))
        programmes = document["programmes"]
        assert len(programmes) == package_count, filename
        assert [programme["name"] for programme in programmes] == EXPECTED_NAMES[filename], filename
        assert sum(len(programme.get("courses", [])) for programme in programmes) == course_count, filename


def test_checkpoint_keeps_full_audit_open_and_forbids_data_or_downstream_edits() -> None:
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert "79 CCMAS programme packages and 3,342 extracted course rows" in text
    assert "Current per-package source-audit completion: 1/79" in text
    assert "audit/findings only" in text
    assert "No data mutation is authorized" in text
    assert "No downstream mapping inspection is in scope" in text
    assert "NUC CCMAS is the adequate national curriculum baseline" in text
    assert "Do not hold that national curriculum relationship solely" in text
    assert "no row that can presently be certified as blocked only" in text
    assert "Computer Science with Economics" in text
    assert "Polymer and Textile Engineering" in text
