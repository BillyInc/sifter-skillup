import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "administration_management.json"


def test_accounting_acc305_matches_source_confirmed_repair():
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    matches = [
        course
        for programme in data["programmes"]
        if programme.get("name") == "Accounting"
        for course in programme.get("courses", [])
        if course.get("code") == "ACC 305"
    ]
    assert len(matches) == 1
    course = matches[0]
    assert course["title"] == "Taxation I"
    assert course["units"] == 3
    assert course["status"] == "C"
    assert course["lh"] == 30
    assert course["ph"] == 45
    assert course["skills_learned"] == [
        "explain Nigeria's tax administration structure",
        "apply tax rules to calculate liabilities for individuals and partnerships",
        "discuss tax assessments, appeals, collection and return-filing procedures",
    ]
