"""Audit a bounded CCMAS package slice without mutating source data."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
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
PAGE_HEADER = re.compile(r"(?:Allied Health Sciences|Computing|Social Sciences|Administration|Education|Agriculture|Arts|Engineering|Sciences|Veterinary Medicine)\s+\d{2,4}\s+New", re.I)
TITLE_BOUNDARY = re.compile(r"(?i)(?:\band\b|\bof\b|\bfor\b|\bin\b|\bto\b|\bthe\b|\bwith\b|\bon\b|\bfrom\b|[:;,/]$)$")


def package_list():
    packages = []
    for source_path in sorted(SOURCE_DIR.glob("*.json")):
        document = json.loads(source_path.read_text(encoding="utf-8"))
        for programme in document.get("programmes", []):
            packages.append((source_path.name, programme))
    return packages


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, required=True)
    parser.add_argument("--end", type=int, required=True)
    args = parser.parse_args()
    all_packages = package_list()
    if args.start < 1 or args.end < args.start or args.end - args.start + 1 > 20 or args.end > len(all_packages):
        raise SystemExit("Use a valid inclusive range of at most 20 packages within the 237-package catalogue")

    selected = all_packages[args.start - 1 : args.end]
    package_reports = []
    totals = Counter()
    for source_file, programme in selected:
        courses = programme.get("courses", [])
        code_groups = defaultdict(list)
        anomalies = []
        for course in courses:
            code = course.get("code")
            if code:
                code_groups[code].append(course)
            content = course.get("content_summary") or ""
            outcomes = course.get("skills_learned") or []
            if not content.strip() or content.strip() in {"---", "-", "–"}:
                anomalies.append({"class": "empty_content_summary", "code": code, "title": course.get("title"), "status": "candidate"})
                totals["empty_content_summary"] += 1
            repeated = [text for text, count in Counter(outcomes).items() if count > 1]
            if repeated:
                anomalies.append({"class": "duplicate_outcome", "code": code, "title": course.get("title"), "repeated_outcomes": repeated, "status": "candidate"})
                totals["duplicate_outcome"] += 1
            if PAGE_HEADER.search(content):
                anomalies.append({"class": "page_header_spill", "code": code, "title": course.get("title"), "status": "candidate"})
                totals["page_header_spill"] += 1
            if "\ufffd" in content or any("\ufffd" in outcome for outcome in outcomes):
                anomalies.append({"class": "replacement_character", "code": code, "title": course.get("title"), "status": "candidate"})
                totals["replacement_character"] += 1
            title = course.get("title") or ""
            if TITLE_BOUNDARY.search(title):
                anomalies.append({"class": "title_boundary_candidate", "code": code, "title": title, "status": "candidate"})
                totals["title_boundary_candidate"] += 1
        for code, rows in sorted(code_groups.items()):
            if len(rows) > 1:
                anomalies.append({"class": "duplicate_code_group", "code": code, "titles": [row.get("title") for row in rows], "status": "candidate"})
                totals["duplicate_code_group"] += 1
        package_reports.append({
            "package_index": all_packages.index((source_file, programme)) + 1,
            "source_file": source_file,
            "programme": programme.get("name"),
            "course_count": len(courses),
            "source": {"url": SOURCE_URLS[source_file], "locator": "exact printed page pending source adjudication for this bounded slice", "accessed_on": ACCESS_DATE},
            "anomalies": anomalies,
            "status": "bounded_structural_audit_candidate_review",
        })
    report = {
        "schema_version": 1,
        "checkpoint": f"ccmas_bounded_catalogue_audit_{args.start:03d}_{args.end:03d}_2026-09-26_001",
        "accessed_on": ACCESS_DATE,
        "range": {"start_package": args.start, "end_package": args.end, "package_count": len(selected), "max_increment": 20},
        "catalogue_scope": {"source_files": 17, "programme_packages": len(all_packages), "course_records_total": 9854},
        "package_course_records": sum(item["course_count"] for item in package_reports),
        "candidate_counts": dict(totals),
        "packages": package_reports,
        "classification_warning": "These are bounded structural candidates, not confirmed defects. Exact NUC source locators must be added during source adjudication; no student or downstream decision follows from this file.",
        "shared_source_json_edited": False,
        "downstream_files_edited": False,
    }
    stem = f"ccmas_bounded_catalogue_audit_{args.start:03d}_{args.end:03d}_2026-09-26_001"
    json_path = AUDIT_DIR / f"{stem}.json"
    md_path = AUDIT_DIR / f"{stem}.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(
        "\n".join([
            f"# CCMAS bounded catalogue audit — packages {args.start:03d}–{args.end:03d}",
            "",
            f"This increment covers exactly {len(selected)} packages and {report['package_course_records']} course rows. It is a structural candidate pass only; source adjudication and exact printed locators are required before any repair.",
            "",
            f"- Range: packages {args.start}–{args.end} of {len(all_packages)}",
            f"- Course rows in increment: {report['package_course_records']}",
            f"- Candidate counts: {dict(totals)}",
            f"- Machine-readable ledger: `{json_path.as_posix()}`",
            "",
            "No shared CCMAS source JSON, JAMB mapping, downstream taxonomy or seed was edited.",
            "",
        ]), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "range": report["range"], "course_rows": report["package_course_records"], "candidate_counts": dict(totals)}, indent=2))


if __name__ == "__main__":
    main()
