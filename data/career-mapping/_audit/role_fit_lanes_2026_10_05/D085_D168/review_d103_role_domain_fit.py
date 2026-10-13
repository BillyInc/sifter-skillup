"""Exact-key D103 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D103_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D103_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D103 role_key and stored role_description per decision.",
        "supports": "The actual task text compared to the jewellery-making/goldsmithing parent scope.",
        "limit": "Several aggregate retail/trade roles have abbreviated task profiles; no unsupplied jewellery-craft task is inferred.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact stored occupation URIs retained per role when present.",
        "supports": "Stored role-task text used for the per-record comparison.",
        "limit": "Pages were not independently refetched in this pass; identifiers and subgroup membership are not treated as evidence of fit.",
    },
    "WORLDSKILLS_JEWELLERY": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1681/",
        "locator": "Jewellery WSOS: design, manufacture and repair of precious-metal jewellery; fabrication, casting, engraving, polishing and gem-setting as related manufacturing stages.",
        "supports": "International craft context for jewellery production and its specialist sub-tasks.",
        "limit": "WorldSkills occupational standard, not a universal licensing requirement or complete classification of jewellery retail/trade jobs.",
    },
    "ILO_ISCO_7313": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 unit group 7313 Jewellery and Precious Metal Workers; also distinguishes 7311 precision-instrument makers/repairers.",
        "supports": "Global classification context for jewellery/precious-metal craft versus clock/watch precision-instrument tasks.",
        "limit": "Classification context only. Codes and group labels did not determine any disposition.",
    },
}

DECISIONS = {
    "Gem and Diamond Workers": ("conditional", "Fabricates, finishes or evaluates gems/diamonds used in jewellery or industrial tools. Jewellery-related work fits, but the stored profile explicitly spans non-jewellery industrial tooling too.", ["WORLDSKILLS_JEWELLERY"]),
    "Jewelers and Precious Stone and Metal Workers": ("supported", "Designs, fabricates, adjusts, repairs or appraises jewellery made from precious metals and gems; direct parent-domain craft and material fit.", ["WORLDSKILLS_JEWELLERY", "ILO_ISCO_7313"]),
    "Team Assemblers": ("conditional", "The task profile describes generic team assembly of any product/component and does not establish jewellery work; this record's D103 context is plausible but not demonstrated by the task itself.", ["WORLDSKILLS_JEWELLERY"]),
    "clock and watchmaker": ("unsupported_for_domain", "Makes and repairs clocks and watches; the recorded task is horology/precision timekeeping, not jewellery or precious-metal ornament work.", ["ILO_ISCO_7313"]),
    "filigree maker": ("supported", "Solders fine gold/silver beads and threads into decorative jewellery motifs; directly within jewellery craft.", ["WORLDSKILLS_JEWELLERY"]),
    "goldsmith": ("supported", "Designs, manufactures, repairs and appraises jewellery and precious-metal pieces; direct parent-domain work.", ["WORLDSKILLS_JEWELLERY", "ILO_ISCO_7313"]),
    "import export manager in watches and jewellery": ("unsupported_for_domain", "Coordinates cross-border business procedures and parties; the task is trade/logistics management, not jewellery making, repair, gem setting or precious-metal craft.", []),
    "import export specialist in watches and jewellery": ("unsupported_for_domain", "Applies customs, documentation and import/export knowledge to goods; the task is trade compliance, not jewellery craft.", []),
    "jeweller": ("supported", "Fabricates, repairs and finishes jewellery, including models, casting, stonework and metal assembly; direct parent-domain work.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery and watches shop manager": ("unsupported_for_domain", "Manages staff and activities in a specialist retail shop; the task is shop operations, not the jewellery-making or goldsmithing craft defined by this parent.", []),
    "jewellery and watches specialised seller": ("conditional", "Sells, cleans and maintains jewellery/watches in a specialist shop. Product context fits, but the task does not establish the shaping, setting, repair or other craft work defining this domain.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery assembler": ("supported", "Joins jewellery components such as links and clasps to form or repair bracelets, necklaces and earrings; direct jewellery manufacture/repair.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery designer": ("supported", "Designs jewellery using precious metals and stones and participates in the making process; directly within jewellery design and production.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery engraver": ("supported", "Engraves lettering and ornamental designs on jewellery articles using specialist hand tools; direct jewellery craft.", ["WORLDSKILLS_JEWELLERY", "ILO_ISCO_7313"]),
    "jewellery mounter": ("supported", "Builds the jewellery framework that receives precious stones; direct jewellery manufacture and setting preparation.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery polisher": ("supported", "Cleans, polishes and performs minor repairs on finished jewellery; direct finishing/repair work in the jewellery production chain.", ["WORLDSKILLS_JEWELLERY"]),
    "jewellery repairer": ("supported", "Resizes, resets stones, solders and repairs broken jewellery using specialist tools; direct parent-domain repair work.", ["WORLDSKILLS_JEWELLERY"]),
    "precious stone cutter": ("supported", "Cuts and carves diamonds/gemstones to specifications and fabricates them for jewellery; direct gem-work component of the domain.", ["WORLDSKILLS_JEWELLERY"]),
    "precious stone setter": ("supported", "Fits diamonds and gemstones into jewellery settings according to their size, shape and specifications; direct specialist jewellery craft.", ["WORLDSKILLS_JEWELLERY"]),
    "silversmith": ("supported", "Designs, makes, repairs and appraises jewellery using silver and other precious metals; direct parent-domain craft.", ["WORLDSKILLS_JEWELLERY", "ILO_ISCO_7313"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D103"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D103 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale, contextual = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *contextual],
        })
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D103",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact task record with the explicit D103 jewellery-making/goldsmithing scope. ISCO/subgroup membership, title similarity and frequency are identifiers only. Conditional means the recorded role spans or may touch jewellery but does not establish the core craft task; unsupported means the described task is a different occupation outside the domain boundary.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": counts["supported"],
            "conditional": counts["conditional"],
            "unsupported_for_domain": counts["unsupported_for_domain"],
            "unresolved": counts["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "notes": [
            "All 20 exact D103 queue keys must match before this report is written.",
            "Generic team assemblers, gem/diamond workers with industrial-tool work, and specialist sellers remain conditional because task text does not establish the jewellery craft for every case.",
            "WorldSkills Jewellery and ILO ISCO provide task/classification context only; they do not decide Sifter membership.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D103 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Exact role key | Checked-in task description | Fit | Why |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | **{item['domain_fit']}** | {item['rationale']} |")
    lines += ["", "WorldSkills provides international jewellery-craft context; ILO classification context distinguishes jewellers from watch/clock work. Neither source substitutes for the exact task comparison. Stored ESCO/O*NET task text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
