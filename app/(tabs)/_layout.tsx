import { Tabs, useRouter } from 'expo-router';
import { ScreenErrorBoundary } from '../../src/components/ScreenErrorBoundary';
import { ReferenceShell } from '../../src/components/shell/ReferenceShell';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Tabs" onGoHome={() => router.replace('/(tabs)/home')}>
      <ReferenceShell>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="map" options={{ href: null }} />
          <Tabs.Screen name="fields" options={{ href: null }} />
          <Tabs.Screen name="guild" options={{ href: null }} />
          <Tabs.Screen name="portfolio" options={{ href: null }} />
          <Tabs.Screen name="streaks" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
          <Tabs.Screen name="feed" options={{ href: null }} />
          <Tabs.Screen name="profile" options={{ href: null }} />
          <Tabs.Screen name="skills" options={{ href: null }} />
          <Tabs.Screen name="home" options={{ href: null }} />
        </Tabs>
      </ReferenceShell>
    </ScreenErrorBoundary>
  );
}
