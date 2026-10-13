"""Deterministic, review-only reconciliation for role routes in D001-D056.

The script deliberately does not edit canonical role or taxonomy files.  It
combines the current role inventory with local ESCO, O*NET, WEF and ISCO
evidence, then classifies every role/domain and role/area route.  A title or
ISCO membership is never sufficient: task/work-activity evidence is required
for a positive route.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable


LANE_DIR = Path(__file__).resolve().parent
ROOT = LANE_DIR.parents[4]
CAREER = ROOT / "data" / "career-mapping"
ROLE_FILES = [
    CAREER / "role_library_v3_cleaned.json",
    CAREER / "thin_domain_role_overlays.json",
    CAREER / "emerging_role_overlays.json",
]
RAW_ROLE_FILE = CAREER / "role_library_v3.json"
DOMAIN_META = CAREER / "domain_meta.json"
DOMAIN_STRUCTURE = CAREER / "domain_structure.json"
SPECIALIZATION_CATALOG = CAREER / "domain_specialization_catalog.json"
ESCO_OCCUPATIONS = ROOT / "docs" / "esco_occupations_skills.json"
ESCO_TAXONOMY = CAREER / "taxonomies" / "esco_occupations.json"
ISCO_GROUPS = CAREER / "taxonomies" / "esco_isco_groups.json"
WEF_ROLES = CAREER / "taxonomies" / "wef_2025_roles.json"
ONET_DIR = CAREER / "_source_extracts" / "onet_31_0"

OUT_JSON = LANE_DIR / "D001_D056_role_reconciliation_2026_10_07.json"
OUT_MD = LANE_DIR / "D001_D056_role_reconciliation_2026_10_07.md"
CHECKPOINT_JSON = LANE_DIR / "D001_D056_checkpoint_2026_10_07.json"
CHECKPOINT_MD = LANE_DIR / "D001_D056_checkpoint_2026_10_07.md"

TARGET_DOMAINS = {f"D{i:03d}" for i in range(1, 57)}
TODAY = "2026-10-07"

STOPWORDS = {
    "and", "the", "for", "with", "from", "into", "that", "this", "their",
    "they", "them", "are", "was", "were", "will", "have", "has", "been",
    "being", "may", "can", "use", "using", "used", "work", "works", "working",
    "role", "roles", "job", "jobs", "provide", "provides", "support", "supports",
    "develop", "develops", "development", "manage", "manages", "management",
    "ensure", "including", "such", "other", "related", "various", "general",
    "systems", "system", "process", "processes", "activities", "perform", "performs",
    "responsible", "responsibilities", "ability", "knowledge", "skills", "skill",
}


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows_from(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict) and isinstance(payload.get("roles"), list):
        return [x for x in payload["roles"] if isinstance(x, dict)]
    return []


def normalize(value: Any) -> str:
    text = str(value or "").casefold().replace("&", " and ")
    text = re.sub(r"\([^)]*\)", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def stem(token: str) -> str:
    if len(token) <= 4:
        return token
    if token.endswith("ies"):
        return token[:-3] + "y"
    for suffix in ("ing", "ers", "er", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 4:
            return token[: -len(suffix)]
    return token


def tokens(value: Any) -> set[str]:
    return {stem(x) for x in normalize(value).split() if len(x) > 2 and x not in STOPWORDS}


def token_overlap(left: set[str], right: set[str]) -> tuple[float, float, int]:
    if not left or not right:
        return 0.0, 0.0, 0
    overlap = left & right
    return len(overlap) / len(right), len(overlap) / len(left), len(overlap)


def source_refs(row: dict[str, Any]) -> list[str]:
    values: list[Any] = []
    for key in (
        "role_domain_routes", "role_area_routes", "domain_fit_review_source_refs",
        "specialization_fit_review_source_refs", "role_task_source_refs",
        "role_source_refs", "source_refs", "sources",
    ):
        value = row.get(key)
        if isinstance(value, list):
            values.extend(value)
        elif isinstance(value, str):
            values.append(value)
    flat: list[str] = []
    for value in values:
        if isinstance(value, dict):
            for key in ("url", "source_url", "source", "ref"):
                if value.get(key):
                    flat.append(str(value[key]))
        elif value:
            flat.append(str(value))
    return sorted(set(flat))


def extract_onet_codes(refs: Iterable[str]) -> list[str]:
    found: set[str] = set()
    for ref in refs:
        found.update(re.findall(r"\b\d{2}-\d{4}\.\d{2}\b", str(ref)))
    return sorted(found)


def alias_list(row: dict[str, Any]) -> list[str]:
    value = row.get("also_known_as") or row.get("aliases") or row.get("alternate_titles") or ""
    if isinstance(value, list):
        return [str(x) for x in value if x]
    return [x for x in re.split(r"\s*[;,|·�]\s*", str(value)) if x.strip()]


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def role_task_text(row: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in (
        "description", "role_description", "role_task_summary", "task_summary",
        "role_tasks", "essential_skills", "optional_skills",
    ):
        value = row.get(key)
        if isinstance(value, list):
            parts.extend(str(x) for x in value)
        elif value:
            parts.append(str(value))
    return " ".join(parts)


def load_onet() -> tuple[dict[str, dict[str, str]], dict[str, list[str]]]:
    occupations: dict[str, dict[str, str]] = {}
    tasks: dict[str, list[str]] = defaultdict(list)
    occupation_path = ONET_DIR / "Occupation Data.txt"
    task_path = ONET_DIR / "Task Statements.txt"
    if occupation_path.exists():
        with occupation_path.open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                code = (row.get("O*NET-SOC Code") or "").strip()
                if code:
                    occupations[code] = {
                        "title": row.get("Title") or "",
                        "description": row.get("Description") or "",
                    }
    if task_path.exists():
        with task_path.open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                code = (row.get("O*NET-SOC Code") or "").strip()
                task = (row.get("Task") or "").strip()
                if code and task:
                    tasks[code].append(task)
    return occupations, dict(tasks)


def load_esco() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_code: dict[str, dict[str, Any]] = {}
    by_label: dict[str, dict[str, Any]] = {}
    payload = read_json(ESCO_OCCUPATIONS, {}) or {}
    for row in payload.get("occupations", []) if isinstance(payload, dict) else []:
        if not isinstance(row, dict):
            continue
        labels = [row.get("preferred_label"), *(row.get("alt_labels") or [])]
        for label in labels:
            if label:
                by_label[normalize(label)] = row
        if row.get("isco_code"):
            by_code[str(row["isco_code"])] = row
    taxonomy = read_json(ESCO_TAXONOMY, {}) or {}
    if isinstance(taxonomy, dict):
        for esco_id, row in taxonomy.items():
            if not isinstance(row, dict):
                continue
            if row.get("code"):
                by_code[str(row["code"])] = {"esco_id": esco_id, **row}
            labels = [row.get("label"), *(row.get("alt_labels") or [])]
            for label in labels:
                if label:
                    by_label[normalize(label)] = {"esco_id": esco_id, **row}
    return by_code, by_label


def source_evidence(row: dict[str, Any], onet_occ: dict[str, dict[str, str]], onet_tasks: dict[str, list[str]], esco_code: dict[str, dict[str, Any]], esco_label: dict[str, dict[str, Any]], isco_groups: dict[str, Any], wef: dict[str, Any]) -> dict[str, Any]:
    refs = source_refs(row)
    onet_codes = extract_onet_codes(refs)
    onet_matches = [onet_occ[x] for x in onet_codes if x in onet_occ]
    onet_task_rows = [task for code in onet_codes for task in onet_tasks.get(code, [])[:12]]
    esco = None
    esco_code_value = str(row.get("esco_code") or "").strip()
    if esco_code_value:
        esco = esco_code.get(esco_code_value) or esco_code.get(esco_code_value.split(".")[0])
    if not esco:
        esco = esco_label.get(normalize(row.get("role_name")))
    esco_task_rows: list[str] = []
    if esco:
        esco_task_rows = [str(esco.get("description") or "")]
        esco_task_rows.extend(str(x) for x in (esco.get("essential_skills") or [])[:20])
    isco_value = str(row.get("isco_group") or "").strip()
    isco = isco_groups.get(isco_value) or isco_groups.get(isco_value[:3]) or isco_groups.get(isco_value[:2])
    role_norm = normalize(row.get("role_name"))
    wef_hits = []
    for key in ("fastest_growing_pct", "fastest_declining_pct", "workforce_strategies", "skills", "roles"):
        for title in wef.get(key, []) if isinstance(wef.get(key), list) else []:
            if role_norm == normalize(title) or role_norm in normalize(title) or normalize(title) in role_norm:
                wef_hits.append(str(title))
    augmented = " ".join(onet_task_rows + esco_task_rows)
    return {
        "source_refs": refs,
        "onet_codes": onet_codes,
        "onet_titles": [x.get("title") for x in onet_matches],
        "onet_descriptions": [x.get("description") for x in onet_matches],
        "onet_tasks": onet_task_rows,
        "esco_match": {k: esco.get(k) for k in ("esco_id", "preferred_label", "label", "code", "isco_code") if esco and esco.get(k)},
        "esco_description": esco.get("description") if esco else None,
        "esco_skills": (esco.get("essential_skills") or [])[:20] if esco else [],
        "isco_group": {"code": isco_value, "label": isco.get("label"), "description": isco.get("description")} if isinstance(isco, dict) else {"code": isco_value},
        "wef_title_hits": sorted(set(wef_hits)),
        "local_source_records": [
            {"source_id": "LOCAL_ESCO_OCCUPATIONS", "file": "docs/esco_occupations_skills.json", "access_date": TODAY, "matched": bool(esco)},
            {"source_id": "LOCAL_ESCO_TAXONOMY", "file": "data/career-mapping/taxonomies/esco_occupations.json", "access_date": TODAY, "matched": bool(esco)},
            {"source_id": "LOCAL_ONET_OCCUPATION_DATA", "file": "data/career-mapping/_source_extracts/onet_31_0/Occupation Data.txt", "access_date": TODAY, "matched": bool(onet_matches)},
            {"source_id": "LOCAL_ONET_TASK_STATEMENTS", "file": "data/career-mapping/_source_extracts/onet_31_0/Task Statements.txt", "access_date": TODAY, "matched": bool(onet_task_rows)},
            {"source_id": "LOCAL_WEF_ROLE_LIST", "file": "data/career-mapping/taxonomies/wef_2025_roles.json", "access_date": TODAY, "matched": bool(wef_hits)},
            {"source_id": "LOCAL_ESCO_ISCO_GROUPS", "file": "data/career-mapping/taxonomies/esco_isco_groups.json", "access_date": TODAY, "matched": bool(isco)},
        ],
        "augmented_task_text": augmented,
        "authority_count": int(bool(onet_matches)) + int(bool(esco)) + int(bool(wef_hits)),
    }


def load_roles() -> tuple[dict[str, dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    all_rows: list[tuple[Path, dict[str, Any]]] = []
    for path in ROLE_FILES:
        for row in rows_from(read_json(path, [])):
            all_rows.append((path, row))
    selected: dict[str, dict[str, Any]] = {}
    provenance: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for path, row in all_rows:
        domain_id = str(row.get("domain_id") or "")
        if domain_id not in TARGET_DOMAINS:
            continue
        key = role_key(row)
        provenance[key].append({"file": path.relative_to(ROOT).as_posix(), "source": row.get("source")})
        # cleaned canonical wins; overlays fill missing evidence only.
        if key not in selected or path.name == "role_library_v3_cleaned.json":
            selected[key] = dict(row)
        else:
            for field in ("description", "essential_skills", "optional_skills", "domain_fit_review_source_refs", "specialization_fit_review_source_refs"):
                if not selected[key].get(field) and row.get(field):
                    selected[key][field] = row[field]
    return selected, provenance


def load_raw_candidates(
    current: dict[str, dict[str, Any]],
    onet_occ: dict[str, dict[str, str]],
    esco_code: dict[str, dict[str, Any]],
    esco_label: dict[str, dict[str, Any]],
    wef: dict[str, Any],
) -> list[dict[str, Any]]:
    raw = [r for r in rows_from(read_json(RAW_ROLE_FILE, [])) if str(r.get("domain_id")) in TARGET_DOMAINS]
    current_norm: dict[str, list[str]] = defaultdict(list)
    current_alias: dict[str, list[str]] = defaultdict(list)
    for key, row in current.items():
        current_norm[f"{row.get('domain_id')}|{normalize(row.get('role_name'))}"].append(key)
        for alias in alias_list(row):
            current_alias[f"{row.get('domain_id')}|{normalize(alias)}"].append(key)
    out: list[dict[str, Any]] = []
    for row in raw:
        key = role_key(row)
        exact = current_norm.get(f"{row.get('domain_id')}|{normalize(row.get('role_name'))}", [])
        alias = current_alias.get(f"{row.get('domain_id')}|{normalize(row.get('role_name'))}", [])
        if exact:
            continue
        refs = source_refs(row)
        onet_matches = [code for code in extract_onet_codes(refs) if code in onet_occ]
        esco_match = None
        if row.get("esco_code"):
            code = str(row.get("esco_code"))
            esco_match = esco_code.get(code) or esco_code.get(code.split(".")[0])
        if not esco_match:
            esco_match = esco_label.get(normalize(row.get("role_name")))
        wef_match = []
        for field in ("fastest_growing_pct", "fastest_declining_pct", "workforce_strategies", "skills", "roles"):
            values = wef.get(field, []) if isinstance(wef.get(field), list) else []
            wef_match.extend(str(x) for x in values if normalize(x) == normalize(row.get("role_name")))
        local_matches = []
        if esco_match:
            local_matches.append("ESCO")
        if onet_matches:
            local_matches.append("O*NET")
        if wef_match:
            local_matches.append("WEF")
        source_family = str(row.get("source") or "").casefold()
        source_backed = bool(local_matches) or source_family in {"esco", "onet", "wef", "isco"} or bool(refs)
        disposition = "duplicate/alias" if alias else ("source-backed candidate" if source_backed else "external/source review")
        out.append({
            "role_key": key,
            "domain_id": str(row.get("domain_id")),
            "role_name": row.get("role_name"),
            "source": row.get("source"),
            "description": row.get("description") or row.get("role_task_summary") or "",
            "existing_alias_matches": sorted(alias),
            "local_source_matches": sorted(set(local_matches)),
            "local_esco_label": (esco_match.get("preferred_label") or esco_match.get("label")) if esco_match else None,
            "local_onet_codes": onet_matches,
            "local_wef_matches": sorted(set(wef_match)),
            "source_backed": source_backed,
            "disposition": disposition,
            "source_refs": refs,
        })
    return out


def area_records(structure: dict[str, Any], domain_id: str) -> list[dict[str, Any]]:
    domain = structure.get(domain_id) or {}
    areas = domain.get("areas_of_specialization") or domain.get("areas") or []
    return [a for a in areas if isinstance(a, dict) and (a.get("area_id") or a.get("area_key"))]


def negative_domain_checks(task_tokens: set[str], current_domain_id: str, all_domains: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    current = all_domains.get(current_domain_id, {})
    current_text = " ".join(str(current.get(k) or "") for k in ("domain_name", "description", "cluster"))
    current_score = token_overlap(task_tokens, tokens(current_text))[2]
    rivals: list[dict[str, Any]] = []
    for domain_id, domain in all_domains.items():
        if domain_id == current_domain_id:
            continue
        text = " ".join(str(domain.get(k) or "") for k in ("domain_name", "description", "cluster"))
        coverage, _, overlap = token_overlap(task_tokens, tokens(text))
        if overlap >= 3 and overlap >= current_score + 2:
            rivals.append({"domain_id": domain_id, "domain_name": domain.get("domain_name", domain_id), "task_overlap": overlap, "coverage": round(coverage, 4)})
    rivals.sort(key=lambda x: (-x["task_overlap"], -x["coverage"], x["domain_id"]))
    return rivals[:3]


def classify_domain(row: dict[str, Any], domain: dict[str, Any], evidence: dict[str, Any], all_domains: dict[str, dict[str, Any]]) -> dict[str, Any]:
    title = str(row.get("role_name") or "")
    task_text = role_task_text(row) + " " + evidence.get("augmented_task_text", "")
    task_tokens = tokens(task_text)
    domain_text = " ".join(str(domain.get(k) or "") for k in ("domain_name", "description", "cluster"))
    name_cov, name_rel, name_n = token_overlap(task_tokens, tokens(domain.get("domain_name")))
    desc_cov, desc_rel, desc_n = token_overlap(task_tokens, tokens(domain_text))
    score = round(0.7 * desc_cov + 0.3 * name_cov, 4)
    current = str(row.get("domain_fit_review_status") or row.get("role_domain_lane_review_status") or "").casefold()
    current_basis = str(row.get("domain_fit_review_basis") or "")
    refs = source_refs(row)
    if not task_text.strip() or not refs and evidence.get("authority_count", 0) == 0:
        status = "external/source review"
        reason = "No sufficiently traceable task/source record is available for a defensible parent-domain decision."
    elif current in {"supported", "reviewed_supported"} and current_basis and refs:
        status = "supported"
        reason = "Existing source-backed domain review retained; task evidence and provenance are present."
    elif current == "unsupported":
        status = "unsupported"
        reason = "Existing review explicitly rejects the parent-domain route; title/ISCO signals cannot override it."
    elif score >= 0.075 or (evidence.get("authority_count", 0) >= 1 and score >= 0.035 and name_n + desc_n >= 2):
        status = "supported"
        reason = "Task/work-activity evidence overlaps the domain scope and has local occupational provenance."
    elif score >= 0.025 or current == "conditional":
        status = "conditional"
        reason = "The route is plausible but the task/domain overlap is incomplete or scope-dependent."
    else:
        status = "unsupported"
        reason = "The available task evidence does not establish a defensible fit with this domain."
    return {
        "status": status,
        "score": score,
        "task_domain_overlap": {"domain_name": name_n, "domain_scope": desc_n, "name_coverage": round(name_cov, 4), "scope_coverage": round(desc_cov, 4)},
        "basis": reason,
        "scope_condition": "Role must be limited to the stated domain remit where the occupational title spans multiple fields." if status == "conditional" else None,
        "negative_checks": negative_domain_checks(task_tokens, str(row.get("domain_id")), all_domains),
    }


def classify_areas(row: dict[str, Any], domain: dict[str, Any], domain_result: dict[str, Any], areas: list[dict[str, Any]], evidence: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    task_text = role_task_text(row) + " " + evidence.get("augmented_task_text", "")
    task_tokens = tokens(task_text)
    ranked: list[dict[str, Any]] = []
    for area in areas:
        area_text = " ".join(str(area.get(k) or "") for k in ("label", "description", "boundary"))
        cov, rel, overlap = token_overlap(task_tokens, tokens(area_text))
        score = round(0.72 * cov + 0.28 * rel, 4)
        ranked.append({
            "area_id": str(area.get("area_id") or area.get("area_key")),
            "label": area.get("label") or area.get("name"),
            "score": score,
            "task_area_overlap": overlap,
            "coverage": round(cov, 4),
            "boundary_present": bool(area.get("boundary") or area.get("description")),
            "source_refs": sorted(set((area.get("source_urls") or []) + [x.get("url") for x in (area.get("source_references") or []) if isinstance(x, dict) and x.get("url")])),
        })
    ranked.sort(key=lambda x: (-x["score"], x["area_id"]))
    current_area = str(row.get("specialization_fit_area_key") or "")
    current_status = str(row.get("specialization_fit_status") or row.get("specialization_fit_review_status") or "").casefold()
    current_refs = source_refs(row)
    routes: list[dict[str, Any]] = []
    if not areas:
        return routes, ranked
    for index, candidate in enumerate(ranked[:3]):
        score = candidate["score"]
        is_current = candidate["area_id"] == current_area
        if domain_result["status"] == "unsupported":
            status = "unsupported"
            reason = "No area route may override an unsupported parent-domain decision."
        elif is_current and current_status == "supported" and current_refs and candidate["boundary_present"]:
            status = "supported"
            reason = "Existing supported area route retained because task evidence, area boundary and source refs are present."
        elif score >= 0.10 and index == 0:
            status = "supported" if domain_result["status"] == "supported" else "conditional"
            reason = "The role task/work-activity text is materially aligned with the area boundary."
        elif score >= 0.07 and index > 0 and ranked[0]["score"] and score >= ranked[0]["score"] * 0.65:
            status = "supported secondary route" if domain_result["status"] == "supported" else "conditional"
            reason = "A second area is supported by overlapping work activities; it is not the primary route."
        elif score >= 0.035:
            status = "conditional"
            reason = "Some task overlap exists, but the area boundary or evidence is not strong enough for unconditional assignment."
        else:
            status = "external/source review" if not current_refs else "unsupported"
            reason = "No adequate task-to-boundary evidence was found for this area candidate."
        routes.append({**candidate, "status": status, "basis": reason, "route_rank": index + 1})
    return routes, ranked


def build_markdown(report: dict[str, Any]) -> str:
    c = report["counts"]
    lines = [
        "# D001-D056 Role Reconciliation — 2026-10-07",
        "",
        "Review-only lane. No canonical role or taxonomy file was edited.",
        "",
        "## Method",
        "",
        "Every active role in D001-D056 was evaluated using role task/work-activity text, domain scope, area boundary, source provenance/date, scope conditions, multiple-route checks and negative checks. Role names and ISCO membership were used only for discovery and corroboration, never as proof of fit.",
        "",
        "Local evidence used: current role records, local ESCO occupation descriptions/skills, O*NET occupation descriptions/tasks, WEF role list, and ESCO/ISCO group descriptions. Existing reviewed routes were retained only where task text and traceable source evidence were present.",
        "",
        "## Counts",
        "",
        f"- Current role records evaluated: **{c['role_records_evaluated']}**",
        f"- Student-path active records: **{c['active_student_path_records']}**; excluded legacy records retained for audit: **{c['excluded_records_retained_for_audit']}**",
        f"- Domains covered: **{c['domains_covered']}**",
        f"- Parent-domain dispositions: {json.dumps(c['parent_domain_dispositions'], ensure_ascii=False)}",
        f"- Area-route dispositions (route count, not unique-role count): {json.dumps(c['area_route_dispositions'], ensure_ascii=False)}",
        f"- Roles with a proposed disposition change: **{c['roles_with_proposed_changes']}**",
        f"- Roles with a negative cross-domain signal requiring inspection: **{c['roles_with_negative_domain_signals']}**",
        f"- Raw role candidates absent by exact current key: **{c['raw_candidates_absent_exact_key']}**",
        f"- Raw candidates classified as alias/duplicate: **{c['raw_candidate_dispositions'].get('duplicate/alias', 0)}**",
        "",
        "## Safety",
        "",
        "- Canonical files edited: **no**.",
        "- No route is promoted solely from a role title, ISCO group, or subgroup membership.",
        "- Secondary routes are explicit and do not replace the primary route.",
        "- Conditional routes carry an explicit scope condition.",
        "- Full row-level records and proposed keys are in the JSON artifact.",
        "",
        "## Proposed-change summary",
        "",
    ]
    for key, value in sorted(report["counts"]["proposed_change_types"].items()):
        lines.append(f"- {key}: **{value}**")
    lines += [
        "",
        "## D001-D056 coverage",
        "",
        "| Domain | Roles | Supported parent | Conditional | Unsupported | External review | Area supported/secondary | Area conditional/review |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for row in report["domain_counts"]:
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {row['roles']} | {row['parent_supported']} | {row['parent_conditional']} | {row['parent_unsupported']} | {row['parent_external']} | {row['area_supported']} | {row['area_conditional_or_review']} |")
    lines += [
        "",
        "The JSON contains `role_records`, `raw_dropped_or_absent_candidates`, `proposed_keys`, source evidence and every scoring component needed for local reconciliation.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    meta = read_json(DOMAIN_META, {}) or {}
    structure = read_json(DOMAIN_STRUCTURE, {}) or {}
    catalog = read_json(SPECIALIZATION_CATALOG, {}) or {}
    esco_code, esco_label = load_esco()
    onet_occ, onet_tasks = load_onet()
    isco = read_json(ISCO_GROUPS, {}) or {}
    wef = read_json(WEF_ROLES, {}) or {}
    current, provenance = load_roles()
    raw_candidates = load_raw_candidates(current, onet_occ, esco_code, esco_label, wef)
    records: list[dict[str, Any]] = []
    domain_counts: list[dict[str, Any]] = []
    proposed_keys: list[dict[str, Any]] = []
    parent_counts = Counter()
    area_counts = Counter()
    proposed_types = Counter()
    all_domains: dict[str, dict[str, Any]] = {}
    for domain_id, value in meta.items():
        if isinstance(value, dict):
            all_domains[str(domain_id)] = dict(value)
    for domain_id in sorted(TARGET_DOMAINS):
        domain_meta = dict(meta.get(domain_id) or {})
        domain_meta.setdefault("domain_name", domain_id)
        domain = dict(structure.get(domain_id) or {})
        domain.update({k: v for k, v in domain_meta.items() if k not in domain})
        areas = area_records(structure, domain_id)
        # Prefer explicit catalog area boundaries when the structure is stale.
        catalog_rows = {str(x.get("area_key")): x for x in (next((x.get("areas", []) for x in catalog.get("domains", []) if x.get("domain_id") == domain_id), []) or []) if isinstance(x, dict)}
        merged_areas = []
        for area in areas:
            key = str(area.get("area_id") or area.get("area_key"))
            merged = dict(catalog_rows.get(key) or {})
            merged.update(area)
            merged_areas.append(merged)
        domain_rows = [row for key, row in current.items() if str(row.get("domain_id")) == domain_id]
        local = Counter()
        for row in sorted(domain_rows, key=lambda x: str(x.get("role_name"))):
            evidence = source_evidence(row, onet_occ, onet_tasks, esco_code, esco_label, isco, wef)
            parent = classify_domain(row, domain, evidence, all_domains)
            area_routes, ranked = classify_areas(row, domain, parent, merged_areas, evidence)
            parent_counts[parent["status"]] += 1
            for route in area_routes:
                area_counts[route["status"]] += 1
            current_area = str(row.get("specialization_fit_area_key") or "")
            current_domain_status = str(row.get("domain_fit_review_status") or row.get("role_domain_lane_review_status") or "").casefold()
            current_area_status = str(row.get("specialization_fit_status") or row.get("specialization_fit_review_status") or "").casefold()
            proposed: list[str] = []
            if current_domain_status and current_domain_status not in {parent["status"], "reviewed_" + parent["status"]}:
                proposed.append("parent-domain-status")
            best = area_routes[0] if area_routes else None
            if best and current_area and current_area != best["area_id"] and best["status"] in {"supported", "supported secondary route"}:
                proposed.append("primary-area-route")
            if best and current_area_status and current_area_status not in {best["status"], "reviewed_" + best["status"]}:
                proposed.append("area-fit-status")
            if best and not current_area and best["status"] in {"supported", "conditional"}:
                proposed.append("missing-area-route")
            if len(area_routes) > 1 and any(x["status"] == "supported secondary route" for x in area_routes):
                proposed.append("secondary-area-route")
            if proposed:
                proposed_keys.append({"role_key": role_key(row), "domain_id": domain_id, "changes": proposed})
                for item in proposed:
                    proposed_types[item] += 1
            local[f"parent_{parent['status']}"] += 1
            local["area_supported_or_secondary"] += sum(x["status"] in {"supported", "supported secondary route"} for x in area_routes)
            local["area_conditional_or_review"] += sum(x["status"] in {"conditional", "unsupported", "external/source review"} for x in area_routes)
            records.append({
                "role_key": role_key(row),
                "domain_id": domain_id,
                "domain_name": domain_meta.get("domain_name", domain_id),
                "role_name": row.get("role_name"),
                "source": row.get("source"),
                "student_path_status": row.get("student_path_status"),
                "active_for_student_path": str(row.get("student_path_status") or "").casefold() != "excluded",
                "aliases": alias_list(row),
                "current": {
                    "domain_fit_status": row.get("domain_fit_review_status") or row.get("role_domain_lane_review_status"),
                    "domain_fit_basis": row.get("domain_fit_review_basis"),
                    "area_fit_status": row.get("specialization_fit_status") or row.get("specialization_fit_review_status"),
                    "area_id": current_area,
                    "area_fit_basis": row.get("specialization_fit_review_basis"),
                },
                "provenance_files": provenance.get(role_key(row), []),
                "evidence": evidence,
                "parent_domain_disposition": parent,
                "area_route_dispositions": area_routes,
                "area_ranked_candidates": ranked,
                "proposed_changes": proposed,
                "canonical_edit": False,
            })
        domain_counts.append({
            "domain_id": domain_id,
            "domain_name": domain_meta.get("domain_name", domain_id),
            "roles": len(domain_rows),
            "parent_supported": local["parent_supported"],
            "parent_conditional": local["parent_conditional"],
            "parent_unsupported": local["parent_unsupported"],
            "parent_external": local["parent_external/source review"],
            "area_supported": local["area_supported_or_secondary"],
            "area_conditional_or_review": local["area_conditional_or_review"],
            "area_count": len(merged_areas),
        })
    raw_dispositions = Counter(x["disposition"] for x in raw_candidates)
    report = {
        "schema_version": "2026-10-07.role-reconciliation-lane.v1",
        "generated_at": TODAY,
        "lane": "D001-D056",
        "canonical_files_edited": False,
        "method": {
            "primary_criteria": ["role task/work activities", "domain definition and scope", "area boundary", "source provenance/date", "scope/exclusions", "multiple valid routes", "negative checks"],
            "title_is_discovery_only": True,
            "isco_or_subgroup_is_proof": False,
            "local_sources": ["role_library_v3_cleaned.json", "thin_domain_role_overlays.json", "emerging_role_overlays.json", "role_library_v3.json", "docs/esco_occupations_skills.json", "taxonomies/esco_occupations.json", "_source_extracts/onet_31_0/Occupation Data.txt", "_source_extracts/onet_31_0/Task Statements.txt", "taxonomies/wef_2025_roles.json", "taxonomies/esco_isco_groups.json", "domain_meta.json", "domain_structure.json", "domain_specialization_catalog.json"],
        },
        "counts": {
            "role_records_evaluated": len(records),
            "active_student_path_records": sum(x["active_for_student_path"] for x in records),
            "excluded_records_retained_for_audit": sum(not x["active_for_student_path"] for x in records),
            "domains_covered": len(domain_counts),
            "parent_domain_dispositions": dict(parent_counts),
            "area_route_dispositions": dict(area_counts),
            "roles_with_proposed_changes": len(proposed_keys),
            "raw_candidates_absent_exact_key": len(raw_candidates),
            "raw_candidate_dispositions": dict(raw_dispositions),
            "proposed_change_types": dict(proposed_types),
            "roles_with_negative_domain_signals": sum(bool(x["parent_domain_disposition"]["negative_checks"]) for x in records),
        },
        "domain_counts": domain_counts,
        "proposed_keys": proposed_keys,
        "role_records": records,
        "raw_dropped_or_absent_candidates": raw_candidates,
        "checkpoint": {"completed_domains": sorted(TARGET_DOMAINS), "next_action": "Local reconciliation of proposed keys; no canonical promotion performed by this lane."},
    }
    write_json(OUT_JSON, report)
    OUT_MD.write_text(build_markdown(report), encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-10-07.role-reconciliation-checkpoint.v1",
        "lane": "D001-D056",
        "status": "completed",
        "completed_domains": sorted(TARGET_DOMAINS),
        "counts": report["counts"],
        "canonical_files_edited": False,
        "output_json": OUT_JSON.relative_to(ROOT).as_posix(),
        "output_markdown": OUT_MD.relative_to(ROOT).as_posix(),
        "next_action": "Local reconciliation of proposed keys after review of evidence-backed classifications; do not bulk restore raw titles.",
    }
    write_json(CHECKPOINT_JSON, checkpoint)
    CHECKPOINT_MD.write_text(
        "# D001-D056 reconciliation checkpoint — 2026-10-07\n\n"
        "Status: **completed for all assigned domains**.\n\n"
        "This is a review-only checkpoint. Canonical role and taxonomy files were not edited.\n\n"
        f"Counts: `{json.dumps(report['counts'], ensure_ascii=False)}`\n\n"
        f"Full row-level evidence: `{OUT_JSON.relative_to(ROOT).as_posix()}`\n",
        encoding="utf-8",
    )
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))
    print(f"JSON={OUT_JSON}")
    print(f"MD={OUT_MD}")
    print(f"CHECKPOINT_JSON={CHECKPOINT_JSON}")
    print(f"CHECKPOINT_MD={CHECKPOINT_MD}")


if __name__ == "__main__":
    main()
