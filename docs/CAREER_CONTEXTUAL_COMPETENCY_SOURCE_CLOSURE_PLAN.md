# Contextual competency source-closure and user guidance plan

**Status:** governing plan for the next data and product pass  
**Purpose:** ensure that every skill, tool, certification, and competency shown
inside a domain, subgroup, or role is understandable, connected to its context,
and supported by evidence.

## The decision

The platform must not show a bare item such as “Python,” “risk modelling,”
“CFA,” or “data visualisation” and expect a student to understand its value.
Each displayed item must answer four questions:

1. What is this in simple language?
2. What is it used for in this domain, subgroup, or role?
3. What does it connect to, and what should the learner learn before or after it?
4. Which source supports that explanation?

Every displayed answer must be source-backed. If the current catalogue does not
contain enough evidence, the research task is to obtain and review an
appropriate source before release. Unsupported items are not silently converted
into plausible explanations, marked complete, or shown as ordinary facts.

## How information is shown without overwhelming the learner

Use progressive disclosure, not information removal:

### First view

Show a compact priority group with:

- the item name;
- a one-sentence plain-language meaning;
- one sentence explaining its use in this specific domain, subgroup, or role;
- a clear priority label such as **Start here**, **Build next**, or **Useful later**;
- one action: **See why** or **See more**.

### “See more” for the same context

Expand the item in place to show:

- the practical task or output it supports;
- connected skills, tools, competencies, and certifications;
- prerequisites and what the item unlocks next;
- whether it is essential, recommended, or optional for the selected context;
- Nigerian, global, or Nigeria-to-global relevance where the evidence differs;
- source titles, links, dates, and page or section references;
- limitations, where a source is a proxy rather than a direct Nigerian source.

### Full inventory

The complete set remains available through **See all in this domain**,
**See all in this subgroup**, or **See all for this role**. The full inventory
is still ordered by learning usefulness and evidence—not hidden behind a search
that makes the learner guess what matters.

This gives students a manageable starting point while preserving transparency
and discovery.

## The contextual evidence record

Every item-to-context relationship must have this information before it is
released:

| Field | Meaning |
|---|---|
| Item identity | The canonical name, aliases, and item type |
| Plain meaning | A short explanation a beginner can understand |
| Contextual use | What the learner does with it in this domain, subgroup, or role |
| Result or output | The work product, decision, service, or capability it supports |
| Relationships | Prerequisites, related items, tools used with it, and destinations it unlocks |
| Priority | Start here, build next, useful later, or optional; with the reason |
| Evidence type | Skill relation, task, tool/software record, curriculum, professional standard, regulator, or market signal |
| Source reference | Publisher, exact title, version/date, page or section, and public link |
| Geographic scope | Nigeria, global, or Nigeria to global |
| Evidence limitation | What the source does not prove |
| Verification date | When the source was checked |

“Source-backed” means the source supports the particular claim being made. A
global occupation source may support a task or skill but cannot be presented as
proof of Nigerian demand. A Nigerian regulator may support a registration gate
but cannot be used to claim that every neighbouring role requires the same gate.

## Source-closure rules by item type

### Skills and competencies

Use the strongest available source in this order:

1. An exact skill or competence relation in the European Skills, Competences,
   Qualifications and Occupations classification, O*NET, SFIA, the European
   Cybersecurity Skills Framework, or another named specialist framework.
2. An exact task, learning outcome, occupational standard, professional-body
   competency, or Nigerian curriculum statement.
3. A clearly identified specialist research or industry framework when the item
   is emerging and no occupation taxonomy contains it.

The explanation must connect the skill to an observable task or output. A vague
claim such as “important for success” is not enough.

### Tools and software

The source must establish both the tool and its use. Acceptable evidence
includes:

- an O*NET software-skill record tied to an occupation;
- a specialist role framework naming the tool category;
- an official product or standards document showing what the tool does,
  combined with a role or task source showing why that function is used here;
- a Nigerian vacancy, occupational standard, or professional source when the
  claim is specifically local.

The product must explain “used for” rather than merely list the brand or
technology name. A tool appearing in a vacancy is a market signal, not an
universal requirement.

### Certifications and registrations

The issuing professional body, regulator, examination authority, or official
programme must be the source for the name, eligibility, stages, examination,
registration, renewal, and scope. General training websites are not sufficient
to establish a licence or statutory requirement.

The UI must distinguish:

- **Required to practise or register**;
- **Common professional route**;
- **Useful preparation**; and
- **Optional signal**.

No certification is shown as mandatory merely because it is popular in a role.

### Evergreen credential lifecycle

The product is intended to remain useful year after year. A qualification or
exam must therefore never be deleted just because its provider has paused,
closed, retired, or replaced the route.

The catalogue retains the record and the official status source, while the
current learner experience reflects its real status:

| Status | What the learner sees | What the product does |
|---|---|---|
| Active | The item may be recommended when the evidence supports it | Show the current route and link to the issuer |
| Temporarily unavailable | “Currently unavailable; check the issuer for reopening” | Keep the record, remove the current action, and recheck it at the next source refresh |
| Retired | “Retired by the issuer” | Keep the historical record, but do not recommend it to new learners |
| Superseded | “Replaced by a newer route” | Keep the relationship to the replacement and guide the learner to the current route |

For example, the TensorFlow Developer Certificate remains part of the
catalogue because existing certificates have a validity period and the
provider may define a future replacement. Its exam is currently closed, so it
must not be presented as an available route for a new learner. The official
status page is [TensorFlow Certificate](https://www.tensorflow.org/certificate).

The same rule applies to every other credential, membership, registration,
training programme, or provider signal. “Retained in the catalogue” and
“recommended as a current next step” are separate decisions. Before each
annual refresh, the product rechecks the official issuer or regulator source
and updates the lifecycle status.

The catalogue also labels what the item actually is. A professional licence,
professional registration, certification, membership, training programme,
and course-completion record must not be displayed as if they were the same
thing. An official issuer link establishes the identity of the item; separate
evidence is still required before claiming that it is legally required, a
Nigerian market expectation, or the best next step for a particular role.

## Relationship and transition design

The learner should experience the graph as a guided explanation:

```text
programme preparation
→ domain foundation
→ subgroup specialisation, when supported
→ entry role
→ role-specific competency and tool set
→ next role or destination
```

When a student opens an item, the context must remain visible. For example:

> **Python in Artificial Intelligence**  
> You use Python here to clean data, train and test models, and turn a model
> into something other people can use. It connects to statistics, data
> preparation, machine-learning methods, and model evaluation.

The same tool may appear elsewhere with a different explanation. That is not a
contradiction: the relationship is context-specific. The product should say
“Used differently in this role” when the task changes.

## Priority language

Priority is not a popularity score. It is derived from the learner’s selected
context and the evidence-backed dependency graph:

- **Start here:** a foundation used by several important next steps or required
  for the first credible task;
- **Build next:** a bridge that unlocks a subgroup, entry role, or repeated set
  of tasks;
- **Useful later:** valuable after the foundation or role is established;
- **Optional:** helpful for a particular direction but not required for the
  selected context.

The explanation beside the label must say why the item has that position. The
learner can always choose **See all** to inspect the complete inventory.

## Source-closure workflow

1. Inventory every displayed item and every item-to-domain, item-to-subgroup,
   and item-to-role relationship.
2. Deduplicate aliases without losing the original source names.
3. Match each claim to an exact source record, not merely a source homepage.
4. Search the added local bundles and authoritative external sources for any
   missing evidence.
5. Record the exact source, version/date, page or section, claim, scope, and
   limitation.
6. Reject evidence that supports only a different claim—for example, using a
   global trend report as Nigerian demand evidence.
7. Build the plain-language explanation from the verified claim.
8. Validate that every relationship shown in the UI has evidence on both ends:
   the item and its use in the selected context.
9. Only then expose the item to the learner or include it in a seed.

There is no user-facing “source unavailable” shortcut in the final release.
The research process continues until the claim is sourced, or the item is
excluded from that context. “Excluded from this context” is different from
claiming that the skill, tool, certification, or competency does not exist.

## Evidence sources to use

- [International Labour Organization: International Standard Classification of Occupations](https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/)
- [International Standard Classification of Occupations 2008](https://isco.ilo.org/en/isco-08/)
- [European Skills, Competences, Qualifications and Occupations](https://esco.ec.europa.eu/en/use-esco)
- [O*NET 31.0 Database](https://www.onetcenter.org/database.html)
- [SFIA 9](https://sfia-online.org/en/sfia-9)
- [European Cybersecurity Skills Framework](https://www.enisa.europa.eu/topics/skills-and-competences/skills-development/european-cybersecurity-skills-framework-ecsf)
- [NIST NICE Workforce Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center)
- [World Economic Forum Future of Jobs Report 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/)
- [National Information Technology Development Agency](https://nitda.gov.ng/)
- [Pharmacy Council of Nigeria](https://pcn.gov.ng/registrations/pharmacist/)
- [Medical and Dental Council of Nigeria](https://mdcn.gov.ng/)
- [Council for the Regulation of Engineering in Nigeria](https://coren.gov.ng/guidelines-to-registeration/)
- [Securities and Exchange Commission Nigeria](https://sec.gov.ng/)
- [Institute of Chartered Accountants of Nigeria](https://icanig.org/)
- [Chartered Institute of Bankers of Nigeria](https://www.cibng.org/)
- [National Space Research and Development Agency](https://nasrda.gov.ng/)
- [National Board for Technical Education](https://web.nbte.gov.ng/downloads)
- [NIST Internet of Things and Networks of Things guidance](https://www.nist.gov/internet-things-iot)
- [HL7 Fast Healthcare Interoperability Resources](https://hl7.org/fhir/)
- [International Atomic Energy Agency Radiation Protection of Patients](https://nucleus.iaea.org/Pages/rpop.aspx)
- [World Health Organization good pharmacy practice](https://www.who.int/publications/m/item/annex-8-trs-961)
- [World Health Organization laboratory quality-management handbook](https://www.who.int/publications/i/item/9789241548274)
- [World Health Organization outbreak toolkit](https://www.who.int/emergencies/outbreak-toolkit/standardized-data-collection-tools/investigating-outbreak-of-unknown-disease)
- [Chartered Institute of Personnel and Development resourcing standards](https://www.cipd.org/en/the-people-profession/the-profession-map/explore-the-profession-map/specialist-knowledge/resourcing/)
- [NIST nanotechnology measurement protocols](https://www.nist.gov/mml/nanotechnology-measurement-protocols)

## Source-closure result from the current research pass

The visible source layer was checked after the additional research. The
generic O*NET software categories that had been incorrectly labelled as
missing now resolve to the O*NET software-skills file. The remaining visible
composite skill and competency labels were split into their component claims
and linked to authoritative source packs for Internet of Things, pharmacy,
public health, recruitment, digital health, laboratory work, medical imaging,
and nanotechnology.

The result is recorded in the accompanying source-closure audit and its
human-readable report. It records **44 composite labels and 88
visible rows** as source-supported syntheses, and checks **8,916 visible tool
rows with zero rows left without a source**. A source-supported synthesis is a
short learner-facing sentence assembled from source-supported components; it
is not presented as if one source used the exact same sentence.

The credential catalogue was also checked for provider lifecycle changes. All
**246 credential placements** have an official issuer or regulator source. A
fresh status search found **six records that must not be treated as ordinary
current recommendations**: TensorFlow Developer Certificate is temporarily
unavailable; AWS Certified Machine Learning - Specialty is retired; three
Microsoft Azure credentials are retired; and the older Salesforce Associate
name is superseded by Platform Foundations. Each remains retained for its
historical identity, has its official status source, and points to a current
route where the provider has published one. The other **239 placements** had
no closure, retirement, or replacement notice in the checked issuer sources
and are marked active with an annual recheck rule. The full record-by-record
register is the accompanying certification source-closure report.

The status evidence for the six exceptions comes from the providers: the
[TensorFlow Certificate page](https://www.tensorflow.org/certificate), the
[AWS Machine Learning Specialty page](https://aws.amazon.com/certification/certified-machine-learning-specialty/),
Microsoft's [credential retirement register](https://learn.microsoft.com/en-us/credentials/support/credential-retirement)
and [Azure Data Engineer renewal page](https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/),
and Salesforce's [Platform Foundations page](https://trailhead.salesforce.com/en/credentials/associate).
This is why the product retains old identities without sending a new learner
to an exam that the provider no longer offers.

This closes a source gap; it does not turn a global source into Nigerian
demand evidence. Nigerian registration, regulation, or market claims remain
linked to Nigerian bodies and are shown separately from global skill and work
evidence.

## Acceptance criteria

This work is complete only when:

- every displayed item has an evidence record;
- every displayed item has a context-specific plain-language explanation;
- every displayed connection has a source-backed reason;
- essential, recommended, useful-later, and optional labels have reasons;
- source scope is visible when Nigerian and global evidence differ;
- source links open to the relevant public document or page;
- the first view is brief and the full evidence is available through See more;
- the same item can be explained differently in different contexts without
  losing its canonical identity; and
- the seed and API release gates reject an item-to-context row without the
  required source record.
