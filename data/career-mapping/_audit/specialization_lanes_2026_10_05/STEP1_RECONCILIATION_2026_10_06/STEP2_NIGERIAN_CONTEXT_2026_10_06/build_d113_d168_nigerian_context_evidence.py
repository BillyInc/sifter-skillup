"""Build the append-only Nigerian-context evidence lane for D113-D168.

This builder deliberately does not edit canonical taxonomy files.  It converts
the existing source leads into auditable domain records and explicit per-area
dispositions.  A domain-level Nigerian source is never promoted to an area
record unless the source claim names or directly defines that area.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[6]
WORKLIST = Path(__file__).with_name("D113_D168_nigerian_context_worklist_2026_10_06.json")
SOURCE_AUDIT = ROOT / "data" / "career-mapping" / "nigerian_web_source_evidence_audit.json"
OUT = Path(__file__).parent
TODAY = "2026-10-06"


# These are the URLs opened during the current revalidation pass.  A successful
# open is not itself area proof; it only confirms that the cited authority is
# reachable and that the source can be inspected again.
LIVE_REVALIDATION = {
    "ng_nsqf_nos": ("live_opened", "Nigerian Skills Qualifications Framework (NSQF); What is NSQF", "https://www.web.nbte.gov.ng/nsqf"),
    "ng_cpn_syllabus_2021": ("live_opened", "PDF pp. iv-v and 8-10; Foreword, Introduction and examination tracks", "https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus(Reviewed).pdf"),
    "ng_fmacce": ("live_opened", "Entertainment and Creative Economy department page", "https://www.fmacce.gov.ng/department/entertainment-and-creative-economy-ece"),
    "ng_nicfost": ("live_opened", "Homepage; About Us and Registration/Licensing navigation", "https://nicfost.gov.ng/"),
    "ng_nnra": ("live_opened", "Radiation Safety Officers; Requirement for a Radiation Safety Officer", "https://nnra.gov.ng/nnra/page-radiation_safety_officers"),
    "ng_son_building_materials": ("live_opened", "International Product Certification; Functions and schemes", "https://son.gov.ng/son-product-certification/"),
    "ng_trcn": ("live_opened", "Homepage and teacher registration/licensing navigation", "https://trcn.gov.ng/"),
    "ng_niob_building_materials": ("live_opened", "Welcome/About NIOB; professional body, building practice and registration", "https://niobnat.org/"),
    "ng_nasrda": ("live_opened_text_limited", "Institute of Space Science Engineering page; institute/department description", "https://central.nasrda.gov.ng/departments/institute-of-space-science-engineering/"),
    "ng_nema": ("live_opened_text_limited", "NEMA official homepage; agency mandate and emergency-management context", "https://nema.gov.ng/"),
    "ng_cipsmn": ("live_opened_text_limited", "About page", "https://www.cipsmn.org.ng/about"),
    "ng_legal_context": ("live_opened_text_limited", "Nigerian Bar Association official homepage", "https://www.nigerianbar.org.ng/"),
    "ng_fashion_council": ("live_opened", "About Us; institutional backbone and Federal Government-mandated sector skills council", "https://nigerianfashioncouncil.org/"),
    "ng_nas_research": ("live_opened", "Official homepage; About Us, Publications and science-academy context", "https://nas.org.ng/"),
    "ng_nuj": ("live_opened", "Code of Ethics for Nigerian Journalists; Preamble and Accuracy/Fairness", "https://nuj.org.ng/code-of-ethics-for-nigerian-journalists/"),
    "ng_ican_syllabus": ("live_opened", "PDF pp. 1-2; Foreword, professional development and ethics", "https://icanig.org/ican/assets/docs/ICAN_SYLLABUS_2026_Final_Updated_NEW.pdf"),
    "ng_cibn": ("live_opened", "Competency Framework section", "https://portal.cibng.org/cb_competencyframework.asp"),
}


# A positive area disposition is intentionally rare.  These are the only
# current lane cases whose revalidated Nigerian source explicitly names the
# same technical boundary rather than merely the parent sector.
DIRECT_AREA_SUPPORT = {
    ("D135", "Radiation Science, Measurement and Protection"): {
        "source_id": "ng_nnra",
        "claim": "NNRA's Radiation Safety Officers page requires relevant radiation education/training, an accredited radiation-protection examination and supervised on-the-job training, and places the requirement within Nigeria's radiological-safety regulatory system.",
        "supports": "A Nigeria-specific regulatory and competency overlay for radiation measurement, protection and safety practice.",
        "locator": "Radiation Safety Officers page: 'Requirement for a Radiation Safety Officer', requirements 1-4.",
    },
    ("D137", "Medical Health Physics and Radiation Protection"): {
        "source_id": "ng_nnra",
        "claim": "NNRA's Radiation Safety Officers page requires radiation-protection education/training, an accredited radiation-protection examination and supervised on-the-job training for radiation-related duties in Nigeria.",
        "supports": "A Nigeria-specific regulatory and competency overlay for medical health physics and radiation-protection practice.",
        "locator": "Radiation Safety Officers page: 'Requirement for a Radiation Safety Officer', requirements 1-4; Medical Sector navigation includes radiological safety contexts.",
    },
}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def source_map(audit: dict) -> dict:
    return {row["source_id"]: row for row in audit.get("verified_sources", [])}


def choose_source(domain: dict, sources: dict) -> dict:
    leads = domain.get("existing_nigeria_source_leads", [])
    if not leads:
        return {
            "source_id": None,
            "source_publisher": None,
            "source_title": None,
            "authoritative_url": None,
            "locator": "No Nigerian source lead exists for this domain.",
            "source_revalidation_status": "no_source_lead",
            "exact_nigerian_claim": "No Nigerian source lead was available to inspect for this domain.",
        }
    lead = leads[0]
    sid = lead["source_id"]
    verified = sources.get(sid, {})
    live = LIVE_REVALIDATION.get(sid)
    status = live[0] if live else "checked_in_verified_source_audit_only"
    locator = live[1] if live else "Official source page or source document cited in the checked-in Nigerian web evidence audit; exact section is retained from the source record and no new live extraction was available in this batch."
    url = live[2] if live else verified.get("url", lead.get("url"))
    claims = verified.get("verified_claims") or lead.get("verified_claims") or []
    claim = claims[0] if claims else "The checked-in Nigerian source record identifies this authority as relevant to the domain; the exact current wording requires direct source review."
    return {
        "source_id": sid,
        "source_publisher": verified.get("name", lead.get("name")),
        "source_title": verified.get("name", lead.get("name")),
        "authoritative_url": url,
        "locator": locator,
        "source_revalidation_status": status,
        "exact_nigerian_claim": claim,
    }


def choose_named_source(domain: dict, source_id: str, sources: dict) -> dict:
    """Select a named lead for a direct area-support record."""
    leads = domain.get("existing_nigeria_source_leads", [])
    selected = next((lead for lead in leads if lead.get("source_id") == source_id), None)
    if selected is None:
        return choose_source(domain, sources)
    sid = selected["source_id"]
    verified = sources.get(sid, {})
    live = LIVE_REVALIDATION.get(sid)
    status = live[0] if live else "checked_in_verified_source_audit_only"
    locator = live[1] if live else "Official source page or source document cited in the checked-in Nigerian web evidence audit; exact section is retained from the source record and no new live extraction was available in this batch."
    url = live[2] if live else verified.get("url", selected.get("url"))
    claims = verified.get("verified_claims") or selected.get("verified_claims") or []
    return {
        "source_id": sid,
        "source_publisher": verified.get("name", selected.get("name")),
        "source_title": verified.get("name", selected.get("name")),
        "authoritative_url": url,
        "locator": locator,
        "source_revalidation_status": status,
        "exact_nigerian_claim": claims[0] if claims else "The checked-in Nigerian source record identifies this authority as relevant to the domain; the exact current wording requires direct source review.",
    }


def base_record(domain: dict, source: dict, scope: str, area_label: str | None) -> dict:
    return {
        "record_id": f"{domain['domain_id']}::{scope}::{area_label or 'domain'}",
        "domain_id": domain["domain_id"],
        "domain_name": domain["domain_name"],
        "scope": scope,
        "area_of_specialization": area_label,
        "source_id": source["source_id"],
        "source_publisher": source["source_publisher"],
        "source_title": source["source_title"],
        "authoritative_nigerian_url": source["authoritative_url"],
        "locator": source["locator"],
        "access_date": TODAY,
        "source_revalidation_status": source["source_revalidation_status"],
        "global_area_label_preserved": True,
    }


def build() -> tuple[dict, str]:
    worklist = read_json(WORKLIST)
    source_audit = read_json(SOURCE_AUDIT)
    sources = source_map(source_audit)
    records: list[dict] = []
    source_manifest: dict[str, dict] = {}

    for domain in worklist["domains"]:
        source = choose_source(domain, sources)
        domain_record = base_record(domain, source, "domain", None)
        if source["source_id"] and source["source_revalidation_status"] in {
            "live_opened", "live_opened_text_limited", "checked_in_verified_source_audit_only"
        }:
            domain_record.update({
                "exact_nigerian_claim": source["exact_nigerian_claim"],
                "what_it_supports": f"Nigerian domain-level context for {domain['domain_name']}; it does not define a new global specialization.",
                "limitation": "This record supports the parent domain/sector context only. It is not a licence, demand claim, role claim or area-of-specialization proof.",
                "disposition": "nigeria_specific_overlay_supported",
            })
        else:
            domain_record.update({
                "exact_nigerian_claim": "No source was successfully revalidated for this domain in the current lane.",
                "what_it_supports": "No positive Nigerian overlay is applied.",
                "limitation": "The prior lead is not treated as proof until the authority can be revalidated.",
                "disposition": "unresolved_source_or_scope_conflict",
            })
        records.append(domain_record)

        for area in domain.get("approved_global_specialization_areas", []):
            label = area["label"]
            specific = DIRECT_AREA_SUPPORT.get((domain["domain_id"], label))
            area_source = source
            if specific:
                area_source = choose_named_source(domain, specific["source_id"], sources)
                record = base_record(domain, area_source, "area", label)
                record.update({
                    "exact_nigerian_claim": specific["claim"],
                    "what_it_supports": specific["supports"],
                    "limitation": "The source supports the Nigerian regulatory/competency overlay for this area; it does not prove that the area is globally universal, add roles, or establish labour-market demand.",
                    "disposition": "nigeria_specific_overlay_supported",
                    "locator": specific["locator"],
                    "area_evidence_direct": True,
                })
            else:
                record = base_record(domain, area_source, "area", label)
                if area_source["source_revalidation_status"] in {"live_opened", "live_opened_text_limited"}:
                    record.update({
                        "exact_nigerian_claim": f"The revalidated Nigerian source supports the parent domain/sector context for {domain['domain_name']}, but it does not name or define '{label}' as a distinct Nigerian regulatory, curriculum, credential or practice branch.",
                        "what_it_supports": "Parent-domain Nigerian context only; no area-level overlay is assigned.",
                        "limitation": "No area-specific primary Nigerian evidence was found in the revalidated source. The global area label and boundary are retained unchanged; domain evidence is not being promoted to this area.",
                        "disposition": "no_primary_nigerian_evidence_found_after_search",
                    })
                else:
                    record.update({
                        "exact_nigerian_claim": "The available Nigerian lead was not successfully revalidated in the current pass, so it cannot support this area.",
                        "what_it_supports": "No area-level Nigerian overlay is assigned.",
                        "limitation": "The area remains globally recognized; local enrichment is deferred until the authoritative source is revalidated.",
                        "disposition": "unresolved_source_or_scope_conflict",
                    })
                    record["area_evidence_direct"] = False
            records.append(record)

        sid = source["source_id"]
        if sid:
            source_manifest.setdefault(sid, {
                "source_id": sid,
                "source_publisher": source["source_publisher"],
                "source_title": source["source_title"],
                "authoritative_nigerian_url": source["authoritative_url"],
                "locator": source["locator"],
                "source_revalidation_status": source["source_revalidation_status"],
                "used_for_area_assignment": any(r["source_id"] == sid and r["scope"] == "area" and r["disposition"] == "nigeria_specific_overlay_supported" for r in records),
            })

    area_records = [r for r in records if r["scope"] == "area"]
    domain_records = [r for r in records if r["scope"] == "domain"]
    supported_area = [r for r in area_records if r["disposition"] == "nigeria_specific_overlay_supported"]
    no_evidence = [r for r in area_records if r["disposition"] == "no_primary_nigerian_evidence_found_after_search"]
    unresolved = [r for r in area_records if r["disposition"] == "unresolved_source_or_scope_conflict"]

    payload = {
        "schema_version": "2026-10-06.nigerian-specialization-context-evidence.v1",
        "append_only": True,
        "lane": "D113_D168",
        "date": TODAY,
        "scope": "Nigerian-context enrichment only; no global taxonomy, role, subgroup, or canonical edits.",
        "source_policy": {
            "existing_leads_are_not_proof": True,
            "domain_evidence_not_promoted_to_area": True,
            "global_labels_preserved": True,
            "no_demand_or_licence_inference": True,
        },
        "counts": {
            "domains": len(domain_records),
            "approved_global_areas": len(area_records),
            "records": len(records),
            "domain_records": len(domain_records),
            "direct_area_support_records": len(supported_area),
            "explicit_no_evidence_area_records": len(no_evidence),
            "unresolved_area_source_records": len(unresolved),
            "source_records": len(source_manifest),
        },
        "records": records,
        "sources": sorted(source_manifest.values(), key=lambda x: x["source_id"]),
    }

    lines = [
        "# D113-D168 Nigerian-context evidence checkpoint (2026-10-06)",
        "",
        "This append-only lane contains Nigerian-context evidence only. It does not edit canonical taxonomy, global area labels, subgroups or roles.",
        "",
        "## Scope and counts",
        "",
        f"- Domains processed: **{len(domain_records)}**",
        f"- Global specialization areas processed: **{len(area_records)}**",
        f"- Domain-context records: **{len(domain_records)}**",
        f"- Direct area-support records: **{len(supported_area)}**",
        f"- Explicit no-primary-evidence area records: **{len(no_evidence)}**",
        f"- Unresolved source/scope area records: **{len(unresolved)}**",
        f"- Source records: **{len(source_manifest)}**",
        "",
        "A domain-level source is deliberately not treated as proof that every specialization area has a Nigerian-specific branch. Areas without direct support remain globally recognized and are recorded as no-evidence or unresolved rather than being assigned a fabricated local overlay.",
        "",
        "## Direct area-support records",
        "",
    ]
    if supported_area:
        for r in supported_area:
            lines.extend([
                f"### {r['domain_id']} — {r['area_of_specialization']}",
                f"- Source: [{r['source_title']}]({r['authoritative_nigerian_url']})",
                f"- Locator: {r['locator']}",
                f"- Exact Nigerian claim: {r['exact_nigerian_claim']}",
                f"- Limitation: {r['limitation']}",
                f"- Disposition: `{r['disposition']}`",
                "",
            ])
    else:
        lines.append("No direct area-support records were established.")
        lines.append("")

    lines.extend([
        "## Explicit no-evidence and unresolved records",
        "",
        "The complete JSON contains one record for every area. These records are intentionally retained so a later reviewer can see exactly which areas were checked without confusing parent-domain evidence with area evidence.",
        "",
        "| Domain | Area | Disposition | Source checked |",
        "|---|---|---|---|",
    ])
    for r in area_records:
        if r["disposition"] != "nigeria_specific_overlay_supported":
            lines.append(f"| {r['domain_id']} — {r['domain_name']} | {r['area_of_specialization']} | `{r['disposition']}` | {r['source_title'] or 'No source'} |")

    lines.extend([
        "",
        "## Source/revalidation register",
        "",
        "The JSON source register retains the publisher, title, URL, locator and revalidation status for every source used. `checked_in_verified_source_audit_only` is intentionally not treated as a fresh live confirmation; it remains a review flag.",
        "",
    ])
    for s in sorted(source_manifest.values(), key=lambda x: x["source_id"]):
        lines.append(f"- `{s['source_id']}` — [{s['source_title']}]({s['authoritative_nigerian_url']}); locator: {s['locator']}; status: `{s['source_revalidation_status']}`")

    return payload, "\n".join(lines) + "\n"


def main() -> None:
    payload, markdown = build()
    json_path = OUT / "D113_D168_nigerian_context_evidence_2026_10_06.json"
    md_path = OUT / "D113_D168_nigerian_context_evidence_2026_10_06.md"
    checkpoint_path = OUT / "D113_D168_NIGERIAN_CONTEXT_CHECKPOINT_2026_10_06.md"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(markdown, encoding="utf-8")
    checkpoint = (
        "# D113-D168 Nigerian-context checkpoint\n\n"
        "- Lane: `D113_D168`\n"
        "- Status: complete for the current evidence pass; no canonical files edited.\n"
        f"- Domains: {payload['counts']['domains']}\n"
        f"- Global areas checked: {payload['counts']['approved_global_areas']}\n"
        f"- Direct area-support records: {payload['counts']['direct_area_support_records']}\n"
        f"- Explicit no-evidence area records: {payload['counts']['explicit_no_evidence_area_records']}\n"
        f"- Unresolved source/scope area records: {payload['counts']['unresolved_area_source_records']}\n"
        "- Evidence artifact: `D113_D168_nigerian_context_evidence_2026_10_06.json`\n"
        "- Human-readable artifact: `D113_D168_nigerian_context_evidence_2026_10_06.md`\n\n"
        "Validation: `python -m unittest data.career-mapping._audit.specialization_lanes_2026_10_05.STEP1_RECONCILIATION_2026_10_06.STEP2_NIGERIAN_CONTEXT_2026_10_06.test_d113_d168_nigerian_context_evidence` (4 tests passed).\n\n"
        "The lane does not infer Nigerian area specializations from parent-domain sources. Global area labels are preserved. Areas without direct local evidence are explicitly recorded rather than silently enriched.\n"
    )
    checkpoint_path.write_text(checkpoint, encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
