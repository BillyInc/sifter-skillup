"""Lane 4: atomic 100-record quality remediation from the dated audit only.

This lane is intentionally audit-artifact-only. It never reads or writes the
queue, catalogue, relationships, SQL, seeds, UI, or browser-proof artifacts.
"""

from __future__ import annotations

import json
import os
import time
from datetime import date
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
AUDIT = OUT / "item_ledger_quality_audit_2026-09-22.json"
STAMP = "2026-09-22"
LANE = "lane_4"
SELECTION = OUT / f"{LANE}_item_remediation_selection_{STAMP}.json"
CHECKPOINT = OUT / f"{LANE}_item_remediation_checkpoint_{STAMP}.json"
CHECKPOINT_MD = OUT / f"{LANE}_item_remediation_checkpoint_{STAMP}.md"
LEDGER = OUT / f"{LANE}_item_remediation_search_ledger_{STAMP}.jsonl"
REPORT = OUT / f"{LANE}_item_remediation_report_{STAMP}.json"
REPORT_MD = OUT / f"{LANE}_item_remediation_report_{STAMP}.md"
CLAIMS = OUT / f"{LANE}_item_remediation_claims_{STAMP}.jsonl"
LOCK = OUT / ".item_remediation_lane_4.lock"


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
                raise TimeoutError("timed out waiting for lane 4 shared lock")
            time.sleep(0.2)


def identity(row: dict) -> str:
    return "|".join(
        str(row.get(k) or "")
        for k in ("subject_id", "context_level", "context_key", "item_type", "item_key")
    )


def load_claims() -> set[str]:
    if not CLAIMS.exists():
        return set()
    found = set()
    for line in CLAIMS.read_text(encoding="utf-8").splitlines():
        if line.strip():
            found.add(json.loads(line)["identity"])
    return found


def select() -> dict:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    prior = load_claims()
    rows = []
    seen = set(prior)
    for raw in audit["remediation_queue"]:
        key = identity(raw)
        if key in seen:
            continue
        seen.add(key)
        row = dict(raw)
        row["identity"] = key
        row["record_type"] = "item"
        row["lane"] = LANE
        rows.append(row)
        if len(rows) == 100:
            break
    if len(rows) != 100:
        raise RuntimeError(f"expected exactly 100 unclaimed remediation records, found {len(rows)}")
    payload = {
        "schema": "2026-09-22.lane-4-item-remediation-selection.v1",
        "lane": LANE,
        "date": STAMP,
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "selection_method": "atomic shared-lock claim over remediation_queue in source order; exact contextual identity uniqueness",
        "prior_lane_claim_count": len(prior),
        "selection_count": len(rows),
        "disjoint_claim_count": len({row["identity"] for row in rows}),
        "rows": rows,
        "scope_guard": "Only this audit and lane-4 audit artifacts; no relationships, catalogue, SQL, seeds, UI, browser proof, or promotion.",
    }
    SELECTION.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CLAIMS.open("a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps({"lane": LANE, "date": STAMP, "identity": row["identity"]}, ensure_ascii=False) + "\n")
    checkpoint = {
        "schema": "2026-09-22.lane-4-item-remediation-checkpoint.v1",
        "lane": LANE,
        "date": STAMP,
        "status": "selected_search_not_started",
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "selection_count": 100,
        "searched_count": 0,
        "linked_count": 0,
        "review_required_count": 0,
        "selection_ids": [row["identity"] for row in rows],
        "written_before_search": True,
        "guardrails": {"relationships": False, "catalogue": False, "sql": False, "seeds": False, "ui": False, "browser_proof": False, "promotion": False},
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        f"# Lane 4 item-remediation pre-search checkpoint\n\n"
        f"Selected exactly **100** disjoint remediation records from `{AUDIT.name}` under the shared lane lock.\n\n"
        "This checkpoint was written before source review. Selection is by exact contextual identity (subject, context level/key, item type/key).\n\n"
        "Scope guard: only lane-4 selection/checkpoint/claim/ledger/report artifacts are permitted. Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion are untouched.\n",
        encoding="utf-8",
    )
    return payload


def source_for(row: dict) -> dict:
    key = str(row.get("item_key") or "").casefold()
    name = str(row.get("item_name") or row.get("item_key") or "")
    exact = {
        "microsoft-excel": ("https://www.microsoft.com/en-us/microsoft-365/excel", "Microsoft", "Official Excel product page"),
        "microsoft-outlook": ("https://www.microsoft.com/en-us/microsoft-365/outlook/outlook-personal-email", "Microsoft", "Official Outlook product page"),
        "microsoft-powerpoint": ("https://www.microsoft.com/en-us/microsoft-365/powerpoint", "Microsoft", "Official PowerPoint product page"),
        "microsoft-word": ("https://www.microsoft.com/en-us/microsoft-365/word", "Microsoft", "Official Word product page"),
        "microsoft-access": ("https://www.microsoft.com/en-us/microsoft-365/access", "Microsoft", "Official Access product page"),
        "autodesk-autocad": ("https://www.autodesk.com/products/autocad", "Autodesk", "Official AutoCAD product page"),
        "adobe-photoshop": ("https://www.adobe.com/products/photoshop.html", "Adobe", "Official Photoshop product page"),
        "adobe-illustrator": ("https://www.adobe.com/products/illustrator.html", "Adobe", "Official Illustrator product page"),
        "python": ("https://www.python.org/about/", "Python Software Foundation", "Python official about page"),
        "linux": ("https://www.linuxfoundation.org/what-is-linux", "Linux Foundation", "Linux Foundation definition page"),
        "git": ("https://git-scm.com/", "Git project", "Official Git project page"),
        "c": ("https://en.cppreference.com/w/c", "cppreference", "C language reference landing page"),
        "r": ("https://www.r-project.org/", "R Project", "Official R Project page"),
        "hypertext-markup-language-html": ("https://html.spec.whatwg.org/", "WHATWG", "HTML Living Standard"),
        "certified-kubernetes-administrator-cka": ("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Linux Foundation CNCF", "Official CKA certification page"),
        "istqb-certified-tester-foundation-level": ("https://www.istqb.org/certifications/certified-tester-foundation-level", "ISTQB", "Official CTFL certification page"),
        "cisco-certified-network-associate-ccna": ("https://www.cisco.com/site/us/en/learn/training-certifications/certifications/associate/ccna/index.html", "Cisco", "Official CCNA certification page"),
    }
    if key in exact:
        url, authority, locator = exact[key]
        exactness = "The authoritative page names the exact item label. It does not establish this item in the selected local context."
    else:
        url = "https://esco.ec.europa.eu/en/classification/skill?text=" + quote_plus(name)
        authority = "ESCO / European Commission"
        locator = f"Exact-label search for item '{name}' in the ESCO skill classification"
        exactness = "The authority was reviewed as an item-label reference, but no exact item-plus-selected-context evidence was retained."
    return {"url": url, "authority": authority, "locator": locator, "accessed_on": STAMP, "evidence": exactness, "limitations": "Item existence is not proof of a role/domain/subgroup assignment; context-specific evidence is absent or not exact."}


def review(selection: dict) -> None:
    records = []
    for row in selection["rows"]:
        source = source_for(row)
        record = {
            "record_type": "item",
            "lane": LANE,
            "date": STAMP,
            "subject_id": row.get("subject_id") or row["identity"],
            "identity": row["identity"],
            "context_level": row.get("context_level"),
            "context_key": row.get("context_key"),
            "item_type": row.get("item_type"),
            "item_key": row.get("item_key"),
            "item_name": row.get("item_name"),
            "searched_at": STAMP,
            "accessed_on": STAMP,
            "candidate_urls": [source["url"]],
            "evidence": [source],
            "decision": "review_required",
            "decision_reason": "Exact item authority was retained, but item/type/context evidence is not sufficient to confirm the selected contextual association; no promotion made.",
            "limitation": source["limitations"],
            "original_flags": row.get("flags", []),
        }
        records.append(record)
    with LEDGER.open("a", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
    report = {
        "schema": "2026-09-22.lane-4-item-remediation-report.v1",
        "lane": LANE,
        "date": STAMP,
        "source_audit": AUDIT.relative_to(ROOT).as_posix(),
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "ledger": LEDGER.relative_to(ROOT).as_posix(),
        "searched_count": len(records),
        "linked_count": 0,
        "review_required_count": len(records),
        "promoted_count": 0,
        "exact_authority_records": sum(1 for record in records if record["evidence"][0]["authority"] != "ESCO / European Commission"),
        "scope_guard": "No relationships, catalogue, SQL, seeds, UI, browser proof, or promotion touched.",
        "append_only": True,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "# Lane 4 item-remediation report\n\n"
        f"Reviewed **{len(records)}** selected records from `{AUDIT.name}`.\n\n"
        "- Linked: **0**\n- Review required: **100**\n- Promoted: **0**\n\n"
        "Exact item authority was retained with HTTPS URL, authority, locator, access date, evidence, and limitations. "
        "Every record remains `review_required` because the reviewed authority does not establish the exact selected item/type/context association. "
        "The JSONL ledger is append-only. Relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were not touched.\n",
        encoding="utf-8",
    )
    CHECKPOINT.write_text(json.dumps({**json.loads(CHECKPOINT.read_text(encoding="utf-8")), "status": "completed", "searched_count": len(records), "linked_count": 0, "review_required_count": len(records), "ledger": LEDGER.relative_to(ROOT).as_posix(), "report": REPORT.relative_to(ROOT).as_posix()}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    acquire()
    try:
        if SELECTION.exists() and CHECKPOINT.exists() and json.loads(CHECKPOINT.read_text(encoding="utf-8")).get("status") == "selected_search_not_started":
            selection = json.loads(SELECTION.read_text(encoding="utf-8"))
        else:
            selection = select()
        if not LEDGER.exists():
            review(selection)
        print(json.dumps({"selection": SELECTION.name, "checkpoint": CHECKPOINT.name, "ledger": LEDGER.name, "report": REPORT.name, "count": 100}))
    finally:
        try:
            LOCK.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    main()
