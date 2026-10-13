import json
from pathlib import Path


def test_source_pdf_extraction_manifest_is_complete():
    path = Path(__file__).resolve().parent / "ccmas_source_pdf_extraction_manifest_2026-09-29.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["status"] == "five_source_pdfs_extracted_once"
    assert len(data["source_documents"]) == 5
    assert all(item["official_pdf_sha256"] for item in data["source_documents"])
    assert all(item["page_count"] > 0 for item in data["source_documents"])
    assert all(item["extracted_text_sha256"] for item in data["source_documents"])
