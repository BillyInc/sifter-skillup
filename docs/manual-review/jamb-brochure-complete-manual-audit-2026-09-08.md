# Complete JAMB brochure manual audit

Status date: 2026-09-08
Scope: JAMB brochure requirements, subject rules, university offerings, and university-specific exceptions.

This is the single manual-audit handoff. Every row still marked for source review or without a resolved source candidate is listed below. It does not ask for CCMAS, domain, subgroup, role, or labour-market work.

## Read this first

A programme name being found in the brochure is not the same as its admission rules being fully parsed. A row can have a valid programme identity and university offering while its UTME, O-level, Direct Entry, or university exception text is still incomplete or ambiguous.

Only 'verified', 'inherited_shared', and 'variant_verified' source decisions may become executable subject-matching rules. 'source_blank', 'source_missing', 'source_conflict', 'extraction_gap', and 'needs_review' remain visible review states and must not create a positive eligibility match.

Original source folder to inspect: C:\Users\USER\Downloads\jamb brochure.

## Current inventory and live presentation state

| Area | Current state | Meaning |
|---|---:|---|
| JAMB programme identities | 420 | National programme identities are present. |
| University-programme offerings | 9,130 | Institution/programme pairs are present. |
| National requirement rows | 1,260 | 420 programmes × UTME, O-level, and Direct Entry. |
| National parsed | 247 live parse_status=parsed rows; the source classification snapshot marks 635 parsed layers | The live database and repository audit snapshot were generated at different stages; use the row-level lists below for manual work. |
| National needs review | 172 live rows; 149 in the source classification snapshot | These must not be treated as fully structured until the source wording is confirmed. |
| National unparsed | 1 live row | The row has no parsed rule status. |
| University exception records | 3,877 live; 3,884 in the source classification snapshot | University-specific evidence is preserved separately from national rules. |
| University exception needs review | 588 live; 657 in the source classification snapshot | These are the exact exception rows listed below. |
| Structured university subject options | 2,030 | These are the current machine-readable local UTME/O-level option rules. |
| Structured subject-option items | 12,210 | These are the subject members inside those options. |
| Legacy offering UTME/O-level/DE columns | 0 non-null values in all 9,130 live offering rows | This is why the UI must use exception and structured-rule fallbacks; the source content is not absent from the database. |

The current frontend fix makes university-specific requirements visible from the structured and exception records after a university is selected. It no longer hides them when saving a guidance checkpoint fails.

## What is deliberately not a missing subject rule

- 365 national Direct Entry rows are qualification routes, not UTME/O-level subject-picker rules.
- 1275 university records are preserved notes, Direct Entry clauses, or general conditions rather than executable subject rules.
- 622 exception records are conditions that need to remain attached to the university/programme context; they are not automatically national requirements.

These rows should still be available in programme/university detail where relevant, but they must not be silently converted into a subject match.

## Part 1 — National requirement layers requiring manual source review

Total rows listed: **260** (149 needs_review, 111 empty). Review each layer separately: UTME, O-level, and Direct Entry.

For every row, capture the exact requirement cell, continuation/shared heading, PDF page, table row, institution association, and one decision: exact_rule, shared_rule, partial_condition, cross_reference, source_blank, or needs_manual_interpretation.

### N001. ANTHROPOLOGY — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5)/six (6) SSCE credit passes at one (1) or two (2) sittings to include Mathematics, English Language and any other Science subjects.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.118, table row 4; course cell: ANTHROPOLOGY IBADAN; Sciences.pdf, PDF p.228, table row 6; course cell: ANTHROPOLOGY (BIOLOGICAL) IBADAN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N002. ARCHEAOLOGY — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) or six (6) SSC credit passes at one (1) or two (2) sittings including English Language, Mathematics and other relevant subjects. Mathematics and two (2) other relevant subjects.
- Candidate brochure locations: Sciences.pdf, PDF p.216, table row 4; course cell: ARCHEAOLOGY IBADAN: withoptionsin:Geography, Zoology,Botany,Geology, History, Classics, ReligiousStudies
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N003. Agricultural Engineering — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any from Introduction to Agricultural Science, Materials and Workshop Process and Machining, and related technical subjects.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.3, table row 3; course cell: AGRICULTURAL ENGINEERING: AAU ABU ABUJA ABUAD AKSU AUE BAUCHI BAYERO BENIN CALABAR CUST DELSUT ESUTECH FED-OYEEKITI FEDPOBAU-DEG FED-WUKARI FUNAAB FUTA FUTOwithoptionsin: (i) SoilandWater EngineeringTechnology. (ii) FarmPowerand
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N004. Agricultural and Bio-Resources Engineering — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or one of Agricultural Science, Further Mathematics and Technical Drawing at credit level.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.4, table row 3; course cell: MachineryEngineering Technology. (iii) Cropprocessingand StorageTechnology LANDMARK IMSU KUST KWASU LASUSTECH LAUTECH MAIDUGURI MAKURDI OAU OOU RSU TECH-IBADAN UNIOSUN UYO AGRICULTURALAND BIORESOURCES ENGINEERING MINNA TSUJ UMUDIKE UNIZIK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N005. Applied Geology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.41, table row 3; course cell: UNIZIK UNN UNINIGER UMYUK UYO VENITE VERITAS WESLEYUNI YSU ALTERNATIVEMEDICINE MERCY-MED-UNI COMPLEMENTARYAND ALTERNATIVEMEDICINE OSUMS MEDICINALCHEMISTRY FED-DUTSINMA APPLIEDGEOLOGY OAUSTECH; Sciences.pdf, PDF p.84, table row 3; course cell: GEOLOGYAND PETROLEUMSTUDIES WESTERN-DEL APPLIEDGEOLOGY BAUCHI FUTA GEOLOGYANDMINERAL SCIENCE KWASU MARINEGEOLOGY MARITIME-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N006. Applied Geology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.41, table row 3; course cell: UNIZIK UNN UNINIGER UMYUK UYO VENITE VERITAS WESLEYUNI YSU ALTERNATIVEMEDICINE MERCY-MED-UNI COMPLEMENTARYAND ALTERNATIVEMEDICINE OSUMS MEDICINALCHEMISTRY FED-DUTSINMA APPLIEDGEOLOGY OAUSTECH; Sciences.pdf, PDF p.84, table row 3; course cell: GEOLOGYAND PETROLEUMSTUDIES WESTERN-DEL APPLIEDGEOLOGY BAUCHI FUTA GEOLOGYANDMINERAL SCIENCE KWASU MARINEGEOLOGY MARITIME-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N007. Applied Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.44, table row 3; course cell: DANUMS EBSU ESUTECH GOUU HALLMARK IMSU MAKURDI MC-IBRU MKAR RENAISSANCE PUREANDAPPLIED PHYSICS ADSU APPLIEDPHYSICS AAU FED-WUKARI PUREPHYSICS PAUL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N008. Arabic Language and Literature Studies — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Same as in Arabic Studies (Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects).
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N009. Aviation Security — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: Administration.pdf, PDF p.30, table row 3; course cell: TOURISMSTUDIES EKSU NOUN AVIATIONMANAGEMENT AZMAN AVIATIONSECURITY AZMAN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N010. Banking and Finance — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.10, table row 4; course cell: BANKINGANDFINANCE AAUA ABSU ACHIEVERS ASPOL-DEG ALETHEIA BAUCHI CARITAS CCU CRUTECH DELSU DELSUT; Agriculture.pdf, PDF p.78, table row 4; course cell: AGRIC.BUSINESS MAKURDI UMUDIKE (withoptionin i)Accountancy ii)Marketing iii)BankingandFinance iv)Agribusinessand Management AGRIBUSINESS MANAGEMENT AEFUNA DELSU UMUDIKE; Social Management Science.pdf, PDF p.27, table row 2; course cell: BANKINGANDFINANCE ABUAD ABUJA ADSU AFIT-DEG AJAYI AKSU AL-HIKMAH ARTHUR-JARVIS ATIBA AUGUSTINE BABCOCK BAYERO BAZE BELLS BENIN BIU BOWEN CALABAR CALEB CHRISLAND CHRISTOPHER CLIFFORD COOU COVENANT CRAWFORD; Social Management Science.pdf, PDF p.120, table row 2; course cell: ECONOMICS BCU MAIDUGURI-ELUON NOUN-ELUON UDU-ELUON UYO-ELUON ACCOUNTING MAIDUGURI-ELUON NOUN-ELUON UDU-ELUON UYO-ELUON BANKINGANDFINANCE MAIDUGURI-ELUON NOUN-ELUON UDU-ELUON UYO-ELUON BUSINESSADMINISTRATION MAIDUGURI-ELUON MK-UNI NOUN-ELUON UDU-ELUON UYO-ELUON MARKETING MAIDUGURI-ELUON NOUN-ELUON
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N011. Biology/Biotechnology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N012. Biology/Biotechnology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N013. Biotechnology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.37, table row 4; course cell: ANIMALNUTRITION: FUNAAB ANIMALNUTRITION AND BIOTECHNOLOGY LAUTECH ANIMALSCIENCEAND RANGEMANAGEMENT MAUTY; Agriculture.pdf, PDF p.46, table row 5; course cell: PLANTSCIENCEAND BIOTECHNOLOGY ABSU RSU; Agriculture.pdf, PDF p.47, table row 3; course cell: PLANTSCIENCE AND CROP PRODUCTION JABU CROP SCIENCE AND BIOTECHNOLOGY IMSU CROPSCIENCEAND PRODUCTION JABU; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.19, table row 3; course cell: i.Botany ii.Microbiology iii.Geneticsand Biotechnology iv.Zoology BSU withoptionsin:Biology COOU CRUTECH withoptionsin: i).Biology ii.Microbiology EKSU FUNAAB withoptionsin: Botany& Zoology FUTO GSU GOUU (withoptionsin i.Biotechnology ii.Microbiology HUSTECH; Sciences.pdf, PDF p.108, table row 3; course cell: BOTANYAND ECOLOGICALSTUDIES UYO PLANTSCIENCEAND BIOTECHNOLOGY AAUA ACHIEVERS APU BENIN BOSU BOUEDST BSU CALEB CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-GUSAU FED-LAFIA; Sciences.pdf, PDF p.109, table row 3; course cell: FED-OYEEKITI JOS PAAU MAUTY MK-UNI NASARAWA PHC PLASU withoptionsin: (i)PlantScience (ii)PlantBiotechnology (iii)EnvironmentalPlant Science. UMUDIKE UMYUK UNIHEZ PLANTBIOLOGYAND BIOTECHNOLOGY BENIN OSUMS; Sciences.pdf, PDF p.110, table row 3; course cell: PLANTSCIENCEAND FORESTRY EKSU PLANTSCIENCEAND MICROBIOLOGY WESTERN-DEL PLANTBIOLOGY BAYERO ILORIN KWASU UNIOSUN PLANTSCIENCE ABUAD FED-KASHERE MAUTY OOU BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI; Sciences.pdf, PDF p.165, table row 3; course cell: VERITAS VISION-UNI WELLSPRING WESLEYUNI WESTERN-DEL YSU MICROBIOLOGYAND BIOTECHNOLOGY ABUAD MICROBIOLOGY/ PARASITOLOGY DANUMS BIOLOGY/BIOTECHNOLO GY DANUMS MOLECULARBIOLOGY AEFUNA FED-WUKARI MICROBIOLOGYAND INDUSTRIAL BIOTECHNOLOGY; Sciences.pdf, PDF p.226, table row 3; course cell: APPLIEDBIOLOGY BAYERO EBSU ESUTECH MC-IBRU RHEMA RSU APPLIEDBIOLOGYAND GENETICS REDEEMERS APPLIEDBIOLOGYAND BIOTECHNOLOGY CLIFFORD WESLEYUNI CELLBIOLOGY& GENETICS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N014. Biotechnology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.37, table row 4; course cell: ANIMALNUTRITION: FUNAAB ANIMALNUTRITION AND BIOTECHNOLOGY LAUTECH ANIMALSCIENCEAND RANGEMANAGEMENT MAUTY; Agriculture.pdf, PDF p.46, table row 5; course cell: PLANTSCIENCEAND BIOTECHNOLOGY ABSU RSU; Agriculture.pdf, PDF p.47, table row 3; course cell: PLANTSCIENCE AND CROP PRODUCTION JABU CROP SCIENCE AND BIOTECHNOLOGY IMSU CROPSCIENCEAND PRODUCTION JABU; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.19, table row 3; course cell: i.Botany ii.Microbiology iii.Geneticsand Biotechnology iv.Zoology BSU withoptionsin:Biology COOU CRUTECH withoptionsin: i).Biology ii.Microbiology EKSU FUNAAB withoptionsin: Botany& Zoology FUTO GSU GOUU (withoptionsin i.Biotechnology ii.Microbiology HUSTECH; Sciences.pdf, PDF p.108, table row 3; course cell: BOTANYAND ECOLOGICALSTUDIES UYO PLANTSCIENCEAND BIOTECHNOLOGY AAUA ACHIEVERS APU BENIN BOSU BOUEDST BSU CALEB CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-GUSAU FED-LAFIA; Sciences.pdf, PDF p.109, table row 3; course cell: FED-OYEEKITI JOS PAAU MAUTY MK-UNI NASARAWA PHC PLASU withoptionsin: (i)PlantScience (ii)PlantBiotechnology (iii)EnvironmentalPlant Science. UMUDIKE UMYUK UNIHEZ PLANTBIOLOGYAND BIOTECHNOLOGY BENIN OSUMS; Sciences.pdf, PDF p.110, table row 3; course cell: PLANTSCIENCEAND FORESTRY EKSU PLANTSCIENCEAND MICROBIOLOGY WESTERN-DEL PLANTBIOLOGY BAYERO ILORIN KWASU UNIOSUN PLANTSCIENCE ABUAD FED-KASHERE MAUTY OOU BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI; Sciences.pdf, PDF p.165, table row 3; course cell: VERITAS VISION-UNI WELLSPRING WESLEYUNI WESTERN-DEL YSU MICROBIOLOGYAND BIOTECHNOLOGY ABUAD MICROBIOLOGY/ PARASITOLOGY DANUMS BIOLOGY/BIOTECHNOLO GY DANUMS MOLECULARBIOLOGY AEFUNA FED-WUKARI MICROBIOLOGYAND INDUSTRIAL BIOTECHNOLOGY; Sciences.pdf, PDF p.226, table row 3; course cell: APPLIEDBIOLOGY BAYERO EBSU ESUTECH MC-IBRU RHEMA RSU APPLIEDBIOLOGYAND GENETICS REDEEMERS APPLIEDBIOLOGYAND BIOTECHNOLOGY CLIFFORD WESLEYUNI CELLBIOLOGY& GENETICS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N015. Biotechnology — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: AGRICULTURE/VET.MEDICINE B.Agric.Tech.) DVM] 35 Fisheries 36 Fisheries 37 Food 38 Food 39 Food 40 Forestry 41 Forestry/Forest 42 Forestry 43 Forestry 44 Forestry, 45 Forestry 46 Home 47 Home 48 Home 49 Horticulture 50 Hotel 51 Livestock 52 Nutrition 53 Pasture & 54 Plant 55 Plant Science 56 Plant Science 57 Plant Science 58 Plant 59 Plant 60 Public & 61 Soil Science 62 Soil Science 63 Soil Science.
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.37, table row 4; course cell: ANIMALNUTRITION: FUNAAB ANIMALNUTRITION AND BIOTECHNOLOGY LAUTECH ANIMALSCIENCEAND RANGEMANAGEMENT MAUTY; Agriculture.pdf, PDF p.46, table row 5; course cell: PLANTSCIENCEAND BIOTECHNOLOGY ABSU RSU; Agriculture.pdf, PDF p.47, table row 3; course cell: PLANTSCIENCE AND CROP PRODUCTION JABU CROP SCIENCE AND BIOTECHNOLOGY IMSU CROPSCIENCEAND PRODUCTION JABU; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.19, table row 3; course cell: i.Botany ii.Microbiology iii.Geneticsand Biotechnology iv.Zoology BSU withoptionsin:Biology COOU CRUTECH withoptionsin: i).Biology ii.Microbiology EKSU FUNAAB withoptionsin: Botany& Zoology FUTO GSU GOUU (withoptionsin i.Biotechnology ii.Microbiology HUSTECH; Sciences.pdf, PDF p.108, table row 3; course cell: BOTANYAND ECOLOGICALSTUDIES UYO PLANTSCIENCEAND BIOTECHNOLOGY AAUA ACHIEVERS APU BENIN BOSU BOUEDST BSU CALEB CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-GUSAU FED-LAFIA; Sciences.pdf, PDF p.109, table row 3; course cell: FED-OYEEKITI JOS PAAU MAUTY MK-UNI NASARAWA PHC PLASU withoptionsin: (i)PlantScience (ii)PlantBiotechnology (iii)EnvironmentalPlant Science. UMUDIKE UMYUK UNIHEZ PLANTBIOLOGYAND BIOTECHNOLOGY BENIN OSUMS; Sciences.pdf, PDF p.110, table row 3; course cell: PLANTSCIENCEAND FORESTRY EKSU PLANTSCIENCEAND MICROBIOLOGY WESTERN-DEL PLANTBIOLOGY BAYERO ILORIN KWASU UNIOSUN PLANTSCIENCE ABUAD FED-KASHERE MAUTY OOU BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI; Sciences.pdf, PDF p.165, table row 3; course cell: VERITAS VISION-UNI WELLSPRING WESLEYUNI WESTERN-DEL YSU MICROBIOLOGYAND BIOTECHNOLOGY ABUAD MICROBIOLOGY/ PARASITOLOGY DANUMS BIOLOGY/BIOTECHNOLO GY DANUMS MOLECULARBIOLOGY AEFUNA FED-WUKARI MICROBIOLOGYAND INDUSTRIAL BIOTECHNOLOGY; Sciences.pdf, PDF p.226, table row 3; course cell: APPLIEDBIOLOGY BAYERO EBSU ESUTECH MC-IBRU RHEMA RSU APPLIEDBIOLOGYAND GENETICS REDEEMERS APPLIEDBIOLOGYAND BIOTECHNOLOGY CLIFFORD WESLEYUNI CELLBIOLOGY& GENETICS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N016. Building — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.13, table row 1; course cell: Education iv)AgriculturalScience Education v)SecretarialStudies Education. vi)TechnicalEducation BSU ESUTECH TASUED Withoptionsin i. AccountancyEducation ii. AgriculturalEducation iii. Commerce/CooperativeEducation iv. Building/WoodWorkTech.Educ v. Electrical/ElectronicTech.Educ vi. MechanicalTech.Education EKSU UNIOSUN UOO EBSU (withoptionsin i)Building/WoodworksTechnology ii)AgricultureEducation iii)Electrical/ElectronicsTechnology iv)Mechanical/MetalworkTechnology VOCATIONALINDUSTRIAL EDUCATION NDU withoptionsin: (i)AgricultureEducation (ii)BusinessEducation; Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.99, table row 1; course cell: JOS KWASCOE (withoptionsin) i. Building ii. Electrical iii. Mechanical FC-PANKSHIN NDU LAGOS TECHNOLOGYANDVOCATIONAL EDUCATION ESUTECH withoptionsin: (i)AccountancyEduc.(ii)Agric.Educ (iii)CommerceandCo-operative Educ. (iv)Building/WoodworkTechnology Educ. (v)Electrical/ElectronicsTechnology Educ. (vi)Mechanical/IndustrialTech.Educ. CALABAR LASU MAUTY withoptionsin: Agric.Tech.Educ.,ConstructionTech Educ.,Mechanical(Automobile) Educ.,MechanicalProduction; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Engineering _ Enviromental _ Technology.pdf, PDF p.13, table row 3; course cell: BUILDING AAU ABUJA ABU BAZE CALEB CUST DOU EBSU ESUTECH FED-LAFIA FED-OYEEKITI FUTA FUTIA FUTO IMSU JABU JEWEL JOS KADPOLY-ABU KSUSTA LAGOS LASU LAUTEC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N017. Building — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.13, table row 1; course cell: Education iv)AgriculturalScience Education v)SecretarialStudies Education. vi)TechnicalEducation BSU ESUTECH TASUED Withoptionsin i. AccountancyEducation ii. AgriculturalEducation iii. Commerce/CooperativeEducation iv. Building/WoodWorkTech.Educ v. Electrical/ElectronicTech.Educ vi. MechanicalTech.Education EKSU UNIOSUN UOO EBSU (withoptionsin i)Building/WoodworksTechnology ii)AgricultureEducation iii)Electrical/ElectronicsTechnology iv)Mechanical/MetalworkTechnology VOCATIONALINDUSTRIAL EDUCATION NDU withoptionsin: (i)AgricultureEducation (ii)BusinessEducation; Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.99, table row 1; course cell: JOS KWASCOE (withoptionsin) i. Building ii. Electrical iii. Mechanical FC-PANKSHIN NDU LAGOS TECHNOLOGYANDVOCATIONAL EDUCATION ESUTECH withoptionsin: (i)AccountancyEduc.(ii)Agric.Educ (iii)CommerceandCo-operative Educ. (iv)Building/WoodworkTechnology Educ. (v)Electrical/ElectronicsTechnology Educ. (vi)Mechanical/IndustrialTech.Educ. CALABAR LASU MAUTY withoptionsin: Agric.Tech.Educ.,ConstructionTech Educ.,Mechanical(Automobile) Educ.,MechanicalProduction; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Engineering _ Enviromental _ Technology.pdf, PDF p.13, table row 3; course cell: BUILDING AAU ABUJA ABU BAZE CALEB CUST DOU EBSU ESUTECH FED-LAFIA FED-OYEEKITI FUTA FUTIA FUTO IMSU JABU JEWEL JOS KADPOLY-ABU KSUSTA LAGOS LASU LAUTEC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N018. Building — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering.
- Candidate brochure locations: Education.pdf, PDF p.13, table row 1; course cell: Education iv)AgriculturalScience Education v)SecretarialStudies Education. vi)TechnicalEducation BSU ESUTECH TASUED Withoptionsin i. AccountancyEducation ii. AgriculturalEducation iii. Commerce/CooperativeEducation iv. Building/WoodWorkTech.Educ v. Electrical/ElectronicTech.Educ vi. MechanicalTech.Education EKSU UNIOSUN UOO EBSU (withoptionsin i)Building/WoodworksTechnology ii)AgricultureEducation iii)Electrical/ElectronicsTechnology iv)Mechanical/MetalworkTechnology VOCATIONALINDUSTRIAL EDUCATION NDU withoptionsin: (i)AgricultureEducation (ii)BusinessEducation; Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.99, table row 1; course cell: JOS KWASCOE (withoptionsin) i. Building ii. Electrical iii. Mechanical FC-PANKSHIN NDU LAGOS TECHNOLOGYANDVOCATIONAL EDUCATION ESUTECH withoptionsin: (i)AccountancyEduc.(ii)Agric.Educ (iii)CommerceandCo-operative Educ. (iv)Building/WoodworkTechnology Educ. (v)Electrical/ElectronicsTechnology Educ. (vi)Mechanical/IndustrialTech.Educ. CALABAR LASU MAUTY withoptionsin: Agric.Tech.Educ.,ConstructionTech Educ.,Mechanical(Automobile) Educ.,MechanicalProduction; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Engineering _ Enviromental _ Technology.pdf, PDF p.13, table row 3; course cell: BUILDING AAU ABUJA ABU BAZE CALEB CUST DOU EBSU ESUTECH FED-LAFIA FED-OYEEKITI FUTA FUTIA FUTO IMSU JABU JEWEL JOS KADPOLY-ABU KSUSTA LAGOS LASU LAUTEC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N019. Building Technology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.104, table row 1; course cell: (offersthecourseasIndustrial andTechnologyEducationwith optionsin:-) (i) AutomobileTechnology. (ii) BuildingTechnology. (iii) Electrical/ElectronicTechnology. (iv) Metalwork. (v) Woodwork KADPOLY withoptionsin: (1) AutomobileTechnology (2) BuildingTechnology (3) Electrical/ElectronicsTechnology (4) MetalworkTechnology (5)AgriculturalScienceEducation (6)ComputerScienceEducation (7)Electrical/ElectronicsTechnology (8)DraftingTechnology (9) EducationTechnology (5) DraftsmanshipTechnology (6) WoodworkTechnology YABA-DEG NDU withoptionsin: (i)BuildingTechnology (ii)ElectricalTechnology (iii)MechanicalTechnology. IKERE-EKITI; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA; Engineering _ Enviromental _ Technology.pdf, PDF p.12, table row 4; course cell: BUILDINGTECHNOLOGY ABSU BAUCHI BELLS BIDA-DEG BOUEDST COVENANT DELSUT FED-KEBBI FEDPOADO-D FEDPOBAU-DEG KUST LASUSTECH OOU REDEEMERS; Sciences.pdf, PDF p.94, table row 4; course cell: SURVEYINGAND GEOINFORMATICS UNN BUILDINGTECHNOLOGY KASU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N020. Building Technology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.104, table row 1; course cell: (offersthecourseasIndustrial andTechnologyEducationwith optionsin:-) (i) AutomobileTechnology. (ii) BuildingTechnology. (iii) Electrical/ElectronicTechnology. (iv) Metalwork. (v) Woodwork KADPOLY withoptionsin: (1) AutomobileTechnology (2) BuildingTechnology (3) Electrical/ElectronicsTechnology (4) MetalworkTechnology (5)AgriculturalScienceEducation (6)ComputerScienceEducation (7)Electrical/ElectronicsTechnology (8)DraftingTechnology (9) EducationTechnology (5) DraftsmanshipTechnology (6) WoodworkTechnology YABA-DEG NDU withoptionsin: (i)BuildingTechnology (ii)ElectricalTechnology (iii)MechanicalTechnology. IKERE-EKITI; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA; Engineering _ Enviromental _ Technology.pdf, PDF p.12, table row 4; course cell: BUILDINGTECHNOLOGY ABSU BAUCHI BELLS BIDA-DEG BOUEDST COVENANT DELSUT FED-KEBBI FEDPOADO-D FEDPOBAU-DEG KUST LASUSTECH OOU REDEEMERS; Sciences.pdf, PDF p.94, table row 4; course cell: SURVEYINGAND GEOINFORMATICS UNN BUILDINGTECHNOLOGY KASU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N021. Business Education — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) TC II merit, 'O' Level or NTC/NBC credit passes including English Language, Mathematics, Economics and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of the following: Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand.
- Candidate brochure locations: Education.pdf, PDF p.12, table row 2; course cell: VOCATIONAL ANDTECHNICAL EDUCATION AAU (withoptionsin: i)AccountingEducation ii)BusinessEducation iii)HomeEconomics; Education.pdf, PDF p.13, table row 1; course cell: Education iv)AgriculturalScience Education v)SecretarialStudies Education. vi)TechnicalEducation BSU ESUTECH TASUED Withoptionsin i. AccountancyEducation ii. AgriculturalEducation iii. Commerce/CooperativeEducation iv. Building/WoodWorkTech.Educ v. Electrical/ElectronicTech.Educ vi. MechanicalTech.Education EKSU UNIOSUN UOO EBSU (withoptionsin i)Building/WoodworksTechnology ii)AgricultureEducation iii)Electrical/ElectronicsTechnology iv)Mechanical/MetalworkTechnology VOCATIONALINDUSTRIAL EDUCATION NDU withoptionsin: (i)AgricultureEducation (ii)BusinessEducation; Education.pdf, PDF p.200, table row 2; course cell: BUSINESSEDUCATION AAU ABSU ABU AGBORCOE AJAYI AKSCOE-DEG AKAMKPA-DEG AL-HIKMAH AOCOE ARTHUR-JARVIS ASPOL-DEG ATAPOLY-DG AUCHIPOLY-DEG BABCOCK BAUCHI BENIN BIU BOUEDST BSU COAL-CITY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N022. CYBER SECURITY — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.44, table row 3; course cell: COMPUTERSCIENCE BELLS CRAWFORD FEDPOADO-D MINNA OFFA-DEG RENAISSANCE CYBERSECURITY SCIENCE MINNA; Sciences.pdf, PDF p.205, table row 3; course cell: SALEM TELECOMMUNICATION SCIENCE ILORIN CYBERSECURITY SCIENCE ADUN TECH-IBADAN CYBERSECURITY AAUA AFIT-DEG AL-ANSAR AL-QALAM AL-HIKMAH AMOU APU AUGUSTINE AUE AVE-MARIA AZMAN BAYERO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N023. CYBER SECURITY — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.44, table row 3; course cell: COMPUTERSCIENCE BELLS CRAWFORD FEDPOADO-D MINNA OFFA-DEG RENAISSANCE CYBERSECURITY SCIENCE MINNA; Sciences.pdf, PDF p.205, table row 3; course cell: SALEM TELECOMMUNICATION SCIENCE ILORIN CYBERSECURITY SCIENCE ADUN TECH-IBADAN CYBERSECURITY AAUA AFIT-DEG AL-ANSAR AL-QALAM AL-HIKMAH AMOU APU AUGUSTINE AUE AVE-MARIA AZMAN BAYERO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N024. CYBER SECURITY SCIENCE — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.44, table row 3; course cell: COMPUTERSCIENCE BELLS CRAWFORD FEDPOADO-D MINNA OFFA-DEG RENAISSANCE CYBERSECURITY SCIENCE MINNA; Sciences.pdf, PDF p.205, table row 3; course cell: SALEM TELECOMMUNICATION SCIENCE ILORIN CYBERSECURITY SCIENCE ADUN TECH-IBADAN CYBERSECURITY AAUA AFIT-DEG AL-ANSAR AL-QALAM AL-HIKMAH AMOU APU AUGUSTINE AUE AVE-MARIA AZMAN BAYERO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N025. CYBER SECURITY SCIENCE — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.44, table row 3; course cell: COMPUTERSCIENCE BELLS CRAWFORD FEDPOADO-D MINNA OFFA-DEG RENAISSANCE CYBERSECURITY SCIENCE MINNA; Sciences.pdf, PDF p.205, table row 3; course cell: SALEM TELECOMMUNICATION SCIENCE ILORIN CYBERSECURITY SCIENCE ADUN TECH-IBADAN CYBERSECURITY AAUA AFIT-DEG AL-ANSAR AL-QALAM AL-HIKMAH AMOU APU AUGUSTINE AUE AVE-MARIA AZMAN BAYERO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N026. Christian Studies — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: OF ARTS (Hons.)] International Relations 53. German/Russian 54. 55. Environmental 56. 57. 58. 59. Archaeology 60. Studies 61. 62. Studies 63. Studies 64. Studies 65. 66.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.11, table row 3; course cell: KASU KKU PAAU LAGOS LASU LASUED LTS NASARAWA OBONG OOU PACOT REDEEMED REDEEMERS SPIRITAN TASUED TSUJ UDA UNIHEZ UNI-ILESA UNIOSUN CHRISTIANSTUDIES AJAYI ILORIN KWASU CHRISTIANRELIGIOUS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N027. Civil Law — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: law_offerings.json
- Current catalogue/source text: Five (5)'O' Level credit passes to include English Language, Literature in English and Mathematics.
- Candidate brochure locations: Law.pdf, PDF p.2, table row 3; course cell: CIVILLAW ABU OOU UNIZIK LAW AAU AAUA ABSU ABUAD ABUJA ACHIEVERS ADSU AJAYI AL-ANSAR AL-HIKMAH ANCHOR-UNI ARTHUR-JARVIS ATIBA AUE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N028. Classical Studies — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes at one sitting or Six (6) SSC credit passes at two (2) sittings to include English Language, Literature in English or History, one Arts or Social Science subject and any other subject.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.10, table row 3; course cell: CLASSICALSTUDIES IBADAN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N029. Common and Islamic Law — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: law_offerings.json
- Current catalogue/source text: Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- Candidate brochure locations: Law.pdf, PDF p.11, table row 4; course cell: ISLAMIC/SHARIALAW ABU KHAIRUN MAIDUGURI PAAU PRU COMMONANDISLAMIC LAW ABUJA BAYERO FOUNTAIN ILORIN KWASU LASU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N030. Computer and Information Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N031. Computer and Information Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N032. Computer and Information Science — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N033. Conservation Biology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.123, table row 3; course cell: CONSERVATIONBIOLOGY AUN CONSERVATIONAND ENVIRONMENTAL BIOLOGY ADUN ENVRIONMENTAL SCIENCEAND TECHNOLOGY WESLEYUNI ENVIRONMENTAL BIOLOGY MAIDUGURI ENVIRONMENTAL BIOLOGYANDFISHERIES AAUA MARINESCIENCEAND; Sciences.pdf, PDF p.167, table row 3; course cell: FED-LAFIA FUPRE FUTO GSU HENSARD KUST LASU LAUTECH LCITY MAUTY NASARAWA NILE OSUMS PEACELAND-UNI PHC TECH-IBADAN UNI-ILESA UNIOSUN UNN NATURAL ANDENVIRONMENTAL SCIENCE AUN (withoptionsas; (i) Conservation Biology; Sciences.pdf, PDF p.231, table row 3; course cell: Health (ii) Conservation Biology HOMESCIENCE PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N034. Conservation Biology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.123, table row 3; course cell: CONSERVATIONBIOLOGY AUN CONSERVATIONAND ENVIRONMENTAL BIOLOGY ADUN ENVRIONMENTAL SCIENCEAND TECHNOLOGY WESLEYUNI ENVIRONMENTAL BIOLOGY MAIDUGURI ENVIRONMENTAL BIOLOGYANDFISHERIES AAUA MARINESCIENCEAND; Sciences.pdf, PDF p.167, table row 3; course cell: FED-LAFIA FUPRE FUTO GSU HENSARD KUST LASU LAUTECH LCITY MAUTY NASARAWA NILE OSUMS PEACELAND-UNI PHC TECH-IBADAN UNI-ILESA UNIOSUN UNN NATURAL ANDENVIRONMENTAL SCIENCE AUN (withoptionsas; (i) Conservation Biology; Sciences.pdf, PDF p.231, table row 3; course cell: Health (ii) Conservation Biology HOMESCIENCE PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N035. Cooperative Economics and Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any other two (2) subjects. For NBC Holders, the other subjects could be from the following: Principles of Accounts, Commerce, and Accounts.
- Candidate brochure locations: Administration.pdf, PDF p.25, table row 5; course cell: COOPERATIVE ECONOMICS ANDMANAGEMENT UNIZIK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N036. Criminology and Security Studies — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: social_management_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.126, table row 4; course cell: CRIMINOLOGY AND SECURITYSTUDIES FED-DUTSE; Law.pdf, PDF p.13, table row 5; course cell: CRIMINOLOGYAND SECURITYSTUDIES JOS; Social Management Science.pdf, PDF p.41, table row 1; course cell: CRIMINOLOGY BAYERO CALEB JEWEL POL-ACAD CRIMINOLOGYAND SECURITYSTUDIES AAUA ACHIEVERS AL-ANSAR ARTHUR-JARVIS ATIBA AVE-MARIA BCU BOSU BOUEDST BOWEN CALABAR CARITAS COOU CCU CHRISLAND CRAWFORD COAL-CITY COOU COSMOPOLITAN CUN DOMINION DOU EL-AMIN FED-DUTSE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N037. Criminology and Security Studies — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: social_management_offerings.json
- Current catalogue/source text: (x) AAUA: for Criminology and Security Studies, requires five (5) `O' Level credit passes to include English Language, Government/History, Mathematics and two other subjects from Social Science/Arts. (xxiv) FED-OYE EKITI: For Criminology and Security Studies FED-OYE EKITI accepts five (5) SSC credit passes including English Language, Mathematics, Government and anyone from(Economics, Commerce, Geography and one Science or Arts subjects at SSC. (xxxviii) FED-DUTSE: For Criminology and Security Studies, FED-DUTSE accepts; five (5) `O' Level credit passes SSC or its equivalent to include English Language, Mathematics with any two (2) Social Science subjects and any one Arts subject at not more than two (2) sittings.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.126, table row 4; course cell: CRIMINOLOGY AND SECURITYSTUDIES FED-DUTSE; Law.pdf, PDF p.13, table row 5; course cell: CRIMINOLOGYAND SECURITYSTUDIES JOS; Social Management Science.pdf, PDF p.41, table row 1; course cell: CRIMINOLOGY BAYERO CALEB JEWEL POL-ACAD CRIMINOLOGYAND SECURITYSTUDIES AAUA ACHIEVERS AL-ANSAR ARTHUR-JARVIS ATIBA AVE-MARIA BCU BOSU BOUEDST BOWEN CALABAR CARITAS COOU CCU CHRISLAND CRAWFORD COAL-CITY COOU COSMOPOLITAN CUN DOMINION DOU EL-AMIN FED-DUTSE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N038. Criminology and Security Studies — UTME

- Current status: empty
- Review reason: no_source_text
- Source index: social_management_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.126, table row 4; course cell: CRIMINOLOGY AND SECURITYSTUDIES FED-DUTSE; Law.pdf, PDF p.13, table row 5; course cell: CRIMINOLOGYAND SECURITYSTUDIES JOS; Social Management Science.pdf, PDF p.41, table row 1; course cell: CRIMINOLOGY BAYERO CALEB JEWEL POL-ACAD CRIMINOLOGYAND SECURITYSTUDIES AAUA ACHIEVERS AL-ANSAR ARTHUR-JARVIS ATIBA AVE-MARIA BCU BOSU BOUEDST BOWEN CALABAR CARITAS COOU CCU CHRISLAND CRAWFORD COAL-CITY COOU COSMOPOLITAN CUN DOMINION DOU EL-AMIN FED-DUTSE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N039. Crop Production — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics.
- Candidate brochure locations: Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Agriculture.pdf, PDF p.9, table row 3; course cell: (a)SoilScience (b)Agronomy(c)CropSc. (d)CropProtection (e)Agric. Economics (f)AnimalScience BOWEN withoptionsin: (i)Agric.Economics& Farm Mgt. (ii)Agric.Ext.&Rural Dev. (iii)FoodScience&Tech. (iv)ForestryandWood Tech. (v)AnimalSc.&Fisheries Mgt (vi)CropProduction (vii)HomeScience&Mgt. KSUSTA LAPAI LASU LAUTECH withoptionsin: Agric.Economics.,Agric. Ext.&RuralDevand AgriculturalProduction & RenewableResources; Agriculture.pdf, PDF p.10, table row 3; course cell: CRUTECH withoptionin: (i) Agricultural Economicsand Extension (ii)AnimalScience (iii)Agronomy BIU withoptionsin: i)AgriculturalEconomics and ExtensionServices ii)AnimalProduction iii)AnimalScience iv)CropProduction v)SoilScience vi)Fishery vii)ForestryandWildLife andEnvironmental Management PAAU withoptionsin: i)Agric.Economicsand Extension ii)AnimalProduction iii)CropProduction iv)SoilScience; Agriculture.pdf, PDF p.33, table row 4; course cell: AGRONOMY ADSU withoptionsin: CropProduction,Crop Protection, and Soil Science. ESUTECH as Agronomy and EcologicalManagement) HENSARD IBADAN NASARAWA TSUJ UNIOSUN; Agriculture.pdf, PDF p.42, table row 4; course cell: CROP PRODUCTION ADSU BAUCHI CRAWFORD MAKURDI MINNA OOU SALEM CROP,SOILANDPEST; Agriculture.pdf, PDF p.43, table row 3; course cell: MANAGEMENT FUTA CROPPRODUCTION ANDLANDSCAPE MANAGEMENT EBSU HORTICULTUREAND LANDSCAPE MANAGEMENT LASUSTECH CROP PRODUCTION ANDHORTICULTURE MAUTY CROPPRODUCTION ANDPROTECTION ABSU OAU PLANT PHYSIOLOGY & CROPPRODUCTION FUNAAB CROPPROTECTION; Agriculture.pdf, PDF p.45, table row 3; course cell: FUNAAB CROPPRODUCTION ANDSOILSCIENCE LAUTECH CROPPRODUCTION TECHNOLOGY NDU withoptionsin: (i)SoilScience (ii)EnvironmentalAgric. (iii)CropTechnology CROPSCIENCEAND TECHNOLOGY FUTO withoptionsin i) Agronomy ii) CropProduction iii) Horticulture iv) PlantBreeding v) LandUse vi) AgriculturalWater Resources Management; Agriculture.pdf, PDF p.47, table row 3; course cell: PLANTSCIENCE AND CROP PRODUCTION JABU CROP SCIENCE AND BIOTECHNOLOGY IMSU CROPSCIENCEAND PRODUCTION JABU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N040. Crop Protection — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics (shares requirements with Crop Production umbrella block).
- Candidate brochure locations: Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.5, table row 3; course cell: (c) Anima Production andHealth (d) Soil Science and Land Resources Management FED-KASHERE FUTIA Withoptionsin: (a) Agric.Economics andExtension Services (b) Agronomy (c) AnimalScience (d) SoilScience GREGORY IBADAN IAUED ILORIN withoptionsin: (i)CropProtection (ii)AnimalProduction (iii)Agric.Economics& FarmManagement (iv)Agric.Extension& Rural Development.; Agriculture.pdf, PDF p.9, table row 3; course cell: (a)SoilScience (b)Agronomy(c)CropSc. (d)CropProtection (e)Agric. Economics (f)AnimalScience BOWEN withoptionsin: (i)Agric.Economics& Farm Mgt. (ii)Agric.Ext.&Rural Dev. (iii)FoodScience&Tech. (iv)ForestryandWood Tech. (v)AnimalSc.&Fisheries Mgt (vi)CropProduction (vii)HomeScience&Mgt. KSUSTA LAPAI LASU LAUTECH withoptionsin: Agric.Economics.,Agric. Ext.&RuralDevand AgriculturalProduction & RenewableResources; Agriculture.pdf, PDF p.11, table row 3; course cell: ADSU withoptionsin: (i) Agricultural Economicsand Extension ii.AnimalProduction iii.CropProtection iv.SoilScience IGBINEDION UYO withoptionsin: i.Agric.Economics& Extension ii.CropScience iii.SoilScience iv.AnimalScience CRAWFORD EBSU (offersthecourseas Agricultural \Mechanizationand Technology) DELSU FUTO Withoptionsin i.AgriculturalEconomics; Agriculture.pdf, PDF p.33, table row 4; course cell: AGRONOMY ADSU withoptionsin: CropProduction,Crop Protection, and Soil Science. ESUTECH as Agronomy and EcologicalManagement) HENSARD IBADAN NASARAWA TSUJ UNIOSUN; Agriculture.pdf, PDF p.43, table row 3; course cell: MANAGEMENT FUTA CROPPRODUCTION ANDLANDSCAPE MANAGEMENT EBSU HORTICULTUREAND LANDSCAPE MANAGEMENT LASUSTECH CROP PRODUCTION ANDHORTICULTURE MAUTY CROPPRODUCTION ANDPROTECTION ABSU OAU PLANT PHYSIOLOGY & CROPPRODUCTION FUNAAB CROPPROTECTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N041. Crop Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.2, table row 3; course cell: AGRICULTURE AAU AAUA ABU ABUAD ABUJA AJAYI AL-HIKMAH AKSU Withoptionin: (i) CropScience BABCOCK BASU BAUCHI BENIN BOSU Withoptionsin: (i) AnimalScience (ii) Agric.Economics and Extension (iii) Agronomyand SoilScience; Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.11, table row 3; course cell: ADSU withoptionsin: (i) Agricultural Economicsand Extension ii.AnimalProduction iii.CropProtection iv.SoilScience IGBINEDION UYO withoptionsin: i.Agric.Economics& Extension ii.CropScience iii.SoilScience iv.AnimalScience CRAWFORD EBSU (offersthecourseas Agricultural \Mechanizationand Technology) DELSU FUTO Withoptionsin i.AgriculturalEconomics; Agriculture.pdf, PDF p.44, table row 3; course cell: FUNAAB LASUSTECH CROPSCIENCE DELSUT FUA-ZURU JABU RSU UDA UNN CROPSCIENCE/SOIL SCIENCE DOU CROPSCIENCEAND HORTICULTURE COOU FED-OYEEKITI CROP AND ENVIRONMENTAL PROTECTION LAUTECH MAKURDI PLANTBREEDING & SEEDTECHNOLOGY:
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N042. Crop Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.2, table row 3; course cell: AGRICULTURE AAU AAUA ABU ABUAD ABUJA AJAYI AL-HIKMAH AKSU Withoptionin: (i) CropScience BABCOCK BASU BAUCHI BENIN BOSU Withoptionsin: (i) AnimalScience (ii) Agric.Economics and Extension (iii) Agronomyand SoilScience; Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.11, table row 3; course cell: ADSU withoptionsin: (i) Agricultural Economicsand Extension ii.AnimalProduction iii.CropProtection iv.SoilScience IGBINEDION UYO withoptionsin: i.Agric.Economics& Extension ii.CropScience iii.SoilScience iv.AnimalScience CRAWFORD EBSU (offersthecourseas Agricultural \Mechanizationand Technology) DELSU FUTO Withoptionsin i.AgriculturalEconomics; Agriculture.pdf, PDF p.44, table row 3; course cell: FUNAAB LASUSTECH CROPSCIENCE DELSUT FUA-ZURU JABU RSU UDA UNN CROPSCIENCE/SOIL SCIENCE DOU CROPSCIENCEAND HORTICULTURE COOU FED-OYEEKITI CROP AND ENVIRONMENTAL PROTECTION LAUTECH MAKURDI PLANTBREEDING & SEEDTECHNOLOGY:
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N043. Crop Science — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: AGRICULTURE/VET.MEDICINE B.Agric.Tech.) DVM] 35 Fisheries 36 Fisheries 37 Food 38 Food 39 Food 40 Forestry 41 Forestry/Forest 42 Forestry 43 Forestry 44 Forestry, 45 Forestry 46 Home 47 Home 48 Home 49 Horticulture 50 Hotel 51 Livestock 52 Nutrition 53 Pasture & 54 Plant 55 Plant Science 56 Plant Science 57 Plant Science 58 Plant 59 Plant 60 Public & 61 Soil Science 62 Soil Science 63 Soil Science.
- Candidate brochure locations: Agriculture.pdf, PDF p.2, table row 3; course cell: AGRICULTURE AAU AAUA ABU ABUAD ABUJA AJAYI AL-HIKMAH AKSU Withoptionin: (i) CropScience BABCOCK BASU BAUCHI BENIN BOSU Withoptionsin: (i) AnimalScience (ii) Agric.Economics and Extension (iii) Agronomyand SoilScience; Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.11, table row 3; course cell: ADSU withoptionsin: (i) Agricultural Economicsand Extension ii.AnimalProduction iii.CropProtection iv.SoilScience IGBINEDION UYO withoptionsin: i.Agric.Economics& Extension ii.CropScience iii.SoilScience iv.AnimalScience CRAWFORD EBSU (offersthecourseas Agricultural \Mechanizationand Technology) DELSU FUTO Withoptionsin i.AgriculturalEconomics; Agriculture.pdf, PDF p.44, table row 3; course cell: FUNAAB LASUSTECH CROPSCIENCE DELSUT FUA-ZURU JABU RSU UDA UNN CROPSCIENCE/SOIL SCIENCE DOU CROPSCIENCEAND HORTICULTURE COOU FED-OYEEKITI CROP AND ENVIRONMENTAL PROTECTION LAUTECH MAKURDI PLANTBREEDING & SEEDTECHNOLOGY:
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N044. Data Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.100, table row 3; course cell: DELSUT DATASCIENCE AAUA AL-ANSAR AMOU AZMAN DOU FUPRE HENSARD HUSTECH JEWEL LAGOS SALEM SKYLINE SUMMIT NBU NILE MAAUN MIVA PAN-ATLANTIC PHILOMATH PRU WIGWE DIGITAL ENTREPRENEURSHIP CCU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N045. Data Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.100, table row 3; course cell: DELSUT DATASCIENCE AAUA AL-ANSAR AMOU AZMAN DOU FUPRE HENSARD HUSTECH JEWEL LAGOS SALEM SKYLINE SUMMIT NBU NILE MAAUN MIVA PAN-ATLANTIC PHILOMATH PRU WIGWE DIGITAL ENTREPRENEURSHIP CCU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N046. Development and Communication Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics.
- Candidate brochure locations: Administration.pdf, PDF p.36, table row 3; course cell: ESUTECH MADONNA NASARAWA WELLSPRING WESTERN-DEL STRATEGIC COMMUNICATION ABUJA BSU DEVELOPMENTAND COMMUNICATIONSTUDIES ABUJA BSU IMSU RSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N047. ELECTRONICS AND COMMUNICATIONS — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a.
- Candidate brochure locations: Sciences.pdf, PDF p.215, table row 3; course cell: UNN ELECTRONICSAND COMPUTER TECHNOLOGY CALABAR ELECTRONICSAND COMPUTERSYSTEMS FOUNTAIN ELECTRONICSAND COMMUNICATIONS FOUNTAIN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N048. ELECTRONICS AND COMPUTER SYSTEMS — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a.
- Candidate brochure locations: Sciences.pdf, PDF p.215, table row 3; course cell: UNN ELECTRONICSAND COMPUTER TECHNOLOGY CALABAR ELECTRONICSAND COMPUTERSYSTEMS FOUNTAIN ELECTRONICSAND COMMUNICATIONS FOUNTAIN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N049. ELECTRONICS AND COMPUTER TECHNOLOGY — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a.
- Candidate brochure locations: Sciences.pdf, PDF p.215, table row 3; course cell: UNN ELECTRONICSAND COMPUTER TECHNOLOGY CALABAR ELECTRONICSAND COMPUTERSYSTEMS FOUNTAIN ELECTRONICSAND COMMUNICATIONS FOUNTAIN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N050. Earth Science — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: OAU requires five (5) 'O' Level credit passes in English Language, Chemistry, Biology/Further Mathematics, Mathematics and Physics. (Heading continues past line range; columns blank in range.)
- Candidate brochure locations: Sciences.pdf, PDF p.154, table row 3; course cell: GEOSCIENCE AKSU GEOGRAPHY AND GEOSCIENCES JABU EARTHSCIENCE LAUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N051. Eco-Tourism and Wildlife Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics, Biology or Agricultural Science, Chemistry and any other relevant subject (shares block with Agribusiness umbrella).
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N052. Education and Business Administration — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) 'O' Level or NTC/NBC credit passes in English Language and Mathematics plus three (3) other subjects.
- Candidate brochure locations: Education.pdf, PDF p.199, table row 2; course cell: EDUCATIONANDBUSINESS ADMINISTRATION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N053. Efik-Ibibio — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes or equivalent including English
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.119, table row 4; course cell: EFIK-IBIBIO UYO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N054. Electronics — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.213, table row 3; course cell: ELECTRICAL/ELECTRONICS EDUCATION ATAPOLY-DG BAUCHI EDAKOKA FTBICHI-DEG EDUMUNZ EKSU POTISKUM_D FED-GUSAU KSUSTA KUST MAUTY UNIZIK; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA; Engineering _ Enviromental _ Technology.pdf, PDF p.45, table row 3; course cell: MADUKA MARITIME-UNI NDU OFFA-DEG PHC RSU UNIZIK UNN WIGWE ELECTRICALAND ELECTRONICS ENGINEERING SUMMIT ELECTRONICSAND COMPUTER ENGINEERING LASU UNIZIK ELECTRICALAND COMPUTER ENGINEERING MINNA; Engineering _ Enviromental _ Technology.pdf, PDF p.46, table row 4; course cell: TTRICAL/ELECTRONICS ENGINEERING AAU ABSU ABUAD ACHIEVERS AFIT-DEG AJAYI AKSU ALETHEIA AUE AUN BABCOCK BAUCHI; Engineering _ Enviromental _ Technology.pdf, PDF p.48, table row 3; course cell: FED-LOKOJA FUNAAB FUPRE FUT-DAURA FUTA FUTIA FUTOwithoptionsin: a) Electronics/Computer EngineeringTechnology b) Power System EngineeringTechnology c) Communication EngineeringTechnology d) Acoustic Engineering Tech. GREGORY IBADAN IGBINEDION ILORIN IMSU JOS KSUSTA KWASU LAGOS LASUSTECH LAUTECH; Engineering _ Enviromental _ Technology.pdf, PDF p.50, table row 3; course cell: UMUDIKE UNIOSUN UYO VERITAS VENITE ELECTRONICS ENGINEERING AUN FUTO PHC UNIZIK UNN ELECTRICALAND INFORMATION ENGINEERING LANDMARK ELECTRONICSAND TELECOMMUNICATIONS ENGINEERING DELSUT; Sciences.pdf, PDF p.25, table row 3; course cell: (withoptionsin): (i)AppliedNuclearScience (ii)IndustrialPhysics (iii)MedicalPhysics (iv)Meteorology& AtmosphericPhysics FUPRE (withoptionsin): (i) TheoreticalPhysics (ii) Physical/Electronics (iii) PhysicalandEnergy Studies GOUU GREGORY GSU GSUST HALLMARK IAUED IBADAN IGBINEDION ILORIN IMSU JABU JOS; Sciences.pdf, PDF p.27, table row 3; course cell: NDA NDU NOUN-ELUON MINNA MKAR NASARAWA NAUB NOVENA OAU ODUDUWA OSUMS OOU withoptionsin:Geophysics, MedicalHealthPhysicsand PhysicswithElectronics. OAUSTECH (withoptionsin: (i)Physics;(ii)Electronics; (iii)SolidState. PAUL PHC withoptionsin:i)Applied Geophysics;ii)Elect/Elect. PLASU; Sciences.pdf, PDF p.29, table row 3; course cell: UNN UYO WESTERN-DEL WELLSPRING WESLEYUNI (offers the course as Physics and Industrial Physics) RHEMA YSU ZAMFARA PHYSICSWITH ELECTRONICS AAUA ACHIEVERS AFIT-DEG AJAYI AL-ANSAR AL-HIKMAH ALETHEIA ANCHOR-UNI APU ATIBA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N055. Electronics — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.97, table row 1; course cell: a) Building b) Mechanical c) Electrical/Electronics AAUA AKSCOE-DEG AOCOE BAYERO BENIN CRUTECH DELSU EACOE ESCOE EDUMUNZ UYO UNIZIK withoptionsin: (1) BuildingTechnology. (2) WoodTechnology. (3) MechanicalTechnology. (4) ElectricalTechnology. IAUED withoptionsin: (1) BuildingTechnology. (2) ElectricalTechnology. (3) MechanicalTechnology. ILORIN RSU withoptionsin:; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.213, table row 3; course cell: ELECTRICAL/ELECTRONICS EDUCATION ATAPOLY-DG BAUCHI EDAKOKA FTBICHI-DEG EDUMUNZ EKSU POTISKUM_D FED-GUSAU KSUSTA KUST MAUTY UNIZIK; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA; Engineering _ Enviromental _ Technology.pdf, PDF p.45, table row 3; course cell: MADUKA MARITIME-UNI NDU OFFA-DEG PHC RSU UNIZIK UNN WIGWE ELECTRICALAND ELECTRONICS ENGINEERING SUMMIT ELECTRONICSAND COMPUTER ENGINEERING LASU UNIZIK ELECTRICALAND COMPUTER ENGINEERING MINNA; Engineering _ Enviromental _ Technology.pdf, PDF p.46, table row 4; course cell: TTRICAL/ELECTRONICS ENGINEERING AAU ABSU ABUAD ACHIEVERS AFIT-DEG AJAYI AKSU ALETHEIA AUE AUN BABCOCK BAUCHI; Engineering _ Enviromental _ Technology.pdf, PDF p.48, table row 3; course cell: FED-LOKOJA FUNAAB FUPRE FUT-DAURA FUTA FUTIA FUTOwithoptionsin: a) Electronics/Computer EngineeringTechnology b) Power System EngineeringTechnology c) Communication EngineeringTechnology d) Acoustic Engineering Tech. GREGORY IBADAN IGBINEDION ILORIN IMSU JOS KSUSTA KWASU LAGOS LASUSTECH LAUTECH; Engineering _ Enviromental _ Technology.pdf, PDF p.50, table row 3; course cell: UMUDIKE UNIOSUN UYO VERITAS VENITE ELECTRONICS ENGINEERING AUN FUTO PHC UNIZIK UNN ELECTRICALAND INFORMATION ENGINEERING LANDMARK ELECTRONICSAND TELECOMMUNICATIONS ENGINEERING DELSUT; Sciences.pdf, PDF p.25, table row 3; course cell: (withoptionsin): (i)AppliedNuclearScience (ii)IndustrialPhysics (iii)MedicalPhysics (iv)Meteorology& AtmosphericPhysics FUPRE (withoptionsin): (i) TheoreticalPhysics (ii) Physical/Electronics (iii) PhysicalandEnergy Studies GOUU GREGORY GSU GSUST HALLMARK IAUED IBADAN IGBINEDION ILORIN IMSU JABU JOS; Sciences.pdf, PDF p.27, table row 3; course cell: NDA NDU NOUN-ELUON MINNA MKAR NASARAWA NAUB NOVENA OAU ODUDUWA OSUMS OOU withoptionsin:Geophysics, MedicalHealthPhysicsand PhysicswithElectronics. OAUSTECH (withoptionsin: (i)Physics;(ii)Electronics; (iii)SolidState. PAUL PHC withoptionsin:i)Applied Geophysics;ii)Elect/Elect. PLASU; Sciences.pdf, PDF p.29, table row 3; course cell: UNN UYO WESTERN-DEL WELLSPRING WESLEYUNI (offers the course as Physics and Industrial Physics) RHEMA YSU ZAMFARA PHYSICSWITH ELECTRONICS AAUA ACHIEVERS AFIT-DEG AJAYI AL-ANSAR AL-HIKMAH ALETHEIA ANCHOR-UNI APU ATIBA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N056. Electrons — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.33, table row 3; course cell: BAYERO NAUB WESLEYUNI ELECTRONS ZAMFARA PHYSICSWITHSOLAR ENERGY BOWEN PHYSICSANDENERGY STUDIES ACHIEVERS PHYSICS/INDUSTRIAL PHYSICS BENIN UNIZIK PHYSICSWITH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N057. Employment and Human Resource Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N058. Energy Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.34, table row 3; course cell: COMPUTATIONAL MODELING CALEB PHYSICS/ASTROLOGY UNN PHYSICALSCIENCES GOUU (withoptionsin i.IndustrialPhysics ii.PhysicswithElectronics ENERGYSTUDIES SALEM
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N059. English Studies — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.28, table row 4; course cell: ENGLISHLANGUAGE AAU ABU ABUAD ADSU AJAYI AL-HIKMAH AL-QALAM ALETHEIA APU ARTSHUR-JARVIS ATIBA AUE AUGUSTINE BABCOCK(withoptionsin (i) EnglishStudies (ii) Communication (iii) LiteracyStudies BASU; Arts _ Humanities.pdf, PDF p.43, table row 3; course cell: LAUTECH LCITY LUX-MUNDI MAIDUGURI MC-IBRU NDU OBONG SUMMIT TAU TRINITY UDA UNIHEZ UNN VERITAS ENGLISHSTUDIES AAUA BABCOCK KASU LITERATUREINENGLISH ABU BASU BOSU CHRISLAND CHRISTOPHER
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N060. English Studies — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.28, table row 4; course cell: ENGLISHLANGUAGE AAU ABU ABUAD ADSU AJAYI AL-HIKMAH AL-QALAM ALETHEIA APU ARTSHUR-JARVIS ATIBA AUE AUGUSTINE BABCOCK(withoptionsin (i) EnglishStudies (ii) Communication (iii) LiteracyStudies BASU; Arts _ Humanities.pdf, PDF p.43, table row 3; course cell: LAUTECH LCITY LUX-MUNDI MAIDUGURI MC-IBRU NDU OBONG SUMMIT TAU TRINITY UDA UNIHEZ UNN VERITAS ENGLISHSTUDIES AAUA BABCOCK KASU LITERATUREINENGLISH ABU BASU BOSU CHRISLAND CHRISTOPHER
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N061. Environmental Biology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.18, table row 4; course cell: BIOLOGICALSCIENCE(S) ABU AUE withoptionsin: i. PlantScience ii. EnvironmentalScience iii. Animalscience AUGUSTINE(withoptionsin Microbiologyand EnvironmentalBiology) AKSU (offersthecoursewiththe followingoptions); Sciences.pdf, PDF p.122, table row 3; course cell: BIOLOGY UMUDIKE ANIMALAND ENVIRONMENTAL BIOLOGY BENIN BOSU CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-OYEEKITI PAAU OSUMS PHC RSU UMYUK UYO; Sciences.pdf, PDF p.123, table row 3; course cell: CONSERVATIONBIOLOGY AUN CONSERVATIONAND ENVIRONMENTAL BIOLOGY ADUN ENVRIONMENTAL SCIENCEAND TECHNOLOGY WESLEYUNI ENVIRONMENTAL BIOLOGY MAIDUGURI ENVIRONMENTAL BIOLOGYANDFISHERIES AAUA MARINESCIENCEAND; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N062. Environmental Biology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.18, table row 4; course cell: BIOLOGICALSCIENCE(S) ABU AUE withoptionsin: i. PlantScience ii. EnvironmentalScience iii. Animalscience AUGUSTINE(withoptionsin Microbiologyand EnvironmentalBiology) AKSU (offersthecoursewiththe followingoptions); Sciences.pdf, PDF p.122, table row 3; course cell: BIOLOGY UMUDIKE ANIMALAND ENVIRONMENTAL BIOLOGY BENIN BOSU CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-OYEEKITI PAAU OSUMS PHC RSU UMYUK UYO; Sciences.pdf, PDF p.123, table row 3; course cell: CONSERVATIONBIOLOGY AUN CONSERVATIONAND ENVIRONMENTAL BIOLOGY ADUN ENVRIONMENTAL SCIENCEAND TECHNOLOGY WESLEYUNI ENVIRONMENTAL BIOLOGY MAIDUGURI ENVIRONMENTAL BIOLOGYANDFISHERIES AAUA MARINESCIENCEAND; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N063. Environmental Biology — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Mathematics, Physics, Chemistry or a) Geography subject combination which includes Mathematics and two (2) of Environmental.
- Candidate brochure locations: Sciences.pdf, PDF p.18, table row 4; course cell: BIOLOGICALSCIENCE(S) ABU AUE withoptionsin: i. PlantScience ii. EnvironmentalScience iii. Animalscience AUGUSTINE(withoptionsin Microbiologyand EnvironmentalBiology) AKSU (offersthecoursewiththe followingoptions); Sciences.pdf, PDF p.122, table row 3; course cell: BIOLOGY UMUDIKE ANIMALAND ENVIRONMENTAL BIOLOGY BENIN BOSU CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-OYEEKITI PAAU OSUMS PHC RSU UMYUK UYO; Sciences.pdf, PDF p.123, table row 3; course cell: CONSERVATIONBIOLOGY AUN CONSERVATIONAND ENVIRONMENTAL BIOLOGY ADUN ENVRIONMENTAL SCIENCEAND TECHNOLOGY WESLEYUNI ENVIRONMENTAL BIOLOGY MAIDUGURI ENVIRONMENTAL BIOLOGYANDFISHERIES AAUA MARINESCIENCEAND; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N064. Environmental Health Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.33, table row 3; course cell: UDA UNI-ILESA UNIKINGS UNINIGER VENITE VISION-UNI WELLSPRING WESTERN-DEL ZAMFARA PUBLICHEALTHSCIENCE KWASU NOUN ENVIRONMENTALHEALTH SCIENCE AZMAN CLIFFORD FED-DUTSE; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N065. Environmental Health Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.33, table row 3; course cell: UDA UNI-ILESA UNIKINGS UNINIGER VENITE VISION-UNI WELLSPRING WESTERN-DEL ZAMFARA PUBLICHEALTHSCIENCE KWASU NOUN ENVIRONMENTALHEALTH SCIENCE AZMAN CLIFFORD FED-DUTSE; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N066. Environmental Management — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.48, table row 3; course cell: RSU SALEM UMUDIKE UNN UYO SOILSCIENCE MANAGEMENT JABU SOIL AND ENVIRONMENTAL MANAGEMENT CRAWFORD EBSU IMSU SOIL SCIENCE AND LANDMANAGEMENT FUNAAB SOIL SCIENCE AND LAND AGRO- CLIMATOLOGY JABU SOILSCIENCEAND; Engineering _ Enviromental _ Technology.pdf, PDF p.104, table row 4; course cell: GEOGRAPHY AND METEOROLOGY: UNIZIK ENVIRONMENTAL MANAGEMENT BAYERO BINGHAM BOUEDST CUAB DELSUT EBSU ESUTECH HENSARD KASU LASU NASARAWA NAUB; Engineering _ Enviromental _ Technology.pdf, PDF p.134, table row 4; course cell: ENVIRONMENTAL MANAGEMENT TECHNOLOGY BAUCHI COOU NOVENA ENVIRONMENTAL TECHNOLOGY PHC ENVIRONMENTAL ENGINEERING IGBINEDION KUST PHC; Sciences.pdf, PDF p.91, table row 3; course cell: OOU GEOGRAPHY ABU ADSU BAYERO GSU IBADAN KASU KASU-KABBA MINNA NASARAWA UMYUK Offersthecoursewith optionsin: i.Science ii.Humanities GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT GOUU; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK; Social Management Science.pdf, PDF p.54, table row 1; course cell: YSU GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT ILORIN IMSU PHC GEOGRAPHYAND METEOROLOGY ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N067. Environmental Management — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.48, table row 3; course cell: RSU SALEM UMUDIKE UNN UYO SOILSCIENCE MANAGEMENT JABU SOIL AND ENVIRONMENTAL MANAGEMENT CRAWFORD EBSU IMSU SOIL SCIENCE AND LANDMANAGEMENT FUNAAB SOIL SCIENCE AND LAND AGRO- CLIMATOLOGY JABU SOILSCIENCEAND; Engineering _ Enviromental _ Technology.pdf, PDF p.104, table row 4; course cell: GEOGRAPHY AND METEOROLOGY: UNIZIK ENVIRONMENTAL MANAGEMENT BAYERO BINGHAM BOUEDST CUAB DELSUT EBSU ESUTECH HENSARD KASU LASU NASARAWA NAUB; Engineering _ Enviromental _ Technology.pdf, PDF p.134, table row 4; course cell: ENVIRONMENTAL MANAGEMENT TECHNOLOGY BAUCHI COOU NOVENA ENVIRONMENTAL TECHNOLOGY PHC ENVIRONMENTAL ENGINEERING IGBINEDION KUST PHC; Sciences.pdf, PDF p.91, table row 3; course cell: OOU GEOGRAPHY ABU ADSU BAYERO GSU IBADAN KASU KASU-KABBA MINNA NASARAWA UMYUK Offersthecoursewith optionsin: i.Science ii.Humanities GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT GOUU; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK; Social Management Science.pdf, PDF p.54, table row 1; course cell: YSU GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT ILORIN IMSU PHC GEOGRAPHYAND METEOROLOGY ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N068. Environmental Management — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Mathematics, Physics, Chemistry or a) Geography subject combination which includes Mathematics and two (2) of Environmental.
- Candidate brochure locations: Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.48, table row 3; course cell: RSU SALEM UMUDIKE UNN UYO SOILSCIENCE MANAGEMENT JABU SOIL AND ENVIRONMENTAL MANAGEMENT CRAWFORD EBSU IMSU SOIL SCIENCE AND LANDMANAGEMENT FUNAAB SOIL SCIENCE AND LAND AGRO- CLIMATOLOGY JABU SOILSCIENCEAND; Engineering _ Enviromental _ Technology.pdf, PDF p.104, table row 4; course cell: GEOGRAPHY AND METEOROLOGY: UNIZIK ENVIRONMENTAL MANAGEMENT BAYERO BINGHAM BOUEDST CUAB DELSUT EBSU ESUTECH HENSARD KASU LASU NASARAWA NAUB; Engineering _ Enviromental _ Technology.pdf, PDF p.134, table row 4; course cell: ENVIRONMENTAL MANAGEMENT TECHNOLOGY BAUCHI COOU NOVENA ENVIRONMENTAL TECHNOLOGY PHC ENVIRONMENTAL ENGINEERING IGBINEDION KUST PHC; Sciences.pdf, PDF p.91, table row 3; course cell: OOU GEOGRAPHY ABU ADSU BAYERO GSU IBADAN KASU KASU-KABBA MINNA NASARAWA UMYUK Offersthecoursewith optionsin: i.Science ii.Humanities GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT GOUU; Sciences.pdf, PDF p.168, table row 3; course cell: (ii) Environmental Health MAIDUGURI (offersthecourseas EnvironmentalBiology) ENVIRONMENTAL HEALTHSCIENCE BAYERO IBADAN FUTO UNIZIK ENVIRONMENTAL MANAGEMENT CUAB EKSU FUTO IGBINEDION SAM-MARIS UMYUK; Social Management Science.pdf, PDF p.54, table row 1; course cell: YSU GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT ILORIN IMSU PHC GEOGRAPHYAND METEOROLOGY ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N069. Environmental Management and Toxicology — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) 'O' Level credit passes (varies by institution). FED-DUTSE: for Environmental Management and Toxicology accepts English Language, Mathematics, Chemistry, Geography and Biology or Agric. Science (max two sittings) plus at least pass in Physics. CUAB: English Language, Mathematics, Chemistry and Geography with pass in Physics, Biology and Agricultural Science. BSU for Microbiology accepts passes in five prescribed subjects in Preliminary Science of BSU.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.105, table row 3; course cell: NDU NOK RSU UNIZIK ENVIRONMENTAL MANAGEMENTAND TOXICOLOGY DOU ENVIRONMENTAL RESOURCES MANAGEMENT ABSU FED-DUTSINMA UDU ENVIRONMENTAL SCIENCERESOURCES MANAGEMENT NOUN; Sciences.pdf, PDF p.169, table row 3; course cell: ENVIRONMENTAL MANAGEMENTAND TOXICOLOGY BENIN BSU CALEB DELSUT EL-AMIN ELIZADE FED-DUTSE FED-OYEEKITI FED-OTUOKE FUPRE LCITY MAIDUGURI MC-IBRU OSUMS PRU REDEEMERS UAGRIC-IMO UDA UMUDIKE UNI-ILESA WESTERN-DEL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N070. Environmental Management and Toxicology — UTME

- Current status: needs_review
- Review reason: utme_cell_contains_olevel_text
- Source index: sciences_offerings.json
- Current catalogue/source text: MADONNA and EBSU accept 'O' Level pass in Physics with 'O' Level credit pass in Mathematics; IMSU, COOU, UYO and EBSU accept 'O' Level pass in English Language. (UTME subjects column shared with grouped block; see waivers.)
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.105, table row 3; course cell: NDU NOK RSU UNIZIK ENVIRONMENTAL MANAGEMENTAND TOXICOLOGY DOU ENVIRONMENTAL RESOURCES MANAGEMENT ABSU FED-DUTSINMA UDU ENVIRONMENTAL SCIENCERESOURCES MANAGEMENT NOUN; Sciences.pdf, PDF p.169, table row 3; course cell: ENVIRONMENTAL MANAGEMENTAND TOXICOLOGY BENIN BSU CALEB DELSUT EL-AMIN ELIZADE FED-DUTSE FED-OYEEKITI FED-OTUOKE FUPRE LCITY MAIDUGURI MC-IBRU OSUMS PRU REDEEMERS UAGRIC-IMO UDA UMUDIKE UNI-ILESA WESTERN-DEL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N071. Environmental Science and Technology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N072. Environmental Science and Technology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N073. Environmental Standards — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) other subjects. ForNBCholders, the othertwo(2) relevant subjectscouldbe from anyof Principlesof Accounts, Commerce, of fice Practiceand SecretarialDuties.
- Candidate brochure locations: Administration.pdf, PDF p.7, table row 3; course cell: PHOENIX SOCIALSTANDARDS ABU BAUCHI BENIN FUTO LAGOS MAKURDI ENVIRONMENTAL STANDARDS ABU BAUCHI BENIN FUTO LAGOS MAKURDI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N074. Environmental Standards — UTME

- Current status: needs_review
- Review reason: utme_cell_contains_olevel_text
- Source index: administration_offerings.json
- Current catalogue/source text: UTME: (i) AUN same as in Finance (ii) BIU accepts credit/merit in English Language and Mathematics at TC II as 'O' Level equivalent. (iii) EVANGEL- Economics is not compulsory but accepts any three (3) relevant subjects. (iv) FED-DUTSINMA requires Five `O' level Credits to include: English Language, Mathematics, Economics/Financial Accounting and any other two Management or Social Sciences subjects. (v) FED-WUKARI – Same as in Economics. (vi) JOS in addition to the UTME requirements requires two (2) `O' Level credit passes in any of Business Studies, Commerce, Government, Principles of Accounts, Geography and Biology. (vii) LAGOS requires five (5) 'O' Level credit passes to include English Language, Mathematics, Economics and any two (2) from Financial Accounting/Principles of Accounting, Further Mathematics, Literature in English, Geography, Government, Biology, Business Management, and Data Processing/Computer Studies. (viii) PHC does not accept Commercial subjects except Financial Accounting or Business Methods/Management. (ix) PHC requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. (x) PLASU accepts Commerce or Principles of Accounting In lieu of Economics. (xi) UNN requires five (5) O' Level credit passes to include English Language, Mathematics Economics and any other two (2) relevant subjects. For NBC holders, the other two (2) relevant subjects could be from any of Accounting, Principles of Accounts, Commerce, Office Practice and Secretarial Duties. (xii) UYO requires `O' Level credit pass in Economics. (xiii) LCITY requires `O' Level credit passes in English Language, Mathematics, Economics/Commerce and any other two (2) subjects. (xiv) AAUA requires five (5) `O' Level credit passes to include English Language, Mathematics, Economics/Commerce, and two others from Accounting/Bookkeeping, Geography and Government. (xv) ABU requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) other subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. UTME SUBJECTS (i) AUN same as in Finance. (ii) BSU requires Economics. (iii) IGBINEDION accepts Commerce In lieu of Economics. (iv) CARITAS requires Mathematics, Economics plus any Social Science or Arts subject. (v) EVANGEL accepts Principles of Accounts In lieu of Mathematics. (vi) FED-DUTSINMA requires Mathematics, English Language, Economics/Financial Accounting and any other Social and Management Science subject. (vii) LAGOS accepts Mathematics, Economics, plus one (1) Subject from the following: Financial Accounting, Further Mathematics, Geography, Government, Literature in English and Biology. (viii) OAU requires Principles of Accounts not Commerce.
- Candidate brochure locations: Administration.pdf, PDF p.7, table row 3; course cell: PHOENIX SOCIALSTANDARDS ABU BAUCHI BENIN FUTO LAGOS MAKURDI ENVIRONMENTAL STANDARDS ABU BAUCHI BENIN FUTO LAGOS MAKURDI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N075. FISHERIES AND AQUACULTURE — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.15, table row 3; course cell: FISHERIESAND AQUATICRESOURCES MANAGEMENT: UMUDIKE FISHERIES TECHNOLOGY AGRIC.COOPERATIVE MANAGEMENT FISHERIESAND AQUACULTURE: AAUA ABU ADSU AKSU AUGUSTINE BAYERO BOUEDST CALABAR COOU DOU EBSU FED-DUTSE FED-DUTSINMA; Agriculture.pdf, PDF p.52, table row 3; course cell: AQUACULTUREAND FISHERIES MANAGEMENT FUNAAB IBADAN KWASU LASUSTECH FISHERIESAND AQUACULTURE TECHNOLOGY FUTA FUTO FISHERIES/FORESTRY /WILDLIFE FUA-ZURU; Sciences.pdf, PDF p.229, table row 4; course cell: MARINEBIOLOGY& FISHERIES WESLEYUNI MARINEBIOLOGY AKSU LAGOS FISHERIESAND AQUACULTURE CUAB LAUTECH OCEANOGRAPHY AKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N076. FISHERIES AND AQUACULTURE — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.15, table row 3; course cell: FISHERIESAND AQUATICRESOURCES MANAGEMENT: UMUDIKE FISHERIES TECHNOLOGY AGRIC.COOPERATIVE MANAGEMENT FISHERIESAND AQUACULTURE: AAUA ABU ADSU AKSU AUGUSTINE BAYERO BOUEDST CALABAR COOU DOU EBSU FED-DUTSE FED-DUTSINMA; Agriculture.pdf, PDF p.52, table row 3; course cell: AQUACULTUREAND FISHERIES MANAGEMENT FUNAAB IBADAN KWASU LASUSTECH FISHERIESAND AQUACULTURE TECHNOLOGY FUTA FUTO FISHERIES/FORESTRY /WILDLIFE FUA-ZURU; Sciences.pdf, PDF p.229, table row 4; course cell: MARINEBIOLOGY& FISHERIES WESLEYUNI MARINEBIOLOGY AKSU LAGOS FISHERIESAND AQUACULTURE CUAB LAUTECH OCEANOGRAPHY AKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N077. FORENSIC SCIENCE — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: sciences_offerings.json
- Current catalogue/source text: UTME: (i) FUTA requires five (5) five SSC credit passes or its equivalent at a maximum of two (2) sittings in the following subjects: English Language, Mathematics, Physics, Chemistry, Biology/Agricultural Science. (ii) OAU accepts Physics or Biology. (iii) ABSU requires 'O' Level credit pass in Physics. (iv) IMSU and COOU accept 'O' Level pass in English Language. (v) UMUDIKE same as in Food Science and Technology. (vi) NDU requires five (5) 'O' Level credit passes at not more than two (2) sittings. (vii) CRUTECH- Same as Biological Science. (viii) AJAYI requires five (5) 'O' Level credit passes which must include English language, Mathematics, Chemistry, Physics, and Biology at one (1) sitting or six (6) 'O' Level credit passes at not more than two (2) sittings. (ix) MAIDUGURI accepts 'O' Level passes in English Language and Mathematics. (x) CUAB accepts 'O' Level credit pass in Agricultural Science in lieu of Biology. (xi) EBSU requires 'O' Level credit pass in Mathematics or Physics. (xii) BELLS require five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics, Biology/Geography/Further Mathematics/Agricultural Science. (xiii) REDEEMER'S requires five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and Biology/Agricultural Sciences. (xiv) WESTERN-DEL requires five (5) 'O' Level credit passes which must include Chemistry, English Language, Biology, Mathematics and Physics. (xv) PLASU – Same as in Chemistry. (xvi) GOUU accepts 'O' Level credit pass in any other Science subject in lieu of Physics. (xvii) KWASU accepts 'O' Level credit passes in Further Mathematics and Agricultural Science. (xviii) RENAISSANCE requires (5) five 'O' Level credit passes at not more than two (2) sittings. (xix) MAKURDI - Candidates seeking admission into any of these programmes must possess five (5)'O' Level credit passes from one (1) examination body (i.e. either WAEC or NECO) and obtained at not more than two (2) sittings. The department does not accept the combination of both WAEC and NECO. Students of the University of Agriculture, Makurdi Pre-degree Remedial Science Programme who pass their end of session examinations are considered for admission on the condition that they also pass the UTME. NOTE: Agricultural Science and Health Science shall not be accepted in place of Biology. Further Mathematics shall not be accepted in place of Physics or Mathematics. (xx) SAU accepts 'O' Level credit passes in Technical Drawing, Agricultural Science or Geography in lieu of Physics. (xxi) UMYUK requires five (5) 'O' Level credit passes at not more than two (2) sittings. (xxii) SOUTHWESTERN – Same as Microbiology. (xxiii) LANDMARK accepts in lieu of Physics 'O' Level credit passes in any of the following subjects: Further Mathematics, Technical Drawing, Agricultural Science, Food and Nutrition. (xxiv) SOSU accepts HND lower credit or ND upper credit in Science Laboratory Technology, Food Science Technology or its equivalent. (xxv) ODUDUWA accepts 'O' Level credit pass in Agricultural Science or Health Science in place of Biology. (xxvi) FED-DUTSINMA accepts Five `O' level Credits including: English Language, Mathematics, Physic, Chemistry and Biology. (xxvii) UNIKINGS accepts five (5) credits at SSC in English Language, Chemistry, Physics, Mathematics and Biology. (xxviii) EUI requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Chemistry, Physics and Biology at not more than two (2) sittings. (xxix) DELSU requires five (5) `O' Level credits and must include English Language, Mathematics, Physics, Chemistry and Biology. (xxx) FED-GASHUA requires five (5) SSC credit passes in English, Mathematics, Biology, Chemistry, Physics. (xxxi) AAUA requires five (5) `O' Level credit passes to include English Language, Biology, Chemistry, Physics and Mathematics. (xxxii) FED-DUTSE requires five (5) 'O' Level credit passes at SSC level or its equivalent to include Englsih Language, Mathematics, Biology, Chemistry and Physics. (xxxiii) RSU requires five (5) 'O' Level credit passes to include English Language, Mathematics, Biology, Physics and Chemistry. (xxxiv) MOUNTAIN TOP requires five (5) credit passes at SSC or its equivalent to include English Language, Mathematics, Biology, Chemistry and Physics at not more than two (2) sittings. (xxxv) FUTO requires five (5) `O' level credit passes in English Language, Chemistry, Mathematics, Physics and Biology in not more than two (2) sittings. (xxxvi) ILORIN requires five (5) `O' Level Credit passes in English Language, Mathematics, Physics, Chemistry and Biology. (xxxvii) FED-WUKARI requires Candidates must obtain Five (5) Credits at not more than two sittings including English Language, Mathematics, Chemistry, Biology and any one from the following subjects; Physics/Agricultural Science/Health Science/Animal Husbandry obtained from Senior School Certificate(SSCE), National Examination Council(NECO), National Business and Technical Examination Board(NABTEB) or its equivalent. (xxxviii) CARITAS requires Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or Agricultural Science. (xxxix) MAUTY requires Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Physics and Biology. (xl) LAGOS requires Five O/Level credit passes in English Language, Mathematics, Biology, Chemistry and Physics. (xli) FED-LOKOJA requires Five (5) SSC credit passes to include English Language, Mathematics, Physics, Chemistry and Biology. (xlii) ABU requires Five `O' level credit passes in English Language, Mathematics, Biology, Chemistry and Physics. (xliii) PHC requires Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Physics and Biology. (xliv) FED-LAFIA requires Five (5) Credit passes at SSCE, GCE, NECO and NABTEB O' Level examination in Mathematics, English Language, Biology, Chemistry and Physics in not more than two sittings. (xlv) FED-KASHERE accepts Five credit passes at SSCE (or its equivalent) in English, Mathematics, Chemistry, Physics and Biology. (xlvi) KASU accepts Five `O' level credit passes to include English Language, Mathematics, Biology, Chemistry and Physics. (xlvii) LANDMARK accepts Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology and one of the following Physics, Agricultural Science, Food and nutrition.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.10, table row 3; course cell: FORENSICSCIENCE: ADUN APU AVE-MARIA BAYERO CCU FUTO HUSTECH HUDA KHAIRUN LCITY MAIDUGURI OOU PETER-UNI PHOENIX POL-ACAD PRIME-UNI UNINIGER UNIZIK TECH-IBADAN WIGWE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N078. FORENSIC SCIENCE — UTME

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.10, table row 3; course cell: FORENSICSCIENCE: ADUN APU AVE-MARIA BAYERO CCU FUTO HUSTECH HUDA KHAIRUN LCITY MAIDUGURI OOU PETER-UNI PHOENIX POL-ACAD PRIME-UNI UNINIGER UNIZIK TECH-IBADAN WIGWE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N079. Farm Management & Agric. Extension — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology/Agricultural Science and one of Geography, Physics and Economics (shares requirements with Agricultural Economics umbrella block).
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N080. Film and Video Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include Mathematics, English Language, Literature in English and any two (2) subjects in Science and any other subject.
- Candidate brochure locations: Social Management Science.pdf, PDF p.69, table row 1; course cell: DELSUT NILE BROADCASTJORNALISM CANADIAN-UNI NOUN-ELUON FILMANDVIDEOSTUDIES WESTERN-DEL FILMSTUDIESAND PRODUCTION KWASU FILMPRODUCTION CCU NOUN-ELUON PHC FILMANDMULTIMEDIA STUDIES ABUJA HENSARD IMSU PAN-ATLANTIC PHILOMATH DELSU DELSUT
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N081. Film and Video Studies — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: English, and any other subjects in Arts or Social Science.
- Candidate brochure locations: Social Management Science.pdf, PDF p.69, table row 1; course cell: DELSUT NILE BROADCASTJORNALISM CANADIAN-UNI NOUN-ELUON FILMANDVIDEOSTUDIES WESTERN-DEL FILMSTUDIESAND PRODUCTION KWASU FILMPRODUCTION CCU NOUN-ELUON PHC FILMANDMULTIMEDIA STUDIES ABUJA HENSARD IMSU PAN-ATLANTIC PHILOMATH DELSU DELSUT
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N082. Finance — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.5, table row 3; course cell: PHILOMATH PRIME-UNI PLASU RSU SAM-MARIS SAU TAU TASUED UAGRIC-IMO UDA UDU UNI-ILESA UNIOSUN UNIZIK UNN UNINIGER uoo UYO VISION-UNI WELLSPRING WESTERN-DEL ACCOUNTINGAND FINANCE; Administration.pdf, PDF p.12, table row 3; course cell: NEWGATE NOUN-ELUON OOU PAUL PHC PHOENIX RSU TANSIAN UDA UDU UNIOSUN UNIZIK UNN UYO WELLSPRING WESTERN-DEL FINANCE AUE AUN BSU CRAWFORD EL-AMIN FED-OYEEKITI KASU-KABBA LAGOS WIGWE; Social Management Science.pdf, PDF p.3, table row 3; course cell: ACCOUNTINGAND FINANCE FEDOTUOKE ACCOUNTING AAU ABUAD ACHIEVERS ADSU AFIT-DEG AJAYI AKSU AL-HIKMAH AL-QALAM ANCHOR-UNI ARTHUR-JARVIS ATIBA AUCHIPOLY-DEG AUE AUGUSTINE BABCOCK BAUK BAYERO BAZE; Social Management Science.pdf, PDF p.7, table row 1; course cell: ACTUARIALSCIENCE ABU BENIN CUST DOU FED-DUTSE LASUSTECH LAPAI PC-UNI SALEM FINANCE ILORIN MOUNTAINTOP NOVENA PAN-ATLANTIC BUSINESS MANAGEMENT/ MANAGEMENTSCIENCE BAZE CALABAR
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N083. Finance and Financial Technology — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.13, table row 3; course cell: FINANCEANDINVESTMENT PRIME-UNI WESLEYUNI FINANCEANDFINANCIAL TECHNOLOGY WIGWE TAXATION AVE-MARIA APU ALETHEIA BAYERO BSU CUN HAVILLA HUDA ISTIQAMA JEWEL KWASU LASU OOU PRIME-UNI SAM-MARIS UAGRIC-IMO UDU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N084. Finance and Investment — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.13, table row 3; course cell: FINANCEANDINVESTMENT PRIME-UNI WESLEYUNI FINANCEANDFINANCIAL TECHNOLOGY WIGWE TAXATION AVE-MARIA APU ALETHEIA BAYERO BSU CUN HAVILLA HUDA ISTIQAMA JEWEL KWASU LASU OOU PRIME-UNI SAM-MARIS UAGRIC-IMO UDU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N085. Fine Art/Fine and Applied Arts — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Fine Arts and any other subjects; or Social Science subjects
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N086. Fisheries — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Biology, Chemistry, Mathematics and any other subject. 'O' Level pass in Physics is required.
- Candidate brochure locations: Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.6, table row 3; course cell: (v)Agronomy IMSU withoptionsin: (a) CropScienceand Biotechnology b) Agric.Economicsand RuralDev.andExtension c) SoilScienceand Environmental Management. d) AnimalScienceand Fisheries LANDMARK MAIDUGURI PHC MAKURDI MC-IBRU (GeneralAgriculture) MINNA NOUN-ELUON UAGRIC-IMO UDA UDU UMUDIKE with options at the final; Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Agriculture.pdf, PDF p.9, table row 3; course cell: (a)SoilScience (b)Agronomy(c)CropSc. (d)CropProtection (e)Agric. Economics (f)AnimalScience BOWEN withoptionsin: (i)Agric.Economics& Farm Mgt. (ii)Agric.Ext.&Rural Dev. (iii)FoodScience&Tech. (iv)ForestryandWood Tech. (v)AnimalSc.&Fisheries Mgt (vi)CropProduction (vii)HomeScience&Mgt. KSUSTA LAPAI LASU LAUTECH withoptionsin: Agric.Economics.,Agric. Ext.&RuralDevand AgriculturalProduction & RenewableResources; Agriculture.pdf, PDF p.13, table row 4; course cell: FISHERIES MANAGEMENT RSU FISHERIES; Agriculture.pdf, PDF p.14, table row 3; course cell: BENIN CALABAR CRUTECH DELSU EKSU IBADAN KSUSTA KWASU LAPAI LASU MAIDUGURI MAUTY NDU NASARAWA OOU OAUSTECH PHC UDU WATERRESOURCES, AQUACULTUREAND FISHERIES TECHNOLOGY MINNA; Agriculture.pdf, PDF p.15, table row 3; course cell: FISHERIESAND AQUATICRESOURCES MANAGEMENT: UMUDIKE FISHERIES TECHNOLOGY AGRIC.COOPERATIVE MANAGEMENT FISHERIESAND AQUACULTURE: AAUA ABU ADSU AKSU AUGUSTINE BAYERO BOUEDST CALABAR COOU DOU EBSU FED-DUTSE FED-DUTSINMA; Agriculture.pdf, PDF p.39, table row 3; course cell: UNN withoptionsin: Animal Production, Animal Nutrition, Animal BreedingandPhysiology AKSU EBSU TSUJ UDA UNIOSUN UNIZIK UYO ANIMAL SCIENCE AND FISHERIES MANAGEMENT ESUTECH ANIMAL SCIENCE AND TECHNOLOGY FUTO (i) Diary&Meat Science (ii) Animal Genetics & Breeding (iii) Animal Production & Management; Agriculture.pdf, PDF p.52, table row 3; course cell: AQUACULTUREAND FISHERIES MANAGEMENT FUNAAB IBADAN KWASU LASUSTECH FISHERIESAND AQUACULTURE TECHNOLOGY FUTA FUTO FISHERIES/FORESTRY /WILDLIFE FUA-ZURU; Sciences.pdf, PDF p.79, table row 4; course cell: FISHERIES OAUSTECH LAGOS; Sciences.pdf, PDF p.229, table row 4; course cell: MARINEBIOLOGY& FISHERIES WESLEYUNI MARINEBIOLOGY AKSU LAGOS FISHERIESAND AQUACULTURE CUAB LAUTECH OCEANOGRAPHY AKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N087. Food Science and Engineering — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: i. Mathematics, Chemistryand Physicsor Biology.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N088. Food Technology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N089. Food Technology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: engineering_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N090. Food Technology — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: i. Mathematics, Chemistryand Physicsor Biology.
- Candidate brochure locations: Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Engineering _ Enviromental _ Technology.pdf, PDF p.76, table row 3; course cell: MOUNTAINTOP MUDIAME OFFA-DEG OAU TECH-IBADAN UAGRIC-IMO UNN WESLEYUNI FOODSCIENCEAND ENGINEERING LAUTECH FOODTECHNOLOGY BELLS IBADAN FOODSCIENCEWITH BUSINESS BELLS BIOTECHNOLOGY; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N091. Forestry and Fisheries — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.1, table row None; course cell: 42 Forestry and Fisheries
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N092. Forestry and Fisheries — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.1, table row None; course cell: 42 Forestry and Fisheries
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N093. Forestry and Fisheries — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: agriculture_offerings.json
- Current catalogue/source text: as in Agricultural Economics and Extension
- Candidate brochure locations: Agriculture.pdf, PDF p.1, table row None; course cell: 42 Forestry and Fisheries
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N094. French and German/Russian — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N095. French and German/Russian — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N096. Genetics and Biotechnology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.19, table row 3; course cell: i.Botany ii.Microbiology iii.Geneticsand Biotechnology iv.Zoology BSU withoptionsin:Biology COOU CRUTECH withoptionsin: i).Biology ii.Microbiology EKSU FUNAAB withoptionsin: Botany& Zoology FUTO GSU GOUU (withoptionsin i.Biotechnology ii.Microbiology HUSTECH; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N097. Genetics and Biotechnology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.19, table row 3; course cell: i.Botany ii.Microbiology iii.Geneticsand Biotechnology iv.Zoology BSU withoptionsin:Biology COOU CRUTECH withoptionsin: i).Biology ii.Microbiology EKSU FUNAAB withoptionsin: Botany& Zoology FUTO GSU GOUU (withoptionsin i.Biotechnology ii.Microbiology HUSTECH; Sciences.pdf, PDF p.113, table row 3; course cell: PRU SAISA SALEM TOPFAITH TRINITY UAGRIC-IMO UDA UNIKINGS UNIOSUN VISION-UNI WESTERN-DEL BIOTECHNOLOGYAND FOODTECHNOLOGY LASUSTECH GENETICSAND BIOTECHNOLOGY CALABAR AKSU SUMAS UNN ECOLOGY BAUCHI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N098. Geography — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Geography and one (1) other science subject. Mathematics, Geography and any other two (2) Science subjects.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.121, table row 5; course cell: GEOGRAPHY FED-KASHERE FED- LAFIA FED-LOKOJA AEFUNA; Education.pdf, PDF p.119, table row 1; course cell: EKSU RSU withoptionsin:Biology,Botany, Chemistry,Geography/Physics, Mathematics,Physics,Environmental EducationandIntegratedScience. TSUJ UNN offersthecourseasEducation Science withoptionin EducationBiology EducationChemistry EducationIntegratedScience. EducationMathematics EducationPhysics EducationStatistics MINNA withoptionsin:Biology, Chemistry,Mathematics,Physicsand Geography/PhysicsEducation. KWASU UYO SCIENCEEDUCATION YSU PHC withoptionsinPhysics,Chemistry,; Education.pdf, PDF p.141, table row 1; course cell: B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience CALABAR (offersthecourseasEducation FoundationandGuidanceand Counselling) EBSU (offersthecoursewithoptionsin i)EducationAdministration,Planning andSupervision ii)GuidanceandCounselling ESUTECH LASU NDU (withoptionsin: (i)EducationalAdministration (ii)GuidanceandCounseling (iii)AdultCommunityEducation (iv)PrimaryEducationwithteaching subjectsinEnglishLanguage,Fine andAppliedArts,French,History, ReligiousStudies,Biology,Chemistry, Mathematics,Physics,Economics, Geography/Physics,PoliticalScience, SocialStudies,PhysicalEducation, HealthEducation. UNIZIK; Education.pdf, PDF p.142, table row 1; course cell: EDUCATIONFOUNDATIONSAND MANAGEMENT EKSU AAU (withoptionsin ReligiousStudies ii)French iii)PoliticalScience iv)EducationalAdministrationand Supervision v)GuidanceandCounseling vi)EconomicsEducation vii)Geography/PhysicsEducation ii)French iii)History B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience FOUNTAIN PHC; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR; Education.pdf, PDF p.145, table row 1; course cell: (vi)HealthEducation. SocialScience (i)Geography/Physics (ii)Economics (iii) PoliticalScience ArtsOptions (x)EnglishLanguage (xi)French (xii)ReligiousStudies (xiii)History (xiv)FineandAppliedArt. AAU (withoptionsin:) (i)Biology (ii)Chemistry (iii)Mathematics iv)Physics v)Pre-PrimaryandPrimaryEducation EDUCATION PSYCHOLOGY AND CURRICULUMSTUDIES BENIN CURRICULUMSTUDIES EKSU LASU SAUED SSUET UDU UYO; Education.pdf, PDF p.147, table row 1; course cell: PEACELANDUNI IAUED REDEEMERS SAUED SACOEDB.ED SSUET EKSU OYOSPECIAL SOSU TASUED (WithTeachingsubjectoptionsin: Yoruba,EnglishLanguage,French History, Political Science, Social Studies, Islamic Studies, Geography/Physics, Economics, C.R.S, Chemistry, Biology, Mathematics, Health Education, Physics and Integrated Science). LASU MOCPEN NASARAWA COOU AEFUNA FED-OYEEKITI IAUED KWARARAFA KWASU MOCPEN OAU OOU RSU; Education.pdf, PDF p.176, table row 1; course cell: BENIN ADULTEDUCATION/ECONOMICS ANDSTATISTICS BENIN ADULTEDUCATION/POLITICAL SCIENCEANDPUBLIC ADMINISTRATION BENIN ADULTEDUCATION/GEOGRAPHY ANDREGIONALPLANNING BENIN ADULTANDNON-FORMAL EDUCATION PHC (withoptionsin: EnglishLanguage,History,Christian ReligiousStudies,Economics, Geography/Physics,Chemistry, Biology,MathematicsandPhysics. ADULTANDCOMMUNITY EDUCATION; Education.pdf, PDF p.185, table row 2; course cell: EDUCATIONANDSOCIALSCIENCE CALABAR withoptionsin: Edu.Geography Edu.PoliticalScience Edu.Economics EBSU; Education.pdf, PDF p.186, table row 1; course cell: Withoptionsin:(a)Economics(b)Pol. Science(c)Geography/Physics NDU PHC withoptionsinEconomics, Accounting,PoliticalScienceand Geography/Physics. UNN withoptionsin: Edu.Geography/Physics Edu.PolScience Edu.SocialStudies Edu.Economics UYO; Education.pdf, PDF p.196, table row 1; course cell: ECONOMICS /GEOGRAPHY/PHYSICS MAIDUGURI; Engineering _ Enviromental _ Technology.pdf, PDF p.106, table row 4; course cell: GEOGRAPHY KUST MAUTY GEOGRAPHYAND PLANNING JOS GEOGRAPHYAND REGIONALPLANNING BENIN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N099. Geography and Environmental Management — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.91, table row 3; course cell: OOU GEOGRAPHY ABU ADSU BAYERO GSU IBADAN KASU KASU-KABBA MINNA NASARAWA UMYUK Offersthecoursewith optionsin: i.Science ii.Humanities GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT GOUU; Social Management Science.pdf, PDF p.54, table row 1; course cell: YSU GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT ILORIN IMSU PHC GEOGRAPHYAND METEOROLOGY ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N100. Geography and Environmental Management — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.91, table row 3; course cell: OOU GEOGRAPHY ABU ADSU BAYERO GSU IBADAN KASU KASU-KABBA MINNA NASARAWA UMYUK Offersthecoursewith optionsin: i.Science ii.Humanities GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT GOUU; Social Management Science.pdf, PDF p.54, table row 1; course cell: YSU GEOGRAPHYAND ENVIRONMENTAL MANAGEMENT ILORIN IMSU PHC GEOGRAPHYAND METEOROLOGY ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N101. Geography and Geosciences — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: sciences_offerings.json
- Current catalogue/source text: Five 'O' Level credit passes. OAU: English Language, Chemistry, Biology/Further Mathematics, Mathematics and Physics. FUTA: English Language, Physics, Mathematics, Chemistry and one of Biology/Geography/Technical Drawing (max two sittings). FUPRE: English Language, Biology, Mathematics, Physics and Chemistry. FED-OYE EKITI: English, Mathematics, Physics and Chemistry. OAUSTECH: English Language, Physics, Chemistry, Mathematics and Biology/Geography. LAGOS: English Language, Mathematics, Physics, Chemistry and Biology. ILORIN: English Language, Physics, Mathematics, Chemistry and one of Further Mathematics/Biology/Geography. FED-KASHERE: English, Mathematics, Physics, Chemistry and any of Further Mathematics/Geography/Biology. (heading begins before line range; this programme is partial)
- Candidate brochure locations: Sciences.pdf, PDF p.154, table row 3; course cell: GEOSCIENCE AKSU GEOGRAPHY AND GEOSCIENCES JABU EARTHSCIENCE LAUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N102. Geography and Geosciences — UTME

- Current status: needs_review
- Review reason: institutional_or_unrecognized_prose
- Source index: sciences_offerings.json
- Current catalogue/source text: OAU require Mathematics, Physics and Chemistry; CALABAR does not accept Biology; FUPRE requires Physics, Mathematics and Chemistry; FED-OYE EKITI requires Physics and Mathematics, Chemistry or Biology; OAUSTECH requires Physics, Mathematics and any one of Chemistry, Biology and Geography; FUTA requires Physics, Mathematics and Chemistry; MOUNTAIN TOP requires Physics, Mathematics and any one of Chemistry/Biology/Agricultural Science/Geography; FUPRE requires Mathematics, Chemistry and Physics; ILORIN requires Physics, Mathematics and Chemistry; LAGOS requires English Language, Mathematics, Physics and Chemistry; FED-KASHERE requires Physics, Chemistry and Mathematics.
- Candidate brochure locations: Sciences.pdf, PDF p.154, table row 3; course cell: GEOSCIENCE AKSU GEOGRAPHY AND GEOSCIENCES JABU EARTHSCIENCE LAUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N103. Geology and Mining — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.74, table row 3; course cell: EUI FUTA JOS GEOLOGYANDMINING ABUJA; Sciences.pdf, PDF p.83, table row 3; course cell: ZAMFARA GEOLOGICALSCIENCES UNIZIK GEOLOGYANDMINERAL SCIENCES CRAWFORD GEOLOGYAND GEOPHYSICS AEFUNA GEOLOGYANDAPPLIED GEOPHYSICS HENSARD GEOLOGYANDMINING ESUTECH GOUU JOS NASARAWA UNI-ILESA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N104. Geology and Mining — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.74, table row 3; course cell: EUI FUTA JOS GEOLOGYANDMINING ABUJA; Sciences.pdf, PDF p.83, table row 3; course cell: ZAMFARA GEOLOGICALSCIENCES UNIZIK GEOLOGYANDMINERAL SCIENCES CRAWFORD GEOLOGYAND GEOPHYSICS AEFUNA GEOLOGYANDAPPLIED GEOPHYSICS HENSARD GEOLOGYANDMINING ESUTECH GOUU JOS NASARAWA UNI-ILESA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N105. Geophysics — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.27, table row 3; course cell: NDA NDU NOUN-ELUON MINNA MKAR NASARAWA NAUB NOVENA OAU ODUDUWA OSUMS OOU withoptionsin:Geophysics, MedicalHealthPhysicsand PhysicswithElectronics. OAUSTECH (withoptionsin: (i)Physics;(ii)Electronics; (iii)SolidState. PAUL PHC withoptionsin:i)Applied Geophysics;ii)Elect/Elect. PLASU; Sciences.pdf, PDF p.45, table row 4; course cell: INDUSTRIALPHYSICS WITHRENEWABLE ENERGY COVENANT APPLIEDAND RENEWABLEENERGY ADUN INDUSTRIALPHYSICS WITHAPPLIED GEOPHYSICS COVENANT INDUSTRIALPHYSICS WITHELECTRONICSAND ITAPPLICATION COVENANT; Sciences.pdf, PDF p.81, table row 3; course cell: FED-LOKOJA FED-KEBBI FED-GUSAU AEFUNA FED-OYEEKITI FED-OTUOKE FUPRE FUTO withoptionsin: (i)Geology(ii)Geophysics (iii)Geochemistry (iv)RemoteSensing (v)Mineralogy (v) Meteorology (vii)Hydrology. GREGORY GSU IBADAN ILORIN KASU KASU-KABBA PAAU KUST LAGOS; Sciences.pdf, PDF p.83, table row 3; course cell: ZAMFARA GEOLOGICALSCIENCES UNIZIK GEOLOGYANDMINERAL SCIENCES CRAWFORD GEOLOGYAND GEOPHYSICS AEFUNA GEOLOGYANDAPPLIED GEOPHYSICS HENSARD GEOLOGYANDMINING ESUTECH GOUU JOS NASARAWA UNI-ILESA; Sciences.pdf, PDF p.153, table row 3; course cell: ILORIN MINNA OAU OOU REDEEMERS UMYUK GEOPHYSICS AAU AAUA AUE BAUCHI BIU EKSU FED-OYEEKITI FUPRE KASU LAGOS MOUNTAINTOP OAUSTECH UNIZIK UYO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N106. Geophysics — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.27, table row 3; course cell: NDA NDU NOUN-ELUON MINNA MKAR NASARAWA NAUB NOVENA OAU ODUDUWA OSUMS OOU withoptionsin:Geophysics, MedicalHealthPhysicsand PhysicswithElectronics. OAUSTECH (withoptionsin: (i)Physics;(ii)Electronics; (iii)SolidState. PAUL PHC withoptionsin:i)Applied Geophysics;ii)Elect/Elect. PLASU; Sciences.pdf, PDF p.45, table row 4; course cell: INDUSTRIALPHYSICS WITHRENEWABLE ENERGY COVENANT APPLIEDAND RENEWABLEENERGY ADUN INDUSTRIALPHYSICS WITHAPPLIED GEOPHYSICS COVENANT INDUSTRIALPHYSICS WITHELECTRONICSAND ITAPPLICATION COVENANT; Sciences.pdf, PDF p.81, table row 3; course cell: FED-LOKOJA FED-KEBBI FED-GUSAU AEFUNA FED-OYEEKITI FED-OTUOKE FUPRE FUTO withoptionsin: (i)Geology(ii)Geophysics (iii)Geochemistry (iv)RemoteSensing (v)Mineralogy (v) Meteorology (vii)Hydrology. GREGORY GSU IBADAN ILORIN KASU KASU-KABBA PAAU KUST LAGOS; Sciences.pdf, PDF p.83, table row 3; course cell: ZAMFARA GEOLOGICALSCIENCES UNIZIK GEOLOGYANDMINERAL SCIENCES CRAWFORD GEOLOGYAND GEOPHYSICS AEFUNA GEOLOGYANDAPPLIED GEOPHYSICS HENSARD GEOLOGYANDMINING ESUTECH GOUU JOS NASARAWA UNI-ILESA; Sciences.pdf, PDF p.153, table row 3; course cell: ILORIN MINNA OAU OOU REDEEMERS UMYUK GEOPHYSICS AAU AAUA AUE BAUCHI BIU EKSU FED-OYEEKITI FUPRE KASU LAGOS MOUNTAINTOP OAUSTECH UNIZIK UYO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N107. German — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.48, table row 3; course cell: PHC POL-ACAD REDEEMERS SAU TASUED TSUJ UDA UDU UMYUK UNIOSUN UNIZIK UNN UYO PORTUGUESE/ENGLISH LASU MODERNANDEUROPEAN LANGUAGES UNIZIK EUROPEANLANGUAGES DOU WithoptionsinSpanish& German; Arts _ Humanities.pdf, PDF p.84, table row 5; course cell: GERMAN IBADAN LAGOS OAU; Arts _ Humanities.pdf, PDF p.85, table row 3; course cell: UNN PORTUGUESE: OAU RUSSIAN IBADAN LAGOS UNN RUSSIANWITH FRENCH/GERMAN IBADAN; Arts _ Humanities.pdf, PDF p.120, table row 4; course cell: B.A.(SINGLEAND COMBINEDHONS)IN MODERNLANGUAGES UNN withoptionsin: French,German& Russian PROGRAMMEA Four Year Degree Programme in French/German & French/Russian. PROGRAMMEB SingleHonsDegree ProgrammeinFrench, German&Russianwith SpecialRemedialCourses. CHINESESTUDIES KASU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N108. German — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.48, table row 3; course cell: PHC POL-ACAD REDEEMERS SAU TASUED TSUJ UDA UDU UMYUK UNIOSUN UNIZIK UNN UYO PORTUGUESE/ENGLISH LASU MODERNANDEUROPEAN LANGUAGES UNIZIK EUROPEANLANGUAGES DOU WithoptionsinSpanish& German; Arts _ Humanities.pdf, PDF p.84, table row 5; course cell: GERMAN IBADAN LAGOS OAU; Arts _ Humanities.pdf, PDF p.85, table row 3; course cell: UNN PORTUGUESE: OAU RUSSIAN IBADAN LAGOS UNN RUSSIANWITH FRENCH/GERMAN IBADAN; Arts _ Humanities.pdf, PDF p.120, table row 4; course cell: B.A.(SINGLEAND COMBINEDHONS)IN MODERNLANGUAGES UNN withoptionsin: French,German& Russian PROGRAMMEA Four Year Degree Programme in French/German & French/Russian. PROGRAMMEB SingleHonsDegree ProgrammeinFrench, German&Russianwith SpecialRemedialCourses. CHINESESTUDIES KASU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N109. Government and Public Administration — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Social Management Science.pdf, PDF p.90, table row 1; course cell: ABUAD BOUEDST CALABAR SAM-MARIS UDA UNI-ILESA VENITE VERITAS GOVERNMENT AND PUBLICADMINISTRATION ABSU BAZE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N110. Government and Public Administration — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: UTME SUBJECTS
- Candidate brochure locations: Social Management Science.pdf, PDF p.90, table row 1; course cell: ABUAD BOUEDST CALABAR SAM-MARIS UDA UNI-ILESA VENITE VERITAS GOVERNMENT AND PUBLICADMINISTRATION ABSU BAZE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N111. HOME SCIENCE — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.74, table row 3; course cell: FUNAAB MAKURDI NASARAWA RSU UDA HOMESCIENCE, NUTRITIONAND DIETETICS MKAR HOMESCIENCE DOU PAAU UNN; Sciences.pdf, PDF p.231, table row 3; course cell: Health (ii) Conservation Biology HOMESCIENCE PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N112. HOME SCIENCE — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.74, table row 3; course cell: FUNAAB MAKURDI NASARAWA RSU UDA HOMESCIENCE, NUTRITIONAND DIETETICS MKAR HOMESCIENCE DOU PAAU UNN; Sciences.pdf, PDF p.231, table row 3; course cell: Health (ii) Conservation Biology HOMESCIENCE PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N113. HOME SCIENCE — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, UTME Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French.
- Candidate brochure locations: Agriculture.pdf, PDF p.74, table row 3; course cell: FUNAAB MAKURDI NASARAWA RSU UDA HOMESCIENCE, NUTRITIONAND DIETETICS MKAR HOMESCIENCE DOU PAAU UNN; Sciences.pdf, PDF p.231, table row 3; course cell: Health (ii) Conservation Biology HOMESCIENCE PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N114. HUMAN BIOLOGY — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: three (3) relevant Science subject. Biology, Chemistry and Physics or Mathematics.
- Candidate brochure locations: Sciences.pdf, PDF p.220, table row 3; course cell: TRINITY UAGRIC-IMO UDA UDU UMYUK UNI-AFRICA UNIKINGS UOO WELLSPRING WESTLAND YSU ZAMFARA HUMANBIOLOGY ABUAD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N115. Home Economics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Chemistry, Biology/Agricultural Science, Mathematics, Physics, English Language and any one of Nutrition, Fine Arts, Textile, Construction, Technical Drawing, Basic Electricity, Basic Catering and Food Services, Bakery and Confectioneries, General Metal Work, Men Garment Construction and Finishing, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing, Ladies Garment Construction and Finishing.
- Candidate brochure locations: Agriculture.pdf, PDF p.70, table row 4; course cell: HOMEECONOMICS BELLS FUNAAB ILORIN LASUED MAKURDI MAUTY OAU OOU UMUDIKE UNIOSUN UYO NUTRITIONAND CONSUMERS SERVICES OAU; Agriculture.pdf, PDF p.71, table row 3; course cell: HOMEECONOMICS ANDFOOD MANAGEMENT WESLEYUNI HOMEECONOMICS ANDMANAGEMENT/ ECONOMICS FED-GASHUA HOTELMANAGEMENT ANDTOURISM BIU FED-WUKARI GREGORY UMUDIKE UNI-AFRICA WESLEYUNI HOTELAND CATERING MANAGEMENT NOUN; Education.pdf, PDF p.12, table row 2; course cell: VOCATIONAL ANDTECHNICAL EDUCATION AAU (withoptionsin: i)AccountingEducation ii)BusinessEducation iii)HomeEconomics; Education.pdf, PDF p.14, table row 1; course cell: (iii)OfficeManagement TechnologyEducation (iv)HomeEconomics; Education.pdf, PDF p.101, table row 2; course cell: VOCATIONALEDUCATION BAUCHI MAUTY (withoptionsin:) AgriculturalTechnicalEducation, HomeEconomics UYO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N116. Home Economics and Food Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) credits at SSC or equivalent in English, Mathematics, Chemistry, Agricultural Science or Biology or Home Economics, and any other science subject, preferably Physics.
- Candidate brochure locations: Agriculture.pdf, PDF p.71, table row 3; course cell: HOMEECONOMICS ANDFOOD MANAGEMENT WESLEYUNI HOMEECONOMICS ANDMANAGEMENT/ ECONOMICS FED-GASHUA HOTELMANAGEMENT ANDTOURISM BIU FED-WUKARI GREGORY UMUDIKE UNI-AFRICA WESLEYUNI HOTELAND CATERING MANAGEMENT NOUN; Engineering _ Enviromental _ Technology.pdf, PDF p.141, table row 4; course cell: NUTRITION AND DIETETICS LAUTECH WESLEYUNI HOTELMANAGEMENT ANDTOURISM WESLEYUNI HOMEECONOMICSAND FOODMANAGEMENT WESLEYUNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N117. Home Economics and Hotel Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) 'O' Level NTC/NBC credit passes or TC II merit including English Language, Mathematics, Home Economics, Biology and Chemistry.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N118. Home Science & Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including Chemistry, Biology/Agricultural Science, Mathematics and at least 'O' Level pass in English Language and Physics, and any one of General Metal Work, General Wood Work, Building/Engineering Drawing, Furniture Design and Construction, Upholstery Design and Construction, Spray Painting and Period Furniture, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing and Basic Electricity.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N119. Home Science & Management — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Chemistry; Biology/Agricultural Science; Physics/Mathematics or one (1) social science subject (Economics or Geography)
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N120. Home Science, Nutrition and Dietetics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: and at least 'O' Level pass in English LanguageandPhysics. General Metal Work, General Wood Work, Building/Engineering Drawing, Furniture Design and Construction, Upholstery Design and Construction, Spray Painting and Period Furniture, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing and Basic Electricity.
- Candidate brochure locations: Agriculture.pdf, PDF p.74, table row 3; course cell: FUNAAB MAKURDI NASARAWA RSU UDA HOMESCIENCE, NUTRITIONAND DIETETICS MKAR HOMESCIENCE DOU PAAU UNN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N121. Horticulture — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.4, table row 3; course cell: (c) CropProductionand Protection (d) SoilScience FED-GASHUA Withoptionsin: (a) AgricEconomics& Extension (b) Agronomy (c) AnimalScience AEFUNA FED-LOKOJA FEDOYE-EKITI Withoptionsin: (a) Agric.Economics andExtension (b) AnimalProduction andHealth (c) SoilScience (d) CropScienceand Horticulture FED-WUKARI Withoptionsin: (a) Agric. Economics/ Extension (b) Crop Production and protection; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.44, table row 3; course cell: FUNAAB LASUSTECH CROPSCIENCE DELSUT FUA-ZURU JABU RSU UDA UNN CROPSCIENCE/SOIL SCIENCE DOU CROPSCIENCEAND HORTICULTURE COOU FED-OYEEKITI CROP AND ENVIRONMENTAL PROTECTION LAUTECH MAKURDI PLANTBREEDING & SEEDTECHNOLOGY:; Agriculture.pdf, PDF p.45, table row 3; course cell: FUNAAB CROPPRODUCTION ANDSOILSCIENCE LAUTECH CROPPRODUCTION TECHNOLOGY NDU withoptionsin: (i)SoilScience (ii)EnvironmentalAgric. (iii)CropTechnology CROPSCIENCEAND TECHNOLOGY FUTO withoptionsin i) Agronomy ii) CropProduction iii) Horticulture iv) PlantBreeding v) LandUse vi) AgriculturalWater Resources Management; Agriculture.pdf, PDF p.76, table row 4; course cell: HORTICULTURE: FUNAAB MINNA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N122. Horticulture — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.4, table row 3; course cell: (c) CropProductionand Protection (d) SoilScience FED-GASHUA Withoptionsin: (a) AgricEconomics& Extension (b) Agronomy (c) AnimalScience AEFUNA FED-LOKOJA FEDOYE-EKITI Withoptionsin: (a) Agric.Economics andExtension (b) AnimalProduction andHealth (c) SoilScience (d) CropScienceand Horticulture FED-WUKARI Withoptionsin: (a) Agric. Economics/ Extension (b) Crop Production and protection; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.44, table row 3; course cell: FUNAAB LASUSTECH CROPSCIENCE DELSUT FUA-ZURU JABU RSU UDA UNN CROPSCIENCE/SOIL SCIENCE DOU CROPSCIENCEAND HORTICULTURE COOU FED-OYEEKITI CROP AND ENVIRONMENTAL PROTECTION LAUTECH MAKURDI PLANTBREEDING & SEEDTECHNOLOGY:; Agriculture.pdf, PDF p.45, table row 3; course cell: FUNAAB CROPPRODUCTION ANDSOILSCIENCE LAUTECH CROPPRODUCTION TECHNOLOGY NDU withoptionsin: (i)SoilScience (ii)EnvironmentalAgric. (iii)CropTechnology CROPSCIENCEAND TECHNOLOGY FUTO withoptionsin i) Agronomy ii) CropProduction iii) Horticulture iv) PlantBreeding v) LandUse vi) AgriculturalWater Resources Management; Agriculture.pdf, PDF p.76, table row 4; course cell: HORTICULTURE: FUNAAB MINNA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N123. Hotel Management & Tourism — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N124. Hotel Management and Tourism — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) credits at SSC or equivalent in English, Mathematics, Chemistry, Agricultural Science or Biology or Home Economics, and any other science subject, preferably Physics.
- Candidate brochure locations: Agriculture.pdf, PDF p.71, table row 3; course cell: HOMEECONOMICS ANDFOOD MANAGEMENT WESLEYUNI HOMEECONOMICS ANDMANAGEMENT/ ECONOMICS FED-GASHUA HOTELMANAGEMENT ANDTOURISM BIU FED-WUKARI GREGORY UMUDIKE UNI-AFRICA WESLEYUNI HOTELAND CATERING MANAGEMENT NOUN; Engineering _ Enviromental _ Technology.pdf, PDF p.141, table row 4; course cell: NUTRITION AND DIETETICS LAUTECH WESLEYUNI HOTELMANAGEMENT ANDTOURISM WESLEYUNI HOMEECONOMICSAND FOODMANAGEMENT WESLEYUNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N125. Human Resources Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: Administration.pdf, PDF p.31, table row 3; course cell: CRAWFORD EKSU ILORIN KASU LAGOS LASU LCITY MINILS-DEG MOUNTAINTOP UNIOSUN INDUSTRIALRELATIONS ANDHUMANRESOURCES MANAGEMENT COVENANT HUMANRESOURCES MANAGEMENT AL-ANSAR CUST ELIZADE HAVILLA MAAUN NEWGATE WELLSPRING; Social Management Science.pdf, PDF p.113, table row 2; course cell: HUMAN RESOURCES MANAGEMENT REDEEMERS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N126. ICT Engineering — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and one of Biology, Economics and Geography at not more than two (2) sittings.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N127. INFORMATION AND COMMUNICATION TECHNOLOGY — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Engineering _ Enviromental _ Technology.pdf, PDF p.137, table row 3; course cell: COVENANT NILE UNIZIK INFORMATIONAND COMMUNICATION TECHNOLOGY ABSU AFIT-DEG AKSU FUTA KSUSTA UDU; Sciences.pdf, PDF p.202, table row 3; course cell: AUN (offersthecourseasan optioninInformation Systems) INFORMATIONAND COMMUNICATION TECHNOLOGY AAUA ABUAD BABCOCK CRAWFORD DELSUT EL-AMIN JEWEL KUST MAITAMA PHILOMATH PHOENIX RHEMA SAM-MARIS SUMAS TANSIAN UNI-ILESA WIGWE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N128. INFORMATION AND COMMUNICATION TECHNOLOGY — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Engineering _ Enviromental _ Technology.pdf, PDF p.137, table row 3; course cell: COVENANT NILE UNIZIK INFORMATIONAND COMMUNICATION TECHNOLOGY ABSU AFIT-DEG AKSU FUTA KSUSTA UDU; Sciences.pdf, PDF p.202, table row 3; course cell: AUN (offersthecourseasan optioninInformation Systems) INFORMATIONAND COMMUNICATION TECHNOLOGY AAUA ABUAD BABCOCK CRAWFORD DELSUT EL-AMIN JEWEL KUST MAITAMA PHILOMATH PHOENIX RHEMA SAM-MARIS SUMAS TANSIAN UNI-ILESA WIGWE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N129. INFORMATION AND MEDIA TECHNOLOGY — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N130. INFORMATION AND MEDIA TECHNOLOGY — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N131. INFORMATION SCIENCE — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH; Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND; Sciences.pdf, PDF p.211, table row 3; course cell: MEDIATECHNOLOGY MINNA INFORMATIONAND MEDIASCIENCE KOLADAISI INFORMATIONSCIENCE UNIOSUN; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N132. INFORMATION SCIENCE — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH; Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND; Sciences.pdf, PDF p.211, table row 3; course cell: MEDIATECHNOLOGY MINNA INFORMATIONAND MEDIASCIENCE KOLADAISI INFORMATIONSCIENCE UNIOSUN; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N133. INFORMATION SCIENCE AND MEDIA STUDIES — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N134. INFORMATION SCIENCE AND MEDIA STUDIES — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N135. INFORMATION TECHNOLOGY — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.198, table row 3; course cell: SOFTWAREENGINEERING ANDDIGITAL ENTREPRENEURSHIP AVE-MARIA ROBOTICS(ARTIFICIAL INTELLIGENCE) WIGWE INFORMATION TECHNOLOGY AL-QALAM AL-ANSAR ALETHEIA AUE AUGUSTINE AUN offersthecourseas InformationSystemwith optionsin (i) Database Administration (ii) Networking (iii) Management; Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N136. INFORMATION TECHNOLOGY — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.136, table row 3; course cell: INFORMATION TECHNOLOGY BAUCHI BELLS SALEM MAUTY DATASCIENCE MINNA FORENSICSCIENCE MINNA PUBLICHEALTH MINNA FORESTRYANDWILDLIFE TECHNOLOGY MINNA INFORMATIONAND COMMUNICATION TECHNOLOGY ENGINEERING ELIZADE INFORMATIONAND COMMUNICATION ENGINEERING; Sciences.pdf, PDF p.198, table row 3; course cell: SOFTWAREENGINEERING ANDDIGITAL ENTREPRENEURSHIP AVE-MARIA ROBOTICS(ARTIFICIAL INTELLIGENCE) WIGWE INFORMATION TECHNOLOGY AL-QALAM AL-ANSAR ALETHEIA AUE AUGUSTINE AUN offersthecourseas InformationSystemwith optionsin (i) Database Administration (ii) Networking (iii) Management; Sciences.pdf, PDF p.210, table row 3; course cell: FUTA ILORIN PAAU PAUL KWASU LAGOS LAUTECH PCE-DEG RSU LIBRARYAND INFORMATION TECHNOLOGY FUTIA INFORMATIONSCIENCE ANDMEDIASTUDIES BAYERO CHRISTOPHER INFORMATIONAND
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N137. Industral Mathematics/Computer — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N138. Industral Mathematics/Computer — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N139. Industrial Microbiology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.20, table row 3; course cell: KASU MAUTY (withoptionsin) i).Botany, (ii)Zoology NDA NDU withoptionsinBiology OAUSTECH (withoptionsin:(i)Botany(ii) Zoology(iii)Industrial Microbiology RSU (offeredasAppliedBiology withoptioninBotany) UNN UNIZIK . VERITAS YSU; Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N140. Industrial Microbiology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.20, table row 3; course cell: KASU MAUTY (withoptionsin) i).Botany, (ii)Zoology NDA NDU withoptionsinBiology OAUSTECH (withoptionsin:(i)Botany(ii) Zoology(iii)Industrial Microbiology RSU (offeredasAppliedBiology withoptioninBotany) UNN UNIZIK . VERITAS YSU; Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N141. Industrial Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.25, table row 3; course cell: (withoptionsin): (i)AppliedNuclearScience (ii)IndustrialPhysics (iii)MedicalPhysics (iv)Meteorology& AtmosphericPhysics FUPRE (withoptionsin): (i) TheoreticalPhysics (ii) Physical/Electronics (iii) PhysicalandEnergy Studies GOUU GREGORY GSU GSUST HALLMARK IAUED IBADAN IGBINEDION ILORIN IMSU JABU JOS; Sciences.pdf, PDF p.29, table row 3; course cell: UNN UYO WESTERN-DEL WELLSPRING WESLEYUNI (offers the course as Physics and Industrial Physics) RHEMA YSU ZAMFARA PHYSICSWITH ELECTRONICS AAUA ACHIEVERS AFIT-DEG AJAYI AL-ANSAR AL-HIKMAH ALETHEIA ANCHOR-UNI APU ATIBA; Sciences.pdf, PDF p.33, table row 3; course cell: BAYERO NAUB WESLEYUNI ELECTRONS ZAMFARA PHYSICSWITHSOLAR ENERGY BOWEN PHYSICSANDENERGY STUDIES ACHIEVERS PHYSICS/INDUSTRIAL PHYSICS BENIN UNIZIK PHYSICSWITH; Sciences.pdf, PDF p.34, table row 3; course cell: COMPUTATIONAL MODELING CALEB PHYSICS/ASTROLOGY UNN PHYSICALSCIENCES GOUU (withoptionsin i.IndustrialPhysics ii.PhysicswithElectronics ENERGYSTUDIES SALEM; Sciences.pdf, PDF p.43, table row 4; course cell: PHYSICSANDAPPLIED PHYSICS BAUCHI INDUSTRIALPHYSICS BENIN COOU; Sciences.pdf, PDF p.45, table row 4; course cell: INDUSTRIALPHYSICS WITHRENEWABLE ENERGY COVENANT APPLIEDAND RENEWABLEENERGY ADUN INDUSTRIALPHYSICS WITHAPPLIED GEOPHYSICS COVENANT INDUSTRIALPHYSICS WITHELECTRONICSAND ITAPPLICATION COVENANT
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N142. Industrial Relations and Human Resources Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: Administration.pdf, PDF p.31, table row 3; course cell: CRAWFORD EKSU ILORIN KASU LAGOS LASU LCITY MINILS-DEG MOUNTAINTOP UNIOSUN INDUSTRIALRELATIONS ANDHUMANRESOURCES MANAGEMENT COVENANT HUMANRESOURCES MANAGEMENT AL-ANSAR CUST ELIZADE HAVILLA MAAUN NEWGATE WELLSPRING
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N143. Industrial Relations and Personnel Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: Administration.pdf, PDF p.30, table row 4; course cell: PERSONNEL MANAGEMENT GREGORY INDUSTRIALRELATIONS ANDPERSONNEL MANAGEMENT AVE-MARIA BOWEN CARITAS CLIFFORD; Social Management Science.pdf, PDF p.102, table row 3; course cell: INDUSTRIALRELATIONS ANDPERSONNEL MANAGEMENT AJAYI BENIN DOU KOMU RITMAN UNI-AFRICA INDUSTRIALRELATIONS ANDHUMANRESOURCE MANAGEMENT
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N144. Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N145. Intelligence and Security Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Social Management Science.pdf, PDF p.106, table row 1; course cell: SOSU TSUJ UDA UDU UMYUK UNIHEZ UNI-ILESA UNIOSUN UNIZIK WESTERN-DEL WESLEYUNI YSU SOCIOLOGY AND SOCIAL STUDIES DOU INTELLIGENCE AND SECURITYSTUDIES ABUAD EKSU NDA NOVENA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N146. International Studies and — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N147. International Studies and — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N148. International Studies and — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: History/Governm entandanyother two (2) subjects fromtheArtsand SocialSciences.
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N149. International Studies and Diplomacy — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: social_management_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Arts _ Humanities.pdf, PDF p.69, table row 3; course cell: COAL-CITY CROWN-HILL ELIZADE FED-KASHERE FED-WUKARI HENSARD IAUED KASU-KABBA KOLADAISI LASUED MCPHERSON OOU RSU SALEM SPIRITAN SUMMIT TASUED INTERNATIONAL STUDIES ANDDIPLOMACY BENIN BIU INTERNATIONAL RELATIONS AND DIPLOMACY; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N150. International Studies and Diplomacy — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: social_management_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Arts _ Humanities.pdf, PDF p.69, table row 3; course cell: COAL-CITY CROWN-HILL ELIZADE FED-KASHERE FED-WUKARI HENSARD IAUED KASU-KABBA KOLADAISI LASUED MCPHERSON OOU RSU SALEM SPIRITAN SUMMIT TASUED INTERNATIONAL STUDIES ANDDIPLOMACY BENIN BIU INTERNATIONAL RELATIONS AND DIPLOMACY; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N151. International Studies and Diplomacy — UTME

- Current status: empty
- Review reason: no_source_text
- Source index: social_management_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 4; course cell: INTERNATIONAL RELATIONS: OAU INTERNATIONAL RELATIONSAND STRATEGICSTUDIES NOVENA INTERNATIONAL STUDIESAND DIPLOMACY KASU; Arts _ Humanities.pdf, PDF p.69, table row 3; course cell: COAL-CITY CROWN-HILL ELIZADE FED-KASHERE FED-WUKARI HENSARD IAUED KASU-KABBA KOLADAISI LASUED MCPHERSON OOU RSU SALEM SPIRITAN SUMMIT TASUED INTERNATIONAL STUDIES ANDDIPLOMACY BENIN BIU INTERNATIONAL RELATIONS AND DIPLOMACY; Social Management Science.pdf, PDF p.116, table row 1; course cell: INTERNATIONAL STUDIESAND DIPLOMACY BENIN INTERNATIONALAND COMPARATIVEPOLITICS AUN INTERNATIONAL RELATIONSHIP& STRATEGICSTUDIES IGBINEDION NOVENA HISTORYAND INTERNATIONAL RELATIONS AL-HIKMA HISTORYAND INTERNATIONALSTUDIES ESUTECH UNIHEZ VISION-UNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N152. Islamic Law/Sharia Law — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: law_offerings.json
- Current catalogue/source text: Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N153. Library and Information Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: education_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.150, table row 2; course cell: LIBRARYSCIENCE ABSU (withanyteachingsubject.) AOCOE AUE KWASCOE MAIDUGURI MAID-SDWCH UYO LIBRARYANDINFORMATION SCIENCE AAU AAUA ABSU ABU; Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N154. Library and Information Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: education_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.150, table row 2; course cell: LIBRARYSCIENCE ABSU (withanyteachingsubject.) AOCOE AUE KWASCOE MAIDUGURI MAID-SDWCH UYO LIBRARYANDINFORMATION SCIENCE AAU AAUA ABSU ABU; Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N155. Library and Information Science — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: education_offerings.json
- Current catalogue/source text: EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23.
- Candidate brochure locations: Education.pdf, PDF p.150, table row 2; course cell: LIBRARYSCIENCE ABSU (withanyteachingsubject.) AOCOE AUE KWASCOE MAIDUGURI MAID-SDWCH UYO LIBRARYANDINFORMATION SCIENCE AAU AAUA ABSU ABU; Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH; Social Management Science.pdf, PDF p.62, table row 1; course cell: LIBRARYAND INFORMATIONSCIENCE ABUJA AJAYI AL-HIKMAH ATIBA BASU BAZE COOU DELSUT FED-DUTSINMA FED-LOKOJA AEFUNA KOLADAISI KUST MAUTY NDU PHC INFORMATIONSCIENCE ANDMEDIASTUDIES PAN-ATLANTIC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N156. Linguistics — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.7, table row 4; course cell: LINGUISTICS/ARABIC YSU; Arts _ Humanities.pdf, PDF p.27, table row 4; course cell: LINGUISTICS/EDO BENIN; Arts _ Humanities.pdf, PDF p.41, table row 4; course cell: LINGUISTICS/ENGLISH AEFUNA FED-DUTSE; Arts _ Humanities.pdf, PDF p.57, table row 4; course cell: LINGUISTICS/FRENCH FED-DUTSE AEFUNA; Arts _ Humanities.pdf, PDF p.57, table row 5; course cell: LINGUISTICS/HAUSA TSUJ YSU; Arts _ Humanities.pdf, PDF p.78, table row 3; course cell: LINGUISTICS/IGBO AEFUNA IMSU ENGLISH LANGUAGE AND LINGUISTICS PEACELAND-UNI LINGUISTICS AND AFRICANLANGUAGES DOU With options in Igbo, Ika, Urhobo&Kwale OAU(withoptionsin: (i) B.A. (Hons.) Degree inLinguistics (ii) B.A. (Combined Honours) Degree in Linguistics and EnglishLanguage (iii) B.A. (Hons) Degree in Linguistics and Yoruba(Combined) LINGUISTICS, IGBO AND OTHER AFRICAN LANGUAGES UNN; Arts _ Humanities.pdf, PDF p.83, table row 5; course cell: LANGUAGESAND LINGUISTICS BENIN HENSARD KWASU NASARAWA; Arts _ Humanities.pdf, PDF p.86, table row 4; course cell: LINGUISTICS AAUA ABUAD ABUJA BASU BAYERO BSU BOUEDST CALABAR DELSU EBSU EKSU FED-LOKOJA KOMU AEFUNA FED-OYEEKITI FED-OTUOKE; Arts _ Humanities.pdf, PDF p.88, table row 3; course cell: UNIOSUN UNIZIK UNN UYO LINGUISTICSAND COMMUNICATION STUDIES ABSU CALABAR PHC LINGUISTICSAND AFRICANLANGUAGE BENIN LINGUISTICS/YORUBA AAUA LINGUISTICSAND URHOBO DELSU; Education.pdf, PDF p.61, table row 1; course cell: EDUCATIONANDIGBO: COOU IMSU ESCOE LAGOS LASUED NSUGBE PCE-DEG UNIZIK UNN EDUCATION,IGBOAND LINGUISTICS: EDALV
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N157. Linguistics — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.7, table row 4; course cell: LINGUISTICS/ARABIC YSU; Arts _ Humanities.pdf, PDF p.27, table row 4; course cell: LINGUISTICS/EDO BENIN; Arts _ Humanities.pdf, PDF p.41, table row 4; course cell: LINGUISTICS/ENGLISH AEFUNA FED-DUTSE; Arts _ Humanities.pdf, PDF p.57, table row 4; course cell: LINGUISTICS/FRENCH FED-DUTSE AEFUNA; Arts _ Humanities.pdf, PDF p.57, table row 5; course cell: LINGUISTICS/HAUSA TSUJ YSU; Arts _ Humanities.pdf, PDF p.78, table row 3; course cell: LINGUISTICS/IGBO AEFUNA IMSU ENGLISH LANGUAGE AND LINGUISTICS PEACELAND-UNI LINGUISTICS AND AFRICANLANGUAGES DOU With options in Igbo, Ika, Urhobo&Kwale OAU(withoptionsin: (i) B.A. (Hons.) Degree inLinguistics (ii) B.A. (Combined Honours) Degree in Linguistics and EnglishLanguage (iii) B.A. (Hons) Degree in Linguistics and Yoruba(Combined) LINGUISTICS, IGBO AND OTHER AFRICAN LANGUAGES UNN; Arts _ Humanities.pdf, PDF p.83, table row 5; course cell: LANGUAGESAND LINGUISTICS BENIN HENSARD KWASU NASARAWA; Arts _ Humanities.pdf, PDF p.86, table row 4; course cell: LINGUISTICS AAUA ABUAD ABUJA BASU BAYERO BSU BOUEDST CALABAR DELSU EBSU EKSU FED-LOKOJA KOMU AEFUNA FED-OYEEKITI FED-OTUOKE; Arts _ Humanities.pdf, PDF p.88, table row 3; course cell: UNIOSUN UNIZIK UNN UYO LINGUISTICSAND COMMUNICATION STUDIES ABSU CALABAR PHC LINGUISTICSAND AFRICANLANGUAGE BENIN LINGUISTICS/YORUBA AAUA LINGUISTICSAND URHOBO DELSU; Education.pdf, PDF p.61, table row 1; course cell: EDUCATIONANDIGBO: COOU IMSU ESCOE LAGOS LASUED NSUGBE PCE-DEG UNIZIK UNN EDUCATION,IGBOAND LINGUISTICS: EDALV
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N158. Linguistics — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Arabic and two (2)subjectsfrom Arts and/or SocialSciences. Sameasin ArabicStudies.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.7, table row 4; course cell: LINGUISTICS/ARABIC YSU; Arts _ Humanities.pdf, PDF p.27, table row 4; course cell: LINGUISTICS/EDO BENIN; Arts _ Humanities.pdf, PDF p.41, table row 4; course cell: LINGUISTICS/ENGLISH AEFUNA FED-DUTSE; Arts _ Humanities.pdf, PDF p.57, table row 4; course cell: LINGUISTICS/FRENCH FED-DUTSE AEFUNA; Arts _ Humanities.pdf, PDF p.57, table row 5; course cell: LINGUISTICS/HAUSA TSUJ YSU; Arts _ Humanities.pdf, PDF p.78, table row 3; course cell: LINGUISTICS/IGBO AEFUNA IMSU ENGLISH LANGUAGE AND LINGUISTICS PEACELAND-UNI LINGUISTICS AND AFRICANLANGUAGES DOU With options in Igbo, Ika, Urhobo&Kwale OAU(withoptionsin: (i) B.A. (Hons.) Degree inLinguistics (ii) B.A. (Combined Honours) Degree in Linguistics and EnglishLanguage (iii) B.A. (Hons) Degree in Linguistics and Yoruba(Combined) LINGUISTICS, IGBO AND OTHER AFRICAN LANGUAGES UNN; Arts _ Humanities.pdf, PDF p.83, table row 5; course cell: LANGUAGESAND LINGUISTICS BENIN HENSARD KWASU NASARAWA; Arts _ Humanities.pdf, PDF p.86, table row 4; course cell: LINGUISTICS AAUA ABUAD ABUJA BASU BAYERO BSU BOUEDST CALABAR DELSU EBSU EKSU FED-LOKOJA KOMU AEFUNA FED-OYEEKITI FED-OTUOKE; Arts _ Humanities.pdf, PDF p.88, table row 3; course cell: UNIOSUN UNIZIK UNN UYO LINGUISTICSAND COMMUNICATION STUDIES ABSU CALABAR PHC LINGUISTICSAND AFRICANLANGUAGE BENIN LINGUISTICS/YORUBA AAUA LINGUISTICSAND URHOBO DELSU; Education.pdf, PDF p.61, table row 1; course cell: EDUCATIONANDIGBO: COOU IMSU ESCOE LAGOS LASUED NSUGBE PCE-DEG UNIZIK UNN EDUCATION,IGBOAND LINGUISTICS: EDALV
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N159. Linguistics/Edo — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes or TC II merits including English Language, Literature in English and a Nigerian Language preferably Edo. 'O' Level pass in Mathematics is optional.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.27, table row 4; course cell: LINGUISTICS/EDO BENIN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N160. Literature in English — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.43, table row 3; course cell: LAUTECH LCITY LUX-MUNDI MAIDUGURI MC-IBRU NDU OBONG SUMMIT TAU TRINITY UDA UNIHEZ UNN VERITAS ENGLISHSTUDIES AAUA BABCOCK KASU LITERATUREINENGLISH ABU BASU BOSU CHRISLAND CHRISTOPHER; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N161. Literature in English — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: arts_hum_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.43, table row 3; course cell: LAUTECH LCITY LUX-MUNDI MAIDUGURI MC-IBRU NDU OBONG SUMMIT TAU TRINITY UDA UNIHEZ UNN VERITAS ENGLISHSTUDIES AAUA BABCOCK KASU LITERATUREINENGLISH ABU BASU BOSU CHRISLAND CHRISTOPHER; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N162. Livestock Production Technology — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language (shares requirements with Animal Production and Health umbrella block).
- Candidate brochure locations: Agriculture.pdf, PDF p.36, table row 3; course cell: ANIMALPRODUCTION ANDFISHERIES CRAWFORD LIVESTOCK PRODUCTION TECHNOLOGY NDU PASTUREANDRANGE MANAGEMENT FUNAAB
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N163. METEOROLOGY AND CLIMATE CHANGE — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.140, table row 4; course cell: METEOROLOGY FUTA UMYUK MINNA METEOROLOGYAND CLIMATECHANGE MARITIME-UNI; Sciences.pdf, PDF p.230, table row 4; course cell: METEOROLOGY AAAU BAYERO FUTA KUST REDEEMERS METEOROLOGYAND CLIMATECHANGE LAGOS MARITIME-UNI PRU METEOROLOGYAND CLIMATESCIENCE HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N164. METEOROLOGY AND CLIMATE CHANGE — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.140, table row 4; course cell: METEOROLOGY FUTA UMYUK MINNA METEOROLOGYAND CLIMATECHANGE MARITIME-UNI; Sciences.pdf, PDF p.230, table row 4; course cell: METEOROLOGY AAAU BAYERO FUTA KUST REDEEMERS METEOROLOGYAND CLIMATECHANGE LAGOS MARITIME-UNI PRU METEOROLOGYAND CLIMATESCIENCE HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N165. Marine Science and Technology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N166. Marine Science and Technology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N167. Mass Communication — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics.
- Candidate brochure locations: Administration.pdf, PDF p.35, table row 5; course cell: MASSCOMMUNICATION AAUA CARITAS CRUTECH; Arts _ Humanities.pdf, PDF p.92, table row 4; course cell: MASSCOMMUNICATION AJAYI COVENANT EVANGEL HAVILLA JOS NOUN NUS NTA-TVC SALEM UNN INFORMATIONANDMEDIA STUDIES NUS; Social Management Science.pdf, PDF p.63, table row 2; course cell: MASSCOMMUNICATION AAU AAUA ABSU ABU ACHIEVERS ADSU AKSU AL-ANSAR AL-HIKMAH ALETHEIA ANCHOR-UNI APU; Social Management Science.pdf, PDF p.70, table row 1; course cell: NILE FILMANDMEDIA STUDIES DOU WIGWE JOURNALISMANDMEDIA STUDIES ABUJA BSU CRUTECH DELSU DELSUT DOU EUI FED-OTUOKE RSU PHC PHILOMATH IMSU JOURNALISM HENSARD MASSCOMMUNICATION ANDMEDIA TECHNOLOGY; Social Management Science.pdf, PDF p.71, table row 1; course cell: LCITY MASSCOMMUNICATION ANDMEDIASTUDIES MIVA PUBLICRELATIONSAND ADVERTISING IGBINEDION PUBLICRELATIONS PHILOMATH MADONNA DELSU DELSUT NUS PHC ADVERTISING DELSU DELSUT PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N168. Mathematics and Economics / Mathematics with Economics — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Mathematics, Economics and any other two (2) subjects selected from Science or Social Sciences at not more than two (2) sittings.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N169. Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics and at least three (3) of Physics, Chemistry, Biology and Additional/Further Mathematics.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N170. Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Maths, Physics and Chemistry or Biology and Additional/Further Mathematics.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N171. Medical Biochemistry — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: medical_offerings.json
- Current catalogue/source text: Five(5) SSC credit passesinEnglish Language, Mathematics, Physics, Chemistryand Biology. Five (5) SSC credit passes in English Language, Physics, Chemistry, Biology and Mathematics.
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.6, table row 4; course cell: BIOCHEMISTRY CALABAR IBADAN IGBINEDION JOS LAUTECH PAMO UYO MEDICALBIOCHEMISTRY BENIN CRUTECH DELSU EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N172. Modern Language and Translation — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: For Programme A: five (5) SSC credit passes including English Language and French. For Programme B: credit passes in English Language and four (4) other subjects.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N173. Modern Language and Translation — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Programme A: French and any other two (2) subjects; Programme B: any three (3) subjects
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N174. Molecular Biology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.9, table row 3; course cell: UNIHEZ UNI-ILESA UNIKINGS UNIOSUN UNN VERITAS WESLEYUNI WESTERN-DEL YSU BIOCHEMISTRYAND MOLECULARBIOLOGY DOU HENSARD ZAMFARA BIOTECHNOLOGYAND MOLECULARBIOLOGY FUHS-ILA; Sciences.pdf, PDF p.165, table row 3; course cell: VERITAS VISION-UNI WELLSPRING WESLEYUNI WESTERN-DEL YSU MICROBIOLOGYAND BIOTECHNOLOGY ABUAD MICROBIOLOGY/ PARASITOLOGY DANUMS BIOLOGY/BIOTECHNOLO GY DANUMS MOLECULARBIOLOGY AEFUNA FED-WUKARI MICROBIOLOGYAND INDUSTRIAL BIOTECHNOLOGY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N175. Molecular Biology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.9, table row 3; course cell: UNIHEZ UNI-ILESA UNIKINGS UNIOSUN UNN VERITAS WESLEYUNI WESTERN-DEL YSU BIOCHEMISTRYAND MOLECULARBIOLOGY DOU HENSARD ZAMFARA BIOTECHNOLOGYAND MOLECULARBIOLOGY FUHS-ILA; Sciences.pdf, PDF p.165, table row 3; course cell: VERITAS VISION-UNI WELLSPRING WESLEYUNI WESTERN-DEL YSU MICROBIOLOGYAND BIOTECHNOLOGY ABUAD MICROBIOLOGY/ PARASITOLOGY DANUMS BIOLOGY/BIOTECHNOLO GY DANUMS MOLECULARBIOLOGY AEFUNA FED-WUKARI MICROBIOLOGYAND INDUSTRIAL BIOTECHNOLOGY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N176. NATURAL AND ENVIRONMENTAL SCIENCE — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, and any other three (3) subjects from Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French.
- Candidate brochure locations: Sciences.pdf, PDF p.167, table row 3; course cell: FED-LAFIA FUPRE FUTO GSU HENSARD KUST LASU LAUTECH LCITY MAUTY NASARAWA NILE OSUMS PEACELAND-UNI PHC TECH-IBADAN UNI-ILESA UNIOSUN UNN NATURAL ANDENVIRONMENTAL SCIENCE AUN (withoptionsas; (i) Conservation Biology; Sciences.pdf, PDF p.230, table row 5; course cell: NATURALAND ENVIRONMENTAL SCIENCE AUN (withoptionsin:) (i) Environmental
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N177. NATURAL AND ENVIRONMENTAL SCIENCE — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Any subject combination which includes Mathematics and any two (2) of Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French.
- Candidate brochure locations: Sciences.pdf, PDF p.167, table row 3; course cell: FED-LAFIA FUPRE FUTO GSU HENSARD KUST LASU LAUTECH LCITY MAUTY NASARAWA NILE OSUMS PEACELAND-UNI PHC TECH-IBADAN UNI-ILESA UNIOSUN UNN NATURAL ANDENVIRONMENTAL SCIENCE AUN (withoptionsas; (i) Conservation Biology; Sciences.pdf, PDF p.230, table row 5; course cell: NATURALAND ENVIRONMENTAL SCIENCE AUN (withoptionsin:) (i) Environmental
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N178. Office and Information Technology / Information Resource Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Economics and three (3) other subjects plus at least a pass in Mathematics. For NBC holders, three (3) other subjects could be from any of the following: Office Practice, Secretarial Duties, Principles of Accounts, Shorthand 80 WPM and Typewriting 35 WPM.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N179. PHYSICS — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Education.pdf, PDF p.119, table row 1; course cell: EKSU RSU withoptionsin:Biology,Botany, Chemistry,Geography/Physics, Mathematics,Physics,Environmental EducationandIntegratedScience. TSUJ UNN offersthecourseasEducation Science withoptionin EducationBiology EducationChemistry EducationIntegratedScience. EducationMathematics EducationPhysics EducationStatistics MINNA withoptionsin:Biology, Chemistry,Mathematics,Physicsand Geography/PhysicsEducation. KWASU UYO SCIENCEEDUCATION YSU PHC withoptionsinPhysics,Chemistry,; Education.pdf, PDF p.141, table row 1; course cell: B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience CALABAR (offersthecourseasEducation FoundationandGuidanceand Counselling) EBSU (offersthecoursewithoptionsin i)EducationAdministration,Planning andSupervision ii)GuidanceandCounselling ESUTECH LASU NDU (withoptionsin: (i)EducationalAdministration (ii)GuidanceandCounseling (iii)AdultCommunityEducation (iv)PrimaryEducationwithteaching subjectsinEnglishLanguage,Fine andAppliedArts,French,History, ReligiousStudies,Biology,Chemistry, Mathematics,Physics,Economics, Geography/Physics,PoliticalScience, SocialStudies,PhysicalEducation, HealthEducation. UNIZIK; Education.pdf, PDF p.142, table row 1; course cell: EDUCATIONFOUNDATIONSAND MANAGEMENT EKSU AAU (withoptionsin ReligiousStudies ii)French iii)PoliticalScience iv)EducationalAdministrationand Supervision v)GuidanceandCounseling vi)EconomicsEducation vii)Geography/PhysicsEducation ii)French iii)History B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience FOUNTAIN PHC; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR; Education.pdf, PDF p.144, table row 2; course cell: CURRICULUM ANDINSTRUCTION NDU Scienceoptions: (i)Biology (ii)Chemistry (iii)Physics (iv)Mathematics (v)PhysicalEducation.; Education.pdf, PDF p.145, table row 1; course cell: (vi)HealthEducation. SocialScience (i)Geography/Physics (ii)Economics (iii) PoliticalScience ArtsOptions (x)EnglishLanguage (xi)French (xii)ReligiousStudies (xiii)History (xiv)FineandAppliedArt. AAU (withoptionsin:) (i)Biology (ii)Chemistry (iii)Mathematics iv)Physics v)Pre-PrimaryandPrimaryEducation EDUCATION PSYCHOLOGY AND CURRICULUMSTUDIES BENIN CURRICULUMSTUDIES EKSU LASU SAUED SSUET UDU UYO; Education.pdf, PDF p.147, table row 1; course cell: PEACELANDUNI IAUED REDEEMERS SAUED SACOEDB.ED SSUET EKSU OYOSPECIAL SOSU TASUED (WithTeachingsubjectoptionsin: Yoruba,EnglishLanguage,French History, Political Science, Social Studies, Islamic Studies, Geography/Physics, Economics, C.R.S, Chemistry, Biology, Mathematics, Health Education, Physics and Integrated Science). LASU MOCPEN NASARAWA COOU AEFUNA FED-OYEEKITI IAUED KWARARAFA KWASU MOCPEN OAU OOU RSU; Education.pdf, PDF p.176, table row 1; course cell: BENIN ADULTEDUCATION/ECONOMICS ANDSTATISTICS BENIN ADULTEDUCATION/POLITICAL SCIENCEANDPUBLIC ADMINISTRATION BENIN ADULTEDUCATION/GEOGRAPHY ANDREGIONALPLANNING BENIN ADULTANDNON-FORMAL EDUCATION PHC (withoptionsin: EnglishLanguage,History,Christian ReligiousStudies,Economics, Geography/Physics,Chemistry, Biology,MathematicsandPhysics. ADULTANDCOMMUNITY EDUCATION; Education.pdf, PDF p.186, table row 1; course cell: Withoptionsin:(a)Economics(b)Pol. Science(c)Geography/Physics NDU PHC withoptionsinEconomics, Accounting,PoliticalScienceand Geography/Physics. UNN withoptionsin: Edu.Geography/Physics Edu.PolScience Edu.SocialStudies Edu.Economics UYO; Education.pdf, PDF p.196, table row 1; course cell: ECONOMICS /GEOGRAPHY/PHYSICS MAIDUGURI; Sciences.pdf, PDF p.22, table row 4; course cell: PHYSICS AAU withoptionsinGeophysics ABU ABUJA ABUAD ACHIEVERS ADSU AFIT-DEG AKSU AL-HIKMAH AL-QALAM ANCHOR-UNI ARTHUR-JARVIS ATIBA AUE AUGUSTINE BASU BAYERO; Sciences.pdf, PDF p.26, table row 3; course cell: KASU KASU-KABBA KOLADAISI PAAU KSUSTA KUST KWASU LAGOS LANDMARK LAPAI LASU LASUED LAUTECH LCITY LEGACY MAIDUGURI MAITAMA MAKURDI (withoptionsin: PhysicsandIndustrial Physics MAUTY MCPHERSON MOUNTAINTOP
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N180. PHYSICS WITH ELECTRONICS — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.27, table row 3; course cell: NDA NDU NOUN-ELUON MINNA MKAR NASARAWA NAUB NOVENA OAU ODUDUWA OSUMS OOU withoptionsin:Geophysics, MedicalHealthPhysicsand PhysicswithElectronics. OAUSTECH (withoptionsin: (i)Physics;(ii)Electronics; (iii)SolidState. PAUL PHC withoptionsin:i)Applied Geophysics;ii)Elect/Elect. PLASU; Sciences.pdf, PDF p.29, table row 3; course cell: UNN UYO WESTERN-DEL WELLSPRING WESLEYUNI (offers the course as Physics and Industrial Physics) RHEMA YSU ZAMFARA PHYSICSWITH ELECTRONICS AAUA ACHIEVERS AFIT-DEG AJAYI AL-ANSAR AL-HIKMAH ALETHEIA ANCHOR-UNI APU ATIBA; Sciences.pdf, PDF p.34, table row 3; course cell: COMPUTATIONAL MODELING CALEB PHYSICS/ASTROLOGY UNN PHYSICALSCIENCES GOUU (withoptionsin i.IndustrialPhysics ii.PhysicswithElectronics ENERGYSTUDIES SALEM
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N181. Pasture & Range Management — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: agriculture_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language (shares requirements with Animal Production and Health umbrella block).
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N182. Peace Strategic and Conflict Resolution — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics.
- Candidate brochure locations: Social Management Science.pdf, PDF p.89, table row 1; course cell: AL-ANSAR ARTHUR-JARVIS AVE-MARIA BOSU CALEB CRUTECH EUI EKSU FED-OYEEKITI HUDA KWASU LUX-MUNDI MAAUN MADONNA NAUB NBU NILE OBONG PETER-UNI TSUJ UAGRIC-IMO UNIOSUN PEACESTRATEGICAND CONFLICTRESOLUTION AJAYI CONFLICTANDPEACE RESOLUTION BIU GSU ISTIQAMA NOUN PEACEANDCONFLICT STUDIES
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N183. Peace Studies and Conflict Resolution — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics.
- Candidate brochure locations: Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N184. Peace and Conflict Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics.
- Candidate brochure locations: Social Management Science.pdf, PDF p.89, table row 1; course cell: AL-ANSAR ARTHUR-JARVIS AVE-MARIA BOSU CALEB CRUTECH EUI EKSU FED-OYEEKITI HUDA KWASU LUX-MUNDI MAAUN MADONNA NAUB NBU NILE OBONG PETER-UNI TSUJ UAGRIC-IMO UNIOSUN PEACESTRATEGICAND CONFLICTRESOLUTION AJAYI CONFLICTANDPEACE RESOLUTION BIU GSU ISTIQAMA NOUN PEACEANDCONFLICT STUDIES
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N185. Personnel Management — OLEVEL

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Candidate brochure locations: Administration.pdf, PDF p.30, table row 4; course cell: PERSONNEL MANAGEMENT GREGORY INDUSTRIALRELATIONS ANDPERSONNEL MANAGEMENT AVE-MARIA BOWEN CARITAS CLIFFORD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N186. Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N187. Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N188. Physics Electronics — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.32, table row 3; course cell: TRINITY UMYUK UNIHEZ UNI-ILESA UNIOSUN UOO VERITAS VISION-UNI WESTERN-DEL WESTLAND PHYSICSANDCOMPUTER ELECTRONIC OBONG PHYSICSELECTRONICS KOMU FED-DUTSINMA ELECTRONICS; Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N189. Physics Electronics — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.32, table row 3; course cell: TRINITY UMYUK UNIHEZ UNI-ILESA UNIOSUN UOO VERITAS VISION-UNI WESTERN-DEL WESTLAND PHYSICSANDCOMPUTER ELECTRONIC OBONG PHYSICSELECTRONICS KOMU FED-DUTSINMA ELECTRONICS; Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N190. Physics and Applied Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.43, table row 4; course cell: PHYSICSANDAPPLIED PHYSICS BAUCHI INDUSTRIALPHYSICS BENIN COOU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N191. Physics and Computer Electronic — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.32, table row 3; course cell: TRINITY UMYUK UNIHEZ UNI-ILESA UNIOSUN UOO VERITAS VISION-UNI WESTERN-DEL WESTLAND PHYSICSANDCOMPUTER ELECTRONIC OBONG PHYSICSELECTRONICS KOMU FED-DUTSINMA ELECTRONICS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N192. Physics and Energy Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.33, table row 3; course cell: BAYERO NAUB WESLEYUNI ELECTRONS ZAMFARA PHYSICSWITHSOLAR ENERGY BOWEN PHYSICSANDENERGY STUDIES ACHIEVERS PHYSICS/INDUSTRIAL PHYSICS BENIN UNIZIK PHYSICSWITH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N193. Physics with Computational Modeling — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N194. Physics with Computational Modeling — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N195. Physics with Solar Energy — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.33, table row 3; course cell: BAYERO NAUB WESLEYUNI ELECTRONS ZAMFARA PHYSICSWITHSOLAR ENERGY BOWEN PHYSICSANDENERGY STUDIES ACHIEVERS PHYSICS/INDUSTRIAL PHYSICS BENIN UNIZIK PHYSICSWITH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N196. Physics/Astrology — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.34, table row 3; course cell: COMPUTATIONAL MODELING CALEB PHYSICS/ASTROLOGY UNN PHYSICALSCIENCES GOUU (withoptionsin i.IndustrialPhysics ii.PhysicswithElectronics ENERGYSTUDIES SALEM
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N197. Physics/Industrial Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.33, table row 3; course cell: BAYERO NAUB WESLEYUNI ELECTRONS ZAMFARA PHYSICSWITHSOLAR ENERGY BOWEN PHYSICSANDENERGY STUDIES ACHIEVERS PHYSICS/INDUSTRIAL PHYSICS BENIN UNIZIK PHYSICSWITH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N198. Physiotherapy — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: medical_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Medica_Pharmaceutical Health Science.pdf, PDF p.48, table row 3; course cell: VENITE PHC WESLEYUNI DOCTOROF PHYSIOTHERAPY ACHIEVERS AL-QALAM APU BOSU CANADIAN-UNI CUST EVANGEL FRANCO FUHS-ILA GREENFIELD LASU LAGOS NEWGATE OSUMS KUM PEACELAND-UNI TAU UNINIGER UNIZIK UMYUK; Medica_Pharmaceutical Health Science.pdf, PDF p.55, table row 4; course cell: PHYSIOTHERAPY: BAYERO BENIN BOWEN BCU CALABAR CCU CHRISLAND COAL-CITY CUN DANUMS EUN EVANGEL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N199. Plant Breeding and Seed Technology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N200. Plant Breeding and Seed Technology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: agriculture_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N201. Plant Science — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.18, table row 4; course cell: BIOLOGICALSCIENCE(S) ABU AUE withoptionsin: i. PlantScience ii. EnvironmentalScience iii. Animalscience AUGUSTINE(withoptionsin Microbiologyand EnvironmentalBiology) AKSU (offersthecoursewiththe followingoptions); Sciences.pdf, PDF p.109, table row 3; course cell: FED-OYEEKITI JOS PAAU MAUTY MK-UNI NASARAWA PHC PLASU withoptionsin: (i)PlantScience (ii)PlantBiotechnology (iii)EnvironmentalPlant Science. UMUDIKE UMYUK UNIHEZ PLANTBIOLOGYAND BIOTECHNOLOGY BENIN OSUMS; Sciences.pdf, PDF p.110, table row 3; course cell: PLANTSCIENCEAND FORESTRY EKSU PLANTSCIENCEAND MICROBIOLOGY WESTERN-DEL PLANTBIOLOGY BAYERO ILORIN KWASU UNIOSUN PLANTSCIENCE ABUAD FED-KASHERE MAUTY OOU BIOTECHNOLOGY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N202. Plant Science — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.18, table row 4; course cell: BIOLOGICALSCIENCE(S) ABU AUE withoptionsin: i. PlantScience ii. EnvironmentalScience iii. Animalscience AUGUSTINE(withoptionsin Microbiologyand EnvironmentalBiology) AKSU (offersthecoursewiththe followingoptions); Sciences.pdf, PDF p.109, table row 3; course cell: FED-OYEEKITI JOS PAAU MAUTY MK-UNI NASARAWA PHC PLASU withoptionsin: (i)PlantScience (ii)PlantBiotechnology (iii)EnvironmentalPlant Science. UMUDIKE UMYUK UNIHEZ PLANTBIOLOGYAND BIOTECHNOLOGY BENIN OSUMS; Sciences.pdf, PDF p.110, table row 3; course cell: PLANTSCIENCEAND FORESTRY EKSU PLANTSCIENCEAND MICROBIOLOGY WESTERN-DEL PLANTBIOLOGY BAYERO ILORIN KWASU UNIOSUN PLANTSCIENCE ABUAD FED-KASHERE MAUTY OOU BIOTECHNOLOGY
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N203. Plant Science and Biotechnology — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.46, table row 5; course cell: PLANTSCIENCEAND BIOTECHNOLOGY ABSU RSU; Sciences.pdf, PDF p.108, table row 3; course cell: BOTANYAND ECOLOGICALSTUDIES UYO PLANTSCIENCEAND BIOTECHNOLOGY AAUA ACHIEVERS APU BENIN BOSU BOUEDST BSU CALEB CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-GUSAU FED-LAFIA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N204. Plant Science and Biotechnology — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Agriculture.pdf, PDF p.46, table row 5; course cell: PLANTSCIENCEAND BIOTECHNOLOGY ABSU RSU; Sciences.pdf, PDF p.108, table row 3; course cell: BOTANYAND ECOLOGICALSTUDIES UYO PLANTSCIENCEAND BIOTECHNOLOGY AAUA ACHIEVERS APU BENIN BOSU BOUEDST BSU CALEB CRUTECH DELSUT DOU EUI KOMU FED-DUTSINMA FED-GUSAU FED-LAFIA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N205. Policy and Administrative Studies — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Policy and Strategic Studies (shared requirements column)
- Candidate brochure locations: Social Management Science.pdf, PDF p.73, table row 2; course cell: POLICYANDSTRATEGIC STUDIES COVENANT POLICYAND ADMINISTRATIVE STUDIES CALABAR STRATEGIC MANAGEMENT NBU SOCIALJUSTICE ABUAD CLIFFORD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N206. Policy and Administrative Studies — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Policy and Strategic Studies (shared requirements column; no separate UTME SUBJECTS column shown for this heading)
- Candidate brochure locations: Social Management Science.pdf, PDF p.73, table row 2; course cell: POLICYANDSTRATEGIC STUDIES COVENANT POLICYAND ADMINISTRATIVE STUDIES CALABAR STRATEGIC MANAGEMENT NBU SOCIALJUSTICE ABUAD CLIFFORD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N207. Policy and Strategic Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language Government and a pass in Mathematics 'O' Level
- Candidate brochure locations: Social Management Science.pdf, PDF p.73, table row 2; course cell: POLICYANDSTRATEGIC STUDIES COVENANT POLICYAND ADMINISTRATIVE STUDIES CALABAR STRATEGIC MANAGEMENT NBU SOCIALJUSTICE ABUAD CLIFFORD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N208. Political Science — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.123, table row 4; course cell: POLITICALSCIENCE EVANGEL FED-KASHERE FED-LOKOJA FED-OTUOKE FED-WUKARI PLASU POLITICAL SCIENCE AND CONFLICTRESOLUTION AL-HIKMAH; Education.pdf, PDF p.141, table row 1; course cell: B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience CALABAR (offersthecourseasEducation FoundationandGuidanceand Counselling) EBSU (offersthecoursewithoptionsin i)EducationAdministration,Planning andSupervision ii)GuidanceandCounselling ESUTECH LASU NDU (withoptionsin: (i)EducationalAdministration (ii)GuidanceandCounseling (iii)AdultCommunityEducation (iv)PrimaryEducationwithteaching subjectsinEnglishLanguage,Fine andAppliedArts,French,History, ReligiousStudies,Biology,Chemistry, Mathematics,Physics,Economics, Geography/Physics,PoliticalScience, SocialStudies,PhysicalEducation, HealthEducation. UNIZIK; Education.pdf, PDF p.142, table row 1; course cell: EDUCATIONFOUNDATIONSAND MANAGEMENT EKSU AAU (withoptionsin ReligiousStudies ii)French iii)PoliticalScience iv)EducationalAdministrationand Supervision v)GuidanceandCounseling vi)EconomicsEducation vii)Geography/PhysicsEducation ii)French iii)History B.Sc(Ed)Degree i)ReligiousStudies ii)Economics iii)EducationalManagement iv)Geography/Physics v) GuidanceandCounselling vi)PoliticalScience FOUNTAIN PHC; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR; Education.pdf, PDF p.145, table row 1; course cell: (vi)HealthEducation. SocialScience (i)Geography/Physics (ii)Economics (iii) PoliticalScience ArtsOptions (x)EnglishLanguage (xi)French (xii)ReligiousStudies (xiii)History (xiv)FineandAppliedArt. AAU (withoptionsin:) (i)Biology (ii)Chemistry (iii)Mathematics iv)Physics v)Pre-PrimaryandPrimaryEducation EDUCATION PSYCHOLOGY AND CURRICULUMSTUDIES BENIN CURRICULUMSTUDIES EKSU LASU SAUED SSUET UDU UYO; Education.pdf, PDF p.147, table row 1; course cell: PEACELANDUNI IAUED REDEEMERS SAUED SACOEDB.ED SSUET EKSU OYOSPECIAL SOSU TASUED (WithTeachingsubjectoptionsin: Yoruba,EnglishLanguage,French History, Political Science, Social Studies, Islamic Studies, Geography/Physics, Economics, C.R.S, Chemistry, Biology, Mathematics, Health Education, Physics and Integrated Science). LASU MOCPEN NASARAWA COOU AEFUNA FED-OYEEKITI IAUED KWARARAFA KWASU MOCPEN OAU OOU RSU; Education.pdf, PDF p.149, table row 2; course cell: TEACHEREDUCATION SACOEDB.ED (with Teaching subject options in Political Science, Social Studies, Economics, Christian Religious StudiesandEnglish); Education.pdf, PDF p.185, table row 2; course cell: EDUCATIONANDSOCIALSCIENCE CALABAR withoptionsin: Edu.Geography Edu.PoliticalScience Edu.Economics EBSU; Social Management Science.pdf, PDF p.77, table row 2; course cell: POLITICALSCIENCE AAU AAUA ABUJA ABSU ABU ABU-ODL ABUAD ACHIEVERS ADSU AJAYI AKSU AL-QALAM ANCHOR-UNI ARTHUR-JARVIS ATIBA AUE AUGUSTINE AVE-MARIA BABCOCK BASU BAUK BAYERO BAZE BINGHAM BOSU BOUEDST BOWEN BSU; Social Management Science.pdf, PDF p.81, table row 1; course cell: TANSIAN TASUED TRINITY UDA UDU UMYUK UNI-AFRICA UNIHEZ UNI-ILESA UNIKINGS UNIOSUN UNIZIK UNN UOO UYO VENITE WELLSPRING WESLEYUNI WESTERN-DEL WESTLAND YSU POLITICALSCIENCE/ INTERNTIONALLAWAND DIPLOMACY BABCOCK; Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N209. Political Science / International Law and Diplomacy — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science
- Candidate brochure locations: Social Management Science.pdf, PDF p.81, table row 1; course cell: POLITICAL SCIENCE / INTERNTIONAL LAW AND DIPLOMACY BABCOCK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N210. Political Science / International Law and Diplomacy — UTME

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science (no separate requirements column shown for this heading; the rightward area continues the Political Science DIRECT ENTRY/UTME waiver list)
- Candidate brochure locations: Social Management Science.pdf, PDF p.81, table row 1; course cell: POLITICAL SCIENCE / INTERNTIONAL LAW AND DIPLOMACY BABCOCK
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N211. Political Science and Conflict Resolution — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.123, table row 4; course cell: POLITICALSCIENCE EVANGEL FED-KASHERE FED-LOKOJA FED-OTUOKE FED-WUKARI PLASU POLITICAL SCIENCE AND CONFLICTRESOLUTION AL-HIKMAH; Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N212. Political Science and Conflict Resolution — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration (no separate requirements column shown for this heading)
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.123, table row 4; course cell: POLITICALSCIENCE EVANGEL FED-KASHERE FED-LOKOJA FED-OTUOKE FED-WUKARI PLASU POLITICAL SCIENCE AND CONFLICTRESOLUTION AL-HIKMAH; Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N213. Political Science and Defence Studies — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N214. Political Science and Defence Studies — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration (no separate requirements column shown for this heading)
- Candidate brochure locations: Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N215. Political Science and Diplomacy — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science
- Candidate brochure locations: Social Management Science.pdf, PDF p.82, table row 1; course cell: POLITICALSCIENCEAND DIPLOMACY VERITAS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N216. Political Science and Diplomacy — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science (no separate requirements column shown for this heading)
- Candidate brochure locations: Social Management Science.pdf, PDF p.82, table row 1; course cell: POLITICALSCIENCEAND DIPLOMACY VERITAS
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N217. Political Science and International Relations — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Social Management Science.pdf, PDF p.87, table row 2; course cell: POLITICAL SCIENCE AND PUBLICADMINISTRATION AAU BENIN BIU IGBINEDION KWASU RHEMA WESTERN-DEL POLITICAL AND ADMINISTRATIVE STUDIES PHC POLITICALSCIENCEAND INTERNATIONAL RELATIONS ABUJA CRAWFORD CUAB GOUU HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N218. Political Science and International Relations — UTME

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration (no separate requirements column shown for this heading; rightward area continues the shared DIRECT ENTRY/UTME waiver list)
- Candidate brochure locations: Social Management Science.pdf, PDF p.87, table row 2; course cell: POLITICAL SCIENCE AND PUBLICADMINISTRATION AAU BENIN BIU IGBINEDION KWASU RHEMA WESTERN-DEL POLITICAL AND ADMINISTRATIVE STUDIES PHC POLITICALSCIENCEAND INTERNATIONAL RELATIONS ABUJA CRAWFORD CUAB GOUU HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N219. Political Science and International Studies — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N220. Political Science and International Studies — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration (no separate requirements column shown for this heading)
- Candidate brochure locations: Social Management Science.pdf, PDF p.88, table row 1; course cell: KWARARAFA NILE TSUJ UNIOSUN POLITICALSCIENCE ANDINTERNATIONAL STUDIES CUAB POLITICALSCIENCEAND CONFLICTRESOLUTION AL-HIKMAH POLITICALSCIENCEAND DEFENCESTUDIES NDA POLITICALECONOMICS ANDPOLITICALSTUDIES NILE DEFENCEANDSECURITY STUDIES NDA MILITARYSCIENCE NDA PEACESTUDIESAND CONFLICTRESOLUTION
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N221. Political Science and Public Administration — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes including English Language Government or History and at least a pass in Mathematics
- Candidate brochure locations: Education.pdf, PDF p.176, table row 1; course cell: BENIN ADULTEDUCATION/ECONOMICS ANDSTATISTICS BENIN ADULTEDUCATION/POLITICAL SCIENCEANDPUBLIC ADMINISTRATION BENIN ADULTEDUCATION/GEOGRAPHY ANDREGIONALPLANNING BENIN ADULTANDNON-FORMAL EDUCATION PHC (withoptionsin: EnglishLanguage,History,Christian ReligiousStudies,Economics, Geography/Physics,Chemistry, Biology,MathematicsandPhysics. ADULTANDCOMMUNITY EDUCATION; Social Management Science.pdf, PDF p.87, table row 2; course cell: POLITICAL SCIENCE AND PUBLICADMINISTRATION AAU BENIN BIU IGBINEDION KWASU RHEMA WESTERN-DEL POLITICAL AND ADMINISTRATIVE STUDIES PHC POLITICALSCIENCEAND INTERNATIONAL RELATIONS ABUJA CRAWFORD CUAB GOUU HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N222. Political and Administrative Studies — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration
- Candidate brochure locations: Social Management Science.pdf, PDF p.87, table row 2; course cell: POLITICAL SCIENCE AND PUBLICADMINISTRATION AAU BENIN BIU IGBINEDION KWASU RHEMA WESTERN-DEL POLITICAL AND ADMINISTRATIVE STUDIES PHC POLITICALSCIENCEAND INTERNATIONAL RELATIONS ABUJA CRAWFORD CUAB GOUU HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N223. Political and Administrative Studies — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: social_management_offerings.json
- Current catalogue/source text: as in Political Science and Public Administration (no separate requirements column shown for this heading)
- Candidate brochure locations: Social Management Science.pdf, PDF p.87, table row 2; course cell: POLITICAL SCIENCE AND PUBLICADMINISTRATION AAU BENIN BIU IGBINEDION KWASU RHEMA WESTERN-DEL POLITICAL AND ADMINISTRATIVE STUDIES PHC POLITICALSCIENCEAND INTERNATIONAL RELATIONS ABUJA CRAWFORD CUAB GOUU HENSARD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N224. Psychology — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.125, table row 4; course cell: PSYCHOLOGY COVENANT EVANGEL MKAR PLASU; Education.pdf, PDF p.143, table row 1; course cell: EDUCATIONAL/PSYCHOLOGY GUIDANCEANDCOUNSELLING PHC withoptionsin: Chemistry,ChristianReligious Studies,Physics,French, Mathematics History,PoliticalScience,Economics Biology,Geography/Physicsand LiteratureinEnglish. PHC IMSU EDUCATIONALFOUNDATIONS ANDADMINSTRATION CRUTECH withoptionsinGuidanceand Counseling,EducationAdministration andPlanningandElementary Education. IMSU EDUCATIONALPSYCHOLOGY BINGHAM CALABAR; Education.pdf, PDF p.162, table row 1; course cell: UNI-AFRICA (withoptionslistedinEduc.Mgt.) UNIOSUN UNI-ILESA UNIZIK UNN UYO VERITAS COUNSELLOREDUCATION ILORIN LAPAI PSYCHOLOGY EDUCATION CRUTECH; Social Management Science.pdf, PDF p.91, table row 2; course cell: PSYCHOLOGY AAU AAUA ABUAD ATIBA AVE-MARIA BAZE BSU CALEB CARITAS CHRISLAND CHRISTOPHER COAL-CITY COOU COVENANT DELSU DOU EBSU EKSU KOMU ESUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N225. Public Relations and Advertising — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: administration_offerings.json
- Current catalogue/source text: Same as in Mass Communication
- Candidate brochure locations: Administration.pdf, PDF p.49, table row 4; course cell: PUBLICRELATIONSAND ADVERTISING IGBINEDION PUBLICRELATION ABUJA IMSU BSU ADVERTISING ABUJA IMSU BSU; Social Management Science.pdf, PDF p.71, table row 1; course cell: LCITY MASSCOMMUNICATION ANDMEDIASTUDIES MIVA PUBLICRELATIONSAND ADVERTISING IGBINEDION PUBLICRELATIONS PHILOMATH MADONNA DELSU DELSUT NUS PHC ADVERTISING DELSU DELSUT PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N226. Public Relations and Advertising — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: administration_offerings.json
- Current catalogue/source text: Same as in Mass Communication
- Candidate brochure locations: Administration.pdf, PDF p.49, table row 4; course cell: PUBLICRELATIONSAND ADVERTISING IGBINEDION PUBLICRELATION ABUJA IMSU BSU ADVERTISING ABUJA IMSU BSU; Social Management Science.pdf, PDF p.71, table row 1; course cell: LCITY MASSCOMMUNICATION ANDMEDIASTUDIES MIVA PUBLICRELATIONSAND ADVERTISING IGBINEDION PUBLICRELATIONS PHILOMATH MADONNA DELSU DELSUT NUS PHC ADVERTISING DELSU DELSUT PHC
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N227. Public and International Law — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: law_offerings.json
- Current catalogue/source text: As in Civil Law
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N228. Public and International Law — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: law_offerings.json
- Current catalogue/source text: As in Civil Law
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N229. Pure Physics — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Sciences.pdf, PDF p.28, table row 3; course cell: POL-ACAD PRU RENAISSANCE RSU withoptionsinElectronics, AppliedGeophysics,Pure Physics. RITMAN SALEM SAU SLUK SOSU SOUTHWESTERN SPIRITAN SUMMIT TASUED TSUJ UAGRIC-IMO UDA UDU UMUDIKE UMYUK UNI-AFRICA UNIKINGS; Sciences.pdf, PDF p.44, table row 3; course cell: DANUMS EBSU ESUTECH GOUU HALLMARK IMSU MAKURDI MC-IBRU MKAR RENAISSANCE PUREANDAPPLIED PHYSICS ADSU APPLIEDPHYSICS AAU FED-WUKARI PUREPHYSICS PAUL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N230. Pure Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.28, table row 3; course cell: POL-ACAD PRU RENAISSANCE RSU withoptionsinElectronics, AppliedGeophysics,Pure Physics. RITMAN SALEM SAU SLUK SOSU SOUTHWESTERN SPIRITAN SUMMIT TASUED TSUJ UAGRIC-IMO UDA UDU UMUDIKE UMYUK UNI-AFRICA UNIKINGS; Sciences.pdf, PDF p.44, table row 3; course cell: DANUMS EBSU ESUTECH GOUU HALLMARK IMSU MAKURDI MC-IBRU MKAR RENAISSANCE PUREANDAPPLIED PHYSICS ADSU APPLIEDPHYSICS AAU FED-WUKARI PUREPHYSICS PAUL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N231. Pure and Applied Physics — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science.
- Candidate brochure locations: Sciences.pdf, PDF p.44, table row 3; course cell: DANUMS EBSU ESUTECH GOUU HALLMARK IMSU MAKURDI MC-IBRU MKAR RENAISSANCE PUREANDAPPLIED PHYSICS ADSU APPLIEDPHYSICS AAU FED-WUKARI PUREPHYSICS PAUL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N232. Pure and Industrial Chemistry — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: Physics, Mathematicsand Chemistryor Biology. Chemistry, Biology and Physics or Mathematics.
- Candidate brochure locations: Sciences.pdf, PDF p.72, table row 3; course cell: SKYLINE TANSIAN TECH-IBADAN TRINITY UDA UMYUK UNIHEZ UNI-ILESA UNIOSUN VERITAS VISION-UNI WELLSPRING WESTERN-DEL WESLEYUNI PUREANDINDUSTRIAL CHEMISTRY COOU LAUTECH PAUL
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N233. Robotics (Artificial Intelligence) — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N234. Robotics (Artificial Intelligence) — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N235. Russian with French/German — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Literature in UTME English, one other Arts subject and another Arts or Social Science subject. French and any two (2) other Arts/Social Science subjects.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.85, table row 3; course cell: UNN PORTUGUESE: OAU RUSSIAN IBADAN LAGOS UNN RUSSIANWITH FRENCH/GERMAN IBADAN
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N236. Science Laboratory Technology — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: sciences_offerings.json
- Current catalogue/source text: Five (5) 'O' Level credit passes (varies by institution; see waivers). Note: column shared across grouped Microbiology/SLT/Environmental programmes. Typical: English Language, Mathematics, Chemistry, Biology and Physics.
- Candidate brochure locations: Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N237. Science Laboratory Technology — UTME

- Current status: needs_review
- Review reason: institutional_or_unrecognized_prose
- Source index: sciences_offerings.json
- Current catalogue/source text: UDU and FUTA accept Agricultural Science in lieu of Biology; UNIOSUN, SALEM, MAKURDI and BENIN require Biology, Chemistry and Physics; CALABAR and UYO require Physics as the third subject; EVANGEL and AJAYI require Biology and Chemistry and any other Science subject; UNIOSUN requires Mathematics, Biology and Chemistry; FED-DUTSE (a) For Microbiology requires Biology, Physics and Chemistry, (b) For Environmental Management and Toxicology requires Chemistry, and two of Physics, Biology and Mathematics.
- Candidate brochure locations: Sciences.pdf, PDF p.166, table row 3; course cell: CALEB INDUSTRIAL MICROBIOLOGY IMSU SCIENCELABORATORY TECHNOLOGY AL-QALAM BENIN (withoptionsin: 1. Biological Science Technique 2. BiotechnologyTechnique 3. BiochemistryTechnique 4. ChemistryTechnique 5. GeologyTechnique 6. MicrobiologyTechnique 7. Physics/Electronics Technique 8. Physiology/Pharmacology Technique 9. PetrochemicalTechnique BOUEDST CALABAR DELSU DELSUT EKSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N238. Secretarial Administration — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in English Language, Economics and three (3) other subjects plus at least a pass in Mathematics. For NBC holders, three (3) other Subjects could be from any of the following: Office Practice, Secretarial Duties, Principles of Accounts, Shorthand 80 WPM and Typewriting 35 WPM.
- Candidate brochure locations: Administration.pdf, PDF p.43, table row 4; course cell: SECRETARIAL ADMINISTRATION CRAWFORD OFFICEANDINFORMATION MANAGEMENT AUE DELSU DELSUT ELIZADE LCITY; Education.pdf, PDF p.9, table row 2; course cell: SECRETARIALEDUCATION: BAUCHI BENIN IAUED LASUED SAUED SECRETARIALADMINISTRATION OOU SECRETARIALADMINISTRATION ANDEDUCATION BENIN TASUED
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N239. Securities and Investment — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.14, table row 3; course cell: WELLSPRING SECURITIES AND INVESTMENT MOUNTAINTOP NASARAWA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N240. Securities and Investment — UTME

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: administration_offerings.json
- Current catalogue/source text: UTME SUBJECTS (i) AUN requires Mathematics, plus any other subjects from the following: Economics, Geography, Government, History, Literature in English, Biology, Physics, Chemistry and French. (ii) EBSU and IGBINEDION - as in Accounting. (iii) ESUTECH, UNN, OOU - Mathematics, Economics, plus any Social Science subject.
- Candidate brochure locations: Administration.pdf, PDF p.14, table row 3; course cell: WELLSPRING SECURITIES AND INVESTMENT MOUNTAINTOP NASARAWA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N241. Social Justice — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Mathematics, Geography and any two
- Candidate brochure locations: Social Management Science.pdf, PDF p.73, table row 2; course cell: POLICYANDSTRATEGIC STUDIES COVENANT POLICYAND ADMINISTRATIVE STUDIES CALABAR STRATEGIC MANAGEMENT NBU SOCIALJUSTICE ABUAD CLIFFORD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N242. Sociology — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Agriculture.pdf, PDF p.3, table row 3; course cell: (iv) Fisheries CALABAR Withoptionsin: (i) CropScience COOU CUN CUST EDWINCLARK FED-DUTSE Withoptionsin: (A) (i)AgricEconomics andExtension (ii)AnimalScience (iii)CropScience (iv)CropProtection (v)SoilScience (B)Fisheriesand Aquaculture (C)ForestryandWildlife Management FED-DUTSINMA Withoptionsin: (a) AgricEconomics, ExtensionandRural Sociology (b) AnimalHealth Production; Agriculture.pdf, PDF p.7, table row 3; course cell: yearin: (i) AgricEconomics. (ii) Agric Extension & Rural Sociology. (iii) AnimalProduction (iv) Plant Health Management (v) SoilScience& Agro-Climatology (v) Agronomy UMYUK OOU OAUSTECH PLASU RSU SLUK TSUJ UNIZIK Withoptionsin: i. AgricEconomics&Ext. ii. Animal Science & Technology iii. Crop Science & Horticulture iv. Fishery&Aquaculture; Agriculture.pdf, PDF p.8, table row 3; course cell: v. Food&Technology vi. Forestry&WildlifeMgt. vii.Soil Science & Technology UNN withoptionsin: i) Agric Business and Farm Management ii)AgricEconomics iii)AgricExt.andRural Sociology iv)AnimalProduction v)CropProduction vi)SoilScience&Farm Mechanisation. EKSU ESUTECH KUST withoptionsin: i.CropScience&Env.Sc. ii.AnimalProd.&CropSc. iii.Agric-Economics& Ext.Services. iv.Forestry,Wildlife& Fisheries BAYERO withoptionsin:; Agriculture.pdf, PDF p.29, table row 4; course cell: AGRIC-EXTENSION ANDRURAL SOCIOLOGY NDU OOU UMUDIKE AGRICULTURAL EXTENSIONAND MANAGEMENT NOUN AGRICULTURAL EXTENSION ABU DOU PHC; Arts _ Humanities.pdf, PDF p.68, table row 3; course cell: PLASU POL-ACAD REDEEMERS RENAISSANCE RITMAN SLUK UDA UNI-AFRICA UNIHEZ UNI-ILESA UNIOSUN UYO VERITAS ZAMFARA HISTORY/SOCIOLOGY AAUA HISTORY AND DIPLOMATICSTUDIES ANCHOR-UNI CALEB CHRISTOPHER CRAWFORD CLIFFORD; Arts _ Humanities.pdf, PDF p.125, table row 5; course cell: SOCIOLOGY COVENANT EVANGEL FED-KASHERE PLASU SALEM SOCIOLOGYAND ANTHROPOLGY FED-OTUOKE; Social Management Science.pdf, PDF p.103, table row 2; course cell: SOCIOLOGY AAU AAUA ABSU ABU ABU-ODL ABUAD ABUJA ACHIEVERS ADSU AL-HIKMAH AL-QALAM ARTHUR-JARVIS ATIBA BASU BAUK BAYERO BINGHAM BOSU BOWEN BSU CALABAR CARITAS CHRISTOPHER COAL-CITY COOU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N243. Sociology and Anthroplogy — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Social Management Science.pdf, PDF p.100, table row 1; course cell: SOCIOLOGYAND ANTHROPLOGY AKSU BAZE BENIN BIU EBSU ESUTECH IGBINEDION MAIDUGURI NDU OAU UNN UYO YSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N244. Sociology and Anthroplogy — UTME

- Current status: needs_review
- Review reason: direct_entry_prose_in_subject_cell
- Source index: social_management_offerings.json
- Current catalogue/source text: Two (2) 'A' Level passes including Government or History.
- Candidate brochure locations: Social Management Science.pdf, PDF p.100, table row 1; course cell: SOCIOLOGYAND ANTHROPLOGY AKSU BAZE BENIN BIU EBSU ESUTECH IGBINEDION MAIDUGURI NDU OAU UNN UYO YSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N245. Sociology and Social Studies — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: social_management_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required.
- Candidate brochure locations: Social Management Science.pdf, PDF p.106, table row 1; course cell: SOSU TSUJ UDA UDU UMYUK UNIHEZ UNI-ILESA UNIOSUN UNIZIK WESTERN-DEL WESLEYUNI YSU SOCIOLOGY AND SOCIAL STUDIES DOU INTELLIGENCE AND SECURITYSTUDIES ABUAD EKSU NDA NOVENA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N246. Sport Management (Education) — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) 'O' Level credit passes to include English Language and any two (2) of Biology, Economics, Geography, Government and Mathematics.
- Candidate brochure locations: No source candidate recorded by the local table audit.
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N247. Sport Science — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: sciences_offerings.json
- Current catalogue/source text: (i) Five (5) SSC credit passes/TC II merit passes including English Language, Biology or its equivalent. (ii) Five (5) SSC credit passes/TC II merit passes to include English Language and Mathematics.
- Candidate brochure locations: Education.pdf, PDF p.213, table row 2; course cell: SPORTSCIENCE OOU EXERCISEANDSPORTSSCIENCE LAPAI SPORTSADMINISTRATIONAND MANAGEMENT SPORTS-UNI SPORTSSCIENCEAND TECHNOLOGY SPORTS-UNI; Sciences.pdf, PDF p.156, table row 4; course cell: SPORTSCIENCE ABUAD
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N248. Strategic Communication — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics.
- Candidate brochure locations: Administration.pdf, PDF p.36, table row 3; course cell: ESUTECH MADONNA NASARAWA WELLSPRING WESTERN-DEL STRATEGIC COMMUNICATION ABUJA BSU DEVELOPMENTAND COMMUNICATIONSTUDIES ABUJA BSU IMSU RSU; Social Management Science.pdf, PDF p.68, table row 1; course cell: UYO VERITAS VISION-UNI WESLEYUNI WESTERN-DEL WESTLAND ZAMFARA MEDIAAND COMMUNICATION STUDIES ABUAD STRATEGIC COMMUNICATION PAN-ATLANTIC DEVELOPMENT COMMUNICATION DELSUT BROADCASTING ABUJA BSU CRUTECH EUI HENSARD PHC PHILOMATH IMSU MADONNA RSU DELSU
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N249. Systems Engineering — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: engineering_offerings.json
- Current catalogue/source text: Five (5) SSC credits including English Language, Mathematics, Further Mathematics, Physics and Chemistry.
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.68, table row 4; course cell: SYSTEMSENGINEERING AUN HUSTECH LAGOS DELSUT
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N250. TELECOMMUNICATION AND WIRELESS TECHNOLOGY — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.135, table row 4; course cell: COMMUNICATION TECHNOLOGY BELLS TAU TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN TELECOMMUNICATION ENGINEERING ABU ACHIEVERS AFIT-DEG AUN BAYERO BAZE BELLS COSMOPOLITAN FUTO MINNA SALEM TOPFAITH UNIZIK; Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N251. TELECOMMUNICATION AND WIRELESS TECHNOLOGY — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: sciences_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Engineering _ Enviromental _ Technology.pdf, PDF p.135, table row 4; course cell: COMMUNICATION TECHNOLOGY BELLS TAU TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN TELECOMMUNICATION ENGINEERING ABU ACHIEVERS AFIT-DEG AUN BAYERO BAZE BELLS COSMOPOLITAN FUTO MINNA SALEM TOPFAITH UNIZIK; Sciences.pdf, PDF p.209, table row 3; course cell: TELECOMMUNICATION ANDWIRELESS TECHNOLOGY AUN COMMUNICATIONS TECHNOLOGY OAUSTECH NOUN COMMUNICATIONAND DIGITALMEDIASTUDIES WIGWE LIBRARYAND INFORMATIONSCIENCE BAUCHI CRUTECH
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N252. Taxation — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: administration_offerings.json
- Current catalogue/source text: Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- Candidate brochure locations: Administration.pdf, PDF p.13, table row 3; course cell: FINANCEANDINVESTMENT PRIME-UNI WESLEYUNI FINANCEANDFINANCIAL TECHNOLOGY WIGWE TAXATION AVE-MARIA APU ALETHEIA BAYERO BSU CUN HAVILLA HUDA ISTIQAMA JEWEL KWASU LASU OOU PRIME-UNI SAM-MARIS UAGRIC-IMO UDU; Social Management Science.pdf, PDF p.29, table row 1; course cell: ODUDUWA PC-UNI PHILOMATH POL-ACAD REDEEMERS RENAISSANCE RHEMA SALEM SAU SOUTHWESTERN SPIRITAN SUMMIT UNI-AFRICA UNIKINGS VARITAS WESTERN-DEL TAXATION ADSU BENIN CALEB FED-DUTSE LAGOS MLU NASARAWA MAITAMA VENITE
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N253. Teacher Education — OLEVEL

- Current status: needs_review
- Review reason: cross_reference_or_shared_rule
- Source index: education_offerings.json
- Current catalogue/source text: As in Educational Management.
- Candidate brochure locations: Education.pdf, PDF p.149, table row 2; course cell: TEACHEREDUCATION SACOEDB.ED (with Teaching subject options in Political Science, Social Studies, Economics, Christian Religious StudiesandEnglish)
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N254. Teacher Education — UTME

- Current status: needs_review
- Review reason: cross_reference
- Source index: education_offerings.json
- Current catalogue/source text: As in Educational Management
- Candidate brochure locations: Education.pdf, PDF p.149, table row 2; course cell: TEACHEREDUCATION SACOEDB.ED (with Teaching subject options in Political Science, Social Studies, Economics, Christian Religious StudiesandEnglish)
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N255. Technology Education — DIRECT_ENTRY

- Current status: empty
- Review reason: no_source_text
- Source index: education_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.14, table row 1; course cell: (iii)OfficeManagement TechnologyEducation (iv)HomeEconomics; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.110, table row 1; course cell: METALWORKTECHNOLOGY EDUCATION ATAPOLY-DG BAUCHI CUST EDAKOKA FTBICHI-DEG ILORIN POTISKUM_D KATPOLY-DEG KSUSTA KUST LASUED WOODWORKTECHNOLOGY EDUCATION AEFUNA ATAPOLY-DG BAUCHI CUST KATPOLY-DEG KSUSTA KUST LASUED POTISKUM_D METALWORK/WOODWORK TECHNOLOGYEDUCATION FED-GUSAU KSUSTA; Education.pdf, PDF p.111, table row 1; course cell: MECHANICAL/AUTOMOBILE TECHNOLOGYEDUCATION EDUMUNZ AUTOANDMECHANICAL TECHNOLOGYEDUCATION UNIZIK EDUCATIONANDMECHANICAL ANDAUTOMECHANIC TECHNOLOGY EKSU; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N256. Technology Education — OLEVEL

- Current status: empty
- Review reason: no_source_text
- Source index: education_offerings.json
- Current catalogue/source text: —
- Candidate brochure locations: Education.pdf, PDF p.14, table row 1; course cell: (iii)OfficeManagement TechnologyEducation (iv)HomeEconomics; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.110, table row 1; course cell: METALWORKTECHNOLOGY EDUCATION ATAPOLY-DG BAUCHI CUST EDAKOKA FTBICHI-DEG ILORIN POTISKUM_D KATPOLY-DEG KSUSTA KUST LASUED WOODWORKTECHNOLOGY EDUCATION AEFUNA ATAPOLY-DG BAUCHI CUST KATPOLY-DEG KSUSTA KUST LASUED POTISKUM_D METALWORK/WOODWORK TECHNOLOGYEDUCATION FED-GUSAU KSUSTA; Education.pdf, PDF p.111, table row 1; course cell: MECHANICAL/AUTOMOBILE TECHNOLOGYEDUCATION EDUMUNZ AUTOANDMECHANICAL TECHNOLOGYEDUCATION UNIZIK EDUCATIONANDMECHANICAL ANDAUTOMECHANIC TECHNOLOGY EKSU; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N257. Technology Education — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: education_offerings.json
- Current catalogue/source text: EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23.
- Candidate brochure locations: Education.pdf, PDF p.14, table row 1; course cell: (iii)OfficeManagement TechnologyEducation (iv)HomeEconomics; Education.pdf, PDF p.98, table row 1; course cell: (I) Building (ii) ElectricalANDElectronics (iii) Mechanical/Metalwork MAUTY withoptionsin: (1) MechanicalTechnologyEducation (Prod/Auto) (2) Construction TechnologyEducation. (3) Electrical/Electronics TechnologyEducation. (4) AgriculturalMechanisation (5) ComputerTechnology (6) DraftingTechnology. 7) FineArts (8) PrintingTechnology (9) WoodTechnology REDEEMERS SAUED SSUET TASUED withoptionsin: AutomobileTechnology,Metal, Building,Electrical/Electronicsand Woodworks. EKSU; Education.pdf, PDF p.105, table row 1; course cell: INDUSTRIALTECHNOLOGY EDUCATION BOUEDST GUSAU-DEG withoptionsin: i. Electrical/ElectronicsTechnology ii. WoodWorkTechnology iii. MetalWorkTechnology REDEEMERS UMUDIKE UYO EDUCATIONTECHNOLOGY CALABAR EDAKOKA EDOBUDU EKSU IAUED MINNA SAUED TASUED TECHNOLOGYEDUCATION ILORIN withoptionsin: Woodwork,Metalwork,Building Technology,Electrical/Electronics Technology TSUJ; Education.pdf, PDF p.110, table row 1; course cell: METALWORKTECHNOLOGY EDUCATION ATAPOLY-DG BAUCHI CUST EDAKOKA FTBICHI-DEG ILORIN POTISKUM_D KATPOLY-DEG KSUSTA KUST LASUED WOODWORKTECHNOLOGY EDUCATION AEFUNA ATAPOLY-DG BAUCHI CUST KATPOLY-DEG KSUSTA KUST LASUED POTISKUM_D METALWORK/WOODWORK TECHNOLOGYEDUCATION FED-GUSAU KSUSTA; Education.pdf, PDF p.111, table row 1; course cell: MECHANICAL/AUTOMOBILE TECHNOLOGYEDUCATION EDUMUNZ AUTOANDMECHANICAL TECHNOLOGYEDUCATION UNIZIK EDUCATIONANDMECHANICAL ANDAUTOMECHANIC TECHNOLOGY EKSU; Education.pdf, PDF p.214, table row 1; course cell: ELECTRICAL/ELECTRONICS TECHNOLOGYEDUCATION AEFUNA CUST EBSU ESUTECH FC-GOMBE ILORIN KATPOLY-DEG MAITAMA ELECTRICALTECHNOLOGY LASUED BUILDINGEDUCATION EDAKOKA BUILDING AND WOODWORK TECHNOLOGYEDUCATION EDUMUNZ ESUTECH UNIZIK BUILDING TECHNOLOGY EDUCATION ATAPOLY-DG AEFUNA
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N258. Theology — UTME

- Current status: needs_review
- Review reason: unrecognized_utme_grammar
- Source index: arts_hum_offerings.json
- Current catalogue/source text: Government and any other two (2) Arts or Social Science subjects. Any three (3) subjects.
- Candidate brochure locations: Arts _ Humanities.pdf, PDF p.111, table row 3; course cell: RELIGIONANDHUMAN RELATIONS UNIZIK RELIGIOUSAND CULTURALSTUDIES AAU PHC UYO RELIGIONSANDINTER- CULTURALSTUDIES VERITAS THEOLOGY BOUEDST BINGHAM MADONNA WESLEYUNI
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N259. Transport Planning and Management — OLEVEL

- Current status: needs_review
- Review reason: sitting_condition
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) 'O' Level credit passes at one (1) sitting or six (6) 'O' Level credit passes at two (2) sittings in English Language, Mathematics and any three (3) of Economics, Government, Commerce, Accounting, Biology, Agricultural Science, Geography, Chemistry and Physics.
- Candidate brochure locations: Social Management Science.pdf, PDF p.17, table row 1; course cell: MARKETINGAND ADVERTISING VERITAS INSURANCE BENIN GREGORY JABU LASU TRANSPORTPLANNING ANDMANAGEMENT OOU TRANSPORT MANAGEMENT LAPAI LASUED MADUKA TRANSPORTAND LOGISTICS MANAGEMENT NAUB
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### N260. Vocational Education — OLEVEL

- Current status: needs_review
- Review reason: unrecognized_olevel_grammar
- Source index: education_offerings.json
- Current catalogue/source text: Five (5) 'O' Level credit passes to include English, Mathematics, Chemistry, Agricultural Science and Geography/Physics or TC Grade II.
- Candidate brochure locations: Education.pdf, PDF p.101, table row 2; course cell: VOCATIONALEDUCATION BAUCHI MAUTY (withoptionsin:) AgriculturalTechnicalEducation, HomeEconomics UYO
- Manual result: PENDING SOURCE REVIEW
- Capture: exact brochure text; page; table row; shared/inherited heading; decision; institution/variant scope.

### Current live database review rows

The live database currently reports 172 national rows with parse_status=needs_review. The table below preserves their current programme name and raw three-layer values, including rows added or changed after the repository classification snapshot.

| # | Programme | UTME source text | O-level source text | Direct Entry source text |
|---:|---|---|---|---|
| LIVE001 | ANTHROPOLOGY | Biology and two (2) Science subjects | Five (5)/six (6) SSCE credit passes at one (1) or two (2) sittings to include Mathematics, English Language and any other Science subjects. | Two (2) 'A' Level subjects to include Zoology/Biology/Botany |
| LIVE002 | ARCHEAOLOGY | Any three (3) relevant Science subject. | Five (5) or six (6) SSC credit passes at one (1) or two (2) sittings including English Language, Mathematics and other relevant subjects. Mathematics and two (2) other relevant subjects. | Two (2) 'A' Level passes chosen from Geography, Chemistry, Geology, Physics, Mathematics, Zoology and Botany or Biology. |
| LIVE003 | Accountancy and Forensic Studies | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE004 | Accounting and Data Analytics | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE005 | Accounting and Finance | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE006 | African and Asian Studies | Igbo and two (2) subjects from Arts and Social Sciences. | Five (5) SSC credit passes to include Igbo, English Language and anyotherArtssubject. | (i) Two(2)‘A’Level passesinIgbo andone (1) Arts/Social Sciences subject. (ii) NCE in Igbo and oneArtssubject. |
| LIVE007 | Agricultural Engineering | Mathematics, Chemistry, Physics | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any from Introduction to Agricultural Science, Materials and Workshop Process and Machining, and related technical subjects. | 'A' Level passes or equivalent in Physics and Mathematics. |
| LIVE008 | Agricultural and Bio-Resources Engineering | Mathematics, Chemistry, Physics | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or one of Agricultural Science, Further Mathematics and Technical Drawing at credit level. | A-Level/IJMB or approved equivalent pass in Mathematics (Pure/Applied), Physics and Chemistry, or a National Diploma in Agricultural Engineering or relevant Engineering discipline at Distinction or Upper Credit level plus at least one year Post ND experience. |
| LIVE009 | Agriculture | Chemistry, Biology/Agriculture, and one of Physics or Mathematics | Five (5) SSC credit passes to include English Language, Biology/Agricultural Science, Chemistry and any one of Mathematics, Physics, Geography and Economics. | Two (2) `A' Level passes in Chemistry and one from Biology/Botany/Zoology/Agricultural Science, Economics, Physics, Geography and Geology/Mathematics (Pure & Applied). |
| LIVE010 | Anthropology | Any three (3) of History, CRS/IRS, Geography, Economics, Literature in English and French | Five (5) SSC credit passes to include one of Government/History, Religious Studies, Geography and Economics. | Any two (2) `A' Level passes in Arts subjects. |
| LIVE011 | Applied Geophysics | Any three (3) of Physics, Chemistry, Biology and Mathematics. | Five (5) SSC credit passes including English Language, Mathematics, Physics and Chemistry/Biology. | 'A' Level passes in Chemistry and Physics or Mathematics. |
| LIVE012 | Applied Physics | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | Two (2) 'A' Level passes in Physics and Mathematics. |
| LIVE013 | Arabic Language and Literature Studies | Arabic and two (2) subjects from Arts and/or Social Sciences (same as in Arabic Studies) | Same as in Arabic Studies (Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects). | Two (2) 'A' Level passes in the relevant subjects. |
| LIVE014 | Archaeology | Any two (2) subjects from Arts, Social Sciences and one of History, Religious Studies, Government and Geography. | Five (5) SSC credit passes to include English Language and one of the following subjects, Religious Studies, Geography, Economics and History. | Two (2) 'A' Level passes in Arts or Social Sciences and one Science subject. |
| LIVE015 | Architecture | Physics, Mathematics, and one of Chemistry, Geography, Art, Biology, Economics | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any of Fine Art, Geography or Wood Work, Biology, Economics, Technical Drawing, Further Mathematics, Introduction to Building Construction, Bricklaying/Block laying, Concreting, Wall Floors and Ceiling Finishing, Joinery, Carpentry, Decorative Painting, Lining, Sign and Design, Wall Hanging, Colour Mixing/Matching and Glazing, Ceramics, Graphics Design, Graphic Printing, Basic Electricity | (i) Two (2) 'A' Level passes chosen from Mathematics or Physics and Chemistry, Geography or Fine Arts. (ii) ND/HND upper credits in relevant field. |
| LIVE016 | Aviation Security | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE017 | BIOLOGY | Biology, Chemistry and Physics or Mathematics. | Five (5) SSC credit passes to include English Language, Biology, Chemistry and Mathematics/Physics. | (i) Two (2) 'A' Level passes from Chemistry, Biology, Botany/Zoology. (ii) NCE merit accepted. |
| LIVE018 | Banking and Finance | Mathematics, Economics, plus any one (1) of Government and Geography. | Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE019 | Biotechnology | AGRICULTURE/VET.MEDICINE B.Agric.Tech.) DVM] 35 Fisheries 36 Fisheries 37 Food 38 Food 39 Food 40 Forestry 41 Forestry/Forest 42 Forestry 43 Forestry 44 Forestry, 45 Forestry 46 Home 47 Home 48 Home 49 Horticulture 50 Hotel 51 Livestock 52 Nutrition 53 Pasture & 54 Plant 55 Plant Science 56 Plant Science 57 Plant Science 58 Plant 59 Plant 60 Public & 61 Soil Science 62 Soil Science 63 Soil Science. | — | — |
| LIVE020 | Building | OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering. | — | — |
| LIVE021 | Business Education | Mathematics, Economics, and one (1) of Literature in English, History, Government, Geography, Chemistry and Physics | Five (5) TC II merit, 'O' Level or NTC/NBC credit passes including English Language, Mathematics, Economics and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of the following: Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand. | (i) Two (2) 'A' Level passes or NCE merit in two (2) relevant subjects. (ii) NCE merit in Business Education Double Major. |
| LIVE022 | Christian Studies | OF ARTS (Hons.)] International Relations 53. German/Russian 54. 55. Environmental 56. 57. 58. 59. Archaeology 60. Studies 61. 62. Studies 63. Studies 64. Studies 65. 66. | Five (5) SSC credit passes in English Language, CRS and three (3) other relevant subjects. | Two (2) 'A' Level passes/NCE to include CRS/Religious Studies. |
| LIVE023 | Civil Law | Any three (3) Arts or Social Science subjects. | Five (5)'O' Level credit passes to include English Language, Literature in English and Mathematics. | (i) Two (2)'A' Level passes in Arts or Social Science subjects. (ii) NCE/ND/First Degree (Second Class Lower). |
| LIVE024 | Classical Studies | Literature in English or History and any other two (2) subjects | Five (5) SSC credit passes at one sitting or Six (6) SSC credit passes at two (2) sittings to include English Language, Literature in English or History, one Arts or Social Science subject and any other subject. | (i) Two (2) 'A' Level passes including Literature in English or History. (ii) NCE in relevant subjects. |
| LIVE025 | Common and Islamic Law | Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies | Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic. | Two (2) A' level passes to include Islamic Studies or Arabic |
| LIVE026 | Communication Arts | Any three (3) Arts or Social Science subjects | Five (5) SSC credit passes or equivalent including English Language, Literature in English, Arts/Music depending on the combination. | Two 'A' Level passes or equivalent in Arts or Social Science subjects. |
| LIVE027 | Computer and Information Science | OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering. | — | — |
| LIVE028 | Cooperative Economics and Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any other two (2) subjects. For NBC Holders, the other subjects could be from the following: Principles of Accounts, Commerce, and Accounts. | Two (2) `A' Level passes chosen from Mathematics, Economics and Business Management. |
| LIVE029 | Criminology and Security Studies | — | (x) AAUA: for Criminology and Security Studies, requires five (5) `O' Level credit passes to include English Language, Government/History, Mathematics and two other subjects from Social Science/Arts. (xxiv) FED-OYE EKITI: For Criminology and Security Studies FED-OYE EKITI accepts five (5) SSC credit passes including English Language, Mathematics, Government and anyone from(Economics, Commerce, Geography and one Science or Arts subjects at SSC. (xxxviii) FED-DUTSE: For Criminology and Security Studies, FED-DUTSE accepts; five (5) `O' Level credit passes SSC or its equivalent to include English Language, Mathematics with any two (2) Social Science subjects and any one Arts subject at not more than two (2) sittings. | — |
| LIVE030 | Crop Production | Chemistry, Biology/Agriculture, Mathematics or Physics | Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics. | Two (2) 'A' Level passes in Chemistry and Biology/Agricultural Science/Botany/Zoology or Physics/Mathematics/Economics. |
| LIVE031 | Crop Protection | Chemistry, Biology/Agricultural Science, Mathematics or Physics | Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics (shares requirements with Crop Production umbrella block). | Two (2) 'A' Level passes in Chemistry and Biology/Agricultural Science/Botany/Zoology or Physics/Mathematics/Economics (as in Crop Production). |
| LIVE032 | Crop Science | AGRICULTURE/VET.MEDICINE B.Agric.Tech.) DVM] 35 Fisheries 36 Fisheries 37 Food 38 Food 39 Food 40 Forestry 41 Forestry/Forest 42 Forestry 43 Forestry 44 Forestry, 45 Forestry 46 Home 47 Home 48 Home 49 Horticulture 50 Hotel 51 Livestock 52 Nutrition 53 Pasture & 54 Plant 55 Plant Science 56 Plant Science 57 Plant Science 58 Plant 59 Plant 60 Public & 61 Soil Science 62 Soil Science 63 Soil Science. | — | — |
| LIVE033 | Development and Communication Studies | Literature in English, Economics and Government. | Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics. | Two (2) 'A' Level passes in Literature in English, Economics or Government. |
| LIVE034 | ELECTRONICS AND COMMUNICATIONS | Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a. | Five (5) SSC credit passes in English Language , Mathematics and any three (3) of Biology, Chemistry, Physics, Further Maths, andTechnical Drawing. | Two (2) 'A' Level passes in Mathematics and Physics |
| LIVE035 | ELECTRONICS AND COMPUTER SYSTEMS | Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a. | Five (5) SSC credit passes in English Language , Mathematics and any three (3) of Biology, Chemistry, Physics, Further Maths, andTechnical Drawing. | Two (2) 'A' Level passes in Mathematics and Physics |
| LIVE036 | ELECTRONICS AND COMPUTER TECHNOLOGY | Mathematics, UTME Physics and any other Science subject Mathematics, Physics and any (1) of Chemistry, Economics and Biology. a. | Five (5) SSC credit passes in English Language , Mathematics and any three (3) of Biology, Chemistry, Physics, Further Maths, andTechnical Drawing. | Two (2) 'A' Level passes in Mathematics and Physics |
| LIVE037 | Earth Science | Any three (3) of Physics, Chemistry, Biology and Mathematics. | OAU requires five (5) 'O' Level credit passes in English Language, Chemistry, Biology/Further Mathematics, Mathematics and Physics. (Heading continues past line range; columns blank in range.) | 'A' Level passes in Chemistry and Physics or Mathematics. |
| LIVE038 | Education and Business Administration | Mathematics, and any two (2) of Economics, Government, History, Literature in English | Five (5) 'O' Level or NTC/NBC credit passes in English Language and Mathematics plus three (3) other subjects. | NCE or 'A' Level passes in two (2) of Accounting, Business Management, Government, and Economics. |
| LIVE039 | Efik-Ibibio | Literature in English, and two (2) other Arts or Social Science subjects | Five (5) SSC credit passes or equivalent including English | Two (2) 'A' Level passes or equivalent in Arts or Social Science subjects. |
| LIVE040 | Electrons | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE041 | Employment and Human Resource Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE042 | Energy Studies | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE043 | Entrepreneurship | Economics, Mathematics and one (1) other Social Science or Commercial subject. | Five (5) SSC credit passes to include English Language, Mathematics, Economics, one (1) Science subject and one (1) other Social Science or Commercial subject. | Two (2) 'A' Level passes to include Economics and one (1) of, Accounts, Business Management, Government, Geography or Mathematics. |
| LIVE044 | Entrepreneurship and Business Management | Economics, Mathematics and one (1) other Social Science or Commercial subject. | Five (5) SSC credit passes to include English Language, Mathematics, Economics, one (1) Science subject and one (1) other Social Science or Commercial subject. | Two (2) 'A' Level passes to include Economics and one (1) of Accounts, Business Management, Government, Geography or Mathematics. |
| LIVE045 | Entrepreneurship and Innovation | Economics, Mathematics and one (1) other Social Science or Commercial subject. | Five (5) SSC credit passes to include English Language, Mathematics, Economics, one (1) Science subject and one (1) other Social Science or Commercial subject. | Two (2) 'A' Level passes to include Economics and one (1) of Accounts, Business Management, Government, Geography or Mathematics. |
| LIVE046 | Environmental Biology | Mathematics, Physics, Chemistry or a) Geography subject combination which includes Mathematics and two (2) of Environmental. | — | — |
| LIVE047 | Environmental Management | Mathematics, Physics, Chemistry or a) Geography subject combination which includes Mathematics and two (2) of Environmental. | — | — |
| LIVE048 | Environmental Management and Technology | Chemistry, Biology, Mathematics/Physics | Five (5) SSC credit passes in English Language, Chemistry, Biology Science, Physics and Mathematics. | Two (2) 'A' Level passes in Chemistry and any one of Biology, Agricultural Science, Botany and Zoology. |
| LIVE049 | Environmental Management and Toxicology | MADONNA and EBSU accept 'O' Level pass in Physics with 'O' Level credit pass in Mathematics; IMSU, COOU, UYO and EBSU accept 'O' Level pass in English Language. (UTME subjects column shared with grouped block; see waivers.) | Five (5) 'O' Level credit passes (varies by institution). FED-DUTSE: for Environmental Management and Toxicology accepts English Language, Mathematics, Chemistry, Geography and Biology or Agric. Science (max two sittings) plus at least pass in Physics. CUAB: English Language, Mathematics, Chemistry and Geography with pass in Physics, Biology and Agricultural Science. BSU for Microbiology accepts passes in five prescribed subjects in Preliminary Science of BSU. | Varies by institution (see waivers); column shared with grouped block. |
| LIVE050 | Environmental Standards | UTME: (i) AUN same as in Finance (ii) BIU accepts credit/merit in English Language and Mathematics at TC II as 'O' Level equivalent. (iii) EVANGEL- Economics is not compulsory but accepts any three (3) relevant subjects. (iv) FED-DUTSINMA requires Five `O' level Credits to include: English Language, Mathematics, Economics/Financial Accounting and any other two Management or Social Sciences subjects. (v) FED-WUKARI – Same as in Economics. (vi) JOS in addition to the UTME requirements requires two (2) `O' Level credit passes in any of Business Studies, Commerce, Government, Principles of Accounts, Geography and Biology. (vii) LAGOS requires five (5) 'O' Level credit passes to include English Language, Mathematics, Economics and any two (2) from Financial Accounting/Principles of Accounting, Further Mathematics, Literature in English, Geography, Government, Biology, Business Management, and Data Processing/Computer Studies. (viii) PHC does not accept Commercial subjects except Financial Accounting or Business Methods/Management. (ix) PHC requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. (x) PLASU accepts Commerce or Principles of Accounting In lieu of Economics. (xi) UNN requires five (5) O' Level credit passes to include English Language, Mathematics Economics and any other two (2) relevant subjects. For NBC holders, the other two (2) relevant subjects could be from any of Accounting, Principles of Accounts, Commerce, Office Practice and Secretarial Duties. (xii) UYO requires `O' Level credit pass in Economics. (xiii) LCITY requires `O' Level credit passes in English Language, Mathematics, Economics/Commerce and any other two (2) subjects. (xiv) AAUA requires five (5) `O' Level credit passes to include English Language, Mathematics, Economics/Commerce, and two others from Accounting/Bookkeeping, Geography and Government. (xv) ABU requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) other subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. UTME SUBJECTS (i) AUN same as in Finance. (ii) BSU requires Economics. (iii) IGBINEDION accepts Commerce In lieu of Economics. (iv) CARITAS requires Mathematics, Economics plus any Social Science or Arts subject. (v) EVANGEL accepts Principles of Accounts In lieu of Mathematics. (vi) FED-DUTSINMA requires Mathematics, English Language, Economics/Financial Accounting and any other Social and Management Science subject. (vii) LAGOS accepts Mathematics, Economics, plus one (1) Subject from the following: Financial Accounting, Further Mathematics, Geography, Government, Literature in English and Biology. (viii) OAU requires Principles of Accounts not Commerce. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) other subjects. ForNBCholders, the othertwo(2) relevant subjectscouldbe from anyof Principlesof Accounts, Commerce, of fice Practiceand SecretarialDuties. | Two(2)‘A’Level passes chosen from Economics, Accounting, Business Management, Governmentand Geography. |
| LIVE051 | FORENSIC SCIENCE | — | UTME: (i) FUTA requires five (5) five SSC credit passes or its equivalent at a maximum of two (2) sittings in the following subjects: English Language, Mathematics, Physics, Chemistry, Biology/Agricultural Science. (ii) OAU accepts Physics or Biology. (iii) ABSU requires 'O' Level credit pass in Physics. (iv) IMSU and COOU accept 'O' Level pass in English Language. (v) UMUDIKE same as in Food Science and Technology. (vi) NDU requires five (5) 'O' Level credit passes at not more than two (2) sittings. (vii) CRUTECH- Same as Biological Science. (viii) AJAYI requires five (5) 'O' Level credit passes which must include English language, Mathematics, Chemistry, Physics, and Biology at one (1) sitting or six (6) 'O' Level credit passes at not more than two (2) sittings. (ix) MAIDUGURI accepts 'O' Level passes in English Language and Mathematics. (x) CUAB accepts 'O' Level credit pass in Agricultural Science in lieu of Biology. (xi) EBSU requires 'O' Level credit pass in Mathematics or Physics. (xii) BELLS require five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics, Biology/Geography/Further Mathematics/Agricultural Science. (xiii) REDEEMER'S requires five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and Biology/Agricultural Sciences. (xiv) WESTERN-DEL requires five (5) 'O' Level credit passes which must include Chemistry, English Language, Biology, Mathematics and Physics. (xv) PLASU – Same as in Chemistry. (xvi) GOUU accepts 'O' Level credit pass in any other Science subject in lieu of Physics. (xvii) KWASU accepts 'O' Level credit passes in Further Mathematics and Agricultural Science. (xviii) RENAISSANCE requires (5) five 'O' Level credit passes at not more than two (2) sittings. (xix) MAKURDI - Candidates seeking admission into any of these programmes must possess five (5)'O' Level credit passes from one (1) examination body (i.e. either WAEC or NECO) and obtained at not more than two (2) sittings. The department does not accept the combination of both WAEC and NECO. Students of the University of Agriculture, Makurdi Pre-degree Remedial Science Programme who pass their end of session examinations are considered for admission on the condition that they also pass the UTME. NOTE: Agricultural Science and Health Science shall not be accepted in place of Biology. Further Mathematics shall not be accepted in place of Physics or Mathematics. (xx) SAU accepts 'O' Level credit passes in Technical Drawing, Agricultural Science or Geography in lieu of Physics. (xxi) UMYUK requires five (5) 'O' Level credit passes at not more than two (2) sittings. (xxii) SOUTHWESTERN – Same as Microbiology. (xxiii) LANDMARK accepts in lieu of Physics 'O' Level credit passes in any of the following subjects: Further Mathematics, Technical Drawing, Agricultural Science, Food and Nutrition. (xxiv) SOSU accepts HND lower credit or ND upper credit in Science Laboratory Technology, Food Science Technology or its equivalent. (xxv) ODUDUWA accepts 'O' Level credit pass in Agricultural Science or Health Science in place of Biology. (xxvi) FED-DUTSINMA accepts Five `O' level Credits including: English Language, Mathematics, Physic, Chemistry and Biology. (xxvii) UNIKINGS accepts five (5) credits at SSC in English Language, Chemistry, Physics, Mathematics and Biology. (xxviii) EUI requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Chemistry, Physics and Biology at not more than two (2) sittings. (xxix) DELSU requires five (5) `O' Level credits and must include English Language, Mathematics, Physics, Chemistry and Biology. (xxx) FED-GASHUA requires five (5) SSC credit passes in English, Mathematics, Biology, Chemistry, Physics. (xxxi) AAUA requires five (5) `O' Level credit passes to include English Language, Biology, Chemistry, Physics and Mathematics. (xxxii) FED-DUTSE requires five (5) 'O' Level credit passes at SSC level or its equivalent to include Englsih Language, Mathematics, Biology, Chemistry and Physics. (xxxiii) RSU requires five (5) 'O' Level credit passes to include English Language, Mathematics, Biology, Physics and Chemistry. (xxxiv) MOUNTAIN TOP requires five (5) credit passes at SSC or its equivalent to include English Language, Mathematics, Biology, Chemistry and Physics at not more than two (2) sittings. (xxxv) FUTO requires five (5) `O' level credit passes in English Language, Chemistry, Mathematics, Physics and Biology in not more than two (2) sittings. (xxxvi) ILORIN requires five (5) `O' Level Credit passes in English Language, Mathematics, Physics, Chemistry and Biology. (xxxvii) FED-WUKARI requires Candidates must obtain Five (5) Credits at not more than two sittings including English Language, Mathematics, Chemistry, Biology and any one from the following subjects; Physics/Agricultural Science/Health Science/Animal Husbandry obtained from Senior School Certificate(SSCE), National Examination Council(NECO), National Business and Technical Examination Board(NABTEB) or its equivalent. (xxxviii) CARITAS requires Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or Agricultural Science. (xxxix) MAUTY requires Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Physics and Biology. (xl) LAGOS requires Five O/Level credit passes in English Language, Mathematics, Biology, Chemistry and Physics. (xli) FED-LOKOJA requires Five (5) SSC credit passes to include English Language, Mathematics, Physics, Chemistry and Biology. (xlii) ABU requires Five `O' level credit passes in English Language, Mathematics, Biology, Chemistry and Physics. (xliii) PHC requires Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Physics and Biology. (xliv) FED-LAFIA requires Five (5) Credit passes at SSCE, GCE, NECO and NABTEB O' Level examination in Mathematics, English Language, Biology, Chemistry and Physics in not more than two sittings. (xlv) FED-KASHERE accepts Five credit passes at SSCE (or its equivalent) in English, Mathematics, Chemistry, Physics and Biology. (xlvi) KASU accepts Five `O' level credit passes to include English Language, Mathematics, Biology, Chemistry and Physics. (xlvii) LANDMARK accepts Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology and one of the following Physics, Agricultural Science, Food and nutrition. | (lix) FUTO requires; a) At least two (2) `A' Level passes not below Grade C in Chemistry and Biology. b) ND/HND at Upper Credit level in life sciences. c) First Degree in life sciences. d) Very good passes in three JUPEB subjects namely Chemistry, Biology and Physics or Mathematics. It does not accept NCE. Candidates must in addition meet the `O' Level requirements. |
| LIVE052 | Family, Nutrition and Consumer Sciences | Chemistry, Biology/Agriculture Science, Mathematics/Physics | Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology, Physics and any one of the following: Fine Arts, Textile, Construction, Technical Drawing, Home Management, Food and Nutrition. | Two (2) 'A' Level passes or equivalent in Chemistry and Biology/Botany/Agricultural Science/Economics/Physics/Mathematics/Geography. |
| LIVE053 | Film and Video Studies | English, and any other subjects in Arts or Social Science. | Five (5) SSC credit passes to include Mathematics, English Language, Literature in English and any two (2) subjects in Science and any other subject. | Two (2) 'A' Level passes principally in Arts or Social Science Subjects. |
| LIVE054 | Finance | Mathematics, Economics, plus any one (1) of Government and Geography. | Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE055 | Finance and Financial Technology | Mathematics, Economics, plus any one (1) of Government and Geography. | Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE056 | Finance and Investment | Mathematics, Economics, plus any one (1) of Government and Geography. | Five (5) SSC credit passes to include English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE057 | Fine Art/Fine and Applied Arts | Fine Arts and any other subjects, or Social Science subjects | Five (5) SSC credit passes to include English Language and Fine Arts. | (i) Two (2) `A' Level passes in Arts or Fine Arts and any other subject. (ii) ND upper credit / HND lower credit from recognised institutions. |
| LIVE058 | Food Science and Engineering | i. Mathematics, Chemistryand Physicsor Biology. | Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology/Agricultural Science and Physics | Two (2) 'A' Level passes in Chemistry and Biology/Physics/Agricultural Science/Botany/Zoology. |
| LIVE059 | Food Technology | i. Mathematics, Chemistryand Physicsor Biology. | — | — |
| LIVE060 | Forestry and Fisheries | as in Agricultural Economics and Extension | — | — |
| LIVE061 | French | French, and any other two (2) subjects from Arts and Social Sciences | Five (5) SSC credit passes including French and English Language plus one other Arts subject. | Two (2) `A' Level passes including French and one other Arts subject. |
| LIVE062 | Fulfulde | Any three (3) Arts subjects | Five (5) SSC credit passes in Arts/Social Science subjects. | Two (2) `A' Level passes in Arts and Social Science subjects. |
| LIVE063 | Gas Engineering | Chemistry, Mathematicsand Physics. | Five(5) SSCcreditsto includePhysics, Chemistry, Mathematics, EnglishLanguageand anyoneScience subject. | 'A'Levelpassesto includePhysics, Chemistryand Mathematics. |
| LIVE064 | Geography | Geography and one (1) other science subject. Mathematics, Geography and any other two (2) Science subjects. | Five (5) SSC credit passes to include English Language, Mathematics, Geography and any two (2) of Biology, Chemistry, Physics and Agricultural Science. | Two (2) 'A' Level passes in Geography and one (1) other science subject. |
| LIVE065 | Geography and Environmental Studies | Geography, and any two (2) other Arts or Social Science subjects | Five (5) SSC credit passes to include English Language, Geography and any other three (3) subjects from Arts/Social Sciences with at least 'O' Level pass in Mathematics. | No Direct Entry. |
| LIVE066 | Geography and Geosciences | OAU require Mathematics, Physics and Chemistry; CALABAR does not accept Biology; FUPRE requires Physics, Mathematics and Chemistry; FED-OYE EKITI requires Physics and Mathematics, Chemistry or Biology; OAUSTECH requires Physics, Mathematics and any one of Chemistry, Biology and Geography; FUTA requires Physics, Mathematics and Chemistry; MOUNTAIN TOP requires Physics, Mathematics and any one of Chemistry/Biology/Agricultural Science/Geography; FUPRE requires Mathematics, Chemistry and Physics; ILORIN requires Physics, Mathematics and Chemistry; LAGOS requires English Language, Mathematics, Physics and Chemistry; FED-KASHERE requires Physics, Chemistry and Mathematics. | Five 'O' Level credit passes. OAU: English Language, Chemistry, Biology/Further Mathematics, Mathematics and Physics. FUTA: English Language, Physics, Mathematics, Chemistry and one of Biology/Geography/Technical Drawing (max two sittings). FUPRE: English Language, Biology, Mathematics, Physics and Chemistry. FED-OYE EKITI: English, Mathematics, Physics and Chemistry. OAUSTECH: English Language, Physics, Chemistry, Mathematics and Biology/Geography. LAGOS: English Language, Mathematics, Physics, Chemistry and Biology. ILORIN: English Language, Physics, Mathematics, Chemistry and one of Further Mathematics/Biology/Geography. FED-KASHERE: English, Mathematics, Physics, Chemistry and any of Further Mathematics/Geography/Biology. (heading begins before line range; this programme is partial) | National Diploma (Upper Credit) in Electrical Engineering, Petroleum Engineering, Geology and Mining, Physics or Computer Science (one option visible at top of range). |
| LIVE067 | Geoscience | Any three (3) of Physics, Chemistry, Biology and Mathematics. | Five (5) SSC credit passes including English Language, Mathematics, Physics and Chemistry/Biology. | 'A' Level passes in Chemistry and Physics or Mathematics. |
| LIVE068 | Government and Public Administration | UTME SUBJECTS | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE069 | HOME SCIENCE | Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, UTME Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. | — | — |
| LIVE070 | HUMAN BIOLOGY | three (3) relevant Science subject. Biology, Chemistry and Physics or Mathematics. | Five (5) SSC credit passes to include English Language, Biology, Chemistry and Mathematics/Physics. | (i) Two (2) 'A' Level passes from Chemistry, Biology, Botany/Zoology. (ii) NCE merit accepted. |
| LIVE071 | History and International Relations | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE072 | History and International Studies | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE073 | Home Economics | Chemistry, Biology/Agriculture, Mathematics/Physics or one (1) Social Science subject | Five (5) SSC credit passes in Chemistry, Biology/Agricultural Science, Mathematics, Physics, English Language and any one of Nutrition, Fine Arts, Textile, Construction, Technical Drawing, Basic Electricity, Basic Catering and Food Services, Bakery and Confectioneries, General Metal Work, Men Garment Construction and Finishing, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing, Ladies Garment Construction and Finishing. | Two (2) 'A' Level passes or equivalents in Chemistry and Biology/Botany/Agricultural Science/Economics/Physics/Mathematics/Geography/Accounting. |
| LIVE074 | Home Economics and Food Management | Biology, Chemistry, any other Science subject | Five (5) credits at SSC or equivalent in English, Mathematics, Chemistry, Agricultural Science or Biology or Home Economics, and any other science subject, preferably Physics. | (i) At least 2 'A' Level passes in Chemistry, Agricultural Science or Biology, Physics or Home Economics. (ii) NCE credit/merit and ND credit in addition to five (5) credit in SSC or equivalents. |
| LIVE075 | Home Economics and Hotel Management | Chemistry, Biology or Agricultural Science, and one (1) other subject | Five (5) 'O' Level NTC/NBC credit passes or TC II merit including English Language, Mathematics, Home Economics, Biology and Chemistry. | (i) NCE merit in Home Economics; (ii) 'A' Level passes in two (2) of Chemistry or any Biology, Botany and Agricultural Science; (iii) ND/HND credit in Home Economics or Food Science or Hotel and Catering Management or any other related programme. |
| LIVE076 | Home Science & Management | Chemistry, Biology/Agricultural Science, Physics/Mathematics or one (1) social science subject (Economics or Geography) | Five (5) SSC credit passes including Chemistry, Biology/Agricultural Science, Mathematics and at least 'O' Level pass in English Language and Physics, and any one of General Metal Work, General Wood Work, Building/Engineering Drawing, Furniture Design and Construction, Upholstery Design and Construction, Spray Painting and Period Furniture, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing and Basic Electricity. | Two (2) 'A' Level passes or equivalents in Chemistry and Biology/Botany/Agricultural Science/Economics/Physics/Mathematics/Geography/Accounting. |
| LIVE077 | Home Science, Nutrition and Dietetics | Mathematics, Economics and one (1) other subject. | and at least 'O' Level pass in English LanguageandPhysics. General Metal Work, General Wood Work, Building/Engineering Drawing, Furniture Design and Construction, Upholstery Design and Construction, Spray Painting and Period Furniture, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing and Basic Electricity. | Economics/Physics/ Mathematics/Geograph y/Accounting. |
| LIVE078 | Hotel Management and Tourism | Biology, Chemistry, any other Science subject | Five (5) credits at SSC or equivalent in English, Mathematics, Chemistry, Agricultural Science or Biology or Home Economics, and any other science subject, preferably Physics. | (i) At least 2 'A' Level passes in Chemistry, Agricultural Science or Biology, Physics or Home Economics. (ii) NCE credit/merit and ND credit in addition to five (5) credit in SSC or equivalents. |
| LIVE079 | Human Resources Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE080 | ICT Engineering | Mathematics, Physics, Chemistry | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and one of Biology, Economics and Geography at not more than two (2) sittings. | 'A' Level/IJMB/ND/HND upper credit in relevant programmes (Information Technology, Computer Science/Engineering, Electrical and Electronic Engineering) into 200/300 level. |
| LIVE081 | Industrial Design | Chemistry, Mathematics, and Fine Arts/Physics | Five (5) SSC credit passes to include English Language, Fine Art, Mathematics, Chemistry. Spinning; Weaving; Surface Design and Printing; Bleaching, Dyeing and Finishing; Ceramics; Graphic Design; Graphic Printing; Decorative Painting, Spray Painting, Lining, Sign and Design, Wall Hanging, Colour Mixing/Matching and Glazing, Building/Engineering Drawing, General Wood Work. | (i) 'A' Level passes in Two (2) of Fine Arts, Chemistry, Mathematics, and Physics. (ii) ND in Industrial Design or Glass Technology or Fine Art at credit level. |
| LIVE082 | Industrial Physics | Physics, Mathematics and Physics, Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | Two (2) 'A' Level passes in Physics and Mathematics. |
| LIVE083 | Industrial Relations and Human Resources Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE084 | Industrial Relations and Personnel Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE085 | Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management | Mathematics, Economics and one other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE086 | Information and Media Studies | Government, Economics and any other subject. | Five (5) SSC credit passes to include English Language, Economics and Government. For NBC holders, the other relevant subjects could be from any of the following: Accounting, Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) `A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE087 | Intelligence and Security Studies | Three (3) Social Science or Arts subjects. | Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required. | Two (2) 'A' Level passes including Government or History. |
| LIVE088 | International Relations and Diplomacy | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE089 | International Relations and Diplomatic Studies | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE090 | International Relationship & Strategic Studies | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE091 | International Studies | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE092 | International Studies and | History/Governm entandanyother two (2) subjects fromtheArtsand SocialSciences. | — | — |
| LIVE093 | International and Comparative Politics | Economics, Literature in English and Geography/Government/History. | Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects. | Two (2) 'A' Level passes in Social Science subject from Government/History, Economics, Sociology and Business Management. |
| LIVE094 | Islamic Law/Sharia Law | Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies | Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic. | Two (2) A' level passes to include Islamic Studies or Arabic |
| LIVE095 | Islamic Studies | English Language, Islamic Studies and any two (2) subjects. | Five (5) SSC credit passes to include English Language, Islamic Studies or Arabic and any three (3) relevant subjects. | Two (2) `A'Level passes to include Islamic Studies. |
| LIVE096 | Land Surveying | Physics, Mathematics, Chemistry/Geography/Art/Biology/Economics | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any of Fine Art, Geography, Wood Work, Biology, Economics, Technical Drawing, Further Mathematics or Introduction to Building Construction. | For Land Surveying: a. Two 'A' Level/IJMB passes in Mathematics and any of Physics, Chemistry or Geography. b. ND at Upper Credit in Land Surveying/Geomatics, Geoinformatics, Civil Engineering, Physics/Mathematics, Building. c. HND at Lower Credit in Land Surveying/Geomatics, Civil Engineering. |
| LIVE097 | Library and Information Science | EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23. | — | — |
| LIVE098 | Linguistics | Arabic and two (2)subjectsfrom Arts and/or SocialSciences. Sameasin ArabicStudies. | — | — |
| LIVE099 | Linguistics/Edo | Two (2) relevant Arts subjects, and any other subject | Five (5) SSC credit passes or TC II merits including English Language, Literature in English and a Nigerian Language preferably Edo. 'O' Level pass in Mathematics is optional. | (i) Two (2) 'A' Level passes in GCE or HSC or a recognised equivalent in any two (2) Arts subjects. (ii) NCE in any two (2) Arts subjects with an overall Merit level pass. |
| LIVE100 | Local Government Studies | Government/History, Economics and any other subject. | Five (5) SSC credit passes including English Language, Government or History, Economics and any other two (2) subjects and at least a pass in Mathematics. | Two (2) 'A' Level/IJMB passes one (1) of which must be in Government or History. |
| LIVE101 | MARINE BIOLOGY | Biology, Chemistry and Physics or Mathematics. | Five (5) SSC credit passes to include English, Language, Mathematics, Biology, Chemistry and any other Sciencesubject. | Two (2) 'A' Level passes in Biology andChemistry. |
| LIVE102 | MARINE BIOLOGY & FISHERIES | Biology, & Chemistry Physics or Mathematics. | Five (5) SSC credit passes to include English, Language, Mathematics, Biology, Chemistry and any other Science subject. | Two (2) 'A' Level passes in Biology and Chemistry. |
| LIVE103 | METEOROLOGY | Mathematics, Physics, Chemistry or Geography | Five (5) SSC credit passes including Physics, Mathematics and English Language and either Chemistry or Geography | (i) ND upper credit in Meteorology in addition to the 'O' Level requirements. OR (ii) WMO Class II Certificate in Weather Forecasting in addition to the 'O' Level requirements. (iii) 'A' Level passes in Mathematics and Physics in addition to the SSC requirements. |
| LIVE104 | METEOROLOGY AND CLIMATE SCIENCE | Mathematics, Physics, Chemistry or Geography. | Five (5) SSC credit passes including Physics, Mathematics and English Language and either Chemistry or Geography | (i) ND upper credit in Meteorology in addition to the 'O' Level requirements. OR (ii)WMO Class II Certificate in Weather Forecasting in addition to the 'O' Level requirements. (iii) 'A' Level passes in Mathematics and Physics in addition to the SSC requirements. |
| LIVE105 | Mass Communication | Literature in English, Economics and Government. | Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics. | Two (2) `A' Level passes in Literature in English, Economics or Government. |
| LIVE106 | Mathematics and Economics / Mathematics with Economics | Mathematics, Economics and any other Science or Social Science subject. | Five (5) SSC credit passes in English Language, Mathematics, Economics and any other two (2) subjects selected from Science or Social Sciences at not more than two (2) sittings. | (i) Two (2) 'A' Level passes at not more than two (2) sittings. The subjects should include Mathematics and Economics. (ii) ND upper credit in Mathematics/Statistics, Computer Science, Accounting or Business Studies from a recognised Polytechnic or College of Technology. (iii) HND lower credit in Mathematics/Statistics, Computer Science, Accounting or Business Studies from a recognised Polytechnic or College of Technology. (iv) NCE credit in Mathematics and Economics from a recognised College of Education with merit. |
| LIVE107 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | Maths, Physics and Chemistry or Biology and Additional/Further Mathematics. | Five (5) SSC credit passes to include English Language, Mathematics and at least three (3) of Physics, Chemistry, Biology and Additional/Further Mathematics. | (i) Two (2) 'A' Level passes in Mathematics and either Physics or Chemistry. (ii) NCE merit in Mathematics and either Physics or Chemistry. |
| LIVE108 | Medical Biochemistry | Physics, Chemistry and Biology. 433. | Five(5) SSC credit passesinEnglish Language, Mathematics, Physics, Chemistryand Biology. Five (5) SSC credit passes in English Language, Physics, Chemistry, Biology and Mathematics. | Two(2)'A'Level passesinChemistry andanyoneof Physics, Biology/ Zoology/Botanyand Mathematics. Three(3)'A'Level passestoinclude Chemistry, Biology/Zoologyand Physics. |
| LIVE109 | Meteorology | Mathematics, Physics, Chemistry or Geography | Five (5) SSC credit passes including Physics, Mathematics, English Language and either Chemistry or Geography. | (i) 'A' Level passes in Mathematics and Physics. (ii) ND upper credit level in Meteorology. (iii) NMO Class II Certificate in Weather Forecasting, plus 'O' Level SSC requirements. |
| LIVE110 | Modern Language and Translation | Programme A: French and any other two (2) subjects, Programme B: any three (3) subjects | For Programme A: five (5) SSC credit passes including English Language and French. For Programme B: credit passes in English Language and four (4) other subjects. | (i) Two (2) `A' Level passes or NCE in French for French programme. (ii) Two (2) `A' Level passes or NCE in any subjects. |
| LIVE111 | NATURAL AND ENVIRONMENTAL SCIENCE | Any subject combination which includes Mathematics and any two (2) of Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. | Five (5) SSC credit passes including English Language, Mathematics, and any other three (3) subjects from Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. | 'A' Level passes chosen from English Language, Mathematics, Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. (ii) ND/HND. (iii) A level Cambridge. |
| LIVE112 | OCEANOGRAPHY | Biology, Chemistry and Physics or Mathematics. | Five (5) SSC credit passes to include English, Language, Mathematics, Biology, Chemistry and any other Sciencesubject. | Two (2) 'A' Level passes in Biology andChemistry. |
| LIVE113 | OPERATIONS RESEARCH | Mathematics and any other two (2) either Science or Social Science subjects. | Five (5) SSC credit passes in English Language, Mathematics, Chemistry and one (1) other subject. | Two (2) 'A' Level passes in Mathematics and any one (1) of Physics, Chemistry, Statistics, Economics or Geography. (ii) ND credit in Statistics or Mathematics. |
| LIVE114 | Office and Information Technology / Information Resource Management | Economics and two (2) other subjects. | Five (5) SSC credit passes in English Language, Economics and three (3) other subjects plus at least a pass in Mathematics. For NBC holders, three (3) other subjects could be from any of the following: Office Practice, Secretarial Duties, Principles of Accounts, Shorthand 80 WPM and Typewriting 35 WPM. | Two (2) 'A' Level passes chosen from Economics, Accounting and Business Management. |
| LIVE115 | PHYSICS | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE116 | PHYSICS WITH ELECTRONICS | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE117 | Peace Strategic and Conflict Resolution | Three (3) Arts or Social Science subjects. | Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics. | Two (2) 'A' Level passes in Government and one other Social Science subject. |
| LIVE118 | Peace Studies and Conflict Resolution | Three (3) Arts or Social Science subjects. | Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics. | Two (2) 'A' Level passes in Government and one other Social Science subject. |
| LIVE119 | Peace and Conflict Studies | Three (3) Arts or Social Science subjects. | Five (5) SSC credit passes including English Language, Government or History and at least a pass in Mathematics. | Two (2) 'A' Level passes in Government and one other Social Science subject. |
| LIVE120 | Personnel Management | Mathematics, Economics plus one (1) other subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics. |
| LIVE121 | Philosophy | Any three (3) subjects | Five (5) SSC credit passes to include English Language and four (4) other relevant subjects. | Any two (2) 'A' Level passes. |
| LIVE122 | Physics and Applied Physics | Physics, Mathematics and Physics, Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | Two (2) 'A' Level passes in Physics and Mathematics. |
| LIVE123 | Physics and Computer Electronic | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE124 | Physics and Energy Studies | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE125 | Physics with Solar Energy | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE126 | Physics/Astrology | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE127 | Physics/Industrial Physics | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | NCE/Two (2) 'A' Level passes in Physics and Mathematics or Chemistry. |
| LIVE128 | Plant Science | Biology, Chemistry and Physics or Mathematics. | — | — |
| LIVE129 | Policy and Administrative Studies | as in Policy and Strategic Studies (shared requirements column; no separate UTME SUBJECTS column shown for this heading) | as in Policy and Strategic Studies (shared requirements column) | as in Policy and Strategic Studies (shared requirements column) |
| LIVE130 | Policy and Strategic Studies | Government and any other two (2) from the following Economics, Geography, History Accounting, Commerce | Five (5) SSC credit passes including English Language Government and a pass in Mathematics 'O' Level | Two 2 'A' Level passes in Social Sciences including Geography and Economics. |
| LIVE131 | Political Science | Government or History plus two (2) other Social Science/Arts subjects. | Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required. | Two (2) 'A' Level passes including Government or History. |
| LIVE132 | Political Science / International Law and Diplomacy | as in Political Science (no separate requirements column shown for this heading; the rightward area continues the Political Science DIRECT ENTRY/UTME waiver list) | as in Political Science | as in Political Science |
| LIVE133 | Political Science and Conflict | Government/History, and two (2) other Social Sciences or Arts subjects | Five (5) SSC credit passes to include English Language, Government/History and any other three (3) subjects from Arts/Social Sciences with at least 'O' Level pass in Mathematics. | Two (2) 'A' Level passes to include Government or History. |
| LIVE134 | Political Science and Conflict Resolution | as in Political Science and Public Administration (no separate requirements column shown for this heading) | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE135 | Political Science and Defence Studies | as in Political Science and Public Administration (no separate requirements column shown for this heading) | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE136 | Political Science and Diplomacy | as in Political Science (no separate requirements column shown for this heading) | as in Political Science | as in Political Science |
| LIVE137 | Political Science and International Relations | as in Political Science and Public Administration (no separate requirements column shown for this heading; rightward area continues the shared DIRECT ENTRY/UTME waiver list) | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE138 | Political Science and International Studies | as in Political Science and Public Administration (no separate requirements column shown for this heading) | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE139 | Political Science and Public Administration | Three (3) Arts or Social Science subjects | Five (5) SSC credit passes including English Language Government or History and at least a pass in Mathematics | Two (2) 'A' Level passes in Government and one other Social Science subject |
| LIVE140 | Political and Administrative Studies | as in Political Science and Public Administration (no separate requirements column shown for this heading) | as in Political Science and Public Administration | as in Political Science and Public Administration |
| LIVE141 | Portuguese/English | French and any other two (2) subjects from Arts and Social Sciences. | Five (5) SSC credit passes including French and English Language plus one other Arts subject. | Two (2) `A' Level passes including French and one other Arts subject. |
| LIVE142 | Procurement | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE143 | Procurement Management | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE144 | Public Administration | Mathematics, Economics and any other Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and two (2) other relevant subjects. | Two (2) 'A' Level passes including Economics. |
| LIVE145 | Public Relations and Advertising | Same as in Mass Communication | Same as in Mass Communication | Same as in Mass Communication |
| LIVE146 | Public and International Law | As in Civil Law | As in Civil Law | As in Civil Law |
| LIVE147 | Pure Physics | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | — |
| LIVE148 | Pure and Applied Physics | Physics, Mathematics and Chemistry or Biology. | Five (5) SSC credit passes in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. | Two (2) 'A' Level passes in Physics and Mathematics. |
| LIVE149 | Pure and Industrial Chemistry | Physics, Mathematicsand Chemistryor Biology. Chemistry, Biology and Physics or Mathematics. | Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Physics and Biology/Agricultural Science. | (i) Two (2) 'A' Level passes in Chemistry and Mathematics (ii) ND in Science Technology or ND in relevant programmes with the UTME requirements. |
| LIVE150 | Quantity Surveying | Physics, Mathematics, and any of Chemistry, Geography, Art, Biology, Economics | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any of Fine Art, Geography or Wood Work, Biology, Economics, Technical Drawing, Further Mathematics, Introduction to Building Construction, Bricklaying/Block laying, Concreting, Wall Floors and Ceiling Finishing, Joinery, Carpentry, Decorative Painting, Lining, Sign and Design, Wall Hanging, Colour Mixing/Matching and Glazing, Ceramics, Graphics Design, Graphic Printing, Basic Electricity | (i) Two (2) 'A' Level passes chosen from Mathematics or Physics and Chemistry, Geography or Fine Arts. (ii) ND/HND upper credits in relevant field. |
| LIVE151 | Religious Studies | CRS/IRS, any other two (2) subjects | Five (5) SSC credit passes to include English Language and CRS/IRS. | Two (2) 'A' Level subjects to include Religious Studies (CRS/IRS). |
| LIVE152 | Russian with French/German | Literature in UTME English, one other Arts subject and another Arts or Social Science subject. French and any two (2) other Arts/Social Science subjects. | Five (5) SSC credit passes to include French, English Language and any three (3) othersubjects. | Two (2) ‘A’ Level passes including the Foreign Language(s) whereapplicable. |
| LIVE153 | Science Laboratory Technology | UDU and FUTA accept Agricultural Science in lieu of Biology; UNIOSUN, SALEM, MAKURDI and BENIN require Biology, Chemistry and Physics; CALABAR and UYO require Physics as the third subject; EVANGEL and AJAYI require Biology and Chemistry and any other Science subject; UNIOSUN requires Mathematics, Biology and Chemistry; FED-DUTSE (a) For Microbiology requires Biology, Physics and Chemistry, (b) For Environmental Management and Toxicology requires Chemistry, and two of Physics, Biology and Mathematics. | Five (5) 'O' Level credit passes (varies by institution; see waivers). Note: column shared across grouped Microbiology/SLT/Environmental programmes. Typical: English Language, Mathematics, Chemistry, Biology and Physics. | Varies by institution (see waivers). Note: heading lists option set with options in: 1. Biological Science Technique, 2. Biotechnology Technique, 3. Biochemistry Technique, 4. Chemistry Technique, 5. Geology Technique, 6. Microbiology Technique, 7. Physics/Electronics Technique, 8. Physiology/Pharmacology Technique, 9. Petrochemical Technique. |
| LIVE154 | Secretarial Administration | Economics and Two (2) other subjects. | Five (5) SSC credit passes in English Language, Economics and three (3) other subjects plus at least a pass in Mathematics. For NBC holders, three (3) other Subjects could be from any of the following: Office Practice, Secretarial Duties, Principles of Accounts, Shorthand 80 WPM and Typewriting 35 WPM. | Two (2) 'A' Level passes chosen from Economics, Accounting and Business Management. |
| LIVE155 | Securities and Investment | UTME SUBJECTS (i) AUN requires Mathematics, plus any other subjects from the following: Economics, Geography, Government, History, Literature in English, Biology, Physics, Chemistry and French. (ii) EBSU and IGBINEDION - as in Accounting. (iii) ESUTECH, UNN, OOU - Mathematics, Economics, plus any Social Science subject. | Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE156 | Social Innovation and Entrepreneurship | Economics, Mathematics and one (1) other Social Science or Commercial subject. | Five (5) SSC credit passes to include English Language, Mathematics, Economics, one (1) Science subject and one (1) other Social Science or Commercial subject. | Two (2) 'A' Level passes to include Economics and one (1) of Accounts, Business Management, Government, Geography or Mathematics. |
| LIVE157 | Social Justice | Geography and any two (2) subjects from the Sciences or Social Sciences. | Five (5) SSC credit passes to include English Language, Mathematics, Geography and any two | 'A' Level passes, ND or NCE merit in Science or Social Science subjects or Programmes. |
| LIVE158 | Social Standards | Mathematics, Economics plus any Social Science subject. | Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties. | Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government and Geography. |
| LIVE159 | Sociology and Anthroplogy | Two (2) 'A' Level passes including Government or History. | Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required. | Three (3) Social Science or Arts Subjects. |
| LIVE160 | Sociology and Social Studies | Three (3) Social Science or Arts subjects. | Five (5) SSC credit passes in Government or History, English Language and three (3) other subjects. A pass in Mathematics is required. | Two (2) 'A' Level passes including Government or History. |
| LIVE161 | Sport Management (Education) | Biology, Mathematics, Economics, Geography | Five (5) 'O' Level credit passes to include English Language and any two (2) of Biology, Economics, Geography, Government and Mathematics. | Two (2) 'A' Level passes in any of the following: Economics, Geography, Biology, Chemistry, Mathematics and Physics; or NCE in PHE with Grade three (3) Referees Certificate in a sport. |
| LIVE162 | Sport Science | Biology and any two (2) relevant subjects. | (i) Five (5) SSC credit passes/TC II merit passes including English Language, Biology or its equivalent. (ii) Five (5) SSC credit passes/TC II merit passes to include English Language and Mathematics. | (i) Two (2) 'A' Level passes in any of Biology, Chemistry, Physics and Mathematics. (ii) NCE merit in Physical Education and credit in Arithmetical process or Mathematics. (iii) Diploma in Health Education, Environmental Sanitation, Physical Education, Social work, Health Administration with overall grades of merit plus three (3) 'O' Level credit passes/TC II merit which should include English Language. (iv) NCE in Biology, Health Education, and Integrated Science with a pass grade plus two (2) 'O' Level credit passes/TC II merit passes. (v) Registered Nurse plus five (5) 'O' Level credit passes to include English Language. |
| LIVE163 | Statistics Education | Mathematics, Physics, Chemistry, Biology | Five (5) SSC credit passes to include English Language, Mathematics plus one (1) other Science subject. | Two (2) 'A' Level passes/NCE in Mathematics and one (1) Science subject. |
| LIVE164 | Strategic Communication | Literature in English, Economics and Government. | Five (5) SSC credit passes to include English Language, Literature in English and Government plus a pass in Mathematics. | Two (2) 'A' Level passes in Literature in English, Economics or Government. |
| LIVE165 | Surveying and Geoinformatics | Physics, Mathematics, and any of Chemistry, Geography, Art, Biology and Economics. | Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any of Fine Art, Geography or Wood Work, Biology, Economics, Technical Drawing, Further Mathematics, Introduction to Building Construction, Bricklaying/Block Laying, Concreting, Wall, Floors and Ceiling Finishing, Joinery, Carpentry, Decorative Painting, Lining, Sign & Design, Wall Hanging, Colour Mixing/Matching & Glazing, Ceramics, Graphics Design, Graphic Printing, Basic Electricity. | (i) Two (2) 'A' Level passes chosen from Mathematics or Physics and Chemistry, Geography or Fine Arts. (ii) ND/HND upper credit in relevant programmes. |
| LIVE166 | Taxation | Mathematics, Economics, plus any one (1) of Government and Geography. | Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics. | Two (2) 'A' Level passes chosen from Accounting, Economics, Management, Mathematics, Geography and Statistics. |
| LIVE167 | Teacher Education | As in Educational Management | As in Educational Management. | As in Educational Management. |
| LIVE168 | Technology Education | EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23. | — | — |
| LIVE169 | Theology | Government and any other two (2) Arts or Social Science subjects. Any three (3) subjects. | Five (5) SSC credit passes to include English Language and CRS/IRS. | Two (2) 'A' Level subjects to include Religious Studies (CRS/IRS). |
| LIVE170 | Transport Planning and Management | Geography, Economics, Government, Mathematics, Chemistry, Biology, Physics, Agricultural Science, Accounting, Commerce | Five (5) 'O' Level credit passes at one (1) sitting or six (6) 'O' Level credit passes at two (2) sittings in English Language, Mathematics and any three (3) of Economics, Government, Commerce, Accounting, Biology, Agricultural Science, Geography, Chemistry and Physics. | i. Two (2) 'A' Level passes in Geography or Economics and one other subject. ii. NCE merit in Geography and other Social Science or Science subjects. iii. ND/HND in Town Planning, Estate Management, Surveying. |
| LIVE171 | Urban and Regional Planning | Mathematics, Geography, and one of Economics, Physics, Chemistry | Five (5) SSC credit passes in English Language, Mathematics, Geography, and any two (2) of Physics, Chemistry, Economics, Government, Biology, Art, History, IRK/CRK, Social Studies and Tech Drawing. | (i) Two (2) A'Level passes in Geography and Mathematics. (ii) ND/HND upper credit in Town Planning or related programmes plus UTME requirements are accepted. |
| LIVE172 | Vocational Education | Mathematics, Economics, plus one (1) of Literature in English, History, Government, Geography/Physics, Chemistry and Physics | Five (5) 'O' Level credit passes to include English, Mathematics, Chemistry, Agricultural Science and Geography/Physics or TC Grade II. | (i) NCE credit in Agricultural Science Education; (ii) ND upper credit in Agricultural Science; (iii) HND lower credit in relevant programme of Agricultural Science. For the Home Economics option: (i) NCE merit in Home Economics; (ii) ND lower credit in Home Economics. For Industrial Technical Education: (i) Two (2) 'A' Level passes in Physics and Mathematics; (ii) ND lower credit in Civil Engineering, Production/Electrical Engineering; (iii) Final City and Guilds or its equivalent plus National Technical Certificate; (iv) NCE credit in Technical Education plus 'O' Level credit passes in Physics or Mathematics. |

The one current live database row with parse_status=unparsed is: International Studies and Diplomacy. Its UTME, O-level, and Direct Entry fields are all null. Confirm the original brochure row before adding any rule.

## Part 2 — Layers with no resolved brochure source candidate

Total rows listed: **120**. These are not proven to be absent from the original PDFs; the local extraction did not produce a safe source candidate. Search the printed programme name, spelling variants, faculty block, and continuation headings in the original brochure before marking them source_missing.

### U001. Applied Microbiology and Brewing / Applied Microbiology — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) 'A' Level passes in Biology and Chemistry. (ii) NCE merit in Biology and Chemistry. (iii) ND/HND in Biology or Food Technology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U002. Applied Microbiology and Brewing / Applied Microbiology — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language, Mathematics, Chemistry, Physics and Biology or Health Science.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U003. Applied Microbiology and Brewing / Applied Microbiology — UTME

- Current catalogue text: Mathematics, Chemistry and Biology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U004. Arabic Language and Literature Studies — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes in the relevant subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U005. Arabic Language and Literature Studies — OLEVEL

- Current catalogue text: Same as in Arabic Studies (Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U006. Arabic Language and Literature Studies — UTME

- Current catalogue text: Arabic and two (2) subjects from Arts and/or Social Sciences (same as in Arabic Studies)
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U007. BIOLOGICAL SCIENCE(S) — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) 'A' Level passes to include one (1) of Botany, Zoology, Biology or Chemistry. (ii) ND/NCE in related programme/subject.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U008. BIOLOGICAL SCIENCE(S) — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language, Mathematics, Chemistry, Biology and any other Science subject. UTME: (i) UNN - as in combined courses. (ii) MAKURDI accepts 'O' Level pass in English Language. (iii) BSU requires 'O' Level credit passes in English Language, Physics or Geography. (iv) OOU accepts 'O' Level credit pass in any other subject from Physics and Geography. (v) NDU requires the five (5) 'O' Level credit passes at not more than two (2) sittings. (vi) BAUCHI requires 'O' Level pass in Physics. (viii) PAAU, FED-LOKOJA, OAUSTECH and CRUTECH require 'O' Level credit pass in Physics as the fifth (5th) subject. (ix) FUNAAB require five (5) 'O' Level credit passes to include English Language, Mathematics, Chemistry, Biology and Physics. (x) FUTA requires five (5) 'O' Level credit passes in English Language, Mathematics, Physics, Chemistry, Biology or Agricultural Science at not more than two (2) sittings. (xi) GOUU requires five (5) 'O' Level credit passes at not more than two (2) sittings in subjects which must include English Language, Mathematics, Chemistry, Physics and Biology. (xii) NDA requires one (1) other Science subject from Physics, Further Mathematics or Agricultural Science. (xiii) FUTO requires five (5) `O' level credit passes in English Language, Chemistry, Mathematics, Physics and Biology in not more than two (2) sittings. (xiv) ABU requires Five `O' level credit passes in English Language, Mathematics, Biology, Chemistry and Physics. (xv) KASU requires Five `O' level credit passes to include English Language, Mathematics, Biology, Chemistry and one other Science subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U009. BIOLOGICAL SCIENCE(S) — UTME

- Current catalogue text: Biology, Chemistry and Physics or Mathematics. UTME SUBJECT (i) MAUTY and FUTA require, Chemistry, Biology/Agricultural Science and either Mathematics or Physics. (ii) AUE accepts Mathematics, Chemistry and Physics. (iii) OAUSTECH accepts Agricultural Science in lieu of Physics and Mathematics. (iv) FUTO requires Biology, Chemistry and Physics/Mathematics. (v) ABU requires Use of English, Biology, Chemistry, and Physics. (vi) KASU requires Biology, Chemistry and two other Science subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U010. Biology/Biotechnology — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U011. Biology/Biotechnology — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U012. Biology/Biotechnology — UTME

- Current catalogue text: Biology, Chemistry and either Physics or Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U013. Computer and Information Science — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U014. Computer and Information Science — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U015. Computer and Information Science — UTME

- Current catalogue text: OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U016. Drama/Dramatic Arts/Performing Arts — DIRECT_ENTRY

- Current catalogue text: Two (2) `A' Level passes in Arts, Social Sciences or Science subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U017. Drama/Dramatic Arts/Performing Arts — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language and Arts subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U018. Drama/Dramatic Arts/Performing Arts — UTME

- Current catalogue text: Literature in English; and two (2) other relevant subjects
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U019. ENGINEERING PHYSICS — DIRECT_ENTRY

- Current catalogue text: 'A' Level Passes in Physics and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U020. ENGINEERING PHYSICS — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Physics and one (1) other subject
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U021. ENGINEERING PHYSICS — UTME

- Current catalogue text: Physics, Chemistry and Mathematics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U022. Eco-Tourism and Wildlife Management — DIRECT_ENTRY

- Current catalogue text: ND with a minimum of upper credit or equivalent from recognized Polytechnics and Colleges of Wildlife Management in relevant programs (Agricultural Sciences); or candidates with 'A' Level passes in at least two (2) of Chemistry, Biology, Physics and Geography or Economics, plus UTME requirements.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U023. Eco-Tourism and Wildlife Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language, Mathematics, Biology or Agricultural Science, Chemistry and any other relevant subject (shares block with Agribusiness umbrella).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U024. Eco-Tourism and Wildlife Management — UTME

- Current catalogue text: English Language; Biology/Agricultural Science; any two (2) of Chemistry, Geography, Economics, Mathematics and Physics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U025. Electrical/Electronic Engineering — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes in Mathematics, Physics or Chemistry.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U026. Electrical/Electronic Engineering — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include Mathematics, Physics, Chemistry, English Language and any other Science subject.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U027. Electrical/Electronic Engineering — UTME

- Current catalogue text: Mathematics; Physics; Chemistry
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U028. Employment and Human Resource Management — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U029. Employment and Human Resource Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U030. Employment and Human Resource Management — UTME

- Current catalogue text: Mathematics, Economics plus one (1) other subject.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U031. Environmental Management and Technology — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes in Chemistry and any one of Biology, Agricultural Science, Botany and Zoology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U032. Environmental Management and Technology — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Chemistry, Biology Science, Physics and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U033. Environmental Management and Technology — UTME

- Current catalogue text: Chemistry; Biology; Mathematics/Physics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U034. Environmental Science and Technology — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U035. Environmental Science and Technology — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U036. Environmental Science and Technology — UTME

- Current catalogue text: Biology and any two (2) of Physics, Chemistry and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U037. Farm Management & Agric. Extension — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes in Chemistry and one of Zoology/Botany/Agricultural Science/Biology, Geography, Mathematics, Physics, Geology, Economics and Health Science (as in Agricultural Economics).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U038. Farm Management & Agric. Extension — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology/Agricultural Science and one of Geography, Physics and Economics (shares requirements with Agricultural Economics umbrella block).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U039. Farm Management & Agric. Extension — UTME

- Current catalogue text: Chemistry; Biology/Agricultural Science; Mathematics or Physics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U040. Fine Art/Fine and Applied Arts — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) `A' Level passes in Arts or Fine Arts and any other subject. (ii) ND upper credit / HND lower credit from recognised institutions.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U041. Fine Art/Fine and Applied Arts — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language and Fine Arts.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U042. Fine Art/Fine and Applied Arts — UTME

- Current catalogue text: Fine Arts and any other subjects; or Social Science subjects
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U043. French and German/Russian — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U044. French and German/Russian — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U045. French and German/Russian — UTME

- Current catalogue text: French and any other two (2) subjects from Arts and Social Sciences.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U046. Geography and Environmental Studies — DIRECT_ENTRY

- Current catalogue text: No Direct Entry.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U047. Geography and Environmental Studies — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language, Geography and any other three (3) subjects from Arts/Social Sciences with at least 'O' Level pass in Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U048. Geography and Environmental Studies — UTME

- Current catalogue text: Geography; and any two (2) other Arts or Social Science subjects
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U049. Home Economics and Hotel Management — DIRECT_ENTRY

- Current catalogue text: (i) NCE merit in Home Economics; (ii) 'A' Level passes in two (2) of Chemistry or any Biology, Botany and Agricultural Science; (iii) ND/HND credit in Home Economics or Food Science or Hotel and Catering Management or any other related programme.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U050. Home Economics and Hotel Management — OLEVEL

- Current catalogue text: Five (5) 'O' Level NTC/NBC credit passes or TC II merit including English Language, Mathematics, Home Economics, Biology and Chemistry.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U051. Home Economics and Hotel Management — UTME

- Current catalogue text: Chemistry; Biology or Agricultural Science; and one (1) other subject
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U052. Home Science & Management — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes or equivalents in Chemistry and Biology/Botany/Agricultural Science/Economics/Physics/Mathematics/Geography/Accounting.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U053. Home Science & Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes including Chemistry, Biology/Agricultural Science, Mathematics and at least 'O' Level pass in English Language and Physics, and any one of General Metal Work, General Wood Work, Building/Engineering Drawing, Furniture Design and Construction, Upholstery Design and Construction, Spray Painting and Period Furniture, Spinning, Weaving, Surface Design and Printing, Bleaching, Dyeing and Finishing and Basic Electricity.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U054. Home Science & Management — UTME

- Current catalogue text: Chemistry; Biology/Agricultural Science; Physics/Mathematics or one (1) social science subject (Economics or Geography)
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U055. Hotel Management & Tourism — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes or equivalents in Chemistry and Biology/Botany/Agric Science/Economics/Physics/Mathematics/Geography.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U056. Hotel Management & Tourism — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U057. Hotel Management & Tourism — UTME

- Current catalogue text: Chemistry and any two (2) of Biology/Botany/Agricultural Science, Economics, Physics, Mathematics and Geography.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U058. ICT Engineering — DIRECT_ENTRY

- Current catalogue text: 'A' Level/IJMB/ND/HND upper credit in relevant programmes (Information Technology, Computer Science/Engineering, Electrical and Electronic Engineering) into 200/300 level.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U059. ICT Engineering — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and one of Biology, Economics and Geography at not more than two (2) sittings.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U060. ICT Engineering — UTME

- Current catalogue text: Mathematics; Physics; Chemistry
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U061. INFORMATION AND MEDIA TECHNOLOGY — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U062. INFORMATION AND MEDIA TECHNOLOGY — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U063. INFORMATION AND MEDIA TECHNOLOGY — UTME

- Current catalogue text: Mathematics, Physics and one of Biology, Chemistry, Agric Science, Economics and Geography.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U064. Industral Mathematics/Computer — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U065. Industral Mathematics/Computer — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U066. Industral Mathematics/Computer — UTME

- Current catalogue text: Mathematics and two (2) of Physics, Chemistry, Economics, Biology and Agricultural Science.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U067. Industrial Relations / Industrial and Labour Relations — DIRECT_ENTRY

- Current catalogue text: i) Two (2) 'A' Level passes chosen from Economics, Accounting, Government, Geography and Statistics. ii) NCE in related programme.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U068. Industrial Relations / Industrial and Labour Relations — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U069. Industrial Relations / Industrial and Labour Relations — UTME

- Current catalogue text: Mathematics, Economics plus one other relevant subject
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U070. Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes chosen from Economics, Accounting, Business Management, Government, Geography and Statistics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U071. Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U072. Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management — UTME

- Current catalogue text: Mathematics, Economics and one other subject.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U073. Islamic Law/Sharia Law — DIRECT_ENTRY

- Current catalogue text: Two (2) A' level passes to include Islamic Studies or Arabic
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U074. Islamic Law/Sharia Law — OLEVEL

- Current catalogue text: Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U075. Islamic Law/Sharia Law — UTME

- Current catalogue text: Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U076. Marine Science and Technology — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U077. Marine Science and Technology — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U078. Marine Science and Technology — UTME

- Current catalogue text: Biology and any two (2) of Physics, Chemistry and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U079. Mathematics and Economics / Mathematics with Economics — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) 'A' Level passes at not more than two (2) sittings. The subjects should include Mathematics and Economics. (ii) ND upper credit in Mathematics/Statistics, Computer Science, Accounting or Business Studies from a recognised Polytechnic or College of Technology. (iii) HND lower credit in Mathematics/Statistics, Computer Science, Accounting or Business Studies from a recognised Polytechnic or College of Technology. (iv) NCE credit in Mathematics and Economics from a recognised College of Education with merit.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U080. Mathematics and Economics / Mathematics with Economics — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Economics and any other two (2) subjects selected from Science or Social Sciences at not more than two (2) sittings.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U081. Mathematics and Economics / Mathematics with Economics — UTME

- Current catalogue text: Mathematics, Economics and any other Science or Social Science subject.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U082. Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) 'A' Level passes in Mathematics and either Physics or Chemistry. (ii) NCE merit in Mathematics and either Physics or Chemistry.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U083. Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics — OLEVEL

- Current catalogue text: Five (5) SSC credit passes to include English Language, Mathematics and at least three (3) of Physics, Chemistry, Biology and Additional/Further Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U084. Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics — UTME

- Current catalogue text: Maths, Physics and Chemistry or Biology and Additional/Further Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U085. Medical Laboratory Technology/Science — DIRECT_ENTRY

- Current catalogue text: 'A' Level passes to include Physics, Chemistry and Biology or Zoology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U086. Medical Laboratory Technology/Science — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U087. Medical Laboratory Technology/Science — UTME

- Current catalogue text: Chemistry; Physics; Biology/Zoology
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U088. Medicine and Surgery (Human Medicine) — DIRECT_ENTRY

- Current catalogue text: 'A' Level passes in Physics, Chemistry and Biology or Zoology in addition to the UTME requirements; or B.Sc, B.OS, etc in relevant programme.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U089. Medicine and Surgery (Human Medicine) — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U090. Medicine and Surgery (Human Medicine) — UTME

- Current catalogue text: English Language; Physics; Chemistry; Biology
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U091. Modern Language and Translation — DIRECT_ENTRY

- Current catalogue text: (i) Two (2) `A' Level passes or NCE in French for French programme. (ii) Two (2) `A' Level passes or NCE in any subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U092. Modern Language and Translation — OLEVEL

- Current catalogue text: For Programme A: five (5) SSC credit passes including English Language and French. For Programme B: credit passes in English Language and four (4) other subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U093. Modern Language and Translation — UTME

- Current catalogue text: Programme A: French and any other two (2) subjects; Programme B: any three (3) subjects
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U094. Office and Information Technology / Information Resource Management — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes chosen from Economics, Accounting and Business Management.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U095. Office and Information Technology / Information Resource Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in English Language, Economics and three (3) other subjects plus at least a pass in Mathematics. For NBC holders, three (3) other subjects could be from any of the following: Office Practice, Secretarial Duties, Principles of Accounts, Shorthand 80 WPM and Typewriting 35 WPM.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U096. Office and Information Technology / Information Resource Management — UTME

- Current catalogue text: Economics and two (2) other subjects.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U097. Pasture & Range Management — DIRECT_ENTRY

- Current catalogue text: Two 'A' Level passes or equivalent in Chemistry and one of Biology/Botany/Zoology/Agricultural Science/Geography/Geology/Mathematics/Economics (as in Animal Production and Health).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U098. Pasture & Range Management — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language (shares requirements with Animal Production and Health umbrella block).
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U099. Pasture & Range Management — UTME

- Current catalogue text: Chemistry; Biology/Agricultural Science; Physics/Mathematics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U100. Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U101. Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U102. Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) — UTME

- Current catalogue text: Physics, Mathematics and Chemistry or Biology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U103. Physics with Computational Modeling — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U104. Physics with Computational Modeling — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U105. Physics with Computational Modeling — UTME

- Current catalogue text: Physics, Mathematics and Chemistry or Biology.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U106. Plant Breeding and Seed Technology — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U107. Plant Breeding and Seed Technology — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U108. Plant Breeding and Seed Technology — UTME

- Current catalogue text: Chemistry, Biology/Agricultural Science and Mathematics or Physics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U109. Public and International Law — DIRECT_ENTRY

- Current catalogue text: As in Civil Law
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U110. Public and International Law — OLEVEL

- Current catalogue text: As in Civil Law
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U111. Public and International Law — UTME

- Current catalogue text: As in Civil Law
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U112. Robotics (Artificial Intelligence) — DIRECT_ENTRY

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U113. Robotics (Artificial Intelligence) — OLEVEL

- Current catalogue text: —
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U114. Robotics (Artificial Intelligence) — UTME

- Current catalogue text: Mathematics, Physics and one of Biology, Chemistry, Agric Science, Economics and Geography.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U115. Sport Management (Education) — DIRECT_ENTRY

- Current catalogue text: Two (2) 'A' Level passes in any of the following: Economics, Geography, Biology, Chemistry, Mathematics and Physics; or NCE in PHE with Grade three (3) Referees Certificate in a sport.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U116. Sport Management (Education) — OLEVEL

- Current catalogue text: Five (5) 'O' Level credit passes to include English Language and any two (2) of Biology, Economics, Geography, Government and Mathematics.
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U117. Sport Management (Education) — UTME

- Current catalogue text: Biology; Mathematics; Economics; Geography
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U118. Water Resources and Environmental Engr — DIRECT_ENTRY

- Current catalogue text: 'A' Level passes must include Physics or Chemistry, and Mathematics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U119. Water Resources and Environmental Engr — OLEVEL

- Current catalogue text: Five (5) SSC credit passes in Physics, Chemistry, Mathematics, English Language and Biology
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

### U120. Water Resources and Environmental Engr — UTME

- Current catalogue text: Chemistry; Mathematics; Physics
- Local source status: source_row_not_found / no_source_candidate
- Manual result: PENDING SOURCE SEARCH
- Capture: exact PDF, page, table row, course cell, requirement cell, and whether the row is exact, shared, variant-specific, or genuinely absent.

## Part 3 — University-specific exception rows requiring review

Total rows listed: **657**. Search the original brochure using the JAMB programme name and institution together. Keep the result attached to that university/programme pair; do not promote it to a national rule unless the brochure explicitly defines it as shared.

| # | JAMB programme | Institution | Review reason | Route/source label | Current text |
|---:|---|---|---|---|---|
| UEX001 | APPLIED BIOLOGY | BELLS | cross_reference | subject_or_general / sciences_offerings.json:APPLIED BIOLOGY:BELLS:0 | same as in Microbiology. |
| UEX002 | Accounting and Finance | UNN | utme_parse_failed | subject_or_general / administration_offerings.json:Accounting and Finance:UNN:0 | (xxv) UNN accepts in addition to the UTME requirements |
| UEX003 | Actuarial Science | LAGOS | cross_reference | subject_or_general / administration_offerings.json:Actuarial Science:LAGOS:0 | (v) LAGOS - Same as in Business Administration. |
| UEX004 | Actuarial Science | PHC | utme_parse_failed | direct_entry / administration_offerings.json:Actuarial Science:PHC:0 | (ix) PHC requires Mathematics, Economics and any other subject from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX005 | Agricultural Engineering | ABUAD | cross_reference | subject_or_general / engineering_offerings.json:Agricultural Engineering:ABUAD:0 | Same as in Chemical Engineering. |
| UEX006 | Agricultural and Bio-Resources Engineering | UNN | multiple_clauses | direct_entry / engineering_offerings.json:Agricultural and Bio-Resources Engineering:UNN:0 | Direct Entry with 'O' Level credits in five subjects plus A-Level/IJMB or ND at Distinction/Upper Credit into 200 Level; HND at Distinction/Upper Credit into 300 Level. |
| UEX007 | Agriculture | BIU | olevel_parse_failed | direct_entry / agriculture_offerings.json:Agriculture:BIU:1 | BIU requires in addition to the 'O' Level requirements specified in the table, a minimum of two (2) relevant subjects passed at GCE `A' Level or NCE merits or ND in relevant programs not below credit level. |
| UEX008 | Agronomy | CRUTECH | cross_reference | direct_entry / agriculture_offerings.json:Agronomy:CRUTECH:0 | Same as Agricultural Economics and Extension. UTME subjects require Mathematics, Physics and any of Biology or Chemistry. |
| UEX009 | Agronomy | UMUDIKE | cross_reference | subject_or_general / agriculture_offerings.json:Agronomy:UMUDIKE:0 | Same as in Agricultural Economics. |
| UEX010 | Agronomy | UNIOSUN | cross_reference | subject_or_general / agriculture_offerings.json:Agronomy:UNIOSUN:0 | Same as in Fisheries. Requires five (5) 'O' Level credit passes in the SSC or its equivalent at not more than two (2) sittings in addition to an acceptable score in the UTME. |
| UEX011 | Anatomy | ABUAD | utme_parse_failed | direct_entry / medical_offerings.json:Anatomy:ABUAD:1 | UTME subjects: accepts Physics, Chemistry and Biology OR Chemistry, Biology and Mathematics. |
| UEX012 | Animal Breeding and Genetics | BENIN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Breeding and Genetics:BENIN:0 | As in Agricultural Economics. |
| UEX013 | Animal Breeding and Genetics | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Animal Breeding and Genetics:FUNAAB:0 | As in Agriculture Extension and Rural Development. |
| UEX014 | Animal Breeding and Genetics | IBADAN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Breeding and Genetics:IBADAN:0 | As in Agriculture. UTME subjects as in Agriculture. |
| UEX015 | Animal Breeding and Genetics | PHC | olevel_parse_failed | direct_entry / agriculture_offerings.json:Animal Breeding and Genetics:PHC:0 | Requires Five (5) SSC credit passes to include English Language, Mathematics, Chemistry, Biology/Agricultural Science and any one of Physics, Geography and Economics. UTME subjects require CC. |
| UEX016 | Animal Breeding and Genetics | UNIOSUN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Breeding and Genetics:UNIOSUN:0 | Requires five (5) 'O' Level credit passes in the SSC or its equivalent at not more than two (2) sittings in addition to an acceptable score in the UTME. UTME subjects same as in Fisheries. |
| UEX017 | Animal Breeding and Genetics | UNN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Breeding and Genetics:UNN:0 | As in Agricultural Economics. UTME subjects as in Agricultural Economics. |
| UEX018 | Animal Production | LAUTECH | utme_parse_failed | direct_entry / agriculture_offerings.json:Animal Production:LAUTECH:0 | Requires ND with upper credit/HND/NCE at credit level in relevant subjects, plus the UTME requirements. Accepts Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language. UTME subjects require Chemistry, Mathematics/Physics and Biology/Agricultural Sciences. |
| UEX019 | Animal Production | MAKURDI | cross_reference | subject_or_general / agriculture_offerings.json:Animal Production:MAKURDI:0 | Same as in Agricultural Economics. Accepts 'O' level pass in Physics. |
| UEX020 | Animal Production | MINNA | cross_reference | direct_entry / agriculture_offerings.json:Animal Production:MINNA:0 | Accepts NCE, ND, HND with overall credit passes in each of the Agricultural components of the programme or a minimum of lower credit plus four (4) 'O' level credit passes in relevant subjects. Same as in Water Resources, Aquaculture and Fisheries Technology. |
| UEX021 | Animal Production | NDU | cross_reference | direct_entry / agriculture_offerings.json:Animal Production:NDU:0 | Same as in Fisheries Technology. Requires five (5) 'O' level credit passes in English Language, Mathematics, Chemistry, Physics, Biology or Agricultural Science. |
| UEX022 | Animal Production | UMUDIKE | cross_reference | subject_or_general / agriculture_offerings.json:Animal Production:UMUDIKE:0 | Same as in Agricultural Economics; same as in Agriculture. |
| UEX023 | Animal Science | BENIN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Science:BENIN:0 | As in Agricultural Economics. |
| UEX024 | Animal Science | CALABAR | cross_reference | direct_entry / agriculture_offerings.json:Animal Science:CALABAR:0 | Same as in Agriculture-Economics and Extension. |
| UEX025 | Animal Science | COOU | cross_reference | direct_entry / agriculture_offerings.json:Animal Science:COOU:0 | Same as in Agriculture-Economics and Extension. |
| UEX026 | Animal Science | DELSU | cross_reference | subject_or_general / agriculture_offerings.json:Animal Science:DELSU:0 | As in Agricultural Economics. |
| UEX027 | Animal Science | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Animal Science:FUNAAB:0 | Same as in Animal Production and Health. |
| UEX028 | Animal Science | RSU | multiple_clauses | direct_entry / agriculture_offerings.json:Animal Science:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline; (b) OND (Upper Credit) in related discipline; (c) NCE holders with credit passes in Biology or Agric Science; (d) Two (2) HSC/GCE 'A' Level passes in Chemistry and Biology. |
| UEX029 | Animal Science | UNN | cross_reference | subject_or_general / agriculture_offerings.json:Animal Science:UNN:0 | As in Agricultural Economics. |
| UEX030 | Animal and Environmental Biology | EUI | olevel_parse_failed | direct_entry / sciences_offerings.json:Animal and Environmental Biology:EUI:0 | UTME: requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Biology and two (2) other Science subject. |
| UEX031 | Animal and Environmental Biology | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:Animal and Environmental Biology:FED-KASHERE:1 | UTME: requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Biology, Chemistry and Physics. |
| UEX032 | Animal and Environmental Biology | FED-OYE EKITI | olevel_parse_failed | direct_entry / sciences_offerings.json:Animal and Environmental Biology:FED-OYE EKITI:1 | UTME: requires five (5) credits at SSC (or its equivalent) in English, Mathematics, Physics, Chemistry and Biology. |
| UEX033 | Animal and Environmental Biology | IMSU | cross_reference | direct_entry / sciences_offerings.json:Animal and Environmental Biology:IMSU:0 | UTME: As in Plant and Biotechnology. Requires 'O' Level pass in Physics. |
| UEX034 | Animal and Environmental Biology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:KWASU:1 | UTME SUBJECTS: Same as in Mathematics. |
| UEX035 | Animal and Environmental Biology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:KWASU:0 | UTME: Same as in Mathematics. |
| UEX036 | Animal and Environmental Biology | MAIDUGURI | utme_parse_failed | direct_entry / sciences_offerings.json:Animal and Environmental Biology:MAIDUGURI:2 | UTME SUBJECTS: requires Biology and any two (2) of Physics, Chemistry, Mathematics, Agricultural Science, Geography. For Environmental Biology, MAIDUGURI requires Biology and any two (2) of Physics, Chemistry, Mathematics, Geography. |
| UEX037 | Animal and Environmental Biology | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:MAKURDI:0 | UTME: Same as in Biochemistry. |
| UEX038 | Animal and Environmental Biology | OAUSTECH | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:OAUSTECH:0 | UTME: same as in Fisheries. |
| UEX039 | Animal and Environmental Biology | OAUSTECH | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:OAUSTECH:1 | UTME SUBJECTS: same as in Fisheries. |
| UEX040 | Animal and Environmental Biology | SOUTHWESTERN | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:SOUTHWESTERN:1 | UTME SUBJECTS: Same as Microbiology. |
| UEX041 | Animal and Environmental Biology | SOUTHWESTERN | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:SOUTHWESTERN:0 | UTME: Same as Microbiology. |
| UEX042 | Animal and Environmental Biology | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:Animal and Environmental Biology:UMUDIKE:1 | UTME: same as in Botany. |
| UEX043 | Applied Geophysics | CALABAR | cross_reference | subject_or_general / sciences_offerings.json:Applied Geophysics:CALABAR:0 | Same as for Physics. |
| UEX044 | Applied Statistics | CRUTECH | utme_parse_failed | direct_entry / sciences_offerings.json:Applied Statistics:CRUTECH:0 | (vii) CRUTECH requires for Biochemistry Chemistry, Biology and either Physics or Mathematics. |
| UEX045 | Architecture | ABSU | utme_parse_failed | subject_or_general / engineering_offerings.json:Architecture:ABSU:2 | UTME subjects: requires Mathematics as UTME requirement. |
| UEX046 | Architecture | BAYERO | utme_parse_failed | subject_or_general / engineering_offerings.json:Architecture:BAYERO:2 | UTME subjects: Mathematics, Physics, any one of Chemistry, Geography, Technical Drawing. |
| UEX047 | Architecture | CALEB | cross_reference | subject_or_general / engineering_offerings.json:Architecture:CALEB:1 | Same as in Building Technology. |
| UEX048 | Architecture | ILORIN | olevel_parse_failed | direct_entry / engineering_offerings.json:Architecture:ILORIN:1 | Requires five (5) credits in English Language, Mathematics, Physics, Technical Drawing/Fine Art and any one other from Geography, Building Construction, Land Surveying, Further Mathematics. |
| UEX049 | Architecture | JOS | olevel_parse_failed | direct_entry / engineering_offerings.json:Architecture:JOS:0 | Accepts five (5) 'O' Level credit passes including English Language, Mathematics, Physics, Technical Drawing or five (5) Arts or Applied Arts and one (1) of History, Economics, Geography and Chemistry. |
| UEX050 | Architecture | MINNA | utme_parse_failed | direct_entry / engineering_offerings.json:Architecture:MINNA:0 | Accepts candidates who have undergone an accredited course in Architecture in approved Colleges of Technology or Polytechnics in addition to UTME requirements. |
| UEX051 | BIOLOGICAL SCIENCE(S) | AUGUSTINE | olevel_parse_failed | direct_entry / sciences_offerings.json:BIOLOGICAL SCIENCE(S):AUGUSTINE:0 | (xi) AUGUSTINE accepts two (2) 'A' Level passes in Biology, Botany, Zoology and Chemistry or Physics. NCE and ND credit in addition to five (5) 'O' Level credit passes or its equivalent. |
| UEX052 | BIOLOGY | AJAYI | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:AJAYI:0 | Same as in Microbiology. |
| UEX053 | BIOLOGY | AJAYI | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:AJAYI:1 | same as in Microbiology. |
| UEX054 | BIOLOGY | CRUTECH | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:CRUTECH:0 | Same as in Microbiology. |
| UEX055 | BIOLOGY | EUI | olevel_parse_failed | direct_entry / sciences_offerings.json:BIOLOGY:EUI:1 | requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Biology, Chemistry and Physics. |
| UEX056 | BIOLOGY | EVANGEL | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:EVANGEL:0 | Same as in Microbiology. |
| UEX057 | BIOLOGY | EVANGEL | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:EVANGEL:1 | Same as in Microbiology. |
| UEX058 | BIOLOGY | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:BIOLOGY:FED-KASHERE:1 | requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Biology, Chemistry and Physics. |
| UEX059 | BIOLOGY | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:BIOLOGY:FED-KASHERE:0 | accepts Two credit passes in NCE Biology or ND Science Lab, Two 'A' level credit passes in Botany, Zoology and Chemistry or Physics. Credit passes in NCE and IJMB (Biology, Chemistry, Physics or Physics Mathematics). Requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Biology, Chemistry and Physics. |
| UEX060 | BIOLOGY | GOUU | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:GOUU:2 | Same as in Biochemistry. |
| UEX061 | BIOLOGY | GOUU | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:GOUU:0 | same as in Microbiology. |
| UEX062 | BIOLOGY | GOUU | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:GOUU:1 | Same as in Microbiology. |
| UEX063 | BIOLOGY | GSU | utme_parse_failed | subject_or_general / sciences_offerings.json:BIOLOGY:GSU:1 | accepts D7 in Physics. |
| UEX064 | BIOLOGY | KWASU | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:KWASU:0 | Same as in Mathematics. |
| UEX065 | BIOLOGY | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:MAKURDI:0 | Same as in Biochemistry. |
| UEX066 | BIOLOGY | MAUTY | utme_parse_failed | direct_entry / sciences_offerings.json:BIOLOGY:MAUTY:1 | UTME SUBJECTS: requires Biology, Chemistry and Physics/Mathematics for both Plant Science and Biotechnology. |
| UEX067 | BIOLOGY | NILE | cross_reference | direct_entry / sciences_offerings.json:BIOLOGY:NILE:0 | Same as in Computer Science. Accepts English Language, Mathematics, Biology and any other two (2) Science subjects. |
| UEX068 | BIOLOGY | OAUSTECH | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:OAUSTECH:0 | same as in Fisheries. |
| UEX069 | BIOLOGY | UNIKINGS | cross_reference | subject_or_general / sciences_offerings.json:BIOLOGY:UNIKINGS:1 | Same as in Microbiology. |
| UEX070 | BIOLOGY | UNIKINGS | olevel_parse_failed | direct_entry / sciences_offerings.json:BIOLOGY:UNIKINGS:0 | accepts two (2) 'A' Level passes in Biology and any one of Mathematics, Physics or Chemistry. Also accepts NCE/ND/HND in related field plus UTME requirement. Requires five (5) credits at SSC in English Language, Mathematics, Biology, Chemistry and any other Science subject. |
| UEX071 | Banking and Finance | IGBINEDION | cross_reference | subject_or_general / administration_offerings.json:Banking and Finance:IGBINEDION:0 | (viii) IGBINEDION as in Accounting. |
| UEX072 | Banking and Finance | RSU | olevel_parse_failed | direct_entry / administration_offerings.json:Banking and Finance:RSU:0 | (xv) RSU in addition to 'O' Level requirements accepts: (a) OND/ND (Upper Credit) relevant to the discipline. (b) HND (Lower Credit) relevant to the programme. (c) Degree (Third Class) relevant to the programme. (d) At least two (2) 'A' level passes at GCE preferably in the Arts and Social Sciences. |
| UEX073 | Botany | BENIN | multiple_clauses | direct_entry / sciences_offerings.json:Botany:BENIN:0 | In addition to UTME requirements accepts ND upper credit/HND lower credit in Food Technology or Science Laboratory Technology; NCE credit in Biology/Chemistry. |
| UEX074 | Botany | KBSUST | cross_reference | direct_entry / sciences_offerings.json:Botany:KBSUST:0 | Same as in Agricultural Science. |
| UEX075 | Building | ABU | utme_parse_failed | direct_entry / engineering_offerings.json:Building:ABU:1 | ABU requires Mathematics, Physics plus any one of Chemistry, Geography, Economics, Biology and Technical Drawing (UTME subjects). |
| UEX076 | Building | JOS | olevel_parse_failed | direct_entry / engineering_offerings.json:Building:JOS:1 | JOS accepts 'A' Level passes at not more than two (2) sittings in Mathematics and either Physics or Chemistry or both and at least two (2) 'O' Level credit passes from Building Construction, Land Surveying, Fine Arts, Technical Drawing, Economics, Additional Mathematics, Geography including English Language. |
| UEX077 | Building | OAU | utme_parse_failed | direct_entry / engineering_offerings.json:Building:OAU:0 | OAU accepts any one of Additional Mathematics, Biology, Building Construction and Land Surveying in addition to the listed options. |
| UEX078 | Business Administration | AUN | cross_reference | direct_entry / administration_offerings.json:Business Administration:AUN:0 | UTME: AUN same as in Finance. |
| UEX079 | Business Administration | AUN | cross_reference | direct_entry / administration_offerings.json:Business Administration:AUN:1 | UTME SUBJECTS: AUN same as in Finance |
| UEX080 | Business Administration | BSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:BSU:0 | RSU, IGBINEDION, EKSU and BSU - as in Accountancy. |
| UEX081 | Business Administration | COOU | cross_reference | direct_entry / administration_offerings.json:Business Administration:COOU:1 | UTME SUBJECTS: UNN, COOU and UYO - Same as in Banking and Finance. |
| UEX082 | Business Administration | EBSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:EBSU:0 | UTME: EBSU and RSU - Same as in Accountancy. |
| UEX083 | Business Administration | EBSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:EBSU:1 | UTME SUBJECTS: EBSU and RSU: Same as in Accountancy. |
| UEX084 | Business Administration | EKSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:EKSU:0 | RSU, IGBINEDION, EKSU and BSU - as in Accountancy. |
| UEX085 | Business Administration | EVANGEL | cross_reference | direct_entry / administration_offerings.json:Business Administration:EVANGEL:0 | Same as in Banking and Finance. |
| UEX086 | Business Administration | FED-KASHERE | olevel_parse_failed | direct_entry / administration_offerings.json:Business Administration:FED-KASHERE:0 | UTME: FED-KASHERE requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Economics and any other two from Commerce, Accounting, Office Practice, Marketing, ICT, Civic Education, Government and Geography. |
| UEX087 | Business Administration | FED-OYE EKITI | olevel_parse_failed | direct_entry / administration_offerings.json:Business Administration:FED-OYE EKITI:1 | UTME: FED-OYE EKITI requires five (5) SSC credit including English, Mathematics, Economics, plus any two (2) of Accounting, Business Methods, Commerce, Government, Geog, and Statistics. |
| UEX088 | Business Administration | IGBINEDION | cross_reference | direct_entry / administration_offerings.json:Business Administration:IGBINEDION:0 | RSU, IGBINEDION, EKSU and BSU - as in Accountancy. |
| UEX089 | Business Administration | OOU | utme_parse_failed | direct_entry / administration_offerings.json:Business Administration:OOU:1 | UTME SUBJECTS: OOU - the third (3rd) subject should be a Social Science subject. |
| UEX090 | Business Administration | OOU | cross_reference | direct_entry / administration_offerings.json:Business Administration:OOU:0 | Same as in Banking and Finance. |
| UEX091 | Business Administration | PHC | olevel_parse_failed | direct_entry / administration_offerings.json:Business Administration:PHC:1 | UTME: PHC requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX092 | Business Administration | PHC | utme_parse_failed | direct_entry / administration_offerings.json:Business Administration:PHC:2 | UTME SUBJECTS: PHC requires Mathematics, Economics and any other subject from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX093 | Business Administration | PLASU | olevel_parse_failed | direct_entry / administration_offerings.json:Business Administration:PLASU:0 | PLASU accepts a) degree in any programme provided the candidate meets the 'O' Level requirements b) HND lower credit in relevant programmes, with the 'O' Level requirements, c) ND lower credit in relevant programmes, with the 'O' Level requirements. d) IJMB minimum of seven (7) points with passes in relevant subjects, with the 'O' Level requirements. e) PLASU does not accept university diplomas and other diplomas not accredited by the relevant accrediting bodies. |
| UEX094 | Business Administration | PLASU | cross_reference | subject_or_general / administration_offerings.json:Business Administration:PLASU:1 | UTME: PLASU - Same as in Accounting. |
| UEX095 | Business Administration | RSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:RSU:2 | UTME SUBJECTS: EBSU and RSU: Same as in Accountancy. |
| UEX096 | Business Administration | RSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:RSU:1 | UTME: EBSU and RSU - Same as in Accountancy. |
| UEX097 | Business Administration | RSU | cross_reference | direct_entry / administration_offerings.json:Business Administration:RSU:0 | RSU, IGBINEDION, EKSU and BSU - as in Accountancy. |
| UEX098 | Business Administration | UDU | cross_reference | subject_or_general / administration_offerings.json:Business Administration:UDU:0 | UDU - as applicable to Accounting. |
| UEX099 | Business Administration | UNIZIK | utme_parse_failed | subject_or_general / administration_offerings.json:Business Administration:UNIZIK:0 | UNIZIK accepts Mathematics but not Geography. Requires applicants to possess the UTME requirements. |
| UEX100 | Business Administration | UNN | cross_reference | direct_entry / administration_offerings.json:Business Administration:UNN:3 | UTME SUBJECTS: UNN, COOU and UYO - Same as in Banking and Finance. |
| UEX101 | Business Administration | UNN | cross_reference | direct_entry / administration_offerings.json:Business Administration:UNN:2 | UTME: UNN - As in Banking and Finance. |
| UEX102 | Business Administration | UYO | cross_reference | direct_entry / administration_offerings.json:Business Administration:UYO:2 | UTME SUBJECTS: UNN, COOU and UYO - Same as in Banking and Finance. |
| UEX103 | Business Administration | UYO | cross_reference | direct_entry / administration_offerings.json:Business Administration:UYO:0 | Same as in Banking and Finance. |
| UEX104 | Business Education | EBSU | utme_parse_failed | direct_entry / education_offerings.json:Business Education:EBSU:2 | UTME subjects: Accepts Mathematics, Economics and Principles of Accounts/Commerce. |
| UEX105 | Business Education | FED-LAFIA | utme_parse_failed | direct_entry / education_offerings.json:Business Education:FED-LAFIA:2 | UTME subjects: Requires Mathematics, Economics or Commerce or Accounting plus One (1) of Literature in English, History, Government, Chemistry and Physics. |
| UEX106 | Business Education | FED-LAFIA | olevel_parse_failed | direct_entry / education_offerings.json:Business Education:FED-LAFIA:1 | UTME: Requires Five (5) TC II merit, 'O' level or NTC/NBC credit passes including English Language, Mathematics, Economics or Accounting and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand. |
| UEX107 | Business Education | FED-OYE EKITI | olevel_parse_failed | direct_entry / education_offerings.json:Business Education:FED-OYE EKITI:0 | UTME: Requires five (5) TC II merit, SSC or NTC/NBC credit passes including English Language, Mathematics, Economics/Commerce and two (2) other subjects in the Social Science or Arts. For NBC holders, the other subjects could be from any of Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand. |
| UEX108 | Business Education | IAUED | olevel_parse_failed | direct_entry / education_offerings.json:Business Education:IAUED:1 | UTME: For admission by UTME entry into the department of Management for first degree programme must possess the minimum qualification of SSCE or equivalent with credits in five (5) subjects to include English Language, Mathematics and three (3) other subjects like Economics, Government, History, Commerce, Business Methods, Accounting, Geography, CRK, Civic Education. For Marketing Education IAUED requires five (5) 'O' level subjects (WACE or NECO/GCE at credit level) including English, Mathematics, Economics or Commerce, Government, Christian Religious Knowledge or Marketing. |
| UEX109 | Business Education | IAUED | utme_parse_failed | subject_or_general / education_offerings.json:Business Education:IAUED:2 | UTME subjects: Requires Mathematics, Economics plus one of Government, History, Geography, CRK, Commerce, Civic Education. For Marketing Education IAUED requires English, Mathematics, Government, Economics. |
| UEX110 | Business Education | KWASU | olevel_parse_failed | direct_entry / education_offerings.json:Business Education:KWASU:1 | UTME: Requires five (5) 'O' Level credit passes to include English Language, Mathematics plus any one (1) of Economics, Commerce, Financial Accounting, Typewriting plus any two (2) other Social Science subjects. |
| UEX111 | Business Education | LASU | utme_parse_failed | subject_or_general / education_offerings.json:Business Education:LASU:1 | UTME: Accepts any one (1) of Business Methods, Principles of Account, Book Keeping or Commerce. |
| UEX112 | Business Education | NDU | cross_reference | direct_entry / education_offerings.json:Business Education:NDU:0 | Same as Vocational and Technical Education. |
| UEX113 | Business Education | RSU | multiple_clauses | direct_entry / education_offerings.json:Business Education:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline; (b) OND/ND (Upper Credit) in Business Education or in related area; (c) NCE in Business Education or related areas with a minimum of two credits and a merit; (d) Two (2) GCE/HSC 'A' Level at credit or above level. |
| UEX114 | Business Education | RSU | utme_parse_failed | direct_entry / education_offerings.json:Business Education:RSU:2 | UTME subjects: Requires Mathematics, Economics and any other Arts or Social Science subjects for Accountancy, Management and Marketing options, and accepts Economics and any other two (2) Arts or Social Sciences subject for Secretarial Education. |
| UEX115 | Business Education | UNN | utme_parse_failed | subject_or_general / education_offerings.json:Business Education:UNN:2 | UTME subjects: Requires Mathematics, Economics, plus one (1) of Commerce, History, Government, Geography, Chemistry or Physics. |
| UEX116 | Business Education | YABA-DEG | utme_parse_failed | direct_entry / education_offerings.json:Business Education:YABA-DEG:2 | UTME subjects: English Language, Mathematics, Economics plus one (1) other subject from Commerce, Office Practice, Principles/Financial Accounting, Secretarial/Clerical Office Duties, Typewriting, Shorthand, Book Keeping, Business Management, Government, History, Civic Education, Information & Communication Technology, Salesmanship, Marketing, Store Keeping/Management, Type writing and Stenography. |
| UEX117 | Business Education | YABA-DEG | olevel_parse_failed | direct_entry / education_offerings.json:Business Education:YABA-DEG:1 | UTME: Requires Five (5) TC II merit, O Level or NTC/NBC credit passes including English Language, Mathematics, Economics and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of Commerce, Office Practice, Principles/Financial Accounting, Secretarial/Clerical Office Duties, Typewriting, Shorthand, Book Keeping, Business Management, Government/History/Civic Education, Information & Communication Technology, Salesmanship/Marketing, Store Keeping/Management, Type writing and Stenography. |
| UEX118 | Business Management | ADSU | cross_reference | subject_or_general / administration_offerings.json:Business Management:ADSU:0 | (vi) ADSU - As in Public Administration. |
| UEX119 | Business Management | AUN | cross_reference | direct_entry / administration_offerings.json:Business Management:AUN:0 | (vii) AUN same as in Finance |
| UEX120 | Business Management | EBSU | olevel_parse_failed | direct_entry / administration_offerings.json:Business Management:EBSU:0 | (viii) EBSU accepts HND, NCE/ND pass at merit/credit level in relevant programmes in addition to 'O' Level requirements. ND must be at upper credit level. |
| UEX121 | Business Management | EVANGEL | cross_reference | direct_entry / administration_offerings.json:Business Management:EVANGEL:0 | (xvii) OOU, EVANGEL and UYO –Same as in Banking and Finance. |
| UEX122 | Business Management | JOS | cross_reference | subject_or_general / administration_offerings.json:Business Management:JOS:1 | UTME SUBJECTS (i) JOS – Same as in Marketing. |
| UEX123 | Business Management | JOS | cross_reference | subject_or_general / administration_offerings.json:Business Management:JOS:0 | UTME (i) JOS – Same as in Marketing |
| UEX124 | Business Management | OOU | cross_reference | direct_entry / administration_offerings.json:Business Management:OOU:1 | (xvii) OOU, EVANGEL and UYO –Same as in Banking and Finance. |
| UEX125 | Business Management | UYO | cross_reference | direct_entry / administration_offerings.json:Business Management:UYO:0 | (xvii) OOU, EVANGEL and UYO –Same as in Banking and Finance. |
| UEX126 | COMPUTER SCIENCE AND MATHEMATICS | PHC | cross_reference | direct_entry / sciences_offerings.json:COMPUTER SCIENCE AND MATHEMATICS:PHC:0 | as in Computer Science. |
| UEX127 | CYBER SECURITY | ABUJA | utme_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:ABUJA:0 | requires two (2) other Sciences subjects preferably from Chemistry, Further Mathematics, Statistics, Biology or Geography and Economics. |
| UEX128 | CYBER SECURITY | FED-DUTSINMA | olevel_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:FED-DUTSINMA:0 | accepts Five 'O' level Credits to include: English Language, Physics, Chemistry, Mathematics, Computer Science or any other Science subject. |
| UEX129 | CYBER SECURITY | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:FED-KASHERE:0 | accepts Five credit passes at SSCE (or its equivalent) in English, Mathematics, Physics, and any other two relevant Science Subjects from ICT/Computer Studies, Chemistry and Biology/Agricultural Science, Geography and Further Mathematics. |
| UEX130 | CYBER SECURITY | FED-OYE EKITI | olevel_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:FED-OYE EKITI:0 | requires five (5) credits passes at SSC (or its equivalent) including English Language, Mathematics, Physics, Chemistry plus one other Science subject from Biology or Agriculture. |
| UEX131 | CYBER SECURITY | FUPRE | olevel_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:FUPRE:0 | requires five (5) SSC credit passes including English Language, Mathematics, Physics and any other two subjects from Chemistry, Computer Studies, Biology/Agricultural Science or Data Processing/GSM Maintenance. |
| UEX132 | CYBER SECURITY | MAUTY | utme_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:MAUTY:0 | requires Physics and any two (2) of Chemistry, Biology/Agricultural Science, Economics/Commerce, Electronics, Computer Studies & IT/Data Processing. |
| UEX133 | CYBER SECURITY | UNIKINGS | olevel_parse_failed | direct_entry / sciences_offerings.json:CYBER SECURITY:UNIKINGS:0 | requires five credits in SSC in English Language, Mathematics, Physics and any other two (2) Science subjects. |
| UEX134 | Chemical Engineering | ABU | utme_parse_failed | direct_entry / engineering_offerings.json:Chemical Engineering:ABU:0 | Accepts a) 'A' Level/IJMB passes in Physics, Chemistry and Mathematics. b) ND upper credit in Chemical Engineering from accredited institution. c) HND lower credit in Chemical Engineering. UTME requires Mathematics, Physics plus any one of Chemistry, Geography, Economics, Biology and Technical Drawing. |
| UEX135 | Chemical Engineering | BENIN | olevel_parse_failed | direct_entry / engineering_offerings.json:Chemical Engineering:BENIN:0 | In addition to UTME requires (a) first degree Second Class Lower in Science or degree in Medicine, Dentistry or Pharmacy and PTI HND lower credit/ND upper credit. (b) HND upper credit in Engineering/Technology and PTI upper credit into 300 levels. (c) ND/HND holders should have 'A' grade in Mathematics. |
| UEX136 | Chemical Engineering | ILORIN | cross_reference | direct_entry / engineering_offerings.json:Chemical Engineering:ILORIN:0 | Same as Agricultural and Biosystem Engineering; relevant programmes include Biomedical, Chemical, Water and Environmental, Mechanical Engineering Technology and Polymer Engineering. |
| UEX137 | Chemical Engineering | NILE | cross_reference | subject_or_general / engineering_offerings.json:Chemical Engineering:NILE:0 | Same as in Computer Engineering. |
| UEX138 | Chemical Engineering | OAUSTECH | utme_parse_failed | direct_entry / engineering_offerings.json:Chemical Engineering:OAUSTECH:0 | Accepts first degree from a recognized university in relevant subjects not below Second Class Lower. |
| UEX139 | Chemistry | AJAYI | cross_reference | direct_entry / sciences_offerings.json:Chemistry:AJAYI:3 | AJAYI and IMSU - as in Chemistry. |
| UEX140 | Chemistry | AJAYI | cross_reference | direct_entry / sciences_offerings.json:Chemistry:AJAYI:4 | AJAYI, IGBINEDION, IBADAN, BOWEN and BENIN as in Chemistry. |
| UEX141 | Chemistry | AUN | multiple_clauses | direct_entry / sciences_offerings.json:Chemistry:AUN:2 | (v) AUN requires Mathematics, plus any other subjects from the following; Chemistry, Physics, Environmental Science, Biology, Further Mathematics, Literature in English, Government, History, Economics, Geography, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. |
| UEX142 | Chemistry | AUN | multiple_clauses | direct_entry / sciences_offerings.json:Chemistry:AUN:1 | (xvi) AUN: a. requires five (5) 'O' Level credit passes including English Language, Mathematics, and any other three (3) subjects from the following; Chemistry, Physics, Environmental Science, Biology, Further Mathematics, Literature in English, Government, History, Economics, Geography, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. b. does not accept 'O' Level credit passes in the following; Agriculture, Food and Nutrition, Home Economics, Home Craft, Home management, Physical Education, Physical and Health Education, Music, Commerce, Accounting, Financial Accounting, Book keeping, Islamic History, Religious Studies, Tajweed, Library Studies, Diction, Kiswahili, Igbo, Hausa, Yoruba, Arabic, Turkish, Study skills. |
| UEX143 | Chemistry | BENIN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:BENIN:5 | AJAYI, IGBINEDION, IBADAN, BOWEN and BENIN as in Chemistry. |
| UEX144 | Chemistry | BOWEN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:BOWEN:5 | AJAYI, IGBINEDION, IBADAN, BOWEN and BENIN as in Chemistry. |
| UEX145 | Chemistry | BOWEN | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:BOWEN:2 | BOWEN same as in Biochemistry |
| UEX146 | Chemistry | BSU | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:BSU:0 | (xix) BSU accepts NCE merit, ND upper credit in relevant programmes plus five (5) 'O' Level credit passes at a sitting. |
| UEX147 | Chemistry | CALEB | cross_reference | direct_entry / sciences_offerings.json:Chemistry:CALEB:0 | CALEB - Same as Microbiology and Industrial Biotechnology. |
| UEX148 | Chemistry | CRAWFORD | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:CRAWFORD:0 | CRAWFORD accepts ND upper credit are eligible for admission into 200 Level provided that their programme covers certain basic courses offered in the school up to the second year. HND lower credit are eligible for admission into 200 level depending on the appropriateness of their requisite academic preparation. Holders of two (2) 'A' Level subjects passes including Chemistry and one (1) of Physics, Mathematics are also eligible for admission into 200 Level programme in any of the Chemistry programmes. In addition to fulfilling the requirements stated above, a holder of ND, HND or 'A' Level must also have five (5) 'O' Level credit passes. |
| UEX149 | Chemistry | CUAB | cross_reference | direct_entry / sciences_offerings.json:Chemistry:CUAB:1 | (xiv) CUAB and FUNAAB - Same as in Biochemistry. |
| UEX150 | Chemistry | CUAB | utme_parse_failed | direct_entry / sciences_offerings.json:Chemistry:CUAB:5 | CUAB requires Chemistry or any two (2) of Physics, Mathematics and Biology |
| UEX151 | Chemistry | FED-DUTSINMA | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:FED-DUTSINMA:4 | FED-DUTSINMA accepts Five 'O' level Credits including: English Language, Mathematics, Physics, Chemistry and Biology. |
| UEX152 | Chemistry | FED-DUTSINMA | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:FED-DUTSINMA:1 | (xlvii) FED-DUTSINMA accepts Five `O' level Credits including: English Language, Mathematics, Physics, Chemistry and Biology. |
| UEX153 | Chemistry | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:FED-KASHERE:1 | (xliv) FED-KASHERE requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Chemistry, Physics and Biology. |
| UEX154 | Chemistry | FED-OYE EKITI | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:FED-OYE EKITI:2 | FED-OYE EKITI requires five (5) credits at SSC (or its equivalent) in English, Mathematics, Physics, Chemistry and Biology. |
| UEX155 | Chemistry | FUNAAB | cross_reference | direct_entry / sciences_offerings.json:Chemistry:FUNAAB:1 | (xiv) CUAB and FUNAAB - Same as in Biochemistry. |
| UEX156 | Chemistry | FUNAAB | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:FUNAAB:0 | FUNAAB same as in Biochemistry. |
| UEX157 | Chemistry | GOUU | cross_reference | direct_entry / sciences_offerings.json:Chemistry:GOUU:2 | (xix) GOUU same as in Biological Sciences. |
| UEX158 | Chemistry | IAUED | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:IAUED:0 | (lvii) IAUED accepts five (5) `O `Level credit passes including Mathematics and English Language, plus Diploma or NCE in Chemistry at credit level or 2 credits passed at advanced Level. |
| UEX159 | Chemistry | IBADAN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:IBADAN:4 | AJAYI, IGBINEDION, IBADAN, BOWEN and BENIN as in Chemistry. |
| UEX160 | Chemistry | IBADAN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:IBADAN:3 | OAU and IBADAN - As in Chemistry. |
| UEX161 | Chemistry | IGBINEDION | cross_reference | direct_entry / sciences_offerings.json:Chemistry:IGBINEDION:3 | AJAYI, IGBINEDION, IBADAN, BOWEN and BENIN as in Chemistry. |
| UEX162 | Chemistry | ILORIN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:ILORIN:5 | WESTERN-DEL and ILORIN same as in Chemistry |
| UEX163 | Chemistry | ILORIN | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:ILORIN:0 | ILORIN accepts; At least two (2) `A' Level passes or equivalent in Chemistry and Physics (GCE, IJMB and JUPEB). NCE (Distinction/Merit passes) in Chemistry/Physics, Chemistry/Mathematics. Five (5) `O' level credits in English Language, Chemistry, Physics, Mathematics and Biology. (WAEC, NECO, SSCE, NABTEB etc). |
| UEX164 | Chemistry | ILORIN | cross_reference | direct_entry / sciences_offerings.json:Chemistry:ILORIN:3 | WESTERN-DEL and ILORIN same as in Chemistry. |
| UEX165 | Chemistry | ILORIN | olevel_parse_failed | direct_entry / sciences_offerings.json:Chemistry:ILORIN:1 | (v) ILORIN requires five (5) `O' Level credits in English Language, Chemistry, Physics, Mathematics and Biology. (WAEC, NECO, SSCE, NABTEB etc). |
| UEX166 | Chemistry | IMSU | cross_reference | direct_entry / sciences_offerings.json:Chemistry:IMSU:2 | AJAYI and IMSU - as in Chemistry. |
| UEX167 | Chemistry | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:KWASU:0 | (xxxix) KWASU - Same as in Mathematics. |
| UEX168 | Chemistry | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:KWASU:1 | (xxxvi) KWASU - Same as in Mathematics. |
| UEX169 | Chemistry | LAUTECH | cross_reference | direct_entry / sciences_offerings.json:Chemistry:LAUTECH:1 | (xiii) LAUTECH same as in Pure and Applied Physics. |
| UEX170 | Chemistry | NILE | cross_reference | direct_entry / sciences_offerings.json:Chemistry:NILE:2 | (vi) NILE - Same as in Computer Science. |
| UEX171 | Chemistry | NILE | cross_reference | direct_entry / sciences_offerings.json:Chemistry:NILE:0 | NILE - Same as in Computer Science. |
| UEX172 | Chemistry | OAU | cross_reference | direct_entry / sciences_offerings.json:Chemistry:OAU:4 | OAU and IBADAN - As in Chemistry. |
| UEX173 | Chemistry | ODUDUWA | utme_parse_failed | direct_entry / sciences_offerings.json:Chemistry:ODUDUWA:1 | (xvi) ODUDUWA accepts Agricultural Science in place of Biology |
| UEX174 | Chemistry | PLASU | utme_parse_failed | direct_entry / sciences_offerings.json:Chemistry:PLASU:1 | (xxxii) PLASU accepts Further Mathematics and Agricultural Science as Science subjects. |
| UEX175 | Chemistry | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:UMUDIKE:1 | (xx) UMUDIKE same as in Mathematics. |
| UEX176 | Chemistry | UNIKINGS | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:UNIKINGS:1 | (xxxiv) UNIKINGS as in Biochemistry |
| UEX177 | Chemistry | UNIKINGS | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:UNIKINGS:0 | (l) UNIKINGS as in Biochemistry. |
| UEX178 | Chemistry | WESLEYUNI | cross_reference | subject_or_general / sciences_offerings.json:Chemistry:WESLEYUNI:1 | WESLEYUNI same as in Chemistry. |
| UEX179 | Chemistry | WESTERN-DEL | cross_reference | direct_entry / sciences_offerings.json:Chemistry:WESTERN-DEL:4 | WESTERN-DEL and ILORIN same as in Chemistry |
| UEX180 | Chemistry | WESTERN-DEL | cross_reference | direct_entry / sciences_offerings.json:Chemistry:WESTERN-DEL:3 | WESTERN-DEL and ILORIN same as in Chemistry. |
| UEX181 | Christian Religious | OOU | utme_parse_failed | subject_or_general / arts_hum_offerings.json:Christian Religious:OOU:0 | Also requires fulfillment of the UTME requirements. |
| UEX182 | Civil Engineering | BENIN | cross_reference | subject_or_general / engineering_offerings.json:Civil Engineering:BENIN:0 | BENIN - As in Chemical Engineering. |
| UEX183 | Civil Engineering | FED-OYE EKITI | olevel_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:FED-OYE EKITI:1 | FED-OYE EKITI five (5) Credits at SSC (or its equivalent) including English Language, Mathematics, Physics, Chemistry and one other Science subject from Further Mathematics, Technical Drawing, Biology/Agricultural Science (UTME). |
| UEX184 | Civil Engineering | IBADAN | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:IBADAN:0 | IBADAN - As for Agricultural and Environmental Engineering (UTME). |
| UEX185 | Civil Engineering | MAKURDI | cross_reference | subject_or_general / engineering_offerings.json:Civil Engineering:MAKURDI:0 | MAKURDI - Same as in Agricultural Engineering. |
| UEX186 | Civil Engineering | MAKURDI AND FUNAAB | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:MAKURDI AND FUNAAB:0 | MAKURDI and FUNAAB same as in Agricultural Engineering (UTME). |
| UEX187 | Civil Engineering | MARITIME-UNI | olevel_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:MARITIME-UNI:0 | MARITIME-UNI requires five (5) at SSCE or its equivalent in English Language, Mathematics, Physics, Chemistry and Biology/Agricultural Science/Further Mathematics/Data Processing/Technical Drawing (UTME). |
| UEX188 | Civil Engineering | MAUTY | utme_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:MAUTY:2 | MAUTY requires Physics, Chemistry and Biology/Technical Drawing/Agricultural Science/Further Mathematics/Block laying, Brick Laying and Concrete Work/Air Conditioning and refrigeration/Plumbing and Pipe Fitting/Machine Wood Working/Painting and Decoration (UTME). |
| UEX189 | Civil Engineering | MINNA | olevel_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:MINNA:1 | MINNA requires 'O' Level credit passes including English Language, Mathematics, Physics, Chemistry and any one of Further Mathematics, Geography, Technical Drawing, Building Technology, Biology/Agricultural Science (UTME). |
| UEX190 | Civil Engineering | NDA | utme_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:NDA:1 | NDA requires one other Science/Technical subject from Technical Drawing, Further Mathematics, Biology, Geography and Building Engineering Drawing (UTME). |
| UEX191 | Civil Engineering | NDA | utme_parse_failed | direct_entry / engineering_offerings.json:Civil Engineering:NDA:0 | NDA requires the other Science subject from Technical Drawing, Further Mathematics, Biology and Geography. |
| UEX192 | Civil Engineering | NDU | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:NDU:0 | NDU - Same as in Agricultural and Environmental Engineering. |
| UEX193 | Civil Engineering | NILE | cross_reference | subject_or_general / engineering_offerings.json:Civil Engineering:NILE:1 | NILE - Same as in Computer Engineering (UTME subjects). |
| UEX194 | Civil Engineering | NILE | cross_reference | subject_or_general / engineering_offerings.json:Civil Engineering:NILE:0 | NILE - Same as in Computer Engineering. |
| UEX195 | Civil Engineering | RSU | multiple_clauses | direct_entry / engineering_offerings.json:Civil Engineering:RSU:0 | RSU in addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline; (b) OND/ND (Upper Credit) in relevant disciplines; (c) At least three (3) 'A' level passes at GCE in Physics, Chemistry and Mathematics. |
| UEX196 | Civil Engineering | UMUDIKE AND IBADAN | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:UMUDIKE AND IBADAN:0 | UMUDIKE and IBADAN - As for Agricultural and Environmental Engineering. |
| UEX197 | Civil Engineering | UNN | cross_reference | subject_or_general / engineering_offerings.json:Civil Engineering:UNN:2 | UNN - As in Agric Engineering (UTME subjects). |
| UEX198 | Civil Engineering | UNN | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:UNN:0 | UNN - Same as in Agricultural and Bioresources Engineering. |
| UEX199 | Civil Engineering | UNN | cross_reference | direct_entry / engineering_offerings.json:Civil Engineering:UNN:1 | UNN - Same as in Agricultural and Bioresources Engineering (UTME). |
| UEX200 | Civil Law | CALABAR | utme_parse_failed | direct_entry / law_offerings.json:Civil Law:CALABAR:2 | UTME SUBJECTS: (xiv) CALABAR requires Literature in English and Christian Religious Knowledge, Govt./History or Economic or any other Arts or Social Science Subjects. |
| UEX201 | Civil Law | IBADAN | utme_parse_failed | direct_entry / law_offerings.json:Civil Law:IBADAN:2 | UTME SUBJECTS: (iv) IBADAN accepts Science subjects. |
| UEX202 | Civil Law | LAGOS | multiple_clauses | direct_entry / law_offerings.json:Civil Law:LAGOS:3 | UTME SUBJECTS: (v) LAGOS requires English Language and any three Arts or Social Sciences subjects. Lagos does not accept Music, Fine Arts, and Principles of Accounting. Lagos accepts either Economics or Commerce but not both. |
| UEX203 | Common Law | ILORIN | utme_parse_failed | direct_entry / law_offerings.json:Common Law:ILORIN:2 | UTME SUBJECTS: i) ILORIN requires Arts or Social Science subjects including Literature in English. |
| UEX204 | Common and Islamic Law | BAYERO | utme_parse_failed | direct_entry / law_offerings.json:Common and Islamic Law:BAYERO:1 | UTME: (i) BAYERO requires Islamic Studies/Arabic and Literature-in-English for Common and Islamic Law. |
| UEX205 | Communication Arts | BOWEN AND IGBINEDION | utme_parse_failed | subject_or_general / arts_hum_offerings.json:Communication Arts:BOWEN AND IGBINEDION:0 | UTME Subjects: accept any other subjects in addition to Literature in English. |
| UEX206 | Communication Arts | UYO | utme_parse_failed | subject_or_general / arts_hum_offerings.json:Communication Arts:UYO:0 | Accepts a D7 in Mathematics. |
| UEX207 | Communication Technology | AUN | cross_reference | subject_or_general / engineering_offerings.json:Communication Technology:AUN:0 | Same as Information System. |
| UEX208 | Computer Science | AUN | multiple_clauses | direct_entry / sciences_offerings.json:Computer Science:AUN:0 | Accepts (a) 'A' Level passes chosen from English Language, Mathematics, Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. (b) does not accept 'O' Level credit passes in various non-academic subjects. (c) accepts IGCSE and 'A' Level Cambridge; does not offer direct admission to 200 level. |
| UEX209 | Computer Science | AUN | cross_reference | subject_or_general / engineering_offerings.json:Computer Science:AUN:0 | Same as in Software Engineering. |
| UEX210 | Computer Science | BAUCHI | utme_parse_failed | direct_entry / sciences_offerings.json:Computer Science:BAUCHI:0 | Requires Physics and Chemistry in addition to the UTME requirements. |
| UEX211 | Computer Science | BENIN | olevel_parse_failed | direct_entry / sciences_offerings.json:Computer Science:BENIN:0 | In addition to the UTME requirements accepts (a) ND upper credit/HND lower credit in Data Processing/Computer Science/Statistics or Science Laboratory Technology. (b) NCE credit in Mathematics and any other Science Subject. |
| UEX212 | Computer Science | BOWEN | cross_reference | subject_or_general / sciences_offerings.json:Computer Science:BOWEN:0 | Same as in Mathematics. |
| UEX213 | Computer Science | CALABAR | utme_parse_failed | direct_entry / sciences_offerings.json:Computer Science:CALABAR:0 | Accepts ND plus the UTME requirements. Requires Physics as the second subject. |
| UEX214 | Computer Science | RSU | multiple_clauses | direct_entry / sciences_offerings.json:Computer Science:RSU:0 | In addition to 'O' Level requirements accepts (a) For Computer Science: (1) HND (Lower Credit) in relevant discipline; (2) OND/ND (Upper Credit) in relevant discipline; (3) at least two (2) 'A' Level passes in Mathematics and Physics. (b) For Library and Information Science: detailed Year III/Year II admission criteria; all candidates must satisfy the U.M.E. entry requirements. |
| UEX215 | Computer Science | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:Computer Science:UMUDIKE:0 | Same as in Mathematics. |
| UEX216 | Computer and Information Science | FED-OYE EKITI | olevel_parse_failed | direct_entry / engineering_offerings.json:Computer and Information Science:FED-OYE EKITI:0 | FED-OYEEKITI requires five (5) credits at SSC (or its equivalent) including English Language, Mathematics, Physics, Chemistry and one other Science subject from Further Mathematics, Technical Drawing, Biology/Agricultural Science (UTME). |
| UEX217 | Computer and Information Science | ILORIN | olevel_parse_failed | direct_entry / engineering_offerings.json:Computer and Information Science:ILORIN:0 | ILORIN - UTME candidates are required to obtain O'Level credits in Five (5) subjects including English Language, Mathematics, Physics, Chemistry and any other relevant science subject in a single sitting (UTME). |
| UEX218 | Computer and Information Science | RSU AND UMUDIKE | cross_reference | direct_entry / engineering_offerings.json:Computer and Information Science:RSU AND UMUDIKE:0 | RSU and UMUDIKE - Same as in Civil Engineering (UTME). |
| UEX219 | Creative Arts | PHC | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Creative Arts:PHC:0 | DE: accepts A/level passes in GCE or HSC or IJMB or JUPEB in two (2) Art subjects including Literature in English, in addition to UTME entry requirements in two (2) Arts subjects including English Language, with an overall merit level Pass from a recognized College of Education. O'Level: requires Five (5) O Level Credits in English Language and any other four (4) subjects from Literature in English, History/Government, CRK/IRK, Economics, Mathematics, Biology, Chemistry, Agricultural Science, Physics, Igbo/Hausa/Yoruba, Fine Art, Geography, Commerce. UTME subjects: requires any other three (3) subjects from the same list. |
| UEX220 | Creative Arts | UNN | multiple_clauses | direct_entry / arts_hum_offerings.json:Creative Arts:UNN:0 | DE: (a) three (3) GCE 'A' Level passes in Fine Arts or Technical Drawing plus the UTME requirements; (b) HND holders with an average of B grade with the UTME requirements into 300 level; (c) ND credit or NCE merit with the UTME requirements; (d) candidates would be interviewed. O'Level: requires five (5) 'O' Level credit passes to include English Language, Fine and Applied Arts and one Science subject; candidates with NBC/NTC must have five (5) 'O' Level credit passes including English language, Technical drawing, Painting and Decorating and a Science subject. |
| UEX221 | Criminology and Security Studies | AAUA | olevel_parse_failed | direct_entry / social_management_offerings.json:Criminology and Security Studies:AAUA:0 | (x) AAUA requires five (5) `O' Level credit passes to include English Language, Mathematics, Economics and any other two from Commerce, Geography, Accounting and History/Government, and for Criminology and Security Studies, requires five (5) `O' Level credit passes to include English Language, Government/History, Mathematics and two other subjects from Social Science/Arts. |
| UEX222 | Criminology and Security Studies | AUN | multiple_clauses | direct_entry / social_management_offerings.json:Criminology and Security Studies:AUN:0 | (xv) AUN requires five (5) 'O' Level credit passes including English Language, Mathematics, and any other three (3) subjects from the following; Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. |
| UEX223 | Criminology and Security Studies | BELLS | cross_reference | direct_entry / social_management_offerings.json:Criminology and Security Studies:BELLS:0 | (xvii) BELLS, GOUU and NILE same as in Accountancy. |
| UEX224 | Criminology and Security Studies | CONVENAT | cross_reference | subject_or_general / social_management_offerings.json:Criminology and Security Studies:CONVENAT:0 | (xiii) CONVENAT - same as in Accounting |
| UEX225 | Criminology and Security Studies | FED-DUTSE | multiple_clauses | direct_entry / social_management_offerings.json:Criminology and Security Studies:FED-DUTSE:0 | (xxxviii) FED-OYE EKITI requires five (5) credits at SSC (or its equivalent) in English, Mathematics, Economics, plus one social Science subject(Government or/Geography) and any other subjects in Arts, Social sciences or science. FED-DUTSE requires five (5) `O' Level credit passes at not more than two (2) sittings in English Language, Mathematics, Economics and any other two (2) subjects from Commerce, Geography, Government, Accounting or Civic Education. For Criminology and Security Studies, FED-DUTSE accepts; five (5) `O' Level credit passes SSC or its equivalent to include English Language, Mathematics with any two (2) Social Science subjects and any one Arts subject at not more than two (2) sittings. |
| UEX226 | Criminology and Security Studies | FED-KASHERE | olevel_parse_failed | direct_entry / social_management_offerings.json:Criminology and Security Studies:FED-KASHERE:1 | (xlv) FED-KASHERE requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Economics and two other relevant subjects preferable in Commence, Government and Accounting. |
| UEX227 | Criminology and Security Studies | FED-OYE EKITI | multiple_clauses | direct_entry / social_management_offerings.json:Criminology and Security Studies:FED-OYE EKITI:1 | (xxxviii) FED-OYE EKITI requires five (5) credits at SSC (or its equivalent) in English, Mathematics, Economics, plus one social Science subject(Government or/Geography) and any other subjects in Arts, Social sciences or science. FED-DUTSE requires five (5) `O' Level credit passes at not more than two (2) sittings in English Language, Mathematics, Economics and any other two (2) subjects from Commerce, Geography, Government, Accounting or Civic Education. For Criminology and Security Studies, FED-DUTSE accepts; five (5) `O' Level credit passes SSC or its equivalent to include English Language, Mathematics with any two (2) Social Science subjects and any one Arts subject at not more than two (2) sittings. |
| UEX228 | Criminology and Security Studies | GOUU | cross_reference | direct_entry / social_management_offerings.json:Criminology and Security Studies:GOUU:0 | (xvii) BELLS, GOUU and NILE same as in Accountancy. |
| UEX229 | Criminology and Security Studies | IMSU | cross_reference | subject_or_general / social_management_offerings.json:Criminology and Security Studies:IMSU:0 | (v) IMSU - same as Marketing. |
| UEX230 | Criminology and Security Studies | NILE | cross_reference | direct_entry / social_management_offerings.json:Criminology and Security Studies:NILE:0 | (xvii) BELLS, GOUU and NILE same as in Accountancy. |
| UEX231 | Criminology and Security Studies | PAN-ATLANTIC | olevel_parse_failed | direct_entry / social_management_offerings.json:Criminology and Security Studies:PAN-ATLANTIC:0 | (xxxiv) PAN-ATLANTIC requires five (5) 'O' Level credit passes including English Language, Mathematics/ Economics/ Accounting/ Commerce and other relevant subjects. |
| UEX232 | Criminology and Security Studies | UNIKINGS | cross_reference | subject_or_general / social_management_offerings.json:Criminology and Security Studies:UNIKINGS:0 | (xxxv) UNIKINGS same as in Accounting. |
| UEX233 | Crop Production | ADSU | cross_reference | subject_or_general / agriculture_offerings.json:Crop Production:ADSU:0 | As in Animal Production & Fisheries. |
| UEX234 | Crop Production | EKSU AND FUTA | cross_reference | direct_entry / agriculture_offerings.json:Crop Production:EKSU AND FUTA:0 | As in Agricultural Economics and Extension. |
| UEX235 | Crop Production | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Crop Production:FUNAAB:0 | As in Agricultural Extension and Rural Development. |
| UEX236 | Crop Production | FUTO | cross_reference | subject_or_general / agriculture_offerings.json:Crop Production:FUTO:0 | Same as in Agricultural Economics. |
| UEX237 | Crop Production | MINNA | cross_reference | direct_entry / agriculture_offerings.json:Crop Production:MINNA:0 | MINNA does not accept Social Science subjects. Other requirements are as in Agriculture. |
| UEX238 | Crop Production | RSU | cross_reference | direct_entry / agriculture_offerings.json:Crop Production:RSU:0 | Same as in Animal Science. |
| UEX239 | Crop Production | UNN | cross_reference | direct_entry / agriculture_offerings.json:Crop Production:UNN:0 | Same as in Agricultural Economics and Extension. |
| UEX240 | Crop Science | DELSU | utme_parse_failed | subject_or_general / agriculture_offerings.json:Crop Science:DELSU:0 | DELSU accepts D7 in English Language. |
| UEX241 | Crop Science | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Crop Science:FUNAAB:0 | As in Agriculture Extension and Rural Development. |
| UEX242 | Crop Science | NAUB | cross_reference | subject_or_general / agriculture_offerings.json:Crop Science:NAUB:0 | As in Animal Production. |
| UEX243 | Crop Science | PHC | cross_reference | subject_or_general / agriculture_offerings.json:Crop Science:PHC:0 | Same as in Fisheries. |
| UEX244 | Crop Science | RSU | cross_reference | direct_entry / agriculture_offerings.json:Crop Science:RSU:0 | Same as in Animal Science. |
| UEX245 | Crop Science | SALEM | cross_reference | direct_entry / agriculture_offerings.json:Crop Science:SALEM:0 | UTME SUBJECTS: Same as in Soil Science. |
| UEX246 | Dentistry and Dental Technology | IBADAN | cross_reference | direct_entry / medical_offerings.json:Dentistry and Dental Technology:IBADAN:1 | UTME subjects: Same as in Medicine and Surgery. |
| UEX247 | Dentistry and Dental Technology | UNN | multiple_clauses | direct_entry / medical_offerings.json:Dentistry and Dental Technology:UNN:0 | Requires: a) Direct entry candidates in addition to satisfying the UTME requirements should also have three (3) 'A' Level passes in Biology or Zoology, Chemistry and Physics at one (1) sitting; b) Accepts B.Sc in related programme for admission into the five (5) year standard programme; c) MBBS may be admitted into the three (3) year clinical programme in Dentistry. |
| UEX248 | Drama/Dramatic Arts/Performing Arts | ABUJA | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Drama/Dramatic Arts/Performing Arts:ABUJA:0 | Accepts a minimum of ten (10) points in NCE or ND upper credit in addition to UTME requirements OR two (2) `A' Level passes including Literature in English and one other Arts subject; NCE merit or ND upper credit in Theatre Arts with four (4) `O' Level credit passes. |
| UEX249 | Drama/Dramatic Arts/Performing Arts | LASU | multiple_clauses | direct_entry / arts_hum_offerings.json:Drama/Dramatic Arts/Performing Arts:LASU:0 | NCE merit in Theatre/Performing/Creative or Communication Arts plus five (5) 'O' Level credit passes; recognized certificate in Dramatic Arts. |
| UEX250 | ELECTRONICS AND COMPUTER TECHNOLOGY | PHC | cross_reference | direct_entry / sciences_offerings.json:ELECTRONICS AND COMPUTER TECHNOLOGY:PHC:0 | as in Computer Science. |
| UEX251 | Eco-Tourism and Wildlife Management | IBADAN | cross_reference | direct_entry / agriculture_offerings.json:Eco-Tourism and Wildlife Management:IBADAN:0 | UTME same as in Wildlife and Ecotourism; accepts HND upper credit into 200 level and ND/NCE upper credit into 100 level in Tourism, Wildlife Management, Forestry, Agriculture, Animal Husbandry and related programs. |
| UEX252 | Economics | AUN | utme_parse_failed | direct_entry / administration_offerings.json:Economics:AUN:1 | UTME: AUN accepts a) 'A' Level passes chosen from Mathematics, Economics, Geography, Government, History, Literature in English, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, Biology, Physics, Chemistry and French. b) ND/HND c) ICGSE and 'A' Level Cambridge |
| UEX253 | Economics | AUN | utme_parse_failed | subject_or_general / administration_offerings.json:Economics:AUN:0 | UTME: AUN does not offer admissions direct to 200 level programs. |
| UEX254 | Economics | BELLS | cross_reference | subject_or_general / social_management_offerings.json:Economics:BELLS:0 | (xxxii) BELLS – Same as in Accounting. |
| UEX255 | Economics | BIU | cross_reference | subject_or_general / social_management_offerings.json:Economics:BIU:0 | (xxvi) BIU same as in Accounting |
| UEX256 | Economics | BOWEN | cross_reference | subject_or_general / social_management_offerings.json:Economics:BOWEN:0 | (xxvii) BOWEN - Same as in Accountancy. |
| UEX257 | Economics | CUAB | cross_reference | direct_entry / social_management_offerings.json:Economics:CUAB:1 | (xliv) CUAB – Same as in Banking and Finance. |
| UEX258 | Economics | FED-KASHERE | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Economics:FED-KASHERE:0 | Accepts Two 'A' Level passes in Economics and any of History/Government, Science, Social Science and Management subjects or Credit passes at NCE or ND or IJMB with at least 9 points in relevant subjects. UTME: Requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Economics and two other relevant subjects preferable in Commerce, Government and Accounting. |
| UEX259 | Economics | IBADAN | olevel_parse_failed | direct_entry / social_management_offerings.json:Economics:IBADAN:0 | (iv) IBADAN accepts two (2) 'A' Level passes but 'O' Level credit passes should include Mathematics and Economics. |
| UEX260 | Economics | MCPHERSON | cross_reference | direct_entry / administration_offerings.json:Economics:MCPHERSON:0 | UTME: MCPHERSON and PLASU - Same as in Accountancy. |
| UEX261 | Economics | MOUNTAIN TOP | olevel_parse_failed | direct_entry / social_management_offerings.json:Economics:MOUNTAIN TOP:0 | (lx) MOUNTAIN TOP requires candidates to have passed at credit level five (5) subjects including English Language, Economics and Mathematics at SSC Level or its equivalent as well as Economics and at least one of Mathematics, Statistics, Geography, Physics, Chemistry, Agricultural Science, Accounting, Business Management, |
| UEX262 | Economics | NILE | cross_reference | subject_or_general / social_management_offerings.json:Economics:NILE:0 | (xliii) NILE – Same as in Accounting. |
| UEX263 | Economics | PLASU | cross_reference | direct_entry / administration_offerings.json:Economics:PLASU:0 | UTME: MCPHERSON and PLASU - Same as in Accountancy. |
| UEX264 | Economics | UNIKINGS | cross_reference | subject_or_general / social_management_offerings.json:Economics:UNIKINGS:0 | (li) UNIKINGS same as in Accounting. |
| UEX265 | Economics | UNN | utme_parse_failed | subject_or_general / social_management_offerings.json:Economics:UNN:0 | (ix) UNN requires the UTME requirements. |
| UEX266 | Electrical Engineering | MARITIME-UNI | olevel_parse_failed | direct_entry / engineering_offerings.json:Electrical Engineering:MARITIME-UNI:0 | Requires five (5) credits at SSCE or its equivalent in English Language, Mathematics, Physics, Chemistry and Biology/Agricultural Science/Further Mathematics/Data Processing/Technical Drawing. |
| UEX267 | Electrical Engineering | UNN | cross_reference | direct_entry / engineering_offerings.json:Electrical Engineering:UNN:0 | Same as in Agricultural and Bioresources Engineering. |
| UEX268 | Electrical/Electronic Engineering | ABUAD | cross_reference | subject_or_general / engineering_offerings.json:Electrical/Electronic Engineering:ABUAD:0 | Same as in Civil Engineering (CRUTECH also). |
| UEX269 | Electrical/Electronic Engineering | BENIN | cross_reference | subject_or_general / engineering_offerings.json:Electrical/Electronic Engineering:BENIN:0 | Same as in Chemical Engineering. |
| UEX270 | Electrical/Electronic Engineering | NDA | utme_parse_failed | direct_entry / engineering_offerings.json:Electrical/Electronic Engineering:NDA:0 | Requires the other Science subject from Technical Drawing, Further Mathematics, Biology and Geography. |
| UEX271 | Electronics | UNIZIK | utme_parse_failed | subject_or_general / sciences_offerings.json:Electronics:UNIZIK:0 | (iv) UNIZIK accepts D7 in English Language. |
| UEX272 | Electronics Engineering | UNIZIK | utme_parse_failed | subject_or_general / engineering_offerings.json:Electronics Engineering:UNIZIK:0 | Accepts first degree in relevant programmes. |
| UEX273 | Electronics Engineering | UNN | cross_reference | direct_entry / engineering_offerings.json:Electronics Engineering:UNN:0 | Same as in Agricultural and Bioresources Engineering. |
| UEX274 | English and Literary Studies | KASU | olevel_parse_failed | direct_entry / arts_hum_offerings.json:English and Literary Studies:KASU:0 | Accepts Two `A' passes to include Literature in English and one other Arts subjects. NCE merit pass including English provided they merit `O' Level requirements. ND/HND Lower credit in related field and IJMB 7 points and above. |
| UEX275 | English and Literary Studies | OAU | cross_reference | subject_or_general / arts_hum_offerings.json:English and Literary Studies:OAU:0 | Same as in English Language. |
| UEX276 | Environmental Management and Toxicology | BENIN | multiple_clauses | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:BENIN:0 | For Science Laboratory Technology requires five (5) 'O' Level credit passes to include English Language, Mathematics, Chemistry and any two of Biology, Physics, Agricultural Science and Geography, depending on option chosen; Physics/Electronics, Petrochemical, Geology and Physiology/Pharmacology Techniques must have 'O' Level credit pass in Physics. |
| UEX277 | Environmental Management and Toxicology | BSU | olevel_parse_failed | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:BSU:0 | For Microbiology accepts passes in five prescribed subjects in Preliminary Science of BSU in addition to UTME requirements. For Environmental Management and Toxicology accepts ND/HND upper credit in Health Technology, Agriculture and other related programme. |
| UEX278 | Environmental Management and Toxicology | EUI | multiple_clauses | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:EUI:0 | Accepts five (5) 'O' Level credit passes including English Language and Mathematics and any other three science subjects; also requires five (5) credit passes at SSC in English Language, Mathematics, Chemistry, Physics and Biology at not more than two sittings. |
| UEX279 | Environmental Management and Toxicology | FED-DUTSE | multiple_clauses | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:FED-DUTSE:0 | (a) For Environmental Management and Toxicology accepts Five (5) 'O' Level credit passes at SSC level to include English Language, Mathematics, Chemistry, Geography and Biology or Agric. Science, in not more than two sittings; candidates must also have at least pass in Physics. (b) For Microbiology accepts English, Mathematics, Biology, Chemistry and Physics in SSC with minimum credit level in one or two sittings. |
| UEX280 | Environmental Management and Toxicology | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:FED-KASHERE:0 | Accepts Three 'A' Level passes in Biology and any other two of Chemistry, Physics, Mathematics, Botany and Geography (see Microbiology); accepts Five credit passes at SSCE in English, Mathematics, Biology, Chemistry and Physics. |
| UEX281 | Environmental Management and Toxicology | FUNAAB | cross_reference | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:FUNAAB:0 | Same as in Biological Science. |
| UEX282 | Environmental Management and Toxicology | GOUU | cross_reference | subject_or_general / sciences_offerings.json:Environmental Management and Toxicology:GOUU:0 | Same as in Biochemistry. |
| UEX283 | Environmental Management and Toxicology | IBADAN | cross_reference | subject_or_general / sciences_offerings.json:Environmental Management and Toxicology:IBADAN:0 | Same as in Botany. |
| UEX284 | Environmental Management and Toxicology | JOS | utme_parse_failed | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:JOS:0 | Accepts candidates with pass at the Remedial Science Programme of the University of Jos. |
| UEX285 | Environmental Management and Toxicology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Environmental Management and Toxicology:KWASU:0 | Same as in Biochemistry. |
| UEX286 | Environmental Management and Toxicology | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:Environmental Management and Toxicology:MAKURDI:0 | Same as in Biochemistry. |
| UEX287 | Environmental Management and Toxicology | PLASU | cross_reference | subject_or_general / sciences_offerings.json:Environmental Management and Toxicology:PLASU:0 | Same as in Biochemistry. |
| UEX288 | Environmental Management and Toxicology | UMUDIKE | cross_reference | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:UMUDIKE:0 | Same as its requirement for Food Science and Technology. |
| UEX289 | Environmental Management and Toxicology | UNIKINGS | olevel_parse_failed | direct_entry / sciences_offerings.json:Environmental Management and Toxicology:UNIKINGS:0 | Accepts five (5) credits at SSC in English Language, Mathematics, Biology, Chemistry and any other Science subject. |
| UEX290 | Estate Management | JOS | olevel_parse_failed | direct_entry / engineering_offerings.json:Estate Management:JOS:1 | (UTME) Requires five (5) credit passes including English Language, Mathematics, Economics and any other two (2) from Physics, Chemistry, Biology, Agricultural Science, Geography, Book-Keeping/Financial Accounting, Fine Arts, Technical Drawing, Surveying and Building Construction. |
| UEX291 | Estate Management | UNIOSUN | olevel_parse_failed | direct_entry / engineering_offerings.json:Estate Management:UNIOSUN:1 | (UTME) Requires five (5) 'O' Level credits in SSC including Mathematics, English, Chemistry, Physics and Geography. |
| UEX292 | Fisheries | EBSU | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:EBSU:2 | EBSU - As in Landscape Management. |
| UEX293 | Fisheries | EBSU | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:EBSU:1 | EBSU as in Landscape Technology. |
| UEX294 | Fisheries | EBSU | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:EBSU:0 | EBSU - As in Landscape Management. |
| UEX295 | Fisheries | FED-DUTSINMA | multiple_clauses | direct_entry / agriculture_offerings.json:Fisheries:FED-DUTSINMA:2 | FED-DUTSINMA requires Five `O' level Credits to include; English Language, Mathematics, Chemistry, Biology/Agriculture/Animal Husbandry/Forestry/Fisheries and any other one relevant subject. |
| UEX296 | Fisheries | FED-DUTSINMA | multiple_clauses | direct_entry / agriculture_offerings.json:Fisheries:FED-DUTSINMA:1 | FED-DUTSINMA requires Five `O' level Credits to include; English Language, Mathematics, Chemistry, Biology/Agriculture/Animal Husbandry/Forestry/Fisheries and any other one relevant subject. |
| UEX297 | Fisheries | LAPAI | cross_reference | subject_or_general / agriculture_offerings.json:Fisheries:LAPAI:0 | LAPAI - As in Agriculture. |
| UEX298 | Fisheries | LAPAI | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:LAPAI:1 | LAPAI and UMUDIKE - Same as in Agriculture. |
| UEX299 | Fisheries | MAIDUGURI | utme_parse_failed | direct_entry / agriculture_offerings.json:Fisheries:MAIDUGURI:1 | MAIDUGURI requires Chemistry, Biology/Agriculture and either of Physics or Mathematics. |
| UEX300 | Fisheries | RSU | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:RSU:2 | RSU - Same as in Animal Science. |
| UEX301 | Fisheries | RSU | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:RSU:1 | RSU - Same as in Animal Science. |
| UEX302 | Fisheries | UMUDIKE | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:UMUDIKE:0 | UMUDIKE and DELSU same as in Agriculture. |
| UEX303 | Fisheries | UMUDIKE | cross_reference | direct_entry / agriculture_offerings.json:Fisheries:UMUDIKE:1 | UMUDIKE and LAPAI and UDU - As in Agriculture. |
| UEX304 | Food Engineering | ILORIN | olevel_parse_failed | direct_entry / engineering_offerings.json:Food Engineering:ILORIN:0 | Direct Entry: apart from relevant programmes and 'O' Level requirements: a) first degree in Physical Sciences at Second Class lower level may be admitted into 200 Level. b) HND upper credit or distinction in relevant Engineering programmes or College of Technology after NYSC may be admitted to 300 level. c) first degree in Engineering programmes may be admitted into 300 level of any other Engineering programme. |
| UEX305 | Food Science with Business | FED-WUKARI | utme_parse_failed | direct_entry / agriculture_offerings.json:Food Science with Business:FED-WUKARI:2 | FED-WUKARI requires Chemistry, Mathematics/Physics and any one of Biology/Agricultural Science or any Social Science Subject. |
| UEX306 | Forestry and Fisheries | BENIN | cross_reference | subject_or_general / agriculture_offerings.json:Forestry and Fisheries:BENIN:0 | BENIN as in Agricultural Economics. |
| UEX307 | Forestry and Fisheries | BENIN AND DELSU | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:BENIN AND DELSU:0 | BENIN and DELSU - As in Agricultural Economics. |
| UEX308 | Forestry and Fisheries | CRUTECH | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:CRUTECH:0 | CRUTECH - Same as Animal Science and Fisheries. |
| UEX309 | Forestry and Fisheries | EBSU | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:EBSU:0 | EBSU - As in Landscape Management. |
| UEX310 | Forestry and Fisheries | EKSU | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:EKSU:0 | EKSU as in Agricultural Economics and Extension. |
| UEX311 | Forestry and Fisheries | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:FUNAAB:1 | FUNAAB as in Agricultural Extension and Rural Development. |
| UEX312 | Forestry and Fisheries | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:FUNAAB:0 | FUNAAB as in Agricultural Extension and Rural Development. |
| UEX313 | Forestry and Fisheries | KSUSTA | cross_reference | subject_or_general / agriculture_offerings.json:Forestry and Fisheries:KSUSTA:0 | KSUSTA - Same as in Fisheries. |
| UEX314 | Forestry and Fisheries | UMUDIKE AND LAPAI | cross_reference | direct_entry / agriculture_offerings.json:Forestry and Fisheries:UMUDIKE AND LAPAI:0 | UMUDIKE and LAPAI - as in Agriculture. |
| UEX315 | Gas Engineering | BENIN | cross_reference | subject_or_general / engineering_offerings.json:Gas Engineering:BENIN:0 | As in Chemical Engineering. |
| UEX316 | Gas Engineering | IBADAN | cross_reference | direct_entry / engineering_offerings.json:Gas Engineering:IBADAN:0 | As in Agricultural and Environmental Engineering. |
| UEX317 | Gas Engineering | MARITIME-UNI | olevel_parse_failed | direct_entry / engineering_offerings.json:Gas Engineering:MARITIME-UNI:0 | Requires five (5) credits at SSCE or its equivalent in English Language, Mathematics, Physics, Chemistry and Biology/Agricultural Science/Further Mathematics/Data Processing/Technical Drawing. |
| UEX318 | Gas Engineering | NILE | cross_reference | subject_or_general / engineering_offerings.json:Gas Engineering:NILE:0 | Same as in Computer Engineering. |
| UEX319 | Geography | GSU | multiple_clauses | direct_entry / sciences_offerings.json:Geography:GSU:0 | Accepts Economics and Government (DE); accepts Economics (UTME). |
| UEX320 | Geography | JOS | olevel_parse_failed | direct_entry / engineering_offerings.json:Geography:JOS:0 | Accepts IJMB passes including Geography. Also accepts ND/HND credit in Urban and Regional Planning or Land Surveying. Requires five (5) 'O' Level credit passes to include English Language, Mathematics and Geography in addition to any other two (2) Social Science or Science subjects; accepts credit in Zoology, Physics, Agricultural Science and credit in English Language. |
| UEX321 | Geography | MAUTY | olevel_parse_failed | direct_entry / engineering_offerings.json:Geography:MAUTY:1 | Requires five (5) SSC credit passes to include English Language, Mathematics and Geography and any two from Physics, Chemistry, Biology/Agric Science, Economics, Commerce, Government and Tourism. Also requires Geography and any two of Biology/Agric Science, Chemistry, Physics, Mathematics, Tourism, Economics, Commerce and Government. |
| UEX322 | Geology | DELSU | olevel_parse_failed | direct_entry / sciences_offerings.json:Geology:DELSU:1 | DELSU requires five (5) 'O' Level credits must include Physics, Chemistry, Mathematics, English Language and any other science subject. |
| UEX323 | Geology | RSU | multiple_clauses | direct_entry / sciences_offerings.json:Geology:RSU:0 | RSU in addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline. (b) OND/ND (Upper Credit) in relevant discipline. (c) HSC/GCE A/L passes in at least two (2) relevant subjects; in Chemistry, Mathematics, Physics. RSU accepts Admissions into Year III; HND (Upper Credit) in relevant discipline. Admissions into Year II; HND (Lower Credit) in relevant discipline. OND/ND (Upper Credit) in relevant discipline. HSC/GCE A/L passes in at least two (2) relevant subjects; in Chemistry, Mathematics, Physics. In addition, all such candidates above must also satisfy the UME entry requirements. |
| UEX324 | Geology | WESLEYUNI | olevel_parse_failed | direct_entry / sciences_offerings.json:Geology:WESLEYUNI:0 | WESLEYUNI accepts (a) Two (2) 'A' Level passes in any of Mathematics, Physics, Chemistry, Economics and any other relevant subject (b) ND upper credit in addition to five (5) 'O' Level credit passes or its equivalent. |
| UEX325 | Geophysics | MOUNTAIN TOP | multiple_clauses | direct_entry / sciences_offerings.json:Geophysics:MOUNTAIN TOP:0 | In addition to 'O' Level requirements requires: (a) minimum of ND Upper Credit or equivalent from a recognized institution; (b) G.C.E ('A' Level) or equivalent from a recognized institution in at least two science subjects including Physics and Mathematics; (c) Foundation/JUPEB obtained from Mountain Top University or other recognized Universities. |
| UEX326 | Government and Public Administration | ABUAD | utme_parse_failed | direct_entry / social_management_offerings.json:Government and Public Administration:ABUAD:0 | ABUAD requires Three (3) Arts, Social Science or Science subjects. |
| UEX327 | History and Strategic Studies | MAIDUGURI | utme_parse_failed | direct_entry / arts_hum_offerings.json:History and Strategic Studies:MAIDUGURI:1 | UTME SUBJECTS: Requires History/Civic/Government and any other two (2) subjects. |
| UEX328 | History and Strategic Studies | OAU | multiple_clauses | direct_entry / arts_hum_offerings.json:History and Strategic Studies:OAU:0 | UTME: Requires five (5) 'O' Level credit passes to include History and English Language plus one Arts subject and any other two subjects from Arts or Social Sciences. Accepts Government in lieu of History. UTME SUBJECTS: Requires History and any two (2) Arts subjects. |
| UEX329 | History and Strategic Studies | UNIKINGS | olevel_parse_failed | direct_entry / arts_hum_offerings.json:History and Strategic Studies:UNIKINGS:1 | UTME: Requires five (5) credit passes at SSC in English Language, Government and three (3) other Arts subjects. |
| UEX330 | History and Strategic Studies | UNN | multiple_clauses | direct_entry / arts_hum_offerings.json:History and Strategic Studies:UNN:1 | UTME: Accepts five (5) 'O' Level credit passes in Government in lieu of History and three (3) other Arts or Social Science subjects; also requires five (5) 'O' Level credit passes in English Language, History/Government plus any three other subjects. UTME SUBJECTS: Accepts History or Government and two other Arts or Social Science subjects. |
| UEX331 | Home Economics | FED-GASHUA | utme_parse_failed | direct_entry / agriculture_offerings.json:Home Economics:FED-GASHUA:0 | Requires OND/ND (Upper Credit), HND (Lower credit) in Food Science and Technology, Hotel Management and Tourism, Home Economics Nutrition, Dietetics, Clothing and Textile from a recognized institution in addition to UTME requirements into 200 Levels. It also accepts Two (2) 'A' level passes. |
| UEX332 | Home Economics and Hotel Management | IAUED | utme_parse_failed | direct_entry / education_offerings.json:Home Economics and Hotel Management:IAUED:0 | UTME: one (1) Science subject. UTME subjects: one Science subject and any other subjects. |
| UEX333 | Home Economics and Hotel Management | MAUTY | olevel_parse_failed | direct_entry / education_offerings.json:Home Economics and Hotel Management:MAUTY:0 | Accepts NCE merit in Home Economics, A Level passes in two (2) of Chemistry or any Biology, Botany and Agricultural Science, and ND/HND credit in Home Economics or Food Science or Hotel and Catering Management or related programme. UTME: five O Level credit passes including English Language, Mathematics and any three of Biology/Agric Sc., Home Management, Food and Nutrition, Clothing & Textiles, Economics, Geography, Chemistry, Physics, Health Education, Catering & Craft Practice, Garment Making, Textile Trade, Marketing/Salesmanship, Cosmetology; or NTC/NBC credit passes or TCII Merit including English and Mathematics. UTME subjects: Biology/Agricultural Science and any two of Home Economics/Management, Economics, Chemistry, Physics. |
| UEX334 | Home Economics and Hotel Management | UNN | olevel_parse_failed | direct_entry / education_offerings.json:Home Economics and Hotel Management:UNN:0 | For a three-year degree programme accepts (in addition to UTME requirements) NCE merit in Home Economics, ND lower credit in Fashion and Clothing Management Education or Home Economics or Home and Rural Economics or Hotel and Catering; a University Degree in any discipline plus departmental UTME requirements may be considered for direct entry into a three-year programme. UTME: five 'O' Level credit passes including any two of Home Management, Clothing and Textiles, Food and Nutrition, Biology, Chemistry, Physics, Agricultural Science, Economics, Cosmetology, Garment Making and Catering Craft plus UNN UTME requirements. UTME subjects: Chemistry or Biology plus any two other Science or Social Science subjects like Agricultural Science, Home Economics, Physics, Mathematics, Economics, Commerce and Geography. |
| UEX335 | Home Economics and Hotel Management | YABA-DEG | olevel_parse_failed | direct_entry / education_offerings.json:Home Economics and Hotel Management:YABA-DEG:0 | Accepts NCE merit in Home Economics, A Level passes in two (2) of Chemistry or any Biology, Botany and Agricultural Science, and ND/HND credit in Home Economics or Food Science or Hotel and Catering Management or any other related programme. Requires Five (5) O Level NTC/NBC credit passes or TC II in English Language, Mathematics and any other three subjects from Home Economics/Management, Biology/Agricultural Science, Chemistry, Physics, Food & Nutrition, Economics, Cosmetology, Clothing & Textile/Garment Making, Catering Craft, Health Education/Health Science, Dyeing & Bleaching, Leather Work, Tourism, Jewellery and Basketry. UTME subjects: English Language, Chemistry/Biology and any other two subjects from the O'Level requirements. |
| UEX336 | Home Science & Management | RSU | cross_reference | direct_entry / agriculture_offerings.json:Home Science & Management:RSU:0 | Same as in Food Science and Technology. Requires five (5) 'O' Level credit passes to include English Language, Mathematics, Chemistry, Biology or Agric Science and any other subject. |
| UEX337 | Home Science & Management | UNN | cross_reference | direct_entry / agriculture_offerings.json:Home Science & Management:UNN:0 | As in Agricultural Economics. In addition to the UTME requirements, requires 'O' Level credit passes in Chemistry, Biology or Food and Nutrition or Agricultural Science. UTME requires Chemistry, Biology/Agricultural Science, and one (1) of Physics/Mathematics, Economics or Geography. |
| UEX338 | Horticulture | UMUDIKE | multiple_clauses | direct_entry / agriculture_offerings.json:Horticulture:UMUDIKE:0 | UMUDIKE accepts Five (5) 'O' Level credit passes at not more than two (2) sittings to include: English Language, Mathematics, Chemistry, Biology, or Agricultural Science and any other science subjects; requires at least 'O' Level pass in Physics. 'O' Level credit in Agricultural Science must be backed up with at least 'O' Level pass in Biology. |
| UEX339 | Hotel Management & Tourism | BELLS | cross_reference | direct_entry / agriculture_offerings.json:Hotel Management & Tourism:BELLS:0 | As in Food Science and Technology. |
| UEX340 | Hotel Management & Tourism | MAKURDI | utme_parse_failed | subject_or_general / agriculture_offerings.json:Hotel Management & Tourism:MAKURDI:0 | Accepts D7 in English Language. |
| UEX341 | Hotel Management & Tourism | OAU | utme_parse_failed | direct_entry / agriculture_offerings.json:Hotel Management & Tourism:OAU:0 | UTME: accepts Physics, Geography, Home Management, Statistics, Economics, Business Studies, Zoology, Commerce or any of the following pairs Chemistry and Biology, Chemistry and Agriculture and Chemistry and Economics. |
| UEX342 | Hotel Management & Tourism | UMUDIKE | cross_reference | direct_entry / agriculture_offerings.json:Hotel Management & Tourism:UMUDIKE:0 | (a) For Home Economics - Same as in Agriculture. (b) For Hotel Management and Tourism, it requires five (5) 'O' Level credit passes to include English Language, Mathematics, Chemistry and any of Physics, Economics and Government. |
| UEX343 | Hotel and Tourism Management | PHC | olevel_parse_failed | direct_entry / administration_offerings.json:Hotel and Tourism Management:PHC:1 | UTME (ii) PHC requires Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX344 | Hotel and Tourism Management | PHC | utme_parse_failed | direct_entry / administration_offerings.json:Hotel and Tourism Management:PHC:2 | UTME SUBJECT (i) PHC requires Mathematics, Economics and any other subject from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX345 | Human Nutrition and Dietetics | IBADAN | cross_reference | direct_entry / medical_offerings.json:Human Nutrition and Dietetics:IBADAN:1 | UTME: same as in Medicine and Surgery. |
| UEX346 | INFORMATION AND COMMUNICATION SCIENCE | BAYERO | olevel_parse_failed | subject_or_general / sciences_offerings.json:INFORMATION AND COMMUNICATION SCIENCE:BAYERO:0 | accepts five (5) SSCE credit passes to include English Language, Mathematics, plus three of the following: Biology, Chemistry, Physics, Geography, Agriculture or Economics. |
| UEX347 | INFORMATION AND COMMUNICATION TECHNOLOGY | RENAISSANCE | utme_parse_failed | subject_or_general / sciences_offerings.json:INFORMATION AND COMMUNICATION TECHNOLOGY:RENAISSANCE:0 | requires Further Mathematics with Physics or Chemistry. |
| UEX348 | INFORMATION AND COMMUNICATION TECHNOLOGY | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:INFORMATION AND COMMUNICATION TECHNOLOGY:UMUDIKE:0 | same as in Mathematics. |
| UEX349 | INFORMATION SCIENCE AND MEDIA STUDIES | AUN | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:AUN:0 | requires Maths, Chemistry and any one of Physics, Biology or Geography for both Information Systems and Software Engineering. |
| UEX350 | INFORMATION SCIENCE AND MEDIA STUDIES | CALABAR | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:CALABAR:0 | requires the two (2) other subjects to be from Chemistry, Biology and Economics. |
| UEX351 | INFORMATION SCIENCE AND MEDIA STUDIES | FED-DUTSE | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:FED-DUTSE:0 | accepts Mathematics, Physics and one other relevant Science-based subject from Biology, Chemistry, Geography, Agriculture Science, Further Mathematics, Technical Drawing and Economics. |
| UEX352 | INFORMATION SCIENCE AND MEDIA STUDIES | IAUED | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:IAUED:0 | requires English Language, Mathematics, Physics and any other from Chemistry, Biology, Health Science, Economics, Geography, Data Processing. |
| UEX353 | INFORMATION SCIENCE AND MEDIA STUDIES | ILORIN | multiple_clauses | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:ILORIN:0 | for Computer Science requires Mathematics, Physics and any of Chemistry or Economics. For Information and Communication Science requires any three (3) subjects from Mathematics, Physics, Chemistry, Biology/Agric. Science and Economics/Geography. For Telecommunication Science requires Mathematics, Physics, Chemistry. For Library and Information Science requires Mathematics, Physics and one (1) of Biology, Chemistry, Agric Science, Economics and Geography. |
| UEX354 | INFORMATION SCIENCE AND MEDIA STUDIES | MAUTY | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:MAUTY:0 | For Library and Information Science requires Economics and any two (2) of Principles of Accounts, Commerce, Government, Geography and Mathematics. For Computer Science it requires Mathematics, Physics and any one of Chemistry, Biology/Agric Science, Economics, Geography. |
| UEX355 | INFORMATION SCIENCE AND MEDIA STUDIES | RSU | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:RSU:1 | requires English Lang, Mathematics, Physics and any other Science Subject. |
| UEX356 | INFORMATION SCIENCE AND MEDIA STUDIES | RSU | utme_parse_failed | direct_entry / sciences_offerings.json:INFORMATION SCIENCE AND MEDIA STUDIES:RSU:0 | for Computer Science requires Mathematics, Physics and any other Science Subject and for Library and Information Science requires English Language, Literature in English, Christian Religious Knowledge, Government. |
| UEX357 | INFORMATION SYSTEMS | ILORIN | multiple_clauses | direct_entry / sciences_offerings.json:INFORMATION SYSTEMS:ILORIN:0 | For Computer Science requires five (5) 'O' Level Credit passes including English Language, Mathematics, Physics, Biology, and any other science subject. For Telecommunication Science requires five (5) O-level (WASCE/GCE/NECO) credits in five subjects including Mathematics, English language, Physics, Chemistry any of Further Mathematics, Technical Drawing, Economics and Geography. For Library and Information Science requires Credit passes in five (5) subjects including English Language and Mathematics at not more than 2 sittings. |
| UEX358 | INFORMATION TECHNOLOGY | AAUA | olevel_parse_failed | direct_entry / sciences_offerings.json:INFORMATION TECHNOLOGY:AAUA:0 | requires five (5) 'O' Level credit passes to include English Language, Mathematics, Physics, Chemistry and at least one from Biology, Statistics, Agricultural Science, Additional Mathematics, Economics, Geography, Commerce, Accounts/Book-keeping, and Government. |
| UEX359 | Igbo | UNN | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Igbo:UNN:0 | Accepts `A' Level passes or NCE merit in at least one Language and one other subject plus UTME requirements. For Linguistics/Nigerian Language requires 'O' Level credit in the Nigerian language. |
| UEX360 | Industrial Chemistry | AJAYI | cross_reference | direct_entry / sciences_offerings.json:Industrial Chemistry:AJAYI:0 | (x) AJAYI and BENIN as in Chemistry. |
| UEX361 | Industrial Chemistry | BENIN | cross_reference | direct_entry / sciences_offerings.json:Industrial Chemistry:BENIN:0 | (x) AJAYI and BENIN as in Chemistry. |
| UEX362 | Industrial Chemistry | BOWEN | cross_reference | subject_or_general / sciences_offerings.json:Industrial Chemistry:BOWEN:1 | (vi) BOWEN same as in Biochemistry. |
| UEX363 | Industrial Chemistry | IBADAN | cross_reference | direct_entry / sciences_offerings.json:Industrial Chemistry:IBADAN:0 | (viii) IBADAN, IMSU and IGBINEDION - Same as in Chemistry. |
| UEX364 | Industrial Chemistry | IGBINEDION | cross_reference | direct_entry / sciences_offerings.json:Industrial Chemistry:IGBINEDION:1 | (viii) IBADAN, IMSU and IGBINEDION - Same as in Chemistry. |
| UEX365 | Industrial Chemistry | IMSU | cross_reference | direct_entry / sciences_offerings.json:Industrial Chemistry:IMSU:1 | (viii) IBADAN, IMSU and IGBINEDION - Same as in Chemistry. |
| UEX366 | Industrial Design | ABU | multiple_clauses | direct_entry / engineering_offerings.json:Industrial Design:ABU:1 | (UTME) Requires 1. For Industrial Design; five 'O' level credit passes which must include English Language, Fine Arts/Technical Drawing/Visual Arts/Fashion Design/Painting and Decoration/Printing/Ceramics and any 3 subjects with at least pass in Mathematics. 2. For Glass Technology; five 'O' level credit passes in English Language, Mathematics, Chemistry, Physics, and any other relevant Science subject. UTME subjects: For Industrial Design; Fine Arts and any two (2) subjects. For Glass Technology; Chemistry, Physics and any other Science Subject. |
| UEX367 | Industrial Design | MAUTY | olevel_parse_failed | direct_entry / engineering_offerings.json:Industrial Design:MAUTY:1 | (UTME) Requires Five (5) SSC credit passes to include English Language, Mathematics and any Three from Technical Drawing, Fine Art, Visual Arts, Graphic Design, Garment Making, Dying and Bleaching, Chemistry, Physics, Biology/Agric. Science and other design subjects. UTME subjects: Geography and any Two of Chemistry, Mathematics, Physics, and Fine Arts. |
| UEX368 | Industrial Mathematics | BENIN | cross_reference | subject_or_general / sciences_offerings.json:Industrial Mathematics:BENIN:0 | (iv) BENIN - Same as in Mathematics. |
| UEX369 | Industrial Mathematics | WESLEYUNI | cross_reference | subject_or_general / sciences_offerings.json:Industrial Mathematics:WESLEYUNI:0 | (vi) WESLEYUNI same as in Mathematics. |
| UEX370 | Industrial Mathematics and Computer Science | ESUTECH | olevel_parse_failed | direct_entry / sciences_offerings.json:Industrial Mathematics and Computer Science:ESUTECH:0 | UTME (i) ESUTECH requires English Language, Mathematics and three (3) 'O' Level credit passes out of Physics, Statistics, Economics, Biology, Chemistry, Further Mathematics and Agricultural Science. |
| UEX371 | Industrial Relations and Personnel Management | LAGOS | utme_parse_failed | direct_entry / administration_offerings.json:Industrial Relations and Personnel Management:LAGOS:2 | UTME SUBJECT (ii) LAGOS requires as third (3rd) subject any one (1) subject from Science, Social Sciences and Arts. |
| UEX372 | Insurance | JOS | olevel_parse_failed | direct_entry / administration_offerings.json:Insurance:JOS:0 | JOS accepts: a) Holders of HSC, GCE `A' Level, IJMB with passes in two (2) relevant Social Science subjects. b) Candidates with lower credit in ND in Business Administration, Accounting, Purchasing and Supply, Marketing and other closely related programmes may also be considered provided such candidates satisfy the `O' Level credit passes requirements. |
| UEX373 | Intelligence and Security Studies | ABSU | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:ABSU:0 | (xv) ABSU same as in Political Science. |
| UEX374 | Intelligence and Security Studies | ABU | utme_parse_failed | direct_entry / social_management_offerings.json:Intelligence and Security Studies:ABU:1 | (xxvii) ABU requires Use Of English, Government/History And Two Other From Economics, Geography, CRK/IRK, Commerce And Civic Education. |
| UEX375 | Intelligence and Security Studies | ABUJA | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:ABUJA:0 | (i) ABUJA - As in Political Science. SECURITY STUDIES |
| UEX376 | Intelligence and Security Studies | BOWEN | olevel_parse_failed | direct_entry / social_management_offerings.json:Intelligence and Security Studies:BOWEN:0 | (ix) BOWEN require five (5) 'O' Level credit passes to include English Language, Mathematics, and any two (2) Social Science subjects plus any other subject. |
| UEX377 | Intelligence and Security Studies | DELSU | olevel_parse_failed | direct_entry / social_management_offerings.json:Intelligence and Security Studies:DELSU:0 | (xxxi) DELSU requires five credit passes at SSC 'O'Level or its equivalent, which must include English Language, Mathematics, three (3) other subjects, two (2) of Social Science or Art subjects. |
| UEX378 | Intelligence and Security Studies | EUI | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:EUI:0 | (xxx) EUI - As in Political Science. |
| UEX379 | Intelligence and Security Studies | FED-GASHUA | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:FED-GASHUA:0 | (xxxii) FED-GASHUA - As in Political Science. |
| UEX380 | Intelligence and Security Studies | GOUU | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:GOUU:0 | (xvi) GOUU same as in Political Science and International Relations. |
| UEX381 | Intelligence and Security Studies | IAUED | utme_parse_failed | direct_entry / social_management_offerings.json:Intelligence and Security Studies:IAUED:0 | (xxxiv) IAUED requires English language, Mathematics, any three (3) of the following: Government, Economics, Geography, C ommerce, Civic Education, History, Literature in English, Christian Religious Studies, Islamic Studies, Business Studies, Marketing, Bookkeeping, Data processing, Agricultural Science, Music, Health Education, French, Animal husbandry and any of the science subjects. |
| UEX382 | Intelligence and Security Studies | IAUED | utme_parse_failed | subject_or_general / social_management_offerings.json:Intelligence and Security Studies:IAUED:1 | (xxiii) IAUED requires English language, Government, Economics, Religious |
| UEX383 | Intelligence and Security Studies | ILORIN | olevel_parse_failed | direct_entry / social_management_offerings.json:Intelligence and Security Studies:ILORIN:0 | (iii) ILORIN requires five (5) `O' Level subjects which must include English Language, Mathematics and any two (2) of the following, Government, Economics, Geography or commerce and any other subject for the fifth credit. |
| UEX384 | Intelligence and Security Studies | KWASU | cross_reference | subject_or_general / social_management_offerings.json:Intelligence and Security Studies:KWASU:1 | (xiii) KWASU - Same as in Geography. |
| UEX385 | Intelligence and Security Studies | REDEEMERS | multiple_clauses | direct_entry / social_management_offerings.json:Intelligence and Security Studies:REDEEMERS:0 | (xi) REDEEMERS requires five (5) 'O' Level credit passes to include English Language, Mathematics and three (3) additional subjects in Social; Sciences or Arts. |
| UEX386 | Intelligence and Security Studies | WESTERN-DEL | cross_reference | direct_entry / social_management_offerings.json:Intelligence and Security Studies:WESTERN-DEL:0 | (xix) WESTERN-DEL same as in Political Science and Public Administration. |
| UEX387 | International Relations | ABU | olevel_parse_failed | direct_entry / social_management_offerings.json:International Relations:ABU:1 | UTME (i) ABU requires Five `O' level credit passes including English Language and Mathematics, Government or History, Economics, and preferably French, Arabic, Arabic, Hausa, Yoruba and Igbo. |
| UEX388 | International Relations | ABUAD | cross_reference | direct_entry / social_management_offerings.json:International Relations:ABUAD:0 | (iv) ABUAD – Same as in Political Science. |
| UEX389 | International Relations | ABUAD | cross_reference | direct_entry / social_management_offerings.json:International Relations:ABUAD:1 | (x) GOUU and ABUAD – Same as in Political Science. |
| UEX390 | International Relations | BELLS | cross_reference | subject_or_general / social_management_offerings.json:International Relations:BELLS:1 | (ii) BELLS – Same as in Accounting. |
| UEX391 | International Relations | BELLS | cross_reference | subject_or_general / social_management_offerings.json:International Relations:BELLS:0 | (iii) BELLS – Same as in Accounting. |
| UEX392 | International Relations | COVENANT | cross_reference | subject_or_general / social_management_offerings.json:International Relations:COVENANT:0 | (ix) COVENANT same as in Marketing. |
| UEX393 | International Relations | GOUU | cross_reference | direct_entry / social_management_offerings.json:International Relations:GOUU:1 | (x) GOUU and ABUAD – Same as in Political Science. |
| UEX394 | International Relations | UNIKINGS | cross_reference | direct_entry / social_management_offerings.json:International Relations:UNIKINGS:1 | (xiii) UNIKINGS same as in Political Science. |
| UEX395 | International Relations | UNIKINGS | cross_reference | direct_entry / social_management_offerings.json:International Relations:UNIKINGS:0 | UNIKINGS same as in Political Science. |
| UEX396 | International Relations and Diplomatic Studies | BELLS | cross_reference | subject_or_general / social_management_offerings.json:International Relations and Diplomatic Studies:BELLS:0 | UTME SUBJECTS (i) BELLS – Same as in Accounting. |
| UEX397 | International Studies | ABUAD | cross_reference | subject_or_general / social_management_offerings.json:International Studies:ABUAD:0 | (iii) ABUAD – Same as in Sociology. |
| UEX398 | International Studies and | DELSU | olevel_parse_failed | direct_entry / arts_hum_offerings.json:International Studies and:DELSU:0 | UTME: accepts Five (5) credit level passes at SSCE/NECO/GCE 'O' Level which may include Mathematics, English Language and four other subjects from Arts and Social Science. |
| UEX399 | International Studies and | EKSU | utme_parse_failed | direct_entry / arts_hum_offerings.json:International Studies and:EKSU:0 | UTME: EKSU and UYO accept Proficiency Certificate in French. UYO accepts Proficiency Certificate in French from University of UYO and certificate in French from the Alliance Francaise. |
| UEX400 | International Studies and | NDA | utme_parse_failed | direct_entry / arts_hum_offerings.json:International Studies and:NDA:0 | UTME: requires two (2) Arts and Social Science subjects from Economics, Geography, Government, Civic Education, History, Arabic, CRS/IS and any other Nigerian Language. |
| UEX401 | International Studies and | PHC | olevel_parse_failed | direct_entry / arts_hum_offerings.json:International Studies and:PHC:0 | UTME: accepts Five (5) SSC credits in English Language and any other four (4) subjects from French, Literature in English, History/Government, CRK/IRK, Economics, Mathematics, Biology, Chemistry, Agricultural Science, Physics, Igbo/Hausa/Yoruba, Fine Art, Geography, Commerce. |
| UEX402 | International Studies and | UNIZIK | olevel_parse_failed | direct_entry / arts_hum_offerings.json:International Studies and:UNIZIK:2 | UTME: accepts five (5) 'O' Level credit passes to include English Language, French and two (2) other Arts subjects and one Social Science subject. |
| UEX403 | International Studies and | UNN | multiple_clauses | direct_entry / arts_hum_offerings.json:International Studies and:UNN:1 | UTME: requires/accepts for a) French Single Honours, minimum five (5) 'O' Level credit passes to include French, English Language, one science subject and two (2) other Arts subjects one of which must be Literature in English; b) German Single Honours, minimum five (5) 'O' Level credit passes including English Language, one science subject and three (3) other Arts subjects one of which must be Literature in English (Goethe Institute language proficiency certificate an advantage); c) French with German/Russia, 'O' Level credit passes to include English Language, French, one science subject and two (2) other Arts subjects one of which must be Literature in English; d) candidates successful in its one year preparatory programme in French, minimum score of 40% plus UTME requirements. |
| UEX404 | Islamic Studies | CUAB | olevel_parse_failed | direct_entry / administration_offerings.json:Islamic Studies:CUAB:0 | DIRECT ENTRY (i) CUAB requires: a) Two (2) passes at GCE Advanced Level or its equivalent with credit passes in three (3) other subjects at `O' level or its equivalent including English Language. One of the `A' level subjects should be Islamic Studies. b) Two (2) passes at IJMB or its equivalent including Islamic Studies with `O' Level or its equivalent including English Language. c) Any other relevant two (2) year post-Secondary Diploma in Arabic and Islamic Studies recognised by the Senate of the University. d) Candidates without Islamic Studies at `O' Level but possess HND/Degree may be considered for admission. |
| UEX405 | LIBRARY AND INFORMATION SCIENCE | CUAB | utme_parse_failed | direct_entry / sciences_offerings.json:LIBRARY AND INFORMATION SCIENCE:CUAB:0 | for Computer Science requires Mathematics, Physics and Chemistry. For Information Technology requires Mathematics, Physics and Chemistry/Economics/Biology/Geography. |
| UEX406 | LIBRARY AND INFORMATION SCIENCE | KWASU | utme_parse_failed | direct_entry / sciences_offerings.json:LIBRARY AND INFORMATION SCIENCE:KWASU:0 | accepts: For Computer Mathematics, Physics and any other Science subject. For Library and Information Science any three (3) subjects. |
| UEX407 | LIBRARY AND INFORMATION SCIENCE | SOUTHWESTERN | cross_reference | subject_or_general / sciences_offerings.json:LIBRARY AND INFORMATION SCIENCE:SOUTHWESTERN:0 | Same as in Mathematics. |
| UEX408 | LIBRARY SCIENCE | ABSU | utme_parse_failed | direct_entry / social_management_offerings.json:LIBRARY SCIENCE:ABSU:0 | UTME: ABSU requires one Science subject from Biology/Agriculture, Chemistry, Physics, one Commercial subject and any other subject. |
| UEX409 | LIBRARY SCIENCE | AUN | olevel_parse_failed | direct_entry / social_management_offerings.json:LIBRARY SCIENCE:AUN:1 | UTME: AUN requires five (5) 'O' Level credit passes to include English Language, Mathematics and any other three (3) of the following: Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing. Visual Arts, Computer Studies, Information Technology, Civics, and French. |
| UEX410 | LIBRARY SCIENCE | AUN | utme_parse_failed | direct_entry / social_management_offerings.json:LIBRARY SCIENCE:AUN:2 | UTME SUBJECTS: AUN accepts any subject combination which includes Mathematics and any two (2) of Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French. |
| UEX411 | Library and Information Science | BAUCHI | olevel_parse_failed | direct_entry / education_offerings.json:Library and Information Science:BAUCHI:0 | Direct Entry: accepts IJMB/'A' Level/'O' Level credit passes in any three of: any two of Biology, Chemistry, Mathematics, Physics, Economics, Commerce, Accounting, ICT and Business Management (ND) with lower credit in Library and Information Science from a recognised Polytechnic, and NCE in Science subjects with minor in Library Science at lower credit or merit; must also have five 'O' Level credits in English Language, Mathematics, Chemistry, Biology or Agricultural Science and one credit in Economics, Commerce, Accounting, ICT and Business Management. |
| UEX412 | Library and Information Science | IBADAN | cross_reference | direct_entry / education_offerings.json:Library and Information Science:IBADAN:1 | UTME: same as in Guidance and Counselling. |
| UEX413 | Library and Information Science | JOS | multiple_clauses | subject_or_general / education_offerings.json:Library and Information Science:JOS:0 | UTME: requires five 'O' Level credit passes at not more than two sittings including English Language; accepts 'O' Level pass in Mathematics. |
| UEX414 | Library and Information Science | UNIOSUN | cross_reference | direct_entry / education_offerings.json:Library and Information Science:UNIOSUN:1 | UTME: same as in Vocational and Technical Education. |
| UEX415 | Library and Information Science | UNN | olevel_parse_failed | direct_entry / education_offerings.json:Library and Information Science:UNN:1 | UTME: requires UTME requirements with five 'O' Level credit passes including the subject to be combined with Library and Information Science, plus additional 'O' Level credit requirements for particular combinations. |
| UEX416 | Linguistics | UNN | utme_parse_failed | direct_entry / arts_hum_offerings.json:Linguistics:UNN:1 | UTME subjects: requires Igbo or any other Language and any other two (2) subjects. For Linguistics (Option), requires Literature in English and two (2) other subjects. |
| UEX417 | Literature in English | AAUA | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Literature in English:AAUA:0 | Requires five (5) `O' Level credit passes to include English Language, Literature in English, Mathematics, one Arts subject and two (2) of the following: CRS/IRS, Igbo Language/Yoruba Language/Hausa Language, History/Government, French, Fine Arts or Music. |
| UEX418 | Literature in English | UNN | utme_parse_failed | direct_entry / arts_hum_offerings.json:Literature in English:UNN:0 | Requires a Science subject. |
| UEX419 | Local Government Studies | OAU | utme_parse_failed | direct_entry / administration_offerings.json:Local Government Studies:OAU:1 | UTME: OAU requires English Language, Mathematics, Government/Economics and two (2) from Biology, Chemistry, History, Geography, Accounting/Book Keeping, Civic Education, Literature in English, Agricultural Science and any Nigerian Language |
| UEX420 | MARINE BIOLOGY & FISHERIES | WESLEYUNI | olevel_parse_failed | direct_entry / sciences_offerings.json:MARINE BIOLOGY & FISHERIES:WESLEYUNI:0 | accepts (a) two (2) 'A' Level passes in Biology and Chemistry or Physics; (b) NCE credit and ND upper credit in addition to five (5) 'O' Level credit passes or its equivalent. |
| UEX421 | MATHEMATICAL SCIENCES | PAAU | utme_parse_failed | direct_entry / sciences_offerings.json:MATHEMATICAL SCIENCES:PAAU:0 | requires English Language, Mathematics, Physics and any other two (2) subjects preferably Further Mathematics, Physics, Chemistry, Biology or Agricultural Science and Economics or Geography. (Programme offered with options in Mathematics, Statistics and Computer Science.) |
| UEX422 | Marketing | COOU | cross_reference | direct_entry / administration_offerings.json:Marketing:COOU:2 | UTME SUBJECTS: COOU, UNN and UYO - Same as in Banking and Finance. |
| UEX423 | Marketing | COOU | cross_reference | direct_entry / administration_offerings.json:Marketing:COOU:1 | UTME: COOU - As in Banking and Finance. |
| UEX424 | Marketing | DELSU | cross_reference | direct_entry / administration_offerings.json:Marketing:DELSU:0 | EVANGEL and DELSU - As in Banking and Finance. |
| UEX425 | Marketing | EBSU | cross_reference | subject_or_general / administration_offerings.json:Marketing:EBSU:2 | UTME SUBJECTS: EBSU - Same as in Accountancy. |
| UEX426 | Marketing | EBSU | cross_reference | subject_or_general / administration_offerings.json:Marketing:EBSU:1 | UTME: EBSU - Same as in Accountancy. |
| UEX427 | Marketing | EBSU | olevel_parse_failed | direct_entry / administration_offerings.json:Marketing:EBSU:0 | EBSU accepts HND/ND or NCE pass at credit/merit level in relevant programmes in addition to 'O' Level requirements. ND must be at upper credit level. |
| UEX428 | Marketing | EVANGEL | cross_reference | direct_entry / administration_offerings.json:Marketing:EVANGEL:0 | EVANGEL and DELSU - As in Banking and Finance. |
| UEX429 | Marketing | PHC | olevel_parse_failed | direct_entry / administration_offerings.json:Marketing:PHC:2 | UTME: PHC accepts Five (5) SSC credit passes to include English Language, Mathematics, Economics and any other two (2) subjects from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX430 | Marketing | PHC | utme_parse_failed | direct_entry / administration_offerings.json:Marketing:PHC:3 | UTME SUBJECTS: PHC requires Mathematics, Economics and any other subject from Government/History, Geography, Commerce, Literature in English, CRK/IRK, Accounting (Financial/Business), Biology/Agricultural Science, Chemistry, Physics. |
| UEX431 | Marketing | RSU | olevel_parse_failed | direct_entry / administration_offerings.json:Marketing:RSU:0 | RSU in addition to 'O' Level requirements accepts: (a) OND/ND (Upper Credit) relevant to the discipline. (b) HND (Lower Credit) relevant to the programme. (c) Degree (Third Class) relevant to the programme. (d) At least two (2) 'A' level passes at GCE preferably in the Arts and Social Sciences. |
| UEX432 | Marketing | UNN | cross_reference | direct_entry / administration_offerings.json:Marketing:UNN:1 | UTME SUBJECTS: COOU, UNN and UYO - Same as in Banking and Finance. |
| UEX433 | Marketing | UNN | cross_reference | direct_entry / administration_offerings.json:Marketing:UNN:0 | UNN as in Accountancy & Banking and Finance. |
| UEX434 | Marketing | UYO | cross_reference | direct_entry / administration_offerings.json:Marketing:UYO:0 | UYO as in Insurance. |
| UEX435 | Marketing | UYO | cross_reference | direct_entry / administration_offerings.json:Marketing:UYO:1 | UTME SUBJECTS: COOU, UNN and UYO - Same as in Banking and Finance. |
| UEX436 | Mass Communication | AJAYI | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Mass Communication:AJAYI:0 | Direct Entry: requires two (2) 'A' Level passes or their equivalent in Literature in English and one other Arts or Social Science subject, plus three (3) 'O' Level credit passes. |
| UEX437 | Mass Communication | COVENANT | multiple_clauses | direct_entry / arts_hum_offerings.json:Mass Communication:COVENANT:0 | UTME: requires five (5) 'O' Level credit passes in English Language, Mathematics, Literature in English, one Science subject from Biology, Health/General Science, Agricultural Science, Physics and Chemistry, one from Social Sciences or Arts (e.g. Geography, Economics, Government, Commerce, Principle of Account, Book Keeping; Arts such as CRS, History, etc.). |
| UEX438 | Mass Communication | UNN | utme_parse_failed | direct_entry / arts_hum_offerings.json:Mass Communication:UNN:2 | UTME Subjects: requires Literature in English and any two (2) subjects out of which one must be in the Arts or Social Sciences. |
| UEX439 | Mathematics | ABUJA | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:ABUJA:0 | DE: accepts two (2) 'A' Level passes in Mathematics and either Physics and/or Chemistry OR NCE minimum 10 points with credit in Mathematics and another Science subject OR ND upper credit in relevant programme in addition to the UTME requirements. O'level: accepts five (5) 'O' Level credit passes or equivalent including English Language, Mathematics and any other three (3) subjects preferably Further Mathematics, Physics, Chemistry, Biology/Agricultural Science and Geography in that order. UTME: accepts Biology as one (1) of the other two (2) subjects. |
| UEX440 | Mathematics | AUGUSTINE | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:AUGUSTINE:0 | DE: requires two (2) 'A' Level passes in Mathematics and Physics and/or Chemistry; accepts NCE with five (5) 'O' Level credit passes including Mathematics and Physics or equivalent. O'level: requires five (5) 'O' Level credit passes or equivalent including English Language, Physics and Mathematics and any other two (2) subjects from Further Mathematics, Physics, Chemistry, Biology, Agricultural Science. UTME: requires Mathematics and Physics, and one (1) of Chemistry, Biology, Geography and Economics in the order of preference. |
| UEX441 | Mathematics | EUI | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:EUI:0 | DE: (a) Two (2) 'A' Level passes in Mathematics and any other Science subject; (b) NCE with at least Merit in Mathematics and one of Physics, Chemistry or Economics; (c) OND/HND with credit passes from a recognised institution in addition to 'O' Level requirements; (d) Very good passes in JUPEB in Biology, Chemistry and Physics; (e) IJMB passes in Biology, Chemistry, Physics and Mathematics. O'level: requires five (5) credit passes at SSC or equivalent including English Language, Mathematics and Physics or Chemistry. |
| UEX442 | Mathematics | FED-LAFIA | multiple_clauses | direct_entry / sciences_offerings.json:Mathematics:FED-LAFIA:0 | DE: in addition to UTME requirements, DE candidates must have any of: IJMB minimum of 9 points in Mathematics and any two of Physics, Chemistry, Geography or Biology; NCE Merit in Mathematics and any of Physics, Geography, Chemistry, Biology and Agric. Science; ND not less than lower Credit/HND in any relevant course. O'level: requires Five (5) Credit passes at SSCE, GCE, NECO and NABTEB O'Level in Mathematics, English Language, Biology, Agric. Science, or Further Mathematics, Chemistry and Physics, in not more than two sittings. UTME: requires Mathematics, Chemistry and Physics; also requires Mathematics and any two (2) of Physics, Chemistry, Biology, Economics or Geography. |
| UEX443 | Mathematics | FUNAAB | cross_reference | direct_entry / sciences_offerings.json:Mathematics:FUNAAB:0 | Same as in Physics. O'level: requires five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and Biology. UTME (with UNIOSUN, FED-LAFIA, LASU, IGBINEDION, OAU): require Mathematics, Chemistry and Physics. |
| UEX444 | Mathematics | GOUU | cross_reference | direct_entry / sciences_offerings.json:Mathematics:GOUU:0 | Same as in Biological Sciences. |
| UEX445 | Mathematics | IBADAN | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:IBADAN:0 | DE: accepts two (2) 'A' Level passes including Mathematics and any Science subject OR NCE merit in Mathematics and one (1) other approved Science subject. O'level: requires five (5) 'O' Level credit passes including English Language, Mathematics and any two (2)/three (3) of Biology, Chemistry, Physics, Further Mathematics or Geography and other subject as the 6th subject. UTME: requires Mathematics and any other two (2) Science subjects excluding Agricultural Science. |
| UEX446 | Mathematics | ILORIN | multiple_clauses | direct_entry / sciences_offerings.json:Mathematics:ILORIN:0 | DE: accepts at least 'A' level passes or equivalent in Mathematics and any one of Physics, Chemistry, Biology, Geography and Economics. O'level: requires five (5) 'O' level credit passes including Mathematics, English Language, Physics and any two of Chemistry, Biology, Economics, Geography, Further Mathematics. UTME: accepts Biology, Mathematics and Physics; also requires Mathematics, Physics and any one of Chemistry, Biology, Economics and Geography. |
| UEX447 | Mathematics | KASU | multiple_clauses | direct_entry / sciences_offerings.json:Mathematics:KASU:0 | DE: accepts Two 'A' Level passes in Mathematics and Physics; NCE merit in Mathematics and any of Physics, Statistics, Chemistry; ND/HND Lower Credit in related field; 7 points in IJMB; in addition to 'O' Level requirements. O'level: requires Five 'O' level credit passes to include English Language, Mathematics, Physics and two other science subjects. UTME: requires Physics; does not accept Economics and Agricultural Science; requires Mathematics, Physics and one other Science subject. |
| UEX448 | Mathematics | KWASU | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:KWASU:0 | DE: (a) Two (2) 'A' Level passes or its equivalent, one (1) of which must be in a relevant subject; (b) ND upper credit in relevant programme; (c) HND lower credit in relevant programme; (d) NCE credit in relevant subjects may be considered for Direct Entry Admission provided they possess the necessary 'O' Level requirements. O'level: requires 'O' Level credit passes from English Language, Mathematics and any three (3) of Biology, Physics, Chemistry, Further Mathematics and Agricultural Science. UTME: requires English Language, chosen course and any two (2) from Physics, Chemistry, Biology and Further Mathematics. |
| UEX449 | Mathematics | NILE | overlapping_other_groups | direct_entry / sciences_offerings.json:Mathematics:NILE:1 | Accepts English, Mathematics and any other three (3) Science subjects. Requires Mathematics and any other two (2) Science subjects. |
| UEX450 | Mathematics | NILE | cross_reference | direct_entry / sciences_offerings.json:Mathematics:NILE:0 | Same as in Computer Science. O'level: accepts English, Mathematics and any other three (3) Science subjects. UTME: requires Mathematics and any other two (2) Science subjects. |
| UEX451 | Mathematics | RSU | multiple_clauses | direct_entry / sciences_offerings.json:Mathematics:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) from recognized institutions; (b) OND/ND (Upper Credit) from recognized institution; (c) at least two (2) 'A' Level passes in Mathematics and Physics. |
| UEX452 | Mathematics | UNIZIK | multiple_clauses | subject_or_general / sciences_offerings.json:Mathematics:UNIZIK:0 | UTME: accepts Economics in lieu of Physics/Chemistry; requires 'O' Level pass in English Language (with COOU, MAIDUGURI); does not accept Geography (with PHC). |
| UEX453 | Mathematics | WESLEYUNI | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics:WESLEYUNI:0 | UTME accepts (a) two (2) 'A' level passes in Mathematics and either Physics and/or Chemistry; (b) ND upper credit in addition to five (5) 'O' Level credit passes or equivalent. |
| UEX454 | Mathematics | WESTERN-DEL | cross_reference | direct_entry / sciences_offerings.json:Mathematics:WESTERN-DEL:0 | Same as in Industrial Mathematics. UTME: requires Mathematics and any two (2) of Physics, Chemistry, Economics and Geography. |
| UEX455 | Mathematics and Economics / Mathematics with Economics | MAUTY | utme_parse_failed | direct_entry / sciences_offerings.json:Mathematics and Economics / Mathematics with Economics:MAUTY:0 | DE requires: a. two (2) 'A' Level passes in Mathematics and any of Economics, Statistics, Geography and Business Management; b. HND/ND credit in any of Computer Science, Mathematics, Statistics and Mathematics Education; c. NCE credit in Mathematics and Economics; d. IJMB with minimum of eight (8) points including credit in both Mathematics and Economics. UTME: requires Economics/Commerce and any two (2) of Physics, Chemistry, Biology/Agricultural Science, Geography, Government, Financial Accounting, Computer Studies & IT. |
| UEX456 | Mathematics with Computer Science | MOUNTAIN TOP | olevel_parse_failed | direct_entry / sciences_offerings.json:Mathematics with Computer Science:MOUNTAIN TOP:0 | Requires five (5) credit passes at SSC or equivalent to include English Language, Mathematics, Physics and any of Chemistry, Biology, Economics, Geography (for Mathematics with Computer Science). |
| UEX457 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | MINNA | multiple_clauses | direct_entry / sciences_offerings.json:Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics:MINNA:0 | Accepts NCE/ND/HND credit plus five (5) relevant UTME subjects. Requires Mathematics and Physics. UTME: accepts Technical Drawing. UTME SUBJECTS: accepts Geography and does not accept Biology. |
| UEX458 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | PHC | overlapping_other_groups | direct_entry / sciences_offerings.json:Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics:PHC:0 | Accepts Two (2) A/level GCE or HSC or IJMB or JUPEB passes in Mathematics and any one of Physics, Chemistry or Biology including UTME entry requirements. UTME: requires English Language, Mathematics, Physics, Chemistry and any one (1) from Biology, Geography and Economics. UTME SUBJECTS: requires Mathematics and any two (2) of Physics, Chemistry, Economics. |
| UEX459 | Mechanical Engineering | CARITAS | olevel_parse_failed | direct_entry / engineering_offerings.json:Mechanical Engineering:CARITAS:0 | No Direct Entry; also requires two 'A' Level passes in Chemistry, Physics, Mathematics plus 'O' Level credit in English, accepts ND, NCE Technical or HND in Mechanical Engineering. |
| UEX460 | Mechanical Engineering | RSU | olevel_parse_failed | direct_entry / engineering_offerings.json:Mechanical Engineering:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline. (b) OND/ND (Upper Credit) in relevant disciplines. (c) At least three (3) 'A' level passes at GCE in Physics, Chemistry and Mathematics. |
| UEX461 | Mechanical Engineering | UNN | cross_reference | direct_entry / engineering_offerings.json:Mechanical Engineering:UNN:0 | Same as in Agricultural and Bioresources Engineering. |
| UEX462 | Mechatronics Engineering | FED-OYE EKITI | olevel_parse_failed | direct_entry / engineering_offerings.json:Mechatronics Engineering:FED-OYE EKITI:0 | Requires two (2) 'A' Level passes from Physics, Chemistry and Mathematics. UTME requires five credits at SSC including English, Mathematics, Physics, Chemistry and one Science subject from Further Mathematics, Technical Drawing, Biology/Agricultural Science. |
| UEX463 | Medical Biochemistry | CALABAR | cross_reference | direct_entry / medical_offerings.json:Medical Biochemistry:CALABAR:0 | UTME same as in Medicine and Surgery. |
| UEX464 | Medical Biochemistry | IBADAN | cross_reference | direct_entry / medical_offerings.json:Medical Biochemistry:IBADAN:1 | UTME same as in Medicine and Surgery. |
| UEX465 | Medical Laboratory Technology/Science | CALABAR | cross_reference | direct_entry / medical_offerings.json:Medical Laboratory Technology/Science:CALABAR:1 | UTME: same as in Medicine and Surgery. |
| UEX466 | Medical Laboratory Technology/Science | EUI | olevel_parse_failed | direct_entry / medical_offerings.json:Medical Laboratory Technology/Science:EUI:1 | UTME: requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Physics, Chemistry and Biology. |
| UEX467 | Medicine and Surgery (Human Medicine) | ABUJA | utme_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):ABUJA:0 | Requires DE candidates to fulfil the UTME requirements. |
| UEX468 | Medicine and Surgery (Human Medicine) | DELSU | multiple_clauses | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):DELSU:0 | Requires a) First Degree in relevant Biological or Physical Sciences discipline not less than Second Class Upper Division may be considered in addition to the UTME requirement; b) Degree from Science Laboratory Technology is not accepted. |
| UEX469 | Medicine and Surgery (Human Medicine) | EUI | olevel_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):EUI:1 | Requires five (5) credit passes at SSC or its equivalent in English Language, Mathematics, Physics, Chemistry and Biology. |
| UEX470 | Medicine and Surgery (Human Medicine) | ILORIN | utme_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):ILORIN:0 | Accepts B.Sc Second Class Honours in Anatomy, Biochemistry, Microbiology, Physiology, Zoology and other Basic Science programme. Also accepts a minimum aggregate of 13 points. |
| UEX471 | Medicine and Surgery (Human Medicine) | JOS | utme_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):JOS:0 | Requires DE candidates to fulfil the UTME requirements. |
| UEX472 | Medicine and Surgery (Human Medicine) | LASU | utme_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):LASU:0 | Requires a minimum of C in each of the subjects and will consider a Bachelor of Science with a minimum of second class upper division. |
| UEX473 | Medicine and Surgery (Human Medicine) | OOU AND CALABAR | utme_parse_failed | direct_entry / medical_offerings.json:Medicine and Surgery (Human Medicine):OOU AND CALABAR:0 | Accept degree in Science not below Second Class Lower Division. |
| UEX474 | Meteorology | AUN | multiple_clauses | direct_entry / engineering_offerings.json:Meteorology:AUN:0 | UTME subjects: AUN requires Mathematics, plus any other subjects from Physics; Chemistry, Further Mathematics, Computer Studies, Information Technology, Environmental Science, Biology, Literature in English, Government, History, Economics, Geography, Technical Drawing, Visual Arts, Civics, and French. |
| UEX475 | Microbiology | AUGUSTINE | olevel_parse_failed | direct_entry / sciences_offerings.json:Microbiology:AUGUSTINE:0 | Requires two (2) 'A' Level passes in Biology, Botany, Zoology and Chemistry or Physics. Also accepts NCE credit and ND in addition to five 'O' Level credit passes or its equivalent. |
| UEX476 | Microbiology | AUN | multiple_clauses | direct_entry / sciences_offerings.json:Microbiology:AUN:0 | Accepts (a) 'A' Level passes chosen from English Language, Mathematics, Environmental Science, Biology, Chemistry, Physics, Literature in English, Government, History, Economics, Geography, Further Mathematics, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French; (b) does not accept 'O' Level credit passes in Agricultural science, Food and Nutrition, Home Economics, Home Craft, Home management, Physical Education, Physical and Health Education, Music, Commerce, Accounting, Financial Accounting, Book keeping, Islamic History, Religious Studies, Tajweed, Library Studies, Diction, Kiswahili, Igbo, Hausa, Yoruba, Arabic, Turkish, Study skills; (c) accepts ICGSE and 'A' Level Cambridge and does not offer admissions direct to 200 level; may transfer credits relevant to its major at the discretion of the Dean of school. |
| UEX477 | Microbiology | BENIN | multiple_clauses | direct_entry / sciences_offerings.json:Microbiology:BENIN:1 | For Science Laboratory Technology, in addition to UTME requirements, may accept two (2) 'A' Level passes or its recognized equivalents at not more than two sittings; subjects should be of the Sciences. |
| UEX478 | Microbiology | CRUTECH | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:CRUTECH:0 | Same as in Biology. |
| UEX479 | Microbiology | FUNAAB | cross_reference | direct_entry / sciences_offerings.json:Microbiology:FUNAAB:0 | Same as in Biological Science. |
| UEX480 | Microbiology | GOUU | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:GOUU:0 | Same as in Biochemistry. |
| UEX481 | Microbiology | KSUSTA | olevel_parse_failed | direct_entry / sciences_offerings.json:Microbiology:KSUSTA:0 | Requires 'A' Level passes, NCE, IJMB or its equivalent in Biology and Chemistry, Physics, Mathematics or Technical Drawing in addition to UTME requirements. Also accepts ND/HND credit in relevant programmes. |
| UEX482 | Microbiology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:KWASU:0 | Same as in Biochemistry. |
| UEX483 | Microbiology | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:MAKURDI:0 | Same as in Biochemistry. |
| UEX484 | Microbiology | MINNA | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:MINNA:1 | Same as in Biochemistry. |
| UEX485 | Microbiology | PHC | multiple_clauses | direct_entry / sciences_offerings.json:Microbiology:PHC:0 | Accepts Two (2) A/level GCE or HSC or IJMB or JUPEB passes in Biology and any one of Chemistry, Physics or Mathematics including UTME entry requirements. For Science Laboratory Technology accepts Two (2) A/level GCE or HSC or IJMB or JUPEB passes in Chemistry and Physics; OND (Upper Credit) in Science Laboratory Technology (SLT) from NBTE recognized Institutions. |
| UEX486 | Microbiology | RSU | multiple_clauses | direct_entry / sciences_offerings.json:Microbiology:RSU:0 | In addition to 'O' Level requirements accepts (a) HND (Lower Credit) in related courses; (b) OND/ND (Upper Credit) in related courses; (c) HSC/GCE 'A' Level passes in Biology and Chemistry or Physics. |
| UEX487 | Microbiology | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:Microbiology:UMUDIKE:0 | Same as in Biochemistry. |
| UEX488 | Music | BOWEN | utme_parse_failed | direct_entry / arts_hum_offerings.json:Music:BOWEN:0 | DE: accepts 'A' Level pass in Mathematics or other Arts or Social Science subjects. O'Level: accepts Music Society of Nigeria's Grade V certificate, Trinity College of Music Grade V certificate and Associated Board of Royal School of Music Grade V certificate and other Arts or Social Science subjects. UTME subject: requires any of Literature in English or CRS as the other subject. |
| UEX489 | Music | IAUED | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Music:IAUED:0 | DE: Post NCE and Post Diploma in Music/Music Education (3 years). O'Level: requires 'O' Level credit passes at GCE, WAEC/SSCE or NECO in five subjects: English Language and Mathematics and any three from CRS, History, Literature in English, Biology, Physics, Chemistry, Integrated Science, Commerce, Government, Economics, Physical and Health Studies, Technical Studies. UTME subject: requires English Language and any three from the same list. |
| UEX490 | Music | PHC | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Music:PHC:0 | DE: accepts at least two A/Level passes in GCE, HSC, JUPEB or IJMB in any two Arts subjects, Music single or double major with overall merit from a College of Education, Grade 8 (Theory and Practical) of ABRSM or MUSON, Licentiate Certificate, or Diploma from Department of Music University of Port Harcourt, all including UTME entry requirements. O'Level: requires five SSC credits in English Language and any other four from Music, Literature in English, History/Government, CRK/IRK, Economics, Mathematics, Biology, Chemistry, Agricultural Science, Physics, Igbo/Hausa/Yoruba, Fine Art, Geography, Commerce. UTME subject: requires any three (3) subjects from the listed set. |
| UEX491 | Nursing/Nursing Science | CALABAR | olevel_parse_failed | direct_entry / medical_offerings.json:Nursing/Nursing Science:CALABAR:0 | DE: NRN or its approved equivalent plus five (5) 'O' Level credit passes to include English Language and one (1) Science subject plus two (2) years registration nursing experience; also accepts HND in Public Health, ND in Environmental Health, Public Health Nursing from West African Health Examination Board plus UTME requirements. |
| UEX492 | PHYSICS | AJAYI | cross_reference | direct_entry / sciences_offerings.json:PHYSICS:AJAYI:0 | (xxiii) AJAYI - Same as in Computer Science. |
| UEX493 | PHYSICS | GSU | olevel_parse_failed | direct_entry / sciences_offerings.json:PHYSICS:GSU:0 | (xxvii) GSU accepts ND/HND/NCE/IJAMB/ 'A' Level or its equivalent in addition to five (5) 'O' Level credit passes. |
| UEX494 | PHYSICS | KWASU | cross_reference | direct_entry / sciences_offerings.json:PHYSICS:KWASU:0 | (xxxiv) UNIKINGS and KWASU – Same as in Mathematics. |
| UEX495 | PHYSICS | MCPHERSON | olevel_parse_failed | direct_entry / sciences_offerings.json:PHYSICS:MCPHERSON:0 | (xxxvi) MCPHERSON accepts a) 'A' Level/ND upper credit /HND lower credit or its equivalent in Physics in addition to five (5) 'O' Level credit passes. b) JUPEB/IJMB 'A' Level or equivalents in related subjects. |
| UEX496 | PHYSICS | NILE | cross_reference | direct_entry / sciences_offerings.json:PHYSICS:NILE:0 | (xl) NILE – Same as in Computer Science. |
| UEX497 | PHYSICS | UNIKINGS | cross_reference | direct_entry / sciences_offerings.json:PHYSICS:UNIKINGS:0 | (xxxiv) UNIKINGS and KWASU – Same as in Mathematics. |
| UEX498 | PHYSICS WITH ELECTRONICS | ABU | olevel_parse_failed | direct_entry / sciences_offerings.json:PHYSICS WITH ELECTRONICS:ABU:0 | (lxiv) ABU accepts Two 'A' level /IJMB passes which must include Physics, and Mathematics. NCE Physics/Mathematics in addition to O/L requirements. Diploma in Physics with Upper Credit in addition to O/L requirements. |
| UEX499 | PHYSICS WITH ELECTRONICS | RSU | olevel_parse_failed | direct_entry / sciences_offerings.json:PHYSICS WITH ELECTRONICS:RSU:0 | (lv) RSU in addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline. (b) OND/ND (Upper Credit) in relevant discipline. (c) At least two (2) 'A' level passes at GCE including Mathematics and Physics. |
| UEX500 | PURE AND APPLIED BIOLOGY | BELLS | cross_reference | subject_or_general / sciences_offerings.json:PURE AND APPLIED BIOLOGY:BELLS:0 | same as in Microbiology. |
| UEX501 | Pasture & Range Management | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Pasture & Range Management:FUNAAB:0 | As in Agriculture Extension and Rural Development (UTME waiver reference). |
| UEX502 | Peace Studies and Conflict Resolution | WESTERN-DEL | olevel_parse_failed | direct_entry / social_management_offerings.json:Peace Studies and Conflict Resolution:WESTERN-DEL:0 | WESTERN-DEL requires five (5) 'O' Level credit passes including English Language, Mathematics, Government and one other Social Science subject and other subject of choice. |
| UEX503 | Petroleum and Gas Engineering | RSU | multiple_clauses | direct_entry / engineering_offerings.json:Petroleum and Gas Engineering:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline; (b) OND/ND (Upper Credit) in relevant disciplines; (c) At least three (3) 'A' level passes at GCE in Physics, Chemistry and Mathematics. |
| UEX504 | Pharmacy | DELSU | utme_parse_failed | direct_entry / medical_offerings.json:Pharmacy:DELSU:0 | First degree in relevant Biological Sciences with not less than second class Upper Division may be considered in addition to UTME requirement. |
| UEX505 | Philosophy | AAU | olevel_parse_failed | subject_or_general / arts_hum_offerings.json:Philosophy:AAU:0 | Accepts three (3) 'A' Level passes with two (2) 'O' Level credit passes or two (2) 'A' Level passes with three (3) 'O' Level credit passes. |
| UEX506 | Philosophy | AUGUSTINE | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Philosophy:AUGUSTINE:0 | Accepts NCE merit/ND credit in relevant subjects/programme in addition to five (5) 'O' Level credit passes or equivalent. |
| UEX507 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | ABUJA | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):ABUJA:0 | (xli) ABUJA accepts five (5) 'O' Level credit passes or its equivalent including English Language, Mathematics and any other three (3) subjects preferably Further Mathematics, Physics, Chemistry, Biology/Agricultural Science and Geography in that order. |
| UEX508 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | AJAYI | cross_reference | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):AJAYI:0 | (vii) NILE and AJAYI - Same as Computer Science. |
| UEX509 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | DELSU | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):DELSU:0 | (xlviii) DELSU requires five (5) 'O' Level credits in SSC (or its equivalent) which must include English Language, Physics, Mathematics, Chemistry and any other subject. |
| UEX510 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | EUI | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):EUI:0 | (xlvi) EUI requires five (5) credit passes at SSC or its equivalent in English Language, Physics, Chemistry, Mathematics and any other Science subject from Further Mathematics and Biology or Agricultural Science. |
| UEX511 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | FED-DUTSINMA | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):FED-DUTSINMA:0 | (xliii) FED-DUTSINMA accepts Five 'O' level Credits to include: English Language, Physics, Chemistry, Mathematics and any other Science subject. |
| UEX512 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):FED-KASHERE:0 | FED-KASHERE requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Physics, Chemistry and any of Further Mathematics, Geography and Biology. |
| UEX513 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | FUNAAB | cross_reference | subject_or_general / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):FUNAAB:0 | (xx) FUNAAB same as in Biochemistry. |
| UEX514 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | FUPRE | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):FUPRE:0 | (xxviii) FUPRE requires five (5) SSC credit passes including English Language, Mathematics, Physics, Chemistry and any other subject from Agricultural Science, Biology, Computer Studies, Data Processing, Electrical Installation & Maintenance Work, Radio, TV & Electrical Work. |
| UEX515 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | IAUED | utme_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):IAUED:0 | (lvi) IAUED requires English, Mathematics, Physics Chemistry or any one of the following, Biology, Agric, and Geography. |
| UEX516 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | KWASU | cross_reference | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):KWASU:1 | (xii) UNIKINGS and KWASU – Same as in Mathematics. |
| UEX517 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):KWASU:0 | (xxxiii) KWASU – Same as in Mathematics. |
| UEX518 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | MINNA | olevel_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):MINNA:0 | (xlv) MINNA requires 'O' Level credit passes to include English Language, Mathematics, Physics, Chemistry, with any of Biology, Agricultural Science, Geography or IT related subjects. |
| UEX519 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | NILE | cross_reference | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):NILE:1 | (vii) NILE and AJAYI - Same as Computer Science. |
| UEX520 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | OAU | utme_parse_failed | subject_or_general / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):OAU:0 | (iii) OAU accepts Chemistry, Physics, Biology or Mathematics. (iv) OAU requires Chemistry. |
| UEX521 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | PHC | utme_parse_failed | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):PHC:1 | (xxxiv) PHC – For Physics requires Physics, Mathematics and Chemistry or Biology. For Physics with Electronics requires Physics, Mathematics and Chemistry or Biology. |
| UEX522 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | UNIKINGS | cross_reference | direct_entry / sciences_offerings.json:Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics):UNIKINGS:0 | (xii) UNIKINGS and KWASU – Same as in Mathematics. |
| UEX523 | Physics and Applied Physics | CUAB | cross_reference | subject_or_general / sciences_offerings.json:Physics and Applied Physics:CUAB:0 | (viii) CUAB same as in Physics |
| UEX524 | Physics/Astrology | AJAYI | cross_reference | direct_entry / sciences_offerings.json:Physics/Astrology:AJAYI:0 | AJAYI - Same as Computer Science. |
| UEX525 | Physics/Astrology | PAAU | cross_reference | direct_entry / sciences_offerings.json:Physics/Astrology:PAAU:0 | PAAU – Same as in Mathematical Sciences. |
| UEX526 | Physics/Industrial Physics | UMUDIKE | cross_reference | direct_entry / sciences_offerings.json:Physics/Industrial Physics:UMUDIKE:0 | (vii) UNIKINGS and UMUDIKE - Same as in Mathematics. |
| UEX527 | Physics/Industrial Physics | UNIKINGS | cross_reference | direct_entry / sciences_offerings.json:Physics/Industrial Physics:UNIKINGS:0 | (vii) UNIKINGS and UMUDIKE - Same as in Mathematics. |
| UEX528 | Physiology | AAU | cross_reference | direct_entry / medical_offerings.json:Physiology:AAU:0 | Same as for Medical Laboratory Science. |
| UEX529 | Physiology | IBADAN | cross_reference | direct_entry / medical_offerings.json:Physiology:IBADAN:0 | As for Biochemistry (DE); as in Medicine and Surgery (UTME). |
| UEX530 | Physiotherapy | IBADAN | cross_reference | direct_entry / medical_offerings.json:Physiotherapy:IBADAN:0 | Same as in Medicine and Surgery. |
| UEX531 | Plant Science | IMSU | cross_reference | subject_or_general / agriculture_offerings.json:Plant Science:IMSU:0 | As in Agriculture. |
| UEX532 | Plant Science | JABU | multiple_clauses | direct_entry / agriculture_offerings.json:Plant Science:JABU:0 | Accepts five (5) 'O' Level credit passes in English Language, Chemistry, Mathematics, Biology, Agricultural Science, Economics; requires 'O' Level credit passes to include Geography or Economics and at least 'O' Level pass in Physics. |
| UEX533 | Plant Science and Biotechnology | BOWEN | cross_reference | subject_or_general / sciences_offerings.json:Plant Science and Biotechnology:BOWEN:0 | Same as Microbiology. |
| UEX534 | Plant Science and Biotechnology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Plant Science and Biotechnology:KWASU:0 | Same as in Mathematics. |
| UEX535 | Plant Science and Biotechnology | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:Plant Science and Biotechnology:MAKURDI:0 | Same as in Biochemistry. |
| UEX536 | Plant Science and Biotechnology | MOUNTAIN TOP | multiple_clauses | direct_entry / sciences_offerings.json:Plant Science and Biotechnology:MOUNTAIN TOP:0 | Requires at least five 'O' Level credit passes with minimum two relevant subjects (Biology, Botany, Chemistry, Geography, Mathematics, Physics) at GCE/IJMB 'A' Level or approved equivalents; or Foundation/JUPEB from Mountain Top University or other recognized universities. |
| UEX537 | Plant Science and Biotechnology | OAUSTECH | cross_reference | subject_or_general / sciences_offerings.json:Plant Science and Biotechnology:OAUSTECH:0 | Same as in Fisheries. |
| UEX538 | Plant Science and Biotechnology | UNIKINGS | cross_reference | subject_or_general / sciences_offerings.json:Plant Science and Biotechnology:UNIKINGS:0 | Same as Microbiology. |
| UEX539 | Political Science | AAUA | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science:AAUA:1 | (vii) AAUA accepts five (5) `O' Level credit passes to include English Language, Mathematics, Government/History and one subject in the Social Science and any other subject. |
| UEX540 | Political Science | AAUA | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science:AAUA:2 | (xxiii) AAUA requires five (5) 'O' Level credit passes including English Language, Mathematics, Government/History one subject from the Social Science and any other subject. |
| UEX541 | Political Science | ABUAD | utme_parse_failed | direct_entry / social_management_offerings.json:Political Science:ABUAD:1 | (x) ABUAD and KWASU require Government and any two (2) Social Science or one Arts subjects including Mathematics. |
| UEX542 | Political Science | COVENANT | cross_reference | subject_or_general / social_management_offerings.json:Political Science:COVENANT:1 | (x) COVENANT same as Marketing. |
| UEX543 | Political Science | FED-DUTSE | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science:FED-DUTSE:0 | (xxxviii) FED-DUTSE requires; a) In addition to `O' Level, candidate must have passed at least two (2) GCE `A' Level or HSC/IJMB subjects including Government and any other Social Science subject. b) NCE certificate with Political Science as main subject (merit score and above), or Polytechnic Diploma in Public Administration, International Relations or Local Government Administration with minimum of Lower Credit. |
| UEX544 | Political Science | FED-DUTSE | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science:FED-DUTSE:1 | (xxvii) FED-DUTSE requires five (5) `O' Level credit passes at SSC or its equivalent in English Language, Mathematics, Government and any two (2) from Economics, Geography, Commerce, Civic Education, Religious Studies/Languages/Literature in English/History. |
| UEX545 | Political Science | FED-LAFIA | cross_reference | subject_or_general / social_management_offerings.json:Political Science:FED-LAFIA:0 | (xix) FED-LAFIA - Same as in Sociology. |
| UEX546 | Political Science | FED-LAFIA | cross_reference | subject_or_general / social_management_offerings.json:Political Science:FED-LAFIA:1 | (xi) FED-LAFIA - Same as in Sociology. |
| UEX547 | Political Science | KWASU | utme_parse_failed | direct_entry / social_management_offerings.json:Political Science:KWASU:2 | (x) ABUAD and KWASU require Government and any two (2) Social Science or one Arts subjects including Mathematics. |
| UEX548 | Political Science | LASU | utme_parse_failed | direct_entry / social_management_offerings.json:Political Science:LASU:0 | (xviii) LASU accepts First Degree in cognate or related programme with a minimum of second class lower division. |
| UEX549 | Political Science | SOSU | olevel_parse_failed | subject_or_general / social_management_offerings.json:Political Science:SOSU:0 | (xxxvii) SOSU accepts Diploma in Public Administration with at least Lower Credit. |
| UEX550 | Political Science | UNIZIK | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science:UNIZIK:0 | (vi) UNIZIK requires similar requirements as for Economics for both Direct Entry and UTME applicants. But a pass in 'O' Level Mathematics is acceptable. Accepts any two (2) 'A' Level passes. |
| UEX551 | Political Science and Conflict | FED-KASHERE | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Political Science and Conflict:FED-KASHERE:1 | UTME: requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Government or History and any two of IRS/CRS, Economics/Commerce, Geography, Literature in English, Languages (Arabic, French, Hausa, Igbo, Yoruba and Fulfulde). |
| UEX552 | Political Science and Conflict | FED-LOKOJA | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Political Science and Conflict:FED-LOKOJA:1 | UTME: requires Five (5) SSC credit passes to include English Language, Government/History plus two (2) Social Science subjects and any other subject. A credit in Mathematics is compulsory. Note: Civic Education is considered as part of Government and so will not count in reckoning. |
| UEX553 | Political Science and International Relations | CUAB | cross_reference | subject_or_general / social_management_offerings.json:Political Science and International Relations:CUAB:0 | (x) CUAB - Same as in Mass Communication. |
| UEX554 | Political Science and International Relations | TSUJ | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science and International Relations:TSUJ:0 | (viii) TSUJ in addition to UTME requirements accepts a. IJMB (Arts and Social Sciences) b. ND lower credit in Public Administration to be placed in 100 level while upper credit in 200 level. |
| UEX555 | Political Science and International Relations | WESTERN-DEL | olevel_parse_failed | direct_entry / social_management_offerings.json:Political Science and International Relations:WESTERN-DEL:1 | (vii) WESTERN-DEL requires five (5) 'O' Level credit passes including English Language, Mathematics, Government and one other Social Science subject and other subject of choice. [UTME] |
| UEX556 | Polymer and Textile Engineering | LASU | cross_reference | subject_or_general / engineering_offerings.json:Polymer and Textile Engineering:LASU:1 | LASU Same as in Mechanical Engineering (UTME). |
| UEX557 | Production Engineering | BENIN | cross_reference | subject_or_general / engineering_offerings.json:Production Engineering:BENIN:0 | As in Chemical Engineering. |
| UEX558 | Psychology | BSU | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:BSU:0 | DIRECT ENTRY (iii) BSU, EBSU and RENAISSANCE require a. any two (2) 'A' Level passes plus the UTME requirements. b. ND plus four (4) 'O' Level credit passes to include Chemistry, Biology or Health Science or General Science plus the UTME requirements. c. Registered Nurse Certificate plus 'O' Level credit passes in Biology/Health Science/General Science and a pass in Mathematics/Statistics plus the UTME requirements |
| UEX559 | Psychology | DELSU | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:DELSU:1 | UTME (xxii) DELSU requires five credit passes at SSC 'O' Level or its equivalent which should include English Language, Mathematics and Biology/Health Sciences and two (2) of Social Science & Arts subjects. |
| UEX560 | Psychology | EBSU | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:EBSU:0 | DIRECT ENTRY (iii) BSU, EBSU and RENAISSANCE require a. any two (2) 'A' Level passes plus the UTME requirements. b. ND plus four (4) 'O' Level credit passes to include Chemistry, Biology or Health Science or General Science plus the UTME requirements. c. Registered Nurse Certificate plus 'O' Level credit passes in Biology/Health Science/General Science and a pass in Mathematics/Statistics plus the UTME requirements |
| UEX561 | Psychology | EKSU | cross_reference | direct_entry / social_management_offerings.json:Psychology:EKSU:0 | UTME (ix) EKSU as in Political Science. |
| UEX562 | Psychology | FED-GASHUA | cross_reference | direct_entry / social_management_offerings.json:Psychology:FED-GASHUA:1 | UTME (xiii) FED-GASHUA as in Political Science. |
| UEX563 | Psychology | FED-KASHERE | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:FED-KASHERE:1 | UTME (xxiv) FED-KASHERE requires Five credit passes at SSCE (or its equivalent) in English, Mathematics, Biology, Economics and two other Social Sciences subjects. |
| UEX564 | Psychology | IBADAN | utme_parse_failed | subject_or_general / social_management_offerings.json:Psychology:IBADAN:4 | UTME SUBJECTS (iii) IBADAN - any three (3) subjects. |
| UEX565 | Psychology | JABU | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:JABU:0 | UTME (xv) JABU requires Mathematics and Biology at credit level in SSC. |
| UEX566 | Psychology | LASU | utme_parse_failed | direct_entry / social_management_offerings.json:Psychology:LASU:2 | UTME SUBJECTS (vii) LASU accepts Science subjects. |
| UEX567 | Psychology | RENAISSANCE | olevel_parse_failed | direct_entry / social_management_offerings.json:Psychology:RENAISSANCE:0 | DIRECT ENTRY (iii) BSU, EBSU and RENAISSANCE require a. any two (2) 'A' Level passes plus the UTME requirements. b. ND plus four (4) 'O' Level credit passes to include Chemistry, Biology or Health Science or General Science plus the UTME requirements. c. Registered Nurse Certificate plus 'O' Level credit passes in Biology/Health Science/General Science and a pass in Mathematics/Statistics plus the UTME requirements |
| UEX568 | Psychology | UNIZIK | cross_reference | direct_entry / social_management_offerings.json:Psychology:UNIZIK:1 | UTME (vi) UNIZIK requires similar requirements as for Economics, for both Direct Entry and UTME applicants but a pass in 'O' Level Mathematics is acceptable. |
| UEX569 | Public Administration | ABU | utme_parse_failed | direct_entry / administration_offerings.json:Public Administration:ABU:2 | UTME SUBJECTS: ABU requires Use of English, Government/History, Economics and any other Management, Arts or Social Science Subject. |
| UEX570 | Public Administration | EBSU | cross_reference | subject_or_general / administration_offerings.json:Public Administration:EBSU:1 | UTME: EBSU - Same as in Accountancy. |
| UEX571 | Public Administration | EBSU | olevel_parse_failed | direct_entry / administration_offerings.json:Public Administration:EBSU:0 | EBSU accepts HND /ND /NCE pass at credit/merit level in relevant programmes/subjects in addition to the 'O' Level requirements. ND must be at upper credit level. |
| UEX572 | Public Administration | LCITY | olevel_parse_failed | direct_entry / administration_offerings.json:Public Administration:LCITY:0 | UTME: LCITY requires 'O' Level credit passes at SSC or its equivalent in English Language, Economics, Government and any other two (2) subjects. |
| UEX573 | Public Administration | NASARAWA | multiple_clauses | direct_entry / administration_offerings.json:Public Administration:NASARAWA:1 | UTME: NASARAWA accepts two (2) 'A' Level or IJMB passes chosen from Accounts, Business Management, Government and Statistics; NCE Government or ND Public Administration with merit/lower credit. |
| UEX574 | Public Administration | UNIZIK | utme_parse_failed | direct_entry / administration_offerings.json:Public Administration:UNIZIK:2 | UTME SUBJECTS: UNIZIK requires Mathematics, Economics and any other Arts or Social Science subject. Geography is not acceptable. |
| UEX575 | Pure and Applied Physics | GOUU | cross_reference | direct_entry / sciences_offerings.json:Pure and Applied Physics:GOUU:0 | (ii) GOUU same as in Biological Sciences. |
| UEX576 | Quantity Surveying | ABU | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:ABU:2 | UTME SUBJECTS: for Quantity Survey, Mathematics, Physics and any of Chemistry, Economics and Geography; for Surveying and Geoinformatics, Physics, Mathematics and any of Chemistry, Geography, Art, Biology and Economics; for Land Surveying, Mathematics, Physics and Chemistry or Geography. |
| UEX577 | Quantity Surveying | BAUCHI | utme_parse_failed | direct_entry / engineering_offerings.json:Quantity Surveying:BAUCHI:2 | UTME SUBJECTS: Mathematics, Physics and any of Chemistry, Technical Drawing, Geography, Biology, Information Technology or Land Surveying. |
| UEX578 | Quantity Surveying | BELLS | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:BELLS:1 | UTME: requires five (5) 'O' Level credit passes in English Language, Mathematics, Physics, Economics and any one from Chemistry, Biology, Geography, Economics; for Survey and Geoinformatics, five 'O' Level credit passes in English Language, Mathematics, Physics, Chemistry and any one from Biology and Geography. |
| UEX579 | Quantity Surveying | BELLS | utme_parse_failed | subject_or_general / engineering_offerings.json:Quantity Surveying:BELLS:2 | UTME SUBJECTS: accepts Economics for Quantity Surveying. |
| UEX580 | Quantity Surveying | ESUTECH | utme_parse_failed | direct_entry / engineering_offerings.json:Quantity Surveying:ESUTECH:2 | UTME SUBJECTS: for Surveying and Geoinformatics, Mathematics, Physics and any one from Chemistry, Geography, Economics, Government, Biology or Agricultural Science. |
| UEX581 | Quantity Surveying | ESUTECH | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:ESUTECH:1 | UTME: for Surveying and Geoinformatics, 'O' Level credit passes in English Language, Mathematics, Physics and any two from Chemistry, Geography, Biology, Technical Drawing, Fine and Applied Arts and Economics; also requires five 'O' Level credit passes to include Mathematics, Physics, English Language and any other science subject; accepts either Physics or Chemistry. |
| UEX582 | Quantity Surveying | ESUTECH | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:ESUTECH:0 | Accepts a) first degree in relevant programmes and HND upper credit into 400 level of the five-year programme; b) ND lower credit; c) for Quantity Surveying 'A' Level/ND upper credit in Building and Quantity Surveying; d) for Surveying and Geoinformatics, two 'A' level passes in Mathematics and Physics plus UTME requirements, accepts ND/HND in Land Surveying and Geoinformatics from Federal School of Surveying or other NBTE accredited institution; e) 'A' Level Cambridge; f) ND upper credit into 200 level from Federal School of Surveying or other NBTE accredited institution. |
| UEX583 | Quantity Surveying | FUTA | utme_parse_failed | direct_entry / engineering_offerings.json:Quantity Surveying:FUTA:2 | UTME SUBJECTS: Mathematics and Physics plus one subject from Chemistry, Building Construction, Technical Drawing, Geography, Economics and Government. For Surveying and Geoinformatics, Mathematics, Physics and either Chemistry or Geography. |
| UEX584 | Quantity Surveying | FUTO | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:FUTO:1 | UTME: requires at least five 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and any one of Fine Arts, Technical Drawing, Geography, Economics and Biology in not more than two sittings. For Quantity Surveying, at least five 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and any other science subject in not more than two sittings; at least a Pass required in Biology. |
| UEX585 | Quantity Surveying | ILORIN | olevel_parse_failed | direct_entry / engineering_offerings.json:Quantity Surveying:ILORIN:1 | UTME: requires five (5) SSCE credits in English Language, Mathematics, Physics and any other subjects from Geography, Technical Drawing, Economics, Chemistry, Commerce, Building Construction and Biology. |
| UEX586 | Quantity Surveying | JABU | cross_reference | subject_or_general / engineering_offerings.json:Quantity Surveying:JABU:0 | Same as in Architecture. |
| UEX587 | Quantity Surveying | LAGOS | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:LAGOS:2 | UTME SUBJECTS: a) for Quantity Surveying, English Language, Mathematics, Physics and any one of Chemistry, Economics or Geography; b) for Surveying and Geo-Informatics, English Language, Chemistry, Mathematics and Physics. |
| UEX588 | Quantity Surveying | RENAISSANCE | cross_reference | subject_or_general / engineering_offerings.json:Quantity Surveying:RENAISSANCE:0 | UTME: same as in Architecture. |
| UEX589 | Quantity Surveying | UNIZIK | multiple_clauses | direct_entry / engineering_offerings.json:Quantity Surveying:UNIZIK:0 | UTME: accepts Technical Drawing, Fine Arts and Economics; accepts 'O' Level Pass in English Language. |
| UEX590 | Quantity Surveying | UYO | olevel_parse_failed | direct_entry / engineering_offerings.json:Quantity Surveying:UYO:1 | UTME: requires five (5) 'O' level credit passes including English Language, Mathematics and Physics plus any two from Chemistry, Economics, Geography and Technical Drawing. |
| UEX591 | Radiography | CALABAR | utme_parse_failed | direct_entry / medical_offerings.json:Radiography:CALABAR:0 | Accepts a) 'A' Level passes in any two (2) of Chemistry, Biology and Physics plus the UTME requirements; b) accepts B.SC in Physical or Biological sciences plus the UTME requirements. |
| UEX592 | Radiography | MAIDUGURI | utme_parse_failed | subject_or_general / medical_offerings.json:Radiography:MAIDUGURI:0 | Accepts DIR/DCR registered with Radiographers Board of Nigeria plus the UTME requirements. |
| UEX593 | Radiography | UNN | cross_reference | direct_entry / medical_offerings.json:Radiography:UNN:1 | UTME: As in Medical Laboratory Science. |
| UEX594 | Radiography | UNN | cross_reference | direct_entry / medical_offerings.json:Radiography:UNN:2 | UTME subjects: As in Medical Laboratory Science. |
| UEX595 | Russian with French/German | UNN | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Russian with French/German:UNN:0 | Direct Entry: accepts a) NCE merit in relevant subjects as well as UTME requirements; b) Two (2) GCE 'A' level passes or its equivalent and three (3) other 'O' Level credit passes. |
| UEX596 | Science Laboratory Technology | FED-KASHERE | olevel_parse_failed | direct_entry / sciences_offerings.json:Science Laboratory Technology:FED-KASHERE:0 | Accepts Five credit passes at SSCE in English, Mathematics, Biology, Chemistry and Physics. |
| UEX597 | Science Laboratory Technology | UNIKINGS | olevel_parse_failed | direct_entry / sciences_offerings.json:Science Laboratory Technology:UNIKINGS:0 | Accepts five (5) credits at SSC in English Language, Mathematics, Biology, Chemistry and any other Science subject. |
| UEX598 | Secretarial Administration | LCITY | olevel_parse_failed | direct_entry / administration_offerings.json:Secretarial Administration:LCITY:0 | UTME: LCITY requires 'O' Level credit passes at SSC or its equivalent in English Language, Economics and any other three (3) subjects. |
| UEX599 | Secretarial Administration | RSU | olevel_parse_failed | direct_entry / administration_offerings.json:Secretarial Administration:RSU:0 | RSU in addition to 'O' Level requirements accepts: (a) HND (Lower Credit) relevant to the programme. (b) OND/ND (Upper Credit or Distinction) from recognized institution. (c) Degree (Third Class) relevant to the programme. (d) At least two (2) 'A' level passes at GCE preferably in the Arts and Social Sciences. |
| UEX600 | Social Work | BENIN | olevel_parse_failed | direct_entry / social_management_offerings.json:Social Work:BENIN:1 | (vi) BENIN requires five (5) 'O' Level credit passes to include English Language, Mathematics, Economics, Government, Geography or any other Social Science subject. |
| UEX601 | Social Work | CALABAR | cross_reference | subject_or_general / social_management_offerings.json:Social Work:CALABAR:0 | (iv) CALABAR same as in Sociology. |
| UEX602 | Social Work | UNN | olevel_parse_failed | direct_entry / social_management_offerings.json:Social Work:UNN:1 | (ii) UNN requires five (5) 'O' Level credit passes which must include English Language and any four (4) Arts or Social Science Subjects. |
| UEX603 | Sociology | ABUJA | cross_reference | direct_entry / social_management_offerings.json:Sociology:ABUJA:0 | (xix) ABUJA – As in Political Science. |
| UEX604 | Sociology | EUI | cross_reference | direct_entry / social_management_offerings.json:Sociology:EUI:0 | (xxii) EUI - As in Political Science. |
| UEX605 | Sociology | FED-KASHERE | utme_parse_failed | direct_entry / arts_hum_offerings.json:Sociology:FED-KASHERE:2 | UTME Subjects: requires Government or History plus two other Arts or Social Science. |
| UEX606 | Sociology | IAUED | olevel_parse_failed | direct_entry / social_management_offerings.json:Sociology:IAUED:0 | (xxvi) IAUED accepts five `O' Level Credits including English Language and Mathematics At least merit pass or lower credit in NCE/OND |
| UEX607 | Sociology | IGBINEDION | cross_reference | direct_entry / social_management_offerings.json:Sociology:IGBINEDION:0 | (ix) IGBINEDION - As for Political Science and Public Administration. |
| UEX608 | Sociology | WESTERN-DEL | cross_reference | direct_entry / social_management_offerings.json:Sociology:WESTERN-DEL:0 | (xv) WESTERN-DEL – Same as in Political Science and Public Administration. |
| UEX609 | Sociology and Anthroplogy | BIU | cross_reference | direct_entry / social_management_offerings.json:Sociology and Anthroplogy:BIU:0 | (ix) BIU same as Political Science |
| UEX610 | Sociology and Anthroplogy | BIU | cross_reference | direct_entry / social_management_offerings.json:Sociology and Anthroplogy:BIU:1 | UTME (x) BIU same as in Political Science. |
| UEX611 | Sociology and Anthroplogy | ESUTECH | utme_parse_failed | direct_entry / social_management_offerings.json:Sociology and Anthroplogy:ESUTECH:0 | (xiii) ESUTECH requires two (2) 'A' Level passes, including Government or History plus the UTME requirements. Accepts ND merit in Social Work/Development and Administration, plus UTME requirements. |
| UEX612 | Sociology and Anthroplogy | OAU | utme_parse_failed | direct_entry / social_management_offerings.json:Sociology and Anthroplogy:OAU:2 | UTME (ii) OAU requires English Language, Mathematics and at least two (2) Social Science and one Arts subject. |
| UEX613 | Soil Science | ABSU | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:ABSU:0 | UTME: Same as Crop Production and Protection. |
| UEX614 | Soil Science | BENIN | cross_reference | subject_or_general / agriculture_offerings.json:Soil Science:BENIN:0 | As in Agricultural Economics. |
| UEX615 | Soil Science | CALABAR | cross_reference | subject_or_general / agriculture_offerings.json:Soil Science:CALABAR:0 | Same as in Agricultural Economics. |
| UEX616 | Soil Science | EBSU | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:EBSU:1 | UTME: Same as in Soil Science. |
| UEX617 | Soil Science | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:FUNAAB:0 | As in Agricultural Extension and Rural Development. |
| UEX618 | Soil Science | FUNAAB | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:FUNAAB:1 | UTME: As in Agricultural Extension and Rural Development. |
| UEX619 | Soil Science | MAKURDI | cross_reference | subject_or_general / agriculture_offerings.json:Soil Science:MAKURDI:1 | UTME: Same as in Crop Production. |
| UEX620 | Soil Science | MAKURDI | cross_reference | subject_or_general / agriculture_offerings.json:Soil Science:MAKURDI:0 | Same as in Crop Production. |
| UEX621 | Soil Science | MINNA | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:MINNA:2 | UTME: Same as in Water Resources, Aquaculture and Fisheries Technology. |
| UEX622 | Soil Science | RSU | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:RSU:0 | As in Animal Science. |
| UEX623 | Soil Science | RSU AND CALABAR | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:RSU AND CALABAR:0 | UTME: As in Animal Science. |
| UEX624 | Soil Science | UMUDIKE | cross_reference | subject_or_general / agriculture_offerings.json:Soil Science:UMUDIKE:0 | UTME: Same as in Agricultural Economics. |
| UEX625 | Soil Science | UNN | cross_reference | direct_entry / agriculture_offerings.json:Soil Science:UNN:0 | Same as in Agricultural Economics and Extension. |
| UEX626 | Statistics | EUI | cross_reference | subject_or_general / sciences_offerings.json:Statistics:EUI:0 | As in Mathematics. |
| UEX627 | Statistics | FUTO | multiple_clauses | direct_entry / engineering_offerings.json:Statistics:FUTO:1 | UTME: requires at least five (5) 'O' Level credit passes in English Language, Mathematics, Chemistry, Physics and any other science subject in not more than two sittings; at least a Pass required in Biology. UTME SUBJECTS: Mathematics, Chemistry and Physics. |
| UEX628 | Statistics | MAKURDI | cross_reference | direct_entry / sciences_offerings.json:Statistics:MAKURDI:0 | Same as in Mathematics/Computer Science. |
| UEX629 | Statistics | NILE | cross_reference | direct_entry / sciences_offerings.json:Statistics:NILE:0 | Same as in Computer Science. |
| UEX630 | Statistics | WESLEYUNI | cross_reference | subject_or_general / sciences_offerings.json:Statistics:WESLEYUNI:0 | Same as in Mathematics. |
| UEX631 | TELECOMMUNICATION MANAGEMENT | FED-LAFIA | cross_reference | subject_or_general / sciences_offerings.json:TELECOMMUNICATION MANAGEMENT:FED-LAFIA:0 | Same as in Mathematics. |
| UEX632 | TELECOMMUNICATION MANAGEMENT | MINNA | cross_reference | direct_entry / sciences_offerings.json:TELECOMMUNICATION MANAGEMENT:MINNA:0 | requires five (5) 'O' Level credit passes including English Language, Mathematics, Biology, Physics and/or Chemistry and any other Science subject. For Cyber Security Science is the same as Computer Science. |
| UEX633 | TELECOMMUNICATION MANAGEMENT | NDA | cross_reference | subject_or_general / sciences_offerings.json:TELECOMMUNICATION MANAGEMENT:NDA:0 | Same as in Mathematics. |
| UEX634 | TELECOMMUNICATION MANAGEMENT | UMUDIKE | cross_reference | subject_or_general / sciences_offerings.json:TELECOMMUNICATION MANAGEMENT:UMUDIKE:0 | Same as in Mathematics. |
| UEX635 | TELECOMMUNICATION SCIENCE | SOUTHWESTERN | cross_reference | subject_or_general / sciences_offerings.json:TELECOMMUNICATION SCIENCE:SOUTHWESTERN:0 | Same as in Mathematics. |
| UEX636 | Urban and Regional Planning | BELLS | utme_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:BELLS:2 | UTME subjects: English Language and any other three subjects from Mathematics, Geography, Economics, Government, Chemistry, Physics, Agricultural Science/Biology, Technical Drawings and Fine Art. |
| UEX637 | Urban and Regional Planning | CARITAS | olevel_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:CARITAS:1 | (UTME) Requires five (5) 'O' Level credit passes to include English Language, Mathematics and any three (3) from Geography, Physics, Biology, Technical Drawing, Fine Arts, Surveying, Economics and Government. UTME subjects: Physics, Chemistry and one of Government, Geography, Economics. |
| UEX638 | Urban and Regional Planning | LAUTECH | utme_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:LAUTECH:1 | (UTME) Accepts Agricultural Science as sciences. UTME subjects: Geography and two (2) of Economics, Physics, Chemistry, Mathematics, Government, Biology and Agricultural Science. |
| UEX639 | Urban and Regional Planning | OAU | utme_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:OAU:1 | (UTME) Requires English Language, Mathematics, Geography, Economics and any other from Biology, Physics, Chemistry, Technical Drawing, Fine Arts/Government. UTME subjects: requires Economics in addition to Mathematics. |
| UEX640 | Urban and Regional Planning | OOU | utme_parse_failed | subject_or_general / engineering_offerings.json:Urban and Regional Planning:OOU:0 | UTME: accepts Mathematics or Geography. Requires any three (3) of Chemistry, Physics, Biology, Arts or Economics. |
| UEX641 | Urban and Regional Planning | RSU | olevel_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:RSU:1 | (UTME) Five (5) 'O' Level credit passes to include English Language, Mathematics, Geography and any other two (2) subjects from Economics, Physics, Chemistry, Biology, Fine Art, Technical Drawing and Government. UTME subjects: Mathematics, Geography and any other subject from Physics, Chemistry, Biology, Fine Art, Technical Drawing and Government. |
| UEX642 | Urban and Regional Planning | RSU | olevel_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:RSU:0 | In addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline. (b) OND/ND (Upper Credit) in relevant discipline. (c) At least two (2) passes at GCE 'A' Level including Geography. |
| UEX643 | Urban and Regional Planning | UNN | olevel_parse_failed | direct_entry / engineering_offerings.json:Urban and Regional Planning:UNN:1 | (UTME) Requires (5) 'O' Level credit passes including English Language, Mathematics, and any other three (3) subjects from Economics, Government, Fine Arts, Technical Drawing, Physics, Chemistry, Agric Science, and Biology. UTME subjects: Mathematics and any two (2) of Economics, Government, Geography, Fine Arts, Physics, Chemistry, Biology, Agricultural Science. |
| UEX644 | Vocational Education | KADPOLY | multiple_clauses | direct_entry / education_offerings.json:Vocational Education:KADPOLY:0 | Requires NCE Technical merit in relevant programme or C grade in all major subjects and accepts two-year-programme candidates from institutions affiliated to ABU; accepts ND lower credit in relevant programme; full Technological Certificate in related technical subjects and Technical Teachers Certificate (TTC); 'O' Level credit in Mathematics with English, Technical Drawing, Fine Arts, TC II, Pre-NCE (T); and 'O' Level plus Federal Craft Certificate / NTC with Mathematics and other relevant subjects. |
| UEX645 | Vocational Education | NDU | cross_reference | direct_entry / education_offerings.json:Vocational Education:NDU:0 | Same as Vocational and Technical Education; accepts NTC/NBC and 'O' Level pass in English but requires 'O' Level credit pass in Physics; UTME subjects require Chemistry as the third subject. |
| UEX646 | Vocational Education | UMUDIKE | olevel_parse_failed | direct_entry / education_offerings.json:Vocational Education:UMUDIKE:0 | Accepts two (2) 'A' Level passes in relevant subjects, NCE, ND, or NBC/NDC; UTME: five 'O' Level credit passes including English Language, Mathematics, Physics and Chemistry; UTME subjects require Chemistry as third subject. |
| UEX647 | Vocational Education | UNN | olevel_parse_failed | direct_entry / education_offerings.json:Vocational Education:UNN:0 | Accepts two (2) 'A' Level passes in Physics and Mathematics in addition to departmental UTME requirements; ND lower credit in Civil Engineering, Production/Electrical Engineering, Drafting Technology; Final City and Guilds plus National Technical Certificate; NCE merit pass in Technical Education; Engineering Technicians Part II Certificate. UTME: five 'O' Level credit passes including Physics or Mathematics at GCE/SSC, NTC or City and Guilds intermediate. |
| UEX648 | Yoruba | ILORIN | olevel_parse_failed | direct_entry / arts_hum_offerings.json:Yoruba:ILORIN:1 | UTME: ILORIN accepts five (5) `O' Level credit passes to include Yoruba, English Language, Mathematics and two (2) other Arts/Social Science subjects. It also accepts candidates who do not offer Yoruba (Language/Literature) but meet other UTME entry requirements. |
| UEX649 | Zoology | BENIN | multiple_clauses | direct_entry / sciences_offerings.json:Zoology:BENIN:0 | in addition to the UTME requirements requires (a) two (2) 'A' Level passes chosen from Biology, Zoology and any other Science subject; (b) ND upper credit/HND lower credit in Science Laboratory Technology, Food Technology; (d) NCE merit with a credit in Biology or Zoology. ('A' Level pass in Chemistry or Mathematics is an advantage but not compulsory.) |
| UEX650 | Zoology | BOWEN | cross_reference | subject_or_general / sciences_offerings.json:Zoology:BOWEN:0 | same as in Microbiology. |
| UEX651 | Zoology | ILORIN | cross_reference | subject_or_general / sciences_offerings.json:Zoology:ILORIN:0 | UDU as for Botany, ILORIN as for Plant Biology. |
| UEX652 | Zoology | KWASU | cross_reference | subject_or_general / sciences_offerings.json:Zoology:KWASU:0 | Same as in Mathematics. |
| UEX653 | Zoology | MAKURDI | cross_reference | subject_or_general / sciences_offerings.json:Zoology:MAKURDI:0 | Same as in Biochemistry. |
| UEX654 | Zoology | OAUSTECH | cross_reference | subject_or_general / sciences_offerings.json:Zoology:OAUSTECH:0 | same as in Fisheries. |
| UEX655 | Zoology | RSU | multiple_clauses | direct_entry / sciences_offerings.json:Zoology:RSU:0 | in addition to 'O' Level requirements accepts: (a) HND (Lower Credit) in relevant discipline; (b) OND/ND (Upper Credit) in relevant discipline; (c) HSC/GCE 'A' Level passes in at least two (2) relevant subjects; One of which must be Biology. |
| UEX656 | Zoology | SOUTHWESTERN | cross_reference | subject_or_general / sciences_offerings.json:Zoology:SOUTHWESTERN:0 | same as in Microbiology. |
| UEX657 | Zoology | UDU | cross_reference | subject_or_general / sciences_offerings.json:Zoology:UDU:0 | UDU as for Botany, ILORIN as for Plant Biology. |

For every university exception above, add: original PDF filename, PDF page, table row, exact waiver/exception text, route (UTME, O-LEVEL, DIRECT ENTRY, or GENERAL NOTE), scope (full rule, partial condition, cross-reference, or source blank), and referenced programme if the text says ‘same as’ or ‘as in’.

## Part 4 — Offering and university-requirement audit

The institution/programme pairs are present, but the legacy offering columns are not populated in the current live database. This is not permission to guess or copy a neighbouring university rule.

The current source-backed replacement layers are:

- school_programme_requirement_exceptions: university-scoped brochure text, including parse status and source label.
- school_programme_subject_options: structured UTME/O-level university rules.
- school_programme_subject_option_items: the named subjects and group logic inside each structured option.
- schools.address: the university address shown to disambiguate institutions.

Manually audit an offering only when the institution/programme pair is missing, wrong, duplicated under the wrong identity, or has a source exception that cannot be attached to the pair. Do not re-enter every offering merely because the legacy text columns are blank.

## Part 5 — How the incomplete states should behave in the product

- parsed / verified source text: may participate in matching and may be shown as a requirement.
- needs_review: may be shown in programme or university details with a clear ‘needs confirmation’ label; it must not create a positive subject match by itself.
- empty / source_blank: show that no usable rule was supplied for that layer; do not invent a rule.
- no_source_candidate: keep the programme/offering discoverable where the identity is valid, but exclude that layer from eligibility matching and show the missing-source state in details.
- Direct Entry-only material: show only in a relevant Direct Entry route; never use it as a UTME subject.
- University-specific material: show after a university is selected, under ‘This university’s requirements’, with its address, source/status, structured options, and exception notes.

## Manual completion block

Use this exact shape for each completed item:

~~~text
PROGRAMME:
INSTITUTION:
LAYER: UTME | O-LEVEL | DIRECT ENTRY | WAIVER
SOURCE PDF:
PDF PAGE:
TABLE ROW:
BROCHURE TEXT:
DECISION: exact_rule | shared_rule | partial_condition | cross_reference | source_blank | source_missing | needs_manual_interpretation
REFERENCE: programme named by the brochure, if any
NOTE:
~~~

Do not use a guessed alternative, a neighbouring programme, or a university waiver as a national subject rule.
