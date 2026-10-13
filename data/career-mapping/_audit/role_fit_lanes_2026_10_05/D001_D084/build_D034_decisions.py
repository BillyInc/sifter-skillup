"""Build the D034 role-to-parent-domain register from task text only.

This is a transparent evidence triage for Supply Chain Management, not a title,
ISCO-subgroup, or current-placement classifier. Every rule is anchored in the
role's stored occupational task description; unmatched rows fail closed.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D034_role_domain_fit_2026_10_05.json"
CSCMP = "https://cscmp.org/CSCMP/cscmp/educate/scm_definitions_and_glossary_of_terms.aspx"

GOODS = re.compile(r"\b(goods?|products?|materials?|supplies|cargo|freight|shipments?|stock|inventory|warehous\w*|orders?|commodit\w*|consignment\w*|containers?|wholesale|distribution|sourcing|procurement|customs|import|export|supply chain|logistics|vessel and its cargo|dangerous goods)\b", re.I)
TRANSPORT = re.compile(r"\b(transport\w*|traffic|route\w*|dispatch\w*|airport|aircraft|rail\w*|road\w*|tram|taxi|bus|passenger\w*|bridge operator|flight\w*|vessel\w*|port\w*|pipeline\w*)\b", re.I)
PROCESS = re.compile(r"\b(plan\w*|manag\w*|coordinat\w*|organis\w*|organiz\w*|direct\w*|control\w*|monitor\w*|schedule\w*|distribut\w*|store\w*|source\w*|procur\w*|ship\w*|handl\w*|track\w*|deliver\w*|dispatch\w*|clear\w*|receiv\w*|inspect\w*|advise\w*|recommend\w*|forward\w*|represent\w*|trade\w*|conclud\w*|buy\w*|approv\w*|deny\w*|facilitat\w*|locat\w*|negotia\w*)\b", re.I)
DIRECT_LOGISTICS = re.compile(r"\b(supply chain|logistics|freight|cargo|warehous\w*|inventory|stock level\w*|customs clearance|passage of goods through customs|customs.{0,30}cargo|goods.{0,30}distribution|distribution of (?:goods|products|materials|supplies|commodit\w*)|distribution managers? plan|forwarding operations|shipment\w*|sourcing and procurement|sourcing involves.{0,80}suppliers|acquisition of raw materials|transport of dangerous goods|transport energy in the form of.{0,40}natural gas|flow of natural gas|pipeline.{0,30}transport|transporting goods via pipeline|shipments? by rail|loading plans? for.{0,30}flight|vessel and its cargo|import and export goods|buying goods|store and distribute products|reception and storage of raw materials|moving services|express shipped by bus)\b", re.I)


def decide(task: str) -> tuple[str, str, str]:
    """Return (status, reason, limitation), refusing to infer from a role title."""
    task = " ".join(task.split())
    goods = GOODS.search(task) is not None
    transport = TRANSPORT.search(task) is not None
    action = PROCESS.search(task) is not None
    if DIRECT_LOGISTICS.search(task) and action:
        matched = DIRECT_LOGISTICS.search(task).group(0)
        return (
            "supported",
            f"The task explicitly names '{matched}' and describes an action on that flow. This is a direct supply-chain/logistics function under the CSCMP scope.",
            "The task profile supports this described function, not every incumbent's assignment, licensure, or labour-market demand.",
        )
    if goods and action:
        # A goods mention alone is insufficient. Require an explicit logistics
        # process; commercial trade and broad cross-border administration stay
        # conditional unless the task text names the goods-flow function.
        if transport:
            return (
                "conditional",
                "The task includes transport/operations work and goods-related context, but the stored profile does not establish that the role owns freight, cargo, inventory, sourcing, or distribution rather than passenger/service operations. Include only where that supply-chain responsibility is explicit.",
                "The boundary follows the distinction between supply-chain logistics and transport operations; do not infer cargo responsibility from the role title.",
            )
        return (
            "conditional",
            "The task mentions goods or trade, but does not explicitly establish ownership of a supply-chain process. Include only where documented duties cover sourcing, procurement, storage, freight, inventory, customs, or physical distribution.",
            "A sector/product association, trading activity, or cross-border administration alone does not establish a supply-chain role.",
        )
    if transport and action:
        return (
            "unsupported",
            "The described work concerns transport or infrastructure operations without an evidenced goods-flow, freight, cargo, sourcing, procurement, warehousing, or inventory responsibility. It belongs outside this supply-chain mapping on the available task evidence.",
            "A transport-related title or operating context does not establish a supply-chain task; adjacent transportation-operation paths are not imported into this domain.",
        )
    if not task or len(task) < 60:
        return (
            "unresolved",
            "The stored task text is too sparse to establish a supply-chain function. No fit is inferred from the role title or subgroup.",
            "Requires a fuller authoritative task profile before a supported/unsupported decision.",
        )
    return (
        "unsupported",
        "The described task does not establish sourcing/procurement, conversion coordination, logistics, freight/cargo, warehousing, inventory, or goods distribution within the parent supply-chain scope.",
        "This is a task-scope exclusion only; it does not assert that the occupation is never used in a supply-chain employer or assignment.",
    )


def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"):
        code = ref[5:].split("@", 1)[0]
        return "https://www.onetonline.org/link/summary/" + code
    if ref.startswith("URL:"):
        return ref[4:].split("@", 1)[0]
    return None


def main() -> None:
    data = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in data["role_mappings"] if row["domain_id"] == "D034"]
    if len(rows) != 157 or {row["domain_name"] for row in rows} != {"Supply Chain Management"}:
        raise SystemExit("D034 exact-key queue changed; stop and reconcile before materializing")
    decisions = []
    for row in rows:
        task = row.get("role_task_text") or ""
        status, basis, limitation = decide(task)
        refs = list(dict.fromkeys(source_url(ref) for ref in row["task_source_refs"] if source_url(ref)))
        if not refs:
            status = "unresolved"
            basis = "No joined occupational source URL is available for the stored task description; no role fit is inferred."
            limitation = "Attach/verify a role-specific occupational source before disposition."
        else:
            refs.append(CSCMP)
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": task,
            "basis": basis,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": limitation,
        })
    counts = Counter(item["domain_fit_status"] for item in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D034",
        "domain_name": "Supply Chain Management",
        "scope": "D034 only; exact task fit to parent Supply Chain Management domain. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Read the joined role task text, then test whether it establishes goods sourcing/procurement, conversion coordination, logistics, freight/cargo, storage/inventory, or distribution. Passenger transport/infrastructure operations without goods-flow duties are not counted as supply-chain fit. ISCO subgroup, title similarity, and current placement are not evidence. Unmatched sparse tasks fail closed.",
        "scope_source": CSCMP,
        "source_limit_policy": "CSCMP provides a professional scope definition, while ESCO/O*NET task profiles identify the described occupation. Neither is treated as proof of universal licensing, labour demand, or every incumbent's actual duties.",
        "counts": {"reviewed_role_mappings": len(decisions), **{key: counts.get(key, 0) for key in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
