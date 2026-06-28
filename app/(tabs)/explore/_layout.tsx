import { Stack, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../../src/components/ScreenErrorBoundary";

// Explore is a nested stack: the index (search + doors), then programme/domain/
// role detail screens pushed on top. The ReferenceShell chrome wraps the whole
// (tabs) group, so these are plain headerless stack screens.
export default function ExploreStack() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary
      screenName="Explore"
      onGoHome={() => router.replace("/(tabs)/explore")}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
