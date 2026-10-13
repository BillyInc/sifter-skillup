import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "administration_management.json"
OFFICIAL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"


def test_acc_102_203_206_skill_summaries_align_with_verified_learning_outcomes_and_sources():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    accounting = next(row for row in data["programmes"] if row.get("code") == "ACC")
    courses = {row["code"]: row for row in accounting["courses"]}
    expected = {
        "ACC 102": ("printed pp. 36–37", "Correct accounting errors and use suspense and control accounts."),
        "ACC 203": ("printed p. 39", "Discuss internal-control and audit procedures."),
        "ACC 206": ("printed p. 40", "Use cloud-based accounting software."),
    }

    for code, (locator, skill) in expected.items():
        course = courses[code]
        assert course["skills_learned"]
        assert skill in course["skills_learned"]
        assert course["learning_outcomes"]
        assert course["source_url"] == OFFICIAL
        assert locator in course["source_locator"]
        assert course["source_accessed_on"] == "2026-09-25"

    assert "consolidated financial statements" not in " ".join(courses["ACC 102"]["skills_learned"])
    assert "variance analysis" not in " ".join(courses["ACC 203"]["skills_learned"])
    assert "capital budgeting" not in " ".join(courses["ACC 206"]["skills_learned"])
