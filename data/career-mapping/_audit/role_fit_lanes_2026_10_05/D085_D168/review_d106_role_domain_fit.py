"""Exact-key D106 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D106_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D106_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D106 role_key and task description for every decision.",
        "supports": "Recorded garment, sewing, patternmaking and upholstery tasks compared to the domain scope.",
        "limit": "A WEF trend/title-only record has no occupational task evidence and is left unresolved.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact stored occupation URIs retained where present.",
        "supports": "Stored task descriptions, not canonical subgroup placement.",
        "limit": "Pages were not independently refetched in this pass.",
    },
    "WORLDSKILLS_FASHION_TECHNOLOGY": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1697/",
        "locator": "Fashion Technology standard: garment design, pattern construction, cutting, manufacture and finishing.",
        "supports": "International task context for garment/pattern/sewing roles.",
        "limit": "Occupational standard benchmark, not a universal legal credential or taxonomy membership rule.",
    },
    "ILO_ISCO_GARMENT_UPHOLSTERY": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 definitions for garment patternmakers, sewing/embroidery workers and upholsterers, including vehicle, rail, aircraft, ship, furniture and mattress upholstery.",
        "supports": "Global task context for garment construction and covered furnishings.",
        "limit": "Classification context only; codes do not determine the fit decisions.",
    },
}

DECISIONS = {
    "Fabric and Apparel Patternmakers": ("supported", "Constructs fabric/apparel patterns and layouts, and may mark/cut fabric; direct patternmaking support to garment production.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "Garment and Related Trades Workers": ("unresolved", "The row is a WEF Future of Jobs trend/title record and contains no task description; the specific occupation or duties cannot be assessed against this domain.", []),
    "Pressers, Textile, Garment, and Related Materials": ("conditional", "Presses or shapes textile/garment articles, but the task description does not specify which items or whether work concerns clothing versus other textile products.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "Sewers, Hand": ("conditional", "Hand-sews, joins or finishes varied manufactured goods and includes weavers/stitchers; the profile does not establish that the linked work is garment or covered-furnishing production.", ["WORLDSKILLS_FASHION_TECHNOLOGY", "ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "Sewing Machine Operators": ("conditional", "Operates sewing machines for garment and non-garment products; the task text explicitly spans contexts beyond the D106 scope.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "Tailors, Dressmakers, and Custom Sewers": ("supported", "Designs, makes, alters, repairs and fits garments; direct garment construction and tailoring.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "aircraft interior technician": ("conditional", "Makes/repairs aircraft seats and carpeting as well as door panels, lighting and entertainment components; only part of this broad aircraft-interior task is covered-furnishing work.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "clothing CAD patternmaker": ("supported", "Creates and modifies apparel patterns/cutting plans and technical files with CAD for clothing manufacture; direct garment patternmaking.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "clothing cutter": ("supported", "Marks, cuts and shapes textile materials to specifications for apparel manufacture; direct garment production.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "clothing product grader": ("supported", "Grades clothing patterns into sizes using charts/software; direct garment pattern and sizing work.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "costume maker": ("supported", "Constructs, sews, adapts, dyes and maintains costumes from sketches/patterns; direct garment construction and tailoring tasks.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "digital prototyper": ("supported", "Digitizes paper patterns and runs clothing-related production machines; directly supports apparel pattern and manufacturing workflows.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "doll maker": ("unsupported_for_domain", "Makes dolls from porcelain, wood or plastic and assembles moulded parts; the described products/materials do not establish garment or covered-furnishing work.", []),
    "dressmaker": ("supported", "Makes, fits, alters and repairs bespoke or hand-made garments from textile and related apparel materials; direct garment making.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "embroiderer": ("supported", "Decorates textile surfaces by hand or machine with stitching for clothing, accessories and home décor; direct textile garment/soft-furnishing craft.", ["WORLDSKILLS_FASHION_TECHNOLOGY", "ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "furniture upholsterer": ("supported", "Fits padding, springs, webbing and covers to furniture; direct covered-furnishing work.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "glove maker": ("supported", "Designs and manufactures technical, sport or fashion gloves; direct apparel/accessory production.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "hide grader": ("unsupported_for_domain", "Grades and trims raw hides/skins; the task is leather-material sorting, not garment making, tailoring or upholstery.", []),
    "marine upholsterer": ("supported", "Manufactures, assembles and repairs boat interiors and covered components; the parent scope explicitly includes upholstered boat seats/covered furnishings.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "mattress maker": ("supported", "Builds mattresses by assembling padding and covers; direct covered-furnishing work.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "milliner": ("supported", "Designs and manufactures hats and headwear; direct clothing/accessory production.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "motor vehicle upholsterer": ("supported", "Makes and installs covered interior components for road vehicles; direct upholstery/covered-furnishing work.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "railway car upholsterer": ("supported", "Makes and installs covered interior components for rail carriages; direct upholstery work, with rail covered seats/furnishings expressly in scope.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "sewing machinist": ("supported", "Machine-sews apparel components and repairs/renovates garments; direct garment construction and repair.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "tailor": ("supported", "Makes, fits, alters and repairs bespoke garments and related headwear; direct tailoring and garment production.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "upholsterer": ("supported", "Pads and covers furniture, panels, fixtures and vehicle parts with textile/leather materials; direct covered-furnishing work.", ["ILO_ISCO_GARMENT_UPHOLSTERY"]),
    "wearing apparel patternmaker": ("supported", "Interprets garment designs and drafts/cuts patterns and prototypes for apparel production; direct patternmaking.", ["WORLDSKILLS_FASHION_TECHNOLOGY"]),
    "wig and hairpiece maker": ("unsupported_for_domain", "Makes and maintains hair prostheses for performance; the described task is hairpiece craft, not garment making or covered furnishings.", []),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D106"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D106 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale, contextual = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *contextual]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D106", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact task description with garment making/tailoring/dressmaking and covered-furnishing scope. ISCO/subgroup, job title and frequency are not fit evidence. Conditional marks roles whose tasks span relevant and out-of-scope products; unresolved means there is no usable task description; unsupported means the described work is outside garment/soft-furnishing production.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 28 exact D106 queue keys must match before the report is generated.", "The WEF Future of Jobs entry remains unresolved because it is a trend/title row without occupation-task content; no duties were inferred.", "The broad machine-operator and sewing records remain conditional where they explicitly cover non-garment products.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D106 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Checked-in task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | **{item['domain_fit']}** | {item['rationale']} |")
    lines += ["", "WorldSkills and ILO sources contextualize garment and upholstery tasks, but do not establish Sifter placement by themselves. Stored ESCO-linked task text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
