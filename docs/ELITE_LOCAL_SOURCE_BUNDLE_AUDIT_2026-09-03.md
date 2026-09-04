# Local source-bundle audit

**Review date:** 3 September 2026  
**Purpose:** record what the additional local downloads contain and how they
may be used in the elite-domain, role, competency, and pathway review.

The bundles remain outside the repository. Their filenames, checksums, and
relevant contents are recorded here so the review can distinguish a checked
source document from an unreviewed archive.

## Bundle findings

| Bundle | What was verified | How it may be used |
|---|---|---|
| `db_31_0_text.zip` | O*NET 31.0, August 2026 release. It contains 1,016 occupation records, 54,269 reported titles, 18,838 task statements, 165,780 task ratings, 31,821 software-skill rows, 18,200 essential-skill rows, 45,500 transferable-skill rows, 11,495 education rows, 26,812 training/experience rows, and 923 job-zone rows. | Use it for exact occupation title matching, task and tool evidence, preparation signals, and role-level competency ordering. It must not be used as Nigerian demand evidence. |
| `professional bodies docs.zip` | 183 archive entries: 180 PDF documents and two nested ZIP archives, plus the archive directory entry. It contains route, competency, occupation, and sector documents for finance, risk, accounting, artificial intelligence, robotics, neuroscience, game development, software, real estate, health, and other fields. | Use the named professional or specialist document at page level for role identity, competencies, examinations, professional progression, and pathway steps. A filename alone is only a registry reference. |
| `professional bodies docs` | The extracted directory corresponding to the professional-body collection. | Use for the same page-level review as the archive; do not count both copies as separate evidence. |
| `professional bodies 2` | 64 files, including Institute of Chartered Accountants of Nigeria material, Financial Risk Manager guides and learning objectives, Professional Risk Managers’ International Association material, Society of Actuaries competency taxonomy, and related actuarial and finance documents. | Use for finance, accounting, risk, and actuarial role/subgroup competencies, credential stages, and route requirements. |
| `ECSF-main.zip` | European Cybersecurity Skills Framework web tool, version 1; metadata says released 19 September 2022 and last edited 11 April 2025. The machine-readable framework includes role profiles, deliverables, main tasks, key skills, key knowledge, and European competences. | Use to enrich cybersecurity role identity, deliverables, tasks, and progression. It is a global role framework, not Nigerian demand or a Nigerian licence. It is now registered as `global_ecsf` for cybersecurity source resolution. |
| `drive-download-20260814T165448Z-1-001.zip` | Twelve PNG images. Eleven are 1,536 × 1,024 and one is 1,024 × 1,536. No text or occupational metadata was inferred from the filenames. | Treat as visual/reference material only until a human identifies the screens or documents represented. It cannot establish a domain, role, competency, certification, or market claim. |

## O*NET duplicate check

The SHA-256 checksum of `db_31_0_text.zip` is:

```text
6883548ADF5FDE64CF6F801B35D15519C9225F2732C3CAB0E281C652D16B23A9
```

The repository’s retained O*NET 31.0 archive has the same checksum. Therefore
the new download is not a new O*NET release and must not be imported as a
second copy. It confirms that the repository’s O*NET version is the intended
August 2026 release.

## Documents that add useful review evidence

These are the most relevant files identified in the professional-body bundles.
They are evidence candidates, not automatically accepted mappings:

| File | Review target |
|---|---|
| `ai-in-nigeria-whitepaper.pdf` | Nigerian artificial-intelligence context, opportunities, constraints, and strategic route language. It does not by itself prove a Nigerian vacancy count or a licence. |
| `2021_CPN_Examination_Syllabus(Reviewed).pdf` | Computer Professionals Registration Council of Nigeria examination and certification content. It can support Nigerian information-technology competency and credential context where the role actually falls within that route. |
| `Becoming-a-Robotics-Engineer-article.pdf`, `market-intelligence-report-advanced-robotics.pdf`, `Connected-Robotics_-postition-paper-16-10-2025.pdf`, and `Preparing the Advanced Manufacturing Workforce A Study of Occupation and Skills Demand in the Advanced Robotics Industry (2021).pdf` | Robotics definitions, role families, technology focus, and workforce competencies. The 2008 market report is historical and cannot be presented as current demand. |
| `DMD-Job-Role-Taxonomy.pdf` | Digital manufacturing and design role taxonomy and ecosystem boundaries. It can refine manufacturing and robotics subgroup/role identity. |
| `Credit-Risk-Analyst-Job-Description.pdf` | Concrete credit-risk tasks, outputs, collaboration, monitoring, and reporting. It is one role example, not a universal standard. |
| `cfa-institute-career-guide.pdf`, `cfa-program-guide-brochure-v3-web.pdf`, and `cfa-program-skills-by-level_2026.pdf` | Investment and portfolio role preparation and credential progression. The credential route must remain separate from a claim that every investment role requires it. |
| `FRM-Candidate-Guide-2025_compressed-compressed.pdf` and `frm-learning-objective-26.pdf` | Financial-risk credential stages and the knowledge areas assessed in 2025/2026. Useful for risk subgroups and role bridges. |
| `2019-ICAN-SYLLABUS.pdf`, `2025_ICAN_COMPENDIUM.pdf`, and `ICAN 2025 STUDY TEXT - FM - QC.pdf` | Nigerian accounting-body material. The syllabus or official route document is stronger evidence for requirements than a general study text. |
| `2020-neuroscience-career-brochure-pdf.pdf`, `caps_guide_for_what_i_can_do_with_a_degree_in_neuroscience.pdf`, and `Neuroscience-Nurses-Career-Pathway-1st-Ed-2025.pdf` | Distinguish research, clinical, nursing, communication, and public-health routes in neuroscience. They must not be collapsed into one generic role path. |
| `Game Development and Production.pdf`, `IGDA_Game_Crediting_Guide_Draft_9-2-EN-2014.pdf`, and `A_Gaming_Company_Structure.pdf` | Game-production role identity and studio structure. Draft or educational sources do not establish Nigerian employment volume. |
| `soa-competency-taxonomy-0412.pdf` and the actuarial candidate and career guides | Actuarial competencies and progression. These can support actuarial role/subgroup ordering and should be reconciled with Nigerian actuarial evidence. |

## How these sources change the current review

1. O*NET does not change the source version or the role spine. It strengthens
   the role-level evidence already expected by the repository and confirms that
   tasks, software, essential skills, transferable skills, education, and
   training can be joined by the exact O*NET-SOC code.
2. The professional-body bundles can improve the finance, risk, accounting,
   robotics, artificial-intelligence, neuroscience, game-development, and
   related role/subgroup records. Each improvement must cite the specific file,
   page or section, entity, and claim type.
3. The bundles do not turn every field into an elite domain. A professional
   qualification may establish a route or barrier for one role while leaving
   the broader domain ordinary, mixed, or not established.
4. The European Cybersecurity Skills Framework improves the cybersecurity role
   and competency evidence. It does not justify adding cybersecurity to the
   current elite-domain list; that remains a separate evidence decision.
5. The image bundle is not used for data enrichment until its contents are
   identified. No labels, mappings, or claims are inferred from opaque image
   filenames.

## Required next extraction step

For every document selected for production enrichment, record:

```text
source identifier
exact filename
publisher or issuing body
publication/version date
page or section
exact claim extracted
entity affected
claim type: identity | task | competency | credential | regulation | route | market signal
scope: Nigeria | global | Nigeria → global
limitation
```

Only after this page-level record exists may the claim update a domain,
subgroup, role, competency, tool, certification, elite review, or pathway
seed.
