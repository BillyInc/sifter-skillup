"""Verify pending JAMB offering rows against the supplied original PDFs.

Read-only.  A row is a deterministic candidate only when the normalized
programme title and at least one robust parsed institution token occur on the
same original-PDF page.  This does not mutate the inventory or claim that a
parser-generated institution list is fully correct.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
OUT_JSON = AUDIT / "jamb_offering_original_pdf_cell_verification_2026-09-29.json"
OUT_MD = AUDIT / "jamb_offering_original_pdf_cell_verification_2026-09-29.md"

PDF_BY_SOURCE_FILE = {
    "Administration.pdf": "Administration.pdf",
    "agriculture.txt": "Agriculture.pdf",
    "arts_hum.txt": "Arts _ Humanities.pdf",
    "education.txt": "Education.pdf",
    "engineering.txt": "Engineering _ Enviromental _ Technology.pdf",
    "Law.pdf": "Law.pdf",
    "medical.txt": "Medica_Pharmaceutical Health Science.pdf",
    "Sciences.pdf": "Sciences.pdf",
    "Social Management Science.pdf": "Social Management Science.pdf",
}


def normalize(value: Any) -> str:
    value = str(value or "").casefold()
    return re.sub(r"[^a-z0-9]+", "", value)


def robust_tokens(values: list[str]) -> list[str]:
    # Very short/common tokens such as LAW, UNI or AAU produce false matches
    # in brochure prose.  Use tokens that are distinctive enough to support a
    # same-page candidate; the full parsed institution list remains untouched.
    return sorted({normalize(value) for value in values if len(normalize(value)) >= 4 and normalize(value) not in {"university", "college", "federal", "state"}}, key=len, reverse=True)


def main() -> None:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    pdf_pages: dict[str, list[str]] = {}
    pdf_meta: dict[str, dict[str, Any]] = {}
    for source_file, pdf_name in PDF_BY_SOURCE_FILE.items():
        path = BROCHURE_ROOT / pdf_name
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        pdf_pages[source_file] = pages
        pdf_meta[source_file] = {"pdf": str(path), "page_count": len(pages)}

    rows: list[dict[str, Any]] = []
    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            if occurrence.get("offering_row_verified_against_pdf") and occurrence.get("pdf_table_locator"):
                continue
            source_file = occurrence.get("source_file")
            pages = pdf_pages.get(source_file, [])
            title = normalize(occurrence.get("source_jamb_name") or identity.get("jamb_name"))
            institution_tokens = robust_tokens(occurrence.get("institution_tokens_as_parsed") or [])
            title_pages = [index + 1 for index, page in enumerate(pages) if title and title in normalize(page)]
            page_candidates = []
            for page_number in title_pages:
                page_text = normalize(pages[page_number - 1])
                hits = [token for token in institution_tokens if token in page_text]
                if hits:
                    page_candidates.append({
                        "page": page_number,
                        "institution_token_hits": hits[:12],
                        "awarding_institutions_header_present": "awardinginstitutions" in page_text,
                    })
            table_candidates = [item for item in page_candidates if item["awarding_institutions_header_present"]]
            if table_candidates:
                state = "exact_title_and_institution_table_page_candidate"
            elif page_candidates:
                state = "exact_title_and_institution_same_page_candidate"
            elif title_pages:
                state = "title_found_without_distinctive_institution_token"
            else:
                state = "title_not_found_in_original_pdf_text"
            rows.append({
                "occurrence_id": occurrence.get("occurrence_id"),
                "jamb_name": identity.get("jamb_name"),
                "source_jamb_name": occurrence.get("source_jamb_name"),
                "source_file": source_file,
                "original_pdf": pdf_meta.get(source_file, {}).get("pdf"),
                "official_source_url": occurrence.get("official_source_url"),
                "parsed_institution_count": len(occurrence.get("institution_tokens_as_parsed") or []),
                "title_pages": title_pages,
                "same_page_candidates": page_candidates,
                "state": state,
                "current_locator": occurrence.get("pdf_table_locator"),
            })

    counts = Counter(row["state"] for row in rows)
    output = {
        "schema": "2026-09-29.jamb-original-pdf-cell-verification.v1",
        "generated_on": date.today().isoformat(),
        "status": "read_only_original_pdf_cell_candidates_built",
        "source_directory": str(BROCHURE_ROOT),
        "source_pdfs": pdf_meta,
        "pending_rows_scanned": len(rows),
        "counts": dict(sorted(counts.items())),
        "rule": "A same-page title plus distinctive parsed institution token is a deterministic candidate only; it does not silently promote the inventory row.",
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB original-PDF offering-cell verification — 2026-09-29",
        "",
        "Read-only scan of the supplied original JAMB brochure PDFs. It does not mutate the offering inventory.",
        "",
        f"- Pending rows scanned: **{len(rows)}**",
    ]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(counts.items()))
    lines += ["", "A same-page title and institution-token hit is retained as a candidate locator for a guarded repair; it is not treated as a full table-cell proof until the source row is unambiguously identified.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "pending_rows_scanned": len(rows), "counts": dict(sorted(counts.items()))}, indent=2))


if __name__ == "__main__":
    main()
