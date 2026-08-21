# CCMAS missing-content and extraction audit

**Audit date:** 2026-08-19  
**Scope:** CCMAS documents and their effect on the active curriculum/domain pipeline. Admission-cycle fields such as JAMB requirements remain separate.  
**Source of truth:** the original PDFs in `C:\Users\USER\Downloads\ccmas original documents (2).zip`.

## What this audit establishes

The two CCMAS ZIP archives were compared by PDF filename, file size, CRC and SHA-256. They contain the same 17 PDF files; the newer archive only has a different directory wrapper. The audit therefore uses the original PDFs listed below, not a newer curriculum edition.

The current repository extraction contains:

| Item | Current count |
|---|---:|
| Source PDFs | 17 |
| Stored programme objects | 237 |
| Unique discipline/programme keys | 237 |
| Stored course rows | 9,857 |
| Document-level flags | 44 |
| Course-level flags | 121 |
| CCMAS programme/domain records | 237 |

The existing JSON is a course-oriented mapping layer. It does not store every CCMAS field such as D3-D6, P3-P11, P9b, or the complete P13/P14 prose. A value can therefore be present in the PDF and in the extraction notes but still be absent from the live CCMAS JSON. That is an extraction/schema gap, not proof that the PDF is missing the value.

## Current pipeline result

The active CCMAS → domain → JAMB → university-offering pipeline now has **0 source-review holds**, **0 structural errors**, and **9,129/9,129 university offerings** with a certified chain. The 273 granular JAMB rows expose only their source-anchored CCMAS course slice; they do not inherit the entire parent curriculum.

The original local PDF archive was checked against the National Universities Commission CCMAS publication index and official discipline PDFs. The NUC publication page is the external provenance reference: https://www.nuc.edu.ng/ccmas/ . The local archive remains the locked source snapshot used for reproducible hashes and page-level decisions.

Several source limitations remain deliberately visible as provenance (for example, FIN 102 has no source title/content block, Procurement PRM 408 has no supplied title/content, and Veterinary VRP 608 has contents but no learning outcomes). Those rows are excluded from unsupported domain anchors; they no longer block unrelated, source-backed mappings.

## Status labels used below

- **SOURCE MISSING:** the PDF does not state the requested field.
- **SOURCE CONFLICT:** the PDF contains two incompatible values. Do not choose one silently.
- **EXTRACTION GAP:** the PDF contains the material in another section, but the structured record does not retain it or the course row is not in the P12 table.
- **SOURCE TYPO/EDITORIAL:** the source contains an apparent typo, copy/paste residue, truncation, or malformed text.
- **DISPLAY ONLY:** the issue affects units, contact hours, wording, or metadata, but not the curriculum concepts used for domain mapping.
- **MAPPING BLOCKER:** the issue can change the course title, code, curriculum scope, skills, or programme identity used to derive programme/domain links.

## Source files in scope

| Discipline | Original PDF |
|---|---|
| Administration and Management | `Administration-and-Management.pdf` |
| Agricultural Science | `Agriculture-2023.pdf` |
| Allied Health Sciences | `Allied-Health-Sciences-2023.pdf` |
| Architecture | `Architecture-CCMAS-2023-FINAL.pdf` |
| Arts | `Arts-CCMAS-2023-FINAL.pdf` |
| Basic Medical Sciences | `Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf` |
| Communication and Media Studies | `Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf` |
| Computing | `Computing-CCMAS-2023-FINAL.pdf` |
| Education | `Education-CCMAS-2023-New.pdf` |
| Engineering and Technology | `Engineering-Technology-CCMAS-2023-FINAL.pdf` |
| Environmental Sciences | `Environmental-Sciences-CCMAS-2023-FINAL.pdf` |
| Law | `Law-ALL.pdf` |
| Medicine and Dentistry | `Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf` |
| Pharmacy and Pharmaceutical Sciences | `Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf` |
| Sciences | `Sciences-CCMAS-2023-FINAL.pdf` |
| Social Sciences | `Social-Sciences-CCMAS-FINAL-2023-A.pdf` |
| Veterinary Medicine | `Veterinary-Medicine-CCMAS-2023-FINAL.pdf` |

## Stop-ship mapping findings

Resolve these before treating the affected CCMAS programme as a reliable source for programme-to-domain mapping. The problem is not the units alone; it is that the mapped curriculum may contain the wrong or incomplete subject identity.

| ID | Programme/course | Source location to inspect | Finding | Required decision |
|---|---|---|---|---|
| M-01 | Finance / Banking and Finance — `FIN 102` | Administration PDF, Finance programme P12 and P13/P14 sections | `FIN 102` has no title, learning outcomes, or contents in the source extraction. | Confirm whether the course exists, its exact title/code, and its full outcomes/content. Add it or mark it source-missing. Re-run Finance domain evidence. |
| M-02 | Finance / Banking and Finance — `FIN 201-205` versus LO codes | Administration PDF, Finance P12 table and P13/P14 | The global table uses sequential `FIN 201-205`; the outcomes/content section uses a different code sequence. | Build an explicit table-to-content code map. Do not attach outcomes to a course by position alone. Re-run Finance and all JAMB variants inheriting Finance. |
| M-03 | Business Administration — `BUA 200` | Administration PDF, Business Administration P12 and P13/P14 | `BUA 200` appears in learning outcomes but is marked absent from the course table. | Confirm whether it is a real course, its level/status/units, and whether it belongs in the curriculum scope. Re-run Business Administration evidence. |
| M-04 | Co-operative and Rural Development — `CRD 408` | Administration PDF, CRD P12 and P13/P14 | `CRD 408` appears in outcomes but may be absent from the course table. | Confirm inclusion and exact course identity before using CRD course anchors. |
| M-05 | Petroleum Information Management — `PIM 310`, `312`, `412`, `413`, `414` | Administration PDF, PIM P12 and P13/P14 | These courses appear in outcomes/content but not in the course table. `PIM 202` also appears as `ENT 202`. | Reconcile the complete PIM table with the outcomes/content section and decide whether each row is a PIM course or a source code error. Re-run PIM mapping. |
| M-06 | Procurement Management — `PRM 408` | Administration PDF, PRM P12/P13/P14; programme section pages must be checked in the original | No title, learning outcomes, or contents are present. | Do not invent a title. Record `SOURCE MISSING` or transcribe the source if the PDF contains it. Re-run Procurement evidence. |
| M-07 | Taxation — `ACC 101`, `ACC 102`, `TAX 311`, `TAX 411/421` | Administration PDF, Taxation P12 and P13/P14 | `ACC 101/102` have no titles; a duplicate 100-level table exists; `TAX 311` is used for two different courses; `TAX 411/421` are combined into one project title. | Resolve course identity and project boundaries. Do not let duplicate codes collapse different curriculum concepts. Re-run Taxation evidence. |
| M-08 | Common and Islamic Law — `ICL 304` | Law PDF pp. 57-58 and 73-74 | P12 says `Enterprise Appreciation`, 2 units/LH 30; P13/P14 says `Islamic Family Law`, 3 units/LH 45. This is a different subject, not a formatting difference. | Manually inspect the PDF and determine the authoritative title/code. Preserve the discarded source value in an audit note. Re-run Common and Islamic Law mapping from the chosen curriculum. |
| M-09 | Social Sciences — Library and Information Science | Social Sciences PDF, Table 1.1 and LIS section pp. 136-158 | LIS is a complete programme section but is absent from Table 1.1 and the glossary. Multiple LIS course codes differ between P12 and P13/P14. | Confirm that LIS is an intended CCMAS programme. Produce a code/title reconciliation for `LIS 211/212`, `LIS 322/225`, `LIS 418/321`, `LIS 424/419`; resolve `LIS 228` with no content entry and `LIS 316/321` content-only rows. Re-run LIS mapping. |
| M-10 | Politics, Philosophy and Economics — common and philosophy courses | Social Sciences PDF, PPE P12/P13/P14; the source review section is around the PPE course tables | `SSC 202`, `SSC 301`, `SSC 302`, and `SSC 401` are absent from the PPE P12 table. `PHL 301`, `PHL 302`, `PHL 305`, and `PHL 306` appear in the table but have no course-content entries. | Confirm the intended PPE curriculum, especially whether common courses were omitted from the table or intentionally excluded. Obtain/record missing philosophy content before using PPE as a complete curriculum. |
| M-11 | International Relations — `IRS 407` / `SSC 401` | Social Sciences PDF, IRS 400-level table and P13/P14 | The research project is labelled `SSC 401` in the content section and appears twice with the standard Research Method II entry. | Identify the research-project code and keep it separate from Research Method II. Re-run IRS course anchors. |
| M-12 | Science Laboratory Technology | Sciences PDF, SLT programme and option tables | The programme has eight options sharing a common 100-level; the extraction must preserve option-specific courses and not treat the shared foundation as the whole programme. | Verify all eight option tables and record the option boundary. Do not map every SLT option to the same full curriculum without scope evidence. |
| M-13 | Medicine and Dentistry — haematology courses | Medicine and Dentistry PDF, P12 versus P13/P14 | P12 uses `HEM 302/401/402/403/404`; P13/P14 uses `HAE` prefixes for apparent equivalents. | Confirm whether HEM/HAE are aliases or different courses. Preserve a canonical code plus source aliases before course-level mapping. |
| M-14 | Veterinary Medicine — senior clinical courses | Veterinary PDF, P12 versus P13/P14 | `VPM 508`/`VPM 507` and `VCH 501/502` versus `VCH 503/504` disagree between tables and contents. `VRP 608` has contents but no learning outcomes. | Reconcile course codes and retain the missing-learning-outcome state. Re-run Veterinary curriculum evidence if these courses anchor a domain. |
| M-15 | Arts — Modern European Languages B.A | Arts PDF, the two programme sections with the same displayed name | The structured extraction contains two Arts programme objects with the same name but different code families: `FRE` (French) and `GER` (German). The programme/domain registry keys by discipline plus displayed name, so one can overwrite the other. | Give the source variants stable identities, for example `Modern European Languages B.A — French` and `Modern European Languages B.A — German`, or use a source programme code as the key. Rebuild French/German and combined-language mappings separately. |

## Stop-ship resolution register

The table above records the original findings. Their current mapping treatment is:

| Finding | Current treatment |
|---|---|
| M-01, M-06 | Source-missing course identity/content is retained explicitly and excluded from domain anchors; no title was invented. |
| M-02, M-04, M-05 | The NUC P12/P13/P14 pages were checked. Confirmed course titles are retained; content-only rows are not allowed to expand the active P12 curriculum silently. |
| M-03 | `BUA 200` is retained as content-only provenance and excluded from active course anchors because it is absent from the P12 table. |
| M-07 | Duplicate `TAX 311` rows use stable `course_identity` values; `TAX 411/421` remains a combined source project identity. |
| M-08 | Both `ICL 304` source values remain visible; the complete P13/P14 `Islamic Family Law` content is the explicit mapping identity. |
| M-09, M-10, M-11 | LIS/PPE/IRS table-content omissions and code aliases remain documented; only source-present course rows contribute active domain evidence. |
| M-12 | Science Laboratory Technology option boundaries remain separate from the shared foundation. |
| M-13 | HEM/HAE are retained as aliases with one canonical course identity. |
| M-14 | Veterinary VPM/VCH aliases are reconciled; `VEX 599` and `VRP 608` are excluded from unsupported domain anchors. |
| M-15 | French and German are separate stable Arts programme identities and are mapped independently. |

These decisions leave zero active source-review holds while preserving unresolved source limitations for later display/schema work.

## Discipline-level omissions and source defects

These are the exact fields to inspect. A source-missing field should remain explicitly missing; it must not be filled by a generic assumption.

### Administration and Management — `Administration-and-Management.pdf`

- **P9b UTME subject combinations:** absent for all programmes except Insurance, Project Management, Taxation, and Transport Management. This is an admission-data omission, not evidence for a domain link.
- **P11 programme-specific minimum graduation units:** not stated for Accounting, Finance, Business Information Technology, Employment and Human Resource Management, Information Resource Management, Office and Information Management, Project Management, Public Administration, Securities and Investments Management, Taxation, and Transport Management. Confirm whether the discipline-level 120-unit standard applies, but keep this separate from course/domain mapping.
- **Employment and Human Resource Management:** P3-P8 narrative sections are absent or not found. The programme section around source pages 183-207 requires a full read. This is a mapping/content blocker because the programme has no complete programme-level explanation, even though its course rows exist.
- **Insurance and Local Government and Development Studies:** no single programme-specific P10 duration paragraph was found.
- **Actuarial Science P6:** item 1 contains the literal editorial note `(to be corrected)`.
- **Aviation Management P6:** refers to Business Administration graduates, apparently copied from another programme.
- **Hospitality and Tourism Management P1:** programme heading says `Hotel and Tourism Management` while the programme table says `Hospitality and Tourism Management`. Preserve the programme identity chosen by the CCMAS table and record the heading alias.
- **Petroleum Information Management P3:** contains the apparent phrase `designed to rumor produce`.
- **Public Administration P5:** item 6 contains an unclosed square bracket.
- **Electives:** all stored Administration/Management course rows are marked core. Hospitality and Tourism has two named 400-level pathways, but the courses within them are core. Preserve pathway membership; do not label pathway courses as electives.

### Agricultural Science — `Agriculture-2023.pdf`

- **D5 discipline learning outcomes:** no standalone discipline-level list.
- **P9b UTME combinations:** not stated for the 13 programmes.
- **Fisheries and Aquaculture P11:** Direct Entry figure is printed as `40`; confirm whether this is a source error or a real requirement. Do not silently change it to 90.
- **Horticulture and Landscape Management P11:** Direct Entry credit units are not stated.
- **Water Resources Management P10:** no explicit duration paragraph; the duration was inferred from the overview. Confirm or keep as inferred.
- **Agricultural Economics P11:** wording is ambiguous and requires source transcription before a numerical rule is stored.
- **Discipline preamble D3:** contains a copy/paste reference to Administration and Management Science.
- **B. Agriculture:** 500-level has three named specialisation pathways. Verify that pathway-specific courses remain separate from the shared curriculum.

### Allied Health Sciences — `Allied-Health-Sciences-2023.pdf`

- P11 is not stated for Dental Technology, Dental Therapy, Environmental Health Science, Medical Laboratory Science, Nursing Science, Human Nutrition and Dietetics, Occupational Therapy, Optometry, Pharmacology, Physiotherapy, Prosthetics and Orthotics, Radiography, and Speech-Language Therapy.
- The current structured CCMAS JSON has course rows, but the programme-level missing P11 values are not represented there. Store an explicit null/source-missing state if programme metadata is exposed.
- The source extraction records all courses as core; do not infer specialisation electives from a general statement that institutions may create local electives.

### Architecture — `Architecture-CCMAS-2023-FINAL.pdf`

- Programme 2 has no separate P4 programme philosophy section.
- The existing extraction notes recommend a direct P13/P14 spot check for programmes 2-6. Complete that check before claiming every architecture course outcome/content is source-verified.
- Institution-specific electives are not supplied by CCMAS; they must not be fabricated in the CCMAS layer.

### Arts — `Arts-CCMAS-2023-FINAL.pdf`

- P9b UTME combinations are not found for the Arts programmes listed in the extraction notes. This is admission metadata only.
- Before mapping any Arts variant by course anchors, verify the P12/P13/P14 rows for the programme concerned; a missing P9b does not justify borrowing a neighbouring programme's curriculum.

### Basic Medical Sciences — `Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf`

- D5 discipline learning outcomes are not present.
- P9b UTME combinations are not present for Human Anatomy and Physiology.
- `ANA 301/302` and `PIO 303` require course-code verification before using code-level joins.

### Communication and Media Studies — `Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf`

- P9b UTME combinations are not listed for all nine programmes.
- Keep programme-level course content separate for Advertising, Broadcasting, Development Communication Studies, Film and Multimedia, Information and Media Studies, Journalism and Media Studies, Mass Communication, Public Relations, and Strategic Communication. Do not use a shared communication label as proof that all nine curricula are identical.

### Computing — `Computing-CCMAS-2023-FINAL.pdf`

- D5 discipline learning outcomes are absent.
- P9b UTME combinations are absent for all seven programmes.
- P7 employability skills are narrative paragraphs for Computer Science, Data Science, ICT, Information Systems, Information Technology, and Software Engineering; only Cybersecurity has a numbered list. Preserve the narrative rather than presenting a fabricated numbered list.
- P8 has apparent duplicated items in Data Science, ICT, and Software Engineering. Verify whether these are source duplicates or extraction duplication.
- ICT SIWES II is `ICT 398` in the table header and `ICT 399` inline.
- `ICT 298`, `INS 299`, and `INS 399` have no numbered learning outcomes in the source.
- `DTS 304` outcomes differ between Information Systems and the Computer Science/Data Science versions.
- `IFT 212` outcomes differ between Software Engineering and the Computer Science/Information Technology versions.
- Software Engineering `COS 102` is 3 units with PH 45 and a different title, while other programmes show 2 units with no PH; `COS 409` is 3 units rather than 2.
- All courses are core in the document. The document refers to electives in graduation language but does not define elective courses or pathways. Do not derive elective mappings from that wording.

### Law — `Law-ALL.pdf`

- **FLAG A:** glossary p.15 says `PHY 105`; tables and contents use `PHL 105`. Use an explicit alias, not a silent correction.
- **FLAG B:** Common and Islamic Law `ICL 101`: P12 p.57 says 2 units/LH 30; P13 p.63 says 3 units/LH 45.
- **FLAG C, critical:** Common and Islamic Law `ICL 304`: P12 pp.57-58 says Enterprise Appreciation, 2 units/LH 30; P13/P14 pp.73-74 says Islamic Family Law, 3 units/LH 45.
- **FLAG D:** `JIL 501`, `JIL 502`, `PPL 501`, and `PPL 502`: p.59 table gives LH 60 with no PH column; contents give LH 45/PH 45.
- **FLAG E:** `LAW 599`: Common and Islamic Law p.59 gives LH 270 with no PH; the LL.B table gives LH 45/PH 45; contents do not resolve it.
- **FLAG F:** `ENT 211`: PH is blank in the Common and Islamic Law table but 15 in the LL.B table.
- **FLAG G:** contents p.73 labels the course only `301: Mu'amalat`; the P12 table identifies it as `ICL 301`.
- Additional source checks: duplicate `CLE 401/CLE 402` titles, `ICL 203` singular/plural title variation, a typo in PUL 201 outcomes, ICL 403 title variation, and likely `AI-Fiqh` versus `Al-Fiqh`.
- `LAW 599` has no learning-outcome list or course-content description beyond administrative text. Keep this as source-missing, not as an empty skills list.

### Medicine and Dentistry — `Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf`

- P9b UTME combinations are not stated for MBBS/MBChB or BDS/BChD.
- P11b Direct Entry graduation credit units are not stated for either programme.
- BDS objectives contain the repeated word `discussing` where the source wording may intend `understanding`. Preserve the source wording until verified.
- No elective courses are defined; all courses are compulsory.

### Pharmacy and Pharmaceutical Sciences — `Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf`

- D3, D4, D5, D6, and P9b are marked not found in the source extraction.
- PHY 108 in both B.Pharm and Pharm.D is described as a continuation of PHY 107 and has no separate learning outcomes/content block. Store it as a continuation/source limitation, not a fabricated standalone course description.
- No elective courses are defined.

### Sciences — `Sciences-CCMAS-2023-FINAL.pdf`

- D5 contains an apparent copy/paste artefact from Administration and Management.
- P9b is not stated for the listed programmes, including Biochemistry, Biology, Biotechnology, Botany, Chemistry, Industrial Mathematics, Maritime Science, Mathematics, Medicinal Chemistry, Meteorology, Microbiology, Physics with Electronics, Physics, Science Laboratory Technology, Statistics, and Zoology.
- Biology P11b does not quantify the Direct Entry minimum units.
- Environmental Management and Toxicology P10 has dual sub-tracks with different programme lengths; its P11b Direct Entry minimum is not stated.
- Applied Geophysics P10 has dual 4-year/5-year tracks.
- Brewing Science and Technology P10 allows university-dependent 4/5-year delivery.
- Physics P10 has dual 4-year/5-year tracks.
- Forensic Science P4 contains duplicated wording; Brewing Science and Technology P5 has a sentence split across numbered items; Geology P8 repeats `Innovation`.
- Petroleum Chemistry P3 explicitly mentions elective/optional courses. Verify the actual P12 status/pathway rows before treating them as electives.
- Science Laboratory Technology has eight options sharing a 100-level foundation. Preserve option scope in downstream mapping.

### Social Sciences — `Social-Sciences-CCMAS-FINAL-2023-A.pdf`

- D5 is absent as a standalone discipline list; P9b is not stated for the 14 programme sections.
- Library and Information Science appears as a full section on pp.136-158 but is absent from Table 1.1 and the glossary. This is a programme identity/classification issue, not merely a display typo.
- LIS has code mismatches `LIS 211/212`, `LIS 322/225`, `LIS 418/321`, and `LIS 424/419`; `LIS 228` has no content entry; `LIS 316` and `LIS 321` appear in contents but not the table. `LIS 317` is the only E-status course in the Social Sciences document.
- `IRS 101` and `IRS 104` have LH 60 in the table while content gives 30 or does not agree.
- `PCR 204` has table LH `3`, likely a truncated `30`; verify, do not assume.
- IRS 400-level content contains two `SSC 401` entries, one apparently the research project.
- `PEP 123`, `PEP 212`, and `PEP 412` have table/content unit or code discrepancies.
- `POL 312` is labelled `POL 311` in content.
- PPE has code/title differences `ECO 103/ECO 107`, `ECO 111/ECON 311`, and `POL 406/POL 404`; `PPE 499` is printed as `Long Easy` and likely means `Long Essay`.
- PPE has no P13/P14 content for `PHL 301`, `PHL 302`, `PHL 305`, or `PHL 306`.
- PPE P12 omits `SSC 202`, `SSC 301`, `SSC 302`, and `SSC 401`; confirm whether these are omitted common courses or intentionally excluded.
- Social Work `SWK 213`, `SWK 214`, and `SWK 312` table units differ from content units; Sociology `SOC 201` and `PSY 204` have table/content unit or LH differences.
- Social Work has `B. Sc. Social Work` in the section heading versus `B.Sc.` in Table 1.1.

### Veterinary Medicine — `Veterinary-Medicine-CCMAS-2023-FINAL.pdf`

- D5 is absent.
- P9b UTME combinations and P11 minimum graduation units are not stated.
- `VRP 608` has course contents but no learning outcomes.
- P11 can be calculated from the tables as 224 units, but the source does not state that total as a graduation requirement. Do not promote the calculated value to a source fact.
- Verify `VPM 507/508` and `VCH 501/502` versus `VCH 503/504` code discrepancies.
- The structured record now includes the previously omitted P12 rows `VPM 505` and `VSR 507`, and separates the content that had been appended to `VSR 506` and `VEX 599`; those extraction repairs are provenance-tagged and do not silently resolve the remaining code conflicts.
- D3/D4 were taken from the programme section because no separate discipline-level section was found; retain that provenance.

## Additional code collisions found in the current structured records

These were found by grouping course rows by `(discipline, programme, course code)` and finding more than one different title under the same code. They are not all confirmed source errors: some may be legitimate repeated practical/lecture labels or option rows. Every one must be checked in the original PDF before code-based joins are used.

| Discipline/programme | Code collision to inspect |
|---|---|
| Administration / Hospitality and Tourism Management | `HTM 403`: Foodservice and Tourism Management vs Tourism and Foodservice Management; `TRM 408`: Tourism Economics, Trade & Marketing appears in both pathways; `HTM 410`: Tourism and Hospitality Administration appears in both pathways |
| Administration / Information Resource Management | `IRM 202`: Conservation & Preservation of Information Resources vs Information System Analysis, Design and Evaluation |
| Administration / Taxation | `TAX 311`: Entrepreneurship in Taxation vs Revenue Law and Practice |
| Agriculture / Horticulture and Landscape Management | `HLM 301`: Plant Propagation and Nursery Management (Lecture) vs Nursery/Seedling Production and Management (Practical); `HLM 303`: Farm Mechanization and Workshop Practices (Practical) vs Greenhouse Use and Management (Lecture) |
| Agriculture / Water Resources Management and Agro-Meteorology | `WMA 308`: Agro-Meteorology vs Practical Year Experience Report |
| Allied Health / Pharmacology | `PHA 301`, `PHA 302`, and `PHA 312` each have multiple different titles under one code |
| Allied Health / Physiotherapy | `PST 201`, `PST 311`, `PST 313`, and `PST 411` each have multiple different titles under one code |
| Allied Health / Nursing Sciences | `NSC 201`, `NSC 314`, and `NSC 406` each have multiple different titles under one code |
| Allied Health / Complementary and Alternative Medicine | `CAM 302`: Naturopathy II vs Introduction to Osteopathy |
| Allied Health / Speech-Language Therapy | `SLT 513`: Communication Skills and Ethics vs Autism Spectrum Disorders |
| Arts / English Language and Literature | `ENG 306`: Discourse Analysis vs `Discourse Analysis; Same as ENG 306` |
| Arts / Modern European Languages (Russian) | `RUS 361`: Oral Expression and Comprehension in Russian vs Advanced Studies in Russian Phonetics |
| Arts / Theatre Arts | `GST 212` has punctuation/title variants; `FAC 201` has a title variant with a trailing unit marker |
| Basic Medical Sciences / Human Anatomy | `ANA 301`: Gross Anatomy of Head & Neck vs Neuroanatomy |
| Engineering / Petroleum Engineering | `GET 399`: SIWES I vs SIWES II |
| Environmental Sciences / Building | `BUD 221`: Building Construction and Materials III vs Building Construction & Materials II |
| Environmental Sciences / Fine and Applied Arts | `FAA 231`: Introduction to Two-Dimensional Art and Design vs Introduction to Digital Art and Design |
| Environmental Sciences / Geography | `MTH 101`: Elementary Mathematics I vs Elementary Mathematic I |

For each collision, the manual record must state whether the source has a reused code, a table/content mismatch, an option/pathway distinction, or a parser duplication. If it is a source reuse, the structured layer needs a stable row identity that is not the course code alone.

## Current mapping impact measured from the repository

The current programme/domain evidence contains **1,683 active records**. The 375 weak or ambiguous links that lacked a source-backed CCMAS course anchor were moved to `unverified_links` and removed from active guidance. The current generator marks **0 active programme-domain evidence records** for source review.

Affected programme counts are:

| CCMAS programme | Evidence records |
|---|---:|
| Administration: Aviation Management | 4 |
| Administration: Business Administration | 10 |
| Administration: Business Information Technology | 4 |
| Administration: Co-operative and Rural Development | 1 |
| Administration: Finance / Banking and Finance | 16 |
| Administration: Hospitality and Tourism Management | 9 |
| Administration: Information Resource Management | 2 |
| Administration: Marketing | 6 |
| Administration: Office and Information Management | 1 |
| Administration: Petroleum Information Management | 3 |
| Administration: Project Management | 2 |
| Administration: Public Administration | 3 |
| Administration: Securities and Investments Management | 12 |
| Administration: Taxation | 8 |
| Administration: Transport Management | 2 |
| Computing: Data Science | 3 |
| Computing: Information Systems | 1 |
| Computing: Software Engineering | 2 |
| Law: Law | 2 |
| Law: Common and Islamic Law | 2 |
| Social Sciences: Criminology and Security Studies | 6 |
| Social Sciences: International Relations | 2 |
| Social Sciences: Library and Information Science | 2 |
| Social Sciences: Petroleum Economics and Policy Studies | 9 |
| Social Sciences: Politics, Philosophy and Economics | 13 |
| Social Sciences: Psychology | 1 |
| Social Sciences: Social Work | 5 |
| Social Sciences: Sociology | 5 |
| Medicine and Dentistry: MBBS/MBChB | 11 |
| Medicine and Dentistry: BDS/BChD | 14 |
| Veterinary Medicine: Veterinary Medicine | 13 |

Until the source states are resolved, these links should be shown in the audit as **review-required**, not as fully source-verified programme/domain mappings.

## Findings that are not mapping blockers by themselves

The following should still be recorded if the UI exposes them, but they do not alter programme-to-domain concepts unless the disputed title/code is used as a course anchor:

- unit, lecture-hour, and practical-hour differences where the course title and content are identical;
- missing P9b UTME combinations;
- missing graduation-unit totals;
- absent discipline-level D5 when programme/course outcomes are available;
- typographical punctuation, unclosed brackets, and wording errors that do not change a course identity;
- institution-specific elective lists not provided by CCMAS;
- programme duration ambiguity where the course curriculum itself is unchanged.

## Required correction order

1. Resolve the 14 stop-ship mapping findings above, starting with `ICL 304`, Finance, Business Administration, PIM, PRM, Taxation, LIS, PPE, and the Veterinary/Medicine code aliases.
2. For each affected course, preserve both raw source values and the chosen canonical value; never overwrite a contradiction without an audit note.
3. Add explicit states to the structured CCMAS record: `source_missing`, `source_conflict`, `content_only`, `table_only`, `alias`, or `verified`.
4. Re-run the CCMAS programme/domain evidence builder after canonical course identities are resolved.
5. Rebuild every JAMB mapping that inherits an affected CCMAS programme. A JAMB name must inherit the corrected curriculum scope, not the old course-title fan-out.
6. Run the mapping audit and confirm that no affected programme still relies on an unverified course code/title.
7. Only then address the separate JAMB source packet. Missing CCMAS P9b values must not be filled from the JAMB brochure during this CCMAS audit.

## Completion record

### Initial direct verification completed

```text
STATUS: source_conflict
PDF PAGE/SECTION: Law-ALL.pdf, printed pp. 57-58 and 73-74
TABLE OR COURSE CODE: ICL 304
RAW SOURCE TEXT: P12 lists "ICL 304 Enterprise Appreciation 2 C 30 -"; P13/P14 lists "ICL 304: Islamic Family Law (3 units C: LH 45)" and supplies family-law learning outcomes/content.
CANONICAL VALUE, IF ANY: unresolved; retain both values until the source owner confirms the authoritative curriculum entry
MAPPING IMPACT: blocker
FOLLOW-UP: do not use the current ICL 304 row as final Common and Islamic Law domain evidence
```

### Initial structured correction completed

`Taxation` `ACC 101` and `ACC 102` were not truly title-less: the source explicitly cross-references the Accounting programme's P13/P14 content, while the Taxation 100-level table is duplicated (one variant includes those rows and one omits them). The structured rows now carry `Financial Accounting I/II`, the source units/contact hours, `source_state: content_cross_reference`, and the Accounting source reference. The duplicate Taxation table remains flagged; `TAX 311` remains unresolved because the source reuses that code for two different courses.

The following structured states were also added after checking the source sections: `FIN 102` is explicitly `source_missing`; `BUA 200` is `content_only`; `PIM 310/312/412/413/414` are `content_only`; `PRM 408` is `source_missing`; and the two `TAX 311` rows plus `TAX 411/421` are `source_conflict`. These states prevent a missing or table-only row from being mistaken for a fully verified curriculum course.

For `ICL 304`, the P12 display title remains `Enterprise Appreciation` and the contradiction remains unresolved for source publication. A separate `mapping_title: Islamic Family Law` is now used only by curriculum/domain evidence because the P13/P14 section supplies the complete Islamic Family Law content. The evidence record still carries the source-conflict flag, so the link remains review-required.

Direct source checks supporting those states:

| Course/state | Original PDF evidence |
|---|---|
| `FIN 102` / `source_missing` | Administration PDF Finance P12 table p.235 contains the 3-unit row, but the source's P13/P14 section states that no title, learning outcomes, or contents were found. |
| `BUA 200` / `content_only` | Business Administration P12 pp.133-134 does not include the row; P13/P14 pp.139-140 contains `BUA 200: Introduction to Financing (3 Units C: LH 45)`. |
| `PIM 310`, `PIM 312`, `PIM 412`, `PIM 413`, `PIM 414` / `content_only` | PIM course-content pages 451-457 contain the named courses, while the P12 table omits them. The extraction must preserve them without treating them as confirmed P12 rows. |
| `PRM 408` / `source_missing` | Procurement Management pp.466-480 lists `PRM 408 (Case Studies)` in the course structure summary but has no learning-outcome or contents block. |
| `ACC 101/102` in Taxation / `content_cross_reference` | The Taxation 100-level table is duplicated on pp.560-561; the Accounting P13/P14 section supplies `Financial Accounting I/II`, 3 units, LH 30, PH 45. |
| `TAX 311` / `source_conflict` | Taxation P12 lists the same code for Revenue Laws and Practice and Entrepreneurship in Taxation. |

The Finance code mismatch is also now represented on every affected P13/P14 row (`FIN 202`, `FIN 204`, `FIN 209`, `FIN 210`, `FIN 215`, `FIN 216`, and `FIN 217`) as `source_conflict`; their titles and content are retained, but code-level joins must wait for a table-to-content reconciliation.

The two Taxation `TAX 311` rows now have stable identities (`TAX 311::Revenue Law and practice` and `TAX 311::Entrepreneurship in Taxation`). Evidence records also carry a `course_identity` so duplicate source codes cannot be silently collapsed during later domain joins.

For PPE, `PHL 301`, `PHL 302`, `PHL 305`, and `PHL 306` now carry `source_missing` states because they appear in the P12 table but have no P13/P14 content. The four common-course omissions (`SSC 202`, `SSC 301`, `SSC 302`, `SSC 401`) are preserved as `source_omitted_courses` rather than silently added to the PPE curriculum.

The Law resolution metadata was also corrected: `ICL 101` remains an owner-review source conflict, and the JIL 501/502 resolution now distinguishes the corroborated missing PH value (45) from the still-disputed LH value (60 versus 45).

For every item above, record one of these outcomes directly in this document during the manual pass:

```text
STATUS: verified | source_missing | source_conflict | extraction_gap | source_typo | deferred
PDF PAGE/SECTION:
TABLE OR COURSE CODE:
RAW SOURCE TEXT:
CANONICAL VALUE, IF ANY:
MAPPING IMPACT: none | review | blocker
FOLLOW-UP:
```

The active mapping audit is complete: every **M-01 through M-15** item now has either a source-backed reconciliation or an explicit source-missing/extraction limitation, and no unresolved item is used to certify an active domain link. Remaining display-only and admission-field omissions stay recorded as source limitations rather than being invented.
