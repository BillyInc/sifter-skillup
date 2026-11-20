"""One tokenizer for transaction control, shared by ``lint`` and ``apply``.

A statement is text up to a ``;`` that sits outside comments, quoted strings, quoted
identifiers and dollar-quoted bodies. Transaction control is recognised only as the
*first keyword of a top-level statement*, in any spelling: ``BEGIN``, ``BEGIN WORK``,
``START TRANSACTION``, ``COMMIT``, ``COMMIT WORK``, ``END``, ``ABORT``, ``ROLLBACK``
(``ROLLBACK TO x`` included), ``SAVEPOINT`` and ``RELEASE``. So ``COMMIT; -- done`` and
``END;`` are found, while a ``COMMIT;`` line inside a ``$$`` body or a block comment is not.

Limit (fails closed): a ``BEGIN ATOMIC ... END;`` function body contains top-level
semicolons and is reported as transaction control. Wrap such a function in ``DO``/``EXECUTE``
or use ``$$`` bodies.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

_TOKEN = re.compile(
    r"""
      --[^\n]*                                  # line comment
    | /\*.*?\*/                                 # block comment
    | '[^']*(?:''[^']*)*'                       # string literal
    | "[^"]*"                                   # quoted identifier
    | (?P<tag>\$[A-Za-z_]*\$).*?(?P=tag)        # dollar-quoted body
    """,
    re.S | re.X,
)
_FIRST_WORD = re.compile(r"\s*([A-Za-z]+)(?:\s+([A-Za-z]+))?")
_OPEN = re.compile(r"(BEGIN|START\s+TRANSACTION)(\s+(WORK|TRANSACTION))?\Z", re.I)
_CLOSE = re.compile(r"(COMMIT|END)(\s+(WORK|TRANSACTION))?\Z", re.I)
_BEGIN_KINDS = {"BEGIN", "START"}
_COMMIT_KINDS = {"COMMIT", "END"}
_ROLLBACK_KINDS = {"ROLLBACK", "ABORT"}
TX_KINDS = _BEGIN_KINDS | _COMMIT_KINDS | _ROLLBACK_KINDS | {"SAVEPOINT", "RELEASE"}


def mask(text: str) -> str:
    """Same-length text with every comment/string/quoted body replaced by spaces."""

    def blank(match: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))

    return _TOKEN.sub(blank, text)


def strip_comments(text: str) -> str:
    """Text with comments removed and strings/dollar bodies kept."""

    def drop(match: re.Match[str]) -> str:
        token = match.group(0)
        return " " if token.startswith(("--", "/*")) else token

    return _TOKEN.sub(drop, text)


@dataclass(frozen=True)
class TxStatement:
    kind: str  # BEGIN | START | COMMIT | END | ABORT | ROLLBACK | SAVEPOINT | RELEASE
    start: int  # offset of the first keyword
    stop: int  # offset just after the closing ';' (or end of text)
    line: int
    text: str  # normalised statement text without ';'

    @property
    def is_plain_open(self) -> bool:
        return bool(_OPEN.match(self.text))

    @property
    def is_plain_close(self) -> bool:
        return bool(_CLOSE.match(self.text))

    @property
    def family(self) -> str:
        if self.kind in _BEGIN_KINDS:
            return "begin"
        if self.kind in _COMMIT_KINDS:
            return "commit"
        if self.kind in _ROLLBACK_KINDS:
            return "rollback"
        return "other"


def transaction_statements(text: str) -> list[TxStatement]:
    """Top-level transaction-control statements, in file order."""
    masked = mask(text)
    found: list[TxStatement] = []
    position = 0
    while position < len(masked):
        end = masked.find(";", position)
        stop = len(masked) if end == -1 else end + 1
        chunk = masked[position : stop - (0 if end == -1 else 1)]
        word = _FIRST_WORD.match(chunk)
        if word:
            first = word.group(1).upper()
            second = (word.group(2) or "").upper()
            kind = None
            if first == "START" and second == "TRANSACTION":
                kind = "START"
            elif first in TX_KINDS and first != "START":
                kind = first
            if kind:
                start = position + word.start(1)
                found.append(
                    TxStatement(
                        kind=kind,
                        start=start,
                        stop=stop,
                        line=text.count("\n", 0, start) + 1,
                        text=" ".join(chunk.split()),
                    )
                )
        position = stop
    return found


def count_transaction_control(text: str) -> tuple[int, int, int]:
    """``(begin, commit, rollback)`` counts; COMMIT includes END, ROLLBACK includes ABORT."""
    begins = commits = rollbacks = 0
    for stmt in transaction_statements(text):
        if stmt.family == "begin":
            begins += 1
        elif stmt.family == "commit":
            commits += 1
        elif stmt.family == "rollback":
            rollbacks += 1
    return begins, commits, rollbacks
