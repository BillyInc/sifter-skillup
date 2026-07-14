import { Stack, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";

// The institutional / administrator side is its own stack, separate from the
// student (tabs) group. Educators are routed here after onboarding when their
// account_type is educator / institution_admin. Plain headerless stack — the
// admin chrome (sidebar) is owned by the AdminShell inside each screen.
export default function AdminStack() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary
      screenName="Admin"
      onGoHome={() => router.replace("/(admin)/dashboard")}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
