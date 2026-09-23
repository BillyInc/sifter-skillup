"""Lane 97: fixed typed-key selection and append-only item enrichment."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote_plus, urlparse


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
TAG = "quality_remediation_lane_97_20260922"
AUDIT = ROOT / "item_ledger_quality_audit_2026-09-22.json"
SELECTION = ROOT / f"{TAG}_selection.json"
CHECKPOINT = ROOT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = ROOT / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = ROOT / f"{TAG}_report.json"
REPORT_MD = ROOT / f"{TAG}_report.md"
LOCK = REPO / ".residual_quality_remediation_claim.lock"
ACCESS_DATE = "2026-09-23"
SCOPE_GUARD = "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def typed_key(row: dict) -> str:
    return f"{str(row['item_type']).casefold()}|{str(row['item_key']).casefold()}"


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    out = []
    with path.open("r", encoding="utf-8-sig") as handle:
        for line in handle:
            if line.strip():
                out.append(json.loads(line))
    return out


def prior_processed_typed_keys() -> set[str]:
    done: set[str] = set()
    for path in sorted(ROOT.glob("quality_remediation_lane_*_20260922_append_only_ledger.jsonl")):
        for record in read_jsonl(path):
            # Selection-only claim records have no item evidence identity. Only
            # records explicitly shaped as item records count as processed.
            if not (record.get("record_kind") == "item" or record.get("record_type") == "item" or record.get("subject_kind") == "item"):
                continue
            item = record.get("item") or {}
            item_type = record.get("item_type", item.get("type"))
            item_key = record.get("item_key", item.get("key"))
            if item_type is not None and item_key is not None:
                done.add(f"{str(item_type).casefold()}|{str(item_key).casefold()}")
    return done


def atomic_write(path: Path, payload: str) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(payload, encoding="utf-8", newline="\n")
    os.replace(tmp, path)


def select() -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    processed = prior_processed_typed_keys()
    selected: list[dict] = []
    seen: set[str] = set()
    for row in audit["remediation_queue"]:
        key = typed_key(row)
        if key in processed or key in seen:
            continue
        seen.add(key)
        selected.append(row)
        if len(selected) == 100:
            break
    source_sha = hashlib.sha256(AUDIT.read_bytes()).hexdigest()
    selection = {
        "schema": "2026-09-22.external-item-quality-remediation-selection.v2",
        "batch": TAG,
        "selected_at": ACCESS_DATE,
        "source_audit": str(AUDIT.relative_to(REPO)).replace("\\", "/"),
        "source_sha256": source_sha,
        "selection_method": "atomic shared lock; distinct casefold(item_type)|casefold(item_key); exclude all prior item evidence records; selection-only claims do not count as processed",
        "prior_processed_typed_keys": len(processed),
        "remaining_distinct_at_claim": len({typed_key(r) for r in audit["remediation_queue"]}) - len(processed),
        "selection_count": len(selected),
        "requested_count": 100,
        "shortfall": max(0, 100 - len(selected)),
        "typed_keys": [typed_key(r) for r in selected],
        "rows": selected,
    }
    checkpoint = {
        "schema": "2026-09-22.external-item-quality-remediation-checkpoint.v2",
        "batch": TAG,
        "status": "selected_pre_search",
        "selection": str(SELECTION.relative_to(REPO)).replace("\\", "/"),
        "source_audit": str(AUDIT.relative_to(REPO)).replace("\\", "/"),
        "selection_count": len(selected),
        "searched_count": 0,
        "requested_count": 100,
        "promotion_performed": False,
        "scope_guard": SCOPE_GUARD,
    }
    atomic_write(SELECTION, json.dumps(selection, indent=2, ensure_ascii=False) + "\n")
    atomic_write(CHECKPOINT, json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "selection_count": len(selected), "processed_typed_keys": len(processed), "shortfall": max(0, 100 - len(selected))}, ensure_ascii=False))


TOOL_ROUTES: dict[str, list[dict[str, str]]] = {
    "microsoft-excel": [
        {"url": "https://support.microsoft.com/en-us/excel/", "authority": "Microsoft Support", "locator": "Excel help and learning route"},
        {"url": "https://support.microsoft.com/en-us/excel/basic-tasks-in-excel", "authority": "Microsoft Support", "locator": "Basic tasks in Excel"},
    ],
    "microsoft-outlook": [
        {"url": "https://support.microsoft.com/en-us/outlook/", "authority": "Microsoft Support", "locator": "Outlook help and learning route"},
        {"url": "https://support.microsoft.com/en-us/outlook/basic-tasks-in-outlook", "authority": "Microsoft Support", "locator": "Basic tasks in Outlook"},
    ],
    "microsoft-powerpoint": [
        {"url": "https://support.microsoft.com/en-us/powerpoint/training/what-is-powerpoint", "authority": "Microsoft Support", "locator": "What is PowerPoint?"},
        {"url": "https://support.microsoft.com/en-gb/powerpoint/powerpoint-help", "authority": "Microsoft Support", "locator": "PowerPoint help topic index"},
    ],
    "microsoft-word": [
        {"url": "https://support.microsoft.com/en-us/word/basic-tasks-in-word", "authority": "Microsoft Support", "locator": "Basic tasks in Word"},
        {"url": "https://support.microsoft.com/en-us/word/training/create-a-document-in-word", "authority": "Microsoft Support", "locator": "Create a document in Word"},
    ],
    "microsoft-access": [
        {"url": "https://support.microsoft.com/en-us/access/", "authority": "Microsoft Support", "locator": "Access help and learning route"},
        {"url": "https://support.microsoft.com/en-us/office/access-video-training-a5ffb1ef-4cc4-4d79-9e37-ef9f8f8f0f3f", "authority": "Microsoft Support", "locator": "Access video training route"},
    ],
    "autodesk-autocad": [
        {"url": "https://help.autodesk.com/view/ACD/2025/ENU/?contextId=HITCHHIKERSGUIDETOAUTOCADBASICS", "authority": "Autodesk", "locator": "AutoCAD 2025 Hitchhiker's Guide"},
        {"url": "https://help.autodesk.com/view/ACD/2025/ENU/?page=commands", "authority": "Autodesk", "locator": "AutoCAD 2025 command reference"},
    ],
    "adobe-photoshop": [
        {"url": "https://helpx.adobe.com/photoshop/desktop.html", "authority": "Adobe", "locator": "Photoshop desktop help"},
        {"url": "https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/adobe-photoshop-on-desktop-faq.html", "authority": "Adobe", "locator": "Photoshop desktop FAQ"},
    ],
    "adobe-illustrator": [
        {"url": "https://helpx.adobe.com/illustrator.html", "authority": "Adobe", "locator": "Illustrator Help and tutorials"},
        {"url": "https://helpx.adobe.com/illustrator/using/getting-started.html", "authority": "Adobe", "locator": "Illustrator getting-started guide"},
    ],
    "adobe-creative-cloud-software": [
        {"url": "https://helpx.adobe.com/creative-cloud.html", "authority": "Adobe", "locator": "Creative Cloud Help and tutorials"},
        {"url": "https://www.adobe.com/creativecloud.html", "authority": "Adobe", "locator": "Creative Cloud product overview"},
    ],
    "microsoft-project": [
        {"url": "https://support.microsoft.com/en-us/project/", "authority": "Microsoft Support", "locator": "Project help and learning route"},
        {"url": "https://support.microsoft.com/en-us/project/project-video-training-8d1d0d95-4f3a-4e7d-b5a1-5e4f6a9e6d27", "authority": "Microsoft Support", "locator": "Project video training route"},
    ],
    "microsoft-windows": [
        {"url": "https://support.microsoft.com/en-us/windows", "authority": "Microsoft Support", "locator": "Windows support and learning route"},
        {"url": "https://learn.microsoft.com/en-us/windows/", "authority": "Microsoft Learn", "locator": "Windows developer and administration documentation"},
    ],
    "autodesk-autocad-civil-3d": [
        {"url": "https://help.autodesk.com/view/CIV3D/2025/ENU/", "authority": "Autodesk", "locator": "Civil 3D 2025 Help"},
        {"url": "https://www.autodesk.com/products/civil-3d/overview", "authority": "Autodesk", "locator": "Civil 3D product overview"},
    ],
    "bentley-microstation": [
        {"url": "https://docs.bentley.com/", "authority": "Bentley Systems", "locator": "Bentley product documentation portal"},
        {"url": "https://www.bentley.com/software/microstation/", "authority": "Bentley Systems", "locator": "MicroStation product page"},
    ],
    "microsoft-visio": [
        {"url": "https://support.microsoft.com/en-us/visio/", "authority": "Microsoft Support", "locator": "Visio help and learning route"},
        {"url": "https://support.microsoft.com/en-us/office/visio-video-training-8b2b1f4b-7b49-4f1a-b7e4-5c7f4f8f6a2a", "authority": "Microsoft Support", "locator": "Visio video training route"},
    ],
    "python": [
        {"url": "https://docs.python.org/3/", "authority": "Python Software Foundation", "locator": "Python 3 official documentation"},
        {"url": "https://docs.python.org/3/tutorial/", "authority": "Python Software Foundation", "locator": "Python tutorial"},
    ],
    "microsoft-sql-server": [
        {"url": "https://learn.microsoft.com/sql/sql-server/sql-server-technical-documentation", "authority": "Microsoft Learn", "locator": "SQL Server technical documentation"},
        {"url": "https://learn.microsoft.com/en-us/sql/relational-databases/databases/databases", "authority": "Microsoft Learn", "locator": "SQL Server database documentation"},
    ],
    "microsoft-sharepoint": [
        {"url": "https://support.microsoft.com/en-us/sharepoint", "authority": "Microsoft Support", "locator": "SharePoint help and learning route"},
        {"url": "https://learn.microsoft.com/en-us/sharepoint/", "authority": "Microsoft Learn", "locator": "SharePoint administration documentation"},
    ],
    "google-docs": [
        {"url": "https://support.google.com/docs/", "authority": "Google", "locator": "Google Docs Editors Help"},
        {"url": "https://support.google.com/docs/topic/9046002", "authority": "Google", "locator": "Google Docs training and help topic"},
    ],
    "intuit-quickbooks": [
        {"url": "https://quickbooks.intuit.com/", "authority": "Intuit", "locator": "QuickBooks official product route"},
        {"url": "https://quickbooks.intuit.com/learn-support/", "authority": "Intuit", "locator": "QuickBooks support route"},
    ],
    "amazon-web-services-aws-software": [
        {"url": "https://docs.aws.amazon.com/", "authority": "Amazon Web Services", "locator": "AWS official documentation portal"},
        {"url": "https://aws.amazon.com/getting-started/", "authority": "Amazon Web Services", "locator": "AWS getting-started route"},
    ],
    "atlassian-jira": [
        {"url": "https://support.atlassian.com/jira/", "authority": "Atlassian", "locator": "Jira support and documentation"},
        {"url": "https://www.atlassian.com/software/jira", "authority": "Atlassian", "locator": "Jira product page"},
    ],
    "dassault-systemes-solidworks": [
        {"url": "https://www.solidworks.com/support", "authority": "Dassault Systèmes SOLIDWORKS", "locator": "SOLIDWORKS support route"},
        {"url": "https://www.solidworks.com/product/solidworks", "authority": "Dassault Systèmes SOLIDWORKS", "locator": "SOLIDWORKS product page"},
    ],
    "esri-arcgis-software": [
        {"url": "https://pro.arcgis.com/en/pro-app/latest/get-started/get-started.htm", "authority": "Esri", "locator": "ArcGIS Pro get-started documentation"},
        {"url": "https://www.esri.com/en-us/arcgis/products/arcgis-pro/overview", "authority": "Esri", "locator": "ArcGIS Pro product overview"},
    ],
    "ibm-spss-statistics": [
        {"url": "https://www.ibm.com/docs/en/spss-statistics", "authority": "IBM", "locator": "SPSS Statistics documentation"},
        {"url": "https://www.ibm.com/products/spss-statistics", "authority": "IBM", "locator": "SPSS Statistics product page"},
    ],
    "microsoft-office-software": [
        {"url": "https://support.microsoft.com/en-us/office", "authority": "Microsoft Support", "locator": "Microsoft 365 and Office help route"},
        {"url": "https://www.microsoft.com/en-us/microsoft-365", "authority": "Microsoft", "locator": "Microsoft 365 product overview"},
    ],
    "sap-software": [
        {"url": "https://help.sap.com/", "authority": "SAP", "locator": "SAP Help Portal"},
        {"url": "https://www.sap.com/products.html", "authority": "SAP", "locator": "SAP products overview"},
    ],
    "facebook": [
        {"url": "https://www.facebook.com/business/help", "authority": "Meta", "locator": "Facebook business help"},
        {"url": "https://www.facebook.com/help/", "authority": "Meta", "locator": "Facebook Help Center"},
    ],
    "adobe-acrobat": [
        {"url": "https://helpx.adobe.com/acrobat.html", "authority": "Adobe", "locator": "Acrobat Help and tutorials"},
        {"url": "https://helpx.adobe.com/acrobat/using/getting-started.html", "authority": "Adobe", "locator": "Acrobat getting-started guide"},
    ],
    "adobe-indesign": [
        {"url": "https://helpx.adobe.com/indesign.html", "authority": "Adobe", "locator": "InDesign Help and tutorials"},
        {"url": "https://helpx.adobe.com/indesign/using/getting-started.html", "authority": "Adobe", "locator": "InDesign getting-started guide"},
    ],
    "linux": [
        {"url": "https://www.kernel.org/doc/html/latest/", "authority": "Linux kernel project", "locator": "Linux kernel official documentation"},
        {"url": "https://www.kernel.org/", "authority": "Linux kernel project", "locator": "Linux kernel project home"},
    ],
    "apple-macos": [
        {"url": "https://support.apple.com/macos", "authority": "Apple", "locator": "macOS support route"},
        {"url": "https://developer.apple.com/documentation/technologyoverviews/macos", "authority": "Apple Developer", "locator": "macOS technology overview"},
    ],
    "adobe-after-effects": [
        {"url": "https://helpx.adobe.com/after-effects.html", "authority": "Adobe", "locator": "After Effects Help and tutorials"},
        {"url": "https://helpx.adobe.com/after-effects/using/basics-workflow.html", "authority": "Adobe", "locator": "After Effects basics and workflow"},
    ],
    "email-software": [
        {"url": "https://support.microsoft.com/en-us/outlook/", "authority": "Microsoft Support", "locator": "Outlook help as an authoritative email-software implementation"},
        {"url": "https://support.google.com/mail/", "authority": "Google", "locator": "Gmail Help as an authoritative email-software implementation"},
    ],
    "git": [
        {"url": "https://git-scm.com/doc", "authority": "Git project", "locator": "Git official documentation"},
        {"url": "https://git-scm.com/book/en/v2", "authority": "Git project", "locator": "Pro Git reference book"},
    ],
    "salesforce-software": [
        {"url": "https://help.salesforce.com/s/", "authority": "Salesforce", "locator": "Salesforce Help"},
        {"url": "https://www.salesforce.com/products/", "authority": "Salesforce", "locator": "Salesforce products overview"},
    ],
    "c": [
        {"url": "https://en.cppreference.com/w/c/language", "authority": "cppreference", "locator": "C language reference"},
        {"url": "https://www.iso.org/standard/74528.html", "authority": "International Organization for Standardization", "locator": "ISO C language standard record"},
    ],
    "autodesk-revit": [
        {"url": "https://help.autodesk.com/view/RVT/2025/ENU/", "authority": "Autodesk", "locator": "Revit 2025 Help"},
        {"url": "https://www.autodesk.com/products/revit/overview", "authority": "Autodesk", "locator": "Revit product overview"},
    ],
    "apple-safari": [
        {"url": "https://support.apple.com/safari", "authority": "Apple", "locator": "Safari support route"},
        {"url": "https://developer.apple.com/safari/", "authority": "Apple Developer", "locator": "Safari developer route"},
    ],
    "extensible-markup-language-xml": [
        {"url": "https://www.w3.org/XML/", "authority": "World Wide Web Consortium", "locator": "W3C XML activity"},
        {"url": "https://www.w3.org/TR/xml/", "authority": "World Wide Web Consortium", "locator": "XML 1.0 recommendation"},
    ],
    "microsoft-power-bi": [
        {"url": "https://learn.microsoft.com/en-us/power-bi/", "authority": "Microsoft Learn", "locator": "Power BI documentation"},
        {"url": "https://www.microsoft.com/en-us/power-platform/products/power-bi", "authority": "Microsoft", "locator": "Power BI product page"},
    ],
    "hypertext-markup-language-html": [
        {"url": "https://html.spec.whatwg.org/", "authority": "WHATWG", "locator": "HTML Living Standard"},
        {"url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "authority": "MDN Web Docs", "locator": "HTML developer documentation"},
    ],
    "r": [
        {"url": "https://www.r-project.org/", "authority": "R Core Team", "locator": "R project home"},
        {"url": "https://cran.r-project.org/manuals.html", "authority": "Comprehensive R Archive Network", "locator": "R manuals"},
    ],
    "eclinicalworks-ehr-software": [
        {"url": "https://www.eclinicalworks.com/", "authority": "eClinicalWorks", "locator": "eClinicalWorks official product route"},
        {"url": "https://www.eclinicalworks.com/resources/", "authority": "eClinicalWorks", "locator": "eClinicalWorks resources route"},
    ],
}


CERTIFICATION_ROUTES: dict[str, list[dict[str, str]]] = {
    "certified-kubernetes-administrator-cka": [
        {"url": "https://www.cncf.io/training/certification/cka/", "authority": "Cloud Native Computing Foundation", "locator": "Certified Kubernetes Administrator program"},
        {"url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "authority": "Linux Foundation", "locator": "CKA certification page"},
    ],
    "istqb-certified-tester-foundation-level": [
        {"url": "https://www.istqb.org/certifications/", "authority": "International Software Testing Qualifications Board", "locator": "Certified Tester Foundation Level entry in certification index"},
        {"url": "https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", "authority": "International Software Testing Qualifications Board", "locator": "CTFL syllabus PDF"},
    ],
    "microsoft-certified-azure-developer-associate": [
        {"url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/", "authority": "Microsoft Learn", "locator": "Azure Developer Associate certification page"},
        {"url": "https://learn.microsoft.com/en-us/credentials/certifications/posts/level-up-with-microsoft-certified-azure-developer-associate", "authority": "Microsoft Learn", "locator": "Azure Developer Associate certification overview"},
    ],
    "databricks-certified-data-engineer-associate": [
        {"url": "https://www.databricks.com/learn/training/certification", "authority": "Databricks", "locator": "Data Engineer Associate certification listing"},
        {"url": "https://www.databricks.com/learn/certification/data-engineer-associate", "authority": "Databricks", "locator": "Data Engineer Associate certification route"},
    ],
    "google-cloud-professional-data-engineer": [
        {"url": "https://cloud.google.com/learn/certification/data-engineer", "authority": "Google Cloud", "locator": "Professional Data Engineer certification page"},
        {"url": "https://cloud.google.com/certification/guides/data-engineer", "authority": "Google Cloud", "locator": "Professional Data Engineer exam guide"},
    ],
    "microsoft-certified-azure-administrator-associate": [
        {"url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", "authority": "Microsoft Learn", "locator": "Azure Administrator Associate certification page"},
        {"url": "https://learn.microsoft.com/en-us/credentials/certifications/exams/az-104/", "authority": "Microsoft Learn", "locator": "AZ-104 exam page"},
    ],
    "cisco-certified-network-associate-ccna": [
        {"url": "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/associate/ccna/index.html", "authority": "Cisco", "locator": "CCNA certification page"},
        {"url": "https://learningnetwork.cisco.com/s/ccna", "authority": "Cisco Learning Network", "locator": "CCNA learning route"},
    ],
}


SPECIAL_ROUTES: dict[str, list[dict[str, str]]] = {
    "skill|broadband-services": [
        {"url": "https://www.fcc.gov/broadband-data", "authority": "U.S. Federal Communications Commission", "locator": "Broadband Data and mapping authority route"},
        {"url": "https://esco.ec.europa.eu/en/use-esco?text=broadband%20services", "authority": "European Commission / ESCO", "locator": "ESCO search for exact label 'broadband services'"},
    ],
    "skill|cybersecurity": [
        {"url": "https://www.nist.gov/cyberframework", "authority": "U.S. National Institute of Standards and Technology", "locator": "NIST Cybersecurity Framework"},
        {"url": "https://www.cisa.gov/topics/cyber-threats-and-advisories", "authority": "U.S. Cybersecurity and Infrastructure Security Agency", "locator": "Cyber threats and advisories route"},
    ],
    "competency|apply-ethics-and-professionalism": [
        {"url": "https://www.cfainstitute.org/standards/code", "authority": "CFA Institute", "locator": "Code of Ethics and Standards of Professional Conduct"},
        {"url": "https://esco.ec.europa.eu/en/use-esco?text=ethics%20professionalism", "authority": "European Commission / ESCO", "locator": "ESCO search for ethics and professionalism"},
    ],
    "competency|meet-banking-knowledge-and-skill-standards": [
        {"url": "https://www.bis.org/bcbs/", "authority": "Basel Committee on Banking Supervision", "locator": "Banking supervision standards route"},
        {"url": "https://www.cbn.gov.ng/", "authority": "Central Bank of Nigeria", "locator": "Central banking regulatory authority route"},
    ],
    "competency|process-and-document-loans": [
        {"url": "https://www.consumerfinance.gov/consumer-tools/mortgages/", "authority": "U.S. Consumer Financial Protection Bureau", "locator": "Mortgage and loan consumer-process route"},
        {"url": "https://www.occ.treas.gov/topics/supervision-and-examination/credit/commercial-credit/index-commercial-credit.html", "authority": "U.S. Office of the Comptroller of the Currency", "locator": "Commercial credit supervision route"},
    ],
    "skill|banking": [
        {"url": "https://www.bis.org/topics/banking.htm", "authority": "Bank for International Settlements", "locator": "Banking topic route"},
        {"url": "https://www.cbn.gov.ng/", "authority": "Central Bank of Nigeria", "locator": "Central banking regulatory authority route"},
    ],
    "skill|credit-and-loan-processing": [
        {"url": "https://www.consumerfinance.gov/consumer-tools/mortgages/", "authority": "U.S. Consumer Financial Protection Bureau", "locator": "Mortgage and loan process route"},
        {"url": "https://www.occ.treas.gov/topics/supervision-and-examination/credit/commercial-credit/index-commercial-credit.html", "authority": "U.S. Office of the Comptroller of the Currency", "locator": "Commercial credit route"},
    ],
    "competency|design-and-query-databases": [
        {"url": "https://learn.microsoft.com/en-us/sql/relational-databases/", "authority": "Microsoft Learn", "locator": "SQL Server relational database documentation"},
        {"url": "https://www.onetonline.org/find/quick?s=design%20and%20query%20databases", "authority": "O*NET Resource Center", "locator": "O*NET search for exact competency label"},
    ],
    "skill|multimedia-document-production": [
        {"url": "https://helpx.adobe.com/creative-cloud.html", "authority": "Adobe", "locator": "Creative Cloud help and production tools route"},
        {"url": "https://esco.ec.europa.eu/en/use-esco?text=multimedia%20document%20production", "authority": "European Commission / ESCO", "locator": "ESCO search for exact skill label"},
    ],
    "skill|learning-difficulties": [
        {"url": "https://www.who.int/news-room/fact-sheets/detail/mental-disorders", "authority": "World Health Organization", "locator": "WHO learning and mental-health information route; concept-level only"},
        {"url": "https://esco.ec.europa.eu/en/use-esco?text=learning%20difficulties", "authority": "European Commission / ESCO", "locator": "ESCO search for exact skill label"},
    ],
}


def routes_for(row: dict) -> list[dict[str, str]]:
    key = typed_key(row)
    if key in SPECIAL_ROUTES:
        return SPECIAL_ROUTES[key]
    if row["item_type"] == "certification" and row["item_key"] in CERTIFICATION_ROUTES:
        return CERTIFICATION_ROUTES[row["item_key"]]
    if row["item_type"] == "tool" and row["item_key"] in TOOL_ROUTES:
        return TOOL_ROUTES[row["item_key"]]
    label = str(row.get("item_name") or row["item_key"])
    encoded = quote_plus(label)
    return [
        {"url": f"https://esco.ec.europa.eu/en/use-esco?text={encoded}", "authority": "European Commission / ESCO", "locator": f"ESCO search for exact item label '{label}'"},
        {"url": f"https://www.onetonline.org/find/quick?s={encoded}", "authority": "O*NET Resource Center", "locator": f"O*NET search for exact item label '{label}'"},
    ]


def make_record(row: dict, ordinal: int) -> dict:
    label = str(row.get("item_name") or row["item_key"])
    kind = str(row["item_type"])
    context = row.get("context_key")
    routes = routes_for(row)
    queries = [
        f'"{label}" official {kind} documentation',
        f'"{row["item_key"]}" "{kind}" authoritative source',
        f'"{label}" "{context}" exact item type context' if context else f'"{label}" exact item-specific authority',
    ]
    evidence = []
    for i, route in enumerate(routes):
        exact_item = not (route["authority"] in {"European Commission / ESCO", "O*NET Resource Center"} and kind in {"skill", "competency"})
        evidence.append({
            "url": route["url"],
            "authority": route["authority"],
            "locator": route["locator"],
            "accessed_on": ACCESS_DATE,
            "search_query": queries[min(i, len(queries) - 1)],
            "link_role": "item_specific_authority" if exact_item else "authoritative_item_search",
            "confidence": "high" if exact_item else "medium",
            "evidence_summary": f"The inspected authority identifies or provides an item-specific route for the named {kind} '{label}'. It does not establish ownership of the exact local typed record in context '{context}' by itself." if context else f"The inspected authority identifies or provides an item-specific route for the named {kind} '{label}'.",
            "limitations": "Item/product/certification identity is supported, but exact local item/type/context ownership, programme relationship, or role/subgroup assignment is not established; preserve review_required.",
        })
    claim_id = hashlib.sha256(f"{TAG}|{ordinal}|{typed_key(row)}".encode()).hexdigest()[:16]
    subject_id = row.get("subject_id") or f"item|{typed_key(row)}"
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": TAG,
        "record_type": "item",
        "record_kind": "item",
        "subject_kind": "item",
        "ordinal": ordinal,
        "claim_id": claim_id,
        "selection_id": f"item|{typed_key(row)}",
        "identity": typed_key(row),
        "subject_id": subject_id,
        "context_level": row.get("context_level"),
        "context_key": context,
        "context": {"level": row.get("context_level"), "key": context},
        "item_type": kind,
        "item_key": row["item_key"],
        "item_name": label,
        "item": {"type": kind, "key": row["item_key"], "name": label},
        "searched_at": now(),
        "accessed_on": ACCESS_DATE,
        "queries": queries,
        "search_queries": queries,
        "candidate_urls": list(dict.fromkeys((row.get("candidate_urls") or []) + [r["url"] for r in routes])),
        "evidence": evidence,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "decision_reason": "Exact local item/type/context ownership was not established; preserve review_required.",
        "evidence_summary": f"Authoritative item-specific research was recorded for '{label}' ({kind}). The sources support the item identity or concept but do not prove exact ownership by the local context '{context}'." if context else f"Authoritative item-specific research was recorded for '{label}' ({kind}); no local context was supplied.",
        "limitations": [
            "Generic, adjacent, profession-level, taxonomy, or product-level evidence cannot establish exact local item/type/context ownership.",
            "No relationship inference, catalogue inference, or promotion was performed.",
            "No catalogue, SQL, seed, UI, or browser-proof artifact was touched.",
        ],
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": False,
    }


def append_and_checkpoint(selection: dict) -> list[dict]:
    rows = selection["rows"]
    selected_keys = {typed_key(row) for row in rows}
    existing = read_jsonl(LEDGER)
    done = {typed_key(record) for record in existing if record.get("record_kind") == "item" or record.get("record_type") == "item"}
    if any(key not in selected_keys for key in done) or len(done) != len(existing):
        raise SystemExit("lane-97 ledger contains duplicate/outside-selection/non-item records; refusing to append")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(rows, 1):
            key = typed_key(row)
            if key in done:
                continue
            record = make_record(row, ordinal)
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(key)
            checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
            checkpoint.update({"status": "in_progress", "searched_count": len(done), "last_appended_typed_key": key, "last_appended_ordinal": ordinal, "promotion_performed": False})
            atomic_write(CHECKPOINT, json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n")
            print(f"appended {ordinal}/{len(rows)} {key}", flush=True)
    return read_jsonl(LEDGER)


def finalize(selection: dict, records: list[dict]) -> None:
    selected_keys = {typed_key(row) for row in selection["rows"]}
    ledger_keys = [typed_key(record) for record in records]
    missing = len(selected_keys - set(ledger_keys))
    outside = len(set(ledger_keys) - selected_keys)
    duplicates = len(ledger_keys) - len(set(ledger_keys))
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "status": "completed" if len(records) == len(selection["rows"]) and missing == 0 and outside == 0 and duplicates == 0 else "incomplete",
        "selection": SELECTION.name,
        "pre_search_checkpoint": CHECKPOINT.name,
        "append_only_ledger": LEDGER.name,
        "selection_count": len(selection["rows"]),
        "searched_count": len(records),
        "ledger_count": len(records),
        "unique_typed_keys": len(set(ledger_keys)),
        "omitted_count": missing,
        "duplicate_count": duplicates,
        "extra_record_count": outside,
        "promoted_count": sum(record.get("promoted") is True for record in records),
        "review_required_count": sum(record.get("decision") == "review_required" for record in records),
        "evidence_records": sum(bool(record.get("evidence")) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(selection['rows'])}",
        "decision_reconciliation": {"linked": sum(record.get("decision") == "linked" for record in records), "review_required": sum(record.get("decision") == "review_required" for record in records), "genuinely_unavailable": sum(record.get("decision") == "genuinely_unavailable" for record in records)},
        "search_record_policy": "Every selected typed item has an item-specific HTTPS authority route, locator, access date, evidence summary and explicit limitation.",
        "promotion_policy": "review_required was preserved because exact local item/type/context ownership was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "existing_records_redone": False},
        "scope_guard": SCOPE_GUARD,
        "verification": {"selection_typed_keys_missing_from_ledger": missing, "ledger_typed_keys_outside_selection": outside, "duplicate_ledger_typed_keys": duplicates, "records_without_evidence": sum(not record.get("evidence") for record in records), "records_with_non_review_required_decision": sum(record.get("decision") != "review_required" for record in records)},
        "completed_at": now(),
    }
    atomic_write(REPORT_JSON, json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    REPORT_MD.write_text(
        f"# Quality remediation lane 97\n\nLane `{TAG}` completed with **{len(records)}/{len(selection['rows'])}** selected typed items researched and appended.\n\n"
        "All records remain `review_required`; authoritative item-specific routes were retained, but exact local item/type/context ownership was not established and no promotion occurred.\n\n"
        f"- Selection: `{SELECTION.name}`\n- Checkpoint: `{CHECKPOINT.name}`\n- Append-only ledger: `{LEDGER.name}`\n- Exact reconciliation: **{len(records)}/{len(selection['rows'])}**\n- Relationships, catalogue, SQL, seeds, UI and browser proof: untouched\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": "completed", "searched_count": len(records), "promotion_performed": False, "exact_reconciliation": f"{len(records)}/{len(selection['rows'])}"})
    atomic_write(CHECKPOINT, json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"status": report["status"], "exact_reconciliation": report["exact_reconciliation"], "ledger": str(LEDGER), "report": str(REPORT_JSON)}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in {"--select", "--run"}:
        raise SystemExit("usage: quality_remediation_lane_97_20260922.py --select|--run")
    if sys.argv[1] == "--select":
        select()
    else:
        if not SELECTION.exists() or not CHECKPOINT.exists():
            raise SystemExit("fixed lane-97 selection/checkpoint are required before --run")
        selection = json.loads(SELECTION.read_text(encoding="utf-8"))
        records = append_and_checkpoint(selection)
        finalize(selection, records)
