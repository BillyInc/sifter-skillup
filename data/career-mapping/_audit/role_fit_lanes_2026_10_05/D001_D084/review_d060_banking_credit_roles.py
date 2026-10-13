"""Build an exact-key, task-grounded D060 parent-domain fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D060_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D060_role_domain_fit_review_2026_10_05.md"

EBA_LOAN = "https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/credit-risk/guidelines-loan-origination-and-monitoring"
O_NET_TELLERS = "https://www.onetonline.org/link/details/43-3071.00"
O_NET_CREDIT_ANALYST = "https://www.onetonline.org/link/details/13-2041.00"
O_NET_CREDIT_CLERK = "https://www.onetonline.org/link/details/43-4041.00"
O_NET_CREDIT_COUNSELOR = "https://www.onetonline.org/link/details/13-2071.00"
O_NET_LOAN_OFFICER = "https://www.onetonline.org/link/details/13-2072.00"
O_NET_BANKING_CLUSTER = "https://www.onetonline.org/find/career?c=030102"

# A role is "supported" only when its supplied tasks directly describe bank,
# credit-union, credit-risk, lending, mortgage, or credit-counselling work.
# Broad occupations that need an actual bank/credit assignment are conditional.
DECISIONS = {
    "auditing clerk": ("conditional", "The supplied task is general financial-record auditing, not bank-specific. This link fits only for an auditing-clerk assignment inside a bank or credit provider.", "bank or credit-provider financial records and controls"),
    "back office specialist": ("conditional", "The task describes support operations in a financial company. That includes but is not limited to banks; retain this path only where the actual back-office remit supports banking or credit transactions.", "bank or credit transaction processing"),
    "bank account manager": ("supported", "The task directly covers advising clients on bank accounts, opening accounts, documentation, and ongoing bank customer service." , None),
    "bank manager": ("supported", "The task explicitly oversees bank activities, safe banking operations, bank policy, and compliance." , None),
    "bank teller": ("supported", "The task directly covers customer deposits, withdrawals, cash balancing, bank accounts, and related transactions." , None),
    "brokerage firm director": ("unsupported", "The task is securities-trading strategy and brokerage management. It does not describe deposit banking, lending, mortgage, or credit-union services in the stored D060 scope." , None),
    "credit adviser": ("supported", "The task directly advises clients on credit, debt and borrowing solutions, which is the core credit-services remit." , None),
    "credit analyst": ("supported", "The task assesses borrower credit applications and repayment risk for lending decisions; that directly matches credit analysis." , None),
    "credit manager": ("supported", "The task sets and administers credit policy, limits, risk acceptance, payment terms, and collection for a lender." , None),
    "credit risk analyst": ("supported", "The task explicitly assesses individual credit risk and recommends risk levels, directly matching lender credit-risk work." , None),
    "credit union manager": ("supported", "The task explicitly manages credit-union member services, staff, operations, policies, and financial reporting." , None),
    "debt collector": ("conditional", "The task is generic overdue-debt collection and does not identify the creditor. It belongs here only when collecting debts for a bank, credit union, mortgage lender, or other credit provider." , "collections for a banking or credit provider"),
    "financial markets back office administrator": ("conditional", "The task explicitly processes securities, derivatives, FX and commodity trades and clearing/settlement. These are financial-market operations, not necessarily banking or credit; retain only for a bank-owned trading/settlement desk whose remit is within the D060 offering." , "bank-owned financial-market operations; not a general market-operations assignment"),
    "foreign exchange cashier": ("conditional", "The task covers currency exchange and cash transactions but does not establish that the employer is a bank. Keep only for a bank or credit-provider foreign-exchange counter, not a general exchange bureau." , "bank-based foreign-exchange cash service"),
    "investment clerk": ("conditional", "The task describes securities-investment administration in a financial company. It is not inherently banking or credit work; retain only for an investment operation within a bank covered by D060." , "investment administration within a bank"),
    "loan officer": ("supported", "The task directly evaluates, recommends or authorizes consumer, commercial and mortgage credit and advises borrowers." , None),
    "mortgage broker": ("supported", "The task directly handles mortgage applications, lender documentation and mortgage-loan completion; mortgage firms are explicitly within D060's scope." , None),
    "mortgage loan underwriter": ("supported", "The task reviews mortgage loans against underwriting policy and guidelines, directly matching mortgage-credit assessment." , None),
    "pawnbroker": ("conditional", "The task involves secured consumer lending against personal property, so it is credit work, but it is a distinct non-bank lending model. Keep only if D060 intentionally includes non-bank credit providers; otherwise it belongs outside the bank/mortgage/credit-union scope." , "non-bank secured consumer lending explicitly included in D060's credit-services scope"),
    "pension scheme manager": ("unsupported", "The task manages pension schemes, retirement benefits and pension-fund deployment. It does not establish banking, lending, mortgage, or credit-union work." , None),
    "student financial support coordinator": ("conditional", "The task serves students and education administrators by determining or advising on student loans. It fits only where the work is loan/credit administration, not general student financial aid or campus support." , "student-loan eligibility, origination or servicing"),
}


def _source_urls(refs: list[str]) -> list[str]:
    urls: list[str] = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/details/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D060"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 21 or len(by_name) != 21 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D060 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")

    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _source_urls(row["task_source_refs"])
        refs.extend([EBA_LOAN, O_NET_BANKING_CLUSTER])
        if name == "bank teller":
            refs.append(O_NET_TELLERS)
        if name in {"credit analyst", "credit risk analyst"}:
            refs.append(O_NET_CREDIT_ANALYST)
        if name in {"credit adviser", "credit manager"}:
            refs.extend([O_NET_CREDIT_COUNSELOR, O_NET_CREDIT_CLERK])
        if name in {"loan officer", "mortgage broker", "mortgage loan underwriter", "student financial support coordinator"}:
            refs.extend([O_NET_LOAN_OFFICER, EBA_LOAN])
        if name == "credit union manager":
            refs.append(O_NET_BANKING_CLUSTER)
        action = ("retain_parent_domain_link_candidate" if status == "supported" else
                  "remove_parent_domain_link_candidate_after_cross_lane_reconciliation" if status == "unsupported" else
                  "do_not_present_as_confirmed_D060_role_without_assignment_evidence")
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESCO/O*NET occupation task records describe the supplied occupation profiles; they do not prove that every incumbent performs the domain-specific variant. EBA loan-origination guidance corroborates the distinct lifecycle and risk-control functions of lending; it is EU guidance, not a global legal rule. O*NET's Banking & Credit cluster is a US career taxonomy used only as a corroborating grouping. No source here establishes local demand, qualifications, or universal jurisdictional rules.",
            "recommended_action": action,
        })

    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1,
        "domain_id": "D060",
        "domain_name": rows[0]["domain_name"],
        "scope": "D060 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed every exact D060 role key. Used its supplied ESCO/O*NET task profile as the role evidence and compared the actual tasks—not title, ISCO membership, subgroup placement, or frequency—to the stored D060 scope. Marked mixed-sector roles conditional where a specific bank/credit assignment is necessary. EBA lending guidance and O*NET banking/credit role references anchor the domain boundaries; source limits are stated per decision.",
        "scope_sources": [EBA_LOAN, O_NET_BANKING_CLUSTER, O_NET_TELLERS, O_NET_CREDIT_ANALYST, O_NET_CREDIT_CLERK, O_NET_CREDIT_COUNSELOR, O_NET_LOAN_OFFICER],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0),
        "decisions": decisions,
        "canonical_changes": 0,
        "canonical_correction_ready": False,
        "correction_note": "This is a review artifact, not a canonical edit. Supported means task evidence directly fits D060. Conditional links require the stated employer/assignment scope and must not be displayed as confirmed without that context. Unsupported means current task evidence does not fit the stored D060 scope. Cross-lane reconciliation is required before any canonical removal or reassignment.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    rows = payload["decisions"]
    lines = [
        "# D060 — Banking and Credit Services: role-to-parent-domain fit", "",
        f"**Slice:** {c['reviewed_role_mappings']}/21 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.", "",
        "| Disposition | Count |", "|---|---:|",
        f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |",
        f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
        "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in rows)
    lines.extend([
        "", "## Evidence and limits", "",
        f"The [EBA Guidelines on Loan Origination and Monitoring]({EBA_LOAN}) treat lending as a lifecycle involving borrower assessment, credit-risk controls and monitoring; this is a jurisdiction-specific regulatory source, used here to corroborate task boundaries rather than impose EU rules globally. O*NET's [Banking & Credit cluster]({O_NET_BANKING_CLUSTER}) identifies banking, loans, microlending and commercial/consumer credit as related job contexts. O*NET task profiles for [tellers]({O_NET_TELLERS}), [credit analysts]({O_NET_CREDIT_ANALYST}), [credit clerks]({O_NET_CREDIT_CLERK}), [credit counsellors]({O_NET_CREDIT_COUNSELOR}) and [loan officers]({O_NET_LOAN_OFFICER}) corroborate the corresponding work tasks. Exact ESCO/O*NET task record URLs are retained per decision.",
        "", "Conditional is not a weak synonym for supported: it means an actual bank/credit assignment must be established before the mapping is shown as a confirmed D060 path. Securities brokerage, pension management and general auditing/collections are not automatically bank/credit work. Pawnbroking is conditional because the stored domain scope does not make clear whether it includes non-bank secured lending.",
        "", "## Audit checks", "", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/21; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
        "- Every decision records supplied task evidence, rationale, source URLs, source limits, and action.",
        "- No canonical role mapping or specialization data changed.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
