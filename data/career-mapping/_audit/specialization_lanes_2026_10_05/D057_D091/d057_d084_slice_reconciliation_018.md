# D057-D084 specialization slice reconciliation (checkpoint 018)

Read-only reconciliation of the completed D057-D091 lane records against the shared register. No domain review, evidence, or canonical taxonomy was overwritten.

## Exact counts

- `review_files_expected`: **28**
- `review_files_found`: **28**
- `review_files_missing`: **0**
- `candidate_specialization_rows`: **114**
- `domains_with_no_candidate_area_rows`: **3**
- `domains_present_in_shared_register_exact_match`: **8**
- `domains_present_in_shared_register_conflict`: **0**
- `domains_absent_from_shared_register`: **20**
- `absent_rows_with_additive_projection_ready`: **17**
- `distinct_source_id_conflicts`: **4**
- `conflict_occurrences`: **4**
- `domains_with_role_to_specialization_assignments`: **0**

## Shared-register disposition

- Exact matches already present: D059, D061, D063, D064, D065, D066, D070, D071.
- Absent: D057, D058, D060, D062, D067, D068, D069, D072, D073, D074, D075, D076, D077, D078, D079, D080, D081, D082, D083, D084.
- Additive projections that pass source-ID conflict checks: D057, D058, D060, D062, D067, D068, D069, D072, D073, D074, D075, D076, D078, D080, D082, D083, D084.
- Existing-domain projection conflicts: none.

### Source-ID collisions

- `D077` / `ILO_OSH_CONVENTIONS`: existing locator `Overview of Convention 155 and Promotional Framework Convention 187: national governance and workplace OSH management complement each other.` vs lane locator `Conventions 155 and 187 overview: workplace safety systems and prevention context.`; claim-limit difference must be reviewed before shared-register reconciliation.
- `D077` / `UNESCO_SPORT_CHARTER`: existing locator `Articles 3, 7, 9 and 10: policy and development responsibilities; qualified sport administration/coaching; safety and risk; good governance and integrity.` vs lane locator `Articles on safe participation and risk in physical activity and sport.`; claim-limit difference must be reviewed before shared-register reconciliation.
- `D079` / `WTO_TRADE_FACILITATION`: existing locator `Trade Facilitation Agreement overview: movement, release and clearance of goods; cooperation among customs and other border authorities.` vs lane locator `Agreement overview: expedite movement, release and clearance of goods, including electronic means; cooperation among customs and other border authorities.`; claim-limit difference must be reviewed before shared-register reconciliation.
- `D081` / `ISO_RECORDS_MANAGEMENT`: existing locator `Abstract: records, metadata, systems, policies/responsibilities, monitoring/training, business-context analysis, controls and record lifecycle processes.` vs lane locator `Current edition confirmed in 2021; concepts include records, metadata, systems, assigned responsibilities, controls and processes across formats and environments.`; claim-limit difference must be reviewed before shared-register reconciliation.

## Domain-by-domain review status

| Domain | Lane status | Candidate areas | Sources | Shared-register state |
|---|---|---:|---:|---|
| D057 | `source_reviewed_provisional_candidate_set` | 3 | 4 | `missing_additive_projection_ready` |
| D058 | `source_reviewed_provisional_set_and_parent_boundary` | 0 | 5 | `missing_additive_projection_ready` |
| D059 | `source_reviewed_candidate_set_recommended` | 2 | 4 | `present_exact_match` |
| D060 | `provisional_source_reviewed` | 0 | 5 | `missing_additive_projection_ready` |
| D061 | `source_reviewed_candidate_set_recommended` | 3 | 8 | `present_exact_match` |
| D062 | `provisional_candidate_set_recommended_parent_scope_boundary_open` | 2 | 5 | `missing_additive_projection_ready` |
| D063 | `provisional_candidate_set_recommended_set_granularity_and_parent_boundaries_need_catalogue_reconciliation` | 6 | 10 | `present_exact_match` |
| D064 | `provisional_candidate_set_recommended_cross_region_title_and_scope_variation_remains` | 8 | 6 | `present_exact_match` |
| D065 | `provisional_candidate_set_recommended_specialization_scope_and_count_need_catalogue_reconciliation` | 6 | 10 | `present_exact_match` |
| D066 | `provisional_candidate_set_recommended_count_and_cross_domain_ownership_need_catalogue_reconciliation` | 8 | 6 | `present_exact_match` |
| D067 | `source_reviewed_candidate_set_recommended_jurisdictional_recognition_varies` | 8 | 6 | `missing_additive_projection_ready` |
| D068 | `source_reviewed_parent_scope_split_recommended_no_subgroup_count_for_current_parent` | 0 | 6 | `missing_additive_projection_ready` |
| D069 | `provisional_candidate_set_recommended_parent_scope_and_computational_boundary_open` | 7 | 11 | `missing_additive_projection_ready` |
| D070 | `provisional_candidate_set_recommended_recorded_performance_boundary_open` | 6 | 6 | `present_exact_match` |
| D071 | `provisional_candidate_set_recommended_parent_scope_open` | 4 | 4 | `present_exact_match` |
| D072 | `provisional_candidate_set_recommended_parent_scope_and_count_open` | 5 | 5 | `missing_additive_projection_ready` |
| D073 | `provisional_candidate_set_recommended_parent_scope_open` | 4 | 4 | `missing_additive_projection_ready` |
| D074 | `provisional_candidate_set_recommended_jurisdiction_and_scope_open` | 4 | 3 | `missing_additive_projection_ready` |
| D075 | `provisional_candidate_set_recommended_scope_and_count_open` | 4 | 2 | `missing_additive_projection_ready` |
| D076 | `provisional_parent_scope_split_recommended` | 4 | 4 | `missing_additive_projection_ready` |
| D077 | `provisional_parent_scope_split_recommended` | 4 | 5 | `missing` |
| D078 | `provisional_candidate_set_recommended_computational_crosscutting` | 7 | 4 | `missing_additive_projection_ready` |
| D079 | `provisional_three_area_synthesis_parent_boundary_open` | 3 | 4 | `missing` |
| D080 | `provisional_parent_scope_split_recommended` | 4 | 3 | `missing_additive_projection_ready` |
| D081 | `provisional_four_area_synthesis_scope_open` | 4 | 2 | `missing` |
| D082 | `provisional_core_areas_parent_scope_split_recommended` | 2 | 2 | `missing_additive_projection_ready` |
| D083 | `provisional_four_area_synthesis_parent_scope_open` | 4 | 4 | `missing_additive_projection_ready` |
| D084 | `provisional_two_area_synthesis_jurisdiction_open` | 2 | 4 | `missing_additive_projection_ready` |

## Follow-up findings and evidence limits

### D064 — crosswalk_added_internal_eight_area_synthesis_not_formally_exhaustive

The APA's US-recognized specialty list is a useful completeness stress-test, not a global taxonomy. Several formally recognized US areas are broader routes, subspecialty themes, or not cleanly represented by the lane's eight learner-facing groupings. Keep a transparent crosswalk and do not imply equivalence of specialty, subgroup, credential, or title.

Unresolved: Police and Public Safety Psychology and Clinical Psychopharmacology do not fit cleanly in the eight broad routes. Clinical Neuropsychology remains only a provisional advanced theme under Clinical Psychology. These, plus other APA-specific specialties, need explicit route/omission decisions before the internal set is described as broadly complete. Crosswalk links are conceptual visibility only, not credential equivalence.
- [American Psychological Association: Recognized Specialties, Subspecialties and Proficiencies](https://www.apa.org/ed/graduate/specialize/recognized) — Current official list of APA-recognized US specialties, subspecialties and proficiencies; use the list to test omitted or grouped themes only. Supports: US professional recognition and list completeness within that system. Does not support: A global specialty list, non-US title/credential rules, or the lane's exact learner-facing count.
- [American Psychological Association: Specialties, Subspecialties, and Proficiencies](https://www.apa.org/ed/graduate/specialize/index) — About Specialties section: defines a specialty as a defined psychological-practice area requiring advanced knowledge and skills acquired through organized education and training. Supports: A specialty boundary should involve distinct advanced knowledge and skills, rather than merely an occupation label. Does not support: A universal taxonomy or other jurisdictions' regulated titles.

### D067 — jurisdictional_crosswalk_added_internal_count_not_universal

FDI's revised 2025 policy defines specialization by advanced distinct practice and expressly leaves recognition to national or regional regulatory bodies. The ADA's twelve recognized specialties are a US benchmark, not a worldwide count. The existing eight-area internal proposal does not clearly expose Dental Anesthesiology and combines several diagnosis/pain fields; the eight cannot be called an exhaustive formal-specialty list without an explicit crosswalk and learner-path rationale.
- [FDI World Dental Federation: Specialization in Dentistry](https://fdiworlddental.org/specialization-dentistry) — Policy revised September 2025; definitions and policy clauses on distinct advanced practice, post-graduate education, specialist title use, and country/region regulatory recognition. Supports: International principles for distinguishing specialization from general dentistry and recognizing jurisdictional variation. Does not support: A universal specialty list/count or authority to practise in any jurisdiction.
- [National Commission on Recognition of Dental Specialties and Certifying Boards, American Dental Association: Recognized Dental Specialties](https://ncrdscb.ada.org/recognized-dental-specialties) — Current official list of twelve specialties recognized in the United States. Supports: A US-specific completeness benchmark for established advanced dental fields. Does not support: Global recognition, a worldwide specialty count, or a universal credential route.

### D075 — source_support_strengthened_count_remains_internal_synthesis

Internationally used textile test standards, materials evaluation and education support textile-material/testing as a real practice-learning area. UN/CEFACT traceability work supports global textile value-chain and supply-chain functions. These sources strengthen the proposed materials and product/value-chain routes, but neither establishes a required four-subgroup taxonomy or formal credentials for the proposed labels.
- [American Association of Textile Chemists and Colorists: Testing & Standards; About AATCC](https://www.aatcc.org/testing; https://www.aatcc.org/about/) — Testing & Standards: international methods for textile evaluation, quality control and proficiency testing; About: global textile community includes fiber/material producers, designers, manufacturers, testing laboratories, retailers, academic experts and education resources. Supports: Textile material evaluation/testing is a real technical practice area with global standards use; industry includes distinct materials, production, testing and retail functions. Does not support: A four-area taxonomy, a universal credential, or a requirement that AATCC itself is a globally representative accreditor.
- [United Nations Economic Commission for Europe, UN/CEFACT: Traceability and Transparency in the Textile and Leather Sector, Part 1: High-Level Process and Data Model](https://unece.org/trade/documents/2024/11/standards/traceability-and-transparency-textile-and-leather-sector-part-1) — UN/CEFACT business-requirements specification and data model for traceability/sustainability information across textile and leather value chains; framework can be applied by countries, regions or industries. Supports: Textile value-chain, traceability and supply-chain work is a distinct cross-organizational practice context. Does not support: A professional specialty count, merchandising credential, or global occupational licensing model.
- [UNESCO, Diversity of Cultural Expressions: Design / Fashion](https://www.unesco.org/creativity/en/sector/design-fashion) — Sector definition includes clothing, textiles and accessories and describes cultural/creative and economic dimensions. Supports: Fashion and textile work spans design, materials, crafts and market activity rather than garment sewing alone. Does not support: A fixed academic subgroup count or professional accreditation taxonomy.
- [UNESCO: The African Fashion Sector: Trends, Challenges and Opportunities for Growth](https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=%2Fark%3A%2F48223%2Fpf0000387230%2FPDF%2F387230eng.pdf&file=%2Fin%2Frest%2FannotationSVC%2FDownloadWatermarkedAttachment%2Fattach_import_af68cbba-a22a-4a4d-aad9-8185c5cabf29%3F_%3D387230eng.pdf&id=p%3A%3Ausmarcdef_0000387230&locale=en&multi=true&v=2.1.196) — Introduction and value-chain discussion; explicitly Africa-focused study of fashion, textiles and garment production. Supports: Fashion links raw-material/textile production, design and garment manufacturing in the studied region. Does not support: A global labor-market or education taxonomy; source scope is Africa-specific.

### D076 — civilian_naval_boundary_source_supported_count_internal

IMO convention material explicitly excludes warships and certain non-commercial government vessels from the civilian convention scope. This supports keeping naval/military operations outside a civilian maritime specialization list unless a separate defence-domain review establishes a route. It does not prescribe a universal count for civilian maritime learner areas.
- [International Maritime Organization: International Convention for the Prevention of Pollution from Ships (MARPOL), Article 3(3); CLC convention overview](https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/ConferencesMeetings/Documents/MARPOL%201973%20-%20Final%20Act%20and%20Convention.pdf; https://www.imo.org/en/about/conventions/pages/international-convention-on-civil-liability-for-oil-pollution-damage-%28clc%29.aspx) — MARPOL Article 3(3) excludes warships, naval auxiliaries and other state vessels used only for non-commercial government service; IMO CLC overview separately states its convention does not apply to warships/non-commercial government vessels. Supports: Civilian international maritime convention scope is distinct from naval/non-commercial state service. Does not support: A global occupational taxonomy, a universal rule across every maritime instrument, or an exact civilian-specialization count.

### D077 — candidate_not_supported_under_security_parent

ISO 18788 scopes private-security operations; ISO 22320 scopes incident management for organizations responding to incidents of any type and scale. The standards establish distinct practice frameworks, not job licensing. Emergency response/fire/rescue may be a genuine field, but these sources do not justify it as a specialization under a Security Services root. Treat it as a parent-boundary/split candidate, not a supported D077 subgroup. Existing ILO and sport sources do not repair that parent-fit gap.
- [International Organization for Standardization: ISO 18788:2015 Management system for private security operations](https://www.iso.org/standard/63380.html) — Official ISO abstract and scope: framework for establishing and operating security operations management systems and organizations conducting or contracting security operations; current status shown on ISO page. Supports: Private-security operations have a defined management/practice framework. Does not support: Public emergency services, fire/rescue job ownership, individual certification, or subgroup count.
- [International Organization for Standardization: ISO 22320:2018 Security and resilience — Emergency management — Guidelines for incident management](https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso%3A22320%3Adis%3Aed-2%3Av1%3Aen) — Official ISO online browsing platform, introduction and clauses 1 Scope: incident management across organizations and incidents of any type and scale. Supports: Emergency incident management is a cross-sector practice framework involving public, private and other responding organizations. Does not support: Fire-service credentials, a Security Services subgroup relationship, or a defined profession/specialty count.

### D080 — interior_boundary_strengthened_other_candidates_remain_diagnostic

CIDQ's professional definition locates interior design in planning/design of interior environments, materials, lighting, acoustics, wayfinding, ergonomics and code-compliant non-structural work. Alongside IFI, it strengthens the distinct interior-design field, while giving no support for placing scenography, exhibition/retail experience design, or illustration/animation under that same unchanged parent. Keep zero approved subgroup count pending parent-boundary reconciliation; four remains diagnostic only.
- [Council for Interior Design Qualification: Definition of Interior Design](https://www.cidq.org/wp-content/uploads/2025/10/Full-Definition-of-Interior-Design.pdf) — Abbreviated and full definitions, pp. 1–2: interior environment planning/design, materials/finishes, lighting, acoustics, wayfinding, ergonomics, human environmental behavior and bounded construction scope. Supports: Interior design is a distinct practice field with a bounded subject matter. Does not support: A universal statutory definition, or placing performance scenography, illustration/animation or all exhibition/retail work under interior design.


## Invariants

- These are areas-of-specialization candidates, not role groups inferred from ISCO.
- No roles were assigned to specializations.
- Parent-boundary holds remain holds; the lane does not invent a subgroup count where the root domain needs reconciliation.
- Jurisdiction-specific credentials/titles stay labelled as jurisdictional context.
- This report does not update the shared register; all 20 absent records require separate collision-safe reconciliation.
