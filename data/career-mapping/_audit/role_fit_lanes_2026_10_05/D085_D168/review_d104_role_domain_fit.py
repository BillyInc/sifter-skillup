"""Exact-key D104 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D104_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D104_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D104 role_key and stored role_description per decision.",
        "supports": "Role-task/material comparison with the parent scope.",
        "limit": "Broad multi-material profiles remain conditional where the task does not identify a ceramics/glass assignment.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URIs retained per role when present in the queue.",
        "supports": "Stored descriptions of tasks actually performed.",
        "limit": "Pages were not independently refetched in this pass; identifiers and subgroup membership are not fit evidence.",
    },
    "ILO_ISCO_CERAMICS_GLASS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 unit groups 7314 Potters and Related Workers; 7315 Glass Makers, Cutters, Grinders and Finishers; 7316 Signwriters, Decorative Painters, Engravers and Etchers.",
        "supports": "Global context for clay forming and glass forming/cutting/grinding/finishing task families.",
        "limit": "Classification context only; unit-group membership does not determine domain fit.",
    },
}

DECISIONS = {
    "Artists and Related Workers, All Other": ("conditional", "Residual artist category with no medium or task specified; the pottery/glass specialization is not established by its own description.", []),
    "Coating, Painting, and Spraying Machine Setters, Operators, and Tenders": ("conditional", "Coats a broad set of materials including glass and ceramics but also cloth, metal, plastic, paper and wood; the linked task does not establish ceramics/glass work for this role record.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Furniture Finishers": ("unsupported_for_domain", "Finishes and refinishes furniture; the task is furniture surface finishing, not pottery, ceramics or glass craft.", []),
    "Glass Blowers, Molders, Benders, and Finishers": ("supported", "Shapes molten glass to patterns; a direct match to glass forming and finishing.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Grinding and Polishing Workers, Hand": ("conditional", "Grinds/polishes objects made from many materials including clay and glass, but also metal, wood, stone and plastic; the profile does not identify which material/task applies.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Molders, Shapers, and Casters, Except Metal and Plastic": ("conditional", "Forms products from clay and glass but also food, plaster, concrete and stone; role-level material assignment is not specified.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Painting, Coating, and Decorating Workers": ("conditional", "Decorates glass and pottery among many unrelated products; the task profile does not identify the material handled in the specific mapping.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Potters, Manufacturing": ("supported", "Operates equipment to process clay into ceramic, pottery and stoneware products; direct ceramics manufacturing.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "Stone Cutters and Carvers, Manufacturing": ("unsupported_for_domain", "Cuts/carves stone; the parent scope concerns clay, porcelain, ceramics and glass rather than stone craft.", []),
    "candle maker": ("unsupported_for_domain", "Moulds wax into candles; the material and product are outside pottery, ceramics and glass.", []),
    "ceramic painter": ("supported", "Creates decorative art directly on ceramic surfaces and objects including tiles, sculptures, tableware and pottery.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "decorative painter": ("conditional", "Creates decoration on varied surfaces including pottery and glass, but also fabric and casings; the task profile does not establish the relevant medium for the mapping.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "glass beveller": ("conditional", "Cuts, assembles and installs flat glass/mirrors, often in architectural frameworks. Glass processing fits the material, but installation/glazing is distinct from the parent’s described craft forming and decorating.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "glass engraver": ("supported", "Engraves lettering and decorative designs onto glass articles; direct glass craft/finishing.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "glass painter": ("supported", "Creates decorative art on glass/crystal objects such as windows, stemware and bottles; direct glass decoration.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "glass-blower": ("supported", "Produces and decorates glass artefacts, including stained glass and architectural/laboratory glass; direct glass craft, including restoration and repair.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "hand brick moulder": ("supported", "Hand-moulds clay mixtures into bricks, pipes and heat-resistant products, then dries and finishes them; brick moulding is expressly named in the parent scope.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "metal engraver": ("unsupported_for_domain", "Engraves designs on metal, not glass or ceramic surfaces; the task belongs to metal engraving.", []),
    "porcelain painter": ("supported", "Creates decorative art on porcelain surfaces and objects such as tiles and pottery; direct ceramics craft.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "pottery and porcelain caster": ("supported", "Casts clay slip in moulds to produce pottery/porcelain, then removes and finishes the cast; direct ceramics manufacturing.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "production potter": ("supported", "Forms clay into pottery, stoneware, earthenware and porcelain by hand or wheel and fires products in kilns; direct ceramics craft.", ["ILO_ISCO_CERAMICS_GLASS"]),
    "sign maker": ("unsupported_for_domain", "Designs, makes and installs signs using varied materials; no ceramics or glass task is specified.", []),
    "sports equipment repair technician": ("unsupported_for_domain", "Repairs varied recreational sports equipment; the task is not pottery, ceramics or glass craft.", []),
    "wood painter": ("unsupported_for_domain", "Creates decorative art on wooden surfaces and objects; the specified medium is wood, outside this ceramics/glass domain.", []),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D104"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D104 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
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
        "domain_id": "D104",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role task/material with the stated pottery, ceramics and glass scope. ISCO/subgroup placement, names and frequency are not fit evidence. Conditional means a matching material appears among multiple possible materials but the actual role material or craft is not established; unsupported means the stated material/task is outside the domain.",
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
            "All 24 exact D104 role keys must match before writing the report.",
            "Mixed-material aggregate occupations remain conditional instead of being assigned to D104 based on possible material overlap.",
            "ILO definitions contextualize glass-forming and clay-forming task families only; they do not determine domain membership.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D104 role-to-parent-domain fit review — 2026-10-05", "",
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
    lines += ["", "ILO ISCO provides international group/task context for glass and clay trades, not a Sifter placement decision. Stored ESCO-linked task text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
