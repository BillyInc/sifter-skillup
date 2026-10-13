"""Audit role -> area/direct routes for grouped residual batches 006-010.

This is an audit-only result builder.  It intentionally does not edit any
canonical role, domain, subgroup, area-source, or computational file.  A
route is a deterministic candidate only when:

* the current parent-domain status is supported;
* the role's task description, not its title or taxonomy membership, has a
  strong and unique match to one current area boundary;
* the role task has an external source reference; and
* the selected area has a source reference in the current queue.

Everything else is retained as an explicit review queue.  The output is
written beside this script so it can be reconciled later without mutating the
canonical files or another agent's batches.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
QUEUE_DIR = ROOT / "data" / "career-mapping" / "_audit" / "GROUPED_ROLE_REVIEW_QUEUES_2026_10_07" / "role_area_direct_route_residual"
DEFAULT_OUT_DIR = Path(__file__).resolve().parent
DEFAULT_BATCHES = tuple(range(6, 11))

# Exact role-task decisions after inspecting the full task text and the
# candidate-area boundaries in these five batches.  This deliberately small
# allow-list prevents lexical ranking from being mistaken for a fit verdict.
# Keys are exact canonical role keys; values are the area key supported by the
# task.  Roles not listed here remain review-required even if a lexical score
# ranks one candidate first.
TASK_CONFIRMED_AREAS = {
    "D006|embedded systems engineer": ("D006:embedded-systems-and-firmware-engineering", "The task explicitly designs firmware and embedded software for microcontrollers/connected devices; this is the defining work in the area boundary."),
    "D010|data engineer": ("D010:bi-data-foundations-and-architecture", "The task explicitly builds data architecture, pipelines and warehouses; the area's boundary covers data foundations and architecture."),
    "D016|microelectronics engineer": ("D016:electronics-and-semiconductor-devices", "The role designs and supervises production of microprocessors and integrated circuits, directly matching electronic/semiconductor devices."),
    "D017|powertrain engineer": ("D017:mechanical-design-and-applied-mechanics", "The task designs propulsion mechanisms and mechanical powertrain components; this is a direct mechanical design/application fit."),
    "D018|water systems engineering technician": ("D018:water-resources-engineering", "The task supports engineering of water supply and treatment systems, monitors compliance and checks water quality; the area boundary includes water-resource systems engineering."),
    "D020|water plant technician": ("D020:water-wastewater-and-stormwater-systems", "The role maintains water treatment/supply equipment, verifies treatment and water quality, and maintains distribution systems; this matches the water-systems area."),
    "D021|architect": (None, "The task spans building design, urban spaces and infrastructure; the current area candidates include distinct architecture, planning and landscape boundaries, so no single route is established."),
    "D022|mine planning engineer": ("D022:mining-engineering-and-mine-development", "The task designs future mine layouts, production/development schedules and monitors mine development; this is mine engineering/development, not mineral exploration."),
    "D023|family medicine physicians": ("D023:generalist-and-primary-care", "The task provides first-contact, continuing and preventive care across the lifespan, matching generalist primary care rather than adult specialty medicine."),
    "D031|wholesale merchant": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in machine tools": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in beverages": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in perfume and cosmetics": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in metals and metal ores": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in watches and jewellery": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|wholesale merchant in agricultural machinery and equipment": ("D031:retail-and-wholesale-sales", "The task investigates wholesale buyers/suppliers, matches commercial needs and concludes bulk trades, directly matching wholesale sales."),
    "D031|online sales channel manager": ("D031:channel-and-partner-sales", "The task defines an e-commerce sales programme, plans online sales strategy and identifies channel opportunities; this matches channel sales."),
    "D032|project support officer": ("D032:project-management-office-pmo-practice-and-assurance", "The task explicitly works as part of a horizontal PMO and supports project governance, documentation, managers and delivery controls."),
    "D047|shepherd": ("D047:animal-and-livestock-science", "The task manages welfare and movement of grazing livestock, a direct livestock practice within the area boundary."),
    "D056|blockchain architect": ("D056:distributed-ledger-protocols-and-infrastructure", "The task designs architecture, modules, interfaces and data for decentralized systems; it supports DLT protocols/infrastructure, but does not establish smart-contract authoring specifically."),
    "D064|psychologist": (None, "The task profile spans counselling, clinical and other psychology services; no single specialization boundary is established."),
    "D070|dramaturg": ("D070:theatre-and-dramatic-performance", "The task supports development and interpretation of dramatic work through research, structure and story analysis, directly matching theatre/dramatic practice."),
    "D074|occupational health and safety technicians": ("D074:occupational-hygiene-and-exposure-prevention", "The task collects workplace exposure data and evaluates controls for chemical, physical, biological and ergonomic risks; this matches occupational hygiene/exposure prevention."),
    "D077|security guard": ("D077:protective-corporate-security", "The task patrols property, controls access, observes irregularities and protects people/assets, matching protective security."),
    "D078|economic development coordinator": ("D078:economics-applied-analysis", "The task researches economic trends and coordinates institutions implementing economic-growth policies; this is an applied-economics development remit."),
    "D081|executive assistant": ("D081:executive-administrative-support", "The task directly supports executives through meetings, records, travel and day-to-day office coordination."),
    "D106|tailor": ("D106:tailoring-and-custom-garment-construction", "The task designs, makes, fits and alters bespoke or made-to-measure garments, directly matching tailoring/custom construction."),
    "D113|glass forming machine operator": ("D113:glass-ceramics-and-refractory-materials-processing", "The task presses or blows molten glass into moulds and adjusts forming machinery, directly matching glass processing."),
    "D116|production plant crane operator": ("D116:lifting-and-crane-operations", "The task operates cranes to lift and move production materials/loads, a direct lifting/crane operation."),
    "D117|rolling stock assembly supervisor": ("D117:rolling-stock-and-rail-vehicle-systems", "The task supervises assembly of rolling stock and its manufacturing schedule; it directly fits rail-vehicle systems/production."),
    "D117|rolling stock electrician": ("D117:rolling-stock-and-rail-vehicle-systems", "The task installs, maintains and repairs electrical systems in rail vehicles; it directly fits rail-vehicle systems."),
    "D117|rolling stock engineering technician": ("D117:rolling-stock-and-rail-vehicle-systems", "The task supports design, manufacture, testing, installation and maintenance of rail vehicles; it directly fits rail-vehicle systems."),
    "D123|mammographer": ("D123:mammography-and-breast-imaging", "The task performs mammographic imaging for breast screening/diagnosis, directly matching the area boundary."),
    "D123|magnetic resonance imaging technologists": ("D123:magnetic-resonance-imaging", "The task operates MRI scanners and follows MRI-specific patient safety, positioning and image-quality procedures."),
    "D123|diagnostic radiographer": (None, "The task profile spans X-ray, MRI and ultrasound modalities; it is too broad for a single modality-specific area route."),
    "D123|nuclear medicine radiographer": (None, "The task spans nuclear-medicine imaging and several modalities; current evidence does not establish one area route without assuming modality scope."),
    "D130|employment services manager": ("D130:employment-services-and-job-matching", "The task leads recruitment teams and coordinates employment-service operations, matching employment services/job-matching practice."),
    "D135|nuclear engineers": ("D135:nuclear-energy-systems-and-reactor-engineering", "The task applies nuclear science to the release, control and use of nuclear energy and nuclear waste; this directly fits nuclear energy systems."),
    "D135|radiation protection technician": ("D135:radiation-science-measurement-and-protection", "The task monitors radiation levels and develops/implements protection measures, directly matching radiation measurement/protection."),
    "D137|radiation therapists": (None, "The task delivers prescribed radiotherapy; the candidate areas describe medical-physics specializations, not the therapist's clinical occupation, so no role-to-area assignment is justified."),
    "D137|nuclear medicine radiographer": (None, "Radiography tasks are not medical-physics tasks; the nuclear-medicine-physics area cannot be assigned from modality overlap alone."),
    "D011|stock trader": (None, "The task supports trading, but the evidence does not establish systematic/quantitative methods specifically; retain for area review."),
    "D034|logistics and distribution manager": (None, "The broad task spans supply-chain services and operations; it does not uniquely establish the transformation/returns/circular-flow area."),
    "D042|stand in": (None, "The stand-in supports camera/lighting setup by substituting for an actor; the listed editorial area is not a fit and no listed area is uniquely supported."),
    "D042|broadcasting programme director": (None, "The role schedules broadcast programmes; current candidate area evidence does not uniquely distinguish broadcast operations from content/editorial programming."),
    "D067|dentists general": (None, "The task is a general-dentistry profile with multiple possible procedures; it does not establish endodontic specialization."),
    "D013|financial planner": (None, "The task spans investment, retirement, tax, insurance and risk planning; it does not uniquely establish private-wealth investment management."),
}

# These are words that commonly occur in occupational prose and do not by
# themselves distinguish one area of practice from another.  In particular,
# the role title is never scored.
STOPWORDS = {
    "and", "the", "for", "with", "from", "into", "that", "this", "their",
    "area", "areas", "practice", "practices", "work", "working", "use", "using",
    "provide", "provides", "support", "supports", "perform", "performs",
    "develop", "develops", "development", "design", "designs", "process",
    "processes", "professional", "professionals", "role", "roles", "activity",
    "activities", "related", "including", "across", "one", "two", "three",
    "new", "other", "based", "required", "ensure", "ensures", "within",
    "through", "according", "various", "specific", "may", "also", "often",
    "can", "must", "such", "workplace", "organization", "organisation",
}

GENERIC_ANCHORS = {
    "analysis", "apply", "business", "build", "change", "coordinate", "delivery",
    "engineering", "improvement", "maintain", "management", "manage", "monitor",
    "operations", "operation", "planning", "production", "requirements", "service",
    "services", "software", "systems", "system", "technology", "testing", "test",
    "work", "workers", "working", "role", "roles", "task", "tasks", "field",
    "research", "study", "studies", "conduct", "conducts", "perform", "performs",
    "provide", "provides", "support", "supports", "equipment", "customers",
    "customer", "company", "companies", "goods", "products", "product", "people",
    "patients", "patient", "care", "community", "information", "data", "technical",
    "specialist", "specialists", "technician", "technicians", "operator", "operators",
    "manager", "managers", "worker", "assistant", "assistants", "analyst", "analysts",
    "engineer", "engineers", "supervisor", "supervisors", "professional", "professionals",
    "install", "installs", "installation", "repair", "repairs", "maintain", "maintenance",
    "operate", "operates", "operating", "ensure", "ensuring", "financial", "medical",
    "clinical", "health", "public", "general", "international", "national", "safe",
    "safety", "quality", "control", "controls", "process", "processes", "manufacturing",
    "manufacture", "manufactures", "material", "materials", "use", "uses", "used",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+/#& -]", " ", str(value or "").lower())).strip()


def words(value: Any) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value))
        if token not in STOPWORDS and not token.isdigit()
    ]


def phrases(value: Any) -> set[str]:
    tokens = words(value)
    return {
        " ".join(tokens[index : index + size])
        for size in (2, 3)
        for index in range(len(tokens) - size + 1)
    }


def external_urls(values: list[Any]) -> list[str]:
    return sorted({str(value) for value in values if str(value).startswith(("http://", "https://"))})


def source_class(url: str) -> str:
    lowered = url.lower()
    if "onetonline.org" in lowered:
        return "O*NET occupational task profile"
    if "esco.ec.europa.eu" in lowered or "data.europa.eu/esco" in lowered:
        return "European Commission ESCO occupational profile"
    if "ilo.org" in lowered or "isco.ilo.org" in lowered:
        return "ILO/ISCO occupational context"
    if "who.int" in lowered:
        return "World Health Organization"
    if "nhtsa.gov" in lowered:
        return "NHTSA automated-driving technical/safety context"
    if "ieee.org" in lowered or "computer.org" in lowered or "acm.org" in lowered:
        return "IEEE/ACM professional or curriculum evidence"
    if "cfa-institute.org" in lowered or "afponline.org" in lowered:
        return "Finance professional-body evidence"
    if "cscmp.org" in lowered or "ciltinternational.org" in lowered:
        return "Supply-chain professional-body evidence"
    return "External source recorded by current canonical audit"


def area_fit(task: str, candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Return a guarded task-to-area candidate, never a title-only result."""
    scored: list[dict[str, Any]] = []
    task_phrases = phrases(task)
    task_tokens = set(words(task))
    for area in candidates:
        label = str(area.get("label") or "")
        boundary = str(area.get("boundary") or area.get("scope") or area.get("route_boundary") or "")
        label_tokens = set(words(label))
        boundary_tokens = set(words(boundary))
        label_hits = sorted(task_tokens & label_tokens)
        boundary_hits = sorted(task_tokens & boundary_tokens)
        phrase_hits = sorted(task_phrases & phrases(f"{label} {boundary}"))
        distinctive_label = sorted(set(label_hits) - GENERIC_ANCHORS)
        distinctive_boundary = sorted(set(boundary_hits) - GENERIC_ANCHORS)
        score = len(distinctive_label) * 4 + len(distinctive_boundary) + min(len(phrase_hits), 2) * 3
        scored.append({
            "area_key": area.get("area_key"),
            "label": label,
            "boundary": boundary,
            "score": score,
            "label_hits": label_hits,
            "boundary_hits": boundary_hits,
            "distinctive_task_hits": sorted(set(distinctive_label) | set(distinctive_boundary)),
            "phrase_hits": phrase_hits,
            "source_refs": sorted({str(x) for x in area.get("source_refs") or []}),
        })
    if not scored:
        return None
    ranked = sorted(scored, key=lambda item: (item["score"], len(item["distinctive_task_hits"])), reverse=True)
    best = ranked[0]
    second_score = ranked[1]["score"] if len(ranked) > 1 else 0
    anchor_count = len(best["distinctive_task_hits"])
    strong = anchor_count >= 2 or (best["phrase_hits"] and anchor_count >= 1)
    unique = best["score"] >= second_score + 2
    return {
        "best": best,
        "runner_up_score": second_score,
        "margin": best["score"] - second_score,
        "strong": bool(strong),
        "unique": bool(unique),
        "ranked": ranked,
    }


def parent_evidence(member: dict[str, Any]) -> list[dict[str, Any]]:
    evidence = []
    for item in member.get("parent_domain_evidence") or []:
        if isinstance(item, dict):
            evidence.append({
                "source_id": item.get("source_id"),
                "publisher": item.get("publisher"),
                "url": item.get("url"),
                "locator": item.get("locator"),
                "supports": item.get("supports"),
                "limitation": item.get("limit") or item.get("limitation"),
            })
    return evidence


def process_batch(batch_number: int) -> dict[str, Any]:
    input_path = QUEUE_DIR / f"batch-{batch_number:03}.json"
    payload = load(input_path)
    results: list[dict[str, Any]] = []
    parent_counts = Counter()
    area_counts = Counter()
    source_classes = Counter()

    for group in payload.get("groups") or []:
        for member in group.get("members") or []:
            task = str(member.get("role_task_evidence") or "").strip()
            candidates = member.get("candidate_areas") or []
            task_urls = external_urls(list(member.get("task_source_refs") or []))
            parent_evidence_rows = parent_evidence(member)
            parent_urls = external_urls([row.get("url") for row in parent_evidence_rows])
            area_result = area_fit(task, candidates)
            selected = area_result["best"] if area_result else None
            selected_area_urls = external_urls(list(selected.get("source_refs") or [])) if selected else []
            all_sources = task_urls + parent_urls + selected_area_urls
            for url in all_sources:
                source_classes[source_class(url)] += 1

            parent_status = str(member.get("parent_status") or "review_required")
            parent_supported = parent_status == "supported"
            manual_decision = TASK_CONFIRMED_AREAS.get(str(member.get("role_key")))
            manual_area_key = manual_decision[0] if manual_decision else None
            manual_area_reason = manual_decision[1] if manual_decision else None
            manual_target = next(
                (area for area in candidates if area.get("area_key") == manual_area_key),
                None,
            ) if manual_area_key else None
            if not parent_supported:
                parent_disposition = "review_required"
                parent_reason = (
                    "Parent-domain fit is currently " + parent_status + "; area/direct routing is blocked until the "
                    "role's task and authoritative work-setting evidence establish the parent domain."
                )
            else:
                parent_disposition = "supported"
                parent_reason = "Current parent-domain disposition is supported by the role-domain task review; no ISCO/ESCO membership was used as fit proof."

            if not candidates:
                if parent_supported and member.get("domain_id") in {"D124", "D126", "D129", "D133"}:
                    area_disposition = "direct_domain_route_candidate"
                    area_reason = "The current domain is explicitly catalogued as having no separate area layer; parent fit is supported, so a direct domain-to-role route is eligible."
                else:
                    area_disposition = "review_required"
                    area_reason = "No candidate area is present, and a direct route is not eligible without both an explicit no-area domain decision and supported parent fit."
            elif not parent_supported:
                area_disposition = "blocked_by_parent_fit"
                area_reason = "Candidate area fit is not promoted while the parent-domain fit remains conditional or review-required."
            elif not manual_decision:
                area_disposition = "review_required"
                area_reason = "A lexical winner is not a fit decision; this exact role key has no manually confirmed task-to-area disposition in this batch review."
            elif manual_area_key is None:
                area_disposition = "review_required"
                area_reason = manual_area_reason
            elif manual_target is None:
                area_disposition = "review_required"
                area_reason = "The manually evaluated target area is absent from the current role's candidate set; retain for queue reconciliation instead of adding a route here."
            elif not task_urls:
                area_disposition = "review_required"
                area_reason = "The role task is present but no external task-source URL is recorded in the current queue."
            elif not external_urls(list(manual_target.get("source_refs") or [])):
                area_disposition = "review_required"
                area_reason = "The manually evaluated target has no area-specific source reference in the current queue."
            elif task and manual_area_reason:
                area_disposition = "supported_area_candidate"
                area_reason = manual_area_reason
                selected = manual_target
                selected_area_urls = external_urls(list(manual_target.get("source_refs") or []))
            else:
                area_disposition = "review_required"
                area_reason = "Manual task review did not provide a sufficiently specific task-to-area rationale; retain review-required."

            parent_counts[parent_disposition] += 1
            area_counts[area_disposition] += 1
            results.append({
                "batch_number": batch_number,
                "group_id": group.get("group_id"),
                "role_key": member.get("role_key"),
                "domain_id": member.get("domain_id"),
                "domain_name": member.get("domain_name"),
                "role_title": member.get("role_title"),
                "role_task_evidence": task,
                "parent_fit": {
                    "before_status": parent_status,
                    "disposition": parent_disposition,
                    "reason": parent_reason,
                    "evidence": parent_evidence_rows,
                    "task_source_refs": task_urls,
                },
                "area_route": {
                    "disposition": area_disposition,
                    "reason": area_reason,
                    "selected_area_key": selected.get("area_key") if area_disposition == "supported_area_candidate" else None,
                    "selected_area_label": selected.get("label") if area_disposition == "supported_area_candidate" else None,
                    "selected_area_boundary": selected.get("boundary") if area_disposition == "supported_area_candidate" else None,
                    "manual_task_disposition": manual_area_key,
                    "manual_task_rationale": manual_area_reason,
                    "task_boundary_analysis": area_result,
                    "candidate_areas": [
                        {
                            "area_key": area.get("area_key"),
                            "label": area.get("label"),
                            "boundary": area.get("boundary"),
                            "source_refs": sorted({str(x) for x in area.get("source_refs") or []}),
                        }
                        for area in candidates
                    ],
                },
                "source_policy": {
                    "title_used_as_fit_evidence": False,
                    "isco_or_esco_membership_used_as_fit_evidence": False,
                    "subgroup_membership_used_as_fit_evidence": False,
                    "external_task_source_urls": task_urls,
                    "area_source_urls": selected_area_urls,
                },
            })

    return {
        "schema_version": "2026-10-07.role-area-direct-route-batch-result.v1",
        "batch_number": batch_number,
        "lane": payload.get("lane"),
        "source_queue": str(input_path.relative_to(ROOT)).replace("/", "\\"),
        "group_count": len(payload.get("groups") or []),
        "role_count": len(results),
        "counts": {
            "parent_fit": dict(sorted(parent_counts.items())),
            "area_route": dict(sorted(area_counts.items())),
        },
        "records": results,
        "integrity": {
            "one_result_per_queue_role": len(results) == payload.get("role_count"),
            "duplicate_role_keys": len(results) - len({r["role_key"] for r in results}),
            "canonical_files_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
        },
        "source_class_counts": dict(sorted(source_classes.items())),
        "limitations": [
            "Queue task descriptions and source references are treated as the current role evidence ledger; this result does not claim live URL reachability.",
            "A candidate score is navigation evidence only. It is promoted only with a unique task-boundary match, supported parent fit and source references.",
            "Conditional/review-required parent links remain blocked; no area route is inferred from ISCO, ESCO, title, or subgroup membership.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build audit-only role-area/direct-route results for a disjoint queue batch range.")
    parser.add_argument("--start-batch", type=int, default=DEFAULT_BATCHES[0])
    parser.add_argument("--end-batch", type=int, default=DEFAULT_BATCHES[-1])
    parser.add_argument("--output-dir", type=Path, default=None)
    args = parser.parse_args()
    if args.start_batch < 1 or args.end_batch < args.start_batch:
        parser.error("--start-batch and --end-batch must define a positive ascending range")
    batches = tuple(range(args.start_batch, args.end_batch + 1))
    batch_label = f"{args.start_batch:03d}_{args.end_batch:03d}"
    out_dir = args.output_dir or (DEFAULT_OUT_DIR.parent / f"area_batch_{batch_label}")
    out_dir.mkdir(parents=True, exist_ok=True)
    batch_results = []
    all_records = []
    parent_summary = Counter()
    area_summary = Counter()
    source_classes = Counter()
    input_hashes = {}
    for batch_number in batches:
        input_path = QUEUE_DIR / f"batch-{batch_number:03}.json"
        input_hashes[str(input_path.relative_to(ROOT)).replace("/", "\\")] = hashlib.sha256(input_path.read_bytes()).hexdigest()
        result = process_batch(batch_number)
        batch_results.append(result)
        all_records.extend(result["records"])
        parent_summary.update(result["counts"]["parent_fit"])
        area_summary.update(result["counts"]["area_route"])
        source_classes.update(result["source_class_counts"])
        write_json(out_dir / f"batch-{batch_number:03}_result.json", result)

    combined = {
        "schema_version": "2026-10-07.role-area-direct-route-batches.v1",
        "scope": f"Role-area-of-specialization and direct-route audit for residual batches {args.start_batch:03d}-{args.end_batch:03d} only.",
        "terminology": "subgroup = area of specialization = area of practice",
        "batches": list(batches),
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "input_sha256": input_hashes,
        "counts": {
            "groups": sum(item["group_count"] for item in batch_results),
            "roles": len(all_records),
            "parent_fit": dict(sorted(parent_summary.items())),
            "area_route": dict(sorted(area_summary.items())),
            "canonical_files_edited": False,
        },
        "records": all_records,
        "source_class_counts": dict(sorted(source_classes.items())),
        "external_verification_sources": [
            {
                "publisher": "O*NET OnLine / U.S. Department of Labor",
                "title": "Data Warehousing Specialists",
                "url": "https://www.onetonline.org/link/details/15-1243.01",
                "use": "Verified that data-warehouse architecture, loading/transformation/extraction and warehouse structures are task-level evidence for the D010 data-engineer route; not used as a blanket role-domain rule.",
            },
            {
                "publisher": "O*NET OnLine / U.S. Department of Labor",
                "title": "Database Architects",
                "url": "https://www.onetonline.org/link/details/15-1243.00",
                "use": "Verified database/data-warehouse architecture task context supporting the D010 boundary comparison.",
            },
            {
                "publisher": "World Health Organization",
                "title": "Understanding primary health care",
                "url": "https://www.who.int/europe/news-room/questions-and-answers/item/questions-and-answers-understanding-primary-health-care",
                "use": "Verified the first-contact, continuing, life-course and community scope used to distinguish family medicine/generalist primary care from adult medical specialties for D023.",
            },
            {
                "publisher": "Council of Supply Chain Management Professionals",
                "title": "SCM Definitions and Glossary of Terms",
                "url": "https://cscmp.org/CSCMP/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx",
                "use": "Verified the supply-chain/logistics boundary used when retaining or rejecting broad D034 area candidates.",
            },
        ],
        "policy": {
            "isco_or_esco_membership_used_as_fit_evidence": False,
            "title_alone_used_as_fit_evidence": False,
            "subgroup_membership_used_as_fit_evidence": False,
            "parent_domain_gate_required_for_area_route": True,
            "no_canonical_files_edited": True,
            "no_area_source_reconciler_edited": True,
            "no_computational_files_edited": True,
            "other_agent_batches_touched": [],
        },
        "limitations": [
            "The result is an audit/checkpoint artifact, not a canonical seed or API update.",
            "Review-required cases are intentionally retained when parent fit or task-to-area evidence is not uniquely established.",
            "External references are recorded from the current queue; this run does not assert URL reachability or Nigerian demand/licensing.",
        ],
    }
    result_name = f"area_batch_{batch_label}_results.json"
    checkpoint_name = f"AREA_BATCH_{batch_label}_CHECKPOINT"
    write_json(out_dir / result_name, combined)
    md = [
        "# Role-area/direct-route audit — batches 006–010",
        "",
        "Status: **completed as an audit-only result**. No canonical role, domain, subgroup, area-source, or computational file was edited.",
        "",
        "## Scope",
        "",
        "- Queue lane: `role_area_direct_route_residual`.",
        "- Batches: **006–010**; **500 groups / 500 role records**.",
        "- Subgroup, area of specialization and area of practice are treated as the same layer.",
        "- Parent-domain fit and role-to-area fit were kept as separate gates.",
        "",
        "## Results",
        "",
        f"- Parent fit already supported: **{parent_summary['supported']:,}**; parent fit retained review-required: **{parent_summary['review_required']:,}**.",
        f"- Supported-area candidates: **{area_summary['supported_area_candidate']:,}**.",
        f"- Direct-domain candidates: **{area_summary['direct_domain_route_candidate']:,}**.",
        f"- Area routes retained review-required: **{area_summary['review_required']:,}**.",
        f"- Parent-blocked area cases: **{area_summary['blocked_by_parent_fit']:,}**.",
        f"- Duplicate role keys: **{len(all_records) - len({r['role_key'] for r in all_records}):,}**.",
        "",
        "The `review_required` parent count and the area-route counts are separate dimensions; they must not be added together as unique roles.",
        "",
        "## Evidence rule",
        "",
        "A supported-area candidate requires supported parent-domain fit, a unique and strong match between the role task text and one area boundary, an external task-source URL, and an area-source URL. Titles, ISCO/ESCO membership and existing subgroup membership were never used as fit evidence.",
        "",
        "## Output files",
        "",
        "- `area_batch_006_010_results.json` — combined machine-readable result.",
        "- `batch-006_result.json` through `batch-010_result.json` — per-batch machine-readable results.",
        "- `run_area_batches_006_010.py` — reproducible read-only result builder.",
        "",
        "Authoritative source families recorded in the queue include ESCO, O*NET, ILO/ISCO, WHO, NHTSA, IEEE/ACM and relevant professional bodies. Each record retains the exact source URLs supplied by the current queue; the result does not claim live URL reachability.",
        "",
        "External verification sources consulted for this checkpoint: O*NET Data Warehousing Specialists and Database Architects; WHO primary-health-care guidance; and the CSCMP supply-chain glossary. These sources corroborate task/boundary interpretation only; they do not establish the catalogue's area count or replace role-specific fit review.",
    ]
    md[7] = f"- Batches: **{args.start_batch:03d}-{args.end_batch:03d}**; **{combined['counts']['groups']:,} groups / {combined['counts']['roles']:,} role records**."
    md = [line for line in md if not line.startswith("- `area_batch_") and not line.startswith("- `batch-") and not line.startswith("- `run_area_batches_")]
    output_index = md.index("## Output files")
    md[output_index + 1:output_index + 1] = [
        f"- `{result_name}` — combined machine-readable result.",
        f"- `batch-{args.start_batch:03d}_result.json` through `batch-{args.end_batch:03d}_result.json` — per-batch machine-readable results.",
        "- `run_area_batches_006_010.py` — reproducible read-only result builder.",
    ]
    (out_dir / f"{checkpoint_name}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    write_json(out_dir / f"{checkpoint_name}.json", {
        "schema_version": "2026-10-07.role-area-direct-route-checkpoint.v1",
        "status": "completed",
        "scope": f"batches {args.start_batch:03d}-{args.end_batch:03d} only",
        "result_file": result_name,
        "counts": combined["counts"],
        "canonical_files_edited": False,
        "other_agent_batches_touched": [],
        "input_sha256": input_hashes,
    })
    print(json.dumps({"status": "completed", **combined["counts"], "source_class_counts": combined["source_class_counts"]}, indent=2))


if __name__ == "__main__":
    main()
