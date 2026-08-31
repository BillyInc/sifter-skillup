# Career enrichment evidence audit — 2026-08-29

This is the current evidence hand-off for the domain → subgroup → role
guidance catalogue. It is intentionally separate from the SQL seed gate:
having a source-backed record does not mean that its SQL has been deployed.

## What is currently populated

The counts below were recalculated from the current repository inputs, not copied
from an older report.

| Entity layer | Current visible count | Source-backed description/context | Nigerian item enrichment |
|---|---:|---:|---:|
| Domains | 160 | 160/160 have a plain-language description and a valid Nigerian context record | 160/160 |
| Subgroups | 486 | 486/486 have a subgroup label, description/context record, and source metadata | 485/486 |
| Roles | 5,050 | 5,050/5,050 have a source-backed occupation explanation in the canonical role inputs | 4,738/5,050 |

The role work-evidence layer is also now generated from the repository's O*NET
30.3 export. It contains source-reported activities, work activities,
preparation zones, education signals, work-context signals, related occupation
examples, and occupation links for **4,330/5,050** visible roles. A further
**720** roles have a registered ESCO, O*NET, WEF, or specialist-framework source
link but no O*NET task profile (`source_role_only`); **0** currently have neither
an O*NET code nor a registered role-specific link (`not_available`). A
`source_role_only` record still needs careful wording: it can explain the
occupation and link to the applicable source, but it must not claim that an
O*NET task/activity profile was found for that exact role.
This distinction prevents an ESCO/framework explanation from being mistaken
for an O*NET task record.

The role source spine contains ESCO, O*NET, and specialist framework records.
Descriptions are carried from those canonical role inputs; they are not
generated from a title alone. The generated SQL/API path must include the role
`description` field before this is visible in a newly seeded database.

## What the Nigerian item count means

“Nigerian item enrichment” means that the entity has at least one checked local
item in one of these categories:

- role or local terminology;
- skill;
- tool;
- competency;
- certification or credential;
- applicable regulatory requirement.

Broad Nigerian sector context, a source registry reference, or a generic local
institution list does not by itself prove that a particular skill, tool,
credential, or exact role title is used in the Nigerian market. Local demand is
kept separate and is not claimed without a dated vacancy or labour-market
signal.

## Explicit gaps

- One subgroup, `D126|32` (“Health associate professionals”), remains
  `no_direct_local_counterpart` in the checked source set. It is not filled with
  an invented Nigerian title or credential.
- Five visible roles remain without item-level Nigerian enrichment after the
  follow-up search: ski instructor, snowboard instructor, cigarette making
  machine operator, snow-clearing worker, and hop farmer. They retain global
  role evidence and are labelled as locally unverified rather than treated as
  proof of Nigerian demand.
- The follow-up search added narrowly scoped Nigerian evidence for tram driver,
  astronaut, nuclear power reactor operator, and automated cable vehicle
  controller. These additions include limitations where the evidence describes
  a programme or planned infrastructure rather than active hiring.
- A missing local counterpart is not an absence claim. It means that no
  defensible match was found in the current checked sources.

The older 2026-08-25 completion audit reports 10 roles with no matched local
counterpart. The current follow-up reduced that same residual set to **5**;
both counts must not be collapsed into a claim that every role has Nigerian
item evidence.

## Source roles

The catalogue uses separate evidence layers:

- **Global occupation explanation and skills:** ESCO occupation/skill profiles
  and O*NET occupation records. ESCO supplies occupation descriptions, skills,
  alternative labels, and stable identifiers; O*NET supplies occupation,
  worker-requirement, and technology-skill records.
- **Specialist global frameworks:** the repository’s registered frameworks for
  quantum technologies, XR/immersive work, games, robotics, esports, built
  environment, energy, health, finance, and related fields. These are used for
  specialist vocabulary and preparation, not as Nigerian demand evidence.
- **Nigerian professional and regulatory context:** CPN and its examination
  syllabus, NBTE National Occupational Standards/NSQF materials, NITDA policy
  and skills materials, NDPC data-protection materials, and relevant Nigerian
  professional or sector bodies.
- **Nigerian market signals:** Jobberman, MyJobMag, and other dated local
  vacancy or labour-market records where the audit identifies them. These are
  signals, not a promise of employment or a complete market census.

## User-facing rule

Each detail page must explain what the domain, subgroup, or role means before
showing preparation. It then shows a suggested starting set, retains the full
inventory behind a context-specific “See all” action, separates Nigerian,
remote/shared, and global evidence, and links to the source record or source
summary for deeper reading. “Needed for this route” is reserved for supported
route essentials; otherwise use “May strengthen this route,” “When applicable,”
or “Priority not yet verified.”

Salary is deliberately excluded from this evidence layer.

## Primary source references

- ESCO: <https://esco.ec.europa.eu/en/use-esco>
- O*NET database: <https://www.onetcenter.org/database.html>
- CPN 2021 Examination Syllabus: <https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf>
- NBTE National Occupational Standards: <https://www.digitalnbte.nbte.gov.ng/Public/PUCNOS>
- NITDA National Digital Economy Policy and Strategy: <https://nitda.gov.ng/wp-content/uploads/2023/07/Policy-National_Digital_Economy_Policy_and_Strategy.pdf>
- NDPC DPCO requirements: <https://www.ndpc.gov.ng/dpco-registration-requirements/>

## Verification command

Run from the repository root:

```text
python data/career-mapping/_audit_nigerian_context.py
```

Rebuild the role work evidence before regenerating the career seed:

```text
python data/career-mapping/_build_role_work_profiles.py
```

The resulting report is a coverage audit only. It does not authorize SQL
deployment and does not turn a local gap into a completed enrichment row.
