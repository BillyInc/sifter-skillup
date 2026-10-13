"""Generate exact-key, source-aware parent-domain reviews for D166-D168."""
import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE=Path(__file__).resolve().parent
QUEUE=LANE/"D085_D168_role_fit_queue_2026_10_05.json"
S,C,U,R="supported","conditional","unsupported_for_domain","unresolved"
SOURCES={
 "QUEUE":{"publisher":"Checked-in role/domain audit queue","url":"D085_D168_role_fit_queue_2026_10_05.json","locator":"Exact role key, recorded task and parent-domain scope.","limit":"Catalogue description under review, not independent proof of the complete occupation."},
 "SAE_J3016":{"publisher":"SAE International","url":"https://saemobilus.sae.org/standards/j3016_201609-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles","locator":"J3016 defines driving-automation levels as a taxonomy of system capability and the roles of driver/automation in performing the dynamic driving task; levels apply to engaged features and imply no learning sequence.","limit":"System taxonomy, not a curriculum, credential or occupational task list."},
 "NHTSA_AV":{"publisher":"U.S. National Highway Traffic Safety Administration","url":"https://www.nhtsa.gov/vehicle-safety/automated-vehicle-safety","locator":"Automated-driving systems concern vehicle systems performing driving tasks; NHTSA distinguishes these from driver-assistance technologies and discusses development, testing and safety.","limit":"U.S. safety-regulatory source; used for technical boundary only, not global legal requirements."},
 "OPENXR":{"publisher":"Khronos Group","url":"https://www.khronos.org/openxr/","locator":"OpenXR is a cross-platform API standard for AR/VR devices and application development, including head-mounted displays, controllers, tracking and haptics.","limit":"Technical standard for interoperability, not a professional role taxonomy or credential."},
 "IESF":{"publisher":"International Esports Federation","url":"https://www.iesf.org/rules-regulations","locator":"Esports rules govern fair competition and participants; IESF conduct provisions expressly address athletes, coaches, team managers, officials/referees, event staff and volunteers.","limit":"Competition federation documents substantiate esports ecosystem functions, not one universal labour-market taxonomy."},
 "IOC_ESPORTS":{"publisher":"International Olympic Committee","url":"https://newsroom.olympics.com/record/1204","locator":"Olympic Esports Series describes organized global virtual/simulated-sport competition with qualification and live finals.","limit":"Event example, not a role taxonomy or evidence that esports and video-game product design are the same occupation."},
}
REVIEWS={
 "D166":{
  "Robotics Engineers":(C,"Researches/designs/tests robotic applications. Robotics can contribute to autonomous vehicles, but this task is not vehicle- or driving-automation-specific.","NHTSA_AV"),
  "Robotics Technicians":(C,"Builds/tests/maintains robotic equipment and automated production systems. Relevant only when assigned to vehicle/ADS systems; generic factory robotics does not establish parent fit.","NHTSA_AV"),
  "automotive engineer":(C,"Designs and manufactures road vehicles and engineering systems; automotive context is close, but the task does not establish self-driving or automated-driving work.","SAE_J3016"),
  "automotive test driver":(C,"Tests prototype/pre-production vehicles for performance, safety and comfort; retain only when test plans cover automated-driving features or systems.","NHTSA_AV"),
  "homologation engineer":(C,"Manages vehicle/component type approval and regulatory compliance; autonomous-system approval is possible but not specified in this general vehicle task.","NHTSA_AV"),
  "mechanical engineer":(C,"Designs and maintains mechanical products/systems across sectors; no vehicle or automated-driving application is stated.","SAE_J3016"),
  "mechatronics engineer":(C,"Combines mechanical, electronic, computer and control engineering for intelligent systems, but the listed examples and task are cross-sector rather than autonomous-vehicle-specific.","SAE_J3016"),
  "optomechanical engineer":(C,"Designs optical mirrors/mounts and related optomechanical components. Such components could support vehicle sensing, but the task does not establish automotive sensors or ADS use.","NHTSA_AV"),
  "powertrain engineer":(C,"Designs vehicle propulsion systems, including electronics/software; this is automotive engineering, but not necessarily self-driving or automated-driving systems.","SAE_J3016"),
  "robotics engineer":(C,"Develops robotic devices and applications across industries; a vehicle/ADS assignment must be established rather than inferred from robotics alone.","NHTSA_AV"),
  "robotics engineering technician":(C,"Builds, tests and calibrates robotic systems across applications; no autonomous-vehicle use is established in the recorded task.","NHTSA_AV"),
  "software analyst":(C,"Specifies and tests general software products; this supports the parent only for software requirements assigned to autonomous-driving systems.","SAE_J3016"),
  "software developer":(C,"Builds software systems generically; the task does not identify sensing, perception, planning, control, embedded vehicle systems or ADS safety.","SAE_J3016"),
  "telecommunications engineer":(C,"Builds and maintains communications networks. Vehicle connectivity can support automated systems, but the generic task does not establish vehicle-to-everything or ADS communications work.","NHTSA_AV"),
 },
 "D167":{
  "3D animator":(C,"Animates 3D objects, characters and virtual environments; this is usable XR content work only when the output is built for an immersive experience.","OPENXR"),
  "3D modeller":(C,"Creates 3D models and virtual environments; relevant when assets are designed for AR/VR/MR use, which the generic task does not establish.","OPENXR"),
  "3D printing technician":(U,"Designs/programs physical manufactured products and maintains 3D printers; this is additive manufacturing, not immersive XR systems or experiences.","OPENXR"),
  "XR developer":(S,"Builds software and interactive systems for extended-reality and immersive-learning experiences, directly matching the parent scope.","OPENXR"),
  "XR experience builder":(S,"Designs and builds interactive immersive environments and content, directly matching XR experience creation.","OPENXR"),
  "XR/IL innovation facilitator":(S,"Translates learning/workplace needs into XR experience concepts, directly within immersive-technology adoption and design.","OPENXR"),
  "XR/IL solution architect":(S,"Designs architecture for immersive products, services and learning environments, directly matching XR systems work.","OPENXR"),
  "XR/IL technical support specialist":(S,"Supports XR hardware/software operation and resolves immersive-system issues, directly within the parent’s supporting systems.","OPENXR"),
  "XR/IL technology enabler":(S,"Assesses immersive requirements and technical constraints to select feasible XR solutions, directly matching XR implementation work.","OPENXR"),
  "animation director":(C,"Directs animation production generally; this can support XR content, but the recorded task does not specify immersive delivery.","OPENXR"),
  "animation layout artist":(C,"Creates 3D animation shots and camera/layout decisions; this supports XR only when the production targets immersive, spatial interaction.","OPENXR"),
  "digital media designer":(C,"Creates multimedia and may work on AR/VR, but the task also covers web/apps/social media; immersive work is optional rather than established.","OPENXR"),
  "footwear 3D developer":(U,"Uses CAD to develop footwear models, patterns and prototypes for product manufacture; digital 3D modelling alone is not immersive XR work.","OPENXR"),
 },
 "D168":{
  "Broadcast Technicians":(C,"Operates audio/video acquisition, editing and broadcast transmission equipment; fits when assigned to esports broadcasting, not broadcast work generally.","IESF"),
  "Video Game Designers":(U,"Designs game mechanics, stories and product documentation. Game creation is related to gaming but is not one of this domain's stated competitive-play, event, broadcast, journalism or community pathways.","IESF"),
  "broadcast news editor":(C,"Selects and schedules news coverage; the role fits only when its coverage/content remit is esports or gaming journalism.","IESF"),
  "broadcast technician":(C,"Installs and maintains broadcast signal equipment; relevant to esports production when assigned to gaming events, which the generic task does not specify.","IESF"),
  "esports admin/referee":(S,"Applies competition rules and records decisions, directly matching organized fair-play and official/referee functions in esports.","IESF"),
  "esports broadcast/production crew":(S,"Plans and delivers esports live/online broadcasts, directly matching the domain's broadcast-production pathway.","IESF"),
  "esports coach/analyst":(S,"Analyzes game/team performance and improves practice, strategy and match decisions, directly matching competitive coaching and analysis.","IESF"),
  "esports community manager":(S,"Builds communities around esports teams, events, games and creator channels, directly matching the community-management pathway.","IESF"),
  "esports event manager":(S,"Organizes esports tournaments, schedules, participants, partners and event delivery, directly matching esports event operations.","IESF"),
  "esports journalist/content creator":(S,"Creates content about esports and gaming communities, directly matching the domain's journalism/media and creator pathway.","IESF"),
  "esports shoutcaster/host":(S,"Presents and explains live esports competition and engages its audience, directly matching esports broadcast and hosting work.","IESF"),
  "esports team/player manager":(S,"Coordinates competitive players, teams, schedules, contracts and performance support, directly matching esports team operations.","IESF"),
  "event manager":(C,"Plans and runs events in general; this is in scope only when the event is competitive gaming/esports or creator-economy programming.","IOC_ESPORTS"),
  "online community manager":(C,"Maintains online communities generally; relevant when the community is a game, esports, streamer or creator community.","IESF"),
  "professional esports player":(S,"Competes in organized esports and trains with teams for matches, directly matching competitive play.","IESF"),
 }}

def main():
 q=json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
 for did,decisions_by_name in REVIEWS.items():
  rows=[x for x in q if x["domain_id"]==did];by={x["role_name"]:x for x in rows}
  if len(by)!=len(rows) or set(by)!=set(decisions_by_name):raise SystemExit(f"{did}: exact queued-key mismatch; refusing to write")
  decisions=[]
  for name,(status,why,src) in decisions_by_name.items():
   r=by[name];decisions.append({"role_key":r["role_key"],"role_name":name,"task_evidence":r["role_description"],"domain_fit":status,"rationale":why,"source_refs":["QUEUE",src]})
  tally=Counter(d["domain_fit"] for d in decisions)
  proposals=[{"role_key":d["role_key"],"action":"remove_from_parent_domain","candidate_transfer_domain":None,"evidence_basis":d["rationale"],"canonical_change_made":False} for d in decisions if d["domain_fit"]==U]
  payload={"schema_version":"1.0","audit_date":date.today().isoformat(),"domain_id":did,"domain_name":rows[0]["domain_name"],"scope":rows[0]["domain_scope"],"method":"Exact-key comparison of stored role tasks against parent scope. Conditional means the catalogue task does not itself establish the domain-specific assignment; a supported occurrence needs that context. No fit inferred from titles, ISCO or subgroup. No role-to-specialization decisions. SAE J3016 is treated strictly as a system-capability taxonomy, never as a learner sequence. No canonical edits.","counts":{"mappings_reviewed":len(decisions),"supported":tally[S],"conditional":tally[C],"unsupported_for_domain":tally[U],"unresolved":tally[R]},"decisions":decisions,"sources":SOURCES,"correction_proposals":proposals,"separate_coverage_candidates":[],"notes":["D168 expressly describes related pathways, not one standardized occupation. Esports-specific labels in this catalogue describe task groupings; external evidence does not establish all as universally standardized job titles.","No Nigeria-specific occupation variants are inferred from the globally scoped parent roles.","No canonical role/domain/subgroup mapping was changed."]}
  stem=f"{did}_role_domain_fit_review_2026_10_05";(LANE/f"{stem}.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  lines=[f"# {did} role-to-parent-domain fit review — {payload['audit_date']}","",f"**Scope:** {payload['scope']}","",f"- Reviewed: **{len(decisions)}** | supported **{tally[S]}** | conditional **{tally[C]}** | unsupported **{tally[U]}** | unresolved **{tally[R]}**","","| Exact role key | Recorded task | Fit | Reason |","|---|---|---|---|"]
  lines += [f"| `{d['role_key']}` | {d['task_evidence'].replace('|','\\|').replace(chr(10),' ')} | {d['domain_fit']} | {d['rationale'].replace('|','\\|')} |" for d in decisions]
  lines += ["","## Non-canonical correction proposals",""]+[f"- `{p['role_key']}`: remove from parent. {p['evidence_basis']} No canonical change made." for p in proposals] or ["- None."]
  lines += ["","## Sources and limits",""]+[f"- **{k} — {v['publisher']}**: [{v['url']}]({v['url']}). {v['locator']} Limit: {v['limit']}" for k,v in SOURCES.items()]
  lines += ["","## Audit notes",""]+[f"- {n}" for n in payload["notes"]]
  (LANE/f"{stem}.md").write_text("\n".join(lines)+"\n",encoding="utf-8");print(did,json.dumps(payload["counts"]))
if __name__=="__main__":main()
