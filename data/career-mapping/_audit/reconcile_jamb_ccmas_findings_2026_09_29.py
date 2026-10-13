"""Apply three source-audited local reconciliations from lane checkpoints."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Callable


ROOT = Path(__file__).resolve().parents[1]
CCMAS = ROOT / "ccmas" / "allied_health.json"
SCIENCES = ROOT / "jamb" / "sciences_offerings.json"
ENGINEERING = ROOT / "jamb" / "engineering_offerings.json"
INVENTORY = ROOT / "_audit" / "jamb_offering_context_inventory_2026-09-25.json"
ACCESS_DATE = "2026-09-29"
NUC_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
JAMB_SCIENCES_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
JAMB_ENGINEERING_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"

PST322_SUMMARY = (
    "Covers heat physics and superficial heating, conduction, convection and radiation; contact thermotherapy using "
    "water, hot packs and paraffin wax; infrared and ultraviolet radiation; ultrasound production and therapeutic "
    "use; and laser principles, components, classification, effects, indications, contraindications and documentation."
)
PST322_LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, DPT Physiotherapy global structure printed p. 587 and PST 322 detailed "
    "block printed p. 611; 300 level, 2 units, C status, LH 30; PH is a dash. Six outcomes checked."
)
POLYMER_LOCATOR = (
    "JAMB IBASS Engineering/Environmental/Technology brochure, printed p. 368; exact POLYMER AND TEXTILE ENGINEERING "
    "title-awarder row. Adjacent programme rows are separately titled."
)
POLYMER_NOTE = (
    "The exact source row names FUTO and UNIZIK only. OAUSTECH, LASU, FUTA, FED-DUTSINMA, BOUEDST, BENIN and EUI "
    "belong to separately titled adjacent programme rows; their labels/tokens were parser spill."
)


def _mutate_single_object(path: Path, marker: str, expected_identity: Callable[[dict], bool], mutate: Callable[[dict], None]) -> None:
    text = path.read_text(encoding="utf-8")
    if text.count(marker) != 1:
        raise RuntimeError(f"Expected one target marker in {path.name}: {marker}")
    marker_at = text.index(marker)
    object_start = text.rfind("{", 0, marker_at)
    old, object_end = json.JSONDecoder().raw_decode(text[object_start:])
    if not expected_identity(old):
        raise RuntimeError(f"Target identity changed in {path.name}; refusing edit")
    updated = dict(old)
    mutate(updated)
    line_start = text.rfind("\n", 0, object_start) + 1
    indent = text[line_start:object_start]
    encoded = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
    replacement = encoded[0] + "\n" + "\n".join(indent + line for line in encoded[1:])
    path.write_text(text[:object_start] + replacement + text[object_start + object_end :], encoding="utf-8")


def repair_pst322() -> None:
    marker = '"code": "PST 322"'

    def update(row: dict) -> None:
        if row.get("ph") is not None:
            raise RuntimeError("PST 322 PH is not the audited source-dash state")
        if row.get("units") == 2 and row.get("lh") == 30 and row.get("content_summary") == PST322_SUMMARY:
            if row.get("source_url") != NUC_URL:
                raise RuntimeError("PST 322 is repaired with unexpected provenance")
            return
        if row.get("units") is not None or row.get("lh") is not None:
            raise RuntimeError("PST 322 units/LH differ from audited pre-repair values")
        if len(row.get("skills_learned", [])) != 6:
            raise RuntimeError("PST 322 outcome count changed; refusing edit")
        row.update(
            {
                "title": "Electrotherapy II: Thermal & Radiation Agents in Physiotherapy",
                "units": 2,
                "lh": 30,
                "content_summary": PST322_SUMMARY,
                "source_url": NUC_URL,
                "source_locator": PST322_LOCATOR,
                "source_accessed_on": ACCESS_DATE,
            }
        )

    _mutate_single_object(
        CCMAS,
        marker,
        lambda row: row.get("code") == "PST 322" and row.get("level") == 300,
        update,
    )


def repair_biochemistry_locator() -> None:
    marker = '"jamb_name": "BIOCHEMISTRY AND MOLECULAR BIOLOGY"'

    def update(row: dict) -> None:
        if row.get("institutions") != ["DOU", "HENSARD", "ZAMFARA"]:
            raise RuntimeError("Biochemistry awarders differ from the source-audited values")
        # Checkpoint 026 resolves both coordinates: this repository stores
        # splitlines() offsets (419-423); the equivalent LF-only lines are 411-416.
        row["source_locator"] = "Sciences.txt:419-423 (exact programme cell and awarding-institution block)"
        row["source_url"] = JAMB_SCIENCES_URL
        row["source_accessed_on"] = ACCESS_DATE
        row["source_context_status"] = "source_text_confirmed"

    _mutate_single_object(
        SCIENCES,
        marker,
        lambda row: row.get("jamb_name", "").upper() == "BIOCHEMISTRY AND MOLECULAR BIOLOGY",
        update,
    )


def repair_cs_it_source_evidence() -> None:
    marker = '"jamb_name": "Computer Science and Information Technology"'
    locator = (
        "IBASS Sciences brochure, printed pp. 623-624; exact COMPUTER SCIENCE AND INFORMATION TECHNOLOGY heading "
        "and awarder block, including continuation through IGBINEDION and OAUSTECH before the next programme heading."
    )
    support = (
        "The official JAMB cell lists ACHIEVERS, BABCOCK, IGBINEDION and OAUSTECH. The next distinct heading, "
        "Computer Science and Information Science, lists BINGHAM and LCITY; those awarders are not merged here."
    )

    def update(row: dict) -> None:
        if row.get("institutions") != ["ACHIEVERS", "BABCOCK", "IGBINEDION", "OAUSTECH"]:
            raise RuntimeError("Computer Science and Information Technology awarders differ from audited source")
        row["source_context_status"] = "source_text_confirmed"
        row.pop("evidence_hold_reason", None)
        row["source_url"] = JAMB_SCIENCES_URL
        row["source_locator"] = locator
        row["source_accessed_on"] = ACCESS_DATE
        row["source_support_note"] = support

    _mutate_single_object(
        SCIENCES,
        marker,
        lambda row: row.get("jamb_name") == "Computer Science and Information Technology",
        update,
    )

    inventory_data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    identity = next(row for row in inventory_data["identities"] if row["canonical_order"] == 142)
    occurrence = next(row for row in identity["source_offerings"] if row["occurrence_id"] == "b557b8634a50a52e")
    occurrence.update(
        {
            "institution_codes_verified_from_pdf": ["ACHIEVERS", "BABCOCK", "IGBINEDION", "OAUSTECH"],
            "offering_row_verified_against_pdf": True,
            "pdf_table_locator": locator,
            "official_source_url": JAMB_SCIENCES_URL,
            "verification_date": ACCESS_DATE,
            "verification_note": support,
        }
    )
    INVENTORY.write_text(json.dumps(inventory_data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def repair_polymer_awarders() -> None:
    marker = '"jamb_name": "Polymer and Textile Engineering"'

    def update(row: dict) -> None:
        if row.get("institutions") == ["FUTO", "UNIZIK"]:
            verification = row.get("source_verification", {})
            if verification.get("verified_against_pdf") is True:
                return
        elif not any(token in row.get("institutions", []) for token in ("POLYMER ENGINEERING", "CHEMICAL AND")):
            raise RuntimeError("Polymer occurrence differs from the audited parser-spill state")
        row["institutions"] = ["FUTO", "UNIZIK"]
        row["source_context_status"] = "source_text_confirmed"
        row["source_verification"] = {
            "verified_against_pdf": True,
            "evidence_hold": False,
            "official_source_url": JAMB_ENGINEERING_URL,
            "pdf_table_locator": POLYMER_LOCATOR,
            "verification_date": ACCESS_DATE,
            "access_date": ACCESS_DATE,
            "disposition": "confirmed_exact_source_cell_and_corrected_awarders",
            "disposition_reason": POLYMER_NOTE,
            "checkpoint": "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_018",
            "note": "Awarders corrected from the exact JAMB source row. UTME, O'Level and Direct Entry fields were not changed.",
        }

    _mutate_single_object(
        ENGINEERING,
        marker,
        lambda row: row.get("jamb_name") == "Polymer and Textile Engineering",
        update,
    )

    inventory_data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    identity = next(row for row in inventory_data["identities"] if row["canonical_order"] == 311)
    occurrence = next(row for row in identity["source_offerings"] if row["occurrence_id"] == "be319f684b95a753")
    occurrence.update(
        {
            "institution_codes_verified_from_pdf": ["FUTO", "UNIZIK"],
            "offering_row_verified_against_pdf": True,
            "pdf_table_locator": POLYMER_LOCATOR,
            "official_source_url": JAMB_ENGINEERING_URL,
            "verification_date": ACCESS_DATE,
            "verification_note": POLYMER_NOTE,
        }
    )
    INVENTORY.write_text(json.dumps(inventory_data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    repair_pst322()
    repair_biochemistry_locator()
    repair_cs_it_source_evidence()
    repair_polymer_awarders()
    print("Reconciled PST 322, Computer Science and Information Technology evidence, and Polymer/Textile awarders; retained the Biochemistry locator.")


if __name__ == "__main__":
    main()
