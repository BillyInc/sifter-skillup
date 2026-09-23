import json, os, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "data/career-mapping/_audit/external_enrichment_agent"
AUDIT = OUT / "item_ledger_quality_audit_2026-09-22.json"
SELECTION = OUT / "lane_5_item_remediation_selection_2026-09-22.json"
CHECKPOINT = OUT / "lane_5_item_remediation_pre_search_checkpoint_2026-09-22.json"
LOCK = OUT / ".lane_5_claim.lock"

def key(row):
    return "|".join(str(row.get(x) or "") for x in ("context_level", "context_key", "item_type", "item_key"))

def prior():
    found = set()
    for p in OUT.glob("*_selection_2026-09-22.json"):
        if p.name == SELECTION.name:
            continue
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
        for r in d.get("rows", d.get("records", [])):
            found.add(key(r))
    for p in OUT.glob("*_search_ledger_2026-09-22.jsonl"):
        for line in p.read_text(encoding="utf-8").splitlines():
            if line.strip():
                found.add(key(json.loads(line)))
    for p in OUT.glob("*_claims_2026-09-22.jsonl"):
        if p.name == "lane_5_item_remediation_claims_2026-09-22.jsonl":
            continue
        for line in p.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            r = json.loads(line)
            if r.get("contextual_identity"):
                found.add(r["contextual_identity"])
    return found

def main():
    try:
        fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(fd)
    except FileExistsError:
        raise RuntimeError("active lane-5 claim lock exists")
    try:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        claimed = prior()
        rows, seen = [], set(claimed)
        for raw in audit["remediation_queue"]:
            ident = key(raw)
            if ident in seen:
                continue
            seen.add(ident)
            row = dict(raw)
            row["contextual_identity"] = ident
            row["record_type"] = "item"
            row["lane"] = "lane_5"
            rows.append(row)
            if len(rows) == 100:
                break
        if len(rows) != 100:
            raise RuntimeError(f"only {len(rows)} disjoint records available")
        selection = {
            "schema": "2026-09-22.lane-5-item-remediation-selection.v1",
            "lane": "lane_5", "date": "2026-09-22",
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "selection_method": "atomic shared-lock claim; audit-order scan; contextual identity is context level/key plus item type/key",
            "prior_lane_2_to_4_contextual_claim_count": len(claimed),
            "selection_count": 100,
            "disjoint_claim_count": len({r["contextual_identity"] for r in rows}),
            "rows": rows,
            "scope_guard": "Selection/checkpoint only. No relationships, catalogue, SQL, seeds, UI, browser proof, evidence review, ledger, or promotion touched."
        }
        SELECTION.write_text(json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        checkpoint = {
            "schema": "2026-09-22.lane-5-item-remediation-pre-search-checkpoint.v1",
            "lane": "lane_5", "date": "2026-09-22", "status": "selected_search_not_started",
            "selection": SELECTION.relative_to(ROOT).as_posix(),
            "source_audit": AUDIT.relative_to(ROOT).as_posix(),
            "selection_count": 100, "searched_count": 0, "linked_count": 0, "review_required_count": 0,
            "selection_ids": [r["contextual_identity"] for r in rows],
            "written_before_search": True,
            "guardrails": {"relationships": False, "catalogue": False, "sql": False, "seeds": False, "ui": False, "browser_proof": False, "promotion": False},
            "note": "Pre-search checkpoint saved before any source review; no evidence or search ledger has been written."
        }
        CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "count": 100, "prior_claims": len(claimed)}))
    finally:
        LOCK.unlink(missing_ok=True)

if __name__ == "__main__":
    main()
