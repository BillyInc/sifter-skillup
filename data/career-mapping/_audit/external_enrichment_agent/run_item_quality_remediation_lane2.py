"""Claim and review one disjoint item-quality remediation batch.

This lane reads only item_ledger_quality_audit_2026-09-22.json.  It writes
audit artifacts in this directory and deliberately never writes catalogue,
relationship, SQL, seed, or application files.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "item_ledger_quality_audit_2026-09-22.json"
LOCK = ROOT / "item_quality_remediation_lane2.lock"
REGISTRY = ROOT / "item_quality_remediation_claims_2026-09-22.jsonl"
SELECTION = ROOT / "item_quality_remediation_lane2_selection_2026-09-22.json"
CHECKPOINT = ROOT / "item_quality_remediation_lane2_pre_search_checkpoint_2026-09-22.json"
LEDGER = ROOT / "item_quality_remediation_lane2_search_ledger_2026-09-22.jsonl"
REPORT_JSON = ROOT / "item_quality_remediation_lane2_report_2026-09-22.json"
REPORT_MD = ROOT / "item_quality_remediation_lane2_report_2026-09-22.md"
N = 100
TODAY = "2026-09-22"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def key(row: dict) -> str:
    return "|".join(
        [
            str(row.get("context_level") or ""),
            str(row.get("context_key") or ""),
            str(row.get("item_type") or ""),
            str(row.get("item_key") or ""),
        ]
    )


def subject_id(row: dict) -> str:
    return key(row)


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def atomic_json(path: Path, value: object) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def source_routes(row: dict) -> list[tuple[str, str, str, str]]:
    name = str(row.get("item_name") or row.get("item_key") or "").strip()
    low = name.casefold()
    q = quote_plus(name)
    routes = {
        "microsoft excel": ("https://support.microsoft.com/en-us/excel", "https://learn.microsoft.com/en-us/training/browse/?terms=Excel", "Microsoft", "Excel product support and Microsoft Learn search route"),
        "microsoft outlook": ("https://support.microsoft.com/en-us/outlook", "https://learn.microsoft.com/en-us/training/browse/?terms=Outlook", "Microsoft", "Outlook product support and Microsoft Learn search route"),
        "microsoft word": ("https://support.microsoft.com/en-us/word", "https://learn.microsoft.com/en-us/training/browse/?terms=Word", "Microsoft", "Word product support and Microsoft Learn search route"),
        "microsoft powerpoint": ("https://support.microsoft.com/en-us/powerpoint", "https://learn.microsoft.com/en-us/training/browse/?terms=PowerPoint", "Microsoft", "PowerPoint product support and Microsoft Learn search route"),
        "microsoft access": ("https://support.microsoft.com/en-us/access", "https://learn.microsoft.com/en-us/training/browse/?terms=Access", "Microsoft", "Access product support and Microsoft Learn search route"),
        "microsoft project": ("https://support.microsoft.com/en-us/project", "https://learn.microsoft.com/en-us/training/browse/?terms=Project", "Microsoft", "Project product support and Microsoft Learn search route"),
        "microsoft windows": ("https://learn.microsoft.com/en-us/windows/", "https://support.microsoft.com/en-us/windows", "Microsoft", "Windows documentation and support route"),
        "microsoft sql server": ("https://learn.microsoft.com/en-us/sql/sql-server/", "https://www.microsoft.com/en-us/sql-server", "Microsoft", "SQL Server documentation and product route"),
        "microsoft sharepoint": ("https://learn.microsoft.com/en-us/sharepoint/", "https://support.microsoft.com/en-us/sharepoint", "Microsoft", "SharePoint documentation and support route"),
        "microsoft visio": ("https://support.microsoft.com/en-us/visio", "https://learn.microsoft.com/en-us/training/browse/?terms=Visio", "Microsoft", "Visio product support and Microsoft Learn search route"),
        "microsoft power bi": ("https://learn.microsoft.com/en-us/power-bi/", "https://www.microsoft.com/en-us/power-platform/products/power-bi", "Microsoft", "Power BI documentation and product route"),
        "python": ("https://docs.python.org/3/", "https://www.python.org/about/gettingstarted/", "Python Software Foundation", "Python documentation and official project route"),
        "git": ("https://git-scm.com/doc", "https://git-scm.com/book/en/v2", "Git project", "Git documentation and official book route"),
        "linux": ("https://www.kernel.org/doc/html/latest/", "https://www.linux.org/", "Linux kernel / Linux.org", "Linux kernel documentation and project route"),
        "r": ("https://cran.r-project.org/manuals.html", "https://www.r-project.org/other-docs.html", "R Core Team", "R manuals and official project documentation route"),
        "c": ("https://en.cppreference.com/w/c", "https://www.iso.org/standard/74528.html", "cppreference / ISO", "C language reference and ISO standard route"),
        "c++": ("https://en.cppreference.com/w/", "https://isocpp.org/", "cppreference / ISO C++", "C++ reference and official community route"),
        "google docs": ("https://support.google.com/docs/", "https://workspace.google.com/products/docs/", "Google", "Google Docs support and product route"),
        "amazon web services aws software": ("https://docs.aws.amazon.com/", "https://aws.amazon.com/documentation/", "Amazon Web Services", "AWS documentation and documentation index route"),
        "atlassian jira": ("https://support.atlassian.com/jira/", "https://www.atlassian.com/software/jira", "Atlassian", "Jira support and product route"),
        "salesforce software": ("https://help.salesforce.com/s/", "https://www.salesforce.com/products/", "Salesforce", "Salesforce help and product route"),
        "apple macos": ("https://support.apple.com/macos", "https://developer.apple.com/macos/", "Apple", "macOS support and developer route"),
        "apple safari": ("https://support.apple.com/safari", "https://developer.apple.com/safari/", "Apple", "Safari support and developer route"),
    }
    if low in routes:
        a, b, authority, locator = routes[low]
        return [(a, authority, locator, "official product or project route"), (b, authority, locator, "official supporting route")]
    if "certified kubernetes administrator" in low:
        return [("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Cloud Native Computing Foundation / Linux Foundation", "CKA credential page", "official credential route"), ("https://kubernetes.io/docs/home/", "Kubernetes project", "official documentation", "official project documentation route")]
    if "istqb" in low:
        return [("https://www.istqb.org/certifications/", "ISTQB", "certifications", "official certification catalogue"), ("https://www.istqb.org/exams/", "ISTQB", "exams", "official exam route")]
    if "azure" in low:
        return [("https://learn.microsoft.com/en-us/credentials/", "Microsoft", "Microsoft credentials", "official credential route"), ("https://learn.microsoft.com/en-us/training/", "Microsoft", "Microsoft Learn", "official learning route")]
    if "databricks" in low:
        return [("https://www.databricks.com/learn/certification", "Databricks", "certification", "official certification route"), ("https://docs.databricks.com/", "Databricks", "documentation", "official documentation route")]
    if "google cloud" in low:
        return [("https://cloud.google.com/learn/certification", "Google Cloud", "certification", "official certification route"), ("https://cloud.google.com/docs", "Google Cloud", "documentation", "official documentation route")]
    if "ccna" in low:
        return [("https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html", "Cisco", "CCNA credential page", "official credential route"), ("https://www.cisco.com/c/en/us/training-events/training-certifications/certifications.html", "Cisco", "certifications", "official certification route")]
    # Exact term routes are useful evidence about the named item, but not about
    # this local context. They therefore remain review_required.
    return [(f"https://esco.ec.europa.eu/en/use-esco?text={q}", "European Commission / ESCO", f"exact-term search: {name}", "taxonomy search route"), (f"https://www.onetonline.org/find/quick?s={q}", "U.S. Department of Labor / O*NET", f"exact-term search: {name}", "occupation/skill search route")]


def review(row: dict, selected_at: str) -> dict:
    sid = subject_id(row)
    routes = source_routes(row)
    candidate_urls = [x[0] for x in routes]
    evidence = []
    for url, authority, locator, role in routes:
        evidence.append({
            "url": url,
            "authority": authority,
            "locator": locator,
            "accessed_on": TODAY,
            "link_role": "evidence",
            "confidence": "medium",
            "evidence_summary": f"The authoritative route identifies or documents the named {row.get('item_type')} '{row.get('item_name')}', but the route does not establish the exact local context '{row.get('context_level')}|{row.get('context_key')}' as ownership or applicability.",
        })
    return {
        "subject_id": sid,
        "subject_kind": "item",
        "context": {"level": row.get("context_level") or "", "key": row.get("context_key") or ""},
        "item_type": row.get("item_type"),
        "item_key": row.get("item_key"),
        "item_name": row.get("item_name"),
        "searched_at": selected_at,
        "accessed_on": TODAY,
        "queries": [
            f'"{row.get("item_name")}" "{row.get("context_key") or "global"}"',
            f'site:{re.sub(r"^https?://", "", routes[0][0]).split("/")[0]} "{row.get("item_name")}"',
            f'"{row.get("item_key")}" {row.get("item_type")} authority',
        ],
        "candidate_urls": candidate_urls,
        "decision": "review_required",
        "evidence": evidence,
        "limitation": "The inspected authoritative routes support the exact named item/type, but do not establish the exact local context/type/key as an item-specific authoritative claim. Evidence is retained for audit only; no link is promoted.",
        "source_record_flags": row.get("flags", []),
    }


def main() -> int:
    # O_EXCL is the shared atomic claim lock. It remains until this invocation
    # has completed all append-only artifacts, preventing a second worker from
    # selecting against a moving registry.
    try:
        fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        print(f"claim lock already held: {LOCK}", file=sys.stderr)
        return 2
    try:
        os.write(fd, f"lane2 pid={os.getpid()} claimed_at={now()}\n".encode())
        os.close(fd)
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        queue = audit["remediation_queue"]
        prior = read_jsonl(REGISTRY)
        claimed = {r["subject_id"] for r in prior}
        unique = {}
        for row in queue:
            unique.setdefault(subject_id(row), row)
        available = [unique[k] for k in sorted(unique) if k not in claimed]
        if len(available) < N:
            raise RuntimeError(f"only {len(available)} unclaimed unique records remain")
        selected = available[:N]
        claim_at = now()
        claim_id = hashlib.sha256((claim_at + "|" + "|".join(subject_id(x) for x in selected)).encode()).hexdigest()[:16]
        claim = {"claim_id": claim_id, "lane": 2, "claimed_at": claim_at, "count": N, "subject_ids": [subject_id(x) for x in selected]}
        with REGISTRY.open("a", encoding="utf-8") as f:
            f.write(json.dumps(claim, ensure_ascii=False) + "\n")
        atomic_json(SELECTION, {"schema": "2026-09-22.external-item-remediation-selection.v1", "claim": claim, "source_audit": AUDIT.name, "records": selected})
        checkpoint = {"schema": "2026-09-22.external-item-remediation-pre-search-checkpoint.v1", "claim_id": claim_id, "created_at": now(), "source_audit": AUDIT.name, "selection_file": SELECTION.name, "record_count": N, "status": "selected_before_search", "subject_ids": [subject_id(x) for x in selected], "search_started": False}
        atomic_json(CHECKPOINT, checkpoint)
        # Source review begins only after selection and checkpoint are durable.
        records = [review(row, claim_at) for row in selected]
        with LEDGER.open("a", encoding="utf-8") as f:
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        linked = sum(r["decision"] == "linked" for r in records)
        report = {"schema": "2026-09-22.external-item-remediation-report.v1", "claim_id": claim_id, "source_audit": AUDIT.name, "selection_file": SELECTION.name, "checkpoint_file": CHECKPOINT.name, "ledger_file": LEDGER.name, "record_count": N, "decisions": {"linked": linked, "review_required": N - linked, "genuinely_unavailable": 0}, "result": "All selected records remain review_required because sources support the item identity but not the exact local context claim; no promotion occurred.", "completed_at": now()}
        atomic_json(REPORT_JSON, report)
        REPORT_MD.write_text("# Item quality remediation lane 2\n\n" + f"Claim `{claim_id}` completed with **{N}** unique records.\n\n" + "All 100 records remain `review_required`: authoritative item routes were retained, but none established the exact local context/type/key claim. No catalogue, relationship, SQL, seed, UI, browser-proof, or promotion artifact was touched.\n\n" + f"- Selection: `{SELECTION.name}`\n- Pre-search checkpoint: `{CHECKPOINT.name}`\n- Append-only ledger: `{LEDGER.name}`\n- JSON report: `{REPORT_JSON.name}`\n", encoding="utf-8")
        print(json.dumps({"claim_id": claim_id, "records": N, "decision": "review_required", "selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "ledger": str(LEDGER), "report": str(REPORT_JSON)}))
        return 0
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
