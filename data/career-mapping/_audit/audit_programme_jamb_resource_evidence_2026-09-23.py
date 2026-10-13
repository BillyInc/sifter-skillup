#!/usr/bin/env python3
"""Create append-only programme/JAMB resource-evidence audit ledgers.

This is an audit/report generator only. It does not modify catalogue inputs,
SQL, seed transport, frontend/backend code, or live data. Existing evidence is
copied into new dated batch ledgers and review-required states are preserved.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
from datetime import date
from pathlib import Path
from typing import Any, Iterable


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CCMAS_DIR = ROOT / "data" / "career-mapping" / "ccmas"
INHERITANCE = HERE / "ccmas_jamb_inheritance_audit_2026-08-17.json"
COMPLEMENTS = HERE / "ccmas_external_domain_complements_2026-09-01.json"
BUILDER = ROOT / "data" / "career-mapping" / "_build_programme_guidance_catalog.py"
OUT_PREFIX = "programme_jamb_resource_evidence_2026-09-23"
ACCESS_DATE = "2026-09-23"
NUC_URL = "https://www.nuc.edu.ng/ccmas/"
JAMB_URL = "https://eligibility.jamb.gov.ng/"
BATCH_SIZE = 20


def load_builder_constants() -> tuple[dict[str, str], dict[str, dict[str, str]]]:
    spec = importlib.util.spec_from_file_location("programme_guidance_builder", BUILDER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {BUILDER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.ORIGINAL_PDF_BY_JSON, module.REFERENCE_BY_DISCIPLINE


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "item"


def compact_text(value: Any, limit: int = 800) -> str:
    text = "" if value is None else str(value).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def source_file_name(path: Path) -> str:
    return path.name


def programme_rows() -> list[dict[str, Any]]:
    original_pdfs, references = load_builder_constants()
    rows: list[dict[str, Any]] = []
    for source in sorted(CCMAS_DIR.glob("*.json")):
        data = json.loads(source.read_text(encoding="utf-8"))
        discipline = str(data.get("discipline", "")).strip()
        original_pdf = original_pdfs[source.name]
        reference = references[discipline]
        for programme in data.get("programmes", []):
            name = str(programme.get("name", "")).strip()
            key = f"{discipline}::{name}"
            course_codes = [
                str(course.get("code", "")).strip()
                for course in programme.get("courses", [])
                if str(course.get("code", "")).strip()
            ]
            source_locator = (
                f"NUC CCMAS hub discipline link for {discipline}; downloadable source "
                f"{original_pdf}; programme section {name}; local parsed source "
                f"ccmas/{source_file_name(source)}; {len(course_codes)} course rows."
            )
            open_locator = (
                f"Foundation reference landing/intro for {discipline}; catalogue title "
                f"{reference['title']}; suitability is bounded to the recorded "
                f"programme topics and is not a prescribed-reading claim."
            )
            rows.append(
                {
                    "schema": "2026-09-23.programme-resource-evidence.v1",
                    "subject_id": f"programme-resource|{slug(key)}",
                    "subject_kind": "programme_resource_review",
                    "programme": {
                        "key": key,
                        "discipline": discipline,
                        "name": name,
                        "code": programme.get("code"),
                        "qualification": programme.get("qualification"),
                    },
                    "searched_at": f"{ACCESS_DATE}T00:00:00+01:00",
                    "accessed_on": ACCESS_DATE,
                    "resource_row_ids": [
                        "nuc_ccmas",
                        "open_reference_" + slug(discipline),
                    ]
                    if name != "Sociology"
                    else ["nuc_ccmas"],
                    "candidate_urls": [NUC_URL, reference["url"]],
                    "evidence": [
                        {
                            "url": NUC_URL,
                            "authority": "National Universities Commission",
                            "locator": source_locator,
                            "accessed_on": ACCESS_DATE,
                            "link_role": "official_curriculum_source",
                            "confidence": "high",
                            "evidence_summary": (
                                "The official NUC CCMAS hub publishes the discipline "
                                "download route; the programme-specific course/outcome "
                                "locator is retained locally for audit."
                            ),
                        },
                        {
                            "url": reference["url"],
                            "authority": reference["provider"],
                            "locator": open_locator,
                            "accessed_on": ACCESS_DATE,
                            "link_role": "foundation_reference",
                            "confidence": "medium",
                            "evidence_summary": compact_text(reference["description"]),
                        },
                    ],
                    "decision": "review_required",
                    "decision_reason": (
                        "The CCMAS source is programme-specific through the retained "
                        "discipline PDF and local course locator, but the open reference "
                        "is discipline-level/foundation material rather than a reviewed "
                        "programme-specific reading list. Preserve staff review and do "
                        "not promote this resource package to students."
                    ),
                    "limitations": [
                        "The NUC hub is a discipline download page; the local PDF filename and programme section are the item-specific locator.",
                        "The open reference is not evidence that a Nigerian university prescribes the title.",
                        "Sociology remains governed by its separate reviewed programme-resource contract.",
                    ],
                    "student_exposure": "blocked_review_required",
                }
            )
    rows.sort(key=lambda row: row["programme"]["key"])
    return rows


def walk_source_candidates(value: Any, path: str = "") -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        if isinstance(value.get("url"), str) and value["url"].startswith("https://"):
            yield {
                "url": value["url"],
                "authority": value.get("authority") or value.get("provider") or value.get("source_kind"),
                "title": value.get("title") or value.get("name"),
                "locator": value.get("locator") or value.get("page") or value.get("section"),
                "accessed_on": value.get("accessed_on") or value.get("access_date"),
                "source_path": path or None,
            }
        for key, child in value.items():
            yield from walk_source_candidates(child, f"{path}.{key}" if path else key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_source_candidates(child, f"{path}[{index}]")


def compact_course_evidence(value: dict[str, Any]) -> dict[str, Any]:
    result = {
        "source_kind": value.get("source_kind"),
        "discipline": value.get("discipline"),
        "programme_name": value.get("programme_name"),
        "ccmas_code": value.get("ccmas_code"),
        "course_anchor_quality": value.get("course_anchor_quality"),
        "course_anchor_count": value.get("course_anchor_count"),
        "matched_course_count": value.get("matched_course_count"),
        "source_file": value.get("source_file"),
    }
    matched = []
    for course in value.get("matched_courses") or []:
        matched.append(
            {
                "level": course.get("level"),
                "code": course.get("code"),
                "title": course.get("title"),
                "record_match": course.get("record_match"),
                "matched_anchors": course.get("matched_anchors"),
            }
        )
    result["matched_courses"] = matched
    return result


def jamb_rows() -> list[dict[str, Any]]:
    inheritance = json.loads(INHERITANCE.read_text(encoding="utf-8"))
    complements = json.loads(COMPLEMENTS.read_text(encoding="utf-8"))
    review_names = {
        row["jamb_name"]
        for row in inheritance["domain_alignment_audit"]["rows"]
        if row.get("status") == "external_domain_provenance_required"
    }
    complement_by_name: dict[str, list[dict[str, Any]]] = {}
    for row in complements.get("rows", []):
        complement_by_name.setdefault(row.get("jamb_name", ""), []).append(row)

    rows: list[dict[str, Any]] = []
    for name in sorted(review_names):
        links: list[dict[str, Any]] = []
        for complement in complement_by_name.get(name, []):
            for link in complement.get("links", []):
                sources = []
                seen = set()
                for candidate in walk_source_candidates(link):
                    key = (candidate.get("url"), candidate.get("locator"), candidate.get("source_path"))
                    if key not in seen:
                        seen.add(key)
                        sources.append(candidate)
                nigerian = link.get("nigerian_curriculum_evidence") or {}
                links.append(
                    {
                        "component_ref": link.get("component_ref"),
                        "domain_id": link.get("domain_id"),
                        "domain_name": link.get("domain_name"),
                        "match_type": link.get("match_type"),
                        "ccmas_evidence": {
                            "record_found": (link.get("ccmas_evidence") or {}).get("record_found"),
                            "course_anchor_quality": (link.get("ccmas_evidence") or {}).get("course_anchor_quality"),
                            "course_anchor_count": (link.get("ccmas_evidence") or {}).get("course_anchor_count"),
                        },
                        "nigerian_curriculum_evidence": compact_course_evidence(nigerian),
                        "external_source_candidates": sources,
                        "source_access_date_state": (
                            "retained_from_prior_artifact"
                            if any(item.get("accessed_on") for item in sources)
                            else "missing_in_prior_artifact"
                        ),
                    }
                )
        links.sort(key=lambda link: (link.get("component_ref") or "", link.get("domain_id") or ""))
        rows.append(
            {
                "schema": "2026-09-23.jamb-resource-evidence.v1",
                "subject_id": f"jamb-resource|{slug(name)}",
                "subject_kind": "jamb_identity_resource_review",
                "jamb_name": name,
                "searched_at": f"{ACCESS_DATE}T00:00:00+01:00",
                "accessed_on": ACCESS_DATE,
                "identity_authority": {
                    "url": JAMB_URL,
                    "authority": "Joint Admissions and Matriculation Board",
                    "locator": f"IBASS programme selector; exact catalogue identity `{name}`.",
                    "accessed_on": ACCESS_DATE,
                    "link_role": "official_identity_context",
                },
                "link_count": len(links),
                "links": links,
                "decision": "review_required",
                "decision_reason": (
                    "The canonical inheritance audit marks this identity "
                    "external_domain_provenance_required. Existing Nigerian CCMAS "
                    "course anchors and external domain sources are retained, but the "
                    "programme-fit/domain gate is not closed. Do not promote the mapping."
                ),
                "student_exposure": "blocked_review_required",
            }
        )
    return rows


def write_new(path: Path, text: str) -> None:
    if path.exists():
        raise FileExistsError(f"Append-only output already exists: {path}")
    path.write_text(text, encoding="utf-8", newline="\n")


def write_batches(rows: list[dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    outputs = []
    for start in range(0, len(rows), BATCH_SIZE):
        batch_no = start // BATCH_SIZE + 1
        batch_rows = rows[start : start + BATCH_SIZE]
        path = HERE / f"{prefix}_batch-{batch_no:03d}.jsonl"
        content = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in batch_rows)
        write_new(path, content)
        outputs.append(
            {
                "file": path.name,
                "row_start": start,
                "row_count": len(batch_rows),
                "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
            }
        )
    return outputs


def main() -> None:
    programmes = programme_rows()
    jamb = jamb_rows()
    if len(programmes) != 237:
        raise AssertionError(f"Expected 237 programme rows, found {len(programmes)}")
    if len(jamb) != 86:
        raise AssertionError(f"Expected 86 JAMB rows, found {len(jamb)}")

    programme_batches = write_batches(programmes, OUT_PREFIX + "_programme")
    jamb_batches = write_batches(jamb, OUT_PREFIX + "_jamb")
    manifest = {
        "schema": "2026-09-23.programme-jamb-resource-evidence-manifest.v1",
        "generated_on": ACCESS_DATE,
        "append_only": True,
        "scope": {
            "programme_reviews": len(programmes),
            "jamb_identities": 420,
            "jamb_review_required_identities": len(jamb),
            "jamb_review_link_occurrences": sum(row["link_count"] for row in jamb),
        },
        "authorities": [
            {
                "authority": "National Universities Commission",
                "url": NUC_URL,
                "locator": "CCMAS page discipline download links; programme and local PDF locators are retained per row.",
                "accessed_on": ACCESS_DATE,
            },
            {
                "authority": "Joint Admissions and Matriculation Board",
                "url": JAMB_URL,
                "locator": "IBASS programme selector and eligibility checker.",
                "accessed_on": ACCESS_DATE,
            },
        ],
        "programme_batches": programme_batches,
        "jamb_batches": jamb_batches,
        "decisions": {
            "programme_review_required": len(programmes),
            "jamb_review_required": len(jamb),
            "promoted": 0,
            "genuinely_unavailable": 0,
        },
        "boundaries": {
            "sql_applied": False,
            "implementation_changed": False,
            "live_deployment_claim": False,
        },
    }
    manifest_path = HERE / f"{OUT_PREFIX}_manifest.json"
    write_new(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

    report_path = HERE / f"{OUT_PREFIX}_report.md"
    report = f"""# Programme/JAMB resource-evidence audit report — {ACCESS_DATE}

Append-only local audit artifact. No SQL, seed transport, frontend/backend
implementation, or live deployment was changed.

## Counts

- Programme resource reviews: **{len(programmes)}/237**.
- Canonical JAMB identities: **420**.
- Review-required JAMB identities: **{len(jamb)}/86**.
- Review-required JAMB/domain link occurrences represented: **{sum(row['link_count'] for row in jamb)}**.
- Promotions: **0**.
- Genuinely unavailable decisions: **0**.

## Decision policy

All 237 programme resource packages remain `review_required`. Each row keeps an
official NUC CCMAS URL and programme-specific local PDF/course locator, plus the
current discipline-level open foundation reference and its locator. The open
reference is not treated as a prescribed reading list.

All 86 JAMB identities remain `review_required`. Each row keeps the official
JAMB IBASS identity locator plus every retained component/domain evidence
occurrence from the prior CCMAS external-complement artifact. Existing source
URLs, locators and access dates are preserved where present; missing prior
access dates are explicitly marked rather than invented.

The ledger is evidence for staff review only. It does not close the
programme-fit/domain gate and does not authorize student exposure.

## Outputs

- Programme JSONL batches: `{OUT_PREFIX}_programme_batch-*.jsonl`
- JAMB JSONL batches: `{OUT_PREFIX}_jamb_batch-*.jsonl`
- Machine-readable manifest: `{OUT_PREFIX}_manifest.json`

## Authority boundary

- NUC CCMAS: {NUC_URL} (accessed {ACCESS_DATE}).
- JAMB IBASS: {JAMB_URL} (accessed {ACCESS_DATE}).

## Deferred work

Human review of programme-specific resource suitability and the 86 JAMB/domain
gates remains open. SQL application, generated-seed changes, implementation
changes, live payload verification and browser acceptance remain deferred.
"""
    write_new(report_path, report)
    print(json.dumps({"programme_rows": len(programmes), "jamb_rows": len(jamb), "jamb_links": sum(row["link_count"] for row in jamb), "manifest": str(manifest_path), "report": str(report_path)}, indent=2))


if __name__ == "__main__":
    main()
