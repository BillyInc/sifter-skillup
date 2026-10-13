"""Remove unambiguous CCMAS page-header spill from extracted course content."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ACCESS_DATE = "2026-09-26"

SOURCE_URLS = {
    "allied_health.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "arts.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "education.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
}

# These are the 41 rows where the marker is a page header separating or
# surrounding the course text. Rows with an equipment list or the next course
# after the marker are intentionally excluded until their source boundary is
# separately adjudicated.
TARGETS = {
    "allied_health.json": {
        "Audiology": {"AUD 503", "AUD 509"},
        "Complementary and Alternative Medicine": {"CAM 318"},
        "Dental Technology": {"DNT 506"},
        "Dental Therapy": {"DTH 313"},
        "Information Technology and Health Informatics": {"ITH 208", "ITH 401"},
        "Health Information Management": {"HIM 411"},
        "Medical Laboratory Science": {"MLS 411"},
        "Occupational Therapy": {"OCT 414"},
        "Optometry": {"OPT 303", "OPT 306", "OPT 309", "OPT 316", "OPT 401", "OPT 416", "OPT 519"},
        "Prosthetics and Orthotics": {"POT 413"},
    },
    "arts.json": {
        "African Tradition Religion": {"ATR 401"},
        "Chinese Studies": {"CHS 104", "CHS 107", "CHS 207", "CHS 422"},
        "Christian Religious Studies": {"CRS 103", "FAC 301", "CRS 306"},
        "Christian Theology": {"ENT 211", "CTH 412"},
        "Modern European Languages (Russian)": {"RUS 164", "FAC 202", "RUS 233", "GST 312", "RUS 361", "RUS 302", "RUS 351"},
    },
    "basic_medical.json": {
        "Physiology": {"BIO 107", "PHY 108", "PIO 218", "PIO 399"},
    },
    "education.json": {
        "Business Education": {"BED 312", "BED 322"},
    },
}

# RUS 361 occurs twice in the Russian package. Only the course whose title
# matches the anomaly inventory is in this repair; the other source occurrence
# is left untouched pending duplicate-code adjudication.
TITLE_OVERRIDES = {
    ("arts.json", "Modern European Languages (Russian)", "RUS 361"): "Oral Expression and comprehension in Russian",
}

HEADER_PATTERNS = {
    "allied_health.json": re.compile(r"Allied Health Sciences\s+(\d+)\s+New\s*"),
    "arts.json": re.compile(r"Arts\s+(\d+)\s+New\s*"),
    "basic_medical.json": re.compile(r"Basic Medical Sciences\s+(\d+)\s+New\s*"),
    "education.json": re.compile(r"Education\s+(\d+)\s+New\s*"),
}


def main() -> None:
    changed = []
    for filename, programmes in TARGETS.items():
        path = ROOT / "ccmas" / filename
        document = json.loads(path.read_text(encoding="utf-8"))
        pattern = HEADER_PATTERNS[filename]
        expected_codes = {code for codes in programmes.values() for code in codes}
        seen_codes = set()
        for programme in document.get("programmes", []):
            codes = programmes.get(programme.get("name"), set())
            for course in programme.get("courses", []):
                code = course.get("code")
                if code not in codes:
                    continue
                expected_title = TITLE_OVERRIDES.get((filename, programme.get("name"), code))
                if expected_title and course.get("title") != expected_title:
                    continue
                seen_codes.add(code)
                content = course.get("content_summary") or ""
                matches = list(pattern.finditer(content))
                if len(matches) != 1:
                    if (
                        not matches
                        and course.get("source_url") == SOURCE_URLS[filename]
                        and "removed extracted page header" in (course.get("source_locator") or "")
                    ):
                        changed.append({
                            "source_file": filename,
                            "programme": programme["name"],
                            "code": code,
                            "printed_page": int(re.search(r"(\d+)\s+New", course["source_locator"]).group(1)),
                        })
                        continue
                    raise AssertionError(
                        f"{filename}:{programme['name']}:{code} expected one page header, found {len(matches)}"
                    )
                match = matches[0]
                cleaned = pattern.sub("", content).strip()
                if not cleaned:
                    raise AssertionError(f"{filename}:{programme['name']}:{code} cleaned content is empty")
                course["content_summary"] = re.sub(r"\s{2,}", " ", cleaned)
                course["source_url"] = SOURCE_URLS[filename]
                course["source_locator"] = (
                    f"Exact course content cross-checked against the NUC CCMAS PDF; "
                    f"removed extracted page header {match.group(0).strip()!r} after course {code}."
                )
                course["source_accessed_on"] = ACCESS_DATE
                changed.append({
                    "source_file": filename,
                    "programme": programme["name"],
                    "code": code,
                    "printed_page": int(match.group(1)),
                })
        if seen_codes != expected_codes:
            raise AssertionError(f"{filename} target mismatch: {sorted(expected_codes - seen_codes)}")
        path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    log_path = AUDIT / "ccmas_page_header_spill_repair_2026-09-26.json"
    log_path.write_text(
        json.dumps(
            {
                "date": ACCESS_DATE,
                "status": "narrow_source_backed_repair",
                "changed_count": len(changed),
                "changed": changed,
                "deferred_codes": [
                    "DTH 527",
                    "OCT 525",
                    "OPT 203",
                    "OPT 698",
                    "POT 317",
                    "CHM 107",
                ],
                "source_rule": "Only the unambiguous document page header was removed. Adjacent equipment/next-course spill remains deferred for exact source-boundary review.",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"changed_count": len(changed), "log": str(log_path)}, indent=2))


if __name__ == "__main__":
    main()
