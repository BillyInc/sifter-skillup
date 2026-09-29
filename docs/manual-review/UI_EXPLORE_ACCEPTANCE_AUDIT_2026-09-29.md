# UI Explore and Programme Intelligence acceptance audit — 2026-09-29

Scope: original UI brief, `ADMIN_EXPLORE_PROGRAMME_MARKET_INTELLIGENCE_MOCKUP.md`,
and the clarified layered-report requirements. Skills Matcher is explicitly
excluded. This records local code evidence; it is not proof of live database
contents or deployment.

| Requirement | Local implementation evidence | Status / remaining dependency |
|---|---|---|
| Programme preview uses approved source-backed abilities/outcomes and honest unavailable states | `src/lib/programmePreview.ts`; `src/lib/programmePreview.test.ts`; UI issue flow coverage | Code/test pass; browser proof still needed. |
| University choice shows offering overview/requirements; Back preserves preview/stage; Skip to guidance navigates | `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx`; original brief; `__tests__/uiIssueFlow.test.ts` | Code/test pass; live route/browser proof still needed. |
| First audience/detail selection does not collapse onboarding | `src/screens/admin/EducatorOnboarding.tsx`; `__tests__/uiIssueFlow.test.ts` | Code/test pass. |
| School account flow: upload-first, explicit create, removable/deduplicated drafts, SS1–SS3, single row no extra tick, consent independent; tutorial centre stays JAMB-only | `src/screens/admin/StudentProvisioningScreen.tsx`, `src/lib/provisioningFlow.ts`, `__tests__/provisioningFlow.test.ts`, `__tests__/uiIssueFlow.test.ts` | Focused UI tests pass; browser proof still needed. |
| University Explore is own-offering scoped; school/tutorial Explore is public-catalogue oriented and org-specific | `src/screens/admin/AdminExploreSurfaces.tsx`, `src/screens/ExploreScreen.tsx`, `src/lib/adminExploreState.ts`, `src/screens/admin/AdminExploreSurfaces.test.tsx` | Local test/build pass; no authenticated browser proof yet. |
| Portfolio comparison lists peer-only JAMB identities and per-offering domain/specialization/role counts; privacy scope preserved | `backend/routes/institutions_routes.py`, `src/screens/admin/AdminExploreSurfaces.tsx`, `src/screens/admin/PeersScreen.tsx`, `backend/tests/test_peer_programme_comparison.py` | Backend comparison tests and UI component test pass. Actual authorized live endpoint/browser proof remains open. |
| Report index retains JAMB identity/faculty/offering ID and drills into a selected offering | `src/screens/admin/SkillsGapScreen.tsx`, `src/screens/admin/SkillsGapScreen.test.tsx` | Screen interaction test passes; browser proof still needed. |
| Mapped curriculum courses/outcomes are distinguished from institution-specific delivery; no legacy arrays substituted | `ProgrammeCurriculumEvidence` in `backend/routes/institutions_routes.py`; `CurriculumBaseline` in `SkillsGapScreen.tsx` | Corrected labels and source-backed filter; current API returns mapped CCMAS baseline, not institution-specific teaching. |
| CCMAS component provenance and authoritative external curriculum comparison for incomplete/unanchored JAMB offerings | Current report payload has course title/code, student/source text, display group, locator and data state; it does not identify source CCMAS component(s) or provide a separate external-curriculum coverage contract | **Not complete.** Show external-evidence limitation; no inferred coverage/gaps. Requires source-backed offering evidence/API/seed work, explicitly outside this UI-only push. |
| Same-title offering contexts remain distinct, including FUOTUOKE Social Sciences Accounting and Finance | Comparison API retains offering ID, canonical JAMB ID and faculty when present. Current canonical source/seed omission is documented in checkpoint. | **Data dependency.** FUOTUOKE Social Sciences identity/offering is not in the canonical seed available to this UI; do not collapse it into Administration or claim it is compared. No source ledger/seed changed. |
| Direct → functional → adjacent paths; subgroup/role reach and connection explanation | `ProgrammeCoverageCard`/`DomainCoverageCard` in `SkillsGapScreen.tsx`, ordered by match type, grouped by source/scope and role, displaying API explanation | UI order and explanation present. Source-backed curriculum-to-path evidence quality is not re-audited in this UI tranche. |
| Item-level category, tool-use category, relationship, status, source and confirmed gaps | `ResourceRow`, `programmeEvidence.ts`, `SkillsGapEvidence.test.ts` | Categories/relationship/status/source context displayed. “Gap” requires explicit verified/approved evidence state, explicit source-backed/verified data state and retained locator. Tool category/relationship/status may remain blank/not specified if API data lacks it. |
| Market Intelligence is demand-only; no demand inferred from taxonomy reach | `src/screens/admin/MarketIntelligenceScreen.tsx`; peer compare displays demand as Coming soon | Runtime Market screen renders aggregate demand surfaces only; no current specialization-demand feed or provenance is available. Screen/build verified; no dedicated market UI test. |
| No Skills Matcher implementation or behavior changes | `src/screens/SkillsMatcherScreen.tsx` not edited by this task | Must verify exact changed paths before stage/push. |

## Verification recorded

- Focused UI Jest: **7 suites / 21 tests passed** (Explore async comparison,
  report index/drill-down, audience state, programme preview, provisioning,
  original issue flow, and item-specific expectation gate).
- Vite production build: **passed**; existing duplicate-key/style and large
  chunk warnings remain outside this task.
- Backend comparison/domain/institution-access pytest: **96 passed**, with a
  cache-permission warning only.
- `npx tsc --noEmit --pretty false`: **passed** with 4 GB Node heap.
- `pnpm.cmd run build`: **passed**; existing duplicate-key/style and large
  bundle warnings remain outside this UI task.
- Browser proof is not performed. The local API and Vite server start, but the
  available computer-use surface has no browser/app inventory (`apps: []`,
  `browsers: []`), so no authenticated UI session can be inspected here.
- No SQL, source ledgers, curriculum seeds or generated transports were
  changed by this UI tranche.
