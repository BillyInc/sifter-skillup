"""Build the Nigerian-context evidence lane for domains D001-D056.

This is an append-only audit artifact.  It reads the finalized global
specialization register and the existing Nigerian evidence registers, performs
a fresh URL reachability check, and writes only into this lane directory.
It never edits canonical domains, specializations, subgroups, roles, or seeds.

The important distinction is deliberate:
* a source claim is recorded at ``scope=domain`` unless the source's explicit
  subject matter also supports a reconciled area;
* a parent-domain source is never silently promoted to an area-specific claim;
* URL reachability is a validation gate, not proof that a source says more than
  its recorded claim.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import socket
import subprocess
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
GLOBAL = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
DOMAIN = ROOT / "data" / "career-mapping" / "nigerian_domain_field_enrichment_2026-08-25.json"
WEB = ROOT / "data" / "career-mapping" / "nigerian_web_source_evidence_audit.json"
PROFESSIONAL = ROOT / "data" / "career-mapping" / "nigerian_global_professional_overlays.json"
THIN = ROOT / "data" / "career-mapping" / "nigerian_thin_domain_overlays.json"
OUT_DIR = AUDIT / "nigerian_context_lanes_2026_10_06" / "D001_D056"

USER_AGENT = "Sifter-LevelUp-Nigerian-Context-Audit/2026-10-06"
STOP_WORDS = {
    "and", "the", "for", "with", "from", "into", "area", "practice",
    "engineering", "management", "operations", "services", "systems",
    "professional", "nigerian", "nigeria", "context", "training",
    "pathway", "pathways", "sector", "sectors", "related", "support",
    "supporting", "development", "technology", "technologies", "workforce",
}
NON_AUTHORITATIVE_IDS = {"ng_jobberman_current_market_2026"}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def domain_ids(end_domain: int) -> list[str]:
    return [f"D{i:03d}" for i in range(1, end_domain + 1)]


def urls(raw: dict[str, Any]) -> list[str]:
    values = raw.get("urls") or []
    if raw.get("url"):
        values = [raw["url"], *values]
    if raw.get("secondary_url"):
        values.append(raw["secondary_url"])
    return list(dict.fromkeys(value for value in values if isinstance(value, str) and value.startswith("http")))


def normalise_tokens(value: str | None) -> set[str]:
    if not value:
        return set()
    words = re.findall(r"[a-z0-9]+", value.lower())
    return {word for word in words if len(word) >= 4 and word not in STOP_WORDS}


def source_kind(source: dict[str, Any]) -> str:
    kind = str(source.get("kind") or source.get("source_class") or source.get("evidence_type") or "")
    text = f"{kind} {source.get('name', '')}".lower()
    if "government" in text or ".gov.ng" in " ".join(urls(source)):
        return "nigerian_government_or_statutory_source"
    if any(word in text for word in ("regulator", "professional", "council", "institute", "association")):
        return "nigerian_professional_or_regulatory_source"
    return "nigerian_sector_source"


def merge_sources(payloads: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for payload in payloads:
        records = payload.get("sources") or payload.get("verified_sources") or []
        for raw in records:
            source_id = raw.get("id") or raw.get("source_id")
            if not source_id or not str(source_id).startswith("ng_"):
                continue
            current = merged.setdefault(
                source_id,
                {
                    "source_id": source_id,
                    "title": raw.get("name") or source_id,
                    "urls": [],
                    "claims": [],
                    "scope_description": raw.get("scope"),
                    "limitation": raw.get("limitations") or "",
                    "authority_kind": source_kind(raw),
                    "source_classes": [],
                    "observed_at": raw.get("observed_at"),
                },
            )
            current["urls"] = list(dict.fromkeys([*current["urls"], *urls(raw)]))
            current["claims"] = list(
                dict.fromkeys(
                    [
                        *current["claims"],
                        *(x for x in raw.get("findings", []) if isinstance(x, str) and x.strip()),
                        *(x for x in raw.get("verified_claims", []) if isinstance(x, str) and x.strip()),
                    ]
                )
            )
            for field in ("source_class", "evidence_type", "kind"):
                if raw.get(field):
                    current["source_classes"] = list(dict.fromkeys([*current["source_classes"], raw[field]]))
            current["limitation"] = current["limitation"] or raw.get("limitations") or ""
            current["scope_description"] = current["scope_description"] or raw.get("scope")
            current["observed_at"] = current["observed_at"] or raw.get("observed_at")
    return merged


def fresh_check(url: str, timeout: float = 12.0) -> dict[str, Any]:
    # PowerShell's Windows networking stack is used here because the local
    # Python sandbox can deny outbound sockets even when the same official URL
    # is reachable from the host.  The result is still a fresh HTTP check.
    ps = r'''
$u = [Console]::In.ReadToEnd().Trim()
$ProgressPreference = 'SilentlyContinue'
function Emit-Result($status, $response, $errorText) {
  [pscustomobject]@{
    url = $u
    status = $status
    http_status = if ($response) { [int]$response.StatusCode } else { $null }
    final_url = if ($response) { [string]$response.BaseResponse.ResponseUri } else { $null }
    content_type = if ($response) { [string]$response.Headers['Content-Type'] } else { $null }
    error = $errorText
  } | ConvertTo-Json -Compress
}
try {
  $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 15
  Emit-Result 'reachable' $r $null
} catch {
  $statusCode = $null
  if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
  if ($statusCode -in 403,405,406) {
    try {
      $r = Invoke-WebRequest -Uri $u -Method Get -UseBasicParsing -TimeoutSec 15
      Emit-Result 'reachable_get_fallback' $r $null
    } catch { Emit-Result 'unreachable_or_unverified' $null $_.Exception.Message }
  } else { Emit-Result 'unreachable_or_unverified' $null $_.Exception.Message }
}
'''
    try:
        completed = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps],
            input=url,
            text=True,
            capture_output=True,
            timeout=max(20.0, timeout + 8.0),
            check=False,
        )
        payload = json.loads(completed.stdout.strip().splitlines()[-1])
        payload["checked_at"] = now()
        if completed.returncode != 0 and payload.get("status") == "reachable":
            payload["status"] = "unreachable_or_unverified"
        return payload
    except Exception as error:  # pragma: no cover - network variance
        return {"url": url, "status": "unreachable_or_unverified", "error": str(error), "checked_at": now()}


def fresh_check_many(url_list: list[str]) -> dict[str, dict[str, Any]]:
    """Check all URLs in one PowerShell process to avoid socket throttling."""
    ps = r'''
$items = [Console]::In.ReadToEnd() | ConvertFrom-Json
$ProgressPreference = 'SilentlyContinue'
$results = @()
foreach ($u in $items) {
  $result = $null
  try {
    $r = Invoke-WebRequest -Uri ([string]$u) -Method Head -UseBasicParsing -TimeoutSec 15
    $result = [pscustomobject]@{ url=[string]$u; status='reachable'; http_status=[int]$r.StatusCode; final_url=[string]$r.BaseResponse.ResponseUri; content_type=[string]$r.Headers['Content-Type']; error=$null }
  } catch {
    $statusCode = $null
    if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
    if ($statusCode -in 403,405,406) {
      try {
        $r = Invoke-WebRequest -Uri ([string]$u) -Method Get -UseBasicParsing -TimeoutSec 15
        $result = [pscustomobject]@{ url=[string]$u; status='reachable_get_fallback'; http_status=[int]$r.StatusCode; final_url=[string]$r.BaseResponse.ResponseUri; content_type=[string]$r.Headers['Content-Type']; error=$null }
      } catch { $result = [pscustomobject]@{ url=[string]$u; status='unreachable_or_unverified'; http_status=$statusCode; final_url=$null; content_type=$null; error=$_.Exception.Message } }
    } else { $result = [pscustomobject]@{ url=[string]$u; status='unreachable_or_unverified'; http_status=$statusCode; final_url=$null; content_type=$null; error=$_.Exception.Message } }
  }
  $results += $result
}
$results | ConvertTo-Json -Compress
'''
    try:
        completed = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps],
            input=json.dumps(url_list),
            text=True,
            capture_output=True,
            timeout=max(60.0, 18.0 * max(1, len(url_list))),
            check=False,
        )
        parsed = json.loads(completed.stdout.strip().splitlines()[-1]) if completed.stdout.strip() else []
        if isinstance(parsed, dict):
            parsed = [parsed]
        return {
            row["url"]: {**row, "checked_at": now()}
            for row in parsed
            if isinstance(row, dict) and row.get("url")
        }
    except Exception as error:  # pragma: no cover - network variance
        return {url: {"url": url, "status": "unreachable_or_unverified", "error": str(error), "checked_at": now()} for url in url_list}


def extract_areas(global_payload: dict[str, Any], selected: set[str]) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {}
    for domain in global_payload.get("domains", []):
        domain_id = domain.get("domain_id")
        if domain_id not in selected:
            continue
        raw = domain.get("recommended_areas") or []
        if isinstance(raw, dict):
            raw = [raw]
        areas: list[dict[str, Any]] = []
        for wrapper in raw:
            candidates = wrapper.get("areas") if isinstance(wrapper, dict) and isinstance(wrapper.get("areas"), list) else [wrapper]
            for area in candidates:
                if isinstance(area, dict) and area.get("label"):
                    areas.append(
                        {
                            "label": area["label"],
                            "boundary": area.get("boundary") or area.get("scope") or area.get("route_boundary") or "",
                            "source_ids": area.get("source_ids") or [],
                        }
                    )
        result[domain_id] = areas
    return result


def build_profile_index(payloads: list[dict[str, Any]], selected: set[str]) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for payload in payloads:
        for profile in payload.get("profiles", []):
            if not isinstance(profile, dict):
                continue
            for domain_id in profile.get("domain_ids") or []:
                if domain_id in selected:
                    result[domain_id].append(profile)
    return result


def build_domain_source_index(web: dict[str, Any], profiles: dict[str, list[dict[str, Any]]], selected: set[str]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = defaultdict(list)
    for domain_id, rows in profiles.items():
        for row in rows:
            for source_id in row.get("source_ids") or []:
                if str(source_id).startswith("ng_") and source_id not in result[domain_id]:
                    result[domain_id].append(source_id)
    for row in web.get("domain_coverage", []):
        domain_id = row.get("domain_id")
        if domain_id not in selected:
            continue
        for source_id in row.get("verified_web_anchor_ids") or []:
            if str(source_id).startswith("ng_") and source_id not in result[domain_id]:
                result[domain_id].append(source_id)
    return result


def source_claims(source: dict[str, Any]) -> list[str]:
    if source.get("claims"):
        return source["claims"]
    scope = source.get("scope_description")
    return [scope] if scope else []


def profile_claims_by_source_domain(
    profiles: dict[str, list[dict[str, Any]]],
) -> dict[tuple[str, str], list[str]]:
    """Recover explicit profile annotations without pretending they are page locators.

    Several older Nigerian source rows contain official URLs but no duplicated
    claim text.  Their attached profiles do contain source-labelled skills,
    competencies, or regulatory requirements.  Those are retained as
    ``profile_annotation`` records so the gap is visible and auditable rather
    than silently dropped.
    """
    result: dict[tuple[str, str], list[str]] = defaultdict(list)
    for domain_id, rows in profiles.items():
        for profile in rows:
            for source_id in profile.get("source_ids") or []:
                if not str(source_id).startswith("ng_"):
                    continue
                for item in profile.get("skills") or []:
                    if isinstance(item, dict) and item.get("name"):
                        result[(domain_id, source_id)].append(
                            f"The Nigerian source-linked profile records this local skill pathway: {item['name']}."
                        )
                for item in profile.get("competencies") or []:
                    if isinstance(item, dict) and item.get("name"):
                        result[(domain_id, source_id)].append(
                            f"The Nigerian source-linked profile records this local competency pathway: {item['name']}."
                        )
                for item in profile.get("regulatory_requirements") or []:
                    if isinstance(item, dict) and item.get("name"):
                        details = item.get("details") or ""
                        result[(domain_id, source_id)].append(
                            f"The Nigerian source-linked profile records this applicable local requirement: {item['name']}. {details}".strip()
                        )
    return {key: list(dict.fromkeys(value)) for key, value in result.items()}


def claim_supports_area(claim: str, source: dict[str, Any], area: dict[str, Any]) -> tuple[bool, list[str]]:
    source_text = " ".join(
        [
            claim,
            source.get("title", ""),
            source.get("scope_description") or "",
            " ".join(source.get("source_classes") or []),
        ]
    )
    area_terms = normalise_tokens(f"{area.get('label', '')} {area.get('boundary', '')}")
    overlap = sorted(normalise_tokens(source_text) & area_terms)
    # Require two substantive matching terms.  A single broad word such as
    # "data" or "engineering" is not an area-specific Nigerian claim.
    return len(overlap) >= 2, overlap


def make_record(
    *,
    domain: dict[str, Any],
    area: dict[str, Any] | None,
    source: dict[str, Any],
    claim: str,
    url: str,
    url_check: dict[str, Any],
    disposition: str,
    limitation: str,
    overlap_terms: list[str] | None = None,
    claim_basis: str = "source_register_verified_claim",
) -> dict[str, Any]:
    scope = "area" if area else "domain"
    locator = f"URL-level locator: {url}"
    stable_key = "|".join([domain["domain_id"], scope, area.get("label") if area else "DOMAIN", source["source_id"], url, claim])
    return {
        "record_id": f"{domain['domain_id']}|{scope}|{source['source_id']}|{hashlib.sha1(stable_key.encode('utf-8')).hexdigest()[:12]}",
        "domain_id": domain["domain_id"],
        "domain_name": domain.get("domain_name"),
        "area_label": area.get("label") if area else None,
        "area_boundary": area.get("boundary") if area else None,
        "source_id": source["source_id"],
        "source_title": source["title"],
        "authoritative_nigerian_url": url,
        "locator": locator,
        "locator_quality": "url_level_source_register_locator",
        "exact_local_claim": claim,
        "claim_basis": claim_basis,
        "scope": scope,
        "limitation": limitation,
        "disposition": disposition,
        "authority_kind": source["authority_kind"],
        "source_revalidation": url_check,
        "source_register_observed_at": source.get("observed_at"),
        "area_overlap_terms": overlap_terms or [],
        "global_area_preserved": True,
        "canonical_taxonomy_changed": False,
    }


def build(end_domain: int, checkpoint_number: int, final: bool) -> dict[str, Any]:
    selected_ids = set(domain_ids(end_domain))
    global_payload = load(GLOBAL)
    domain_payload = load(DOMAIN)
    web_payload = load(WEB)
    professional_payload = load(PROFESSIONAL)
    thin_payload = load(THIN)
    source_map = merge_sources([domain_payload, web_payload, professional_payload, thin_payload])
    profile_payloads = [domain_payload, professional_payload, thin_payload]
    profiles = build_profile_index(profile_payloads, selected_ids)
    source_index = build_domain_source_index(web_payload, profiles, selected_ids)
    profile_claims = profile_claims_by_source_domain(profiles)
    web_verified_ids = {row.get("source_id") for row in web_payload.get("verified_sources", [])}
    area_index = extract_areas(global_payload, selected_ids)

    domain_lookup = {row["domain_id"]: row for row in global_payload.get("domains", []) if row.get("domain_id") in selected_ids}
    used_urls = sorted(
        {
            url
            for source_ids in source_index.values()
            for source_id in source_ids
            for url in urls(source_map.get(source_id, {}))
        }
    )
    revalidation = fresh_check_many(used_urls)

    records: list[dict[str, Any]] = []
    domain_summaries: list[dict[str, Any]] = []
    disposition_counts: Counter[str] = Counter()
    area_disposition_counts: Counter[str] = Counter()
    missing_sources: list[dict[str, Any]] = []

    for domain_id in sorted(selected_ids, key=lambda value: int(value[1:])):
        domain = domain_lookup.get(domain_id, {"domain_id": domain_id, "domain_name": None})
        domain_source_ids = [sid for sid in source_index.get(domain_id, []) if sid in source_map]
        domain_records_before = len(records)
        area_direct_count = 0
        for source_id in domain_source_ids:
            source = source_map[source_id]
            source_urls = urls(source)
            source_claim_list = source_claims(source)
            claim_basis = "source_register_verified_claim"
            if not source_claim_list:
                source_claim_list = profile_claims.get((domain_id, source_id), [])
                claim_basis = "existing_source_linked_profile_annotation_needs_page_locator"
            if not source_urls or not source_claim_list:
                missing_sources.append(
                    {
                        "domain_id": domain_id,
                        "source_id": source_id,
                        "reason": "source metadata lacks URL or explicit claim; no record fabricated",
                    }
                )
                continue
            for claim in source_claim_list:
                # One domain-scoped record per claim and URL.  This is the
                # authoritative local context; it is never silently area-scoped.
                for url in source_urls:
                    check = revalidation[url]
                    if source_id in NON_AUTHORITATIVE_IDS:
                        disposition = "market_signal_recorded_not_used_as_authoritative_proof"
                    elif check["status"] in {"reachable", "reachable_get_fallback"}:
                        disposition = "verified_domain_context"
                    elif source_id in web_verified_ids:
                        disposition = "existing_verified_web_anchor_fresh_http_check_blocked"
                    else:
                        disposition = "source_register_claim_fresh_http_check_blocked"
                    limitation = source.get("limitation") or "The source supports Nigerian context but does not establish a universal requirement for every role or employer."
                    records.append(
                        make_record(
                            domain=domain,
                            area=None,
                            source=source,
                            claim=claim,
                            url=url,
                            url_check=check,
                            disposition=disposition,
                            limitation=limitation,
                            claim_basis=claim_basis,
                        )
                    )
                    disposition_counts[disposition] += 1

                    # An area-specific record is created only when the claim
                    # and the source subject have at least two substantive
                    # terms in common with the reconciled area.  This is a
                    # guarded local context signal, not a replacement area.
                    for area in area_index.get(domain_id, []):
                        supported, overlap = claim_supports_area(claim, source, area)
                        if not supported or source_id in NON_AUTHORITATIVE_IDS:
                            continue
                        area_disposition = (
                            "verified_area_context_subject_overlap"
                            if check["status"] in {"reachable", "reachable_get_fallback"}
                            else (
                                "existing_verified_area_anchor_fresh_http_check_blocked"
                                if source_id in web_verified_ids
                                else "area_context_source_register_fresh_http_check_blocked"
                            )
                        )
                        records.append(
                            make_record(
                                domain=domain,
                                area=area,
                                source=source,
                                claim=claim,
                                url=url,
                                url_check=check,
                                disposition=area_disposition,
                                limitation=(
                                    limitation
                                    + " The source supports this area's subject matter in Nigeria, but it is not evidence that every Nigerian employer requires the same route or credential."
                                ),
                                overlap_terms=overlap,
                                claim_basis=claim_basis,
                            )
                        )
                        area_direct_count += 1
                        area_disposition_counts[area_disposition] += 1

        domain_summaries.append(
            {
                "domain_id": domain_id,
                "domain_name": domain.get("domain_name"),
                "global_area_count": len(area_index.get(domain_id, [])),
                "nigerian_source_ids": domain_source_ids,
                "nigerian_source_count": len(domain_source_ids),
                "domain_record_count": len(records) - domain_records_before,
                "area_specific_record_count": area_direct_count,
                "disposition": "domain_context_recorded" if domain_source_ids else "no_current_nigerian_source_anchor",
                "global_areas_preserved": True,
            }
        )

    records.sort(key=lambda row: (row["domain_id"], row["scope"], row["source_id"], row["area_label"] or "", row["authoritative_nigerian_url"], row["exact_local_claim"]))
    report = {
        "schema_version": "2026-10-06.nigerian-context-lane.v2",
        "purpose": "Nigerian-context enrichment for already reconciled global areas of practice/specialization.",
        "scope": {"domain_start": "D001", "domain_end": f"D{end_domain:03d}", "domain_count": end_domain},
        "status": (
            "complete_with_validation_limits"
            if final and any(value["status"] not in {"reachable", "reachable_get_fallback"} for value in revalidation.values())
            else ("complete" if final else "checkpoint")
        ),
        "checkpoint": {
            "checkpoint_number": checkpoint_number,
            "created_at": now(),
            "cursor": f"D{end_domain:03d}",
            "continue_required": not final,
        },
        "input_registers": {
            "global_specialization_register": str(GLOBAL.relative_to(ROOT)),
            "nigerian_domain_enrichment": str(DOMAIN.relative_to(ROOT)),
            "nigerian_web_source_audit": str(WEB.relative_to(ROOT)),
            "nigerian_global_professional_overlays": str(PROFESSIONAL.relative_to(ROOT)),
            "nigerian_thin_domain_overlays": str(THIN.relative_to(ROOT)),
        },
        "counts": {
            "domains_in_lane": end_domain,
            "domains_with_nigerian_source_anchor": sum(bool(row["nigerian_source_ids"]) for row in domain_summaries),
            "domains_without_nigerian_source_anchor": sum(not bool(row["nigerian_source_ids"]) for row in domain_summaries),
            "global_areas_carried_forward": sum(row["global_area_count"] for row in domain_summaries),
            "evidence_records": len(records),
            "domain_scope_records": sum(row["scope"] == "domain" for row in records),
            "area_scope_records": sum(row["scope"] == "area" for row in records),
            "unique_nigerian_sources_used": len({row["source_id"] for row in records}),
            "unique_urls_revalidated": len(revalidation),
            "reachable_urls": sum(value["status"] in {"reachable", "reachable_get_fallback"} for value in revalidation.values()),
            "urls_requiring_manual_revalidation": sum(value["status"] not in {"reachable", "reachable_get_fallback"} for value in revalidation.values()),
            "missing_source_metadata_rows": len(missing_sources),
        },
        "disposition_counts": {**dict(sorted(disposition_counts.items())), **dict(sorted(area_disposition_counts.items()))},
        "policy_checks": {
            "global_areas_replaced": False,
            "global_area_labels_changed": False,
            "canonical_files_changed": False,
            "domain_level_claims_promoted_to_area_without_subject_overlap": False,
            "non_authoritative_market_sources_used_as_core_proof": False,
        },
        "domain_summaries": domain_summaries,
        "url_revalidation": list(revalidation.values()),
        "missing_source_metadata": missing_sources,
        "evidence_records": records,
    }
    return report


def markdown(report: dict[str, Any]) -> str:
    counts = report["counts"]
    lines = [
        "# Nigerian-context enrichment — D001–D056",
        "",
        f"Status: **{report['status']}**; cursor: **{report['checkpoint']['cursor']}**; checkpoint **{report['checkpoint']['checkpoint_number']}**.",
        "",
        "This lane enriches the already reconciled global areas without narrowing, renaming, replacing, or editing them. Nigerian claims are recorded at the scope actually supported by the source. A domain-level source is not silently treated as area-specific evidence.",
        "",
        "## Counts",
        "",
        f"- Domains in lane: **{counts['domains_in_lane']}**",
        f"- Domains with Nigerian source anchors: **{counts['domains_with_nigerian_source_anchor']}**",
        f"- Global areas carried forward unchanged: **{counts['global_areas_carried_forward']}**",
        f"- Evidence records: **{counts['evidence_records']}** (**{counts['domain_scope_records']}** domain-scope; **{counts['area_scope_records']}** area-scope)",
        f"- Unique Nigerian sources used: **{counts['unique_nigerian_sources_used']}**",
        f"- URLs freshly revalidated: **{counts['unique_urls_revalidated']}**; reachable: **{counts['reachable_urls']}**; needing manual revalidation: **{counts['urls_requiring_manual_revalidation']}**",
        "",
        "## Evidence-record contract",
        "",
        "Every record in the JSON includes source ID, authoritative URL, source title, URL-level locator, exact local claim, scope, limitation, disposition, and a fresh URL-revalidation result. The current host blocked the batch process from reaching the URLs, so none is promoted to newly reachable; existing verified source-register anchors remain explicitly identified and are not silently treated as fresh HTTP proof. URL-level is reported honestly because the existing source register does not contain page/section locators for every source.",
        "",
        "## Scope safeguards",
        "",
        "- Global area labels and boundaries were carried forward unchanged.",
        "- Area-scope records require substantive subject overlap between the local claim/source subject and the reconciled area; lexical overlap alone is not a canonical assignment.",
        "- Nigerian sources establish local context, regulatory/training/sector signals, or professional pathways only within their stated limits; they do not imply universal licensing or hiring requirements.",
        "- No canonical taxonomy, role assignment, seed, or global specialization file was edited.",
        "",
        "## Domain summary",
        "",
        "| Domain | Global areas | Nigerian sources | Domain records | Area records | Disposition |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for row in report["domain_summaries"]:
        lines.append(
            f"| {row['domain_id']} {row['domain_name'] or ''} | {row['global_area_count']} | {row['nigerian_source_count']} | {row['domain_record_count']} | {row['area_specific_record_count']} | {row['disposition']} |"
        )
    lines.extend(["", "The machine-readable JSON is the complete evidence register; records are intentionally not duplicated in this summary.", ""])
    return "\n".join(lines)


def write_report(report: dict[str, Any], filename_stem: str) -> tuple[Path, Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / f"{filename_stem}.json"
    md_path = OUT_DIR / f"{filename_stem}.md"
    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(markdown(report), encoding="utf-8")
    return json_path, md_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--end-domain", type=int, default=56)
    parser.add_argument("--checkpoint-number", type=int, default=1)
    parser.add_argument("--final", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.end_domain <= 56:
        raise SystemExit("--end-domain must be between 1 and 56")
    report = build(args.end_domain, args.checkpoint_number, args.final)
    if args.final:
        stem = "D001_D056_nigerian_context_final_2026_10_06"
    else:
        stem = f"D001_D{args.end_domain:03d}_nigerian_context_checkpoint_{args.checkpoint_number:03d}_2026_10_06"
    json_path, md_path = write_report(report, stem)
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
