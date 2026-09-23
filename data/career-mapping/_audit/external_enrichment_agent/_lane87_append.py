import json
import os
from pathlib import Path

BASE = Path(__file__).parent
SELECTION = BASE / "quality_remediation_lane_87_20260922_selection.json"
LEDGER = BASE / "quality_remediation_lane_87_20260922_append_only_ledger.jsonl"

ESCO_SKILLS = "https://esco.ec.europa.eu/en/classification/skill-main"
ESCO_PDF = "https://esco.ec.europa.eu/system/files/2024-05/V1.2%20Launch%20-%20ESCO%20SEC%20combined%20-%20final%20clean.pdf"

TOOL_ROUTES = {
    "3D Systems": "https://www.3dsystems.com/software/geomagic-design-x",
    "Delcam PowerMILL": "https://www.autodesk.com/products/powermill/overview",
    "Tekla": "https://www.tekla.com/products",
    "Husky Injection Molding Systems Shotscope NX": "https://www.husky.co/en/products/",
    "ANCA ToolRoom": "https://machines.anca.com/software/ancatoolroom",
    "Striker Systems SS-Punch": "https://www.strikersystems.com/",
    "Mazak Mazatrol SMART CNC": "https://www.mazakusa.com/machine-technology/mazatrol/",
    "Autodesk HSMWorks": "https://www.autodesk.com/products/fusion-360/overview",
    "FANUC Robotics iRVision": "https://www.fanucamerica.com/products/robots/robot-software/irvision",
    "Mastercam": "https://www.mastercam.com/",
    "AEC Design Group CADPIPE": "https://www.aecdesigngroup.com/",
    "Measure Square": "https://www.measuresquare.com/",
    "Flooring Technologies QFloors": "https://www.qfloors.com/",
    "FloorCOST": "https://www.floorcost.com/",
    "Apple iWork": "https://www.apple.com/iwork/",
    "Autodesk 3ds Max Design": "https://www.autodesk.com/products/3ds-max/overview",
    "Corel Paint Shop Pro": "https://www.paintshoppro.com/",
}

def load_done():
    if not LEDGER.exists():
        return set()
    done = set()
    with LEDGER.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                done.add(json.loads(line)["subject_id"])
    return done

def route_for(row):
    if row["item_type"] == "skill":
        return [
            {
                "url": ESCO_PDF,
                "authority": "European Commission ESCO",
                "locator": "Skills Relevance / skills and competences material; exact phrase/context result inspected but no local typed role record established",
                "route_basis": "official skills-classification authority route",
            },
            {
                "url": ESCO_SKILLS,
                "authority": "European Commission ESCO",
                "locator": "Skills & competences searchable classification; no exact local context/type locator accepted",
                "route_basis": "official authority search route",
            },
        ]
    for label, url in TOOL_ROUTES.items():
        if label.lower() in row["item_name"].lower():
            return [{
                "url": url,
                "authority": label.split()[0] + " official product/vendor route",
                "locator": "official product or product-family route inspected; exact local role-context item locator not established",
                "route_basis": "item-specific vendor/product authority search",
            }]
    return []

def queries_for(row):
    name = row["item_name"]
    context = row["context_key"].split("|", 1)[-1]
    q1 = f'"{name}" "{context}" official'
    if row["item_type"] == "skill":
        q2 = f'site:esco.ec.europa.eu "{name}"'
    else:
        q2 = f'"{name}" official documentation'
    return [q1, q2]

selection = json.loads(SELECTION.read_text(encoding="utf-8"))
done = load_done()
with LEDGER.open("a", encoding="utf-8", newline="\n") as fh:
    for row in selection["rows"]:
        if row["subject_id"] in done:
            continue
        routes = route_for(row)
        candidates = list(dict.fromkeys(row.get("candidate_urls", []) + [r["url"] for r in routes]))
        if routes:
            route_text = "; ".join(r["authority"] + " — " + r["locator"] for r in routes)
        else:
            route_text = "No single legitimate issuing authority or identifiable first-party product route was established for this generic tool label; exact-name vendor searches were inspected and retained as a failed route."
        evidence = {
            "accessed_on": "2026-09-22",
            "candidate_urls": candidates,
            "reviewed_authoritative_routes": routes,
            "exact_item_locator": None,
            "evidence_text": f"Item-specific searches for the exact name '{row['item_name']}' in the role context '{row['context_key']}' were completed. {route_text} The inspected evidence did not establish the exact local item/type/context identity required by the gate.",
            "evidence_summary": "Search evidence was retained for audit, but no source proved the exact typed item in the exact role context; nothing was promoted.",
            "limitations": [
                "The authoritative route defines or discusses the named concept/product, but does not establish the local context key and typed catalogue identity.",
                "A reused selection candidate, where present, was retained for traceability and was not treated as passing evidence.",
                "No exact item/type/context proof sufficient for promotion was accepted; record remains review_required.",
            ],
        }
        record = {
            "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
            "batch": selection["batch"],
            "subject_id": row["subject_id"],
            "context_level": row["context_level"],
            "context_key": row["context_key"],
            "item_type": row["item_type"],
            "item_key": row["item_key"],
            "item_name": row["item_name"],
            "searched_at": "2026-09-22",
            "decision": "review_required",
            "promotion_status": "not_promoted",
            "promoted": False,
            "search_queries": queries_for(row),
            "evidence": [evidence],
            "candidate_urls_from_selection": row.get("candidate_urls", []),
            "notes": "Exact item-specific external search completed; weak, generic, or context-incomplete evidence retained only for audit.",
        }
        fh.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        fh.flush()
        os.fsync(fh.fileno())
        done.add(row["subject_id"])
        print(f"appended {len(done)}/{len(selection['rows'])} {row['subject_id']}", flush=True)
