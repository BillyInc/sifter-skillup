"""Resolve source-proven duplicate-code extraction defects in CCMAS packages.

This narrow repair handles exact package-local duplicate records and known
boundary spill. It verifies source PDF/text hashes using the duplicate review
module, guards the current target rows, and leaves distinct source-authored
same-code courses untouched.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
PREFIX = "ccmas_duplicate_code_extract_residual_2026-09-30_"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def verified_pages() -> dict[str, list[str]]:
    reviewer = AUDIT / "review_ccmas_duplicate_code_groups_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("ccmas_duplicate_source_review", reviewer)
    if not spec or not spec.loader:
        raise RuntimeError("Could not load original-source integrity verifier")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    manifest = load_json(AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json")
    return module.verified_source_pages(manifest)


def find_programme(doc: dict[str, Any], name: str) -> dict[str, Any]:
    rows = [p for p in doc.get("programmes", []) if p.get("name") == name]
    if len(rows) != 1:
        raise RuntimeError(f"Programme guard failed: {name}")
    return rows[0]


def courses_for(doc: dict[str, Any], programme: str, code: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    courses = find_programme(doc, programme).get("courses", [])
    return courses, [c for c in courses if c.get("code") == code]


def norm(value: Any) -> str:
    return " ".join(str(value or "").casefold().split())


def locator_for_pdf_pages(filename: str, phrase: str) -> str:
    matches = [str(i) for i, page in enumerate(verified_cache[filename], 1) if phrase.casefold() in page.casefold()]
    if not matches:
        raise RuntimeError(f"Source locator guard failed: {filename}::{phrase}")
    # These are 1-based PDF page indices in the hash-verified extraction.
    return f"Original CCMAS source PDF; exact course heading found on PDF page(s) {', '.join(matches)}"


verified_cache: dict[str, list[str]] = {}


def choose_exact_duplicate(rows: list[dict[str, Any]], *, code: str, title: str) -> dict[str, Any]:
    matching = [r for r in rows if r.get("code") == code and norm(r.get("title")) == norm(title)]
    if len(matching) != len(rows) or len(matching) < 2:
        raise RuntimeError(f"Exact duplicate guard failed for {code} / {title}: {len(matching)} rows")
    # Keep the most complete instance deterministically; ties keep source order.
    def score(row: dict[str, Any]) -> tuple[int, int, int]:
        return (len(row.get("skills_learned") or []), len(row.get("content_summary") or ""), sum(x is not None for x in (row.get("units"), row.get("lh"), row.get("ph"))))
    return max(enumerate(matching), key=lambda pair: (score(pair[1]), -pair[0]))[1]


def next_checkpoint() -> Path:
    seqs = []
    for path in AUDIT.glob(PREFIX + "*.json"):
        tail = path.stem.rsplit("_", 1)[-1]
        if tail.isdigit():
            seqs.append(int(tail))
    return AUDIT / f"{PREFIX}{max(seqs, default=0) + 1:03d}.json"


def current_duplicate_groups(overrides: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    for path in sorted(CCMAS.glob("*.json")):
        filename = path.name
        payload = overrides.get(filename) or load_json(path)
        for programme in payload.get("programmes", []):
            by_code: dict[str, list[dict[str, Any]]] = {}
            for course in programme.get("courses", []):
                code = str(course.get("code") or "").strip()
                if code:
                    by_code.setdefault(code, []).append(course)
            for code, rows in by_code.items():
                if len(rows) > 1:
                    groups.append({
                        "key": f"{filename}::{programme.get('name')}::{code}",
                        "titles": [row.get("title") for row in rows],
                        "record_count": len(rows),
                    })
    return groups


def run(apply: bool) -> dict[str, Any]:
    pages = verified_pages()
    verified_cache.clear()
    verified_cache.update(pages)
    files: dict[str, dict[str, Any]] = {}
    changes: set[str] = set()
    operations: list[dict[str, Any]] = []

    def doc(filename: str) -> dict[str, Any]:
        if filename not in files:
            files[filename] = load_json(CCMAS / filename)
        return files[filename]

    def record(filename: str, programme: str, code: str, kind: str, detail: str) -> None:
        operations.append({"key": f"{filename}::{programme}::{code}", "kind": kind, "result": detail})
        changes.add(filename)

    def collapse_repeated_detail(filename: str, programme: str, code: str, title: str, source_phrase: str, *, canonical_title: str | None = None) -> None:
        if source_phrase.casefold() not in "\n".join(pages[filename]).casefold():
            raise RuntimeError(f"Original-source guard failed: {source_phrase}")
        course_list, rows = courses_for(doc(filename), programme, code)
        canonical_title = canonical_title or title
        if len(rows) == 2 and all(norm(r.get("title")) == norm(title) for r in rows):
            keep = choose_exact_duplicate(rows, code=code, title=title)
            keep["title"] = canonical_title
            course_list[:] = [r for r in course_list if r is keep or r.get("code") != code]
            keep["source_state"] = "source_reconciled_original_pdf"
            keep["source_locator"] = locator_for_pdf_pages(filename, source_phrase)
            record(filename, programme, code, "collapse_repeated_source_course", "collapsed_one_copy; retained_most_complete_same-course_record")
        elif len(rows) == 1 and norm(rows[0].get("title")) == norm(canonical_title):
            operations.append({"key": f"{filename}::{programme}::{code}", "kind": "collapse_repeated_source_course", "result": "already_repaired"})
        else:
            raise RuntimeError(f"Repeated-course guard failed: {filename}::{programme}::{code}")

    # Geography MTH 102's second record contains the next course (IDD 201)
    # appended into the summary and outcomes. The original CCMAS page has the
    # three calculus outcomes and no technical-drawing content.
    fn, prog, code = "environmental_sciences.json", "Geography", "MTH 102"
    source = "\n".join(pages[fn])
    if "MTH 102: Elementary Mathematics II" not in source or "IDD 201 Technical Drawing" not in source:
        raise RuntimeError("MTH 102 source guard failed")
    _, rows = courses_for(doc(fn), prog, code)
    contaminated = [r for r in rows if "IDD 201" in (r.get("content_summary") or "") and any("technical drawings" in norm(x) for x in (r.get("skills_learned") or []))]
    clean = [r for r in rows if len(r.get("skills_learned") or []) == 3 and "IDD 201" not in (r.get("content_summary") or "")]
    if len(rows) == 2 and len(contaminated) == 1 and len(clean) == 1:
        clean[0]["source_state"] = "source_reconciled_original_pdf"
        clean[0]["source_locator"] = locator_for_pdf_pages(fn, "MTH 102: Elementary Mathematics II")
        find_programme(doc(fn), prog)["courses"].remove(contaminated[0])
        record(fn, prog, code, "remove_boundary_spill_duplicate", "removed_contaminated_IDD201_copy; retained_source_three-outcome_MTH102")
    elif len(rows) == 1 and len(clean) == 1:
        operations.append({"key": f"{fn}::{prog}::{code}", "kind": "remove_boundary_spill_duplicate", "result": "already_repaired"})
    else:
        raise RuntimeError("MTH 102 current-record guard failed")

    # ITH 307 is an exact repeated source course: identical five outcomes and
    # workload, with two paraphrased content-summary extractions.
    fn, prog, code = "allied_health.json", "Information Technology and Health Informatics", "ITH 307"
    if "ITH 307: Survey of Medical Informatics" not in "\n".join(pages[fn]):
        raise RuntimeError("ITH 307 source guard failed")
    course_list, rows = courses_for(doc(fn), prog, code)
    if len(rows) == 2 and rows[0].get("skills_learned") == rows[1].get("skills_learned") and all(rows[0].get(k) == rows[1].get(k) for k in ("level", "units", "status", "lh", "ph")):
        keep = choose_exact_duplicate(rows, code=code, title="Survey of Medical Informatics")
        course_list[:] = [r for r in course_list if r is keep or r.get("code") != code]
        keep["source_state"] = "source_reconciled_original_pdf"
        keep["source_locator"] = locator_for_pdf_pages(fn, "ITH 307: Survey of Medical Informatics")
        record(fn, prog, code, "collapse_exact_repeated_course", "collapsed_one_duplicate; identical_outcomes_and_workload")
    elif len(rows) == 1 and rows[0].get("source_state") == "source_reconciled_original_pdf":
        operations.append({"key": f"{fn}::{prog}::{code}", "kind": "collapse_exact_repeated_course", "result": "already_repaired"})
    else:
        raise RuntimeError("ITH 307 current-record guard failed")

    # Theatre Arts GST 111 and ENT 211 are repeated common courses. Their
    # source blocks specify these workloads; correct the doubled/short PH copy
    # before collapsing the redundant same-title row.
    for code, title, expected, source_phrase in [
        ("GST 111", "Communication in English", {"units": 2, "status": "C", "lh": 15, "ph": 45}, "GST 111: Communication in English"),
        ("ENT 211", "Entrepreneurship and Innovation", {"units": 2, "status": "C", "lh": 15, "ph": 45}, "ENT 211: Entrepreneurship and Innovation"),
    ]:
        fn, prog = "arts.json", "Theatre Arts"
        if source_phrase not in "\n".join(pages[fn]):
            raise RuntimeError(f"Original-source guard failed: {source_phrase}")
        course_list, rows = courses_for(doc(fn), prog, code)
        if len(rows) == 2 and all(norm(r.get("title")) == norm(title) for r in rows):
            for row in rows:
                row.update(expected)
            keep = choose_exact_duplicate(rows, code=code, title=title)
            course_list[:] = [r for r in course_list if r is keep or r.get("code") != code]
            keep["source_state"] = "source_reconciled_original_pdf"
            keep["source_locator"] = locator_for_pdf_pages(fn, source_phrase)
            record(fn, prog, code, "correct_common_course_workload_and_dedupe", "source_workload_applied; collapsed_one_repeated_course")
        elif len(rows) == 1 and rows[0].get("units") == expected["units"] and rows[0].get("lh") == expected["lh"] and rows[0].get("ph") == expected["ph"]:
            operations.append({"key": f"{fn}::{prog}::{code}", "kind": "correct_common_course_workload_and_dedupe", "result": "already_repaired"})
        else:
            raise RuntimeError(f"Current-record guard failed: {fn}::{prog}::{code}")

    # FAC 201's second title is a truncated-title extraction from the same
    # source course. Normalize title/workload from the printed course heading,
    # then collapse the repeated identical detail block.
    fn, prog, code = "arts.json", "Theatre Arts", "FAC 201"
    if "FAC 201: Digital Humanities: Application of Computer to the Arts" not in "\n".join(pages[fn]):
        raise RuntimeError("FAC 201 source guard failed")
    course_list, rows = courses_for(doc(fn), prog, code)
    title = "Digital Humanities: Application of Computer to the Arts"
    if len(rows) == 2 and all(norm(r.get("title", "").split("  (")[0]) == norm(title) for r in rows):
        for row in rows:
            row.update({"title": title, "units": 2, "status": "C", "lh": 30, "ph": None})
        keep = choose_exact_duplicate(rows, code=code, title=title)
        course_list[:] = [r for r in course_list if r is keep or r.get("code") != code]
        keep["source_state"] = "source_reconciled_original_pdf"
        keep["source_locator"] = locator_for_pdf_pages(fn, "FAC 201: Digital Humanities: Application of Computer to the Arts")
        record(fn, prog, code, "repair_truncated_title_and_dedupe", "restored_source_title_and_workload; collapsed_one_copy")
    elif len(rows) == 1 and norm(rows[0].get("title")) == norm(title):
        operations.append({"key": f"{fn}::{prog}::{code}", "kind": "repair_truncated_title_and_dedupe", "result": "already_repaired"})
    else:
        raise RuntimeError("FAC 201 current-record guard failed")

    # These same-code Theatre Arts records are one published course apiece.
    # Dedupe only where course title agrees and preserve the most complete
    # extracted detail; different-title course options remain untouched.
    for code, title, phrase, canonical in [
        ("GST 112", "Nigerian Peoples and Culture", "GST 112: Nigerian Peoples and Culture", "Nigerian Peoples and Culture"),
        ("GST 212", "Philosophy, Logic And Human Existence", "GST 212 Philosophy, Logic and Human Existence", "Philosophy, Logic and Human Existence"),
        ("GST 312", "Peace and Conflict Resolution", "GST 312: Peace and Conflict Resolution", "Peace and Conflict Resolution"),
        ("ENT 312", "Venture Creation", "ENT 312: Venture Creation", "Venture Creation"),
        ("FAC 202", "The Arts and Other Disciplines", "FAC 202: The Arts and Other Disciplines", "The Arts and Other Disciplines"),
        ("FAC 302", "Theory in the Humanities", "FAC 302: Theory in the Humanities", "Theory in the Humanities"),
    ]:
        collapse_repeated_detail("arts.json", "Theatre Arts", code, title, phrase, canonical_title=canonical)

    # Geography's MTH 101 identity is clear from the programme course table.
    # One detail heading drops the final 's'; keep its fuller source-located
    # content while restoring the table's canonical title.
    fn, prog, code = "environmental_sciences.json", "Geography", "MTH 101"
    if "MTH 101: Elementary Mathematics I" not in "\n".join(pages[fn]) or "MTH 101: Elementary Mathematic I" not in "\n".join(pages[fn]):
        raise RuntimeError("MTH 101 source guard failed")
    course_list, rows = courses_for(doc(fn), prog, code)
    if len(rows) == 2 and {norm(r.get("title")) for r in rows} == {norm("Elementary Mathematics I"), norm("Elementary Mathematic I")}:
        if any((r.get("units"), r.get("status"), r.get("lh"), r.get("ph")) != (2, "C", 30, None) for r in rows):
            raise RuntimeError("MTH 101 workload conflict; refusing automatic collapse")
        keep = max(enumerate(rows), key=lambda pair: (bool(pair[1].get("source_state")), len(pair[1].get("content_summary") or ""), len(pair[1].get("skills_learned") or []), -pair[0]))[1]
        keep["title"] = "Elementary Mathematics I"
        keep["source_state"] = "source_reconciled_original_pdf"
        keep["source_locator"] = locator_for_pdf_pages(fn, "MTH 101: Elementary Mathematic I")
        course_list[:] = [r for r in course_list if r is keep or r.get("code") != code]
        record(fn, prog, code, "normalize_source_title_and_dedupe", "restored_course_table_title; collapsed_one_same-course_detail")
    elif len(rows) == 1 and norm(rows[0].get("title")) == norm("Elementary Mathematics I"):
        operations.append({"key": f"{fn}::{prog}::{code}", "kind": "normalize_source_title_and_dedupe", "result": "already_repaired"})
    else:
        raise RuntimeError("MTH 101 current-record guard failed")

    # ENG 306's source block at the named course explicitly includes the
    # duplicate-note suffix; it is not part of the student-facing course title.
    # The other same-code copy contains a spill from ENG 307. Keep the clean
    # six-outcome ENG 306 detail and remove the contaminated repeated block.
    fn, prog, code = "arts.json", "English Language and Literature", "ENG 306"
    source_text = "\n".join(pages[fn])
    if "ENG 306:  Discourse Analysis; Same as ENG 306" not in source_text:
        raise RuntimeError("ENG 306 exact source block guard failed")
    course_list, rows = courses_for(doc(fn), prog, code)
    clean = [r for r in rows if norm(r.get("title")) == norm("Discourse Analysis; Same as ENG 306") and len(r.get("skills_learned") or []) == 6 and "ENG 307" not in (r.get("content_summary") or "")]
    spill = [r for r in rows if "ENG 307" in (r.get("content_summary") or "")]
    if len(rows) == 2 and len(clean) == 1 and len(spill) == 1:
        keep = clean[0]
        keep["title"] = "Discourse Analysis"
        keep["source_state"] = "source_reconciled_original_pdf"
        keep["source_locator"] = locator_for_pdf_pages(fn, "ENG 306:  Discourse Analysis; Same as ENG 306")
        course_list.remove(spill[0])
        record(fn, prog, code, "remove_boundary_spill_and_normalize_title", "removed_ENG307_spill; retained_source_ENG306_course_block")
    elif len(rows) == 1 and norm(rows[0].get("title")) == norm("Discourse Analysis") and rows[0].get("source_state") == "source_reconciled_original_pdf":
        operations.append({"key": f"{fn}::{prog}::{code}", "kind": "remove_boundary_spill_and_normalize_title", "result": "already_repaired"})
    else:
        raise RuntimeError("ENG 306 current-record guard failed")

    remaining_groups = current_duplicate_groups(files)
    result = {
        "schema": "2026-09-30.ccmas-duplicate-code-extract-residual.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if apply else "dry_run",
        "source_integrity": "original_pdf_and_extracted_text_hashes_verified",
        "status": "applied" if apply else "dry_run_ready",
        "files_changed": sorted(changes) if apply else [],
        "operations": operations,
        "current_duplicate_code_group_count": len(remaining_groups),
        "current_duplicate_code_groups": remaining_groups,
    }
    if apply:
        for filename in sorted(changes):
            (CCMAS / filename).write_text(json.dumps(files[filename], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = next_checkpoint()
    checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint.with_suffix(".md").write_text(
        "\n".join([
            "# CCMAS duplicate-code extraction residual repairs — 2026-09-30",
            "",
            f"Mode: **{result['mode']}**. Original PDF/text hashes: **verified**.",
            f"Files changed: **{', '.join(result['files_changed']) if result['files_changed'] else 'none'}**.",
            f"Current remaining same-code groups: **{result['current_duplicate_code_group_count']}**.",
            "",
            *[f"- `{op['key']}` — {op['kind']}: **{op['result']}**" for op in operations],
            "",
            "## Remaining source-context groups",
            "",
            *[f"- `{g['key']}` — {g['record_count']} rows: {', '.join(str(t) for t in g['titles'])}" for g in remaining_groups],
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
