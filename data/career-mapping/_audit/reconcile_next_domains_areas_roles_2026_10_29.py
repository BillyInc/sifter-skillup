#!/usr/bin/env python3
"""Reconcile specialization areas and role routes for the next domain batch.

Uses evidence already stored in the local catalog, role records, overlays and
bounded source indexes. It performs no network search. Legacy ISCO groups are
archived with an area crosswalk; supported and conditional roles remain
available through source-backed area routes. Unsupported records are retained
for audit and are never deleted.
"""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
C = ROOT / "data" / "career-mapping"
STRUCT = C / "domain_structure.json"
CATALOG = C / "domain_specialization_catalog.json"
LIB = C / "role_library_v3_cleaned.json"
EMERGING = C / "emerging_role_overlays.json"
THIN = C / "thin_domain_role_overlays.json"
ARCHIVE = C / "_audit" / "NEXT_DOMAINS_RETIRED_ISCO_AND_ROLE_DISPOSITIONS_2026_10_29.json"

DOMAINS = ["D006", "D086", "D139", "D141", "D167", "D168"]
CONDITIONAL_ROLE_NAMES = {
    "director of compliance and information security in gambling", "gambling manager",
    "quantum systems architect", "quantum policy and standards specialist",
    "quantum technology business analyst", "quantum technology product strategist",
    "quantum technology training specialist", "quantum technology practitioner",
    "quantum technology engineering professional", "quantum technology hardware and software specialist",
    "quantum technology core innovator",
}

ROLE_SOURCE_CARDS={
    ("D139","gambling games designer"):[{"source_id":"ESCO-2166-8-GAMBLING-GAMES-DESIGNER","publisher":"European Commission ESCO (role record source)","title":"Gambling games designer, occupation code 2166.8","url":"https://esco.ec.europa.eu/en/classification/occupation-main","locator":"Local role record: ESCO code 2166.8; task description states gambling, betting and lottery game design and rules/structure.","supports":"The role's recorded product context is gambling, betting and lottery games, supporting D086 gaming-products design and distinguishing it from D139 video-game design.","claim_limit":"The locally stored ESCO locator is a classification code rather than a direct concept URI; retain this locator gap for the source-enrichment pass.","access_date":"2026-10-29"}],
    ("D139","production designer"):[{"source_id":"SCREENSKILLS-PRODUCTION-DESIGNER-FILM-TV","publisher":"ScreenSkills","title":"Production designer (Film and TV Drama)","url":"https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/craft/production-designer-film-and-tv-drama/","locator":"Role profile: film/TV visual world, art department, script, director and production work.","supports":"The source describes a film/TV remit; the canonical D139 record describes film, television and commercials rather than game production.","claim_limit":"This role profile supports the recorded film/TV specialization; it does not establish that a person with this title could never work on a game project.","access_date":"2026-10-29"}],
    ("D139","web content manager"):[{"source_id":"ESCO-WEB-MULTIMEDIA-DEVELOPERS-C2513","publisher":"European Commission ESCO","title":"Web and multimedia developers (ISCO 2513)","url":"https://esco.ec.europa.eu/en/classification/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Fisco%2FC2513","locator":"Narrower occupations list includes web content manager; category tasks cover web and multimedia development.","supports":"Confirms the role's recorded web-content occupational family; current role description is organizational web-content strategy/compliance/optimization, with no game-production task.","claim_limit":"The broad classification includes game-related web/multimedia occupations; use the role-specific task description, not the parent group, to keep this role outside the current D139 area set.","access_date":"2026-10-29"}],
    ("D139","performance video designer"):[{"source_id":"BARCELONACTIVA-PERFORMANCE-VIDEO-DESIGNER","publisher":"Barcelona Activa, Barcelona City Council employment service","title":"Performance video designer","url":"https://treball.barcelonactiva.cat/en/cataleg-ocupacions?idFicha=c995fe34-0909-4ce3-b7b7-97945efede56","locator":"Occupation profile describes projected image concepts, media fragments and execution for performance with artistic directors/operators.","supports":"Confirms live-performance visual-design context, not game development.","claim_limit":"A performance designer could collaborate on interactive media in other assignments; this source supports only the named performance role profile.","access_date":"2026-10-29"}],
    ("D167","3d printing technician"):[
        {"source_id":"ESCO-3D-PRINTING-TECHNICIAN","publisher":"European Commission ESCO","title":"3D printing technician","url":"http://data.europa.eu/esco/occupation/4cf7be91-fed9-47a7-9ca9-e74c7eb6becb","locator":"ESCO occupation URI 4cf7be91-fed9-47a7-9ca9-e74c7eb6becb; additive manufacturing task profile.","supports":"Identifies the generic 3D-printing tasks; does not establish XR fit alone.","claim_limit":"General manufacturing occupation; D167 route is only for XR-device prototype assignments.","access_date":"2026-10-29"},
        {"source_id":"OSU-ACCAD-SIM-LAB-XR-3D-PRINTING","publisher":"Ohio State University, Advanced Computing Center for the Arts and Design","title":"SIM Lab","url":"https://www.accad.ohio-state.edu/research/sim-lab","locator":"Lab description and equipment: XR/immersive projects and affiliated 3D-printing hardware for prototype fabrication.","supports":"Documents actual XR prototype work where 3D-printing support is useful.","claim_limit":"One university lab example; not evidence that all 3D printing technicians work in XR.","access_date":"2026-10-29"},
        {"source_id":"UEF-OPENAR-2-XR-3D-PRINTED-HEADSET","publisher":"University of Eastern Finland","title":"OpenAR 2.0","url":"https://sites.uef.fi/openar/openar20/","locator":"Open AR headset project; most structural components are 3D printed and assembly/design files are published.","supports":"Shows additive manufacturing used in XR hardware prototyping.","claim_limit":"Open educational hardware project; not a measure of occupational prevalence.","access_date":"2026-10-29"},
        {"source_id":"SAGE-2026-3D-PRINTED-XR-GOGGLE","publisher":"SAGE / Human Factors and Ergonomics Society","title":"Modular 3D-Printed Smartphone XR Goggle With Independent Tri-Axis Optical Adjustment","url":"https://journals.sagepub.com/doi/full/10.1177/10711813261475224","locator":"2026 open-access research article; abstract and results describe design, fabrication and testing of fully 3D-printed XR goggles.","supports":"Peer-reviewed research example linking additive manufacturing to XR-device design and prototype testing.","claim_limit":"Single research prototype; supports a conditional task route, not a universal role requirement.","access_date":"2026-10-29"}],
    ("D167","footwear 3d developer"):[{"source_id":"SHODES-FOOTWEAR-3D-DEVELOPER","publisher":"SHOES/SHODES European skills project","title":"SHODES occupational profile: Footwear 3D Developer","url":"https://shoedes.eu/Library/Uploads/R1-EN.pdf","locator":"p. 45; ESCO code 7536.2.2; footwear models, CAD patterns, lasts/components, materials, prototypes and product technical documentation.","supports":"Confirms footwear product-development scope rather than XR device/experience work.","claim_limit":"A footwear 3D developer could use XR tools in a particular assignment; this profile does not establish an XR remit.","access_date":"2026-10-29"}],
    ("D168","video game designers"):[{"source_id":"ONET-VIDEO-GAME-DESIGNERS-15-1255-01","publisher":"U.S. Department of Labor, O*NET OnLine","title":"Video Game Designers, 15-1255.01","url":"https://www.onetonline.org/link/details/15-1255.01","locator":"Occupation summary and tasks: game mechanics, stories, documentation, game design reviews and collaboration with game production staff.","supports":"Confirms this record belongs to video-game creation, not the D168 competition/event/broadcast/community area set.","claim_limit":"U.S. occupational profile; supports task distinction, not a global labor-market claim.","access_date":"2026-10-29"}],
}

# Role key -> area key(s), scoped to the task described in the current role
# record. Shared routes are intentional where the role's work crosses areas.
ROUTES = {
"D006": {
"ict test analyst": ["embedded-systems-and-firmware-engineering"], "software tester": ["embedded-systems-and-firmware-engineering"],
"ict system tester": ["embedded-systems-and-firmware-engineering"], "ict integration tester": ["iot-architecture-and-systems-integration"],
"internet of things specialists": ["iot-architecture-and-systems-integration"], "iot solutions architect": ["iot-architecture-and-systems-integration"],
"iot security specialist": ["iot-architecture-and-systems-integration", "iot-edge-computing-systems", "embedded-systems-and-firmware-engineering"],
"edge computing engineer": ["iot-edge-computing-systems"], "iot systems integrator": ["iot-architecture-and-systems-integration"],
"embedded systems engineer": ["embedded-systems-and-firmware-engineering"], "iot data analyst": ["iot-edge-computing-systems", "iot-architecture-and-systems-integration"],
"embedded system designer": ["embedded-systems-and-firmware-engineering", "iot-architecture-and-systems-integration"],
"embedded systems security engineer": ["embedded-systems-and-firmware-engineering", "iot-edge-computing-systems"],
"embedded systems software developer": ["embedded-systems-and-firmware-engineering"], "sensor engineer": ["embedded-systems-and-firmware-engineering"],
"sensor engineering technician": ["embedded-systems-and-firmware-engineering"], "iot developer": ["embedded-systems-and-firmware-engineering", "iot-architecture-and-systems-integration"],
},
"D086": {
"bookmaker": ["betting-and-wagering-operations"], "bingo caller": ["lottery-bingo-and-draw-based-operations"],
"odds compiler": ["betting-and-wagering-operations"], "casino cashier": ["casino-and-venue-gaming-operations"],
"casino pit boss": ["casino-and-venue-gaming-operations"], "lottery operator": ["lottery-bingo-and-draw-based-operations"],
"race track operator": ["betting-and-wagering-operations"], "casino gaming manager": ["casino-and-venue-gaming-operations"],
"gaming dealer": ["casino-and-venue-gaming-operations"], "gambling games developer": ["gaming-products-and-systems"],
"gambling games designer": ["gaming-products-and-systems"],
"gambling quality assurance engineer": ["gaming-products-and-systems"], "gambling manager": ["casino-and-venue-gaming-operations", "betting-and-wagering-operations", "lottery-bingo-and-draw-based-operations"],
"director of compliance and information security in gambling": ["casino-and-venue-gaming-operations", "betting-and-wagering-operations", "lottery-bingo-and-draw-based-operations", "gaming-products-and-systems"],
},
"D139": {
"technical director": ["game-engineering-and-technology", "game-production-and-team-delivery"], "software analyst": ["game-engineering-and-technology"],
"ict test analyst": ["game-quality-user-research-and-accessibility"], "software tester": ["game-quality-user-research-and-accessibility"],
"illustrator": ["game-art-animation-and-visual-development"], "animation director": ["game-art-animation-and-visual-development"],
"web designer": ["game-art-animation-and-visual-development"], "digital games tester": ["game-quality-user-research-and-accessibility"],
"stop-motion animator": ["game-art-animation-and-visual-development"], "animator": ["game-art-animation-and-visual-development"],
"3d animator": ["game-art-animation-and-visual-development"], "graphic designer": ["game-art-animation-and-visual-development"],
"animation layout artist": ["game-art-animation-and-visual-development"], "user interface designer": ["game-quality-user-research-and-accessibility", "game-art-animation-and-visual-development"],
"digital games developer": ["game-engineering-and-technology"], "special effects artist": ["game-art-animation-and-visual-development"],
"3d modeller": ["game-art-animation-and-visual-development"], "web developer": ["game-engineering-and-technology"],
"art director": ["game-art-animation-and-visual-development", "game-production-and-team-delivery"],
"digital media designer": ["game-art-animation-and-visual-development"], "digital artist": ["game-art-animation-and-visual-development"],
"digital games designer": ["game-design-and-narrative"], "software developer": ["game-engineering-and-technology"],
"video game designers": ["game-design-and-narrative"], "game producer": ["game-production-and-team-delivery"],
"game sound designer": ["game-audio"], "game designer": ["game-design-and-narrative"], "level designer": ["game-design-and-narrative", "game-engineering-and-technology"],
"technical game designer": ["game-design-and-narrative", "game-engineering-and-technology"], "gameplay programmer": ["game-engineering-and-technology"],
"technical artist": ["game-art-animation-and-visual-development", "game-engineering-and-technology"],
"game concept artist": ["game-art-animation-and-visual-development"], "game environment artist": ["game-art-animation-and-visual-development"],
"game character artist": ["game-art-animation-and-visual-development"], "game animator": ["game-art-animation-and-visual-development"],
"game narrative designer": ["game-design-and-narrative"], "game ui/ux designer": ["game-quality-user-research-and-accessibility", "game-art-animation-and-visual-development"],
"game qa tester": ["game-quality-user-research-and-accessibility"],
},
"D141": {
"quantum software engineer": ["quantum-algorithms-and-software"], "quantum hardware engineer": ["quantum-computing-hardware-and-devices"],
"quantum algorithm developer": ["quantum-algorithms-and-software"], "quantum error correction specialist": ["quantum-algorithms-and-software", "quantum-computing-hardware-and-devices"],
"quantum cryptography engineer": ["quantum-communication-and-networks"], "quantum systems architect": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks"],
"quantum sensing specialist": ["quantum-sensing-and-metrology"], "quantum machine learning specialist": ["quantum-algorithms-and-software"],
"quantum simulation scientist": ["quantum-algorithms-and-software"], "quantum applications engineer": ["quantum-algorithms-and-software"],
"quantum technician": ["quantum-computing-hardware-and-devices", "quantum-sensing-and-metrology"],
"quantum policy and standards specialist": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology business analyst": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology product strategist": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology training specialist": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology practitioner": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"], "quantum technology engineering professional": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology hardware and software specialist": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
"quantum technology core innovator": ["quantum-computing-hardware-and-devices", "quantum-algorithms-and-software", "quantum-communication-and-networks", "quantum-sensing-and-metrology"],
},
"D167": {
"xr/il technical support specialist": ["xr-devices-tracking-and-platform-engineering", "xr-software-and-real-time-application-development"],
"xr/il technology enabler": ["xr-devices-tracking-and-platform-engineering", "xr-software-and-real-time-application-development"],
"xr/il innovation facilitator": ["xr-experience-interaction-and-content-design", "human-factors-accessibility-safety-and-evaluation"],
"xr/il solution architect": ["xr-software-and-real-time-application-development", "xr-devices-tracking-and-platform-engineering"],
"xr experience builder": ["xr-experience-interaction-and-content-design"], "xr developer": ["xr-software-and-real-time-application-development"],
"digital media designer": ["xr-experience-interaction-and-content-design"], "3d animator": ["xr-experience-interaction-and-content-design"],
"3d modeller": ["xr-experience-interaction-and-content-design", "xr-devices-tracking-and-platform-engineering"],
"3d printing technician": ["xr-devices-tracking-and-platform-engineering"],
"animation director": ["xr-experience-interaction-and-content-design"], "animation layout artist": ["xr-experience-interaction-and-content-design"],
},
"D168": {
"professional esports player": ["esports-teams-players-and-performance"], "esports coach/analyst": ["esports-teams-players-and-performance"],
"esports shoutcaster/host": ["esports-broadcast-content-and-audience-partnerships"],
"esports journalist/content creator": ["esports-broadcast-content-and-audience-partnerships", "digital-creator-and-platform-based-content-work"],
"esports broadcast/production crew": ["esports-broadcast-content-and-audience-partnerships"],
"esports event manager": ["esports-competition-and-event-operations"],
"esports community manager": ["esports-broadcast-content-and-audience-partnerships", "digital-creator-and-platform-based-content-work"],
"esports team/player manager": ["esports-teams-players-and-performance"], "esports admin/referee": ["esports-competition-and-event-operations"],
"event manager": ["esports-competition-and-event-operations"], "online community manager": ["esports-broadcast-content-and-audience-partnerships", "digital-creator-and-platform-based-content-work"],
"broadcast news editor": ["esports-broadcast-content-and-audience-partnerships"], "broadcast technician": ["esports-broadcast-content-and-audience-partnerships"],
},
}

def read(p): return json.loads(p.read_text(encoding="utf-8-sig"))
def write(p, x, indent=2): p.write_text(json.dumps(x, ensure_ascii=False, indent=indent)+"\n", encoding="utf-8")
def key(s): return str(s or "").strip().casefold()
def urls(x):
    found=set()
    def walk(v):
        if isinstance(v,dict):
            for a,b in v.items():
                if a in {"url","source_url"} and isinstance(b,str) and b.startswith("http"): found.add(b)
                else: walk(b)
        elif isinstance(v,list):
            for z in v: walk(z)
        elif isinstance(v,str) and v.startswith("http"):
            found.add(v)
    walk(x); return sorted(found)

def main():
    structure=read(STRUCT); catalog=read(CATALOG); library=read(LIB); emerging=read(EMERGING); thin=read(THIN)
    prior_archive=read(ARCHIVE) if ARCHIVE.exists() else {"domains":[]}
    # The existing ESCO occupation record explicitly describes designing
    # gambling, betting and lottery games. Preserve its D139 provenance row,
    # but add a canonical D086-owned copy because the role-fit review itself
    # identifies gambling-game operations/design as its proper parent domain.
    d139_gambling=next((r for r in library if r.get("domain_id")=="D139" and key(r.get("role_name"))=="gambling games designer"),None)
    if d139_gambling and not any(r.get("domain_id")=="D086" and key(r.get("role_name"))=="gambling games designer" for r in library):
        moved=deepcopy(d139_gambling)
        moved["domain_id"]="D086"; moved["domain_name"]="Gaming, Betting and Lottery Operations"
        moved["student_path_status"]="active"; moved["student_path_exclusion_reason"]=None
        moved["domain_fit_review_status"]="supported"
        moved["domain_fit_review_basis"]="The stored ESCO task profile (occupation code 2166.8) says this role designs gambling, betting and lottery games and their rules/structure. This is D086 gaming-product design; the same recorded task does not make it a video-game design role in D139."
        moved["domain_fit_review_source_refs"]=["https://esco.ec.europa.eu/en/classification/occupation-main"]
        moved["role_domain_lane_review_sources"]=["data/career-mapping/role_library_v3_cleaned.json: D139 gambling games designer; ESCO occupation code 2166.8", "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D139_role_domain_fit_review_2026_10_05.json"]
        moved["role_domain_routes"]=[{"domain_id":"D086","status":"supported","route_type":"primary","evidence":{"basis":moved["domain_fit_review_basis"],"source_refs":moved["domain_fit_review_source_refs"]}}]
        moved["role_area_routes"]=[]
        moved["specialization_route_disposition"]={"status":"pending_reconciliation_script","moved_from_domain":"D139","source_locator":"ESCO occupation code 2166.8"}
        library.append(moved)
    # External checks show that additive manufacturing is sometimes part of
    # XR-device prototyping. Keep the generic 3D-printing occupation conditional
    # and route it only for that hardware-prototyping assignment.
    xr_print_sources={
        "esco_3d_printing_technician":{"name":"ESCO occupation profile: 3D printing technician","region":"global","evidence_type":"official_occupational_profile","url":"http://data.europa.eu/esco/occupation/4cf7be91-fed9-47a7-9ca9-e74c7eb6becb","access":"public_reference","notes":"Role-task scope: supports design/programming of products and operates, maintains and tests 3D printers; this source alone does not establish XR fit."},
        "osu_accad_xr_prototyping":{"name":"Ohio State University ACCAD SIM Lab","region":"United States","evidence_type":"university_research_lab_and_hardware_inventory","url":"https://www.accad.ohio-state.edu/research/sim-lab","access":"public_reference","notes":"Describes XR research hardware and affiliated 3D-printing hardware for prototype fabrication; supports a narrow XR-device prototyping assignment."},
        "uef_openar_printed_headset":{"name":"OpenAR 2.0","region":"Finland/global open project","evidence_type":"university_open_hardware_project","url":"https://sites.uef.fi/openar/openar20/","access":"public_reference","notes":"University of Eastern Finland AR headset project says most structural components are 3D printed; supports XR hardware prototyping, not a general XR role claim."},
        "sage_2026_printed_xr_goggle":{"name":"Modular 3D-Printed Smartphone XR Goggle With Independent Tri-Axis Optical Adjustment","region":"research publication","evidence_type":"peer_reviewed_research_article","url":"https://journals.sagepub.com/doi/full/10.1177/10711813261475224","access":"open_access","notes":"2026 study designs and tests a fully 3D-printed XR goggle; supports the prototype fabrication context, not the entire occupation."},
    }
    thin["sources"].update(xr_print_sources)
    xr_print=next((r for r in thin["roles"] if r.get("domain_id")=="D167" and key(r.get("role_name"))=="3d printing technician"),None)
    if xr_print:
        xr_print["domain_fit_review_status"]="conditional"
        xr_print["domain_fit_review_basis"]="Conditional D167 usefulness is source-backed when a 3D printing technician fabricates or maintains XR headset, mount, controller or tracking prototypes. ESCO describes the underlying additive-manufacturing role; Ohio State ACCAD, the University of Eastern Finland OpenAR project and a 2026 XR-goggle study document 3D printing used for immersive-device prototypes. The generic role remains outside D167 when it serves unrelated manufacturing."
        xr_print["domain_fit_review_source_refs"]=["http://data.europa.eu/esco/occupation/4cf7be91-fed9-47a7-9ca9-e74c7eb6becb", "https://www.accad.ohio-state.edu/research/sim-lab", "https://sites.uef.fi/openar/openar20/", "https://journals.sagepub.com/doi/full/10.1177/10711813261475224"]
        xr_print["role_domain_lane_review_status"]="conditional"
        xr_print["role_domain_lane_review_date"]="2026-10-29"
        xr_print["student_path_status"]="active"
        xr_print["student_path_exclusion_reason"]=None
        xr_print["role_domain_routes"]=[{"domain_id":"D167","status":"conditional","route_type":"secondary","evidence":{"basis":xr_print["domain_fit_review_basis"],"source_refs":xr_print["domain_fit_review_source_refs"]},"qualification":"Useful only for XR device prototyping or fabrication assignments; unrelated 3D printing work remains outside this route."}]
    for source_name, collection in (("role_library_v3_cleaned.json",library),("emerging_role_overlays.json",emerging["roles"]),("thin_domain_role_overlays.json",thin["roles"])):
        for role in collection:
            cards=ROLE_SOURCE_CARDS.get((role.get("domain_id"),key(role.get("role_name"))))
            if cards:
                role["domain_fit_review_source_cards"]=cards
                role["domain_fit_review_source_refs"]=sorted(set(role.get("domain_fit_review_source_refs",[])+[card["url"] for card in cards]))
    catalog_domains={d["domain_id"]:d for d in catalog["domains"]}
    records=[]
    role_records=[]
    for source_name, collection in (("role_library_v3_cleaned.json",library),("emerging_role_overlays.json",emerging["roles"]),("thin_domain_role_overlays.json",thin["roles"])):
        for role in collection:
            if role.get("domain_id") in DOMAINS:
                role_records.append((source_name, role))

    for did in DOMAINS:
        domain=catalog_domains[did]
        areas=domain["areas"]
        by_suffix={a["area_key"].split(":",1)[1]:a for a in areas}
        by_label={a["label"]:a for a in areas}
        ds=structure[did]
        previous=deepcopy(ds.get("subgroups",[]))
        if not previous:
            old=next((x for x in prior_archive.get("domains",[]) if x.get("domain_id")==did),None)
            if old:
                previous=[deepcopy(x["record"]) for x in old.get("legacy_subgroups",[]) if x.get("record")]
        # One-time archive: preserve exact source groups and an explicit, reviewable crosswalk.
        if previous:
            archive_rows=[]
            for g in previous:
                label=key(g.get("label"))
                # ISCO is retained only as a crosswalk; where its broad group
                # cannot be resolved, role tasks (not group membership) decide.
                crosswalk={
                    "D006": {
                        "internet of things engineering & sensing": ["embedded-systems-and-firmware-engineering","iot-architecture-and-systems-integration"],
                        "internet of things software & systems": ["iot-architecture-and-systems-integration","iot-edge-computing-systems"],
                    },
                    "D086": {
                        "administrative and commercial managers": ["betting-and-wagering-operations","lottery-bingo-and-draw-based-operations"],
                        "hospitality, retail and other services managers": ["casino-and-venue-gaming-operations"],
                        "science and engineering professionals": ["gaming-products-and-systems"],
                        "customer services clerks": ["casino-and-venue-gaming-operations","betting-and-wagering-operations","lottery-bingo-and-draw-based-operations"],
                    },
                    "D139": {
                        "game art & animation": ["game-art-animation-and-visual-development"],
                        "gameplay programming": ["game-engineering-and-technology"],
                        "creative direction": ["game-design-and-narrative","game-production-and-team-delivery"],
                    },
                    "D141": {
                        "quantum hardware & sensing": ["quantum-computing-hardware-and-devices","quantum-sensing-and-metrology"],
                        "teaching professionals": [],
                        "quantum applications, policy & standards": ["quantum-algorithms-and-software","quantum-communication-and-networks"],
                        "quantum software & algorithms": ["quantum-algorithms-and-software"],
                        "quantum technology operations": ["quantum-computing-hardware-and-devices"],
                    },
                    "D167": {
                        "extended reality designers & hardware engineers": ["xr-experience-interaction-and-content-design","xr-devices-tracking-and-platform-engineering"],
                        "extended reality innovation & solution architecture": ["xr-experience-interaction-and-content-design","xr-software-and-real-time-application-development","xr-devices-tracking-and-platform-engineering"],
                        "augmented and virtual reality software developers": ["xr-software-and-real-time-application-development"],
                        "legal, social and cultural professionals": ["human-factors-accessibility-safety-and-evaluation"],
                        "science and engineering associate professionals": ["xr-software-and-real-time-application-development","xr-devices-tracking-and-platform-engineering"],
                        "extended reality technical support specialists": ["xr-devices-tracking-and-platform-engineering","xr-software-and-real-time-application-development"],
                        "food processing, wood working, garment and other craft and related trades workers": [],
                    },
                    "D168": {
                        "esports operations & management": ["esports-competition-and-event-operations"],
                        "esports community & partnerships": ["esports-broadcast-content-and-audience-partnerships","digital-creator-and-platform-based-content-work"],
                        "esports broadcast & content production": ["esports-broadcast-content-and-audience-partnerships"],
                        "esports team & player management": ["esports-teams-players-and-performance"],
                        "competitive performance & analysis": ["esports-teams-players-and-performance"],
                        "information and communications technicians": ["esports-broadcast-content-and-audience-partnerships"],
                    },
                }
                targets=crosswalk.get(did,{}).get(label,[])
                archive_rows.append({"record":g,"disposition":"retired_from_active_specialization_taxonomy","mapped_area_ids":[by_suffix[x]["area_key"] for x in targets],"note":"ISCO family is retained as historical/provenance evidence only; area membership comes from role-task routes."})
            records.append({"domain_id":did,"legacy_subgroups":archive_rows})
            ds["subgroups"]=[]; ds["has_subgroups"]=False
            ds["subgroup_reconciliation_status"]="legacy_ISCO_subgroups_archived; replaced by source-reconciled areas and task-linked role routes"
        role_by_area={a["area_key"]:[] for a in areas}
        active_keys=[]
        nonroute_dispositions=[]
        for source_name, role in [x for x in role_records if x[1].get("domain_id")==did]:
            name=key(role.get("role_name"))
            fit=role.get("domain_fit_review_status") or role.get("domain_fit_status") or "supported"
            # Preserve the source's explicit non-fit disposition. It remains in the source records.
            if fit=="unsupported":
                role["role_area_routes"]=[r for r in role.get("role_area_routes",[]) if not str(r.get("area_id","")).startswith(did+":")]
                role["role_domain_routes"]=[r for r in role.get("role_domain_routes",[]) if r.get("domain_id")!=did]
                role["student_path_status"]="excluded"
                role["student_path_exclusion_reason"]="Source/task review does not establish a fit in this domain; the role record and source evidence remain preserved for its supported domain or audit."
                role["specialization_route_disposition"]={"status":"not_routed","reason":"Existing source/task review does not establish a fit in this domain's areas; record retained for audit and cross-domain ownership."}
                moved_to={"domain_id":"D086","area_id":"D086:gaming-products-and-systems"} if did=="D139" and name=="gambling games designer" else None
                nonroute_dispositions.append({"role_name":role.get("role_name"),"status":"unsupported_in_this_domain","supported_elsewhere":moved_to,"basis":role.get("domain_fit_review_basis") or role.get("domain_fit_review_status"),"source_refs":urls(role),"source_ids":role.get("domain_fit_review_source_refs",[]),"internal_review_records":role.get("role_domain_lane_review_sources",[])})
                continue
            # Duplicate source label must be handled before the no-route check.
            if did=="D168" and name=="broadcast technicians":
                role["role_area_routes"]=[r for r in role.get("role_area_routes",[]) if not str(r.get("area_id","")).startswith(did+":")]
                role["role_domain_routes"]=[r for r in role.get("role_domain_routes",[]) if r.get("domain_id")!=did]
                role["student_path_status"]="excluded"
                role["student_path_exclusion_reason"]="Duplicate occupational label retained as an alias to the canonical Broadcast Technician record; do not display as a second role."
                role["specialization_route_disposition"]={"status":"merged_alias","canonical_role_name":"broadcast technician","reason":"Duplicate occupation label; source identity retained, canonical route is on the singular record."}
                nonroute_dispositions.append({"role_name":role.get("role_name"),"status":"duplicate_alias","canonical_role_name":"broadcast technician","basis":"Same occupational identity represented by the singular canonical record.","source_refs":urls(role),"source_ids":role.get("domain_fit_review_source_refs",[]),"internal_review_records":role.get("role_domain_lane_review_sources",[])})
                continue
            suffixes=ROUTES.get(did,{}).get(name)
            if not suffixes:
                role["specialization_route_disposition"]={"status":"unresolved_no_route","reason":"No source-backed area route was established from the stored role task and area boundary; retained for explicit follow-up."}
                continue
            route_rows=[]
            role_urls=urls(role)
            for i,suffix in enumerate(suffixes):
                area=by_suffix[suffix]
                area_urls=urls(area)
                evidence_urls=sorted(set(role_urls+area_urls))
                if not evidence_urls:
                    raise ValueError(f"No existing source URL for {did}|{name}")
                # Conditional parent roles stay useful: the condition tells the learner which assignment makes the branch relevant.
                conditional=fit=="conditional" or name in CONDITIONAL_ROLE_NAMES
                condition=f"This is useful when the role assignment includes work within the area boundary: {area.get('boundary') or area.get('description')}. A role title alone does not imply this assignment."
                if did=="D167" and name=="3d printing technician":
                    condition="Useful only when assigned to fabricate, modify or maintain physical XR device prototypes, headset mounts, controllers or tracking hardware; general additive-manufacturing work is outside this route."
                basis=f"Task-linked route: the stored role description and the area boundary identify work in {area['label']}. This is an area of useful learning for the matching assignment, not a claim that every job with this title performs it."
                route={"area_id":area["area_key"],"status":"conditional" if conditional else "supported","route_type":"primary" if i==0 else "secondary","evidence":{"basis":basis,"source_refs":evidence_urls,"conditions":[condition] if conditional else []},"qualification":condition if conditional else None}
                route_rows.append(route); role_by_area[area["area_key"]].append(f"{did}|{role['role_name']}")
            role["role_area_routes"]=[r for r in role.get("role_area_routes",[]) if not str(r.get("area_id","")).startswith(did+":")]+route_rows
            # A conditional route means task-specific usefulness. It is still
            # a student-available learning route; it is not an eligibility gate.
            role["student_path_status"]="active"
            role["student_path_exclusion_reason"]=None
            role["specialization_fit_review_status"]="conditional" if any(r["status"]=="conditional" for r in route_rows) else "supported"
            role["specialization_fit_status"]="conditional" if any(r["status"]=="conditional" for r in route_rows) else "supported"
            role["specialization_fit_domain_gate"]="conditional_task_applicability" if any(r["status"]=="conditional" for r in route_rows) else "supported"
            role["specialization_fit_area_key"]=route_rows[0]["area_id"]
            for domain_route in role.get("role_domain_routes",[]):
                if domain_route.get("domain_id")!=did: continue
                if fit=="conditional" or name in CONDITIONAL_ROLE_NAMES:
                    domain_route["status"]="conditional"
                    domain_route["qualification"]="Useful in this domain when the assignment includes the domain-specific tasks described in the role record. The area routes show where that work belongs; conditional does not block the learning path."
                    evidence=domain_route.setdefault("evidence",{})
                    evidence["basis"]="Conditional domain applicability is tied to the recorded domain-specific role tasks. The area routes show the task contexts in which this role can use the domain learning path."
                    evidence["source_refs"]=sorted(set(urls(role)))
                else:
                    domain_route["status"]="supported"
            role["specialization_route_disposition"]={"status":"routed","route_count":len(route_rows),"fit":"conditional" if any(r["status"]=="conditional" for r in route_rows) else "supported","basis":"Area routes use the role task and area boundary; conditional indicates task-specific usefulness and does not mean the role is hidden or exempt."}
            active_keys.append(f"{did}|{role['role_name']}")
        # Area catalog and structure are projections from the route records.
        for area in areas:
            ids=sorted(set(role_by_area[area["area_key"]]),key=str.casefold)
            area["role_keys"]=ids; area["role_route_count"]=len(ids)
            area["role_route_evidence_basis"]="Derived from canonical role/overlay task routes; conditions and source references are stored on each role route."
        ds["role_count"]=len({r["role_name"].casefold() for _,r in role_records if r.get("domain_id")==did})
        ds["areas_of_specialization"]=[{
            "area_id":a["area_key"],"label":a["label"],"description":a.get("description"),"boundary":a.get("boundary"),
            "source_ids":a.get("source_ids",[]),"source_references":a.get("source_references",[]),"uncorroborated_source_urls":a.get("uncorroborated_source_urls",[]),
            "recommendation_status":a.get("recommendation_status"),"area_status":a.get("area_status"),"student_visible":a.get("student_visible",False),
            "nigerian_context":a.get("nigerian_context"),"source_evidence_status":a.get("source_evidence_status"),"unresolved_source_ids":a.get("unresolved_source_ids",[]),
            "area_evidence_link_check":a.get("area_evidence_link_check",{}),"role_keys":a["role_keys"],"role_route_count":a["role_route_count"]
        } for a in areas]
        ds["areas_of_specialization_status"]="reconciled_to_domain_specialization_catalog_with_task-linked_supported_and_conditional_role_routes; source-enrichment/visibility gates remain separate"
        ds["areas_of_specialization_source"]="data/career-mapping/domain_specialization_catalog.json"
        domain["canonical_status"]="area_set_reconciled_and_roles_task-routed_pending_full_source_enrichment_and_student_contract"
        domain["recommended_area_count_normalized"]=len(areas)
        domain["open_items"]=[x for x in domain.get("open_items",[]) if not any(t in str(x).lower() for t in ["role integration","role mapping","isco subgroup reconciliation"])]
        records[-1:]=records[-1:] # no-op for domains with subgroup record
        crosswalk=[]
        if previous:
            crosswalk=records[-1]["legacy_subgroups"] if records and records[-1].get("domain_id")==did else []
        else:
            crosswalk=[]
        if records and records[-1].get("domain_id")==did: records[-1]["area_ids"]=[a["area_key"] for a in areas]
        else: records.append({"domain_id":did,"legacy_subgroups":[],"area_ids":[a["area_key"] for a in areas]})
        records[-1]["roles"]={"source_record_count":ds["role_count"],"routed_role_records":len(active_keys),"unsupported_or_duplicate_records":sum(1 for _,r in role_records if r.get("domain_id")==did and (r.get("domain_fit_review_status") or r.get("domain_fit_status"))=="unsupported")+sum(1 for _,r in role_records if r.get("domain_id")==did and key(r.get("role_name"))=="broadcast technicians"),"routed_role_keys":active_keys}
        records[-1]["roles"]["nonroute_dispositions"]=nonroute_dispositions

    # Recount top-level catalog statistics without changing other domains' content.
    catalog["counts"]["area_records"]=sum(len(d.get("areas",[])) for d in catalog["domains"])
    catalog["counts"]["student_area_candidates_before_role_gate"]=catalog["counts"]["area_records"]
    write(ARCHIVE,{"recorded_on":"2026-10-29","scope":DOMAINS,"purpose":"Legacy subgroup crosswalk plus role-route disposition audit; unsupported records remain preserved in canonical source files.","domains":records})
    write(CATALOG,catalog,indent=2); write(STRUCT,structure,indent=1); write(LIB,library,indent=2); write(EMERGING,emerging,indent=2); write(THIN,thin,indent=2)
    print("Reconciled domains:",", ".join(DOMAINS))
    for row in records:
        print(row["domain_id"],"areas",len(row["area_ids"]),"role records",row["roles"]["source_record_count"],"routed",row["roles"]["routed_role_records"],"unsupported/duplicate",row["roles"]["unsupported_or_duplicate_records"],"retired ISCO groups",len(row["legacy_subgroups"]))

if __name__=="__main__": main()
