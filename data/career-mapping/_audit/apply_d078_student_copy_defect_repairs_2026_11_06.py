"""Repair verified D078 copy defects without changing graph placement or routes."""

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
TARGET_ID = "domain-item:d078-jasp-tool"
SOURCE_ID = "src:d078-jasp-student-guide-2025"
SOURCE = {
    "title": "Statistical Analysis in JASP: A Guide for Students (2025)",
    "publisher": "JASP project",
    "url": "https://jasp-stats.org/wp-content/uploads/2025/07/Statistical-Analysis-in-JASP-A-guide-for-students-2025.pdf",
    "supports": "The official guide documents JASP's menu-based workflow and examples for t-tests, ANOVA, regression, contingency tables, and frequentist and Bayesian analyses.",
    "locator": "Analysis menu and corresponding student-guide chapters; supports documented software capabilities, not a recommendation that JASP fits every study.",
    "limits": "A software guide, not independent evidence that an analysis is appropriate for a particular research question or dataset.",
    "accessed": "2026-11-06",
}
AREA_ID = "area:d078-computational-digital-social-science"
ROLE_COPY = {
    "role-item:62:applied-zoology-optional": {
        "meaning": (
            "Applied zoology uses knowledge about animals to answer practical questions about their lives and welfare. "
            "In this Social Behaviour and Interaction route, it is relevant only when the research question explicitly "
            "concerns non-human animal behaviour or welfare; it is not a general method for studying human social behaviour."
        ),
        "contextual_use": (
            "Use this option only when your question explicitly examines non-human animal behaviour, such as how animals "
            "respond to a defined setting. A human-only question does not call for applied zoology. Research involving "
            "animals requires suitable expertise, welfare safeguards and approval from the responsible institution before work begins."
        ),
        "learner_output": (
            "For a learning exercise, prepare a supervised study plan naming the animal behaviour, setting, observation "
            "or recording approach, welfare safeguards, required approval and limits of interpretation. Do not conduct "
            "animal research without required training and approval."
        ),
        "condition": (
            "Use this only when the research question explicitly concerns non-human animal behaviour or welfare. "
            "It does not apply to a human-only question about groups, institutions or communities."
        ),
    },
    "role-item:147:international-commercial-transactions-rules-optional": {
        "meaning": (
            "International commercial transaction rules set agreed delivery responsibilities for buyers and sellers in "
            "cross-border sales. Incoterms are one set of standard trade terms: they specify who handles certain delivery "
            "tasks and costs and when delivery risk passes. They do not set payment terms, transfer ownership, set tariffs "
            "or replace the sales contract."
        ),
        "contextual_use": (
            "When an economic-policy analysis compares cross-border trade costs, these rules can clarify which delivery "
            "tasks, costs and risks are included. A useful output is a comparison table naming the chosen term, edition "
            "and delivery point. This learning does not qualify someone to draft or interpret contracts."
        ),
        "learner_output": (
            "A comparison table that names the trade term, edition and delivery point, and shows which delivery tasks, "
            "costs and risks the rule assigns to each side."
        ),
        "limitations": [
            "These rules do not determine payment terms, transfer of ownership, set tariffs or replace a complete sales contract.",
            "Rules differ by edition; name the edition and delivery place when comparing them.",
            "This is a learning option for trade-related analysis, not training or authority to draft or interpret contracts.",
        ],
    },
    "role-item:154:legal-requirements-in-the-social-sector-essential": {
        "meaning": (
            "Legal requirements in social services are laws and official rules that govern how a service is provided and "
            "how information is handled. Which rules apply depends on the place and the work. For research, check current "
            "local sources with qualified staff; a course about another country's law does not establish Nigerian requirements."
        ),
        "learner_output": (
            "A dated table of legal sources by topic and location for a supervisor or lawyer to check. It is a research "
            "aid, not legal advice."
        ),
        "limitations": [
            "A checklist does not establish compliance or grant professional authority.",
            "In Nigeria, federal and state rules can differ and change; check the current rules for the study's location and date.",
            "One role-list association does not make this knowledge necessary for every social-science study.",
        ],
    },
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_pair(graph: dict, original_hash: str) -> None:
    raw = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=GRAPH.parent, delete=False) as handle:
        json_temp = Path(handle.name)
        handle.write(raw)
    with tempfile.NamedTemporaryFile(dir=GRAPH_GZ.parent, delete=False) as handle:
        gzip_temp = Path(handle.name)
    try:
        with gzip.open(gzip_temp, "wt", encoding="utf-8", newline="") as handle:
            json.dump(graph, handle, ensure_ascii=False, separators=(",", ":"))
        if digest(GRAPH) != original_hash:
            raise SystemExit("Graph changed before save; refusing to overwrite concurrent work")
        os.replace(json_temp, GRAPH)
        os.replace(gzip_temp, GRAPH_GZ)
    finally:
        json_temp.unlink(missing_ok=True)
        gzip_temp.unlink(missing_ok=True)


def main() -> None:
    original_hash = digest(GRAPH)
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    original_node_ids = [node["id"] for node in graph["nodes"]]
    original_edge_ids = [edge.get("id") for edge in graph["edges"]]
    nodes = {node["id"]: node for node in graph["nodes"]}
    item = nodes.get(TARGET_ID)
    if not item:
        raise SystemExit(f"Missing D078 item: {TARGET_ID}")

    item["label"] = "JASP, menu-based software for statistical analysis"
    item["meaning"] = (
        "JASP is menu-based software for statistical analysis. It offers t-tests (compare averages), ANOVA "
        "(compare averages across groups), regression (estimate how results relate to measured factors), and "
        "contingency tables (organize counts by category). Frequentist analyses interpret results against what "
        "repeated samples could produce under stated conditions; Bayesian analyses update stated starting "
        "probabilities using observed data. JASP calculates results; researchers choose a method that fits the "
        "question and data."
    )
    item["contextual_use"] = (
        "To ask whether first-year and final-year students use a campus service differently, you could organize "
        "their yes-or-no answers as counts and compare the pattern between the groups. If you compare "
        "satisfaction ratings instead, another analysis may fit. The question, answer format and study design "
        "guide the choice; a software result alone cannot explain why a difference occurred."
    )
    item["learner_output"] = (
        "A short analysis record naming the question and procedure, describing the data choices and checks, "
        "reporting the result with appropriate uncertainty, and explaining what the result does and does not support."
    )

    for node_id, copy in ROLE_COPY.items():
        node = nodes.get(node_id)
        if not node:
            raise SystemExit(f"Missing D078 role item: {node_id}")
        if "meaning" in copy:
            node["meaning"] = copy["meaning"]
            node["plain_language_meaning"] = copy["meaning"]
            node["what_it_is"] = copy["meaning"]
        if "contextual_use" in copy:
            node["contextual_use"] = copy["contextual_use"]
            node["why_it_matters"] = copy["contextual_use"]
            if "role_application" in node:
                node["role_application"] = copy["contextual_use"]
        if "learner_output" in copy:
            node["learner_output"] = copy["learner_output"]
            node["task_output"] = copy["learner_output"]
        if "limitations" in copy:
            node["limitations"] = copy["limitations"]
        if "condition" in copy:
            requirement_scope = node.get("requirement_scope")
            if not isinstance(requirement_scope, dict) or requirement_scope.get("lane") != "conditional":
                raise SystemExit(f"Unexpected requirement lane for {node_id}; refusing to edit its condition")
            requirement_scope["condition"] = copy["condition"]
            node["requirement_condition"] = copy["condition"]
            contract = node.get("role_item_contract")
            if isinstance(contract, dict):
                contract["plain_language_meaning"] = copy["meaning"]
                contract["role_application"] = copy["contextual_use"]
                contract["requirement_condition"] = copy["condition"]

    area = nodes.get(AREA_ID)
    if not area:
        raise SystemExit(f"Missing D078 area: {AREA_ID}")
    area_description = (
        "Computational and digital social research uses computer-run procedures to study social questions and how "
        "technology shapes society. Researchers can compare online posts, map connections, or simulate what stated "
        "rules might produce. These approaches reveal patterns or possibilities, but do not establish causes on "
        "their own. Findings depend on which records exist and how the analysis was designed and checked. Programming "
        "helps with some tasks, not every route."
    )
    area["description"] = area_description
    area["overview"] = area_description

    registry = graph.setdefault("external_source_registry", {})
    prior_source = registry.get(SOURCE_ID)
    if prior_source and prior_source.get("url") != SOURCE["url"]:
        raise SystemExit(f"Source ID collision: {SOURCE_ID}")
    registry[SOURCE_ID] = SOURCE
    source_ref = {"source_id": SOURCE_ID, **SOURCE, "source_role": "tool_capability_and_learning_resource"}
    refs = [ref for ref in item.get("source_references", []) if ref.get("source_id") != SOURCE_ID]
    item["source_references"] = [*refs, source_ref]
    evidence = [ref for ref in item.get("evidence", []) if ref.get("source_id") != SOURCE_ID]
    item["evidence"] = [*evidence, {"source_id": SOURCE_ID, "exact_locator": SOURCE["locator"], "accessed_on": SOURCE["accessed"]}]

    if original_node_ids != [node["id"] for node in graph["nodes"]] or original_edge_ids != [edge.get("id") for edge in graph["edges"]]:
        raise SystemExit("Copy update changed graph nodes, edges or identifiers")
    if {node_id: (nodes[node_id].get("requirement_lane"), nodes[node_id].get("student_selectable"), nodes[node_id].get("role_owner_ids")) for node_id in ROLE_COPY} != {
        "role-item:62:applied-zoology-optional": ("conditional", True, ["role:D078:9:behavioural-scientist"]),
        "role-item:147:international-commercial-transactions-rules-optional": ("conditional", True, ["role:D078:7:economic-policy-officer"]),
        "role-item:154:legal-requirements-in-the-social-sector-essential": ("conditional", True, ["role:D078:8:social-work-researcher"]),
    }:
        raise SystemExit("Copy update changed an item lane, selectability or role owner")
    if digest(GRAPH) != original_hash:
        raise SystemExit("Graph changed during the update; refusing to overwrite concurrent work")
    write_pair(graph, original_hash)
    print(json.dumps({"updated_nodes": [TARGET_ID, AREA_ID, *ROLE_COPY], "source_id": SOURCE_ID, "node_count": len(original_node_ids), "edge_count": len(original_edge_ids), "structure_unchanged": True, "graph_sha256": digest(GRAPH)}, indent=2))


if __name__ == "__main__":
    main()
