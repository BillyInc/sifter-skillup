"""Replace three stale Accounting skill arrays with source-faithful summaries."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "administration_management.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
REPAIRS = {
    "ACC 102": {
        "old": [
            "understand financial statements of a sole trader",
            "understand financial statements of limited liability companies",
            "understand the accounting treatment for share capital, debentures and reserves",
            "understand the accounting treatment for depreciation of assets",
            "prepare consolidated financial statements; and",
            "understand accounting concepts and their application",
        ],
        "skills": [
            "Explain accounting as an information system and the financial-reporting framework.",
            "Identify financial-statement users and relate accounting concepts to reporting.",
            "Correct accounting errors and use suspense and control accounts.",
            "Prepare not-for-profit accounts and distinguish single-entry from incomplete records.",
            "Prepare adjusted trading and profit-or-loss accounts for a sole trader.",
            "Describe the accounting-standard roles of FRCN and IASB.",
        ],
        "locator": "NUC Administration and Management CCMAS, Accounting, detailed ACC 102 block, printed pp. 36–37",
    },
    "ACC 203": {
        "old": [
            "understand the nature and scope of management accounting",
            "understand cost classification and cost behaviour",
            "prepare cost statements",
            "apply budgetary control techniques; and",
            "apply standard costing and variance analysis",
        ],
        "skills": [
            "Explain corporate-governance frameworks, codes and company structures.",
            "Describe shareholder, board and board-committee responsibilities.",
            "Discuss internal-control and audit procedures.",
            "Explain governance's role in sustainability.",
            "Identify applicable FRCN, OECD and other ethics codes.",
            "Explain professional-accountant ethics, including IFAC codes.",
        ],
        "locator": "NUC Administration and Management CCMAS, Accounting, detailed ACC 203 block, printed p. 39",
    },
    "ACC 206": {
        "old": [
            "understand the concept of corporate finance and the goal of a firm",
            "understand the capital structure theories",
            "analyze dividend policy and its relevance",
            "apply capital budgeting techniques; and",
            "understand working capital management",
        ],
        "skills": [
            "Use spreadsheets for basic accounting and data analysis.",
            "Use cloud-based accounting software.",
            "Apply cash-management tools to accounting problems.",
            "Use audit software in a basic audit exercise.",
            "Use presentation software for reporting.",
            "Use databases to manage accounting and business data.",
            "Use office-productivity tools for office services.",
        ],
        "locator": "NUC Administration and Management CCMAS, Accounting, detailed ACC 206 block, printed p. 40",
    },
}


def main() -> None:
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row.get("code") == "ACC")
    courses = {row["code"]: row for row in programme["courses"]}
    for code, expected in REPAIRS.items():
        row = courses[code]
        if row.get("skills_learned") != expected["old"]:
            raise RuntimeError(f"{code} skill array changed; refusing guarded repair")
        if not row.get("learning_outcomes"):
            raise RuntimeError(f"{code} has no source-verified learning outcomes")
        if any(row.get(field) for field in ("source_url", "source_locator", "source_accessed_on")):
            raise RuntimeError(f"{code} already has item provenance; review before replacing")

    for code, expected in REPAIRS.items():
        row = courses[code]
        row["skills_learned"] = expected["skills"]
        row["source_url"] = SOURCE_URL
        row["source_locator"] = expected["locator"]
        row["source_accessed_on"] = "2026-09-25"

    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    check = json.loads(TARGET.read_text(encoding="utf-8"))
    updated = {row["code"]: row for row in next(row for row in check["programmes"] if row.get("code") == "ACC")["courses"]}
    for code, expected in REPAIRS.items():
        assert updated[code]["skills_learned"] == expected["skills"]
        assert updated[code]["learning_outcomes"]
        assert updated[code]["source_url"] == SOURCE_URL
        assert updated[code]["source_locator"] == expected["locator"]
        assert updated[code]["source_accessed_on"] == "2026-09-25"
    print("Replaced three stale Accounting skill arrays with outcome-aligned summaries and exact NUC locators.")


if __name__ == "__main__":
    main()
