"""Row-count assertions run inside an entry's transaction, before COMMIT.

A seed can "succeed" while writing nothing (row-level security, a wrong schema, an empty
source). Recording that as applied would be a silent failure, so an entry may declare
``verify_rows`` in the manifest; a shortfall raises and the transaction rolls back.
"""

from __future__ import annotations

import re

from . import manifest as mf
from .executor import Executor

_IDENT = re.compile(r"[a-z_][a-z0-9_]*\Z")


class RowCheckError(RuntimeError):
    """A declared row-count expectation was not met."""


def run_row_checks(
    executor: Executor, entry: mf.Entry, schema: str = "skillup_dev"
) -> None:
    if not _IDENT.match(schema):
        raise RowCheckError(f"unsafe schema name: {schema!r}")
    for check in entry.verify_rows:
        if not _IDENT.match(check.table):
            raise RowCheckError(f"unsafe table name in verify_rows: {check.table!r}")
        sql = f"SELECT count(*) FROM {schema}.{check.table}"
        params: list[str] = []
        clauses: list[str] = []
        for column, op, values in check.where:
            if not _IDENT.match(column) or op not in ("=", "like", "in"):
                raise RowCheckError(
                    f"unsafe where term in verify_rows: {column!r} {op!r}"
                )
            if op == "in":
                clauses.append(f"{column} IN ({', '.join(['%s'] * len(values))})")
            elif op == "like":
                clauses.append(f"{column} LIKE %s")
            else:
                clauses.append(f"{column} = %s")
            params.extend(values)
        if clauses:
            sql += " WHERE " + " AND ".join(clauses)
        rows = executor.query(sql, params)
        found = int(rows[0][0])
        if found < check.min_rows:
            scope = " matching the declared scope" if check.where else ""
            raise RowCheckError(
                f"{entry.id}: {schema}.{check.table} has {found} row(s){scope} after the "
                f"entry ran; expected at least {check.min_rows}"
            )
