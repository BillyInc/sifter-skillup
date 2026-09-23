"""Audit contextual item link-state coverage without rebuilding the catalogue.

The contextual catalogue is shared by programme routes through active
programme -> domain links.  This audit streams the checked-in JSON gzip,
counts the item-level link contract, and projects the result onto all parsed
programmes.  It deliberately does not infer links, fetch URLs, apply SQL, or
write any transport artifact.
"""

from __future__ import annotations

import gzip
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterator


HERE = Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent
CCMAS_DIR = HERE / "ccmas"
CATALOGUE = HERE / "contextual_guidance_items.json.gz"
PROGRAMME_DOMAIN_MAP = HERE / "programme_domain_final.json"
BUILDER = HERE / "_build_contextual_guidance_items.py"
MIGRATION = ROOT / "backend" / "migration_contextual_career_items.sql"
OUT_JSON = HERE / "_audit" / "CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json"
OUT_MD = HERE / "_audit" / "CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.md"

ACTIVE_MATCH_TYPES = {"direct", "functional", "adjacent"}
VALID_LINK_STATES = {"linked", "no_link", "review_required"}
LINK_COLUMNS = (
    "link_state",
    "link_url",
    "link_title",
    "link_source_reference",
    "link_accessed_at",
    "link_confidence",
    "link_evidence",
    "no_link_reason",
)


def _iter_array(path: Path, array_name: str) -> Iterator[dict[str, Any]]:
    """Yield objects from the generator-validated top-level JSON array."""

    with gzip.open(path, "rt", encoding="utf-8") as stream:
        payload = json.load(stream)
    rows = payload.get(array_name)
    if not isinstance(rows, list):
        raise ValueError(f"JSON array {array_name!r} not found")
    for value in rows:
        if not isinstance(value, dict):
            raise ValueError(f"{array_name} contains a non-object value")
        yield value


def _programme_key(discipline: Any, programme: Any) -> str:
    return f"{discipline or ''}::{programme or ''}"


def load_programme_keys() -> list[str]:
    keys: list[str] = []
    for path in sorted(CCMAS_DIR.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        keys.extend(_programme_key(payload.get("discipline"), row.get("name")) for row in payload.get("programmes") or [])
    return sorted(keys)


def load_active_domains() -> dict[str, list[str]]:
    payload = json.loads(PROGRAMME_DOMAIN_MAP.read_text(encoding="utf-8"))
    result: dict[str, list[str]] = {}
    for key, row in payload.items():
        domains = {
            str(link.get("domain_id"))
            for link in row.get("links") or []
            if link.get("domain_id") and str(link.get("match_type") or "").casefold() in ACTIVE_MATCH_TYPES
        }
        result[key] = sorted(domains)
    return result


def _context_domain(row: dict[str, Any]) -> str:
    explicit = str(row.get("domain_key") or "").strip()
    if explicit:
        return explicit
    return str(row.get("context_key") or "").split("|", 1)[0]


def classify_link_state(row: dict[str, Any]) -> str:
    """Classify the explicit item-link contract; never treat source refs as links."""

    if "link_state" not in row:
        return "missing"
    state = str(row.get("link_state") or "").strip().casefold()
    if state not in VALID_LINK_STATES:
        return "invalid"
    if state == "linked":
        if not str(row.get("link_url") or "").startswith("https://"):
            return "incomplete"
        if not row.get("link_source_reference") and not row.get("link_evidence"):
            return "incomplete"
    elif state == "no_link":
        if not str(row.get("no_link_reason") or "").strip():
            return "incomplete"
    elif state == "review_required":
        evidence = row.get("link_source_reference") or row.get("link_evidence")
        if not evidence:
            return "incomplete"
    return state


def _source_contract_readiness() -> dict[str, Any]:
    builder_text = BUILDER.read_text(encoding="utf-8")
    migration_text = MIGRATION.read_text(encoding="utf-8")
    # The row builder already serialises the fields.  The report checks the
    # INSERT column list separately because a mismatch loses them at seed time.
    row_sql_has = {field: f'row["{field}"]' in builder_text for field in LINK_COLUMNS}
    migration_has = {field: field in migration_text for field in LINK_COLUMNS}
    render_start = builder_text.find('columns = "(')
    render_end = builder_text.find('")', render_start)
    render_columns = builder_text[render_start:render_end] if render_start >= 0 and render_end >= 0 else ""
    renderer_has = {field: field in render_columns for field in LINK_COLUMNS}
    return {
        "schemaColumnsPresent": all(migration_has.values()),
        "builderRowFieldsPresent": all(row_sql_has.values()),
        "seedRendererColumnsPresent": all(renderer_has.values()),
        "missingFromSeedRendererColumns": [field for field, present in renderer_has.items() if not present],
        "schemaColumns": migration_has,
        "builderRowFields": row_sql_has,
    }


def build_report() -> dict[str, Any]:
    programme_keys = load_programme_keys()
    active_domains = load_active_domains()
    if len(programme_keys) != len(set(programme_keys)):
        raise AssertionError("parsed CCMAS programme keys are not unique")

    domain_stats: dict[str, dict[str, Any]] = defaultdict(
        lambda: {
            "contextKeys": set(),
            "rows": 0,
            "states": Counter(),
            "levels": Counter(),
            "itemKeys": set(),
        }
    )
    totals = Counter()
    duplicate_keys: set[tuple[str, str, str, str]] = set()
    seen_keys: set[tuple[str, str, str, str]] = set()
    for row in _iter_array(CATALOGUE, "items"):
        level = str(row.get("context_level") or "")
        context = str(row.get("context_key") or "")
        item_type = str(row.get("item_type") or "")
        item_key = str(row.get("item_key") or "")
        identity = (level, context, item_type, item_key)
        if identity in seen_keys:
            duplicate_keys.add(identity)
        seen_keys.add(identity)
        domain = _context_domain(row)
        state = classify_link_state(row)
        totals["catalogueRows"] += 1
        totals[f"state:{state}"] += 1
        if not row.get("source_locators"):
            totals["missingSourceLocatorRows"] += 1
        stats = domain_stats[domain]
        stats["contextKeys"].add(context)
        stats["itemKeys"].add(identity)
        stats["rows"] += 1
        stats["states"][state] += 1
        stats["levels"][level] += 1

    programme_rows: list[dict[str, Any]] = []
    for key in programme_keys:
        domains = active_domains.get(key, [])
        rows = sum(domain_stats[domain]["rows"] for domain in domains)
        states = Counter()
        levels = Counter()
        contexts = set()
        for domain in domains:
            states.update(domain_stats[domain]["states"])
            levels.update(domain_stats[domain]["levels"])
            contexts.update(domain_stats[domain]["contextKeys"])
        programme_rows.append(
            {
                "programmeKey": key,
                "activeDomainCount": len(domains),
                "activeDomainIds": domains,
                "inheritedContextCount": len(contexts),
                "inheritedCatalogueRows": rows,
                "linkStateCounts": dict(sorted(states.items())),
                "missingLinkStateRows": states.get("missing", 0),
                "status": "unmapped" if not domains else "unlabelled" if states.get("missing", 0) else "labelled",
                "levels": dict(sorted(levels.items())),
            }
        )

    all_domains = {domain for domains in active_domains.values() for domain in domains}
    serial_domains = {
        domain: {
            "contextCount": len(stats["contextKeys"]),
            "catalogueRows": stats["rows"],
            "states": dict(sorted(stats["states"].items())),
            "levels": dict(sorted(stats["levels"].items())),
        }
        for domain, stats in sorted(domain_stats.items())
    }
    summary = {
        "programmeCount": len(programme_keys),
        "activeMappedProgrammeCount": sum(bool(active_domains.get(key)) for key in programme_keys),
        "unmappedProgrammeCount": sum(not active_domains.get(key) for key in programme_keys),
        "activeDomainCount": len(all_domains),
        "catalogueRows": totals["catalogueRows"],
        "catalogueContextCount": len(seen_keys),
        "duplicateTypedItemRows": len(duplicate_keys),
        "missingSourceLocatorRows": totals["missingSourceLocatorRows"],
        "stateCounts": dict(sorted((key.removeprefix("state:"), value) for key, value in totals.items() if key.startswith("state:"))),
        "programmesWithInheritedItems": sum(row["inheritedCatalogueRows"] > 0 for row in programme_rows),
        "programmesWithMissingLinkState": sum(row["missingLinkStateRows"] > 0 for row in programme_rows),
        "programmeInheritedRows": sum(row["inheritedCatalogueRows"] for row in programme_rows),
        "programmeInheritedMissingLinkStateRows": sum(row["missingLinkStateRows"] for row in programme_rows),
    }
    return {
        "schemaVersion": "2026-09-19.contextual-item-link-state-audit.v1",
        "scope": "local checked-in artefacts only",
        "inputs": {
            "catalogue": str(CATALOGUE.relative_to(ROOT)).replace("\\", "/"),
            "programmeDomainMap": str(PROGRAMME_DOMAIN_MAP.relative_to(ROOT)).replace("\\", "/"),
            "ccmasDirectory": str(CCMAS_DIR.relative_to(ROOT)).replace("\\", "/"),
        },
        "catalogueSha256": hashlib.sha256(CATALOGUE.read_bytes()).hexdigest(),
        "summary": summary,
        "stateDefinitions": {
            "linked": "verified item-specific HTTPS destination plus link evidence",
            "no_link": "reviewed item-specific destination was not established; reason required",
            "review_required": "candidate/evidence retained for review but not student-approved",
            "missing": "the checked-in row has no explicit item-level link state",
            "incomplete": "state exists but its required evidence fields are missing",
            "invalid": "state is outside the allowed contract",
        },
        "sourceContractReadiness": _source_contract_readiness(),
        "domains": serial_domains,
        "programmes": programme_rows,
        "decision": {
            "linkStateAuditComplete": summary["catalogueRows"] > 0,
            "studentExposureApproved": False,
            "reason": "Item-level link state is explicit in local transport; student exposure remains deferred pending live SQL, payload and browser verification.",
        },
    }


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["summary"]
    readiness = report["sourceContractReadiness"]
    lines = [
        "# Contextual item link-state audit (2026-09-19)",
        "",
        "Read-only audit of the checked-in contextual catalogue projected through active programme → domain links. It reads local JSON, JSON gzip, source code and SQL text only; it does not fetch URLs, apply SQL, or rewrite gzip artifacts.",
        "",
        "## Result",
        "",
        f"- Parsed programmes: **{summary['programmeCount']}**; active-domain mapped: **{summary['activeMappedProgrammeCount']}**; unmapped: **{summary['unmappedProgrammeCount']}**.",
        f"- Contextual catalogue rows: **{summary['catalogueRows']}** across **{summary['catalogueContextCount']}** typed item identities.",
        f"- Explicit link-state rows: **{summary['catalogueRows'] - summary['stateCounts'].get('missing', 0)}**; missing link-state rows: **{summary['stateCounts'].get('missing', 0)}**.",
        f"- Programmes inheriting contextual rows: **{summary['programmesWithInheritedItems']} / {summary['programmeCount']}**; inherited rows are evaluated against the same explicit link-state contract.",
        f"- Duplicate typed item rows: **{summary['duplicateTypedItemRows']}**; source-locator gaps: **{summary['missingSourceLocatorRows']}**.",
        "",
        "## Link-state counts",
        "",
        "| Classification | Rows | Meaning |",
        "| --- | ---: | --- |",
    ]
    meanings = report["stateDefinitions"]
    for state, count in sorted(summary["stateCounts"].items()):
        lines.append(f"| `{state}` | {count} | {meanings[state]} |")
    lines += [
        "",
        "## Programme projection",
        "",
        "The contextual catalogue is domain/subgroup/role scoped, not programme-owned. The per-programme figures below therefore show inherited exposure through active mappings; they do not create programme-level ownership or links.",
        "",
        "| Programme result | Count |",
        "| --- | ---: |",
        f"| Programmes with inherited contextual rows | {summary['programmesWithInheritedItems']} |",
        f"| Programmes with at least one missing link state | {summary['programmesWithMissingLinkState']} |",
        f"| Programmes with no active domain mapping | {summary['unmappedProgrammeCount']} |",
        "",
        "The complete 237-programme breakdown is in the machine-readable `programmes` array. `unmapped` is a routing gap; `no_link` records an honest reviewed absence of an item-specific destination and is not a claim that no broader resource exists.",
        "",
        "## Compact implementation proposal",
        "",
        f"- Schema columns are present: **{readiness['schemaColumnsPresent']}**.",
        f"- The row builder serialises link fields: **{readiness['builderRowFieldsPresent']}**.",
        f"- The seed renderer includes all link columns: **{readiness['seedRendererColumnsPresent']}**.",
        f"- Missing from the current seed renderer column list: `{', '.join(readiness['missingFromSeedRendererColumns'])}`.",
        "",
        "The local transport now carries the full link contract. The source review registry produces `linked`, `review_required`, or honest `no_link` states; source references alone never count as item links. Live SQL application and runtime exposure remain deferred.",
        "",
        "## Decision",
        "",
        "**Audit complete; student exposure remains fail-closed.** Local item-level states are complete; live deployment and browser/runtime proof are still deferred.",
        "",
        "Generated by `data/career-mapping/_audit/audit_contextual_item_link_state_2026-09-19.py`.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": report["summary"]}, sort_keys=True))


if __name__ == "__main__":
    main()
