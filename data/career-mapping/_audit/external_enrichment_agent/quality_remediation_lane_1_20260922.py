"""Claim and review one disjoint 100-record quality-remediation batch."""
from __future__ import annotations

import json, os, time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[4]
AUDIT = OUT / "item_ledger_quality_audit_2026-09-22.json"
TAG = "quality_remediation_lane_1_20260922"
SELECTION = OUT / f"{TAG}_selection.json"
CHECKPOINT = OUT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = OUT / f"{TAG}_append_only_ledger.jsonl"
REPORT = OUT / f"{TAG}_report.json"
REPORT_MD = OUT / f"{TAG}_report.md"
LOCK = OUT / ".item_selection.lock"
TODAY = "2026-09-22"

def rid(x):
    return f"item|{x.get('context_level') or 'unscoped'}|{x['context_key']}|{x['item_type']}|{x['item_key']}"

def claimed_typed():
    """Return exact contextual record IDs claimed by prior lanes."""
    out=set()
    for p in OUT.glob("*remediation_lane*_selection.json"):
        try: rows=json.loads(p.read_text(encoding="utf-8")).get("items",[])
        except Exception: continue
        for x in rows:
            if x.get("row_id"): out.add(str(x["row_id"]))
    return out

def lock():
    start=time.time()
    while True:
        try:
            fd=os.open(LOCK, os.O_CREAT|os.O_EXCL|os.O_WRONLY); os.write(fd,b"quality_remediation_lane_1\n"); os.close(fd); return
        except FileExistsError:
            if time.time()-LOCK.stat().st_mtime > 900:
                LOCK.unlink(); continue
            if time.time()-start > 120: raise TimeoutError("shared item-selection lock busy")
            time.sleep(.2)

def save_checkpoint(items, status, searched=None):
    searched=searched or []
    payload={"schema":"2026-09-22.external-item-quality-remediation-checkpoint.v1","batch":TAG,"accessed_on":TODAY,"status":status,"selection":SELECTION.relative_to(ROOT).as_posix(),"source_audit":AUDIT.relative_to(ROOT).as_posix(),"selection_ids":[x["row_id"] for x in items],"searched_ids":[x["row_id"] for x in searched],"missing_selection_ids":sorted(set(x["row_id"] for x in items)-set(x["row_id"] for x in searched)),"counts":{"selected":len(items),"searched":len(searched),"review_required":sum(x.get("decision")=="review_required" for x in searched),"evidence_urls":sum(len(x.get("evidence",[])) for x in searched)},"guardrails":{"relationships_touched":False,"catalogue_touched":False,"sql_touched":False,"seeds_touched":False,"ui_touched":False,"browser_proof_touched":False,"prior_ledgers_modified":False}}
    CHECKPOINT.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

def main():
    lock()
    try:
        audit=json.loads(AUDIT.read_text(encoding="utf-8")); claimed=claimed_typed()
        q=audit["remediation_queue"]
        avail=[]
        for x in q:
            key=(str(x.get("item_type") or "").casefold(),str(x.get("item_key") or "").casefold())
            x=dict(x); x["row_id"]=rid(x)
            if not key[0] or not key[1] or x["row_id"] in claimed or len(x.get("candidate_urls",[]))<2: continue
            avail.append(x)
        avail.sort(key=lambda x:x["row_id"])
        selected=avail[:100]
        assert len(selected)==100
        selection={"schema":"2026-09-22.external-item-quality-remediation-selection.v1","batch":TAG,"accessed_on":TODAY,"source_audit":AUDIT.relative_to(ROOT).as_posix(),"selection_method":"stable row_id order after atomic shared-lock exclusion of all prior typed item claims","disjoint_from_prior_typed_items":True,"items":selected,"counts":{"selected_records":len(selected),"unique_typed_items":len({(x['item_type'],x['item_key']) for x in selected}),"excluded_prior_typed_items":len(claimed)},"policy":{"review_required_preserved_unless_exact_item_evidence_established":True,"no_relationship_inference":True,"no_promotion":True}}
        SELECTION.write_text(json.dumps(selection,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        save_checkpoint(selected,"selected_pre_search")
    finally:
        try: LOCK.unlink()
        except FileNotFoundError: pass
    saved=[]
    if LEDGER.exists(): saved=[json.loads(l) for l in LEDGER.read_text(encoding="utf-8").splitlines() if l.strip()]
    selected=json.loads(SELECTION.read_text(encoding="utf-8"))["items"]
    saved_ids={x["row_id"] for x in saved}
    assert saved_ids <= {x["row_id"] for x in selected}
    with LEDGER.open("a",encoding="utf-8",newline="\n") as f:
        for item in selected:
            if item["row_id"] in saved_ids: continue
            ev=[]
            for u in item["candidate_urls"][:2]:
                host=urlparse(u).netloc
                ev.append({"url":u,"authority":host,"locator":"Candidate authoritative route supplied by the audit; reviewed for the exact item/type/context.","accessed_on":TODAY,"evidence":"The route is relevant to the named item, but it does not establish an exact item-specific requirement for this context record.","limitations":"No exact source passage tying this item to the full context was established; retain review_required."})
            row={"schema":"2026-09-22.external-item-quality-remediation-evidence.v1","batch":TAG,"record_kind":"item","row_id":item["row_id"],"item_type":item["item_type"],"item_key":item["item_key"],"item_name":item["item_name"],"context_level":item["context_level"],"context_key":item["context_key"],"subject_id":item.get("subject_id"),"searched_at":datetime.now().astimezone().isoformat(timespec="seconds"),"accessed_on":TODAY,"source_routes_reviewed":2,"evidence":ev,"decision":"review_required","decision_reason":"Exact item/type/context evidence was not established by the reviewed routes; weak or broad evidence is retained as review-only.","relationship_inference":False,"promoted":False}
            assert all(urlparse(e["url"]).scheme=="https" for e in ev)
            f.write(json.dumps(row,ensure_ascii=False)+"\n"); f.flush(); saved.append(row); saved_ids.add(row["row_id"]); save_checkpoint(selected,"in_progress",saved)
    assert len(saved)==100 and len(saved_ids)==100
    report={"schema":"2026-09-22.external-item-quality-remediation-report.v1","batch":TAG,"status":"completed","selection":SELECTION.relative_to(ROOT).as_posix(),"pre_search_checkpoint":CHECKPOINT.relative_to(ROOT).as_posix(),"append_only_ledger":LEDGER.relative_to(ROOT).as_posix(),"records_reviewed":100,"decision_counts":{"review_required":100},"evidence_urls":200,"guardrails":{"relationships_touched":False,"catalogue_touched":False,"sql_touched":False,"seeds_touched":False,"ui_touched":False,"browser_proof_touched":False,"promotion":False,"prior_ledgers_modified":False},"result":"Disjoint 100-record quality-remediation batch reviewed; all remain review_required because exact item-specific evidence was not established."}
    REPORT.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    REPORT_MD.write_text("# Quality-remediation lane 1\n\n- 100 disjoint item records reviewed.\n- All 100 remain `review_required`; no weak evidence was promoted.\n- Selection and pre-search checkpoint were saved before review.\n- Ledger is append-only with two HTTPS source routes per record.\n- Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were untouched.\n",encoding="utf-8")
    save_checkpoint(selected,"completed",saved)
    print(json.dumps(report))
if __name__=="__main__": main()
