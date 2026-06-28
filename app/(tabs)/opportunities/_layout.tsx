import { Stack, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../../src/components/ScreenErrorBoundary";

// Opportunities is a nested stack: the hub (index) plus opportunity / organisation
// detail, scholarships, and application-window screens pushed on top.
export default function OpportunitiesStack() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary
      screenName="Opportunities"
      onGoHome={() => router.replace("/(tabs)/opportunities")}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
