"""Build D036 task-based role-to-parent-domain decisions from exact tasks."""
from __future__ import annotations
import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D036_role_domain_fit_2026_10_05.json"
CIPS = "https://1prd-dxp.cips.org/intelligence-hub/procurement/what-is-procurement"
WORLDCC = "https://www.worldcc.com/knowledge-insights/contract-management-standard.html"
PURCHASE = re.compile(r"\b(purchas\w*|buy\w*|procure\w*|sourc\w*|tender\w*|supplier\w*|contract\w*|negotiat\w*|acquisition)\b", re.I)
DIRECT_PROCUREMENT = re.compile(r"(select and purchase.{0,100}(?:suppliers?|tender)|purchase.{0,100}(?:producers?|suppliers?)|buying goods.{0,160}(?:negotiat\w* contract|analys\w* suppliers)|procurement|manage.{0,40}contract lifecycle|contract management|sourcing.{0,80}supplier relationship)", re.I)
EDGE = re.compile(r"\b(broker|intermediary|cross-border business|import and export|import/export|wholesale buyers|sub-sell|resell|trades involving)\b", re.I)

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"): return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@", 1)[0]
    return None

def decide(task: str) -> tuple[str, str, str]:
    task = " ".join((task or "").split())
    direct = DIRECT_PROCUREMENT.search(task)
    if direct:
        quote = task[max(0, direct.start()-50):min(len(task), direct.end()+90)].strip()
        return ("supported", f"The task expressly includes procurement/contract work: “{quote}”. This matches the CIPS procurement cycle (need, sourcing, negotiation, contracting, supplier relationship) or the WorldCC pre-award/award/post-award contract lifecycle.", "Role-task profiles establish representative duties, not a universal licence or that each incumbent handles the whole lifecycle.")
    if EDGE.search(task) and PURCHASE.search(task):
        quote = task[max(0, EDGE.search(task).start()-45):min(len(task), EDGE.search(task).end()+100)].strip()
        return ("conditional", f"The task touches purchasing/trade/contract-adjacent work (“{quote}”), but does not establish responsibility for an organization's procurement cycle or managing contracts through their lifecycle. Include only where that duty is explicit.", "A transaction, intermediary role, customs process, or wholesale sale is not automatically procurement/contract management.")
    if PURCHASE.search(task):
        return ("conditional", "The task mentions buying/suppliers/contracts but does not establish strategic sourcing, tendering, supplier evaluation, negotiation, or post-award contract management. The path is conditional on one of those procurement/contract accountabilities being part of the work.", "The distinction follows CIPS: purchasing can be transactional, while procurement spans sourcing, negotiation, contracts and supplier relationships.")
    if len(task) < 60:
        return ("unresolved", "The task text is too sparse to determine procurement or contract-management accountability; no fit is inferred from title or subgroup.", "Requires a fuller occupational task source.")
    return ("unsupported", "The task description does not establish buying, sourcing, tendering, supplier selection/management, negotiation, or contract-lifecycle responsibilities.", "This is a task-scope exclusion, not a claim that the occupation never encounters contracts or suppliers.")

def main() -> None:
    data = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in data["role_mappings"] if r["domain_id"] == "D036"]
    if len(rows) != 44 or {r["domain_name"] for r in rows} != {"Procurement and Contract Management"}:
        raise SystemExit("D036 exact-key queue changed; reconcile before materializing")
    decisions = []
    for row in rows:
        task = row.get("role_task_text") or ""
        status, basis, limit = decide(task)
        refs = list(dict.fromkeys(source_url(ref) for ref in row["task_source_refs"] if source_url(ref)))
        if not refs:
            status, basis, limit = "unresolved", "No joined role-task source URL is available; no fit is inferred.", "Attach/verify an occupational source before disposition."
        else:
            refs.extend((CIPS, WORLDCC))
        decisions.append({"role_key": row["role_key"], "domain_fit_status": status, "task_evidence": task, "basis": basis, "source_refs": list(dict.fromkeys(refs)), "source_limit": limit})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    out = {
        "schema_version": 1,
        "domain_id": "D036",
        "domain_name": "Procurement and Contract Management",
        "scope": "D036 only; exact task fit to parent Procurement and Contract Management domain. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Separate procurement lifecycle duties (need, sourcing, tendering, supplier selection, negotiation, contracting and supplier management) from distribution/logistics, customs administration, wholesale selling, brokerage and one-off purchasing. Decisions use task descriptions, not role title or subgroup. Sparse task evidence fails closed.",
        "scope_sources": [CIPS, WORLDCC],
        "source_limit_policy": "CIPS and WorldCC provide professional-scope definitions; ESCO/O*NET task profiles identify representative duties. Neither defines a universal legal licence or labour demand.",
        "counts": {"reviewed_role_mappings": len(decisions), **{k: counts.get(k, 0) for k in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": out["counts"]}, ensure_ascii=False))

if __name__ == "__main__": main()
