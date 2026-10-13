"""Add the verified standalone Social Sciences Actuarial Science occurrence."""

from __future__ import annotations

import json
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[1] / "jamb" / "social_management_offerings.json"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"
INSTITUTIONS = ["ABU", "BENIN", "CUST", "DOU", "FED-DUTSE", "LASUSTECH", "LAPAI", "PC-UNI", "SALEM"]


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    programmes = payload["programmes"]
    matches = [row for row in programmes if row.get("jamb_name") == "Actuarial Science"]
    if matches:
        raise SystemExit("Social Sciences Actuarial Science occurrence already exists; refusing duplicate")
    accounting_indexes = [i for i, row in enumerate(programmes) if row.get("jamb_name") == "Accounting and Finance"]
    if len(accounting_indexes) != 1:
        raise SystemExit("Expected one Social Sciences Accounting and Finance row as insertion anchor")

    row = {
        "jamb_name": "Actuarial Science",
        "institutions": INSTITUTIONS,
        "utme_subjects": None,
        "olevel_requirement": None,
        "direct_entry": None,
        "institution_waivers": [],
        "note": (
            "Distinct standalone Social Sciences Actuarial Science source occurrence. Only its exact title-awarder "
            "cell is confirmed here; adjacent requirement text is not copied because the extracted table does not "
            "establish that it belongs to this row. Keep separate from Administration standalone Actuarial Science "
            "and Administration Insurance and Actuarial Science."
        ),
        "source_verification": {
            "verified_against_pdf": True,
            "official_source_url": URL,
            "pdf_table_locator": (
                "Social Sciences degree brochure, printed p. 580, extracted official brochure text "
                "data/career-mapping/_jamb_txt/Social Management Science.txt lines 283-289: exact ACTUARIAL SCIENCE "
                "heading and complete awarding-institutions cell; next programme title FINANCE begins at line 294."
            ),
            "verified_institution_codes": INSTITUTIONS,
            "verification_date": "2026-09-28",
            "note": (
                "The standalone Social Sciences title and nine-code awarder list match the official brochure text. "
                "This is a separate faculty/source occurrence from both Administration Actuarial Science rows."
            ),
        },
    }
    programmes.insert(accounting_indexes[0] + 1, row)
    SOURCE.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Added the distinct Social Sciences Actuarial Science occurrence; no requirements or curriculum mappings were inferred.")


if __name__ == "__main__":
    main()
