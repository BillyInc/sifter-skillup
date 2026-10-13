"""Build a read-only inventory for exhaustive external-source enrichment.

This agent-facing inventory is intentionally separate from the existing
enrichment prototype.  It does not write SQL, generated transport, UI files,
or a canonical search ledger.  It reads the compressed contextual catalogue,
classifies every item and relationship into discovery/verification work, and
records the exact queues that still need item-specific evidence.

The important distinction is that an existing ``linked`` or
``source_backed`` row is not proof that an internet search was recorded.  In
the absence of a canonical ledger, those rows belong to a verification queue.
Likewise, ``no_link`` and ``not_established`` are current data states, not
proof of a completed search or of genuine unavailability.
"""

from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterator


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
DEFAULT_OUTPUT = AUDIT_DIR / "external_enrichment_inventory_2026-09-20.json"
DEFAULT_MARKDOWN = AUDIT_DIR / "external_enrichment_inventory_2026-09-20.md"


def repo_relative(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix().replace("\\", "/")


def iter_array(path: Path, name: str, chunk_size: int = 8 << 20) -> Iterator[dict[str, Any]]:
    """Yield objects in a top-level JSON array using bounded memory."""

    decoder = json.JSONDecoder()
    marker = f'"{name}":'
    buffer = ""
    cursor = 0
    found = False
    started = False
    eof = False
    with gzip.open(path, "rb") as stream:
        while True:
            block = stream.read(chunk_size)
            if block:
                buffer += block.decode("utf-8")
            else:
                eof = True
            if not found:
                position = buffer.find(marker)
                if position < 0:
                    if eof:
                        raise ValueError(f"JSON array marker not found: {name}")
                    buffer = buffer[-len(marker) :]
                    continue
                cursor = position + len(marker)
                found = True
            if not started:
                while cursor < len(buffer) and buffer[cursor].isspace():
                    cursor += 1
                if cursor >= len(buffer):
                    if eof:
                        raise ValueError(f"Missing opening bracket for {name}")
                    continue
                if buffer[cursor] != "[":
                    raise ValueError(f"Expected an array after {name}")
                cursor += 1
                started = True
            while True:
                while cursor < len(buffer) and (buffer[cursor].isspace() or buffer[cursor] == ","):
                    cursor += 1
                if cursor >= len(buffer):
                    break
                if buffer[cursor] == "]":
                    return
                try:
                    value, end = decoder.raw_decode(buffer, cursor)
                except json.JSONDecodeError:
                    break
                if not isinstance(value, dict):
                    raise ValueError(f"{name} contains a non-object")
                yield value
                cursor = end
            if eof:
                raise ValueError(f"Unexpected end of {name}")
            if cursor > chunk_size:
                buffer = buffer[cursor:]
                cursor = 0


def state(row: dict[str, Any], relationship: bool = False) -> str:
    if relationship:
        return str(row.get("data_state") or row.get("relationship_status") or "missing").strip().casefold()
    return str(row.get("link_state") or "missing").strip().casefold()


def queue_class(current: str, relationship: bool) -> str:
    if relationship:
        return "discovery" if current in {"not_established", "unresolved", "review_only", "missing"} else "verification"
    return "discovery" if current in {"no_link", "missing", "review_required"} else "verification"


def load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    value = json.loads(path.read_text(encoding="utf-8"))
    return value if isinstance(value, dict) else None


def count_prior_claims(audit_root: Path) -> dict[str, Any]:
    """Count prior batch claims without treating them as a canonical ledger."""

    files = [
        audit_root / "external_source_enrichment_item_batch_001_reviewed_2026-09-19.json",
        audit_root / "external_source_enrichment_relationship_batch_001_reviewed_2026-09-19.json",
        audit_root / "source_enrichment_batch_2026-09-19.json",
        audit_root / "source_enrichment_batch_generic_2026-09-19.json",
        audit_root / "source_enrichment_batch_tiny_2026-09-19.json",
    ]
    result: dict[str, Any] = {"files": [], "record_count": 0, "decisions": {}}
    decisions: Counter[str] = Counter()
    for path in files:
        payload = load_json(path)
        if payload is None:
            continue
        rows = payload.get("records", payload.get("rows", []))
        if not isinstance(rows, list):
            continue
        local = Counter(str(row.get("decision") or "unknown") for row in rows if isinstance(row, dict))
        result["files"].append({"path": repo_relative(path), "records": len(rows), "decisions": dict(sorted(local.items()))})
        result["record_count"] += len(rows)
        decisions.update(local)
    result["decisions"] = dict(sorted(decisions.items()))
    result["canonical_ledger_rows"] = 0
    result["interpretation"] = (
        "Prior batch files are evidence candidates only. They are not counted as completed "
        "searches because no canonical ledger reconciles their subject IDs, URLs, locators, "
        "access dates and exact context against the full catalogue."
    )
    return result


def build_inventory(catalogue: Path) -> dict[str, Any]:
    item_states: Counter[str] = Counter()
    item_types: Counter[str] = Counter()
    item_contexts: Counter[tuple[str, str]] = Counter()
    item_source_ids: Counter[str] = Counter()
    relationship_states: Counter[str] = Counter()
    relationship_types: Counter[str] = Counter()
    relationship_contexts: Counter[tuple[str, str]] = Counter()
    relationship_source_ids: Counter[str] = Counter()
    relationship_endpoints: Counter[str] = Counter()
    missing_endpoint_type = 0
    missing_endpoint_key = 0
    item_rows = 0
    relationship_rows = 0

    for row in iter_array(catalogue, "items"):
        item_rows += 1
        current = state(row)
        item_states[current] += 1
        item_types[str(row.get("item_type") or "unknown")] += 1
        context = (str(row.get("context_level") or "missing"), str(row.get("context_key") or "missing"))
        item_contexts[context] += 1
        for source_id in row.get("source_ids") or []:
            item_source_ids[str(source_id)] += 1

    for row in iter_array(catalogue, "relationships"):
        relationship_rows += 1
        current = state(row, relationship=True)
        relationship_states[current] += 1
        relationship_types[str(row.get("relationship_type") or "missing")] += 1
        context = (str(row.get("context_level") or "missing"), str(row.get("context_key") or "missing"))
        relationship_contexts[context] += 1
        for source_id in row.get("source_ids") or []:
            relationship_source_ids[str(source_id)] += 1
        for prefix in ("from", "to"):
            endpoint_type = str(row.get(f"{prefix}_item_type") or "").strip()
            endpoint_key = str(row.get(f"{prefix}_item_key") or "").strip()
            if not endpoint_type:
                missing_endpoint_type += 1
            if not endpoint_key:
                missing_endpoint_key += 1
            relationship_endpoints[endpoint_type or "missing"] += 1

    item_discovery = sum(value for key, value in item_states.items() if key in {"no_link", "missing", "review_required"})
    item_verification = item_rows - item_discovery
    relationship_discovery = sum(value for key, value in relationship_states.items() if key in {"not_established", "unresolved", "review_only", "missing"})
    relationship_verification = relationship_rows - relationship_discovery
    canonical_pending = item_rows + relationship_rows

    audit_root = ROOT / "data" / "career-mapping" / "_audit"
    prior_claims = count_prior_claims(audit_root)
    canonical_ledger = AUDIT_DIR / "search_ledger.jsonl"

    return {
        "schema": "2026-09-20.external-enrichment-agent.inventory.v1",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "accessed_on": dt.date.today().isoformat(),
        "scope": {
            "catalogue": repo_relative(catalogue),
            "canonical_programme_count": 237,
            "canonical_jamb_identity_count": 420,
            "context_count": len(set(item_contexts) | set(relationship_contexts)),
        },
        "counts": {
            "contextual_item_rows": item_rows,
            "contextual_relationship_rows": relationship_rows,
            "all_rows_requiring_canonical_search_evidence": canonical_pending,
            "item_rows_requiring_canonical_search_evidence": item_rows,
            "relationship_rows_requiring_canonical_search_evidence": relationship_rows,
            "item_discovery_queue": item_discovery,
            "item_verification_queue": item_verification,
            "relationship_discovery_queue": relationship_discovery,
            "relationship_verification_queue": relationship_verification,
            "relationship_endpoint_type_missing": missing_endpoint_type,
            "relationship_endpoint_key_missing": missing_endpoint_key,
        },
        "item_states": dict(sorted(item_states.items())),
        "item_types": dict(sorted(item_types.items())),
        "relationship_states": dict(sorted(relationship_states.items())),
        "relationship_types": dict(sorted(relationship_types.items())),
        "context_counts": {
            "items_by_level": dict(sorted(Counter({level: sum(count for (context_level, _), count in item_contexts.items() if context_level == level) for level, _ in item_contexts}).items())),
            "relationships_by_level": dict(sorted(Counter({level: sum(count for (context_level, _), count in relationship_contexts.items() if context_level == level) for level, _ in relationship_contexts}).items())),
        },
        "source_id_counts": {
            "items": dict(sorted(item_source_ids.items())),
            "relationships": dict(sorted(relationship_source_ids.items())),
        },
        "relationship_endpoint_types": dict(sorted(relationship_endpoints.items())),
        "queues": [
            {
                "name": "items.discovery",
                "rows": item_discovery,
                "selector": "item.link_state in {no_link, missing, review_required}",
                "purpose": "Search for an item-specific authoritative learning, documentation, official or reference destination.",
            },
            {
                "name": "items.verification",
                "rows": item_verification,
                "selector": "item.link_state not in {no_link, missing, review_required}",
                "purpose": "Re-verify existing links; a pre-existing linked state is not search-ledger evidence.",
            },
            {
                "name": "relationships.discovery",
                "rows": relationship_discovery,
                "selector": "relationship state in {not_established, unresolved, review_only, missing}",
                "purpose": "Search for exact typed endpoint, context and relationship-type evidence; do not infer an edge.",
            },
            {
                "name": "relationships.verification",
                "rows": relationship_verification,
                "selector": "relationship state not in {not_established, unresolved, review_only, missing}",
                "purpose": "Re-verify source-backed edges against an item-specific URL and exact same-context endpoints.",
            },
        ],
        "canonical_search_ledger": {
            "path": repo_relative(canonical_ledger),
            "exists": canonical_ledger.exists(),
            "rows": 0 if not canonical_ledger.exists() else sum(1 for line in canonical_ledger.read_text(encoding="utf-8").splitlines() if line.strip()),
            "search_evidence_complete_for_any_queue_row": False,
            "reason": "No canonical ledger is present; prior batch files are retained as unreconciled claims.",
        },
        "prior_batch_claims": prior_claims,
        "state_policy": {
            "linked": "A canonical record with an HTTPS item-specific URL, authority, locator, access date, exact context and review decision. For a relationship, the evidence must name both typed endpoints in the same context and the relationship type.",
            "review_required": "Searches were attempted, but evidence is incomplete, ambiguous, conflicting, generic, stale, or does not establish the exact item/edge. Keep out of student guidance.",
            "genuinely_unavailable": "Only after the minimum search protocol is complete, all attempts and candidate URLs are recorded, and no usable authoritative item-specific destination or exact edge evidence exists.",
            "not_searched": "Internal work-queue state only; never present it as no link or unavailable.",
            "current_data_states_are_not_search_proof": True,
        },
        "sql_transport_browser": {
            "sql_touched": False,
            "generated_gzip_touched": False,
            "ui_touched": False,
            "browser_proof_attempted": False,
        },
    }


def markdown_report(payload: dict[str, Any]) -> str:
    counts = payload["counts"]
    item_states = payload["item_states"]
    relationship_states = payload["relationship_states"]
    prior = payload["prior_batch_claims"]
    lines = [
        "# External-source enrichment agent inventory",
        "",
        f"Generated: `{payload['generated_at']}`. This is a read-only design/inventory pass.",
        "",
        "## Scope and exact remaining queues",
        "",
        "The canonical contextual catalogue contains **126,414 item rows** and **422,739 relationship rows**. Because no canonical search ledger exists, every row still requires reconciliation against an authoritative, item-specific source—even rows currently marked linked or source-backed.",
        "",
        "| Queue | Rows | Meaning |",
        "|---|---:|---|",
        f"| Items — discovery | {counts['item_discovery_queue']:,} | Current `no_link`, `missing` or `review_required` item states needing search |",
        f"| Items — verification | {counts['item_verification_queue']:,} | Existing linked states needing item-specific URL/locator/access-date verification |",
        f"| Relationships — discovery | {counts['relationship_discovery_queue']:,} | `not_established`, unresolved, review-only or missing edges needing exact-edge search |",
        f"| Relationships — verification | {counts['relationship_verification_queue']:,} | Existing source-backed edges needing exact typed-endpoint verification |",
        f"| **All canonical rows pending ledger evidence** | **{counts['all_rows_requiring_canonical_search_evidence']:,}** | Items plus relationships; no rows are silently treated as searched |",
        "",
        "Current item states: " + ", ".join(f"`{key}` {value:,}" for key, value in item_states.items()) + ".",
        "Current relationship states: " + ", ".join(f"`{key}` {value:,}" for key, value in relationship_states.items()) + ".",
        "",
        "## Why the previous counts were misleading",
        "",
        "`no_link` means the catalogue currently has no attached link; it does not mean an exhaustive internet search found nothing. `not_established` means the normalized relationship contract did not establish an exact edge; it does not mean every authoritative source was searched. The prior batch JSON files contain 36 candidate records, but they are not a canonical ledger and are therefore not deducted from the queues.",
        "",
        f"Prior batch claims on disk: **{prior['record_count']:,}** across {len(prior['files'])} files; canonical ledger rows: **{payload['canonical_search_ledger']['rows']:,}**.",
        "",
        "## Search protocol",
        "",
        "1. Create a stable subject ID from context level, context key, typed item key, and (for edges) typed source/target keys plus relationship type.",
        "2. Search exact name plus context using quoted phrases, official-domain filters and recorded aliases. Repeat with source identifiers, course codes, credential codes, product/version names and Nigerian institution/authority terms where applicable.",
        "3. Open the candidate page or document. A search-result snippet, generic homepage, category page, search URL, unrelated provider page or co-occurrence is not evidence.",
        "4. Record the authority, HTTPS URL, page/PDF section or stable anchor, access date, evidence summary, search queries, candidate URLs, context, confidence and limitations.",
        "5. For a relationship, require one source (or a clearly joined evidence set) to identify both typed endpoints, the same context, and the specific `builds_on`/`works_with`/other relationship type. Technology definitions alone do not establish a role-specific edge.",
        "6. Set `linked` only when the item or exact edge passes the evidence gate. Set `review_required` when the search was attempted but the evidence is generic, incomplete, conflicting, stale, or only supports one endpoint. Set `genuinely_unavailable` only after the minimum search attempts are fully recorded and no acceptable source exists.",
        "7. Keep the ledger append-only and idempotent. A later source can supersede an earlier candidate, but it must not erase the earlier query, URL, locator, access date or decision.",
        "",
        "## Authority routing",
        "",
        "- Programme identity, eligibility and subject combinations: JAMB IBASS/brochure records; retain the exact programme locator.",
        "- CCMAS curriculum: NUC CCMAS documents and official Nigerian university curriculum/course pages or PDFs; retain course code, page and row/section.",
        "- Skills and competencies: the issuing standards body, official professional framework, official university teaching material or official public-sector guidance; a broad taxonomy landing page is supporting evidence, not automatically an item link.",
        "- Tools and methods: official vendor documentation, standards/specification pages, official manuals or maintained project documentation for the exact named tool/method/version.",
        "- Certifications and qualifications: the issuing body’s exact credential page and exam/eligibility guide; record whether it is a licence, examination, qualification, training route or reference body.",
        "- Relationships: curriculum, workflow, standard or role-specific source that names both endpoints and the relationship in the current context. Never create an edge from frequency, adjacency, name similarity or a generic source category.",
        "",
        "## Safety boundary",
        "",
        "This pass writes only the new agent inventory/design artifacts. It does not modify SQL, generated gzip, UI, the canonical data catalogue, or browser proof. Student exposure remains fail-closed until the ledger, source review and downstream acceptance checks agree.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalogue", type=Path, default=CATALOGUE)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--markdown-output", type=Path, default=DEFAULT_MARKDOWN)
    args = parser.parse_args()
    payload = build_inventory(args.catalogue)
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    args.markdown_output.write_text(markdown_report(payload), encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
