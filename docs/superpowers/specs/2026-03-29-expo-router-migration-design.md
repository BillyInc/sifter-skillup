# Expo Router Migration Design

**Date:** 2026-03-29
**Status:** Approved
**Scope:** Migrate from @react-navigation/native to expo-router

## Overview

Migrate Sifter Skill_Up from programmatic React Navigation to file-based expo-router routing. This improves deep linking, TypeScript integration, and code organization.

## Architecture

### Current State
- Single `App.tsx` with programmatic navigation setup
- `@react-navigation/native` with stack navigators
- Navigation types defined inline
- 5 tabs with nested stack navigators

### Target State
- File-based routing via expo-router
- `app/` directory structure defines navigation
- Navigation types auto-generated from file structure
- `App.tsx` becomes minimal entry point

## File Structure

```
app/
├── _layout.tsx                    # Root layout (providers, error boundary, offline banner)
├── (auth)/
│   ├── _layout.tsx                # Auth stack layout
│   ├── index.tsx                  # AuthScreen (login)
│   └── onboarding.tsx             # OnboardingScreen
├── (tabs)/
│   ├── _layout.tsx                # Tab navigator with 5 tabs
│   ├── map/
│   │   ├── _layout.tsx            # Map stack layout
│   │   └── index.tsx              # IslandMapScreen
│   ├── skills/
│   │   ├── _layout.tsx            # Skills stack layout
│   │   ├── index.tsx              # SkillsScreen
│   │   ├── quant-map.tsx          # QuantMapScreen
│   │   ├── interview.tsx          # InterviewModeScreen
│   │   └── lesson.tsx             # LessonScreen (skills context)
│   ├── portfolio/
│   │   ├── _layout.tsx            # Portfolio stack layout
│   │   ├── index.tsx              # PortfolioScreen
│   │   └── hub.tsx                # PortfolioHubScreen
│   ├── community/
│   │   ├── _layout.tsx            # Community stack layout
│   │   ├── index.tsx              # CommunityScreen
│   │   ├── leaderboard.tsx       # LeaderboardScreen
│   │   ├── guild.tsx              # GuildScreen
│   │   └── referral.tsx           # ReferralScreen
│   └── profile/
│       ├── _layout.tsx            # Profile stack layout
│       ├── index.tsx              # ProfileScreen
│       ├── diary.tsx              # DiaryScreen
│       └── github.tsx             # GitHubScreen
└── map/
    └── lesson.tsx                 # LessonScreen (map context)
```

**Notes:**
- `(auth)` and `(tabs)` are route groups - they don't add to URL
- `lesson.tsx` exists in both `map/` and `skills/` for tab-specific context
- Shared component `src/screens/LessonScreen.tsx` contains the actual logic

## Navigation & Deep Linking

### URL Patterns

| URL | Screen |
|-----|--------|
| `sifter://` | Auth (if not logged in) or Onboarding (if not completed) |
| `sifter://map` | Island map |
| `sifter://map/lesson/[id]` | Lesson from map context |
| `sifter://skills` | Skills home |
| `sifter://skills/quant-map` | Quant map |
| `sifter://skills/lesson/[id]` | Lesson from skills context |
| `sifter://skills/interview/[trackId]/[level]` | Interview mode |
| `sifter://portfolio` | Portfolio home |
| `sifter://portfolio/hub` | Portfolio hub |
| `sifter://community` | Community home |
| `sifter://community/leaderboard` | Leaderboard |
| `sifter://community/guild/[guildId]` | Guild |
| `sifter://community/referral` | Referral |
| `sifter://profile` | Profile home |
| `sifter://profile/diary` | Diary |
| `sifter://profile/github` | GitHub |

### Navigation Changes

**Before:**
```typescript
navigation.navigate('Lesson', { levelId: 123 })
```

**After:**
```typescript
router.push('/map/lesson/123')  // or '/skills/lesson/123'
```

**Params:**
- Use `useLocalSearchParams()` instead of `route.params`
- Use `useRouter()` instead of `useNavigation()`

## Component Changes

### Root Layout (`app/_layout.tsx`)
- Wraps entire app with providers (GestureHandlerRootView, SafeAreaProvider, QueryClientProvider, AuthProvider)
- Contains ErrorBoundary and OfflineBanner
- No navigation logic - just providers

### Auth Layout (`app/(auth)/_layout.tsx`)
- Stack navigator for auth flow
- No tab bar
- Redirects to tabs after auth/onboarding

### Tabs Layout (`app/(tabs)/_layout.tsx`)
- Tab navigator with 5 tabs
- Custom tab icons (emoji + label)
- Tab bar styling matches current

### Stack Layouts (`app/(tabs)/*/ _layout.tsx`)
- Stack navigator for each tab
- `headerShown: false` (no headers)
- Screen-specific navigation options

### Screen Files
- Import existing screen components from `src/screens/`
- Pass navigation params via `useLocalSearchParams()`
- Use `useRouter()` for navigation

### LessonScreen Handling
- Keep `src/screens/LessonScreen.tsx` as shared component
- `app/map/lesson.tsx` and `app/skills/lesson.tsx` render it
- Pass `sourceTab` prop for context if needed

## Data Flow & State Management

### Auth Flow
- `useAuth` hook remains unchanged
- Auth layout checks `user` and `onboarding_completed`
- Redirects to appropriate route based on state
- Web platform skips onboarding (same as current)

### Query Client
- `queryClient` from `src/lib/queryClient` remains unchanged
- QueryClientProvider in root layout
- No changes to data fetching logic

### Navigation State
- Expo-router manages navigation state
- No need for manual navigation context
- Deep linking handled automatically

### Tab State
- Tab selection managed by expo-router
- No manual tab state tracking needed

## Error Handling & Edge Cases

### Error Boundaries
- `ErrorBoundary` in root layout (same as current)
- `ScreenErrorBoundary` in each stack layout
- Same error handling behavior

### Loading States
- Auth loading state in auth layout
- Same loading UI as current

### Platform Differences
- Web platform skips onboarding (same as current)
- Platform-specific logic in screen components unchanged

### Deep Linking Edge Cases
- Invalid routes → 404 screen (expo-router default)
- Missing params → handle in screen components
- Auth required routes → redirect to auth

## Testing Strategy

### Unit Tests
- Existing tests remain unchanged
- Screen components tested independently
- No navigation logic in tests

### Integration Tests
- Test navigation flows using expo-router's testing utilities
- Test deep linking with mock URLs
- Test auth flow redirects

### Manual Testing
- Test all tab navigation
- Test deep links for each route
- Test auth flow (login → onboarding → tabs)
- Test back navigation
- Test platform differences (iOS, Android, Web)

## Migration Steps

### Phase 1: Setup
1. Install expo-router and configure app.json
2. Create `app/` directory structure
3. Create root layout with providers

### Phase 2: Auth Flow
4. Create auth layout and screens
5. Implement auth/onboarding redirects

### Phase 3: Tabs
6. Create tabs layout with 5 tabs
7. Implement tab icons and styling

### Phase 4: Stacks & Screens
8. Create stack layouts for each tab
9. Move screen files to app directory
10. Update navigation calls in screens

### Phase 5: Cleanup
11. Remove old navigation code from App.tsx
12. Remove unused dependencies
13. Test all flows

### Phase 6: Polish
14. Test deep linking
15. Fix any edge cases
16. Update documentation

## Dependencies

### Add
- `expo-router` ~3.5.0
- `react-native-safe-area-context` (already installed)
- `react-native-screens` (already installed)

### Remove
- `@react-navigation/native` (replaced by expo-router)
- `@react-navigation/stack` (replaced by expo-router)
- `@react-navigation/bottom-tabs` (replaced by expo-router)

### Keep
- All other dependencies unchanged
- Screen components unchanged
- State management unchanged
