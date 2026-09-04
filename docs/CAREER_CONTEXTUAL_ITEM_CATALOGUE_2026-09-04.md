# Source-backed explanations for career items

## What has now been completed

The career catalogue now has a separate evidence record for every visible
skill, competency, tool, and certification attached to a domain, subgroup, or
role. The record explains:

- what the item means in simple language;
- what the learner uses it for in that particular context;
- the work product or capability it supports;
- what it connects to;
- whether to start with it, build it next, use it later, or treat it as optional;
- the geographic scope of the evidence; and
- the source link and the limits of what that source proves.

The catalogue contains **195,248 source-backed contextual records** across the
visible taxonomy. **Zero emitted records are source-free.** The full catalogue
is transported as nine compressed parts in the seed transport directory so the
data can be moved without creating one oversized repository file. Its manifest
contains the checksum and the verified record count.

## How the sources are used

The sources have different jobs; they are not treated as interchangeable.

### European Skills, Competences, Qualifications and Occupations (ESCO)

ESCO supplies the preferred skill name, alternative names, plain description,
occupation description, and the relationship between an occupation and its
skills. This is the main source for explaining a skill and tying it to work.

### O*NET 31.0

O*NET supplies occupation descriptions, workplace software examples, software
categories, work activities, tasks, preparation signals, and related
occupations. A tool is shown as connected to a role only when the occupational
software record supports that relationship. A software example is not turned
into a universal employer requirement.

### International Labour Organization International Standard Classification of
Occupations (ISCO-08)

ISCO-08 supplies the international occupational grouping used to keep role and
subgroup identity stable. It is a classification source, not a claim that a
student is licensed or that a Nigerian employer must use the same title.

### Nigerian and specialist sources

The source registry also includes Nigerian professional bodies, regulators,
standards, curricula, training and ecosystem sources. Examples include the
Computer Professionals Registration Council of Nigeria, the National Board for
Technical Education, the National Information Technology Development Agency,
the Nigeria Data Protection Commission, health regulators, engineering bodies,
and field-specific international standards. These sources are used only for
the local or specialist claims they actually support.

The Computer Professionals Registration Council syllabus, for example, can
support Nigerian computing competencies and examination-route identity; it
cannot prove that every software role requires that examination. National
Occupational Standards can support workplace performance outcomes, while an
official issuer page can support the identity and lifecycle of a certificate.

## Example: one skill at three levels

The same skill may appear more than once because its meaning changes with the
learner's chosen context.

**Domain — Software Engineering — computer programming**

The learner sees a short explanation that programming is a foundation for
turning requirements into working software. The domain view places it early
because it supports several downstream specialisations and roles.

**Subgroup — Software Development and Systems Engineering — computer
programming**

The explanation becomes more specific: the learner applies programming while
building, testing, and maintaining software systems. The subgroup view shows
the bridge from the wider domain foundation to specialised work.

**Role — Software Analyst — computer programming**

The explanation is tied to the role's source-backed work: understanding
requirements, translating them into specifications, and checking that the
result behaves as intended. The role view marks essential role preparation
before optional languages or tools.

ESCO supplies the skill description and occupation relationship; the role
description supplies the work context. The product labels the resulting copy
as a source-supported synthesis, not as a quotation from ESCO.

## Example: a tool

**Python in an analytical or software role** is not shown as a bare chip. The
record identifies it as an O*NET workplace software example, names the O*NET
software category, and explains that it supports the tasks associated with the
selected occupation. The learner can open the source record and see the
occupation code and software category used for the relationship.

The same tool may have a different use in a data, artificial intelligence, or
quantum-computing pathway. The product therefore stores the relationship by
context rather than displaying one generic definition everywhere.

## Example: a certification

**AWS Certified Solutions Architect — Associate** is labelled as a
certification, not a licence. The official issuer source verifies the identity
and current lifecycle. The product may present it as useful later when the
selected pathway calls for cloud architecture preparation, but it does not say
that the certification is legally required, Nigerian demand evidence, or a
universal requirement for every software role.

Nigerian registration, statutory practice, examination eligibility, and current
availability are separate claims and require their own official evidence.

## How the learner sees it

The first view is deliberately short: item name, learning position, plain
meaning, and contextual use. **See more** reveals the output, connections,
source links, and evidence limits. **See all** reveals the full inventory for
that domain, subgroup, or role. This keeps the explanation educational without
forcing a beginner to read 100 items at once.

The source-backed item layer is additive. Until its database migration and
seed transport are applied to an environment, older clients continue to show
their existing skill, tool, and credential sections; after seeding, the new
context explanations populate those same screens.

## Primary public sources

- [ESCO classification](https://esco.ec.europa.eu/en/classification)
- [ESCO descriptions and semantic boundaries](https://esco.ec.europa.eu/uk/node/148)
- [O*NET 31.0 database](https://www.onetcenter.org/database.html)
- [O*NET 31.0 software skills data dictionary](https://www.onetcenter.org/dictionary/31.0/csv/software_skills.html)
- [International Labour Organization ISCO-08](https://isco.ilo.org/en/isco-08/)
- [World Economic Forum Future of Jobs Report 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/)
- [NITDA National Digital Literacy Framework information](https://dl4all.nitda.gov.ng/faq/)
- [NITDA regulations and frameworks](https://nitda.gov.ng/regulations/)
- [Nigeria Data Protection Commission resources](https://www.ndpc.gov.ng/resources/)
- [Computer Professionals Registration Council of Nigeria syllabus](https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf)
- [National Board for Technical Education National Occupational Standards](https://web.nbte.gov.ng/sites/default/files/2024-03/MANUAL%20new-compressed.pdf)

The complete source list used by the catalogue is retained in the shared source
registry inside each compressed seed part and in the source inventory. The
public links above are the principal classification and Nigerian standards
sources; specialist domains retain their own exact source links in their item
records.
