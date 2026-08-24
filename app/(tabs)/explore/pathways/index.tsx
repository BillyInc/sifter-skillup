import PathwaysHubScreen from "@/screens/careerIntelligence/PathwaysHubScreen";
import GuidedFieldSelectionScreen from "@/screens/careerIntelligence/GuidedFieldSelectionScreen";
import { useLocalSearchParams } from "expo-router";

export default function PathwaysRoute() {
  const { guided } = useLocalSearchParams<{ guided?: string }>();
  if (String(guided ?? "") === "1") return <GuidedFieldSelectionScreen />;
  return <PathwaysHubScreen />;
}
