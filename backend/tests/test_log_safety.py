"""`log_safety`: the classified error summary and the public-query sanitizer.

The sanitizer half is a SECURITY test, not a formatting one. `_clean_public_query`
stripped `%` and `_` and its docstring claimed that "prevents wildcard-only
scraping". PostgREST ALSO maps `*` to `%` in `like`/`ilike`, and `*` was not
stripped -- so `?q=**` cleared the two-character floor (`?q=*` did not) and
matched everything. MEASURED against the dev project through the live app:

    ?q=zzzzzzqqqq  (control) -> 0 rows in every group
    ?q=**                    -> domains 20, subgroups 20, roles 36,
                                roleFamilies 38, programmes 20, universities 20,
                                tools 20, certifications 20
    ?q=*a*                   -> the same shape;  ?q=a* -> the same shape

and the content was the alphabetical head of every table (`Accounting`,
`Actuarial Science`, ... / `AAAU`, `AAU`, `AAUA`). Because each group is
`.order("name").limit(20)`, prefix walking (`aa*`, `ab*`, `ac*`, ...) paginates
the ENTIRE career graph out of an endpoint whose own short-query notice says
"Bulk graph listing is not exposed." It was also the cheapest way to induce the
5xx that the leaky sibling log lines needed (4.67 s for `**`, 7.78 s for `*a*`).

Confirmed independently here against dev with read-only PostgREST calls:

    name=ilike.%zzzqqq%  -> 200, 0 rows      (control)
    name=ilike.%*%       -> 206, 160 rows    (every row in `domains`)
    name=ilike.%a*%      -> 206, 128 rows  == name=ilike.%a%
"""

import pytest

from log_safety import clean_public_query, error_summary, ilike_any, log_db_failure


class TestEveryLikeMetacharacterIsStripped:
    @pytest.mark.parametrize(
        "raw",
        [
            "*",          # PostgREST maps this to `%`
            "%",          # SQL LIKE wildcard
            "_",          # SQL LIKE single-character wildcard
            "\\",         # SQL LIKE escape character
        ],
    )
    def test_a_bare_metacharacter_leaves_nothing_behind(self, raw):
        assert clean_public_query(raw * 6) == ""

    def test_the_star_that_was_missed_is_stripped(self):
        # The regression that matters: `**` used to survive `_clean_public_query`
        # intact, clear `_MIN_PUBLIC_QUERY_LEN` and become `%**%` -> match-all.
        assert clean_public_query("**") == ""
        assert clean_public_query("*a*") == "a"
        assert clean_public_query("a*") == "a"

    def test_mixed_metacharacters_do_not_reassemble_into_a_wildcard(self):
        assert clean_public_query(r"%*_\ *%") == ""
        assert clean_public_query(r"comp*uter\_sci%ence") == "computerscience"

    def test_ordinary_queries_are_untouched_apart_from_trimming(self):
        assert clean_public_query("  Computer Science at UNILAG ") == "Computer Science at UNILAG"
        assert clean_public_query("C#") == "C#"
        assert clean_public_query("R") == "R"
        assert clean_public_query("data-science") == "data-science"
        assert clean_public_query("Design & Technology") == "Design & Technology"

    def test_none_and_empty_are_the_empty_string(self):
        assert clean_public_query(None) == ""
        assert clean_public_query("") == ""
        assert clean_public_query("   ") == ""


class TestTheClassifiedSummaryNeverCarriesFreeText:
    LEAK = (
        "Server error '500 Internal Server Error' for url "
        "'https://abcdefghijklmnop.supabase.co/rest/v1/programmes"
        "?select=id&name=ilike.%25my+secret+search%25'"
    )

    def test_an_http_status_error_string_is_reduced_to_a_class_name(self):
        code, kind = error_summary(Exception(self.LEAK))
        assert code == "unclassified"
        assert kind == "Exception"
        assert "supabase.co" not in code and "secret" not in code

    def test_a_postgrest_code_survives_but_the_message_does_not(self):
        exc = Exception(
            "{'code': 'PGRST205', 'message': \"Could not find the table "
            "'skillup_dev.domain_tools' in the schema cache\"} while requesting " + LEAK_URL
        )
        assert error_summary(exc) == ("PGRST205", "Exception")

    def test_the_helper_writes_the_raw_text_only_at_debug(self, capsys):
        from loguru import logger as loguru_logger

        records = []
        sink = loguru_logger.add(lambda m: records.append(m.record), level="DEBUG")
        try:
            log_db_failure("probe failed", Exception(self.LEAK))
        finally:
            loguru_logger.remove(sink)
        above_debug = [r for r in records if r["level"].name != "DEBUG"]
        assert above_debug, "the failure must still be reported"
        for record in above_debug:
            # `Logger.error(message, error=str)` formats the raw text INTO the
            # message, so `extra` alone cannot see the leak.
            blob = f"{record['message']}|{record['extra']}|{record.get('exception')}"
            assert "supabase.co" not in blob
            assert "secret" not in blob
            assert record["extra"].get("error_code") == "unclassified"
            assert record["extra"].get("error_type") == "Exception"
        debug = [r for r in records if r["level"].name == "DEBUG"]
        assert any("supabase.co" in str(r["extra"].get("error", "")) for r in debug), (
            "classifying the error must not make it undebuggable"
        )

    @pytest.mark.parametrize("level", ["error", "warning", "info", "critical"])
    def test_every_level_the_helper_supports_stays_classified(self, level):
        from loguru import logger as loguru_logger

        records = []
        sink = loguru_logger.add(lambda m: records.append(m.record), level="DEBUG")
        try:
            log_db_failure("probe failed", Exception(self.LEAK), level=level)
        finally:
            loguru_logger.remove(sink)
        emitted = [r for r in records if r["level"].name.lower() == level]
        assert emitted, f"level={level!r} must actually emit at that level"
        for record in emitted:
            blob = f"{record['message']}|{record['extra']}|{record.get('exception')}"
            assert "supabase.co" not in blob and "secret" not in blob


LEAK_URL = (
    "https://abcdefghijklmnop.supabase.co/rest/v1/programmes"
    "?select=id&name=ilike.%25my+secret+search%25"
)


# ── `ilike_any`: the merge, the page, and the ordering ───────────────────────
#
# Round 10's centrepiece had NO unit test. The two route tests that touch it go
# through a recorder that answers `data=[]`, so overlapping rows never occur and
# no merge behaviour was exercised at all. Each of these SURVIVED the full
# suite: removing the dedupe, applying `limit` per-read only and never to the
# merged set, dropping the truncation (`return merged`), dropping the post-merge
# re-sort, and reversing the caller's `columns` tuple.


class _Read:
    """One PostgREST read: records what was asked, answers from a canned dict."""

    def __init__(self, owner):
        self.owner = owner
        self.column = None

    def ilike(self, column, pattern):
        self.column = column
        self.owner.asked.append((column, pattern))
        return self

    def order(self, column):
        self.owner.ordered.append(column)
        return self

    def limit(self, size):
        self.owner.limits.append(size)
        return self

    def execute(self):
        from types import SimpleNamespace

        self.owner.reads += 1
        return SimpleNamespace(data=list(self.owner.rows.get(self.column, [])))


class _Source:
    def __init__(self, rows: dict):
        self.rows = rows
        self.asked: list = []
        self.ordered: list = []
        self.limits: list = []
        self.reads = 0

    def build(self):
        return _Read(self)


def _row(identity, name):
    return {"id": identity, "name": name}


class TestIlikeAnyMergesTwoReadsIntoOnePage:
    def test_a_row_matching_both_columns_appears_once(self):
        source = _Source({
            "name": [_row(1, "Computer Science"), _row(2, "Computer Engineering")],
            "display_name": [_row(2, "Computer Engineering"), _row(3, "Computing")],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "comp", limit=10, order_by="name"
        )
        assert [r["id"] for r in rows] == [2, 1, 3], rows
        assert len(rows) == len({r["id"] for r in rows}), "the dedupe is the point"

    def test_every_column_is_read_even_when_the_first_fills_the_page(self):
        """The short-circuit was the bigger of the two documented differences.

        Simulated against dev at the default `limit=30`, ~20% of a typeahead
        page was swapped out on ordinary terms (`q=science`, `q=management`)
        versus the `or=` spelling, because a full page of `name` matches stopped
        the `display_name` read from happening at all.
        """
        source = _Source({
            "name": [_row(i, f"A{i:02d}") for i in range(3)],
            "display_name": [_row(99, "A00b")],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "a", limit=3, order_by="name"
        )
        assert source.reads == 2, "the second column must still be read"
        assert 99 in {r["id"] for r in rows}, (
            "a row that only matches the second column must be able to win a "
            f"place on the page: {rows}"
        )

    def test_the_page_bound_applies_to_the_MERGED_set(self):
        source = _Source({
            "name": [_row(i, f"n{i}") for i in range(4)],
            "display_name": [_row(10 + i, f"d{i}") for i in range(4)],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "x", limit=5, order_by="name"
        )
        assert len(rows) == 5, (
            "eight distinct rows were read; `limit` bounds what is RETURNED, "
            f"not just each read: got {len(rows)}"
        )
        assert source.limits == [5, 5], source.limits

    def test_the_columns_are_read_in_the_order_the_caller_gave(self):
        source = _Source({"name": [], "display_name": []})
        ilike_any(source.build, ("name", "display_name"), "q", limit=5)
        assert source.asked == [("name", "%q%"), ("display_name", "%q%")]

    def test_the_term_is_always_wrapped_and_handed_over_as_a_value(self):
        source = _Source({"name": []})
        ilike_any(source.build, ("name",), "zz,name.gt.A", limit=5)
        assert source.asked == [("name", "%zz,name.gt.A%")]


class TestIlikeAnyOrdering:
    # The Postgres answer, MEASURED on dev for `programmes` where
    # `name=ilike.%comp%`. Codepoint (`str`) order puts the SHOUTED row first;
    # the database does not, and `casefold` reproduces the database.
    POSTGRES = [
        "Complementary and Alternative Medicine",
        "COMPUTER ENGINEERING",
        "Computer Science",
    ]

    def test_a_two_column_merge_is_ordered_the_way_the_database_orders(self):
        source = _Source({
            "name": [_row(2, "COMPUTER ENGINEERING")],
            "display_name": [_row(1, self.POSTGRES[0]), _row(3, "Computer Science")],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "comp", limit=10, order_by="name"
        )
        assert [r["name"] for r in rows] == self.POSTGRES, (
            "codepoint order would put COMPUTER ENGINEERING first; the server "
            f"does not: {[r['name'] for r in rows]}"
        )

    def test_the_sort_decides_which_rows_survive_the_page(self):
        """It runs BEFORE the truncation, so it is not only cosmetic."""
        source = _Source({
            "name": [_row(2, "COMPUTER ENGINEERING")],
            "display_name": [_row(1, self.POSTGRES[0]), _row(3, "Computer Science")],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "comp", limit=2, order_by="name"
        )
        assert [r["name"] for r in rows] == self.POSTGRES[:2], rows

    def test_a_single_read_keeps_the_servers_own_ordering(self):
        """One read is already ordered by the database. Re-sorting it in Python
        replaces a real collation with an approximation of one, for nothing.

        The fixture's order is neither codepoint nor casefold order, so it can
        only survive if no Python sort ran at all.
        """
        server_order = ["Zebra", "apple", "Mango"]
        source = _Source({"name": [_row(i, n) for i, n in enumerate(server_order)]})
        rows = ilike_any(source.build, ("name",), "a", limit=10, order_by="name")
        assert [r["name"] for r in rows] == server_order, rows
        assert source.reads == 1 and source.ordered == ["name"]

    def test_ties_on_the_order_key_are_broken_by_the_identity(self):
        source = _Source({
            "name": [_row("b", "same"), _row("a", "same")],
            "display_name": [_row("c", "same")],
        })
        rows = ilike_any(
            source.build, ("name", "display_name"), "s", limit=10, order_by="name"
        )
        assert [r["id"] for r in rows] == ["a", "b", "c"], rows

    def test_without_an_order_key_nothing_is_ordered_or_re_sorted(self):
        source = _Source({
            "name": [_row(3, "c")],
            "display_name": [_row(1, "a")],
        })
        rows = ilike_any(source.build, ("name", "display_name"), "x", limit=10)
        assert source.ordered == []
        assert [r["id"] for r in rows] == [3, 1], "merge order, unchanged"


class TestIlikeAnyRefusesToCollapseSilently:
    def test_a_row_without_the_dedupe_key_is_an_error_not_one_row(self):
        """`row.get(key)` was `None` for every row, so `seen` folded the whole
        result down to ONE row -- probed: 3 rows in, 1 row out -- and only when
        a caller forgot to select its own key. `key="id"` defaults quietly."""
        source = _Source({"name": [{"name": "a"}, {"name": "b"}, {"name": "c"}]})
        with pytest.raises(ValueError, match="dedupe key"):
            ilike_any(source.build, ("name",), "x", limit=10, key="id")

    def test_a_non_default_key_is_honoured(self):
        source = _Source({
            "jamb_name": [{"jamb_programme_id": "p1", "jamb_name": "Law"}],
            "canonical_programme_name": [
                {"jamb_programme_id": "p1", "jamb_name": "Law"},
                {"jamb_programme_id": "p2", "jamb_name": "Laws"},
            ],
        })
        rows = ilike_any(
            source.build,
            ("jamb_name", "canonical_programme_name"),
            "law",
            limit=10,
            order_by="jamb_name",
            key="jamb_programme_id",
        )
        assert [r["jamb_programme_id"] for r in rows] == ["p1", "p2"], rows


# ── `frames_only`: keep the stack, drop what the failure said ────────────────

class TestFramesOnlyKeepsTheStackAndNotTheMessage:
    LEAK = (
        "Server error '500 Internal Server Error' for url "
        "'https://abcdefghijklmnop.supabase.co/rest/v1/programmes"
        "?select=id&name=ilike.%25my+secret+search%25'"
    )

    def _raised(self):
        try:
            raise RuntimeError(self.LEAK)
        except RuntimeError as exc:
            return exc

    def test_the_original_traceback_is_preserved(self):
        from log_safety import frames_only

        exc = self._raised()
        assert frames_only(exc).__traceback__ is exc.__traceback__

    def test_the_message_is_the_classified_summary_only(self):
        from log_safety import frames_only

        stand_in = frames_only(self._raised())
        assert str(stand_in) == "RuntimeError [unclassified]"
        assert "supabase.co" not in str(stand_in)
        assert "secret" not in str(stand_in)

    def test_a_classifiable_code_reaches_the_stand_in_message(self):
        from log_safety import frames_only

        stand_in = frames_only(Exception("{'code': 'PGRST205', 'message': 'x'}"))
        assert str(stand_in) == "Exception [PGRST205]"

    def test_the_chain_is_cleared_so_no_link_renders_the_value_line(self):
        import traceback as tb

        from log_safety import frames_only

        try:
            try:
                raise RuntimeError(self.LEAK)
            except RuntimeError as inner:
                raise ValueError("outer, harmless") from inner
        except ValueError as outer:
            stand_in = frames_only(outer)

        assert stand_in.__cause__ is None and stand_in.__context__ is None
        rendered = "".join(
            tb.format_exception(type(stand_in), stand_in, stand_in.__traceback__)
        )
        assert "supabase.co" not in rendered, rendered
        assert "secret" not in rendered, rendered

    def test_a_note_added_to_the_exception_does_not_survive_either(self):
        """`__notes__` is the third member of the `__cause__`/`__context__`
        family, and it was pinned by nothing.

        `traceback` renders notes verbatim under the value line, so a handler
        that annotates before re-raising re-opens the exact channel
        `frames_only` exists to close. Adding four lines to `frames_only` that
        copy `exc.__notes__` onto the stand-in survived 706 green, and it is a
        LIVE leak rather than a no-op -- the mutant published
        `['<project-ref>', 'supabase.co', 'secret']` at ERROR, i.e. the
        Supabase project ref plus the raw user term.

        Closed by construction (a fresh object has no notes) rather than by an
        explicit delete, so this asserts on the RENDERED output, which is what
        actually reaches the record.
        """
        import traceback as tb

        from log_safety import frames_only

        exc = self._raised()
        exc.add_note(self.LEAK)
        exc.add_note("my secret search")
        stand_in = frames_only(exc)

        assert not getattr(stand_in, "__notes__", None), getattr(stand_in, "__notes__")
        rendered = "".join(
            tb.format_exception(type(stand_in), stand_in, stand_in.__traceback__)
        )
        assert "supabase.co" not in rendered, rendered
        assert "secret" not in rendered, rendered

    def test_the_renderer_here_can_see_a_note(self):
        """POSITIVE CONTROL for the test above.

        `add_note` on an exception that is never rendered, or a renderer that
        drops notes, would make the assertion inert. Prove that THE SAME
        renderer prints a note when one is really present.
        """
        import traceback as tb

        exc = self._raised()
        exc.add_note(self.LEAK)
        rendered = "".join(tb.format_exception(type(exc), exc, exc.__traceback__))
        assert "supabase.co" in rendered and "secret" in rendered, rendered
        assert exc.__notes__ == [self.LEAK]

    def test_an_exception_that_was_never_raised_has_no_stack_and_still_works(self):
        from log_safety import frames_only

        stand_in = frames_only(RuntimeError(self.LEAK))
        assert stand_in.__traceback__ is None
        assert "secret" not in str(stand_in)

    def test_the_renderer_used_here_can_see_a_leak(self):
        """POSITIVE CONTROL: the same rendering, on the UNMODIFIED exception."""
        import traceback as tb

        exc = self._raised()
        rendered = "".join(tb.format_exception(type(exc), exc, exc.__traceback__))
        assert "supabase.co" in rendered and "secret" in rendered


class TestTheHelperOnlyAttachesAStackWhereItIsAsked:
    def _records(self, **kwargs):
        from loguru import logger as loguru_logger

        records = []
        sink = loguru_logger.add(lambda m: records.append(m.record), level="DEBUG")
        try:
            log_db_failure("probe failed", Exception("boom"), **kwargs)
        finally:
            loguru_logger.remove(sink)
        return [r for r in records if r["level"].name != "DEBUG"]

    def test_the_default_is_still_no_stack(self):
        assert all(r.get("exception") is None for r in self._records())

    def test_with_traceback_attaches_one_and_keeps_the_classification(self):
        records = self._records(with_traceback=True)
        assert records and all(r.get("exception") is not None for r in records)
        assert all(r["extra"]["error_type"] == "Exception" for r in records)

    @pytest.mark.parametrize("level", ["warning", "info"])
    def test_a_level_that_cannot_carry_a_stack_is_left_alone(self, level):
        """`Logger.warning`/`Logger.info` do not route through
        `logger.opt(exception=...)`, so an object there would only be
        stringified into `extra` -- the classified summary twice over, and no
        stack. Those levels stay on the plain spelling."""
        records = self._records(level=level, with_traceback=True)
        assert records, f"level={level} must still emit"
        for record in records:
            assert record.get("exception") is None
            assert "error" not in record["extra"], record["extra"]
