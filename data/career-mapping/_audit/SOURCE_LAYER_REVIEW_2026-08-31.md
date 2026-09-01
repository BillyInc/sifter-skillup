# Source-layer review record — 2026-08-31

## Purpose

This record separates source availability from source-backed claims. A source
being listed in `domain_role_source_registry.json` does not prove that its
records were ingested, that a domain name came from it, or that it establishes
Nigerian demand.

## Current source inventory

| Source layer | Current evidence inspected | What it can support | What it cannot support by itself | Status |
|---|---|---|---|---|
| ISIC Rev.5 | Local structure/explanatory-notes workbook; official UNSD Rev.4→Rev.5 correspondence | Industry context, activity scope, completeness survey, revision crosswalk | Occupation, skill, programme suitability, or job demand | Rev.5 canonical; crosswalk recorded |
| ISCO-08 | `ISCO-08 EN Structure and definitions.xlsx`; domain-library unit-group fields | Occupational hierarchy, work-function anchors, unit-group descriptions | Sifter domain naming by itself, Nigerian demand, or learner readiness | Code-level reconciliation ongoing; 8 library values need source review |
| ESCO | `taxonomies/esco_occupations.json`; v1.2.1 archive; occupation/skill extracts | Preferred/alternative occupation labels, URIs, descriptions, ISCO links, occupation-skill relations | Nigerian demand or local licensing | Ingested and used for role/skill provenance |
| O*NET | Repository O*NET 31.0 text archive and official release page; prior 30.3 archive retained for comparison | Tasks, work activities, tools/software, preparation, job zones, work context, job titles, and global proxy evidence | Nigerian demand or Nigerian regulatory scope | 31.0 comparison completed; occupation identities are stable, while several evidence tables changed and current generators are being refreshed |
| ILO | ILOSTAT reference and Nigerian labour-force extracts | International employment context and labour indicators | A specific Nigerian role, tool, certification, or vacancy claim without direct evidence | Context layer present; claim-by-claim citation review ongoing |
| WEF | `taxonomies/wef_2025_roles.json` and Future of Jobs report | Emerging/growing/declining role and skills signals | Complete occupation taxonomy, Nigerian demand, or programme suitability | Trend layer present; used only as a signal |
| Specialist frameworks | NICE, SFIA, ASCM, JFF XR, ARM/Skills England robotics, British Esports/Pearson, Quantum Flagship, and other registered extracts | Sector-specific role vocabulary, competencies, and pathways | Nigerian vacancy volume or licensing unless the source is Nigerian | Used for specialist role families; per-domain citation review ongoing |
| Nigerian sources | Professional bodies, regulators, CCMAS/JAMB, Nigerian vacancy extracts, and curated overlays | Nigerian terminology, context, regulation, certification, curriculum, and direct local demand when shown | Global equivalence or complete labour-market coverage | Local enrichment separated from global evidence; coverage audit present |

### Availability checkpoint

The current domain-provenance artifact references **383 distinct source IDs**.
Of those, **203** have at least one named source, URL, or attached source
record in the artifact; **180** are registry-only references. This is a
provenance-coverage measurement, not a claim that the repository contains no
other copies of those materials. Registry-only references cannot be used as
claim evidence until the source record or extract is attached and reviewed.

This distinction is especially important for specialist and Nigerian records
covering quantum, XR, esports, professional licensing, vacancies, and sector
frameworks: their registry entry may guide future retrieval, but it does not
currently prove a domain, role, competency, certification, or demand claim.

### Version reconciliation checkpoint

The repository now contains the official O*NET 31.0 text archive, with SHA-256
`6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9`; the
previous 30.3 archive remains available for comparison. The official release
page identifies updates to skills, tasks, work activities, work context,
education, job zones, and job titles. The comparison found no occupation-title
or occupation-description changes across the 1,016 occupation records, so no
role identity or ownership reassignment is justified. It did find semantic
changes in job-zone, work-activity, work-context, education, task, essential-
skill, and transferable-skill records affecting some current profiles. The
current role-profile and role-tool generators have been refreshed to 31.0;
changed evidence must not be presented as Nigerian demand or as a new role
without an independent local or specialist source. The regenerated artifacts
record the archive version, URL, and hash so the refresh is reproducible.

### ISIC Rev.5 enrichment checkpoint

ISIC Rev.5 is the canonical current industry-context layer. The UN structure
and explanatory notes provide revised activity boundaries, inclusion/exclusion
rules, and more current activity vocabulary. These can strengthen a domain’s
industry definition, identify missing activity coverage, and explain why a
domain belongs under one economic activity rather than another. They do not by
themselves establish an occupation, subgroup, skill, programme outcome, or job
demand. The repository’s Rev.4-to-Rev.5 correspondence is retained for
historical traceability; no existing domain ID is silently renamed or moved.
Any proposed domain change must cite the Rev.5 section/division/group/class
and record whether it is a boundary clarification, a new coverage candidate,
or a rejected mismatch.

### Cross-source enrichment decisions

The review confirms the following permitted enrichments:

- **O*NET 31.0:** use the refreshed task, work-activity, work-context,
  education, job-zone, software-skill, and essential-skill records in role
  profiles and role tools. O*NET job titles may identify a review candidate,
  but a lay title alone does not create a new role or domain placement.
- **ISCO-08:** use the four-level hierarchy, unit-group descriptions, skill
  level, and skill-specialization concepts as occupational anchors and for
  deduplication. The eight invalid library codes have explicit candidate or
  parent-anchor dispositions; no replacement code was inferred.
- **ILO/ILOSTAT:** use published employment, occupation/ISCO, industry/ISIC,
  education, formality, sex, and other labour indicators as contextual or
  demand evidence when the exact Nigeria dataset and period are attached.
  The current catalogue does not by itself prove a role-level Nigerian
  vacancy, certification, or skill requirement, so no such claim is promoted
  from the catalogue alone.
- **WEF Future of Jobs 2025:** use the repository’s role lists as global
  growth/decline/emerging signals. The report’s projections can inform a
  learner-facing trend label or review queue, but cannot establish current
  Nigerian demand, a complete role population, or a programme-to-domain
  mapping by themselves.
- **ISIC Rev.5:** use structure and explanatory notes to improve the industry
  boundary and completeness survey for each domain. It remains upstream of
  occupational and curriculum evidence.

An unmatched O*NET occupation is therefore handled as a **candidate record**:
it must have an in-scope work identity, not duplicate a current role, have a
documented domain placement, and retain its O*NET code and source metadata. If
it has no defensible subgroup placement, it may be attached at domain-to-role
level; O*NET cannot be used alone to invent a subgroup. A candidate with no
defensible placement remains in review rather than being seeded.

### Current subgroup/role checkpoint

The companion source-trace audit records provenance for **555/555 subgroups**.
The current merged population contains **5,212** deduplicated role records;
**5,192** have either an explicit role-field anchor or a source link in the
work-profile record. **20** currently have neither and remain explicit
provenance gaps; **116** have no O*NET work-profile join. A missing O*NET
profile is not itself a missing role, but the 20 records must receive an exact
source anchor or remain visibly unverified before the role layer is described
as fully traceable.

## Review status rules

- **Source present:** the file, archive, URL, or extract is available.
- **Source reviewed:** the relevant records were inspected and their fields are
  understood.
- **Claim proven:** a specific domain/subgroup/role claim has an exact source
  record, page, URI, or source extract attached to it.
- **Registry reference:** a routing target only; it is not proof.
- **Reviewed global-only:** global evidence exists, but the checked Nigerian
  sources did not establish a direct local counterpart. This must not be shown
  as Nigerian demand.

## Required record for each promoted claim

Every promoted domain identity or enrichment claim must retain:

1. source layer and source title;
2. version or publication date;
3. URL or repository path and hash when available;
4. exact code, URI, page, section, row, or extract;
5. claim type (industry context, occupational identity, skill, task, trend,
   Nigerian context, regulation, certification, or demand);
6. affected domain, subgroup, role, or competency;
7. naming status or mapping decision;
8. limitation and review state.

This is the gate for academic defensibility. The accepted subgroup, role, skill,
tool, competency, certification, and Nigerian-context decisions are preserved;
the review adds provenance and correct claim boundaries rather than reopening
those records without evidence.
