"""Read and write the partitioned learning-resource population.

The population is a build artifact, not a runtime application dependency. It
is kept as ordered JSON-array parts so the complete source-backed dataset can
be versioned without a single file exceeding repository limits.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PARTS_DIR = HERE / "learning_resource_population_parts"
MANIFEST_PATH = HERE / "learning_resource_population.manifest.json"
LEGACY_PATH = HERE / "learning_resource_population.json"
MAX_PART_BYTES = 8 * 1024 * 1024


def _json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def write_population(output: dict) -> dict:
    """Write metadata, ordered resource parts and a checksum manifest."""
    resources = output.get("resources") or []
    metadata = {key: value for key, value in output.items() if key != "resources"}
    PARTS_DIR.mkdir(parents=True, exist_ok=True)
    for old_part in PARTS_DIR.glob("part-*.json"):
        old_part.unlink()

    chunks: list[list[dict]] = []
    current: list[dict] = []
    current_bytes = 2
    for resource in resources:
        encoded = _json_bytes(resource)
        next_bytes = current_bytes + len(encoded) + (1 if current else 0)
        if current and next_bytes > MAX_PART_BYTES:
            chunks.append(current)
            current = []
            current_bytes = 2
        current.append(resource)
        current_bytes += len(encoded) + (1 if len(current) > 1 else 0)
    if current:
        chunks.append(current)

    manifest_parts = []
    offset = 0
    for index, chunk in enumerate(chunks, start=1):
        filename = f"part-{index:03d}.json"
        payload = _json_bytes(chunk)
        path = PARTS_DIR / filename
        path.write_bytes(payload)
        manifest_parts.append({
            "file": f"learning_resource_population_parts/{filename}",
            "part": index,
            "row_start": offset,
            "row_count": len(chunk),
            "bytes": len(payload),
            "sha256": _sha256(payload),
        })
        offset += len(chunk)

    manifest = {
        "schema_version": "1.0.0",
        "storage": "partitioned_json_arrays",
        "source_name": "learning_resource_population.json",
        "max_part_bytes": MAX_PART_BYTES,
        "resource_rows": len(resources),
        "metadata": metadata,
        "parts": manifest_parts,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def load_population() -> dict:
    """Load and verify the partitioned population, with legacy fallback."""
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        resources = []
        for part in manifest["parts"]:
            path = HERE / part["file"]
            payload = path.read_bytes()
            if len(payload) != part["bytes"] or _sha256(payload) != part["sha256"]:
                raise ValueError(f"Population part checksum mismatch: {path}")
            rows = json.loads(payload.decode("utf-8"))
            if not isinstance(rows, list) or len(rows) != part["row_count"]:
                raise ValueError(f"Population part row-count mismatch: {path}")
            resources.extend(rows)
        if len(resources) != manifest["resource_rows"]:
            raise ValueError("Partitioned population row count does not match its manifest")
        return {**manifest["metadata"], "resources": resources}

    if LEGACY_PATH.exists():
        return json.loads(LEGACY_PATH.read_text(encoding="utf-8"))
    raise FileNotFoundError(
        "No partitioned learning-resource population found. Run _build_learning_resource_population.py."
    )
