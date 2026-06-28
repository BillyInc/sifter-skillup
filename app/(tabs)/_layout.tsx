import { Tabs, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { ReferenceShell } from "../../src/components/shell/ReferenceShell";

// Navigation chrome (web sidebar + mobile bottom bar) is owned by ReferenceShell,
// so the expo-router Tabs bar is hidden on every platform and every screen is
// registered with `href: null`. The five LevelUp destinations (home, explore,
// opportunities, myworld, profile) plus all preserved legacy learning routes
// live behind the shell.
export default function TabsLayout() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary
      screenName="Tabs"
      onGoHome={() => router.replace("/(tabs)/home")}
    >
      <ReferenceShell>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          {/* LevelUp 5-tab IA */}
          <Tabs.Screen name="home" options={{ href: null }} />
          <Tabs.Screen name="explore" options={{ href: null }} />
          <Tabs.Screen name="opportunities" options={{ href: null }} />
          <Tabs.Screen name="myworld" options={{ href: null }} />
          <Tabs.Screen name="profile" options={{ href: null }} />

          {/* Preserved legacy learning routes (fold into My World in a later phase) */}
          <Tabs.Screen name="map" options={{ href: null }} />
          <Tabs.Screen name="fields" options={{ href: null }} />
          <Tabs.Screen name="guild" options={{ href: null }} />
          <Tabs.Screen name="portfolio" options={{ href: null }} />
          <Tabs.Screen name="streaks" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
          <Tabs.Screen name="feed" options={{ href: null }} />
          <Tabs.Screen name="skills" options={{ href: null }} />
          <Tabs.Screen name="community" options={{ href: null }} />
        </Tabs>
      </ReferenceShell>
    </ScreenErrorBoundary>
  );
}
