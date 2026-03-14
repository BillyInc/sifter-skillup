import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { API } from './src/lib/api';
import { queryClient } from './src/lib/queryClient';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ScreenErrorBoundary } from './src/components/ScreenErrorBoundary';

import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import IslandMapScreen from './src/screens/IslandMapScreen';
import SkillsScreen from './src/screens/SkillsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QuantMapScreen from './src/screens/QuantMapScreen';
import GitHubScreen from './src/screens/GitHubScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import LessonScreen from './src/screens/LessonScreen';
import InterviewModeScreen from './src/screens/InterviewModeScreen';
import PortfolioHubScreen from './src/screens/PortfolioHubScreen';
import { OfflineBanner } from './src/components/OfflineBanner';
import { Colors } from './src/theme';

// ── Navigation types ─────────────────────────────────────────

export type MapStackParamList = {
  IslandMap: undefined;
  Lesson: { levelId: number };
};

export type SkillsStackParamList = {
  SkillsHome: undefined;
  QuantMap: { trackId?: string };
  QuantLesson: { levelId: number };
  InterviewMode: { trackId: string; level: string };
};

export type PortfolioStackParamList = {
  PortfolioHome: undefined;
  PortfolioHub: { trackId?: string };
};

const Tab = createBottomTabNavigator();
const MapStack = createStackNavigator<MapStackParamList>();
const SkillsStack = createStackNavigator<SkillsStackParamList>();
const PortfolioStack = createStackNavigator<PortfolioStackParamList>();

// ── Tab icon ─────────────────────────────────────────────────

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

// ── Stack navigators ─────────────────────────────────────────

function MapStackScreen() {
  return (
    <ScreenErrorBoundary screenName="Map">
      <MapStack.Navigator screenOptions={{ headerShown: false }}>
        <MapStack.Screen name="IslandMap" component={IslandMapScreen} />
        <MapStack.Screen name="Lesson" component={LessonScreen} />
      </MapStack.Navigator>
    </ScreenErrorBoundary>
  );
}

function SkillsStackScreen() {
  return (
    <ScreenErrorBoundary screenName="Skills">
      <SkillsStack.Navigator screenOptions={{ headerShown: false }}>
        <SkillsStack.Screen name="SkillsHome" component={SkillsScreen} />
        <SkillsStack.Screen name="QuantMap" component={QuantMapScreen} />
        <SkillsStack.Screen name="QuantLesson" component={LessonScreen} />
        <SkillsStack.Screen name="InterviewMode" component={InterviewModeScreen} />
      </SkillsStack.Navigator>
    </ScreenErrorBoundary>
  );
}

function PortfolioStackScreen() {
  return (
    <ScreenErrorBoundary screenName="Portfolio">
      <PortfolioStack.Navigator screenOptions={{ headerShown: false }}>
        <PortfolioStack.Screen name="PortfolioHome" component={PortfolioScreen} />
        <PortfolioStack.Screen name="PortfolioHub" component={PortfolioHubScreen} />
      </PortfolioStack.Navigator>
    </ScreenErrorBoundary>
  );
}

// ── Main navigator ───────────────────────────────────────────

function AppNavigator() {
  const { user, loading, refreshUser } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  // Show onboarding for new users who haven't completed it
  if (!user.onboarding_completed) {
    return (
      <OnboardingScreen
        onComplete={async (trackId) => {
          await API.completeOnboarding({ active_track: trackId });
          refreshUser();
        }}
        onBrowse={() => {
          // Skip onboarding — mark as complete with default track
          API.completeOnboarding({}).then(() => refreshUser());
        }}
      />
    );
  }

  return (
    <Tab.Navigator
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
      <Tab.Screen
        name="Map"
        component={MapStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Skills"
        component={SkillsStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎓" label="Skills" focused={focused} /> }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioStackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💼" label="Portfolio" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
      <Tab.Screen
        name="GitHub"
        component={GitHubScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🐙" label="GitHub" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NavigationContainer>
                <OfflineBanner />
                <AppNavigator />
              </NavigationContainer>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading:      { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingEmoji: { fontSize: 64 },
});
