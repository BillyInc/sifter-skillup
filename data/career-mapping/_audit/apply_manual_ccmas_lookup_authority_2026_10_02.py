"""Apply CCMAS details explicitly supplied in the manual lookup document.

The Markdown is authoritative. The source-text parser is used only to split
explicitly pasted whole-curriculum blocks into course-code/title blocks; it is
not used to reject, rewrite, or invent user-provided details.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
LOOKUP = ROOT.parents[1] / "docs" / "manual-review" / "CCMAS_BLANK_DETAILS_AND_JAMB_LOOKUP_2026-10-01.md"
PAGE = "- Printed/PDF page(s):"
CONTENTS = "- Exact `Course Contents` text"
OUTCOMES = "- Exact `Learning Outcomes` text"

PDFS = {
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


def norm(s: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(s or "").casefold())


def canonical_text(value: Any) -> str:
    words = re.findall(r"[a-z0-9]+", str(value or "").casefold())
    if words and words[-1].endswith("s") and len(words[-1]) > 4:
        words[-1] = words[-1][:-1]
    return " ".join(words)


def field_region(block: str, marker: str) -> tuple[str, str]:
    pos = block.find(marker)
    if pos < 0:
        return "", ""
    tail = block[pos + len(marker):]
    next_field = re.search(r"(?m)^- Exact `(?:Course Contents|Learning Outcomes)` text", tail)
    next_heading = re.search(r"(?m)^###\s+\d+\.", tail)
    stop = min([m.start() for m in (next_field, next_heading) if m] or [len(tail)])
    part = tail[:stop]
    page = re.search(r"(?m)^- Printed/PDF page\(s\):", part)
    if page:
        body, locator = part[:page.start()], part[page.end():]
    else:
        body, locator = part, ""
    body = re.sub(r"(?m)^\s*>\s?", "", body).strip()
    locator = re.sub(r"(?m)^\s*>\s?", "", locator).strip()
    body = re.sub(r"(?i)^\s*\(\s*paste here\s*\)\s*:?", "", body).strip()
    return body, locator


def parse_direct_fields(body: str, field_kind: str) -> tuple[str | None, list[str] | None, bool, bool]:
    """Extract only explicitly labelled fields from one lookup slot."""
    text = body.strip()
    absent = bool(re.search(r"(?i)doesn.t exist|does not exist|doesnt exist|no course content|no outcomes?", text))
    if not text or re.fullmatch(r"(?i)(?:paste here|none|n/?a)[.! ]*", text):
        return None, [] if field_kind == "outcomes" and absent else None, False, bool(text)
    c_match = re.search(r"(?i)\bCourse\s+Contents?\b\s*:?", text)
    o_match = re.search(r"(?i)\bLearning\s+Outcomes?\b\s*:?", text)
    summary: str | None = None
    outcomes: list[str] | None = None
    if c_match:
        start = c_match.end()
        end = o_match.start() if o_match and o_match.start() > start else len(text)
        value = text[start:end].strip(" :()\r\n\t")
        value = re.sub(r"\s+", " ", value).strip()
        if value and not re.fullmatch(r"(?i)(?:paste here|doesn.t exist|does not exist|doesnt exist|none|n/?a)[.! ]*", value):
            summary = value
    elif field_kind == "contents" and not absent and not re.fullmatch(r"(?i)\(?\s*paste here\s*\)?[.! ]*", text):
        summary = re.sub(r"\s+", " ", text).strip(" :()\r\n\t")
    if o_match or field_kind == "outcomes":
        start = o_match.end() if o_match else 0
        # Some manually pasted blocks put Course Contents after the outcomes
        # without a separate template field; stop at that section boundary.
        c_after = re.search(r"(?i)\bCourse\s+Contents?\b\s*:?", text[start:])
        end = start + c_after.start() if c_after else len(text)
        value = text[start:end].strip(" :()\r\n\t")
        if re.search(r"(?i)doesn.t exist|does not exist|doesnt exist|no outcomes?", value):
            outcomes = []
        else:
            marks = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.)]\s+", value))
            if marks and marks[0].group(1) == "1":
                parsed = []
                expected = 1
                for i, mark in enumerate(marks):
                    if int(mark.group(1)) != expected:
                        break
                    finish = marks[i + 1].start() if i + 1 < len(marks) else len(value)
                    item = re.sub(r"\s+", " ", value[mark.end():finish]).strip(" ;\r\n\t")
                    item = re.sub(r"(?i)\s*Course\s+Contents?\b.*$", "", item).strip()
                    if item:
                        parsed.append(item)
                    expected += 1
                outcomes = parsed
    return summary, outcomes, bool(c_match), bool(o_match)


def get_heading(block: str) -> tuple[int, str, str] | None:
    m = re.search(r"(?m)^###\s+(\d+)\.\s+([^\r\n]+)", block)
    if not m:
        return None
    titleline = m.group(2).strip()
    compound = re.match(r"^((?:[A-Z]{2,10}\s*\d{3,4}[A-Z]?\s*/\s*)+[A-Z]{2,10}\s*\d{3,4}[A-Z]?)\s*[\-–—\ufffd:]\s*(.*)$", titleline, re.I)
    if compound:
        return int(m.group(1)), compound.group(1).strip(), re.sub(r"^[^\w]+", "", compound.group(2)).strip()
    cm = re.match(r"^([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b\s*(.*)$", titleline, re.I)
    if not cm:
        # Several lookup entries are course titles without a printed code
        # (notably optional Law offerings). Their title can still be matched
        # exactly inside the user-named CCMAS programme.
        title = re.split(r"\s+---\s+", titleline, maxsplit=1)[-1]
        title = re.split(r"\s*[\ufffd–—]\s*", title, maxsplit=1)[-1]
        title = re.sub(r"^[^\w]+", "", title).strip()
        return (int(m.group(1)), "", title) if title else None
    title = re.split(r"\s+---\s+|\s+THIS IS WHAT\b|\s+IT IS LISTED\b|\s+IT IS ACTUALLY\b|\s+THIS IS ACTUALLY\b", cm.group(2), maxsplit=1, flags=re.I)[0].strip()
    code = cm.group(1).strip()
    correction = re.search(r"(?i)\b(?:IT\s+IS\s+(?:LISTED\s+AS|ACTUALLY)|THIS\s+IS\s+ACTUALLY)\s+([A-Z]{2,10}\s*\d{3,4}[A-Z]?)\b", titleline)
    if correction:
        code = correction.group(1).strip()
        if re.search(r"(?i)\b(?:IT\s+IS\s+ACTUALLY|THIS\s+IS\s+ACTUALLY)\s+" + re.escape(correction.group(1)), titleline):
            corrected_title = re.search(r"(?i)\b(?:IT\s+IS\s+ACTUALLY|THIS\s+IS\s+ACTUALLY)\s+[A-Z]{2,10}\s*\d{3,4}[A-Z]?\s*[-–—:]\s*(.+)$", titleline)
            if corrected_title:
                title = corrected_title.group(1).strip()
    title = re.sub(r"^[^\w]+", "", title).strip()
    return int(m.group(1)), code, title


def normalized_program(value: str) -> str:
    value = re.sub(r"(?i)[\s\-–—\ufffd]*P\d+(?:\s*,\s*P\d+)*", "", value.strip())
    return norm(value)


def resolve_programmes(all_programmes: list[dict[str, Any]], raw: str) -> list[dict[str, Any]]:
    # Prefer a whole-string identity match first (programme names can contain
    # commas, and P12/P13/P14 are CCMAS programme-type labels, not names).
    target = normalized_program(raw)
    whole = [p for p in all_programmes if normalized_program(str(p.get("name", ""))) == target]
    if whole:
        return whole
    normalized = re.sub(r"(?i)[\s\-–—\ufffd]*P\d+(?:\s*,\s*P\d+)*", "", raw)
    parts = [x.strip() for x in re.split(r"\s*,\s*(?=[A-Z][A-Za-z &()/'-]+(?:,|$))", normalized) if x.strip()]
    resolved = []
    for part in parts:
        key = normalized_program(part)
        hits = [p for p in all_programmes if normalized_program(str(p.get("name", ""))) == key]
        if not hits:
            # Permit a user-supplied fuller label, but never the reverse
            # substring match that makes P12 select every package.
            hits = [p for p in all_programmes if key and key in normalized_program(str(p.get("name", "")))]
        resolved.extend(hits)
    return list({id(p): p for p in resolved}.values())


def resolve_course(package: dict[str, Any], code: str, title: str) -> tuple[dict[str, Any] | None, str]:
    from difflib import SequenceMatcher
    courses = package.get("courses", [])
    by_code = [c for c in courses if norm(c.get("code")) == norm(code)]
    by_title = [c for c in courses if norm(c.get("title")) == norm(title)]
    if len(by_title) == 1 and (not code or not by_code or by_title[0] not in by_code):
        return by_title[0], "manual_title_code_conflict" if code and by_code else "manual_title_match"
    if len(by_code) == 1:
        return by_code[0], "heading_code"
    if len(by_code) > 1:
        exact = [c for c in by_code if norm(c.get("title")) == norm(title)]
        if len(exact) == 1:
            return exact[0], "code_and_title"
    if len(by_title) == 1:
        return by_title[0], "manual_title_corrects_catalogue_code"
    if len(by_title) > 1:
        return None, "duplicate_manual_title"
    title_key = norm(title)
    prefix_hits = [c for c in courses if norm(c.get("title")) and title_key.startswith(norm(c.get("title"))) and len(norm(c.get("title"))) >= 0.65 * len(title_key)]
    if len(prefix_hits) == 1:
        return prefix_hits[0], "manual_title_completes_catalogue_title"
    ranked = sorted(((SequenceMatcher(None, norm(c.get("title")), title_key).ratio(), c) for c in courses), key=lambda x: x[0], reverse=True)
    if ranked and ranked[0][0] >= 0.93 and (len(ranked) == 1 or ranked[0][0] > ranked[1][0]):
        return ranked[0][1], "unique_strong_manual_title_match"
    return None, "no_unique_code_or_title_match"


def parser_module():
    sys.path.insert(0, str(AUDIT))
    path = AUDIT / "repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("manual_ccmas_text_block_parser", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--out", type=Path, default=AUDIT / "manual_ccmas_authority_reconciliation_2026_10_02.json")
    args = ap.parse_args()
    parser = parser_module()
    doc = LOOKUP.read_text(encoding="utf-8").split("## JAMB", 1)[0]
    blocks = [b for b in re.split(r"(?m)(?=^###\s+\d+\.)", doc) if re.match(r"(?m)^###\s+\d+\.", b)]
    filenames = sorted(set(PDFS.values()))
    data = {f: json.loads((CCMAS / f).read_text(encoding="utf-8")) for f in filenames}
    changes: dict[str, set[tuple[str, str, str]]] = {}
    results = []

    # Whole-programme curriculum blocks pasted into one lookup entry may
    # explicitly supply a course that also has its own blank lookup row. Those
    # course-specific pasted blocks outrank the blank disposition, regardless
    # of entry order; record them before applying any per-entry clears.
    supplemental_course_fields: dict[tuple[str, str, str], set[str]] = {}
    for source_block in blocks:
        source_pdf = re.search(r"(?m)^- Original CCMAS PDF\(s\):\s*(.+)$", source_block)
        source_prog = re.search(r"(?m)^- Programme\(s\):\s*(.+)$", source_block)
        if not source_pdf or not source_prog:
            continue
        source_pdf_names = re.findall(r"[^,;]+?\.pdf", source_pdf.group(1), re.I)
        source_file = PDFS.get(Path(source_pdf_names[0].strip()).name) if len(source_pdf_names) == 1 else None
        if not source_file:
            continue
        packages = resolve_programmes(data[source_file].get("programmes", []), source_prog.group(1))
        if not packages:
            continue
        source_cb, source_cl = field_region(source_block, CONTENTS)
        source_ob, source_ol = field_region(source_block, OUTCOMES)
        pasted_raw = "\n".join([source_cb, source_cl, source_ob, source_ol])
        for pasted_course in parser.course_blocks(pasted_raw.split("\f")):
            parsed = parser.parse_block(pasted_course)
            supplied = set()
            if parsed.get("content_summary"):
                supplied.add("content_summary")
            if parsed.get("learning_outcomes"):
                supplied.add("skills_learned")
            if not supplied:
                continue
            for package in packages:
                candidates = [c for c in package.get("courses", []) if norm(c.get("code")) == norm(pasted_course["code"])]
                if len(candidates) > 1:
                    candidates = [c for c in candidates if norm(c.get("title")) == norm(pasted_course["title"])]
                if len(candidates) == 1:
                    key = (source_file, norm(package.get("name")), norm(candidates[0].get("code")))
                    supplemental_course_fields.setdefault(key, set()).update(supplied)

    for block in blocks:
        heading = get_heading(block)
        pdf = re.search(r"(?m)^- Original CCMAS PDF\(s\):\s*(.+)$", block)
        prog = re.search(r"(?m)^- Programme\(s\):\s*(.+)$", block)
        if not heading:
            continue
        entry, code, title = heading
        if entry == 242:
            # The manually corrected heading includes both the general Law
            # package title and the related Common-and-Islamic-Law wording.
            # The user explicitly scoped this entry to the Law package, where
            # "Introduction to Islamic Law" is the unique catalogue identity.
            code, title = "", "Introduction to Islamic Law"
        if entry == 6:
            # This manually supplied section lost the standard programme/PDF
            # metadata, but explicitly labels the target course in its body.
            marker = re.search(r"(?i)THIS\s+IS\s+325\s*\(\s*ADV\s*325\s*:\s*Power\s+and\s+Influence\s*\)", block)
            if marker:
                tail = block[marker.end():]
                cm = re.search(r"(?i)\bCourse\s+Contents\b\s*:?", tail)
                om = re.search(r"(?i)\bLearning\s+Outcomes\b\s*:?", tail)
                course_contents = parse_direct_fields(tail[cm.start():] if cm else "", "contents")[0]
                course_outcomes = parse_direct_fields(tail[om.start():cm.start()] if om and cm else "", "outcomes")[1]
                ad_package = resolve_programmes(data["communication_media.json"].get("programmes", []), "ADVERTISING")
                ad_rows = [c for p in ad_package for c in p.get("courses", []) if norm(c.get("code")) == "adv325"]
                fields = []
                if len(ad_rows) == 1:
                    target = ad_rows[0]
                    if course_contents and target.get("content_summary") != course_contents:
                        target["content_summary"] = course_contents
                        fields.append("content_summary")
                    if course_outcomes is not None and target.get("skills_learned") != course_outcomes:
                        target["skills_learned"] = course_outcomes
                        fields.append("skills_learned")
                    if fields:
                        changes.setdefault("communication_media.json", set()).add((ad_package[0].get("name", ""), "ADV 325", "Power and Influence"))
                    results.append({"entry": entry, "source_file": "communication_media.json", "programme": ad_package[0].get("name") if ad_package else "ADVERTISING", "heading_code": "ADV 325", "heading_title": "Power and Influence", "status": "would_update" if fields else "no_change_or_intentional_blank", "fields": fields, "identity_note": "Resolved from the explicit course identity in the user-pasted section; omitted template metadata was not guessed."})
                else:
                    results.append({"entry": entry, "status": "manual_course_identity_not_unique", "heading_code": "ADV 325", "heading_title": "Power and Influence"})
            else:
                results.append({"entry": entry, "status": "manual_course_identity_not_found"})
            continue
        if not pdf or not prog:
            results.append({"entry": entry, "heading_code": code, "heading_title": title, "status": "missing_lookup_metadata"})
            continue
        pdf_names = re.findall(r"[^,;]+?\.pdf", pdf.group(1), re.I)
        source = PDFS.get(Path(pdf_names[0].strip()).name) if len(pdf_names) == 1 else None
        if not source:
            results.append({"entry": entry, "status": "unresolved_pdf_identity"})
            continue
        package_matches = resolve_programmes(data[source].get("programmes", []), prog.group(1))
        if not package_matches:
            results.append({"entry": entry, "source_file": source, "programme": prog.group(1), "status": "programme_package_not_resolved"})
            continue
        cb, cl = field_region(block, CONTENTS)
        ob, ol = field_region(block, OUTCOMES)
        summary, _, has_summary_label, _ = parse_direct_fields(cb, "contents")
        _, outcomes, _, has_outcome_label = parse_direct_fields(ob, "outcomes")
        # Some manual entries place the pasted Learning Outcomes immediately
        # after the page/locator line, inside the same Course Contents field.
        # Parse only when that section is explicitly present: a locator saying
        # "DOESNT EXIST" for Course Contents must never clear outcomes too.
        embedded_text = "\n".join([cb, cl])
        if re.search(r"(?i)\bLearning\s+Outcomes?\b", embedded_text):
            _, embedded_outcomes, _, _ = parse_direct_fields(embedded_text, "outcomes")
        else:
            embedded_outcomes = None
        if embedded_outcomes is not None:
            outcomes = embedded_outcomes
            has_outcome_label = True
        has_summary_label = CONTENTS in block
        has_outcome_label = OUTCOMES in block or embedded_outcomes is not None
        explicit_absence = bool(re.search(r"(?i)doesn.t exist|does not exist|doesnt exist|no course content|no outcomes?", " ".join([cb, cl, ob, ol])))
        missing_line = re.search(r"(?im)^- Missing:\s*(.+)$", block)
        declared_missing = missing_line.group(1).casefold() if missing_line else ""
        applied_fields: list[str] = []
        whole_block_changes: list[dict[str, Any]] = []
        resolved_packages = []
        identity_note = None
        for package in package_matches:
            # The manually supplied lookup contains two rows with code DCS 302:
            # entry 89 names Health Communication and provides its full
            # contents/outcomes; entry 94 names ICT for Development and says
            # its contents do not exist. The catalogue's DCS 202 Health
            # Communication row and DCS 302 ICT for Development row establish
            # the distinct identities; an earlier broad importer duplicated
            # the Health Communication fields/title onto DCS 302. Resolve by
            # the two explicit user-supplied titles, repair that duplicated
            # identity, and preserve DCS 302's ICT outcomes.
            if entry == 89 and norm(code) == "dcs302" and norm(title) == norm("Health Communication"):
                course = next((c for c in package.get("courses", []) if norm(c.get("code")) == "dcs202" and norm(c.get("title")) == norm("Health Communication")), None)
                identity_method = "manual_title_resolves_duplicate_code_to_dcs202"
                if course is not None:
                    identity_note = "The lookup repeats DCS 302 for two different titles. Health Communication maps to the package's DCS 202 Health Communication row; DCS 302 is reserved for ICT for Development by the separate manual entry 94."
            elif entry == 94 and norm(code) == "dcs302" and norm(title) == norm("ICT for Development"):
                course = next((c for c in package.get("courses", []) if norm(c.get("code")) == "dcs302"), None)
                identity_method = "manual_title_restores_dcs302_identity"
            else:
                course, identity_method = resolve_course(package, code, title)
            if course is None:
                continue
            # Lookup row 203's pasted computing syllabus exactly matches the
            # separately named GET 211 Computing and Software Engineering
            # course, not GST 211 Entrepreneurship and Innovation. Do not
            # attach it to the GST heading; its prior accidental duplicate is
            # reversed from the pre-import record below.
            if entry == 203 and norm(code) == "gst211":
                resolved_packages.append(package.get("name"))
                identity_note = "Pasted computing/software detail is not written to GST 211; it corresponds to the separate GET 211 Computing and Software Engineering record, which already contains the matching details."
                continue
            if identity_method in {"manual_title_corrects_catalogue_code", "manual_title_completes_catalogue_title", "unique_strong_manual_title_match", "manual_title_code_conflict", "manual_title_restores_dcs302_identity"}:
                collision = [c for c in package.get("courses", []) if code and c is not course and norm(c.get("code")) == norm(code)]
                if collision and identity_method not in {"manual_title_code_conflict", "manual_title_restores_dcs302_identity"}:
                    continue
                if code and not collision and identity_method != "manual_title_restores_dcs302_identity":
                    course["code"] = code
                    applied_fields.append("code_corrected_from_manual_entry")
                if norm(course.get("title")) != norm(title):
                    course["title"] = title
                    applied_fields.append("title_corrected_from_manual_entry")
            elif norm(course.get("title")) != norm(title) and not (explicit_absence and summary is None and outcomes in (None, [])):
                course["title"] = title
                applied_fields.append("title_corrected_from_manual_entry")
            resolved_packages.append(package.get("name"))
            # Only fields explicitly labelled/pasted in the lookup are changed.
            if has_summary_label and summary is not None and "content_summary" not in supplemental_fields and course.get("content_summary") != summary:
                old_summary = course.get("content_summary")
                if old_summary and canonical_text(old_summary) == canonical_text(summary):
                    if len(summary) > len(old_summary):
                        course["content_summary"] = summary
                        applied_fields.append("content_summary")
                else:
                    course["content_summary"] = summary
                    applied_fields.append("content_summary")
            # The user confirmed that a blank lookup slot is an intentional
            # statement that the source has no such field. Use the entry's
            # Missing declaration plus its empty/manual-absence slot; do not
            # retain stale extracted text merely because the template slot is
            # blank rather than literally saying "does not exist".
            course_key = (source, norm(package.get("name")), norm(course.get("code")))
            supplemental_fields = supplemental_course_fields.get(course_key, set())
            explicit_no_summary = has_summary_label and summary is None and "content_summary" not in supplemental_fields and (
                bool(re.search(r"(?i)doesn.t exist|does not exist|doesnt exist|no course content", " ".join([cb, cl])))
                or "course contents" in declared_missing or "summary" in declared_missing
            )
            if explicit_no_summary and course.get("content_summary"):
                course["content_summary"] = None
                applied_fields.append("content_summary_cleared_as_absent")
            explicit_no_outcomes = has_outcome_label and outcomes is None and "skills_learned" not in supplemental_fields and (
                bool(re.search(r"(?i)doesn.t exist|does not exist|doesnt exist|no outcomes?", " ".join([ob, ol])))
                or "learning outcome" in declared_missing or "outcome" in declared_missing
            )
            if has_outcome_label and outcomes is not None and "skills_learned" not in supplemental_fields and course.get("skills_learned") != outcomes:
                course["skills_learned"] = outcomes
                applied_fields.append("skills_learned")
            elif explicit_no_outcomes and course.get("skills_learned"):
                course["skills_learned"] = []
                applied_fields.append("skills_learned_cleared_as_absent")

        # Parse complete course blocks pasted in any of the supplied slots.
        # Each block must resolve by exact code in a programme named by the user.
        raw = "\n".join([cb, cl, ob, ol])
        for pasted in parser.course_blocks(raw.split("\f")):
            details = parser.parse_block(pasted)
            ps = details.get("content_summary")
            po = details.get("learning_outcomes") or []
            if not ps and not po:
                continue
            for package in package_matches:
                candidates = [c for c in package.get("courses", []) if norm(c.get("code")) == norm(pasted["code"])]
                if len(candidates) > 1:
                    candidates = [c for c in candidates if norm(c.get("title")) == norm(pasted["title"])]
                if len(candidates) != 1:
                    continue
                target = candidates[0]
                changed = []
                if ps and target.get("content_summary") != ps:
                    old_summary = target.get("content_summary")
                    if old_summary and canonical_text(old_summary) == canonical_text(ps):
                        if len(ps) > len(old_summary):
                            target["content_summary"] = ps
                            changed.append("content_summary")
                    else:
                        target["content_summary"] = ps
                        changed.append("content_summary")
                if po and target.get("skills_learned") != po:
                    target["skills_learned"] = po
                    changed.append("skills_learned")
                if changed:
                    whole_block_changes.append({"programme": package.get("name"), "code": pasted["code"], "title": pasted["title"], "fields": changed})
                    changes.setdefault(source, set()).add((package.get("name", ""), pasted["code"], pasted["title"]))
        if applied_fields or whole_block_changes:
            for package in package_matches:
                if any(
                    (bool(code) and norm(candidate.get("code")) == norm(code))
                    or (not code and norm(candidate.get("title")) == norm(title))
                    for candidate in package.get("courses", [])
                ):
                    changes.setdefault(source, set()).add((package.get("name", ""), code or title, title))
        status = "would_update" if applied_fields or whole_block_changes else "identity_mismatch_safely_excluded" if entry == 203 and identity_note else "manual_identity_resolved_no_change" if identity_note else "heading_course_not_unique_in_package" if not resolved_packages and (summary or outcomes) else "intentional_optional_or_source_absent" if not code and explicit_absence else "no_change_or_intentional_blank"
        results.append({"entry": entry, "source_file": source, "programme": prog.group(1), "resolved_programmes": resolved_packages, "heading_code": code, "heading_title": title, "status": status, "identity_note": identity_note, "fields": sorted(set(applied_fields)), "whole_curriculum_course_blocks": whole_block_changes})

    restored_misassignment = None
    if args.apply:
        # Undo the earlier broad PDF-driven importer’s known identity error:
        # lookup entry 203 is headed GST 211 Entrepreneurship, but its pasted
        # computing/software text duplicates the existing GET 211 record.
        # The previous importer explicitly logged that it wrote those fields
        # to GST 211. Restore just those two fields from the pre-import Git
        # version; leave every other field in the dirty worktree intact.
        rel = "data/career-mapping/ccmas/engineering.json"
        try:
            baseline_text = subprocess.check_output(["git", "show", f"HEAD:{rel}"], cwd=ROOT.parents[1], text=True, encoding="utf-8")
            baseline = json.loads(baseline_text)
            current_doc = data["engineering.json"]
            def find_course(document: dict[str, Any]) -> dict[str, Any] | None:
                for program in document.get("programmes", []):
                    if norm(program.get("name")) == norm("COMPUTER ENGINEERING"):
                        return next((c for c in program.get("courses", []) if norm(c.get("code")) == "gst211" and norm(c.get("title")) == norm("Entrepreneurship and Innovation")), None)
                return None
            old_row, live_row = find_course(baseline), find_course(current_doc)
            if old_row is not None and live_row is not None:
                for field in ("content_summary", "skills_learned"):
                    live_row[field] = old_row.get(field)
                changes.setdefault("engineering.json", set()).add(("COMPUTER ENGINEERING", "GST 211", "Entrepreneurship and Innovation"))
                restored_misassignment = {"lookup_entry": 203, "target": "COMPUTER ENGINEERING / GST 211 / Entrepreneurship and Innovation", "fields_restored": ["content_summary", "skills_learned"], "reason": "The same pasted computing/software detail already belongs to the distinct GET 211 Computing and Software Engineering record; this exact GST 211 field pair was overwritten by the earlier importer and is restored from its pre-import state."}
        except (subprocess.CalledProcessError, OSError, json.JSONDecodeError):
            restored_misassignment = {"lookup_entry": 203, "status": "not_restored", "reason": "Could not retrieve a baseline version for the narrowly scoped reversal."}
        for f in changes:
            (CCMAS / f).write_text(json.dumps(data[f], ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for row in results:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    report = {"schema": "manual-ccmas-authority-reconciliation.v1", "mode": "apply" if args.apply else "dry_run", "lookup_entries": len(blocks), "counts": counts, "corrective_rollback_of_known_prior_misassignment": restored_misassignment, "entries": results}
    out = args.out.with_name(args.out.stem + ("_applied" if args.apply else "_dry_run") + args.out.suffix)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(out), "mode": report["mode"], "lookup_entries": len(blocks), "counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
