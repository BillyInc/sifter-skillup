"""Regression checks for the audit detector; source data is intentionally untouched."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/ccmas/allied_health.json"


def pharmacology_rows():
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in payload["programmes"] if p["name"] == "Pharmacology")
    return package["courses"]


def test_pharmacology_audit_detects_foreign_course_contexts_and_duplicates():
    rows = pharmacology_rows()
    assert len(rows) == 31
    assert sum(row["code"] == "PHA 201" for row in rows) == 2
    assert sum(row["code"] == "PHA 301" for row in rows) == 5
    assert sum(row["code"] == "PHA 302" for row in rows) == 2
    assert sum(row["code"] == "PHA 312" for row in rows) == 3
    assert any(row["title"] == "Pharmacology for Medical Rehabilitation Professionals" for row in rows)
    assert any(row["title"] == "Pharmacodynamics and Chemotherapy I" for row in rows)


def test_pharmacology_audit_detects_truncated_and_polluted_fields():
    rows = pharmacology_rows()
    assert sum(len(row.get("content_summary") or "") == 400 for row in rows) == 26
    polluted = []
    for row in rows:
        outcomes = " ".join(row.get("skills_learned") or [])
        if any(marker in outcomes for marker in (
            "Allied Health Sciences",
            "Minimum Academic Standards",
            "Microdynamometers",
            "ECG/EEG",
        )):
            polluted.append(row)
    assert {row["code"] for row in polluted} >= {
        "PHA 301", "PHA 303", "PHA 310", "PHA 312", "PHA 401", "PHA 403", "PHA 406", "PHA 409"
    }
