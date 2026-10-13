# Student/admin guidance UI audit checkpoint

Generated: 2026-09-21  
Mode: read-only UI/admin audit; no SQL, seed transport, generated catalogue,
external-search ledger, or live database changes.

## Scope reviewed

Controlling documents:

- `docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md`
- `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`
- `docs/GUIDANCE_FLOW_UI_UX_SPEC.md`
- `docs/ADMIN_DASHBOARD_UI_UX_SPEC.md`

Existing checkpoints also reviewed:

- `data/career-mapping/_audit/ROLE_LEARNING_CORE_AUDIT_2026-09-21.md`
- `data/career-mapping/_audit/full_population_admin_agent_checkpoint_2026-09-21.md`
- `data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.md`

Active student render path:

- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/ContextSourceLinks.tsx`
- `src/components/careerIntelligence/ExternalLinkGuard.tsx`
- `src/components/careerIntelligence/RoleWorkEvidenceBlock.tsx`
- `src/components/careerIntelligence/resourceLinks.ts`
- `src/lib/careerLabels.ts`
- `src/lib/studentCareerBoundary.ts`
- `src/types/career.ts`

Admin render path:

- `src/components/admin/AdminGuidanceEvidencePanel.tsx`
- `src/screens/admin/AdminCareerDetailScreen.tsx`
- `src/screens/admin/SkillsGapScreen.tsx`
- `src/screens/admin/adminGuidanceEvidence.ts`

## Findings

### Plain-language summaries — pass

- Domain hero and subgroup cards use `studentSummary` with reviewed orientation
  fields before description fallback.
- Subgroup role cards use the same bounded summary helper.
- The active role detail now uses the reviewed short intro, work description or
  study description in the hero before falling back to the hierarchy sentence.
- Missing copy correctly falls back to an honest unavailable message; no raw
  source wall was found in the active student branch.

### Canonical technical titles — partial pass

- Stable IDs remain route identities and are not replaced by summaries.
- Active cards currently mix raw `name` and `formatCareerLabel(name)`. The
  formatter is useful for readability but rewrites punctuation/casing, so it
  should not be treated as the canonical technical title. The next UI pass
  should render the canonical title unchanged and place the plain-language
  summary beneath it.
- Admin detail screens retain the raw record title and canonical IDs.

### Admin provenance and review visibility — pass locally

- `AdminCareerDetailScreen` exposes canonical IDs, source state, row review
  counts, ownership/link state and raw source provenance where returned.
- `AdminGuidanceEvidencePanel` exposes source URL, locator, access date,
  context/owner, relationship status, technical provenance counts, review
  queue state and the student-exposure decision.
- The approval/exposure helpers remain fail-closed for review-required,
  no-link, not-established, audit-only, unavailable, missing-identity and
  missing-provenance records.
- This is local render/contract evidence only; full-population browser proof
  and live payload proof remain open.

### Student-safe source links — pass with one small UI follow-up

- Student career data is loaded through `get*ForStudent` sanitizers.
- Student destinations pass through `studentSafeUrl` and `ExternalLinkGuard`;
  legacy O*NET URLs and non-HTTPS destinations are excluded.
- Supporting source links are kept separate from item learning links.
- No direct `Linking.openURL` call was found in the reviewed student career
  components. Admin source links remain explicitly admin/audit scoped.
- `ContextualItemList` now supplies an item-name fallback label when a verified
  item URL has no attached resource provider.

### Bounded role learning skills — pass locally

- The active role screen de-duplicates and renders at most 12 essential and 5
  optional skills, requiring an exact student-owned contextual item before a
  skill is shown.
- The existing role-learning audit covers 5,209 merged roles, reports 3,910
  raw over-cap source arrays, and confirms every student row is within the
  12/5 cap.
- Raw occupational arrays remain admin/source evidence rather than student
  learning requirements.

## Verification

- `pnpm.cmd exec tsc --noEmit --pretty false --incremental true` — **passed**.
- `python -m pytest data/career-mapping/_audit/test_role_learning_core.py data/career-mapping/_audit/test_admin_downstream_acceptance.py -q` — **6 passed**.
- `node scripts/adminGuidanceAuditSmoke.cjs` — **passed**.
- `node scripts/sociologyReportSmoke.cjs` — **passed**.
- `git diff --check` — **completed without diff errors**; existing line-ending
  normalization warnings were emitted for the already-dirty worktree.

## Files changed by this audit pass

- Added: `data/career-mapping/_audit/ui_admin_guidance_audit_2026-09-21.md`
- The follow-up UI edits are limited to the active role hero summary and the
  verified-item link accessibility label; no SQL, seed, transport, catalogue or
  external-ledger file was changed.

## Checkpoint decision

Local UI/admin contracts are verified enough to preserve the current work. The
remaining title work is presentation review only: canonical IDs and admin raw
titles remain preserved while student cards use readable display formatting.
Browser rendering, live Supabase payload verification, URL reachability and
manual SQL deployment remain deferred and are not claimed complete here.
