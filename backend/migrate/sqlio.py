"""File access helpers: transparent ``.gz`` handling and checksums.

Checksums are always computed over the *decompressed* bytes so a ``.sql`` file
and its ``.sql.gz`` transport hash identically.
"""

from __future__ import annotations

import gzip
import hashlib
import re
from pathlib import Path
from typing import BinaryIO, Iterator

_CHUNK = 1 << 20


def open_binary(path: Path) -> BinaryIO:
    """Open ``path`` for reading, decompressing when it ends in ``.gz``."""
    if path.suffix == ".gz":
        return gzip.open(path, "rb")  # type: ignore[return-value]
    return path.open("rb")


def iter_chunks(path: Path) -> Iterator[bytes]:
    with open_binary(path) as handle:
        while True:
            chunk = handle.read(_CHUNK)
            if not chunk:
                return
            yield chunk


def sha256_file(path: Path) -> str:
    """SHA-256 of the decompressed content of ``path``."""
    digest = hashlib.sha256()
    for chunk in iter_chunks(path):
        digest.update(chunk)
    return digest.hexdigest()


def read_bytes(path: Path) -> bytes:
    return b"".join(iter_chunks(path))


def read_capped(path: Path, max_bytes: int) -> bytes | None:
    """Decompressed content, or ``None`` if it exceeds ``max_bytes``."""
    buffer = bytearray()
    for chunk in iter_chunks(path):
        buffer += chunk
        if len(buffer) > max_bytes:
            return None
    return bytes(buffer)


def stem(name: str) -> str:
    """``migration_x.sql.gz`` / ``migration_x.sql`` -> ``migration_x``."""
    if name.endswith(".gz"):
        name = name[: -len(".gz")]
    if name.endswith(".sql"):
        name = name[: -len(".sql")]
    return name


_PART = re.compile(r"(\d+)")


def part_number(path: Path) -> int | None:
    match = _PART.search(path.name)
    return int(match.group(1)) if match else None


def part_sort_key(path: Path) -> tuple[int, str]:
    """Numeric order for ``part-007.sql.gz`` style names."""
    number = part_number(path)
    return (-1 if number is None else number, path.name)
