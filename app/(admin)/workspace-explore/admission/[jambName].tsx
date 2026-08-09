import { useLocalSearchParams } from "expo-router";
import AdmissionInsightScreen from "@/screens/careerIntelligence/AdmissionInsightScreen";

/** Mirrors app/(tabs)/explore/admission/[jambName].tsx — same disambiguation. */
export default function AdminAdmissionRoute() {
  const { jambName } = useLocalSearchParams<{ jambName: string }>();
  const value = String(jambName ?? "");
  const isProgrammeId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value);
  return isProgrammeId ? (
    <AdmissionInsightScreen programmeId={value} />
  ) : (
    <AdmissionInsightScreen jambName={decodeURIComponent(value)} />
  );
}
