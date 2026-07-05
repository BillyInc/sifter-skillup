#!/usr/bin/env python3
"""Explicit curated JAMB->CCMAS bridge for the 5 NEW brochures
(medical, agriculture, arts_hum, engineering, education).
Codes alone are ambiguous here (Engineering GET repeats across 25 programmes;
Home Economics/Economics/Food Technology span disciplines), so each JAMB name is
mapped EXPLICITLY to (discipline, code, name-substring) and validated against the
canonical registry. Anything that fails to resolve is flagged, not silently dropped.
Appends to programme_mapping.json (re-runnable: reverts prior _m3 rows first)."""
import json, glob, re
from collections import Counter

canon = {}  # discipline -> list[(name, code)]
for f in glob.glob("ccmas/*.json"):
    d = json.load(open(f, encoding="utf-8"))
    canon[d["discipline"]] = [(p["name"], p["code"]) for p in d["programmes"]]

def resolve(disc, code, name_sub):
    """Find the canonical programme in `disc` matching code AND (if given) name substring.
    Returns (disc, code, canonical_name) or None."""
    if disc not in canon: return None
    cands = [(n, c) for n, c in canon[disc] if c == code]
    if name_sub:
        nl = name_sub.lower()
        exact = [(n, c) for n, c in cands if nl == n.lower()]      # prefer exact canonical name
        if exact: return (disc, exact[0][1], exact[0][0])
        narrowed = [(n, c) for n, c in cands if nl in n.lower()]   # else substring
        if narrowed: cands = narrowed
    if cands: return (disc, cands[0][1], cands[0][0])
    return None

AM = "Administration and Management"; AG = "Agricultural Science"; AR = "Arts"
AH = "Allied Health Sciences"; MD = "Medicine and Dentistry"; BM = "Basic Medical Sciences"
PH = "Pharmacy and Pharmaceutical Sciences"; EN = "Engineering"; EV = "Environmental Sciences"
ARC = "Architecture"; ED = "Education"; CM = "Communication and Media Studies"
SC = "Sciences"; SS = "Social Sciences"; CP = "Computing"

# brochure -> { jamb_name: (discipline, code, name_substring_or_None, note) }
MAP = {
 "medical": {
  "Anatomy": (BM,"ANA","Anatomy","basic medical anatomy"),
  "Biochemistry": (SC,"BCH","Biochemistry","science biochemistry"),
  "Medical Biochemistry": (SC,"BCH","Biochemistry","medical biochemistry ~ biochemistry"),
  "Dentistry and Dental Technology": (MD,"ANA","Dental","dental surgery (primary=dentistry)"),
  "Human Nutrition and Dietetics": (AH,"NUT","Nutrition","allied health nutrition/dietetics"),
  "Medical Laboratory Technology/Science": (AH,"MLS","Medical Laboratory","allied health MLS"),
  "Medical Rehabilitation": (AH,"PST","Physiotherapy","rehab blend, primary physiotherapy"),
  "Public Health Technology": (AH,"PHS","Public Health","allied health public health"),
  "Medicine and Surgery (Human Medicine)": (MD,"COM","Medicine and Bachelor","MBBS"),
  "Physiotherapy": (AH,"PST","Physiotherapy","allied health physiotherapy"),
  "Pharmacology": (AH,"PHA","Pharmacology","allied health pharmacology"),
  "Radiography": (AH,"RAD","Radiography","allied health radiography"),
 },
 "agriculture": {
  "Agriculture": (AG,"ANS","Agriculture","B.Agriculture"),
  "Biotechnology": (SC,"BTG","Biotechnology","science biotechnology"),
  "Horticulture": (AG,"HLM","Horticulture","horticulture & landscape"),
  "Fisheries": (AG,"FAA","Fisheries","fisheries & aquaculture"),
  "Agronomy": (AG,"CPS","Crop Science","agronomy ~ crop science"),
  "Animal Production": (AG,"ANS","Animal Science","animal production ~ animal science"),
  "Animal Science": (AG,"ANS","Animal Science","animal science"),
  "Animal Breeding and Genetics": (AG,"ANS","Animal Science","breeding/genetics ~ animal science"),
  "Crop Production": (AG,"CPS","Crop Science","crop production ~ crop science"),
  "Crop Science": (AG,"CPS","Crop Science","crop science"),
  "Soil Science": (AG,"SOS","Soil Science","soil science"),
  "Family, Nutrition and Consumer Sciences": (AG,"FCS","Family and Consumer","family & consumer sciences"),
  "Food Science with Business": (AG,"FST","Food Science","food science & technology"),
  "Forestry and Fisheries": (AG,"FWM","Forest Resources","forestry (primary) + fisheries"),
  "Forestry, Wildlife & Fisheries": (AG,"FWM","Forest Resources","forest resources & wildlife"),
  "Plant Breeding and Seed Technology": (AG,"CPS","Crop Science","plant breeding ~ crop science"),
  "Home Economics": (AG,"FCS","Family and Consumer","home economics ~ family/consumer"),
  "Hotel Management & Tourism": (AM,"HTM","Hospitality","hospitality & tourism management"),
  "Home Science, Nutrition and Dietetics": (AG,"FCS","Family and Consumer","home science ~ family/consumer"),
  "Home Science & Management": (AG,"FCS","Family and Consumer","home science ~ family/consumer"),
 },
 "arts_hum": {
  "Arabic Studies": (AR,"ARA","Arabic","arabic"),
  "Arabic Language and Literature Studies": (AR,"ARA","Arabic","arabic language & lit"),
  "Archaeology": (AR,"ARC","Archaeology","archaeology"),
  "Classical Studies": (AR,"CLG","Classics","classical studies ~ classics"),
  "Christian Religious": (AR,"CRS","Christian Religious","christian religious studies"),
  "Christian Studies": (AR,"CRS","Christian Religious","christian studies ~ CRS"),
  "Creative Arts": (AR,"YOU","Theatre Arts","creative arts blend, primary theatre arts"),
  "Linguistics/Edo": (AR,"LIN","Linguistics","linguistics"),
  "English and Literary Studies": (AR,"LIT","English","english language & literature"),
  "English Studies": (AR,"LIT","English","english studies ~ LIT"),
  "Literature in English": (AR,"LIT","English","literature in english ~ LIT"),
  "French": (AR,"FRE","Modern European","french"),
  "Portuguese/English": (AR,"FRE","Modern European","portuguese ~ modern euro lang"),
  "German": (AR,"GER","Modern European","german"),
  "French and German/Russian": (AR,"FRE","Modern European","french/german ~ modern euro lang"),
  "International Studies and": (SS,"IRS","International Relations","international studies ~ IR"),
  "History": (AR,"HIS","History","history"),
  "History and Strategic Studies": (AR,"HIS","History","history (primary) + strategic"),
  "Economics": (SS,"ECO","Economics","economics"),
  "African and Asian Studies": (AR,"HIS","History","area studies ~ history/humanities"),
  "Linguistics": (AR,"LIN","Linguistics","linguistics"),
  "Kanuri": (AR,"LIN","Linguistics","kanuri (Nigerian language) ~ linguistics"),
  "Russian with French/German": (AR,"RUS","Russian","modern european languages russian"),
  "Mass Communication": (CM,"MCM","MASS COMMUNICATION","mass communication"),
  "Music": (AR,"MUS","Music","music"),
  "Peace Studies": (SS,"PCR","Peace Studies","peace studies & conflict resolution"),
  "Philosophy": (AR,"PHL","Philosophy","philosophy"),
  "Religious Studies": (AR,"REL","Religious Studies","religious studies"),
  "Theology": (AR,"CTH","Christian Theology","theology ~ christian theology"),
  "Yoruba": (AR,"YOU","Yoruba","african languages yoruba"),
  "Fulfulde": (AR,"LIN","Linguistics","fulfulde (Nigerian language) ~ linguistics"),
  "Efik-Ibibio": (AR,"EFK","Efik","efik-ibibio ~ efik"),
  "Communication Arts": (CM,"MCM","MASS COMMUNICATION","communication arts ~ mass comm"),
  "Political Science and Conflict": (SS,"POL","Political Science","political science (primary)"),
  "Sociology": (SS,"SOC","Sociology","sociology"),
  # "Anthropology" intentionally omitted -> already Type-D enriched in programme_mapping
 },
 "engineering": {
  "Building": (EV,"BUD","Building","building"),
  "Civil Engineering": (EN,"GET","CIVIL ENGINEERING","civil engineering"),
  "Computer and Information Science": (CP,"COS","Computer Science","computer & information science ~ CS"),
  "Polymer and Textile Engineering": (EN,"GET","MATERIALS ENGINEERING","polymer/textile ~ materials (weak)"),
  "Water Resources and Environmental Engr": (EN,"GET","WATER RESOURCES ENGINEERING","water resources engineering"),
  "Petroleum and Gas Engineering": (EN,"GET","PETROLEUM AND GAS ENGINEERING","petroleum & gas engineering"),
  "Gas Engineering": (EN,"GET","NATURAL GAS ENGINEERING","gas ~ natural gas engineering"),
  "Computer Science": (CP,"COS","Computer Science","computer science"),
  "Systems Engineering": (EN,"GET","SYSTEMS ENGINEERING","systems engineering"),
  "Food Engineering": (EN,"GET","FOOD ENGINEERING","food engineering"),
  "Food Science and Engineering": (EN,"FST","FOOD SCIENCE AND TECHNOLOGY","food science & engineering ~ FST"),
  "Food Technology": (EN,"FST","FOOD SCIENCE AND TECHNOLOGY","food technology ~ FST"),
  "Architecture": (ARC,"ARC","Architecture","architecture"),
  "Quantity Surveying": (EV,"QTS","Quantity Surveying","quantity surveying"),
  "Statistics": (SC,"STA","Statistics","statistics"),
  "Economics": (SS,"ECO","Economics","economics"),
  "Geography": (EV,"GEO","Geography","geography"),
  "Urban and Regional Planning": (EV,"URP","Urban and Regional","urban & regional planning"),
  "Industrial Design": (EV,"IDD","Industrial Design","industrial design"),
  "Estate Management": (EV,"ESM","Estate","estate management"),
  "Software Engineering": (CP,"SEN","Software","software engineering"),
  "Meteorology": (SC,"MET","Meteorology","meteorology"),
  "Hotel Management and Tourism": (AM,"HTM","Hospitality","hospitality & tourism management"),
  "Home Economics and Food Management": (AG,"FCS","Family and Consumer","home economics ~ family/consumer"),
 },
 # RESCUE: JAMB names the OLD 5-discipline bridge marked C_reclassified/out-of-scope
 # that now have a real CCMAS home (12 disciplines added since). Curated + validated.
 "_rescue": {
  "Building Technology": (EV,"BUD","Building","building technology ~ building"),
  "Chemical Sciences": (SC,"CHM","Chemistry","chemical sciences ~ chemistry"),
  "Electronics": (SC,"PHE","Physics with Electronics","electronics ~ physics w/ electronics"),
  "Environmental Health Science": (AH,"EHS","Environmental Health","allied health env health"),
  "Environmental Management": (EV,"EVM","Environmental Management","environmental management"),
  "Environmental Science and Technology": (AH,"EHS","Environmental Health","env sci & tech ~ env health"),
  "Environmental Standards": (EV,"ENS","ENVIRONMENTAL STANDARDS","environmental standards"),
  "FISHERIES AND AQUACULTURE": (AG,"FAA","Fisheries","fisheries & aquaculture"),
  "Food Science & Nutrition": (AG,"FST","Food Science","food science ~ FST"),
  "Food Science and Technology": (AG,"FST","Food Science","food science & technology"),
  "Geography and Environmental Management": (EV,"GEO","Geography","geography (primary)"),
  "Geography and Geosciences": (EV,"GEO","Geography","geography (primary)"),
  "HOME SCIENCE": (AG,"FCS","Family and Consumer","home science ~ family/consumer"),
  "INFORMATION AND MEDIA SCIENCE": (CM,"ISM","INFORMATION AND MEDIA","information & media studies"),
  "INFORMATION SCIENCE AND MEDIA STUDIES": (CM,"ISM","INFORMATION AND MEDIA","information & media studies"),
  "Information and Media Studies": (CM,"ISM","INFORMATION AND MEDIA","information & media studies"),
  "Islamic Studies": (AR,"ISS","Islamic Studies","islamic studies"),
  "Optometry": (AH,"OPT","Optometry","allied health optometry"),
  "Public Relations and Advertising": (CM,"PRS","PUBLIC RELATIONS","PR & advertising ~ public relations"),
  "Strategic Communication": (CM,"STC","STRATEGIC COMMUNICATION","strategic communication"),
  "Supply Chain Management": (AM,"LSM","Logistics","supply chain ~ logistics & supply chain"),
  "Surveying and Geoinformatics": (EV,"SVG","Surveying and Geoinformatics","surveying & geoinformatics"),
  "Textile Science and Technology": (EV,"CLT","Clothing and Textile","textile ~ clothing & textile"),
  "Film and Video Studies": (CM,"FMM","FILM","film & video ~ film & multimedia"),
 },
 # NEAREST-MATCH rescue for the 25 with NO dedicated CCMAS standard.
 # Evidence: searched the CCMAS ORIGINAL PDFs — each term appears only as a COURSE inside
 # a programme (e.g. BCH 407 Bioinformatics, IMT 306 Operations Research, FRS 202 Forensic
 # Entomology, BIO 202 Ecology), never as a standalone standard. So we link each to its
 # nearest host programme (skills inherited from there). mapping_type stays C_reclassified
 # but now CARRIES a programme link + note; seed links skills. Marked "nearest" in note.
 "_nearest": {
  "OCEANOGRAPHY": (SC,"MSE","Marine Science","oceanography ~ marine science (host)"),
  "Earth Science": (SC,"GEY","Geology","earth science ~ geology (host)"),
  "Geoscience": (SC,"GEY","Geology","geoscience ~ geology (host)"),
  "Ecology": (SC,"BIO","Biology","ecology = BIO 202 course, host Biology"),
  "Applied Ecology": (SC,"BIO","Biology","applied ecology ~ Biology (host)"),
  "Ecology and Environmental Studies": (SC,"BIO","Biology","ecology ~ Biology (host)"),
  "Parasitology and Entomology": (SC,"ZOO","Zoology","parasitology/entomology ~ Zoology (host)"),
  "BIOINFORMATICS": (SC,"BTG","Biotechnology","bioinformatics = BTG/BCH course, host Biotechnology"),
  "OPERATIONS RESEARCH": (SC,"IMT","Industrial Mathematics","OR = IMT 306 course, host Industrial Maths"),
  "BIOLOGICAL SCIENCE(S)": (SC,"BIO","Biology","biological sciences ~ Biology (host)"),
  "Applied and Renewable Energy": (SC,"PHY","Physics","renewable energy ~ Physics (host)"),
  "Energy Studies": (SC,"PHY","Physics","energy studies ~ Physics (host)"),
  "Energy and Petroleum Studies": (SC,"PCM","Petroleum Chemistry","energy/petroleum ~ Petroleum Chemistry (host)"),
  "Electrons": (SC,"PHE","Physics with Electronics","OCR of Electronics ~ Physics w/ Electronics"),
  "ELECTRONICS AND COMMUNICATIONS": (EN,"GET","ELECTRONIC ENGINEERING","electronics & comms ~ Electronic Engineering (host)"),
  "COMMUNICATIONS TECHNOLOGY": (EN,"GET","TELECOMMUNICATIONS ENGINEERING","comms tech ~ Telecommunications Engineering (host)"),
  "COMMUNICATION AND WIRELESS TECHNOLOGY": (EN,"GET","TELECOMMUNICATIONS ENGINEERING","wireless ~ Telecommunications Engineering (host)"),
  "TELECOMMUNICATION AND WIRELESS TECHNOLOGY": (EN,"GET","TELECOMMUNICATIONS ENGINEERING","telecoms ~ Telecommunications Engineering (host)"),
  "TELECOMMUNICATION SCIENCE": (EN,"GET","TELECOMMUNICATIONS ENGINEERING","telecoms sci ~ Telecommunications Engineering (host)"),
  "TELECOMMUNICATION MANAGEMENT": (EN,"GET","TELECOMMUNICATIONS ENGINEERING","telecoms mgmt ~ Telecommunications Engineering (host)"),
  "COMMUNICATION AND DIGITAL MEDIA STUDIES": (CM,"ISM","INFORMATION AND MEDIA","digital media ~ Information & Media Studies (host)"),
  "INFORMATION SCIENCE": (CP,"INS","Information Systems","information science ~ Information Systems (host)"),
  "NATURAL AND ENVIRONMENTAL SCIENCE": (EV,"EVM","Environmental Management","natural/env science ~ Environmental Management (host)"),
  "ANTHROPOLOGY": (SS,"SOC","Sociology","anthropology ~ Sociology (host; also Type-D custom exists)"),
  "ARCHEAOLOGY": (AR,"ARC","Archaeology","OCR typo of Archaeology"),
 },
 "education": {
  "Vocational Education": (ED,"ITE","Technology Education","vocational ~ technology education (weak)"),
  "Technology Education": (ED,"ITE","Technology Education","technology education"),
  "Home Economics and Hotel Management": (ED,"EHO","Home Economics","home economics education"),
  "Teacher Education": (ED,"PED","Primary Education","generic teacher ed ~ primary (weak)"),
  "Library Science": (ED,"LIS","Library","library & information science education"),
  "Library and Information Science": (ED,"LIS","Library","library & information science education"),
  "Education and Business Administration": (ED,"BED","Business Education","business education"),
  "Business Education": (ED,"BED","Business Education","business education"),
  "Sport Science": (ED,"EDU","Human Kinetics","sport science ~ human kinetics/PE"),
 },
}

FAC = {"medical":"Medical/Pharmaceutical/Health","agriculture":"Agriculture",
       "arts_hum":"Arts and Humanities","engineering":"Engineering/Environmental/Technology",
       "education":"Education"}

new=[]; unresolved=[]
for broch, m in MAP.items():
    for jname,(disc,code,nsub,note) in m.items():
        r=resolve(disc,code,nsub)
        if not r:
            unresolved.append((broch,jname,disc,code,nsub)); continue
        rdisc,rcode,cname=r
        if broch=="_nearest":
            # no dedicated standard — honest type stays C_reclassified, but now LINKED to a host
            mtype="C_reclassified"
        else:
            mtype="A_exact" if jname.strip().lower()==cname.strip().lower() else "B_granular"
        # _rescue/_nearest entries keep whatever faculty the existing (old-bridge) row already carries
        fac = FAC[broch] if broch in FAC else None
        new.append({"jamb_name":jname,"jamb_faculty":fac,"mapping_type":mtype,
                    "ccmas_code":rcode,"ccmas_discipline":rdisc,"ccmas_name":cname,
                    "mapping_note":f"{note} -> {cname}","enrichment":None,"_m3":broch})

pm=json.load(open("programme_mapping.json",encoding="utf-8"))
pm["mappings"]=[x for x in pm["mappings"] if "_m3" not in x]  # clean re-run
by_name_existing={}
for x in pm["mappings"]: by_name_existing.setdefault(x["jamb_name"].upper(),x)  # first row per name

def inferior(row):
    # a stale row worth upgrading = UNLINKED (no resolved discipline/code yet).
    # An already-linked row (even C_reclassified nearest-match) is NOT inferior.
    return not (row.get("ccmas_discipline") and row.get("ccmas_code"))

added=0; upgraded=[]; kept=[]
for x in new:
    key=x["jamb_name"].upper()
    ex=by_name_existing.get(key)
    if ex is None:
        pm["mappings"].append(x); by_name_existing[key]=x; added+=1
    elif inferior(ex):
        upd={"mapping_type":x["mapping_type"],"ccmas_code":x["ccmas_code"],
             "ccmas_discipline":x["ccmas_discipline"],"ccmas_name":x["ccmas_name"],
             "mapping_note":x["mapping_note"]+" [upgraded from stale/out-of-scope]","_m3":x["_m3"]}
        if x.get("jamb_faculty"): upd["jamb_faculty"]=x["jamb_faculty"]  # keep existing if rescue has none
        ex.update(upd)
        upgraded.append(x["jamb_name"])
    else:
        kept.append(x["jamb_name"])  # existing already-good mapping wins
json.dump(pm,open("programme_mapping.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)

print(f"resolved {len(new)} / {sum(len(m) for m in MAP.values())} curated; added {added}, upgraded {len(upgraded)} {upgraded}, kept-existing {len(kept)} {kept}")
print("types:",dict(Counter(x['mapping_type'] for x in new)))
print("by discipline:",dict(Counter(x['ccmas_discipline'] for x in new)))
if unresolved:
    print("\n!!! UNRESOLVED (target code/name not found in registry) — FIX THESE:")
    for u in unresolved: print("  ",u)
else:
    print("\nAll curated targets resolved against the canonical registry. [OK]")
print("\n--- FULL MAPPING for adversarial review ---")
for x in sorted(new,key=lambda k:(k['_m3'],k['jamb_name'])):
    print(f"  [{x['_m3'][:4]}] {x['jamb_name'][:40]:42} -> {x['ccmas_discipline'][:22]:24} {x['ccmas_code']:5} | {x['mapping_note']}")
