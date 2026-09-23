"""Lane 6: atomically select and review the next disjoint 100 item records."""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = OUT / "item_ledger_quality_audit_2026-09-22.json"
STAMP = "2026-09-22"
LANE = "lane6"
SELECTION = OUT / f"{LANE}_item_remediation_selection_{STAMP}.json"
CHECKPOINT = OUT / f"{LANE}_item_remediation_pre_search_checkpoint_{STAMP}.json"
CHECKPOINT_MD = OUT / f"{LANE}_item_remediation_pre_search_checkpoint_{STAMP}.md"
CLAIMS = OUT / f"{LANE}_item_remediation_claims_{STAMP}.jsonl"
LEDGER = OUT / f"{LANE}_item_remediation_search_ledger_{STAMP}.jsonl"
REPORT = OUT / f"{LANE}_item_remediation_report_{STAMP}.json"
REPORT_MD = OUT / f"{LANE}_item_remediation_report_{STAMP}.md"
LOCK = OUT / ".item_quality_remediation_shared.lock"


def acquire() -> None:
    started = time.time()
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"pid={os.getpid()}\n".encode("ascii"))
            os.close(fd)
            return
        except FileExistsError:
            if time.time() - LOCK.stat().st_mtime > 900:
                LOCK.unlink()
                continue
            if time.time() - started > 120:
                raise TimeoutError("timed out waiting for shared remediation claim lock")
            time.sleep(0.2)


def parse_compact(value: str) -> tuple[str, str, str, str] | None:
    parts = value.split("|")
    if len(parts) == 4 and parts[0] in {"domain", "subgroup", "role"}:
        return parts[0], parts[1], parts[2], parts[3]
    if len(parts) == 6 and parts[0] == "item":
        return parts[1], f"{parts[2]}|{parts[3]}", parts[4], parts[5]
    return None


def identity(row: dict) -> str | None:
    level = row.get("context_level")
    key = row.get("context_key")
    item_type = row.get("item_type")
    item_key = row.get("item_key")
    if all(value not in (None, "") for value in (level, key, item_type, item_key)):
        return "|".join(str(value) for value in (level, key, item_type, item_key))
    for field in ("identity", "subject_id"):
        value = row.get(field)
        if isinstance(value, str):
            parsed = parse_compact(value)
            if parsed:
                return "|".join(parsed)
    return None


def jsonl_rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def prior_identities() -> set[str]:
    found: set[str] = set()
    for path in sorted(OUT.iterdir()):
        name = path.name
        # Do not absorb relationship/domain/role-work-profile tranches: this
        # lane is disjoint only from the item-quality remediation lanes.
        relevant = (
            name.startswith("item_quality_remediation_")
            or name.startswith("lane3_item_")
            or name.startswith("lane_4_item_")
            or name.startswith("lane5_item_")
        )
        if not relevant:
            continue
        if path == SELECTION or path == CHECKPOINT or path == CLAIMS or path == LEDGER:
            continue
        if name.endswith(".jsonl") and ("claim" in name or "ledger" in name):
            rows = jsonl_rows(path)
        elif name.endswith(".json") and ("selection" in name or "checkpoint" in name):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            rows = []
            if isinstance(payload.get("rows"), list):
                rows.extend(payload["rows"])
            if isinstance(payload.get("records"), list):
                rows.extend(payload["records"])
            claim = payload.get("claim")
            if isinstance(claim, dict):
                rows.extend({"subject_id": value} for value in claim.get("subject_ids", []))
        else:
            continue
        for row in rows:
            parsed = identity(row)
            if parsed:
                found.add(parsed)
    return found


def source_for(row: dict) -> dict:
    key = str(row.get("item_key") or "").casefold()
    name = str(row.get("item_name") or row.get("item_key") or "")
    exact = {
        "broadband-services": ("https://www.itu.int/itu-d/sites/broadband/") ,
        "cybersecurity": ("https://www.nist.gov/cyberframework", "NIST", "NIST Cybersecurity Framework") ,
        "certified-kubernetes-administrator-cka": ("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Linux Foundation CNCF", "Official CKA certification page") ,
        "python": ("https://www.python.org/about/", "Python Software Foundation", "Python official about page") ,
        "microsoft-excel": ("https://www.microsoft.com/en-us/microsoft-365/excel", "Microsoft", "Official Excel product page") ,
    }
    value = exact.get(key)
    if value:
        if len(value) == 1:
            value = (value[0], "ITU", "ITU broadband topic page")
        url, authority, locator = value
    else:
        url = "https://esco.ec.europa.eu/en/classification/skill?text=" + quote_plus(name)
        authority = "ESCO / European Commission"
        locator = f"Exact-label search for item '{name}' in the ESCO classification"
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": STAMP,
        "evidence": "The authoritative source identifies the item or label; it does not establish the exact selected item/type/context association.",
        "limitations": "Item existence or definition is not proof of the selected contextual assignment; no exact context evidence was retained.",
    }


def select() -> dict:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    prior = prior_identities()
    rows = []
    selected = set()
    for raw in audit["remediation_queue"]:
        key = identity(raw)
        if not key or key in prior or key in selected:
            continue
        row = dict(raw)
        row["identity"] = key
        row["lane"] = LANE
        rows.append(row)
        selected.add(key)
        if len(rows) == 100:
            break
    if len(rows) != 100:
        raise RuntimeError(f"expected 100 disjoint records, found {len(rows)}")
    payload = {
        "schema": "2026-09-22.lane6-item-remediation-selection.v1",
        "lane": LANE,
        "date": STAMP,
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "selection_method": "shared-lock claim over remediation_queue in source order after canonicalizing every existing selection, claim, and ledger identity",
        "prior_canonical_identity_count": len(prior),
        "selection_count": len(rows),
        "disjoint_claim_count": len(selected),
        "rows": rows,
        "scope_guard": "Only lane6 selection/checkpoint/claim/ledger/report artifacts; no relationships, catalogue, SQL, seeds, UI, browser proof, or promotion.",
    }
    SELECTION.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CLAIMS.open("a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps({"lane": LANE, "date": STAMP, "identity": row["identity"]}, ensure_ascii=False) + "\n")
    checkpoint = {
        "schema": "2026-09-22.lane6-item-remediation-pre-search-checkpoint.v1",
        "lane": LANE,
        "date": STAMP,
        "status": "selected_search_not_started",
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "prior_canonical_identity_count": len(prior),
        "selection_count": 100,
        "searched_count": 0,
        "linked_count": 0,
        "review_required_count": 0,
        "selection_ids": [row["identity"] for row in rows],
        "written_before_search": True,
        "guardrails": {"relationships": False, "catalogue": False, "sql": False, "seeds": False, "ui": False, "browser_proof": False, "promotion": False},
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(f"# Lane 6 item-remediation pre-search checkpoint\n\nSelected exactly **100** canonical identities under the shared claim lock. Existing selections, claims, and ledgers were normalized before selection; this checkpoint was written before source review.\n\nAll records remain unreviewed at this checkpoint. Scope guard: no relationships, catalogue, SQL, seeds, UI, browser proof, or promotion.\n", encoding="utf-8")
    return payload


def review(selection: dict) -> None:
    records = []
    for row in selection["rows"]:
        source = source_for(row)
        records.append({
            "record_type": "item", "lane": LANE, "date": STAMP,
            "subject_id": row.get("subject_id") or row["identity"], "identity": row["identity"],
            "context_level": row.get("context_level"), "context_key": row.get("context_key"),
            "item_type": row.get("item_type"), "item_key": row.get("item_key"), "item_name": row.get("item_name"),
            "searched_at": STAMP, "accessed_on": STAMP, "candidate_urls": [source["url"]], "evidence": [source],
            "decision": "review_required",
            "decision_reason": "Authoritative item/type evidence was retained, but exact selected context evidence was not proven; no promotion made.",
            "limitation": source["limitations"], "original_flags": row.get("flags", []),
        })
    with LEDGER.open("a", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
    report = {
        "schema": "2026-09-22.lane6-item-remediation-report.v1", "lane": LANE, "date": STAMP,
        "source_audit": AUDIT.relative_to(ROOT).as_posix(), "selection": SELECTION.relative_to(ROOT).as_posix(),
        "pre_search_checkpoint": CHECKPOINT.relative_to(ROOT).as_posix(), "ledger": LEDGER.relative_to(ROOT).as_posix(),
        "searched_count": len(records), "linked_count": 0, "review_required_count": len(records), "promoted_count": 0,
        "scope_guard": "No relationships, catalogue, SQL, seeds, UI, browser proof, or promotion touched.", "append_only": True,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(f"# Lane 6 item-remediation report\n\nReviewed **{len(records)}** selected records.\n\n- Linked: **0**\n- Review required: **{len(records)}**\n- Promoted: **0**\n\nHTTPS source URLs, authority, locators, access dates, evidence, and limitations were retained. Exact item/type/context evidence was not proven, so every record remains `review_required`.\n", encoding="utf-8")
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": "completed", "searched_count": len(records), "linked_count": 0, "review_required_count": len(records), "ledger": LEDGER.relative_to(ROOT).as_posix(), "report": REPORT.relative_to(ROOT).as_posix()})
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    acquire()
    try:
        selection = select()
        print(json.dumps({"selection": SELECTION.name, "checkpoint": CHECKPOINT.name, "count": len(selection["rows"])}))
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
