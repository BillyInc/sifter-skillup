# Source-layer enrichment review — 2026-09-01

## Purpose

This review records what the checked external sources can add to the current
career library and what they cannot prove. It is a source gate, not a seed or
SQL-generation approval.

## Reviewed source layers

| Source | Evidence checked | Permitted enrichment | Explicit limitation |
|---|---|---|---|
| [UNSD ISIC Rev.5](https://unstats.un.org/unsd/classifications/Econ/ISIC.cshtml) and [Rev.5 explanatory notes](https://unstats.un.org/UNSDWebsite/statcom/session_55/documents/BG-4e-ISIC5_Exp_Notes-E.pdf) | Current structure, explanatory notes, inclusion/exclusion rules, and the repository's Rev.4-to-Rev.5 correspondence | Domain industry context, activity boundaries, completeness review, and defensible placement of an activity under an industry anchor | Does not define occupations, subgroups, skills, programme suitability, or job demand |
| [O*NET 31.0](https://www.onetcenter.org/database.html) | Official 31.0 archive and comparison with the repository-pinned 30.3 archive | Role tasks, work activities, work context, education/preparation, job zones, software skills, essential/transferable skills, and job-title review candidates | US occupational evidence is a global proxy; it is not Nigerian demand, licensing, or a local hiring requirement |
| [ILO ISCO-08](https://isco.ilo.org/en/isco-08/) | Hierarchy, unit-group definitions, skill-level model, and repository crosswalk | Occupational identity, unit-group anchors, work-function grouping, skill-level and specialization context, and deduplication | Does not by itself prove Sifter domain names, Nigerian demand, or learner readiness |
| [ILO/ILOSTAT data catalogue](https://ilostat.ilo.org/data/) | Available employment-by-occupation/ISCO, employment-by-industry/ISIC, education, formality, sex, and related labour-statistics series; Nigeria source documentation | Labour-market context and demand signals when the exact Nigeria series, period, classification, and extraction are attached | A catalogue entry is not a role-level Nigerian vacancy, tool, certification, or competency claim |
| [WEF Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/) | Global employer-survey scope and role/trend signals; current repository role lists | Global growth, decline, emerging-role, and future-skill review signals | Projections are not current Nigerian demand, a complete occupation dictionary, or programme-to-domain evidence |

## O*NET 31.0 result

The official release page reports updates to 208 occupations and to task,
skill, work-activity, work-context, education, job-zone, and job-title data.
The repository comparison found:

- 1,016 occupation records in both 30.3 and 31.0, with no semantic occupation
  title or description changes;
- 16 changed Job Zone occupation keys affecting 107 current profile rows;
- 160 changed Work Activity keys affecting 1,232 current profile rows;
- 160 changed Work Context keys affecting 1,242 current profile rows;
- 145 changed Education keys affecting 1,115 current profile rows;
- 205 changed Task Statement keys affecting 1,510 current profile rows;
- 141 changed Essential Skill and Transferable Skill keys affecting 1,124
  current profile rows each.

The regenerated outputs retain the 31.0 archive URL and SHA-256
`6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9`.
Current populations are 5,093 visible role-context entries, 5,209 merged
role-tool keys, and 462 conservative thin-domain overlay rows after removing
three false-positive keyword placements. The visible context audit records
5,089 roles with actual Nigerian local enrichment and four explicit global-only
roles; it leaves bounded source gaps rather than padding domains with weak
keyword matches.

O*NET occupations without an ESCO or ISCO equivalent are review candidates.
They may be promoted only when they are in scope, non-duplicates, and have a
documented domain placement. O*NET does not supply Sifter's subgroup taxonomy;
an unmatched occupation may use a documented domain-to-role path, but it may
not be used alone to invent a subgroup.

## ISIC Rev.5 result

UNSD currently lists ISIC Rev.5 as endorsed and makes the structure and
explanatory notes available, while still marking the formal publication as
forthcoming. The repository therefore treats Rev.5 as the current working
industry-context revision, with the official correspondence table retained
for historical/revision-sensitive values.

ISIC Rev.5 can enrich domain definitions by supplying revised activity
boundaries, inclusion/exclusion rules, current activity vocabulary, and a
completeness check for industry coverage. It cannot establish occupations,
subgroups, skills, programme suitability, Nigerian demand, or role priority.

## ISCO and ILO result

ISCO-08 provides a four-level hierarchy and 436 unit groups. Its skill model
organizes occupations by skill level and skill specialization, including field
of knowledge, tools/machinery, materials, and goods/services produced. This
supports role identity and guidance explanation, not automatic domain naming.
The current crosswalk retains eight invalid source values with explicit
candidate/parent-anchor dispositions; no replacement was inferred. The official
ISCO-08 codelist and volume confirm that the standard structure uses candidates
such as 2120, 2211/2212, 2310, and 2320 in the affected families; national or
older classification values must not be silently promoted as ISCO-08 codes.

ILOSTAT can add Nigeria-relevant labour context because its catalogue includes
occupation/ISCO and industry/ISIC employment series, including formality and
education dimensions. No such series is promoted into role-level Nigerian
demand until the exact Nigeria extract, period, classification level, and
mapping evidence are stored with the claim.

An exact Nigeria query was checked on 2026-09-01:
`EMP_2EMP_SEX_OCU_NB_A` for `ref_area=NGA`, total sex, year 2025. It returns
ILO modelled employment estimates at ISCO major-group level. The preserved
extract is `ilostat_nigeria_occupation_context_2026-09-01.json`. It may support
broad labour-context explanation and future demand-study prioritisation, but it
cannot rank individual Sifter roles or prove a Nigerian vacancy, tool,
competency, or certification requirement.

## WEF result

The current repository artifact contains WEF 2025 role lists for fastest
growth, fastest decline, largest absolute growth/decline, and emerging
technology roles. These remain trend annotations or review-queue inputs. The
report's future projections must not reorder Nigerian role priority or create
local competencies without Nigerian or occupational evidence.

The repository contains 48 distinct WEF labels across those lists. The
normalization audit resolves 20 to one current canonical role key after
case/punctuation/simple-plural normalization, identifies 2 ambiguous matches,
and leaves 26 broad, differently named, or unmatched labels for review. The 20
unique signals are now attached to the corresponding records in
`role_work_profiles.json` as `wef_signals`, preserving the original WEF label
and category. A WEF growth signal may therefore enrich an existing role's
trend explanation, but it does not by itself prove a new Sifter role, subgroup
placement, Nigerian demand, or programme relationship. The complete mapping is
in `wef_role_normalization_2026-09-01.json`.

## Current downstream effect

The source refresh may enrich role evidence and domain/subgroup provenance,
but it does not silently change canonical domain IDs, CCMAS anchors, or local
certification claims. The WEF annotation is profile-level evidence only; no
taxonomy or SQL row is created from an unresolved WEF label. The final SQL seed
remains blocked until the domain identity review, role-source review, and CCMAS
audit are all rechecked against these outputs.
