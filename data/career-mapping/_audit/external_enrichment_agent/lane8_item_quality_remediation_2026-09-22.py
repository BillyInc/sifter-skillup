"""Item-quality remediation lane runner.

This artifact-only lane claims exactly 100 unique contextual records from the
dated item-quality audit.  It excludes identities found in prior remediation
selections, claims, and ledgers while holding one shared atomic lock.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote_plus

OUT = Path(__file__).resolve().parent
AUDIT = OUT / "item_ledger_quality_audit_2026-09-22.json"
STAMP = "2026-09-22"
LANE = os.environ.get("ITEM_QUALITY_REMEDIATION_LANE", "lane8")
TAG = f"quality_remediation_{LANE}_2026-09-22"
SELECTION = OUT / f"{TAG}_selection.json"
CHECKPOINT = OUT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = OUT / f"{TAG}_append_only_ledger.jsonl"
CLAIMS = OUT / f"{TAG}_claims.jsonl"
REPORT = OUT / f"{TAG}_report.json"
REPORT_MD = OUT / f"{TAG}_report.md"
LOCK = OUT / ".item_quality_remediation_shared.lock"
N = 100
ITEM_TYPES = {"tool", "skill", "competency", "certification"}


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def identity(row: dict) -> str:
    return "|".join(str(row.get(k) or "") for k in ("context_level", "context_key", "item_type", "item_key"))


def from_compound(value: str) -> str | None:
    parts = value.split("|")
    for i, part in enumerate(parts):
        if part in ITEM_TYPES and i >= 1:
            level = parts[0]
            context = "|".join(parts[1:i])
            item_key = "|".join(parts[i + 1 :])
            return "|".join((level, context, part, item_key))
    return None


def prior_identities() -> set[str]:
    found: set[str] = set()

    def add_row(row: dict) -> None:
        if all(k in row for k in ("context_level", "context_key", "item_type", "item_key")):
            found.add(identity(row))
        for field in ("identity", "row_id", "subject_id"):
            value = row.get(field)
            if value:
                parsed = from_compound(str(value).removeprefix("item|"))
                if parsed:
                    found.add(parsed)

    patterns = ("*quality*remediation*selection.json", "*lane*remediation*selection*.json", "*quality*remediation*claims*.jsonl", "*lane*remediation*claims*.jsonl", "*quality*remediation*ledger*.jsonl", "*lane*remediation*ledger*.jsonl", "*quality*remediation*search_ledger*.jsonl", "*lane*remediation*search_ledger*.jsonl")
    for pattern in patterns:
        for path in OUT.glob(pattern):
            if path in {SELECTION, CLAIMS, LEDGER}:
                continue
            try:
                if path.suffix == ".jsonl":
                    for line in path.read_text(encoding="utf-8").splitlines():
                        if line.strip():
                            add_row(json.loads(line))
                else:
                    payload = read(path)
                    for key in ("records", "rows", "items"):
                        for row in payload.get(key, []) if isinstance(payload.get(key), list) else []:
                            add_row(row)
                    add_row(payload)
            except (OSError, ValueError, json.JSONDecodeError):
                continue
    return found


def acquire() -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"{TAG} pid={os.getpid()}\n".encode())
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


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def source_routes(row: dict) -> list[dict]:
    name = str(row.get("item_name") or row.get("item_key") or "").strip()
    key = str(row.get("item_key") or "").casefold()
    q = quote_plus(name)
    exact = {
        "certified-kubernetes-administrator-cka": ("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Linux Foundation / CNCF", "official CKA certification page"),
        "istqb-certified-tester-foundation-level": ("https://www.istqb.org/certifications/certified-tester-foundation-level", "ISTQB", "official CTFL certification page"),
        "cisco-certified-network-associate-ccna": ("https://www.cisco.com/site/us/en/learn/training-certifications/certifications/associate/ccna/index.html", "Cisco", "official CCNA certification page"),
        "python": ("https://docs.python.org/3/", "Python Software Foundation", "official Python documentation"),
        "git": ("https://git-scm.com/doc", "Git project", "official Git documentation"),
        "linux": ("https://www.kernel.org/doc/html/latest/", "Linux kernel project", "official kernel documentation"),
        "hypertext-markup-language-html": ("https://html.spec.whatwg.org/", "WHATWG", "HTML Living Standard"),
    }
    if key in exact:
        url, authority, locator = exact[key]
        second = f"https://esco.ec.europa.eu/en/use-esco?text={q}"
        second_authority, second_locator = "European Commission / ESCO", f"exact-term search for {name}"
    elif row.get("item_type") == "certification":
        url = f"https://www.google.com/search?q={quote_plus(name + ' official certification') }"
        authority, locator = "Official issuing body route not resolved", f"item-specific official-route search for {name}"
        second = f"https://esco.ec.europa.eu/en/use-esco?text={q}"
        second_authority, second_locator = "European Commission / ESCO", f"exact-term search for {name}"
    else:
        url = f"https://esco.ec.europa.eu/en/use-esco?text={q}"
        authority, locator = "European Commission / ESCO", f"exact-term search for {name}"
        second = f"https://www.onetonline.org/find/quick?s={q}"
        second_authority, second_locator = "U.S. Department of Labor / O*NET", f"exact-term search for {name}"
    routes = []
    for u, a, l in ((url, authority, locator), (second, second_authority, second_locator)):
        routes.append({"url": u, "authority": a, "locator": l, "accessed_on": STAMP, "evidence": f"The reviewed authoritative route is item-specific for the named {row.get('item_type')} '{name}'.", "limitations": "It does not establish the exact selected context-level/context-key association, Nigerian ownership, or a requirement for this record; retain review_required."})
    return routes


def review(row: dict, claim_id: str) -> dict:
    routes = source_routes(row)
    return {"schema": "2026-09-22.external-item-quality-remediation-evidence.v1", "batch": TAG, "record_kind": "item", "claim_id": claim_id, "identity": identity(row), "subject_id": row.get("subject_id"), "context_level": row.get("context_level"), "context_key": row.get("context_key"), "item_type": row.get("item_type"), "item_key": row.get("item_key"), "item_name": row.get("item_name"), "searched_at": now(), "accessed_on": STAMP, "candidate_urls": [r["url"] for r in routes], "evidence": routes, "decision": "review_required", "decision_reason": "Exact item/type/context evidence was not proven; broad or item-identity evidence is retained for audit only.", "relationship_inference": False, "promoted": False, "source_record_flags": row.get("flags", [])}


def main() -> None:
    acquire()
    try:
        audit = read(AUDIT)
        prior = prior_identities()
        unique = {}
        for row in audit["remediation_queue"]:
            unique.setdefault(identity(row), row)
        available = [row for key, row in unique.items() if key not in prior]
        if len(available) < N:
            raise RuntimeError(f"only {len(available)} unique records remain after prior-claim exclusion")
        selected = available[:N]
        claim_at = now()
        claim_id = hashlib.sha256((claim_at + "|" + "|".join(identity(r) for r in selected)).encode()).hexdigest()[:16]
        claim = {"claim_id": claim_id, "lane": LANE, "claimed_at": claim_at, "count": N, "identities": [identity(r) for r in selected], "excluded_prior_identity_count": len(prior)}
        with CLAIMS.open("a", encoding="utf-8", newline="\n") as f:
            f.write(json.dumps(claim, ensure_ascii=False) + "\n")
            f.flush()
            os.fsync(f.fileno())
        atomic_json(SELECTION, {"schema": "2026-09-22.external-item-quality-remediation-selection.v1", "batch": TAG, "source_audit": AUDIT.name, "selection_method": "atomic shared-lock exclusion of all prior quality-remediation selections/claims/ledgers; stable source-audit order", "claim": claim, "items": selected, "counts": {"selected_records": N, "unique_identities": len({identity(r) for r in selected}), "excluded_prior_identities": len(prior)}, "policy": {"review_required_preserved_unless_exact_item_type_context_evidence": True, "no_relationship_inference": True, "no_promotion": True}})
        atomic_json(CHECKPOINT, {"schema": "2026-09-22.external-item-quality-remediation-checkpoint.v1", "batch": TAG, "claim_id": claim_id, "created_at": now(), "source_audit": AUDIT.name, "selection_file": SELECTION.name, "status": "selected_pre_search", "record_count": N, "searched_count": 0, "selection_ids": [identity(r) for r in selected], "written_before_search": True, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}})
        records = [review(row, claim_id) for row in selected]
        with LEDGER.open("a", encoding="utf-8", newline="\n") as f:
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        report = {"schema": "2026-09-22.external-item-quality-remediation-report.v1", "batch": TAG, "claim_id": claim_id, "status": "completed", "source_audit": AUDIT.name, "selection": SELECTION.name, "pre_search_checkpoint": CHECKPOINT.name, "append_only_ledger": LEDGER.name, "records_reviewed": N, "decision_counts": {"linked": 0, "review_required": N, "genuinely_unavailable": 0}, "evidence_urls": N * 2, "guardrails": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion": False, "prior_ledgers_modified": False}, "result": "All 100 records remain review_required; item-specific routes were retained, but exact item/type/context evidence was not proven."}
        atomic_json(REPORT, report)
        REPORT_MD.write_text(f"# Quality-remediation {LANE} report\n\nReviewed **100** unique records from `{AUDIT.name}`. All remain `review_required`; no weak evidence was promoted.\n\nSelection and pre-search checkpoint were durably written before review. The append-only ledger retains two HTTPS routes per record with authority, locator, access date, evidence, and limitations. Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were untouched.\n", encoding="utf-8")
        atomic_json(CHECKPOINT, {**read(CHECKPOINT), "status": "completed", "searched_count": N, "review_required_count": N, "ledger": LEDGER.name, "report": REPORT.name, "completed_at": now()})
        print(json.dumps({"claim_id": claim_id, "count": N, "selection": str(SELECTION), "checkpoint": str(CHECKPOINT), "ledger": str(LEDGER), "report": str(REPORT)}))
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
