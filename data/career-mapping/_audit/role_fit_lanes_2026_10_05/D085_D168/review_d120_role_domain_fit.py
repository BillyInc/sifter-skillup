"""Exact-key D120 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D120_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D120_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D120 role_key and task description for every decision.", "supports": "Actual aquaculture production, hatchery, harvest and fishing tasks.", "limit": "Local task descriptions are not an independent authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs retained where available in the queue.", "supports": "Standardized fisheries and aquaculture occupation concepts.", "limit": "Classification membership is not used to infer fit."},
    "ILO_ISCO08_FISHERIES": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 skilled agriculture/fishery occupation definitions for aquaculture workers and fishery workers, including cultivation, harvesting and vessel-based capture tasks.", "supports": "International occupational context for fish farming and capture fisheries.", "limit": "The exact task descriptions, not code membership, determine fit to the D120 parent."},
}

DECISIONS = {
    "aquaculture cage mooring worker": ("supported", "Installs/stabilizes aquaculture cages using specialized mooring equipment; direct infrastructure support to aquatic farming."),
    "aquaculture cage technician": ("supported", "Supports production/grow-out of aquatic organisms in freshwater, brackish and marine cages; direct aquaculture."),
    "aquaculture harvesting technician": ("supported", "Operates and manages equipment for harvesting cultured aquatic organisms; direct aquaculture production."),
    "aquaculture harvesting worker": ("supported", "Harvests aquatic organisms from land-based culture systems; direct aquaculture production."),
    "aquaculture hatchery manager": ("supported", "Plans and manages fish/shellfish breeding and hatchery production; direct fisheries/aquaculture."),
    "aquaculture hatchery technician": ("supported", "Operates hatchery processes from broodstock through juvenile rearing; direct aquaculture."),
    "aquaculture hatchery worker": ("supported", "Assists in raising aquatic organisms during hatchery stages; direct aquaculture production."),
    "aquaculture husbandry technician": ("supported", "Manages feeding and stock husbandry during aquatic grow-out; direct aquaculture."),
    "aquaculture husbandry worker": ("supported", "Assists with rearing and husbandry of cultured aquatic organisms; direct aquaculture."),
    "aquaculture mooring manager": ("supported", "Supervises safe mooring of aquaculture cages and operates relevant equipment; direct farm infrastructure operations."),
    "aquaculture rearing technician": ("supported", "Specializes in rearing, weaning and juvenile production of cultured aquatic organisms; direct aquaculture."),
    "aquaculture recirculation technician": ("supported", "Controls land-based recirculating aquaculture systems and organism production; direct aquaculture systems operation."),
    "deep-sea fishery worker": ("supported", "Catches fish on deep-sea vessels using fishing equipment and prepares catch for delivery; direct capture fisheries."),
    "fisheries boatman": ("supported", "Operates small inshore/coastal fishing boats and performs deck/engine and fish-capture tasks; direct fisheries."),
    "fisheries boatmaster": ("supported", "Navigates coastal fishing vessels and manages capture/preservation operations; direct fisheries."),
    "fisheries master": ("supported", "Plans and directs fishing-vessel navigation and capture work across inshore/offshore waters; direct fisheries operations."),
    "harvest diver": ("supported", "Safely collects marine organisms/resources by diving; direct aquatic-resource harvesting."),
    "on foot aquatic resources collector": ("supported", "Collects shellfish, seaweed, spat and other aquatic resources by hand/shore work; direct fisheries/resource harvesting."),
    "water-based aquaculture technician": ("supported", "Supervises grow-out of cultured organisms in suspended/open-water systems; direct aquaculture."),
    "water-based aquaculture worker": ("supported", "Performs manual grow-out activities for aquatic organisms in suspended water-based systems; direct aquaculture."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D120"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D120 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_FISHERIES"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D120", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact duties with aquatic stock cultivation, hatchery, grow-out and harvesting, and capture-fishery vessel/shore work. ISCO/ESCO group, subgroup, title similarity and frequency are not fit evidence.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 20 exact D120 role keys matched the queue before generation; task text and ESCO URI are preserved per record.", "Aquaculture production support (including cage mooring) is included because the parent explicitly covers fish farms/hatcheries and stable cage production; fishing vessel and shore harvest tasks fit the capture-fisheries component.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D120 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
