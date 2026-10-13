"""Repair the misaligned Actuarial Science CCMAS course records from NUC.

The administration-management package had actuarial ACS codes paired with
unrelated titles and synthetic summaries/outcomes. This guarded, surgical
rewrite changes only the 25 ACS-coded course objects in that programme. The
before snapshot must match, and every modified course receives its printed NUC
locator.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/ccmas/administration_management.json"
SNAPSHOT = ROOT / "data/career-mapping/_audit/actuarial_science_source_reconciliation_2026-09-25/actuarial_science_before.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
ACCESS_DATE = "2026-09-26"

# Faithful short summaries and outcome paraphrases from the NUC Actuarial
# Science course specifications. Page references are printed CCMAS pages.
CORRECTIONS: dict[str, dict[str, object]] = {
    "ACS 101": {"title": "Introduction to Actuarial Science", "pages": "58", "summary": "Actuarial work and professional practice; actuarial notation; how actuarial science relates to insurance; time value of money, compound interest and discounting; present and accumulated values; life tables; annuities.", "outcomes": ["Explain actuarial science, actuarial work and its relationship to insurance.", "Interpret common actuarial symbols and identify actuary career paths.", "Solve basic compound-interest and payment-value problems.", "Explain life-table features and annuity types."]},
    "ACS 102": {"title": "Basic Mathematics for Actuarial Science", "pages": "58–59", "summary": "Algebra, real and complex numbers, indices and logarithms, surds, inequalities, partial fractions, quadratic equations, binomial theorem, complex-number operations, mathematical induction, progressions and series, and trigonometric functions.", "outcomes": ["Distinguish real and complex numbers and work with complex-number representations.", "Solve algebraic, quadratic and partial-fraction problems.", "Apply logarithms, mathematical induction, progressions and series.", "Solve basic trigonometric problems using identities."]},
    "ACS 104": {"title": "Elements of Actuarial Statistics", "pages": "59–60", "summary": "Probability axioms and rules, conditional probability and Bayes’ theorem, random variables and distributions, moments, descriptive statistics, exploratory data analysis, statistical models and parameter estimation, regression and correlation.", "outcomes": ["Apply elementary probability and statistics, including conditional probability and Bayes’ theorem.", "Describe random variables and probability distributions and calculate moments.", "Use descriptive and exploratory statistics to summarize data.", "Apply basic statistical methods and interpret results."]},
    "ACS 201": {"title": "Differential Calculus for Actuarial Science", "pages": "61–62", "summary": "Relations and functions; limits and continuity; derivatives and differentiation rules; implicit and higher derivatives; curve behaviour, extrema and inflection; Taylor and Maclaurin series.", "outcomes": ["Work with relations, functions, limits and derivatives.", "Differentiate functions and explain derivatives as slopes.", "Assess continuity, differentiability and limits, including L’Hospital’s rule.", "Use derivatives to analyse extrema, critical points, inflection and series approximations."]},
    "ACS 202": {"title": "Integral Calculus for Actuarial Science", "pages": "62–63", "summary": "Definite and indefinite integrals; antiderivatives; integration rules and substitution; integration by parts; rational functions, partial fractions and reduction formulae; multiple integrals and applications to areas, volumes and related quantities.", "outcomes": ["Construct antiderivatives and apply the Fundamental Theorem of Calculus.", "Evaluate definite and indefinite integrals using standard techniques.", "Apply substitution and integration by parts.", "Use integration to solve area, volume and related applied problems."]},
    "ACS 203": {"title": "Mathematical Statistics for Actuarial Science", "pages": "63", "summary": "Random variables and distributions; moments, joint and conditional distributions; covariance and correlation; moment-generating functions; estimation, confidence intervals, hypothesis testing, ANOVA and linear models.", "outcomes": ["Explain joint and conditional distributions and moment-generating functions.", "Compute expectations, variances and conditional expectations.", "Construct confidence intervals and test hypotheses.", "Perform one-way ANOVA and interpret results."]},
    "ACS 204": {"title": "Probability Theory for Actuarial Science", "pages": "63–64", "summary": "Probability axioms; discrete and continuous random variables; distribution and density functions; expectation, variance and moments; moment-generating functions; standard discrete distributions and actuarial applications.", "outcomes": ["Explain probability laws, random variables and basic distributions.", "Solve discrete and continuous probability problems, including conditional probability.", "Calculate moments and use moment-generating functions.", "Apply probability density and cumulative distribution functions in actuarial work."]},
    "ACS 205": {"title": "Introductory Actuarial Finance", "pages": "64", "summary": "Actuaries and financial markets; actuarial liabilities and assets; financial and insurance risks; securities, bonds, interest rates and derivatives; cash-flow analysis, arbitrage and practical hedging strategies.", "outcomes": ["Explain links between insurance and financial markets and classify actuarial liabilities.", "Distinguish diversifiable from non-diversifiable risks.", "Compare financial-risk management and hedging approaches.", "Analyse cash flows and explain arbitrage opportunities."]},
    "ACS 206": {"title": "Mathematics of Demography", "pages": "64–65", "summary": "Demographic data sources and quality; census data; mortality and fertility measures; rates, ratios and indices; life-table construction; stationary and stable populations; population projection and change.", "outcomes": ["Identify demographic data sources and calculate demographic rates, ratios and indices.", "Explain demographic principles used in actuarial work.", "Compare actuarial and demographic mortality tables.", "Explain life tables, vital statistics and population-planning uses."]},
    "ACS 207": {"title": "Economics of Insurance", "pages": "65", "summary": "Economic foundations of insurance; expected utility, risk aversion and consumer behaviour; insurance demand and premium choices; information problems, market imperfections and competitive insurance markets.", "outcomes": ["Explain economic decision-making in insurance pricing.", "Apply utility and risk-aversion concepts to premium decisions under uncertainty.", "Explain information asymmetry and insurance-market relationships.", "Distinguish insurance-market conditions and common market imperfections."]},
    "ACS 208": {"title": "Risk Management", "pages": "65–66", "summary": "Risk concepts and classes; hazards and human behaviour; enterprise and corporate risk management; identification, assessment, measurement and treatment; loss frequency/severity, pooling, diversification and insurance.", "outcomes": ["Explain risk management and classify risks.", "Describe risk-management processes and treatment techniques.", "Use statistical tools to analyse business and insurance risks.", "Apply loss distributions, pooling and diversification to decisions."]},
    "ACS 301": {"title": "Differential Equations for Actuarial Science", "pages": "67", "summary": "Ordinary differential equations; order and formulation; first- and higher-order equations; homogeneous and exact equations; integrating factors and linear equations with constant coefficients.", "outcomes": ["Solve first- and second-order linear and separable differential equations.", "Apply substitution and power-series methods to actuarial problems.", "Use integrating factors and explain their actuarial applications.", "Apply direction fields and Euler’s method."]},
    "ACS 302": {"title": "Life Contingencies", "pages": "67", "summary": "Mortality measurement; life annuities and insurance; net premiums and reserves; expenses; policy values and mortality profits; contingent and reversionary benefits.", "outcomes": ["Evaluate life-assurance and life-annuity pricing.", "Calculate survival/death probabilities, premiums, reserves and policy values.", "Distinguish gross and net premiums.", "Analyse increasing insurance, annuities and contingent benefits."]},
    "ACS 304": {"title": "Financial Mathematics for Actuaries", "pages": "67–68", "summary": "Time value of money; simple and compound interest and discount; cash-flow models; nominal/effective rates; annuities and perpetuities; loan valuation; amortization and sinking funds.", "outcomes": ["Model cash flows using interest and discount rates.", "Distinguish nominal and effective rates.", "Value annuities and perpetuities and calculate outstanding loans.", "Use interpolation, amortization and sinking-fund methods."]},
    "ACS 305": {"title": "Actuarial Modeling", "pages": "68", "summary": "Insurance and actuarial models; Markov chains and processes; survival/lifetime models; transition intensities; mortality and loss distributions; ruin and risk models; delay triangles; Monte Carlo simulation.", "outcomes": ["Explain principles and assumptions of insurance models.", "Describe survival, lifetime, binomial and state-transfer models.", "Estimate transition intensities and loss-distribution quantities.", "Explain and apply Monte Carlo simulation in actuarial work."]},
    "ACS 306": {"title": "Life and Health Insurance", "pages": "68", "summary": "Life-insurance contracts and provisions; underwriting, premiums and reserves; group, industrial and health cover; accident and sickness insurance; policy exclusions and national health-insurance schemes.", "outcomes": ["Apply actuarial principles to life and health insurance.", "Identify life and health insurance products and policy provisions.", "Explain underwriting, premiums and reserves.", "Calculate reserves and health-insurance contributions."]},
    "ACS 307": {"title": "Numerical Analysis", "pages": "69", "summary": "Numerical algorithms, precision and rounding errors; finite differences; interpolation for equal and unequal intervals; Lagrange divided differences; numerical methods for actuarial calculations.", "outcomes": ["Assess numerical precision and rounding error.", "Use finite-difference notation and interpolation methods.", "Solve polynomial/interpolation problems with equal and unequal intervals.", "Apply numerical methods to life-contingency and actuarial problems."]},
    "ACS 308": {"title": "Ratemaking and Insurance Pricing Models", "pages": "69–70", "summary": "Insurance exposure, premiums, claims and losses; the fundamental insurance equation; ratemaking data and exposure bases; premium aggregation and adjustment; expenses and underwriting profit.", "outcomes": ["Define insurance and ratemaking terms.", "Estimate written, earned and unearned premiums.", "Distinguish aggregated and segmented data and select relevant inputs.", "Adjust premiums and explain assumptions in statistical pricing models."]},
    "ACS 310": {"source_code": "ACS 303", "title": "Survival Models", "pages": "70", "summary": "Survival data and exposure; mortality/life tables; survival and hazard functions; future lifetime distributions; Kaplan–Meier estimation; loss distributions, parameter estimation and simulation.", "outcomes": ["Prepare and interpret mortality tables and survival measures.", "Relate force of mortality to force of interest in underwriting contexts.", "Estimate lifetime distributions, including Kaplan–Meier methods.", "Analyse actuarial models and modify loss distributions."]},
    "ACS 311": {"source_code": "ACS 309", "title": "Entrepreneurship in Actuarial Profession", "pages": "70–71", "summary": "Actuarial entrepreneurship and Nigerian market conditions; opportunity discovery, risk-taking and actuarial control cycles; innovation and emerging technologies; venture formation, financing and business planning.", "outcomes": ["Use actuarial models to assess venture feasibility and risk.", "Analyse profitability drivers and business sensitivities.", "Apply actuarial methods to capital requirements and solvency.", "Plan an actuarial consulting venture."]},
    "ACS 401": {"title": "Further Life Contingencies", "pages": "71", "summary": "Deterministic and stochastic life contingencies; life annuities and insurance; survival/death probabilities; gross and net premiums; reserves, policy values, mortality profits and contingent benefits.", "outcomes": ["Compare deterministic and stochastic life-contingency methods.", "Value annuities and life-insurance benefits.", "Calculate survival/death probabilities, premiums, reserves and policy values.", "Analyse increasing, with-profit, contingent and reversionary benefits."]},
    "ACS 402": {"title": "Pension Funds and Social Insurance", "pages": "71–72", "summary": "Pension scheme and benefit design; eligibility; defined-benefit and defined-contribution plans; funding and risks; annuity rates and retirement income; contribution rates, transfers, administration and Nigerian pension reform.", "outcomes": ["Compare pension benefit designs and eligibility criteria.", "Explain defined-benefit and defined-contribution arrangements and risks.", "Calculate annuity rates and evaluate funding adequacy.", "Explain Nigerian pension reform requirements."]},
    "ACS 403": {"title": "Mortality Analysis", "pages": "72", "summary": "Vital-statistics mortality measures; crude death rates and standard mortality ratios; direct/indirect standardization; morbidity; mortality and decrement tables; mortality-experience comparisons.", "outcomes": ["Calculate crude death rates and standard mortality ratios.", "Distinguish mortality from morbidity.", "Construct decrement and mortality tables.", "Compare standardized mortality experience and model mortality trends."]},
    "ACS 404": {"title": "Actuarial Valuation", "pages": "72–73", "summary": "Valuation objectives, assumptions and methods; pension funding methods; accrued benefits and liabilities; pension obligations and asset valuation; actuarial gains/losses, surpluses/deficits and professional standards.", "outcomes": ["Identify actuarial pension-valuation and funding methods.", "Calculate past and future pension benefits and gratuities.", "Model funding gaps and interpret actuarial gains or losses.", "Assess surpluses/deficits and recognize actuarial practice standards."]},
    "ACS 405": {"title": "Advanced Risk Management", "pages": "73", "summary": "Financial and organizational risk; identification, measurement, mitigation and governance; market, credit, liquidity, operational, legal, compliance and reputational risk; value-at-risk principles.", "outcomes": ["Classify financial and related organizational risks.", "Apply risk identification, measurement and mitigation approaches.", "Explain market, credit, liquidity, operational, legal/compliance and reputational risks.", "Explain value-at-risk methodology and reputational-risk management."]},
}


def course_spans(text: str) -> tuple[dict[str, tuple[int, int]], tuple[int, int]]:
    decoder = json.JSONDecoder()
    programmes_key = re.search(r'"programmes"\s*:\s*\[', text)
    if not programmes_key:
        raise ValueError("Top-level programmes array not found")
    pos = programmes_key.end()
    programme_span = None
    while pos < len(text):
        while pos < len(text) and text[pos] in " \t\r\n,":
            pos += 1
        if pos >= len(text) or text[pos] == "]":
            break
        obj, end = decoder.raw_decode(text, pos)
        if isinstance(obj, dict) and obj.get("code") == "ACS":
            programme_span = (pos, end)
            break
        pos = end
    if programme_span is None:
        raise ValueError("Actuarial Science programme not found")
    start, end = programme_span
    programme_text = text[start:end]
    courses_key = re.search(r'"courses"\s*:\s*\[', programme_text)
    if not courses_key:
        raise ValueError("ACS course array not found")
    pos = start + courses_key.end()
    spans = {}
    while pos < end:
        while pos < end and text[pos] in " \t\r\n,":
            pos += 1
        if pos >= end or text[pos] == "]":
            break
        obj, obj_end = decoder.raw_decode(text, pos)
        if isinstance(obj, dict):
            target = next((key for key, value in CORRECTIONS.items() if value.get("source_code", key) == obj.get("code")), None)
            if target:
                if target in spans:
                    raise ValueError(f"Duplicate ACS course {target}")
                spans[target] = (pos, obj_end)
        pos = obj_end
    return spans, programme_span


def replace_field(raw: str, field: str, value: object) -> str:
    match = re.search(rf'("{re.escape(field)}"\s*:\s*)', raw)
    if not match:
        raise ValueError(f"Missing {field} field")
    value_start = match.end()
    decoder = json.JSONDecoder()
    _, value_end = decoder.raw_decode(raw, value_start)
    return raw[:value_start] + json.dumps(value, ensure_ascii=False) + raw[value_end:]


def correct_course(raw: str, code: str, data: dict[str, object]) -> str:
    raw = replace_field(raw, "code", code)
    raw = replace_field(raw, "title", data["title"])
    raw = replace_field(raw, "content_summary", data["summary"])
    raw = replace_field(raw, "skills_learned", data["outcomes"])
    for field, value in {
        "source_url": SOURCE_URL,
        "source_locator": f"NUC Administration and Management CCMAS, B.Sc. Actuarial Science, course contents and learning outcomes, printed p. {data['pages']}.",
        "source_accessed_on": ACCESS_DATE,
    }.items():
        if re.search(rf'"{field}"\s*:', raw):
            raw = replace_field(raw, field, value)
        else:
            indent = re.search(r'\n([ \t]+)"title"\s*:', raw)
            if not indent:
                raise ValueError("Could not determine course field indentation")
            field_indent = indent.group(1)
            title_end = re.search(r'"title"\s*:\s*', raw).end()
            decoder = json.JSONDecoder()
            _, value_end = decoder.raw_decode(raw, title_end)
            insertion = ",\n" + field_indent + json.dumps(field, ensure_ascii=False) + ": " + json.dumps(value, ensure_ascii=False)
            raw = raw[:value_end] + insertion + raw[value_end:]
    return raw


def main() -> None:
    before = SNAPSHOT.read_bytes()
    original = SOURCE.read_bytes()
    parsed_now = json.loads(original)
    actuarial = next(p for p in parsed_now["programmes"] if p.get("code") == "ACS")
    courses_now = {c.get("code"): c for c in actuarial.get("courses", [])}
    if all(
        courses_now.get(code, {}).get("title") == data["title"]
        and courses_now.get(code, {}).get("content_summary") == data["summary"]
        and courses_now.get(code, {}).get("skills_learned") == data["outcomes"]
        and courses_now.get(code, {}).get("source_url") == SOURCE_URL
        for code, data in CORRECTIONS.items()
    ):
        print("Actuarial Science source correction already applied.")
        return
    snapshot_programme = json.loads(before)
    if isinstance(snapshot_programme, dict) and "programmes" in snapshot_programme:
        snapshot_programme = next(p for p in snapshot_programme["programmes"] if p.get("code") == "ACS")
    if actuarial != snapshot_programme:
        raise RuntimeError("ACS programme differs from preserved snapshot; refusing to patch")
    text = original.decode("utf-8")
    eol = "\r\n" if "\r\n" in text else "\n"
    spans, old_programme_span = course_spans(text)
    if set(spans) != set(CORRECTIONS):
        raise RuntimeError(f"ACS course inventory mismatch: missing={sorted(set(CORRECTIONS)-set(spans))}, extra={sorted(set(spans)-set(CORRECTIONS))}")
    updated = text
    for code, (start, end) in sorted(spans.items(), key=lambda pair: pair[1][0], reverse=True):
        updated = updated[:start] + correct_course(updated[start:end], code, CORRECTIONS[code]) + updated[end:]
    json.loads(updated)
    new_spans, new_programme_span = course_spans(updated)
    if text[:old_programme_span[0]] != updated[:new_programme_span[0]] or text[old_programme_span[1]:] != updated[new_programme_span[1]:]:
        raise RuntimeError("Patch unexpectedly altered text outside the Actuarial Science programme")
    SOURCE.write_bytes(updated.encode("utf-8"))
    print(f"Corrected {len(spans)} ACS courses from the official NUC CCMAS source ({SOURCE_URL}; accessed {ACCESS_DATE}).")


if __name__ == "__main__":
    main()
