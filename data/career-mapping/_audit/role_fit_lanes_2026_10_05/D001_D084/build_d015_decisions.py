"""Materialize manually adjudicated D015 role-to-parent-domain decisions."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D015_role_domain_fit_2026_10_05.json"

# Status and role-specific rationale. Work tasks/source identities are joined
# from the scripted exact-key queue below; this map contains human decisions.
RULINGS = {
    "accountant": ("supported", "The tasks directly review financial statements, budgets and reports, audit records, and advise on financial matters—the core recording, checking and reporting work in D015."),
    "accounting analyst": ("supported", "The role evaluates company financial statements and implements accounting systems/procedures, directly matching accounting analysis and reporting."),
    "accounting assistant": ("supported", "The profile records financial activity, verifies deposits and prepares daily income reports, directly supporting accounting records."),
    "audit supervisor": ("supported", "The role plans and supervises audit work, reviews work papers and reports findings, directly matching financial-control/audit work in D015."),
    "auditing clerk": ("supported", "The profile collects and checks financial data and verifies that organisational records are accurate and balanced."),
    "back office specialist": ("conditional", "Financial-company back-office administration may include recording/reconciling transactions and maintaining financial records, but the profile also includes broad non-accounting administration; accounting recordkeeping must be a substantive duty."),
    "bankruptcy trustee": ("conditional", "The role manages proceeds, creditor distributions and insolvency documentation; fit requires substantive accounting/reconciliation of estate receipts and liabilities, since the cited profile is primarily insolvency-case administration."),
    "billing clerk": ("supported", "The role prepares and issues invoices, credit memos and customer statements and updates customer accounts, matching billing and receivables processing in D015."),
    "bookkeeper": ("supported", "The role records, documents and balances routine organisational transactions in books and ledgers, directly matching D015."),
    "budget analyst": ("supported", "The profile monitors organisational spending, prepares budget reports and reviews budget models and compliance."),
    "cost analyst": ("supported", "The role prepares cost and budgeting analyses, forecasts and reconciliations to support business cost planning."),
    "dividend analyst": ("conditional", "The profile calculates and allocates dividends/interest and forecasts payments, but also includes systems-analysis duties; D015 fit rests on accounting/distribution reconciliations being central to the actual role."),
    "financial auditor": ("supported", "The role examines financial records for material misstatement, checks their accuracy/legal compliance and reviews financial policies—direct audit work."),
    "financial controller": ("supported", "The role manages organisational budgeting/accounting procedures, financial statements and external-audit documentation, directly matching D015."),
    "financial fraud examiner": ("conditional", "The profile investigates financial-statement irregularities and verifies evidence through forensic reports; fit is specifically forensic accounting/audit work, not general securities-market abuse investigation."),
    "financial markets back office administrator": ("conditional", "The role processes and clears financial-market transactions; include only where its remit includes accounting reconciliation/recording of financial transactions, since trade settlement alone is not organisation-level accounting."),
    "grants administrator": ("conditional", "The role processes grant payments and checks recipient spending; D015 fit requires accounting controls, expenditure reporting or reconciliation, not grant paperwork/disbursement alone."),
    "grants management officer": ("conditional", "The role reviews grant applications and monitors use of grant funds; fit requires substantive financial accounting, budget monitoring or expenditure audit, rather than grant selection/administration alone."),
    "investment clerk": ("unsupported", "The source describes clerical administration of investments and securities in a financial company, not recording, checking or reporting an organisation's accounting records."),
    "public finance accountant": ("supported", "The role manages governmental financial administration, income/expenditure, tax compliance and accounting records, directly within D015; this is a public-sector context, not a Nigeria-only criterion."),
    "tax advisor": ("supported", "The profile provides tax-law advice and helps clients prepare compliant, efficient tax positions and filings, matching tax accounting/advisory in D015."),
    "tax clerk": ("supported", "The role gathers financial information and prepares accounting and tax documents, directly matching D015's accounting/tax processing scope."),
}


def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[len("ESCO:"):].split("@", 1)[0]
    if ref.startswith("ONET:"):
        return "https://www.onetonline.org/link/summary/" + ref[len("ONET:"):].split("@", 1)[0]
    if ref.startswith("URL:"):
        return ref[len("URL:"):].split("@", 1)[0]
    return None


def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in worklist["role_mappings"] if row["domain_id"] == "D015"]
    if len(rows) != 22 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D015 exact queue changed; refresh and adjudicate every role key before generating")
    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        if not refs:
            raise SystemExit(f"No source ref joined for {row['role_key']}")
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs,
            "source_limit": "Task evidence is from the cited ESCO/O*NET occupation payload joined by the exact queue. These sources describe representative tasks, not every employer's job design; O*NET is US-based. Conditional status requires the accounting-specific tasks stated in the rationale.",
        })
    counts = Counter(row["domain_fit_status"] for row in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D015",
        "domain_name": rows[0]["domain_name"],
        "scope": "D015 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare actual occupation tasks with organisational accounting: recording/checking/reporting money, statements, audit, tax, budgets, billing, payroll and accounting-related financial operations. Supported requires a direct accounting task. Conditional requires the explicit accounting/reconciliation/financial-control context in the role-specific rationale. Unsupported means the source tasks describe adjacent financial administration but not accounting work. Do not infer fit from role title, ISCO/ESCO family, or subgroup membership.",
        "source_limit_policy": "ESCO/O*NET task profiles are representative occupation evidence, not universal task boundaries. O*NET is US-sourced. Any Nigeria-specific professional-route wording in the domain description is not used as a role-fit requirement; this artifact assesses occupational task fit only, not credentials or licensing.",
        "counts": {"reviewed_role_mappings": len(decisions), **{status: counts.get(status, 0) for status in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
