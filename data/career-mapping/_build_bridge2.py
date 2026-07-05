#!/usr/bin/env python3
"""Accurate JAMB->CCMAS bridge for new disciplines via TOKEN-CONTAINMENT matching
(a canonical programme name whose significant tokens are contained in the JAMB name
is the base programme), with curated overrides. Far more accurate than char-ratio fuzzy.
Appends to programme_mapping.json (re-runnable)."""
import json, re

STOP = {"and","of","the","with","in","a","sciences","science","studies","management","b","sc"}
def toks(s): return [t for t in re.findall(r"[a-z0-9]+", s.lower()) if t not in STOP]

import glob as _glob
canon = {}  # discipline -> [(name, code, tokenset)]
for f in _glob.glob("ccmas/*.json"):
    d = json.load(open(f, encoding="utf-8"))
    canon[d["discipline"]] = [(p["name"], p["code"], set(toks(p["name"]))) for p in d["programmes"]]

# curated overrides: jamb-name-substring -> (discipline, code). First match wins.
OVERRIDE = [
    ("software eng", ("Computing","SEN")), ("cyber", ("Computing","CYB")),
    ("data sci", ("Computing","DTS")), ("information system", ("Computing","INS")),
    ("information and communication", ("Computing","ICT")), ("ict", ("Computing","ICT")),
    ("information technology", ("Computing","IFT")), ("computer sci", ("Computing","COS")),
    ("computing", ("Computing","COS")), ("artificial intelligence", ("Computing","COS")),
    ("library and information", ("Social Sciences","LIS")),
    ("economics", ("Social Sciences","ECO")), ("agribusiness and econ", ("Social Sciences","ECO")),
    ("international relation", ("Social Sciences","IRS")), ("international studies", ("Social Sciences","IRS")),
    ("international and diplom", ("Social Sciences","IRS")), ("strategic studies", ("Social Sciences","IRS")),
    ("social standard", ("Social Sciences","SST")), ("demography", ("Social Sciences","DSS")),
    ("criminolog", ("Social Sciences","CSS")), ("political", ("Social Sciences","POL")),
    ("psycholog", ("Social Sciences","PSY")), ("sociolog", ("Social Sciences","SOC")),
    ("social work", ("Social Sciences","SWK")), ("peace", ("Social Sciences","PCR")),
    ("public administration", ("Administration and Management","PAD")),
    ("public relations", ("Administration and Management","BUA")),
    ("banking", ("Administration and Management","FIN")), ("finance", ("Administration and Management","FIN")),
    ("insurance", ("Administration and Management","INS")), ("actuarial", ("Administration and Management","ACS")),
    ("accounting", ("Administration and Management","ACC")), ("accountancy", ("Administration and Management","ACC")),
    ("marketing", ("Administration and Management","MKT")), ("taxation", ("Administration and Management","TAX")),
    ("procurement", ("Administration and Management","PRM")), ("entrepreneur", ("Administration and Management","ENP")),
    ("human resource", ("Administration and Management","EHR")), ("personnel", ("Administration and Management","EHR")),
    ("industrial relation", ("Administration and Management","EHR")), ("business admin", ("Administration and Management","BUA")),
    ("business management", ("Administration and Management","BUA")), ("management studies", ("Administration and Management","BUA")),
    ("transport", ("Administration and Management","TPM")), ("tourism", ("Administration and Management","HTM")),
    ("hotel", ("Administration and Management","HTM")), ("cooperative", ("Administration and Management","CRD")),
    ("co-operative", ("Administration and Management","CRD")), ("local government", ("Administration and Management","LGD")),
    ("aviation", ("Administration and Management","AVM")), ("logistics", ("Administration and Management","LSM")),
    ("office", ("Administration and Management","OIM")), ("secretarial", ("Administration and Management","OIM")),
    ("petroleum chem", ("Sciences","PCM")), ("industrial chem", ("Sciences","ICH")),
    ("applied geophys", ("Sciences","GPH")), ("geophys", ("Sciences","GPH")),
    ("industrial math", ("Sciences","IMT")), ("industrial physics", ("Sciences","IPH")),
    ("physics with electronics", ("Sciences","PHE")), ("medical physics", ("Sciences","MPH")),
    ("medicinal chem", ("Sciences","MCM")), ("marine", ("Sciences","MSE")),
    ("brewing", ("Sciences","BST")), ("forensic", ("Sciences","FRS")),
    ("environmental management and tox", ("Sciences","EMT")), ("science laboratory", ("Sciences","SLT")),
    ("biotechnology", ("Sciences","BTG")), ("biochem", ("Sciences","BCH")),
    ("microbiolog", ("Sciences","MCB")), ("statistic", ("Sciences","STA")),
    ("mathematic", ("Sciences","MTH")), ("chemistr", ("Sciences","CHM")),
    ("physics", ("Sciences","PHY")), ("geolog", ("Sciences","GEY")),
    ("botan", ("Sciences","BOT")), ("zoolog", ("Sciences","ZOO")),
    ("plant", ("Sciences","BOT")), ("animal", ("Sciences","ZOO")),
    ("meteorolog", ("Sciences","MET")), ("biology", ("Sciences","BIO")),
]

def by_code(disc, code):
    for n,c,_ in canon[disc]:
        if c==code: return (disc, c, n)
    return None

def by_name(disc, name_sub):
    """Resolve a programme within a discipline by canonical-name substring.
    Needed where codes are non-unique (Engineering GET, Arts YOU/ALL)."""
    nl=name_sub.lower()
    for n,c,_ in canon[disc]:
        if nl in n.lower(): return (disc, c, n)
    return None

def classify(jname, disciplines):
    jl = jname.lower(); jt = set(toks(jname))
    # 1) curated override (substring)
    for sub,(disc,code) in OVERRIDE:
        if disc in disciplines and sub in jl:
            r=by_code(disc,code)
            if r: return r+("override",)
    # 2) token-containment: canonical tokens subset of jamb tokens
    best=None
    for disc in disciplines:
        for n,c,ct in canon[disc]:
            if ct and ct <= jt:
                score=len(ct)
                if not best or score>best[0]: best=(score,disc,c,n)
    if best: return (best[1],best[2],best[3],"contain")
    return None  # no exact/contained match -> caller marks C_reclassified (out of scope)

ALL=list(canon.keys())
new=[]
for f,fac in [("jamb/administration_offerings.json","Administration"),
              ("jamb/sciences_offerings.json","Sciences")]:
    d=json.load(open(f,encoding="utf-8"))
    for p in d["programmes"]:
        r=classify(p["jamb_name"],ALL)
        if not r:
            # belongs to a discipline not yet mapped (Comm/Media, Arts, Agric, Health, Environmental)
            new.append({"jamb_name":p["jamb_name"],"jamb_faculty":fac,"mapping_type":"C_reclassified",
                        "ccmas_code":None,"ccmas_discipline":None,
                        "mapping_note":"out of scope - belongs to a CCMAS discipline not yet mapped","enrichment":None,"_m":"none"})
            continue
        disc,code,cname,method=r
        jl=p["jamb_name"].strip().lower()
        mtype="A_exact" if jl==cname.lower() else "B_granular"
        new.append({"jamb_name":p["jamb_name"],"jamb_faculty":fac,"mapping_type":mtype,
                    "ccmas_code":code,"ccmas_discipline":disc,
                    "mapping_note":f"{method}->{cname}","enrichment":None,"_m":method})

pm=json.load(open("programme_mapping.json",encoding="utf-8"))
pm["mappings"]=[x for x in pm["mappings"] if "_m" not in x]   # revert prior runs for a clean re-run
existing={x["jamb_name"].upper() for x in pm["mappings"]}
added=0
for x in new:
    if x["jamb_name"].upper() in existing: continue
    pm["mappings"].append(x); existing.add(x["jamb_name"].upper()); added+=1
json.dump(pm,open("programme_mapping.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

from collections import Counter
print(f"added {added} new mappings; methods:",dict(Counter(x['_m'] for x in new)),
      "types:",dict(Counter(x['mapping_type'] for x in new)))
print("\nUNMATCHED (D_custom, need review):")
for x in new:
    if x["mapping_type"]=="D_custom": print("  -",x["jamb_name"])
print("\nsample B_granular mappings (spot-check accuracy):")
for x in new[:20]:
    if x["mapping_type"]=="B_granular": print(f"  {x['jamb_name'][:38]:38} -> {x['ccmas_discipline'][:12]:12} {x['mapping_note']}")
