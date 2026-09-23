from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _role_learning_core import MAX_STUDENT_ESSENTIAL, MAX_STUDENT_OPTIONAL, student_skill_lists


def test_role_learning_path_is_bounded_and_ordered() -> None:
    role = {
        "essential_skills": "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen",
        "optional_skills": "two|optional one|optional two|optional three|optional four|optional five|optional six",
    }
    essential, optional = student_skill_lists(role)
    assert len(essential) == MAX_STUDENT_ESSENTIAL
    assert len(optional) == MAX_STUDENT_OPTIONAL
    assert "two" not in optional
    assert essential[:3] == ["one", "two", "three"]


def test_explicit_business_teacher_learning_core_wins() -> None:
    role = {
        "role_name": "business studies and economics teacher secondary school",
        "essential_skills": "duty one|duty two|duty three",
        "optional_skills": "incidental one|incidental two",
        "student_skill_selection": {
            "essential": ["teach business principles", "assess students"],
            "optional": ["statistics"],
        },
    }
    essential, optional = student_skill_lists(role)
    assert essential == ["teach business principles", "assess students"]
    assert optional == ["statistics"]
