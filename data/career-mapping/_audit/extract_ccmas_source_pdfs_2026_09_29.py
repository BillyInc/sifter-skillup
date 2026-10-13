"""Extract the five retrieved CCMAS PDFs once for deterministic source indexing.

The output is a page-delimited text corpus and a checksum manifest. It is used
only to generate locators/candidates; it does not certify that a mapping or a
course record is correct.
"""

from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path
from typing import Any

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
PDF_DIR = AUDIT / "ccmas_source_pdfs_2026-09-29"
TEXT_DIR = AUDIT / "ccmas_source_text_2026-09-29"
OUT_JSON = AUDIT / "ccmas_source_pdf_extraction_manifest_2026-09-29.json"
OUT_MD = AUDIT / "ccmas_source_pdf_extraction_manifest_2026-09-29.md"

SOURCE_FILES = {
    "administration_management.json": "administration_management.pdf",
    "agricultural_science.json": "agricultural_science.pdf",
    "law.json": "law.pdf",
    "medicine_dentistry.json": "medicine_dentistry.pdf",
    "social_sciences.json": "social_sciences.pdf",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    TEXT_DIR.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, Any]] = []
    for source_file, pdf_name in SOURCE_FILES.items():
        pdf_path = PDF_DIR / pdf_name
        if not pdf_path.exists():
            raise FileNotFoundError(f"Missing retrieved source PDF: {pdf_path}")
        reader = PdfReader(str(pdf_path))
        pages = [(page.extract_text() or "").replace("\x00", "") for page in reader.pages]
        text = "\f".join(pages) + "\f"
        text_name = pdf_path.with_suffix(".txt").name
        text_path = TEXT_DIR / text_name
        text_path.write_text(text, encoding="utf-8")
        rows.append(
            {
                "source_file": source_file,
                "official_pdf": str(pdf_path.relative_to(ROOT)),
                "official_pdf_sha256": sha256(pdf_path),
                "official_pdf_bytes": pdf_path.stat().st_size,
                "page_count": len(pages),
                "nonempty_pages": sum(bool(page.strip()) for page in pages),
                "extracted_text_file": str(text_path.relative_to(ROOT)),
                "extracted_text_sha256": sha256(text_path),
                "extracted_text_bytes": text_path.stat().st_size,
                "extraction_state": "extracted_for_candidate_source_indexing",
            }
        )

    manifest = {
        "schema": "2026-09-29.ccmas-source-pdf-extraction-manifest.v1",
        "generated_on": date.today().isoformat(),
        "status": "five_source_pdfs_extracted_once",
        "source_documents": rows,
        "limits": [
            "PDF text extraction creates search locators only; it is not source adjudication.",
            "Page ordinals are extracted physical-page positions, not printed-page citations.",
            "A code/title hit still requires context checks for the exact programme and table row.",
        ],
    }
    OUT_JSON.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# CCMAS source PDF extraction manifest — 2026-09-29",
        "",
        "Five previously missing official source PDFs were downloaded, checksummed, and extracted once for deterministic candidate indexing.",
        "This is not source adjudication.",
        "",
    ]
    for row in rows:
        lines += [
            f"## `{row['source_file']}`",
            "",
            f"- PDF: `{row['official_pdf']}`",
            f"- PDF SHA-256: `{row['official_pdf_sha256']}`",
            f"- Pages: {row['page_count']}; non-empty extracted pages: {row['nonempty_pages']}",
            f"- Text corpus: `{row['extracted_text_file']}`",
            "",
        ]
    lines += ["## Limits", ""] + [f"- {item}" for item in manifest["limits"]] + [""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "sources": len(rows)}, indent=2))


if __name__ == "__main__":
    main()
