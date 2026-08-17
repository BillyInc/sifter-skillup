# Internet and resource coverage audit

Date: 2026-08-17

## Decision

SQL regeneration remains blocked. The domain list is populated, but the
field-level evidence is not complete enough to present every role, skill,
competency, certification, learning provider, or professional body as fully
source-backed career guidance.

## What the repository already contains

The source work was not invented in this pass. The source registry already
records **95 source entries**, including:

- SFIA 9;
- NICE Framework;
- ENISA/ECSF cybersecurity role profiles;
- Business Analysis Competency Model;
- CIPM Body of Knowledge and competency framework;
- SPE competency and practice material;
- ESCO occupation and skill taxonomy;
- O*NET occupation, task, skill, technology and job-zone data;
- ILO ISCO-08 grouping;
- World Economic Forum Future of Jobs role signals;
- Nigerian job-feed samples from MyJobMag;
- GitHub Innovation Graph country and technology activity data;
- sector and professional sources for health, agriculture, engineering,
  supply chain, procurement, project delivery, aviation, maritime, energy,
  nuclear, creative work, game development, XR, robotics and education.

The earlier audit document does contain a literal **15-anchor checkpoint**.
That number came from the repository's original Nigerian web-audit work; it
was never a complete count of all source material. The current registry has
95 source entries, and the web evidence file now contains 42 verified anchor
records after the focused 2026-08-17 search.

The separate Nigerian professional-body catalogue now contains **151 body or
agency records**. **129 distinct body IDs** remain assigned to at least one
domain in the current 160-domain visible set. The remaining 22 are catalogued
sources that are not currently attached to a visible domain row; six of the
new records belong to the seven trade/creative rows that are audited
separately below.

## Correct interpretation of the 160 domains

The statement that the domains have no professional bodies is incorrect. The
current evidence matrix attaches at least one Nigerian body, regulator,
government agency, education body, or sector body to each audited visible
domain. The current `domain_meta.json` contains 168 entries. The source audit
uses eight hidden IDs (`D086`, `D087`, `D088`, `D089`, `D100`, `D101`, `D108`
and `D113`) to preserve the current 160-domain user-facing scope. The seven
non-gambling rows in that hidden set have now been separately internet-audited
and are recorded in `supplemental_hidden_domain_coverage`; they must not be
reported as unsearched.

The field-level matrix also reports Nigerian named skills, competencies and
certification signals for **160/160 visible domains**. This means the platform
has local context to show; it does not mean every signal has a separately
reviewed regulator page, individual licence, exam route or current fee.

Across the 129 distinct body IDs assigned to the current non-excluded domain
set, the classifications are:

| Evidence type | Assigned body IDs |
| --- | ---: |
| Regulator | 40 |
| Professional association | 35 |
| Government context | 27 |
| Professional body | 16 |
| Sector skills body | 4 |
| Education regulator | 4 |
| Legal education body | 1 |
| Sports body | 2 |

This does **not** mean every attached body is a professional regulator, that
every body has a licence, or that every body publishes a complete role and
competency dictionary. A body homepage is useful context; it is not evidence
of a specific role competency, examination, licence, or fee until the relevant
official page has been reviewed. The product must preserve that distinction.

## Official web evidence confirmed

These official pages confirm that the Nigerian layer can supply usable skills,
competencies, roles, training, examinations, registration or licensing data:

- [CPN examination syllabus](https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf)
- [CPN examination and syllabus listing](https://www.cpn.gov.ng/metro/?show=52)
- [COREN professional proficiency unit](https://coren.gov.ng/ppdc-unit/)
- [COREN registration guidance](https://coren.gov.ng/guidelines-for-registration-of-engineers/)
- [COREN training and certification](https://coren.gov.ng/certification-and-training/)
- [CIPM competency framework](https://cipmnigeria.org/wp-content/uploads/2023/12/CIPM-BoK-and-Competency-Framework-2023.pdf)
- [CIPM competency assessment curriculum](https://cipmnigeria.org/hrpl-competency-assessment-curriculum/)
- [CIBN competency framework](https://www.cibng.org/introduction-to-competency-framework/)
- [ANAN](https://anan.org.ng/)
- [CITN examination syllabus](https://portal.citn.org/examination-syllabus/)
- [CITN professional competence assessment](https://portal.citn.org/2026apriltpc-preseen/)
- [CIIN examination handbook](https://ciinigeria.org/wp-content/uploads/2023/02/Examination-Handbook.pdf)
- [ARCON registration guidance](https://arconigeria.gov.ng/registration-guidelines)
- [NMCN licensing](https://nmcn.gov.ng/licensing.html)
- [NMCN registration](https://www.nmcn.gov.ng/unitreg.html)
- [PCN pharmacist registration](https://pcn.gov.ng/registrations/pharmacist/)
- [MDCN regulation and licensure](https://mdcn.gov.ng/page/about-us/mdcn-act-other-regulation)
- [ARCN](https://arcn.gov.ng/)
- [AAAI Nigeria](https://aaai.org.ng/)
- [CORBON](https://www.corbon.gov.ng/aboutUs)
- [CORBON construction NOS index](https://www.clmis.corbon.gov.ng/nos)
- [CORBON plumbing NOS](https://www.corbon.gov.ng/resources/PLUMBING%20IN%20CONSTRUCTION.pdf)
- [NAHBPON hair and beauty practitioners](https://nahbpon.com/about-nahbpon/)
- [APSMAN spa and medical aesthetics](https://apsman.org/)
- [POSBAN spa and beauty practitioners](https://posbann.com/about-us/)
- [CIPPON professional printers](https://www.cipponinstituteedu-ng.org/about.html)
- [Society of Printing Practitioners of Nigeria](https://sppn.com.ng/)
- [SON product certification](https://www.son.gov.ng/son-product-certification/)
- [BUMPAN building materials producers](https://bumpanng.com/)
- [Nigerian Institute of Building](https://niobnat.org/)
- [NAFD funeral-service education](https://www.nafd.org.uk/education/nafd-education-and-training/)
- [CILT Nigeria](https://ciltnigeria.org/)
- [NABTEB](https://nabteb.gov.ng/)
- [Data Science Nigeria](https://datasciencenigeria.org/)

The global learning catalog also contains official destinations such as
[MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development),
[MIT OpenCourseWare](https://ocw.mit.edu/),
[IBM SkillsBuild](https://skillsbuild.org/students),
[AWS Skill Builder](https://aws.amazon.com/training/digital/),
[Google Cloud Skills Boost](https://www.cloudskillsboost.google/subscriptions),
[Coursera](https://www.coursera.org/courseraplus/),
[W3Schools](https://www.w3schools.com/),
[Udemy](https://support.udemy.com/hc/en-us/articles/229232707-Currencies-FAQ),
[freeCodeCamp](https://www.freecodecamp.org/learn/), and
[3MTT Nigeria](https://3mtt.nitda.gov.ng/).

## Current blockers

1. `nigerian_remaining_body_web_evidence.json` has 44 supplemental direct-page
   review records. The original domain source audit already contains evidence
   rows for all 129 body IDs assigned to visible domains; 85 of those assigned
   IDs have not yet received the supplemental review. Twenty-two catalogued
   body IDs are not attached to a visible domain row. These are different
   states and must not be reported as "no professional body data".
2. The corrected role audit reports 49 intentionally flat visible domains
   whose only structural review reason is `no subgroups`; it reports **zero
   roles without any source signal**. Those flat domains still need a product
   decision about how much local detail to show, but they are not an
   unsupported-role gap.
3. `certs_enrichment.csv` contains only 20 certification enrichment rows across
   3 domains. It cannot support direct links and price guidance across every
   visible domain.
4. `tools_demand.csv` contains 46 tool rows across 5 domains. Existing tool
   URLs therefore do not cover every domain, subgroup and role tool layer.
5. `skills_uris.csv` provides ESCO reference URIs. It is not a learning
   provider catalogue and does not prove Nigerian demand or competence.
6. Existing certification and tool URLs are useful click-through fields, but
   the resource population still needs source review before it can be treated
   as complete learner guidance.
7. Some body homepages do not publish a structured competency framework. They
   must be classified as context, membership, training, regulator or
   credential evidence rather than copied into every role as role-level data.
8. The focused audit found no verified Nigerian statutory or national
   professional body for funeral services. International funeral education is
   available and is recorded as international-only evidence; the student UI
   must not present it as a Nigerian licence or local credential.

## Resource completeness gate before SQL

SQL may be regenerated only after the population pass proves:

- every visible domain has a source-backed overview or Nigerian context record;
- every visible domain has source-backed role records or an explicit reviewed
  limited-evidence state;
- domain, subgroup and role skills, tools and certifications have provenance;
- every clickable link has a valid HTTPS URL;
- every fixed price has a source URL and observation date;
- dynamic prices are represented as "check provider" rather than fabricated;
- regulator/licence status is not conflated with association membership;
- the student-facing API can return resources at domain, subgroup and role
  level.

The generated learning population now passes its mechanical URL, price-date
and minimum-coverage checks, but these source reconciliation gates are still
open. No generated seed SQL should be treated as complete or ready for
Supabase until they close.
