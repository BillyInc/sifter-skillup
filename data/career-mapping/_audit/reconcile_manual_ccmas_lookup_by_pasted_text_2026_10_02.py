"""Reconcile user-transcribed CCMAS lookup entries by their pasted text.

The manual lookup is the authority for the supplied text and absence notes.
Original PDF text is used only to locate which course identity a paste belongs
to (important when the lookup heading itself contains a wrong code/title).
This script defaults to a report-only dry run; --apply is explicit.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from difflib import SequenceMatcher
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
LOOKUP = ROOT.parents[1] / "docs" / "manual-review" / "CCMAS_BLANK_DETAILS_AND_JAMB_LOOKUP_2026-10-01.md"
SOURCE_TEXT = AUDIT / "ccmas_original_source_text_2026-09-29"

PDF_TO_JSON = {
    "Administration-and-Management.pdf": "administration_management.json",
    "Agriculture-2023.pdf": "agricultural_science.json",
    "Allied-Health-Sciences-2023.pdf": "allied_health.json",
    "Architecture-CCMAS-2023-FINAL.pdf": "architecture.json",
    "Arts-CCMAS-2023-FINAL.pdf": "arts.json",
    "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf": "basic_medical.json",
    "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf": "communication_media.json",
    "Computing-CCMAS-2023-FINAL.pdf": "computing.json",
    "Education-CCMAS-2023-New.pdf": "education.json",
    "Engineering-Technology-CCMAS-2023-FINAL.pdf": "engineering.json",
    "Environmental-Sciences-CCMAS-2023-FINAL.pdf": "environmental_sciences.json",
    "Law-ALL.pdf": "law.json",
    "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf": "medicine_dentistry.json",
    "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf": "pharmacy.json",
    "Sciences-CCMAS-2023-FINAL.pdf": "sciences.json",
    "Social-Sciences-CCMAS-FINAL-2023-A.pdf": "social_sciences.json",
    "Veterinary-Medicine-CCMAS-2023-FINAL.pdf": "veterinary.json",
}
FIELD_CONTENTS = "- Exact `Course Contents` text"
FIELD_OUTCOMES = "- Exact `Learning Outcomes` text"
PAGE = "- Printed/PDF page(s):"


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold())


def read_field(block: str, marker: str) -> tuple[str, str]:
    """Return field body and following locator/comment text, wherever pasted."""
    pos = block.find(marker)
    if pos < 0:
        return "", ""
    tail = block[pos + len(marker):]
    next_field = re.search(r"(?m)^- Exact `(?:Course Contents|Learning Outcomes)` text", tail)
    next_heading = re.search(r"(?m)^###\s+\d+\.", tail)
    limit = min([m.start() for m in (next_field, next_heading) if m] or [len(tail)])
    region = tail[:limit]
    page_match = re.search(r"(?m)^- Printed/PDF page\(s\):", region)
    if page_match:
        body = region[:page_match.start()]
        locator = region[page_match.end():]
    else:
        body, locator = region, ""
    body = re.sub(r"(?m)^\s*>\s?", "", body).strip()
    locator = re.sub(r"(?m)^\s*>\s?", "", locator).strip()
    body = re.sub(r"(?i)^\s*\(\s*paste here\s*\)\s*: ?", "", body).strip()
    return body, locator


def source_bodies(block: str) -> tuple[str, list[str], str, str]:
    cbody, cloc = read_field(block, FIELD_CONTENTS)
    obody, oloc = read_field(block, FIELD_OUTCOMES)
    combined = "\n".join(x for x in (cbody, cloc, obody, oloc) if x)
    field_text = "\n".join(x for x in (cbody, obody) if x)
    # Do not mistake an entire programme curriculum pasted in a locator slot
    # for the heading course's own outcomes. It is parsed course-by-course below.
    contents, outcomes = "", []
    labels = list(re.finditer(r"(?i)\bCourse\s+Contents?\b|\bLearning\s+Outcomes?\b", field_text))
    for i, label in enumerate(labels):
        end = labels[i + 1].start() if i + 1 < len(labels) else len(field_text)
        section = field_text[label.end():end].strip(" :()\r\n\t")
        if label.group(0).casefold().startswith("course") and not contents:
            contents = re.sub(r"\s+", " ", section).strip()
        elif label.group(0).casefold().startswith("learning") and not outcomes:
            markers = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.)]\s*", section))
            if markers and int(markers[0].group(1)) == 1:
                expected = 1
                for j, mark in enumerate(markers):
                    if int(mark.group(1)) != expected:
                        break
                    stop = markers[j + 1].start() if j + 1 < len(markers) else len(section)
                    item = re.sub(r"\s+", " ", section[mark.end():stop]).strip(" ;()\r\n\t")
                    if item:
                        outcomes.append(item)
                    expected += 1
    # Most lookup entries already place the value under an explicit field
    # heading, so the pasted value need not repeat "Course Contents". Keep
    # that exact value (including compact source prose) instead of treating it
    # as absent. Likewise, the user's explicit absence wording is a
    # disposition, never student-facing content.
    def is_absence(value: str) -> bool:
        return bool(re.fullmatch(
            r"[\s\-–—:;,.]*(?:doesn.t\s+exist|doesnt\s+exist|does\s+not\s+exist|not\s+exist|no\s+(?:course\s+)?(?:content|contents|summary|outcomes?|learning\s+outcomes?)|none|n/?a)[\s\-–—:;,.]*",
            value.strip(),
            re.I,
        ))

    if cbody and not contents and not is_absence(cbody):
        # If a course label is embedded, strip only that leading label; the
        # detailed-course parser above remains responsible for programme-wide
        # pasted material found in the locator fields.
        contents = re.sub(r"(?i)^\s*Course\s+Contents?\s*[:(]?\s*", "", cbody).strip(" )\r\n\t")
        if is_absence(contents):
            contents = ""
    if obody and not outcomes and not is_absence(obody):
        # Accept an unnumbered short outcome or a numbered outcome list. The
        # latter is split only on explicit consecutive numbering.
        numbered = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.)]\s*", obody))
        if numbered and int(numbered[0].group(1)) == 1:
            expected = 1
            for j, mark in enumerate(numbered):
                if int(mark.group(1)) != expected:
                    break
                stop = numbered[j + 1].start() if j + 1 < len(numbered) else len(obody)
                item = re.sub(r"\s+", " ", obody[mark.end():stop]).strip(" ;()\r\n\t")
                if item:
                    outcomes.append(item)
                expected += 1
        elif obody.strip():
            outcomes = [re.sub(r"\s+", " ", obody).strip()]
    note = " ".join((cloc, oloc)).strip()
    return contents, outcomes, note, combined


def text_anchor(value: str) -> str:
    # Keep a useful course-specific phrase; skip generic section boilerplate.
    clean = re.sub(r"(?i)\b(?:course\s+contents?|learning\s+outcomes?)\b", " ", value)
    tokens = re.findall(r"[a-z0-9]+", clean.casefold())
    tokens = [t for t in tokens if t not in {"at", "the", "end", "of", "this", "course", "students", "should", "be", "able", "to"}]
    for size in (18, 15, 12, 10, 8):
        if len(tokens) >= size:
            return "".join(tokens[:size])
    return ""


def load_parser_module():
    sys.path.insert(0, str(AUDIT))
    path = AUDIT / "repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("ccmas_source_parser", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def get_heading(block: str) -> tuple[int, str, str] | None:
    match = re.search(r"(?m)^###\s+(\d+)\.\s+([^\r\n]+)", block)
    if not match:
        return None
    titleline = match.group(2).strip()
    code_match = re.match(r"^([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b(.*)$", titleline, re.I)
    if not code_match:
        return None
    title = re.sub(r"^(?:\s|[:\-–—])+", "", code_match.group(2)).strip()
    title = re.split(r"\s+---\s+|\s+THIS IS WHAT\b|\s+IT IS LISTED\b|\s+IT IS ACTUALLY\b|\s+ART DIRECTION AND DESIGN IS\b|\s+----\s+THIS IS\b", title, maxsplit=1, flags=re.I)[0].strip()
    return int(match.group(1)), code_match.group(1).strip(), title


def explicit_code_correction(block: str, code: str, title: str) -> str:
    """Read only explicit user correction language; never infer from prose."""
    head = re.search(r"(?m)^###\s+\d+\.\s+([^\r\n]+)", block)
    line = head.group(1) if head else ""
    checks = (
        (r"\bIT\s+IS\s+LISTED\s+AS\s+([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b",),
        (r"\bIT\s+IS\s+ACTUALLY\s+([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b",),
        (r"\bTHIS\s+IS\s+ACTUALLY\s+([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b",),
        (r"\b(?:ACTUAL|ACTUALLY)\s+(?:COURSE\s+)?(?:CODE\s+)?([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b",),
    )
    for (pattern,) in checks:
        found = re.search(pattern, line, re.I)
        if found:
            return re.sub(r"\s+", " ", found.group(1)).strip()
    # The user explicitly says AGE 104 is listed as AGE 124 in the source.
    if norm(code) == "age104" and re.search(r"AGE\s*124", line, re.I):
        return "AGE 124"
    # Some correction notes provide the corrected title and code in parentheses.
    found = re.search(r"\b([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\s*:\s*([^)]+)", line, re.I)
    if found and re.search(r"THIS IS WHAT|ACTUAL|PDF", line, re.I):
        return re.sub(r"\s+", " ", found.group(1)).strip()
    return code


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--out", type=Path, default=AUDIT / "manual_ccmas_pasted_text_reconciliation_2026_10_02.json")
    args = ap.parse_args()
    parser = load_parser_module()
    doc = LOOKUP.read_text(encoding="utf-8").split("## JAMB", 1)[0]
    blocks = [b for b in re.split(r"(?m)(?=^###\s+\d+\.)", doc) if re.match(r"(?m)^###\s+\d+\.", b)]
    docs = {n: json.loads((CCMAS / n).read_text(encoding="utf-8")) for n in set(PDF_TO_JSON.values())}
    results: list[dict[str, Any]] = []
    writes: dict[str, list[tuple[dict[str, Any], dict[str, Any]]]] = {}
    for block in blocks:
        head = get_heading(block)
        if not head:
            continue
        entry, old_code, old_title = head
        pdf_line = re.search(r"(?m)^- Original CCMAS PDF\(s\):\s*(.+)$", block)
        prog_line = re.search(r"(?m)^- Programme\(s\):\s*(.+)$", block)
        if not pdf_line or not prog_line:
            continue
        pdfs = re.findall(r"[^,;]+?\.pdf", pdf_line.group(1), re.I)
        if len(pdfs) != 1:
            results.append({"entry": entry, "status": "multiple_or_missing_source_pdf"})
            continue
        source_file = PDF_TO_JSON.get(Path(pdfs[0].strip()).name)
        if not source_file:
            results.append({"entry": entry, "status": "unknown_source_pdf"})
            continue
        contents, outcomes, note, raw_manual = source_bodies(block)
        missing_match = re.search(r"(?im)^- Missing:\s*(.+)$", block)
        missing_text = missing_match.group(1).casefold() if missing_match else ""
        missing_summary = any(x in missing_text for x in ("course contents", "summary", "content"))
        missing_outcomes = any(x in missing_text for x in ("learning outcomes", "outcome"))
        if not contents and not outcomes:
            disposition = (
                "borrowed_or_optional"
                if re.search(r"borrow|optional course|inherit.*curriculum|use\s+(?:another|from)|somewhere else", note, re.I)
                else "source_absent"
            )
            results.append({"entry": entry, "source_file": source_file, "programme": prog_line.group(1).strip(), "heading_code": old_code, "heading_title": old_title, "status": disposition, "note": note[:600]})
            # A full curriculum may be pasted in the locator field even when
            # the heading course itself has no detail. Continue below to
            # harvest its explicitly identified course blocks.
            if disposition not in {"borrowed_or_optional", "source_absent", "no_manual_detail"}:
                continue

        programme_names = [x.strip() for x in prog_line.group(1).split(",") if x.strip()]
        pasted_updates = []
        for pasted in parser.course_blocks(raw_manual.split("\f")):
            detail = parser.parse_block(pasted)
            pasted_summary = detail.get("content_summary") or ""
            pasted_outcomes = detail.get("learning_outcomes") or []
            if not pasted_summary and not pasted_outcomes:
                continue
            for p in docs[source_file].get("programmes", []):
                pname = norm(p.get("name"))
                if not any(norm(x) in pname or pname in norm(x) for x in programme_names):
                    continue
                matches = [c for c in p.get("courses", []) if norm(c.get("code")) == norm(pasted["code"])]
                if len(matches) > 1:
                    matches.sort(key=lambda c: SequenceMatcher(None, norm(c.get("title")), norm(pasted["title"])).ratio(), reverse=True)
                    if SequenceMatcher(None, norm(matches[0].get("title")), norm(pasted["title"])).ratio() == SequenceMatcher(None, norm(matches[1].get("title")), norm(pasted["title"])).ratio():
                        continue
                    matches = matches[:1]
                if not matches:
                    matches = [c for c in p.get("courses", []) if norm(c.get("title")) == norm(pasted["title"])]
                    if len(matches) != 1:
                        continue
                course = matches[0]
                fields = []
                if course.get("code") != pasted["code"]:
                    course["code"] = pasted["code"]
                    fields.append("code")
                if course.get("title") != pasted["title"]:
                    course["title"] = pasted["title"]
                    fields.append("title")
                if pasted_summary and course.get("content_summary") != pasted_summary:
                    course["content_summary"] = pasted_summary
                    fields.append("content_summary")
                if pasted_outcomes and course.get("skills_learned") != pasted_outcomes:
                    course["skills_learned"] = pasted_outcomes
                    fields.append("skills_learned")
                if fields:
                    pasted_updates.append({"programme": p.get("name"), "code": pasted["code"], "title": pasted["title"], "fields": fields})
                    writes.setdefault(source_file, []).append((p, course))

        # Identity comes from the user's lookup heading or an explicit
        # correction written there. Never infer a different code/title by
        # matching prose against the previous local PDF extraction: the user
        # has specifically identified that cross-check as untrustworthy.
        source_code = explicit_code_correction(block, old_code, old_title)
        source_title = old_title
        match_basis = "manual_heading_and_explicit_correction" if norm(source_code) != norm(old_code) else "manual_heading_identity"
        best_anchor = 0
        selected = []
        for p in docs[source_file].get("programmes", []):
            pname = norm(p.get("name"))
            if not any(norm(x) in pname or pname in norm(x) for x in programme_names):
                continue
            package_courses = p.get("courses", [])
            exact = [c for c in package_courses if norm(c.get("code")) == norm(source_code) and norm(c.get("title")) == norm(source_title)]
            code_matches = [c for c in package_courses if norm(c.get("code")) == norm(source_code)]
            title_matches = [c for c in package_courses if norm(c.get("title")) == norm(source_title)]
            candidates = exact or code_matches or title_matches
            if len(candidates) > 1:
                scored_candidates = sorted(
                    ((SequenceMatcher(None, norm(c.get("title")), norm(source_title)).ratio(), c) for c in candidates),
                    key=lambda item: item[0],
                    reverse=True,
                )
                if len(scored_candidates) > 1 and scored_candidates[0][0] == scored_candidates[1][0]:
                    candidates = []
                else:
                    candidates = [scored_candidates[0][1]]
            for c in candidates:
                selected.append((p, c))
        if not selected:
            results.append({"entry": entry, "source_file": source_file, "programme": prog_line.group(1).strip(), "heading_code": old_code, "heading_title": old_title, "source_code": source_code, "source_title": source_title, "status": "source_identity_has_no_matching_catalogue_row", "match_basis": match_basis, "anchor_length": best_anchor})
            continue
        changes = list(pasted_updates)
        for p, c in selected:
            fields = []
            if match_basis == "manual_heading_and_explicit_correction" and c.get("code") != source_code:
                c["code"] = source_code
                fields.append("code")
            if contents and c.get("content_summary") != contents:
                c["content_summary"] = contents
                fields.append("content_summary")
            if outcomes and c.get("skills_learned") != outcomes:
                c["skills_learned"] = outcomes
                fields.append("skills_learned")
            if missing_summary and not contents and c.get("content_summary"):
                c["content_summary"] = ""
                fields.append("clear_absent_content_summary")
            if missing_outcomes and not outcomes and c.get("skills_learned"):
                c["skills_learned"] = []
                fields.append("clear_absent_learning_outcomes")
            if fields:
                changes.append({"programme": p.get("name"), "code": source_code, "title": source_title, "fields": fields})
                writes.setdefault(source_file, []).append((p, c))
            # If this manual paste identifies a different, explicit CCMAS
            # course identity, remove only an exact duplicate of the pasted
            # detail from the stale heading row. This repairs prior
            # cross-course copy errors without deleting unrelated existing
            # fields or changing the stale row's identity.
            if match_basis == "manual_heading_and_explicit_correction" and norm(source_code) != norm(old_code):
                stale_rows = [
                    old for old in p.get("courses", [])
                    if norm(old.get("code")) == norm(old_code)
                    and norm(old.get("title")) == norm(old_title)
                ]
                for stale in stale_rows:
                    cleared = []
                    if contents and norm(stale.get("content_summary")) == norm(contents):
                        stale["content_summary"] = ""
                        cleared.append("content_summary")
                    old_outcomes = stale.get("skills_learned") or []
                    if outcomes and len(old_outcomes) == len(outcomes) and all(
                        norm(a) == norm(b) for a, b in zip(old_outcomes, outcomes)
                    ):
                        stale["skills_learned"] = []
                        cleared.append("skills_learned")
                    if cleared:
                        changes.append({
                            "programme": p.get("name"),
                            "code": stale.get("code"),
                            "title": stale.get("title"),
                            "fields": cleared,
                            "repair": "clear_exact_manual-detail_duplicate_from_wrong_course_identity",
                        })
                        writes.setdefault(source_file, []).append((p, stale))
        results.append({"entry": entry, "source_file": source_file, "programme": prog_line.group(1).strip(), "heading_code": old_code, "heading_title": old_title, "source_code": source_code, "source_title": source_title, "match_basis": match_basis, "status": "would_update" if changes else "already_matches", "verified_by_manual_text_anchor_length": best_anchor, "fields": {"content_summary": bool(contents), "skills_learned": bool(outcomes)}, "changes": changes})

    if args.apply:
        for source_file in writes:
            (CCMAS / source_file).write_text(json.dumps(docs[source_file], ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for result in results:
        counts[result["status"]] = counts.get(result["status"], 0) + 1
    output = {"schema": "manual-ccmas-pasted-text-reconciliation.v1", "date": date.today().isoformat(), "mode": "apply" if args.apply else "dry_run", "counts": {"entries_processed": len(results), **counts, "course_rows_to_update": sum(len(r.get("changes", [])) for r in results)}, "entries": results}
    out = args.out.with_name(args.out.stem + ("_applied" if args.apply else "_dry_run") + args.out.suffix)
    out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(out), "mode": output["mode"], "counts": output["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
