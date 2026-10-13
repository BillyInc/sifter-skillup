"""Build exact-key D062 Trading role-to-parent-domain fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D062_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D062_role_domain_fit_review_2026_10_05.md"
CFA_CAREERS = "https://www.cfainstitute.org/programs/cfa-program/careers"
CFA_TRADING = "https://www.cfainstitute.org/programs/cfa-program/careers/sales-and-trading"
CFA_PORTFOLIO = "https://www.cfainstitute.org/programs/cfa-program/careers/portfolio-manager"
CFA_RESEARCH = "https://www.cfainstitute.org/programs/cfa-program/careers/research-analyst"
CFTC_FUTURES = "https://www.cftc.gov/LearnAndProtect/EducationCenter/FuturesMarketBasics/index2.htm"

# Status is parent-domain fit from task evidence only, not fit to an
# unreviewed specialization or role path.
DECISIONS = {
    "asset manager": ("supported", "The task directly manages client portfolios and financial assets under an investment policy and risk framework; portfolio management includes investment decisions and buy/sell choices.", None),
    "business valuer": ("conditional", "The task spans entity, intangible-asset and securities valuation for M&A, litigation, insolvency and tax. Only its securities/investment-valuation assignments directly support D062.", "valuation of traded securities or investment assets"),
    "corporate investment banker": ("conditional", "The task focuses on capital raising, M&A and strategic financial advice. These can be investment-bank activities, but are not themselves market trading; retain only where the work supports D062 capital-markets/investment products.", "capital-markets or securities-financing assignment, not generic corporate advisory"),
    "corporate risk manager": ("unsupported", "The supplied task is enterprise-wide risk management across a company. It does not establish financial-market, investment-portfolio or trading risk work.", None),
    "energy trader": ("supported", "The task explicitly buys/sells energy exposures based on energy-market prices and trends; commodity futures markets are a recognized market-trading activity.", None),
    "financial analyst": ("conditional", "The task covers broad financial analysis of profitability, liquidity, solvency and assets across public and private employers. It fits D062 only when focused on investable assets, securities, portfolios or markets.", "investment-market, securities or portfolio analysis"),
    "financial broker": ("supported", "The task arranges client transactions in securities and financial markets, directly matching intermediation in traded financial assets.", None),
    "financial planner": ("conditional", "The task combines investment, retirement, insurance, risk and tax planning. The D062 link applies only to the investment/portfolio-planning component, not general financial planning.", "investment and portfolio allocation advice"),
    "financial risk manager": ("conditional", "The task spans credit, market, operational and regulatory risk. Market/portfolio risk is within D062; enterprise, operational and general credit functions may not be.", "financial-market, trading or investment-portfolio risk"),
    "financial trader": ("supported", "The task directly buys and sells financial products for clients or institutions while monitoring markets and transaction risk.", None),
    "foreign exchange broker": ("supported", "The task directly intermediates currency-market transactions and analyses exchange-rate liquidity and volatility.", None),
    "foreign exchange trader": ("supported", "The task directly trades currencies based on foreign-exchange market movements and analysis.", None),
    "futures trader": ("supported", "The task directly trades futures contracts; the CFTC defines futures as exchange-traded agreements to buy or sell a commodity at a future date.", None),
    "investment adviser": ("supported", "The task recommends securities and investment products such as stocks, bonds, mutual funds and exchange-traded funds to clients.", None),
    "investment analyst": ("supported", "The task researches investments and makes recommendations to fund managers, directly supporting market/investment decisions.", None),
    "investment fund management assistant": ("conditional", "The task combines client financial-planning advice with fund formation/administration. Only the fund-investment and portfolio-support duties fit D062; client service or generic administration alone does not.", "investment research, fund construction or portfolio administration"),
    "investment fund manager": ("supported", "The task implements and monitors a fund investment strategy and manages portfolio trading and investment research.", None),
    "investment manager": ("supported", "The task manages an investment portfolio and assesses financial products/securities and market behaviour to select investments.", None),
    "investor relations manager": ("unsupported", "The task communicates company strategy and investor-facing disclosures; it does not execute trading, investment research or portfolio-management duties.", None),
    "mergers and acquisitions analyst": ("conditional", "The task evaluates and executes company purchase, sale, merger and takeover transactions. This can be investment-banking/capital-markets work, but is not necessarily trading of financial assets.", "investment-banking transaction execution or traded-asset valuation"),
    "middle office analyst": ("conditional", "The task supports a financial-company treasury/front office through compliance, risk measurement and analysis. It fits when the remit is tied to traded products, treasury or market risk, not generic financial administration.", "trading, treasury or financial-market risk/controls"),
    "mutual fund broker": ("conditional", "The task raises and invests shareholder cash in securities and money-market instruments, but appears to combine fund distribution with investment activity. Retain only where the role performs fund-investment intermediation or transactions, not pure sales/service.", "mutual-fund investment transactions or securities intermediation"),
    "securities analyst": ("supported", "The task researches securities and market trends and makes investment forecasts/recommendations.", None),
    "securities broker": ("supported", "The task executes or arranges clients' securities purchases and sales and monitors those investments.", None),
    "securities trader": ("supported", "The task directly buys and sells securities for self or employer using financial-market expertise.", None),
    "securities underwriter": ("supported", "The task prices and distributes new securities from an issuer to investors, a direct securities-market issuance function.", None),
    "stock broker": ("supported", "The task directly places client stock and securities transactions through exchange markets.", None),
    "stock trader": ("supported", "The task analyses and trades stocks and other market instruments for investment returns.", None),
    "venture capitalist": ("conditional", "The task invests in private start-ups and helps build their businesses. Private-market investing is related to investment management, but it is not public-market trading described by D062.", "private-market investment fund or venture-capital portfolio management"),
}


def _urls(refs: list[str]) -> list[str]:
    result = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            result.append(url)
    return list(dict.fromkeys(result))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D062"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 29 or len(by_name) != 29 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D062 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([CFA_CAREERS, CFA_TRADING, CFA_PORTFOLIO])
        if name in {"investment analyst", "securities analyst", "financial analyst", "business valuer"}:
            refs.append(CFA_RESEARCH)
        if name in {"energy trader", "futures trader"}:
            refs.append(CFTC_FUTURES)
        action = ("retain_parent_domain_link_candidate" if status == "supported" else
                  "remove_parent_domain_link_candidate_after_cross_lane_reconciliation" if status == "unsupported" else
                  "do_not_present_as_confirmed_D062_role_without_assignment_evidence")
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESCO/O*NET task profiles describe the supplied occupation, which may span multiple sectors and task variants. CFA Institute career materials are professional education/career references and corroborate investment-management, research and sales/trading functions; they are not a universal occupational classification. CFTC sources concern US-regulated futures/commodity markets and clarify instruments, not global occupational eligibility. No source establishes local demand or licensing.",
            "recommended_action": action,
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D062", "domain_name": "Trading",
        "scope": "D062 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all 29 exact D062 role mappings. Compared supplied ESCO/O*NET task evidence with buying/selling currencies, shares, commodities and energy, market research, securities transactions, investment management and fund/risk advice in the stored scope. General enterprise risk, investor communication and broad financial planning were not treated as trading without a market/investment task. CFA Institute materials corroborate investment functions; CFTC materials anchor commodity futures. Conditional roles need the recorded task-specific assignment.",
        "scope_sources": [CFA_CAREERS, CFA_TRADING, CFA_PORTFOLIO, CFA_RESEARCH, CFTC_FUTURES],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. Conditional records require the exact investment-market task noted; unsupported records are candidate parent-domain exclusions, not automatic assignments elsewhere. Reconcile all lanes before canonical changes.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D062 — Trading: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/29 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[CFA Institute investment career paths]({CFA_CAREERS}) distinguish research, portfolio management, trading, corporate finance and related roles. Its [sales and trading overview]({CFA_TRADING}) describes buying and selling financial products for investors, while its [portfolio-manager profile]({CFA_PORTFOLIO}) identifies investment decisions and portfolio construction. [CFTC futures-market basics]({CFTC_FUTURES}) describes futures contracts and commodity trading; that US-market regulator source is used to define the instrument, not to infer global access or licensing.",
                  "", "Conditional is not confirmed: it marks occupations whose tasks span the investment market and other functions. Generic corporate risk, investor relations and broad financial planning do not become Trading roles by financial-sector proximity alone.", "",
                  f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/29; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Every decision includes task text, rationale, sources, source limits and recommended action.",
                  "- No canonical role or specialization data changed."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
