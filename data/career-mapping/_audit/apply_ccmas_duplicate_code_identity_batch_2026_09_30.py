"""Apply source-table-proven identity corrections to duplicate CCMAS code groups.

This lane is intentionally limited to course identity/workload/provenance
fields. It rereads each package immediately before writing and preserves the
current summary and outcome values from the parallel PDF-backed repair lane.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from collections import defaultdict
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
CHECKPOINT_PREFIX = "ccmas_duplicate_code_residual_apply_checkpoint_2026-09-30_"


CORRECTIONS = [
    {
        "source_file": "environmental_sciences.json",
        "programme": "Fine and Applied Arts",
        "old_code": "FAA 231",
        "title": "Introduction to Digital Art and Design",
        "new_code": "FAA 241",
        "fields": {
            "code": "FAA 241",
            "units": 2,
            "status": "C",
            "lh": None,
            "ph": 90,
            "source_state": "source_reconciled_original_pdf",
            "source_locator": "Environmental-Sciences-CCMAS-2023-FINAL.pdf; programme course table PDF p.225 and course detail PDF p.238",
        },
        "source_checks": [
            {"phrase": "FAA 241", "page_phrase": "Introduction to Digital Art and"},
            {"phrase": "FAA 231: Introduction to Digital Art and Design", "page_phrase": "Learning Outcomes"},
            {"phrase": "FAA 231", "page_phrase": "Introduction to Two-Dimensional"},
        ],
        "reason": "The programme table assigns Introduction to Digital Art and Design to FAA 241 (2 C, PH 90), while the detail heading incorrectly repeats FAA 231, which the same table assigns to Two-Dimensional Art and Design.",
    },
    {
        "source_file": "allied_health.json",
        "programme": "Speech-Language Therapy",
        "old_code": "SLT 513",
        "title": "Communication Skills and Ethics",
        "new_code": "PST 513",
        "fields": {
            "code": "PST 513",
            "source_state": "source_reconciled_original_pdf",
            "source_locator": "Allied-Health-Sciences-2023.pdf; Speech-Language Therapy course table PDF p.739 and course detail PDF p.767",
        },
        "source_checks": [
            {"phrase": "PST 513 Communication skills and Ethics", "page_phrase": "SLT 513 Autism Spectrum Disorders"},
            {"phrase": "SLT 513: Communication Skills and Ethics", "page_phrase": "Learning Outcomes"},
            {"phrase": "SLT 513 Autism Spectrum Disorders", "page_phrase": "500 Level"},
        ],
        "reason": "The Speech-Language Therapy programme course table assigns Communication Skills and Ethics to PST 513 and separately assigns Autism Spectrum Disorders to SLT 513; only the former detail row carries the conflicting SLT code.",
    },
]


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def verified_pages() -> dict[str, list[str]]:
    reviewer_path = AUDIT / "review_ccmas_duplicate_code_groups_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("ccmas_duplicate_source_reviewer", reviewer_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load the original-source integrity verifier")
    reviewer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(reviewer)
    return reviewer.verified_source_pages(read_json(MANIFEST))


def verify_source(correction: dict[str, Any], pages_by_file: dict[str, list[str]]) -> None:
    pages = pages_by_file[correction["source_file"]]
    for check in correction["source_checks"]:
        hits = [
            page
            for page in pages
            if check["phrase"].casefold() in page.casefold()
            and check["page_phrase"].casefold() in page.casefold()
        ]
        if not hits:
            raise RuntimeError(
                f"Source evidence guard failed: {correction['source_file']}::{check['phrase']}"
            )


def find_programme(document: dict[str, Any], name: str) -> dict[str, Any]:
    matches = [row for row in document.get("programmes", []) if row.get("name") == name]
    if len(matches) != 1:
        raise RuntimeError(f"Programme guard failed: {name} ({len(matches)} matches)")
    return matches[0]


def apply_correction(document: dict[str, Any], correction: dict[str, Any]) -> str:
    programme = find_programme(document, correction["programme"])
    courses = programme.get("courses", [])
    exact = [
        row
        for row in courses
        if row.get("code") == correction["old_code"]
        and row.get("title") == correction["title"]
    ]
    already = [
        row
        for row in courses
        if row.get("code") == correction["new_code"]
        and row.get("title") == correction["title"]
    ]
    if not exact and len(already) == 1:
        return "already_applied"
    if len(exact) != 1 or already:
        raise RuntimeError(
            f"Current-row guard failed: {correction['source_file']}::"
            f"{correction['programme']}::{correction['old_code']}::{correction['title']}"
        )

    row = exact[0]
    before = deepcopy(row)
    row.update(correction["fields"])
    allowed = set(correction["fields"])
    for field in set(before) | set(row):
        if field not in allowed and before.get(field) != row.get(field):
            raise RuntimeError(f"Unexpected field mutation: {field}")
    return "applied"


def current_duplicate_groups() -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    for path in sorted(CCMAS.glob("*.json")):
        document = read_json(path)
        for programme in document.get("programmes", []):
            by_code: dict[str, list[str]] = defaultdict(list)
            for course in programme.get("courses", []):
                code = " ".join(str(course.get("code") or "").upper().split())
                if code:
                    by_code[code].append(str(course.get("title") or ""))
            for code, titles in sorted(by_code.items()):
                if len(titles) > 1:
                    groups.append({
                        "key": f"{path.name}::{programme.get('name')}::{code}",
                        "record_count": len(titles),
                        "titles": titles,
                    })
    return groups


def next_checkpoint() -> Path:
    numbers = []
    for path in AUDIT.glob(CHECKPOINT_PREFIX + "*.json"):
        suffix = path.stem.rsplit("_", 1)[-1]
        if suffix.isdigit():
            numbers.append(int(suffix))
    return AUDIT / f"{CHECKPOINT_PREFIX}{max(numbers, default=0) + 1:03d}.json"


def run(apply: bool) -> dict[str, Any]:
    if not apply:
        raise RuntimeError("This reviewed batch is apply-only; tests should use apply_correction().")
    pages_by_file = verified_pages()
    operations = []
    changed_files = []

    for correction in CORRECTIONS:
        verify_source(correction, pages_by_file)
        path = CCMAS / correction["source_file"]

        # Reread the current package immediately before each write so the
        # parallel summary/outcome repair is preserved exactly as it stands.
        document = read_json(path)
        before_hash = sha256(path)
        result = apply_correction(document, correction)
        after_hash = None
        if result == "applied":
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files.append(path.name)
            after_hash = sha256(path)
            # Verify the written file and prove the edited identity is present.
            written = read_json(path)
            target = find_programme(written, correction["programme"])
            matching = [
                row for row in target["courses"]
                if row.get("code") == correction["new_code"]
                and row.get("title") == correction["title"]
            ]
            if len(matching) != 1:
                raise RuntimeError(f"Post-write verification failed: {path.name}::{correction['title']}")
        operations.append({
            "key": f"{correction['source_file']}::{correction['programme']}::{correction['old_code']}::{correction['title']}",
            "new_code": correction["new_code"],
            "result": result,
            "reason": correction["reason"],
            "source_checks": correction["source_checks"],
            "before_file_sha256": before_hash,
            "after_file_sha256": after_hash or before_hash,
            "fields_changed": sorted(correction["fields"]) if result == "applied" else [],
            "summary_and_outcomes_changed": False,
        })

    remaining = current_duplicate_groups()
    checkpoint = next_checkpoint()
    result = {
        "schema": "2026-09-30.ccmas-duplicate-code-identity-batch.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply",
        "source_integrity": "original_pdf_and_extracted_text_hashes_verified",
        "files_changed": sorted(set(changed_files)),
        "operations": operations,
        "remaining_duplicate_group_count": len(remaining),
        "remaining_duplicate_groups": remaining,
        "checkpoint": checkpoint.name,
    }
    checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = [
        "# CCMAS duplicate-code identity batch — 2026-09-30",
        "",
        "Source PDF and extracted-page hashes verified against the checked-in manifest.",
        "Only guarded course identity/workload/provenance fields were changed; summary and outcome fields were preserved.",
        f"Files changed: **{', '.join(result['files_changed']) or 'none'}**.",
        "",
        *[
            f"- `{op['key']}` → `{op['new_code']}`: **{op['result']}**. {op['reason']}"
            for op in operations
        ],
        "",
        f"Remaining same-code groups: **{len(remaining)}**.",
        *[f"- `{group['key']}` ({group['record_count']} rows): {', '.join(group['titles'])}" for group in remaining],
        "",
    ]
    checkpoint.with_suffix(".md").write_text("\n".join(markdown), encoding="utf-8")
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    print(json.dumps(run(args.apply), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
