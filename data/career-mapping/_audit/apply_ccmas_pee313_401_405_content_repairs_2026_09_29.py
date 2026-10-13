"""Restore three confirmed Petroleum Engineering course-content omissions."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"
REPAIRS = {
    "PEE 313": {
        "expected_title": "Applied Geophysics and Petroleum Exploration",
        "expected_summary": "The scope of geophysics. Solid earth geophysics. The shape of the earth. Geomagnetism. Marine geophysics; Isostacy. Geophysical instruments. Field data processing: electrical, seismic, radiometric, etc. Elastic theory. Waves and Ray path. Wave propagation. Seismic refraction principles and techniques including data acquisition. Seismic reflection principles and techniques - 2D, 3D, 4D (Time Lapse)",
        "content_summary": (
            "Geophysics of the solid earth, Earth's shape, geomagnetism, marine geophysics and isostasy; "
            "geophysical instruments and electrical, seismic and radiometric field-data processing; elastic "
            "theory, wave paths and propagation; seismic refraction and reflection methods, including data "
            "acquisition and 2D, 3D and 4D time-lapse surveys; borehole geophysical logging, prospecting "
            "and petroleum exploration."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Petroleum Engineering global course table printed p. 1086 and PEE 313 detailed course block printed p. 1108; title, 2 units, C status, 30 LH and all three learning outcomes match. Restored the omitted ending on borehole geophysical logging, prospecting and exploration.",
    },
    "PEE 401": {
        "expected_title": "Entrepreneurship and Startup/Oil and Gas Business Project",
        "expected_summary": "Oil and Gas Entrepreneurship and Start-up / Oil and Gas Business Project",
        "content_summary": (
            "Nigerian and global business environments, doing business in Africa, engineering and AfCFTA; "
            "entrepreneurship and technopreneurship, start-up steps, Nigerian-content opportunities, business "
            "registration, funding and growth; joint ventures and public-private partnerships; business "
            "development, promotion and marketing, personnel and client management, proposals and plans; "
            "oil-and-gas venture profiles, commercialization and digitization (including fintech and technology "
            "hubs), financial management and sustainability; team projects in well testing, reservoir management, "
            "mud logging, core analysis, PVT analysis, environmental laboratories and pipelines, with guest presentations."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Petroleum Engineering global course table printed p. 1086 and PEE 401 detailed course block printed pp. 1110–1111; 2 units, E status, 30 LH and all four learning outcomes match. Replaced the title-only local summary with the detailed syllabus topics.",
    },
    "PEE 405": {
        "expected_title": "Introduction to Well Logging and Interpretation",
        "expected_summary": "Principles and operation of gamma ray. Self-potential caliper. Resistivity (micro and focused), density neutron, sonic, cement bond and variable density, dip-meter and production well logging tools. Interpretation of well log and their cross-plotting techniques. Determination of formation properties such as porosity, hydrocarbon saturation, lithology, zone thickness, shaliness, etc. Guidelines for",
        "content_summary": (
            "Principles and operation of gamma-ray, self-potential, caliper, resistivity, density-neutron, sonic, "
            "cement-bond, variable-density, dip-meter and production-well logging tools; log interpretation and "
            "cross-plots; formation evaluation of porosity, hydrocarbon saturation, lithology, zone thickness and "
            "shale content; selecting suitable logs for field conditions; computer-aided analysis using PETREL; "
            "and recent advances in logging and interpretation."
        ),
        "locator": "NUC Engineering and Technology CCMAS 2023, Petroleum Engineering global course table printed p. 1086 and PEE 405 detailed course block printed pp. 1110–1111; table title, 2 units, C status, 30 LH and all eight learning outcomes match. Restored the truncated ending on field-specific log selection, PETREL analysis and recent advances.",
    },
}


def course_spans(text: str) -> dict[str, tuple[int, int]]:
    decoder = json.JSONDecoder()
    found: dict[str, tuple[int, int]] = {}
    marker = '"courses"'
    pos = 0
    while True:
        key_at = text.find(marker, pos)
        if key_at < 0:
            break
        colon = text.find(":", key_at + len(marker))
        start = text.find("[", colon + 1)
        if start < 0:
            break
        end = decoder.raw_decode(text, start)[1]
        cursor = start + 1
        while cursor < end:
            while cursor < end and text[cursor] in " \t\r\n,":
                cursor += 1
            if cursor >= end or text[cursor] == "]":
                break
            obj, obj_end = decoder.raw_decode(text, cursor)
            if isinstance(obj, dict) and obj.get("code") in REPAIRS:
                code = obj["code"]
                if code in found:
                    # Same code can legitimately occur in another programme; retain all occurrences
                    # only when they have the expected Petroleum Engineering course title.
                    if obj.get("title") != REPAIRS[code]["expected_title"]:
                        pos = end
                        break
                    raise ValueError(f"Duplicate target course occurrence: {code}")
                if obj.get("title") == REPAIRS[code]["expected_title"]:
                    found[code] = (cursor, obj_end)
            cursor = obj_end
        pos = end
    return found


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    spans = course_spans(text)
    if set(spans) != set(REPAIRS):
        raise RuntimeError(f"Target course inventory mismatch: found {sorted(spans)}")

    updated = text
    for code, (start, end) in sorted(spans.items(), key=lambda row: row[1][0], reverse=True):
        old = json.loads(updated[start:end])
        expected = REPAIRS[code]
        if old.get("title") != expected["expected_title"]:
            raise RuntimeError(f"{code}: source-checked title changed; refusing repair")
        if old.get("content_summary") == expected["content_summary"]:
            if old.get("source_url") != SOURCE_URL or old.get("source_accessed_on") != "2026-09-29":
                raise RuntimeError(f"{code}: summary already repaired but provenance differs; inspect manually")
            continue
        if old.get("content_summary") != expected["expected_summary"]:
            raise RuntimeError(f"{code}: current summary differs from the audited pre-repair value")

        new = dict(old)
        new.update(
            {
                "content_summary": expected["content_summary"],
                "source_url": SOURCE_URL,
                "source_locator": expected["locator"],
                "source_accessed_on": "2026-09-29",
            }
        )
        indent_start = updated.rfind("\n", 0, start) + 1
        indent = updated[indent_start:start]
        rendered = json.dumps(new, ensure_ascii=False, indent=1).splitlines()
        replacement = rendered[0] + "\n" + "\n".join(indent + line for line in rendered[1:])
        updated = updated[:start] + replacement + updated[end:]

    check = json.loads(updated)
    matches = {
        row["code"]: row
        for programme in check["programmes"]
        for row in programme["courses"]
        if row.get("code") in REPAIRS and row.get("title") == REPAIRS[row["code"]]["expected_title"]
    }
    for code, expected in REPAIRS.items():
        row = matches[code]
        assert row["content_summary"] == expected["content_summary"]
        assert row["source_url"] == SOURCE_URL
        assert row["source_locator"] == expected["locator"]
        assert row["source_accessed_on"] == "2026-09-29"
    TARGET.write_text(updated, encoding="utf-8")
    print("Restored source-confirmed content for PEE 313, PEE 401 and PEE 405; outcomes and course metadata were preserved.")


if __name__ == "__main__":
    main()
