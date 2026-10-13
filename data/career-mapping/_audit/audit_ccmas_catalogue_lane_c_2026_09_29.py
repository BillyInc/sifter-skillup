"""Audit the current 237-package CCMAS catalogue against local NUC PDFs.

This is an audit-only lane.  It deliberately does not edit CCMAS source JSON,
JAMB scopes, downstream taxonomy, or generated seeds.  The unit of review is
one current ``(source_file, programme, course_code)`` record; repeated JAMB
occurrences are not re-counted here.

The scanner uses the current JSON first, then checks candidate rows against the
official local NUC PDFs.  A code/title hit is evidence for a locator, not proof
that the extracted block is correct.  The resulting JSON/Markdown files are
append-only checkpoint artefacts and include every candidate, not just severe
ones.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable

try:
    from pypdf import PdfReader
except ImportError as exc:  # pragma: no cover - environment guard
    raise SystemExit("pypdf is required for the local NUC PDF audit") from exc


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_DIR = ROOT / "ccmas"
OUT_JSON = AUDIT / "ccmas_catalogue_lane_c_checkpoint_2026-09-29_001.json"
OUT_MD = AUDIT / "ccmas_catalogue_lane_c_checkpoint_2026-09-29_001.md"

LOCAL_ORIGINAL_DIR = Path(
    r"C:\tmp\sifter-ccmas-original\ccmas original documents"
)

SOURCE_DOCUMENTS: dict[str, tuple[str, str]] = {
    "administration_management.json": (
        "Administration-and-Management.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    ),
    "agricultural_science.json": (
        "Agriculture-2023.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    ),
    "allied_health.json": (
        "Allied-Health-Sciences-2023.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    ),
    "architecture.json": (
        "Architecture-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    ),
    "arts.json": (
        "Arts-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    ),
    "basic_medical.json": (
        "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    ),
    "communication_media.json": (
        "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    ),
    "computing.json": (
        "Computing-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
    ),
    "education.json": (
        "Education-CCMAS-2023-New.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    ),
    "engineering.json": (
        "Engineering-Technology-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    ),
    "environmental_sciences.json": (
        "Environmental-Sciences-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    ),
    "law.json": (
        "Law-ALL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
    ),
    "medicine_dentistry.json": (
        "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    ),
    "pharmacy.json": (
        "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    ),
    "sciences.json": (
        "Sciences-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    ),
    "social_sciences.json": (
        "Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    ),
    "veterinary.json": (
        "Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
        "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
    ),
}

PLACEHOLDERS = {
    "",
    "-",
    "--",
    "---",
    "—",
    "n/a",
    "na",
    "none",
    "not available",
    "not applicable",
    "nil",
    "tbc",
    "to be confirmed",
}

VERIFIED_STATES = {
    "source_backed",
    "source_reconciled",
    "source_title_inconsistency_resolved_to_course_content_heading",
    "source_combined_header",
    "content_cross_reference",
    "content_only",
}


def clean(value: Any) -> str:
    text = str(value or "")
    text = text.replace("\u00a0", " ").replace("\ufffd", " ")
    text = text.replace("â€”", "—").replace("â€“", "–")
    return re.sub(r"\s+", " ", text).strip()


def folded(value: Any) -> str:
    text = clean(value).casefold()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def code_forms(value: Any) -> list[str]:
    text = clean(value).upper()
    forms = [text]
    forms.append(re.sub(r"\s+", "", text))
    # Source headings sometimes omit the parenthetical variant marker.
    forms.append(re.sub(r"\([^)]*\)", "", text).strip())
    forms.extend(re.sub(r"\s+", "", item).strip() for item in re.split(r"[/,]", text))
    return sorted({item for item in forms if len(item) >= 3}, key=len, reverse=True)


def is_blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return clean(value).casefold() in PLACEHOLDERS
    if isinstance(value, list):
        return not [item for item in value if clean(item)]
    return False


def nonempty_items(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [clean(item) for item in value if clean(item)]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def row_key(source_file: str, programme: str, code: str) -> str:
    return f"{source_file}::{clean(programme)}::{clean(code)}"


def load_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    packages: list[dict[str, Any]] = []
    for source_path in sorted(SOURCE_DIR.glob("*.json")):
        source_file = source_path.name
        document = json.loads(source_path.read_text(encoding="utf-8"))
        for programme in document.get("programmes", []):
            programme_name = clean(programme.get("name"))
            package = {
                "source_file": source_file,
                "programme": programme_name,
                "code": clean(programme.get("code")),
                "qualification": clean(programme.get("qualification")),
                "course_count": len(programme.get("courses") or []),
            }
            packages.append(package)
            for course in programme.get("courses") or []:
                rows.append(
                    {
                        "source_file": source_file,
                        "programme": programme_name,
                        "package_code": package["code"],
                        "code": clean(course.get("code")),
                        "title": clean(course.get("title")),
                        "course": course,
                        "key": row_key(source_file, programme_name, course.get("code")),
                    }
                )
    return packages, rows


def extract_sources() -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    documents: dict[str, dict[str, Any]] = {}
    missing: list[dict[str, Any]] = []
    for source_file, (pdf_name, official_url) in SOURCE_DOCUMENTS.items():
        repo_pdf = AUDIT / "ccmas_source_pdfs_2026-09-29" / pdf_name
        pdf_path = repo_pdf if repo_pdf.exists() else LOCAL_ORIGINAL_DIR / pdf_name
        if not pdf_path.exists():
            missing.append({"source_file": source_file, "pdf_name": pdf_name, "path": str(pdf_path)})
            continue
        reader = PdfReader(str(pdf_path))
        pages = [(page.extract_text() or "").replace("\x00", "") for page in reader.pages]
        code_page_index: dict[str, list[int]] = defaultdict(list)
        for index, page in enumerate(pages, start=1):
            # Course headings use an uppercase alphabetic prefix plus a
            # numeric code.  Indexing these once avoids a full-page scan for
            # every residual candidate.
            for match in re.findall(r"\b[A-Z]{2,7}\s*\d{3,4}(?:\s*\([^)]{1,8}\))?\b", page.upper()):
                for form in code_forms(match):
                    code_page_index[form].append(index)
        documents[source_file] = {
            "pdf_name": pdf_name,
            "pdf_path": str(pdf_path),
            "official_url": official_url,
            "sha256": sha256(pdf_path),
            "page_count": len(pages),
            "pages": pages,
            # Candidate verification is queue-scoped.  Cache the two cheap
            # normalized forms once so 100s of candidate rows do not repeat
            # regex normalization over every PDF page.
            "page_folds": [folded(page) for page in pages],
            "page_raw_upper_compact": [re.sub(r"\s+", "", page.upper()) for page in pages],
            "code_page_index": {key: sorted(set(value)) for key, value in code_page_index.items()},
        }
    return documents, missing


def page_evidence(document: dict[str, Any], code: str, title: str) -> dict[str, Any]:
    code_variants = code_forms(code)
    title_fold = folded(title)
    indexed_pages = sorted({page for variant in code_variants for page in document["code_page_index"].get(variant, [])})
    # A few malformed source headings have no parseable code.  Only in that
    # fallback case do we scan normalized page text for the title.
    if not indexed_pages and title_fold:
        title_tokens = [token for token in title_fold.split() if len(token) >= 5]
        if title_tokens:
            indexed_pages = [
                index
                for index, page_fold in enumerate(document["page_folds"], start=1)
                if sum(token in page_fold for token in title_tokens) >= max(1, len(title_tokens) - 1)
            ]
    hits: list[dict[str, Any]] = []
    for index in indexed_pages:
        page = document["pages"][index - 1]
        page_fold = document["page_folds"][index - 1]
        raw_upper = document["page_raw_upper_compact"][index - 1]
        code_hit = next((variant for variant in code_variants if variant in raw_upper), None)
        title_hit = bool(title_fold and title_fold in page_fold)
        if code_hit or title_hit:
            excerpt = clean(page)
            hits.append(
                {
                    "page": index,
                    "code_hit": code_hit,
                    "title_hit": title_hit,
                    "excerpt": excerpt[:600],
                }
            )
    if not hits:
        status = "not_located"
    elif any(item["code_hit"] and item["title_hit"] for item in hits):
        status = "same_page_code_title_hit"
    elif any(item["code_hit"] for item in hits):
        status = "code_only_hit"
    else:
        status = "title_only_hit"
    return {"status": status, "pages": hits[:12], "hit_count": len(hits)}


def package_evidence(document: dict[str, Any], programme: str) -> dict[str, Any]:
    target = folded(programme)
    exact_pages: list[int] = []
    token_pages: list[int] = []
    tokens = [token for token in target.split() if len(token) >= 4]
    for index, page_fold in enumerate(document["page_folds"], start=1):
        if target and target in page_fold:
            exact_pages.append(index)
        elif tokens and sum(token in page_fold for token in tokens) >= max(1, len(tokens) - 1):
            token_pages.append(index)
    if exact_pages:
        status = "exact_package_title_hit"
    elif token_pages:
        status = "package_title_token_hit"
    else:
        status = "package_title_not_located"
    return {"status": status, "pages": sorted(set(exact_pages or token_pages))[:20]}


def collect_verified_keys() -> set[str]:
    verified: set[str] = set()
    review_path = AUDIT / "ccmas_original_source_review_2026-09-18.json"
    if review_path.exists():
        review = json.loads(review_path.read_text(encoding="utf-8"))
        for item in review.get("courseRows", []):
            if item.get("originalChecked") and str(item.get("dataState", "")).startswith("source_backed"):
                verified.add(row_key(item.get("sourceFile", ""), item.get("programme", ""), item.get("courseCode", "")))

    def walk(value: Any) -> Iterable[dict[str, Any]]:
        if isinstance(value, dict):
            yield value
            for child in value.values():
                yield from walk(child)
        elif isinstance(value, list):
            for child in value:
                yield from walk(child)

    # Only inspect source-phase checkpoint/repair artefacts.  This avoids
    # accidentally treating downstream reports as CCMAS source verification.
    patterns = (
        "ccmas_*repair*.json",
        "ccmas_*reconciliation*.json",
        "ccmas_*adjudication*.json",
        "ccmas_*normalization*.json",
        "final_jamb_ccmas_exact_course_repairs*json",
        "exact_ccmas_workload_propagation*json",
        "canonical_ccmas_outcome_propagation*json",
    )
    paths: set[Path] = set()
    for pattern in patterns:
        paths.update(AUDIT.glob(pattern))
    for path in sorted(paths):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for item in walk(payload):
            source_file = item.get("source_file") or item.get("sourceFile")
            programme = item.get("programme") or item.get("programme_name") or item.get("programmeName")
            code = item.get("code") or item.get("course_code") or item.get("courseCode")
            if source_file in SOURCE_DOCUMENTS and programme and code:
                verified.add(row_key(source_file, programme, code))
    return verified


def prior_inventory_reconciliation(current_keys: set[str]) -> dict[str, Any]:
    path = AUDIT / "ccmas_extraction_anomaly_inventory_2026-09-26.json"
    if not path.exists():
        return {"source": str(path), "available": False}
    payload = json.loads(path.read_text(encoding="utf-8"))
    previous: dict[str, list[str]] = defaultdict(list)
    for class_name, items in (payload.get("candidates") or {}).items():
        for item in items:
            key = row_key(item.get("source_file", ""), item.get("programme", ""), item.get("code", ""))
            previous[class_name].append(key)
    result: dict[str, Any] = {"source": str(path), "available": True, "classes": {}}
    for class_name, keys in previous.items():
        unique = sorted(set(keys))
        result["classes"][class_name] = {
            "previous_occurrences": len(keys),
            "previous_unique_keys": len(unique),
            "still_present_currently": sum(key in current_keys for key in unique),
            "no_longer_currently_present": sum(key not in current_keys for key in unique),
        }
    return result


def main() -> None:
    packages, rows = load_rows()
    documents, missing_documents = extract_sources()
    verified_keys = collect_verified_keys()

    duplicate_groups: list[dict[str, Any]] = []
    grouped_codes: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped_codes[(row["source_file"], row["programme"], clean(row["code"]).upper())].append(row)
    for (source_file, programme, code), members in sorted(grouped_codes.items()):
        if len(members) < 2:
            continue
        open_members = [item for item in members if item["key"] not in verified_keys]
        duplicate_groups.append(
            {
                "source_file": source_file,
                "programme": programme,
                "code": code,
                "row_count": len(members),
                "titles": sorted({item["title"] for item in members}),
                "keys": [item["key"] for item in members],
                "verified_member_count": sum(item["key"] in verified_keys for item in members),
                "open_member_count": len(open_members),
                "verification_state": "closed_or_verified" if not open_members else "open_source_check_required",
                "source_evidence": [
                    {
                        "key": item["key"],
                        "code": item["code"],
                        "title": item["title"],
                        "evidence": page_evidence(documents[source_file], item["code"], item["title"]),
                    }
                    for item in open_members
                    if source_file in documents
                ],
                "recommendation": "Compare every occurrence with the exact NUC package block; preserve source-authored combined/variant rows and repair only extractor/package conflicts.",
            }
        )

    candidates: list[dict[str, Any]] = []
    repeated_outcome_rows: list[dict[str, Any]] = []
    identical_course_outcome_groups: list[dict[str, Any]] = []
    outcome_signature_groups: dict[tuple[str, str, tuple[str, ...]], list[dict[str, Any]]] = defaultdict(list)
    current_keys = {row["key"] for row in rows}

    for row in rows:
        course = row["course"]
        content = clean(course.get("content_summary"))
        learning_outcomes = nonempty_items(course.get("learning_outcomes"))
        skills = nonempty_items(course.get("skills_learned"))
        effective_outcomes = learning_outcomes or skills
        key = row["key"]
        already_verified = key in verified_keys or course.get("source_state") in VERIFIED_STATES
        evidence = None
        document = documents.get(row["source_file"])
        if document and not already_verified and (is_blank(content) or not effective_outcomes):
            evidence = page_evidence(document, row["code"], row["title"])

        if is_blank(content):
            candidates.append(
                {
                    **{field: row[field] for field in ("key", "source_file", "programme", "code", "title")},
                    "candidate_class": "empty_or_placeholder_content_summary",
                    "current_state": "verified_or_repaired" if already_verified else "open",
                    "source_state": course.get("source_state"),
                    "source_evidence": evidence,
                    "recommendation": "Check the exact NUC course block. Preserve a source-defined blank/project/attachment; otherwise restore the source content with its printed-page locator.",
                }
            )
        if not effective_outcomes:
            candidates.append(
                {
                    **{field: row[field] for field in ("key", "source_file", "programme", "code", "title")},
                    "candidate_class": "empty_or_placeholder_learning_outcomes",
                    "current_state": "verified_or_repaired" if already_verified else "open",
                    "source_state": course.get("source_state"),
                    "source_evidence": evidence,
                    "recommendation": "Check the exact NUC outcome block. Do not invent an outcome; preserve a documented source-defined absence only with a source locator and review state.",
                }
            )

        counts = Counter(folded(item) for item in effective_outcomes)
        repeated = [{"text": item, "count": count} for item, count in counts.items() if count > 1]
        if repeated:
            finding = {
                **{field: row[field] for field in ("key", "source_file", "programme", "code", "title")},
                "candidate_class": "repeated_outcome_text_within_course",
                "repeated_outcomes": repeated,
                "current_state": "verified_or_repaired" if already_verified else "open",
                "source_state": course.get("source_state"),
                "source_evidence": (
                    page_evidence(document, row["code"], row["title"])
                    if document and not already_verified
                    else None
                ),
                "recommendation": "Compare the repeated wording to the NUC block; classify as source-authored repetition or extractor duplication before any deduplication.",
            }
            repeated_outcome_rows.append(finding)
            candidates.append(finding)

        signature = tuple(folded(item) for item in effective_outcomes)
        if signature:
            outcome_signature_groups[(row["source_file"], row["programme"], signature)].append(row)

    for (source_file, programme, signature), members in outcome_signature_groups.items():
        if len(members) > 1:
            identical_course_outcome_groups.append(
                {
                    "source_file": source_file,
                    "programme": programme,
                    "course_keys": [item["key"] for item in members],
                    "codes": [item["code"] for item in members],
                    "titles": [item["title"] for item in members],
                    "recommendation": "Check whether identical outcomes are a legitimate shared/core course or a cross-course extraction join; do not collapse rows by outcome text.",
                }
            )

    # Course-code reuse across packages is a separate identity queue.  It is
    # not a defect by itself: CCMAS deliberately reuses shared courses.  Only
    # groups with different titles are source-conflict candidates.
    cross_package_codes: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        cross_package_codes[(row["source_file"], re.sub(r"\s+", "", row["code"].upper()))].append(row)
    cross_package_groups: list[dict[str, Any]] = []
    for (source_file, code), members in sorted(cross_package_codes.items()):
        packages_for_code = {(item["programme"], item["title"]) for item in members}
        if len({title for _, title in packages_for_code}) < 2:
            continue
        open_members = [item for item in members if item["key"] not in verified_keys]
        cross_package_groups.append(
            {
                "source_file": source_file,
                "code": code,
                "row_count": len(members),
                "package_count": len({item["programme"] for item in members}),
                "package_titles": [
                    {"programme": item["programme"], "title": item["title"], "key": item["key"]}
                    for item in members
                ],
                "open_member_count": len(open_members),
                "verification_state": "closed_or_verified" if not open_members else "open_source_check_required",
                "source_evidence": [
                    {
                        "key": item["key"],
                        "programme": item["programme"],
                        "title": item["title"],
                        "evidence": page_evidence(documents[source_file], item["code"], item["title"]),
                    }
                    for item in open_members
                    if source_file in documents
                ],
                "recommendation": "Check package ownership and the exact source block before reusing or changing shared-code details; do not globally canonicalize by code alone.",
            }
        )

    package_findings: list[dict[str, Any]] = []
    for package in packages:
        document = documents.get(package["source_file"])
        evidence = package_evidence(document, package["programme"]) if document else {"status": "source_document_missing", "pages": []}
        if evidence["status"] == "package_title_not_located" or not document:
            package_findings.append(
                {
                    **package,
                    "finding_class": "package_source_identity_not_located",
                    "source_evidence": evidence,
                    "recommendation": "Confirm the package heading/table identity in the official NUC PDF; do not remap or rename from a title-only guess.",
                }
            )

    current_candidate_keys = {item["key"] for item in candidates}
    current_candidate_keys.update(item["key"] for item in duplicate_groups for item in item["keys"])
    current_candidate_keys.update(item["key"] for item in identical_course_outcome_groups for item in item["course_keys"])
    current_candidate_keys.update(
        item["key"]
        for group in cross_package_groups
        for item in group["package_titles"]
    )
    open_course_keys = {
        item["key"]
        for item in candidates
        if item.get("current_state") == "open"
    }
    open_course_keys.update(
        item["key"]
        for group in duplicate_groups
        if group["verification_state"] == "open_source_check_required"
        for item in group["source_evidence"]
    )
    open_course_keys.update(
        item["key"]
        for group in cross_package_groups
        if group["verification_state"] == "open_source_check_required"
        for item in group["source_evidence"]
    )
    report = {
        "schema": "2026-09-29.ccmas-catalogue-lane-c-checkpoint.v1",
        "generated_on": date.today().isoformat(),
        "status": "audit_complete_for_current_local_catalogue_source_scan",
        "scope": {
            "source_files": len(SOURCE_DOCUMENTS),
            "source_documents_loaded": len(documents),
            "source_documents_missing": len(missing_documents),
            "programme_packages": len(packages),
            "course_records": len(rows),
            "deduplication_unit": "(source_file, programme, course_code)",
        },
        "source_documents": [
            {
                "source_file": source_file,
                "pdf_name": info["pdf_name"],
                "official_url": info["official_url"],
                "local_path": info["pdf_path"],
                "sha256": info["sha256"],
                "page_count": info["page_count"],
            }
            for source_file, info in sorted(documents.items())
        ],
        "missing_source_documents": missing_documents,
        "counts": {
            "duplicate_code_groups": len(duplicate_groups),
            "rows_in_duplicate_code_groups": sum(item["row_count"] for item in duplicate_groups),
            "duplicate_code_groups_with_different_titles": sum(len(item["titles"]) > 1 for item in duplicate_groups),
            "cross_package_code_groups_with_different_titles": len(cross_package_groups),
            "cross_package_open_groups": sum(item["verification_state"] == "open_source_check_required" for item in cross_package_groups),
            "empty_or_placeholder_content_occurrences": sum(item["candidate_class"] == "empty_or_placeholder_content_summary" for item in candidates),
            "empty_or_placeholder_outcome_occurrences": sum(item["candidate_class"] == "empty_or_placeholder_learning_outcomes" for item in candidates),
            "repeated_outcome_rows": len(repeated_outcome_rows),
            "identical_full_outcome_groups_across_courses": len(identical_course_outcome_groups),
            "package_source_identity_candidates": len(package_findings),
            "all_candidate_occurrences": len(candidates),
            "all_candidate_unique_course_keys": len({item["key"] for item in candidates}),
            "verified_or_repaired_candidate_occurrences": sum(item.get("current_state") == "verified_or_repaired" for item in candidates),
            "open_candidate_occurrences": sum(item.get("current_state") == "open" for item in candidates),
            "open_unique_course_keys_requiring_source_check": len(open_course_keys),
        },
        "candidate_class_policy": {
            "empty_content_or_outcomes": "candidate until exact NUC block is checked; an empty JSON field is not itself proof of a missing source record",
            "duplicate_code": "candidate until package-specific source context is checked; do not globally merge repeated codes",
            "repeated_outcome": "candidate until source-authored repetition is distinguished from extraction duplication",
            "package_identity": "candidate when the package title is not located in its mapped official PDF; formatting variants are not automatically wrong",
            "closed_exact_repairs": "records marked verified_or_repaired are reported for traceability and must not be reopened by this lane",
        },
        "duplicate_code_groups": duplicate_groups,
        "cross_package_code_groups": cross_package_groups,
        "course_candidates": candidates,
        "identical_full_outcome_groups": identical_course_outcome_groups,
        "package_source_identity_candidates": package_findings,
        "prior_inventory_reconciliation": prior_inventory_reconciliation(current_keys),
        "verified_key_count": len(verified_keys),
        "limits": [
            "A PDF code/title hit supplies a locator candidate, not a semantic confirmation of the extracted block.",
            "This lane does not edit source JSON or derived JAMB/domain/seed files.",
            "The report does not treat a source-defined blank, pathway, project, or attachment as an error without the exact NUC context.",
            "Any remaining open candidate requires a bounded repair or explicit source-backed disposition before the CCMAS source phase can be signed off.",
        ],
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# CCMAS full-catalogue Lane C source/extraction checkpoint — 2026-09-29",
        "",
        "Audit-only checkpoint over the current 237-package CCMAS catalogue. It reads the current JSON and local official NUC PDFs; it does not edit source, JAMB, downstream, or seed files.",
        "",
        "## Scope",
        "",
        f"- Source files: **{report['scope']['source_files']}**; loaded locally: **{report['scope']['source_documents_loaded']}**; missing: **{report['scope']['source_documents_missing']}**",
        f"- Programme packages: **{report['scope']['programme_packages']}**",
        f"- Course records: **{report['scope']['course_records']}**",
        "- Review unit: `(source_file, programme, course_code)`",
        "",
        "## Current deterministic findings",
        "",
    ]
    for key, value in report["counts"].items():
        lines.append(f"- **{key.replace('_', ' ')}:** {value}")
    lines += [
        "",
        "## Interpretation",
        "",
        "Every case is included in the JSON ledger. `verified_or_repaired` means an existing source-backed/repair checkpoint covers the exact current course key; it is not reopened here. `open` means the current record still needs an exact source disposition. PDF hits are locator evidence only.",
        "",
        "## Source evidence policy",
        "",
        "- Official NUC URL, local PDF path, SHA-256, and page candidates are retained.",
        "- Duplicate course codes remain package-scoped; same code across different packages is not collapsed.",
        "- Empty content/outcomes may be source-defined projects, placements, attachments, or genuinely missing extraction; the exact PDF block decides.",
        "- Role/domain/subgroup data and all downstream mapping are explicitly out of scope.",
        "",
        "## Files",
        "",
        f"- Machine-readable ledger: `{OUT_JSON.relative_to(ROOT)}`",
        f"- This checkpoint: `{OUT_MD.relative_to(ROOT)}`",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": report["scope"], "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
