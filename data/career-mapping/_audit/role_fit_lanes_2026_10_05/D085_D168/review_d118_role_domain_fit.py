"""Exact-key D118 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D118_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D118_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D118 role_key and task description for each decision.", "supports": "Actual crop cultivation, horticulture, landscaping, vineyard and farm tasks.", "limit": "Local task profiles are not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs retained where available in the queue.", "supports": "Standardized occupation concepts and task profiles.", "limit": "Classification membership is not used to infer domain fit."},
    "ILO_ISCO08_AGRICULTURE": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 agricultural, horticultural, crop-farm and garden/landscape occupation definitions and task examples.", "supports": "International occupational context for crop production and horticultural work.", "limit": "Classification context only; actual tasks are compared with D118's stated crop and horticulture scope."},
}

DECISIONS = {
    "Agricultural Inspectors": ("conditional", "Inspects agricultural commodities and facilities but also fishery and logging operations. The role overlaps crop-agriculture compliance while spanning sectors outside D118."),
    "Pesticide Handlers, Sprayers, and Applicators, Vegetation": ("supported", "Applies crop/vegetation protection chemicals to crops, trees, shrubs and lawns; direct crop and horticulture production support."),
    "agronomic crop production team leader": ("supported", "Organizes and participates in daily crop-production work; direct crop production."),
    "arboriculturist": ("supported", "Observes, maintains and improves tree health; direct horticultural/arboricultural practice."),
    "crop production manager": ("supported", "Plans and manages crop-production facilities and participates in production; direct crop agriculture."),
    "farm manager": ("conditional", "Manages both animal and crop-producing farms. Crop work fits, but the recorded remit spans livestock beyond the crop/horticulture parent."),
    "fruit and vegetable picker": ("supported", "Harvests fruit, vegetables and nuts; direct crop production."),
    "fruit production team leader": ("supported", "Organizes and participates in fruit-crop production; direct crop agriculture."),
    "garden labourer": ("supported", "Cultivates and maintains flowers, trees and shrubs; direct horticulture."),
    "groundsman/groundswoman": ("supported", "Maintains lawns and planted grounds across facilities and parks; direct landscape horticulture and plant maintenance."),
    "hop farmer": ("supported", "Plants, cultivates and harvests hops as a crop; direct agricultural crop production."),
    "horticulture production manager": ("supported", "Plans and manages production in horticultural enterprises; direct horticultural production."),
    "horticulture production team leader": ("supported", "Organizes and participates in crop/horticulture production; direct horticultural operations."),
    "horticulture worker": ("supported", "Performs practical crop/plant production in nurseries and greenhouses; direct horticulture."),
    "interior landscaper": ("supported", "Designs, installs and maintains indoor plant spaces; direct horticultural planting and maintenance, though typically an applied landscaping setting."),
    "landscape gardener": ("supported", "Plans, builds, renovates and maintains gardens, parks and planted public spaces; direct horticulture/landscape practice."),
    "mixed farmer": ("conditional", "Manages both livestock and crop production. The crop component fits; the mixed animal-production remit extends beyond D118."),
    "tree surgeon": ("supported", "Prunes and maintains trees using climbing/equipment skills; direct arboricultural care within horticulture."),
    "vineyard cellar master": ("conditional", "Manages grapes after they enter the cellar through processing, bottling and distribution. This is closely linked to vineyard output but is post-harvest wine processing rather than crop cultivation."),
    "vineyard machinery operator": ("supported", "Operates specialized equipment for vineyard cultivation and grape production; direct crop-production work."),
    "vineyard manager": ("conditional", "Manages vineyard and, in some cases, winery, administration and marketing. Vineyard cultivation fits; broader winery/commercial duties extend beyond crop production."),
    "vineyard supervisor": ("supported", "Supervises vineyard work and technical grape cultivation, quality and environmental practices; direct crop-production management."),
    "vineyard worker": ("supported", "Cultivates grapevines and may handle grape/wine production or packaging. The crop-cultivation duties fit; the post-harvest portion is beyond crop production but does not displace the direct vineyard work."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D118"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D118 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_AGRICULTURE"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D118", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact duties with crop production, fruit/vegetable cultivation, horticulture and garden/landscape plant work. ISCO/ESCO, subgroup, title similarity and frequency do not establish fit. Conditional marks cross-sector farm/regulatory scope or roles primarily focused on post-harvest wine processing; supported roles have a direct crop/horticulture task fit.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 23 exact D118 keys and task descriptions were reconciled against the queue.", "The boundary includes applied horticulture and landscape planting/maintenance, not only commercial crop farming; this follows the explicit horticulture component in the parent title and scope.", "Mixed livestock/crop management and post-harvest winery work remain conditional rather than being collapsed into crop production.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D118 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
