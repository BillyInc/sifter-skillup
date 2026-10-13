"""Build exact-key D061 role-to-insurance-domain fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D061_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D061_role_domain_fit_review_2026_10_05.md"
IAIS_ICP = "https://www.iais.org/uploads/2022/01/Insurance_core_principles_and_methodology.pdf.pdf"
ONET_UNDERWRITER = "https://www.onetonline.org/link/summary/13-2053.00"
ONET_CLAIMS = "https://www.onetonline.org/link/summary/13-1031.00"

# Result is based on each supplied task profile versus the actual insurance
# scope. Merely being a broker, financial worker or being under an insurance
# subgroup is not sufficient.
DECISIONS = {
    "financial broker": ("unsupported", "The supplied tasks concern securities and financial-market trading on clients' behalf, not insurance policies, risk transfer, premium pricing, or claims." , None),
    "foreign exchange broker": ("unsupported", "The supplied tasks are currency-market dealing and speculation on exchange-rate movements; no insurance activity is described." , None),
    "insurance agency manager": ("supported", "The task explicitly manages an institution or branch providing insurance services and advises clients on insurance products." , None),
    "insurance broker": ("supported", "The task explicitly advises on and intermediates insurance policies between customers and insurers." , None),
    "insurance claims handler": ("supported", "The task explicitly assesses and administers insurance claims and payments to policyholders." , None),
    "insurance claims manager": ("supported", "The task leads insurance claims handling, resolves complex policyholder cases, and coordinates with adjusters and brokers." , None),
    "insurance clerk": ("supported", "The task performs insurance-agreement administration and provides information about insurance to customers in insurance institutions or agencies." , None),
    "insurance collector": ("supported", "The task collects overdue insurance premiums and arranges payment plans for policyholders." , None),
    "insurance fraud investigator": ("supported", "The task investigates suspicious insurance claims, customer activity, product purchases and premium calculations." , None),
    "insurance product manager": ("supported", "The task owns insurance-product development and lifecycle, aligned with insurance strategy and distribution." , None),
    "insurance rating analyst": ("conditional", "The supplied description mixes insurance premium/rate calculation with credit-rating opinions. The insurance-pricing work fits; generic securities/issuer credit-rating work does not. Confirm which task set the mapped role record intends." , "insurance risk classification and premium/rate calculation, not issuer or securities credit ratings"),
    "insurance risk consultant": ("supported", "The task surveys people, property or sites to estimate potential financial loss for insurance underwriting." , None),
    "insurance underwriter": ("supported", "The supplied task explicitly evaluates insurable commercial-property and liability risks and supports insurance coverage decisions, although the source excerpt also mentions loan-related duties." , None),
    "loss adjuster": ("supported", "The task investigates insured losses, assesses damage and liability against policy terms, and recommends claim settlement." , None),
    "mortgage broker": ("unsupported", "The task is mortgage-credit intermediation and loan-agreement administration, not insurance intermediation." , None),
    "mortgage loan underwriter": ("unsupported", "The task reviews mortgage-loan underwriting guidelines and loans; it does not describe insurance underwriting." , None),
    "mutual fund broker": ("unsupported", "The task raises and invests shareholder funds in securities and money-market instruments; that is investment management/brokerage, not insurance." , None),
    "pension scheme manager": ("conditional", "The task manages retirement schemes and pension-fund deployment. Some insurers administer or provide pension/annuity products, but the supplied profile does not establish that this role is insurer-based." , "pension or retirement products administered/provided by an insurer; not general pension-fund management"),
    "personal property appraiser": ("supported", "The task explicitly values personal property for insurance purposes as well as sales; the insurance valuation use is a direct fit." , None),
    "property insurance underwriter": ("supported", "The task directly evaluates insured property risk and coverage under insurance underwriting rules." , None),
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
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D061"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 20 or len(by_name) != 20 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D061 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.append(IAIS_ICP)
        if name in {"insurance underwriter", "property insurance underwriter", "insurance rating analyst"}:
            refs.append(ONET_UNDERWRITER)
        if name in {"insurance claims handler", "insurance claims manager", "loss adjuster", "insurance fraud investigator", "personal property appraiser"}:
            refs.append(ONET_CLAIMS)
        action = ("retain_parent_domain_link_candidate" if status == "supported" else
                  "remove_parent_domain_link_candidate_after_cross_lane_reconciliation" if status == "unsupported" else
                  "do_not_present_as_confirmed_D061_role_without_assignment_evidence")
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESCO/O*NET task records describe the role profile and can include mixed or adjacent duties. IAIS Insurance Core Principles provide international supervisory principles and discuss insurer/intermediary functions, but do not establish that every job title belongs to insurance or determine local licensing. O*NET is a US occupational taxonomy and is used only to corroborate task distinctions. The truncated source task text is preserved as supplied; exact source locators are retained for review.",
            "recommended_action": action,
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D061", "domain_name": "Insurance",
        "scope": "D061 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all 20 exact D061 role keys. Compared the supplied ESCO/O*NET task evidence independently with insurance risk transfer, underwriting, policy intermediation, claims, premium collection and pension services explicitly mentioned in the domain scope. Securities/currency brokerage and mortgage-credit work were not treated as insurance solely because they are financial services. IAIS principles and O*NET task profiles corroborate the functional boundaries. Ambiguous composite task descriptions remain conditional.",
        "scope_sources": [IAIS_ICP, ONET_UNDERWRITER, ONET_CLAIMS],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review evidence only; do not modify canonical mappings until cross-lane reconciliation. Conditional cases require the named insurance-specific assignment; unsupported cases are candidates for removal from D061, not automatic reassignment elsewhere.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D061 — Insurance: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/20 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [IAIS Insurance Core Principles and Methodology]({IAIS_ICP}) provide international supervisory principles for insurers and insurance intermediaries; they support the distinction between insurance functions and other financial services, but are not a global job taxonomy. O*NET task profiles for [insurance underwriters]({ONET_UNDERWRITER}) and [claims adjusters/examiners/investigators]({ONET_CLAIMS}) corroborate underwriting and claims tasks. Exact ESCO/O*NET locators are retained per decision.",
                  "", "Financial brokers, foreign-exchange brokers, mortgage-credit roles and mutual-fund brokers are not insurance merely because they work in financial services. The rating-analyst record combines insurance pricing with credit-rating language; pension management is conditional on insurer-provided pension/annuity work.", "",
                  f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/20; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Every disposition includes task evidence, rationale, source references, limits and recommended action.",
                  "- No canonical role mapping or specialization data changed."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
