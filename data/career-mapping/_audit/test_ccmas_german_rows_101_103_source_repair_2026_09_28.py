import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTS = ROOT / "ccmas" / "arts.json"


def test_german_101_and_103_have_separated_source_outcomes_and_contents():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    german = next(programme for programme in data["programmes"] if programme["code"] == "GER")
    courses = {course["code"]: course for course in german["courses"]}

    ger101 = courses["GER 101"]
    assert len(ger101["skills_learned"]) == 8
    assert any("translate, interpret and evaluate" in outcome for outcome in ger101["skills_learned"])
    assert "written and spoken forms" in ger101["content_summary"]
    assert "German sentences" in ger101["content_summary"]

    ger103 = courses["GER 103"]
    assert len(ger103["skills_learned"]) == 7
    assert any("translate, interpret and evaluate" in outcome for outcome in ger103["skills_learned"])
    assert "continues GER 101" in ger103["content_summary"]
    assert "Course Contents" not in ger103["skills_learned"][-1]

    for course in (ger101, ger103):
        assert course["source_url"].endswith("Arts-CCMAS-2023-FINAL.pdf")
        assert "printed p" in course["source_locator"]
