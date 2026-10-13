"""Build the exact-key D084 Payroll and Bookkeeping role-fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D084_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D084_role_domain_fit_review_2026_10_05.md"

ONET = "https://www.onetonline.org/link/summary/"

# Each choice is about the supplied duties and the stored parent-domain scope,
# not ISCO membership, title similarity, or a presumed specialist assignment.
DECISIONS = {
    "auditing clerk": (
        "supported",
        "The supplied duties examine and verify an organisation's financial records and transactions; that is expressly within the domain's accounting-record and audit-support scope.",
    ),
    "back office specialist": (
        "conditional",
        "The ESCO task definition covers financial-company administration, transaction processing, data and documents, but does not establish that bookkeeping/payroll recordkeeping is the actual assignment rather than another back-office function.",
        "Retain only where the job is substantively assigned to bookkeeping, payroll, or maintenance/reconciliation of financial account records; general transaction operations alone are insufficient.",
    ),
    "billing clerk": (
        "supported",
        "The task creates invoices, credit memos and customer statements and updates customer files, matching billing records and financial-document maintenance.",
    ),
    "bookkeeper": (
        "supported",
        "The task records, balances and assembles routine sales, purchase, payment and receipt transactions in day books and ledgers—the central work of bookkeeping.",
    ),
    "Bookkeeping, Accounting, and Auditing Clerks": (
        "supported",
        "The task explicitly classifies, records, calculates and verifies numerical data to maintain complete financial records.",
    ),
    "financial markets back office administrator": (
        "unsupported",
        "The supplied duties centre on clearing and settling securities, derivatives, foreign-exchange and commodity trades. That is market-transaction operations, not payroll/bookkeeping as this parent domain is defined.",
    ),
    "foreign exchange cashier": (
        "conditional",
        "The role chiefly executes currency cash transactions and provides exchange-rate information; recording those transactions is relevant, but the source does not show that maintaining/reconciling books or payroll records is a substantive duty.",
        "Retain only if the actual assignment includes substantive bookkeeping, ledger maintenance or financial-record reconciliation; cash exchange and transaction logging alone do not establish D084 fit.",
    ),
    "Human Resources Assistants, Except Payroll and Timekeeping": (
        "unsupported",
        "The occupational scope explicitly excludes payroll/timekeeping and centres on personnel files, recruitment and HR administration, not bookkeeping or payroll records.",
    ),
    "insurance clerk": (
        "unsupported",
        "The supplied duties are insurance-policy/claims administration and customer assistance. The source does not establish bookkeeping/payroll or maintenance of general financial accounts.",
    ),
    "investment clerk": (
        "conditional",
        "The supplied duties administer securities investments. That is investment/market operations unless the actual role also has substantive accounting-ledger or financial-bookkeeping responsibilities.",
        "Retain only for an evidenced assignment maintaining/reconciling financial books or account ledgers; investment administration or securities transaction support alone is insufficient.",
    ),
    "New Accounts Clerks": (
        "unsupported",
        "The authoritative O*NET task profile describes interviewing prospective bank customers, explaining account services and helping with applications. Those are account-opening and customer-service tasks, not bookkeeping/payroll.",
    ),
    "Payroll and Timekeeping Clerks": (
        "supported",
        "The task compiles employee time and payroll data, calculates wages and deductions, posts records and prepares paychecks, directly matching payroll recordkeeping.",
    ),
    "payroll clerk": (
        "supported",
        "The task manages timesheets and paychecks and checks overtime, leave and pay accuracy, directly matching payroll records and processing.",
    ),
    "sales support assistant": (
        "conditional",
        "The supplied duties are primarily sales support; checking invoices/accounting documents is relevant but does not establish that bookkeeping or maintaining financial books is a substantive part of the role.",
        "Retain only where the actual assigned work includes regular financial-record maintenance or reconciliation; incidental invoice checking/report preparation within sales support is insufficient.",
    ),
    "tax clerk": (
        "supported",
        "The task collects financial information and prepares accounting and tax documents, which fits the domain's clerical financial-record and tax-document work; it does not imply the role independently determines tax liability.",
    ),
}

ONET_BY_ROLE = {
    "auditing clerk": ["43-3031.00", "13-2011.00"],
    "billing clerk": ["43-3021.00"],
    "bookkeeper": ["43-3031.00"],
    "Bookkeeping, Accounting, and Auditing Clerks": ["43-3031.00"],
    "financial markets back office administrator": ["43-4011.00"],
    "Human Resources Assistants, Except Payroll and Timekeeping": ["43-4161.00"],
    "insurance clerk": ["43-9041.00"],
    "investment clerk": ["43-4011.00"],
    "New Accounts Clerks": ["43-4141.00"],
    "Payroll and Timekeeping Clerks": ["43-3051.00"],
    "payroll clerk": ["43-3051.00"],
    "tax clerk": ["13-2081.00"],
}

SCOPE_SOURCES = [
    "https://www.onetonline.org/link/summary/43-3031.00",
    "https://www.onetonline.org/link/summary/43-3021.00",
    "https://www.onetonline.org/link/summary/43-3051.00",
    "https://www.onetonline.org/link/summary/43-4141.00",
    "https://www.onetonline.org/link/summary/43-4161.00",
    "https://www.onetonline.org/link/summary/43-4011.00",
    "https://www.onetonline.org/link/summary/43-9041.00",
]


def urls(refs: list[str]) -> list[str]:
    result = []
    for ref in refs:
        kind, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if kind == "ONET" and not url.startswith(("http://", "https://")):
            url = ONET + url
        if url.startswith(("http://", "https://")):
            result.append(url)
    return list(dict.fromkeys(result))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D084"]
    by_name = {r["role_name"]: r for r in rows}
    if len(rows) != 15 or len(by_name) != 15 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D084 exact residual queue changed: {len(rows)} mappings; names={sorted(by_name)}")

    decisions = []
    for role_name, values in DECISIONS.items():
        status, basis, *condition = values
        row = by_name[role_name]
        refs = urls(row["task_source_refs"])
        refs.extend(ONET + code for code in ONET_BY_ROLE.get(role_name, []))
        refs = list(dict.fromkeys(refs))
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "conditional_scope": condition[0] if condition else None,
            "source_refs": refs,
            "source_limit": "ESCO is a European Union occupation/skills classification; O*NET is a United States Department of Labor occupational reference. They corroborate task boundaries but do not establish Nigerian job demand, local licensing, or a universal employment requirement. This review assesses only role tasks against D084's parent scope; it makes no role-to-specialization decision.",
            "recommended_action": {
                "supported": "retain_parent_domain_link_candidate",
                "conditional": "retain_only_with_task_scope_condition",
                "unsupported": "propose_parent_domain_link_removal",
            }[status],
            "geographic_scope": "non-Nigeria-specific occupational reference; no Nigerian title variant or local labour-demand claim added",
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1,
        "domain_id": "D084",
        "domain_name": "Payroll and Bookkeeping",
        "scope": "D084 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Rebuilt the exact residual against the current canonical inventory and saved D001-D083 decision artifacts. Reviewed each exact D084|role key using its own supplied task text and exact ESCO/O*NET occupational evidence where available. A broad financial-services setting, adjacent financial transaction, similar title, or ISCO/subgroup placement is not by itself bookkeeping/payroll evidence. Conditional rows require the stated assigned-task condition; unsupported rows are correction proposals, not applied canonical edits.",
        "scope_sources": SCOPE_SOURCES,
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0),
        "decisions": decisions,
        "correction_proposals": [
            {
                "exact_role_key": d["role_key"],
                "proposed_action": "remove D084 parent-domain link",
                "evidence": d["task_evidence"],
                "reason": d["basis"],
                "source_refs": d["source_refs"],
                "canonical_edit_applied": False,
            }
            for d in decisions if d["domain_fit_status"] == "unsupported"
        ],
        "canonical_changes": 0,
        "canonical_correction_ready": False,
        "correction_note": "Audit proposal only. No canonical domain, subgroup, role, or seed data was edited.",
    }


def main() -> None:
    report = build()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = report["counts"]
    lines = [
        "# D084 — Payroll and Bookkeeping: role-to-parent-domain fit", "",
        f"**Slice:** {c['reviewed_role_mappings']}/15 exact residual mappings reviewed against task evidence and the stored D084 parent scope. Canonical data unchanged.", "",
        "| Disposition | Count |", "|---|---:|",
        *[f"| {name.title()} | {c[name]} |" for name in ("supported", "conditional", "unsupported", "unresolved")],
        "", "## Exact decisions", "", "| Exact role key | Result | Task-based rationale |", "|---|---|---|",
    ]
    lines.extend(f"| `{d['role_key']}` | {d['domain_fit_status']} | {d['basis']} |" for d in report["decisions"])
    lines.extend(["", "## Proposed canonical corrections (not applied)", ""])
    if report["correction_proposals"]:
        lines.extend(f"- `{p['exact_role_key']}` — remove the D084 parent-domain link. The source task is outside payroll/bookkeeping as scoped; see the exact evidence and source references in the JSON report." for p in report["correction_proposals"])
    else:
        lines.append("None.")
    lines.extend([
        "", "## Sources and limits", "",
        "The exact ESCO occupation definitions and task payloads are cited per role in the JSON report. O*NET's [bookkeeping/accounting/auditing clerk profile](https://www.onetonline.org/link/summary/43-3031.00), [billing and posting clerks](https://www.onetonline.org/link/summary/43-3021.00), [payroll and timekeeping clerks](https://www.onetonline.org/link/summary/43-3051.00), and [New Accounts Clerks](https://www.onetonline.org/link/summary/43-4141.00) distinguish bookkeeping/payroll from account-opening and customer transactions. O*NET also separately defines [HR assistants excluding payroll](https://www.onetonline.org/link/summary/43-4161.00), [insurance claims and policy processing clerks](https://www.onetonline.org/link/summary/43-9041.00), and [brokerage clerks](https://www.onetonline.org/link/summary/43-4011.00). These are cross-jurisdiction occupational references, not evidence of Nigerian demand or Nigerian licensure.",
        "", "Four records remain conditional rather than being treated as confirmed student paths: back-office specialist, foreign-exchange cashier, investment clerk and sales-support assistant are checked against the task-scope condition stated on each exact decision.", "",
        f"- Exact D084 residual coverage: {c['reviewed_role_mappings']}/15; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
        "- Unsupported-link actions are proposals only; no canonical edit or seed regeneration was performed.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
