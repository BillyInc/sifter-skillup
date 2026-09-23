# Agent publish checkpoint — 2026-09-21

## Scope decision

The safe publish subset contained only complete application-layer TypeScript
changes under `src/`. No SQL, SQL-gzip, JSON, generated seed/data, audit,
handoff, or enrichment files were staged or committed.

## Exact committed paths

- `src/components/careerIntelligence/CertPlacementList.tsx`
- `src/components/careerIntelligence/ContextSourceLinks.tsx`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/ExternalLinkGuard.tsx`
- `src/components/careerIntelligence/FoundationSkillsBlock.tsx`
- `src/components/careerIntelligence/GuidanceEvidenceBlock.tsx`
- `src/components/careerIntelligence/MethodEvidenceBlock.tsx`
- `src/components/careerIntelligence/NigerianContextBlock.tsx`
- `src/components/careerIntelligence/RoleWorkEvidenceBlock.tsx`
- `src/components/careerIntelligence/SkillDiscoveryPanel.tsx`
- `src/components/careerIntelligence/ToolGroupsBlock.tsx`
- `src/components/careerIntelligence/resourceLinks.ts`
- `src/lib/careerData.ts`
- `src/lib/careerLabels.ts`
- `src/lib/studentCareerBoundary.ts`
- `src/screens/CareerHomeScreen.tsx`
- `src/screens/ExploreScreen.tsx`
- `src/screens/admin/AdminCareerDetailScreen.tsx`
- `src/screens/admin/StudentProvisioningScreen.tsx`
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx`
- `src/screens/careerIntelligence/OpportunityDetailScreen.tsx`
- `src/screens/careerIntelligence/PathwaysHubScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeCompareScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/types/career.ts`

## Verification

- `pnpm.cmd run test:sociology-route` — passed.
- `pnpm.cmd run test:sociology-report` — passed.
- `pnpm.cmd run test:programme-scale` — passed.
- `git diff --cached --check` — passed before commit.
- TypeScript check — terminated with Node heap exhaustion; no TypeScript
  diagnostics were produced.

## Commit and push

- Commit: `49bd011` (`Harden student career guidance rendering`)
- Local commit completed successfully.
- Push target: `origin very-new`
- Push status: blocked/failed. The terminal error was:

  `error: RPC failed; HTTP 408 curl 22 The requested URL returned error: 408`

  followed by `send-pack: unexpected disconnect while reading sideband packet`
  and `fatal: the remote end hung up unexpectedly`.

No further push retries were made. The local branch remains ahead of
`origin/very-new`; the remote update is not claimed.
