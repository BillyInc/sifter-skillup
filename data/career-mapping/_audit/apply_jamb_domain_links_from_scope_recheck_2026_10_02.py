"""Apply source-gated JAMB domain links for scopes resolved from exact sources."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
CAREER = HERE.parent
SCOPE = HERE / "jamb_curriculum_scopes_2026-08-17.json"
RECHECK = HERE / "jamb_domain_link_scope_recheck_2026-10-02.json"
DOMAIN_MAP = CAREER / "jamb_domain_map.json"
PROGRAMME_DOMAINS = CAREER / "programme_domain_final.json"
DOMAIN_META = CAREER / "domain_meta.json"
sys.path.insert(0, str(CAREER))
from _build_jamb_curriculum_scopes import MANUAL_SCOPE_DOMAIN_LINKS  # noqa: E402


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write the fully source-gated candidate links")
    parser.add_argument("--scope", type=Path, default=SCOPE, help="reviewed curriculum-scope artifact")
    parser.add_argument("--recheck", type=Path, default=RECHECK, help="full-catalogue selected-scope recheck")
    parser.add_argument("--report", type=Path, help="optional before/after decision ledger output")
    parser.add_argument("--only-name", action="append", default=[], help="limit writes to this exact JAMB name; repeat as needed")
    parser.add_argument("--only-domain", action="append", default=[], help="replace only this domain's link(s) for the selected JAMB name; repeat as needed")
    parser.add_argument("--removals-only", action="store_true", help="remove existing links that fail the selected-scope evidence gate; do not add candidates")
    args = parser.parse_args()
    scopes = read(args.scope)
    recheck = read(args.recheck)
    domain_map = read(DOMAIN_MAP)
    map_hash_before = sha256(DOMAIN_MAP)
    programme_domains = read(PROGRAMME_DOMAINS)
    domain_meta = read(DOMAIN_META)
    scope_by_name = {row["jamb_name"]: row for row in scopes["rows"]}
    known_domain_names = {}
    for domain_id, domain in domain_meta.items():
        if domain.get("domain_name"):
            known_domain_names.setdefault(domain_id, set()).add(domain["domain_name"])
    for programme in programme_domains.values():
        for link in programme.get("links", []):
            known_domain_names.setdefault(link.get("domain_id"), set()).add(link.get("domain_name"))
    for row in domain_map.values():
        for link in row.get("links", []):
            known_domain_names.setdefault(link.get("domain_id"), set()).add(link.get("domain_name"))

    updates = {}
    unsupported_updates = {}
    for row in recheck["rows"]:
        if args.only_name and row.get("jamb_name") not in set(args.only_name):
            continue
        if row.get("status") != "recomputed_from_existing_selected_courses":
            if row.get("status") == "no_source_resolved_scope":
                name = row.get("jamb_name")
                scope = scope_by_name.get(name) or {}
                if scope.get("scope_status") == "external_scope_verified_no_curriculum":
                    if name not in domain_map:
                        raise SystemExit(f"Unexpected/unmatched unsupported JAMB identity: {name}")
                    unsupported_updates[name] = scope
            continue
        name = row["jamb_name"]
        if name not in scope_by_name or name not in domain_map:
            raise SystemExit(f"Unexpected/unmatched JAMB identity: {name}")
        links = list(row.get("same_domain_and_tier", [])) + list(row.get("additions", []))
        links.sort(key=lambda item: (str(item.get("domain_id")), str(item.get("match_type"))))
        if len(links) != row.get("candidate_link_count"):
            raise SystemExit(f"{name}: candidate link count does not match the audited total")
        seen = set()
        for link in links:
            key = (link.get("domain_id"), link.get("match_type"))
            if key in seen:
                raise SystemExit(f"{name}: duplicate domain/tier candidate {key}")
            seen.add(key)
            if not known_domain_names.get(link.get("domain_id")) or link.get("domain_name") not in known_domain_names[link.get("domain_id")]:
                raise SystemExit(f"{name}: unknown domain identity {link.get('domain_id')} / {link.get('domain_name')}")
            gate = link.get("scope_anchor_gate") or {}
            if name in MANUAL_SCOPE_DOMAIN_LINKS:
                selected_pairs = {
                    (str(course.get("code") or "").strip(), str(course.get("title") or "").strip())
                    for course in scope_by_name[name].get("selected_courses", [])
                }
                anchor_codes = {str(code).strip() for code in link.get("scope_course_codes", [])}
                anchor_titles = {str(title).strip() for title in link.get("scope_course_titles", [])}
                if not anchor_codes or not any(
                    code in anchor_codes and title in anchor_titles
                    for code, title in selected_pairs
                ):
                    raise SystemExit(f"{name}: reviewed override lacks an exact selected-code/title anchor")
                continue
            if link.get("source_kind") == "external_curriculum":
                if not link.get("source_url") or not str(link.get("evidence") or "").strip():
                    raise SystemExit(f"{name}: external curriculum candidate lacks a source URL or explicit evidence")
                if gate.get("gate") not in {
                    "explicit_external_curriculum_url_and_evidence",
                    "external_curriculum_course_titles_and_source_url",
                }:
                    raise SystemExit(f"{name}: external curriculum candidate lacks its source-evidence gate")
                continue
            if not gate or not gate.get("distinct_source_course_anchors"):
                raise SystemExit(f"{name}: candidate lacks source-course anchor details")
            if link.get("match_type") in {"direct", "functional"} and (
                gate.get("distinct_source_course_anchors", 0) < 2
                or not gate.get("repeated_specific_anchor_families")
            ):
                raise SystemExit(f"{name}: {link.get('match_type')} candidate failed its evidence gate")
            if link.get("match_type") == "adjacent" and (
                gate.get("distinct_source_course_anchors", 0) < 1
                or gate.get("transferable_evidence_anchors", 0) < 1
                or gate.get("gate") != "one_scoped_course_anchor_plus_scoped_transferable_evidence_plus_specific_anchor"
            ):
                raise SystemExit(f"{name}: adjacent candidate failed its evidence gate")
        if args.only_domain:
            target_domains = set(args.only_domain)
            candidate_for_domains = [link for link in links if str(link.get("domain_id")) in target_domains]
            updates[name] = [
                link for link in (domain_map[name].get("links") or [])
                if str(link.get("domain_id")) not in target_domains
            ] + candidate_for_domains
        elif args.removals_only:
            removal_keys = {
                (item.get("domain_id"), item.get("match_type"))
                for item in row.get("active_map_removals", [])
            }
            if removal_keys:
                updates[name] = [
                    link for link in (domain_map[name].get("links") or [])
                    if (link.get("domain_id"), link.get("match_type")) not in removal_keys
                ]
        else:
            updates[name] = links

    changed = []
    for name, links in updates.items():
        old = domain_map[name].get("links") or []
        if old != links:
            changed.append({"jamb_name": name, "old_link_count": len(old), "new_link_count": len(links), "links": links})
    for name, scope in unsupported_updates.items():
        old = domain_map[name].get("links") or []
        if old or domain_map[name].get("mapping_status") != "unsupported_no_verified_curriculum":
            changed.append({"jamb_name": name, "old_link_count": len(old), "new_link_count": 0, "links": [], "disposition": "unsupported_no_verified_curriculum"})

    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "name_filter": args.only_name or None,
        "removals_only": args.removals_only,
        "domain_filter": args.only_domain or None,
        "resolved_jamb_rows": len(updates),
        "link_count": sum(len(links) for links in updates.values()),
        "changed_jamb_rows": len(changed),
        "changed_link_rows": changed,
        "unsupported_no_curriculum_rows": sorted(unsupported_updates),
        "domain_map_sha256_before": map_hash_before,
        "unresolved_rows_left_unchanged": [
            {"jamb_name": row.get("jamb_name"), "status": row.get("status"), "reason": row.get("reason")}
            for row in recheck["rows"]
            if (not args.only_name or row.get("jamb_name") in set(args.only_name))
            and row.get("status") != "recomputed_from_existing_selected_courses"
        ],
        "counts": recheck.get("counts", {}),
    }
    if args.apply:
        if sha256(DOMAIN_MAP) != map_hash_before:
            raise SystemExit("jamb_domain_map.json changed during this run; refusing to overwrite it")
        for name, links in updates.items():
            scope = scope_by_name[name]
            if args.only_domain:
                targets = set(args.only_domain)
                scope["domain_links"] = [
                    link for link in (scope.get("domain_links") or [])
                    if str(link.get("domain_id")) not in targets
                ] + [link for link in links if str(link.get("domain_id")) in targets]
            elif args.removals_only:
                targets = {
                    (item.get("domain_id"), item.get("match_type"))
                    for item in next(item for item in recheck["rows"] if item.get("jamb_name") == name).get("active_map_removals", [])
                }
                scope["domain_links"] = [
                    link for link in (scope.get("domain_links") or [])
                    if (link.get("domain_id"), link.get("match_type")) not in targets
                ]
            else:
                scope["domain_links"] = links
            record = domain_map[name]
            record["links"] = links
            scope_status = str(scope.get("scope_status") or "")
            record["curriculum_scope"] = {
                **(record.get("curriculum_scope") or {}),
                "status": scope_status,
                "source": scope.get("scope_selection_method") or "declared_component_curriculum",
                "approval": scope.get("scope_approval"),
                "selected_course_count": len(scope.get("selected_courses") or []),
                "selected_course_codes": [course.get("code") for course in scope.get("selected_courses", []) if course.get("code")],
            }
            if scope_status in {"full", "combined_scope_reviewed"}:
                record["mapping_status"] = "ready"
            elif scope_status == "external_scope_evidenced" and links:
                record["mapping_status"] = "ready_external"
            elif links:
                record["mapping_status"] = "ready_partial"
            else:
                record["mapping_status"] = "no_supported_domain_paths"
            record["status_reason"] = "Domain links recalculated from exact selected curriculum components and per-link course evidence gates."
            record["ccmas_components"] = [ref for ref in scope.get("component_refs", []) if not str(ref).startswith("__custom__::")]
        for name, scope in unsupported_updates.items():
            record = domain_map[name]
            record["links"] = []
            record["mapping_status"] = "unsupported_no_verified_curriculum"
            record["status_reason"] = scope.get("scope_reason") or "No exact programme curriculum was verified; do not assign CCMAS-derived student domain paths."
            record["curriculum_scope"] = {
                **(record.get("curriculum_scope") or {}),
                "status": scope.get("scope_status"),
                "source": scope.get("scope_selection_method") or "official_external_source_review",
                "approval": scope.get("scope_approval"),
                "selected_course_count": 0,
                "selected_course_codes": [],
            }
        args.scope.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        DOMAIN_MAP.write_text(json.dumps(domain_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        summary["domain_map_sha256_after"] = sha256(DOMAIN_MAP)
    if args.report:
        args.report.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
