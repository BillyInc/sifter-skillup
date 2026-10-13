"""Add missing, source-backed core quantitative-finance roles.

This is intentionally a small idempotent canonical repair.  It does not infer
role fit from ISCO membership or from a title alone: each role carries explicit
domain and area routes with task evidence and source references.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROLE_FILE = ROOT / "role_library_v3_cleaned.json"
REPORT = ROOT / "_audit" / "QUANTITATIVE_FINANCE_CORE_ROLE_REPAIR_2026_10_07.json"

ONET_QUANT = "https://www.onetonline.org/link/summary/13-2099.01"
ONET_RISK = "https://www.onetonline.org/link/summary/13-2054.00"
JANE_STREET_TRADER = "https://www.janestreet.com/join-jane-street/get-to-know-us/nitya/"
CITADEL_RESEARCH = "https://www.citadel.com/careers/details/global-quantitative-strategies-quantitative-researcher/"
CITI_DEVELOPER = "https://jobs.citi.com/job/new-york/quantitative-analyst-c13-new-york/287/97801991616"


def route(area_id: str, route_type: str, basis: str, refs: list[str]) -> dict:
    return {
        "area_id": area_id,
        "status": "supported",
        "route_type": route_type,
        "evidence": [
            {
                "basis": basis,
                "source_refs": refs,
            }
        ],
    }


def role(
    number: int,
    name: str,
    aliases: str,
    description: str,
    essential: list[str],
    optional: list[str],
    group: int,
    primary_area: str,
    routes: list[dict],
    refs: list[str],
) -> dict:
    basis = (
        "Explicit quantitative-finance role evidence: the cited occupational or "
        "employer source describes quantitative modelling, financial-market or "
        "trading work matching D011 and the listed area routes."
    )
    return {
        "domain_id": "D011",
        "domain_name": "Quantitative Finance",
        "role_number": number,
        "role_name": name,
        "also_known_as": aliases,
        "source": "source_backed_quantitative_finance_repair",
        "onet_score": "",
        "ilo_informal_employment_pct": "",
        "isco_group": group,
        "esco_code": "",
        "description": description,
        "essential_skills": essential,
        "optional_skills": optional,
        "domain_fit_review_status": "supported",
        "domain_fit_review_basis": basis,
        "domain_fit_review_source_refs": refs,
        "role_domain_lane_review_date": "2026-10-07",
        "role_domain_lane_review_status": "reviewed_supported",
        "role_domain_lane_review_sources": [
            "_audit\\apply_quantitative_finance_core_roles_2026_10_07.py"
        ],
        "specialization_fit_review_status": "supported",
        "specialization_fit_domain_gate": "parent_domain_fit_supported",
        "specialization_fit_status": "supported",
        "specialization_fit_area_key": primary_area,
        "specialization_fit_candidate": primary_area.split(":", 1)[1],
        "specialization_fit_review_basis": basis,
        "specialization_fit_review_source_refs": refs,
        "specialization_fit_review_date": "2026-10-07",
        "role_area_routes": routes,
    }


def main() -> None:
    rows = json.loads(ROLE_FILE.read_text(encoding="utf-8"))
    if not isinstance(rows, list):
        raise TypeError("role_library_v3_cleaned.json must contain a list")

    additions = [
        role(
            37,
            "quantitative researcher",
            "quant researcher | quantitative finance researcher | systematic investment researcher | alpha researcher",
            "Develop and test mathematical and statistical models, signals and investment strategies for financial markets.",
            ["probability and statistics", "time-series analysis", "financial modelling", "Python", "C++", "backtesting", "research design"],
            ["machine learning", "portfolio construction", "optimization", "alternative data", "R"],
            2120,
            "D011:systematic-investment-and-quantitative-trading",
            [
                route("D011:systematic-investment-and-quantitative-trading", "primary", "Build predictive models, trading approaches and signals, then back-test them for systematic investment.", [CITADEL_RESEARCH, ONET_QUANT]),
                route("D011:quantitative-pricing-and-financial-engineering", "secondary", "Develop mathematical models and translate algorithms into code for valuation and investment problems.", [CITADEL_RESEARCH, ONET_QUANT]),
            ],
            [CITADEL_RESEARCH, ONET_QUANT],
        ),
        role(
            38,
            "quantitative developer",
            "quant developer | quantitative finance developer | quantitative finance engineer | financial engineering developer | quant engineer",
            "Build, test and maintain production software and quantitative libraries for pricing, risk, analytics and trading workflows.",
            ["C++", "Python", "software engineering", "numerical methods", "financial modelling", "testing", "version control"],
            ["Monte Carlo methods", "derivatives pricing", "market data", "distributed computing", "CI/CD"],
            2512,
            "D011:quantitative-pricing-and-financial-engineering",
            [
                route("D011:quantitative-pricing-and-financial-engineering", "primary", "Build high-performance pricing, risk and analytics libraries and translate quantitative models into production software.", [CITI_DEVELOPER, ONET_QUANT]),
                route("D011:quantitative-financial-risk-modeling", "secondary", "Develop and deliver derivatives-risk and exposure models and supporting analytics infrastructure.", [CITI_DEVELOPER]),
            ],
            [CITI_DEVELOPER, ONET_QUANT],
        ),
        role(
            39,
            "quantitative trader",
            "quant trader | quantitative finance trader | algorithmic trader | systematic trader",
            "Use quantitative models, market data and execution systems to implement rules-based trading strategies and manage trading risk.",
            ["financial markets", "probability and statistics", "market microstructure", "algorithmic trading", "risk management", "Python"],
            ["C++", "portfolio construction", "backtesting", "derivatives", "execution systems"],
            3311,
            "D011:systematic-investment-and-quantitative-trading",
            [
                route("D011:systematic-investment-and-quantitative-trading", "primary", "The source identifies quantitative traders executing quantitative trading strategies and links the role to trading and research workflows.", [JANE_STREET_TRADER, ONET_QUANT]),
            ],
            [JANE_STREET_TRADER, ONET_QUANT],
        ),
        role(
            40,
            "quantitative analyst",
            "quant analyst | financial quantitative analyst | quantitative finance analyst | quantitative risk analyst",
            "Apply mathematical and statistical techniques to financial pricing, investment, risk and portfolio problems.",
            ["mathematics", "statistics", "financial markets", "financial modelling", "risk analysis", "Python"],
            ["derivatives pricing", "portfolio optimization", "econometrics", "Monte Carlo methods", "SQL"],
            2413,
            "D011:quantitative-pricing-and-financial-engineering",
            [
                route("D011:quantitative-pricing-and-financial-engineering", "primary", "O*NET defines financial quantitative analysts as developing quantitative techniques and models for pricing, valuation and investment.", [ONET_QUANT]),
                route("D011:quantitative-financial-risk-modeling", "secondary", "The same occupational profile explicitly covers risk management, asset optimization and relative-value analysis.", [ONET_QUANT]),
                route("D011:systematic-investment-and-quantitative-trading", "secondary", "The profile explicitly covers securities trading and support for traders and trading-system performance.", [ONET_QUANT]),
            ],
            [ONET_QUANT],
        ),
        role(
            41,
            "financial risk specialist",
            "financial risk analyst | risk analyst | market risk analyst | credit risk analyst | risk manager",
            "Measure and model credit and market exposure, test scenarios and recommend controls for financial risk.",
            ["market risk", "credit risk", "risk modelling", "stress testing", "statistics", "financial analysis"],
            ["Python", "SQL", "econometrics", "value at risk", "portfolio risk"],
            2413,
            "D011:quantitative-financial-risk-modeling",
            [
                route("D011:quantitative-financial-risk-modeling", "primary", "O*NET defines this occupation around measuring credit and market exposure, statistical risk analysis, scenario analysis and risk-management models.", [ONET_RISK]),
                route("D011:systematic-investment-and-quantitative-trading", "secondary", "The occupational tasks include communicating risks of trading strategies and positions and tracking market risk for traded issues.", [ONET_RISK]),
            ],
            [ONET_RISK],
        ),
    ]

    existing = {(str(r.get("domain_id")), str(r.get("role_name", "")).casefold()) for r in rows}
    applied = []
    skipped = []
    for item in additions:
        key = (item["domain_id"], item["role_name"].casefold())
        if key in existing:
            skipped.append(item["role_name"])
            continue
        rows.append(item)
        existing.add(key)
        applied.append(item["role_name"])

    ROLE_FILE.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "status": "applied",
        "date": "2026-10-07",
        "canonical_file": str(ROLE_FILE),
        "applied_role_names": applied,
        "skipped_existing_role_names": skipped,
        "role_count_after": len(rows),
        "scope": "D011 only",
        "fit_policy": "Explicit domain and area task evidence; multiple area routes allowed; no ISCO-only inference.",
        "sources": [ONET_QUANT, ONET_RISK, JANE_STREET_TRADER, CITADEL_RESEARCH, CITI_DEVELOPER],
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
