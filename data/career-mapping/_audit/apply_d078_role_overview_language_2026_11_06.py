"""Copy-only D078 role overview refresh from each role's linked task record."""

from __future__ import annotations

import gzip
import hashlib
import json
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"

ROLE_COPY = {
    "anthropologist": (
        "Anthropologists study how people live and organize communities, including their shared beliefs and ways of life (culture). They compare what people say, what researchers observe, language and other records across settings or time. Any explanation depends on which people and settings the study included."
    ),
    "archaeologist": (
        "Archaeologists study past human communities through objects, buildings and other material remains. They record where and how an item was found before interpreting what it may show about past life. Site access, permissions and preservation needs shape this work."
    ),
    "behavioural-scientist": (
        "Behavioural scientists study how people act in social settings. They may observe actions or measure responses, compare situations and explain how context relates to a pattern. A pattern does not, by itself, reveal a person's motive or establish what every person will do."
    ),
    "business-economics-researcher": (
        "Business economics researchers study how economic conditions—such as prices, jobs and customer demand—relate to organisations, markets and business plans. They examine relevant information to explain an industry's or company's position and what changes may mean for its choices. Findings depend on the question, evidence and time period studied."
    ),
    "criminologist": (
        "Criminologists study crime, justice and the conditions around them. They compare evidence about social circumstances and psychological factors (thoughts and behaviour) to understand patterns and consider possible responses. Research about patterns does not determine an individual's guilt or, by itself, diagnose a health condition."
    ),
    "demographer": (
        "Demographers study a population: the people living in a place or belonging to a group, their characteristics and how their numbers change. They examine births, deaths, age and people moving into or out of a place. A population projection is a calculated possible future based on stated choices about these changes, not a guaranteed forecast."
    ),
    "economic-adviser": (
        "Economic advisers interpret economic information for an organisation or decision-maker and explain what it may mean for a choice. They may compare options involving trade, finance, public spending or business activity and describe possible outcomes. Advice depends on available evidence and conditions; it cannot guarantee a particular result."
    ),
    "economic-development-coordinator": (
        "Economic development coordinators help organize initiatives intended to improve local economic conditions. They may research local jobs, businesses or services, bring organisations together and track whether agreed activities are carried out and what changes follow. Their work supports coordination; results also depend on the participating organisations and local setting."
    ),
    "economic-policy-officer": (
        "Economic policy officers examine economic conditions and options for public decisions or programmes. They may review evidence about trade, jobs, prices or business activity, contribute analysis to a proposal and track how it is carried out. Public policy means decisions or programmes governments use to address an issue; officers inform decisions but do not make them on a government's behalf."
    ),
    "economist": (
        "Economists study choices about resources, production and trade, and how those choices affect prices, work and public decisions. They examine economic information and use economic models—simplified descriptions of how parts of an economy may interact—to analyse patterns or estimate possible changes. An estimate depends on the evidence and choices built into the model."
    ),
    "genealogist": (
        "Genealogists research family histories by tracing relatives and life events through records and interviews. They compare sources when dates or identities conflict and document why a family connection is supported. A family tree or written history presents the evidence followed; it does not make an uncertain relationship certain."
    ),
    "geographer": (
        "In this social-science route, geographers study how people and places relate: where people live or move, how services and opportunities vary by location, and how those patterns change. They may compare maps, counts and information gathered in places. A location pattern shows where something occurs; other evidence is needed to explain why."
    ),
    "media-scientist": (
        "Media scientists study how media formats, organisations and people's use of media relate to society. They may document what people watch, read or share and compare audience responses with the media available. A study describes the people and media it examined; it may not represent every audience or establish what caused a response."
    ),
    "political-scientist": (
        "Political scientists study how political systems organize authority, decisions and participation. They examine institutions (organizations and rules such as legislatures or elections), events, documents, people's views on public issues or other evidence to explain political processes. Findings depend on the time, place and evidence studied."
    ),
    "social-work-researcher": (
        "Social-work researchers study social issues and how support services are planned and used. They may plan a study, gather interview or questionnaire responses, examine what people report and write findings that can inform services or public policy (government decisions and programmes). The research describes its participants and setting; it does not by itself show that a service works for everyone."
    ),
    "sociologist": (
        "Sociologists study how people interact and organize into groups, communities and institutions (lasting arrangements such as families, schools and governments). They use interviews, observations, documents or numerical records to explain patterns and social change. Findings describe the settings studied and should not be applied to every community without supporting evidence."
    ),
    "statistician": (
        "Statisticians plan how to collect or compare number-based information, such as counts, percentages or survey scores, and apply mathematical methods to summarize patterns or estimate relationships. An estimate is a calculated approximation; uncertainty describes how much it may vary with different information or methods. Statisticians explain the choices and limits behind results so decisions are not based on numbers alone."
    ),
    "tax-policy-analyst": (
        "Tax policy analysts examine tax rules, financial records and proposals for changing how tax is collected. They estimate possible effects on government income, who pays or benefits, and how the rules could be put into practice. These estimates depend on stated conditions; actual results also depend on people's responses and how the policy is carried out."
    ),
    "thanatology-researcher": (
        "Thanatology is the study of death and dying. A thanatology researcher asks a defined social question (about relationships or communities), cultural question (about shared beliefs and practices) or psychological question (about thoughts, feelings or behaviour) concerning death, dying, grief or related practices. Because these subjects can be sensitive, the question, care for people taking part and handling of information need attention."
    ),
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    before_hash = digest(GRAPH)
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    original_node_ids = [node["id"] for node in graph["nodes"]]
    original_edge_ids = [edge.get("id") for edge in graph["edges"]]
    nodes_by_id = {node["id"]: node for node in graph["nodes"]}
    tasks = {
        node["id"].rsplit(":", 1)[1]: node
        for node in graph["nodes"]
        if node.get("kind") == "role_task_family" and node.get("id", "").startswith("role-task:d078:")
    }
    if set(tasks) != set(ROLE_COPY):
        raise SystemExit(f"Role/task scope mismatch: missing={sorted(set(ROLE_COPY)-set(tasks))}, extra={sorted(set(tasks)-set(ROLE_COPY))}")

    updated_role_ids: list[str] = []
    for slug, task in tasks.items():
        matches = [
            node for node in graph["nodes"]
            if node.get("kind") == "role" and node.get("id", "").endswith(f":{slug}")
        ]
        if len(matches) != 1:
            raise SystemExit(f"Expected one role node for {slug}, found {len(matches)}")
        role = matches[0]
        summary = ROLE_COPY[slug]
        role["description"] = summary
        role["overview"] = summary

        source_refs: list[dict] = []
        for item in task.get("source_references", []):
            if not isinstance(item, dict):
                continue
            source_refs.append({
                "source_id": item.get("id") or item.get("source_id"),
                "title": "ESCO occupation profile associated with this role",
                "url": item.get("url"),
                "locator": item.get("locator"),
                "source_role": "role_summary_basis",
                "supports": "The profile supports this plain-language summary of the role's documented work. This summary does not add a qualification, universal duty or job-readiness claim.",
            })
        prior_refs = [
            item for item in role.get("source_references", [])
            if not isinstance(item, dict) or item.get("source_role") != "role_summary_basis"
        ]
        role["source_references"] = [*prior_refs, *source_refs]
        updated_role_ids.append(role["id"])

    if original_node_ids != [node["id"] for node in graph["nodes"]] or original_edge_ids != [edge.get("id") for edge in graph["edges"]]:
        raise SystemExit("Copy update changed graph nodes, edges or identifiers")
    if digest(GRAPH) != before_hash:
        raise SystemExit("Graph changed while preparing role copy; refusing to overwrite concurrent work")

    json_bytes = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=GRAPH.parent, delete=False) as f_json:
        json_temp = Path(f_json.name)
        f_json.write(json_bytes)
    with tempfile.NamedTemporaryFile(dir=GRAPH_GZ.parent, delete=False) as f_gz:
        gz_temp = Path(f_gz.name)
    try:
        with gzip.open(gz_temp, "wt", encoding="utf-8", newline="") as target:
            json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))
        if digest(GRAPH) != before_hash:
            raise SystemExit("Graph changed before role copy could be saved; refusing to overwrite concurrent work")
        os.replace(json_temp, GRAPH)
        os.replace(gz_temp, GRAPH_GZ)
    finally:
        json_temp.unlink(missing_ok=True)
        gz_temp.unlink(missing_ok=True)

    print(json.dumps({
        "role_overviews_updated": len(updated_role_ids),
        "role_ids": sorted(updated_role_ids),
        "role_source_refs_attached": sum(len(nodes_by_id[role_id].get("source_references", [])) for role_id in updated_role_ids),
        "node_count": len(original_node_ids),
        "edge_count": len(original_edge_ids),
        "structure_unchanged": True,
        "graph_sha256": digest(GRAPH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
