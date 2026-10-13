"""Repair the source-confirmed FAA 451/FAA 442 CCMAS extraction boundary."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "ccmas" / "environmental_sciences.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf"
EXPECTED_TITLE = "and FAA 442: Draughtsmanship"
EXPECTED_OUTCOMES = [
    "to come to terms with the skill of interpreting art",
    "appreciate the visual form as cultural objects",
    "to identify with their definition as objects of value in society; and",
    "come to terms with the process of their creation or the way they are rendered",
]


def find_course(document: dict) -> dict:
    programme = next(item for item in document["programmes"] if item.get("name") == "Fine and Applied Arts")
    return next(item for item in programme["courses"] if item.get("code") == "FAA 451")


def repair_course(course: dict) -> None:
    if course.get("title") != EXPECTED_TITLE:
        raise AssertionError(
            "FAA 451 title does not match the source-authored combined header; refusing to infer a split"
        )
    course["skills_learned"] = list(EXPECTED_OUTCOMES)
    course["source_aliases"] = ["FAA 442"]
    course["source_state"] = "source_combined_header"
    course["source_reference"] = (
        "Environmental-Sciences-CCMAS-2023-FINAL.pdf, printed p. 252; "
        "source heading is 'FAA 451: and FAA 442: Draughtsmanship'"
    )
    course["source_url"] = SOURCE_URL
    course["source_locator"] = (
        "NUC CCMAS exact FAA 451/FAA 442 course block, printed p. 252; "
        "removed appended FAE 311 and FAE 321 outcomes"
    )
    course["source_accessed_on"] = "2026-09-26"


def validate_course(course: dict) -> None:
    assert course.get("code") == "FAA 451"
    assert course.get("title") == EXPECTED_TITLE
    assert course.get("skills_learned") == EXPECTED_OUTCOMES
    assert course.get("source_aliases") == ["FAA 442"]
    assert course.get("source_state") == "source_combined_header"
    assert course.get("source_url") == SOURCE_URL
    assert "printed p. 252" in (course.get("source_locator") or "")
    assert course.get("source_accessed_on") == "2026-09-26"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the bounded FAA 451 repair")
    args = parser.parse_args()

    document = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    course = find_course(document)
    if args.apply:
        repair_course(course)
        SOURCE_PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    validate_course(course)
    print(json.dumps({"source_file": SOURCE_PATH.name, "programme": "Fine and Applied Arts", "code": "FAA 451", "status": "passed"}, indent=2))


if __name__ == "__main__":
    main()
