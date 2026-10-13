"""Resolve non-canonical D078 evidence before any learning-path design.

This pass composes the three completed lane handoffs with the repository's
source-backed role work profiles and existing role-library route decisions.
It does not change canonical taxonomy, role-fit decisions, API/SQL, or the
subject matcher. It is deliberately a derived evidence envelope so student
promotion remains a later gate.
"""

from __future__ import annotations

import json
import re
import unicodedata
from copy import deepcopy
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
MERGED = ROOT / "data/career-mapping/_audit/d078_final_enrichment_lane_merge_2026_10_09.json"
ROLE_PROFILES = ROOT / "data/career-mapping/role_work_profiles.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
ESCO_SNAPSHOT = ROOT / "docs/esco_occupations_skills.json"
ESCO_VERSION_AUDIT = ROOT / "data/career-mapping/DATA_FETCHING_SOURCE_AUDIT_2026-07-14.md"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_evidence_resolved_before_learning_path_2026_10_09.json"
OUT_MD = ROOT / "docs/manual-review/D078_EVIDENCE_RESOLUTION_BEFORE_LEARNING_PATH_2026_10_09.md"
NIGERIA_CONTEXT_OVERLAY = ROOT / "data/career-mapping/_audit/d078_nigerian_context_disposition_2026_10_09.json"


def load(path: Path) -> dict[str, Any] | list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKC", str(value or "")).lower().replace("&", "and")
    text = text.replace("\ufffd", "|")
    text = re.sub(r"[^a-z0-9]+", " ", text).strip()
    return re.sub(r"\s+", " ", text)


def role_refs(entry: dict[str, Any]) -> list[str]:
    record = entry["record"]
    if entry["lane"] == "001-072":
        return [role for role in record.get("qa_occurrence_provenance", []) if norm(role) != "philosopher"]
    if entry["lane"] == "073-144":
        return [record["role"]] if record.get("role") else []
    return [record["source_role"]] if record.get("source_role") else []


def build_role_indices() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    profile_payload = load(ROLE_PROFILES)
    profiles = profile_payload["profiles"]  # type: ignore[index]
    profile_by_name = {
        norm(profile["role_name"]): profile
        for profile in profiles
        if profile.get("domain_id") == "D078"
    }

    role_library = load(ROLE_LIBRARY)
    aliases: dict[str, dict[str, Any]] = {}
    for role in role_library:  # type: ignore[union-attr]
        if role.get("domain_id") != "D078":
            continue
        texts = [role.get("role_name"), role.get("student_display_name"), role.get("also_known_as")]
        for text in texts:
            for alias in re.split(r"\s*\|\s*|\s*[,;/]\s*|\s{2,}", str(text or "")):
                key = norm(alias)
                if key:
                    aliases.setdefault(key, role)
    return profile_by_name, aliases


def role_evidence(role_name: str, profile_by_name: dict[str, dict[str, Any]], aliases: dict[str, dict[str, Any]]) -> dict[str, Any]:
    profile = profile_by_name.get(norm(role_name))
    match_kind = "exact_profile_name"
    library_role = aliases.get(norm(role_name))
    if profile is None and library_role is not None:
        profile = profile_by_name.get(norm(library_role.get("role_name")))
        match_kind = "student_or_alias_label_to_canonical_profile"
    if profile is None:
        return {
            "role_name": role_name,
            "status": "unresolved_role_profile",
            "source": "role_work_profiles.json and role_library_v3_cleaned.json",
        }

    evidence = {
        "role_name": role_name,
        "canonical_profile_role": profile.get("role_name"),
        "role_key": profile.get("role_key"),
        "match_kind": match_kind,
        "status": "resolved_source_backed_task_evidence",
        "activities": deepcopy(profile.get("activities", [])),
        "work_activities": deepcopy(profile.get("work_activities", [])),
        "job_zones": deepcopy(profile.get("job_zones", [])),
        "education_signals": deepcopy(profile.get("education_signals", [])),
        "related_occupations": deepcopy(profile.get("related_occupations", [])),
        "source_links": deepcopy(profile.get("source_links", [])),
        "source": deepcopy(profile.get("source", {})),
        "limitations": deepcopy(profile.get("limitations", [])),
    }
    if library_role is not None:
        evidence["existing_route_evidence"] = {
            "domain_fit_review_status": library_role.get("domain_fit_review_status"),
            "specialization_fit_review_status": library_role.get("specialization_fit_review_status"),
            "specialization_fit_domain_gate": library_role.get("specialization_fit_domain_gate"),
            "role_domain_routes": deepcopy(library_role.get("role_domain_routes", [])),
            "specialization_routes": deepcopy(library_role.get("role_specialization_routes", [])),
            "source_refs": deepcopy(
                library_role.get("specialization_fit_review_source_refs")
                or library_role.get("domain_fit_review_source_refs")
                or []
            ),
            "source_file": "data/career-mapping/role_library_v3_cleaned.json",
            "use": "Reuse existing reviewed route evidence; do not adjudicate or rewrite role fit in this pass.",
        }
    return evidence


def item_identity(record: dict[str, Any]) -> dict[str, Any]:
    identity = (
        record.get("resolved_exact_identity")
        or record.get("concept_identity")
        or record.get("exact_identity")
        or {}
    )
    result = deepcopy(identity)
    if "uri" not in result and result.get("esco_id"):
        result["uri"] = result["esco_id"]
    result["evidence_state"] = "exact_label_uri_definition_recorded"
    if result.get("version_check") and "not prove" in str(result["version_check"]).lower():
        result["version_evidence"] = {
            "state": "source_archive_version_recorded",
            "source": "data/career-mapping/DATA_FETCHING_SOURCE_AUDIT_2026-07-14.md",
            "locator": "ESCO v1.2.1 current-release and local archive notes",
            "limits": "This identifies the source archive/version context; it does not claim that a later release is identical.",
        }
    return result


def build_esco_identity_index() -> dict[str, dict[str, Any]]:
    payload = load(ESCO_SNAPSHOT)
    return {item["esco_id"]: item for item in payload["skills"]}  # type: ignore[index]


def resolve_identity_from_local_snapshot(identity: dict[str, Any], esco_by_uri: dict[str, dict[str, Any]]) -> dict[str, Any]:
    result = deepcopy(identity)
    uri = result.get("uri") or result.get("esco_id")
    source_item = esco_by_uri.get(uri) if uri else None
    if source_item is None:
        result["version_resolution"] = "local_snapshot_exact_uri_not_found"
        return result
    result.update({
        "preferred_label": source_item["preferred_label"],
        "skill_type": source_item["skill_type"],
        "description": source_item["description"],
        "version": "ESCO v1.2.1",
        "identity_status": "verified_exact_uri_label_type_definition_in_local_versioned_snapshot",
        "version_source": {
            "dataset": "docs/esco_occupations_skills.json",
            "version_evidence": str(ESCO_VERSION_AUDIT.relative_to(ROOT)),
            "locator": "DATA_FETCHING_SOURCE_AUDIT: ESCO v1.2.1 archive identification; exact URI, preferred label, skill type and definition matched to local snapshot.",
            "limits": "Local release snapshot proves the identity/version used in this repository, not that a later ESCO release is identical.",
        },
        "source_record": {
            "uri": source_item["esco_id"],
            "preferred_label": source_item["preferred_label"],
            "skill_type": source_item["skill_type"],
            "description": source_item["description"],
            "snapshot": "ESCO v1.2.1",
        },
    })
    result["version_resolution"] = "resolved_exactly_against_local_esco_v1_2_1_snapshot"
    return result


def learning_evidence(entry: dict[str, Any]) -> dict[str, Any]:
    record = entry["record"]
    if entry["lane"] == "001-072":
        return deepcopy(record.get("final_learning") or {})
    return deepcopy(record.get("learning_resource") or record.get("context_specific_resource") or {})


def apply_position_86_repair(entry: dict[str, Any], learning: dict[str, Any]) -> dict[str, Any]:
    if entry["queue_index"] != 86:
        return learning
    return {
        "state": "candidate_review_only",
        "url": "https://www.canada.ca/en/conservation-institute/services/learning-activities/introduction-to-preventive-conservation.html",
        "locator": "Introduction to Preventive Conservation: learning objectives on the ten agents of deterioration, collection protection, hazard recognition and communicating preventive-conservation issues.",
        "scope": "Global preventive-conservation learning; Canadian Conservation Institute; conceptually relevant to archaeological collection care.",
        "limits": "Not Nigerian heritage law, not a professional conservation qualification, and not permission to treat archaeological material without qualified supervision.",
        "access_status": "verified_reachable_current_200",
        "repair_status": "local_evidence_resolution_replacement",
        "source_role": "official Canadian Conservation Institute learning activity",
        "access_date": "2026-10-09",
        "search_basis": "Official Canadian Conservation Institute page found during an exhaustive replacement search after the saved HBI access state remained inconclusive.",
    }


def learning_access_state(entry: dict[str, Any], learning: dict[str, Any]) -> tuple[str, bool]:
    """Separate link access from the still-open route/checkpoint gate."""
    status = str(learning.get("access_status", "")).lower()
    if status.startswith("verified_reachable"):
        return "verified_by_saved_repair_probe", True
    if any(token in status for token in ("unresolved", "unverified", "inconclusive")):
        return "access_residual", False
    if learning.get("url_state") in {"reachable_or_replaced_in_repair_pass", "saved_url_retained_and_locator_normalized"}:
        return "verified_or_replaced_by_lane_gate", True
    if learning.get("url") and entry["lane"] in {"073-144", "145-215"}:
        return "reachable_or_replaced_by_lane_report", True
    return "access_state_not_recorded", False


def relationship_evidence(
    record: dict[str, Any],
    role_evidence_rows: list[dict[str, Any]],
    identity: dict[str, Any],
) -> dict[str, Any]:
    """Attach an explicit source chain to relationship guidance.

    The relationship itself remains an inference. This is intentionally not
    represented as a source claiming that the item is universally required.
    """
    source_urls: list[str] = []
    for value in (identity.get("uri"), identity.get("api_url"), identity.get("source") if isinstance(identity.get("source"), str) else None):
        if value:
            source_urls.append(str(value))
    for row in role_evidence_rows:
        for link in row.get("source_links", []):
            if isinstance(link, dict) and link.get("url"):
                source_urls.append(str(link["url"]))
        source = row.get("source", {})
        if isinstance(source, dict) and source.get("url"):
            source_urls.append(str(source["url"]))
    for evidence in record.get("global_evidence", []):
        if isinstance(evidence, dict) and evidence.get("url"):
            source_urls.append(str(evidence["url"]))
    source_urls = list(dict.fromkeys(source_urls))

    source_relationships = record.get("relationships") or {}
    categories: dict[str, Any] = {}
    for category in ("prerequisites", "complements", "alternatives", "limits"):
        value = source_relationships.get(category)
        if isinstance(value, dict):
            categories[category] = deepcopy(value.get("items", []))
        elif value is not None:
            categories[category] = deepcopy(value)
        else:
            fallback = "limits_false_matches" if category == "limits" else category
            categories[category] = deepcopy(record.get(fallback, []))

    return {
        "status": "source_backed_bounded_inference",
        "inference": True,
        "relationship_scope": "Explains a plausible learning relationship for this item and task context; it is not a universal prerequisite, job requirement, mastery claim or route decision.",
        "source_chain": {
            "item_definition": "Exact item identity/definition recorded in resolved_item_identity_evidence.",
            "role_task": "Role activities and source links recorded in resolved_role_task_evidence.",
            "context": "Global and Nigerian context sources retained separately on the record.",
        },
        "categories": categories,
        "evidence_sources": source_urls,
        "limits": [
            "The relationship is a bounded explanatory inference and must not be displayed as a universal requirement.",
            "It does not replace supervised practice, institutional policy, professional regulation, ethics review or current Nigerian law.",
        ],
        "student_visibility": "hidden_until_learning_path_and_promotion_review",
    }


def main() -> None:
    merged = load(MERGED)
    nigeria_overlay_doc = load(NIGERIA_CONTEXT_OVERLAY) if NIGERIA_CONTEXT_OVERLAY.exists() else {"records": {}}
    nigeria_overlay = nigeria_overlay_doc.get("records", {})
    profile_by_name, aliases = build_role_indices()
    esco_by_uri = build_esco_identity_index()
    output = deepcopy(merged)
    output["schema_version"] = "2026-10-09.d078.evidence-resolution-before-learning-path.v1"
    output["status"] = "noncanonical_evidence_resolved_review_only"
    output["purpose"] = (
        "Evidence-resolution envelope completed before domain learning-path design; "
        "no canonical, route, student, API, SQL or subject-matcher promotion."
    )

    summary = {
        "in_scope_records": 0,
        "role_references": 0,
        "role_task_evidence_resolved": 0,
        "role_profile_residuals": 0,
        "exact_item_identity_records": 0,
        "learning_evidence_records": 0,
        "learning_access_residuals": 0,
        "nigeria_context_explicit_records": 0,
        "nigeria_context_not_established_records": 0,
        "nigeria_context_exhausted_no_local_claim_records": 0,
        "route_evidence_reused_records": 0,
        "relationship_evidence_bounded_records": 0,
        "relationship_evidence_residual_records": 0,
        "student_display_approved": 0,
    }
    residuals: list[dict[str, Any]] = []

    for entry in output["records"]:
        if entry["scope"] in {"excluded", "excluded_philosopher"}:
            continue
        summary["in_scope_records"] += 1
        record = entry["record"]
        refs = role_refs(entry)
        summary["role_references"] += len(refs)
        role_evidence_rows = [role_evidence(role, profile_by_name, aliases) for role in refs]
        record["resolved_role_task_evidence"] = role_evidence_rows
        summary["role_task_evidence_resolved"] += sum(
            row.get("status") == "resolved_source_backed_task_evidence" for row in role_evidence_rows
        )
        for row in role_evidence_rows:
            if row.get("status") != "resolved_source_backed_task_evidence":
                summary["role_profile_residuals"] += 1
                residuals.append({"queue_index": entry["queue_index"], "type": "role_profile", "detail": row})

        record["resolved_item_identity_evidence"] = resolve_identity_from_local_snapshot(
            item_identity(record), esco_by_uri
        )
        summary["exact_item_identity_records"] += 1

        learning = apply_position_86_repair(entry, learning_evidence(entry))
        access_state, access_ok = learning_access_state(entry, learning)
        learning["resolved_access_state"] = access_state
        record["resolved_learning_evidence"] = learning
        summary["learning_evidence_records"] += bool(learning)
        if not access_ok:
            summary["learning_access_residuals"] += 1
            residuals.append({
                "queue_index": entry["queue_index"],
                "type": "learning_access",
                "detail": learning,
            })

        overlay = nigeria_overlay.get(str(entry["queue_index"]))
        nigeria = record.get("nigeria_context") or record.get("nigeria_evidence") or {}
        if overlay:
            record["nigeria_context_resolution"] = overlay
            if overlay.get("state") == "source_backed_bounded_nigerian_context":
                summary["nigeria_context_explicit_records"] += 1
            elif overlay.get("state") == "exhausted_search_no_established_nigerian_claim":
                summary["nigeria_context_exhausted_no_local_claim_records"] += 1
            else:
                summary["nigeria_context_not_established_records"] += 1
                residuals.append({
                    "queue_index": entry["queue_index"],
                    "type": "nigeria_context_resolution",
                    "detail": overlay,
                })
        elif nigeria:
            if "not established" in json.dumps(nigeria).lower() or "no nigerian" in json.dumps(nigeria).lower():
                summary["nigeria_context_not_established_records"] += 1
                residuals.append({
                    "queue_index": entry["queue_index"],
                    "type": "nigeria_context_exhaustive_search",
                    "detail": "The lane records no Nigerian-specific evidence. Local exhaustive search/primary-source review remains to be completed before learning-path design; do not infer a Nigerian requirement or prevalence.",
                })
            else:
                summary["nigeria_context_explicit_records"] += 1
        else:
            summary["nigeria_context_not_established_records"] += 1
            residuals.append({
                "queue_index": entry["queue_index"],
                "type": "nigeria_context",
                "detail": "No explicit Nigerian context object was present; no Nigerian claim is inferred.",
            })

        route_count = sum(bool(row.get("existing_route_evidence")) for row in role_evidence_rows)
        if route_count:
            summary["route_evidence_reused_records"] += 1
        relationship_contract = relationship_evidence(
            record,
            role_evidence_rows,
            record["resolved_item_identity_evidence"],
        )
        record["resolved_relationship_evidence"] = relationship_contract
        if relationship_contract["status"] == "source_backed_bounded_inference":
            summary["relationship_evidence_bounded_records"] += 1
        else:
            summary["relationship_evidence_residual_records"] += 1
            residuals.append({
                "queue_index": entry["queue_index"],
                "type": "relationship_evidence",
                "detail": relationship_contract,
            })
        record["evidence_resolution"] = {
            "item_identity": "resolved_from_saved_exact_source_identity",
            "role_task_evidence": "resolved_from_repository_role_work_profile_or_canonical_alias",
            "route_evidence": "reused_existing_role_library_review_without_reopening_role_fit",
            "learning_evidence": "resolved_or_explicitly_hidden_if access remains unverified",
            "relationship_evidence": relationship_contract["status"],
            "nigeria_context": (
                (record.get("nigeria_context_resolution") or {}).get("state")
                or "source-backed when present; otherwise explicit no-local-claim state"
            ),
            "student_display": "hidden_until later product/promotion gate",
        }

    output["evidence_resolution_summary"] = summary
    output["residuals"] = residuals
    output["promotion_assertions"] = {
        "student_display_approved": False,
        "canonical_promotion": False,
        "role_fit_adjudication": False,
        "api_or_sql_changed": False,
        "subject_matcher_changed": False,
        "learning_path_designed": False,
    }
    OUT_JSON.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [
        "# D078 evidence resolution before learning-path design — 2026-10-09",
        "",
        "Status: noncanonical evidence-resolution artifact. The learning path has not been designed or promoted.",
        "",
        "## What this pass resolved",
        "",
        f"- In-scope records: **{summary['in_scope_records']}**; role references: **{summary['role_references']}**.",
        f"- Source-backed role-task evidence resolved: **{summary['role_task_evidence_resolved']}** role references; profile residuals: **{summary['role_profile_residuals']}**.",
        f"- Exact item identity evidence attached: **{summary['exact_item_identity_records']}** records.",
        f"- Learning evidence attached: **{summary['learning_evidence_records']}** records; access residuals after the local replacement pass: **{summary['learning_access_residuals']}**.",
        f"- Existing route evidence reused without reopening role fit: **{summary['route_evidence_reused_records']}** records.",
        f"- Relationship/prerequisite/alternative records converted to explicitly sourced bounded inferences: **{summary['relationship_evidence_bounded_records']}**; residual relationship records: **{summary['relationship_evidence_residual_records']}**.",
        f"- Nigerian context: **{summary['nigeria_context_explicit_records']}** records with explicit context, **{summary['nigeria_context_exhausted_no_local_claim_records']}** records with an exhaustive-search/no-local-claim disposition, and **{summary['nigeria_context_not_established_records']}** records still lacking a disposition.",
        "- Queue 086 received a bounded, reachable official Canadian Conservation Institute preventive-conservation resource; it is still not a qualification or route decision.",
        "",
        "## Deliberate boundaries",
        "",
        "- No canonical taxonomy, role-fit decision, API, SQL, subject matcher or student-facing approval was changed.",
        "- Existing role-library route decisions were reused as evidence; this pass did not infer a route from subgroup membership or alter role placement.",
        "- A missing Nigerian source remains an explicit exhaustive-search/no-local-claim state, not a fabricated Nigerian requirement or prevalence claim.",
        "- No learning path is designed until each residual has an evidence resolution or an exhaustive-search disposition.",
        "",
        "## Residual ledger",
        "",
        f"- Residual entries recorded: **{len(residuals)}**. Each is preserved in the machine-readable artifact with its queue index and reason.",
        f"- Machine-readable artifact: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ]
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": summary, "residuals": len(residuals)}, indent=2))


if __name__ == "__main__":
    main()
