"""Remove an equipment-list spill from CAM 424 learning outcomes."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
EXPECTED = [
    "develop a hypothesis, formulate and execute a working plan; and",
    "interpret and give scientific reports the award of the degree. Minimum Academic Standards Equipment Herbal/pharmacognosy laboratory",
]


def main() -> None:
    document = json.loads(PATH.read_text(encoding="utf-8"))
    programme = next(p for p in document["programmes"] if p["name"] == "Complementary and Alternative Medicine")
    course = next(c for c in programme["courses"] if c["code"] == "CAM 424")
    outcomes = course.get("skills_learned") or []
    if outcomes and len(outcomes) > 2:
        assert outcomes[:2] == EXPECTED
        assert outcomes.count("Microscopes") == 2
        course["skills_learned"] = outcomes[:2]
    else:
        assert outcomes == EXPECTED
    course["source_url"] = URL
    course["source_locator"] = (
        "CAM 424 Project, official NUC Allied Health Sciences CCMAS, printed p. 101: "
        "the two learning outcomes end before the separate Minimum Academic Standards equipment list."
    )
    course["source_accessed_on"] = "2026-09-26"
    PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"course": "CAM 424", "outcomes_retained": len(course["skills_learned"])}, indent=2))


if __name__ == "__main__":
    main()
