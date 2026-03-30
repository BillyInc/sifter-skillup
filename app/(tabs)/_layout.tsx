import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';
import { ScreenErrorBoundary } from '../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Tabs" onGoHome={() => router.replace('/(tabs)/map')}>
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
          options={{
            title: 'Map',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="skills"
          options={{
            title: 'Skills',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎓" label="Skills" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ focused }) => <TabIcon emoji="💼" label="Portfolio" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🌐" label="Community" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
          }}
        />
      </Tabs>
    </ScreenErrorBoundary>
  );
}
