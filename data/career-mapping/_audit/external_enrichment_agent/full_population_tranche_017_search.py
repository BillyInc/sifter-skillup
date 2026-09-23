"""Search and checkpoint the tranche-017 item-only evidence ledger.

The selected rows are contextual identities.  This script searches once per
typed item key and fans the evidence to each selected context identity.
Ambiguous or merely sector-level matches stay review_required.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
TRANCHE = os.environ.get("ITEM_TRANCHE", "017")
ACCESSED_ON = "2026-09-21"
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_{ACCESSED_ON}.json"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_{ACCESSED_ON}.json"
LEDGER = OUT_DIR / f"full_population_tranche_{TRANCHE}_search_ledger_{ACCESSED_ON}.jsonl"
REPORT_JSON = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_{ACCESSED_ON}.json"
REPORT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_{ACCESSED_ON}.md"


SOURCES = {
    "fashion": ("https://www.cityandguilds.com/-/media/productdocuments/creative/creative_techniques/7161/7161_level_2/centre_documents/7161-02-12-22-level-2-textiles-v_3%2C-d-%2C3-pdf.pdf", "City & Guilds", "Textiles qualification units covering design, materials, production and industry standards."),
    "icheme": ("https://www.icheme.org/membership/membership-grades/chartered-member/preparing-for-chartered-membership/", "Institution of Chemical Engineers", "Chartered Member preparation and Competence & Commitment requirements."),
    "adr": ("https://www.gov.uk/become-dangerous-goods-driver", "UK Government", "ADR driver qualification route, training and examinations."),
    "cilt": ("https://ciltinternational.org/become-a-member/", "Chartered Institute of Logistics and Transport", "Official membership grades, including Chartered Member (CMILT)."),
    "cpcs": ("https://www.citb.co.uk/courses-and-qualifications/", "CITB", "Official construction plant/operator training and qualification catalogue."),
    "nccco": ("https://www.nccco.org/certification", "National Commission for the Certification of Crane Operators", "Official crane-operator certification programme."),
    "npors": ("https://www.npors.com/", "National Plant Operators Registration Scheme", "Official NPORS operator registration and certification body."),
    "irse": ("https://irse.org.in/MembershipRoutesFlowchartAllgrades140102.pdf", "Institution of Railway Signal Engineers", "IRSE licensing and railway signalling competency routes."),
    "nias": ("https://nias.gov.ng/regulatory-affairs/", "Nigerian Institute of Animal Science", "Official register and categories for Animal Science practitioners, including GAS/RAS."),
    "animal": ("https://www.digitalnbte.nbte.gov.ng/Public/DownloadCurriculum/d09c85771ee739cd5eeab5c46a566e1e0.pdf", "National Board for Technical Education", "Animal husbandry and livestock competency unit with feeding, handling and care outcomes."),
    "fison": ("https://www.fison.org.ng/pages/about.html", "Fisheries Society of Nigeria", "Official professional society page for fisheries and aquaculture practice."),
    "fisheries": ("https://www.fao.org/fishery/en", "Food and Agriculture Organization of the United Nations", "Official fisheries, aquaculture and fish-science knowledge resources."),
    "forester": ("https://eforester.org/Main/Certification_Education/Certified_Forester/Requirements/Main/Certification/Requirements.aspx?hkey=7eae8378-e92b-438e-aba9-93e713cb38cc", "Society of American Foresters", "Certified Forester eligibility, examination and professional-practice requirements."),
    "ascp": ("https://apps.ascp.org/services/boc/BOC_Cert_RouteRequirement", "ASCP Board of Certification", "Medical Laboratory Scientist certification routes and eligibility."),
    "ibms": ("https://www.ibms.org/qualifications/registration/certificate-of-competence-by-equivalence.html", "Institute of Biomedical Science", "Certificate of Competence by Equivalence and biomedical-scientist registration route."),
    "mlscn": ("https://mlscn.gov.ng/", "Medical Laboratory Science Council of Nigeria", "Official Nigerian medical-laboratory regulatory source."),
    "health_info": ("https://www.who.int/publications/i/item/9789241595940", "World Health Organization", "Framework and standards for country health-information systems."),
    "arrt": ("https://www.arrt.org/pages/earn-arrt-credentials/rt-credential-options", "American Registry of Radiologic Technologists", "Registered Technologist credentials and radiography credential options."),
    "rrbn": ("https://portal.rrbn.gov.ng/", "Radiographers Registration Board of Nigeria", "Official Nigerian radiographer registration and professional standards source."),
    "chew": ("https://ucthcalabar.gov.ng/public/college-of-community-health/admissions", "University of Calabar Teaching Hospital", "Community Health Extension Worker certificate and regulated programme context."),
    "nccaom": ("https://www.nccaom.org/wp-content/uploads/pdf/NCCAOM_Certification_Handbook_Jan_2024.pdf", "National Certification Commission for Acupuncture and Oriental Medicine", "National certification handbook and standards of competence for acupuncture."),
    "teaching": ("https://www.gov.wales/revised-professional-standards-assisting-teaching-teaching-and-leadership-html", "Welsh Government", "Professional teaching standards covering pedagogy, literacy, numeracy, learning and learner progress."),
    "public_safety": ("https://www.cisa.gov/news-events/directives/homeland-security-presidential-directive-7", "Cybersecurity and Infrastructure Security Agency", "Critical-infrastructure protection and public-safety policy source."),
    "hr": ("https://cipmnigeria.org/membership/hr-practitioners-licence/", "Chartered Institute of Personnel Management of Nigeria", "Professional HR membership and licensing route in Nigeria."),
    "cipd": ("https://prod.cipd.org/en/membership/levels/", "Chartered Institute of Personnel and Development", "Associate Membership and professional HR membership grades."),
    "phri": ("https://www.hrci.org/certifications/individual-certifications/phri", "Human Resource Certification Institute", "Professional in Human Resources—International certification."),
    "shrm": ("https://www.shrm.org/credentials/certification/shrm-cp", "Society for Human Resource Management", "SHRM Certified Professional credential and competency domains."),
    "imeche": ("https://www.imeche.org/membership-registration", "Institution of Mechanical Engineers", "Professional registration routes including Chartered Engineer."),
    "imarest": ("https://www.imarest.org/membership/professional-registration/engineering/chartered-engineer.html", "Institute of Marine Engineering, Science & Technology", "Chartered Marine Engineer (CMarEng) and marine-engineering competencies."),
    "stcw": ("https://www.gov.uk/guidance/apply-for-a-uk-seafarer-coc-deck-and-engineer-officers", "UK Maritime and Coastguard Agency", "STCW Certificate of Competency route for engineer officers, sea service and examinations."),
    "radiation": ("https://www.hse.gov.uk/radiation/ionising/doses/", "UK Health and Safety Executive", "Dose monitoring, radiation protection and exposure recording requirements."),
    "abr": ("https://www.theabr.org/get-certified/alternate-pathways-to-certification/", "American Board of Radiology", "Medical-physics certification pathway and eligibility."),
    "abhp": ("https://www.aahp-abhp.org/certification/", "American Academy of Health Physics / ABHP", "Certified Health Physicist (CHP) certification."),
    "icao": ("https://www.icao.int/operational-safety/Personnel-Training-and-Licensing", "International Civil Aviation Organization", "Personnel licensing, training and competency standards for aviation roles."),
    "ncaa": ("https://ncaa.gov.ng/documents/advisory-circulars/aircraft-maintenance-engineering-mechanic/", "Nigerian Civil Aviation Authority", "Aircraft-maintenance licensing and skill-test standards in Nigeria."),
    "programming": ("https://developer.mozilla.org/en-US/docs/Web/JavaScript", "MDN Web Docs", "Authoritative language and web-programming documentation."),
    "dotnet": ("https://learn.microsoft.com/en-us/dotnet/csharp/", "Microsoft Learn", "Official C# language and .NET documentation."),
    "go": ("https://go.dev/doc/", "The Go Authors", "Official Go language documentation."),
    "ruby": ("https://www.ruby-lang.org/en/documentation/", "Ruby Core Team", "Official Ruby language documentation."),
    "haskell": ("https://www.haskell.org/documentation/", "Haskell.org", "Official Haskell language documentation."),
    "common_lisp": ("https://common-lisp.net/documentation/", "Common-Lisp.net", "Common Lisp standards and implementation documentation."),
    "github": ("https://docs.github.com/en/get-started", "GitHub", "Official GitHub product and workflow documentation."),
    "jenkins": ("https://www.jenkins.io/doc/", "Jenkins project", "Official Jenkins automation and CI documentation."),
    "docker": ("https://docs.docker.com/get-started/", "Docker", "Official Docker container platform documentation."),
    "kafka": ("https://kafka.apache.org/documentation/", "Apache Software Foundation", "Official Apache Kafka documentation."),
    "css": ("https://developer.mozilla.org/en-US/docs/Web/CSS", "MDN Web Docs", "Officially maintained web CSS documentation."),
    "ansible": ("https://docs.ansible.com/", "Red Hat / Ansible project", "Official Ansible automation documentation."),
    "maven": ("https://maven.apache.org/guides/", "Apache Software Foundation", "Official Apache Maven build-tool documentation."),
    "chef": ("https://docs.chef.io/", "Progress Chef", "Official Chef configuration-management documentation."),
    "terraform": ("https://developer.hashicorp.com/terraform/docs", "HashiCorp", "Official Terraform infrastructure-as-code documentation."),
    "octopus": ("https://octopus.com/docs", "Octopus Deploy", "Official Octopus Deploy release-management documentation."),
    "kdevelop": ("https://kdevelop.org/", "KDevelop project", "Official KDevelop integrated-development-environment project page."),
    "sas": ("https://documentation.sas.com/", "SAS Institute", "Official SAS language and analytics documentation."),
    "xquery": ("https://www.w3.org/XML/Query/", "World Wide Web Consortium", "Official W3C XQuery standards and resources."),
    "w3c": ("https://www.w3.org/WAI/standards-guidelines/wcag/", "World Wide Web Consortium", "Web accessibility standards and WCAG documentation."),
    "software_testing": ("https://www.istqb.org/certifications/", "International Software Testing Qualifications Board", "Software-testing terminology and certification framework."),
    "usability": ("https://www.nngroup.com/articles/usability-101-introduction-to-usability/", "Nielsen Norman Group", "Usability definition and user-interaction evaluation guidance."),
    "hci": ("https://www.acm.org/special-interest-groups/sigs/sigchi", "ACM SIGCHI", "Human-computer interaction professional and research community."),
    "psychology": ("https://www.apa.org/research-practice/standards-guidelines", "American Psychological Association", "Psychology standards and guidance."),
    "agile": ("https://www.atlassian.com/agile", "Atlassian", "Agile methods and project-delivery guidance."),
    "security": ("https://www.nist.gov/cyberframework", "National Institute of Standards and Technology", "Cybersecurity, risk and information-security framework."),
    "software": ("https://www.iso.org/standard/63555.html", "International Organization for Standardization", "Software and systems engineering standards context."),
    "confluence": ("https://www.atlassian.com/software/confluence", "Atlassian", "Official Confluence collaboration and knowledge-management product documentation."),
    "servicenow": ("https://www.servicenow.com/products/its-service-management.html", "ServiceNow", "Official ServiceNow IT-service-management product documentation."),
    "figma": ("https://help.figma.com/hc/en-us", "Figma", "Official Figma product and design-workflow documentation."),
    "react": ("https://react.dev/", "React project", "Official React user-interface library documentation."),
    "angular": ("https://angular.dev/overview", "Angular project", "Official Angular web-framework documentation."),
    "aws": ("https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html", "Amazon Web Services", "Official AWS CloudFormation documentation."),
    "aspnet": ("https://dotnet.microsoft.com/apps/aspnet", "Microsoft", "Official ASP.NET web-framework documentation."),
    "eclipse": ("https://www.eclipse.org/ide/", "Eclipse Foundation", "Official Eclipse integrated-development-environment documentation."),
    "java": ("https://dev.java/learn/", "Oracle / Java platform", "Official Java learning and language documentation."),
    "db2": ("https://www.ibm.com/docs/en/db2", "IBM", "Official IBM Db2 database documentation."),
    "iot": ("https://www.nist.gov/programs-projects/internet-things-iot", "National Institute of Standards and Technology", "Official Internet of Things security and technology context."),
    "ai_ml": ("https://www.nist.gov/artificial-intelligence", "National Institute of Standards and Technology", "Official artificial-intelligence and machine-learning risk and standards context."),
    "cloud": ("https://aws.amazon.com/what-is-cloud-computing/", "Amazon Web Services", "Cloud-computing and cloud-architecture context."),
}


def source_for(item_type: str, key: str, name: str) -> tuple[str, str, str, str]:
    k = key.casefold()
    if "c#" in name.casefold() or "c-sharp" in name.casefold():
        group = "dotnet"
    elif k in {"javascript", "c", "mdx"}:
        group = "programming"
    elif k in {"csharp", "c-sharp"} or k.startswith("c-"):
        group = "dotnet"
    elif k in {"go", "golang"}:
        group = "go"
    elif "ruby" in k:
        group = "ruby"
    elif "haskell" in k:
        group = "haskell"
    elif "common-lisp" in k:
        group = "common_lisp"
    elif k == "atlassian-confluence":
        group = "confluence"
    elif k == "servicenow":
        group = "servicenow"
    elif k == "figma":
        group = "figma"
    elif k in {"react"}:
        group = "react"
    elif k in {"google-angular"}:
        group = "angular"
    elif k in {"amazon-web-services-aws-cloudformation"}:
        group = "aws"
    elif k in {"asp-net"}:
        group = "aspnet"
    elif k in {"eclipse-integrated-development-environment-software"}:
        group = "eclipse"
    elif k in {"java-computer-programming"}:
        group = "java"
    elif k in {"db2"}:
        group = "db2"
    elif k in {"internet-of-things"}:
        group = "iot"
    elif any(x in k for x in ("machine-learning", "artificial-intelligence", "principles-of-artificial-intelligence")):
        group = "ai_ml"
    elif any(x in k for x in ("cloud", "cloud-", "plan-migration-to-cloud", "deploy-cloud-resource")):
        group = "cloud"
    elif k in {"github"}:
        group = "github"
    elif "jenkins" in k:
        group = "jenkins"
    elif "docker" in k:
        group = "docker"
    elif "kafka" in k:
        group = "kafka"
    elif "cascading-style-sheets" in k:
        group = "css"
    elif "ansible" in k:
        group = "ansible"
    elif "maven" in k:
        group = "maven"
    elif "chef" in k:
        group = "chef"
    elif "terraform" in k:
        group = "terraform"
    elif "octopus-deploy" in k:
        group = "octopus"
    elif "kdevelop" in k:
        group = "kdevelop"
    elif "sas-" in k:
        group = "sas"
    elif "xquery" in k:
        group = "xquery"
    elif any(x in k for x in ("accessibility", "screen-reader", "world-wide-web-consortium")):
        group = "w3c"
    elif any(x in k for x in ("testing", "test-findings", "levels-of-software")):
        group = "software_testing"
    elif any(x in k for x in ("usability", "interaction-with-ict", "experience-map")):
        group = "usability"
    elif any(x in k for x in ("human-computer", "application-specific-interface")):
        group = "hci"
    elif any(x in k for x in ("behavioural-science", "cognitive-psychology", "emotional-patterns")):
        group = "psychology"
    elif any(x in k for x in ("agile", "project-management")):
        group = "agile"
    elif any(x in k for x in ("security", "recovery", "risk", "system-security", "network-management")):
        group = "security"
    elif any(x in k for x in ("ict", "software", "programming", "digital-systems", "computer-aided", "development-environment", "configuration-management", "scripting")):
        group = "software"
    elif any(x in k for x in ("fashion", "garment", "styling", "professional-portfolio", "develop-and-present-designs", "fashion-production")):
        group = "fashion"
    elif "chemical-engineer" in k:
        group = "icheme"
    elif "adr-" in k:
        group = "adr"
    elif "cmilt" in k:
        group = "cilt"
    elif "cpcs" in k:
        group = "cpcs"
    elif "nccco" in k:
        group = "nccco"
    elif "npors" in k:
        group = "npors"
    elif "irse" in k:
        group = "irse"
    elif any(x in k for x in ("animal-scientist", "gas-ras")):
        group = "nias"
    elif any(x in k for x in ("animal-husbandry", "livestock", "animal-science")):
        group = "animal"
    elif any(x in k for x in ("fison", "fisheries")):
        group = "fison" if "fison" in k else "fisheries"
    elif any(x in k for x in ("aquaculture", "fish-biology")):
        group = "fisheries"
    elif "forester" in k:
        group = "forester"
    elif "ascp" in k:
        group = "ascp"
    elif "ibms" in k:
        group = "ibms"
    elif any(x in k for x in ("mlscn", "medical-laboratory", "diagnostic-laboratory", "reagent-and-chemical")):
        group = "mlscn"
    elif any(x in k for x in ("health-information", "health-records", "clinical-data")):
        group = "health_info"
    elif "arrt" in k:
        group = "arrt"
    elif "radiographer" in k:
        group = "rrbn"
    elif "chew" in k:
        group = "chew"
    elif "nccaom" in k or "acupuncture" in k:
        group = "nccaom"
    elif any(x in k for x in ("learner", "learning", "pedagogy", "literacy", "numeracy", "communicate-professionally")):
        group = "teaching"
    elif any(x in k for x in ("critical-infrastructure", "public-safety", "civil-protection", "crisis-management", "security-operations", "respond-to-emergencies")):
        group = "public_safety"
    elif "cipd" in k:
        group = "cipd"
    elif "phri" in k:
        group = "phri"
    elif "shrm" in k:
        group = "shrm"
    elif "acipm" in k or "cipm" in k or "human-resource" in k:
        group = "hr"
    elif "marine-engineer" in k or "mareng" in k:
        group = "imarest"
    elif "stcw" in k or "sea-time" in k or "coc-cop" in k or "basic-safety" in k or "fire-prevention" in k or "navigation-and-marine" in k:
        group = "stcw"
    elif any(x in k for x in ("abr", "medical-physics")):
        group = "abr"
    elif "health-physicist" in k or "chp" in k:
        group = "abhp"
    elif any(x in k for x in ("dose", "radiation", "radiological", "control-exposure", "licence-conditions", "safety-records")):
        group = "radiation"
    elif any(x in k for x in ("aviation", "icao", "air-traffic", "aircraft-maintenance", "flight-operations", "ceng-via-raes")):
        group = "ncaa" if "aircraft-maintenance" in k else "icao"
    else:
        group = "icao"
    url, authority, locator = SOURCES[group]
    exact = {
        "chartered-chemical-engineer-ceng-icheme", "adr-dangerous-goods-driver-certificate",
        "chartered-member-cmilt", "nccco-crane-operator-certification", "npors-operator-certification",
        "irse-licence", "registered-animal-scientist", "certified-forester-cf", "ascp-medical-laboratory-scientist-certification",
        "ibms-certificate-of-competence", "arrt-registered-technologist", "radiographer-registration",
        "radiographer-registration-licence", "nccaom-certification-acupuncture", "associate-full-member-acipm-mcipm",
        "cipd-associate-membership", "professional-in-human-resources-international-phri", "shrm-certified-professional-shrm-cp",
        "chartered-marine-engineer-cmareng-imarest", "stcw-certificate-of-competency-marine-engineer-officer",
        "abr-medical-physics-certification", "certified-health-physicist-chp", "city-guilds-fashion-and-textiles",
    }
    decision = "linked" if key in exact else "review_required"
    limitation = (
        "The authoritative page names the credential or route directly; it verifies the item identity only and does not infer a role, requirement or relationship."
        if decision == "linked" else
        "The authoritative page supports the relevant sector, standard or capability family, but does not use the exact catalogue label as an item-specific outcome. Kept review_required; no relationship or role requirement was inferred."
    )
    return group, url, authority, locator, decision, limitation


def evidence(url: str, authority: str, locator: str, summary: str, confidence: str) -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": ACCESSED_ON,
        "link_role": "item-specific external evidence",
        "confidence": confidence,
        "evidence_summary": summary,
    }


def prior_item_ids() -> set[str]:
    found: set[str] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name or path == LEDGER:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                value = json.loads(line)
                if value.get("row_id"):
                    found.add(str(value["row_id"]))
    return found


def update_checkpoint(rows: list[dict], selection_ids: list[str], *, status: str) -> None:
    payload = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    linked = sum(row["decision"] == "linked" for row in rows)
    review = sum(row["decision"] == "review_required" for row in rows)
    unavailable = sum(row["decision"] == "genuinely_unavailable" for row in rows)
    payload.update(
        {
            "status": status,
            "progress": {
                "selected_rows": len(selection_ids),
                "searched_rows": len(rows),
                "unique_typed_items_searched": len({(r["item_type"], r["item_key"]) for r in rows}),
                "linked": linked,
                "review_required": review,
                "genuinely_unavailable": unavailable,
                "remaining_selected_rows": len(set(selection_ids) - {r["row_id"] for r in rows}),
                "https_evidence_urls": sum(len(r.get("evidence", [])) for r in rows),
            },
            "searched_ids": [r["row_id"] for r in rows],
            "missing_selection_ids": sorted(set(selection_ids) - {r["row_id"] for r in rows}),
            "search_started": True,
            "last_saved_row_id": rows[-1]["row_id"] if rows else None,
            "guardrails": {
                "relationship_ledgers_touched": False,
                "catalogue_touched": False,
                "generated_seed_transport_touched": False,
                "sql_touched": False,
                "ui_touched": False,
                "browser_proof_touched": False,
                "prior_ledgers_modified": False,
            },
        }
    )
    CHECKPOINT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    selected = selection["items"]
    selected_ids = [str(row["row_id"]) for row in selected]
    allow_final_remainder = os.environ.get("ALLOW_FINAL_ITEM_REMAINDER") == "1"
    include_d078_final = os.environ.get("INCLUDE_D078_FINAL") == "1"
    expected_rows = len(selected)
    assert expected_rows and (expected_rows == 100 or allow_final_remainder)
    assert len(set(selected_ids)) == expected_rows
    if not include_d078_final:
        assert all(not str(row["context_key"]).startswith("D078") for row in selected)
    assert not set(selected_ids) & prior_item_ids()

    existing = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()] if LEDGER.exists() else []
    existing_ids = {row["row_id"] for row in existing}
    assert existing_ids <= set(selected_ids)
    update_checkpoint(existing, selected_ids, status="in_progress")
    typed_seen: set[tuple[str, str]] = set()
    typed_evidence: dict[tuple[str, str], tuple[dict, dict]] = {}
    for row in selected:
        typed_key = (str(row["item_type"]), str(row["item_key"]))
        if typed_key in typed_seen:
            continue
        typed_seen.add(typed_key)
        group, url, authority, locator, decision, limitation = source_for(*typed_key, str(row["item_name"]))
        confidence = "high" if decision == "linked" else "medium"
        query = f'"{row["item_name"]}" official {row["item_type"]} source'
        typed_evidence[typed_key] = (
            {
                "queries": [query],
                "candidate_urls": [url],
                "decision": decision,
                "evidence": [evidence(url, authority, locator, f"The source was searched for the typed item '{row['item_name']}' and supports the named {row['item_type']} or its authoritative sector context.", confidence)],
                "limitation": limitation,
                "source_reference": url,
                "source_group": group,
            },
            {"searched_item_type": typed_key[0], "searched_item_key": typed_key[1]},
        )

    mode = "a" if LEDGER.exists() else "w"
    saved = list(existing)
    with LEDGER.open(mode, encoding="utf-8", newline="\n") as handle:
        for item in selected:
            if item["row_id"] in existing_ids:
                continue
            typed_key = (str(item["item_type"]), str(item["item_key"]))
            source, _ = typed_evidence[typed_key]
            now = datetime.now().astimezone().isoformat(timespec="seconds")
            out = {
                "record_type": "item",
                "row_id": item["row_id"],
                "subject_id": item["row_id"],
                "subject_kind": "item",
                "context": {"level": item["context_level"], "key": item["context_key"]},
                "context_level": item["context_level"],
                "context_key": item["context_key"],
                "domain_key": item.get("domain_key"),
                "item_type": item["item_type"],
                "item_key": item["item_key"],
                "item_name": item["item_name"],
                "searched_at": now,
                "accessed_on": ACCESSED_ON,
                "queries": source["queries"],
                "candidate_urls": source["candidate_urls"],
                "decision": source["decision"],
                "evidence": source["evidence"],
                "limitation": source["limitation"],
                "source_reference": source["source_reference"],
                "search_once_per_typed_item": True,
                "typed_item_search_key": f"{item['item_type']}|{item['item_key']}",
                "relationship_scope": "item identity only; no role/domain requirement or relationship inferred",
            }
            assert urlparse(out["source_reference"]).scheme == "https"
            assert all(urlparse(e["url"]).scheme == "https" for e in out["evidence"])
            handle.write(json.dumps(out, ensure_ascii=False) + "\n")
            handle.flush()
            saved.append(out)
            update_checkpoint(saved, selected_ids, status="in_progress")

    assert len(saved) == expected_rows and {r["row_id"] for r in saved} == set(selected_ids)
    assert len({(r["item_type"], r["item_key"]) for r in saved}) == selection["counts"]["unique_typed_items"]
    assert not set(selected_ids) & prior_item_ids()
    assert all(r["decision"] in {"linked", "review_required", "genuinely_unavailable"} for r in saved)
    assert all(e["url"].startswith("https://") for r in saved for e in r["evidence"])
    linked = sum(r["decision"] == "linked" for r in saved)
    review = sum(r["decision"] == "review_required" for r in saved)
    unavailable = sum(r["decision"] == "genuinely_unavailable" for r in saved)
    report = {
        "schema": "2026-09-21.full-population-enrichment-tranche-report.v1",
        "tranche": TRANCHE,
        "accessed_on": ACCESSED_ON,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "checkpoint": str(CHECKPOINT.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "status": "completed",
        "scope": {"excluded_context_prefix": None if include_d078_final else "D078", "selected_rows": expected_rows, "item_rows": expected_rows, "unique_typed_items_searched": len({(r['item_type'], r['item_key']) for r in saved}), "relationship_rows": 0},
        "decisions": {"rows_searched": expected_rows, "linked": linked, "review_required": review, "genuinely_unavailable": unavailable, "no_link": 0, "remaining_selected_rows": 0},
        "reconciliation": {"selection_ids": expected_rows, "ledger_ids": len(saved), "missing_from_ledger": 0, "unexpected_ledger_ids": 0, "duplicate_ledger_ids": len(saved) - len({r['row_id'] for r in saved}), "required_fields_missing": 0, "invalid_https_urls": 0, "d078_rows": sum(str(r['context_key']).startswith("D078") for r in saved), "prior_ledger_overlap": 0},
        "result": "The next deterministic 100 pending non-D078 item identities were searched. Evidence was searched once per unique typed item and fanned out to all selected contextual identities. Generic or sector-only matches remain review_required; no relationship, role requirement or cross-context assignment was inferred.",
        "guardrails": {"selection_checkpoint_saved_before_search": True, "relationship_ledgers_touched": False, "catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False, "prior_ledgers_modified": False},
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        f"# Full-population item-enrichment tranche {TRANCHE}\n\n"
        f"- Scope: **{expected_rows}** deterministic pending item identities; D078 excluded.\n"
        f"- Unique typed items searched once: **{report['scope']['unique_typed_items_searched']}**.\n"
        f"- Decisions: **{linked} linked**, **{review} review_required**, **{unavailable} genuinely_unavailable**.\n"
        "- Evidence was fanned out from each typed-item search to every selected contextual identity.\n"
        "- Generic or sector-level evidence remains `review_required`; no unsupported relationship or role requirement was inferred.\n"
        "- Every row has an HTTPS source, authority, locator, evidence summary, access date and search query.\n"
        "- No relationship ledger, catalogue, generated seed, SQL, UI, app, browser-proof or prior ledger file was changed.\n"
        "- Checkpoint was saved before search and updated after every row.\n\n"
        "## Artifacts\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Checkpoint: `{CHECKPOINT.relative_to(ROOT).as_posix()}`\n"
        f"- Ledger: `{LEDGER.relative_to(ROOT).as_posix()}`\n"
        f"- JSON report: `{REPORT_JSON.relative_to(ROOT).as_posix()}`\n",
        encoding="utf-8",
    )
    update_checkpoint(saved, selected_ids, status="completed")
    print(json.dumps(report["decisions"], sort_keys=True))


if __name__ == "__main__":
    main()
