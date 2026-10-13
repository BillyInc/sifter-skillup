"""Repair only ACC course titles, summaries, and stated outcomes from NUC CCMAS.

The script preserves all bytes outside the ACC programme's ACC-coded course
objects. It is intentionally guarded by the checked-in byte-for-byte snapshot.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/ccmas/administration_management.json"
SNAPSHOT = ROOT / "data/career-mapping/_audit/acc_ccmas_source_before_2026-09-25/administration_management.json"
BEFORE_SHA256 = "ABFA29093FEEAB6889F4BB3B622AECC760510F82741F711FD4C9A86722BC2C3B"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
ACCESS_DATE = "2026-09-25"

# Student-readable faithful summaries of NUC course contents, plus faithful
# outcome paraphrases. Locators are printed CCMAS pages, not PDF viewer pages.
CORRECTIONS = {
    "ACC 101": {
        "title": "Introduction to Financial Accounting I",
        "pages": "35–36",
        "content_summary": "Nature, scope, objectives and branches of accounting; bookkeeping, source documents and books of original entry; the accounting cycle, double-entry and accounting equation; trial balance, bank reconciliation, and classification of revenue and expenditure.",
        "learning_outcomes": [
            "Describe the nature and scope of accounting.",
            "Distinguish bookkeeping from accounting.",
            "Explain the objectives of financial accounting.",
            "Identify branches of accounting and manual/electronic recording methods.",
            "Prepare basic records from books of original entry through trial balance.",
            "Correct basic posting errors.",
            "Prepare bank reconciliation statements.",
        ],
    },
    "ACC 102": {
        "title": "Introduction to Financial Accounting II",
        "pages": "36–37",
        "content_summary": "Accounting as an organisational information system; the financial-reporting conceptual framework, users and useful-information qualities; accounting concepts and conventions; error correction, suspense and control accounts; not-for-profit accounts, incomplete records and sole-trader statements; accounting standards bodies and standards.",
        "learning_outcomes": [
            "Explain how accounting connects with other information systems.",
            "Describe the conceptual framework for financial reporting.",
            "Identify users and uses of financial statements and reports.",
            "Relate accounting concepts and conventions to preparing financial reports.",
            "Identify accounting errors and explain how to correct them.",
            "Explain suspense accounts and their uses.",
            "Prepare control accounts.",
            "Prepare accounts for not-for-profit organisations.",
            "Distinguish single-entry accounting from incomplete records.",
            "Prepare an adjusted trading and profit-or-loss account for a sole trader.",
            "Describe the roles of FRCN and IASB as accounting-standard bodies.",
        ],
    },
    "ACC 201": {
        "title": "Financial Accounting I",
        "pages": "37–38",
        "content_summary": "The IASB financial-reporting framework; introductory IFRS 15 and IAS 1; inventory under IAS 2; accounting policies under IAS 8; property, plant and equipment under IAS 16; government grants under IAS 20; and borrowing costs under IAS 23.",
        "learning_outcomes": [
            "Explain the framework for preparing and presenting financial statements.",
            "Prepare simple financial statements for a limited-liability company.",
            "Account for borrowing costs.",
            "Explain accounting for government grants.",
            "Define relevant IFRS 15 revenue terms.",
            "Account for inventory.",
            "Explain accounting policies.",
            "Define relevant IFRS 15 revenue terms.",
        ],
    },
    "ACC 202": {
        "title": "Financial Accounting II",
        "pages": "38",
        "content_summary": "Financial-reporting conceptual framework and SMEGA/Level 3 guidance; partnership forms, deeds, capital/current accounts and profit appropriation; IFRS 11 joint arrangements; and accounting for the substance of goods-on-sale-or-return transactions.",
        "learning_outcomes": [
            "Explain the conceptual framework for financial reporting.",
            "Prepare a simple partnership account.",
            "Explain joint arrangements under IFRS 11.",
            "Account for goods on sale or return.",
            "Describe revenue and grants under IFRS provisions.",
            "Develop simple accounting policies.",
            "Prepare final accounts.",
        ],
    },
    "ACC 203": {
        "title": "Corporate Governance and Accounting Ethics",
        "pages": "38–39",
        "content_summary": "Corporate-governance theory, practice and codes (including FRCN and OECD); company governance structures and shareholder rights; board and committee responsibilities; internal control and audit responsibilities; sustainability governance; and professional-accountant ethics, including IFAC codes.",
        "learning_outcomes": [
            "Explain the theoretical framework for corporate governance.",
            "Describe corporate-governance codes.",
            "Explain a company's governance structure.",
            "Describe shareholders' roles in corporate governance.",
            "Explain the roles of boards and board committees.",
            "Discuss internal control and audit procedures.",
            "Explain governance's role in sustainability.",
            "Identify ethical codes from FRCN, OECD and other local/international bodies.",
            "Explain applicable professional-accountant ethical codes, including IFAC's.",
        ],
    },
    "ACC 204": {
        "title": "Cost Accounting",
        "pages": "39–40",
        "content_summary": "Cost-accounting systems and department organisation; cost classification, estimation and behaviour; materials, labour and overhead; job, batch, contract and process costing (including gains/losses); integrated/interlocking accounts; marginal and standard costing, break-even/CVP and variance analysis; functional and cash budgets.",
        "learning_outcomes": [
            "Explain the nature and objectives of a cost-accounting system.",
            "Describe the cost-accounting department and its links to other departments.",
            "Explain cost elements, classification, estimation and behaviour.",
            "Account for materials, labour and overhead.",
            "Explain specific-order and process-costing methods.",
            "Explain the treatment of process gains and losses.",
            "Prepare integrated and interlocking accounts.",
            "Discuss marginal and standard costing with basic variance analysis.",
            "Explain functional and cash budgets.",
        ],
    },
    "ACC 206": {
        "title": "Accounting Laboratory",
        "pages": "40",
        "content_summary": "Practical use of spreadsheets and cloud accounting software; standard ERP charts of accounts and accounting packages (including Sage, Peachtree, QuickBooks, Oracle and SAP); cash-management tools; audit software and data analysis; database and presentation software; and office-productivity tools.",
        "learning_outcomes": [
            "Use spreadsheets for basic accounting and data analysis.",
            "Demonstrate use of cloud-based accounting software.",
            "Apply cash-management tools to accounting problems.",
            "Use audit software in a basic audit exercise.",
            "Describe presentation software for reporting.",
            "Use database software to manage accounting and business data.",
            "Use office-productivity tools for office services.",
        ],
    },
    "ACC 301": {
        "title": "Financial Reporting I",
        "pages": "42",
        "content_summary": "Advanced partnership changes and conversions; IFRS 11 joint arrangements; company formation, shares and debentures; general-purpose statements under IAS 1 and IAS 7 and related standards; income taxes, provisions/contingencies, fair value, and related-party transactions.",
        "learning_outcomes": [
            "Prepare advanced partnership accounts for admission, retirement, dissolution, interest changes, goodwill, conversion and amalgamation.",
            "Discuss joint arrangements under IFRS 11.",
            "Account for company formation and the issue/redemption of shares and debentures.",
            "Prepare and present general-purpose statements under IAS 1 and IAS 7, applying relevant related standards.",
            "Identify components of income taxes.",
            "Distinguish provisions, contingent liabilities and contingent assets.",
            "Explain related-party transactions in accounting.",
        ],
    },
    "ACC 302": {
        "title": "Financial Reporting II",
        "pages": "42–43",
        "content_summary": "Financial-statement analysis and ratio interpretation/reporting; the Financial Reporting Council of Nigeria Act; and applications of IAS 10, IAS 33, IAS 16, IAS 40, IAS 12, IAS 37, IFRS 13 and IAS 24.",
        "learning_outcomes": [
            "Analyse and interpret general-purpose financial statements using ratios.",
            "Explain earnings per share as a ratio-analysis measure under IAS 33.",
            "Report on computed ratios, draw conclusions and make recommendations.",
            "Discuss limitations of ratio analysis.",
            "Discuss the Financial Reporting Council of Nigeria Act No. 6 of 2011.",
            "Account for property, plant and equipment under IAS 16 and IAS 40.",
            "Identify basic tax accounting under IAS 12.",
            "Identify basic accounting for provisions and contingencies under IAS 37.",
            "Explain basic fair-value accounting under IFRS 13.",
            "Explain basic related-party accounting under IAS 24.",
        ],
    },
    "ACC 303": {
        "title": "Management Accounting",
        "pages": "43",
        "content_summary": "Strategic management accounting and performance management; forecasting, master/subsidiary, cash and flexible budgets; behavioural budgeting; standard costing and variances; cost reduction/control; spreadsheets; relevant-cost and CVP decisions; pricing, uncertainty, learning curves, divisional performance and transfer pricing; ethics and current techniques such as ABC, JIT, Kaizen, target/lifecycle costing and balanced scorecard.",
        "learning_outcomes": [
            "Apply budgeting and standard-costing techniques to business planning and control.",
            "Discuss behavioural aspects of budgeting and budgetary control.",
            "Explain strategic performance management for evaluating and improving organisational performance.",
            "Apply cost-reduction and cost-control techniques.",
            "Discuss spreadsheet use in performance management.",
            "Explain underlying performance-management concepts.",
            "Prepare relevant-cost information for decisions.",
            "Evaluate divisional performance and discuss transfer-pricing methods.",
            "Discuss pricing strategies and calculate prices using them.",
            "Discuss ethical principles in performance management.",
            "Discuss and evaluate current performance-management issues.",
        ],
    },
    "ACC 305": {
        "title": "Taxation I",
        "pages": "43",
        "content_summary": "Tax principles and Nigeria's income-tax administration/policy; tax authorities and their powers; national tax policy, TIN and VAIDS; tax returns, assessment, collection and appeals; and taxation of employment, investment, trusts/estates, sole proprietors and partnerships.",
        "learning_outcomes": [
            "Explain the administrative structure of Nigeria's tax system.",
            "Apply tax rules to calculate liabilities for individuals and partnerships.",
            "Discuss tax assessments, appeals, collection and return-filing procedures.",
        ],
    },
    "ACC 306": {
        "title": "Taxation II",
        "pages": "44",
        "content_summary": "Company-income-tax scope and computations, commencement/change of accounting date/cessation, allowable expenses, taxable income, loss relief and capital allowances; small, pioneer and specialised businesses; transaction taxes; transfer-pricing rules; tax audit and investigation.",
        "learning_outcomes": [
            "Discuss the bases and computation of companies' income tax.",
            "Calculate taxes for small, medium and large companies, including pioneer companies.",
            "Calculate taxes for specialised businesses, including digital-economy businesses.",
            "File returns for different tax transactions.",
            "Discuss tax-audit and investigation principles.",
            "Explain transfer-pricing principles.",
            "Identify tax-allowable and disallowable expenses.",
            "Illustrate stamp-duty use in business transactions.",
        ],
    },
    "ACC 307": {
        "title": "Auditing and Assurance I",
        "pages": "44–45",
        "content_summary": "External audit and assurance objectives, types, independence, materiality, reasonable assurance and expectation gaps; Nigerian legal/regulatory frameworks and auditing standards; engagement, planning, risk, controls, evidence, computer-assisted techniques and audit reporting.",
        "learning_outcomes": [
            "Discuss the objectives and scope of external audit and assurance.",
            "Describe the legal and regulatory framework for audit and assurance.",
            "Discuss the steps in an audit process.",
            "Communicate audit findings in a report after an engagement.",
            "Apply appropriate auditing standards.",
            "Distinguish errors from fraud.",
            "Explain public expectations of audits and the expectation gap.",
            "Identify the functions of the Financial Reporting Council of Nigeria.",
        ],
    },
    "ACC 308": {
        "title": "Public Sector Accounting & Reporting",
        "pages": "45–46",
        "content_summary": "Public-sector accounting principles and legal frameworks; government planning, budgeting and procurement; MTEF, MTSS and PPBS; government accounting records and controls; accountability bodies; cash/accrual financial statements and IPSAS; public-sector audit, performance analysis and ethics.",
        "learning_outcomes": [
            "Explain public-sector accounting concepts and principles.",
            "State its constitutional, legislative and regulatory frameworks.",
            "Discuss public-sector planning, budgeting and responsibilities.",
            "Discuss MTEF, MTSS and PPBS.",
            "Identify public-sector reporting and audit frameworks.",
            "Discuss accountability and probity bodies.",
            "Explain accrual-basis public-sector statements and their preparation.",
            "Discuss cash-basis public-sector statements and their preparation.",
            "Explain differences between cash and accrual bases.",
            "Identify and apply international public-sector accounting standards.",
            "Discuss public-sector financial, internal-control, value-for-money and performance audits.",
            "Distinguish private- and public-sector reporting, including IFRS/IPSAS.",
            "Explain public-procurement procedures under the Public Procurement Act 2007.",
            "Discuss ethical issues in public-sector accounting.",
        ],
    },
    "ACC 311": {
        "title": "Entrepreneurship in Accounting",
        "pages": "46",
        "content_summary": "Entrepreneurship principles, vision and mission; accounting, audit, tax, forensic and insolvency business opportunities; feasibility studies and business plans; small-business administration and legal dimensions; funding, articleship/internship, certification/registration, partnerships, accounting-information services and setting up a small accounting office.",
        "learning_outcomes": [
            "Discuss employment and employers.",
            "Identify accounting graduates' potential for self-employment and self-actualisation.",
            "Explain the nature and potential of small enterprises.",
            "Explain the relationship between vision and mission in entrepreneurship.",
            "Identify accounting work that can grow from small to larger-scale practice.",
            "Identify finance sources and explain business registration/documentation requirements.",
            "Explain partnership opportunities in accounting entrepreneurship.",
        ],
    },
    "ACC 401": {
        "title": "Advanced Financial Reporting",
        "pages": "47",
        "content_summary": "Group accounts for a subsidiary and associate; business combinations and consolidation under IFRS 3/10 and related standards; non-controlling interests, goodwill and intra-group adjustments; related parties, operating segments and interpretation of group statements; technology's effects on accounting.",
        "learning_outcomes": [
            "Prepare a simple group account for one subsidiary and an associate.",
            "Explain standards governing group accounts, including IAS 28 and IFRS 3, 10, 11, 12 and 13.",
            "Account for non-controlling interests, goodwill and acquisitions during a year.",
            "Adjust intra-group transactions and balances.",
            "Discuss related-party transactions under IAS 24.",
            "Discuss operating segments under IFRS 8.",
            "Analyse and interpret simple group financial statements.",
            "Discuss technology's impact on the accounting profession.",
        ],
    },
    "ACC 402": {
        "title": "Corporate Reporting",
        "pages": "47–48",
        "content_summary": "Group statements for direct subsidiaries; management commentary and social/environmental, sustainability and integrated reporting; statement-of-cash-flow analysis; earnings management; IFRS-based reporting; and financial instruments under IAS 32 and IFRS 2, 7, 9, 12, 13 and 17.",
        "learning_outcomes": [
            "Prepare group financial statements involving fellow subsidiaries.",
            "Discuss and evaluate non-financial corporate-performance reporting.",
            "Prepare and analyse cash-flow statements.",
            "Discuss creative accounting and aggressive earnings management.",
            "Apply IFRS provisions when preparing financial statements.",
            "Explain differences between integrated and sustainability reporting.",
            "Interpret financial statements using ratios.",
            "Identify and appraise financial instruments.",
        ],
    },
    "ACC 403": {
        "title": "Auditing and Assurance II",
        "pages": "48",
        "content_summary": "Internal-audit functions, governance and outsourcing; specialised investigations and joint audits; audits of computerised accounting systems, IT governance/control/risk and disaster recovery; cybersecurity, COBIT, digital forensics, data-protection audits, robotic process automation, relevant laws and auditing standards.",
        "learning_outcomes": [
            "Discuss internal-audit structures, responsibilities and reliance.",
            "Explain specialised investigations and joint audits.",
            "Explain audit in a computerised environment.",
            "Apply relevant regulations and standards to audits.",
            "Review data-protection laws and regulations.",
            "Describe auditor and joint-auditor functions.",
            "Explain digital forensics, data-protection audits and robotic process automation in audit.",
            "Apply IT skills to audit and risk assessment.",
        ],
    },
    "ACC 404": {
        "title": "Financial Management",
        "pages": "48–49",
        "content_summary": "Financial-management purpose; short-, medium- and long-term finance and costs; capital budgeting and investment appraisal; working capital and statement analysis; mergers/takeovers, dividends, share valuation, capital structure and cost of capital; CAPM, portfolio theory, budgets, derivatives, international financial risk and spreadsheet modelling.",
        "learning_outcomes": [
            "Evaluate organisational working-capital management.",
            "Analyse and interpret financial statements.",
            "Assess and advise on combinations and restructuring, including mergers and takeovers.",
            "Assess and justify valuation methods for assets, liabilities and shares.",
            "Evaluate and advise on financial-risk management.",
            "Discuss international financial-management instruments and processes.",
            "Discuss spreadsheet use in financial modelling.",
            "Evaluate capital budgeting and investment appraisal.",
            "Discuss budgeting and budgetary control.",
        ],
    },
    "ACC 405": {
        "title": "Bankruptcy & Liquidation",
        "pages": "49",
        "content_summary": "Bankruptcy and liquidation concepts, causes and procedures; deeds of arrangement and creditor claims; official receivers, trustees and creditors; statements of affairs, deficiency/surplus and liquidation accounts; executorship, wills, trusts, insolvent estates and administration of estates.",
        "learning_outcomes": [
            "Explain key bankruptcy and liquidation concepts and procedures.",
            "Discuss and prepare statements of affairs in bankruptcy and receivership.",
            "Explain executorship procedures and prepare related statements of affairs.",
            "Distinguish trusts from trusteeship arrangements.",
            "Prepare liquidation accounts.",
            "Explain deeds of arrangement.",
            "Define basic concepts relating to executorship, wills and executors.",
            "Distinguish bankruptcy from liquidation.",
        ],
    },
    "ACC 490": {
        "title": "Project",
        "pages": "32; detailed course description/outcomes not present in ACC section",
        "content_summary": "The global course structure lists ACC 490 Project as a 6-unit core course with 270 practical hours. The NUC ACC course-specific contents and learning-outcomes section does not provide a project description or stated outcomes; none are inferred here.",
        "learning_outcomes": [],
    },
}


def course_spans(text: str) -> tuple[dict[str, tuple[int, int]], tuple[int, int]]:
    decoder = json.JSONDecoder()
    programmes_key = re.search(r'"programmes"\s*:\s*\[', text)
    if not programmes_key:
        raise ValueError("Top-level programmes array not found")
    pos = programmes_key.end()
    acc_span = None
    while True:
        while pos < len(text) and text[pos] in " \t\r\n,":
            pos += 1
        if pos >= len(text) or text[pos] == "]":
            break
        obj, end = decoder.raw_decode(text, pos)
        if isinstance(obj, dict) and obj.get("code") == "ACC":
            acc_span = (pos, end)
            break
        pos = end
    if acc_span is None:
        raise ValueError("ACC programme not found")
    start, end = acc_span
    acc_text = text[start:end]
    courses_key = re.search(r'"courses"\s*:\s*\[', acc_text)
    if not courses_key:
        raise ValueError("ACC course array not found")
    pos = start + courses_key.end()
    spans: dict[str, tuple[int, int]] = {}
    while True:
        while pos < end and text[pos] in " \t\r\n,":
            pos += 1
        if pos >= end or text[pos] == "]":
            break
        obj, obj_end = decoder.raw_decode(text, pos)
        if isinstance(obj, dict) and obj.get("code") in CORRECTIONS:
            code = obj["code"]
            if code in spans:
                raise ValueError(f"Duplicate ACC course {code}")
            spans[code] = (pos, obj_end)
        pos = obj_end
    return spans, acc_span


def set_string_field(raw: str, field: str, value: str) -> str:
    match = re.search(rf'("{re.escape(field)}"\s*:\s*)', raw)
    if not match:
        raise ValueError(f"Missing {field} field")
    decoder = json.JSONDecoder()
    value_start = match.end()
    _, value_end = decoder.raw_decode(raw, value_start)
    return raw[:value_start] + json.dumps(value, ensure_ascii=False) + raw[value_end:]


def correct_course(raw: str, data: dict[str, object], eol: str) -> str:
    raw = set_string_field(raw, "title", str(data["title"]))
    raw = set_string_field(raw, "content_summary", str(data["content_summary"]))
    outcomes = data["learning_outcomes"]
    assert isinstance(outcomes, list)
    outcomes_text = ",".join(json.dumps(item, ensure_ascii=False) for item in outcomes)
    outcome_field = re.search(r'\s*"learning_outcomes"\s*:', raw)
    if outcome_field:
        value_start = outcome_field.end()
        decoder = json.JSONDecoder()
        _, value_end = decoder.raw_decode(raw, value_start)
        raw = raw[:value_start] + " " + outcomes_text + raw[value_end:]
    else:
        close = raw.rfind("}")
        if close < 0:
            raise ValueError("Malformed course object")
        indent_match = re.search(r"\n([ \t]+)\"content_summary\"", raw)
        if not indent_match:
            raise ValueError("Could not determine course field indentation")
        field_indent = indent_match.group(1)
        child_indent = field_indent + " "
        before_close = raw[:close]
        trailing = re.search(r"\s*$", before_close)
        assert trailing is not None
        field_end = trailing.start()
        formatted = "," + eol + field_indent + '"learning_outcomes": ['
        if outcomes:
            formatted += eol + child_indent + ("," + eol + child_indent).join(
                json.dumps(item, ensure_ascii=False) for item in outcomes
            ) + eol + field_indent
        formatted += "]"
        raw = raw[:field_end] + formatted + before_close[field_end:] + raw[close:]
    return raw


def main() -> None:
    original_bytes = SOURCE.read_bytes()
    if SNAPSHOT.read_bytes() != original_bytes and hashlib.sha256(original_bytes).hexdigest().upper() != BEFORE_SHA256:
        # Allow safe reruns only when the entire expected correction is already present.
        parsed = json.loads(original_bytes)
        acc = next(p for p in parsed["programmes"] if p.get("code") == "ACC")
        actual = {c["code"]: c for c in acc["courses"] if c.get("code") in CORRECTIONS}
        if len(actual) == len(CORRECTIONS) and all(
            actual[code].get("title") == data["title"]
            and actual[code].get("content_summary") == data["content_summary"]
            and actual[code].get("learning_outcomes") == data["learning_outcomes"]
            for code, data in CORRECTIONS.items()
        ):
            print("ACC correction already applied; no changes made.")
            return
        raise RuntimeError("Source changed since the preserved snapshot; refusing to patch")
    if hashlib.sha256(SNAPSHOT.read_bytes()).hexdigest().upper() != BEFORE_SHA256:
        raise RuntimeError("Preserved before snapshot hash does not match expected source")

    text = original_bytes.decode("utf-8")
    eol = "\r\n" if "\r\n" in text else "\n"
    spans, acc_span = course_spans(text)
    if set(spans) != set(CORRECTIONS):
        missing = sorted(set(CORRECTIONS) - set(spans))
        extra = sorted(set(spans) - set(CORRECTIONS))
        raise RuntimeError(f"ACC code inventory mismatch; missing={missing}, extra={extra}")

    corrected = text
    for code, (start, end) in sorted(spans.items(), key=lambda item: item[1][0], reverse=True):
        updated = correct_course(corrected[start:end], CORRECTIONS[code], eol)
        corrected = corrected[:start] + updated + corrected[end:]
    json.loads(corrected)

    # Guard the boundary: all bytes outside the ACC programme must remain equal.
    new_spans, new_acc_span = course_spans(corrected)
    old_prefix = text[:acc_span[0]]
    old_suffix = text[acc_span[1]:]
    new_prefix = corrected[:new_acc_span[0]]
    new_suffix = corrected[new_acc_span[1]:]
    if old_prefix != new_prefix or old_suffix != new_suffix:
        raise RuntimeError("Patch unexpectedly altered text outside the ACC programme")
    SOURCE.write_bytes(corrected.encode("utf-8"))
    print(f"Updated {len(spans)} ACC course records from official NUC source ({SOURCE_URL}; accessed {ACCESS_DATE}).")


if __name__ == "__main__":
    main()
