from repair_ccmas_residual_outcomes_2026_09_30 import parse_bullets, parse_inline_numbered, parse_prose_outcome, title_match


def test_bullets_are_explicit_only():
    assert parse_bullets("- identify methods\n* apply techniques") == ["identify methods", "apply techniques"]
    assert parse_bullets("identify methods; apply tools") == []


def test_single_explicit_prose_outcome_is_preserved():
    assert parse_prose_outcome("At the end of this course students should be able to translate from English to Russian")
    assert parse_prose_outcome("Same as in another course") == []


def test_inline_numbered_outcomes_are_split_only_when_sequential():
    assert parse_inline_numbered("1 state the policy; 2 identify the actors; 3 apply methods") == [
        "state the policy",
        "identify the actors",
        "apply methods",
    ]
    assert parse_inline_numbered("1 state the policy; 3 skip the second") == []


def test_title_match_allows_source_extension_but_rejects_spill():
    assert title_match("Field School II", "Field School II (14 days)")
    assert not title_match("Customary Law", ". Law Reform; PPL 501 Company Law I")
