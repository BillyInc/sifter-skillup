"""Apply conservative, source-verified CCMAS duplicate-code repairs.

The script verifies the original PDFs and extracted page text against the
existing manifest, rekeys four rows where the programme course table resolves
the detail-heading code collision, and collapses only duplicate same-course
copies whose source data is equal or strictly more complete. It refuses
ambiguous field conflicts. Use --apply to persist the reviewed repair plan.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
OUTPUT_PREFIX = "ccmas_duplicate_code_residual_apply_checkpoint_2026-09-30_"

REKEYS = [
    {
        "source_file": "agricultural_science.json",
        "programme": "Horticulture and Landscape Management",
        "old_code": "HLM 301",
        "old_title": "Nursery/Seedling Production and Management (Practical)",
        "new_code": "HLM 307",
        "new_title": "Nursery/Seedling Production & Management",
        "source_pages": [348, 365],
        "reason": "The programme course table lists this 2-unit/PH90 practical under HLM 307; the detailed practical block is mislabeled HLM 301, which is separately the lecture course.",
        "set_fields": {"units": 2, "status": "C", "lh": None, "ph": 90},
    },
    {
        "source_file": "agricultural_science.json",
        "programme": "Water Resources Management and Agro-Meteorology",
        "old_code": "WMA 308",
        "old_title": "Practical Year Experience Report",
        "new_code": "WMA 307",
        "new_title": "Practical Year Experience Report",
        "source_pages": [410, 429],
        "reason": "Both 300-level option tables list the practical year report as WMA 307. The detail heading says WMA 308, which is already Agro-Meteorology. Use the table identity and its 270 practical hours; retain the source detail text.",
        "set_fields": {"units": 1, "status": "C", "lh": None, "ph": 270},
    },
    {
        "source_file": "basic_medical.json",
        "programme": "Human Anatomy",
        "old_code": "ANA 301",
        "old_title": "Neuroanatomy",
        "new_code": "ANA 302",
        "new_title": "Neuroanatomy",
        "source_pages": [24, 40],
        "reason": "The Human Anatomy programme table lists ANA 301 as Gross Anatomy of Head & Neck and ANA 302 as Neuroanatomy; the detail heading repeats ANA 301 in error.",
        "set_fields": {"units": 2, "status": "C", "lh": 30},
    },
    {
        "source_file": "environmental_sciences.json",
        "programme": "Building",
        "old_code": "BUD 221",
        "old_title": "Building Construction and Materials III",
        "new_code": "BUD 222",
        "new_title": "Building Construction and Materials III",
        "source_pages": [32, 43],
        "reason": "The Building programme course table explicitly assigns Building Construction and Materials III to BUD 222; the detailed course heading repeats BUD 221, which is Construction & Materials II.",
        "set_fields": {"units": 3, "status": "C", "lh": 30, "ph": 45},
    },
]

# These are repeated instances of one code/title/course identity in option or
# repeated programme blocks. Collapse only where the source data is identical
# or one copy is a strict prefix/subset of the other and workload agrees.
DEDUP_CODES = [
    ("administration_management.json", "Hospitality and Tourism Management", "HTM 410", "Tourism and Hospitality Administration"),
    ("administration_management.json", "Hospitality and Tourism Management", "TRM 408", "Tourism Economics, trade & Marketing"),
    ("allied_health.json", "Public Health", "PHS 202", "Biostatistics"),
    ("arts.json", "Hausa", "HAU 308", "Hausa Contemporary Prose Fiction"),
    ("arts.json", "Theatre Arts", "GST 112", "Nigerian Peoples and Culture"),
    ("arts.json", "Theatre Arts", "GST 212", "Philosophy, Logic And Human Existence"),
    ("arts.json", "Theatre Arts", "GST 312", "Peace and Conflict Resolution"),
    ("arts.json", "Theatre Arts", "ENT 312", "Venture Creation"),
    ("arts.json", "Theatre Arts", "FAC 202", "The Arts and Other Disciplines"),
    ("arts.json", "Theatre Arts", "FAC 301", "Research Methods in the Arts"),
    ("arts.json", "Theatre Arts", "FAC 302", "Theory in the Humanities"),
    ("environmental_sciences.json", "Geography", "MTH 102", "Elementary Mathematics II"),
]


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", str(value or "").casefold()))


def prefix_or_equal(left: str, right: str) -> bool:
    a, b = norm(left), norm(right)
    return not a or not b or a == b or a.startswith(b) or b.startswith(a)


def ordered_subset(short: list[Any], long: list[Any]) -> bool:
    if not short:
        return True
    i = 0
    for item in long:
        if item == short[i]:
            i += 1
            if i == len(short):
                return True
    return False


def compatible_duplicate(left: dict[str, Any], right: dict[str, Any]) -> bool:
    for field in ("level", "units", "status", "lh", "ph"):
        if left.get(field) != right.get(field):
            return False
    if not prefix_or_equal(left.get("content_summary", ""), right.get("content_summary", "")):
        return False
    if not ordered_subset(left.get("skills_learned") or [], right.get("skills_learned") or []) and not ordered_subset(right.get("skills_learned") or [], left.get("skills_learned") or []):
        return False
    return True


def completeness(course: dict[str, Any]) -> tuple[int, int, int, int]:
    summary = str(course.get("content_summary") or "")
    skills = course.get("skills_learned") or []
    return (bool(summary.strip()) + bool(skills), len(skills), len(summary), sum(v is not None for v in (course.get("units"), course.get("lh"), course.get("ph"))))


def source_pages() -> dict[str, list[str]]:
    reviewer = AUDIT / "review_ccmas_duplicate_code_groups_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("ccmas_duplicate_source_review", reviewer)
    if not spec or not spec.loader:
        raise RuntimeError("Could not load source-integrity verifier")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.verified_source_pages(read_json(MANIFEST))


def verify_rekey_evidence(repair: dict[str, Any], pages: list[str]) -> None:
    old = "".join(repair["old_code"].casefold().split())
    new = "".join(repair["new_code"].casefold().split())
    title = norm(repair["new_title"])
    for page_no in repair["source_pages"]:
        if page_no < 1 or page_no > len(pages):
            raise RuntimeError(f"Invalid source page: {repair['source_file']} p.{page_no}")
    text = "\n".join(pages[n - 1] for n in repair["source_pages"])
    compact = "".join(text.casefold().split())
    folded = norm(text)
    if old not in compact or new not in compact or not all(token in folded for token in title.split() if len(token) > 2):
        raise RuntimeError(f"Source evidence check failed for {repair['source_file']}::{repair['programme']}::{repair['old_code']}")


def next_checkpoint() -> Path:
    existing = [p for p in AUDIT.glob(OUTPUT_PREFIX + "*.json")]
    seqs = [int(p.stem.rsplit("_", 1)[-1]) for p in existing if p.stem.rsplit("_", 1)[-1].isdigit()]
    return AUDIT / f"{OUTPUT_PREFIX}{max(seqs, default=0) + 1:03d}.json"


def run(apply: bool) -> dict[str, Any]:
    pages = source_pages()
    docs: dict[str, dict[str, Any]] = {}
    changed: set[str] = set()
    operations: list[dict[str, Any]] = []

    def get_doc(filename: str) -> dict[str, Any]:
        if filename not in docs:
            docs[filename] = read_json(CCMAS / filename)
        return docs[filename]

    for repair in REKEYS:
        verify_rekey_evidence(repair, pages[repair["source_file"]])
        doc = get_doc(repair["source_file"])
        programmes = [p for p in doc.get("programmes", []) if p.get("name") == repair["programme"]]
        if len(programmes) != 1:
            raise RuntimeError(f"Programme guard failed: {repair['programme']}")
        courses = programmes[0].get("courses", [])
        matches = [c for c in courses if c.get("code") == repair["old_code"] and c.get("title") == repair["old_title"]]
        already = [c for c in courses if c.get("code") == repair["new_code"] and c.get("title") == repair["new_title"]]
        if not matches and len(already) == 1:
            operations.append({"kind": "source_table_rekey", "key": f"{repair['source_file']}::{repair['programme']}::{repair['old_code']}", "result": "already_repaired"})
            continue
        if len(matches) != 1 or already:
            raise RuntimeError(f"Course identity guard failed: {repair['source_file']}::{repair['programme']}::{repair['old_code']}::{repair['old_title']}")
        row = matches[0]
        row["code"] = repair["new_code"]
        row["title"] = repair["new_title"]
        row.update(repair["set_fields"])
        row["source_state"] = "source_reconciled_original_pdf"
        row["source_locator"] = f"Original CCMAS source course table/detail: printed pp. {', '.join(map(str, repair['source_pages']))}"
        operations.append({"kind": "source_table_rekey", "key": f"{repair['source_file']}::{repair['programme']}::{repair['old_code']}::{repair['old_title']}", "result": "applied"})
        changed.add(repair["source_file"])

    for filename, programme_name, code, title in DEDUP_CODES:
        doc = get_doc(filename)
        programmes = [p for p in doc.get("programmes", []) if p.get("name") == programme_name]
        if len(programmes) != 1:
            raise RuntimeError(f"Programme guard failed: {filename}::{programme_name}")
        courses = programmes[0].get("courses", [])
        canonical_title = norm(title)
        candidates = [c for c in courses if c.get("code") == code and norm(c.get("title")) == canonical_title]
        if len(candidates) < 2:
            operations.append({"kind": "duplicate_same_course_collapse", "key": f"{filename}::{programme_name}::{code}::{title}", "result": "not_a_duplicate_or_already_collapsed"})
            continue
        # Multiple records must form a single, lossless source-detail chain.
        ordered = sorted(candidates, key=completeness, reverse=True)
        best = ordered[0]
        if any(not compatible_duplicate(best, candidate) for candidate in ordered[1:]):
            operations.append({"kind": "duplicate_same_course_collapse", "key": f"{filename}::{programme_name}::{code}::{title}", "result": "preserved_source_variant_conflict"})
            continue
        # Source title/code are independently verified in the original PDF.
        source = "\n".join(pages[filename])
        if "".join(code.casefold().split()) not in "".join(source.casefold().split()) or not all(token in norm(source) for token in canonical_title.split() if len(token) > 2):
            raise RuntimeError(f"Duplicate source check failed: {filename}::{programme_name}::{code}::{title}")
        for duplicate in ordered[1:]:
            courses.remove(duplicate)
        operations.append({"kind": "duplicate_same_course_collapse", "key": f"{filename}::{programme_name}::{code}::{title}", "result": f"collapsed_{len(ordered)-1}_redundant_copy"})
        changed.add(filename)

    result = {
        "schema": "2026-09-30.ccmas-duplicate-code-residual-apply.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if apply else "dry_run",
        "source_integrity": "original_pdf_and_extracted_text_hashes_verified",
        "status": "applied" if apply else "dry_run_ready",
        "files_changed": sorted(changed) if apply else [],
        "operations": operations,
    }
    if apply:
        for filename in sorted(changed):
            (CCMAS / filename).write_text(json.dumps(docs[filename], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = next_checkpoint()
    checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint.with_suffix(".md").write_text(
        "\n".join([
            "# CCMAS duplicate-code residual reconciliation — 2026-09-30",
            "",
            f"Mode: **{result['mode']}**; source integrity: **{result['source_integrity']}**.",
            f"Files changed: **{', '.join(result['files_changed']) if result['files_changed'] else 'none'}**.",
            "",
            *[f"- `{op['key']}` — {op['kind']}: **{op['result']}**" for op in operations],
            "",
        ]),
        encoding="utf-8",
    )
    result["checkpoint"] = checkpoint.name
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    print(json.dumps(run(args.apply), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
