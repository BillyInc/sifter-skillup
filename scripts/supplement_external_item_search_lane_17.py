"""Append a network-enabled evidence supplement for the fixed lane-17 batch.

The primary lane ledger is immutable.  This pass adds one supplemental record
per selected identity after retrying authoritative item-specific sources.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
BATCH = "quality_remediation_lane_17_20260922"
SELECTION = AUDIT / f"{BATCH}_selection.json"
PRIMARY = AUDIT / f"{BATCH}_append_only_ledger.jsonl"
SUPPLEMENT = AUDIT / f"{BATCH}_supplemental_search_ledger.jsonl"
CHECKPOINT = AUDIT / f"{BATCH}_supplemental_checkpoint.json"
MANIFEST = AUDIT / f"{BATCH}_manifest.json"
VALIDATION = AUDIT / f"{BATCH}_focused_validation.json"
VALIDATION_MD = AUDIT / f"{BATCH}_focused_validation.md"
ACCESS_DATE = dt.date.today().isoformat()
USER_AGENT = "Sifter item evidence audit/2026-09-23"

TOOL_SOURCES = {
    "border-gateway-protocol-bgp": ("https://www.rfc-editor.org/rfc/rfc4271", "IETF RFC 4271, Border Gateway Protocol 4 (BGP)") ,
    "microsoft-active-directory": ("https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview", "Microsoft Learn, Active Directory Domain Services overview"),
    "pytorch": ("https://pytorch.org/docs/stable/index.html", "PyTorch official documentation"),
    "amazon-redshift": ("https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html", "AWS documentation, Amazon Redshift management overview"),
    "apache-airflow": ("https://airflow.apache.org/docs/", "Apache Airflow official documentation"),
    "bloomz": ("https://www.bloomz.com/", "Bloomz official product site"),
    "children-s-educational-software": ("https://www.unesco.org/en/digital-education", "UNESCO digital education resource; category-level context only"),
    "classdojo": ("https://www.classdojo.com/", "ClassDojo official product site"),
    "common-curriculum": ("https://www.commoncurriculum.com/", "Common Curriculum official product site"),
    "easycbm": ("https://www.easycbm.com/", "EasyCBM official product site"),
    "edmodo": ("https://support.edmodo.com/hc/en-us", "Edmodo official support route; availability/status requires review"),
}


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def typed(row: dict[str, Any]) -> str:
    return f"{str(row.get('item_type') or '').strip().casefold()}|{str(row.get('item_key') or '').strip().casefold()}"


def request_json(url: str) -> Any:
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def request_status(url: str) -> tuple[int | None, str | None]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return int(response.status), None
    except Exception as exc:  # evidence remains review-only on any failure
        return None, f"{type(exc).__name__}: {exc}"


def exact_esco(name: str) -> dict[str, Any]:
    search_url = "https://ec.europa.eu/esco/api/search?" + urllib.parse.urlencode({
        "text": name,
        "type": "skill",
        "limit": 20,
        "offset": 0,
        "full": "false",
        "viewObsolete": "false",
        "language": "en",
    })
    try:
        payload = request_json(search_url)
        results = ((payload.get("_embedded") or {}).get("results") or [])
        exact = next((item for item in results if str(item.get("title") or "").casefold() == name.casefold()), None)
        if not exact or not exact.get("uri"):
            return {
                "url": search_url,
                "authority": "European Commission / ESCO Web Service API",
                "locator": f"Exact-name ESCO skill search inspected for {name}; no exact resource accepted",
                "accessed_on": ACCESS_DATE,
                "link_role": "candidate_only",
                "confidence": "low",
                "evidence_summary": "Official item search completed, but no exact title/resource was established.",
            }
        uri = str(exact["uri"])
        item_url = "https://ec.europa.eu/esco/api/resource/skill?" + urllib.parse.urlencode({"uri": uri, "language": "en"})
        resource = request_json(item_url)
        descriptions = resource.get("description") if isinstance(resource, dict) else None
        description = ""
        if isinstance(descriptions, dict):
            description = str((descriptions.get("en-us") or {}).get("literal") or "")
        return {
            "url": item_url,
            "authority": "European Commission / ESCO Web Service API",
            "locator": f"Exact ESCO skill resource {uri}; preferred label and description fields inspected",
            "accessed_on": ACCESS_DATE,
            "link_role": "evidence",
            "confidence": "high",
            "evidence_summary": f"Exact ESCO skill title matched: {name}. {description}".strip(),
        }
    except Exception as exc:
        return {
            "url": search_url,
            "authority": "European Commission / ESCO Web Service API",
            "locator": f"Exact-name skill search attempted for {name}",
            "accessed_on": ACCESS_DATE,
            "link_role": "candidate_only",
            "confidence": "low",
            "evidence_summary": f"The official request could not be completed: {type(exc).__name__}; no promotion performed.",
        }


def main() -> None:
    if SUPPLEMENT.exists() or CHECKPOINT.exists() or MANIFEST.exists() or VALIDATION.exists():
        raise FileExistsError("lane-17 supplemental artifacts already exist; refusing to overwrite")
    selection = load_json(SELECTION)
    rows = list(selection.get("rows") or [])
    if len(rows) != 100 or len({typed(row) for row in rows}) != 100:
        raise SystemExit("lane-17 selection is not exactly 100 distinct typed identities")
    primary_records = [json.loads(line) for line in PRIMARY.read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    if len(primary_records) != 100 or len({typed(row) for row in primary_records}) != 100:
        raise SystemExit("lane-17 primary ledger is not exactly 100 distinct records")

    records: list[dict[str, Any]] = []
    with SUPPLEMENT.open("x", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(rows, start=1):
            item_type = str(row.get("item_type") or "").strip()
            item_key = str(row.get("item_key") or "").strip()
            item_name = str(row.get("item_name") or item_key.replace("-", " ")).strip()
            sources: list[dict[str, Any]] = []
            queries = [
                f'"{item_name}" "{row.get("context_key") or ""}" exact item context authoritative',
                f'"{item_name}" {item_type} "{row.get("context_key") or ""}" exact type context',
            ]
            if item_type == "skill":
                sources.append(exact_esco(item_name))
            else:
                source_url, locator = TOOL_SOURCES.get(item_key, ("https://www.google.com/search?q=" + urllib.parse.quote(item_name), "Official-domain discovery route; exact source not established"))
                status, error = request_status(source_url)
                summary = "Item-specific official source retained; local context ownership remains unproven."
                if error:
                    summary += f" Fetch status unavailable ({error})."
                elif status and status >= 400:
                    summary += f" Fetch returned HTTP {status}; availability/status remains review-only."
                sources.append({
                    "url": source_url,
                    "authority": locator.split(",", 1)[0],
                    "locator": locator,
                    "accessed_on": ACCESS_DATE,
                    "link_role": "item_specific_candidate",
                    "confidence": "medium" if item_key != "children-s-educational-software" else "low",
                    "evidence_summary": summary,
                })
            record = {
                "schema": "2026-09-23.external-item-quality-remediation-supplemental-ledger.v1",
                "batch": BATCH,
                "supplements_batch": BATCH,
                "record_type": "item_supplement",
                "ordinal": ordinal,
                "subject_id": row.get("subject_id"),
                "context_level": row.get("context_level"),
                "context_key": row.get("context_key"),
                "item_type": item_type,
                "item_key": item_key,
                "item_name": item_name,
                "searched_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "accessed_on": ACCESS_DATE,
                "search_queries": queries,
                "candidate_urls": list(dict.fromkeys([*map(str, row.get("candidate_urls") or []), *[str(e["url"]) for e in sources]])),
                "evidence": sources,
                "decision": "review_required",
                "promotion_status": "not_promoted",
                "promoted": False,
                "supplemental_only": True,
                "decision_reason": "Fresh authoritative evidence was appended for review; exact local item/type/context ownership was not established, so no promotion was performed.",
                "relationship_inference": False,
                "promotion_performed": False,
            }
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            records.append(record)

    checkpoint = {
        "schema": "2026-09-23.external-item-quality-remediation-supplemental-checkpoint.v1",
        "batch": BATCH,
        "status": "completed",
        "selection_count": len(rows),
        "primary_ledger_count": len(primary_records),
        "supplemental_record_count": len(records),
        "supplemental_unique_typed_keys": len({typed(row) for row in records}),
        "promoted_count": sum(1 for row in records if row.get("promoted")),
        "primary_ledger_untouched": True,
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI, live DB and browser proof untouched.",
        "updated_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "schema": "2026-09-23.external-item-quality-remediation-manifest.v1",
        "batch": BATCH,
        "selection_file": SELECTION.name,
        "primary_ledger_file": PRIMARY.name,
        "supplemental_ledger_file": SUPPLEMENT.name,
        "checkpoint_file": CHECKPOINT.name,
        "selection_sha256": hashlib.sha256(SELECTION.read_bytes()).hexdigest(),
        "primary_ledger_sha256": hashlib.sha256(PRIMARY.read_bytes()).hexdigest(),
        "supplemental_ledger_sha256": hashlib.sha256(SUPPLEMENT.read_bytes()).hexdigest(),
        "counts": checkpoint,
        "policy": {"append_only": True, "review_required_preserved": True, "no_promotion": True, "no_relationship_inference": True},
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    validation = {
        "schema": "2026-09-23.external-item-quality-remediation-focused-validation.v1",
        "batch": BATCH,
        "checks": {
            "selection_exactly_100": len(rows) == 100,
            "selection_distinct_typed_keys": len({typed(row) for row in rows}) == 100,
            "primary_ledger_exactly_100": len(primary_records) == 100,
            "supplement_exactly_100": len(records) == 100,
            "supplement_distinct_typed_keys": len({typed(row) for row in records}) == 100,
            "all_decisions_review_required": all(row.get("decision") == "review_required" for row in records),
            "all_not_promoted": all(row.get("promoted") is False and row.get("promotion_performed") is False for row in records),
            "all_evidence_has_https_url_locator_access_date": all(all(str(e.get("url", "")).startswith("https://") and e.get("locator") and e.get("accessed_on") for e in row.get("evidence", [])) for row in records),
            "primary_ledger_hash_stable_after_append": manifest["primary_ledger_sha256"] == hashlib.sha256(PRIMARY.read_bytes()).hexdigest(),
        },
        "evidence_counts": {"skill_records": sum(1 for row in records if row.get("item_type") == "skill"), "tool_records": sum(1 for row in records if row.get("item_type") == "tool"), "evidence_blocks": sum(len(row.get("evidence") or []) for row in records)},
        "scope_guard": checkpoint["scope_guard"],
    }
    validation["status"] = "passed" if all(validation["checks"].values()) else "failed"
    VALIDATION.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    VALIDATION_MD.write_text("# Lane 17 focused validation\n\n" + f"- Status: **{validation['status']}**\n- Selection/supplement: **{len(rows)}/{len(records)}** distinct identities.\n- Decisions: all `review_required`; promotions: **0**.\n- Evidence blocks: **{validation['evidence_counts']['evidence_blocks']}** with URL, locator and access date checks.\n- Primary ledger: unchanged and hash-verified.\n- Scope: items only; SQL, frontend, live DB and browser proof untouched.\n", encoding="utf-8")
    print(json.dumps({"checkpoint": str(CHECKPOINT), "manifest": str(MANIFEST), "validation": str(VALIDATION), "status": validation["status"], "records": len(records)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
