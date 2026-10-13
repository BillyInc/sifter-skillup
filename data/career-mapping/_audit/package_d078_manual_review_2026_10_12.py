#!/usr/bin/env python3
"""Build a compressed, checksummed D078 manual-verification bundle."""

from __future__ import annotations

import gzip
import hashlib
import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "artifacts/d078-manual-review-2026-10-12"
FILES = {
    "migration_d078_specialization_taxonomy_2026-10-12.sql": ROOT / "backend/migration_d078_specialization_taxonomy_2026-10-12.sql",
    "seed_d078_specialization_taxonomy_2026-10-12.sql": ROOT / "backend/seed_d078_specialization_taxonomy_2026-10-12.sql",
    "seed_d078_guided_content_2026-10-12.sql": ROOT / "backend/seed_d078_guided_content_2026-10-12.sql",
    "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json": ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json",
    "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json": ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json",
    "D078_STUDENT_PROMOTION_GATE_2026_10_10.json": ROOT / "data/career-mapping/_audit/D078_STUDENT_PROMOTION_GATE_2026_10_10.json",
    "D078_PROGRAMME_TO_ROLE_GUIDED_IMPLEMENTATION_VERIFICATION_2026_10_10.json": ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_GUIDED_IMPLEMENTATION_VERIFICATION_2026_10_10.json",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    entries = []
    for name, source in FILES.items():
        if not source.is_file():
            raise FileNotFoundError(source)
        target = OUT / f"{name}.gz"
        source_digest = hashlib.sha256()
        with source.open("rb") as src, target.open("wb") as raw:
            with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0, compresslevel=9) as dst:
                while chunk := src.read(1024 * 1024):
                    source_digest.update(chunk)
                    dst.write(chunk)
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        restored_digest = hashlib.sha256()
        restored_size = 0
        with gzip.open(target, "rb") as check:
            while chunk := check.read(1024 * 1024):
                restored_digest.update(chunk)
                restored_size += len(chunk)
        if restored_size != source.stat().st_size or restored_digest.hexdigest() != source_digest.hexdigest():
            raise ValueError(f"Compressed payload did not round-trip exactly: {source}")
        entries.append({
            "file": target.name,
            "source": source.relative_to(ROOT).as_posix(),
            "source_bytes": source.stat().st_size,
            "source_sha256": source_digest.hexdigest(),
            "compressed_bytes": target.stat().st_size,
            "sha256": digest,
        })

    manifest = {
        "package": "D078 Sociology guided-experience manual verification",
        "generated_on": "2026-10-12",
        "taxonomy": {"areas": 7, "area_role_routes": 26, "supported": 18, "conditional": 8},
        "contextual_learning_items": {"approved_domain": 52, "distinct_approved_area_cards": 138, "total": 190},
        "deployment_status": "local_artifacts_only_not_applied_to_supabase",
        "files": entries,
    }
    manifest_path = OUT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    archive = ROOT / "artifacts/D078-manual-review-2026-10-12.zip"
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in sorted(OUT.iterdir()):
            if path.is_file():
                zf.write(path, path.relative_to(archive.parent).as_posix())
    with zipfile.ZipFile(archive) as zf:
        corrupt_member = zf.testzip()
        if corrupt_member:
            raise ValueError(f"Corrupt ZIP member: {corrupt_member}")
    print(json.dumps({"directory": str(OUT), "archive": str(archive), "files": entries}, indent=2))


if __name__ == "__main__":
    main()
