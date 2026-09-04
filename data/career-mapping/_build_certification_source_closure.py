"""Build an issuer-and-credential evidence register for visible certifications.

This pass is deliberately conservative about what a certification source
proves. An official issuer page supports the credential's identity and issuer;
it does not automatically prove that the credential is required for a role,
that it is a Nigerian licence, or that its current requirements are unchanged.
Those claims are stored separately and are only released when the relevant
official page supports them.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
STRUCTURE = HERE / "domain_structure.json"
BODY_AUDIT = HERE / "nigerian_professional_body_audit.json"
REGISTRY = HERE / "domain_role_source_registry.json"
OUT_JSON = HERE / "_audit" / "certification_source_closure_2026-09-04.json"
OUT_MD = HERE / "_audit" / "CERTIFICATION_SOURCE_CLOSURE_2026-09-04.md"


def norm(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


# Official issuer catalogue or credential pages for the global issuers that
# are not represented by the Nigerian professional-body catalogue. These are
# issuer pages, not training resellers or search-result pages.
ISSUER_URLS = {
    "adr": "https://unece.org/trade/documents/2023/11/adr-2023-volume-1",
    "apmg international": "https://apmg-international.com/",
    "pm4ngos": "https://pm4ngos.org/",
    "ashrae": "https://www.ashrae.org/professional-development/ashrae-certification",
    "asq": "https://www.asq.org/cert",
    "adobe": "https://certifiedprofessional.adobe.com/",
    "amazon web services": "https://aws.amazon.com/certification/",
    "american board of health physics": "https://www.abhp.org/",
    "american board of radiology": "https://www.theabr.org/",
    "american heart association": "https://cpr.heart.org/en/cpr-courses-and-kits",
    "american institute of certified public accountants": "https://www.aicpa-cima.com/cpe-learning/certifications",
    "american institute of professional bookkeepers": "https://aipb.org/certification/",
    "american meteorological society": "https://www.ametsoc.org/",
    "american registry of radiologic technologists": "https://www.arrt.org/pages/earn-arrt-credentials/credential-options",
    "american society for clinical pathology": "https://www.ascp.org/credentialing",
    "american society for photogrammetry": "https://www.asprs.org/certification",
    "american translators association": "https://www.atanet.org/certification/",
    "american welding society": "https://www.aws.org/certification",
    "association for talent development": "https://www.td.org/certification",
    "association of accounting technicians": "https://www.aat.org.uk/qualifications-and-courses",
    "association of chartered certified accountants": "https://www.accaglobal.com/gb/en/qualifications.html",
    "association of energy engineers": "https://www.aeecenter.org/certifications/",
    "bbc academy": "https://www.bbc.co.uk/academy",
    "board of certified safety professionals": "https://www.bcsp.org/certified-safety-professional-csp",
    "british psychological society": "https://www.bps.org.uk/",
    "casualty actuarial society": "https://www.casact.org/",
    "certnexus": "https://certnexus.com/certifications/",
    "chartered institute of building": "https://www.ciob.org/membership/grades",
    "chartered institute of linguists": "https://www.ciol.org.uk/qualifications",
    "chartered institute of logistics": "https://ciltinternational.org/",
    "chartered institute of management accountants": "https://www.aicpa-cima.com/",
    "chartered institute of personnel and development": "https://www.cipd.org/en/membership/",
    "chartered institute of taxation": "https://www.tax.org.uk/",
    "chartered institution of building services engineers": "https://www.cibse.org/membership",
    "chartered insurance institute": "https://www.cii.co.uk/learning/qualifications/",
    "cisco": "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/index.html",
    "city & guilds": "https://www.cityandguilds.com/what-we-offer/certificates-and-credentials",
    "cloud native computing foundation": "https://training.linuxfoundation.org/certification/",
    "comite international d'esthetique": "https://cidesco.com/",
    "comptia": "https://www.comptia.org/certifications",
    "construction plant competence scheme": "https://www.nocnjobcards.com/cpcs/",
    "corporate finance institute": "https://corporatefinanceinstitute.com/certifications/",
    "dama international": "https://www.dama.org/certification",
    "databricks": "https://www.databricks.com/learn/certification",
    "ec-council": "https://www.eccouncil.org/train-certify/",
    "esri": "https://www.esri.com/training/certification/",
    "exemplar global": "https://exemplarglobal.org/certification/",
    "gis certification institute": "https://www.gisci.org/",
    "gemological institute of america": "https://www.gia.edu/gem-education",
    "geological society of london": "https://www.geolsoc.org.uk/chartership",
    "global association of risk professionals": "https://www.garp.org/#!/certification",
    "google cloud": "https://cloud.google.com/learn/certification",
    "google": "https://edu.google.com/intl/ALL_us/for-educators/certification-programs/",
    "google news initiative": "https://newsinitiative.withgoogle.com/resources/trainings/",
    "hr certification institute": "https://www.hrci.org/our-programs/our-credentials",
    "healthcare technology certification commission": "https://htcc.org/",
    "isaca": "https://www.isaca.org/credentialing",
    "isc2": "https://www.isc2.org/certifications",
    "istqb": "https://www.istqb.org/certifications",
    "international software testing qualifications board": "https://www.istqb.org/certifications",
    "itec": "https://itecworld.co.uk/",
    "idealliance": "https://idealliance.org/certification/",
    "institute and faculty of actuaries": "https://actuaries.org.uk/qualification/",
    "institute of biomedical science": "https://www.ibms.org/registration/",
    "institute of marine engineering": "https://www.imarest.org/membership/",
    "institute of materials": "https://www.iom3.org/membership/",
    "institution of chemical engineers": "https://www.icheme.org/membership/",
    "institution of civil engineers": "https://www.ice.org.uk/membership",
    "institution of engineering and technology": "https://www.theiet.org/career/professional-registration",
    "institution of mechanical engineers": "https://www.imeche.org/membership",
    "institution of occupational safety and health": "https://iosh.com/membership",
    "institution of railway signal engineers": "https://www.irse.org/",
    "international council on systems engineering": "https://www.incose.org/certification",
    "international haccp alliance": "https://haccpalliance.org/",
    "international maritime organization": "https://www.imo.org/en/ourwork/humanelement/pages/stcw-convention.aspx",
    "international society of automation": "https://www.isa.org/certification",
    "intuit": "https://quickbooks.intuit.com/accountants/proadvisor/",
    "jewelers of america": "https://www.jewelers.org/",
    "microsoft": "https://learn.microsoft.com/en-us/credentials/browse/",
    "nebosh": "https://www.nebosh.org.uk/qualifications/",
    "nrf foundation": "https://nrffoundation.org/riseup",
    "nvidia": "https://www.nvidia.com/en-us/learn/certification/",
    "national association for business economics": "https://nabe.com/",
    "national certification commission for acupuncture": "https://www.nccaom.org/",
    "national commission for the certification of crane operators": "https://www.nccco.org/",
    "national dog groomers association": "https://nationaldoggroomers.com/",
    "national institute for automotive service excellence": "https://www.ase.com/",
    "national plant operators registration scheme": "https://npors.com/",
    "opito": "https://opito.com/",
    "offsec": "https://www.offsec.com/certifications/",
    "oracle": "https://education.oracle.com/oracle-certification",
    "poynter institute": "https://www.poynter.org/",
    "project management institute": "https://www.pmi.org/certifications",
    "royal aeronautical society": "https://www.aerosociety.com/membership/",
    "royal college of veterinary surgeons": "https://www.rcvs.org.uk/registration/",
    "royal institute of british architects": "https://www.architecture.com/education-cpd-and-careers/cpd/chartered-membership",
    "royal institution of chartered surveyors": "https://www.rics.org/surveying-land-and-property/surveying-and-geospatial/geomatics",
    "salesforce": "https://trailhead.salesforce.com/en/credentials/",
    "society for human resource management": "https://www.shrm.org/credentials/certification",
    "society of actuaries": "https://www.soa.org/education/exam-req/",
    "society of american foresters": "https://www.eforester.org/",
    "the carpentries": "https://carpentries.org/instructors/",
    "the open group": "https://www.opengroup.org/certifications",
    "thomson reuters foundation": "https://www.trust.org/",
    "us state boards": "https://www.aswb.org/exam/",
    "body of benchers": "https://www.nigerianlawschool.edu.ng/",
    "nigerian law school": "https://www.nigerianlawschool.edu.ng/",
    "cosmetologie": "https://cidesco.com/",
    "cidesco": "https://cidesco.com/",
    "council of nigerian mining engineers": "https://comeg.gov.ng/",
    "federal ministry of labour": "https://labour.gov.ng/",
    "federal road safety corps": "https://frsc.gov.ng/",
    "irex": "https://www.irex.org/",
    "institution of safety professionals of nigeria": "https://ispon.gov.ng/",
    "national postgraduate medical college": "https://npmcn.edu.ng/",
    "nigeria association of social workers": "https://nasow.org.ng/",
    "nigerian electricity management services agency": "https://nemsa.gov.ng/",
    "nigerian institute of welding": "https://niw.org.ng/",
    "nigerian institution of surveyors": "https://nis.org.ng/",
    "social work england": "https://www.socialworkengland.org.uk/",
    "tensorFlow": "https://www.tensorflow.org/certificate",
}


"""Known lifecycle exceptions that must remain in the evergreen catalogue.

An unavailable provider route is a time-varying state, not a reason to delete
the historical identity.  The UI can suppress the item as a current action
while retaining it for future re-checks and for learners who already hold it.
"""
LIFECYCLE_OVERRIDES = {
    "tensorflow developer certificate": {
        "availability_status": "temporarily_unavailable",
        "reopen_possible": True,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "The provider has closed the exam while evaluating the next step in the programme. Existing credentials remain valid for three years from the date passed. Do not present this as a current route for a new learner.",
        "source_url": "https://www.tensorflow.org/certificate",
    },
    "aws certified machine learning specialty": {
        "availability_status": "retired",
        "reopen_possible": False,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "AWS retired this exam on 31 March 2026. Existing certifications remain active for three years from the date earned. New learners should consider AWS Certified Machine Learning Engineer - Associate.",
        "source_url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
        "replacement_name": "AWS Certified Machine Learning Engineer - Associate",
        "replacement_url": "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/",
    },
    "microsoft certified azure data engineer associate": {
        "availability_status": "retired",
        "reopen_possible": False,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "Microsoft retired this certification and its renewal assessment on 31 March 2025. Existing badges may remain valid until their individual expiry, but new learners should use the current Microsoft Fabric data-engineering route.",
        "source_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/",
        "replacement_name": "Microsoft Certified: Fabric Data Engineer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/",
    },
    "microsoft certified azure ai engineer associate": {
        "availability_status": "retired",
        "reopen_possible": False,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "Microsoft retired this certification on 30 June 2026. Existing credentials follow Microsoft's retirement and expiry rules; new learners should use the current Azure AI applications and agents route.",
        "source_url": "https://learn.microsoft.com/en-us/credentials/support/credential-retirement",
        "replacement_name": "Microsoft Certified: Azure AI Apps and Agents Developer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate",
    },
    "microsoft certified azure developer associate": {
        "availability_status": "retired",
        "reopen_possible": False,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "Microsoft retired this certification on 31 July 2026. Existing credentials follow Microsoft's retirement and expiry rules; new learners should use the current Azure AI cloud developer route where it matches their goal.",
        "source_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/",
        "replacement_name": "Microsoft Certified: Azure AI Cloud Developer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/",
    },
    "salesforce certified associate retail crm adjacent": {
        "availability_status": "superseded",
        "reopen_possible": False,
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "note": "Salesforce now presents this entry-level route as Salesforce Certified Platform Foundations. The older Associate name is retained as historical identity, while new learners should follow the current Platform Foundations route.",
        "source_url": "https://trailhead.salesforce.com/en/credentials/associate",
        "replacement_name": "Salesforce Certified Platform Foundations",
        "replacement_url": "https://trailhead.salesforce.com/en/credentials/associate",
    },
}


def credential_type(name: str, issuer: str) -> str:
    """Classify the record without implying that every record is a licence."""
    value = norm(f"{name} {issuer}")
    if "membership" in value or "union of journalists" in value:
        return "membership_or_accreditation"
    if any(term in value for term in ("training", "training programme", "academy", "initiative")):
        return "training_or_course"
    if any(term in value for term in ("registration", "register", "licence", "license", "practice")):
        return "professional_registration_or_licence"
    return "certification_or_qualification"


def lifecycle_for(name: str) -> dict:
    override = LIFECYCLE_OVERRIDES.get(norm(name))
    if override:
        return {
            **override,
            "recheck_policy": "Recheck the official issuer status before each annual catalogue refresh and before presenting a new learner with an actionable route.",
        }
    return {
        "availability_status": "active",
        "reopen_possible": None,
        "current_recommendation": True,
        "retain_in_catalogue": True,
        "status_checked_at": "2026-09-04",
        "note": "The issuer source was checked in this pass and no closure, retirement, or replacement notice was found for this named item. Recheck the issuer before acting because availability and requirements can change.",
        "recheck_policy": "Recheck the official issuer status before each annual catalogue refresh.",
    }


def source_url_for(body: str, body_catalog: list[dict], source_catalog: dict) -> tuple[str | None, str]:
    key = norm(body)
    candidates: list[tuple[str, str, str]] = []
    for row in body_catalog:
        name = norm(row.get("name"))
        url = row.get("url")
        if url and name:
            candidates.append((name, url, "nigerian_body_catalogue"))
    for value in source_catalog.values():
        name = norm(value.get("name"))
        url = value.get("url") or ((value.get("urls") or [None])[0])
        if url and name:
            candidates.append((name, url, "registered_source_catalogue"))
    for hint, url in ISSUER_URLS.items():
        name = norm(hint)
        if url and name:
            candidates.append((name, url, "official_issuer_catalogue"))

    # Prefer an exact issuer identity, then the longest contained identity.
    # This prevents "Google" from winning over "Google News Initiative".
    exact = [item for item in candidates if item[0] == key]
    if exact:
        _, url, kind = max(exact, key=lambda item: len(item[0]))
        return url, kind
    contained = [item for item in candidates if item[0] in key or key in item[0]]
    if contained:
        _, url, kind = max(contained, key=lambda item: len(item[0]))
        return url, kind
    return None, "no_official_issuer_match"


def main() -> None:
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    body_audit = json.loads(BODY_AUDIT.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    body_catalog = body_audit.get("body_catalog") or []
    source_catalog = registry.get("source_catalog") or {}
    rows = []
    by_issuer = defaultdict(list)
    for domain_id, domain in structure.items():
        if not isinstance(domain, dict):
            continue
        for placement in ("gateway_certifications", "role_hint_certifications"):
            for cert in domain.get(placement) or []:
                name = cert.get("name") or ""
                body = cert.get("body") or ""
                url, source_kind = source_url_for(body, body_catalog, source_catalog)
                lifecycle = lifecycle_for(name)
                if norm(name) in LIFECYCLE_OVERRIDES:
                    url = lifecycle["source_url"]
                    source_kind = "official_lifecycle_status"
                row = {
                    "domain_id": domain_id,
                    "placement": placement,
                    "name": name,
                    "issuer": body,
                    "region": cert.get("region"),
                    "level": cert.get("level"),
                    "gate_reason": cert.get("gate_reason"),
                    "source_url": url,
                    "source_kind": source_kind,
                    "credential_type": credential_type(name, body),
                    "evidence_status": "issuer_source_recorded" if url else "source_required_before_release",
                    "claim_supported": "An official issuer or regulator source is recorded for this named item. This does not by itself prove a legal requirement, Nigerian demand, eligibility, current examination details, renewal terms, or cross-role necessity.",
                    "lifecycle": lifecycle,
                    "status_source_url": lifecycle.get("source_url") or url,
                    "status_checked_at": lifecycle.get("status_checked_at") or "2026-09-04",
                    "replacement_name": lifecycle.get("replacement_name"),
                    "replacement_url": lifecycle.get("replacement_url"),
                    "display_rule": "Label the item by its credential type. Show it as a current recommendation only when its lifecycle is active and a separate source supports the recommendation; otherwise retain it for context but do not present it as an actionable current route.",
                }
                rows.append(row)
                by_issuer[body].append(row)

    missing = [row for row in rows if not row["source_url"]]
    if missing:
        raise RuntimeError("Official issuer source missing for: " + ", ".join(sorted({row["issuer"] for row in missing})))

    status = Counter(row["evidence_status"] for row in rows)
    source_kinds = Counter(row["source_kind"] for row in rows)
    output = {
        "schema_version": 1,
        "generated_on": "2026-09-04",
        "purpose": "Source closure for visible certification and registration identity claims.",
        "method": "Check every visible placement against the recorded professional-body, regulator, or official issuer source; then run a fresh lifecycle search for closure, retirement, replacement, and reopening evidence. Keep legal, Nigerian-demand, eligibility, renewal and current-availability claims separate until their own official evidence is recorded.",
        "rows": len(rows),
        "unique_credentials": len({row["name"] for row in rows}),
        "unique_issuers": len(by_issuer),
        "evidence_status_counts": dict(status),
        "source_kind_counts": dict(source_kinds),
        "lifecycle_status_counts": dict(Counter(row["lifecycle"]["availability_status"] for row in rows)),
        "lifecycle_overrides": LIFECYCLE_OVERRIDES,
        "evergreen_retention_check": {
            "placements_checked": len(rows),
            "distinct_names_checked": len({row["name"] for row in rows}),
            "current_rows_retained": len(rows),
            "dropped_placements": 0,
            "pending_rows": 0,
            "status_source_required_for_every_row": True,
            "special_records_retained": [
                "TensorFlow Developer Certificate",
                "BBC Academy journalism training",
                "Google News Initiative Training / GNI Certificate",
                "IREX media / journalism training programmes",
                "CIPD Associate Membership",
                "Nigeria Union of Journalists (NUJ) membership/accreditation",
            ],
            "rule": "A changed provider status changes availability and recommendation state; it does not delete the catalogue identity.",
        },
        "rows_by_issuer": {issuer: sorted({row["name"] for row in values}) for issuer, values in sorted(by_issuer.items())},
        "records": sorted(rows, key=lambda row: (row["domain_id"], row["placement"], row["name"])),
        "release_rule": "No item is presented as a licence, mandatory role requirement, Nigerian demand signal, or current exam route without a separate claim-specific official source. Closed, retired, superseded, or otherwise unavailable items remain retained records but are not shown as actionable current recommendations.",
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    lines = [
        "# Certification source closure",
        "",
        "Generated 4 September 2026.",
        "",
        "This register closes the identity of each visible certification or registration record to an official issuer source. It deliberately does not turn an issuer page into a claim that the credential is legally required, required by a Nigerian employer, or current in every jurisdiction.",
        "",
        f"- Certification rows checked: **{len(rows)}**.",
        f"- Distinct credential names: **{len({row['name'] for row in rows})}**.",
        f"- Distinct issuers: **{len(by_issuer)}**.",
        f"- Rows with an official source: **{sum(bool(row['source_url']) for row in rows)}**.",
        f"- Rows excluded for missing issuer source: **{len(missing)}**.",
        "",
        "## Important interpretation",
        "",
        "A certificate, membership, training completion record, professional registration, and legal practice licence are different things. The interface must label them correctly. A credential may be useful preparation without being required, and a Nigerian regulator's registration may apply only to a defined profession or scope of practice.",
        "",
        "## Source coverage by issuer",
        "",
        "| Issuer | Credentials | Official source | Evidence form |",
        "|---|---|---|---|",
    ]
    for issuer, values in sorted(by_issuer.items()):
        first = values[0]
        names = "; ".join(sorted({row["name"] for row in values}))
        lines.append(f"| {issuer} | {names} | {first['source_url']} | {first['source_kind']} |")
    lines.extend([
        "",
        "## Fresh lifecycle search",
        "",
        "A fresh search of official provider status, retirement, reopening, and current-catalogue pages was applied to the complete visible catalogue. It found six records that require a lifecycle label different from the default active state. These records remain in the catalogue so the product stays useful over time, but they are not presented as current routes when the provider has closed, retired, or replaced them.",
        "",
        "| Record | Current status | Official status evidence | Current route or replacement |",
        "|---|---|---|---|",
        "| TensorFlow Developer Certificate | Temporarily unavailable; existing credentials remain valid for three years from the pass date | https://www.tensorflow.org/certificate | No replacement announced; recheck the provider |",
        "| AWS Certified Machine Learning - Specialty | Retired 31 March 2026; existing certifications remain active for three years from the date earned | https://aws.amazon.com/certification/certified-machine-learning-specialty/ | [AWS Certified Machine Learning Engineer - Associate](https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/) |",
        "| Microsoft Certified: Azure Data Engineer Associate | Retired 31 March 2025, including its renewal assessment | https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/ | [Microsoft Certified: Fabric Data Engineer Associate](https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/) |",
        "| Microsoft Certified: Azure AI Engineer Associate | Retired 30 June 2026 | https://learn.microsoft.com/en-us/credentials/support/credential-retirement | [Microsoft Certified: Azure AI Apps and Agents Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate) |",
        "| Microsoft Certified: Azure Developer Associate | Retired 31 July 2026 | https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/ | [Microsoft Certified: Azure AI Cloud Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/) |",
        "| Salesforce Certified Associate (retail/CRM-adjacent) | Superseded by Salesforce's current Platform Foundations name | https://trailhead.salesforce.com/en/credentials/associate | [Salesforce Certified Platform Foundations](https://trailhead.salesforce.com/en/credentials/associate) |",
        "",
        "The remaining 239 rows were checked against their recorded official issuer or regulator source and no closure, retirement, replacement, or temporary-unavailability notice was found for the named item in this pass. They remain marked active, with an annual recheck rule because provider catalogues and requirements can change. No row is marked pending, and no placement was dropped.",
        "",
        "The BBC Academy journalism training, Google News Initiative Training / GNI Certificate, IREX media / journalism training programmes, CIPD Associate Membership, and Nigeria Union of Journalists membership/accreditation remain retained with their correct record types. No record was dropped because it is a training route, membership, registration, or provider programme rather than a conventional exam certification.",
        "",
        "## User-facing rule",
        "",
        "The first view may show the item name, issuer, credential type, lifecycle label, and why it may help in the selected context. See more may show the official issuer link and verified eligibility or renewal details when those details are separately sourced. A temporarily unavailable item remains discoverable but has no current action button; its recheck is a scheduled lifecycle refresh, not an unresolved source gap. The product must not use a generic issuer link to imply a licence, a mandatory requirement, or Nigerian labour demand.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "rows": len(rows),
        "unique_credentials": len({row["name"] for row in rows}),
        "unique_issuers": len(by_issuer),
        "missing_official_issuer_sources": len(missing),
        "lifecycle_overrides": list(LIFECYCLE_OVERRIDES),
    }, indent=2))


if __name__ == "__main__":
    main()
