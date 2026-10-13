# Investigation of all uncertain domain display labels — 2026-09-25

## Result

All 11 `UNCERTAIN` IDs in `domain_display_label_source_audit_checkpoint_2026-09-25.md` were investigated against local lineage, the original domain-definition library where applicable, official occupational/industry classifications, and relevant specialist/public bodies.

| Decision | Count | IDs |
|---|---:|---|
| Supported keep | 5 | D089, D108, D113, D167, D168 |
| Supported rename | 6 | D086, D087, D088, D100, D101, D133 |
| Unsupported remove/hold | 0 | — |

These decisions concern labels and provenance only. Preserve all domain IDs and role/domain mappings. D086 remains excluded from student-facing use. No source documents, source records, `domain_meta.json`, mappings or other source files were changed. The fixes below are recommendations for a later, separately authorized data update.

## Method and evidence standard

Local lineage was checked in `domain_meta.json`, `domain_source_traceability_2026-08-31.json`, `domain_role_source_registry.json`, `DOMAIN_ROLE_SOURCE_REGISTRY.md`, and the 25 September subgroup source-naming audit. The original file `C:\Users\USER\Downloads\sifter_domain_definition_library_v2 (1).docx` was inspected at Section 6 and at the detailed records for D100, D101, D108, D113 and D133. For D086–D089, the traceability artifact records the original source title, source cluster, taxonomy anchors, source locator and role count even though their detailed definitions are absent from `domain_meta.json`.

External citations below are primary institutional or specialist-body sources. They support occupational/activity terminology or a field's documented career pathways. They do not establish Nigerian vacancies, earnings, licensing, learner suitability, or that every mapped role belongs exclusively to one domain. Source-library title evidence is identified separately from external classification evidence.

## Decisions and exact fixes

### D086 — Gaming, Betting and Lottery Operations

**Decision: supported rename.**

**Evidence and supported claim.** The original-library identity is “Gaming, Betting & Lottery Operations” (Section 6 / D086 in the source traceability record); the original cluster is “Retail, Sales & Commerce,” while the current metadata cluster is null. Local lineage records ISIC S920, ISCO 4212, 10 ESCO roles and an intentional student exclusion. UNSD ISIC Rev. 4 division 92 covers gambling facilities, lotteries and betting; class 9200 explicitly includes bookmaking, casinos, lottery-ticket sales and online gambling sites ([division 92](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/92), [class 9200](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/9200)). ILO ISCO-08 unit group 4212 is “Bookmakers, Croupiers and Related Gaming Workers” ([ISCO-08 Volume I, unit group 4212](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)). This supports a gambling/betting operations label; changing “Gaming” to “Gambling” removes ambiguity with video-game careers.

**Exact fix:** set display label to `Gambling, Betting & Lottery Operations`; set the missing cluster to the source value `Retail, Sales & Commerce`; restore the source-library definition verbatim if it can be recovered from the cited source record. Keep D086, all mappings and `excluded: true` unchanged. Do not author a replacement definition from the title or adjacent domains.

### D087 — Hairdressing, Barbering

**Decision: supported rename.**

**Evidence and supported claim.** Original-library title: “Hairdressing, Barbering & Hair Technology” (Section 6 / D087); source and current cluster both read “Beauty, Personal Care & Wellness.” Local lineage records ISCO 5141 and eight ESCO roles. ILO ISCO-08 identifies 5141 as Hairdressers within group 514, Hairdressers, Beauticians and Related Workers ([ISCO-08 Volume I, group 514](https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40dcomm/%40publ/documents/publication/wcms_172572.pdf)); UNSD ISIC 9602 covers hairdressing and other beauty treatment ([ISIC 9602](https://unstats.un.org/unsd/classifications/Econ/Structure/Detail/en/27/9602)). The narrower occupational classification corroborates the hairdressing identity; “Hair Technology” is specifically present in the original Sifter source title, not inferred from ILO.

**Exact fix:** set display label to `Hairdressing, Barbering & Hair Technology`. Keep ID, mapping, cluster and other fields unchanged. Do not expand the missing description beyond exact recoverable source text.

### D088 — Beauty Therapy, Aesthetics

**Decision: supported rename.**

**Evidence and supported claim.** Original-library title: “Beauty Therapy, Aesthetics & Spa Services” (Section 6 / D088); source and current cluster agree. Local lineage records ISCO 5142 and 14 ESCO roles. ILO ISCO-08 group 514 includes beauticians and related workers; UNSD ISIC 9602 explicitly covers hairdressing and other beauty treatment, including facial massage, manicure, pedicure and makeup ([ISCO-08 Volume I, group 514](https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40dcomm/%40publ/documents/publication/wcms_172572.pdf), [ISIC 9602](https://unstats.un.org/unsd/classifications/Econ/Structure/Detail/en/27/9602)). These external classifications support the beauty-treatment portion. “Spa Services” is supported by the original library title; the cited ISIC Rev. 4 class does not separately define spa services, so no stronger external spa claim is made.

**Exact fix:** set display label to `Beauty Therapy, Aesthetics & Spa Services`. Keep ID, mapping and cluster unchanged. Recover the source definition rather than constructing one from classification examples.

### D089 — Funeral and Mortuary Services

**Decision: supported keep.**

**Evidence and supported claim.** Original-library title is “Funeral & Mortuary Services” (Section 6 / D089); the current name “Funeral and Mortuary Services” is a faithful spelling expansion, and source/current clusters agree. Local lineage records ISCO 5163 and seven ESCO roles. ILO ISCO-08 unit group 5163 is “Undertakers and Embalmers”; UNSD ISIC division 96 expressly includes funeral and related activities ([ISCO-08 Volume I, unit group 5163](https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40dcomm/%40publ/documents/publication/wcms_172572.pdf), [ISIC division 96](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/96)).

**Exact fix:** no label change. Restore the source-library definition only from its own source record; leave ID, mappings and cluster unchanged.

### D100 — Plumbing, Pipefitting

**Decision: supported rename.**

**Evidence and supported claim.** Original-library title: “Plumbing, Pipefitting & HVAC Technology” (Section 6 / D100). Its detailed record says: “Water supply plumbing, drainage, gas pipe fitting, air conditioning installation, refrigeration.” It identifies a technical-college programme in Plumbing & Pipe Fitting and Air Conditioning & Refrigeration. Traceability records ISCO 7126 and 7127. ILO defines 7126 as Plumbers and Pipe Fitters and 7127 as Air Conditioning and Refrigeration Mechanics; the 7127 task description includes assembling, installing, maintaining and repairing air-conditioning and refrigeration systems ([ISCO-08 Volume I, unit groups 7126–7127](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)).

**Exact fix:** set display label to `Plumbing, Pipefitting & HVAC Technology`. If restoring a definition, use the cited source-library text, not a newly composed broader definition. Keep ID, role mappings and cluster unchanged.

### D101 — Painting, Decorating

**Decision: supported rename.**

**Evidence and supported claim.** Original-library title: “Painting, Decorating & Surface Treatment” (Section 6 / D101). Detailed source context: “Building painting, automotive spray painting, industrial surface treatment.” Local traceability records ISCO 7131 and 7132. ILO defines 7131 Painters and Related Workers and 7132 Spray Painters and Varnishers; the group covers surface preparation and applying paint, varnish and similar protective/decorative coatings to buildings, vehicles and manufactured products ([ISCO-08 Volume I, unit groups 7131–7132](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)).

**Exact fix:** set display label to `Painting, Decorating & Surface Treatment`. Keep ID, mappings and cluster unchanged. Preserve the full source qualifier rather than narrowing the mapped roles to building decoration.

### D108 — Printing Technology, Pre-press and Print Finishing

**Decision: supported keep.**

**Evidence and supported claim.** Original-library title: “Printing Technology, Pre-press & Print Finishing” (Section 6 / D108). The detailed source record names print shops, newspaper printing, packaging printers and label producers, with printing craft, reprographics, print finishing and binding programme anchors. ILO ISCO-08 group 732 contains 7321 Pre-press Technicians, 7322 Printers and 7323 Print Finishing and Binding Workers ([ISCO-08 Volume I, group 732](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)). UNSD ISIC class 1811 includes printing newspapers, books, advertising matter and labels ([ISIC 1811](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/1811)). The current metadata title preserves the source scope in ordinary wording.

**Exact fix:** no label or mapping change. Restore the source-library definition if needed. Keep “and” versus “&” as a display-style choice.

### D113 — Glass, Ceramics, Building Materials and Boiler Plant Operations

**Decision: supported keep.**

**Evidence and supported claim.** Original-library title: “Glass, Ceramics, Building Materials & Boiler Plant Operations” (Section 6 / D113). Its detailed record names glass manufacturing, ceramic kilns, cement/building-material production and boiler rooms. Traceability records ISCO 8181, 8182, 8183 and 8189. ILO identifies 8181 Glass and Ceramics Plant Operators and 8182 Steam Engine and Boiler Operators; its descriptions cover kiln/furnace operation, ceramics/glass manufacture, and operating boilers for industrial, institutional and marine power ([ISCO-08 Volume I, unit groups 8181–8182](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)).

**Exact fix:** no label change. Restore the original detailed definition if missing from derived metadata. Preserve the ID and existing mapping set.

### D133 — Luxury

**Decision: supported rename.**

**Evidence and supported claim.** Original-library identity: “Luxury & Bespoke Specialist Interiors — Aviation, Maritime & Automotive” (Section 6 / D133). The detailed record specifically describes VVIP aircraft completion, superyacht interiors and bespoke automotive work, and names completion/interiors firms and examples. Local traceability records industries C303, C309, C291, H501, N711 and N741, occupational groups including interior designers and craft roles, and 68 ESCO roles. UNSD ISIC defines division 30 as transport equipment (including ships and aircraft), class 3011 as shipbuilding/floating structures, class 3030 as air/spacecraft and related manufacture (including aircraft seats), and class 2910 as motor vehicle manufacture ([ISIC division 30](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/30), [ISIC 3011](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/3011), [ISIC 3030](https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/3030), [official ISIC revision structure](https://unstats.un.org/unsd/classifications/ISIC/revision)). The stored description in `domain_meta.json` instead defines broad luxury craft, fashion, jewellery, perfume and furniture work. That text conflicts with the source identity and detailed record; the word “Luxury” alone conceals the intended specialist field.

**Exact fix:** set display label to `Luxury & Bespoke Specialist Interiors`. Replace the conflicting broad description only with a source-approved definition of bespoke interiors/completions in aviation, maritime and automotive settings. The source record's industry-context paragraph may be used as scope evidence, but do not convert its market examples into an invented occupational definition. Keep ID, mappings, cluster and flags unchanged.

### D167 — XR & Immersive Technology

**Decision: supported keep.**

**Evidence and supported claim.** This is a later curated Sifter addition and has no row in the original 166-domain library. `domain_meta.json` describes XR as virtual/augmented-reality and spatial-computing applications plus hardware such as headsets, optics, haptics and motion capture. That is consistent with U.S. GAO's account of immersive technologies integrating the physical environment with digital content and their use in workforce training, agency processes and other applications ([GAO-24-106665](https://www.gao.gov/products/gao-24-106665)). OECD's *An Immersive Technologies Policy Primer* discusses XR/spatial computing, virtual-world layers, creator tools and digital infrastructure ([OECD report](https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/03/an-immersive-technologies-policy-primer_aa2e7910/cf39863d-en.pdf)). Those sources support the current umbrella label and core description. They do not establish Nigerian demand or the unregistered source IDs currently routed in `domain_role_source_registry.json` (`global_xr_gao_workforce_2024`, `global_jff_xr_2023`, `global_oecd_xr_2025`, `global_xra_2025`).

**Exact fix:** no display-label change. Keep D167, mapping, clusters and flags unchanged. In a later provenance update, create checked source-catalog entries for the primary sources actually reviewed and change only their evidence state/locator after ingestion; do not mark the four existing unregistered IDs as verified based on this report alone.

### D168 — Esports & Creator Economy

**Decision: supported keep.**

**Evidence and supported claim.** This is a later curated Sifter addition without an original-library row. Its checked-in description includes esports competition support, coaching/analysis, casting, events/team/community work and digital content creation/monetisation. British Esports Federation career pathways identify event management, analysts, shoutcasters, coaches, broadcast/production, journalism/content creation, marketing, community and team/organisation management ([British Esports career pathways](https://britishesports.org/esports-and-education/career-pathways/); [career overview](https://britishesports.org/the-hub/careers/getting-a-career-in-esports/)). UNESCO's *Behind the Screens* reports research on digital content creators across 45 countries and describes their content practices, skills, motivations and challenges ([UNESCO report](https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=%2Fark%3A%2F48223%2Fpf000&file=%2Fin%2Frest%2FannotationSVC%2FDownloadWatermarkedAttachment%2Fattach_import_786e0e39-4dec-4e34-ad59-0140487776a7%3F_%3D392006eng.pdf&id=p%3A%3Ausmarcdef_0000392006&locale=es&multi=true&v=2.1.196)). UK HMRC-commissioned research describes varied creator monetisation methods and social-media content creation as an increasingly considered self-employment route ([HMRC/NatCen report](https://www.gov.uk/government/publications/understanding-social-media-content-creators/research-to-understand-social-media-content-creators)). Together these support both parts of the existing umbrella label. They do not define a single standard occupation or prove local Nigerian demand. Registry entries for British Esports/Pearson and other sources remain routing metadata until the individual source records are checked and ingested.

**Exact fix:** no display-label change. Keep D168 and all mappings/cluster assignments unchanged. In a later provenance update, register and mark as checked only the source records actually consulted; keep esports and creator-economy evidence distinguishable by claim, and do not use either as evidence for local vacancy volume or guaranteed monetisation.

## Follow-up data issues (not applied)

1. Restore source-backed descriptions missing from the derived metadata for D086–D089, D100, D101, D108 and D113. The definition source or a reviewed extract must supply the text; do not infer it from names, codes or neighboring domain records.
2. Resolve the D086 cluster discrepancy using the recorded source value `Retail, Sales & Commerce` if that field is intended to reproduce the original library cluster.
3. Correct D133's label and reconcile its conflicting description against the original specialist-interiors scope before exposing description text to students.
4. Register and review the actual source documents for D167 and D168 before changing registry references from routing status to checked evidence.
5. Preserve every domain ID and mapping. Do not remove or hold any of these 11 domains based on the evidence reviewed here. Continue to enforce D086's existing student exclusion.

## Checkpoint files

- [Local-lineage and external-source checkpoints](domain_display_label_uncertain_investigation_checkpoint_2026-09-25.md)
- [Original uncertain-label checkpoint](domain_display_label_source_audit_checkpoint_2026-09-25.md)

