"""Exact-key D108 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D108_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D108_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D108 role_key and role_description for each decision.",
        "supports": "The task performed by each printing, prepress, reprographics or finishing role.",
        "limit": "A local queue records mapped task profiles; it is not an independent occupational authority.",
    },
    "ESCO_OCCUPATION_PROFILES": {
        "publisher": "European Commission, ESCO",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URIs retained on each queued role record.",
        "supports": "Standardized occupation concepts and associated task descriptions.",
        "limit": "ESCO classification and the cached descriptions do not automatically establish fit to this custom parent domain.",
    },
    "ILO_ISCO08_PRINTING": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 Unit Groups 7321–7323, PDF pp. 297–299: pre-press technicians; printers including digital, flexographic, gravure and screen printing; and print finishing/binding including folding, sewing, embellishing and reproduction.",
        "supports": "Authoritative international task context for core prepress, press operation and print finishing occupations.",
        "limit": "Classification context only. The actual role task is compared with D108's stated printing/prepress/finishing scope; occupational codes do not determine the outcome.",
    },
}

DECISIONS = {
    "bindery operator": ("supported", "Operates binding machinery to turn printed or unprinted paper into bound volumes; direct print finishing/binding."),
    "book restorer": ("unsupported_for_domain", "Evaluates and conserves books for historic, aesthetic and scientific preservation. The task is conservation/restoration, not creating prepress files, printing or finishing new printed output."),
    "book-sewing machine operator": ("supported", "Machine-sews paper signatures into a volume; direct binding and print finishing."),
    "digital printer": ("supported", "Operates direct-to-media digital printing equipment; direct print production."),
    "flexographic press operator": ("supported", "Prints onto substrates using flexographic relief plates; direct printing press operation."),
    "gravure press operator": ("supported", "Sets up and operates gravure printing presses and monitors production; direct printing technology."),
    "hot foil operator": ("supported", "Applies metallic foil with heated pressure equipment and monitors printing; direct printed-product embellishment/finishing."),
    "imagesetter": ("supported", "Processes text and images into arranged print sheets/film using phototypesetting; direct prepress preparation."),
    "lithographer": ("supported", "Prepares printing plates from digital or emulsion-based sources; direct prepress/plate-making work."),
    "offset printer": ("supported", "Operates an offset press to transfer inked plate images onto print surfaces; direct printing."),
    "paper embossing press operator": ("supported", "Embosses paper/printed media with a press to create raised or recessed effects; direct print finishing/embellishment."),
    "prepress operator": ("supported", "Creates proofs and checks graphics, colors and content against technical/quality standards before printing; direct prepress."),
    "prepress technician": ("supported", "Formats and composes text and graphics and prepares electronic print processes; direct prepress production."),
    "print folding operator": ("supported", "Operates machinery to fold printed sheets or paper bundles; direct post-press finishing."),
    "print studio supervisor": ("supported", "Supervises teams operating printing, binding and print-finishing equipment; direct production supervision in the domain."),
    "reprographics technician": ("conditional", "Reproduces graphic documents through scanning, photography or digital printing. These are direct print/reproduction processes, but the profile includes document/archive reproduction contexts beyond commercial print production."),
    "scanning operator": ("conditional", "Scans print materials and adjusts scanner controls for resolution; relevant to reprographics/prepress capture, but the task alone does not establish a print-production workflow."),
    "screen making technician": ("supported", "Makes/etches screens used in textile printing; direct preparation of a print-transfer tool. ILO includes screen makers and screen-plate mounters in prepress examples."),
    "screen printer": ("supported", "Sets up, operates and maintains a press that transfers ink through a screen; direct screen printing."),
    "typesetter": ("supported", "Arranges printed text for correctness and visual quality using typesetting software; direct prepress/composition."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D108"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D108 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": fit, "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_PRINTING"],
        })
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(), "domain_id": "D108",
        "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact task to the parent domain's printing technology, prepress and print finishing scope. ISCO/ESCO hierarchy, subgroup, title similarity and frequency are not fit proof. Conditional is used where the task can support print workflow but the description does not establish that context or spans a broader one; unsupported is used where the described work is a distinct adjacent discipline.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": [
            "All 20 D108 role keys and descriptions were compared exactly against the queue before generation.",
            "ILO ISCO-08 group definitions corroborate the task boundary for prepress, printing and finishing; they are not used as a substitute for role-level task evidence.",
            "Book conservation is separated from print production; generic scanning and broad reprographics are conditional absent proof that the task is part of a print-production workflow.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D108 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        why = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {why} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
