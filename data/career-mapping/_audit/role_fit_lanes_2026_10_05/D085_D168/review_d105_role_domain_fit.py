"""Exact-key D105 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D105_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D105_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D105 role keys and task descriptions.",
        "supports": "Actual material, process and product tasks compared with D105's declared craft scope.",
        "limit": "Truncated source descriptions are not completed by guesswork.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact stored occupation URIs retained for the linked profiles.",
        "supports": "Stored role-task descriptions used in each exact mapping decision.",
        "limit": "Pages were not independently refetched here; role labels or taxonomy membership are not fit evidence.",
    },
    "ILO_ISCO_CRAFT_GROUPS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 craft group definitions for textile/fibre and basketry-related handicrafts; use task descriptions, not codes, for decisions.",
        "supports": "International context for craft families using fibres, yarn and basketry materials.",
        "limit": "Classification context only; it does not establish Sifter domain membership.",
    },
}

DECISIONS = {
    "Potters, Manufacturing": ("unsupported_for_domain", "Processes clay into ceramic, pottery and stoneware products; ceramics are outside this fibre/yarn/wicker handicraft domain.", []),
    "artisan papermaker": ("supported", "Forms paper slurry, strains it and dries it by hand or small-scale equipment; artisan papermaking is explicitly named in the parent scope.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "basketmaker": ("supported", "Hand-weaves stiff fibres into baskets, mats and furniture using traditional techniques; directly named by the parent scope.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "brush maker": ("supported", "Assembles brush heads from fibre/bristle materials and handles; brush making is expressly named in the parent scope.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "candle maker": ("unsupported_for_domain", "Moulds wax into candles; this product and material are unrelated to fibre, yarn, wicker or textile craft.", []),
    "carpet handicraft worker": ("supported", "Creates wool/textile carpets and rugs through handcraft processes such as weaving, knotting or tufting; direct carpet and textile craft.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "carpet weaver": ("conditional", "Makes carpet from wool or synthetic textiles but the task says it operates machinery; the parent emphasizes hand techniques and simple craft equipment, and the specific machine/process scale is not stated.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "fishing net maker": ("supported", "Makes, assembles, repairs and maintains net gear using drawings or traditional methods; direct fibre/net craft.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "knitter": ("supported", "Creates textile from yarn through interlocking loops using knitting techniques; direct textile/fibre craft.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "production potter": ("unsupported_for_domain", "Forms and fires clay into pottery and porcelain; this belongs to ceramics, not fibre or textile handicraft.", []),
    "sports equipment repair technician": ("unsupported_for_domain", "Repairs varied recreational sports equipment; the task does not establish fibre, yarn, wicker or textile craft work.", []),
    "toymaker": ("conditional", "Makes handmade toys from varied materials including textile, wood and plastic; textile-craft fit is possible, but the material used in a given role record is not specified.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "weaver": ("supported", "Weaves yarn/fibres on traditional hand-powered looms into fabrics including clothing, home textiles and carpets; direct weaving and textile craft.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "wicker furniture maker": ("supported", "Cuts, bends and weaves rattan or willow into furniture; direct wicker craft expressly within the domain scope.", ["ILO_ISCO_CRAFT_GROUPS"]),
    "woodcarver": ("unsupported_for_domain", "Carves wooden products; wood carving is outside this domain's fibre, yarn, wicker and textile material scope.", []),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D105"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D105 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale, contextual = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *contextual]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D105", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare every exact task/material record against the explicit D105 fibre/yarn/wicker/textile handicraft scope. ISCO/subgroup, title resemblance and frequency are not fit evidence. Conditional means material/task overlap exists but the record does not establish the craft mode or medium; unsupported means the described materials/products are outside the parent scope.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 15 D105 exact role keys are required before generation.", "The D105 scope expressly includes artisan papermakers, brush makers, basket makers, carpet makers, weavers, knitters, wicker furniture makers and toymakers; material/task evidence still controls each decision.", "Production potters, candle making, sports-equipment repair and wood carving do not fit this parent scope.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D105 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Checked-in task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | **{item['domain_fit']}** | {item['rationale']} |")
    lines += ["", "ILO occupational groups provide context only; they do not determine the Sifter mapping. Stored ESCO-linked task text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
