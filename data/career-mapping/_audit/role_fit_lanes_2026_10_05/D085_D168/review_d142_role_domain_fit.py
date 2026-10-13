import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D142_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D142_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D142 role_key and task description for each mapping.", "supports": "The actual biological, computational, ecological and environmental tasks evaluated against the bioinformatics/computational-biology scope.", "limit": "The queue is the audited record, not independent evidence that a role uses computational methods."},
    "NCBI_BIOINFORMATICS": {"publisher": "U.S. National Center for Biotechnology Information (NCBI), National Library of Medicine", "url": "https://www.ncbi.nlm.nih.gov/books/NBK470040/", "locator": "NCBI Handbook glossary definition: computational approaches for collection, storage, manipulation and analysis of biological data; links computer science, biology, genetics/genomics, statistics, mathematics and engineering.", "supports": "The domain boundary: computation applied to biological data to make discoveries/predictions.", "limit": "A field definition does not imply that every biologist or analyst performs bioinformatics."},
    "NCBI_COMPUTATIONAL_BIOLOGY_MESH": {"publisher": "U.S. National Library of Medicine (NLM), Medical Subject Headings (MeSH)", "url": "https://www.ncbi.nlm.nih.gov/mesh/68019295", "locator": "Computational Biology descriptor: development/use of techniques to collect and manipulate biological data and make discoveries/predictions; includes computational methods for biological problems.", "supports": "Distinguishing computational biology from biology/environmental work without a computational method described.", "limit": "MeSH is a subject classification, not an occupational standard."},
    "NIGMS_BIOINFORMATICS_PROGRAM": {"publisher": "U.S. National Institute of General Medical Sciences (NIGMS), NIH", "url": "https://www.nigms.nih.gov/about/overview/BBCB/bioinfocomp/Pages/progdescription", "locator": "Program description: computational tools/algorithms to collect, manage, analyze, visualize and interpret complex biomedical data across genomics, metagenomics, transcriptomics, proteomics, metabolomics and multi-omics.", "supports": "Computational life-science and omics-data context.", "limit": "NIH programme scope is biomedical-focused; it is not a global occupational or market definition."},
}

SUPPORTED = {"bioinformatics scientist": "The task explicitly analyzes biological processes with computer programs, builds/maintains biological databases and analyzes biological data; this is the defining bioinformatics work in NCBI/NIGMS descriptions."}
CONDITIONAL = {
    "aquaculture biologist": "Researches aquatic organisms and their interactions; computational biology could support such research, but this record does not say that computational data analysis is used.",
    "biochemist": "Studies chemical reactions in living organisms; computational analysis may support the work, but no computational method is stated.",
    "biologist": "Researches organisms, interactions and evolution; the task is biological, but does not specify computational biology or biological-data analysis.",
    "biophysicist": "Uses physics to study living systems and biological phenomena; it can intersect computational biology, but the recorded work does not establish computational methods.",
    "botanist": "Conducts plant studies and botanical-garden work; computational plant biology is possible, but the profile does not state it.",
    "ecologist": "Assesses organisms and their environments and conducts specialist research; data-intensive computational ecology is possible but not explicit in the record.",
    "epidemiologist": "Studies disease origins/spread and prevention; computational epidemiology is plausible, but the task description does not specify computational models or biological-data analysis.",
    "food biotechnologist": "Studies food biological processes and pathogens; computational biotechnology could apply, but the described duties do not establish computational methods.",
    "geneticist": "Studies genes, inheritance and genetic conditions; genomics frequently uses bioinformatics, but the recorded task does not state computational analysis or tools.",
    "immunologist": "Researches immune systems and disease; computational immunology is possible, but no computational work is identified in this record.",
    "marine biologist": "Studies marine organisms and ecosystems; computational methods may support the research, but they are not specified in the role task.",
    "mathematician": "May contribute mathematics to computational biology, but the generic role description does not identify biology, bioinformatics or biological applications.",
    "microbiologist": "Studies microorganisms and may work in areas relevant to biological data analysis; this record emphasizes organism study/diagnosis without specifying computational methods.",
    "physiologist": "Studies how living systems function; computational physiology is possible, but the profile does not establish computational analysis.",
    "statistician": "Can analyze biological datasets, but the task profile spans health, finance, business and many other fields and does not identify a biological application.",
    "toxicologist": "Studies effects of substances on organisms and health/environment; computational toxicology is possible, but not stated in the duties provided.",
    "animal behaviourist": "Studies and assesses animal behavior; computational behavior analysis is possible, but this record describes observation and management without biological-data computation.",
}
UNSUPPORTED = {
    "air pollution analyst": "Tests air pollution and identifies pollution sources; this is environmental monitoring, not computational biology as described.",
    "airport environment officer": "Monitors airport emissions, contamination and wildlife attractors for environmental compliance; computational biological-data analysis is not stated.",
    "animal feed nutritionist": "Analyzes feed nutrition and advises agricultural/zoological staff; this is animal nutrition rather than bioinformatics/computational biology.",
    "aquaculture environmental analyst": "Monitors and controls environmental conditions affecting aquaculture; the task is environmental management and does not specify computational biological research.",
    "botanicals specialist": "Supports botanical ingredients and beverage production processes; no computational-biology task is stated.",
    "conservation scientist": "Manages forests, parks and natural resources through field conservation work; this is conservation practice, not the domain's computational biology scope.",
    "countryside officer": "Manages natural spaces, public access and conservation awareness; not computational biology as described.",
    "curator of horticulture": "Maintains botanical collections, exhibits and landscapes; the task is horticultural collection management without computational-biology work.",
    "environmental programme coordinator": "Coordinates institutional sustainability, inspections and compliance programmes; not biological computation.",
    "environmental scientist": "Analyzes environmental samples, hazards, policy and waste/water issues; the task is environmental science and does not specify computational biology.",
    "environmental technician": "Samples and tests environmental media for pollution and protection plans; this is environmental monitoring, not the target domain.",
    "groundwater monitoring technician": "Collects groundwater samples, tests pollution and maintains monitoring equipment; no computational biological-data work is stated.",
    "metrologist": "Develops general measurement systems, units and methods across science; no biological-computation application is stated.",
    "natural resources consultant": "Advises companies/governments on fauna, flora, soil and water resource management; this is resource management rather than computational biology.",
    "nature conservation officer": "Manages local habitats and conservation projects and educates the public; not computational biology as described.",
    "pipeline environmental project manager": "Manages environmental safeguards for pipeline routes and projects; no biological computation is specified.",
    "soil scientist": "Studies soil quality, surveying, irrigation, erosion and restoration; computational biology is not part of the recorded task.",
    "water quality analyst": "Samples/tests water and develops purification procedures for safe use; this is water-quality science, not computational biology as described.",
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D142"]
    names = [row["role_name"] for row in rows]
    all_decisions = set(SUPPORTED) | set(CONDITIONAL) | set(UNSUPPORTED)
    if len(rows) != 36 or len(names) != len(set(names)) or set(names) != all_decisions:
        raise SystemExit(f"D142 exact queue mismatch: queued={sorted(names)} decided={sorted(all_decisions)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        name = row["role_name"]
        if name in SUPPORTED:
            fit, rationale = "supported", SUPPORTED[name]
        elif name in CONDITIONAL:
            fit, rationale = "conditional", CONDITIONAL[name]
        else:
            fit, rationale = "unsupported_for_domain", UNSUPPORTED[name]
        decisions.append({"role_key": row["role_key"], "role_name": name, "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "NCBI_BIOINFORMATICS", "NCBI_COMPUTATIONAL_BIOLOGY_MESH", "NIGMS_BIOINFORMATICS_PROGRAM"]})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D142", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Use the source domain scope and authoritative definitions: bioinformatics/computational biology requires computation applied to biological data or biological questions. Direct computational biological work is supported; biology occupations whose supplied task profile does not establish computational methods are conditional; environmental/conservation/measurement occupations outside that scope are unsupported. Do not infer computation merely because a role studies living things or may use data.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 36 exact D142 queue mappings were reviewed. Only the bioinformatics scientist record explicitly describes biological computation; related biological occupations remain conditional unless this role's task evidence establishes computational work.", "NCBI/NLM and NIH define the domain boundary; they do not establish role-to-domain links by title. No inference was made from subgroup membership.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D142 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
