import { Redirect, useLocalSearchParams } from "expo-router";
import { legacyAdmissionHref } from "@/lib/legacyAdmissionRedirect";

/** Legacy links return to the unified programme/discovery surface. The old
 * detail view is intentionally not user-facing while its data is incomplete. */
export default function AdminAdmissionRoute() {
  const params = useLocalSearchParams();
  const jambName = Array.isArray(params.jambName) ? params.jambName[0] : params.jambName;
  const value = String(jambName ?? "");
  return <Redirect href={legacyAdmissionHref("/(admin)/workspace-explore", value, params, true) as never} />;
}
