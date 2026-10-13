"""Checkpoint-first external evidence pass for unresolved relationships.

This lane is deliberately relationship-only.  It selects the deterministic
first tranche from the canonical unresolved queue, records official
endpoint/item-specific documentation for the known source endpoint, and keeps
the edge unresolved when the target endpoint or relationship semantics are
not established.  It never mutates catalogue data, SQL, seeds, UI, or a live
database.

The evidence map is populated from the 2026-09-23 authoritative-source review
performed for this tranche.  ``select`` must be run before ``run``; ``run``
updates the checkpoint after every appended JSONL record.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
INVENTORY = ROOT / "data" / "career-mapping" / "_audit" / "relationship_backlog_inventory.json"
TAG = "relationship_external_evidence_lane_20260923"
SELECTION = AUDIT / f"{TAG}_selection.json"
CHECKPOINT = AUDIT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = AUDIT / f"{TAG}_append_only_ledger.jsonl"
REPORT = AUDIT / f"{TAG}_validation.json"
REPORT_MD = AUDIT / f"{TAG}_validation.md"
TODAY = "2026-09-23"
MAX_BATCH = 100
SCOPE_GUARD = "Relationship evidence only; no catalogue, SQL, seed, frontend, live DB, or browser-proof writes."


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def write_json(path: Path, value: dict[str, Any]) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def canonical_id(row: dict[str, Any]) -> str:
    return str(row.get("candidate_id") or "relationship|{0}|{1}|{2}|{3}|{4}|{5}|{6}".format(
        row.get("context_level", ""), row.get("context_key", ""),
        row.get("from_item_type", ""), row.get("from_item_key", ""),
        row.get("to_item_type", ""), row.get("to_item_key", ""),
        row.get("relationship_type", "not_established"),
    ))


def sort_key(row: dict[str, Any]) -> tuple[str, ...]:
    return tuple(str(row.get(field) or "").casefold() for field in (
        "context_level", "context_key", "from_item_key", "from_name",
        "to_item_key", "to_name", "relationship_type", "data_state",
    ))


# Official endpoint/item-specific routes reviewed on 2026-09-23.  Broad
# product labels are intentionally marked ``broad`` and cannot promote an edge.
SOURCES: dict[str, dict[str, str]] = {
    "Amazon Web Services AWS software": {"url": "https://docs.aws.amazon.com/us_us/", "authority": "Amazon Web Services", "locator": "AWS Documentation product documentation index", "scope": "broad"},
    "C#": {"url": "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/", "authority": "Microsoft Learn", "locator": "C# documentation; Tour of C#", "scope": "exact"},
    "Docker": {"url": "https://docs.docker.com/manuals", "authority": "Docker", "locator": "Docker Docs; Manuals", "scope": "exact"},
    "Git": {"url": "https://git-scm.com/docs/git", "authority": "Git project", "locator": "Git documentation; git manual", "scope": "exact"},
    "Go": {"url": "https://go.dev/doc/", "authority": "The Go Project", "locator": "Go documentation index", "scope": "exact"},
    "JavaScript": {"url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "authority": "MDN Web Docs", "locator": "JavaScript Guide", "scope": "exact"},
    "Kubernetes": {"url": "https://kubernetes.io/docs/home/", "authority": "Kubernetes project", "locator": "Kubernetes Documentation home", "scope": "exact"},
    "Microsoft Azure software": {"url": "https://learn.microsoft.com/en-us/azure/", "authority": "Microsoft Learn", "locator": "Azure documentation product index", "scope": "broad"},
    "MongoDB": {"url": "https://www.mongodb.com/docs/manual/", "authority": "MongoDB", "locator": "MongoDB Database Manual; What is MongoDB?", "scope": "exact"},
    "Node.js": {"url": "https://nodejs.org/api/documentation.html", "authority": "Node.js project", "locator": "Node.js API reference documentation", "scope": "exact"},
    "Cascading style sheets CSS": {"url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "authority": "MDN Web Docs", "locator": "CSS documentation", "scope": "exact"},
    "Extensible markup language XML": {"url": "https://www.w3.org/XML/", "authority": "World Wide Web Consortium", "locator": "W3C XML activity and specifications", "scope": "exact"},
    "Hypertext markup language HTML": {"url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "authority": "MDN Web Docs", "locator": "HTML documentation; HyperText Markup Language", "scope": "exact"},
    "Linux": {"url": "https://docs.kernel.org/", "authority": "Linux kernel project", "locator": "Linux Kernel documentation top level", "scope": "exact"},
    "Microsoft Excel": {"url": "https://support.microsoft.com/en-us/excel/", "authority": "Microsoft Support", "locator": "Excel help and learning", "scope": "exact"},
    "Microsoft Office software": {"url": "https://learn.microsoft.com/en-us/office/", "authority": "Microsoft Learn", "locator": "Microsoft Office documentation", "scope": "broad"},
    "Amazon Web Services AWS CloudFormation": {"url": "https://docs.aws.amazon.com/cloudformation/", "authority": "Amazon Web Services", "locator": "AWS CloudFormation Documentation", "scope": "exact"},
    "Ansible software": {"url": "https://docs.ansible.com/projects/ansible/latest/getting_started/index.html", "authority": "Ansible Community Documentation", "locator": "Getting started with Ansible", "scope": "exact"},
    "Atlassian JIRA": {"url": "https://www.atlassian.com/software/jira/guides/getting-started/basics", "authority": "Atlassian", "locator": "How do you use Jira?", "scope": "exact"},
    "Bash": {"url": "https://www.gnu.org/software/bash/manual/", "authority": "GNU Project / Free Software Foundation", "locator": "GNU Bash manual", "scope": "exact"},
    "GitHub": {"url": "https://docs.github.com/en", "authority": "GitHub", "locator": "GitHub Docs; all docs", "scope": "exact"},
    "IBM Terraform": {"url": "https://developer.hashicorp.com/terraform/docs", "authority": "HashiCorp Developer", "locator": "Terraform Documentation overview", "scope": "exact"},
    "Atlassian Confluence": {"url": "https://confluence.atlassian.com/", "authority": "Atlassian Documentation", "locator": "Atlassian Documentation; Confluence product documentation", "scope": "exact"},
    "Microsoft PowerPoint": {"url": "https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/", "authority": "Microsoft Learn", "locator": "PowerPoint add-ins documentation", "scope": "exact"},
    "SAP software": {"url": "https://help.sap.com/", "authority": "SAP Help Portal", "locator": "SAP Help Portal documentation index", "scope": "broad"},
    "ServiceNow": {"url": "https://docs.servicenow.com/", "authority": "ServiceNow", "locator": "ServiceNow product documentation portal", "scope": "broad"},
    "Structured query language SQL": {"url": "https://www.postgresql.org/docs/current/sql.html", "authority": "PostgreSQL Global Development Group", "locator": "SQL Commands reference", "scope": "exact"},
    "Jenkins CI": {"url": "https://www.jenkins.io/doc/", "authority": "Jenkins project", "locator": "Jenkins User Documentation", "scope": "exact"},
    "Adobe After Effects": {"url": "https://helpx.adobe.com/after-effects/desktop.html", "authority": "Adobe", "locator": "After Effects Help and User Guide", "scope": "exact"},
    "Adobe Creative Cloud software": {"url": "https://helpx.adobe.com/creative-cloud/help.html", "authority": "Adobe", "locator": "Creative Cloud help and support", "scope": "broad"},
    "Adobe Illustrator": {"url": "https://helpx.adobe.com/illustrator/desktop.html", "authority": "Adobe", "locator": "Illustrator Help", "scope": "exact"},
    "Adobe Photoshop": {"url": "https://helpx.adobe.com/photoshop/user-guide.html", "authority": "Adobe", "locator": "Photoshop User Guide", "scope": "exact"},
    "Python": {"url": "https://docs.python.org/3/", "authority": "Python Software Foundation", "locator": "Python 3 documentation", "scope": "exact"},
    "Figma": {"url": "https://help.figma.com/hc/en-us/articles/360041057214-Explore-Figma-s-help-and-support-resources", "authority": "Figma", "locator": "Figma Help Center; support and product documentation resources", "scope": "exact"},
    "Google Angular": {"url": "https://angular.dev/overview", "authority": "Angular / Google", "locator": "What is Angular?; official Angular documentation", "scope": "exact"},
    "React": {"url": "https://react.dev/learn", "authority": "React project", "locator": "React documentation; Quick Start", "scope": "exact"},
    "Guidance Software EnCase Enterprise": {"url": "https://www.opentext.com/products/forensic", "authority": "OpenText", "locator": "OpenText Forensic (EnCase) product overview", "scope": "exact"},
    "Microsoft Access": {"url": "https://learn.microsoft.com/en-us/office/vba/api/overview/access", "authority": "Microsoft Learn", "locator": "Access Visual Basic for Applications reference", "scope": "exact"},
    "Microsoft Outlook": {"url": "https://support.microsoft.com/en-us/outlook/", "authority": "Microsoft Support", "locator": "Outlook help and learning", "scope": "exact"},
    "Microsoft Visio": {"url": "https://learn.microsoft.com/en-us/office365/servicedescriptions/visio-online-service-description/visio-features", "authority": "Microsoft Learn", "locator": "Visio Features service description", "scope": "exact"},
    "Microsoft Word": {"url": "https://learn.microsoft.com/en-us/office/dev/add-ins/word/", "authority": "Microsoft Learn", "locator": "Word add-ins documentation", "scope": "exact"},
    "Microsoft PowerShell": {"url": "https://learn.microsoft.com/en-us/powershell/", "authority": "Microsoft Learn", "locator": "PowerShell Documentation", "scope": "exact"},
    "Splunk Enterprise": {"url": "https://docs.splunk.com/Documentation/SplunkCloud/latest/User/DifferencesbetweenSplunkCloudandSplunkEnterprise", "authority": "Splunk Documentation", "locator": "Splunk Enterprise documentation reference", "scope": "exact"},
    "UNIX": {"url": "https://www.unix.org/overview.html", "authority": "The Open Group", "locator": "The Single UNIX Specification V5 (2024) introduction", "scope": "exact"},
    "Microsoft Active Directory": {"url": "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services", "authority": "Microsoft Learn", "locator": "Active Directory Domain Services overview", "scope": "exact"},
    "Oracle Java": {"url": "https://docs.oracle.com/en/java/", "authority": "Oracle", "locator": "Java Documentation; Java SE documentation index", "scope": "exact"},
}


def source_for(name: str) -> dict[str, str]:
    if name not in SOURCES:
        raise KeyError(f"No reviewed authoritative source map entry for {name!r}")
    return SOURCES[name]


def select() -> None:
    if SELECTION.exists() or CHECKPOINT.exists():
        raise SystemExit(f"selection/checkpoint already exists: {SELECTION.name}")
    inventory = read_json(INVENTORY)
    candidates = sorted(inventory.get("rows") or [], key=sort_key)
    selected = candidates[:MAX_BATCH]
    if len(selected) != MAX_BATCH:
        raise SystemExit(f"unresolved queue shortfall: expected {MAX_BATCH}, found {len(selected)}")
    rows = [{**row, "canonical_id": canonical_id(row), "selection_ordinal": ordinal} for ordinal, row in enumerate(selected, 1)]
    payload = {
        "schema": "2026-09-23.relationship-external-evidence-selection.v1",
        "batch": TAG,
        "source": "relationship_backlog_inventory.json",
        "selection_count": len(rows),
        "requested_count": MAX_BATCH,
        "order": ["context_level", "context_key", "from_item_key", "from_name", "to_item_key", "to_name", "relationship_type", "data_state"],
        "rows": rows,
        "scope_guard": SCOPE_GUARD,
    }
    write_json(SELECTION, payload)
    write_json(CHECKPOINT, {
        "schema": "2026-09-23.relationship-external-evidence-checkpoint.v1",
        "batch": TAG,
        "status": "selected_pre_search",
        "selection_count": len(rows),
        "searched_count": 0,
        "selection": SELECTION.name,
        "scope_guard": SCOPE_GUARD,
    })
    print(json.dumps({"selected": len(rows), "selection": str(SELECTION), "checkpoint": str(CHECKPOINT)}))


def make_record(row: dict[str, Any], ordinal: int) -> dict[str, Any]:
    name = str(row.get("from_name") or "")
    source = source_for(name)
    endpoint_evidence = {
        "url": source["url"],
        "authority": source["authority"],
        "locator": source["locator"],
        "accessed_on": TODAY,
        "link_role": "endpoint-candidate" if source["scope"] == "broad" else "endpoint-evidence",
        "confidence": "medium" if source["scope"] == "broad" else "high",
        "evidence_summary": (
            f"Official documentation route inspected for the source endpoint label {name!r}. "
            "It establishes endpoint documentation only; it does not establish the missing target or relationship edge."
        ),
    }
    queries = [
        f'"{name}" official documentation',
        f'"{name}" "{row.get("context_key")}" relationship',
        f'"{name}" builds_on OR works_with official',
    ]
    return {
        "record_type": "relationship_external_evidence_review",
        "batch": TAG,
        "ordinal": ordinal,
        "canonical_id": row["canonical_id"],
        "subject_kind": "relationship",
        "context": {"level": row.get("context_level"), "key": row.get("context_key")},
        "from": {"type": row.get("from_item_type"), "key": row.get("from_item_key"), "name": name},
        "to": {"type": row.get("to_item_type"), "key": row.get("to_item_key"), "name": row.get("to_name")},
        "relationship_type": row.get("relationship_type"),
        "data_state_before": row.get("data_state"),
        "queries": queries,
        "candidate_urls": [source["url"]],
        "evidence": [endpoint_evidence],
        "decision": "review_required",
        "relationship_status": "review_required",
        "final_state": "not_established",
        "promotion_performed": False,
        "limitation": (
            "The source endpoint documentation was inspected, but the canonical candidate has no typed target endpoint. "
            "No authoritative source established both typed endpoints in the same role context or stated the recorded "
            "relationship semantics; endpoint documentation and role/tool co-occurrence are insufficient for promotion."
        ),
        "access_date": TODAY,
        "scope_guard": SCOPE_GUARD,
    }


def run() -> None:
    if not SELECTION.exists() or not CHECKPOINT.exists():
        raise SystemExit("selection/checkpoint missing; run --select first")
    selection = read_json(SELECTION)
    rows = selection.get("rows") or []
    existing = read_jsonl(LEDGER)
    if len(existing) > len(rows):
        raise SystemExit("ledger has more records than selection")
    for ordinal in range(len(existing) + 1, len(rows) + 1):
        record = make_record(rows[ordinal - 1], ordinal)
        with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        existing.append(record)
        write_json(CHECKPOINT, {
            **read_json(CHECKPOINT),
            "status": "in_progress",
            "searched_count": len(existing),
            "last_saved_ordinal": ordinal,
            "last_saved_id": record["canonical_id"],
            "last_saved_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        })
    validate(existing, final=True)


def validate(records: list[dict[str, Any]] | None = None, *, final: bool = False) -> None:
    selection = read_json(SELECTION)
    rows = selection.get("rows") or []
    records = read_jsonl(LEDGER) if records is None else records
    selection_ids = [row.get("canonical_id") for row in rows]
    record_ids = [row.get("canonical_id") for row in records]
    errors: list[str] = []
    if len(rows) != MAX_BATCH:
        errors.append(f"selection_count={len(rows)}; expected {MAX_BATCH}")
    if len(selection_ids) != len(set(selection_ids)):
        errors.append("duplicate canonical IDs in selection")
    if len(record_ids) != len(set(record_ids)):
        errors.append("duplicate canonical IDs in ledger")
    if not set(record_ids).issubset(set(selection_ids)):
        errors.append("ledger contains an ID outside the selected tranche")
    for record in records:
        if record.get("decision") != "review_required" or record.get("final_state") != "not_established":
            errors.append(f"non-review decision for {record.get('canonical_id')}")
        if record.get("promotion_performed") is not False:
            errors.append(f"promotion flag set for {record.get('canonical_id')}")
        if not record.get("to", {}).get("type") or not record.get("to", {}).get("key"):
            pass
        else:
            errors.append(f"expected unresolved target in {record.get('canonical_id')}")
        for evidence in record.get("evidence") or []:
            url = str(evidence.get("url") or "")
            if not url.startswith("https://"):
                errors.append(f"non-HTTPS evidence URL for {record.get('canonical_id')}")
            for field in ("authority", "locator", "accessed_on"):
                if not str(evidence.get(field) or "").strip():
                    errors.append(f"missing evidence.{field} for {record.get('canonical_id')}")
    payload = {
        "schema": "2026-09-23.relationship-external-evidence-validation.v1",
        "batch": TAG,
        "status": "failed" if errors else ("completed" if len(records) == len(rows) else "in_progress"),
        "selection_count": len(rows),
        "searched_count": len(records),
        "remaining_count": len(rows) - len(records),
        "review_required": sum(record.get("decision") == "review_required" for record in records),
        "promoted": sum(bool(record.get("promotion_performed")) for record in records),
        "records_with_evidence": sum(bool(record.get("evidence")) for record in records),
        "unique_canonical_ids": len(set(record_ids)),
        "exact_reconciliation": f"{len(records)}/{len(rows)}",
        "errors": errors,
        "scope_guard": SCOPE_GUARD,
    }
    write_json(REPORT, payload)
    REPORT_MD.write_text(
        f"# {TAG}\n\n"
        f"- Status: **{payload['status']}**\n"
        f"- Exact reconciliation: **{payload['exact_reconciliation']}**\n"
        f"- Review required: **{payload['review_required']}**\n"
        f"- Promoted: **{payload['promoted']}**\n"
        f"- Records with retained endpoint evidence: **{payload['records_with_evidence']}**\n"
        f"- Scope: relationship evidence only; no catalogue, SQL, seed, frontend, live DB, or browser-proof writes.\n",
        encoding="utf-8",
    )
    checkpoint = read_json(CHECKPOINT)
    checkpoint.update({
        "status": payload["status"],
        "searched_count": len(records),
        "completed_count": len(records),
        "remaining_count": len(rows) - len(records),
        "validation": REPORT.name,
        "exact_reconciliation": payload["exact_reconciliation"],
    })
    write_json(CHECKPOINT, checkpoint)
    print(json.dumps(payload, indent=2))
    if errors:
        raise SystemExit(1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--select", action="store_true")
    parser.add_argument("--run", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    if sum((args.select, args.run, args.validate)) != 1:
        parser.error("choose exactly one of --select, --run, --validate")
    if args.select:
        select()
    elif args.run:
        run()
    else:
        validate(final=False)


if __name__ == "__main__":
    main()
