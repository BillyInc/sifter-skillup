"""Materialize the manually adjudicated D013 parent-domain decision slice.

Role keys/statuses/rationales are curated decisions. Task descriptions and
source identifiers are copied from the generated exact-key evidence worklist.
This helper never edits canonical role/domain data.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D013_role_domain_fit_2026_10_05.json"

# status, case-specific reason for the disposition
RULINGS = {
    "asset manager": ("supported", "The profile directly invests and manages client portfolios within an investment policy and risk framework, a core D013 activity."),
    "business valuer": ("conditional", "Business/security valuation can inform capital allocation and investment decisions, but the cited profile also serves litigation, tax, restructuring and other non-investment purposes; an investment-analysis assignment is required."),
    "corporate banking adviser": ("conditional", "The role covers corporate financial products and capital-markets advice as well as credit, cash management, insurance and leasing; D013 fit is limited to the documented investment/capital-markets analysis work."),
    "corporate investment banker": ("conditional", "Capital raising, M&A and strategic financial advice can involve investment analysis, but the profile also includes regulatory and transaction services; substantive investment valuation/analysis is required."),
    "corporate risk manager": ("conditional", "The profile covers enterprise-wide threats and opportunities. It fits D013 only when assessing investment, portfolio or financial-market risk, not general operational risk."),
    "energy trader": ("supported", "The profile directly trades energy-market interests and analyzes market prices/trends to choose transactions; D013 explicitly includes traders and investment-market analysis."),
    "financial analyst": ("conditional", "The profile analyzes financial performance and gives recommendations, but those tasks may concern corporate finance rather than investment selection; investment or asset-allocation analysis must be part of the assignment."),
    "Financial and Investment Advisers": ("unresolved", "This WEF growth-category label has no occupational task profile. Trend classification alone cannot establish what work the role performs."),
    "financial broker": ("supported", "The profile conducts client financial-market transactions, monitors securities and market conditions, and plans purchases/sales."),
    "financial planner": ("supported", "The profile explicitly includes investment planning and advice on securities and other investment products, alongside retirement, risk, insurance and tax planning."),
    "financial risk manager": ("conditional", "The profile explicitly measures financial risks, but spans credit, market, operational and regulatory risk; D013 fit applies to investment/market-risk analysis, not operational or compliance-only work."),
    "financial trader": ("supported", "The role buys and sells financial products and monitors markets to manage returns and risk, directly matching D013's trading scope."),
    "foreign exchange broker": ("supported", "The profile brokers currency transactions and analyzes liquidity/volatility to anticipate exchange-rate movements."),
    "foreign exchange trader": ("supported", "The profile directly trades currencies and analyzes market liquidity, volatility and rates."),
    "futures trader": ("supported", "The role buys and sells futures contracts based on expected price movements in a financial market."),
    "insurance rating analyst": ("conditional", "Credit/insurance-market rating analysis may inform investment decisions, but the profile can focus on insurance ratings and reporting without assessing investment suitability; investment-facing analysis is required."),
    "investment adviser": ("supported", "The role recommends securities and other investment solutions to clients based on financial needs and investment advice."),
    "investment analyst": ("supported", "The profile directly researches investments and financial markets and recommends actions to fund managers."),
    "investment fund management assistant": ("supported", "The profile assists fund creation/administration and fund-management implementation and advises clients on investment products, directly supporting investment operations."),
    "investment fund manager": ("supported", "The role implements and monitors fund investment strategies, oversees portfolios and supervises investment research and recommendations."),
    "investment manager": ("supported", "The role manages company investment portfolios and analyzes financial markets and securities to seek suitable investments."),
    "investor relations manager": ("unsupported", "The cited tasks communicate a company's strategy to the investment community and manage inquiries; they do not establish investment research, advice, portfolio decisions or trading."),
    "mergers and acquisitions analyst": ("conditional", "M&A execution and due diligence can include investment valuation and capital-allocation analysis, but the profile also centers negotiation and transaction coordination; substantive investment analysis is required."),
    "middle office analyst": ("conditional", "The profile measures risk and analyzes treasury/financial matters, but also covers compliance and operations. D013 fit is limited to investment/market/portfolio analysis rather than policy administration alone."),
    "mutual fund broker": ("supported", "The profile handles investor transactions in mutual funds and related securities and provides product/account guidance, directly tied to investment products and fund activity."),
    "personal trust officer": ("supported", "The role administers trusts, defines investment objectives with advisers and coordinates purchases/sales of securities for those objectives."),
    "programme funding manager": ("unsupported", "The profile develops an organization's programme-funding strategy, without establishing securities, portfolio, market or investment-product analysis."),
    "public funding advisor": ("unsupported", "The profile advises on government grants/subsidies and application administration, not investment analysis or financial-market activity."),
    "relationship banking manager": ("unsupported", "The role grows customer relationships and sells banking products; the task profile does not establish investment research, portfolio management, securities advice or trading."),
    "securities analyst": ("supported", "The profile researches and analyzes financial, legal and economic information about securities and forecasts investment trends to advise clients."),
    "securities broker": ("supported", "The role intermediates client purchases/sales of securities and monitors security performance and stability."),
    "securities trader": ("supported", "The role buys and sells securities and monitors their performance and speculative behavior, directly matching D013 trading activity."),
    "securities underwriter": ("conditional", "Pricing and distributing new securities is a capital-markets activity, but the profile may focus on issuance/distribution rather than investment analysis; valuation/pricing or investor-allocation work must be substantive."),
    "stock broker": ("supported", "The role executes client-directed stock/security purchases and sales in exchange markets and advises on available investments."),
    "stock trader": ("supported", "The role analyzes market performance and company results, recommends investment strategies and conducts stock-market transactions."),
    "venture capitalist": ("supported", "The role invests in startups, researches markets/product opportunities and supports portfolio companies, directly performing investment selection and management."),
}


def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[len("ESCO:"):].split("@", 1)[0]
    if ref.startswith("ONET:"):
        code = ref[len("ONET:"):].split("@", 1)[0]
        return f"https://www.onetonline.org/link/summary/{code}"
    if ref.startswith("URL:"):
        return ref[len("URL:"):].split("@", 1)[0]
    return None


def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in worklist["role_mappings"] if r["domain_id"] == "D013"]
    if len(rows) != 36 or {r["role_name"] for r in rows} != set(RULINGS):
        raise SystemExit("D013 queue changed: refresh and adjudicate every exact role key before generating")
    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(
            url for ref in row["task_source_refs"] if (url := source_url(ref))
        ))
        if row["role_name"] == "Financial and Investment Advisers" and not refs:
            # The WEF report establishes only the trend-label provenance; it
            # is deliberately not treated as a source of occupational tasks.
            refs = ["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs,
            "source_limit": (
                "Task evidence is copied from the lane's cited ESCO/O*NET source payload. "
                "ESCO/O*NET profiles describe representative occupational tasks, not every employer's job design; "
                "O*NET evidence is US-based. Any conditional decision requires the stated investment-specific context."
            ),
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D013",
        "domain_name": rows[0]["domain_name"],
        "scope": "D013 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact role task descriptions to D013's scope: analyzing companies, markets and financial products for capital placement; managing investment funds/portfolios; advising on personal investment; and trading shares, currencies and securities. Supported requires a direct task match. Conditional requires a specifically investment-facing assignment where the occupation also spans other work. Unsupported means the sourced tasks are adjacent financial services but do not perform the domain's investment work. Unresolved is used when the record has no role-task evidence. Never infer fit from title or occupational/subgroup membership.",
        "source_limit_policy": "ESCO/O*NET task profiles are occupational evidence, not universal job descriptions; O*NET is US-sourced. WEF trend labels do not define role tasks. This is a parent-domain fit decision only, not specialization assignment or licensing advice.",
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
