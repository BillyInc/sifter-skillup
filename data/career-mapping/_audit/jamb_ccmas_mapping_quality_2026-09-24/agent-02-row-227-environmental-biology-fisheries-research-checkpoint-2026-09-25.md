# Row 227 research checkpoint — Environmental Biology and Fisheries

**Date:** 2026-09-25  
**Lane:** research/checkpoint only  
**Range:** canonical JAMB identity row 227 (one-based; rows 141–280 audit)

## Change boundary

This checkpoint records research and a proposed, unapplied row-level change only. No shared `programme_mapping.json`, curriculum-scope, canonical inheritance, derived or active JAMB mapping JSON, seed, SQL, or role data was edited. The relevant shared JSON artifacts parsed successfully during the read-only integrity check preceding this investigation.

## Confirmed findings

### JAMB identity and occurrence

- The canonical identity is **Environmental Biology and Fisheries** (faculty: Sciences).
- The checked-in occurrence inventory records one Sciences brochure occurrence: `Sciences.pdf`, parsed occurrence ordinal 167, institution token `AAUA`. Its PDF locator and row-level verification flag are still missing in the local inventory.
- Separately, the official [JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) contains the exact programme/institution pairing **ENVIRONMENTAL BIOLOGY AND FISHERIES — AAUA**. This confirms that the pairing is present in the official brochure text extraction, but the local occurrence ledger still needs a page/row locator (ideally a visual check) before marking its locator fields verified.
- The mapping currently uses `Sciences::Biology` as its primary CCMAS component (`BIO`, with the `override->Biology` note).

### Current Biology scope

The row's reviewed scope currently selects 22 Biology courses and no Fisheries/Aquaculture CCMAS component. Biology evidence supports foundational ecology, aquatic systems and field methods, but does not by itself establish the specialist Fisheries facet:

- `BIO 202 Introductory Ecology` provides ecology foundations.
- `BIO 206 Hydrobiology` covers aquatic-system properties, aquatic communities, macrophytes/plankton, estuarine communities and aquatic succession.
- `BIO 307 Field Course I` supports sampling and identification/classification of specimens across environments, including aquatic environments.
- `BIO 407 Field Course II` supports field experiments, data collection, specimen handling and reporting, but its stated outcomes are not specifically fisheries outcomes.
- `BIO 300 SIWES` is generic industrial attachment. A local `fish` scope-match term is not evidence that the course teaches fisheries; it should not be used to claim a Fisheries curriculum facet.

The Biology source is the NUC [Sciences CCMAS 2023 PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), particularly its Biology course structure and the cited course descriptions/outcomes.

### Fisheries curriculum evidence

The NUC [Agriculture CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf) has a distinct parsed programme component, **Fisheries and Aquaculture** (`FAA`). It contains named courses and outcomes directly relevant to the missing facet:

| Course | Why it is relevant to this JAMB title | Evidence status |
|---|---|---|
| `FAA 301 Fisheries Biology` | Fisheries biology, commercial-fishery management concepts, biological parameters and fishery-resource management | Parsed course outcomes available |
| `FAA 303 Ichthyology (Systematics of Fish)` | Fish diversity, identification/classification and taxonomic relationships | Parsed course outcomes available |
| `FAA 305 Limnology` | Aquatic systems, water-body dynamics, aquatic organisms and limnological data | Parsed course outcomes available |
| `FAA 306 Fisheries Ecology` | Marine/freshwater ecosystems, biotic/abiotic limits, species interactions and fisheries systems | Parsed course outcomes available |
| `FAA 407 Aquatic Environment Survey; Climate Change in Fisheries and Aquaculture` | Aquatic environments/fishing grounds, fish and shellfish stocks, sustainable aquatic resources and climate impacts | Parsed course outcomes available |

These five are the narrowest supported candidate set for a Fisheries facet. `FAA 307 Principles of Aquaculture` is a plausible but broader aquaculture-production course; because the JAMB title says *Fisheries* rather than *Aquaculture*, leave it out of the minimal patch unless a reviewed outcome-to-title rationale supports including it. `FAA 308 Fisheries Stock Assessment` has an extraction note indicating its full outcomes were truncated; do not promote it until its complete source text is recovered and checked.

## Unresolved evidence / acceptance gates

1. **Occurrence locator:** Capture the precise PDF page/table row (and preferably a visual check) for the AAUA entry, then update the occurrence inventory in a separately authorized mapping-edit lane. The official text extraction confirms the pairing but does not supply the missing local locator metadata.
2. **Institution-specific scope:** CCMAS is a national benchmark and does not prove which exact FAA courses AAUA delivers or how it exercises permitted curriculum variation. Do not describe the candidate set as AAUA's verified course-by-course offering.
3. **Student-path taxonomy:** The existing `Fisheries, Aquaculture` domain candidate (`D120`) appears in the local taxonomy with institution-type metadata oriented toward polytechnic/technical-college routes. Its suitability for a university JAMB degree path needs review; do not activate it based on the label alone.
4. **Current link review:** Existing row-level links span several biology-adjacent domains. Their correctness for this exact JAMB occurrence has not been re-established by this research note. Preserve them as audit candidates during any later authorized repair; do not infer that their current active state is validated by this checkpoint.
5. **FAA 308:** Full course outcomes are not available in the parsed evidence reviewed here; recover and verify the source before considering this course.

## Minimal proposed row-only patch — NOT APPLIED

If the later serialized shared-artifact repair lane accepts the evidence and verifies the source locators:

1. Retain `Sciences::Biology` (`BIO`) as the primary component.
2. Add **Agricultural Science::Fisheries and Aquaculture** (`FAA`) as a supporting CCMAS component for this blended programme identity; do not replace Biology or union the entire FAA programme.
3. Select only `FAA 301`, `FAA 303`, `FAA 305`, `FAA 306`, and `FAA 407` as the initial Fisheries facet. Keep `FAA 307` optional/unselected pending a clear scope rationale; exclude `FAA 308` until its complete outcomes are verified.
4. Keep the row review-required while the exact occurrence locator, student-path taxonomy fit, and downstream relationship review remain open. Do not promote any unverified links into active student paths. Existing links should remain audit candidates, not be silently treated as confirmed by this proposal.
5. When a shared-artifact change is authorized, preserve the current row as a before-snapshot and reconcile only this JAMB identity across the relevant mapping/scope/canonical/derived/active artifacts, followed by focused cross-artifact invariants.

**Disposition:** A missing Fisheries curriculum facet is supported by distinct NUC CCMAS course/outcome evidence. A narrow candidate scope is identified; this is not yet an applied repair or proof of AAUA's delivered curriculum.
