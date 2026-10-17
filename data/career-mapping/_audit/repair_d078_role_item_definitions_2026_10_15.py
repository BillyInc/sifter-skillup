#!/usr/bin/env python3
"""Fill the 57 blank D078 role-item meanings from their attached exact-source definitions."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"

# These are concise plain-language paraphrases of the exact ESCO concept
# definitions already attached to each record's evidence[].supports field.
# Route-specific application, task/output and limitations remain separate.
MEANINGS = {
    117: "Ethics examines questions about right and wrong and how people should act. In this route, distinguish ethical questions about death and dying from the separate safeguards needed when researching bereaved or vulnerable people.",
    118: "European political studies examines European institutions, elections, policies and relations between countries. Here it is useful only for a clearly defined comparison about Europe, not as a general Social Sciences foundation.",
    119: "Excavation techniques are the methods used to remove soil or rock carefully while recording what is found and the risks involved. Archaeological excavation needs proper permissions, planning, supervision and conservation.",
    120: "Analytical mathematical calculations use suitable mathematics and calculation tools to answer a defined problem. Show the assumptions, units and meaning of the result rather than reporting a number alone.",
    121: "Experimental psychology uses structured studies to test questions about the mind or behaviour. In this route, it is a bounded, non-clinical research option with appropriate consent and oversight—not a psychology qualification.",
    122: "Family law covers legal rules about family relationships and matters such as marriage, adoption and parental status. The rules vary by place and time, so use a dated, jurisdiction-specific source when interpreting a historical record; this is not legal advice.",
    123: "Financial analysis examines financial statements and reports to understand an organisation's or person's financial position and performance. State the period, measures and assumptions so comparisons are fair.",
    124: "Financial forecasting estimates plausible future financial values using data, assumptions and a stated method. Present a range or scenarios and explain the uncertainty; a forecast is not a promise.",
    125: "Financial markets are the systems and institutions through which financial assets are issued and traded. A useful analysis names the instrument, participants, period and relevant regulatory setting.",
    126: "Foreign affairs concerns a government's or public organisation's work and rules for dealing with other countries. In this route, it supports evidence-based analysis of external relations, not diplomatic authority.",
    127: "Forensic anthropology applies biological and archaeological methods to human remains for identification or legal investigations. This specialised forensic work is different from social or cultural research about death and dying, and is not an approved D078 task here.",
    128: "Forensic psychiatry applies specialist medical knowledge to questions involving mental health and the justice system. It is not a criminologist's authority to assess or treat people; any D078 use is limited to studying published evidence or institutions.",
    129: "Fraud detection looks for patterns that may need further checking. In policy analysis, report aggregate patterns and possible false alarms; a flagged pattern is not proof that a person or organisation committed fraud.",
    130: "Fundamental analysis estimates an asset's or company's value by examining financial statements, economic conditions and other relevant factors. Show the assumptions and uncertainty; this is not a buy-or-sell recommendation.",
    131: "Genealogy traces family relationships and life events using records, interviews and other evidence. A careful family tree or narrative distinguishes documented facts from hypotheses and unresolved conflicts.",
    132: "Genomics studies the genetic information contained across an organism's genome. In family-history work, genetic matches can only suggest possible relationships and require consent, privacy safeguards and documentary evidence; they are not a medical diagnosis.",
    133: "A geographic information system (GIS) stores, analyses and displays information linked to places. A geographer might use it to compare where services are located with where people live, while documenting map scale, coordinates, data sources and limitations.",
    134: "A geographic information system (GIS) stores, analyses and displays information linked to places. In archaeology, it can help record where sites, finds or features occur; document coordinates, source and access restrictions.",
    135: "The geological time scale is a standard way to divide Earth's history into named periods based on geological and biological evidence. It can provide context for an archaeological interpretation, but does not by itself date an artefact.",
    136: "Geology studies Earth's solid materials, structures and the processes that change them. For a human-geography question, it is a supporting context only when physical conditions help explain settlement, hazards, resources or land use.",
    137: "Good governance concerns how public authority and institutions work, and whether decisions are transparent, responsive, fair and inclusive. An analysis should define which feature it examines instead of giving a broad score without evidence.",
    138: "Government policy is a public plan or approach for addressing an issue. A political scientist can examine how it was designed, who shaped it or what evidence exists about its effects; the report should identify which stage it covers.",
    139: "Government policy implementation is the work of turning an adopted policy into actions, responsibilities, resources and monitoring. An analyst can examine likely constraints and risks without claiming authority to carry out the policy.",
    140: "History studies and explains human events and change over time using evidence. Archaeological interpretation should distinguish what the material evidence shows from what the researcher infers.",
    141: "The history of literature studies how written works, forms and their historical settings change over time. A media study may use it when a defined question concerns literary media, representation or audiences—not for every media-research task.",
    142: "History of philosophy studies how philosophical ideas and arguments developed across thinkers, traditions and periods. This item remains excluded from the D078 learning route because its philosopher role is outside the approved domain.",
    143: "Human physiology studies how the body's organs and systems function and interact. No D078 task here establishes a need to produce physiological or clinical findings, so this is not a D078 learning route.",
    144: "Inspecting data means checking and organising information to find useful evidence and support a decision. For genealogy, check dates, names, missing fields, contradictions and source details before drawing a family connection.",
    145: "Inspecting government expenditures means checking how public budgets and spending are recorded and comparing them with approved allocations or stated plans. This learning option supports analysis; it does not grant audit authority.",
    146: "International business concerns the production or distribution of goods and services across national borders. In this route, use it only when a research question involves a firm's or sector's trade exposure, sourcing or cross-border market conditions.",
    147: "International commercial transaction rules set standard terms that allocate delivery tasks, costs and risks between buyers and sellers across borders. Name the term and edition used; studying them does not qualify someone to draft or interpret contracts.",
    148: "International security studies examines the causes, conduct and ending of conflicts. It is relevant to D078 criminology only if a specific research question links crime or justice to transnational conflict or security institutions; that route is not established by the label alone.",
    149: "International tariffs are taxes or duties applied to specified imports or exports. A policy analysis should identify the tariff line, date and assumptions about revenue, prices and affected groups.",
    150: "International trade studies the exchange of goods and services across borders and its economic and policy effects. A policy note should name the measure, evidence, affected groups and limits; the concept does not imply that every policy role covers trade.",
    151: "Interpreting current data means examining recent information from sources such as official statistics, research or surveys to understand a change. State the population, period, collection method and uncertainty before explaining what the pattern may mean.",
    152: "A genetic pedigree chart shows how a particular inherited trait or gene appears across generations. It is not the same as a documentary genealogy family tree; this candidate has no supported D078 role-task route and remains hidden.",
    153: "Investigation research methods are procedures used in police, intelligence or military investigations. They are not the same as ordinary genealogical source searching, and no D078 role-task link is established for this item.",
    154: "Legal requirements in the social sector are laws and regulations that apply to social services. For research, identify the jurisdiction and date and seek qualified review; a course about another country's law does not explain Nigerian requirements.",
    155: "Legal research finds and evaluates laws, regulations and legal sources to answer a defined question. It is not the same as giving legal advice or deciding how a rule applies to a person's case.",
    156: "Legal studies examines law, legal institutions and the social situations that lead to laws and regulations. In a sociology project, it can help map how institutions, rights or rules affect a defined social issue; it is not legal practice.",
    157: "Liaising with local authorities means exchanging information with the relevant local or regional public offices. For a development assignment, record whom you contacted, what information was requested and what remains uncertain; do not imply authority to speak for government.",
    158: "Liaising with local authorities means exchanging information with the relevant local or regional public offices. An adviser may use it to confirm local data or explain an analysis to decision-makers, but published evidence may be enough for some tasks.",
    159: "Literature is written work valued for its ideas, expression or form. A media-and-society study may analyse a defined set of literary works when the question concerns representation, adaptation or audience; it is not needed for every media study.",
    160: "Logic studies how to assess whether a conclusion follows from an argument's structure. In philosophical analysis, map the premises and conclusion, then check validity separately from whether the premises are true. This role remains excluded from D078.",
    161: "Maintaining relations with local representatives means keeping clear, appropriate contact with people representing local science, business or civil society. When consultation supports an analysis, record whose perspective was heard and whose was not.",
    162: "Managing a database involves organising data, defining how records relate, and using a database system and query language to retrieve or update information. Research data also need documentation, access controls and privacy safeguards.",
    163: "Managing a government-funded programme can include tracking approved activities, milestones, spending evidence and results against its plan. It does not by itself grant budget, procurement or spending authority.",
    164: "Management consulting is paid advice intended to help an organisation improve its performance or growth. A business-economics researcher may study consulting or its effects, but research does not itself make the learner a consultant or guarantee business results.",
    165: "Market analysis examines a defined market's structure, activity and research evidence. An adviser should state the product, location and period, compare demand and supply evidence, and explain uncertainty rather than recommend an investment by default.",
    166: "Market analysis examines a defined market's structure, activity and research evidence. In local development, it can help identify a sector's constraints and options; it cannot guarantee that an intervention will succeed.",
    167: "Market research gathers and analyses information about customers, products, competitors and a defined market. For a statistical assignment, specify the population and sampling method and report uncertainty; a creative-business example is not automatically a social-science method guide.",
    168: "Marketing analytics uses data to assess how marketing activities perform and where they may improve. Define each measure and data source; an observed return or association does not prove that marketing caused the result.",
    169: "Mathematical modelling represents a real question using variables, relationships or equations so that assumptions and possible outcomes can be examined. For a statistics project, check the model against data and report uncertainty; prediction alone does not prove cause.",
    170: "Mathematical modelling represents an economic question using variables and stated assumptions. For an economic analysis, show the equations, parameter sources and sensitivity to assumptions; use a narrative approach if the evidence cannot support a model.",
    171: "Mathematics studies quantity, structure, space, patterns and change. This broad label is not one single course or automatic prerequisite: learn the specific numeracy, statistics or modelling needed for the chosen research task.",
    172: "Meeting standards of practice in social services means carrying out social-care or social-work duties lawfully, safely and effectively. A researcher working in a service should follow the approved research, safeguarding and confidentiality procedures; research does not make them a social worker.",
    173: "Monitoring a national economy means tracking selected indicators and financial institutions over time. A policy analyst can prepare a dated dashboard or brief, note data revisions and uncertainty, and explain implications without claiming official supervisory authority.",
}


def main() -> None:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = data.get("records") or []
    missing = [row for row in records if not str(row.get("plain_language_meaning") or "").strip()]
    missing_positions = {int(row["queue_position"]) for row in missing}
    if missing_positions != set(MEANINGS):
        raise ValueError(f"Definition coverage mismatch. Missing mappings: {sorted(missing_positions - set(MEANINGS))}; unexpected: {sorted(set(MEANINGS) - missing_positions)}")

    for row in missing:
        position = int(row["queue_position"])
        meaning = MEANINGS[position]
        concept_source = next((source for source in row.get("evidence", []) if str(source.get("source") or "").startswith("ESCO concept:")), None)
        if position == 142:
            basis = {
                "source": "The Open University OpenLearn, Why Study Philosophers?",
                "url": "https://www.open.edu/openlearn/course/view.php?id=7788",
                "locator": "Discussion of philosophers across periods and how their ideas relate to historical and intellectual settings.",
                "supports": "Historical development and contextual interpretation of philosophical ideas.",
                "limits": "The D078 philosophy role is excluded; this definition is retained for the audit contract only.",
                "access_date": "2026-10-15",
            }
        elif concept_source and concept_source.get("url"):
            basis = {
                "source": concept_source.get("source"),
                "url": concept_source.get("url"),
                "locator": f"{concept_source.get('locator') or 'Exact ESCO concept record'}; plain-language explanation paraphrases the attached concept definition.",
                "supports": concept_source.get("supports"),
                "limits": concept_source.get("limits"),
                "access_date": "2026-10-09",
            }
        else:
            raise ValueError(f"No exact concept source for missing meaning at queue position {position}")
        row["plain_language_meaning"] = meaning
        row["plain_language_meaning_evidence"] = basis

    data["coverage"] = data.get("coverage") or {}
    data["coverage"]["remaining_missing_plain_language_meaning"] = 0
    data["coverage"]["plain_language_meanings_repaired_2026_10_15"] = len(missing)
    SOURCE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Filled {len(missing)} missing plain-language meanings with item-level source provenance.")


if __name__ == "__main__":
    main()
