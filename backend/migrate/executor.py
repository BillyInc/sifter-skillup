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
        rows = self.query(
            "SELECT 1 FROM information_schema.tables "
            "WHERE table_schema = %s AND table_name = %s",
            (schema, name),
        )
        return bool(rows)

    def reset_session(self) -> None:
        self._run("RESET ALL")

    def try_advisory_lock(self, key: int) -> bool:
        return bool(self.query("SELECT pg_try_advisory_lock(%s)", (key,))[0][0])

    def advisory_unlock(self, key: int) -> None:
        self.query("SELECT pg_advisory_unlock(%s)", (key,))

    def close(self) -> None:
        self._conn.close()


def connect_from_env(environ: dict[str, str] | None = None) -> Executor:
    env = os.environ if environ is None else environ
    url = env.get(URL_ENV, "").strip()
    if not url:
        raise ExecutorError(f"{URL_ENV} is not set")
    return PsycopgExecutor(url)
