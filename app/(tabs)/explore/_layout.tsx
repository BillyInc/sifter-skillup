import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenErrorBoundary } from "../../../src/components/ScreenErrorBoundary";
import { NotesFab } from "../../../src/components/careerIntelligence";

// Explore is a nested stack: the index (search + doors), then programme/domain/
// role detail screens pushed on top. The ReferenceShell chrome wraps the whole
// (tabs) group, so these are plain headerless stack screens. A global NotesFab
// floats over the stack so a student can jot a note from any explore screen.
export default function ExploreStack() {
  const router = useRouter();
  return (
    <ScreenErrorBoundary
      screenName="Explore"
      onGoHome={() => router.replace("/(tabs)/explore")}
    >
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <NotesFab />
      </View>
    </ScreenErrorBoundary>
  );
}
