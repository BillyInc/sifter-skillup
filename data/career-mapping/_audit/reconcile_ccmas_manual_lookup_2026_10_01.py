"""Apply manually transcribed CCMAS details after checking the original PDF text.

The lookup document is user-edited; this importer never regenerates or overwrites
it. It only considers the CCMAS section, requires a source-text anchor, and
updates course rows whose programme and identity resolve unambiguously.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT_DIR = ROOT / "_audit"
LOOKUP = ROOT.parents[1] / "docs" / "manual-review" / "CCMAS_BLANK_DETAILS_AND_JAMB_LOOKUP_2026-10-01.md"

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

# Explicit identity corrections written by the user in the lookup. The original
# code/title remains recorded in the report; the target is the source-detail row.
IDENTITY_CORRECTIONS = {
    ("AGE104", "farmtechnology"): ("AGE 124", "Farm Technology"),
    ("AGE399", "practicalfieldyearreport"): ("AGX 399", "Students Industrial Work Experience"),
    ("ARA111", "communicationinenglish"): ("GST 111", "Communication in English"),
    ("ADV315", "powerpersonalinfluenceadvertising"): ("ADV 315", "Sales Promotion and Sponsorship"),
    ("ADV323", "artdirectionanddesign"): ("ADV 314", "Art Direction and Design"),
    ("ADV325", "quantitativethinkinginadvertising"): ("ADV 325", "Power and Influence"),
    ("BCJ406", "broadcastresearch"): ("BCJ 406", "Advanced Techniques in Announcing and Presentation"),
}

FIELD_MARKERS = {
    "summary": "- Exact `Course Contents` text",
    "outcomes": "- Exact `Learning Outcomes` text",
}
PAGE_MARKER = "- Printed/PDF page(s):"


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold())


def clean_manual_payload(block: str, marker: str) -> str:
    start = block.find(marker)
    if start < 0:
        return ""
    start += len(marker)
    end = block.find(PAGE_MARKER, start)
    if end < 0:
        return ""
    value = block[start:end]
    value = re.sub(r"(?m)^\s*>\s?", "", value)
    value = re.sub(r"(?i)^\s*\(\s*paste here\s*\)\s*:?", "", value)
    value = value.strip()
    # The generated lookup wraps an answer in parentheses before its colon.
    value = re.sub(r"\)\s*:\s*$", "", value).strip()
    return value


def source_sections(value: str) -> tuple[str, list[str]]:
    """Extract explicitly labelled contents and numbered outcomes from a paste."""
    value = value.strip()
    contents_match = re.search(r"\bCourse\s+Contents?\b", value, re.I)
    learning_match = re.search(r"\bLearning\s+Outcomes?\b", value, re.I)
    summary = ""
    outcomes: list[str] = []
    if contents_match:
        end = learning_match.start() if learning_match and learning_match.start() > contents_match.end() else len(value)
        summary = value[contents_match.end():end].strip(" \t\r\n:()")
    elif not learning_match:
        summary = value.strip(" \t\r\n:()")
    if learning_match:
        end = contents_match.start() if contents_match and contents_match.start() > learning_match.end() else len(value)
        region = value[learning_match.end():end]
        markers = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.)]\s*", region))
        if markers and int(markers[0].group(1)) == 1:
            expected = 1
            for index, marker in enumerate(markers):
                if int(marker.group(1)) != expected:
                    break
                stop = markers[index + 1].start() if index + 1 < len(markers) else len(region)
                item = re.sub(r"\s+", " ", region[marker.end():stop]).strip(" \t\r\n;()")
                if not item:
                    break
                outcomes.append(item)
                expected += 1
    return re.sub(r"\s+", " ", summary), outcomes


def has_source_anchor(body: str, source: str) -> bool:
    """Require an anchor from actual answer text, never its generated label."""
    tokens = re.findall(r"[a-z0-9]+", body.casefold())
    # Short administrative notes (e.g. a project has no detailed curriculum)
    # are not sufficient evidence to populate a curricular field.
    if len(tokens) < 12:
        return False
    source_text = norm(source)
    # PDF line wraps and punctuation disappear under norm(); test successively
    # shorter anchors to tolerate OCR/transcription differences, while keeping
    # a substantial phrase so generic headings cannot verify a field.
    for size in (24, 20, 16, 12):
        anchor = "".join(tokens[:size])
        if len(anchor) >= 70 and anchor in source_text:
            return True
    return False


def parse_heading(block: str) -> tuple[int, str, str] | None:
    match = re.search(r"(?m)^###\s+(\d+)\.\s+([^\r\n]+)", block)
    if not match:
        return None
    heading = match.group(2).strip()
    # Some headings include a user's correction after the original title.
    # Capture the course identity first; title comments are handled separately.
    course = re.match(r"^([A-Z]{2,10}\s*\d{3,4}[a-z]?)\b(.*)$", heading, re.I)
    if not course:
        return None
    title = course.group(2).strip()
    title = re.sub(r"^(?:[:\-–—]|â€”|â€“)+\s*", "", title).strip()
    title = re.split(r"\s+---\s+|\s+THIS IS WHAT\b|\s+IT IS LISTED\b|\s+IT IS ACTUALLY\b|\s+ART DIRECTION AND DESIGN IS\b", title, maxsplit=1, flags=re.I)[0].strip()
    return int(match.group(1)), course.group(1).strip(), title


def programme_matches(programme: dict[str, Any], manual_programmes: str) -> bool:
    actual = norm(programme.get("name"))
    given = norm(manual_programmes)
    return bool(actual and actual in given)


def course_target(code: str, title: str) -> tuple[str, str]:
    correction = IDENTITY_CORRECTIONS.get((norm(code), norm(title)))
    return correction or (code, title)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--out", type=Path, default=AUDIT_DIR / "manual_ccmas_lookup_reconciliation_2026_10_01.json")
    args = parser.parse_args()

    if not LOOKUP.exists():
        raise FileNotFoundError(LOOKUP)
    doc = LOOKUP.read_text(encoding="utf-8").split("## JAMB", 1)[0]
    manual_blocks = re.split(r"(?m)(?=^###\s+\d+\.)", doc)
    json_docs = {name: json.loads((CCMAS_DIR / name).read_text(encoding="utf-8")) for name in set(PDF_TO_JSON.values())}
    rows: list[dict[str, Any]] = []
    applied_files: set[str] = set()

    for block in manual_blocks:
        parsed = parse_heading(block)
        if not parsed:
            continue
        entry, old_code, old_title = parsed
        pdf_match = re.search(r"(?m)^- Original CCMAS PDF\(s\):\s*(.+)$", block)
        programme_match = re.search(r"(?m)^- Programme\(s\):\s*(.+)$", block)
        if not pdf_match or not programme_match:
            continue
        pdf_names = re.findall(r"[^,;]+?\.pdf", pdf_match.group(1), re.I)
        if len(pdf_names) != 1:
            rows.append({"entry": entry, "old_code": old_code, "old_title": old_title, "status": "multiple_or_missing_source_pdf"})
            continue
        source_file = PDF_TO_JSON.get(Path(pdf_names[0].strip()).name)
        if not source_file:
            rows.append({"entry": entry, "old_code": old_code, "old_title": old_title, "status": "unknown_source_pdf"})
            continue
        source_path = AUDIT_DIR / "ccmas_original_source_text_2026-09-29" / f"{Path(source_file).stem}.txt"
        if not source_path.exists():
            rows.append({"entry": entry, "old_code": old_code, "old_title": old_title, "status": "source_text_missing"})
            continue
        source = source_path.read_text(encoding="utf-8", errors="replace")
        content_payload = clean_manual_payload(block, FIELD_MARKERS["summary"])
        outcomes_payload = clean_manual_payload(block, FIELD_MARKERS["outcomes"])
        content, outcomes = source_sections(content_payload)
        content2, outcomes2 = source_sections(outcomes_payload)
        if not content:
            content = content2
        if not outcomes:
            outcomes = outcomes2
        if not content and not outcomes:
            continue

        anchors = []
        if content:
            anchors.append(("content_summary", content))
        if outcomes:
            anchors.append(("skills_learned", " ".join(outcomes)))
        verified = {field: has_source_anchor(payload, source) for field, payload in anchors}

        target_code, target_title = course_target(old_code, old_title)
        document = json_docs[source_file]
        given_programmes = programme_match.group(1).strip()
        candidates = []
        for programme in document.get("programmes", []):
            if not programme_matches(programme, given_programmes):
                continue
            for course in programme.get("courses", []):
                if norm(course.get("code")) == norm(target_code) and norm(course.get("title")) == norm(target_title):
                    candidates.append((programme, course))
        if not candidates:
            rows.append({"entry": entry, "source_file": source_file, "programme": given_programmes, "old_code": old_code, "old_title": old_title, "target_code": target_code, "target_title": target_title, "status": "course_row_not_unique_or_not_found", "verified_fields": verified})
            continue

        # A lookup entry may consolidate the same course across programmes.
        # Apply only to matches explicitly named in the manual entry.
        changed: list[dict[str, Any]] = []
        for programme, course in candidates:
            fields = []
            if content and verified.get("content_summary") and course.get("content_summary") != content:
                course["content_summary"] = content
                fields.append("content_summary")
            if outcomes and verified.get("skills_learned") and course.get("skills_learned") != outcomes:
                course["skills_learned"] = outcomes
                fields.append("skills_learned")
            if fields:
                changed.append({"programme": programme.get("name"), "code": target_code, "title": target_title, "fields": fields})
        if args.apply and changed:
            applied_files.add(source_file)
        status = "applied" if args.apply and changed else "would_update" if changed else "already_matches_or_unverified"
        rows.append({"entry": entry, "source_file": source_file, "programme": given_programmes, "old_code": old_code, "old_title": old_title, "target_code": target_code, "target_title": target_title, "status": status, "verified_fields": verified, "changed": changed})

    if args.apply:
        for source_file in applied_files:
            path = CCMAS_DIR / source_file
            # The checked-in CCMAS catalogue uses a one-space JSON indent.
            # Preserve that convention to keep the diff limited to data edits.
            path.write_text(json.dumps(json_docs[source_file], ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    counts = {
        "lookup_entries_examined": len(rows),
        "entries_would_update": sum(row["status"] == "would_update" for row in rows),
        "entries_applied": sum(row["status"] == "applied" for row in rows),
        "entries_missing_or_ambiguous": sum(row["status"] == "course_row_not_unique_or_not_found" for row in rows),
        "entries_without_source_verified_fields": sum(row["status"] == "already_matches_or_unverified" for row in rows),
    }
    output = {"schema": "2026-10-01.manual-ccmas-lookup-reconciliation.v1", "generated_on": date.today().isoformat(), "status": "applied" if args.apply else "dry_run", "counts": counts, "rows": rows}
    out = args.out.with_name(args.out.stem + ("_applied" if args.apply else "_dry_run") + args.out.suffix)
    out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(out), "status": output["status"], "counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
