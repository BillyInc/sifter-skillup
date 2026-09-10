import { Redirect, useLocalSearchParams } from "expo-router";
import { legacyAdmissionHref } from "@/lib/legacyAdmissionRedirect";

/**
 * Legacy links return to the unified admission/discovery surface. Admission
 * detail now lives inside programme Requirements and Universities; keeping this
 * redirect prevents old bookmarks from reopening a duplicate screen.
 */
export default function AdmissionRoute() {
  const params = useLocalSearchParams();
  const jambName = Array.isArray(params.jambName) ? params.jambName[0] : params.jambName;
  const value = String(jambName ?? "");
  return <Redirect href={legacyAdmissionHref("/(tabs)/explore", value, params) as never} />;
}
