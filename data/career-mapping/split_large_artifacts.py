"""Split and reassemble generated artifacts that exceed GitHub's file limit.

The split JSON files remain valid JSON objects. SQL is split only at statement
boundaries and each part is independently executable in numeric order.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import re
import shutil
from pathlib import Path
from typing import Iterable


DEFAULT_MAX_BYTES = 40_000_000


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_manifest(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_transport(path: Path, content: bytes, compressed: bool) -> None:
    if compressed:
        with gzip.open(path, "wb", compresslevel=9) as handle:
            handle.write(content)
    else:
        path.write_bytes(content)


def read_transport(path: Path) -> bytes:
    if path.suffix == ".gz":
        with gzip.open(path, "rb") as handle:
            return handle.read()
    return path.read_bytes()


def sql_statements(text: str) -> Iterable[str]:
    """Yield SQL statements without splitting semicolons inside literals/comments."""

    start = 0
    index = 0
    quote: str | None = None
    dollar_tag: str | None = None
    line_comment = False
    block_comment = False

    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""

        if line_comment:
            if char in "\r\n":
                line_comment = False
            index += 1
            continue

        if block_comment:
            if char == "*" and next_char == "/":
                block_comment = False
                index += 2
            else:
                index += 1
            continue

        if dollar_tag is not None:
            if text.startswith(dollar_tag, index):
                index += len(dollar_tag)
                dollar_tag = None
            else:
                index += 1
            continue

        if quote == "'":
            if char == "'" and next_char == "'":
                index += 2
            elif char == "'":
                quote = None
                index += 1
            else:
                index += 1
            continue

        if quote == '"':
            if char == '"' and next_char == '"':
                index += 2
            elif char == '"':
                quote = None
                index += 1
            else:
                index += 1
            continue

        if char == "-" and next_char == "-":
            line_comment = True
            index += 2
            continue
        if char == "/" and next_char == "*":
            block_comment = True
            index += 2
            continue
        if char in ("'", '"'):
            quote = char
            index += 1
            continue
        if char == "$":
            match = re.match(r"\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$", text[index:])
            if match:
                dollar_tag = match.group(0)
                index += len(dollar_tag)
                continue
        if char == ";":
            statement = text[start : index + 1]
            if statement.strip():
                yield statement
            start = index + 1
        index += 1

    tail = text[start:]
    if tail.strip():
        yield tail


def sql_file_statements(path: Path) -> Iterable[str]:
    """Stream SQL statements line-by-line so large seeds do not need one huge string."""

    buffer: list[str] = []
    quote: str | None = None
    dollar_tag: str | None = None
    line_comment = False
    block_comment = False

    with path.open("r", encoding="utf-8", newline="") as handle:
        for line in handle:
            segment_start = 0
            index = 0
            while index < len(line):
                char = line[index]
                next_char = line[index + 1] if index + 1 < len(line) else ""

                if line_comment:
                    if char in "\r\n":
                        line_comment = False
                    index += 1
                    continue
                if block_comment:
                    if char == "*" and next_char == "/":
                        block_comment = False
                        index += 2
                    else:
                        index += 1
                    continue
                if dollar_tag is not None:
                    if line.startswith(dollar_tag, index):
                        index += len(dollar_tag)
                        dollar_tag = None
                    else:
                        index += 1
                    continue
                if quote == "'":
                    if char == "'" and next_char == "'":
                        index += 2
                    elif char == "'":
                        quote = None
                        index += 1
                    else:
                        index += 1
                    continue
                if quote == '"':
                    if char == '"' and next_char == '"':
                        index += 2
                    elif char == '"':
                        quote = None
                        index += 1
                    else:
                        index += 1
                    continue
                if char == "-" and next_char == "-":
                    line_comment = True
                    index += 2
                    continue
                if char == "/" and next_char == "*":
                    block_comment = True
                    index += 2
                    continue
                if char in ("'", '"'):
                    quote = char
                    index += 1
                    continue
                if char == "$":
                    match = re.match(r"\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$", line[index:])
                    if match:
                        dollar_tag = match.group(0)
                        index += len(dollar_tag)
                        continue
                if char == ";":
                    buffer.append(line[segment_start : index + 1])
                    statement = "".join(buffer)
                    if statement.strip():
                        yield statement
                    buffer = []
                    segment_start = index + 1
                index += 1
            if segment_start < len(line):
                buffer.append(line[segment_start:])
            line_comment = False

    tail = "".join(buffer)
    if tail.strip():
        yield tail


def generated_sql_statements(path: Path) -> Iterable[str]:
    """Fast boundary reader for this generator's one-statement-per-terminator output."""

    buffer: list[str] = []
    with path.open("r", encoding="utf-8", newline="") as handle:
        for line in handle:
            buffer.append(line)
            if line.rstrip().endswith(";"):
                statement = "".join(buffer)
                if statement.strip():
                    yield statement
                buffer = []
    tail = "".join(buffer)
    if tail.strip():
        yield tail


def is_transaction_control(statement: str) -> bool:
    without_comments = re.sub(r"--[^\n]*|/\*.*?\*/", "", statement, flags=re.S)
    return without_comments.strip().upper() in {"BEGIN;", "COMMIT;"}


def split_sql(source: Path, output_dir: Path, max_bytes: int, compressed: bool = False) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    statements = [statement for statement in generated_sql_statements(source) if not is_transaction_control(statement)]
    header = (
        "-- AUTO-GENERATED transport part; apply parts in numeric order.\n"
        "-- The original preview is development-only; do not apply to production.\n"
        "SET search_path TO skillup_dev;\nBEGIN;\n"
    )
    footer = "\nCOMMIT;\n"
    parts: list[Path] = []
    current: list[str] = []
    current_bytes = len((header + footer).encode("utf-8"))

    def flush() -> None:
        nonlocal current, current_bytes
        if not current:
            return
        part_name = f"part-{len(parts) + 1:03d}.sql"
        part = output_dir / (part_name + ".gz" if compressed else part_name)
        content = (header + "".join(current) + footer).encode("utf-8")
        write_transport(part, content, compressed)
        parts.append(part)
        current = []
        current_bytes = len((header + footer).encode("utf-8"))

    for statement in statements:
        statement_bytes = len(statement.encode("utf-8"))
        if statement_bytes + current_bytes > max_bytes and current:
            flush()
        if statement_bytes + current_bytes > max_bytes:
            raise ValueError(f"One SQL statement exceeds the part limit: {statement_bytes} bytes")
        current.append(statement)
        current_bytes += statement_bytes
    flush()

    manifest = {
        "format": "sql-statement-parts-v1",
        "source": source.name,
        "source_sha256": sha256_file(source),
        "max_part_bytes": max_bytes,
        "compressed": compressed,
        "parts": [
            {"path": part.name, "bytes": part.stat().st_size, "sha256": sha256_file(part)}
            for part in parts
        ],
        "apply_order": "numeric filename order; each part is one transaction",
    }
    write_manifest(output_dir / "manifest.json", manifest)


def split_json(source: Path, output_dir: Path, max_bytes: int, compressed: bool = False) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    payload = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Expected a top-level JSON object: {source}")

    parts: list[Path] = []
    current: dict[str, object] = {}
    current_bytes = 3  # opening brace, closing brace, and newline

    def encoded_entry(key: str, value: object) -> str:
        return json.dumps(key, ensure_ascii=False) + ":" + json.dumps(
            value, ensure_ascii=False, separators=(",", ":")
        )

    def flush() -> None:
        nonlocal current, current_bytes
        if not current:
            return
        part_name = f"part-{len(parts) + 1:03d}.json"
        part = output_dir / (part_name + ".gz" if compressed else part_name)
        content = (json.dumps(current, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
        write_transport(part, content, compressed)
        parts.append(part)
        current = {}
        current_bytes = 3

    for key, value in payload.items():
        if isinstance(value, list):
            key_bytes = len(json.dumps(key, ensure_ascii=False).encode("utf-8")) + 2
            for item in value:
                item_bytes = len(json.dumps(item, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
                if key in current:
                    extra = item_bytes + (1 if current[key] else 0)
                else:
                    extra = key_bytes + item_bytes + (2 if current else 0)
                if current and current_bytes + extra > max_bytes:
                    flush()
                    extra = key_bytes + item_bytes
                if current_bytes + extra > max_bytes:
                    raise ValueError(f"One JSON array item exceeds the part limit: {key}")
                if key not in current:
                    current[key] = []
                current[key].append(item)  # type: ignore[union-attr]
                current_bytes += extra
            continue

        entry = encoded_entry(key, value)
        entry_bytes = len(entry.encode("utf-8"))
        candidate_bytes = current_bytes + entry_bytes + (2 if current else 0)
        if candidate_bytes > max_bytes and current:
            flush()
            candidate_bytes = current_bytes + entry_bytes
        if candidate_bytes > max_bytes:
            raise ValueError(f"One JSON entry exceeds the part limit: {key}")
        current[key] = value
        current_bytes = candidate_bytes
    flush()

    manifest = {
        "format": "json-object-parts-v1",
        "source": source.name,
        "source_sha256": sha256_file(source),
        "max_part_bytes": max_bytes,
        "compressed": compressed,
        "parts": [
            {"path": part.name, "bytes": part.stat().st_size, "sha256": sha256_file(part)}
            for part in parts
        ],
        "reassemble": "merge part files in numeric filename order as one top-level object",
    }
    write_manifest(output_dir / "manifest.json", manifest)


def join_json(manifest_path: Path, output: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    merged: dict = {}
    for part in manifest["parts"]:
        payload = json.loads(read_transport(manifest_path.parent / part["path"]).decode("utf-8"))
        for key, value in payload.items():
            if key not in merged:
                merged[key] = value
            elif isinstance(merged[key], list) and isinstance(value, list):
                merged[key].extend(value)
            elif isinstance(merged[key], dict) and isinstance(value, dict):
                merged[key].update(value)
            else:
                raise ValueError(f"Cannot merge repeated JSON key: {key}")
    output.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    actual = sha256_file(output)
    print(f"reassembled {output} ({actual})")


def join_sql(manifest_path: Path, output: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("format") != "sql-statement-parts-v1":
        raise ValueError(f"Not an SQL parts manifest: {manifest_path}")
    with output.open("w", encoding="utf-8", newline="\n") as handle:
        for part in manifest["parts"]:
            part_path = manifest_path.parent / part["path"]
            if not part_path.is_file():
                raise FileNotFoundError(part_path)
            actual_sha256 = sha256_file(part_path)
            if actual_sha256 != part["sha256"]:
                raise ValueError(
                    f"Checksum mismatch for {part_path}: "
                    f"expected {part['sha256']}, got {actual_sha256}"
                )
            if part_path.suffix == ".gz":
                with gzip.open(part_path, "rt", encoding="utf-8", newline="") as source:
                    shutil.copyfileobj(source, handle)
            else:
                with part_path.open("r", encoding="utf-8", newline="") as source:
                    shutil.copyfileobj(source, handle)
            handle.write("\n")
    print(f"joined {output} ({sha256_file(output)})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    for command, handler in (("split-sql", split_sql), ("split-json", split_json)):
        sub = subparsers.add_parser(command)
        sub.add_argument("source", type=Path)
        sub.add_argument("output_dir", type=Path)
        sub.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
        sub.add_argument("--gzip", action="store_true", help="write gzip-compressed transport parts")
        sub.set_defaults(handler=handler)

    for command, handler in (("join-json", join_json), ("join-sql", join_sql)):
        sub = subparsers.add_parser(command)
        sub.add_argument("manifest", type=Path)
        sub.add_argument("output", type=Path)
        sub.set_defaults(handler=handler)

    args = parser.parse_args()
    if args.command.startswith("split-"):
        args.handler(args.source, args.output_dir, args.max_bytes, args.gzip)
    else:
        args.handler(args.manifest, args.output)


if __name__ == "__main__":
    main()
