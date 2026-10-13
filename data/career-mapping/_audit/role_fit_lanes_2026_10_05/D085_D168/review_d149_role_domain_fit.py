import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D149_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D149_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D149 role_key, parent scope and stored task descriptions.",
        "supports": "The specific recorded duties evaluated for each D149 mapping.",
        "limit": "This is the record under audit, not an independent verification of an occupation's complete scope.",
    },
    "UN_VIENNA_DIPLOMATIC_RELATIONS": {
        "publisher": "United Nations, International Law Commission",
        "url": "https://legal.un.org/ilc/texts/instruments/english/conventions/9_1_1961.pdf",
        "locator": "Vienna Convention on Diplomatic Relations (1961), Article 3(1)(a)-(e): representation, protection of state/national interests, negotiation, reporting on receiving-state developments, and promotion of friendly/economic/cultural/scientific relations.",
        "supports": "The international-law functions defining core diplomatic-mission work, used to assess ambassadors, diplomats, embassy counsellors and foreign-affairs/political-affairs duties.",
        "limit": "Defines mission functions, not every national job title, rank, hiring standard or domestic foreign-service structure.",
    },
    "UN_VIENNA_CONSULAR_RELATIONS": {
        "publisher": "United Nations, International Law Commission",
        "url": "https://legal.un.org/ilc/texts/instruments/english/conventions/9_2_1963.pdf",
        "locator": "Vienna Convention on Consular Relations (1963), Article 5: consular functions include protecting sending-state and national interests, fostering commercial/economic/cultural/scientific relations, reporting on developments, and assisting nationals.",
        "supports": "The task fit of consular representation, citizen assistance and cross-border economic cooperation.",
        "limit": "Defines consular functions under the Convention; domestic titles, authority and legal practice vary by state.",
    },
    "UN_POLITICAL_AFFAIRS": {
        "publisher": "United Nations Careers / Department of Political and Peacebuilding Affairs",
        "url": "https://careers.un.org/talentpipeline/description/67efa8cb80ebc3000b4d1817",
        "locator": "Political Affairs Officer talent-pipeline description: political analysis, strategy and recommendations, communicating findings, collaboration with member states and civil society, conflict resolution and negotiation.",
        "supports": "Task-level fit for foreign-affairs and political-affairs analysis/advisory functions.",
        "limit": "UN-specific role framework; it is corroborative, not a universal job specification or proof of a particular employer's duties.",
    },
    "OCHA_HUMANITARIAN_COORDINATION": {
        "publisher": "United Nations Office for the Coordination of Humanitarian Affairs (OCHA), UNDAC",
        "url": "https://knowledge.base.unocha.org/wiki/spaces/UNDAC/overview?mode=global",
        "locator": "About OCHA and UNDAC: bringing humanitarian actors together for coherent emergency response; international response coordination and support to governments/UN country teams.",
        "supports": "The international humanitarian coordination context that can overlap diplomacy and international relations.",
        "limit": "Establishes a humanitarian-response function, not that every humanitarian adviser works in diplomacy/IR; hence generic humanitarian-adviser fit remains conditional.",
    },
    "UN_SECRETARY_GENERAL": {
        "publisher": "United Nations",
        "url": "https://www.un.org/sg/en/content/the-role-of-the-secretary-general",
        "locator": "The role of the Secretary-General: chief administrative officer, consultations with world leaders and government officials, and high-level diplomatic/representational work.",
        "supports": "The existence of senior international-organization leadership with diplomatic and external-representation responsibilities.",
        "limit": "A UN-specific senior office; the queued generic secretary-general record also includes non-governmental organizations and does not establish that all such roles are diplomatic/IR posts.",
    },
    "WTO_TRADE_POLICY_ROLES": {
        "publisher": "World Trade Organization",
        "url": "https://www.wto.org/english/thewto_e/vacan_e/career_e.htm",
        "locator": "Career opportunities, lines describing trade-policy analysts/specialists and legal/economic affairs officers: advice to WTO divisions, support for committees/negotiating groups, trade-policy review, research, analysis and technical assistance.",
        "supports": "International trade-policy work at an intergovernmental organization and its relation to international negotiations/policy.",
        "limit": "WTO Secretariat duties are not identical to national trade-promotion or domestic commercial-development jobs; the broadly worded queued role remains conditional.",
    },
    "ILO_ISCO_JOURNALISTS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 Volume 1, unit group 2642 (Journalists), printed page 165: gathering local/national/international news, reporting current affairs through media, verification and reporting specialist developments.",
        "supports": "Journalism as a media/news occupation; foreign posting or foreign-affairs subject matter alone does not make it diplomacy or international-relations work.",
        "limit": "ISCO classifies work for statistical comparability; it does not decide this product's domain taxonomy. The distinction here is an explicit task-based inference from the queue and domain scope.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

# Keyed to exact queued role names. Decisions assess only parent-domain fit.
DECISIONS = {
    "ambassador": (S, "Represents a sending government abroad, negotiates with the receiving government, reports on developments and protects the sending state's interests—the core functions of a diplomatic mission. This establishes domain fit, not appointment eligibility or a universal rank structure.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS"]),
    "consul": (S, "The recorded role represents the home government, supports cross-border cooperation and protects/assists its nationals abroad. These are expressly recognized consular functions; any local legal authority remains jurisdiction-dependent.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_CONSULAR_RELATIONS"]),
    "diplomat": (S, "Represents a home government in international organizations, protects its interests, negotiates and facilitates relations. Diplomatic representation and negotiation with international organizations are recognized functions of diplomatic staff.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS"]),
    "embassy counsellor": (S, "Leads embassy policy sections, advises the ambassador and performs diplomatic functions. The recorded work is located in a diplomatic mission and directly supports its policy, reporting and representation functions.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS"]),
    "foreign affairs officer": (S, "Analyzes foreign-affairs policy and operations, reports findings and advises on implementation. Those tasks directly match foreign-state analysis, reporting and policy advice; UN political-affairs duties corroborate this task family.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS", "UN_POLITICAL_AFFAIRS"]),
    "foreign correspondent": (U, "Researches and reports international news for media and is stationed abroad. International subject matter and overseas location do not make journalism a diplomatic or international-relations function; the occupational task family is journalism/media reporting.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_JOURNALISTS"]),
    "humanitarian advisor": (C, "Advises strategies to reduce national or international humanitarian-crisis impacts with partners. International humanitarian coordination overlaps the domain's stated humanitarian issues, but the recorded duties do not establish foreign-policy, diplomatic-mission or intergovernmental-relations work; fit depends on the actual assignment.", ["QUEUE_TASK_PROFILE", "OCHA_HUMANITARIAN_COORDINATION"]),
    "intelligence officer": (C, "Plans information gathering, investigations, interviews and reporting, but the stored task is generic and does not specify foreign intelligence or foreign-policy support. The parent includes intelligence work in a foreign-affairs context, so only that context would establish fit; no national agency model is assumed.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS"]),
    "international relations officer": (S, "Builds cooperation between international public organizations and governments, facilitates communication with foreign organizations and develops collaboration strategies. This is direct intergovernmental/international-organization relationship work.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_DIPLOMATIC_RELATIONS"]),
    "political affairs officer": (S, "Analyzes foreign political developments, monitors conflict, advises on mediation and reports/presents policy options. UN political-affairs role evidence corroborates these core tasks within international peace-and-security work.", ["QUEUE_TASK_PROFILE", "UN_POLITICAL_AFFAIRS"]),
    "secretary general": (C, "The record concerns leadership, policy, strategy and external representation for an international governmental or nongovernmental organization. It can fit where the post's remit is international relations/diplomacy, but the title also covers broad organizational leadership without that remit.", ["QUEUE_TASK_PROFILE", "UN_SECRETARY_GENERAL"]),
    "trade development officer": (C, "The record includes international trade policy and import/export relations, which overlap cross-border economic relations. It also includes domestic market promotion and business operations; WTO trade-policy evidence confirms an international-policy route but does not establish that this broader role is principally diplomatic/IR.", ["QUEUE_TASK_PROFILE", "UN_VIENNA_CONSULAR_RELATIONS", "WTO_TRADE_POLICY_ROLES"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D149"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D149 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D149", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Assess each exact role task against the parent's diplomacy, foreign-policy, representation, negotiation, consular, international-organization and international-humanitarian scope. A shared title, foreign location, subgroup membership or broad international subject matter is not enough; require duties within the domain's actual work. Use conditional when a defined assignment/context would determine fit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "coverage_signal": {
            "lane_queue_mappings_for_D149": len(decisions),
            "interpretation": "This is the count of D149 existing links in the current exact audit queue, not a complete active-role total or a judgment that coverage is sufficient. This lane adjudicates existing links and does not add occupations.",
            "zero_or_sparse_signal_in_this_review": "None established from the parent-fit queue alone.",
            "catalogue_gap_candidates_from_plan": ["D037", "D038", "D039", "D040"],
            "catalogue_gap_candidate_note": "The ROLE_COVERAGE_ENRICHMENT_PLAN_2026-10-05.md identifies these as zero-active-role candidates; they are outside this lane and were not revalidated in this D149 review.",
        },
        "notes": [
            "All 12 exact D149 queued mappings were assessed using the stored task descriptions; titles and any subgroup membership are not proof of fit.",
            "Conditional means the recorded task/context is too broad to confirm a fit, not that the role is rejected or assigned to a specialization.",
            "The diplomatic and consular conventions define functions, not national hiring criteria, licensing, rank or title equivalence.",
            "The secretary-general evidence is UN-specific; it does not establish that all international-organization or NGO secretary-general posts are diplomatic roles.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [f"# D149 role-to-parent-domain fit review — {payload['audit_date']}", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Coverage signal (separate from fit)", "", f"D149 has **{len(decisions)} existing links in this lane's exact review queue**. This is not a complete active-role count or a sufficiency score. No zero/sparse conclusion is inferred here. The separate coverage plan lists D037–D040 as zero-active-role candidates; that catalogue-wide queue is outside this D149 review and has not been revalidated here.", "", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
