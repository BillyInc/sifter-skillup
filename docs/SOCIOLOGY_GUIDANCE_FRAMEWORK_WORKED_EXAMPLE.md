# Sociology guidance framework: programme → domain → subgroup → role

Status: implemented review slice; live Supabase application still requires the
documented migration order  
Scope: source-grounded programme, domain, subgroup and role guidance; Sociology
is the reviewed worked example before wider content approval  
Prepared: 2026-09-12

This document is the first worked example for the programme-to-role guidance
framework. It keeps the complete information available, but presents it in a
sequence that helps a student understand what they are looking at and what to
learn next.

It does not turn a source record into a promise of employment, salary,
licensing, or universal skill requirements.

## 1. Rules that apply before any page is written

### 1.1 Ownership rule

Each layer owns a different kind of explanation:

| Layer | It explains | Evidence allowed to define the layer |
| --- | --- | --- |
| Programme | What the student studies and practises, and what each recorded capability means in that programme | CCMAS programme, course titles, outcomes, course contents, programme skills and programme-owned resources |
| Domain | The broad field and its shared foundation | Domain-owned records plus relevant programme curriculum evidence |
| Subgroup | What the focused area adds to the domain | Subgroup record, subgroup methods, explicit subgroup mappings, and only then role evidence inside that subgroup |
| Role | What a particular kind of work involves | Role record, occupational sources, role skills, tools, competencies and role resources |

Role frequency may validate a domain internally, but it must not define what
every student in the domain should learn. For example, the current D078 list
that says “draft scientific or academic papers: 73%” is not a Social Sciences
foundation card.

### 1.2 Evidence and priority rule

Priority is staged, not a single ranked list:

1. Start with the programme or domain foundation.
2. Add prerequisites that make the next stage understandable.
3. Add the selected subgroup's additional methods and capabilities.
4. Add role-specific skills, tools, proof and qualifications after a role is
   selected.
5. Keep weak, generic, unverified or role-only items out of the earlier layer.

“Learn first” means “a useful starting point supported by the available
evidence”. It does not mean “every learner must master this before continuing”.

Each visible skill, competency, tool or certification card must explain what the
item means in that layer, what it is used for there, what it can help produce,
what it connects to, and which source supports it. The same item may therefore
appear again at a lower layer with a different explanation.

### 1.3 Resource-link rule

Every visible learning action must identify what kind of link it is:

- **Free course**: a defined course or lesson sequence that can be opened
  without payment. An account requirement is stated when one exists.
- **Free open textbook**: a specific book or chapter, not a publisher home page.
- **Interactive lesson**: a defined browser lesson or exercise.
- **Tool tutorial/documentation**: teaches or documents a tool; it is not called
  a course unless it actually is one.
- **Reference**: explains a skill, occupation, organisation or method; it is not
  presented as training.

Generic homepages such as the MIT OpenCourseWare root are not called a
learning path. They may be retained as “browse the library” references, but
they do not satisfy a specific learning-link requirement.

### 1.4 Nigerian and global qualification rule

Skills and credentials must show their evidence scope, not an invented ranking:

- **Nigeria** means a Nigerian professional, regulatory, education or sector
  pathway is recorded.
- **Global** means an international pathway or reference is recorded, but local
  usefulness is not assumed.
- **Nigeria and global** means both evidence layers are present.

When a student intends to work in Nigeria, the interface should say to check
the Nigerian route first, then compare global portability. A globally known
credential is not automatically a Nigerian requirement. For a credential such
as CFA, the label may say both only after the repository contains both Nigerian
and global evidence; otherwise it must retain its narrower recorded scope.

## 2. Current repository audit

### 2.1 Sociology programme

The current `SOC` record in
`data/career-mapping/ccmas/social_sciences.json` contains:

- B.Sc Sociology, four years;
- 34 recorded courses;
- 243 course outcome/skill strings in the raw programme record;
- programme skills covering sociological knowledge, social-problem analysis,
  research communication, qualitative and statistical data processing, and
  information retrieval.

The current student-facing synthesis groups the record as:

- People and society — 101 outcomes;
- Ideas and foundations — 14 outcomes;
- Research and evidence — 39 outcomes;
- Technology and information — 2 outcomes;
- Applying what you learn — 7 outcomes;
- Other programme topics — 17 outcomes.

The raw outcomes remain available behind “See curriculum evidence”. They should
not be dumped into the first screen.

### 2.2 Social Sciences domain D078

The live API currently reports:

- Domain: Social Sciences;
- cluster: Education & Research;
- active runtime roles: 24;
- active subgroups: 2;
  - Social & Economic Research;
  - Computational Social Science & Quantitative Methods.

The repository audit file reports 26 role records. This discrepancy must be
resolved before claiming that the runtime and audit inventories are identical.
It is a data-contract issue, not a reason to invent additional subgroups.

The live domain foundation is currently assembled from role-derived prevalence
records. That is not suitable for the revised student-facing domain layer.
The domain foundation below is therefore a proposed synthesis from the
Sociology curriculum and the domain identity; it must be materialised as
domain-owned evidence before being treated as a live domain record.

### 2.3 Computational subgroup

The subgroup has a real name, description, a list of skills and tools. The
review migration now provides an explicit, limited resource set for it. The
interface must still say that these are selected learning options, not a
complete subgroup-specific course catalogue.

The subgroup tools are evidence options, not requirements. The current records
include Python, R, SAS, SQL, SPSS, Excel, Apache Spark, Stata, Qualtrics and
REDCap, among others. Generic source categories such as “Analytical or
scientific software” are not student-facing tool names.

## 3. General page pattern

Every layer follows the same structure without repeating the same content:

1. **What this is** — plain-language orientation.
2. **What people do** — activities or outputs supported by the layer's evidence.
3. **What questions or problems it helps with** — concrete examples.
4. **How it connects to the layer above** — what carries over and what changes.
5. **What to learn next** — staged items with a reason for their position.
6. **Tools and resources** — named alternatives, each with an honest link type.
7. **Evidence and limits** — what the sources show and what they do not prove.

The first five items are visible. Long curriculum evidence, raw source records,
and the complete resource inventory open progressively through “See evidence”
or “See all”.

## 4. Worked example: Sociology

### 4.1 What is Sociology?

> Sociology studies how people live together, how groups and institutions are
> organised, how cultures develop and how societies change.

This wording is a student-friendly synthesis of the current SOC 101, SOC 106,
SOC 102, SOC 103, SOC 201, SOC 202, SOC 203, SOC 206, SOC 302, SOC 303,
SOC 306, SOC 401, SOC 406 and SOC 407 records. It is not a replacement for
those records.

### 4.2 What does the programme cover?

#### People, groups and society

Social structure, culture, socialisation, family, marriage, institutions,
communities and social groups.

Evidence to open: SOC 101 Introduction to Sociology I; SOC 106 Introduction
to Sociology II; SOC 102 Introduction to Anthropology; SOC 103 Introduction to
African Societies and Culture; SOC 203 Sociology of the Family; SOC 206
Structure of the Nigerian Society.

#### Sociological ideas and theories

Classical thinkers, theories of society, social order, inequality, development
and change.

Evidence to open: SOC 201 History of Social Thought; SOC 401 Classical and
Contemporary Sociological Theories; SOC 406 Models in Sociological Analysis;
SOC 407 Sociology of Development.

#### Social problems and change

Crime, inequality, gender, poverty, development, family change, conflict and
social problems in Nigeria and other societies.

Evidence to open: SOC 202 Social Change and Social Problems; SOC 210 Gender
and Society; SOC 302 Social Inequality; SOC 303 Sociology of Crime and
Delinquency; GST 312 Peace and Conflict Resolution.

#### Research and evidence

Research questions, research design, methods, data collection, ethics,
statistics, proposal writing and research reports.

Evidence to open: SOC 105 Elements of Scientific Thought; SSC 302 Research
Method I; SOC 301 Methods of Social Research and Statistics; SSC 401 Research
Method II; SOC 408 Research Project.

#### Nigerian and African societies

Nigerian cultures, ethnic groups, political structures, institutions and
social change.

Evidence to open: GST 112 Nigerian Peoples and Culture; SOC 103 Introduction
to African Societies and Culture; SOC 206 Structure of the Nigerian Society;
SOC 403 Regional Ethnography.

#### Technology and information

Computer applications and online information retrieval recorded in the
programme curriculum.

Evidence to open: SSC 202 Introduction to Computer and its Application and
the technology/information outcomes in the current SOC record.

### 4.3 Sociology learning sequence

```text
Understand people, groups and institutions
        ↓
Learn sociological ideas and explanations
        ↓
Learn how to investigate social questions
        ↓
Collect, analyse and communicate evidence
        ↓
Apply knowledge to social problems and research
```

This sequence is derived from the course structure and outcomes. It is not
based on role frequency.

### 4.4 Sociology resources attached to the sequence

These are specific resources selected after comparing multiple sources. The
review migration attaches the rows to the Sociology programme, but the live API
must not be said to contain them until the migrations have been applied.

| Stage | Resource | Type | Why this one was selected | Link |
| --- | --- | --- | --- | --- |
| Understand the field | You and your world: Introducing the social sciences | Free introductory course | The Open University course is aimed at understanding social sciences, real-world examples and different perspectives; it can be started without signing up, while a free account adds tracking and a statement of participation. | https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0 |
| Understand Sociology | Introduction to Sociology 3e | Free open textbook | OpenStax gives a defined introductory Sociology text with concepts, theories, culture, institutions and social change rather than a generic catalogue. | https://openstax.org/books/introduction-sociology-3e/pages/1-introduction |
| Ask better questions | Types of social science questions | Free course section | It directly covers empirical, policy, ethical and philosophical social-science questions. | https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.1 |
| Ask better questions | Asking good questions | Interactive course section | It teaches clarity, focus and precision using social-science examples. | https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.2 |
| Research foundation | Understanding and Doing Research in Education & the Social Sciences | Free open textbook | It explicitly presents a progression from introductory research to quantitative, qualitative, statistics and mixed methods. | https://fhsu.pressbooks.pub/socialresearch/front-matter/introduction/ |
| Research process | Social Science Research: Principles, Methods and Practices | Free open textbook | It has defined chapters on the research process, design, measurement, sampling and survey research. | https://usq.pressbooks.pub/socialscienceresearch/ |
| Research ethics | Becoming an ethical researcher | Free course | It focuses on planning, conducting and reporting research involving people; the course also offers a free statement of participation and optional badge. | https://www.open.edu/openlearn/education-development/becoming-ethical-researcher |
| Read and assess evidence | Reading evidence | Free course | It teaches how qualitative and quantitative evidence is presented, organised and interpreted. | https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence |
| Research data | Research Data MANTRA | Free self-paced course | It covers planning, organising, documenting, safeguarding and sharing research data, including R, Python, ArcGIS and SPSS exercises. | https://mantra.ed.ac.uk/ |
| Statistics | Statistics and Probability | Free guided practice | Khan Academy provides a beginner-friendly sequence with exercises and tests. | https://www.khanacademy.org/statistics-probability |
| Statistics/reference | OpenIntro Statistics | Free open textbook and activities | OpenIntro provides a college-level statistics text, datasets and companion activities. | https://www.openintro.org/book/os/ |

The previous generic MIT OpenCourseWare root should not be shown as “the
Sociology learning path”. It may remain as a broad browse reference only.

### 4.5 Programme reading: required text versus useful reference

The CCMAS record establishes what Sociology teaches; it does not, by itself,
establish a universal textbook list for every university. The programme page
therefore separates curriculum evidence from reading suggestions:

| Reading | How it is shown | Access |
| --- | --- | --- |
| Haralambos and Holborn, *Sociology: Themes and Perspectives* (8th edition) | Recognised Sociology reference for theory and themes | Publisher or library reference; not claimed as free or universally required |
| Anthony Giddens, *Sociology* | Supporting reference for theory and contemporary society | Publisher or library reference; not claimed as free or universally required |
| OpenStax, *Introduction to Sociology 3e* | Legal free open-text alternative for introductory concepts, theory, culture, institutions and change | Free open textbook |

The page should say **Read the reference**, **Open the free textbook** or
**See the curriculum evidence**. It must not imply that a paid publisher page is
a free course, and it must not imply that a reference book is an admission or
graduation requirement.

## 5. Sociology → Social Sciences

### Why is the mapping shown?

> Sociology connects to Social Sciences because its curriculum studies people,
> groups, institutions, culture, social change, social problems and
> evidence-based research.

The mapping explanation should open the exact programme-to-domain evidence,
including the course codes and outcome text that support the relationship. It
should not show a role-frequency percentage as the reason.

### What the student sees next

The student sees the Social Sciences domain orientation, not a raw list of 24
roles and not a made-up list of subgroups.

## 6. Worked example: Social Sciences domain D078

### 6.1 What is Social Sciences?

> Social Sciences help us understand how people live together, how communities
> and institutions work, and how societies change.

### 6.2 What questions does it ask?

- How are societies organised?
- How do families, institutions and communities shape people's lives?
- Why do inequality, crime or other social problems develop?
- How does society change?
- How can research and evidence help explain social life?

These questions are examples from the programme and domain context. They are
not a promise that every student will study every question in equal depth.

### 6.3 What do people do in this field?

The curriculum-backed activities are:

- study social structures, institutions and cultures;
- compare societies and communities;
- investigate social problems and change;
- collect, evaluate and interpret evidence;
- explain findings in reports, arguments and presentations.

### 6.4 Where does Sociology fit?

Sociology is one programme within the wider Social Sciences context. The
current CCMAS material also places related programmes such as Anthropology,
Criminology, Economics, Geography, Political Science and Psychology in that
broader context. These are related programmes or disciplines, not automatic
D078 subgroups.

### 6.5 The actual D078 subgroups

Only these two current records should be shown:

1. **Social & Economic Research** — study social behaviour, institutions and
   economic life through structured research.
2. **Computational Social Science & Quantitative Methods** — use data,
   statistics, network methods and computation to study people, populations and
   society.

### 6.6 Domain foundation

The domain foundation should be expressed as a short sequence:

```text
Understand people, groups and institutions
        ↓
Ask clear questions about social life
        ↓
Learn how evidence is gathered and evaluated
        ↓
Use appropriate research methods
        ↓
Analyse and communicate findings
        ↓
Choose a specialised area
```

Each card needs three disclosures:

- **Why this appears** — for example, “Sociology curriculum and Social
  Sciences domain definition both support this foundation.”
- **Evidence** — the course/domain records to open.
- **Learn this** — only a specific verified free link, otherwise “No specific
  learning link attached yet”.

The current D078 role-frequency list must not appear in this section.

### 6.7 Domain resources and credentials

No domain-wide gateway or role-hint certification is currently recorded for
D078. The correct copy is:

> No domain-wide certification requirement is recorded for Social Sciences.

NISER and the Nigerian Academy of Science may be shown as research or
professional reference organisations. They must not be displayed as mandatory
certifications.

The credential surface should also carry a market-scope label. For D078 the
reviewed Nigerian evidence supports academic and research qualifications,
institutional research training and bounded professional membership, but it
does not establish one general individual licence for Social Sciences. The
student-facing copy is therefore:

> Nigerian context is available for research and academic pathways. Check the
> Nigerian institution or professional body first if you plan to work locally;
> global references can be compared separately. No universal Social Sciences
> licence is recorded.

The same rule applies to every domain. A credential is labelled **Nigeria**,
**Global** or **Nigeria and global** only from the evidence rows that support
that scope. CFA, for example, must not be labelled both in a domain that only
has the global CFA record; the Nigerian pathway must be recorded separately
before the combined label is used.

The following domain-level learning links are appropriate because they explain
the field or its general research foundation:

| Domain need | Link | Link type |
| --- | --- | --- |
| Understand the social sciences | https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0 | Free introductory course |
| Understand Sociology as a discipline | https://openstax.org/books/introduction-sociology-3e/pages/1-introduction | Free open textbook |
| Understand social-science research | https://usq.pressbooks.pub/socialscienceresearch/ | Free open textbook |
| Understand research ethics | https://www.open.edu/openlearn/education-development/becoming-ethical-researcher | Free course |
| Read qualitative and quantitative evidence | https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence | Free course |
| Manage research data responsibly | https://mantra.ed.ac.uk/ | Free self-paced course |
| Learn basic statistics | https://www.openintro.org/book/os/ | Free open textbook and activities |

### 6.8 Domain tools: current decision

The current domain tool rows are primarily O*NET software categories attached
through role aggregation. They are not domain-owned records. Therefore the
domain page should not currently present Excel, Microsoft Office, Python, R,
SPSS or any other named tool as a Social Sciences foundation requirement.

At domain level the student may see:

> The curriculum records computer applications and information retrieval. The
> specific tools become clearer after you choose a subgroup or role.

Once explicit domain-owned tool evidence is created, tools may be grouped by
purpose. Until then, tool options belong to the subgroup or role pages below.

## 7. Worked example: Computational Social Science & Quantitative Methods

### 7.1 What is this area?

> Computational Social Science & Quantitative Methods uses data, statistics,
> network methods and computation to study people, populations and society.

### 7.2 What does it add to Social Sciences?

The current subgroup record adds:

- mathematics and statistics;
- quantitative research and data handling;
- analytical mathematical calculations;
- social network analysis;
- computational methods;
- open-source software use.

These are subgroup additions. They do not replace the Social Sciences
foundation.

### 7.3 What questions can it help answer?

- How are people or organisations connected?
- What patterns appear in population or social data?
- How can social behaviour be measured?
- How can statistical or computational methods help explain society?

### 7.4 How is the work carried out?

```text
Start with a social question
        ↓
Choose a research design
        ↓
Collect and organise data
        ↓
Analyse patterns statistically or computationally
        ↓
Interpret limitations and meaning
        ↓
Communicate the findings
```

### 7.5 Subgroup learning sequence

| Stage | What to build | Why it is here |
| --- | --- | --- |
| Carry over | Social questions, research design, evidence, ethics and communication | These come from the domain and Sociology research foundation. |
| Build next | Data organisation, statistics and quantitative reasoning | These are prerequisites for interpreting computational results. |
| Add after that | R or Python data handling, SQL and reproducible analysis | These are practical ways to work with structured data; they are alternatives, not a mandatory stack. |
| Specialise | Network analysis, modelling, large-scale computation or survey systems | These are selected when the student's project or role needs them. |

### 7.6 Explicit subgroup resource candidates

The review migration attaches the following specific free links to the
subgroup. A fresh or un-migrated database will still return an empty resource
array, so the seed status must be visible to admin verification:

| Subgroup capability | Chosen resource | Type and limitation | Link |
| --- | --- | --- | --- |
| Research methods | Social Science Research: Principles, Methods and Practices | Free open textbook; broad rather than a short course | https://usq.pressbooks.pub/socialscienceresearch/ |
| Research ethics | Becoming an ethical researcher | Free OpenLearn course; relevant to research involving human participants and offers a free statement of participation | https://www.open.edu/openlearn/education-development/becoming-ethical-researcher |
| Reading evidence | Reading evidence | Free OpenLearn course; focused on qualitative and quantitative evidence rather than a generic study-skills homepage | https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence |
| Research data management | Research Data MANTRA | Free self-paced course | https://mantra.ed.ac.uk/ |
| Spreadsheet organisation | Data Organization in Spreadsheets for Social Scientists | Free lesson; teaches organisation and quality control, not full statistical analysis | https://datacarpentry.github.io/spreadsheets-socialsci/ |
| R for social-science data | R for Social Scientists | Free lesson; requires R and RStudio; current lesson is suitable for beginners | https://datacarpentry.github.io/r-socialsci/ |
| Python for social-science data | Data Analysis and Visualization with Python for Social Scientists | Free lesson; explicitly marked alpha, so show that status | https://datacarpentry.github.io/python-socialsci/ |
| SQL for social-science data | Data Management with SQL for Social Scientists | Free lesson; explicitly marked alpha, so show that status | https://datacarpentry.github.io/sql-socialsci/ |
| SQL practice alternative | SQLBolt | Free interactive browser lessons; general SQL, not Sociology-specific | https://sqlbolt.com/ |
| Statistics | OpenIntro Statistics | Free open textbook, datasets and activities | https://www.openintro.org/book/os/ |
| Social network analysis | Introduction to Social Network Methods | Free undergraduate-level online textbook from University of California, Riverside authors | https://faculty.ucr.edu/~hanneman/nettext/C0_Preface.html |

The subgroup card should say:

> These are options for building quantitative and computational capability.
> You do not need to learn every tool. Choose a method and tool that fit the
> question you are investigating.

### 7.7 Tools grouped by purpose

The tool list should be an option map, not a checklist:

| Purpose | Options from current subgroup/role evidence | Specific free link |
| --- | --- | --- |
| Organise and inspect data | Excel; spreadsheet tools | https://datacarpentry.github.io/spreadsheets-socialsci/ |
| Statistical analysis | R; SPSS; SAS; Stata | R: https://datacarpentry.github.io/r-socialsci/ · SPSS: https://www.open.edu/openlearn/society-politics-law/sociology/getting-started-spss/content-section-0 · SAS: https://www.sas.com/sas/training/forms/roles/sas-programming-course.html · Stata: https://www.stata.com/learn/ |
| Programming and computation | Python; R | Python: https://datacarpentry.github.io/python-socialsci/ · R: https://r4ds.hadley.nz/ |
| Query structured data | SQL; MySQL | SQL: https://datacarpentry.github.io/sql-socialsci/ · practice alternative: https://sqlbolt.com/ |
| Data collection | Qualtrics; REDCap | Qualtrics public support/reference: https://www.qualtrics.com/support/ · REDCap videos: https://projectredcap.org/resources/videos/ |
| Large-scale processing | Apache Spark | Official documentation and quick starts: https://spark.apache.org/documentation |
| Visualisation and reporting | Power BI | Free beginner module: https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/ |
| Spatial analysis when the project needs it | ArcGIS | Free public lessons and tutorials: https://learn.arcgis.com/en/ |

The current R URL `https://learn.microsoft.com/iis/` is incorrect and must not
be used. The R links above replace it in the reviewed candidate set.

## 8. Worked example: Statistician role

### 8.1 What is this role?

> Statisticians collect, organise and analyse quantitative information from
> areas such as health, demographics, finance and business. They interpret
> patterns and advise based on their analysis.

### 8.2 What does the role help solve?

- understand numerical evidence;
- identify patterns;
- compare groups or situations;
- assess uncertainty;
- support decisions with analysis.

### 8.3 What does the role produce?

The role evidence supports statistical analyses, interpreted findings, models,
reports and evidence used for decisions. The referenced application areas are
contexts, not promises of employment.

### 8.4 What to build in order

| Stage | Skills or capability | Supporting evidence/link |
| --- | --- | --- |
| Build first | Mathematics, statistics, research design, digital data processing | OpenIntro Statistics: https://www.openintro.org/book/os/; Social Science Research: https://usq.pressbooks.pub/socialscienceresearch/ |
| Add next | Quantitative analysis, statistical modelling, mathematical modelling and scientific literature | OpenIntro Statistics: https://www.openintro.org/book/os/; Khan Statistics and Probability: https://www.khanacademy.org/statistics-probability |
| Practise with one option | Python or R for reproducible data work | Python: https://datacarpentry.github.io/python-socialsci/; R: https://datacarpentry.github.io/r-socialsci/ |
| Use a statistics package when needed | SPSS, SAS or Stata | SPSS: https://www.open.edu/openlearn/society-politics-law/sociology/getting-started-spss/content-section-0; SAS: https://www.sas.com/sas/training/forms/roles/sas-programming-course.html; Stata: https://www.stata.com/learn/ |
| Specialise later | Computer simulation, biometrics, social network analysis, algorithms, market research | Network analysis: https://faculty.ucr.edu/~hanneman/nettext/C0_Preface.html; Python data lessons: https://datacarpentry.github.io/python-socialsci/ |

### 8.5 Honest role-resource labels

- The ESCO statistician page is a **role reference**, not a course:
  https://esco.ec.europa.eu/en/classification/occupation?text=statistician
- The current MIT OpenCourseWare root is a **broad library**, not a complete
  Statistician learning path.
- The current R resource link is invalid for R and must be replaced with one of
  the reviewed R links above.
- Tool links are **tool documentation or learning options**. No single tool is
  required for every statistical route.

## 9. Source-selection record

The sources were compared by specificity, free access, relevance to the
capability, and whether the page was a real lesson/course rather than a generic
homepage.

| Need | Selected | Alternatives reviewed | Decision |
| --- | --- | --- | --- |
| Social Sciences introduction | OpenLearn “You and your world” | OpenStax Sociology, Open University course description | OpenLearn is the better first orientation; OpenStax remains the deeper Sociology text. |
| Sociology foundation | OpenStax Introduction to Sociology 3e | OpenStax 2e, OpenLearn | 3e is the current open textbook record and has the clearest structured coverage. |
| Research methods | USQ Pressbooks Social Science Research | FHSU Research in Education & Social Sciences; Craft of Sociological Research | USQ gives the broadest defined research-process coverage; FHSU is retained for staged progression. |
| Research data management | Edinburgh MANTRA | QMUL RDF course; TU Delft OpenCourseWare | MANTRA has the clearest free, self-paced units and tool exercises. |
| Social network analysis | Hanneman and Riddle, UCR | general search results and paid SAGE material | UCR is a free, explicitly undergraduate-oriented text. |
| R/Python/SQL for social scientists | Data Carpentries social-science lessons | R4DS, Python official tutorial, SQLBolt | Data Carpentries is the closest contextual match; R4DS, Python docs and SQLBolt are alternatives. |
| Statistics | OpenIntro and Khan Academy | MIT OpenCourseWare root | OpenIntro is the structured open textbook; Khan is the accessible practice route. |
| SPSS | OpenLearn Getting started with SPSS | IBM product learning page | OpenLearn is a real free course; IBM is documentation/product learning. |
| SAS | SAS Programming 1: Essentials | SAS general training page | SAS explicitly marks the course free and self-paced. |
| Stata | Stata Learn | third-party video courses | The official page provides free webinars and tutorials without claiming a free full course. |
| Spark | Apache Spark documentation | Databricks training | Official Spark docs are safe to label documentation/quick starts, not a course. |
| REDCap | Project REDCap videos | Yale and Rochester institutional repositories | Project REDCap is the primary public source; institutional repositories remain optional alternatives. |

## 10. Validation result before scaling

### Proven by current repository and implementation artifacts

- Sociology is a current CCMAS programme record with 34 courses and 243 raw
  course outcome strings.
- D078 is Social Sciences and currently has two real subgroups.
- The review migration contains explicitly owned Computational subgroup and
  Statistician resources; live availability still depends on applying the SQL.
- D078 currently exposes role-derived foundation prevalence that should not be
  used as the domain foundation.
- The current R tool link is wrong.
- Generic MIT and generic tool-category links do not satisfy a specific-course
  requirement.

### Still required before claiming live availability or wider rollout

1. Apply `migration_contextual_career_items.sql` and the Sociology resource
   migration in the documented order.
2. Run the 29 generated contextual SQL parts in numeric order and verify the
   manifest counts against Supabase.
3. Confirm the reviewed Sociology/domain/subgroup/role resource rows have the
   correct parent IDs and `resource_type`.
4. Mark Data Carpentries Python and SQL lessons as alpha in the resource
   description or evidence metadata.
5. Replace generic MIT “learning path” rows with specific links or relabel them
   as broad library references.
6. Reconcile any remaining runtime/audit role-count difference.
7. Re-run the resource seed gate and verify that the API returns the new rows
   under the correct owner instead of relying on inherited domain resources.

8. Repeat the programme-reading source review for programmes other than
   Sociology; no book should be invented when the repository does not record
   one.

Until these steps pass, the UI should show the explanatory guidance and source
evidence, but it should not claim that the subgroup already has a complete
course catalogue.

## 11. Intended final relationship

```text
Sociology programme
  → curriculum themes, outcomes and programme learning sequence

Social Sciences domain
  → field meaning, shared foundation, research questions and domain limits

Computational Social Science & Quantitative Methods subgroup
  → quantitative and computational additions, option-based tools and explicit
    subgroup learning links

Statistician role
  → role activities, outputs, role skills, tool options and role-specific links
```

Sociology remains the reviewed content example. The same ownership contract is
now generated for all 160 visible domains, 472 explicit subgroup records and
4,563 role records in the repository. That global output is still subject to
the SQL seed gate and source review before it is described as live. Programme
reading lists remain evidence-led: Sociology has the reviewed reading set above;
other programmes need their own named source record before a book is added.
