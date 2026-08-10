"""The "what this degree teaches" payload contract.

Two defects this pins, both found by opening the deployed app rather than by
reading code — neither raises, neither fails a type check, and both look like
data gaps from the outside:

1. List rows shipped the WHOLE skills profile. MBBS alone carries 1560
   technical outcomes; one university's 81-course list weighed 2.0 MB and took
   3.5s, to render three bullets and a count per row.

2. `skillsCount` was derived from the array that was sent. Once lists carry a
   preview, a count taken from the preview would tell every student "+0 more"
   for a 1560-outcome degree — the UI reads "+N more" straight off it.

The union/dedup rule for canonical programmes is pinned too: 80 programmes have
several JAMB names mapped to them, and the same CCMAS course repeats verbatim
across those names.
"""

from routes.career_routes import _dedup
from routes.student_pipeline_routes import SKILLS_PREVIEW_MAX, _skills_out


def _row(n_tech: int, n_soft: int) -> dict:
    return {
        "skills_technical": [f"outcome {i}" for i in range(n_tech)],
        "skills_transferable": [f"skill {i}" for i in range(n_soft)],
    }


class TestListPreview:
    def test_list_rows_are_capped(self):
        out = _skills_out(_row(1560, 152), full=False)
        assert len(out["skillsTechnical"]) == SKILLS_PREVIEW_MAX
        assert len(out["skillsTransferable"]) == SKILLS_PREVIEW_MAX
        assert out["skillsTruncated"] is True

    def test_count_is_the_true_total_not_what_was_sent(self):
        out = _skills_out(_row(1560, 152), full=False)
        # The whole point: the teaser renders "+N more" from this.
        assert out["skillsCount"] == 1560 + 152
        assert out["skillsTechnicalCount"] == 1560
        assert out["skillsTransferableCount"] == 152

    def test_short_profiles_are_not_padded(self):
        out = _skills_out(_row(2, 1), full=False)
        assert len(out["skillsTechnical"]) == 2
        assert out["skillsCount"] == 3

    def test_detail_carries_everything(self):
        out = _skills_out(_row(1560, 152), full=True)
        assert len(out["skillsTechnical"]) == 1560
        assert len(out["skillsTransferable"]) == 152
        assert out["skillsTruncated"] is False

    def test_missing_profile_degrades_to_empty(self):
        out = _skills_out({}, full=True)
        assert out["skillsTechnical"] == []
        assert out["skillsCount"] == 0


class TestProgrammeUnionDedup:
    def test_repeated_outcomes_collapse(self):
        assert _dedup(["Anatomy", "anatomy", " Anatomy "]) == ["Anatomy"]

    def test_order_is_preserved(self):
        assert _dedup(["b", "a", "b", "c"]) == ["b", "a", "c"]

    def test_non_strings_and_blanks_are_dropped(self):
        assert _dedup(["a", "", None, 7, "  ", "b"]) == ["a", "b"]

    def test_non_list_input_is_not_an_error(self):
        assert _dedup(None) == []
        assert _dedup("Anatomy") == []
