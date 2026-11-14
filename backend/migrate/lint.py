"""Static analysis of migration/seed SQL text. No database, no execution.

Detections are regex based on SQL with comments, string literals and (for
transaction detection) ``DO $$ ... $$`` bodies removed, so ``BEGIN`` inside a
PL/pgSQL block is not mistaken for a transaction start. They are hints for a
reviewer, not a parser: false positives and negatives are possible.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable

from . import manifest as mf
from . import sqlio

# Files larger than this (decompressed) are hashed but not content-analysed.
MAX_ANALYSE_BYTES = 128 * 1024 * 1024

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

_BEGIN = re.compile(r"^\s*(?:BEGIN|START\s+TRANSACTION)\b[^;\n]*;", re.I | re.M)
_COMMIT = re.compile(r"^\s*COMMIT\b[^;\n]*;", re.I | re.M)
_ROLLBACK = re.compile(r"^\s*ROLLBACK\b[^;\n]*;", re.I | re.M)
_DROP_TABLE = re.compile(r"\bDROP\s+TABLE\b", re.I)
_DROP_SCHEMA = re.compile(r"\bDROP\s+SCHEMA\b", re.I)
_DROP_VIEW = re.compile(r"\bDROP\s+(?:MATERIALIZED\s+)?VIEW\b", re.I)
_DROP_FUNCTION = re.compile(r"\bDROP\s+(?:FUNCTION|PROCEDURE|ROUTINE)\b", re.I)
_DROP_POLICY = re.compile(r"\bDROP\s+POLICY\b", re.I)
_DROP_TRIGGER = re.compile(r"\bDROP\s+TRIGGER\b", re.I)
_DROP_INDEX = re.compile(r"\bDROP\s+INDEX\b", re.I)
_DROP_CONSTRAINT = re.compile(r"\bDROP\s+CONSTRAINT\b", re.I)
_DROP_TYPE = re.compile(r"\bDROP\s+TYPE\b", re.I)
_DROP_DATABASE = re.compile(r"\bDROP\s+DATABASE\b", re.I)
_DROP_OTHER = re.compile(
    r"\bDROP\s+(?:SEQUENCE|EXTENSION|ROLE|USER|OWNED|RULE|AGGREGATE|DOMAIN|OPERATOR"
    r"|COLLATION|CAST|PUBLICATION|SUBSCRIPTION|TABLESPACE|LANGUAGE|EVENT\s+TRIGGER)\b",
    re.I,
)
_ALTER_TABLE = re.compile(r"\bALTER\s+TABLE\b", re.I)
# ``DROP [COLUMN] [IF EXISTS] name`` inside an ALTER TABLE; property drops
# (NOT NULL / DEFAULT / IDENTITY / EXPRESSION) and DROP CONSTRAINT are not column drops.
_ALTER_DROP_COLUMN = re.compile(
    r"\bDROP\s+(?:COLUMN\s+)?(?:IF\s+EXISTS\s+)?"
    r"(?!NOT\s+NULL\b|DEFAULT\b|IDENTITY\b|EXPRESSION\b|CONSTRAINT\b)[A-Za-z_\"]",
    re.I,
)
_CASCADE = re.compile(r"\bCASCADE\b", re.I)
_FK_ACTION = re.compile(r"\bON\s+(?:DELETE|UPDATE)\s+$", re.I)
_UPDATE_STMT = re.compile(
    r"\bUPDATE\s+(?:ONLY\s+)?[\w.\"]+(?:\s+(?:AS\s+)?[A-Za-z_]\w*)?\s+SET\b", re.I
)
_DO_BEFORE = re.compile(r"\bDO\s+$", re.I)
_AFTER_DO = re.compile(r"\bDO\s+(?:LANGUAGE\s+['\"]?\w+['\"]?\s+)?$", re.I)
_EXECUTE = re.compile(r"\bEXECUTE\b", re.I)
_STRING_OR_DOLLAR = re.compile(
    r"""'[^']*(?:''[^']*)*'|(?P<tag>\$[A-Za-z_]*\$).*?(?P=tag)""", re.S
)

# Analysis counters that make a file "destructive" (also the table legend order).
DESTRUCTIVE_FIELDS = (
    "drop_table",
    "drop_column",
    "drop_schema",
    "drop_view",
    "drop_function",
    "drop_policy",
    "drop_trigger",
    "drop_index",
    "drop_constraint",
    "drop_type",
    "drop_database",
    "drop_other",
    "truncate",
    "delete_without_where",
    "update_without_where",
    "cascade",
    "dynamic_destructive",
)
_LEGEND = {
    "drop_table": "DT",
    "drop_column": "DC",
    "drop_schema": "DS",
    "drop_view": "DV",
    "drop_function": "DF",
    "drop_policy": "DP",
    "drop_trigger": "DTG",
    "drop_index": "DI",
    "drop_constraint": "DK",
    "drop_type": "DTY",
    "drop_database": "DDB",
    "drop_other": "DO",
    "truncate": "TR",
    "delete_without_where": "DEL",
    "update_without_where": "UPD",
    "cascade": "CAS",
    "dynamic_destructive": "DYN",
}
_TRUNCATE = re.compile(r"\bTRUNCATE\b", re.I)
_DELETE_FROM = re.compile(r"\bDELETE\s+FROM\b", re.I)
_WHERE = re.compile(r"\bWHERE\b", re.I)
_IF_NOT_EXISTS = re.compile(r"\bIF\s+NOT\s+EXISTS\b", re.I)
_IF_EXISTS = re.compile(r"\bIF\s+EXISTS\b", re.I)
_CREATE_OR_REPLACE = re.compile(r"\bCREATE\s+OR\s+REPLACE\b", re.I)
_ON_CONFLICT = re.compile(r"\bON\s+CONFLICT\b", re.I)
_CREATE_TABLE = re.compile(r"\bCREATE\s+(?:UNLOGGED\s+)?TABLE\b", re.I)
_RLS = re.compile(r"\bENABLE\s+ROW\s+LEVEL\s+SECURITY\b|\bCREATE\s+POLICY\b", re.I)


def strip_sql(text: str, keep_bodies: bool) -> str:
    """Blank out comments and string literals.

    With ``keep_bodies`` the contents of dollar-quoted blocks are kept (also
    stripped); otherwise they are removed entirely.
    """

    def replace(match: re.Match[str]) -> str:
        token = match.group(0)
        if token.startswith(("--", "/*")):
            return " "
        if token.startswith("'"):
            return "''"
        if token.startswith('"'):
            return '""'
        if not keep_bodies:
            return " $$ $$ "
        tag = match.group("tag")
        return " " + strip_sql(token[len(tag) : -len(tag)], True) + " "

    return _TOKEN.sub(replace, text)


def _delete_without_where(flat: str) -> int:
    count = 0
    for match in _DELETE_FROM.finditer(flat):
        end = flat.find(";", match.end())
        statement = flat[match.start() : end if end != -1 else len(flat)]
        if not _WHERE.search(statement):
            count += 1
    return count


def _update_without_where(flat: str) -> int:
    count = 0
    for match in _UPDATE_STMT.finditer(flat):
        if _DO_BEFORE.search(flat[max(0, match.start() - 12) : match.start()]):
            continue  # ON CONFLICT ... DO UPDATE SET
        end = flat.find(";", match.end())
        statement = flat[match.start() : end if end != -1 else len(flat)]
        if not _WHERE.search(statement):
            count += 1
    return count


def _cascade_count(flat: str) -> int:
    """``CASCADE`` that is not the ``ON DELETE|UPDATE CASCADE`` foreign-key action."""
    return sum(
        1
        for match in _CASCADE.finditer(flat)
        if not _FK_ACTION.search(flat[max(0, match.start() - 14) : match.start()])
    )


def _alter_drop_column(flat: str) -> int:
    count = 0
    for match in _ALTER_TABLE.finditer(flat):
        end = flat.find(";", match.end())
        statement = flat[match.end() : end if end != -1 else len(flat)]
        count += len(_ALTER_DROP_COLUMN.findall(statement))
    return count


def _strip_comments_only(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        token = match.group(0)
        return " " if token.startswith(("--", "/*")) else token

    return _TOKEN.sub(replace, text)


def _do_block_bodies(text: str) -> Iterable[str]:
    """Bodies of ``DO $$ ... $$`` blocks (comments removed, strings kept)."""
    for match in _TOKEN.finditer(text):
        tag = match.groupdict().get("tag")
        if tag and _AFTER_DO.search(text[max(0, match.start() - 40) : match.start()]):
            yield _strip_comments_only(match.group(0)[len(tag) : -len(tag)])


def _execute_literals(body: str) -> list[str]:
    """String literals inside ``EXECUTE ...;`` statements of a DO body (dynamic SQL)."""
    literals: list[str] = []
    for execute in _EXECUTE.finditer(body):
        position = execute.end()
        while position < len(body) and body[position] != ";":
            literal = _STRING_OR_DOLLAR.match(body, position)
            if literal:
                token = literal.group(0)
                tag = literal.groupdict().get("tag")
                if tag:
                    literals.append(token[len(tag) : -len(tag)])
                else:
                    literals.append(token[1:-1].replace("''", "'"))
                position = literal.end()
            else:
                position += 1
    return literals


def _destructive_counts(flat: str) -> dict[str, int]:
    return {
        "drop_table": len(_DROP_TABLE.findall(flat)),
        "drop_column": _alter_drop_column(flat),
        "drop_schema": len(_DROP_SCHEMA.findall(flat)),
        "drop_view": len(_DROP_VIEW.findall(flat)),
        "drop_function": len(_DROP_FUNCTION.findall(flat)),
        "drop_policy": len(_DROP_POLICY.findall(flat)),
        "drop_trigger": len(_DROP_TRIGGER.findall(flat)),
        "drop_index": len(_DROP_INDEX.findall(flat)),
        "drop_constraint": len(_DROP_CONSTRAINT.findall(flat)),
        "drop_type": len(_DROP_TYPE.findall(flat)),
        "drop_database": len(_DROP_DATABASE.findall(flat)),
        "drop_other": len(_DROP_OTHER.findall(flat)),
        "truncate": len(_TRUNCATE.findall(flat)),
        "delete_without_where": _delete_without_where(flat),
        "update_without_where": _update_without_where(flat),
        "cascade": _cascade_count(flat),
    }


def _dynamic_destructive(text: str) -> int:
    """Destructive statements hidden in ``EXECUTE '...'`` strings of ``DO`` blocks."""
    total = 0
    for body in _do_block_bodies(text):
        for literal in _execute_literals(body):
            total += sum(_destructive_counts(strip_sql(literal, True)).values())
    return total


@dataclass
class Analysis:
    begin_count: int = 0
    commit_count: int = 0
    rollback_count: int = 0
    explicit_transaction: bool = False
    drop_table: int = 0
    drop_column: int = 0
    drop_schema: int = 0
    drop_view: int = 0
    drop_function: int = 0
    drop_policy: int = 0
    drop_trigger: int = 0
    drop_index: int = 0
    drop_constraint: int = 0
    drop_type: int = 0
    drop_database: int = 0
    drop_other: int = 0
    truncate: int = 0
    delete_without_where: int = 0
    update_without_where: int = 0
    cascade: int = 0
    dynamic_destructive: int = 0
    destructive: bool = False
    if_not_exists: int = 0
    if_exists: int = 0
    create_or_replace: int = 0
    on_conflict: int = 0
    has_idempotence_hint: bool = False
    tables_created: int = 0
    mentions_rls: bool = False
    creates_tables_without_rls: bool = False


def analyse_sql(text: str) -> Analysis:
    """Analyse SQL text; pure function used by tests and the file linter."""
    top = strip_sql(text, keep_bodies=False)
    flat = strip_sql(text, keep_bodies=True)
    result = Analysis()
    result.begin_count = len(_BEGIN.findall(top))
    result.commit_count = len(_COMMIT.findall(top))
    result.rollback_count = len(_ROLLBACK.findall(top))
    result.explicit_transaction = result.begin_count > 0 and result.commit_count > 0
    for name, value in _destructive_counts(flat).items():
        setattr(result, name, value)
    result.dynamic_destructive = _dynamic_destructive(text)
    result.destructive = any(getattr(result, name) for name in DESTRUCTIVE_FIELDS)
    result.if_not_exists = len(_IF_NOT_EXISTS.findall(flat))
    result.if_exists = len(_IF_EXISTS.findall(flat))
    result.create_or_replace = len(_CREATE_OR_REPLACE.findall(flat))
    result.on_conflict = len(_ON_CONFLICT.findall(flat))
    result.has_idempotence_hint = bool(
        result.if_not_exists
        or result.if_exists
        or result.create_or_replace
        or result.on_conflict
    )
    result.tables_created = len(_CREATE_TABLE.findall(flat))
    result.mentions_rls = bool(_RLS.search(flat))
    result.creates_tables_without_rls = (
        result.tables_created > 0 and not result.mentions_rls
    )
    return result


@dataclass
class FileReport:
    path: str
    role: str  # migration | seed | patch
    stored_as: str  # sql | gz
    size_bytes: int
    sha256: str
    decompressed_bytes: int | None = None
    analysed: bool = True
    counterpart: str | None = (
        None  # "match" | "crlf-only" | "MISMATCH" when both .sql and .sql.gz exist
    )
    analysis: Analysis | None = None
    notes: list[str] = field(default_factory=list)


def _role(name: str) -> str:
    for prefix in mf.REGISTRABLE_PREFIXES:
        if name.startswith(prefix):
            return prefix.rstrip("_")
    return "other"


def _compare_counterpart(
    plain: Path, gz: Path, plain_sha: str, max_bytes: int = MAX_ANALYSE_BYTES
) -> str:
    """``match``, ``crlf-only`` (same text, different line endings), ``MISMATCH`` or
    ``unverified`` (differs by hash and is too large to compare in memory)."""
    if sqlio.sha256_file(gz) == plain_sha:
        return "match"
    plain_bytes = sqlio.read_capped(plain, max_bytes)
    gz_bytes = sqlio.read_capped(gz, max_bytes)
    if plain_bytes is None or gz_bytes is None:
        return "unverified"
    normalise = lambda raw: raw.replace(b"\r\n", b"\n")  # noqa: E731
    if normalise(plain_bytes) == normalise(gz_bytes):
        return "crlf-only"
    return "MISMATCH"


def lint_file(path: Path, root: Path, max_bytes: int = MAX_ANALYSE_BYTES) -> FileReport:
    rel = (
        path.relative_to(root).as_posix()
        if path.is_relative_to(root)
        else path.as_posix()
    )
    data = sqlio.read_capped(path, max_bytes)
    report = FileReport(
        path=rel,
        role=_role(path.name),
        stored_as="gz" if path.suffix == ".gz" else "sql",
        size_bytes=path.stat().st_size,
        sha256=hashlib.sha256(data).hexdigest()
        if data is not None
        else sqlio.sha256_file(path),
    )
    if path.suffix != ".gz":
        gz = path.with_name(path.name + ".gz")
        if gz.is_file():
            report.counterpart = _compare_counterpart(
                path, gz, report.sha256, max_bytes
            )
    if data is None:
        report.analysed = False
        report.notes.append(
            f"content analysis skipped (over {max_bytes // (1024 * 1024)} MiB)"
        )
        return report
    report.decompressed_bytes = len(data)
    report.analysis = analyse_sql(data.decode("utf-8", errors="replace"))
    return report


def discover(root: Path, manifest: mf.Manifest | None = None) -> list[Path]:
    """Files to lint: top-level migration/seed/patch files plus manifest group parts.

    A ``.sql`` and ``.sql.gz`` pair counts once (the plain file is preferred and
    the pair is cross-checked). Unordered transport directories are not
    content-linted (they can decompress to gigabytes).
    """
    chosen: dict[str, Path] = {}
    for key, path in mf.registrable_items(root).items():
        if path.is_file():
            plain = (
                path
                if path.suffix == ".sql"
                else path.with_name(path.name[: -len(".gz")])
            )
            chosen[key] = plain if plain.is_file() else path
    files = list(chosen.values())
    if manifest is not None:
        for entry in manifest.entries:
            if entry.is_group:
                files.extend(mf.entry_files(entry, root))
    return sorted(files, key=lambda p: p.relative_to(root).as_posix())


def build_report(
    files: Iterable[Path], root: Path, max_bytes: int = MAX_ANALYSE_BYTES
) -> dict[str, Any]:
    reports = [lint_file(path, root, max_bytes) for path in files]
    return {"files": [_as_dict(r) for r in reports], "summary": summarise(reports)}


def _as_dict(report: FileReport) -> dict[str, Any]:
    return asdict(report)


def summarise(reports: list[FileReport]) -> dict[str, Any]:
    summary: dict[str, Any] = {}
    for role in ("migration", "seed", "patch"):
        group = [r for r in reports if r.role == role and r.analysis is not None]
        if not group and not any(r.role == role for r in reports):
            continue
        analysed = [r.analysis for r in group if r.analysis]
        summary[role] = {
            "files": sum(1 for r in reports if r.role == role),
            "analysed": len(analysed),
            "without_explicit_transaction": sum(
                1 for a in analysed if not a.explicit_transaction
            ),
            "destructive": sum(1 for a in analysed if a.destructive),
            "without_idempotence_hint": sum(
                1 for a in analysed if not a.has_idempotence_hint
            ),
            "tables_without_rls": sum(
                1 for a in analysed if a.creates_tables_without_rls
            ),
            "gz_counterpart_differs": sum(
                1
                for r in reports
                if r.role == role
                and r.counterpart in ("MISMATCH", "crlf-only", "unverified")
            ),
            "gz_counterpart_content_mismatch": sum(
                1 for r in reports if r.role == role and r.counterpart == "MISMATCH"
            ),
        }
    return summary


def to_json(report: dict[str, Any]) -> str:
    return json.dumps(report, indent=2, sort_keys=True)


def format_table(report: dict[str, Any]) -> str:
    """Human readable table. Columns: transaction, destructive, idempotence, RLS."""
    header = f"{'file':<78} {'KiB':>8} {'txn':<5} {'destructive':<24} {'idem':<5} {'rls?':<5}"
    lines = [header, "-" * len(header)]
    for row in report["files"]:
        analysis = row["analysis"]
        if analysis is None:
            lines.append(
                f"{row['path']:<78} {row['size_bytes'] / 1024:>8.0f} (not analysed)"
            )
            continue
        txn = "yes" if analysis["explicit_transaction"] else "NO"
        if analysis["begin_count"] > 1:
            txn += f"x{analysis['begin_count']}"
        parts = []
        for key in DESTRUCTIVE_FIELDS:
            if analysis.get(key):
                parts.append(f"{_LEGEND[key]}{analysis[key]}")
        destructive = ",".join(parts) or "-"
        idem = "yes" if analysis["has_idempotence_hint"] else "NO"
        rls = (
            "-"
            if not analysis["tables_created"]
            else ("yes" if analysis["mentions_rls"] else "NO")
        )
        flag = {
            "MISMATCH": "  !gz-CONTENT-MISMATCH",
            "crlf-only": "  gz-crlf-only",
            "unverified": "  gz-UNVERIFIED(too large)",
        }.get(row["counterpart"], "")
        lines.append(
            f"{row['path']:<78} {row['size_bytes'] / 1024:>8.0f} {txn:<5} {destructive:<24} {idem:<5} {rls:<5}{flag}"
        )
    lines.append("")
    lines.append(
        "destructive legend: DT drop table, DC drop column, DS drop schema, DV view, DF function,"
        " DP policy, DTG trigger, DI index, DK constraint, DTY type, DDB database, DO other drop,"
        " TR truncate, DEL delete without where, UPD update without where, CAS cascade,"
        " DYN destructive dynamic SQL in DO"
    )
    for role, stats in report["summary"].items():
        lines.append(
            f"{role}: {stats['files']} files | no explicit txn {stats['without_explicit_transaction']}"
            f" | destructive {stats['destructive']} | no idempotence hint {stats['without_idempotence_hint']}"
            f" | creates tables without RLS/policy mention {stats['tables_without_rls']}"
            f" | .sql vs .sql.gz bytes differ {stats['gz_counterpart_differs']}"
            f" (content differs {stats['gz_counterpart_content_mismatch']})"
        )
    return "\n".join(lines)


@dataclass
class KindConflict:
    entry_id: str
    kind: str
    constructs: dict[str, int]

    def __str__(self) -> str:
        found = ", ".join(f"{_LEGEND[k]}{v}" for k, v in self.constructs.items())
        return f"{self.entry_id} (kind={self.kind}): {found}"


def kind_conflicts(
    manifest: mf.Manifest, root: Path, max_bytes: int = MAX_ANALYSE_BYTES
) -> list[KindConflict]:
    """Entries whose SQL looks destructive but are not ``kind = "destructive"``.

    ``schema``/``seed`` entries that the linter reports as destructive conflict unless
    they carry an explicit ``allow_destructive_reason``. Files over ``max_bytes`` are
    not analysed and cannot conflict.
    """
    conflicts: list[KindConflict] = []
    for entry in manifest.entries:
        if entry.kind == "destructive" or entry.allow_destructive_reason:
            continue
        found: dict[str, int] = {}
        for path in mf.entry_files(entry, root):
            analysis = lint_file(path, root, max_bytes).analysis
            if analysis is None:
                continue
            for name in DESTRUCTIVE_FIELDS:
                value = getattr(analysis, name)
                if value:
                    found[name] = found.get(name, 0) + value
        if found:
            conflicts.append(KindConflict(entry.id, entry.kind, found))
    return conflicts
