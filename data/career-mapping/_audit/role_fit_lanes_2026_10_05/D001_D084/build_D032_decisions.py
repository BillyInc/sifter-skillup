"""Materialize exact-key D032 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent; WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"; OUTPUT=HERE/"D032_role_domain_fit_2026_10_05.json"
RULINGS={
"administrative assistant":("conditional","Office and administrative support fits only when assigned to project/office coordination described by this domain; routine general administration alone is not project management."),
"advertising sales agent":("unsupported","Selling advertising space is a sales task; the profile does not establish project planning, coordination or delivery."),
"auctioneer":("unsupported","Conducting auctions is a transaction/presentation task, not project planning or delivery management."),
"branch manager":("conditional","Managing a geographic business branch is general operations leadership; it fits only where the role coordinates projects or office operations rather than routine branch management alone."),
"building information modelling consultant":("conditional","The profile advises construction teams on BIM processes and implementation; fit is limited to coordinating project methods and technology adoption, not technical BIM delivery alone."),
"business analyst":("supported","Analysing business processes and recommending organisational improvements directly matches the domain's process-analysis/project-improvement scope."),
"business consultant":("supported","Identifying and advising on process improvements is directly within the stated business-analysis and improvement remit."),
"business intelligence manager":("conditional","Using business data to improve operations supports project/process improvement when tied to a defined change initiative; recurring analytics management alone is not project delivery."),
"business manager":("conditional","The role plans and implements business-unit operations; project fit requires responsibility for defined change/delivery work beyond ongoing unit management."),
"director of compliance and information security":("unsupported","The exact duties are compliance and information-security governance, not project coordination or management."),
"editorial assistant":("conditional","Publication support may coordinate deadlines and production tasks, but editorial assistance alone does not establish project-management accountability."),
"education administrator":("conditional","Managing institutional administration and student activities may include defined programme/project coordination; routine education administration alone is insufficient."),
"EU funds manager":("conditional","Administering public funds and investment priorities can involve programme implementation, but fund administration alone is not project management."),
"executive assistant":("conditional","Executive scheduling, meeting and information coordination overlaps project-office support only when assigned to defined projects; ordinary executive assistance is not project management."),
"fundraising assistant":("conditional","Donation/grant processing can support a defined project or programme; fundraising administration alone is not project delivery management."),
"health safety and environmental manager":("conditional","Designing and executing organisational policies may involve improvement projects; ongoing HSE compliance management alone belongs to HSE practice."),
"intellectual property consultant":("unsupported","Valuing and advising on patents/copyrights is specialist IP consulting, not project management."),
"international student exchange coordinator":("conditional","The role coordinates an end-to-end exchange process and associated arrangements; fit is programme coordination, though ongoing student-service administration is not automatically project management."),
"lean manager":("supported","Planning and managing continuous-improvement programmes and projects directly matches the domain's lean/process-improvement scope."),
"logistics analyst":("conditional","Analysing supply-chain processes and proposing improvements overlaps project/process work, but routine logistics optimisation is primarily supply-chain management."),
"management assistant":("conditional","Departmental support can assist project coordination, but the role's broad administrative assistance does not establish project ownership."),
"manufacturing cost estimator":("unsupported","Estimating manufacturing costs is a specialist costing task without project planning/delivery accountability in the source description."),
"policy manager":("conditional","Managing policy programmes and strategic objectives can involve programme delivery; policy development/oversight alone is not project management."),
"process officer":("supported","Documenting, evaluating and improving organisational processes directly fits process improvement and change coordination in this domain."),
"procurement department manager":("conditional","Procurement-team management is a distinct function; fit is limited to procurement initiatives/projects, not routine sourcing leadership."),
"procurement support officer":("conditional","Procurement-document support can contribute to project procurement, but general purchasing-process support alone is not project management."),
"programme manager":("supported","Coordinates multiple interdependent projects to achieve combined objectives; this is direct programme management."),
"project support officer":("supported","Provides project-office services that support successful project execution, directly within the parent scope."),
"promoter":("conditional","Arranging a performance involves venue/date/deal coordination and promotion; fit is a bounded event project, not ongoing project-management practice."),
"publishing rights manager":("unsupported","Managing copyright and rights sales is publishing/IP work rather than project coordination."),
"relocation officer":("conditional","Coordinates a defined organisational move and its services, which is project-like work; routine relocation advice alone is not broad project management."),
"social security administrator":("conditional","Directing public programmes involves programme administration; fit requires defined programme implementation/coordination, not routine benefits administration."),
"strategic planning manager":("conditional","Developing and coordinating organisational strategy overlaps portfolio/change planning; ongoing strategy work is not itself project delivery."),
"supply chain assistant":("conditional","Administrative follow-up across purchasing, manufacturing and distribution can support projects, but routine supply-chain operations belong to the supply-chain domain."),
"sustainability manager":("conditional","Designing implementation plans may involve change projects; continuous sustainability/compliance operations alone are not project management."),
"talent agent":("unsupported","Representing entertainment professionals and negotiating engagements is talent representation, not project management."),
"tourism contract negotiator":("unsupported","Negotiating tourism-service contracts is commercial contracting, not project planning or delivery management."),
"tourism policy director":("conditional","Developing and implementing tourism policy/marketing plans can include programmes, but policy and industry oversight alone does not establish project-management duties."),
}
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D032"]
    if len(rows)!=38 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D032 exact queue changed or ruling inventory incomplete")
    ds=[]
    for r in rows:
        status,basis=RULINGS[r["role_name"]]; refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing exact task source for {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Exact-key ESCO task evidence is representative. Conditional status is bounded to defined project/programme/change delivery; ordinary functional operations, administrative support or specialist practice is not automatically project management."})
    c=Counter(d["domain_fit_status"] for d in ds)
    a={"schema_version":1,"domain_id":"D032","domain_name":rows[0]["domain_name"],"scope":"D032 only; exact task fit to parent Project and Programme Management domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Assess tasks against defined-project planning/coordination, programme oversight, project-office support, process/lean improvement and change delivery. Conditional roles require a bounded project/programme assignment; routine functional management, administration, sales or specialist practice is separated. No inference from role title or subgroup.","source_limit_policy":"ESCO profiles are representative and role boundaries vary. Conditional does not imply project-management credentials or universal project accountability.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
