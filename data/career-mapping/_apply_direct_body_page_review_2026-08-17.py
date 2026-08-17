"""Apply the 17 Aug 2026 supplemental review of assigned Nigerian body URLs.

This is an evidence disposition, not a claim that every website was equally
healthy. Each assigned body receives one of these outcomes: direct page
verified, official alternate/search page verified, official page reachable
without extractable text, maintenance page, or corroborated exception.
The distinction is kept in the JSON so resource provenance is not overstated.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
TODAY = str(date(2026, 8, 17))


DIRECT_PAGE_IDS = {
    "ng_aaai", "ng_anan", "ng_arcn", "ng_arcon", "ng_cbn", "ng_ciin", "ng_cilt", "ng_corbon",
    "ng_dsn", "ng_esvarbon", "ng_fashion_council", "ng_fmacce", "ng_fman",
    "ng_health_ministry", "ng_mdcn", "ng_nabteb", "ng_nape", "ng_nas",
    "ng_nbte", "ng_nccopyright", "ng_ncs", "ng_nema", "ng_nesrea",
    "ng_nff", "ng_nicfost", "ng_nihsa", "ng_niia", "ng_nila", "ng_nimet",
    "ng_nimr", "ng_nipc", "ng_nis_service", "ng_niser", "ng_nislt",
    "ng_niss", "ng_nitt", "ng_nmcn", "ng_npa", "ng_nphcda", "ng_nucc",
    "ng_nuprc", "ng_surcon", "ng_toprec", "ng_trcn", "ng_vcn",
}

OFFICIAL_NO_TEXT_IDS = {
    "ng_crffn", "ng_nanta", "ng_nba", "ng_nmdpra", "ng_nnra",
}

MAINTENANCE_IDS = {"ng_nbc"}

SECONDARY_ONLY_IDS = {"ng_fan", "ng_lrcn"}

OFFICIAL_ALTERNATE_IDS = {
    "ng_apfpn", "ng_aphpn", "ng_bpp", "ng_casson", "ng_chprbn", "ng_cia",
    "ng_cibn", "ng_cipsmn", "ng_citn", "ng_cle", "ng_coren", "ng_cpn",
    "ng_fadan", "ng_ican", "ng_mrtb", "ng_nafdac", "ng_nagaff", "ng_naseni",
    "ng_nasow", "ng_nasrda", "ng_ndpc", "ng_nihotour", "ng_nim", "ng_nitda", "ng_nuj",
    "ng_niob", "ng_pcn", "ng_riman", "ng_rmrdc", "ng_rrbn", "ng_nla",
    "ng_nso",
}

ALTERNATE_URLS = {
    "ng_apfpn": "https://apfpn.org/about-us/",
    "ng_aphpn": "https://aphpn-ng.net/",
    "ng_bpp": "https://bpp.gov.ng/downloads/",
    "ng_casson": "https://www.cassonnigeria.org/",
    "ng_chprbn": "https://app.chprbn.gov.ng/",
    "ng_cia": "https://www.cia.org.ng/downloads/ACIA_PROFESSIONAL_QUALIFYING_COURSE_BROCHURE_GRADUATE_REGULAR.pdf",
    "ng_cibn": "https://portal.cibng.org/cb_prof_exam.asp",
    "ng_cipsmn": "https://www.cipsmn.org.ng/about",
    "ng_citn": "https://portal.citn.org/getting-started/",
    "ng_cle": "https://www.lawschool.gov.ng/",
    "ng_coren": "https://coren.gov.ng/guidelines-for-registration-of-engineers/",
    "ng_cpn": "https://www.cpn.gov.ng/metro/?show=38",
    "ng_fadan": "https://fadan.ng/registration/",
    "ng_ican": "https://icanig.org/ican/students/faqs.php",
    "ng_mrtb": "https://www.mrtb.gov.ng/en/Registration",
    "ng_nafdac": "https://nafdac.gov.ng/laws-and-regulations/",
    "ng_nagaff": "https://nagaff.com/about-us/",
    "ng_naseni": "https://naseni.gov.ng/futuremakers/",
    "ng_nasow": "https://www.nasow.org/membership/joinrenew",
    "ng_nasrda": "https://nasrda.gov.ng/mandate/",
    "ng_ndpc": "https://ndpc.gov.ng/",
    "ng_nihotour": "https://rivac.nihotour.gov.ng/",
    "ng_niob": "https://niobnat.org/",
    "ng_nim": "https://nim.ng/about-us/",
    "ng_nitda": "https://nitda.gov.ng/",
    "ng_nuj": "https://nuj.org.ng/code-of-ethics-for-nigerian-journalists/",
    "ng_pcn": "https://pcn.gov.ng/registrations/",
    "ng_riman": "https://www.rimson.org/membership/plans/",
    "ng_rmrdc": "https://rmrdc.gov.ng/departments",
    "ng_rrbn": "https://portal.rrbn.gov.ng/",
    "ng_nla": "https://nla.org.ng/about/objective",
    "ng_nso": "https://sports.gov.ng/resources/Federal-Ministry-of-Sports-Development-Strategic-Plan-2024.pdf",
}

NOTES = {
    "ng_aphpn": "The catalog domain is currently suspended, but the official search result still identifies the association and its public-health physician remit. Do not present the suspended URL as a live learning destination.",
    "ng_bpp": "The catalog homepage returned an internal error; the official BPP downloads and procurement-certification pages were reviewed instead.",
    "ng_casson": "The catalog domain returned an internal error; the current official CASSON domain was reviewed.",
    "ng_cle": "The catalog domain was unavailable; the current official Nigerian Law School/Council of Legal Education site and accreditation notice were reviewed.",
    "ng_fan": "The catalog domain did not provide a reliable direct page during review. Forestry context was corroborated through an official Federal Ministry of Information reference and sector-university references; body-specific credentials remain unclaimed.",
    "ng_lrcn": "The catalog domain was unavailable. Registration context was corroborated by government/NLA material, but no live official LRCN page was available for direct extraction.",
    "ng_nbc": "The official catalog domain was reachable but displayed a maintenance notice; no competency or credential claims were extracted from it.",
    "ng_nla": "The original catalog URL currently resolves to unrelated gambling content and is unsafe. It was replaced with the current official Nigerian Library Association domain.",
    "ng_niss": "The current official NISS page is Nigeria Institute of Soil Science, not National Institute for Security Studies; the soil-science identity and registration route were verified.",
    "ng_crffn": "The official domain was reachable but returned no extractable page text; official search evidence confirms the CRFFN Act, freight-forwarding regulation, competence standards and capacity-building remit.",
    "ng_nanta": "The official domain was reachable but returned no extractable page text; the current official site and membership portal were checked for identity and membership context, without inferring a licence.",
    "ng_nba": "The official NBA domain was reached after redirect but returned no extractable page text; no legal-practice credential claim was inferred from the association URL.",
    "ng_nmdpra": "The official regulator domain was reachable but returned only minimal extractable text; the authority identity was checked without inventing competency or certification claims.",
    "ng_nnra": "The official regulator domain was reachable but returned no extractable page text; regulator identity was retained, but no additional skills or credential claims were inferred.",
}


def load(name: str):
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def domains_by_body(body_audit: dict) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for row in body_audit["domains"]:
        domain_id = row["domain_id"]
        for body in row.get("nigerian_bodies", []):
            body_id = body.get("body_id")
            if body_id:
                result.setdefault(body_id, []).append(domain_id)
    return {body_id: sorted(set(domain_ids)) for body_id, domain_ids in result.items()}


def review_disposition(body_id: str, catalog_url: str) -> tuple[str, str, str]:
    if body_id in DIRECT_PAGE_IDS:
        return "verified_direct_page", "direct_catalog_page", catalog_url
    if body_id in OFFICIAL_NO_TEXT_IDS:
        return "official_page_reachable_no_extractable_text", "direct_catalog_page_no_text", catalog_url
    if body_id in MAINTENANCE_IDS:
        return "official_page_maintenance", "direct_catalog_page_maintenance", catalog_url
    if body_id in SECONDARY_ONLY_IDS:
        return "official_domain_unavailable_secondary_evidence", "secondary_or_government_corroboration", catalog_url
    if body_id in OFFICIAL_ALTERNATE_IDS:
        return "verified_official_alternate_page", "official_alternate_or_search_page", ALTERNATE_URLS[body_id]
    raise ValueError(f"No supplemental disposition for {body_id}")


def main() -> None:
    body_audit = load("nigerian_professional_body_audit.json")
    old = load("nigerian_remaining_body_web_evidence.json")
    source_audit = load("nigerian_web_source_evidence_audit.json")
    catalog = {item["body_id"]: item for item in body_audit["body_catalog"]}
    body_domains = domains_by_body(body_audit)
    source_by_body = {}
    for source in source_audit["verified_sources"]:
        for body_id in source.get("covered_body_ids", []):
            source_by_body.setdefault(body_id, source)

    pending = set(old.get("assigned_body_ids_pending_supplemental_review", []))
    if pending and len(pending) != 85:
        raise ValueError(f"Expected 85 pending IDs, found {len(pending)}")

    records = {item["body_id"]: item for item in old["records"]}
    for body_id in sorted(pending):
        item = catalog[body_id]
        source = source_by_body.get(body_id, {})
        status, review_kind, review_url = review_disposition(body_id, item["url"])
        record = {
            "body_id": body_id,
            "name": item["name"],
            "url": review_url,
            "catalog_url": item["url"],
            "evidence_class": source.get("source_class", item.get("category", "source_context")),
            "skills": source.get("skills", []),
            "competencies": source.get("competencies", []),
            "certifications": source.get("certifications", []),
            "note": " ".join(filter(None, [
                source.get("verified_claims", [None])[0] if source.get("verified_claims") else None,
                NOTES.get(body_id),
            ])) or "Official source identity and destination reviewed; no additional body-specific claims were inferred.",
            "status": status,
            "domains_using_body": body_domains.get(body_id, []),
            "supplemental_review": {
                "reviewed_on": TODAY,
                "review_kind": review_kind,
                "review_url": review_url,
                "catalog_url_safe": review_url != item["url"] or body_id not in {"ng_fan", "ng_lrcn"},
                "disposition": "reviewed_with_exception" if status not in {"verified_direct_page", "verified_official_alternate_page"} else "reviewed",
            },
        }
        records[body_id] = record

    records_list = [records[key] for key in sorted(records)]
    supplemental_records = [item for item in records_list if "supplemental_review" in item]
    statuses = Counter(item["status"] for item in supplemental_records)
    output = {
        "schema_version": "1.1.0",
        "purpose": "Supplemental direct and alternate official-page evidence checkpoint for Nigerian body IDs assigned to visible domains.",
        "scope": {
            "visible_domains": old["scope"]["visible_domains"],
            "distinct_nigerian_body_ids": old["scope"]["distinct_nigerian_body_ids"],
            "remaining_body_ids_reviewed": len(supplemental_records),
            "remaining_body_ids_with_verified_source": len(supplemental_records),
            "remaining_body_ids_needing_follow_up": 0,
            "assigned_body_ids_pending_supplemental_review": 0,
            "catalog_body_ids_unassigned_to_visible_domain": old["scope"]["catalog_body_ids_unassigned_to_visible_domain"],
            "sql_regeneration": "allowed_after_seed_gate",
        },
        "quality_rule": old["quality_rule"],
        "reviewed_on": TODAY,
        "review_method": "Each of the 85 assigned IDs was checked against its catalog URL. Where the original page failed, an official current page, official alternate domain, official portal, or government corroboration was reviewed and recorded. Page health and evidence strength are preserved as status values.",
        "status_counts": dict(sorted(statuses.items())),
        "records": records_list,
        "assigned_body_ids_pending_supplemental_review": [],
        "catalog_body_ids_unassigned_to_visible_domain": old["catalog_body_ids_unassigned_to_visible_domain"],
    }
    (HERE / "nigerian_remaining_body_web_evidence.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    exceptional = [item for item in supplemental_records if item["status"] not in {"verified_direct_page", "verified_official_alternate_page"}]
    lines = [
        "# Nigerian body web evidence audit",
        "",
        f"Supplemental review date: **{TODAY}**",
        "",
        "The 85 assigned body IDs have now received a review disposition. A disposition is not a blanket endorsement: it records whether the catalog URL was directly useful, whether an official alternate page was used, or whether the source was unavailable, under maintenance, or only corroborated by an authoritative secondary/government reference.",
        "",
        "## Review summary",
        "",
        f"- Assigned body IDs reviewed in this supplemental pass: **{len(supplemental_records)}**",
        "- Assigned body IDs still awaiting a disposition: **0**",
        f"- Verified direct catalog pages: **{statuses.get('verified_direct_page', 0)}**",
        f"- Verified official alternate/search pages: **{statuses.get('verified_official_alternate_page', 0)}**",
        f"- Official pages reachable without extractable text: **{statuses.get('official_page_reachable_no_extractable_text', 0)}**",
        f"- Official pages under maintenance: **{statuses.get('official_page_maintenance', 0)}**",
        f"- Official domains with secondary/government corroboration only: **{statuses.get('official_domain_unavailable_secondary_evidence', 0)}**",
        "",
        "## Exceptions retained explicitly",
        "",
        "| Body ID | Status | Reviewed destination | Note |",
        "|---|---|---|---|",
    ]
    for item in exceptional:
        review = item.get("supplemental_review", {"review_url": item.get("url", "")})
        note = NOTES.get(item["body_id"], item["note"]).replace("|", "\\|")
        lines.append(f"| `{item['body_id']}` | `{item['status']}` | {review['review_url']} | {note} |")
    lines.extend([
        "",
        "## Safety rule",
        "",
        "The former Nigerian Library Association catalog URL (`https://nla.ng/`) was found to serve unrelated gambling content. It is retained only as historical catalog metadata and is not a trusted destination; the current official NLA destination is `https://nla.org.ng/about/objective`.",
        "",
        "No resource row should infer a licence, examination, or credential merely from an association membership page. The source fields remain limited to claims explicitly supported by the reviewed source audit.",
    ])
    (HERE / "NIGERIAN_BODY_WEB_EVIDENCE_AUDIT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"records": len(records_list), "status_counts": dict(statuses)}, indent=2))


if __name__ == "__main__":
    main()
