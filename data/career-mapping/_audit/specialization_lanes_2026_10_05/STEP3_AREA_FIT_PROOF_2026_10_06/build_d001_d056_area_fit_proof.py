"""Build direct area-of-specialization fit proof for D001-D056.

This is an append-only evidence artifact.  It consumes the finalized global
Step 1 area set and the source records already attached to the Step 1 reviews;
it does not edit the canonical taxonomy, roles, or Nigerian-context data.

The important distinction is intentional: a cited source can prove that an
area is a coherent disciplinary/practice branch inside its parent.  It does
not, by itself, prove a universal taxonomy, a universal area count, or any
role assignment.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import OrderedDict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
LANE_ROOT = ROOT / "data/career-mapping/_audit/specialization_lanes_2026_10_05"
STEP1 = LANE_ROOT / "STEP1_RECONCILIATION_2026_10_06"
OUT = LANE_ROOT / "STEP3_AREA_FIT_PROOF_2026_10_06" / "D001_D056"

GLOBAL_REGISTER = STEP1 / "global_step1_specialization_reconciliation_2026_10_06.json"
D001_D028_REGISTER = (
    STEP1
    / "AGENT_LOCAL_D001_D028"
    / "STEP1_D001_D028_RECONCILIATION_2026_10_06"
    / "d001_d028_adjudication_register_2026_10_06.json"
)
D029_D056_REGISTER = STEP1 / "AGENT_LOCAL_D029_D056" / "d029_d056_specialization_adjudication_2026_10_06.json"
LOCAL_REGISTER = STEP1 / "LOCAL_D001_D056" / "d001_d056_step1_reconciliation_register_2026_10_06.json"
D003_D084 = LANE_ROOT / "D003_D084"
D053_D056_REVIEW = D003_D084 / "D053_D056_global_specialization_review_2026_10_06.json"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", unicodedata.normalize("NFKD", value or "").lower())


def area_list(record: dict[str, Any]) -> list[dict[str, Any]]:
    return (
        record.get("recommended_areas")
        or record.get("final_student_facing_areas")
        or record.get("candidate_specializations")
        or record.get("candidate_subject_fields")
        or []
    )


def source_rows(record: dict[str, Any]) -> list[dict[str, Any]]:
    return record.get("sources") or record.get("source_register") or record.get("supporting_sources") or []


def normalize_source(source: dict[str, Any], *, artifact: str) -> dict[str, Any]:
    limitation = (
        source.get("limitation")
        or source.get("limits")
        or source.get("claim_limit")
        or source.get("does_not_support")
        or source.get("limit")
    )
    return {
        "source_id": source.get("source_id") or source.get("id"),
        "publisher": source.get("publisher"),
        "title": source.get("title"),
        "url": source.get("url"),
        "locator": source.get("locator"),
        "supported_claim": source.get("supports") or source.get("supported_claim"),
        "limitation": limitation,
        "access_date": source.get("access_date"),
        "source_artifact_locator": source.get("source_artifact_locator") or artifact,
    }


def assert_source(source: dict[str, Any], context: str) -> None:
    required = ("source_id", "publisher", "title", "url", "locator", "supported_claim", "limitation")
    missing = [key for key in required if not source.get(key)]
    if missing:
        raise ValueError(f"{context}: source missing {missing}")


def build_source_catalog() -> tuple[dict[str, dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    catalog: dict[str, dict[str, Any]] = {}
    by_domain: dict[str, list[dict[str, Any]]] = {}

    # The D001-D028 agent register has per-area source_ids and complete rows.
    early = load(D001_D028_REGISTER)
    for record in early["records"]:
        rows = []
        for raw in source_rows(record):
            row = normalize_source(
                raw,
                artifact=f"{D001_D028_REGISTER.relative_to(ROOT)}#records[{record['domain_id']}].sources",
            )
            assert_source(row, record["domain_id"])
            catalog[row["source_id"]] = row
            rows.append(row)
        by_domain[record["domain_id"]] = rows

    # The D029-D056 agent register owns the reconciled area labels and, for
    # D053-D056, repairs locator omissions from the compact global review.
    late_agent = load(D029_D056_REGISTER)
    late_agent_records = {record["domain_id"]: record for record in late_agent["records"]}

    # The D029-D056 agent register owns the reconciled area labels.  The
    # original domain review artifacts own the explicit area->source_ids map.
    late = load(D029_D056_REGISTER)
    late_records = {record["domain_id"]: record for record in late["records"]}
    for domain_number in range(29, 57):
        domain_id = f"D{domain_number:03d}"
        review_path = D053_D056_REVIEW if domain_number >= 53 else D003_D084 / f"{domain_id}_specialization_review.json"
        review = load(review_path)
        if domain_id in late_agent_records and source_rows(late_agent_records[domain_id]):
            raw_sources = source_rows(late_agent_records[domain_id])
        elif domain_number >= 53:
            raw_sources = [dict(value, source_id=key) for key, value in review.get("sources", {}).items()]
            candidate_areas = next(x for x in review["domains"] if x["domain_id"] == domain_id).get("candidate_specializations", [])
        elif domain_id == "D041":
            raw_sources = review.get("sources", [])
            candidate_areas = review.get("candidate_subject_fields", [])
        else:
            raw_sources = review.get("source_register", [])
            candidate_areas = review.get("candidate_specializations", [])
        rows = []
        for raw in raw_sources:
            row = normalize_source(raw, artifact=f"{review_path.relative_to(ROOT)}#sources")
            assert_source(row, domain_id)
            catalog[row["source_id"]] = row
            rows.append(row)
        by_domain[domain_id] = rows

        # Keep the explicit crosswalk available to the builder.  The final
        # area labels normally match these candidate rows exactly.  D041 uses
        # subject fields; its source basis is resolved explicitly below.
        if domain_id == "D041":
            for candidate in candidate_areas:
                candidate.setdefault("source_ids", ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"])
    return catalog, by_domain


def explicit_area_source_ids(domain_id: str, area: dict[str, Any], candidates: list[dict[str, Any]]) -> list[str]:
    label = area.get("label") or area.get("name")
    matched = next((candidate for candidate in candidates if norm(candidate.get("label")) == norm(label)), None)
    if matched and matched.get("source_ids"):
        return list(dict.fromkeys(matched["source_ids"]))

    # These are deliberate reconciliations where the final Step 1 wording
    # changed a label or removed an over-split candidate.  They are not
    # keyword-derived evidence.
    overrides: dict[tuple[str, str], list[str]] = {
        ("D041", "Mathematical and Statistical Sciences"): ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"],
        ("D041", "Computer and Information Sciences Research"): ["OECD_FRASCATI_2015"],
        ("D041", "Physical Sciences Research"): ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"],
        ("D041", "Chemical Sciences Research"): ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"],
        ("D041", "Earth and Environmental Sciences Research"): ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"],
        ("D041", "Biological Sciences Research"): ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"],
        ("D055", "Process Safety and Risk Engineering"): ["AICHE_DIVISIONS", "ICHEME_SIGS"],
    }
    if (domain_id, label) in overrides:
        return overrides[(domain_id, label)]
    raise ValueError(f"No direct source crosswalk for {domain_id}: {label}")


def load_area_sources(domain_id: str, final_record: dict[str, Any], catalog: dict[str, dict[str, Any]], by_domain: dict[str, list[dict[str, Any]]], late_records: dict[str, dict[str, Any]], early_records: dict[str, dict[str, Any]]) -> dict[str, list[str]]:
    if domain_id in early_records:
        return {
            (area.get("label") or area.get("name")): list(area.get("source_ids") or [])
            for area in area_list(early_records[domain_id])
        }
    candidates = late_records[domain_id].get("_source_crosswalk_candidates", [])
    return {
        (area.get("label") or area.get("name")): explicit_area_source_ids(domain_id, area, candidates)
        for area in area_list(final_record)
    }


def source_proof_record(domain_id: str, domain_name: str, area: dict[str, Any], source_ids: list[str], catalog: dict[str, dict[str, Any]]) -> dict[str, Any]:
    label = area.get("label") or area.get("name")
    boundary = area.get("boundary") or area.get("scope") or ""
    if not boundary:
        raise ValueError(f"{domain_id} {label}: missing area boundary")
    sources = []
    for source_id in source_ids:
        if source_id not in catalog:
            raise ValueError(f"{domain_id} {label}: unknown source {source_id}")
        sources.append(catalog[source_id])
    if not sources:
        raise ValueError(f"{domain_id} {label}: no direct-fit source IDs")
    supported_claims = [source["supported_claim"] for source in sources]
    limitations = list(dict.fromkeys(source["limitation"] for source in sources if source.get("limitation")))
    return {
        "domain_id": domain_id,
        "domain_name": domain_name,
        "area_label": label,
        "area_boundary": boundary,
        "fit_disposition": "direct_fit_supported_with_bounded_claim",
        "proof_basis": "The cited authoritative source record explicitly names or defines the disciplinary/practice field, or the relevant standard/framework work area, and the area boundary is limited to that field. The source supports parent-domain coherence, not a universal taxonomy or role membership.",
        "sources": sources,
        "supported_claims": supported_claims,
        "limitations": limitations,
        "not_proven_by_this_record": [
            "a universal global area count or mandatory subgroup taxonomy",
            "role-to-domain or role-to-area fit",
            "Nigerian regulatory, licensing, demand or labour-market context",
        ],
        "role_fit_audit": "deferred_to_later_role_task",
        "nigerian_context": "not_started",
        "canonical_taxonomy_edited": False,
    }


def markdown(records: list[dict[str, Any]], *, batch_name: str, source_record_count: int) -> str:
    domains = sorted({r["domain_id"] for r in records})
    lines = [
        f"# Direct area-fit proof checkpoint — {batch_name}",
        "",
        "Scope: direct proof that each recommended area is a coherent practice/learning branch within its parent domain.",
        "Role fit, ISCO membership, Nigerian enrichment, and canonical taxonomy edits are explicitly excluded.",
        "",
        "## Exact coverage",
        "",
        f"- Domains covered: **{len(domains)}** ({', '.join(domains)})",
        f"- Recommended areas with proof records: **{len(records)}**",
        f"- Unique source records: **{source_record_count}**",
        "- Every proof record has URL, title, locator, supported claim, limitation, and disposition.",
        "",
        "## Per-area proof",
        "",
    ]
    for record in records:
        lines.extend([f"### {record['domain_id']} — {record['domain_name']} — {record['area_label']}", "", f"- Disposition: `{record['fit_disposition']}`", f"- Boundary: {record['area_boundary']}", f"- Proof basis: {record['proof_basis']}"])
        for source in record["sources"]:
            lines.extend([
                "",
                f"- Source: [{source['title']}]({source['url']}) — {source['publisher']}",
                f"  - Locator: {source['locator']}",
                f"  - Supported claim: {source['supported_claim']}",
                f"  - Limitation: {source['limitation']}",
            ])
        lines.append("")
    return "\n".join(lines)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-size", type=int, default=14)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    global_register = load(GLOBAL_REGISTER)
    final_records = {
        record["domain_id"]: record
        for record in global_register["domains"]
        if 1 <= int(record["domain_id"][1:]) <= 56
    }
    if len(final_records) != 56:
        raise ValueError(f"Expected 56 finalized domains, found {len(final_records)}")

    catalog, by_domain = build_source_catalog()
    early_records = {record["domain_id"]: record for record in load(D001_D028_REGISTER)["records"]}
    late_records = {record["domain_id"]: record for record in load(D029_D056_REGISTER)["records"]}
    # Add the explicit late crosswalk candidates back after loading the JSON.
    for domain_number in range(29, 57):
        domain_id = f"D{domain_number:03d}"
        review_path = D053_D056_REVIEW if domain_number >= 53 else D003_D084 / f"{domain_id}_specialization_review.json"
        review = load(review_path)
        if domain_number >= 53:
            candidates = next(x for x in review["domains"] if x["domain_id"] == domain_id).get("candidate_specializations", [])
        elif domain_id == "D041":
            candidates = review.get("candidate_subject_fields", [])
            for candidate in candidates:
                candidate.setdefault("source_ids", ["OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"])
        else:
            candidates = review.get("candidate_specializations", [])
        late_records.setdefault(domain_id, {})["_source_crosswalk_candidates"] = candidates

    ordered_ids = [f"D{i:03d}" for i in range(1, 57)]
    all_records: list[dict[str, Any]] = []
    for domain_id in ordered_ids:
        final = final_records[domain_id]
        source_map = load_area_sources(domain_id, final, catalog, by_domain, late_records, early_records)
        for area in area_list(final):
            label = area.get("label") or area.get("name")
            all_records.append(source_proof_record(domain_id, final["domain_name"], area, source_map[label], catalog))

    # Write deterministic batches.  Each batch is independently valid and
    # records exact domain IDs/area counts/source counts.
    for start in range(0, len(ordered_ids), args.batch_size):
        batch_ids = ordered_ids[start : start + args.batch_size]
        batch_records = [record for record in all_records if record["domain_id"] in batch_ids]
        batch_sources = {source["source_id"] for record in batch_records for source in record["sources"]}
        batch_no = start // args.batch_size + 1
        name = f"batch_{batch_no:02d}_{batch_ids[0]}_{batch_ids[-1]}"
        payload = {
            "schema_version": "2026-10-06.direct-area-fit-proof.v1",
            "append_only": True,
            "batch": name,
            "generated_on": str(date.today()),
            "scope": "D001-D056 finalized global Step 1 recommendations; direct area fit only",
            "domains": batch_ids,
            "domain_count": len(batch_ids),
            "area_count": len(batch_records),
            "unique_source_record_count": len(batch_sources),
            "records": batch_records,
            "exclusions": ["role audit", "ISCO membership", "role counts", "Nigerian context", "canonical taxonomy edits"],
        }
        write_json(OUT / f"{name}.json", payload)
        (OUT / f"{name}.md").write_text(markdown(batch_records, batch_name=name, source_record_count=len(batch_sources)), encoding="utf-8")

    source_ids = {source["source_id"] for record in all_records for source in record["sources"]}
    final_payload = {
        "schema_version": "2026-10-06.direct-area-fit-proof.v1",
        "append_only": True,
        "generated_on": str(date.today()),
        "scope": "D001-D056 finalized global Step 1 recommendations; direct area fit only",
        "domain_count": 56,
        "domains": ordered_ids,
        "area_count": len(all_records),
        "unique_source_record_count": len(source_ids),
        "source_records_are": "authoritative source records carried forward from finalized Step 1 reviews and crosswalked to each area; they support bounded parent-domain coherence, not universal taxonomy or role fit",
        "records": all_records,
        "exclusions": ["role audit", "ISCO membership", "role counts", "Nigerian context", "canonical taxonomy edits"],
    }
    write_json(OUT / "D001_D056_AREA_FIT_PROOF_2026_10_06.json", final_payload)
    (OUT / "D001_D056_AREA_FIT_PROOF_2026_10_06.md").write_text(markdown(all_records, batch_name="D001-D056 final", source_record_count=len(source_ids)), encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-10-06.direct-area-fit-proof-checkpoint.v1",
        "checkpoint": "D001-D056 complete",
        "domains_covered": ordered_ids,
        "domain_count": 56,
        "area_count": len(all_records),
        "unique_source_record_count": len(source_ids),
        "all_records_have_required_fields": all(
            record["sources"]
            and all(all(record_source.get(key) for key in ("url", "title", "locator", "supported_claim", "limitation")) for record_source in record["sources"])
            for record in all_records
        ),
        "direct_fit_dispositions": {"direct_fit_supported_with_bounded_claim": len(all_records)},
        "role_audit_performed": False,
        "nigerian_context_applied": False,
        "canonical_taxonomy_edited": False,
        "batch_files": sorted(path.name for path in OUT.glob("batch_*.json")),
        "final_json": "D001_D056_AREA_FIT_PROOF_2026_10_06.json",
        "final_markdown": "D001_D056_AREA_FIT_PROOF_2026_10_06.md",
    }
    write_json(OUT / "D001_D056_AREA_FIT_PROOF_CHECKPOINT_2026_10_06.json", checkpoint)
    (OUT / "D001_D056_AREA_FIT_PROOF_CHECKPOINT_2026_10_06.md").write_text(
        "# D001-D056 direct area-fit proof checkpoint\n\n"
        f"- Domains covered: **{checkpoint['domain_count']}**\n"
        f"- Recommended areas with direct proof records: **{checkpoint['area_count']}**\n"
        f"- Unique source records: **{checkpoint['unique_source_record_count']}**\n"
        f"- All records contain required source fields: **{checkpoint['all_records_have_required_fields']}**\n"
        "- Role audit: **not performed**\n"
        "- Nigerian context: **not started**\n"
        "- Canonical taxonomy edits: **none**\n\n"
        "The per-batch JSON and Markdown files are independently saved under this directory. Each source proves a bounded parent-domain area claim only; it does not prove universal counts or role membership.\n",
        encoding="utf-8",
    )
    print(json.dumps(checkpoint, indent=2))


if __name__ == "__main__":
    main()
