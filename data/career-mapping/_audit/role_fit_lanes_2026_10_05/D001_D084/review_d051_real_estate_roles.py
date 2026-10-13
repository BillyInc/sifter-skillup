"""Build the evidence-backed D051 Real Estate role/domain review slice."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D051_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D051_role_domain_fit_review_2026_10_05.md"

SUPPORTED = {"facilities manager", "mortgage broker"}
UNSUPPORTED = {
    "business valuer", "cultural facilities manager", "financial broker",
    "foreign exchange broker", "insurance broker", "intellectual property consultant",
}

def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D051"]
    by_name = {r["role_name"]: r for r in rows}
    if len(rows) != 8 or set(by_name) != SUPPORTED | UNSUPPORTED:
        raise SystemExit(f"D051 exact queue changed: {len(rows)} rows; keys={sorted(by_name)}")
    decisions = []
    for name in sorted(by_name):
        row = by_name[name]
        status = "supported" if name in SUPPORTED else "unsupported"
        task = row["role_task_text"]
        if name == "facilities manager":
            basis = "The task is directly about administration and maintenance of buildings, utilities, space, contractor work, health and safety, and building operations. This matches the stored Real Estate scope's property/building-management function."
            category = "building_operations_and_property_management"
        elif name == "mortgage broker":
            basis = "The task intermediates consumer mortgage/property credit and pre-contractual credit work. The stored parent scope expressly includes mortgage finance; this is a real-estate finance path, not general lending."
            category = "property_finance"
        elif name == "business valuer":
            basis = "The exact task values businesses, securities, and intangible assets for corporate transactions, litigation, tax, or restructuring. It does not establish valuation of land, buildings, or real-property interests; broad valuation expertise alone does not fit this parent domain."
            category = "business_and_intangible_asset_valuation"
        elif name == "cultural facilities manager":
            basis = "The task manages operations, staff, budgets, and resources for cultural-service institutions (such as theatres, museums, and concert halls). It does not describe property ownership, real-estate transactions, or building/property management as the occupation's core remit."
            category = "cultural_institution_operations"
        elif name in {"financial broker", "foreign exchange broker"}:
            basis = "The task brokers securities or foreign-currency transactions and analyzes financial markets. The stored scope's broker activity is specifically property sales/purchases and mortgage finance; general capital-markets brokerage is not real estate."
            category = "financial_market_brokerage"
        elif name == "insurance broker":
            basis = "The task is insurance intermediation generally and does not specify real-property insurance, property assets, or real-estate clients. Generic insurance brokerage is not supported as a Real Estate role by this record."
            category = "general_insurance_intermediation"
        else:
            basis = "The task concerns patents, copyrights, trademarks, intangible-asset valuation, and patent brokerage. Intellectual-property rights are not land/building interests or property transactions in the stored Real Estate scope."
            category = "intellectual_property_advisory"
        refs = []
        for ref in row["task_source_refs"]:
            source, value = ref.split(":", 1)
            locator = value.split("@", 1)[0]
            if source == "ONET" and not locator.startswith(("http://", "https://")):
                locator = f"https://www.onetonline.org/link/summary/{locator}"
            refs.append(locator)
        refs.extend([
            "https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/red-book",
            "https://www.rics.org/content/dam/ricsglobal/documents/standards/Red-Book-Global-Standards-incorporating-IVS.pdf",
        ])
        decisions.append({
            "role_key": row["role_key"], "role_name": name,
            "domain_fit_status": status, "decision_category": category,
            "task_evidence": task, "basis": basis,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "The ESCO record is the exact mapped occupation task source; O*NET is a US task cross-reference where available. RICS Red Book/IVS provides a global real-property valuation boundary, not proof that every valuation or brokerage occupation is real estate. This disposition addresses this D051 link only and does not assign an alternative domain or determine local licensing.",
            "recommended_action": "retain_current_D051_link" if status == "supported" else "remove_current_D051_link_after_lane_reconciliation; do_not_infer_destination",
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    payload = {
        "schema_version": 1, "domain_id": "D051", "domain_name": "Real Estate",
        "scope": "D051 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed the exact eight D051 role keys from the generated worklist. Compared each stored role task and source locator to the current parent scope and the global real-property boundary in RICS Red Book/International Valuation Standards. ISCO/subgroup, title similarity, and role frequency were not used as fit evidence.",
        "scope_sources": [
            "https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/red-book",
            "https://www.rics.org/content/dam/ricsglobal/documents/standards/Red-Book-Global-Standards-incorporating-IVS.pdf",
        ],
        "source_limit_policy": "RICS Red Book is global valuation guidance and distinguishes real-property interests/assets from other asset classes. Exact task meaning comes from the checked-in ESCO profile and linked O*NET profiles. No local jurisdictional licensing or alternative-domain placement is inferred.",
        "counts": {"reviewed_role_mappings": 8, **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions, "canonical_changes": 0,
        "canonical_correction_ready": False,
        "correction_note": "Six D051 links have task-supported exclusion recommendations, especially generic capital-markets brokerage and IP advice. Do not write canonical JSON while the other role lane is active; reconcile first, then apply only agreed exact-key removals.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D051 — Real Estate: role-to-parent fit", "",
        "**Slice:** 8/8 exact D051 role mappings reviewed. No subgroup or role-to-specialization decisions; canonical mapping unchanged.",
        "", "| Disposition | Count |", "|---|---:|",
        f"| Supported | {counts.get('supported', 0)} |", f"| Unsupported | {counts.get('unsupported', 0)} |", "",
        "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines += [f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in decisions]
    lines += ["", "## Evidence boundary", "",
        "The exact task descriptions and ESCO/O*NET locators are retained for every mapping. [RICS Red Book](https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/red-book) incorporates global valuation standards for real-property interests and other asset classes; its definitions help distinguish business/securities/intangible valuation from real-estate valuation. It does not turn all finance, insurance, cultural-facility, or IP work into real estate.",
        "", "The six unsupported dispositions remove support for these D051 links only. No replacement domain is inferred. Reconcile with the other active role lane before any canonical edit.",
        "", "## Validation", "", f"- Exact queue coverage: {len(decisions)}/8.",
        f"- Status arithmetic: {counts.get('supported',0)} supported + {counts.get('unsupported',0)} unsupported = {len(decisions)}.",
        "- All rows have task text, rationale, source references, and limitations; no canonical data was changed."]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))

if __name__ == "__main__":
    main()
