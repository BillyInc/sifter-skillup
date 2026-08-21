import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Legacy links return to the unified admission/discovery surface. Admission
 * detail now lives inside programme Requirements and Universities; keeping this
 * redirect prevents old bookmarks from reopening a duplicate screen.
 */
export default function AdmissionRoute() {
  const { jambName } = useLocalSearchParams<{ jambName: string }>();
  const value = String(jambName ?? "");
  return <Redirect href={`/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(decodeURIComponent(value))}`} />;
}
