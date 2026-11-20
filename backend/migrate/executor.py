"""Database seam for the runner.

``Executor`` is everything the runner needs from a connection. The real adapter
(``PsycopgExecutor``) imports ``psycopg`` lazily, so the package and its tests
need no driver; tests use a fake. The URL comes from ``MIGRATE_DATABASE_URL``
only: never a CLI argument, so it cannot end up in logs or shell history.
"""

from __future__ import annotations

import os
from typing import Any, Protocol, Sequence

URL_ENV = "MIGRATE_DATABASE_URL"
ADVISORY_LOCK_KEY = 7_452_019_331  # arbitrary constant: one runner at a time


class ExecutorError(RuntimeError):
    """A database error, reduced to a message that never contains SQL text."""


class Executor(Protocol):
    def begin(self, *, read_only: bool = False) -> None: ...
    def commit(self) -> None: ...
    def rollback(self) -> None: ...
    def execute(self, sql: str, params: Sequence[Any] = ()) -> None: ...
    def query(self, sql: str, params: Sequence[Any] = ()) -> list[tuple]: ...
    def table_exists(self, schema: str, name: str) -> bool: ...
    def list_tables(self, schema: str) -> list[str]: ...
    def backend_pid(self) -> int: ...
    def set_timeouts(self, lock_timeout_ms: int, statement_timeout_ms: int) -> None: ...
    def reset_session(self) -> None: ...
    def try_advisory_lock(self, key: int) -> bool: ...
    def advisory_unlock(self, key: int) -> None: ...
    def close(self) -> None: ...


class PsycopgExecutor:
    """psycopg 3 adapter (autocommit connection; transactions are explicit)."""

    def __init__(self, url: str) -> None:
        try:
            import psycopg  # type: ignore[import-not-found]
        except ImportError as exc:  # pragma: no cover - exercised only in the apply job
            raise ExecutorError(
                "psycopg is not installed (pip install 'psycopg[binary]')"
            ) from exc
        self._psycopg = psycopg
        try:
            self._conn = psycopg.connect(url, autocommit=True, connect_timeout=20)
        except psycopg.Error as exc:  # pragma: no cover
            raise ExecutorError(f"cannot connect: {type(exc).__name__}") from None

    def _run(self, sql: str, params: Sequence[Any] = ()) -> Any:
        try:
            # No params -> simple query protocol, which allows multi-statement scripts.
            return self._conn.execute(sql, tuple(params) or None)
        except self._psycopg.Error as exc:  # pragma: no cover
            diag = getattr(exc, "diag", None)
            where = f" (sqlstate {diag.sqlstate})" if diag and diag.sqlstate else ""
            first = str(exc).strip().splitlines()[0][:200] if str(exc).strip() else ""
            raise ExecutorError(f"{type(exc).__name__}{where}: {first}") from None

    def begin(self, *, read_only: bool = False) -> None:
        self._run("BEGIN READ ONLY" if read_only else "BEGIN")

    def commit(self) -> None:
        self._run("COMMIT")

    def rollback(self) -> None:
        self._run("ROLLBACK")

    def execute(self, sql: str, params: Sequence[Any] = ()) -> None:
        self._run(sql, params)

    def query(self, sql: str, params: Sequence[Any] = ()) -> list[tuple]:
        return list(self._run(sql, params).fetchall())

    def table_exists(self, schema: str, name: str) -> bool:
        # to_regclass sees the relation whatever the role's privileges are. The standard
        # catalogue views hide tables the role cannot touch, which would let an existing
        # ledger look missing and be "bootstrapped" and re-applied.
        qualified = f'"{schema}"."{name}"'
        return bool(
            self.query("SELECT to_regclass(%s) IS NOT NULL", (qualified,))[0][0]
        )

    def list_tables(self, schema: str) -> list[str]:
        rows = self.query(
            "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace "
            "WHERE n.nspname = %s AND c.relkind IN ('r', 'p', 'v', 'm', 'f') "
            "ORDER BY c.relname",
            (schema,),
        )
        return [str(r[0]) for r in rows]

    def backend_pid(self) -> int:
        return int(self.query("SELECT pg_backend_pid()")[0][0])

    def set_timeouts(self, lock_timeout_ms: int, statement_timeout_ms: int) -> None:
        # SET LOCAL: scoped to the entry's transaction, gone at COMMIT/ROLLBACK.
        self._run(f"SET LOCAL lock_timeout = {int(lock_timeout_ms)}")
        self._run(f"SET LOCAL statement_timeout = {int(statement_timeout_ms)}")

    def reset_session(self) -> None:
        self._run("RESET ALL")

    def try_advisory_lock(self, key: int) -> bool:
        return bool(self.query("SELECT pg_try_advisory_lock(%s)", (key,))[0][0])

    def advisory_unlock(self, key: int) -> None:
        self.query("SELECT pg_advisory_unlock(%s)", (key,))

    def close(self) -> None:
        self._conn.close()


def check_connection_url(url: str) -> None:
    """Refuse a transaction-mode pooler URL.

    Supabase's transaction pooler (port 6543, pgbouncer) hands each statement to any
    backend: BEGIN, the migration and COMMIT could run on different connections and the
    advisory lock would protect nothing. Use the direct connection or the *session* pooler
    (port 5432). Errors never echo the URL.
    """
    from urllib.parse import parse_qs, urlsplit

    try:
        parts = urlsplit(url)
        port = parts.port
        query = parse_qs(parts.query)
    except ValueError:
        raise ExecutorError(f"{URL_ENV} is not a valid connection URL") from None
    if port == 6543 or "pgbouncer" in query:
        raise ExecutorError(
            "refusing a transaction-mode pooler URL (port 6543 / pgbouncer): use the "
            "direct connection or the Supabase session pooler (port 5432)"
        )


def connect_from_env(environ: dict[str, str] | None = None) -> Executor:
    env = os.environ if environ is None else environ
    url = env.get(URL_ENV, "").strip()
    if not url:
        raise ExecutorError(f"{URL_ENV} is not set")
    check_connection_url(url)
    return PsycopgExecutor(url)
