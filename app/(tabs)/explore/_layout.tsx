import { Stack, useGlobalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenErrorBoundary } from "../../../src/components/ScreenErrorBoundary";
import { NotesFab } from "../../../src/components/careerIntelligence";

// Explore is a nested stack: the index (search + doors), then programme/domain/
// role detail screens pushed on top. The ReferenceShell chrome wraps the whole
// (tabs) group, so these are plain headerless stack screens. A global NotesFab
// floats over the stack so a student can jot a note from any explore screen.
export default function ExploreStack() {
  const router = useRouter();
  // Explore is nested below the tabs shell. Read the global params so a focus
  // marker attached to a child route (programme/domain/subgroup/role) also
  // hides this stack's floating actions during the guidance journey.
  const params = useGlobalSearchParams<{ guided?: string | string[]; focus?: string | string[]; journey?: string | string[] }>();
  const read = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const focusedGuidance = read(params.guided) === "1" || read(params.focus) === "guidance" || read(params.journey) === "guided_subject_discovery";
  return (
    <ScreenErrorBoundary
      screenName="Explore"
      onGoHome={() => router.replace("/(tabs)/explore")}
    >
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        {!focusedGuidance ? <NotesFab /> : null}
      </View>
    </ScreenErrorBoundary>
  );
}
