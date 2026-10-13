"""Materialize exact-key D027 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D027_role_domain_fit_2026_10_05.json"
RULINGS={
"agricultural technician":("conditional","The role tests agricultural/aquaculture specimens and supports biological scientists; fit is limited to biological laboratory/testing work, not field production support alone."),
"air pollution analyst":("unsupported","Air-quality sampling and pollution-source analysis are environmental monitoring tasks, not biomedical/life-science laboratory practice as scoped here."),
"airport environment officer":("unsupported","Airport emissions, contamination and wildlife-hazard monitoring are environmental operations, not biomedical science."),
"animal behaviourist":("conditional","Researching animal behaviour is biological science; fit depends on laboratory/research work tied to organismal biology or health rather than behaviour management alone."),
"animal feed nutritionist":("unsupported","The stated work concerns feed formulation and agricultural/zoological production, not biomedical research or laboratory science."),
"aquaculture biologist":("conditional","Biological research on aquatic organisms and health can fit; production optimisation alone is aquaculture practice rather than biomedical science."),
"aquaculture environmental analyst":("unsupported","The task is monitoring environmental conditions at aquaculture sites, not biomedical research or biological laboratory work."),
"aquaculture quality supervisor":("unsupported","Production-quality oversight in aquaculture is an operational/HACCP function, not biomedical science."),
"aquaculture site supervisor":("unsupported","The task manages aquaculture production sites and workers, not biomedical research or laboratory science."),
"bacteriology technician":("supported","Laboratory research and testing of bacteria directly fit biomedical microbiology and its technical support."),
"biochemist":("supported","Researching chemical reactions in living organisms and developing biological/medical products directly fit the domain."),
"biochemistry technician":("supported","Laboratory analysis and testing of biochemical reactions in living organisms directly support biomedical research."),
"bioinformatics scientist":("supported","Computational analysis and curation of biological data directly support modern biomedical research."),
"biologist":("conditional","The profile studies living organisms broadly; fit requires biological research relevant to biomedical or laboratory life science, not unrelated field practice."),
"biology technician":("supported","Laboratory analysis of organic substances and organism-environment relationships directly supports life-science research."),
"biophysicist":("conditional","Applying physics to living systems is a relevant biomedical-science method; fit depends on biological/medical systems rather than non-biological applications."),
"biotechnical technician":("supported","Laboratory assistance in biotechnology research, development and testing directly fits the domain's biological laboratory scope."),
"botanical technician":("conditional","Plant-species testing is biological laboratory work; fit is limited to research/testing, not horticultural operations."),
"botanicals specialist":("unsupported","Applying plant science to beverage flavour and production is food/beverage product work, not biomedical science."),
"botanist":("conditional","Plant research is life science, but the role fits this biomedical domain only where its study is laboratory/research biology relevant to the stated scope."),
"conservation scientist":("unsupported","Managing forests, parks and natural-resource habitat is conservation practice, not biomedical science."),
"countryside officer":("unsupported","Managing public access and countryside conservation is environmental management, not biomedical science."),
"curator of horticulture":("unsupported","Maintaining botanical-garden collections and landscapes is horticultural practice, not biomedical science."),
"ecologist":("conditional","Studying organism-environment relationships is biological science; fit requires life-science research, not environmental assessment or conservation management alone."),
"environmental programme coordinator":("unsupported","The role coordinates organisational environmental sustainability programmes, not biomedical research or laboratory science."),
"environmental scientist":("unsupported","The stated work analyses environmental samples and develops environmental policy; it belongs to environmental science unless a specific biomedical laboratory task is evidenced."),
"environmental technician":("unsupported","Pollution sampling and environmental-protection testing are environmental monitoring, not biomedical science as defined."),
"epidemiologist":("conditional","Investigating disease causes and spread is biomedical/public-health research; fit is strongest for disease-focused epidemiology, not unrelated population-risk administration."),
"food biotechnologist":("conditional","Studying foodborne pathogens and preservation is relevant microbiology; fit depends on pathogen/biological research rather than food-process production alone."),
"geneticist":("supported","Researching genes and inherited conditions, including patient-related genetic disease, directly fits biomedical science."),
"groundwater monitoring technician":("unsupported","Groundwater pollution sampling and monitoring are environmental/water-quality tasks, not biomedical science."),
"immunologist":("supported","Research into immune-system function and responses to pathogens directly fits biomedical science."),
"marine biologist":("unsupported","The profile centres marine organisms and ecosystems; no medical, biomedical or laboratory health task is specified."),
"medical laboratory assistant":("conditional","Pre-analytical specimen handling supports biomedical diagnostic laboratories under supervision; it is support work rather than independent biomedical analysis."),
"microbiologist":("supported","Researching microorganisms to diagnose or counteract their effects directly fits biomedical microbiology."),
"natural resources consultant":("unsupported","Advising on fauna, flora, soil and water management is natural-resource practice, not biomedical science."),
"nature conservation officer":("unsupported","Local-environment management and conservation education do not establish biomedical-science work."),
"pharmacologist":("supported","Studying how medicines interact with organisms and living systems directly fits biomedical pharmacology."),
"physiologist":("supported","Researching how living organisms function and respond to conditions directly fits biomedical/life science."),
"pipeline environmental project manager":("unsupported","The role manages environmental preservation along pipeline routes, not biomedical research or laboratory practice."),
"scientific laboratory technician":("conditional","Laboratory sampling, testing and analysis support life-science professionals; fit requires a biological/biomedical lab assignment because the role spans scientific fields."),
"soil scientist":("unsupported","Soil quality and production/infrastructure advice are soil science and natural-resource practice, not biomedical science."),
"toxicologist":("supported","Researching harmful substance effects on human, animal and environmental organisms directly fits biomedical toxicology."),
"viticulture adviser":("unsupported","Improving vineyard and wine production is agricultural practice, not biomedical science."),
"water quality analyst":("conditional","Water sampling/testing is laboratory science, but it fits biomedical science only when focused on biological contaminants or health-related analysis; general water compliance is environmental work."),
"zoology technician":("conditional","Laboratory research/testing of animals and ecosystems is life-science support; fit requires biological research rather than husbandry or field operations alone."),
}

def source_url(ref:str)->str|None:
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None

def main()->None:
    queue=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in queue["role_mappings"] if r["domain_id"]=="D027"]
    if len(rows)!=46 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D027 exact queue changed; re-adjudicate")
    decisions=[]
    for row in rows:
        status,basis=RULINGS[row["role_name"]]
        refs=list(dict.fromkeys(url for ref in row["task_source_refs"] if (url:=source_url(ref))))
        if not refs: raise SystemExit(f"Missing exact task source for {row['role_key']}")
        decisions.append({"role_key":row["role_key"],"domain_fit_status":status,"task_evidence":row["role_task_text"],"basis":basis,"source_refs":refs,
            "source_limit":"ESCO occupational profiles provide the cited role-task evidence and may describe broad or locally situated practice; they do not establish biomedical relevance merely from an occupation label. Conditional cases require the biological, biomedical or laboratory task described. This is not a licensing determination."})
    counts=Counter(d["domain_fit_status"] for d in decisions)
    artifact={"schema_version":1,"domain_id":"D027","domain_name":rows[0]["domain_name"],"scope":"D027 only; exact task fit to parent Biomedical Science domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],
        "method":"Compare the stated tasks with biomedical/life-science research, organisms and human biology, medicines, physiological systems, biological laboratory testing, and explicitly described biological/agricultural science support. Separate biomedical/laboratory tasks from environmental monitoring, conservation, horticulture, food production and site management. Supported requires direct biomedical/life-science research or lab work; conditional requires the biological/biomedical assignment in the rationale; unrelated tasks are unsupported. No fit inferred from title, ISCO/ESCO family or subgroup membership.",
        "source_limit_policy":"ESCO task profiles are representative occupation descriptions, not proof that every worker performs the same work. Exact current source payloads are retained; conditional decisions restrict fit to the stated task context.","counts":{"reviewed_role_mappings":len(decisions),**{k:counts.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":artifact["counts"]},ensure_ascii=False))

if __name__=="__main__":main()
