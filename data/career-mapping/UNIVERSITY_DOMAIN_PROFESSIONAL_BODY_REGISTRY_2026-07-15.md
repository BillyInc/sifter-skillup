# University Domain Professional-Body Registry - 2026-07-15

Scope: university-eligible domains only. Non-university/vocational coverage is intentionally deferred.

Purpose: identify authoritative professional-body, regulator, competency-framework, and standards links for role recency, cross-domain role discovery, Nigerian local naming, and credential/licence context.

Local status means whether we already have a file in the repo. `ng_local` means Nigerian local market/regulator relevance.

## How To Read This Registry Without Getting Lost

Use three different source types differently:

| Source type | What to do | What to extract |
|---|---|---|
| `local` / `local partial` | Use the file already in `_prof_bodies/` or `_source_downloads/`. | Role names, work-role IDs, competency names, level labels, certification names, and aliases. |
| `role page` / `career page` / `competency page` | Open the linked page first. If it has no downloadable file, save the page or manually extract the headings. | Role family names, job titles, pathways, certification ladders, and role-like competency groups. |
| `search exact` | Do not browse the whole website. Search the exact phrase in the `Use/search` note. | The newest PDF/XLSX or the official page that contains role/competency language. |

If you are looking for **roles or role-like information**, prioritize sources whose `Use` says one of: `work roles`, `career roles`, `role profiles`, `competency model`, `profession map`, `pathways`, `certification ladder`, or `body of knowledge`. Regulator homepages are mainly for Nigerian licence/context naming; they usually do not provide rich role taxonomies.

## Already Held Locally

| Source/body | Domains | Local file/status |
|---|---|---|
| O*NET 30.3 | all university domains | Downloaded/extracted |
| ESCO | all university domains | Existing source/normalized files |
| SFIA 9 | D001-D010, D056-D059, D139-D141, D147, D167, D168 | XLSX/TTL/PDF files imported from zip |
| NICE Framework 2.2 | D004, D037-D038, D143, D147 | XLSX imported from zip; v1 already existed |
| ENISA ECSF | D004, D038, D143 | PDFs already existed and duplicate role profile imported |
| CFA Career Skills Framework | D011, D013, D060, D062, D158-D159 | PDF imported from zip |
| IIBA BA Competency Model preview | D010, D033 | PDF imported from zip |
| IAPP CIPM BoK | D038, D157, D163, privacy/compliance roles | PDF imported from zip |
| CIPS Global Standard | D034-D036, D079 | PDF imported from zip |
| SPE competency/description | D054, D148 | PDF imported from zip |
| Stack Overflow Developer Survey 2025 report | D001-D010, D056-D059, D139-D141, D167-D168 | HTML downloaded to `_source_downloads/market/stackoverflow_developer_survey_2025_report.html`; raw CSV not exposed from report page source |

## Direct Role/Competency Links And Exact Searches

This is the first stop when the goal is role discovery, role naming, skills, or certificates. Prefer these over generic homepages.

| Priority | Domains | Source/body | Direct link | Use/search |
|---:|---|---|---|---|
| 1 | all domains | O*NET 30.3 | https://www.onetcenter.org/database.html | Local ZIP exists. Use `Occupation Data.txt`, `Alternate Titles.txt`, `Skills.txt`, `Technology Skills.txt`, and `Emerging Tasks.txt`. |
| 1 | all domains | ESCO | https://esco.ec.europa.eu/en/classification/occupation_main | Use local normalized ESCO files first; search exact: `ESCO occupations CSV download`. |
| 1 | D001-D010, D056-D059, D139-D141, D147, D167-D168 | SFIA 9 | https://sfia-online.org/en/sfia-9 | Local XLSX/TTL/PDF exists. Use skills, levels of responsibility, and summary charts. |
| 1 | D004, D037-D038, D143, D147 | NIST NICE Framework | https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center | Local v2.2 XLSX exists. Search exact: `NICE Framework Components v2.2.0 xlsx`. |
| 1 | D004, D038, D143 | ENISA ECSF | https://www.enisa.europa.eu/topics/education/european-cybersecurity-skills-framework | Local role-profile PDFs exist. Search exact: `ENISA ECSF Role Profiles PDF`. |
| 1 | D011, D013-D014, D060-D062, D158-D159 | CFA Career Skills Framework | https://www.cfainstitute.org/en/membership/professional-development/career-skills-framework | Local PDF exists. Use role-family skills and finance career language. |
| 1 | D010, D033 | IIBA Business Analysis Competency Model | https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/business-analysis-competency-model/ | Local preview PDF exists. Use BA/product/BI role overlap; full BABOK is paywalled. |
| 1 | D034-D036, D079 | CIPS Global Standard | https://www.cips.org/intelligence-hub/global-standard-for-procurement-and-supply | Local PDF exists. Use procurement/supply role levels and competency groups. |
| 1 | D038, D157, D163 | IAPP privacy BoKs | https://iapp.org/certify/ | Local CIPM BoK exists. Search exact: `IAPP CIPM body of knowledge PDF`, `IAPP CIPP body of knowledge PDF`. |
| 1 | D054, D148 | SPE Competency Management Tool / Petroleum Engineering Certification | https://www.spe.org/en/training/competency/ | Local SPE description PDF exists. Use oil, petroleum, offshore competency language. |
| 2 | D001-D008, D139-D141, D167-D168 | Stack Overflow Developer Survey 2025 | https://survey.stackoverflow.co/2025/ | Report HTML downloaded. For raw CSV search exact: `Stack Overflow Developer Survey 2025 survey_results_public.csv` or `Stack Overflow Developer Survey 2025 results download`. |
| 2 | D001, D003-D004 | IEEE Computer Society SWEBOK | https://www.computer.org/education/bodies-of-knowledge/software-engineering | Search exact: `SWEBOK Guide V4 PDF IEEE Computer Society`. Use knowledge areas, not as a Nigerian licence source. |
| 2 | D001-D010 | ACM curricula | https://www.acm.org/education/curricula-recommendations | Search exact: `ACM IEEE Computing Curricula 2020 PDF`, `ACM Data Science curriculum PDF`, `ACM Cybersecurity curriculum PDF`. |
| 2 | D014 | SOA / IFoA actuarial careers | https://www.soa.org/education/ and https://actuaries.org.uk/qualify/ | Search exact: `actuarial career path roles SOA`, `IFoA actuarial career path roles`. |
| 2 | D015, D158-D159 | ACCA / CGMA careers | https://www.accaglobal.com/gb/en/careers.html and https://www.aicpa-cima.com/resources/landing/cgma-career-hub | Search exact: `ACCA career navigator roles`, `CGMA career hub finance roles`. |
| 2 | D016-D020, D134-D138, D146-D147, D164 | International Engineering Alliance | https://www.ieagreements.org/ | Search exact: `IEA Graduate Attributes and Professional Competencies PDF`. Use as engineering competency baseline. |
| 2 | D018, D052 | ASCE Civil Engineering Body of Knowledge | https://www.asce.org/career-growth/educators/civil-engineering-body-of-knowledge | Use civil engineering competency outcomes. Search exact: `ASCE Civil Engineering Body of Knowledge PDF`. |
| 2 | D021, D051-D052, D156 | RICS APC | https://www.rics.org/join-rics/chartered-member-mrics | Search exact: `RICS APC pathway guide PDF competencies`, plus the pathway name such as `quantity surveying`, `building surveying`, `valuation`, or `geomatics`. |
| 2 | D029, D130 | CIPD Profession Map | https://www.cipd.org/uk/profession-map/ | Direct `/en/profession-map/` returned 404 via curl. Search exact: `CIPD Profession Map specialist knowledge behaviours PDF`. |
| 2 | D032 | PMI certifications / Talent Triangle | https://www.pmi.org/certifications and https://www.pmi.org/certifications/certification-resources/maintain/talent-triangle | Use certification ladder and talent-triangle language. PMBOK itself is paywalled. |
| 2 | D023-D027, D064, D067-D068, D154-D165 | WHO Health Workforce | https://www.who.int/teams/health-workforce | Search exact: `WHO health workforce competency framework PDF`, `WHO Global Competency Framework universal health coverage PDF`. |
| 2 | D057, D023-D027 | AMIA | https://amia.org/careers-certifications | Use health informatics career/certification language. Search exact: `AMIA health informatics careers certification roles`. |
| 2 | D041, D142-D145, D155 | Research/science bodies | https://www.iscb.org/ and https://www.sfn.org/ and https://www.mrs.org/ | Search exact per field: `ISCB bioinformatics career roles`, `Society for Neuroscience career paths`, `Materials Research Society career resources`. |
| 3 | Nigerian regulated domains | Nigerian regulators/professional councils | Use ng_local links in the domain tables below. | Search exact: `[body acronym] register licence requirements Nigeria`, `[body acronym] membership grades Nigeria`, `[profession] approved qualifications Nigeria`. Extract licence titles and Nigerian aliases, not full skill taxonomies. |

## Download Attempts This Session

| Source | Result | Local path / note |
|---|---|---|
| Stack Overflow Developer Survey 2025 report | Downloaded | `_source_downloads/market/stackoverflow_developer_survey_2025_report.html` |
| Stack Overflow Developer Survey 2025 raw CSV | Not found from report page source | Use exact search above; the report page confirms 2025 role/technology sections and ODbL data licensing. |
| BLS OEWS May 2025 all-data ZIP | Direct `curl` blocked with HTTP 403 | Search exact: `BLS OEWS May 2025 all data zip oesm25all.zip`; download manually in browser if needed. |
| O*NET 30.3 ZIP | Reachable and already local | `_source_downloads/taxonomy/onet_30_3_database.zip` |
| CIPD Profession Map old URL | 404 via `curl` | Use `https://www.cipd.org/uk/profession-map/` or exact search above. |

## Domain Cluster Registry

### Information & Communication Technology

Domains: D001 Software Engineering, D002 Data Engineering, D003 Artificial Intelligence, D004 Cybersecurity, D005 Cloud Computing, D006 Internet of Things, D007 UI/UX Design, D008 Telecommunications, D139 Game Design, D140 Robotics Engineering.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| SFIA 9 | https://sfia-online.org/en/sfia-9 | local partial | Cross-domain digital skills, role-skill recency, seniority levels |
| IEEE Computer Society / SWEBOK | https://www.computer.org/education/bodies-of-knowledge/software-engineering | manual | Software engineering roles and knowledge areas |
| ACM/IEEE Computing Curricula | https://www.acm.org/education/curricula-recommendations | manual | Computing, AI, data, cybersecurity curriculum-to-role grounding |
| NIST NICE Framework | https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center | local | Cybersecurity work roles, tasks, knowledge, skills |
| ENISA ECSF | https://www.enisa.europa.eu/topics/education/european-cybersecurity-skills-framework | local | Cybersecurity role profiles |
| Cloud Native Computing Foundation | https://www.cncf.io/certification/ | link only | Cloud/platform engineering credential and role signals |
| AWS Certifications | https://aws.amazon.com/certification/ | link only | Cloud/AI/data role certification layer |
| Microsoft Learn Credentials | https://learn.microsoft.com/en-us/credentials/ | link only | Cloud/data/security role certification layer |
| Cisco Certifications | https://www.cisco.com/site/us/en/learn/training-certifications/certifications/index.html | link only | Networking/telecom/cloud roles |
| UXPA | https://uxpa.org/ | link only | UX role taxonomy and professional naming |
| IGDA | https://igda.org/resources/ | link only | Game design/development role families |
| International Federation of Robotics | https://ifr.org/ | link only | Robotics market and role context |
| Nigerian Computer Society | https://www.ncs.org.ng/ | link only, ng_local | Nigerian ICT professional naming and recognition |
| CPN Nigeria | https://www.cpn.gov.ng/ | link only, ng_local | Nigerian computing professional regulation |
| Nigerian Communications Commission | https://www.ncc.gov.ng/ | link only, ng_local | Telecom regulatory/local-market context |

### Data & Analytics

Domains: D009 Data Science, D010 Business Intelligence.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| O*NET 30.3 | https://www.onetcenter.org/database.html | local | Data/BI occupations, tools, skills |
| SFIA 9 data/information skills | https://sfia-online.org/en/sfia-9 | local partial | Data engineering, BI, analytics skills |
| DAMA International / DMBOK | https://www.dama.org/cpages/body-of-knowledge | link only | Data management role/competency framework |
| TDWI | https://tdwi.org/ | link only | BI/data warehousing role recency |
| IIBA | https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/business-analysis-competency-model/ | local preview | BI/business analysis overlap |
| Data Science Nigeria | https://www.datasciencenigeria.org/ | link only, ng_local | Nigerian AI/data ecosystem signal |

### Financial Services

Domains: D011 Quantitative Finance, D012 FinTech Engineering, D013 Investment Analysis, D014 Actuarial Science, D015 Accounting, D060 Banking/Credit, D061 Insurance, D062 Trading, D158 Corporate Finance/Investment Banking, D159 Credit Analysis/Structured Finance.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| CFA Institute Career Skills Framework | https://www.cfainstitute.org/en/membership/professional-development/career-skills-framework | local PDF | Investment, portfolio, research, risk roles |
| ACCA Careers | https://www.accaglobal.com/gb/en/careers.html | link only | Accounting/finance career roles; search exact: `ACCA career navigator roles` |
| CIMA / AICPA CGMA Career Hub | https://www.aicpa-cima.com/resources/landing/cgma-career-hub | link only | Management accounting and finance roles |
| GARP FRM | https://www.garp.org/frm | link only | Risk/quant/market/credit roles |
| PRMIA | https://prmia.org/ | link only | Risk role taxonomy and certification |
| Society of Actuaries | https://www.soa.org/ | link only | Actuarial roles |
| Institute and Faculty of Actuaries | https://actuaries.org.uk/ | link only | Actuarial roles |
| Global Association of Risk Professionals | https://www.garp.org/ | link only | Risk roles |
| ICAN Nigeria | https://icanig.org/ | link only, ng_local | Nigerian accounting role/licence naming |
| ANAN | https://anan.org.ng/ | link only, ng_local | Nigerian accounting profession |
| CIBN | https://www.cibng.org/ | link only, ng_local | Nigerian banking/credit roles |
| Chartered Institute of Stockbrokers Nigeria | https://www.cisnigeria.com/ | link only, ng_local | Nigerian capital-market/trading roles |
| NAICOM | https://www.naicom.gov.ng/ | link only, ng_local | Nigerian insurance context |
| SEC Nigeria | https://sec.gov.ng/ | link only, ng_local | Nigerian securities/investment context |
| Central Bank of Nigeria | https://www.cbn.gov.ng/ | link only, ng_local | Banking/fintech regulatory context |

### Engineering & Built Environment

Domains: D016 Electrical, D017 Mechanical, D018 Civil, D019 Renewable Energy, D020 Environmental Engineering, D021 Architecture, D022 Mining, D069 Aviation, D072 Geospatial Science, D074 Occupational Health/Safety, D146 Building Services, D147 Process Automation/SCADA/PLC, D156 Land Surveying, D164 Smart City Systems.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| International Engineering Alliance Graduate Attributes | https://www.ieagreements.org/ | search exact | Engineering competency baseline; search exact: `IEA Graduate Attributes and Professional Competencies PDF` |
| IEEE | https://www.ieee.org/ | link only | Electrical/electronics/computing engineering |
| ASME | https://www.asme.org/ | link only | Mechanical engineering roles/standards |
| ASCE Body of Knowledge | https://www.asce.org/career-growth/educators/civil-engineering-body-of-knowledge | link only | Civil engineering competency areas |
| IET Career Manager | https://www.theiet.org/career/ | link only | Engineering professional competencies |
| RICS APC | https://www.rics.org/join-rics/chartered-member-mrics | search exact | Surveying, built environment, construction roles; search exact: `RICS APC pathway guide PDF competencies` |
| PMI | https://www.pmi.org/certifications | link only | Project/construction/engineering management |
| ISA | https://www.isa.org/certification | link only | Automation, SCADA, control systems roles |
| IOSH | https://iosh.com/ | link only | Occupational health/safety roles |
| NEBOSH | https://www.nebosh.org.uk/ | link only | Health/safety qualifications |
| ICAO | https://www.icao.int/ | link only | Aviation competency/regulatory context |
| IATA | https://www.iata.org/ | link only | Aviation operations roles |
| COREN | https://coren.gov.ng/ | link only, ng_local | Nigerian engineering regulation |
| Nigerian Society of Engineers | https://www.nse.org.ng/ | link only, ng_local | Nigerian engineering professional naming |
| ARCON | https://arconigeria.gov.ng/ | link only, ng_local | Nigerian architecture regulation |
| QSRBN | https://qsrbn.gov.ng/ | link only, ng_local | Nigerian quantity surveying |
| SURCON | https://surcon.org.ng/ | link only, ng_local | Nigerian surveying/geospatial |
| TOPREC | https://toprec.org.ng/ | link only, ng_local | Nigerian town planning |
| NCAA Nigeria | https://ncaa.gov.ng/ | link only, ng_local | Nigerian aviation regulation |

### Health & Biomedical

Domains: D023 Medicine, D024 Nursing, D025 Pharmacy, D026 Public Health, D027 Biomedical, D064 Psychology/Counselling, D066 Veterinary Science, D067 Dentistry, D068 Allied Health, D154 Exercise Science/Sports Therapy, D165 Wellness/Lifestyle Medicine.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| WHO Health Workforce / Competencies | https://www.who.int/teams/health-workforce | search exact | Health role and competency context; search exact: `WHO health workforce competency framework PDF` |
| AMIA | https://amia.org/careers-certifications | link only | Health informatics/digital health roles |
| FIP | https://www.fip.org/ | link only | Pharmacy global roles |
| World Physiotherapy | https://world.physio/ | link only | Physiotherapy roles |
| World Veterinary Association | https://worldvet.org/ | link only | Veterinary roles |
| WOAH | https://www.woah.org/ | link only | Veterinary/public-health context |
| ACSM | https://www.acsm.org/certification | link only | Exercise science/sports therapy |
| MDCN | https://www.mdcn.gov.ng/ | link only, ng_local | Nigerian medicine/dentistry regulation |
| NMCN | https://www.nmcn.gov.ng/ | link only, ng_local | Nigerian nursing/midwifery regulation |
| PCN | https://www.pcn.gov.ng/ | link only, ng_local | Nigerian pharmacy regulation |
| MLSCN | https://web.mlscn.gov.ng/ | link only, ng_local | Medical laboratory science |
| Radiographers Registration Board of Nigeria | https://rrbn.gov.ng/ | link only, ng_local | Radiography/imaging roles |
| Medical Rehabilitation Therapists Board | https://mrtbnigeria.org.ng/ | link only, ng_local | Physiotherapy/rehab roles |
| EHORECON | https://ehorecon.gov.ng/ | link only, ng_local | Environmental/public health roles |
| CHPRBN | https://chprbn.gov.ng/ | link only, ng_local | Community health roles |
| Veterinary Council of Nigeria | https://vcn.gov.ng/ | link only, ng_local | Veterinary regulation |
| Pharmacists Council of Nigeria | https://www.pcn.gov.ng/ | link only, ng_local | Pharmacy roles/licensing |

### Business, Management, Supply Chain & Logistics

Domains: D028 General Management, D029 HR, D030 Marketing/Brand, D031 Sales, D032 Project Management, D033 Product Management, D130 Recruitment, D034 Supply Chain, D035 Logistics, D036 Procurement, D076 Maritime, D079 Customs/Trade.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| CIPD Profession Map | https://www.cipd.org/uk/profession-map/ | search exact | HR roles, levels, competencies; old `/en/profession-map/` URL returned 404 via curl |
| SHRM BASK | https://www.shrm.org/credentials/certification | link only | HR competency model |
| PMI Talent Triangle / Certifications | https://www.pmi.org/certifications | link only | Project/program/product-adjacent management; also use https://www.pmi.org/certifications/certification-resources/maintain/talent-triangle |
| IIBA | https://www.iiba.org/ | local preview | BA/product/BI role overlap |
| Product School / Product competencies | https://productschool.com/ | link only | Product management role language |
| CIPS Global Standard | https://www.cips.org/intelligence-hub/global-standard-for-procurement-and-supply | local PDF | Procurement and supply roles |
| ASCM/APICS | https://www.ascm.org/ | link only | Supply chain/logistics roles |
| Chartered Institute of Logistics and Transport | https://ciltinternational.org/ | link only | Logistics/transport roles |
| IMO | https://www.imo.org/ | link only | Maritime global context |
| World Customs Organization | https://www.wcoomd.org/ | link only | Customs/trade roles |
| CIPM Nigeria | https://cipmnigeria.org/ | link only, ng_local | Nigerian HR professional naming |
| Nigerian Institute of Management | https://www.managementnigeria.org/ | link only, ng_local | Nigerian management roles |
| NIMN | https://nimn.com.ng/ | link only, ng_local | Nigerian marketing roles |
| CILTN Nigeria | https://ciltnigeria.org/ | link only, ng_local | Nigerian logistics/transport roles |
| Nigerian Shippers Council | https://shipperscouncil.gov.ng/ | link only, ng_local | Maritime/logistics context |
| Nigeria Customs Service | https://customs.gov.ng/ | link only, ng_local | Customs/trade context |

### Legal & Compliance

Domains: D037 Legal Practice, D038 Compliance/Regulation, D157 Tax Advisory/Transfer Pricing, D162 Immigration Law/Asylum, D163 Intellectual Property/Patents.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| IAPP | https://iapp.org/certify/ | local CIPM PDF | Privacy/compliance career roles |
| ACFE | https://www.acfe.com/ | link only | Fraud/examiner roles |
| ICA / Compliance certifications | https://www.int-comp.org/ | link only | Compliance and financial-crime roles |
| WIPO Academy | https://www.wipo.int/academy/en/ | link only | IP/patent roles |
| International Fiscal Association | https://www.ifa.nl/ | link only | Tax roles |
| Nigerian Bar Association | https://nigerianbar.org.ng/ | link only, ng_local | Nigerian legal-practice context |
| Legal Practitioners Privileges Committee / LPPC | https://lppconline.com/ | link only, ng_local | Nigerian legal profession context |
| FIRS | https://www.firs.gov.ng/ | link only, ng_local | Nigerian tax roles |
| NITDA NDPA/Data Protection Commission | https://ndpc.gov.ng/ | link only, ng_local | Nigerian privacy/data protection roles |
| NOTAP | https://notap.gov.ng/ | link only, ng_local | Nigerian IP/technology transfer context |
| Nigeria Immigration Service | https://immigration.gov.ng/ | link only, ng_local | Immigration/asylum role context |

### Public Sector, Education & Research

Domains: D149 Diplomacy/International Relations, D045 Public Administration, D046 Social Work, D063 Economics, D073 Library/Archive, D077 Security Services, D128 Social Welfare/Youth Services, D143 Forensic Science/Digital Forensics, D150 Religious Ministry/Theology, D151 Criminology/Criminal Justice, D161 Humanitarian Aid/Emergency Response, D039 Higher Education, D040 Vocational, D041 Scientific Research, D078 Social Sciences.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| UNESCO | https://www.unesco.org/ | link only | Education/culture/research context |
| OECD Skills / Education | https://www.oecd.org/skills/ | link only | Skills and labour context |
| IFLA | https://www.ifla.org/ | link only | Library/archive roles |
| ICA International Council on Archives | https://www.ica.org/ | link only | Archive/cultural heritage roles |
| INASP / research capacity sources | https://www.inasp.info/ | link only | Research roles in emerging markets |
| IFRC | https://www.ifrc.org/ | link only | Humanitarian/emergency response roles |
| Sphere Standards | https://spherestandards.org/ | link only | Humanitarian competencies |
| ACFE | https://www.acfe.com/ | link only | Forensics/fraud overlap |
| INTERPOL cybercrime resources | https://www.interpol.int/en/Crimes/Cybercrime | link only | Digital forensics/cybercrime context |
| NUC | https://www.nuc.edu.ng/ | link only, ng_local | Nigerian university/programme context |
| Nigerian Institute of Social Workers | https://nisw.org.ng/ | link only, ng_local | Social-work naming |
| Nigerian Library Association | https://nla.org.ng/ | link only, ng_local | Library/archive naming |
| Institute of Chartered Economists of Nigeria | https://icenigeria.org/ | link only, ng_local | Economics professional naming |
| NEMA | https://nema.gov.ng/ | link only, ng_local | Emergency management context |
| NPF / PSC / NSCDC | https://www.npf.gov.ng/ | link only, ng_local | Security/criminal justice context |

### Creative & Media

Domains: D042 Media Production, D043 Journalism, D044 Graphic Design, D065 Translation/Interpretation, D071 Sports Management, D080 Interior Design, D152 Museum/Cultural Heritage, D153 Music Production, D160 Fashion Styling, D168 Esports/Creator Economy, D070 Performing Arts/Entertainment.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| ScreenSkills | https://www.screenskills.com/ | link only | Film/media production role maps |
| Poynter / journalism training | https://www.poynter.org/ | link only | Journalism role skills |
| International Federation of Journalists | https://www.ifj.org/ | link only | Journalism professional context |
| AIGA | https://www.aiga.org/ | link only | Design career roles |
| Chartered Institute of Linguists | https://www.ciol.org.uk/ | link only | Translation/interpreting roles |
| ICOM | https://icom.museum/ | link only | Museum/cultural heritage roles |
| International Music Managers Forum | https://immf.com/ | link only | Music business roles |
| NASEF | https://www.nasef.org/ | link only | Esports education/career roles |
| Hitmarker | https://hitmarker.net/ | link only | Esports/creator economy job taxonomy |
| NUJ Nigeria | https://www.nuj.org.ng/ | link only, ng_local | Nigerian journalism context |
| Advertising Regulatory Council of Nigeria | https://arcon.gov.ng/ | link only, ng_local | Advertising/brand regulation |
| Nigerian Institute of Public Relations | https://nipr.org.ng/ | link only, ng_local | PR/media role context |
| National Sports Commission | https://nsc.gov.ng/ | link only, ng_local | Sports management context |

### Agriculture, Food, Energy, Advanced Manufacturing & Science

Domains: D047 Agriculture, D049 Automotive, D050 Industrial Automation, D051 Real Estate, D052 Construction Management, D053 Hospitality, D054 Oil, D148 Offshore/Subsea, D056 Blockchain, D057 Digital Health, D058 EdTech, D059 Space Technology, D131 Motorsport, D132 Space Science, D134 Naval Architecture, D166 Autonomous Vehicles, D135 Nuclear, D136 Aeronautical, D137 Medical Physics, D138 Biomedical Engineering, D142 Bioinformatics, D144 Climate Science, D145 Neuroscience, D155 Nanotechnology, D141 Quantum Computing, D167 XR.

| Body/source | Link | Status | Use |
|---|---|---:|---|
| FAO | https://www.fao.org/ | link only | Agriculture/food roles |
| Codex Alimentarius | https://www.fao.org/fao-who-codexalimentarius/ | link only | Food systems/quality roles |
| CGIAR | https://www.cgiar.org/ | link only | Agriculture research roles |
| SPE | https://www.spe.org/ | local PDF | Oil, petroleum, offshore roles |
| IMarEST | https://www.imarest.org/ | link only | Marine/offshore/naval roles |
| RINA | https://www.rina.org.uk/ | link only | Naval architecture roles |
| IAEA | https://www.iaea.org/ | link only | Nuclear/radiation/medical physics |
| AAPM | https://www.aapm.org/ | link only | Medical physics roles |
| AIAA | https://www.aiaa.org/ | link only | Aerospace/aeronautical/space roles |
| NASA workforce/STEM | https://www.nasa.gov/learning-resources/ | link only | Space/aerospace role context |
| EMBL-EBI training | https://www.ebi.ac.uk/training/ | link only | Bioinformatics role skills |
| ISCB | https://www.iscb.org/ | link only | Computational biology roles |
| Society for Neuroscience | https://www.sfn.org/ | link only | Neuroscience roles |
| Materials Research Society | https://www.mrs.org/ | link only | Nanotech/materials roles |
| IEEE Quantum | https://quantum.ieee.org/ | link only | Quantum roles |
| Khronos Group | https://www.khronos.org/ | link only | XR/immersive technical standards |
| FMARD Nigeria | https://fmard.gov.ng/ | link only, ng_local | Nigerian agriculture context |
| NIAE | https://niae.net.ng/ | link only, ng_local | Nigerian agricultural engineering |
| DPR/NUPRC | https://www.nuprc.gov.ng/ | link only, ng_local | Nigerian oil/upstream roles |
| NMDPRA | https://www.nmdpra.gov.ng/ | link only, ng_local | Nigerian downstream/midstream energy |
| NASRDA | https://nasrda.gov.ng/ | link only, ng_local | Nigerian space science/technology |
| NNRA | https://nnra.gov.ng/ | link only, ng_local | Nigerian nuclear/radiation regulation |
| NiMet | https://nimet.gov.ng/ | link only, ng_local | Nigerian climate/meteorology roles |

## How To Use This Registry

1. For each domain, start with ESCO/O*NET roles already in `occupation_graph.json`.
2. Pull professional-body role names, competency names, certification names, and level labels.
3. Add Nigerian regulator/body aliases where they affect local role names or licence requirements.
4. Normalize extracted role names to:
   - existing LevelUp role IDs where possible,
   - O*NET SOC when possible,
   - ESCO occupation URI when possible,
   - source-only provisional role when not found.
5. Mark cross-domain roles explicitly, e.g. privacy engineer, digital forensic analyst, product security manager, health informatics specialist, climate risk analyst.
6. Use market sources to score `global`, `ng_remote`, and `ng_local` separately.

## Highest-Priority Professional-Body Gaps To Download Next

1. BLS OEWS May 2025 all-data file for value scoring.
2. Stack Overflow 2025 CSV for tech/tool recency.
3. IEA Graduate Attributes for engineering baseline.
4. RICS APC pathways for built environment and surveying.
5. CIPD Profession Map for HR/recruitment.
6. WHO/health workforce competency sources.
7. Nigerian regulator pages/docs for COREN, MDCN, NMCN, PCN, ICAN, CIBN, CIPM Nigeria, ARCON, SURCON, NUC.
