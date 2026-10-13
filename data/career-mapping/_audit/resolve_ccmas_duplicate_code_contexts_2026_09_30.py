"""Resolve duplicate CCMAS rows to source programme/option contexts.

Moves only records whose owner is proven by the checked-in, hash-verified
extraction of the original CCMAS PDFs. Every moved row is pinned to the latest
duplicate-review preimage so later detail repairs cannot be overwritten.
Different courses that legitimately reuse a code remain intact and are
reported with their source context rather than deleted.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
SOURCE_REVIEW = AUDIT / "ccmas_duplicate_code_source_review_checkpoint_2026-09-30_008.json"
OUTPUT_PREFIX = "ccmas_duplicate_code_context_resolution_checkpoint_2026-09-30_"

ALLIED_PDF = "allied_health.json"

# source_row_hash values come from source-review checkpoint 008 and cover the
# identity, workload, summary and outcomes. This protects any later local edits.
TRANSFERS: list[dict[str, Any]] = [
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Audiology", "code": "PHA 201", "title": "General Pharmacology", "units": 1, "row_hash": "c85245e2578e25f8d838316740fadb52d57e71c808025480faf74103aa469cd0", "pdf_pages": [34, 47], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 34, 47; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Complementary and Alternative Medicine", "code": "PHA 201", "title": "General Pharmacology", "units": 2, "row_hash": "92c48d6fe5dc9f875bef404e380d2dde828204e7abc356ca151fc66773c6a3ab", "pdf_pages": [79, 91], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 79, 91; CAM global course structure and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Audiology", "code": "PHA 312", "title": "Introductory Pharmacology", "units": 1, "row_hash": "3c32e38589e278757decc646d84c804393d331e3eaacc292b420accc1ab7ec24", "pdf_pages": [35, 56], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 35, 56; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Medical Laboratory Science", "code": "PHA 301", "title": "Basic Pharmacology and Toxicology:", "units": None, "row_hash": "537c98d2c263284966b20ba2d92acb843bedcedb0bf1cdef5e5d408634be2a38", "pdf_pages": [331, 355], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 331, 355; Medical Laboratory Science table and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Nursing Sciences", "code": "PHA 301", "title": "Pharmacodynamics and Chemotherapy I", "units": 2, "row_hash": "e34107a55748819410efa4491ac2e8a7b380fcd5c3d99f72a76c7d159b140adc", "pdf_pages": [371, 390], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 371, 390; Nursing Sciences course table and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Dental Therapy", "code": "PHA 301", "title": "General Principles of Pharmacology", "units": 2, "row_hash": "f9956a2e06ce287c9cce21b96a66133799f6546a5a32cf98b655e669ba31c857", "pdf_pages": [145, 160], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 145, 160; Dental Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Speech-Language Therapy", "code": "PHA 301", "title": "General Principles of Pharmacology", "units": 2, "row_hash": "d8331caf04e395e32b46eeaafa3de3ab6bb2d11779ecd693fcc2237c6fac856d", "pdf_pages": [737, 756], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 756; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Nursing Sciences", "code": "PHA 302", "title": "Pharmacodynamics and Chemotherapy II", "units": 2, "row_hash": "7c4a06a2b1d1283b330cc796682b4a14c29941ea614723bb93fd0bb914904998", "pdf_pages": [371, 396], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 371, 396; Nursing Sciences course table and detail"},
    {"file": ALLIED_PDF, "from": "Pharmacology", "to": "Speech-Language Therapy", "code": "PHA 312", "title": "Pharmacology for Medical Rehabilitation Professionals", "units": 2, "row_hash": "710677a7ab16471107adac5d88692e4a93cb60ad4cdbf4aa3e05cdd98fb2e3ca", "pdf_pages": [737, 756], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 756; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Audiology", "code": "PST 201", "title": "Rehabilitation Physics/Biophysics", "units": 1, "row_hash": "eafe05eb33551634b740ae0917a9a01ac6067871ef02ff42514af0eb6814ab65", "pdf_pages": [34, 47], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 34, 47; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Speech-Language Therapy", "code": "PST 201", "title": "Rehabilitative Physics", "units": 2, "row_hash": "cf9b15b987105adc9b4a8bd783f6ba7aef63ad9ea51af2c33363044743d38516", "pdf_pages": [737, 745], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 745; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Audiology", "code": "PST 202", "title": "Introduction to Medical Rehabilitation", "units": 1, "row_hash": "6812056e4d2dccdf452b4d3d2498b44c6e8bc529371fbd4082336afe16242ae6", "pdf_pages": [34, 48], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 34, 48; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Speech-Language Therapy", "code": "PST 202", "title": "Introduction to Medical Rehabilitation", "units": 2, "row_hash": "607134c63df994f59951149d9e44c8f6b963ff612de78cfd80eeaa0d2f76b0bc", "pdf_pages": [737, 747], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 747; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Audiology", "code": "PST 311", "title": "Programming for Rehabilitation", "units": 1, "row_hash": "004a6641e0438a92cbcf65374c6ac8f560242e1bb6e6965122f6801468f35a76", "pdf_pages": [35, 55], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 35, 55; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Speech-Language Therapy", "code": "PST 311", "title": "Programming for Rehabilitation Professionals", "units": 2, "row_hash": "e0fe87b8476b1e19311d1bc44eb5b0c1a397093ceec4a88fce977f0c3b73ac8f", "pdf_pages": [737, 754], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 754-756; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Audiology", "code": "PST 313", "title": "Introductory Pathology", "units": 1, "row_hash": "990a9b79937b1a826a2a5e1553b0fecc7c92bab629fe177205548c18af7326db", "pdf_pages": [35, 56], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 35, 56-57; Audiology course structure and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Speech-Language Therapy", "code": "PST 313", "title": "Pathology for Rehabilitation Professionals", "units": 2, "row_hash": "9c04f31c0e16401ab916f6e028dd7b75baad832637033c41281f6c4644276450", "pdf_pages": [737, 757], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 757-758; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Physiotherapy", "to": "Speech-Language Therapy", "code": "PST 411", "title": "Research Methods in Medical Rehabilitation", "units": None, "row_hash": "fc5125c81d89c817368f5fc582bae9a299f0da4ac9466f92fe69caf6fc5c84a9", "pdf_pages": [738, 760], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 738, 760-761; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Audiology", "to": "Speech-Language Therapy", "code": "AUD 312", "title": "Basic Procedures in Audiology", "units": 2, "row_hash": "1646187fb401034efe241a17be2a7d818e471e6a44e2520cbcbb531ab9676041", "pdf_pages": [737, 756], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 737, 756-757; Speech-Language Therapy course table and detail"},
    {"file": ALLIED_PDF, "from": "Audiology", "to": "Speech-Language Therapy", "code": "AUD 409", "title": "Aural Rehabilitation", "units": 2, "row_hash": "37ad2b0fde361b62e190e48eaf4b6c1d6c17487586c0023f17e4ecba093bdc07", "pdf_pages": [738, 763], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 738, 763; Speech-Language Therapy course table and detail"},
]


CONTEXT_ANNOTATIONS: list[dict[str, Any]] = [
    {"file": "administration_management.json", "programme": "Hospitality and Tourism Management", "code": "HTM 403", "title": "Tourism and Foodservice Management", "units": 2, "pdf_pages": [260], "locator": "Administration-and-Management.pdf, printed p. 260, 400 Level HTM course table", "option": "Hospitality and Tourism Management standard course structure"},
    {"file": "administration_management.json", "programme": "Hospitality and Tourism Management", "code": "HTM 403", "title": "Foodservice and Tourism Management", "units": 2, "pdf_pages": [260, 276], "locator": "Administration-and-Management.pdf, printed p. 260 (Tourism Management Option) and p. 276 detail", "option": "Tourism Management Option"},
    {"file": "administration_management.json", "programme": "Taxation", "code": "TAX 311", "title": "Revenue Law and practice", "units": 3, "pdf_pages": [561, 572], "locator": "Administration-and-Management.pdf, printed pp. 561, 572; Taxation 300 Level table and detail"},
    {"file": "administration_management.json", "programme": "Taxation", "code": "TAX 311", "title": "Entrepreneurship in Taxation", "units": 2, "pdf_pages": [561, 573], "locator": "Administration-and-Management.pdf, printed pp. 561, 573-574; Taxation 300 Level table and detail"},
    {"file": ALLIED_PDF, "programme": "Complementary and Alternative Medicine", "code": "CAM 302", "title": "Introduction to Osteopathy", "units": 2, "pdf_pages": [98], "locator": "Allied-Health-Sciences-2023.pdf, printed p. 98; CAM course detail block"},
    {"file": ALLIED_PDF, "programme": "Complementary and Alternative Medicine", "code": "CAM 302", "title": "Naturopathy II", "units": 2, "pdf_pages": [100], "locator": "Allied-Health-Sciences-2023.pdf, printed p. 100; CAM course detail block"},
    {"file": ALLIED_PDF, "programme": "Nursing Sciences", "code": "NSC 406", "title": "Curriculum Development and Teaching Methodology", "units": 2, "pdf_pages": [371, 397], "locator": "Allied-Health-Sciences-2023.pdf, printed pp. 371, 397; Nursing course table and detail"},
    {"file": ALLIED_PDF, "programme": "Nursing Sciences", "code": "NSC 406", "title": "Mental Health Nursing II", "units": 2, "pdf_pages": [371, 400], "locator": "Allied-Health-Sciences-2023.pdf, printed p. 371 table lists NSC 405; detailed course heading printed p. 400 lists NSC 406"},
    {"file": "arts.json", "programme": "Modern European Languages (Russian)", "code": "RUS 361", "title": "Oral Expression and comprehension in Russian", "units": 2, "pdf_pages": [495, 507], "locator": "Arts-CCMAS-2023-FINAL.pdf, printed pp. 495, 507; course table/detail code-title conflict"},
    {"file": "arts.json", "programme": "Modern European Languages (Russian)", "code": "RUS 361", "title": "Advanced Studies in Russian Phonetics", "units": 2, "pdf_pages": [495, 512], "locator": "Arts-CCMAS-2023-FINAL.pdf, printed pp. 495, 512; course table and detail"},
]

SOURCE_CONFLICTS = [
    {
        "key": "allied_health.json::Nursing Sciences::NSC 406::Mental Health Nursing II",
        "owner": "Nursing Sciences",
        "source_locator": "Allied-Health-Sciences-2023.pdf, printed p. 371 course table says NSC 405; detailed block printed p. 400 says NSC 406",
        "disposition": "owner_resolved_code_conflict_preserved",
        "reason": "The Nursing course table and detailed block assign different NSC codes, and NSC 405 is already used by another detailed course. Do not re-key either course without authoritative clarification.",
    },
    {
        "key": "arts.json::Modern European Languages (Russian)::RUS 361::Oral Expression and comprehension in Russian",
        "owner": "Modern European Languages (Russian)",
        "source_locator": "Arts-CCMAS-2023-FINAL.pdf, printed p. 495 course table lists RUS 361 Advanced Studies in Russian Phonetics; printed p. 507 has a separate RUS 361 Oral Expression block; printed p. 512 details Advanced Studies in Russian Phonetics",
        "disposition": "owner_resolved_table_detail_identity_conflict_preserved",
        "reason": "The source places both blocks in the Russian curriculum but the global course table supports only Advanced Studies in Russian Phonetics under RUS 361. The other block is not assigned a different code by the source table, so it remains preserved but not silently re-keyed or counted as a verified separate course.",
    },
]


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_verified_pages() -> dict[str, list[str]]:
    reviewer_path = AUDIT / "review_ccmas_duplicate_code_groups_2026_09_30.py"
    spec = importlib.util.spec_from_file_location("ccmas_context_source_verifier", reviewer_path)
    if not spec or not spec.loader:
        raise RuntimeError("Could not load original-source integrity verifier")
    reviewer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(reviewer)
    return reviewer.verified_source_pages(read_json(MANIFEST))


def row_preimage(row: dict[str, Any]) -> str:
    fields = ("code", "title", "units", "status", "lh", "ph", "content_summary", "skills_learned")
    payload = json.dumps({field: row.get(field) for field in fields}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(payload.encode("utf-8"))


def find_programme(document: dict[str, Any], name: str) -> dict[str, Any]:
    rows = [programme for programme in document.get("programmes", []) if programme.get("name") == name]
    if len(rows) != 1:
        raise RuntimeError(f"Programme guard failed: {name} ({len(rows)} matches)")
    return rows[0]


def course_sort_key(row: dict[str, Any]) -> tuple[int, int, str]:
    code = str(row.get("code") or "")
    match = re.search(r"(\d{3})\s*$", code)
    return (int(row.get("level") or 0), int(match.group(1)) if match else 999, code.casefold())


def insert_in_course_order(courses: list[dict[str, Any]], row: dict[str, Any]) -> None:
    key = course_sort_key(row)
    index = next((i for i, existing in enumerate(courses) if course_sort_key(existing) > key), len(courses))
    courses.insert(index, row)


def verify_source_row(spec: dict[str, Any], pages: dict[str, list[str]]) -> None:
    source_pages = pages[spec["file"]]
    for page_index in spec["pdf_pages"]:
        if page_index < 1 or page_index > len(source_pages):
            raise RuntimeError(f"Source page index out of range: {spec['file']} p.{page_index}")
    locator_pages = "\n".join(source_pages[index - 1] for index in spec["pdf_pages"])
    if spec["title"].casefold() not in locator_pages.casefold():
        raise RuntimeError(f"Source title evidence failed: {spec['file']}::{spec['title']}::{spec['pdf_pages']}")
    code_compact = re.sub(r"\s+", "", spec["code"]).casefold()
    source_compact = re.sub(r"\s+", "", locator_pages).casefold()
    if code_compact not in source_compact:
        raise RuntimeError(f"Source code evidence failed: {spec['file']}::{spec['code']}::{spec['pdf_pages']}")


def resolve_transfer(spec: dict[str, Any], documents: dict[str, dict[str, Any]], pages: dict[str, list[str]]) -> str:
    verify_source_row(spec, pages)
    document = documents[spec["file"]]
    source = find_programme(document, spec["from"])
    destination = find_programme(document, spec["to"])
    source_rows = [row for row in source.get("courses", []) if row_preimage(row) == spec["row_hash"]]
    destination_rows = [row for row in destination.get("courses", []) if row_preimage(row) == spec["row_hash"]]

    if not source_rows and len(destination_rows) == 1:
        return "already_applied"
    if len(source_rows) != 1 or destination_rows:
        raise RuntimeError(f"Ownership transfer preimage guard failed: {spec['file']}::{spec['from']}::{spec['code']}::{spec['title']} (source={len(source_rows)}, destination={len(destination_rows)})")

    row = source_rows[0]
    source["courses"].remove(row)
    row["source_state"] = "source_reconciled_original_pdf"
    row["source_locator"] = spec["locator"]
    insert_in_course_order(destination.setdefault("courses", []), row)
    return "moved"


def annotate_same_owner_context(spec: dict[str, Any], documents: dict[str, dict[str, Any]], pages: dict[str, list[str]]) -> str:
    verify_source_row(spec, pages)
    document = documents[spec["file"]]
    programme = find_programme(document, spec["programme"])
    rows = [row for row in programme.get("courses", []) if row.get("code") == spec["code"] and row.get("title") == spec["title"] and row.get("units") == spec["units"]]
    if len(rows) != 1:
        raise RuntimeError(f"Same-owner context guard failed: {spec['file']}::{spec['programme']}::{spec['code']}::{spec['title']} ({len(rows)} matches)")
    row = rows[0]
    changed = row.get("source_locator") != spec["locator"]
    row["source_locator"] = spec["locator"]
    if "option" in spec:
        changed = changed or row.get("source_option_context") != spec["option"]
        row["source_option_context"] = spec["option"]
    return "annotated" if changed else "already_annotated"


def remaining_duplicate_groups(documents: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    groups = []
    for filename, document in documents.items():
        for programme in document.get("programmes", []):
            by_code: dict[str, list[dict[str, Any]]] = {}
            for row in programme.get("courses", []):
                code = " ".join(str(row.get("code") or "").upper().split())
                if code:
                    by_code.setdefault(code, []).append(row)
            for code, rows in by_code.items():
                if len(rows) > 1:
                    groups.append({
                        "key": f"{filename}::{programme.get('name')}::{code}",
                        "programme_owner": programme.get("name"),
                        "record_count": len(rows),
                        "titles": [row.get("title") for row in rows],
                    })
    return sorted(groups, key=lambda group: group["key"])


REMAINING_GROUP_DISPOSITIONS = {
    "administration_management.json::Hospitality and Tourism Management::HTM 403": "Two source table occurrences: one standard HTM structure and one explicitly labelled Tourism Management Option; both retained and individually annotated.",
    "administration_management.json::Taxation::TAX 311": "Two distinct Taxation courses are explicitly listed with the same code in the same 300 Level table and have separate detail blocks; both retained.",
    "allied_health.json::Nursing Sciences::NSC 406": "Both blocks belong to Nursing; the source table/detail code disagreement for Mental Health Nursing II is documented and neither course is re-keyed.",
    "allied_health.json::Complementary and Alternative Medicine::CAM 302": "Both distinct CAM detail blocks are retained under CAM. The source does not explicitly label them as separate options, so no option name is inferred.",
    "arts.json::Modern European Languages (Russian)::RUS 361": "Both detail blocks are in the Russian section, but only Advanced Studies in Russian Phonetics is supported by the global RUS 361 table row; the second identity conflict is preserved, not promoted as a separate verified course.",
}


def next_checkpoint() -> Path:
    found = []
    for path in AUDIT.glob(OUTPUT_PREFIX + "*.json"):
        tail = path.stem.rsplit("_", 1)[-1]
        if tail.isdigit():
            found.append(int(tail))
    return AUDIT / f"{OUTPUT_PREFIX}{max(found, default=0) + 1:03d}.json"


def previous_checkpoint() -> str:
    existing = []
    for path in AUDIT.glob(OUTPUT_PREFIX + "*.json"):
        tail = path.stem.rsplit("_", 1)[-1]
        if tail.isdigit():
            existing.append((int(tail), path.name))
    return max(existing)[1] if existing else SOURCE_REVIEW.name


def run(apply: bool) -> dict[str, Any]:
    if not apply:
        raise RuntimeError("This is an explicit source-backed repair; invoke with --apply after reviewing the plan.")
    saved_review = read_json(SOURCE_REVIEW)
    if saved_review.get("scope", {}).get("within_package_duplicate_code_groups") != 16:
        raise RuntimeError("Unexpected source-review checkpoint scope; review before proceeding")

    pages = load_verified_pages()
    filenames = sorted({spec["file"] for spec in TRANSFERS} | {spec["file"] for spec in CONTEXT_ANNOTATIONS} | {"arts.json"})
    original_bytes = {filename: (CCMAS / filename).read_bytes() for filename in filenames}
    original_hashes = {filename: sha256_bytes(value) for filename, value in original_bytes.items()}
    documents = {filename: json.loads(value.decode("utf-8")) for filename, value in original_bytes.items()}
    staged = deepcopy(documents)

    operations = []
    for spec in TRANSFERS:
        result = resolve_transfer(spec, staged, pages)
        operations.append({
            "key": f"{spec['file']}::{spec['from']}::{spec['code']}::{spec['title']}::{spec['units']}u",
            "owner": spec["to"],
            "result": result,
            "source_locator": spec["locator"],
            "identity_and_detail_preimage_sha256": spec["row_hash"],
        })

    annotations = []
    for spec in CONTEXT_ANNOTATIONS:
        result = annotate_same_owner_context(spec, staged, pages)
        annotations.append({
            "key": f"{spec['file']}::{spec['programme']}::{spec['code']}::{spec['title']}",
            "result": result,
            "source_locator": spec["locator"],
            "source_option_context": spec.get("option"),
        })

    remaining_groups = remaining_duplicate_groups(staged)
    remaining_keys = {group["key"] for group in remaining_groups}
    if remaining_keys != set(REMAINING_GROUP_DISPOSITIONS):
        raise RuntimeError(f"Unexpected remaining duplicate groups: {sorted(remaining_keys)}")
    remaining_contexts = [
        {**group, "source_context_disposition": REMAINING_GROUP_DISPOSITIONS[group["key"]]}
        for group in remaining_groups
    ]

    changed_files = []
    for filename, document in staged.items():
        if document == documents[filename]:
            continue
        serialized = (json.dumps(document, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        # The complete repair is staged and validated in memory before any write.
        (CCMAS / filename).write_bytes(serialized)
        changed_files.append(filename)
        reread = read_json(CCMAS / filename)
        if reread != document:
            raise RuntimeError(f"Post-write JSON verification failed: {filename}")

    checkpoint = next_checkpoint()
    result = {
        "schema": "2026-09-30.ccmas-duplicate-code-context-resolution.v1",
        "generated_on": date.today().isoformat(),
        "status": "source_contexts_resolved_with_source_conflicts_explicitly_preserved",
        "supersedes": previous_checkpoint(),
        "source_integrity": "original_pdf_and_extracted_page_text_hashes_verified",
        "files_changed": changed_files,
        "transferred_occurrences": operations,
        "same_programme_occurrence_annotations": annotations,
        "source_conflicts_preserved": SOURCE_CONFLICTS,
        "remaining_same_code_groups": remaining_contexts,
        "counts": {
            "occurrences_reassigned_to_source_owner": sum(op["result"] == "moved" for op in operations),
            "occurrences_already_reassigned": sum(op["result"] == "already_applied" for op in operations),
            "cumulative_occurrences_reassigned_to_source_owner": sum(op["result"] in {"moved", "already_applied"} for op in operations),
            "source_option_contexts_recorded": sum(bool(item.get("source_option_context")) for item in annotations),
            "source_code_conflicts_preserved": len(SOURCE_CONFLICTS),
            "remaining_same_code_groups_preserved_with_context": len(remaining_contexts),
            "summaries_or_outcomes_changed": False,
            "course_rows_deleted": 0,
        },
        "preimage_file_sha256": original_hashes,
        "checkpoint": checkpoint.name,
    }
    checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = [
        "# CCMAS duplicate-code ownership/context resolution — 2026-09-30",
        "",
        "Original PDF and extracted-page hashes verified against the checked-in source manifest.",
        "Only source-proven owner/context fields and parent programme arrays were changed. No course row was deleted; summaries and outcomes were not edited.",
        f"Moved to source owner: **{result['counts']['occurrences_reassigned_to_source_owner']}**; source conflicts explicitly preserved: **{len(SOURCE_CONFLICTS)}**.",
        "",
        "## Reassigned occurrences",
        *[f"- `{op['key']}` → **{op['owner']}** ({op['result']}); {op['source_locator']}" for op in operations],
        "",
        "## Same-programme contexts retained",
        *[f"- `{item['key']}`; {item['source_option_context'] or 'same programme; source locator attached'}" for item in annotations],
        "",
        "## Source conflicts retained without guessing",
        *[f"- `{item['key']}` — {item['disposition']}: {item['reason']}" for item in SOURCE_CONFLICTS],
        "",
        "## Remaining same-code groups and their source context",
        *[f"- `{item['key']}` — {item['source_context_disposition']}" for item in remaining_contexts],
        "",
        f"Changed package files: {', '.join(changed_files) or 'none'}.",
        "",
    ]
    checkpoint.with_suffix(".md").write_text("\n".join(markdown), encoding="utf-8")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    print(json.dumps(run(args.apply), ensure_ascii=False, indent=2))
