import { ActivityIndicator, View } from "react-native";
import { Stack, Redirect, useRouter } from "expo-router";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { useAuth } from "../../src/hooks/useAuth";
import { isAdminAccount, useEffectiveAccountType } from "../../src/lib/accountType";
import { Colors } from "../../src/theme";

// The institutional / administrator side is its own stack, separate from the
// student (tabs) group. Educators are routed here after onboarding when their
// account_type is educator / institution_admin. Plain headerless stack — the
// admin chrome (sidebar) is owned by the AdminShell inside each screen.
export default function AdminStack() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);

  if (loading || (user && !hydrated)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (user.auth_provider !== "guest" && !user.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isAdminAccount(accountType)) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <ScreenErrorBoundary
      screenName="Admin"
      onGoHome={() => router.replace("/(admin)/dashboard")}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
