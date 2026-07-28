# Pre-Existing TypeScript Errors

> Generated: 2026-07-24 from `npx tsc --noEmit`
> All errors below existed BEFORE Phase 0 changes. None were introduced by the redesign work.
> Updated: webContainer width error fixed (2026-07-24). CareerProfileScreen fixed. WebGrid/IslandMap fixed.

---

## Remaining Errors (9)

### 1. `HomeScreen` type mismatches (5 errors)

**File:** `src/screens/HomeScreen.tsx`

| Line | Error |
|------|-------|
| 305 | `Type 'string' is not assignable to type 'number'` |
| 306 | `Type 'string' is not assignable to type 'number'` |
| 425 | `Comparison appears unintentional: '"track" | "overview"' vs '"island"'` |
| 767 | `Type 'string' is not assignable to type 'number'` |
| 768 | `Type 'string' is not assignable to type 'number'` |

### 2. `LessonScreen` missing property (2 errors)

**File:** `src/screens/LessonScreen.tsx:852,918`

`Property 'title' does not exist on type 'StarknetLabRef'`

### 3. `QuantMapScreen` missing property (1 error)

**File:** `src/screens/QuantMapScreen.tsx:444`

`Property 'active_track_id' does not exist on type 'UserProfile'. Did you mean 'active_track'?`

### 4. `WorldScreen` missing property (1 error)

**File:** `src/screens/WorldScreen.tsx:344`

`Property 'accentColor' does not exist on type 'FieldSkillTrack'.`
