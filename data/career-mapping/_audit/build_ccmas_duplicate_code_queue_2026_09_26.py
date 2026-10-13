"""Build a non-mutating, catalogue-wide duplicate-code evidence queue."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "ccmas"
AUDIT_DIR = ROOT / "_audit"
ACCESS_DATE = "2026-09-26"

SOURCE_URLS = {
    "administration_management.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "agricultural_science.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "allied_health.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "architecture.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    "arts.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "communication_media.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "computing.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
    "education.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "engineering.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "law.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
    "medicine_dentistry.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "pharmacy.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "veterinary.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}


def main() -> None:
    groups = []
    programmes = 0
    courses = 0
    for source_path in sorted(SOURCE_DIR.glob("*.json")):
        document = json.loads(source_path.read_text(encoding="utf-8"))
        for programme in document.get("programmes", []):
            programmes += 1
            by_code: dict[str, list[dict]] = defaultdict(list)
            for course in programme.get("courses", []):
                courses += 1
                if course.get("code"):
                    by_code[course["code"]].append(course)
            for code, rows in sorted(by_code.items()):
                if len(rows) < 2:
                    continue
                groups.append(
                    {
                        "source_file": source_path.name,
                        "programme": programme.get("name"),
                        "code": code,
                        "status": "candidate_requires_authoritative_source_check",
                        "source": {
                            "url": SOURCE_URLS.get(source_path.name),
                            "locator": "pending exact NUC course-table/content-block adjudication",
                            "accessed_on": ACCESS_DATE,
                        },
                        "row_count": len(rows),
                        "different_title_count": len({row.get("title") for row in rows}),
                        "rows": [
                            {
                                "title": row.get("title"),
                                "units": row.get("units"),
                                "status": row.get("status"),
                                "lh": row.get("lh"),
                                "ph": row.get("ph"),
                                "content_summary_present": bool((row.get("content_summary") or "").strip()),
                                "outcome_count": len(row.get("skills_learned") or []),
                                "content_excerpt": (row.get("content_summary") or "")[:240],
                            }
                            for row in rows
                        ],
                        "repair_instruction": "Compare every row with the exact NUC table and course-content block. Classify as source-authored alias/option, table-versus-content code discrepancy, or extractor/package contamination. Do not merge or delete a row from code similarity alone.",
                    }
                )

    report = {
        "schema_version": 1,
        "checkpoint": "ccmas_duplicate_code_queue_2026-09-26_001",
        "accessed_on": ACCESS_DATE,
        "scope": {"source_files": len(list(SOURCE_DIR.glob("*.json"))), "programme_packages": programmes, "course_records": courses},
        "candidate_counts": {
            "duplicate_code_groups": len(groups),
            "rows_in_duplicate_groups": sum(group["row_count"] for group in groups),
            "groups_with_different_titles": sum(group["different_title_count"] > 1 for group in groups),
        },
        "classification_warning": "Every group is a candidate until its exact NUC source block is checked. Same-code rows may be legitimate source aliases, options or repeated shared courses.",
        "groups": groups,
        "shared_source_json_edited": False,
        "downstream_files_edited": False,
    }
    json_path = AUDIT_DIR / "ccmas_duplicate_code_queue_2026-09-26_001.json"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path = AUDIT_DIR / "ccmas_duplicate_code_queue_checkpoint_2026-09-26_001.md"
    md_path.write_text(
        "\n".join(
            [
                "# CCMAS duplicate-code queue checkpoint — 2026-09-26 (001)",
                "",
                "This is a non-mutating catalogue-wide candidate queue. It covers every duplicate course-code group in the current 237-package/9,854-row source state and does not classify a group as defective without an exact NUC source check.",
                "",
                f"- Source files: {report['scope']['source_files']}",
                f"- Programme packages: {report['scope']['programme_packages']}",
                f"- Course records: {report['scope']['course_records']}",
                f"- Duplicate-code groups: {report['candidate_counts']['duplicate_code_groups']}",
                f"- Rows in duplicate groups: {report['candidate_counts']['rows_in_duplicate_groups']}",
                f"- Groups with different titles: {report['candidate_counts']['groups_with_different_titles']}",
                "",
                "The exact 50 groups, 111 row snapshots, official NUC URLs and pending locators are in `ccmas_duplicate_code_queue_2026-09-26_001.json`. The next pass must resolve each group as source-authored, source-conflicting, or extractor/package contamination and then record the exact printed locator.",
                "",
                "No CCMAS source JSON, JAMB mapping, downstream file or seed was edited.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "scope": report["scope"], "candidate_counts": report["candidate_counts"]}, indent=2))


if __name__ == "__main__":
    main()
