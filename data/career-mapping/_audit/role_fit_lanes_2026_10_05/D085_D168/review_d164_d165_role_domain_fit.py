"""Generate exact-key, source-aware parent-domain reviews for D164-D165."""
import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE=Path(__file__).resolve().parent
QUEUE=LANE/"D085_D168_role_fit_queue_2026_10_05.json"
S,C,U,R="supported","conditional","unsupported_for_domain","unresolved"
SOURCES={
 "QUEUE":{"publisher":"Checked-in role/domain audit queue","url":"D085_D168_role_fit_queue_2026_10_05.json","locator":"Exact role key, recorded task and parent-domain scope.","limit":"Catalogue description under review, not independent proof."},
 "UNHABITAT":{"publisher":"UN-Habitat","url":"https://unhabitat.org/planning-and-design-for-sustainable-urban-mobility-global-report-on-human-settlements-2013","locator":"Sustainable urban mobility requires integrated land-use and transport planning focused on access to destinations, activities, services and goods.","limit":"Urban planning framework, not occupational licensing or a job taxonomy."},
 "WHO_UTP":{"publisher":"World Health Organization and UN-Habitat","url":"https://www.who.int/publications/i/item/9789240003170/","locator":"Integrating health in urban and territorial planning: multidisciplinary planning of human settlements and health/well-being at all levels.","limit":"Planning source; used to distinguish city systems work from individual clinical mobility rehabilitation."},
 "WHO_ACTIVITY":{"publisher":"World Health Organization","url":"https://www.who.int/publications-detail-redirect/9789240015128","locator":"Evidence-based physical-activity and sedentary-behaviour recommendations across age groups and health conditions.","limit":"Public-health guidance; not a professional credential or scope-of-practice rule."},
 "WHO_DIET":{"publisher":"World Health Organization","url":"https://www.who.int/health-topics/healthy-diet","locator":"Healthy diet guidance for health and prevention across the life course; population guidance recognizes local food contexts.","limit":"Health guidance; clinical nutrition scope and licensing are jurisdiction-dependent."},
 "AMTA":{"publisher":"American Music Therapy Association","url":"https://www.musictherapy.org/about/musictherapy/","locator":"Defines music therapy as clinical/evidence-based use of music interventions for individualized goals, delivered by a credentialed professional; includes wellness and rehabilitation goals.","limit":"U.S. professional association; credentials and legal recognition vary globally."},
 "ADTA":{"publisher":"American Dance Therapy Association","url":"https://www.adta.org/what-is-dancemovement-therapy","locator":"Defines dance/movement therapy as psychotherapeutic use of movement to support health and well-being.","limit":"Professional association definition; does not establish worldwide title regulation."},
 "AATA":{"publisher":"American Art Therapy Association","url":"https://arttherapy.org/about-art-therapy/","locator":"Defines art therapy as a mental-health profession using art-making, creative process and psychological theory within a psychotherapeutic relationship.","limit":"U.S.-based professional association with international members; title/credential rules vary."},
}
REVIEWS={
 "D164":{
  "Air Traffic Controllers":(U,"Controls aircraft and flight sectors; this is aviation operations, not urban mobility planning or city transport-system design.","UNHABITAT"),
  "Low Vision Therapists, Orientation and Mobility Specialists, and Vision Rehabilitation Therapists":(U,"Trains an individual with visual impairment in daily functioning; this is personal rehabilitation, not planning or operating urban transport/mobility systems.","WHO_UTP"),
  "air traffic controller":(U,"Controls aircraft movements and air routes; the recorded tasks concern aviation traffic operations, not urban ground mobility or airport planning.","UNHABITAT"),
  "air traffic instructor":(U,"Teaches air-navigation and aircraft traffic control; it does not design or plan city mobility systems.","UNHABITAT"),
  "air traffic manager":(U,"Manages aircraft/air-navigation resources and airport customer operations, not urban transport planning or smart-city systems.","UNHABITAT"),
  "air traffic safety technician":(U,"Installs and maintains aircraft/air-traffic navigation systems; aviation safety systems are distinct from urban mobility infrastructure.","UNHABITAT"),
  "airport planning engineer":(S,"Plans, designs and develops airport programmes, an airport-project function expressly included in the parent scope.","UNHABITAT"),
  "civil engineer":(C,"The recorded remit spans transport infrastructure and unrelated housing/building works. It fits only when the actual assignment is urban transport or mobility infrastructure.","UNHABITAT"),
  "construction engineer":(C,"Generic construction delivery does not establish urban mobility; retain only when the actual project is a city transport or smart-city system.","UNHABITAT"),
  "drainage engineer":(C,"Designs urban stormwater/sewerage systems that can be part of resilient city infrastructure, but drainage engineering alone is not mobility planning.","WHO_UTP"),
  "land planner":(C,"Plans land use and development, potentially integrated with transport/accessibility; the task description does not establish transport or smart-city planning in each assignment.","UNHABITAT"),
  "mobility services manager":(S,"Develops sustainable, interconnected mobility services such as bike-sharing and e-scooters to meet community transport needs, directly matching urban mobility.","UNHABITAT"),
  "rail project engineer":(S,"Delivers technical rail construction, commissioning and safety projects, directly within the parent’s rail-project scope.","UNHABITAT"),
  "rail traffic controller":(C,"Controls train movements and signals, a relevant urban rail operation when serving city transit; the record does not distinguish urban transit from intercity/freight rail.","UNHABITAT"),
  "smart city consultant":(S,"Applies sustainability, digital services and technology to urban initiatives, directly matching smart-city systems.","WHO_UTP"),
  "transport engineer":(S,"Designs transport infrastructure and modes including roads, railways and canals, directly within the transport-engineering scope.","UNHABITAT"),
  "transport planner":(S,"Uses policy, traffic data and social/environmental/economic analysis to improve transport systems, directly matching mobility planning.","UNHABITAT"),
  "urban planner":(S,"Plans development of cities and regions using community, transport and sustainability needs, directly matching urban planning.","UNHABITAT"),
  "water engineer":(C,"Water supply, treatment and flood management support urban systems and resilience, but the record does not establish a mobility or smart-city assignment.","WHO_UTP"),
  "water traffic coordinator":(U,"Coordinates vessel movements for shipping in ports and waterways; this is maritime logistics, not urban passenger/ground mobility or smart-city planning.","UNHABITAT"),
 },
 "D165":{
  "Dietitians and Nutritionists":(S,"Plans nutritional programmes, counsels people and promotes health/disease control, directly matching the domain's nutrition foundation.","WHO_DIET"),
  "Fitness and Wellness Coordinators":(S,"Manages fitness and wellness programmes and staff, directly matching the domain's exercise and wellness-programme scope.","WHO_ACTIVITY"),
  "animal assisted therapist":(C,"Uses animals in individualized therapy/education/human-service plans; it is a therapeutic-health modality, but the task is not specifically lifestyle coaching or preventive medicine.","AMTA"),
  "art therapist":(U,"The recorded work is psychotherapy/mental-health treatment through art, a distinct clinical profession rather than the parent's everyday-habit coaching/lifestyle-medicine remit.","AATA"),
  "dance therapist":(S,"Uses dance/movement therapeutically to support health, body awareness and well-being, matching the parent's expressly included dance-therapy pathway.","ADTA"),
  "dietitian":(S,"Assesses nutrition needs and provides evidence-based health advice, directly matching the nutrition and lifestyle-health scope.","WHO_DIET"),
  "fitness instructor":(S,"Delivers individual and group physical-activity instruction, directly matching the exercise foundation.","WHO_ACTIVITY"),
  "kinesiologist":(C,"Studies and applies human movement to improve function; it supports exercise/health pathways, but the task also includes research and movement-science work beyond coaching/lifestyle medicine.","WHO_ACTIVITY"),
  "music therapist":(S,"Uses individualized, evidence-based music interventions for wellness, rehabilitation and health goals, matching the parent's therapeutic-wellness scope.","AMTA"),
  "personal trainer":(S,"Assesses clients and designs, delivers and evaluates individual exercise programmes, directly matching exercise and health-habit coaching.","WHO_ACTIVITY"),
  "pilates teacher":(S,"Plans and adapts physical-activity sessions to client needs, directly matching the exercise/wellness scope; it does not imply clinical treatment authority.","WHO_ACTIVITY"),
  "prepared meals nutritionist":(C,"Evaluates ingredients and nutritional quality of prepared foods; relevant to nutrition, but this is primarily food-product/menu formulation rather than individual lifestyle coaching.","WHO_DIET"),
  "recreational therapist":(C,"Uses recreation and multiple modalities in treatment/rehabilitation. This overlaps health and well-being but is a broader clinical rehabilitation role than lifestyle coaching.","WHO_ACTIVITY"),
  "sport therapist":(C,"Provides rehabilitation exercise for injury/chronic conditions and coordinates with clinicians; this is health-related but the recorded emphasis is sports rehabilitation rather than lifestyle medicine or general wellness coaching.","WHO_ACTIVITY"),
  "weight loss consultant":(S,"Supports clients to change food/exercise habits, set goals and track progress, directly matching lifestyle coaching; diagnosis/treatment claims would require appropriate clinical qualification.","WHO_DIET"),
 }}

def main():
 q=json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
 for did,decisions_by_name in REVIEWS.items():
  rows=[x for x in q if x["domain_id"]==did]; by={x["role_name"]:x for x in rows}
  if len(by)!=len(rows) or set(by)!=set(decisions_by_name): raise SystemExit(f"{did}: exact queued-key mismatch; refusing to write")
  decisions=[]
  for name,(status,why,src) in decisions_by_name.items():
   row=by[name]; decisions.append({"role_key":row["role_key"],"role_name":name,"task_evidence":row["role_description"],"domain_fit":status,"rationale":why,"source_refs":["QUEUE",src]})
  tally=Counter(d["domain_fit"] for d in decisions)
  proposals=[{"role_key":d["role_key"],"action":"remove_from_parent_domain","candidate_transfer_domain":None,"evidence_basis":d["rationale"],"canonical_change_made":False} for d in decisions if d["domain_fit"]==U]
  payload={"schema_version":"1.0","audit_date":date.today().isoformat(),"domain_id":did,"domain_name":rows[0]["domain_name"],"scope":rows[0]["domain_scope"],"method":"Exact-key comparison of the stored task to parent-domain scope. No inference from titles, ISCO or subgroup membership. Conditional means a relevant setting/assignment must be evidenced before the mapping is treated as established. No role-to-specialization decisions are made; no canonical edits.","counts":{"mappings_reviewed":len(decisions),"supported":tally[S],"conditional":tally[C],"unsupported_for_domain":tally[U],"unresolved":tally[R]},"decisions":decisions,"sources":SOURCES,"correction_proposals":proposals,"separate_coverage_candidates":[],"notes":["The reviewed parent-domain population is globally framed; no Nigeria-specific variant is inferred.","Clinical therapeutic roles and local credentials remain subject to jurisdiction-specific regulation.","No canonical role/domain/subgroup mapping was changed."]}
  stem=f"{did}_role_domain_fit_review_2026_10_05";(LANE/f"{stem}.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  lines=[f"# {did} role-to-parent-domain fit review — {payload['audit_date']}","",f"**Scope:** {payload['scope']}","",f"- Reviewed: **{len(decisions)}** | supported **{tally[S]}** | conditional **{tally[C]}** | unsupported **{tally[U]}** | unresolved **{tally[R]}**","","| Exact role key | Recorded task | Disposition | Reason |","|---|---|---|---|"]
  lines += [f"| `{d['role_key']}` | {d['task_evidence'].replace('|','\\|').replace(chr(10),' ')} | {d['domain_fit']} | {d['rationale'].replace('|','\\|')} |" for d in decisions]
  lines += ["","## Non-canonical correction proposals",""]+[f"- `{p['role_key']}`: remove from parent. {p['evidence_basis']} No canonical change made." for p in proposals] or ["- None."]
  lines += ["","## Sources and limits",""]+[f"- **{k} — {v['publisher']}**: [{v['url']}]({v['url']}). {v['locator']} Limit: {v['limit']}" for k,v in SOURCES.items()]
  lines += ["","## Audit notes",""]+[f"- {x}" for x in payload["notes"]]
  (LANE/f"{stem}.md").write_text("\n".join(lines)+"\n",encoding="utf-8");print(did,json.dumps(payload["counts"]))
if __name__=="__main__": main()
