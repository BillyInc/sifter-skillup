# D023 Medicine — domain enrichment checkpoint

Checkpoint date: 2026-10-12  
Checkpoint saved/updated: 2026-10-12 19:31 UTC  
Scope: domain-level only. No areas-of-specialization or role enrichment; no taxonomy, programme mapping, graph, SQL, or application changes. `student_visibility=false`; `local_verification=not_started`.

## Initial resume checkpoint — current research run

- `agent_verified_initial=true`; timestamp: `2026-10-12 (saved before this run's deep research; exact process time unavailable because the local shell helper failed to start)`.
- Earlier work preserved: the two unpromoted D023 candidates, their WHO source cards, the prior source-page inspection notes, and every stated limitation. Nothing has been replaced, promoted, or reclassified as approved.
- Immediate next batch: recover the local repository read path; inspect and deduplicate existing D023 domain-owned records and provenance; then add the next five source-backed, domain-wide candidates only after exact source/locator checks.
- Authoritative leads queued: WHO *Integrated Management of Adolescent and Adult Illness (IMAI) District Clinician Manual*, §1.6 “Clinical reasoning” (`https://iris.who.int/bitstream/10665/77751/1/9789241548281_Vol1_eng.pdf`); WHO *Global Competency and Outcomes Framework for Universal Health Coverage* (`https://www.who.int/publications/i/item/9789240034662`); and the WHO *Patient Safety Curriculum Guide* family for patient-safety foundations.
- Decision boundary: do not append any candidate that duplicates an existing domain-owned item or lacks an exact official source locator, a bounded claim, and a separate learning-resource lead. The shell-startup failure is a local inspection blocker, not a source failure.

## Immediate durable checkpoint

- Assigned domain: `D023` — Medicine.
- Filesystem is available. The inventory files `data/career-mapping/domain_meta.json` and `data/career-mapping/domain_structure.json` were located but their D023 records have **not yet been inspected**; that is the next step, not a filesystem blocker.
- Existing source research is preserved below; do not repeat it. The WHO IMAI District Clinician Manual and WHO UHC Global Competency and Outcomes Framework URLs below were searched previously. In this continuation, the official WHO IMAI publication page and the official WHO UHC framework page were opened and inspected; the GMC Outcomes for Graduates page was also inspected as a separate, UK-specific graduate-outcomes source. Direct download of the IMAI PDF timed out, so its section-level claims still require PDF/source locator verification.
- Scope exclusions remain binding: no area, role, programme, taxonomy, graph, SQL, or application work. D078 is only a frozen methodology benchmark.
- The three controlling documents have now been read. D023's `domain_meta.json` record and selected domain-level fields in `domain_structure.json` were inspected. Full D023 domain-owned item/provenance files have not yet been inspected: attempts to run the targeted local search failed with `helper_unknown_error: setup refresh had errors`. This is a tooling/setup blocker, not evidence that those files or data are absent. Do not promote or append candidates until this deduplication is complete.
- Resume next by inspecting existing domain-owned D023 items/provenance, deduplicating the two existing candidates, then continue source-backed domain-only research.

### Source pages inspected in this continuation

1. WHO, *Integrated management of adolescent and adult illness (IMAI) district clinician manual: Hospital care for adolescents and adults*, [official publication page](https://www.who.int/publications/i/item/9789241548281). Inspected the title, date, type, overview, publisher, and page count. It establishes the manual's identity and bounded purpose; the PDF section locator still needs direct verification before relying on detailed clinical-reasoning claims.
2. WHO, *Global Competency and Outcomes Framework for Universal Health Coverage*, [official publication page](https://www.who.int/publications/i/item/9789240034662). Inspected overview and framework summary: health-worker education outcomes, six competency domains, and individual-/population-health practice activities. It is health-worker-wide, not Medicine-specific.
3. General Medical Council, *Outcomes for graduates*, [official standards page](https://www.gmc-uk.org/education/standards-guidance-and-curricula/standards-and-outcomes/outcomes-for-graduates). Inspected scope statement that it sets knowledge, skills and behaviours UK medical graduates must show, with separate practical-skills/procedures outcomes. UK-specific; not Nigerian regulation or global scope-of-practice authority.

## Baseline and immediate search checkpoint

This is the preserved initial source-map checkpoint for assigned domain D023 Medicine. The three controlling documents have now been read, and the D023 metadata plus selected domain-level fields in `domain_structure.json` have been inspected. Full domain-owned inventory/provenance deduplication remains blocked by the current command-startup error noted above; therefore the two existing items remain candidates, not additions or final dispositions. D078 is only a frozen method benchmark.

### Two sourced domain-level candidates

| Stable ID | Candidate / provisional disposition | What the evidence supports | Limits / next verification |
|---|---|---|---|
| `D023-CLINICAL-ASSESSMENT-001` | Clinical assessment and diagnostic reasoning — candidate for shared/versatile foundation; `agent_verified` for the cited task claim only | WHO’s Integrated Management of Adolescent and Adult Illness (IMAI) District Clinician Manual, vol. 1, §1.6 “Clinical reasoning,” describes systematic assessment using history, examination, records and relevant investigations; weighing differential diagnoses; identifying urgent conditions; and planning care. | This manual is a clinical practice/learning source, not proof that every task is authorized to every learner or practitioner. Confirm overlap with D023 inventory and define training/supervision/scope boundaries. No area/role placement inferred. |
| `D023-EVIDENCE-INFORMED-CARE-001` | Evidence-informed, person-centred health care and clinical decision-making — candidate for shared/versatile foundation; `agent_verified` for the framework claim only | WHO’s Global Competency and Outcomes Framework for UHC organizes health-worker competencies under people-centredness, decision-making, communication, collaboration, evidence-informed practice and personal conduct, and connects them to individual- and population-health practice activities. | WHO framework covers health workers broadly, not Medicine alone; it supports cross-cutting relevance, not a claim that every competency is uniquely medical or sufficient for independent practice. Confirm D023-specific framing and avoid presenting framework labels without contextual explanation. |

## Sources and query log

Access date for all sources: 2026-10-12.

1. WHO, *Integrated Management of Adolescent and Adult Illness (IMAI) District Clinician Manual, Volume 1*, [official WHO IRIS PDF](https://iris.who.int/bitstream/10665/77751/1/9789241548281_Vol1_eng.pdf). Locator: §1.6, “Clinical reasoning” (PDF page 10 as indexed; verify rendered pagination during full pass). Supports systematic health assessment, reasoning under uncertainty, differential diagnosis, relevant investigations and care planning. Limitation: operational manual for a particular clinical setting; not a universal scope-of-practice authorization.
2. WHO, *Global Competency and Outcomes Framework for Universal Health Coverage* (2022), [official publication page](https://www.who.int/publications/i/item/9789240034662). Locator: Overview and framework competency domains; practice activities for individual/population health services. Supports the named cross-cutting competency domains and evidence-informed/person-centred framing. Limitation: health-worker-wide framework, not a Medicine-only task catalogue.

Search queries run:

- `site:who.int medical doctor clinical assessment diagnosis clinical management responsibilities`
- `site:who.int medical education competencies clinical reasoning patient care physician tasks`
- `site:afro.who.int Nigeria medical doctors clinical practice tasks patient care`

## Status and resume point

- Search completed: 3 queries; 2 concrete candidate claims recorded with primary WHO sources.
- Items in this checkpoint: 2. Candidate claims checked against the cited source descriptions; item/source overlap against canonical D023 inventory is **not yet checked**.
- Validators/tests: none run; this is an evidence checkpoint, not a canonical-data change.
- Nigerian context: not yet resolved; absence of a Nigerian source is not a blocker for globally relevant work. Add Nigerian evidence only where it adds a distinct local context claim.
- Learning links: not yet researched; the source URLs above establish identity/task or competency claims, not context-specific free learning routes.
- Resume exactly here: read the three controlling documents and inspect D023 metadata, structure, domain-owned inventories and provenance; deduplicate these two candidates against existing records; then continue source-backed domain-only research and update this file and the paired JSON every 5–8 verified items.
- Remaining blockers: baseline inventory/source inspection; further common, emerging and experimental/near-future domain task-set searches; item-level relationships and limitations; contextual free/official/paid learning links where relevant; final explicit dispositions. Keep experimental items maturity-labelled and never imply they are standard requirements.
