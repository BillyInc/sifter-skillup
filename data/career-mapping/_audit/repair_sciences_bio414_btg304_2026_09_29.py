"""Repair source-confirmed molecular-biology and genetic-engineering course rows."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "sciences.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf"
ACCESS_DATE = "2026-09-29"
BIO414_SUMMARY = (
    "Covers DNA and RNA structure and roles; gene regulation, DNA replication, genetic transformation and recombinant "
    "DNA; molecular-level biological systems; how nucleic acids and proteins regulate cell division, growth and "
    "development; genome evolution; and molecular-biology applications in food security, plant and animal breeding, "
    "medicine and genetic engineering."
)
BTG304_SUMMARY = (
    "Covers DNA/RNA isolation; genetic-engineering principles and gene cloning; DNA fragmentation, restriction "
    "digestion, sequence enrichment and fragment analysis; joining DNA and cloning vectors; host-cell selection and "
    "transformation methods; clone detection, stability and in-vitro gene manipulation; gene amplification, knockout, "
    "gene targeting, genome editing and CRISPR; genetically modified organisms; production of insulin, antibodies, vaccines "
    "and hormones; genetic diagnosis and gene therapy; transgenic plants and animals; and the Human Genome Project."
)
UPDATES = {
    ("Biology", "BIO 414"): {
        "summary": BIO414_SUMMARY,
        "locator": "NUC Sciences CCMAS 2023, Biology, BIO 414 Molecular Biology, printed pp. 98-99; four outcomes and course contents.",
        "meta": (400, 2, "C", 15, 45),
        "outcomes": 5,
        "remove_duplicate": "summarise the roles of Nucleic acids and proteins in the cell division, growth and development,",
    },
    ("Science Laboratory Technology", "BIO 414"): {
        "summary": BIO414_SUMMARY,
        "locator": "NUC Sciences CCMAS 2023, Science Laboratory Technology, BIO 414 Molecular Biology, printed p. 714; four outcomes and course contents.",
        "meta": (400, 2, "C", 30, None),
        "outcomes": 5,
        "remove_duplicate": "summarise the roles of Nucleic acids and proteins in the cell division, growth and development,",
    },
    ("Biotechnology", "BTG 304"): {
        "summary": BTG304_SUMMARY,
        "locator": "NUC Sciences CCMAS 2023, Biotechnology, BTG 304 Genetic Engineering, printed pp. 121-122; three outcomes and course contents through genome-project prospects/consequences.",
        "meta": (300, 2, "C", 15, 45),
        "outcomes": 3,
        "cutoff": "character",
    },
}


def encode(value: dict, indent: str) -> str:
    lines = json.dumps(value, ensure_ascii=False, indent=1).splitlines()
    return lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])


def package_bounds(text: str, name: str) -> tuple[int, int]:
    marker = f'"name": {json.dumps(name, ensure_ascii=False)}'
    if text.count(marker) != 1:
        raise RuntimeError(f"Expected one CCMAS package {name!r}; refusing ambiguous repair")
    at = text.index(marker)
    start = text.rfind("{", 0, at)
    _, length = json.JSONDecoder().raw_decode(text[start:])
    return start, start + length


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    for (package_name, code), spec in UPDATES.items():
        pstart, pend = package_bounds(text, package_name)
        marker = f'"code": {json.dumps(code)}'
        if text[pstart:pend].count(marker) != 1:
            raise RuntimeError(f"Expected one {package_name}/{code} row; refusing ambiguous repair")
        at = text.index(marker, pstart, pend)
        start = text.rfind("{", pstart, at)
        old, end = json.JSONDecoder().raw_decode(text[start:])
        if (old.get("level"), old.get("units"), old.get("status"), old.get("lh"), old.get("ph")) != spec["meta"]:
            raise RuntimeError(f"{package_name}/{code} metadata differs from audited source")
        outcomes = old.get("skills_learned", [])
        if len(outcomes) != spec["outcomes"]:
            raise RuntimeError(f"{package_name}/{code} outcome count differs from audited baseline")
        if code == "BIO 414":
            duplicate = spec["remove_duplicate"]
            if outcomes[-1] != duplicate or not old.get("content_summary", "").endswith("in allevia"):
                raise RuntimeError(f"{package_name}/{code} duplicate/truncation baseline differs; inspect before repair")
        elif not old.get("content_summary", "").endswith(spec["cutoff"]):
            raise RuntimeError(f"{package_name}/{code} truncation baseline differs; inspect before repair")

        updated = dict(old)
        if code == "BIO 414":
            updated["skills_learned"] = outcomes[:4]
            updated["source_anomaly_note"] = (
                "The NUC course-content text lists 'marriage' among molecular-biology applications. This unusual source term is preserved in the audit evidence and is not reinterpreted in the student-facing summary."
            )
        updated.update(
            {
                "content_summary": spec["summary"],
                "source_url": SOURCE_URL,
                "source_locator": spec["locator"],
                "source_accessed_on": ACCESS_DATE,
            }
        )
        indent_start = text.rfind("\n", 0, start) + 1
        indent = text[indent_start:start]
        replacement = encode(updated, indent)
        text = text[:start] + replacement + text[start + end :]

    parsed = json.loads(text)
    for (package_name, code), spec in UPDATES.items():
        programme = next(row for row in parsed["programmes"] if row["name"] == package_name)
        row = next(row for row in programme["courses"] if row.get("code") == code)
        expected_outcomes = 4 if code == "BIO 414" else 3
        if len(row["skills_learned"]) != expected_outcomes or row["content_summary"] != spec["summary"]:
            raise RuntimeError(f"Post-repair validation failed for {package_name}/{code}")
    TARGET.write_text(text, encoding="utf-8")
    print("Repaired Biology and SLT BIO 414 plus Biotechnology BTG 304; preserved distinct package metadata and source anomaly note.")


if __name__ == "__main__":
    main()
