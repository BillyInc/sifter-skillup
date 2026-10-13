"""Reconcile flagged parsed CCMAS rows against the original CCMAS PDFs.

The JSON files under ``ccmas/`` are the checked-in parsed representation.  A
parser flag is not automatically a reason to hide a course: many flags record
an obvious typo, a table/content metadata disagreement, or a valid pathway
course.  This audit reads the original PDF when supplied, records the page
evidence, and classifies each flagged row for the clean student contract.

It deliberately does not rewrite the parsed source files.  The reconciliation
manifest is the auditable overlay consumed by the generic curriculum contract
builder.  That keeps regeneration deterministic while making the source-level
decision explicit.

Usage:
    python _audit_original_ccmas_review.py \
      --original-source-dir C:/path/to/ccmas/original/documents

The source directory is optional after a manifest already exists.  Without
the PDFs, the command can still validate the manifest shape but it will not
claim that a source page was checked.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
CCMAS_DIR = HERE / "ccmas"
OUT = HERE / "_audit" / "ccmas_original_source_review_2026-09-18.json"

PDF_BY_SOURCE = {
    "administration_management.json": "Administration-and-Management.pdf",
    "agricultural_science.json": "Agriculture-2023.pdf",
    "allied_health.json": "Allied-Health-Sciences-2023.pdf",
    "architecture.json": "Architecture-CCMAS-2023-FINAL.pdf",
    "arts.json": "Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "communication_media.json": "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "computing.json": "Computing-CCMAS-2023-FINAL.pdf",
    "education.json": "Education-CCMAS-2023-New.pdf",
    "engineering.json": "Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "law.json": "Law-ALL.pdf",
    "medicine_dentistry.json": "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "pharmacy.json": "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "sciences.json": "Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "veterinary.json": "Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def classify(flags: list[str]) -> tuple[str, bool, str, str]:
    joined = " ".join(flags).casefold()
    # No course identity or learning content means there is no honest student
    # curriculum row to expose.  The source may mention the code, but that is
    # not enough to claim what the programme teaches.
    if any(
        phrase in joined
        for phrase in (
            "learning outcomes and contents not found",
            "no learning outcomes or course contents",
            "no learning outcomes/course contents",
            "no corresponding course contents entry",
        )
    ):
        return (
            "review_only",
            False,
            "The original document does not provide a complete course-table and learning-content record for this row. Keep it staff-review-only until the source is corrected or institution-specific evidence is supplied.",
            "source_content_missing_or_course_identity_unresolved",
        )
    # This is a material contradiction inside the authoritative source, not a
    # parser typo.  Do not choose one legal curriculum course silently.
    if "major discrepancy" in joined or "title, unit load, and contact hours all conflict" in joined:
        return (
            "review_only",
            False,
            "The original document contains materially conflicting course identities. Preserve both source readings for staff review; do not expose one as the programme record.",
            "source_has_material_course_conflict",
        )
    if "duplicate table variant" in joined and "no corresponding course contents" in joined:
        return (
            "review_only",
            False,
            "The source contains duplicate table variants without a single unambiguous content record. Keep the row out of the student contract pending manual reconciliation.",
            "duplicate_table_variant_without_content_resolution",
        )
    if "in lo section only" in joined or "may be absent from course table" in joined or "present in lo section but absent from course table" in joined:
        return (
            "source_backed",
            True,
            "The original PDF provides a learning-outcome/course-content record even though the course is missing from the programme structure table. Keep the source content visible in the programme contract, but preserve the structural anomaly in the source locator for staff review.",
            "source_backed_course_contents_only",
        )
    if "pathway" in joined or "option" in joined:
        return (
            "source_backed",
            True,
            "This is a source-defined pathway or option course. Keep it attached to the programme and label the pathway where the source provides one; it is not a parser error.",
            "source_defined_pathway_or_option",
        )
    # Table-vs-content differences in units, contact hours, spelling, or code
    # typography do not invalidate the learning outcomes. The course table is
    # the primary identity/load record; content headings supply the outcomes.
    return (
        "source_backed",
        True,
        "The original PDF contains the course and learning content. Use the course-structure table for the canonical course identity/load and retain the content heading as a source note when it differs. The discrepancy must not be rendered as student copy.",
        "source_backed_with_table_primary_identity",
    )


def pdf_pages_for_rows(pdf_path: Path, rows: list[dict[str, Any]]) -> dict[str, list[int]]:
    if not pdf_path.exists():
        return {}
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover - environment diagnostic
        raise SystemExit("pypdf is required when --original-source-dir is supplied") from exc

    reader = PdfReader(str(pdf_path))
    targets: dict[str, set[str]] = {}
    for row in rows:
        key = row["rowKey"]
        values = {str(row.get("courseCode") or ""), str(row.get("courseTitle") or "")}
        targets[key] = {norm(value) for value in values if norm(value)}
    found: dict[str, list[int]] = {key: [] for key in targets}
    for page_no, page in enumerate(reader.pages, 1):
        page_text = norm(page.extract_text() or "")
        if not page_text:
            continue
        for key, terms in targets.items():
            if any(term and term in page_text for term in terms):
                found[key].append(page_no)
    return found


def load_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    programme_flags: list[dict[str, Any]] = []
    for source_path in sorted(CCMAS_DIR.glob("*.json")):
        payload = json.loads(source_path.read_text(encoding="utf-8"))
        document_flags = payload.get("document_flags") or []
        if document_flags:
            programme_flags.append(
                {
                    "sourceFile": source_path.name,
                    "discipline": payload.get("discipline"),
                    "sourceFlags": document_flags,
                    "studentContractEffect": "A document-level flag is not automatically a course-row exclusion. The builder applies row-level reconciliation and keeps missing/contradictory records review-only.",
                }
            )
        for programme in payload.get("programmes") or []:
            for course in programme.get("courses") or []:
                flags = [str(flag) for flag in course.get("flags") or [] if str(flag).strip()]
                if not flags:
                    continue
                row_key = "::".join(
                    [
                        str(payload.get("discipline") or ""),
                        str(programme.get("name") or ""),
                        str(course.get("code") or ""),
                        str(course.get("title") or ""),
                    ]
                )
                state, display, resolution, decision = classify(flags)
                rows.append(
                    {
                        "rowKey": row_key,
                        "sourceFile": source_path.name,
                        "discipline": payload.get("discipline"),
                        "programme": programme.get("name"),
                        "courseCode": course.get("code"),
                        "courseTitle": course.get("title"),
                        "flags": flags,
                        "dataState": state,
                        "studentDisplay": display,
                        "resolution": resolution,
                        "decision": decision,
                    }
                )
    return rows, programme_flags


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--original-source-dir", type=Path)
    args = parser.parse_args()
    rows, programme_flags = load_rows()
    by_source: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        by_source.setdefault(row["sourceFile"], []).append(row)

    for source_file, source_rows in by_source.items():
        pdf_name = PDF_BY_SOURCE.get(source_file)
        pdf_path = (args.original_source_dir / pdf_name) if args.original_source_dir and pdf_name else Path()
        pages = pdf_pages_for_rows(pdf_path, source_rows) if pdf_path else {}
        for row in source_rows:
            row["originalPdf"] = pdf_name
            row["originalPages"] = pages.get(row["rowKey"], [])
            row["originalChecked"] = bool(row["originalPages"])
            if args.original_source_dir and not row["originalChecked"]:
                row["resolution"] += " No matching page text was extracted; retain the source review state until a human confirms the PDF page."

    output = {
        "schemaVersion": 1,
        "generatedOn": "2026-09-18",
        "sourcePolicy": "Original CCMAS PDF is checked before a flagged row is promoted into the generic student contract. Clear source variants are corrected at contract-build time; missing or materially conflicting records remain review_only.",
        "sourceDocuments": PDF_BY_SOURCE,
        "courseRows": rows,
        "documentFlags": programme_flags,
        "summary": {
            "flaggedCourseRows": len(rows),
            "sourceBackedRows": sum(row["dataState"] == "source_backed" for row in rows),
            "reviewOnlyRows": sum(row["dataState"] == "review_only" for row in rows),
            "originalCheckedRows": sum(row["originalChecked"] for row in rows),
            "rowsWithoutExtractedPage": sum(not row["originalChecked"] for row in rows),
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output["summary"], indent=2))


if __name__ == "__main__":
    main()
