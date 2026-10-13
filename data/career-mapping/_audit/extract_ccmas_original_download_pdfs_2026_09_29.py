"""Extract the original CCMAS PDFs from the user's Downloads folder once.

This is a read-only source-ingestion step. It writes a separate, checksummed
text corpus for deterministic course-detail comparison and never edits the
canonical CCMAS or JAMB data files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import date
from pathlib import Path
from typing import Any

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = Path.home() / "Downloads" / "ccmas original documents"
DEFAULT_TEXT_DIR = ROOT / "_audit" / "ccmas_original_source_text_2026-09-29"
DEFAULT_MANIFEST = ROOT / "_audit" / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"

SOURCE_FILES = {
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


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--text-dir", type=Path, default=DEFAULT_TEXT_DIR)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    args = parser.parse_args()
    args.text_dir.mkdir(parents=True, exist_ok=True)

    rows: list[dict[str, Any]] = []
    for source_file, pdf_name in SOURCE_FILES.items():
        pdf_path = args.source_dir / pdf_name
        if not pdf_path.exists():
            raise FileNotFoundError(f"Missing original CCMAS PDF: {pdf_path}")
        reader = PdfReader(str(pdf_path))
        pages = [(page.extract_text() or "").replace("\x00", "") for page in reader.pages]
        text_path = args.text_dir / f"{Path(source_file).stem}.txt"
        text_path.write_text("\f".join(pages) + "\f", encoding="utf-8")
        rows.append(
            {
                "source_file": source_file,
                "original_pdf": str(pdf_path),
                "original_pdf_sha256": sha256(pdf_path),
                "original_pdf_bytes": pdf_path.stat().st_size,
                "page_count": len(pages),
                "nonempty_pages": sum(bool(page.strip()) for page in pages),
                "extracted_text_file": str(text_path.relative_to(ROOT)),
                "extracted_text_sha256": sha256(text_path),
                "extracted_text_bytes": text_path.stat().st_size,
            }
        )

    manifest = {
        "schema": "2026-09-29.ccmas-original-download-pdf-extraction.v1",
        "generated_on": date.today().isoformat(),
        "status": "17_original_source_pdfs_extracted_once",
        "source_directory": str(args.source_dir),
        "source_documents": rows,
        "limits": [
            "This extraction is used to accelerate deterministic source comparison; it does not by itself prove a course-to-programme match.",
            "Printed page references and table boundaries still require bounded context checks.",
        ],
    }
    args.manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manifest": str(args.manifest), "documents": len(rows), "pages": sum(row["page_count"] for row in rows)}, indent=2))


if __name__ == "__main__":
    main()
