import { Stack, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../../src/components/ScreenErrorBoundary";

// My World is a nested stack: the index (personal page / live gateway), then any
// sub-routes pushed on top (e.g. the legacy game profile). The ReferenceShell
// chrome wraps the whole (tabs) group, so these are plain headerless screens.
export default function MyWorldStack() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary
      screenName="My World"
      onGoHome={() => router.replace("/(tabs)/myworld")}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
