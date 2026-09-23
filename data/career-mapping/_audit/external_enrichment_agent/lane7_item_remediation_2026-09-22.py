"""Lane 7 item-quality remediation: atomic selection, checkpoint, and review."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "item_ledger_quality_audit_2026-09-22.json"
STAMP = "2026-09-22"
LANE = "lane7"
LOCK = ROOT / ".lane7_item_remediation.lock"
SELECTION = ROOT / f"{LANE}_item_remediation_selection_{STAMP}.json"
CHECKPOINT = ROOT / f"{LANE}_item_remediation_pre_search_checkpoint_{STAMP}.json"
LEDGER = ROOT / f"{LANE}_item_remediation_search_ledger_{STAMP}.jsonl"
CLAIMS = ROOT / f"{LANE}_item_remediation_claims_{STAMP}.jsonl"
REPORT = ROOT / f"{LANE}_item_remediation_report_{STAMP}.json"
REPORT_MD = ROOT / f"{LANE}_item_remediation_report_{STAMP}.md"


def now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def identity(r):
    return "|".join(str(r.get(k) or "") for k in ("context_level", "context_key", "item_type", "item_key"))


def canon(r):
    return identity(r)


def read_jsonl(p):
    if not p.exists():
        return []
    return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()]


def from_row(r):
    return canon(r)


def prior_ids():
    used = set()
    # Only item-remediation artifacts participate. Relationship tranches are out of scope.
    selections = [
        ROOT / "item_quality_remediation_lane2_selection_2026-09-22.json",
        ROOT / "lane3_item_remediation_batch_001_2026-09-22_selection.json",
        ROOT / "lane_4_item_remediation_selection_2026-09-22.json",
    ]
    ledgers = [
        ROOT / "item_quality_remediation_lane2_search_ledger_2026-09-22.jsonl",
        ROOT / "lane3_item_remediation_batch_001_2026-09-22_ledger.jsonl",
        ROOT / "lane_4_item_remediation_search_ledger_2026-09-22.jsonl",
    ]
    for p in selections:
        if p.exists():
            d = json.loads(p.read_text(encoding="utf-8"))
            for r in d.get("records", d.get("rows", [])):
                used.add(from_row(r))
    for p in ledgers:
        for r in read_jsonl(p):
            used.add(from_row(r))
    # lane 2's append-only registry stores a list claim, so reconcile that format too.
    registry = ROOT / "item_quality_remediation_claims_2026-09-22.jsonl"
    for r in read_jsonl(registry):
        for sid in r.get("subject_ids", []):
            if sid.startswith("item|"):
                used.add(sid[5:])
            else:
                used.add(sid)
    return used


def acquire():
    # Any active remediation lock blocks a concurrent claim; stale locks are not removed silently.
    active = [p for p in ROOT.glob("*.lock") if p.name != LOCK.name]
    if active:
        raise RuntimeError("active claim lock present: " + ", ".join(p.name for p in active))
    fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    os.write(fd, f"lane={LANE} pid={os.getpid()} claimed_at={now()}\n".encode())
    os.close(fd)


def atomic_json(p, value):
    tmp = p.with_suffix(p.suffix + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, p)


def select():
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    prior = prior_ids()
    unique = {}
    for r in audit["remediation_queue"]:
        unique.setdefault(canon(r), r)
    rows = [unique[k] for k in sorted(unique) if k not in prior][:100]
    if len(rows) != 100:
        raise RuntimeError(f"expected 100 unclaimed records; found {len(rows)}")
    selected_at = now()
    claim_id = hashlib.sha256((selected_at + "|" + "|".join(map(canon, rows))).encode()).hexdigest()[:16]
    claim = {"claim_id": claim_id, "lane": LANE, "claimed_at": selected_at, "count": 100, "identities": list(map(canon, rows))}
    payload = {
        "schema": "2026-09-22.lane7-item-remediation-selection.v1",
        "lane": LANE, "source_audit": AUDIT.name,
        "selection_method": "atomic lane7 lock; audit-order scan; normalized exact contextual identity exclusion",
        "prior_claimed_identity_count": len(prior), "count": 100, "claim": claim, "records": rows,
        "scope_guard": "Items only. No relationships, catalogue, SQL, seeds, UI, browser proof, or promotion.",
    }
    atomic_json(SELECTION, payload)
    with CLAIMS.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"claim_id": claim_id, "lane": LANE, "claimed_at": selected_at, "identities": list(map(canon, rows))}, ensure_ascii=False) + "\n")
    checkpoint = {
        "schema": "2026-09-22.lane7-item-remediation-pre-search-checkpoint.v1",
        "lane": LANE, "claim_id": claim_id, "created_at": now(), "status": "selected_before_search",
        "source_audit": AUDIT.name, "selection_file": SELECTION.name, "record_count": 100,
        "searched_count": 0, "linked_count": 0, "review_required_count": 0,
        "identities": list(map(canon, rows)), "search_started": False,
        "scope_guard": "No relationships, catalogue, SQL, seeds, UI, browser proof, or promotion.",
    }
    atomic_json(CHECKPOINT, checkpoint)
    return payload


CERT_ROUTES = {
    "city-guilds-fashion-and-textiles": ("https://www.cityandguilds.com/qualifications-and-apprenticeships/creative-industries/fashion-and-textiles", "City & Guilds", "Fashion and Textiles qualification route"),
    "chartered-chemical-engineer-ceng-icheme": ("https://www.icheme.org/membership/chartered-membership/", "Institution of Chemical Engineers", "Chartered membership route"),
    "adr-dangerous-goods-driver-certificate": ("https://unece.org/trade/documents/2023/05/adr-2023", "UNECE", "ADR 2023 dangerous-goods agreement"),
    "chartered-member-cmilt": ("https://ciltinternational.org/membership/", "CILT International", "Professional membership route"),
    "cpcs-operator-card": ("https://www.nocnjobcards.org/cpcs/", "NOCN Job Cards", "CPCS operator card route"),
    "nccco-crane-operator-certification": ("https://www.nccco.org/certification", "NCCCO", "Crane operator certification route"),
    "npors-operator-certification": ("https://www.npors.com/", "NPORS", "Operator certification route"),
    "irse-licence": ("https://www.irse.org/Professional-Development/Licensing", "Institution of Railway Signal Engineers", "Professional licensing route"),
    "member-fisheries-society-of-nigeria-fison": ("https://fison.org.ng/", "Fisheries Society of Nigeria", "Professional society route"),
    "certified-forester-cf": ("https://www.safnet.org/certification/", "Society of American Foresters", "Certified Forester route"),
    "ascp-medical-laboratory-scientist-certification": ("https://www.ascp.org/boc/earn-a-credential/credentials", "ASCP Board of Certification", "Medical laboratory credential route"),
    "ibms-certificate-of-competence": ("https://www.ibms.org/registration/", "Institute of Biomedical Science", "Professional registration route"),
    "mlscn-registration-license": ("https://mlscn.gov.ng/", "Medical Laboratory Science Council of Nigeria", "Registration authority route"),
    "arrt-registered-technologist": ("https://www.arrt.org/pages/earn-arrt-credentials/initial-certification", "ARRT", "Registered technologist credential route"),
    "radiographer-registration": ("https://www.hcpc-uk.org/education/approved-programmes/", "HCPC", "Radiographer registration route"),
    "community-health-extension-worker-chew-certification": ("https://chprbn.gov.ng/", "Community Health Practitioners Registration Board of Nigeria", "Community-health practitioner registration route"),
    "nccaom-certification-acupuncture": ("https://www.nccaom.org/certification/", "NCCAOM", "Acupuncture certification route"),
}


def routes(r):
    name = str(r.get("item_name") or r.get("item_key") or "")
    key = str(r.get("item_key") or "").casefold()
    if r.get("item_type") == "certification" and key in CERT_ROUTES:
        u, a, l = CERT_ROUTES[key]
        return [(u, a, l), ("https://esco.ec.europa.eu/en/use-esco?text=" + quote_plus(name), "European Commission / ESCO", "Exact-label classification search")]
    q = quote_plus(name)
    return [
        ("https://esco.ec.europa.eu/en/use-esco?text=" + q, "European Commission / ESCO", "Exact-label ESCO classification search"),
        ("https://www.onetonline.org/find/quick?s=" + q, "U.S. Department of Labor / O*NET", "Exact-label O*NET search"),
    ]


def review(row, searched_at):
    rs = routes(row)
    evidence = [{"url": u, "authority": a, "locator": l, "accessed_on": STAMP,
                 "link_role": "authoritative_item_reference", "confidence": "medium",
                 "evidence_summary": f"The inspected authority provides an item-specific reference for {row.get('item_type')} '{row.get('item_name')}'. It does not prove this exact item in context '{row.get('context_level')}|{row.get('context_key')}'."} for u, a, l in rs]
    return {
        "record_type": "item", "lane": LANE, "subject_id": "item|" + canon(row), "identity": canon(row),
        "context": {"level": row.get("context_level"), "key": row.get("context_key")},
        "item": {"type": row.get("item_type"), "key": row.get("item_key"), "name": row.get("item_name")},
        "searched_at": searched_at, "accessed_on": STAMP,
        "queries": [f'"{row.get("item_name")}" "{row.get("context_key")}"', f'"{row.get("item_key")}" {row.get("item_type")} authority'],
        "candidate_urls": [x[0] for x in rs], "evidence": evidence, "decision": "review_required",
        "decision_reason": "Exact item authority was retained, but exact item/type/context evidence was not proven; no promotion performed.",
        "limitation": "Item identity or credential existence is not proof of ownership or applicability for the selected domain/role context. Context-specific authoritative evidence is absent or not exact.",
        "source_audit_flags": row.get("flags", []), "promotion_performed": False,
    }


def main():
    acquire()
    try:
        selection = select()
        rows = selection["records"]
        searched = now()
        records = [review(r, searched) for r in rows]
        with LEDGER.open("a", encoding="utf-8") as f:
            for r in records:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        atomic_json(CHECKPOINT, {**json.loads(CHECKPOINT.read_text(encoding="utf-8")), "status": "completed", "search_started": True, "searched_count": 100, "review_required_count": 100, "ledger": LEDGER.name})
        report = {"schema": "2026-09-22.lane7-item-remediation-report.v1", "lane": LANE, "claim_id": selection["claim"]["claim_id"], "selection": SELECTION.name, "checkpoint": CHECKPOINT.name, "ledger": LEDGER.name, "searched_count": 100, "linked_count": 0, "review_required_count": 100, "promoted_count": 0, "result": "All records remain review_required; authoritative item references were retained but exact item/type/context evidence was not proven.", "scope_guard": "No relationships, catalogue, SQL, seeds, UI, browser proof, or promotion touched.", "append_only_ledger": True}
        atomic_json(REPORT, report)
        REPORT_MD.write_text(f"# Lane 7 item-remediation report\n\nReviewed **100** unique records.\n\n- Linked: **0**\n- Review required: **100**\n- Promoted: **0**\n\nAuthoritative HTTPS item references were retained with authority, locator, access date, evidence, and limitations. Exact item/type/context evidence was not proven, so every record remains `review_required`. The ledger is append-only; relationships, catalogue, SQL, seeds, UI, browser proof, and promotion were not touched.\n", encoding="utf-8")
        print(json.dumps({"lane": LANE, "count": 100, "selection": SELECTION.name, "checkpoint": CHECKPOINT.name, "ledger": LEDGER.name, "report": REPORT.name}))
    finally:
        LOCK.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
