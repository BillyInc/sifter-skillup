import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';
import { ScreenErrorBoundary } from '../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: focused ? Colors.accent : Colors.textMuted, fontWeight: focused ? '800' : '600' }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary screenName="Tabs" onGoHome={() => router.replace('/(tabs)/map')}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            height: Platform.OS === 'ios' ? 84 : 72,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 4,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="map"       options={{ title: 'Home',      tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home"      focused={focused} /> }} />
        <Tabs.Screen name="fields"    options={{ title: 'Fields',    tabBarIcon: ({ focused }) => <TabIcon emoji="🌐" label="Fields"    focused={focused} /> }} />
        <Tabs.Screen name="feed"      options={{ title: 'Feed',      tabBarIcon: ({ focused }) => <TabIcon emoji="📰" label="Feed"      focused={focused} /> }} />
        <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Community" focused={focused} /> }} />
        <Tabs.Screen name="profile"   options={{ title: 'Profile',   tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile"   focused={focused} /> }} />
        {/* Hidden from tab bar — existing screens */}
        <Tabs.Screen name="skills"    options={{ href: null }} />
        <Tabs.Screen name="portfolio" options={{ href: null }} />
      </Tabs>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', gap: 2 },
  emoji:   { fontSize: 22 },
  label:   { fontSize: 10, lineHeight: 13 },
});
