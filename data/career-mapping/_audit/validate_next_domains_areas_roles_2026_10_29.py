"""Focused invariants for the 2026-10-29 next-domain taxonomy reconciliation."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
C=ROOT/"data"/"career-mapping"
DOMAINS={"D006","D086","D139","D141","D167","D168"}
def load(p): return json.loads(p.read_text(encoding="utf-8-sig"))

structure=load(C/"domain_structure.json")
catalog=load(C/"domain_specialization_catalog.json")
catalog_by={d["domain_id"]:d for d in catalog["domains"]}
role_sources=[]
for fn in ["role_library_v3_cleaned.json","emerging_role_overlays.json","thin_domain_role_overlays.json"]:
    d=load(C/fn); rows=d if isinstance(d,list) else d["roles"]
    role_sources.extend((fn,r) for r in rows if r.get("domain_id") in DOMAINS)
archive=load(C/"_audit"/"NEXT_DOMAINS_RETIRED_ISCO_AND_ROLE_DISPOSITIONS_2026_10_29.json")
generator=(C/"_apply_emerging_domain_structure.py").read_text(encoding="utf-8-sig").casefold()
assert "subgroup_reconciliation_status" in generator and 'domain["subgroups"] = []' in generator
catalog_builder=(C/"_audit"/"materialize_global_specialization_catalog_2026_10_07.py").read_text(encoding="utf-8-sig")
assert "RECONCILED_DOMAIN_IDS" in catalog_builder and "preserved_reconciled_domain_ids" in catalog_builder
assert set(x["domain_id"] for x in archive["domains"])==DOMAINS
for did in DOMAINS:
    ds=structure[did]; areas=ds["areas_of_specialization"]
    cat=catalog_by[did]["areas"]
    active_ids={a["area_id"] for a in areas}
    assert not ds.get("subgroups"), f"{did} still has active legacy subgroups"
    assert {a["area_id"] for a in areas}=={a["area_key"] for a in cat}, f"{did} structure/catalog area mismatch"
    assert len({a["area_id"] for a in areas})==len(areas)
    # Projected role membership must equal the role records' actual routes.
    expected={a["area_id"]:set() for a in areas}
    for _,role in role_sources:
        if role.get("domain_id")!=did: continue
        name=role.get("role_name") or ""
        routes=[r for r in role.get("role_area_routes",[]) if r.get("area_id","").startswith(did+":")]
        status=role.get("domain_fit_review_status") or role.get("domain_fit_status")
        disposition=role.get("specialization_route_disposition",{}).get("status")
        if disposition=="routed":
            assert routes, f"{did}|{name} is routed but has no area route"
            assert role.get("student_path_status","active")!="excluded", f"Conditional/supported route hidden: {did}|{name}"
            domain_routes=[r for r in role.get("role_domain_routes",[]) if r.get("domain_id")==did]
            for dr in domain_routes:
                text=(str(dr.get("qualification") or "")+str(dr.get("evidence",{}).get("basis") or "")).lower()
                assert "cannot outrun" not in text and "does not block" in str(dr.get("qualification") or "").lower() or dr.get("status")=="supported", f"Stale parent-domain gate text: {did}|{name}"
            for route in routes:
                assert route["area_id"] in active_ids, f"Noncanonical area route: {did}|{name} -> {route['area_id']}"
                assert route["status"] in {"supported","conditional"}
                assert route.get("evidence",{}).get("source_refs"), f"Source-less route: {did}|{name}"
                if route["status"]=="conditional":
                    assert route.get("qualification") and "hidden" not in route["qualification"].lower() and "blocked" not in route["qualification"].lower()
                    assert role.get("student_path_status")=="active", f"Conditional route treated as hide gate: {did}|{name}"
                expected[route["area_id"]].add(f"{did}|{name}")
        elif status=="unsupported":
            assert not routes, f"Unsupported record has active area route: {did}|{name}"
        elif disposition=="merged_alias":
            assert role.get("student_path_status")=="excluded" and not routes
    for area in areas:
        assert set(area.get("role_keys",[]))==expected[area["area_id"]], f"Area role projection stale: {area['area_id']}"
        assert area.get("role_route_count")==len(expected[area["area_id"]])
    archived=next(x for x in archive["domains"] if x["domain_id"]==did)
    assert set(archived["area_ids"])==active_ids
    assert all(row["record"] for row in archived["legacy_subgroups"])
    for disposition in archived["roles"]["nonroute_dispositions"]:
        assert disposition.get("source_refs") or disposition.get("source_ids") or disposition.get("internal_review_records"), f"Unsupported/alias disposition lacks evidence trail: {did}|{disposition.get('role_name')}"
all_gambling=[r for _,r in role_sources if r.get("role_name","").casefold()=="gambling games designer"]
assert any(r.get("domain_id")=="D086" and r.get("specialization_route_disposition",{}).get("status")=="routed" for r in all_gambling)
assert any(r.get("domain_id")=="D139" and r.get("specialization_route_disposition",{}).get("status")=="not_routed" for r in all_gambling)
print("PASS: 6 domains; active area sets match catalog; legacy groups archived; all supported/conditional role routes source-backed and projected; conditional routes remain active; unsupported/duplicate records have no active route.")
for did in sorted(DOMAINS):
    d=next(x for x in archive["domains"] if x["domain_id"]==did)
    print(did,"areas",len(d["area_ids"]),"roles routed",d["roles"]["routed_role_records"],"nonroutes",len(d["roles"]["nonroute_dispositions"]),"legacy groups",len(d["legacy_subgroups"]))
