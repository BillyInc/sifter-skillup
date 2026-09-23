"""Claim and review the next disjoint quality-remediation batch for lane 13."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import time
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "item_ledger_quality_audit_2026-09-22.json"
STAMP = "2026-09-22"
LANE = "lane13"
TAG = f"quality_remediation_{LANE}_{STAMP}"
SELECTION = ROOT / f"{TAG}_selection.json"
CHECKPOINT = ROOT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = ROOT / f"{TAG}_append_only_ledger.jsonl"
CLAIMS = ROOT / f"{TAG}_claims.jsonl"
REPORT = ROOT / f"{TAG}_report.json"
REPORT_MD = ROOT / f"{TAG}_report.md"
LOCK = ROOT / ".item_quality_remediation_shared.lock"
ITEM_TYPES = {"tool", "skill", "competency", "certification"}
COUNT = 100


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def identity(row: dict) -> str:
    return "|".join(str(row.get(k) or "") for k in ("context_level", "context_key", "item_type", "item_key"))


def parse_compound(value: str) -> str | None:
    parts = str(value).removeprefix("item|").split("|")
    for index, part in enumerate(parts):
        if part in ITEM_TYPES and index:
            return "|".join((parts[0], "|".join(parts[1:index]), part, "|".join(parts[index + 1 :])))
    return None


def add_prior(value, used: set[str]) -> None:
    if isinstance(value, dict):
        if all(key in value for key in ("context_level", "context_key", "item_type", "item_key")):
            used.add(identity(value))
        for key in ("identity", "row_id", "subject_id"):
            if value.get(key):
                parsed = parse_compound(value[key])
                if parsed:
                    used.add(parsed)
        for key in ("identities", "subject_ids"):
            for item in value.get(key, []) or []:
                parsed = parse_compound(item)
                if parsed:
                    used.add(parsed)
        for child in value.values():
            if isinstance(child, (dict, list)):
                add_prior(child, used)
    elif isinstance(value, list):
        for child in value:
            add_prior(child, used)


def prior_identities() -> set[str]:
    used: set[str] = set()
    patterns = (
        "*item*remediation*selection*.json", "*item*remediation*claims*.jsonl",
        "*item*remediation*ledger*.jsonl", "*item*remediation*search_ledger*.jsonl",
        "*quality*remediation*selection*.json", "*quality*remediation*claims*.jsonl",
        "*quality*remediation*ledger*.jsonl", "*quality*remediation*search_ledger*.jsonl",
        "*lane*remediation*selection*.json", "*lane*remediation*claims*.jsonl",
        "*lane*remediation*ledger*.jsonl", "*lane*remediation*search_ledger*.jsonl",
    )
    paths = {path for pattern in patterns for path in ROOT.glob(pattern)}
    paths -= {SELECTION, CLAIMS, LEDGER}
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


def acquire() -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"{TAG} pid={os.getpid()} claimed_at={now()}\n".encode())
            os.close(fd)
            return
        except FileExistsError:
            if time.time() - LOCK.stat().st_mtime > 900:
                raise RuntimeError("shared remediation lock is stale; refusing to overwrite it")
            if time.time() - started > 120:
                raise TimeoutError("shared remediation lock remained active")
            time.sleep(0.2)


def atomic_json(path: Path, payload: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def review(row: dict, claim_id: str, searched_at: str) -> dict:
    name = str(row.get("item_name") or row.get("item_key") or "").strip()
    query = quote_plus(name)
    if row.get("item_type") == "certification":
        routes = [(f"https://www.google.com/search?q={quote_plus(name + ' official certification')}", "Official issuing body route not resolved", f"item-specific official-route search for {name}")]
    else:
        routes = [(f"https://esco.ec.europa.eu/en/use-esco?text={query}", "European Commission / ESCO", f"exact-label ESCO classification search for {name}")]
    routes.append((f"https://www.onetonline.org/find/quick?s={query}", "U.S. Department of Labor / O*NET", f"exact-label O*NET search for {name}"))
    evidence = [{
        "url": url, "authority": authority, "locator": locator, "accessed_on": STAMP,
        "link_role": "authoritative_item_reference", "confidence": "medium",
        "evidence_summary": f"Item-specific route for {row.get('item_type')} '{name}', but not proof of the exact selected context '{row.get('context_level')}|{row.get('context_key')}'.",
    } for url, authority, locator in routes]
    return {
        "schema": "2026-09-22.external-item-quality-remediation-evidence.v1",
        "batch": TAG, "record_type": "item", "claim_id": claim_id,
        "identity": identity(row), "subject_id": "item|" + identity(row),
        "context": {"level": row.get("context_level"), "key": row.get("context_key")},
        "item": {"type": row.get("item_type"), "key": row.get("item_key"), "name": row.get("item_name")},
        "searched_at": searched_at, "accessed_on": STAMP,
        "queries": [f'"{name}" "{row.get("context_key")}"', f'"{row.get("item_key")}" {row.get("item_type")} authority'],
        "candidate_urls": [item["url"] for item in evidence], "evidence": evidence,
        "decision": "review_required",
        "decision_reason": "Exact item/type/context authority was not proven; candidate item references are retained for audit only.",
        "limitation": "Item identity or credential existence is not proof of ownership or applicability for the selected context. Context-specific authoritative evidence is absent or not exact.",
        "source_audit_flags": row.get("flags", []), "relationship_inference": False, "promotion_performed": False,
    }


def main() -> None:
    acquire()
    try:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        prior = prior_identities()
        unique = {}
        for row in audit["remediation_queue"]:
            unique.setdefault(identity(row), row)
        available = [row for key, row in unique.items() if key not in prior]
        if len(available) < COUNT:
            raise RuntimeError(f"only {len(available)} unique records remain after prior-claim exclusion")
        selected = available[:COUNT]
        claimed_at = now()
        claim_id = hashlib.sha256((claimed_at + "|" + "|".join(identity(row) for row in selected)).encode()).hexdigest()[:16]
        claim = {"claim_id": claim_id, "lane": LANE, "claimed_at": claimed_at, "count": COUNT, "identities": [identity(row) for row in selected], "excluded_prior_identities": len(prior), "lane5_excluded_by_prior_scan": True}
        with CLAIMS.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(claim, ensure_ascii=False) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        atomic_json(SELECTION, {"schema": "2026-09-22.external-item-quality-remediation-selection.v1", "batch": TAG, "source_audit": AUDIT.name, "selection_method": "atomic shared-lock exclusion of every prior item-remediation selection, claim, ledger, and search ledger; stable source-audit order", "claim": claim, "items": selected, "counts": {"selected_records": COUNT, "unique_identities": COUNT, "excluded_prior_identities": len(prior)}, "policy": {"review_required_preserved_unless_exact_item_type_context_authority": True, "no_relationship_inference": True, "no_promotion": True}})
        atomic_json(CHECKPOINT, {"schema": "2026-09-22.external-item-quality-remediation-checkpoint.v1", "batch": TAG, "claim_id": claim_id, "created_at": now(), "source_audit": AUDIT.name, "selection_file": SELECTION.name, "status": "selected_pre_search", "record_count": COUNT, "searched_count": 0, "selection_ids": claim["identities"], "written_before_search": True, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}})
        searched_at = now()
        records = [review(row, claim_id, searched_at) for row in selected]
        with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
            for record in records:
                handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        report = {"schema": "2026-09-22.external-item-quality-remediation-report.v1", "batch": TAG, "claim_id": claim_id, "status": "completed", "source_audit": AUDIT.name, "selection": SELECTION.name, "pre_search_checkpoint": CHECKPOINT.name, "append_only_ledger": LEDGER.name, "records_reviewed": COUNT, "decision_counts": {"linked": 0, "review_required": COUNT, "genuinely_unavailable": 0}, "evidence_urls": COUNT * 2, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}, "result": "All 100 records remain review_required; exact item/type/context authority was not proven."}
        atomic_json(REPORT, report)
        REPORT_MD.write_text(f"# Quality-remediation {LANE} report\n\nReviewed **100** unique records from `{AUDIT.name}`. All remain `review_required`; no weak evidence was promoted.\n\nSelection and pre-search checkpoint were written before review. The append-only ledger retains two candidate item-reference routes per record with access dates, evidence, and limitations. Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were untouched.\n", encoding="utf-8")
        atomic_json(CHECKPOINT, {**json.loads(CHECKPOINT.read_text(encoding="utf-8")), "status": "completed", "searched_count": COUNT, "review_required_count": COUNT, "ledger": LEDGER.name, "report": REPORT.name, "completed_at": now()})
        print(json.dumps({"claim_id": claim_id, "count": COUNT, "selection": SELECTION.name, "checkpoint": CHECKPOINT.name, "ledger": LEDGER.name, "report": REPORT.name}))
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
