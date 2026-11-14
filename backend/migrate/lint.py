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
_DROP_COLUMN = re.compile(r"\bDROP\s+COLUMN\b", re.I)
_DROP_SCHEMA = re.compile(r"\bDROP\s+SCHEMA\b", re.I)
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


@dataclass
class Analysis:
    begin_count: int = 0
    commit_count: int = 0
    rollback_count: int = 0
    explicit_transaction: bool = False
    drop_table: int = 0
    drop_column: int = 0
    drop_schema: int = 0
    truncate: int = 0
    delete_without_where: int = 0
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
    result.drop_table = len(_DROP_TABLE.findall(flat))
    result.drop_column = len(_DROP_COLUMN.findall(flat))
    result.drop_schema = len(_DROP_SCHEMA.findall(flat))
    result.truncate = len(_TRUNCATE.findall(flat))
    result.delete_without_where = _delete_without_where(flat)
    result.destructive = bool(
        result.drop_table
        or result.drop_column
        or result.drop_schema
        or result.truncate
        or result.delete_without_where
    )
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


def _compare_counterpart(plain: Path, gz: Path, plain_sha: str) -> str:
    """``match``, ``crlf-only`` (same text, different line endings) or ``MISMATCH``."""
    if sqlio.sha256_file(gz) == plain_sha:
        return "match"
    normalise = lambda raw: raw.replace(b"\r\n", b"\n")  # noqa: E731
    if normalise(sqlio.read_bytes(plain)) == normalise(sqlio.read_bytes(gz)):
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
            report.counterpart = _compare_counterpart(path, gz, report.sha256)
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
                if r.role == role and r.counterpart in ("MISMATCH", "crlf-only")
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
    header = f"{'file':<78} {'KiB':>8} {'txn':<5} {'destructive':<18} {'idem':<5} {'rls?':<5}"
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
        for key, label in (
            ("drop_table", "DT"),
            ("drop_column", "DC"),
            ("drop_schema", "DS"),
            ("truncate", "TR"),
            ("delete_without_where", "DEL"),
        ):
            if analysis[key]:
                parts.append(f"{label}{analysis[key]}")
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
        }.get(row["counterpart"], "")
        lines.append(
            f"{row['path']:<78} {row['size_bytes'] / 1024:>8.0f} {txn:<5} {destructive:<18} {idem:<5} {rls:<5}{flag}"
        )
    lines.append("")
    lines.append(
        "destructive legend: DT drop table, DC drop column, DS drop schema, TR truncate, DEL delete without where"
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
