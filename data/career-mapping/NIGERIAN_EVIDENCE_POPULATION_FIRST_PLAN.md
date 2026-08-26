# Nigerian evidence population — population-first execution plan

## Non-negotiable order

Do not regenerate or treat `backend/seed_career_v2.sql` as final while the
population gate is open. The seed is a generated delivery artifact; it must be
produced from an audited evidence population, not used to hide incomplete
extraction.

```text
inventory
  -> fresh search
  -> item-level extraction
  -> provenance/completeness audit
  -> priority and lens reconciliation
  -> regenerate provenance and seed
  -> database/runtime verification
  -> UI and product-behaviour verification
```

## Population scope

The current repository inventory is:

- 160 visible domains;
- 486 visible domain subgroups after the current structure and overlays;
- 5,050 visible domain roles after framework/emerging overlay reconciliation;
- domain, subgroup and role skills;
- domain, subgroup and role tools;
- competencies and methods;
- certifications and regulatory requirements;
- Nigerian, remote and global evidence lenses;
- emerging domains: XR and immersive technology, esports and creator economy,
  and quantum computing/information.

The population target is every entity in that inventory. A target with no
credible Nigerian counterpart is still populated with an explicit
`no_direct_local_counterpart` or `domain_context_only` state; it is not silently
filled with global evidence.

## Evidence extraction rules

For every domain, subgroup and role, extract separate records for:

1. skills;
2. tools or platforms, when the source names them;
3. competencies or observable work capabilities;
4. certifications, examinations, memberships or training credentials;
5. statutory registration or licence requirements, only when a regulator or
   applicable law supports the claim;
6. role names and local terminology;
7. evidence scope: Nigeria, remote or global;
8. source URL, source type, source date/availability and an evidence note;
9. limitations, including context-only evidence, single-vacancy evidence,
   stale evidence, or no direct counterpart.

A professional-body syllabus can support skills, competencies or a credential
route. It does not automatically support current Nigerian demand. A job listing
can support an observed employer preference. It does not establish a universal
requirement. A global role framework does not establish Nigerian licensing or
local demand.

## Population gate

The gate passes only when the audit can show, for every inventory entity:

- the entity has an item-level evidence record or an explicit, reviewed
  no-evidence state;
- every extracted item has provenance and an evidence scope;
- local evidence is not relabelled from global evidence;
- remote evidence is not inferred from global evidence;
- statutory and non-statutory credentials are distinguished;
- no raw demand rank, score or unsupported universal requirement is created;
- XR, esports and quantum have role/skill/tool evidence and a clear global or
  remote limitation where Nigerian evidence is absent;
- the report lists all unresolved rows before any seed is generated.

Only after this gate passes may the following be run:

```text
_build_source_backed_layers.py
_build_domain_evidence_audit.py
_gen_career_seed.py
```

## Current measured state after the fresh 2024-2026 enrichment pass

The evidence-integrity gate passes, but this is not being treated as final
enrichment completion. The current measured state after adding the fresh
2024-2026 Nigerian source layer is:

- 160/160 domains have named Nigerian skills, competencies and certification
  signals in the domain audit;
- 485/486 subgroups have item-level Nigerian evidence, 0 have Nigerian
  context-only evidence, and 1 remains in the reviewed no-direct-local-match
  state pending the exhaustive search gate;
- 2,439/5,050 roles have item-level Nigerian evidence;
- 2,611 roles remain in the reviewed no-direct-local-match state after the
  current fresh pass. This means no exact role-family match was found in the
  checked Nigerian profiles; it is not an absence claim;
- all 5,050 roles and all 486 subgroups now also carry separately labelled
  Nigerian domain/sector context, with its limitation visible to downstream
  guidance and UI;
- all 5,696 domain, subgroup and role rows have a complete review disposition;
- all 5,696 rows retain global or derived-global evidence, with Nigerian and
  remote evidence kept separate;
- local provenance errors: 0; missing item provenance: 0; invalid states: 0;
- domain-context provenance errors: 0; missing domain context: 0;
- The current domain-field overlay contains 76 Nigerian source records and 70
  scoped profiles, and the separate subgroup-family overlay adds 12 family
  profiles, including fresh pathways for railway, forestry and wildlife,
  humanitarian response, quantum computing, insurance, jewellery, XR, criminal
  justice, public health, fashion, IP, maritime, EdTech, aviation, health,
  legal, agriculture, automotive and commercial diving.
- `NIGERIAN_DATA_COMPLETION_AUDIT_2026-08-25.md` is the current completion
  report, ranked by unresolved role and subgroup evidence rather than by row
  review status alone.

The review is complete at the current evidence-disposition level, but the
remaining exact-role rows still require further source search or an explicit
no-direct-evidence note in the product. Passing the integrity gate does not
claim that every occupation has a Nigerian vacancy, licence, tool requirement
or current demand signal.

## Emerging-domain source layer

The fresh overlay includes source-backed global role frameworks and studies for
XR/immersive technology, esports/creator economy, and quantum computing. These
are useful for global and remote guidance, but their Nigerian demand status
remains separate where vacancy or institutional evidence was not found.

### Latest role pass

The resumed role pass added the official Federation of Interactive Games of
Nigeria pathway source (`ng_fign_pathways_2026`) and expanded the existing
Esports Federation of Nigeria profile only where the sources name the role
family. It covers casting/commentary, game development, voice, creator work,
event management, refereeing and tournament operations as Nigerian ecosystem
or pathway evidence. It does not turn those pathways into vacancy counts or
universal requirements.

The pass increased role-level Nigerian item evidence from 2,434 to **2,439**
of 5,050. **2,611** remain in the reviewed no-direct-local-counterpart state.
Quantum hardware, XR-adjacent roles without a matching Nigerian title,
broadcast-technician variants and other unsupported exact roles remain
explicitly unresolved; global evidence and Nigerian domain context are kept
separate. The population gate remains closed and SQL regeneration remains
disallowed until the exhaustive-search declaration is completed.

## Remaining exact-match sweep

The remaining rows are not treated as one undifferentiated gap. They must be
processed in this order:

1. **Title and alias pass.** Compare each canonical role and subgroup against
   Nigerian vacancy titles, professional-body terminology, regulator registers,
   Nigerian occupational standards and local institution terminology. Record
   the matched Nigerian title or the exact sources checked.
2. **Regulated-family pass.** For medicine, allied health, teaching, law,
   engineering, architecture, quantity surveying, customs, maritime, aviation,
   finance, procurement and other regulated families, check the responsible
   Nigerian body or statute before assigning a registration, examination or
   practice requirement.
3. **Sector-standard pass.** Check NBTE NOS/NSQ, C-LMIS, ministry strategies,
   standards bodies and sector-skills councils for the occupation family. A
   sector standard supplies Nigerian foundation context; it becomes direct
   role evidence only when its scope supports that role family.
4. **Local-market pass.** Check dated Nigerian vacancy or hiring evidence from
   the available local feeds and fresh web results. Treat it as a time-bound
   title/tool/employer signal, never as a universal requirement or demand
   ranking.
5. **Institution and ecosystem pass.** For research, XR, esports, quantum,
   genomics and other emerging fields, check Nigerian universities, agencies,
   professional networks, studios, federations and training programmes. Keep
   ecosystem evidence separate from hiring evidence.
6. **Explicit disposition.** If those checks produce no defensible exact match,
   record `not_found_in_checked_nigerian_evidence`, retain the global/remote
   layer, attach the separately labelled Nigerian domain context, and record
   the limitation. This is not an absence claim.

The exit condition is not merely that every row has a disposition. Every row
must also have a source-check record, a scope-appropriate Nigerian context or
an explicit no-context limitation, global/remote separation, field-level
provenance, and a final unresolved-row report. Only then may the exhaustive
search declaration be changed and SQL generation reopened.

## Handoff rule

Any future agent continuing this work must read this file first, inspect
`NIGERIAN_ENTITY_POPULATION_GATE.md`, and rerun the gate after any evidence
changes. Seed generation is permitted only after the gate passes again. The
guidance and UI/UX contracts are downstream of this population gate.
