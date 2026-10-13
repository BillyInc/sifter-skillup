"""Source-check remaining CCMAS duplicate-code groups without editing package JSON.

The default run verifies the original-PDF/text extraction checksums, audits the
43 current within-package duplicate-code groups, emits an append-only checkpoint
and writes a guarded repair patch. Package JSON is changed only when the
separate --apply flag is supplied, after the parallel detail-reconciliation
lane has finished and the patch has been regenerated against that data.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS_DIR = ROOT / "ccmas"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
BASELINE = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.json"
DEDUP_REPORT = AUDIT / "dedupe_exact_ccmas_course_records_2026-09-30.json"
PATCH_PATH = AUDIT / "ccmas_duplicate_code_repair_patch_2026-09-30.json"
REPEATED_OUTCOME_INVENTORY = AUDIT / "ccmas_extraction_anomaly_inventory_2026-09-26.json"
_DETAIL_PARSER: Any = None


def source_detail_blocks(pages: list[str]) -> list[dict[str, Any]]:
    """Use the source-verified course-header parser to locate detail blocks."""
    global _DETAIL_PARSER
    if _DETAIL_PARSER is None:
        audit_path = str(AUDIT)
        if audit_path not in sys.path:
            sys.path.insert(0, audit_path)
        path = AUDIT / "repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30.py"
        spec = importlib.util.spec_from_file_location("ccmas_detail_course_parser", path)
        if not spec or not spec.loader:
            raise RuntimeError("Could not load source-detail heading parser")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _DETAIL_PARSER = module
    return _DETAIL_PARSER.course_blocks(pages)


def group_context_classification(member_reports: list[dict[str, Any]]) -> str:
    if any(not member.get("source_detail_occurrences") for member in member_reports):
        return "source_table_match_without_detail_block_for_each_title; preserve_pending_offering_context"
    return "all_member_titles_have_source_detail_blocks; preserve_distinct_source_occurrences_pending_context"

# Confirmed source-proven course identity repairs. The original
# Administration and Management PDF's course table (printed p.290) and detail
# heading (printed pp.302-303) identify IRM 401, not IRM 202. The unit/hour
# disagreement between that table (3/45) and the detail block (2/30) is kept
# unresolved; the patch therefore does not rewrite workload fields.
IRM401_REPAIR = {
    "source_file": "administration_management.json",
    "programme": "Information Resource Management",
    "old_code": "IRM 202",
    "old_title": "Information System Analysis, Design, Eval",
    "new_code": "IRM 401",
    "new_title": "Information System Analysis, Design, and Evaluation",
    "source_locator": "Administration-and-Management.pdf, printed pp. 290, 302-303",
    "source_content": (
        "Definition, concepts and scope of information systems. Analysis, design and evaluation. "
        "Concepts and methods of information systems design and development with particular reference "
        "to library and information center applications. Emphasis is given to modeling of system "
        "functions, data, and processes of computer-based information systems including the development "
        "of small-scale information systems."
    ),
    "source_outcomes": [
        "understand how modelling of system function is carried out",
        "know the processes of computer-based information systems",
        "appreciate how small-scale information systems are developed",
        "understand modelling of data",
        "identify data that can be modelled for the benefit of small-scale systems",
    ],
    "unresolved_note": (
        "The p.290 course table gives 3 units/LH 45, while the detailed course block on p.302 gives "
        "2 units/LH 30. Workload is deliberately not changed pending source reconciliation."
    ),
}

HLM309_REPAIR = {
    "operation": "update_course_record",
    "source_file": "agricultural_science.json",
    "programme": "Horticulture and Landscape Management",
    "old_code": "HLM 303",
    "old_title": "Farm Mechanization and Workshop Practices (Practical)",
    "new_code": "HLM 309",
    "new_title": "Farm Mechanization & Workshop Practices",
    "source_locator": "Agriculture-2023.pdf, printed p.349",
    "fields_to_set": {
        "code": "HLM 309",
        "title": "Farm Mechanization & Workshop Practices",
        "units": 1,
        "status": "C",
        "lh": None,
        "ph": 45,
        "content_summary": "",
        "skills_learned": [],
    },
    "fields_intentionally_unchanged": [],
    "unresolved_note": "The PDF has only the HLM 309 course-table row, not a bounded HLM 309 detail block; the wrongly attached HLM 303 summary/outcomes are cleared, not transferred or invented.",
}

GET399_FALSE_DUPLICATE = {
    "operation": "remove_misidentified_duplicate_record",
    "source_file": "engineering.json",
    "programme": "PETROLEUM ENGINEERING",
    "code": "GET 399",
    "title": "SIWES I: Students Work 4 C 12 Weeks Experience Scheme",
    "source_locator": "Engineering-Technology-CCMAS-2023-FINAL.pdf, printed pp.39, 94",
    "reason": "The package already has GET 299 SIWES I and GET 399 SIWES II. This extra GET 399 SIWES I record duplicates the wrong identity and carries copied GET 399 II details; it is not a third source course.",
}

REPEATED_OUTCOME_DISPOSITIONS = {
    ("allied_health.json", "Dental Therapy", "DTH 521"): {
        "classification": "source_authored_repetition_preserve",
        "source_locator": "Allied-Health-Sciences-2023.pdf, printed p.170",
        "note": "The original course block prints the repeated patient-management outcome twice.",
    },
    ("basic_medical.json", "Human Anatomy", "ANA 341"): {
        "classification": "source_authored_repetition_preserve",
        "source_locator": "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf, printed p.41",
        "note": "The original course block prints the repeated gene-structure outcome twice.",
    },
    ("education.json", "Music", "EDU 403"): {
        "classification": "source_published_numbering_anomaly_preserve_pending_authoritative_erratum",
        "source_locator": "Education-CCMAS-2023-New.pdf, printed p.880",
        "note": (
            "The original page itself splits outcome text with numbered standalone 'education' entries "
            "(items 4 and 10). This is not an extractor-only duplicate; no source correction is inferred."
        ),
    },
    ("arts.json", "Folklore Studies", "FLS 202"): {
        "classification": "newly_detected_source_authored_repetition_preserve",
        "source_locator": "Arts-CCMAS-2023-FINAL.pdf, printed p.281",
        "note": "The original FLS 202 learning-outcomes block prints this verbal-folklore outcome twice.",
    },
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fold(value: Any) -> str:
    folded = re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()
    return " ".join(token for token in folded.split() if token != "and")


def compact(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or "")).lower()


def course_preimage(course: dict[str, Any]) -> str:
    fields = ("code", "title", "units", "status", "lh", "ph", "content_summary", "skills_learned")
    encoded = json.dumps({field: course.get(field) for field in fields}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(encoded.encode("utf-8"))


def load_current_groups() -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    groups: list[dict[str, Any]] = []
    docs: dict[str, dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        doc = read_json(path)
        docs[path.name] = doc
        for programme in doc.get("programmes", []):
            by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
            for course in programme.get("courses", []):
                code = " ".join(str(course.get("code") or "").upper().split())
                if code:
                    by_code[code].append(course)
            for code, records in sorted(by_code.items()):
                if len(records) > 1:
                    groups.append({
                        "source_file": path.name,
                        "programme": str(programme.get("name") or ""),
                        "code": code,
                        "records": records,
                    })
    return groups, docs


def verified_source_pages(manifest: dict[str, Any]) -> dict[str, list[str]]:
    """Return page text only when both the source PDF and extracted text match the manifest."""
    result: dict[str, list[str]] = {}
    for item in manifest.get("source_documents", []):
        pdf = Path(item["original_pdf"])
        text_path = ROOT / Path(str(item["extracted_text_file"]).replace("\\", "/"))
        if not pdf.is_file() or sha256_file(pdf) != item["original_pdf_sha256"]:
            raise RuntimeError(f"Original PDF missing or changed: {pdf}")
        raw = text_path.read_bytes()
        if sha256_bytes(raw) != item["extracted_text_sha256"]:
            raise RuntimeError(f"Page text missing or changed: {text_path}")
        pages = raw.decode("utf-8").split("\f")
        if len(pages) - (1 if pages and not pages[-1].strip() else 0) != item["page_count"]:
            raise RuntimeError(f"Page count mismatch for {text_path}")
        result[item["source_file"]] = pages
    return result


def source_hits(indexed_pages: list[tuple[str, str]], code: str, title: str) -> list[dict[str, Any]]:
    code_key = compact(code)
    title_key = fold(title)
    hits = []
    for page_no, (page_compact, page_fold) in enumerate(indexed_pages, start=1):
        code_hit = bool(code_key and code_key in page_compact)
        title_hit = bool(title_key and title_key in page_fold)
        if code_hit or title_hit:
            hits.append({"pdf_page_index": page_no, "code_hit": code_hit, "title_hit": title_hit})
    return hits


def source_title_candidate_pages(indexed_pages: list[tuple[str, str]], title: str) -> list[int]:
    """Find pages containing all nontrivial title tokens, allowing a final truncation."""
    tokens = [token for token in fold(title).split() if len(token) >= 3]
    if not tokens:
        return []
    found = []
    for page_no, (_, page_fold) in enumerate(indexed_pages, start=1):
        page_tokens = set(page_fold.split())
        matched = sum(any(word.startswith(token) for word in page_tokens) for token in tokens)
        if matched == len(tokens):
            found.append(page_no)
    return found


def validate_groups_have_saved_preimages(groups: list[dict[str, Any]], checkpoint: dict[str, Any], checkpoint_name: str) -> None:
    """Reject only newly appearing keys; resolved keys may leave the queue."""
    saved = {str(item.get("key")) for item in checkpoint.get("current_duplicate_code_groups", [])}
    current = {
        f"{group['source_file']}::{group['programme']}::{group['code']}"
        for group in groups
    }
    missing = sorted(current - saved)
    if missing:
        raise RuntimeError(f"New duplicate-code groups lack saved preimages in {checkpoint_name}: {missing}")


def build_audit() -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    baseline = read_json(BASELINE)
    prior_dedupe = read_json(DEDUP_REPORT)
    manifest = read_json(MANIFEST)
    pages_by_file = verified_source_pages(manifest)
    source_indexes = {
        source_file: [(compact(page), fold(page)) for page in pages]
        for source_file, pages in pages_by_file.items()
    }
    detail_blocks_by_file = {
        source_file: source_detail_blocks(pages)
        for source_file, pages in pages_by_file.items()
    }
    groups, docs = load_current_groups()
    # Reconcile from the latest append-only extraction checkpoint rather than
    # pinning the review to the original 43 groups. Later source-backed detail
    # and duplicate repairs legitimately shrink that inventory. A newly
    # appearing group is still a hard stop because it lacks a saved preimage.
    residual_prefix = "ccmas_duplicate_code_extract_residual_2026-09-30_"
    residual_checkpoints = [
        p for p in AUDIT.glob(residual_prefix + "*.json")
        if p.stem.rsplit("_", 1)[-1].isdigit()
    ]
    if not residual_checkpoints:
        raise RuntimeError("No saved duplicate-code extraction residual checkpoint found")
    latest_residual = max(residual_checkpoints, key=lambda p: int(p.stem.rsplit("_", 1)[-1]))
    residual_report = read_json(latest_residual)
    validate_groups_have_saved_preimages(groups, residual_report, latest_residual.name)

    reviewed = []
    by_key: dict[str, dict[str, Any]] = {}
    for group in groups:
        member_reports = []
        for row in group["records"]:
            hits = source_hits(source_indexes[group["source_file"]], row.get("code"), row.get("title"))
            title_candidate_pages = source_title_candidate_pages(source_indexes[group["source_file"]], row.get("title"))
            detail_module = _DETAIL_PARSER
            matching_details = [
                block for block in detail_blocks_by_file[group["source_file"]]
                if detail_module.key_code(block.get("code")) == detail_module.key_code(row.get("code"))
                and detail_module.title_match(str(row.get("title") or ""), str(block.get("title") or "")) >= 0.98
            ]
            member_reports.append({
                "code": row.get("code"),
                "title": row.get("title"),
                "units": row.get("units"),
                "lh": row.get("lh"),
                "ph": row.get("ph"),
                "source_code_title_pages": [h["pdf_page_index"] for h in hits if h["code_hit"] and h["title_hit"]],
                "source_code_pages": [h["pdf_page_index"] for h in hits if h["code_hit"]],
                "source_title_pages": [h["pdf_page_index"] for h in hits if h["title_hit"]],
                "source_title_candidate_pages": title_candidate_pages,
                "source_detail_occurrences": [
                    {
                        "title": block.get("title"),
                        "pdf_page_start": block.get("page_start"),
                        "pdf_page_end": block.get("page_end"),
                        "previous_course": {"code": block.get("previous_code"), "title": block.get("previous_title")},
                        "next_course": {"code": block.get("next_code"), "title": block.get("next_title")},
                    }
                    for block in matching_details
                ],
                "source_record_hash": course_preimage(row),
            })
        key = f"{group['source_file']}::{group['programme']}::{group['code']}"
        same_code_title_members = [m for m in member_reports if m["source_code_title_pages"]]
        status = group_context_classification(member_reports)
        if len(same_code_title_members) == len(member_reports):
            if status.startswith("all_member_titles"):
                status = "all_member_titles_have_detail_blocks_but_same_code_variants_preserved"
        manual_status = {
            "administration_management.json::Information Resource Management::IRM 202": "confirmed_extraction_identity_mismatch_one_record",
            "agricultural_science.json::Horticulture and Landscape Management::HLM 303": "confirmed_extraction_identity_mismatch_one_record",
            "engineering.json::PETROLEUM ENGINEERING::GET 399": "confirmed_extra_misidentified_record",
        }
        if key in manual_status:
            status = manual_status[key]
        elif key == "administration_management.json::Hospitality and Tourism Management::TRM 408":
            status = "source_authored_reuse_across_published_options_preserve"
        item = {
            "key": key,
            "source_file": group["source_file"],
            "programme": group["programme"],
            "code": group["code"],
            "classification": status,
            "records": member_reports,
            "source_pdf": next(d["original_pdf"] for d in manifest["source_documents"] if d["source_file"] == group["source_file"]),
        }
        reviewed.append(item)
        by_key[key] = item

    repeated_inventory = read_json(REPEATED_OUTCOME_INVENTORY).get("candidates", {}).get("exact_duplicate_outcome_course_rows", [])
    current_repeats: dict[tuple[str, str, str], dict[str, Any]] = {}
    for source_file, doc in docs.items():
        for programme in doc.get("programmes", []):
            for course in programme.get("courses", []):
                outcomes = course.get("skills_learned") or []
                counts: dict[str, int] = defaultdict(int)
                originals: dict[str, str] = {}
                for outcome in outcomes:
                    norm = re.sub(r"\s+", " ", str(outcome)).strip()
                    counts[norm] += 1
                    originals.setdefault(norm, str(outcome))
                repeated = [{"outcome": originals[norm], "count": count} for norm, count in counts.items() if norm and count > 1]
                if repeated:
                    current_repeats[(source_file, str(programme.get("name") or ""), str(course.get("code") or ""))] = {
                        "source_file": source_file,
                        "programme": programme.get("name"),
                        "code": course.get("code"),
                        "title": course.get("title"),
                        "repeated_outcomes": repeated,
                    }
    old_repeat_keys = {
        (item.get("source_file"), item.get("programme"), item.get("code"))
        for item in repeated_inventory
    }
    if not old_repeat_keys.issubset(set(current_repeats)):
        raise RuntimeError(
            "A previously inventoried repeated-outcome target disappeared; "
            f"saved={len(old_repeat_keys)}, current={len(current_repeats)}. Reconcile before patching."
        )
    repeated_review = []
    for candidate in current_repeats.values():
        key = (candidate.get("source_file"), candidate.get("programme"), candidate.get("code"))
        disposition = REPEATED_OUTCOME_DISPOSITIONS.get(key)
        doc = docs.get(key[0])
        course_matches = []
        if doc:
            for programme in doc.get("programmes", []):
                if programme.get("name") == key[1]:
                    course_matches = [c for c in programme.get("courses", []) if c.get("code") == key[2]]
                    break
        if len(course_matches) != 1:
            raise RuntimeError(f"Repeated-outcome target drift or ambiguity: {key}, matches={len(course_matches)}")
        repeated_review.append({
            "key": "::".join(key),
            "title": candidate.get("title"),
            "repeated_outcomes": candidate.get("repeated_outcomes", []),
            "disposition": disposition or {"classification": "unresolved"},
            "record_hash": course_preimage(course_matches[0]),
        })

    repairs: list[dict[str, Any]] = []
    ir_group = by_key.get("administration_management.json::Information Resource Management::IRM 202")
    if ir_group:
        member = next((m for m in ir_group["records"] if m["title"] == IRM401_REPAIR["old_title"]), None)
        target_source_hits = source_hits(
            source_indexes[IRM401_REPAIR["source_file"]],
            IRM401_REPAIR["new_code"],
            IRM401_REPAIR["new_title"],
        )
        if member and member["source_title_candidate_pages"] and any(
            hit["code_hit"] and hit["title_hit"] for hit in target_source_hits
        ):
            # The detailed source heading explicitly assigns this title to IRM 401.
            repair = {
                "operation": "update_course_record",
                **IRM401_REPAIR,
                "target_code_title_source_pages": [hit["pdf_page_index"] for hit in target_source_hits if hit["code_hit"] and hit["title_hit"]],
                "expected_preimage_hash": member["source_record_hash"],
                "fields_to_set": {
                    "code": IRM401_REPAIR["new_code"],
                    "title": IRM401_REPAIR["new_title"],
                    "content_summary": IRM401_REPAIR["source_content"],
                    "skills_learned": IRM401_REPAIR["source_outcomes"],
                },
                "fields_intentionally_unchanged": ["units", "status", "lh", "ph"],
            }
            repairs.append(repair)

    hlm_group = by_key.get("agricultural_science.json::Horticulture and Landscape Management::HLM 303")
    if hlm_group:
        member = next((m for m in hlm_group["records"] if m["title"] == HLM309_REPAIR["old_title"]), None)
        target_hits = source_hits(
            source_indexes[HLM309_REPAIR["source_file"]],
            HLM309_REPAIR["new_code"],
            HLM309_REPAIR["new_title"],
        )
        if member and any(hit["code_hit"] and hit["title_hit"] for hit in target_hits):
            repairs.append({
                **HLM309_REPAIR,
                "target_code_title_source_pages": [hit["pdf_page_index"] for hit in target_hits if hit["code_hit"] and hit["title_hit"]],
                "expected_preimage_hash": member["source_record_hash"],
            })

    get_group = by_key.get("engineering.json::PETROLEUM ENGINEERING::GET 399")
    if get_group:
        member = next((m for m in get_group["records"] if m["title"] == GET399_FALSE_DUPLICATE["title"]), None)
        programme = next(p for p in docs["engineering.json"]["programmes"] if p.get("name") == GET399_FALSE_DUPLICATE["programme"])
        has_get299 = any(c.get("code") == "GET 299" and "SIWES I" in str(c.get("title")) for c in programme.get("courses", []))
        has_get399_ii = any(c.get("code") == "GET 399" and "SIWES II" in str(c.get("title")) for c in programme.get("courses", []))
        if member and has_get299 and has_get399_ii:
            repairs.append({
                **GET399_FALSE_DUPLICATE,
                "expected_preimage_hash": member["source_record_hash"],
                "required_sibling_records": ["GET 299 SIWES I", "GET 399 SIWES II"],
            })

    report = {
        "schema": "2026-09-30.ccmas-duplicate-code-source-review.v1",
        "generated_on": date.today().isoformat(),
        "status": "reviewed_source_matches_and_conflicts_checkpointed",
        "scope": {"within_package_duplicate_code_groups": len(reviewed), "repeated_outcome_course_rows": len(repeated_review)},
        "supersedes_checkpoint": "ccmas_duplicate_code_source_review_checkpoint_2026-09-30_005.json",
        "residual_preimage_checkpoint": latest_residual.name,
        "source_integrity": "all_original_pdf_and_extracted_page_text_hashes_verified",
        "counts": {
            "groups_with_code_and_title_source_hits_for_every_member": sum(
                all(member.get("source_code_title_pages") for member in group["records"])
                for group in reviewed
            ),
            "source_authored_option_reuse_groups_preserved": sum(x["classification"] == "source_authored_reuse_across_published_options_preserve" for x in reviewed),
            "confirmed_identity_mismatch_groups": sum(x["classification"] in {"confirmed_extraction_identity_mismatch_one_record", "confirmed_extra_misidentified_record"} for x in reviewed),
            "groups_requiring_source_context_adjudication": len(reviewed),
            "groups_with_detail_blocks_for_every_member_title": sum(
                all(member.get("source_detail_occurrences") for member in group["records"])
                for group in reviewed
            ),
            "groups_with_at_least_one_table_only_member_title": sum(
                any(not member.get("source_detail_occurrences") for member in group["records"])
                for group in reviewed
            ),
            "source_proven_package_repairs_prepared": len(repairs),
            "source_proven_package_record_removals_prepared": sum(x.get("operation") == "remove_misidentified_duplicate_record" for x in repairs),
            "repeated_outcome_cases_preserved_as_source_authored_or_source_published": sum(x["disposition"]["classification"] != "unresolved" for x in repeated_review),
            "repeated_outcome_cases_changed": 0,
            "new_repeated_outcome_cases_since_saved_inventory": len(set(current_repeats) - old_repeat_keys),
        },
        "duplicate_code_groups": reviewed,
        "repeated_outcomes": repeated_review,
        "newly_detected_repeated_outcome_keys": ["::".join(key) for key in sorted(set(current_repeats) - old_repeat_keys)],
        "repairs": repairs,
        "limits": [
            "A code/title hit proves source occurrence, not by itself that duplicate rows are correct within a specific package.",
            "Workload conflicts between course tables and detail blocks remain unresolved and are not auto-repaired.",
            "No CCMAS package JSON is edited by the default run.",
            "The prepared package patch is intentionally separate from JAMB scopes, SQL, UI, and downstream mappings.",
        ],
    }
    return report, docs


def next_checkpoint_path() -> Path:
    prefix = "ccmas_duplicate_code_source_review_checkpoint_2026-09-30_"
    existing = [p for p in AUDIT.glob(prefix + "*.json")]
    seqs = [int(p.stem.rsplit("_", 1)[-1]) for p in existing if p.stem.rsplit("_", 1)[-1].isdigit()]
    return AUDIT / f"{prefix}{max(seqs, default=0) + 1:03d}.json"


def apply_prepared_repair(doc: dict[str, Any], repair: dict[str, Any]) -> bool:
    target_programmes = [p for p in doc.get("programmes", []) if p.get("name") == repair["programme"]]
    if len(target_programmes) != 1:
        raise RuntimeError("Guard failed: programme identity is not unique")
    courses = target_programmes[0].get("courses", [])
    if repair.get("operation") == "remove_misidentified_duplicate_record":
        matches = [c for c in courses if c.get("code") == repair["code"] and c.get("title") == repair["title"]]
        if not matches:
            siblings_ok = all(
                any(c.get("code") == expected.split()[0] + " " + expected.split()[1] and expected.split()[2] in str(c.get("title")) for c in courses)
                for expected in repair.get("required_sibling_records", [])
            )
            if siblings_ok:
                return False
        if len(matches) != 1:
            raise RuntimeError("Guard failed: exact duplicate candidate is not unique")
        if course_preimage(matches[0]) != repair["expected_preimage_hash"]:
            raise RuntimeError("Guard failed: duplicate candidate changed since checkpoint; regenerate and review patch")
        for expected in repair.get("required_sibling_records", []):
            code, title = expected.split(" ", 2)[0:2], expected.split(" ", 2)[2]
            code_text = " ".join(code)
            if not any(c.get("code") == code_text and title in str(c.get("title")) for c in courses):
                raise RuntimeError(f"Guard failed: required source sibling is missing: {expected}")
        courses.remove(matches[0])
        return True

    matches = [c for c in courses if c.get("code") == repair["old_code"] and c.get("title") == repair["old_title"]]
    if not matches:
        already = [c for c in target_programmes[0].get("courses", []) if c.get("code") == repair["new_code"] and c.get("title") == repair["new_title"]]
        if len(already) == 1 and all(already[0].get(field) == value for field, value in repair["fields_to_set"].items()):
            return False
    if len(matches) != 1:
        raise RuntimeError("Guard failed: exact source row is not unique")
    course = matches[0]
    if course_preimage(course) != repair["expected_preimage_hash"]:
        raise RuntimeError("Guard failed: source row changed since checkpoint; regenerate and review patch")
    for field, value in repair["fields_to_set"].items():
        course[field] = value
    return True


def write_outputs(report: dict[str, Any]) -> None:
    # Keep a previously reviewed patch intact when this refreshed pass has no
    # new source-proven operations to apply.
    if report["repairs"]:
        PATCH_PATH.write_text(json.dumps({"schema": "2026-09-30.ccmas-duplicate-code-guarded-patch.v1", "repairs": report["repairs"]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = next_checkpoint_path()
    checkpoint.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# CCMAS duplicate-code and repeated-outcome source review — 2026-09-30",
        "",
        f"Checkpoint: `{checkpoint.name}`. Status: **{report['status']}**.",
        "",
        f"- Duplicate-code groups inspected: **{report['scope']['within_package_duplicate_code_groups']}**",
        f"- Groups with detailed source blocks for every member title: **{report['counts']['groups_with_detail_blocks_for_every_member_title']}**",
        f"- Groups with at least one table-only member title: **{report['counts']['groups_with_at_least_one_table_only_member_title']}**",
        f"- Groups still requiring offering/context adjudication: **{report['counts']['groups_requiring_source_context_adjudication']}**",
        f"- Repeated-outcome records inspected: **{report['scope']['repeated_outcome_course_rows']}**",
        f"- Source-proven package patches prepared: **{report['counts']['source_proven_package_repairs_prepared']}**",
        f"- Source-proven duplicate-record removals prepared: **{report['counts']['source_proven_package_record_removals_prepared']}**",
        f"- Repeated-outcome changes: **{report['counts']['repeated_outcome_cases_changed']}**",
        "",
        "## Prepared, not applied",
        "",
        f"Guarded patch: `{PATCH_PATH.name}`. The default run never edits package JSON. Apply only after the full summary/outcome reconciliation is complete.",
        "",
        "## Repeated outcomes",
        "",
    ]
    for row in report["repeated_outcomes"]:
        md.append(f"- `{row['key']}` — **{row['disposition']['classification']}**; {row['disposition']['note']}")
    md += ["", "## Duplicate-code groups", ""]
    for row in report["duplicate_code_groups"]:
        md.append(f"- `{row['key']}` — **{row['classification']}**; source member rows: {len(row['records'])}.")
    md += ["", "## Prepared repair operations", ""]
    for repair in report["repairs"]:
        md.append(f"- `{repair['source_file']}::{repair['programme']}::{repair.get('old_code', repair.get('code'))}` — `{repair['operation']}`; {repair.get('source_locator', '')}")
    md += ["", "The JSON checkpoint contains page-index hits, record preimage hashes, and source paths for every group.", ""]
    checkpoint.with_suffix(".md").write_text("\n".join(md), encoding="utf-8")

def next_apply_checkpoint_path() -> Path:
    prefix = "ccmas_duplicate_code_source_apply_checkpoint_2026-09-30_"
    existing = list(AUDIT.glob(prefix + "*.json"))
    seqs = [int(p.stem.rsplit("_", 1)[-1]) for p in existing if p.stem.rsplit("_", 1)[-1].isdigit()]
    return AUDIT / f"{prefix}{max(seqs, default=0) + 1:03d}.json"


def apply_patch_file() -> dict[str, Any]:
    patch = read_json(PATCH_PATH)
    if patch.get("schema") != "2026-09-30.ccmas-duplicate-code-guarded-patch.v1":
        raise RuntimeError("Unsupported patch schema")
    docs: dict[str, dict[str, Any]] = {}
    changed: dict[str, bool] = defaultdict(bool)
    events = []
    for repair in patch.get("repairs", []):
        source_file = repair["source_file"]
        docs.setdefault(source_file, read_json(CCMAS_DIR / source_file))
        did_change = apply_prepared_repair(docs[source_file], repair)
        changed[source_file] = changed[source_file] or did_change
        events.append({"source_file": source_file, "programme": repair["programme"], "operation": repair["operation"], "result": "applied" if did_change else "already_applied"})
    for source_file, doc in docs.items():
        if changed[source_file]:
            (CCMAS_DIR / source_file).write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    result = {
        "schema": "2026-09-30.ccmas-duplicate-code-source-apply-checkpoint.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply",
        "status": "applied_or_already_applied",
        "files_changed": sorted(source_file for source_file, did_change in changed.items() if did_change),
        "events": events,
    }
    checkpoint = next_apply_checkpoint_path()
    checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint.with_suffix(".md").write_text(
        "\n".join([
            "# CCMAS duplicate-code patch application checkpoint — 2026-09-30",
            "",
            f"Status: **{result['status']}**",
            f"Files changed: **{', '.join(result['files_changed']) if result['files_changed'] else 'none (already applied)'}**",
            "",
            *[f"- `{event['source_file']}::{event['programme']}` — `{event['operation']}`: **{event['result']}**" for event in events],
            "",
        ]),
        encoding="utf-8",
    )
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply the guarded CCMAS package patch; only after the reconciliation lane is complete.")
    args = parser.parse_args()
    if args.apply:
        result = apply_patch_file()
        print(json.dumps({"mode": result["mode"], "status": result["status"], "files_changed": result["files_changed"], "events": result["events"]}, indent=2))
        return
    report, docs = build_audit()
    write_outputs(report)
    print(json.dumps({"patch": str(PATCH_PATH), "counts": report["counts"], "status": report["status"], "mode": "apply" if args.apply else "prepare_only"}, indent=2))


if __name__ == "__main__":
    main()
