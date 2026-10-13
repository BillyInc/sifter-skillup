# Partition 02 — increment 032: rows 347–356 checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only evidence checkpoint. No shared mapping, curriculum scope, seed, SQL, UI, API, or taxonomy files were edited.

## Coverage and status

- Rows 347–356: 10 JAMB identities reviewed against the source-occurrence inventory, current CCMAS scope, active domain links, domain/subgroup structure and role library. **0/10 fully closed** to the requested standard. Every occurrence remains explicitly unverified against its JAMB PDF table; no offering locator was available in the inventory.
- Five identities are currently `review_required` with zero selected courses and no active paths: Surveying and Geoinformatics (348), Oceanography (351), Earth Science (352), Geoscience (353), Ecology (354), Applied Ecology (355), and Ecology and Environmental Studies (356) — seven rows. Each has a named or candidate source curriculum in the map; empty scope is not evidence of no curriculum or programme unavailability.
- Row 347 has a broad 9-domain map for one parsed institution; row 349 has two overlapping direct textile/fashion domains plus marketing; row 350 has a strong Film & Multimedia curriculum anchor but an adjacent Esports/Creator link requiring tight restriction.
- Distinguish the ecology identities 354–356 and geological identities 352–353; identical candidate CCMAS components do not prove identical courses or university offerings.

## JAMB source and context

Official JAMB sources consulted: [Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf). The official JAMB documents did not expose their relevant row tables through text extraction in this pass; all listed institution names remain parser tokens, not verified assignments.

| Row | JAMB identity | Parsed context / institution tokens | Audit note |
|---:|---|---|---|
| 347 | Supply Chain Management | Administration; BINGHAM | Exact identity; actual table and institution row unverified. |
| 348 | Surveying and Geoinformatics | Sciences; UNN, KASU | Preserve exact name; do not collapse with Land Surveying or Geoscience. |
| 349 | Textile Science and Technology | Sciences; ABU | Preserve distinct JAMB title; test whether its official offering is aligned to Clothing and Textile Design CCMAS. |
| 350 | Film and Video Studies | Administration; WESTERN-DEL | Exact identity is compatible with CCMAS Film and Multimedia, but school association is unverified. |
| 351 | OCEANOGRAPHY | Sciences; AKSU | Preserve title and source context; local curriculum proxy is Marine Science, not proof of full equivalence. |
| 352 | Earth Science | Sciences; LAUTECH | Distinct name; source context unverified. NUC accreditation results contain Earth Science as an institutional programme, but that is not a substitute for a CCMAS curriculum. |
| 353 | Geoscience | Sciences; AKSU | Keep distinct from Earth Science and Geology until offering-specific evidence resolves the curriculum relationship. |
| 354 | Ecology | Sciences; BAUCHI | Do not infer full Biology programme scope from the title. |
| 355 | Applied Ecology | Sciences; BAUCHI | Distinct named variant from Ecology; requires applied/ecosystem course outcomes. |
| 356 | Ecology and Environmental Studies | Sciences; JABU | Distinct combined name; do not assume it duplicates Ecology or Environmental Studies courses. |

## Course scope and source-backed curriculum check

Primary NUC references consulted: [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), [Environmental Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf), [Communication and Media Studies CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf), [Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf), and the NUC [undergraduate accreditation record for Earth Science](https://www.nuc.edu.ng/wp-content/uploads/2024/06/ACCREDITATTION-RESULTS-General.pdf). The NUC [Sciences CCMAS landing page](https://www.nuc.edu.ng/ccmas/) links the current Sciences document; the scope labels below still need to be audited course-by-course against it.

| Row | Stored scope | Evidence and gap |
|---:|---|---|
| 347 | Administration and Management::Logistics and Supply Chain Management; 19 selected courses: logistics/SCM foundations, transport economics, supply-chain design, global trade, procurement, demand forecasting, inventory, distribution, ICT, freight/intermodal, analytics, lean/quality, SIWES and research. | Strong, appropriately named CCMAS anchor. Courses support task families in procurement, inventory, transport/logistics, distribution, data visibility and process improvement. The active map contains nine domains; course-title overlap alone does not establish nine career routes. |
| 348 | Environmental Sciences::Surveying and Geoinformatics; zero selected courses. | A real named Environmental Sciences curriculum exists; local row scope is empty and the map is held. Reconstruct using survey/geodesy, mapping/GIS, remote sensing, cadastral and field-practice outcomes from the actual CCMAS before connecting surveying roles. |
| 349 | Environmental Sciences::Clothing and Textile Design; 19 selected CLT courses covering clothing techniques, weaving, textile production/design/materials, CAD, fashion, marketing, design consultancy, tailoring and research. | Substantive overlap exists, but Textile Science and Technology may emphasize industrial/textile-material production differently from Clothing and Textile Design. Confirm the row's exact JAMB programme context and full course coverage. Current D111 Textile/Garment and D075 Fashion/Textiles both directly include many of the same textile courses; this duplicate mapping may double-count adjacent classification rather than provide two distinct learner paths. |
| 350 | Communication and Media Studies::Film & Multimedia; 21 selected courses including film history/culture, analysis, production, directing, editing, sound, multimedia, internship, distribution, law, documentary, entrepreneurship and capstone projects. | Strong content fit. NUC FMM 205 outcomes explicitly include executing a simple film project and understanding pre-production, production and post-production; production/editing paths are source-grounded. The extra esports/creator link is not required by the curriculum. |
| 351 | Sciences::Marine Science (mapped as candidate for Oceanography); zero selected courses. | Marine Science is related but not synonymous by label. NUC historical science curriculum evidence includes chemical oceanography, ocean-floor geology, coastal processes, oceanic dynamics, underwater operations, deep-sea exploration and marine pollution, but current CCMAS scope/course outcomes must be checked. Do not expose maritime, oceanographic modelling or marine-resource roles based on a title-only proxy. |
| 352 | Sciences::Geology; zero selected courses. | NUC accreditation records independently show Earth Science as a programme name, so this is not a fictitious identity. But an accreditation listing does not prove that the Geology CCMAS is an adequate complete Earth Science curriculum. Need course-level geoscience/earth-system coverage and authoritative external evidence for gaps. |
| 353 | Sciences::Geology; zero selected courses. | Geology is a plausible broad anchor, but no selected course evidence demonstrates the coverage of this particular Geoscience offering. Establish geophysics, geology, geochemistry, GIS/field mapping or other content only from the corresponding curriculum/outcome evidence, not name proximity. |
| 354 | Sciences::Biology; zero selected courses. | Biology is an overly broad proxy absent scoped ecology courses. Verify the current Biology CCMAS ecology/ecosystem/biodiversity/conservation learning outcomes before mapping any role. |
| 355 | Sciences::Biology; zero selected courses. | Applied Ecology needs evidence of field/ecosystem assessment, conservation/restoration, ecological methods, environmental monitoring and applied practice. The generic Biology component alone does not prove those specializations. |
| 356 | Sciences::Biology; zero selected courses. | The combined title may require both ecology and environmental studies content; no selected rows are present to demonstrate either. Do not assume the Biology component covers all environmental-study outcomes or treat it as identical to 354/355. |

## Current domain → subgroup → role assessment

Descendant groups and sample roles were inspected in the checked-in taxonomy; this section does not approve any role merely because a matching domain label exists.

| Row | Active links and descendant findings |
|---:|---|
| 347 | D034 Supply Chain Management and D035 Logistics are direct; D036 Procurement, D028 General Management, D030 Marketing, D009 Data Science, D062 Trading, D063 Economics and D079 Customs/International Trade are functional. Descendants include procurement/supply-chain specialists, inventory and logistics roles, but also broad commercial managers, data analysts, economists and customs roles. Selected courses plausibly support bounded SCM/logistics/procurement/analytics pathways; they do not establish generic data-science, marketing-management, general-management or every international-trade role. Retain only task-aligned subgroups and roles after checking role work profiles. |
| 348 | No active links; no role path. This is a hold while the valid Surveying and Geoinformatics component has no selected course rows. Do not infer land surveyor/cadastral/GIS paths until course and role-specific competency coverage is reconstructed. |
| 349 | D111 Textile/Garment and D075 Fashion/Textiles are both direct; D030 Marketing is functional. D111 has textile production/material and garment subgroups; D075 spans fashion/textile technology, garment making and textile-machine operators. CLT outcomes support selected design, clothing construction, textile production and CAD tasks, but exact role duplication between D111 and D075 should be resolved. Textile/fashion marketing courses may support narrow value-chain tasks, not all marketing-management jobs. |
| 350 | D042 Media Production direct (including creative direction, production crew, camera/sound and editing descendants); D168 Esports/Creator Economy adjacent. FMM course/outcome evidence supports selected film, video, multimedia production and post-production tasks. Esports content/broadcast is only a possible optional transfer; no esports operations or team-management role follows automatically. |
| 351–356 | No active paths and no selected courses. Keep downstream blank/held rather than inferring scientific, environmental or field occupations from labels. After scope reconstruction, test subgroup and role-specific competencies—for example marine observation/analysis, earth-science field/lab work, ecological survey/conservation—against source outcomes and external authoritative evidence where CCMAS does not cover them. |

## Correction queue (no edits made)

1. Verify all ten JAMB programme/institution rows visually in the official brochures and record page/table locators; retain separate identities.
2. Rebuild scoped course/outcome ledgers for 348 and 351–356. Treat the NUC Earth Science listing as identity evidence only, not curriculum authority.
3. Review whether Textile Science and Technology should use one or multiple clearly differentiated textile domains; do not duplicate the same learning evidence across both paths without a learner-facing reason.
4. For Supply Chain Management, inspect each of its nine routes through exact subgroups/role profiles and retain only supported, clearly labelled core versus transferable paths.
5. For Film and Video Studies, keep film production, editing, distribution and multimedia routes distinct from optional creator/e-sports work.

**Disposition:** evidence checkpoint only. No canonical link was promoted, removed, or modified. Next tranche: rows 357–366.
