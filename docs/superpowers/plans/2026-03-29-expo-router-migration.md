# Expo Router Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate from @react-navigation/native to expo-router for file-based routing, better deep linking, and improved TypeScript integration.

**Architecture:** File-based routing with `app/` directory structure. Route groups for auth and tabs. Shared screen components remain in `src/screens/`. Navigation types auto-generated from file structure.

**Tech Stack:** expo-router ~3.5.0, React Native 0.74.5, Expo SDK 51, TypeScript

---

## File Structure

**Files to create:**
- `app/_layout.tsx` - Root layout with providers
- `app/(auth)/_layout.tsx` - Auth stack layout
- `app/(auth)/index.tsx` - Auth screen
- `app/(auth)/onboarding.tsx` - Onboarding screen
- `app/(tabs)/_layout.tsx` - Tab navigator
- `app/(tabs)/map/_layout.tsx` - Map stack
- `app/(tabs)/map/index.tsx` - Island map
- `app/(tabs)/map/lesson.tsx` - Lesson (map context)
- `app/(tabs)/skills/_layout.tsx` - Skills stack
- `app/(tabs)/skills/index.tsx` - Skills home
- `app/(tabs)/skills/quant-map.tsx` - Quant map
- `app/(tabs)/skills/interview.tsx` - Interview mode
- `app/(tabs)/skills/lesson.tsx` - Lesson (skills context)
- `app/(tabs)/portfolio/_layout.tsx` - Portfolio stack
- `app/(tabs)/portfolio/index.tsx` - Portfolio home
- `app/(tabs)/portfolio/hub.tsx` - Portfolio hub
- `app/(tabs)/community/_layout.tsx` - Community stack
- `app/(tabs)/community/index.tsx` - Community home
- `app/(tabs)/community/leaderboard.tsx` - Leaderboard
- `app/(tabs)/community/guild.tsx` - Guild
- `app/(tabs)/community/referral.tsx` - Referral
- `app/(tabs)/profile/_layout.tsx` - Profile stack
- `app/(tabs)/profile/index.tsx` - Profile home
- `app/(tabs)/profile/diary.tsx` - Diary
- `app/(tabs)/profile/github.tsx` - GitHub
- `app/map/lesson.tsx` - Lesson (map context, outside tabs)

**Files to modify:**
- `app.json` - Add expo-router plugin
- `package.json` - Add expo-router dependency
- `App.tsx` - Simplify to expo-router entry point
- `src/screens/LessonScreen.tsx` - Update to use expo-router hooks

**Files to remove:**
- Old navigation types from `App.tsx` (MapStackParamList, SkillsStackParamList, etc.)

---

## Phase 1: Setup

### Task 1: Install expo-router

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add expo-router to dependencies**

```json
"expo-router": "~3.5.0",
```

Add this line to the `dependencies` section in `package.json`, after `"expo-notifications"` and before `"expo-secure-store"`.

- [ ] **Step 2: Run npm install**

```bash
npm install --legacy-peer-deps
```

Expected: expo-router installed successfully

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add expo-router dependency"
```

---

### Task 2: Configure app.json

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Add expo-router plugin**

```json
"plugins": [
  "expo-router",
  "expo-font",
  [
    "expo-notifications",
    {
      "icon": "./assets/icon.png",
      "color": "#6366f1"
    }
  ]
],
```

Replace the existing `plugins` array in `app.json` with this version that includes `"expo-router"` at the beginning.

- [ ] **Step 2: Commit**

```bash
git add app.json
git commit -m "feat: add expo-router plugin to app.json"
```

---

### Task 3: Create app directory structure

**Files:**
- Create: `app/` directory and subdirectories

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p app/\(auth\)
mkdir -p app/\(tabs\)/map
mkdir -p app/\(tabs\)/skills
mkdir -p app/\(tabs\)/portfolio
mkdir -p app/\(tabs\)/community
mkdir -p app/\(tabs\)/profile
mkdir -p app/map
```

Expected: All directories created

- [ ] **Step 2: Commit**

```bash
git add app/
git commit -m "feat: create expo-router directory structure"
```

---

## Phase 2: Root Layout

### Task 4: Create root layout with providers

**Files:**
- Create: `app/_layout.tsx`

- [ ] **Step 1: Create root layout file**

```typescript
import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '../src/hooks/useAuth';
import { queryClient } from '../src/lib/queryClient';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { Colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <OfflineBanner />
              <View style={styles.container}>
                {/* Slot for child routes */}
              </View>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: create root layout with providers"
```

---

## Phase 3: Auth Flow

### Task 5: Create auth layout

**Files:**
- Create: `app/(auth)/_layout.tsx`

- [ ] **Step 1: Create auth stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { ActivityIndicator, Text, View, Platform } from 'react-native';
import { Colors } from '../../src/theme';
import { API } from '../../src/lib/api';

export default function AuthLayout() {
  const { user, loading, refreshUser } = useAuth();

  // Redirect to tabs if authenticated and onboarding complete
  React.useEffect(() => {
    if (!loading && user && user.onboarding_completed) {
      // expo-router handles redirect automatically
    }
  }, [user, loading]);

  // Handle web platform onboarding skip
  if (!loading && user && !user.onboarding_completed && Platform.OS === 'web') {
    React.useEffect(() => {
      API.completeOnboarding({}).then(() => refreshUser()).catch(() => refreshUser());
    }, []);
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

const styles = {
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingEmoji: {
    fontSize: 64,
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/_layout.tsx"
git commit -m "feat: create auth stack layout"
```

---

### Task 6: Create auth screen

**Files:**
- Create: `app/(auth)/index.tsx`

- [ ] **Step 1: Create auth login screen**

```typescript
import React from 'react';
import AuthScreen from '../../src/screens/AuthScreen';

export default function LoginScreen() {
  return <AuthScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/index.tsx"
git commit -m "feat: create auth login screen"
```

---

### Task 7: Create onboarding screen

**Files:**
- Create: `app/(auth)/onboarding.tsx`

- [ ] **Step 1: Create onboarding screen**

```typescript
import React from 'react';
import { useRouter } from 'expo-router';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { useAuth } from '../../src/hooks/useAuth';
import { API } from '../../src/lib/api';

export default function OnboardingRoute() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleComplete = async (trackId: string) => {
    await API.completeOnboarding({ active_track: trackId });
    refreshUser();
    router.replace('/(tabs)');
  };

  const handleBrowse = () => {
    API.completeOnboarding({}).then(() => refreshUser());
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScreen
      onComplete={handleComplete}
      onBrowse={handleBrowse}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(auth)/onboarding.tsx"
git commit -m "feat: create onboarding screen"
```

---

## Phase 4: Tabs Layout

### Task 8: Create tabs layout

**Files:**
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create tab navigator layout**

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '../../src/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, fontWeight: focused ? '800' : '600', color: focused ? Colors.accent : Colors.textSoft }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 72,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="skills"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎓" label="Skills" focused={focused} /> }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💼" label="Portfolio" focused={focused} /> }}
      />
      <Tabs.Screen
        name="community"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌐" label="Community" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: create tabs layout with 5 tabs"
```

---

## Phase 5: Map Stack

### Task 9: Create map stack layout

**Files:**
- Create: `app/(tabs)/map/_layout.tsx`

- [ ] **Step 1: Create map stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';

export default function MapStackLayout() {
  return (
    <ScreenErrorBoundary screenName="Map">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="lesson" />
      </Stack>
    </ScreenErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/map/_layout.tsx"
git commit -m "feat: create map stack layout"
```

---

### Task 10: Create island map screen

**Files:**
- Create: `app/(tabs)/map/index.tsx`

- [ ] **Step 1: Create island map screen**

```typescript
import React from 'react';
import IslandMapScreen from '../../../src/screens/IslandMapScreen';

export default function IslandMapRoute() {
  return <IslandMapScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/map/index.tsx"
git commit -m "feat: create island map screen"
```

---

### Task 11: Create map lesson screen

**Files:**
- Create: `app/(tabs)/map/lesson.tsx`

- [ ] **Step 1: Create map lesson screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LessonScreen from '../../../src/screens/LessonScreen';

export default function MapLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = parseInt(id || '0', 10);

  return <LessonScreen levelId={levelId} sourceTab="map" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/map/lesson.tsx"
git commit -m "feat: create map lesson screen"
```

---

## Phase 6: Skills Stack

### Task 12: Create skills stack layout

**Files:**
- Create: `app/(tabs)/skills/_layout.tsx`

- [ ] **Step 1: Create skills stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';

export default function SkillsStackLayout() {
  return (
    <ScreenErrorBoundary screenName="Skills">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="quant-map" />
        <Stack.Screen name="interview" />
        <Stack.Screen name="lesson" />
      </Stack>
    </ScreenErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/skills/_layout.tsx"
git commit -m "feat: create skills stack layout"
```

---

### Task 13: Create skills home screen

**Files:**
- Create: `app/(tabs)/skills/index.tsx`

- [ ] **Step 1: Create skills home screen**

```typescript
import React from 'react';
import SkillsScreen from '../../../src/screens/SkillsScreen';

export default function SkillsHomeRoute() {
  return <SkillsScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/skills/index.tsx"
git commit -m "feat: create skills home screen"
```

---

### Task 14: Create quant map screen

**Files:**
- Create: `app/(tabs)/skills/quant-map.tsx`

- [ ] **Step 1: Create quant map screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import QuantMapScreen from '../../../src/screens/QuantMapScreen';

export default function QuantMapRoute() {
  const { trackId } = useLocalSearchParams<{ trackId?: string }>();

  return <QuantMapScreen trackId={trackId} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/skills/quant-map.tsx"
git commit -m "feat: create quant map screen"
```

---

### Task 15: Create interview mode screen

**Files:**
- Create: `app/(tabs)/skills/interview.tsx`

- [ ] **Step 1: Create interview mode screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import InterviewModeScreen from '../../../src/screens/InterviewModeScreen';

export default function InterviewModeRoute() {
  const { trackId, level } = useLocalSearchParams<{ trackId: string; level: string }>();

  return <InterviewModeScreen trackId={trackId} level={level} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/skills/interview.tsx"
git commit -m "feat: create interview mode screen"
```

---

### Task 16: Create skills lesson screen

**Files:**
- Create: `app/(tabs)/skills/lesson.tsx`

- [ ] **Step 1: Create skills lesson screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LessonScreen from '../../../src/screens/LessonScreen';

export default function SkillsLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = parseInt(id || '0', 10);

  return <LessonScreen levelId={levelId} sourceTab="skills" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/skills/lesson.tsx"
git commit -m "feat: create skills lesson screen"
```

---

## Phase 7: Portfolio Stack

### Task 17: Create portfolio stack layout

**Files:**
- Create: `app/(tabs)/portfolio/_layout.tsx`

- [ ] **Step 1: Create portfolio stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';

export default function PortfolioStackLayout() {
  return (
    <ScreenErrorBoundary screenName="Portfolio">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="hub" />
      </Stack>
    </ScreenErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/portfolio/_layout.tsx"
git commit -m "feat: create portfolio stack layout"
```

---

### Task 18: Create portfolio home screen

**Files:**
- Create: `app/(tabs)/portfolio/index.tsx`

- [ ] **Step 1: Create portfolio home screen**

```typescript
import React from 'react';
import PortfolioScreen from '../../../src/screens/PortfolioScreen';

export default function PortfolioHomeRoute() {
  return <PortfolioScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/portfolio/index.tsx"
git commit -m "feat: create portfolio home screen"
```

---

### Task 19: Create portfolio hub screen

**Files:**
- Create: `app/(tabs)/portfolio/hub.tsx`

- [ ] **Step 1: Create portfolio hub screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PortfolioHubScreen from '../../../src/screens/PortfolioHubScreen';

export default function PortfolioHubRoute() {
  const { trackId } = useLocalSearchParams<{ trackId?: string }>();

  return <PortfolioHubScreen trackId={trackId} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/portfolio/hub.tsx"
git commit -m "feat: create portfolio hub screen"
```

---

## Phase 8: Community Stack

### Task 20: Create community stack layout

**Files:**
- Create: `app/(tabs)/community/_layout.tsx`

- [ ] **Step 1: Create community stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';

export default function CommunityStackLayout() {
  return (
    <ScreenErrorBoundary screenName="Community">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="guild" />
        <Stack.Screen name="referral" />
      </Stack>
    </ScreenErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/community/_layout.tsx"
git commit -m "feat: create community stack layout"
```

---

### Task 21: Create community home screen

**Files:**
- Create: `app/(tabs)/community/index.tsx`

- [ ] **Step 1: Create community home screen**

```typescript
import React from 'react';
import CommunityScreen from '../../../src/screens/CommunityScreen';

export default function CommunityHomeRoute() {
  return <CommunityScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/community/index.tsx"
git commit -m "feat: create community home screen"
```

---

### Task 22: Create leaderboard screen

**Files:**
- Create: `app/(tabs)/community/leaderboard.tsx`

- [ ] **Step 1: Create leaderboard screen**

```typescript
import React from 'react';
import LeaderboardScreen from '../../../src/screens/LeaderboardScreen';

export default function LeaderboardRoute() {
  return <LeaderboardScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/community/leaderboard.tsx"
git commit -m "feat: create leaderboard screen"
```

---

### Task 23: Create guild screen

**Files:**
- Create: `app/(tabs)/community/guild.tsx`

- [ ] **Step 1: Create guild screen**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GuildScreen from '../../../src/screens/GuildScreen';

export default function GuildRoute() {
  const { guildId } = useLocalSearchParams<{ guildId?: string }>();

  return <GuildScreen guildId={guildId} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/community/guild.tsx"
git commit -m "feat: create guild screen"
```

---

### Task 24: Create referral screen

**Files:**
- Create: `app/(tabs)/community/referral.tsx`

- [ ] **Step 1: Create referral screen**

```typescript
import React from 'react';
import ReferralScreen from '../../../src/screens/ReferralScreen';

export default function ReferralRoute() {
  return <ReferralScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/community/referral.tsx"
git commit -m "feat: create referral screen"
```

---

## Phase 9: Profile Stack

### Task 25: Create profile stack layout

**Files:**
- Create: `app/(tabs)/profile/_layout.tsx`

- [ ] **Step 1: Create profile stack layout**

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';

export default function ProfileStackLayout() {
  return (
    <ScreenErrorBoundary screenName="Profile">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="diary" />
        <Stack.Screen name="github" />
      </Stack>
    </ScreenErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/profile/_layout.tsx"
git commit -m "feat: create profile stack layout"
```

---

### Task 26: Create profile home screen

**Files:**
- Create: `app/(tabs)/profile/index.tsx`

- [ ] **Step 1: Create profile home screen**

```typescript
import React from 'react';
import ProfileScreen from '../../../src/screens/ProfileScreen';

export default function ProfileHomeRoute() {
  return <ProfileScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/profile/index.tsx"
git commit -m "feat: create profile home screen"
```

---

### Task 27: Create diary screen

**Files:**
- Create: `app/(tabs)/profile/diary.tsx`

- [ ] **Step 1: Create diary screen**

```typescript
import React from 'react';
import DiaryScreen from '../../../src/screens/DiaryScreen';

export default function DiaryRoute() {
  return <DiaryScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/profile/diary.tsx"
git commit -m "feat: create diary screen"
```

---

### Task 28: Create github screen

**Files:**
- Create: `app/(tabs)/profile/github.tsx`

- [ ] **Step 1: Create github screen**

```typescript
import React from 'react';
import GitHubScreen from '../../../src/screens/GitHubScreen';

export default function GitHubRoute() {
  return <GitHubScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/profile/github.tsx"
git commit -m "feat: create github screen"
```

---

## Phase 10: Map Lesson (Outside Tabs)

### Task 29: Create map lesson screen outside tabs

**Files:**
- Create: `app/map/lesson.tsx`

- [ ] **Step 1: Create map lesson screen (outside tabs)**

```typescript
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LessonScreen from '../../src/screens/LessonScreen';

export default function MapLessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = parseInt(id || '0', 10);

  return <LessonScreen levelId={levelId} sourceTab="map" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/map/lesson.tsx"
git commit -m "feat: create map lesson screen outside tabs"
```

---

## Phase 11: Update App.tsx

### Task 30: Simplify App.tsx to expo-router entry point

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Replace App.tsx with expo-router entry point**

```typescript
import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { useAuth } from './src/hooks/useAuth';
import { ActivityIndicator, Text, View, Platform } from 'react-native';
import { Colors } from './src/theme';
import { API } from './src/lib/api';

export default function App() {
  const { user, loading, refreshUser } = useAuth();

  // Handle web platform onboarding skip
  if (!loading && user && !user.onboarding_completed && Platform.OS === 'web') {
    React.useEffect(() => {
      API.completeOnboarding({}).then(() => refreshUser()).catch(() => refreshUser());
    }, []);
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = {
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingEmoji: {
    fontSize: 64,
  },
};
```

Replace the entire contents of `App.tsx` with this simplified version.

- [ ] **Step 2: Commit**

```bash
git add App.tsx
git commit -m "refactor: simplify App.tsx to expo-router entry point"
```

---

## Phase 12: Update LessonScreen

### Task 31: Update LessonScreen to accept sourceTab prop

**Files:**
- Modify: `src/screens/LessonScreen.tsx`

- [ ] **Step 1: Add sourceTab prop to LessonScreen**

Add this prop to the component interface:

```typescript
interface LessonScreenProps {
  levelId: number;
  sourceTab?: 'map' | 'skills';
}
```

Update the component signature:

```typescript
export default function LessonScreen({ levelId, sourceTab = 'map' }: LessonScreenProps) {
  // ... existing code
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/LessonScreen.tsx
git commit -m "feat: add sourceTab prop to LessonScreen"
```

---

## Phase 13: Cleanup

### Task 32: Remove old navigation dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove old navigation dependencies**

Remove these lines from `package.json` dependencies:
- `"@react-navigation/native": "^6.1.17"`
- `"@react-navigation/stack": "^6.3.29"`
- `"@react-navigation/bottom-tabs": "^6.5.20"`

- [ ] **Step 2: Run npm install**

```bash
npm install --legacy-peer-deps
```

Expected: Old navigation packages removed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "refactor: remove old navigation dependencies"
```

---

### Task 33: Test the migration

**Files:**
- Test: Manual testing

- [ ] **Step 1: Start the dev server**

```bash
npx expo start
```

Expected: Expo dev server starts successfully

- [ ] **Step 2: Test auth flow**

1. Open the app
2. Verify auth screen loads
3. Complete login
4. Verify onboarding loads (if not completed)
5. Verify tabs load after onboarding

- [ ] **Step 3: Test tab navigation**

1. Tap each tab (Map, Skills, Portfolio, Community, Profile)
2. Verify each tab loads correctly
3. Verify tab icons display correctly

- [ ] **Step 4: Test stack navigation**

1. Navigate to Skills → Quant Map
2. Navigate to Skills → Interview Mode
3. Navigate to Portfolio → Hub
4. Navigate to Community → Leaderboard
5. Navigate to Community → Guild
6. Navigate to Community → Referral
7. Navigate to Profile → Diary
8. Navigate to Profile → GitHub
9. Verify back navigation works

- [ ] **Step 5: Test deep linking**

1. Open deep link: `sifter://map`
2. Open deep link: `sifter://skills`
3. Open deep link: `sifter://skills/lesson/1`
4. Open deep link: `sifter://map/lesson/1`
5. Verify each deep link navigates correctly

- [ ] **Step 6: Test platform differences**

1. Test on iOS simulator
2. Test on Android emulator
3. Test on web
4. Verify web skips onboarding

- [ ] **Step 7: Commit final changes**

```bash
git add .
git commit -m "test: verify expo-router migration works correctly"
```

---

## Phase 14: Polish

### Task 34: Fix any edge cases

**Files:**
- Various (as needed)

- [ ] **Step 1: Test error handling**

1. Navigate to invalid route
2. Verify 404 screen displays
3. Test error boundary triggers

- [ ] **Step 2: Test loading states**

1. Test auth loading state
2. Test onboarding loading state
3. Verify loading UI displays correctly

- [ ] **Step 3: Fix any issues found**

Address any issues found during testing.

- [ ] **Step 4: Commit fixes**

```bash
git add .
git commit -m "fix: address edge cases found during testing"
```

---

### Task 35: Update documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md navigation section**

Update the navigation section in `CLAUDE.md` to reflect expo-router usage:

```markdown
### Frontend (`App.tsx`, `src/`)
- **Expo SDK 51**, React Native 0.74, TypeScript strict mode
- Path alias: `@/*` maps to `src/*`
- Navigation: **expo-router** with file-based routing in `app/` directory
- 5 tabs: Map (home), Skills, Portfolio, Community, Profile
- Auth state managed via `src/hooks/useAuth` (React Context), token stored in SecureStore
- API client in `src/lib/api.ts` — all requests go through FastAPI backend, uses `EXPO_PUBLIC_API_URL` env var
- Reanimated plugin must be last in `babel.config.js` plugins array
- Learning content defined as data files: `src/data/levels.ts`, `quantLevels.ts`, `pythonLevels.ts`, `islands.ts`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for expo-router"
```

---

## Summary

This plan migrates the app from @react-navigation/native to expo-router through:

1. Installing and configuring expo-router
2. Creating the `app/` directory structure with route groups
3. Implementing auth flow with redirects
4. Creating tabs layout with 5 tabs
5. Creating stack layouts for each tab
6. Moving all screens to expo-router structure
7. Simplifying App.tsx to expo-router entry point
8. Updating LessonScreen for tab context
9. Removing old navigation dependencies
10. Testing all flows and edge cases
11. Updating documentation

The migration maintains all existing functionality while providing better deep linking, TypeScript integration, and code organization.
