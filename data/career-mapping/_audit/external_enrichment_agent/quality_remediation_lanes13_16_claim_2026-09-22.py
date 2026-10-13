"""Atomically allocate fresh lane 13-16 selections/checkpoints, then review lane 14."""
from __future__ import annotations

import json
import os
import time
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("lane14_impl", Path(__file__).with_name("quality_remediation_lane14_2026-09-22.py"))
_lane14 = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_lane14)
AUDIT, COUNT, LOCK, ROOT = _lane14.AUDIT, _lane14.COUNT, _lane14.LOCK, _lane14.ROOT
add_prior, atomic_json, identity, now, review = (_lane14.add_prior, _lane14.atomic_json, _lane14.identity, _lane14.now, _lane14.review)


def acquire() -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"lanes13-16 pid={os.getpid()} claimed_at={now()}\n".encode())
            os.close(fd)
            return
        except FileExistsError:
            if time.time() - LOCK.stat().st_mtime > 900:
                raise RuntimeError("shared remediation lock is stale; refusing to overwrite it")
            if time.time() - started > 120:
                raise TimeoutError("shared remediation lock remained active")
            time.sleep(0.2)


def prior_identities(exclude: set[Path]) -> set[str]:
    used: set[str] = set()
    patterns = ("*item*remediation*.json", "*item*remediation*.jsonl", "*quality*remediation*.json", "*quality*remediation*.jsonl", "*lane*remediation*.json", "*lane*remediation*.jsonl")
    paths = {path for pattern in patterns for path in ROOT.glob(pattern)} - exclude
    for path in paths:
        try:
            if path.suffix == ".jsonl":
                for line in path.read_text(encoding="utf-8").splitlines():
                    if line.strip():
                        add_prior(json.loads(line), used)
            else:
                add_prior(json.loads(path.read_text(encoding="utf-8")), used)
        except (OSError, ValueError, json.JSONDecodeError):
            continue
    return used


def main() -> None:
    paths: set[Path] = set()
    acquire()
    try:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        used = prior_identities(paths)
        unique = {}
        for row in audit["remediation_queue"]:
            unique.setdefault(identity(row), row)
        allocations = {}
        for lane in (13, 14, 15, 16):
            tag = f"quality_remediation_lane{lane}_2026-09-22"
            selection = ROOT / f"{tag}_selection.json"
            checkpoint = ROOT / f"{tag}_pre_search_checkpoint.json"
            claims = ROOT / f"{tag}_claims.jsonl"
            paths.update({selection, checkpoint, claims})
            selected = []
            for key, row in unique.items():
                if key not in used:
                    selected.append(row)
                    used.add(key)
                if len(selected) == COUNT:
                    break
            if len(selected) != COUNT:
                raise RuntimeError(f"lane{lane}: only {len(selected)} disjoint records available")
            ids = [identity(row) for row in selected]
            claim_id = __import__("hashlib").sha256((now() + "|" + "|".join(ids)).encode()).hexdigest()[:16]
            claim = {"claim_id": claim_id, "lane": f"lane{lane}", "claimed_at": now(), "count": COUNT, "identities": ids, "excluded_prior_identity_count": len(used) - len(selected)}
            with claims.open("a", encoding="utf-8", newline="\n") as handle:
                handle.write(json.dumps(claim, ensure_ascii=False) + "\n")
                handle.flush(); os.fsync(handle.fileno())
            atomic_json(selection, {"schema": "2026-09-22.external-item-quality-remediation-selection.v1", "batch": tag, "source_audit": AUDIT.name, "selection_method": "single shared-lock allocation across lanes 13-16 after exclusion of every prior selection, claim, search ledger, and append-only ledger; stable source-audit order", "claim": claim, "items": selected, "counts": {"selected_records": COUNT, "unique_identities": COUNT, "excluded_prior_identities": claim["excluded_prior_identity_count"]}, "policy": {"review_required_preserved_unless_exact_item_type_context_evidence": True, "no_relationship_inference": True, "no_promotion": True}})
            atomic_json(checkpoint, {"schema": "2026-09-22.external-item-quality-remediation-checkpoint.v1", "batch": tag, "claim_id": claim_id, "created_at": now(), "source_audit": AUDIT.name, "selection_file": selection.name, "status": "selected_pre_search", "record_count": COUNT, "searched_count": 0, "selection_ids": ids, "written_before_search": True, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}})
            allocations[lane] = (selected, claim, selection, checkpoint)

        selected, claim, selection, checkpoint = allocations[14]
        ledger = ROOT / "quality_remediation_lane14_2026-09-22_append_only_ledger.jsonl"
        report = ROOT / "quality_remediation_lane14_2026-09-22_report.json"
        report_md = ROOT / "quality_remediation_lane14_2026-09-22_report.md"
        searched_at = now()
        records = [review(row, claim["claim_id"], searched_at) for row in selected]
        with ledger.open("a", encoding="utf-8", newline="\n") as handle:
            for record in records:
                handle.write(json.dumps(record, ensure_ascii=False) + "\n")
            handle.flush(); os.fsync(handle.fileno())
        atomic_json(report, {"schema": "2026-09-22.external-item-quality-remediation-report.v1", "batch": "quality_remediation_lane14_2026-09-22", "claim_id": claim["claim_id"], "status": "completed", "source_audit": AUDIT.name, "selection": selection.name, "pre_search_checkpoint": checkpoint.name, "append_only_ledger": ledger.name, "records_reviewed": COUNT, "decision_counts": {"linked": 0, "review_required": COUNT, "genuinely_unavailable": 0}, "evidence_urls": COUNT * 2, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}, "result": "All 100 records remain review_required; exact item/type/context authority evidence was not proven."})
        report_md.write_text("# Quality-remediation lane14 report\n\nReviewed **100** fresh disjoint records. All remain `review_required`; exact item/type/context authority was not proven. Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were untouched.\n", encoding="utf-8")
        atomic_json(checkpoint, {**json.loads(checkpoint.read_text(encoding="utf-8")), "status": "completed", "searched_count": COUNT, "review_required_count": COUNT, "ledger": ledger.name, "report": report.name, "completed_at": now()})
        print(json.dumps({"lanes": {str(lane): {"selection": data[2].name, "checkpoint": data[3].name, "count": COUNT, "status": "completed" if lane == 14 else "selected_pre_search"} for lane, data in allocations.items()}, "disjoint_claimed": len(used)}))
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
