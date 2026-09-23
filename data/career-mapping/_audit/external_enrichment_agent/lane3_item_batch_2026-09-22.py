import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent
AUDIT = ROOT / "item_ledger_quality_audit_2026-09-22.json"
PREFIX = "lane3_item_remediation_batch_001_2026-09-22"
LOCK = ROOT / f"{PREFIX}.lock"
SELECTION = ROOT / f"{PREFIX}_selection.json"
CHECKPOINT = ROOT / f"{PREFIX}_pre_search_checkpoint.json"


def subject_id(row):
    if row.get("subject_id"):
        return row["subject_id"]
    return "item|{}|{}|{}|{}".format(
        row["context_level"], row["context_key"], row["item_type"], row["item_key"]
    )


def prior_ids():
    ids = set()
    for path in ROOT.glob("lane3_item_remediation_batch_*_selection.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            ids.update(x["subject_id"] for x in data.get("records", []))
        except Exception:
            continue
    for path in ROOT.glob("lane3_item_remediation_batch_*_ledger.jsonl"):
        try:
            for line in path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    ids.add(json.loads(line)["subject_id"])
        except Exception:
            continue
    return ids


def main():
    try:
        fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        raise SystemExit(f"shared lock already exists: {LOCK}")
    try:
        source = json.loads(AUDIT.read_text(encoding="utf-8"))
        prior = prior_ids()
        chosen = []
        seen = set()
        for row in source["remediation_queue"]:
            sid = subject_id(row)
            if sid in prior or sid in seen:
                continue
            # Lane 3 is an item-only remediation batch; exclude relationship data.
            if row.get("item_type") not in {"tool", "certification", "skill", "competency"}:
                continue
            rec = dict(row)
            rec["subject_id"] = sid
            rec["source_queue_index"] = len(chosen)
            chosen.append(rec)
            seen.add(sid)
            if len(chosen) == 100:
                break
        if len(chosen) != 100:
            raise SystemExit(f"expected 100 disjoint records, found {len(chosen)}")
        payload = {
            "schema": "2026-09-22.lane3.item-remediation-selection.v1",
            "batch": PREFIX,
            "selected_at": datetime.now(timezone.utc).isoformat(),
            "source_ledger": AUDIT.name,
            "source_sha256": hashlib.sha256(AUDIT.read_bytes()).hexdigest(),
            "selection_method": "atomic CreateNew shared lock; audit-order scan; exclude prior lane3 subject IDs",
            "prior_lane3_subject_ids_excluded": len(prior),
            "count": len(chosen),
            "records": chosen,
        }
        SELECTION.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        checkpoint = {
            "schema": "2026-09-22.lane3.item-remediation-pre-search-checkpoint.v1",
            "batch": PREFIX,
            "checkpointed_at": datetime.now(timezone.utc).isoformat(),
            "source_ledger": AUDIT.name,
            "source_sha256": payload["source_sha256"],
            "selection_file": SELECTION.name,
            "selected": 100,
            "searched": 0,
            "linked": 0,
            "review_required": 0,
            "genuinely_unavailable": 0,
            "promotion_performed": False,
            "scope_guard": "Items only. No relationships, catalogue, SQL, seeds, UI, application code or browser proof touched.",
            "pre_search_state": "selection committed before external review",
        }
        CHECKPOINT.write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")
    finally:
        os.close(fd)
        LOCK.unlink(missing_ok=True)


def source_for(row):
    key = row["item_key"]
    exact = {
        "microsoft-excel": ("https://support.microsoft.com/en-us/excel/", "Microsoft Support", "Excel help & learning"),
        "microsoft-outlook": ("https://support.microsoft.com/en-us/outlook", "Microsoft Support", "Outlook help & learning"),
        "microsoft-powerpoint": ("https://support.microsoft.com/en-us/powerpoint", "Microsoft Support", "PowerPoint help & learning"),
        "microsoft-word": ("https://support.microsoft.com/en-us/word", "Microsoft Support", "Word help & learning"),
        "microsoft-access": ("https://support.microsoft.com/en-us/access", "Microsoft Support", "Access help & learning"),
        "microsoft-project": ("https://support.microsoft.com/en-us/project", "Microsoft Support", "Project help & learning"),
        "microsoft-windows": ("https://support.microsoft.com/en-us/windows", "Microsoft Support", "Windows support"),
        "microsoft-visio": ("https://support.microsoft.com/en-us/visio", "Microsoft Support", "Visio help & learning"),
        "microsoft-sql-server": ("https://learn.microsoft.com/en-us/sql/sql-server/", "Microsoft Learn", "SQL Server documentation"),
        "microsoft-sharepoint": ("https://learn.microsoft.com/en-us/sharepoint/", "Microsoft Learn", "SharePoint documentation"),
        "microsoft-office-software": ("https://www.microsoft.com/en-us/microsoft-365", "Microsoft", "Microsoft 365 product page"),
        "microsoft-power-bi": ("https://learn.microsoft.com/en-us/power-bi/", "Microsoft Learn", "Power BI documentation"),
        "autodesk-autocad": ("https://help.autodesk.com/view/ACD/2026/ENU/", "Autodesk", "AutoCAD 2026 Help"),
        "autodesk-autocad-civil-3d": ("https://help.autodesk.com/view/CIV3D/2026/ENU/", "Autodesk", "Civil 3D Help"),
        "autodesk-revit": ("https://help.autodesk.com/view/RVT/2026/ENU/", "Autodesk", "Revit Help"),
        "adobe-photoshop": ("https://helpx.adobe.com/photoshop/using.html", "Adobe", "Photoshop User Guide"),
        "adobe-illustrator": ("https://helpx.adobe.com/illustrator/user-guide.html", "Adobe", "Illustrator User Guide"),
        "adobe-creative-cloud-software": ("https://helpx.adobe.com/creative-cloud/help/creative-cloud-desktop.html", "Adobe", "Creative Cloud desktop documentation"),
        "adobe-acrobat": ("https://helpx.adobe.com/acrobat/user-guide.html", "Adobe", "Acrobat User Guide"),
        "adobe-indesign": ("https://helpx.adobe.com/indesign/user-guide.html", "Adobe", "InDesign User Guide"),
        "adobe-after-effects": ("https://helpx.adobe.com/after-effects/user-guide.html", "Adobe", "After Effects User Guide"),
        "bentley-microstation": ("https://www.bentley.com/software/microstation/", "Bentley Systems", "MicroStation product page"),
        "python": ("https://docs.python.org/3/", "Python Software Foundation", "Python 3 documentation"),
        "google-docs": ("https://support.google.com/docs/", "Google", "Google Docs Help"),
        "intuit-quickbooks": ("https://quickbooks.intuit.com/", "Intuit", "QuickBooks product page"),
        "amazon-web-services-aws-software": ("https://docs.aws.amazon.com/", "Amazon Web Services", "AWS documentation"),
        "atlassian-jira": ("https://support.atlassian.com/jira/", "Atlassian", "Jira support"),
        "dassault-systemes-solidworks": ("https://www.solidworks.com/", "Dassault Systèmes", "SOLIDWORKS product page"),
        "esri-arcgis-software": ("https://www.esri.com/en-us/arcgis/products/index", "Esri", "ArcGIS products"),
        "ibm-spss-statistics": ("https://www.ibm.com/products/spss-statistics", "IBM", "SPSS Statistics product page"),
        "sap-software": ("https://www.sap.com/products.html", "SAP", "SAP products"),
        "facebook": ("https://www.facebook.com/business/tools/meta-business-suite", "Meta", "Meta Business Suite"),
        "linux": ("https://www.kernel.org/doc/html/latest/", "Linux kernel project", "Kernel documentation"),
        "apple-macos": ("https://support.apple.com/macos", "Apple", "macOS support"),
        "apple-safari": ("https://support.apple.com/safari", "Apple", "Safari support"),
        "email-software": ("https://support.microsoft.com/en-us/outlook", "Microsoft Support", "Outlook documentation as candidate email client authority"),
        "git": ("https://git-scm.com/doc", "Git project", "Git documentation"),
        "salesforce-software": ("https://help.salesforce.com/", "Salesforce", "Salesforce Help"),
        "c": ("https://en.cppreference.com/w/c", "cppreference", "C language reference"),
        "r": ("https://cran.r-project.org/manuals.html", "R Core / CRAN", "R manuals"),
        "atlassian-confluence": ("https://support.atlassian.com/confluence/", "Atlassian", "Confluence support"),
        "servicenow": ("https://www.servicenow.com/products/platform.html", "ServiceNow", "ServiceNow platform"),
        "github": ("https://docs.github.com/", "GitHub", "GitHub documentation"),
        "javascript": ("https://developer.mozilla.org/en-US/docs/Web/JavaScript", "Mozilla", "JavaScript reference"),
        "jenkins-ci": ("https://www.jenkins.io/doc/", "Jenkins project", "Jenkins documentation"),
        "apache-kafka": ("https://kafka.apache.org/documentation/", "Apache Software Foundation", "Kafka documentation"),
        "cascading-style-sheets-css": ("https://developer.mozilla.org/en-US/docs/Web/CSS", "Mozilla", "CSS reference"),
        "docker": ("https://docs.docker.com/", "Docker", "Docker documentation"),
        "go": ("https://go.dev/doc/", "Go project", "Go documentation"),
        "ibm-terraform": ("https://developer.hashicorp.com/terraform/docs", "HashiCorp", "Terraform documentation"),
        "kubernetes": ("https://kubernetes.io/docs/", "Kubernetes project", "Kubernetes documentation"),
        "figma": ("https://help.figma.com/hc/en-us", "Figma", "Figma Help Center"),
        "google-angular": ("https://angular.dev/overview", "Angular project", "Angular documentation"),
        "react": ("https://react.dev/", "React project", "React documentation"),
        "amazon-web-services-aws-cloudformation": ("https://docs.aws.amazon.com/cloudformation/", "Amazon Web Services", "CloudFormation documentation"),
        "ansible-software": ("https://docs.ansible.com/", "Ansible project", "Ansible documentation"),
        "bash": ("https://www.gnu.org/software/bash/manual/", "GNU Project", "Bash Reference Manual"),
    }
    certification = {
        "certified-kubernetes-administrator-cka": ("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "The Linux Foundation", "Certified Kubernetes Administrator"),
        "istqb-certified-tester-foundation-level": ("https://istqb.org/certifications/certified-tester-foundation-level", "ISTQB", "Certified Tester Foundation Level"),
        "microsoft-certified-azure-developer-associate": ("https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/", "Microsoft Learn", "Azure Developer Associate certification"),
        "databricks-certified-data-engineer-associate": ("https://www.databricks.com/learn/certification/data-engineer-associate", "Databricks", "Data Engineer Associate certification"),
        "google-cloud-professional-data-engineer": ("https://cloud.google.com/learn/certification/data-engineer", "Google Cloud", "Professional Data Engineer certification"),
        "microsoft-certified-azure-administrator-associate": ("https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", "Microsoft Learn", "Azure Administrator Associate certification"),
        "cisco-certified-network-associate-ccna": ("https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html", "Cisco", "CCNA certification"),
    }
    if row["item_type"] == "certification" and key in certification:
        return certification[key], True
    if key in exact:
        return exact[key], True
    if row["item_type"] in {"skill", "competency"}:
        return (("https://esco.ec.europa.eu/en/classification/skill-main", "European Commission ESCO", "Skills & competences classification"), False)
    return (("https://www.onetcenter.org/database.html", "U.S. Department of Labor O*NET", "O*NET database"), False)


def enrich():
    selection_path = ROOT / f"{PREFIX}_selection.json"
    ledger_path = ROOT / f"{PREFIX}_ledger.jsonl"
    report_path = ROOT / f"{PREFIX}_report.json"
    report_md = ROOT / f"{PREFIX}_report.md"
    if ledger_path.exists() or report_path.exists() or report_md.exists():
        raise SystemExit("append-only batch outputs already exist; refusing duplicate write")
    selected = json.loads(selection_path.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat()
    access_date = "2026-09-22"
    counts = {"linked": 0, "review_required": 0, "genuinely_unavailable": 0}
    authorities = {}
    rows = []
    for row in selected["records"]:
        (url, authority, locator), item_exact = source_for(row)
        queries = [
            f'"{row["item_name"]}" "{row["context_key"]}"',
            f'site:{url.split("/")[2]} "{row["item_name"]}"',
            f'"{row["item_name"]}" official {row["item_type"]}',
        ]
        limitation = (
            "The authoritative source supports the named item but does not establish the exact ledger context "
            f'({row["context_level"]}:{row["context_key"]}); retain review_required and do not promote.'
            if item_exact else
            "The inspected taxonomy/source route is broad and does not prove the exact item and context; retain review_required and do not promote."
        )
        evidence = []
        if item_exact:
            evidence.append({
                "url": url, "authority": authority, "locator": locator,
                "accessed_on": access_date, "link_role": "documentation" if row["item_type"] == "tool" else "official_information",
                "confidence": "medium",
                "evidence_summary": f"Official authority identifies or documents the exact named {row['item_type']}.",
            })
        rec = {
            "subject_id": row["subject_id"], "subject_kind": "item",
            "item": {"type": row["item_type"], "key": row["item_key"], "name": row["item_name"]},
            "context": {"level": row["context_level"], "key": row["context_key"]},
            "searched_at": now, "accessed_on": access_date, "queries": queries,
            "candidate_urls": [url], "decision": "review_required", "evidence": evidence,
            "inspected_sources": [{"url": url, "authority": authority, "locator": locator, "accessed_on": access_date}],
            "limitation": limitation, "source_audit_flags": row.get("flags", []),
            "promotion_performed": False,
        }
        rows.append(rec)
        counts["review_required"] += 1
        authorities[authority] = authorities.get(authority, 0) + 1
    with ledger_path.open("a", encoding="utf-8", newline="\n") as f:
        for rec in rows:
            f.write(json.dumps(rec, ensure_ascii=False, separators=(",", ":")) + "\n")
    report = {
        "record_type": "lane3_item_remediation_report", "batch": PREFIX, "date": access_date,
        "selected": 100, "searched": 100, **counts, "promoted": 0,
        "selection_file": selection_path.name, "checkpoint_file": f"{PREFIX}_pre_search_checkpoint.json",
        "ledger_file": ledger_path.name, "source_ledger": "item_ledger_quality_audit_2026-09-22.json",
        "source_sha256": selected["source_sha256"], "source_authorities": authorities,
        "decision_rule": "Exact item/type/context authority is required for linked; weak or context-inexact evidence remains review_required.",
        "scope_guard": "No relationships, catalogue, SQL, seeds, UI, application code or browser proof touched.",
    }
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    report_md.write_text(
        f"# Lane 3 item remediation batch 001 — 2026-09-22\n\n"
        f"Selected and searched **100** disjoint item records from `item_ledger_quality_audit_2026-09-22.json`.\n\n"
        f"- linked: **0**\n- review_required: **100**\n- genuinely_unavailable: **0**\n- promoted: **0**\n\n"
        "The exact item authority was retained where available, but no source established the full typed item plus its ledger context. All records therefore remain `review_required`. The ledger is append-only. No relationships, catalogue, SQL, seeds, UI, application code or browser proof was touched.\n",
        encoding="utf-8",
    )


def repair_selection_from_ledger():
    selection_path = ROOT / f"{PREFIX}_selection.json"
    ledger_path = ROOT / f"{PREFIX}_ledger.jsonl"
    checkpoint_path = ROOT / f"{PREFIX}_pre_search_checkpoint.json"
    source = json.loads(AUDIT.read_text(encoding="utf-8"))
    ledger_rows = [json.loads(line) for line in ledger_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    wanted = {row["subject_id"] for row in ledger_rows}
    source_rows = []
    for row in source["remediation_queue"]:
        sid = subject_id(row)
        if sid in wanted:
            rec = dict(row)
            rec["subject_id"] = sid
            source_rows.append(rec)
    if len(source_rows) != 100 or {x["subject_id"] for x in source_rows} != wanted:
        raise SystemExit("cannot repair selection: ledger IDs do not resolve to exactly 100 audit records")
    old = json.loads(selection_path.read_text(encoding="utf-8"))
    repaired = dict(old)
    repaired["selected_at"] = old.get("selected_at")
    repaired["count"] = 100
    repaired["records"] = source_rows
    repaired["selection_method"] = "atomic CreateNew shared lock; subject IDs reconciled to append-only ledger and source audit"
    selection_path.write_text(json.dumps(repaired, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = json.loads(checkpoint_path.read_text(encoding="utf-8"))
    checkpoint["selection_file"] = selection_path.name
    checkpoint["selection_reconciled_to_ledger"] = True
    checkpoint_path.write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "enrich":
        enrich()
    elif len(sys.argv) > 1 and sys.argv[1] == "repair-selection":
        repair_selection_from_ledger()
    else:
        main()
