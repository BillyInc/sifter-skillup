"""Build exact-key D063 Economics and Policy Analysis role-fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D063_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D063_role_domain_fit_review_2026_10_05.md"

OECD_COMPETITION = "https://www.oecd.org/en/topics/policy-issues/competition.html"
ILO_EMPLOYMENT = "https://www.ilo.org/resource/article/formulation-employment-policies"
UNFCCC_CLIMATE = "https://unfccc.int/response-measures/impact-assessment-tools-database"
ONET_ECONOMISTS = "https://www.onetonline.org/link/summary/19-3011.00"
ONET_ECON_TEACHERS = "https://www.onetonline.org/link/summary/25-1063.00"
ONET_ENV_ECONOMISTS = "https://www.onetonline.org/link/summary/19-3011.01"
ONET_POLITICAL_SCIENTISTS = "https://www.onetonline.org/link/summary/19-3094.00"

# Fit is to the stored parent-domain scope from occupation tasks, never title,
# ISCO/subgroup membership, or assumed downstream specialization.
DECISIONS = {
    "business economics researcher": ("supported", "The task explicitly researches macroeconomic and microeconomic trends, industry/company positions in the economy, and uses that analysis to advise strategy; this is a direct economics-analysis fit.", None),
    "business studies and economics teacher secondary school": ("conditional", "The task teaches a combined business-studies/economics subject. The economics teaching fits this domain; generic business-studies teaching alone does not establish an economics-domain assignment.", "the assigned teaching includes economics as a substantive subject component"),
    "climate change policy analysts": ("conditional", "The task develops climate-policy recommendations, but the supplied description does not say that the analysis is economic. UNFCCC recognizes economic and socioeconomic impact assessment as one analytical lens for climate-policy evaluation; that supports only the economics-assessment branch.", "economic or socioeconomic impact assessment of climate policy, not climate-policy work generally"),
    "competition policy officer": ("supported", "The task develops competition policy and law to regulate market conduct, support open trade, and protect consumers and businesses. OECD describes competition policy as economic policy linked to consumer welfare and growth.", None),
    "economic adviser": ("supported", "Researching economic developments, forecasting trends, and advising on finance, trade, fiscal and related matters directly matches the domain's economics and policy-analysis scope.", None),
    "economic development coordinator": ("supported", "The task develops economic-growth and stability policy, researches economic trends, and coordinates institutions working on economic development, directly matching the parent domain.", None),
    "economic policy officer": ("supported", "The task monitors economic competitiveness, innovation and trade and develops economic strategies, policy, projects and programmes; this is direct economic-policy work.", None),
    "economics lecturer": ("supported", "The task teaches and conducts academic research specifically in economics, directly matching the domain's economics-analysis and education scope.", None),
    "economics teachers, postsecondary": ("supported", "The occupation task is specifically teaching economics courses, including teaching/research appointments. O*NET classifies this as postsecondary economics teaching.", None),
    "economist": ("supported", "The task researches micro- and macroeconomics, analyses trends and statistics, uses economic models, and advises companies or government; this directly matches the domain.", None),
    "economists": ("supported", "The task addresses economic problems in production/distribution and monetary/fiscal policy using economic and statistical data and econometrics; it is directly within the domain.", None),
    "environmental economists": ("supported", "The task applies economic analysis to environmental protection and natural-resource use, measuring costs, benefits, incentives and impacts. O*NET defines this as Environmental Economists, an economics occupation applied to environmental questions.", None),
    "fiscal affairs policy officer": ("supported", "The task researches, analyses and develops tax and government-spending policy. Fiscal policy is an explicit economic-policy remit in the stored domain scope.", None),
    "labour market policy officer": ("supported", "The task develops labour-market policies on employment, training, start-ups and income support. ILO describes employment policy as integrated with macroeconomic, development and sectoral policy, supporting this direct policy fit.", None),
    "political scientist": ("unsupported", "The supplied task is the study of political behaviour, activity, systems and trends. Public-policy proximity alone does not establish economics analysis or economic-policy duties; O*NET separately classifies Political Scientists.", None),
    "tax policy analyst": ("supported", "The task develops taxation policy and legislation, advises public bodies on implementation, and forecasts the financial effects of tax changes; these are explicit fiscal/economic-policy activities.", None),
    "trade development officer": ("supported", "The task develops and implements domestic/international trade policy, analyzes markets, and ensures trade compliance. Trade policy and analysis are explicitly within the stored domain scope.", None),
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
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D063"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 17 or len(by_name) != 17 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D063 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([OECD_COMPETITION, ILO_EMPLOYMENT, UNFCCC_CLIMATE, ONET_ECONOMISTS])
        if "teacher" in name or "lecturer" in name:
            refs.append(ONET_ECON_TEACHERS)
        if name == "environmental economists":
            refs.extend([ONET_ENV_ECONOMISTS, "https://www.onetonline.org/link/details/19-3011.01"])
        if name == "political scientist":
            refs.extend([ONET_POLITICAL_SCIENTISTS, "https://www.onetonline.org/link/details/19-3094.00"])
        action = (
            "retain_parent_domain_link_candidate" if status == "supported" else
            "candidate_parent_domain_exclusion_after_cross_lane_reconciliation" if status == "unsupported" else
            "do_not_present_as_confirmed_D063_role_without_assignment_evidence"
        )
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESCO/O*NET task profiles describe occupation variants and may be broad; exact local assignment may differ. OECD, ILO and UNFCCC sources establish policy subject-matter boundaries, not occupational licensing, local demand, or a universal job-title taxonomy. Political-science/public-policy proximity is not treated as economics evidence. No role is reassigned to another domain here.",
            "recommended_action": action,
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D063", "domain_name": "Economics and Policy Analysis",
        "scope": "D063 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all 17 exact D063 role mappings. Compared each supplied role task independently with economics research, macro/micro trends, economic advice, fiscal/trade/labour/competition policy, economic development and economics teaching in the stored domain scope. Climate-policy work is conditional only when economic/socioeconomic assessment is part of the assignment. Political science is not accepted through policy adjacency alone. External sources corroborate discipline and policy boundaries; they do not replace the supplied role task or establish local licensing/demand.",
        "scope_sources": [OECD_COMPETITION, ILO_EMPLOYMENT, UNFCCC_CLIMATE, ONET_ECONOMISTS, ONET_ECON_TEACHERS, ONET_ENV_ECONOMISTS, ONET_POLITICAL_SCIENTISTS],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. Conditional entries require the stated assignment evidence; unsupported political-scientist mapping is a candidate D063 exclusion, not an inferred reassignment. Reconcile other lanes before canonical changes.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D063 — Economics and Policy Analysis: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/17 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[OECD competition policy]({OECD_COMPETITION}) links competition policy to economic policy, consumer welfare and growth. The [ILO employment-policy overview]({ILO_EMPLOYMENT}) describes employment policy as connected to macroeconomic and development policy. The [UNFCCC climate-policy impact-assessment database]({UNFCCC_CLIMATE}) explicitly includes economic and socioeconomic impact analysis, but does not make all climate-policy roles economics roles. [O*NET Economists]({ONET_ECONOMISTS}), [postsecondary economics teachers]({ONET_ECON_TEACHERS}), [Environmental Economists]({ONET_ENV_ECONOMISTS}) and [Political Scientists]({ONET_POLITICAL_SCIENTISTS}) provide occupation/task boundaries.", "",
                  "Conditional is not confirmed: it requires the stated task assignment. The combined secondary teaching role is conditional on economics being taught as a substantive subject; climate policy is conditional on economic/socioeconomic analysis. Political-scientist tasks remain outside D063 absent a specific economic-analysis assignment.", "",
                  f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/17; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Each decision retains the exact local task text, rationale, sources, source limitations and proposed action.",
                  "- Canonical role/domain/specialization files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
