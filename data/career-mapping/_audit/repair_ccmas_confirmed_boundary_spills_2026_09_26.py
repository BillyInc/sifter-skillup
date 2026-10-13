"""Repair source-confirmed CCMAS boundary spills and one extractor duplicate."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ACCESS_DATE = "2026-09-26"
URLS = {
    "allied_health.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "education.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "veterinary.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}
TARGETS = {
    ("allied_health.json", "Dental Therapy", "DTH 527"): ("Allied Health Sciences", "170–171"),
    ("allied_health.json", "Occupational Therapy", "OCT 525"): ("Allied Health Sciences", "483–484"),
    ("allied_health.json", "Optometry", "OPT 203"): ("Allied Health Sciences", "505–506"),
    ("allied_health.json", "Optometry", "OPT 698"): ("Allied Health Sciences", "540–541"),
    ("allied_health.json", "Prosthetics and Orthotics", "POT 317"): ("Allied Health Sciences", "657–658"),
    ("education.json", "Chemistry", "CHM 107"): ("Education", "210"),
}


def course(document: dict, programme: str, code: str) -> dict:
    package = next(item for item in document["programmes"] if item.get("name") == programme)
    return next(item for item in package["courses"] if item.get("code") == code)


def main() -> None:
    changed = []
    documents = {}
    for filename in {key[0] for key in TARGETS} | {"veterinary.json"}:
        path = ROOT / "ccmas" / filename
        documents[filename] = json.loads(path.read_text(encoding="utf-8"))

    for (filename, programme, code), (label, pages) in TARGETS.items():
        item = course(documents[filename], programme, code)
        pattern = re.compile(rf"{re.escape(label)}\s+\d+\s+New\s*")
        match = pattern.search(item.get("content_summary") or "")
        if match:
            item["content_summary"] = re.sub(r"\s{2,}", " ", (item["content_summary"][: match.start()]).strip())
        elif "removed confirmed boundary spill" not in (item.get("source_locator") or ""):
            raise AssertionError(f"missing expected boundary marker for {filename}:{programme}:{code}")
        if code == "OPT 203":
            item["skills_learned"] = item["skills_learned"][:7]
        elif code == "POT 317":
            item["skills_learned"] = item["skills_learned"][:4]
        elif code == "CHM 107":
            item["skills_learned"] = item["skills_learned"][:7]
        item["source_url"] = URLS[filename]
        item["source_locator"] = f"NUC CCMAS exact course block, printed pp. {pages}; removed confirmed boundary spill after {code}."
        item["source_accessed_on"] = ACCESS_DATE
        changed.append({"source_file": filename, "programme": programme, "code": code, "printed_pages": pages})

    vex = course(documents["veterinary.json"], "Veterinary Medicine", "VEX 599")
    outcomes = vex.get("skills_learned") or []
    if len(outcomes) == 6 and outcomes[:3] == outcomes[3:]:
        vex["skills_learned"] = outcomes[:3]
    elif "removed confirmed extractor duplicate" not in (vex.get("source_locator") or ""):
        raise AssertionError("VEX 599 is not in the expected duplicate state")
    vex["source_url"] = URLS["veterinary.json"]
    vex["source_locator"] = "NUC Veterinary Medicine CCMAS exact VEX 599 course block, printed p. 53; removed confirmed extractor duplicate."
    vex["source_accessed_on"] = ACCESS_DATE
    changed.append({"source_file": "veterinary.json", "programme": "Veterinary Medicine", "code": "VEX 599", "printed_pages": "53"})

    for filename, document in documents.items():
        (ROOT / "ccmas" / filename).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log = ROOT / "_audit" / "ccmas_confirmed_boundary_spill_repair_2026-09-26.json"
    log.write_text(json.dumps({"status": "source_confirmed_narrow_repair", "accessed_on": ACCESS_DATE, "changed": changed}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"changed_count": len(changed), "log": str(log)}, indent=2))


if __name__ == "__main__":
    main()
